import { computed, defineComponent, h, PropType } from 'vue'
import type { GroupSchema, GroupSchemaParsed } from '@/@types/FormBuilder'

export default defineComponent({
  name: 'WabGroup',
  props: {
    group: {
      type: Object as PropType<GroupSchemaParsed>
    }
  },
  setup (props, { slots }) {
    const mustAvoid = computed(() => props.group?.avoid)
    
    const childs = computed(() => {
      const toReturn = [slots.default?.()]
      
      if (props.group?.legend) {
        toReturn.unshift(h('legend', props.group.legend) as any)
      }
      
      return toReturn
    })
    
    return () => {
      if (mustAvoid.value) {
        return slots.default?.()
      }
      
      return h(props.group?.as || 'div', props.group?.props, childs.value)
    }
  }
})
