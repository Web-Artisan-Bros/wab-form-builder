import type { PropType } from 'vue'
import type { ElementProps, FormSchema, GroupSchema } from '@/@types/FormBuilder'
import { computed, inject, mergeProps, defineComponent, h, ref, useSlots } from 'vue'

export default defineComponent({
  name: 'WabWrapper',
  props: {
    data: Object as PropType<ElementProps>
  },
  setup (props, { slots }) {
    const schema = inject('schema') as FormSchema
    const slot = computed(() => slots.default?.() ?? [])
    const Comp = props.data?.as ?? 'div' as any
    
    return () => schema.noGroup ? slot.value : <Comp {...props.data}>{slot.value}</Comp>
  }
})
