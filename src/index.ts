/**
 * Host loader entry for the dsh-quick-prompts plugin — runs in the DSH host
 * process. Registers the `quick-prompts` settings namespace (schemastery
 * schema + built-in starter prompts as the composition base layer) through
 * the official settings service, so prompt lists survive browser cache
 * clears and live in the user's settings document. The browser half
 * (src/client) renders the composer dock and edits this namespace.
 */
import type { Context } from '@deepseek-ai/cordis'
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings'
import z from 'schemastery'

/** Stable cordis plugin row name (matches cordis.patch.yml). */
export const name = 'quick-prompts'

/**
 * Settings namespace of the quick-prompts capability. Spelled here rather
 * than imported so the browser half can spell the same value without
 * depending on a Host package.
 */
export const QUICK_PROMPTS_SETTINGS_NAMESPACE = settingsNamespace('quick-prompts')

/** A feature group: a stable id plus a user-renamable display name. */
export interface PromptCategory {
  /** Stable unique id; prompts reference it via categoryId. */
  id: string
  /** Display name (editable in the manager). */
  name: string
}

/** One prompt entry: unique id, chip label and the prompt template text. */
export interface PromptItem {
  /** Stable unique id (kept when the user edits label/text). */
  id: string
  /** Chip label shown in the composer dock. */
  label: string
  /** Prompt template; `{{name}}` spans become fill-in fields in the preview. */
  text: string
  /** Id of the feature this prompt belongs to; '' = uncategorized. */
  categoryId: string
}

/** The quick-prompts settings section: features plus the prompt list. */
export interface QuickPromptsSettings {
  /** Ordered feature list (dock tabs / manager left rail). */
  categories: PromptCategory[]
  /** Ordered prompt list (each prompt belongs to a categoryId). */
  prompts: PromptItem[]
}

/** Schema for the settings section (validated against the stored document). */
export const Config: z<QuickPromptsSettings> = z.object({
  categories: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })).default([]),
  prompts: z.array(z.object({
    id: z.string(),
    label: z.string(),
    text: z.string(),
    categoryId: z.string().default(''),
  })).default([]),
})

/** Starter features shipped as the composition base layer (user-overridable). */
export const DEFAULT_CATEGORIES: PromptCategory[] = [
  { id: 'review', name: '代码审查' },
  { id: 'analysis', name: '路径分析' },
  { id: 'docs', name: '注释文档' },
  { id: 'test', name: '单元测试' },
]

/** Starter prompts shipped as the composition base layer (user-overridable). */
export const DEFAULT_PROMPTS: PromptItem[] = [
  {
    id: 'review-changes',
    label: '审查当前改动',
    categoryId: 'review',
    text: '审查当前 git 改动（git diff），重点关注：事务与回滚、幂等与并发、日志与边界条件、错误处理。请先分析所有路径，再给出结论和修改建议，最小改动。',
  },
  {
    id: 'review-pr',
    label: '审查 PR',
    categoryId: 'review',
    text: '审查当前 PR：阅读改动与上下文，先给出总体评价（改动是否聚焦、是否引入风险），再逐项指出问题与建议，最后给结论（可合并/需修改）。',
  },
  {
    id: 'path-analysis',
    label: '路径分析',
    categoryId: 'analysis',
    text: '请用 goal-path-analysis 思路分析：找出到达「{{目标}}」的全部可验证路径，判断遗漏入口、实现缺口、影响范围，先分析再动手。',
  },
  {
    id: 'java-comments',
    label: '按规范写注释',
    categoryId: 'docs',
    text: '请按项目规范为 {{文件}} 补充注释：类级、方法级、字段级，保留原逻辑，最小改动，不删除现有注释。',
  },
  {
    id: 'unit-test',
    label: '生成单元测试',
    categoryId: 'test',
    text: '为 {{类名}} 的 {{方法名}} 生成单元测试：正常路径、边界条件、异常场景；使用项目现有测试框架与命名规范，先读现有测试再写。',
  },
]

/**
 * Apply the host half: register the settings section. The section's
 * composition base carries the starter features and prompts; the web
 * settings surface (schema-driven) and the quick-prompts dock both edit the
 * same namespace.
 * @param ctx - host plugin context.
 */
export function apply(ctx: Context): void {
  installSettingsSection(ctx, QUICK_PROMPTS_SETTINGS_NAMESPACE, Config, { categories: DEFAULT_CATEGORIES, prompts: DEFAULT_PROMPTS }, {
    // The dock reads the live value through the settings scope; nothing on
    // the host side reacts to prompt edits.
    setSource: () => {},
    onChange: () => {},
  })
}
