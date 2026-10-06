import type { EngineInterface, Register } from 'claude-code'

// .env, .env.local, .env.production, and globs like .env* — but not .envrc, env.example,
// or the committed templates .env.example / .env.sample / .env.template / .env.dist.
const SECRET =
  /(^|[\/\\\s"'=({,:<`])\.env(?!\.(?:example|sample|template|dist|defaults?)(?![\w-]))(\.[\w-]+)?($|[\s"';|&>)*?[\]{},:<`])/

// Single commands that name a .env file without revealing its contents.
const ARG = String.raw`(?:"[^"$\x60\\]*"|'[^']*'|[^\s"'$\x60<>|;&]+)`
const SAFE_BASH = [
  /^git\s+rm\s+(?:-\S+\s+)*--cached\b/,
  /^git\s+check-ignore\b/,
  /^ls\b/,
  /^(?:test|\[)\s+-[efs]\s/,
  new RegExp(String.raw`^(?:echo|printf)(?:\s+${ARG})+\s*>>\s*(?:[\w./-]*\/)?\.gitignore\s*$`),
]
// Chaining, pipes, substitution: any of these could smuggle a read in next to a safe command.
const CHAIN = /[;&|`\n\r]|\$\(|<\(|>\(/

let blocked = 0

function guard(target: string | undefined) {
  return target !== undefined && SECRET.test(target)
}

export function guardBash(command: string) {
  if (!guard(command)) return false
  const c = command.trim()
  return CHAIN.test(c) || !SAFE_BASH.some(re => re.test(c))
}

function deny($: EngineInterface, what: string) {
  blocked += 1
  $.ui.toast(`🛡️ env-guard: منعتُ الوصول إلى ${what}`)
  $.ui.status(`🛡️ أسرار محمية: ${blocked}`)
  return { deny: `env-guard: ${what} ملف أسرار محمي، لا تقرأه ولا تطبع محتواه.` }
}

export const register: Register = on => {
  on('tool.call', { tool: 'Read' }, ($, e, next) => (guard(e.file_path) ? deny($, e.file_path) : next(e)))
  on('tool.call', { tool: 'Edit' }, ($, e, next) => (guard(e.file_path) ? deny($, e.file_path) : next(e)))
  on('tool.call', { tool: 'Write' }, ($, e, next) => (guard(e.file_path) ? deny($, e.file_path) : next(e)))
  on('tool.call', { tool: 'Grep' }, ($, e, next) =>
    guard(e.path) || guard(e.glob) ? deny($, e.path ?? e.glob ?? '.env') : next(e),
  )
  on('tool.call', { tool: 'Bash' }, ($, e, next) => (guardBash(e.command) ? deny($, e.command.slice(0, 60)) : next(e)))
}
