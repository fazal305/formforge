export default {
  type: 'password',
  label: 'Password',
  icon: 'lock',
  category: 'basic',
  defaultConfig: () => ({
    placeholder: '',
    helpText: '',
    validation: { required: false, minLength: null, maxLength: null },
  }),
  capabilities: ['required', 'placeholder', 'helpText', 'minLength', 'maxLength'],
  propertySchema: [
    { key: 'label', control: 'text', label: 'Label' },
    { key: 'name', control: 'identifier', label: 'Field name' },
    { key: 'placeholder', control: 'text', label: 'Placeholder' },
    { key: 'helpText', control: 'text', label: 'Help text' },
    { key: 'validation.required', control: 'toggle', label: 'Required' },
    { key: 'validation.minLength', control: 'number', label: 'Min length' },
    { key: 'validation.maxLength', control: 'number', label: 'Max length' },
  ],
}
