import { computed, defineComponent, h, onMounted, PropType, ref, watch } from 'vue'
import type { FormSchema, FormSchemaSettings } from '@/@types/FormBuilder'
import { Form, useFormErrors } from 'vee-validate'
import type { FormMeta } from 'vee-validate'
import { useSchemaParser } from '@/composables/schemaParser'
import { WabGroup } from '@/classes/WabGroup'

export default defineComponent({
  name: 'WabFormBuilder',
  props: {
    schema: {
      type: Object as PropType<FormSchema>,
      required: true
    },
    onSubmit: Function,
    onInvalidSubmit: Function,
    onError: Function as PropType<(errors: Record<string, string>) => void>,
    onValue: Function as PropType<(values: Record<string, any>) => void>,
  },
  setup: function (props, { slots, attrs }) {
    const formRef = ref<typeof Form>()
    const schemaParser = useSchemaParser(props.schema)
    const settings = computed(() => props.schema.settings)
    
    // provide<GroupSchemaParsed[]>('schema', schemaParser.schema.value)
    // provide('errors', errors)
    
    const formChilds = computed(() => {
      const groups = schemaParser.schema.value
      
      const toReturn = groups.map(group => new WabGroup(group, settings.value).template)
      
      if (slots.bottom) {
        toReturn.push(slots.bottom())
      }
      
      return toReturn
    })
    
    // Watch for errors changes and update the schema
    watch(() => formRef.value?.getErrors(), (value) => {
      schemaParser.setErrors(value)
      
      props.onError?.(value)
      props.onValue?.(formRef.value?.getValues())
    })
    
    // return the render function
    return () => h(Form, {
      ref: formRef,
      initialValues: schemaParser.initialValues.value,
      onSubmit: props.onSubmit,
      onInvalidSubmit: props.onInvalidSubmit,
    } as Partial<typeof Form>, () => formChilds.value)
  }
})
