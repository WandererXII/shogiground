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

See [shared types](../src/types.ts) and [config types](../src/config.ts).

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

Increasing the duration does not re-enable animation automatically. Set `enabled: true` too.

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

Each shape requires `orig`, `dest`, and `brush`. Origins and destinations can be a square or a complete piece identifying a hand role.
Optional fields are `piece: { role: string, color: Color, scale?: number }`, `customSvg: string`, and `description: string`.

```ts
ground.set({
  drawable: {
    shapes: [{ orig: '7g', dest: '7f', brush: 'green' }],
    squares: [{ key: '5e', className: 'target' }],
  },
});
```

Brushes and square classes need matching CSS. See [drawing types](../src/draw.ts).

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

See [API methods](../src/api.ts) for programmatic operations and [default state](../src/state.ts) for initialization values.
