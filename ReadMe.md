## Release v1.1.0

- 在串口拔出或者插入之后可以通过Ctrl+R刷新可获得串口的状态。（但同时也会关闭已经打开的串口）
- 修改了打开串口和关闭串口之后下拉选框显示的一些bug


- 添加了自定义发送消息按钮

通过修改\resources\app目录下的ui.json文件实现。

panel下的元素，name代表标签页的名字，button代表该标签页中所含的按钮组。

button下的元素，tags代表该按钮的名字，value代表发送时发送的值。

## 开发说明

1. 安装git

2. 命令行执行

   ```powershell
   git clone https://github.com/codeofjackie/Electron-USART-Helper.git
   ```

   以下载工程

3. 安装nodejs

4. 命令行执行

   ```powershell
   npm install
   ```

   以安装依赖

5. 全局安装electron,命令行执行

   ```powershell
   npm install electron -g
   ```

6. 启动程序,命令行执行

   ```powershell
   electron .
   ```

   ​





