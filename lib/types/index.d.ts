/**
 * Host loader entry for the dsh-quick-prompts plugin — runs in the DSH host
 * process. Registers the `quick-prompts` settings namespace (schemastery
 * schema + built-in starter prompts as the composition base layer) through
 * the official settings service, so prompt lists survive browser cache
 * clears and live in the user's settings document. The browser half
 * (src/client) renders the composer dock and edits this namespace.
 */
import type { Context } from '@deepseek-ai/cordis';
import z from 'schemastery';
/** Stable cordis plugin row name (matches cordis.patch.yml). */
export declare const name = "quick-prompts";
/**
 * Settings namespace of the quick-prompts capability. Spelled here rather
 * than imported so the browser half can spell the same value without
 * depending on a Host package.
 */
export declare const QUICK_PROMPTS_SETTINGS_NAMESPACE: import("@deepseek-ai/dsh-settings").SettingsNamespace;
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
/** Schema for the settings section (validated against the stored document). */
export declare const Config: z<QuickPromptsSettings>;
/** Starter features shipped as the composition base layer (user-overridable). */
export declare const DEFAULT_CATEGORIES: PromptCategory[];
/** Starter prompts shipped as the composition base layer (user-overridable). */
export declare const DEFAULT_PROMPTS: PromptItem[];
/**
 * Apply the host half: register the settings section. The section's
 * composition base carries the starter features and prompts; the web
 * settings surface (schema-driven) and the quick-prompts dock both edit the
 * same namespace.
 * @param ctx - host plugin context.
 */
export declare function apply(ctx: Context): void;
