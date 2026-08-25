/**
 * Browser-half entry for the dsh-quick-prompts plugin.
 *
 * Mounts one conversation surface: the `conversation.input.dock` row of
 * prompt chips above the composer. The prompt list is read from (and written
 * through) the `quick-prompts` settings namespace via ctx.settingsScope, so
 * it persists in the host settings document — browser cache clears never
 * touch it.
 *
 * Failure policy: nothing here throws at apply time — an external plugin
 * must never take the GUI down.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type QuickPromptsKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** quick-prompts surface copy. */
        'quick-prompts': QuickPromptsKey;
    }
}
/** Services required by this plugin. */
export declare const inject: string[];
/**
 * Register the quick-prompts dock and wire the input/send ports.
 * @param ctx - client root context.
 */
export declare function apply(ctx: ClientContext): void;
