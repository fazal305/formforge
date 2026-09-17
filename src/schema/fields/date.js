export default {
  type: 'date',
  label: 'Date',
  icon: 'calendar',
  category: 'datetime',
  defaultConfig: () => ({
    helpText: '',
    defaultValue: '',
    validation: { required: false, min: null, max: null },
  }),
  capabilities: ['required', 'helpText', 'defaultValue', 'min', 'max'],
  propertySchema: [
    { key: 'label', control: 'text', label: 'Label' },
    { key: 'name', control: 'identifier', label: 'Field name' },
    { key: 'helpText', control: 'text', label: 'Help text' },
    { key: 'validation.required', control: 'toggle', label: 'Required' },
    { key: 'validation.min', control: 'text', label: 'Earliest date' },
    { key: 'validation.max', control: 'text', label: 'Latest date' },
  ],
}
