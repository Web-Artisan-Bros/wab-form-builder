<script lang="ts" setup>
import { WabFormBuilder, FormSchema } from '@wab/form-builder'
import { ref } from 'vue'
import * as yup from 'yup'

const formSchema = ref<FormSchema>({
  settings: {
    group: {
      as: 'fieldset',
      props: {
        style: "border:1px solid #ccc; padding: 10px; margin-bottom: 10px;"
      }
    },
    col: {
      avoid: true
    },
    wrapper: {
      props: {
        class: 'custom-form-group'
      }
    },
    field: {
      props: {
        class: 'custom-form-control'
      }
    }
  },
  groups: [{
    name: 'birthFields',
    legend: 'Birth',
    if: (values) => !!values.includeBirth
  }, {
    name: 'addressFields',
    legend: 'Address',
  }],
  fields: [
    {
      name: 'firstName',
      as: 'input',
      label: 'First Name',
      rules: yup.string().required()
    },
    {
      name: 'lastName',
      as: 'input',
      label: 'Last Name',
      rules: yup.string().required()
    },
    {
      name: 'includeBirth',
      as: 'input',
      label: 'Include Birth',
      props: {
        type: 'checkbox'
      }
    },
    {
      name: 'birthDate',
      as: 'input',
      label: 'Date of birth',
      group: 'birthFields',
      rules: yup.date().required().max("2000-01-01"),
      props: {
        type: 'date'
      }
    },
    {
      name: 'birthPlace',
      as: 'input',
      label: 'Place of birth',
      group: 'birthFields'
    },
    {
      name: 'birthPlace',
      as: 'input',
      label: 'Place of birth',
      group: 'birthFields'
    },
    {
      name: 'address',
      as: 'input',
      label: 'Address',
      group: 'addressFields'
    },
    {
      name: 'country',
      as: 'select',
      label: 'Country',
      group: 'addressFields',
      props: {
        options: [
          { value: '', label: '-' },
          { value: 'fr', label: 'France' },
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom'}
        ]
      }
    }
  ]
})
</script>

<template>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-KK94CHFLLe+nY2dmCWGMq91rCGa5gtU4mk92HdvYe+M/SXH301p5ILy+dN9+nJOZ" crossorigin="anonymous">

  <div class="container py-5">
    <h1>Wab Form Builder <strong>(HTML5)</strong></h1>

    <WabFormBuilder :schema="formSchema">

      <template #bottom>
        <div class="mt-3 d-flex gap-3">
          <button type="reset" class="btn btn-secondary">Reset</button>
          <button type="submit" class="btn btn-primary">Submit</button>
        </div>
      </template>
    </WabFormBuilder>
  </div>
</template>

<style scoped lang="scss">

</style>
