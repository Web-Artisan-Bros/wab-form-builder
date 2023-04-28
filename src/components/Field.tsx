import type { ComputedRef, PropType } from 'vue'
import { Field, ErrorMessage, useField } from 'vee-validate'
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
      return propsMerger.getProps('label', schema, props.group, props.field, { fieldError: fieldError.value }, { id: id.value })
    })
    
    const labelPosition = computed(() => {
      return props.field.labelPosition ?? props.group.labelPosition ?? schema.labelPosition ?? 'before'
    })
    
    const fieldProps = computed(() => {
      return propsMerger.getProps('field', schema, props.group, props.field, { fieldError: fieldError.value }, { id: id.value })
    })
    
    const errorProps = computed(() => {
      return propsMerger.getProps('error', schema, props.group, props.field, { fieldError: fieldError.value }, { id: id.value })
    })
    
    const fieldSlots = computed(() => ({
      default: (field: any) => slots[id.value]?.({
          ...field,
          fieldSchema: props.field,
          fieldProps: fieldProps.value
        })
        ?? slots[id.value + '_content']?.({
          ...field,
          fieldSchema: props.field,
          fieldProps: fieldProps.value
        })
        ?? options.value
    }))
    
    const options = computed(() => {
      return props.field.options?.map((option: any) =>
        <option value={option.value}>{option.label}</option>) ?? undefined
    })
    
    const fieldRef = ref()
    
    const field: ComputedRef<any> = computed(() => <Field as={slots[id.value] ? undefined : props.field.as}
                                                          ref={fieldRef.value}
                                                          name={props.field.name}
                                                          rules={props.field.rules}
                                                          v-slots={fieldSlots.value}
                                                          {...fieldProps.value}
    >
    </Field>)
    
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
