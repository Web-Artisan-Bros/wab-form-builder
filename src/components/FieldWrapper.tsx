import { computed, defineComponent, inject, mergeProps } from 'vue'
import type { PropType } from 'vue'
import type { FieldSchema, GroupSchema, FormSchema } from '@/@types/FormBuilder'

export default defineComponent({
  name: 'WabFieldWrapper',
  props: {
    group: { type: Object as PropType<GroupSchema>, required: true },
    field: { type: Object as PropType<FieldSchema>, required: true }
  },
  setup (props, { slots }) {
    const schema = inject('schema') as FormSchema
    
    const wrapperProps = computed(() => {
      return mergeProps({},
        (schema.wrapperProps ?? {}),
        (props.group.wrapperProps ?? {}),
        (props.field.wrapperProps ?? {}))
    })
    
    const slot = slots.default?.() ?? []
    const Component = wrapperProps.value.as ?? 'div' as any
    const groupComponent = <Component {...wrapperProps.value}>{slot}</Component>
    
    return () => schema.noWrapper ? slot : groupComponent
  }
})
