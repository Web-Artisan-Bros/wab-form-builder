import type { FieldSchemaParsed, GroupSchema } from '@/@types/FormBuilder'
import { defineComponent, h, ref, useSlots, watch } from 'vue'
import { WabWrapper } from '@/classes/WabWrapper'
import WabFieldComponent from '@/components/WabField.vue'

export class WabField {
  private componentInstance!: any
  
  constructor (private field: FieldSchemaParsed) {}
  
  get tag () {
    return this.field.as ?? 'div'
  }
  
  get id () {
    return 'field-' + this.field.name
  }
  
  get label () {
    if (this.field.label) {
      return h('label', {
        for: this.id
      }, this.field.label)
    }
  }
  
  get error () {
    if (this.field.settings?.error?.avoid) {
      return
    }
    
    const tag = this.field.settings?.error?.as ?? 'span'
    
    return h(tag, this.field.settings?.error?.props ?? {}, this.field.error)
  }
  
  get fieldElement () {
    const field = ref()
    
    watch(field, (value) => {
      console.log('field mounted: ' + this.field.name)
    })

    // @ts-ignore
    return h(WabFieldComponent, {
      field: this.field as any,
      tag: this.tag,
      id: this.id,
      modelValue: this.field.modelValue ?? this.field.initialValue
    }, () => [])
  }
  
  get template () {
    let toReturn = [this.fieldElement]
    
    // Add Label
    if (this.label) {
      if (this.field.settings?.label?.position === 'after') {
        toReturn.push(this.label)
      } else {
        toReturn.unshift(this.label)
      }
    }
    
    // Add error message
    if (this.error) {
      toReturn.push(this.error)
    }
    
    // addWrapper
    toReturn = this.getWrapper(toReturn)
    
    // addColumn
    toReturn = this.getColumn(toReturn)
    
    return toReturn
  }
  
  getWrapper (field: any[]): any {
    if (this.field.settings?.wrapper?.avoid) {
      return field
    }
    
    return new WabWrapper(this.field.settings?.wrapper ?? {}, field).template
  }
  
  getColumn (field: any[]): any {
    if (this.field.settings?.col?.avoid) {
      return field
    }
    
    return new WabWrapper(this.field.settings?.col ?? {}, field).template
  }
}
