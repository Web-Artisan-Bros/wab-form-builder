import type { SetupContext } from 'vue'

export const IS_ABSENT = Symbol('Default empty value');

type HTMLElementWithValueBinding = HTMLElement & { _value: unknown };

export function isCallable(fn: unknown): fn is (...args: any[]) => any {
  return typeof fn === 'function';
}

export function isNullOrUndefined(value: unknown): value is undefined | null {
  return value === null || value === undefined;
}

export function isEmptyArray(arr: unknown): boolean {
  return Array.isArray(arr) && arr.length === 0;
}

export const isObject = (obj: unknown): obj is Record<string, unknown> =>
  obj !== null && !!obj && typeof obj === 'object' && !Array.isArray(obj);

export const isClient = typeof window !== 'undefined'

/**
 * Checks if an tag name is a native HTML tag and not a Vue component
 */
export function isHTMLTag (tag: string) {
  return ['input', 'textarea', 'select'].includes(tag)
}

/**
 * Checks if an input is of type file
 */
export function isFileInputNode (tag: string, attrs: Record<string, unknown>) {
  return isHTMLTag(tag) && attrs.type === 'file'
}


export function hasCheckedAttr (type: unknown) {
  return type === 'checkbox' || type === 'radio'
}

export function isContainerValue (value: unknown): value is Record<string, unknown> {
  return isObject(value) || Array.isArray(value)
}

/**
 * True if the value is an empty object or array
 */
export function isEmptyContainer (value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length === 0
  }
  
  return isObject(value) && Object.keys(value).length === 0
}

/**
 * Checks if the path opted out of nested fields using `[fieldName]` syntax
 */
export function isNotNestedPath (path: string) {
  return /^\[.+\]$/i.test(path)
}

/**
 * Checks if an element is a native HTML5 multi-select input element
 */
export function isNativeMultiSelect (el: HTMLElement): el is HTMLSelectElement {
  return isNativeSelect(el) && el.multiple
}

/**
 * Checks if an element is a native HTML5 select input element
 */
export function isNativeSelect (el: HTMLElement): el is HTMLSelectElement {
  return el.tagName === 'SELECT'
}

/**
 * Checks if a tag name with attrs object will render a native multi-select element
 */
export function isNativeMultiSelectNode (tag: string, attrs: Record<string, unknown>) {
  // The falsy value array is the values that Vue won't add the `multiple` prop if it has one of these values
  const hasTruthyBindingValue =
    ![false, null, undefined, 0].includes(attrs.multiple as boolean) && !Number.isNaN(attrs.multiple)
  
  return tag === 'select' && 'multiple' in attrs && hasTruthyBindingValue
}

/**
 * Checks if a node should have a `:value` binding or not
 *
 * These nodes should not have a value binding
 * For files, because they are not reactive
 * For multi-selects because the value binding will reset the value
 */
export function shouldHaveValueBinding (tag: string, attrs: Record<string, unknown>) {
  return !isNativeMultiSelectNode(tag, attrs) && attrs.type !== 'file' && !hasCheckedAttr(attrs.type)
}

export function isFormSubmitEvent (evt: unknown): evt is Event & { target: HTMLFormElement } {
  return isEvent(evt) && (evt as any).target && 'submit' in (evt as any).target
}

export function isEvent (evt: unknown): evt is Event {
  if (!evt) {
    return false
  }
  
  if (typeof Event !== 'undefined' && isCallable(Event) && evt instanceof Event) {
    return true
  }
  
  // this is for IE and Cypress #3161
  /* istanbul ignore next */
  if (evt && (evt as Event).srcElement) {
    return true
  }
  
  return false
}

export function isPropPresent (obj: Record<string, unknown>, prop: string) {
  return prop in obj && obj[prop] !== IS_ABSENT
}

/**
 * Compares if two values are the same borrowed from:
 * https://github.com/epoberezkin/fast-deep-equal
 * We added a case for file matching since `Object.keys` doesn't work with Files.
 * */
