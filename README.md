# Shogiground

[![lishogi.org](https://img.shields.io/badge/☗_lishogi.org-Play_shogi-black)](https://lishogi.org)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/WandererXII/shogiground/ci.yml?label=CI)
[![npm](https://img.shields.io/npm/v/shogiground?logo=npm)](https://www.npmjs.com/package/shogiground)
[![jsdelivr](https://img.shields.io/npm/v/shogiground.svg?label=jsdelivr&logo=jsdelivr)](https://cdn.jsdelivr.net/npm/shogiground@latest/dist/shogiground.min.js)

![Shogiground](/screenshot/board1.png)

_Shogiground_ is a free/libre open source shogi UI forked from [Chessground](https://github.com/lichess-org/chessground) rewritten for
[lishogi.org](https://lishogi.org).
It targets modern browsers, as well as mobile development using Cordova.

## License

Shogiground is distributed under the **GPL-3.0 license** (or any later version,
at your option).
When you use Shogiground for your website, your combined work may be
distributed only under the GPL. **You must release your source code** to the
users of your website.

Please read more about GPL for JavaScript on [greendrake.info/#nfy0](http://greendrake.info/#nfy0).

## Demos

- [Shogi TV](https://lishogi.org/tv)
- [Board editor](https://lishogi.org/editor)
- [Puzzles](https://lishogi.org/training)
- [Analysis board](https://lishogi.org/analysis)
- [Game preview](https://lishogi.org/games)

## Features

![Shogiground](/screenshot/board2.png)

Shogiground is designed to fulfill all lishogi.org web and mobile apps needs, so it is pretty featureful.

- Well typed with TypeScript
- Fast. Uses a custom DOM diff algorithm to reduce DOM writes to the absolute minimum.
- Small footprint: cca 40K unzipped. No dependencies.
- SVG drawing of circles and arrows on the board and hands
- Individual square elements for styling
- Entirely configurable and reconfigurable at any time
- Styling with CSS only: board, pieces and drawn shapes can be changed by simply switching a class
- Fluid layout: board can be resized at any time
- Full mobile support (touchstart, touchmove, touchend)
- Move or drop pieces by click
- Move or drop pieces by drag & drop
  - Minimum distance before drag
  - Centralisation of the piece under the cursor
  - Piece ghost element
  - Drop off revert or trash
- Supports shogi-like promotions
- Premove or predrop by click or drag
- Animation of pieces: moving and fading away both on board and from hands
- Display last move, check, move destinations, and premove destinations (hover effects possible)
- Import and export positions in SFEN notation, custom sfen parser/renderer
- User callbacks
- Supports board dimensions up to 16x16
- No shogi logic inside: can be used for [shogi variants](https://lishogi.org/variant)

## Installation

```sh
npm install --save shogiground
```

### Usage

```js
import { Shogiground } from 'shogiground';
import 'shogiground/style.css';

const config = {
  sfen: {
    board: 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL',
  },
};
const ground = Shogiground(config, { board: document.getElementById('board') });
```

Create and size the board container, then load application CSS after the library styles:

```html
<div id="board"></div>
```

```css
#board {
  width: min(90vw, 500px);
  height: auto;
  aspect-ratio: 11 / 12;
}
```

#### Non-module environments

Or you can simply pull the latest version from `jsdelivr`.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/shogiground@latest/assets/style.css" />
<script src="https://cdn.jsdelivr.net/npm/shogiground@latest/dist/shogiground.min.js"></script>
```

#### CSS

CSS is required. `shogiground/style.css` provides the complete default appearance,
including hands, a wood theme, and Ryoko pieces. Supply the board container's size
as shown above; JavaScript does not import CSS automatically.

For separate core/theme/piece imports, hand layouts, supported board sizes, and
static hosting, see the [styling guide](docs/styling.md).

## Documentation

- [Configuration](docs/configuration.md)
- [API reference](docs/api.md)
- [Interactive demo](docs/index.md)
- [How to set up](docs/setup.md)
- [Styling guide](docs/styling.md)
- [Default CSS](assets/style.css)
- [Core CSS](assets/styles/core.css)

## Development

Install build dependencies:

```sh
pnpm install
```

To build the node module:

```sh
pnpm run compile:watch
```

To build the standalone:

```sh
pnpm run dist:watch
```

### Documentation and demo

```sh
pnpm docs:dev
pnpm docs:type-check
pnpm docs:build
pnpm docs:preview
```
