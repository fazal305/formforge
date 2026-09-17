export default {
  type: 'phone',
  label: 'Phone',
  icon: 'phone',
  category: 'basic',
  defaultConfig: () => ({
    placeholder: '',
    helpText: '',
    validation: { required: false, pattern: null },
  }),
  capabilities: ['required', 'placeholder', 'helpText', 'pattern'],
  propertySchema: [
    { key: 'label', control: 'text', label: 'Label' },
    { key: 'name', control: 'identifier', label: 'Field name' },
    { key: 'placeholder', control: 'text', label: 'Placeholder' },
    { key: 'helpText', control: 'text', label: 'Help text' },
    { key: 'validation.required', control: 'toggle', label: 'Required' },
    { key: 'validation.pattern', control: 'text', label: 'Pattern (regex)' },
  ],
}
