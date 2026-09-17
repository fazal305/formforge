export default {
  type: 'number',
  label: 'Number',
  icon: 'hash',
  category: 'basic',
  defaultConfig: () => ({
    placeholder: '',
    helpText: '',
    defaultValue: '',
    validation: { required: false, min: null, max: null },
  }),
  capabilities: ['required', 'placeholder', 'helpText', 'defaultValue', 'min', 'max'],
  propertySchema: [
    { key: 'label', control: 'text', label: 'Label' },
    { key: 'name', control: 'identifier', label: 'Field name' },
    { key: 'placeholder', control: 'text', label: 'Placeholder' },
    { key: 'helpText', control: 'text', label: 'Help text' },
    { key: 'validation.required', control: 'toggle', label: 'Required' },
    { key: 'validation.min', control: 'number', label: 'Minimum value' },
    { key: 'validation.max', control: 'number', label: 'Maximum value' },
  ],
}
