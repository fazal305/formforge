/** Dot-path get/set, shared by the reducer (writes) and the properties panel (reads). */

export function getPath(obj, path) {
  return path.split('.').reduce((value, key) => value?.[key], obj)
}

export function setPath(obj, path, value) {
  const keys = path.split('.')
  if (keys.length === 1) return { ...obj, [keys[0]]: value }

  const [head, ...rest] = keys
  return { ...obj, [head]: setPath(obj[head] ?? {}, rest.join('.'), value) }
}
