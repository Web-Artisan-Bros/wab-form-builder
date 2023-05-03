import {
  computed,
  defineComponent,
  h,
  nextTick,
  onMounted,
  PropType,
  ref,
  resolveDynamicComponent, SetupContext, toRef,
  useSlots,
  watch
} from 'vue'
import { Field, useField, useFieldValue } from 'vee-validate'
import type { FieldSchemaParsed } from '@/@types/FormBuilder'
import usePropsMerger from '@/composables/propsMerger'
import {
  hasCheckedAttr,
  isObject, isPropPresent,
  normalizeChildren,
  normalizeEventValue,
  shouldHaveValueBinding
} from '@/composables/utils'

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
  setup (props, ctx: any) {
    const { slots, emit } = ctx
    const field = toRef(props, 'field')
    const fieldEl = ref()
    
    const {
      value,
      errorMessage,
      handleBlur,
      handleChange,
      meta,
      validate: validateField,
      checked,
      errors,
      resetField,
      setErrors,
      setTouched,
      handleReset
    } = useField(props.field.name, props.field.rules, {
      ...props.field,
      // initialValue: resolveInitialValue(field.value as any, field.value.props),
    })
    
    const tag = resolveDynamicComponent(props.tag) as any
    
    const handleInput = (e: any) => {
      if (!hasCheckedAttr(field.value.props?.type)) {
        value.value = normalizeEventValue(e)
      }
    }
    
    const onChangeHandler = function handleChangeWithModel (e: any, shouldValidate = true) {
      if (isObject(e) && 'value' in e) {
        e = e.value
      }
      
      if (hasCheckedAttr(field.value.props?.type)) {
        // checked.value = e.target.checked
      }
      
      // debugger
      handleChange(e, shouldValidate)
      emit('update:modelValue', value.value)
    }
    
    const onInputHandler = function handleInputWithModel (e: any) {
      handleInput(e)
      emit('update:modelValue', value.value)
    }
    
    const fieldProps = computed(() => {
      const {
        validateOnInput,
        validateOnChange,
        validateOnBlur,
        validateOnModelUpdate
      } = resolveValidationTriggers(field.value)
      const baseOnBlur: any = [handleBlur, validateOnBlur ? validateField : undefined].filter(Boolean)
      const baseOnInput: any = [(e: unknown) => onChangeHandler(e, validateOnInput)].filter(Boolean)
      const baseOnChange: any = [(e: unknown) => onChangeHandler(e, validateOnChange)].filter(Boolean)
      
      const attrs: any = {
        name: field.value.name,
        id: props.id,
        onBlur: baseOnBlur,
        onInput: baseOnInput,
        onChange: baseOnChange,
        checked: checked?.value,
        ...field.value.props
      }
      
      attrs['onUpdate:modelValue'] = (e: any) => onChangeHandler(e, validateOnModelUpdate)
      
      if (hasCheckedAttr(field.value.props?.type) && checked) {
        attrs.checked = checked.value
      }
      
      if (shouldHaveValueBinding(tag, field.value.props ?? {})) {
        attrs.value = value.value
      }
      
      return attrs
    })
    
    function fieldChilds () {
      if (!slots.default) {
        if (props.field.options) {
          return props.field.options.map((option: any) => h('option', {
              value: option[props.field.optionValue ?? 'value']
            },
            option[props.field.optionLabel ?? 'label']))
        }
        
        return slots.default
      }
      
      if (typeof tag === 'string' || !tag) {
        return slots.default(slotProps())
      }
      
      return {
        default: () => slots.default?.(slotProps())
      }
    }
    
    function slotProps () {
      return {
        field: fieldProps.value,
        value: value.value,
        meta,
        errors: errors.value,
        errorMessage: errorMessage.value,
        validate: validateField,
        resetField,
        handleChange: onChangeHandler,
        handleInput: onInputHandler,
        handleReset,
        handleBlur,
        setTouched,
        setErrors
      }
    }
    
    return () => {
      const children = fieldChilds()
      
      return h(tag, {
        ref: fieldEl,
        ...fieldProps.value
      }, children)
    }
  }
})

function resolveValidationTriggers (props: any) {
  const { validateOnInput, validateOnChange, validateOnBlur, validateOnModelUpdate } = props
  
  return {
    validateOnInput: props.validateOnInput ?? validateOnInput,
    validateOnChange: props.validateOnChange ?? validateOnChange,
    validateOnBlur: props.validateOnBlur ?? validateOnBlur,
    validateOnModelUpdate: props.validateOnModelUpdate ?? validateOnModelUpdate
  }
}

function resolveInitialValue (props: Record<string, unknown>, attrs: any) {
  // Gets the initial value either from `value` prop/attr or `v-model` binding (modelValue)
  // For checkboxes and radio buttons it will always be the model value not the `value` attribute
  if (!hasCheckedAttr(attrs.type)) {
    return isPropPresent(props, 'modelValue') ? props.modelValue : attrs.value
  }
  
  return isPropPresent(props, 'modelValue') ? props.modelValue : undefined
}
