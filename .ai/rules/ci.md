---
paths:
  - '**/*'
---

# CI/CD Pre-Push Safety

Before committing and pushing code or claiming CI readiness, ensure code passes the quality gate.
Follow the `ci-cd-safety` skill (`.agents/skills/ci-cd-safety/SKILL.md`).
Always run `composer ci:check` to verify ESLint, Prettier, TypeScript, Pint, PHPStan, and Pest tests before pushing.
