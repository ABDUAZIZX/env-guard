# env-guard 🛡️

A [Claude Code mod](https://code.claude.com/docs/en/changelog) (v2.1.287+) that stops Claude from reading your `.env` secret files.

Mod لـ Claude Code يمنع Claude من قراءة ملفات `.env` (مفاتيحك السرية)، ويعرض عدّاد المحاولات المحجوبة في شريط الحالة.

## What it does
- Denies `Read`, `Edit`, `Write`, `Grep` and `Bash` calls that touch `.env`, `.env.local`, `.env.production`, …
- Leaves `.envrc` and `env.example` alone.
- Shows `🛡️ أسرار محمية: N` in the status line.
- Your own shell (`! cat .env`) is not blocked: it guards the model, not you.

## Install
```
/plugin marketplace add ABDUAZIZX/env-guard
/plugin install env-guard@env-guard
```
Or try it for one session:
```
git clone https://github.com/ABDUAZIZX/env-guard
claude --plugin-dir ./env-guard
```

## Test
```
claude plugin validate .
claude plugin test .
```

> Mods are an early-access API and may change between releases. Read any mod's code before installing it — this one is ~25 lines in `hooks/register.ts`.

MIT License
