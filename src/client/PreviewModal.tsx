/**
 * Preview/editor modal: shows one prompt entry, lets the user edit the
 * template text (a local draft — never written back to settings) and fill
 * any {{placeholder}} fields, then either syncs the filled text into the
 * composer input or sends it directly.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { PromptItem } from '../types.ts'
import { extractPlaceholders, fillPlaceholders } from './placeholder.ts'
import type { QuickPromptsKey } from './locales.ts'
import css from './quick-prompts.module.css'

export type SyncMode = 'append' | 'replace'

/** What the modal hands back on a sync/send action. */
export interface PreviewResult {
  /** The filled, user-edited text. */
  text: string
  /** How to place the text into the composer input (sync only). */
  mode: SyncMode
}

export interface PreviewModalProps extends PropsLocale<'quick-prompts'> {
  /** The entry being previewed (label + template; feature linkage unused here). */
  item: Pick<PromptItem, 'id' | 'label' | 'text'>
  /** When true, the modal was opened from the direct-send affordance. */
  fromSend?: boolean
  /** Close without doing anything. */
  onClose: () => void
  /** User chose "sync to input". */
  onSync: (result: PreviewResult) => void
  /** User chose "send directly". */
  onSend: (text: string) => void
  /** Sending in flight (the dock disables buttons while true). */
  sending?: boolean
  /** Send failure message, when the last send failed. */
  sendError?: string | null
}

/**
 * The preview/editor modal. Local state only: `text` is a draft copy of the
 * template, `values` holds the placeholder fills. Nothing here mutates the
 * stored prompt entry.
 */
export function PreviewModal(props: PreviewModalProps): React.JSX.Element {
  const { item, fromSend, onClose, onSync, onSend, sending, sendError, t } = props
  const [text, setText] = useState(item.text)
  const [values, setValues] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {}
    for (const field of extractPlaceholders(item.text)) out[field.name] = ''
    return out
  })
  const [mode, setMode] = useState<SyncMode>('append')
  const [editing, setEditing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing) textareaRef.current?.focus()
  }, [editing])

  const placeholders = useMemo(() => extractPlaceholders(text), [text])

  const commit = (): string => fillPlaceholders(text, values)
  const canSubmit = text.trim() !== '' && !sending

  return (
    <div className={css.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={css.card} role="dialog" aria-modal="true">
        <p className={css.title}>{t('preview.title')}</p>

        <div>
          <span className={css.label}>{t('preview.label')}</span>
          <input
            className={css.smallInput}
            value={item.label}
            readOnly
            aria-label={t('preview.label')}
          />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 4px' }}>
            <span className={css.label} style={{ margin: 0, flex: 'auto' }}>{t('preview.textHint')}</span>
            <button
              type="button"
              className={css.iconButton}
              title={editing ? t('preview.done') : t('preview.edit')}
              aria-label={editing ? t('preview.done') : t('preview.edit')}
              onClick={() => setEditing((v) => !v)}
            >
              {editing ? (
                <svg className={css.icon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg className={css.icon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M11.4 2.6a1.6 1.6 0 0 1 2 2L5.6 12.4l-3.1 1.1 1.1-3.1L11.4 2.6Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                  <path d="M10.5 3.5l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
          {editing ? (
            <textarea
              className={css.textarea}
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
              ref={textareaRef}
            />
          ) : (
            <pre className={css.previewBox}>{text}</pre>
          )}
        </div>

        {placeholders.length > 0 ? (
          <div>
            <span className={css.label}>{t('preview.placeholderSection')}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {placeholders.map((field) => (
                <div key={field.name} className={css.placeholderRow}>
                  <span className={css.placeholderName}>{`{{${field.name}}}`}</span>
                  <input
                    className={css.smallInput}
                    value={values[field.name] ?? ''}
                    placeholder={field.name}
                    onChange={(e) => setValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <span className={css.hint}>{t('preview.placeholderEmpty')}</span>
        )}

        {fromSend ? null : (
          <label className={css.hint} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={mode === 'append'}
              onChange={(e) => setMode(e.target.checked ? 'append' : 'replace')}
            />
            {mode === 'append' ? t('preview.appendMode') : t('preview.replaceMode')}
          </label>
        )}

        {sendError !== null && sendError !== undefined ? (
          <span className={css.hint} style={{ color: 'var(--dsw-alias-text-danger, #d33)' }}>{sendError}</span>
        ) : null}

        <div className={css.actions}>
          <span className={css.spacer} />
          <button type="button" className={css.button} onClick={onClose} disabled={sending}>
            {t('preview.cancel')}
          </button>
          <button
            type="button"
            className={css.primary}
            disabled={!canSubmit}
            onClick={() => onSync({ text: commit(), mode })}
          >
            {t('preview.syncToInput')}
          </button>
          <button
            type="button"
            className={css.primary}
            disabled={!canSubmit}
            onClick={() => onSend(commit())}
          >
            {sending ? '…' : t('preview.send')}
          </button>
        </div>
      </div>
    </div>
  )
}

/** Re-export so the dock can label the key type uniformly. */
export type PreviewLocaleKey = QuickPromptsKey
