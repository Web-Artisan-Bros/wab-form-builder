<script lang="ts" setup>
import type { PropType } from 'vue'
import { computed, provide, ref, toRef, useSlots, watch } from 'vue'
import type { FieldSchema, FormSchema } from '@/@types/FormBuilder'
import DemoField from '@/components/DemoField.vue'
import * as yup from 'yup'
import { ObjectSchema } from 'yup'

const props = defineProps({
  schema: {
    type: Object as PropType<FormSchema>,
    required: true
  }
})
const slots = useSlots()

console.log(slots)
const form = ref()
const modelValue = ref<any>({})
const modelValidationSchema = ref<any>({})
const errors = ref<Record<any, string>>({})

provide('formSchema', props.schema)
provide('formValues', toRef(modelValue, 'value'))

function createInitialModelValue () {
  return props.schema?.fields.reduce((acc: any, field: FieldSchema) => {
    const name: string = field.name
    const existingValue = modelValue.value[name]
    const initialValue = props.schema?.initialValues?.[name] ?? field.modelValue

    acc[name] = existingValue ?? initialValue

    return acc
  }, {} as Record<string, any>)
}

/**
 * Based on the fields schema, create a yup validation schema
 */
function createValidationSchema (): ObjectSchema<any> {
  return yup.object(props.schema?.fields.reduce((acc, field) => {
    const name: string = field.name
    const validationSchema = field.rules

    if (validationSchema) {
      acc[name] = validationSchema
    }

    return acc
  }, {} as Record<any, any>))
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

function validate () {
  try {
    modelValidationSchema.value.validateSync(modelValue.value, { abortEarly: false })

    // default submit
    form.value.submit()
  } catch (e: any) {
    e.inner.map((error: any) => {
      storeValidation(error.message, error.path)
    })
  }
}

function onSubmit () {
  validate()
}

function getSlotName (field: FieldSchema) {
  return ['field', field.name].join('_')
}

watch(() => props.schema, () => {
  modelValue.value = createInitialModelValue()
  modelValidationSchema.value = createValidationSchema()
}, { deep: true, immediate: true })

</script>

<template>
  <form @submit.prevent="onSubmit" ref="form">

    <DemoField v-for="(field, i) in schema.fields" :key="field.name + '_' + i"
               :field="field"
               :error="errors[field.name]"
               v-model="modelValue[field.name]"
               @update:error="storeValidation">
      <template  v-slot:field="data" v-if="slots[getSlotName(field)]">
        <slot
            :name="getSlotName(field)"
            v-bind="data">
        </slot>
      </template>

    </DemoField>

    <div>
      {{ errors }}
    </div>

    <button type="submit">Invia</button>
  </form>
</template>

<style scoped lang="scss">

</style>
