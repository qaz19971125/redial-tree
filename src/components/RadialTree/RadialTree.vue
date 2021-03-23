<template>
  <svg :id="`radial-tree-${id}`" class="radial-tree-container">
    <!-- 这里定义八大主题节点样式 -->
    <defs></defs>
    <g class="radial-tree-content">
      <g class="radial-tree-node"></g>
      <g class="radial-tree-link"></g>
    </g>
  </svg>
</template>

<script>
import * as d3 from 'd3'
import zoomMixins from './mixins/zoomMixins'
export default {
  name: 'RadialTree',
  components: {},
  mixins: [zoomMixins],
  props: {
    id: {
      type: Number,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      // d3.tree()生成的树布局构造器，一个function
      treeLayoutCalculator: null,
      // 树图根节点
      // 1. 先经过d3.hierarchy()处理
      // 2. 再经过treeLayoutCalculator()处理
      treeRoot: null,
      nodeRadius: 10,
      duration: 500,
    }
  },
  computed: {
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
      this.treeLayoutCalculator = d3
        .cluster()
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
    initData(initialDepth = 2) {
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
     * @param source - 源节点，表示从哪个节点开始绘图
     */
    draw(source, firstDraw = false) {
      const that = this
      const { treeContainer } = this
      const nodes = this.treeRoot.descendants()
      const links = this.treeRoot.links()
      // 计算树布局
      this.calculateLayout()
      if (firstDraw) {
        source.lastX = source.x
        source.lastY = source.y
      }
      // 更新节点
      // TODO: 不同类型的节点颜色不同
      const node = treeContainer
        .select('.radial-tree-node')
        .selectAll('g.node')
        .data(nodes, (d) => d.id)

      const nodeEnter = node
        .enter()
        .append('g')
        .attr('class', 'node')
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

      node.exit().remove()

      node
        .merge(nodeEnter)
        .transition()
        .duration(this.duration)
        .attr(
          'transform',
          (d) => `
        rotate(${(d.x * 180) / Math.PI - 90})
        translate(${d.y},0)
      `
        )
      // 更新线
      // TODO: 不同类型的线颜色不同
      const link = treeContainer
        .select('.radial-tree-link')
        .selectAll('path')
        .data(links, (d) => d.target.id)

      const linkEnter = link
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', (d) => {
          const o = { x: source.lastX, y: source.lastY }
          return this.diagonal({ source: o, target: o })
        })

      link.exit().remove()

      link
        .merge(linkEnter)
        .transition()
        .duration(this.duration)
        .attr('d', this.diagonal)

      // 缓存各节点旧的位置
      this.treeRoot.each((d) => {
        d.lastX = d.x
        d.lastY = d.y
      })
    },
    /**
     * 居中画布
     */
    centerChart() {
      const {
        treeContainer,
        treeContainerWidth,
        treeContainerHeight,
        zoomListener,
        zoomScaleNow,
      } = this
      const x = treeContainerWidth / 2
      const y = treeContainerHeight / 2
      treeContainer
        .transition()
        .duration(2500)
        .call(
          zoomListener.transform,
          d3.zoomIdentity.translate(x, y).scale(zoomScaleNow)
        )
    },
    diagonal(node) {
      return d3
        .linkRadial()
        .angle((d) => d.x)
        .radius((d) => d.y)(node)
    },
    bindNodeEvent(nodeSelection, ...args) {
      const that = this
      nodeSelection
        .on('click', this.handleNodeClick.bind(this))
        .on('mouseenter', function() {
          const circle = d3.select(this).select('circle')
          circle
            .transition()
            .duration(250)
            .attr('r', function(d) {
              const r =
                d.depth === 0
                  ? that.nodeRadius * 5
                  : d._children
                    ? that.nodeRadius * 3
                    : that.nodeRadius
              return r + 10
            })
        })
        .on('mouseleave', function() {
          const circle = d3.select(this).select('circle')
          circle
            .transition()
            .duration(250)
            .attr('r', function(d) {
              const r =
                d.depth === 0
                  ? that.nodeRadius * 5
                  : d._children
                    ? that.nodeRadius * 3
                    : that.nodeRadius
              return r
            })
        })
    },
    handleNodeClick(e, d) {
      // TODO: 给点击的节点一个点击效果
      d.children = d.children ? null : d._children
      this.limitMaximumVisibleNodes(50, d)
      this.draw(d)
    },
    /**
     * 限制显示的节点数量
     */
    limitMaximumVisibleNodes(max, node) {
      const descendants = this.treeRoot.descendants()
      const currentNodeCount =
        descendants.length + (node.data.children || []).length
      if (currentNodeCount >= max) {
        const ancestors = node.ancestors()
        this.treeRoot.eachAfter((ch) => {
          if (ch.children && !ancestors.includes(ch)) {
            ch.children = null
          }
        })
      }
    },
  },
}
</script>
<style lang="scss">
.radial-tree-container {
  position: relative;
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
</style>
