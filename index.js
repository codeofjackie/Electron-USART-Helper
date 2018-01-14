// 依赖

window.$ = window.jQuery = require('./node_modules/jquery/dist/jquery.min.js');
require('./node_modules/bootstrap/dist/js/bootstrap.min.js');
require('./node_modules/bootstrap/js/tab.js');
var path = require('path');
var fs = require('fs');
var SerialPort = require('serialport')

//初始化串口列表
SerialPort.list((err, ports) => {
  console.log('ports', ports);
  if (err) {
    alert(err.message);
    return;
  }
  if (ports.length === 0) {
    alert('未找到串口');
  }
  else {
    ports.forEach(port => {
      $('PortList').append('<option value="'+port[i].comName+'">'+ port[i].comName +'</option>')  
    });
  }
});

function ReadJSON(path,callback) {
  fs.open(path,'r',function (err,fd) {
    if (err!=null) {
      alert(err);
    }
    else {
      let strbuf = new Buffer(4096);
      fs.read(fd,strbuf,0,4096,0,function (err,bytesRead,buffer) {
        if (err) {
          alert();
        }
        else {
          let str = buffer.slice(0,bytesRead).toString();
          let data = JSON.parse(str);
          callback(data);
        }
      });
    }
  });
}
// 全局状态

class status {
  constructor(){
      this.BaudRate=115200;
      this.DataBits=8;
      this.StopBits=1;
      this.CheckBit='无';
      this.SendDataFormat='16进制';
      this.RecvDataFormat='字符串';
      this.connected=false;
      this.Timer=false;
      this.Interval=1000;
      this.SendMsg="";
  };

  save() {
    let settings = {
      "BaudRate":this.BaudRate,
      "DataBits":this.DataBits,
      "StopBits":this.StopBits,
      "CheckBit":this.CheckBit,
      "SendDataFormat":this.SendDataFormat,
      "RecvDataFormat":this.RecvDataFormat,
      "Timer":this.Timer,
      "Interval":this.Interval
    }

    fs.writeFile(__dirname+"\\config.json",JSON.stringify(settings),function(){});
  }

};

GlobalStatus = new status();


//设置标签页和按钮
function setCustomTabs(data) {
  for (let index = 0; index < data.panel.length; index++) {
    //获取第i个标签信息
    var tabc = data.panel[index];
    //添加标签
    $('ul.nav-tabs').append('<li role="presentation"><a href="#'+ tabc.name+'" aria-controls="'+tabc.name+'" role="tab" data-toggle="tab">'+tabc.name+'</a></li>');
    
    var tab = $('<div class="tab-pane fade" role="tabpanel" id="'+tabc.name+'"></div>')[0];
    var row = $('<div class="row form-group"></div>')[0];
    for (let buttonindex = 0; buttonindex < tabc.button.length; buttonindex++) {
      let button = tabc.button[buttonindex];//获取第i个按钮信息
      var btn = $('<div class="col-sm-4 col-lg-4 col-md-4 ">\
                      <button class="btn btn-danger form-control custom-button" disabled onclick="SendPreset(this)" value="'+button.value+'">'+button.tags+'</button>\
                    </div>')[0];
      //插入按钮
      row.append(btn);
      if (row.childElementCount==3) {
        $(tab).append(row);
        row = $('<div class="row"></div>')[0];//更新一行
        // jquery 如何获取对象的值传递拷贝？通过var方式获取的是返回对象的指针，通过var方式赋值获取是一个对原来对象的指针。
        //所以重新赋值之后，原来的内存区相当于失掉这个指针。
      }
    }
    if (row.childElementCount!=0) {
      $(tab).append(row);
    }

    $('div.tab-content').append(tab);
  }
}

//加载自定义界面配置
function loadUI() {
  ReadJSON(__dirname+'\\ui.json',function (data) {
    setCustomTabs(data);  
  });
  $('#OpenSerial').attr('disabled','disabled');
  $('#Send').attr('disabled','disabled');
  $('#Timer').attr('disabled','disabled');
}

