<template>
  <div :class="classObj" class="app-container">
    <sidebar />
    <section class="app-content no-padding">
      <navbar />
      <tags-view></tags-view>
      <transition name="fade-transform" mode="out-in">
        <router-view :key="key" />
      </transition>
    </section>
  </div>
</template>

<script>
import { Navbar, Sidebar, TagsView } from './components'

export default {
  name: 'Layout',
  components: {
    Navbar,
    Sidebar,
    TagsView,
  },
  computed: {
    key() {
      return this.$route.path
    },
    sidebar() {
      return this.$store.state.app.sidebar
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
      }
    },
  },
}
</script>
