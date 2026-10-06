# env-guard 🛡️

A [Claude Code mod](https://code.claude.com/docs/en/changelog) (v2.1.287+) that stops Claude from reading your `.env` secret files.

Mod لـ Claude Code يمنع Claude من قراءة ملفات `.env` (مفاتيحك السرية)، ويعرض عدّاد المحاولات المحجوبة في شريط الحالة.

## What it does
- Denies `Read`, `Edit`, `Write`, `Grep` and `Bash` calls that touch `.env`, `.env.local`, `.env.production`, `.env*` globs, …
- Leaves `.envrc`, `env.example` and the committed templates `.env.example` / `.env.sample` / `.env.template` / `.env.dist` alone.
- Allows single Bash commands that name a `.env` file without revealing it: `git rm --cached .env`, `git check-ignore .env`, `ls .env`, `test -f .env`, `echo .env >> .gitignore`. Any chaining (`;`, `&&`, `|`, `$( )`, backticks) turns the exemption off.
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

## Limits
- Pattern-based: partial globs such as `.en?` or a path built from variables are not caught. A safety net, not a sandbox.
- It still blocks writing `.env` — on purpose, so an existing file with your keys can't be overwritten. Create it yourself: `! cp .env.example .env`.

## Changelog
- **0.2.0** — reading `.env.example`-style templates is allowed; `.gitignore`/`git rm --cached` clean-up commands pass; `.env*` globs and `{.env,…}` are now caught.
- **0.1.0** — first release.

> Mods are an early-access API and may change between releases. Read any mod's code before installing it — this one is ~50 lines in `hooks/register.ts`.

MIT License
