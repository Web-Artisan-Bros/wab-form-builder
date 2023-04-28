import { computed, mergeProps } from 'vue'
import type {
  ElementPropKey,
  ElementPropKeyFull,
  ElementProps,
  FieldSchema,
  FormSchema,
  GroupSchema
} from '@/@types/FormBuilder'

export default function usePropsMerger () {
  function merge (ctx: any, ...props: any[]) {
    const toReturn: any[] = []
    
    props.forEach(prop => {
      if (!prop) {
        return
      }
      
      const cloneProp = { ...prop }
      const keys = Object.keys(prop)
      
      keys.forEach(key => {
        if (prop[key] instanceof Function) {
          cloneProp[key] = prop[key](ctx)
          return
        }
      })
      
      return toReturn.push(cloneProp)
    })
    
    return mergeProps(...toReturn)
  }
  
  function getProps (key: ElementPropKey, schema: FormSchema, group?: GroupSchema, field?: FieldSchema, ctx?: any, ...attrs: any[]) {
    const keyFull: ElementPropKeyFull = key + 'Props' as any
    const globalProps: ElementProps = schema[keyFull] ?? {}
    const groupProps: ElementProps = group ? (key === 'group' ? group.props ?? {} : group[keyFull] ?? {}) : {}
    const fieldProps: ElementProps = field ? (key === 'field' ? field.props ?? {} : field[keyFull] ?? {}) : {}
    
    return merge(ctx ?? {}, globalProps, groupProps, fieldProps, ...attrs)
  }
  
  return {
    merge,
    getProps
  }
}
