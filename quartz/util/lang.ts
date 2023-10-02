export function pluralize(count: number, s: string): string {
  if (count === 1) {
    return `1 ${s}`
  } else {
    return `${count} ${s}s`
  }
}

export function capitalize(s: string): string {
  return s.substring(0, 1).toUpperCase() + s.substring(1)
}

export function hebrewPluralize(count:number, singular:string, plural: string): string {
  return count===1 ? `1 ${singular}` : `${count} ${plural}`
}