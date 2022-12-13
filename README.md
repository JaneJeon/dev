[![Node CI](https://github.com/JaneJeon/dev/actions/workflows/ci.yml/badge.svg)](https://github.com/JaneJeon/dev/actions/workflows/ci.yml)

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

### Using workspaces

`"useWorkspaces": true` _seems_ like the correct thing to be doing in lerna. However, it applies to yarn only, and _not_ npm workspaces(!), as seen here: https://github.com/lerna/lerna/issues/2567#issuecomment-1246395576.

Therefore, the "workspace" package management needs to be done via lerna, and _not_ npm workspaces (which is why you won't see the `workspaces` key in the root `package.json` either).

### Hoisting

There are a number of packages, and a lot of them share dependencies. Thus, a "naive" installation would install said shared dependencies multiple times, which would be wasteful.

~~Now, while npm workspaces actually _does_ solve this problem very neatly (it "hoists" the shared packages automatically to the top), we can't really use that since we have given up control over our package installations to lerna (see above).~~

~~Thus, we rely on lerna's dependency hoisting. However, there are several caveats, as pointed out here: https://lerna.js.org/docs/concepts/hoisting. The most important one for us is that _dependencies will be available across other sub-repos even if you haven't installed them_.~~

~~For "dev tooling" dependencies, this is a feature, not a bug - I don't want to have to install them all across the individual repos. I can just install them at the root level, and get around having to install them in every sub-repo, which, in this case, causes a clusterfuck of dependency cycle.~~

~~For "normal" monorepos, though, I expect I would just install the dependencies separately anyway. This is just a very special edge case, arising from the monorepo's dev tooling being consisted of the very sub-repos that it's managing, and use [this eslint-plugin-import rule](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-extraneous-dependencies.md) to ensure the individual parts work on their own.~~

We don't have to use lerna bootstrap; apparently it picks up packages just fine with a npm workspace.

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
