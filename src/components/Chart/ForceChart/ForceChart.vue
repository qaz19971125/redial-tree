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
          markerWidth="10"
          markerHeight="10"
          :refX="nodeRadius"
          refY="5"
        >
          <path
            :d="`M${10 / 6},${10 / 6} L${(10 * 5) / 6},${10 / 2} L${10 / 6},${
              (10 * 5) / 6
            } L${10 / 2},${10 / 2} L${10 / 6},${10 / 6}`"
          ></path>
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
import * as d3 from 'd3'
import cloneDeep from 'lodash/cloneDeep'
import zoomMixins from '../mixins/zoomMixins'
import dragMixins from './mixins/dragMixins'
let id = 0

export default {
  name: 'ForceChart',
  components: {},
  mixins: [zoomMixins, dragMixins],
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

      nodeEnter.call(this.dragHandler) // 绑定事件
      nodeEnter.append('circle').attr('fill', '#555').attr('r', nodeRadius)
      nodeUpdate.attr('transform', (d) => `translate(${d.x},${d.y})`)
      nodeExit.remove()
    },
    drawLinks() {
      const { selfLinks: links, chartContent } = this
      const link = chartContent
        .select('.chart-link')
        .selectAll('path')
        .data(links, (d) => d.target.id)

      const linkEnter = link.enter().append('path').classed('link', true)
      const linkExit = link.exit()
      const linkUpdate = link.merge(linkEnter)

      linkUpdate.attr('d', (d) => {
        const path = d3.path()
        path.moveTo(d.source.x, d.source.y)
        path.lineTo(d.target.x, d.target.y)
        return path.toString()
      }).attr('marker-end', 'url(#arrow)')
      linkExit.remove()
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
}
.link {
  &.highlight {
    stroke-width: 5;
  }
}
</style>
