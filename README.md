# RequestMap2Retrofit
this tool is to convert RequestMap to Retrofit annoation,wirtten in node
+ 本项目是个将RequestMap转为Retrofit的小工具
+ 目前只实现了基本的功能，用node编写的，欢迎大家一起完善。
+ 已实现功能:
  1. RequestMap的path和method的转换
  2. 参数的RequestBody和PathVariable两个注解的转换
  3. 注释保留
+ TODOList:
  - [ ] 完善注解
  - [ ] 自动生成整个类，而不是只有方法
  - [ ] 自动遍历某个目录，生成对应接口类

## Usage
```shell
node ./RequestMap2Retrofit.js
```
