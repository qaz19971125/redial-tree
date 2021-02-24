<template>
  <aside class="app-sidebar">
    <logo :collapse="isCollapse" />
    <el-scrollbar>
      <el-menu
        mode="vertical"
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="false"
        :collapse-transition="false"
        :background-color="vars.menuBg"
        :text-color="vars.menuText"
        :active-text-color="vars.menuActiveText"
      >
        <sidebar-item
          v-for="route in routes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </aside>
</template>

<script>
import { mapGetters } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import vars from '@/styles/var.scss'

export default {
  name: 'Sidebar',
  components: { SidebarItem, Logo },
  computed: {
    ...mapGetters(['sidebar']),
    routes() {
      return this.$router.options.routes.filter((route) => {
        const hidden = !!route.hidden
        return !hidden
      })
    },
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    vars() {
      return vars
    },
    isCollapse() {
      return !this.sidebar.opened
    },
  },
}
</script>
