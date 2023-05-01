import type { FormSchemaSettings, GroupSchema, GroupSchemaParsed } from '@/@types/FormBuilder'
import { h } from 'vue'
import { WabField } from '@/classes/WabField'

export class WabGroup {
  constructor (private group: GroupSchemaParsed, private settings: FormSchemaSettings = {}) {}
  
  get tag () {
    return this.group.as ?? 'div'
  }
  
  get legend () {
    if (this.group.legend) {
      return h('legend', this.group.legend)
    }
  }
  
  get fields () {
    return this.group.fields.map(field => {
      return new WabField(field).template
    })
  }
  
  get childs () {
    const toReturn = []
    
    if (this.legend && !this.settings?.group?.avoid) {
      toReturn.push(this.legend)
    }
    
    if (this.fields) {
      toReturn.push(this.fields)
    }
    
    return toReturn
  }
  
  get template () {
    if (this.settings?.group?.avoid) {
      return this.childs
    }
    
    return h(this.tag, this.group.props, this.childs)
  }
}
