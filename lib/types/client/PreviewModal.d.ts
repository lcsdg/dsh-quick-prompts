import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import type { PromptItem } from '../types.ts';
import type { QuickPromptsKey } from './locales.ts';
export type SyncMode = 'append' | 'replace';
/** What the modal hands back on a sync/send action. */
export interface PreviewResult {
    /** The filled, user-edited text. */
    text: string;
    /** How to place the text into the composer input (sync only). */
    mode: SyncMode;
}
export interface PreviewModalProps extends PropsLocale<'quick-prompts'> {
    /** The entry being previewed (label + template; feature linkage unused here). */
    item: Pick<PromptItem, 'id' | 'label' | 'text'>;
    /** When true, the modal was opened from the direct-send affordance. */
    fromSend?: boolean;
    /** Close without doing anything. */
    onClose: () => void;
    /** User chose "sync to input". */
    onSync: (result: PreviewResult) => void;
    /** User chose "send directly". */
    onSend: (text: string) => void;
    /** Sending in flight (the dock disables buttons while true). */
    sending?: boolean;
    /** Send failure message, when the last send failed. */
    sendError?: string | null;
}
/**
 * The preview/editor modal. Local state only: `text` is a draft copy of the
 * template, `values` holds the placeholder fills. Nothing here mutates the
 * stored prompt entry.
 */
export declare function PreviewModal(props: PreviewModalProps): React.JSX.Element;
/** Re-export so the dock can label the key type uniformly. */
export type PreviewLocaleKey = QuickPromptsKey;
