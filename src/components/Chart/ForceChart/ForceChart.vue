<template>
  <div
    ref="container"
    class="force-chart"
    style="width: 100%; height: 100%; position: relative; user-select: none"
  >
    <svg :id="id" class="chart-container">
      <!-- 这里定义八大主题节点样式 -->
      <defs></defs>
      <g class="chart-content">
        <g class="chart-node"></g>
        <g class="chart-link"></g>
      </g>
    </svg>
  </div>
</template>

<script>
import zoomMixins from '../mixins/zoomMixins'
let id = 0
export default {
  name: 'ForceChart',
  components: {},
  mixins: [zoomMixins],
  data() {
    return {}
  },
  computed: {
    id() {
      return `force-chart-${id++}`
    },
  },
  watch: {},
  created() {},
  mounted() {},
  beforeCreate() {},
  beforeMount() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  activated() {},
  methods: {},
}
</script>
<style lang="scss">
.chart-container {
  width: 100%;
  height: 100%;
}
</style>
