# Design review: Wishy

Reviewed 2026-10-13 against the `apple-design` skill (Apple HIG, pulled 2026). Wishy is a web app, so the
skill's foundations apply in full (accessibility, color, typography, layout, writing, dark mode) and Apple's
platform conventions apply as principles only. Contrast figures are WCAG ratios computed from the hex values
in `app/globals.css`, not estimated.

References read: `accessibility.md`, `typography.md`, `color.md`, `layout.md`, `dark-mode.md`, `buttons.md`,
`alerts.md`, `feedback.md`, `writing.md`, `branding.md`, `tab-bars.md`, `designing-for-ios.md`, `cross-platform.md`.

## Summary

Before: **Critical issues**. After the fixes below: **Good**.

Thesis: a family wishlist that keeps gifts a surprise. People will remember it by the blobatar faces next to
every list and the quiet celadon "surprise" panel. The palette (celadon, hunter, carbon) and DM Sans have a
clear point of view and avoid the three common generated-UI templates. The problems were in the details:
labels, target sizes, two contrast failures, statuses that looked like buttons, and copy that changed names
partway through a flow.

## Critical (all fixed)

- **Header logo link had no accessible name.** The SVG is `aria-hidden` and the link had no text, so a screen
  reader announced an unnamed link.
  `accessibility.md › Vision`: "Describe your app's interface and content for VoiceOver."
  Fix: `aria-label="Wishy, my lists"` on the link (`app/(app)/layout.tsx`).
- **"Resend Code" was a 24px button** (`size="xs"`), below the 28pt mobile minimum, on a screen people mostly
  open on their phone.
  `accessibility.md › Mobility`: iOS default 44x44 pt, minimum 28x28 pt.
  Fix: a full-width 44px "Send a new code" button under "Sign in" (`app/login/page.tsx`).
- **Destructive button text failed contrast in light mode**: `#e7000b` on its own 10% tint was 3.99:1 for
  14px text.
  `accessibility.md › Vision`: text up to 17 pt needs 4.5:1.
  Fix: `--destructive` is now `oklch(0.505 0.213 27.518)`: 5.33:1 on the tint, 6.42:1 on white.
- **Secondary text on muted surfaces failed contrast**: `--muted-foreground #52705a` on `--muted #dceadb` was
  4.40:1.
  Fix: `#4b6853`, now 4.95:1 on muted, 5.40:1 on secondary and higher on cards.

## Improvements

### High

- **App-specific appearance switch** (fixed). The sun/moon toggle overrode the OS setting and was saved per
  browser.
  `dark-mode.md › Best practices`: "Avoid offering an app-specific appearance setting… they may think your app
  is broken because it doesn't respond to their systemwide appearance choice."
  Fix: deleted the header toggle (`components/theme-toggle.tsx`). By default the site follows
  `prefers-color-scheme` live, so it also switches while the page is open (Auto appearance). Added
  `color-scheme` so native checkboxes, radios and scrollbars match the theme.
  Trade-off, decided 2026-10-13: some people want the site dark while their device is light, so Profile has
  an **Appearance** choice: Match device (default), Light or Dark. It is saved per device in `localStorage`
  and read before paint. Because "Match device" is the default and the choice sits in settings rather than the
  header, the guideline's concern (ignoring the system choice by default) is still met.
- **No increased-contrast variant** (fixed).
  `color.md › Best practices`: "supply light and dark variants, and an increased contrast option for each."
  Fix: an `@media (prefers-contrast: more)` block in `globals.css` raises secondary text to 8.9:1 and field
  borders to 3.1:1 (light) / 2.7:1 (dark).
- **Status looked like a button** (fixed). "Reserved by you" was a filled 44px pill and "Reserved by X" a
  dashed 44px box, the same shape as the filled and dashed buttons. "Undo" was a bare link.
  `branding.md`: keep the "sizing, placement, and behavior" of familiar components; `color.md`: "Avoid
  using the same color to mean different things."
  Fix: statuses are now text with an icon (a check in a brand circle, or a lock). The only pressable thing is
  the outline "Unreserve" button (`app/(app)/family/[id]/page.tsx`).
