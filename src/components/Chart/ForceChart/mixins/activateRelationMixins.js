export default {
  methods: {
    /**
     * 获取相关联的点
     * @param {object} node - 节点数据对象
     * @param {array} links - 边数组
     */
    getRelatedNodes(node, links) {
      const relatedNodes = []
      links.forEach((link) => {
        if (link.source === node) {
          !relatedNodes.find((v) => v === link.target) &&
            relatedNodes.push(link.target)
        } else if (link.target === node) {
          !relatedNodes.find((v) => v === link.source) &&
            relatedNodes.push(link.source)
        }
      })
      relatedNodes.push(node)
      return relatedNodes
    },
    /**
     * 获取相关联的边
     * @param {object} node - 节点数据对象
     * @param {array} links - 边数组
     */
    getRelatedLinks(node, links) {
      const relatedLinks = []
      links.forEach((link) => {
        if (link.source === node || link.target === node) {
          relatedLinks.push(link)
        }
      })

      return relatedLinks
    },
    setAllItemStates(node, links) {
      const { chartContent } = this
      const relatedNodes = this.getRelatedNodes(node, links)
      const relatedLinks = this.getRelatedLinks(node, links)
      chartContent
        .selectAll('.link')
        .filter((d) => {
          return !relatedLinks.find((v) => d === v)
        })
        .classed('inactive', true)

      chartContent
        .selectAll('.node')
        .filter((d) => {
          return !relatedNodes.find((v) => d === v)
        })
        .classed('inactive', true)
    },
    clearAllItemStates() {
      const { chartContent } = this
      chartContent.selectAll('.link').classed('inactive', false)

      chartContent.selectAll('.node').classed('inactive', false)
    },
  },
}
