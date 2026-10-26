---
description: Configure your Shogiground board with SFEN positions, hands, moves, drops, promotions, animations, drawing tools, and event callbacks.
---

# Configuration

Pass config to `Shogiground(config, wrapElements)` or update it with `ground.set(config)`.
All fields are optional, including fields inside option groups.

```ts
import { Shogiground } from 'shogiground';
import type { Config } from 'shogiground/config';

const config: Config = {
  sfen: {
    board: 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL',
    hands: '-',
  },
  activeColor: 'sente',
  movable: {
    free: false,
    dests: new Map([['7g', ['7f']]]),
  },
  droppable: { free: false },
};

const ground = Shogiground(config, { board: document.body });
ground.set({ animation: { duration: 150 } });
```

Shogiground does not calculate legal moves, drops, check, or promotion rules. Supply them from your game logic.

## Values

- `Color`: `'sente'` or `'gote'`.
- `Key`: a square such as `'7g'`. Files run from `'1'` to `'16'`; ranks from `'a'` to `'p'`. Use squares within the board dimensions.
- `Piece`: `{ role: string, color: Color }`. Both fields are required when supplied.
- `Notation`: `'numeric'`, `'japanese'`, `'engine'`, `'hex'`, or `'dizhi'`.
- `MoveMetadata`: `{ premade: boolean, captured?: Piece }`.

