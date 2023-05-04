import {
  computed,
  defineComponent,
  h,
  inject,
  PropType,
  Ref,
  ref,
  resolveDynamicComponent, shallowRef,
  toRef,
  unref,
  watch,
  defineExpose
} from 'vue'
import type { ObjectSchema } from 'yup'
import type { FieldBinding, FieldSchema, FieldSchemaParsed, FormSchema } from '@/@types/FormBuilder'
import { isHTMLTag, isHTMLEvent, isHTMLCheckableInput, fieldCount, omit } from '@/composables/utilities'
import { WabWrapper } from '@/classes/WabWrapper'

export default defineComponent({
  name: 'WabField',
  props: {
    field: {
      type: Object as PropType<FieldSchema>,
      required: true
    },
    modelValue: {
      type: [String, Number, Boolean, Array, Object]
    },
    error: {
      type: String
    }
  },
  emits: ['update:modelValue', 'update:error', 'update:visibility'],
  expose: ['field', 'modelValue', 'error', 'visibility'],
  setup (props, { emit, slots }) {
    const formFields = inject('formFields') as Ref<FieldSchemaParsed[]>
    const formValues = inject('formValues') as Ref<Record<string, any>>
    const hiddenFields = inject('hiddenFields') as Ref<string[]>
    const hiddenGroups = inject('hiddenGroups') as Ref<string[]>
    const modelValue = ref<any>(unref(props.modelValue))
    const error = ref(props.error)
    const field = toRef(props, 'field')
    const fieldName = toRef(props.field, 'name')
    const id = computed(() => {
      const toReturn = ['field', fieldName.value]
      
      if (isHTMLCheckableInput(props.field.props) && isMultiple.value) {
        if (props.field.props?.value) {
          toReturn.push(props.field.props.value)
        } else {
          toReturn.push(multipleIndex.value.toString())
        }
      }
      
      return toReturn.join('-')
    })
    
    const mustShow = computed(() => {
      if (hiddenGroups.value.includes(field.value.group ?? '_default')) {
        return false
      }
      
      return props.field.if?.(fieldBinding.value, formValues.value, hiddenFields.value) ?? true
    })
    
    /**
     * Count how many fields with the same name exists in the form schema.
     */
    const countSameName = computed(() => fieldCount(fieldName.value, formFields.value))
    
    /**
     * Indicate if exists more than one field with the same name
     */
    const isMultiple = computed(() => countSameName.value > 1)
    
    /**
     * Get the index of the current field in the array of fields with the same name.
     */
    const multipleIndex = computed(() => {
      const sameNameFields = formFields.value.filter(field => field.name === fieldName.value)
      return sameNameFields.findIndex(field => field.props?.value === props.field.props?.value)
    })
    
    /**
     * Return true if the field is a checkbox
     */
    const isCheckbox = computed(() => props.field.as === 'input' && props.field.props?.type === 'checkbox')
    
    /**
     * Indicate if we must add a hidden field with value "off" to the checkbox.
     */
    const addCheckboxOffInput = computed(() => isCheckbox.value && !isMultiple.value && multipleIndex.value === countSameName.value - 1)
    
    /**
     * Resolve the tag to use for the field. This can be a html tag or a custom component.
     */
    const tag = computed<any>(() => resolveDynamicComponent(props.field.as as any))
    
    /**
     * Create an object with all the props to pass to the field.
     */
    const fieldBinding = computed<FieldBinding>(() => {
      const { field } = props
      const toReturn: FieldBinding = Object.assign({},
        omit(field.props, ['_class']),
        {
          name: field.name + (isMultiple.value && isCheckbox.value ? `[]` : ''),
          label: field.label,
          id: id.value,
          onInput: handleInput,
          onChange: handleInput
        })
      
      if (field.props?._class) {
        toReturn.class = field.props._class({
          error: error.value,
          value: modelValue.value,
          fieldName: field.name,
          formValues: formValues.value
        })
      }
      
      /*
      For html tags, must use value attr.
      For custom components, must use modelValue attr.
       */
      if (isHTMLTag(field.as)) {
        // if the field is a checkbox or radio, bind to the value prop
        if (!isHTMLCheckableInput(field.props)) {
          toReturn.value = modelValue.value
        } else {
          toReturn.value = field.props?.value
          toReturn.checked = modelValue.value instanceof Array
            ? modelValue.value.includes(field.props?.value)
            : toReturn.value ? toReturn.value === modelValue.value : modelValue.value
        }
        
        if (field.as === 'select' && field?.props?.options) {
          // this would cause a vue warning for select tags
          delete toReturn.options
        }
      } else {
        toReturn.modelValue = modelValue.value
      }
      
      return toReturn
    })
    
    /**
     * Create an array of vNodes to pass to the field as childs.
     */
    const childs = computed(() => {
      const { field } = props
      let toReturn: any //slots.default?.()
      
      /*
      For select tags, if there are no slots, but options are provided, create options tags.
       */
      if (!toReturn && field.as === 'select' && field?.props?.options) {
        toReturn = field.props.options.map((option: any) => {
          return h('option', { value: option.value }, option.label)
        })
      }
      
      if (!toReturn) {
        toReturn = []
      }
      
      /*
      For html tags, must return an array of vNodes.
      For custom components, must return function that returns an array of vNodes.
       */
      return isHTMLTag(field.as) ? toReturn : () => toReturn
    })
    
    /**
     * Create a vNode for the label if necessary
     */
    const labelEl = computed(() => {
      if (field.value.label) {
        return h('label', {
          for: id.value
        }, field.value.label)
      }
    })
    
    /**
     * Create a vNode for the error if necessary
     */
    const errorEl = computed(() => {
      if (field.value.settings?.error?.avoid) {
        return
      }
      
      const tag = field.value.settings?.error?.as ?? 'span'
      
      return h(tag, field.value.settings?.error?.props ?? {}, error.value)
    })
    
    /**
     * Get the value from the event fired by change or input.
     * This check if the event is an HTMLEvent, then returns the value from the target.
     * If not, searches for a "value" prop.
     *
     * @param {any} e
     */
    function getValue (e: any) {
      if (!isHTMLEvent(e)) {
        return e.value ?? e
      }
      
      // if the field is a checkbox, check the checked value
      if (e.target.type === 'checkbox') {
        // if there are more than one checkbox with the same name, return an array of values
        if (isMultiple.value) {
          let currValue = unref(formValues)[fieldName.value] ?? []
          const value = e.target.value
          
          // if the value is not an array, convert it to an array
          if (!Array.isArray(currValue)) {
            currValue = [currValue]
          }
          
          // if the checkbox is checked, add the value to the array, if not already there
          // if the checkbox is not checked, remove the value from the array
          if (e.target.checked) {
            if (!currValue.includes(value)) {
              currValue.push(value)
            }
          } else {
            currValue = currValue.filter((v: any) => v !== value)
          }
          
          return currValue
        }
        
        return e.target.checked
      }
      
      return e.target.value
    }
    
    /**
     * Handle the input event.
     * Emit the update:modelValue event with the value from the event.
     * Validate the field.
     *
     * @param {any} e
     */
    function handleInput (e: any) {
      // store the value in local modelValue variable
      modelValue.value = getValue(e)
      
      // emit the update:modelValue event
      emit('update:modelValue', modelValue.value, props.field)
      
      // validate the field
      validate()
    }
    
    /**
     * Validate the field and emit the update:error event.
     */
    function validate () {
      const schema: ObjectSchema<any> = props.field?.rules as any
      
      if (!schema) {
        return
      }
      
      try {
        schema.validateSync(modelValue.value)
        error.value = undefined
      } catch (e: any) {
        error.value = e.message
      }
      
      emit('update:error', error.value, props.field.name)
    }
    
    /**
     * Create a hidden input with the value of the field, necessary for classic form submit
     */
    function createHiddenInput () {
      return h('input', {
        hidden: true,
        value: addCheckboxOffInput.value ? 'off' : modelValue.value,
        name: fieldName.value
      }, [])
    }
    
    /**
     * Create a wrapper around the field
     *
     * @param {any} _field
     */
    function getWrapper (_field: any[]): any {
      if (field.value.settings?.wrapper?.avoid) {
        return _field
      }
      
      return new WabWrapper(field.value.settings?.wrapper ?? {}, _field).template
    }
    
    /**
     * Create a wrapper(column) around the field
     *
     * @param {any} _field
     */
    function getColumn (_field: any[]): any {
      if (field.value.settings?.col?.avoid) {
        return _field
      }
      
      return new WabWrapper(field.value.settings?.col ?? {}, _field).template
    }
    
    /**
     * Watch for changes in the "error" prop so that can update the local error variable.
     * This is useful when the full form is validated, instead of validating each field.
     */
    watch(() => props.error, (value: any) => {
      error.value = value
    })
    
    /**
     * Watch for changes in the "modelValue" prop so that can update the local modelValue variable.
     */
    watch(() => props.modelValue, (value: any) => {
      modelValue.value = value
    })
    
    watch(() => mustShow.value, (value) => {
      emit('update:visibility', value, fieldName.value)
    }, { immediate: true })
    
    return () => {
      let toReturn = [h(tag.value, fieldBinding.value, childs.value ?? [])]
      
      // if there is a slot for the field, use it
      if (slots.field) {
        // wrap the slot in a column and wrapper if necessary
        return getColumn(getWrapper(slots.field({ ...fieldBinding.value, error: error.value })))
      }
      
      /*
      When submitting the form with page reload (classic way), for custom component, the modelValue could not be sent,
      so we create a hidden input with the value. This is not needed for html tags.
       */
      if (!isHTMLTag(props.field.as) || addCheckboxOffInput.value) {
        if (!addCheckboxOffInput.value || !modelValue.value) {
          toReturn.unshift(createHiddenInput())
        }
      }
      
      // Add Label
      if (labelEl.value) {
        if (field.value.settings?.label?.position === 'after') {
          toReturn.push(labelEl.value)
        } else {
          toReturn.unshift(labelEl.value)
        }
      }
      
      // Add error message
      if (errorEl.value) {
        toReturn.push(errorEl.value)
      }
      
      // addWrapper
      toReturn = getWrapper(toReturn)
      
      // addColumn
      toReturn = getColumn(toReturn)
      
      return mustShow.value ? toReturn : null
    }
  },
})

