import { computed, ref, watch } from 'vue'
import type { FieldSchema, FormSchema, FormSchemaSettings, GroupSchema, GroupSchemaParsed } from '@/@types/FormBuilder'
import usePropsMerger from '@/composables/propsMerger'

export function useSchemaParser (_schema: FormSchema) {
  const defaultSettings: FormSchemaSettings = {
    field: {
      validateOnBlur: true,
      validateOnChange: true,
      validateOnInput: true,
      optionLabel: 'label',
      optionValue: 'value'
      // uncheckedValue: false,
      // checkedValue: true,
    }
  }
  const schema = ref<FormSchema>()
  const propsMerger = usePropsMerger()
  const initialValues = computed(() => schema.value?.initialValues ?? {})
  
  const groups = computed<GroupSchema[]>(() => {
    const toReturn: GroupSchema[] = []
    const specifiedGroups = propsMerger.distinct(schema.value?.fields ?? [], 'group')
    
    if (!specifiedGroups.includes('_default')) {
      specifiedGroups.unshift('_default')
    }
    
    toReturn.push(...specifiedGroups.map(groupName => {
      const groupSettings = schema.value?.groups?.find(group => group.name === groupName)
      const settings = propsMerger.merge(null, schema.value?.settings, groupSettings?.settings)
      
      const toReturn = propsMerger.merge(null, {
        name: groupName,
        order: 0
      }, schema.value?.settings?.group, groupSettings)
      
      toReturn.settings = propsMerger.omit(settings, ['group'])
      
      return toReturn
    }))
    
    return toReturn.sort((a, b) => (a.order ?? -1) - (b.order ?? -1))
  })
  
  const fields = computed<FieldSchema[]>(() => {
    return schema.value?.fields.map(field => {
      const groupName = field.group || '_default'
      const group: GroupSchema | undefined = schema.value?.groups?.find(group => group.name === groupName)
      
      return {
        ...propsMerger.merge(field, schema.value?.settings?.field, group?.settings?.field, field),
        settings: propsMerger.omit(propsMerger.merge(field, schema.value?.settings, group?.settings, field?.settings), ['field']),
        initialValue: initialValues.value[field.name]
      }
    }) ?? []
  })
  
  const parsedSchema = computed<GroupSchemaParsed[]>(() => {
    return groups.value.map(group => {
      return {
        ...group,
        fields: fields.value.filter(field => group.name === '_default' ? (field.group === group.name || !field.group) : field.group === group.name)
      }
    })
  })
  
  function setErrors (errors: Record<string, string>) {
    schema.value?.fields.forEach(field => {
      field.error = errors[field.name]
    })
  }
  
  function setValues (formValues: any) {
    // initialValues.value = formValues
    
    console.log(initialValues.value)
  }
  
  watch(() => _schema, (value) => {
    schema.value = {
      ...value,
      settings: propsMerger.merge(null, defaultSettings, value.settings)
    }
  }, { immediate: true, deep: true })
  
  // console.log('groups', groups.value)
  // console.log('fields', fields.value)
  // console.log('parsedSchema', parsedSchema.value)
  
  return {
    schema: parsedSchema,
    originalSchema: schema,
    groups,
    fields,
    initialValues,
    setErrors,
    setValues,
  }
}
