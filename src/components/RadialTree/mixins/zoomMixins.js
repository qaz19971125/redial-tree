import * as d3 from 'd3'

export default {
  data() {
    return {
      zoomListener: null,
      zoomScaleNow: 1,
    }
  },
  methods: {
    initZoomHandler() {
      const { treeContent, treeContainer } = this
      this.zoomListener = d3
        .zoom()
        .scaleExtent([0.2, 3]) // 最小比例，最大比例
        .on('zoom', (e) => {
          this.zoomScaleNow = e.transform.k
          // 应用变化
          treeContent.attr('transform', e.transform)
        })
      treeContainer.call(this.zoomListener).on('dblclick.zoom', null) // 阻止双击放大
    },
  },
}
