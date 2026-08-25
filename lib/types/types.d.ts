/**
 * Shared type-only surface for dsh-quick-prompts: the settings section
 * shape, one prompt entry and one feature entry. Kept here (not in the host
 * entry) so the browser half can import the types without a Host package
 * dependency.
 */
/** A feature group: a stable id plus a user-renamable display name. */
export interface PromptCategory {
    /** Stable unique id; prompts reference it via categoryId. */
    id: string;
    /** Display name (editable in the manager). */
    name: string;
}
/** One prompt entry: unique id, chip label and the prompt template text. */
export interface PromptItem {
    /** Stable unique id (kept when the user edits label/text). */
    id: string;
    /** Chip label shown in the composer dock. */
    label: string;
    /** Prompt template; `{{name}}` spans become fill-in fields in the preview. */
    text: string;
    /** Id of the feature this prompt belongs to; '' = uncategorized. */
    categoryId: string;
}
/** The quick-prompts settings section: features plus the prompt list. */
export interface QuickPromptsSettings {
    /** Ordered feature list (dock tabs / manager left rail). */
    categories: PromptCategory[];
    /** Ordered prompt list (each prompt belongs to a categoryId). */
    prompts: PromptItem[];
}
/**
 * Normalize any stored section into the current shape, migrating legacy
 * free-form `category` strings into real feature entries (id synthesized
 * from the name, deduplicated by name). Purely derived — nothing is written
 * back until the user saves through the manager.
 * @param raw - the stored (schema-resolved) section value.
 * @returns the normalized shape.
 */
export declare function normalizeSettings(raw: QuickPromptsSettings | undefined): QuickPromptsSettings;
/** Stable settings namespace (spelled identically in the host entry). */
export declare const QUICK_PROMPTS_NAMESPACE = "quick-prompts";
