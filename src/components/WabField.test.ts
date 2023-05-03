import {
  computed,
  defineComponent,
  h,
  PropType,
  resolveDynamicComponent, SetupContext, toRef
} from 'vue'
import { Field, FieldContext, FieldMeta, useField, useFieldValue } from 'vee-validate'
import type { FieldSchemaParsed } from '@/@types/FormBuilder'
import {
  normalizeChildren,
  hasCheckedAttr,
  shouldHaveValueBinding,
  isPropPresent,
  normalizeEventValue
} from '@/composables/utils'

interface ValidationTriggersProps {
  validateOnMount: boolean;
  validateOnBlur: boolean;
  validateOnChange: boolean;
  validateOnInput: boolean;
  validateOnModelUpdate: boolean;
}

type EventHandlerBinding<T> = T | T[];

interface FieldBindingObject<TValue = unknown> {
  name: string;
  onBlur: EventHandlerBinding<(e: Event) => unknown>;
  onInput: EventHandlerBinding<(e: Event) => unknown>;
  onChange: EventHandlerBinding<(e: Event) => unknown>;
  'onUpdate:modelValue'?: ((e: TValue) => unknown) | undefined;
  value?: unknown;
  checked?: boolean;
}

interface FieldSlotProps<TValue = unknown>
  extends Pick<
    FieldContext,
    'validate' | 'resetField' | 'handleChange' | 'handleReset' | 'handleBlur' | 'setTouched' | 'setErrors'
  > {
  field: FieldBindingObject<TValue>;
  value: TValue;
  meta: FieldMeta<TValue>;
  errors: string[];
  errorMessage: string | undefined;
  handleInput: FieldContext['handleChange'];
}

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
  setup (props, ctx: SetupContext) {
    const field = toRef(props, 'field')
    const rules = toRef(field.value, 'rules')
    const name = toRef(field.value, 'name')
    const label = toRef(field.value, 'label')
    const uncheckedValue = toRef(field.value, 'uncheckedValue')
    const keepValue = toRef(field.value, 'keepValue')
    
    const {
      errors,
      value,
      errorMessage,
      validate: validateField,
      handleChange,
      handleBlur,
      setTouched,
      resetField,
      handleReset,
      meta,
      checked,
      setErrors
    } = useField(name, rules, {
      validateOnMount: field.value.validateOnMount,
      bails: field.value.bails,
      standalone: field.value.standalone,
      type: ctx.attrs.type as string,
      initialValue: resolveInitialValue(field.value as any, ctx),
      // Only for checkboxes and radio buttons
      checkedValue: ctx.attrs.value,
      uncheckedValue,
      label,
      validateOnValueUpdate: false,
      keepValueOnUnmount: keepValue
    })
    
    // If there is a v-model applied on the component we need to emit the `update:modelValue` whenever the value binding changes
    const onChangeHandler = function handleChangeWithModel (e: unknown, shouldValidate = true) {
      handleChange(e, shouldValidate)
      ctx.emit('update:modelValue', value.value)
    }
    
    const handleInput = (e: any) => {
      if (!hasCheckedAttr(ctx.attrs.type)) {
        value.value = normalizeEventValue(e)
      }
    }
    
    const onInputHandler = function handleInputWithModel (e: any) {
      handleInput(e)
      ctx.emit('update:modelValue', value.value)
    }
    
    const fieldProps = computed(() => {
      const {
        validateOnInput,
        validateOnChange,
        validateOnBlur,
        validateOnModelUpdate
      } = resolveValidationTriggers(field.value)
      const baseOnBlur: any = [handleBlur, ctx.attrs.onBlur, validateOnBlur ? validateField : undefined].filter(Boolean)
      const baseOnInput: any = [(e: unknown) => onChangeHandler(e, validateOnInput), ctx.attrs.onInput].filter(Boolean)
      const baseOnChange: any = [(e: unknown) => onChangeHandler(e, validateOnChange), ctx.attrs.onChange].filter(Boolean)
      
      const attrs: FieldBindingObject<unknown> = {
        name: field.value.name,
        onBlur: baseOnBlur,
        onInput: baseOnInput,
        onChange: baseOnChange,
        ...field.value.props
      }
      
      attrs['onUpdate:modelValue'] = e => onChangeHandler(e, validateOnModelUpdate)
      
      if (hasCheckedAttr(ctx.attrs.type) && checked) {
        attrs.checked = checked.value
      }
      
      const tag = resolveTag(props, ctx)
      if (shouldHaveValueBinding(tag, ctx.attrs)) {
        attrs.value = value.value
      }
      
      return attrs
    })
    
    function slotProps (): FieldSlotProps {
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
    
    ctx.expose({
      setErrors,
      setTouched,
      reset: resetField,
      validate: validateField,
      handleChange
    })
    
    return () => {
      const tag = resolveDynamicComponent(resolveTag(props, ctx)) as string
      const children = normalizeChildren(tag, ctx, slotProps as any)
      
      if (tag) {
        return h(
          tag,
          {
            ...ctx.attrs,
            ...fieldProps.value
          },
          children
        )
      }
      
      return children
    }
  }
})

function resolveTag (props: Record<string, any>, ctx: SetupContext<any>) {
  let tag: string = props.as || ''
  
  if (!props.as && !ctx.slots.default) {
    tag = 'input'
  }
  
  return tag
}

function resolveValidationTriggers (props: Partial<ValidationTriggersProps>) {
  const { validateOnInput, validateOnChange, validateOnBlur, validateOnModelUpdate } = props
  
  return {
    validateOnInput: props.validateOnInput ?? validateOnInput,
    validateOnChange: props.validateOnChange ?? validateOnChange,
    validateOnBlur: props.validateOnBlur ?? validateOnBlur,
    validateOnModelUpdate: props.validateOnModelUpdate ?? validateOnModelUpdate
  }
}

function resolveInitialValue (props: Record<string, unknown>, ctx: SetupContext<any>) {
  // Gets the initial value either from `value` prop/attr or `v-model` binding (modelValue)
  // For checkboxes and radio buttons it will always be the model value not the `value` attribute
  if (!hasCheckedAttr(ctx.attrs.type)) {
    return isPropPresent(props, 'modelValue') ? props.modelValue : ctx.attrs.value
  }
  
  return isPropPresent(props, 'modelValue') ? props.modelValue : undefined
}
