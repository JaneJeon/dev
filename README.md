## Notes about operating the monorepo

### Using workspaces

`"useWorkspaces": true` _seems_ like the correct thing to be doing in lerna. However, it applies to yarn only, and _not_ npm workspaces(!), as seen here: https://github.com/lerna/lerna/issues/2567#issuecomment-1246395576.

Therefore, the "workspace" package management needs to be done via lerna, and _not_ npm workspaces (which is why you won't see the `workspaces` key in the root `package.json` either).

### NPM settings

Lerna by default will use the top-level `.npmrc` file for its npm operations. You can override this by putting in a `.npmrc` in any of the package sub-repos.
