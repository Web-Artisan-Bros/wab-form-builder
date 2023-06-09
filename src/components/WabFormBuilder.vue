<script lang="ts" setup>
import { provide, ref, toRef, useSlots } from 'vue'
import WabField from '@/components/WabField'
import WabGroup from '@/components/WabGroup'
import { useFormSchema } from '@/composables/useFormSchema'

import type { PropType } from 'vue'
import type { FieldSchema, FormSchema } from '@/@types/FormBuilder'

const props = defineProps({
  schema: {
    type: Object as PropType<FormSchema>,
    required: true
  },
  onSubmit: {
    type: Function as PropType<(formValues: any) => void>
  }
})
const slots = useSlots()

const form = ref()
const formSchema = useFormSchema(props.schema)
const modelValue = toRef(formSchema, 'modelValue')
const errors = toRef(formSchema, 'errors')

provide('formSchema', formSchema.schema)
provide('formFields', formSchema.fields)
provide('formErrors', formSchema.errors)
provide('formValues', modelValue)
provide('hiddenFields', formSchema.fieldsToHide)
provide('hiddenGroups', formSchema.groupsFoHide)

function onSubmit () {
  const formValues = formSchema.validate()

  if (!formValues) {
    return
  }

  if (props.onSubmit) {
    return props.onSubmit(formValues)
  }

  form.value?.submit()
}

function onReset () {
  formSchema.fields.value.forEach((field: FieldSchema) => {
    modelValue.value[field.name] = field.initialValue
    field.modelValue = field.initialValue
  })

  formSchema.resetValidation()
}

function getSlotName (field: FieldSchema) {
  return ['field', field.name].join('_')
}

</script>

<template>
  <form ref="form"
        @submit.prevent="onSubmit"
        @reset.prevent="onReset">

    <template v-if="!schema">Ooops, seems you've forgot to pass the schema.</template>

    <template v-else>
      <WabGroup v-for="group in formSchema.schema.value" :key="group.name"
                :group="group"
                @update:visibility="formSchema.onUpdateGroupVisibility"
      >
        <WabField v-for="(field, i) in group.fields" :key="field.name + '_' + i"
                  :field="field"
                  :error="errors[field.name]"
                  v-model="modelValue[field.name]"
                  @update:error="formSchema.onUpdateError"
                  @update:visibility="formSchema.onUpdateFieldVisibility">

          <template v-slot:field="data" v-if="slots[getSlotName(field)]">
            <slot :name="getSlotName(field)"
                  v-bind="data as {ciao:string}">
            </slot>
          </template>

          <slot name="bottom"></slot>
        </WabField>
      </WabGroup>

      <slot name="bottom"></slot>
    </template>
  </form>
</template>

<style scoped lang="scss">

</style>
