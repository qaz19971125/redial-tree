import * as d3 from 'd3'

export default {
  data() {
    return {
      dragHandler: null,
    }
  },
  methods: {
    initDragHandler() {
      const { forceSimulation } = this
      function dragstarted(event) {
        if (!event.active) forceSimulation.alphaTarget(0.3).restart()
        event.subject.fx = event.subject.x
        event.subject.fy = event.subject.y
      }

      function dragged(event) {
        event.subject.fx = event.x
        event.subject.fy = event.y
      }

      function dragended(event) {
        if (!event.active) forceSimulation.alphaTarget(0)
        event.subject.fx = null
        event.subject.fy = null
      }

      this.dragHandler = d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    },
  },
}
