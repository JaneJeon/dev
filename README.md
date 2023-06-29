[![Node CI](https://github.com/JaneJeon/dev/actions/workflows/ci.yml/badge.svg)](https://github.com/JaneJeon/dev/actions/workflows/ci.yml)
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/JaneJeon/dev/tree/master.svg?style=shield)](https://dl.circleci.com/status-badge/redirect/gh/JaneJeon/dev/tree/master)

# Jane's Emporium (Monorepo) of Dev Tooling

## Packages

- [eslint-config](/packages/eslint-config/): shared ESLint config
- [prettier-config](/packages/prettier-config/): shared Prettier config
- [renovate-config](/packages/renovate-config/): shared Renovate config
- [skip-ci](/packages/skip-ci/): ✨ Automatically detect [skip ci] messages (and the like) in your last commit 🎉

## Rationale

I have a number of "dev tooling" libraries/packages that I maintain for my own personal use, but having them as N different repositories were getting too onerous to maintain (e.g. you need to update N different packages, and if you wanted to change something that was common across the repos, yup, going into the different repos, making sure they're up to date, making the changes, and then pushing it, N different times).

Thus, I've crammed all of them into a monorepo to hopefully lower the burden of "doing things N times".

## Notes about operating the monorepo

### NPM settings

Lerna by default will use the top-level `.npmrc` file for its npm operations. You can override this by putting in a `.npmrc` in any of the package sub-repos.

### Dependency Management/Workspaces

All package management/workspaces is delegated to npm. We use `useWorkspaces: true` to tell lerna [to use npm for managing package scopes and the like](https://lerna.js.org/docs/api-reference/configuration#useworkspaces--packages).

### Automated checks (git hooks)

Normally, in a non-monorepo setup, you'd install your dev dependencies (such as your `eslint` and `prettier` config, and in my case, `skip-ci` as well), and have `eslint` and `prettier` npm scripts set up to lint your codebase. And then, you'd have git hooks set up at the repo level, running said linters via `lint-staged`, which would look across all of the staged files and runs `eslint`/`prettier`, which read off of the root config. And then in CI, you run the same `eslint`/`prettier` commands from the root to see if people fucked around and pressed `--no-verify`.

However, in a monorepo, it's a bit trickier, because:

1. You'd ideally like to make use of the "run the lint commands only for the files that changed" thing in CI (premature optimization, I know)
2. You might be using different `eslint`/`prettier` configs across the various sub-repos.
3. You also need to format (if not lint, depending on your repo setup) the root level, aside from all of the actual sub-repos.

First, let's talk about _how_ to run the lint/format commands in a monorepo setting.

Now, lerna (or, if they've even bothered to update the documentation, NX) itself recommends that you just install and run all this linting shit at the root level (not sure how I feel about their recommendations extending to testing): https://lerna.js.org/docs/faq#root-packagejson.

Thinking about what would be the "ideal" workflow:

- When you change something in a commit, we want that to be covered by the linter/formatter, and _only_ the changed files (`lint-staged` covers this "for free", making sure we don't have to lint/format files that _aren't_ affected).
- When you run the checks in CI for a PR, you want to be checking the lint/format _only_ for the files that changed in that PR.
- When you run the checks in CI for the master branch (because let's be honest, we all just push to master sometimes), you want to be checking _all_ of the files for lint/format, since we have no idea how many commits have been added to master in between the latest CI run and the previous one.

Thus, in this case, lerna's recommendation certainly checks out - we invoke `lint-staged` just as before (git hook), and setup CI (depending on the branch) to run the lint command from the root level, on only the files that changed.

Ok, now for how to deal with different configs across the various folders/sub-repos, this part is actually surprisingly easy and doesn't require changes in either our npm scripts at the root, or any of the `lint-staged` commands to lint/format the staged files.

In particular, `eslint` will automatically pick up the "nearest" (see https://eslint.org/docs/latest/user-guide/configuring/configuration-files#cascading-and-hierarchy for more info) configuration file, so you can drop in whatever config files you want for any of your sub-repos, and it'll automatically pick up the right config file to apply to the file you want to lint.

As for `prettier`, well, you really should only have the one at the top, so... yeah.

And, if you want to get even more fancy, you can add separate `lint-staged` configuration files for each sub-repo, as it, too, does the ["look at the closest config file for the file I'm about to touch"](https://github.com/okonet/lint-staged#how-to-use-lint-staged-in-a-multi-package-monorepo) thing as `eslint`. However, in most cases, just the config at the root level should suffice, as `eslint` and `prettier` commands don't need to differ across different sub-repos, as seen above.

### Semantic Commit

To control all commit-based workflow for not only the various packages within this repo, but also the repo itself (i.e. the "top-level"), we expect all commits to follow the semantic commit pattern.

The exact config is based on the `@janejeon/commitlint-config` package (located within the `commitlint-config/` folder), and we not only lint commit message before committing them via husky, but also check them in CI.

In particular, in CI, we want to check _all_ commits for a branch to make sure that no "non-semantic" commits get through, which means having to pull down all commits when checkout out on git.

To automatically generate a commit message that adheres to the semantic commit ruleset, you can run `npm run commit`, which relies on commitzen, which relies on commitlint. The commit generation can be configured via https://commitlint.js.org/#/reference-prompt.

### Publishing

All packages are tracked by lerna using semantic commits. Packages can be versioned and published via lerna.

To version and publish:

1. Make sure you are on the `master` branch.
2. Run `lerna version` to version packages according to the semantic versioning rules. This will update `package.json` versions, create git tags, and update CHANGELOG.md files.
3. Run `lerna publish from-git` to publish the new versions to npm.
4. Push the git tags with `git push --follow-tags`.

For now, this is being run manually while I get used to this workflow.
