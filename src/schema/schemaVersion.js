/**
 * Bumped whenever the Form Schema shape changes in a way that requires
 * migrating previously-saved/exported schemas. validateSchema() and any
 * future migration step key off this, so old saves fail predictably
 * instead of being silently misread by field code that assumes new shape.
 */
export const CURRENT_SCHEMA_VERSION = 1
