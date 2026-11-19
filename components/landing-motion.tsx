'use client'

import { useEffect } from 'react'

// Reveal-once for the landing page's [data-reveal] blocks. Without this script (or with Reduce Motion)
// everything is simply visible: the hidden state only exists under `html.js`, which this adds.
export function LandingMotion() {
  // The journey: the section crossing the middle of the window names the phone's screen (globals.css § journey).
  // Runs under Reduce Motion too; the CSS just swaps screens without the fade.
  useEffect(() => {
    const root = document.querySelector('.landing')
    if (!root) return
    document.documentElement.classList.add('js')
    root.setAttribute('data-screen', 'hero')
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) root.setAttribute('data-screen', (e.target as HTMLElement).dataset.screen!)
    }, { rootMargin: '-50% 0px -50% 0px' })
    root.querySelectorAll('[data-screen]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const root = document.querySelector('.landing')
    if (!root || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const els = [...root.querySelectorAll('[data-reveal]')]
    // Whatever is already on screen stays put, so nothing visible blinks out before it animates.
    for (const el of els) if (el.getBoundingClientRect().top < innerHeight) el.classList.add('is-seen')
    document.documentElement.classList.add('js')
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-seen'); io.unobserve(e.target) }
    }, { rootMargin: '0px 0px -12% 0px' })
    for (const el of els) if (!el.classList.contains('is-seen')) io.observe(el)
    return () => { io.disconnect(); document.documentElement.classList.remove('js') }
  }, [])
  return null
}
