/**
 * Claims the plugin apply slot. Returns true when this call won the slot —
 * a duplicated client injection (module factory executed twice in one page
 * lifetime) must not mount a second dock.
 */
export function claimQuickPromptsApply(): boolean {
  if ((globalThis as { __dshQuickPromptsApplied?: boolean }).__dshQuickPromptsApplied === true) return false
  ;(globalThis as { __dshQuickPromptsApplied?: boolean }).__dshQuickPromptsApplied = true
  return true
}

/** Releases the claim (fiber cleanup) so a hot-reloaded bundle can claim again. */
export function releaseQuickPromptsApply(): void {
  ;(globalThis as { __dshQuickPromptsApplied?: boolean }).__dshQuickPromptsApplied = undefined
}
