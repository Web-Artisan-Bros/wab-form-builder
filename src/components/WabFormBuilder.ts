import { computed, defineComponent, h, onMounted, PropType, ref, watch } from 'vue'
import type { FormSchema, FormSchemaSettings } from '@/@types/FormBuilder'
import { Form } from 'vee-validate'
import { useSchemaParser } from '@/composables/schemaParser'
import { WabGroup } from '@/classes/WabGroup'

export default defineComponent({
  name: 'WabFormBuilder',
  props: {
    schema: {
      type: Object as PropType<FormSchema>,
      required: true
    }
  },
  setup: function (props) {
    const formRef = ref<typeof Form>()
    const schemaParser = useSchemaParser(props.schema)
    const settings = computed(() => props.schema.settings)
    
    // provide<GroupSchemaParsed[]>('schema', schemaParser.schema.value)
    // provide('errors', errors)
    
    const formChilds = computed(() => {
      const groups = schemaParser.schema.value
      
      return groups.map(group => new WabGroup(group, settings.value).template)
    })
    
    watch(() => formRef.value?.getErrors(), (value) => {
      schemaParser.setErrors(value)
    })
    
    watch(() => formRef.value?.getValues() ?? {}, (value) => {
      schemaParser.setValues(value)
    }, { immediate: true, deep: true })
    
    // return the render function
    return () => h(Form, {
      ref: formRef,
      initialValues: schemaParser.initialValues.value,
    }, () => formChilds.value)
  }
})
