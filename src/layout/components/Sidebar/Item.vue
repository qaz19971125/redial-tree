<script>
export default {
  name: 'MenuItem',
  functional: true,
  props: {
    icon: {
      type: String,
      default: 'icon-menu-item',
    },
    title: {
      type: String,
      default: '新菜单项',
    },
  },
  render(h, context) {
    const { icon, title } = context.props
    const vnodes = []
    vnodes.push(<i class={[icon]} />)
    vnodes.push(<span slot='title'>{title}</span>)
    return vnodes
  },
}
</script>
