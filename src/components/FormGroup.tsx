import type { PropType } from 'vue'
import type { FormSchema, GroupSchema } from '@/@types/FormBuilder'
import { computed, inject, mergeProps, defineComponent, h, ref, useSlots } from 'vue'

export default defineComponent({
  name: 'WabFormGroup',
  props: {
    group: Object as PropType<GroupSchema>
  },
  setup (props, {slots}) {
    const schema = inject('schema') as FormSchema
    const groupProps = computed(() => mergeProps({}, (schema.groupProps ?? {}), (props.group?.props ?? {})))
    
    const slot = slots.default?.() ?? []
    const Component = groupProps.value.as ?? 'fieldset' as any
    const groupComponent = <Component {...groupProps.value}>{slot}</Component>
    
    return () => schema.noGroup ? slot : groupComponent
  }
})
