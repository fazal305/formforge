export default {
  type: 'url',
  label: 'URL',
  icon: 'link',
  category: 'basic',
  defaultConfig: () => ({
    placeholder: 'https://',
    helpText: '',
    validation: { required: false, format: 'url' },
  }),
  capabilities: ['required', 'placeholder', 'helpText'],
  propertySchema: [
    { key: 'label', control: 'text', label: 'Label' },
    { key: 'name', control: 'identifier', label: 'Field name' },
    { key: 'placeholder', control: 'text', label: 'Placeholder' },
    { key: 'helpText', control: 'text', label: 'Help text' },
    { key: 'validation.required', control: 'toggle', label: 'Required' },
  ],
}
