<script lang="ts" setup>
import { Form } from 'vee-validate'
import { computed, onMounted, provide, ref, watch } from 'vue'
import type { ComputedRef } from 'vue'
import type { FormSchema, GroupSchemaWithFields } from '@/@types/FormBuilder'
import FormGroup from '@/components/FormGroup'
import FormColumn from '@/components/FormColumn'
import FieldWrapper from '@/components/FieldWrapper'
import Field from '@/components/Field'

const props = defineProps<{
  schema: FormSchema;
}>()
const errors = ref()

provide('schema', props.schema)
provide('errors', errors)

const form = ref()

const defaultGroup = {
  name: 'default',
  fields: []
}

const groups: ComputedRef<GroupSchemaWithFields[]> = computed(() => {
  const groups: Record<string, GroupSchemaWithFields> = {
    default: { ...defaultGroup }
  }

  props.schema.groups?.forEach(group => {
    groups[group.name] = {
      ...group,
      fields: []
    }
  })

  props.schema.fields.forEach(field => {
    let groupName = field.group || 'default'

    if (!groups[groupName]) {
      groups[groupName] = {
        ...props.schema.groups?.find(group => group.name === groupName) ?? {
          name: groupName
        },
        fields: []
      }
    }

    if (!groups[groupName].fields) {
      groups[groupName].fields = []
    }

    groups[groupName].fields?.push(field)
  })

  const groupsArray = Object.values(groups)

  return groupsArray.sort((a, b) => (a.order ?? -1) - (b.order ?? -1))
})

watch(() => form.value?.getErrors(), (value) => {
  errors.value = value
})

</script>

<template>
  <Form ref="form">
    <!-- ROW -->
    <FormGroup v-for="group in groups" :key="group.name"
               :group="group">

      <!-- COL -->
      <FormColumn v-for="field in group.fields" :key="field.name"
                  :field="field" :group="group">

        <!-- WRAPPER -->
        <FieldWrapper :field="field" :group="group">

          <!-- FIELD -->
          <Field :field="field" :group="group">
            <!--            <template #append>ciao</template>-->
            <!--            <template #prepend>ciao</template>-->
            <!--            <template #field="item">
                          <InputText type="password" v-bind="item.field"/>
                          {{ item.errors }}
                        </template>-->
          </Field>
        </FieldWrapper>
      </FormColumn>
    </FormGroup>

    <Button type="submit">Submit</Button>
  </Form>
</template>


<style scoped lang="scss">

</style>
