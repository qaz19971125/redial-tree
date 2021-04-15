import * as d3 from 'd3'

export default {
  data() {
    return {
      dragHandler: null,
      dragging: false,
    }
  },
  methods: {
    initDragHandler() {
      const { forceSimulation } = this

      this.dragHandler = d3
        .drag()
        .on('start', (event) => {
          if (!event.active) forceSimulation.alphaTarget(0.3).restart()
          event.subject.fx = event.subject.x
          event.subject.fy = event.subject.y
          this.dragging = true
        })
        .on('drag', (event) => {
          event.subject.fx = event.x
          event.subject.fy = event.y
        })
        .on('end', (event) => {
          if (!event.active) forceSimulation.alphaTarget(0)
          event.subject.fx = null
          event.subject.fy = null
          this.dragging = false
        })
    },
  },
}
