<template>
  <div
    ref="container"
    class="force-chart"
    style="width: 100%; height: 100%; position: relative; user-select: none"
  >
    <svg :id="id" class="chart-container">
      <!-- 这里定义八大主题节点样式 -->
      <defs>
        <marker
          id="arrow"
          viewBox="0,0,15,15"
          markerUnits="strokeWidth"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
          :refX="10 + nodeRadius"
          refY="5"
        >
          <path d="M0,0 L10,5 L0,10 L5,5 Z"></path>
        </marker>
      </defs>
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
import cloneDeep from 'lodash/cloneDeep'
import zoomMixins from '../mixins/zoomMixins'
import dragMixins from './mixins/dragMixins'
import activateRelationMixins from './mixins/activateRelationMixins'

import ToolTip from '../ToolTip.vue'
const TooltipCtor = Vue.extend(ToolTip)
const tooltipMap = new Map()

let id = 0

export default {
  name: 'ForceChart',
  components: {},
  mixins: [zoomMixins, dragMixins, activateRelationMixins],
  props: {
    nodes: {
      type: Array,
      default: () => [],
    },
    links: {
      type: Array,
      default: () => [],
    },
    alphaMin: {
      type: Number,
      default: 0.001,
    },
    alphaDecay: {
      type: Number,
      default: 0.0228,
    },
    alphaTarget: {
      type: Number,
      default: 0,
    },
    velocityDecay: {
      type: Number,
      default: 0.4,
    },
    enableTooltip: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      selfNodes: [],
      selfLinks: [],
      forceSimulation: null,
      nodeRadius: 10,
    }
  },
  computed: {
    id() {
      return `force-chart-${id++}`
    },
  },
  watch: {},
  mounted() {
    this.selfNodes = cloneDeep(this.nodes)
    this.selfLinks = cloneDeep(this.links)
    this.$nextTick(() => {
      this.getChartContainerSize()
      this.chartContainer = d3.select(`#${this.id}`)
      this.chartContent = this.chartContainer.select('g.chart-content')
      this.initChart()
      this.initZoomHandler()
      this.initDragHandler()
    })
  },
  beforeDestroy() {},
  methods: {
    getChartContainerSize() {
      const treeContainer = document.querySelector(`#${this.id}`)
      const { width, height } = treeContainer.getBoundingClientRect()
      this.chartContainerWidth = width
      this.chartContainerHeight = height
    },
    initChart() {
      const {
        selfNodes: nodes,
        selfLinks: links,
        chartContainerWidth,
        chartContainerHeight,
      } = this
      this.forceSimulation = d3
        .forceSimulation(nodes)
        .force(
          'link',
          d3.forceLink(links).id((d) => d.id)
        ) // TODO: 注意id字段
        .force('charge', d3.forceManyBody())
        .force(
          'center',
          d3.forceCenter(chartContainerWidth / 2, chartContainerHeight / 2)
        )
        .force('collide', d3.forceCollide(50).strength(0.2).iterations(5))
        .on('tick', this.tick)
    },
    tick() {
      this.drawNodes()
      this.drawLinks()
    },
    drawNodes() {
      const { selfNodes: nodes, chartContent, nodeRadius } = this
      const node = chartContent
        .select('.chart-node')
        .selectAll('g.node')
        .data(nodes, (d) => d.index)

      const nodeEnter = node.enter().append('g').classed('node', true)
      const nodeExit = node.exit()
      const nodeUpdate = node.merge(nodeEnter)

      nodeEnter.call(this.bindNodeEvent).call(this.dragHandler) // 绑定事件
      nodeEnter.append('circle').attr('fill', '#555').attr('r', nodeRadius)
      nodeUpdate.attr('transform', (d) => `translate(${d.x},${d.y})`)
      nodeExit.remove()
    },
    // TODO: 目前的线是连接的两圆心，导致了线穿透了圆。如何求出圆上的点坐标？这样可以解决线穿透圆的问题
    drawLinks() {
      const { selfLinks: links, chartContent } = this
      const link = chartContent
        .select('.chart-link')
        .selectAll('path')
        .data(links, (d) => d.index)

      const linkEnter = link.enter().append('path').classed('link', true)
      const linkExit = link.exit()
      const linkUpdate = link.merge(linkEnter)

      linkUpdate
        .attr('d', (d) => {
          const path = d3.path()
          path.moveTo(d.source.x, d.source.y)
          path.lineTo(d.target.x, d.target.y)
          return path.toString()
        })
        .attr('marker-end', 'url(#arrow)')
      linkExit.remove()
    },
    bindNodeEvent(selection) {
      const { selfLinks: links, enableTooltip, $refs } = this

      selection
        .on('mouseenter', (e, d) => this.setAllItemStates(d, links))
        .on('mouseleave', this.clearAllItemStates)
      if (enableTooltip) {
        selection
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
                name: d.id,
              } // TODO: 展示哪些信息？
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
  cursor: pointer;
  &.inactive {
    opacity: 0.2;
  }
}
.link {
  &.highlight {
    stroke-width: 5;
  }
  &.inactive {
    opacity: 0.2;
  }
}
</style>
