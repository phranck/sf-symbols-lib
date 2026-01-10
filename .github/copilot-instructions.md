# Copilot Instructions

## General Guidelines
- Never use a single character for variable names, parameters, or any identifiers; always use descriptive names.
- Always, in every kind of code, add comments to explain non-trivial parts in English.
- Always format code with proper indentation and spacing for better readability.
- Always add JSDoc documentation comments for all functions and classes in English.
- Never change code on your own without my explicit request.
- Always communicate in German.
- When adding features or making changes, always run linter, typecheck and build commands to ensure code quality. If there are any errors, always fix them before proceeding.
- Always use "@" imports for internal modules instead of relative paths.
- When writing documentation, always use a newline before a tripple backtick block.
- When code is added, deleted or refactored, always run `npm run lint`, `npm run typecheck`, `npm run build` and `npm run test` until no more errors occur.
- **CRITICAL - DRY Principle**: Before creating new types, constants, or configurations, ALWAYS search the codebase for similar or existing implementations. If something similar already exists:
  - Use the existing implementation instead of creating duplicates
  - If the existing implementation needs extension, refactor it to be more general/reusable
  - Never create redundant constants, mappings, or type definitions

## Custom Commands

- **`:cm`**: Creates a compact commit message in English(!) for the changes since the last commit. Only recently changed files should be included (`git status`). The message should contain a headline and an unordered list, formatted as plain text in a code block.
- **`:desc`**: Produce a complete functional description of the project, divided into backend and frontend, without technical details, as Markdown. If the command is followed by a `>` symbol and a string, write the text to a file with that name in the project root directory. If the name contains a language suffix such as `.de.md` or `.en.md`, write the description in the corresponding language.
- **`:ls`**: Output a list of all custom commands that start with ":" as Markdown sorted in alphabetical order.
- **`:scan`**: Scan the project’s code and update your context. Do not change the code under any circumstances!
- **`:release`**: Create user-friendly release notes in simple English, without technical jargon. Use the GitHub API to retrieve the release notes from the body of the latest release (as implemented in the update API: `latestRelease.body`). Format these as clear Markdown with thematic grouping and a version heading. The notes should highlight the most important improvements for end users, not technical details, no developer information, just the user-facing changes.
- **`:npm`**: Show all custom npm run scripts/commands for this project.
