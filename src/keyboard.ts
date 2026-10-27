import { anim } from './anim.js';
import * as board from './board.js';
import { cancel as cancelDrag } from './drag.js';
import { cancel as cancelDraw } from './draw.js';
import { removeFromHand } from './hands.js';
import { choosePromotion } from './promotion.js';
import type { State } from './state.js';
import type * as sg from './types.js';
import {
  callUserFunction,
  computeSquareCenter,
  distanceSq,
  isKey,
  key2pos,
  opposite,
  parsePieceName,
  pieceNameOf,
  pos2key,
  samePiece,
  sentePov,
} from './util.js';

type Cursor = sg.Key | sg.Piece;
interface Target {
  cursor: Cursor;
  center: sg.Pos;
}

const directions: Record<string, sg.Pos> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

const keyboardAttributes = new Map([
  ['tabindex', '0'],
  ['role', 'group'],
  ['aria-label', 'Shogi board. Use arrow keys to navigate, Enter to select, Escape to cancel.'],
]);
const previousAttributes = new WeakMap<HTMLElement, Map<string, string | null>>();

export function focusBoard(s: State): void {
  if (s.keyboard.enabled && !s.viewOnly && !s.dom.destroyed)
    s.dom.elements.board?.board.focus({ preventScroll: true });
}

export function bindKeyboard(s: State, el: HTMLElement): sg.Unbind {
  const focus = () => focusBoard(s);
  const redraw = () => {
    if (s.keyboard.enabled) s.dom.redraw();
  };
  const keydown = (event: KeyboardEvent) => {
    if (
      !s.keyboard.enabled ||
      s.viewOnly ||
      s.dom.destroyed ||
      document.activeElement !== el ||
      event.target !== el ||
      event.defaultPrevented ||
      event.isComposing ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    )
      return;
    const direction = directions[event.key];
    if (!direction && event.key !== 'Enter' && event.key !== 'Escape') return;
    if ((s.draggable.current || s.drawable.current) && event.key !== 'Escape') return;

    event.preventDefault();
    event.stopPropagation();
    // Holding Enter must not select and then immediately confirm a promotion.
    if (event.repeat && !direction) return;

    if (event.key === 'Escape') {
      const hasSelection = !!(
        s.selected ||
        s.selectedPiece ||
        s.promotion.current ||
        s.draggable.current ||
        s.drawable.current
      );
      board.cancelPromotion(s);
      cancelDrag(s);
      cancelDraw(s);
      board.cancelMoveOrDrop(s);
      if (!hasSelection) el.blur();
    } else if (s.promotion.current) {
      const cur = s.promotion.current;
      if (direction) cur.keyboardChoice = !(cur.keyboardChoice ?? true);
      else choosePromotion(s, (cur.keyboardChoice ?? true) ? cur.promotedPiece : cur.piece);
    } else {
      const cursor = currentCursor(s);
      if (direction) moveCursor(s, cursor, direction);
      else activate(s, cursor);
    }
    s.dom.redraw();
  };

  el.addEventListener('keydown', keydown);
  el.addEventListener('mousedown', focus, true);
  el.addEventListener('focus', redraw);
  el.addEventListener('blur', redraw);
  return () => {
    el.removeEventListener('keydown', keydown);
    el.removeEventListener('mousedown', focus, true);
    el.removeEventListener('focus', redraw);
    el.removeEventListener('blur', redraw);
    s.keyboard.focused = false;
  };
}

export function syncKeyboardState(s: State, elements: sg.BoardElements): void {
  const enabled = s.keyboard.enabled && !s.viewOnly;
  if (enabled) currentCursor(s);
  s.keyboard.focused = enabled && document.activeElement === elements.board;
}

export function renderKeyboard(s: State, elements: sg.BoardElements): void {
  const enabled = s.keyboard.enabled && !s.viewOnly;
  const el = elements.board;
  const previous = previousAttributes.get(el);
  if (enabled) {
    if (!previous) {
      previousAttributes.set(
        el,
        new Map(Array.from(keyboardAttributes.keys(), (name) => [name, el.getAttribute(name)])),
      );
      for (const [name, value] of keyboardAttributes) el.setAttribute(name, value);
    }
  } else if (previous) {
    for (const [name, value] of previous) {
      if (value === null) el.removeAttribute(name);
      else el.setAttribute(name, value);
    }
    previousAttributes.delete(el);
  }
  if (!enabled && !previous) return;

  const choices = elements.promotion?.querySelectorAll('piece');
  choices?.forEach((piece, index) => {
    piece.classList.toggle(
      'keyboard-cursor',
      enabled &&
        !!s.promotion.current &&
        index === ((s.promotion.current.keyboardChoice ?? true) ? 0 : 1),
    );
    piece.classList.toggle('keyboard-focused', s.keyboard.focused);
  });
}

function currentCursor(s: State): Cursor {
  const cur = s.keyboard.current;
  if (isKey(cur)) {
    const [file, rank] = key2pos(cur);
    if (file >= 0 && file < s.dimensions.files && rank >= 0 && rank < s.dimensions.ranks)
      return cur;
  } else if (
    cur &&
    s.hands.roles.includes(cur.role) &&
    handTargets(s, cur.color).some(
      (target) => !isKey(target.cursor) && target.cursor.role === cur.role,
    )
  )
    return cur;
  s.keyboard.current = pos2key([
    Math.floor(s.dimensions.files / 2),
    Math.floor(s.dimensions.ranks / 2),
  ]);
  return s.keyboard.current;
}

function screenPos(s: State, key: sg.Key): sg.Pos {
  const [file, rank] = key2pos(key);
  return sentePov(s.orientation)
    ? [s.dimensions.files - 1 - file, rank]
    : [file, s.dimensions.ranks - 1 - rank];
}

