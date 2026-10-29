import type { ReactNode } from "react";

const paths = {
  compass: <><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></>,
  twin: <><path d="M4 8h14l-3-3M20 16H6l3 3"/></>,
  bookmark: <path d="M7 4h10v16l-5-3.5L7 20z"/>,
  passport: <><rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M9 16h6"/></>,
  close: <path d="m6 6 12 12M6 18 18 6"/>,
  external: <path d="M7 17 17 7M7 7h10v10"/>,
  right: <path d="M4 12h16m-6-6 6 6-6 6"/>,
  left: <path d="M20 12H4m6-6-6 6 6 6"/>,
  down: <path d="M12 4v16m-6-6 6 6 6-6"/>,
  plus: <path d="M12 5v14M5 12h14"/>,
  minus: <path d="M5 12h14"/>,
  check: <path d="m5 12 4 4L19 6"/>,
  compare: <><rect x="3.5" y="5" width="7" height="14" rx="1.5"/><rect x="13.5" y="5" width="7" height="14" rx="1.5"/></>,
  share: <><path d="M12 15V3m-4 4 4-4 4 4M5 11v9h14v-9"/></>,
  settings: <><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/></>,
} satisfies Record<string, ReactNode>;
export type ActionIconName = keyof typeof paths;

// One system for operative icons; Passport illustrations and stamps are artwork.
export function ActionIcon({ name, filled = false, navigation = false }: { name: ActionIconName; filled?: boolean; navigation?: boolean }) {
  return <svg className={`action-icon${navigation ? " action-icon-nav" : ""}`} viewBox="0 0 24 24" width={navigation ? 24 : 20} height={navigation ? 24 : 20} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}
