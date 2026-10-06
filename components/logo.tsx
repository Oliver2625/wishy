import { cn } from '@/lib/utils'

// Wishy W. Left stroke muted teal in both themes; right stroke hunter (light) / celadon (dark).
// Same drawing as app/icon.svg (the favicon).
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" aria-hidden className={cn('size-10 shrink-0', className)}>
      <g fill="none" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round">
        <path d="M29 100 L79.8 188 L114.4 128 L149 188" stroke="#709775" />
        <path d="M114.4 128 L149 188 L227.5 52" className="stroke-[#415d43] dark:stroke-[#a1cca5]" />
      </g>
    </svg>
  )
}
