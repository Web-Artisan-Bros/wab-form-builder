<script lang="ts">
import { computed, defineComponent, h, inject, PropType, ref, resolveDynamicComponent, toRef, unref, watch } from 'vue'
import type { ObjectSchema } from 'yup'
import type { FieldSchema, FormSchema } from '@/@types/FormBuilder'
import { isHTMLTag, isHTMLEvent, isHTMLCheckableInput, fieldCount } from '@/composables/utilities'

export default defineComponent({
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
  setup (props, { emit, slots }) {
    const formSchema = inject('formSchema') as FormSchema
    const formValues = inject('formValues') as any
    const modelValue = ref<any>(props.modelValue)
    const error = ref(props.error)
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

    const countSameName = computed(() => fieldCount(fieldName.value, formSchema.fields))
    /**
     * Indicate if exists more than one field with the same name
     */
    const isMultiple = computed(() => countSameName.value > 1)
    const multipleIndex = computed(() => {
      const sameNameFields = formSchema.fields.filter(field => field.name === fieldName.value)
      return sameNameFields.findIndex(field => field.props?.value === props.field.props?.value)
    })
    const isCheckbox = computed(() => props.field.as === 'input' && props.field.props?.type === 'checkbox')
    const addCheckboxOffInput = computed(() => isCheckbox.value && !isMultiple.value && multipleIndex.value === countSameName.value - 1)

    /**
     * Resolve the tag to use for the field. This can be a html tag or a custom component.
     */
    const tag = computed<any>(() => resolveDynamicComponent(props.field.as as any))

    /**
     * Create an object with all the props to pass to the field.
     */
    const fieldBinding = computed(() => {
      const { field } = props
      const toReturn: any = {
        ...field.props,
        name: field.name + (isMultiple.value && isCheckbox.value ? `[]` : ''),
        label: field.label,
        id: id.value,
        onInput: handleInput,
        onChange: handleInput
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
          toReturn.checked = modelValue.value instanceof Array ? modelValue.value.includes(field.props?.value) : modelValue.value
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
      let toReturn = slots.default?.()

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

    function createHiddenInput () {
      return h('input', {
        hidden: true,
        value: addCheckboxOffInput.value ? 'off' : modelValue.value,
        name: fieldName.value
      }, [])
    }

    /**
     * Watch for changes in the "error" prop so that can update the local error variable.
     * This is useful when the full form is validated, instead of validating each field.
     */
    watch(() => props.error, (value: any) => {
      error.value = value
    })

    return () => {
      const toReturn = [h(tag.value, fieldBinding.value, childs.value ?? [])]

      if (slots.field) {
        return slots.field(fieldBinding.value)
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

      return toReturn
    }
  },
  emits: ['update:modelValue', 'update:error']
})
</script>

<style scoped lang="scss">

</style>
