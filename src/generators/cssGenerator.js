/**
 * Standalone stylesheet for the exported form — deliberately independent of
 * FormForge's own design tokens (section 62: the generated project must not
 * depend on the app that generated it). Schema data never flows into this
 * file, so it needs no escaping.
 */
export function generateCss() {
  return `:root {
  --form-max-width: 640px;
  --color-text: #17171a;
  --color-text-muted: #6b6b66;
  --color-border: #d5d5d0;
  --color-accent: #2f5d50;
  --color-danger: #b3402f;
  --color-background: #ffffff;
  --radius: 6px;
  --spacing: 16px;
  font: 15px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #f5f5f3;
  color: var(--color-text);
}

.form-page {
  max-width: var(--form-max-width);
  margin: 48px auto;
  padding: 0 var(--spacing);
}

.ff-form {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 32px;
}

.ff-form[data-layout="two-column"] {
  grid-template-columns: 1fr 1fr;
}

.ff-form h1 {
  grid-column: 1 / -1;
  margin: 0;
  font-size: 22px;
}

.form-description {
  grid-column: 1 / -1;
  margin: 0;
  color: var(--color-text-muted);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  grid-column: span 2;
  min-width: 0;
}

.ff-form[data-layout="two-column"] .field {
  grid-column: span 2;
}

.field[data-width="half"] {
  grid-column: span 1;
}

.field label,
.field legend {
  font-size: 13px;
  font-weight: 600;
  padding: 0;
}

.required {
  color: var(--color-danger);
}

.field input,
.field select,
.field textarea {
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font: inherit;
  color: inherit;
  background: var(--color-background);
  width: 100%;
}

.field textarea {
  height: auto;
  padding: 8px 12px;
  resize: vertical;
}

.field input:focus-visible,
.field select:focus-visible,
.field textarea:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}

.field input[aria-invalid="true"],
.field select[aria-invalid="true"],
.field textarea[aria-invalid="true"] {
  border-color: var(--color-danger);
}

.field fieldset {
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.radio-option,
.checkbox-field {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 400;
}

.help {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-muted);
}

.field-error {
  margin: 0;
  font-size: 12px;
  color: var(--color-danger);
}

.form-status {
  grid-column: 1 / -1;
  margin: 0;
  padding: 12px;
  border-radius: var(--radius);
  font-size: 14px;
}

.form-status[data-state="success"] {
  background: #e3f1e7;
  color: #2f7a4f;
}

.form-status[data-state="error"] {
  background: #fbe7e3;
  color: var(--color-danger);
}

.submit-button {
  grid-column: 1 / -1;
  justify-self: start;
  height: 40px;
  padding: 0 20px;
  border: none;
  border-radius: var(--radius);
  background: var(--color-accent);
  color: #ffffff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .ff-form {
    grid-template-columns: 1fr;
    padding: 20px;
  }

  .ff-form[data-layout="two-column"] .field,
  .field[data-width="half"] {
    grid-column: 1 / -1;
  }
}
`
}
