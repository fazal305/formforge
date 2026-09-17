export default {
  type: 'hidden',
  label: 'Hidden',
  icon: 'eye-off',
  category: 'advanced',
  defaultConfig: () => ({
    defaultValue: '',
  }),
  capabilities: ['defaultValue'],
  propertySchema: [
    { key: 'name', control: 'identifier', label: 'Field name' },
    { key: 'defaultValue', control: 'text', label: 'Value' },
  ],
}
