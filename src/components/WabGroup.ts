import { computed, defineComponent, h, inject, PropType, Ref, watch } from 'vue'
import type { GroupSchema, GroupSchemaParsed } from '@/@types/FormBuilder'

export default defineComponent({
  name: 'WabGroup',
  props: {
    group: {
      type: Object as PropType<GroupSchemaParsed>,
      required: true
    }
  },
  emits: ['update:visibility'],
  setup (props, { slots, emit }) {
    const formValues = inject('formValues') as Ref<Record<string, any>>
    const formErrors = inject('formErrors') as Ref<Record<string, any>>
    const hiddenFields = inject('hiddenFields') as Ref<string[]>
    const mustAvoid = computed(() => props.group?.avoid)
    const mustShow = computed(() => props.group.if?.(formValues.value, formErrors.value, hiddenFields.value) ?? true)
    
    const childs = computed(() => {
      const toReturn = [slots.default?.()]
      
      if (props.group?.legend) {
        toReturn.unshift(h('legend', props.group.legend) as any)
      }
      
      return toReturn
    })
    
    watch(mustShow, (value) => {
      emit('update:visibility', value, props.group.name)
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
