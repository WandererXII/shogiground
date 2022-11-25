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