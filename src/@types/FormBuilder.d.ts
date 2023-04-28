export interface ElementProps {
  [key: string]: any;
  
  as?: string;
  class?: ((ctx: { fieldError: string | undefined }) => any) | string | string[] | Record<string, boolean>;
  style?: any;
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

export interface FieldSchema extends HasElementProps {
  // will show a label tag before the input
  label?: string;
  name: string;
  as: string;
  labelPosition?: FieldLabelPosition;
  rules?: any;
  options?: any[];
  
  // name of the group this input belongs
  group?: string;
}

export interface GroupSchema extends HasElementProps {
  name: string;
  legend?: string
  labelPosition?: FieldLabelPosition;
  as?: string;
  order?: number;
  
}

interface GroupSchemaWithFields extends GroupSchema {
  fields: FieldSchema[];
}

export interface FormSchema extends Omit<HasElementProps, 'props'> {
  fields: FieldSchema[];
  groups?: GroupSchema[];
  labelPosition?: FieldLabelPosition;
  noWrapper?: boolean;
  noGroup?: boolean;
  noLabel?: boolean;
  noCol?: boolean;
  noErrors?: boolean,
}
