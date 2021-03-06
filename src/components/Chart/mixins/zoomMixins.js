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
      const { chartContent, chartContainer } = this
      this.zoomListener = d3
        .zoom()
        .scaleExtent([0.2, 2])
        .on('zoom', (e) => {
          this.zoomScaleNow = e.transform.k

          chartContent.attr('transform', e.transform)
        })
      chartContainer.call(this.zoomListener).on('dblclick.zoom', null) // 阻止双击放大
    },
  },
}
