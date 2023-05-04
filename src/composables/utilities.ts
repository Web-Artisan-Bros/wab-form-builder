import type { FieldSchema } from '@/@types/FormBuilder'
import { mergeProps } from 'vue'

export function isHTMLEvent (e: any) {
  return e instanceof Event
}

export function isHTMLTag (tag: any) {
  if (!tag) {
    return false
  }
  
  return ['input', 'select', 'textarea'].includes(tag)
}

export function isHTMLCheckableInput (el: any) {
  if (!el) {
    return false
  }
  
  return ['checkbox', 'radio'].includes(el.type)
}

export function isArray (value: any) {
  if (!value) {
    return false
  }
  
  return Array.isArray(value)
}

export function isFunction (value: any) {
  if (!value) {
    return false
  }
  
  return value instanceof Function
}

export function fieldCount (name: string, fields: FieldSchema[]) {
  return fields.filter((field) => field.name === name).length
}

export function merge (ctx: any, ...props: any[]): any {
  let toReturn: any = {}
  
  props.forEach(prop => {
    if (!prop) {
      return {}
    }
    
    const cloneProp = { ...prop }
    const keys = Object.keys(prop)
    
    keys.forEach(key => {
      const fnName = '_' + key + 'Fn'
      
      if (key.startsWith('_')) {
        return
      }
      
      if (cloneProp[fnName]) {
        // cloneProp[key] = prop[fnName].value
        
      } else if (prop[key] instanceof Function) {
        // cloneProp[fnName] = computed(() => prop[key](ctx))
        // cloneProp[key] = prop[key](ctx ?? {})
        cloneProp[key] = prop[key]
      } else if (prop[key]?.constructor.name === 'Object') {
        cloneProp[key] = merge(ctx, toReturn[key], prop[key])
      }
    })
    
    toReturn = mergeProps(toReturn, cloneProp)
  })
  
  return toReturn
}

export function pick (obj: any, keys: string[]) {
  const newObj: any = {}
  
  if (!keys || !obj) {
    return newObj
  }
  
  keys.forEach(key => {
    newObj[key] = obj[key]
  })
  
  return newObj
}

export function omit (obj: any, keys: string[]) {
  const newObj: any = {}
  
  if (!obj) {
    return newObj
  }
  
  Object.keys(obj).forEach(key => {
    if (!keys.includes(key)) {
      newObj[key] = obj[key]
    }
  })
  
  return newObj
}

export function distinct (list: any[], key: string) {
  const toReturn: string[] = []
  
  list.forEach(item => {
    if (!toReturn.includes(item[key]) && !!item[key]) {
      toReturn.push(item[key])
    }
  })
  
  return toReturn
}
