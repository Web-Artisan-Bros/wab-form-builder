<script setup lang="ts">
import type {
  ComputedClassContext,
  FieldBinding,
  FieldSchema,
  FieldSchemaParsed,
  FormSchema,
  GroupSchema
} from '@/@types/FormBuilder'
import { array, string, setLocale } from 'yup'
import WabFormBuilder from '@/components/WabFormBuilder.vue'
import { ref } from 'vue'

const initialValues = ref({
  // name: 'John Doe',
  // email: 'mario.rossi@gmail.com',
  city: 'berlin',
  gender: 'm',
  password: 'asda',
  drink: 'beer',
  approve: false
  // choose: ['sure', 'mb']
})

// must be called before schema definition
setLocale({
  // use constant translation keys for messages without values
  mixed: {
    default: 'field_invalid',
    required: (ctx) => {
      return "Si e poi?"//{ key: 'field_required', values: { min: ctx.min } }
    },
  },
  string: {
    email: 'field_invalid_email'
  },
  // use functions to generate an error object that includes the value from the schema
  number: {
    min: ({ min }) => ({ key: 'field_too_short', values: { min } }),
    max: ({ max }) => ({ key: 'field_too_big', values: { max } })
  }
})

const formSchema = ref<FormSchema>({
  settings: {
    group: {
      as: 'fieldset',
      // avoid: true,
      props: {
        class: ['grid', 'wab-group', 'mb-3']
      }
    },
    col: {
      as: 'div',
      // avoid: true,
      props: {
        class: 'md:col-6 col-12 wab-col'
      }
    },
    wrapper: {
      as: 'div',
      // avoid: true,
      props: {
        class: 'flex flex-wrapper gap-2 wab-wrapper'
      }
    },
    field: {
      as: 'input',
      // validateOnInput: false,
      props: {
        _class: (ctx) => ['wab-field', (ctx.error ? 'border-red-500' : 'border-gray-500')]
      }
    },
    label: {
      as: 'label',
      position: 'before',
      avoid: false,
      props: {
        class: 'text-500'
      }
    },
    error: {
      as: 'span',
      avoid: false,
      props: {
        class: 'text-red-500'
      }
    }
  },
  groups: [
    {
      name: '_default',
      legend: 'Default',
      order: 0,
      props: {
        class: 'default-group'
      },
      settings: {
        col: {
          as: 'div',
          props: {
            class: 'col-29'
          }
        },
        field: {
          props: {
            class: 'wab-field-from-group',
            dataGroup: 'default'
          }
        }
      }
    },
    {
      name: 'row1',
      legend: 'Dati base',
      as: 'div',
      props: {
        class: 'mb-3'
      },
      if: (formValues, errors, hiddenFields) => !hiddenFields.includes('approve') && formValues.approve
    }
  ],
  fields: [
    {
      name: 'drink',
      as: 'input',
      label: 'Water',
      props: {
        value: 'water',
        type: 'radio'
      }
    },
    {
      name: 'drink',
      as: 'input',
      label: 'Wine',
      props: {
        value: 'wine',
        type: 'radio'
      }
    },
    {
      name: 'drink',
      as: 'input',
      label: 'Beer',
      props: {
        value: 'beer',
        type: 'radio'
      }
    },
    {
      name: 'choose',
      as: 'input',
      label: 'I\'m agree',
      props: {
        type: 'checkbox',
        value: 'sure'
      }
    },
    {
      name: 'choose',
      as: 'input',
      label: 'Maybe not',
      props: {
        type: 'checkbox',
        value: 'mb'
      }
    },
    {
      name: 'approve',
      as: 'input',
      label: 'I\'m agree',
      props: {
        type: 'checkbox'
      },
      if: (ctx: FieldBinding, formValues) => formValues.drink === 'beer',
      settings: {
        label: {
          position: 'after'
        }
      }
    },
    {
      name: 'name',
      as: 'input',
      group: 'row1',
      label: 'Your Name',
      rules: string().required('Name is required'),
      props: {
        placeholder: 'Enter your name',
        type: 'text',
        class: 'name-field'
      },
      settings: {
        /*col: {
          as: 'column'
          // avoid: true
        },*/
      },
      modelValue: 'Michele'
    },
    {
      label: 'Your Email',
      name: 'email',
      // group: 'row1',
      as: 'input',
      rules: string().email().required(),
      props: {
        placeholder: 'Your Email',
        autocomplete: 'off'
      }
    },
    {
      label: 'Your Password',
      name: 'password',
      as: 'input',
      rules: string().required(),
      props: {
        placeholder: 'Enter password',
        feedback: false,
        type: 'password'
      }
    },
    {
      label: 'Genere',
      name: 'gender',
      as: 'select',
      rules: string().required(),
      props: {
        placeholder: 'Come ti definisci?',
        options: [
          { value: '', label: '-' },
          { value: 'm', label: 'Maschio' },
          { value: 'f', label: 'Femmina' },
          { value: 'o', label: 'Altro' }
        ]
      }
    },
    {
      label: 'Città',
      name: 'city',
      as: 'Dropdown',
      rules: string().required(),
      props: {
        placeholder: 'Scegli una città?',
        optionLabel: 'label',
        optionValue: 'value',
        options: [
          { label: '-', value: '' },
          { label: 'Berlin', value: 'berlin' },
          { label: 'Frankfurt', value: 'frankfurt' },
          { label: 'Hamburg', value: 'hamburg' },
          { label: 'Munich', value: 'munich' }
        ]
      }
    }
  ],
  initialValues: initialValues.value,
})

// window.formSchema = formSchema

function addGroup () {
  const field: FieldSchema = {
    name: 'row' + ((formSchema.value.groups?.length) + '1'),
    group: 'row' + ((formSchema.value.groups?.length) + '1'),
    as: 'input',
    rules: string().required(),
    props: {
      class: 'mb-3'
    }
  }

  const group = {
    name: 'row' + ((formSchema.value.groups?.length) + '1'),
    legend: 'Group ' + field.group
  }

  formSchema.value.fields.push(field)
  formSchema.value.groups?.push(group)
}

function updateLegend () {
  if (!formSchema.value.groups) {
    return
  }

  const lastIndex = formSchema.value.groups.length - 1

  formSchema.value.groups[lastIndex].legend = 'Updated'
}

function onError (errors: any) {
  console.log('errors', errors)
}

function onValue (values: any) {
  console.log('values', values)
}

function onSubmit (values: any) {
  console.log('submit', values)
}
</script>

<template>
  <button @click="addGroup">Add field</button>
  <button @click="updateLegend">UpdateLegend</button>

  <div class="m-6">
    <WabFormBuilder :schema="formSchema" :onSubmit="onSubmit">
      <template #field_name="item:FieldBinding">
        <label :for="item.id">{{ item.label }}</label>
        <InputText v-bind="item" :class="{'border-red-500': item.error}"/>
        <span v-if="item.error" class="text-red-500">{{ item.error }}</span>
      </template>

      <template #bottom>
        <button type="reset">Reset</button>
        <button type="submit">Invia</button>
        bottom template
      </template>
    </WabFormBuilder>
  </div>

</template>

<style scoped>
</style>
