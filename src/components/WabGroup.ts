import { computed, defineComponent, h, inject, PropType, Ref } from 'vue'
import type { GroupSchema, GroupSchemaParsed } from '@/@types/FormBuilder'

export default defineComponent({
  name: 'WabGroup',
  props: {
    group: {
      type: Object as PropType<GroupSchemaParsed>,
      required: true
    }
  },
  setup (props, { slots }) {
    const formValues = inject('formValues') as Ref<Record<string, any>>
    const formErrors = inject('formErrors') as Ref<Record<string, any>>
    const mustAvoid = computed(() => props.group?.avoid)
    const mustShow = computed(() => props.group.if?.(formValues.value, formErrors.value) ?? true)
    
    const childs = computed(() => {
      const toReturn = [slots.default?.()]
      
      if (props.group?.legend) {
        toReturn.unshift(h('legend', props.group.legend) as any)
      }
      
      return toReturn
    })
    
    return () => {
      if (!mustShow.value) {
        return null
      }
      
      if (mustAvoid.value) {
        return slots.default?.()
      }
      
      return h(props.group?.as || 'div', props.group?.props, childs.value)
    }
  }
})
