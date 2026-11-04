/**
 * Host loader entry for the dsh-quick-prompts plugin — runs in the DSH host
 * process.
 *
 * Since DSH 0.2.x a plugin's `Config` schema *is* its settings section: the
 * settings surface renders every `.volatile()` field of the active profile
 * entry, and the browser half reads/writes that same entry through
 * `ctx.configForms`. The old `installSettingsSection(namespace, ...)` seam is
 * gone, so there is no namespace to register — but `apply` MUST still be
 * exported: cordis only accepts a module as a plugin when it resolves to a
 * function or a `{ apply }` object (`isApplicable`), and a module whose host
 * half exports only `Config` resolves to `undefined`, leaving the entry with
 * no fiber and surfacing as "failed to import".
 *
 * The browser half (src/client) renders the composer dock and edits this
 * config; starter prompts ship as the composition base layer (the entry's
 * schema defaults), so a user clearing a field re-inherits them.
 */
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type { PromptCategory, PromptItem, QuickPromptsSettings } from './types.ts'

/** Stable cordis plugin row name (matches cordis.patch.yml). */
export const name = 'quick-prompts'

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
 * Config schema for the quick-prompts settings section.
 *
 * Both lists are `.volatile()`: the settings service only projects volatile
 * fields into an editable form (`volatileForm` skips every other field), and
 * the client's `configForms` form can only write volatile paths. A volatile
 * array may not contain nested volatile fields, so the element schemas are
 * left plain.
 *
 * No declared `z<QuickPromptsSettings>` annotation: `.volatile()` makes each
 * field's OUTPUT a `Volatile<T>` wrapper (read through `.get()`), so the
 * schema is deliberately not assignable to the plain interface. The browser
 * half already treats the wire section as `QuickPromptsSettings` through
 * `configForms.get<QuickPromptsSettings>()`, which is the seam that unwraps.
 */
export const Config = z.object({
  categories: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })).default(DEFAULT_CATEGORIES).volatile(),
  prompts: z.array(z.object({
    id: z.string(),
    label: z.string(),
    text: z.string(),
    categoryId: z.string().default(''),
  })).default(DEFAULT_PROMPTS).volatile(),
})

/**
 * Activate the host half.
 *
 * Intentionally empty. The host owns no runtime behaviour any more — the
 * section's values live entirely in this entry's volatile Config, which the
 * settings service reads straight off the fiber. It exists so cordis can
 * resolve the module as a plugin at all; see the module comment.
 */
export function apply(_ctx: Context): void {
  // No host-side wiring: the Config above is the whole contract.
}
