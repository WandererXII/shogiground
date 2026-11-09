"use strict";
var Shogiground = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var index_exports = {};
  __export(index_exports, {
    default: () => index_default
  });

  // src/constants.ts
  var colors = ["sente", "gote"];
  var files = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16"
  ];
  var ranks = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p"
  ];
  var allKeys = Array.prototype.concat(
    ...ranks.map((r) => files.map((f) => f + r))
  );

  // src/util.ts
  var pos2key = (pos) => allKeys[pos[0] + 16 * pos[1]];
  var key2pos = (k) => {
    if (k.length > 2) return [k.charCodeAt(1) - 39, k.charCodeAt(2) - 97];
    else return [k.charCodeAt(0) - 49, k.charCodeAt(1) - 97];
  };
  function memo(f) {
    let v;
    const ret = () => {
      if (v === void 0) v = f();
      return v;
    };
    ret.clear = () => {
      v = void 0;
    };
    return ret;
  }
  function callUserFunction(f, ...args) {
    if (f) setTimeout(() => f(...args), 1);
  }
  var opposite = (c) => c === "sente" ? "gote" : "sente";
  var sentePov = (o) => o === "sente";
  var distanceSq = (pos1, pos2) => {
    const dx = pos1[0] - pos2[0];
    const dy = pos1[1] - pos2[1];
    return dx * dx + dy * dy;
  };
  function isKey(value) {
    return typeof value === "string";
  }
  var samePiece = (p1, p2) => p1.role === p2.role && p1.color === p2.color;
  var posToTranslateBase = (pos, dims, asSente, xFactor, yFactor) => [
    (asSente ? dims.files - 1 - pos[0] : pos[0]) * xFactor,
    (asSente ? pos[1] : dims.ranks - 1 - pos[1]) * yFactor
  ];
  var posToTranslateAbs = (dims, bounds) => {
    const xFactor = bounds.width / dims.files;
    const yFactor = bounds.height / dims.ranks;
    return (pos, asSente) => posToTranslateBase(pos, dims, asSente, xFactor, yFactor);
  };
  var posToTranslateRel = (dims) => (pos, asSente) => posToTranslateBase(pos, dims, asSente, 100, 100);
  var translateAbs = (el, pos, scale) => {
    el.style.transform = `translate(${pos[0]}px,${pos[1]}px) scale(${scale})`;
  };
  var translateRel = (el, percents, scaleFactor, scale) => {
    el.style.transform = `translate(${percents[0] * scaleFactor}%,${percents[1] * scaleFactor}%) scale(${scale || scaleFactor})`;
  };
  var setDisplay = (el, v) => {
    el.style.display = v ? "" : "none";
  };
  var isMouseEvent = (e) => {
    return !!e.clientX || e.clientX === 0;
  };
  var eventPosition = (e) => {
    var _a;
    if (isMouseEvent(e)) return [e.clientX, e.clientY];
    if ((_a = e.targetTouches) == null ? void 0 : _a[0]) return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
    return;
  };
  var isRightButton = (e) => e.buttons === 2 || e.button === 2;
  var isMiddleButton = (e) => e.buttons === 4 || e.button === 1;
  var createEl = (tagName, className) => {
    const el = document.createElement(tagName);
    if (className) el.className = className;
    return el;
  };
  function pieceNameOf(piece) {
    return `${piece.color} ${piece.role}`;
  }
  function parsePieceName(pieceName) {
    const splitted = pieceName.split(" ", 2);
    return { color: splitted[0], role: splitted[1] };
  }
  function isPieceNode(el) {
    return el.tagName === "PIECE";
  }
  function isSquareNode(el) {
    return el.tagName === "SQ";
  }
  function computeSquareCenter(key, asSente, dims, bounds) {
    const pos = key2pos(key);
    if (asSente) {
      pos[0] = dims.files - 1 - pos[0];
      pos[1] = dims.ranks - 1 - pos[1];
    }
    return [
      bounds.left + bounds.width * pos[0] / dims.files + bounds.width / (dims.files * 2),
      bounds.top + bounds.height * (dims.ranks - 1 - pos[1]) / dims.ranks + bounds.height / (dims.ranks * 2)
    ];
  }
  function domSquareIndexOfKey(key, asSente, dims) {
    const pos = key2pos(key);
    let index = dims.files - 1 - pos[0] + pos[1] * dims.files;
    if (!asSente) index = dims.files * dims.ranks - 1 - index;
    return index;
  }
  function isInsideRect(rect, pos) {
    return rect.left <= pos[0] && rect.top <= pos[1] && rect.left + rect.width > pos[0] && rect.top + rect.height > pos[1];
  }
  function isNearRect(rect, pos, r) {
    const [x, y] = pos;
    const closestX = Math.max(rect.left, Math.min(x, rect.right));
    const closestY = Math.max(rect.top, Math.min(y, rect.bottom));
    const dx = x - closestX;
    const dy = y - closestY;
    return dx * dx + dy * dy <= r * r;
  }
  function getKeyAtDomPos(pos, asSente, dims, bounds) {
    let file = Math.floor(dims.files * (pos[0] - bounds.left) / bounds.width);
    if (asSente) file = dims.files - 1 - file;
    let rank = Math.floor(dims.ranks * (pos[1] - bounds.top) / bounds.height);
    if (!asSente) rank = dims.ranks - 1 - rank;
    return file >= 0 && file < dims.files && rank >= 0 && rank < dims.ranks ? pos2key([file, rank]) : void 0;
  }
  function getHandPieceAtDomPos(pos, roles, bounds) {
    for (const color of colors) {
      for (const role of roles) {
        const piece = { color, role };
        const pieceRect = bounds.get(pieceNameOf(piece));
        if (pieceRect && isInsideRect(pieceRect, pos)) return piece;
      }
    }
    return;
  }
  function posOfOutsideEl(left, top, asSente, dims, boardBounds) {
    const sqW = boardBounds.width / dims.files;
    const sqH = boardBounds.height / dims.ranks;
    if (!sqW || !sqH) return;
    let xOff = (left - boardBounds.left) / sqW;
    if (asSente) xOff = dims.files - 1 - xOff;
    let yOff = (top - boardBounds.top) / sqH;
    if (!asSente) yOff = dims.ranks - 1 - yOff;
    return [xOff, yOff];
  }

  // src/anim.ts
  function shouldAnimate({ enabled, duration }) {
    return enabled && duration >= 70;
  }
  function anim(mutation, state) {
    return shouldAnimate(state.animation) ? animate(mutation, state) : render(mutation, state);
  }
  function render(mutation, state) {
    const result = mutation(state);
    state.dom.redraw();
    return result;
  }
  function makePiece(key, piece) {
    return {
      key,
      pos: key2pos(key),
      piece
    };
  }
  function closer(piece, pieces) {
    return pieces.sort((p1, p2) => {
      return distanceSq(piece.pos, p1.pos) - distanceSq(piece.pos, p2.pos);
    })[0];
  }
  function computePlan(prevPieces, prevHands, current) {
    const anims = /* @__PURE__ */ new Map();
    const animedOrigs = [];
    const fadings = /* @__PURE__ */ new Map();
    const promotions = /* @__PURE__ */ new Map();
    const missings = [];
    const news = [];
    const prePieces = /* @__PURE__ */ new Map();
    for (const [k, p] of prevPieces) {
      prePieces.set(k, makePiece(k, p));
    }
    for (const key of allKeys) {
      const curP = current.pieces.get(key);
      const preP = prePieces.get(key);
      if (curP) {
        if (preP) {
          if (!samePiece(curP, preP.piece)) {
            missings.push(preP);
            news.push(makePiece(key, curP));
          }
        } else news.push(makePiece(key, curP));
      } else if (preP) missings.push(preP);
    }
    if (current.animation.hands) {
      for (const color of colors) {
        const curH = current.hands.handMap.get(color);
        const preH = prevHands.get(color);
        if (preH && curH) {
          for (const [role, n] of preH) {
            const piece = { role, color };
            const curN = curH.get(role) || 0;
            if (curN < n) {
              const handPieceOffset = current.dom.bounds.hands.pieceBounds().get(pieceNameOf(piece));
              const bounds = current.dom.bounds.board.bounds();
              const outPos = handPieceOffset && bounds ? posOfOutsideEl(
                handPieceOffset.left,
                handPieceOffset.top,
                sentePov(current.orientation),
                current.dimensions,
                bounds
              ) : void 0;
              if (outPos)
                missings.push({
                  pos: outPos,
                  piece
                });
            }
          }
        }
      }
    }
    for (const newP of news) {
      const preP = closer(
        newP,
        missings.filter((p) => {
          if (samePiece(newP.piece, p.piece)) return true;
          const pRole = current.promotion.promotesTo(p.piece.role);
          const pPiece = pRole && { color: p.piece.color, role: pRole };
          const nRole = current.promotion.promotesTo(newP.piece.role);
          const nPiece = nRole && { color: newP.piece.color, role: nRole };
          return !!pPiece && samePiece(newP.piece, pPiece) || !!nPiece && samePiece(nPiece, p.piece);
        })
      );
      if (preP) {
        const vector = [preP.pos[0] - newP.pos[0], preP.pos[1] - newP.pos[1]];
        anims.set(newP.key, vector.concat(vector));
        if (preP.key) animedOrigs.push(preP.key);
        if (!samePiece(newP.piece, preP.piece) && newP.key) promotions.set(newP.key, preP.piece);
      }
    }
    for (const p of missings) {
      if (p.key && !animedOrigs.includes(p.key)) fadings.set(p.key, p.piece);
    }
    return {
      anims,
      fadings,
      promotions
    };
  }
  function step(state, now) {
    const cur = state.animation.current;
    if (cur === void 0) {
      if (!state.dom.destroyed) state.dom.redrawNow();
      return;
    }
    const rest = 1 - (now - cur.start) * cur.frequency;
    if (rest <= 0) {
      state.animation.current = void 0;
      state.dom.redrawNow();
    } else {
      const ease = easing(rest);
      for (const cfg of cur.plan.anims.values()) {
        cfg[2] = cfg[0] * ease;
        cfg[3] = cfg[1] * ease;
      }
      state.dom.redrawNow(true);
      requestAnimationFrame((now2 = performance.now()) => step(state, now2));
    }
  }
  function animate(mutation, state) {
    var _a;
    const prevPieces = new Map(state.pieces);
    const prevHands = /* @__PURE__ */ new Map([
      ["sente", new Map(state.hands.handMap.get("sente"))],
      ["gote", new Map(state.hands.handMap.get("gote"))]
    ]);
    const result = mutation(state);
    const plan = computePlan(prevPieces, prevHands, state);
    if (plan.anims.size || plan.fadings.size) {
      const alreadyRunning = ((_a = state.animation.current) == null ? void 0 : _a.start) !== void 0;
      state.animation.current = {
        start: performance.now(),
        frequency: 1 / Math.max(state.animation.duration, 1),
        plan
      };
      if (!alreadyRunning) step(state, performance.now());
    } else {
      state.dom.redraw();
    }
    return result;
  }
  function easing(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  // src/hands.ts
  function numberInHand(s, piece) {
    var _a;
    return ((_a = s.hands.handMap.get(piece.color)) == null ? void 0 : _a.get(piece.role)) || 0;
  }
  function addToHand(s, piece, cnt = 1) {
    const hand = s.hands.handMap.get(piece.color);
    const role = (s.hands.roles.includes(piece.role) ? piece.role : s.promotion.unpromotesTo(piece.role)) || piece.role;
    if (hand && s.hands.roles.includes(role)) hand.set(role, (hand.get(role) || 0) + cnt);
  }
  function removeFromHand(s, piece, cnt = 1) {
    const hand = s.hands.handMap.get(piece.color);
    const role = (s.hands.roles.includes(piece.role) ? piece.role : s.promotion.unpromotesTo(piece.role)) || piece.role;
    const num = hand == null ? void 0 : hand.get(role);
    if (hand && num) hand.set(role, Math.max(num - cnt, 0));
  }
  function renderHand(s, handEl) {
    handEl.classList.toggle("promotion", !!s.promotion.current);
    let wrapEl = handEl.firstElementChild;
    while (wrapEl) {
      const pieceEl = wrapEl.firstElementChild;
      const piece = { role: pieceEl.sgRole, color: pieceEl.sgColor };
      const cursor = s.keyboard.current;
      wrapEl.classList.toggle(
        "keyboard-cursor",
        s.keyboard.enabled && !s.viewOnly && !s.promotion.current && !!cursor && !isKey(cursor) && samePiece(cursor, piece)
      );
      wrapEl.classList.toggle("keyboard-focused", s.keyboard.focused);
      const num = numberInHand(s, piece);
      const isSelected = !!s.selectedPiece && samePiece(piece, s.selectedPiece) && !s.droppable.spare;
      wrapEl.classList.toggle(
        "selected",
        (s.activeColor === "both" || s.activeColor === s.turnColor) && isSelected
      );
      wrapEl.classList.toggle(
        "preselected",
        s.activeColor !== "both" && s.activeColor !== s.turnColor && isSelected
      );
      wrapEl.classList.toggle(
        "last-dest",
        s.highlight.lastDests && !!s.lastPiece && samePiece(piece, s.lastPiece)
      );
      wrapEl.classList.toggle("drawing", !!s.drawable.piece && samePiece(s.drawable.piece, piece));
      wrapEl.classList.toggle(
        "current-pre",
        !!s.predroppable.current && samePiece(s.predroppable.current.piece, piece)
      );
      wrapEl.dataset.nb = num.toString();
      wrapEl = wrapEl.nextElementSibling;
    }
  }

  // src/board.ts
  function toggleOrientation(state) {
    state.orientation = opposite(state.orientation);
    unselect(state);
    state.animation.current = state.draggable.current = state.hovered = void 0;
  }
  function reset(state) {
    unselect(state);
    unsetPremove(state);
    unsetPredrop(state);
    state.animation.current = state.draggable.current = state.hovered = void 0;
  }
  function setPieces(state, pieces) {
    for (const [key, piece] of pieces) {
      if (piece) state.pieces.set(key, piece);
      else state.pieces.delete(key);
    }
    unselectMissingPiece(state);
    clearPreDests(state);
  }
  function setChecks(state, checksValue) {
    if (Array.isArray(checksValue)) {
      state.checks = checksValue;
    } else {
      if (checksValue === true) checksValue = state.turnColor;
      if (checksValue) {
        const checks = [];
        for (const [k, p] of state.pieces) {
          if (state.highlight.checkRoles.includes(p.role) && p.color === checksValue) checks.push(k);
        }
        state.checks = checks;
      } else state.checks = void 0;
    }
  }
  function setPremove(state, orig, dest, prom) {
    unsetPredrop(state);
    state.premovable.current = { orig, dest, prom };
    callUserFunction(state.premovable.events.set, orig, dest, prom);
  }
  function unsetPremove(state) {
    if (state.premovable.current) {
      state.premovable.current = void 0;
      callUserFunction(state.premovable.events.unset);
    }
  }
  function setPredrop(state, piece, key, prom) {
    unsetPremove(state);
    state.predroppable.current = { piece, key, prom };
    callUserFunction(state.predroppable.events.set, piece, key, prom);
  }
  function unsetPredrop(state) {
    if (state.predroppable.current) {
      state.predroppable.current = void 0;
      callUserFunction(state.predroppable.events.unset);
    }
  }
  function baseMove(state, orig, dest, prom) {
    const origPiece = state.pieces.get(orig);
    const destPiece = state.pieces.get(dest);
    if (orig === dest || !origPiece) return false;
    const captured = destPiece && destPiece.color !== origPiece.color ? destPiece : void 0;
    const promPiece = prom && promotePiece(state, origPiece);
    if (dest === state.selected || orig === state.selected) unselect(state);
    state.pieces.set(dest, promPiece || origPiece);
    state.pieces.delete(orig);
    clearPreDests(state);
    state.lastDests = [orig, dest];
    state.lastPiece = void 0;
    state.checks = void 0;
    callUserFunction(state.events.move, orig, dest, prom, captured);
    callUserFunction(state.events.change);
    return captured || true;
  }
  function baseDrop(state, piece, key, prom, spare = state.droppable.spare) {
    const pieceCount = numberInHand(state, piece);
    if (!pieceCount && !spare) return false;
    const promPiece = prom && promotePiece(state, piece);
    if (key === state.selected || !spare && pieceCount === 1 && state.selectedPiece && samePiece(state.selectedPiece, piece))
      unselect(state);
    state.pieces.set(key, promPiece || piece);
    clearPreDests(state);
    state.lastDests = [key];
    state.lastPiece = piece;
    state.checks = void 0;
    if (!spare) removeFromHand(state, piece);
    callUserFunction(state.events.drop, piece, key, prom);
    callUserFunction(state.events.change);
    return true;
  }
  function baseUserMove(state, orig, dest, prom) {
    const result = baseMove(state, orig, dest, prom);
    if (result) {
      state.movable.dests = void 0;
      state.droppable.dests = void 0;
      state.turnColor = opposite(state.turnColor);
      state.animation.current = void 0;
    }
    return result;
  }
  function baseUserDrop(state, piece, key, prom) {
    const result = baseDrop(state, piece, key, prom);
    if (result) {
      state.movable.dests = void 0;
      state.droppable.dests = void 0;
      state.turnColor = opposite(state.turnColor);
      state.animation.current = void 0;
    }
    return result;
  }
  function userDrop(state, piece, key, prom) {
    const realProm = prom || state.promotion.forceDropPromotion(piece, key);
    if (canDrop(state, piece, key)) {
      const result = baseUserDrop(state, piece, key, realProm);
      if (result) {
        unselect(state);
        callUserFunction(state.droppable.events.after, piece, key, realProm, { premade: false });
        return true;
      }
    } else if (canPredrop(state, piece, key)) {
      setPredrop(state, piece, key, realProm);
      unselect(state);
      return true;
    }
    unselect(state);
    return false;
  }
  function userMove(state, orig, dest, prom) {
    const realProm = prom || state.promotion.forceMovePromotion(orig, dest);
    if (canMove(state, orig, dest)) {
      const result = baseUserMove(state, orig, dest, realProm);
      if (result) {
        unselect(state);
        const metadata = { premade: false };
        if (result !== true) metadata.captured = result;
        callUserFunction(state.movable.events.after, orig, dest, realProm, metadata);
        return true;
      }
    } else if (canPremove(state, orig, dest)) {
      setPremove(state, orig, dest, realProm);
      unselect(state);
      return true;
    }
    unselect(state);
    return false;
  }
  function basePromotionDialog(state, piece, key) {
    const promotedPiece = promotePiece(state, piece);
    if (state.viewOnly || state.promotion.current || !promotedPiece) return false;
    state.promotion.current = { piece, promotedPiece, key, dragged: !!state.draggable.current };
    state.hovered = key;
    return true;
  }
  function promotionDialogDrop(state, piece, key) {
    if (canDropPromote(state, piece, key) && (canDrop(state, piece, key) || canPredrop(state, piece, key))) {
      if (basePromotionDialog(state, piece, key)) {
        callUserFunction(state.promotion.events.initiated);
        return true;
      }
    }
    return false;
  }
  function promotionDialogMove(state, orig, dest) {
    if (canMovePromote(state, orig, dest) && (canMove(state, orig, dest) || canPremove(state, orig, dest))) {
      const piece = state.pieces.get(orig);
      if (piece && basePromotionDialog(state, piece, dest)) {
        callUserFunction(state.promotion.events.initiated);
        return true;
      }
    }
    return false;
  }
  function promotePiece(s, piece) {
    const promRole = s.promotion.promotesTo(piece.role);
    return promRole !== void 0 ? { color: piece.color, role: promRole } : void 0;
  }
  function deletePiece(state, key) {
    if (state.pieces.delete(key)) {
      clearPreDests(state);
      callUserFunction(state.events.change);
    }
  }
  function selectSquare(state, key, prom, force) {
    callUserFunction(state.events.select, key);
    if (!state.draggable.enabled && state.selected === key) {
      callUserFunction(state.events.unselect, key);
      unselect(state);
      return;
    }
    if (state.selectable.enabled || force || state.selectable.forceSpares && state.selectedPiece && state.droppable.spare) {
      if (state.selectedPiece && userDrop(state, state.selectedPiece, key, prom)) return;
      else if (state.selected && userMove(state, state.selected, key, prom)) return;
    }
    if ((state.selectable.enabled || state.draggable.enabled || force) && (isMovable(state, key) || isPremovable(state, key))) {
      setSelected(state, key);
    }
  }
  function selectPiece(state, piece, spare, force, api) {
    callUserFunction(state.events.pieceSelect, piece);
    if (state.selectable.addSparesToHand && state.droppable.spare && state.selectedPiece) {
      addToHand(state, { role: state.selectedPiece.role, color: piece.color });
      callUserFunction(state.events.change);
      unselect(state);
    } else if (!api && !state.draggable.enabled && state.selectedPiece && samePiece(state.selectedPiece, piece)) {
      callUserFunction(state.events.pieceUnselect, piece);
      unselect(state);
    } else if ((state.selectable.enabled || state.draggable.enabled || force) && (isDroppable(state, piece, !!spare) || isPredroppable(state, piece))) {
      setSelectedPiece(state, piece);
      state.droppable.spare = !!spare;
    } else {
      unselect(state);
    }
  }
  function setSelected(state, key) {
    unselect(state);
    state.selected = key;
  }
  function setSelectedPiece(state, piece) {
    unselect(state);
    state.selectedPiece = piece;
  }
  function clearPreDests(state) {
    state.premovable.dests = state.predroppable.dests = void 0;
  }
  function unselect(state) {
    state.selected = state.selectedPiece = void 0;
    state.droppable.spare = false;
    if (state.promotion.current) {
      state.promotion.current = state.hovered = void 0;
      callUserFunction(state.promotion.events.cancel);
    }
  }
  function unselectMissingPiece(state) {
    if (state.selected && !state.pieces.has(state.selected) || state.selectedPiece && !state.droppable.spare && numberInHand(state, state.selectedPiece) <= 0)
      unselect(state);
  }
  function isMovable(state, orig) {
    const piece = state.pieces.get(orig);
    return !!piece && (state.activeColor === "both" || state.activeColor === piece.color && state.turnColor === piece.color);
  }
  function isDroppable(state, piece, spare) {
    return (spare || numberInHand(state, piece) > 0) && (state.activeColor === "both" || state.activeColor === piece.color && state.turnColor === piece.color);
  }
  function canMove(state, orig, dest) {
    var _a, _b;
    return orig !== dest && isMovable(state, orig) && (state.movable.free || !!((_b = (_a = state.movable.dests) == null ? void 0 : _a.get(orig)) == null ? void 0 : _b.includes(dest)));
  }
  function canDrop(state, piece, dest) {
    var _a, _b;
    return isDroppable(state, piece, state.droppable.spare) && (state.droppable.free || state.droppable.spare || !!((_b = (_a = state.droppable.dests) == null ? void 0 : _a.get(pieceNameOf(piece))) == null ? void 0 : _b.includes(dest)));
  }
  function canMovePromote(state, orig, dest) {
    const piece = state.pieces.get(orig);
    return !!piece && state.promotion.movePromotionDialog(orig, dest);
  }
  function canDropPromote(state, piece, key) {
    return !state.droppable.spare && state.promotion.dropPromotionDialog(piece, key);
  }
  function isPremovable(state, orig) {
    const piece = state.pieces.get(orig);
    return !!piece && state.premovable.enabled && state.activeColor === piece.color && state.turnColor !== piece.color;
  }
  function isPredroppable(state, piece) {
    return numberInHand(state, piece) > 0 && state.predroppable.enabled && state.activeColor === piece.color && state.turnColor !== piece.color;
  }
  function premoveDests(state, orig) {
    if (!isPremovable(state, orig) || !state.premovable.generate) return [];
    if (!state.premovable.dests) state.premovable.dests = /* @__PURE__ */ new Map();
    let dests = state.premovable.dests.get(orig);
    if (!dests) {
      dests = state.premovable.generate(orig, state.pieces);
      state.premovable.dests.set(orig, dests);
    }
    return dests;
  }
  function predropDests(state, piece) {
    if (!isPredroppable(state, piece) || !state.predroppable.generate) return [];
    if (!state.predroppable.dests) state.predroppable.dests = /* @__PURE__ */ new Map();
    const name = pieceNameOf(piece);
    let dests = state.predroppable.dests.get(name);
    if (!dests) {
      dests = state.predroppable.generate(piece, state.pieces);
      state.predroppable.dests.set(name, dests);
    }
    return dests;
  }
  function canPremove(state, orig, dest) {
    return orig !== dest && premoveDests(state, orig).includes(dest);
  }
  function canPredrop(state, piece, dest) {
    const destPiece = state.pieces.get(dest);
    return (!destPiece || destPiece.color !== state.activeColor) && predropDests(state, piece).includes(dest);
  }
  function isDraggable(state, piece, fromHand = false) {
    return state.draggable.enabled && (state.activeColor === "both" || state.activeColor === piece.color && (state.turnColor === piece.color || (fromHand ? state.predroppable.enabled : state.premovable.enabled)));
  }
  function playPremove(state) {
    const move3 = state.premovable.current;
    if (!move3) return false;
    const orig = move3.orig;
    const dest = move3.dest;
    const prom = move3.prom;
    let success = false;
    if (canMove(state, orig, dest)) {
      const result = baseUserMove(state, orig, dest, prom);
      if (result) {
        const metadata = { premade: true };
        if (result !== true) metadata.captured = result;
        callUserFunction(state.movable.events.after, orig, dest, prom, metadata);
        success = true;
      }
    }
    unsetPremove(state);
    return success;
  }
  function playPredrop(state) {
    const drop = state.predroppable.current;
    if (!drop) return false;
    const piece = drop.piece;
    const key = drop.key;
    const prom = drop.prom;
    let success = false;
    if (canDrop(state, piece, key)) {
      if (baseUserDrop(state, piece, key, prom)) {
        callUserFunction(state.droppable.events.after, piece, key, prom, { premade: true });
        success = true;
      }
    }
    unsetPredrop(state);
    return success;
  }
  function cancelMoveOrDrop(state) {
    unsetPremove(state);
    unsetPredrop(state);
    unselect(state);
  }
  function stop(state) {
    state.activeColor = state.movable.dests = state.droppable.dests = state.draggable.current = state.animation.current = state.hovered = void 0;
    cancelMoveOrDrop(state);
  }

  // src/sfen.ts
  function inferDimensions(boardSfen) {
    const ranks2 = boardSfen.split(/[ _]/, 1)[0].split("/");
    const firstFile = ranks2[0].split("");
    let filesCnt = 0;
    let cnt = 0;
    for (const c of firstFile) {
      const nb = c.charCodeAt(0);
      if (nb < 58 && nb > 47) cnt = cnt * 10 + nb - 48;
      else if (c !== "+") {
        filesCnt += cnt + 1;
        cnt = 0;
      }
    }
    filesCnt += cnt;
    return { files: filesCnt, ranks: ranks2.length };
  }
  function sfenToBoard(sfen, dims, fromForsyth) {
    const sfenParser = fromForsyth || standardFromForsyth;
    const pieces = /* @__PURE__ */ new Map();
    let x = dims.files - 1;
    let y = 0;
    for (let i = 0; i < sfen.length; i++) {
      switch (sfen[i]) {
        case " ":
        case "_":
          return pieces;
        case "/":
          ++y;
          if (y > dims.ranks - 1) return pieces;
          x = dims.files - 1;
          break;
        default: {
          const nb1 = sfen[i].charCodeAt(0);
          const nb2 = sfen[i + 1] && sfen[i + 1].charCodeAt(0);
          if (nb1 < 58 && nb1 > 47) {
            if (nb2 && nb2 < 58 && nb2 > 47) {
              x -= (nb1 - 48) * 10 + (nb2 - 48);
              i++;
            } else x -= nb1 - 48;
          } else {
            const roleStr = sfen[i] === "+" && sfen.length > i + 1 ? `+${sfen[++i]}` : sfen[i];
            const role = sfenParser(roleStr);
            if (x >= 0 && role) {
              const color = roleStr === roleStr.toLowerCase() ? "gote" : "sente";
              pieces.set(pos2key([x, y]), {
                role,
                color
              });
            }
            --x;
          }
        }
      }
    }
    return pieces;
  }
  function boardToSfen(pieces, dims, toForsyth) {
    const sfenRenderer = toForsyth || standardToForsyth;
    const reversedFiles = files.slice(0, dims.files).reverse();
    return ranks.slice(0, dims.ranks).map(
      (y) => reversedFiles.map((x) => {
        const piece = pieces.get(x + y);
        const forsyth = piece && sfenRenderer(piece.role);
        if (forsyth) {
          return piece.color === "sente" ? forsyth.toUpperCase() : forsyth.toLowerCase();
        } else return "1";
      }).join("")
    ).join("/").replace(/1{2,}/g, (s) => s.length.toString());
  }
  function sfenToHands(sfen, fromForsyth) {
    const sfenParser = fromForsyth || standardFromForsyth;
    const sente = /* @__PURE__ */ new Map();
    const gote = /* @__PURE__ */ new Map();
    let tmpNum = 0;
    let num = 1;
    for (let i = 0; i < sfen.length; i++) {
      const nb = sfen[i].charCodeAt(0);
      if (nb < 58 && nb > 47) {
        tmpNum = tmpNum * 10 + nb - 48;
        num = tmpNum;
      } else {
        const roleStr = sfen[i] === "+" && sfen.length > i + 1 ? `+${sfen[++i]}` : sfen[i];
        const role = sfenParser(roleStr);
        if (role) {
          const color = roleStr === roleStr.toLowerCase() ? "gote" : "sente";
          if (color === "sente") sente.set(role, (sente.get(role) || 0) + num);
          else gote.set(role, (gote.get(role) || 0) + num);
        }
        tmpNum = 0;
        num = 1;
      }
    }
    return /* @__PURE__ */ new Map([
      ["sente", sente],
      ["gote", gote]
    ]);
  }
  function handsToSfen(hands, roles, toForsyth) {
    var _a, _b;
    const sfenRenderer = toForsyth || standardToForsyth;
    let senteHandStr = "";
    let goteHandStr = "";
    for (const role of roles) {
      const forsyth = sfenRenderer(role);
      if (forsyth) {
        const senteCnt = (_a = hands.get("sente")) == null ? void 0 : _a.get(role);
        const goteCnt = (_b = hands.get("gote")) == null ? void 0 : _b.get(role);
        if (senteCnt) senteHandStr += senteCnt > 1 ? senteCnt.toString() + forsyth : forsyth;
        if (goteCnt) goteHandStr += goteCnt > 1 ? goteCnt.toString() + forsyth : forsyth;
      }
    }
    if (senteHandStr || goteHandStr) return senteHandStr.toUpperCase() + goteHandStr.toLowerCase();
    else return "-";
  }
  function standardFromForsyth(forsyth) {
    switch (forsyth.toLowerCase()) {
      case "p":
        return "pawn";
      case "l":
        return "lance";
      case "n":
        return "knight";
      case "s":
        return "silver";
      case "g":
        return "gold";
      case "b":
        return "bishop";
      case "r":
        return "rook";
      case "+p":
        return "tokin";
      case "+l":
        return "promotedlance";
      case "+n":
        return "promotedknight";
      case "+s":
        return "promotedsilver";
      case "+b":
        return "horse";
      case "+r":
        return "dragon";
      case "k":
        return "king";
      default:
        return;
    }
  }
  function standardToForsyth(role) {
    switch (role) {
      case "pawn":
        return "p";
      case "lance":
        return "l";
      case "knight":
        return "n";
      case "silver":
        return "s";
      case "gold":
        return "g";
      case "bishop":
        return "b";
      case "rook":
        return "r";
      case "tokin":
        return "+p";
      case "promotedlance":
        return "+l";
      case "promotedknight":
        return "+n";
      case "promotedsilver":
        return "+s";
      case "horse":
        return "+b";
      case "dragon":
        return "+r";
      case "king":
        return "k";
      default:
        return;
    }
  }

  // src/config.ts
  function applyAnimation(state, config) {
    if (config.animation) {
      deepMerge(state.animation, config.animation);
      if (!shouldAnimate(state.animation)) state.animation.current = void 0;
    }
  }
  function configure(state, config) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    if ((_a = config.movable) == null ? void 0 : _a.dests) state.movable.dests = void 0;
    if ((_b = config.droppable) == null ? void 0 : _b.dests) state.droppable.dests = void 0;
    if ((_c = config.drawable) == null ? void 0 : _c.squares) state.drawable.squares = [];
    if ((_d = config.hands) == null ? void 0 : _d.roles) state.hands.roles = [];
    deepMerge(state, config);
    const { shapes, autoShapes } = (_e = config.drawable) != null ? _e : {};
    if (shapes) state.drawable.shapes = shapes.slice();
    if (autoShapes) state.drawable.autoShapes = autoShapes.slice();
    if ((_f = config.sfen) == null ? void 0 : _f.board) {
      state.dimensions = inferDimensions(config.sfen.board);
      state.pieces = sfenToBoard(config.sfen.board, state.dimensions, state.forsyth.fromForsyth);
      if (state.promotion.current) {
        const piece = state.selected ? state.pieces.get(state.selected) : state.selectedPiece;
        if (!piece || !samePiece(piece, state.promotion.current.piece)) unselect(state);
      }
      if (!shapes) state.drawable.shapes = [];
    }
    if ((_g = config.sfen) == null ? void 0 : _g.hands) {
      state.hands.handMap = sfenToHands(config.sfen.hands, state.forsyth.fromForsyth);
    }
    if (((_h = config.sfen) == null ? void 0 : _h.board) || ((_i = config.sfen) == null ? void 0 : _i.hands)) unselectMissingPiece(state);
    if ("checks" in config) setChecks(state, config.checks || false);
    if ("lastPiece" in config && !config.lastPiece) state.lastPiece = void 0;
    if ("lastDests" in config && !config.lastDests) state.lastDests = void 0;
    else if (config.lastDests) state.lastDests = config.lastDests;
    clearPreDests(state);
    applyAnimation(state, config);
  }
  function deepMerge(base, extend) {
    for (const key in extend) {
      if (Object.prototype.hasOwnProperty.call(extend, key)) {
        if (Object.prototype.hasOwnProperty.call(base, key) && isPlainObject(base[key]) && isPlainObject(extend[key]))
          deepMerge(base[key], extend[key]);
        else base[key] = extend[key];
      }
    }
  }
  function isPlainObject(o) {
    if (typeof o !== "object" || o === null) return false;
    const proto = Object.getPrototypeOf(o);
    return proto === Object.prototype || proto === null;
  }

  // src/shapes.ts
  function createSVGElement(tagName) {
    return document.createElementNS("http://www.w3.org/2000/svg", tagName);
  }
  var outsideArrowHash = "outsideArrow";
  var defaultBrush = "primary";
  var markerPrefixes = /* @__PURE__ */ new WeakMap();
  var nextMarkerScope = 0;
  function getMarkerPrefix(svg) {
    let prefix = markerPrefixes.get(svg);
    if (!prefix) {
      prefix = `sg-arrowhead-${++nextMarkerScope}`;
      markerPrefixes.set(svg, prefix);
    }
    return prefix;
  }
  function markerId(prefix, brush) {
    return `${prefix}-${brush || defaultBrush}`;
  }
  function renderShapes(state, svg, customSvg, freePieces) {
    const d = state.drawable;
    const curD = d.current;
    const cur = (curD == null ? void 0 : curD.dest) ? curD : void 0;
    const outsideArrow = !!curD && !cur;
    const arrowDests = /* @__PURE__ */ new Map();
    const pieceMap = /* @__PURE__ */ new Map();
    const hashBounds = (piece) => {
      const bounds = state.dom.bounds.board.bounds();
      const pieceBounds = state.dom.bounds.hands.pieceBounds().get(pieceNameOf(piece));
      return bounds && pieceBounds ? [
        bounds.width,
        bounds.height,
        pieceBounds.left - bounds.left,
        pieceBounds.top - bounds.top,
        pieceBounds.width,
        pieceBounds.height
      ].join(":") : "";
    };
    for (const s of d.shapes.concat(d.autoShapes).concat(cur ? [cur] : [])) {
      const destName = isPiece(s.dest) ? pieceNameOf(s.dest) : s.dest;
      if (!samePieceOrKey(s.dest, s.orig))
        arrowDests.set(destName, (arrowDests.get(destName) || 0) + 1);
    }
    for (const s of d.shapes.concat(cur ? [cur] : []).concat(d.autoShapes)) {
      if (s.piece && !isPiece(s.orig)) pieceMap.set(s.orig, s);
    }
    const pieceShapes = [...pieceMap.values()].map((s) => {
      return {
        shape: s,
        hash: pieceShapeHash(s, state.scaleDownPieces)
      };
    });
    const shapes = d.autoShapes.concat(d.shapes).map((s) => {
      return {
        shape: s,
        hash: s.customSvg ? customShapeHash(s, hashBounds) : shapeHash(s, arrowDests, false, hashBounds)
      };
    });
    if (cur)
      shapes.push({
        shape: cur,
        hash: shapeHash(cur, arrowDests, true, hashBounds),
        current: true
      });
    const fullHash = shapes.map((sc) => sc.hash).join(";") + (outsideArrow ? outsideArrowHash : "") + state.scaleDownPieces;
    if (fullHash === state.drawable.prevSvgHash) return;
    state.drawable.prevSvgHash = fullHash;
    const markerPrefix = getMarkerPrefix(svg);
    const defsEl = svg.querySelector("defs");
    const shapesEl = svg.querySelector("g");
    const customSvgsEl = customSvg.querySelector("g");
    syncDefs(shapes, outsideArrow ? curD : void 0, defsEl, markerPrefix);
    syncShapes(
      shapes.filter((s) => !s.shape.customSvg && (!s.shape.piece || s.current)),
      shapesEl,
      (shape) => renderSVGShape(state, shape, arrowDests, markerPrefix),
      outsideArrow
    );
    syncShapes(
      shapes.filter((s) => s.shape.customSvg),
      customSvgsEl,
      (shape) => renderSVGShape(state, shape, arrowDests, markerPrefix)
    );
    syncShapes(pieceShapes, freePieces, (shape) => renderPiece(state, shape));
    if (!outsideArrow && curD) curD.arrow = void 0;
    if (outsideArrow && !curD.arrow) {
      const orig = pieceOrKeyToPos(curD.orig, state);
      if (orig) {
        const g = setAttributes(createSVGElement("g"), {
          class: shapeClass(curD.brush, true, true),
          sgHash: outsideArrowHash
        });
        const el = renderArrow(
          markerId(markerPrefix, curD.brush),
          orig,
          orig,
          state.squareRatio,
          true,
          false
        );
        g.appendChild(el);
        curD.arrow = el;
        shapesEl.appendChild(g);
      }
    }
  }
  function syncDefs(shapes, outsideShape, defsEl, markerPrefix) {
    const brushes2 = /* @__PURE__ */ new Set();
    for (const s of shapes) {
      if (!samePieceOrKey(s.shape.dest, s.shape.orig)) brushes2.add(s.shape.brush || defaultBrush);
    }
    if (outsideShape) brushes2.add(outsideShape.brush || defaultBrush);
    const keysInDom = /* @__PURE__ */ new Set();
    let el = defsEl.firstElementChild;
    while (el) {
      keysInDom.add(el.getAttribute("data-brush"));
      el = el.nextElementSibling;
    }
    for (const brush of brushes2) {
      if (!keysInDom.has(brush))
        defsEl.appendChild(renderMarker(markerId(markerPrefix, brush), brush));
    }
  }
  function syncShapes(shapes, root, renderShape, outsideArrow) {
    const elsInDom = /* @__PURE__ */ new Map();
    let el = root.firstElementChild;
    while (el) {
      const elHash = el.getAttribute("sgHash");
      if (!outsideArrow || elHash !== outsideArrowHash) {
        const els = elsInDom.get(elHash);
        if (els) els.push(el);
        else elsInDom.set(elHash, [el]);
      }
      el = el.nextElementSibling;
    }
    const kept = shapes.map((sc) => {
      var _a;
      return (_a = elsInDom.get(sc.hash)) == null ? void 0 : _a.shift();
    });
    for (const els of elsInDom.values()) {
      for (const el2 of els) root.removeChild(el2);
    }
    el = root.firstElementChild;
    shapes.forEach((sc, i) => {
      var _a;
      const shapeEl = kept[i] || renderShape(sc);
      if (shapeEl === el) el = (_a = el == null ? void 0 : el.nextElementSibling) != null ? _a : null;
      else if (shapeEl) root.insertBefore(shapeEl, el);
    });
  }
  function shapeHash({ orig, dest, brush, piece, description }, arrowDests, current, boundHash) {
    return [
      current,
      isPiece(orig) && boundHash(orig),
      isPiece(dest) && boundHash(dest),
      isPiece(orig) ? pieceHash(orig) : orig,
      isPiece(dest) ? pieceHash(dest) : dest,
      brush,
      (arrowDests.get(isPiece(dest) ? pieceNameOf(dest) : dest) || 0) > 1,
      piece && pieceHash(piece),
      description
    ].filter((x) => x).join(",");
  }
  function pieceShapeHash({ orig, piece }, scaleDown) {
    return [scaleDown, isPiece(orig) ? pieceHash(orig) : orig, piece && pieceHash(piece)].join(",");
  }
  function customShapeHash({ orig, brush, customSvg }, boundHash) {
    return [
      isPiece(orig) && boundHash(orig),
      isPiece(orig) ? pieceHash(orig) : orig,
      brush,
      customSvg && customSvgHash(customSvg)
    ].filter((x) => x).join(",");
  }
  function pieceHash(piece) {
    return [piece.color, piece.role, piece.scale].filter((x) => x).join(",");
  }
  function customSvgHash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i) >>> 0;
    }
    return `custom-${h.toString()}`;
  }
  function renderSVGShape(state, { shape, current, hash }, arrowDests, markerPrefix) {
    const orig = pieceOrKeyToPos(shape.orig, state);
    if (!orig) return;
    if (shape.customSvg) {
      return renderCustomSvg(shape.brush, shape.customSvg, orig, state.squareRatio, hash);
    } else {
      let el;
      const dest = !samePieceOrKey(shape.orig, shape.dest) && pieceOrKeyToPos(shape.dest, state);
      if (dest) {
        el = renderArrow(
          markerId(markerPrefix, shape.brush),
          orig,
          dest,
          state.squareRatio,
          !!current,
          (arrowDests.get(isPiece(shape.dest) ? pieceNameOf(shape.dest) : shape.dest) || 0) > 1
        );
      } else if (samePieceOrKey(shape.dest, shape.orig)) {
        let ratio = state.squareRatio;
        if (isPiece(shape.orig)) {
          const pieceBounds = state.dom.bounds.hands.pieceBounds().get(pieceNameOf(shape.orig));
          const bounds = state.dom.bounds.board.bounds();
          if (pieceBounds && bounds) {
            const heightBase = pieceBounds.height / (bounds.height / state.dimensions.ranks);
            ratio = [heightBase * state.squareRatio[0], heightBase * state.squareRatio[1]];
          }
        }
        el = renderEllipse(orig, ratio, !!current);
      }
      if (el) {
        const g = setAttributes(createSVGElement("g"), {
          class: shapeClass(shape.brush, !!current, false),
          sgHash: hash
        });
        g.appendChild(el);
        const descEl = shape.description && renderDescription(state, shape, arrowDests);
        if (descEl) g.appendChild(descEl);
        return g;
      } else return;
    }
  }
  function renderCustomSvg(brush, customSvg, pos, ratio, hash) {
    const [x, y] = pos;
    const g = setAttributes(createSVGElement("g"), {
      transform: `translate(${x},${y})`,
      sgHash: hash
    });
    const svg = setAttributes(createSVGElement("svg"), {
      class: brush,
      width: ratio[0],
      height: ratio[1],
      viewBox: `0 0 ${ratio[0] * 10} ${ratio[1] * 10}`
    });
    g.appendChild(svg);
    svg.innerHTML = customSvg;
    return g;
  }
  function renderEllipse(pos, ratio, current) {
    const o = pos;
    const widths = ellipseWidth(ratio);
    return setAttributes(createSVGElement("ellipse"), {
      "stroke-width": widths[current ? 0 : 1],
      fill: "none",
      cx: o[0],
      cy: o[1],
      rx: ratio[0] / 2 - widths[1] / 2,
      ry: ratio[1] / 2 - widths[1] / 2
    });
  }
  function renderArrow(markerId2, orig, dest, ratio, current, shorten) {
    const m = arrowMargin(shorten && !current, ratio);
    const a = orig;
    const b = dest;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const angle = Math.atan2(dy, dx);
    const xo = Math.cos(angle) * m;
    const yo = Math.sin(angle) * m;
    return setAttributes(createSVGElement("line"), {
      "stroke-width": lineWidth(current, ratio),
      "stroke-linecap": "round",
      "marker-end": `url(#${markerId2})`,
      x1: a[0],
      y1: a[1],
      x2: b[0] - xo,
      y2: b[1] - yo
    });
  }
  function renderPiece(state, { shape, hash }) {
    if (!shape.piece || isPiece(shape.orig)) return;
    const orig = shape.orig;
    const scale = (shape.piece.scale || 1) * (state.scaleDownPieces ? 0.5 : 1);
    const pieceEl = createEl("piece", pieceNameOf(shape.piece));
    pieceEl.setAttribute("sgHash", hash);
    pieceEl.sgKey = orig;
    pieceEl.sgScale = scale;
    translateRel(
      pieceEl,
      posToTranslateRel(state.dimensions)(key2pos(orig), sentePov(state.orientation)),
      state.scaleDownPieces ? 0.5 : 1,
      scale
    );
    return pieceEl;
  }
  function renderDescription(state, shape, arrowDests) {
    const orig = pieceOrKeyToPos(shape.orig, state);
    if (!orig || !shape.description) return;
    const dest = !samePieceOrKey(shape.orig, shape.dest) && pieceOrKeyToPos(shape.dest, state);
    const diff = dest ? [dest[0] - orig[0], dest[1] - orig[1]] : [0, 0];
    const offset = (arrowDests.get(isPiece(shape.dest) ? pieceNameOf(shape.dest) : shape.dest) || 0) > 1 ? 0.3 : 0.15;
    const close = (diff[0] === 0 || Math.abs(diff[0]) === state.squareRatio[0]) && (diff[1] === 0 || Math.abs(diff[1]) === state.squareRatio[1]);
    const ratio = dest ? 0.55 - (close ? offset : 0) : 0;
    const mid = [orig[0] + diff[0] * ratio, orig[1] + diff[1] * ratio];
    const textLength = shape.description.length;
    const g = setAttributes(createSVGElement("g"), { class: "description" });
    const circle = setAttributes(createSVGElement("ellipse"), {
      cx: mid[0],
      cy: mid[1],
      rx: textLength + 1.5,
      ry: 2.5
    });
    const text = setAttributes(createSVGElement("text"), {
      x: mid[0],
      y: mid[1],
      "text-anchor": "middle",
      "dominant-baseline": "central"
    });
    g.appendChild(circle);
    text.appendChild(document.createTextNode(shape.description));
    g.appendChild(text);
    return g;
  }
  function renderMarker(id, brush) {
    const marker = setAttributes(createSVGElement("marker"), {
      id,
      "data-brush": brush,
      orient: "auto",
      markerWidth: 4,
      markerHeight: 8,
      refX: 2.05,
      refY: 2.01
    });
    marker.appendChild(
      setAttributes(createSVGElement("path"), {
        d: "M0,0 V4 L3,2 Z"
      })
    );
    return marker;
  }
  function setAttributes(el, attrs) {
    for (const key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) el.setAttribute(key, attrs[key]);
    }
    return el;
  }
  function pos2user(pos, color, dims, ratio) {
    return color === "sente" ? [(dims.files - 1 - pos[0]) * ratio[0], pos[1] * ratio[1]] : [pos[0] * ratio[0], (dims.ranks - 1 - pos[1]) * ratio[1]];
  }
  function isPiece(x) {
    return typeof x === "object";
  }
  function samePieceOrKey(kp1, kp2) {
    return isPiece(kp1) && isPiece(kp2) && samePiece(kp1, kp2) || kp1 === kp2;
  }
  function usesBounds(shapes) {
    return shapes.some((s) => isPiece(s.orig) || isPiece(s.dest));
  }
  function shapeClass(brush, current, outside) {
    return (brush || defaultBrush) + (current ? " current" : "") + (outside ? " outside" : "");
  }
  function ratioAverage(ratio) {
    return (ratio[0] + ratio[1]) / 2;
  }
  function ellipseWidth(ratio) {
    return [3 / 64 * ratioAverage(ratio), 4 / 64 * ratioAverage(ratio)];
  }
  function lineWidth(current, ratio) {
    return (current ? 8.5 : 10) / 64 * ratioAverage(ratio);
  }
  function arrowMargin(shorten, ratio) {
    return (shorten ? 20 : 10) / 64 * ratioAverage(ratio);
  }
  function pieceOrKeyToPos(kp, state) {
    if (isPiece(kp)) {
      const pieceBounds = state.dom.bounds.hands.pieceBounds().get(pieceNameOf(kp));
      const bounds = state.dom.bounds.board.bounds();
      const offset = sentePov(state.orientation) ? [0.5, -0.5] : [-0.5, 0.5];
      const pos = pieceBounds && bounds && posOfOutsideEl(
        pieceBounds.left + pieceBounds.width / 2,
        pieceBounds.top + pieceBounds.height / 2,
        sentePov(state.orientation),
        state.dimensions,
        bounds
      );
      return pos && pos2user(
        [pos[0] + offset[0], pos[1] + offset[1]],
        state.orientation,
        state.dimensions,
        state.squareRatio
      );
    } else return pos2user(key2pos(kp), state.orientation, state.dimensions, state.squareRatio);
  }

  // src/draw.ts
  var brushes = ["primary", "alternative0", "alternative1", "alternative2"];
  function start(state, e) {
    if (e.touches && e.touches.length > 1) return;
    e.stopPropagation();
    e.preventDefault();
    if (e.ctrlKey) unselect(state);
    else cancelMoveOrDrop(state);
    const pos = eventPosition(e);
    const bounds = state.dom.bounds.board.bounds();
    const orig = pos && bounds && getKeyAtDomPos(pos, sentePov(state.orientation), state.dimensions, bounds);
    const piece = state.drawable.piece;
    if (!orig) return;
    state.drawable.current = {
      orig,
      dest: void 0,
      pos,
      piece,
      brush: eventBrush(e, isRightButton(e) || state.drawable.forced)
    };
    processDraw(state);
  }
  function startFromHand(state, piece, e) {
    if (e.touches && e.touches.length > 1) return;
    e.stopPropagation();
    e.preventDefault();
    if (e.ctrlKey) unselect(state);
    else cancelMoveOrDrop(state);
    const pos = eventPosition(e);
    if (!pos) return;
    state.drawable.current = {
      orig: piece,
      dest: void 0,
      pos,
      brush: eventBrush(e, isRightButton(e) || state.drawable.forced)
    };
    processDraw(state);
  }
  function processDraw(state) {
    requestAnimationFrame(() => {
      const cur = state.drawable.current;
      const bounds = state.dom.bounds.board.bounds();
      if (cur && bounds) {
        const dest = getDestination(state, cur.pos);
        if (cur.dest !== dest && !(cur.dest && dest && samePieceOrKey(dest, cur.dest))) {
          cur.dest = dest;
          state.dom.redrawNow();
        }
        const outPos = posOfOutsideEl(
          cur.pos[0],
          cur.pos[1],
          sentePov(state.orientation),
          state.dimensions,
          bounds
        );
        if (!cur.dest && cur.arrow && outPos) {
          const dest2 = pos2user(outPos, state.orientation, state.dimensions, state.squareRatio);
          setAttributes(cur.arrow, {
            x2: dest2[0] - state.squareRatio[0] / 2,
            y2: dest2[1] - state.squareRatio[1] / 2
          });
        }
        processDraw(state);
      }
    });
  }
  function move(state, e) {
    const pos = eventPosition(e);
    if (pos && state.drawable.current) state.drawable.current.pos = pos;
  }
  function end(state, e) {
    const cur = state.drawable.current;
    if (cur) {
      cur.dest = getDestination(state, eventPosition(e) || cur.pos);
      addShape(state.drawable, cur);
      cancel(state);
    }
  }
  function getDestination(state, pos) {
    const bounds = state.dom.bounds.board.bounds();
    return bounds && (getKeyAtDomPos(pos, sentePov(state.orientation), state.dimensions, bounds) || getHandPieceAtDomPos(pos, state.hands.roles, state.dom.bounds.hands.pieceBounds()));
  }
  function cancel(state) {
    if (state.drawable.current) {
      state.drawable.current = void 0;
      state.dom.redraw();
    }
  }
  function clear(state) {
    const drawableLength = state.drawable.shapes.length;
    if (drawableLength || state.drawable.piece) {
      state.drawable.shapes = [];
      state.drawable.piece = void 0;
      state.dom.redraw();
      if (drawableLength) onChange(state.drawable);
    }
  }
  function setDrawPiece(state, piece) {
    if (state.drawable.piece && samePiece(state.drawable.piece, piece))
      state.drawable.piece = void 0;
    else state.drawable.piece = piece;
    state.dom.redraw();
  }
  function eventBrush(e, allowFirstModifier) {
    var _a;
    const modA = allowFirstModifier && (e.shiftKey || e.ctrlKey);
    const modB = e.altKey || e.metaKey || ((_a = e.getModifierState) == null ? void 0 : _a.call(e, "AltGraph"));
    return brushes[(modA ? 1 : 0) + (modB ? 2 : 0)];
  }
  function addShape(drawable, cur) {
    if (!cur.dest) return;
    const similarShape = (s) => cur.dest && samePieceOrKey(cur.orig, s.orig) && samePieceOrKey(cur.dest, s.dest);
    const piece = cur.piece;
    cur.piece = void 0;
    const similar = drawable.shapes.find(similarShape);
    const removePiece = drawable.shapes.find(
      (s) => similarShape(s) && piece && s.piece && samePiece(piece, s.piece)
    );
    const diffPiece = drawable.shapes.find(
      (s) => similarShape(s) && piece && s.piece && !samePiece(piece, s.piece)
    );
    if (similar) drawable.shapes = drawable.shapes.filter((s) => !similarShape(s));
    if (!isPiece(cur.orig) && piece && !removePiece) {
      drawable.shapes.push({
        orig: cur.orig,
        dest: cur.orig,
        piece,
        brush: cur.brush
      });
      if (!samePieceOrKey(cur.orig, cur.dest))
        drawable.shapes.push({
          orig: cur.orig,
          dest: cur.orig,
          brush: cur.brush
        });
    }
    if (!similar || diffPiece || similar.brush !== cur.brush)
      drawable.shapes.push({ orig: cur.orig, dest: cur.dest, brush: cur.brush });
    onChange(drawable);
  }
  function onChange(drawable) {
    if (drawable.onChange) drawable.onChange(drawable.shapes);
  }

  // src/drag.ts
  function start2(s, e) {
    var _a;
    const bounds = s.dom.bounds.board.bounds();
    const position = eventPosition(e);
    const orig = bounds && position && getKeyAtDomPos(position, sentePov(s.orientation), s.dimensions, bounds);
    if (!orig) return;
    const piece = s.pieces.get(orig);
    const previouslySelected = s.selected;
    if (!previouslySelected && s.drawable.enabled && (s.drawable.eraseOnClick || !piece || piece.color !== s.turnColor))
      clear(s);
    if (e.cancelable !== false && (!e.touches || s.blockTouchScroll || s.selectedPiece || piece || previouslySelected || pieceCloseTo(s, position, bounds)))
      e.preventDefault();
    const hadPremove = !!s.premovable.current;
    const hadPredrop = !!s.predroppable.current;
    if (s.selectable.deleteOnTouch) deletePiece(s, orig);
    else if (s.selected) {
      if (!s.selectable.enabled || !promotionDialogMove(s, s.selected, orig)) {
        if (canMove(s, s.selected, orig)) anim((state) => selectSquare(state, orig), s);
        else selectSquare(s, orig);
      }
    } else if (s.selectedPiece) {
      if (!s.selectable.enabled || !promotionDialogDrop(s, s.selectedPiece, orig)) {
        if (canDrop(s, s.selectedPiece, orig))
          anim((state) => selectSquare(state, orig), s);
        else selectSquare(s, orig);
      }
    } else {
      selectSquare(s, orig);
    }
    const stillSelected = s.selected === orig;
    const draggedEl = (_a = s.dom.elements.board) == null ? void 0 : _a.dragged;
    if (piece && draggedEl && stillSelected && isDraggable(s, piece)) {
      const touch = e.type === "touchstart";
      s.draggable.current = {
        piece,
        pos: position,
        origPos: position,
        started: s.draggable.autoDistance && !touch,
        spare: false,
        touch,
        originTarget: e.target,
        fromBoard: {
          orig,
          previouslySelected,
          keyHasChanged: false
        }
      };
      draggedEl.sgColor = piece.color;
      draggedEl.sgRole = piece.role;
      draggedEl.className = `dragging ${pieceNameOf(piece)}`;
      draggedEl.classList.toggle("touch", touch);
      processDrag(s);
    } else {
      if (hadPremove) unsetPremove(s);
      if (hadPredrop) unsetPredrop(s);
    }
    s.dom.redraw();
  }
  function pieceCloseTo(s, pos, bounds) {
    const asSente = sentePov(s.orientation);
    const radiusSq = (bounds.width / s.dimensions.files) ** 2;
    for (const key of s.pieces.keys()) {
      const center2 = computeSquareCenter(key, asSente, s.dimensions, bounds);
      if (distanceSq(center2, pos) <= radiusSq) return true;
    }
    return false;
  }
  function dragNewPiece(s, piece, e, spare) {
    var _a;
    const previouslySelectedPiece = s.selectedPiece;
    const draggedEl = (_a = s.dom.elements.board) == null ? void 0 : _a.dragged;
    const position = eventPosition(e);
    const touch = e.type === "touchstart";
    if (!previouslySelectedPiece && !spare && s.drawable.enabled && s.drawable.eraseOnClick)
      clear(s);
    if (!spare && s.selectable.deleteOnTouch) {
      removeFromHand(s, piece);
      unselect(s);
      callUserFunction(s.events.change);
    } else selectPiece(s, piece, spare);
    const hadPremove = !!s.premovable.current;
    const hadPredrop = !!s.predroppable.current;
    const stillSelected = s.selectedPiece && samePiece(s.selectedPiece, piece);
    if (e.cancelable !== false && (!e.touches || s.blockTouchScroll || s.selectedPiece || previouslySelectedPiece || stillSelected || numberInHand(s, piece) > 0 || position && handPieceCloseTo(s, position)))
      e.preventDefault();
    if (draggedEl && position && s.selectedPiece && stillSelected && isDraggable(s, piece, true)) {
      s.draggable.current = {
        piece: s.selectedPiece,
        pos: position,
        origPos: position,
        touch,
        started: s.draggable.autoDistance && !touch,
        spare: !!spare,
        originTarget: e.target,
        fromOutside: {
          originBounds: !spare ? s.dom.bounds.hands.pieceBounds().get(pieceNameOf(piece)) : void 0,
          leftOrigin: false,
          previouslySelectedPiece: !spare ? previouslySelectedPiece : void 0
        }
      };
      draggedEl.sgColor = piece.color;
      draggedEl.sgRole = piece.role;
      draggedEl.className = `dragging ${pieceNameOf(piece)}`;
      draggedEl.classList.toggle("touch", touch);
      processDrag(s);
    } else {
      if (hadPremove) unsetPremove(s);
      if (hadPredrop) unsetPredrop(s);
    }
    s.dom.redraw();
  }
  function isDragPieceValid(s, cur) {
    if (!cur.fromBoard) return cur.spare || numberInHand(s, cur.piece) > 0;
    const origPiece = s.pieces.get(cur.fromBoard.orig);
    return !!origPiece && samePiece(origPiece, cur.piece);
  }
  function tryStartDrag(s, cur, pos) {
    if (!cur.started && distanceSq(pos, cur.origPos) >= s.draggable.distance ** 2) return true;
    return false;
  }
  function processDrag(s) {
    requestAnimationFrame(() => {
      var _a, _b, _c, _d;
      const cur = s.draggable.current;
      const draggedEl = (_a = s.dom.elements.board) == null ? void 0 : _a.dragged;
      const bounds = s.dom.bounds.board.bounds();
      if (!cur || !draggedEl || !bounds) return;
      if (((_b = cur.fromBoard) == null ? void 0 : _b.orig) && ((_c = s.animation.current) == null ? void 0 : _c.plan.anims.has(cur.fromBoard.orig)))
        s.animation.current = void 0;
      if (!isDragPieceValid(s, cur)) cancel2(s);
      else {
        if (tryStartDrag(s, cur, cur.pos)) {
          cur.started = true;
          s.dom.redraw();
        }
        if (cur.started) {
          translateAbs(
            draggedEl,
            [
              cur.pos[0] - bounds.left - bounds.width / (s.dimensions.files * 2),
              cur.pos[1] - bounds.top - bounds.height / (s.dimensions.ranks * 2)
            ],
            s.scaleDownPieces ? 0.5 : 1
          );
          if (!draggedEl.sgDragging) {
            draggedEl.sgDragging = true;
            setDisplay(draggedEl, true);
          }
          const hover = getKeyAtDomPos(
            cur.pos,
            sentePov(s.orientation),
            s.dimensions,
            bounds
          );
          if (cur.fromBoard)
            cur.fromBoard.keyHasChanged = cur.fromBoard.keyHasChanged || cur.fromBoard.orig !== hover;
          else if (cur.fromOutside)
            cur.fromOutside.leftOrigin = cur.fromOutside.leftOrigin || !!cur.fromOutside.originBounds && !isInsideRect(cur.fromOutside.originBounds, cur.pos);
          if (hover !== s.hovered) {
            updateHoveredSquares(s, hover);
            if (cur.touch && ((_d = s.dom.elements.board) == null ? void 0 : _d.squareOver)) {
              if (hover && s.draggable.showTouchSquareOverlay) {
                translateAbs(
                  s.dom.elements.board.squareOver,
                  posToTranslateAbs(s.dimensions, bounds)(
                    key2pos(hover),
                    sentePov(s.orientation)
                  ),
                  1
                );
                setDisplay(s.dom.elements.board.squareOver, true);
              } else {
                setDisplay(s.dom.elements.board.squareOver, false);
              }
            }
          }
        }
      }
      processDrag(s);
    });
  }
  function move2(s, e) {
    if (s.draggable.current && (!e.touches || e.touches.length < 2)) {
      const pos = eventPosition(e);
      if (pos) s.draggable.current.pos = pos;
    } else if ((s.selected || s.selectedPiece || s.highlight.hovered) && !s.draggable.current && (!e.touches || e.touches.length < 2)) {
      const pos = eventPosition(e);
      const bounds = s.dom.bounds.board.bounds();
      const hover = pos && bounds && getKeyAtDomPos(pos, sentePov(s.orientation), s.dimensions, bounds);
      if (hover !== s.hovered) updateHoveredSquares(s, hover);
    }
  }
  function end2(s, e) {
    var _a, _b, _c;
    const cur = s.draggable.current;
    if (!cur) return;
    if (e.type === "touchend" && e.cancelable !== false) e.preventDefault();
    if (!isDragPieceValid(s, cur)) {
      cancel2(s);
      return;
    }
    if (e.type === "touchend" && cur.originTarget !== e.target && !cur.fromOutside) {
      s.draggable.current = void 0;
      if (s.hovered && !s.highlight.hovered) updateHoveredSquares(s, void 0);
      s.dom.redraw();
      return;
    }
    unsetPremove(s);
    unsetPredrop(s);
    const eventPos = eventPosition(e) || cur.pos;
    if (tryStartDrag(s, cur, eventPos)) {
      cur.started = true;
    }
    const bounds = s.dom.bounds.board.bounds();
    const dest = bounds && getKeyAtDomPos(eventPos, sentePov(s.orientation), s.dimensions, bounds);
    const originHandBounds = cur.fromOutside && !cur.spare ? s.dom.bounds.hands.bounds().get(cur.piece.color === s.orientation ? "bottom" : "top") || cur.fromOutside.originBounds : void 0;
    if (dest && cur.started && ((_a = cur.fromBoard) == null ? void 0 : _a.orig) !== dest) {
      if (cur.fromOutside && !promotionDialogDrop(s, cur.piece, dest))
        userDrop(s, cur.piece, dest);
      else if (cur.fromBoard && !promotionDialogMove(s, cur.fromBoard.orig, dest))
        userMove(s, cur.fromBoard.orig, dest);
    } else if (s.draggable.deleteOnDropOff && cur.started && !dest && (!originHandBounds || !isInsideRect(originHandBounds, eventPos))) {
      if (cur.fromBoard) {
        s.pieces.delete(cur.fromBoard.orig);
        clearPreDests(s);
      } else if (cur.fromOutside && !cur.spare) removeFromHand(s, cur.piece);
      if (s.draggable.addToHandOnDropOff) {
        const handBounds = s.dom.bounds.hands.bounds();
        const handBoundsTop = handBounds.get("top");
        const handBoundsBottom = handBounds.get("bottom");
        if (handBoundsTop && isInsideRect(handBoundsTop, eventPos))
          addToHand(s, {
            color: opposite(s.orientation),
            role: cur.piece.role
          });
        else if (handBoundsBottom && isInsideRect(handBoundsBottom, eventPos))
          addToHand(s, { color: s.orientation, role: cur.piece.role });
        unselect(s);
      }
      callUserFunction(s.events.change);
    }
    if (cur.fromBoard && (cur.fromBoard.orig === cur.fromBoard.previouslySelected || cur.fromBoard.keyHasChanged) && (cur.fromBoard.orig === dest || !dest)) {
      unselect2(s, cur, dest);
    } else if (!dest && ((_b = cur.fromOutside) == null ? void 0 : _b.leftOrigin) || ((_c = cur.fromOutside) == null ? void 0 : _c.originBounds) && isInsideRect(cur.fromOutside.originBounds, cur.pos) && cur.fromOutside.previouslySelectedPiece && samePiece(cur.fromOutside.previouslySelectedPiece, cur.piece)) {
      unselect2(s, cur, dest);
    } else if (!s.selectable.enabled && !s.promotion.current) {
      unselect2(s, cur, dest);
    }
    s.draggable.current = void 0;
    if (!s.highlight.hovered && !s.promotion.current) s.hovered = void 0;
    s.dom.redraw();
  }
  function handPieceCloseTo(s, pos) {
    for (const color of colors) {
      for (const role of s.hands.roles) {
        const piece = { color, role };
        const rect = s.dom.bounds.hands.pieceBounds().get(pieceNameOf(piece));
        if (rect && isNearRect(rect, pos, rect.width / 2) && numberInHand(s, piece) > 0)
          return true;
      }
    }
    return false;
  }
  function unselect2(s, cur, dest) {
    var _a;
    if (cur.fromBoard && cur.fromBoard.orig === dest)
      callUserFunction(s.events.unselect, cur.fromBoard.orig);
    else if (((_a = cur.fromOutside) == null ? void 0 : _a.originBounds) && isInsideRect(cur.fromOutside.originBounds, cur.pos))
      callUserFunction(s.events.pieceUnselect, cur.piece);
    unselect(s);
  }
  function cancel2(s) {
    if (s.draggable.current) {
      s.draggable.current = void 0;
      if (!s.highlight.hovered) s.hovered = void 0;
      unselect(s);
      s.dom.redraw();
    }
  }
  function unwantedEvent(e) {
    return !e.isTrusted || e.button !== void 0 && e.button !== 0 || !!e.touches && e.touches.length > 1;
  }
  function validDestToHover(s, key) {
    return !!s.selected && (canMove(s, s.selected, key) || canPremove(s, s.selected, key)) || !!s.selectedPiece && (canDrop(s, s.selectedPiece, key) || canPredrop(s, s.selectedPiece, key));
  }
  function updateHoveredSquares(s, key) {
    var _a;
    const sqaureEls = (_a = s.dom.elements.board) == null ? void 0 : _a.squares.children;
    if (!sqaureEls || s.promotion.current) return;
    const prevHover = s.hovered;
    if (s.highlight.hovered || key && validDestToHover(s, key)) s.hovered = key;
    else s.hovered = void 0;
    const asSente = sentePov(s.orientation);
    const curIndex = s.hovered && domSquareIndexOfKey(s.hovered, asSente, s.dimensions);
    const curHoverEl = curIndex !== void 0 && sqaureEls[curIndex];
    if (curHoverEl) curHoverEl.classList.add("hover");
    const prevIndex = prevHover && domSquareIndexOfKey(prevHover, asSente, s.dimensions);
    const prevHoverEl = prevIndex !== void 0 && sqaureEls[prevIndex];
    if (prevHoverEl) prevHoverEl.classList.remove("hover");
  }

  // src/promotion.ts
  function choosePromotion(s, piece) {
    const cur = s.promotion.current;
    if (piece && cur) {
      s.promotion.current = s.hovered = void 0;
      const prom = !samePiece(cur.piece, piece);
      const turn = s.turnColor;
      const play = (s2) => {
        if (s2.selected) userMove(s2, s2.selected, cur.key, prom);
        else if (s2.selectedPiece) userDrop(s2, s2.selectedPiece, cur.key, prom);
      };
      if (cur.dragged || turn !== s.activeColor && s.activeColor !== "both") play(s);
      else {
        callUserFunction(s.events.select, cur.key);
        anim(play, s);
      }
      if (s.turnColor !== turn) callUserFunction(s.promotion.events.after, piece);
      else callUserFunction(s.promotion.events.cancel);
    } else if (cur) unselect(s);
    s.dom.redraw();
  }

  // src/keyboard.ts
  var directions = {
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    ArrowUp: [0, -1],
    ArrowDown: [0, 1]
  };
  var defaultAriaLabel = "Shogi board. Use arrow keys to navigate, Enter to select, Escape to cancel.";
  var keyboardAttributes = /* @__PURE__ */ new WeakMap();
  function focusBoard(s) {
    var _a;
    if (s.keyboard.enabled && !s.viewOnly && !s.dom.destroyed)
      (_a = s.dom.elements.board) == null ? void 0 : _a.board.focus({ preventScroll: true });
  }
  function bindKeyboard(s, el) {
    const focus = () => focusBoard(s);
    const redraw = () => {
      if (s.keyboard.enabled) s.dom.redraw();
    };
    const keydown = (event) => {
      var _a, _b;
      if (!s.keyboard.enabled || s.viewOnly || s.dom.destroyed || document.activeElement !== el || event.target !== el || event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
        return;
      const direction = directions[event.key];
      if (!direction && event.key !== "Enter" && event.key !== "Escape") return;
      if ((s.draggable.current || s.drawable.current) && event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      if (event.repeat && !direction) return;
      if (event.key === "Escape") {
        const hasSelection = !!(s.selected || s.selectedPiece || s.promotion.current || s.draggable.current || s.drawable.current);
        cancel2(s);
        cancel(s);
        cancelMoveOrDrop(s);
        if (!hasSelection) el.blur();
      } else if (s.promotion.current) {
        const cur = s.promotion.current;
        if (direction) cur.keyboardChoice = !((_a = cur.keyboardChoice) != null ? _a : true);
        else choosePromotion(s, ((_b = cur.keyboardChoice) != null ? _b : true) ? cur.promotedPiece : cur.piece);
      } else {
        const cursor = currentCursor(s);
        if (direction) moveCursor(s, cursor, direction);
        else activate(s, cursor);
      }
      s.dom.redraw();
    };
    el.addEventListener("keydown", keydown);
    el.addEventListener("mousedown", focus, true);
    el.addEventListener("focus", redraw);
    el.addEventListener("blur", redraw);
    return () => {
      el.removeEventListener("keydown", keydown);
      el.removeEventListener("mousedown", focus, true);
      el.removeEventListener("focus", redraw);
      el.removeEventListener("blur", redraw);
      s.keyboard.focused = false;
    };
  }
  function syncKeyboardState(s, elements) {
    const enabled = s.keyboard.enabled && !s.viewOnly;
    if (enabled) currentCursor(s);
    s.keyboard.focused = enabled && document.activeElement === elements.board;
  }
  function renderKeyboard(s, elements) {
    var _a, _b;
    const enabled = s.keyboard.enabled && !s.viewOnly;
    const el = elements.board;
    const previous = keyboardAttributes.get(el);
    if (enabled) {
      const ariaLabel = (_a = s.keyboard.ariaLabel) != null ? _a : defaultAriaLabel;
      if (!previous) {
        const attributes = /* @__PURE__ */ new Map([
          ["tabindex", "0"],
          ["role", "group"],
          ["aria-label", ariaLabel]
        ]);
        const originalAttributes = /* @__PURE__ */ new Map();
        for (const [name, value] of attributes) {
          originalAttributes.set(name, el.getAttribute(name));
          el.setAttribute(name, value);
        }
        keyboardAttributes.set(el, { originalAttributes, ariaLabel });
      } else if (previous.ariaLabel !== ariaLabel) {
        el.setAttribute("aria-label", ariaLabel);
        previous.ariaLabel = ariaLabel;
      }
    } else if (previous) {
      for (const [name, value] of previous.originalAttributes) {
        if (value === null) el.removeAttribute(name);
        else el.setAttribute(name, value);
      }
      keyboardAttributes.delete(el);
    }
    if (!enabled && !previous) return;
    const choices = (_b = elements.promotion) == null ? void 0 : _b.querySelectorAll("piece");
    choices == null ? void 0 : choices.forEach((piece, index) => {
      var _a2;
      piece.classList.toggle(
        "keyboard-cursor",
        enabled && !!s.promotion.current && index === (((_a2 = s.promotion.current.keyboardChoice) != null ? _a2 : true) ? 0 : 1)
      );
      piece.classList.toggle("keyboard-focused", s.keyboard.focused);
    });
  }
  function currentCursor(s) {
    const cur = s.keyboard.current;
    if (isKey(cur)) {
      const [file, rank] = key2pos(cur);
      if (file >= 0 && file < s.dimensions.files && rank >= 0 && rank < s.dimensions.ranks)
        return cur;
    } else if (cur && s.hands.roles.includes(cur.role) && handTargets(s, cur.color).some(
      (target) => !isKey(target.cursor) && target.cursor.role === cur.role
    ))
      return cur;
    s.keyboard.current = pos2key([
      Math.floor(s.dimensions.files / 2),
      Math.floor(s.dimensions.ranks / 2)
    ]);
    return s.keyboard.current;
  }
  function screenPos(s, key) {
    const [file, rank] = key2pos(key);
    return sentePov(s.orientation) ? [s.dimensions.files - 1 - file, rank] : [file, s.dimensions.ranks - 1 - rank];
  }
  function screenKey(s, [x, y]) {
    return pos2key(
      sentePov(s.orientation) ? [s.dimensions.files - 1 - x, y] : [x, s.dimensions.ranks - 1 - y]
    );
  }
  function center(rect) {
    return [rect.left + rect.width / 2, rect.top + rect.height / 2];
  }
  function handTargets(s, color) {
    var _a;
    const hand = (_a = s.dom.elements.hands) == null ? void 0 : _a[color === s.orientation ? "bottom" : "top"];
    if (!hand || getComputedStyle(hand).visibility === "hidden") return [];
    const targets = [];
    for (const [name, bounds] of s.dom.bounds.hands.pieceBounds()) {
      const piece = parsePieceName(name);
      if (piece.color === color && bounds.width > 0 && bounds.height > 0)
        targets.push({ cursor: piece, center: center(bounds) });
    }
    return targets;
  }
  function nearest(targets, origin) {
    return targets.reduce(
      (best, target) => !best || distanceSq(target.center, origin) < distanceSq(best.center, origin) ? target : best,
      void 0
    );
  }
  function beyond(rect, bounds, [dx, dy]) {
    return dx < 0 ? rect.right <= bounds.left + 1 : dx > 0 ? rect.left >= bounds.right - 1 : dy < 0 ? rect.bottom <= bounds.top + 1 : rect.top >= bounds.bottom - 1;
  }
  function moveCursor(s, cursor, direction) {
    var _a, _b, _c, _d;
    const bounds = s.dom.bounds.board.bounds();
    if (!bounds || !bounds.width || !bounds.height) return;
    if (isKey(cursor)) {
      const [x, y] = screenPos(s, cursor);
      const next = [x + direction[0], y + direction[1]];
      if (next[0] >= 0 && next[0] < s.dimensions.files && next[1] >= 0 && next[1] < s.dimensions.ranks) {
        s.keyboard.current = screenKey(s, next);
        return;
      }
      const targets = [];
      for (const [slot, rect] of s.dom.bounds.hands.bounds()) {
        if (beyond(rect, bounds, direction))
          targets.push(
            ...handTargets(s, slot === "bottom" ? s.orientation : opposite(s.orientation))
          );
      }
      const origin = computeSquareCenter(cursor, sentePov(s.orientation), s.dimensions, bounds);
      s.keyboard.current = (_b = (_a = nearest(targets, origin)) == null ? void 0 : _a.cursor) != null ? _b : cursor;
    } else {
      const rect = s.dom.bounds.hands.pieceBounds().get(pieceNameOf(cursor));
      if (!rect || !rect.width || !rect.height) {
        s.keyboard.current = void 0;
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
      if (dx > 0 && origin[0] < bounds.left || dx < 0 && origin[0] > bounds.right || dy > 0 && origin[1] < bounds.top || dy < 0 && origin[1] > bounds.bottom) {
        const x = Math.max(
          0,
          Math.min(
            s.dimensions.files - 1,
            Math.floor((origin[0] - bounds.left) / bounds.width * s.dimensions.files)
          )
        );
        const y = Math.max(
          0,
          Math.min(
            s.dimensions.ranks - 1,
            Math.floor((origin[1] - bounds.top) / bounds.height * s.dimensions.ranks)
          )
        );
        const key = screenKey(s, [x, y]);
        targets.push({
          cursor: key,
          center: computeSquareCenter(key, sentePov(s.orientation), s.dimensions, bounds)
        });
      }
      s.keyboard.current = (_d = (_c = nearest(targets, origin)) == null ? void 0 : _c.cursor) != null ? _d : cursor;
    }
  }
  function activate(s, cursor) {
    unsetPremove(s);
    unsetPredrop(s);
    const wasSelected = isKey(cursor) ? s.selected === cursor : !!s.selectedPiece && samePiece(s.selectedPiece, cursor);
    if (!isKey(cursor)) {
      if (s.selectable.deleteOnTouch) {
        removeFromHand(s, cursor);
        unselect(s);
        callUserFunction(s.events.change);
      } else selectPiece(s, cursor);
    } else if (s.selectable.deleteOnTouch) deletePiece(s, cursor);
    else if (!s.selectable.enabled || !(s.selected && promotionDialogMove(s, s.selected, cursor)) && !(s.selectedPiece && promotionDialogDrop(s, s.selectedPiece, cursor)))
      anim((state) => selectSquare(state, cursor), s);
    if (wasSelected && s.draggable.enabled) {
      if (isKey(cursor) && s.selected === cursor) {
        callUserFunction(s.events.unselect, cursor);
        unselect(s);
      } else if (!isKey(cursor) && s.selectedPiece && samePiece(s.selectedPiece, cursor)) {
        callUserFunction(s.events.pieceUnselect, cursor);
        unselect(s);
      }
    }
  }

  // src/events.ts
  function clearBounds(s) {
    s.dom.bounds.board.bounds.clear();
    s.dom.bounds.hands.bounds.clear();
    s.dom.bounds.hands.pieceBounds.clear();
  }
  function refreshBounds(s) {
    clearBounds(s);
    if (usesBounds(s.drawable.shapes.concat(s.drawable.autoShapes))) s.dom.redrawShapes();
  }
  function onResize(s) {
    return () => refreshBounds(s);
  }
  function bindBoard(s, boardEls) {
    observeResize(s, boardEls.board);
    const unbinds = [];
    if (!s.viewOnly) {
      const piecesEl = boardEls.pieces;
      const promotionEl = boardEls.promotion;
      const onStart = startDragOrDraw(s);
      for (const ev of ["touchstart", "mousedown"])
        unbinds.push(unbindable(piecesEl, ev, onStart, { passive: false }));
      unbinds.push(
        unbindable(piecesEl, "contextmenu", (e) => {
          if (s.disableContextMenu || s.drawable.enabled) e.preventDefault();
        })
      );
      if (promotionEl) {
        const pieceSelection = (e) => promote(s, e);
        unbinds.push(unbindable(promotionEl, "click", pieceSelection));
        unbinds.push(
          unbindable(promotionEl, "contextmenu", (e) => {
            if (s.disableContextMenu) e.preventDefault();
          })
        );
      }
      unbinds.push(bindKeyboard(s, boardEls.board));
    }
    return () => {
      unbinds.forEach((f) => {
        f();
      });
    };
  }
  function bindHand(s, handEl) {
    observeResize(s, handEl);
    const unbinds = [];
    if (!s.viewOnly) {
      const onStart = startDragFromHand(s);
      for (const ev of ["mousedown", "touchstart"])
        unbinds.push(unbindable(handEl, ev, onStart, { passive: false }));
      unbinds.push(
        unbindable(handEl, "click", () => {
          if (s.promotion.current) {
            unselect(s);
            s.dom.redraw();
          }
        }),
        unbindable(handEl, "contextmenu", (e) => {
          if (s.disableContextMenu || s.drawable.enabled) e.preventDefault();
        })
      );
      unbinds.push(unbindable(handEl, "mousedown", () => focusBoard(s), { capture: true }));
    }
    return () => {
      unbinds.forEach((f) => {
        f();
      });
    };
  }
  function observeResize(s, el) {
    if ("ResizeObserver" in window) {
      if (!s.dom.resizeObserver) s.dom.resizeObserver = new ResizeObserver(onResize(s));
      s.dom.resizeObserver.observe(el);
    }
  }
  function bindDocument(s) {
    const unbinds = [];
    unbinds.push(() => {
      var _a;
      return (_a = s.dom.resizeObserver) == null ? void 0 : _a.disconnect();
    });
    unbinds.push(unbindable(document.body, "shogiground.resize", onResize(s)));
    if (!s.viewOnly) {
      const onmove = dragOrDraw(s, move2, move);
      const onend = dragOrDraw(s, end2, end);
      const oncancel = dragOrDraw(s, cancel2, cancel);
      for (const ev of ["touchmove", "mousemove"])
        unbinds.push(unbindable(document, ev, onmove));
      for (const ev of ["touchend", "mouseup"])
        unbinds.push(unbindable(document, ev, onend));
      unbinds.push(unbindable(document, "touchcancel", oncancel));
      unbinds.push(
        unbindable(document, "scroll", () => clearBounds(s), { capture: true, passive: true })
      );
      unbinds.push(unbindable(window, "resize", () => clearBounds(s), { passive: true }));
    }
    return () => unbinds.forEach((f) => {
      f();
    });
  }
  function unbindable(el, eventName, callback, options) {
    el.addEventListener(eventName, callback, options);
    return () => el.removeEventListener(eventName, callback, options);
  }
  function startDragOrDraw(s) {
    return (e) => {
      clearBounds(s);
      if (s.draggable.current) cancel2(s);
      else if (s.drawable.current) cancel(s);
      else if (e.shiftKey || isRightButton(e) || s.drawable.forced) {
        if (s.drawable.enabled) start(s, e);
      } else if (!s.viewOnly && !unwantedEvent(e)) start2(s, e);
    };
  }
  function dragOrDraw(s, withDrag, withDraw) {
    return (e) => {
      if (s.drawable.current) {
        if (s.drawable.enabled) withDraw(s, e);
      } else if (!s.viewOnly) withDrag(s, e);
    };
  }
  function startDragFromHand(s) {
    return (e) => {
      if (s.promotion.current) return;
      clearBounds(s);
      const pos = eventPosition(e);
      const piece = pos && getHandPieceAtDomPos(pos, s.hands.roles, s.dom.bounds.hands.pieceBounds());
      if (piece) {
        if (s.draggable.current) cancel2(s);
        else if (s.drawable.current) cancel(s);
        else if (isMiddleButton(e)) {
          if (s.drawable.enabled) {
            if (e.cancelable !== false) e.preventDefault();
            setDrawPiece(s, piece);
          }
        } else if (e.shiftKey || isRightButton(e) || s.drawable.forced) {
          if (s.drawable.enabled) startFromHand(s, piece, e);
        } else if (!s.viewOnly && !unwantedEvent(e)) {
          dragNewPiece(s, piece, e);
        }
      }
    };
  }
  function promote(s, e) {
    e.stopPropagation();
    const target = e.target;
    choosePromotion(
      s,
      target && isPieceNode(target) ? { color: target.sgColor, role: target.sgRole } : void 0
    );
  }

  // src/render.ts
  function render2(s, boardEls) {
    var _a, _b, _c;
    const asSente = sentePov(s.orientation);
    const scaleDown = s.scaleDownPieces ? 0.5 : 1;
    const posToTranslate = posToTranslateRel(s.dimensions);
    const squaresEl = boardEls.squares;
    const piecesEl = boardEls.pieces;
    const draggedEl = boardEls.dragged;
    const squareOverEl = boardEls.squareOver;
    const promotionEl = boardEls.promotion;
    const pieces = s.pieces;
    const curAnim = s.animation.current;
    const anims = curAnim ? curAnim.plan.anims : /* @__PURE__ */ new Map();
    const fadings = curAnim ? curAnim.plan.fadings : /* @__PURE__ */ new Map();
    const promotions = curAnim ? curAnim.plan.promotions : /* @__PURE__ */ new Map();
    const curDrag = s.draggable.current;
    const curPromKey = ((_a = s.promotion.current) == null ? void 0 : _a.dragged) ? s.selected : void 0;
    syncKeyboardState(s, boardEls);
    const squares = computeSquareClasses(s);
    const samePieces = /* @__PURE__ */ new Set();
    const movedPieces = /* @__PURE__ */ new Map();
    if (!curDrag && (draggedEl == null ? void 0 : draggedEl.sgDragging)) {
      draggedEl.sgDragging = false;
      setDisplay(draggedEl, false);
      if (squareOverEl) setDisplay(squareOverEl, false);
    }
    let k;
    let el;
    let pieceAtKey;
    let elPieceName;
    let anim2;
    let fading;
    let prom;
    let pMvdset;
    let pMvd;
    el = piecesEl.firstElementChild;
    while (el) {
      if (isPieceNode(el)) {
        k = el.sgKey;
        pieceAtKey = pieces.get(k);
        anim2 = anims.get(k);
        fading = fadings.get(k);
        prom = promotions.get(k);
        elPieceName = pieceNameOf({ color: el.sgColor, role: el.sgRole });
        if (((curDrag == null ? void 0 : curDrag.started) && ((_b = curDrag.fromBoard) == null ? void 0 : _b.orig) === k || curPromKey && curPromKey === k) && !el.sgGhost) {
          el.sgGhost = true;
          el.classList.add("ghost");
        } else if (el.sgGhost && (!curDrag || ((_c = curDrag.fromBoard) == null ? void 0 : _c.orig) !== k) && (!curPromKey || curPromKey !== k)) {
          el.sgGhost = false;
          el.classList.remove("ghost");
          setDisplay(el, true);
        }
        if (el.sgGhost) setDisplay(el, s.draggable.showGhost || curPromKey === k);
        if (!fading && el.sgFading) {
          el.sgFading = false;
          el.classList.remove("fading");
        }
        if (pieceAtKey) {
          if (anim2 && el.sgAnimating && (elPieceName === pieceNameOf(pieceAtKey) || prom && elPieceName === pieceNameOf(prom))) {
            const pos = key2pos(k);
            pos[0] += anim2[2];
            pos[1] += anim2[3];
            translateRel(el, posToTranslate(pos, asSente), scaleDown);
            el.sgScaledDown = s.scaleDownPieces;
          } else if (el.sgAnimating || el.sgScaledDown !== s.scaleDownPieces) {
            if (el.sgAnimating) {
              el.sgAnimating = false;
              el.classList.remove("anim");
            }
            translateRel(el, posToTranslate(key2pos(k), asSente), scaleDown);
            el.sgScaledDown = s.scaleDownPieces;
          }
          if (elPieceName === pieceNameOf(pieceAtKey) && (!fading || !el.sgFading)) {
            samePieces.add(k);
          } else {
            if (fading && elPieceName === pieceNameOf(fading)) {
              el.sgFading = true;
              el.classList.add("fading");
            } else if (prom && elPieceName === pieceNameOf(prom)) {
              samePieces.add(k);
            } else {
              appendValue(movedPieces, elPieceName, el);
            }
          }
        } else {
          appendValue(movedPieces, elPieceName, el);
        }
      }
      el = el.nextElementSibling;
    }
    let sqEl = squaresEl.firstElementChild;
    while (sqEl && isSquareNode(sqEl)) {
      sqEl.className = squares.get(sqEl.sgKey) || "";
      sqEl = sqEl.nextElementSibling;
    }
    for (const [k2, p] of pieces) {
      const piece = promotions.get(k2) || p;
      anim2 = anims.get(k2);
      if (!samePieces.has(k2)) {
        pMvdset = movedPieces.get(pieceNameOf(piece));
        pMvd = pMvdset == null ? void 0 : pMvdset.pop();
        if (pMvd) {
          pMvd.sgKey = k2;
          if (pMvd.sgFading) {
            pMvd.sgFading = false;
            pMvd.classList.remove("fading");
          }
          const pos = key2pos(k2);
          if (anim2) {
            pMvd.sgAnimating = true;
            pMvd.classList.add("anim");
            pos[0] += anim2[2];
            pos[1] += anim2[3];
          }
          translateRel(pMvd, posToTranslate(pos, asSente), scaleDown);
          pMvd.sgScaledDown = s.scaleDownPieces;
        } else {
          const pieceNode = createEl("piece", pieceNameOf(p));
          const pos = key2pos(k2);
          pieceNode.sgColor = p.color;
          pieceNode.sgRole = p.role;
          pieceNode.sgKey = k2;
          if (anim2) {
            pieceNode.sgAnimating = true;
            pos[0] += anim2[2];
            pos[1] += anim2[3];
          }
          translateRel(pieceNode, posToTranslate(pos, asSente), scaleDown);
          pieceNode.sgScaledDown = s.scaleDownPieces;
          piecesEl.appendChild(pieceNode);
        }
      }
    }
    for (const nodes of movedPieces.values()) {
      for (const node of nodes) {
        piecesEl.removeChild(node);
      }
    }
    if (promotionEl) renderPromotion(s, promotionEl);
    renderKeyboard(s, boardEls);
  }
  function appendValue(map, key, value) {
    const arr = map.get(key);
    if (arr) arr.push(value);
    else map.set(key, [value]);
  }
  function computeSquareClasses(s) {
    var _a, _b;
    const squares = /* @__PURE__ */ new Map();
    if (s.keyboard.enabled && !s.viewOnly && !s.promotion.current && isKey(s.keyboard.current))
      addSquare(
        squares,
        s.keyboard.current,
        `keyboard-cursor${s.keyboard.focused ? " keyboard-focused" : ""}`
      );
    if (s.lastDests && s.highlight.lastDests)
      for (const k of s.lastDests) addSquare(squares, k, "last-dest");
    if (s.checks && s.highlight.check)
      for (const check of s.checks) addSquare(squares, check, "check");
    if (s.hovered) addSquare(squares, s.hovered, "hover");
    if (s.selected) {
      if (s.activeColor === "both" || s.activeColor === s.turnColor)
        addSquare(squares, s.selected, "selected");
      else addSquare(squares, s.selected, "preselected");
      if (s.movable.showDests) {
        const dests = (_a = s.movable.dests) == null ? void 0 : _a.get(s.selected);
        if (dests)
          for (const k of dests) {
            addSquare(squares, k, `dest${s.pieces.has(k) ? " oc" : ""}`);
          }
      }
      if (s.premovable.showDests) {
        for (const k of premoveDests(s, s.selected)) {
          addSquare(squares, k, `pre-dest${s.pieces.has(k) ? " oc" : ""}`);
        }
      }
    } else if (s.selectedPiece) {
      if (s.droppable.showDests) {
        const dests = (_b = s.droppable.dests) == null ? void 0 : _b.get(pieceNameOf(s.selectedPiece));
        if (dests)
          for (const k of dests) {
            addSquare(squares, k, "dest");
          }
      }
      if (s.predroppable.showDests) {
        for (const k of predropDests(s, s.selectedPiece)) {
          addSquare(squares, k, `pre-dest${s.pieces.has(k) ? " oc" : ""}`);
        }
      }
    }
    const premove = s.premovable.current;
    if (premove) {
      addSquare(squares, premove.orig, "current-pre");
      addSquare(squares, premove.dest, `current-pre${premove.prom ? " prom" : ""}`);
    } else if (s.predroppable.current)
      addSquare(
        squares,
        s.predroppable.current.key,
        `current-pre${s.predroppable.current.prom ? " prom" : ""}`
      );
    for (const sqh of s.drawable.squares) {
      addSquare(squares, sqh.key, sqh.className);
    }
    return squares;
  }
  function addSquare(squares, key, klass) {
    const classes = squares.get(key);
    if (classes) squares.set(key, `${classes} ${klass}`);
    else squares.set(key, klass);
  }
  function renderPromotion(s, promotionEl) {
    const cur = s.promotion.current;
    const key = cur == null ? void 0 : cur.key;
    const pieces = cur ? [cur.promotedPiece, cur.piece] : [];
    const hash = promotionHash(!!cur, key, pieces);
    if (s.promotion.prevPromotionHash === hash) return;
    s.promotion.prevPromotionHash = hash;
    if (key) {
      const asSente = sentePov(s.orientation);
      const initPos = key2pos(key);
      const color = cur.piece.color;
      const promotionSquare = createEl("sg-promotion-square");
      const promotionChoices = createEl("sg-promotion-choices");
      if (s.orientation !== color) promotionChoices.classList.add("reversed");
      translateRel(promotionSquare, posToTranslateRel(s.dimensions)(initPos, asSente), 1);
      for (const p of pieces) {
        const pieceNode = createEl("piece", pieceNameOf(p));
        pieceNode.sgColor = p.color;
        pieceNode.sgRole = p.role;
        promotionChoices.appendChild(pieceNode);
      }
      promotionEl.innerHTML = "";
      promotionSquare.appendChild(promotionChoices);
      promotionEl.appendChild(promotionSquare);
      setDisplay(promotionEl, true);
    } else {
      setDisplay(promotionEl, false);
    }
  }
  function promotionHash(active, key, pieces) {
    return [active, key, pieces.map((p) => pieceNameOf(p)).join(" ")].join(" ");
  }

  // src/coords.ts
  function coords(notation) {
    switch (notation) {
      case "dizhi":
        return [
          "",
          "",
          "",
          "",
          "亥",
          "戌",
          "酉",
          "申",
          "未",
          "午",
          "巳",
          "辰",
          "卯",
          "寅",
          "丑",
          "子"
        ];
      case "japanese":
        return [
          "十六",
          "十五",
          "十四",
          "十三",
          "十二",
          "十一",
          "十",
          "九",
          "八",
          "七",
          "六",
          "五",
          "四",
          "三",
          "二",
          "一"
        ];
      case "engine":
        return ["p", "o", "n", "m", "l", "k", "j", "i", "h", "g", "f", "e", "d", "c", "b", "a"];
      case "hex":
        return ["10", "f", "e", "d", "c", "b", "a", "9", "8", "7", "6", "5", "4", "3", "2", "1"];
      default:
        return [
          "16",
          "15",
          "14",
          "13",
          "12",
          "11",
          "10",
          "9",
          "8",
          "7",
          "6",
          "5",
          "4",
          "3",
          "2",
          "1"
        ];
    }
  }

  // src/wrap.ts
  function wrapBoard(boardWrap, s) {
    const board = createEl("sg-board");
    const squares = renderSquares(s.dimensions, s.orientation);
    board.appendChild(squares);
    const pieces = createEl("sg-pieces");
    board.appendChild(pieces);
    let dragged;
    let promotion;
    let squareOver;
    if (!s.viewOnly) {
      dragged = createEl("piece");
      setDisplay(dragged, false);
      board.appendChild(dragged);
      promotion = createEl("sg-promotion");
      setDisplay(promotion, false);
      board.appendChild(promotion);
      squareOver = createEl("sg-square-over");
      setDisplay(squareOver, false);
      board.appendChild(squareOver);
    }
    let shapes;
    if (s.drawable.visible) {
      const svg = setAttributes(createSVGElement("svg"), {
        class: "sg-shapes",
        viewBox: `-${s.squareRatio[0] / 2} -${s.squareRatio[1] / 2} ${s.dimensions.files * s.squareRatio[0]} ${s.dimensions.ranks * s.squareRatio[1]}`
      });
      svg.appendChild(createSVGElement("defs"));
      svg.appendChild(createSVGElement("g"));
      const customSvg = setAttributes(createSVGElement("svg"), {
        class: "sg-custom-svgs",
        viewBox: `0 0 ${s.dimensions.files * s.squareRatio[0]} ${s.dimensions.ranks * s.squareRatio[1]}`
      });
      customSvg.appendChild(createSVGElement("g"));
      const freePieces = createEl("sg-free-pieces");
      board.appendChild(svg);
      board.appendChild(customSvg);
      board.appendChild(freePieces);
      shapes = {
        svg,
        freePieces,
        customSvg
      };
    }
    if (s.coordinates.enabled) {
      const orientClass = s.orientation === "gote" ? " gote" : "";
      const ranks2 = coords(s.coordinates.ranks);
      const files2 = coords(s.coordinates.files);
      board.appendChild(renderCoords(ranks2, `ranks${orientClass}`, s.dimensions.ranks));
      board.appendChild(renderCoords(files2, `files${orientClass}`, s.dimensions.files));
    }
    boardWrap.innerHTML = "";
    const dimCls = `d-${s.dimensions.files}x${s.dimensions.ranks}`;
    for (const c of Array.from(boardWrap.classList)) {
      if (/^d-\d+x\d+$/.test(c) && c !== dimCls) boardWrap.classList.remove(c);
    }
    boardWrap.classList.add("sg-wrap", dimCls);
    for (const c of colors) boardWrap.classList.toggle(`orientation-${c}`, s.orientation === c);
    boardWrap.classList.toggle("manipulable", !s.viewOnly);
    boardWrap.appendChild(board);
    let hands;
    if (s.hands.inlined) {
      const handWrapTop = createEl("sg-hand-wrap", "inlined");
      const handWrapBottom = createEl("sg-hand-wrap", "inlined");
      boardWrap.insertBefore(handWrapBottom, board.nextElementSibling);
      boardWrap.insertBefore(handWrapTop, board);
      hands = {
        top: handWrapTop,
        bottom: handWrapBottom
      };
    }
    return {
      board,
      squares,
      pieces,
      promotion,
      squareOver,
      dragged,
      shapes,
      hands
    };
  }
  function wrapHand(handWrap, pos, s) {
    const hand = renderHand2(pos === "top" ? opposite(s.orientation) : s.orientation, s.hands.roles);
    handWrap.innerHTML = "";
    const roleCntCls = `r-${s.hands.roles.length}`;
    for (const c of Array.from(handWrap.classList)) {
      if (/^r-\d+$/.test(c) && c !== roleCntCls) handWrap.classList.remove(c);
    }
    handWrap.classList.add("sg-hand-wrap", `hand-${pos}`, roleCntCls);
    handWrap.appendChild(hand);
    for (const c of colors) handWrap.classList.toggle(`orientation-${c}`, s.orientation === c);
    handWrap.classList.toggle("manipulable", !s.viewOnly);
    return hand;
  }
  function renderCoords(elems, className, trim) {
    const el = createEl("coords", className);
    let f;
    for (const elem of elems.slice(-trim)) {
      f = createEl("coord");
      f.textContent = elem;
      el.appendChild(f);
    }
    return el;
  }
  function renderSquares(dims, orientation) {
    const squares = createEl("sg-squares");
    for (let i = 0; i < dims.ranks * dims.files; i++) {
      const sq = createEl("sq");
      sq.sgKey = orientation === "sente" ? pos2key([dims.files - 1 - i % dims.files, Math.floor(i / dims.files)]) : pos2key([i % dims.files, dims.ranks - 1 - Math.floor(i / dims.files)]);
      squares.appendChild(sq);
    }
    return squares;
  }
  function renderHand2(color, roles) {
    const hand = createEl("sg-hand");
    for (const role of roles) {
      const piece = { role, color };
      const wrapEl = createEl("sg-hp-wrap");
      const pieceEl = createEl("piece", pieceNameOf(piece));
      pieceEl.sgColor = color;
      pieceEl.sgRole = role;
      wrapEl.appendChild(pieceEl);
      hand.appendChild(wrapEl);
    }
    return hand;
  }

  // src/dom.ts
  function attachBoard(state, boardWrap) {
    var _a;
    const restoreFocus = state.keyboard.enabled && !state.viewOnly && ((_a = state.dom.elements.board) == null ? void 0 : _a.board) === document.activeElement;
    detachElements({ board: true }, state, true);
    const elements = wrapBoard(boardWrap, state);
    if (elements.hands) attachHands(state, elements.hands.top, elements.hands.bottom);
    state.dom.wrapElements.board = boardWrap;
    state.dom.elements.board = elements;
    state.dom.bounds.board.bounds.clear();
    state.dom.elementUnbinds.set(elements.board, bindBoard(state, elements));
    state.drawable.prevSvgHash = "";
    state.promotion.prevPromotionHash = "";
    render2(state, elements);
    if (restoreFocus) elements.board.focus({ preventScroll: true });
  }
  function attachHands(state, handTopWrap, handBottomWrap) {
    var _a, _b, _c, _d;
    if (handTopWrap) (_b = (_a = state.dom.elements.hands) == null ? void 0 : _a.top) == null ? void 0 : _b.remove();
    if (handBottomWrap) (_d = (_c = state.dom.elements.hands) == null ? void 0 : _c.bottom) == null ? void 0 : _d.remove();
    detachElements({ hands: { top: !!handTopWrap, bottom: !!handBottomWrap } }, state, true);
    if (!state.dom.elements.hands) state.dom.elements.hands = {};
    if (handTopWrap) {
      const handTop = wrapHand(handTopWrap, "top", state);
      state.dom.elements.hands.top = handTop;
      state.dom.elementUnbinds.set(handTop, bindHand(state, handTop));
      renderHand(state, handTop);
    }
    if (handBottomWrap) {
      const handBottom = wrapHand(handBottomWrap, "bottom", state);
      state.dom.elements.hands.bottom = handBottom;
      state.dom.elementUnbinds.set(handBottom, bindHand(state, handBottom));
      renderHand(state, handBottom);
    }
    if (handTopWrap || handBottomWrap) {
      state.dom.bounds.hands.bounds.clear();
      state.dom.bounds.hands.pieceBounds.clear();
    }
  }
  function redrawAll(wrapElements, state) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (state.dom.destroyed) return;
    if (wrapElements.hands) {
      if (!state.dom.wrapElements.hands) state.dom.wrapElements.hands = {};
      if (wrapElements.hands.top) state.dom.wrapElements.hands.top = wrapElements.hands.top;
      if (wrapElements.hands.bottom) state.dom.wrapElements.hands.bottom = wrapElements.hands.bottom;
    }
    if (wrapElements.board) attachBoard(state, wrapElements.board);
    if (wrapElements.hands && !state.hands.inlined)
      attachHands(state, wrapElements.hands.top, wrapElements.hands.bottom);
    else if (state.hands.inlined && !state.dom.elements.board) {
      (_b = (_a = state.dom.elements.hands) == null ? void 0 : _a.top) == null ? void 0 : _b.remove();
      (_d = (_c = state.dom.elements.hands) == null ? void 0 : _c.bottom) == null ? void 0 : _d.remove();
      detachElements({ hands: { top: true, bottom: true } }, state, true);
    }
    state.dom.redrawShapes();
    const hands = state.hands.inlined && wrapElements.board ? (_e = state.dom.elements.board) == null ? void 0 : _e.hands : wrapElements.hands;
    if (state.events.insert)
      state.events.insert(wrapElements.board && state.dom.elements.board, {
        top: (hands == null ? void 0 : hands.top) && ((_f = state.dom.elements.hands) == null ? void 0 : _f.top),
        bottom: (hands == null ? void 0 : hands.bottom) && ((_g = state.dom.elements.hands) == null ? void 0 : _g.bottom)
      });
  }
  function detachElements(web, state, keepWrapElements = false) {
    var _a, _b, _c, _d, _e, _f, _g;
    const inlineHands = web.board ? (_a = state.dom.elements.board) == null ? void 0 : _a.hands : void 0;
    const detachTop = ((_b = web.hands) == null ? void 0 : _b.top) || !!(inlineHands == null ? void 0 : inlineHands.top) && inlineHands.top.firstElementChild === ((_c = state.dom.elements.hands) == null ? void 0 : _c.top);
    const detachBottom = ((_d = web.hands) == null ? void 0 : _d.bottom) || !!(inlineHands == null ? void 0 : inlineHands.bottom) && inlineHands.bottom.firstElementChild === ((_e = state.dom.elements.hands) == null ? void 0 : _e.bottom);
    if (!keepWrapElements) {
      if (web.board) state.dom.wrapElements.board = void 0;
      if (((_f = web.hands) == null ? void 0 : _f.top) && state.dom.wrapElements.hands)
        state.dom.wrapElements.hands.top = void 0;
      if (((_g = web.hands) == null ? void 0 : _g.bottom) && state.dom.wrapElements.hands)
        state.dom.wrapElements.hands.bottom = void 0;
    }
    if (web.board) {
      if (state.dom.elements.board) unbindElement(state, state.dom.elements.board.board);
      state.dom.elements.board = void 0;
      state.dom.bounds.board.bounds.clear();
    }
    if (state.dom.elements.hands) {
      if (detachTop) {
        if (state.dom.elements.hands.top) unbindElement(state, state.dom.elements.hands.top);
        state.dom.elements.hands.top = void 0;
      }
      if (detachBottom) {
        if (state.dom.elements.hands.bottom) unbindElement(state, state.dom.elements.hands.bottom);
        state.dom.elements.hands.bottom = void 0;
      }
      if (detachTop || detachBottom) {
        state.dom.bounds.hands.bounds.clear();
        state.dom.bounds.hands.pieceBounds.clear();
      }
    }
  }
  function unbindElement(state, el) {
    var _a, _b;
    (_a = state.dom.elementUnbinds.get(el)) == null ? void 0 : _a();
    state.dom.elementUnbinds.delete(el);
    (_b = state.dom.resizeObserver) == null ? void 0 : _b.unobserve(el);
  }

  // src/api.ts
  function start3(state) {
    return {
      attach(wrapElements) {
        redrawAll(wrapElements, state);
      },
      detach(wrapElementsBoolean) {
        detachElements(wrapElementsBoolean, state);
      },
      set(update, skipAnimation) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
        if (state.dom.destroyed) return;
        const config = __spreadProps(__spreadValues({}, update), { viewOnly: (_a = update.viewOnly) != null ? _a : state.viewOnly });
        const changed = (value, current) => value !== void 0 && value !== current;
        const viewOnlyChanged = changed(config.viewOnly, state.viewOnly);
        const newDims = ((_b = config.sfen) == null ? void 0 : _b.board) && inferDimensions(config.sfen.board);
        const toRedraw = viewOnlyChanged || changed(config.orientation, state.orientation) || changed((_c = config.coordinates) == null ? void 0 : _c.enabled, state.coordinates.enabled) || changed((_d = config.coordinates) == null ? void 0 : _d.files, state.coordinates.files) || changed((_e = config.coordinates) == null ? void 0 : _e.ranks, state.coordinates.ranks) || changed((_f = config.drawable) == null ? void 0 : _f.visible, state.drawable.visible) || changed((_g = config.hands) == null ? void 0 : _g.inlined, state.hands.inlined) || !!((_h = config.squareRatio) == null ? void 0 : _h.some((value, i) => value !== state.squareRatio[i])) || !!(newDims && (newDims.files !== state.dimensions.files || newDims.ranks !== state.dimensions.ranks)) || !!(((_i = config.hands) == null ? void 0 : _i.roles) && (config.hands.roles.length !== state.hands.roles.length || config.hands.roles.some((r, i) => r !== state.hands.roles[i])));
        if (toRedraw || ((_j = config.drawable) == null ? void 0 : _j.enabled) === false) state.drawable.current = void 0;
        if (toRedraw) {
          reset(state);
          configure(state, config);
          if (viewOnlyChanged) {
            state.dom.unbind();
            state.dom.unbind = bindDocument(state);
          }
          redrawAll(state.dom.wrapElements, state);
        } else {
          applyAnimation(state, config);
          if (skipAnimation) state.animation.current = void 0;
          (((_k = config.sfen) == null ? void 0 : _k.board) && !skipAnimation ? anim : render)(
            (state2) => configure(state2, config),
            state
          );
        }
      },
      state,
      getBoardSfen: () => boardToSfen(state.pieces, state.dimensions, state.forsyth.toForsyth),
      getHandsSfen: () => handsToSfen(state.hands.handMap, state.hands.roles, state.forsyth.toForsyth),
      toggleOrientation() {
        toggleOrientation(state);
        redrawAll(state.dom.wrapElements, state);
      },
      move(orig, dest, prom) {
        anim(
          (state2) => baseMove(state2, orig, dest, prom || state2.promotion.forceMovePromotion(orig, dest)),
          state
        );
      },
      drop(piece, key, prom, spare) {
        anim(
          (state2) => baseDrop(
            state2,
            piece,
            key,
            prom || state2.promotion.forceDropPromotion(piece, key),
            !!spare
          ),
          state
        );
      },
      setPieces(pieces) {
        anim((state2) => setPieces(state2, pieces), state);
      },
      addToHand(piece, count) {
        render((state2) => addToHand(state2, piece, count), state);
      },
      removeFromHand(piece, count) {
        render((state2) => {
          removeFromHand(state2, piece, count);
          unselectMissingPiece(state2);
        }, state);
      },
      selectSquare(key, prom, force) {
        if (key) anim((state2) => selectSquare(state2, key, prom, force), state);
        else if (state.selected) {
          unselect(state);
          state.dom.redraw();
        }
      },
      selectPiece(piece, spare, force) {
        if (piece) render((state2) => selectPiece(state2, piece, spare, force, true), state);
        else if (state.selectedPiece) {
          unselect(state);
          state.dom.redraw();
        }
      },
      playPremove() {
        if (state.premovable.current) {
          if (anim(playPremove, state)) return true;
          state.dom.redraw();
        }
        return false;
      },
      playPredrop() {
        if (state.predroppable.current) {
          if (anim(playPredrop, state)) return true;
          state.dom.redraw();
        }
        return false;
      },
      cancelPremove() {
        render(unsetPremove, state);
      },
      cancelPredrop() {
        render(unsetPredrop, state);
      },
      cancelMoveOrDrop() {
        render((state2) => {
          cancelMoveOrDrop(state2);
          cancel2(state2);
        }, state);
      },
      stop() {
        render((state2) => {
          stop(state2);
        }, state);
      },
      setAutoShapes(shapes) {
        render((state2) => {
          state2.drawable.autoShapes = shapes.slice();
        }, state);
      },
      setShapes(shapes) {
        render((state2) => {
          state2.drawable.shapes = shapes.slice();
        }, state);
      },
      setSquareHighlights(squares) {
        render((state2) => {
          state2.drawable.squares = squares;
        }, state);
      },
      dragNewPiece(piece, event, spare) {
        clearBounds(state);
        dragNewPiece(state, piece, event, spare);
      },
      refreshBounds() {
        refreshBounds(state);
      },
      destroy() {
        stop(state);
        state.drawable.current = void 0;
        state.dom.elementUnbinds.forEach((unbind) => {
          unbind();
        });
        state.dom.elementUnbinds.clear();
        state.dom.unbind();
        state.dom.destroyed = true;
      }
    };
  }

  // src/redraw.ts
  function redrawShapesNow(state) {
    var _a;
    if ((_a = state.dom.elements.board) == null ? void 0 : _a.shapes)
      renderShapes(
        state,
        state.dom.elements.board.shapes.svg,
        state.dom.elements.board.shapes.customSvg,
        state.dom.elements.board.shapes.freePieces
      );
  }
  function redrawNow(state, skipShapes) {
    const boardEls = state.dom.elements.board;
    if (boardEls) {
      render2(state, boardEls);
      if (!skipShapes) redrawShapesNow(state);
    }
    const handEls = state.dom.elements.hands;
    if (handEls) {
      if (handEls.top) renderHand(state, handEls.top);
      if (handEls.bottom) renderHand(state, handEls.bottom);
    }
  }

  // src/state.ts
  function defaults() {
    return {
      pieces: /* @__PURE__ */ new Map(),
      dimensions: { files: 9, ranks: 9 },
      orientation: "sente",
      turnColor: "sente",
      activeColor: "both",
      viewOnly: false,
      squareRatio: [11, 12],
      disableContextMenu: true,
      blockTouchScroll: false,
      scaleDownPieces: true,
      coordinates: { enabled: true, files: "numeric", ranks: "numeric" },
      highlight: { lastDests: true, check: true, checkRoles: ["king"], hovered: false },
      animation: { enabled: true, hands: true, duration: 250 },
      hands: {
        inlined: false,
        handMap: /* @__PURE__ */ new Map([
          ["sente", /* @__PURE__ */ new Map()],
          ["gote", /* @__PURE__ */ new Map()]
        ]),
        roles: ["rook", "bishop", "gold", "silver", "knight", "lance", "pawn"]
      },
      movable: { free: true, showDests: true, events: {} },
      droppable: { free: true, showDests: true, spare: false, events: {} },
      premovable: { enabled: true, showDests: true, events: {} },
      predroppable: { enabled: true, showDests: true, events: {} },
      draggable: {
        enabled: true,
        distance: 3,
        autoDistance: true,
        showGhost: true,
        showTouchSquareOverlay: true,
        deleteOnDropOff: false,
        addToHandOnDropOff: false
      },
      selectable: { enabled: true, forceSpares: false, deleteOnTouch: false, addSparesToHand: false },
      keyboard: { enabled: false, focused: false },
      promotion: {
        movePromotionDialog: () => false,
        forceMovePromotion: () => false,
        dropPromotionDialog: () => false,
        forceDropPromotion: () => false,
        promotesTo: () => void 0,
        unpromotesTo: () => void 0,
        events: {},
        prevPromotionHash: ""
      },
      forsyth: {},
      events: {},
      drawable: {
        enabled: true,
        // can draw
        visible: true,
        // can view
        forced: false,
        // can only draw
        eraseOnClick: true,
        shapes: [],
        autoShapes: [],
        squares: [],
        prevSvgHash: ""
      }
    };
  }

  // src/shogiground.ts
  function Shogiground(config, wrapElements) {
    const state = defaults();
    configure(state, config || {});
    const redrawStateNow = (skipShapes) => {
      redrawNow(state, skipShapes);
    };
    state.dom = {
      wrapElements: {},
      elements: {},
      bounds: {
        board: {
          bounds: memo(() => {
            var _a;
            return (_a = state.dom.elements.board) == null ? void 0 : _a.pieces.getBoundingClientRect();
          })
        },
        hands: {
          bounds: memo(() => {
            const handsRects = /* @__PURE__ */ new Map();
            const handEls = state.dom.elements.hands;
            if (handEls == null ? void 0 : handEls.top) handsRects.set("top", handEls.top.getBoundingClientRect());
            if (handEls == null ? void 0 : handEls.bottom) handsRects.set("bottom", handEls.bottom.getBoundingClientRect());
            return handsRects;
          }),
          pieceBounds: memo(() => {
            const handPiecesRects = /* @__PURE__ */ new Map();
            const handEls = state.dom.elements.hands;
            if (handEls == null ? void 0 : handEls.top) {
              let wrapEl = handEls.top.firstElementChild;
              while (wrapEl) {
                const pieceEl = wrapEl.firstElementChild;
                const piece = { role: pieceEl.sgRole, color: pieceEl.sgColor };
                handPiecesRects.set(pieceNameOf(piece), pieceEl.getBoundingClientRect());
                wrapEl = wrapEl.nextElementSibling;
              }
            }
            if (handEls == null ? void 0 : handEls.bottom) {
              let wrapEl = handEls.bottom.firstElementChild;
              while (wrapEl) {
                const pieceEl = wrapEl.firstElementChild;
                const piece = { role: pieceEl.sgRole, color: pieceEl.sgColor };
                handPiecesRects.set(pieceNameOf(piece), pieceEl.getBoundingClientRect());
                wrapEl = wrapEl.nextElementSibling;
              }
            }
            return handPiecesRects;
          })
        }
      },
      redrawNow: redrawStateNow,
      redraw: debounceRedraw(redrawStateNow),
      redrawShapes: debounceRedraw(() => redrawShapesNow(state)),
      unbind: bindDocument(state),
      elementUnbinds: /* @__PURE__ */ new Map(),
      destroyed: false
    };
    if (wrapElements) redrawAll(wrapElements, state);
    return start3(state);
  }
  function debounceRedraw(f) {
    let redrawing = false;
    return (...args) => {
      if (redrawing) return;
      redrawing = true;
      requestAnimationFrame(() => {
        try {
          f(...args);
        } finally {
          redrawing = false;
        }
      });
    };
  }

  // src/index.ts
  var index_default = Shogiground;
  return __toCommonJS(index_exports);
})();
Shogiground = Shogiground.default;
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2luZGV4LnRzIiwgIi4uL3NyYy9jb25zdGFudHMudHMiLCAiLi4vc3JjL3V0aWwudHMiLCAiLi4vc3JjL2FuaW0udHMiLCAiLi4vc3JjL2hhbmRzLnRzIiwgIi4uL3NyYy9ib2FyZC50cyIsICIuLi9zcmMvc2Zlbi50cyIsICIuLi9zcmMvY29uZmlnLnRzIiwgIi4uL3NyYy9zaGFwZXMudHMiLCAiLi4vc3JjL2RyYXcudHMiLCAiLi4vc3JjL2RyYWcudHMiLCAiLi4vc3JjL3Byb21vdGlvbi50cyIsICIuLi9zcmMva2V5Ym9hcmQudHMiLCAiLi4vc3JjL2V2ZW50cy50cyIsICIuLi9zcmMvcmVuZGVyLnRzIiwgIi4uL3NyYy9jb29yZHMudHMiLCAiLi4vc3JjL3dyYXAudHMiLCAiLi4vc3JjL2RvbS50cyIsICIuLi9zcmMvYXBpLnRzIiwgIi4uL3NyYy9yZWRyYXcudHMiLCAiLi4vc3JjL3N0YXRlLnRzIiwgIi4uL3NyYy9zaG9naWdyb3VuZC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgU2hvZ2lncm91bmQgfSBmcm9tICcuL3Nob2dpZ3JvdW5kLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgU2hvZ2lncm91bmQ7XG4iLCAiaW1wb3J0IHR5cGUgeyBLZXkgfSBmcm9tICcuL3R5cGVzLmpzJztcblxuZXhwb3J0IGNvbnN0IGNvbG9ycyA9IFsnc2VudGUnLCAnZ290ZSddIGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgZmlsZXMgPSBbXG4gICcxJyxcbiAgJzInLFxuICAnMycsXG4gICc0JyxcbiAgJzUnLFxuICAnNicsXG4gICc3JyxcbiAgJzgnLFxuICAnOScsXG4gICcxMCcsXG4gICcxMScsXG4gICcxMicsXG4gICcxMycsXG4gICcxNCcsXG4gICcxNScsXG4gICcxNicsXG5dIGFzIGNvbnN0O1xuZXhwb3J0IGNvbnN0IHJhbmtzID0gW1xuICAnYScsXG4gICdiJyxcbiAgJ2MnLFxuICAnZCcsXG4gICdlJyxcbiAgJ2YnLFxuICAnZycsXG4gICdoJyxcbiAgJ2knLFxuICAnaicsXG4gICdrJyxcbiAgJ2wnLFxuICAnbScsXG4gICduJyxcbiAgJ28nLFxuICAncCcsXG5dIGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgYWxsS2V5czogcmVhZG9ubHkgS2V5W10gPSBBcnJheS5wcm90b3R5cGUuY29uY2F0KFxuICAuLi5yYW5rcy5tYXAoKHIpID0+IGZpbGVzLm1hcCgoZikgPT4gZiArIHIpKSxcbik7XG5cbmV4cG9ydCBjb25zdCBub3RhdGlvbnMgPSBbJ251bWVyaWMnLCAnamFwYW5lc2UnLCAnZW5naW5lJywgJ2hleCcsICdkaXpoaSddIGFzIGNvbnN0O1xuIiwgImltcG9ydCB7IGFsbEtleXMsIGNvbG9ycyB9IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5cbmV4cG9ydCBjb25zdCBwb3Mya2V5ID0gKHBvczogc2cuUG9zKTogc2cuS2V5ID0+IGFsbEtleXNbcG9zWzBdICsgMTYgKiBwb3NbMV1dO1xuXG5leHBvcnQgY29uc3Qga2V5MnBvcyA9IChrOiBzZy5LZXkpOiBzZy5Qb3MgPT4ge1xuICBpZiAoay5sZW5ndGggPiAyKSByZXR1cm4gW2suY2hhckNvZGVBdCgxKSAtIDM5LCBrLmNoYXJDb2RlQXQoMikgLSA5N107XG4gIGVsc2UgcmV0dXJuIFtrLmNoYXJDb2RlQXQoMCkgLSA0OSwgay5jaGFyQ29kZUF0KDEpIC0gOTddO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIG1lbW88QT4oZjogKCkgPT4gQSk6IHNnLk1lbW88QT4ge1xuICBsZXQgdjogQSB8IHVuZGVmaW5lZDtcbiAgY29uc3QgcmV0ID0gKCk6IEEgPT4ge1xuICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHYgPSBmKCk7XG4gICAgcmV0dXJuIHY7XG4gIH07XG4gIHJldC5jbGVhciA9ICgpID0+IHtcbiAgICB2ID0gdW5kZWZpbmVkO1xuICB9O1xuICByZXR1cm4gcmV0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FsbFVzZXJGdW5jdGlvbjxUIGV4dGVuZHMgKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPihcbiAgZjogVCB8IHVuZGVmaW5lZCxcbiAgLi4uYXJnczogUGFyYW1ldGVyczxUPlxuKTogdm9pZCB7XG4gIGlmIChmKSBzZXRUaW1lb3V0KCgpID0+IGYoLi4uYXJncyksIDEpO1xufVxuXG5leHBvcnQgY29uc3Qgb3Bwb3NpdGUgPSAoYzogc2cuQ29sb3IpOiBzZy5Db2xvciA9PiAoYyA9PT0gJ3NlbnRlJyA/ICdnb3RlJyA6ICdzZW50ZScpO1xuXG5leHBvcnQgY29uc3Qgc2VudGVQb3YgPSAobzogc2cuQ29sb3IpOiBib29sZWFuID0+IG8gPT09ICdzZW50ZSc7XG5cbmV4cG9ydCBjb25zdCBkaXN0YW5jZVNxID0gKHBvczE6IHNnLlBvcywgcG9zMjogc2cuUG9zKTogbnVtYmVyID0+IHtcbiAgY29uc3QgZHggPSBwb3MxWzBdIC0gcG9zMlswXTtcbiAgY29uc3QgZHkgPSBwb3MxWzFdIC0gcG9zMlsxXTtcbiAgcmV0dXJuIGR4ICogZHggKyBkeSAqIGR5O1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGlzS2V5KHZhbHVlOiBzZy5LZXkgfCBzZy5QaWVjZSB8IHVuZGVmaW5lZCk6IHZhbHVlIGlzIHNnLktleSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnO1xufVxuXG5leHBvcnQgY29uc3Qgc2FtZVBpZWNlID0gKHAxOiBzZy5QaWVjZSwgcDI6IHNnLlBpZWNlKTogYm9vbGVhbiA9PlxuICBwMS5yb2xlID09PSBwMi5yb2xlICYmIHAxLmNvbG9yID09PSBwMi5jb2xvcjtcblxuY29uc3QgcG9zVG9UcmFuc2xhdGVCYXNlID0gKFxuICBwb3M6IHNnLlBvcyxcbiAgZGltczogc2cuRGltZW5zaW9ucyxcbiAgYXNTZW50ZTogYm9vbGVhbixcbiAgeEZhY3RvcjogbnVtYmVyLFxuICB5RmFjdG9yOiBudW1iZXIsXG4pOiBzZy5OdW1iZXJQYWlyID0+IFtcbiAgKGFzU2VudGUgPyBkaW1zLmZpbGVzIC0gMSAtIHBvc1swXSA6IHBvc1swXSkgKiB4RmFjdG9yLFxuICAoYXNTZW50ZSA/IHBvc1sxXSA6IGRpbXMucmFua3MgLSAxIC0gcG9zWzFdKSAqIHlGYWN0b3IsXG5dO1xuXG5leHBvcnQgY29uc3QgcG9zVG9UcmFuc2xhdGVBYnMgPSAoXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGJvdW5kczogRE9NUmVjdCxcbik6ICgocG9zOiBzZy5Qb3MsIGFzU2VudGU6IGJvb2xlYW4pID0+IHNnLk51bWJlclBhaXIpID0+IHtcbiAgY29uc3QgeEZhY3RvciA9IGJvdW5kcy53aWR0aCAvIGRpbXMuZmlsZXM7XG4gIGNvbnN0IHlGYWN0b3IgPSBib3VuZHMuaGVpZ2h0IC8gZGltcy5yYW5rcztcbiAgcmV0dXJuIChwb3MsIGFzU2VudGUpID0+IHBvc1RvVHJhbnNsYXRlQmFzZShwb3MsIGRpbXMsIGFzU2VudGUsIHhGYWN0b3IsIHlGYWN0b3IpO1xufTtcblxuZXhwb3J0IGNvbnN0IHBvc1RvVHJhbnNsYXRlUmVsID1cbiAgKGRpbXM6IHNnLkRpbWVuc2lvbnMpOiAoKHBvczogc2cuUG9zLCBhc1NlbnRlOiBib29sZWFuKSA9PiBzZy5OdW1iZXJQYWlyKSA9PlxuICAocG9zLCBhc1NlbnRlKSA9PlxuICAgIHBvc1RvVHJhbnNsYXRlQmFzZShwb3MsIGRpbXMsIGFzU2VudGUsIDEwMCwgMTAwKTtcblxuZXhwb3J0IGNvbnN0IHRyYW5zbGF0ZUFicyA9IChlbDogSFRNTEVsZW1lbnQsIHBvczogc2cuTnVtYmVyUGFpciwgc2NhbGU6IG51bWJlcik6IHZvaWQgPT4ge1xuICBlbC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKCR7cG9zWzBdfXB4LCR7cG9zWzFdfXB4KSBzY2FsZSgke3NjYWxlfSlgO1xufTtcblxuZXhwb3J0IGNvbnN0IHRyYW5zbGF0ZVJlbCA9IChcbiAgZWw6IEhUTUxFbGVtZW50LFxuICBwZXJjZW50czogc2cuTnVtYmVyUGFpcixcbiAgc2NhbGVGYWN0b3I6IG51bWJlcixcbiAgc2NhbGU/OiBudW1iZXIsXG4pOiB2b2lkID0+IHtcbiAgZWwuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke3BlcmNlbnRzWzBdICogc2NhbGVGYWN0b3J9JSwke3BlcmNlbnRzWzFdICogc2NhbGVGYWN0b3J9JSkgc2NhbGUoJHtcbiAgICBzY2FsZSB8fCBzY2FsZUZhY3RvclxuICB9KWA7XG59O1xuXG5leHBvcnQgY29uc3Qgc2V0RGlzcGxheSA9IChlbDogSFRNTEVsZW1lbnQsIHY6IGJvb2xlYW4pOiB2b2lkID0+IHtcbiAgZWwuc3R5bGUuZGlzcGxheSA9IHYgPyAnJyA6ICdub25lJztcbn07XG5cbmNvbnN0IGlzTW91c2VFdmVudCA9IChlOiBzZy5Nb3VjaEV2ZW50KTogZSBpcyBFdmVudCAmIE1vdXNlRXZlbnQgPT4ge1xuICByZXR1cm4gISFlLmNsaWVudFggfHwgZS5jbGllbnRYID09PSAwO1xufTtcblxuZXhwb3J0IGNvbnN0IGV2ZW50UG9zaXRpb24gPSAoZTogc2cuTW91Y2hFdmVudCk6IHNnLk51bWJlclBhaXIgfCB1bmRlZmluZWQgPT4ge1xuICBpZiAoaXNNb3VzZUV2ZW50KGUpKSByZXR1cm4gW2UuY2xpZW50WCwgZS5jbGllbnRZXTtcbiAgaWYgKGUudGFyZ2V0VG91Y2hlcz8uWzBdKSByZXR1cm4gW2UudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRYLCBlLnRhcmdldFRvdWNoZXNbMF0uY2xpZW50WV07XG4gIHJldHVybjsgLy8gdG91Y2hlbmQgaGFzIG5vIHBvc2l0aW9uIVxufTtcblxuZXhwb3J0IGNvbnN0IGlzUmlnaHRCdXR0b24gPSAoZTogc2cuTW91Y2hFdmVudCk6IGJvb2xlYW4gPT4gZS5idXR0b25zID09PSAyIHx8IGUuYnV0dG9uID09PSAyO1xuXG5leHBvcnQgY29uc3QgaXNNaWRkbGVCdXR0b24gPSAoZTogc2cuTW91Y2hFdmVudCk6IGJvb2xlYW4gPT4gZS5idXR0b25zID09PSA0IHx8IGUuYnV0dG9uID09PSAxO1xuXG5leHBvcnQgY29uc3QgY3JlYXRlRWwgPSAodGFnTmFtZTogc3RyaW5nLCBjbGFzc05hbWU/OiBzdHJpbmcpOiBIVE1MRWxlbWVudCA9PiB7XG4gIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcbiAgaWYgKGNsYXNzTmFtZSkgZWwuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xuICByZXR1cm4gZWw7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gcGllY2VOYW1lT2YocGllY2U6IHNnLlBpZWNlKTogc2cuUGllY2VOYW1lIHtcbiAgcmV0dXJuIGAke3BpZWNlLmNvbG9yfSAke3BpZWNlLnJvbGV9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUGllY2VOYW1lKHBpZWNlTmFtZTogc2cuUGllY2VOYW1lKTogc2cuUGllY2Uge1xuICBjb25zdCBzcGxpdHRlZCA9IHBpZWNlTmFtZS5zcGxpdCgnICcsIDIpO1xuICByZXR1cm4geyBjb2xvcjogc3BsaXR0ZWRbMF0gYXMgc2cuQ29sb3IsIHJvbGU6IHNwbGl0dGVkWzFdIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1BpZWNlTm9kZShlbDogSFRNTEVsZW1lbnQpOiBlbCBpcyBzZy5QaWVjZU5vZGUge1xuICByZXR1cm4gZWwudGFnTmFtZSA9PT0gJ1BJRUNFJztcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc1NxdWFyZU5vZGUoZWw6IEhUTUxFbGVtZW50KTogZWwgaXMgc2cuU3F1YXJlTm9kZSB7XG4gIHJldHVybiBlbC50YWdOYW1lID09PSAnU1EnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZVNxdWFyZUNlbnRlcihcbiAga2V5OiBzZy5LZXksXG4gIGFzU2VudGU6IGJvb2xlYW4sXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGJvdW5kczogRE9NUmVjdCxcbik6IHNnLk51bWJlclBhaXIge1xuICBjb25zdCBwb3MgPSBrZXkycG9zKGtleSk7XG4gIGlmIChhc1NlbnRlKSB7XG4gICAgcG9zWzBdID0gZGltcy5maWxlcyAtIDEgLSBwb3NbMF07XG4gICAgcG9zWzFdID0gZGltcy5yYW5rcyAtIDEgLSBwb3NbMV07XG4gIH1cbiAgcmV0dXJuIFtcbiAgICBib3VuZHMubGVmdCArIChib3VuZHMud2lkdGggKiBwb3NbMF0pIC8gZGltcy5maWxlcyArIGJvdW5kcy53aWR0aCAvIChkaW1zLmZpbGVzICogMiksXG4gICAgYm91bmRzLnRvcCArXG4gICAgICAoYm91bmRzLmhlaWdodCAqIChkaW1zLnJhbmtzIC0gMSAtIHBvc1sxXSkpIC8gZGltcy5yYW5rcyArXG4gICAgICBib3VuZHMuaGVpZ2h0IC8gKGRpbXMucmFua3MgKiAyKSxcbiAgXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRvbVNxdWFyZUluZGV4T2ZLZXkoa2V5OiBzZy5LZXksIGFzU2VudGU6IGJvb2xlYW4sIGRpbXM6IHNnLkRpbWVuc2lvbnMpOiBudW1iZXIge1xuICBjb25zdCBwb3MgPSBrZXkycG9zKGtleSk7XG4gIGxldCBpbmRleCA9IGRpbXMuZmlsZXMgLSAxIC0gcG9zWzBdICsgcG9zWzFdICogZGltcy5maWxlcztcbiAgaWYgKCFhc1NlbnRlKSBpbmRleCA9IGRpbXMuZmlsZXMgKiBkaW1zLnJhbmtzIC0gMSAtIGluZGV4O1xuXG4gIHJldHVybiBpbmRleDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSW5zaWRlUmVjdChyZWN0OiBET01SZWN0LCBwb3M6IHNnLk51bWJlclBhaXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICByZWN0LmxlZnQgPD0gcG9zWzBdICYmXG4gICAgcmVjdC50b3AgPD0gcG9zWzFdICYmXG4gICAgcmVjdC5sZWZ0ICsgcmVjdC53aWR0aCA+IHBvc1swXSAmJlxuICAgIHJlY3QudG9wICsgcmVjdC5oZWlnaHQgPiBwb3NbMV1cbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTmVhclJlY3QocmVjdDogRE9NUmVjdCwgcG9zOiBzZy5OdW1iZXJQYWlyLCByOiBudW1iZXIpOiBib29sZWFuIHtcbiAgY29uc3QgW3gsIHldID0gcG9zO1xuXG4gIGNvbnN0IGNsb3Nlc3RYID0gTWF0aC5tYXgocmVjdC5sZWZ0LCBNYXRoLm1pbih4LCByZWN0LnJpZ2h0KSk7XG4gIGNvbnN0IGNsb3Nlc3RZID0gTWF0aC5tYXgocmVjdC50b3AsIE1hdGgubWluKHksIHJlY3QuYm90dG9tKSk7XG5cbiAgY29uc3QgZHggPSB4IC0gY2xvc2VzdFg7XG4gIGNvbnN0IGR5ID0geSAtIGNsb3Nlc3RZO1xuXG4gIHJldHVybiBkeCAqIGR4ICsgZHkgKiBkeSA8PSByICogcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEtleUF0RG9tUG9zKFxuICBwb3M6IHNnLk51bWJlclBhaXIsXG4gIGFzU2VudGU6IGJvb2xlYW4sXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGJvdW5kczogRE9NUmVjdCxcbik6IHNnLktleSB8IHVuZGVmaW5lZCB7XG4gIGxldCBmaWxlID0gTWF0aC5mbG9vcigoZGltcy5maWxlcyAqIChwb3NbMF0gLSBib3VuZHMubGVmdCkpIC8gYm91bmRzLndpZHRoKTtcbiAgaWYgKGFzU2VudGUpIGZpbGUgPSBkaW1zLmZpbGVzIC0gMSAtIGZpbGU7XG4gIGxldCByYW5rID0gTWF0aC5mbG9vcigoZGltcy5yYW5rcyAqIChwb3NbMV0gLSBib3VuZHMudG9wKSkgLyBib3VuZHMuaGVpZ2h0KTtcbiAgaWYgKCFhc1NlbnRlKSByYW5rID0gZGltcy5yYW5rcyAtIDEgLSByYW5rO1xuICByZXR1cm4gZmlsZSA+PSAwICYmIGZpbGUgPCBkaW1zLmZpbGVzICYmIHJhbmsgPj0gMCAmJiByYW5rIDwgZGltcy5yYW5rc1xuICAgID8gcG9zMmtleShbZmlsZSwgcmFua10pXG4gICAgOiB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRIYW5kUGllY2VBdERvbVBvcyhcbiAgcG9zOiBzZy5OdW1iZXJQYWlyLFxuICByb2xlczogc2cuUm9sZVN0cmluZ1tdLFxuICBib3VuZHM6IE1hcDxzZy5QaWVjZU5hbWUsIERPTVJlY3Q+LFxuKTogc2cuUGllY2UgfCB1bmRlZmluZWQge1xuICBmb3IgKGNvbnN0IGNvbG9yIG9mIGNvbG9ycykge1xuICAgIGZvciAoY29uc3Qgcm9sZSBvZiByb2xlcykge1xuICAgICAgY29uc3QgcGllY2UgPSB7IGNvbG9yLCByb2xlIH07XG4gICAgICBjb25zdCBwaWVjZVJlY3QgPSBib3VuZHMuZ2V0KHBpZWNlTmFtZU9mKHBpZWNlKSk7XG4gICAgICBpZiAocGllY2VSZWN0ICYmIGlzSW5zaWRlUmVjdChwaWVjZVJlY3QsIHBvcykpIHJldHVybiBwaWVjZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcG9zT2ZPdXRzaWRlRWwoXG4gIGxlZnQ6IG51bWJlcixcbiAgdG9wOiBudW1iZXIsXG4gIGFzU2VudGU6IGJvb2xlYW4sXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGJvYXJkQm91bmRzOiBET01SZWN0LFxuKTogc2cuUG9zIHwgdW5kZWZpbmVkIHtcbiAgY29uc3Qgc3FXID0gYm9hcmRCb3VuZHMud2lkdGggLyBkaW1zLmZpbGVzO1xuICBjb25zdCBzcUggPSBib2FyZEJvdW5kcy5oZWlnaHQgLyBkaW1zLnJhbmtzO1xuICBpZiAoIXNxVyB8fCAhc3FIKSByZXR1cm47XG4gIGxldCB4T2ZmID0gKGxlZnQgLSBib2FyZEJvdW5kcy5sZWZ0KSAvIHNxVztcbiAgaWYgKGFzU2VudGUpIHhPZmYgPSBkaW1zLmZpbGVzIC0gMSAtIHhPZmY7XG4gIGxldCB5T2ZmID0gKHRvcCAtIGJvYXJkQm91bmRzLnRvcCkgLyBzcUg7XG4gIGlmICghYXNTZW50ZSkgeU9mZiA9IGRpbXMucmFua3MgLSAxIC0geU9mZjtcbiAgcmV0dXJuIFt4T2ZmLCB5T2ZmXTtcbn1cbiIsICJpbXBvcnQgeyBhbGxLZXlzLCBjb2xvcnMgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgdHlwZSB7IEhlYWRsZXNzU3RhdGUsIFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwuanMnO1xuXG5leHBvcnQgdHlwZSBNdXRhdGlvbjxBPiA9IChzdGF0ZTogU3RhdGUpID0+IEE7XG5cbi8vIDAsMSBhbmltYXRpb24gZ29hbFxuLy8gMiwzIGFuaW1hdGlvbiBjdXJyZW50IHN0YXR1c1xuZXhwb3J0IHR5cGUgQW5pbVZlY3RvciA9IHNnLk51bWJlclF1YWQ7XG5cbmV4cG9ydCB0eXBlIEFuaW1WZWN0b3JzID0gTWFwPHNnLktleSwgQW5pbVZlY3Rvcj47XG5cbmV4cG9ydCB0eXBlIEFuaW1GYWRpbmdzID0gTWFwPHNnLktleSwgc2cuUGllY2U+O1xuXG5leHBvcnQgdHlwZSBBbmltUHJvbW90aW9ucyA9IE1hcDxzZy5LZXksIHNnLlBpZWNlPjtcblxuZXhwb3J0IGludGVyZmFjZSBBbmltUGxhbiB7XG4gIGFuaW1zOiBBbmltVmVjdG9ycztcbiAgZmFkaW5nczogQW5pbUZhZGluZ3M7XG4gIHByb21vdGlvbnM6IEFuaW1Qcm9tb3Rpb25zO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1DdXJyZW50IHtcbiAgc3RhcnQ6IERPTUhpZ2hSZXNUaW1lU3RhbXA7XG4gIGZyZXF1ZW5jeTogc2cuS0h6O1xuICBwbGFuOiBBbmltUGxhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3VsZEFuaW1hdGUoeyBlbmFibGVkLCBkdXJhdGlvbiB9OiBIZWFkbGVzc1N0YXRlWydhbmltYXRpb24nXSk6IGJvb2xlYW4ge1xuICByZXR1cm4gZW5hYmxlZCAmJiBkdXJhdGlvbiA+PSA3MDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFuaW08QT4obXV0YXRpb246IE11dGF0aW9uPEE+LCBzdGF0ZTogU3RhdGUpOiBBIHtcbiAgcmV0dXJuIHNob3VsZEFuaW1hdGUoc3RhdGUuYW5pbWF0aW9uKSA/IGFuaW1hdGUobXV0YXRpb24sIHN0YXRlKSA6IHJlbmRlcihtdXRhdGlvbiwgc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyPEE+KG11dGF0aW9uOiBNdXRhdGlvbjxBPiwgc3RhdGU6IFN0YXRlKTogQSB7XG4gIGNvbnN0IHJlc3VsdCA9IG11dGF0aW9uKHN0YXRlKTtcbiAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5pbnRlcmZhY2UgQW5pbVBpZWNlIHtcbiAga2V5Pzogc2cuS2V5O1xuICBwb3M6IHNnLlBvcztcbiAgcGllY2U6IHNnLlBpZWNlO1xufVxuXG50eXBlIE5ld0FuaW1QaWVjZSA9IFJlcXVpcmVkPEFuaW1QaWVjZT47XG5cbmZ1bmN0aW9uIG1ha2VQaWVjZShrZXk6IHNnLktleSwgcGllY2U6IHNnLlBpZWNlKTogTmV3QW5pbVBpZWNlIHtcbiAgcmV0dXJuIHtcbiAgICBrZXk6IGtleSxcbiAgICBwb3M6IHV0aWwua2V5MnBvcyhrZXkpLFxuICAgIHBpZWNlOiBwaWVjZSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gY2xvc2VyKHBpZWNlOiBBbmltUGllY2UsIHBpZWNlczogQW5pbVBpZWNlW10pOiBBbmltUGllY2UgfCB1bmRlZmluZWQge1xuICByZXR1cm4gcGllY2VzLnNvcnQoKHAxLCBwMikgPT4ge1xuICAgIHJldHVybiB1dGlsLmRpc3RhbmNlU3EocGllY2UucG9zLCBwMS5wb3MpIC0gdXRpbC5kaXN0YW5jZVNxKHBpZWNlLnBvcywgcDIucG9zKTtcbiAgfSlbMF07XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVQbGFuKHByZXZQaWVjZXM6IHNnLlBpZWNlcywgcHJldkhhbmRzOiBzZy5IYW5kcywgY3VycmVudDogU3RhdGUpOiBBbmltUGxhbiB7XG4gIGNvbnN0IGFuaW1zOiBBbmltVmVjdG9ycyA9IG5ldyBNYXAoKTtcbiAgY29uc3QgYW5pbWVkT3JpZ3M6IHNnLktleVtdID0gW107XG4gIGNvbnN0IGZhZGluZ3M6IEFuaW1GYWRpbmdzID0gbmV3IE1hcCgpO1xuICBjb25zdCBwcm9tb3Rpb25zOiBBbmltUHJvbW90aW9ucyA9IG5ldyBNYXAoKTtcbiAgY29uc3QgbWlzc2luZ3M6IEFuaW1QaWVjZVtdID0gW107XG4gIGNvbnN0IG5ld3M6IE5ld0FuaW1QaWVjZVtdID0gW107XG4gIGNvbnN0IHByZVBpZWNlcyA9IG5ldyBNYXA8c2cuS2V5LCBBbmltUGllY2U+KCk7XG5cbiAgZm9yIChjb25zdCBbaywgcF0gb2YgcHJldlBpZWNlcykge1xuICAgIHByZVBpZWNlcy5zZXQoaywgbWFrZVBpZWNlKGssIHApKTtcbiAgfVxuICBmb3IgKGNvbnN0IGtleSBvZiBhbGxLZXlzKSB7XG4gICAgY29uc3QgY3VyUCA9IGN1cnJlbnQucGllY2VzLmdldChrZXkpO1xuICAgIGNvbnN0IHByZVAgPSBwcmVQaWVjZXMuZ2V0KGtleSk7XG4gICAgaWYgKGN1clApIHtcbiAgICAgIGlmIChwcmVQKSB7XG4gICAgICAgIGlmICghdXRpbC5zYW1lUGllY2UoY3VyUCwgcHJlUC5waWVjZSkpIHtcbiAgICAgICAgICBtaXNzaW5ncy5wdXNoKHByZVApO1xuICAgICAgICAgIG5ld3MucHVzaChtYWtlUGllY2Uoa2V5LCBjdXJQKSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBuZXdzLnB1c2gobWFrZVBpZWNlKGtleSwgY3VyUCkpO1xuICAgIH0gZWxzZSBpZiAocHJlUCkgbWlzc2luZ3MucHVzaChwcmVQKTtcbiAgfVxuICBpZiAoY3VycmVudC5hbmltYXRpb24uaGFuZHMpIHtcbiAgICBmb3IgKGNvbnN0IGNvbG9yIG9mIGNvbG9ycykge1xuICAgICAgY29uc3QgY3VySCA9IGN1cnJlbnQuaGFuZHMuaGFuZE1hcC5nZXQoY29sb3IpO1xuICAgICAgY29uc3QgcHJlSCA9IHByZXZIYW5kcy5nZXQoY29sb3IpO1xuICAgICAgaWYgKHByZUggJiYgY3VySCkge1xuICAgICAgICBmb3IgKGNvbnN0IFtyb2xlLCBuXSBvZiBwcmVIKSB7XG4gICAgICAgICAgY29uc3QgcGllY2U6IHNnLlBpZWNlID0geyByb2xlLCBjb2xvciB9O1xuICAgICAgICAgIGNvbnN0IGN1ck4gPSBjdXJILmdldChyb2xlKSB8fCAwO1xuICAgICAgICAgIGlmIChjdXJOIDwgbikge1xuICAgICAgICAgICAgY29uc3QgaGFuZFBpZWNlT2Zmc2V0ID0gY3VycmVudC5kb20uYm91bmRzLmhhbmRzXG4gICAgICAgICAgICAgIC5waWVjZUJvdW5kcygpXG4gICAgICAgICAgICAgIC5nZXQodXRpbC5waWVjZU5hbWVPZihwaWVjZSkpO1xuICAgICAgICAgICAgY29uc3QgYm91bmRzID0gY3VycmVudC5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpO1xuICAgICAgICAgICAgY29uc3Qgb3V0UG9zID1cbiAgICAgICAgICAgICAgaGFuZFBpZWNlT2Zmc2V0ICYmIGJvdW5kc1xuICAgICAgICAgICAgICAgID8gdXRpbC5wb3NPZk91dHNpZGVFbChcbiAgICAgICAgICAgICAgICAgICAgaGFuZFBpZWNlT2Zmc2V0LmxlZnQsXG4gICAgICAgICAgICAgICAgICAgIGhhbmRQaWVjZU9mZnNldC50b3AsXG4gICAgICAgICAgICAgICAgICAgIHV0aWwuc2VudGVQb3YoY3VycmVudC5vcmllbnRhdGlvbiksXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnQuZGltZW5zaW9ucyxcbiAgICAgICAgICAgICAgICAgICAgYm91bmRzLFxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKG91dFBvcylcbiAgICAgICAgICAgICAgbWlzc2luZ3MucHVzaCh7XG4gICAgICAgICAgICAgICAgcG9zOiBvdXRQb3MsXG4gICAgICAgICAgICAgICAgcGllY2U6IHBpZWNlLFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZm9yIChjb25zdCBuZXdQIG9mIG5ld3MpIHtcbiAgICBjb25zdCBwcmVQID0gY2xvc2VyKFxuICAgICAgbmV3UCxcbiAgICAgIG1pc3NpbmdzLmZpbHRlcigocCkgPT4ge1xuICAgICAgICBpZiAodXRpbC5zYW1lUGllY2UobmV3UC5waWVjZSwgcC5waWVjZSkpIHJldHVybiB0cnVlO1xuICAgICAgICAvLyBjaGVja2luZyB3aGV0aGVyIHByb21vdGVkIHBpZWNlcyBhcmUgdGhlIHNhbWVcbiAgICAgICAgY29uc3QgcFJvbGUgPSBjdXJyZW50LnByb21vdGlvbi5wcm9tb3Rlc1RvKHAucGllY2Uucm9sZSk7XG4gICAgICAgIGNvbnN0IHBQaWVjZSA9IHBSb2xlICYmIHsgY29sb3I6IHAucGllY2UuY29sb3IsIHJvbGU6IHBSb2xlIH07XG4gICAgICAgIGNvbnN0IG5Sb2xlID0gY3VycmVudC5wcm9tb3Rpb24ucHJvbW90ZXNUbyhuZXdQLnBpZWNlLnJvbGUpO1xuICAgICAgICBjb25zdCBuUGllY2UgPSBuUm9sZSAmJiB7IGNvbG9yOiBuZXdQLnBpZWNlLmNvbG9yLCByb2xlOiBuUm9sZSB9O1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICghIXBQaWVjZSAmJiB1dGlsLnNhbWVQaWVjZShuZXdQLnBpZWNlLCBwUGllY2UpKSB8fFxuICAgICAgICAgICghIW5QaWVjZSAmJiB1dGlsLnNhbWVQaWVjZShuUGllY2UsIHAucGllY2UpKVxuICAgICAgICApO1xuICAgICAgfSksXG4gICAgKTtcbiAgICBpZiAocHJlUCkge1xuICAgICAgY29uc3QgdmVjdG9yID0gW3ByZVAucG9zWzBdIC0gbmV3UC5wb3NbMF0sIHByZVAucG9zWzFdIC0gbmV3UC5wb3NbMV1dO1xuICAgICAgYW5pbXMuc2V0KG5ld1Aua2V5LCB2ZWN0b3IuY29uY2F0KHZlY3RvcikgYXMgQW5pbVZlY3Rvcik7XG4gICAgICBpZiAocHJlUC5rZXkpIGFuaW1lZE9yaWdzLnB1c2gocHJlUC5rZXkpO1xuICAgICAgaWYgKCF1dGlsLnNhbWVQaWVjZShuZXdQLnBpZWNlLCBwcmVQLnBpZWNlKSAmJiBuZXdQLmtleSkgcHJvbW90aW9ucy5zZXQobmV3UC5rZXksIHByZVAucGllY2UpO1xuICAgIH1cbiAgfVxuICBmb3IgKGNvbnN0IHAgb2YgbWlzc2luZ3MpIHtcbiAgICBpZiAocC5rZXkgJiYgIWFuaW1lZE9yaWdzLmluY2x1ZGVzKHAua2V5KSkgZmFkaW5ncy5zZXQocC5rZXksIHAucGllY2UpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBhbmltczogYW5pbXMsXG4gICAgZmFkaW5nczogZmFkaW5ncyxcbiAgICBwcm9tb3Rpb25zOiBwcm9tb3Rpb25zLFxuICB9O1xufVxuXG5mdW5jdGlvbiBzdGVwKHN0YXRlOiBTdGF0ZSwgbm93OiBET01IaWdoUmVzVGltZVN0YW1wKTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50O1xuICBpZiAoY3VyID09PSB1bmRlZmluZWQpIHtcbiAgICAvLyBhbmltYXRpb24gd2FzIGNhbmNlbGVkIDooXG4gICAgaWYgKCFzdGF0ZS5kb20uZGVzdHJveWVkKSBzdGF0ZS5kb20ucmVkcmF3Tm93KCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IHJlc3QgPSAxIC0gKG5vdyAtIGN1ci5zdGFydCkgKiBjdXIuZnJlcXVlbmN5O1xuICBpZiAocmVzdCA8PSAwKSB7XG4gICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZG9tLnJlZHJhd05vdygpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGVhc2UgPSBlYXNpbmcocmVzdCk7XG4gICAgZm9yIChjb25zdCBjZmcgb2YgY3VyLnBsYW4uYW5pbXMudmFsdWVzKCkpIHtcbiAgICAgIGNmZ1syXSA9IGNmZ1swXSAqIGVhc2U7XG4gICAgICBjZmdbM10gPSBjZmdbMV0gKiBlYXNlO1xuICAgIH1cbiAgICBzdGF0ZS5kb20ucmVkcmF3Tm93KHRydWUpOyAvLyBvcHRpbWlzYXRpb246IGRvbid0IHJlbmRlciBTVkcgY2hhbmdlcyBkdXJpbmcgYW5pbWF0aW9uc1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgobm93ID0gcGVyZm9ybWFuY2Uubm93KCkpID0+IHN0ZXAoc3RhdGUsIG5vdykpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFuaW1hdGU8QT4obXV0YXRpb246IE11dGF0aW9uPEE+LCBzdGF0ZTogU3RhdGUpOiBBIHtcbiAgLy8gY2xvbmUgc3RhdGUgYmVmb3JlIG11dGF0aW5nIGl0XG4gIGNvbnN0IHByZXZQaWVjZXM6IHNnLlBpZWNlcyA9IG5ldyBNYXAoc3RhdGUucGllY2VzKTtcbiAgY29uc3QgcHJldkhhbmRzOiBzZy5IYW5kcyA9IG5ldyBNYXAoW1xuICAgIFsnc2VudGUnLCBuZXcgTWFwKHN0YXRlLmhhbmRzLmhhbmRNYXAuZ2V0KCdzZW50ZScpKV0sXG4gICAgWydnb3RlJywgbmV3IE1hcChzdGF0ZS5oYW5kcy5oYW5kTWFwLmdldCgnZ290ZScpKV0sXG4gIF0pO1xuXG4gIGNvbnN0IHJlc3VsdCA9IG11dGF0aW9uKHN0YXRlKTtcbiAgY29uc3QgcGxhbiA9IGNvbXB1dGVQbGFuKHByZXZQaWVjZXMsIHByZXZIYW5kcywgc3RhdGUpO1xuICBpZiAocGxhbi5hbmltcy5zaXplIHx8IHBsYW4uZmFkaW5ncy5zaXplKSB7XG4gICAgY29uc3QgYWxyZWFkeVJ1bm5pbmcgPSBzdGF0ZS5hbmltYXRpb24uY3VycmVudD8uc3RhcnQgIT09IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHtcbiAgICAgIHN0YXJ0OiBwZXJmb3JtYW5jZS5ub3coKSxcbiAgICAgIGZyZXF1ZW5jeTogMSAvIE1hdGgubWF4KHN0YXRlLmFuaW1hdGlvbi5kdXJhdGlvbiwgMSksXG4gICAgICBwbGFuOiBwbGFuLFxuICAgIH07XG4gICAgaWYgKCFhbHJlYWR5UnVubmluZykgc3RlcChzdGF0ZSwgcGVyZm9ybWFuY2Uubm93KCkpO1xuICB9IGVsc2Uge1xuICAgIC8vIGRvbid0IGFuaW1hdGUsIGp1c3QgcmVuZGVyIHJpZ2h0IGF3YXlcbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vZ3JlLzE2NTAyOTRcbmZ1bmN0aW9uIGVhc2luZyh0OiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gdCA8IDAuNSA/IDQgKiB0ICogdCAqIHQgOiAodCAtIDEpICogKDIgKiB0IC0gMikgKiAoMiAqIHQgLSAyKSArIDE7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBIZWFkbGVzc1N0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgaXNLZXksIHNhbWVQaWVjZSB9IGZyb20gJy4vdXRpbC5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBudW1iZXJJbkhhbmQoczogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlKTogbnVtYmVyIHtcbiAgcmV0dXJuIHMuaGFuZHMuaGFuZE1hcC5nZXQocGllY2UuY29sb3IpPy5nZXQocGllY2Uucm9sZSkgfHwgMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZFRvSGFuZChzOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGNudCA9IDEpOiB2b2lkIHtcbiAgY29uc3QgaGFuZCA9IHMuaGFuZHMuaGFuZE1hcC5nZXQocGllY2UuY29sb3IpO1xuICBjb25zdCByb2xlID1cbiAgICAocy5oYW5kcy5yb2xlcy5pbmNsdWRlcyhwaWVjZS5yb2xlKSA/IHBpZWNlLnJvbGUgOiBzLnByb21vdGlvbi51bnByb21vdGVzVG8ocGllY2Uucm9sZSkpIHx8XG4gICAgcGllY2Uucm9sZTtcbiAgaWYgKGhhbmQgJiYgcy5oYW5kcy5yb2xlcy5pbmNsdWRlcyhyb2xlKSkgaGFuZC5zZXQocm9sZSwgKGhhbmQuZ2V0KHJvbGUpIHx8IDApICsgY250KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUZyb21IYW5kKHM6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwgY250ID0gMSk6IHZvaWQge1xuICBjb25zdCBoYW5kID0gcy5oYW5kcy5oYW5kTWFwLmdldChwaWVjZS5jb2xvcik7XG4gIGNvbnN0IHJvbGUgPVxuICAgIChzLmhhbmRzLnJvbGVzLmluY2x1ZGVzKHBpZWNlLnJvbGUpID8gcGllY2Uucm9sZSA6IHMucHJvbW90aW9uLnVucHJvbW90ZXNUbyhwaWVjZS5yb2xlKSkgfHxcbiAgICBwaWVjZS5yb2xlO1xuICBjb25zdCBudW0gPSBoYW5kPy5nZXQocm9sZSk7XG4gIGlmIChoYW5kICYmIG51bSkgaGFuZC5zZXQocm9sZSwgTWF0aC5tYXgobnVtIC0gY250LCAwKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJIYW5kKHM6IEhlYWRsZXNzU3RhdGUsIGhhbmRFbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgaGFuZEVsLmNsYXNzTGlzdC50b2dnbGUoJ3Byb21vdGlvbicsICEhcy5wcm9tb3Rpb24uY3VycmVudCk7XG4gIGxldCB3cmFwRWwgPSBoYW5kRWwuZmlyc3RFbGVtZW50Q2hpbGQgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIHdoaWxlICh3cmFwRWwpIHtcbiAgICBjb25zdCBwaWVjZUVsID0gd3JhcEVsLmZpcnN0RWxlbWVudENoaWxkIGFzIHNnLlBpZWNlTm9kZTtcbiAgICBjb25zdCBwaWVjZSA9IHsgcm9sZTogcGllY2VFbC5zZ1JvbGUsIGNvbG9yOiBwaWVjZUVsLnNnQ29sb3IgfTtcblxuICAgIGNvbnN0IGN1cnNvciA9IHMua2V5Ym9hcmQuY3VycmVudDtcbiAgICB3cmFwRWwuY2xhc3NMaXN0LnRvZ2dsZShcbiAgICAgICdrZXlib2FyZC1jdXJzb3InLFxuICAgICAgcy5rZXlib2FyZC5lbmFibGVkICYmXG4gICAgICAgICFzLnZpZXdPbmx5ICYmXG4gICAgICAgICFzLnByb21vdGlvbi5jdXJyZW50ICYmXG4gICAgICAgICEhY3Vyc29yICYmXG4gICAgICAgICFpc0tleShjdXJzb3IpICYmXG4gICAgICAgIHNhbWVQaWVjZShjdXJzb3IsIHBpZWNlKSxcbiAgICApO1xuICAgIHdyYXBFbC5jbGFzc0xpc3QudG9nZ2xlKCdrZXlib2FyZC1mb2N1c2VkJywgcy5rZXlib2FyZC5mb2N1c2VkKTtcblxuICAgIGNvbnN0IG51bSA9IG51bWJlckluSGFuZChzLCBwaWVjZSk7XG4gICAgY29uc3QgaXNTZWxlY3RlZCA9ICEhcy5zZWxlY3RlZFBpZWNlICYmIHNhbWVQaWVjZShwaWVjZSwgcy5zZWxlY3RlZFBpZWNlKSAmJiAhcy5kcm9wcGFibGUuc3BhcmU7XG5cbiAgICB3cmFwRWwuY2xhc3NMaXN0LnRvZ2dsZShcbiAgICAgICdzZWxlY3RlZCcsXG4gICAgICAocy5hY3RpdmVDb2xvciA9PT0gJ2JvdGgnIHx8IHMuYWN0aXZlQ29sb3IgPT09IHMudHVybkNvbG9yKSAmJiBpc1NlbGVjdGVkLFxuICAgICk7XG4gICAgd3JhcEVsLmNsYXNzTGlzdC50b2dnbGUoXG4gICAgICAncHJlc2VsZWN0ZWQnLFxuICAgICAgcy5hY3RpdmVDb2xvciAhPT0gJ2JvdGgnICYmIHMuYWN0aXZlQ29sb3IgIT09IHMudHVybkNvbG9yICYmIGlzU2VsZWN0ZWQsXG4gICAgKTtcbiAgICB3cmFwRWwuY2xhc3NMaXN0LnRvZ2dsZShcbiAgICAgICdsYXN0LWRlc3QnLFxuICAgICAgcy5oaWdobGlnaHQubGFzdERlc3RzICYmICEhcy5sYXN0UGllY2UgJiYgc2FtZVBpZWNlKHBpZWNlLCBzLmxhc3RQaWVjZSksXG4gICAgKTtcbiAgICB3cmFwRWwuY2xhc3NMaXN0LnRvZ2dsZSgnZHJhd2luZycsICEhcy5kcmF3YWJsZS5waWVjZSAmJiBzYW1lUGllY2Uocy5kcmF3YWJsZS5waWVjZSwgcGllY2UpKTtcbiAgICB3cmFwRWwuY2xhc3NMaXN0LnRvZ2dsZShcbiAgICAgICdjdXJyZW50LXByZScsXG4gICAgICAhIXMucHJlZHJvcHBhYmxlLmN1cnJlbnQgJiYgc2FtZVBpZWNlKHMucHJlZHJvcHBhYmxlLmN1cnJlbnQucGllY2UsIHBpZWNlKSxcbiAgICApO1xuICAgIHdyYXBFbC5kYXRhc2V0Lm5iID0gbnVtLnRvU3RyaW5nKCk7XG4gICAgd3JhcEVsID0gd3JhcEVsLm5leHRFbGVtZW50U2libGluZyBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgfVxufVxuIiwgImltcG9ydCB7IGFkZFRvSGFuZCwgbnVtYmVySW5IYW5kLCByZW1vdmVGcm9tSGFuZCB9IGZyb20gJy4vaGFuZHMuanMnO1xuaW1wb3J0IHR5cGUgeyBIZWFkbGVzc1N0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgY2FsbFVzZXJGdW5jdGlvbiwgb3Bwb3NpdGUsIHBpZWNlTmFtZU9mLCBzYW1lUGllY2UgfSBmcm9tICcuL3V0aWwuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gdG9nZ2xlT3JpZW50YXRpb24oc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiB2b2lkIHtcbiAgc3RhdGUub3JpZW50YXRpb24gPSBvcHBvc2l0ZShzdGF0ZS5vcmllbnRhdGlvbik7XG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSBzdGF0ZS5kcmFnZ2FibGUuY3VycmVudCA9IHN0YXRlLmhvdmVyZWQgPSB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldChzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICB1bnNlbGVjdChzdGF0ZSk7XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0gc3RhdGUuZHJhZ2dhYmxlLmN1cnJlbnQgPSBzdGF0ZS5ob3ZlcmVkID0gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0UGllY2VzKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZXM6IHNnLlBpZWNlc0RpZmYpOiB2b2lkIHtcbiAgZm9yIChjb25zdCBba2V5LCBwaWVjZV0gb2YgcGllY2VzKSB7XG4gICAgaWYgKHBpZWNlKSBzdGF0ZS5waWVjZXMuc2V0KGtleSwgcGllY2UpO1xuICAgIGVsc2Ugc3RhdGUucGllY2VzLmRlbGV0ZShrZXkpO1xuICB9XG4gIHVuc2VsZWN0TWlzc2luZ1BpZWNlKHN0YXRlKTtcbiAgY2xlYXJQcmVEZXN0cyhzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRDaGVja3Moc3RhdGU6IEhlYWRsZXNzU3RhdGUsIGNoZWNrc1ZhbHVlOiBzZy5LZXlbXSB8IHNnLkNvbG9yIHwgYm9vbGVhbik6IHZvaWQge1xuICBpZiAoQXJyYXkuaXNBcnJheShjaGVja3NWYWx1ZSkpIHtcbiAgICBzdGF0ZS5jaGVja3MgPSBjaGVja3NWYWx1ZTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoY2hlY2tzVmFsdWUgPT09IHRydWUpIGNoZWNrc1ZhbHVlID0gc3RhdGUudHVybkNvbG9yO1xuICAgIGlmIChjaGVja3NWYWx1ZSkge1xuICAgICAgY29uc3QgY2hlY2tzOiBzZy5LZXlbXSA9IFtdO1xuICAgICAgZm9yIChjb25zdCBbaywgcF0gb2Ygc3RhdGUucGllY2VzKSB7XG4gICAgICAgIGlmIChzdGF0ZS5oaWdobGlnaHQuY2hlY2tSb2xlcy5pbmNsdWRlcyhwLnJvbGUpICYmIHAuY29sb3IgPT09IGNoZWNrc1ZhbHVlKSBjaGVja3MucHVzaChrKTtcbiAgICAgIH1cbiAgICAgIHN0YXRlLmNoZWNrcyA9IGNoZWNrcztcbiAgICB9IGVsc2Ugc3RhdGUuY2hlY2tzID0gdW5kZWZpbmVkO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNldFByZW1vdmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tOiBib29sZWFuKTogdm9pZCB7XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIHN0YXRlLnByZW1vdmFibGUuY3VycmVudCA9IHsgb3JpZywgZGVzdCwgcHJvbSB9O1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByZW1vdmFibGUuZXZlbnRzLnNldCwgb3JpZywgZGVzdCwgcHJvbSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnNldFByZW1vdmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLnByZW1vdmFibGUuY3VycmVudCkge1xuICAgIHN0YXRlLnByZW1vdmFibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByZW1vdmFibGUuZXZlbnRzLnVuc2V0KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzZXRQcmVkcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tOiBib29sZWFuKTogdm9pZCB7XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50ID0geyBwaWVjZSwga2V5LCBwcm9tIH07XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJlZHJvcHBhYmxlLmV2ZW50cy5zZXQsIHBpZWNlLCBrZXksIHByb20pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5zZXRQcmVkcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCkge1xuICAgIHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJlZHJvcHBhYmxlLmV2ZW50cy51bnNldCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2VNb3ZlKFxuICBzdGF0ZTogSGVhZGxlc3NTdGF0ZSxcbiAgb3JpZzogc2cuS2V5LFxuICBkZXN0OiBzZy5LZXksXG4gIHByb206IGJvb2xlYW4sXG4pOiBzZy5QaWVjZSB8IGJvb2xlYW4ge1xuICBjb25zdCBvcmlnUGllY2UgPSBzdGF0ZS5waWVjZXMuZ2V0KG9yaWcpO1xuICBjb25zdCBkZXN0UGllY2UgPSBzdGF0ZS5waWVjZXMuZ2V0KGRlc3QpO1xuICBpZiAob3JpZyA9PT0gZGVzdCB8fCAhb3JpZ1BpZWNlKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IGNhcHR1cmVkID0gZGVzdFBpZWNlICYmIGRlc3RQaWVjZS5jb2xvciAhPT0gb3JpZ1BpZWNlLmNvbG9yID8gZGVzdFBpZWNlIDogdW5kZWZpbmVkO1xuICBjb25zdCBwcm9tUGllY2UgPSBwcm9tICYmIHByb21vdGVQaWVjZShzdGF0ZSwgb3JpZ1BpZWNlKTtcbiAgaWYgKGRlc3QgPT09IHN0YXRlLnNlbGVjdGVkIHx8IG9yaWcgPT09IHN0YXRlLnNlbGVjdGVkKSB1bnNlbGVjdChzdGF0ZSk7XG4gIHN0YXRlLnBpZWNlcy5zZXQoZGVzdCwgcHJvbVBpZWNlIHx8IG9yaWdQaWVjZSk7XG4gIHN0YXRlLnBpZWNlcy5kZWxldGUob3JpZyk7XG4gIGNsZWFyUHJlRGVzdHMoc3RhdGUpO1xuICBzdGF0ZS5sYXN0RGVzdHMgPSBbb3JpZywgZGVzdF07XG4gIHN0YXRlLmxhc3RQaWVjZSA9IHVuZGVmaW5lZDtcbiAgc3RhdGUuY2hlY2tzID0gdW5kZWZpbmVkO1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5tb3ZlLCBvcmlnLCBkZXN0LCBwcm9tLCBjYXB0dXJlZCk7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG4gIHJldHVybiBjYXB0dXJlZCB8fCB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFzZURyb3AoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBwaWVjZTogc2cuUGllY2UsXG4gIGtleTogc2cuS2V5LFxuICBwcm9tOiBib29sZWFuLFxuICBzcGFyZTogYm9vbGVhbiA9IHN0YXRlLmRyb3BwYWJsZS5zcGFyZSxcbik6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZUNvdW50ID0gbnVtYmVySW5IYW5kKHN0YXRlLCBwaWVjZSk7XG4gIGlmICghcGllY2VDb3VudCAmJiAhc3BhcmUpIHJldHVybiBmYWxzZTtcbiAgY29uc3QgcHJvbVBpZWNlID0gcHJvbSAmJiBwcm9tb3RlUGllY2Uoc3RhdGUsIHBpZWNlKTtcbiAgaWYgKFxuICAgIGtleSA9PT0gc3RhdGUuc2VsZWN0ZWQgfHxcbiAgICAoIXNwYXJlICYmIHBpZWNlQ291bnQgPT09IDEgJiYgc3RhdGUuc2VsZWN0ZWRQaWVjZSAmJiBzYW1lUGllY2Uoc3RhdGUuc2VsZWN0ZWRQaWVjZSwgcGllY2UpKVxuICApXG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICBzdGF0ZS5waWVjZXMuc2V0KGtleSwgcHJvbVBpZWNlIHx8IHBpZWNlKTtcbiAgY2xlYXJQcmVEZXN0cyhzdGF0ZSk7XG4gIHN0YXRlLmxhc3REZXN0cyA9IFtrZXldO1xuICBzdGF0ZS5sYXN0UGllY2UgPSBwaWVjZTtcbiAgc3RhdGUuY2hlY2tzID0gdW5kZWZpbmVkO1xuICBpZiAoIXNwYXJlKSByZW1vdmVGcm9tSGFuZChzdGF0ZSwgcGllY2UpO1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5kcm9wLCBwaWVjZSwga2V5LCBwcm9tKTtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuY2hhbmdlKTtcbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGJhc2VVc2VyTW92ZShcbiAgc3RhdGU6IEhlYWRsZXNzU3RhdGUsXG4gIG9yaWc6IHNnLktleSxcbiAgZGVzdDogc2cuS2V5LFxuICBwcm9tOiBib29sZWFuLFxuKTogc2cuUGllY2UgfCBib29sZWFuIHtcbiAgY29uc3QgcmVzdWx0ID0gYmFzZU1vdmUoc3RhdGUsIG9yaWcsIGRlc3QsIHByb20pO1xuICBpZiAocmVzdWx0KSB7XG4gICAgc3RhdGUubW92YWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kcm9wcGFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUudHVybkNvbG9yID0gb3Bwb3NpdGUoc3RhdGUudHVybkNvbG9yKTtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBiYXNlVXNlckRyb3Aoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb206IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgY29uc3QgcmVzdWx0ID0gYmFzZURyb3Aoc3RhdGUsIHBpZWNlLCBrZXksIHByb20pO1xuICBpZiAocmVzdWx0KSB7XG4gICAgc3RhdGUubW92YWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kcm9wcGFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUudHVybkNvbG9yID0gb3Bwb3NpdGUoc3RhdGUudHVybkNvbG9yKTtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlckRyb3AoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBwaWVjZTogc2cuUGllY2UsXG4gIGtleTogc2cuS2V5LFxuICBwcm9tPzogYm9vbGVhbixcbik6IGJvb2xlYW4ge1xuICBjb25zdCByZWFsUHJvbSA9IHByb20gfHwgc3RhdGUucHJvbW90aW9uLmZvcmNlRHJvcFByb21vdGlvbihwaWVjZSwga2V5KTtcbiAgaWYgKGNhbkRyb3Aoc3RhdGUsIHBpZWNlLCBrZXkpKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYmFzZVVzZXJEcm9wKHN0YXRlLCBwaWVjZSwga2V5LCByZWFsUHJvbSk7XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5kcm9wcGFibGUuZXZlbnRzLmFmdGVyLCBwaWVjZSwga2V5LCByZWFsUHJvbSwgeyBwcmVtYWRlOiBmYWxzZSB9KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSBlbHNlIGlmIChjYW5QcmVkcm9wKHN0YXRlLCBwaWVjZSwga2V5KSkge1xuICAgIHNldFByZWRyb3Aoc3RhdGUsIHBpZWNlLCBrZXksIHJlYWxQcm9tKTtcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgdW5zZWxlY3Qoc3RhdGUpO1xuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VyTW92ZShcbiAgc3RhdGU6IEhlYWRsZXNzU3RhdGUsXG4gIG9yaWc6IHNnLktleSxcbiAgZGVzdDogc2cuS2V5LFxuICBwcm9tPzogYm9vbGVhbixcbik6IGJvb2xlYW4ge1xuICBjb25zdCByZWFsUHJvbSA9IHByb20gfHwgc3RhdGUucHJvbW90aW9uLmZvcmNlTW92ZVByb21vdGlvbihvcmlnLCBkZXN0KTtcbiAgaWYgKGNhbk1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYmFzZVVzZXJNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0LCByZWFsUHJvbSk7XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgICAgY29uc3QgbWV0YWRhdGE6IHNnLk1vdmVNZXRhZGF0YSA9IHsgcHJlbWFkZTogZmFsc2UgfTtcbiAgICAgIGlmIChyZXN1bHQgIT09IHRydWUpIG1ldGFkYXRhLmNhcHR1cmVkID0gcmVzdWx0O1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5tb3ZhYmxlLmV2ZW50cy5hZnRlciwgb3JpZywgZGVzdCwgcmVhbFByb20sIG1ldGFkYXRhKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSBlbHNlIGlmIChjYW5QcmVtb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSkge1xuICAgIHNldFByZW1vdmUoc3RhdGUsIG9yaWcsIGRlc3QsIHJlYWxQcm9tKTtcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgdW5zZWxlY3Qoc3RhdGUpO1xuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYXNlUHJvbW90aW9uRGlhbG9nKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHByb21vdGVkUGllY2UgPSBwcm9tb3RlUGllY2Uoc3RhdGUsIHBpZWNlKTtcbiAgaWYgKHN0YXRlLnZpZXdPbmx5IHx8IHN0YXRlLnByb21vdGlvbi5jdXJyZW50IHx8ICFwcm9tb3RlZFBpZWNlKSByZXR1cm4gZmFsc2U7XG5cbiAgc3RhdGUucHJvbW90aW9uLmN1cnJlbnQgPSB7IHBpZWNlLCBwcm9tb3RlZFBpZWNlLCBrZXksIGRyYWdnZWQ6ICEhc3RhdGUuZHJhZ2dhYmxlLmN1cnJlbnQgfTtcbiAgc3RhdGUuaG92ZXJlZCA9IGtleTtcblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb21vdGlvbkRpYWxvZ0Ryb3Aoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgaWYgKFxuICAgIGNhbkRyb3BQcm9tb3RlKHN0YXRlLCBwaWVjZSwga2V5KSAmJlxuICAgIChjYW5Ecm9wKHN0YXRlLCBwaWVjZSwga2V5KSB8fCBjYW5QcmVkcm9wKHN0YXRlLCBwaWVjZSwga2V5KSlcbiAgKSB7XG4gICAgaWYgKGJhc2VQcm9tb3Rpb25EaWFsb2coc3RhdGUsIHBpZWNlLCBrZXkpKSB7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByb21vdGlvbi5ldmVudHMuaW5pdGlhdGVkKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9tb3Rpb25EaWFsb2dNb3ZlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSk6IGJvb2xlYW4ge1xuICBpZiAoXG4gICAgY2FuTW92ZVByb21vdGUoc3RhdGUsIG9yaWcsIGRlc3QpICYmXG4gICAgKGNhbk1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpIHx8IGNhblByZW1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpKVxuICApIHtcbiAgICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQob3JpZyk7XG4gICAgaWYgKHBpZWNlICYmIGJhc2VQcm9tb3Rpb25EaWFsb2coc3RhdGUsIHBpZWNlLCBkZXN0KSkge1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcm9tb3Rpb24uZXZlbnRzLmluaXRpYXRlZCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBwcm9tb3RlUGllY2UoczogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlKTogc2cuUGllY2UgfCB1bmRlZmluZWQge1xuICBjb25zdCBwcm9tUm9sZSA9IHMucHJvbW90aW9uLnByb21vdGVzVG8ocGllY2Uucm9sZSk7XG4gIHJldHVybiBwcm9tUm9sZSAhPT0gdW5kZWZpbmVkID8geyBjb2xvcjogcGllY2UuY29sb3IsIHJvbGU6IHByb21Sb2xlIH0gOiB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWxldGVQaWVjZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwga2V5OiBzZy5LZXkpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLnBpZWNlcy5kZWxldGUoa2V5KSkge1xuICAgIGNsZWFyUHJlRGVzdHMoc3RhdGUpO1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdFNxdWFyZShcbiAgc3RhdGU6IEhlYWRsZXNzU3RhdGUsXG4gIGtleTogc2cuS2V5LFxuICBwcm9tPzogYm9vbGVhbixcbiAgZm9yY2U/OiBib29sZWFuLFxuKTogdm9pZCB7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLnNlbGVjdCwga2V5KTtcblxuICAvLyB1bnNlbGVjdCBpZiBzZWxlY3Rpbmcgc2VsZWN0ZWQga2V5LCBrZWVwIHNlbGVjdGVkIGZvciBkcmFnXG4gIGlmICghc3RhdGUuZHJhZ2dhYmxlLmVuYWJsZWQgJiYgc3RhdGUuc2VsZWN0ZWQgPT09IGtleSkge1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLnVuc2VsZWN0LCBrZXkpO1xuICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyB0cnkgbW92aW5nL2Ryb3BwaW5nXG4gIGlmIChcbiAgICBzdGF0ZS5zZWxlY3RhYmxlLmVuYWJsZWQgfHxcbiAgICBmb3JjZSB8fFxuICAgIChzdGF0ZS5zZWxlY3RhYmxlLmZvcmNlU3BhcmVzICYmIHN0YXRlLnNlbGVjdGVkUGllY2UgJiYgc3RhdGUuZHJvcHBhYmxlLnNwYXJlKVxuICApIHtcbiAgICBpZiAoc3RhdGUuc2VsZWN0ZWRQaWVjZSAmJiB1c2VyRHJvcChzdGF0ZSwgc3RhdGUuc2VsZWN0ZWRQaWVjZSwga2V5LCBwcm9tKSkgcmV0dXJuO1xuICAgIGVsc2UgaWYgKHN0YXRlLnNlbGVjdGVkICYmIHVzZXJNb3ZlKHN0YXRlLCBzdGF0ZS5zZWxlY3RlZCwga2V5LCBwcm9tKSkgcmV0dXJuO1xuICB9XG5cbiAgaWYgKFxuICAgIChzdGF0ZS5zZWxlY3RhYmxlLmVuYWJsZWQgfHwgc3RhdGUuZHJhZ2dhYmxlLmVuYWJsZWQgfHwgZm9yY2UpICYmXG4gICAgKGlzTW92YWJsZShzdGF0ZSwga2V5KSB8fCBpc1ByZW1vdmFibGUoc3RhdGUsIGtleSkpXG4gICkge1xuICAgIHNldFNlbGVjdGVkKHN0YXRlLCBrZXkpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RQaWVjZShcbiAgc3RhdGU6IEhlYWRsZXNzU3RhdGUsXG4gIHBpZWNlOiBzZy5QaWVjZSxcbiAgc3BhcmU/OiBib29sZWFuLFxuICBmb3JjZT86IGJvb2xlYW4sXG4gIGFwaT86IGJvb2xlYW4sXG4pOiB2b2lkIHtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMucGllY2VTZWxlY3QsIHBpZWNlKTtcblxuICBpZiAoc3RhdGUuc2VsZWN0YWJsZS5hZGRTcGFyZXNUb0hhbmQgJiYgc3RhdGUuZHJvcHBhYmxlLnNwYXJlICYmIHN0YXRlLnNlbGVjdGVkUGllY2UpIHtcbiAgICBhZGRUb0hhbmQoc3RhdGUsIHsgcm9sZTogc3RhdGUuc2VsZWN0ZWRQaWVjZS5yb2xlLCBjb2xvcjogcGllY2UuY29sb3IgfSk7XG4gICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuY2hhbmdlKTtcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gIH0gZWxzZSBpZiAoXG4gICAgIWFwaSAmJlxuICAgICFzdGF0ZS5kcmFnZ2FibGUuZW5hYmxlZCAmJlxuICAgIHN0YXRlLnNlbGVjdGVkUGllY2UgJiZcbiAgICBzYW1lUGllY2Uoc3RhdGUuc2VsZWN0ZWRQaWVjZSwgcGllY2UpXG4gICkge1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLnBpZWNlVW5zZWxlY3QsIHBpZWNlKTtcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gIH0gZWxzZSBpZiAoXG4gICAgKHN0YXRlLnNlbGVjdGFibGUuZW5hYmxlZCB8fCBzdGF0ZS5kcmFnZ2FibGUuZW5hYmxlZCB8fCBmb3JjZSkgJiZcbiAgICAoaXNEcm9wcGFibGUoc3RhdGUsIHBpZWNlLCAhIXNwYXJlKSB8fCBpc1ByZWRyb3BwYWJsZShzdGF0ZSwgcGllY2UpKVxuICApIHtcbiAgICBzZXRTZWxlY3RlZFBpZWNlKHN0YXRlLCBwaWVjZSk7XG4gICAgc3RhdGUuZHJvcHBhYmxlLnNwYXJlID0gISFzcGFyZTtcbiAgfSBlbHNlIHtcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFNlbGVjdGVkKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBrZXk6IHNnLktleSk6IHZvaWQge1xuICB1bnNlbGVjdChzdGF0ZSk7XG4gIHN0YXRlLnNlbGVjdGVkID0ga2V5O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0U2VsZWN0ZWRQaWVjZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlKTogdm9pZCB7XG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgc3RhdGUuc2VsZWN0ZWRQaWVjZSA9IHBpZWNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJQcmVEZXN0cyhzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICBzdGF0ZS5wcmVtb3ZhYmxlLmRlc3RzID0gc3RhdGUucHJlZHJvcHBhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5zZWxlY3Qoc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiB2b2lkIHtcbiAgc3RhdGUuc2VsZWN0ZWQgPSBzdGF0ZS5zZWxlY3RlZFBpZWNlID0gdW5kZWZpbmVkO1xuICBzdGF0ZS5kcm9wcGFibGUuc3BhcmUgPSBmYWxzZTtcbiAgaWYgKHN0YXRlLnByb21vdGlvbi5jdXJyZW50KSB7XG4gICAgc3RhdGUucHJvbW90aW9uLmN1cnJlbnQgPSBzdGF0ZS5ob3ZlcmVkID0gdW5kZWZpbmVkO1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJvbW90aW9uLmV2ZW50cy5jYW5jZWwpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnNlbGVjdE1pc3NpbmdQaWVjZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICBpZiAoXG4gICAgKHN0YXRlLnNlbGVjdGVkICYmICFzdGF0ZS5waWVjZXMuaGFzKHN0YXRlLnNlbGVjdGVkKSkgfHxcbiAgICAoc3RhdGUuc2VsZWN0ZWRQaWVjZSAmJiAhc3RhdGUuZHJvcHBhYmxlLnNwYXJlICYmIG51bWJlckluSGFuZChzdGF0ZSwgc3RhdGUuc2VsZWN0ZWRQaWVjZSkgPD0gMClcbiAgKVxuICAgIHVuc2VsZWN0KHN0YXRlKTtcbn1cblxuZnVuY3Rpb24gaXNNb3ZhYmxlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBvcmlnOiBzZy5LZXkpOiBib29sZWFuIHtcbiAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXMuZ2V0KG9yaWcpO1xuICByZXR1cm4gKFxuICAgICEhcGllY2UgJiZcbiAgICAoc3RhdGUuYWN0aXZlQ29sb3IgPT09ICdib3RoJyB8fFxuICAgICAgKHN0YXRlLmFjdGl2ZUNvbG9yID09PSBwaWVjZS5jb2xvciAmJiBzdGF0ZS50dXJuQ29sb3IgPT09IHBpZWNlLmNvbG9yKSlcbiAgKTtcbn1cblxuZnVuY3Rpb24gaXNEcm9wcGFibGUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwgc3BhcmU6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICAoc3BhcmUgfHwgbnVtYmVySW5IYW5kKHN0YXRlLCBwaWVjZSkgPiAwKSAmJlxuICAgIChzdGF0ZS5hY3RpdmVDb2xvciA9PT0gJ2JvdGgnIHx8XG4gICAgICAoc3RhdGUuYWN0aXZlQ29sb3IgPT09IHBpZWNlLmNvbG9yICYmIHN0YXRlLnR1cm5Db2xvciA9PT0gcGllY2UuY29sb3IpKVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuTW92ZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgb3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBvcmlnICE9PSBkZXN0ICYmXG4gICAgaXNNb3ZhYmxlKHN0YXRlLCBvcmlnKSAmJlxuICAgIChzdGF0ZS5tb3ZhYmxlLmZyZWUgfHwgISFzdGF0ZS5tb3ZhYmxlLmRlc3RzPy5nZXQob3JpZyk/LmluY2x1ZGVzKGRlc3QpKVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuRHJvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBkZXN0OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBpc0Ryb3BwYWJsZShzdGF0ZSwgcGllY2UsIHN0YXRlLmRyb3BwYWJsZS5zcGFyZSkgJiZcbiAgICAoc3RhdGUuZHJvcHBhYmxlLmZyZWUgfHxcbiAgICAgIHN0YXRlLmRyb3BwYWJsZS5zcGFyZSB8fFxuICAgICAgISFzdGF0ZS5kcm9wcGFibGUuZGVzdHM/LmdldChwaWVjZU5hbWVPZihwaWVjZSkpPy5pbmNsdWRlcyhkZXN0KSlcbiAgKTtcbn1cblxuZnVuY3Rpb24gY2FuTW92ZVByb21vdGUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzLmdldChvcmlnKTtcbiAgcmV0dXJuICEhcGllY2UgJiYgc3RhdGUucHJvbW90aW9uLm1vdmVQcm9tb3Rpb25EaWFsb2cob3JpZywgZGVzdCk7XG59XG5cbmZ1bmN0aW9uIGNhbkRyb3BQcm9tb3RlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5KTogYm9vbGVhbiB7XG4gIHJldHVybiAhc3RhdGUuZHJvcHBhYmxlLnNwYXJlICYmIHN0YXRlLnByb21vdGlvbi5kcm9wUHJvbW90aW9uRGlhbG9nKHBpZWNlLCBrZXkpO1xufVxuXG5mdW5jdGlvbiBpc1ByZW1vdmFibGUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQob3JpZyk7XG4gIHJldHVybiAoXG4gICAgISFwaWVjZSAmJlxuICAgIHN0YXRlLnByZW1vdmFibGUuZW5hYmxlZCAmJlxuICAgIHN0YXRlLmFjdGl2ZUNvbG9yID09PSBwaWVjZS5jb2xvciAmJlxuICAgIHN0YXRlLnR1cm5Db2xvciAhPT0gcGllY2UuY29sb3JcbiAgKTtcbn1cblxuZnVuY3Rpb24gaXNQcmVkcm9wcGFibGUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIG51bWJlckluSGFuZChzdGF0ZSwgcGllY2UpID4gMCAmJlxuICAgIHN0YXRlLnByZWRyb3BwYWJsZS5lbmFibGVkICYmXG4gICAgc3RhdGUuYWN0aXZlQ29sb3IgPT09IHBpZWNlLmNvbG9yICYmXG4gICAgc3RhdGUudHVybkNvbG9yICE9PSBwaWVjZS5jb2xvclxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJlbW92ZURlc3RzKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBvcmlnOiBzZy5LZXkpOiBzZy5LZXlbXSB7XG4gIGlmICghaXNQcmVtb3ZhYmxlKHN0YXRlLCBvcmlnKSB8fCAhc3RhdGUucHJlbW92YWJsZS5nZW5lcmF0ZSkgcmV0dXJuIFtdO1xuICBpZiAoIXN0YXRlLnByZW1vdmFibGUuZGVzdHMpIHN0YXRlLnByZW1vdmFibGUuZGVzdHMgPSBuZXcgTWFwKCk7XG4gIGxldCBkZXN0cyA9IHN0YXRlLnByZW1vdmFibGUuZGVzdHMuZ2V0KG9yaWcpO1xuICBpZiAoIWRlc3RzKSB7XG4gICAgZGVzdHMgPSBzdGF0ZS5wcmVtb3ZhYmxlLmdlbmVyYXRlKG9yaWcsIHN0YXRlLnBpZWNlcyk7XG4gICAgc3RhdGUucHJlbW92YWJsZS5kZXN0cy5zZXQob3JpZywgZGVzdHMpO1xuICB9XG4gIHJldHVybiBkZXN0cztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByZWRyb3BEZXN0cyhzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlKTogc2cuS2V5W10ge1xuICBpZiAoIWlzUHJlZHJvcHBhYmxlKHN0YXRlLCBwaWVjZSkgfHwgIXN0YXRlLnByZWRyb3BwYWJsZS5nZW5lcmF0ZSkgcmV0dXJuIFtdO1xuICBpZiAoIXN0YXRlLnByZWRyb3BwYWJsZS5kZXN0cykgc3RhdGUucHJlZHJvcHBhYmxlLmRlc3RzID0gbmV3IE1hcCgpO1xuICBjb25zdCBuYW1lID0gcGllY2VOYW1lT2YocGllY2UpO1xuICBsZXQgZGVzdHMgPSBzdGF0ZS5wcmVkcm9wcGFibGUuZGVzdHMuZ2V0KG5hbWUpO1xuICBpZiAoIWRlc3RzKSB7XG4gICAgZGVzdHMgPSBzdGF0ZS5wcmVkcm9wcGFibGUuZ2VuZXJhdGUocGllY2UsIHN0YXRlLnBpZWNlcyk7XG4gICAgc3RhdGUucHJlZHJvcHBhYmxlLmRlc3RzLnNldChuYW1lLCBkZXN0cyk7XG4gIH1cbiAgcmV0dXJuIGRlc3RzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuUHJlbW92ZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgb3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgcmV0dXJuIG9yaWcgIT09IGRlc3QgJiYgcHJlbW92ZURlc3RzKHN0YXRlLCBvcmlnKS5pbmNsdWRlcyhkZXN0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhblByZWRyb3Aoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwgZGVzdDogc2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IGRlc3RQaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQoZGVzdCk7XG4gIHJldHVybiAoXG4gICAgKCFkZXN0UGllY2UgfHwgZGVzdFBpZWNlLmNvbG9yICE9PSBzdGF0ZS5hY3RpdmVDb2xvcikgJiZcbiAgICBwcmVkcm9wRGVzdHMoc3RhdGUsIHBpZWNlKS5pbmNsdWRlcyhkZXN0KVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEcmFnZ2FibGUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwgZnJvbUhhbmQgPSBmYWxzZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIHN0YXRlLmRyYWdnYWJsZS5lbmFibGVkICYmXG4gICAgKHN0YXRlLmFjdGl2ZUNvbG9yID09PSAnYm90aCcgfHxcbiAgICAgIChzdGF0ZS5hY3RpdmVDb2xvciA9PT0gcGllY2UuY29sb3IgJiZcbiAgICAgICAgKHN0YXRlLnR1cm5Db2xvciA9PT0gcGllY2UuY29sb3IgfHxcbiAgICAgICAgICAoZnJvbUhhbmQgPyBzdGF0ZS5wcmVkcm9wcGFibGUuZW5hYmxlZCA6IHN0YXRlLnByZW1vdmFibGUuZW5hYmxlZCkpKSlcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBsYXlQcmVtb3ZlKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogYm9vbGVhbiB7XG4gIGNvbnN0IG1vdmUgPSBzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQ7XG4gIGlmICghbW92ZSkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBvcmlnID0gbW92ZS5vcmlnO1xuICBjb25zdCBkZXN0ID0gbW92ZS5kZXN0O1xuICBjb25zdCBwcm9tID0gbW92ZS5wcm9tO1xuICBsZXQgc3VjY2VzcyA9IGZhbHNlO1xuICBpZiAoY2FuTW92ZShzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICBjb25zdCByZXN1bHQgPSBiYXNlVXNlck1vdmUoc3RhdGUsIG9yaWcsIGRlc3QsIHByb20pO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIGNvbnN0IG1ldGFkYXRhOiBzZy5Nb3ZlTWV0YWRhdGEgPSB7IHByZW1hZGU6IHRydWUgfTtcbiAgICAgIGlmIChyZXN1bHQgIT09IHRydWUpIG1ldGFkYXRhLmNhcHR1cmVkID0gcmVzdWx0O1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5tb3ZhYmxlLmV2ZW50cy5hZnRlciwgb3JpZywgZGVzdCwgcHJvbSwgbWV0YWRhdGEpO1xuICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgfVxuICB9XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHJldHVybiBzdWNjZXNzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGxheVByZWRyb3Aoc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiBib29sZWFuIHtcbiAgY29uc3QgZHJvcCA9IHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50O1xuICBpZiAoIWRyb3ApIHJldHVybiBmYWxzZTtcbiAgY29uc3QgcGllY2UgPSBkcm9wLnBpZWNlO1xuICBjb25zdCBrZXkgPSBkcm9wLmtleTtcbiAgY29uc3QgcHJvbSA9IGRyb3AucHJvbTtcbiAgbGV0IHN1Y2Nlc3MgPSBmYWxzZTtcbiAgaWYgKGNhbkRyb3Aoc3RhdGUsIHBpZWNlLCBrZXkpKSB7XG4gICAgaWYgKGJhc2VVc2VyRHJvcChzdGF0ZSwgcGllY2UsIGtleSwgcHJvbSkpIHtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZHJvcHBhYmxlLmV2ZW50cy5hZnRlciwgcGllY2UsIGtleSwgcHJvbSwgeyBwcmVtYWRlOiB0cnVlIH0pO1xuICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgfVxuICB9XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIHJldHVybiBzdWNjZXNzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsTW92ZU9yRHJvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICB1bnNldFByZWRyb3Aoc3RhdGUpO1xuICB1bnNlbGVjdChzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdG9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIHN0YXRlLmFjdGl2ZUNvbG9yID1cbiAgICBzdGF0ZS5tb3ZhYmxlLmRlc3RzID1cbiAgICBzdGF0ZS5kcm9wcGFibGUuZGVzdHMgPVxuICAgIHN0YXRlLmRyYWdnYWJsZS5jdXJyZW50ID1cbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9XG4gICAgc3RhdGUuaG92ZXJlZCA9XG4gICAgICB1bmRlZmluZWQ7XG4gIGNhbmNlbE1vdmVPckRyb3Aoc3RhdGUpO1xufVxuIiwgImltcG9ydCB7IGZpbGVzLCByYW5rcyB9IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyBwb3Mya2V5IH0gZnJvbSAnLi91dGlsLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGluZmVyRGltZW5zaW9ucyhib2FyZFNmZW46IHNnLkJvYXJkU2Zlbik6IHNnLkRpbWVuc2lvbnMge1xuICBjb25zdCByYW5rcyA9IGJvYXJkU2Zlbi5zcGxpdCgvWyBfXS8sIDEpWzBdLnNwbGl0KCcvJyk7XG4gIGNvbnN0IGZpcnN0RmlsZSA9IHJhbmtzWzBdLnNwbGl0KCcnKTtcbiAgbGV0IGZpbGVzQ250ID0gMDtcbiAgbGV0IGNudCA9IDA7XG4gIGZvciAoY29uc3QgYyBvZiBmaXJzdEZpbGUpIHtcbiAgICBjb25zdCBuYiA9IGMuY2hhckNvZGVBdCgwKTtcbiAgICBpZiAobmIgPCA1OCAmJiBuYiA+IDQ3KSBjbnQgPSBjbnQgKiAxMCArIG5iIC0gNDg7XG4gICAgZWxzZSBpZiAoYyAhPT0gJysnKSB7XG4gICAgICBmaWxlc0NudCArPSBjbnQgKyAxO1xuICAgICAgY250ID0gMDtcbiAgICB9XG4gIH1cbiAgZmlsZXNDbnQgKz0gY250O1xuICByZXR1cm4geyBmaWxlczogZmlsZXNDbnQsIHJhbmtzOiByYW5rcy5sZW5ndGggfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNmZW5Ub0JvYXJkKFxuICBzZmVuOiBzZy5Cb2FyZFNmZW4sXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGZyb21Gb3JzeXRoPzogKGZvcnN5dGg6IHN0cmluZykgPT4gc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZCxcbik6IHNnLlBpZWNlcyB7XG4gIGNvbnN0IHNmZW5QYXJzZXIgPSBmcm9tRm9yc3l0aCB8fCBzdGFuZGFyZEZyb21Gb3JzeXRoO1xuICBjb25zdCBwaWVjZXM6IHNnLlBpZWNlcyA9IG5ldyBNYXAoKTtcbiAgbGV0IHggPSBkaW1zLmZpbGVzIC0gMTtcbiAgbGV0IHkgPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHNmZW4ubGVuZ3RoOyBpKyspIHtcbiAgICBzd2l0Y2ggKHNmZW5baV0pIHtcbiAgICAgIGNhc2UgJyAnOlxuICAgICAgY2FzZSAnXyc6XG4gICAgICAgIHJldHVybiBwaWVjZXM7XG4gICAgICBjYXNlICcvJzpcbiAgICAgICAgKyt5O1xuICAgICAgICBpZiAoeSA+IGRpbXMucmFua3MgLSAxKSByZXR1cm4gcGllY2VzO1xuICAgICAgICB4ID0gZGltcy5maWxlcyAtIDE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDoge1xuICAgICAgICBjb25zdCBuYjEgPSBzZmVuW2ldLmNoYXJDb2RlQXQoMCk7XG4gICAgICAgIGNvbnN0IG5iMiA9IHNmZW5baSArIDFdICYmIHNmZW5baSArIDFdLmNoYXJDb2RlQXQoMCk7XG4gICAgICAgIGlmIChuYjEgPCA1OCAmJiBuYjEgPiA0Nykge1xuICAgICAgICAgIGlmIChuYjIgJiYgbmIyIDwgNTggJiYgbmIyID4gNDcpIHtcbiAgICAgICAgICAgIHggLT0gKG5iMSAtIDQ4KSAqIDEwICsgKG5iMiAtIDQ4KTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICB9IGVsc2UgeCAtPSBuYjEgLSA0ODtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCByb2xlU3RyID0gc2ZlbltpXSA9PT0gJysnICYmIHNmZW4ubGVuZ3RoID4gaSArIDEgPyBgKyR7c2ZlblsrK2ldfWAgOiBzZmVuW2ldO1xuICAgICAgICAgIGNvbnN0IHJvbGUgPSBzZmVuUGFyc2VyKHJvbGVTdHIpO1xuICAgICAgICAgIGlmICh4ID49IDAgJiYgcm9sZSkge1xuICAgICAgICAgICAgY29uc3QgY29sb3IgPSByb2xlU3RyID09PSByb2xlU3RyLnRvTG93ZXJDYXNlKCkgPyAnZ290ZScgOiAnc2VudGUnO1xuICAgICAgICAgICAgcGllY2VzLnNldChwb3Mya2V5KFt4LCB5XSksIHtcbiAgICAgICAgICAgICAgcm9sZTogcm9sZSxcbiAgICAgICAgICAgICAgY29sb3I6IGNvbG9yLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC0teDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcGllY2VzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYm9hcmRUb1NmZW4oXG4gIHBpZWNlczogc2cuUGllY2VzLFxuICBkaW1zOiBzZy5EaW1lbnNpb25zLFxuICB0b0ZvcnN5dGg/OiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc3RyaW5nIHwgdW5kZWZpbmVkLFxuKTogc2cuQm9hcmRTZmVuIHtcbiAgY29uc3Qgc2ZlblJlbmRlcmVyID0gdG9Gb3JzeXRoIHx8IHN0YW5kYXJkVG9Gb3JzeXRoO1xuICBjb25zdCByZXZlcnNlZEZpbGVzID0gZmlsZXMuc2xpY2UoMCwgZGltcy5maWxlcykucmV2ZXJzZSgpO1xuICByZXR1cm4gcmFua3NcbiAgICAuc2xpY2UoMCwgZGltcy5yYW5rcylcbiAgICAubWFwKCh5KSA9PlxuICAgICAgcmV2ZXJzZWRGaWxlc1xuICAgICAgICAubWFwKCh4KSA9PiB7XG4gICAgICAgICAgY29uc3QgcGllY2UgPSBwaWVjZXMuZ2V0KCh4ICsgeSkgYXMgc2cuS2V5KTtcbiAgICAgICAgICBjb25zdCBmb3JzeXRoID0gcGllY2UgJiYgc2ZlblJlbmRlcmVyKHBpZWNlLnJvbGUpO1xuICAgICAgICAgIGlmIChmb3JzeXRoKSB7XG4gICAgICAgICAgICByZXR1cm4gcGllY2UuY29sb3IgPT09ICdzZW50ZScgPyBmb3JzeXRoLnRvVXBwZXJDYXNlKCkgOiBmb3JzeXRoLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgfSBlbHNlIHJldHVybiAnMSc7XG4gICAgICAgIH0pXG4gICAgICAgIC5qb2luKCcnKSxcbiAgICApXG4gICAgLmpvaW4oJy8nKVxuICAgIC5yZXBsYWNlKC8xezIsfS9nLCAocykgPT4gcy5sZW5ndGgudG9TdHJpbmcoKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZmVuVG9IYW5kcyhcbiAgc2Zlbjogc2cuSGFuZHNTZmVuLFxuICBmcm9tRm9yc3l0aD86IChmb3JzeXRoOiBzdHJpbmcpID0+IHNnLlJvbGVTdHJpbmcgfCB1bmRlZmluZWQsXG4pOiBzZy5IYW5kcyB7XG4gIGNvbnN0IHNmZW5QYXJzZXIgPSBmcm9tRm9yc3l0aCB8fCBzdGFuZGFyZEZyb21Gb3JzeXRoO1xuICBjb25zdCBzZW50ZTogc2cuSGFuZCA9IG5ldyBNYXAoKTtcbiAgY29uc3QgZ290ZTogc2cuSGFuZCA9IG5ldyBNYXAoKTtcblxuICBsZXQgdG1wTnVtID0gMDtcbiAgbGV0IG51bSA9IDE7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2Zlbi5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IG5iID0gc2ZlbltpXS5jaGFyQ29kZUF0KDApO1xuICAgIGlmIChuYiA8IDU4ICYmIG5iID4gNDcpIHtcbiAgICAgIHRtcE51bSA9IHRtcE51bSAqIDEwICsgbmIgLSA0ODtcbiAgICAgIG51bSA9IHRtcE51bTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgcm9sZVN0ciA9IHNmZW5baV0gPT09ICcrJyAmJiBzZmVuLmxlbmd0aCA+IGkgKyAxID8gYCske3NmZW5bKytpXX1gIDogc2ZlbltpXTtcbiAgICAgIGNvbnN0IHJvbGUgPSBzZmVuUGFyc2VyKHJvbGVTdHIpO1xuICAgICAgaWYgKHJvbGUpIHtcbiAgICAgICAgY29uc3QgY29sb3IgPSByb2xlU3RyID09PSByb2xlU3RyLnRvTG93ZXJDYXNlKCkgPyAnZ290ZScgOiAnc2VudGUnO1xuICAgICAgICBpZiAoY29sb3IgPT09ICdzZW50ZScpIHNlbnRlLnNldChyb2xlLCAoc2VudGUuZ2V0KHJvbGUpIHx8IDApICsgbnVtKTtcbiAgICAgICAgZWxzZSBnb3RlLnNldChyb2xlLCAoZ290ZS5nZXQocm9sZSkgfHwgMCkgKyBudW0pO1xuICAgICAgfVxuICAgICAgdG1wTnVtID0gMDtcbiAgICAgIG51bSA9IDE7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBNYXAoW1xuICAgIFsnc2VudGUnLCBzZW50ZV0sXG4gICAgWydnb3RlJywgZ290ZV0sXG4gIF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFuZHNUb1NmZW4oXG4gIGhhbmRzOiBzZy5IYW5kcyxcbiAgcm9sZXM6IHNnLlJvbGVTdHJpbmdbXSxcbiAgdG9Gb3JzeXRoPzogKHJvbGU6IHNnLlJvbGVTdHJpbmcpID0+IHN0cmluZyB8IHVuZGVmaW5lZCxcbik6IHNnLkhhbmRzU2ZlbiB7XG4gIGNvbnN0IHNmZW5SZW5kZXJlciA9IHRvRm9yc3l0aCB8fCBzdGFuZGFyZFRvRm9yc3l0aDtcblxuICBsZXQgc2VudGVIYW5kU3RyID0gJyc7XG4gIGxldCBnb3RlSGFuZFN0ciA9ICcnO1xuICBmb3IgKGNvbnN0IHJvbGUgb2Ygcm9sZXMpIHtcbiAgICBjb25zdCBmb3JzeXRoID0gc2ZlblJlbmRlcmVyKHJvbGUpO1xuICAgIGlmIChmb3JzeXRoKSB7XG4gICAgICBjb25zdCBzZW50ZUNudCA9IGhhbmRzLmdldCgnc2VudGUnKT8uZ2V0KHJvbGUpO1xuICAgICAgY29uc3QgZ290ZUNudCA9IGhhbmRzLmdldCgnZ290ZScpPy5nZXQocm9sZSk7XG4gICAgICBpZiAoc2VudGVDbnQpIHNlbnRlSGFuZFN0ciArPSBzZW50ZUNudCA+IDEgPyBzZW50ZUNudC50b1N0cmluZygpICsgZm9yc3l0aCA6IGZvcnN5dGg7XG4gICAgICBpZiAoZ290ZUNudCkgZ290ZUhhbmRTdHIgKz0gZ290ZUNudCA+IDEgPyBnb3RlQ250LnRvU3RyaW5nKCkgKyBmb3JzeXRoIDogZm9yc3l0aDtcbiAgICB9XG4gIH1cbiAgaWYgKHNlbnRlSGFuZFN0ciB8fCBnb3RlSGFuZFN0cikgcmV0dXJuIHNlbnRlSGFuZFN0ci50b1VwcGVyQ2FzZSgpICsgZ290ZUhhbmRTdHIudG9Mb3dlckNhc2UoKTtcbiAgZWxzZSByZXR1cm4gJy0nO1xufVxuXG5mdW5jdGlvbiBzdGFuZGFyZEZyb21Gb3JzeXRoKGZvcnN5dGg6IHN0cmluZyk6IHNnLlJvbGVTdHJpbmcgfCB1bmRlZmluZWQge1xuICBzd2l0Y2ggKGZvcnN5dGgudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ3AnOlxuICAgICAgcmV0dXJuICdwYXduJztcbiAgICBjYXNlICdsJzpcbiAgICAgIHJldHVybiAnbGFuY2UnO1xuICAgIGNhc2UgJ24nOlxuICAgICAgcmV0dXJuICdrbmlnaHQnO1xuICAgIGNhc2UgJ3MnOlxuICAgICAgcmV0dXJuICdzaWx2ZXInO1xuICAgIGNhc2UgJ2cnOlxuICAgICAgcmV0dXJuICdnb2xkJztcbiAgICBjYXNlICdiJzpcbiAgICAgIHJldHVybiAnYmlzaG9wJztcbiAgICBjYXNlICdyJzpcbiAgICAgIHJldHVybiAncm9vayc7XG4gICAgY2FzZSAnK3AnOlxuICAgICAgcmV0dXJuICd0b2tpbic7XG4gICAgY2FzZSAnK2wnOlxuICAgICAgcmV0dXJuICdwcm9tb3RlZGxhbmNlJztcbiAgICBjYXNlICcrbic6XG4gICAgICByZXR1cm4gJ3Byb21vdGVka25pZ2h0JztcbiAgICBjYXNlICcrcyc6XG4gICAgICByZXR1cm4gJ3Byb21vdGVkc2lsdmVyJztcbiAgICBjYXNlICcrYic6XG4gICAgICByZXR1cm4gJ2hvcnNlJztcbiAgICBjYXNlICcrcic6XG4gICAgICByZXR1cm4gJ2RyYWdvbic7XG4gICAgY2FzZSAnayc6XG4gICAgICByZXR1cm4gJ2tpbmcnO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm47XG4gIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBzdGFuZGFyZFRvRm9yc3l0aChyb2xlOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICBzd2l0Y2ggKHJvbGUpIHtcbiAgICBjYXNlICdwYXduJzpcbiAgICAgIHJldHVybiAncCc7XG4gICAgY2FzZSAnbGFuY2UnOlxuICAgICAgcmV0dXJuICdsJztcbiAgICBjYXNlICdrbmlnaHQnOlxuICAgICAgcmV0dXJuICduJztcbiAgICBjYXNlICdzaWx2ZXInOlxuICAgICAgcmV0dXJuICdzJztcbiAgICBjYXNlICdnb2xkJzpcbiAgICAgIHJldHVybiAnZyc7XG4gICAgY2FzZSAnYmlzaG9wJzpcbiAgICAgIHJldHVybiAnYic7XG4gICAgY2FzZSAncm9vayc6XG4gICAgICByZXR1cm4gJ3InO1xuICAgIGNhc2UgJ3Rva2luJzpcbiAgICAgIHJldHVybiAnK3AnO1xuICAgIGNhc2UgJ3Byb21vdGVkbGFuY2UnOlxuICAgICAgcmV0dXJuICcrbCc7XG4gICAgY2FzZSAncHJvbW90ZWRrbmlnaHQnOlxuICAgICAgcmV0dXJuICcrbic7XG4gICAgY2FzZSAncHJvbW90ZWRzaWx2ZXInOlxuICAgICAgcmV0dXJuICcrcyc7XG4gICAgY2FzZSAnaG9yc2UnOlxuICAgICAgcmV0dXJuICcrYic7XG4gICAgY2FzZSAnZHJhZ29uJzpcbiAgICAgIHJldHVybiAnK3InO1xuICAgIGNhc2UgJ2tpbmcnOlxuICAgICAgcmV0dXJuICdrJztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgc2hvdWxkQW5pbWF0ZSB9IGZyb20gJy4vYW5pbS5qcyc7XG5pbXBvcnQgeyBjbGVhclByZURlc3RzLCBzZXRDaGVja3MsIHVuc2VsZWN0LCB1bnNlbGVjdE1pc3NpbmdQaWVjZSB9IGZyb20gJy4vYm9hcmQuanMnO1xuaW1wb3J0IHsgaW5mZXJEaW1lbnNpb25zLCBzZmVuVG9Cb2FyZCwgc2ZlblRvSGFuZHMgfSBmcm9tICcuL3NmZW4uanMnO1xuaW1wb3J0IHR5cGUgeyBIZWFkbGVzc1N0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgc2FtZVBpZWNlIH0gZnJvbSAnLi91dGlsLmpzJztcblxudHlwZSBEZWVwUGFydGlhbDxULCBBdG9taWMgPSBuZXZlcj4gPSBUIGV4dGVuZHNcbiAgfCBBdG9taWNcbiAgfCAoKC4uLmFyZ3M6IG5ldmVyW10pID0+IHVua25vd24pXG4gIHwgcmVhZG9ubHkgdW5rbm93bltdXG4gIHwgUmVhZG9ubHlNYXA8dW5rbm93biwgdW5rbm93bj5cbiAgfCBSZWFkb25seVNldDx1bmtub3duPlxuICA/IFRcbiAgOiBUIGV4dGVuZHMgb2JqZWN0XG4gICAgPyB7IFtLIGluIGtleW9mIFRdPzogRGVlcFBhcnRpYWw8VFtLXSwgQXRvbWljPiB9XG4gICAgOiBUO1xuXG4vLyBLZWVwIGludGVybmFsIGZpZWxkcyBvdXQgb2YgY29uZmlnLCBpbmNsdWRpbmcgdGhvc2UgbmVzdGVkIGFsb25nc2lkZSBvcHRpb25zLlxudHlwZSBDb25maWd1cmFibGVTdGF0ZSA9IE9taXQ8XG4gIEhlYWRsZXNzU3RhdGUsXG4gIHwgJ3BpZWNlcydcbiAgfCAnZGltZW5zaW9ucydcbiAgfCAnY2hlY2tzJ1xuICB8ICdob3ZlcmVkJ1xuICB8ICdhbmltYXRpb24nXG4gIHwgJ2hhbmRzJ1xuICB8ICdwcmVtb3ZhYmxlJ1xuICB8ICdwcmVkcm9wcGFibGUnXG4gIHwgJ2RyYWdnYWJsZSdcbiAgfCAna2V5Ym9hcmQnXG4gIHwgJ3Byb21vdGlvbidcbiAgfCAnZHJhd2FibGUnXG4+ICYge1xuICBhbmltYXRpb246IE9taXQ8SGVhZGxlc3NTdGF0ZVsnYW5pbWF0aW9uJ10sICdjdXJyZW50Jz47XG4gIGhhbmRzOiBPbWl0PEhlYWRsZXNzU3RhdGVbJ2hhbmRzJ10sICdoYW5kTWFwJz47XG4gIHByZW1vdmFibGU6IE9taXQ8SGVhZGxlc3NTdGF0ZVsncHJlbW92YWJsZSddLCAnY3VycmVudCcgfCAnZGVzdHMnPjtcbiAgcHJlZHJvcHBhYmxlOiBPbWl0PEhlYWRsZXNzU3RhdGVbJ3ByZWRyb3BwYWJsZSddLCAnY3VycmVudCcgfCAnZGVzdHMnPjtcbiAgZHJhZ2dhYmxlOiBPbWl0PEhlYWRsZXNzU3RhdGVbJ2RyYWdnYWJsZSddLCAnY3VycmVudCc+O1xuICBrZXlib2FyZDogUGljazxIZWFkbGVzc1N0YXRlWydrZXlib2FyZCddLCAnZW5hYmxlZCcgfCAnYXJpYUxhYmVsJz47XG4gIHByb21vdGlvbjogT21pdDxIZWFkbGVzc1N0YXRlWydwcm9tb3Rpb24nXSwgJ2N1cnJlbnQnIHwgJ3ByZXZQcm9tb3Rpb25IYXNoJz47XG4gIGRyYXdhYmxlOiBPbWl0PEhlYWRsZXNzU3RhdGVbJ2RyYXdhYmxlJ10sICdjdXJyZW50JyB8ICdwcmV2U3ZnSGFzaCcgfCAncGllY2UnPjtcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29uZmlnIGV4dGVuZHMgRGVlcFBhcnRpYWw8Q29uZmlndXJhYmxlU3RhdGUsIHNnLlBpZWNlPiB7XG4gIHNmZW4/OiB7XG4gICAgYm9hcmQ/OiBzZy5Cb2FyZFNmZW47IC8vIHBpZWNlcyBvbiB0aGUgYm9hcmQgaW4gRm9yc3l0aCBub3RhdGlvblxuICAgIGhhbmRzPzogc2cuSGFuZHNTZmVuOyAvLyBwaWVjZXMgaW4gaGFuZCBpbiBGb3JzeXRoIG5vdGF0aW9uXG4gIH07XG4gIGNoZWNrcz86IHNnLktleVtdIHwgc2cuQ29sb3IgfCBib29sZWFuOyAvLyBzcXVhcmVzIGN1cnJlbnRseSBpbiBjaGVjayBbXCI1YVwiXSwgY29sb3IgaW4gY2hlY2sgKHNlZSBoaWdobGlnaHQuY2hlY2tSb2xlcykgb3IgYm9vbGVhbiBmb3IgY3VycmVudCB0dXJuIGNvbG9yXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseUFuaW1hdGlvbihzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgY29uZmlnOiBDb25maWcpOiB2b2lkIHtcbiAgaWYgKGNvbmZpZy5hbmltYXRpb24pIHtcbiAgICBkZWVwTWVyZ2Uoc3RhdGUuYW5pbWF0aW9uLCBjb25maWcuYW5pbWF0aW9uKTtcbiAgICBpZiAoIXNob3VsZEFuaW1hdGUoc3RhdGUuYW5pbWF0aW9uKSkgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmZpZ3VyZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgY29uZmlnOiBDb25maWcpOiB2b2lkIHtcbiAgLy8gZG9uJ3QgbWVyZ2UsIGp1c3Qgb3ZlcnJpZGUuXG4gIGlmIChjb25maWcubW92YWJsZT8uZGVzdHMpIHN0YXRlLm1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gIGlmIChjb25maWcuZHJvcHBhYmxlPy5kZXN0cykgc3RhdGUuZHJvcHBhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICBpZiAoY29uZmlnLmRyYXdhYmxlPy5zcXVhcmVzKSBzdGF0ZS5kcmF3YWJsZS5zcXVhcmVzID0gW107XG4gIGlmIChjb25maWcuaGFuZHM/LnJvbGVzKSBzdGF0ZS5oYW5kcy5yb2xlcyA9IFtdO1xuXG4gIGRlZXBNZXJnZShzdGF0ZSwgY29uZmlnKTtcblxuICBjb25zdCB7IHNoYXBlcywgYXV0b1NoYXBlcyB9ID0gY29uZmlnLmRyYXdhYmxlID8/IHt9O1xuICBpZiAoc2hhcGVzKSBzdGF0ZS5kcmF3YWJsZS5zaGFwZXMgPSBzaGFwZXMuc2xpY2UoKTtcbiAgaWYgKGF1dG9TaGFwZXMpIHN0YXRlLmRyYXdhYmxlLmF1dG9TaGFwZXMgPSBhdXRvU2hhcGVzLnNsaWNlKCk7XG5cbiAgLy8gaWYgYSBzZmVuIHdhcyBwcm92aWRlZCwgcmVwbGFjZSB0aGUgcGllY2VzLCBleGNlcHQgdGhlIGN1cnJlbnRseSBkcmFnZ2VkIG9uZVxuICBpZiAoY29uZmlnLnNmZW4/LmJvYXJkKSB7XG4gICAgc3RhdGUuZGltZW5zaW9ucyA9IGluZmVyRGltZW5zaW9ucyhjb25maWcuc2Zlbi5ib2FyZCk7XG4gICAgc3RhdGUucGllY2VzID0gc2ZlblRvQm9hcmQoY29uZmlnLnNmZW4uYm9hcmQsIHN0YXRlLmRpbWVuc2lvbnMsIHN0YXRlLmZvcnN5dGguZnJvbUZvcnN5dGgpO1xuICAgIGlmIChzdGF0ZS5wcm9tb3Rpb24uY3VycmVudCkge1xuICAgICAgLy8gS2VlcCBwZW5kaW5nIHByZW1vdmUgcHJvbW90aW9uIHdoZW4gdGhlIHNlbGVjdGVkIHBpZWNlIHN1cnZpdmVzIHRoZSB1cGRhdGUuXG4gICAgICBjb25zdCBwaWVjZSA9IHN0YXRlLnNlbGVjdGVkID8gc3RhdGUucGllY2VzLmdldChzdGF0ZS5zZWxlY3RlZCkgOiBzdGF0ZS5zZWxlY3RlZFBpZWNlO1xuICAgICAgaWYgKCFwaWVjZSB8fCAhc2FtZVBpZWNlKHBpZWNlLCBzdGF0ZS5wcm9tb3Rpb24uY3VycmVudC5waWVjZSkpIHVuc2VsZWN0KHN0YXRlKTtcbiAgICB9XG4gICAgaWYgKCFzaGFwZXMpIHN0YXRlLmRyYXdhYmxlLnNoYXBlcyA9IFtdO1xuICB9XG5cbiAgaWYgKGNvbmZpZy5zZmVuPy5oYW5kcykge1xuICAgIHN0YXRlLmhhbmRzLmhhbmRNYXAgPSBzZmVuVG9IYW5kcyhjb25maWcuc2Zlbi5oYW5kcywgc3RhdGUuZm9yc3l0aC5mcm9tRm9yc3l0aCk7XG4gIH1cbiAgaWYgKGNvbmZpZy5zZmVuPy5ib2FyZCB8fCBjb25maWcuc2Zlbj8uaGFuZHMpIHVuc2VsZWN0TWlzc2luZ1BpZWNlKHN0YXRlKTtcblxuICAvLyBhcHBseSBjb25maWcgdmFsdWVzIHRoYXQgY291bGQgYmUgdW5kZWZpbmVkIHlldCBtZWFuaW5nZnVsXG4gIGlmICgnY2hlY2tzJyBpbiBjb25maWcpIHNldENoZWNrcyhzdGF0ZSwgY29uZmlnLmNoZWNrcyB8fCBmYWxzZSk7XG4gIGlmICgnbGFzdFBpZWNlJyBpbiBjb25maWcgJiYgIWNvbmZpZy5sYXN0UGllY2UpIHN0YXRlLmxhc3RQaWVjZSA9IHVuZGVmaW5lZDtcblxuICAvLyBpbiBjYXNlIG9mIGRyb3AgbGFzdCBtb3ZlLCB0aGVyZSdzIGEgc2luZ2xlIHNxdWFyZS5cbiAgLy8gaWYgdGhlIHByZXZpb3VzIGxhc3QgbW92ZSBoYWQgdHdvIHNxdWFyZXMsXG4gIC8vIHRoZSBtZXJnZSBhbGdvcml0aG0gd2lsbCBpbmNvcnJlY3RseSBrZWVwIHRoZSBzZWNvbmQgc3F1YXJlLlxuICBpZiAoJ2xhc3REZXN0cycgaW4gY29uZmlnICYmICFjb25maWcubGFzdERlc3RzKSBzdGF0ZS5sYXN0RGVzdHMgPSB1bmRlZmluZWQ7XG4gIGVsc2UgaWYgKGNvbmZpZy5sYXN0RGVzdHMpIHN0YXRlLmxhc3REZXN0cyA9IGNvbmZpZy5sYXN0RGVzdHM7XG5cbiAgLy8gdGhlIGJvYXJkIG9yIGdlbmVyYXRvcnMgbWF5IGhhdmUgY2hhbmdlZFxuICBjbGVhclByZURlc3RzKHN0YXRlKTtcblxuICBhcHBseUFuaW1hdGlvbihzdGF0ZSwgY29uZmlnKTtcbn1cblxuZnVuY3Rpb24gZGVlcE1lcmdlKGJhc2U6IGFueSwgZXh0ZW5kOiBhbnkpOiB2b2lkIHtcbiAgZm9yIChjb25zdCBrZXkgaW4gZXh0ZW5kKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChleHRlbmQsIGtleSkpIHtcbiAgICAgIGlmIChcbiAgICAgICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGJhc2UsIGtleSkgJiZcbiAgICAgICAgaXNQbGFpbk9iamVjdChiYXNlW2tleV0pICYmXG4gICAgICAgIGlzUGxhaW5PYmplY3QoZXh0ZW5kW2tleV0pXG4gICAgICApXG4gICAgICAgIGRlZXBNZXJnZShiYXNlW2tleV0sIGV4dGVuZFtrZXldKTtcbiAgICAgIGVsc2UgYmFzZVtrZXldID0gZXh0ZW5kW2tleV07XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3QobzogdW5rbm93bik6IGJvb2xlYW4ge1xuICBpZiAodHlwZW9mIG8gIT09ICdvYmplY3QnIHx8IG8gPT09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgY29uc3QgcHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yobyk7XG4gIHJldHVybiBwcm90byA9PT0gT2JqZWN0LnByb3RvdHlwZSB8fCBwcm90byA9PT0gbnVsbDtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IERyYXdDdXJyZW50LCBEcmF3U2hhcGUsIERyYXdTaGFwZVBpZWNlIH0gZnJvbSAnLi9kcmF3LmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQge1xuICBjcmVhdGVFbCxcbiAga2V5MnBvcyxcbiAgcGllY2VOYW1lT2YsXG4gIHBvc09mT3V0c2lkZUVsLFxuICBwb3NUb1RyYW5zbGF0ZVJlbCxcbiAgc2FtZVBpZWNlLFxuICBzZW50ZVBvdixcbiAgdHJhbnNsYXRlUmVsLFxufSBmcm9tICcuL3V0aWwuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU1ZHRWxlbWVudCh0YWdOYW1lOiBzdHJpbmcpOiBTVkdFbGVtZW50IHtcbiAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCB0YWdOYW1lKTtcbn1cblxuaW50ZXJmYWNlIFNoYXBlIHtcbiAgc2hhcGU6IERyYXdTaGFwZTtcbiAgaGFzaDogSGFzaDtcbiAgY3VycmVudD86IGJvb2xlYW47XG59XG5cbnR5cGUgQXJyb3dEZXN0cyA9IE1hcDxzZy5LZXkgfCBzZy5QaWVjZU5hbWUsIG51bWJlcj47IC8vIGhvdyBtYW55IGFycm93cyBsYW5kIG9uIGEgc3F1YXJlXG5cbnR5cGUgSGFzaCA9IHN0cmluZztcblxuY29uc3Qgb3V0c2lkZUFycm93SGFzaCA9ICdvdXRzaWRlQXJyb3cnO1xuY29uc3QgZGVmYXVsdEJydXNoID0gJ3ByaW1hcnknO1xuY29uc3QgbWFya2VyUHJlZml4ZXMgPSBuZXcgV2Vha01hcDxTVkdFbGVtZW50LCBzdHJpbmc+KCk7XG5sZXQgbmV4dE1hcmtlclNjb3BlID0gMDtcblxuZnVuY3Rpb24gZ2V0TWFya2VyUHJlZml4KHN2ZzogU1ZHRWxlbWVudCk6IHN0cmluZyB7XG4gIGxldCBwcmVmaXggPSBtYXJrZXJQcmVmaXhlcy5nZXQoc3ZnKTtcbiAgaWYgKCFwcmVmaXgpIHtcbiAgICBwcmVmaXggPSBgc2ctYXJyb3doZWFkLSR7KytuZXh0TWFya2VyU2NvcGV9YDtcbiAgICBtYXJrZXJQcmVmaXhlcy5zZXQoc3ZnLCBwcmVmaXgpO1xuICB9XG4gIHJldHVybiBwcmVmaXg7XG59XG5cbmZ1bmN0aW9uIG1hcmtlcklkKHByZWZpeDogc3RyaW5nLCBicnVzaDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke3ByZWZpeH0tJHticnVzaCB8fCBkZWZhdWx0QnJ1c2h9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclNoYXBlcyhcbiAgc3RhdGU6IFN0YXRlLFxuICBzdmc6IFNWR0VsZW1lbnQsXG4gIGN1c3RvbVN2ZzogU1ZHRWxlbWVudCxcbiAgZnJlZVBpZWNlczogSFRNTEVsZW1lbnQsXG4pOiB2b2lkIHtcbiAgY29uc3QgZCA9IHN0YXRlLmRyYXdhYmxlO1xuICBjb25zdCBjdXJEID0gZC5jdXJyZW50O1xuICBjb25zdCBjdXIgPSBjdXJEPy5kZXN0ID8gKGN1ckQgYXMgRHJhd1NoYXBlKSA6IHVuZGVmaW5lZDtcbiAgY29uc3Qgb3V0c2lkZUFycm93ID0gISFjdXJEICYmICFjdXI7XG4gIGNvbnN0IGFycm93RGVzdHM6IEFycm93RGVzdHMgPSBuZXcgTWFwKCk7XG4gIGNvbnN0IHBpZWNlTWFwID0gbmV3IE1hcDxzZy5LZXksIERyYXdTaGFwZT4oKTtcblxuICBjb25zdCBoYXNoQm91bmRzID0gKHBpZWNlOiBzZy5QaWVjZSkgPT4ge1xuICAgIGNvbnN0IGJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gICAgY29uc3QgcGllY2VCb3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzKCkuZ2V0KHBpZWNlTmFtZU9mKHBpZWNlKSk7XG4gICAgcmV0dXJuIGJvdW5kcyAmJiBwaWVjZUJvdW5kc1xuICAgICAgPyBbXG4gICAgICAgICAgYm91bmRzLndpZHRoLFxuICAgICAgICAgIGJvdW5kcy5oZWlnaHQsXG4gICAgICAgICAgcGllY2VCb3VuZHMubGVmdCAtIGJvdW5kcy5sZWZ0LFxuICAgICAgICAgIHBpZWNlQm91bmRzLnRvcCAtIGJvdW5kcy50b3AsXG4gICAgICAgICAgcGllY2VCb3VuZHMud2lkdGgsXG4gICAgICAgICAgcGllY2VCb3VuZHMuaGVpZ2h0LFxuICAgICAgICBdLmpvaW4oJzonKVxuICAgICAgOiAnJztcbiAgfTtcblxuICBmb3IgKGNvbnN0IHMgb2YgZC5zaGFwZXMuY29uY2F0KGQuYXV0b1NoYXBlcykuY29uY2F0KGN1ciA/IFtjdXJdIDogW10pKSB7XG4gICAgY29uc3QgZGVzdE5hbWUgPSBpc1BpZWNlKHMuZGVzdCkgPyBwaWVjZU5hbWVPZihzLmRlc3QpIDogcy5kZXN0O1xuICAgIGlmICghc2FtZVBpZWNlT3JLZXkocy5kZXN0LCBzLm9yaWcpKVxuICAgICAgYXJyb3dEZXN0cy5zZXQoZGVzdE5hbWUsIChhcnJvd0Rlc3RzLmdldChkZXN0TmFtZSkgfHwgMCkgKyAxKTtcbiAgfVxuXG4gIGZvciAoY29uc3QgcyBvZiBkLnNoYXBlcy5jb25jYXQoY3VyID8gW2N1cl0gOiBbXSkuY29uY2F0KGQuYXV0b1NoYXBlcykpIHtcbiAgICBpZiAocy5waWVjZSAmJiAhaXNQaWVjZShzLm9yaWcpKSBwaWVjZU1hcC5zZXQocy5vcmlnLCBzKTtcbiAgfVxuICBjb25zdCBwaWVjZVNoYXBlcyA9IFsuLi5waWVjZU1hcC52YWx1ZXMoKV0ubWFwKChzKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNoYXBlOiBzLFxuICAgICAgaGFzaDogcGllY2VTaGFwZUhhc2gocywgc3RhdGUuc2NhbGVEb3duUGllY2VzKSxcbiAgICB9O1xuICB9KTtcblxuICBjb25zdCBzaGFwZXM6IFNoYXBlW10gPSBkLmF1dG9TaGFwZXMuY29uY2F0KGQuc2hhcGVzKS5tYXAoKHM6IERyYXdTaGFwZSkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBzaGFwZTogcyxcbiAgICAgIGhhc2g6IHMuY3VzdG9tU3ZnXG4gICAgICAgID8gY3VzdG9tU2hhcGVIYXNoKHMsIGhhc2hCb3VuZHMpXG4gICAgICAgIDogc2hhcGVIYXNoKHMsIGFycm93RGVzdHMsIGZhbHNlLCBoYXNoQm91bmRzKSxcbiAgICB9O1xuICB9KTtcbiAgaWYgKGN1cilcbiAgICBzaGFwZXMucHVzaCh7XG4gICAgICBzaGFwZTogY3VyLFxuICAgICAgaGFzaDogc2hhcGVIYXNoKGN1ciwgYXJyb3dEZXN0cywgdHJ1ZSwgaGFzaEJvdW5kcyksXG4gICAgICBjdXJyZW50OiB0cnVlLFxuICAgIH0pO1xuXG4gIGNvbnN0IGZ1bGxIYXNoID1cbiAgICBzaGFwZXMubWFwKChzYykgPT4gc2MuaGFzaCkuam9pbignOycpICtcbiAgICAob3V0c2lkZUFycm93ID8gb3V0c2lkZUFycm93SGFzaCA6ICcnKSArXG4gICAgc3RhdGUuc2NhbGVEb3duUGllY2VzO1xuICBpZiAoZnVsbEhhc2ggPT09IHN0YXRlLmRyYXdhYmxlLnByZXZTdmdIYXNoKSByZXR1cm47XG4gIHN0YXRlLmRyYXdhYmxlLnByZXZTdmdIYXNoID0gZnVsbEhhc2g7XG5cbiAgY29uc3QgbWFya2VyUHJlZml4ID0gZ2V0TWFya2VyUHJlZml4KHN2Zyk7XG5cbiAgLypcbiAgICAtLSBET00gaGllcmFyY2h5IC0tXG4gICAgPHN2ZyBjbGFzcz1cInNnLXNoYXBlc1wiPiAoPD0gc3ZnKVxuICAgICAgPGRlZnM+XG4gICAgICAgIC4uLihmb3IgYnJ1c2hlcykuLi5cbiAgICAgIDwvZGVmcz5cbiAgICAgIDxnPlxuICAgICAgICAuLi4oZm9yIGFycm93cyBhbmQgY2lyY2xlcykuLi5cbiAgICAgIDwvZz5cbiAgICA8L3N2Zz5cbiAgICA8c3ZnIGNsYXNzPVwic2ctY3VzdG9tLXN2Z3NcIj4gKDw9IGN1c3RvbVN2ZylcbiAgICAgIDxnPlxuICAgICAgICAuLi4oZm9yIGN1c3RvbSBzdmdzKS4uLlxuICAgICAgPC9nPlxuICAgIDxzZy1mcmVlLXBpZWNlcz4gKDw9IGZyZWVQaWVjZXMpXG4gICAgICAuLi4oZm9yIHBpZWNlcykuLi5cbiAgICA8L3NnLWZyZWUtcGllY2VzPlxuICAgIDwvc3ZnPlxuICAqL1xuICBjb25zdCBkZWZzRWwgPSBzdmcucXVlcnlTZWxlY3RvcignZGVmcycpIGFzIFNWR0VsZW1lbnQ7XG4gIGNvbnN0IHNoYXBlc0VsID0gc3ZnLnF1ZXJ5U2VsZWN0b3IoJ2cnKSBhcyBTVkdFbGVtZW50O1xuICBjb25zdCBjdXN0b21TdmdzRWwgPSBjdXN0b21TdmcucXVlcnlTZWxlY3RvcignZycpIGFzIFNWR0VsZW1lbnQ7XG5cbiAgc3luY0RlZnMoc2hhcGVzLCBvdXRzaWRlQXJyb3cgPyBjdXJEIDogdW5kZWZpbmVkLCBkZWZzRWwsIG1hcmtlclByZWZpeCk7XG4gIHN5bmNTaGFwZXMoXG4gICAgc2hhcGVzLmZpbHRlcigocykgPT4gIXMuc2hhcGUuY3VzdG9tU3ZnICYmICghcy5zaGFwZS5waWVjZSB8fCBzLmN1cnJlbnQpKSxcbiAgICBzaGFwZXNFbCxcbiAgICAoc2hhcGUpID0+IHJlbmRlclNWR1NoYXBlKHN0YXRlLCBzaGFwZSwgYXJyb3dEZXN0cywgbWFya2VyUHJlZml4KSxcbiAgICBvdXRzaWRlQXJyb3csXG4gICk7XG4gIHN5bmNTaGFwZXMoXG4gICAgc2hhcGVzLmZpbHRlcigocykgPT4gcy5zaGFwZS5jdXN0b21TdmcpLFxuICAgIGN1c3RvbVN2Z3NFbCxcbiAgICAoc2hhcGUpID0+IHJlbmRlclNWR1NoYXBlKHN0YXRlLCBzaGFwZSwgYXJyb3dEZXN0cywgbWFya2VyUHJlZml4KSxcbiAgKTtcbiAgc3luY1NoYXBlcyhwaWVjZVNoYXBlcywgZnJlZVBpZWNlcywgKHNoYXBlKSA9PiByZW5kZXJQaWVjZShzdGF0ZSwgc2hhcGUpKTtcblxuICBpZiAoIW91dHNpZGVBcnJvdyAmJiBjdXJEKSBjdXJELmFycm93ID0gdW5kZWZpbmVkO1xuXG4gIGlmIChvdXRzaWRlQXJyb3cgJiYgIWN1ckQuYXJyb3cpIHtcbiAgICBjb25zdCBvcmlnID0gcGllY2VPcktleVRvUG9zKGN1ckQub3JpZywgc3RhdGUpO1xuICAgIGlmIChvcmlnKSB7XG4gICAgICBjb25zdCBnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdnJyksIHtcbiAgICAgICAgY2xhc3M6IHNoYXBlQ2xhc3MoY3VyRC5icnVzaCwgdHJ1ZSwgdHJ1ZSksXG4gICAgICAgIHNnSGFzaDogb3V0c2lkZUFycm93SGFzaCxcbiAgICAgIH0pO1xuICAgICAgY29uc3QgZWwgPSByZW5kZXJBcnJvdyhcbiAgICAgICAgbWFya2VySWQobWFya2VyUHJlZml4LCBjdXJELmJydXNoKSxcbiAgICAgICAgb3JpZyxcbiAgICAgICAgb3JpZyxcbiAgICAgICAgc3RhdGUuc3F1YXJlUmF0aW8sXG4gICAgICAgIHRydWUsXG4gICAgICAgIGZhbHNlLFxuICAgICAgKTtcbiAgICAgIGcuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgY3VyRC5hcnJvdyA9IGVsO1xuICAgICAgc2hhcGVzRWwuYXBwZW5kQ2hpbGQoZyk7XG4gICAgfVxuICB9XG59XG5cbi8vIGFwcGVuZCBvbmx5LiBEb24ndCB0cnkgdG8gdXBkYXRlL3JlbW92ZS5cbmZ1bmN0aW9uIHN5bmNEZWZzKFxuICBzaGFwZXM6IFNoYXBlW10sXG4gIG91dHNpZGVTaGFwZTogRHJhd0N1cnJlbnQgfCB1bmRlZmluZWQsXG4gIGRlZnNFbDogU1ZHRWxlbWVudCxcbiAgbWFya2VyUHJlZml4OiBzdHJpbmcsXG4pOiB2b2lkIHtcbiAgY29uc3QgYnJ1c2hlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBmb3IgKGNvbnN0IHMgb2Ygc2hhcGVzKSB7XG4gICAgaWYgKCFzYW1lUGllY2VPcktleShzLnNoYXBlLmRlc3QsIHMuc2hhcGUub3JpZykpIGJydXNoZXMuYWRkKHMuc2hhcGUuYnJ1c2ggfHwgZGVmYXVsdEJydXNoKTtcbiAgfVxuICBpZiAob3V0c2lkZVNoYXBlKSBicnVzaGVzLmFkZChvdXRzaWRlU2hhcGUuYnJ1c2ggfHwgZGVmYXVsdEJydXNoKTtcbiAgY29uc3Qga2V5c0luRG9tID0gbmV3IFNldCgpO1xuICBsZXQgZWw6IFNWR0VsZW1lbnQgfCB1bmRlZmluZWQgPSBkZWZzRWwuZmlyc3RFbGVtZW50Q2hpbGQgYXMgU1ZHRWxlbWVudDtcbiAgd2hpbGUgKGVsKSB7XG4gICAga2V5c0luRG9tLmFkZChlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtYnJ1c2gnKSk7XG4gICAgZWwgPSBlbC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgU1ZHRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgfVxuICBmb3IgKGNvbnN0IGJydXNoIG9mIGJydXNoZXMpIHtcbiAgICBpZiAoIWtleXNJbkRvbS5oYXMoYnJ1c2gpKVxuICAgICAgZGVmc0VsLmFwcGVuZENoaWxkKHJlbmRlck1hcmtlcihtYXJrZXJJZChtYXJrZXJQcmVmaXgsIGJydXNoKSwgYnJ1c2gpKTtcbiAgfVxufVxuXG4vLyBhcHBlbmQsIHJlbW92ZSBhbmQgcmVvcmRlciBvbmx5LiBObyB1cGRhdGVzLlxuZXhwb3J0IGZ1bmN0aW9uIHN5bmNTaGFwZXMoXG4gIHNoYXBlczogU2hhcGVbXSxcbiAgcm9vdDogSFRNTEVsZW1lbnQgfCBTVkdFbGVtZW50LFxuICByZW5kZXJTaGFwZTogKHNoYXBlOiBTaGFwZSkgPT4gSFRNTEVsZW1lbnQgfCBTVkdFbGVtZW50IHwgdW5kZWZpbmVkLFxuICBvdXRzaWRlQXJyb3c/OiBib29sZWFuLFxuKTogdm9pZCB7XG4gIGNvbnN0IGVsc0luRG9tID0gbmV3IE1hcDxIYXNoIHwgbnVsbCwgRWxlbWVudFtdPigpOyAvLyBieSBoYXNoXG4gIGxldCBlbCA9IHJvb3QuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gIHdoaWxlIChlbCkge1xuICAgIGNvbnN0IGVsSGFzaCA9IGVsLmdldEF0dHJpYnV0ZSgnc2dIYXNoJyk7XG4gICAgLy8gdGhlIG91dHNpZGUgYXJyb3cgaXMgbWFuYWdlZCBieSByZW5kZXJTaGFwZXNcbiAgICBpZiAoIW91dHNpZGVBcnJvdyB8fCBlbEhhc2ggIT09IG91dHNpZGVBcnJvd0hhc2gpIHtcbiAgICAgIGNvbnN0IGVscyA9IGVsc0luRG9tLmdldChlbEhhc2gpO1xuICAgICAgaWYgKGVscykgZWxzLnB1c2goZWwpO1xuICAgICAgZWxzZSBlbHNJbkRvbS5zZXQoZWxIYXNoLCBbZWxdKTtcbiAgICB9XG4gICAgZWwgPSBlbC5uZXh0RWxlbWVudFNpYmxpbmc7XG4gIH1cbiAgLy8gZm91bmQgc2hhcGUgZWxlbWVudHMgdGhhdCBhcmUgaGVyZSB0byBzdGF5XG4gIGNvbnN0IGtlcHQgPSBzaGFwZXMubWFwKChzYykgPT4gZWxzSW5Eb20uZ2V0KHNjLmhhc2gpPy5zaGlmdCgpKTtcbiAgLy8gcmVtb3ZlIG9sZCBzaGFwZXNcbiAgZm9yIChjb25zdCBlbHMgb2YgZWxzSW5Eb20udmFsdWVzKCkpIHtcbiAgICBmb3IgKGNvbnN0IGVsIG9mIGVscykgcm9vdC5yZW1vdmVDaGlsZChlbCk7XG4gIH1cbiAgLy8gd2FsayB0aGUgZG9tIGFsb25nIHdpdGggc2hhcGVzLCBpbnNlcnRpbmcgbmV3IGVsZW1lbnRzIGFuZCBtb3ZpbmcgbWlzcGxhY2VkIG9uZXNcbiAgZWwgPSByb290LmZpcnN0RWxlbWVudENoaWxkO1xuICBzaGFwZXMuZm9yRWFjaCgoc2MsIGkpID0+IHtcbiAgICBjb25zdCBzaGFwZUVsID0ga2VwdFtpXSB8fCByZW5kZXJTaGFwZShzYyk7XG4gICAgaWYgKHNoYXBlRWwgPT09IGVsKSBlbCA9IGVsPy5uZXh0RWxlbWVudFNpYmxpbmcgPz8gbnVsbDtcbiAgICBlbHNlIGlmIChzaGFwZUVsKSByb290Lmluc2VydEJlZm9yZShzaGFwZUVsLCBlbCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBzaGFwZUhhc2goXG4gIHsgb3JpZywgZGVzdCwgYnJ1c2gsIHBpZWNlLCBkZXNjcmlwdGlvbiB9OiBEcmF3U2hhcGUsXG4gIGFycm93RGVzdHM6IEFycm93RGVzdHMsXG4gIGN1cnJlbnQ6IGJvb2xlYW4sXG4gIGJvdW5kSGFzaDogKHBpZWNlOiBzZy5QaWVjZSkgPT4gc3RyaW5nLFxuKTogSGFzaCB7XG4gIHJldHVybiBbXG4gICAgY3VycmVudCxcbiAgICBpc1BpZWNlKG9yaWcpICYmIGJvdW5kSGFzaChvcmlnKSxcbiAgICBpc1BpZWNlKGRlc3QpICYmIGJvdW5kSGFzaChkZXN0KSxcbiAgICBpc1BpZWNlKG9yaWcpID8gcGllY2VIYXNoKG9yaWcpIDogb3JpZyxcbiAgICBpc1BpZWNlKGRlc3QpID8gcGllY2VIYXNoKGRlc3QpIDogZGVzdCxcbiAgICBicnVzaCxcbiAgICAoYXJyb3dEZXN0cy5nZXQoaXNQaWVjZShkZXN0KSA/IHBpZWNlTmFtZU9mKGRlc3QpIDogZGVzdCkgfHwgMCkgPiAxLFxuICAgIHBpZWNlICYmIHBpZWNlSGFzaChwaWVjZSksXG4gICAgZGVzY3JpcHRpb24sXG4gIF1cbiAgICAuZmlsdGVyKCh4KSA9PiB4KVxuICAgIC5qb2luKCcsJyk7XG59XG5cbmZ1bmN0aW9uIHBpZWNlU2hhcGVIYXNoKHsgb3JpZywgcGllY2UgfTogRHJhd1NoYXBlLCBzY2FsZURvd246IGJvb2xlYW4pOiBIYXNoIHtcbiAgcmV0dXJuIFtzY2FsZURvd24sIGlzUGllY2Uob3JpZykgPyBwaWVjZUhhc2gob3JpZykgOiBvcmlnLCBwaWVjZSAmJiBwaWVjZUhhc2gocGllY2UpXS5qb2luKCcsJyk7XG59XG5cbmZ1bmN0aW9uIGN1c3RvbVNoYXBlSGFzaChcbiAgeyBvcmlnLCBicnVzaCwgY3VzdG9tU3ZnIH06IERyYXdTaGFwZSxcbiAgYm91bmRIYXNoOiAocGllY2U6IHNnLlBpZWNlKSA9PiBzdHJpbmcsXG4pOiBIYXNoIHtcbiAgcmV0dXJuIFtcbiAgICBpc1BpZWNlKG9yaWcpICYmIGJvdW5kSGFzaChvcmlnKSxcbiAgICBpc1BpZWNlKG9yaWcpID8gcGllY2VIYXNoKG9yaWcpIDogb3JpZyxcbiAgICBicnVzaCxcbiAgICBjdXN0b21TdmcgJiYgY3VzdG9tU3ZnSGFzaChjdXN0b21TdmcpLFxuICBdXG4gICAgLmZpbHRlcigoeCkgPT4geClcbiAgICAuam9pbignLCcpO1xufVxuXG5mdW5jdGlvbiBwaWVjZUhhc2gocGllY2U6IERyYXdTaGFwZVBpZWNlKTogSGFzaCB7XG4gIHJldHVybiBbcGllY2UuY29sb3IsIHBpZWNlLnJvbGUsIHBpZWNlLnNjYWxlXS5maWx0ZXIoKHgpID0+IHgpLmpvaW4oJywnKTtcbn1cblxuZnVuY3Rpb24gY3VzdG9tU3ZnSGFzaChzOiBzdHJpbmcpOiBIYXNoIHtcbiAgLy8gUm9sbGluZyBoYXNoIHdpdGggYmFzZSAzMSAoY2YuIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzc2MTY0NjEvZ2VuZXJhdGUtYS1oYXNoLWZyb20tc3RyaW5nLWluLWphdmFzY3JpcHQpXG4gIGxldCBoID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzLmxlbmd0aDsgaSsrKSB7XG4gICAgaCA9ICgoaCA8PCA1KSAtIGggKyBzLmNoYXJDb2RlQXQoaSkpID4+PiAwO1xuICB9XG4gIHJldHVybiBgY3VzdG9tLSR7aC50b1N0cmluZygpfWA7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclNWR1NoYXBlKFxuICBzdGF0ZTogU3RhdGUsXG4gIHsgc2hhcGUsIGN1cnJlbnQsIGhhc2ggfTogU2hhcGUsXG4gIGFycm93RGVzdHM6IEFycm93RGVzdHMsXG4gIG1hcmtlclByZWZpeDogc3RyaW5nLFxuKTogU1ZHRWxlbWVudCB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IG9yaWcgPSBwaWVjZU9yS2V5VG9Qb3Moc2hhcGUub3JpZywgc3RhdGUpO1xuICBpZiAoIW9yaWcpIHJldHVybjtcbiAgaWYgKHNoYXBlLmN1c3RvbVN2Zykge1xuICAgIHJldHVybiByZW5kZXJDdXN0b21Tdmcoc2hhcGUuYnJ1c2gsIHNoYXBlLmN1c3RvbVN2Zywgb3JpZywgc3RhdGUuc3F1YXJlUmF0aW8sIGhhc2gpO1xuICB9IGVsc2Uge1xuICAgIGxldCBlbDogU1ZHRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgICBjb25zdCBkZXN0ID0gIXNhbWVQaWVjZU9yS2V5KHNoYXBlLm9yaWcsIHNoYXBlLmRlc3QpICYmIHBpZWNlT3JLZXlUb1BvcyhzaGFwZS5kZXN0LCBzdGF0ZSk7XG4gICAgaWYgKGRlc3QpIHtcbiAgICAgIGVsID0gcmVuZGVyQXJyb3coXG4gICAgICAgIG1hcmtlcklkKG1hcmtlclByZWZpeCwgc2hhcGUuYnJ1c2gpLFxuICAgICAgICBvcmlnLFxuICAgICAgICBkZXN0LFxuICAgICAgICBzdGF0ZS5zcXVhcmVSYXRpbyxcbiAgICAgICAgISFjdXJyZW50LFxuICAgICAgICAoYXJyb3dEZXN0cy5nZXQoaXNQaWVjZShzaGFwZS5kZXN0KSA/IHBpZWNlTmFtZU9mKHNoYXBlLmRlc3QpIDogc2hhcGUuZGVzdCkgfHwgMCkgPiAxLFxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKHNhbWVQaWVjZU9yS2V5KHNoYXBlLmRlc3QsIHNoYXBlLm9yaWcpKSB7XG4gICAgICBsZXQgcmF0aW86IHNnLk51bWJlclBhaXIgPSBzdGF0ZS5zcXVhcmVSYXRpbztcbiAgICAgIGlmIChpc1BpZWNlKHNoYXBlLm9yaWcpKSB7XG4gICAgICAgIGNvbnN0IHBpZWNlQm91bmRzID0gc3RhdGUuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcygpLmdldChwaWVjZU5hbWVPZihzaGFwZS5vcmlnKSk7XG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gICAgICAgIGlmIChwaWVjZUJvdW5kcyAmJiBib3VuZHMpIHtcbiAgICAgICAgICBjb25zdCBoZWlnaHRCYXNlID0gcGllY2VCb3VuZHMuaGVpZ2h0IC8gKGJvdW5kcy5oZWlnaHQgLyBzdGF0ZS5kaW1lbnNpb25zLnJhbmtzKTtcbiAgICAgICAgICAvLyB3ZSB3YW50IHRvIGtlZXAgdGhlIHJhdGlvIHRoYXQgaXMgb24gdGhlIGJvYXJkXG4gICAgICAgICAgcmF0aW8gPSBbaGVpZ2h0QmFzZSAqIHN0YXRlLnNxdWFyZVJhdGlvWzBdLCBoZWlnaHRCYXNlICogc3RhdGUuc3F1YXJlUmF0aW9bMV1dO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbCA9IHJlbmRlckVsbGlwc2Uob3JpZywgcmF0aW8sICEhY3VycmVudCk7XG4gICAgfVxuICAgIGlmIChlbCkge1xuICAgICAgY29uc3QgZyA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnZycpLCB7XG4gICAgICAgIGNsYXNzOiBzaGFwZUNsYXNzKHNoYXBlLmJydXNoLCAhIWN1cnJlbnQsIGZhbHNlKSxcbiAgICAgICAgc2dIYXNoOiBoYXNoLFxuICAgICAgfSk7XG4gICAgICBnLmFwcGVuZENoaWxkKGVsKTtcbiAgICAgIGNvbnN0IGRlc2NFbCA9IHNoYXBlLmRlc2NyaXB0aW9uICYmIHJlbmRlckRlc2NyaXB0aW9uKHN0YXRlLCBzaGFwZSwgYXJyb3dEZXN0cyk7XG4gICAgICBpZiAoZGVzY0VsKSBnLmFwcGVuZENoaWxkKGRlc2NFbCk7XG4gICAgICByZXR1cm4gZztcbiAgICB9IGVsc2UgcmV0dXJuO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlckN1c3RvbVN2ZyhcbiAgYnJ1c2g6IHN0cmluZyxcbiAgY3VzdG9tU3ZnOiBzdHJpbmcsXG4gIHBvczogc2cuUG9zLFxuICByYXRpbzogc2cuTnVtYmVyUGFpcixcbiAgaGFzaDogSGFzaCxcbik6IFNWR0VsZW1lbnQge1xuICBjb25zdCBbeCwgeV0gPSBwb3M7XG5cbiAgLy8gVHJhbnNsYXRlIHRvIHRvcC1sZWZ0IG9mIGBvcmlnYCBzcXVhcmVcbiAgY29uc3QgZyA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnZycpLCB7XG4gICAgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7eH0sJHt5fSlgLFxuICAgIHNnSGFzaDogaGFzaCxcbiAgfSk7XG5cbiAgY29uc3Qgc3ZnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdzdmcnKSwge1xuICAgIGNsYXNzOiBicnVzaCxcbiAgICB3aWR0aDogcmF0aW9bMF0sXG4gICAgaGVpZ2h0OiByYXRpb1sxXSxcbiAgICB2aWV3Qm94OiBgMCAwICR7cmF0aW9bMF0gKiAxMH0gJHtyYXRpb1sxXSAqIDEwfWAsXG4gIH0pO1xuXG4gIGcuYXBwZW5kQ2hpbGQoc3ZnKTtcbiAgc3ZnLmlubmVySFRNTCA9IGN1c3RvbVN2ZztcblxuICByZXR1cm4gZztcbn1cblxuZnVuY3Rpb24gcmVuZGVyRWxsaXBzZShwb3M6IHNnLlBvcywgcmF0aW86IHNnLk51bWJlclBhaXIsIGN1cnJlbnQ6IGJvb2xlYW4pOiBTVkdFbGVtZW50IHtcbiAgY29uc3QgbyA9IHBvcztcbiAgY29uc3Qgd2lkdGhzID0gZWxsaXBzZVdpZHRoKHJhdGlvKTtcbiAgcmV0dXJuIHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnZWxsaXBzZScpLCB7XG4gICAgJ3N0cm9rZS13aWR0aCc6IHdpZHRoc1tjdXJyZW50ID8gMCA6IDFdLFxuICAgIGZpbGw6ICdub25lJyxcbiAgICBjeDogb1swXSxcbiAgICBjeTogb1sxXSxcbiAgICByeDogcmF0aW9bMF0gLyAyIC0gd2lkdGhzWzFdIC8gMixcbiAgICByeTogcmF0aW9bMV0gLyAyIC0gd2lkdGhzWzFdIC8gMixcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckFycm93KFxuICBtYXJrZXJJZDogc3RyaW5nLFxuICBvcmlnOiBzZy5Qb3MsXG4gIGRlc3Q6IHNnLlBvcyxcbiAgcmF0aW86IHNnLk51bWJlclBhaXIsXG4gIGN1cnJlbnQ6IGJvb2xlYW4sXG4gIHNob3J0ZW46IGJvb2xlYW4sXG4pOiBTVkdFbGVtZW50IHtcbiAgY29uc3QgbSA9IGFycm93TWFyZ2luKHNob3J0ZW4gJiYgIWN1cnJlbnQsIHJhdGlvKTtcbiAgY29uc3QgYSA9IG9yaWc7XG4gIGNvbnN0IGIgPSBkZXN0O1xuICBjb25zdCBkeCA9IGJbMF0gLSBhWzBdO1xuICBjb25zdCBkeSA9IGJbMV0gLSBhWzFdO1xuICBjb25zdCBhbmdsZSA9IE1hdGguYXRhbjIoZHksIGR4KTtcbiAgY29uc3QgeG8gPSBNYXRoLmNvcyhhbmdsZSkgKiBtO1xuICBjb25zdCB5byA9IE1hdGguc2luKGFuZ2xlKSAqIG07XG4gIHJldHVybiBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ2xpbmUnKSwge1xuICAgICdzdHJva2Utd2lkdGgnOiBsaW5lV2lkdGgoY3VycmVudCwgcmF0aW8pLFxuICAgICdzdHJva2UtbGluZWNhcCc6ICdyb3VuZCcsXG4gICAgJ21hcmtlci1lbmQnOiBgdXJsKCMke21hcmtlcklkfSlgLFxuICAgIHgxOiBhWzBdLFxuICAgIHkxOiBhWzFdLFxuICAgIHgyOiBiWzBdIC0geG8sXG4gICAgeTI6IGJbMV0gLSB5byxcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJQaWVjZShzdGF0ZTogU3RhdGUsIHsgc2hhcGUsIGhhc2ggfTogU2hhcGUpOiBzZy5QaWVjZU5vZGUgfCB1bmRlZmluZWQge1xuICBpZiAoIXNoYXBlLnBpZWNlIHx8IGlzUGllY2Uoc2hhcGUub3JpZykpIHJldHVybjtcblxuICBjb25zdCBvcmlnID0gc2hhcGUub3JpZztcbiAgY29uc3Qgc2NhbGUgPSAoc2hhcGUucGllY2Uuc2NhbGUgfHwgMSkgKiAoc3RhdGUuc2NhbGVEb3duUGllY2VzID8gMC41IDogMSk7XG5cbiAgY29uc3QgcGllY2VFbCA9IGNyZWF0ZUVsKCdwaWVjZScsIHBpZWNlTmFtZU9mKHNoYXBlLnBpZWNlKSkgYXMgc2cuUGllY2VOb2RlO1xuICBwaWVjZUVsLnNldEF0dHJpYnV0ZSgnc2dIYXNoJywgaGFzaCk7XG4gIHBpZWNlRWwuc2dLZXkgPSBvcmlnO1xuICBwaWVjZUVsLnNnU2NhbGUgPSBzY2FsZTtcbiAgdHJhbnNsYXRlUmVsKFxuICAgIHBpZWNlRWwsXG4gICAgcG9zVG9UcmFuc2xhdGVSZWwoc3RhdGUuZGltZW5zaW9ucykoa2V5MnBvcyhvcmlnKSwgc2VudGVQb3Yoc3RhdGUub3JpZW50YXRpb24pKSxcbiAgICBzdGF0ZS5zY2FsZURvd25QaWVjZXMgPyAwLjUgOiAxLFxuICAgIHNjYWxlLFxuICApO1xuXG4gIHJldHVybiBwaWVjZUVsO1xufVxuXG5mdW5jdGlvbiByZW5kZXJEZXNjcmlwdGlvbihcbiAgc3RhdGU6IFN0YXRlLFxuICBzaGFwZTogRHJhd1NoYXBlLFxuICBhcnJvd0Rlc3RzOiBBcnJvd0Rlc3RzLFxuKTogU1ZHRWxlbWVudCB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IG9yaWcgPSBwaWVjZU9yS2V5VG9Qb3Moc2hhcGUub3JpZywgc3RhdGUpO1xuICBpZiAoIW9yaWcgfHwgIXNoYXBlLmRlc2NyaXB0aW9uKSByZXR1cm47XG4gIGNvbnN0IGRlc3QgPSAhc2FtZVBpZWNlT3JLZXkoc2hhcGUub3JpZywgc2hhcGUuZGVzdCkgJiYgcGllY2VPcktleVRvUG9zKHNoYXBlLmRlc3QsIHN0YXRlKTtcbiAgY29uc3QgZGlmZiA9IGRlc3QgPyBbZGVzdFswXSAtIG9yaWdbMF0sIGRlc3RbMV0gLSBvcmlnWzFdXSA6IFswLCAwXTtcbiAgY29uc3Qgb2Zmc2V0ID1cbiAgICAoYXJyb3dEZXN0cy5nZXQoaXNQaWVjZShzaGFwZS5kZXN0KSA/IHBpZWNlTmFtZU9mKHNoYXBlLmRlc3QpIDogc2hhcGUuZGVzdCkgfHwgMCkgPiAxXG4gICAgICA/IDAuM1xuICAgICAgOiAwLjE1O1xuICBjb25zdCBjbG9zZSA9XG4gICAgKGRpZmZbMF0gPT09IDAgfHwgTWF0aC5hYnMoZGlmZlswXSkgPT09IHN0YXRlLnNxdWFyZVJhdGlvWzBdKSAmJlxuICAgIChkaWZmWzFdID09PSAwIHx8IE1hdGguYWJzKGRpZmZbMV0pID09PSBzdGF0ZS5zcXVhcmVSYXRpb1sxXSk7XG4gIGNvbnN0IHJhdGlvID0gZGVzdCA/IDAuNTUgLSAoY2xvc2UgPyBvZmZzZXQgOiAwKSA6IDA7XG4gIGNvbnN0IG1pZDogc2cuUG9zID0gW29yaWdbMF0gKyBkaWZmWzBdICogcmF0aW8sIG9yaWdbMV0gKyBkaWZmWzFdICogcmF0aW9dO1xuICBjb25zdCB0ZXh0TGVuZ3RoID0gc2hhcGUuZGVzY3JpcHRpb24ubGVuZ3RoO1xuICBjb25zdCBnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdnJyksIHsgY2xhc3M6ICdkZXNjcmlwdGlvbicgfSk7XG4gIGNvbnN0IGNpcmNsZSA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnZWxsaXBzZScpLCB7XG4gICAgY3g6IG1pZFswXSxcbiAgICBjeTogbWlkWzFdLFxuICAgIHJ4OiB0ZXh0TGVuZ3RoICsgMS41LFxuICAgIHJ5OiAyLjUsXG4gIH0pO1xuICBjb25zdCB0ZXh0ID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCd0ZXh0JyksIHtcbiAgICB4OiBtaWRbMF0sXG4gICAgeTogbWlkWzFdLFxuICAgICd0ZXh0LWFuY2hvcic6ICdtaWRkbGUnLFxuICAgICdkb21pbmFudC1iYXNlbGluZSc6ICdjZW50cmFsJyxcbiAgfSk7XG4gIGcuYXBwZW5kQ2hpbGQoY2lyY2xlKTtcbiAgdGV4dC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzaGFwZS5kZXNjcmlwdGlvbikpO1xuICBnLmFwcGVuZENoaWxkKHRleHQpO1xuICByZXR1cm4gZztcbn1cblxuZnVuY3Rpb24gcmVuZGVyTWFya2VyKGlkOiBzdHJpbmcsIGJydXNoOiBzdHJpbmcpOiBTVkdFbGVtZW50IHtcbiAgY29uc3QgbWFya2VyID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdtYXJrZXInKSwge1xuICAgIGlkLFxuICAgICdkYXRhLWJydXNoJzogYnJ1c2gsXG4gICAgb3JpZW50OiAnYXV0bycsXG4gICAgbWFya2VyV2lkdGg6IDQsXG4gICAgbWFya2VySGVpZ2h0OiA4LFxuICAgIHJlZlg6IDIuMDUsXG4gICAgcmVmWTogMi4wMSxcbiAgfSk7XG4gIG1hcmtlci5hcHBlbmRDaGlsZChcbiAgICBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ3BhdGgnKSwge1xuICAgICAgZDogJ00wLDAgVjQgTDMsMiBaJyxcbiAgICB9KSxcbiAgKTtcbiAgcmV0dXJuIG1hcmtlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldEF0dHJpYnV0ZXMoZWw6IFNWR0VsZW1lbnQsIGF0dHJzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogU1ZHRWxlbWVudCB7XG4gIGZvciAoY29uc3Qga2V5IGluIGF0dHJzKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChhdHRycywga2V5KSkgZWwuc2V0QXR0cmlidXRlKGtleSwgYXR0cnNba2V5XSk7XG4gIH1cbiAgcmV0dXJuIGVsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcG9zMnVzZXIoXG4gIHBvczogc2cuUG9zLFxuICBjb2xvcjogc2cuQ29sb3IsXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIHJhdGlvOiBzZy5OdW1iZXJQYWlyLFxuKTogc2cuTnVtYmVyUGFpciB7XG4gIHJldHVybiBjb2xvciA9PT0gJ3NlbnRlJ1xuICAgID8gWyhkaW1zLmZpbGVzIC0gMSAtIHBvc1swXSkgKiByYXRpb1swXSwgcG9zWzFdICogcmF0aW9bMV1dXG4gICAgOiBbcG9zWzBdICogcmF0aW9bMF0sIChkaW1zLnJhbmtzIC0gMSAtIHBvc1sxXSkgKiByYXRpb1sxXV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1BpZWNlKHg6IHNnLktleSB8IHNnLlBpZWNlKTogeCBpcyBzZy5QaWVjZSB7XG4gIHJldHVybiB0eXBlb2YgeCA9PT0gJ29iamVjdCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYW1lUGllY2VPcktleShrcDE6IHNnLktleSB8IHNnLlBpZWNlLCBrcDI6IHNnLktleSB8IHNnLlBpZWNlKTogYm9vbGVhbiB7XG4gIHJldHVybiAoaXNQaWVjZShrcDEpICYmIGlzUGllY2Uoa3AyKSAmJiBzYW1lUGllY2Uoa3AxLCBrcDIpKSB8fCBrcDEgPT09IGtwMjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZXNCb3VuZHMoc2hhcGVzOiBEcmF3U2hhcGVbXSk6IGJvb2xlYW4ge1xuICByZXR1cm4gc2hhcGVzLnNvbWUoKHMpID0+IGlzUGllY2Uocy5vcmlnKSB8fCBpc1BpZWNlKHMuZGVzdCkpO1xufVxuXG5mdW5jdGlvbiBzaGFwZUNsYXNzKGJydXNoOiBzdHJpbmcsIGN1cnJlbnQ6IGJvb2xlYW4sIG91dHNpZGU6IGJvb2xlYW4pOiBzdHJpbmcge1xuICByZXR1cm4gKGJydXNoIHx8IGRlZmF1bHRCcnVzaCkgKyAoY3VycmVudCA/ICcgY3VycmVudCcgOiAnJykgKyAob3V0c2lkZSA/ICcgb3V0c2lkZScgOiAnJyk7XG59XG5cbmZ1bmN0aW9uIHJhdGlvQXZlcmFnZShyYXRpbzogc2cuTnVtYmVyUGFpcik6IG51bWJlciB7XG4gIHJldHVybiAocmF0aW9bMF0gKyByYXRpb1sxXSkgLyAyO1xufVxuXG5mdW5jdGlvbiBlbGxpcHNlV2lkdGgocmF0aW86IHNnLk51bWJlclBhaXIpOiBbbnVtYmVyLCBudW1iZXJdIHtcbiAgcmV0dXJuIFsoMyAvIDY0KSAqIHJhdGlvQXZlcmFnZShyYXRpbyksICg0IC8gNjQpICogcmF0aW9BdmVyYWdlKHJhdGlvKV07XG59XG5cbmZ1bmN0aW9uIGxpbmVXaWR0aChjdXJyZW50OiBib29sZWFuLCByYXRpbzogc2cuTnVtYmVyUGFpcik6IG51bWJlciB7XG4gIHJldHVybiAoKGN1cnJlbnQgPyA4LjUgOiAxMCkgLyA2NCkgKiByYXRpb0F2ZXJhZ2UocmF0aW8pO1xufVxuXG5mdW5jdGlvbiBhcnJvd01hcmdpbihzaG9ydGVuOiBib29sZWFuLCByYXRpbzogc2cuTnVtYmVyUGFpcik6IG51bWJlciB7XG4gIHJldHVybiAoKHNob3J0ZW4gPyAyMCA6IDEwKSAvIDY0KSAqIHJhdGlvQXZlcmFnZShyYXRpbyk7XG59XG5cbmZ1bmN0aW9uIHBpZWNlT3JLZXlUb1BvcyhrcDogc2cuS2V5IHwgc2cuUGllY2UsIHN0YXRlOiBTdGF0ZSk6IHNnLlBvcyB8IHVuZGVmaW5lZCB7XG4gIGlmIChpc1BpZWNlKGtwKSkge1xuICAgIGNvbnN0IHBpZWNlQm91bmRzID0gc3RhdGUuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcygpLmdldChwaWVjZU5hbWVPZihrcCkpO1xuICAgIGNvbnN0IGJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gICAgY29uc3Qgb2Zmc2V0ID0gc2VudGVQb3Yoc3RhdGUub3JpZW50YXRpb24pID8gWzAuNSwgLTAuNV0gOiBbLTAuNSwgMC41XTtcbiAgICBjb25zdCBwb3MgPVxuICAgICAgcGllY2VCb3VuZHMgJiZcbiAgICAgIGJvdW5kcyAmJlxuICAgICAgcG9zT2ZPdXRzaWRlRWwoXG4gICAgICAgIHBpZWNlQm91bmRzLmxlZnQgKyBwaWVjZUJvdW5kcy53aWR0aCAvIDIsXG4gICAgICAgIHBpZWNlQm91bmRzLnRvcCArIHBpZWNlQm91bmRzLmhlaWdodCAvIDIsXG4gICAgICAgIHNlbnRlUG92KHN0YXRlLm9yaWVudGF0aW9uKSxcbiAgICAgICAgc3RhdGUuZGltZW5zaW9ucyxcbiAgICAgICAgYm91bmRzLFxuICAgICAgKTtcbiAgICByZXR1cm4gKFxuICAgICAgcG9zICYmXG4gICAgICBwb3MydXNlcihcbiAgICAgICAgW3Bvc1swXSArIG9mZnNldFswXSwgcG9zWzFdICsgb2Zmc2V0WzFdXSxcbiAgICAgICAgc3RhdGUub3JpZW50YXRpb24sXG4gICAgICAgIHN0YXRlLmRpbWVuc2lvbnMsXG4gICAgICAgIHN0YXRlLnNxdWFyZVJhdGlvLFxuICAgICAgKVxuICAgICk7XG4gIH0gZWxzZSByZXR1cm4gcG9zMnVzZXIoa2V5MnBvcyhrcCksIHN0YXRlLm9yaWVudGF0aW9uLCBzdGF0ZS5kaW1lbnNpb25zLCBzdGF0ZS5zcXVhcmVSYXRpbyk7XG59XG4iLCAiaW1wb3J0IHsgY2FuY2VsTW92ZU9yRHJvcCwgdW5zZWxlY3QgfSBmcm9tICcuL2JvYXJkLmpzJztcbmltcG9ydCB7IGlzUGllY2UsIHBvczJ1c2VyLCBzYW1lUGllY2VPcktleSwgc2V0QXR0cmlidXRlcyB9IGZyb20gJy4vc2hhcGVzLmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQge1xuICBldmVudFBvc2l0aW9uLFxuICBnZXRIYW5kUGllY2VBdERvbVBvcyxcbiAgZ2V0S2V5QXREb21Qb3MsXG4gIGlzUmlnaHRCdXR0b24sXG4gIHBvc09mT3V0c2lkZUVsLFxuICBzYW1lUGllY2UsXG4gIHNlbnRlUG92LFxufSBmcm9tICcuL3V0aWwuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdTaGFwZSB7XG4gIG9yaWc6IHNnLktleSB8IHNnLlBpZWNlO1xuICBkZXN0OiBzZy5LZXkgfCBzZy5QaWVjZTtcbiAgcGllY2U/OiBEcmF3U2hhcGVQaWVjZTtcbiAgY3VzdG9tU3ZnPzogc3RyaW5nOyAvLyBzdmdcbiAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG4gIGJydXNoOiBzdHJpbmc7IC8vIGNzcyBjbGFzcyB0byBiZSBhcHBlbmRlZFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNxdWFyZUhpZ2hsaWdodCB7XG4gIGtleTogc2cuS2V5O1xuICBjbGFzc05hbWU6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEcmF3U2hhcGVQaWVjZSB7XG4gIHJvbGU6IHNnLlJvbGVTdHJpbmc7XG4gIGNvbG9yOiBzZy5Db2xvcjtcbiAgc2NhbGU/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd2FibGUge1xuICBlbmFibGVkOiBib29sZWFuOyAvLyBjYW4gZHJhd1xuICB2aXNpYmxlOiBib29sZWFuOyAvLyBjYW4gdmlld1xuICBmb3JjZWQ6IGJvb2xlYW47IC8vIGNhbiBvbmx5IGRyYXdcbiAgZXJhc2VPbkNsaWNrOiBib29sZWFuO1xuICBvbkNoYW5nZT86IChzaGFwZXM6IERyYXdTaGFwZVtdKSA9PiB2b2lkO1xuICBzaGFwZXM6IERyYXdTaGFwZVtdOyAvLyB1c2VyIHNoYXBlc1xuICBhdXRvU2hhcGVzOiBEcmF3U2hhcGVbXTsgLy8gY29tcHV0ZXIgc2hhcGVzXG4gIHNxdWFyZXM6IFNxdWFyZUhpZ2hsaWdodFtdO1xuICBjdXJyZW50PzogRHJhd0N1cnJlbnQ7XG4gIHByZXZTdmdIYXNoOiBzdHJpbmc7XG4gIHBpZWNlPzogc2cuUGllY2U7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd0N1cnJlbnQge1xuICBvcmlnOiBzZy5LZXkgfCBzZy5QaWVjZTtcbiAgZGVzdD86IHNnLktleSB8IHNnLlBpZWNlOyAvLyB1bmRlZmluZWQgaWYgb3V0c2lkZSBib2FyZC9oYW5kc1xuICBhcnJvdz86IFNWR0VsZW1lbnQ7XG4gIHBpZWNlPzogc2cuUGllY2U7XG4gIHBvczogc2cuTnVtYmVyUGFpcjtcbiAgYnJ1c2g6IHN0cmluZzsgLy8gYnJ1c2ggbmFtZSBmb3Igc2hhcGVcbn1cblxuY29uc3QgYnJ1c2hlcyA9IFsncHJpbWFyeScsICdhbHRlcm5hdGl2ZTAnLCAnYWx0ZXJuYXRpdmUxJywgJ2FsdGVybmF0aXZlMiddO1xuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnQoc3RhdGU6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIC8vIHN1cHBvcnQgb25lIGZpbmdlciB0b3VjaCBvbmx5XG4gIGlmIChlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDEpIHJldHVybjtcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gIGlmIChlLmN0cmxLZXkpIHVuc2VsZWN0KHN0YXRlKTtcbiAgZWxzZSBjYW5jZWxNb3ZlT3JEcm9wKHN0YXRlKTtcblxuICBjb25zdCBwb3MgPSBldmVudFBvc2l0aW9uKGUpO1xuICBjb25zdCBib3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpO1xuICBjb25zdCBvcmlnID1cbiAgICBwb3MgJiYgYm91bmRzICYmIGdldEtleUF0RG9tUG9zKHBvcywgc2VudGVQb3Yoc3RhdGUub3JpZW50YXRpb24pLCBzdGF0ZS5kaW1lbnNpb25zLCBib3VuZHMpO1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLmRyYXdhYmxlLnBpZWNlO1xuICBpZiAoIW9yaWcpIHJldHVybjtcbiAgc3RhdGUuZHJhd2FibGUuY3VycmVudCA9IHtcbiAgICBvcmlnLFxuICAgIGRlc3Q6IHVuZGVmaW5lZCxcbiAgICBwb3MsXG4gICAgcGllY2UsXG4gICAgYnJ1c2g6IGV2ZW50QnJ1c2goZSwgaXNSaWdodEJ1dHRvbihlKSB8fCBzdGF0ZS5kcmF3YWJsZS5mb3JjZWQpLFxuICB9O1xuICBwcm9jZXNzRHJhdyhzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydEZyb21IYW5kKHN0YXRlOiBTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBlOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIC8vIHN1cHBvcnQgb25lIGZpbmdlciB0b3VjaCBvbmx5XG4gIGlmIChlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDEpIHJldHVybjtcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gIGlmIChlLmN0cmxLZXkpIHVuc2VsZWN0KHN0YXRlKTtcbiAgZWxzZSBjYW5jZWxNb3ZlT3JEcm9wKHN0YXRlKTtcblxuICBjb25zdCBwb3MgPSBldmVudFBvc2l0aW9uKGUpO1xuICBpZiAoIXBvcykgcmV0dXJuO1xuICBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50ID0ge1xuICAgIG9yaWc6IHBpZWNlLFxuICAgIGRlc3Q6IHVuZGVmaW5lZCxcbiAgICBwb3MsXG4gICAgYnJ1c2g6IGV2ZW50QnJ1c2goZSwgaXNSaWdodEJ1dHRvbihlKSB8fCBzdGF0ZS5kcmF3YWJsZS5mb3JjZWQpLFxuICB9O1xuICBwcm9jZXNzRHJhdyhzdGF0ZSk7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NEcmF3KHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIGNvbnN0IGN1ciA9IHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQ7XG4gICAgY29uc3QgYm91bmRzID0gc3RhdGUuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKTtcbiAgICBpZiAoY3VyICYmIGJvdW5kcykge1xuICAgICAgY29uc3QgZGVzdCA9IGdldERlc3RpbmF0aW9uKHN0YXRlLCBjdXIucG9zKTtcbiAgICAgIGlmIChjdXIuZGVzdCAhPT0gZGVzdCAmJiAhKGN1ci5kZXN0ICYmIGRlc3QgJiYgc2FtZVBpZWNlT3JLZXkoZGVzdCwgY3VyLmRlc3QpKSkge1xuICAgICAgICBjdXIuZGVzdCA9IGRlc3Q7XG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXdOb3coKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG91dFBvcyA9IHBvc09mT3V0c2lkZUVsKFxuICAgICAgICBjdXIucG9zWzBdLFxuICAgICAgICBjdXIucG9zWzFdLFxuICAgICAgICBzZW50ZVBvdihzdGF0ZS5vcmllbnRhdGlvbiksXG4gICAgICAgIHN0YXRlLmRpbWVuc2lvbnMsXG4gICAgICAgIGJvdW5kcyxcbiAgICAgICk7XG4gICAgICBpZiAoIWN1ci5kZXN0ICYmIGN1ci5hcnJvdyAmJiBvdXRQb3MpIHtcbiAgICAgICAgY29uc3QgZGVzdCA9IHBvczJ1c2VyKG91dFBvcywgc3RhdGUub3JpZW50YXRpb24sIHN0YXRlLmRpbWVuc2lvbnMsIHN0YXRlLnNxdWFyZVJhdGlvKTtcblxuICAgICAgICBzZXRBdHRyaWJ1dGVzKGN1ci5hcnJvdywge1xuICAgICAgICAgIHgyOiBkZXN0WzBdIC0gc3RhdGUuc3F1YXJlUmF0aW9bMF0gLyAyLFxuICAgICAgICAgIHkyOiBkZXN0WzFdIC0gc3RhdGUuc3F1YXJlUmF0aW9bMV0gLyAyLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHByb2Nlc3NEcmF3KHN0YXRlKTtcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZShzdGF0ZTogU3RhdGUsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgY29uc3QgcG9zID0gZXZlbnRQb3NpdGlvbihlKTtcbiAgaWYgKHBvcyAmJiBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50KSBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50LnBvcyA9IHBvcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuZChzdGF0ZTogU3RhdGUsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgY29uc3QgY3VyID0gc3RhdGUuZHJhd2FibGUuY3VycmVudDtcbiAgaWYgKGN1cikge1xuICAgIGN1ci5kZXN0ID0gZ2V0RGVzdGluYXRpb24oc3RhdGUsIGV2ZW50UG9zaXRpb24oZSkgfHwgY3VyLnBvcyk7XG4gICAgYWRkU2hhcGUoc3RhdGUuZHJhd2FibGUsIGN1cik7XG4gICAgY2FuY2VsKHN0YXRlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXREZXN0aW5hdGlvbihzdGF0ZTogU3RhdGUsIHBvczogc2cuTnVtYmVyUGFpcik6IHNnLktleSB8IHNnLlBpZWNlIHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgYm91bmRzID0gc3RhdGUuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKTtcbiAgcmV0dXJuIChcbiAgICBib3VuZHMgJiZcbiAgICAoZ2V0S2V5QXREb21Qb3MocG9zLCBzZW50ZVBvdihzdGF0ZS5vcmllbnRhdGlvbiksIHN0YXRlLmRpbWVuc2lvbnMsIGJvdW5kcykgfHxcbiAgICAgIGdldEhhbmRQaWVjZUF0RG9tUG9zKHBvcywgc3RhdGUuaGFuZHMucm9sZXMsIHN0YXRlLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMoKSkpXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWwoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5kcmF3YWJsZS5jdXJyZW50KSB7XG4gICAgc3RhdGUuZHJhd2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBjb25zdCBkcmF3YWJsZUxlbmd0aCA9IHN0YXRlLmRyYXdhYmxlLnNoYXBlcy5sZW5ndGg7XG4gIGlmIChkcmF3YWJsZUxlbmd0aCB8fCBzdGF0ZS5kcmF3YWJsZS5waWVjZSkge1xuICAgIHN0YXRlLmRyYXdhYmxlLnNoYXBlcyA9IFtdO1xuICAgIHN0YXRlLmRyYXdhYmxlLnBpZWNlID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICBpZiAoZHJhd2FibGVMZW5ndGgpIG9uQ2hhbmdlKHN0YXRlLmRyYXdhYmxlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0RHJhd1BpZWNlKHN0YXRlOiBTdGF0ZSwgcGllY2U6IHNnLlBpZWNlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5kcmF3YWJsZS5waWVjZSAmJiBzYW1lUGllY2Uoc3RhdGUuZHJhd2FibGUucGllY2UsIHBpZWNlKSlcbiAgICBzdGF0ZS5kcmF3YWJsZS5waWVjZSA9IHVuZGVmaW5lZDtcbiAgZWxzZSBzdGF0ZS5kcmF3YWJsZS5waWVjZSA9IHBpZWNlO1xuICBzdGF0ZS5kb20ucmVkcmF3KCk7XG59XG5cbmZ1bmN0aW9uIGV2ZW50QnJ1c2goZTogc2cuTW91Y2hFdmVudCwgYWxsb3dGaXJzdE1vZGlmaWVyOiBib29sZWFuKTogc3RyaW5nIHtcbiAgY29uc3QgbW9kQSA9IGFsbG93Rmlyc3RNb2RpZmllciAmJiAoZS5zaGlmdEtleSB8fCBlLmN0cmxLZXkpO1xuICBjb25zdCBtb2RCID0gZS5hbHRLZXkgfHwgZS5tZXRhS2V5IHx8IGUuZ2V0TW9kaWZpZXJTdGF0ZT8uKCdBbHRHcmFwaCcpO1xuICByZXR1cm4gYnJ1c2hlc1sobW9kQSA/IDEgOiAwKSArIChtb2RCID8gMiA6IDApXTtcbn1cblxuZnVuY3Rpb24gYWRkU2hhcGUoZHJhd2FibGU6IERyYXdhYmxlLCBjdXI6IERyYXdDdXJyZW50KTogdm9pZCB7XG4gIGlmICghY3VyLmRlc3QpIHJldHVybjtcblxuICBjb25zdCBzaW1pbGFyU2hhcGUgPSAoczogRHJhd1NoYXBlKSA9PlxuICAgIGN1ci5kZXN0ICYmIHNhbWVQaWVjZU9yS2V5KGN1ci5vcmlnLCBzLm9yaWcpICYmIHNhbWVQaWVjZU9yS2V5KGN1ci5kZXN0LCBzLmRlc3QpO1xuXG4gIC8vIHNlcGFyYXRlIHNoYXBlIGZvciBwaWVjZXNcbiAgY29uc3QgcGllY2UgPSBjdXIucGllY2U7XG4gIGN1ci5waWVjZSA9IHVuZGVmaW5lZDtcblxuICBjb25zdCBzaW1pbGFyID0gZHJhd2FibGUuc2hhcGVzLmZpbmQoc2ltaWxhclNoYXBlKTtcbiAgY29uc3QgcmVtb3ZlUGllY2UgPSBkcmF3YWJsZS5zaGFwZXMuZmluZChcbiAgICAocykgPT4gc2ltaWxhclNoYXBlKHMpICYmIHBpZWNlICYmIHMucGllY2UgJiYgc2FtZVBpZWNlKHBpZWNlLCBzLnBpZWNlKSxcbiAgKTtcbiAgY29uc3QgZGlmZlBpZWNlID0gZHJhd2FibGUuc2hhcGVzLmZpbmQoXG4gICAgKHMpID0+IHNpbWlsYXJTaGFwZShzKSAmJiBwaWVjZSAmJiBzLnBpZWNlICYmICFzYW1lUGllY2UocGllY2UsIHMucGllY2UpLFxuICApO1xuXG4gIC8vIHJlbW92ZSBldmVyeSBzaW1pbGFyIHNoYXBlXG4gIGlmIChzaW1pbGFyKSBkcmF3YWJsZS5zaGFwZXMgPSBkcmF3YWJsZS5zaGFwZXMuZmlsdGVyKChzKSA9PiAhc2ltaWxhclNoYXBlKHMpKTtcblxuICBpZiAoIWlzUGllY2UoY3VyLm9yaWcpICYmIHBpZWNlICYmICFyZW1vdmVQaWVjZSkge1xuICAgIGRyYXdhYmxlLnNoYXBlcy5wdXNoKHtcbiAgICAgIG9yaWc6IGN1ci5vcmlnLFxuICAgICAgZGVzdDogY3VyLm9yaWcsXG4gICAgICBwaWVjZTogcGllY2UsXG4gICAgICBicnVzaDogY3VyLmJydXNoLFxuICAgIH0pO1xuICAgIC8vIGZvcmNlIGNpcmNsZSBhcm91bmQgZHJhd24gcGllY2VzXG4gICAgaWYgKCFzYW1lUGllY2VPcktleShjdXIub3JpZywgY3VyLmRlc3QpKVxuICAgICAgZHJhd2FibGUuc2hhcGVzLnB1c2goe1xuICAgICAgICBvcmlnOiBjdXIub3JpZyxcbiAgICAgICAgZGVzdDogY3VyLm9yaWcsXG4gICAgICAgIGJydXNoOiBjdXIuYnJ1c2gsXG4gICAgICB9KTtcbiAgfVxuXG4gIGlmICghc2ltaWxhciB8fCBkaWZmUGllY2UgfHwgc2ltaWxhci5icnVzaCAhPT0gY3VyLmJydXNoKVxuICAgIGRyYXdhYmxlLnNoYXBlcy5wdXNoKHsgb3JpZzogY3VyLm9yaWcsIGRlc3Q6IGN1ci5kZXN0LCBicnVzaDogY3VyLmJydXNoIH0pO1xuICBvbkNoYW5nZShkcmF3YWJsZSk7XG59XG5cbmZ1bmN0aW9uIG9uQ2hhbmdlKGRyYXdhYmxlOiBEcmF3YWJsZSk6IHZvaWQge1xuICBpZiAoZHJhd2FibGUub25DaGFuZ2UpIGRyYXdhYmxlLm9uQ2hhbmdlKGRyYXdhYmxlLnNoYXBlcyk7XG59XG4iLCAiaW1wb3J0IHsgYW5pbSB9IGZyb20gJy4vYW5pbS5qcyc7XG5pbXBvcnQgKiBhcyBib2FyZCBmcm9tICcuL2JvYXJkLmpzJztcbmltcG9ydCB7IGNvbG9ycyB9IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IGNsZWFyIGFzIGRyYXdDbGVhciB9IGZyb20gJy4vZHJhdy5qcyc7XG5pbXBvcnQgeyBhZGRUb0hhbmQsIG51bWJlckluSGFuZCwgcmVtb3ZlRnJvbUhhbmQgfSBmcm9tICcuL2hhbmRzLmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbC5qcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhZ0N1cnJlbnQge1xuICBwaWVjZTogc2cuUGllY2U7IC8vIHBpZWNlIGJlaW5nIGRyYWdnZWRcbiAgcG9zOiBzZy5OdW1iZXJQYWlyOyAvLyBsYXRlc3QgZXZlbnQgcG9zaXRpb25cbiAgb3JpZ1Bvczogc2cuTnVtYmVyUGFpcjsgLy8gZmlyc3QgZXZlbnQgcG9zaXRpb25cbiAgc3RhcnRlZDogYm9vbGVhbjsgLy8gd2hldGhlciB0aGUgZHJhZyBoYXMgc3RhcnRlZDsgYXMgcGVyIHRoZSBkaXN0YW5jZSBzZXR0aW5nXG4gIHNwYXJlOiBib29sZWFuOyAvLyB3aGV0aGVyIHRoaXMgcGllY2UgaXMgYSBzcGFyZSBvbmVcbiAgdG91Y2g6IGJvb2xlYW47IC8vIHdhcyB0aGUgZHJhZ2dpbmcgaW5pdGlhdGVkIGZyb20gdG91Y2ggZXZlbnRcbiAgb3JpZ2luVGFyZ2V0OiBFdmVudFRhcmdldCB8IG51bGw7XG4gIGZyb21Cb2FyZD86IHtcbiAgICBvcmlnOiBzZy5LZXk7IC8vIG9yaWcga2V5IG9mIGRyYWdnaW5nIHBpZWNlXG4gICAgcHJldmlvdXNseVNlbGVjdGVkPzogc2cuS2V5OyAvLyBzZWxlY3RlZCBwaWVjZSBiZWZvcmUgZHJhZyBiZWdhblxuICAgIGtleUhhc0NoYW5nZWQ6IGJvb2xlYW47IC8vIHdoZXRoZXIgdGhlIGRyYWcgaGFzIGxlZnQgdGhlIG9yaWcga2V5IG9yIHBpZWNlXG4gIH07XG4gIGZyb21PdXRzaWRlPzoge1xuICAgIG9yaWdpbkJvdW5kczogRE9NUmVjdCB8IHVuZGVmaW5lZDsgLy8gYm91bmRzIG9mIHRoZSBwaWVjZSB0aGF0IGluaXRpYXRlZCB0aGUgZHJhZ1xuICAgIGxlZnRPcmlnaW46IGJvb2xlYW47IC8vIGhhdmUgd2UgZXZlciBsZWZ0IG9yaWdpbkJvdW5kc1xuICAgIHByZXZpb3VzbHlTZWxlY3RlZFBpZWNlPzogc2cuUGllY2U7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydChzOiBTdGF0ZSwgZTogc2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICBjb25zdCBib3VuZHMgPSBzLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gIGNvbnN0IHBvc2l0aW9uID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpO1xuICBjb25zdCBvcmlnID1cbiAgICBib3VuZHMgJiZcbiAgICBwb3NpdGlvbiAmJlxuICAgIHV0aWwuZ2V0S2V5QXREb21Qb3MocG9zaXRpb24sIHV0aWwuc2VudGVQb3Yocy5vcmllbnRhdGlvbiksIHMuZGltZW5zaW9ucywgYm91bmRzKTtcblxuICBpZiAoIW9yaWcpIHJldHVybjtcblxuICBjb25zdCBwaWVjZSA9IHMucGllY2VzLmdldChvcmlnKTtcbiAgY29uc3QgcHJldmlvdXNseVNlbGVjdGVkID0gcy5zZWxlY3RlZDtcbiAgaWYgKFxuICAgICFwcmV2aW91c2x5U2VsZWN0ZWQgJiZcbiAgICBzLmRyYXdhYmxlLmVuYWJsZWQgJiZcbiAgICAocy5kcmF3YWJsZS5lcmFzZU9uQ2xpY2sgfHwgIXBpZWNlIHx8IHBpZWNlLmNvbG9yICE9PSBzLnR1cm5Db2xvcilcbiAgKVxuICAgIGRyYXdDbGVhcihzKTtcblxuICAvLyBQcmV2ZW50IHRvdWNoIHNjcm9sbCBhbmQgY3JlYXRlIG5vIGNvcnJlc3BvbmRpbmcgbW91c2UgZXZlbnQsIGlmIHRoZXJlXG4gIC8vIGlzIGFuIGludGVudCB0byBpbnRlcmFjdCB3aXRoIHRoZSBib2FyZC5cbiAgaWYgKFxuICAgIGUuY2FuY2VsYWJsZSAhPT0gZmFsc2UgJiZcbiAgICAoIWUudG91Y2hlcyB8fFxuICAgICAgcy5ibG9ja1RvdWNoU2Nyb2xsIHx8XG4gICAgICBzLnNlbGVjdGVkUGllY2UgfHxcbiAgICAgIHBpZWNlIHx8XG4gICAgICBwcmV2aW91c2x5U2VsZWN0ZWQgfHxcbiAgICAgIHBpZWNlQ2xvc2VUbyhzLCBwb3NpdGlvbiwgYm91bmRzKSlcbiAgKVxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgY29uc3QgaGFkUHJlbW92ZSA9ICEhcy5wcmVtb3ZhYmxlLmN1cnJlbnQ7XG4gIGNvbnN0IGhhZFByZWRyb3AgPSAhIXMucHJlZHJvcHBhYmxlLmN1cnJlbnQ7XG4gIGlmIChzLnNlbGVjdGFibGUuZGVsZXRlT25Ub3VjaCkgYm9hcmQuZGVsZXRlUGllY2Uocywgb3JpZyk7XG4gIGVsc2UgaWYgKHMuc2VsZWN0ZWQpIHtcbiAgICBpZiAoIXMuc2VsZWN0YWJsZS5lbmFibGVkIHx8ICFib2FyZC5wcm9tb3Rpb25EaWFsb2dNb3ZlKHMsIHMuc2VsZWN0ZWQsIG9yaWcpKSB7XG4gICAgICBpZiAoYm9hcmQuY2FuTW92ZShzLCBzLnNlbGVjdGVkLCBvcmlnKSkgYW5pbSgoc3RhdGUpID0+IGJvYXJkLnNlbGVjdFNxdWFyZShzdGF0ZSwgb3JpZyksIHMpO1xuICAgICAgZWxzZSBib2FyZC5zZWxlY3RTcXVhcmUocywgb3JpZyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHMuc2VsZWN0ZWRQaWVjZSkge1xuICAgIGlmICghcy5zZWxlY3RhYmxlLmVuYWJsZWQgfHwgIWJvYXJkLnByb21vdGlvbkRpYWxvZ0Ryb3Aocywgcy5zZWxlY3RlZFBpZWNlLCBvcmlnKSkge1xuICAgICAgaWYgKGJvYXJkLmNhbkRyb3Aocywgcy5zZWxlY3RlZFBpZWNlLCBvcmlnKSlcbiAgICAgICAgYW5pbSgoc3RhdGUpID0+IGJvYXJkLnNlbGVjdFNxdWFyZShzdGF0ZSwgb3JpZyksIHMpO1xuICAgICAgZWxzZSBib2FyZC5zZWxlY3RTcXVhcmUocywgb3JpZyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGJvYXJkLnNlbGVjdFNxdWFyZShzLCBvcmlnKTtcbiAgfVxuXG4gIGNvbnN0IHN0aWxsU2VsZWN0ZWQgPSBzLnNlbGVjdGVkID09PSBvcmlnO1xuICBjb25zdCBkcmFnZ2VkRWwgPSBzLmRvbS5lbGVtZW50cy5ib2FyZD8uZHJhZ2dlZDtcblxuICBpZiAocGllY2UgJiYgZHJhZ2dlZEVsICYmIHN0aWxsU2VsZWN0ZWQgJiYgYm9hcmQuaXNEcmFnZ2FibGUocywgcGllY2UpKSB7XG4gICAgY29uc3QgdG91Y2ggPSBlLnR5cGUgPT09ICd0b3VjaHN0YXJ0JztcblxuICAgIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB7XG4gICAgICBwaWVjZSxcbiAgICAgIHBvczogcG9zaXRpb24sXG4gICAgICBvcmlnUG9zOiBwb3NpdGlvbixcbiAgICAgIHN0YXJ0ZWQ6IHMuZHJhZ2dhYmxlLmF1dG9EaXN0YW5jZSAmJiAhdG91Y2gsXG4gICAgICBzcGFyZTogZmFsc2UsXG4gICAgICB0b3VjaCxcbiAgICAgIG9yaWdpblRhcmdldDogZS50YXJnZXQsXG4gICAgICBmcm9tQm9hcmQ6IHtcbiAgICAgICAgb3JpZyxcbiAgICAgICAgcHJldmlvdXNseVNlbGVjdGVkLFxuICAgICAgICBrZXlIYXNDaGFuZ2VkOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgfTtcblxuICAgIGRyYWdnZWRFbC5zZ0NvbG9yID0gcGllY2UuY29sb3I7XG4gICAgZHJhZ2dlZEVsLnNnUm9sZSA9IHBpZWNlLnJvbGU7XG4gICAgZHJhZ2dlZEVsLmNsYXNzTmFtZSA9IGBkcmFnZ2luZyAke3V0aWwucGllY2VOYW1lT2YocGllY2UpfWA7XG4gICAgZHJhZ2dlZEVsLmNsYXNzTGlzdC50b2dnbGUoJ3RvdWNoJywgdG91Y2gpO1xuXG4gICAgcHJvY2Vzc0RyYWcocyk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGhhZFByZW1vdmUpIGJvYXJkLnVuc2V0UHJlbW92ZShzKTtcbiAgICBpZiAoaGFkUHJlZHJvcCkgYm9hcmQudW5zZXRQcmVkcm9wKHMpO1xuICB9XG4gIHMuZG9tLnJlZHJhdygpO1xufVxuXG5mdW5jdGlvbiBwaWVjZUNsb3NlVG8oczogU3RhdGUsIHBvczogc2cuTnVtYmVyUGFpciwgYm91bmRzOiBET01SZWN0KTogYm9vbGVhbiB7XG4gIGNvbnN0IGFzU2VudGUgPSB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pO1xuICBjb25zdCByYWRpdXNTcSA9IChib3VuZHMud2lkdGggLyBzLmRpbWVuc2lvbnMuZmlsZXMpICoqIDI7XG4gIGZvciAoY29uc3Qga2V5IG9mIHMucGllY2VzLmtleXMoKSkge1xuICAgIGNvbnN0IGNlbnRlciA9IHV0aWwuY29tcHV0ZVNxdWFyZUNlbnRlcihrZXksIGFzU2VudGUsIHMuZGltZW5zaW9ucywgYm91bmRzKTtcbiAgICBpZiAodXRpbC5kaXN0YW5jZVNxKGNlbnRlciwgcG9zKSA8PSByYWRpdXNTcSkgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZHJhZ05ld1BpZWNlKHM6IFN0YXRlLCBwaWVjZTogc2cuUGllY2UsIGU6IHNnLk1vdWNoRXZlbnQsIHNwYXJlPzogYm9vbGVhbik6IHZvaWQge1xuICBjb25zdCBwcmV2aW91c2x5U2VsZWN0ZWRQaWVjZSA9IHMuc2VsZWN0ZWRQaWVjZTtcbiAgY29uc3QgZHJhZ2dlZEVsID0gcy5kb20uZWxlbWVudHMuYm9hcmQ/LmRyYWdnZWQ7XG4gIGNvbnN0IHBvc2l0aW9uID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpO1xuICBjb25zdCB0b3VjaCA9IGUudHlwZSA9PT0gJ3RvdWNoc3RhcnQnO1xuXG4gIGlmICghcHJldmlvdXNseVNlbGVjdGVkUGllY2UgJiYgIXNwYXJlICYmIHMuZHJhd2FibGUuZW5hYmxlZCAmJiBzLmRyYXdhYmxlLmVyYXNlT25DbGljaylcbiAgICBkcmF3Q2xlYXIocyk7XG5cbiAgaWYgKCFzcGFyZSAmJiBzLnNlbGVjdGFibGUuZGVsZXRlT25Ub3VjaCkge1xuICAgIHJlbW92ZUZyb21IYW5kKHMsIHBpZWNlKTtcbiAgICBib2FyZC51bnNlbGVjdChzKTtcbiAgICB1dGlsLmNhbGxVc2VyRnVuY3Rpb24ocy5ldmVudHMuY2hhbmdlKTtcbiAgfSBlbHNlIGJvYXJkLnNlbGVjdFBpZWNlKHMsIHBpZWNlLCBzcGFyZSk7XG5cbiAgY29uc3QgaGFkUHJlbW92ZSA9ICEhcy5wcmVtb3ZhYmxlLmN1cnJlbnQ7XG4gIGNvbnN0IGhhZFByZWRyb3AgPSAhIXMucHJlZHJvcHBhYmxlLmN1cnJlbnQ7XG4gIGNvbnN0IHN0aWxsU2VsZWN0ZWQgPSBzLnNlbGVjdGVkUGllY2UgJiYgdXRpbC5zYW1lUGllY2Uocy5zZWxlY3RlZFBpZWNlLCBwaWVjZSk7XG5cbiAgLy8gUHJldmVudCB0b3VjaCBzY3JvbGwgYW5kIGNyZWF0ZSBubyBjb3JyZXNwb25kaW5nIG1vdXNlIGV2ZW50LCBpZiB0aGVyZVxuICAvLyBpcyBhbiBpbnRlbnQgdG8gaW50ZXJhY3Qgd2l0aCB0aGUgaGFuZHMuXG4gIGlmIChcbiAgICBlLmNhbmNlbGFibGUgIT09IGZhbHNlICYmXG4gICAgKCFlLnRvdWNoZXMgfHxcbiAgICAgIHMuYmxvY2tUb3VjaFNjcm9sbCB8fFxuICAgICAgcy5zZWxlY3RlZFBpZWNlIHx8XG4gICAgICBwcmV2aW91c2x5U2VsZWN0ZWRQaWVjZSB8fFxuICAgICAgc3RpbGxTZWxlY3RlZCB8fFxuICAgICAgbnVtYmVySW5IYW5kKHMsIHBpZWNlKSA+IDAgfHxcbiAgICAgIChwb3NpdGlvbiAmJiBoYW5kUGllY2VDbG9zZVRvKHMsIHBvc2l0aW9uKSkpXG4gIClcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgaWYgKFxuICAgIGRyYWdnZWRFbCAmJlxuICAgIHBvc2l0aW9uICYmXG4gICAgcy5zZWxlY3RlZFBpZWNlICYmXG4gICAgc3RpbGxTZWxlY3RlZCAmJlxuICAgIGJvYXJkLmlzRHJhZ2dhYmxlKHMsIHBpZWNlLCB0cnVlKVxuICApIHtcbiAgICBzLmRyYWdnYWJsZS5jdXJyZW50ID0ge1xuICAgICAgcGllY2U6IHMuc2VsZWN0ZWRQaWVjZSxcbiAgICAgIHBvczogcG9zaXRpb24sXG4gICAgICBvcmlnUG9zOiBwb3NpdGlvbixcbiAgICAgIHRvdWNoLFxuICAgICAgc3RhcnRlZDogcy5kcmFnZ2FibGUuYXV0b0Rpc3RhbmNlICYmICF0b3VjaCxcbiAgICAgIHNwYXJlOiAhIXNwYXJlLFxuICAgICAgb3JpZ2luVGFyZ2V0OiBlLnRhcmdldCxcbiAgICAgIGZyb21PdXRzaWRlOiB7XG4gICAgICAgIG9yaWdpbkJvdW5kczogIXNwYXJlXG4gICAgICAgICAgPyBzLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMoKS5nZXQodXRpbC5waWVjZU5hbWVPZihwaWVjZSkpXG4gICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgIGxlZnRPcmlnaW46IGZhbHNlLFxuICAgICAgICBwcmV2aW91c2x5U2VsZWN0ZWRQaWVjZTogIXNwYXJlID8gcHJldmlvdXNseVNlbGVjdGVkUGllY2UgOiB1bmRlZmluZWQsXG4gICAgICB9LFxuICAgIH07XG5cbiAgICBkcmFnZ2VkRWwuc2dDb2xvciA9IHBpZWNlLmNvbG9yO1xuICAgIGRyYWdnZWRFbC5zZ1JvbGUgPSBwaWVjZS5yb2xlO1xuICAgIGRyYWdnZWRFbC5jbGFzc05hbWUgPSBgZHJhZ2dpbmcgJHt1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKX1gO1xuICAgIGRyYWdnZWRFbC5jbGFzc0xpc3QudG9nZ2xlKCd0b3VjaCcsIHRvdWNoKTtcblxuICAgIHByb2Nlc3NEcmFnKHMpO1xuICB9IGVsc2Uge1xuICAgIGlmIChoYWRQcmVtb3ZlKSBib2FyZC51bnNldFByZW1vdmUocyk7XG4gICAgaWYgKGhhZFByZWRyb3ApIGJvYXJkLnVuc2V0UHJlZHJvcChzKTtcbiAgfVxuICBzLmRvbS5yZWRyYXcoKTtcbn1cblxuZnVuY3Rpb24gaXNEcmFnUGllY2VWYWxpZChzOiBTdGF0ZSwgY3VyOiBEcmFnQ3VycmVudCk6IGJvb2xlYW4ge1xuICBpZiAoIWN1ci5mcm9tQm9hcmQpIHJldHVybiBjdXIuc3BhcmUgfHwgbnVtYmVySW5IYW5kKHMsIGN1ci5waWVjZSkgPiAwO1xuICBjb25zdCBvcmlnUGllY2UgPSBzLnBpZWNlcy5nZXQoY3VyLmZyb21Cb2FyZC5vcmlnKTtcbiAgcmV0dXJuICEhb3JpZ1BpZWNlICYmIHV0aWwuc2FtZVBpZWNlKG9yaWdQaWVjZSwgY3VyLnBpZWNlKTtcbn1cblxuZnVuY3Rpb24gdHJ5U3RhcnREcmFnKHM6IFN0YXRlLCBjdXI6IERyYWdDdXJyZW50LCBwb3M6IHNnLk51bWJlclBhaXIpOiBib29sZWFuIHtcbiAgaWYgKCFjdXIuc3RhcnRlZCAmJiB1dGlsLmRpc3RhbmNlU3EocG9zLCBjdXIub3JpZ1BvcykgPj0gcy5kcmFnZ2FibGUuZGlzdGFuY2UgKiogMikgcmV0dXJuIHRydWU7XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0RyYWcoczogU3RhdGUpOiB2b2lkIHtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBjb25zdCBjdXIgPSBzLmRyYWdnYWJsZS5jdXJyZW50O1xuICAgIGNvbnN0IGRyYWdnZWRFbCA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkPy5kcmFnZ2VkO1xuICAgIGNvbnN0IGJvdW5kcyA9IHMuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKTtcbiAgICBpZiAoIWN1ciB8fCAhZHJhZ2dlZEVsIHx8ICFib3VuZHMpIHJldHVybjtcbiAgICAvLyBjYW5jZWwgYW5pbWF0aW9ucyB3aGlsZSBkcmFnZ2luZ1xuICAgIGlmIChjdXIuZnJvbUJvYXJkPy5vcmlnICYmIHMuYW5pbWF0aW9uLmN1cnJlbnQ/LnBsYW4uYW5pbXMuaGFzKGN1ci5mcm9tQm9hcmQub3JpZykpXG4gICAgICBzLmFuaW1hdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIC8vIGlmIG1vdmluZyBwaWVjZSBpcyBnb25lLCBjYW5jZWxcbiAgICBpZiAoIWlzRHJhZ1BpZWNlVmFsaWQocywgY3VyKSkgY2FuY2VsKHMpO1xuICAgIGVsc2Uge1xuICAgICAgaWYgKHRyeVN0YXJ0RHJhZyhzLCBjdXIsIGN1ci5wb3MpKSB7XG4gICAgICAgIGN1ci5zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgcy5kb20ucmVkcmF3KCk7XG4gICAgICB9XG4gICAgICBpZiAoY3VyLnN0YXJ0ZWQpIHtcbiAgICAgICAgdXRpbC50cmFuc2xhdGVBYnMoXG4gICAgICAgICAgZHJhZ2dlZEVsLFxuICAgICAgICAgIFtcbiAgICAgICAgICAgIGN1ci5wb3NbMF0gLSBib3VuZHMubGVmdCAtIGJvdW5kcy53aWR0aCAvIChzLmRpbWVuc2lvbnMuZmlsZXMgKiAyKSxcbiAgICAgICAgICAgIGN1ci5wb3NbMV0gLSBib3VuZHMudG9wIC0gYm91bmRzLmhlaWdodCAvIChzLmRpbWVuc2lvbnMucmFua3MgKiAyKSxcbiAgICAgICAgICBdLFxuICAgICAgICAgIHMuc2NhbGVEb3duUGllY2VzID8gMC41IDogMSxcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoIWRyYWdnZWRFbC5zZ0RyYWdnaW5nKSB7XG4gICAgICAgICAgZHJhZ2dlZEVsLnNnRHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgICAgIHV0aWwuc2V0RGlzcGxheShkcmFnZ2VkRWwsIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhvdmVyID0gdXRpbC5nZXRLZXlBdERvbVBvcyhcbiAgICAgICAgICBjdXIucG9zLFxuICAgICAgICAgIHV0aWwuc2VudGVQb3Yocy5vcmllbnRhdGlvbiksXG4gICAgICAgICAgcy5kaW1lbnNpb25zLFxuICAgICAgICAgIGJvdW5kcyxcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoY3VyLmZyb21Cb2FyZClcbiAgICAgICAgICBjdXIuZnJvbUJvYXJkLmtleUhhc0NoYW5nZWQgPSBjdXIuZnJvbUJvYXJkLmtleUhhc0NoYW5nZWQgfHwgY3VyLmZyb21Cb2FyZC5vcmlnICE9PSBob3ZlcjtcbiAgICAgICAgZWxzZSBpZiAoY3VyLmZyb21PdXRzaWRlKVxuICAgICAgICAgIGN1ci5mcm9tT3V0c2lkZS5sZWZ0T3JpZ2luID1cbiAgICAgICAgICAgIGN1ci5mcm9tT3V0c2lkZS5sZWZ0T3JpZ2luIHx8XG4gICAgICAgICAgICAoISFjdXIuZnJvbU91dHNpZGUub3JpZ2luQm91bmRzICYmXG4gICAgICAgICAgICAgICF1dGlsLmlzSW5zaWRlUmVjdChjdXIuZnJvbU91dHNpZGUub3JpZ2luQm91bmRzLCBjdXIucG9zKSk7XG5cbiAgICAgICAgLy8gaWYgdGhlIGhvdmVyZWQgc3F1YXJlIGNoYW5nZWRcbiAgICAgICAgaWYgKGhvdmVyICE9PSBzLmhvdmVyZWQpIHtcbiAgICAgICAgICB1cGRhdGVIb3ZlcmVkU3F1YXJlcyhzLCBob3Zlcik7XG4gICAgICAgICAgaWYgKGN1ci50b3VjaCAmJiBzLmRvbS5lbGVtZW50cy5ib2FyZD8uc3F1YXJlT3Zlcikge1xuICAgICAgICAgICAgaWYgKGhvdmVyICYmIHMuZHJhZ2dhYmxlLnNob3dUb3VjaFNxdWFyZU92ZXJsYXkpIHtcbiAgICAgICAgICAgICAgdXRpbC50cmFuc2xhdGVBYnMoXG4gICAgICAgICAgICAgICAgcy5kb20uZWxlbWVudHMuYm9hcmQuc3F1YXJlT3ZlcixcbiAgICAgICAgICAgICAgICB1dGlsLnBvc1RvVHJhbnNsYXRlQWJzKHMuZGltZW5zaW9ucywgYm91bmRzKShcbiAgICAgICAgICAgICAgICAgIHV0aWwua2V5MnBvcyhob3ZlciksXG4gICAgICAgICAgICAgICAgICB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgMSxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgdXRpbC5zZXREaXNwbGF5KHMuZG9tLmVsZW1lbnRzLmJvYXJkLnNxdWFyZU92ZXIsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdXRpbC5zZXREaXNwbGF5KHMuZG9tLmVsZW1lbnRzLmJvYXJkLnNxdWFyZU92ZXIsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcHJvY2Vzc0RyYWcocyk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZShzOiBTdGF0ZSwgZTogc2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICAvLyBzdXBwb3J0IG9uZSBmaW5nZXIgdG91Y2ggb25seVxuICBpZiAocy5kcmFnZ2FibGUuY3VycmVudCAmJiAoIWUudG91Y2hlcyB8fCBlLnRvdWNoZXMubGVuZ3RoIDwgMikpIHtcbiAgICBjb25zdCBwb3MgPSB1dGlsLmV2ZW50UG9zaXRpb24oZSk7XG4gICAgaWYgKHBvcykgcy5kcmFnZ2FibGUuY3VycmVudC5wb3MgPSBwb3M7XG4gIH0gZWxzZSBpZiAoXG4gICAgKHMuc2VsZWN0ZWQgfHwgcy5zZWxlY3RlZFBpZWNlIHx8IHMuaGlnaGxpZ2h0LmhvdmVyZWQpICYmXG4gICAgIXMuZHJhZ2dhYmxlLmN1cnJlbnQgJiZcbiAgICAoIWUudG91Y2hlcyB8fCBlLnRvdWNoZXMubGVuZ3RoIDwgMilcbiAgKSB7XG4gICAgY29uc3QgcG9zID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpO1xuICAgIGNvbnN0IGJvdW5kcyA9IHMuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKTtcbiAgICBjb25zdCBob3ZlciA9XG4gICAgICBwb3MgJiYgYm91bmRzICYmIHV0aWwuZ2V0S2V5QXREb21Qb3MocG9zLCB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pLCBzLmRpbWVuc2lvbnMsIGJvdW5kcyk7XG4gICAgaWYgKGhvdmVyICE9PSBzLmhvdmVyZWQpIHVwZGF0ZUhvdmVyZWRTcXVhcmVzKHMsIGhvdmVyKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5kKHM6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHMuZHJhZ2dhYmxlLmN1cnJlbnQ7XG4gIGlmICghY3VyKSByZXR1cm47XG4gIC8vIGNyZWF0ZSBubyBjb3JyZXNwb25kaW5nIG1vdXNlIGV2ZW50XG4gIGlmIChlLnR5cGUgPT09ICd0b3VjaGVuZCcgJiYgZS5jYW5jZWxhYmxlICE9PSBmYWxzZSkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAvLyBUaGUgb3JpZ2luIG1heSBoYXZlIGNoYW5nZWQgc2luY2UgdGhlIGxhc3QgYW5pbWF0aW9uIGZyYW1lLlxuICBpZiAoIWlzRHJhZ1BpZWNlVmFsaWQocywgY3VyKSkge1xuICAgIGNhbmNlbChzKTtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gY29tcGFyaW5nIHdpdGggdGhlIG9yaWdpbiB0YXJnZXQgaXMgYW4gZWFzeSB3YXkgdG8gdGVzdCB0aGF0IHRoZSBlbmQgZXZlbnRcbiAgLy8gaGFzIHRoZSBzYW1lIHRvdWNoIG9yaWdpblxuICBpZiAoZS50eXBlID09PSAndG91Y2hlbmQnICYmIGN1ci5vcmlnaW5UYXJnZXQgIT09IGUudGFyZ2V0ICYmICFjdXIuZnJvbU91dHNpZGUpIHtcbiAgICBzLmRyYWdnYWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGlmIChzLmhvdmVyZWQgJiYgIXMuaGlnaGxpZ2h0LmhvdmVyZWQpIHVwZGF0ZUhvdmVyZWRTcXVhcmVzKHMsIHVuZGVmaW5lZCk7XG4gICAgcy5kb20ucmVkcmF3KCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGJvYXJkLnVuc2V0UHJlbW92ZShzKTtcbiAgYm9hcmQudW5zZXRQcmVkcm9wKHMpO1xuICAvLyB0b3VjaGVuZCBoYXMgbm8gcG9zaXRpb247IHNvIHVzZSB0aGUgbGFzdCB0b3VjaG1vdmUgcG9zaXRpb24gaW5zdGVhZFxuICBjb25zdCBldmVudFBvcyA9IHV0aWwuZXZlbnRQb3NpdGlvbihlKSB8fCBjdXIucG9zO1xuXG4gIGlmICh0cnlTdGFydERyYWcocywgY3VyLCBldmVudFBvcykpIHtcbiAgICBjdXIuc3RhcnRlZCA9IHRydWU7XG4gIH1cblxuICBjb25zdCBib3VuZHMgPSBzLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gIGNvbnN0IGRlc3QgPVxuICAgIGJvdW5kcyAmJiB1dGlsLmdldEtleUF0RG9tUG9zKGV2ZW50UG9zLCB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pLCBzLmRpbWVuc2lvbnMsIGJvdW5kcyk7XG4gIGNvbnN0IG9yaWdpbkhhbmRCb3VuZHMgPVxuICAgIGN1ci5mcm9tT3V0c2lkZSAmJiAhY3VyLnNwYXJlXG4gICAgICA/IHMuZG9tLmJvdW5kcy5oYW5kcy5ib3VuZHMoKS5nZXQoY3VyLnBpZWNlLmNvbG9yID09PSBzLm9yaWVudGF0aW9uID8gJ2JvdHRvbScgOiAndG9wJykgfHxcbiAgICAgICAgY3VyLmZyb21PdXRzaWRlLm9yaWdpbkJvdW5kc1xuICAgICAgOiB1bmRlZmluZWQ7XG5cbiAgaWYgKGRlc3QgJiYgY3VyLnN0YXJ0ZWQgJiYgY3VyLmZyb21Cb2FyZD8ub3JpZyAhPT0gZGVzdCkge1xuICAgIGlmIChjdXIuZnJvbU91dHNpZGUgJiYgIWJvYXJkLnByb21vdGlvbkRpYWxvZ0Ryb3AocywgY3VyLnBpZWNlLCBkZXN0KSlcbiAgICAgIGJvYXJkLnVzZXJEcm9wKHMsIGN1ci5waWVjZSwgZGVzdCk7XG4gICAgZWxzZSBpZiAoY3VyLmZyb21Cb2FyZCAmJiAhYm9hcmQucHJvbW90aW9uRGlhbG9nTW92ZShzLCBjdXIuZnJvbUJvYXJkLm9yaWcsIGRlc3QpKVxuICAgICAgYm9hcmQudXNlck1vdmUocywgY3VyLmZyb21Cb2FyZC5vcmlnLCBkZXN0KTtcbiAgfSBlbHNlIGlmIChcbiAgICBzLmRyYWdnYWJsZS5kZWxldGVPbkRyb3BPZmYgJiZcbiAgICBjdXIuc3RhcnRlZCAmJlxuICAgICFkZXN0ICYmXG4gICAgKCFvcmlnaW5IYW5kQm91bmRzIHx8ICF1dGlsLmlzSW5zaWRlUmVjdChvcmlnaW5IYW5kQm91bmRzLCBldmVudFBvcykpXG4gICkge1xuICAgIGlmIChjdXIuZnJvbUJvYXJkKSB7XG4gICAgICBzLnBpZWNlcy5kZWxldGUoY3VyLmZyb21Cb2FyZC5vcmlnKTtcbiAgICAgIGJvYXJkLmNsZWFyUHJlRGVzdHMocyk7XG4gICAgfSBlbHNlIGlmIChjdXIuZnJvbU91dHNpZGUgJiYgIWN1ci5zcGFyZSkgcmVtb3ZlRnJvbUhhbmQocywgY3VyLnBpZWNlKTtcblxuICAgIGlmIChzLmRyYWdnYWJsZS5hZGRUb0hhbmRPbkRyb3BPZmYpIHtcbiAgICAgIGNvbnN0IGhhbmRCb3VuZHMgPSBzLmRvbS5ib3VuZHMuaGFuZHMuYm91bmRzKCk7XG4gICAgICBjb25zdCBoYW5kQm91bmRzVG9wID0gaGFuZEJvdW5kcy5nZXQoJ3RvcCcpO1xuICAgICAgY29uc3QgaGFuZEJvdW5kc0JvdHRvbSA9IGhhbmRCb3VuZHMuZ2V0KCdib3R0b20nKTtcbiAgICAgIGlmIChoYW5kQm91bmRzVG9wICYmIHV0aWwuaXNJbnNpZGVSZWN0KGhhbmRCb3VuZHNUb3AsIGV2ZW50UG9zKSlcbiAgICAgICAgYWRkVG9IYW5kKHMsIHtcbiAgICAgICAgICBjb2xvcjogdXRpbC5vcHBvc2l0ZShzLm9yaWVudGF0aW9uKSxcbiAgICAgICAgICByb2xlOiBjdXIucGllY2Uucm9sZSxcbiAgICAgICAgfSk7XG4gICAgICBlbHNlIGlmIChoYW5kQm91bmRzQm90dG9tICYmIHV0aWwuaXNJbnNpZGVSZWN0KGhhbmRCb3VuZHNCb3R0b20sIGV2ZW50UG9zKSlcbiAgICAgICAgYWRkVG9IYW5kKHMsIHsgY29sb3I6IHMub3JpZW50YXRpb24sIHJvbGU6IGN1ci5waWVjZS5yb2xlIH0pO1xuXG4gICAgICBib2FyZC51bnNlbGVjdChzKTtcbiAgICB9XG4gICAgdXRpbC5jYWxsVXNlckZ1bmN0aW9uKHMuZXZlbnRzLmNoYW5nZSk7XG4gIH1cblxuICBpZiAoXG4gICAgY3VyLmZyb21Cb2FyZCAmJlxuICAgIChjdXIuZnJvbUJvYXJkLm9yaWcgPT09IGN1ci5mcm9tQm9hcmQucHJldmlvdXNseVNlbGVjdGVkIHx8IGN1ci5mcm9tQm9hcmQua2V5SGFzQ2hhbmdlZCkgJiZcbiAgICAoY3VyLmZyb21Cb2FyZC5vcmlnID09PSBkZXN0IHx8ICFkZXN0KVxuICApIHtcbiAgICB1bnNlbGVjdChzLCBjdXIsIGRlc3QpO1xuICB9IGVsc2UgaWYgKFxuICAgICghZGVzdCAmJiBjdXIuZnJvbU91dHNpZGU/LmxlZnRPcmlnaW4pIHx8XG4gICAgKGN1ci5mcm9tT3V0c2lkZT8ub3JpZ2luQm91bmRzICYmXG4gICAgICB1dGlsLmlzSW5zaWRlUmVjdChjdXIuZnJvbU91dHNpZGUub3JpZ2luQm91bmRzLCBjdXIucG9zKSAmJlxuICAgICAgY3VyLmZyb21PdXRzaWRlLnByZXZpb3VzbHlTZWxlY3RlZFBpZWNlICYmXG4gICAgICB1dGlsLnNhbWVQaWVjZShjdXIuZnJvbU91dHNpZGUucHJldmlvdXNseVNlbGVjdGVkUGllY2UsIGN1ci5waWVjZSkpXG4gICkge1xuICAgIHVuc2VsZWN0KHMsIGN1ciwgZGVzdCk7XG4gIH0gZWxzZSBpZiAoIXMuc2VsZWN0YWJsZS5lbmFibGVkICYmICFzLnByb21vdGlvbi5jdXJyZW50KSB7XG4gICAgdW5zZWxlY3QocywgY3VyLCBkZXN0KTtcbiAgfVxuXG4gIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIGlmICghcy5oaWdobGlnaHQuaG92ZXJlZCAmJiAhcy5wcm9tb3Rpb24uY3VycmVudCkgcy5ob3ZlcmVkID0gdW5kZWZpbmVkO1xuICBzLmRvbS5yZWRyYXcoKTtcbn1cblxuZnVuY3Rpb24gaGFuZFBpZWNlQ2xvc2VUbyhzOiBTdGF0ZSwgcG9zOiBzZy5OdW1iZXJQYWlyKTogYm9vbGVhbiB7XG4gIGZvciAoY29uc3QgY29sb3Igb2YgY29sb3JzKSB7XG4gICAgZm9yIChjb25zdCByb2xlIG9mIHMuaGFuZHMucm9sZXMpIHtcbiAgICAgIGNvbnN0IHBpZWNlID0geyBjb2xvciwgcm9sZSB9O1xuICAgICAgY29uc3QgcmVjdCA9IHMuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcygpLmdldCh1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKSk7XG5cbiAgICAgIGlmIChyZWN0ICYmIHV0aWwuaXNOZWFyUmVjdChyZWN0LCBwb3MsIHJlY3Qud2lkdGggLyAyKSAmJiBudW1iZXJJbkhhbmQocywgcGllY2UpID4gMClcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiB1bnNlbGVjdChzOiBTdGF0ZSwgY3VyOiBEcmFnQ3VycmVudCwgZGVzdD86IHNnLktleSk6IHZvaWQge1xuICBpZiAoY3VyLmZyb21Cb2FyZCAmJiBjdXIuZnJvbUJvYXJkLm9yaWcgPT09IGRlc3QpXG4gICAgdXRpbC5jYWxsVXNlckZ1bmN0aW9uKHMuZXZlbnRzLnVuc2VsZWN0LCBjdXIuZnJvbUJvYXJkLm9yaWcpO1xuICBlbHNlIGlmIChcbiAgICBjdXIuZnJvbU91dHNpZGU/Lm9yaWdpbkJvdW5kcyAmJlxuICAgIHV0aWwuaXNJbnNpZGVSZWN0KGN1ci5mcm9tT3V0c2lkZS5vcmlnaW5Cb3VuZHMsIGN1ci5wb3MpXG4gIClcbiAgICB1dGlsLmNhbGxVc2VyRnVuY3Rpb24ocy5ldmVudHMucGllY2VVbnNlbGVjdCwgY3VyLnBpZWNlKTtcbiAgYm9hcmQudW5zZWxlY3Qocyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWwoczogU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQpIHtcbiAgICBzLmRyYWdnYWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGlmICghcy5oaWdobGlnaHQuaG92ZXJlZCkgcy5ob3ZlcmVkID0gdW5kZWZpbmVkO1xuICAgIGJvYXJkLnVuc2VsZWN0KHMpO1xuICAgIHMuZG9tLnJlZHJhdygpO1xuICB9XG59XG5cbi8vIHN1cHBvcnQgb25lIGZpbmdlciB0b3VjaCBvbmx5IG9yIGxlZnQgY2xpY2tcbmV4cG9ydCBmdW5jdGlvbiB1bndhbnRlZEV2ZW50KGU6IHNnLk1vdWNoRXZlbnQpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICAhZS5pc1RydXN0ZWQgfHxcbiAgICAoZS5idXR0b24gIT09IHVuZGVmaW5lZCAmJiBlLmJ1dHRvbiAhPT0gMCkgfHxcbiAgICAoISFlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDEpXG4gICk7XG59XG5cbmZ1bmN0aW9uIHZhbGlkRGVzdFRvSG92ZXIoczogU3RhdGUsIGtleTogc2cuS2V5KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgKCEhcy5zZWxlY3RlZCAmJiAoYm9hcmQuY2FuTW92ZShzLCBzLnNlbGVjdGVkLCBrZXkpIHx8IGJvYXJkLmNhblByZW1vdmUocywgcy5zZWxlY3RlZCwga2V5KSkpIHx8XG4gICAgKCEhcy5zZWxlY3RlZFBpZWNlICYmXG4gICAgICAoYm9hcmQuY2FuRHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIGtleSkgfHwgYm9hcmQuY2FuUHJlZHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIGtleSkpKVxuICApO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVIb3ZlcmVkU3F1YXJlcyhzOiBTdGF0ZSwga2V5OiBzZy5LZXkgfCB1bmRlZmluZWQpOiB2b2lkIHtcbiAgY29uc3Qgc3FhdXJlRWxzID0gcy5kb20uZWxlbWVudHMuYm9hcmQ/LnNxdWFyZXMuY2hpbGRyZW47XG4gIGlmICghc3FhdXJlRWxzIHx8IHMucHJvbW90aW9uLmN1cnJlbnQpIHJldHVybjtcblxuICBjb25zdCBwcmV2SG92ZXIgPSBzLmhvdmVyZWQ7XG4gIGlmIChzLmhpZ2hsaWdodC5ob3ZlcmVkIHx8IChrZXkgJiYgdmFsaWREZXN0VG9Ib3ZlcihzLCBrZXkpKSkgcy5ob3ZlcmVkID0ga2V5O1xuICBlbHNlIHMuaG92ZXJlZCA9IHVuZGVmaW5lZDtcblxuICBjb25zdCBhc1NlbnRlID0gdXRpbC5zZW50ZVBvdihzLm9yaWVudGF0aW9uKTtcbiAgY29uc3QgY3VySW5kZXggPSBzLmhvdmVyZWQgJiYgdXRpbC5kb21TcXVhcmVJbmRleE9mS2V5KHMuaG92ZXJlZCwgYXNTZW50ZSwgcy5kaW1lbnNpb25zKTtcbiAgY29uc3QgY3VySG92ZXJFbCA9IGN1ckluZGV4ICE9PSB1bmRlZmluZWQgJiYgc3FhdXJlRWxzW2N1ckluZGV4XTtcbiAgaWYgKGN1ckhvdmVyRWwpIGN1ckhvdmVyRWwuY2xhc3NMaXN0LmFkZCgnaG92ZXInKTtcblxuICBjb25zdCBwcmV2SW5kZXggPSBwcmV2SG92ZXIgJiYgdXRpbC5kb21TcXVhcmVJbmRleE9mS2V5KHByZXZIb3ZlciwgYXNTZW50ZSwgcy5kaW1lbnNpb25zKTtcbiAgY29uc3QgcHJldkhvdmVyRWwgPSBwcmV2SW5kZXggIT09IHVuZGVmaW5lZCAmJiBzcWF1cmVFbHNbcHJldkluZGV4XTtcbiAgaWYgKHByZXZIb3ZlckVsKSBwcmV2SG92ZXJFbC5jbGFzc0xpc3QucmVtb3ZlKCdob3ZlcicpO1xufVxuIiwgImltcG9ydCB7IGFuaW0gfSBmcm9tICcuL2FuaW0uanMnO1xuaW1wb3J0IHsgdW5zZWxlY3QsIHVzZXJEcm9wLCB1c2VyTW92ZSB9IGZyb20gJy4vYm9hcmQuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgeyBQaWVjZSB9IGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgY2FsbFVzZXJGdW5jdGlvbiwgc2FtZVBpZWNlIH0gZnJvbSAnLi91dGlsLmpzJztcblxuLy8gQm90aCBwb2ludGVyIGFuZCBrZXlib2FyZCBjaG9pY2VzIGZpbmlzaCB0aGUgc2FtZSBwZW5kaW5nIG1vdmUgb3IgZHJvcC5cbmV4cG9ydCBmdW5jdGlvbiBjaG9vc2VQcm9tb3Rpb24oczogU3RhdGUsIHBpZWNlPzogUGllY2UpOiB2b2lkIHtcbiAgY29uc3QgY3VyID0gcy5wcm9tb3Rpb24uY3VycmVudDtcbiAgaWYgKHBpZWNlICYmIGN1cikge1xuICAgIHMucHJvbW90aW9uLmN1cnJlbnQgPSBzLmhvdmVyZWQgPSB1bmRlZmluZWQ7XG4gICAgY29uc3QgcHJvbSA9ICFzYW1lUGllY2UoY3VyLnBpZWNlLCBwaWVjZSk7XG4gICAgY29uc3QgdHVybiA9IHMudHVybkNvbG9yO1xuICAgIGNvbnN0IHBsYXkgPSAoczogU3RhdGUpID0+IHtcbiAgICAgIGlmIChzLnNlbGVjdGVkKSB1c2VyTW92ZShzLCBzLnNlbGVjdGVkLCBjdXIua2V5LCBwcm9tKTtcbiAgICAgIGVsc2UgaWYgKHMuc2VsZWN0ZWRQaWVjZSkgdXNlckRyb3Aocywgcy5zZWxlY3RlZFBpZWNlLCBjdXIua2V5LCBwcm9tKTtcbiAgICB9O1xuICAgIGlmIChjdXIuZHJhZ2dlZCB8fCAodHVybiAhPT0gcy5hY3RpdmVDb2xvciAmJiBzLmFjdGl2ZUNvbG9yICE9PSAnYm90aCcpKSBwbGF5KHMpO1xuICAgIGVsc2Uge1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzLmV2ZW50cy5zZWxlY3QsIGN1ci5rZXkpO1xuICAgICAgYW5pbShwbGF5LCBzKTtcbiAgICB9XG5cbiAgICAvLyBBbiBpbW1lZGlhdGUgbW92ZSBvciBkcm9wIGFkdmFuY2VzIHRoZSB0dXJuLiBRdWV1aW5nIG9uZSBkb2VzIG5vdC5cbiAgICBpZiAocy50dXJuQ29sb3IgIT09IHR1cm4pIGNhbGxVc2VyRnVuY3Rpb24ocy5wcm9tb3Rpb24uZXZlbnRzLmFmdGVyLCBwaWVjZSk7XG4gICAgZWxzZSBjYWxsVXNlckZ1bmN0aW9uKHMucHJvbW90aW9uLmV2ZW50cy5jYW5jZWwpO1xuICB9IGVsc2UgaWYgKGN1cikgdW5zZWxlY3Qocyk7XG4gIHMuZG9tLnJlZHJhdygpO1xufVxuIiwgImltcG9ydCB7IGFuaW0gfSBmcm9tICcuL2FuaW0uanMnO1xuaW1wb3J0ICogYXMgYm9hcmQgZnJvbSAnLi9ib2FyZC5qcyc7XG5pbXBvcnQgeyBjYW5jZWwgYXMgY2FuY2VsRHJhZyB9IGZyb20gJy4vZHJhZy5qcyc7XG5pbXBvcnQgeyBjYW5jZWwgYXMgY2FuY2VsRHJhdyB9IGZyb20gJy4vZHJhdy5qcyc7XG5pbXBvcnQgeyByZW1vdmVGcm9tSGFuZCB9IGZyb20gJy4vaGFuZHMuanMnO1xuaW1wb3J0IHsgY2hvb3NlUHJvbW90aW9uIH0gZnJvbSAnLi9wcm9tb3Rpb24uanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7XG4gIGNhbGxVc2VyRnVuY3Rpb24sXG4gIGNvbXB1dGVTcXVhcmVDZW50ZXIsXG4gIGRpc3RhbmNlU3EsXG4gIGlzS2V5LFxuICBrZXkycG9zLFxuICBvcHBvc2l0ZSxcbiAgcGFyc2VQaWVjZU5hbWUsXG4gIHBpZWNlTmFtZU9mLFxuICBwb3Mya2V5LFxuICBzYW1lUGllY2UsXG4gIHNlbnRlUG92LFxufSBmcm9tICcuL3V0aWwuanMnO1xuXG50eXBlIEN1cnNvciA9IHNnLktleSB8IHNnLlBpZWNlO1xuaW50ZXJmYWNlIFRhcmdldCB7XG4gIGN1cnNvcjogQ3Vyc29yO1xuICBjZW50ZXI6IHNnLlBvcztcbn1cblxuY29uc3QgZGlyZWN0aW9uczogUmVjb3JkPHN0cmluZywgc2cuUG9zPiA9IHtcbiAgQXJyb3dMZWZ0OiBbLTEsIDBdLFxuICBBcnJvd1JpZ2h0OiBbMSwgMF0sXG4gIEFycm93VXA6IFswLCAtMV0sXG4gIEFycm93RG93bjogWzAsIDFdLFxufTtcblxuY29uc3QgZGVmYXVsdEFyaWFMYWJlbCA9XG4gICdTaG9naSBib2FyZC4gVXNlIGFycm93IGtleXMgdG8gbmF2aWdhdGUsIEVudGVyIHRvIHNlbGVjdCwgRXNjYXBlIHRvIGNhbmNlbC4nO1xuY29uc3Qga2V5Ym9hcmRBdHRyaWJ1dGVzID0gbmV3IFdlYWtNYXA8XG4gIEhUTUxFbGVtZW50LFxuICB7IG9yaWdpbmFsQXR0cmlidXRlczogTWFwPHN0cmluZywgc3RyaW5nIHwgbnVsbD47IGFyaWFMYWJlbDogc3RyaW5nIH1cbj4oKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGZvY3VzQm9hcmQoczogU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHMua2V5Ym9hcmQuZW5hYmxlZCAmJiAhcy52aWV3T25seSAmJiAhcy5kb20uZGVzdHJveWVkKVxuICAgIHMuZG9tLmVsZW1lbnRzLmJvYXJkPy5ib2FyZC5mb2N1cyh7IHByZXZlbnRTY3JvbGw6IHRydWUgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kS2V5Ym9hcmQoczogU3RhdGUsIGVsOiBIVE1MRWxlbWVudCk6IHNnLlVuYmluZCB7XG4gIGNvbnN0IGZvY3VzID0gKCkgPT4gZm9jdXNCb2FyZChzKTtcbiAgY29uc3QgcmVkcmF3ID0gKCkgPT4ge1xuICAgIGlmIChzLmtleWJvYXJkLmVuYWJsZWQpIHMuZG9tLnJlZHJhdygpO1xuICB9O1xuICBjb25zdCBrZXlkb3duID0gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgaWYgKFxuICAgICAgIXMua2V5Ym9hcmQuZW5hYmxlZCB8fFxuICAgICAgcy52aWV3T25seSB8fFxuICAgICAgcy5kb20uZGVzdHJveWVkIHx8XG4gICAgICBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSBlbCB8fFxuICAgICAgZXZlbnQudGFyZ2V0ICE9PSBlbCB8fFxuICAgICAgZXZlbnQuZGVmYXVsdFByZXZlbnRlZCB8fFxuICAgICAgZXZlbnQuaXNDb21wb3NpbmcgfHxcbiAgICAgIGV2ZW50LmFsdEtleSB8fFxuICAgICAgZXZlbnQuY3RybEtleSB8fFxuICAgICAgZXZlbnQubWV0YUtleSB8fFxuICAgICAgZXZlbnQuc2hpZnRLZXlcbiAgICApXG4gICAgICByZXR1cm47XG4gICAgY29uc3QgZGlyZWN0aW9uID0gZGlyZWN0aW9uc1tldmVudC5rZXldO1xuICAgIGlmICghZGlyZWN0aW9uICYmIGV2ZW50LmtleSAhPT0gJ0VudGVyJyAmJiBldmVudC5rZXkgIT09ICdFc2NhcGUnKSByZXR1cm47XG4gICAgaWYgKChzLmRyYWdnYWJsZS5jdXJyZW50IHx8IHMuZHJhd2FibGUuY3VycmVudCkgJiYgZXZlbnQua2V5ICE9PSAnRXNjYXBlJykgcmV0dXJuO1xuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAvLyBIb2xkaW5nIEVudGVyIG11c3Qgbm90IHNlbGVjdCBhbmQgdGhlbiBpbW1lZGlhdGVseSBjb25maXJtIGEgcHJvbW90aW9uLlxuICAgIGlmIChldmVudC5yZXBlYXQgJiYgIWRpcmVjdGlvbikgcmV0dXJuO1xuXG4gICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgIGNvbnN0IGhhc1NlbGVjdGlvbiA9ICEhKFxuICAgICAgICBzLnNlbGVjdGVkIHx8XG4gICAgICAgIHMuc2VsZWN0ZWRQaWVjZSB8fFxuICAgICAgICBzLnByb21vdGlvbi5jdXJyZW50IHx8XG4gICAgICAgIHMuZHJhZ2dhYmxlLmN1cnJlbnQgfHxcbiAgICAgICAgcy5kcmF3YWJsZS5jdXJyZW50XG4gICAgICApO1xuICAgICAgY2FuY2VsRHJhZyhzKTtcbiAgICAgIGNhbmNlbERyYXcocyk7XG4gICAgICBib2FyZC5jYW5jZWxNb3ZlT3JEcm9wKHMpO1xuICAgICAgaWYgKCFoYXNTZWxlY3Rpb24pIGVsLmJsdXIoKTtcbiAgICB9IGVsc2UgaWYgKHMucHJvbW90aW9uLmN1cnJlbnQpIHtcbiAgICAgIGNvbnN0IGN1ciA9IHMucHJvbW90aW9uLmN1cnJlbnQ7XG4gICAgICBpZiAoZGlyZWN0aW9uKSBjdXIua2V5Ym9hcmRDaG9pY2UgPSAhKGN1ci5rZXlib2FyZENob2ljZSA/PyB0cnVlKTtcbiAgICAgIGVsc2UgY2hvb3NlUHJvbW90aW9uKHMsIChjdXIua2V5Ym9hcmRDaG9pY2UgPz8gdHJ1ZSkgPyBjdXIucHJvbW90ZWRQaWVjZSA6IGN1ci5waWVjZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGN1cnNvciA9IGN1cnJlbnRDdXJzb3Iocyk7XG4gICAgICBpZiAoZGlyZWN0aW9uKSBtb3ZlQ3Vyc29yKHMsIGN1cnNvciwgZGlyZWN0aW9uKTtcbiAgICAgIGVsc2UgYWN0aXZhdGUocywgY3Vyc29yKTtcbiAgICB9XG4gICAgcy5kb20ucmVkcmF3KCk7XG4gIH07XG5cbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGtleWRvd24pO1xuICBlbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmb2N1cywgdHJ1ZSk7XG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgcmVkcmF3KTtcbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIHJlZHJhdyk7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGtleWRvd24pO1xuICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZvY3VzLCB0cnVlKTtcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1cycsIHJlZHJhdyk7XG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignYmx1cicsIHJlZHJhdyk7XG4gICAgcy5rZXlib2FyZC5mb2N1c2VkID0gZmFsc2U7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzeW5jS2V5Ym9hcmRTdGF0ZShzOiBTdGF0ZSwgZWxlbWVudHM6IHNnLkJvYXJkRWxlbWVudHMpOiB2b2lkIHtcbiAgY29uc3QgZW5hYmxlZCA9IHMua2V5Ym9hcmQuZW5hYmxlZCAmJiAhcy52aWV3T25seTtcbiAgaWYgKGVuYWJsZWQpIGN1cnJlbnRDdXJzb3Iocyk7XG4gIHMua2V5Ym9hcmQuZm9jdXNlZCA9IGVuYWJsZWQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCA9PT0gZWxlbWVudHMuYm9hcmQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJLZXlib2FyZChzOiBTdGF0ZSwgZWxlbWVudHM6IHNnLkJvYXJkRWxlbWVudHMpOiB2b2lkIHtcbiAgY29uc3QgZW5hYmxlZCA9IHMua2V5Ym9hcmQuZW5hYmxlZCAmJiAhcy52aWV3T25seTtcbiAgY29uc3QgZWwgPSBlbGVtZW50cy5ib2FyZDtcbiAgY29uc3QgcHJldmlvdXMgPSBrZXlib2FyZEF0dHJpYnV0ZXMuZ2V0KGVsKTtcbiAgaWYgKGVuYWJsZWQpIHtcbiAgICBjb25zdCBhcmlhTGFiZWwgPSBzLmtleWJvYXJkLmFyaWFMYWJlbCA/PyBkZWZhdWx0QXJpYUxhYmVsO1xuICAgIGlmICghcHJldmlvdXMpIHtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBuZXcgTWFwKFtcbiAgICAgICAgWyd0YWJpbmRleCcsICcwJ10sXG4gICAgICAgIFsncm9sZScsICdncm91cCddLFxuICAgICAgICBbJ2FyaWEtbGFiZWwnLCBhcmlhTGFiZWxdLFxuICAgICAgXSk7XG4gICAgICBjb25zdCBvcmlnaW5hbEF0dHJpYnV0ZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nIHwgbnVsbD4oKTtcbiAgICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIG9yaWdpbmFsQXR0cmlidXRlcy5zZXQobmFtZSwgZWwuZ2V0QXR0cmlidXRlKG5hbWUpKTtcbiAgICAgICAgZWwuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIGtleWJvYXJkQXR0cmlidXRlcy5zZXQoZWwsIHsgb3JpZ2luYWxBdHRyaWJ1dGVzLCBhcmlhTGFiZWwgfSk7XG4gICAgfSBlbHNlIGlmIChwcmV2aW91cy5hcmlhTGFiZWwgIT09IGFyaWFMYWJlbCkge1xuICAgICAgZWwuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgYXJpYUxhYmVsKTtcbiAgICAgIHByZXZpb3VzLmFyaWFMYWJlbCA9IGFyaWFMYWJlbDtcbiAgICB9XG4gIH0gZWxzZSBpZiAocHJldmlvdXMpIHtcbiAgICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgcHJldmlvdXMub3JpZ2luYWxBdHRyaWJ1dGVzKSB7XG4gICAgICBpZiAodmFsdWUgPT09IG51bGwpIGVsLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICAgIGVsc2UgZWwuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcbiAgICB9XG4gICAga2V5Ym9hcmRBdHRyaWJ1dGVzLmRlbGV0ZShlbCk7XG4gIH1cbiAgaWYgKCFlbmFibGVkICYmICFwcmV2aW91cykgcmV0dXJuO1xuXG4gIGNvbnN0IGNob2ljZXMgPSBlbGVtZW50cy5wcm9tb3Rpb24/LnF1ZXJ5U2VsZWN0b3JBbGwoJ3BpZWNlJyk7XG4gIGNob2ljZXM/LmZvckVhY2goKHBpZWNlLCBpbmRleCkgPT4ge1xuICAgIHBpZWNlLmNsYXNzTGlzdC50b2dnbGUoXG4gICAgICAna2V5Ym9hcmQtY3Vyc29yJyxcbiAgICAgIGVuYWJsZWQgJiZcbiAgICAgICAgISFzLnByb21vdGlvbi5jdXJyZW50ICYmXG4gICAgICAgIGluZGV4ID09PSAoKHMucHJvbW90aW9uLmN1cnJlbnQua2V5Ym9hcmRDaG9pY2UgPz8gdHJ1ZSkgPyAwIDogMSksXG4gICAgKTtcbiAgICBwaWVjZS5jbGFzc0xpc3QudG9nZ2xlKCdrZXlib2FyZC1mb2N1c2VkJywgcy5rZXlib2FyZC5mb2N1c2VkKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGN1cnJlbnRDdXJzb3IoczogU3RhdGUpOiBDdXJzb3Ige1xuICBjb25zdCBjdXIgPSBzLmtleWJvYXJkLmN1cnJlbnQ7XG4gIGlmIChpc0tleShjdXIpKSB7XG4gICAgY29uc3QgW2ZpbGUsIHJhbmtdID0ga2V5MnBvcyhjdXIpO1xuICAgIGlmIChmaWxlID49IDAgJiYgZmlsZSA8IHMuZGltZW5zaW9ucy5maWxlcyAmJiByYW5rID49IDAgJiYgcmFuayA8IHMuZGltZW5zaW9ucy5yYW5rcylcbiAgICAgIHJldHVybiBjdXI7XG4gIH0gZWxzZSBpZiAoXG4gICAgY3VyICYmXG4gICAgcy5oYW5kcy5yb2xlcy5pbmNsdWRlcyhjdXIucm9sZSkgJiZcbiAgICBoYW5kVGFyZ2V0cyhzLCBjdXIuY29sb3IpLnNvbWUoXG4gICAgICAodGFyZ2V0KSA9PiAhaXNLZXkodGFyZ2V0LmN1cnNvcikgJiYgdGFyZ2V0LmN1cnNvci5yb2xlID09PSBjdXIucm9sZSxcbiAgICApXG4gIClcbiAgICByZXR1cm4gY3VyO1xuICBzLmtleWJvYXJkLmN1cnJlbnQgPSBwb3Mya2V5KFtcbiAgICBNYXRoLmZsb29yKHMuZGltZW5zaW9ucy5maWxlcyAvIDIpLFxuICAgIE1hdGguZmxvb3Iocy5kaW1lbnNpb25zLnJhbmtzIC8gMiksXG4gIF0pO1xuICByZXR1cm4gcy5rZXlib2FyZC5jdXJyZW50O1xufVxuXG5mdW5jdGlvbiBzY3JlZW5Qb3MoczogU3RhdGUsIGtleTogc2cuS2V5KTogc2cuUG9zIHtcbiAgY29uc3QgW2ZpbGUsIHJhbmtdID0ga2V5MnBvcyhrZXkpO1xuICByZXR1cm4gc2VudGVQb3Yocy5vcmllbnRhdGlvbilcbiAgICA/IFtzLmRpbWVuc2lvbnMuZmlsZXMgLSAxIC0gZmlsZSwgcmFua11cbiAgICA6IFtmaWxlLCBzLmRpbWVuc2lvbnMucmFua3MgLSAxIC0gcmFua107XG59XG5cbmZ1bmN0aW9uIHNjcmVlbktleShzOiBTdGF0ZSwgW3gsIHldOiBzZy5Qb3MpOiBzZy5LZXkge1xuICByZXR1cm4gcG9zMmtleShcbiAgICBzZW50ZVBvdihzLm9yaWVudGF0aW9uKSA/IFtzLmRpbWVuc2lvbnMuZmlsZXMgLSAxIC0geCwgeV0gOiBbeCwgcy5kaW1lbnNpb25zLnJhbmtzIC0gMSAtIHldLFxuICApO1xufVxuXG5mdW5jdGlvbiBjZW50ZXIocmVjdDogRE9NUmVjdCk6IHNnLlBvcyB7XG4gIHJldHVybiBbcmVjdC5sZWZ0ICsgcmVjdC53aWR0aCAvIDIsIHJlY3QudG9wICsgcmVjdC5oZWlnaHQgLyAyXTtcbn1cblxuZnVuY3Rpb24gaGFuZFRhcmdldHMoczogU3RhdGUsIGNvbG9yOiBzZy5Db2xvcik6IFRhcmdldFtdIHtcbiAgY29uc3QgaGFuZCA9IHMuZG9tLmVsZW1lbnRzLmhhbmRzPy5bY29sb3IgPT09IHMub3JpZW50YXRpb24gPyAnYm90dG9tJyA6ICd0b3AnXTtcbiAgaWYgKCFoYW5kIHx8IGdldENvbXB1dGVkU3R5bGUoaGFuZCkudmlzaWJpbGl0eSA9PT0gJ2hpZGRlbicpIHJldHVybiBbXTtcbiAgY29uc3QgdGFyZ2V0czogVGFyZ2V0W10gPSBbXTtcbiAgZm9yIChjb25zdCBbbmFtZSwgYm91bmRzXSBvZiBzLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMoKSkge1xuICAgIGNvbnN0IHBpZWNlID0gcGFyc2VQaWVjZU5hbWUobmFtZSk7XG4gICAgLy8gSW5jbHVkZSBlbXB0eSBzbG90czsgc2VsZWN0aW9uIHN0aWxsIHVzZXMgdGhlIGV4aXN0aW5nIGhhbmQgcmVzdHJpY3Rpb25zLlxuICAgIGlmIChwaWVjZS5jb2xvciA9PT0gY29sb3IgJiYgYm91bmRzLndpZHRoID4gMCAmJiBib3VuZHMuaGVpZ2h0ID4gMClcbiAgICAgIHRhcmdldHMucHVzaCh7IGN1cnNvcjogcGllY2UsIGNlbnRlcjogY2VudGVyKGJvdW5kcykgfSk7XG4gIH1cbiAgcmV0dXJuIHRhcmdldHM7XG59XG5cbmZ1bmN0aW9uIG5lYXJlc3QodGFyZ2V0czogVGFyZ2V0W10sIG9yaWdpbjogc2cuUG9zKTogVGFyZ2V0IHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHRhcmdldHMucmVkdWNlPFRhcmdldCB8IHVuZGVmaW5lZD4oXG4gICAgKGJlc3QsIHRhcmdldCkgPT5cbiAgICAgICFiZXN0IHx8IGRpc3RhbmNlU3EodGFyZ2V0LmNlbnRlciwgb3JpZ2luKSA8IGRpc3RhbmNlU3EoYmVzdC5jZW50ZXIsIG9yaWdpbikgPyB0YXJnZXQgOiBiZXN0LFxuICAgIHVuZGVmaW5lZCxcbiAgKTtcbn1cblxuZnVuY3Rpb24gYmV5b25kKHJlY3Q6IERPTVJlY3QsIGJvdW5kczogRE9NUmVjdCwgW2R4LCBkeV06IHNnLlBvcyk6IGJvb2xlYW4ge1xuICByZXR1cm4gZHggPCAwXG4gICAgPyByZWN0LnJpZ2h0IDw9IGJvdW5kcy5sZWZ0ICsgMVxuICAgIDogZHggPiAwXG4gICAgICA/IHJlY3QubGVmdCA+PSBib3VuZHMucmlnaHQgLSAxXG4gICAgICA6IGR5IDwgMFxuICAgICAgICA/IHJlY3QuYm90dG9tIDw9IGJvdW5kcy50b3AgKyAxXG4gICAgICAgIDogcmVjdC50b3AgPj0gYm91bmRzLmJvdHRvbSAtIDE7XG59XG5cbmZ1bmN0aW9uIG1vdmVDdXJzb3IoczogU3RhdGUsIGN1cnNvcjogQ3Vyc29yLCBkaXJlY3Rpb246IHNnLlBvcyk6IHZvaWQge1xuICBjb25zdCBib3VuZHMgPSBzLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gIGlmICghYm91bmRzIHx8ICFib3VuZHMud2lkdGggfHwgIWJvdW5kcy5oZWlnaHQpIHJldHVybjtcbiAgaWYgKGlzS2V5KGN1cnNvcikpIHtcbiAgICBjb25zdCBbeCwgeV0gPSBzY3JlZW5Qb3MocywgY3Vyc29yKTtcbiAgICBjb25zdCBuZXh0OiBzZy5Qb3MgPSBbeCArIGRpcmVjdGlvblswXSwgeSArIGRpcmVjdGlvblsxXV07XG4gICAgaWYgKFxuICAgICAgbmV4dFswXSA+PSAwICYmXG4gICAgICBuZXh0WzBdIDwgcy5kaW1lbnNpb25zLmZpbGVzICYmXG4gICAgICBuZXh0WzFdID49IDAgJiZcbiAgICAgIG5leHRbMV0gPCBzLmRpbWVuc2lvbnMucmFua3NcbiAgICApIHtcbiAgICAgIHMua2V5Ym9hcmQuY3VycmVudCA9IHNjcmVlbktleShzLCBuZXh0KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgdGFyZ2V0czogVGFyZ2V0W10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IFtzbG90LCByZWN0XSBvZiBzLmRvbS5ib3VuZHMuaGFuZHMuYm91bmRzKCkpIHtcbiAgICAgIGlmIChiZXlvbmQocmVjdCwgYm91bmRzLCBkaXJlY3Rpb24pKVxuICAgICAgICB0YXJnZXRzLnB1c2goXG4gICAgICAgICAgLi4uaGFuZFRhcmdldHMocywgc2xvdCA9PT0gJ2JvdHRvbScgPyBzLm9yaWVudGF0aW9uIDogb3Bwb3NpdGUocy5vcmllbnRhdGlvbikpLFxuICAgICAgICApO1xuICAgIH1cbiAgICBjb25zdCBvcmlnaW4gPSBjb21wdXRlU3F1YXJlQ2VudGVyKGN1cnNvciwgc2VudGVQb3Yocy5vcmllbnRhdGlvbiksIHMuZGltZW5zaW9ucywgYm91bmRzKTtcbiAgICBzLmtleWJvYXJkLmN1cnJlbnQgPSBuZWFyZXN0KHRhcmdldHMsIG9yaWdpbik/LmN1cnNvciA/PyBjdXJzb3I7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgcmVjdCA9IHMuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcygpLmdldChwaWVjZU5hbWVPZihjdXJzb3IpKTtcbiAgICBpZiAoIXJlY3QgfHwgIXJlY3Qud2lkdGggfHwgIXJlY3QuaGVpZ2h0KSB7XG4gICAgICBzLmtleWJvYXJkLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgICBjdXJyZW50Q3Vyc29yKHMpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBvcmlnaW4gPSBjZW50ZXIocmVjdCk7XG4gICAgY29uc3QgW2R4LCBkeV0gPSBkaXJlY3Rpb247XG4gICAgY29uc3QgdGFyZ2V0cyA9IGhhbmRUYXJnZXRzKHMsIGN1cnNvci5jb2xvcikuZmlsdGVyKCh0YXJnZXQpID0+IHtcbiAgICAgIGNvbnN0IHggPSB0YXJnZXQuY2VudGVyWzBdIC0gb3JpZ2luWzBdO1xuICAgICAgY29uc3QgeSA9IHRhcmdldC5jZW50ZXJbMV0gLSBvcmlnaW5bMV07XG4gICAgICBjb25zdCBmb3J3YXJkID0geCAqIGR4ICsgeSAqIGR5O1xuICAgICAgY29uc3Qgc2lkZXdheXMgPSBNYXRoLmFicyh4ICogZHkgLSB5ICogZHgpO1xuICAgICAgcmV0dXJuIGZvcndhcmQgPiAxICYmIHNpZGV3YXlzIDw9IGZvcndhcmQgKyAxO1xuICAgIH0pO1xuICAgIC8vIFRoZSBuZWFyZXN0IGJvYXJkIGVkZ2UgaXMgYSBjYW5kaWRhdGUgb25seSB3aGVuIHBvaW50aW5nIGJhY2sgdG93YXJkIGl0LlxuICAgIGlmIChcbiAgICAgIChkeCA+IDAgJiYgb3JpZ2luWzBdIDwgYm91bmRzLmxlZnQpIHx8XG4gICAgICAoZHggPCAwICYmIG9yaWdpblswXSA+IGJvdW5kcy5yaWdodCkgfHxcbiAgICAgIChkeSA+IDAgJiYgb3JpZ2luWzFdIDwgYm91bmRzLnRvcCkgfHxcbiAgICAgIChkeSA8IDAgJiYgb3JpZ2luWzFdID4gYm91bmRzLmJvdHRvbSlcbiAgICApIHtcbiAgICAgIGNvbnN0IHggPSBNYXRoLm1heChcbiAgICAgICAgMCxcbiAgICAgICAgTWF0aC5taW4oXG4gICAgICAgICAgcy5kaW1lbnNpb25zLmZpbGVzIC0gMSxcbiAgICAgICAgICBNYXRoLmZsb29yKCgob3JpZ2luWzBdIC0gYm91bmRzLmxlZnQpIC8gYm91bmRzLndpZHRoKSAqIHMuZGltZW5zaW9ucy5maWxlcyksXG4gICAgICAgICksXG4gICAgICApO1xuICAgICAgY29uc3QgeSA9IE1hdGgubWF4KFxuICAgICAgICAwLFxuICAgICAgICBNYXRoLm1pbihcbiAgICAgICAgICBzLmRpbWVuc2lvbnMucmFua3MgLSAxLFxuICAgICAgICAgIE1hdGguZmxvb3IoKChvcmlnaW5bMV0gLSBib3VuZHMudG9wKSAvIGJvdW5kcy5oZWlnaHQpICogcy5kaW1lbnNpb25zLnJhbmtzKSxcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgICBjb25zdCBrZXkgPSBzY3JlZW5LZXkocywgW3gsIHldKTtcbiAgICAgIHRhcmdldHMucHVzaCh7XG4gICAgICAgIGN1cnNvcjoga2V5LFxuICAgICAgICBjZW50ZXI6IGNvbXB1dGVTcXVhcmVDZW50ZXIoa2V5LCBzZW50ZVBvdihzLm9yaWVudGF0aW9uKSwgcy5kaW1lbnNpb25zLCBib3VuZHMpLFxuICAgICAgfSk7XG4gICAgfVxuICAgIHMua2V5Ym9hcmQuY3VycmVudCA9IG5lYXJlc3QodGFyZ2V0cywgb3JpZ2luKT8uY3Vyc29yID8/IGN1cnNvcjtcbiAgfVxufVxuXG5mdW5jdGlvbiBhY3RpdmF0ZShzOiBTdGF0ZSwgY3Vyc29yOiBDdXJzb3IpOiB2b2lkIHtcbiAgYm9hcmQudW5zZXRQcmVtb3ZlKHMpO1xuICBib2FyZC51bnNldFByZWRyb3Aocyk7XG5cbiAgY29uc3Qgd2FzU2VsZWN0ZWQgPSBpc0tleShjdXJzb3IpXG4gICAgPyBzLnNlbGVjdGVkID09PSBjdXJzb3JcbiAgICA6ICEhcy5zZWxlY3RlZFBpZWNlICYmIHNhbWVQaWVjZShzLnNlbGVjdGVkUGllY2UsIGN1cnNvcik7XG4gIGlmICghaXNLZXkoY3Vyc29yKSkge1xuICAgIGlmIChzLnNlbGVjdGFibGUuZGVsZXRlT25Ub3VjaCkge1xuICAgICAgcmVtb3ZlRnJvbUhhbmQocywgY3Vyc29yKTtcbiAgICAgIGJvYXJkLnVuc2VsZWN0KHMpO1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzLmV2ZW50cy5jaGFuZ2UpO1xuICAgIH0gZWxzZSBib2FyZC5zZWxlY3RQaWVjZShzLCBjdXJzb3IpO1xuICB9IGVsc2UgaWYgKHMuc2VsZWN0YWJsZS5kZWxldGVPblRvdWNoKSBib2FyZC5kZWxldGVQaWVjZShzLCBjdXJzb3IpO1xuICBlbHNlIGlmIChcbiAgICAhcy5zZWxlY3RhYmxlLmVuYWJsZWQgfHxcbiAgICAoIShzLnNlbGVjdGVkICYmIGJvYXJkLnByb21vdGlvbkRpYWxvZ01vdmUocywgcy5zZWxlY3RlZCwgY3Vyc29yKSkgJiZcbiAgICAgICEocy5zZWxlY3RlZFBpZWNlICYmIGJvYXJkLnByb21vdGlvbkRpYWxvZ0Ryb3Aocywgcy5zZWxlY3RlZFBpZWNlLCBjdXJzb3IpKSlcbiAgKVxuICAgIGFuaW0oKHN0YXRlKSA9PiBib2FyZC5zZWxlY3RTcXVhcmUoc3RhdGUsIGN1cnNvciksIHMpO1xuXG4gIC8vIFBvaW50ZXIgY2xpY2tzIGZpbmlzaCB0aGlzIHRvZ2dsZSBvbiBtb3VzZXVwIHdoZW4gZHJhZ2dpbmcgaXMgZW5hYmxlZC5cbiAgaWYgKHdhc1NlbGVjdGVkICYmIHMuZHJhZ2dhYmxlLmVuYWJsZWQpIHtcbiAgICBpZiAoaXNLZXkoY3Vyc29yKSAmJiBzLnNlbGVjdGVkID09PSBjdXJzb3IpIHtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24ocy5ldmVudHMudW5zZWxlY3QsIGN1cnNvcik7XG4gICAgICBib2FyZC51bnNlbGVjdChzKTtcbiAgICB9IGVsc2UgaWYgKCFpc0tleShjdXJzb3IpICYmIHMuc2VsZWN0ZWRQaWVjZSAmJiBzYW1lUGllY2Uocy5zZWxlY3RlZFBpZWNlLCBjdXJzb3IpKSB7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHMuZXZlbnRzLnBpZWNlVW5zZWxlY3QsIGN1cnNvcik7XG4gICAgICBib2FyZC51bnNlbGVjdChzKTtcbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgeyB1bnNlbGVjdCB9IGZyb20gJy4vYm9hcmQuanMnO1xuaW1wb3J0ICogYXMgZHJhZyBmcm9tICcuL2RyYWcuanMnO1xuaW1wb3J0ICogYXMgZHJhdyBmcm9tICcuL2RyYXcuanMnO1xuaW1wb3J0IHsgYmluZEtleWJvYXJkLCBmb2N1c0JvYXJkIH0gZnJvbSAnLi9rZXlib2FyZC5qcyc7XG5pbXBvcnQgeyBjaG9vc2VQcm9tb3Rpb24gfSBmcm9tICcuL3Byb21vdGlvbi5qcyc7XG5pbXBvcnQgeyB1c2VzQm91bmRzIH0gZnJvbSAnLi9zaGFwZXMuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7XG4gIGV2ZW50UG9zaXRpb24sXG4gIGdldEhhbmRQaWVjZUF0RG9tUG9zLFxuICBpc01pZGRsZUJ1dHRvbixcbiAgaXNQaWVjZU5vZGUsXG4gIGlzUmlnaHRCdXR0b24sXG59IGZyb20gJy4vdXRpbC5qcyc7XG5cbnR5cGUgTW91Y2hCaW5kID0gKGU6IHNnLk1vdWNoRXZlbnQpID0+IHZvaWQ7XG50eXBlIFN0YXRlTW91Y2hCaW5kID0gKGQ6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KSA9PiB2b2lkO1xuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJCb3VuZHMoczogU3RhdGUpOiB2b2lkIHtcbiAgcy5kb20uYm91bmRzLmJvYXJkLmJvdW5kcy5jbGVhcigpO1xuICBzLmRvbS5ib3VuZHMuaGFuZHMuYm91bmRzLmNsZWFyKCk7XG4gIHMuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcy5jbGVhcigpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVmcmVzaEJvdW5kcyhzOiBTdGF0ZSk6IHZvaWQge1xuICBjbGVhckJvdW5kcyhzKTtcbiAgaWYgKHVzZXNCb3VuZHMocy5kcmF3YWJsZS5zaGFwZXMuY29uY2F0KHMuZHJhd2FibGUuYXV0b1NoYXBlcykpKSBzLmRvbS5yZWRyYXdTaGFwZXMoKTtcbn1cblxuZnVuY3Rpb24gb25SZXNpemUoczogU3RhdGUpOiAoKSA9PiB2b2lkIHtcbiAgcmV0dXJuICgpID0+IHJlZnJlc2hCb3VuZHMocyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kQm9hcmQoczogU3RhdGUsIGJvYXJkRWxzOiBzZy5Cb2FyZEVsZW1lbnRzKTogc2cuVW5iaW5kIHtcbiAgb2JzZXJ2ZVJlc2l6ZShzLCBib2FyZEVscy5ib2FyZCk7XG4gIGNvbnN0IHVuYmluZHM6IHNnLlVuYmluZFtdID0gW107XG5cbiAgaWYgKCFzLnZpZXdPbmx5KSB7XG4gICAgY29uc3QgcGllY2VzRWwgPSBib2FyZEVscy5waWVjZXM7XG4gICAgY29uc3QgcHJvbW90aW9uRWwgPSBib2FyZEVscy5wcm9tb3Rpb247XG5cbiAgICAvLyBDYW5ub3QgYmUgcGFzc2l2ZSwgYmVjYXVzZSB3ZSBwcmV2ZW50IHRvdWNoIHNjcm9sbGluZyBhbmQgZHJhZ2dpbmcgb2Ygc2VsZWN0ZWQgZWxlbWVudHMuXG4gICAgY29uc3Qgb25TdGFydCA9IHN0YXJ0RHJhZ09yRHJhdyhzKSBhcyBFdmVudExpc3RlbmVyO1xuICAgIGZvciAoY29uc3QgZXYgb2YgWyd0b3VjaHN0YXJ0JywgJ21vdXNlZG93biddKVxuICAgICAgdW5iaW5kcy5wdXNoKHVuYmluZGFibGUocGllY2VzRWwsIGV2LCBvblN0YXJ0LCB7IHBhc3NpdmU6IGZhbHNlIH0pKTtcbiAgICB1bmJpbmRzLnB1c2goXG4gICAgICB1bmJpbmRhYmxlKHBpZWNlc0VsLCAnY29udGV4dG1lbnUnLCAoZSkgPT4ge1xuICAgICAgICBpZiAocy5kaXNhYmxlQ29udGV4dE1lbnUgfHwgcy5kcmF3YWJsZS5lbmFibGVkKSBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9KSxcbiAgICApO1xuXG4gICAgaWYgKHByb21vdGlvbkVsKSB7XG4gICAgICBjb25zdCBwaWVjZVNlbGVjdGlvbiA9IChlOiBzZy5Nb3VjaEV2ZW50KSA9PiBwcm9tb3RlKHMsIGUpO1xuICAgICAgdW5iaW5kcy5wdXNoKHVuYmluZGFibGUocHJvbW90aW9uRWwsICdjbGljaycsIHBpZWNlU2VsZWN0aW9uIGFzIEV2ZW50TGlzdGVuZXIpKTtcbiAgICAgIHVuYmluZHMucHVzaChcbiAgICAgICAgdW5iaW5kYWJsZShwcm9tb3Rpb25FbCwgJ2NvbnRleHRtZW51JywgKGUpID0+IHtcbiAgICAgICAgICBpZiAocy5kaXNhYmxlQ29udGV4dE1lbnUpIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfSksXG4gICAgICApO1xuICAgIH1cblxuICAgIHVuYmluZHMucHVzaChiaW5kS2V5Ym9hcmQocywgYm9hcmRFbHMuYm9hcmQpKTtcbiAgfVxuXG4gIHJldHVybiAoKSA9PiB7XG4gICAgdW5iaW5kcy5mb3JFYWNoKChmKSA9PiB7XG4gICAgICBmKCk7XG4gICAgfSk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kSGFuZChzOiBTdGF0ZSwgaGFuZEVsOiBIVE1MRWxlbWVudCk6IHNnLlVuYmluZCB7XG4gIG9ic2VydmVSZXNpemUocywgaGFuZEVsKTtcbiAgY29uc3QgdW5iaW5kczogc2cuVW5iaW5kW10gPSBbXTtcblxuICBpZiAoIXMudmlld09ubHkpIHtcbiAgICBjb25zdCBvblN0YXJ0ID0gc3RhcnREcmFnRnJvbUhhbmQocykgYXMgRXZlbnRMaXN0ZW5lcjtcbiAgICBmb3IgKGNvbnN0IGV2IG9mIFsnbW91c2Vkb3duJywgJ3RvdWNoc3RhcnQnXSlcbiAgICAgIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKGhhbmRFbCwgZXYsIG9uU3RhcnQsIHsgcGFzc2l2ZTogZmFsc2UgfSkpO1xuXG4gICAgdW5iaW5kcy5wdXNoKFxuICAgICAgdW5iaW5kYWJsZShoYW5kRWwsICdjbGljaycsICgpID0+IHtcbiAgICAgICAgaWYgKHMucHJvbW90aW9uLmN1cnJlbnQpIHtcbiAgICAgICAgICB1bnNlbGVjdChzKTtcbiAgICAgICAgICBzLmRvbS5yZWRyYXcoKTtcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgICB1bmJpbmRhYmxlKGhhbmRFbCwgJ2NvbnRleHRtZW51JywgKGUpID0+IHtcbiAgICAgICAgaWYgKHMuZGlzYWJsZUNvbnRleHRNZW51IHx8IHMuZHJhd2FibGUuZW5hYmxlZCkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfSksXG4gICAgKTtcblxuICAgIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKGhhbmRFbCwgJ21vdXNlZG93bicsICgpID0+IGZvY3VzQm9hcmQocyksIHsgY2FwdHVyZTogdHJ1ZSB9KSk7XG4gIH1cblxuICByZXR1cm4gKCkgPT4ge1xuICAgIHVuYmluZHMuZm9yRWFjaCgoZikgPT4ge1xuICAgICAgZigpO1xuICAgIH0pO1xuICB9O1xufVxuXG5mdW5jdGlvbiBvYnNlcnZlUmVzaXplKHM6IFN0YXRlLCBlbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgaWYgKCdSZXNpemVPYnNlcnZlcicgaW4gd2luZG93KSB7XG4gICAgaWYgKCFzLmRvbS5yZXNpemVPYnNlcnZlcikgcy5kb20ucmVzaXplT2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIob25SZXNpemUocykpO1xuICAgIHMuZG9tLnJlc2l6ZU9ic2VydmVyLm9ic2VydmUoZWwpO1xuICB9XG59XG5cbi8vIHJldHVybnMgdGhlIHVuYmluZCBmdW5jdGlvblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmREb2N1bWVudChzOiBTdGF0ZSk6IHNnLlVuYmluZCB7XG4gIGNvbnN0IHVuYmluZHM6IHNnLlVuYmluZFtdID0gW107XG4gIHVuYmluZHMucHVzaCgoKSA9PiBzLmRvbS5yZXNpemVPYnNlcnZlcj8uZGlzY29ubmVjdCgpKTtcblxuICAvLyBSZXNpemVPYnNlcnZlciBtaXNzZXMgcG9zaXRpb24gY2hhbmdlcyBhbmQgaXMgbWlzc2luZyBpbiBvbGQgRWRnZSBhbmQgU2FmYXJpLlxuICAvLyBIb3N0cyBjYW4gc2VuZCBzaG9naWdyb3VuZC5yZXNpemUgYWZ0ZXIgY2hhbmdpbmcgdGhlIGxheW91dCBhcm91bmQgdGhlIGJvYXJkLlxuICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZShkb2N1bWVudC5ib2R5LCAnc2hvZ2lncm91bmQucmVzaXplJywgb25SZXNpemUocykpKTtcblxuICBpZiAoIXMudmlld09ubHkpIHtcbiAgICBjb25zdCBvbm1vdmUgPSBkcmFnT3JEcmF3KHMsIGRyYWcubW92ZSwgZHJhdy5tb3ZlKTtcbiAgICBjb25zdCBvbmVuZCA9IGRyYWdPckRyYXcocywgZHJhZy5lbmQsIGRyYXcuZW5kKTtcbiAgICBjb25zdCBvbmNhbmNlbCA9IGRyYWdPckRyYXcocywgZHJhZy5jYW5jZWwsIGRyYXcuY2FuY2VsKTtcblxuICAgIGZvciAoY29uc3QgZXYgb2YgWyd0b3VjaG1vdmUnLCAnbW91c2Vtb3ZlJ10pXG4gICAgICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZShkb2N1bWVudCwgZXYsIG9ubW92ZSBhcyBFdmVudExpc3RlbmVyKSk7XG4gICAgZm9yIChjb25zdCBldiBvZiBbJ3RvdWNoZW5kJywgJ21vdXNldXAnXSlcbiAgICAgIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKGRvY3VtZW50LCBldiwgb25lbmQgYXMgRXZlbnRMaXN0ZW5lcikpO1xuICAgIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKGRvY3VtZW50LCAndG91Y2hjYW5jZWwnLCBvbmNhbmNlbCBhcyBFdmVudExpc3RlbmVyKSk7XG5cbiAgICB1bmJpbmRzLnB1c2goXG4gICAgICB1bmJpbmRhYmxlKGRvY3VtZW50LCAnc2Nyb2xsJywgKCkgPT4gY2xlYXJCb3VuZHMocyksIHsgY2FwdHVyZTogdHJ1ZSwgcGFzc2l2ZTogdHJ1ZSB9KSxcbiAgICApO1xuICAgIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKHdpbmRvdywgJ3Jlc2l6ZScsICgpID0+IGNsZWFyQm91bmRzKHMpLCB7IHBhc3NpdmU6IHRydWUgfSkpO1xuICB9XG5cbiAgcmV0dXJuICgpID0+XG4gICAgdW5iaW5kcy5mb3JFYWNoKChmKSA9PiB7XG4gICAgICBmKCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHVuYmluZGFibGUoXG4gIGVsOiBFdmVudFRhcmdldCxcbiAgZXZlbnROYW1lOiBzdHJpbmcsXG4gIGNhbGxiYWNrOiBFdmVudExpc3RlbmVyLFxuICBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMsXG4pOiBzZy5VbmJpbmQge1xuICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2ssIG9wdGlvbnMpO1xuICByZXR1cm4gKCkgPT4gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrLCBvcHRpb25zKTtcbn1cblxuLy8gQm91bmRzIGFyZSBtZWFzdXJlZCBhZnJlc2ggZm9yIGVhY2ggZ2VzdHVyZSwgYmVjYXVzZSBjb250ZW50IGFyb3VuZCB0aGUgYm9hcmRcbi8vIGNhbiBtb3ZlIGl0IHdpdGhvdXQgYSBzY3JvbGwgb3IgcmVzaXplLlxuZnVuY3Rpb24gc3RhcnREcmFnT3JEcmF3KHM6IFN0YXRlKTogTW91Y2hCaW5kIHtcbiAgcmV0dXJuIChlKSA9PiB7XG4gICAgY2xlYXJCb3VuZHMocyk7XG4gICAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQpIGRyYWcuY2FuY2VsKHMpO1xuICAgIGVsc2UgaWYgKHMuZHJhd2FibGUuY3VycmVudCkgZHJhdy5jYW5jZWwocyk7XG4gICAgZWxzZSBpZiAoZS5zaGlmdEtleSB8fCBpc1JpZ2h0QnV0dG9uKGUpIHx8IHMuZHJhd2FibGUuZm9yY2VkKSB7XG4gICAgICBpZiAocy5kcmF3YWJsZS5lbmFibGVkKSBkcmF3LnN0YXJ0KHMsIGUpO1xuICAgIH0gZWxzZSBpZiAoIXMudmlld09ubHkgJiYgIWRyYWcudW53YW50ZWRFdmVudChlKSkgZHJhZy5zdGFydChzLCBlKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZHJhZ09yRHJhdyhzOiBTdGF0ZSwgd2l0aERyYWc6IFN0YXRlTW91Y2hCaW5kLCB3aXRoRHJhdzogU3RhdGVNb3VjaEJpbmQpOiBNb3VjaEJpbmQge1xuICByZXR1cm4gKGUpID0+IHtcbiAgICBpZiAocy5kcmF3YWJsZS5jdXJyZW50KSB7XG4gICAgICBpZiAocy5kcmF3YWJsZS5lbmFibGVkKSB3aXRoRHJhdyhzLCBlKTtcbiAgICB9IGVsc2UgaWYgKCFzLnZpZXdPbmx5KSB3aXRoRHJhZyhzLCBlKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3RhcnREcmFnRnJvbUhhbmQoczogU3RhdGUpOiBNb3VjaEJpbmQge1xuICByZXR1cm4gKGUpID0+IHtcbiAgICBpZiAocy5wcm9tb3Rpb24uY3VycmVudCkgcmV0dXJuO1xuXG4gICAgY2xlYXJCb3VuZHMocyk7XG4gICAgY29uc3QgcG9zID0gZXZlbnRQb3NpdGlvbihlKTtcbiAgICBjb25zdCBwaWVjZSA9IHBvcyAmJiBnZXRIYW5kUGllY2VBdERvbVBvcyhwb3MsIHMuaGFuZHMucm9sZXMsIHMuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcygpKTtcblxuICAgIGlmIChwaWVjZSkge1xuICAgICAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQpIGRyYWcuY2FuY2VsKHMpO1xuICAgICAgZWxzZSBpZiAocy5kcmF3YWJsZS5jdXJyZW50KSBkcmF3LmNhbmNlbChzKTtcbiAgICAgIGVsc2UgaWYgKGlzTWlkZGxlQnV0dG9uKGUpKSB7XG4gICAgICAgIGlmIChzLmRyYXdhYmxlLmVuYWJsZWQpIHtcbiAgICAgICAgICBpZiAoZS5jYW5jZWxhYmxlICE9PSBmYWxzZSkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIGRyYXcuc2V0RHJhd1BpZWNlKHMsIHBpZWNlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChlLnNoaWZ0S2V5IHx8IGlzUmlnaHRCdXR0b24oZSkgfHwgcy5kcmF3YWJsZS5mb3JjZWQpIHtcbiAgICAgICAgaWYgKHMuZHJhd2FibGUuZW5hYmxlZCkgZHJhdy5zdGFydEZyb21IYW5kKHMsIHBpZWNlLCBlKTtcbiAgICAgIH0gZWxzZSBpZiAoIXMudmlld09ubHkgJiYgIWRyYWcudW53YW50ZWRFdmVudChlKSkge1xuICAgICAgICBkcmFnLmRyYWdOZXdQaWVjZShzLCBwaWVjZSwgZSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBwcm9tb3RlKHM6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICBjaG9vc2VQcm9tb3Rpb24oXG4gICAgcyxcbiAgICB0YXJnZXQgJiYgaXNQaWVjZU5vZGUodGFyZ2V0KSA/IHsgY29sb3I6IHRhcmdldC5zZ0NvbG9yLCByb2xlOiB0YXJnZXQuc2dSb2xlIH0gOiB1bmRlZmluZWQsXG4gICk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBBbmltQ3VycmVudCwgQW5pbUZhZGluZ3MsIEFuaW1Qcm9tb3Rpb25zLCBBbmltVmVjdG9yLCBBbmltVmVjdG9ycyB9IGZyb20gJy4vYW5pbS5qcyc7XG5pbXBvcnQgeyBwcmVkcm9wRGVzdHMsIHByZW1vdmVEZXN0cyB9IGZyb20gJy4vYm9hcmQuanMnO1xuaW1wb3J0IHR5cGUgeyBEcmFnQ3VycmVudCB9IGZyb20gJy4vZHJhZy5qcyc7XG5pbXBvcnQgeyByZW5kZXJLZXlib2FyZCwgc3luY0tleWJvYXJkU3RhdGUgfSBmcm9tICcuL2tleWJvYXJkLmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQge1xuICBjcmVhdGVFbCxcbiAgaXNLZXksXG4gIGlzUGllY2VOb2RlLFxuICBpc1NxdWFyZU5vZGUsXG4gIGtleTJwb3MsXG4gIHBpZWNlTmFtZU9mLFxuICBwb3NUb1RyYW5zbGF0ZVJlbCxcbiAgc2VudGVQb3YsXG4gIHNldERpc3BsYXksXG4gIHRyYW5zbGF0ZVJlbCxcbn0gZnJvbSAnLi91dGlsLmpzJztcblxudHlwZSBTcXVhcmVDbGFzc2VzID0gTWFwPHNnLktleSwgc3RyaW5nPjtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlcihzOiBTdGF0ZSwgYm9hcmRFbHM6IHNnLkJvYXJkRWxlbWVudHMpOiB2b2lkIHtcbiAgY29uc3QgYXNTZW50ZTogYm9vbGVhbiA9IHNlbnRlUG92KHMub3JpZW50YXRpb24pO1xuICBjb25zdCBzY2FsZURvd24gPSBzLnNjYWxlRG93blBpZWNlcyA/IDAuNSA6IDE7XG4gIGNvbnN0IHBvc1RvVHJhbnNsYXRlID0gcG9zVG9UcmFuc2xhdGVSZWwocy5kaW1lbnNpb25zKTtcbiAgY29uc3Qgc3F1YXJlc0VsOiBIVE1MRWxlbWVudCA9IGJvYXJkRWxzLnNxdWFyZXM7XG4gIGNvbnN0IHBpZWNlc0VsOiBIVE1MRWxlbWVudCA9IGJvYXJkRWxzLnBpZWNlcztcbiAgY29uc3QgZHJhZ2dlZEVsOiBzZy5QaWVjZU5vZGUgfCB1bmRlZmluZWQgPSBib2FyZEVscy5kcmFnZ2VkO1xuICBjb25zdCBzcXVhcmVPdmVyRWw6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkID0gYm9hcmRFbHMuc3F1YXJlT3ZlcjtcbiAgY29uc3QgcHJvbW90aW9uRWw6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkID0gYm9hcmRFbHMucHJvbW90aW9uO1xuICBjb25zdCBwaWVjZXM6IHNnLlBpZWNlcyA9IHMucGllY2VzO1xuICBjb25zdCBjdXJBbmltOiBBbmltQ3VycmVudCB8IHVuZGVmaW5lZCA9IHMuYW5pbWF0aW9uLmN1cnJlbnQ7XG4gIGNvbnN0IGFuaW1zOiBBbmltVmVjdG9ycyA9IGN1ckFuaW0gPyBjdXJBbmltLnBsYW4uYW5pbXMgOiBuZXcgTWFwKCk7XG4gIGNvbnN0IGZhZGluZ3M6IEFuaW1GYWRpbmdzID0gY3VyQW5pbSA/IGN1ckFuaW0ucGxhbi5mYWRpbmdzIDogbmV3IE1hcCgpO1xuICBjb25zdCBwcm9tb3Rpb25zOiBBbmltUHJvbW90aW9ucyA9IGN1ckFuaW0gPyBjdXJBbmltLnBsYW4ucHJvbW90aW9ucyA6IG5ldyBNYXAoKTtcbiAgY29uc3QgY3VyRHJhZzogRHJhZ0N1cnJlbnQgfCB1bmRlZmluZWQgPSBzLmRyYWdnYWJsZS5jdXJyZW50O1xuICBjb25zdCBjdXJQcm9tS2V5OiBzZy5LZXkgfCB1bmRlZmluZWQgPSBzLnByb21vdGlvbi5jdXJyZW50Py5kcmFnZ2VkID8gcy5zZWxlY3RlZCA6IHVuZGVmaW5lZDtcblxuICBzeW5jS2V5Ym9hcmRTdGF0ZShzLCBib2FyZEVscyk7XG5cbiAgY29uc3Qgc3F1YXJlczogU3F1YXJlQ2xhc3NlcyA9IGNvbXB1dGVTcXVhcmVDbGFzc2VzKHMpO1xuICBjb25zdCBzYW1lUGllY2VzID0gbmV3IFNldDxzZy5LZXk+KCk7XG4gIGNvbnN0IG1vdmVkUGllY2VzID0gbmV3IE1hcDxzZy5QaWVjZU5hbWUsIHNnLlBpZWNlTm9kZVtdPigpO1xuXG4gIC8vIGlmIHBpZWNlIG5vdCBiZWluZyBkcmFnZ2VkIGFueW1vcmUsIGhpZGUgaXRcbiAgaWYgKCFjdXJEcmFnICYmIGRyYWdnZWRFbD8uc2dEcmFnZ2luZykge1xuICAgIGRyYWdnZWRFbC5zZ0RyYWdnaW5nID0gZmFsc2U7XG4gICAgc2V0RGlzcGxheShkcmFnZ2VkRWwsIGZhbHNlKTtcbiAgICBpZiAoc3F1YXJlT3ZlckVsKSBzZXREaXNwbGF5KHNxdWFyZU92ZXJFbCwgZmFsc2UpO1xuICB9XG5cbiAgbGV0IGs6IHNnLktleTtcbiAgbGV0IGVsOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgbGV0IHBpZWNlQXRLZXk6IHNnLlBpZWNlIHwgdW5kZWZpbmVkO1xuICBsZXQgZWxQaWVjZU5hbWU6IHNnLlBpZWNlTmFtZTtcbiAgbGV0IGFuaW06IEFuaW1WZWN0b3IgfCB1bmRlZmluZWQ7XG4gIGxldCBmYWRpbmc6IHNnLlBpZWNlIHwgdW5kZWZpbmVkO1xuICBsZXQgcHJvbTogc2cuUGllY2UgfCB1bmRlZmluZWQ7XG4gIGxldCBwTXZkc2V0OiBzZy5QaWVjZU5vZGVbXSB8IHVuZGVmaW5lZDtcbiAgbGV0IHBNdmQ6IHNnLlBpZWNlTm9kZSB8IHVuZGVmaW5lZDtcblxuICAvLyB3YWxrIG92ZXIgYWxsIGJvYXJkIGRvbSBlbGVtZW50cywgYXBwbHkgYW5pbWF0aW9ucyBhbmQgZmxhZyBtb3ZlZCBwaWVjZXNcbiAgZWwgPSBwaWVjZXNFbC5maXJzdEVsZW1lbnRDaGlsZCBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgd2hpbGUgKGVsKSB7XG4gICAgaWYgKGlzUGllY2VOb2RlKGVsKSkge1xuICAgICAgayA9IGVsLnNnS2V5O1xuICAgICAgcGllY2VBdEtleSA9IHBpZWNlcy5nZXQoayk7XG4gICAgICBhbmltID0gYW5pbXMuZ2V0KGspO1xuICAgICAgZmFkaW5nID0gZmFkaW5ncy5nZXQoayk7XG4gICAgICBwcm9tID0gcHJvbW90aW9ucy5nZXQoayk7XG4gICAgICBlbFBpZWNlTmFtZSA9IHBpZWNlTmFtZU9mKHsgY29sb3I6IGVsLnNnQ29sb3IsIHJvbGU6IGVsLnNnUm9sZSB9KTtcblxuICAgICAgLy8gR2hvc3QgdGhlIG9yaWdpbiBkdXJpbmcgYSBkcmFnIG9yIGRyYWdnZWQgcHJvbW90aW9uLlxuICAgICAgaWYgKFxuICAgICAgICAoKGN1ckRyYWc/LnN0YXJ0ZWQgJiYgY3VyRHJhZy5mcm9tQm9hcmQ/Lm9yaWcgPT09IGspIHx8IChjdXJQcm9tS2V5ICYmIGN1clByb21LZXkgPT09IGspKSAmJlxuICAgICAgICAhZWwuc2dHaG9zdFxuICAgICAgKSB7XG4gICAgICAgIGVsLnNnR2hvc3QgPSB0cnVlO1xuICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnaG9zdCcpO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgZWwuc2dHaG9zdCAmJlxuICAgICAgICAoIWN1ckRyYWcgfHwgY3VyRHJhZy5mcm9tQm9hcmQ/Lm9yaWcgIT09IGspICYmXG4gICAgICAgICghY3VyUHJvbUtleSB8fCBjdXJQcm9tS2V5ICE9PSBrKVxuICAgICAgKSB7XG4gICAgICAgIGVsLnNnR2hvc3QgPSBmYWxzZTtcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2hvc3QnKTtcbiAgICAgICAgc2V0RGlzcGxheShlbCwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICBpZiAoZWwuc2dHaG9zdCkgc2V0RGlzcGxheShlbCwgcy5kcmFnZ2FibGUuc2hvd0dob3N0IHx8IGN1clByb21LZXkgPT09IGspO1xuICAgICAgLy8gcmVtb3ZlIGZhZGluZyBjbGFzcyBpZiBpdCBzdGlsbCByZW1haW5zXG4gICAgICBpZiAoIWZhZGluZyAmJiBlbC5zZ0ZhZGluZykge1xuICAgICAgICBlbC5zZ0ZhZGluZyA9IGZhbHNlO1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdmYWRpbmcnKTtcbiAgICAgIH1cbiAgICAgIC8vIHRoZXJlIGlzIG5vdyBhIHBpZWNlIGF0IHRoaXMgZG9tIGtleVxuICAgICAgaWYgKHBpZWNlQXRLZXkpIHtcbiAgICAgICAgLy8gY29udGludWUgYW5pbWF0aW9uIGlmIGFscmVhZHkgYW5pbWF0aW5nIGFuZCBzYW1lIHBpZWNlIG9yIHByb21vdGluZyBwaWVjZVxuICAgICAgICAvLyAob3RoZXJ3aXNlIGl0IGNvdWxkIGFuaW1hdGUgYSBjYXB0dXJlZCBwaWVjZSlcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGFuaW0gJiZcbiAgICAgICAgICBlbC5zZ0FuaW1hdGluZyAmJlxuICAgICAgICAgIChlbFBpZWNlTmFtZSA9PT0gcGllY2VOYW1lT2YocGllY2VBdEtleSkgfHwgKHByb20gJiYgZWxQaWVjZU5hbWUgPT09IHBpZWNlTmFtZU9mKHByb20pKSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29uc3QgcG9zID0ga2V5MnBvcyhrKTtcbiAgICAgICAgICBwb3NbMF0gKz0gYW5pbVsyXTtcbiAgICAgICAgICBwb3NbMV0gKz0gYW5pbVszXTtcbiAgICAgICAgICB0cmFuc2xhdGVSZWwoZWwsIHBvc1RvVHJhbnNsYXRlKHBvcywgYXNTZW50ZSksIHNjYWxlRG93bik7XG4gICAgICAgICAgZWwuc2dTY2FsZWREb3duID0gcy5zY2FsZURvd25QaWVjZXM7XG4gICAgICAgIH0gZWxzZSBpZiAoZWwuc2dBbmltYXRpbmcgfHwgZWwuc2dTY2FsZWREb3duICE9PSBzLnNjYWxlRG93blBpZWNlcykge1xuICAgICAgICAgIGlmIChlbC5zZ0FuaW1hdGluZykge1xuICAgICAgICAgICAgZWwuc2dBbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2FuaW0nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdHJhbnNsYXRlUmVsKGVsLCBwb3NUb1RyYW5zbGF0ZShrZXkycG9zKGspLCBhc1NlbnRlKSwgc2NhbGVEb3duKTtcbiAgICAgICAgICBlbC5zZ1NjYWxlZERvd24gPSBzLnNjYWxlRG93blBpZWNlcztcbiAgICAgICAgfVxuICAgICAgICAvLyBzYW1lIHBpZWNlOiBmbGFnIGFzIHNhbWVcbiAgICAgICAgaWYgKGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihwaWVjZUF0S2V5KSAmJiAoIWZhZGluZyB8fCAhZWwuc2dGYWRpbmcpKSB7XG4gICAgICAgICAgc2FtZVBpZWNlcy5hZGQoayk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZGlmZmVyZW50IHBpZWNlOiBmbGFnIGFzIG1vdmVkIHVubGVzcyBpdCBpcyBhIGZhZGluZyBwaWVjZSBvciBhbiBhbmltYXRlZCBwcm9tb3RpbmcgcGllY2VcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaWYgKGZhZGluZyAmJiBlbFBpZWNlTmFtZSA9PT0gcGllY2VOYW1lT2YoZmFkaW5nKSkge1xuICAgICAgICAgICAgZWwuc2dGYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZmFkaW5nJyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChwcm9tICYmIGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihwcm9tKSkge1xuICAgICAgICAgICAgc2FtZVBpZWNlcy5hZGQoayk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFwcGVuZFZhbHVlKG1vdmVkUGllY2VzLCBlbFBpZWNlTmFtZSwgZWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gbm8gcGllY2U6IGZsYWcgYXMgbW92ZWRcbiAgICAgIGVsc2Uge1xuICAgICAgICBhcHBlbmRWYWx1ZShtb3ZlZFBpZWNlcywgZWxQaWVjZU5hbWUsIGVsKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWwgPSBlbC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIH1cblxuICAvLyB3YWxrIG92ZXIgYWxsIHNxdWFyZXMgYW5kIGFwcGx5IGNsYXNzZXNcbiAgbGV0IHNxRWwgPSBzcXVhcmVzRWwuZmlyc3RFbGVtZW50Q2hpbGQgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIHdoaWxlIChzcUVsICYmIGlzU3F1YXJlTm9kZShzcUVsKSkge1xuICAgIHNxRWwuY2xhc3NOYW1lID0gc3F1YXJlcy5nZXQoc3FFbC5zZ0tleSkgfHwgJyc7XG4gICAgc3FFbCA9IHNxRWwubmV4dEVsZW1lbnRTaWJsaW5nIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICB9XG5cbiAgLy8gd2FsayBvdmVyIGFsbCBwaWVjZXMgaW4gY3VycmVudCBzZXQsIGFwcGx5IGRvbSBjaGFuZ2VzIHRvIG1vdmVkIHBpZWNlc1xuICAvLyBvciBhcHBlbmQgbmV3IHBpZWNlc1xuICBmb3IgKGNvbnN0IFtrLCBwXSBvZiBwaWVjZXMpIHtcbiAgICBjb25zdCBwaWVjZSA9IHByb21vdGlvbnMuZ2V0KGspIHx8IHA7XG4gICAgYW5pbSA9IGFuaW1zLmdldChrKTtcbiAgICBpZiAoIXNhbWVQaWVjZXMuaGFzKGspKSB7XG4gICAgICBwTXZkc2V0ID0gbW92ZWRQaWVjZXMuZ2V0KHBpZWNlTmFtZU9mKHBpZWNlKSk7XG4gICAgICBwTXZkID0gcE12ZHNldD8ucG9wKCk7XG4gICAgICAvLyBhIHNhbWUgcGllY2Ugd2FzIG1vdmVkXG4gICAgICBpZiAocE12ZCkge1xuICAgICAgICAvLyBhcHBseSBkb20gY2hhbmdlc1xuICAgICAgICBwTXZkLnNnS2V5ID0gaztcbiAgICAgICAgaWYgKHBNdmQuc2dGYWRpbmcpIHtcbiAgICAgICAgICBwTXZkLnNnRmFkaW5nID0gZmFsc2U7XG4gICAgICAgICAgcE12ZC5jbGFzc0xpc3QucmVtb3ZlKCdmYWRpbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwb3MgPSBrZXkycG9zKGspO1xuICAgICAgICBpZiAoYW5pbSkge1xuICAgICAgICAgIHBNdmQuc2dBbmltYXRpbmcgPSB0cnVlO1xuICAgICAgICAgIHBNdmQuY2xhc3NMaXN0LmFkZCgnYW5pbScpO1xuICAgICAgICAgIHBvc1swXSArPSBhbmltWzJdO1xuICAgICAgICAgIHBvc1sxXSArPSBhbmltWzNdO1xuICAgICAgICB9XG4gICAgICAgIHRyYW5zbGF0ZVJlbChwTXZkLCBwb3NUb1RyYW5zbGF0ZShwb3MsIGFzU2VudGUpLCBzY2FsZURvd24pO1xuICAgICAgICBwTXZkLnNnU2NhbGVkRG93biA9IHMuc2NhbGVEb3duUGllY2VzO1xuICAgICAgfVxuICAgICAgLy8gbm8gcGllY2UgaW4gbW92ZWQgb2JqOiBpbnNlcnQgdGhlIG5ldyBwaWVjZVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IHBpZWNlTm9kZSA9IGNyZWF0ZUVsKCdwaWVjZScsIHBpZWNlTmFtZU9mKHApKSBhcyBzZy5QaWVjZU5vZGU7XG4gICAgICAgIGNvbnN0IHBvcyA9IGtleTJwb3Moayk7XG5cbiAgICAgICAgcGllY2VOb2RlLnNnQ29sb3IgPSBwLmNvbG9yO1xuICAgICAgICBwaWVjZU5vZGUuc2dSb2xlID0gcC5yb2xlO1xuICAgICAgICBwaWVjZU5vZGUuc2dLZXkgPSBrO1xuICAgICAgICBpZiAoYW5pbSkge1xuICAgICAgICAgIHBpZWNlTm9kZS5zZ0FuaW1hdGluZyA9IHRydWU7XG4gICAgICAgICAgcG9zWzBdICs9IGFuaW1bMl07XG4gICAgICAgICAgcG9zWzFdICs9IGFuaW1bM107XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNsYXRlUmVsKHBpZWNlTm9kZSwgcG9zVG9UcmFuc2xhdGUocG9zLCBhc1NlbnRlKSwgc2NhbGVEb3duKTtcbiAgICAgICAgcGllY2VOb2RlLnNnU2NhbGVkRG93biA9IHMuc2NhbGVEb3duUGllY2VzO1xuXG4gICAgICAgIHBpZWNlc0VsLmFwcGVuZENoaWxkKHBpZWNlTm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8vIHJlbW92ZSBhbnkgZWxlbWVudCB0aGF0IHJlbWFpbnMgaW4gdGhlIG1vdmVkIHNldHNcbiAgZm9yIChjb25zdCBub2RlcyBvZiBtb3ZlZFBpZWNlcy52YWx1ZXMoKSkge1xuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgICAgcGllY2VzRWwucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHByb21vdGlvbkVsKSByZW5kZXJQcm9tb3Rpb24ocywgcHJvbW90aW9uRWwpO1xuICByZW5kZXJLZXlib2FyZChzLCBib2FyZEVscyk7XG59XG5cbmZ1bmN0aW9uIGFwcGVuZFZhbHVlPEssIFY+KG1hcDogTWFwPEssIFZbXT4sIGtleTogSywgdmFsdWU6IFYpOiB2b2lkIHtcbiAgY29uc3QgYXJyID0gbWFwLmdldChrZXkpO1xuICBpZiAoYXJyKSBhcnIucHVzaCh2YWx1ZSk7XG4gIGVsc2UgbWFwLnNldChrZXksIFt2YWx1ZV0pO1xufVxuXG5mdW5jdGlvbiBjb21wdXRlU3F1YXJlQ2xhc3NlcyhzOiBTdGF0ZSk6IFNxdWFyZUNsYXNzZXMge1xuICBjb25zdCBzcXVhcmVzOiBTcXVhcmVDbGFzc2VzID0gbmV3IE1hcCgpO1xuICBpZiAocy5rZXlib2FyZC5lbmFibGVkICYmICFzLnZpZXdPbmx5ICYmICFzLnByb21vdGlvbi5jdXJyZW50ICYmIGlzS2V5KHMua2V5Ym9hcmQuY3VycmVudCkpXG4gICAgYWRkU3F1YXJlKFxuICAgICAgc3F1YXJlcyxcbiAgICAgIHMua2V5Ym9hcmQuY3VycmVudCxcbiAgICAgIGBrZXlib2FyZC1jdXJzb3Ike3Mua2V5Ym9hcmQuZm9jdXNlZCA/ICcga2V5Ym9hcmQtZm9jdXNlZCcgOiAnJ31gLFxuICAgICk7XG4gIGlmIChzLmxhc3REZXN0cyAmJiBzLmhpZ2hsaWdodC5sYXN0RGVzdHMpXG4gICAgZm9yIChjb25zdCBrIG9mIHMubGFzdERlc3RzKSBhZGRTcXVhcmUoc3F1YXJlcywgaywgJ2xhc3QtZGVzdCcpO1xuICBpZiAocy5jaGVja3MgJiYgcy5oaWdobGlnaHQuY2hlY2spXG4gICAgZm9yIChjb25zdCBjaGVjayBvZiBzLmNoZWNrcykgYWRkU3F1YXJlKHNxdWFyZXMsIGNoZWNrLCAnY2hlY2snKTtcbiAgaWYgKHMuaG92ZXJlZCkgYWRkU3F1YXJlKHNxdWFyZXMsIHMuaG92ZXJlZCwgJ2hvdmVyJyk7XG4gIGlmIChzLnNlbGVjdGVkKSB7XG4gICAgaWYgKHMuYWN0aXZlQ29sb3IgPT09ICdib3RoJyB8fCBzLmFjdGl2ZUNvbG9yID09PSBzLnR1cm5Db2xvcilcbiAgICAgIGFkZFNxdWFyZShzcXVhcmVzLCBzLnNlbGVjdGVkLCAnc2VsZWN0ZWQnKTtcbiAgICBlbHNlIGFkZFNxdWFyZShzcXVhcmVzLCBzLnNlbGVjdGVkLCAncHJlc2VsZWN0ZWQnKTtcbiAgICBpZiAocy5tb3ZhYmxlLnNob3dEZXN0cykge1xuICAgICAgY29uc3QgZGVzdHMgPSBzLm1vdmFibGUuZGVzdHM/LmdldChzLnNlbGVjdGVkKTtcbiAgICAgIGlmIChkZXN0cylcbiAgICAgICAgZm9yIChjb25zdCBrIG9mIGRlc3RzKSB7XG4gICAgICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIGssIGBkZXN0JHtzLnBpZWNlcy5oYXMoaykgPyAnIG9jJyA6ICcnfWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChzLnByZW1vdmFibGUuc2hvd0Rlc3RzKSB7XG4gICAgICBmb3IgKGNvbnN0IGsgb2YgcHJlbW92ZURlc3RzKHMsIHMuc2VsZWN0ZWQpKSB7XG4gICAgICAgIGFkZFNxdWFyZShzcXVhcmVzLCBrLCBgcHJlLWRlc3Qke3MucGllY2VzLmhhcyhrKSA/ICcgb2MnIDogJyd9YCk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKHMuc2VsZWN0ZWRQaWVjZSkge1xuICAgIGlmIChzLmRyb3BwYWJsZS5zaG93RGVzdHMpIHtcbiAgICAgIGNvbnN0IGRlc3RzID0gcy5kcm9wcGFibGUuZGVzdHM/LmdldChwaWVjZU5hbWVPZihzLnNlbGVjdGVkUGllY2UpKTtcbiAgICAgIGlmIChkZXN0cylcbiAgICAgICAgZm9yIChjb25zdCBrIG9mIGRlc3RzKSB7XG4gICAgICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIGssICdkZXN0Jyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHMucHJlZHJvcHBhYmxlLnNob3dEZXN0cykge1xuICAgICAgZm9yIChjb25zdCBrIG9mIHByZWRyb3BEZXN0cyhzLCBzLnNlbGVjdGVkUGllY2UpKSB7XG4gICAgICAgIGFkZFNxdWFyZShzcXVhcmVzLCBrLCBgcHJlLWRlc3Qke3MucGllY2VzLmhhcyhrKSA/ICcgb2MnIDogJyd9YCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNvbnN0IHByZW1vdmUgPSBzLnByZW1vdmFibGUuY3VycmVudDtcbiAgaWYgKHByZW1vdmUpIHtcbiAgICBhZGRTcXVhcmUoc3F1YXJlcywgcHJlbW92ZS5vcmlnLCAnY3VycmVudC1wcmUnKTtcbiAgICBhZGRTcXVhcmUoc3F1YXJlcywgcHJlbW92ZS5kZXN0LCBgY3VycmVudC1wcmUke3ByZW1vdmUucHJvbSA/ICcgcHJvbScgOiAnJ31gKTtcbiAgfSBlbHNlIGlmIChzLnByZWRyb3BwYWJsZS5jdXJyZW50KVxuICAgIGFkZFNxdWFyZShcbiAgICAgIHNxdWFyZXMsXG4gICAgICBzLnByZWRyb3BwYWJsZS5jdXJyZW50LmtleSxcbiAgICAgIGBjdXJyZW50LXByZSR7cy5wcmVkcm9wcGFibGUuY3VycmVudC5wcm9tID8gJyBwcm9tJyA6ICcnfWAsXG4gICAgKTtcblxuICBmb3IgKGNvbnN0IHNxaCBvZiBzLmRyYXdhYmxlLnNxdWFyZXMpIHtcbiAgICBhZGRTcXVhcmUoc3F1YXJlcywgc3FoLmtleSwgc3FoLmNsYXNzTmFtZSk7XG4gIH1cblxuICByZXR1cm4gc3F1YXJlcztcbn1cblxuZnVuY3Rpb24gYWRkU3F1YXJlKHNxdWFyZXM6IFNxdWFyZUNsYXNzZXMsIGtleTogc2cuS2V5LCBrbGFzczogc3RyaW5nKTogdm9pZCB7XG4gIGNvbnN0IGNsYXNzZXMgPSBzcXVhcmVzLmdldChrZXkpO1xuICBpZiAoY2xhc3Nlcykgc3F1YXJlcy5zZXQoa2V5LCBgJHtjbGFzc2VzfSAke2tsYXNzfWApO1xuICBlbHNlIHNxdWFyZXMuc2V0KGtleSwga2xhc3MpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJQcm9tb3Rpb24oczogU3RhdGUsIHByb21vdGlvbkVsOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICBjb25zdCBjdXIgPSBzLnByb21vdGlvbi5jdXJyZW50O1xuICBjb25zdCBrZXkgPSBjdXI/LmtleTtcbiAgY29uc3QgcGllY2VzID0gY3VyID8gW2N1ci5wcm9tb3RlZFBpZWNlLCBjdXIucGllY2VdIDogW107XG4gIGNvbnN0IGhhc2ggPSBwcm9tb3Rpb25IYXNoKCEhY3VyLCBrZXksIHBpZWNlcyk7XG4gIGlmIChzLnByb21vdGlvbi5wcmV2UHJvbW90aW9uSGFzaCA9PT0gaGFzaCkgcmV0dXJuO1xuICBzLnByb21vdGlvbi5wcmV2UHJvbW90aW9uSGFzaCA9IGhhc2g7XG5cbiAgaWYgKGtleSkge1xuICAgIGNvbnN0IGFzU2VudGUgPSBzZW50ZVBvdihzLm9yaWVudGF0aW9uKTtcbiAgICBjb25zdCBpbml0UG9zID0ga2V5MnBvcyhrZXkpO1xuICAgIGNvbnN0IGNvbG9yID0gY3VyLnBpZWNlLmNvbG9yO1xuICAgIGNvbnN0IHByb21vdGlvblNxdWFyZSA9IGNyZWF0ZUVsKCdzZy1wcm9tb3Rpb24tc3F1YXJlJyk7XG4gICAgY29uc3QgcHJvbW90aW9uQ2hvaWNlcyA9IGNyZWF0ZUVsKCdzZy1wcm9tb3Rpb24tY2hvaWNlcycpO1xuICAgIGlmIChzLm9yaWVudGF0aW9uICE9PSBjb2xvcikgcHJvbW90aW9uQ2hvaWNlcy5jbGFzc0xpc3QuYWRkKCdyZXZlcnNlZCcpO1xuICAgIHRyYW5zbGF0ZVJlbChwcm9tb3Rpb25TcXVhcmUsIHBvc1RvVHJhbnNsYXRlUmVsKHMuZGltZW5zaW9ucykoaW5pdFBvcywgYXNTZW50ZSksIDEpO1xuXG4gICAgZm9yIChjb25zdCBwIG9mIHBpZWNlcykge1xuICAgICAgY29uc3QgcGllY2VOb2RlID0gY3JlYXRlRWwoJ3BpZWNlJywgcGllY2VOYW1lT2YocCkpIGFzIHNnLlBpZWNlTm9kZTtcbiAgICAgIHBpZWNlTm9kZS5zZ0NvbG9yID0gcC5jb2xvcjtcbiAgICAgIHBpZWNlTm9kZS5zZ1JvbGUgPSBwLnJvbGU7XG4gICAgICBwcm9tb3Rpb25DaG9pY2VzLmFwcGVuZENoaWxkKHBpZWNlTm9kZSk7XG4gICAgfVxuXG4gICAgcHJvbW90aW9uRWwuaW5uZXJIVE1MID0gJyc7XG4gICAgcHJvbW90aW9uU3F1YXJlLmFwcGVuZENoaWxkKHByb21vdGlvbkNob2ljZXMpO1xuICAgIHByb21vdGlvbkVsLmFwcGVuZENoaWxkKHByb21vdGlvblNxdWFyZSk7XG4gICAgc2V0RGlzcGxheShwcm9tb3Rpb25FbCwgdHJ1ZSk7XG4gIH0gZWxzZSB7XG4gICAgc2V0RGlzcGxheShwcm9tb3Rpb25FbCwgZmFsc2UpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHByb21vdGlvbkhhc2goYWN0aXZlOiBib29sZWFuLCBrZXk6IHNnLktleSB8IHVuZGVmaW5lZCwgcGllY2VzOiBzZy5QaWVjZVtdKTogc3RyaW5nIHtcbiAgcmV0dXJuIFthY3RpdmUsIGtleSwgcGllY2VzLm1hcCgocCkgPT4gcGllY2VOYW1lT2YocCkpLmpvaW4oJyAnKV0uam9pbignICcpO1xufVxuIiwgImltcG9ydCB0eXBlIHsgTm90YXRpb24gfSBmcm9tICcuL3R5cGVzLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNvb3Jkcyhub3RhdGlvbjogTm90YXRpb24pOiBzdHJpbmdbXSB7XG4gIHN3aXRjaCAobm90YXRpb24pIHtcbiAgICBjYXNlICdkaXpoaSc6XG4gICAgICByZXR1cm4gW1xuICAgICAgICAnJyxcbiAgICAgICAgJycsXG4gICAgICAgICcnLFxuICAgICAgICAnJyxcbiAgICAgICAgJ+S6pScsXG4gICAgICAgICfmiIwnLFxuICAgICAgICAn6YWJJyxcbiAgICAgICAgJ+eUsycsXG4gICAgICAgICfmnKonLFxuICAgICAgICAn5Y2IJyxcbiAgICAgICAgJ+W3sycsXG4gICAgICAgICfovrAnLFxuICAgICAgICAn5Y2vJyxcbiAgICAgICAgJ+WvhScsXG4gICAgICAgICfkuJEnLFxuICAgICAgICAn5a2QJyxcbiAgICAgIF07XG4gICAgY2FzZSAnamFwYW5lc2UnOlxuICAgICAgcmV0dXJuIFtcbiAgICAgICAgJ+WNgeWFrScsXG4gICAgICAgICfljYHkupQnLFxuICAgICAgICAn5Y2B5ZubJyxcbiAgICAgICAgJ+WNgeS4iScsXG4gICAgICAgICfljYHkuownLFxuICAgICAgICAn5Y2B5LiAJyxcbiAgICAgICAgJ+WNgScsXG4gICAgICAgICfkuZ0nLFxuICAgICAgICAn5YWrJyxcbiAgICAgICAgJ+S4gycsXG4gICAgICAgICflha0nLFxuICAgICAgICAn5LqUJyxcbiAgICAgICAgJ+WbmycsXG4gICAgICAgICfkuIknLFxuICAgICAgICAn5LqMJyxcbiAgICAgICAgJ+S4gCcsXG4gICAgICBdO1xuICAgIGNhc2UgJ2VuZ2luZSc6XG4gICAgICByZXR1cm4gWydwJywgJ28nLCAnbicsICdtJywgJ2wnLCAnaycsICdqJywgJ2knLCAnaCcsICdnJywgJ2YnLCAnZScsICdkJywgJ2MnLCAnYicsICdhJ107XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldHVybiBbJzEwJywgJ2YnLCAnZScsICdkJywgJ2MnLCAnYicsICdhJywgJzknLCAnOCcsICc3JywgJzYnLCAnNScsICc0JywgJzMnLCAnMicsICcxJ107XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBbXG4gICAgICAgICcxNicsXG4gICAgICAgICcxNScsXG4gICAgICAgICcxNCcsXG4gICAgICAgICcxMycsXG4gICAgICAgICcxMicsXG4gICAgICAgICcxMScsXG4gICAgICAgICcxMCcsXG4gICAgICAgICc5JyxcbiAgICAgICAgJzgnLFxuICAgICAgICAnNycsXG4gICAgICAgICc2JyxcbiAgICAgICAgJzUnLFxuICAgICAgICAnNCcsXG4gICAgICAgICczJyxcbiAgICAgICAgJzInLFxuICAgICAgICAnMScsXG4gICAgICBdO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgY29sb3JzIH0gZnJvbSAnLi9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgY29vcmRzIH0gZnJvbSAnLi9jb29yZHMuanMnO1xuaW1wb3J0IHsgY3JlYXRlU1ZHRWxlbWVudCwgc2V0QXR0cmlidXRlcyB9IGZyb20gJy4vc2hhcGVzLmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlIHtcbiAgQm9hcmRFbGVtZW50cyxcbiAgQ29sb3IsXG4gIERpbWVuc2lvbnMsXG4gIEhhbmRFbGVtZW50cyxcbiAgUGllY2VOb2RlLFxuICBSb2xlU3RyaW5nLFxuICBTaGFwZXNFbGVtZW50cyxcbiAgU3F1YXJlTm9kZSxcbn0gZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyBjcmVhdGVFbCwgb3Bwb3NpdGUsIHBpZWNlTmFtZU9mLCBwb3Mya2V5LCBzZXREaXNwbGF5IH0gZnJvbSAnLi91dGlsLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIHdyYXBCb2FyZChib2FyZFdyYXA6IEhUTUxFbGVtZW50LCBzOiBTdGF0ZSk6IEJvYXJkRWxlbWVudHMge1xuICAvLyAuc2ctd3JhcCAoZWxlbWVudCBwYXNzZWQgdG8gU2hvZ2lncm91bmQpXG4gIC8vICAgICBzZy1oYW5kLXdyYXBcbiAgLy8gICAgIHNnLWJvYXJkXG4gIC8vICAgICAgIHNnLXNxdWFyZXNcbiAgLy8gICAgICAgc2ctcGllY2VzXG4gIC8vICAgICAgIHBpZWNlIGRyYWdnaW5nXG4gIC8vICAgICAgIHNnLXByb21vdGlvblxuICAvLyAgICAgICBzZy1zcXVhcmUtb3ZlclxuICAvLyAgICAgICBzdmcuc2ctc2hhcGVzXG4gIC8vICAgICAgICAgZGVmc1xuICAvLyAgICAgICAgIGdcbiAgLy8gICAgICAgc3ZnLnNnLWN1c3RvbS1zdmdzXG4gIC8vICAgICAgICAgZ1xuICAvLyAgICAgc2ctaGFuZC13cmFwXG4gIC8vICAgICBzZy1mcmVlLXBpZWNlc1xuICAvLyAgICAgICBjb29yZHMucmFua3NcbiAgLy8gICAgICAgY29vcmRzLmZpbGVzXG5cbiAgY29uc3QgYm9hcmQgPSBjcmVhdGVFbCgnc2ctYm9hcmQnKTtcblxuICBjb25zdCBzcXVhcmVzID0gcmVuZGVyU3F1YXJlcyhzLmRpbWVuc2lvbnMsIHMub3JpZW50YXRpb24pO1xuICBib2FyZC5hcHBlbmRDaGlsZChzcXVhcmVzKTtcblxuICBjb25zdCBwaWVjZXMgPSBjcmVhdGVFbCgnc2ctcGllY2VzJyk7XG4gIGJvYXJkLmFwcGVuZENoaWxkKHBpZWNlcyk7XG5cbiAgbGV0IGRyYWdnZWQ6IFBpZWNlTm9kZSB8IHVuZGVmaW5lZDtcbiAgbGV0IHByb21vdGlvbjogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIGxldCBzcXVhcmVPdmVyOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgaWYgKCFzLnZpZXdPbmx5KSB7XG4gICAgZHJhZ2dlZCA9IGNyZWF0ZUVsKCdwaWVjZScpIGFzIFBpZWNlTm9kZTtcbiAgICBzZXREaXNwbGF5KGRyYWdnZWQsIGZhbHNlKTtcbiAgICBib2FyZC5hcHBlbmRDaGlsZChkcmFnZ2VkKTtcblxuICAgIHByb21vdGlvbiA9IGNyZWF0ZUVsKCdzZy1wcm9tb3Rpb24nKTtcbiAgICBzZXREaXNwbGF5KHByb21vdGlvbiwgZmFsc2UpO1xuICAgIGJvYXJkLmFwcGVuZENoaWxkKHByb21vdGlvbik7XG5cbiAgICBzcXVhcmVPdmVyID0gY3JlYXRlRWwoJ3NnLXNxdWFyZS1vdmVyJyk7XG4gICAgc2V0RGlzcGxheShzcXVhcmVPdmVyLCBmYWxzZSk7XG4gICAgYm9hcmQuYXBwZW5kQ2hpbGQoc3F1YXJlT3Zlcik7XG4gIH1cblxuICBsZXQgc2hhcGVzOiBTaGFwZXNFbGVtZW50cyB8IHVuZGVmaW5lZDtcbiAgaWYgKHMuZHJhd2FibGUudmlzaWJsZSkge1xuICAgIGNvbnN0IHN2ZyA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnc3ZnJyksIHtcbiAgICAgIGNsYXNzOiAnc2ctc2hhcGVzJyxcbiAgICAgIHZpZXdCb3g6IGAtJHtzLnNxdWFyZVJhdGlvWzBdIC8gMn0gLSR7cy5zcXVhcmVSYXRpb1sxXSAvIDJ9ICR7cy5kaW1lbnNpb25zLmZpbGVzICogcy5zcXVhcmVSYXRpb1swXX0gJHtcbiAgICAgICAgcy5kaW1lbnNpb25zLnJhbmtzICogcy5zcXVhcmVSYXRpb1sxXVxuICAgICAgfWAsXG4gICAgfSk7XG4gICAgc3ZnLmFwcGVuZENoaWxkKGNyZWF0ZVNWR0VsZW1lbnQoJ2RlZnMnKSk7XG4gICAgc3ZnLmFwcGVuZENoaWxkKGNyZWF0ZVNWR0VsZW1lbnQoJ2cnKSk7XG5cbiAgICBjb25zdCBjdXN0b21TdmcgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ3N2ZycpLCB7XG4gICAgICBjbGFzczogJ3NnLWN1c3RvbS1zdmdzJyxcbiAgICAgIHZpZXdCb3g6IGAwIDAgJHtzLmRpbWVuc2lvbnMuZmlsZXMgKiBzLnNxdWFyZVJhdGlvWzBdfSAke3MuZGltZW5zaW9ucy5yYW5rcyAqIHMuc3F1YXJlUmF0aW9bMV19YCxcbiAgICB9KTtcbiAgICBjdXN0b21TdmcuYXBwZW5kQ2hpbGQoY3JlYXRlU1ZHRWxlbWVudCgnZycpKTtcblxuICAgIGNvbnN0IGZyZWVQaWVjZXMgPSBjcmVhdGVFbCgnc2ctZnJlZS1waWVjZXMnKTtcblxuICAgIGJvYXJkLmFwcGVuZENoaWxkKHN2Zyk7XG4gICAgYm9hcmQuYXBwZW5kQ2hpbGQoY3VzdG9tU3ZnKTtcbiAgICBib2FyZC5hcHBlbmRDaGlsZChmcmVlUGllY2VzKTtcblxuICAgIHNoYXBlcyA9IHtcbiAgICAgIHN2ZyxcbiAgICAgIGZyZWVQaWVjZXMsXG4gICAgICBjdXN0b21TdmcsXG4gICAgfTtcbiAgfVxuXG4gIGlmIChzLmNvb3JkaW5hdGVzLmVuYWJsZWQpIHtcbiAgICBjb25zdCBvcmllbnRDbGFzcyA9IHMub3JpZW50YXRpb24gPT09ICdnb3RlJyA/ICcgZ290ZScgOiAnJztcbiAgICBjb25zdCByYW5rcyA9IGNvb3JkcyhzLmNvb3JkaW5hdGVzLnJhbmtzKTtcbiAgICBjb25zdCBmaWxlcyA9IGNvb3JkcyhzLmNvb3JkaW5hdGVzLmZpbGVzKTtcbiAgICBib2FyZC5hcHBlbmRDaGlsZChyZW5kZXJDb29yZHMocmFua3MsIGByYW5rcyR7b3JpZW50Q2xhc3N9YCwgcy5kaW1lbnNpb25zLnJhbmtzKSk7XG4gICAgYm9hcmQuYXBwZW5kQ2hpbGQocmVuZGVyQ29vcmRzKGZpbGVzLCBgZmlsZXMke29yaWVudENsYXNzfWAsIHMuZGltZW5zaW9ucy5maWxlcykpO1xuICB9XG5cbiAgYm9hcmRXcmFwLmlubmVySFRNTCA9ICcnO1xuXG4gIGNvbnN0IGRpbUNscyA9IGBkLSR7cy5kaW1lbnNpb25zLmZpbGVzfXgke3MuZGltZW5zaW9ucy5yYW5rc31gO1xuXG4gIC8vIHJlbW92ZSBhbGwgb3RoZXIgZGltZW5zaW9uIGNsYXNzZXNcbiAgZm9yIChjb25zdCBjIG9mIEFycmF5LmZyb20oYm9hcmRXcmFwLmNsYXNzTGlzdCkpIHtcbiAgICBpZiAoL15kLVxcZCt4XFxkKyQvLnRlc3QoYykgJiYgYyAhPT0gZGltQ2xzKSBib2FyZFdyYXAuY2xhc3NMaXN0LnJlbW92ZShjKTtcbiAgfVxuXG4gIC8vIGVuc3VyZSB0aGUgc2ctd3JhcCBjbGFzcyBhbmQgZGltZW5zaW9ucyBjbGFzcyBpcyBzZXQgYmVmb3JlaGFuZCB0byBhdm9pZCByZWNvbXB1dGluZyBzdHlsZXNcbiAgYm9hcmRXcmFwLmNsYXNzTGlzdC5hZGQoJ3NnLXdyYXAnLCBkaW1DbHMpO1xuXG4gIGZvciAoY29uc3QgYyBvZiBjb2xvcnMpIGJvYXJkV3JhcC5jbGFzc0xpc3QudG9nZ2xlKGBvcmllbnRhdGlvbi0ke2N9YCwgcy5vcmllbnRhdGlvbiA9PT0gYyk7XG4gIGJvYXJkV3JhcC5jbGFzc0xpc3QudG9nZ2xlKCdtYW5pcHVsYWJsZScsICFzLnZpZXdPbmx5KTtcblxuICBib2FyZFdyYXAuYXBwZW5kQ2hpbGQoYm9hcmQpO1xuXG4gIGxldCBoYW5kczogSGFuZEVsZW1lbnRzIHwgdW5kZWZpbmVkO1xuICBpZiAocy5oYW5kcy5pbmxpbmVkKSB7XG4gICAgY29uc3QgaGFuZFdyYXBUb3AgPSBjcmVhdGVFbCgnc2ctaGFuZC13cmFwJywgJ2lubGluZWQnKTtcbiAgICBjb25zdCBoYW5kV3JhcEJvdHRvbSA9IGNyZWF0ZUVsKCdzZy1oYW5kLXdyYXAnLCAnaW5saW5lZCcpO1xuICAgIGJvYXJkV3JhcC5pbnNlcnRCZWZvcmUoaGFuZFdyYXBCb3R0b20sIGJvYXJkLm5leHRFbGVtZW50U2libGluZyk7XG4gICAgYm9hcmRXcmFwLmluc2VydEJlZm9yZShoYW5kV3JhcFRvcCwgYm9hcmQpO1xuICAgIGhhbmRzID0ge1xuICAgICAgdG9wOiBoYW5kV3JhcFRvcCxcbiAgICAgIGJvdHRvbTogaGFuZFdyYXBCb3R0b20sXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYm9hcmQsXG4gICAgc3F1YXJlcyxcbiAgICBwaWVjZXMsXG4gICAgcHJvbW90aW9uLFxuICAgIHNxdWFyZU92ZXIsXG4gICAgZHJhZ2dlZCxcbiAgICBzaGFwZXMsXG4gICAgaGFuZHMsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwSGFuZChoYW5kV3JhcDogSFRNTEVsZW1lbnQsIHBvczogJ3RvcCcgfCAnYm90dG9tJywgczogU3RhdGUpOiBIVE1MRWxlbWVudCB7XG4gIGNvbnN0IGhhbmQgPSByZW5kZXJIYW5kKHBvcyA9PT0gJ3RvcCcgPyBvcHBvc2l0ZShzLm9yaWVudGF0aW9uKSA6IHMub3JpZW50YXRpb24sIHMuaGFuZHMucm9sZXMpO1xuICBoYW5kV3JhcC5pbm5lckhUTUwgPSAnJztcblxuICBjb25zdCByb2xlQ250Q2xzID0gYHItJHtzLmhhbmRzLnJvbGVzLmxlbmd0aH1gO1xuXG4gIC8vIHJlbW92ZSBhbGwgb3RoZXIgcm9sZSBjb3VudCBjbGFzc2VzXG4gIGZvciAoY29uc3QgYyBvZiBBcnJheS5mcm9tKGhhbmRXcmFwLmNsYXNzTGlzdCkpIHtcbiAgICBpZiAoL15yLVxcZCskLy50ZXN0KGMpICYmIGMgIT09IHJvbGVDbnRDbHMpIGhhbmRXcmFwLmNsYXNzTGlzdC5yZW1vdmUoYyk7XG4gIH1cblxuICAvLyBlbnN1cmUgdGhlIHNnLWhhbmQtd3JhcCBjbGFzcywgaGFuZCBwb3MgY2xhc3MgYW5kIHJvbGUgbnVtYmVyIGNsYXNzIGlzIHNldCBiZWZvcmVoYW5kIHRvIGF2b2lkIHJlY29tcHV0aW5nIHN0eWxlc1xuICBoYW5kV3JhcC5jbGFzc0xpc3QuYWRkKCdzZy1oYW5kLXdyYXAnLCBgaGFuZC0ke3Bvc31gLCByb2xlQ250Q2xzKTtcbiAgaGFuZFdyYXAuYXBwZW5kQ2hpbGQoaGFuZCk7XG5cbiAgZm9yIChjb25zdCBjIG9mIGNvbG9ycykgaGFuZFdyYXAuY2xhc3NMaXN0LnRvZ2dsZShgb3JpZW50YXRpb24tJHtjfWAsIHMub3JpZW50YXRpb24gPT09IGMpO1xuICBoYW5kV3JhcC5jbGFzc0xpc3QudG9nZ2xlKCdtYW5pcHVsYWJsZScsICFzLnZpZXdPbmx5KTtcblxuICByZXR1cm4gaGFuZDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyQ29vcmRzKGVsZW1zOiByZWFkb25seSBzdHJpbmdbXSwgY2xhc3NOYW1lOiBzdHJpbmcsIHRyaW06IG51bWJlcik6IEhUTUxFbGVtZW50IHtcbiAgY29uc3QgZWwgPSBjcmVhdGVFbCgnY29vcmRzJywgY2xhc3NOYW1lKTtcbiAgbGV0IGY6IEhUTUxFbGVtZW50O1xuICBmb3IgKGNvbnN0IGVsZW0gb2YgZWxlbXMuc2xpY2UoLXRyaW0pKSB7XG4gICAgZiA9IGNyZWF0ZUVsKCdjb29yZCcpO1xuICAgIGYudGV4dENvbnRlbnQgPSBlbGVtO1xuICAgIGVsLmFwcGVuZENoaWxkKGYpO1xuICB9XG4gIHJldHVybiBlbDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyU3F1YXJlcyhkaW1zOiBEaW1lbnNpb25zLCBvcmllbnRhdGlvbjogQ29sb3IpOiBIVE1MRWxlbWVudCB7XG4gIGNvbnN0IHNxdWFyZXMgPSBjcmVhdGVFbCgnc2ctc3F1YXJlcycpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGltcy5yYW5rcyAqIGRpbXMuZmlsZXM7IGkrKykge1xuICAgIGNvbnN0IHNxID0gY3JlYXRlRWwoJ3NxJykgYXMgU3F1YXJlTm9kZTtcbiAgICBzcS5zZ0tleSA9XG4gICAgICBvcmllbnRhdGlvbiA9PT0gJ3NlbnRlJ1xuICAgICAgICA/IHBvczJrZXkoW2RpbXMuZmlsZXMgLSAxIC0gKGkgJSBkaW1zLmZpbGVzKSwgTWF0aC5mbG9vcihpIC8gZGltcy5maWxlcyldKVxuICAgICAgICA6IHBvczJrZXkoW2kgJSBkaW1zLmZpbGVzLCBkaW1zLnJhbmtzIC0gMSAtIE1hdGguZmxvb3IoaSAvIGRpbXMuZmlsZXMpXSk7XG4gICAgc3F1YXJlcy5hcHBlbmRDaGlsZChzcSk7XG4gIH1cblxuICByZXR1cm4gc3F1YXJlcztcbn1cblxuZnVuY3Rpb24gcmVuZGVySGFuZChjb2xvcjogQ29sb3IsIHJvbGVzOiBSb2xlU3RyaW5nW10pOiBIVE1MRWxlbWVudCB7XG4gIGNvbnN0IGhhbmQgPSBjcmVhdGVFbCgnc2ctaGFuZCcpO1xuICBmb3IgKGNvbnN0IHJvbGUgb2Ygcm9sZXMpIHtcbiAgICBjb25zdCBwaWVjZSA9IHsgcm9sZTogcm9sZSwgY29sb3I6IGNvbG9yIH07XG4gICAgY29uc3Qgd3JhcEVsID0gY3JlYXRlRWwoJ3NnLWhwLXdyYXAnKTtcbiAgICBjb25zdCBwaWVjZUVsID0gY3JlYXRlRWwoJ3BpZWNlJywgcGllY2VOYW1lT2YocGllY2UpKSBhcyBQaWVjZU5vZGU7XG4gICAgcGllY2VFbC5zZ0NvbG9yID0gY29sb3I7XG4gICAgcGllY2VFbC5zZ1JvbGUgPSByb2xlO1xuICAgIHdyYXBFbC5hcHBlbmRDaGlsZChwaWVjZUVsKTtcbiAgICBoYW5kLmFwcGVuZENoaWxkKHdyYXBFbCk7XG4gIH1cbiAgcmV0dXJuIGhhbmQ7XG59XG4iLCAiaW1wb3J0ICogYXMgZXZlbnRzIGZyb20gJy4vZXZlbnRzLmpzJztcbmltcG9ydCB7IHJlbmRlckhhbmQgfSBmcm9tICcuL2hhbmRzLmpzJztcbmltcG9ydCB7IHJlbmRlciB9IGZyb20gJy4vcmVuZGVyLmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlIHsgV3JhcEVsZW1lbnRzLCBXcmFwRWxlbWVudHNCb29sZWFuIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyB3cmFwQm9hcmQsIHdyYXBIYW5kIH0gZnJvbSAnLi93cmFwLmpzJztcblxuZnVuY3Rpb24gYXR0YWNoQm9hcmQoc3RhdGU6IFN0YXRlLCBib2FyZFdyYXA6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gIGNvbnN0IHJlc3RvcmVGb2N1cyA9XG4gICAgc3RhdGUua2V5Ym9hcmQuZW5hYmxlZCAmJlxuICAgICFzdGF0ZS52aWV3T25seSAmJlxuICAgIHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZD8uYm9hcmQgPT09IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gIGRldGFjaEVsZW1lbnRzKHsgYm9hcmQ6IHRydWUgfSwgc3RhdGUsIHRydWUpO1xuICBjb25zdCBlbGVtZW50cyA9IHdyYXBCb2FyZChib2FyZFdyYXAsIHN0YXRlKTtcblxuICAvLyBpbiBjYXNlIG9mIGlubGluZWQgaGFuZHNcbiAgaWYgKGVsZW1lbnRzLmhhbmRzKSBhdHRhY2hIYW5kcyhzdGF0ZSwgZWxlbWVudHMuaGFuZHMudG9wLCBlbGVtZW50cy5oYW5kcy5ib3R0b20pO1xuXG4gIHN0YXRlLmRvbS53cmFwRWxlbWVudHMuYm9hcmQgPSBib2FyZFdyYXA7XG4gIHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZCA9IGVsZW1lbnRzO1xuICBzdGF0ZS5kb20uYm91bmRzLmJvYXJkLmJvdW5kcy5jbGVhcigpO1xuXG4gIHN0YXRlLmRvbS5lbGVtZW50VW5iaW5kcy5zZXQoZWxlbWVudHMuYm9hcmQsIGV2ZW50cy5iaW5kQm9hcmQoc3RhdGUsIGVsZW1lbnRzKSk7XG5cbiAgc3RhdGUuZHJhd2FibGUucHJldlN2Z0hhc2ggPSAnJztcbiAgc3RhdGUucHJvbW90aW9uLnByZXZQcm9tb3Rpb25IYXNoID0gJyc7XG5cbiAgcmVuZGVyKHN0YXRlLCBlbGVtZW50cyk7XG4gIGlmIChyZXN0b3JlRm9jdXMpIGVsZW1lbnRzLmJvYXJkLmZvY3VzKHsgcHJldmVudFNjcm9sbDogdHJ1ZSB9KTtcbn1cblxuZnVuY3Rpb24gYXR0YWNoSGFuZHMoc3RhdGU6IFN0YXRlLCBoYW5kVG9wV3JhcD86IEhUTUxFbGVtZW50LCBoYW5kQm90dG9tV3JhcD86IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gIGlmIChoYW5kVG9wV3JhcCkgc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzPy50b3A/LnJlbW92ZSgpO1xuICBpZiAoaGFuZEJvdHRvbVdyYXApIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcz8uYm90dG9tPy5yZW1vdmUoKTtcbiAgZGV0YWNoRWxlbWVudHMoeyBoYW5kczogeyB0b3A6ICEhaGFuZFRvcFdyYXAsIGJvdHRvbTogISFoYW5kQm90dG9tV3JhcCB9IH0sIHN0YXRlLCB0cnVlKTtcbiAgaWYgKCFzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMpIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcyA9IHt9O1xuXG4gIGlmIChoYW5kVG9wV3JhcCkge1xuICAgIGNvbnN0IGhhbmRUb3AgPSB3cmFwSGFuZChoYW5kVG9wV3JhcCwgJ3RvcCcsIHN0YXRlKTtcbiAgICBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMudG9wID0gaGFuZFRvcDtcbiAgICBzdGF0ZS5kb20uZWxlbWVudFVuYmluZHMuc2V0KGhhbmRUb3AsIGV2ZW50cy5iaW5kSGFuZChzdGF0ZSwgaGFuZFRvcCkpO1xuICAgIHJlbmRlckhhbmQoc3RhdGUsIGhhbmRUb3ApO1xuICB9XG4gIGlmIChoYW5kQm90dG9tV3JhcCkge1xuICAgIGNvbnN0IGhhbmRCb3R0b20gPSB3cmFwSGFuZChoYW5kQm90dG9tV3JhcCwgJ2JvdHRvbScsIHN0YXRlKTtcbiAgICBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMuYm90dG9tID0gaGFuZEJvdHRvbTtcbiAgICBzdGF0ZS5kb20uZWxlbWVudFVuYmluZHMuc2V0KGhhbmRCb3R0b20sIGV2ZW50cy5iaW5kSGFuZChzdGF0ZSwgaGFuZEJvdHRvbSkpO1xuICAgIHJlbmRlckhhbmQoc3RhdGUsIGhhbmRCb3R0b20pO1xuICB9XG5cbiAgaWYgKGhhbmRUb3BXcmFwIHx8IGhhbmRCb3R0b21XcmFwKSB7XG4gICAgc3RhdGUuZG9tLmJvdW5kcy5oYW5kcy5ib3VuZHMuY2xlYXIoKTtcbiAgICBzdGF0ZS5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzLmNsZWFyKCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZHJhd0FsbCh3cmFwRWxlbWVudHM6IFdyYXBFbGVtZW50cywgc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5kb20uZGVzdHJveWVkKSByZXR1cm47XG4gIGlmICh3cmFwRWxlbWVudHMuaGFuZHMpIHtcbiAgICBpZiAoIXN0YXRlLmRvbS53cmFwRWxlbWVudHMuaGFuZHMpIHN0YXRlLmRvbS53cmFwRWxlbWVudHMuaGFuZHMgPSB7fTtcbiAgICBpZiAod3JhcEVsZW1lbnRzLmhhbmRzLnRvcCkgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5oYW5kcy50b3AgPSB3cmFwRWxlbWVudHMuaGFuZHMudG9wO1xuICAgIGlmICh3cmFwRWxlbWVudHMuaGFuZHMuYm90dG9tKSBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmhhbmRzLmJvdHRvbSA9IHdyYXBFbGVtZW50cy5oYW5kcy5ib3R0b207XG4gIH1cbiAgaWYgKHdyYXBFbGVtZW50cy5ib2FyZCkgYXR0YWNoQm9hcmQoc3RhdGUsIHdyYXBFbGVtZW50cy5ib2FyZCk7XG4gIGlmICh3cmFwRWxlbWVudHMuaGFuZHMgJiYgIXN0YXRlLmhhbmRzLmlubGluZWQpXG4gICAgYXR0YWNoSGFuZHMoc3RhdGUsIHdyYXBFbGVtZW50cy5oYW5kcy50b3AsIHdyYXBFbGVtZW50cy5oYW5kcy5ib3R0b20pO1xuICBlbHNlIGlmIChzdGF0ZS5oYW5kcy5pbmxpbmVkICYmICFzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQpIHtcbiAgICBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHM/LnRvcD8ucmVtb3ZlKCk7XG4gICAgc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzPy5ib3R0b20/LnJlbW92ZSgpO1xuICAgIGRldGFjaEVsZW1lbnRzKHsgaGFuZHM6IHsgdG9wOiB0cnVlLCBib3R0b206IHRydWUgfSB9LCBzdGF0ZSwgdHJ1ZSk7XG4gIH1cblxuICAvLyBzaGFwZXMgbWlnaHQgZGVwZW5kIGJvdGggb24gYm9hcmQgYW5kIGhhbmRzIC0gcmVkcmF3IG9ubHkgYWZ0ZXIgYm90aCBhcmUgZG9uZVxuICBzdGF0ZS5kb20ucmVkcmF3U2hhcGVzKCk7XG5cbiAgY29uc3QgaGFuZHMgPVxuICAgIHN0YXRlLmhhbmRzLmlubGluZWQgJiYgd3JhcEVsZW1lbnRzLmJvYXJkXG4gICAgICA/IHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZD8uaGFuZHNcbiAgICAgIDogd3JhcEVsZW1lbnRzLmhhbmRzO1xuICBpZiAoc3RhdGUuZXZlbnRzLmluc2VydClcbiAgICBzdGF0ZS5ldmVudHMuaW5zZXJ0KHdyYXBFbGVtZW50cy5ib2FyZCAmJiBzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQsIHtcbiAgICAgIHRvcDogaGFuZHM/LnRvcCAmJiBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHM/LnRvcCxcbiAgICAgIGJvdHRvbTogaGFuZHM/LmJvdHRvbSAmJiBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHM/LmJvdHRvbSxcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRldGFjaEVsZW1lbnRzKFxuICB3ZWI6IFdyYXBFbGVtZW50c0Jvb2xlYW4sXG4gIHN0YXRlOiBTdGF0ZSxcbiAga2VlcFdyYXBFbGVtZW50cyA9IGZhbHNlLFxuKTogdm9pZCB7XG4gIGNvbnN0IGlubGluZUhhbmRzID0gd2ViLmJvYXJkID8gc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkPy5oYW5kcyA6IHVuZGVmaW5lZDtcbiAgY29uc3QgZGV0YWNoVG9wID1cbiAgICB3ZWIuaGFuZHM/LnRvcCB8fFxuICAgICghIWlubGluZUhhbmRzPy50b3AgJiYgaW5saW5lSGFuZHMudG9wLmZpcnN0RWxlbWVudENoaWxkID09PSBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHM/LnRvcCk7XG4gIGNvbnN0IGRldGFjaEJvdHRvbSA9XG4gICAgd2ViLmhhbmRzPy5ib3R0b20gfHxcbiAgICAoISFpbmxpbmVIYW5kcz8uYm90dG9tICYmXG4gICAgICBpbmxpbmVIYW5kcy5ib3R0b20uZmlyc3RFbGVtZW50Q2hpbGQgPT09IHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcz8uYm90dG9tKTtcbiAgaWYgKCFrZWVwV3JhcEVsZW1lbnRzKSB7XG4gICAgaWYgKHdlYi5ib2FyZCkgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5ib2FyZCA9IHVuZGVmaW5lZDtcbiAgICBpZiAod2ViLmhhbmRzPy50b3AgJiYgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5oYW5kcylcbiAgICAgIHN0YXRlLmRvbS53cmFwRWxlbWVudHMuaGFuZHMudG9wID0gdW5kZWZpbmVkO1xuICAgIGlmICh3ZWIuaGFuZHM/LmJvdHRvbSAmJiBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmhhbmRzKVxuICAgICAgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5oYW5kcy5ib3R0b20gPSB1bmRlZmluZWQ7XG4gIH1cbiAgaWYgKHdlYi5ib2FyZCkge1xuICAgIGlmIChzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQpIHVuYmluZEVsZW1lbnQoc3RhdGUsIHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZC5ib2FyZCk7XG4gICAgc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzLmNsZWFyKCk7XG4gIH1cbiAgaWYgKHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcykge1xuICAgIGlmIChkZXRhY2hUb3ApIHtcbiAgICAgIGlmIChzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMudG9wKSB1bmJpbmRFbGVtZW50KHN0YXRlLCBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMudG9wKTtcbiAgICAgIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcy50b3AgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmIChkZXRhY2hCb3R0b20pIHtcbiAgICAgIGlmIChzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMuYm90dG9tKSB1bmJpbmRFbGVtZW50KHN0YXRlLCBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMuYm90dG9tKTtcbiAgICAgIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcy5ib3R0b20gPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmIChkZXRhY2hUb3AgfHwgZGV0YWNoQm90dG9tKSB7XG4gICAgICBzdGF0ZS5kb20uYm91bmRzLmhhbmRzLmJvdW5kcy5jbGVhcigpO1xuICAgICAgc3RhdGUuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcy5jbGVhcigpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiB1bmJpbmRFbGVtZW50KHN0YXRlOiBTdGF0ZSwgZWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gIHN0YXRlLmRvbS5lbGVtZW50VW5iaW5kcy5nZXQoZWwpPy4oKTtcbiAgc3RhdGUuZG9tLmVsZW1lbnRVbmJpbmRzLmRlbGV0ZShlbCk7XG4gIHN0YXRlLmRvbS5yZXNpemVPYnNlcnZlcj8udW5vYnNlcnZlKGVsKTtcbn1cbiIsICJpbXBvcnQgeyBhbmltLCByZW5kZXIgfSBmcm9tICcuL2FuaW0uanMnO1xuaW1wb3J0ICogYXMgYm9hcmQgZnJvbSAnLi9ib2FyZC5qcyc7XG5pbXBvcnQgdHlwZSB7IENvbmZpZyB9IGZyb20gJy4vY29uZmlnLmpzJztcbmltcG9ydCB7IGFwcGx5QW5pbWF0aW9uLCBjb25maWd1cmUgfSBmcm9tICcuL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBkZXRhY2hFbGVtZW50cywgcmVkcmF3QWxsIH0gZnJvbSAnLi9kb20uanMnO1xuaW1wb3J0IHsgY2FuY2VsIGFzIGRyYWdDYW5jZWwsIGRyYWdOZXdQaWVjZSB9IGZyb20gJy4vZHJhZy5qcyc7XG5pbXBvcnQgdHlwZSB7IERyYXdTaGFwZSwgU3F1YXJlSGlnaGxpZ2h0IH0gZnJvbSAnLi9kcmF3LmpzJztcbmltcG9ydCB7IGJpbmREb2N1bWVudCwgY2xlYXJCb3VuZHMsIHJlZnJlc2hCb3VuZHMgfSBmcm9tICcuL2V2ZW50cy5qcyc7XG5pbXBvcnQgeyBhZGRUb0hhbmQsIHJlbW92ZUZyb21IYW5kIH0gZnJvbSAnLi9oYW5kcy5qcyc7XG5pbXBvcnQgeyBib2FyZFRvU2ZlbiwgaGFuZHNUb1NmZW4sIGluZmVyRGltZW5zaW9ucyB9IGZyb20gJy4vc2Zlbi5qcyc7XG5pbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFwaSB7XG4gIC8vIGF0dGFjaCBlbGVtZW50cyB0byBjdXJyZW50IHNnIGluc3RhbmNlXG4gIGF0dGFjaCh3cmFwRWxlbWVudHM6IHNnLldyYXBFbGVtZW50cyk6IHZvaWQ7XG5cbiAgLy8gZGV0YWNoIGVsZW1lbnRzIGZyb20gY3VycmVudCBzZyBpbnN0YW5jZVxuICBkZXRhY2god3JhcEVsZW1lbnRzQm9vbGVhbjogc2cuV3JhcEVsZW1lbnRzQm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gcmVjb25maWd1cmUgdGhlIGluc3RhbmNlLiBBY2NlcHRzIGFsbCBjb25maWcgb3B0aW9uc1xuICAvLyBib2FyZCB3aWxsIGJlIGFuaW1hdGVkIGFjY29yZGluZ2x5LCBpZiBhbmltYXRpb25zIGFyZSBlbmFibGVkXG4gIHNldChjb25maWc6IENvbmZpZywgc2tpcEFuaW1hdGlvbj86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIHJlYWQgc2hvZ2lncm91bmQgc3RhdGU7IHdyaXRlIGF0IHlvdXIgb3duIHJpc2tzXG4gIHN0YXRlOiBTdGF0ZTtcblxuICAvLyBnZXQgdGhlIHBvc2l0aW9uIG9uIHRoZSBib2FyZCBpbiBGb3JzeXRoIG5vdGF0aW9uXG4gIGdldEJvYXJkU2ZlbigpOiBzZy5Cb2FyZFNmZW47XG5cbiAgLy8gZ2V0IHRoZSBwaWVjZXMgaW4gaGFuZCBpbiBGb3JzeXRoIG5vdGF0aW9uXG4gIGdldEhhbmRzU2ZlbigpOiBzZy5IYW5kc1NmZW47XG5cbiAgLy8gY2hhbmdlIHRoZSB2aWV3IGFuZ2xlXG4gIHRvZ2dsZU9yaWVudGF0aW9uKCk6IHZvaWQ7XG5cbiAgLy8gcGVyZm9ybSBhIG1vdmUgcHJvZ3JhbW1hdGljYWxseVxuICBtb3ZlKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gcGVyZm9ybSBhIGRyb3AgcHJvZ3JhbW1hdGljYWxseSwgYnkgZGVmYXVsdCBwaWVjZSBpcyB0YWtlbiBmcm9tIGhhbmRcbiAgZHJvcChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tPzogYm9vbGVhbiwgc3BhcmU/OiBib29sZWFuKTogdm9pZDtcblxuICAvLyBhZGQgYW5kL29yIHJlbW92ZSBhcmJpdHJhcnkgcGllY2VzIG9uIHRoZSBib2FyZFxuICBzZXRQaWVjZXMocGllY2VzOiBzZy5QaWVjZXNEaWZmKTogdm9pZDtcblxuICAvLyBhZGQgcGllY2Uucm9sZSB0byBoYW5kIG9mIHBpZWNlLmNvbG9yXG4gIGFkZFRvSGFuZChwaWVjZTogc2cuUGllY2UsIGNvdW50PzogbnVtYmVyKTogdm9pZDtcblxuICAvLyByZW1vdmUgcGllY2Uucm9sZSBmcm9tIGhhbmQgb2YgcGllY2UuY29sb3JcbiAgcmVtb3ZlRnJvbUhhbmQocGllY2U6IHNnLlBpZWNlLCBjb3VudD86IG51bWJlcik6IHZvaWQ7XG5cbiAgLy8gY2xpY2sgYSBzcXVhcmUgcHJvZ3JhbW1hdGljYWxseVxuICBzZWxlY3RTcXVhcmUoa2V5OiBzZy5LZXkgfCBudWxsLCBwcm9tPzogYm9vbGVhbiwgZm9yY2U/OiBib29sZWFuKTogdm9pZDtcblxuICAvLyBzZWxlY3QgYSBwaWVjZSBmcm9tIGhhbmQgdG8gZHJvcCBwcm9ncmFtYXRpY2FsbHksIGJ5IGRlZmF1bHQgcGllY2UgaW4gaGFuZCBpcyBzZWxlY3RlZFxuICBzZWxlY3RQaWVjZShwaWVjZTogc2cuUGllY2UgfCBudWxsLCBzcGFyZT86IGJvb2xlYW4sIGZvcmNlPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gcGxheSB0aGUgY3VycmVudCBwcmVtb3ZlLCBpZiBhbnk7IHJldHVybnMgdHJ1ZSBpZiBwcmVtb3ZlIHdhcyBwbGF5ZWRcbiAgcGxheVByZW1vdmUoKTogYm9vbGVhbjtcblxuICAvLyBjYW5jZWwgdGhlIGN1cnJlbnQgcHJlbW92ZSwgaWYgYW55XG4gIGNhbmNlbFByZW1vdmUoKTogdm9pZDtcblxuICAvLyBwbGF5IHRoZSBjdXJyZW50IHByZWRyb3AsIGlmIGFueTsgcmV0dXJucyB0cnVlIGlmIHByZW1vdmUgd2FzIHBsYXllZFxuICBwbGF5UHJlZHJvcCgpOiBib29sZWFuO1xuXG4gIC8vIGNhbmNlbCB0aGUgY3VycmVudCBwcmVkcm9wLCBpZiBhbnlcbiAgY2FuY2VsUHJlZHJvcCgpOiB2b2lkO1xuXG4gIC8vIGNhbmNlbCB0aGUgY3VycmVudCBtb3ZlIG9yIGRyb3AgYmVpbmcgbWFkZSwgcHJlbW92ZXMgYW5kIHByZWRyb3BzXG4gIGNhbmNlbE1vdmVPckRyb3AoKTogdm9pZDtcblxuICAvLyBjYW5jZWwgY3VycmVudCBtb3ZlIG9yIGRyb3AgYW5kIHByZXZlbnQgZnVydGhlciBvbmVzXG4gIHN0b3AoKTogdm9pZDtcblxuICAvLyBwcm9ncmFtbWF0aWNhbGx5IGRyYXcgdXNlciBzaGFwZXNcbiAgc2V0U2hhcGVzKHNoYXBlczogRHJhd1NoYXBlW10pOiB2b2lkO1xuXG4gIC8vIHByb2dyYW1tYXRpY2FsbHkgZHJhdyBhdXRvIHNoYXBlc1xuICBzZXRBdXRvU2hhcGVzKHNoYXBlczogRHJhd1NoYXBlW10pOiB2b2lkO1xuXG4gIC8vIHByb2dyYW1tYXRpY2FsbHkgaGlnaGxpZ2h0IHNxdWFyZXNcbiAgc2V0U3F1YXJlSGlnaGxpZ2h0cyhzcXVhcmVzOiBTcXVhcmVIaWdobGlnaHRbXSk6IHZvaWQ7XG5cbiAgLy8gZm9yIHBpZWNlIGRyb3BwaW5nIGFuZCBib2FyZCBlZGl0b3JzXG4gIGRyYWdOZXdQaWVjZShwaWVjZTogc2cuUGllY2UsIGV2ZW50OiBzZy5Nb3VjaEV2ZW50LCBzcGFyZT86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIHJlbWVhc3VyZSB0aGUgYm9hcmQgYW5kIGhhbmRzIGFmdGVyIHRoZSBwYWdlIGxheW91dCBtb3ZlZCB0aGVtXG4gIHJlZnJlc2hCb3VuZHMoKTogdm9pZDtcblxuICAvLyB1bmJpbmRzIGFsbCBldmVudHNcbiAgLy8gKGltcG9ydGFudCBmb3IgZG9jdW1lbnQtd2lkZSBldmVudHMgbGlrZSBzY3JvbGwgYW5kIG1vdXNlbW92ZSlcbiAgZGVzdHJveTogc2cuVW5iaW5kO1xufVxuXG4vLyBzZWUgQVBJIHR5cGVzIGFuZCBkb2N1bWVudGF0aW9ucyBpbiBhcGkuZC50c1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0KHN0YXRlOiBTdGF0ZSk6IEFwaSB7XG4gIHJldHVybiB7XG4gICAgYXR0YWNoKHdyYXBFbGVtZW50czogc2cuV3JhcEVsZW1lbnRzKTogdm9pZCB7XG4gICAgICByZWRyYXdBbGwod3JhcEVsZW1lbnRzLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGRldGFjaCh3cmFwRWxlbWVudHNCb29sZWFuOiBzZy5XcmFwRWxlbWVudHNCb29sZWFuKTogdm9pZCB7XG4gICAgICBkZXRhY2hFbGVtZW50cyh3cmFwRWxlbWVudHNCb29sZWFuLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHNldCh1cGRhdGU6IENvbmZpZywgc2tpcEFuaW1hdGlvbj86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgIGlmIChzdGF0ZS5kb20uZGVzdHJveWVkKSByZXR1cm47XG4gICAgICBjb25zdCBjb25maWcgPSB7IC4uLnVwZGF0ZSwgdmlld09ubHk6IHVwZGF0ZS52aWV3T25seSA/PyBzdGF0ZS52aWV3T25seSB9O1xuICAgICAgY29uc3QgY2hhbmdlZCA9IDxUPih2YWx1ZTogVCB8IHVuZGVmaW5lZCwgY3VycmVudDogVCk6IGJvb2xlYW4gPT5cbiAgICAgICAgdmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gY3VycmVudDtcbiAgICAgIGNvbnN0IHZpZXdPbmx5Q2hhbmdlZCA9IGNoYW5nZWQoY29uZmlnLnZpZXdPbmx5LCBzdGF0ZS52aWV3T25seSk7XG4gICAgICBjb25zdCBuZXdEaW1zID0gY29uZmlnLnNmZW4/LmJvYXJkICYmIGluZmVyRGltZW5zaW9ucyhjb25maWcuc2Zlbi5ib2FyZCk7XG4gICAgICBjb25zdCB0b1JlZHJhdyA9XG4gICAgICAgIHZpZXdPbmx5Q2hhbmdlZCB8fFxuICAgICAgICBjaGFuZ2VkKGNvbmZpZy5vcmllbnRhdGlvbiwgc3RhdGUub3JpZW50YXRpb24pIHx8XG4gICAgICAgIGNoYW5nZWQoY29uZmlnLmNvb3JkaW5hdGVzPy5lbmFibGVkLCBzdGF0ZS5jb29yZGluYXRlcy5lbmFibGVkKSB8fFxuICAgICAgICBjaGFuZ2VkKGNvbmZpZy5jb29yZGluYXRlcz8uZmlsZXMsIHN0YXRlLmNvb3JkaW5hdGVzLmZpbGVzKSB8fFxuICAgICAgICBjaGFuZ2VkKGNvbmZpZy5jb29yZGluYXRlcz8ucmFua3MsIHN0YXRlLmNvb3JkaW5hdGVzLnJhbmtzKSB8fFxuICAgICAgICBjaGFuZ2VkKGNvbmZpZy5kcmF3YWJsZT8udmlzaWJsZSwgc3RhdGUuZHJhd2FibGUudmlzaWJsZSkgfHxcbiAgICAgICAgY2hhbmdlZChjb25maWcuaGFuZHM/LmlubGluZWQsIHN0YXRlLmhhbmRzLmlubGluZWQpIHx8XG4gICAgICAgICEhY29uZmlnLnNxdWFyZVJhdGlvPy5zb21lKCh2YWx1ZSwgaSkgPT4gdmFsdWUgIT09IHN0YXRlLnNxdWFyZVJhdGlvW2ldKSB8fFxuICAgICAgICAhIShcbiAgICAgICAgICBuZXdEaW1zICYmXG4gICAgICAgICAgKG5ld0RpbXMuZmlsZXMgIT09IHN0YXRlLmRpbWVuc2lvbnMuZmlsZXMgfHwgbmV3RGltcy5yYW5rcyAhPT0gc3RhdGUuZGltZW5zaW9ucy5yYW5rcylcbiAgICAgICAgKSB8fFxuICAgICAgICAhIShcbiAgICAgICAgICBjb25maWcuaGFuZHM/LnJvbGVzICYmXG4gICAgICAgICAgKGNvbmZpZy5oYW5kcy5yb2xlcy5sZW5ndGggIT09IHN0YXRlLmhhbmRzLnJvbGVzLmxlbmd0aCB8fFxuICAgICAgICAgICAgY29uZmlnLmhhbmRzLnJvbGVzLnNvbWUoKHIsIGkpID0+IHIgIT09IHN0YXRlLmhhbmRzLnJvbGVzW2ldKSlcbiAgICAgICAgKTtcblxuICAgICAgaWYgKHRvUmVkcmF3IHx8IGNvbmZpZy5kcmF3YWJsZT8uZW5hYmxlZCA9PT0gZmFsc2UpIHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgICBpZiAodG9SZWRyYXcpIHtcbiAgICAgICAgYm9hcmQucmVzZXQoc3RhdGUpO1xuICAgICAgICBjb25maWd1cmUoc3RhdGUsIGNvbmZpZyk7XG4gICAgICAgIGlmICh2aWV3T25seUNoYW5nZWQpIHtcbiAgICAgICAgICBzdGF0ZS5kb20udW5iaW5kKCk7XG4gICAgICAgICAgc3RhdGUuZG9tLnVuYmluZCA9IGJpbmREb2N1bWVudChzdGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVkcmF3QWxsKHN0YXRlLmRvbS53cmFwRWxlbWVudHMsIHN0YXRlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFwcGx5QW5pbWF0aW9uKHN0YXRlLCBjb25maWcpO1xuICAgICAgICBpZiAoc2tpcEFuaW1hdGlvbikgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgICAgIChjb25maWcuc2Zlbj8uYm9hcmQgJiYgIXNraXBBbmltYXRpb24gPyBhbmltIDogcmVuZGVyKShcbiAgICAgICAgICAoc3RhdGUpID0+IGNvbmZpZ3VyZShzdGF0ZSwgY29uZmlnKSxcbiAgICAgICAgICBzdGF0ZSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RhdGUsXG5cbiAgICBnZXRCb2FyZFNmZW46ICgpID0+IGJvYXJkVG9TZmVuKHN0YXRlLnBpZWNlcywgc3RhdGUuZGltZW5zaW9ucywgc3RhdGUuZm9yc3l0aC50b0ZvcnN5dGgpLFxuXG4gICAgZ2V0SGFuZHNTZmVuOiAoKSA9PlxuICAgICAgaGFuZHNUb1NmZW4oc3RhdGUuaGFuZHMuaGFuZE1hcCwgc3RhdGUuaGFuZHMucm9sZXMsIHN0YXRlLmZvcnN5dGgudG9Gb3JzeXRoKSxcblxuICAgIHRvZ2dsZU9yaWVudGF0aW9uKCk6IHZvaWQge1xuICAgICAgYm9hcmQudG9nZ2xlT3JpZW50YXRpb24oc3RhdGUpO1xuICAgICAgcmVkcmF3QWxsKHN0YXRlLmRvbS53cmFwRWxlbWVudHMsIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgbW92ZShvcmlnLCBkZXN0LCBwcm9tKTogdm9pZCB7XG4gICAgICBhbmltKFxuICAgICAgICAoc3RhdGUpID0+XG4gICAgICAgICAgYm9hcmQuYmFzZU1vdmUoc3RhdGUsIG9yaWcsIGRlc3QsIHByb20gfHwgc3RhdGUucHJvbW90aW9uLmZvcmNlTW92ZVByb21vdGlvbihvcmlnLCBkZXN0KSksXG4gICAgICAgIHN0YXRlLFxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgZHJvcChwaWVjZSwga2V5LCBwcm9tLCBzcGFyZSk6IHZvaWQge1xuICAgICAgYW5pbShcbiAgICAgICAgKHN0YXRlKSA9PlxuICAgICAgICAgIGJvYXJkLmJhc2VEcm9wKFxuICAgICAgICAgICAgc3RhdGUsXG4gICAgICAgICAgICBwaWVjZSxcbiAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgIHByb20gfHwgc3RhdGUucHJvbW90aW9uLmZvcmNlRHJvcFByb21vdGlvbihwaWVjZSwga2V5KSxcbiAgICAgICAgICAgICEhc3BhcmUsXG4gICAgICAgICAgKSxcbiAgICAgICAgc3RhdGUsXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBzZXRQaWVjZXMocGllY2VzKTogdm9pZCB7XG4gICAgICBhbmltKChzdGF0ZSkgPT4gYm9hcmQuc2V0UGllY2VzKHN0YXRlLCBwaWVjZXMpLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGFkZFRvSGFuZChwaWVjZTogc2cuUGllY2UsIGNvdW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgIHJlbmRlcigoc3RhdGUpID0+IGFkZFRvSGFuZChzdGF0ZSwgcGllY2UsIGNvdW50KSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICByZW1vdmVGcm9tSGFuZChwaWVjZTogc2cuUGllY2UsIGNvdW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgIHJlbmRlcigoc3RhdGUpID0+IHtcbiAgICAgICAgcmVtb3ZlRnJvbUhhbmQoc3RhdGUsIHBpZWNlLCBjb3VudCk7XG4gICAgICAgIGJvYXJkLnVuc2VsZWN0TWlzc2luZ1BpZWNlKHN0YXRlKTtcbiAgICAgIH0sIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc2VsZWN0U3F1YXJlKGtleSwgcHJvbSwgZm9yY2UpOiB2b2lkIHtcbiAgICAgIGlmIChrZXkpIGFuaW0oKHN0YXRlKSA9PiBib2FyZC5zZWxlY3RTcXVhcmUoc3RhdGUsIGtleSwgcHJvbSwgZm9yY2UpLCBzdGF0ZSk7XG4gICAgICBlbHNlIGlmIChzdGF0ZS5zZWxlY3RlZCkge1xuICAgICAgICBib2FyZC51bnNlbGVjdChzdGF0ZSk7XG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc2VsZWN0UGllY2UocGllY2UsIHNwYXJlLCBmb3JjZSk6IHZvaWQge1xuICAgICAgaWYgKHBpZWNlKSByZW5kZXIoKHN0YXRlKSA9PiBib2FyZC5zZWxlY3RQaWVjZShzdGF0ZSwgcGllY2UsIHNwYXJlLCBmb3JjZSwgdHJ1ZSksIHN0YXRlKTtcbiAgICAgIGVsc2UgaWYgKHN0YXRlLnNlbGVjdGVkUGllY2UpIHtcbiAgICAgICAgYm9hcmQudW5zZWxlY3Qoc3RhdGUpO1xuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHBsYXlQcmVtb3ZlKCk6IGJvb2xlYW4ge1xuICAgICAgaWYgKHN0YXRlLnByZW1vdmFibGUuY3VycmVudCkge1xuICAgICAgICBpZiAoYW5pbShib2FyZC5wbGF5UHJlbW92ZSwgc3RhdGUpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgLy8gaWYgdGhlIHByZW1vdmUgY291bGRuJ3QgYmUgcGxheWVkLCByZWRyYXcgdG8gY2xlYXIgaXQgdXBcbiAgICAgICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICBwbGF5UHJlZHJvcCgpOiBib29sZWFuIHtcbiAgICAgIGlmIChzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCkge1xuICAgICAgICBpZiAoYW5pbShib2FyZC5wbGF5UHJlZHJvcCwgc3RhdGUpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgLy8gaWYgdGhlIHByZWRyb3AgY291bGRuJ3QgYmUgcGxheWVkLCByZWRyYXcgdG8gY2xlYXIgaXQgdXBcbiAgICAgICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICBjYW5jZWxQcmVtb3ZlKCk6IHZvaWQge1xuICAgICAgcmVuZGVyKGJvYXJkLnVuc2V0UHJlbW92ZSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBjYW5jZWxQcmVkcm9wKCk6IHZvaWQge1xuICAgICAgcmVuZGVyKGJvYXJkLnVuc2V0UHJlZHJvcCwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBjYW5jZWxNb3ZlT3JEcm9wKCk6IHZvaWQge1xuICAgICAgcmVuZGVyKChzdGF0ZSkgPT4ge1xuICAgICAgICBib2FyZC5jYW5jZWxNb3ZlT3JEcm9wKHN0YXRlKTtcbiAgICAgICAgZHJhZ0NhbmNlbChzdGF0ZSk7XG4gICAgICB9LCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHN0b3AoKTogdm9pZCB7XG4gICAgICByZW5kZXIoKHN0YXRlKSA9PiB7XG4gICAgICAgIGJvYXJkLnN0b3Aoc3RhdGUpO1xuICAgICAgfSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzZXRBdXRvU2hhcGVzKHNoYXBlczogRHJhd1NoYXBlW10pOiB2b2lkIHtcbiAgICAgIHJlbmRlcigoc3RhdGUpID0+IHtcbiAgICAgICAgc3RhdGUuZHJhd2FibGUuYXV0b1NoYXBlcyA9IHNoYXBlcy5zbGljZSgpO1xuICAgICAgfSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzZXRTaGFwZXMoc2hhcGVzOiBEcmF3U2hhcGVbXSk6IHZvaWQge1xuICAgICAgcmVuZGVyKChzdGF0ZSkgPT4ge1xuICAgICAgICBzdGF0ZS5kcmF3YWJsZS5zaGFwZXMgPSBzaGFwZXMuc2xpY2UoKTtcbiAgICAgIH0sIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc2V0U3F1YXJlSGlnaGxpZ2h0cyhzcXVhcmVzOiBTcXVhcmVIaWdobGlnaHRbXSk6IHZvaWQge1xuICAgICAgcmVuZGVyKChzdGF0ZSkgPT4ge1xuICAgICAgICBzdGF0ZS5kcmF3YWJsZS5zcXVhcmVzID0gc3F1YXJlcztcbiAgICAgIH0sIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgZHJhZ05ld1BpZWNlKHBpZWNlLCBldmVudCwgc3BhcmUpOiB2b2lkIHtcbiAgICAgIGNsZWFyQm91bmRzKHN0YXRlKTtcbiAgICAgIGRyYWdOZXdQaWVjZShzdGF0ZSwgcGllY2UsIGV2ZW50LCBzcGFyZSk7XG4gICAgfSxcblxuICAgIHJlZnJlc2hCb3VuZHMoKTogdm9pZCB7XG4gICAgICByZWZyZXNoQm91bmRzKHN0YXRlKTtcbiAgICB9LFxuXG4gICAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICAgIGJvYXJkLnN0b3Aoc3RhdGUpO1xuICAgICAgc3RhdGUuZHJhd2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICAgIHN0YXRlLmRvbS5lbGVtZW50VW5iaW5kcy5mb3JFYWNoKCh1bmJpbmQpID0+IHtcbiAgICAgICAgdW5iaW5kKCk7XG4gICAgICB9KTtcbiAgICAgIHN0YXRlLmRvbS5lbGVtZW50VW5iaW5kcy5jbGVhcigpO1xuICAgICAgc3RhdGUuZG9tLnVuYmluZCgpO1xuICAgICAgc3RhdGUuZG9tLmRlc3Ryb3llZCA9IHRydWU7XG4gICAgfSxcbiAgfTtcbn1cbiIsICJpbXBvcnQgeyByZW5kZXJIYW5kIH0gZnJvbSAnLi9oYW5kcy5qcyc7XG5pbXBvcnQgeyByZW5kZXIgfSBmcm9tICcuL3JlbmRlci5qcyc7XG5pbXBvcnQgeyByZW5kZXJTaGFwZXMgfSBmcm9tICcuL3NoYXBlcy5qcyc7XG5pbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZWRyYXdTaGFwZXNOb3coc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQ/LnNoYXBlcylcbiAgICByZW5kZXJTaGFwZXMoXG4gICAgICBzdGF0ZSxcbiAgICAgIHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZC5zaGFwZXMuc3ZnLFxuICAgICAgc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkLnNoYXBlcy5jdXN0b21TdmcsXG4gICAgICBzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQuc2hhcGVzLmZyZWVQaWVjZXMsXG4gICAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZHJhd05vdyhzdGF0ZTogU3RhdGUsIHNraXBTaGFwZXM/OiBib29sZWFuKTogdm9pZCB7XG4gIGNvbnN0IGJvYXJkRWxzID0gc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkO1xuICBpZiAoYm9hcmRFbHMpIHtcbiAgICByZW5kZXIoc3RhdGUsIGJvYXJkRWxzKTtcbiAgICBpZiAoIXNraXBTaGFwZXMpIHJlZHJhd1NoYXBlc05vdyhzdGF0ZSk7XG4gIH1cblxuICBjb25zdCBoYW5kRWxzID0gc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzO1xuICBpZiAoaGFuZEVscykge1xuICAgIGlmIChoYW5kRWxzLnRvcCkgcmVuZGVySGFuZChzdGF0ZSwgaGFuZEVscy50b3ApO1xuICAgIGlmIChoYW5kRWxzLmJvdHRvbSkgcmVuZGVySGFuZChzdGF0ZSwgaGFuZEVscy5ib3R0b20pO1xuICB9XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBBbmltQ3VycmVudCB9IGZyb20gJy4vYW5pbS5qcyc7XG5pbXBvcnQgdHlwZSB7IERyYWdDdXJyZW50IH0gZnJvbSAnLi9kcmFnLmpzJztcbmltcG9ydCB0eXBlIHsgRHJhd2FibGUgfSBmcm9tICcuL2RyYXcuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBIZWFkbGVzc1N0YXRlIHtcbiAgcGllY2VzOiBzZy5QaWVjZXM7XG4gIG9yaWVudGF0aW9uOiBzZy5Db2xvcjsgLy8gYm9hcmQgb3JpZW50YXRpb24uIHNlbnRlIHwgZ290ZVxuICBkaW1lbnNpb25zOiBzZy5EaW1lbnNpb25zOyAvLyBib2FyZCBkaW1lbnNpb25zIC0gbWF4IDE2eDE2XG4gIHR1cm5Db2xvcjogc2cuQ29sb3I7IC8vIHR1cm4gdG8gcGxheS4gc2VudGUgfCBnb3RlXG4gIGFjdGl2ZUNvbG9yPzogc2cuQ29sb3IgfCAnYm90aCc7IC8vIGNvbG9yIHRoYXQgY2FuIG1vdmUgb3IgZHJvcC4gc2VudGUgfCBnb3RlIHwgYm90aCB8IHVuZGVmaW5lZFxuICBjaGVja3M/OiBzZy5LZXlbXTsgLy8gc3F1YXJlcyBjdXJyZW50bHkgaW4gY2hlY2sgW1wiNWFcIl1cbiAgbGFzdERlc3RzPzogc2cuS2V5W107IC8vIHNxdWFyZXMgcGFydCBvZiB0aGUgbGFzdCBtb3ZlIG9yIGRyb3AgW1wiMmJcIjsgXCI4aFwiXVxuICBsYXN0UGllY2U/OiBzZy5QaWVjZTsgLy8gcGllY2UgcGFydCBvZiB0aGUgbGFzdCBkcm9wXG4gIHNlbGVjdGVkPzogc2cuS2V5OyAvLyBzcXVhcmUgY3VycmVudGx5IHNlbGVjdGVkIFwiMWFcIlxuICBzZWxlY3RlZFBpZWNlPzogc2cuUGllY2U7IC8vIHBpZWNlIGluIGhhbmQgY3VycmVudGx5IHNlbGVjdGVkXG4gIGhvdmVyZWQ/OiBzZy5LZXk7IC8vIHNxdWFyZSBjdXJyZW50bHkgYmVpbmcgaG92ZXJlZFxuICB2aWV3T25seTogYm9vbGVhbjsgLy8gZG9uJ3QgYmluZCBpbnRlcmFjdGlvbiBldmVudHNcbiAgc3F1YXJlUmF0aW86IHNnLk51bWJlclBhaXI7IC8vIHJhdGlvIG9mIHRoZSBib2FyZCBbd2lkdGgsIGhlaWdodF1cbiAgZGlzYWJsZUNvbnRleHRNZW51OiBib29sZWFuOyAvLyBiZWNhdXNlIHdobyBuZWVkcyBhIGNvbnRleHQgbWVudSBvbiBhIHNob2dpIGJvYXJkXG4gIGJsb2NrVG91Y2hTY3JvbGw6IGJvb2xlYW47IC8vIGJsb2NrIHNjcm9sbGluZyB2aWEgdG91Y2ggZHJhZ2dpbmcgb24gdGhlIGJvYXJkLCBlLmcuIGZvciBjb29yZGluYXRlIHRyYWluaW5nXG4gIHNjYWxlRG93blBpZWNlczogYm9vbGVhbjtcbiAgY29vcmRpbmF0ZXM6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBpbmNsdWRlIGNvb3JkcyBhdHRyaWJ1dGVzXG4gICAgZmlsZXM6IHNnLk5vdGF0aW9uO1xuICAgIHJhbmtzOiBzZy5Ob3RhdGlvbjtcbiAgfTtcbiAgaGlnaGxpZ2h0OiB7XG4gICAgbGFzdERlc3RzOiBib29sZWFuOyAvLyBhZGQgbGFzdC1kZXN0IGNsYXNzIHRvIHNxdWFyZXMgYW5kIHBpZWNlc1xuICAgIGNoZWNrOiBib29sZWFuOyAvLyBhZGQgY2hlY2sgY2xhc3MgdG8gc3F1YXJlc1xuICAgIGNoZWNrUm9sZXM6IHNnLlJvbGVTdHJpbmdbXTsgLy8gcm9sZXMgdG8gYmUgaGlnaGxpZ2h0ZWQgd2hlbiBjaGVjayBpcyBib29sZWFuIGlzIHBhc3NlZCBmcm9tIGNvbmZpZ1xuICAgIGhvdmVyZWQ6IGJvb2xlYW47IC8vIGFkZCBob3ZlciBjbGFzcyB0byBob3ZlcmVkIHNxdWFyZXNcbiAgfTtcbiAgYW5pbWF0aW9uOiB7IGVuYWJsZWQ6IGJvb2xlYW47IGhhbmRzOiBib29sZWFuOyBkdXJhdGlvbjogbnVtYmVyOyBjdXJyZW50PzogQW5pbUN1cnJlbnQgfTtcbiAgaGFuZHM6IHtcbiAgICBpbmxpbmVkOiBib29sZWFuOyAvLyBhdHRhY2hlcyBzZy1oYW5kcyBkaXJlY3RseSB0byBzZy13cmFwLCBpZ25vcmVzIEhUTUxFbGVtZW50cyBwYXNzZWQgdG8gU2hvZ2lncm91bmRcbiAgICBoYW5kTWFwOiBzZy5IYW5kcztcbiAgICByb2xlczogc2cuUm9sZVN0cmluZ1tdOyAvLyByb2xlcyB0byByZW5kZXIgaW4gc2ctaGFuZFxuICB9O1xuICBtb3ZhYmxlOiB7XG4gICAgZnJlZTogYm9vbGVhbjsgLy8gYWxsIG1vdmVzIGFyZSB2YWxpZCAtIGJvYXJkIGVkaXRvclxuICAgIGRlc3RzPzogc2cuTW92ZURlc3RzOyAvLyB2YWxpZCBtb3Zlcy4ge1wiN2dcIiBbXCI3ZlwiXSBcIjVpXCIgW1wiNGhcIiBcIjVoXCIgXCI2aFwiXX1cbiAgICBzaG93RGVzdHM6IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBkZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBldmVudHM6IHtcbiAgICAgIGFmdGVyPzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tOiBib29sZWFuLCBtZXRhZGF0YTogc2cuTW92ZU1ldGFkYXRhKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIG1vdmUgaGFzIGJlZW4gcGxheWVkXG4gICAgfTtcbiAgfTtcbiAgZHJvcHBhYmxlOiB7XG4gICAgZnJlZTogYm9vbGVhbjsgLy8gYWxsIGRyb3BzIGFyZSB2YWxpZCAtIGJvYXJkIGVkaXRvclxuICAgIGRlc3RzPzogc2cuRHJvcERlc3RzOyAvLyB2YWxpZCBkcm9wcy4ge1wic2VudGUgcGF3blwiIFtcIjNhXCIgXCI0YVwiXSBcInNlbnRlIGxhbmNlXCIgW1wiM2FcIiBcIjNjXCJdfVxuICAgIHNob3dEZXN0czogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIGRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIHNwYXJlOiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIHJlbW92ZSBkcm9wcGVkIHBpZWNlIGZyb20gaGFuZCBhZnRlciBkcm9wIC0gYm9hcmQgZWRpdG9yXG4gICAgZXZlbnRzOiB7XG4gICAgICBhZnRlcj86IChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tOiBib29sZWFuLCBtZXRhZGF0YTogc2cuTW92ZU1ldGFkYXRhKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIGRyb3AgaGFzIGJlZW4gcGxheWVkXG4gICAgfTtcbiAgfTtcbiAgcHJlbW92YWJsZToge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGFsbG93IHByZW1vdmVzIGZvciBjb2xvciB0aGF0IGNhbiBub3QgbW92ZVxuICAgIHNob3dEZXN0czogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIHByZS1kZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBkZXN0cz86IHNnLk1vdmVEZXN0czsgLy8gZ2VuZXJhdGVkIHByZW1vdmUgZGVzdGluYXRpb25zIGJ5IG9yaWdpbiwgY2xlYXJlZCBvbiBib2FyZCBjaGFuZ2VzXG4gICAgY3VycmVudD86IHsgb3JpZzogc2cuS2V5OyBkZXN0OiBzZy5LZXk7IHByb206IGJvb2xlYW4gfTtcbiAgICBnZW5lcmF0ZT86IChrZXk6IHNnLktleSwgcGllY2VzOiBzZy5QaWVjZXMpID0+IHNnLktleVtdO1xuICAgIGV2ZW50czoge1xuICAgICAgc2V0PzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tOiBib29sZWFuKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZW1vdmUgaGFzIGJlZW4gc2V0XG4gICAgICB1bnNldD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlbW92ZSBoYXMgYmVlbiB1bnNldFxuICAgIH07XG4gIH07XG4gIHByZWRyb3BwYWJsZToge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGFsbG93IHByZWRyb3BzIGZvciBjb2xvciB0aGF0IGNhbiBub3QgbW92ZVxuICAgIHNob3dEZXN0czogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIHByZS1kZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBkZXN0cz86IHNnLkRyb3BEZXN0czsgLy8gZ2VuZXJhdGVkIHByZWRyb3AgZGVzdGluYXRpb25zIGJ5IHBpZWNlLCBjbGVhcmVkIG9uIGJvYXJkIGNoYW5nZXNcbiAgICBjdXJyZW50PzogeyBwaWVjZTogc2cuUGllY2U7IGtleTogc2cuS2V5OyBwcm9tOiBib29sZWFuIH07XG4gICAgZ2VuZXJhdGU/OiAocGllY2U6IHNnLlBpZWNlLCBwaWVjZXM6IHNnLlBpZWNlcykgPT4gc2cuS2V5W107XG4gICAgZXZlbnRzOiB7XG4gICAgICBzZXQ/OiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSwgcHJvbTogYm9vbGVhbikgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVkcm9wIGhhcyBiZWVuIHNldFxuICAgICAgdW5zZXQ/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZWRyb3AgaGFzIGJlZW4gdW5zZXRcbiAgICB9O1xuICB9O1xuICBkcmFnZ2FibGU6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBhbGxvdyBtb3ZlcyAmIHByZW1vdmVzIHRvIHVzZSBkcmFnJ24gZHJvcFxuICAgIGRpc3RhbmNlOiBudW1iZXI7IC8vIG1pbmltdW0gZGlzdGFuY2UgdG8gaW5pdGlhdGUgYSBkcmFnOyBpbiBwaXhlbHNcbiAgICBhdXRvRGlzdGFuY2U6IGJvb2xlYW47IC8vIGxldHMgc2hvZ2lncm91bmQgc2V0IGRpc3RhbmNlIHRvIHplcm8gd2hlbiB1c2VyIGRyYWdzIHBpZWNlc1xuICAgIHNob3dHaG9zdDogYm9vbGVhbjsgLy8gc2hvdyBnaG9zdCBvZiBwaWVjZSBiZWluZyBkcmFnZ2VkXG4gICAgc2hvd1RvdWNoU3F1YXJlT3ZlcmxheTogYm9vbGVhbjsgLy8gc2hvdyBzcXVhcmUgb3ZlcmxheSBvbiB0aGUgc3F1YXJlIHRoYXQgaXMgY3VycmVudGx5IGJlaW5nIGhvdmVyZWQsIHRvdWNoIG9ubHlcbiAgICBkZWxldGVPbkRyb3BPZmY6IGJvb2xlYW47IC8vIGRlbGV0ZSBhIHBpZWNlIHdoZW4gaXQgaXMgZHJvcHBlZCBvZmYgdGhlIGJvYXJkIC0gYm9hcmQgZWRpdG9yXG4gICAgYWRkVG9IYW5kT25Ecm9wT2ZmOiBib29sZWFuOyAvLyBhZGQgYSBwaWVjZSB0byBoYW5kIHdoZW4gaXQgaXMgZHJvcHBlZCBvbiBpdCwgcmVxdWlyZXMgZGVsZXRlT25Ecm9wT2ZmIC0gYm9hcmQgZWRpdG9yXG4gICAgY3VycmVudD86IERyYWdDdXJyZW50O1xuICB9O1xuICBzZWxlY3RhYmxlOiB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjsgLy8gZGlzYWJsZSB0byBlbmZvcmNlIGRyYWdnaW5nIG92ZXIgY2xpY2stY2xpY2sgbW92ZVxuICAgIGZvcmNlU3BhcmVzOiBib29sZWFuOyAvLyBhbGxvdyBkcm9wcGluZyBzcGFyZSBwaWVjZXMgZXZlbiB3aXRoIHNlbGVjdGFibGUgZGlzYWJsZWRcbiAgICBkZWxldGVPblRvdWNoOiBib29sZWFuOyAvLyBzZWxlY3RpbmcgYSBwaWVjZSBvbiB0aGUgYm9hcmQgb3IgaW4gaGFuZCB3aWxsIHJlbW92ZSBpdCAtIGJvYXJkIGVkaXRvclxuICAgIGFkZFNwYXJlc1RvSGFuZDogYm9vbGVhbjsgLy8gYWRkIHNlbGVjdGVkIHNwYXJlIHBpZWNlIHRvIGhhbmQgLSBib2FyZCBlZGl0b3JcbiAgfTtcbiAga2V5Ym9hcmQ6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBhcnJvdyBrZXlzLCBFbnRlciBhbmQgRXNjYXBlIG9uIHRoZSBmb2N1c2VkIGJvYXJkXG4gICAgYXJpYUxhYmVsPzogc3RyaW5nOyAvLyBhY2Nlc3NpYmxlIGxhYmVsIGZvciB0aGUga2V5Ym9hcmQtZW5hYmxlZCBib2FyZFxuICAgIGN1cnJlbnQ/OiBzZy5LZXkgfCBzZy5QaWVjZTsgLy8gY3Vyc29yLCBpbmRlcGVuZGVudCBvZiB0aGUgc2VsZWN0ZWQgcGllY2VcbiAgICBmb2N1c2VkOiBib29sZWFuO1xuICB9O1xuICBwcm9tb3Rpb246IHtcbiAgICBwcm9tb3Rlc1RvOiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICB1bnByb21vdGVzVG86IChyb2xlOiBzZy5Sb2xlU3RyaW5nKSA9PiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIG1vdmVQcm9tb3Rpb25EaWFsb2c6IChvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSkgPT4gYm9vbGVhbjtcbiAgICBmb3JjZU1vdmVQcm9tb3Rpb246IChvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSkgPT4gYm9vbGVhbjtcbiAgICBkcm9wUHJvbW90aW9uRGlhbG9nOiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSkgPT4gYm9vbGVhbjtcbiAgICBmb3JjZURyb3BQcm9tb3Rpb246IChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5KSA9PiBib29sZWFuO1xuICAgIGN1cnJlbnQ/OiB7XG4gICAgICBwaWVjZTogc2cuUGllY2U7XG4gICAgICBwcm9tb3RlZFBpZWNlOiBzZy5QaWVjZTtcbiAgICAgIGtleTogc2cuS2V5O1xuICAgICAgZHJhZ2dlZDogYm9vbGVhbjsgLy8gbm8gYW5pbWF0aW9ucyB3aXRoIGRyYWdcbiAgICAgIGtleWJvYXJkQ2hvaWNlPzogYm9vbGVhbjsgLy8gdW5kZWZpbmVkIGRlZmF1bHRzIHRvIHRoZSBwcm9tb3RlZCBvcHRpb25cbiAgICB9O1xuICAgIGV2ZW50czoge1xuICAgICAgaW5pdGlhdGVkPzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gcHJvbW90aW9uIGRpYWxvZyBpcyBzdGFydGVkXG4gICAgICBhZnRlcj86IChwaWVjZTogc2cuUGllY2UpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB1c2VyIHNlbGVjdHMgYSBwaWVjZVxuICAgICAgY2FuY2VsPzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gYW4gb3BlbiBkaWFsb2cgaXMgZGlzbWlzc2VkIHdpdGhvdXQgYSBjaG9pY2VcbiAgICB9O1xuICAgIHByZXZQcm9tb3Rpb25IYXNoOiBzdHJpbmc7XG4gIH07XG4gIGZvcnN5dGg6IHtcbiAgICB0b0ZvcnN5dGg/OiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIGZyb21Gb3JzeXRoPzogKHN0cjogc3RyaW5nKSA9PiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkO1xuICB9O1xuICBldmVudHM6IHtcbiAgICBjaGFuZ2U/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHNpdHVhdGlvbiBjaGFuZ2VzIG9uIHRoZSBib2FyZFxuICAgIG1vdmU/OiAob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXksIHByb206IGJvb2xlYW4sIGNhcHR1cmVkUGllY2U/OiBzZy5QaWVjZSkgPT4gdm9pZDtcbiAgICBkcm9wPzogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb206IGJvb2xlYW4pID0+IHZvaWQ7XG4gICAgc2VsZWN0PzogKGtleTogc2cuS2V5KSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBhIHNxdWFyZSBpcyBzZWxlY3RlZFxuICAgIHVuc2VsZWN0PzogKGtleTogc2cuS2V5KSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBhIHNlbGVjdGVkIHNxdWFyZSBpcyBkaXJlY3RseSB1bnNlbGVjdGVkIC0gZHJvcHBlZCBiYWNrIG9yIGNsaWNrZWQgb24gdGhlIG9yaWdpbmFsIHNxdWFyZVxuICAgIHBpZWNlU2VsZWN0PzogKHBpZWNlOiBzZy5QaWVjZSkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gYSBwaWVjZSBpbiBoYW5kIGlzIHNlbGVjdGVkXG4gICAgcGllY2VVbnNlbGVjdD86IChwaWVjZTogc2cuUGllY2UpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIGEgc2VsZWN0ZWQgcGllY2UgaXMgZGlyZWN0bHkgdW5zZWxlY3RlZCAtIGRyb3BwZWQgYmFjayBvciBjbGlja2VkIG9uIHRoZSBzYW1lIHBpZWNlXG4gICAgaW5zZXJ0PzogKGJvYXJkRWxlbWVudHM/OiBzZy5Cb2FyZEVsZW1lbnRzLCBoYW5kRWxlbWVudHM/OiBzZy5IYW5kRWxlbWVudHMpID0+IHZvaWQ7IC8vIHdoZW4gdGhlIGJvYXJkIG9yIGhhbmRzIERPTSBoYXMgYmVlbiAocmUpaW5zZXJ0ZWRcbiAgfTtcbiAgZHJhd2FibGU6IERyYXdhYmxlO1xufVxuZXhwb3J0IGludGVyZmFjZSBTdGF0ZSBleHRlbmRzIEhlYWRsZXNzU3RhdGUge1xuICBkb206IHNnLkRvbTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRzKCk6IEhlYWRsZXNzU3RhdGUge1xuICByZXR1cm4ge1xuICAgIHBpZWNlczogbmV3IE1hcCgpLFxuICAgIGRpbWVuc2lvbnM6IHsgZmlsZXM6IDksIHJhbmtzOiA5IH0sXG4gICAgb3JpZW50YXRpb246ICdzZW50ZScsXG4gICAgdHVybkNvbG9yOiAnc2VudGUnLFxuICAgIGFjdGl2ZUNvbG9yOiAnYm90aCcsXG4gICAgdmlld09ubHk6IGZhbHNlLFxuICAgIHNxdWFyZVJhdGlvOiBbMTEsIDEyXSxcbiAgICBkaXNhYmxlQ29udGV4dE1lbnU6IHRydWUsXG4gICAgYmxvY2tUb3VjaFNjcm9sbDogZmFsc2UsXG4gICAgc2NhbGVEb3duUGllY2VzOiB0cnVlLFxuICAgIGNvb3JkaW5hdGVzOiB7IGVuYWJsZWQ6IHRydWUsIGZpbGVzOiAnbnVtZXJpYycsIHJhbmtzOiAnbnVtZXJpYycgfSxcbiAgICBoaWdobGlnaHQ6IHsgbGFzdERlc3RzOiB0cnVlLCBjaGVjazogdHJ1ZSwgY2hlY2tSb2xlczogWydraW5nJ10sIGhvdmVyZWQ6IGZhbHNlIH0sXG4gICAgYW5pbWF0aW9uOiB7IGVuYWJsZWQ6IHRydWUsIGhhbmRzOiB0cnVlLCBkdXJhdGlvbjogMjUwIH0sXG4gICAgaGFuZHM6IHtcbiAgICAgIGlubGluZWQ6IGZhbHNlLFxuICAgICAgaGFuZE1hcDogbmV3IE1hcDxzZy5Db2xvciwgc2cuSGFuZD4oW1xuICAgICAgICBbJ3NlbnRlJywgbmV3IE1hcCgpXSxcbiAgICAgICAgWydnb3RlJywgbmV3IE1hcCgpXSxcbiAgICAgIF0pLFxuICAgICAgcm9sZXM6IFsncm9vaycsICdiaXNob3AnLCAnZ29sZCcsICdzaWx2ZXInLCAna25pZ2h0JywgJ2xhbmNlJywgJ3Bhd24nXSxcbiAgICB9LFxuICAgIG1vdmFibGU6IHsgZnJlZTogdHJ1ZSwgc2hvd0Rlc3RzOiB0cnVlLCBldmVudHM6IHt9IH0sXG4gICAgZHJvcHBhYmxlOiB7IGZyZWU6IHRydWUsIHNob3dEZXN0czogdHJ1ZSwgc3BhcmU6IGZhbHNlLCBldmVudHM6IHt9IH0sXG4gICAgcHJlbW92YWJsZTogeyBlbmFibGVkOiB0cnVlLCBzaG93RGVzdHM6IHRydWUsIGV2ZW50czoge30gfSxcbiAgICBwcmVkcm9wcGFibGU6IHsgZW5hYmxlZDogdHJ1ZSwgc2hvd0Rlc3RzOiB0cnVlLCBldmVudHM6IHt9IH0sXG4gICAgZHJhZ2dhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgZGlzdGFuY2U6IDMsXG4gICAgICBhdXRvRGlzdGFuY2U6IHRydWUsXG4gICAgICBzaG93R2hvc3Q6IHRydWUsXG4gICAgICBzaG93VG91Y2hTcXVhcmVPdmVybGF5OiB0cnVlLFxuICAgICAgZGVsZXRlT25Ecm9wT2ZmOiBmYWxzZSxcbiAgICAgIGFkZFRvSGFuZE9uRHJvcE9mZjogZmFsc2UsXG4gICAgfSxcbiAgICBzZWxlY3RhYmxlOiB7IGVuYWJsZWQ6IHRydWUsIGZvcmNlU3BhcmVzOiBmYWxzZSwgZGVsZXRlT25Ub3VjaDogZmFsc2UsIGFkZFNwYXJlc1RvSGFuZDogZmFsc2UgfSxcbiAgICBrZXlib2FyZDogeyBlbmFibGVkOiBmYWxzZSwgZm9jdXNlZDogZmFsc2UgfSxcbiAgICBwcm9tb3Rpb246IHtcbiAgICAgIG1vdmVQcm9tb3Rpb25EaWFsb2c6ICgpID0+IGZhbHNlLFxuICAgICAgZm9yY2VNb3ZlUHJvbW90aW9uOiAoKSA9PiBmYWxzZSxcbiAgICAgIGRyb3BQcm9tb3Rpb25EaWFsb2c6ICgpID0+IGZhbHNlLFxuICAgICAgZm9yY2VEcm9wUHJvbW90aW9uOiAoKSA9PiBmYWxzZSxcbiAgICAgIHByb21vdGVzVG86ICgpID0+IHVuZGVmaW5lZCxcbiAgICAgIHVucHJvbW90ZXNUbzogKCkgPT4gdW5kZWZpbmVkLFxuICAgICAgZXZlbnRzOiB7fSxcbiAgICAgIHByZXZQcm9tb3Rpb25IYXNoOiAnJyxcbiAgICB9LFxuICAgIGZvcnN5dGg6IHt9LFxuICAgIGV2ZW50czoge30sXG4gICAgZHJhd2FibGU6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsIC8vIGNhbiBkcmF3XG4gICAgICB2aXNpYmxlOiB0cnVlLCAvLyBjYW4gdmlld1xuICAgICAgZm9yY2VkOiBmYWxzZSwgLy8gY2FuIG9ubHkgZHJhd1xuICAgICAgZXJhc2VPbkNsaWNrOiB0cnVlLFxuICAgICAgc2hhcGVzOiBbXSxcbiAgICAgIGF1dG9TaGFwZXM6IFtdLFxuICAgICAgc3F1YXJlczogW10sXG4gICAgICBwcmV2U3ZnSGFzaDogJycsXG4gICAgfSxcbiAgfTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IEFwaSB9IGZyb20gJy4vYXBpLmpzJztcbmltcG9ydCB7IHN0YXJ0IH0gZnJvbSAnLi9hcGkuanMnO1xuaW1wb3J0IHR5cGUgeyBDb25maWcgfSBmcm9tICcuL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBjb25maWd1cmUgfSBmcm9tICcuL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyByZWRyYXdBbGwgfSBmcm9tICcuL2RvbS5qcyc7XG5pbXBvcnQgeyBiaW5kRG9jdW1lbnQgfSBmcm9tICcuL2V2ZW50cy5qcyc7XG5pbXBvcnQgeyByZWRyYXdOb3csIHJlZHJhd1NoYXBlc05vdyB9IGZyb20gJy4vcmVkcmF3LmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB7IGRlZmF1bHRzIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSB7IERPTVJlY3RNYXAsIFBpZWNlTmFtZSwgUGllY2VOb2RlLCBXcmFwRWxlbWVudHMgfSBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIFNob2dpZ3JvdW5kKGNvbmZpZz86IENvbmZpZywgd3JhcEVsZW1lbnRzPzogV3JhcEVsZW1lbnRzKTogQXBpIHtcbiAgY29uc3Qgc3RhdGUgPSBkZWZhdWx0cygpIGFzIFN0YXRlO1xuICBjb25maWd1cmUoc3RhdGUsIGNvbmZpZyB8fCB7fSk7XG5cbiAgY29uc3QgcmVkcmF3U3RhdGVOb3cgPSAoc2tpcFNoYXBlcz86IGJvb2xlYW4pID0+IHtcbiAgICByZWRyYXdOb3coc3RhdGUsIHNraXBTaGFwZXMpO1xuICB9O1xuXG4gIHN0YXRlLmRvbSA9IHtcbiAgICB3cmFwRWxlbWVudHM6IHt9LFxuICAgIGVsZW1lbnRzOiB7fSxcbiAgICBib3VuZHM6IHtcbiAgICAgIGJvYXJkOiB7XG4gICAgICAgIGJvdW5kczogdXRpbC5tZW1vKCgpID0+IHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZD8ucGllY2VzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKSxcbiAgICAgIH0sXG4gICAgICBoYW5kczoge1xuICAgICAgICBib3VuZHM6IHV0aWwubWVtbygoKSA9PiB7XG4gICAgICAgICAgY29uc3QgaGFuZHNSZWN0czogRE9NUmVjdE1hcDwndG9wJyB8ICdib3R0b20nPiA9IG5ldyBNYXAoKTtcbiAgICAgICAgICBjb25zdCBoYW5kRWxzID0gc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzO1xuICAgICAgICAgIGlmIChoYW5kRWxzPy50b3ApIGhhbmRzUmVjdHMuc2V0KCd0b3AnLCBoYW5kRWxzLnRvcC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSk7XG4gICAgICAgICAgaWYgKGhhbmRFbHM/LmJvdHRvbSkgaGFuZHNSZWN0cy5zZXQoJ2JvdHRvbScsIGhhbmRFbHMuYm90dG9tLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKTtcbiAgICAgICAgICByZXR1cm4gaGFuZHNSZWN0cztcbiAgICAgICAgfSksXG4gICAgICAgIHBpZWNlQm91bmRzOiB1dGlsLm1lbW8oKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGhhbmRQaWVjZXNSZWN0czogRE9NUmVjdE1hcDxQaWVjZU5hbWU+ID0gbmV3IE1hcCgpO1xuICAgICAgICAgIGNvbnN0IGhhbmRFbHMgPSBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHM7XG5cbiAgICAgICAgICBpZiAoaGFuZEVscz8udG9wKSB7XG4gICAgICAgICAgICBsZXQgd3JhcEVsID0gaGFuZEVscy50b3AuZmlyc3RFbGVtZW50Q2hpbGQgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICB3aGlsZSAod3JhcEVsKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHBpZWNlRWwgPSB3cmFwRWwuZmlyc3RFbGVtZW50Q2hpbGQgYXMgUGllY2VOb2RlO1xuICAgICAgICAgICAgICBjb25zdCBwaWVjZSA9IHsgcm9sZTogcGllY2VFbC5zZ1JvbGUsIGNvbG9yOiBwaWVjZUVsLnNnQ29sb3IgfTtcbiAgICAgICAgICAgICAgaGFuZFBpZWNlc1JlY3RzLnNldCh1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKSwgcGllY2VFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSk7XG4gICAgICAgICAgICAgIHdyYXBFbCA9IHdyYXBFbC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChoYW5kRWxzPy5ib3R0b20pIHtcbiAgICAgICAgICAgIGxldCB3cmFwRWwgPSBoYW5kRWxzLmJvdHRvbS5maXJzdEVsZW1lbnRDaGlsZCBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHdoaWxlICh3cmFwRWwpIHtcbiAgICAgICAgICAgICAgY29uc3QgcGllY2VFbCA9IHdyYXBFbC5maXJzdEVsZW1lbnRDaGlsZCBhcyBQaWVjZU5vZGU7XG4gICAgICAgICAgICAgIGNvbnN0IHBpZWNlID0geyByb2xlOiBwaWVjZUVsLnNnUm9sZSwgY29sb3I6IHBpZWNlRWwuc2dDb2xvciB9O1xuICAgICAgICAgICAgICBoYW5kUGllY2VzUmVjdHMuc2V0KHV0aWwucGllY2VOYW1lT2YocGllY2UpLCBwaWVjZUVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKTtcbiAgICAgICAgICAgICAgd3JhcEVsID0gd3JhcEVsLm5leHRFbGVtZW50U2libGluZyBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGhhbmRQaWVjZXNSZWN0cztcbiAgICAgICAgfSksXG4gICAgICB9LFxuICAgIH0sXG4gICAgcmVkcmF3Tm93OiByZWRyYXdTdGF0ZU5vdyxcbiAgICByZWRyYXc6IGRlYm91bmNlUmVkcmF3KHJlZHJhd1N0YXRlTm93KSxcbiAgICByZWRyYXdTaGFwZXM6IGRlYm91bmNlUmVkcmF3KCgpID0+IHJlZHJhd1NoYXBlc05vdyhzdGF0ZSkpLFxuICAgIHVuYmluZDogYmluZERvY3VtZW50KHN0YXRlKSxcbiAgICBlbGVtZW50VW5iaW5kczogbmV3IE1hcCgpLFxuICAgIGRlc3Ryb3llZDogZmFsc2UsXG4gIH07XG5cbiAgaWYgKHdyYXBFbGVtZW50cykgcmVkcmF3QWxsKHdyYXBFbGVtZW50cywgc3RhdGUpO1xuXG4gIHJldHVybiBzdGFydChzdGF0ZSk7XG59XG5cbmZ1bmN0aW9uIGRlYm91bmNlUmVkcmF3KGY6ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCk6ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCB7XG4gIGxldCByZWRyYXdpbmcgPSBmYWxzZTtcbiAgcmV0dXJuICguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgIGlmIChyZWRyYXdpbmcpIHJldHVybjtcbiAgICByZWRyYXdpbmcgPSB0cnVlO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBmKC4uLmFyZ3MpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgcmVkcmF3aW5nID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNFTyxNQUFNLFNBQVMsQ0FBQyxTQUFTLE1BQU07QUFFL0IsTUFBTSxRQUFRO0FBQUEsSUFDbkI7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQ08sTUFBTSxRQUFRO0FBQUEsSUFDbkI7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBRU8sTUFBTSxVQUEwQixNQUFNLFVBQVU7QUFBQSxJQUNyRCxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sTUFBTSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztBQUFBLEVBQzdDOzs7QUN4Q08sTUFBTSxVQUFVLENBQUMsUUFBd0IsUUFBUSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDO0FBRXJFLE1BQU0sVUFBVSxDQUFDLE1BQXNCO0FBQzVDLFFBQUksRUFBRSxTQUFTLEVBQUcsUUFBTyxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksSUFBSSxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUU7QUFBQSxRQUMv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QUF1RDtBQUM3RSxRQUFJLFlBQVk7QUFDaEIsV0FBTyxJQUFJLFNBQWdCO0FBQ3pCLFVBQUksVUFBVztBQUNmLGtCQUFZO0FBQ1osNEJBQXNCLE1BQU07QUFDMUIsWUFBSTtBQUNGLFlBQUUsR0FBRyxJQUFJO0FBQUEsUUFDWCxVQUFFO0FBQ0Esc0JBQVk7QUFBQSxRQUNkO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0Y7OztBckJyRkEsTUFBTyxnQkFBUTsiLAogICJuYW1lcyI6IFsibm93IiwgIm1vdmUiLCAicmFua3MiLCAiYnJ1c2hlcyIsICJlbCIsICJtYXJrZXJJZCIsICJkZXN0IiwgInN0YXJ0IiwgImNlbnRlciIsICJjYW5jZWwiLCAibW92ZSIsICJlbmQiLCAidW5zZWxlY3QiLCAicyIsICJjYW5jZWwiLCAiX2EiLCAibW92ZSIsICJlbmQiLCAiY2FuY2VsIiwgInN0YXJ0IiwgInJlbmRlciIsICJhbmltIiwgImsiLCAicmFua3MiLCAiZmlsZXMiLCAicmVuZGVySGFuZCIsICJyZW5kZXIiLCAic3RhcnQiLCAic3RhdGUiLCAiY2FuY2VsIiwgInJlbmRlciIsICJzdGFydCJdCn0K
