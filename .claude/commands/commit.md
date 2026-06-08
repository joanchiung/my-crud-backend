Follow these steps to generate a commit:

1. Run `git diff --staged` to review all staged changes
2. Run `git diff --staged --name-only` to get the list of changed files
3. Analyze the changes:
   - What type of change is this? (new feature, bug fix, refactor, config, etc.)
   - What is the main module or feature affected?
4. Generate a commit title following Conventional Commits format in English:
   - `feat:` new feature
   - `fix:` bug fix
   - `refactor:` code refactor
   - `chore:` config, dependencies, miscellaneous
   - `docs:` documentation
   - `test:` tests
   - Keep the title under 72 characters
   - Write in English only
5. Ask me to confirm the commit title, then run `git commit -m "<title>"` after confirmation

If there are no staged files, prompt me to run `git add` first.
