/**
 * Placeholder helpers for prompt templates. A template may contain
 * `{{name}}` spans; the preview modal turns each span into a fill-in field
 * and fills them at sync/send time. Unfilled spans stay verbatim in the
 * output, so a template is never silently corrupted.
 */

/** One distinct placeholder occurrence, in first-appearance order. */
export interface PlaceholderField {
  /** The placeholder name (trimmed, deduplicated). */
  name: string
}

/** Global pattern so callers can also use String.matchAll for highlighting. */
export const PLACEHOLDER_PATTERN = /\{\{\s*([^{}]+?)\s*\}\}/g

const PLACEHOLDER_RE = PLACEHOLDER_PATTERN

/**
 * Extract the distinct placeholder names from a template, in first-appearance
 * order (duplicates collapse to one field).
 * @param text - template text.
 * @returns distinct placeholder fields.
 */
export function extractPlaceholders(text: string): PlaceholderField[] {
  const seen = new Set<string>()
  const fields: PlaceholderField[] = []
  PLACEHOLDER_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = PLACEHOLDER_RE.exec(text)) !== null) {
    const name = match[1].trim()
    if (name !== '' && !seen.has(name)) {
      seen.add(name)
      fields.push({ name })
    }
  }
  return fields
}

/**
 * Replace every `{{name}}` span with the caller's value. Spans whose value
 * is missing or blank stay verbatim (the raw span text is preserved).
 * @param text - template text.
 * @param values - placeholder name → fill value.
 * @returns the filled text.
 */
export function fillPlaceholders(text: string, values: Record<string, string>): string {
  return text.replace(PLACEHOLDER_RE, (raw, name: string) => {
    const value = values[name.trim()]
    return value !== undefined && value.trim() !== '' ? value : raw
  })
}

/**
 * Whether a template still contains unfilled placeholders (used by the
 * direct-send path: templates with placeholders must go through the preview
 * modal so the user can fill them).
 * @param text - template text.
 * @returns true when at least one `{{name}}` span is present.
 */
export function hasPlaceholders(text: string): boolean {
  PLACEHOLDER_RE.lastIndex = 0
  return PLACEHOLDER_RE.test(text)
}
