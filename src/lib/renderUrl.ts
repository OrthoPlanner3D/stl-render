/** Link absoluto y compartible del render de un caso (el visor lo abre por URL directa). */
export const renderUrl = (prefix: string) =>
  `${window.location.origin}/app?prefix=${encodeURIComponent(prefix)}`
