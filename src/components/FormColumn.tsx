import type { PropType } from 'vue'
import type { FieldSchema, FormSchema, GroupSchema } from '@/@types/FormBuilder'
import { computed, inject, mergeProps, defineComponent, h, ref, useSlots } from 'vue'

export default defineComponent({
  name: 'WabFormColumn',
  props: {
    group: { type: Object as PropType<GroupSchema>, required: true },
    field: { type: Object as PropType<FieldSchema>, required: true }
  },
  setup (props, { slots }) {
    const schema = inject('schema') as FormSchema
    const colProps = computed(() => mergeProps({},
      (schema.colProps ?? {}),
      (props.group.colProps ?? {}),
      (props.field.colProps ?? {})))
    
    const slot = slots.default?.() ?? []
    const Component = colProps.value.as ?? 'div' as any
    const groupComponent = <Component {...colProps.value}>{slot}</Component>
    
    return () => schema.noCol ? slot : groupComponent
  }
})
