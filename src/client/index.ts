/**
 * Browser-half entry for the dsh-quick-prompts plugin.
 *
 * Mounts one conversation surface: the `conversation.input.dock` row of
 * prompt chips above the composer. The prompt list is read from (and written
 * through) the volatile `Config` fields of the `quick-prompts` Host entry via
 * `ctx.configForms`, so it persists in the host settings document — browser
 * cache clears never touch it, and the settings page edits the same values.
 *
 * Failure policy: nothing here throws at apply time — an external plugin
 * must never take the GUI down.
 */
import type { ClientContext, SessionId, SettingsScope, SettingsScopeSnapshot } from '@deepseek-ai/dsh-client-runtime/client'
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: pulls the ui-conversation SlotMap merge (conversation.* slots)
// and the configForms Context merge (ctx.configForms).
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { claimQuickPromptsApply, releaseQuickPromptsApply } from './apply-guard.ts'
import { QuickPromptsDock, type QuickPromptsInjected } from './QuickPromptsDock.tsx'
import { en, zh, type QuickPromptsKey } from './locales.ts'
import { QUICK_PROMPTS_ENTRY_ID, type QuickPromptsSettings } from '../types.ts'

/** Locale namespace this plugin owns. */
const NS = 'quick-prompts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** quick-prompts surface copy. */
    'quick-prompts': QuickPromptsKey
  }
}

/** Services required by this plugin. */
export const inject = ['slots', 'locale', 'configForms', 'conversation', 'sessions']

/**
 * Runtime face of the per-session input shell we need (the shipped
 * SessionInputResolver interface only exposes `for(actx)`; the hub's
 * id-addressed `shell(id)` is what a session-scope-less plugin uses).
 */
interface InputShellFace {
  /** Replace the full draft (machine event; one undo step). */
  setDraft(text: string): void
  /** Published input state (current draft text for append mode). */
  state: { getSnapshot(): { draft: string } }
}

/**
 * Adapt the shared ConfigForm for this section to the SettingsScope shape the
 * dock and manager already consume.
 *
 * The snapshots are wire-compatible (a ConfigFormSnapshot carries the same
 * status/value/base/user/revision/writable fields as a SettingsScopeSnapshot),
 * and `set`/`unset` keep their scalar-field signatures. The ONE behavioural
 * difference is the write result: a SettingsScope rejected write only ever
 * threw, while a ConfigForm reports a Host refusal (stale revision, invalid
 * field) as `false` and reserves rejection for transport failure. The manager
 * detects failure purely by catching, so that boolean must be turned back into
 * a throw here — otherwise a refused save would close the dialog as if it had
 * been stored, silently discarding the edit.
 * @param form - the config form bound to the quick-prompts Host entry.
 * @returns the section scope handed to the dock.
 */
function bindSectionScope(form: ConfigForm<QuickPromptsSettings>): SettingsScope<QuickPromptsSettings> {
  /** Raise a refused write as the rejection callers already handle. */
  const assertAccepted = (accepted: boolean, field: string): void => {
    if (accepted) return
    throw new Error(`quick-prompts: the settings host refused the "${field}" write`)
  }
  return {
    getSnapshot: () => form.getSnapshot() as SettingsScopeSnapshot<QuickPromptsSettings>,
    subscribe: (listener) => form.subscribe(listener),
    set: async (field: string, value: unknown) => {
      assertAccepted(await form.set(field, value), field)
    },
    unset: async (field: string) => {
      assertAccepted(await form.unset(field), field)
    },
  }
}

/**
 * Register the quick-prompts dock and wire the input/send ports.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  // A duplicated client injection (module factory executed twice in one page
  // lifetime) would otherwise mount a second dock row.
  if (!claimQuickPromptsApply()) return
  ctx.effect(() => releaseQuickPromptsApply, 'quick-prompts: apply claim')

  ctx.effect(() => {
    try {
      return ctx.locale.register(NS, { zh, en })
    } catch {
      return () => {}
    }
  }, 'quick-prompts: dictionaries')

  // The form derives from the one shared describe mirror, so binding adds no
  // wire read of its own. Until the Host serves this entry the snapshot stays
  // `loading`/`unavailable` and the dock renders nothing.
  const scope = bindSectionScope(ctx.configForms.get<QuickPromptsSettings>(QUICK_PROMPTS_ENTRY_ID))

  /** Place text into one session's composer input (append or replace). */
  const insertIntoInput = (sessionId: SessionId, text: string, mode: 'append' | 'replace'): void => {
    try {
      const hub = ctx.conversation.input as unknown as { shell(id: SessionId): InputShellFace | undefined }
      const shell = hub.shell(sessionId)
      if (shell === undefined) return
      if (mode === 'replace') {
        shell.setDraft(text)
        return
      }
      let current = ''
      try {
        current = shell.state.getSnapshot().draft
      } catch {
        current = ''
      }
      shell.setDraft(current.trim() === '' ? text : `${current}\n${text}`)
    } catch {
      // Never take the GUI down over an input write.
    }
  }

  /** Send text as a queued user prompt in one session (chat-recovery path). */
  const sendPrompt = async (sessionId: SessionId, text: string): Promise<boolean> => {
    try {
      const binding = ctx.sessions.binding(sessionId)
      if (binding === undefined) return false
      const result = await binding.session.prompt([{ type: 'text', text }], 'queue')
      return result.ok
    } catch {
      return false
    }
  }

  const injected: QuickPromptsInjected = { scope, insertIntoInput, sendPrompt }

  ctx.slots.inject('conversation.input.dock', () => {
    try {
      return ctx.slots.register({
        name: 'conversation.input.dock',
        id: 'quick-prompts',
        order: 100,
        locale: NS,
        inject: () => injected,
      }, QuickPromptsDock)
    } catch {
      return () => {}
    }
  })
}
