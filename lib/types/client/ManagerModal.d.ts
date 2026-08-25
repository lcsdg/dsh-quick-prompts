import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import type { SettingsScope, SettingsScopeSnapshot } from '@deepseek-ai/dsh-client-runtime/client';
import type { QuickPromptsSettings } from '../types.ts';
import type { QuickPromptsKey } from './locales.ts';
export interface ManagerModalProps extends PropsLocale<'quick-prompts'> {
    /** The bound settings scope for the quick-prompts namespace. */
    scope: SettingsScope<QuickPromptsSettings>;
    /** Current settings snapshot (the dock re-renders the modal on change). */
    snapshot: SettingsScopeSnapshot<QuickPromptsSettings>;
    /** Close without committing staged edits. */
    onClose: () => void;
}
/**
 * The manager modal. `items` is a local staging copy; Save commits the whole
 * list through `scope.set('prompts', items)` (the official settings write
 * path, revision-fenced), Cancel discards it.
 */
export declare function ManagerModal(props: ManagerModalProps): React.JSX.Element;
/** Re-export so the dock can label the key type uniformly. */
export type ManagerLocaleKey = QuickPromptsKey;
