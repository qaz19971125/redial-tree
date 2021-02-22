# vue模板

## 路由和侧边栏
本项目侧边栏和路由是耦合在一起的。只要在`src/router/index.js`下面配置对应的路由，侧边栏就会动态的生成。为了实现这个功能，你在编写路由路由的时候需要遵循一些约定的规则。
### 配置项
``` JavaScript
// 当设置 true 的时该路由不会在侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
hidden: true, // 不指定则默认为false

// 当一个路由下面的 children 声明的路由大于1个时，自动会变成菜单嵌套模式
// 当一个路由下面的 children 声明的路由只有1个时，会将那个子路由当做根路由显示在侧边栏
// 若不管路由下面的 children 声明的个数，只想在侧边栏显示根路由
// 可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
alwaysShow: true, // 不指定则默认为false

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