export default {
  type: 'text',
  label: 'Text',
  icon: 'text',
  category: 'basic',
  defaultConfig: () => ({
    placeholder: '',
    helpText: '',
    defaultValue: '',
    validation: { required: false, minLength: null, maxLength: null, pattern: null },
  }),
  capabilities: ['required', 'placeholder', 'helpText', 'defaultValue', 'minLength', 'maxLength', 'pattern'],
  propertySchema: [
    { key: 'label', control: 'text', label: 'Label' },
    { key: 'name', control: 'identifier', label: 'Field name' },
    { key: 'placeholder', control: 'text', label: 'Placeholder' },
    { key: 'helpText', control: 'text', label: 'Help text' },
    { key: 'defaultValue', control: 'text', label: 'Default value' },
    { key: 'validation.required', control: 'toggle', label: 'Required' },
    { key: 'validation.minLength', control: 'number', label: 'Min length' },
    { key: 'validation.maxLength', control: 'number', label: 'Max length' },
    { key: 'validation.pattern', control: 'text', label: 'Pattern (regex)' },
  ],
}
