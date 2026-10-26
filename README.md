# Shogiground

[![lishogi.org](https://img.shields.io/badge/☗_lishogi.org-Play_shogi-black)](https://lishogi.org)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/WandererXII/shogiground/ci.yml?label=CI)
[![npm](https://img.shields.io/npm/v/shogiground?logo=npm)](https://www.npmjs.com/package/shogiground)
[![jsdelivr](https://img.shields.io/npm/v/shogiground.svg?label=jsdelivr&logo=jsdelivr)](https://cdn.jsdelivr.net/npm/shogiground@latest/dist/shogiground.min.js)

![Shogiground](/screenshot/board1.png)

_Shogiground_ is a free/libre open source shogi UI forked from [Chessground](https://github.com/lichess-org/chessground) rewritten for
[lishogi.org](https://lishogi.org).
It supports modern desktop and mobile browsers.

**[Documentation & interactive demo ->](https://wandererxii.github.io/shogiground/)**

## License

Shogiground is distributed under the **GPL-3.0 license** (or any later version,
at your option).
When you use Shogiground for your website, your combined work may be
distributed only under the GPL. **You must release your source code** to the
users of your website.

## Features

- Written in TypeScript with no runtime dependencies
- Click, drag & drop, touch support, premoves, predrops, and animations
- Configurable CSS styling, board highlights, and SVG arrows and circles
- SFEN import/export and board dimensions up to 16×16
- No built-in shogi rules, so you can supply your own logic for shogi and variants

## Installation

```sh
npm install shogiground
```

Follow the [setup guide](https://wandererxii.github.io/shogiground/setup.html) to load the required CSS and create your first board.

## Documentation

- [Interactive demo](https://wandererxii.github.io/shogiground/)
- [Configuration](https://wandererxii.github.io/shogiground/configuration.html)
- [API reference](https://wandererxii.github.io/shogiground/api.html)
- [Styling guide](https://wandererxii.github.io/shogiground/styling.html)

## Development

```sh
pnpm install
pnpm compile:watch  # Build the module and watch for changes
pnpm dist:watch     # Build the standalone bundle and watch for changes
pnpm docs:dev       # Run the documentation site locally
```