function screenKey(s: State, [x, y]: sg.Pos): sg.Key {
  return pos2key(
    sentePov(s.orientation) ? [s.dimensions.files - 1 - x, y] : [x, s.dimensions.ranks - 1 - y],
  );
}

function center(rect: DOMRect): sg.Pos {
  return [rect.left + rect.width / 2, rect.top + rect.height / 2];
}

function handTargets(s: State, color: sg.Color): Target[] {
  const hand = s.dom.elements.hands?.[color === s.orientation ? 'bottom' : 'top'];
  if (!hand || getComputedStyle(hand).visibility === 'hidden') return [];
  const targets: Target[] = [];
  for (const [name, bounds] of s.dom.bounds.hands.pieceBounds()) {
    const piece = parsePieceName(name);
    // Include empty slots; selection still uses the existing hand restrictions.
    if (piece.color === color && bounds.width > 0 && bounds.height > 0)
      targets.push({ cursor: piece, center: center(bounds) });
  }
  return targets;
}

function nearest(targets: Target[], origin: sg.Pos): Target | undefined {
  return targets.reduce<Target | undefined>(
    (best, target) =>
      !best || distanceSq(target.center, origin) < distanceSq(best.center, origin) ? target : best,
    undefined,
  );
}

function beyond(rect: DOMRect, bounds: DOMRect, [dx, dy]: sg.Pos): boolean {
  return dx < 0
    ? rect.right <= bounds.left + 1
    : dx > 0
      ? rect.left >= bounds.right - 1
      : dy < 0
        ? rect.bottom <= bounds.top + 1
        : rect.top >= bounds.bottom - 1;
}

function moveCursor(s: State, cursor: Cursor, direction: sg.Pos): void {
  const bounds = s.dom.bounds.board.bounds();
  if (!bounds || !bounds.width || !bounds.height) return;
  if (isKey(cursor)) {
    const [x, y] = screenPos(s, cursor);
    const next: sg.Pos = [x + direction[0], y + direction[1]];
    if (
      next[0] >= 0 &&
      next[0] < s.dimensions.files &&
      next[1] >= 0 &&
      next[1] < s.dimensions.ranks
    ) {
      s.keyboard.current = screenKey(s, next);
      return;
    }
    const targets: Target[] = [];
    for (const [slot, rect] of s.dom.bounds.hands.bounds()) {
      if (beyond(rect, bounds, direction))
        targets.push(
          ...handTargets(s, slot === 'bottom' ? s.orientation : opposite(s.orientation)),
        );
    }
    const origin = computeSquareCenter(cursor, sentePov(s.orientation), s.dimensions, bounds);
    s.keyboard.current = nearest(targets, origin)?.cursor ?? cursor;
  } else {
    const rect = s.dom.bounds.hands.pieceBounds().get(pieceNameOf(cursor));
    if (!rect || !rect.width || !rect.height) {
      s.keyboard.current = undefined;
      currentCursor(s);
      return;
    }
    const origin = center(rect);
    const [dx, dy] = direction;
    const targets = handTargets(s, cursor.color).filter((target) => {
      const x = target.center[0] - origin[0];
      const y = target.center[1] - origin[1];
      const forward = x * dx + y * dy;
      const sideways = Math.abs(x * dy - y * dx);
      return forward > 1 && sideways <= forward + 1;
    });
    // The nearest board edge is a candidate only when pointing back toward it.
    if (
      (dx > 0 && origin[0] < bounds.left) ||
      (dx < 0 && origin[0] > bounds.right) ||
      (dy > 0 && origin[1] < bounds.top) ||
      (dy < 0 && origin[1] > bounds.bottom)
    ) {
      const x = Math.max(
        0,
        Math.min(
          s.dimensions.files - 1,
          Math.floor(((origin[0] - bounds.left) / bounds.width) * s.dimensions.files),
        ),
      );
      const y = Math.max(
        0,
        Math.min(
          s.dimensions.ranks - 1,
          Math.floor(((origin[1] - bounds.top) / bounds.height) * s.dimensions.ranks),
        ),
      );
      const key = screenKey(s, [x, y]);
      targets.push({
        cursor: key,
        center: computeSquareCenter(key, sentePov(s.orientation), s.dimensions, bounds),
      });
    }
    s.keyboard.current = nearest(targets, origin)?.cursor ?? cursor;
  }
}

function activate(s: State, cursor: Cursor): void {
  board.unsetPremove(s);
  board.unsetPredrop(s);

  const wasSelected = isKey(cursor)
    ? s.selected === cursor
    : !!s.selectedPiece && samePiece(s.selectedPiece, cursor);
  if (!isKey(cursor)) {
    if (s.selectable.deleteOnTouch) {
      removeFromHand(s, cursor);
      board.unselect(s);
      callUserFunction(s.events.change);
    } else board.selectPiece(s, cursor);
  } else if (s.selectable.deleteOnTouch) board.deletePiece(s, cursor);
  else if (
    !(s.selected && board.promotionDialogMove(s, s.selected, cursor)) &&
    !(s.selectedPiece && board.promotionDialogDrop(s, s.selectedPiece, cursor))
  )
    anim((state) => board.selectSquare(state, cursor), s);

  // Pointer clicks finish this toggle on mouseup when dragging is enabled.
  if (wasSelected && s.draggable.enabled) {
    if (isKey(cursor) && s.selected === cursor) {
      callUserFunction(s.events.unselect, cursor);
      board.unselect(s);
    } else if (!isKey(cursor) && s.selectedPiece && samePiece(s.selectedPiece, cursor)) {
      callUserFunction(s.events.pieceUnselect, cursor);
      board.unselect(s);
    }
  }
}
