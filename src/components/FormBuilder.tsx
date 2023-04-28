import type { PropType, ComputedRef } from 'vue'
import type { FormSchema, GroupSchemaWithFields } from '@/@types/FormBuilder'
import type { SubmissionContext } from 'vee-validate'
import { computed, defineComponent, provide, ref, watch } from 'vue'
import { Form } from 'vee-validate'
import Field from '@/components/Field'
import Wrapper from '@/components/Wrapper'
import usePropsMerger from '@/composables/propsMerger'

export default defineComponent({
  name: 'WabFormBuilder',
  props: {
    schema: {
      type: Object as PropType<FormSchema>,
      required: true
    },
    submitFn: {
      type: Function as PropType<(values: any, ctx: SubmissionContext, form: typeof Form) => Promise<any>>
    }
  },
  emits: ['errors', 'invalidSubmit'],
  setup (props, { slots, emit }) {
    const formRef = ref()
    const errors = ref<any>({})
    const propsMerger = usePropsMerger()
    const defaultGroup = {
      name: 'default',
      fields: []
    }
    
    const groups = computed<GroupSchemaWithFields[]>(() => {
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
    
    provide('schema', props.schema)
    provide('errors', errors)
    
    watch(() => formRef.value?.getErrors(), (value) => {
      errors.value = value
      
      if (value) {
        emit('errors', value)
      }
    })
    
    const formContent = computed(() => {
      return <>{/* Rows */}
        {
          groups.value.map(group =>
            <Wrapper data={propsMerger.getProps('group', props.schema, group)}>
              
              {/* Columns */}
              {group.fields.map(field =>
                <Wrapper data={propsMerger.getProps('col', props.schema, group, field)}>
                  
                  {/*Wrapper*/}
                  <Wrapper data={propsMerger.getProps('wrapper', props.schema, group, field)}>
                    
                    {/*Field*/}
                    <Field field={field} group={group} v-slots={fieldSlots.value}></Field>
                  
                  </Wrapper>
                
                </Wrapper>
              )}
            </Wrapper>
          )
        }
        
        {slots.buttons?.()}
      </>
    })
    
    const fieldSlots = computed(() =>
      Object.keys(slots).reduce((acc, key) => {
        if (key.startsWith('field_')) {
          acc[key] = slots[key]
        }
        
        return acc
      }, {} as any)
    )
    
    /*const formSlots = computed(() => ({
      default: (item) => {
        return formContent.value
      }
    }))*/
    
    function onSubmit (values: any, ctx: SubmissionContext) {
      return props.submitFn?.(values, ctx, formRef.value)
    }
    
    return () => <Form ref={formRef}
                       onSubmit={props.submitFn ? onSubmit : undefined}
                       onInvalidSubmit={ctx => emit('invalidSubmit', ctx)}>
      {formContent.value}</Form>
  }
})