export function isEqual (a: any, b: any) {
  if (a === b) return true
  
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (a.constructor !== b.constructor) return false
    
    // eslint-disable-next-line no-var
    var length, i, keys
    if (Array.isArray(a)) {
      length = a.length
      // eslint-disable-next-line eqeqeq
      if (length != b.length) return false
      for (i = length; i-- !== 0;) if (!isEqual(a[i], b[i])) return false
      return true
    }
    
    if (a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) return false
      for (i of a.entries()) if (!b.has(i[0])) return false
      for (i of a.entries()) if (!isEqual(i[1], b.get(i[0]))) return false
      return true
    }
    
    // We added this part for file comparison, arguably a little naive but should work for most cases.
    // #3911
    if (isFile(a) && isFile(b)) {
      if (a.size !== b.size) return false
      if (a.name !== b.name) return false
      if (a.lastModified !== b.lastModified) return false
      if (a.type !== b.type) return false
      
      return true
    }
    
    if (a instanceof Set && b instanceof Set) {
      if (a.size !== b.size) return false
      for (i of a.entries()) if (!b.has(i[0])) return false
      return true
    }
    
    if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
      length = (a as any).length
      // eslint-disable-next-line eqeqeq
      if (length != (b as any).length) return false
      for (i = length; i-- !== 0;) if ((a as any)[i] !== (b as any)[i]) return false
      return true
    }
    
    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf()
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString()
    
    keys = Object.keys(a)
    length = keys.length
    if (length !== Object.keys(b).length) return false
    
    for (i = length; i-- !== 0;) if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false
    
    for (i = length; i-- !== 0;) {
      // eslint-disable-next-line no-var
      var key = keys[i]
      
      if (!isEqual(a[key], b[key])) return false
    }
    
    return true
  }
  
  // true if both NaN, false otherwise
  // eslint-disable-next-line no-self-compare
  return a !== a && b !== b
}

export function isFile (a: unknown): a is File {
  if (!isClient) {
    return false
  }
  
  return a instanceof File
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const normalizeChildren = (
  tag: string | Record<string, unknown> | undefined,
  context: SetupContext<any>,
  slotProps: () => Record<string, unknown>
) => {
  if (!context.slots.default) {
    return context.slots.default;
  }
  
  if (typeof tag === 'string' || !tag) {
    return context.slots.default(slotProps());
  }
  
  return {
    default: () => context.slots.default?.(slotProps()),
  };
};

export function getBoundValue(el: HTMLElement): unknown {
  if (hasValueBinding(el)) {
    return el._value;
  }
  
  return undefined;
}

/**
 * Vue adds a `_value` prop at the moment on the input elements to store the REAL value on them, real values are different than the `value` attribute
 * as they do not get casted to strings unlike `el.value` which preserves user-code behavior
 */
export function hasValueBinding(el: HTMLElement): el is HTMLElementWithValueBinding {
  return '_value' in el;
}


export function normalizeEventValue(value: Event | unknown): unknown {
  if (!isEvent(value)) {
    return value;
  }
  
  const input = value.target as HTMLInputElement;
  // Vue sets the current bound value on `_value` prop
  // for checkboxes it it should fetch the value binding type as is (boolean instead of string)
  if (hasCheckedAttr(input.type) && hasValueBinding(input)) {
    return getBoundValue(input);
  }
  
  if (input.type === 'file' && input.files) {
    const files = Array.from(input.files);
    
    return input.multiple ? files : files[0];
  }
  
  if (isNativeMultiSelect(input)) {
    return Array.from(input.options)
      .filter(opt => opt.selected && !opt.disabled)
      .map(getBoundValue);
  }
  
  // makes sure we get the actual `option` bound value
  // #3440
  if (isNativeSelect(input)) {
    const selectedOption = Array.from(input.options).find(opt => opt.selected);
    
    return selectedOption ? getBoundValue(selectedOption) : input.value;
  }
  
  return input.value;
}