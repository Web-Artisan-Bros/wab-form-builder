import type { FieldSchema } from '@/@types/FormBuilder'

export function isHTMLEvent (e: any) {
  return e instanceof Event
}

export function isHTMLTag (tag: any) {
  return ['input', 'select', 'textarea'].includes(tag)
}

export function isHTMLCheckableInput (el: any) {
  return ['checkbox', 'radio'].includes(el.type)
}

export function isArray (value: any) {
  return Array.isArray(value)
}

export function fieldCount (name: string, fields: FieldSchema[]) {
  return fields.filter((field) => field.name === name).length
}
