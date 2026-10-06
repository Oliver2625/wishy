// Import ViewTransition from here, never next to other React imports.
// vinext shims it by rewriting *every* `from "react"` in the importing file to a module that does
// `export * from "react"`, which drops React's named CommonJS exports (useActionState etc. become undefined).
// Keeping the only such import in this file isolates that rewrite. Under Next.js this is plain React.
// Must be an `import` (vinext's rewrite only matches imports), then re-exported.
import { ViewTransition } from 'react'

export { ViewTransition }
