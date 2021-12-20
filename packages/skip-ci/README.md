<h1 align="center">Welcome to skip-ci 👋</h1>

[![CircleCI](https://circleci.com/gh/JaneJeon/skip-ci/tree/master.svg?style=shield)](https://circleci.com/gh/JaneJeon/skip-ci/tree/master)
[![Version](https://img.shields.io/npm/v/skip-ci)](https://www.npmjs.com/package/skip-ci)
[![Downloads](https://img.shields.io/npm/dt/skip-ci)](https://www.npmjs.com/package/skip-ci)

> ✨ Automatically detect [skip ci] messages (and the like) in your last commit 🎉

### 🏠 [Homepage](https://github.com/JaneJeon/skip-ci)

When you include either a `[skip ci]` or a `[ci skip]` in your commit message, (most) CI systems understand it to mean, well, CI. This is generally useful when you're updating non-code portions of the repo, such as documentation or when you're fixing something irrelevant to the codebase.

However, if you're like me, you might use git hooks (perhaps using `husky`) to prevent bad code from being pushed in the first place by making tests run during `pre-push` hook. This generally works great, but it still runs the tests even when you add a `[skip ci]` to your commit message.

That's where this tool comes in. Just call `skip-ci` and you'll be able to detect & skip whatever commands you'd like when you don't want to run any tests. To see an example, just look at this repo's `.huskyrc.yml`!

## Install

```sh
npm i skip-ci -D
```

This package has ZERO dependencies!

## Usage

```sh
skip-ci && "Skipping CI..." || echo "Running tests..."
```

## Development

Because we rely on a subrepo for testing the `skip-ci` tool, when cloning, make sure you add the `--recursive` flag.

Then, you can test `skip-ci` (or more specifically, `cli.js`) by running `npm test`, which will go through each commit of the test repo (`repo/`) and check that the tool recognizes `[skip ci]` and `[ci skip]` and returns the appropriate exit codes.

And don't forget to `npm i` when developing to install `devDependencies` (mainly linting).

## Author

👤 **Jane Jeon <JaneJeon9719@gmail.com>**

- Website: https://janejeon.dev
- Github: [@JaneJeon](https://github.com/JaneJeon)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/JaneJeon/skip-ci/issues).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2021 [Jane Jeon <JaneJeon9719@gmail.com>](https://github.com/JaneJeon).<br />
This project is [LGPL](https://github.com/JaneJeon/skip-ci/blob/master/LICENSE) licensed (TL;DR: please contribute back any improvements to this library).
