import { useState, useEffect } from 'react'

const MOBILE_QUERY = '(max-width: 719px)'
/** Tailwind `lg` starts at 1024px */
const BELOW_LG_QUERY = '(max-width: 1023px)'

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

export function useBreakpoint() {
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const isBelowLg = useMediaQuery(BELOW_LG_QUERY)

  return { isMobile, isBelowLg }
}
