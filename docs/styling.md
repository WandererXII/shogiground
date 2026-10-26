# Styling Shogiground

Shogiground requires CSS. JavaScript does not load styles automatically.

## Default appearance

With a bundler that supports CSS imports:

```js
import { Shogiground } from 'shogiground';
import 'shogiground/style.css';

const ground = Shogiground({}, { board: document.getElementById('board') });
```

```html
<div id="board"></div>
```

```css
/* Load application styles after Shogiground's styles. */
#board {
  width: min(90vw, 500px);
  height: auto;
  aspect-ratio: 11 / 12;
}
```

`style.css` includes core board and hand styles, the wood board theme, and Ryoko
pieces. It includes coordinates, promotion UI, drawing styles, and move, selection,
and check highlights. It supports all 256 combinations of 1-16 files and 1-16 ranks with the default
`scaleDownPieces: true`.

The library fills its container. Supply its size, either directly as above or with
an explicitly sized parent and a child that fills it. Use `aspect-ratio: 1` for a
square board. Leave space above and to the right for coordinates, which sit outside
the board. The stylesheet does not style the page body, navigation, or surrounding
application layout.

## Choose individual styles

Instead of the default entry, load core, one board theme, and one piece set, in
that order:

```js
import 'shogiground/styles/core.css';
import 'shogiground/styles/themes/wood.css';
import 'shogiground/styles/pieces/ryoko.css';
```

| Stylesheet | Contents |
| --- | --- |
| `styles/core.css` | Required positioning, sizing, interactions, coordinates, drawing, promotion UI, hand counts, and default UI highlights |
| `styles/variants.css` | Geometry for every dimension from 1×1 through 16×16; load after core |
| `styles/themes/wood.css` | Wood texture, grid, and 9×9 star points; wood hand background |
| `styles/themes/bird.css` | Alternative board texture and hand background |
| `styles/themes/checker.css` | Checkerboard colors and plain hand background |
| `styles/pieces/ryoko.css` | Ryoko SVG piece artwork |
| `styles/pieces/portella.css` | Portella PNG piece artwork |

Core alone does not provide board or piece artwork. For your own theme or piece
set, replace the corresponding import and retain core. Override core's default UI
colors in application CSS if needed. A custom piece stylesheet must match
`scaleDownPieces` and the board's geometry.

All referenced images ship in `assets/images/`. Bundlers can process the relative
URLs. If you copy the styles for static hosting, copy the whole `assets/` directory
and preserve its layout. Switching piece sets at runtime requires replacing the
piece stylesheet; do not load several sets together.

## Hands

Hand behavior and piece counts are included in core. Attach hand containers through
the normal `hands` API; the renderer adds `.sg-hand-wrap`, `.hand-top`, and
`.hand-bottom`. Your application places and sizes the containers:

```css
#hand-top,
#hand-bottom {
  width: 180px;
  height: 180px;
  --sg-hand-piece-size: 48px;
}
```

Hand pieces default to `3rem`. `--sg-hand-piece-size` sets their width and height;
you can also override `.sg-hand-wrap sg-hand piece` for independent dimensions.
Hand styles do not change board height. Inline hands also need application layout
rules: position the generated `.sg-hand-wrap.inlined` elements around the board and
reserve space for them. See [the runtime configuration example](../examples/runtime-config.html).

## Board variants

`style.css` includes every combination of 1-16 files and 1-16 ranks: 1×1,
1×2, …, 16×15, 16×16. No additional import is needed when using that entry.

With individual styles, load the single variant stylesheet after core:

```js
import 'shogiground/styles/core.css';
import 'shogiground/styles/variants.css';
import 'shogiground/styles/themes/wood.css';
import 'shogiground/styles/pieces/ryoko.css';
```

`variants.css` maps all 256 renderer-provided `.d-FILESxRANKS` classes to local
CSS variables and shares the geometry rules across them, so different board
sizes can coexist. It sets grid, piece, promotion-square, and drag-overlay sizes;
9×9 star points are only drawn on 9×9 boards.

You must still configure the board dimensions (or supply SFEN from which they can
be inferred) and size the container. The variant stylesheet does not set the
container's aspect ratio. For traditional 11:12 squares, set the container's
`aspect-ratio` to `(files * 11) / (ranks * 12)`; for square cells, use
`files / ranks`. Piece centering and promotion positioning follow the cell size
without assuming a container aspect ratio.

## Static pages and CDNs

Load the CSS alongside the standalone JavaScript:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/shogiground@latest/assets/style.css" />
<script src="https://cdn.jsdelivr.net/npm/shogiground@latest/dist/shogiground.min.js"></script>
```

Pin both URLs to the same published version in production. For individual styles,
use paths such as `assets/styles/core.css` relative to the package root.

## Migrating from the examples

Replace links to `examples/assets/css/shogiground.css`, `hands.css`, a board theme,
and a piece stylesheet with `assets/style.css` (static hosting) or
`shogiground/style.css` (bundler import). Variant rules now share `styles/variants.css` and are included in the default entry; `wood-grid.css` is named `themes/wood.css` and `Portella.css` is
named `pieces/portella.css`.

The old `base.css` was demo page styling, not library CSS. Demo layout now lives in
`examples/demo.css`; consumers should supply their own layout. In particular, set
board and hand container sizes explicitly: core fills the board container without
the old percentage-height adjustment, and hands no longer impose fixed demo sizes
or margins. Examples use the same library styles shipped in the package.
