---
description: Install Shogiground and create an interactive shogi board with pieces and hands. Get started with JavaScript, TypeScript, and the default CSS.
---

# How to set up

From an npm install to a board with pieces and hands.

## Install

```sh
npm install shogiground
```

## Load the library and CSS

With a bundler that supports CSS imports, import both entries. JavaScript does not load CSS automatically.

```js
import { Shogiground } from 'shogiground';
import 'shogiground/style.css';
```

The default stylesheet includes core geometry for every board size from 1×1 through 16×16, a wood board theme, Ryoko pieces, and hand styles.

## Add the containers

```html
<div class="game">
  <div id="hand-top"></div>
  <div id="board"></div>
  <div id="hand-bottom"></div>
</div>
```

```css
.game {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}
#board {
  width: min(90vw, 500px);
  height: auto;
  aspect-ratio: 11 / 12;
}
#hand-top, #hand-bottom {
  width: 160px;
  height: 180px;
  --sg-hand-piece-size: 44px;
}
```

Containers need a size. The board aspect ratio above gives traditional 11:12 squares on a 9×9 board. The application chooses where the hands sit and how the layout adapts to smaller screens. Leave room above and to the right for coordinates.

## Create the board

Run this after the container elements exist, for example in a module script or your framework's mount hook.

```js
const ground = Shogiground({
  sfen: {
    board: 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL',
    hands: '-',
  },
}, {
  board: document.getElementById('board'),
  hands: {
    top: document.getElementById('hand-top'),
    bottom: document.getElementById('hand-bottom'),
  },
});
```

Hands are optional: omit `hands` from the second argument for a board alone. The demo starts with a pawn in each hand so you can try drops immediately.

## Update and clean up

```js
ground.set({ orientation: 'gote' });
ground.set({ animation: { duration: 150 } });

// When your component unmounts:
ground.destroy();
```

Updates merge nested settings. Arrays, maps, and functions are replaced. Destroy the instance when its view is removed so document listeners are released.

## Add your game logic

Shogiground does not calculate legal moves, check, or promotion rules. Set destination maps and callbacks from your shogi rules engine. The demo allows free moves and drops so you can explore the UI without a rules engine.

```js
ground.set({
  activeColor: 'sente',
  turnColor: 'sente',
  movable: { free: false, dests: new Map([['7g', ['7f']]]) },
  droppable: { free: false, dests: new Map() },
});
```

See [Configuration](./configuration.md) for all settings and callback signatures, [API](./api.md) for instance methods, or [Styling](./styling.md) for themes and pieces.
