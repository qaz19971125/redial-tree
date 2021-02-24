<template>
  <div v-if="!item.hidden">
    <template
      v-if="
        hasOneShowingChild(item.children, item) && !onlyOneChild.children
      "
    >
      <router-link :to="resolvePath(onlyOneChild.path)">
        <el-menu-item
          :index="resolvePath(onlyOneChild.path)"
          :class="{ 'submenu-title-noDropdown': !isNest }"
        >
          <item
            :icon="onlyOneChild.meta && onlyOneChild.meta.icon"
            :title="onlyOneChild.meta && onlyOneChild.meta.title"
          />
        </el-menu-item>
      </router-link>
    </template>

    <el-submenu
      v-else
      ref="subMenu"
      :index="resolvePath(item.path)"
      popper-append-to-body
    >
      <template slot="title">
        <item
          :icon="item.meta && item.meta.icon"
          :title="item.meta && item.meta.title"
        />
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
        class="nest-menu"
      />
    </el-submenu>
  </div>
</template>

<script>
import path from 'path'
import Item from './Item'

export default {
  name: 'SidebarItem',
  components: { Item },
  props: {
    // route object
    item: {
      type: Object,
      required: true,
    },
    isNest: {
      type: Boolean,
      default: false,
    },
    basePath: {
      type: String,
      default: '',
    },
  },
  data() {
    // 防止响应式
    this.onlyOneChild = null
    return {}
  },
  methods: {
    hasOneShowingChild(children = [], parent) {
      const showingChildren = children.filter((item) => {
        const hidden = !!item.hidden
        return !hidden
      })

      if (showingChildren.length > 1) {
        return false
      } else {
        // 当只有一个非hidden子路由时，默认展示该唯一子路由
        if (showingChildren.length === 1) {
          this.onlyOneChild = showingChildren[0]
          return true
        }
        // 当没有子路由时，默认展示该父级路由
        if (showingChildren.length === 0) {
          this.onlyOneChild = { ...parent, path: '' }
          return true
        }
      }
    },
    resolvePath(routePath) {
      return path.resolve(this.basePath, routePath)
    },
  },
}
</script>
