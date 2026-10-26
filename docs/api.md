---
description: Shogiground API reference for creating boards, updating positions, moving and dropping pieces, drawing shapes, and managing the board lifecycle.
---

# API

`Shogiground(config?, wrapElements?)` creates an instance and returns its `Api`. Both arguments are optional. See [Setup](./setup.md) for containers and CSS, and [Configuration](./configuration.md) for settings and callbacks.

```ts
import { Shogiground } from 'shogiground';
import type { Api } from 'shogiground/api';

const ground: Api = Shogiground({
  sfen: {
    board: 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL',
    hands: '-',
  },
}, { board: document.getElementById('board')! });

ground.move('7g', '7f');
console.log(ground.getBoardSfen());
```

All methods return `void` except the SFEN getters and the two queued-action playback methods. `state` is a property.

## Shared types

| Type | Meaning |
| --- | --- |
| `Key` | Board square such as `'7g'`; use keys within the current board dimensions. |
| `Color` | `'sente'` or `'gote'`. |
| `Piece` | `{ role: string, color: Color }`. |
| `PiecesDiff` | `Map<Key, Piece \| undefined>`; `undefined` removes a piece. |
| `WrapElements` | `{ board?: HTMLElement, hands?: { top?: HTMLElement, bottom?: HTMLElement } }`. |
| `WrapElementsBoolean` | `{ board?: boolean, hands?: { top?: boolean, bottom?: boolean } }`. |
| `DrawShape` | Drawing annotation; see [Drawing](./configuration.md#drawing) for fields and examples. |
| `SquareHighlight` | `{ key: Key, className: string }`. |
| `MouchEvent` | `Event & Partial<MouseEvent & TouchEvent>`; pass the initiating mouse or touch event. |

Import shared types from `shogiground/types`, drawing types from `shogiground/draw`, `Config` from `shogiground/config`, and `State` from `shogiground/state`.

## Configuration and orientation

### `set(config: Config, skipAnimation?: boolean)`

Update the instance. Nested plain objects merge; arrays, maps, and functions are replaced. Omitted fields retain their values, subject to the [configuration update rules](./configuration.md#updates). Supply `true` as the second argument to skip the SFEN transition animation.

```ts
ground.set({ orientation: 'gote', animation: { duration: 150 } });
ground.set({ sfen: { board: '9/9/9/9/9/9/9/9/9', hands: '-' } }, true);
```

### `toggleOrientation()`

Switch between sente and gote orientation and rebuild the rendered board and hands.

## Reading the position

| Member | Result |
| --- | --- |
| `getBoardSfen(): string` | Board portion of SFEN, using the configured Forsyth converter. |
| `getHandsSfen(): string` | Hands portion of SFEN, using the configured role order and Forsyth converter; `'-'` for empty hands. |
| `state: State` | Live instance state, including pieces, hands, selection, configuration, and DOM bookkeeping. |

The getters return separate SFEN portions; neither includes the side to move or move number. Prefer API methods for updates: direct state mutation does not automatically redraw or maintain related state.

## Moving and editing pieces

### `move(orig: Key, dest: Key, prom?: boolean)`

Move a board piece programmatically, with animation when enabled. A missing origin or identical endpoints leave the position unchanged. The destination piece is replaced; an opposing piece is reported as captured in `events.move`. Captured pieces are not automatically added to hand.

### `drop(piece: Piece, key: Key, prom?: boolean, spare?: boolean)`

Place a piece on the board, replacing any piece at `key`. By default, one piece is consumed from hand and the operation requires a positive hand count. Pass `spare: true` to place a piece without consuming one from hand. This argument defaults to `false`, independently of `droppable.spare`.

For both methods, `prom: true` requests promotion through `promotion.promotesTo`. The configured force-promotion callback is also consulted when `prom` is omitted or false. These methods do not open a promotion dialog.

`move()` and `drop()` bypass user destination maps and active-color restrictions. They do not switch `turnColor` or clear destination maps. Successful operations update last-move/drop highlights, clear checks, and invoke `events.move`/`events.drop` and `events.change`. They do not invoke `movable.events.after` or `droppable.events.after`. Validate moves in your game logic and update the next turn explicitly.

```ts
ground.move('7g', '7f');
ground.set({ turnColor: 'gote' });

// Place a spare pawn without needing one in hand.
ground.drop({ role: 'pawn', color: 'sente' }, '5e', false, true);
```

### `setPieces(pieces: PiecesDiff)`

Apply a partial board edit, with animation when enabled. Squares omitted from the map stay unchanged. This does not update hands, turn, or last-move highlights, and does not emit move/drop/change callbacks.

```ts
ground.setPieces(new Map([
  ['5e', { role: 'gold', color: 'sente' }],
  ['7f', undefined],
]));
```

### Hand counts

| Method | Behavior |
| --- | --- |
| `addToHand(piece: Piece, count?: number)` | Add `count` pieces of the given role and color; default `1`. |
| `removeFromHand(piece: Piece, count?: number)` | Remove `count` pieces; default `1`. Counts are clamped at zero. |

These methods use `hands.roles` and the configured `promotion.unpromotesTo` mapping to resolve hand roles. They redraw hands without emitting `events.change`. Use `set({ sfen: { hands: '...' } })` to replace both hands.

## Selection and dragging

| Method | Behavior |
| --- | --- |
| `selectSquare(key: Key \| null, prom?: boolean, force?: boolean)` | Simulate selecting a square. With an existing selection, this can play a move/drop or queue a premove/predrop. Pass `null` to clear selection. |
| `selectPiece(piece: Piece \| null, spare?: boolean, force?: boolean)` | Select a hand piece for dropping, or a spare piece with `spare: true`. Pass `null` to clear selection. |
| `dragNewPiece(piece: Piece, event: MouchEvent, spare?: boolean)` | Start a drag from an external piece palette or hand. Pass `spare: true` for a piece that should not be consumed from hand. |

Selection methods follow the configured movement/drop rules. `force: true` permits selection when click selection and dragging are disabled; it does not bypass active-color or legal-destination checks. `selectSquare`'s `prom` flag requests promotion for the resulting move/drop.

Call `dragNewPiece` from the initiating mouse or touch handler with the original event. It requires an attached board and follows the configured dragging and drop rules.

```ts
ground.selectSquare('7g');
ground.selectSquare('7f');
ground.selectSquare(null);

ground.selectPiece({ role: 'pawn', color: 'sente' }, true);
ground.selectSquare('5e');
```

## Premoves, predrops, and cancellation

| Method | Behavior |
| --- | --- |
| `playPremove(): boolean` | Attempt the queued premove against current move destinations. Return `true` if played, otherwise `false`. |
| `playPredrop(): boolean` | Attempt the queued predrop against current drop destinations and available hand pieces. Return `true` if played, otherwise `false`. |
| `cancelPremove()` | Clear the queued premove. |
| `cancelPredrop()` | Clear the queued predrop. |
| `cancelMoveOrDrop()` | Clear selection, promotion choice, drag, premove, and predrop. |
| `stop()` | Cancel current move/drop activity and disable further user moves/drops by clearing `activeColor` and both destination maps. |

Before playing a queued action, update `turnColor` and the legal destination maps. Each playback attempt clears its queue, including when it fails. Successful playback follows user-move behavior, including switching the turn, clearing destination maps, and invoking the relevant `after` callback with `metadata.premade: true`.

To resume after `stop()`, use `set()` to restore `activeColor` and any required destination maps.

## Drawing and highlights

| Method | Behavior |
| --- | --- |
| `setShapes(shapes: DrawShape[])` | Replace the user-drawing layer. |
| `setAutoShapes(shapes: DrawShape[])` | Replace the application annotation layer. |
| `setSquareHighlights(squares: SquareHighlight[])` | Replace square highlights. |

Pass `[]` to clear a layer. These setters redraw without invoking `drawable.onChange`. User drawing gestures and automatic user-shape clearing affect `shapes`; use `autoShapes` for annotations that should persist through those interactions. Both shape layers require `drawable.visible: true` to display.

See [Drawing configuration](./configuration.md#drawing) for circles, arrows, piece overlays, custom SVGs, descriptions, and styling.

## Attaching and detaching containers

### `attach(wrapElements: WrapElements)`

Attach or replace board and/or hand containers on the existing instance. You can create an instance before containers are available, then attach them later. Size containers as described in [Setup](./setup.md).

```ts
const ground = Shogiground();
ground.attach({
  board: document.getElementById('board')!,
  hands: {
    top: document.getElementById('hand-top')!,
    bottom: document.getElementById('hand-bottom')!,
  },
});
```

### `detach(wrapElementsBoolean: WrapElementsBoolean)`

Detach the selected containers and release their element listeners while preserving the instance and position. Set a field to `true` to detach it. Detaching the board also detaches inline hands. Use `attach()` to render the instance again.

```ts
ground.detach({ board: true, hands: { top: true, bottom: true } });
```

## Cleanup

### `destroy()`

Stop the instance, cancel drawing, and release element and document event listeners. Call this when the owning component unmounts or the board is permanently removed. It does not remove the container DOM; let your application remove it. Create a new instance if you need a board after destruction.

```ts
ground.destroy();
```

The [API interface](https://github.com/WandererXII/shogiground/blob/master/src/api.ts) contains the TypeScript signatures.
