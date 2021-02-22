const getters = {
  sidebar: (state) => state.app.sidebar,
  visitedViews: (state) => state.tagsView.visitedViews,
  cachedViews: (state) => state.tagsView.cachedViews,
  token: (state) => state.user.token,
  name: (state) => state.user.name,
}
export default getters