//加载设置
function loadSettings() {
  try {
    ReadJSON(__dirname+"\\config.json",function(data) {
      GlobalStatus.BaudRate=data.BaudRate;
      GlobalStatus.DataBits=data.DataBits;
      GlobalStatus.StopBits=data.StopBits;
      GlobalStatus.CheckBit=data.CheckBit;
      GlobalStatus.SendDataFormat=data.SendDataFormat;
      GlobalStatus.RecvDataFormat=data.RecvDataFormat;
      GlobalStatus.Interval=data.Interval;

      $('#BaudRate').val(GlobalStatus.BaudRate);
      $('#DataBits').val(GlobalStatus.DataBits);
      $('#StopBits').val(GlobalStatus.StopBits);
      $('#CheckBit').val(GlobalStatus.CheckBit);
      $('#SendDataFormat').val(GlobalStatus.SendDataFormat);
      $('#RecvDataFormat').val(GlobalStatus.RecvDataFormat);
      $('#Timer')[0].checked = GlobalStatus.Timer;
      $('#Interval').val(GlobalStatus.Interval);
      $('p[name=BaudRate]')[0].innerText = GlobalStatus.BaudRate;
      $('p[name=DataBits]')[0].innerText = GlobalStatus.DataBits;
      $('p[name=StopBits]')[0].innerText = GlobalStatus.StopBits;
      $('p[name=CheckBit]')[0].innerText = GlobalStatus.CheckBit;
    });
  } catch (error) {
    alert('加载设置失败！');
  }
}

//保存设置
$('button#SaveSettings').click(function () {
    GlobalStatus.save();
});

//设置选项
$('select,input').change(function () {
    if ($(this).attr('type')=='checkbox') {
        GlobalStatus[$(this).attr('id')]=$(this)[0].checked;
    }
    else {
        tag = $(this).attr('id');
        GlobalStatus[tag]=$(this).val();
        try { 
        $('p[name='+tag+']')[0].innerText = $(this).val();
        }catch(err){}
    }
})

//按钮点击回弹效果。
$('button.btn').click(function() {
    $(this).blur();
});

//选择串口
$('#PortList').change(()=>{
    GlobalStatus.CurrentPort = new SerialPort($(this.val()),
        {
            autoOpen: false ,
            baudRate: GlobalStatus.BaudRate,
            stopBits:GlobalStatus.StopBits,
            dataBits:GlobalStatus.DataBits,
            parity:GlobalStatus.CheckBit
        },
        function (err) {
            if (err) alert(err);
            else $('#OpenSerial').removeAttr('disabled');
        }
    );
})

//打开端口
$('#OpenSerial').click(()=>{
    GlobalStatus.CurrentPort.open(function (err) {
        if (err) alert(err);
        else {
            $(this)[0].innerText = "关闭串口";
            $(this).attr('id','CloseSerial');
            $('#Send').removeAttr('disabled');
            $('.button-custom').removeAttr('disabled');
            $('#Timer').removeAttr('disabled');
            //接收消息
            GlobalStatus.CurrentPort.on('readable', function (err) {
              if(err)console.log('当前串口不可读');
              else {
                textarea = document.getElementById('textArea');
                let date = new Date();
                textarea.append($('<p class="txtStyle">'+
                date.toLocaleString()+' '+date.getMilliseconds()+'\n'+'</p>')[0]);
                textarea.append($('<p class="txtStyle txt">'+ GlobalStatus.CurrentPort.read() +'\n'+'</p>')[0]);
              }
            });
        }
    })
});

//关闭串口
$("#CloseSerial").click(()=>{
    GlobalStatus.CurrentPort.close((err)=>{
        if (err) alert(err);
        else {
          $('#Send').attr('disabled','disabled');
          $('.button-custom').attr('disabled','disabled');
        }
    })
});

//发送消息
function SendMsg(msg) {
    try {
            GlobalStatus.write(msg);
            textarea = document.getElementById('textArea');
            let date = new Date();
            textarea.append($('<p class="txtStyle">'+
            date.toLocaleString()+' '+date.getMilliseconds()+'\n'+'</p>')[0]);
            textarea.append($('<p class="txtStyle txt">'+msg+'\n'+'</p>')[0]);
        }
    catch (err){alert(err);}
}

function clearText(){
$('#textArea').empty();
}
//发送
$('button#Send').click(function () {
    var msg = $('input#SendMsg').val();
    if (msg!=""){
    //发送
    SendMsg(msg);
    }
});

//自定义按钮的发送
function SendPreset(param) {
    param.blur();
    var msg = param.value;
    if (msg!=""){
    //发送
    SendMsg(msg);
    }
}
// 不知道为什么存在一些问题。原因是jQuery只能对静态的DOM绑定事件，不能对动态生成的button绑定事件。
var timer;
$('#Timer').change(function () {
        let msg = $('input#SendMsg').val();
        if (GlobalStatus.Timer) {
            if (msg!="") {
                timer = setInterval(
                function name(params) {
                    //发送
                    SendMsg(msg); 
                },
                GlobalStatus.Interval
                );
            }
        } else{
        clearInterval(timer);
    }
});
  

// 为什么这些事件响应函数要放到最后？

/*
*
*   下面是主流程。
*
*/

loadUI();
loadSettings();
var height = $('#left-page').css('height');
$('#textArea').css('height',height);
