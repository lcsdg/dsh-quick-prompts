import type { ConversationSnapshot, SessionId } from '@deepseek-ai/dsh-client-runtime/client';
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import type { SettingsScope } from '@deepseek-ai/dsh-client-runtime/client';
import type { QuickPromptsSettings } from '../types.ts';
import type { QuickPromptsKey } from './locales.ts';
/** Injection face supplied by the client entry (see src/client/index.ts). */
export interface QuickPromptsInjected {
    /** Bound settings scope for the quick-prompts namespace. */
    scope: SettingsScope<QuickPromptsSettings>;
    /** Place `text` into the composer input of `sessionId`. */
    insertIntoInput: (sessionId: SessionId, text: string, mode: 'append' | 'replace') => void;
    /** Send `text` as a queued user prompt in `sessionId`; resolves to success. */
    sendPrompt: (sessionId: SessionId, text: string) => Promise<boolean>;
}
/** The InputZone owner's input share — only the draft text is needed here. */
interface DockInputState {
    readonly draft: string;
}
export interface QuickPromptsDockProps extends QuickPromptsInjected, PropsLocale<'quick-prompts'> {
    /** InputZone owner share. */
    session: ConversationSnapshot;
    /** InputZone owner share (current draft text, used for append). */
    input: DockInputState;
}
/** The composer dock. Renders nothing while settings are loading. */
export declare const QuickPromptsDock: import("react").MemoExoticComponent<(props: QuickPromptsDockProps) => React.JSX.Element | null>;
/** Re-export so the client entry can name the locale key type. */
export type DockLocaleKey = QuickPromptsKey;
export {};
