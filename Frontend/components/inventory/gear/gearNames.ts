export const itemType = (name: string) => name.replace(/\s+#\d+$/, '')

export function gearIllustrationType(name: string) {
  const type = itemType(name).toLowerCase().replace(/\s+/g, '-')
  return type === 'stove' ? 'camp-stove' : type
}
