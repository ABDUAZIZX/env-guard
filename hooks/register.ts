import type { EngineInterface, Register } from 'claude-code'

// .env, .env.local, .env.production … but not .envrc or env.example
const SECRET = /(^|[\/\\\s"'=])\.env(\.[\w-]+)?($|[\s"';|&>)])/

let blocked = 0

function guard(target: string | undefined) {
  return target !== undefined && SECRET.test(target)
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
  on('tool.call', { tool: 'Bash' }, ($, e, next) => (guard(e.command) ? deny($, e.command.slice(0, 60)) : next(e)))
}
