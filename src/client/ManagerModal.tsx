/**
 * Manager modal: two-pane layout. The LEFT rail lists the features
 * (add / rename / delete), the RIGHT pane shows the prompts of the selected
 * feature (add / edit / remove / reorder / import / export). New prompts are
 * created inside the selected feature automatically — no category input on
 * the rows. Edits stage in local state and are committed to the settings
 * namespace only on Save.
 */
import { useRef, useState } from 'react'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { SettingsScope, SettingsScopeSnapshot } from '@deepseek-ai/dsh-client-runtime/client'
import type { PromptCategory, PromptItem, QuickPromptsSettings } from '../types.ts'
import { normalizeSettings } from '../types.ts'
import type { QuickPromptsKey } from './locales.ts'
import { renderHighlighted } from './PreviewModal.tsx'
import css from './quick-prompts.module.css'

export interface ManagerModalProps extends PropsLocale<'quick-prompts'> {
  /** The bound settings scope for the quick-prompts namespace. */
  scope: SettingsScope<QuickPromptsSettings>
  /** Current settings snapshot (the dock re-renders the modal on change). */
  snapshot: SettingsScopeSnapshot<QuickPromptsSettings>
  /** Close without committing staged edits. */
  onClose: () => void
}

/** Shape accepted by the import path (ids are regenerated). */
interface ImportedPrompt {
  label?: unknown
  text?: unknown
  category?: unknown
}

/** Validate one imported entry and normalize it, or return null. */
function normalizeImported(raw: ImportedPrompt): { label: string; text: string; category?: string } | null {
  if (typeof raw !== 'object' || raw === null) return null
  const label = typeof raw.label === 'string' ? raw.label.trim() : ''
  const text = typeof raw.text === 'string' ? raw.text : ''
  if (label === '' && text === '') return null
  const category = typeof raw.category === 'string' ? raw.category.trim() : ''
  return { label: label || text.slice(0, 16), text, ...(category !== '' ? { category } : {}) }
}

function newPrompt(categoryId: string): PromptItem {
  return { id: crypto.randomUUID(), label: '', text: '', categoryId }
}

function newCategory(name: string): PromptCategory {
  return { id: crypto.randomUUID(), name }
}