See [shared types](https://github.com/WandererXII/shogiground/blob/master/src/types.ts) and [config types](https://github.com/WandererXII/shogiground/blob/master/src/config.ts).

## Updates

- Omitted fields keep their current values, subject to the recalculations below.
- Plain objects merge recursively. Arrays, maps, and functions are replaced.
- Supply complete arrays, tuples, maps, and pieces.
- To clear optional values, pass `undefined`, for example `ground.set({ lastDests: undefined, lastPiece: undefined })`. Do not pass `undefined` for settings that require a value, such as `animation.enabled`.
- Use `checks: false` or `checks: undefined` to clear check highlights.
- Loading `sfen.board` replaces board pieces, infers dimensions, and clears `drawable.shapes` unless shapes are supplied in the same update. It does not replace hands or reset every other option.
- Loading `sfen.hands` replaces both hands.
- Premove and predrop destination highlights are calculated from the current selection and `generate` callbacks. They cannot be set through config.
- `ground.set(config, true)` skips the SFEN transition animation.

## Position and board

Defaults below apply to a new instance. Optional fields without a default start as `undefined`.

| Option | Default | Meaning |
| --- | --- | --- |
| `sfen.board` | unset; empty 9×9 board | Board portion of SFEN. Dimensions are inferred, up to 16×16. |
| `sfen.hands` | unset; empty hands | Hand portion of SFEN. Use `'-'` for empty hands. |
| `orientation` | `'sente'` | Color facing the bottom of the board. |
| `turnColor` | `'sente'` | Side to play. Successful user moves and drops switch it. |
| `activeColor` | `'both'` | Color allowed to move/drop; `'both'` allows either color regardless of turn. `undefined` disables moving and dropping. |
| `checks` | unset | Explicit `Key[]`, a color, `true`, or `false`. A color highlights its pieces matching `highlight.checkRoles`; `true` uses `turnColor`. This does not detect check. |
| `lastDests` | unset | Last-move squares, or a single square for a drop. |
| `lastPiece` | unset | Piece used for last-drop highlighting. |
| `selected` | unset | Selected board square. |
| `selectedPiece` | unset | Selected piece in hand. |
| `viewOnly` | `false` | Disable interaction event binding. |
| `squareRatio` | `[11, 12]` | Square width-to-height ratio. |
| `disableContextMenu` | `true` | Suppress the board context menu. Drawing also suppresses it. |
| `blockTouchScroll` | `false` | Block touch scrolling when interacting with the board. |
| `scaleDownPieces` | `true` | Render piece elements with a half-scale transform; match this to your piece CSS/assets. |

## Coordinates and highlighting

| Option | Default | Meaning |
| --- | --- | --- |
| `coordinates.enabled` | `true` | Add coordinate attributes for CSS to display. |
| `coordinates.files` | `'numeric'` | File notation. |
| `coordinates.ranks` | `'numeric'` | Rank notation. |
| `highlight.lastDests` | `true` | Highlight the last move/drop. |
| `highlight.check` | `true` | Highlight checked squares. |
| `highlight.checkRoles` | `['king']` | Roles matched when `checks` is a color or `true`. |
| `highlight.hovered` | `false` | Highlight the hovered square. |

## Animation

| Option | Default | Meaning |
| --- | --- | --- |
| `animation.enabled` | `true` | Animate position changes. |
| `animation.hands` | `true` | Include hands in animations. |
| `animation.duration` | `250` | Duration in milliseconds. Values below `70` disable animation. |


## Hands

| Option | Default | Meaning |
| --- | --- | --- |
| `hands.inlined` | `false` | Create hands inside the board wrapper, ignoring supplied hand elements. |
| `hands.roles` | `['rook', 'bishop', 'gold', 'silver', 'knight', 'lance', 'pawn']` | Roles to display, in order. |

Set hand contents through `sfen.hands`, `ground.addToHand()`, or `ground.removeFromHand()`.

## Moving and dropping

| Option | Default | Meaning |
| --- | --- | --- |
| `movable.free` | `true` | Allow unrestricted moves. Set `false` to use `movable.dests`. |
| `movable.dests` | unset | `Map<Key, Key[]>` of allowed destinations by origin. |
| `movable.showDests` | `true` | Highlight available move destinations. |
| `droppable.free` | `true` | Allow unrestricted drops. Set `false` to use `droppable.dests`. |
| `droppable.dests` | unset | `Map<PieceName, Key[]>`; keys have the form `'sente pawn'`. |
| `droppable.showDests` | `true` | Highlight available drop destinations. |
| `droppable.spare` | `false` | Drop spare pieces without consuming pieces in hand. Spare drops bypass destination restrictions. |

Successful user moves and drops clear both destination maps. Supply the next maps when updating the position/turn.

```ts
ground.set({
  turnColor: 'gote',
  movable: { free: false, dests: new Map([['3c', ['3d']]]) },
  droppable: { free: false, dests: new Map([['gote pawn', ['5e']]]) },
});
```

| Callback | Arguments | Called when |
| --- | --- | --- |
| `movable.events.after` | `(orig: Key, dest: Key, prom: boolean, metadata: MoveMetadata)` | A user move or queued premove is played. |
| `droppable.events.after` | `(piece: Piece, key: Key, prom: boolean, metadata: MoveMetadata)` | A user drop or queued predrop is played. |

`metadata.premade` identifies a played premove/predrop. Move metadata includes `captured` when a piece was captured.
Programmatic `ground.move()` and `ground.drop()` do not invoke these `after` callbacks; use `events.move` and `events.drop` for those operations.

## Premoves and predrops

Use a single `activeColor` and set `turnColor` to the other color to allow queuing.
Supply generators; no destinations are generated by default.

| Option | Default | Meaning |
| --- | --- | --- |
| `premovable.enabled` | `true` | Allow queuing moves outside the active color's turn. |
| `premovable.showDests` | `true` | Highlight premove destinations. |
| `premovable.generate` | unset | `(key: Key, pieces: Map<Key, Piece>) => Key[]`. Return possible premove destinations. |
| `predroppable.enabled` | `true` | Allow queuing drops outside the active color's turn. |
| `predroppable.showDests` | `true` | Highlight predrop destinations. |
| `predroppable.generate` | unset | `(piece: Piece, pieces: Map<Key, Piece>) => Key[]`. Return possible predrop destinations. |

After updating the turn and legal destination maps, call `ground.playPremove()` or `ground.playPredrop()` to attempt the queued action.

| Callback | Arguments | Called when |
| --- | --- | --- |
| `premovable.events.set` | `(orig: Key, dest: Key, prom: boolean)` | A premove is queued. |
| `premovable.events.unset` | `()` | A queued premove is cleared. |
| `predroppable.events.set` | `(piece: Piece, key: Key, prom: boolean)` | A predrop is queued. |
| `predroppable.events.unset` | `()` | A queued predrop is cleared. |

## Dragging and selection

| Option | Default | Meaning |
| --- | --- | --- |
| `draggable.enabled` | `true` | Enable dragging moves and drops. |
| `draggable.distance` | `3` | Minimum drag distance in pixels. |
| `draggable.autoDistance` | `true` | Adapt the drag threshold to prior dragging. |
| `draggable.showGhost` | `true` | Show a ghost at the dragged piece's origin. |
| `draggable.showTouchSquareOverlay` | `true` | Mark the target square during touch dragging. |
| `draggable.deleteOnDropOff` | `false` | Delete pieces dragged off the board. |
| `draggable.addToHandOnDropOff` | `false` | Add off-board pieces dropped on a hand to that hand. Requires `deleteOnDropOff`. |
| `selectable.enabled` | `true` | Enable click-to-move/drop. Disable to require dragging. |
| `selectable.forceSpares` | `false` | Allow click-to-drop spare pieces with selection disabled. |
| `selectable.deleteOnTouch` | `false` | Delete a selected piece from its board square or hand. |
| `selectable.addSparesToHand` | `false` | Add selected spare pieces to hand. |

## Promotion

Supply promotion rules for your variant. The default role callbacks return `undefined`; all four decision callbacks return `false`.

| Option | Signature | Meaning |
| --- | --- | --- |
| `promotion.promotesTo` | `(role: string) => string \| undefined` | Map a role to its promoted role. |
| `promotion.unpromotesTo` | `(role: string) => string \| undefined` | Map a role to its unpromoted role. |
| `promotion.movePromotionDialog` | `(orig: Key, dest: Key) => boolean` | Offer a promotion choice for a move. |
| `promotion.forceMovePromotion` | `(orig: Key, dest: Key) => boolean` | Promote a move automatically. |
| `promotion.dropPromotionDialog` | `(piece: Piece, key: Key) => boolean` | Offer a promotion choice for a drop. |
| `promotion.forceDropPromotion` | `(piece: Piece, key: Key) => boolean` | Promote a drop automatically. |

| Callback | Arguments | Called when |
| --- | --- | --- |
| `promotion.events.initiated` | `()` | The promotion dialog opens. |
| `promotion.events.after` | `(piece: Piece)` | The user chooses a piece. |
| `promotion.events.cancel` | `()` | The user cancels the dialog. |

## Forsyth conversion

| Option | Signature | Meaning |
| --- | --- | --- |
| `forsyth.toForsyth` | `(role: string) => string \| undefined` | Convert a role to a Forsyth symbol when exporting SFEN. |
| `forsyth.fromForsyth` | `(symbol: string) => string \| undefined` | Convert a Forsyth symbol to a role when loading SFEN. |

Both default to the standard shogi mapping when unset. Supply converters for custom roles.

## Drawing

| Option | Default | Meaning |
| --- | --- | --- |
| `drawable.enabled` | `true` | Enable user drawing. |
| `drawable.visible` | `true` | Show drawing layers. |
| `drawable.forced` | `false` | Route ordinary pointer gestures to drawing. |
| `drawable.eraseOnClick` | `true` | Clear user shapes when starting applicable piece interactions. |
| `drawable.shapes` | `[]` | User shapes. |
| `drawable.autoShapes` | `[]` | Application-supplied shapes. |
| `drawable.squares` | `[]` | Square highlights: `{ key: Key, className: string }[]`. |
| `drawable.onChange` | unset | `(shapes: DrawShape[]) => void`, called when user drawings change. |

Each `DrawShape` requires `orig`, `dest`, and `brush`. An endpoint can be a board square such as `'7g'` or a complete piece such as `{ role: 'pawn', color: 'sente' }`, which identifies that role in a displayed hand. Hand endpoints require the corresponding hand element and board to be attached.

The endpoints and optional fields determine what is drawn. The following examples use `autoShapes` for application annotations; the same shape objects work in `shapes`, `ground.setShapes()`, and `ground.setAutoShapes()`.

### Circles

Set `orig` and `dest` to the same square to draw a circle around it. The outline follows the square's aspect ratio, so it is an ellipse on rectangular squares. To circle a hand role, use pieces with the same `role` and `color` for both endpoints.

```ts
ground.setAutoShapes([
  { orig: '5e', dest: '5e', brush: 'primary' },
  {
    orig: { role: 'pawn', color: 'sente' },
    dest: { role: 'pawn', color: 'sente' },
    brush: 'alternative0',
  },
]);
```

### Arrows

Set different endpoints to draw an arrow from `orig` toward `dest`. Arrows can connect two board squares, a square and a hand role, or two hand roles.

```ts
ground.setAutoShapes([
  { orig: '7g', dest: '7f', brush: 'primary' },
  { orig: { role: 'pawn', color: 'sente' }, dest: '5e', brush: 'alternative1' },
]);
```

### Piece overlays

Supply `piece: { role: string, color: Color, scale?: number }` to display a piece image at `orig`, which must be a board square. This is a visual annotation and does not change the position or hand counts. `scale` defaults to `1` and scales the image relative to the normal piece size.

Use matching endpoints for clarity: a piece overlay alone does not draw a circle or arrow. To show an outline or arrow as well, add a separate shape without `piece`.

```ts
ground.setAutoShapes([
  { orig: '5e', dest: '5e', brush: 'primary', piece: { role: 'pawn', color: 'sente', scale: 0.8 } },
  { orig: '5e', dest: '5e', brush: 'primary' },
]);
```

### Custom SVGs

Supply `customSvg` with an SVG markup string to render your own artwork at `orig` instead of a circle or arrow. `dest` is still required by the type; set it equal to `orig`. The markup is placed inside an SVG whose view box is ten times `squareRatio` (`0 0 110 120` by default). Its coordinate origin is anchored at the shape's origin; the core stylesheet allows artwork to extend outside that box.

```ts
ground.setAutoShapes([{
  orig: '5e',
  dest: '5e',
  brush: 'primary',
  customSvg: '<circle cx="0" cy="0" r="25" fill="#e5a100" />',
}]);
```

`brush` becomes a CSS class on the nested SVG. Only supply trusted markup: it is inserted as SVG content without sanitization. Use separate shapes for custom artwork and piece overlays.

### Descriptions

Add `description` to a circle or arrow to display a short text label with an elliptical background. Circle labels appear at the origin; arrow labels sit along the arrow, with placement adjusted for short or converging arrows. This is visible text, not a tooltip. Descriptions are not rendered on custom SVGs or piece overlays; include text in your SVG or add a separate circle/arrow shape when needed.

```ts
ground.setAutoShapes([
  { orig: '7g', dest: '7f', brush: 'primary', description: '1' },
  { orig: '5e', dest: '5e', brush: 'alternative0', description: 'A' },
]);
```

### Square highlights and styling

Square highlights use `drawable.squares` rather than `DrawShape`. Each entry adds `className` to the square at `key`.

```ts
ground.set({
  drawable: {
    shapes: [{ orig: '7g', dest: '7f', brush: 'primary' }],
    squares: [{ key: '5e', className: 'target' }],
  },
});
```

`brush` names the CSS class used to style a shape. Core CSS includes `primary`, `alternative0`, `alternative1`, and `alternative2`; custom brush names and square classes need matching CSS. See [Styling](./styling.md) and [drawing types](https://github.com/WandererXII/shogiground/blob/master/src/draw.ts).

## Board events

All callbacks are unset by default.

| Callback | Arguments | Called when |
| --- | --- | --- |
| `events.change` | `()` | A move, drop, or interactive piece edit changes the position. |
| `events.move` | `(orig: Key, dest: Key, prom: boolean, capturedPiece?: Piece)` | A move is played, including programmatic moves. |
| `events.drop` | `(piece: Piece, key: Key, prom: boolean)` | A drop is played, including programmatic drops. |
| `events.select` | `(key: Key)` | A square selection is attempted. |
| `events.unselect` | `(key: Key)` | A square is directly unselected by clicking it again or dropping back. |
| `events.pieceSelect` | `(piece: Piece)` | A hand-piece selection is attempted. |
| `events.pieceUnselect` | `(piece: Piece)` | A hand piece is directly unselected. |
| `events.insert` | `(boardElements?: BoardElements, handElements?: HandElements)` | Board or hand DOM is inserted or rebuilt. |

Move, drop, selection, premove/predrop, and promotion event callbacks are deferred with a timer.
`events.insert` and `drawable.onChange` run synchronously.
`ground.set()` does not emit move/drop callbacks for a replacement position.

See the [API reference](./api.md) for programmatic operations and [default state](https://github.com/WandererXII/shogiground/blob/master/src/state.ts) for initialization values.
