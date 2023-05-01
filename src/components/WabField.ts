import { defineComponent, h, nextTick, onMounted, PropType, ref, resolveDynamicComponent, useSlots, watch } from 'vue'
import { Field, useField } from 'vee-validate'
import type { FieldSchemaParsed } from '@/@types/FormBuilder'

export type HTMLEvent = Event & {
  value?: any
}

export default defineComponent({
  name: 'WabField',
  props: {
    field: { type: Object as PropType<FieldSchemaParsed>, required: true },
    tag: { type: String, required: true },
    id: { type: String, required: true },
    modelValue: { type: [String, Number, Boolean, Object, Array] }
  },
  emits: ['update:modelValue'],
  setup (props, { slots, emit }) {
    const fieldEl = ref()
    
    // onMounted(() => {
    //   console.log('field mounted: ' + props.field.name)
    // })
    
    const {
      value, errorMessage,
      handleChange,
      handleBlur
    } = useField(props.field.name, props.field.rules, {
      ...props.field,
      initialValue: props.modelValue
    })
    
    const tag = resolveDynamicComponent(props.tag) as any
    
    function getValue (e: any) {
      return (e.target as HTMLInputElement)?.value ?? e.value ?? e
    }
    
    function emitChange (e: any) {
      const newValue = getValue(e)
      
      handleChange(newValue, true)
      emit('update:modelValue', newValue)
    }
    
    return () => h(tag, {
      ref: fieldEl,
      id: props.id,
      name: props.field.name,
      ...props.field.props,
      modelValue: value.value,
      'onInput': (e: any) => {
        if (!props.field.validateOnInput) {
          return
        }
        
        emitChange(e)
      },
      'onChange': (e: any) => {
        if (!props.field.validateOnChange) {
          return
        }
        
        emitChange(e)
      },
      onBlur: (e: any) => {
        handleBlur(e)
        
        if (!props.field.validateOnBlur || typeof tag !== 'string') {
          return
        }
        
        nextTick(() => {
          // fieldEl.value.modelValue ?? fieldEl.value.value //
          // emitChange(e)
        })
      }
    }, () => [])
    /*return () => h(Field, {
      ref: field,
      as: props.tag,
      name: props.field.name,
      rules: props.field.rules,
      label: props.field.label,
      id: props.id,
      ...props.field.props,
      'onUpdate:modelValue': (value) => {
        if (value.value) {
          return emit('update:modelValue', value.value)
        }
        
        emit('update:modelValue', value)
      }
    }, () => [])*/
  }
})

