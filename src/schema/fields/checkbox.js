/**
 * A single boolean checkbox (e.g. "I agree to the terms"), not a
 * multi-select checkbox group — that's the deferred "multiselect" type
 * (section 08), which needs array-valued storage this simpler field avoids.
 */
export default {
  type: 'checkbox',
  label: 'Checkbox',
  icon: 'check-square',
  category: 'choice',
  defaultConfig: () => ({
    helpText: '',
    defaultValue: false,
    validation: { required: false },
  }),
  capabilities: ['required', 'helpText', 'defaultValue'],
  propertySchema: [
    { key: 'label', control: 'text', label: 'Label' },
    { key: 'name', control: 'identifier', label: 'Field name' },
    { key: 'helpText', control: 'text', label: 'Help text' },
    { key: 'defaultValue', control: 'toggle', label: 'Checked by default' },
    { key: 'validation.required', control: 'toggle', label: 'Required (must be checked)' },
  ],
}
