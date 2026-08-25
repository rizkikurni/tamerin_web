---
paths:
    - 'resources/**'
---

# Resources

## Limit application typography to three weights

Use only Poppins light (300), normal (400), and medium (500) throughout the application. Tailwind typography may use only `font-light`, `font-normal`, or `font-medium`; map stronger emphasis to `font-medium` and do not introduce semibold or bold weights.

## Use semantic tokens for themed surfaces

Use semantic background, foreground, and border utilities for theme-aware UI. Glass panels and navigation controls must use the shared `--glass-*`, `--control-*`, and shadow variables from `resources/css/app.css`; do not hardcode light-only white gradients, borders, or shadows. Tailwind dark variants follow the root `.dark` class.
