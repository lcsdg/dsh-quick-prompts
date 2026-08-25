/**
 * Manager modal: full CRUD over the prompt list — add, edit, remove,
 * reorder, import (paste JSON) and export (download JSON). Edits stage in
 * local state and are committed to the settings namespace only on Save.
 */
import { useState } from 'react'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { SettingsScope, SettingsScopeSnapshot } from '@deepseek-ai/dsh-client-runtime/client'
import type { PromptItem, QuickPromptsSettings } from '../types.ts'
import type { QuickPromptsKey } from './locales.ts'
import css from './quick-prompts.module.css'

export interface ManagerModalProps extends PropsLocale<'quick-prompts'> {
  /** The bound settings scope for the quick-prompts namespace. */
  scope: SettingsScope<QuickPromptsSettings>
  /** Current settings snapshot (the dock re-renders the modal on change). */
  snapshot: SettingsScopeSnapshot<QuickPromptsSettings>
  /** Close without committing staged edits. */
  onClose: () => void
}

/** Shape accepted by the import path (label/text only; ids are regenerated). */
interface ImportedPrompt {
  label?: unknown
  text?: unknown
}

/** Validate one imported entry and normalize it, or return null. */
function normalizeImported(raw: ImportedPrompt): PromptItem | null {
  if (typeof raw !== 'object' || raw === null) return null
  const label = typeof raw.label === 'string' ? raw.label.trim() : ''
  const text = typeof raw.text === 'string' ? raw.text : ''
  if (label === '' && text === '') return null
  return { id: crypto.randomUUID(), label: label || text.slice(0, 16), text }
}

function newPrompt(): PromptItem {
  return { id: crypto.randomUUID(), label: '', text: '' }
}

