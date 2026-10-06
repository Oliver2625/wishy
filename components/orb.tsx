'use client'

import { ThinkingOrb, type ThinkingOrbProps } from 'thinking-orbs'

// thinking-orbs ships no 'use client', so it's wrapped here. By default its theme follows the `dark` class on <html>.
// onInverse: the orb sits on an inverted surface (primary/foreground button), so its ink must be the
// opposite of the page theme. Render one pinned orb per theme and let CSS pick, like the theme toggle icons.
export function Orb({ onInverse, ...props }: ThinkingOrbProps & { onInverse?: boolean }) {
  if (!onInverse) return <ThinkingOrb color="#709775" {...props} />
  return (
    <>
      <ThinkingOrb theme="dark" {...props} className="dark:hidden" />
      <ThinkingOrb theme="light" {...props} className="hidden dark:block" />
    </>
  )
}
