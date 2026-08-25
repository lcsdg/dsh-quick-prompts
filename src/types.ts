/**
 * Shared type-only surface for dsh-quick-prompts: the settings section
 * shape, one prompt entry and one feature entry. Kept here (not in the host
 * entry) so the browser half can import the types without a Host package
 * dependency.
 */

/** A feature group: a stable id plus a user-renamable display name. */
export interface PromptCategory {
  /** Stable unique id; prompts reference it via categoryId. */
  id: string
  /** Display name (editable in the manager). */
  name: string
}

/** One prompt entry: unique id, chip label and the prompt template text. */
export interface PromptItem {
  /** Stable unique id (kept when the user edits label/text). */
  id: string
  /** Chip label shown in the composer dock. */
  label: string
  /** Prompt template; `{{name}}` spans become fill-in fields in the preview. */
  text: string
  /** Id of the feature this prompt belongs to; '' = uncategorized. */
  categoryId: string
}

/** The quick-prompts settings section: features plus the prompt list. */
export interface QuickPromptsSettings {
  /** Ordered feature list (dock tabs / manager left rail). */
  categories: PromptCategory[]
  /** Ordered prompt list (each prompt belongs to a categoryId). */
  prompts: PromptItem[]
}

/**
 * Legacy prompt shape (v0.1.x): the feature was a free-form `category`
 * string on each prompt instead of a categoryId reference.
 */
interface LegacyPromptItem {
  id: string
  label: string
  text: string
  category?: string
}

/**
 * Normalize any stored section into the current shape, migrating legacy
 * free-form `category` strings into real feature entries (id synthesized
 * from the name, deduplicated by name). Purely derived — nothing is written
 * back until the user saves through the manager.
 * @param raw - the stored (schema-resolved) section value.
 * @returns the normalized shape.
 */
export function normalizeSettings(raw: QuickPromptsSettings | undefined): QuickPromptsSettings {
  const categories: PromptCategory[] = (raw?.categories ?? []).map((c) => ({ ...c }))
  const byName = new Map(categories.map((c) => [c.name, c]))
  const prompts: PromptItem[] = (raw?.prompts ?? []).map((entry) => {
    const prompt = entry as PromptItem | LegacyPromptItem
    if ('categoryId' in prompt && typeof prompt.categoryId === 'string') {
      return { id: prompt.id, label: prompt.label, text: prompt.text, categoryId: prompt.categoryId }
    }
    // Legacy: free-form category string → find or create a feature.
    const legacy = (prompt as LegacyPromptItem).category
    if (legacy !== undefined && legacy.trim() !== '') {
      let category = byName.get(legacy)
      if (category === undefined) {
        category = { id: `legacy-${legacy}`, name: legacy }
        byName.set(legacy, category)
        categories.push(category)
      }
      return { id: prompt.id, label: prompt.label, text: prompt.text, categoryId: category.id }
    }
    return { id: prompt.id, label: prompt.label, text: prompt.text, categoryId: '' }
  })
  return { categories, prompts }
}

/** Stable settings namespace (spelled identically in the host entry). */
export const QUICK_PROMPTS_NAMESPACE = 'quick-prompts'
