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
		//#region src/types.ts
		/**
		* Normalize any stored section into the current shape, migrating legacy
		* free-form `category` strings into real feature entries (id synthesized
		* from the name, deduplicated by name). Purely derived — nothing is written
		* back until the user saves through the manager.
		* @param raw - the stored (schema-resolved) section value.
		* @returns the normalized shape.
		*/
		function normalizeSettings(raw) {
			const categories = (raw?.categories ?? []).map((c) => ({ ...c }));
			const byName = new Map(categories.map((c) => [c.name, c]));
			return {
				categories,
				prompts: (raw?.prompts ?? []).map((entry) => {
					const prompt = entry;
					if ("categoryId" in prompt && typeof prompt.categoryId === "string") return {
						id: prompt.id,
						label: prompt.label,
						text: prompt.text,
						categoryId: prompt.categoryId
					};
					const legacy = prompt.category;
					if (legacy !== void 0 && legacy.trim() !== "") {
						let category = byName.get(legacy);
						if (category === void 0) {
							category = {
								id: `legacy-${legacy}`,
								name: legacy
							};
							byName.set(legacy, category);
							categories.push(category);
						}
						return {
							id: prompt.id,
							label: prompt.label,
							text: prompt.text,
							categoryId: category.id
						};
					}
					return {
						id: prompt.id,
						label: prompt.label,
						text: prompt.text,
						categoryId: ""
					};
				})
			};
		}
		//#endregion
		//#region src/client/placeholder.ts
		/** Global pattern so callers can also use String.matchAll for highlighting. */
		const PLACEHOLDER_PATTERN = /\{\{\s*([^{}]+?)\s*\}\}/g;
		const PLACEHOLDER_RE = PLACEHOLDER_PATTERN;
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
		const css = ".CfjXHa_dock{box-sizing:border-box;width:calc(100% - var(--dsh-composer-side-clearance) - var(--dsh-composer-side-clearance) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset));max-width:calc(var(--dsh-composer-card-max-width) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset));margin:0 auto calc(0px - var(--dsh-composer-stack-gap) - 3px);background:var(--dsw-alias-bg-base,var(--dsw-alias-fill-primary));border:1px solid var(--dsw-alias-border-l1);border-radius:10px;flex-direction:column;flex:none;gap:6px;padding:6px 10px;display:flex}.CfjXHa_dockTop{scrollbar-width:none;flex-direction:row;flex:none;align-items:center;gap:8px;display:flex;overflow-x:auto}.CfjXHa_dockTop::-webkit-scrollbar{display:none}.CfjXHa_dockSpacer{flex:auto}.CfjXHa_tabs{flex-direction:row;flex:none;align-items:center;gap:4px;display:flex}.CfjXHa_tab{appearance:none;color:var(--dsw-alias-label-tertiary);font:inherit;cursor:pointer;white-space:nowrap;background:0 0;border:none;border-radius:999px;padding:0 8px;font-size:11px;line-height:20px;transition:color .12s,background .12s}.CfjXHa_tab:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-fill-secondary)}.CfjXHa_tabActive{color:var(--qp-orange,#f59e0b);background:#f59e0b1a;font-weight:500}.CfjXHa_tabActive:hover{color:var(--qp-orange,#f59e0b);background:#f59e0b29}.CfjXHa_chipRow{scrollbar-width:none;flex-direction:row;flex:none;align-items:center;gap:6px;min-height:24px;display:flex;overflow-x:auto}.CfjXHa_chipRow::-webkit-scrollbar{display:none}.CfjXHa_dockTag{height:22px;color:var(--qp-orange,#f59e0b);white-space:nowrap;user-select:none;background:#f59e0b1a;border-radius:6px;flex:none;align-items:center;gap:4px;padding:0 8px 0 6px;font-size:11px;font-weight:500;line-height:22px;display:inline-flex}.CfjXHa_dockTagIcon{width:12px;height:12px;display:block}.CfjXHa_chip{border:1px solid var(--qp-orange,#f59e0b);max-width:220px;height:24px;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;user-select:none;background:#f59e0b0f;border-radius:999px;flex:none;align-items:center;gap:4px;padding:0 10px;font-size:12px;line-height:22px;transition:background .12s,border-color .12s,box-shadow .12s;display:inline-flex;position:relative}.CfjXHa_chip:hover{border-color:var(--qp-orange-bright,#fbbf24);background:#f59e0b24;box-shadow:0 0 0 2px #f59e0b2e}.CfjXHa_chipLabel{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.CfjXHa_sendButton{width:16px;height:16px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;border-radius:4px;flex:none;justify-content:center;align-items:center;padding:0;transition:color .12s,background .12s;display:inline-flex}.CfjXHa_sendButton:hover,.CfjXHa_sendButton:focus-visible{color:var(--dsw-alias-state-business-primary,var(--dsw-alias-accent));background:var(--dsw-alias-fill-tertiary)}.CfjXHa_sendIcon{width:12px;height:12px;display:block}.CfjXHa_gear{width:24px;height:24px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;border-radius:6px;flex:none;justify-content:center;align-items:center;margin-left:2px;padding:0;transition:color .12s,background .12s,transform .3s;display:inline-flex}.CfjXHa_gear:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-fill-secondary);transform:rotate(30deg)}.CfjXHa_gearIcon{width:14px;height:14px;display:block}.CfjXHa_dockHint{color:var(--dsw-alias-label-tertiary);white-space:nowrap;text-overflow:ellipsis;flex:none;margin-left:6px;font-size:11px;line-height:20px;overflow:hidden}.CfjXHa_overlay{z-index:1000;backdrop-filter:blur(2px);background:#00000059;justify-content:center;align-items:center;animation:.14s CfjXHa_quickPromptsFade;display:flex;position:fixed;inset:0}@keyframes CfjXHa_quickPromptsFade{0%{opacity:0}to{opacity:1}}.CfjXHa_card{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base,var(--dsw-alias-fill-primary));border-radius:12px;flex-direction:column;gap:12px;width:min(580px,100vw - 48px);max-height:min(720px,100vh - 64px);padding:16px;animation:.16s CfjXHa_quickPromptsPop;display:flex;box-shadow:0 12px 40px #00000040}.CfjXHa_previewCard{width:min(720px,100vw - 48px);overflow-y:auto}.CfjXHa_fieldSection{border:1px solid color-mix(in srgb, var(--dsw-alias-label-primary,#0f1115) 16%, transparent);background:color-mix(in srgb, var(--dsw-alias-label-primary,#0f1115) 4%, transparent);border-radius:10px;flex-direction:column;gap:6px;padding:10px;display:flex}.CfjXHa_actionsDivider{border-top:1px solid color-mix(in srgb, var(--dsw-alias-label-primary,#0f1115) 16%, transparent);padding-top:12px}@keyframes CfjXHa_quickPromptsPop{0%{opacity:0;transform:translateY(6px)scale(.98)}to{opacity:1;transform:translateY(0)scale(1)}}.CfjXHa_title{color:var(--dsw-alias-label-primary);margin:0;font-size:14px;font-weight:600;line-height:22px}.CfjXHa_label{color:var(--dsw-alias-label-secondary);margin:0 0 4px;font-size:12px;line-height:18px;display:block}.CfjXHa_textarea{box-sizing:border-box;resize:vertical;border:1px solid var(--dsw-alias-border);background:var(--dsw-alias-fill-primary);width:100%;min-height:96px;color:var(--dsw-alias-text-primary);font:inherit;border-radius:8px;outline:none;padding:8px 10px;font-size:13px;line-height:20px;transition:border-color .12s}.CfjXHa_textarea:focus{border-color:var(--dsw-alias-state-business-primary,var(--dsw-alias-accent))}.CfjXHa_previewWrap{position:relative}.CfjXHa_previewWrap .CfjXHa_previewBox,.CfjXHa_previewWrap textarea{padding-right:44px}.CfjXHa_previewBox{box-sizing:border-box;border:1px solid var(--dsw-alias-border);background:var(--dsw-alias-fill-primary);width:100%;min-height:60px;max-height:240px;color:var(--dsw-alias-text-primary);font:inherit;white-space:pre-wrap;word-break:break-word;user-select:text;border-radius:8px;margin:0;padding:8px 10px;font-size:13px;line-height:20px;overflow-y:auto}.CfjXHa_previewEdit{width:28px;height:28px;color:var(--qp-orange,#f59e0b);cursor:pointer;background:#f59e0b24;border:1px solid #f59e0b73;border-radius:7px;justify-content:center;align-items:center;padding:0;transition:background .12s,border-color .12s,color .12s;display:inline-flex;position:absolute;top:6px;right:6px}.CfjXHa_previewEdit:hover{border-color:var(--qp-orange-bright,#fbbf24);color:var(--qp-orange-bright,#fbbf24);background:#f59e0b3d}.CfjXHa_previewEdit .CfjXHa_icon{width:15px;height:15px}.CfjXHa_previewEmpty{box-sizing:border-box;border:1px dashed var(--dsw-alias-border-l2);width:100%;min-height:56px;color:var(--dsw-alias-label-tertiary);user-select:none;border-radius:8px;padding:8px 44px 8px 10px;font-size:12px;line-height:20px;display:block}.CfjXHa_smallInput{box-sizing:border-box;border:1px solid var(--dsw-alias-border);background:var(--dsw-alias-fill-primary);width:100%;height:28px;color:var(--dsw-alias-text-primary);font:inherit;border-radius:6px;outline:none;padding:0 8px;font-size:13px;transition:border-color .12s}.CfjXHa_smallInput:focus{border-color:var(--dsw-alias-state-business-primary,var(--dsw-alias-accent))}.CfjXHa_placeholderRow{grid-template-columns:140px 1fr;align-items:center;gap:8px;display:grid}.CfjXHa_placeholderName{text-overflow:ellipsis;white-space:nowrap;color:var(--qp-orange,#f59e0b);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;line-height:18px;overflow:hidden}.CfjXHa_placeholderHighlight{color:var(--qp-orange,#f59e0b)}.CfjXHa_highlightWrap{position:relative}.CfjXHa_highlightBack{box-sizing:border-box;background:var(--dsw-alias-fill-primary);width:100%;min-height:300px;color:var(--dsw-alias-text-primary);font:inherit;white-space:pre-wrap;overflow-wrap:break-word;word-break:break-all;pointer-events:none;border:1px solid #0000;border-radius:8px;margin:0;padding:8px 10px;font-size:13px;line-height:20px}.CfjXHa_highlightFront{color:#0000;min-height:0;caret-color:var(--qp-orange,#f59e0b);resize:none;background:0 0;position:absolute;inset:0}.CfjXHa_placeholderInput{border:1px solid color-mix(in srgb, var(--dsw-alias-label-primary,#0f1115) 20%, transparent)}.CfjXHa_hint{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}.CfjXHa_actions{justify-content:flex-end;align-items:center;gap:8px;display:flex}.CfjXHa_spacer{flex:auto}.CfjXHa_button{appearance:none;border:1px solid var(--dsw-alias-border);color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border-radius:6px;padding:0 12px;font-size:12px;line-height:22px;transition:background .12s,color .12s}.CfjXHa_button:hover{background:var(--dsw-alias-fill-secondary);color:var(--dsw-alias-label-primary)}.CfjXHa_button:disabled{opacity:.5;cursor:default}.CfjXHa_primary{appearance:none;background:var(--dsw-alias-accent);color:var(--dsw-alias-text-on-accent,#fff);font:inherit;cursor:pointer;border:none;border-radius:6px;padding:0 14px;font-size:12px;font-weight:500;line-height:22px;transition:opacity .12s,filter .12s}.CfjXHa_primary:hover:not(:disabled){filter:brightness(1.08)}.CfjXHa_primary:disabled{opacity:.5;cursor:default}.CfjXHa_managerCard{width:min(720px,100vw - 48px);height:min(640px,100vh - 96px)}.CfjXHa_editorCard{width:min(640px,100vw - 48px)}.CfjXHa_confirmCard{width:min(400px,100vw - 48px)}.CfjXHa_dangerPrimary{appearance:none;background:var(--dsw-alias-text-danger,#d33);color:#fff;font:inherit;cursor:pointer;border:none;border-radius:6px;padding:0 14px;font-size:12px;font-weight:500;line-height:22px;transition:filter .12s}.CfjXHa_dangerPrimary:hover:not(:disabled){filter:brightness(1.08)}.CfjXHa_dangerPrimary:disabled{opacity:.5;cursor:default}.CfjXHa_managerSplit{flex-direction:row;flex:auto;gap:10px;min-height:0;display:flex}.CfjXHa_rail{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-fill-secondary,transparent);border-radius:10px;flex-direction:column;flex:none;gap:6px;width:190px;min-height:0;padding:8px;display:flex}.CfjXHa_railHeader{align-items:center;padding:0 4px;display:flex}.CfjXHa_railTitle{color:var(--dsw-alias-label-tertiary);text-transform:uppercase;letter-spacing:.4px;font-size:11px;font-weight:600;line-height:18px}.CfjXHa_railList{flex-direction:column;flex:auto;gap:2px;min-height:0;display:flex;overflow-y:auto}.CfjXHa_railRow{border-radius:7px;align-items:center;gap:4px;padding:1px 2px;transition:background .12s;display:flex}.CfjXHa_railRow:hover{background:var(--dsw-alias-fill-tertiary)}.CfjXHa_railRowActive{background:#f59e0b1a}.CfjXHa_railRowActive:hover{background:#f59e0b29}.CfjXHa_railButton{appearance:none;min-width:0;color:var(--dsw-alias-label-secondary);font:inherit;text-align:left;cursor:pointer;background:0 0;border:none;border-radius:6px;flex:auto;align-items:center;gap:6px;padding:4px 6px;font-size:12px;line-height:20px;display:flex}.CfjXHa_railRowActive .CfjXHa_railButton{color:var(--qp-orange,#f59e0b);font-weight:500}.CfjXHa_railName{text-overflow:ellipsis;white-space:nowrap;flex:auto;min-width:0;overflow:hidden}.CfjXHa_railCount{color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-fill-tertiary);border-radius:999px;flex:none;padding:0 6px;font-size:10px;line-height:16px}.CfjXHa_railActions{opacity:0;flex:none;align-items:center;gap:0;transition:opacity .12s;display:flex}.CfjXHa_railRow:hover .CfjXHa_railActions,.CfjXHa_railRowActive .CfjXHa_railActions{opacity:1}.CfjXHa_railInput{box-sizing:border-box;border:1px solid var(--dsw-alias-state-business-primary,var(--dsw-alias-accent));background:var(--dsw-alias-fill-primary);min-width:0;height:26px;color:var(--dsw-alias-text-primary);font:inherit;border-radius:6px;outline:none;flex:auto;padding:0 6px;font-size:12px}.CfjXHa_railAdd{appearance:none;border:1px dashed var(--dsw-alias-border-l2);color:var(--dsw-alias-label-tertiary);font:inherit;cursor:pointer;background:0 0;border-radius:7px;justify-content:center;align-items:center;gap:4px;margin-top:4px;padding:4px 8px;font-size:12px;line-height:20px;transition:color .12s,border-color .12s,background .12s;display:inline-flex}.CfjXHa_railAdd:hover{color:var(--qp-orange,#f59e0b);border-color:var(--qp-orange,#f59e0b);background:#f59e0b0f}.CfjXHa_pane{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-fill-secondary,transparent);border-radius:10px;flex-direction:column;flex:auto;gap:6px;min-width:0;min-height:0;padding:8px;display:flex}.CfjXHa_paneHeader{align-items:center;gap:8px;padding:0 4px;display:flex}.CfjXHa_paneTitle{color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:600;line-height:20px;overflow:hidden}.CfjXHa_paneBody{flex-direction:column;flex:auto;min-height:0;padding:2px;display:flex;overflow-y:auto}.CfjXHa_group{flex-direction:column;gap:6px;display:flex}.CfjXHa_groupHeader{border-bottom:1px solid var(--dsw-alias-border-l1);align-items:center;gap:8px;padding:2px 4px;display:flex}.CfjXHa_groupName{color:var(--dsw-alias-label-primary);font-size:12px;font-weight:600;line-height:20px}.CfjXHa_groupCount{color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-fill-secondary);border-radius:999px;padding:0 8px;font-size:11px;line-height:18px}.CfjXHa_list{flex-direction:column;gap:10px;padding-right:2px;display:flex;overflow-y:auto}.CfjXHa_row{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-fill-secondary,transparent);border-radius:10px;flex-direction:column;gap:6px;padding:10px;display:flex}.CfjXHa_rowHeader{align-items:center;gap:6px;display:flex}.CfjXHa_rowIndex{text-align:center;width:18px;color:var(--dsw-alias-label-tertiary);flex:none;font-size:11px;line-height:18px}.CfjXHa_rowActions{flex:none;align-items:center;gap:4px;margin-left:auto;display:flex}.CfjXHa_iconButton{width:22px;height:22px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;border-radius:5px;justify-content:center;align-items:center;padding:0;transition:color .12s,background .12s;display:inline-flex}.CfjXHa_iconButton:hover:not(:disabled){color:var(--dsw-alias-label-primary);background:var(--dsw-alias-fill-tertiary)}.CfjXHa_iconButton:disabled{opacity:.35;cursor:default}.CfjXHa_iconButton.CfjXHa_danger{color:var(--dsw-alias-text-danger,#d33)}.CfjXHa_iconButton.CfjXHa_danger:hover:not(:disabled){color:var(--dsw-alias-text-danger,#d33);background:color-mix(in srgb, var(--dsw-alias-text-danger,#d33) 12%, transparent)}.CfjXHa_icon{width:13px;height:13px;display:block}.CfjXHa_arrowIcon{font-size:14px;font-weight:600;line-height:16px;display:block}.CfjXHa_managerBody{flex-direction:column;flex:auto;gap:8px;min-height:0;padding:2px;display:flex;overflow-y:auto}.CfjXHa_importZone{border:1px dashed var(--dsw-alias-border-l2);border-radius:8px;align-items:center;gap:8px;padding:8px;display:flex}.CfjXHa_importTextarea{box-sizing:border-box;resize:none;height:26px;min-height:0;color:var(--dsw-alias-text-primary);font:inherit;background:0 0;border:none;outline:none;flex:auto;padding:3px 8px;font-size:12px;line-height:18px}.CfjXHa_addRow{justify-content:center;padding:4px 0 8px;display:flex}";
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
			"actionsDivider": "CfjXHa_actionsDivider",
			"addRow": "CfjXHa_addRow",
			"arrowIcon": "CfjXHa_arrowIcon",
			"button": "CfjXHa_button",
			"card": "CfjXHa_card",
			"chip": "CfjXHa_chip",
			"chipLabel": "CfjXHa_chipLabel",
			"chipRow": "CfjXHa_chipRow",
			"confirmCard": "CfjXHa_confirmCard",
			"danger": "CfjXHa_danger",
			"dangerPrimary": "CfjXHa_dangerPrimary",
			"dock": "CfjXHa_dock",
			"dockHint": "CfjXHa_dockHint",
			"dockSpacer": "CfjXHa_dockSpacer",
			"dockTag": "CfjXHa_dockTag",
			"dockTagIcon": "CfjXHa_dockTagIcon",
			"dockTop": "CfjXHa_dockTop",
			"editorCard": "CfjXHa_editorCard",
			"fieldSection": "CfjXHa_fieldSection",
			"gear": "CfjXHa_gear",
			"gearIcon": "CfjXHa_gearIcon",
			"group": "CfjXHa_group",
			"groupCount": "CfjXHa_groupCount",
			"groupHeader": "CfjXHa_groupHeader",
			"groupName": "CfjXHa_groupName",
			"highlightBack": "CfjXHa_highlightBack",
			"highlightFront": "CfjXHa_highlightFront",
			"highlightWrap": "CfjXHa_highlightWrap",
			"hint": "CfjXHa_hint",
			"icon": "CfjXHa_icon",
			"iconButton": "CfjXHa_iconButton",
			"importTextarea": "CfjXHa_importTextarea",
			"importZone": "CfjXHa_importZone",
			"label": "CfjXHa_label",
			"list": "CfjXHa_list",
			"managerBody": "CfjXHa_managerBody",
			"managerCard": "CfjXHa_managerCard",
			"managerSplit": "CfjXHa_managerSplit",
			"overlay": "CfjXHa_overlay",
			"pane": "CfjXHa_pane",
			"paneBody": "CfjXHa_paneBody",
			"paneHeader": "CfjXHa_paneHeader",
			"paneTitle": "CfjXHa_paneTitle",
			"placeholderHighlight": "CfjXHa_placeholderHighlight",
			"placeholderInput": "CfjXHa_placeholderInput",
			"placeholderName": "CfjXHa_placeholderName",
			"placeholderRow": "CfjXHa_placeholderRow",
			"previewBox": "CfjXHa_previewBox",
			"previewCard": "CfjXHa_previewCard",
			"previewEdit": "CfjXHa_previewEdit",
			"previewEmpty": "CfjXHa_previewEmpty",
			"previewWrap": "CfjXHa_previewWrap",
			"primary": "CfjXHa_primary",
			"quickPromptsFade": "CfjXHa_quickPromptsFade",
			"quickPromptsPop": "CfjXHa_quickPromptsPop",
			"rail": "CfjXHa_rail",
			"railActions": "CfjXHa_railActions",
			"railAdd": "CfjXHa_railAdd",
			"railButton": "CfjXHa_railButton",
			"railCount": "CfjXHa_railCount",
			"railHeader": "CfjXHa_railHeader",
			"railInput": "CfjXHa_railInput",
			"railList": "CfjXHa_railList",
			"railName": "CfjXHa_railName",
			"railRow": "CfjXHa_railRow",
			"railRowActive": "CfjXHa_railRowActive",
			"railTitle": "CfjXHa_railTitle",
			"row": "CfjXHa_row",
			"rowActions": "CfjXHa_rowActions",
			"rowHeader": "CfjXHa_rowHeader",
			"rowIndex": "CfjXHa_rowIndex",
			"sendButton": "CfjXHa_sendButton",
			"sendIcon": "CfjXHa_sendIcon",
			"smallInput": "CfjXHa_smallInput",
			"spacer": "CfjXHa_spacer",
			"tab": "CfjXHa_tab",
			"tabActive": "CfjXHa_tabActive",
			"tabs": "CfjXHa_tabs",
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
		* Render template text with every `{{placeholder}}` span wrapped in the
		* orange highlight style. Used by the read-only preview boxes and by the
		* highlight layer underneath the editable textarea.
		*/
		function renderHighlighted(text) {
			const nodes = [];
			let last = 0;
			for (const match of text.matchAll(PLACEHOLDER_PATTERN)) {
				const index = match.index ?? 0;
				if (index > last) nodes.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: text.slice(last, index) }, `t${last}`));
				nodes.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: quick_prompts_module_css_default.placeholderHighlight,
					children: match[0]
				}, `p${index}`));
				last = index + match[0].length;
			}
			if (last < text.length) nodes.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: text.slice(last) }, `t${last}`));
			return nodes;
		}
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
					className: `${quick_prompts_module_css_default.card} ${quick_prompts_module_css_default.previewCard}`,
					role: "dialog",
					"aria-modal": "true",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: quick_prompts_module_css_default.title,
							children: t("preview.title")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: quick_prompts_module_css_default.fieldSection,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: quick_prompts_module_css_default.label,
								children: t("preview.label")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								className: quick_prompts_module_css_default.smallInput,
								value: item.label,
								readOnly: true,
								"aria-label": t("preview.label")
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: quick_prompts_module_css_default.fieldSection,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: quick_prompts_module_css_default.label,
								children: t("preview.textHint")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: quick_prompts_module_css_default.highlightWrap,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
									className: quick_prompts_module_css_default.highlightBack,
									"aria-hidden": "true",
									children: renderHighlighted(text)
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
									className: `${quick_prompts_module_css_default.textarea} ${quick_prompts_module_css_default.highlightFront}`,
									value: text,
									onChange: (e) => setText(e.target.value),
									autoFocus: true,
									spellCheck: false
								})]
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: quick_prompts_module_css_default.fieldSection,
							children: placeholders.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
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
										className: `${quick_prompts_module_css_default.smallInput} ${quick_prompts_module_css_default.placeholderInput}`,
										value: values[field.name] ?? "",
										placeholder: t("preview.fillValue"),
										onChange: (e) => setValues((prev) => ({
											...prev,
											[field.name]: e.target.value
										}))
									})]
								}, field.name))
							})] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: quick_prompts_module_css_default.hint,
								children: t("preview.placeholderEmpty")
							})
						}),
						fromSend ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: quick_prompts_module_css_default.fieldSection,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
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
							})
						}),
						sendError !== null && sendError !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: quick_prompts_module_css_default.hint,
							style: { color: "var(--dsw-alias-text-danger, #d33)" },
							children: sendError
						}) : null,
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: `${quick_prompts_module_css_default.actions} ${quick_prompts_module_css_default.actionsDivider}`,
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
		* Manager modal: two-pane layout. The LEFT rail lists the features
		* (add / rename / delete), the RIGHT pane shows the prompts of the selected
		* feature (add / edit / remove / reorder / import / export). New prompts are
		* created inside the selected feature automatically — no category input on
		* the rows. Edits stage in local state and are committed to the settings
		* namespace only on Save.
		*/
		/** Validate one imported entry and normalize it, or return null. */
		function normalizeImported(raw) {
			if (typeof raw !== "object" || raw === null) return null;
			const label = typeof raw.label === "string" ? raw.label.trim() : "";
			const text = typeof raw.text === "string" ? raw.text : "";
			if (label === "" && text === "") return null;
			const category = typeof raw.category === "string" ? raw.category.trim() : "";
			return {
				label: label || text.slice(0, 16),
				text,
				...category !== "" ? { category } : {}
			};
		}
		function newPrompt(categoryId) {
			return {
				id: crypto.randomUUID(),
				label: "",
				text: "",
				categoryId
			};
		}
		function newCategory(name) {
			return {
				id: crypto.randomUUID(),
				name
			};
		}
		/** Small inline icons (no icon dependency): ↑↓ as text arrows, rest SVG. */
		const ICONS = {
			up: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: quick_prompts_module_css_default.arrowIcon,
				"aria-hidden": "true",
				children: "↑"
			}),
			down: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: quick_prompts_module_css_default.arrowIcon,
				"aria-hidden": "true",
				children: "↓"
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
			}),
			rename: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				className: quick_prompts_module_css_default.icon,
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.4",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M11.3 2.7l2 2L5.5 12.5l-2.8.8.8-2.8 7.8-7.8z" })
			}),
			add: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				className: quick_prompts_module_css_default.icon,
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.6",
				strokeLinecap: "round",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 3v10M3 8h10" })
			}),
			done: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				className: quick_prompts_module_css_default.icon,
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.6",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 8.5 6.5 12 13 4.5" })
			})
		};
		/**
		* The manager modal. `categories` and `prompts` are local staging copies;
		* Save commits both through `scope.set` (official settings write path,
		* revision-fenced), Cancel discards them.
		*/
		function ManagerModal(props) {
			const { scope, snapshot, onClose, t } = props;
			const [staged, setStaged] = (0, react.useState)(() => {
				const stored = snapshot.status === "ready" ? normalizeSettings(snapshot.value) : void 0;
				return {
					categories: (stored?.categories ?? []).map((c) => ({ ...c })),
					prompts: (stored?.prompts ?? []).map((p) => ({ ...p }))
				};
			});
			const [selectedId, setSelectedId] = (0, react.useState)(() => {
				const categories = (snapshot.status === "ready" ? normalizeSettings(snapshot.value) : void 0)?.categories ?? [];
				return categories.length > 0 ? categories[0].id : null;
			});
			/** Category id being renamed inline ('' input value lives in renameDraft). */
			const [renamingId, setRenamingId] = (0, react.useState)(null);
			const [renameDraft, setRenameDraft] = (0, react.useState)("");
			/** Category id being added inline ('' = no add input open). */
			const [addingCategory, setAddingCategory] = (0, react.useState)(false);
			const [categoryDraft, setCategoryDraft] = (0, react.useState)("");
			const [importOpen, setImportOpen] = (0, react.useState)(false);
			const [importText, setImportText] = (0, react.useState)("");
			const [notice, setNotice] = (0, react.useState)(null);
			const [saving, setSaving] = (0, react.useState)(false);
			/** Prompt open in the dedicated editor dialog (null = no dialog open). */
			const [editor, setEditor] = (0, react.useState)(null);
			/** Delete confirmation: kind + target id + display label. */
			const [confirm, setConfirm] = (0, react.useState)(null);
			const { categories, prompts } = staged;
			const selected = categories.find((c) => c.id === selectedId) ?? null;
			const selectedPrompts = prompts.filter((p) => p.categoryId === selectedId);
			const uncategorizedCount = prompts.filter((p) => p.categoryId === "").length;
			const patchPrompt = (id, field, value) => {
				setStaged((prev) => ({
					...prev,
					prompts: prev.prompts.map((p) => p.id === id ? {
						...p,
						[field]: value
					} : p)
				}));
				setNotice(null);
			};
			const movePrompt = (id, delta) => {
				setStaged((prev) => {
					const next = [...prev.prompts];
					const index = next.findIndex((p) => p.id === id);
					const target = index + delta;
					if (index < 0 || target < 0 || target >= next.length) return prev;
					if (next[target].categoryId !== next[index].categoryId) return prev;
					[next[index], next[target]] = [next[target], next[index]];
					return {
						...prev,
						prompts: next
					};
				});
				setNotice(null);
			};
			const removePrompt = (id) => {
				setStaged((prev) => ({
					...prev,
					prompts: prev.prompts.filter((p) => p.id !== id)
				}));
				setNotice(null);
			};
			const addPrompt = (categoryId) => {
				const item = newPrompt(categoryId);
				setStaged((prev) => ({
					...prev,
					prompts: [...prev.prompts, item]
				}));
				setEditor({
					id: item.id,
					label: item.label,
					text: item.text
				});
				setNotice(null);
			};
			/** Commit the editor dialog draft into the staged list and close it. */
			const commitEditor = () => {
				if (editor === null) return;
				patchPrompt(editor.id, "label", editor.label);
				patchPrompt(editor.id, "text", editor.text);
				setEditor(null);
				setNotice(null);
			};
			const addCategory = () => {
				const name = categoryDraft.trim();
				if (name === "") return;
				const category = newCategory(name);
				setStaged((prev) => ({
					...prev,
					categories: [...prev.categories, category]
				}));
				setSelectedId(category.id);
				setCategoryDraft("");
				setAddingCategory(false);
				setNotice(null);
			};
			const startRename = (category) => {
				setRenamingId(category.id);
				setRenameDraft(category.name);
			};
			const commitRename = () => {
				const id = renamingId;
				const name = renameDraft.trim();
				setRenamingId(null);
				if (id === null || name === "") return;
				setStaged((prev) => ({
					...prev,
					categories: prev.categories.map((c) => c.id === id ? {
						...c,
						name
					} : c)
				}));
				setNotice(null);
			};
			const removeCategory = (id) => {
				setStaged((prev) => ({
					categories: prev.categories.filter((c) => c.id !== id),
					prompts: prev.prompts.filter((p) => p.categoryId !== id)
				}));
				if (selectedId === id) setSelectedId(null);
				setNotice(null);
			};
			/** Run the confirmed delete (category deletes its prompts too). */
			const confirmDelete = () => {
				if (confirm === null) return;
				if (confirm.kind === "category") removeCategory(confirm.id);
				else removePrompt(confirm.id);
				setConfirm(null);
			};
			const doImport = () => {
				try {
					const parsed = JSON.parse(importText);
					if (!Array.isArray(parsed)) throw new Error("expected an array");
					const normalized = parsed.map((raw) => normalizeImported(raw)).filter((p) => p !== null);
					if (normalized.length === 0) throw new Error("no valid entries");
					setStaged((prev) => {
						const cats = [...prev.categories];
						const byName = new Map(cats.map((c) => [c.name, c]));
						const prompts = [...prev.prompts];
						for (const entry of normalized) {
							let categoryId = selectedId ?? "";
							if (entry.category !== void 0 && entry.category !== "") {
								let category = byName.get(entry.category);
								if (category === void 0) {
									category = newCategory(entry.category);
									byName.set(entry.category, category);
									cats.push(category);
								}
								categoryId = category.id;
							}
							prompts.push({
								id: crypto.randomUUID(),
								label: entry.label,
								text: entry.text,
								categoryId
							});
						}
						return {
							categories: cats,
							prompts
						};
					});
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
				const nameOf = new Map(categories.map((c) => [c.id, c.name]));
				const payload = prompts.map(({ label, text, categoryId }) => ({
					label,
					text,
					...categoryId !== "" && nameOf.has(categoryId) ? { category: nameOf.get(categoryId) } : {}
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
					const cleanCategories = categories.filter((c) => c.name.trim() !== "");
					const cleanPrompts = prompts.filter((p) => p.label.trim() !== "" || p.text.trim() !== "").map((p) => ({
						...p,
						label: p.label.trim(),
						categoryId: cleanCategories.some((c) => c.id === p.categoryId) ? p.categoryId : ""
					}));
					await scope.set("categories", cleanCategories);
					await scope.set("prompts", cleanPrompts);
					onClose();
				} catch {
					setSaving(false);
				}
			};
			const stored = snapshot.status === "ready" ? normalizeSettings(snapshot.value) : {
				categories: [],
				prompts: []
			};
			const dirty = JSON.stringify(staged) !== JSON.stringify({
				categories: stored.categories,
				prompts: stored.prompts
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: quick_prompts_module_css_default.overlay,
					onMouseDown: (e) => {
						if (e.target === e.currentTarget) onClose();
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: `${quick_prompts_module_css_default.card} ${quick_prompts_module_css_default.managerCard}`,
						role: "dialog",
						"aria-modal": "true",
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
								className: quick_prompts_module_css_default.managerSplit,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: quick_prompts_module_css_default.rail,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: quick_prompts_module_css_default.railHeader,
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: quick_prompts_module_css_default.railTitle,
											children: t("manager.railTitle")
										})
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: quick_prompts_module_css_default.railList,
										children: [
											categories.map((category) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
												className: `${quick_prompts_module_css_default.railRow}${selectedId === category.id ? ` ${quick_prompts_module_css_default.railRowActive}` : ""}`,
												children: [renamingId === category.id ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
													className: quick_prompts_module_css_default.railInput,
													value: renameDraft,
													autoFocus: true,
													onChange: (e) => setRenameDraft(e.target.value),
													onBlur: commitRename,
													onKeyDown: (e) => {
														if (e.key === "Enter") commitRename();
														if (e.key === "Escape") setRenamingId(null);
													}
												}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
													type: "button",
													className: quick_prompts_module_css_default.railButton,
													onClick: () => setSelectedId(category.id),
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: quick_prompts_module_css_default.railName,
														children: category.name
													}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: quick_prompts_module_css_default.railCount,
														children: String(prompts.filter((p) => p.categoryId === category.id).length)
													})]
												}), renamingId !== category.id ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
													className: quick_prompts_module_css_default.railActions,
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: quick_prompts_module_css_default.iconButton,
														title: t("manager.rename"),
														onClick: () => startRename(category),
														children: ICONS.rename
													}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: `${quick_prompts_module_css_default.iconButton} ${quick_prompts_module_css_default.danger}`,
														title: t("manager.removeCategory"),
														onClick: () => setConfirm({
															kind: "category",
															id: category.id,
															label: category.name
														}),
														children: ICONS.trash
													})]
												}) : null]
											}, category.id)),
											uncategorizedCount > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: `${quick_prompts_module_css_default.railRow}${selectedId === "" ? ` ${quick_prompts_module_css_default.railRowActive}` : ""}`,
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
													type: "button",
													className: quick_prompts_module_css_default.railButton,
													onClick: () => setSelectedId(""),
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: quick_prompts_module_css_default.railName,
														children: t("dock.uncategorized")
													}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: quick_prompts_module_css_default.railCount,
														children: String(uncategorizedCount)
													})]
												})
											}) : null,
											addingCategory ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: quick_prompts_module_css_default.railRow,
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
													className: quick_prompts_module_css_default.railInput,
													value: categoryDraft,
													autoFocus: true,
													placeholder: t("manager.categoryPlaceholder"),
													onChange: (e) => setCategoryDraft(e.target.value),
													onKeyDown: (e) => {
														if (e.key === "Enter") addCategory();
														if (e.key === "Escape") {
															setAddingCategory(false);
															setCategoryDraft("");
														}
													}
												})
											}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
												type: "button",
												className: quick_prompts_module_css_default.railAdd,
												onClick: () => setAddingCategory(true),
												children: [ICONS.add, t("manager.addCategory")]
											})
										]
									})]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: quick_prompts_module_css_default.pane,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: quick_prompts_module_css_default.paneHeader,
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: quick_prompts_module_css_default.paneTitle,
												children: selected !== null ? selected.name : selectedId === "" ? t("dock.uncategorized") : ""
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: quick_prompts_module_css_default.dockSpacer }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
												type: "button",
												className: quick_prompts_module_css_default.button,
												style: {
													lineHeight: "20px",
													padding: "0 8px"
												},
												onClick: () => {
													if (selectedId !== null) addPrompt(selectedId);
												},
												disabled: selectedId === null,
												children: [ICONS.add, t("manager.addPrompt")]
											})
										]
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: quick_prompts_module_css_default.paneBody,
										children: selectedPrompts.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: quick_prompts_module_css_default.hint,
											style: {
												padding: "16px 0",
												textAlign: "center"
											},
											children: selectedId === null ? t("manager.selectFeature") : t("manager.groupEmpty")
										}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: quick_prompts_module_css_default.list,
											children: selectedPrompts.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
												className: quick_prompts_module_css_default.row,
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													className: quick_prompts_module_css_default.rowHeader,
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
														className: quick_prompts_module_css_default.smallInput,
														style: {
															flex: "none",
															width: 150
														},
														value: item.label,
														placeholder: t("manager.labelField"),
														onChange: (e) => patchPrompt(item.id, "label", e.target.value)
													}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
														className: quick_prompts_module_css_default.rowActions,
														children: [
															/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
																type: "button",
																className: quick_prompts_module_css_default.iconButton,
																title: t("manager.moveUp"),
																onClick: () => movePrompt(item.id, -1),
																children: ICONS.up
															}),
															/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
																type: "button",
																className: quick_prompts_module_css_default.iconButton,
																title: t("manager.moveDown"),
																onClick: () => movePrompt(item.id, 1),
																children: ICONS.down
															}),
															/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
																type: "button",
																className: `${quick_prompts_module_css_default.iconButton} ${quick_prompts_module_css_default.danger}`,
																title: t("manager.remove"),
																onClick: () => setConfirm({
																	kind: "prompt",
																	id: item.id,
																	label: item.label
																}),
																children: ICONS.trash
															})
														]
													})]
												}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													className: quick_prompts_module_css_default.previewWrap,
													children: [item.text !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
														className: quick_prompts_module_css_default.previewBox,
														children: renderHighlighted(item.text)
													}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: quick_prompts_module_css_default.previewEmpty,
														children: t("manager.textField")
													}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: quick_prompts_module_css_default.previewEdit,
														title: t("preview.edit"),
														"aria-label": t("preview.edit"),
														onClick: () => setEditor({
															id: item.id,
															label: item.label,
															text: item.text
														}),
														children: ICONS.rename
													})]
												})]
											}, item.id))
										})
									})]
								})]
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
							}) : null,
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
										disabled: prompts.length === 0,
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
				}),
				editor !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: quick_prompts_module_css_default.overlay,
					style: { zIndex: 1100 },
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: `${quick_prompts_module_css_default.card} ${quick_prompts_module_css_default.editorCard}`,
						role: "dialog",
						"aria-modal": "true",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: quick_prompts_module_css_default.title,
								children: t("manager.editPromptTitle")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: quick_prompts_module_css_default.fieldSection,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: quick_prompts_module_css_default.label,
									children: t("manager.labelField")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									className: quick_prompts_module_css_default.smallInput,
									value: editor.label,
									placeholder: t("manager.labelField"),
									onChange: (e) => setEditor((prev) => prev === null ? prev : {
										...prev,
										label: e.target.value
									})
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: quick_prompts_module_css_default.fieldSection,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: quick_prompts_module_css_default.label,
									children: t("manager.textField")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: quick_prompts_module_css_default.highlightWrap,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
										className: quick_prompts_module_css_default.highlightBack,
										"aria-hidden": "true",
										children: renderHighlighted(editor.text)
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
										className: `${quick_prompts_module_css_default.textarea} ${quick_prompts_module_css_default.highlightFront}`,
										value: editor.text,
										placeholder: t("manager.textField"),
										onChange: (e) => setEditor((prev) => prev === null ? prev : {
											...prev,
											text: e.target.value
										}),
										spellCheck: false,
										autoFocus: true
									})]
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: `${quick_prompts_module_css_default.actions} ${quick_prompts_module_css_default.actionsDivider}`,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: quick_prompts_module_css_default.hint,
										children: t("manager.editPromptHint")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: quick_prompts_module_css_default.spacer }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: quick_prompts_module_css_default.button,
										onClick: () => setEditor(null),
										children: t("manager.cancel")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: quick_prompts_module_css_default.primary,
										disabled: editor.label.trim() === "" && editor.text.trim() === "",
										onClick: commitEditor,
										children: t("manager.save")
									})
								]
							})
						]
					})
				}) : null,
				confirm !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: quick_prompts_module_css_default.overlay,
					style: { zIndex: 1200 },
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: `${quick_prompts_module_css_default.card} ${quick_prompts_module_css_default.confirmCard}`,
						role: "alertdialog",
						"aria-modal": "true",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: quick_prompts_module_css_default.title,
								children: t("manager.confirmDeleteTitle")
							}),
							confirm.kind === "category" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: quick_prompts_module_css_default.hint,
								children: t("manager.confirmDeleteCategory", {
									name: confirm.label,
									count: String(prompts.filter((p) => p.categoryId === confirm.id).length)
								})
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: quick_prompts_module_css_default.hint,
								children: t("manager.confirmDeletePrompt", { name: confirm.label.trim() !== "" ? confirm.label : t("manager.unnamed") })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: `${quick_prompts_module_css_default.actions} ${quick_prompts_module_css_default.actionsDivider}`,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: quick_prompts_module_css_default.spacer }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: quick_prompts_module_css_default.button,
										onClick: () => setConfirm(null),
										children: t("manager.cancel")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: quick_prompts_module_css_default.dangerPrimary,
										onClick: confirmDelete,
										children: t("manager.delete")
									})
								]
							})
						]
					})
				}) : null
			] });
		}
		//#endregion
		//#region src/client/QuickPromptsDock.tsx
		/**
		* The quick-prompts composer dock: feature tabs plus the prompt chips of the
		* selected feature, above the composer.
		*
		* - Feature tabs (All / each category) filter which prompts are shown.
		* - Click a chip → preview/editor modal (edit the template for this one use,
		*   fill {{placeholders}}, then sync into the input or send directly).
		* - Click the paper-plane next to a chip → send directly, unless the template
		*   has {{placeholders}} (then the preview modal opens so the user can fill).
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
		/**
		* Feature tabs for the dock: every registered feature plus the
		* "uncategorized" pseudo-feature when any prompt is uncategorized.
		*/
		function featureTabs(categories, hasUncategorized) {
			const tabs = categories.map((category) => ({
				key: category.id,
				name: category.name
			}));
			if (hasUncategorized) tabs.push({
				key: "",
				name: ""
			});
			return tabs;
		}
		/** The composer dock. Renders nothing while settings are loading. */
		const QuickPromptsDock = (0, react.memo)(function QuickPromptsDock(props) {
			const { scope, insertIntoInput, sendPrompt, session, t } = props;
			const [snapshot, setSnapshot] = (0, react.useState)(() => scope.getSnapshot());
			const [preview, setPreview] = (0, react.useState)(null);
			const [managerOpen, setManagerOpen] = (0, react.useState)(false);
			const [sending, setSending] = (0, react.useState)(false);
			const [sendError, setSendError] = (0, react.useState)(null);
			/** Selected feature id; null = All. '' = uncategorized. */
			const [feature, setFeature] = (0, react.useState)(null);
			(0, react.useEffect)(() => scope.subscribe(() => setSnapshot(scope.getSnapshot())), [scope]);
			if (snapshot.status !== "ready") return null;
			const { categories, prompts } = normalizeSettings(snapshot.value);
			const tabs = featureTabs(categories, prompts.some((p) => p.categoryId === ""));
			const visible = feature === null ? prompts : prompts.filter((p) => p.categoryId === feature);
			(0, react.useEffect)(() => {
				if (feature !== null && !tabs.some((tab) => tab.key === feature)) setFeature(null);
			}, [feature, tabs]);
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
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: quick_prompts_module_css_default.dockTop,
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
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: quick_prompts_module_css_default.tabs,
								role: "tablist",
								"aria-label": "features",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									role: "tab",
									"aria-selected": feature === null,
									className: `${quick_prompts_module_css_default.tab}${feature === null ? ` ${quick_prompts_module_css_default.tabActive}` : ""}`,
									onClick: () => setFeature(null),
									children: t("dock.all")
								}), tabs.map((tab) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									role: "tab",
									"aria-selected": feature === tab.key,
									className: `${quick_prompts_module_css_default.tab}${feature === tab.key ? ` ${quick_prompts_module_css_default.tabActive}` : ""}`,
									onClick: () => setFeature(tab.key),
									children: tab.name === "" ? t("dock.uncategorized") : tab.name
								}, tab.key === "" ? "__uncat__" : tab.key))]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: quick_prompts_module_css_default.dockSpacer }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: quick_prompts_module_css_default.gear,
								title: t("dock.manage"),
								onClick: () => setManagerOpen(true),
								children: GEAR_ICON
							})
						]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: quick_prompts_module_css_default.chipRow,
						children: [visible.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
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
						}, item.id)), visible.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: quick_prompts_module_css_default.dockHint,
							children: feature === null ? t("manager.empty") : t("dock.noPrompts")
						}) : null]
					})]
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
			"dock.all": "全部",
			"dock.uncategorized": "未分类",
			"dock.noPrompts": "该功能下暂无指令",
			"pill.send": "直接发送",
			"pill.preview": "预览并编辑",
			"pill.placeholderHint": "含 {{占位符}}，点击预览填写",
			"preview.title": "指令预览",
			"preview.label": "名称",
			"preview.textHint": "可编辑全文；{{占位符}} 会在同步/发送时替换为下方填写的值",
			"preview.edit": "编辑",
			"preview.done": "完成编辑",
			"preview.placeholderSection": "占位符参数",
			"preview.fillValue": "输入填充值",
			"preview.placeholderEmpty": "没有占位符，可直接同步或发送",
			"preview.appendMode": "追加到输入框末尾",
			"preview.replaceMode": "覆盖输入框已有内容",
			"preview.cancel": "取消",
			"preview.syncToInput": "同步到输入框",
			"preview.send": "直接发送",
			"preview.sendFailed": "发送失败：{reason}",
			"manager.title": "管理快捷指令",
			"manager.railTitle": "功能区",
			"manager.addPrompt": "新增 prompt",
			"manager.addCategory": "新增功能",
			"manager.rename": "重命名",
			"manager.removeCategory": "删除功能",
			"manager.categoryPlaceholder": "功能名称",
			"manager.selectFeature": "请选择左侧功能",
			"manager.add": "新增指令",
			"manager.save": "保存",
			"manager.cancel": "取消",
			"manager.moveUp": "上移",
			"manager.moveDown": "下移",
			"manager.remove": "删除",
			"manager.labelField": "按钮名称",
			"manager.textField": "指令内容（支持 {{占位符}}）",
			"manager.groupEmpty": "该功能下暂无指令",
			"manager.empty": "还没有指令，点击「新增指令」开始",
			"manager.import": "导入",
			"manager.export": "导出",
			"manager.importTitle": "导入指令（粘贴 JSON）",
			"manager.importPlaceholder": "[{\"label\": \"按钮名\", \"text\": \"指令内容\", \"category\": \"功能名\"}, …]",
			"manager.importDone": "已导入 {count} 条指令",
			"manager.importError": "导入失败：{reason}",
			"manager.exportHint": "导出为 JSON 文件，可分享给其他人导入",
			"manager.dirty": "有未保存的修改",
			"manager.editPromptTitle": "编辑指令",
			"manager.editPromptHint": "修改仅在点击保存后生效",
			"manager.confirmDeleteTitle": "删除确认",
			"manager.confirmDeleteCategory": "确定删除功能「{name}」？其下 {count} 条指令将一并删除",
			"manager.confirmDeletePrompt": "确定删除指令「{name}」？",
			"manager.delete": "删除",
			"manager.unnamed": "未命名"
		};
		const en = {
			"dock.title": "Quick prompts",
			"dock.manage": "Manage prompts",
			"dock.all": "All",
			"dock.uncategorized": "Uncategorized",
			"dock.noPrompts": "No prompts in this feature",
			"pill.send": "Send directly",
			"pill.preview": "Preview and edit",
			"pill.placeholderHint": "Contains {{placeholders}} — click to fill in",
			"preview.title": "Prompt preview",
			"preview.label": "Name",
			"preview.textHint": "Editable template; {{placeholders}} are replaced with the values below on sync/send",
			"preview.edit": "Edit",
			"preview.done": "Done editing",
			"preview.placeholderSection": "Placeholders",
			"preview.fillValue": "Enter fill value",
			"preview.placeholderEmpty": "No placeholders — sync or send directly",
			"preview.appendMode": "Append to the end of the input",
			"preview.replaceMode": "Replace the current input content",
			"preview.cancel": "Cancel",
			"preview.syncToInput": "Sync to input",
			"preview.send": "Send directly",
			"preview.sendFailed": "Send failed: {reason}",
			"manager.title": "Manage quick prompts",
			"manager.railTitle": "Features",
			"manager.addPrompt": "Add prompt",
			"manager.addCategory": "Add feature",
			"manager.rename": "Rename",
			"manager.removeCategory": "Delete feature",
			"manager.categoryPlaceholder": "Feature name",
			"manager.selectFeature": "Select a feature on the left",
			"manager.add": "Add prompt",
			"manager.save": "Save",
			"manager.cancel": "Cancel",
			"manager.moveUp": "Move up",
			"manager.moveDown": "Move down",
			"manager.remove": "Remove",
			"manager.labelField": "Button label",
			"manager.textField": "Prompt text ({{placeholders}} supported)",
			"manager.groupEmpty": "No prompts in this feature",
			"manager.empty": "No prompts yet — click \"Add prompt\" to start",
			"manager.import": "Import",
			"manager.export": "Export",
			"manager.importTitle": "Import prompts (paste JSON)",
			"manager.importPlaceholder": "[{\"label\": \"Button\", \"text\": \"Prompt text\", \"category\": \"Feature\"}, …]",
			"manager.importDone": "Imported {count} prompts",
			"manager.importError": "Import failed: {reason}",
			"manager.exportHint": "Exports a JSON file you can share with others",
			"manager.dirty": "You have unsaved changes",
			"manager.editPromptTitle": "Edit prompt",
			"manager.editPromptHint": "Changes apply when you save",
			"manager.confirmDeleteTitle": "Confirm delete",
			"manager.confirmDeleteCategory": "Delete feature \"{name}\"? Its {count} prompts will be deleted too",
			"manager.confirmDeletePrompt": "Delete prompt \"{name}\"?",
			"manager.delete": "Delete",
			"manager.unnamed": "Unnamed"
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