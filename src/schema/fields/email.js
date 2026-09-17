export default {
  type: 'email',
  label: 'Email',
  icon: 'mail',
  category: 'basic',
  defaultConfig: () => ({
    placeholder: 'you@example.com',
    helpText: '',
    defaultValue: '',
    validation: { required: false, format: 'email' },
  }),
  capabilities: ['required', 'placeholder', 'helpText', 'defaultValue'],
  propertySchema: [
    { key: 'label', control: 'text', label: 'Label' },
    { key: 'name', control: 'identifier', label: 'Field name' },
    { key: 'placeholder', control: 'text', label: 'Placeholder' },
    { key: 'helpText', control: 'text', label: 'Help text' },
    { key: 'validation.required', control: 'toggle', label: 'Required' },
  ],
}
