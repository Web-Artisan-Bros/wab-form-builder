import type { PropType } from 'vue'
import { Field, ErrorMessage } from 'vee-validate'
import { computed, defineComponent, inject, mergeProps, ref, triggerRef, useSlots, watch } from 'vue'
import type { FieldSchema, GroupSchema, FormSchema } from '@/@types/FormBuilder'
import usePropsMerger from '@/composables/propsMerger'

export default defineComponent({
  name: 'WabField',
  props: {
    group: { type: Object as PropType<GroupSchema>, required: true },
    field: { type: Object as PropType<FieldSchema>, required: true }
  },
  inheritAttrs: true,
  setup (props, { slots }) {
    const schema = inject('schema') as FormSchema
    const formErrors = inject('errors') as any
    const propsMerger = usePropsMerger()
    const id = computed(() => 'field_' + props.field.name)
    const fieldError = computed(() => formErrors.value ? formErrors.value[props.field.name] : null)
    
    const labelProps = computed(() => {
      return mergeProps({},
        (schema.labelProps ?? {}),
        (props.group.labelProps ?? {}),
        (props.field.labelProps ?? {}))
    })
    
    const labelPosition = computed(() => {
      return props.field.labelPosition ?? props.group.labelPosition ?? schema.labelPosition ?? 'before'
    })
    
    const fieldProps = computed(() => {
      return propsMerger.merge({ fieldError: fieldError.value }, schema.fieldProps, props.group.fieldProps, props.field.props, {
        id: id.value
      })
    })
    
    const errorProps = computed(() => {
      return mergeProps({},
        (schema.errorProps ?? {}),
        (props.group.errorProps ?? {}),
        (props.field.errorProps ?? {}))
    })
    
    const fieldSlots = {
      default: (field: any) => slots.field ? slots.field({ ...field, fieldSchema: props.field }) : null
    }
    
    const field = computed(() => <Field as={slots.field ? undefined : props.field.as}
                                        name={props.field.name}
                                        rules={props.field.rules}
                                        v-slots={fieldSlots}
                                        {...fieldProps.value}></Field>)
    
    const fieldErrorEl = <ErrorMessage name={props.field.name} {...errorProps.value}></ErrorMessage>
    
    const label = <label for={id.value}
                         {...labelProps.value}>{props.field.label}</label>
    
    const toReturn = computed(() => {
      const arr = [field.value]
      
      if (!schema.noErrors) {
        arr.push(fieldErrorEl)
      }
      
      if (slots.append) {
        arr.push(...slots.append())
      }
      
      if (slots.prepend) {
        arr.unshift(...slots.prepend())
      }
      
      if (labelPosition.value === 'before') {
        arr.unshift(label)
      } else if (labelPosition.value === 'after') {
        arr.push(label)
      }
      
      return arr
    })
    
    return () => <>{toReturn.value}</>
  }
})
