/**
 * Generates a self-contained script.js: a plain-JS port of the same rule
 * interpreter as src/validation/rules.js (section 17 — this is the UX half;
 * the PHP generator, Phase 8, independently re-checks the same rules
 * server-side rather than trusting this ran). Field metadata is embedded
 * via JSON.stringify, never string-concatenated, so a label or option value
 * containing quotes or backslashes can't break out of the script.
 */
export function generateJs(schema) {
  const fieldsMeta = schema.fields
    .filter((f) => f.type !== 'hidden')
    .map((f) => ({
      id: f.id,
      name: f.name,
      type: f.type,
      validation: f.validation ?? {},
      fileConfig: f.fileConfig ?? null,
    }))

  const hasFileField = fieldsMeta.some((f) => f.type === 'file')

  return `(function () {
  "use strict";

  var FIELDS = ${JSON.stringify(fieldsMeta, null, 2)};
  var FORM_ID = ${JSON.stringify(schema.id)};
  var SUCCESS_MESSAGE = ${JSON.stringify(schema.settings.successMessage)};
  var ERROR_MESSAGE = ${JSON.stringify(schema.settings.errorMessage)};
  var SUBMIT_LABEL = ${JSON.stringify(schema.settings.submitLabel)};

  var form = document.getElementById(FORM_ID);
  if (!form) return;
  var statusEl = document.getElementById("form-status");
  var submitButton = form.querySelector(".submit-button");

  // --- Validation rules (mirrors the FormForge validation engine) ---

  function isEmpty(field, value) {
    if (field.type === "checkbox") return value !== true;
    if (field.type === "file") return !value || (Array.isArray(value) && value.length === 0);
    return value === undefined || value === null || String(value).trim() === "";
  }

  function checkEmailFormat(value) {
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value) ? null : "Enter a valid email address.";
  }

  function checkUrlFormat(value) {
    try {
      new URL(value);
      return null;
    } catch (e) {
      return "Enter a valid URL, including https://.";
    }
  }

  function checkMinLength(value, min) {
    return String(value).length < min ? "Must be at least " + min + " characters." : null;
  }

  function checkMaxLength(value, max) {
    return String(value).length > max ? "Must be no more than " + max + " characters." : null;
  }

  function checkNumericMin(value, min) {
    var num = Number(value);
    if (isNaN(num)) return "Enter a number.";
    return num < min ? "Must be at least " + min + "." : null;
  }

  function checkNumericMax(value, max) {
    var num = Number(value);
    if (isNaN(num)) return "Enter a number.";
    return num > max ? "Must be no more than " + max + "." : null;
  }

  function checkDateMin(value, min) {
    return new Date(value) < new Date(min) ? "Date must be on or after " + min + "." : null;
  }

  function checkDateMax(value, max) {
    return new Date(value) > new Date(max) ? "Date must be on or before " + max + "." : null;
  }

  function checkPattern(value, pattern) {
    try {
      return new RegExp(pattern).test(String(value)) ? null : "Value does not match the required format.";
    } catch (e) {
      return null;
    }
  }

  function fileExtension(filename) {
    var match = /\\.[^.]+$/.exec(filename);
    return match ? match[0].toLowerCase() : "";
  }

  function checkFileConfig(value, fileConfig) {
    var files = !value ? [] : Array.isArray(value) ? value : [value];
    if (files.length === 0) return null;
    if (!fileConfig.multiple && files.length > 1) return "Only one file can be uploaded.";

    var allowed = (fileConfig.accept || "")
      .split(",")
      .map(function (ext) { return ext.trim().toLowerCase(); })
      .filter(Boolean);

    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      if (allowed.length > 0 && allowed.indexOf(fileExtension(file.name)) === -1) {
        return "Only these file types are allowed: " + fileConfig.accept;
      }
      if (fileConfig.maxSizeBytes && file.size > fileConfig.maxSizeBytes) {
        return "File must be smaller than " + Math.round(fileConfig.maxSizeBytes / (1024 * 1024)) + " MB.";
      }
    }
    return null;
  }

  function validateFieldValue(field, value) {
    var validation = field.validation || {};

    if (validation.required && isEmpty(field, value)) return "This field is required.";
    if (isEmpty(field, value)) return null;

    if (validation.format === "email") {
      var emailError = checkEmailFormat(value);
      if (emailError) return emailError;
    }
    if (validation.format === "url") {
      var urlError = checkUrlFormat(value);
      if (urlError) return urlError;
    }
    if (validation.minLength != null) {
      var minLenError = checkMinLength(value, validation.minLength);
      if (minLenError) return minLenError;
    }
    if (validation.maxLength != null) {
      var maxLenError = checkMaxLength(value, validation.maxLength);
      if (maxLenError) return maxLenError;
    }
    if (validation.min != null) {
      var minError = field.type === "date" ? checkDateMin(value, validation.min) : checkNumericMin(value, validation.min);
      if (minError) return minError;
    }
    if (validation.max != null) {
      var maxError = field.type === "date" ? checkDateMax(value, validation.max) : checkNumericMax(value, validation.max);
      if (maxError) return maxError;
    }
    if (validation.pattern) {
      var patternError = checkPattern(value, validation.pattern);
      if (patternError) return patternError;
    }
    if (field.type === "file" && field.fileConfig) {
      var fileError = checkFileConfig(value, field.fileConfig);
      if (fileError) return fileError;
    }
    return null;
  }

  // --- DOM wiring ---

  function getControl(field) {
    return form.querySelector('[name="' + field.name.replace(/"/g, '\\\\"') + '"]');
  }

  function getValue(field) {
    if (field.type === "checkbox") {
      var box = getControl(field);
      return box ? box.checked : false;
    }
    if (field.type === "radio") {
      var checked = form.querySelector('input[name="' + field.name.replace(/"/g, '\\\\"') + '"]:checked');
      return checked ? checked.value : "";
    }
    if (field.type === "file") {
      var input = getControl(field);
      if (!input || !input.files) return null;
      return field.fileConfig && field.fileConfig.multiple ? Array.from(input.files) : input.files[0] || null;
    }
    var control = getControl(field);
    return control ? control.value : "";
  }

  function setFieldError(field, message) {
    var errorEl = document.getElementById(field.id + "-error");
    var control = getControl(field);
    if (errorEl) {
      errorEl.textContent = message || "";
      errorEl.hidden = !message;
    }
    if (control) control.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function validateAll() {
    var errors = {};
    FIELDS.forEach(function (field) {
      var message = validateFieldValue(field, getValue(field));
      setFieldError(field, message);
      if (message) errors[field.id] = message;
    });
    return errors;
  }

  FIELDS.forEach(function (field) {
    var control = getControl(field);
    if (!control) return;
    control.addEventListener("blur", function () {
      setFieldError(field, validateFieldValue(field, getValue(field)));
    });
  });

  function setStatus(state, message) {
    if (!statusEl) return;
    statusEl.hidden = !message;
    statusEl.textContent = message || "";
    statusEl.setAttribute("data-state", state || "");
  }

  function buildPayload() {
    // Built from FormData (the actual DOM state) rather than FIELDS, so
    // hidden-field values are included — FIELDS deliberately excludes
    // hidden fields (they have nothing to validate or wire a blur handler
    // to), but they still need to reach the server.
    ${hasFileField
      ? 'var data = new FormData(form);\n    return { body: data, headers: {} };'
      : 'var formData = new FormData(form);\n    var values = {};\n    formData.forEach(function (value, key) { values[key] = value; });\n    return { body: JSON.stringify(values), headers: { "Content-Type": "application/json" } };'}
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var errors = validateAll();
    if (Object.keys(errors).length > 0) {
      setStatus("error", "Please fix the errors above and try again.");
      return;
    }

    setStatus(null, "");
    submitButton.disabled = true;
    submitButton.textContent = "Submitting…";

    var payload = buildPayload();
    fetch(form.getAttribute("action"), {
      method: form.getAttribute("method") || "POST",
      headers: payload.headers,
      body: payload.body,
    })
      .then(function (response) {
        if (!response.ok) throw new Error("Request failed with status " + response.status);
        setStatus("success", SUCCESS_MESSAGE);
        form.reset();
      })
      .catch(function () {
        setStatus("error", ERROR_MESSAGE);
      })
      .finally(function () {
        submitButton.disabled = false;
        submitButton.textContent = SUBMIT_LABEL;
      });
  });
})();
`
}