/** Small inline SVG icons (no icon dependency). */
const ICONS = {
  up: <svg className={css.icon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10l4-4 4 4" /></svg>,
  down: <svg className={css.icon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6l4 4 4-4" /></svg>,
  trash: <svg className={css.icon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 4.5h11M6.5 4.5V3a1 1 0 011-1h1a1 1 0 011 1v1.5M4 4.5l.6 8a1.5 1.5 0 001.5 1.4h3.8a1.5 1.5 0 001.5-1.4l.6-8M6.7 7.2v4.1M9.3 7.2v4.1" /></svg>,
}

/**
 * The manager modal. `items` is a local staging copy; Save commits the whole
 * list through `scope.set('prompts', items)` (the official settings write
 * path, revision-fenced), Cancel discards it.
 */
export function ManagerModal(props: ManagerModalProps): React.JSX.Element {
  const { scope, snapshot, onClose, t } = props
  const [items, setItems] = useState<PromptItem[]>(() => {
    const stored = snapshot.status === 'ready' ? snapshot.value?.prompts : undefined
    return stored !== undefined && stored.length > 0 ? stored.map((p) => ({ ...p })) : []
  })
  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const patch = (id: string, field: 'label' | 'text', value: string): void => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
    setNotice(null)
  }

  const move = (index: number, delta: -1 | 1): void => {
    setItems((prev) => {
      const next = [...prev]
      const target = index + delta
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
    setNotice(null)
  }

  const remove = (id: string): void => {
    setItems((prev) => prev.filter((p) => p.id !== id))
    setNotice(null)
  }

  const add = (): void => {
    setItems((prev) => [...prev, newPrompt()])
    setNotice(null)
  }

  const doImport = (): void => {
    try {
      const parsed: unknown = JSON.parse(importText)
      if (!Array.isArray(parsed)) throw new Error('expected an array')
      const normalized = parsed
        .map((raw) => normalizeImported(raw as ImportedPrompt))
        .filter((p): p is PromptItem => p !== null)
      if (normalized.length === 0) throw new Error('no valid entries')
      setItems((prev) => [...prev, ...normalized])
      setImportText('')
      setImportOpen(false)
      setNotice({ kind: 'ok', text: t('manager.importDone', { count: String(normalized.length) }) })
    } catch (err) {
      setNotice({ kind: 'error', text: t('manager.importError', { reason: err instanceof Error ? err.message : String(err) }) })
    }
  }

  const doExport = (): void => {
    const payload = items.map(({ label, text }) => ({ label, text }))
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'quick-prompts.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const save = async (): Promise<void> => {
    if (saving) return
    setSaving(true)
    try {
      const clean = items.filter((p) => p.label.trim() !== '' || p.text.trim() !== '').map((p) => ({ ...p, label: p.label.trim() }))
      await scope.set('prompts', clean)
      onClose()
    } catch {
      setSaving(false)
    }
  }

  const dirty = JSON.stringify(items) !== JSON.stringify(snapshot.status === 'ready' ? (snapshot.value?.prompts ?? []) : [])

  return (
    <div className={css.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={css.card} role="dialog" aria-modal="true" style={{ width: 'min(640px, calc(100vw - 48px))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <p className={css.title}>{t('manager.title')}</p>
          {dirty ? <span className={css.hint}>{t('manager.dirty')}</span> : null}
        </div>

        <div className={css.managerBody}>
          {items.length === 0 ? (
            <span className={css.hint} style={{ padding: '12px 0', textAlign: 'center' }}>{t('manager.empty')}</span>
          ) : (
            <div className={css.list}>
              {items.map((item, index) => (
                <div key={item.id} className={css.row}>
                  <div className={css.rowHeader}>
                    <span className={css.rowIndex}>{String(index + 1)}</span>
                    <input
                      className={css.smallInput}
                      style={{ flex: 'none', width: 160 }}
                      value={item.label}
                      placeholder={t('manager.labelField')}
                      onChange={(e) => patch(item.id, 'label', e.target.value)}
                    />
                    <span className={css.rowActions}>
                      <button type="button" className={css.iconButton} title={t('manager.moveUp')} disabled={index === 0} onClick={() => move(index, -1)}>{ICONS.up}</button>
                      <button type="button" className={css.iconButton} title={t('manager.moveDown')} disabled={index === items.length - 1} onClick={() => move(index, 1)}>{ICONS.down}</button>
                      <button type="button" className={`${css.iconButton} ${css.danger}`} title={t('manager.remove')} onClick={() => remove(item.id)}>{ICONS.trash}</button>
                    </span>
                  </div>
                  <textarea
                    className={css.textarea}
                    style={{ minHeight: 64 }}
                    value={item.text}
                    placeholder={t('manager.textField')}
                    onChange={(e) => patch(item.id, 'text', e.target.value)}
                    spellCheck={false}
                  />
                </div>
              ))}
            </div>
          )}

          <div className={css.addRow}>
            <button type="button" className={css.button} onClick={add}>{t('manager.add')}</button>
          </div>

          {importOpen ? (
            <div className={css.importZone}>
              <input
                className={css.importTextarea}
                value={importText}
                placeholder={t('manager.importPlaceholder')}
                onChange={(e) => setImportText(e.target.value)}
                spellCheck={false}
              />
              <button type="button" className={css.primary} disabled={importText.trim() === ''} onClick={doImport}>{t('manager.import')}</button>
              <button type="button" className={css.button} onClick={() => { setImportOpen(false); setImportText('') }}>{t('preview.cancel')}</button>
            </div>
          ) : null}

          {notice !== null ? (
            <span className={css.hint} style={notice.kind === 'error' ? { color: 'var(--dsw-alias-text-danger, #d33)' } : undefined}>{notice.text}</span>
          ) : null}
        </div>

        <div className={css.actions}>
          <span className={css.hint}>{t('manager.exportHint')}</span>
          <span className={css.spacer} />
          {!importOpen ? (
            <button type="button" className={css.button} onClick={() => setImportOpen(true)}>{t('manager.import')}</button>
          ) : null}
          <button type="button" className={css.button} onClick={doExport} disabled={items.length === 0}>{t('manager.export')}</button>
          <button type="button" className={css.button} onClick={onClose} disabled={saving}>{t('manager.cancel')}</button>
          <button type="button" className={css.primary} disabled={saving} onClick={() => void save()}>
            {saving ? '…' : t('manager.save')}
          </button>
        </div>
      </div>
    </div>
  )
}

/** Re-export so the dock can label the key type uniformly. */
export type ManagerLocaleKey = QuickPromptsKey
