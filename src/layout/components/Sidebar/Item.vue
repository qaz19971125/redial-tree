<script>
export default {
  name: 'MenuItem',
  functional: true,
  props: {
    icon: {
      type: String,
      default: 'el-icon-document',
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
