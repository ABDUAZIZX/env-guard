import { expect, test } from 'claude-code/testing'

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
