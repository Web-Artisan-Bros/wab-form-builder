<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { Field } from 'vee-validate'
import type { FieldSchemaParsed } from '@/@types/FormBuilder'
import usePropsMerger from '@/composables/propsMerger'
import { isHTMLTag } from '@/composables/utils'

export default defineComponent({
  components: { Field },
  props: {
    field: { type: Object as PropType<FieldSchemaParsed>, required: true },
    tag: { type: String, required: true },
    id: { type: String, required: true },
    modelValue: { type: [String, Number, Boolean, Object, Array] }
  },
  setup (props, { attrs }) {
    const propsMerger = usePropsMerger()

    const isComponent = computed(() => !isHTMLTag(props.tag))
    const fieldProps = computed(() => {
      const toReturn = { ...props.field }

      if (!isComponent.value) {
        Object.assign(toReturn, propsMerger.omit(props.field.props, ['options']))
      } else {
        Object.assign(toReturn, props.field.props)
      }

      return toReturn
    })

    return {
      fieldProps,
      isComponent
    }
  }
})
</script>

<template>
  <Field :as="tag"
         v-slot="fieldSlot"
         v-bind="fieldProps">
    <template v-if="!isComponent && tag === 'select' && field.props?.options">
      <option :value="option[field.optionValue ?? 'value'] "
              v-for="(option, i) in field.props?.options"
              :key="'opt_'+  i + '_' + option[field.optionValue ?? 'value'] ">
        {{ option[field.optionLabel ?? 'label'] }}
      </option>
    </template>
  </Field>
</template>
