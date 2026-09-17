export default {
  type: 'file',
  label: 'File upload',
  icon: 'upload',
  category: 'advanced',
  defaultConfig: () => ({
    helpText: '',
    validation: { required: false },
    fileConfig: {
      accept: '.pdf,.jpg,.jpeg,.png',
      maxSizeBytes: 5 * 1024 * 1024,
      multiple: false,
    },
  }),
  capabilities: ['required', 'helpText', 'accept', 'maxSize', 'multiple'],
  propertySchema: [
    { key: 'label', control: 'text', label: 'Label' },
    { key: 'name', control: 'identifier', label: 'Field name' },
    { key: 'helpText', control: 'text', label: 'Help text' },
    { key: 'fileConfig', control: 'fileConfig', label: 'File restrictions' },
    { key: 'validation.required', control: 'toggle', label: 'Required' },
  ],
}
