<script setup lang="ts">
import FormBuilder from '@/components/FormBuilder.vue'
import type { FormSchema } from '@/@types/FormBuilder'
import { string } from 'yup'

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
    class: 'grid'
    // as: 'div'
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
      as: 'InputText',
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
      as: 'InputText',
      rules: string().email().required(),
      props: {
        placeholder: 'Your Email'
      }
    },
    {
      label: 'Your Password',
      name: 'password',
      as: 'Password',
      rules: string().required(),
      props: {
        placeholder: 'Enter password',
        feedback: false
        // type: 'password'
      }
    }
  ]
}
</script>

<template>
  <div class="grid border m-6">
    <div class="col">
      <FormBuilder :schema="formSchema"></FormBuilder>
    </div>
  </div>
</template>

<style scoped>
</style>
