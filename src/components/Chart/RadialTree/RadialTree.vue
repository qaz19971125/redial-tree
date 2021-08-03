<template>
  <div
    ref="container"
    class="radial-tree"
    style="width: 100%; height: 100%; position: relative; user-select: none"
  >
    <tool-bar
      ref="toolBar"
      @update-chart="draw"
      @center-chart="centerChart"
    ></tool-bar>
    <svg :id="id" class="chart-container">
      <defs></defs>
      <g class="chart-content">
        <g class="chart-node"></g>
        <g class="chart-link"></g>
      </g>
    </svg>
  </div>
</template>

<script>
import Vue from 'vue'
import * as d3 from 'd3'
import zoomMixins from '../mixins/zoomMixins'

import ToolBar from './ToolBar.vue'
import ToolTip from '../ToolTip.vue'

const TooltipCtor = Vue.extend(ToolTip)
const tooltipMap = new Map()
let id = 0

export default {
  name: 'RadialTree',
  components: { ToolBar },
  mixins: [zoomMixins],
  props: {
    data: {
      type: Object,
      required: true,
    },
    cluster: Boolean,
    enableTooltip: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      toolTipVisiblity: false,
      toolTipPosition: { x: 0, y: 0 },
      toolTipData: {},
      // 树布局计算器
      treeLayoutCalculator: null,
      // 树图根节点
      // 1. 先经过d3.hierarchy()处理
      // 2. 再经过treeLayoutCalculator()处理
      treeRoot: null,
      nodeRadius: 10,
      durationBase: 500,
    }
  },
  computed: {
    id() {
      return `radial-tree-${id++}`
    },
    treeRadius() {
      return this.chartContainerWidth
    },
  },
  watch: {
    data() {
      this.initData()
      this.draw(this.treeRoot, true /* firstDraw */)
      this.centerChart()
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.getChartContainerSize()

      this.chartContainer = d3.select(`#${this.id}`)
      this.chartContent = this.chartContainer.select('g.chart-content')

      this.treeLayoutCalculator = this.cluster ? d3.cluster() : d3.tree()
      this.treeLayoutCalculator
        .size([2 * Math.PI, this.treeRadius - 100])
        // 该布局计算得到极坐标。x表示弧度制角度，y表示到圆心的距离。
        // 用x控制rotate，用y控制translate
        .separation((a, b) => (a.parent === b.parent ? 1 : 3) / a.depth)

      this.initZoomHandler()

      this.initData()
      this.draw(this.treeRoot, true /* firstDraw */)
      this.centerChart()
    })
  },
  methods: {
    getChartContainerSize() {
      const chartContainer = document.querySelector(`#${this.id}`)
      const { width, height } = chartContainer.getBoundingClientRect()
      this.chartContainerWidth = width
      this.chartContainerHeight = height
    },
    initData(initialDepth = 1) {
      this.treeRoot = d3
        .hierarchy(this.data)
        .sort((a, b) => d3.ascending(a.data.name, b.data.name))
      this.treeRoot.descendants().forEach((d, i) => {
        d.id = i
        d._children = d.children
        if (d.depth >= initialDepth) {
          d.children = null
        }
      })
    },
    calculateLayout() {
      if (typeof this.treeLayoutCalculator !== 'function') {
        console.warn(`[RadialTree]: treeLayoutCalculator必须为一个函数`)
        return
      }
      this.treeLayoutCalculator(this.treeRoot) // 经过计算后，每一节点对象都拥有了x和y这两个属性
    },
    /**
     * @param source - 表示从哪个节点开始绘图
     * @param firstDraw - 是否第一次绘制
     */
    draw(source, firstDraw = false) {
      this.calculateLayout()

      if (firstDraw) {
        // 从根节点第一次渲染，先缓存初始位置
        source.lastX = source.x
        source.lastY = source.y
      }

      this.drawNodes(source)
      this.drawLinks()

      // 缓存各节点旧的位置
      this.treeRoot.each((d) => {
        d.lastX = d.x
        d.lastY = d.y
      })
    },

    drawNodes(source) {
      const { chartContent } = this
      const nodes = this.treeRoot.descendants()
      const node = chartContent
        .select('g.chart-node')
        .selectAll('g.node')
        .data(nodes, (d) => d.id)

      const nodeEnter = node.enter().append('g').classed('node', true)
      const nodeExit = node.exit()
      const nodeUpdate = node.merge(nodeEnter)

      nodeEnter
        .attr('cursor', (d) => (d._children ? 'pointer' : 'not-allowed'))
        .attr(
          'transform',
          (d) =>
            `rotate(${calcDeg(source.lastX)}) translate(${
              source.lastY
            },0)`
        )
        .call(this.bindNodeEvent) // 为节点绑定事件

      nodeEnter
        .append('circle')
        .attr('fill', (d) => (d._children ? '#555' : '#999'))
        .attr('r', (d) => {
          if (d.depth === 0) {
            // 根节点
            return this.nodeRadius * 5
          } else if (d._children) {
            // 有后代的节点
            return this.nodeRadius * 3
          } else {
            // 叶子节点
            return this.nodeRadius
          }
        })

      nodeEnter.append('text').text((d) => d.data.name)

      nodeExit.remove()

      nodeUpdate
        .transition()
        .duration(this.durationBase)
        .attr(
          'transform',
          (d) => `
        rotate(${calcDeg(d.x)})
        translate(${d.y},0)
      `
        )
      // 字体回正
      nodeUpdate
        .selectAll('text')
        .attr('transform', (d) => `rotate(${-calcDeg(d.x)})`)

      function calcDeg(radian) {
        // 先弧度转角度，再顺时针旋转90度
        return (radian * 180) / Math.PI - 90
      }
    },
    /**
     * 为节点绑定事件
     */
    bindNodeEvent(nodeSelection, ...args) {
      const {
        durationBase,
        nodeRadius,
        chartContent,
        enableTooltip,
        $refs,

        limitMaximumVisibleNodes,
        pushHistory,
        draw,
      } = this
      nodeSelection
        .on('click', function(e, d) {
          d.children = d.children ? null : d._children
          const prunedNodes = limitMaximumVisibleNodes(40, d)
          pushHistory({
            node: d,
            prunedNodes,
          })
          draw(d) // 某些节点的childre变化了，重新计算布局并重绘
        })
        .on('mouseenter', function(e, d) {
          // hover放大动效
          const circle = d3.select(this).select('circle')
          circle
            .transition()
            .duration(durationBase)
            .attr('r', function(d) {
              const r =
                d.depth === 0
                  ? nodeRadius * 5
                  : d._children
                    ? nodeRadius * 3
                    : nodeRadius
              return r + 10
            })
          // 相关节点和边高亮动效
          const ancestors = d.ancestors()
          const descendants = d.descendants()
          const highlight =
            d.depth === 0 ? [...ancestors] : [...ancestors, ...descendants]
          chartContent
            .select('g.chart-link')
            .selectAll('path.link')
            .filter((d) => highlight.includes(d.target))
            .classed('highlight', true)
          chartContent
            .select('g.chart-node')
            .selectAll('g.node')
            .filter((d) => highlight.includes(d))
            .classed('highlight', true)
        })
        .on('mouseleave', function(e, d) {
          // hover缩小动效
          const circle = d3.select(this).select('circle')
          circle
            .transition()
            .duration(durationBase)
            .attr('r', function(d) {
              const r =
                d.depth === 0
                  ? nodeRadius * 5
                  : d._children
                    ? nodeRadius * 3
                    : nodeRadius
              return r
            })
          // 相关节点和边取消高亮动效
          const ancestors = d.ancestors()
          const descendants = d.descendants()
          const highlight =
            d.depth === 0 ? [...ancestors] : [...ancestors, ...descendants]
          chartContent
            .selectAll('path.link')
            .filter((d) => highlight.includes(d.target))
            .classed('highlight', false)
          chartContent
            .selectAll('g.node')
            .filter((d) => highlight.includes(d))
            .classed('highlight', false)
        })
      if (enableTooltip) {
        nodeSelection
          .on('mouseenter.tooltip', function(e, d) {
            let tooltipInstance = tooltipMap.get(d)
            if (tooltipInstance) {
              tooltipInstance.showTooltip = true
              tooltipInstance.currentPosition = {
                x: e.offsetX + 10,
                y: e.offsetY + 10,
              }
            } else {
              tooltipInstance = new TooltipCtor()
              tooltipInstance.showTooltip = true
              tooltipInstance.currentPosition = {
                x: e.offsetX + 10,
                y: e.offsetY + 10,
              }
              tooltipInstance.data = {
                ...d.data
              }
              tooltipMap.set(d, tooltipInstance)
              const tooltipVm = tooltipInstance.$mount()
              $refs.container.appendChild(tooltipVm.$el)
            }
          })
          .on('mouseleave.tooltip', function(e, d) {
            const tooltipInstance = tooltipMap.get(d)
            if (tooltipInstance) {
              tooltipInstance.showTooltip = false
            }
          })
      }
    },
    /**
     * 限制显示的节点数量
     * @returns {Array} prunedNodes - 进行了剪枝操作的节点组成的数组
     */
    limitMaximumVisibleNodes(max, node) {
      const prunedNodes = []
      const descendants = this.treeRoot.descendants()
      const currentNodeCount = descendants.length + (node.children || []).length // 将要渲染在图上的节点数量
      if (currentNodeCount > max) {
        const ancestors = node.ancestors()
        this.treeRoot.eachBefore((currentNode) => {
          // 从根节点开始做先序遍历，做剪枝操作
          // 被剪枝的节点是node的同级节点
          if (currentNode.children && !ancestors.includes(currentNode)) {
            currentNode.children = null
            prunedNodes.push(currentNode)
          }
        })
      }

      return prunedNodes
    },
    pushHistory(data) {
      this.$refs.toolBar.$emit('pushStack', data)
    },
    drawLinks() {
      const { chartContent } = this
      const links = this.treeRoot.links()
      const link = chartContent
        .select('.chart-link')
        .selectAll('path')
        .data(links, (d) => d.target.id)

      const linkEnter = link.enter().append('path').classed('link', true)
      const linkExit = link.exit()
      const linkUpdate = link.merge(linkEnter)

      linkEnter.attr('d', (d) => {
        return this.calculateLink({ source: d.source, target: d.source })
      })

      linkExit.remove()

      linkUpdate
        .transition()
        .duration(this.durationBase)
        .attr('d', this.calculateLink)
    },
    calculateLink(link) {
      return d3
        .linkRadial()
        .angle((d) => d.x)
        .radius((d) => d.y)(link)
    },

    centerChart() {
      const {
        chartContainer,
        chartContainerWidth,
        chartContainerHeight,
        zoomListener,
      } = this
      const x = chartContainerWidth / 2
      const y = chartContainerHeight / 2
      chartContainer
        .transition()
        .duration(this.durationBase * 5)
        .call(
          zoomListener.transform,
          d3.zoomIdentity.translate(x, y).scale(0.2)
        )
    },
  },
}
</script>
<style lang="scss">
.chart-container {
  width: 100%;
  height: 100%;
}
.chart-link {
  stroke: #555;
  stroke-width: 1.5;
  stroke-opacity: 0.4;
  fill: none;
  pointer-events: none;
}
.node {
  &.highlight {
    circle {
      fill: #1493C8
    }
  }
}
.link {
  &.highlight {
    stroke:#1493C8;
    stroke-width: 5;
  }
}
</style>