- **Primary color used for non-interactive text** (fixed). "Reserved by X" on the owner's cards used
  `text-primary`, the link color.
  `color.md › Best practices`: "using the same or similar color to stylize noninteractive text is confusing."
  Fix: foreground text with a lock icon, matching the family view.
- **Preview showed a page that doesn't exist** (fixed). "How it will look" on the list form drew a dark
  inverted header, but the page family actually sees is light.
  Fix: the preview header now uses the card surface and muted meta text, like the real page.

### Medium

- **Touch targets below the 44pt default** (fixed): phone nav icons were 40px (now `p-3`, 44px). The card
  Edit and Unreserve buttons were 40px, and Remove access and Clear date were 36px; all are now 44px. Dialog
  footer buttons were 32px and now use 44px with 16px text, matching page buttons. The dialog close button
  went from 28px to 36px. The back link gets padding, giving it a 44px hit area without moving the layout.
  `buttons.md › Best practices`: "a button needs a hit region of at least 44x44 pt."
- **Alert cancel buttons weren't called Cancel** (fixed): "Keep my account", "Keep access", "Keep it".
  `alerts.md › Buttons`: "Always use the title 'Cancel' for a button that cancels an alert's action."
- **Success toasts for changes the page already shows** (fixed). Reserving and unreserving toasted while
  the row itself changed.
  `feedback.md › Best practices`: "people typically expect their action or task to succeed, they only need
  to know when it doesn't." `ActionButton` now toasts errors only.
- **Errors disappeared on a timer** (fixed).
  `accessibility.md › Cognitive`: "Minimize use of time-boxed interface elements… Prefer dismissing views with
  an explicit action." Error toasts now stay until closed.
- **Hover lift on cards that aren't clickable** (fixed). Wish cards and rows rose and cast a shadow on hover,
  though only the title and buttons act. Removed. The family list cards are links and keep the lift.
- **One-off button styles** (fixed). "Invite someone" was brand green, "Fetch details" was inverted black and
  "Edit list" was dashed (dashed means "add" in the sidebar). They are now outline, primary and outline. The
  unused `dashed` variant was deleted.
  `buttons.md › Style`: use style, not novelty, to show the preferred action, with one or two prominent
  buttons per view.
- **Missing pending labels** (fixed). "Save wish", "Save list" and "Create list" only went disabled; they now
  read "Saving…" or "Creating…", as Profile already did. Sign-in reads "Sending…" and "Signing in…".
  `buttons.md › Mobile`: "'Checkout' could change to 'Checking out…'."
- **Page edges jumped between sections** (fixed). Pages were 5xl, 6xl or 7xl wide while the header is 7xl,
  so the left edge moved when switching tabs.
  `layout.md › Visual hierarchy`: "Align elements to make them easier to scan." Every page is now 7xl. The
  family list keeps a 5xl reading column inside, left-aligned.
- **Every tab was titled "Wishy"** (fixed; judgment, WCAG 2.4.2). Titles now read "Family · Wishy",
  "<list title> · Wishy" and so on. `getList` is wrapped in `cache()`, so the title costs no extra query.
- **Empty states without a next step** (fixed).
  `writing.md › Best practices`: "give them a button or link to do so if possible." Added links on My list
  ("Add your first one") and Reserved ("Family"), and guidance on Family and Share.
- **A setting described by location instead of linked** (fixed). "Turn that off under Share → Surprise
  settings" is now a link.
  `writing.md › Best practices`: "provide a direct link or button, rather than trying to describe its
  location."
- **Share page said something false** (fixed). Step 3 always said "Your own view never shows what is
  reserved", even with hiding turned off. The step now follows the list's setting.
- **Not-invited screen was a dead end** (fixed). It now names the account and the fix: "Ask the person who
  runs your family's Wishy to invite you@…, then sign in again."
- **Profile email was a disabled field** (fixed). At 50% opacity the email was hard to read, and it couldn't
  be selected. It is now read-only on a muted fill.

### Low

