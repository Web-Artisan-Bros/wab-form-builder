import type { RuleExpression } from 'vee-validate'
import { bool } from 'yup'

export type IfCondition = (ctx: FieldBinding, formValues: Record<string, any>, hiddenFields: string[]) => boolean;

export interface ComputedClassContext {
  error?: string,
  value: string,
  fieldName: string,
  formValues: Record<string, any>
}

export interface ElementProps {
  [key: string]: any;
  
  _class?: (ctx: ComputedClassContext) => any;
  class?: string | string[] | Record<string, boolean>;
  style?: any;
}

export interface ElementSettings<T = null> extends T {
  props?: ElementProps;
  as?: string;
  avoid?: boolean;
}

export type FieldLabelPosition = 'before' | 'after';
export type ElementPropKey = 'group' | 'col' | 'wrapper' | 'label' | 'field' | 'error';
export type ElementPropKeyFull =
  'groupProps'
  | 'colProps'
  | 'wrapperProps'
  | 'labelProps'
  | 'fieldProps'
  | 'errorProps';

export interface HasElementProps {
  // props of the element
  props?: ElementProps;
  
  groupProps?: ElementProps;
  
  // props of each parent of the wrapper, usually the col
  colProps?: ElementProps
  
  // props of each wrapper of input and label
  wrapperProps?: ElementProps;
  
  // props of each label tag
  labelProps?: ElementProps;
  
  fieldProps?: ElementProps;
  
  // props of each error message
  errorProps?: ElementProps;
  
}

export interface FieldSchema {
  // will show a label tag before the input
  label?: string;
  name: string;
  as: string | Record<string, any>;
  options?: any[];
  optionLabel?: string,
  optionValue?: string,
  // bails?: boolean;
  // checkedValue?: any;
  // uncheckedValue?: any;
  // validateOnInput?: boolean;
  // validateOnChange?: boolean;
  // validateOnBlur?: boolean;
  // validateOnModelUpdate?: boolean;
  modelValue?: any;
  // validateOnMount?: boolean;
  // standalone?: boolean;
  // modelModifiers?: any;
  rules?: RuleExpression<any>;
  'onUpdate:modelValue'?: (e: any) => unknown;
  // keepValue?: boolean;
  props?: ElementProps;
  error?: string;
  
  // name of the group this input belongs
  group?: string;
  
  // omitting group because it will contain many fields, so I couldn't merge the settings
  settings?: Omit<FormSchemaSettings, 'field' | 'group'>;
  initialValue?: any;
  
  // conditions
  if?: IfCondition
}

export interface FieldSchemaParsed extends FieldSchema {
}

export interface FieldBinding {
  name: string;
  label: string;
  id: string;
  type?: string;
  value?: any;
  error?: string;
  modelValue?: any;
  class?: any;
  checked?: boolean;
  options?: boolean;
}

export interface GroupSchema {
  name: string;
  legend?: string
  as?: string;
  order?: number;
  props?: ElementProps & {},
  
  settings?: FormSchemaSettings;
  
  if?: (formValues: Record<string, any>, errors: Record<string, string>, hiddenFields: string[]) => boolean;
}

interface GroupSchemaParsed extends GroupSchema, Omit<FormSchemaSettings, 'group'> {
  fields: FieldSchemaParsed[];
  avoid?: boolean;
}

export interface FormSchema {
  fields: FieldSchema[];
  groups?: GroupSchema[];
  settings?: FormSchemaSettings;
  initialValues?: Record<string, any>;
}

export interface FormSchemaSettings {
  group?: ElementSettings & {},
  col?: ElementSettings & {},
  wrapper?: ElementSettings & {},
  field?: Omit<ElementSettings, 'avoid'> & Partial<FieldSchema>,
  label?: ElementSettings & {
    position?: FieldLabelPosition;
  },
  error?: ElementSettings & {}
}
