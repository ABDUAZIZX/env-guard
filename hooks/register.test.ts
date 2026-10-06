import { expect, test } from 'claude-code/testing'
import { guardBash } from './register'

const blockedBy = (r: object) => 'deny' in r || ('isError' in r && r.isError === true)

test('يمنع قراءة .env ويُظهر تنبيهاً', async ($, on) => {
  const toasts: string[] = []
  on('ui.toast', (_$, e) => void toasts.push(e.text))
  on('ui.status', () => undefined)
  const r = await $.tool.call({ tool: 'Read', file_path: 'C:/proj/.env' })
  expect(blockedBy(r)).toBe(true)
  expect(toasts.length).toBe(1)
})

test('يمنع .env.local عبر Bash', async ($, on) => {
  on('ui.toast', () => undefined)
  on('ui.status', () => undefined)
  const r = await $.tool.call({ tool: 'Bash', command: 'cat .env.local' })
  expect(blockedBy(r)).toBe(true)
})

test('يسمح بالملفات العادية و.envrc', async ($, on) => {
  on('tool.call', () => ({ result: 'ok' }) as never)
  const a = await $.tool.call({ tool: 'Read', file_path: 'C:/proj/README.md' })
  const b = await $.tool.call({ tool: 'Bash', command: 'cat .envrc' })
  expect(blockedBy(a)).toBe(false)
  expect(blockedBy(b)).toBe(false)
})

// v0.2 — pure checks for the Bash rule

const BASH_BLOCK = [
  'cat .env',
  'cp .env .env.example',
  "find . -name '.env*' -exec cat {} \;",
  'cat {.env,x}',
  'git rm --cached .env && cat .env',
  'echo "$(cat .env)" >> .gitignore',
  'echo .env > /tmp/x',
  'ls .env; cat .env',
  'test -f .env && source .env',
  'python -m venv .env',
]
const BASH_ALLOW = [
  'cat .env.example',
  'cp .env.sample config.sample',
  'cat .envrc',
  'git rm --cached .env',
  'git rm -r --cached .env.local',
  'git check-ignore -v .env',
  'ls -la .env',
  'test -f .env',
  'echo ".env" >> .gitignore',
  "printf '.env\\n.env.local\\n' >> .gitignore",
  'echo .env >> app/.gitignore',
]

test('v0.2: Bash يحجب القراءة والالتفاف', () => {
  for (const c of BASH_BLOCK) expect([c, guardBash(c)]).toEqual([c, true])
})

test('v0.2: Bash يسمح بالقوالب وأوامر الحماية المفردة', () => {
  for (const c of BASH_ALLOW) expect([c, guardBash(c)]).toEqual([c, false])
})

test('v0.2: يقرأ القوالب ويمنع الكتابة على .env', async ($, on) => {
  on('ui.toast', () => undefined)
  on('ui.status', () => undefined)
  on('tool.call', () => ({ result: 'ok' }) as never)
  const tpl = await $.tool.call({ tool: 'Read', file_path: '/proj/.env.example' })
  const w = await $.tool.call({ tool: 'Write', file_path: '/proj/.env', content: 'X=1' })
  const g = await $.tool.call({ tool: 'Grep', pattern: 'KEY', glob: '.env*' })
  expect(blockedBy(tpl)).toBe(false)
  expect(blockedBy(w)).toBe(true)
  expect(blockedBy(g)).toBe(true)
})
