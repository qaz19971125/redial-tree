<template>
  <transition name="fade-in-linear">
    <div
      v-show="showTooltip || fixedTooltip"
      class="tooltip"
      :style="{
        left: `${currentPosition.x}px`,
        top: `${currentPosition.y}px`,
        cursor: fixedTooltip ? 'move' : 'default',
      }"
      @mouseenter="showTooltip = true"
      @mouseleave="showTooltip = false"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
    >
      <div class="tooltip__header">
        <i
          class="el-icon-star-on"
          style="cursor: pointer"
          @click.stop="fixTooltip"
        ></i>
      </div>
      <ul class="tooltip__list">
        <li>{{ data.name }}</li>
      </ul>
    </div>
  </transition>
</template>

<script>
// 通过数组管理 tooltip 组件实例
// 通过触发destroy来移除 tooltip
// 使用Vue.extend生成构造器，手动调用$mount，然后手动appendChild
export default {
  name: 'ToolTip',
  data() {
    return {
      showTooltip: false,
      fixedTooltip: false,
      data: {},
      currentPosition: {
        x: 0,
        y: 0,
      },
      lastPosition: {
        x: 0,
        y: 0,
      },
      mouseDownPosition: {
        x: 0,
        y: 0,
      },
    }
  },
  watch: {
    fixedTooltip(val) {
      if (!val) {
        this.clearUp()
      }
    },
  },
  beforeDestroy() {
    this.clearUp()
  },
  methods: {
    fixTooltip() {
      this.fixedTooltip = !this.fixedTooltip
    },
    clearUp() {
      document.removeEventListener('mousemove', this.handleDrag)
    },
    handleDrag(e) {
      const moveX = e.clientX - this.mouseDownPosition.x
      const moveY = e.clientY - this.mouseDownPosition.y
      this.currentPosition.x = this.lastPosition.x + moveX
      this.currentPosition.y = this.lastPosition.y + moveY
    },
    handleMouseDown(e) {
      if (this.fixedTooltip) {
        this.lastPosition = { ...this.currentPosition }
        this.mouseDownPosition = {
          x: e.clientX,
          y: e.clientY,
        }
        document.addEventListener('mousemove', this.handleDrag)
      }
    },
    handleMouseUp() {
      this.clearUp()
    },
  },
}
</script>
<style lang="scss" scoped>
.tooltip {
  position: absolute;
  font-size: 12px;
  color: #545454;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.tooltip__header {
  padding: 4px;
}
.tooltip__list {
  margin: 0;
  list-style: none;
  padding: 8px;
}
</style>
