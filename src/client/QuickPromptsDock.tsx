/**
 * The quick-prompts composer dock: a row of prompt chips above the composer.
 *
 * - Click a chip → preview/editor modal (edit the template for this one use,
 *   fill {{placeholders}}, then sync into the input or send directly).
 * - Click the paper-plane that appears on chip hover → send directly, unless
 *   the template has {{placeholders}} (then the preview modal opens so the
 *   user can fill them).
 * - The gear opens the manager modal (add/edit/remove/reorder/import/export).
 */
import { memo, useEffect, useState } from 'react'
import type { ConversationSnapshot, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { SettingsScope } from '@deepseek-ai/dsh-client-runtime/client'
import type { PromptItem, QuickPromptsSettings } from '../types.ts'
import { hasPlaceholders } from './placeholder.ts'
import { PreviewModal, type PreviewResult } from './PreviewModal.tsx'
import { ManagerModal } from './ManagerModal.tsx'
import type { QuickPromptsKey } from './locales.ts'
import css from './quick-prompts.module.css'

/** What the dock hands to the preview modal. */
interface PreviewState {
  item: PromptItem
  /** Opened from the direct-send affordance (hides the append/replace toggle). */
  fromSend: boolean
}

/** Injection face supplied by the client entry (see src/client/index.ts). */
export interface QuickPromptsInjected {
  /** Bound settings scope for the quick-prompts namespace. */
  scope: SettingsScope<QuickPromptsSettings>
  /** Place `text` into the composer input of `sessionId`. */
  insertIntoInput: (sessionId: SessionId, text: string, mode: 'append' | 'replace') => void
  /** Send `text` as a queued user prompt in `sessionId`; resolves to success. */
  sendPrompt: (sessionId: SessionId, text: string) => Promise<boolean>
}

/** The InputZone owner's input share — only the draft text is needed here. */
interface DockInputState {
  readonly draft: string
}

export interface QuickPromptsDockProps
  extends QuickPromptsInjected,
  PropsLocale<'quick-prompts'> {
  /** InputZone owner share. */
  session: ConversationSnapshot
  /** InputZone owner share (current draft text, used for append). */
  input: DockInputState
}

const SEND_ICON = (
  <svg className={css.sendIcon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 1.5L7 9M14.5 1.5L10 14.5l-3-5.5-5.5-3 13-4.5z" />
  </svg>
)

const GEAR_ICON = (
  <svg className={css.gearIcon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="2.2" />
    <path d="M8 1.8v2M8 12.2v2M1.8 8h2M12.2 8h2M3.6 3.6l1.4 1.4M11 11l1.4 1.4M12.4 3.6L11 5M5 11l-1.4 1.4" />
  </svg>
)

/** The composer dock row. Renders nothing while settings are loading. */
export const QuickPromptsDock = memo(function QuickPromptsDock(props: QuickPromptsDockProps): React.JSX.Element | null {
  const { scope, insertIntoInput, sendPrompt, session, t } = props
  const [snapshot, setSnapshot] = useState(() => scope.getSnapshot())
  const [preview, setPreview] = useState<PreviewState | null>(null)
  const [managerOpen, setManagerOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  useEffect(() => scope.subscribe(() => setSnapshot(scope.getSnapshot())), [scope])

  const prompts = snapshot.status === 'ready' ? (snapshot.value?.prompts ?? []) : []

  // While the namespace is still loading (or unavailable), keep the dock out
  // of the way instead of flashing an empty row.
  if (snapshot.status !== 'ready') return null

  const openPreview = (item: PromptItem, fromSend: boolean): void => {
    setSendError(null)
    setPreview({ item, fromSend })
  }

  const handleSend = async (item: PromptItem): Promise<void> => {
    // Templates with placeholders must be filled first — route to the modal.
    if (hasPlaceholders(item.text)) {
      openPreview(item, true)
      return
    }
    setSending(true)
    setSendError(null)
    const ok = await sendPrompt(session.sessionId, item.text)
    setSending(false)
    if (!ok) setSendError('send-failed')
  }

  const handleSync = (result: PreviewResult): void => {
    insertIntoInput(session.sessionId, result.text, result.mode)
    setPreview(null)
  }

  const handleSendFromModal = async (text: string): Promise<void> => {
    setSending(true)
    setSendError(null)
    const ok = await sendPrompt(session.sessionId, text)
    setSending(false)
    if (ok) {
      setPreview(null)
    } else {
      setSendError(t('preview.sendFailed', { reason: '' }))
    }
  }

  return (
    <>
      <div className={css.dock} role="toolbar" aria-label="quick prompts">
        <span className={css.dockTag} title="quick prompts">
          <svg className={css.dockTagIcon} viewBox="0 0 16 16" fill="currentColor">
            <path d="M9.2 1L3 9.2h3.6L6 15l6.2-8.2H8.6L9.2 1z" />
          </svg>
          {t('dock.title')}
        </span>
        {prompts.map((item) => (
          <button
            key={item.id}
            type="button"
            className={css.chip}
            title={hasPlaceholders(item.text) ? t('pill.placeholderHint') : t('pill.preview')}
            onClick={() => openPreview(item, false)}
          >
            <span className={css.chipLabel}>{item.label || '…'}</span>
            <span
              role="button"
              tabIndex={0}
              className={css.sendButton}
              title={t('pill.send')}
              onClick={(e) => {
                e.stopPropagation()
                void handleSend(item)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  void handleSend(item)
                }
              }}
            >
              {SEND_ICON}
            </span>
          </button>
        ))}
        <button
          type="button"
          className={css.gear}
          title={t('dock.manage')}
          onClick={() => setManagerOpen(true)}
        >
          {GEAR_ICON}
        </button>
        {prompts.length === 0 ? (
          <span className={css.dockHint}>{t('manager.empty')}</span>
        ) : null}
      </div>

      {preview !== null ? (
        <PreviewModal
          item={preview.item}
          fromSend={preview.fromSend}
          t={t}
          sending={sending}
          sendError={sendError}
          onClose={() => setPreview(null)}
          onSync={handleSync}
          onSend={(text) => void handleSendFromModal(text)}
        />
      ) : null}

      {managerOpen ? (
        <ManagerModal
          scope={scope}
          snapshot={snapshot}
          t={t}
          onClose={() => setManagerOpen(false)}
        />
      ) : null}
    </>
  )
})

/** Re-export so the client entry can name the locale key type. */
export type DockLocaleKey = QuickPromptsKey
