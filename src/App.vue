<script setup lang="ts">
import WabFormBuilder from '@/components/WabFormBuilder'
import type { FieldSchema, FormSchema, GroupSchema } from '@/@types/FormBuilder'
import { array, string } from 'yup'
import usePropsMerger from '@/composables/propsMerger'
import DemoForm from '@/components/DemoForm.vue'
import { ref } from 'vue'
import { useSchemaParser } from '@/composables/schemaParser'

const propsMerger = usePropsMerger()

const initialValues = ref({
  // name: 'John Doe',
  email: 'mario.rossi@gmail.com',
  city: 'berlin',
  gender: 'm',
  password: 'asda',
  drink: 'wine'
  // choose: ['sure', 'mb']
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
      as: 'span',
      // avoid: true,
      props: {
        class: 'md:col-6 col-12 wab-col'
      }
    },
    wrapper: {
      as: 'div',
      // avoid: true,
      props: {
        class: 'flex flex-column gap-2 wab-wrapper'
      }
    },
    field: {
      as: 'input',
      // validateOnInput: false,
      props: {
        class: (ctx) => ['wab-field', (ctx.error ? 'border-red-500' : 'border-gray-500')]
        // class: 'wab-field-from-global'
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
      // as: 'aaaa',
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
    }
    /* {
       name: 'row1',
       legend: 'Dati base',
       as: 'div',
       props: {
         class: 'mb-3'
       }

     }*/
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
        col: {
          as: 'column'
          // avoid: true
        },
        label: {
          position: 'after'
        }
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

const schemaParser = useSchemaParser(formSchema.value)

// window.formSchema = formSchema

function addGroup () {
  const field: FieldSchema = {
    name: 'row' + ((schemaParser.groups.value.length) + 1),
    group: 'row' + ((schemaParser.groups.value.length) + 1),
    as: 'input',
    rules: string().required(),
    props: {
      class: 'mb-3'
    }
  }

  const group = {
    name: 'row' + ((schemaParser.groups.value.length) + 1),
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

function onSubmit () {
  console.log('submit')
}
</script>

<template>
  <button @click="addGroup">Add field</button>
  <button @click="updateLegend">UpdateLegend</button>

  <div class="m-6">
    <DemoForm :schema="formSchema">
      <template #field_name="item">
        <select v-bind="item">
          <option></option>
          <option value="Antonio">Antonio</option>
        </select>
      </template>
    </DemoForm>
    <!--    <WabFormBuilder :schema="formSchema" :onError="onError"
                        :on-value="onValue">
          <template #bottom>
            <button type="reset">Reset</button>
            <button>Invia</button>
          </template>
        </WabFormBuilder>-->
  </div>

</template>

<style scoped>
</style>
