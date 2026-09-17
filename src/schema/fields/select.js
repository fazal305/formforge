export default {
  type: 'select',
  label: 'Dropdown',
  icon: 'chevron-down',
  category: 'choice',
  defaultConfig: () => ({
    helpText: '',
    defaultValue: '',
    options: [
      { value: 'option_1', label: 'Option 1' },
      { value: 'option_2', label: 'Option 2' },
    ],
    validation: { required: false },
  }),
  capabilities: ['required', 'helpText', 'defaultValue', 'options'],
  propertySchema: [
    { key: 'label', control: 'text', label: 'Label' },
    { key: 'name', control: 'identifier', label: 'Field name' },
    { key: 'helpText', control: 'text', label: 'Help text' },
    { key: 'options', control: 'optionsList', label: 'Options' },
    { key: 'validation.required', control: 'toggle', label: 'Required' },
  ],
}
