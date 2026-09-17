export default {
  type: 'time',
  label: 'Time',
  icon: 'clock',
  category: 'datetime',
  defaultConfig: () => ({
    helpText: '',
    defaultValue: '',
    validation: { required: false },
  }),
  capabilities: ['required', 'helpText', 'defaultValue'],
  propertySchema: [
    { key: 'label', control: 'text', label: 'Label' },
    { key: 'name', control: 'identifier', label: 'Field name' },
    { key: 'helpText', control: 'text', label: 'Help text' },
    { key: 'validation.required', control: 'toggle', label: 'Required' },
  ],
}
