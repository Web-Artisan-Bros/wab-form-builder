import type { ElementSettings, FieldSchemaParsed, GroupSchema } from '@/@types/FormBuilder'
import { h } from 'vue'

export class WabWrapper {
  constructor (private settings: ElementSettings, private childs: any) {}
  
  get tag () {
    return this.settings.as ?? 'div'
  }
  
  get template () {
    return h(this.tag, this.settings.props,  this.childs ?? [])
  }
}
