/**
 * Shared type-only surface for dsh-quick-prompts: the settings section
 * shape and one prompt entry. Kept here (not in the host entry) so the
 * browser half can import the types without a Host package dependency.
 */

/** One prompt entry: unique id, chip label and the prompt template text. */
export interface PromptItem {
  /** Stable unique id (kept when the user edits label/text). */
  id: string
  /** Chip label shown in the composer dock. */
  label: string
  /** Prompt template; `{{name}}` spans become fill-in fields in the preview. */
  text: string
}

/** The quick-prompts settings section: an ordered prompt list. */
export interface QuickPromptsSettings {
  prompts: PromptItem[]
}

/** Stable settings namespace (spelled identically in the host entry). */
export const QUICK_PROMPTS_NAMESPACE = 'quick-prompts'