- **Copy consistency** (fixed). "Log out" became "Sign out", as everywhere else. "Resend Code" was title
  case among sentence-case buttons. "Verify your login" / "Verify" became "Check your email" / "Sign in",
  matching "Sign in to Wishy". "Verification code" became "Sign-in code". "We'll email you…" became "Get a
  sign-in code by email" (`writing.md`: "Avoid using *we* altogether"). The access menu's group label
  "Settings" became "Access".
- **Sign-in cards changed width between steps** (448 to 320px) and their titles changed size. Both are now
  `max-w-sm` with the same title style. The email field is 44px with a `name@example.com` hint.
- **Links had only the browser's default focus ring** (fixed): `a:focus-visible` now draws a 2px ring in the
  `--ring` color.
- **Removed one accessory**: "The preview updates while you type" under the wish preview. The preview shows
  this itself.

## Follow-up, 2026-10-13 (items first left open)

- **Budget filter** (fixed). "Under 300 kr." was hard-coded to DKK and compared raw numbers across
  currencies. The limit now follows the owner's profile currency (`BUDGET` in `lib/currency.ts`: 300 kr.,
  450 SEK/NOK, €40, £35, $45), and wishes saved in another currency are converted at the ECB rate before
  comparing. A wish whose price can't be converted is left out of the filter rather than guessed.
- **Field borders** (fixed). Fields used `--input`, which is also the outline-button fill. A new `--field`
  token is now used by Input, Textarea, Select, the code slots and the date picker. It gives `#758f77`
  light: 3.53:1 on card, 3.19:1 on background, 3.09:1 on secondary. Dark is `#55755a`: 3.03:1 on card. That
  meets WCAG 1.4.11 (3:1 for field boundaries). Increase Contrast raises it to 6.2:1 / 7.1:1. Outline buttons
  are unchanged.
- **Red confirm buttons** (kept, citation corrected). These dialogs confirm an action the person chose, which
  is the job HIG gives action sheets: `action-sheets.md`: "Make destructive choices visually prominent. Use
  the destructive style for buttons that perform destructive actions." The alert rule cited earlier covers
  unexpected alerts. The safety it asks for, no destructive default, is met: Base UI focuses the first
  button, which is Cancel, so Return cancels.
- **Phone navigation** (fixed). Phones now get a bottom tab bar (`TabBar` in `components/header.tsx`) with
  single-word labels "Lists", "Family" and "Reserved", 24px icons, 64px-tall full-third targets and the
  primary color for the selected tab. `tab-bars.md`: "Include tab labels… Use single words whenever possible";
  `designing-for-ios.md`: controls are easiest to reach "in the middle or bottom area of the display". The
  header nav shows from `sm` up, a spacer keeps page ends clear of the bar, and toasts sit above it
  (`mobileOffset`).

- **Avatars glowed in dark mode** (fixed). Blobatar picks its own colors, ignoring the theme, and some names
  get a near-white disc (`#f6f3ec` for "Oliver") on the `#111d13` page. `dark-mode.md`: "Soften the color of
  white backgrounds… consider slightly darkening the image." Avatars now use `dark:brightness-80`.

## Still open

- **Loading** is a centered orb rather than a skeleton of the page. Fine for short loads.
- Between 600 and 639px wide, Sonner switches to its desktop toast position while the tab bar still shows,
  so a toast can overlap the bar. Hardly any device has that width; align the breakpoints if one does.

## What works (keep it)

- The palette has one job per color: hunter for actions, celadon for occasion and status pills, carbon for
  text. Dark mode is a designed palette, not an inversion, and every text pair now passes 4.5:1.
- Reduced motion is respected everywhere: view transitions, staggered entrances and hover motion are all
  behind `motion-safe` or `prefers-reduced-motion`.
- Icon-only controls carry labels (`aria-label` or `sr-only`).
- Copy is warm and plain, errors say how to fix them, and destructive alerts state what is lost.
- Sizes are rem-based, so the layout scales with the browser's text size.

## Platform notes

- Phones: top-level sections are in a bottom tab bar; from `sm` up, they are in the header. Both use the same
  three destinations, so nothing changes with the width except where they sit (`layout.md`: "Keep
  functionality the same as size classes change").
