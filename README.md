# Shogiground

[![Continuous Integration](https://github.com/WandererXII/shogiground/workflows/Continuous%20Integration/badge.svg)](https://github.com/WandererXII/shogiground/actions?query=workflow%3A%22Continuous+Integration%22)
[![npm](https://img.shields.io/npm/v/shogiground)](https://www.npmjs.com/package/shogiground)

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
const Shogiground = require('shogiground').Shogiground;

const config = {
  sfen: {
    board: 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL',
  },
};
const ground = Shogiground(config, { board: document.body });
```

## Documentation

- [Config types](https://github.com/WandererXII/shogiground/tree/master/src/config.ts)
- [Default config values](https://github.com/WandererXII/shogiground/tree/master/src/state.ts)
- [API type signatures](https://github.com/WandererXII/shogiground/tree/master/src/api.ts)
- [Quick examples](https://github.com/WandererXII/shogiground/tree/master/examples/index.html)
- [Base CSS](https://github.com/WandererXII/shogiground/tree/master/assets/css/shogiground.css)

## Development

Install build dependencies:

```sh
npm install
```

To build the node module:

```sh
npm run compile -- --watch
```

To build the standalone:

```sh
npm run dist -- --watch
```
