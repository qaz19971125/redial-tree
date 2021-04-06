<template>
  <div style="width: 100%; height: 100%; position: relative; user-select: none">
    <tool-bar
      ref="toolBar"
      @update-chart="draw"
      @center-chart="centerChart"
    ></tool-bar>
    <tool-tip
      v-model="toolTipVisiblity"
      :position="toolTipPosition"
      :data="toolTipData"
    >
      <template #default="{ data }">
        <li>{{ data.name || '' }}</li>
      </template>
    </tool-tip>
    <svg :id="`radial-tree-${id}`" class="radial-tree-container">
      <!-- 这里定义八大主题节点样式 -->
      <defs></defs>
      <g class="radial-tree-content">
        <g class="radial-tree-node"></g>
        <g class="radial-tree-link"></g>
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from 'd3'
import zoomMixins from './mixins/zoomMixins'

import ToolBar from './ToolBar.vue'
import ToolTip from './ToolTip.vue'

let id = 0

export default {
  name: 'RadialTree',
  components: { ToolBar, ToolTip },
  mixins: [zoomMixins],
  props: {
    data: {
      type: Object,
      required: true,
    },
    cluster: Boolean,
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
      return id++
    },
    treeRadius() {
      return this.treeContainerWidth
    },
  },
  watch: {},
  mounted() {
    this.$nextTick(() => {
      this.getTreeContainerSize()

      this.treeContainer = d3.select(`#radial-tree-${this.id}`)
      this.treeContent = this.treeContainer.select('g.radial-tree-content')
      this.treeLayoutCalculator = this.cluster ? d3.cluster() : d3.tree()
      this.treeLayoutCalculator
        .size([2 * Math.PI, this.treeRadius - 100])
        // 该布局计算得到极坐标。x表示弧度制角度，y表示到圆心的距离。因此在绘图时要转化到直角坐标系。
        // 用x控制rotate，用y控制translate
        .separation((a, b) => (a.parent === b.parent ? 1 : 3) / a.depth)

      this.initData()
      this.initZoomHandler()

      this.draw(this.treeRoot, true)
      this.centerChart()
    })
  },
  methods: {
    getTreeContainerSize() {
      const treeContainer = document.querySelector(`#radial-tree-${this.id}`)
      const { width, height } = treeContainer.getBoundingClientRect()
      this.treeContainerWidth = width
      this.treeContainerHeight = height
    },
    calculateLayout() {
      if (typeof this.treeLayoutCalculator !== 'function') {
        console.warn(`[RadialTree]: treeLayoutCalculator必须为一个函数`)
        throw new Error('[RadialTree]: treeLayoutCalculator必须为一个函数')
      }
      this.treeLayoutCalculator(this.treeRoot)
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
    /**
     * @param source - 表示从哪个节点开始绘图
     * @param firstDraw - 是否第一次绘制
     */
    draw(source, firstDraw = false) {
      this.calculateLayout()
      if (firstDraw) {
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
      const { treeContent } = this
      const nodes = this.treeRoot.descendants()
      const node = treeContent
        .select('.radial-tree-node')
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
            `rotate(${(source.lastX * 180) / Math.PI - 90}) translate(${
              source.lastY
            },0)`
        )
        .call(this.bindNodeEvent) // 为节点绑定事件

      nodeEnter
        .append('circle')
        .attr('fill', (d) => (d._children ? '#555' : '#999'))
        .attr('r', (d) => {
          if (d.depth === 0) {
            return this.nodeRadius * 5
          } else if (d._children) {
            return this.nodeRadius * 3
          } else {
            return this.nodeRadius
          }
        })

      nodeEnter.append('text').text((d) => d.id)

      nodeExit.remove()

      nodeUpdate
        .transition()
        .duration(this.durationBase)
        .attr(
          'transform',
          (d) => `
        rotate(${(d.x * 180) / Math.PI - 90})
        translate(${d.y},0)
      `
        )
      // 字体回正
      nodeUpdate
        .selectAll('text')
        .attr('transform', (d) => `rotate(${-((d.x * 180) / Math.PI - 90)})`)
    },

    drawLinks() {
      const { treeContent } = this
      const links = this.treeRoot.links()
      const link = treeContent
        .select('.radial-tree-link')
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

    centerChart() {
      const {
        treeContainer,
        treeContainerWidth,
        treeContainerHeight,
        zoomListener,
      } = this
      const x = treeContainerWidth / 2
      const y = treeContainerHeight / 2
      treeContainer
        .transition()
        .duration(this.durationBase * 5)
        .call(
          zoomListener.transform,
          d3.zoomIdentity.translate(x, y).scale(0.2)
        )
    },

    calculateLink(link) {
      return d3
        .linkRadial()
        .angle((d) => d.x)
        .radius((d) => d.y)(link)
    },

    /**
     * 为节点绑定事件
     */
    bindNodeEvent(nodeSelection, ...args) {
      const that = this
      nodeSelection
        .on('click', function(e, d) {
          d.children = d.children ? null : d._children
          const prunedNodes = that.limitMaximumVisibleNodes(40, d)
          that.pushHistory({
            node: d,
            prunedNodes,
          })
          that.draw(d)
        })
        .on('mouseenter', function(e, d) {
          // hover放大动效
          const circle = d3.select(this).select('circle')
          circle
            .transition()
            .duration(that.durationBase)
            .attr('r', function(d) {
              const r =
                d.depth === 0
                  ? that.nodeRadius * 5
                  : d._children
                    ? that.nodeRadius * 3
                    : that.nodeRadius
              return r + 10
            })
          // 相关节点和边高亮动效
          const ancestors = d.ancestors()
          const descendants = d.descendants()
          const highlight =
            d.depth === 0 ? [...ancestors] : [...ancestors, ...descendants]
          that.treeContent
            .selectAll('path.link')
            .filter((d) => highlight.includes(d.target))
            .classed('highlight', true)
            .attr('stroke', '#1493C8')
          that.treeContent
            .selectAll('g.node')
            .filter((d) => highlight.includes(d))
            .classed('highlight', true)
            .select('circle')
            .attr('fill', '#1493C8')
          // tooltip
          that.toolTipVisiblity = true
          that.toolTipData = {
            name: d.data.name,
          } // TODO: tooltip展示什么信息？可以通过props配置？
        })
        .on('mouseleave', function(e, d) {
          // hover缩小动效
          const circle = d3.select(this).select('circle')
          circle
            .transition()
            .duration(that.durationBase)
            .attr('r', function(d) {
              const r =
                d.depth === 0
                  ? that.nodeRadius * 5
                  : d._children
                    ? that.nodeRadius * 3
                    : that.nodeRadius
              return r
            })
          // 相关节点和边取消高亮动效
          const ancestors = d.ancestors()
          const descendants = d.descendants()
          const highlight =
            d.depth === 0 ? [...ancestors] : [...ancestors, ...descendants]
          that.treeContent
            .selectAll('path.link')
            .filter((d) => highlight.includes(d.target))
            .classed('highlight', false)
            .attr('stroke', '#555')
          that.treeContent
            .selectAll('g.node')
            .filter((d) => highlight.includes(d))
            .classed('highlight', false)
            .select('circle')
            .attr('fill', (d) => (d._children ? '#555' : '#999'))
          // tooltip
          that.toolTipVisiblity = false
        })
        .on('mousemove', function(e, d) {
          that.toolTipPosition.x = e.offsetX + 10
          that.toolTipPosition.y = e.offsetY + 10
        })
    },
    /**
     * 限制显示的节点数量
     * @returns {Array} prunedNodes - 进行了剪枝操作的节点组成的数组
     */
    limitMaximumVisibleNodes(max, node) {
      const prunedNodes = []
      const descendants = this.treeRoot.descendants()
      const currentNodeCount = descendants.length + (node.children || []).length
      if (currentNodeCount >= max) {
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
  },
}
</script>
<style lang="scss">
.radial-tree-container {
  width: 100%;
  height: 100%;
}
.radial-tree-link {
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
