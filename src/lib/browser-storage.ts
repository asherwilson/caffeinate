export function migrateBrowserValue(currentKey: string, legacyKey: string) {
  const current = window.localStorage.getItem(currentKey);
  if (current !== null) return current;

  const legacy = window.localStorage.getItem(legacyKey);
  if (legacy !== null) {
    window.localStorage.setItem(currentKey, legacy);
    window.localStorage.removeItem(legacyKey);
  }
  return legacy;
}
