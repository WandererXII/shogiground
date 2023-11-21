## v0.8.3

- Fix square rendering for non-square boards (https://github.com/WandererXII/shogiground/pull/10).
- Dependencies updated.

## v0.8.2

- Added `shogiground.js` and `shogiground.min.js` in dist to npm.

## v0.8.1

- Fix redrawing with multiple instances of shogiground.

## v0.8.0

- Renamed `cancelMove` to `cancelMoveOrDrop` to better reflect what it actually does.
- Added an option to drop spare pieces (`selectabled.forceSpares`) by selecting a square even with selectable disabled.

## v0.7.1

- Inlined hand wrapper element (`sg-hand-wrap`) now has `inlined` class.

## v0.7.0

- Brush is also added as class to custom svgs.
- 'primary' brush class is added for arrows containing empty brush name.
- Each shape is now inside `g` element. Brush names (classes) and `sgHash` are assigned to these `g` elements - you need to update css.

## v0.6.2

- Fix `highlight.checkRoles` not being optional in `config`

## v0.6.1

- `config.checks` can now also takes `Color` or `boolean` - roles to highlight can be set in`highlight.checkRoles`
- Don't add hover class to squares, when not necessary
- Export canPremove and canPredrop
- Fix `checks` in `config`

## v0.6.0

- Remove `premove` and `predrop` included functions, now you have to pass a function that will be called, this truly removes shogi logic from shogiground.
- Remove `Role` type, now it's just `string`, again - removes shogi logic from shogiground, custom parsers for sfen must be used, but default is provided for standard shogi.
- Max size of the board extended to 16x16.
- `DropDests` use `PieceName` as a key, not role.
- `check` changed to `checks`, takes only `Key[]` now.
- Callback event - `unselect` and `unselectPiece` - triggered only when we unselect directly on the orig square/piece.
- Hex notation for coords added.
- Files and ranks notation are now set separately.
- Add description option to shapes - mainly for promotion ('+').
- Rename `Dests` to `MoveDests`.
- Changelog started.
