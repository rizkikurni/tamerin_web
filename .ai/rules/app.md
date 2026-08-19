---
paths:
  - 'app/**/*.php'
---

# App

## Follow the project clean architecture guide
Follow `laravel-clean-architecture-skill.md` when implementing Laravel code: keep controllers thin, put non-trivial validation in Form Requests, business use cases in focused Actions, and model authorization in Policies. Prefer native Laravel and flag requests that would introduce mixed responsibilities or speculative abstractions before implementing them.
