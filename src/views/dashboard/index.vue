<template>
  <div class="app-content">
    <radial-tree :id="1" :data="treeData"></radial-tree>
  </div>
</template>

<script>
import RadialTree from '@/components/RadialTree/RadialTree.vue'

export default {
  name: 'Dashboard',
  components: {
    RadialTree,
  },
  data() {
    return {
      treeData: {
        name: 'a',
        children: [
          {
            name: 'b',
            children: [
              {
                name: 'd',
              },
            ],
          },
          {
            name: 'c',
            children: [
              {
                name: 'e',
                children: [
                  {
                    name: 'e',
                  },
                ],
              },
            ],
          },
        ],
      },
    }
  },
}
</script>