/** Small inline icons (no icon dependency): ↑↓ as text arrows, rest SVG. */
const ICONS = {
  up: <span className={css.arrowIcon} aria-hidden="true">↑</span>,
  down: <span className={css.arrowIcon} aria-hidden="true">↓</span>,
  trash: <svg className={css.icon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 4.5h11M6.5 4.5V3a1 1 0 011-1h1a1 1 0 011 1v1.5M4 4.5l.6 8a1.5 1.5 0 001.5 1.4h3.8a1.5 1.5 0 001.5-1.4l.6-8M6.7 7.2v4.1M9.3 7.2v4.1" /></svg>,
  rename: <svg className={css.icon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M11.3 2.7l2 2L5.5 12.5l-2.8.8.8-2.8 7.8-7.8z" /></svg>,
  add: <svg className={css.icon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>,
  done: <svg className={css.icon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5 6.5 12 13 4.5" /></svg>,
}

/**
 * The manager modal. `categories` and `prompts` are local staging copies;
 * Save commits both through `scope.set` (official settings write path,
 * revision-fenced), Cancel discards them.
 */
export function ManagerModal(props: ManagerModalProps): React.JSX.Element {
  const { scope, snapshot, onClose, t } = props
  const [staged, setStaged] = useState(() => {
    const stored = snapshot.status === 'ready' ? normalizeSettings(snapshot.value) : undefined
    return {
      categories: (stored?.categories ?? []).map((c) => ({ ...c })),
      prompts: (stored?.prompts ?? []).map((p) => ({ ...p })),
    }
  })
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const stored = snapshot.status === 'ready' ? normalizeSettings(snapshot.value) : undefined
    const categories = stored?.categories ?? []
    return categories.length > 0 ? categories[0].id : null
  })
  /** Category id being renamed inline ('' input value lives in renameDraft). */
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameDraft, setRenameDraft] = useState('')
  /** Category id being added inline ('' = no add input open). */
  const [addingCategory, setAddingCategory] = useState(false)
  const [categoryDraft, setCategoryDraft] = useState('')
  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [saving, setSaving] = useState(false)
  /** Prompt open in the dedicated editor dialog (null = no dialog open). */
  const [editor, setEditor] = useState<{ id: string; label: string; text: string } | null>(null)
  /** Delete confirmation: kind + target id + display label. */
  const [confirm, setConfirm] = useState<{ kind: 'category' | 'prompt'; id: string; label: string } | null>(null)
  const editorBackRef = useRef<HTMLPreElement>(null)

  const { categories, prompts } = staged

  const selected = categories.find((c) => c.id === selectedId) ?? null
  const selectedPrompts = prompts.filter((p) => p.categoryId === selectedId)
  const uncategorizedCount = prompts.filter((p) => p.categoryId === '').length

  const patchPrompt = (id: string, field: 'label' | 'text', value: string): void => {
    setStaged((prev) => ({ ...prev, prompts: prev.prompts.map((p) => (p.id === id ? { ...p, [field]: value } : p)) }))
    setNotice(null)
  }

  const movePrompt = (id: string, delta: -1 | 1): void => {
    setStaged((prev) => {
      const next = [...prev.prompts]
      const index = next.findIndex((p) => p.id === id)
      const target = index + delta
      if (index < 0 || target < 0 || target >= next.length) return prev
      // Only swap with a prompt inside the same feature.
      if (next[target].categoryId !== next[index].categoryId) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return { ...prev, prompts: next }
    })
    setNotice(null)
  }

  const removePrompt = (id: string): void => {
    setStaged((prev) => ({ ...prev, prompts: prev.prompts.filter((p) => p.id !== id) }))
    setNotice(null)
  }

  const addPrompt = (categoryId: string): void => {
    const item = newPrompt(categoryId)
    setStaged((prev) => ({ ...prev, prompts: [...prev.prompts, item] }))
    // A brand-new prompt opens straight into the editor dialog.
    setEditor({ id: item.id, label: item.label, text: item.text })
    setNotice(null)
  }

  /** Commit the editor dialog draft into the staged list and close it. */
  const commitEditor = (): void => {
    if (editor === null) return
    patchPrompt(editor.id, 'label', editor.label)
    patchPrompt(editor.id, 'text', editor.text)
    setEditor(null)
    setNotice(null)
  }

  const addCategory = (): void => {
    const name = categoryDraft.trim()
    if (name === '') return
    const category = newCategory(name)
    setStaged((prev) => ({ ...prev, categories: [...prev.categories, category] }))
    setSelectedId(category.id)
    setCategoryDraft('')
    setAddingCategory(false)
    setNotice(null)
  }

  const startRename = (category: PromptCategory): void => {
    setRenamingId(category.id)
    setRenameDraft(category.name)
  }

  const commitRename = (): void => {
    const id = renamingId
    const name = renameDraft.trim()
    setRenamingId(null)
    if (id === null || name === '') return
    setStaged((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === id ? { ...c, name } : c)),
    }))
    setNotice(null)
  }

  const removeCategory = (id: string): void => {
    setStaged((prev) => ({
      categories: prev.categories.filter((c) => c.id !== id),
      // Prompts of the removed feature are deleted together with it.
      prompts: prev.prompts.filter((p) => p.categoryId !== id),
    }))
    if (selectedId === id) setSelectedId(null)
    setNotice(null)
  }

  /** Run the confirmed delete (category deletes its prompts too). */
  const confirmDelete = (): void => {
    if (confirm === null) return
    if (confirm.kind === 'category') removeCategory(confirm.id)
    else removePrompt(confirm.id)
    setConfirm(null)
  }

  const doImport = (): void => {
    try {
      const parsed: unknown = JSON.parse(importText)
      if (!Array.isArray(parsed)) throw new Error('expected an array')
      const normalized = parsed.map((raw) => normalizeImported(raw as ImportedPrompt)).filter((p): p is { label: string; text: string; category?: string } => p !== null)
      if (normalized.length === 0) throw new Error('no valid entries')
      setStaged((prev) => {
        const cats = [...prev.categories]
        const byName = new Map(cats.map((c) => [c.name, c]))
        const prompts = [...prev.prompts]
        for (const entry of normalized) {
          let categoryId = selectedId ?? ''
          if (entry.category !== undefined && entry.category !== '') {
            let category = byName.get(entry.category)
            if (category === undefined) {
              category = newCategory(entry.category)
              byName.set(entry.category, category)
              cats.push(category)
            }
            categoryId = category.id
          }
          prompts.push({ id: crypto.randomUUID(), label: entry.label, text: entry.text, categoryId })
        }
        return { categories: cats, prompts }
      })
      setImportText('')
      setImportOpen(false)
      setNotice({ kind: 'ok', text: t('manager.importDone', { count: String(normalized.length) }) })
    } catch (err) {
      setNotice({ kind: 'error', text: t('manager.importError', { reason: err instanceof Error ? err.message : String(err) }) })
    }
  }

  const doExport = (): void => {
    const nameOf = new Map(categories.map((c) => [c.id, c.name]))
    const payload = prompts.map(({ label, text, categoryId }) => ({
      label,
      text,
      ...(categoryId !== '' && nameOf.has(categoryId) ? { category: nameOf.get(categoryId) } : {}),
    }))
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
      const cleanCategories = categories.filter((c) => c.name.trim() !== '')
      const cleanPrompts = prompts
        .filter((p) => p.label.trim() !== '' || p.text.trim() !== '')
        .map((p) => ({ ...p, label: p.label.trim(), categoryId: cleanCategories.some((c) => c.id === p.categoryId) ? p.categoryId : '' }))
      await scope.set('categories', cleanCategories)
      await scope.set('prompts', cleanPrompts)
      onClose()
    } catch {
      setSaving(false)
    }
  }

  const stored = snapshot.status === 'ready' ? normalizeSettings(snapshot.value) : { categories: [], prompts: [] }
  const dirty = JSON.stringify(staged) !== JSON.stringify({ categories: stored.categories, prompts: stored.prompts })

  return (
    <>
      <div className={css.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
        <div className={`${css.card} ${css.managerCard}`} role="dialog" aria-modal="true">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <p className={css.title}>{t('manager.title')}</p>
          {dirty ? <span className={css.hint}>{t('manager.dirty')}</span> : null}
        </div>

        <div className={css.managerSplit}>
          {/* ---- left rail: features ---- */}
          <div className={css.rail}>
            <div className={css.railHeader}>
              <span className={css.railTitle}>{t('manager.railTitle')}</span>
            </div>
            <div className={css.railList}>
              {categories.map((category) => (
                <div key={category.id} className={`${css.railRow}${selectedId === category.id ? ` ${css.railRowActive}` : ''}`}>
                  {renamingId === category.id ? (
                    <input
                      className={css.railInput}
                      value={renameDraft}
                      autoFocus
                      onChange={(e) => setRenameDraft(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename()
                        if (e.key === 'Escape') setRenamingId(null)
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      className={css.railButton}
                      onClick={() => setSelectedId(category.id)}
                    >
                      <span className={css.railName}>{category.name}</span>
                      <span className={css.railCount}>{String(prompts.filter((p) => p.categoryId === category.id).length)}</span>
                    </button>
                  )}
                  {renamingId !== category.id ? (
                    <span className={css.railActions}>
                      <button type="button" className={css.iconButton} title={t('manager.rename')} onClick={() => startRename(category)}>{ICONS.rename}</button>
                      <button type="button" className={`${css.iconButton} ${css.danger}`} title={t('manager.removeCategory')} onClick={() => setConfirm({ kind: 'category', id: category.id, label: category.name })}>{ICONS.trash}</button>
                    </span>
                  ) : null}
                </div>
              ))}
              {uncategorizedCount > 0 ? (
                <div className={`${css.railRow}${selectedId === '' ? ` ${css.railRowActive}` : ''}`}>
                  <button type="button" className={css.railButton} onClick={() => setSelectedId('')}>
                    <span className={css.railName}>{t('dock.uncategorized')}</span>
                    <span className={css.railCount}>{String(uncategorizedCount)}</span>
                  </button>
                </div>
              ) : null}
              {addingCategory ? (
                <div className={css.railRow}>
                  <input
                    className={css.railInput}
                    value={categoryDraft}
                    autoFocus
                    placeholder={t('manager.categoryPlaceholder')}
                    onChange={(e) => setCategoryDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addCategory()
                      if (e.key === 'Escape') { setAddingCategory(false); setCategoryDraft('') }
                    }}
                  />
                </div>
              ) : (
                <button type="button" className={css.railAdd} onClick={() => setAddingCategory(true)}>
                  {ICONS.add}
                  {t('manager.addCategory')}
                </button>
              )}
            </div>
          </div>

          {/* ---- right pane: prompts of the selected feature ---- */}
          <div className={css.pane}>
            <div className={css.paneHeader}>
              <span className={css.paneTitle}>{selected !== null ? selected.name : (selectedId === '' ? t('dock.uncategorized') : '')}</span>
              <span className={css.dockSpacer} />
              <button type="button" className={css.button} style={{ lineHeight: '20px', padding: '0 8px' }} onClick={() => { if (selectedId !== null) addPrompt(selectedId) }} disabled={selectedId === null}>
                {ICONS.add}
                {t('manager.addPrompt')}
              </button>
            </div>
            <div className={css.paneBody}>
              {selectedPrompts.length === 0 ? (
                <span className={css.hint} style={{ padding: '16px 0', textAlign: 'center' }}>
                  {selectedId === null ? t('manager.selectFeature') : t('manager.groupEmpty')}
                </span>
              ) : (
                <div className={css.list}>
                  {selectedPrompts.map((item) => (
                    <div key={item.id} className={css.row}>
                      <div className={css.rowHeader}>
                        <input
                          className={css.smallInput}
                          style={{ flex: 'none', width: 150 }}
                          value={item.label}
                          placeholder={t('manager.labelField')}
                          onChange={(e) => patchPrompt(item.id, 'label', e.target.value)}
                        />
                        <span className={css.rowActions}>
                          <button type="button" className={css.iconButton} title={t('manager.moveUp')} onClick={() => movePrompt(item.id, -1)}>{ICONS.up}</button>
                          <button type="button" className={css.iconButton} title={t('manager.moveDown')} onClick={() => movePrompt(item.id, 1)}>{ICONS.down}</button>
                          <button type="button" className={`${css.iconButton} ${css.danger}`} title={t('manager.remove')} onClick={() => setConfirm({ kind: 'prompt', id: item.id, label: item.label })}>{ICONS.trash}</button>
                        </span>
                      </div>
                      <div className={css.previewWrap}>
                        {item.text !== '' ? (
                          <pre className={css.previewBox}>{renderHighlighted(item.text)}</pre>
                        ) : (
                          <span className={css.previewEmpty}>{t('manager.textField')}</span>
                        )}
                        <button
                          type="button"
                          className={css.previewEdit}
                          title={t('preview.edit')}
                          aria-label={t('preview.edit')}
                          onClick={() => setEditor({ id: item.id, label: item.label, text: item.text })}
                        >
                          {ICONS.rename}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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

        <div className={css.actions}>
          <span className={css.hint}>{t('manager.exportHint')}</span>
          <span className={css.spacer} />
          {!importOpen ? (
            <button type="button" className={css.button} onClick={() => setImportOpen(true)}>{t('manager.import')}</button>
          ) : null}
          <button type="button" className={css.button} onClick={doExport} disabled={prompts.length === 0}>{t('manager.export')}</button>
          <button type="button" className={css.button} onClick={onClose} disabled={saving}>{t('manager.cancel')}</button>
          <button type="button" className={css.primary} disabled={saving} onClick={() => void save()}>
            {saving ? '…' : t('manager.save')}
          </button>
        </div>
      </div>
      </div>

      {/* ---- dedicated prompt editor dialog (large textarea) ---- */}
      {editor !== null ? (
        <div className={css.overlay} style={{ zIndex: 1100 }}>
          <div className={`${css.card} ${css.editorCard}`} role="dialog" aria-modal="true">
            <p className={css.title}>{t('manager.editPromptTitle')}</p>

            <div className={css.fieldSection}>
              <span className={css.label}>{t('manager.labelField')}</span>
              <input
                className={css.smallInput}
                value={editor.label}
                placeholder={t('manager.labelField')}
                onChange={(e) => setEditor((prev) => (prev === null ? prev : { ...prev, label: e.target.value }))}
              />
            </div>

            <div className={css.fieldSection}>
              <span className={css.label}>{t('manager.textField')}</span>
              <div className={css.highlightWrap}>
                <pre ref={editorBackRef} className={css.highlightBack} aria-hidden="true">{renderHighlighted(editor.text)}</pre>
                <textarea
                  className={`${css.textarea} ${css.highlightFront}`}
                  value={editor.text}
                  placeholder={t('manager.textField')}
                  onChange={(e) => setEditor((prev) => (prev === null ? prev : { ...prev, text: e.target.value }))}
                  onScroll={(e) => {
                    const back = editorBackRef.current
                    if (back) {
                      back.scrollTop = e.currentTarget.scrollTop
                      back.scrollLeft = e.currentTarget.scrollLeft
                    }
                  }}
                  spellCheck={false}
                  autoFocus
                />
              </div>
            </div>

            <div className={`${css.actions} ${css.actionsDivider}`}>
              <span className={css.hint}>{t('manager.editPromptHint')}</span>
              <span className={css.spacer} />
              <button type="button" className={css.button} onClick={() => setEditor(null)}>{t('manager.cancel')}</button>
              <button
                type="button"
                className={css.primary}
                disabled={editor.label.trim() === '' && editor.text.trim() === ''}
                onClick={commitEditor}
              >
                {t('manager.save')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {/* ---- delete confirmation dialog ---- */}
      {confirm !== null ? (
        <div className={css.overlay} style={{ zIndex: 1200 }}>
          <div className={`${css.card} ${css.confirmCard}`} role="alertdialog" aria-modal="true">
            <p className={css.title}>{t('manager.confirmDeleteTitle')}</p>
            {confirm.kind === 'category' ? (
              <span className={css.hint}>
                {t('manager.confirmDeleteCategory', {
                  name: confirm.label,
                  count: String(prompts.filter((p) => p.categoryId === confirm.id).length),
                })}
              </span>
            ) : (
              <span className={css.hint}>
                {t('manager.confirmDeletePrompt', { name: confirm.label.trim() !== '' ? confirm.label : t('manager.unnamed') })}
              </span>
            )}
            <div className={`${css.actions} ${css.actionsDivider}`}>
              <span className={css.spacer} />
              <button type="button" className={css.button} onClick={() => setConfirm(null)}>{t('manager.cancel')}</button>
              <button type="button" className={css.dangerPrimary} onClick={confirmDelete}>{t('manager.delete')}</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

/** Re-export so the dock can label the key type uniformly. */
export type ManagerLocaleKey = QuickPromptsKey
