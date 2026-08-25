window.__ModuleLoader__.load({
	id: "dsh-quick-prompts",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/apply-guard.ts
		/**
		* Claims the plugin apply slot. Returns true when this call won the slot —
		* a duplicated client injection (module factory executed twice in one page
		* lifetime) must not mount a second dock.
		*/
		function claimQuickPromptsApply() {
			if (globalThis.__dshQuickPromptsApplied === true) return false;
			globalThis.__dshQuickPromptsApplied = true;
			return true;
		}
		/** Releases the claim (fiber cleanup) so a hot-reloaded bundle can claim again. */
		function releaseQuickPromptsApply() {
			globalThis.__dshQuickPromptsApplied = void 0;
		}
		//#endregion
		//#region src/client/placeholder.ts
		const PLACEHOLDER_RE = /\{\{\s*([^{}]+?)\s*\}\}/g;
		/**
		* Extract the distinct placeholder names from a template, in first-appearance
		* order (duplicates collapse to one field).
		* @param text - template text.
		* @returns distinct placeholder fields.
		*/
		function extractPlaceholders(text) {
			const seen = /* @__PURE__ */ new Set();
			const fields = [];
			PLACEHOLDER_RE.lastIndex = 0;
			let match;
			while ((match = PLACEHOLDER_RE.exec(text)) !== null) {
				const name = match[1].trim();
				if (name !== "" && !seen.has(name)) {
					seen.add(name);
					fields.push({ name });
				}
			}
			return fields;
		}
		/**
		* Replace every `{{name}}` span with the caller's value. Spans whose value
		* is missing or blank stay verbatim (the raw span text is preserved).
		* @param text - template text.
		* @param values - placeholder name → fill value.
		* @returns the filled text.
		*/
		function fillPlaceholders(text, values) {
			return text.replace(PLACEHOLDER_RE, (raw, name) => {
				const value = values[name.trim()];
				return value !== void 0 && value.trim() !== "" ? value : raw;
			});
		}
		/**
		* Whether a template still contains unfilled placeholders (used by the
		* direct-send path: templates with placeholders must go through the preview
		* modal so the user can fill them).
		* @param text - template text.
		* @returns true when at least one `{{name}}` span is present.
		*/
		function hasPlaceholders(text) {
			PLACEHOLDER_RE.lastIndex = 0;
			return PLACEHOLDER_RE.test(text);
		}
		//#endregion
		//#region \0dsh-css:src/client/quick-prompts.module.css.mjs
		const css = ".CfjXHa_dock{box-sizing:border-box;width:calc(100% - var(--dsh-composer-side-clearance) - var(--dsh-composer-side-clearance) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset));max-width:calc(var(--dsh-composer-card-max-width) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset));margin:0 auto calc(0px - var(--dsh-composer-stack-gap) - 3px);scrollbar-width:none;background:var(--dsw-alias-bg-base,var(--dsw-alias-fill-primary));border:1px solid var(--dsw-alias-border-l1);border-radius:10px;flex-direction:row;flex:none;align-items:center;gap:6px;padding:5px 10px;display:flex;overflow-x:auto}.CfjXHa_dock::-webkit-scrollbar{display:none}.CfjXHa_dockTag{height:22px;color:var(--qp-orange,#f59e0b);white-space:nowrap;user-select:none;background:#f59e0b1a;border-radius:6px;flex:none;align-items:center;gap:4px;padding:0 8px 0 6px;font-size:11px;font-weight:500;line-height:22px;display:inline-flex}.CfjXHa_dockTagIcon{width:12px;height:12px;display:block}.CfjXHa_chip{border:1px solid var(--qp-orange,#f59e0b);max-width:220px;height:24px;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;user-select:none;background:#f59e0b0f;border-radius:999px;flex:none;align-items:center;gap:4px;padding:0 10px;font-size:12px;line-height:22px;transition:background .12s,border-color .12s,box-shadow .12s;display:inline-flex;position:relative}.CfjXHa_chip:hover{border-color:var(--qp-orange-bright,#fbbf24);background:#f59e0b24;box-shadow:0 0 0 2px #f59e0b2e}.CfjXHa_chipLabel{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.CfjXHa_sendButton{width:16px;height:16px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;border-radius:4px;flex:none;justify-content:center;align-items:center;padding:0;transition:color .12s,background .12s;display:inline-flex}.CfjXHa_sendButton:hover,.CfjXHa_sendButton:focus-visible{color:var(--dsw-alias-state-business-primary,var(--dsw-alias-accent));background:var(--dsw-alias-fill-tertiary)}.CfjXHa_sendIcon{width:12px;height:12px;display:block}.CfjXHa_gear{width:24px;height:24px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;border-radius:6px;flex:none;justify-content:center;align-items:center;margin-left:2px;padding:0;transition:color .12s,background .12s,transform .3s;display:inline-flex}.CfjXHa_gear:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-fill-secondary);transform:rotate(30deg)}.CfjXHa_gearIcon{width:14px;height:14px;display:block}.CfjXHa_dockHint{color:var(--dsw-alias-label-tertiary);white-space:nowrap;text-overflow:ellipsis;flex:none;margin-left:6px;font-size:11px;line-height:20px;overflow:hidden}.CfjXHa_overlay{z-index:1000;backdrop-filter:blur(2px);background:#00000059;justify-content:center;align-items:center;animation:.14s CfjXHa_quickPromptsFade;display:flex;position:fixed;inset:0}@keyframes CfjXHa_quickPromptsFade{0%{opacity:0}to{opacity:1}}.CfjXHa_card{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base,var(--dsw-alias-fill-primary));border-radius:12px;flex-direction:column;gap:12px;width:min(580px,100vw - 48px);max-height:min(720px,100vh - 64px);padding:16px;animation:.16s CfjXHa_quickPromptsPop;display:flex;box-shadow:0 12px 40px #00000040}@keyframes CfjXHa_quickPromptsPop{0%{opacity:0;transform:translateY(6px)scale(.98)}to{opacity:1;transform:translateY(0)scale(1)}}.CfjXHa_title{color:var(--dsw-alias-label-primary);margin:0;font-size:14px;font-weight:600;line-height:22px}.CfjXHa_label{color:var(--dsw-alias-label-secondary);margin:0 0 4px;font-size:12px;line-height:18px;display:block}.CfjXHa_textarea{box-sizing:border-box;resize:vertical;border:1px solid var(--dsw-alias-border);background:var(--dsw-alias-fill-primary);width:100%;min-height:96px;color:var(--dsw-alias-text-primary);font:inherit;border-radius:8px;outline:none;padding:8px 10px;font-size:13px;line-height:20px;transition:border-color .12s}.CfjXHa_textarea:focus{border-color:var(--dsw-alias-state-business-primary,var(--dsw-alias-accent))}.CfjXHa_smallInput{box-sizing:border-box;border:1px solid var(--dsw-alias-border);background:var(--dsw-alias-fill-primary);width:100%;height:28px;color:var(--dsw-alias-text-primary);font:inherit;border-radius:6px;outline:none;padding:0 8px;font-size:13px;transition:border-color .12s}.CfjXHa_smallInput:focus{border-color:var(--dsw-alias-state-business-primary,var(--dsw-alias-accent))}.CfjXHa_placeholderRow{grid-template-columns:140px 1fr;align-items:center;gap:8px;display:grid}.CfjXHa_placeholderName{text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-tertiary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;line-height:18px;overflow:hidden}.CfjXHa_hint{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}.CfjXHa_actions{justify-content:flex-end;align-items:center;gap:8px;display:flex}.CfjXHa_spacer{flex:auto}.CfjXHa_button{appearance:none;border:1px solid var(--dsw-alias-border);color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border-radius:6px;padding:0 12px;font-size:12px;line-height:22px;transition:background .12s,color .12s}.CfjXHa_button:hover{background:var(--dsw-alias-fill-secondary);color:var(--dsw-alias-label-primary)}.CfjXHa_button:disabled{opacity:.5;cursor:default}.CfjXHa_primary{appearance:none;background:var(--dsw-alias-accent);color:var(--dsw-alias-text-on-accent,#fff);font:inherit;cursor:pointer;border:none;border-radius:6px;padding:0 14px;font-size:12px;font-weight:500;line-height:22px;transition:opacity .12s,filter .12s}.CfjXHa_primary:hover:not(:disabled){filter:brightness(1.08)}.CfjXHa_primary:disabled{opacity:.5;cursor:default}.CfjXHa_list{flex-direction:column;gap:8px;padding-right:2px;display:flex;overflow-y:auto}.CfjXHa_row{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-fill-secondary,transparent);border-radius:10px;flex-direction:column;gap:6px;padding:10px;display:flex}.CfjXHa_rowHeader{align-items:center;gap:6px;display:flex}.CfjXHa_rowIndex{text-align:center;width:18px;color:var(--dsw-alias-label-tertiary);flex:none;font-size:11px;line-height:18px}.CfjXHa_rowActions{flex:none;align-items:center;gap:4px;margin-left:auto;display:flex}.CfjXHa_iconButton{width:22px;height:22px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;border-radius:5px;justify-content:center;align-items:center;padding:0;transition:color .12s,background .12s;display:inline-flex}.CfjXHa_iconButton:hover:not(:disabled){color:var(--dsw-alias-label-primary);background:var(--dsw-alias-fill-tertiary)}.CfjXHa_iconButton:disabled{opacity:.35;cursor:default}.CfjXHa_iconButton.CfjXHa_danger:hover:not(:disabled){color:var(--dsw-alias-text-danger,#d33);background:color-mix(in srgb, var(--dsw-alias-text-danger,#d33) 12%, transparent)}.CfjXHa_icon{width:13px;height:13px;display:block}.CfjXHa_managerBody{flex-direction:column;flex:auto;gap:8px;min-height:0;padding:2px;display:flex;overflow-y:auto}.CfjXHa_importZone{border:1px dashed var(--dsw-alias-border-l2);border-radius:8px;align-items:center;gap:8px;padding:8px;display:flex}.CfjXHa_importTextarea{box-sizing:border-box;resize:none;height:26px;min-height:0;color:var(--dsw-alias-text-primary);font:inherit;background:0 0;border:none;outline:none;flex:auto;padding:3px 8px;font-size:12px;line-height:18px}.CfjXHa_addRow{justify-content:center;padding:4px 0 8px;display:flex}";
		const tagId = "dsh-quick-prompts/quick-prompts.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-quick-prompts";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var quick_prompts_module_css_default = {
			"actions": "CfjXHa_actions",
			"addRow": "CfjXHa_addRow",
			"button": "CfjXHa_button",
			"card": "CfjXHa_card",
			"chip": "CfjXHa_chip",
			"chipLabel": "CfjXHa_chipLabel",
			"danger": "CfjXHa_danger",
			"dock": "CfjXHa_dock",
			"dockHint": "CfjXHa_dockHint",
			"dockTag": "CfjXHa_dockTag",
			"dockTagIcon": "CfjXHa_dockTagIcon",
			"gear": "CfjXHa_gear",
			"gearIcon": "CfjXHa_gearIcon",
			"hint": "CfjXHa_hint",
			"icon": "CfjXHa_icon",
			"iconButton": "CfjXHa_iconButton",
			"importTextarea": "CfjXHa_importTextarea",
			"importZone": "CfjXHa_importZone",
			"label": "CfjXHa_label",
			"list": "CfjXHa_list",
			"managerBody": "CfjXHa_managerBody",
			"overlay": "CfjXHa_overlay",
			"placeholderName": "CfjXHa_placeholderName",
			"placeholderRow": "CfjXHa_placeholderRow",
			"primary": "CfjXHa_primary",
			"quickPromptsFade": "CfjXHa_quickPromptsFade",
			"quickPromptsPop": "CfjXHa_quickPromptsPop",
			"row": "CfjXHa_row",
			"rowActions": "CfjXHa_rowActions",
			"rowHeader": "CfjXHa_rowHeader",
			"rowIndex": "CfjXHa_rowIndex",
			"sendButton": "CfjXHa_sendButton",
			"sendIcon": "CfjXHa_sendIcon",
			"smallInput": "CfjXHa_smallInput",
			"spacer": "CfjXHa_spacer",
			"textarea": "CfjXHa_textarea",
			"title": "CfjXHa_title"
		};
		//#endregion
		//#region src/client/PreviewModal.tsx
		/**
		* Preview/editor modal: shows one prompt entry, lets the user edit the
		* template text (a local draft — never written back to settings) and fill
		* any {{placeholder}} fields, then either syncs the filled text into the
		* composer input or sends it directly.
		*/
		/**
		* The preview/editor modal. Local state only: `text` is a draft copy of the
		* template, `values` holds the placeholder fills. Nothing here mutates the
		* stored prompt entry.
		*/
		function PreviewModal(props) {
			const { item, fromSend, onClose, onSync, onSend, sending, sendError, t } = props;
			const [text, setText] = (0, react.useState)(item.text);
			const [values, setValues] = (0, react.useState)(() => {
				const out = {};
				for (const field of extractPlaceholders(item.text)) out[field.name] = "";
				return out;
			});
			const [mode, setMode] = (0, react.useState)("append");
			const placeholders = (0, react.useMemo)(() => extractPlaceholders(text), [text]);
			const commit = () => fillPlaceholders(text, values);
			const canSubmit = text.trim() !== "" && !sending;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: quick_prompts_module_css_default.overlay,
				onMouseDown: (e) => {
					if (e.target === e.currentTarget) onClose();
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: quick_prompts_module_css_default.card,
					role: "dialog",
					"aria-modal": "true",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: quick_prompts_module_css_default.title,
							children: t("preview.title")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: quick_prompts_module_css_default.label,
							children: t("preview.label")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: quick_prompts_module_css_default.smallInput,
							value: item.label,
							readOnly: true,
							"aria-label": t("preview.label")
						})] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: quick_prompts_module_css_default.label,
							children: t("preview.textHint")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
							className: quick_prompts_module_css_default.textarea,
							value: text,
							onChange: (e) => setText(e.target.value),
							autoFocus: true,
							spellCheck: false
						})] }),
						placeholders.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: quick_prompts_module_css_default.label,
							children: t("preview.placeholderSection")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							style: {
								display: "flex",
								flexDirection: "column",
								gap: 6
							},
							children: placeholders.map((field) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: quick_prompts_module_css_default.placeholderRow,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: quick_prompts_module_css_default.placeholderName,
									children: `{{${field.name}}}`
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									className: quick_prompts_module_css_default.smallInput,
									value: values[field.name] ?? "",
									placeholder: field.name,
									onChange: (e) => setValues((prev) => ({
										...prev,
										[field.name]: e.target.value
									}))
								})]
							}, field.name))
						})] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: quick_prompts_module_css_default.hint,
							children: t("preview.placeholderEmpty")
						}),
						fromSend ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: quick_prompts_module_css_default.hint,
							style: {
								display: "flex",
								alignItems: "center",
								gap: 6,
								cursor: "pointer"
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: mode === "append",
								onChange: (e) => setMode(e.target.checked ? "append" : "replace")
							}), mode === "append" ? t("preview.appendMode") : t("preview.replaceMode")]
						}),
						sendError !== null && sendError !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: quick_prompts_module_css_default.hint,
							style: { color: "var(--dsw-alias-text-danger, #d33)" },
							children: sendError
						}) : null,
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: quick_prompts_module_css_default.actions,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: quick_prompts_module_css_default.spacer }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: quick_prompts_module_css_default.button,
									onClick: onClose,
									disabled: sending,
									children: t("preview.cancel")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: quick_prompts_module_css_default.primary,
									disabled: !canSubmit,
									onClick: () => onSync({
										text: commit(),
										mode
									}),
									children: t("preview.syncToInput")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: quick_prompts_module_css_default.primary,
									disabled: !canSubmit,
									onClick: () => onSend(commit()),
									children: sending ? "…" : t("preview.send")
								})
							]
						})
					]
				})
			});
		}
		//#endregion
		//#region src/client/ManagerModal.tsx
		/**
		* Manager modal: full CRUD over the prompt list — add, edit, remove,
		* reorder, import (paste JSON) and export (download JSON). Edits stage in
		* local state and are committed to the settings namespace only on Save.
		*/
		/** Validate one imported entry and normalize it, or return null. */
		function normalizeImported(raw) {
			if (typeof raw !== "object" || raw === null) return null;
			const label = typeof raw.label === "string" ? raw.label.trim() : "";
			const text = typeof raw.text === "string" ? raw.text : "";
			if (label === "" && text === "") return null;
			return {
				id: crypto.randomUUID(),
				label: label || text.slice(0, 16),
				text
			};
		}
		function newPrompt() {
			return {
				id: crypto.randomUUID(),
				label: "",
				text: ""
			};
		}
		/** Small inline SVG icons (no icon dependency). */
		const ICONS = {
			up: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				className: quick_prompts_module_css_default.icon,
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.6",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 10l4-4 4 4" })
			}),
			down: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				className: quick_prompts_module_css_default.icon,
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.6",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 6l4 4 4-4" })
			}),
			trash: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				className: quick_prompts_module_css_default.icon,
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.6",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2.5 4.5h11M6.5 4.5V3a1 1 0 011-1h1a1 1 0 011 1v1.5M4 4.5l.6 8a1.5 1.5 0 001.5 1.4h3.8a1.5 1.5 0 001.5-1.4l.6-8M6.7 7.2v4.1M9.3 7.2v4.1" })
			})
		};
		/**
		* The manager modal. `items` is a local staging copy; Save commits the whole
		* list through `scope.set('prompts', items)` (the official settings write
		* path, revision-fenced), Cancel discards it.
		*/
		function ManagerModal(props) {
			const { scope, snapshot, onClose, t } = props;
			const [items, setItems] = (0, react.useState)(() => {
				const stored = snapshot.status === "ready" ? snapshot.value?.prompts : void 0;
				return stored !== void 0 && stored.length > 0 ? stored.map((p) => ({ ...p })) : [];
			});
			const [importOpen, setImportOpen] = (0, react.useState)(false);
			const [importText, setImportText] = (0, react.useState)("");
			const [notice, setNotice] = (0, react.useState)(null);
			const [saving, setSaving] = (0, react.useState)(false);
			const patch = (id, field, value) => {
				setItems((prev) => prev.map((p) => p.id === id ? {
					...p,
					[field]: value
				} : p));
				setNotice(null);
			};
			const move = (index, delta) => {
				setItems((prev) => {
					const next = [...prev];
					const target = index + delta;
					if (target < 0 || target >= next.length) return prev;
					[next[index], next[target]] = [next[target], next[index]];
					return next;
				});
				setNotice(null);
			};
			const remove = (id) => {
				setItems((prev) => prev.filter((p) => p.id !== id));
				setNotice(null);
			};
			const add = () => {
				setItems((prev) => [...prev, newPrompt()]);
				setNotice(null);
			};
			const doImport = () => {
				try {
					const parsed = JSON.parse(importText);
					if (!Array.isArray(parsed)) throw new Error("expected an array");
					const normalized = parsed.map((raw) => normalizeImported(raw)).filter((p) => p !== null);
					if (normalized.length === 0) throw new Error("no valid entries");
					setItems((prev) => [...prev, ...normalized]);
					setImportText("");
					setImportOpen(false);
					setNotice({
						kind: "ok",
						text: t("manager.importDone", { count: String(normalized.length) })
					});
				} catch (err) {
					setNotice({
						kind: "error",
						text: t("manager.importError", { reason: err instanceof Error ? err.message : String(err) })
					});
				}
			};
			const doExport = () => {
				const payload = items.map(({ label, text }) => ({
					label,
					text
				}));
				const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
				const url = URL.createObjectURL(blob);
				const anchor = document.createElement("a");
				anchor.href = url;
				anchor.download = "quick-prompts.json";
				anchor.click();
				URL.revokeObjectURL(url);
			};
			const save = async () => {
				if (saving) return;
				setSaving(true);
				try {
					const clean = items.filter((p) => p.label.trim() !== "" || p.text.trim() !== "").map((p) => ({
						...p,
						label: p.label.trim()
					}));
					await scope.set("prompts", clean);
					onClose();
				} catch {
					setSaving(false);
				}
			};
			const dirty = JSON.stringify(items) !== JSON.stringify(snapshot.status === "ready" ? snapshot.value?.prompts ?? [] : []);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: quick_prompts_module_css_default.overlay,
				onMouseDown: (e) => {
					if (e.target === e.currentTarget) onClose();
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: quick_prompts_module_css_default.card,
					role: "dialog",
					"aria-modal": "true",
					style: { width: "min(640px, calc(100vw - 48px))" },
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: 8
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: quick_prompts_module_css_default.title,
								children: t("manager.title")
							}), dirty ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: quick_prompts_module_css_default.hint,
								children: t("manager.dirty")
							}) : null]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: quick_prompts_module_css_default.managerBody,
							children: [
								items.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: quick_prompts_module_css_default.hint,
									style: {
										padding: "12px 0",
										textAlign: "center"
									},
									children: t("manager.empty")
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: quick_prompts_module_css_default.list,
									children: items.map((item, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: quick_prompts_module_css_default.row,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: quick_prompts_module_css_default.rowHeader,
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: quick_prompts_module_css_default.rowIndex,
													children: String(index + 1)
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
													className: quick_prompts_module_css_default.smallInput,
													style: {
														flex: "none",
														width: 160
													},
													value: item.label,
													placeholder: t("manager.labelField"),
													onChange: (e) => patch(item.id, "label", e.target.value)
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
													className: quick_prompts_module_css_default.rowActions,
													children: [
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
															type: "button",
															className: quick_prompts_module_css_default.iconButton,
															title: t("manager.moveUp"),
															disabled: index === 0,
															onClick: () => move(index, -1),
															children: ICONS.up
														}),
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
															type: "button",
															className: quick_prompts_module_css_default.iconButton,
															title: t("manager.moveDown"),
															disabled: index === items.length - 1,
															onClick: () => move(index, 1),
															children: ICONS.down
														}),
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
															type: "button",
															className: `${quick_prompts_module_css_default.iconButton} ${quick_prompts_module_css_default.danger}`,
															title: t("manager.remove"),
															onClick: () => remove(item.id),
															children: ICONS.trash
														})
													]
												})
											]
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
											className: quick_prompts_module_css_default.textarea,
											style: { minHeight: 64 },
											value: item.text,
											placeholder: t("manager.textField"),
											onChange: (e) => patch(item.id, "text", e.target.value),
											spellCheck: false
										})]
									}, item.id))
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: quick_prompts_module_css_default.addRow,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: quick_prompts_module_css_default.button,
										onClick: add,
										children: t("manager.add")
									})
								}),
								importOpen ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: quick_prompts_module_css_default.importZone,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											className: quick_prompts_module_css_default.importTextarea,
											value: importText,
											placeholder: t("manager.importPlaceholder"),
											onChange: (e) => setImportText(e.target.value),
											spellCheck: false
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: quick_prompts_module_css_default.primary,
											disabled: importText.trim() === "",
											onClick: doImport,
											children: t("manager.import")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: quick_prompts_module_css_default.button,
											onClick: () => {
												setImportOpen(false);
												setImportText("");
											},
											children: t("preview.cancel")
										})
									]
								}) : null,
								notice !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: quick_prompts_module_css_default.hint,
									style: notice.kind === "error" ? { color: "var(--dsw-alias-text-danger, #d33)" } : void 0,
									children: notice.text
								}) : null
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: quick_prompts_module_css_default.actions,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: quick_prompts_module_css_default.hint,
									children: t("manager.exportHint")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: quick_prompts_module_css_default.spacer }),
								!importOpen ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: quick_prompts_module_css_default.button,
									onClick: () => setImportOpen(true),
									children: t("manager.import")
								}) : null,
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: quick_prompts_module_css_default.button,
									onClick: doExport,
									disabled: items.length === 0,
									children: t("manager.export")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: quick_prompts_module_css_default.button,
									onClick: onClose,
									disabled: saving,
									children: t("manager.cancel")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: quick_prompts_module_css_default.primary,
									disabled: saving,
									onClick: () => void save(),
									children: saving ? "…" : t("manager.save")
								})
							]
						})
					]
				})
			});
		}
		//#endregion
		//#region src/client/QuickPromptsDock.tsx
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
		const SEND_ICON = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
			className: quick_prompts_module_css_default.sendIcon,
			viewBox: "0 0 16 16",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "1.5",
			strokeLinecap: "round",
			strokeLinejoin: "round",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M14.5 1.5L7 9M14.5 1.5L10 14.5l-3-5.5-5.5-3 13-4.5z" })
		});
		const GEAR_ICON = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
			className: quick_prompts_module_css_default.gearIcon,
			viewBox: "0 0 16 16",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "1.4",
			strokeLinecap: "round",
			strokeLinejoin: "round",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "8",
				cy: "8",
				r: "2.2"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 1.8v2M8 12.2v2M1.8 8h2M12.2 8h2M3.6 3.6l1.4 1.4M11 11l1.4 1.4M12.4 3.6L11 5M5 11l-1.4 1.4" })]
		});
		/** The composer dock row. Renders nothing while settings are loading. */
		const QuickPromptsDock = (0, react.memo)(function QuickPromptsDock(props) {
			const { scope, insertIntoInput, sendPrompt, session, t } = props;
			const [snapshot, setSnapshot] = (0, react.useState)(() => scope.getSnapshot());
			const [preview, setPreview] = (0, react.useState)(null);
			const [managerOpen, setManagerOpen] = (0, react.useState)(false);
			const [sending, setSending] = (0, react.useState)(false);
			const [sendError, setSendError] = (0, react.useState)(null);
			(0, react.useEffect)(() => scope.subscribe(() => setSnapshot(scope.getSnapshot())), [scope]);
			const prompts = snapshot.status === "ready" ? snapshot.value?.prompts ?? [] : [];
			if (snapshot.status !== "ready") return null;
			const openPreview = (item, fromSend) => {
				setSendError(null);
				setPreview({
					item,
					fromSend
				});
			};
			const handleSend = async (item) => {
				if (hasPlaceholders(item.text)) {
					openPreview(item, true);
					return;
				}
				setSending(true);
				setSendError(null);
				const ok = await sendPrompt(session.sessionId, item.text);
				setSending(false);
				if (!ok) setSendError("send-failed");
			};
			const handleSync = (result) => {
				insertIntoInput(session.sessionId, result.text, result.mode);
				setPreview(null);
			};
			const handleSendFromModal = async (text) => {
				setSending(true);
				setSendError(null);
				const ok = await sendPrompt(session.sessionId, text);
				setSending(false);
				if (ok) setPreview(null);
				else setSendError(t("preview.sendFailed", { reason: "" }));
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: quick_prompts_module_css_default.dock,
					role: "toolbar",
					"aria-label": "quick prompts",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: quick_prompts_module_css_default.dockTag,
							title: "quick prompts",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
								className: quick_prompts_module_css_default.dockTagIcon,
								viewBox: "0 0 16 16",
								fill: "currentColor",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9.2 1L3 9.2h3.6L6 15l6.2-8.2H8.6L9.2 1z" })
							}), t("dock.title")]
						}),
						prompts.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: quick_prompts_module_css_default.chip,
							title: hasPlaceholders(item.text) ? t("pill.placeholderHint") : t("pill.preview"),
							onClick: () => openPreview(item, false),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: quick_prompts_module_css_default.chipLabel,
								children: item.label || "…"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								role: "button",
								tabIndex: 0,
								className: quick_prompts_module_css_default.sendButton,
								title: t("pill.send"),
								onClick: (e) => {
									e.stopPropagation();
									handleSend(item);
								},
								onKeyDown: (e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										e.stopPropagation();
										handleSend(item);
									}
								},
								children: SEND_ICON
							})]
						}, item.id)),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: quick_prompts_module_css_default.gear,
							title: t("dock.manage"),
							onClick: () => setManagerOpen(true),
							children: GEAR_ICON
						}),
						prompts.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: quick_prompts_module_css_default.dockHint,
							children: t("manager.empty")
						}) : null
					]
				}),
				preview !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PreviewModal, {
					item: preview.item,
					fromSend: preview.fromSend,
					t,
					sending,
					sendError,
					onClose: () => setPreview(null),
					onSync: handleSync,
					onSend: (text) => void handleSendFromModal(text)
				}) : null,
				managerOpen ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ManagerModal, {
					scope,
					snapshot,
					t,
					onClose: () => setManagerOpen(false)
				}) : null
			] });
		});
		//#endregion
		//#region src/client/locales.ts
		/**
		* quick-prompts UI copy. The zh dictionary is the key source; the en side
		* must carry the exact same key set.
		*/
		const zh = {
			"dock.title": "快捷指令",
			"dock.manage": "管理指令",
			"pill.send": "直接发送",
			"pill.preview": "预览并编辑",
			"pill.placeholderHint": "含 {{占位符}}，点击预览填写",
			"preview.title": "指令预览",
			"preview.label": "名称",
			"preview.textHint": "可编辑全文；{{占位符}} 会在同步/发送时替换为下方填写的值",
			"preview.placeholderSection": "占位符参数",
			"preview.placeholderEmpty": "没有占位符，可直接同步或发送",
			"preview.appendMode": "追加到输入框末尾",
			"preview.replaceMode": "覆盖输入框已有内容",
			"preview.cancel": "取消",
			"preview.syncToInput": "同步到输入框",
			"preview.send": "直接发送",
			"preview.sendFailed": "发送失败：{reason}",
			"manager.title": "管理快捷指令",
			"manager.add": "新增指令",
			"manager.save": "保存",
			"manager.cancel": "取消",
			"manager.moveUp": "上移",
			"manager.moveDown": "下移",
			"manager.remove": "删除",
			"manager.labelField": "按钮名称",
			"manager.textField": "指令内容（支持 {{占位符}}）",
			"manager.empty": "还没有指令，点击「新增指令」开始",
			"manager.import": "导入",
			"manager.export": "导出",
			"manager.importTitle": "导入指令（粘贴 JSON）",
			"manager.importPlaceholder": "[{\"label\": \"按钮名\", \"text\": \"指令内容\"}, …]",
			"manager.importDone": "已导入 {count} 条指令",
			"manager.importError": "导入失败：{reason}",
			"manager.exportHint": "导出为 JSON 文件，可分享给其他人导入",
			"manager.dirty": "有未保存的修改"
		};
		const en = {
			"dock.title": "Quick prompts",
			"dock.manage": "Manage prompts",
			"pill.send": "Send directly",
			"pill.preview": "Preview and edit",
			"pill.placeholderHint": "Contains {{placeholders}} — click to fill in",
			"preview.title": "Prompt preview",
			"preview.label": "Name",
			"preview.textHint": "Editable template; {{placeholders}} are replaced with the values below on sync/send",
			"preview.placeholderSection": "Placeholders",
			"preview.placeholderEmpty": "No placeholders — sync or send directly",
			"preview.appendMode": "Append to the end of the input",
			"preview.replaceMode": "Replace the current input content",
			"preview.cancel": "Cancel",
			"preview.syncToInput": "Sync to input",
			"preview.send": "Send directly",
			"preview.sendFailed": "Send failed: {reason}",
			"manager.title": "Manage quick prompts",
			"manager.add": "Add prompt",
			"manager.save": "Save",
			"manager.cancel": "Cancel",
			"manager.moveUp": "Move up",
			"manager.moveDown": "Move down",
			"manager.remove": "Remove",
			"manager.labelField": "Button label",
			"manager.textField": "Prompt text ({{placeholders}} supported)",
			"manager.empty": "No prompts yet — click \"Add prompt\" to start",
			"manager.import": "Import",
			"manager.export": "Export",
			"manager.importTitle": "Import prompts (paste JSON)",
			"manager.importPlaceholder": "[{\"label\": \"Button\", \"text\": \"Prompt text\"}, …]",
			"manager.importDone": "Imported {count} prompts",
			"manager.importError": "Import failed: {reason}",
			"manager.exportHint": "Exports a JSON file you can share with others",
			"manager.dirty": "You have unsaved changes"
		};
		//#endregion
		//#region src/client/index.ts
		/** Locale namespace this plugin owns. */
		const NS = "quick-prompts";
		/** Services required by this plugin. */
		const inject = [
			"slots",
			"locale",
			"settingsScope",
			"conversation",
			"sessions"
		];
		/**
		* Register the quick-prompts dock and wire the input/send ports.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			if (!claimQuickPromptsApply()) return;
			ctx.effect(() => releaseQuickPromptsApply, "quick-prompts: apply claim");
			ctx.effect(() => {
				try {
					return ctx.locale.register(NS, {
						zh,
						en
					});
				} catch {
					return () => {};
				}
			}, "quick-prompts: dictionaries");
			const scope = (ctx.get("webUiSettings") ?? ctx.settingsScope).bind({ namespace: "quick-prompts" });
			/** Place text into one session's composer input (append or replace). */
			const insertIntoInput = (sessionId, text, mode) => {
				try {
					const shell = ctx.conversation.input.shell(sessionId);
					if (shell === void 0) return;
					if (mode === "replace") {
						shell.setDraft(text);
						return;
					}
					let current = "";
					try {
						current = shell.state.getSnapshot().draft;
					} catch {
						current = "";
					}
					shell.setDraft(current.trim() === "" ? text : `${current}\n${text}`);
				} catch {}
			};
			/** Send text as a queued user prompt in one session (chat-recovery path). */
			const sendPrompt = async (sessionId, text) => {
				try {
					const binding = ctx.sessions.binding(sessionId);
					if (binding === void 0) return false;
					return (await binding.session.prompt([{
						type: "text",
						text
					}], "queue")).ok;
				} catch {
					return false;
				}
			};
			const injected = {
				scope,
				insertIntoInput,
				sendPrompt
			};
			ctx.slots.inject("conversation.input.dock", () => {
				try {
					return ctx.slots.register({
						name: "conversation.input.dock",
						id: "quick-prompts",
						order: 100,
						locale: NS,
						inject: () => injected
					}, QuickPromptsDock);
				} catch {
					return () => {};
				}
			});
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map