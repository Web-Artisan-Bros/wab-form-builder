<script setup lang="ts">
import FormBuilder from '@/components/FormBuilder'
import type { FormSchema } from '@/@types/FormBuilder'
import { array, string } from 'yup'

const formSchema: FormSchema = {
  // noWrapper: true,
  // noGroup: true,
  // noCol: true,
  // noLabel: true,
  // noErrors: true,
  labelPosition: 'before',
  labelProps: {
    class: 'text-500'
  },
  errorProps: {
    class: 'text-red-500'
  },
  wrapperProps: {
    class: 'flex flex-column gap-2'
  },
  groupProps: {
    class: ['grid'],
    as: 'fieldset'
  },
  colProps: {
    class: 'md:col-6 col-12'
  },
  fieldProps: {
    class: ({ fieldError }) => fieldError ? 'border-red-500' : 'border-gray-500'
  },
  groups: [
    {
      name: 'default',
      legend: 'Default',
      as: 'div',
      order: 0
    },
    {
      name: 'row1',
      legend: 'Dati base',
      as: 'div',
      props: {
        class: 'mb-3'
      }

    }
  ],
  fields: [
    {
      name: 'name',
      as: 'input',
      group: 'row1',
      label: 'Your Name',
      rules: string().required('Name is required'),
      props: {
        placeholder: 'Enter your name',
        type: 'text'
      }
    },
    {
      label: 'Your Email',
      name: 'email',
      group: 'row1',
      as: 'input',
      rules: string().email().required(),
      props: {
        placeholder: 'Your Email'
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
      options: [
        { value: '', label: '-' },
        { value: 'm', label: 'Maschio' },
        { value: 'f', label: 'Femmina' },
        { value: 'o', label: 'Altro' }
      ],
      props: {
        placeholder: 'Come ti definisci?'
      }
    },
    {
      label: 'Città',
      name: 'city',
      as: 'Dropdown',
      props: {
        placeholder: 'Scegli una città?',
        optionLabel: 'label',
        optionValue: 'value',
        options: [
          { label: 'Berlin', value: 'Berlin' },
          { label: 'Frankfurt', value: 'Frankfurt' },
          { label: 'Hamburg', value: 'Hamburg' },
          { label: 'Munich', value: 'Munich' }
        ]
      }
    }
  ]
}

function onErrors (errors: any) {
  // console.log(errors)
}
</script>

<template>
  <div class="grid border m-6">
    <div class="col">
      <FormBuilder :schema="formSchema" @errors="onErrors">
        <template #field_password="item">
          <input type="password" v-bind="item.field"/>
          {{ item.errors }}
        </template>

        <template #buttons>
          <button type="reset">Annulla</button>
          <button type="submit">Invia</button>
        </template>

      </FormBuilder>
    </div>
  </div>
</template>

<style scoped>
</style>
