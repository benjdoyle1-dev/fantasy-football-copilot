/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}

// Injected at build time via vite.config.ts define — identifies the
// authenticated user's team. espn_s2 stays server-side in the proxy.
declare const __ESPN_SWID__: string
