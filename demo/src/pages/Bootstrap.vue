<script lang="ts" setup>
import { WabFormBuilder, FormSchema, ComputedFieldContext } from '@wab/form-builder'
import { ref } from 'vue'
import * as yup from 'yup'

const floatingLabelSettings = {
  wrapper: {
    props: {
      class: 'form-floating'
    }
  },
  label: {
    position: 'after'
  }
}

const formSchema = ref<FormSchema>({
  settings: {
    group: {
      as: 'div',
      props: {
        class: 'row '
      }
    },
    col: {
      props: {
        class: 'col-12 col-md-6 col-lg-4'
      }
    },
    wrapper: {
      props: {
        class: 'form-group mb-3'
      }
    },
    field: {
      props: {
        class: 'form-control',
        _class: ({ error, props }: ComputedFieldContext) => [props.class, (error ? 'is-invalid' : null)]
      }
    },
    label: {
      props: {
        class: 'form-label'
      }
    },
    error: {
      props: {
        class: 'invalid-feedback'
      }
    }
  },
  groups: [{
    name: 'birthFields',
    legend: 'Birth',
    if: (values: any) => !!values.includeBirth
  }, {
    name: 'addressFields',
    legend: 'Address'
  }],
  fields: [
    {
      name: 'firstName',
      as: 'input',
      label: 'First Name',
      rules: yup.string().required(),
      props: {
        placeholder: 'First Name'
      }
    },
    {
      name: 'lastName',
      as: 'input',
      label: 'Last Name',
      rules: yup.string().required(),
      props: {
        placeholder: 'Last Name',
        class: 'demo'
      }
    },
    {
      name: 'includeBirth',
      as: 'input',
      label: 'Include Birth',
      props: {
        _class: () => 'form-check-input',
        type: 'checkbox',
        disabled: ({ formValues }: ComputedFieldContext) => !formValues.lastName
      },
      settings: {
        wrapper: {
          props: {
            _class: () => 'form-check'
          }
        },
        label: {
          position: 'after',
          // avoid: true
          props: {
            class: 'form-check-label'
          }
        }
      }
    },
    {
      name: 'birthDate',
      as: 'input',
      label: 'Date of birth',
      group: 'birthFields',
      rules: yup.date().required().max('2000-01-01'),
      props: {
        type: 'date'
      },
      settings: floatingLabelSettings
    },
    {
      name: 'birthPlace',
      as: 'input',
      label: 'Place of birth',
      group: 'birthFields',
      settings: floatingLabelSettings
    },
    {
      name: 'birthPlace',
      as: 'input',
      label: 'Place of birth',
      group: 'birthFields',
      settings: floatingLabelSettings
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
          { value: 'uk', label: 'United Kingdom' }
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
    <h1>Wab Form Builder <strong>(Bootstrap)</strong></h1>

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
