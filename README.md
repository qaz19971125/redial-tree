# vue模板
## 介绍
### 目录结构
```
├── public                     # 静态资源
│   │── favicon.ico            # favicon图标
│   └── index.html             # html模板
├── src                        # 源代码
│   ├── api                    # 所有http请求
│   ├── assets                 # 主题 字体等静态资源
│   ├── components             # 全局公用组件
│   ├── directives             # 全局公用指令
│   ├── icons                  # 第三方icon
│   ├── layout                 # layout组件
│   ├── mixins                 # 全局公用mixin
│   ├── router                 # 路由
│   ├── store                  # 全局vuex
│   ├── styles                 # 全局样式
│   ├── utils                  # 全局公用方法
│   ├── views                  # 所有页面
│   ├── widgets                # 全局小部件，为vue引入全局组件、全局mixin、全局指令等
│   ├── App.vue                # 入口页面
│   ├── main.js                # 入口文件 加载组件 初始化等
│   ├── setting.js             # 全局公共常量
│   └── permission.js          # 权限管理
├── .env.xxx                   # 环境变量配置
├── .eslintrc.js               # eslint 配置项
├── .prettierrc                # prettier 配置项
├── .cz-config.js              # cz-customizable 配置项
└── vue.config.js              # vue-cli 配置
```
## 项目主体
### 路由和侧边栏
本项目侧边栏和路由是耦合在一起的。只要在`src/router/index.js`下面配置对应的路由，侧边栏就会动态的生成。为了实现这个功能，你在编写路由路由的时候需要遵循一些约定的规则。
#### 配置项
``` JavaScript
// 当设置 true 的时该路由不会在侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
hidden: true, // 不指定则默认为false

// 设定路由的名字，必须填写
name: 'router-name',

meta: {
  roles: ['admin', 'editor'] // 设置该路由进入的权限，支持多个权限叠加
  title: 'title' // 设置该路由在侧边栏中展示的名字
  icon: 'iconName' // 设置该路由的图标类名，支持 el-icon-x 或者 其他第三方图标类名
  noCache: true // 如果设置为true，则不会被 <keep-alive> 缓存(不指定则默认为false)
  affix: true // 如果设置为true，它则会固定在tags-view中(不指定则默认为false)

  // 当路由设置了该属性，则会高亮相对应的侧边栏。
  // 这在某些场景非常有用，比如：一个文章的列表页路由为：/article/list
  // 点击文章进入文章详情页，这时候路由为/article/1，但你想在侧边栏高亮文章列表的路由，就可以进行如下设置
  activeMenu: '/article/list'
}
```

## 项目规范
### git提交规范
项目内置`commitzen`和`cz-customizable`两个工具辅助生成特定格式的`commit message`。因此使用`git cz`代替`git commit`进行`commit`操作。如需对`commit message`的格式进行一些自定义，请查看根目录下的`.cz-config.js`配置文件。