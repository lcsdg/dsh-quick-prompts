import { installSettingsSection, settingsNamespace } from "@deepseek-ai/dsh-settings";
import z from "schemastery";
//#region src/index.ts
/** Stable cordis plugin row name (matches cordis.patch.yml). */
const name = "quick-prompts";
/**
* Settings namespace of the quick-prompts capability. Spelled here rather
* than imported so the browser half can spell the same value without
* depending on a Host package.
*/
const QUICK_PROMPTS_SETTINGS_NAMESPACE = settingsNamespace("quick-prompts");
/** Schema for the settings section (validated against the stored document). */
const Config = z.object({ prompts: z.array(z.object({
	id: z.string(),
	label: z.string(),
	text: z.string()
})).default([]) });
/** Starter prompts shipped as the composition base layer (user-overridable). */
const DEFAULT_PROMPTS = [
	{
		id: "review-changes",
		label: "审查当前改动",
		text: "审查当前 git 改动（git diff），重点关注：事务与回滚、幂等与并发、日志与边界条件、错误处理。请先分析所有路径，再给出结论和修改建议，最小改动。"
	},
	{
		id: "path-analysis",
		label: "路径分析",
		text: "请用 goal-path-analysis 思路分析：找出到达「{{目标}}」的全部可验证路径，判断遗漏入口、实现缺口、影响范围，先分析再动手。"
	},
	{
		id: "java-comments",
		label: "按规范写注释",
		text: "请按项目规范为 {{文件}} 补充注释：类级、方法级、字段级，保留原逻辑，最小改动，不删除现有注释。"
	},
	{
		id: "unit-test",
		label: "生成单元测试",
		text: "为 {{类名}} 的 {{方法名}} 生成单元测试：正常路径、边界条件、异常场景；使用项目现有测试框架与命名规范，先读现有测试再写。"
	}
];
/**
* Apply the host half: register the settings section. The section's
* composition base carries the starter prompts; the web settings surface
* (schema-driven) and the quick-prompts dock both edit the same namespace.
* @param ctx - host plugin context.
*/
function apply(ctx) {
	installSettingsSection(ctx, QUICK_PROMPTS_SETTINGS_NAMESPACE, Config, { prompts: DEFAULT_PROMPTS }, {
		setSource: () => {},
		onChange: () => {}
	});
}
//#endregion
export { Config, DEFAULT_PROMPTS, QUICK_PROMPTS_SETTINGS_NAMESPACE, apply, name };
