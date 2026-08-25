/**
 * Claims the plugin apply slot. Returns true when this call won the slot —
 * a duplicated client injection (module factory executed twice in one page
 * lifetime) must not mount a second dock.
 */
export declare function claimQuickPromptsApply(): boolean;
/** Releases the claim (fiber cleanup) so a hot-reloaded bundle can claim again. */
export declare function releaseQuickPromptsApply(): void;
