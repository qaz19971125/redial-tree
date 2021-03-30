<template>
  <ul class="toolbar">
    <li :class="{ disabled: redoStack.length === 0 }" @click="redo">
      <svg
        class="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
      >
        <path
          d="M256 682.666667c0-102.741333 66.730667-213.333333 213.333333-213.333334 107.008 0 190.762667 56.576 230.570667 125.354667L611.968 682.666667H853.333333v-241.365334l-91.562666 91.562667C704.768 448.469333 601.130667 384 469.333333 384c-196.096 0-298.666667 150.229333-298.666666 298.666667h85.333333z"
          fill=""
          p-id="2041"
        ></path>
      </svg>
    </li>
    <li :class="{ disabled: undoStack.length === 0 }" @click="undo">
      <svg
        class="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
      >
        <path
          d="M170.666667 682.666667h241.365333l-87.936-87.978667C363.904 525.909333 447.658667 469.333333 554.666667 469.333333c146.602667 0 213.333333 110.592 213.333333 213.333334h85.333333c0-148.437333-102.570667-298.666667-298.666666-298.666667-131.797333 0-235.392 64.469333-292.48 148.821333L170.666667 441.301333V682.666667z"
          fill=""
          p-id="2764"
        ></path>
      </svg>
    </li>
  </ul>
</template>

<script>
import Stack from './utils/Stack'

export default {
  name: 'ToolBar',
  components: {},
  mixins: [],
  data() {
    return {
      redoStack: new Stack(),
      undoStack: new Stack(),
    }
  },
  computed: {},
  watch: {},
  created() {
    this.$nextTick(() => {
      this.$on('pushStack', (data, stackType = 'undo') => {
        this.pushStack(data, stackType)
      })
    })
  },
  methods: {
    redo() {
      const currentTarget = this.redoStack.pop()
      if (currentTarget) {
        this.pushStack(currentTarget, 'undo')
        currentTarget.children = currentTarget.children
          ? null
          : currentTarget._children
      }
      this.$emit('update-chart', currentTarget)
    },
    undo() {
      const currentTarget = this.undoStack.pop()
      if (currentTarget) {
        this.pushStack(currentTarget, 'redo')
        currentTarget.children = currentTarget.children
          ? null
          : currentTarget._children
      }
      this.$emit('update-chart', currentTarget)
    },
    pushStack(data, stackType = 'undo') {
      if (stackType === 'undo') {
        this.undoStack.push(data)
      } else {
        this.redoStack.push(data)
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.toolbar {
  position: absolute;
  list-style-type: none;
  padding: 8px;
  left: 0px;
  top: 0px;
  background-color: rgba(255, 255, 255, 0.5);
  border: 1px solid #e2e2e2;
  border-radius: 4px;
  font-size: 12px;
  color: #545454;
  margin: 0;
  li {
    float: left;
    text-align: center;
    width: 35px;
    height: 24px;
    cursor: pointer;
    list-style-type: none;
    list-style: none;
    margin-left: 0px;
    &.disabled {
      .icon {
        opacity: 0.5 !important;
      }
      cursor: not-allowed;
    }
  }
}
</style>
