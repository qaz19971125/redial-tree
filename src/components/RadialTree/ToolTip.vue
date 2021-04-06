<template>
  <ul
    v-show="value"
    class="tooltip"
    :style="{
      left: `${position.x}px`,
      top: `${position.y}px`,
    }"
  >
    <slot :data="data"></slot>
  </ul>
</template>

<script>
// 鼠标移动位置信息在d3提供的事件对象里
// 节点数据信息在节点绑定的数据上
export default {
  name: 'ToolTip',
  components: {},
  mixins: [],
  props: {
    value: Boolean,
    /**
     * 位置信息
     */
    position: {
      type: Object,
      default() {
        return {
          x: 0,
          y: 0,
        }
      },
    },
    /**
     * 展示的数据信息
     */
    data: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {}
  },
  computed: {},
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
<style lang="scss" scoped>
.tooltip {
  position: absolute;
  border: 1px solid #e2e2e2;
  border-radius: 4px;
  font-size: 12px;
  color: #545454;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px 8px;
  box-shadow: rgb(174, 174, 174) 0px 0px 10px;
}
</style>
