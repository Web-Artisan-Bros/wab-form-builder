import { computed, ComputedRef, Ref, ref, toRef, watch } from 'vue'
import type { FieldSchema, FormSchema, FormSchemaSettings, GroupSchema, GroupSchemaParsed } from '@/@types/FormBuilder'
import type { ObjectSchema } from 'yup'
import * as yup from 'yup'
import { distinct, merge, omit } from '@/composables/utilities'

export interface UseFormSchema {
  schema: ComputedRef<GroupSchemaParsed[]>;
  originalSchema: Ref<FormSchema>;
  groups: ComputedRef<GroupSchema[]>;
  fields: ComputedRef<FieldSchema[]>;
  modelValue: any;
  initialValues: any,
  modelValidationSchema: any,
  fieldsToHide: Ref<string[]>,
  groupsFoHide: Ref<string[]>,
  errors: Ref<Record<string, string>>,
  validate: () => Promise<boolean>,
  resetValidation: () => void,
  onUpdateError: (error: string, fieldName: string) => void,
  onUpdateFieldVisibility: (visible: boolean, field: string) => void,
  onUpdateGroupVisibility: (visible: boolean, group: string) => void,
}

export function useFormSchema (_schema: FormSchema): UseFormSchema {
  const defaultSettings: FormSchemaSettings = {
    field: {
      // validateOnBlur: true,
      // validateOnChange: true,
      // validateOnInput: true,
      optionLabel: 'label',
      optionValue: 'value'
      // uncheckedValue: false,
      // checkedValue: true,
    }
  }
  const schema = ref(_schema)
  const modelValue = ref<any>({})
  const modelValidationSchema = ref<ObjectSchema<any>>({} as any)
  const errors = ref<Record<any, string>>({})
  const fieldsToHide = ref<string[]>([])
  const groupsFoHide = ref<string[]>([])
  
  const initialValues = computed(() => schema.value?.initialValues ?? {})
  
  const groups = computed<GroupSchema[]>(() => {
    const toReturn: GroupSchema[] = []
    const specifiedGroups = distinct(schema.value?.fields ?? [], 'group')
    
    if (!specifiedGroups.includes('_default')) {
      specifiedGroups.unshift('_default')
    }
    
    toReturn.push(...specifiedGroups.map(groupName => {
      const groupSettings = schema.value?.groups?.find(group => group.name === groupName)
      const settings = merge(null, schema.value?.settings, groupSettings?.settings)
      
      const toReturn = merge(null, {
        name: groupName,
        order: 0
      }, schema.value?.settings?.group, groupSettings)
      
      toReturn.settings = omit(settings, ['group'])
      
      return toReturn
    }))
    
    return toReturn.sort((a, b) => (a.order ?? -1) - (b.order ?? -1))
  })
  
  const fields = computed<FieldSchema[]>(() => {
    const toReturn = schema.value?.fields.map(field => {
      const groupName = field.group || '_default'
      const group: GroupSchema | undefined = schema.value?.groups?.find(group => group.name === groupName)
      
      if (field.modelValue) {
        initialValues.value[field.name] = field.modelValue
      }
      
      // field.settings = propsMerger.omit(propsMerger.merge(null, schema.value?.settings, group?.settings, field?.settings), ['field'])
      // field.initialValue = initialValues.value[field.name]
      // return field
      
      return {
        ...merge(null, schema.value?.settings?.field, group?.settings?.field, field),
        settings: omit(merge(null, schema.value?.settings, group?.settings, field?.settings), ['field']),
        initialValue: initialValues.value[field.name]
      }
    }) ?? []
    
    return toReturn//.filter(field => !fieldsToHide.value.includes(field.name))
  })
  
  const parsedSchema = computed<GroupSchemaParsed[]>(() => {
    return groups.value.map(group => {
      return {
        ...group,
        fields: fields.value.filter(field => group.name === '_default' ? (field.group === group.name || !field.group) : field.group === group.name)
      }
    })
  })
  
  
  /**
   * Create the initial model value based on the fields schema
   */
  function createInitialModelValue () {
    return fields.value.reduce((acc: any, field: FieldSchema) => {
      const name: string = field.name
      const existingValue = modelValue.value[name]
      const initialValue = initialValues.value[name] ?? field.modelValue
      
      acc[name] = existingValue ?? initialValue
      
      return acc
    }, {} as Record<string, any>)
  }
  
  /**
   * Based on the fields schema, create a yup validation schema
   */
  function createValidationSchema (): ObjectSchema<any> {
    const fieldsToUse = fields.value.filter(field => !fieldsToHide.value.includes(field.name))
    
    const schema = fieldsToUse.reduce((acc, field) => {
      const name: string = field.name
      const validationSchema = field.rules
      
      if (validationSchema) {
        acc[name] = validationSchema
      }
      
      return acc
    }, {} as Record<any, any>)
    
    return yup.object().shape(schema)
  }
  
  /**
   * On "update:error" event from a field,
   * store the error in the local errors object.
   *
   * @param {string} error The error message
   * @param {string} fieldName The name of the field that emitted the error
   */
  function storeValidation (error: string, fieldName: string) {
    if (error) {
      errors.value[fieldName] = error
    } else {
      delete errors.value[fieldName]
    }
  }
  
  /**
   * Validate the whole form
   */
  function validate () {
    try {
      return modelValidationSchema.value.validateSync(modelValue.value, { abortEarly: false })
    } catch (e: any) {
      e.inner.map((error: any) => {
        storeValidation(error.message, error.path)
      })
    }
  }
  
  function resetValidation () {
    errors.value = {}
  }
  
  function updateFieldVisibility (visibile: boolean, fieldName: string) {
    if (visibile) {
      // remove field from array of hidden fields
      fieldsToHide.value = fieldsToHide.value.filter(field => field !== fieldName)
      
      // add field to model
      modelValue.value[fieldName] = initialValues.value[fieldName]
    } else if (!fieldsToHide.value.includes(fieldName)) {
      // add field to array of hidden fields
      fieldsToHide.value.push(fieldName)
      
      // remove field errors
      storeValidation('', fieldName)
      
      // remove field from model
      delete modelValue.value[fieldName]
    }
    
    modelValidationSchema.value = createValidationSchema()
  }
  
  function updateGroupVisibility (visibile: boolean, groupName: string) {
    if (visibile) {
      groupsFoHide.value = groupsFoHide.value.filter(group => group !== groupName)
    } else if (!groupsFoHide.value.includes(groupName)) {
      groupsFoHide.value.push(groupName)
    }
  }
  
  watch(() => fields.value, () => {
    modelValue.value = createInitialModelValue()
    modelValidationSchema.value = createValidationSchema()
  }, { deep: true, immediate: true })
  
  return {
    schema: parsedSchema,
    originalSchema: schema,
    groups,
    fields,
    initialValues,
    modelValue,
    modelValidationSchema,
    fieldsToHide,
    groupsFoHide,
    errors,
    validate,
    resetValidation,
    onUpdateError: storeValidation,
    onUpdateFieldVisibility: updateFieldVisibility,
    onUpdateGroupVisibility: updateGroupVisibility
  }
}
