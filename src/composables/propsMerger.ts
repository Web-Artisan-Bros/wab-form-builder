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
  function merge (ctx: any, ...props: any[]): any {
    let toReturn: any = {}
    
    props.forEach(prop => {
      if (!prop) {
        return {}
      }
      
      const cloneProp = { ...prop }
      const keys = Object.keys(prop)
      
      keys.forEach(key => {
        if (prop[key] instanceof Function) {
          cloneProp[key] = prop[key](ctx ?? {})
          return
        } else if (prop[key]?.constructor.name === 'Object') {
          cloneProp[key] = merge(ctx, toReturn[key], prop[key])
          return
        }
      })
      
      toReturn = mergeProps(toReturn, cloneProp)
    })
    
    return toReturn
  }
  
  function pick (obj: any, keys: string[]) {
    const newObj: any = {}
    
    keys.forEach(key => {
      newObj[key] = obj[key]
    })
    
    return newObj
  }
  
  function omit (obj: any, keys: string[]) {
    const newObj: any = {}
    
    Object.keys(obj).forEach(key => {
      if (!keys.includes(key)) {
        newObj[key] = obj[key]
      }
    })
    
    return newObj
  }
  
  function distinct (list: any[], key: string) {
    const toReturn: string[] = []
    
    list.forEach(item => {
      if (!toReturn.includes(item[key]) && !!item[key]) {
        toReturn.push(item[key])
      }
    })
    
    return toReturn
  }
  
  return {
    merge,
    pick,
    distinct,
    omit,
  }
}
