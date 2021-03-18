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
    }
  },
  computed: {},
  watch: {},
  mounted() {
    this.$nextTick(() => {
      this.getTreeContainerSize()

      this.treeContainer = d3.select(`#radial-tree-${this.id}`)
      this.treeContent = this.treeContainer.select('g.radial-tree-content')
      this.treeLayoutCalculator = d3
        .tree()
        .size([360, this.treeContainerWidth / 2])
        .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth)

      this.initData()
      this.initZoomHandler()

      this.draw(this.treeRoot)
      this.centerNode(this.treeRoot)
    })
  },
  methods: {
    getTreeContainerSize() {
      const treeContainer = document.querySelector(`#radial-tree-${this.id}`)
      const { width, height } = treeContainer.getBoundingClientRect()
      this.treeContainerWidth = width
      this.treeContainerHeight = height
    },
    initData() {
      this.treeRoot = d3
        .hierarchy(this.data)
        .sort((a, b) => d3.ascending(a.data.name, b.data.name))
      this.treeRoot.descendants().forEach((d, i) => {
        d.id = i
        d._children = d.children
        if (d.depth > 2) {
          d.children = null
        }
      })
      // 初始化阶段，给树根节点一个初始位置
      // TODO: 初始位置为画布中心，如何计算？
      this.treeRoot.lastX = this.treeContainerHeight / 2
      this.treeRoot.lastY = 0
    },
    calculateLayout() {
      if (typeof this.treeLayoutCalculator !== 'function') {
        console.warn(`[RadialTree]: treeLayoutCalculator必须为一个函数`)
        throw new Error('[RadialTree]: treeLayoutCalculator必须为一个函数')
      }
      this.treeLayoutCalculator(this.treeRoot)
    },

    /**
     * @param source - 源节点，表示从哪个节点开始绘图
     */
    draw(source) {
      const { treeContainer } = this
      const t = treeContainer.transition().duration(300)
      const nodes = this.treeRoot.descendants().reverse()
      const links = this.treeRoot.links()
      // 计算树布局
      this.calculateLayout()
      // 更新节点
      const node = treeContainer
        .select('.radial-tree-node')
        .selectAll('circle')
        .data(nodes, (d) => d.id)

      const nodeEnter = node
        .enter()
        .append('circle')
        .attr('transform', (d) => `translate(${source.lastY},${source.lastX})`)
        .attr('fill', (d) => (d._children ? '#555' : '#999'))
        .attr('r', 8)
        .on('click', (e, d) => {
          d.children = d.children ? null : d._children
          this.draw(d)
          this.centerNode(d)
        })

      node
        .merge(nodeEnter)
        .transition(t)
        .attr(
          'transform',
          (d) => `
        rotate(${(d.x * 180) / Math.PI - 90})
        translate(${d.y},0)
      `
        )

      node
        .exit()
        .transition(t)
        .attr('transform', (d) => `translate(${source.lastY},${source.lastX})`)
      // 更新线
      const link = treeContainer
        .select('.radial-tree-link')
        .selectAll('path')
        .data(links, (d) => d.target.id)

      const linkEnter = link
        .enter()
        .append('path')
        .attr('d', (d) => {
          const o = { x: source.lastX, y: source.lastY }
          return this.diagonal({ source: o, target: o })
        })

      link.merge(linkEnter).transition(t).attr('d', this.diagonal)

      link
        .exit()
        .transition(t)
        .remove()
        .attr('d', (d) => {
          const o = { x: source.lastX, y: source.lastY }
          return this.diagonal({ source: o, target: o })
        })

      // 缓存各节点旧的位置
      this.treeRoot.each((d) => {
        d.lastX = d.x
        d.lastY = d.y
      })
    },
    /**
     * 节点居中到画布中心
     * @param source - 要居中的节点
     */
    centerNode(node) {
      const {
        treeContainer,
        treeContainerWidth,
        treeContainerHeight,
        zoomListener,
        zoomScaleNow,
      } = this
      // TODO: 点放在画图中间的坐标怎么计算？
      const x = node.lastY * zoomScaleNow + treeContainerWidth / 2
      const y = node.lastX * zoomScaleNow + treeContainerHeight / 2
      treeContainer
        .transition()
        .duration(2500)
        .call(
          zoomListener.transform,
          d3.zoomIdentity.translate(-x, -y).scale(zoomScaleNow)
        )
    },
    diagonal(node) {
      return d3
        .linkRadial()
        .angle((d) => d.x)
        .radius((d) => d.y)(node)
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
}
</style>
