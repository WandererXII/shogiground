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
    el.style.transform = `translate(${pos[0]}px,${pos[1]}px) scale(${scale}`;
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
  function anim(mutation, state) {
    return state.animation.enabled ? animate(mutation, state) : render(mutation, state);
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
    state.animation.current = state.draggable.current = state.promotion.current = state.hovered = state.selected = state.selectedPiece = void 0;
  }
  function reset(state) {
    cancelPromotion(state);
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
    if (state.pieces.delete(key)) callUserFunction(state.events.change);
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
    setPreDests(state);
  }
  function setSelectedPiece(state, piece) {
    unselect(state);
    state.selectedPiece = piece;
    setPreDests(state);
  }
  function setPreDests(state) {
    state.premovable.dests = state.predroppable.dests = void 0;
    if (state.selected && isPremovable(state, state.selected) && state.premovable.generate)
      state.premovable.dests = state.premovable.generate(state.selected, state.pieces);
    else if (state.selectedPiece && isPredroppable(state, state.selectedPiece) && state.predroppable.generate)
      state.predroppable.dests = state.predroppable.generate(state.selectedPiece, state.pieces);
  }
  function unselect(state) {
    state.selected = state.selectedPiece = state.premovable.dests = state.predroppable.dests = state.promotion.current = void 0;
    state.droppable.spare = false;
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
  function canPremove(state, orig, dest) {
    return orig !== dest && isPremovable(state, orig) && !!state.premovable.generate && state.premovable.generate(orig, state.pieces).includes(dest);
  }
  function canPredrop(state, piece, dest) {
    const destPiece = state.pieces.get(dest);
    return isPredroppable(state, piece) && (!destPiece || destPiece.color !== state.activeColor) && !!state.predroppable.generate && state.predroppable.generate(piece, state.pieces).includes(dest);
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
  function cancelPromotion(state) {
    if (!state.promotion.current) return;
    unselect(state);
    state.promotion.current = void 0;
    state.hovered = void 0;
    callUserFunction(state.promotion.events.cancel);
  }
  function stop(state) {
    state.activeColor = state.movable.dests = state.droppable.dests = state.draggable.current = state.animation.current = state.promotion.current = state.hovered = void 0;
    cancelMoveOrDrop(state);
  }

  // src/sfen.ts
  function inferDimensions(boardSfen) {
    const ranks2 = boardSfen.split("/");
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
      if ((state.animation.duration || 0) < 70) state.animation.enabled = false;
      if (!state.animation.enabled) state.animation.current = void 0;
    }
  }
  function configure(state, config) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    if ((_a = config.movable) == null ? void 0 : _a.dests) state.movable.dests = void 0;
    if ((_b = config.droppable) == null ? void 0 : _b.dests) state.droppable.dests = void 0;
    if ((_c = config.drawable) == null ? void 0 : _c.shapes) state.drawable.shapes = [];
    if ((_d = config.drawable) == null ? void 0 : _d.autoShapes) state.drawable.autoShapes = [];
    if ((_e = config.drawable) == null ? void 0 : _e.squares) state.drawable.squares = [];
    if ((_f = config.hands) == null ? void 0 : _f.roles) state.hands.roles = [];
    deepMerge(state, config);
    if ((_g = config.sfen) == null ? void 0 : _g.board) {
      state.dimensions = inferDimensions(config.sfen.board);
      state.pieces = sfenToBoard(config.sfen.board, state.dimensions, state.forsyth.fromForsyth);
      if (state.promotion.current) {
        const piece = state.selected ? state.pieces.get(state.selected) : state.selectedPiece;
        if (!piece || !samePiece(piece, state.promotion.current.piece)) unselect(state);
      }
      state.drawable.shapes = ((_h = config.drawable) == null ? void 0 : _h.shapes) || [];
    }
    if ((_i = config.sfen) == null ? void 0 : _i.hands) {
      state.hands.handMap = sfenToHands(config.sfen.hands, state.forsyth.fromForsyth);
    }
    if ("checks" in config) setChecks(state, config.checks || false);
    if ("lastPiece" in config && !config.lastPiece) state.lastPiece = void 0;
    if ("lastDests" in config && !config.lastDests) state.lastDests = void 0;
    else if (config.lastDests) state.lastDests = config.lastDests;
    setPreDests(state);
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
        hash: shapeHash(s, arrowDests, false, hashBounds)
      };
    });
    const shapes = d.shapes.concat(d.autoShapes).map((s) => {
      return {
        shape: s,
        hash: shapeHash(s, arrowDests, false, hashBounds)
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
    const defsEl = svg.querySelector("defs");
    const shapesEl = svg.querySelector("g");
    const customSvgsEl = customSvg.querySelector("g");
    syncDefs(shapes, outsideArrow ? curD : void 0, defsEl);
    syncShapes(
      shapes.filter((s) => !s.shape.customSvg && (!s.shape.piece || s.current)),
      shapesEl,
      (shape) => renderSVGShape(state, shape, arrowDests),
      outsideArrow
    );
    syncShapes(
      shapes.filter((s) => s.shape.customSvg),
      customSvgsEl,
      (shape) => renderSVGShape(state, shape, arrowDests)
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
        const el = renderArrow(curD.brush, orig, orig, state.squareRatio, true, false);
        g.appendChild(el);
        curD.arrow = el;
        shapesEl.appendChild(g);
      }
    }
  }
  function syncDefs(shapes, outsideShape, defsEl) {
    const brushes2 = /* @__PURE__ */ new Set();
    for (const s of shapes) {
      if (!samePieceOrKey(s.shape.dest, s.shape.orig)) brushes2.add(s.shape.brush);
    }
    if (outsideShape) brushes2.add(outsideShape.brush);
    const keysInDom = /* @__PURE__ */ new Set();
    let el = defsEl.firstElementChild;
    while (el) {
      keysInDom.add(el.getAttribute("sgKey"));
      el = el.nextElementSibling;
    }
    for (const key of brushes2) {
      const brush = key || defaultBrush;
      if (!keysInDom.has(brush)) defsEl.appendChild(renderMarker(brush));
    }
  }
  function syncShapes(shapes, root, renderShape, outsideArrow) {
    const hashesInDom = /* @__PURE__ */ new Map();
    const toRemove = [];
    for (const sc of shapes) hashesInDom.set(sc.hash, false);
    if (outsideArrow) hashesInDom.set(outsideArrowHash, true);
    let el = root.firstElementChild;
    let elHash;
    while (el) {
      elHash = el.getAttribute("sgHash");
      if (hashesInDom.has(elHash)) hashesInDom.set(elHash, true);
      else toRemove.push(el);
      el = el.nextElementSibling;
    }
    for (const el2 of toRemove) root.removeChild(el2);
    for (const sc of shapes) {
      if (!hashesInDom.get(sc.hash)) {
        const shapeEl = renderShape(sc);
        if (shapeEl) root.appendChild(shapeEl);
      }
    }
  }
  function shapeHash({ orig, dest, brush, piece, customSvg, description }, arrowDests, current, boundHash) {
    return [
      current,
      isPiece(orig) && boundHash(orig),
      isPiece(dest) && boundHash(dest),
      isPiece(orig) ? pieceHash(orig) : orig,
      isPiece(dest) ? pieceHash(dest) : dest,
      brush,
      (arrowDests.get(isPiece(dest) ? pieceNameOf(dest) : dest) || 0) > 1,
      piece && pieceHash(piece),
      customSvg && customSvgHash(customSvg),
      description
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
  function renderSVGShape(state, { shape, current, hash }, arrowDests) {
    const orig = pieceOrKeyToPos(shape.orig, state);
    if (!orig) return;
    if (shape.customSvg) {
      return renderCustomSvg(shape.brush, shape.customSvg, orig, state.squareRatio);
    } else {
      let el;
      const dest = !samePieceOrKey(shape.orig, shape.dest) && pieceOrKeyToPos(shape.dest, state);
      if (dest) {
        el = renderArrow(
          shape.brush,
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
  function renderCustomSvg(brush, customSvg, pos, ratio) {
    const [x, y] = pos;
    const g = setAttributes(createSVGElement("g"), { transform: `translate(${x},${y})` });
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
  function renderArrow(brush, orig, dest, ratio, current, shorten) {
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
      "marker-end": `url(#arrowhead-${brush || defaultBrush})`,
      x1: a[0],
      y1: a[1],
      x2: b[0] - xo,
      y2: b[1] - yo
    });
  }
  function renderPiece(state, { shape }) {
    if (!shape.piece || isPiece(shape.orig)) return;
    const orig = shape.orig;
    const scale = (shape.piece.scale || 1) * (state.scaleDownPieces ? 0.5 : 1);
    const pieceEl = createEl("piece", pieceNameOf(shape.piece));
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
  function renderMarker(brush) {
    const marker = setAttributes(createSVGElement("marker"), {
      id: `arrowhead-${brush}`,
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
    marker.setAttribute("sgKey", brush);
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
    if (!similar || diffPiece || similar.brush !== cur.brush) drawable.shapes.push(cur);
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
      if (!promotionDialogMove(s, s.selected, orig)) {
        if (canMove(s, s.selected, orig)) anim((state) => selectSquare(state, orig), s);
        else selectSquare(s, orig);
      }
    } else if (s.selectedPiece) {
      if (!promotionDialogDrop(s, s.selectedPiece, orig)) {
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
      if (cur.fromBoard) s.pieces.delete(cur.fromBoard.orig);
      else if (cur.fromOutside && !cur.spare) removeFromHand(s, cur.piece);
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
      const prom = !samePiece(cur.piece, piece);
      if (cur.dragged || s.turnColor !== s.activeColor && s.activeColor !== "both") {
        if (s.selected) userMove(s, s.selected, cur.key, prom);
        else if (s.selectedPiece) userDrop(s, s.selectedPiece, cur.key, prom);
      } else anim((s2) => selectSquare(s2, cur.key, prom), s);
      callUserFunction(s.promotion.events.after, piece);
    } else anim((s2) => cancelPromotion(s2), s);
    s.promotion.current = void 0;
    s.dom.redraw();
  }

  // src/keyboard.ts
  var directions = {
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    ArrowUp: [0, -1],
    ArrowDown: [0, 1]
  };
  var keyboardAttributes = /* @__PURE__ */ new Map([
    ["tabindex", "0"],
    ["role", "group"],
    ["aria-label", "Shogi board. Use arrow keys to navigate, Enter to select, Escape to cancel."]
  ]);
  var previousAttributes = /* @__PURE__ */ new WeakMap();
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
        cancelPromotion(s);
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
    var _a;
    const enabled = s.keyboard.enabled && !s.viewOnly;
    const el = elements.board;
    const previous = previousAttributes.get(el);
    if (enabled) {
      if (!previous) {
        previousAttributes.set(
          el,
          new Map(Array.from(keyboardAttributes.keys(), (name) => [name, el.getAttribute(name)]))
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
    const choices = (_a = elements.promotion) == null ? void 0 : _a.querySelectorAll("piece");
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
    else if (!(s.selected && promotionDialogMove(s, s.selected, cursor)) && !(s.selectedPiece && promotionDialogDrop(s, s.selectedPiece, cursor)))
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
  function onResize(s) {
    return () => {
      clearBounds(s);
      if (usesBounds(s.drawable.shapes.concat(s.drawable.autoShapes))) s.dom.redrawShapes();
    };
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
            cancelPromotion(s);
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
    if (!("ResizeObserver" in window)) {
      unbinds.push(unbindable(document.body, "shogiground.resize", onResize(s)));
    }
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
        const pDests = s.premovable.dests;
        if (pDests)
          for (const k of pDests) {
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
        const pDests = s.predroppable.dests;
        if (pDests)
          for (const k of pDests) {
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
    boardWrap.classList.forEach((c) => {
      if (c.substring(0, 2) === "d-" && c !== dimCls) boardWrap.classList.remove(c);
    });
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
    handWrap.classList.forEach((c) => {
      if (c.substring(0, 2) === "r-" && c !== roleCntCls) handWrap.classList.remove(c);
    });
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
        render((state2) => removeFromHand(state2, piece, count), state);
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
          state2.drawable.autoShapes = shapes;
        }, state);
      },
      setShapes(shapes) {
        render((state2) => {
          state2.drawable.shapes = shapes;
        }, state);
      },
      setSquareHighlights(squares) {
        render((state2) => {
          state2.drawable.squares = squares;
        }, state);
      },
      dragNewPiece(piece, event, spare) {
        dragNewPiece(state, piece, event, spare);
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
        f(...args);
        redrawing = false;
      });
    };
  }

  // src/index.ts
  var index_default = Shogiground;
  return __toCommonJS(index_exports);
})();
Shogiground = Shogiground.default;
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2luZGV4LnRzIiwgIi4uL3NyYy9jb25zdGFudHMudHMiLCAiLi4vc3JjL3V0aWwudHMiLCAiLi4vc3JjL2FuaW0udHMiLCAiLi4vc3JjL2hhbmRzLnRzIiwgIi4uL3NyYy9ib2FyZC50cyIsICIuLi9zcmMvc2Zlbi50cyIsICIuLi9zcmMvY29uZmlnLnRzIiwgIi4uL3NyYy9zaGFwZXMudHMiLCAiLi4vc3JjL2RyYXcudHMiLCAiLi4vc3JjL2RyYWcudHMiLCAiLi4vc3JjL3Byb21vdGlvbi50cyIsICIuLi9zcmMva2V5Ym9hcmQudHMiLCAiLi4vc3JjL2V2ZW50cy50cyIsICIuLi9zcmMvcmVuZGVyLnRzIiwgIi4uL3NyYy9jb29yZHMudHMiLCAiLi4vc3JjL3dyYXAudHMiLCAiLi4vc3JjL2RvbS50cyIsICIuLi9zcmMvYXBpLnRzIiwgIi4uL3NyYy9yZWRyYXcudHMiLCAiLi4vc3JjL3N0YXRlLnRzIiwgIi4uL3NyYy9zaG9naWdyb3VuZC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgU2hvZ2lncm91bmQgfSBmcm9tICcuL3Nob2dpZ3JvdW5kLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgU2hvZ2lncm91bmQ7XG4iLCAiaW1wb3J0IHR5cGUgeyBLZXkgfSBmcm9tICcuL3R5cGVzLmpzJztcblxuZXhwb3J0IGNvbnN0IGNvbG9ycyA9IFsnc2VudGUnLCAnZ290ZSddIGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgZmlsZXMgPSBbXG4gICcxJyxcbiAgJzInLFxuICAnMycsXG4gICc0JyxcbiAgJzUnLFxuICAnNicsXG4gICc3JyxcbiAgJzgnLFxuICAnOScsXG4gICcxMCcsXG4gICcxMScsXG4gICcxMicsXG4gICcxMycsXG4gICcxNCcsXG4gICcxNScsXG4gICcxNicsXG5dIGFzIGNvbnN0O1xuZXhwb3J0IGNvbnN0IHJhbmtzID0gW1xuICAnYScsXG4gICdiJyxcbiAgJ2MnLFxuICAnZCcsXG4gICdlJyxcbiAgJ2YnLFxuICAnZycsXG4gICdoJyxcbiAgJ2knLFxuICAnaicsXG4gICdrJyxcbiAgJ2wnLFxuICAnbScsXG4gICduJyxcbiAgJ28nLFxuICAncCcsXG5dIGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgYWxsS2V5czogcmVhZG9ubHkgS2V5W10gPSBBcnJheS5wcm90b3R5cGUuY29uY2F0KFxuICAuLi5yYW5rcy5tYXAoKHIpID0+IGZpbGVzLm1hcCgoZikgPT4gZiArIHIpKSxcbik7XG5cbmV4cG9ydCBjb25zdCBub3RhdGlvbnMgPSBbJ251bWVyaWMnLCAnamFwYW5lc2UnLCAnZW5naW5lJywgJ2hleCcsICdkaXpoaSddIGFzIGNvbnN0O1xuIiwgImltcG9ydCB7IGFsbEtleXMsIGNvbG9ycyB9IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5cbmV4cG9ydCBjb25zdCBwb3Mya2V5ID0gKHBvczogc2cuUG9zKTogc2cuS2V5ID0+IGFsbEtleXNbcG9zWzBdICsgMTYgKiBwb3NbMV1dO1xuXG5leHBvcnQgY29uc3Qga2V5MnBvcyA9IChrOiBzZy5LZXkpOiBzZy5Qb3MgPT4ge1xuICBpZiAoay5sZW5ndGggPiAyKSByZXR1cm4gW2suY2hhckNvZGVBdCgxKSAtIDM5LCBrLmNoYXJDb2RlQXQoMikgLSA5N107XG4gIGVsc2UgcmV0dXJuIFtrLmNoYXJDb2RlQXQoMCkgLSA0OSwgay5jaGFyQ29kZUF0KDEpIC0gOTddO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIG1lbW88QT4oZjogKCkgPT4gQSk6IHNnLk1lbW88QT4ge1xuICBsZXQgdjogQSB8IHVuZGVmaW5lZDtcbiAgY29uc3QgcmV0ID0gKCk6IEEgPT4ge1xuICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHYgPSBmKCk7XG4gICAgcmV0dXJuIHY7XG4gIH07XG4gIHJldC5jbGVhciA9ICgpID0+IHtcbiAgICB2ID0gdW5kZWZpbmVkO1xuICB9O1xuICByZXR1cm4gcmV0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FsbFVzZXJGdW5jdGlvbjxUIGV4dGVuZHMgKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPihcbiAgZjogVCB8IHVuZGVmaW5lZCxcbiAgLi4uYXJnczogUGFyYW1ldGVyczxUPlxuKTogdm9pZCB7XG4gIGlmIChmKSBzZXRUaW1lb3V0KCgpID0+IGYoLi4uYXJncyksIDEpO1xufVxuXG5leHBvcnQgY29uc3Qgb3Bwb3NpdGUgPSAoYzogc2cuQ29sb3IpOiBzZy5Db2xvciA9PiAoYyA9PT0gJ3NlbnRlJyA/ICdnb3RlJyA6ICdzZW50ZScpO1xuXG5leHBvcnQgY29uc3Qgc2VudGVQb3YgPSAobzogc2cuQ29sb3IpOiBib29sZWFuID0+IG8gPT09ICdzZW50ZSc7XG5cbmV4cG9ydCBjb25zdCBkaXN0YW5jZVNxID0gKHBvczE6IHNnLlBvcywgcG9zMjogc2cuUG9zKTogbnVtYmVyID0+IHtcbiAgY29uc3QgZHggPSBwb3MxWzBdIC0gcG9zMlswXTtcbiAgY29uc3QgZHkgPSBwb3MxWzFdIC0gcG9zMlsxXTtcbiAgcmV0dXJuIGR4ICogZHggKyBkeSAqIGR5O1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGlzS2V5KHZhbHVlOiBzZy5LZXkgfCBzZy5QaWVjZSB8IHVuZGVmaW5lZCk6IHZhbHVlIGlzIHNnLktleSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnO1xufVxuXG5leHBvcnQgY29uc3Qgc2FtZVBpZWNlID0gKHAxOiBzZy5QaWVjZSwgcDI6IHNnLlBpZWNlKTogYm9vbGVhbiA9PlxuICBwMS5yb2xlID09PSBwMi5yb2xlICYmIHAxLmNvbG9yID09PSBwMi5jb2xvcjtcblxuY29uc3QgcG9zVG9UcmFuc2xhdGVCYXNlID0gKFxuICBwb3M6IHNnLlBvcyxcbiAgZGltczogc2cuRGltZW5zaW9ucyxcbiAgYXNTZW50ZTogYm9vbGVhbixcbiAgeEZhY3RvcjogbnVtYmVyLFxuICB5RmFjdG9yOiBudW1iZXIsXG4pOiBzZy5OdW1iZXJQYWlyID0+IFtcbiAgKGFzU2VudGUgPyBkaW1zLmZpbGVzIC0gMSAtIHBvc1swXSA6IHBvc1swXSkgKiB4RmFjdG9yLFxuICAoYXNTZW50ZSA/IHBvc1sxXSA6IGRpbXMucmFua3MgLSAxIC0gcG9zWzFdKSAqIHlGYWN0b3IsXG5dO1xuXG5leHBvcnQgY29uc3QgcG9zVG9UcmFuc2xhdGVBYnMgPSAoXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGJvdW5kczogRE9NUmVjdCxcbik6ICgocG9zOiBzZy5Qb3MsIGFzU2VudGU6IGJvb2xlYW4pID0+IHNnLk51bWJlclBhaXIpID0+IHtcbiAgY29uc3QgeEZhY3RvciA9IGJvdW5kcy53aWR0aCAvIGRpbXMuZmlsZXM7XG4gIGNvbnN0IHlGYWN0b3IgPSBib3VuZHMuaGVpZ2h0IC8gZGltcy5yYW5rcztcbiAgcmV0dXJuIChwb3MsIGFzU2VudGUpID0+IHBvc1RvVHJhbnNsYXRlQmFzZShwb3MsIGRpbXMsIGFzU2VudGUsIHhGYWN0b3IsIHlGYWN0b3IpO1xufTtcblxuZXhwb3J0IGNvbnN0IHBvc1RvVHJhbnNsYXRlUmVsID1cbiAgKGRpbXM6IHNnLkRpbWVuc2lvbnMpOiAoKHBvczogc2cuUG9zLCBhc1NlbnRlOiBib29sZWFuKSA9PiBzZy5OdW1iZXJQYWlyKSA9PlxuICAocG9zLCBhc1NlbnRlKSA9PlxuICAgIHBvc1RvVHJhbnNsYXRlQmFzZShwb3MsIGRpbXMsIGFzU2VudGUsIDEwMCwgMTAwKTtcblxuZXhwb3J0IGNvbnN0IHRyYW5zbGF0ZUFicyA9IChlbDogSFRNTEVsZW1lbnQsIHBvczogc2cuTnVtYmVyUGFpciwgc2NhbGU6IG51bWJlcik6IHZvaWQgPT4ge1xuICBlbC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKCR7cG9zWzBdfXB4LCR7cG9zWzFdfXB4KSBzY2FsZSgke3NjYWxlfWA7XG59O1xuXG5leHBvcnQgY29uc3QgdHJhbnNsYXRlUmVsID0gKFxuICBlbDogSFRNTEVsZW1lbnQsXG4gIHBlcmNlbnRzOiBzZy5OdW1iZXJQYWlyLFxuICBzY2FsZUZhY3RvcjogbnVtYmVyLFxuICBzY2FsZT86IG51bWJlcixcbik6IHZvaWQgPT4ge1xuICBlbC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKCR7cGVyY2VudHNbMF0gKiBzY2FsZUZhY3Rvcn0lLCR7cGVyY2VudHNbMV0gKiBzY2FsZUZhY3Rvcn0lKSBzY2FsZSgke1xuICAgIHNjYWxlIHx8IHNjYWxlRmFjdG9yXG4gIH0pYDtcbn07XG5cbmV4cG9ydCBjb25zdCBzZXREaXNwbGF5ID0gKGVsOiBIVE1MRWxlbWVudCwgdjogYm9vbGVhbik6IHZvaWQgPT4ge1xuICBlbC5zdHlsZS5kaXNwbGF5ID0gdiA/ICcnIDogJ25vbmUnO1xufTtcblxuY29uc3QgaXNNb3VzZUV2ZW50ID0gKGU6IHNnLk1vdWNoRXZlbnQpOiBlIGlzIEV2ZW50ICYgTW91c2VFdmVudCA9PiB7XG4gIHJldHVybiAhIWUuY2xpZW50WCB8fCBlLmNsaWVudFggPT09IDA7XG59O1xuXG5leHBvcnQgY29uc3QgZXZlbnRQb3NpdGlvbiA9IChlOiBzZy5Nb3VjaEV2ZW50KTogc2cuTnVtYmVyUGFpciB8IHVuZGVmaW5lZCA9PiB7XG4gIGlmIChpc01vdXNlRXZlbnQoZSkpIHJldHVybiBbZS5jbGllbnRYLCBlLmNsaWVudFldO1xuICBpZiAoZS50YXJnZXRUb3VjaGVzPy5bMF0pIHJldHVybiBbZS50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFgsIGUudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRZXTtcbiAgcmV0dXJuOyAvLyB0b3VjaGVuZCBoYXMgbm8gcG9zaXRpb24hXG59O1xuXG5leHBvcnQgY29uc3QgaXNSaWdodEJ1dHRvbiA9IChlOiBzZy5Nb3VjaEV2ZW50KTogYm9vbGVhbiA9PiBlLmJ1dHRvbnMgPT09IDIgfHwgZS5idXR0b24gPT09IDI7XG5cbmV4cG9ydCBjb25zdCBpc01pZGRsZUJ1dHRvbiA9IChlOiBzZy5Nb3VjaEV2ZW50KTogYm9vbGVhbiA9PiBlLmJ1dHRvbnMgPT09IDQgfHwgZS5idXR0b24gPT09IDE7XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVFbCA9ICh0YWdOYW1lOiBzdHJpbmcsIGNsYXNzTmFtZT86IHN0cmluZyk6IEhUTUxFbGVtZW50ID0+IHtcbiAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xuICBpZiAoY2xhc3NOYW1lKSBlbC5jbGFzc05hbWUgPSBjbGFzc05hbWU7XG4gIHJldHVybiBlbDtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBwaWVjZU5hbWVPZihwaWVjZTogc2cuUGllY2UpOiBzZy5QaWVjZU5hbWUge1xuICByZXR1cm4gYCR7cGllY2UuY29sb3J9ICR7cGllY2Uucm9sZX1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VQaWVjZU5hbWUocGllY2VOYW1lOiBzZy5QaWVjZU5hbWUpOiBzZy5QaWVjZSB7XG4gIGNvbnN0IHNwbGl0dGVkID0gcGllY2VOYW1lLnNwbGl0KCcgJywgMik7XG4gIHJldHVybiB7IGNvbG9yOiBzcGxpdHRlZFswXSBhcyBzZy5Db2xvciwgcm9sZTogc3BsaXR0ZWRbMV0gfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUGllY2VOb2RlKGVsOiBIVE1MRWxlbWVudCk6IGVsIGlzIHNnLlBpZWNlTm9kZSB7XG4gIHJldHVybiBlbC50YWdOYW1lID09PSAnUElFQ0UnO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzU3F1YXJlTm9kZShlbDogSFRNTEVsZW1lbnQpOiBlbCBpcyBzZy5TcXVhcmVOb2RlIHtcbiAgcmV0dXJuIGVsLnRhZ05hbWUgPT09ICdTUSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlU3F1YXJlQ2VudGVyKFxuICBrZXk6IHNnLktleSxcbiAgYXNTZW50ZTogYm9vbGVhbixcbiAgZGltczogc2cuRGltZW5zaW9ucyxcbiAgYm91bmRzOiBET01SZWN0LFxuKTogc2cuTnVtYmVyUGFpciB7XG4gIGNvbnN0IHBvcyA9IGtleTJwb3Moa2V5KTtcbiAgaWYgKGFzU2VudGUpIHtcbiAgICBwb3NbMF0gPSBkaW1zLmZpbGVzIC0gMSAtIHBvc1swXTtcbiAgICBwb3NbMV0gPSBkaW1zLnJhbmtzIC0gMSAtIHBvc1sxXTtcbiAgfVxuICByZXR1cm4gW1xuICAgIGJvdW5kcy5sZWZ0ICsgKGJvdW5kcy53aWR0aCAqIHBvc1swXSkgLyBkaW1zLmZpbGVzICsgYm91bmRzLndpZHRoIC8gKGRpbXMuZmlsZXMgKiAyKSxcbiAgICBib3VuZHMudG9wICtcbiAgICAgIChib3VuZHMuaGVpZ2h0ICogKGRpbXMucmFua3MgLSAxIC0gcG9zWzFdKSkgLyBkaW1zLnJhbmtzICtcbiAgICAgIGJvdW5kcy5oZWlnaHQgLyAoZGltcy5yYW5rcyAqIDIpLFxuICBdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZG9tU3F1YXJlSW5kZXhPZktleShrZXk6IHNnLktleSwgYXNTZW50ZTogYm9vbGVhbiwgZGltczogc2cuRGltZW5zaW9ucyk6IG51bWJlciB7XG4gIGNvbnN0IHBvcyA9IGtleTJwb3Moa2V5KTtcbiAgbGV0IGluZGV4ID0gZGltcy5maWxlcyAtIDEgLSBwb3NbMF0gKyBwb3NbMV0gKiBkaW1zLmZpbGVzO1xuICBpZiAoIWFzU2VudGUpIGluZGV4ID0gZGltcy5maWxlcyAqIGRpbXMucmFua3MgLSAxIC0gaW5kZXg7XG5cbiAgcmV0dXJuIGluZGV4O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNJbnNpZGVSZWN0KHJlY3Q6IERPTVJlY3QsIHBvczogc2cuTnVtYmVyUGFpcik6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIHJlY3QubGVmdCA8PSBwb3NbMF0gJiZcbiAgICByZWN0LnRvcCA8PSBwb3NbMV0gJiZcbiAgICByZWN0LmxlZnQgKyByZWN0LndpZHRoID4gcG9zWzBdICYmXG4gICAgcmVjdC50b3AgKyByZWN0LmhlaWdodCA+IHBvc1sxXVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOZWFyUmVjdChyZWN0OiBET01SZWN0LCBwb3M6IHNnLk51bWJlclBhaXIsIHI6IG51bWJlcik6IGJvb2xlYW4ge1xuICBjb25zdCBbeCwgeV0gPSBwb3M7XG5cbiAgY29uc3QgY2xvc2VzdFggPSBNYXRoLm1heChyZWN0LmxlZnQsIE1hdGgubWluKHgsIHJlY3QucmlnaHQpKTtcbiAgY29uc3QgY2xvc2VzdFkgPSBNYXRoLm1heChyZWN0LnRvcCwgTWF0aC5taW4oeSwgcmVjdC5ib3R0b20pKTtcblxuICBjb25zdCBkeCA9IHggLSBjbG9zZXN0WDtcbiAgY29uc3QgZHkgPSB5IC0gY2xvc2VzdFk7XG5cbiAgcmV0dXJuIGR4ICogZHggKyBkeSAqIGR5IDw9IHIgKiByO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0S2V5QXREb21Qb3MoXG4gIHBvczogc2cuTnVtYmVyUGFpcixcbiAgYXNTZW50ZTogYm9vbGVhbixcbiAgZGltczogc2cuRGltZW5zaW9ucyxcbiAgYm91bmRzOiBET01SZWN0LFxuKTogc2cuS2V5IHwgdW5kZWZpbmVkIHtcbiAgbGV0IGZpbGUgPSBNYXRoLmZsb29yKChkaW1zLmZpbGVzICogKHBvc1swXSAtIGJvdW5kcy5sZWZ0KSkgLyBib3VuZHMud2lkdGgpO1xuICBpZiAoYXNTZW50ZSkgZmlsZSA9IGRpbXMuZmlsZXMgLSAxIC0gZmlsZTtcbiAgbGV0IHJhbmsgPSBNYXRoLmZsb29yKChkaW1zLnJhbmtzICogKHBvc1sxXSAtIGJvdW5kcy50b3ApKSAvIGJvdW5kcy5oZWlnaHQpO1xuICBpZiAoIWFzU2VudGUpIHJhbmsgPSBkaW1zLnJhbmtzIC0gMSAtIHJhbms7XG4gIHJldHVybiBmaWxlID49IDAgJiYgZmlsZSA8IGRpbXMuZmlsZXMgJiYgcmFuayA+PSAwICYmIHJhbmsgPCBkaW1zLnJhbmtzXG4gICAgPyBwb3Mya2V5KFtmaWxlLCByYW5rXSlcbiAgICA6IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEhhbmRQaWVjZUF0RG9tUG9zKFxuICBwb3M6IHNnLk51bWJlclBhaXIsXG4gIHJvbGVzOiBzZy5Sb2xlU3RyaW5nW10sXG4gIGJvdW5kczogTWFwPHNnLlBpZWNlTmFtZSwgRE9NUmVjdD4sXG4pOiBzZy5QaWVjZSB8IHVuZGVmaW5lZCB7XG4gIGZvciAoY29uc3QgY29sb3Igb2YgY29sb3JzKSB7XG4gICAgZm9yIChjb25zdCByb2xlIG9mIHJvbGVzKSB7XG4gICAgICBjb25zdCBwaWVjZSA9IHsgY29sb3IsIHJvbGUgfTtcbiAgICAgIGNvbnN0IHBpZWNlUmVjdCA9IGJvdW5kcy5nZXQocGllY2VOYW1lT2YocGllY2UpKTtcbiAgICAgIGlmIChwaWVjZVJlY3QgJiYgaXNJbnNpZGVSZWN0KHBpZWNlUmVjdCwgcG9zKSkgcmV0dXJuIHBpZWNlO1xuICAgIH1cbiAgfVxuICByZXR1cm47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwb3NPZk91dHNpZGVFbChcbiAgbGVmdDogbnVtYmVyLFxuICB0b3A6IG51bWJlcixcbiAgYXNTZW50ZTogYm9vbGVhbixcbiAgZGltczogc2cuRGltZW5zaW9ucyxcbiAgYm9hcmRCb3VuZHM6IERPTVJlY3QsXG4pOiBzZy5Qb3MgfCB1bmRlZmluZWQge1xuICBjb25zdCBzcVcgPSBib2FyZEJvdW5kcy53aWR0aCAvIGRpbXMuZmlsZXM7XG4gIGNvbnN0IHNxSCA9IGJvYXJkQm91bmRzLmhlaWdodCAvIGRpbXMucmFua3M7XG4gIGlmICghc3FXIHx8ICFzcUgpIHJldHVybjtcbiAgbGV0IHhPZmYgPSAobGVmdCAtIGJvYXJkQm91bmRzLmxlZnQpIC8gc3FXO1xuICBpZiAoYXNTZW50ZSkgeE9mZiA9IGRpbXMuZmlsZXMgLSAxIC0geE9mZjtcbiAgbGV0IHlPZmYgPSAodG9wIC0gYm9hcmRCb3VuZHMudG9wKSAvIHNxSDtcbiAgaWYgKCFhc1NlbnRlKSB5T2ZmID0gZGltcy5yYW5rcyAtIDEgLSB5T2ZmO1xuICByZXR1cm4gW3hPZmYsIHlPZmZdO1xufVxuIiwgImltcG9ydCB7IGFsbEtleXMsIGNvbG9ycyB9IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbC5qcyc7XG5cbmV4cG9ydCB0eXBlIE11dGF0aW9uPEE+ID0gKHN0YXRlOiBTdGF0ZSkgPT4gQTtcblxuLy8gMCwxIGFuaW1hdGlvbiBnb2FsXG4vLyAyLDMgYW5pbWF0aW9uIGN1cnJlbnQgc3RhdHVzXG5leHBvcnQgdHlwZSBBbmltVmVjdG9yID0gc2cuTnVtYmVyUXVhZDtcblxuZXhwb3J0IHR5cGUgQW5pbVZlY3RvcnMgPSBNYXA8c2cuS2V5LCBBbmltVmVjdG9yPjtcblxuZXhwb3J0IHR5cGUgQW5pbUZhZGluZ3MgPSBNYXA8c2cuS2V5LCBzZy5QaWVjZT47XG5cbmV4cG9ydCB0eXBlIEFuaW1Qcm9tb3Rpb25zID0gTWFwPHNnLktleSwgc2cuUGllY2U+O1xuXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1QbGFuIHtcbiAgYW5pbXM6IEFuaW1WZWN0b3JzO1xuICBmYWRpbmdzOiBBbmltRmFkaW5ncztcbiAgcHJvbW90aW9uczogQW5pbVByb21vdGlvbnM7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbUN1cnJlbnQge1xuICBzdGFydDogRE9NSGlnaFJlc1RpbWVTdGFtcDtcbiAgZnJlcXVlbmN5OiBzZy5LSHo7XG4gIHBsYW46IEFuaW1QbGFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW5pbTxBPihtdXRhdGlvbjogTXV0YXRpb248QT4sIHN0YXRlOiBTdGF0ZSk6IEEge1xuICByZXR1cm4gc3RhdGUuYW5pbWF0aW9uLmVuYWJsZWQgPyBhbmltYXRlKG11dGF0aW9uLCBzdGF0ZSkgOiByZW5kZXIobXV0YXRpb24sIHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlcjxBPihtdXRhdGlvbjogTXV0YXRpb248QT4sIHN0YXRlOiBTdGF0ZSk6IEEge1xuICBjb25zdCByZXN1bHQgPSBtdXRhdGlvbihzdGF0ZSk7XG4gIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuaW50ZXJmYWNlIEFuaW1QaWVjZSB7XG4gIGtleT86IHNnLktleTtcbiAgcG9zOiBzZy5Qb3M7XG4gIHBpZWNlOiBzZy5QaWVjZTtcbn1cblxudHlwZSBOZXdBbmltUGllY2UgPSBSZXF1aXJlZDxBbmltUGllY2U+O1xuXG5mdW5jdGlvbiBtYWtlUGllY2Uoa2V5OiBzZy5LZXksIHBpZWNlOiBzZy5QaWVjZSk6IE5ld0FuaW1QaWVjZSB7XG4gIHJldHVybiB7XG4gICAga2V5OiBrZXksXG4gICAgcG9zOiB1dGlsLmtleTJwb3Moa2V5KSxcbiAgICBwaWVjZTogcGllY2UsXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNsb3NlcihwaWVjZTogQW5pbVBpZWNlLCBwaWVjZXM6IEFuaW1QaWVjZVtdKTogQW5pbVBpZWNlIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHBpZWNlcy5zb3J0KChwMSwgcDIpID0+IHtcbiAgICByZXR1cm4gdXRpbC5kaXN0YW5jZVNxKHBpZWNlLnBvcywgcDEucG9zKSAtIHV0aWwuZGlzdGFuY2VTcShwaWVjZS5wb3MsIHAyLnBvcyk7XG4gIH0pWzBdO1xufVxuXG5mdW5jdGlvbiBjb21wdXRlUGxhbihwcmV2UGllY2VzOiBzZy5QaWVjZXMsIHByZXZIYW5kczogc2cuSGFuZHMsIGN1cnJlbnQ6IFN0YXRlKTogQW5pbVBsYW4ge1xuICBjb25zdCBhbmltczogQW5pbVZlY3RvcnMgPSBuZXcgTWFwKCk7XG4gIGNvbnN0IGFuaW1lZE9yaWdzOiBzZy5LZXlbXSA9IFtdO1xuICBjb25zdCBmYWRpbmdzOiBBbmltRmFkaW5ncyA9IG5ldyBNYXAoKTtcbiAgY29uc3QgcHJvbW90aW9uczogQW5pbVByb21vdGlvbnMgPSBuZXcgTWFwKCk7XG4gIGNvbnN0IG1pc3NpbmdzOiBBbmltUGllY2VbXSA9IFtdO1xuICBjb25zdCBuZXdzOiBOZXdBbmltUGllY2VbXSA9IFtdO1xuICBjb25zdCBwcmVQaWVjZXMgPSBuZXcgTWFwPHNnLktleSwgQW5pbVBpZWNlPigpO1xuXG4gIGZvciAoY29uc3QgW2ssIHBdIG9mIHByZXZQaWVjZXMpIHtcbiAgICBwcmVQaWVjZXMuc2V0KGssIG1ha2VQaWVjZShrLCBwKSk7XG4gIH1cbiAgZm9yIChjb25zdCBrZXkgb2YgYWxsS2V5cykge1xuICAgIGNvbnN0IGN1clAgPSBjdXJyZW50LnBpZWNlcy5nZXQoa2V5KTtcbiAgICBjb25zdCBwcmVQID0gcHJlUGllY2VzLmdldChrZXkpO1xuICAgIGlmIChjdXJQKSB7XG4gICAgICBpZiAocHJlUCkge1xuICAgICAgICBpZiAoIXV0aWwuc2FtZVBpZWNlKGN1clAsIHByZVAucGllY2UpKSB7XG4gICAgICAgICAgbWlzc2luZ3MucHVzaChwcmVQKTtcbiAgICAgICAgICBuZXdzLnB1c2gobWFrZVBpZWNlKGtleSwgY3VyUCkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgbmV3cy5wdXNoKG1ha2VQaWVjZShrZXksIGN1clApKTtcbiAgICB9IGVsc2UgaWYgKHByZVApIG1pc3NpbmdzLnB1c2gocHJlUCk7XG4gIH1cbiAgaWYgKGN1cnJlbnQuYW5pbWF0aW9uLmhhbmRzKSB7XG4gICAgZm9yIChjb25zdCBjb2xvciBvZiBjb2xvcnMpIHtcbiAgICAgIGNvbnN0IGN1ckggPSBjdXJyZW50LmhhbmRzLmhhbmRNYXAuZ2V0KGNvbG9yKTtcbiAgICAgIGNvbnN0IHByZUggPSBwcmV2SGFuZHMuZ2V0KGNvbG9yKTtcbiAgICAgIGlmIChwcmVIICYmIGN1ckgpIHtcbiAgICAgICAgZm9yIChjb25zdCBbcm9sZSwgbl0gb2YgcHJlSCkge1xuICAgICAgICAgIGNvbnN0IHBpZWNlOiBzZy5QaWVjZSA9IHsgcm9sZSwgY29sb3IgfTtcbiAgICAgICAgICBjb25zdCBjdXJOID0gY3VySC5nZXQocm9sZSkgfHwgMDtcbiAgICAgICAgICBpZiAoY3VyTiA8IG4pIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRQaWVjZU9mZnNldCA9IGN1cnJlbnQuZG9tLmJvdW5kcy5oYW5kc1xuICAgICAgICAgICAgICAucGllY2VCb3VuZHMoKVxuICAgICAgICAgICAgICAuZ2V0KHV0aWwucGllY2VOYW1lT2YocGllY2UpKTtcbiAgICAgICAgICAgIGNvbnN0IGJvdW5kcyA9IGN1cnJlbnQuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKTtcbiAgICAgICAgICAgIGNvbnN0IG91dFBvcyA9XG4gICAgICAgICAgICAgIGhhbmRQaWVjZU9mZnNldCAmJiBib3VuZHNcbiAgICAgICAgICAgICAgICA/IHV0aWwucG9zT2ZPdXRzaWRlRWwoXG4gICAgICAgICAgICAgICAgICAgIGhhbmRQaWVjZU9mZnNldC5sZWZ0LFxuICAgICAgICAgICAgICAgICAgICBoYW5kUGllY2VPZmZzZXQudG9wLFxuICAgICAgICAgICAgICAgICAgICB1dGlsLnNlbnRlUG92KGN1cnJlbnQub3JpZW50YXRpb24pLFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50LmRpbWVuc2lvbnMsXG4gICAgICAgICAgICAgICAgICAgIGJvdW5kcyxcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmIChvdXRQb3MpXG4gICAgICAgICAgICAgIG1pc3NpbmdzLnB1c2goe1xuICAgICAgICAgICAgICAgIHBvczogb3V0UG9zLFxuICAgICAgICAgICAgICAgIHBpZWNlOiBwaWVjZSxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGZvciAoY29uc3QgbmV3UCBvZiBuZXdzKSB7XG4gICAgY29uc3QgcHJlUCA9IGNsb3NlcihcbiAgICAgIG5ld1AsXG4gICAgICBtaXNzaW5ncy5maWx0ZXIoKHApID0+IHtcbiAgICAgICAgaWYgKHV0aWwuc2FtZVBpZWNlKG5ld1AucGllY2UsIHAucGllY2UpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgLy8gY2hlY2tpbmcgd2hldGhlciBwcm9tb3RlZCBwaWVjZXMgYXJlIHRoZSBzYW1lXG4gICAgICAgIGNvbnN0IHBSb2xlID0gY3VycmVudC5wcm9tb3Rpb24ucHJvbW90ZXNUbyhwLnBpZWNlLnJvbGUpO1xuICAgICAgICBjb25zdCBwUGllY2UgPSBwUm9sZSAmJiB7IGNvbG9yOiBwLnBpZWNlLmNvbG9yLCByb2xlOiBwUm9sZSB9O1xuICAgICAgICBjb25zdCBuUm9sZSA9IGN1cnJlbnQucHJvbW90aW9uLnByb21vdGVzVG8obmV3UC5waWVjZS5yb2xlKTtcbiAgICAgICAgY29uc3QgblBpZWNlID0gblJvbGUgJiYgeyBjb2xvcjogbmV3UC5waWVjZS5jb2xvciwgcm9sZTogblJvbGUgfTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAoISFwUGllY2UgJiYgdXRpbC5zYW1lUGllY2UobmV3UC5waWVjZSwgcFBpZWNlKSkgfHxcbiAgICAgICAgICAoISFuUGllY2UgJiYgdXRpbC5zYW1lUGllY2UoblBpZWNlLCBwLnBpZWNlKSlcbiAgICAgICAgKTtcbiAgICAgIH0pLFxuICAgICk7XG4gICAgaWYgKHByZVApIHtcbiAgICAgIGNvbnN0IHZlY3RvciA9IFtwcmVQLnBvc1swXSAtIG5ld1AucG9zWzBdLCBwcmVQLnBvc1sxXSAtIG5ld1AucG9zWzFdXTtcbiAgICAgIGFuaW1zLnNldChuZXdQLmtleSwgdmVjdG9yLmNvbmNhdCh2ZWN0b3IpIGFzIEFuaW1WZWN0b3IpO1xuICAgICAgaWYgKHByZVAua2V5KSBhbmltZWRPcmlncy5wdXNoKHByZVAua2V5KTtcbiAgICAgIGlmICghdXRpbC5zYW1lUGllY2UobmV3UC5waWVjZSwgcHJlUC5waWVjZSkgJiYgbmV3UC5rZXkpIHByb21vdGlvbnMuc2V0KG5ld1Aua2V5LCBwcmVQLnBpZWNlKTtcbiAgICB9XG4gIH1cbiAgZm9yIChjb25zdCBwIG9mIG1pc3NpbmdzKSB7XG4gICAgaWYgKHAua2V5ICYmICFhbmltZWRPcmlncy5pbmNsdWRlcyhwLmtleSkpIGZhZGluZ3Muc2V0KHAua2V5LCBwLnBpZWNlKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYW5pbXM6IGFuaW1zLFxuICAgIGZhZGluZ3M6IGZhZGluZ3MsXG4gICAgcHJvbW90aW9uczogcHJvbW90aW9ucyxcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3RlcChzdGF0ZTogU3RhdGUsIG5vdzogRE9NSGlnaFJlc1RpbWVTdGFtcCk6IHZvaWQge1xuICBjb25zdCBjdXIgPSBzdGF0ZS5hbmltYXRpb24uY3VycmVudDtcbiAgaWYgKGN1ciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gYW5pbWF0aW9uIHdhcyBjYW5jZWxlZCA6KFxuICAgIGlmICghc3RhdGUuZG9tLmRlc3Ryb3llZCkgc3RhdGUuZG9tLnJlZHJhd05vdygpO1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCByZXN0ID0gMSAtIChub3cgLSBjdXIuc3RhcnQpICogY3VyLmZyZXF1ZW5jeTtcbiAgaWYgKHJlc3QgPD0gMCkge1xuICAgIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmRvbS5yZWRyYXdOb3coKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBlYXNlID0gZWFzaW5nKHJlc3QpO1xuICAgIGZvciAoY29uc3QgY2ZnIG9mIGN1ci5wbGFuLmFuaW1zLnZhbHVlcygpKSB7XG4gICAgICBjZmdbMl0gPSBjZmdbMF0gKiBlYXNlO1xuICAgICAgY2ZnWzNdID0gY2ZnWzFdICogZWFzZTtcbiAgICB9XG4gICAgc3RhdGUuZG9tLnJlZHJhd05vdyh0cnVlKTsgLy8gb3B0aW1pc2F0aW9uOiBkb24ndCByZW5kZXIgU1ZHIGNoYW5nZXMgZHVyaW5nIGFuaW1hdGlvbnNcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpKSA9PiBzdGVwKHN0YXRlLCBub3cpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhbmltYXRlPEE+KG11dGF0aW9uOiBNdXRhdGlvbjxBPiwgc3RhdGU6IFN0YXRlKTogQSB7XG4gIC8vIGNsb25lIHN0YXRlIGJlZm9yZSBtdXRhdGluZyBpdFxuICBjb25zdCBwcmV2UGllY2VzOiBzZy5QaWVjZXMgPSBuZXcgTWFwKHN0YXRlLnBpZWNlcyk7XG4gIGNvbnN0IHByZXZIYW5kczogc2cuSGFuZHMgPSBuZXcgTWFwKFtcbiAgICBbJ3NlbnRlJywgbmV3IE1hcChzdGF0ZS5oYW5kcy5oYW5kTWFwLmdldCgnc2VudGUnKSldLFxuICAgIFsnZ290ZScsIG5ldyBNYXAoc3RhdGUuaGFuZHMuaGFuZE1hcC5nZXQoJ2dvdGUnKSldLFxuICBdKTtcblxuICBjb25zdCByZXN1bHQgPSBtdXRhdGlvbihzdGF0ZSk7XG4gIGNvbnN0IHBsYW4gPSBjb21wdXRlUGxhbihwcmV2UGllY2VzLCBwcmV2SGFuZHMsIHN0YXRlKTtcbiAgaWYgKHBsYW4uYW5pbXMuc2l6ZSB8fCBwbGFuLmZhZGluZ3Muc2l6ZSkge1xuICAgIGNvbnN0IGFscmVhZHlSdW5uaW5nID0gc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQ/LnN0YXJ0ICE9PSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB7XG4gICAgICBzdGFydDogcGVyZm9ybWFuY2Uubm93KCksXG4gICAgICBmcmVxdWVuY3k6IDEgLyBNYXRoLm1heChzdGF0ZS5hbmltYXRpb24uZHVyYXRpb24sIDEpLFxuICAgICAgcGxhbjogcGxhbixcbiAgICB9O1xuICAgIGlmICghYWxyZWFkeVJ1bm5pbmcpIHN0ZXAoc3RhdGUsIHBlcmZvcm1hbmNlLm5vdygpKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBkb24ndCBhbmltYXRlLCBqdXN0IHJlbmRlciByaWdodCBhd2F5XG4gICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2dyZS8xNjUwMjk0XG5mdW5jdGlvbiBlYXNpbmcodDogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIHQgPCAwLjUgPyA0ICogdCAqIHQgKiB0IDogKHQgLSAxKSAqICgyICogdCAtIDIpICogKDIgKiB0IC0gMikgKyAxO1xufVxuIiwgImltcG9ydCB0eXBlIHsgSGVhZGxlc3NTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IGlzS2V5LCBzYW1lUGllY2UgfSBmcm9tICcuL3V0aWwuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gbnVtYmVySW5IYW5kKHM6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSk6IG51bWJlciB7XG4gIHJldHVybiBzLmhhbmRzLmhhbmRNYXAuZ2V0KHBpZWNlLmNvbG9yKT8uZ2V0KHBpZWNlLnJvbGUpIHx8IDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRUb0hhbmQoczogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBjbnQgPSAxKTogdm9pZCB7XG4gIGNvbnN0IGhhbmQgPSBzLmhhbmRzLmhhbmRNYXAuZ2V0KHBpZWNlLmNvbG9yKTtcbiAgY29uc3Qgcm9sZSA9XG4gICAgKHMuaGFuZHMucm9sZXMuaW5jbHVkZXMocGllY2Uucm9sZSkgPyBwaWVjZS5yb2xlIDogcy5wcm9tb3Rpb24udW5wcm9tb3Rlc1RvKHBpZWNlLnJvbGUpKSB8fFxuICAgIHBpZWNlLnJvbGU7XG4gIGlmIChoYW5kICYmIHMuaGFuZHMucm9sZXMuaW5jbHVkZXMocm9sZSkpIGhhbmQuc2V0KHJvbGUsIChoYW5kLmdldChyb2xlKSB8fCAwKSArIGNudCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVGcm9tSGFuZChzOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGNudCA9IDEpOiB2b2lkIHtcbiAgY29uc3QgaGFuZCA9IHMuaGFuZHMuaGFuZE1hcC5nZXQocGllY2UuY29sb3IpO1xuICBjb25zdCByb2xlID1cbiAgICAocy5oYW5kcy5yb2xlcy5pbmNsdWRlcyhwaWVjZS5yb2xlKSA/IHBpZWNlLnJvbGUgOiBzLnByb21vdGlvbi51bnByb21vdGVzVG8ocGllY2Uucm9sZSkpIHx8XG4gICAgcGllY2Uucm9sZTtcbiAgY29uc3QgbnVtID0gaGFuZD8uZ2V0KHJvbGUpO1xuICBpZiAoaGFuZCAmJiBudW0pIGhhbmQuc2V0KHJvbGUsIE1hdGgubWF4KG51bSAtIGNudCwgMCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVySGFuZChzOiBIZWFkbGVzc1N0YXRlLCBoYW5kRWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gIGhhbmRFbC5jbGFzc0xpc3QudG9nZ2xlKCdwcm9tb3Rpb24nLCAhIXMucHJvbW90aW9uLmN1cnJlbnQpO1xuICBsZXQgd3JhcEVsID0gaGFuZEVsLmZpcnN0RWxlbWVudENoaWxkIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICB3aGlsZSAod3JhcEVsKSB7XG4gICAgY29uc3QgcGllY2VFbCA9IHdyYXBFbC5maXJzdEVsZW1lbnRDaGlsZCBhcyBzZy5QaWVjZU5vZGU7XG4gICAgY29uc3QgcGllY2UgPSB7IHJvbGU6IHBpZWNlRWwuc2dSb2xlLCBjb2xvcjogcGllY2VFbC5zZ0NvbG9yIH07XG5cbiAgICBjb25zdCBjdXJzb3IgPSBzLmtleWJvYXJkLmN1cnJlbnQ7XG4gICAgd3JhcEVsLmNsYXNzTGlzdC50b2dnbGUoXG4gICAgICAna2V5Ym9hcmQtY3Vyc29yJyxcbiAgICAgIHMua2V5Ym9hcmQuZW5hYmxlZCAmJlxuICAgICAgICAhcy52aWV3T25seSAmJlxuICAgICAgICAhcy5wcm9tb3Rpb24uY3VycmVudCAmJlxuICAgICAgICAhIWN1cnNvciAmJlxuICAgICAgICAhaXNLZXkoY3Vyc29yKSAmJlxuICAgICAgICBzYW1lUGllY2UoY3Vyc29yLCBwaWVjZSksXG4gICAgKTtcbiAgICB3cmFwRWwuY2xhc3NMaXN0LnRvZ2dsZSgna2V5Ym9hcmQtZm9jdXNlZCcsIHMua2V5Ym9hcmQuZm9jdXNlZCk7XG5cbiAgICBjb25zdCBudW0gPSBudW1iZXJJbkhhbmQocywgcGllY2UpO1xuICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSAhIXMuc2VsZWN0ZWRQaWVjZSAmJiBzYW1lUGllY2UocGllY2UsIHMuc2VsZWN0ZWRQaWVjZSkgJiYgIXMuZHJvcHBhYmxlLnNwYXJlO1xuXG4gICAgd3JhcEVsLmNsYXNzTGlzdC50b2dnbGUoXG4gICAgICAnc2VsZWN0ZWQnLFxuICAgICAgKHMuYWN0aXZlQ29sb3IgPT09ICdib3RoJyB8fCBzLmFjdGl2ZUNvbG9yID09PSBzLnR1cm5Db2xvcikgJiYgaXNTZWxlY3RlZCxcbiAgICApO1xuICAgIHdyYXBFbC5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgJ3ByZXNlbGVjdGVkJyxcbiAgICAgIHMuYWN0aXZlQ29sb3IgIT09ICdib3RoJyAmJiBzLmFjdGl2ZUNvbG9yICE9PSBzLnR1cm5Db2xvciAmJiBpc1NlbGVjdGVkLFxuICAgICk7XG4gICAgd3JhcEVsLmNsYXNzTGlzdC50b2dnbGUoXG4gICAgICAnbGFzdC1kZXN0JyxcbiAgICAgIHMuaGlnaGxpZ2h0Lmxhc3REZXN0cyAmJiAhIXMubGFzdFBpZWNlICYmIHNhbWVQaWVjZShwaWVjZSwgcy5sYXN0UGllY2UpLFxuICAgICk7XG4gICAgd3JhcEVsLmNsYXNzTGlzdC50b2dnbGUoJ2RyYXdpbmcnLCAhIXMuZHJhd2FibGUucGllY2UgJiYgc2FtZVBpZWNlKHMuZHJhd2FibGUucGllY2UsIHBpZWNlKSk7XG4gICAgd3JhcEVsLmNsYXNzTGlzdC50b2dnbGUoXG4gICAgICAnY3VycmVudC1wcmUnLFxuICAgICAgISFzLnByZWRyb3BwYWJsZS5jdXJyZW50ICYmIHNhbWVQaWVjZShzLnByZWRyb3BwYWJsZS5jdXJyZW50LnBpZWNlLCBwaWVjZSksXG4gICAgKTtcbiAgICB3cmFwRWwuZGF0YXNldC5uYiA9IG51bS50b1N0cmluZygpO1xuICAgIHdyYXBFbCA9IHdyYXBFbC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBhZGRUb0hhbmQsIG51bWJlckluSGFuZCwgcmVtb3ZlRnJvbUhhbmQgfSBmcm9tICcuL2hhbmRzLmpzJztcbmltcG9ydCB0eXBlIHsgSGVhZGxlc3NTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IGNhbGxVc2VyRnVuY3Rpb24sIG9wcG9zaXRlLCBwaWVjZU5hbWVPZiwgc2FtZVBpZWNlIH0gZnJvbSAnLi91dGlsLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIHRvZ2dsZU9yaWVudGF0aW9uKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIHN0YXRlLm9yaWVudGF0aW9uID0gb3Bwb3NpdGUoc3RhdGUub3JpZW50YXRpb24pO1xuICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9XG4gICAgc3RhdGUuZHJhZ2dhYmxlLmN1cnJlbnQgPVxuICAgIHN0YXRlLnByb21vdGlvbi5jdXJyZW50ID1cbiAgICBzdGF0ZS5ob3ZlcmVkID1cbiAgICBzdGF0ZS5zZWxlY3RlZCA9XG4gICAgc3RhdGUuc2VsZWN0ZWRQaWVjZSA9XG4gICAgICB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldChzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICBjYW5jZWxQcm9tb3Rpb24oc3RhdGUpO1xuICB1bnNlbGVjdChzdGF0ZSk7XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0gc3RhdGUuZHJhZ2dhYmxlLmN1cnJlbnQgPSBzdGF0ZS5ob3ZlcmVkID0gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0UGllY2VzKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZXM6IHNnLlBpZWNlc0RpZmYpOiB2b2lkIHtcbiAgZm9yIChjb25zdCBba2V5LCBwaWVjZV0gb2YgcGllY2VzKSB7XG4gICAgaWYgKHBpZWNlKSBzdGF0ZS5waWVjZXMuc2V0KGtleSwgcGllY2UpO1xuICAgIGVsc2Ugc3RhdGUucGllY2VzLmRlbGV0ZShrZXkpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRDaGVja3Moc3RhdGU6IEhlYWRsZXNzU3RhdGUsIGNoZWNrc1ZhbHVlOiBzZy5LZXlbXSB8IHNnLkNvbG9yIHwgYm9vbGVhbik6IHZvaWQge1xuICBpZiAoQXJyYXkuaXNBcnJheShjaGVja3NWYWx1ZSkpIHtcbiAgICBzdGF0ZS5jaGVja3MgPSBjaGVja3NWYWx1ZTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoY2hlY2tzVmFsdWUgPT09IHRydWUpIGNoZWNrc1ZhbHVlID0gc3RhdGUudHVybkNvbG9yO1xuICAgIGlmIChjaGVja3NWYWx1ZSkge1xuICAgICAgY29uc3QgY2hlY2tzOiBzZy5LZXlbXSA9IFtdO1xuICAgICAgZm9yIChjb25zdCBbaywgcF0gb2Ygc3RhdGUucGllY2VzKSB7XG4gICAgICAgIGlmIChzdGF0ZS5oaWdobGlnaHQuY2hlY2tSb2xlcy5pbmNsdWRlcyhwLnJvbGUpICYmIHAuY29sb3IgPT09IGNoZWNrc1ZhbHVlKSBjaGVja3MucHVzaChrKTtcbiAgICAgIH1cbiAgICAgIHN0YXRlLmNoZWNrcyA9IGNoZWNrcztcbiAgICB9IGVsc2Ugc3RhdGUuY2hlY2tzID0gdW5kZWZpbmVkO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNldFByZW1vdmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tOiBib29sZWFuKTogdm9pZCB7XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIHN0YXRlLnByZW1vdmFibGUuY3VycmVudCA9IHsgb3JpZywgZGVzdCwgcHJvbSB9O1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByZW1vdmFibGUuZXZlbnRzLnNldCwgb3JpZywgZGVzdCwgcHJvbSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnNldFByZW1vdmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLnByZW1vdmFibGUuY3VycmVudCkge1xuICAgIHN0YXRlLnByZW1vdmFibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByZW1vdmFibGUuZXZlbnRzLnVuc2V0KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzZXRQcmVkcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tOiBib29sZWFuKTogdm9pZCB7XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50ID0geyBwaWVjZSwga2V5LCBwcm9tIH07XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJlZHJvcHBhYmxlLmV2ZW50cy5zZXQsIHBpZWNlLCBrZXksIHByb20pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5zZXRQcmVkcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCkge1xuICAgIHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJlZHJvcHBhYmxlLmV2ZW50cy51bnNldCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2VNb3ZlKFxuICBzdGF0ZTogSGVhZGxlc3NTdGF0ZSxcbiAgb3JpZzogc2cuS2V5LFxuICBkZXN0OiBzZy5LZXksXG4gIHByb206IGJvb2xlYW4sXG4pOiBzZy5QaWVjZSB8IGJvb2xlYW4ge1xuICBjb25zdCBvcmlnUGllY2UgPSBzdGF0ZS5waWVjZXMuZ2V0KG9yaWcpO1xuICBjb25zdCBkZXN0UGllY2UgPSBzdGF0ZS5waWVjZXMuZ2V0KGRlc3QpO1xuICBpZiAob3JpZyA9PT0gZGVzdCB8fCAhb3JpZ1BpZWNlKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IGNhcHR1cmVkID0gZGVzdFBpZWNlICYmIGRlc3RQaWVjZS5jb2xvciAhPT0gb3JpZ1BpZWNlLmNvbG9yID8gZGVzdFBpZWNlIDogdW5kZWZpbmVkO1xuICBjb25zdCBwcm9tUGllY2UgPSBwcm9tICYmIHByb21vdGVQaWVjZShzdGF0ZSwgb3JpZ1BpZWNlKTtcbiAgaWYgKGRlc3QgPT09IHN0YXRlLnNlbGVjdGVkIHx8IG9yaWcgPT09IHN0YXRlLnNlbGVjdGVkKSB1bnNlbGVjdChzdGF0ZSk7XG4gIHN0YXRlLnBpZWNlcy5zZXQoZGVzdCwgcHJvbVBpZWNlIHx8IG9yaWdQaWVjZSk7XG4gIHN0YXRlLnBpZWNlcy5kZWxldGUob3JpZyk7XG4gIHN0YXRlLmxhc3REZXN0cyA9IFtvcmlnLCBkZXN0XTtcbiAgc3RhdGUubGFzdFBpZWNlID0gdW5kZWZpbmVkO1xuICBzdGF0ZS5jaGVja3MgPSB1bmRlZmluZWQ7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLm1vdmUsIG9yaWcsIGRlc3QsIHByb20sIGNhcHR1cmVkKTtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuY2hhbmdlKTtcbiAgcmV0dXJuIGNhcHR1cmVkIHx8IHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYXNlRHJvcChcbiAgc3RhdGU6IEhlYWRsZXNzU3RhdGUsXG4gIHBpZWNlOiBzZy5QaWVjZSxcbiAga2V5OiBzZy5LZXksXG4gIHByb206IGJvb2xlYW4sXG4gIHNwYXJlOiBib29sZWFuID0gc3RhdGUuZHJvcHBhYmxlLnNwYXJlLFxuKTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlQ291bnQgPSBudW1iZXJJbkhhbmQoc3RhdGUsIHBpZWNlKTtcbiAgaWYgKCFwaWVjZUNvdW50ICYmICFzcGFyZSkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBwcm9tUGllY2UgPSBwcm9tICYmIHByb21vdGVQaWVjZShzdGF0ZSwgcGllY2UpO1xuICBpZiAoXG4gICAga2V5ID09PSBzdGF0ZS5zZWxlY3RlZCB8fFxuICAgICghc3BhcmUgJiYgcGllY2VDb3VudCA9PT0gMSAmJiBzdGF0ZS5zZWxlY3RlZFBpZWNlICYmIHNhbWVQaWVjZShzdGF0ZS5zZWxlY3RlZFBpZWNlLCBwaWVjZSkpXG4gIClcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gIHN0YXRlLnBpZWNlcy5zZXQoa2V5LCBwcm9tUGllY2UgfHwgcGllY2UpO1xuICBzdGF0ZS5sYXN0RGVzdHMgPSBba2V5XTtcbiAgc3RhdGUubGFzdFBpZWNlID0gcGllY2U7XG4gIHN0YXRlLmNoZWNrcyA9IHVuZGVmaW5lZDtcbiAgaWYgKCFzcGFyZSkgcmVtb3ZlRnJvbUhhbmQoc3RhdGUsIHBpZWNlKTtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuZHJvcCwgcGllY2UsIGtleSwgcHJvbSk7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBiYXNlVXNlck1vdmUoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBvcmlnOiBzZy5LZXksXG4gIGRlc3Q6IHNnLktleSxcbiAgcHJvbTogYm9vbGVhbixcbik6IHNnLlBpZWNlIHwgYm9vbGVhbiB7XG4gIGNvbnN0IHJlc3VsdCA9IGJhc2VNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0LCBwcm9tKTtcbiAgaWYgKHJlc3VsdCkge1xuICAgIHN0YXRlLm1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZHJvcHBhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLnR1cm5Db2xvciA9IG9wcG9zaXRlKHN0YXRlLnR1cm5Db2xvcik7XG4gICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gYmFzZVVzZXJEcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tOiBib29sZWFuKTogYm9vbGVhbiB7XG4gIGNvbnN0IHJlc3VsdCA9IGJhc2VEcm9wKHN0YXRlLCBwaWVjZSwga2V5LCBwcm9tKTtcbiAgaWYgKHJlc3VsdCkge1xuICAgIHN0YXRlLm1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZHJvcHBhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLnR1cm5Db2xvciA9IG9wcG9zaXRlKHN0YXRlLnR1cm5Db2xvcik7XG4gICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZXJEcm9wKFxuICBzdGF0ZTogSGVhZGxlc3NTdGF0ZSxcbiAgcGllY2U6IHNnLlBpZWNlLFxuICBrZXk6IHNnLktleSxcbiAgcHJvbT86IGJvb2xlYW4sXG4pOiBib29sZWFuIHtcbiAgY29uc3QgcmVhbFByb20gPSBwcm9tIHx8IHN0YXRlLnByb21vdGlvbi5mb3JjZURyb3BQcm9tb3Rpb24ocGllY2UsIGtleSk7XG4gIGlmIChjYW5Ecm9wKHN0YXRlLCBwaWVjZSwga2V5KSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGJhc2VVc2VyRHJvcChzdGF0ZSwgcGllY2UsIGtleSwgcmVhbFByb20pO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZHJvcHBhYmxlLmV2ZW50cy5hZnRlciwgcGllY2UsIGtleSwgcmVhbFByb20sIHsgcHJlbWFkZTogZmFsc2UgfSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoY2FuUHJlZHJvcChzdGF0ZSwgcGllY2UsIGtleSkpIHtcbiAgICBzZXRQcmVkcm9wKHN0YXRlLCBwaWVjZSwga2V5LCByZWFsUHJvbSk7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlck1vdmUoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBvcmlnOiBzZy5LZXksXG4gIGRlc3Q6IHNnLktleSxcbiAgcHJvbT86IGJvb2xlYW4sXG4pOiBib29sZWFuIHtcbiAgY29uc3QgcmVhbFByb20gPSBwcm9tIHx8IHN0YXRlLnByb21vdGlvbi5mb3JjZU1vdmVQcm9tb3Rpb24ob3JpZywgZGVzdCk7XG4gIGlmIChjYW5Nb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGJhc2VVc2VyTW92ZShzdGF0ZSwgb3JpZywgZGVzdCwgcmVhbFByb20pO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgICAgIGNvbnN0IG1ldGFkYXRhOiBzZy5Nb3ZlTWV0YWRhdGEgPSB7IHByZW1hZGU6IGZhbHNlIH07XG4gICAgICBpZiAocmVzdWx0ICE9PSB0cnVlKSBtZXRhZGF0YS5jYXB0dXJlZCA9IHJlc3VsdDtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUubW92YWJsZS5ldmVudHMuYWZ0ZXIsIG9yaWcsIGRlc3QsIHJlYWxQcm9tLCBtZXRhZGF0YSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoY2FuUHJlbW92ZShzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICBzZXRQcmVtb3ZlKHN0YXRlLCBvcmlnLCBkZXN0LCByZWFsUHJvbSk7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFzZVByb21vdGlvbkRpYWxvZyhzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwcm9tb3RlZFBpZWNlID0gcHJvbW90ZVBpZWNlKHN0YXRlLCBwaWVjZSk7XG4gIGlmIChzdGF0ZS52aWV3T25seSB8fCBzdGF0ZS5wcm9tb3Rpb24uY3VycmVudCB8fCAhcHJvbW90ZWRQaWVjZSkgcmV0dXJuIGZhbHNlO1xuXG4gIHN0YXRlLnByb21vdGlvbi5jdXJyZW50ID0geyBwaWVjZSwgcHJvbW90ZWRQaWVjZSwga2V5LCBkcmFnZ2VkOiAhIXN0YXRlLmRyYWdnYWJsZS5jdXJyZW50IH07XG4gIHN0YXRlLmhvdmVyZWQgPSBrZXk7XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9tb3Rpb25EaWFsb2dEcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5KTogYm9vbGVhbiB7XG4gIGlmIChcbiAgICBjYW5Ecm9wUHJvbW90ZShzdGF0ZSwgcGllY2UsIGtleSkgJiZcbiAgICAoY2FuRHJvcChzdGF0ZSwgcGllY2UsIGtleSkgfHwgY2FuUHJlZHJvcChzdGF0ZSwgcGllY2UsIGtleSkpXG4gICkge1xuICAgIGlmIChiYXNlUHJvbW90aW9uRGlhbG9nKHN0YXRlLCBwaWVjZSwga2V5KSkge1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcm9tb3Rpb24uZXZlbnRzLmluaXRpYXRlZCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvbW90aW9uRGlhbG9nTW92ZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgb3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgaWYgKFxuICAgIGNhbk1vdmVQcm9tb3RlKHN0YXRlLCBvcmlnLCBkZXN0KSAmJlxuICAgIChjYW5Nb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSB8fCBjYW5QcmVtb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSlcbiAgKSB7XG4gICAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXMuZ2V0KG9yaWcpO1xuICAgIGlmIChwaWVjZSAmJiBiYXNlUHJvbW90aW9uRGlhbG9nKHN0YXRlLCBwaWVjZSwgZGVzdCkpIHtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJvbW90aW9uLmV2ZW50cy5pbml0aWF0ZWQpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gcHJvbW90ZVBpZWNlKHM6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSk6IHNnLlBpZWNlIHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgcHJvbVJvbGUgPSBzLnByb21vdGlvbi5wcm9tb3Rlc1RvKHBpZWNlLnJvbGUpO1xuICByZXR1cm4gcHJvbVJvbGUgIT09IHVuZGVmaW5lZCA/IHsgY29sb3I6IHBpZWNlLmNvbG9yLCByb2xlOiBwcm9tUm9sZSB9IDogdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVsZXRlUGllY2Uoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIGtleTogc2cuS2V5KTogdm9pZCB7XG4gIGlmIChzdGF0ZS5waWVjZXMuZGVsZXRlKGtleSkpIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RTcXVhcmUoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBrZXk6IHNnLktleSxcbiAgcHJvbT86IGJvb2xlYW4sXG4gIGZvcmNlPzogYm9vbGVhbixcbik6IHZvaWQge1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5zZWxlY3QsIGtleSk7XG5cbiAgLy8gdW5zZWxlY3QgaWYgc2VsZWN0aW5nIHNlbGVjdGVkIGtleSwga2VlcCBzZWxlY3RlZCBmb3IgZHJhZ1xuICBpZiAoIXN0YXRlLmRyYWdnYWJsZS5lbmFibGVkICYmIHN0YXRlLnNlbGVjdGVkID09PSBrZXkpIHtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy51bnNlbGVjdCwga2V5KTtcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gdHJ5IG1vdmluZy9kcm9wcGluZ1xuICBpZiAoXG4gICAgc3RhdGUuc2VsZWN0YWJsZS5lbmFibGVkIHx8XG4gICAgZm9yY2UgfHxcbiAgICAoc3RhdGUuc2VsZWN0YWJsZS5mb3JjZVNwYXJlcyAmJiBzdGF0ZS5zZWxlY3RlZFBpZWNlICYmIHN0YXRlLmRyb3BwYWJsZS5zcGFyZSlcbiAgKSB7XG4gICAgaWYgKHN0YXRlLnNlbGVjdGVkUGllY2UgJiYgdXNlckRyb3Aoc3RhdGUsIHN0YXRlLnNlbGVjdGVkUGllY2UsIGtleSwgcHJvbSkpIHJldHVybjtcbiAgICBlbHNlIGlmIChzdGF0ZS5zZWxlY3RlZCAmJiB1c2VyTW92ZShzdGF0ZSwgc3RhdGUuc2VsZWN0ZWQsIGtleSwgcHJvbSkpIHJldHVybjtcbiAgfVxuXG4gIGlmIChcbiAgICAoc3RhdGUuc2VsZWN0YWJsZS5lbmFibGVkIHx8IHN0YXRlLmRyYWdnYWJsZS5lbmFibGVkIHx8IGZvcmNlKSAmJlxuICAgIChpc01vdmFibGUoc3RhdGUsIGtleSkgfHwgaXNQcmVtb3ZhYmxlKHN0YXRlLCBrZXkpKVxuICApIHtcbiAgICBzZXRTZWxlY3RlZChzdGF0ZSwga2V5KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0UGllY2UoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBwaWVjZTogc2cuUGllY2UsXG4gIHNwYXJlPzogYm9vbGVhbixcbiAgZm9yY2U/OiBib29sZWFuLFxuICBhcGk/OiBib29sZWFuLFxuKTogdm9pZCB7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLnBpZWNlU2VsZWN0LCBwaWVjZSk7XG5cbiAgaWYgKHN0YXRlLnNlbGVjdGFibGUuYWRkU3BhcmVzVG9IYW5kICYmIHN0YXRlLmRyb3BwYWJsZS5zcGFyZSAmJiBzdGF0ZS5zZWxlY3RlZFBpZWNlKSB7XG4gICAgYWRkVG9IYW5kKHN0YXRlLCB7IHJvbGU6IHN0YXRlLnNlbGVjdGVkUGllY2Uucm9sZSwgY29sb3I6IHBpZWNlLmNvbG9yIH0pO1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICB9IGVsc2UgaWYgKFxuICAgICFhcGkgJiZcbiAgICAhc3RhdGUuZHJhZ2dhYmxlLmVuYWJsZWQgJiZcbiAgICBzdGF0ZS5zZWxlY3RlZFBpZWNlICYmXG4gICAgc2FtZVBpZWNlKHN0YXRlLnNlbGVjdGVkUGllY2UsIHBpZWNlKVxuICApIHtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5waWVjZVVuc2VsZWN0LCBwaWVjZSk7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICB9IGVsc2UgaWYgKFxuICAgIChzdGF0ZS5zZWxlY3RhYmxlLmVuYWJsZWQgfHwgc3RhdGUuZHJhZ2dhYmxlLmVuYWJsZWQgfHwgZm9yY2UpICYmXG4gICAgKGlzRHJvcHBhYmxlKHN0YXRlLCBwaWVjZSwgISFzcGFyZSkgfHwgaXNQcmVkcm9wcGFibGUoc3RhdGUsIHBpZWNlKSlcbiAgKSB7XG4gICAgc2V0U2VsZWN0ZWRQaWVjZShzdGF0ZSwgcGllY2UpO1xuICAgIHN0YXRlLmRyb3BwYWJsZS5zcGFyZSA9ICEhc3BhcmU7XG4gIH0gZWxzZSB7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRTZWxlY3RlZChzdGF0ZTogSGVhZGxlc3NTdGF0ZSwga2V5OiBzZy5LZXkpOiB2b2lkIHtcbiAgdW5zZWxlY3Qoc3RhdGUpO1xuICBzdGF0ZS5zZWxlY3RlZCA9IGtleTtcbiAgc2V0UHJlRGVzdHMoc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0U2VsZWN0ZWRQaWVjZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlKTogdm9pZCB7XG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgc3RhdGUuc2VsZWN0ZWRQaWVjZSA9IHBpZWNlO1xuICBzZXRQcmVEZXN0cyhzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRQcmVEZXN0cyhzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICBzdGF0ZS5wcmVtb3ZhYmxlLmRlc3RzID0gc3RhdGUucHJlZHJvcHBhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuXG4gIGlmIChzdGF0ZS5zZWxlY3RlZCAmJiBpc1ByZW1vdmFibGUoc3RhdGUsIHN0YXRlLnNlbGVjdGVkKSAmJiBzdGF0ZS5wcmVtb3ZhYmxlLmdlbmVyYXRlKVxuICAgIHN0YXRlLnByZW1vdmFibGUuZGVzdHMgPSBzdGF0ZS5wcmVtb3ZhYmxlLmdlbmVyYXRlKHN0YXRlLnNlbGVjdGVkLCBzdGF0ZS5waWVjZXMpO1xuICBlbHNlIGlmIChcbiAgICBzdGF0ZS5zZWxlY3RlZFBpZWNlICYmXG4gICAgaXNQcmVkcm9wcGFibGUoc3RhdGUsIHN0YXRlLnNlbGVjdGVkUGllY2UpICYmXG4gICAgc3RhdGUucHJlZHJvcHBhYmxlLmdlbmVyYXRlXG4gIClcbiAgICBzdGF0ZS5wcmVkcm9wcGFibGUuZGVzdHMgPSBzdGF0ZS5wcmVkcm9wcGFibGUuZ2VuZXJhdGUoc3RhdGUuc2VsZWN0ZWRQaWVjZSwgc3RhdGUucGllY2VzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuc2VsZWN0KHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIHN0YXRlLnNlbGVjdGVkID1cbiAgICBzdGF0ZS5zZWxlY3RlZFBpZWNlID1cbiAgICBzdGF0ZS5wcmVtb3ZhYmxlLmRlc3RzID1cbiAgICBzdGF0ZS5wcmVkcm9wcGFibGUuZGVzdHMgPVxuICAgIHN0YXRlLnByb21vdGlvbi5jdXJyZW50ID1cbiAgICAgIHVuZGVmaW5lZDtcbiAgc3RhdGUuZHJvcHBhYmxlLnNwYXJlID0gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGlzTW92YWJsZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgb3JpZzogc2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzLmdldChvcmlnKTtcbiAgcmV0dXJuIChcbiAgICAhIXBpZWNlICYmXG4gICAgKHN0YXRlLmFjdGl2ZUNvbG9yID09PSAnYm90aCcgfHxcbiAgICAgIChzdGF0ZS5hY3RpdmVDb2xvciA9PT0gcGllY2UuY29sb3IgJiYgc3RhdGUudHVybkNvbG9yID09PSBwaWVjZS5jb2xvcikpXG4gICk7XG59XG5cbmZ1bmN0aW9uIGlzRHJvcHBhYmxlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIHNwYXJlOiBib29sZWFuKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgKHNwYXJlIHx8IG51bWJlckluSGFuZChzdGF0ZSwgcGllY2UpID4gMCkgJiZcbiAgICAoc3RhdGUuYWN0aXZlQ29sb3IgPT09ICdib3RoJyB8fFxuICAgICAgKHN0YXRlLmFjdGl2ZUNvbG9yID09PSBwaWVjZS5jb2xvciAmJiBzdGF0ZS50dXJuQ29sb3IgPT09IHBpZWNlLmNvbG9yKSlcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbk1vdmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgb3JpZyAhPT0gZGVzdCAmJlxuICAgIGlzTW92YWJsZShzdGF0ZSwgb3JpZykgJiZcbiAgICAoc3RhdGUubW92YWJsZS5mcmVlIHx8ICEhc3RhdGUubW92YWJsZS5kZXN0cz8uZ2V0KG9yaWcpPy5pbmNsdWRlcyhkZXN0KSlcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbkRyb3Aoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwgZGVzdDogc2cuS2V5KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgaXNEcm9wcGFibGUoc3RhdGUsIHBpZWNlLCBzdGF0ZS5kcm9wcGFibGUuc3BhcmUpICYmXG4gICAgKHN0YXRlLmRyb3BwYWJsZS5mcmVlIHx8XG4gICAgICBzdGF0ZS5kcm9wcGFibGUuc3BhcmUgfHxcbiAgICAgICEhc3RhdGUuZHJvcHBhYmxlLmRlc3RzPy5nZXQocGllY2VOYW1lT2YocGllY2UpKT8uaW5jbHVkZXMoZGVzdCkpXG4gICk7XG59XG5cbmZ1bmN0aW9uIGNhbk1vdmVQcm9tb3RlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQob3JpZyk7XG4gIHJldHVybiAhIXBpZWNlICYmIHN0YXRlLnByb21vdGlvbi5tb3ZlUHJvbW90aW9uRGlhbG9nKG9yaWcsIGRlc3QpO1xufVxuXG5mdW5jdGlvbiBjYW5Ecm9wUHJvbW90ZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSk6IGJvb2xlYW4ge1xuICByZXR1cm4gIXN0YXRlLmRyb3BwYWJsZS5zcGFyZSAmJiBzdGF0ZS5wcm9tb3Rpb24uZHJvcFByb21vdGlvbkRpYWxvZyhwaWVjZSwga2V5KTtcbn1cblxuZnVuY3Rpb24gaXNQcmVtb3ZhYmxlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBvcmlnOiBzZy5LZXkpOiBib29sZWFuIHtcbiAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXMuZ2V0KG9yaWcpO1xuICByZXR1cm4gKFxuICAgICEhcGllY2UgJiZcbiAgICBzdGF0ZS5wcmVtb3ZhYmxlLmVuYWJsZWQgJiZcbiAgICBzdGF0ZS5hY3RpdmVDb2xvciA9PT0gcGllY2UuY29sb3IgJiZcbiAgICBzdGF0ZS50dXJuQ29sb3IgIT09IHBpZWNlLmNvbG9yXG4gICk7XG59XG5cbmZ1bmN0aW9uIGlzUHJlZHJvcHBhYmxlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBudW1iZXJJbkhhbmQoc3RhdGUsIHBpZWNlKSA+IDAgJiZcbiAgICBzdGF0ZS5wcmVkcm9wcGFibGUuZW5hYmxlZCAmJlxuICAgIHN0YXRlLmFjdGl2ZUNvbG9yID09PSBwaWVjZS5jb2xvciAmJlxuICAgIHN0YXRlLnR1cm5Db2xvciAhPT0gcGllY2UuY29sb3JcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhblByZW1vdmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgb3JpZyAhPT0gZGVzdCAmJlxuICAgIGlzUHJlbW92YWJsZShzdGF0ZSwgb3JpZykgJiZcbiAgICAhIXN0YXRlLnByZW1vdmFibGUuZ2VuZXJhdGUgJiZcbiAgICBzdGF0ZS5wcmVtb3ZhYmxlLmdlbmVyYXRlKG9yaWcsIHN0YXRlLnBpZWNlcykuaW5jbHVkZXMoZGVzdClcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhblByZWRyb3Aoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwgZGVzdDogc2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IGRlc3RQaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQoZGVzdCk7XG4gIHJldHVybiAoXG4gICAgaXNQcmVkcm9wcGFibGUoc3RhdGUsIHBpZWNlKSAmJlxuICAgICghZGVzdFBpZWNlIHx8IGRlc3RQaWVjZS5jb2xvciAhPT0gc3RhdGUuYWN0aXZlQ29sb3IpICYmXG4gICAgISFzdGF0ZS5wcmVkcm9wcGFibGUuZ2VuZXJhdGUgJiZcbiAgICBzdGF0ZS5wcmVkcm9wcGFibGUuZ2VuZXJhdGUocGllY2UsIHN0YXRlLnBpZWNlcykuaW5jbHVkZXMoZGVzdClcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRHJhZ2dhYmxlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGZyb21IYW5kID0gZmFsc2UpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBzdGF0ZS5kcmFnZ2FibGUuZW5hYmxlZCAmJlxuICAgIChzdGF0ZS5hY3RpdmVDb2xvciA9PT0gJ2JvdGgnIHx8XG4gICAgICAoc3RhdGUuYWN0aXZlQ29sb3IgPT09IHBpZWNlLmNvbG9yICYmXG4gICAgICAgIChzdGF0ZS50dXJuQ29sb3IgPT09IHBpZWNlLmNvbG9yIHx8XG4gICAgICAgICAgKGZyb21IYW5kID8gc3RhdGUucHJlZHJvcHBhYmxlLmVuYWJsZWQgOiBzdGF0ZS5wcmVtb3ZhYmxlLmVuYWJsZWQpKSkpXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwbGF5UHJlbW92ZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IGJvb2xlYW4ge1xuICBjb25zdCBtb3ZlID0gc3RhdGUucHJlbW92YWJsZS5jdXJyZW50O1xuICBpZiAoIW1vdmUpIHJldHVybiBmYWxzZTtcbiAgY29uc3Qgb3JpZyA9IG1vdmUub3JpZztcbiAgY29uc3QgZGVzdCA9IG1vdmUuZGVzdDtcbiAgY29uc3QgcHJvbSA9IG1vdmUucHJvbTtcbiAgbGV0IHN1Y2Nlc3MgPSBmYWxzZTtcbiAgaWYgKGNhbk1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYmFzZVVzZXJNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0LCBwcm9tKTtcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICBjb25zdCBtZXRhZGF0YTogc2cuTW92ZU1ldGFkYXRhID0geyBwcmVtYWRlOiB0cnVlIH07XG4gICAgICBpZiAocmVzdWx0ICE9PSB0cnVlKSBtZXRhZGF0YS5jYXB0dXJlZCA9IHJlc3VsdDtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUubW92YWJsZS5ldmVudHMuYWZ0ZXIsIG9yaWcsIGRlc3QsIHByb20sIG1ldGFkYXRhKTtcbiAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgIH1cbiAgfVxuICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICByZXR1cm4gc3VjY2Vzcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBsYXlQcmVkcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogYm9vbGVhbiB7XG4gIGNvbnN0IGRyb3AgPSBzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudDtcbiAgaWYgKCFkcm9wKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IHBpZWNlID0gZHJvcC5waWVjZTtcbiAgY29uc3Qga2V5ID0gZHJvcC5rZXk7XG4gIGNvbnN0IHByb20gPSBkcm9wLnByb207XG4gIGxldCBzdWNjZXNzID0gZmFsc2U7XG4gIGlmIChjYW5Ecm9wKHN0YXRlLCBwaWVjZSwga2V5KSkge1xuICAgIGlmIChiYXNlVXNlckRyb3Aoc3RhdGUsIHBpZWNlLCBrZXksIHByb20pKSB7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmRyb3BwYWJsZS5ldmVudHMuYWZ0ZXIsIHBpZWNlLCBrZXksIHByb20sIHsgcHJlbWFkZTogdHJ1ZSB9KTtcbiAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgIH1cbiAgfVxuICB1bnNldFByZWRyb3Aoc3RhdGUpO1xuICByZXR1cm4gc3VjY2Vzcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbmNlbE1vdmVPckRyb3Aoc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiB2b2lkIHtcbiAgdW5zZXRQcmVtb3ZlKHN0YXRlKTtcbiAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbiAgdW5zZWxlY3Qoc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsUHJvbW90aW9uKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIGlmICghc3RhdGUucHJvbW90aW9uLmN1cnJlbnQpIHJldHVybjtcblxuICB1bnNlbGVjdChzdGF0ZSk7XG4gIHN0YXRlLnByb21vdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICBzdGF0ZS5ob3ZlcmVkID0gdW5kZWZpbmVkO1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByb21vdGlvbi5ldmVudHMuY2FuY2VsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0b3Aoc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiB2b2lkIHtcbiAgc3RhdGUuYWN0aXZlQ29sb3IgPVxuICAgIHN0YXRlLm1vdmFibGUuZGVzdHMgPVxuICAgIHN0YXRlLmRyb3BwYWJsZS5kZXN0cyA9XG4gICAgc3RhdGUuZHJhZ2dhYmxlLmN1cnJlbnQgPVxuICAgIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID1cbiAgICBzdGF0ZS5wcm9tb3Rpb24uY3VycmVudCA9XG4gICAgc3RhdGUuaG92ZXJlZCA9XG4gICAgICB1bmRlZmluZWQ7XG4gIGNhbmNlbE1vdmVPckRyb3Aoc3RhdGUpO1xufVxuIiwgImltcG9ydCB7IGZpbGVzLCByYW5rcyB9IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyBwb3Mya2V5IH0gZnJvbSAnLi91dGlsLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGluZmVyRGltZW5zaW9ucyhib2FyZFNmZW46IHNnLkJvYXJkU2Zlbik6IHNnLkRpbWVuc2lvbnMge1xuICBjb25zdCByYW5rcyA9IGJvYXJkU2Zlbi5zcGxpdCgnLycpO1xuICBjb25zdCBmaXJzdEZpbGUgPSByYW5rc1swXS5zcGxpdCgnJyk7XG4gIGxldCBmaWxlc0NudCA9IDA7XG4gIGxldCBjbnQgPSAwO1xuICBmb3IgKGNvbnN0IGMgb2YgZmlyc3RGaWxlKSB7XG4gICAgY29uc3QgbmIgPSBjLmNoYXJDb2RlQXQoMCk7XG4gICAgaWYgKG5iIDwgNTggJiYgbmIgPiA0NykgY250ID0gY250ICogMTAgKyBuYiAtIDQ4O1xuICAgIGVsc2UgaWYgKGMgIT09ICcrJykge1xuICAgICAgZmlsZXNDbnQgKz0gY250ICsgMTtcbiAgICAgIGNudCA9IDA7XG4gICAgfVxuICB9XG4gIGZpbGVzQ250ICs9IGNudDtcbiAgcmV0dXJuIHsgZmlsZXM6IGZpbGVzQ250LCByYW5rczogcmFua3MubGVuZ3RoIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZmVuVG9Cb2FyZChcbiAgc2Zlbjogc2cuQm9hcmRTZmVuLFxuICBkaW1zOiBzZy5EaW1lbnNpb25zLFxuICBmcm9tRm9yc3l0aD86IChmb3JzeXRoOiBzdHJpbmcpID0+IHNnLlJvbGVTdHJpbmcgfCB1bmRlZmluZWQsXG4pOiBzZy5QaWVjZXMge1xuICBjb25zdCBzZmVuUGFyc2VyID0gZnJvbUZvcnN5dGggfHwgc3RhbmRhcmRGcm9tRm9yc3l0aDtcbiAgY29uc3QgcGllY2VzOiBzZy5QaWVjZXMgPSBuZXcgTWFwKCk7XG4gIGxldCB4ID0gZGltcy5maWxlcyAtIDE7XG4gIGxldCB5ID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgc3dpdGNoIChzZmVuW2ldKSB7XG4gICAgICBjYXNlICcgJzpcbiAgICAgIGNhc2UgJ18nOlxuICAgICAgICByZXR1cm4gcGllY2VzO1xuICAgICAgY2FzZSAnLyc6XG4gICAgICAgICsreTtcbiAgICAgICAgaWYgKHkgPiBkaW1zLnJhbmtzIC0gMSkgcmV0dXJuIHBpZWNlcztcbiAgICAgICAgeCA9IGRpbXMuZmlsZXMgLSAxO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgY29uc3QgbmIxID0gc2ZlbltpXS5jaGFyQ29kZUF0KDApO1xuICAgICAgICBjb25zdCBuYjIgPSBzZmVuW2kgKyAxXSAmJiBzZmVuW2kgKyAxXS5jaGFyQ29kZUF0KDApO1xuICAgICAgICBpZiAobmIxIDwgNTggJiYgbmIxID4gNDcpIHtcbiAgICAgICAgICBpZiAobmIyICYmIG5iMiA8IDU4ICYmIG5iMiA+IDQ3KSB7XG4gICAgICAgICAgICB4IC09IChuYjEgLSA0OCkgKiAxMCArIChuYjIgLSA0OCk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgfSBlbHNlIHggLT0gbmIxIC0gNDg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3Qgcm9sZVN0ciA9IHNmZW5baV0gPT09ICcrJyAmJiBzZmVuLmxlbmd0aCA+IGkgKyAxID8gYCske3NmZW5bKytpXX1gIDogc2ZlbltpXTtcbiAgICAgICAgICBjb25zdCByb2xlID0gc2ZlblBhcnNlcihyb2xlU3RyKTtcbiAgICAgICAgICBpZiAoeCA+PSAwICYmIHJvbGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbG9yID0gcm9sZVN0ciA9PT0gcm9sZVN0ci50b0xvd2VyQ2FzZSgpID8gJ2dvdGUnIDogJ3NlbnRlJztcbiAgICAgICAgICAgIHBpZWNlcy5zZXQocG9zMmtleShbeCwgeV0pLCB7XG4gICAgICAgICAgICAgIHJvbGU6IHJvbGUsXG4gICAgICAgICAgICAgIGNvbG9yOiBjb2xvcixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICAtLXg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBpZWNlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJvYXJkVG9TZmVuKFxuICBwaWVjZXM6IHNnLlBpZWNlcyxcbiAgZGltczogc2cuRGltZW5zaW9ucyxcbiAgdG9Gb3JzeXRoPzogKHJvbGU6IHNnLlJvbGVTdHJpbmcpID0+IHN0cmluZyB8IHVuZGVmaW5lZCxcbik6IHNnLkJvYXJkU2ZlbiB7XG4gIGNvbnN0IHNmZW5SZW5kZXJlciA9IHRvRm9yc3l0aCB8fCBzdGFuZGFyZFRvRm9yc3l0aDtcbiAgY29uc3QgcmV2ZXJzZWRGaWxlcyA9IGZpbGVzLnNsaWNlKDAsIGRpbXMuZmlsZXMpLnJldmVyc2UoKTtcbiAgcmV0dXJuIHJhbmtzXG4gICAgLnNsaWNlKDAsIGRpbXMucmFua3MpXG4gICAgLm1hcCgoeSkgPT5cbiAgICAgIHJldmVyc2VkRmlsZXNcbiAgICAgICAgLm1hcCgoeCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHBpZWNlID0gcGllY2VzLmdldCgoeCArIHkpIGFzIHNnLktleSk7XG4gICAgICAgICAgY29uc3QgZm9yc3l0aCA9IHBpZWNlICYmIHNmZW5SZW5kZXJlcihwaWVjZS5yb2xlKTtcbiAgICAgICAgICBpZiAoZm9yc3l0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHBpZWNlLmNvbG9yID09PSAnc2VudGUnID8gZm9yc3l0aC50b1VwcGVyQ2FzZSgpIDogZm9yc3l0aC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIH0gZWxzZSByZXR1cm4gJzEnO1xuICAgICAgICB9KVxuICAgICAgICAuam9pbignJyksXG4gICAgKVxuICAgIC5qb2luKCcvJylcbiAgICAucmVwbGFjZSgvMXsyLH0vZywgKHMpID0+IHMubGVuZ3RoLnRvU3RyaW5nKCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2ZlblRvSGFuZHMoXG4gIHNmZW46IHNnLkhhbmRzU2ZlbixcbiAgZnJvbUZvcnN5dGg/OiAoZm9yc3l0aDogc3RyaW5nKSA9PiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkLFxuKTogc2cuSGFuZHMge1xuICBjb25zdCBzZmVuUGFyc2VyID0gZnJvbUZvcnN5dGggfHwgc3RhbmRhcmRGcm9tRm9yc3l0aDtcbiAgY29uc3Qgc2VudGU6IHNnLkhhbmQgPSBuZXcgTWFwKCk7XG4gIGNvbnN0IGdvdGU6IHNnLkhhbmQgPSBuZXcgTWFwKCk7XG5cbiAgbGV0IHRtcE51bSA9IDA7XG4gIGxldCBudW0gPSAxO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHNmZW4ubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBuYiA9IHNmZW5baV0uY2hhckNvZGVBdCgwKTtcbiAgICBpZiAobmIgPCA1OCAmJiBuYiA+IDQ3KSB7XG4gICAgICB0bXBOdW0gPSB0bXBOdW0gKiAxMCArIG5iIC0gNDg7XG4gICAgICBudW0gPSB0bXBOdW07XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHJvbGVTdHIgPSBzZmVuW2ldID09PSAnKycgJiYgc2Zlbi5sZW5ndGggPiBpICsgMSA/IGArJHtzZmVuWysraV19YCA6IHNmZW5baV07XG4gICAgICBjb25zdCByb2xlID0gc2ZlblBhcnNlcihyb2xlU3RyKTtcbiAgICAgIGlmIChyb2xlKSB7XG4gICAgICAgIGNvbnN0IGNvbG9yID0gcm9sZVN0ciA9PT0gcm9sZVN0ci50b0xvd2VyQ2FzZSgpID8gJ2dvdGUnIDogJ3NlbnRlJztcbiAgICAgICAgaWYgKGNvbG9yID09PSAnc2VudGUnKSBzZW50ZS5zZXQocm9sZSwgKHNlbnRlLmdldChyb2xlKSB8fCAwKSArIG51bSk7XG4gICAgICAgIGVsc2UgZ290ZS5zZXQocm9sZSwgKGdvdGUuZ2V0KHJvbGUpIHx8IDApICsgbnVtKTtcbiAgICAgIH1cbiAgICAgIHRtcE51bSA9IDA7XG4gICAgICBudW0gPSAxO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgTWFwKFtcbiAgICBbJ3NlbnRlJywgc2VudGVdLFxuICAgIFsnZ290ZScsIGdvdGVdLFxuICBdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRzVG9TZmVuKFxuICBoYW5kczogc2cuSGFuZHMsXG4gIHJvbGVzOiBzZy5Sb2xlU3RyaW5nW10sXG4gIHRvRm9yc3l0aD86IChyb2xlOiBzZy5Sb2xlU3RyaW5nKSA9PiBzdHJpbmcgfCB1bmRlZmluZWQsXG4pOiBzZy5IYW5kc1NmZW4ge1xuICBjb25zdCBzZmVuUmVuZGVyZXIgPSB0b0ZvcnN5dGggfHwgc3RhbmRhcmRUb0ZvcnN5dGg7XG5cbiAgbGV0IHNlbnRlSGFuZFN0ciA9ICcnO1xuICBsZXQgZ290ZUhhbmRTdHIgPSAnJztcbiAgZm9yIChjb25zdCByb2xlIG9mIHJvbGVzKSB7XG4gICAgY29uc3QgZm9yc3l0aCA9IHNmZW5SZW5kZXJlcihyb2xlKTtcbiAgICBpZiAoZm9yc3l0aCkge1xuICAgICAgY29uc3Qgc2VudGVDbnQgPSBoYW5kcy5nZXQoJ3NlbnRlJyk/LmdldChyb2xlKTtcbiAgICAgIGNvbnN0IGdvdGVDbnQgPSBoYW5kcy5nZXQoJ2dvdGUnKT8uZ2V0KHJvbGUpO1xuICAgICAgaWYgKHNlbnRlQ250KSBzZW50ZUhhbmRTdHIgKz0gc2VudGVDbnQgPiAxID8gc2VudGVDbnQudG9TdHJpbmcoKSArIGZvcnN5dGggOiBmb3JzeXRoO1xuICAgICAgaWYgKGdvdGVDbnQpIGdvdGVIYW5kU3RyICs9IGdvdGVDbnQgPiAxID8gZ290ZUNudC50b1N0cmluZygpICsgZm9yc3l0aCA6IGZvcnN5dGg7XG4gICAgfVxuICB9XG4gIGlmIChzZW50ZUhhbmRTdHIgfHwgZ290ZUhhbmRTdHIpIHJldHVybiBzZW50ZUhhbmRTdHIudG9VcHBlckNhc2UoKSArIGdvdGVIYW5kU3RyLnRvTG93ZXJDYXNlKCk7XG4gIGVsc2UgcmV0dXJuICctJztcbn1cblxuZnVuY3Rpb24gc3RhbmRhcmRGcm9tRm9yc3l0aChmb3JzeXRoOiBzdHJpbmcpOiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgc3dpdGNoIChmb3JzeXRoLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdwJzpcbiAgICAgIHJldHVybiAncGF3bic7XG4gICAgY2FzZSAnbCc6XG4gICAgICByZXR1cm4gJ2xhbmNlJztcbiAgICBjYXNlICduJzpcbiAgICAgIHJldHVybiAna25pZ2h0JztcbiAgICBjYXNlICdzJzpcbiAgICAgIHJldHVybiAnc2lsdmVyJztcbiAgICBjYXNlICdnJzpcbiAgICAgIHJldHVybiAnZ29sZCc7XG4gICAgY2FzZSAnYic6XG4gICAgICByZXR1cm4gJ2Jpc2hvcCc7XG4gICAgY2FzZSAncic6XG4gICAgICByZXR1cm4gJ3Jvb2snO1xuICAgIGNhc2UgJytwJzpcbiAgICAgIHJldHVybiAndG9raW4nO1xuICAgIGNhc2UgJytsJzpcbiAgICAgIHJldHVybiAncHJvbW90ZWRsYW5jZSc7XG4gICAgY2FzZSAnK24nOlxuICAgICAgcmV0dXJuICdwcm9tb3RlZGtuaWdodCc7XG4gICAgY2FzZSAnK3MnOlxuICAgICAgcmV0dXJuICdwcm9tb3RlZHNpbHZlcic7XG4gICAgY2FzZSAnK2InOlxuICAgICAgcmV0dXJuICdob3JzZSc7XG4gICAgY2FzZSAnK3InOlxuICAgICAgcmV0dXJuICdkcmFnb24nO1xuICAgIGNhc2UgJ2snOlxuICAgICAgcmV0dXJuICdraW5nJztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuO1xuICB9XG59XG5leHBvcnQgZnVuY3Rpb24gc3RhbmRhcmRUb0ZvcnN5dGgocm9sZTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgc3dpdGNoIChyb2xlKSB7XG4gICAgY2FzZSAncGF3bic6XG4gICAgICByZXR1cm4gJ3AnO1xuICAgIGNhc2UgJ2xhbmNlJzpcbiAgICAgIHJldHVybiAnbCc7XG4gICAgY2FzZSAna25pZ2h0JzpcbiAgICAgIHJldHVybiAnbic7XG4gICAgY2FzZSAnc2lsdmVyJzpcbiAgICAgIHJldHVybiAncyc7XG4gICAgY2FzZSAnZ29sZCc6XG4gICAgICByZXR1cm4gJ2cnO1xuICAgIGNhc2UgJ2Jpc2hvcCc6XG4gICAgICByZXR1cm4gJ2InO1xuICAgIGNhc2UgJ3Jvb2snOlxuICAgICAgcmV0dXJuICdyJztcbiAgICBjYXNlICd0b2tpbic6XG4gICAgICByZXR1cm4gJytwJztcbiAgICBjYXNlICdwcm9tb3RlZGxhbmNlJzpcbiAgICAgIHJldHVybiAnK2wnO1xuICAgIGNhc2UgJ3Byb21vdGVka25pZ2h0JzpcbiAgICAgIHJldHVybiAnK24nO1xuICAgIGNhc2UgJ3Byb21vdGVkc2lsdmVyJzpcbiAgICAgIHJldHVybiAnK3MnO1xuICAgIGNhc2UgJ2hvcnNlJzpcbiAgICAgIHJldHVybiAnK2InO1xuICAgIGNhc2UgJ2RyYWdvbic6XG4gICAgICByZXR1cm4gJytyJztcbiAgICBjYXNlICdraW5nJzpcbiAgICAgIHJldHVybiAnayc7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybjtcbiAgfVxufVxuIiwgImltcG9ydCB7IHNldENoZWNrcywgc2V0UHJlRGVzdHMsIHVuc2VsZWN0IH0gZnJvbSAnLi9ib2FyZC5qcyc7XG5pbXBvcnQgeyBpbmZlckRpbWVuc2lvbnMsIHNmZW5Ub0JvYXJkLCBzZmVuVG9IYW5kcyB9IGZyb20gJy4vc2Zlbi5qcyc7XG5pbXBvcnQgdHlwZSB7IEhlYWRsZXNzU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyBzYW1lUGllY2UgfSBmcm9tICcuL3V0aWwuanMnO1xuXG50eXBlIERlZXBQYXJ0aWFsPFQsIEF0b21pYyA9IG5ldmVyPiA9IFQgZXh0ZW5kc1xuICB8IEF0b21pY1xuICB8ICgoLi4uYXJnczogbmV2ZXJbXSkgPT4gdW5rbm93bilcbiAgfCByZWFkb25seSB1bmtub3duW11cbiAgfCBSZWFkb25seU1hcDx1bmtub3duLCB1bmtub3duPlxuICB8IFJlYWRvbmx5U2V0PHVua25vd24+XG4gID8gVFxuICA6IFQgZXh0ZW5kcyBvYmplY3RcbiAgICA/IHsgW0sgaW4ga2V5b2YgVF0/OiBEZWVwUGFydGlhbDxUW0tdLCBBdG9taWM+IH1cbiAgICA6IFQ7XG5cbi8vIEtlZXAgaW50ZXJuYWwgZmllbGRzIG91dCBvZiBjb25maWcsIGluY2x1ZGluZyB0aG9zZSBuZXN0ZWQgYWxvbmdzaWRlIG9wdGlvbnMuXG50eXBlIENvbmZpZ3VyYWJsZVN0YXRlID0gT21pdDxcbiAgSGVhZGxlc3NTdGF0ZSxcbiAgfCAncGllY2VzJ1xuICB8ICdkaW1lbnNpb25zJ1xuICB8ICdjaGVja3MnXG4gIHwgJ2hvdmVyZWQnXG4gIHwgJ2FuaW1hdGlvbidcbiAgfCAnaGFuZHMnXG4gIHwgJ3ByZW1vdmFibGUnXG4gIHwgJ3ByZWRyb3BwYWJsZSdcbiAgfCAnZHJhZ2dhYmxlJ1xuICB8ICdrZXlib2FyZCdcbiAgfCAncHJvbW90aW9uJ1xuICB8ICdkcmF3YWJsZSdcbj4gJiB7XG4gIGFuaW1hdGlvbjogT21pdDxIZWFkbGVzc1N0YXRlWydhbmltYXRpb24nXSwgJ2N1cnJlbnQnPjtcbiAgaGFuZHM6IE9taXQ8SGVhZGxlc3NTdGF0ZVsnaGFuZHMnXSwgJ2hhbmRNYXAnPjtcbiAgcHJlbW92YWJsZTogT21pdDxIZWFkbGVzc1N0YXRlWydwcmVtb3ZhYmxlJ10sICdjdXJyZW50JyB8ICdkZXN0cyc+O1xuICBwcmVkcm9wcGFibGU6IE9taXQ8SGVhZGxlc3NTdGF0ZVsncHJlZHJvcHBhYmxlJ10sICdjdXJyZW50JyB8ICdkZXN0cyc+O1xuICBkcmFnZ2FibGU6IE9taXQ8SGVhZGxlc3NTdGF0ZVsnZHJhZ2dhYmxlJ10sICdjdXJyZW50Jz47XG4gIGtleWJvYXJkOiBQaWNrPEhlYWRsZXNzU3RhdGVbJ2tleWJvYXJkJ10sICdlbmFibGVkJz47XG4gIHByb21vdGlvbjogT21pdDxIZWFkbGVzc1N0YXRlWydwcm9tb3Rpb24nXSwgJ2N1cnJlbnQnIHwgJ3ByZXZQcm9tb3Rpb25IYXNoJz47XG4gIGRyYXdhYmxlOiBPbWl0PEhlYWRsZXNzU3RhdGVbJ2RyYXdhYmxlJ10sICdjdXJyZW50JyB8ICdwcmV2U3ZnSGFzaCcgfCAncGllY2UnPjtcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29uZmlnIGV4dGVuZHMgRGVlcFBhcnRpYWw8Q29uZmlndXJhYmxlU3RhdGUsIHNnLlBpZWNlPiB7XG4gIHNmZW4/OiB7XG4gICAgYm9hcmQ/OiBzZy5Cb2FyZFNmZW47IC8vIHBpZWNlcyBvbiB0aGUgYm9hcmQgaW4gRm9yc3l0aCBub3RhdGlvblxuICAgIGhhbmRzPzogc2cuSGFuZHNTZmVuOyAvLyBwaWVjZXMgaW4gaGFuZCBpbiBGb3JzeXRoIG5vdGF0aW9uXG4gIH07XG4gIGNoZWNrcz86IHNnLktleVtdIHwgc2cuQ29sb3IgfCBib29sZWFuOyAvLyBzcXVhcmVzIGN1cnJlbnRseSBpbiBjaGVjayBbXCI1YVwiXSwgY29sb3IgaW4gY2hlY2sgKHNlZSBoaWdobGlnaHQuY2hlY2tSb2xlcykgb3IgYm9vbGVhbiBmb3IgY3VycmVudCB0dXJuIGNvbG9yXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseUFuaW1hdGlvbihzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgY29uZmlnOiBDb25maWcpOiB2b2lkIHtcbiAgaWYgKGNvbmZpZy5hbmltYXRpb24pIHtcbiAgICBkZWVwTWVyZ2Uoc3RhdGUuYW5pbWF0aW9uLCBjb25maWcuYW5pbWF0aW9uKTtcbiAgICAvLyBubyBuZWVkIGZvciBzdWNoIHNob3J0IGFuaW1hdGlvbnNcbiAgICBpZiAoKHN0YXRlLmFuaW1hdGlvbi5kdXJhdGlvbiB8fCAwKSA8IDcwKSBzdGF0ZS5hbmltYXRpb24uZW5hYmxlZCA9IGZhbHNlO1xuICAgIGlmICghc3RhdGUuYW5pbWF0aW9uLmVuYWJsZWQpIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25maWd1cmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIGNvbmZpZzogQ29uZmlnKTogdm9pZCB7XG4gIC8vIGRvbid0IG1lcmdlLCBqdXN0IG92ZXJyaWRlLlxuICBpZiAoY29uZmlnLm1vdmFibGU/LmRlc3RzKSBzdGF0ZS5tb3ZhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICBpZiAoY29uZmlnLmRyb3BwYWJsZT8uZGVzdHMpIHN0YXRlLmRyb3BwYWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbiAgaWYgKGNvbmZpZy5kcmF3YWJsZT8uc2hhcGVzKSBzdGF0ZS5kcmF3YWJsZS5zaGFwZXMgPSBbXTtcbiAgaWYgKGNvbmZpZy5kcmF3YWJsZT8uYXV0b1NoYXBlcykgc3RhdGUuZHJhd2FibGUuYXV0b1NoYXBlcyA9IFtdO1xuICBpZiAoY29uZmlnLmRyYXdhYmxlPy5zcXVhcmVzKSBzdGF0ZS5kcmF3YWJsZS5zcXVhcmVzID0gW107XG4gIGlmIChjb25maWcuaGFuZHM/LnJvbGVzKSBzdGF0ZS5oYW5kcy5yb2xlcyA9IFtdO1xuXG4gIGRlZXBNZXJnZShzdGF0ZSwgY29uZmlnKTtcblxuICAvLyBpZiBhIHNmZW4gd2FzIHByb3ZpZGVkLCByZXBsYWNlIHRoZSBwaWVjZXMsIGV4Y2VwdCB0aGUgY3VycmVudGx5IGRyYWdnZWQgb25lXG4gIGlmIChjb25maWcuc2Zlbj8uYm9hcmQpIHtcbiAgICBzdGF0ZS5kaW1lbnNpb25zID0gaW5mZXJEaW1lbnNpb25zKGNvbmZpZy5zZmVuLmJvYXJkKTtcbiAgICBzdGF0ZS5waWVjZXMgPSBzZmVuVG9Cb2FyZChjb25maWcuc2Zlbi5ib2FyZCwgc3RhdGUuZGltZW5zaW9ucywgc3RhdGUuZm9yc3l0aC5mcm9tRm9yc3l0aCk7XG4gICAgaWYgKHN0YXRlLnByb21vdGlvbi5jdXJyZW50KSB7XG4gICAgICAvLyBLZWVwIHBlbmRpbmcgcHJlbW92ZSBwcm9tb3Rpb24gd2hlbiB0aGUgc2VsZWN0ZWQgcGllY2Ugc3Vydml2ZXMgdGhlIHVwZGF0ZS5cbiAgICAgIGNvbnN0IHBpZWNlID0gc3RhdGUuc2VsZWN0ZWQgPyBzdGF0ZS5waWVjZXMuZ2V0KHN0YXRlLnNlbGVjdGVkKSA6IHN0YXRlLnNlbGVjdGVkUGllY2U7XG4gICAgICBpZiAoIXBpZWNlIHx8ICFzYW1lUGllY2UocGllY2UsIHN0YXRlLnByb21vdGlvbi5jdXJyZW50LnBpZWNlKSkgdW5zZWxlY3Qoc3RhdGUpO1xuICAgIH1cbiAgICBzdGF0ZS5kcmF3YWJsZS5zaGFwZXMgPSBjb25maWcuZHJhd2FibGU/LnNoYXBlcyB8fCBbXTtcbiAgfVxuXG4gIGlmIChjb25maWcuc2Zlbj8uaGFuZHMpIHtcbiAgICBzdGF0ZS5oYW5kcy5oYW5kTWFwID0gc2ZlblRvSGFuZHMoY29uZmlnLnNmZW4uaGFuZHMsIHN0YXRlLmZvcnN5dGguZnJvbUZvcnN5dGgpO1xuICB9XG5cbiAgLy8gYXBwbHkgY29uZmlnIHZhbHVlcyB0aGF0IGNvdWxkIGJlIHVuZGVmaW5lZCB5ZXQgbWVhbmluZ2Z1bFxuICBpZiAoJ2NoZWNrcycgaW4gY29uZmlnKSBzZXRDaGVja3Moc3RhdGUsIGNvbmZpZy5jaGVja3MgfHwgZmFsc2UpO1xuICBpZiAoJ2xhc3RQaWVjZScgaW4gY29uZmlnICYmICFjb25maWcubGFzdFBpZWNlKSBzdGF0ZS5sYXN0UGllY2UgPSB1bmRlZmluZWQ7XG5cbiAgLy8gaW4gY2FzZSBvZiBkcm9wIGxhc3QgbW92ZSwgdGhlcmUncyBhIHNpbmdsZSBzcXVhcmUuXG4gIC8vIGlmIHRoZSBwcmV2aW91cyBsYXN0IG1vdmUgaGFkIHR3byBzcXVhcmVzLFxuICAvLyB0aGUgbWVyZ2UgYWxnb3JpdGhtIHdpbGwgaW5jb3JyZWN0bHkga2VlcCB0aGUgc2Vjb25kIHNxdWFyZS5cbiAgaWYgKCdsYXN0RGVzdHMnIGluIGNvbmZpZyAmJiAhY29uZmlnLmxhc3REZXN0cykgc3RhdGUubGFzdERlc3RzID0gdW5kZWZpbmVkO1xuICBlbHNlIGlmIChjb25maWcubGFzdERlc3RzKSBzdGF0ZS5sYXN0RGVzdHMgPSBjb25maWcubGFzdERlc3RzO1xuXG4gIC8vIGZpeCBtb3ZlL3ByZW1vdmUgZGVzdHNcbiAgc2V0UHJlRGVzdHMoc3RhdGUpO1xuXG4gIGFwcGx5QW5pbWF0aW9uKHN0YXRlLCBjb25maWcpO1xufVxuXG5mdW5jdGlvbiBkZWVwTWVyZ2UoYmFzZTogYW55LCBleHRlbmQ6IGFueSk6IHZvaWQge1xuICBmb3IgKGNvbnN0IGtleSBpbiBleHRlbmQpIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGV4dGVuZCwga2V5KSkge1xuICAgICAgaWYgKFxuICAgICAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYmFzZSwga2V5KSAmJlxuICAgICAgICBpc1BsYWluT2JqZWN0KGJhc2Vba2V5XSkgJiZcbiAgICAgICAgaXNQbGFpbk9iamVjdChleHRlbmRba2V5XSlcbiAgICAgIClcbiAgICAgICAgZGVlcE1lcmdlKGJhc2Vba2V5XSwgZXh0ZW5kW2tleV0pO1xuICAgICAgZWxzZSBiYXNlW2tleV0gPSBleHRlbmRba2V5XTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNQbGFpbk9iamVjdChvOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIGlmICh0eXBlb2YgbyAhPT0gJ29iamVjdCcgfHwgbyA9PT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvKTtcbiAgcmV0dXJuIHByb3RvID09PSBPYmplY3QucHJvdG90eXBlIHx8IHByb3RvID09PSBudWxsO1xufVxuIiwgImltcG9ydCB0eXBlIHsgRHJhd0N1cnJlbnQsIERyYXdTaGFwZSwgRHJhd1NoYXBlUGllY2UgfSBmcm9tICcuL2RyYXcuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7XG4gIGNyZWF0ZUVsLFxuICBrZXkycG9zLFxuICBwaWVjZU5hbWVPZixcbiAgcG9zT2ZPdXRzaWRlRWwsXG4gIHBvc1RvVHJhbnNsYXRlUmVsLFxuICBzYW1lUGllY2UsXG4gIHNlbnRlUG92LFxuICB0cmFuc2xhdGVSZWwsXG59IGZyb20gJy4vdXRpbC5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTVkdFbGVtZW50KHRhZ05hbWU6IHN0cmluZyk6IFNWR0VsZW1lbnQge1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsIHRhZ05hbWUpO1xufVxuXG5pbnRlcmZhY2UgU2hhcGUge1xuICBzaGFwZTogRHJhd1NoYXBlO1xuICBoYXNoOiBIYXNoO1xuICBjdXJyZW50PzogYm9vbGVhbjtcbn1cblxudHlwZSBBcnJvd0Rlc3RzID0gTWFwPHNnLktleSB8IHNnLlBpZWNlTmFtZSwgbnVtYmVyPjsgLy8gaG93IG1hbnkgYXJyb3dzIGxhbmQgb24gYSBzcXVhcmVcblxudHlwZSBIYXNoID0gc3RyaW5nO1xuXG5jb25zdCBvdXRzaWRlQXJyb3dIYXNoID0gJ291dHNpZGVBcnJvdyc7XG5jb25zdCBkZWZhdWx0QnJ1c2ggPSAncHJpbWFyeSc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJTaGFwZXMoXG4gIHN0YXRlOiBTdGF0ZSxcbiAgc3ZnOiBTVkdFbGVtZW50LFxuICBjdXN0b21Tdmc6IFNWR0VsZW1lbnQsXG4gIGZyZWVQaWVjZXM6IEhUTUxFbGVtZW50LFxuKTogdm9pZCB7XG4gIGNvbnN0IGQgPSBzdGF0ZS5kcmF3YWJsZTtcbiAgY29uc3QgY3VyRCA9IGQuY3VycmVudDtcbiAgY29uc3QgY3VyID0gY3VyRD8uZGVzdCA/IChjdXJEIGFzIERyYXdTaGFwZSkgOiB1bmRlZmluZWQ7XG4gIGNvbnN0IG91dHNpZGVBcnJvdyA9ICEhY3VyRCAmJiAhY3VyO1xuICBjb25zdCBhcnJvd0Rlc3RzOiBBcnJvd0Rlc3RzID0gbmV3IE1hcCgpO1xuICBjb25zdCBwaWVjZU1hcCA9IG5ldyBNYXA8c2cuS2V5LCBEcmF3U2hhcGU+KCk7XG5cbiAgY29uc3QgaGFzaEJvdW5kcyA9IChwaWVjZTogc2cuUGllY2UpID0+IHtcbiAgICBjb25zdCBib3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpO1xuICAgIGNvbnN0IHBpZWNlQm91bmRzID0gc3RhdGUuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcygpLmdldChwaWVjZU5hbWVPZihwaWVjZSkpO1xuICAgIHJldHVybiBib3VuZHMgJiYgcGllY2VCb3VuZHNcbiAgICAgID8gW1xuICAgICAgICAgIGJvdW5kcy53aWR0aCxcbiAgICAgICAgICBib3VuZHMuaGVpZ2h0LFxuICAgICAgICAgIHBpZWNlQm91bmRzLmxlZnQgLSBib3VuZHMubGVmdCxcbiAgICAgICAgICBwaWVjZUJvdW5kcy50b3AgLSBib3VuZHMudG9wLFxuICAgICAgICAgIHBpZWNlQm91bmRzLndpZHRoLFxuICAgICAgICAgIHBpZWNlQm91bmRzLmhlaWdodCxcbiAgICAgICAgXS5qb2luKCc6JylcbiAgICAgIDogJyc7XG4gIH07XG5cbiAgZm9yIChjb25zdCBzIG9mIGQuc2hhcGVzLmNvbmNhdChkLmF1dG9TaGFwZXMpLmNvbmNhdChjdXIgPyBbY3VyXSA6IFtdKSkge1xuICAgIGNvbnN0IGRlc3ROYW1lID0gaXNQaWVjZShzLmRlc3QpID8gcGllY2VOYW1lT2Yocy5kZXN0KSA6IHMuZGVzdDtcbiAgICBpZiAoIXNhbWVQaWVjZU9yS2V5KHMuZGVzdCwgcy5vcmlnKSlcbiAgICAgIGFycm93RGVzdHMuc2V0KGRlc3ROYW1lLCAoYXJyb3dEZXN0cy5nZXQoZGVzdE5hbWUpIHx8IDApICsgMSk7XG4gIH1cblxuICBmb3IgKGNvbnN0IHMgb2YgZC5zaGFwZXMuY29uY2F0KGN1ciA/IFtjdXJdIDogW10pLmNvbmNhdChkLmF1dG9TaGFwZXMpKSB7XG4gICAgaWYgKHMucGllY2UgJiYgIWlzUGllY2Uocy5vcmlnKSkgcGllY2VNYXAuc2V0KHMub3JpZywgcyk7XG4gIH1cbiAgY29uc3QgcGllY2VTaGFwZXMgPSBbLi4ucGllY2VNYXAudmFsdWVzKCldLm1hcCgocykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBzaGFwZTogcyxcbiAgICAgIGhhc2g6IHNoYXBlSGFzaChzLCBhcnJvd0Rlc3RzLCBmYWxzZSwgaGFzaEJvdW5kcyksXG4gICAgfTtcbiAgfSk7XG5cbiAgY29uc3Qgc2hhcGVzOiBTaGFwZVtdID0gZC5zaGFwZXMuY29uY2F0KGQuYXV0b1NoYXBlcykubWFwKChzOiBEcmF3U2hhcGUpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgc2hhcGU6IHMsXG4gICAgICBoYXNoOiBzaGFwZUhhc2gocywgYXJyb3dEZXN0cywgZmFsc2UsIGhhc2hCb3VuZHMpLFxuICAgIH07XG4gIH0pO1xuICBpZiAoY3VyKVxuICAgIHNoYXBlcy5wdXNoKHtcbiAgICAgIHNoYXBlOiBjdXIsXG4gICAgICBoYXNoOiBzaGFwZUhhc2goY3VyLCBhcnJvd0Rlc3RzLCB0cnVlLCBoYXNoQm91bmRzKSxcbiAgICAgIGN1cnJlbnQ6IHRydWUsXG4gICAgfSk7XG5cbiAgY29uc3QgZnVsbEhhc2ggPVxuICAgIHNoYXBlcy5tYXAoKHNjKSA9PiBzYy5oYXNoKS5qb2luKCc7JykgK1xuICAgIChvdXRzaWRlQXJyb3cgPyBvdXRzaWRlQXJyb3dIYXNoIDogJycpICtcbiAgICBzdGF0ZS5zY2FsZURvd25QaWVjZXM7XG4gIGlmIChmdWxsSGFzaCA9PT0gc3RhdGUuZHJhd2FibGUucHJldlN2Z0hhc2gpIHJldHVybjtcbiAgc3RhdGUuZHJhd2FibGUucHJldlN2Z0hhc2ggPSBmdWxsSGFzaDtcblxuICAvKlxuICAgIC0tIERPTSBoaWVyYXJjaHkgLS1cbiAgICA8c3ZnIGNsYXNzPVwic2ctc2hhcGVzXCI+ICg8PSBzdmcpXG4gICAgICA8ZGVmcz5cbiAgICAgICAgLi4uKGZvciBicnVzaGVzKS4uLlxuICAgICAgPC9kZWZzPlxuICAgICAgPGc+XG4gICAgICAgIC4uLihmb3IgYXJyb3dzIGFuZCBjaXJjbGVzKS4uLlxuICAgICAgPC9nPlxuICAgIDwvc3ZnPlxuICAgIDxzdmcgY2xhc3M9XCJzZy1jdXN0b20tc3Znc1wiPiAoPD0gY3VzdG9tU3ZnKVxuICAgICAgPGc+XG4gICAgICAgIC4uLihmb3IgY3VzdG9tIHN2Z3MpLi4uXG4gICAgICA8L2c+XG4gICAgPHNnLWZyZWUtcGllY2VzPiAoPD0gZnJlZVBpZWNlcylcbiAgICAgIC4uLihmb3IgcGllY2VzKS4uLlxuICAgIDwvc2ctZnJlZS1waWVjZXM+XG4gICAgPC9zdmc+XG4gICovXG4gIGNvbnN0IGRlZnNFbCA9IHN2Zy5xdWVyeVNlbGVjdG9yKCdkZWZzJykgYXMgU1ZHRWxlbWVudDtcbiAgY29uc3Qgc2hhcGVzRWwgPSBzdmcucXVlcnlTZWxlY3RvcignZycpIGFzIFNWR0VsZW1lbnQ7XG4gIGNvbnN0IGN1c3RvbVN2Z3NFbCA9IGN1c3RvbVN2Zy5xdWVyeVNlbGVjdG9yKCdnJykgYXMgU1ZHRWxlbWVudDtcblxuICBzeW5jRGVmcyhzaGFwZXMsIG91dHNpZGVBcnJvdyA/IGN1ckQgOiB1bmRlZmluZWQsIGRlZnNFbCk7XG4gIHN5bmNTaGFwZXMoXG4gICAgc2hhcGVzLmZpbHRlcigocykgPT4gIXMuc2hhcGUuY3VzdG9tU3ZnICYmICghcy5zaGFwZS5waWVjZSB8fCBzLmN1cnJlbnQpKSxcbiAgICBzaGFwZXNFbCxcbiAgICAoc2hhcGUpID0+IHJlbmRlclNWR1NoYXBlKHN0YXRlLCBzaGFwZSwgYXJyb3dEZXN0cyksXG4gICAgb3V0c2lkZUFycm93LFxuICApO1xuICBzeW5jU2hhcGVzKFxuICAgIHNoYXBlcy5maWx0ZXIoKHMpID0+IHMuc2hhcGUuY3VzdG9tU3ZnKSxcbiAgICBjdXN0b21TdmdzRWwsXG4gICAgKHNoYXBlKSA9PiByZW5kZXJTVkdTaGFwZShzdGF0ZSwgc2hhcGUsIGFycm93RGVzdHMpLFxuICApO1xuICBzeW5jU2hhcGVzKHBpZWNlU2hhcGVzLCBmcmVlUGllY2VzLCAoc2hhcGUpID0+IHJlbmRlclBpZWNlKHN0YXRlLCBzaGFwZSkpO1xuXG4gIGlmICghb3V0c2lkZUFycm93ICYmIGN1ckQpIGN1ckQuYXJyb3cgPSB1bmRlZmluZWQ7XG5cbiAgaWYgKG91dHNpZGVBcnJvdyAmJiAhY3VyRC5hcnJvdykge1xuICAgIGNvbnN0IG9yaWcgPSBwaWVjZU9yS2V5VG9Qb3MoY3VyRC5vcmlnLCBzdGF0ZSk7XG4gICAgaWYgKG9yaWcpIHtcbiAgICAgIGNvbnN0IGcgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ2cnKSwge1xuICAgICAgICBjbGFzczogc2hhcGVDbGFzcyhjdXJELmJydXNoLCB0cnVlLCB0cnVlKSxcbiAgICAgICAgc2dIYXNoOiBvdXRzaWRlQXJyb3dIYXNoLFxuICAgICAgfSk7XG4gICAgICBjb25zdCBlbCA9IHJlbmRlckFycm93KGN1ckQuYnJ1c2gsIG9yaWcsIG9yaWcsIHN0YXRlLnNxdWFyZVJhdGlvLCB0cnVlLCBmYWxzZSk7XG4gICAgICBnLmFwcGVuZENoaWxkKGVsKTtcbiAgICAgIGN1ckQuYXJyb3cgPSBlbDtcbiAgICAgIHNoYXBlc0VsLmFwcGVuZENoaWxkKGcpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBhcHBlbmQgb25seS4gRG9uJ3QgdHJ5IHRvIHVwZGF0ZS9yZW1vdmUuXG5mdW5jdGlvbiBzeW5jRGVmcyhcbiAgc2hhcGVzOiBTaGFwZVtdLFxuICBvdXRzaWRlU2hhcGU6IERyYXdDdXJyZW50IHwgdW5kZWZpbmVkLFxuICBkZWZzRWw6IFNWR0VsZW1lbnQsXG4pOiB2b2lkIHtcbiAgY29uc3QgYnJ1c2hlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBmb3IgKGNvbnN0IHMgb2Ygc2hhcGVzKSB7XG4gICAgaWYgKCFzYW1lUGllY2VPcktleShzLnNoYXBlLmRlc3QsIHMuc2hhcGUub3JpZykpIGJydXNoZXMuYWRkKHMuc2hhcGUuYnJ1c2gpO1xuICB9XG4gIGlmIChvdXRzaWRlU2hhcGUpIGJydXNoZXMuYWRkKG91dHNpZGVTaGFwZS5icnVzaCk7XG4gIGNvbnN0IGtleXNJbkRvbSA9IG5ldyBTZXQoKTtcbiAgbGV0IGVsOiBTVkdFbGVtZW50IHwgdW5kZWZpbmVkID0gZGVmc0VsLmZpcnN0RWxlbWVudENoaWxkIGFzIFNWR0VsZW1lbnQ7XG4gIHdoaWxlIChlbCkge1xuICAgIGtleXNJbkRvbS5hZGQoZWwuZ2V0QXR0cmlidXRlKCdzZ0tleScpKTtcbiAgICBlbCA9IGVsLm5leHRFbGVtZW50U2libGluZyBhcyBTVkdFbGVtZW50IHwgdW5kZWZpbmVkO1xuICB9XG4gIGZvciAoY29uc3Qga2V5IG9mIGJydXNoZXMpIHtcbiAgICBjb25zdCBicnVzaCA9IGtleSB8fCBkZWZhdWx0QnJ1c2g7XG4gICAgaWYgKCFrZXlzSW5Eb20uaGFzKGJydXNoKSkgZGVmc0VsLmFwcGVuZENoaWxkKHJlbmRlck1hcmtlcihicnVzaCkpO1xuICB9XG59XG5cbi8vIGFwcGVuZCBhbmQgcmVtb3ZlIG9ubHkuIE5vIHVwZGF0ZXMuXG5leHBvcnQgZnVuY3Rpb24gc3luY1NoYXBlcyhcbiAgc2hhcGVzOiBTaGFwZVtdLFxuICByb290OiBIVE1MRWxlbWVudCB8IFNWR0VsZW1lbnQsXG4gIHJlbmRlclNoYXBlOiAoc2hhcGU6IFNoYXBlKSA9PiBIVE1MRWxlbWVudCB8IFNWR0VsZW1lbnQgfCB1bmRlZmluZWQsXG4gIG91dHNpZGVBcnJvdz86IGJvb2xlYW4sXG4pOiB2b2lkIHtcbiAgY29uc3QgaGFzaGVzSW5Eb20gPSBuZXcgTWFwKCk7IC8vIGJ5IGhhc2hcbiAgY29uc3QgdG9SZW1vdmU6IFNWR0VsZW1lbnRbXSA9IFtdO1xuICBmb3IgKGNvbnN0IHNjIG9mIHNoYXBlcykgaGFzaGVzSW5Eb20uc2V0KHNjLmhhc2gsIGZhbHNlKTtcbiAgaWYgKG91dHNpZGVBcnJvdykgaGFzaGVzSW5Eb20uc2V0KG91dHNpZGVBcnJvd0hhc2gsIHRydWUpO1xuICBsZXQgZWw6IFNWR0VsZW1lbnQgfCB1bmRlZmluZWQgPSByb290LmZpcnN0RWxlbWVudENoaWxkIGFzIFNWR0VsZW1lbnQ7XG4gIGxldCBlbEhhc2g6IEhhc2ggfCBudWxsO1xuICB3aGlsZSAoZWwpIHtcbiAgICBlbEhhc2ggPSBlbC5nZXRBdHRyaWJ1dGUoJ3NnSGFzaCcpO1xuICAgIC8vIGZvdW5kIGEgc2hhcGUgZWxlbWVudCB0aGF0J3MgaGVyZSB0byBzdGF5XG4gICAgaWYgKGhhc2hlc0luRG9tLmhhcyhlbEhhc2gpKSBoYXNoZXNJbkRvbS5zZXQoZWxIYXNoLCB0cnVlKTtcbiAgICAvLyBvciByZW1vdmUgaXRcbiAgICBlbHNlIHRvUmVtb3ZlLnB1c2goZWwpO1xuICAgIGVsID0gZWwubmV4dEVsZW1lbnRTaWJsaW5nIGFzIFNWR0VsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIH1cbiAgLy8gcmVtb3ZlIG9sZCBzaGFwZXNcbiAgZm9yIChjb25zdCBlbCBvZiB0b1JlbW92ZSkgcm9vdC5yZW1vdmVDaGlsZChlbCk7XG4gIC8vIGluc2VydCBzaGFwZXMgdGhhdCBhcmUgbm90IHlldCBpbiBkb21cbiAgZm9yIChjb25zdCBzYyBvZiBzaGFwZXMpIHtcbiAgICBpZiAoIWhhc2hlc0luRG9tLmdldChzYy5oYXNoKSkge1xuICAgICAgY29uc3Qgc2hhcGVFbCA9IHJlbmRlclNoYXBlKHNjKTtcbiAgICAgIGlmIChzaGFwZUVsKSByb290LmFwcGVuZENoaWxkKHNoYXBlRWwpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzaGFwZUhhc2goXG4gIHsgb3JpZywgZGVzdCwgYnJ1c2gsIHBpZWNlLCBjdXN0b21TdmcsIGRlc2NyaXB0aW9uIH06IERyYXdTaGFwZSxcbiAgYXJyb3dEZXN0czogQXJyb3dEZXN0cyxcbiAgY3VycmVudDogYm9vbGVhbixcbiAgYm91bmRIYXNoOiAocGllY2U6IHNnLlBpZWNlKSA9PiBzdHJpbmcsXG4pOiBIYXNoIHtcbiAgcmV0dXJuIFtcbiAgICBjdXJyZW50LFxuICAgIGlzUGllY2Uob3JpZykgJiYgYm91bmRIYXNoKG9yaWcpLFxuICAgIGlzUGllY2UoZGVzdCkgJiYgYm91bmRIYXNoKGRlc3QpLFxuICAgIGlzUGllY2Uob3JpZykgPyBwaWVjZUhhc2gob3JpZykgOiBvcmlnLFxuICAgIGlzUGllY2UoZGVzdCkgPyBwaWVjZUhhc2goZGVzdCkgOiBkZXN0LFxuICAgIGJydXNoLFxuICAgIChhcnJvd0Rlc3RzLmdldChpc1BpZWNlKGRlc3QpID8gcGllY2VOYW1lT2YoZGVzdCkgOiBkZXN0KSB8fCAwKSA+IDEsXG4gICAgcGllY2UgJiYgcGllY2VIYXNoKHBpZWNlKSxcbiAgICBjdXN0b21TdmcgJiYgY3VzdG9tU3ZnSGFzaChjdXN0b21TdmcpLFxuICAgIGRlc2NyaXB0aW9uLFxuICBdXG4gICAgLmZpbHRlcigoeCkgPT4geClcbiAgICAuam9pbignLCcpO1xufVxuXG5mdW5jdGlvbiBwaWVjZUhhc2gocGllY2U6IERyYXdTaGFwZVBpZWNlKTogSGFzaCB7XG4gIHJldHVybiBbcGllY2UuY29sb3IsIHBpZWNlLnJvbGUsIHBpZWNlLnNjYWxlXS5maWx0ZXIoKHgpID0+IHgpLmpvaW4oJywnKTtcbn1cblxuZnVuY3Rpb24gY3VzdG9tU3ZnSGFzaChzOiBzdHJpbmcpOiBIYXNoIHtcbiAgLy8gUm9sbGluZyBoYXNoIHdpdGggYmFzZSAzMSAoY2YuIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzc2MTY0NjEvZ2VuZXJhdGUtYS1oYXNoLWZyb20tc3RyaW5nLWluLWphdmFzY3JpcHQpXG4gIGxldCBoID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzLmxlbmd0aDsgaSsrKSB7XG4gICAgaCA9ICgoaCA8PCA1KSAtIGggKyBzLmNoYXJDb2RlQXQoaSkpID4+PiAwO1xuICB9XG4gIHJldHVybiBgY3VzdG9tLSR7aC50b1N0cmluZygpfWA7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclNWR1NoYXBlKFxuICBzdGF0ZTogU3RhdGUsXG4gIHsgc2hhcGUsIGN1cnJlbnQsIGhhc2ggfTogU2hhcGUsXG4gIGFycm93RGVzdHM6IEFycm93RGVzdHMsXG4pOiBTVkdFbGVtZW50IHwgdW5kZWZpbmVkIHtcbiAgY29uc3Qgb3JpZyA9IHBpZWNlT3JLZXlUb1BvcyhzaGFwZS5vcmlnLCBzdGF0ZSk7XG4gIGlmICghb3JpZykgcmV0dXJuO1xuICBpZiAoc2hhcGUuY3VzdG9tU3ZnKSB7XG4gICAgcmV0dXJuIHJlbmRlckN1c3RvbVN2ZyhzaGFwZS5icnVzaCwgc2hhcGUuY3VzdG9tU3ZnLCBvcmlnLCBzdGF0ZS5zcXVhcmVSYXRpbyk7XG4gIH0gZWxzZSB7XG4gICAgbGV0IGVsOiBTVkdFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgIGNvbnN0IGRlc3QgPSAhc2FtZVBpZWNlT3JLZXkoc2hhcGUub3JpZywgc2hhcGUuZGVzdCkgJiYgcGllY2VPcktleVRvUG9zKHNoYXBlLmRlc3QsIHN0YXRlKTtcbiAgICBpZiAoZGVzdCkge1xuICAgICAgZWwgPSByZW5kZXJBcnJvdyhcbiAgICAgICAgc2hhcGUuYnJ1c2gsXG4gICAgICAgIG9yaWcsXG4gICAgICAgIGRlc3QsXG4gICAgICAgIHN0YXRlLnNxdWFyZVJhdGlvLFxuICAgICAgICAhIWN1cnJlbnQsXG4gICAgICAgIChhcnJvd0Rlc3RzLmdldChpc1BpZWNlKHNoYXBlLmRlc3QpID8gcGllY2VOYW1lT2Yoc2hhcGUuZGVzdCkgOiBzaGFwZS5kZXN0KSB8fCAwKSA+IDEsXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAoc2FtZVBpZWNlT3JLZXkoc2hhcGUuZGVzdCwgc2hhcGUub3JpZykpIHtcbiAgICAgIGxldCByYXRpbzogc2cuTnVtYmVyUGFpciA9IHN0YXRlLnNxdWFyZVJhdGlvO1xuICAgICAgaWYgKGlzUGllY2Uoc2hhcGUub3JpZykpIHtcbiAgICAgICAgY29uc3QgcGllY2VCb3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzKCkuZ2V0KHBpZWNlTmFtZU9mKHNoYXBlLm9yaWcpKTtcbiAgICAgICAgY29uc3QgYm91bmRzID0gc3RhdGUuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKTtcbiAgICAgICAgaWYgKHBpZWNlQm91bmRzICYmIGJvdW5kcykge1xuICAgICAgICAgIGNvbnN0IGhlaWdodEJhc2UgPSBwaWVjZUJvdW5kcy5oZWlnaHQgLyAoYm91bmRzLmhlaWdodCAvIHN0YXRlLmRpbWVuc2lvbnMucmFua3MpO1xuICAgICAgICAgIC8vIHdlIHdhbnQgdG8ga2VlcCB0aGUgcmF0aW8gdGhhdCBpcyBvbiB0aGUgYm9hcmRcbiAgICAgICAgICByYXRpbyA9IFtoZWlnaHRCYXNlICogc3RhdGUuc3F1YXJlUmF0aW9bMF0sIGhlaWdodEJhc2UgKiBzdGF0ZS5zcXVhcmVSYXRpb1sxXV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsID0gcmVuZGVyRWxsaXBzZShvcmlnLCByYXRpbywgISFjdXJyZW50KTtcbiAgICB9XG4gICAgaWYgKGVsKSB7XG4gICAgICBjb25zdCBnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdnJyksIHtcbiAgICAgICAgY2xhc3M6IHNoYXBlQ2xhc3Moc2hhcGUuYnJ1c2gsICEhY3VycmVudCwgZmFsc2UpLFxuICAgICAgICBzZ0hhc2g6IGhhc2gsXG4gICAgICB9KTtcbiAgICAgIGcuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgY29uc3QgZGVzY0VsID0gc2hhcGUuZGVzY3JpcHRpb24gJiYgcmVuZGVyRGVzY3JpcHRpb24oc3RhdGUsIHNoYXBlLCBhcnJvd0Rlc3RzKTtcbiAgICAgIGlmIChkZXNjRWwpIGcuYXBwZW5kQ2hpbGQoZGVzY0VsKTtcbiAgICAgIHJldHVybiBnO1xuICAgIH0gZWxzZSByZXR1cm47XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyQ3VzdG9tU3ZnKFxuICBicnVzaDogc3RyaW5nLFxuICBjdXN0b21Tdmc6IHN0cmluZyxcbiAgcG9zOiBzZy5Qb3MsXG4gIHJhdGlvOiBzZy5OdW1iZXJQYWlyLFxuKTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IFt4LCB5XSA9IHBvcztcblxuICAvLyBUcmFuc2xhdGUgdG8gdG9wLWxlZnQgb2YgYG9yaWdgIHNxdWFyZVxuICBjb25zdCBnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdnJyksIHsgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7eH0sJHt5fSlgIH0pO1xuXG4gIGNvbnN0IHN2ZyA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnc3ZnJyksIHtcbiAgICBjbGFzczogYnJ1c2gsXG4gICAgd2lkdGg6IHJhdGlvWzBdLFxuICAgIGhlaWdodDogcmF0aW9bMV0sXG4gICAgdmlld0JveDogYDAgMCAke3JhdGlvWzBdICogMTB9ICR7cmF0aW9bMV0gKiAxMH1gLFxuICB9KTtcblxuICBnLmFwcGVuZENoaWxkKHN2Zyk7XG4gIHN2Zy5pbm5lckhUTUwgPSBjdXN0b21Tdmc7XG5cbiAgcmV0dXJuIGc7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckVsbGlwc2UocG9zOiBzZy5Qb3MsIHJhdGlvOiBzZy5OdW1iZXJQYWlyLCBjdXJyZW50OiBib29sZWFuKTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IG8gPSBwb3M7XG4gIGNvbnN0IHdpZHRocyA9IGVsbGlwc2VXaWR0aChyYXRpbyk7XG4gIHJldHVybiBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ2VsbGlwc2UnKSwge1xuICAgICdzdHJva2Utd2lkdGgnOiB3aWR0aHNbY3VycmVudCA/IDAgOiAxXSxcbiAgICBmaWxsOiAnbm9uZScsXG4gICAgY3g6IG9bMF0sXG4gICAgY3k6IG9bMV0sXG4gICAgcng6IHJhdGlvWzBdIC8gMiAtIHdpZHRoc1sxXSAvIDIsXG4gICAgcnk6IHJhdGlvWzFdIC8gMiAtIHdpZHRoc1sxXSAvIDIsXG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZW5kZXJBcnJvdyhcbiAgYnJ1c2g6IHN0cmluZyxcbiAgb3JpZzogc2cuUG9zLFxuICBkZXN0OiBzZy5Qb3MsXG4gIHJhdGlvOiBzZy5OdW1iZXJQYWlyLFxuICBjdXJyZW50OiBib29sZWFuLFxuICBzaG9ydGVuOiBib29sZWFuLFxuKTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IG0gPSBhcnJvd01hcmdpbihzaG9ydGVuICYmICFjdXJyZW50LCByYXRpbyk7XG4gIGNvbnN0IGEgPSBvcmlnO1xuICBjb25zdCBiID0gZGVzdDtcbiAgY29uc3QgZHggPSBiWzBdIC0gYVswXTtcbiAgY29uc3QgZHkgPSBiWzFdIC0gYVsxXTtcbiAgY29uc3QgYW5nbGUgPSBNYXRoLmF0YW4yKGR5LCBkeCk7XG4gIGNvbnN0IHhvID0gTWF0aC5jb3MoYW5nbGUpICogbTtcbiAgY29uc3QgeW8gPSBNYXRoLnNpbihhbmdsZSkgKiBtO1xuICByZXR1cm4gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdsaW5lJyksIHtcbiAgICAnc3Ryb2tlLXdpZHRoJzogbGluZVdpZHRoKGN1cnJlbnQsIHJhdGlvKSxcbiAgICAnc3Ryb2tlLWxpbmVjYXAnOiAncm91bmQnLFxuICAgICdtYXJrZXItZW5kJzogYHVybCgjYXJyb3doZWFkLSR7YnJ1c2ggfHwgZGVmYXVsdEJydXNofSlgLFxuICAgIHgxOiBhWzBdLFxuICAgIHkxOiBhWzFdLFxuICAgIHgyOiBiWzBdIC0geG8sXG4gICAgeTI6IGJbMV0gLSB5byxcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJQaWVjZShzdGF0ZTogU3RhdGUsIHsgc2hhcGUgfTogU2hhcGUpOiBzZy5QaWVjZU5vZGUgfCB1bmRlZmluZWQge1xuICBpZiAoIXNoYXBlLnBpZWNlIHx8IGlzUGllY2Uoc2hhcGUub3JpZykpIHJldHVybjtcblxuICBjb25zdCBvcmlnID0gc2hhcGUub3JpZztcbiAgY29uc3Qgc2NhbGUgPSAoc2hhcGUucGllY2Uuc2NhbGUgfHwgMSkgKiAoc3RhdGUuc2NhbGVEb3duUGllY2VzID8gMC41IDogMSk7XG5cbiAgY29uc3QgcGllY2VFbCA9IGNyZWF0ZUVsKCdwaWVjZScsIHBpZWNlTmFtZU9mKHNoYXBlLnBpZWNlKSkgYXMgc2cuUGllY2VOb2RlO1xuICBwaWVjZUVsLnNnS2V5ID0gb3JpZztcbiAgcGllY2VFbC5zZ1NjYWxlID0gc2NhbGU7XG4gIHRyYW5zbGF0ZVJlbChcbiAgICBwaWVjZUVsLFxuICAgIHBvc1RvVHJhbnNsYXRlUmVsKHN0YXRlLmRpbWVuc2lvbnMpKGtleTJwb3Mob3JpZyksIHNlbnRlUG92KHN0YXRlLm9yaWVudGF0aW9uKSksXG4gICAgc3RhdGUuc2NhbGVEb3duUGllY2VzID8gMC41IDogMSxcbiAgICBzY2FsZSxcbiAgKTtcblxuICByZXR1cm4gcGllY2VFbDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyRGVzY3JpcHRpb24oXG4gIHN0YXRlOiBTdGF0ZSxcbiAgc2hhcGU6IERyYXdTaGFwZSxcbiAgYXJyb3dEZXN0czogQXJyb3dEZXN0cyxcbik6IFNWR0VsZW1lbnQgfCB1bmRlZmluZWQge1xuICBjb25zdCBvcmlnID0gcGllY2VPcktleVRvUG9zKHNoYXBlLm9yaWcsIHN0YXRlKTtcbiAgaWYgKCFvcmlnIHx8ICFzaGFwZS5kZXNjcmlwdGlvbikgcmV0dXJuO1xuICBjb25zdCBkZXN0ID0gIXNhbWVQaWVjZU9yS2V5KHNoYXBlLm9yaWcsIHNoYXBlLmRlc3QpICYmIHBpZWNlT3JLZXlUb1BvcyhzaGFwZS5kZXN0LCBzdGF0ZSk7XG4gIGNvbnN0IGRpZmYgPSBkZXN0ID8gW2Rlc3RbMF0gLSBvcmlnWzBdLCBkZXN0WzFdIC0gb3JpZ1sxXV0gOiBbMCwgMF07XG4gIGNvbnN0IG9mZnNldCA9XG4gICAgKGFycm93RGVzdHMuZ2V0KGlzUGllY2Uoc2hhcGUuZGVzdCkgPyBwaWVjZU5hbWVPZihzaGFwZS5kZXN0KSA6IHNoYXBlLmRlc3QpIHx8IDApID4gMVxuICAgICAgPyAwLjNcbiAgICAgIDogMC4xNTtcbiAgY29uc3QgY2xvc2UgPVxuICAgIChkaWZmWzBdID09PSAwIHx8IE1hdGguYWJzKGRpZmZbMF0pID09PSBzdGF0ZS5zcXVhcmVSYXRpb1swXSkgJiZcbiAgICAoZGlmZlsxXSA9PT0gMCB8fCBNYXRoLmFicyhkaWZmWzFdKSA9PT0gc3RhdGUuc3F1YXJlUmF0aW9bMV0pO1xuICBjb25zdCByYXRpbyA9IGRlc3QgPyAwLjU1IC0gKGNsb3NlID8gb2Zmc2V0IDogMCkgOiAwO1xuICBjb25zdCBtaWQ6IHNnLlBvcyA9IFtvcmlnWzBdICsgZGlmZlswXSAqIHJhdGlvLCBvcmlnWzFdICsgZGlmZlsxXSAqIHJhdGlvXTtcbiAgY29uc3QgdGV4dExlbmd0aCA9IHNoYXBlLmRlc2NyaXB0aW9uLmxlbmd0aDtcbiAgY29uc3QgZyA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnZycpLCB7IGNsYXNzOiAnZGVzY3JpcHRpb24nIH0pO1xuICBjb25zdCBjaXJjbGUgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ2VsbGlwc2UnKSwge1xuICAgIGN4OiBtaWRbMF0sXG4gICAgY3k6IG1pZFsxXSxcbiAgICByeDogdGV4dExlbmd0aCArIDEuNSxcbiAgICByeTogMi41LFxuICB9KTtcbiAgY29uc3QgdGV4dCA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgndGV4dCcpLCB7XG4gICAgeDogbWlkWzBdLFxuICAgIHk6IG1pZFsxXSxcbiAgICAndGV4dC1hbmNob3InOiAnbWlkZGxlJyxcbiAgICAnZG9taW5hbnQtYmFzZWxpbmUnOiAnY2VudHJhbCcsXG4gIH0pO1xuICBnLmFwcGVuZENoaWxkKGNpcmNsZSk7XG4gIHRleHQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoc2hhcGUuZGVzY3JpcHRpb24pKTtcbiAgZy5hcHBlbmRDaGlsZCh0ZXh0KTtcbiAgcmV0dXJuIGc7XG59XG5cbmZ1bmN0aW9uIHJlbmRlck1hcmtlcihicnVzaDogc3RyaW5nKTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IG1hcmtlciA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnbWFya2VyJyksIHtcbiAgICBpZDogYGFycm93aGVhZC0ke2JydXNofWAsXG4gICAgb3JpZW50OiAnYXV0bycsXG4gICAgbWFya2VyV2lkdGg6IDQsXG4gICAgbWFya2VySGVpZ2h0OiA4LFxuICAgIHJlZlg6IDIuMDUsXG4gICAgcmVmWTogMi4wMSxcbiAgfSk7XG4gIG1hcmtlci5hcHBlbmRDaGlsZChcbiAgICBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ3BhdGgnKSwge1xuICAgICAgZDogJ00wLDAgVjQgTDMsMiBaJyxcbiAgICB9KSxcbiAgKTtcbiAgbWFya2VyLnNldEF0dHJpYnV0ZSgnc2dLZXknLCBicnVzaCk7XG4gIHJldHVybiBtYXJrZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRBdHRyaWJ1dGVzKGVsOiBTVkdFbGVtZW50LCBhdHRyczogUmVjb3JkPHN0cmluZywgYW55Pik6IFNWR0VsZW1lbnQge1xuICBmb3IgKGNvbnN0IGtleSBpbiBhdHRycykge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYXR0cnMsIGtleSkpIGVsLnNldEF0dHJpYnV0ZShrZXksIGF0dHJzW2tleV0pO1xuICB9XG4gIHJldHVybiBlbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBvczJ1c2VyKFxuICBwb3M6IHNnLlBvcyxcbiAgY29sb3I6IHNnLkNvbG9yLFxuICBkaW1zOiBzZy5EaW1lbnNpb25zLFxuICByYXRpbzogc2cuTnVtYmVyUGFpcixcbik6IHNnLk51bWJlclBhaXIge1xuICByZXR1cm4gY29sb3IgPT09ICdzZW50ZSdcbiAgICA/IFsoZGltcy5maWxlcyAtIDEgLSBwb3NbMF0pICogcmF0aW9bMF0sIHBvc1sxXSAqIHJhdGlvWzFdXVxuICAgIDogW3Bvc1swXSAqIHJhdGlvWzBdLCAoZGltcy5yYW5rcyAtIDEgLSBwb3NbMV0pICogcmF0aW9bMV1dO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQaWVjZSh4OiBzZy5LZXkgfCBzZy5QaWVjZSk6IHggaXMgc2cuUGllY2Uge1xuICByZXR1cm4gdHlwZW9mIHggPT09ICdvYmplY3QnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2FtZVBpZWNlT3JLZXkoa3AxOiBzZy5LZXkgfCBzZy5QaWVjZSwga3AyOiBzZy5LZXkgfCBzZy5QaWVjZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKGlzUGllY2Uoa3AxKSAmJiBpc1BpZWNlKGtwMikgJiYgc2FtZVBpZWNlKGtwMSwga3AyKSkgfHwga3AxID09PSBrcDI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VzQm91bmRzKHNoYXBlczogRHJhd1NoYXBlW10pOiBib29sZWFuIHtcbiAgcmV0dXJuIHNoYXBlcy5zb21lKChzKSA9PiBpc1BpZWNlKHMub3JpZykgfHwgaXNQaWVjZShzLmRlc3QpKTtcbn1cblxuZnVuY3Rpb24gc2hhcGVDbGFzcyhicnVzaDogc3RyaW5nLCBjdXJyZW50OiBib29sZWFuLCBvdXRzaWRlOiBib29sZWFuKTogc3RyaW5nIHtcbiAgcmV0dXJuIChicnVzaCB8fCBkZWZhdWx0QnJ1c2gpICsgKGN1cnJlbnQgPyAnIGN1cnJlbnQnIDogJycpICsgKG91dHNpZGUgPyAnIG91dHNpZGUnIDogJycpO1xufVxuXG5mdW5jdGlvbiByYXRpb0F2ZXJhZ2UocmF0aW86IHNnLk51bWJlclBhaXIpOiBudW1iZXIge1xuICByZXR1cm4gKHJhdGlvWzBdICsgcmF0aW9bMV0pIC8gMjtcbn1cblxuZnVuY3Rpb24gZWxsaXBzZVdpZHRoKHJhdGlvOiBzZy5OdW1iZXJQYWlyKTogW251bWJlciwgbnVtYmVyXSB7XG4gIHJldHVybiBbKDMgLyA2NCkgKiByYXRpb0F2ZXJhZ2UocmF0aW8pLCAoNCAvIDY0KSAqIHJhdGlvQXZlcmFnZShyYXRpbyldO1xufVxuXG5mdW5jdGlvbiBsaW5lV2lkdGgoY3VycmVudDogYm9vbGVhbiwgcmF0aW86IHNnLk51bWJlclBhaXIpOiBudW1iZXIge1xuICByZXR1cm4gKChjdXJyZW50ID8gOC41IDogMTApIC8gNjQpICogcmF0aW9BdmVyYWdlKHJhdGlvKTtcbn1cblxuZnVuY3Rpb24gYXJyb3dNYXJnaW4oc2hvcnRlbjogYm9vbGVhbiwgcmF0aW86IHNnLk51bWJlclBhaXIpOiBudW1iZXIge1xuICByZXR1cm4gKChzaG9ydGVuID8gMjAgOiAxMCkgLyA2NCkgKiByYXRpb0F2ZXJhZ2UocmF0aW8pO1xufVxuXG5mdW5jdGlvbiBwaWVjZU9yS2V5VG9Qb3Moa3A6IHNnLktleSB8IHNnLlBpZWNlLCBzdGF0ZTogU3RhdGUpOiBzZy5Qb3MgfCB1bmRlZmluZWQge1xuICBpZiAoaXNQaWVjZShrcCkpIHtcbiAgICBjb25zdCBwaWVjZUJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMoKS5nZXQocGllY2VOYW1lT2Yoa3ApKTtcbiAgICBjb25zdCBib3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpO1xuICAgIGNvbnN0IG9mZnNldCA9IHNlbnRlUG92KHN0YXRlLm9yaWVudGF0aW9uKSA/IFswLjUsIC0wLjVdIDogWy0wLjUsIDAuNV07XG4gICAgY29uc3QgcG9zID1cbiAgICAgIHBpZWNlQm91bmRzICYmXG4gICAgICBib3VuZHMgJiZcbiAgICAgIHBvc09mT3V0c2lkZUVsKFxuICAgICAgICBwaWVjZUJvdW5kcy5sZWZ0ICsgcGllY2VCb3VuZHMud2lkdGggLyAyLFxuICAgICAgICBwaWVjZUJvdW5kcy50b3AgKyBwaWVjZUJvdW5kcy5oZWlnaHQgLyAyLFxuICAgICAgICBzZW50ZVBvdihzdGF0ZS5vcmllbnRhdGlvbiksXG4gICAgICAgIHN0YXRlLmRpbWVuc2lvbnMsXG4gICAgICAgIGJvdW5kcyxcbiAgICAgICk7XG4gICAgcmV0dXJuIChcbiAgICAgIHBvcyAmJlxuICAgICAgcG9zMnVzZXIoXG4gICAgICAgIFtwb3NbMF0gKyBvZmZzZXRbMF0sIHBvc1sxXSArIG9mZnNldFsxXV0sXG4gICAgICAgIHN0YXRlLm9yaWVudGF0aW9uLFxuICAgICAgICBzdGF0ZS5kaW1lbnNpb25zLFxuICAgICAgICBzdGF0ZS5zcXVhcmVSYXRpbyxcbiAgICAgIClcbiAgICApO1xuICB9IGVsc2UgcmV0dXJuIHBvczJ1c2VyKGtleTJwb3Moa3ApLCBzdGF0ZS5vcmllbnRhdGlvbiwgc3RhdGUuZGltZW5zaW9ucywgc3RhdGUuc3F1YXJlUmF0aW8pO1xufVxuIiwgImltcG9ydCB7IGNhbmNlbE1vdmVPckRyb3AsIHVuc2VsZWN0IH0gZnJvbSAnLi9ib2FyZC5qcyc7XG5pbXBvcnQgeyBpc1BpZWNlLCBwb3MydXNlciwgc2FtZVBpZWNlT3JLZXksIHNldEF0dHJpYnV0ZXMgfSBmcm9tICcuL3NoYXBlcy5qcyc7XG5pbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHtcbiAgZXZlbnRQb3NpdGlvbixcbiAgZ2V0SGFuZFBpZWNlQXREb21Qb3MsXG4gIGdldEtleUF0RG9tUG9zLFxuICBpc1JpZ2h0QnV0dG9uLFxuICBwb3NPZk91dHNpZGVFbCxcbiAgc2FtZVBpZWNlLFxuICBzZW50ZVBvdixcbn0gZnJvbSAnLi91dGlsLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBEcmF3U2hhcGUge1xuICBvcmlnOiBzZy5LZXkgfCBzZy5QaWVjZTtcbiAgZGVzdDogc2cuS2V5IHwgc2cuUGllY2U7XG4gIHBpZWNlPzogRHJhd1NoYXBlUGllY2U7XG4gIGN1c3RvbVN2Zz86IHN0cmluZzsgLy8gc3ZnXG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xuICBicnVzaDogc3RyaW5nOyAvLyBjc3MgY2xhc3MgdG8gYmUgYXBwZW5kZWRcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTcXVhcmVIaWdobGlnaHQge1xuICBrZXk6IHNnLktleTtcbiAgY2xhc3NOYW1lOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd1NoYXBlUGllY2Uge1xuICByb2xlOiBzZy5Sb2xlU3RyaW5nO1xuICBjb2xvcjogc2cuQ29sb3I7XG4gIHNjYWxlPzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdhYmxlIHtcbiAgZW5hYmxlZDogYm9vbGVhbjsgLy8gY2FuIGRyYXdcbiAgdmlzaWJsZTogYm9vbGVhbjsgLy8gY2FuIHZpZXdcbiAgZm9yY2VkOiBib29sZWFuOyAvLyBjYW4gb25seSBkcmF3XG4gIGVyYXNlT25DbGljazogYm9vbGVhbjtcbiAgb25DaGFuZ2U/OiAoc2hhcGVzOiBEcmF3U2hhcGVbXSkgPT4gdm9pZDtcbiAgc2hhcGVzOiBEcmF3U2hhcGVbXTsgLy8gdXNlciBzaGFwZXNcbiAgYXV0b1NoYXBlczogRHJhd1NoYXBlW107IC8vIGNvbXB1dGVyIHNoYXBlc1xuICBzcXVhcmVzOiBTcXVhcmVIaWdobGlnaHRbXTtcbiAgY3VycmVudD86IERyYXdDdXJyZW50O1xuICBwcmV2U3ZnSGFzaDogc3RyaW5nO1xuICBwaWVjZT86IHNnLlBpZWNlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdDdXJyZW50IHtcbiAgb3JpZzogc2cuS2V5IHwgc2cuUGllY2U7XG4gIGRlc3Q/OiBzZy5LZXkgfCBzZy5QaWVjZTsgLy8gdW5kZWZpbmVkIGlmIG91dHNpZGUgYm9hcmQvaGFuZHNcbiAgYXJyb3c/OiBTVkdFbGVtZW50O1xuICBwaWVjZT86IHNnLlBpZWNlO1xuICBwb3M6IHNnLk51bWJlclBhaXI7XG4gIGJydXNoOiBzdHJpbmc7IC8vIGJydXNoIG5hbWUgZm9yIHNoYXBlXG59XG5cbmNvbnN0IGJydXNoZXMgPSBbJ3ByaW1hcnknLCAnYWx0ZXJuYXRpdmUwJywgJ2FsdGVybmF0aXZlMScsICdhbHRlcm5hdGl2ZTInXTtcblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0KHN0YXRlOiBTdGF0ZSwgZTogc2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICAvLyBzdXBwb3J0IG9uZSBmaW5nZXIgdG91Y2ggb25seVxuICBpZiAoZS50b3VjaGVzICYmIGUudG91Y2hlcy5sZW5ndGggPiAxKSByZXR1cm47XG4gIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIGUucHJldmVudERlZmF1bHQoKTtcblxuICBpZiAoZS5jdHJsS2V5KSB1bnNlbGVjdChzdGF0ZSk7XG4gIGVsc2UgY2FuY2VsTW92ZU9yRHJvcChzdGF0ZSk7XG5cbiAgY29uc3QgcG9zID0gZXZlbnRQb3NpdGlvbihlKTtcbiAgY29uc3QgYm91bmRzID0gc3RhdGUuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKTtcbiAgY29uc3Qgb3JpZyA9XG4gICAgcG9zICYmIGJvdW5kcyAmJiBnZXRLZXlBdERvbVBvcyhwb3MsIHNlbnRlUG92KHN0YXRlLm9yaWVudGF0aW9uKSwgc3RhdGUuZGltZW5zaW9ucywgYm91bmRzKTtcbiAgY29uc3QgcGllY2UgPSBzdGF0ZS5kcmF3YWJsZS5waWVjZTtcbiAgaWYgKCFvcmlnKSByZXR1cm47XG4gIHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQgPSB7XG4gICAgb3JpZyxcbiAgICBkZXN0OiB1bmRlZmluZWQsXG4gICAgcG9zLFxuICAgIHBpZWNlLFxuICAgIGJydXNoOiBldmVudEJydXNoKGUsIGlzUmlnaHRCdXR0b24oZSkgfHwgc3RhdGUuZHJhd2FibGUuZm9yY2VkKSxcbiAgfTtcbiAgcHJvY2Vzc0RyYXcoc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRGcm9tSGFuZChzdGF0ZTogU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwgZTogc2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICAvLyBzdXBwb3J0IG9uZSBmaW5nZXIgdG91Y2ggb25seVxuICBpZiAoZS50b3VjaGVzICYmIGUudG91Y2hlcy5sZW5ndGggPiAxKSByZXR1cm47XG4gIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIGUucHJldmVudERlZmF1bHQoKTtcblxuICBpZiAoZS5jdHJsS2V5KSB1bnNlbGVjdChzdGF0ZSk7XG4gIGVsc2UgY2FuY2VsTW92ZU9yRHJvcChzdGF0ZSk7XG5cbiAgY29uc3QgcG9zID0gZXZlbnRQb3NpdGlvbihlKTtcbiAgaWYgKCFwb3MpIHJldHVybjtcbiAgc3RhdGUuZHJhd2FibGUuY3VycmVudCA9IHtcbiAgICBvcmlnOiBwaWVjZSxcbiAgICBkZXN0OiB1bmRlZmluZWQsXG4gICAgcG9zLFxuICAgIGJydXNoOiBldmVudEJydXNoKGUsIGlzUmlnaHRCdXR0b24oZSkgfHwgc3RhdGUuZHJhd2FibGUuZm9yY2VkKSxcbiAgfTtcbiAgcHJvY2Vzc0RyYXcoc3RhdGUpO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzRHJhdyhzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBjb25zdCBjdXIgPSBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50O1xuICAgIGNvbnN0IGJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gICAgaWYgKGN1ciAmJiBib3VuZHMpIHtcbiAgICAgIGNvbnN0IGRlc3QgPSBnZXREZXN0aW5hdGlvbihzdGF0ZSwgY3VyLnBvcyk7XG4gICAgICBpZiAoY3VyLmRlc3QgIT09IGRlc3QgJiYgIShjdXIuZGVzdCAmJiBkZXN0ICYmIHNhbWVQaWVjZU9yS2V5KGRlc3QsIGN1ci5kZXN0KSkpIHtcbiAgICAgICAgY3VyLmRlc3QgPSBkZXN0O1xuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3Tm93KCk7XG4gICAgICB9XG4gICAgICBjb25zdCBvdXRQb3MgPSBwb3NPZk91dHNpZGVFbChcbiAgICAgICAgY3VyLnBvc1swXSxcbiAgICAgICAgY3VyLnBvc1sxXSxcbiAgICAgICAgc2VudGVQb3Yoc3RhdGUub3JpZW50YXRpb24pLFxuICAgICAgICBzdGF0ZS5kaW1lbnNpb25zLFxuICAgICAgICBib3VuZHMsXG4gICAgICApO1xuICAgICAgaWYgKCFjdXIuZGVzdCAmJiBjdXIuYXJyb3cgJiYgb3V0UG9zKSB7XG4gICAgICAgIGNvbnN0IGRlc3QgPSBwb3MydXNlcihvdXRQb3MsIHN0YXRlLm9yaWVudGF0aW9uLCBzdGF0ZS5kaW1lbnNpb25zLCBzdGF0ZS5zcXVhcmVSYXRpbyk7XG5cbiAgICAgICAgc2V0QXR0cmlidXRlcyhjdXIuYXJyb3csIHtcbiAgICAgICAgICB4MjogZGVzdFswXSAtIHN0YXRlLnNxdWFyZVJhdGlvWzBdIC8gMixcbiAgICAgICAgICB5MjogZGVzdFsxXSAtIHN0YXRlLnNxdWFyZVJhdGlvWzFdIC8gMixcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBwcm9jZXNzRHJhdyhzdGF0ZSk7XG4gICAgfVxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmUoc3RhdGU6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGNvbnN0IHBvcyA9IGV2ZW50UG9zaXRpb24oZSk7XG4gIGlmIChwb3MgJiYgc3RhdGUuZHJhd2FibGUuY3VycmVudCkgc3RhdGUuZHJhd2FibGUuY3VycmVudC5wb3MgPSBwb3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmQoc3RhdGU6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQ7XG4gIGlmIChjdXIpIHtcbiAgICBjdXIuZGVzdCA9IGdldERlc3RpbmF0aW9uKHN0YXRlLCBldmVudFBvc2l0aW9uKGUpIHx8IGN1ci5wb3MpO1xuICAgIGFkZFNoYXBlKHN0YXRlLmRyYXdhYmxlLCBjdXIpO1xuICAgIGNhbmNlbChzdGF0ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RGVzdGluYXRpb24oc3RhdGU6IFN0YXRlLCBwb3M6IHNnLk51bWJlclBhaXIpOiBzZy5LZXkgfCBzZy5QaWVjZSB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gIHJldHVybiAoXG4gICAgYm91bmRzICYmXG4gICAgKGdldEtleUF0RG9tUG9zKHBvcywgc2VudGVQb3Yoc3RhdGUub3JpZW50YXRpb24pLCBzdGF0ZS5kaW1lbnNpb25zLCBib3VuZHMpIHx8XG4gICAgICBnZXRIYW5kUGllY2VBdERvbVBvcyhwb3MsIHN0YXRlLmhhbmRzLnJvbGVzLCBzdGF0ZS5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzKCkpKVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBpZiAoc3RhdGUuZHJhd2FibGUuY3VycmVudCkge1xuICAgIHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhcihzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgY29uc3QgZHJhd2FibGVMZW5ndGggPSBzdGF0ZS5kcmF3YWJsZS5zaGFwZXMubGVuZ3RoO1xuICBpZiAoZHJhd2FibGVMZW5ndGggfHwgc3RhdGUuZHJhd2FibGUucGllY2UpIHtcbiAgICBzdGF0ZS5kcmF3YWJsZS5zaGFwZXMgPSBbXTtcbiAgICBzdGF0ZS5kcmF3YWJsZS5waWVjZSA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgaWYgKGRyYXdhYmxlTGVuZ3RoKSBvbkNoYW5nZShzdGF0ZS5kcmF3YWJsZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldERyYXdQaWVjZShzdGF0ZTogU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSk6IHZvaWQge1xuICBpZiAoc3RhdGUuZHJhd2FibGUucGllY2UgJiYgc2FtZVBpZWNlKHN0YXRlLmRyYXdhYmxlLnBpZWNlLCBwaWVjZSkpXG4gICAgc3RhdGUuZHJhd2FibGUucGllY2UgPSB1bmRlZmluZWQ7XG4gIGVsc2Ugc3RhdGUuZHJhd2FibGUucGllY2UgPSBwaWVjZTtcbiAgc3RhdGUuZG9tLnJlZHJhdygpO1xufVxuXG5mdW5jdGlvbiBldmVudEJydXNoKGU6IHNnLk1vdWNoRXZlbnQsIGFsbG93Rmlyc3RNb2RpZmllcjogYm9vbGVhbik6IHN0cmluZyB7XG4gIGNvbnN0IG1vZEEgPSBhbGxvd0ZpcnN0TW9kaWZpZXIgJiYgKGUuc2hpZnRLZXkgfHwgZS5jdHJsS2V5KTtcbiAgY29uc3QgbW9kQiA9IGUuYWx0S2V5IHx8IGUubWV0YUtleSB8fCBlLmdldE1vZGlmaWVyU3RhdGU/LignQWx0R3JhcGgnKTtcbiAgcmV0dXJuIGJydXNoZXNbKG1vZEEgPyAxIDogMCkgKyAobW9kQiA/IDIgOiAwKV07XG59XG5cbmZ1bmN0aW9uIGFkZFNoYXBlKGRyYXdhYmxlOiBEcmF3YWJsZSwgY3VyOiBEcmF3Q3VycmVudCk6IHZvaWQge1xuICBpZiAoIWN1ci5kZXN0KSByZXR1cm47XG5cbiAgY29uc3Qgc2ltaWxhclNoYXBlID0gKHM6IERyYXdTaGFwZSkgPT5cbiAgICBjdXIuZGVzdCAmJiBzYW1lUGllY2VPcktleShjdXIub3JpZywgcy5vcmlnKSAmJiBzYW1lUGllY2VPcktleShjdXIuZGVzdCwgcy5kZXN0KTtcblxuICAvLyBzZXBhcmF0ZSBzaGFwZSBmb3IgcGllY2VzXG4gIGNvbnN0IHBpZWNlID0gY3VyLnBpZWNlO1xuICBjdXIucGllY2UgPSB1bmRlZmluZWQ7XG5cbiAgY29uc3Qgc2ltaWxhciA9IGRyYXdhYmxlLnNoYXBlcy5maW5kKHNpbWlsYXJTaGFwZSk7XG4gIGNvbnN0IHJlbW92ZVBpZWNlID0gZHJhd2FibGUuc2hhcGVzLmZpbmQoXG4gICAgKHMpID0+IHNpbWlsYXJTaGFwZShzKSAmJiBwaWVjZSAmJiBzLnBpZWNlICYmIHNhbWVQaWVjZShwaWVjZSwgcy5waWVjZSksXG4gICk7XG4gIGNvbnN0IGRpZmZQaWVjZSA9IGRyYXdhYmxlLnNoYXBlcy5maW5kKFxuICAgIChzKSA9PiBzaW1pbGFyU2hhcGUocykgJiYgcGllY2UgJiYgcy5waWVjZSAmJiAhc2FtZVBpZWNlKHBpZWNlLCBzLnBpZWNlKSxcbiAgKTtcblxuICAvLyByZW1vdmUgZXZlcnkgc2ltaWxhciBzaGFwZVxuICBpZiAoc2ltaWxhcikgZHJhd2FibGUuc2hhcGVzID0gZHJhd2FibGUuc2hhcGVzLmZpbHRlcigocykgPT4gIXNpbWlsYXJTaGFwZShzKSk7XG5cbiAgaWYgKCFpc1BpZWNlKGN1ci5vcmlnKSAmJiBwaWVjZSAmJiAhcmVtb3ZlUGllY2UpIHtcbiAgICBkcmF3YWJsZS5zaGFwZXMucHVzaCh7XG4gICAgICBvcmlnOiBjdXIub3JpZyxcbiAgICAgIGRlc3Q6IGN1ci5vcmlnLFxuICAgICAgcGllY2U6IHBpZWNlLFxuICAgICAgYnJ1c2g6IGN1ci5icnVzaCxcbiAgICB9KTtcbiAgICAvLyBmb3JjZSBjaXJjbGUgYXJvdW5kIGRyYXduIHBpZWNlc1xuICAgIGlmICghc2FtZVBpZWNlT3JLZXkoY3VyLm9yaWcsIGN1ci5kZXN0KSlcbiAgICAgIGRyYXdhYmxlLnNoYXBlcy5wdXNoKHtcbiAgICAgICAgb3JpZzogY3VyLm9yaWcsXG4gICAgICAgIGRlc3Q6IGN1ci5vcmlnLFxuICAgICAgICBicnVzaDogY3VyLmJydXNoLFxuICAgICAgfSk7XG4gIH1cblxuICBpZiAoIXNpbWlsYXIgfHwgZGlmZlBpZWNlIHx8IHNpbWlsYXIuYnJ1c2ggIT09IGN1ci5icnVzaCkgZHJhd2FibGUuc2hhcGVzLnB1c2goY3VyIGFzIERyYXdTaGFwZSk7XG4gIG9uQ2hhbmdlKGRyYXdhYmxlKTtcbn1cblxuZnVuY3Rpb24gb25DaGFuZ2UoZHJhd2FibGU6IERyYXdhYmxlKTogdm9pZCB7XG4gIGlmIChkcmF3YWJsZS5vbkNoYW5nZSkgZHJhd2FibGUub25DaGFuZ2UoZHJhd2FibGUuc2hhcGVzKTtcbn1cbiIsICJpbXBvcnQgeyBhbmltIH0gZnJvbSAnLi9hbmltLmpzJztcbmltcG9ydCAqIGFzIGJvYXJkIGZyb20gJy4vYm9hcmQuanMnO1xuaW1wb3J0IHsgY29sb3JzIH0gZnJvbSAnLi9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgY2xlYXIgYXMgZHJhd0NsZWFyIH0gZnJvbSAnLi9kcmF3LmpzJztcbmltcG9ydCB7IGFkZFRvSGFuZCwgbnVtYmVySW5IYW5kLCByZW1vdmVGcm9tSGFuZCB9IGZyb20gJy4vaGFuZHMuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBEcmFnQ3VycmVudCB7XG4gIHBpZWNlOiBzZy5QaWVjZTsgLy8gcGllY2UgYmVpbmcgZHJhZ2dlZFxuICBwb3M6IHNnLk51bWJlclBhaXI7IC8vIGxhdGVzdCBldmVudCBwb3NpdGlvblxuICBvcmlnUG9zOiBzZy5OdW1iZXJQYWlyOyAvLyBmaXJzdCBldmVudCBwb3NpdGlvblxuICBzdGFydGVkOiBib29sZWFuOyAvLyB3aGV0aGVyIHRoZSBkcmFnIGhhcyBzdGFydGVkOyBhcyBwZXIgdGhlIGRpc3RhbmNlIHNldHRpbmdcbiAgc3BhcmU6IGJvb2xlYW47IC8vIHdoZXRoZXIgdGhpcyBwaWVjZSBpcyBhIHNwYXJlIG9uZVxuICB0b3VjaDogYm9vbGVhbjsgLy8gd2FzIHRoZSBkcmFnZ2luZyBpbml0aWF0ZWQgZnJvbSB0b3VjaCBldmVudFxuICBvcmlnaW5UYXJnZXQ6IEV2ZW50VGFyZ2V0IHwgbnVsbDtcbiAgZnJvbUJvYXJkPzoge1xuICAgIG9yaWc6IHNnLktleTsgLy8gb3JpZyBrZXkgb2YgZHJhZ2dpbmcgcGllY2VcbiAgICBwcmV2aW91c2x5U2VsZWN0ZWQ/OiBzZy5LZXk7IC8vIHNlbGVjdGVkIHBpZWNlIGJlZm9yZSBkcmFnIGJlZ2FuXG4gICAga2V5SGFzQ2hhbmdlZDogYm9vbGVhbjsgLy8gd2hldGhlciB0aGUgZHJhZyBoYXMgbGVmdCB0aGUgb3JpZyBrZXkgb3IgcGllY2VcbiAgfTtcbiAgZnJvbU91dHNpZGU/OiB7XG4gICAgb3JpZ2luQm91bmRzOiBET01SZWN0IHwgdW5kZWZpbmVkOyAvLyBib3VuZHMgb2YgdGhlIHBpZWNlIHRoYXQgaW5pdGlhdGVkIHRoZSBkcmFnXG4gICAgbGVmdE9yaWdpbjogYm9vbGVhbjsgLy8gaGF2ZSB3ZSBldmVyIGxlZnQgb3JpZ2luQm91bmRzXG4gICAgcHJldmlvdXNseVNlbGVjdGVkUGllY2U/OiBzZy5QaWVjZTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0KHM6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGNvbnN0IGJvdW5kcyA9IHMuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKTtcbiAgY29uc3QgcG9zaXRpb24gPSB1dGlsLmV2ZW50UG9zaXRpb24oZSk7XG4gIGNvbnN0IG9yaWcgPVxuICAgIGJvdW5kcyAmJlxuICAgIHBvc2l0aW9uICYmXG4gICAgdXRpbC5nZXRLZXlBdERvbVBvcyhwb3NpdGlvbiwgdXRpbC5zZW50ZVBvdihzLm9yaWVudGF0aW9uKSwgcy5kaW1lbnNpb25zLCBib3VuZHMpO1xuXG4gIGlmICghb3JpZykgcmV0dXJuO1xuXG4gIGNvbnN0IHBpZWNlID0gcy5waWVjZXMuZ2V0KG9yaWcpO1xuICBjb25zdCBwcmV2aW91c2x5U2VsZWN0ZWQgPSBzLnNlbGVjdGVkO1xuICBpZiAoXG4gICAgIXByZXZpb3VzbHlTZWxlY3RlZCAmJlxuICAgIHMuZHJhd2FibGUuZW5hYmxlZCAmJlxuICAgIChzLmRyYXdhYmxlLmVyYXNlT25DbGljayB8fCAhcGllY2UgfHwgcGllY2UuY29sb3IgIT09IHMudHVybkNvbG9yKVxuICApXG4gICAgZHJhd0NsZWFyKHMpO1xuXG4gIC8vIFByZXZlbnQgdG91Y2ggc2Nyb2xsIGFuZCBjcmVhdGUgbm8gY29ycmVzcG9uZGluZyBtb3VzZSBldmVudCwgaWYgdGhlcmVcbiAgLy8gaXMgYW4gaW50ZW50IHRvIGludGVyYWN0IHdpdGggdGhlIGJvYXJkLlxuICBpZiAoXG4gICAgZS5jYW5jZWxhYmxlICE9PSBmYWxzZSAmJlxuICAgICghZS50b3VjaGVzIHx8XG4gICAgICBzLmJsb2NrVG91Y2hTY3JvbGwgfHxcbiAgICAgIHMuc2VsZWN0ZWRQaWVjZSB8fFxuICAgICAgcGllY2UgfHxcbiAgICAgIHByZXZpb3VzbHlTZWxlY3RlZCB8fFxuICAgICAgcGllY2VDbG9zZVRvKHMsIHBvc2l0aW9uLCBib3VuZHMpKVxuICApXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICBjb25zdCBoYWRQcmVtb3ZlID0gISFzLnByZW1vdmFibGUuY3VycmVudDtcbiAgY29uc3QgaGFkUHJlZHJvcCA9ICEhcy5wcmVkcm9wcGFibGUuY3VycmVudDtcbiAgaWYgKHMuc2VsZWN0YWJsZS5kZWxldGVPblRvdWNoKSBib2FyZC5kZWxldGVQaWVjZShzLCBvcmlnKTtcbiAgZWxzZSBpZiAocy5zZWxlY3RlZCkge1xuICAgIGlmICghYm9hcmQucHJvbW90aW9uRGlhbG9nTW92ZShzLCBzLnNlbGVjdGVkLCBvcmlnKSkge1xuICAgICAgaWYgKGJvYXJkLmNhbk1vdmUocywgcy5zZWxlY3RlZCwgb3JpZykpIGFuaW0oKHN0YXRlKSA9PiBib2FyZC5zZWxlY3RTcXVhcmUoc3RhdGUsIG9yaWcpLCBzKTtcbiAgICAgIGVsc2UgYm9hcmQuc2VsZWN0U3F1YXJlKHMsIG9yaWcpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChzLnNlbGVjdGVkUGllY2UpIHtcbiAgICBpZiAoIWJvYXJkLnByb21vdGlvbkRpYWxvZ0Ryb3Aocywgcy5zZWxlY3RlZFBpZWNlLCBvcmlnKSkge1xuICAgICAgaWYgKGJvYXJkLmNhbkRyb3Aocywgcy5zZWxlY3RlZFBpZWNlLCBvcmlnKSlcbiAgICAgICAgYW5pbSgoc3RhdGUpID0+IGJvYXJkLnNlbGVjdFNxdWFyZShzdGF0ZSwgb3JpZyksIHMpO1xuICAgICAgZWxzZSBib2FyZC5zZWxlY3RTcXVhcmUocywgb3JpZyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGJvYXJkLnNlbGVjdFNxdWFyZShzLCBvcmlnKTtcbiAgfVxuXG4gIGNvbnN0IHN0aWxsU2VsZWN0ZWQgPSBzLnNlbGVjdGVkID09PSBvcmlnO1xuICBjb25zdCBkcmFnZ2VkRWwgPSBzLmRvbS5lbGVtZW50cy5ib2FyZD8uZHJhZ2dlZDtcblxuICBpZiAocGllY2UgJiYgZHJhZ2dlZEVsICYmIHN0aWxsU2VsZWN0ZWQgJiYgYm9hcmQuaXNEcmFnZ2FibGUocywgcGllY2UpKSB7XG4gICAgY29uc3QgdG91Y2ggPSBlLnR5cGUgPT09ICd0b3VjaHN0YXJ0JztcblxuICAgIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB7XG4gICAgICBwaWVjZSxcbiAgICAgIHBvczogcG9zaXRpb24sXG4gICAgICBvcmlnUG9zOiBwb3NpdGlvbixcbiAgICAgIHN0YXJ0ZWQ6IHMuZHJhZ2dhYmxlLmF1dG9EaXN0YW5jZSAmJiAhdG91Y2gsXG4gICAgICBzcGFyZTogZmFsc2UsXG4gICAgICB0b3VjaCxcbiAgICAgIG9yaWdpblRhcmdldDogZS50YXJnZXQsXG4gICAgICBmcm9tQm9hcmQ6IHtcbiAgICAgICAgb3JpZyxcbiAgICAgICAgcHJldmlvdXNseVNlbGVjdGVkLFxuICAgICAgICBrZXlIYXNDaGFuZ2VkOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgfTtcblxuICAgIGRyYWdnZWRFbC5zZ0NvbG9yID0gcGllY2UuY29sb3I7XG4gICAgZHJhZ2dlZEVsLnNnUm9sZSA9IHBpZWNlLnJvbGU7XG4gICAgZHJhZ2dlZEVsLmNsYXNzTmFtZSA9IGBkcmFnZ2luZyAke3V0aWwucGllY2VOYW1lT2YocGllY2UpfWA7XG4gICAgZHJhZ2dlZEVsLmNsYXNzTGlzdC50b2dnbGUoJ3RvdWNoJywgdG91Y2gpO1xuXG4gICAgcHJvY2Vzc0RyYWcocyk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGhhZFByZW1vdmUpIGJvYXJkLnVuc2V0UHJlbW92ZShzKTtcbiAgICBpZiAoaGFkUHJlZHJvcCkgYm9hcmQudW5zZXRQcmVkcm9wKHMpO1xuICB9XG4gIHMuZG9tLnJlZHJhdygpO1xufVxuXG5mdW5jdGlvbiBwaWVjZUNsb3NlVG8oczogU3RhdGUsIHBvczogc2cuTnVtYmVyUGFpciwgYm91bmRzOiBET01SZWN0KTogYm9vbGVhbiB7XG4gIGNvbnN0IGFzU2VudGUgPSB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pO1xuICBjb25zdCByYWRpdXNTcSA9IChib3VuZHMud2lkdGggLyBzLmRpbWVuc2lvbnMuZmlsZXMpICoqIDI7XG4gIGZvciAoY29uc3Qga2V5IG9mIHMucGllY2VzLmtleXMoKSkge1xuICAgIGNvbnN0IGNlbnRlciA9IHV0aWwuY29tcHV0ZVNxdWFyZUNlbnRlcihrZXksIGFzU2VudGUsIHMuZGltZW5zaW9ucywgYm91bmRzKTtcbiAgICBpZiAodXRpbC5kaXN0YW5jZVNxKGNlbnRlciwgcG9zKSA8PSByYWRpdXNTcSkgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZHJhZ05ld1BpZWNlKHM6IFN0YXRlLCBwaWVjZTogc2cuUGllY2UsIGU6IHNnLk1vdWNoRXZlbnQsIHNwYXJlPzogYm9vbGVhbik6IHZvaWQge1xuICBjb25zdCBwcmV2aW91c2x5U2VsZWN0ZWRQaWVjZSA9IHMuc2VsZWN0ZWRQaWVjZTtcbiAgY29uc3QgZHJhZ2dlZEVsID0gcy5kb20uZWxlbWVudHMuYm9hcmQ/LmRyYWdnZWQ7XG4gIGNvbnN0IHBvc2l0aW9uID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpO1xuICBjb25zdCB0b3VjaCA9IGUudHlwZSA9PT0gJ3RvdWNoc3RhcnQnO1xuXG4gIGlmICghcHJldmlvdXNseVNlbGVjdGVkUGllY2UgJiYgIXNwYXJlICYmIHMuZHJhd2FibGUuZW5hYmxlZCAmJiBzLmRyYXdhYmxlLmVyYXNlT25DbGljaylcbiAgICBkcmF3Q2xlYXIocyk7XG5cbiAgaWYgKCFzcGFyZSAmJiBzLnNlbGVjdGFibGUuZGVsZXRlT25Ub3VjaCkge1xuICAgIHJlbW92ZUZyb21IYW5kKHMsIHBpZWNlKTtcbiAgICBib2FyZC51bnNlbGVjdChzKTtcbiAgICB1dGlsLmNhbGxVc2VyRnVuY3Rpb24ocy5ldmVudHMuY2hhbmdlKTtcbiAgfSBlbHNlIGJvYXJkLnNlbGVjdFBpZWNlKHMsIHBpZWNlLCBzcGFyZSk7XG5cbiAgY29uc3QgaGFkUHJlbW92ZSA9ICEhcy5wcmVtb3ZhYmxlLmN1cnJlbnQ7XG4gIGNvbnN0IGhhZFByZWRyb3AgPSAhIXMucHJlZHJvcHBhYmxlLmN1cnJlbnQ7XG4gIGNvbnN0IHN0aWxsU2VsZWN0ZWQgPSBzLnNlbGVjdGVkUGllY2UgJiYgdXRpbC5zYW1lUGllY2Uocy5zZWxlY3RlZFBpZWNlLCBwaWVjZSk7XG5cbiAgLy8gUHJldmVudCB0b3VjaCBzY3JvbGwgYW5kIGNyZWF0ZSBubyBjb3JyZXNwb25kaW5nIG1vdXNlIGV2ZW50LCBpZiB0aGVyZVxuICAvLyBpcyBhbiBpbnRlbnQgdG8gaW50ZXJhY3Qgd2l0aCB0aGUgaGFuZHMuXG4gIGlmIChcbiAgICBlLmNhbmNlbGFibGUgIT09IGZhbHNlICYmXG4gICAgKCFlLnRvdWNoZXMgfHxcbiAgICAgIHMuYmxvY2tUb3VjaFNjcm9sbCB8fFxuICAgICAgcy5zZWxlY3RlZFBpZWNlIHx8XG4gICAgICBwcmV2aW91c2x5U2VsZWN0ZWRQaWVjZSB8fFxuICAgICAgc3RpbGxTZWxlY3RlZCB8fFxuICAgICAgbnVtYmVySW5IYW5kKHMsIHBpZWNlKSA+IDAgfHxcbiAgICAgIChwb3NpdGlvbiAmJiBoYW5kUGllY2VDbG9zZVRvKHMsIHBvc2l0aW9uKSkpXG4gIClcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgaWYgKFxuICAgIGRyYWdnZWRFbCAmJlxuICAgIHBvc2l0aW9uICYmXG4gICAgcy5zZWxlY3RlZFBpZWNlICYmXG4gICAgc3RpbGxTZWxlY3RlZCAmJlxuICAgIGJvYXJkLmlzRHJhZ2dhYmxlKHMsIHBpZWNlLCB0cnVlKVxuICApIHtcbiAgICBzLmRyYWdnYWJsZS5jdXJyZW50ID0ge1xuICAgICAgcGllY2U6IHMuc2VsZWN0ZWRQaWVjZSxcbiAgICAgIHBvczogcG9zaXRpb24sXG4gICAgICBvcmlnUG9zOiBwb3NpdGlvbixcbiAgICAgIHRvdWNoLFxuICAgICAgc3RhcnRlZDogcy5kcmFnZ2FibGUuYXV0b0Rpc3RhbmNlICYmICF0b3VjaCxcbiAgICAgIHNwYXJlOiAhIXNwYXJlLFxuICAgICAgb3JpZ2luVGFyZ2V0OiBlLnRhcmdldCxcbiAgICAgIGZyb21PdXRzaWRlOiB7XG4gICAgICAgIG9yaWdpbkJvdW5kczogIXNwYXJlXG4gICAgICAgICAgPyBzLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMoKS5nZXQodXRpbC5waWVjZU5hbWVPZihwaWVjZSkpXG4gICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgIGxlZnRPcmlnaW46IGZhbHNlLFxuICAgICAgICBwcmV2aW91c2x5U2VsZWN0ZWRQaWVjZTogIXNwYXJlID8gcHJldmlvdXNseVNlbGVjdGVkUGllY2UgOiB1bmRlZmluZWQsXG4gICAgICB9LFxuICAgIH07XG5cbiAgICBkcmFnZ2VkRWwuc2dDb2xvciA9IHBpZWNlLmNvbG9yO1xuICAgIGRyYWdnZWRFbC5zZ1JvbGUgPSBwaWVjZS5yb2xlO1xuICAgIGRyYWdnZWRFbC5jbGFzc05hbWUgPSBgZHJhZ2dpbmcgJHt1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKX1gO1xuICAgIGRyYWdnZWRFbC5jbGFzc0xpc3QudG9nZ2xlKCd0b3VjaCcsIHRvdWNoKTtcblxuICAgIHByb2Nlc3NEcmFnKHMpO1xuICB9IGVsc2Uge1xuICAgIGlmIChoYWRQcmVtb3ZlKSBib2FyZC51bnNldFByZW1vdmUocyk7XG4gICAgaWYgKGhhZFByZWRyb3ApIGJvYXJkLnVuc2V0UHJlZHJvcChzKTtcbiAgfVxuICBzLmRvbS5yZWRyYXcoKTtcbn1cblxuZnVuY3Rpb24gaXNEcmFnUGllY2VWYWxpZChzOiBTdGF0ZSwgY3VyOiBEcmFnQ3VycmVudCk6IGJvb2xlYW4ge1xuICBpZiAoIWN1ci5mcm9tQm9hcmQpIHJldHVybiBjdXIuc3BhcmUgfHwgbnVtYmVySW5IYW5kKHMsIGN1ci5waWVjZSkgPiAwO1xuICBjb25zdCBvcmlnUGllY2UgPSBzLnBpZWNlcy5nZXQoY3VyLmZyb21Cb2FyZC5vcmlnKTtcbiAgcmV0dXJuICEhb3JpZ1BpZWNlICYmIHV0aWwuc2FtZVBpZWNlKG9yaWdQaWVjZSwgY3VyLnBpZWNlKTtcbn1cblxuZnVuY3Rpb24gdHJ5U3RhcnREcmFnKHM6IFN0YXRlLCBjdXI6IERyYWdDdXJyZW50LCBwb3M6IHNnLk51bWJlclBhaXIpOiBib29sZWFuIHtcbiAgaWYgKCFjdXIuc3RhcnRlZCAmJiB1dGlsLmRpc3RhbmNlU3EocG9zLCBjdXIub3JpZ1BvcykgPj0gcy5kcmFnZ2FibGUuZGlzdGFuY2UgKiogMikgcmV0dXJuIHRydWU7XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0RyYWcoczogU3RhdGUpOiB2b2lkIHtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBjb25zdCBjdXIgPSBzLmRyYWdnYWJsZS5jdXJyZW50O1xuICAgIGNvbnN0IGRyYWdnZWRFbCA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkPy5kcmFnZ2VkO1xuICAgIGNvbnN0IGJvdW5kcyA9IHMuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKTtcbiAgICBpZiAoIWN1ciB8fCAhZHJhZ2dlZEVsIHx8ICFib3VuZHMpIHJldHVybjtcbiAgICAvLyBjYW5jZWwgYW5pbWF0aW9ucyB3aGlsZSBkcmFnZ2luZ1xuICAgIGlmIChjdXIuZnJvbUJvYXJkPy5vcmlnICYmIHMuYW5pbWF0aW9uLmN1cnJlbnQ/LnBsYW4uYW5pbXMuaGFzKGN1ci5mcm9tQm9hcmQub3JpZykpXG4gICAgICBzLmFuaW1hdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIC8vIGlmIG1vdmluZyBwaWVjZSBpcyBnb25lLCBjYW5jZWxcbiAgICBpZiAoIWlzRHJhZ1BpZWNlVmFsaWQocywgY3VyKSkgY2FuY2VsKHMpO1xuICAgIGVsc2Uge1xuICAgICAgaWYgKHRyeVN0YXJ0RHJhZyhzLCBjdXIsIGN1ci5wb3MpKSB7XG4gICAgICAgIGN1ci5zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgcy5kb20ucmVkcmF3KCk7XG4gICAgICB9XG4gICAgICBpZiAoY3VyLnN0YXJ0ZWQpIHtcbiAgICAgICAgdXRpbC50cmFuc2xhdGVBYnMoXG4gICAgICAgICAgZHJhZ2dlZEVsLFxuICAgICAgICAgIFtcbiAgICAgICAgICAgIGN1ci5wb3NbMF0gLSBib3VuZHMubGVmdCAtIGJvdW5kcy53aWR0aCAvIChzLmRpbWVuc2lvbnMuZmlsZXMgKiAyKSxcbiAgICAgICAgICAgIGN1ci5wb3NbMV0gLSBib3VuZHMudG9wIC0gYm91bmRzLmhlaWdodCAvIChzLmRpbWVuc2lvbnMucmFua3MgKiAyKSxcbiAgICAgICAgICBdLFxuICAgICAgICAgIHMuc2NhbGVEb3duUGllY2VzID8gMC41IDogMSxcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoIWRyYWdnZWRFbC5zZ0RyYWdnaW5nKSB7XG4gICAgICAgICAgZHJhZ2dlZEVsLnNnRHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgICAgIHV0aWwuc2V0RGlzcGxheShkcmFnZ2VkRWwsIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhvdmVyID0gdXRpbC5nZXRLZXlBdERvbVBvcyhcbiAgICAgICAgICBjdXIucG9zLFxuICAgICAgICAgIHV0aWwuc2VudGVQb3Yocy5vcmllbnRhdGlvbiksXG4gICAgICAgICAgcy5kaW1lbnNpb25zLFxuICAgICAgICAgIGJvdW5kcyxcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoY3VyLmZyb21Cb2FyZClcbiAgICAgICAgICBjdXIuZnJvbUJvYXJkLmtleUhhc0NoYW5nZWQgPSBjdXIuZnJvbUJvYXJkLmtleUhhc0NoYW5nZWQgfHwgY3VyLmZyb21Cb2FyZC5vcmlnICE9PSBob3ZlcjtcbiAgICAgICAgZWxzZSBpZiAoY3VyLmZyb21PdXRzaWRlKVxuICAgICAgICAgIGN1ci5mcm9tT3V0c2lkZS5sZWZ0T3JpZ2luID1cbiAgICAgICAgICAgIGN1ci5mcm9tT3V0c2lkZS5sZWZ0T3JpZ2luIHx8XG4gICAgICAgICAgICAoISFjdXIuZnJvbU91dHNpZGUub3JpZ2luQm91bmRzICYmXG4gICAgICAgICAgICAgICF1dGlsLmlzSW5zaWRlUmVjdChjdXIuZnJvbU91dHNpZGUub3JpZ2luQm91bmRzLCBjdXIucG9zKSk7XG5cbiAgICAgICAgLy8gaWYgdGhlIGhvdmVyZWQgc3F1YXJlIGNoYW5nZWRcbiAgICAgICAgaWYgKGhvdmVyICE9PSBzLmhvdmVyZWQpIHtcbiAgICAgICAgICB1cGRhdGVIb3ZlcmVkU3F1YXJlcyhzLCBob3Zlcik7XG4gICAgICAgICAgaWYgKGN1ci50b3VjaCAmJiBzLmRvbS5lbGVtZW50cy5ib2FyZD8uc3F1YXJlT3Zlcikge1xuICAgICAgICAgICAgaWYgKGhvdmVyICYmIHMuZHJhZ2dhYmxlLnNob3dUb3VjaFNxdWFyZU92ZXJsYXkpIHtcbiAgICAgICAgICAgICAgdXRpbC50cmFuc2xhdGVBYnMoXG4gICAgICAgICAgICAgICAgcy5kb20uZWxlbWVudHMuYm9hcmQuc3F1YXJlT3ZlcixcbiAgICAgICAgICAgICAgICB1dGlsLnBvc1RvVHJhbnNsYXRlQWJzKHMuZGltZW5zaW9ucywgYm91bmRzKShcbiAgICAgICAgICAgICAgICAgIHV0aWwua2V5MnBvcyhob3ZlciksXG4gICAgICAgICAgICAgICAgICB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgMSxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgdXRpbC5zZXREaXNwbGF5KHMuZG9tLmVsZW1lbnRzLmJvYXJkLnNxdWFyZU92ZXIsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdXRpbC5zZXREaXNwbGF5KHMuZG9tLmVsZW1lbnRzLmJvYXJkLnNxdWFyZU92ZXIsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcHJvY2Vzc0RyYWcocyk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZShzOiBTdGF0ZSwgZTogc2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICAvLyBzdXBwb3J0IG9uZSBmaW5nZXIgdG91Y2ggb25seVxuICBpZiAocy5kcmFnZ2FibGUuY3VycmVudCAmJiAoIWUudG91Y2hlcyB8fCBlLnRvdWNoZXMubGVuZ3RoIDwgMikpIHtcbiAgICBjb25zdCBwb3MgPSB1dGlsLmV2ZW50UG9zaXRpb24oZSk7XG4gICAgaWYgKHBvcykgcy5kcmFnZ2FibGUuY3VycmVudC5wb3MgPSBwb3M7XG4gIH0gZWxzZSBpZiAoXG4gICAgKHMuc2VsZWN0ZWQgfHwgcy5zZWxlY3RlZFBpZWNlIHx8IHMuaGlnaGxpZ2h0LmhvdmVyZWQpICYmXG4gICAgIXMuZHJhZ2dhYmxlLmN1cnJlbnQgJiZcbiAgICAoIWUudG91Y2hlcyB8fCBlLnRvdWNoZXMubGVuZ3RoIDwgMilcbiAgKSB7XG4gICAgY29uc3QgcG9zID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpO1xuICAgIGNvbnN0IGJvdW5kcyA9IHMuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKTtcbiAgICBjb25zdCBob3ZlciA9XG4gICAgICBwb3MgJiYgYm91bmRzICYmIHV0aWwuZ2V0S2V5QXREb21Qb3MocG9zLCB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pLCBzLmRpbWVuc2lvbnMsIGJvdW5kcyk7XG4gICAgaWYgKGhvdmVyICE9PSBzLmhvdmVyZWQpIHVwZGF0ZUhvdmVyZWRTcXVhcmVzKHMsIGhvdmVyKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5kKHM6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHMuZHJhZ2dhYmxlLmN1cnJlbnQ7XG4gIGlmICghY3VyKSByZXR1cm47XG4gIC8vIGNyZWF0ZSBubyBjb3JyZXNwb25kaW5nIG1vdXNlIGV2ZW50XG4gIGlmIChlLnR5cGUgPT09ICd0b3VjaGVuZCcgJiYgZS5jYW5jZWxhYmxlICE9PSBmYWxzZSkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAvLyBUaGUgb3JpZ2luIG1heSBoYXZlIGNoYW5nZWQgc2luY2UgdGhlIGxhc3QgYW5pbWF0aW9uIGZyYW1lLlxuICBpZiAoIWlzRHJhZ1BpZWNlVmFsaWQocywgY3VyKSkge1xuICAgIGNhbmNlbChzKTtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gY29tcGFyaW5nIHdpdGggdGhlIG9yaWdpbiB0YXJnZXQgaXMgYW4gZWFzeSB3YXkgdG8gdGVzdCB0aGF0IHRoZSBlbmQgZXZlbnRcbiAgLy8gaGFzIHRoZSBzYW1lIHRvdWNoIG9yaWdpblxuICBpZiAoZS50eXBlID09PSAndG91Y2hlbmQnICYmIGN1ci5vcmlnaW5UYXJnZXQgIT09IGUudGFyZ2V0ICYmICFjdXIuZnJvbU91dHNpZGUpIHtcbiAgICBzLmRyYWdnYWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGlmIChzLmhvdmVyZWQgJiYgIXMuaGlnaGxpZ2h0LmhvdmVyZWQpIHVwZGF0ZUhvdmVyZWRTcXVhcmVzKHMsIHVuZGVmaW5lZCk7XG4gICAgcy5kb20ucmVkcmF3KCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGJvYXJkLnVuc2V0UHJlbW92ZShzKTtcbiAgYm9hcmQudW5zZXRQcmVkcm9wKHMpO1xuICAvLyB0b3VjaGVuZCBoYXMgbm8gcG9zaXRpb247IHNvIHVzZSB0aGUgbGFzdCB0b3VjaG1vdmUgcG9zaXRpb24gaW5zdGVhZFxuICBjb25zdCBldmVudFBvcyA9IHV0aWwuZXZlbnRQb3NpdGlvbihlKSB8fCBjdXIucG9zO1xuXG4gIGlmICh0cnlTdGFydERyYWcocywgY3VyLCBldmVudFBvcykpIHtcbiAgICBjdXIuc3RhcnRlZCA9IHRydWU7XG4gIH1cblxuICBjb25zdCBib3VuZHMgPSBzLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gIGNvbnN0IGRlc3QgPVxuICAgIGJvdW5kcyAmJiB1dGlsLmdldEtleUF0RG9tUG9zKGV2ZW50UG9zLCB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pLCBzLmRpbWVuc2lvbnMsIGJvdW5kcyk7XG4gIGNvbnN0IG9yaWdpbkhhbmRCb3VuZHMgPVxuICAgIGN1ci5mcm9tT3V0c2lkZSAmJiAhY3VyLnNwYXJlXG4gICAgICA/IHMuZG9tLmJvdW5kcy5oYW5kcy5ib3VuZHMoKS5nZXQoY3VyLnBpZWNlLmNvbG9yID09PSBzLm9yaWVudGF0aW9uID8gJ2JvdHRvbScgOiAndG9wJykgfHxcbiAgICAgICAgY3VyLmZyb21PdXRzaWRlLm9yaWdpbkJvdW5kc1xuICAgICAgOiB1bmRlZmluZWQ7XG5cbiAgaWYgKGRlc3QgJiYgY3VyLnN0YXJ0ZWQgJiYgY3VyLmZyb21Cb2FyZD8ub3JpZyAhPT0gZGVzdCkge1xuICAgIGlmIChjdXIuZnJvbU91dHNpZGUgJiYgIWJvYXJkLnByb21vdGlvbkRpYWxvZ0Ryb3AocywgY3VyLnBpZWNlLCBkZXN0KSlcbiAgICAgIGJvYXJkLnVzZXJEcm9wKHMsIGN1ci5waWVjZSwgZGVzdCk7XG4gICAgZWxzZSBpZiAoY3VyLmZyb21Cb2FyZCAmJiAhYm9hcmQucHJvbW90aW9uRGlhbG9nTW92ZShzLCBjdXIuZnJvbUJvYXJkLm9yaWcsIGRlc3QpKVxuICAgICAgYm9hcmQudXNlck1vdmUocywgY3VyLmZyb21Cb2FyZC5vcmlnLCBkZXN0KTtcbiAgfSBlbHNlIGlmIChcbiAgICBzLmRyYWdnYWJsZS5kZWxldGVPbkRyb3BPZmYgJiZcbiAgICBjdXIuc3RhcnRlZCAmJlxuICAgICFkZXN0ICYmXG4gICAgKCFvcmlnaW5IYW5kQm91bmRzIHx8ICF1dGlsLmlzSW5zaWRlUmVjdChvcmlnaW5IYW5kQm91bmRzLCBldmVudFBvcykpXG4gICkge1xuICAgIGlmIChjdXIuZnJvbUJvYXJkKSBzLnBpZWNlcy5kZWxldGUoY3VyLmZyb21Cb2FyZC5vcmlnKTtcbiAgICBlbHNlIGlmIChjdXIuZnJvbU91dHNpZGUgJiYgIWN1ci5zcGFyZSkgcmVtb3ZlRnJvbUhhbmQocywgY3VyLnBpZWNlKTtcblxuICAgIGlmIChzLmRyYWdnYWJsZS5hZGRUb0hhbmRPbkRyb3BPZmYpIHtcbiAgICAgIGNvbnN0IGhhbmRCb3VuZHMgPSBzLmRvbS5ib3VuZHMuaGFuZHMuYm91bmRzKCk7XG4gICAgICBjb25zdCBoYW5kQm91bmRzVG9wID0gaGFuZEJvdW5kcy5nZXQoJ3RvcCcpO1xuICAgICAgY29uc3QgaGFuZEJvdW5kc0JvdHRvbSA9IGhhbmRCb3VuZHMuZ2V0KCdib3R0b20nKTtcbiAgICAgIGlmIChoYW5kQm91bmRzVG9wICYmIHV0aWwuaXNJbnNpZGVSZWN0KGhhbmRCb3VuZHNUb3AsIGV2ZW50UG9zKSlcbiAgICAgICAgYWRkVG9IYW5kKHMsIHtcbiAgICAgICAgICBjb2xvcjogdXRpbC5vcHBvc2l0ZShzLm9yaWVudGF0aW9uKSxcbiAgICAgICAgICByb2xlOiBjdXIucGllY2Uucm9sZSxcbiAgICAgICAgfSk7XG4gICAgICBlbHNlIGlmIChoYW5kQm91bmRzQm90dG9tICYmIHV0aWwuaXNJbnNpZGVSZWN0KGhhbmRCb3VuZHNCb3R0b20sIGV2ZW50UG9zKSlcbiAgICAgICAgYWRkVG9IYW5kKHMsIHsgY29sb3I6IHMub3JpZW50YXRpb24sIHJvbGU6IGN1ci5waWVjZS5yb2xlIH0pO1xuXG4gICAgICBib2FyZC51bnNlbGVjdChzKTtcbiAgICB9XG4gICAgdXRpbC5jYWxsVXNlckZ1bmN0aW9uKHMuZXZlbnRzLmNoYW5nZSk7XG4gIH1cblxuICBpZiAoXG4gICAgY3VyLmZyb21Cb2FyZCAmJlxuICAgIChjdXIuZnJvbUJvYXJkLm9yaWcgPT09IGN1ci5mcm9tQm9hcmQucHJldmlvdXNseVNlbGVjdGVkIHx8IGN1ci5mcm9tQm9hcmQua2V5SGFzQ2hhbmdlZCkgJiZcbiAgICAoY3VyLmZyb21Cb2FyZC5vcmlnID09PSBkZXN0IHx8ICFkZXN0KVxuICApIHtcbiAgICB1bnNlbGVjdChzLCBjdXIsIGRlc3QpO1xuICB9IGVsc2UgaWYgKFxuICAgICghZGVzdCAmJiBjdXIuZnJvbU91dHNpZGU/LmxlZnRPcmlnaW4pIHx8XG4gICAgKGN1ci5mcm9tT3V0c2lkZT8ub3JpZ2luQm91bmRzICYmXG4gICAgICB1dGlsLmlzSW5zaWRlUmVjdChjdXIuZnJvbU91dHNpZGUub3JpZ2luQm91bmRzLCBjdXIucG9zKSAmJlxuICAgICAgY3VyLmZyb21PdXRzaWRlLnByZXZpb3VzbHlTZWxlY3RlZFBpZWNlICYmXG4gICAgICB1dGlsLnNhbWVQaWVjZShjdXIuZnJvbU91dHNpZGUucHJldmlvdXNseVNlbGVjdGVkUGllY2UsIGN1ci5waWVjZSkpXG4gICkge1xuICAgIHVuc2VsZWN0KHMsIGN1ciwgZGVzdCk7XG4gIH0gZWxzZSBpZiAoIXMuc2VsZWN0YWJsZS5lbmFibGVkICYmICFzLnByb21vdGlvbi5jdXJyZW50KSB7XG4gICAgdW5zZWxlY3QocywgY3VyLCBkZXN0KTtcbiAgfVxuXG4gIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIGlmICghcy5oaWdobGlnaHQuaG92ZXJlZCAmJiAhcy5wcm9tb3Rpb24uY3VycmVudCkgcy5ob3ZlcmVkID0gdW5kZWZpbmVkO1xuICBzLmRvbS5yZWRyYXcoKTtcbn1cblxuZnVuY3Rpb24gaGFuZFBpZWNlQ2xvc2VUbyhzOiBTdGF0ZSwgcG9zOiBzZy5OdW1iZXJQYWlyKTogYm9vbGVhbiB7XG4gIGZvciAoY29uc3QgY29sb3Igb2YgY29sb3JzKSB7XG4gICAgZm9yIChjb25zdCByb2xlIG9mIHMuaGFuZHMucm9sZXMpIHtcbiAgICAgIGNvbnN0IHBpZWNlID0geyBjb2xvciwgcm9sZSB9O1xuICAgICAgY29uc3QgcmVjdCA9IHMuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcygpLmdldCh1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKSk7XG5cbiAgICAgIGlmIChyZWN0ICYmIHV0aWwuaXNOZWFyUmVjdChyZWN0LCBwb3MsIHJlY3Qud2lkdGggLyAyKSAmJiBudW1iZXJJbkhhbmQocywgcGllY2UpID4gMClcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiB1bnNlbGVjdChzOiBTdGF0ZSwgY3VyOiBEcmFnQ3VycmVudCwgZGVzdD86IHNnLktleSk6IHZvaWQge1xuICBpZiAoY3VyLmZyb21Cb2FyZCAmJiBjdXIuZnJvbUJvYXJkLm9yaWcgPT09IGRlc3QpXG4gICAgdXRpbC5jYWxsVXNlckZ1bmN0aW9uKHMuZXZlbnRzLnVuc2VsZWN0LCBjdXIuZnJvbUJvYXJkLm9yaWcpO1xuICBlbHNlIGlmIChcbiAgICBjdXIuZnJvbU91dHNpZGU/Lm9yaWdpbkJvdW5kcyAmJlxuICAgIHV0aWwuaXNJbnNpZGVSZWN0KGN1ci5mcm9tT3V0c2lkZS5vcmlnaW5Cb3VuZHMsIGN1ci5wb3MpXG4gIClcbiAgICB1dGlsLmNhbGxVc2VyRnVuY3Rpb24ocy5ldmVudHMucGllY2VVbnNlbGVjdCwgY3VyLnBpZWNlKTtcbiAgYm9hcmQudW5zZWxlY3Qocyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWwoczogU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQpIHtcbiAgICBzLmRyYWdnYWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGlmICghcy5oaWdobGlnaHQuaG92ZXJlZCkgcy5ob3ZlcmVkID0gdW5kZWZpbmVkO1xuICAgIGJvYXJkLnVuc2VsZWN0KHMpO1xuICAgIHMuZG9tLnJlZHJhdygpO1xuICB9XG59XG5cbi8vIHN1cHBvcnQgb25lIGZpbmdlciB0b3VjaCBvbmx5IG9yIGxlZnQgY2xpY2tcbmV4cG9ydCBmdW5jdGlvbiB1bndhbnRlZEV2ZW50KGU6IHNnLk1vdWNoRXZlbnQpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICAhZS5pc1RydXN0ZWQgfHxcbiAgICAoZS5idXR0b24gIT09IHVuZGVmaW5lZCAmJiBlLmJ1dHRvbiAhPT0gMCkgfHxcbiAgICAoISFlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDEpXG4gICk7XG59XG5cbmZ1bmN0aW9uIHZhbGlkRGVzdFRvSG92ZXIoczogU3RhdGUsIGtleTogc2cuS2V5KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgKCEhcy5zZWxlY3RlZCAmJiAoYm9hcmQuY2FuTW92ZShzLCBzLnNlbGVjdGVkLCBrZXkpIHx8IGJvYXJkLmNhblByZW1vdmUocywgcy5zZWxlY3RlZCwga2V5KSkpIHx8XG4gICAgKCEhcy5zZWxlY3RlZFBpZWNlICYmXG4gICAgICAoYm9hcmQuY2FuRHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIGtleSkgfHwgYm9hcmQuY2FuUHJlZHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIGtleSkpKVxuICApO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVIb3ZlcmVkU3F1YXJlcyhzOiBTdGF0ZSwga2V5OiBzZy5LZXkgfCB1bmRlZmluZWQpOiB2b2lkIHtcbiAgY29uc3Qgc3FhdXJlRWxzID0gcy5kb20uZWxlbWVudHMuYm9hcmQ/LnNxdWFyZXMuY2hpbGRyZW47XG4gIGlmICghc3FhdXJlRWxzIHx8IHMucHJvbW90aW9uLmN1cnJlbnQpIHJldHVybjtcblxuICBjb25zdCBwcmV2SG92ZXIgPSBzLmhvdmVyZWQ7XG4gIGlmIChzLmhpZ2hsaWdodC5ob3ZlcmVkIHx8IChrZXkgJiYgdmFsaWREZXN0VG9Ib3ZlcihzLCBrZXkpKSkgcy5ob3ZlcmVkID0ga2V5O1xuICBlbHNlIHMuaG92ZXJlZCA9IHVuZGVmaW5lZDtcblxuICBjb25zdCBhc1NlbnRlID0gdXRpbC5zZW50ZVBvdihzLm9yaWVudGF0aW9uKTtcbiAgY29uc3QgY3VySW5kZXggPSBzLmhvdmVyZWQgJiYgdXRpbC5kb21TcXVhcmVJbmRleE9mS2V5KHMuaG92ZXJlZCwgYXNTZW50ZSwgcy5kaW1lbnNpb25zKTtcbiAgY29uc3QgY3VySG92ZXJFbCA9IGN1ckluZGV4ICE9PSB1bmRlZmluZWQgJiYgc3FhdXJlRWxzW2N1ckluZGV4XTtcbiAgaWYgKGN1ckhvdmVyRWwpIGN1ckhvdmVyRWwuY2xhc3NMaXN0LmFkZCgnaG92ZXInKTtcblxuICBjb25zdCBwcmV2SW5kZXggPSBwcmV2SG92ZXIgJiYgdXRpbC5kb21TcXVhcmVJbmRleE9mS2V5KHByZXZIb3ZlciwgYXNTZW50ZSwgcy5kaW1lbnNpb25zKTtcbiAgY29uc3QgcHJldkhvdmVyRWwgPSBwcmV2SW5kZXggIT09IHVuZGVmaW5lZCAmJiBzcWF1cmVFbHNbcHJldkluZGV4XTtcbiAgaWYgKHByZXZIb3ZlckVsKSBwcmV2SG92ZXJFbC5jbGFzc0xpc3QucmVtb3ZlKCdob3ZlcicpO1xufVxuIiwgImltcG9ydCB7IGFuaW0gfSBmcm9tICcuL2FuaW0uanMnO1xuaW1wb3J0IHsgY2FuY2VsUHJvbW90aW9uLCBzZWxlY3RTcXVhcmUsIHVzZXJEcm9wLCB1c2VyTW92ZSB9IGZyb20gJy4vYm9hcmQuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgeyBQaWVjZSB9IGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgY2FsbFVzZXJGdW5jdGlvbiwgc2FtZVBpZWNlIH0gZnJvbSAnLi91dGlsLmpzJztcblxuLy8gQm90aCBwb2ludGVyIGFuZCBrZXlib2FyZCBjaG9pY2VzIGZpbmlzaCB0aGUgc2FtZSBwZW5kaW5nIG1vdmUgb3IgZHJvcC5cbmV4cG9ydCBmdW5jdGlvbiBjaG9vc2VQcm9tb3Rpb24oczogU3RhdGUsIHBpZWNlPzogUGllY2UpOiB2b2lkIHtcbiAgY29uc3QgY3VyID0gcy5wcm9tb3Rpb24uY3VycmVudDtcbiAgaWYgKHBpZWNlICYmIGN1cikge1xuICAgIGNvbnN0IHByb20gPSAhc2FtZVBpZWNlKGN1ci5waWVjZSwgcGllY2UpO1xuICAgIGlmIChjdXIuZHJhZ2dlZCB8fCAocy50dXJuQ29sb3IgIT09IHMuYWN0aXZlQ29sb3IgJiYgcy5hY3RpdmVDb2xvciAhPT0gJ2JvdGgnKSkge1xuICAgICAgaWYgKHMuc2VsZWN0ZWQpIHVzZXJNb3ZlKHMsIHMuc2VsZWN0ZWQsIGN1ci5rZXksIHByb20pO1xuICAgICAgZWxzZSBpZiAocy5zZWxlY3RlZFBpZWNlKSB1c2VyRHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIGN1ci5rZXksIHByb20pO1xuICAgIH0gZWxzZSBhbmltKChzKSA9PiBzZWxlY3RTcXVhcmUocywgY3VyLmtleSwgcHJvbSksIHMpO1xuXG4gICAgY2FsbFVzZXJGdW5jdGlvbihzLnByb21vdGlvbi5ldmVudHMuYWZ0ZXIsIHBpZWNlKTtcbiAgfSBlbHNlIGFuaW0oKHMpID0+IGNhbmNlbFByb21vdGlvbihzKSwgcyk7XG4gIHMucHJvbW90aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIHMuZG9tLnJlZHJhdygpO1xufVxuIiwgImltcG9ydCB7IGFuaW0gfSBmcm9tICcuL2FuaW0uanMnO1xuaW1wb3J0ICogYXMgYm9hcmQgZnJvbSAnLi9ib2FyZC5qcyc7XG5pbXBvcnQgeyBjYW5jZWwgYXMgY2FuY2VsRHJhZyB9IGZyb20gJy4vZHJhZy5qcyc7XG5pbXBvcnQgeyBjYW5jZWwgYXMgY2FuY2VsRHJhdyB9IGZyb20gJy4vZHJhdy5qcyc7XG5pbXBvcnQgeyByZW1vdmVGcm9tSGFuZCB9IGZyb20gJy4vaGFuZHMuanMnO1xuaW1wb3J0IHsgY2hvb3NlUHJvbW90aW9uIH0gZnJvbSAnLi9wcm9tb3Rpb24uanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7XG4gIGNhbGxVc2VyRnVuY3Rpb24sXG4gIGNvbXB1dGVTcXVhcmVDZW50ZXIsXG4gIGRpc3RhbmNlU3EsXG4gIGlzS2V5LFxuICBrZXkycG9zLFxuICBvcHBvc2l0ZSxcbiAgcGFyc2VQaWVjZU5hbWUsXG4gIHBpZWNlTmFtZU9mLFxuICBwb3Mya2V5LFxuICBzYW1lUGllY2UsXG4gIHNlbnRlUG92LFxufSBmcm9tICcuL3V0aWwuanMnO1xuXG50eXBlIEN1cnNvciA9IHNnLktleSB8IHNnLlBpZWNlO1xuaW50ZXJmYWNlIFRhcmdldCB7XG4gIGN1cnNvcjogQ3Vyc29yO1xuICBjZW50ZXI6IHNnLlBvcztcbn1cblxuY29uc3QgZGlyZWN0aW9uczogUmVjb3JkPHN0cmluZywgc2cuUG9zPiA9IHtcbiAgQXJyb3dMZWZ0OiBbLTEsIDBdLFxuICBBcnJvd1JpZ2h0OiBbMSwgMF0sXG4gIEFycm93VXA6IFswLCAtMV0sXG4gIEFycm93RG93bjogWzAsIDFdLFxufTtcblxuY29uc3Qga2V5Ym9hcmRBdHRyaWJ1dGVzID0gbmV3IE1hcChbXG4gIFsndGFiaW5kZXgnLCAnMCddLFxuICBbJ3JvbGUnLCAnZ3JvdXAnXSxcbiAgWydhcmlhLWxhYmVsJywgJ1Nob2dpIGJvYXJkLiBVc2UgYXJyb3cga2V5cyB0byBuYXZpZ2F0ZSwgRW50ZXIgdG8gc2VsZWN0LCBFc2NhcGUgdG8gY2FuY2VsLiddLFxuXSk7XG5jb25zdCBwcmV2aW91c0F0dHJpYnV0ZXMgPSBuZXcgV2Vha01hcDxIVE1MRWxlbWVudCwgTWFwPHN0cmluZywgc3RyaW5nIHwgbnVsbD4+KCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBmb2N1c0JvYXJkKHM6IFN0YXRlKTogdm9pZCB7XG4gIGlmIChzLmtleWJvYXJkLmVuYWJsZWQgJiYgIXMudmlld09ubHkgJiYgIXMuZG9tLmRlc3Ryb3llZClcbiAgICBzLmRvbS5lbGVtZW50cy5ib2FyZD8uYm9hcmQuZm9jdXMoeyBwcmV2ZW50U2Nyb2xsOiB0cnVlIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmluZEtleWJvYXJkKHM6IFN0YXRlLCBlbDogSFRNTEVsZW1lbnQpOiBzZy5VbmJpbmQge1xuICBjb25zdCBmb2N1cyA9ICgpID0+IGZvY3VzQm9hcmQocyk7XG4gIGNvbnN0IHJlZHJhdyA9ICgpID0+IHtcbiAgICBpZiAocy5rZXlib2FyZC5lbmFibGVkKSBzLmRvbS5yZWRyYXcoKTtcbiAgfTtcbiAgY29uc3Qga2V5ZG93biA9IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgIGlmIChcbiAgICAgICFzLmtleWJvYXJkLmVuYWJsZWQgfHxcbiAgICAgIHMudmlld09ubHkgfHxcbiAgICAgIHMuZG9tLmRlc3Ryb3llZCB8fFxuICAgICAgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gZWwgfHxcbiAgICAgIGV2ZW50LnRhcmdldCAhPT0gZWwgfHxcbiAgICAgIGV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgfHxcbiAgICAgIGV2ZW50LmlzQ29tcG9zaW5nIHx8XG4gICAgICBldmVudC5hbHRLZXkgfHxcbiAgICAgIGV2ZW50LmN0cmxLZXkgfHxcbiAgICAgIGV2ZW50Lm1ldGFLZXkgfHxcbiAgICAgIGV2ZW50LnNoaWZ0S2V5XG4gICAgKVxuICAgICAgcmV0dXJuO1xuICAgIGNvbnN0IGRpcmVjdGlvbiA9IGRpcmVjdGlvbnNbZXZlbnQua2V5XTtcbiAgICBpZiAoIWRpcmVjdGlvbiAmJiBldmVudC5rZXkgIT09ICdFbnRlcicgJiYgZXZlbnQua2V5ICE9PSAnRXNjYXBlJykgcmV0dXJuO1xuICAgIGlmICgocy5kcmFnZ2FibGUuY3VycmVudCB8fCBzLmRyYXdhYmxlLmN1cnJlbnQpICYmIGV2ZW50LmtleSAhPT0gJ0VzY2FwZScpIHJldHVybjtcblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgLy8gSG9sZGluZyBFbnRlciBtdXN0IG5vdCBzZWxlY3QgYW5kIHRoZW4gaW1tZWRpYXRlbHkgY29uZmlybSBhIHByb21vdGlvbi5cbiAgICBpZiAoZXZlbnQucmVwZWF0ICYmICFkaXJlY3Rpb24pIHJldHVybjtcblxuICAgIGlmIChldmVudC5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICBjb25zdCBoYXNTZWxlY3Rpb24gPSAhIShcbiAgICAgICAgcy5zZWxlY3RlZCB8fFxuICAgICAgICBzLnNlbGVjdGVkUGllY2UgfHxcbiAgICAgICAgcy5wcm9tb3Rpb24uY3VycmVudCB8fFxuICAgICAgICBzLmRyYWdnYWJsZS5jdXJyZW50IHx8XG4gICAgICAgIHMuZHJhd2FibGUuY3VycmVudFxuICAgICAgKTtcbiAgICAgIGJvYXJkLmNhbmNlbFByb21vdGlvbihzKTtcbiAgICAgIGNhbmNlbERyYWcocyk7XG4gICAgICBjYW5jZWxEcmF3KHMpO1xuICAgICAgYm9hcmQuY2FuY2VsTW92ZU9yRHJvcChzKTtcbiAgICAgIGlmICghaGFzU2VsZWN0aW9uKSBlbC5ibHVyKCk7XG4gICAgfSBlbHNlIGlmIChzLnByb21vdGlvbi5jdXJyZW50KSB7XG4gICAgICBjb25zdCBjdXIgPSBzLnByb21vdGlvbi5jdXJyZW50O1xuICAgICAgaWYgKGRpcmVjdGlvbikgY3VyLmtleWJvYXJkQ2hvaWNlID0gIShjdXIua2V5Ym9hcmRDaG9pY2UgPz8gdHJ1ZSk7XG4gICAgICBlbHNlIGNob29zZVByb21vdGlvbihzLCAoY3VyLmtleWJvYXJkQ2hvaWNlID8/IHRydWUpID8gY3VyLnByb21vdGVkUGllY2UgOiBjdXIucGllY2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBjdXJzb3IgPSBjdXJyZW50Q3Vyc29yKHMpO1xuICAgICAgaWYgKGRpcmVjdGlvbikgbW92ZUN1cnNvcihzLCBjdXJzb3IsIGRpcmVjdGlvbik7XG4gICAgICBlbHNlIGFjdGl2YXRlKHMsIGN1cnNvcik7XG4gICAgfVxuICAgIHMuZG9tLnJlZHJhdygpO1xuICB9O1xuXG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBrZXlkb3duKTtcbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZm9jdXMsIHRydWUpO1xuICBlbC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIHJlZHJhdyk7XG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCByZWRyYXcpO1xuICByZXR1cm4gKCkgPT4ge1xuICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBrZXlkb3duKTtcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmb2N1cywgdHJ1ZSk7XG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXMnLCByZWRyYXcpO1xuICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JsdXInLCByZWRyYXcpO1xuICAgIHMua2V5Ym9hcmQuZm9jdXNlZCA9IGZhbHNlO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3luY0tleWJvYXJkU3RhdGUoczogU3RhdGUsIGVsZW1lbnRzOiBzZy5Cb2FyZEVsZW1lbnRzKTogdm9pZCB7XG4gIGNvbnN0IGVuYWJsZWQgPSBzLmtleWJvYXJkLmVuYWJsZWQgJiYgIXMudmlld09ubHk7XG4gIGlmIChlbmFibGVkKSBjdXJyZW50Q3Vyc29yKHMpO1xuICBzLmtleWJvYXJkLmZvY3VzZWQgPSBlbmFibGVkICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgPT09IGVsZW1lbnRzLmJvYXJkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyS2V5Ym9hcmQoczogU3RhdGUsIGVsZW1lbnRzOiBzZy5Cb2FyZEVsZW1lbnRzKTogdm9pZCB7XG4gIGNvbnN0IGVuYWJsZWQgPSBzLmtleWJvYXJkLmVuYWJsZWQgJiYgIXMudmlld09ubHk7XG4gIGNvbnN0IGVsID0gZWxlbWVudHMuYm9hcmQ7XG4gIGNvbnN0IHByZXZpb3VzID0gcHJldmlvdXNBdHRyaWJ1dGVzLmdldChlbCk7XG4gIGlmIChlbmFibGVkKSB7XG4gICAgaWYgKCFwcmV2aW91cykge1xuICAgICAgcHJldmlvdXNBdHRyaWJ1dGVzLnNldChcbiAgICAgICAgZWwsXG4gICAgICAgIG5ldyBNYXAoQXJyYXkuZnJvbShrZXlib2FyZEF0dHJpYnV0ZXMua2V5cygpLCAobmFtZSkgPT4gW25hbWUsIGVsLmdldEF0dHJpYnV0ZShuYW1lKV0pKSxcbiAgICAgICk7XG4gICAgICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2Yga2V5Ym9hcmRBdHRyaWJ1dGVzKSBlbC5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChwcmV2aW91cykge1xuICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBwcmV2aW91cykge1xuICAgICAgaWYgKHZhbHVlID09PSBudWxsKSBlbC5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgICBlbHNlIGVsLnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gICAgfVxuICAgIHByZXZpb3VzQXR0cmlidXRlcy5kZWxldGUoZWwpO1xuICB9XG4gIGlmICghZW5hYmxlZCAmJiAhcHJldmlvdXMpIHJldHVybjtcblxuICBjb25zdCBjaG9pY2VzID0gZWxlbWVudHMucHJvbW90aW9uPy5xdWVyeVNlbGVjdG9yQWxsKCdwaWVjZScpO1xuICBjaG9pY2VzPy5mb3JFYWNoKChwaWVjZSwgaW5kZXgpID0+IHtcbiAgICBwaWVjZS5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgJ2tleWJvYXJkLWN1cnNvcicsXG4gICAgICBlbmFibGVkICYmXG4gICAgICAgICEhcy5wcm9tb3Rpb24uY3VycmVudCAmJlxuICAgICAgICBpbmRleCA9PT0gKChzLnByb21vdGlvbi5jdXJyZW50LmtleWJvYXJkQ2hvaWNlID8/IHRydWUpID8gMCA6IDEpLFxuICAgICk7XG4gICAgcGllY2UuY2xhc3NMaXN0LnRvZ2dsZSgna2V5Ym9hcmQtZm9jdXNlZCcsIHMua2V5Ym9hcmQuZm9jdXNlZCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjdXJyZW50Q3Vyc29yKHM6IFN0YXRlKTogQ3Vyc29yIHtcbiAgY29uc3QgY3VyID0gcy5rZXlib2FyZC5jdXJyZW50O1xuICBpZiAoaXNLZXkoY3VyKSkge1xuICAgIGNvbnN0IFtmaWxlLCByYW5rXSA9IGtleTJwb3MoY3VyKTtcbiAgICBpZiAoZmlsZSA+PSAwICYmIGZpbGUgPCBzLmRpbWVuc2lvbnMuZmlsZXMgJiYgcmFuayA+PSAwICYmIHJhbmsgPCBzLmRpbWVuc2lvbnMucmFua3MpXG4gICAgICByZXR1cm4gY3VyO1xuICB9IGVsc2UgaWYgKFxuICAgIGN1ciAmJlxuICAgIHMuaGFuZHMucm9sZXMuaW5jbHVkZXMoY3VyLnJvbGUpICYmXG4gICAgaGFuZFRhcmdldHMocywgY3VyLmNvbG9yKS5zb21lKFxuICAgICAgKHRhcmdldCkgPT4gIWlzS2V5KHRhcmdldC5jdXJzb3IpICYmIHRhcmdldC5jdXJzb3Iucm9sZSA9PT0gY3VyLnJvbGUsXG4gICAgKVxuICApXG4gICAgcmV0dXJuIGN1cjtcbiAgcy5rZXlib2FyZC5jdXJyZW50ID0gcG9zMmtleShbXG4gICAgTWF0aC5mbG9vcihzLmRpbWVuc2lvbnMuZmlsZXMgLyAyKSxcbiAgICBNYXRoLmZsb29yKHMuZGltZW5zaW9ucy5yYW5rcyAvIDIpLFxuICBdKTtcbiAgcmV0dXJuIHMua2V5Ym9hcmQuY3VycmVudDtcbn1cblxuZnVuY3Rpb24gc2NyZWVuUG9zKHM6IFN0YXRlLCBrZXk6IHNnLktleSk6IHNnLlBvcyB7XG4gIGNvbnN0IFtmaWxlLCByYW5rXSA9IGtleTJwb3Moa2V5KTtcbiAgcmV0dXJuIHNlbnRlUG92KHMub3JpZW50YXRpb24pXG4gICAgPyBbcy5kaW1lbnNpb25zLmZpbGVzIC0gMSAtIGZpbGUsIHJhbmtdXG4gICAgOiBbZmlsZSwgcy5kaW1lbnNpb25zLnJhbmtzIC0gMSAtIHJhbmtdO1xufVxuXG5mdW5jdGlvbiBzY3JlZW5LZXkoczogU3RhdGUsIFt4LCB5XTogc2cuUG9zKTogc2cuS2V5IHtcbiAgcmV0dXJuIHBvczJrZXkoXG4gICAgc2VudGVQb3Yocy5vcmllbnRhdGlvbikgPyBbcy5kaW1lbnNpb25zLmZpbGVzIC0gMSAtIHgsIHldIDogW3gsIHMuZGltZW5zaW9ucy5yYW5rcyAtIDEgLSB5XSxcbiAgKTtcbn1cblxuZnVuY3Rpb24gY2VudGVyKHJlY3Q6IERPTVJlY3QpOiBzZy5Qb3Mge1xuICByZXR1cm4gW3JlY3QubGVmdCArIHJlY3Qud2lkdGggLyAyLCByZWN0LnRvcCArIHJlY3QuaGVpZ2h0IC8gMl07XG59XG5cbmZ1bmN0aW9uIGhhbmRUYXJnZXRzKHM6IFN0YXRlLCBjb2xvcjogc2cuQ29sb3IpOiBUYXJnZXRbXSB7XG4gIGNvbnN0IGhhbmQgPSBzLmRvbS5lbGVtZW50cy5oYW5kcz8uW2NvbG9yID09PSBzLm9yaWVudGF0aW9uID8gJ2JvdHRvbScgOiAndG9wJ107XG4gIGlmICghaGFuZCB8fCBnZXRDb21wdXRlZFN0eWxlKGhhbmQpLnZpc2liaWxpdHkgPT09ICdoaWRkZW4nKSByZXR1cm4gW107XG4gIGNvbnN0IHRhcmdldHM6IFRhcmdldFtdID0gW107XG4gIGZvciAoY29uc3QgW25hbWUsIGJvdW5kc10gb2Ygcy5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzKCkpIHtcbiAgICBjb25zdCBwaWVjZSA9IHBhcnNlUGllY2VOYW1lKG5hbWUpO1xuICAgIC8vIEluY2x1ZGUgZW1wdHkgc2xvdHM7IHNlbGVjdGlvbiBzdGlsbCB1c2VzIHRoZSBleGlzdGluZyBoYW5kIHJlc3RyaWN0aW9ucy5cbiAgICBpZiAocGllY2UuY29sb3IgPT09IGNvbG9yICYmIGJvdW5kcy53aWR0aCA+IDAgJiYgYm91bmRzLmhlaWdodCA+IDApXG4gICAgICB0YXJnZXRzLnB1c2goeyBjdXJzb3I6IHBpZWNlLCBjZW50ZXI6IGNlbnRlcihib3VuZHMpIH0pO1xuICB9XG4gIHJldHVybiB0YXJnZXRzO1xufVxuXG5mdW5jdGlvbiBuZWFyZXN0KHRhcmdldHM6IFRhcmdldFtdLCBvcmlnaW46IHNnLlBvcyk6IFRhcmdldCB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiB0YXJnZXRzLnJlZHVjZTxUYXJnZXQgfCB1bmRlZmluZWQ+KFxuICAgIChiZXN0LCB0YXJnZXQpID0+XG4gICAgICAhYmVzdCB8fCBkaXN0YW5jZVNxKHRhcmdldC5jZW50ZXIsIG9yaWdpbikgPCBkaXN0YW5jZVNxKGJlc3QuY2VudGVyLCBvcmlnaW4pID8gdGFyZ2V0IDogYmVzdCxcbiAgICB1bmRlZmluZWQsXG4gICk7XG59XG5cbmZ1bmN0aW9uIGJleW9uZChyZWN0OiBET01SZWN0LCBib3VuZHM6IERPTVJlY3QsIFtkeCwgZHldOiBzZy5Qb3MpOiBib29sZWFuIHtcbiAgcmV0dXJuIGR4IDwgMFxuICAgID8gcmVjdC5yaWdodCA8PSBib3VuZHMubGVmdCArIDFcbiAgICA6IGR4ID4gMFxuICAgICAgPyByZWN0LmxlZnQgPj0gYm91bmRzLnJpZ2h0IC0gMVxuICAgICAgOiBkeSA8IDBcbiAgICAgICAgPyByZWN0LmJvdHRvbSA8PSBib3VuZHMudG9wICsgMVxuICAgICAgICA6IHJlY3QudG9wID49IGJvdW5kcy5ib3R0b20gLSAxO1xufVxuXG5mdW5jdGlvbiBtb3ZlQ3Vyc29yKHM6IFN0YXRlLCBjdXJzb3I6IEN1cnNvciwgZGlyZWN0aW9uOiBzZy5Qb3MpOiB2b2lkIHtcbiAgY29uc3QgYm91bmRzID0gcy5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpO1xuICBpZiAoIWJvdW5kcyB8fCAhYm91bmRzLndpZHRoIHx8ICFib3VuZHMuaGVpZ2h0KSByZXR1cm47XG4gIGlmIChpc0tleShjdXJzb3IpKSB7XG4gICAgY29uc3QgW3gsIHldID0gc2NyZWVuUG9zKHMsIGN1cnNvcik7XG4gICAgY29uc3QgbmV4dDogc2cuUG9zID0gW3ggKyBkaXJlY3Rpb25bMF0sIHkgKyBkaXJlY3Rpb25bMV1dO1xuICAgIGlmIChcbiAgICAgIG5leHRbMF0gPj0gMCAmJlxuICAgICAgbmV4dFswXSA8IHMuZGltZW5zaW9ucy5maWxlcyAmJlxuICAgICAgbmV4dFsxXSA+PSAwICYmXG4gICAgICBuZXh0WzFdIDwgcy5kaW1lbnNpb25zLnJhbmtzXG4gICAgKSB7XG4gICAgICBzLmtleWJvYXJkLmN1cnJlbnQgPSBzY3JlZW5LZXkocywgbmV4dCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHRhcmdldHM6IFRhcmdldFtdID0gW107XG4gICAgZm9yIChjb25zdCBbc2xvdCwgcmVjdF0gb2Ygcy5kb20uYm91bmRzLmhhbmRzLmJvdW5kcygpKSB7XG4gICAgICBpZiAoYmV5b25kKHJlY3QsIGJvdW5kcywgZGlyZWN0aW9uKSlcbiAgICAgICAgdGFyZ2V0cy5wdXNoKFxuICAgICAgICAgIC4uLmhhbmRUYXJnZXRzKHMsIHNsb3QgPT09ICdib3R0b20nID8gcy5vcmllbnRhdGlvbiA6IG9wcG9zaXRlKHMub3JpZW50YXRpb24pKSxcbiAgICAgICAgKTtcbiAgICB9XG4gICAgY29uc3Qgb3JpZ2luID0gY29tcHV0ZVNxdWFyZUNlbnRlcihjdXJzb3IsIHNlbnRlUG92KHMub3JpZW50YXRpb24pLCBzLmRpbWVuc2lvbnMsIGJvdW5kcyk7XG4gICAgcy5rZXlib2FyZC5jdXJyZW50ID0gbmVhcmVzdCh0YXJnZXRzLCBvcmlnaW4pPy5jdXJzb3IgPz8gY3Vyc29yO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IHJlY3QgPSBzLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMoKS5nZXQocGllY2VOYW1lT2YoY3Vyc29yKSk7XG4gICAgaWYgKCFyZWN0IHx8ICFyZWN0LndpZHRoIHx8ICFyZWN0LmhlaWdodCkge1xuICAgICAgcy5rZXlib2FyZC5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgICAgY3VycmVudEN1cnNvcihzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgb3JpZ2luID0gY2VudGVyKHJlY3QpO1xuICAgIGNvbnN0IFtkeCwgZHldID0gZGlyZWN0aW9uO1xuICAgIGNvbnN0IHRhcmdldHMgPSBoYW5kVGFyZ2V0cyhzLCBjdXJzb3IuY29sb3IpLmZpbHRlcigodGFyZ2V0KSA9PiB7XG4gICAgICBjb25zdCB4ID0gdGFyZ2V0LmNlbnRlclswXSAtIG9yaWdpblswXTtcbiAgICAgIGNvbnN0IHkgPSB0YXJnZXQuY2VudGVyWzFdIC0gb3JpZ2luWzFdO1xuICAgICAgY29uc3QgZm9yd2FyZCA9IHggKiBkeCArIHkgKiBkeTtcbiAgICAgIGNvbnN0IHNpZGV3YXlzID0gTWF0aC5hYnMoeCAqIGR5IC0geSAqIGR4KTtcbiAgICAgIHJldHVybiBmb3J3YXJkID4gMSAmJiBzaWRld2F5cyA8PSBmb3J3YXJkICsgMTtcbiAgICB9KTtcbiAgICAvLyBUaGUgbmVhcmVzdCBib2FyZCBlZGdlIGlzIGEgY2FuZGlkYXRlIG9ubHkgd2hlbiBwb2ludGluZyBiYWNrIHRvd2FyZCBpdC5cbiAgICBpZiAoXG4gICAgICAoZHggPiAwICYmIG9yaWdpblswXSA8IGJvdW5kcy5sZWZ0KSB8fFxuICAgICAgKGR4IDwgMCAmJiBvcmlnaW5bMF0gPiBib3VuZHMucmlnaHQpIHx8XG4gICAgICAoZHkgPiAwICYmIG9yaWdpblsxXSA8IGJvdW5kcy50b3ApIHx8XG4gICAgICAoZHkgPCAwICYmIG9yaWdpblsxXSA+IGJvdW5kcy5ib3R0b20pXG4gICAgKSB7XG4gICAgICBjb25zdCB4ID0gTWF0aC5tYXgoXG4gICAgICAgIDAsXG4gICAgICAgIE1hdGgubWluKFxuICAgICAgICAgIHMuZGltZW5zaW9ucy5maWxlcyAtIDEsXG4gICAgICAgICAgTWF0aC5mbG9vcigoKG9yaWdpblswXSAtIGJvdW5kcy5sZWZ0KSAvIGJvdW5kcy53aWR0aCkgKiBzLmRpbWVuc2lvbnMuZmlsZXMpLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICAgIGNvbnN0IHkgPSBNYXRoLm1heChcbiAgICAgICAgMCxcbiAgICAgICAgTWF0aC5taW4oXG4gICAgICAgICAgcy5kaW1lbnNpb25zLnJhbmtzIC0gMSxcbiAgICAgICAgICBNYXRoLmZsb29yKCgob3JpZ2luWzFdIC0gYm91bmRzLnRvcCkgLyBib3VuZHMuaGVpZ2h0KSAqIHMuZGltZW5zaW9ucy5yYW5rcyksXG4gICAgICAgICksXG4gICAgICApO1xuICAgICAgY29uc3Qga2V5ID0gc2NyZWVuS2V5KHMsIFt4LCB5XSk7XG4gICAgICB0YXJnZXRzLnB1c2goe1xuICAgICAgICBjdXJzb3I6IGtleSxcbiAgICAgICAgY2VudGVyOiBjb21wdXRlU3F1YXJlQ2VudGVyKGtleSwgc2VudGVQb3Yocy5vcmllbnRhdGlvbiksIHMuZGltZW5zaW9ucywgYm91bmRzKSxcbiAgICAgIH0pO1xuICAgIH1cbiAgICBzLmtleWJvYXJkLmN1cnJlbnQgPSBuZWFyZXN0KHRhcmdldHMsIG9yaWdpbik/LmN1cnNvciA/PyBjdXJzb3I7XG4gIH1cbn1cblxuZnVuY3Rpb24gYWN0aXZhdGUoczogU3RhdGUsIGN1cnNvcjogQ3Vyc29yKTogdm9pZCB7XG4gIGJvYXJkLnVuc2V0UHJlbW92ZShzKTtcbiAgYm9hcmQudW5zZXRQcmVkcm9wKHMpO1xuXG4gIGNvbnN0IHdhc1NlbGVjdGVkID0gaXNLZXkoY3Vyc29yKVxuICAgID8gcy5zZWxlY3RlZCA9PT0gY3Vyc29yXG4gICAgOiAhIXMuc2VsZWN0ZWRQaWVjZSAmJiBzYW1lUGllY2Uocy5zZWxlY3RlZFBpZWNlLCBjdXJzb3IpO1xuICBpZiAoIWlzS2V5KGN1cnNvcikpIHtcbiAgICBpZiAocy5zZWxlY3RhYmxlLmRlbGV0ZU9uVG91Y2gpIHtcbiAgICAgIHJlbW92ZUZyb21IYW5kKHMsIGN1cnNvcik7XG4gICAgICBib2FyZC51bnNlbGVjdChzKTtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24ocy5ldmVudHMuY2hhbmdlKTtcbiAgICB9IGVsc2UgYm9hcmQuc2VsZWN0UGllY2UocywgY3Vyc29yKTtcbiAgfSBlbHNlIGlmIChzLnNlbGVjdGFibGUuZGVsZXRlT25Ub3VjaCkgYm9hcmQuZGVsZXRlUGllY2UocywgY3Vyc29yKTtcbiAgZWxzZSBpZiAoXG4gICAgIShzLnNlbGVjdGVkICYmIGJvYXJkLnByb21vdGlvbkRpYWxvZ01vdmUocywgcy5zZWxlY3RlZCwgY3Vyc29yKSkgJiZcbiAgICAhKHMuc2VsZWN0ZWRQaWVjZSAmJiBib2FyZC5wcm9tb3Rpb25EaWFsb2dEcm9wKHMsIHMuc2VsZWN0ZWRQaWVjZSwgY3Vyc29yKSlcbiAgKVxuICAgIGFuaW0oKHN0YXRlKSA9PiBib2FyZC5zZWxlY3RTcXVhcmUoc3RhdGUsIGN1cnNvciksIHMpO1xuXG4gIC8vIFBvaW50ZXIgY2xpY2tzIGZpbmlzaCB0aGlzIHRvZ2dsZSBvbiBtb3VzZXVwIHdoZW4gZHJhZ2dpbmcgaXMgZW5hYmxlZC5cbiAgaWYgKHdhc1NlbGVjdGVkICYmIHMuZHJhZ2dhYmxlLmVuYWJsZWQpIHtcbiAgICBpZiAoaXNLZXkoY3Vyc29yKSAmJiBzLnNlbGVjdGVkID09PSBjdXJzb3IpIHtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24ocy5ldmVudHMudW5zZWxlY3QsIGN1cnNvcik7XG4gICAgICBib2FyZC51bnNlbGVjdChzKTtcbiAgICB9IGVsc2UgaWYgKCFpc0tleShjdXJzb3IpICYmIHMuc2VsZWN0ZWRQaWVjZSAmJiBzYW1lUGllY2Uocy5zZWxlY3RlZFBpZWNlLCBjdXJzb3IpKSB7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHMuZXZlbnRzLnBpZWNlVW5zZWxlY3QsIGN1cnNvcik7XG4gICAgICBib2FyZC51bnNlbGVjdChzKTtcbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBjYW5jZWxQcm9tb3Rpb24gfSBmcm9tICcuL2JvYXJkLmpzJztcbmltcG9ydCAqIGFzIGRyYWcgZnJvbSAnLi9kcmFnLmpzJztcbmltcG9ydCAqIGFzIGRyYXcgZnJvbSAnLi9kcmF3LmpzJztcbmltcG9ydCB7IGJpbmRLZXlib2FyZCwgZm9jdXNCb2FyZCB9IGZyb20gJy4va2V5Ym9hcmQuanMnO1xuaW1wb3J0IHsgY2hvb3NlUHJvbW90aW9uIH0gZnJvbSAnLi9wcm9tb3Rpb24uanMnO1xuaW1wb3J0IHsgdXNlc0JvdW5kcyB9IGZyb20gJy4vc2hhcGVzLmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQge1xuICBldmVudFBvc2l0aW9uLFxuICBnZXRIYW5kUGllY2VBdERvbVBvcyxcbiAgaXNNaWRkbGVCdXR0b24sXG4gIGlzUGllY2VOb2RlLFxuICBpc1JpZ2h0QnV0dG9uLFxufSBmcm9tICcuL3V0aWwuanMnO1xuXG50eXBlIE1vdWNoQmluZCA9IChlOiBzZy5Nb3VjaEV2ZW50KSA9PiB2b2lkO1xudHlwZSBTdGF0ZU1vdWNoQmluZCA9IChkOiBTdGF0ZSwgZTogc2cuTW91Y2hFdmVudCkgPT4gdm9pZDtcblxuZnVuY3Rpb24gY2xlYXJCb3VuZHMoczogU3RhdGUpOiB2b2lkIHtcbiAgcy5kb20uYm91bmRzLmJvYXJkLmJvdW5kcy5jbGVhcigpO1xuICBzLmRvbS5ib3VuZHMuaGFuZHMuYm91bmRzLmNsZWFyKCk7XG4gIHMuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcy5jbGVhcigpO1xufVxuXG5mdW5jdGlvbiBvblJlc2l6ZShzOiBTdGF0ZSk6ICgpID0+IHZvaWQge1xuICByZXR1cm4gKCkgPT4ge1xuICAgIGNsZWFyQm91bmRzKHMpO1xuICAgIGlmICh1c2VzQm91bmRzKHMuZHJhd2FibGUuc2hhcGVzLmNvbmNhdChzLmRyYXdhYmxlLmF1dG9TaGFwZXMpKSkgcy5kb20ucmVkcmF3U2hhcGVzKCk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kQm9hcmQoczogU3RhdGUsIGJvYXJkRWxzOiBzZy5Cb2FyZEVsZW1lbnRzKTogc2cuVW5iaW5kIHtcbiAgb2JzZXJ2ZVJlc2l6ZShzLCBib2FyZEVscy5ib2FyZCk7XG4gIGNvbnN0IHVuYmluZHM6IHNnLlVuYmluZFtdID0gW107XG5cbiAgaWYgKCFzLnZpZXdPbmx5KSB7XG4gICAgY29uc3QgcGllY2VzRWwgPSBib2FyZEVscy5waWVjZXM7XG4gICAgY29uc3QgcHJvbW90aW9uRWwgPSBib2FyZEVscy5wcm9tb3Rpb247XG5cbiAgICAvLyBDYW5ub3QgYmUgcGFzc2l2ZSwgYmVjYXVzZSB3ZSBwcmV2ZW50IHRvdWNoIHNjcm9sbGluZyBhbmQgZHJhZ2dpbmcgb2Ygc2VsZWN0ZWQgZWxlbWVudHMuXG4gICAgY29uc3Qgb25TdGFydCA9IHN0YXJ0RHJhZ09yRHJhdyhzKSBhcyBFdmVudExpc3RlbmVyO1xuICAgIGZvciAoY29uc3QgZXYgb2YgWyd0b3VjaHN0YXJ0JywgJ21vdXNlZG93biddKVxuICAgICAgdW5iaW5kcy5wdXNoKHVuYmluZGFibGUocGllY2VzRWwsIGV2LCBvblN0YXJ0LCB7IHBhc3NpdmU6IGZhbHNlIH0pKTtcbiAgICB1bmJpbmRzLnB1c2goXG4gICAgICB1bmJpbmRhYmxlKHBpZWNlc0VsLCAnY29udGV4dG1lbnUnLCAoZSkgPT4ge1xuICAgICAgICBpZiAocy5kaXNhYmxlQ29udGV4dE1lbnUgfHwgcy5kcmF3YWJsZS5lbmFibGVkKSBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9KSxcbiAgICApO1xuXG4gICAgaWYgKHByb21vdGlvbkVsKSB7XG4gICAgICBjb25zdCBwaWVjZVNlbGVjdGlvbiA9IChlOiBzZy5Nb3VjaEV2ZW50KSA9PiBwcm9tb3RlKHMsIGUpO1xuICAgICAgdW5iaW5kcy5wdXNoKHVuYmluZGFibGUocHJvbW90aW9uRWwsICdjbGljaycsIHBpZWNlU2VsZWN0aW9uIGFzIEV2ZW50TGlzdGVuZXIpKTtcbiAgICAgIHVuYmluZHMucHVzaChcbiAgICAgICAgdW5iaW5kYWJsZShwcm9tb3Rpb25FbCwgJ2NvbnRleHRtZW51JywgKGUpID0+IHtcbiAgICAgICAgICBpZiAocy5kaXNhYmxlQ29udGV4dE1lbnUpIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfSksXG4gICAgICApO1xuICAgIH1cblxuICAgIHVuYmluZHMucHVzaChiaW5kS2V5Ym9hcmQocywgYm9hcmRFbHMuYm9hcmQpKTtcbiAgfVxuXG4gIHJldHVybiAoKSA9PiB7XG4gICAgdW5iaW5kcy5mb3JFYWNoKChmKSA9PiB7XG4gICAgICBmKCk7XG4gICAgfSk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kSGFuZChzOiBTdGF0ZSwgaGFuZEVsOiBIVE1MRWxlbWVudCk6IHNnLlVuYmluZCB7XG4gIG9ic2VydmVSZXNpemUocywgaGFuZEVsKTtcbiAgY29uc3QgdW5iaW5kczogc2cuVW5iaW5kW10gPSBbXTtcblxuICBpZiAoIXMudmlld09ubHkpIHtcbiAgICBjb25zdCBvblN0YXJ0ID0gc3RhcnREcmFnRnJvbUhhbmQocykgYXMgRXZlbnRMaXN0ZW5lcjtcbiAgICBmb3IgKGNvbnN0IGV2IG9mIFsnbW91c2Vkb3duJywgJ3RvdWNoc3RhcnQnXSlcbiAgICAgIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKGhhbmRFbCwgZXYsIG9uU3RhcnQsIHsgcGFzc2l2ZTogZmFsc2UgfSkpO1xuXG4gICAgdW5iaW5kcy5wdXNoKFxuICAgICAgdW5iaW5kYWJsZShoYW5kRWwsICdjbGljaycsICgpID0+IHtcbiAgICAgICAgaWYgKHMucHJvbW90aW9uLmN1cnJlbnQpIHtcbiAgICAgICAgICBjYW5jZWxQcm9tb3Rpb24ocyk7XG4gICAgICAgICAgcy5kb20ucmVkcmF3KCk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgdW5iaW5kYWJsZShoYW5kRWwsICdjb250ZXh0bWVudScsIChlKSA9PiB7XG4gICAgICAgIGlmIChzLmRpc2FibGVDb250ZXh0TWVudSB8fCBzLmRyYXdhYmxlLmVuYWJsZWQpIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH0pLFxuICAgICk7XG5cbiAgICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZShoYW5kRWwsICdtb3VzZWRvd24nLCAoKSA9PiBmb2N1c0JvYXJkKHMpLCB7IGNhcHR1cmU6IHRydWUgfSkpO1xuICB9XG5cbiAgcmV0dXJuICgpID0+IHtcbiAgICB1bmJpbmRzLmZvckVhY2goKGYpID0+IHtcbiAgICAgIGYoKTtcbiAgICB9KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gb2JzZXJ2ZVJlc2l6ZShzOiBTdGF0ZSwgZWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gIGlmICgnUmVzaXplT2JzZXJ2ZXInIGluIHdpbmRvdykge1xuICAgIGlmICghcy5kb20ucmVzaXplT2JzZXJ2ZXIpIHMuZG9tLnJlc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKG9uUmVzaXplKHMpKTtcbiAgICBzLmRvbS5yZXNpemVPYnNlcnZlci5vYnNlcnZlKGVsKTtcbiAgfVxufVxuXG4vLyByZXR1cm5zIHRoZSB1bmJpbmQgZnVuY3Rpb25cbmV4cG9ydCBmdW5jdGlvbiBiaW5kRG9jdW1lbnQoczogU3RhdGUpOiBzZy5VbmJpbmQge1xuICBjb25zdCB1bmJpbmRzOiBzZy5VbmJpbmRbXSA9IFtdO1xuICB1bmJpbmRzLnB1c2goKCkgPT4gcy5kb20ucmVzaXplT2JzZXJ2ZXI/LmRpc2Nvbm5lY3QoKSk7XG5cbiAgLy8gT2xkIHZlcnNpb25zIG9mIEVkZ2UgYW5kIFNhZmFyaSBkbyBub3Qgc3VwcG9ydCBSZXNpemVPYnNlcnZlci4gU2VuZFxuICAvLyBzaG9naWdyb3VuZC5yZXNpemUgaWYgYSB1c2VyIGFjdGlvbiBoYXMgY2hhbmdlZCB0aGUgYm91bmRzIG9mIHRoZSBib2FyZC5cbiAgaWYgKCEoJ1Jlc2l6ZU9ic2VydmVyJyBpbiB3aW5kb3cpKSB7XG4gICAgdW5iaW5kcy5wdXNoKHVuYmluZGFibGUoZG9jdW1lbnQuYm9keSwgJ3Nob2dpZ3JvdW5kLnJlc2l6ZScsIG9uUmVzaXplKHMpKSk7XG4gIH1cblxuICBpZiAoIXMudmlld09ubHkpIHtcbiAgICBjb25zdCBvbm1vdmUgPSBkcmFnT3JEcmF3KHMsIGRyYWcubW92ZSwgZHJhdy5tb3ZlKTtcbiAgICBjb25zdCBvbmVuZCA9IGRyYWdPckRyYXcocywgZHJhZy5lbmQsIGRyYXcuZW5kKTtcbiAgICBjb25zdCBvbmNhbmNlbCA9IGRyYWdPckRyYXcocywgZHJhZy5jYW5jZWwsIGRyYXcuY2FuY2VsKTtcblxuICAgIGZvciAoY29uc3QgZXYgb2YgWyd0b3VjaG1vdmUnLCAnbW91c2Vtb3ZlJ10pXG4gICAgICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZShkb2N1bWVudCwgZXYsIG9ubW92ZSBhcyBFdmVudExpc3RlbmVyKSk7XG4gICAgZm9yIChjb25zdCBldiBvZiBbJ3RvdWNoZW5kJywgJ21vdXNldXAnXSlcbiAgICAgIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKGRvY3VtZW50LCBldiwgb25lbmQgYXMgRXZlbnRMaXN0ZW5lcikpO1xuICAgIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKGRvY3VtZW50LCAndG91Y2hjYW5jZWwnLCBvbmNhbmNlbCBhcyBFdmVudExpc3RlbmVyKSk7XG5cbiAgICB1bmJpbmRzLnB1c2goXG4gICAgICB1bmJpbmRhYmxlKGRvY3VtZW50LCAnc2Nyb2xsJywgKCkgPT4gY2xlYXJCb3VuZHMocyksIHsgY2FwdHVyZTogdHJ1ZSwgcGFzc2l2ZTogdHJ1ZSB9KSxcbiAgICApO1xuICAgIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKHdpbmRvdywgJ3Jlc2l6ZScsICgpID0+IGNsZWFyQm91bmRzKHMpLCB7IHBhc3NpdmU6IHRydWUgfSkpO1xuICB9XG5cbiAgcmV0dXJuICgpID0+XG4gICAgdW5iaW5kcy5mb3JFYWNoKChmKSA9PiB7XG4gICAgICBmKCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHVuYmluZGFibGUoXG4gIGVsOiBFdmVudFRhcmdldCxcbiAgZXZlbnROYW1lOiBzdHJpbmcsXG4gIGNhbGxiYWNrOiBFdmVudExpc3RlbmVyLFxuICBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMsXG4pOiBzZy5VbmJpbmQge1xuICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2ssIG9wdGlvbnMpO1xuICByZXR1cm4gKCkgPT4gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrLCBvcHRpb25zKTtcbn1cblxuZnVuY3Rpb24gc3RhcnREcmFnT3JEcmF3KHM6IFN0YXRlKTogTW91Y2hCaW5kIHtcbiAgcmV0dXJuIChlKSA9PiB7XG4gICAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQpIGRyYWcuY2FuY2VsKHMpO1xuICAgIGVsc2UgaWYgKHMuZHJhd2FibGUuY3VycmVudCkgZHJhdy5jYW5jZWwocyk7XG4gICAgZWxzZSBpZiAoZS5zaGlmdEtleSB8fCBpc1JpZ2h0QnV0dG9uKGUpIHx8IHMuZHJhd2FibGUuZm9yY2VkKSB7XG4gICAgICBpZiAocy5kcmF3YWJsZS5lbmFibGVkKSBkcmF3LnN0YXJ0KHMsIGUpO1xuICAgIH0gZWxzZSBpZiAoIXMudmlld09ubHkgJiYgIWRyYWcudW53YW50ZWRFdmVudChlKSkgZHJhZy5zdGFydChzLCBlKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZHJhZ09yRHJhdyhzOiBTdGF0ZSwgd2l0aERyYWc6IFN0YXRlTW91Y2hCaW5kLCB3aXRoRHJhdzogU3RhdGVNb3VjaEJpbmQpOiBNb3VjaEJpbmQge1xuICByZXR1cm4gKGUpID0+IHtcbiAgICBpZiAocy5kcmF3YWJsZS5jdXJyZW50KSB7XG4gICAgICBpZiAocy5kcmF3YWJsZS5lbmFibGVkKSB3aXRoRHJhdyhzLCBlKTtcbiAgICB9IGVsc2UgaWYgKCFzLnZpZXdPbmx5KSB3aXRoRHJhZyhzLCBlKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3RhcnREcmFnRnJvbUhhbmQoczogU3RhdGUpOiBNb3VjaEJpbmQge1xuICByZXR1cm4gKGUpID0+IHtcbiAgICBpZiAocy5wcm9tb3Rpb24uY3VycmVudCkgcmV0dXJuO1xuXG4gICAgY29uc3QgcG9zID0gZXZlbnRQb3NpdGlvbihlKTtcbiAgICBjb25zdCBwaWVjZSA9IHBvcyAmJiBnZXRIYW5kUGllY2VBdERvbVBvcyhwb3MsIHMuaGFuZHMucm9sZXMsIHMuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcygpKTtcblxuICAgIGlmIChwaWVjZSkge1xuICAgICAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQpIGRyYWcuY2FuY2VsKHMpO1xuICAgICAgZWxzZSBpZiAocy5kcmF3YWJsZS5jdXJyZW50KSBkcmF3LmNhbmNlbChzKTtcbiAgICAgIGVsc2UgaWYgKGlzTWlkZGxlQnV0dG9uKGUpKSB7XG4gICAgICAgIGlmIChzLmRyYXdhYmxlLmVuYWJsZWQpIHtcbiAgICAgICAgICBpZiAoZS5jYW5jZWxhYmxlICE9PSBmYWxzZSkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIGRyYXcuc2V0RHJhd1BpZWNlKHMsIHBpZWNlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChlLnNoaWZ0S2V5IHx8IGlzUmlnaHRCdXR0b24oZSkgfHwgcy5kcmF3YWJsZS5mb3JjZWQpIHtcbiAgICAgICAgaWYgKHMuZHJhd2FibGUuZW5hYmxlZCkgZHJhdy5zdGFydEZyb21IYW5kKHMsIHBpZWNlLCBlKTtcbiAgICAgIH0gZWxzZSBpZiAoIXMudmlld09ubHkgJiYgIWRyYWcudW53YW50ZWRFdmVudChlKSkge1xuICAgICAgICBkcmFnLmRyYWdOZXdQaWVjZShzLCBwaWVjZSwgZSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBwcm9tb3RlKHM6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICBjaG9vc2VQcm9tb3Rpb24oXG4gICAgcyxcbiAgICB0YXJnZXQgJiYgaXNQaWVjZU5vZGUodGFyZ2V0KSA/IHsgY29sb3I6IHRhcmdldC5zZ0NvbG9yLCByb2xlOiB0YXJnZXQuc2dSb2xlIH0gOiB1bmRlZmluZWQsXG4gICk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBBbmltQ3VycmVudCwgQW5pbUZhZGluZ3MsIEFuaW1Qcm9tb3Rpb25zLCBBbmltVmVjdG9yLCBBbmltVmVjdG9ycyB9IGZyb20gJy4vYW5pbS5qcyc7XG5pbXBvcnQgdHlwZSB7IERyYWdDdXJyZW50IH0gZnJvbSAnLi9kcmFnLmpzJztcbmltcG9ydCB7IHJlbmRlcktleWJvYXJkLCBzeW5jS2V5Ym9hcmRTdGF0ZSB9IGZyb20gJy4va2V5Ym9hcmQuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7XG4gIGNyZWF0ZUVsLFxuICBpc0tleSxcbiAgaXNQaWVjZU5vZGUsXG4gIGlzU3F1YXJlTm9kZSxcbiAga2V5MnBvcyxcbiAgcGllY2VOYW1lT2YsXG4gIHBvc1RvVHJhbnNsYXRlUmVsLFxuICBzZW50ZVBvdixcbiAgc2V0RGlzcGxheSxcbiAgdHJhbnNsYXRlUmVsLFxufSBmcm9tICcuL3V0aWwuanMnO1xuXG50eXBlIFNxdWFyZUNsYXNzZXMgPSBNYXA8c2cuS2V5LCBzdHJpbmc+O1xuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyKHM6IFN0YXRlLCBib2FyZEVsczogc2cuQm9hcmRFbGVtZW50cyk6IHZvaWQge1xuICBjb25zdCBhc1NlbnRlOiBib29sZWFuID0gc2VudGVQb3Yocy5vcmllbnRhdGlvbik7XG4gIGNvbnN0IHNjYWxlRG93biA9IHMuc2NhbGVEb3duUGllY2VzID8gMC41IDogMTtcbiAgY29uc3QgcG9zVG9UcmFuc2xhdGUgPSBwb3NUb1RyYW5zbGF0ZVJlbChzLmRpbWVuc2lvbnMpO1xuICBjb25zdCBzcXVhcmVzRWw6IEhUTUxFbGVtZW50ID0gYm9hcmRFbHMuc3F1YXJlcztcbiAgY29uc3QgcGllY2VzRWw6IEhUTUxFbGVtZW50ID0gYm9hcmRFbHMucGllY2VzO1xuICBjb25zdCBkcmFnZ2VkRWw6IHNnLlBpZWNlTm9kZSB8IHVuZGVmaW5lZCA9IGJvYXJkRWxzLmRyYWdnZWQ7XG4gIGNvbnN0IHNxdWFyZU92ZXJFbDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQgPSBib2FyZEVscy5zcXVhcmVPdmVyO1xuICBjb25zdCBwcm9tb3Rpb25FbDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQgPSBib2FyZEVscy5wcm9tb3Rpb247XG4gIGNvbnN0IHBpZWNlczogc2cuUGllY2VzID0gcy5waWVjZXM7XG4gIGNvbnN0IGN1ckFuaW06IEFuaW1DdXJyZW50IHwgdW5kZWZpbmVkID0gcy5hbmltYXRpb24uY3VycmVudDtcbiAgY29uc3QgYW5pbXM6IEFuaW1WZWN0b3JzID0gY3VyQW5pbSA/IGN1ckFuaW0ucGxhbi5hbmltcyA6IG5ldyBNYXAoKTtcbiAgY29uc3QgZmFkaW5nczogQW5pbUZhZGluZ3MgPSBjdXJBbmltID8gY3VyQW5pbS5wbGFuLmZhZGluZ3MgOiBuZXcgTWFwKCk7XG4gIGNvbnN0IHByb21vdGlvbnM6IEFuaW1Qcm9tb3Rpb25zID0gY3VyQW5pbSA/IGN1ckFuaW0ucGxhbi5wcm9tb3Rpb25zIDogbmV3IE1hcCgpO1xuICBjb25zdCBjdXJEcmFnOiBEcmFnQ3VycmVudCB8IHVuZGVmaW5lZCA9IHMuZHJhZ2dhYmxlLmN1cnJlbnQ7XG4gIGNvbnN0IGN1clByb21LZXk6IHNnLktleSB8IHVuZGVmaW5lZCA9IHMucHJvbW90aW9uLmN1cnJlbnQ/LmRyYWdnZWQgPyBzLnNlbGVjdGVkIDogdW5kZWZpbmVkO1xuXG4gIHN5bmNLZXlib2FyZFN0YXRlKHMsIGJvYXJkRWxzKTtcblxuICBjb25zdCBzcXVhcmVzOiBTcXVhcmVDbGFzc2VzID0gY29tcHV0ZVNxdWFyZUNsYXNzZXMocyk7XG4gIGNvbnN0IHNhbWVQaWVjZXMgPSBuZXcgU2V0PHNnLktleT4oKTtcbiAgY29uc3QgbW92ZWRQaWVjZXMgPSBuZXcgTWFwPHNnLlBpZWNlTmFtZSwgc2cuUGllY2VOb2RlW10+KCk7XG5cbiAgLy8gaWYgcGllY2Ugbm90IGJlaW5nIGRyYWdnZWQgYW55bW9yZSwgaGlkZSBpdFxuICBpZiAoIWN1ckRyYWcgJiYgZHJhZ2dlZEVsPy5zZ0RyYWdnaW5nKSB7XG4gICAgZHJhZ2dlZEVsLnNnRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICBzZXREaXNwbGF5KGRyYWdnZWRFbCwgZmFsc2UpO1xuICAgIGlmIChzcXVhcmVPdmVyRWwpIHNldERpc3BsYXkoc3F1YXJlT3ZlckVsLCBmYWxzZSk7XG4gIH1cblxuICBsZXQgazogc2cuS2V5O1xuICBsZXQgZWw6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICBsZXQgcGllY2VBdEtleTogc2cuUGllY2UgfCB1bmRlZmluZWQ7XG4gIGxldCBlbFBpZWNlTmFtZTogc2cuUGllY2VOYW1lO1xuICBsZXQgYW5pbTogQW5pbVZlY3RvciB8IHVuZGVmaW5lZDtcbiAgbGV0IGZhZGluZzogc2cuUGllY2UgfCB1bmRlZmluZWQ7XG4gIGxldCBwcm9tOiBzZy5QaWVjZSB8IHVuZGVmaW5lZDtcbiAgbGV0IHBNdmRzZXQ6IHNnLlBpZWNlTm9kZVtdIHwgdW5kZWZpbmVkO1xuICBsZXQgcE12ZDogc2cuUGllY2VOb2RlIHwgdW5kZWZpbmVkO1xuXG4gIC8vIHdhbGsgb3ZlciBhbGwgYm9hcmQgZG9tIGVsZW1lbnRzLCBhcHBseSBhbmltYXRpb25zIGFuZCBmbGFnIG1vdmVkIHBpZWNlc1xuICBlbCA9IHBpZWNlc0VsLmZpcnN0RWxlbWVudENoaWxkIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICB3aGlsZSAoZWwpIHtcbiAgICBpZiAoaXNQaWVjZU5vZGUoZWwpKSB7XG4gICAgICBrID0gZWwuc2dLZXk7XG4gICAgICBwaWVjZUF0S2V5ID0gcGllY2VzLmdldChrKTtcbiAgICAgIGFuaW0gPSBhbmltcy5nZXQoayk7XG4gICAgICBmYWRpbmcgPSBmYWRpbmdzLmdldChrKTtcbiAgICAgIHByb20gPSBwcm9tb3Rpb25zLmdldChrKTtcbiAgICAgIGVsUGllY2VOYW1lID0gcGllY2VOYW1lT2YoeyBjb2xvcjogZWwuc2dDb2xvciwgcm9sZTogZWwuc2dSb2xlIH0pO1xuXG4gICAgICAvLyBHaG9zdCB0aGUgb3JpZ2luIGR1cmluZyBhIGRyYWcgb3IgZHJhZ2dlZCBwcm9tb3Rpb24uXG4gICAgICBpZiAoXG4gICAgICAgICgoY3VyRHJhZz8uc3RhcnRlZCAmJiBjdXJEcmFnLmZyb21Cb2FyZD8ub3JpZyA9PT0gaykgfHwgKGN1clByb21LZXkgJiYgY3VyUHJvbUtleSA9PT0gaykpICYmXG4gICAgICAgICFlbC5zZ0dob3N0XG4gICAgICApIHtcbiAgICAgICAgZWwuc2dHaG9zdCA9IHRydWU7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2dob3N0Jyk7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICBlbC5zZ0dob3N0ICYmXG4gICAgICAgICghY3VyRHJhZyB8fCBjdXJEcmFnLmZyb21Cb2FyZD8ub3JpZyAhPT0gaykgJiZcbiAgICAgICAgKCFjdXJQcm9tS2V5IHx8IGN1clByb21LZXkgIT09IGspXG4gICAgICApIHtcbiAgICAgICAgZWwuc2dHaG9zdCA9IGZhbHNlO1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnaG9zdCcpO1xuICAgICAgICBzZXREaXNwbGF5KGVsLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGlmIChlbC5zZ0dob3N0KSBzZXREaXNwbGF5KGVsLCBzLmRyYWdnYWJsZS5zaG93R2hvc3QgfHwgY3VyUHJvbUtleSA9PT0gayk7XG4gICAgICAvLyByZW1vdmUgZmFkaW5nIGNsYXNzIGlmIGl0IHN0aWxsIHJlbWFpbnNcbiAgICAgIGlmICghZmFkaW5nICYmIGVsLnNnRmFkaW5nKSB7XG4gICAgICAgIGVsLnNnRmFkaW5nID0gZmFsc2U7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2ZhZGluZycpO1xuICAgICAgfVxuICAgICAgLy8gdGhlcmUgaXMgbm93IGEgcGllY2UgYXQgdGhpcyBkb20ga2V5XG4gICAgICBpZiAocGllY2VBdEtleSkge1xuICAgICAgICAvLyBjb250aW51ZSBhbmltYXRpb24gaWYgYWxyZWFkeSBhbmltYXRpbmcgYW5kIHNhbWUgcGllY2Ugb3IgcHJvbW90aW5nIHBpZWNlXG4gICAgICAgIC8vIChvdGhlcndpc2UgaXQgY291bGQgYW5pbWF0ZSBhIGNhcHR1cmVkIHBpZWNlKVxuICAgICAgICBpZiAoXG4gICAgICAgICAgYW5pbSAmJlxuICAgICAgICAgIGVsLnNnQW5pbWF0aW5nICYmXG4gICAgICAgICAgKGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihwaWVjZUF0S2V5KSB8fCAocHJvbSAmJiBlbFBpZWNlTmFtZSA9PT0gcGllY2VOYW1lT2YocHJvbSkpKVxuICAgICAgICApIHtcbiAgICAgICAgICBjb25zdCBwb3MgPSBrZXkycG9zKGspO1xuICAgICAgICAgIHBvc1swXSArPSBhbmltWzJdO1xuICAgICAgICAgIHBvc1sxXSArPSBhbmltWzNdO1xuICAgICAgICAgIHRyYW5zbGF0ZVJlbChlbCwgcG9zVG9UcmFuc2xhdGUocG9zLCBhc1NlbnRlKSwgc2NhbGVEb3duKTtcbiAgICAgICAgICBlbC5zZ1NjYWxlZERvd24gPSBzLnNjYWxlRG93blBpZWNlcztcbiAgICAgICAgfSBlbHNlIGlmIChlbC5zZ0FuaW1hdGluZyB8fCBlbC5zZ1NjYWxlZERvd24gIT09IHMuc2NhbGVEb3duUGllY2VzKSB7XG4gICAgICAgICAgaWYgKGVsLnNnQW5pbWF0aW5nKSB7XG4gICAgICAgICAgICBlbC5zZ0FuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnYW5pbScpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0cmFuc2xhdGVSZWwoZWwsIHBvc1RvVHJhbnNsYXRlKGtleTJwb3MoayksIGFzU2VudGUpLCBzY2FsZURvd24pO1xuICAgICAgICAgIGVsLnNnU2NhbGVkRG93biA9IHMuc2NhbGVEb3duUGllY2VzO1xuICAgICAgICB9XG4gICAgICAgIC8vIHNhbWUgcGllY2U6IGZsYWcgYXMgc2FtZVxuICAgICAgICBpZiAoZWxQaWVjZU5hbWUgPT09IHBpZWNlTmFtZU9mKHBpZWNlQXRLZXkpICYmICghZmFkaW5nIHx8ICFlbC5zZ0ZhZGluZykpIHtcbiAgICAgICAgICBzYW1lUGllY2VzLmFkZChrKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBkaWZmZXJlbnQgcGllY2U6IGZsYWcgYXMgbW92ZWQgdW5sZXNzIGl0IGlzIGEgZmFkaW5nIHBpZWNlIG9yIGFuIGFuaW1hdGVkIHByb21vdGluZyBwaWVjZVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpZiAoZmFkaW5nICYmIGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihmYWRpbmcpKSB7XG4gICAgICAgICAgICBlbC5zZ0ZhZGluZyA9IHRydWU7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdmYWRpbmcnKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHByb20gJiYgZWxQaWVjZU5hbWUgPT09IHBpZWNlTmFtZU9mKHByb20pKSB7XG4gICAgICAgICAgICBzYW1lUGllY2VzLmFkZChrKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXBwZW5kVmFsdWUobW92ZWRQaWVjZXMsIGVsUGllY2VOYW1lLCBlbCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBubyBwaWVjZTogZmxhZyBhcyBtb3ZlZFxuICAgICAgZWxzZSB7XG4gICAgICAgIGFwcGVuZFZhbHVlKG1vdmVkUGllY2VzLCBlbFBpZWNlTmFtZSwgZWwpO1xuICAgICAgfVxuICAgIH1cbiAgICBlbCA9IGVsLm5leHRFbGVtZW50U2libGluZyBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8vIHdhbGsgb3ZlciBhbGwgc3F1YXJlcyBhbmQgYXBwbHkgY2xhc3Nlc1xuICBsZXQgc3FFbCA9IHNxdWFyZXNFbC5maXJzdEVsZW1lbnRDaGlsZCBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgd2hpbGUgKHNxRWwgJiYgaXNTcXVhcmVOb2RlKHNxRWwpKSB7XG4gICAgc3FFbC5jbGFzc05hbWUgPSBzcXVhcmVzLmdldChzcUVsLnNnS2V5KSB8fCAnJztcbiAgICBzcUVsID0gc3FFbC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIH1cblxuICAvLyB3YWxrIG92ZXIgYWxsIHBpZWNlcyBpbiBjdXJyZW50IHNldCwgYXBwbHkgZG9tIGNoYW5nZXMgdG8gbW92ZWQgcGllY2VzXG4gIC8vIG9yIGFwcGVuZCBuZXcgcGllY2VzXG4gIGZvciAoY29uc3QgW2ssIHBdIG9mIHBpZWNlcykge1xuICAgIGNvbnN0IHBpZWNlID0gcHJvbW90aW9ucy5nZXQoaykgfHwgcDtcbiAgICBhbmltID0gYW5pbXMuZ2V0KGspO1xuICAgIGlmICghc2FtZVBpZWNlcy5oYXMoaykpIHtcbiAgICAgIHBNdmRzZXQgPSBtb3ZlZFBpZWNlcy5nZXQocGllY2VOYW1lT2YocGllY2UpKTtcbiAgICAgIHBNdmQgPSBwTXZkc2V0Py5wb3AoKTtcbiAgICAgIC8vIGEgc2FtZSBwaWVjZSB3YXMgbW92ZWRcbiAgICAgIGlmIChwTXZkKSB7XG4gICAgICAgIC8vIGFwcGx5IGRvbSBjaGFuZ2VzXG4gICAgICAgIHBNdmQuc2dLZXkgPSBrO1xuICAgICAgICBpZiAocE12ZC5zZ0ZhZGluZykge1xuICAgICAgICAgIHBNdmQuc2dGYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICBwTXZkLmNsYXNzTGlzdC5yZW1vdmUoJ2ZhZGluZycpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBvcyA9IGtleTJwb3Moayk7XG4gICAgICAgIGlmIChhbmltKSB7XG4gICAgICAgICAgcE12ZC5zZ0FuaW1hdGluZyA9IHRydWU7XG4gICAgICAgICAgcE12ZC5jbGFzc0xpc3QuYWRkKCdhbmltJyk7XG4gICAgICAgICAgcG9zWzBdICs9IGFuaW1bMl07XG4gICAgICAgICAgcG9zWzFdICs9IGFuaW1bM107XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNsYXRlUmVsKHBNdmQsIHBvc1RvVHJhbnNsYXRlKHBvcywgYXNTZW50ZSksIHNjYWxlRG93bik7XG4gICAgICAgIHBNdmQuc2dTY2FsZWREb3duID0gcy5zY2FsZURvd25QaWVjZXM7XG4gICAgICB9XG4gICAgICAvLyBubyBwaWVjZSBpbiBtb3ZlZCBvYmo6IGluc2VydCB0aGUgbmV3IHBpZWNlXG4gICAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgcGllY2VOb2RlID0gY3JlYXRlRWwoJ3BpZWNlJywgcGllY2VOYW1lT2YocCkpIGFzIHNnLlBpZWNlTm9kZTtcbiAgICAgICAgY29uc3QgcG9zID0ga2V5MnBvcyhrKTtcblxuICAgICAgICBwaWVjZU5vZGUuc2dDb2xvciA9IHAuY29sb3I7XG4gICAgICAgIHBpZWNlTm9kZS5zZ1JvbGUgPSBwLnJvbGU7XG4gICAgICAgIHBpZWNlTm9kZS5zZ0tleSA9IGs7XG4gICAgICAgIGlmIChhbmltKSB7XG4gICAgICAgICAgcGllY2VOb2RlLnNnQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgICAgICBwb3NbMF0gKz0gYW5pbVsyXTtcbiAgICAgICAgICBwb3NbMV0gKz0gYW5pbVszXTtcbiAgICAgICAgfVxuICAgICAgICB0cmFuc2xhdGVSZWwocGllY2VOb2RlLCBwb3NUb1RyYW5zbGF0ZShwb3MsIGFzU2VudGUpLCBzY2FsZURvd24pO1xuICAgICAgICBwaWVjZU5vZGUuc2dTY2FsZWREb3duID0gcy5zY2FsZURvd25QaWVjZXM7XG5cbiAgICAgICAgcGllY2VzRWwuYXBwZW5kQ2hpbGQocGllY2VOb2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLy8gcmVtb3ZlIGFueSBlbGVtZW50IHRoYXQgcmVtYWlucyBpbiB0aGUgbW92ZWQgc2V0c1xuICBmb3IgKGNvbnN0IG5vZGVzIG9mIG1vdmVkUGllY2VzLnZhbHVlcygpKSB7XG4gICAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgICBwaWVjZXNFbC5yZW1vdmVDaGlsZChub2RlKTtcbiAgICB9XG4gIH1cblxuICBpZiAocHJvbW90aW9uRWwpIHJlbmRlclByb21vdGlvbihzLCBwcm9tb3Rpb25FbCk7XG4gIHJlbmRlcktleWJvYXJkKHMsIGJvYXJkRWxzKTtcbn1cblxuZnVuY3Rpb24gYXBwZW5kVmFsdWU8SywgVj4obWFwOiBNYXA8SywgVltdPiwga2V5OiBLLCB2YWx1ZTogVik6IHZvaWQge1xuICBjb25zdCBhcnIgPSBtYXAuZ2V0KGtleSk7XG4gIGlmIChhcnIpIGFyci5wdXNoKHZhbHVlKTtcbiAgZWxzZSBtYXAuc2V0KGtleSwgW3ZhbHVlXSk7XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVTcXVhcmVDbGFzc2VzKHM6IFN0YXRlKTogU3F1YXJlQ2xhc3NlcyB7XG4gIGNvbnN0IHNxdWFyZXM6IFNxdWFyZUNsYXNzZXMgPSBuZXcgTWFwKCk7XG4gIGlmIChzLmtleWJvYXJkLmVuYWJsZWQgJiYgIXMudmlld09ubHkgJiYgIXMucHJvbW90aW9uLmN1cnJlbnQgJiYgaXNLZXkocy5rZXlib2FyZC5jdXJyZW50KSlcbiAgICBhZGRTcXVhcmUoXG4gICAgICBzcXVhcmVzLFxuICAgICAgcy5rZXlib2FyZC5jdXJyZW50LFxuICAgICAgYGtleWJvYXJkLWN1cnNvciR7cy5rZXlib2FyZC5mb2N1c2VkID8gJyBrZXlib2FyZC1mb2N1c2VkJyA6ICcnfWAsXG4gICAgKTtcbiAgaWYgKHMubGFzdERlc3RzICYmIHMuaGlnaGxpZ2h0Lmxhc3REZXN0cylcbiAgICBmb3IgKGNvbnN0IGsgb2Ygcy5sYXN0RGVzdHMpIGFkZFNxdWFyZShzcXVhcmVzLCBrLCAnbGFzdC1kZXN0Jyk7XG4gIGlmIChzLmNoZWNrcyAmJiBzLmhpZ2hsaWdodC5jaGVjaylcbiAgICBmb3IgKGNvbnN0IGNoZWNrIG9mIHMuY2hlY2tzKSBhZGRTcXVhcmUoc3F1YXJlcywgY2hlY2ssICdjaGVjaycpO1xuICBpZiAocy5ob3ZlcmVkKSBhZGRTcXVhcmUoc3F1YXJlcywgcy5ob3ZlcmVkLCAnaG92ZXInKTtcbiAgaWYgKHMuc2VsZWN0ZWQpIHtcbiAgICBpZiAocy5hY3RpdmVDb2xvciA9PT0gJ2JvdGgnIHx8IHMuYWN0aXZlQ29sb3IgPT09IHMudHVybkNvbG9yKVxuICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIHMuc2VsZWN0ZWQsICdzZWxlY3RlZCcpO1xuICAgIGVsc2UgYWRkU3F1YXJlKHNxdWFyZXMsIHMuc2VsZWN0ZWQsICdwcmVzZWxlY3RlZCcpO1xuICAgIGlmIChzLm1vdmFibGUuc2hvd0Rlc3RzKSB7XG4gICAgICBjb25zdCBkZXN0cyA9IHMubW92YWJsZS5kZXN0cz8uZ2V0KHMuc2VsZWN0ZWQpO1xuICAgICAgaWYgKGRlc3RzKVxuICAgICAgICBmb3IgKGNvbnN0IGsgb2YgZGVzdHMpIHtcbiAgICAgICAgICBhZGRTcXVhcmUoc3F1YXJlcywgaywgYGRlc3Qke3MucGllY2VzLmhhcyhrKSA/ICcgb2MnIDogJyd9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHMucHJlbW92YWJsZS5zaG93RGVzdHMpIHtcbiAgICAgIGNvbnN0IHBEZXN0cyA9IHMucHJlbW92YWJsZS5kZXN0cztcbiAgICAgIGlmIChwRGVzdHMpXG4gICAgICAgIGZvciAoY29uc3QgayBvZiBwRGVzdHMpIHtcbiAgICAgICAgICBhZGRTcXVhcmUoc3F1YXJlcywgaywgYHByZS1kZXN0JHtzLnBpZWNlcy5oYXMoaykgPyAnIG9jJyA6ICcnfWApO1xuICAgICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKHMuc2VsZWN0ZWRQaWVjZSkge1xuICAgIGlmIChzLmRyb3BwYWJsZS5zaG93RGVzdHMpIHtcbiAgICAgIGNvbnN0IGRlc3RzID0gcy5kcm9wcGFibGUuZGVzdHM/LmdldChwaWVjZU5hbWVPZihzLnNlbGVjdGVkUGllY2UpKTtcbiAgICAgIGlmIChkZXN0cylcbiAgICAgICAgZm9yIChjb25zdCBrIG9mIGRlc3RzKSB7XG4gICAgICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIGssICdkZXN0Jyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHMucHJlZHJvcHBhYmxlLnNob3dEZXN0cykge1xuICAgICAgY29uc3QgcERlc3RzID0gcy5wcmVkcm9wcGFibGUuZGVzdHM7XG4gICAgICBpZiAocERlc3RzKVxuICAgICAgICBmb3IgKGNvbnN0IGsgb2YgcERlc3RzKSB7XG4gICAgICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIGssIGBwcmUtZGVzdCR7cy5waWVjZXMuaGFzKGspID8gJyBvYycgOiAnJ31gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgfVxuICBjb25zdCBwcmVtb3ZlID0gcy5wcmVtb3ZhYmxlLmN1cnJlbnQ7XG4gIGlmIChwcmVtb3ZlKSB7XG4gICAgYWRkU3F1YXJlKHNxdWFyZXMsIHByZW1vdmUub3JpZywgJ2N1cnJlbnQtcHJlJyk7XG4gICAgYWRkU3F1YXJlKHNxdWFyZXMsIHByZW1vdmUuZGVzdCwgYGN1cnJlbnQtcHJlJHtwcmVtb3ZlLnByb20gPyAnIHByb20nIDogJyd9YCk7XG4gIH0gZWxzZSBpZiAocy5wcmVkcm9wcGFibGUuY3VycmVudClcbiAgICBhZGRTcXVhcmUoXG4gICAgICBzcXVhcmVzLFxuICAgICAgcy5wcmVkcm9wcGFibGUuY3VycmVudC5rZXksXG4gICAgICBgY3VycmVudC1wcmUke3MucHJlZHJvcHBhYmxlLmN1cnJlbnQucHJvbSA/ICcgcHJvbScgOiAnJ31gLFxuICAgICk7XG5cbiAgZm9yIChjb25zdCBzcWggb2Ygcy5kcmF3YWJsZS5zcXVhcmVzKSB7XG4gICAgYWRkU3F1YXJlKHNxdWFyZXMsIHNxaC5rZXksIHNxaC5jbGFzc05hbWUpO1xuICB9XG5cbiAgcmV0dXJuIHNxdWFyZXM7XG59XG5cbmZ1bmN0aW9uIGFkZFNxdWFyZShzcXVhcmVzOiBTcXVhcmVDbGFzc2VzLCBrZXk6IHNnLktleSwga2xhc3M6IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCBjbGFzc2VzID0gc3F1YXJlcy5nZXQoa2V5KTtcbiAgaWYgKGNsYXNzZXMpIHNxdWFyZXMuc2V0KGtleSwgYCR7Y2xhc3Nlc30gJHtrbGFzc31gKTtcbiAgZWxzZSBzcXVhcmVzLnNldChrZXksIGtsYXNzKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyUHJvbW90aW9uKHM6IFN0YXRlLCBwcm9tb3Rpb25FbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgY29uc3QgY3VyID0gcy5wcm9tb3Rpb24uY3VycmVudDtcbiAgY29uc3Qga2V5ID0gY3VyPy5rZXk7XG4gIGNvbnN0IHBpZWNlcyA9IGN1ciA/IFtjdXIucHJvbW90ZWRQaWVjZSwgY3VyLnBpZWNlXSA6IFtdO1xuICBjb25zdCBoYXNoID0gcHJvbW90aW9uSGFzaCghIWN1ciwga2V5LCBwaWVjZXMpO1xuICBpZiAocy5wcm9tb3Rpb24ucHJldlByb21vdGlvbkhhc2ggPT09IGhhc2gpIHJldHVybjtcbiAgcy5wcm9tb3Rpb24ucHJldlByb21vdGlvbkhhc2ggPSBoYXNoO1xuXG4gIGlmIChrZXkpIHtcbiAgICBjb25zdCBhc1NlbnRlID0gc2VudGVQb3Yocy5vcmllbnRhdGlvbik7XG4gICAgY29uc3QgaW5pdFBvcyA9IGtleTJwb3Moa2V5KTtcbiAgICBjb25zdCBjb2xvciA9IGN1ci5waWVjZS5jb2xvcjtcbiAgICBjb25zdCBwcm9tb3Rpb25TcXVhcmUgPSBjcmVhdGVFbCgnc2ctcHJvbW90aW9uLXNxdWFyZScpO1xuICAgIGNvbnN0IHByb21vdGlvbkNob2ljZXMgPSBjcmVhdGVFbCgnc2ctcHJvbW90aW9uLWNob2ljZXMnKTtcbiAgICBpZiAocy5vcmllbnRhdGlvbiAhPT0gY29sb3IpIHByb21vdGlvbkNob2ljZXMuY2xhc3NMaXN0LmFkZCgncmV2ZXJzZWQnKTtcbiAgICB0cmFuc2xhdGVSZWwocHJvbW90aW9uU3F1YXJlLCBwb3NUb1RyYW5zbGF0ZVJlbChzLmRpbWVuc2lvbnMpKGluaXRQb3MsIGFzU2VudGUpLCAxKTtcblxuICAgIGZvciAoY29uc3QgcCBvZiBwaWVjZXMpIHtcbiAgICAgIGNvbnN0IHBpZWNlTm9kZSA9IGNyZWF0ZUVsKCdwaWVjZScsIHBpZWNlTmFtZU9mKHApKSBhcyBzZy5QaWVjZU5vZGU7XG4gICAgICBwaWVjZU5vZGUuc2dDb2xvciA9IHAuY29sb3I7XG4gICAgICBwaWVjZU5vZGUuc2dSb2xlID0gcC5yb2xlO1xuICAgICAgcHJvbW90aW9uQ2hvaWNlcy5hcHBlbmRDaGlsZChwaWVjZU5vZGUpO1xuICAgIH1cblxuICAgIHByb21vdGlvbkVsLmlubmVySFRNTCA9ICcnO1xuICAgIHByb21vdGlvblNxdWFyZS5hcHBlbmRDaGlsZChwcm9tb3Rpb25DaG9pY2VzKTtcbiAgICBwcm9tb3Rpb25FbC5hcHBlbmRDaGlsZChwcm9tb3Rpb25TcXVhcmUpO1xuICAgIHNldERpc3BsYXkocHJvbW90aW9uRWwsIHRydWUpO1xuICB9IGVsc2Uge1xuICAgIHNldERpc3BsYXkocHJvbW90aW9uRWwsIGZhbHNlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwcm9tb3Rpb25IYXNoKGFjdGl2ZTogYm9vbGVhbiwga2V5OiBzZy5LZXkgfCB1bmRlZmluZWQsIHBpZWNlczogc2cuUGllY2VbXSk6IHN0cmluZyB7XG4gIHJldHVybiBbYWN0aXZlLCBrZXksIHBpZWNlcy5tYXAoKHApID0+IHBpZWNlTmFtZU9mKHApKS5qb2luKCcgJyldLmpvaW4oJyAnKTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IE5vdGF0aW9uIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjb29yZHMobm90YXRpb246IE5vdGF0aW9uKTogc3RyaW5nW10ge1xuICBzd2l0Y2ggKG5vdGF0aW9uKSB7XG4gICAgY2FzZSAnZGl6aGknOlxuICAgICAgcmV0dXJuIFtcbiAgICAgICAgJycsXG4gICAgICAgICcnLFxuICAgICAgICAnJyxcbiAgICAgICAgJycsXG4gICAgICAgICfkuqUnLFxuICAgICAgICAn5oiMJyxcbiAgICAgICAgJ+mFiScsXG4gICAgICAgICfnlLMnLFxuICAgICAgICAn5pyqJyxcbiAgICAgICAgJ+WNiCcsXG4gICAgICAgICflt7MnLFxuICAgICAgICAn6L6wJyxcbiAgICAgICAgJ+WNrycsXG4gICAgICAgICflr4UnLFxuICAgICAgICAn5LiRJyxcbiAgICAgICAgJ+WtkCcsXG4gICAgICBdO1xuICAgIGNhc2UgJ2phcGFuZXNlJzpcbiAgICAgIHJldHVybiBbXG4gICAgICAgICfljYHlha0nLFxuICAgICAgICAn5Y2B5LqUJyxcbiAgICAgICAgJ+WNgeWbmycsXG4gICAgICAgICfljYHkuIknLFxuICAgICAgICAn5Y2B5LqMJyxcbiAgICAgICAgJ+WNgeS4gCcsXG4gICAgICAgICfljYEnLFxuICAgICAgICAn5LmdJyxcbiAgICAgICAgJ+WFqycsXG4gICAgICAgICfkuIMnLFxuICAgICAgICAn5YWtJyxcbiAgICAgICAgJ+S6lCcsXG4gICAgICAgICflm5snLFxuICAgICAgICAn5LiJJyxcbiAgICAgICAgJ+S6jCcsXG4gICAgICAgICfkuIAnLFxuICAgICAgXTtcbiAgICBjYXNlICdlbmdpbmUnOlxuICAgICAgcmV0dXJuIFsncCcsICdvJywgJ24nLCAnbScsICdsJywgJ2snLCAnaicsICdpJywgJ2gnLCAnZycsICdmJywgJ2UnLCAnZCcsICdjJywgJ2InLCAnYSddO1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXR1cm4gWycxMCcsICdmJywgJ2UnLCAnZCcsICdjJywgJ2InLCAnYScsICc5JywgJzgnLCAnNycsICc2JywgJzUnLCAnNCcsICczJywgJzInLCAnMSddO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gW1xuICAgICAgICAnMTYnLFxuICAgICAgICAnMTUnLFxuICAgICAgICAnMTQnLFxuICAgICAgICAnMTMnLFxuICAgICAgICAnMTInLFxuICAgICAgICAnMTEnLFxuICAgICAgICAnMTAnLFxuICAgICAgICAnOScsXG4gICAgICAgICc4JyxcbiAgICAgICAgJzcnLFxuICAgICAgICAnNicsXG4gICAgICAgICc1JyxcbiAgICAgICAgJzQnLFxuICAgICAgICAnMycsXG4gICAgICAgICcyJyxcbiAgICAgICAgJzEnLFxuICAgICAgXTtcbiAgfVxufVxuIiwgImltcG9ydCB7IGNvbG9ycyB9IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IGNvb3JkcyB9IGZyb20gJy4vY29vcmRzLmpzJztcbmltcG9ydCB7IGNyZWF0ZVNWR0VsZW1lbnQsIHNldEF0dHJpYnV0ZXMgfSBmcm9tICcuL3NoYXBlcy5qcyc7XG5pbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSB7XG4gIEJvYXJkRWxlbWVudHMsXG4gIENvbG9yLFxuICBEaW1lbnNpb25zLFxuICBIYW5kRWxlbWVudHMsXG4gIFBpZWNlTm9kZSxcbiAgUm9sZVN0cmluZyxcbiAgU2hhcGVzRWxlbWVudHMsXG4gIFNxdWFyZU5vZGUsXG59IGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgY3JlYXRlRWwsIG9wcG9zaXRlLCBwaWVjZU5hbWVPZiwgcG9zMmtleSwgc2V0RGlzcGxheSB9IGZyb20gJy4vdXRpbC5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwQm9hcmQoYm9hcmRXcmFwOiBIVE1MRWxlbWVudCwgczogU3RhdGUpOiBCb2FyZEVsZW1lbnRzIHtcbiAgLy8gLnNnLXdyYXAgKGVsZW1lbnQgcGFzc2VkIHRvIFNob2dpZ3JvdW5kKVxuICAvLyAgICAgc2ctaGFuZC13cmFwXG4gIC8vICAgICBzZy1ib2FyZFxuICAvLyAgICAgICBzZy1zcXVhcmVzXG4gIC8vICAgICAgIHNnLXBpZWNlc1xuICAvLyAgICAgICBwaWVjZSBkcmFnZ2luZ1xuICAvLyAgICAgICBzZy1wcm9tb3Rpb25cbiAgLy8gICAgICAgc2ctc3F1YXJlLW92ZXJcbiAgLy8gICAgICAgc3ZnLnNnLXNoYXBlc1xuICAvLyAgICAgICAgIGRlZnNcbiAgLy8gICAgICAgICBnXG4gIC8vICAgICAgIHN2Zy5zZy1jdXN0b20tc3Znc1xuICAvLyAgICAgICAgIGdcbiAgLy8gICAgIHNnLWhhbmQtd3JhcFxuICAvLyAgICAgc2ctZnJlZS1waWVjZXNcbiAgLy8gICAgICAgY29vcmRzLnJhbmtzXG4gIC8vICAgICAgIGNvb3Jkcy5maWxlc1xuXG4gIGNvbnN0IGJvYXJkID0gY3JlYXRlRWwoJ3NnLWJvYXJkJyk7XG5cbiAgY29uc3Qgc3F1YXJlcyA9IHJlbmRlclNxdWFyZXMocy5kaW1lbnNpb25zLCBzLm9yaWVudGF0aW9uKTtcbiAgYm9hcmQuYXBwZW5kQ2hpbGQoc3F1YXJlcyk7XG5cbiAgY29uc3QgcGllY2VzID0gY3JlYXRlRWwoJ3NnLXBpZWNlcycpO1xuICBib2FyZC5hcHBlbmRDaGlsZChwaWVjZXMpO1xuXG4gIGxldCBkcmFnZ2VkOiBQaWVjZU5vZGUgfCB1bmRlZmluZWQ7XG4gIGxldCBwcm9tb3Rpb246IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICBsZXQgc3F1YXJlT3ZlcjogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIGlmICghcy52aWV3T25seSkge1xuICAgIGRyYWdnZWQgPSBjcmVhdGVFbCgncGllY2UnKSBhcyBQaWVjZU5vZGU7XG4gICAgc2V0RGlzcGxheShkcmFnZ2VkLCBmYWxzZSk7XG4gICAgYm9hcmQuYXBwZW5kQ2hpbGQoZHJhZ2dlZCk7XG5cbiAgICBwcm9tb3Rpb24gPSBjcmVhdGVFbCgnc2ctcHJvbW90aW9uJyk7XG4gICAgc2V0RGlzcGxheShwcm9tb3Rpb24sIGZhbHNlKTtcbiAgICBib2FyZC5hcHBlbmRDaGlsZChwcm9tb3Rpb24pO1xuXG4gICAgc3F1YXJlT3ZlciA9IGNyZWF0ZUVsKCdzZy1zcXVhcmUtb3ZlcicpO1xuICAgIHNldERpc3BsYXkoc3F1YXJlT3ZlciwgZmFsc2UpO1xuICAgIGJvYXJkLmFwcGVuZENoaWxkKHNxdWFyZU92ZXIpO1xuICB9XG5cbiAgbGV0IHNoYXBlczogU2hhcGVzRWxlbWVudHMgfCB1bmRlZmluZWQ7XG4gIGlmIChzLmRyYXdhYmxlLnZpc2libGUpIHtcbiAgICBjb25zdCBzdmcgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ3N2ZycpLCB7XG4gICAgICBjbGFzczogJ3NnLXNoYXBlcycsXG4gICAgICB2aWV3Qm94OiBgLSR7cy5zcXVhcmVSYXRpb1swXSAvIDJ9IC0ke3Muc3F1YXJlUmF0aW9bMV0gLyAyfSAke3MuZGltZW5zaW9ucy5maWxlcyAqIHMuc3F1YXJlUmF0aW9bMF19ICR7XG4gICAgICAgIHMuZGltZW5zaW9ucy5yYW5rcyAqIHMuc3F1YXJlUmF0aW9bMV1cbiAgICAgIH1gLFxuICAgIH0pO1xuICAgIHN2Zy5hcHBlbmRDaGlsZChjcmVhdGVTVkdFbGVtZW50KCdkZWZzJykpO1xuICAgIHN2Zy5hcHBlbmRDaGlsZChjcmVhdGVTVkdFbGVtZW50KCdnJykpO1xuXG4gICAgY29uc3QgY3VzdG9tU3ZnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdzdmcnKSwge1xuICAgICAgY2xhc3M6ICdzZy1jdXN0b20tc3ZncycsXG4gICAgICB2aWV3Qm94OiBgMCAwICR7cy5kaW1lbnNpb25zLmZpbGVzICogcy5zcXVhcmVSYXRpb1swXX0gJHtzLmRpbWVuc2lvbnMucmFua3MgKiBzLnNxdWFyZVJhdGlvWzFdfWAsXG4gICAgfSk7XG4gICAgY3VzdG9tU3ZnLmFwcGVuZENoaWxkKGNyZWF0ZVNWR0VsZW1lbnQoJ2cnKSk7XG5cbiAgICBjb25zdCBmcmVlUGllY2VzID0gY3JlYXRlRWwoJ3NnLWZyZWUtcGllY2VzJyk7XG5cbiAgICBib2FyZC5hcHBlbmRDaGlsZChzdmcpO1xuICAgIGJvYXJkLmFwcGVuZENoaWxkKGN1c3RvbVN2Zyk7XG4gICAgYm9hcmQuYXBwZW5kQ2hpbGQoZnJlZVBpZWNlcyk7XG5cbiAgICBzaGFwZXMgPSB7XG4gICAgICBzdmcsXG4gICAgICBmcmVlUGllY2VzLFxuICAgICAgY3VzdG9tU3ZnLFxuICAgIH07XG4gIH1cblxuICBpZiAocy5jb29yZGluYXRlcy5lbmFibGVkKSB7XG4gICAgY29uc3Qgb3JpZW50Q2xhc3MgPSBzLm9yaWVudGF0aW9uID09PSAnZ290ZScgPyAnIGdvdGUnIDogJyc7XG4gICAgY29uc3QgcmFua3MgPSBjb29yZHMocy5jb29yZGluYXRlcy5yYW5rcyk7XG4gICAgY29uc3QgZmlsZXMgPSBjb29yZHMocy5jb29yZGluYXRlcy5maWxlcyk7XG4gICAgYm9hcmQuYXBwZW5kQ2hpbGQocmVuZGVyQ29vcmRzKHJhbmtzLCBgcmFua3Mke29yaWVudENsYXNzfWAsIHMuZGltZW5zaW9ucy5yYW5rcykpO1xuICAgIGJvYXJkLmFwcGVuZENoaWxkKHJlbmRlckNvb3JkcyhmaWxlcywgYGZpbGVzJHtvcmllbnRDbGFzc31gLCBzLmRpbWVuc2lvbnMuZmlsZXMpKTtcbiAgfVxuXG4gIGJvYXJkV3JhcC5pbm5lckhUTUwgPSAnJztcblxuICBjb25zdCBkaW1DbHMgPSBgZC0ke3MuZGltZW5zaW9ucy5maWxlc314JHtzLmRpbWVuc2lvbnMucmFua3N9YDtcblxuICAvLyByZW1vdmUgYWxsIG90aGVyIGRpbWVuc2lvbiBjbGFzc2VzXG4gIGJvYXJkV3JhcC5jbGFzc0xpc3QuZm9yRWFjaCgoYykgPT4ge1xuICAgIGlmIChjLnN1YnN0cmluZygwLCAyKSA9PT0gJ2QtJyAmJiBjICE9PSBkaW1DbHMpIGJvYXJkV3JhcC5jbGFzc0xpc3QucmVtb3ZlKGMpO1xuICB9KTtcblxuICAvLyBlbnN1cmUgdGhlIHNnLXdyYXAgY2xhc3MgYW5kIGRpbWVuc2lvbnMgY2xhc3MgaXMgc2V0IGJlZm9yZWhhbmQgdG8gYXZvaWQgcmVjb21wdXRpbmcgc3R5bGVzXG4gIGJvYXJkV3JhcC5jbGFzc0xpc3QuYWRkKCdzZy13cmFwJywgZGltQ2xzKTtcblxuICBmb3IgKGNvbnN0IGMgb2YgY29sb3JzKSBib2FyZFdyYXAuY2xhc3NMaXN0LnRvZ2dsZShgb3JpZW50YXRpb24tJHtjfWAsIHMub3JpZW50YXRpb24gPT09IGMpO1xuICBib2FyZFdyYXAuY2xhc3NMaXN0LnRvZ2dsZSgnbWFuaXB1bGFibGUnLCAhcy52aWV3T25seSk7XG5cbiAgYm9hcmRXcmFwLmFwcGVuZENoaWxkKGJvYXJkKTtcblxuICBsZXQgaGFuZHM6IEhhbmRFbGVtZW50cyB8IHVuZGVmaW5lZDtcbiAgaWYgKHMuaGFuZHMuaW5saW5lZCkge1xuICAgIGNvbnN0IGhhbmRXcmFwVG9wID0gY3JlYXRlRWwoJ3NnLWhhbmQtd3JhcCcsICdpbmxpbmVkJyk7XG4gICAgY29uc3QgaGFuZFdyYXBCb3R0b20gPSBjcmVhdGVFbCgnc2ctaGFuZC13cmFwJywgJ2lubGluZWQnKTtcbiAgICBib2FyZFdyYXAuaW5zZXJ0QmVmb3JlKGhhbmRXcmFwQm90dG9tLCBib2FyZC5uZXh0RWxlbWVudFNpYmxpbmcpO1xuICAgIGJvYXJkV3JhcC5pbnNlcnRCZWZvcmUoaGFuZFdyYXBUb3AsIGJvYXJkKTtcbiAgICBoYW5kcyA9IHtcbiAgICAgIHRvcDogaGFuZFdyYXBUb3AsXG4gICAgICBib3R0b206IGhhbmRXcmFwQm90dG9tLFxuICAgIH07XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGJvYXJkLFxuICAgIHNxdWFyZXMsXG4gICAgcGllY2VzLFxuICAgIHByb21vdGlvbixcbiAgICBzcXVhcmVPdmVyLFxuICAgIGRyYWdnZWQsXG4gICAgc2hhcGVzLFxuICAgIGhhbmRzLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd3JhcEhhbmQoaGFuZFdyYXA6IEhUTUxFbGVtZW50LCBwb3M6ICd0b3AnIHwgJ2JvdHRvbScsIHM6IFN0YXRlKTogSFRNTEVsZW1lbnQge1xuICBjb25zdCBoYW5kID0gcmVuZGVySGFuZChwb3MgPT09ICd0b3AnID8gb3Bwb3NpdGUocy5vcmllbnRhdGlvbikgOiBzLm9yaWVudGF0aW9uLCBzLmhhbmRzLnJvbGVzKTtcbiAgaGFuZFdyYXAuaW5uZXJIVE1MID0gJyc7XG5cbiAgY29uc3Qgcm9sZUNudENscyA9IGByLSR7cy5oYW5kcy5yb2xlcy5sZW5ndGh9YDtcblxuICAvLyByZW1vdmUgYWxsIG90aGVyIHJvbGUgY291bnQgY2xhc3Nlc1xuICBoYW5kV3JhcC5jbGFzc0xpc3QuZm9yRWFjaCgoYykgPT4ge1xuICAgIGlmIChjLnN1YnN0cmluZygwLCAyKSA9PT0gJ3ItJyAmJiBjICE9PSByb2xlQ250Q2xzKSBoYW5kV3JhcC5jbGFzc0xpc3QucmVtb3ZlKGMpO1xuICB9KTtcblxuICAvLyBlbnN1cmUgdGhlIHNnLWhhbmQtd3JhcCBjbGFzcywgaGFuZCBwb3MgY2xhc3MgYW5kIHJvbGUgbnVtYmVyIGNsYXNzIGlzIHNldCBiZWZvcmVoYW5kIHRvIGF2b2lkIHJlY29tcHV0aW5nIHN0eWxlc1xuICBoYW5kV3JhcC5jbGFzc0xpc3QuYWRkKCdzZy1oYW5kLXdyYXAnLCBgaGFuZC0ke3Bvc31gLCByb2xlQ250Q2xzKTtcbiAgaGFuZFdyYXAuYXBwZW5kQ2hpbGQoaGFuZCk7XG5cbiAgZm9yIChjb25zdCBjIG9mIGNvbG9ycykgaGFuZFdyYXAuY2xhc3NMaXN0LnRvZ2dsZShgb3JpZW50YXRpb24tJHtjfWAsIHMub3JpZW50YXRpb24gPT09IGMpO1xuICBoYW5kV3JhcC5jbGFzc0xpc3QudG9nZ2xlKCdtYW5pcHVsYWJsZScsICFzLnZpZXdPbmx5KTtcblxuICByZXR1cm4gaGFuZDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyQ29vcmRzKGVsZW1zOiByZWFkb25seSBzdHJpbmdbXSwgY2xhc3NOYW1lOiBzdHJpbmcsIHRyaW06IG51bWJlcik6IEhUTUxFbGVtZW50IHtcbiAgY29uc3QgZWwgPSBjcmVhdGVFbCgnY29vcmRzJywgY2xhc3NOYW1lKTtcbiAgbGV0IGY6IEhUTUxFbGVtZW50O1xuICBmb3IgKGNvbnN0IGVsZW0gb2YgZWxlbXMuc2xpY2UoLXRyaW0pKSB7XG4gICAgZiA9IGNyZWF0ZUVsKCdjb29yZCcpO1xuICAgIGYudGV4dENvbnRlbnQgPSBlbGVtO1xuICAgIGVsLmFwcGVuZENoaWxkKGYpO1xuICB9XG4gIHJldHVybiBlbDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyU3F1YXJlcyhkaW1zOiBEaW1lbnNpb25zLCBvcmllbnRhdGlvbjogQ29sb3IpOiBIVE1MRWxlbWVudCB7XG4gIGNvbnN0IHNxdWFyZXMgPSBjcmVhdGVFbCgnc2ctc3F1YXJlcycpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGltcy5yYW5rcyAqIGRpbXMuZmlsZXM7IGkrKykge1xuICAgIGNvbnN0IHNxID0gY3JlYXRlRWwoJ3NxJykgYXMgU3F1YXJlTm9kZTtcbiAgICBzcS5zZ0tleSA9XG4gICAgICBvcmllbnRhdGlvbiA9PT0gJ3NlbnRlJ1xuICAgICAgICA/IHBvczJrZXkoW2RpbXMuZmlsZXMgLSAxIC0gKGkgJSBkaW1zLmZpbGVzKSwgTWF0aC5mbG9vcihpIC8gZGltcy5maWxlcyldKVxuICAgICAgICA6IHBvczJrZXkoW2kgJSBkaW1zLmZpbGVzLCBkaW1zLnJhbmtzIC0gMSAtIE1hdGguZmxvb3IoaSAvIGRpbXMuZmlsZXMpXSk7XG4gICAgc3F1YXJlcy5hcHBlbmRDaGlsZChzcSk7XG4gIH1cblxuICByZXR1cm4gc3F1YXJlcztcbn1cblxuZnVuY3Rpb24gcmVuZGVySGFuZChjb2xvcjogQ29sb3IsIHJvbGVzOiBSb2xlU3RyaW5nW10pOiBIVE1MRWxlbWVudCB7XG4gIGNvbnN0IGhhbmQgPSBjcmVhdGVFbCgnc2ctaGFuZCcpO1xuICBmb3IgKGNvbnN0IHJvbGUgb2Ygcm9sZXMpIHtcbiAgICBjb25zdCBwaWVjZSA9IHsgcm9sZTogcm9sZSwgY29sb3I6IGNvbG9yIH07XG4gICAgY29uc3Qgd3JhcEVsID0gY3JlYXRlRWwoJ3NnLWhwLXdyYXAnKTtcbiAgICBjb25zdCBwaWVjZUVsID0gY3JlYXRlRWwoJ3BpZWNlJywgcGllY2VOYW1lT2YocGllY2UpKSBhcyBQaWVjZU5vZGU7XG4gICAgcGllY2VFbC5zZ0NvbG9yID0gY29sb3I7XG4gICAgcGllY2VFbC5zZ1JvbGUgPSByb2xlO1xuICAgIHdyYXBFbC5hcHBlbmRDaGlsZChwaWVjZUVsKTtcbiAgICBoYW5kLmFwcGVuZENoaWxkKHdyYXBFbCk7XG4gIH1cbiAgcmV0dXJuIGhhbmQ7XG59XG4iLCAiaW1wb3J0ICogYXMgZXZlbnRzIGZyb20gJy4vZXZlbnRzLmpzJztcbmltcG9ydCB7IHJlbmRlckhhbmQgfSBmcm9tICcuL2hhbmRzLmpzJztcbmltcG9ydCB7IHJlbmRlciB9IGZyb20gJy4vcmVuZGVyLmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlIHsgV3JhcEVsZW1lbnRzLCBXcmFwRWxlbWVudHNCb29sZWFuIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyB3cmFwQm9hcmQsIHdyYXBIYW5kIH0gZnJvbSAnLi93cmFwLmpzJztcblxuZnVuY3Rpb24gYXR0YWNoQm9hcmQoc3RhdGU6IFN0YXRlLCBib2FyZFdyYXA6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gIGNvbnN0IHJlc3RvcmVGb2N1cyA9XG4gICAgc3RhdGUua2V5Ym9hcmQuZW5hYmxlZCAmJlxuICAgICFzdGF0ZS52aWV3T25seSAmJlxuICAgIHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZD8uYm9hcmQgPT09IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gIGRldGFjaEVsZW1lbnRzKHsgYm9hcmQ6IHRydWUgfSwgc3RhdGUsIHRydWUpO1xuICBjb25zdCBlbGVtZW50cyA9IHdyYXBCb2FyZChib2FyZFdyYXAsIHN0YXRlKTtcblxuICAvLyBpbiBjYXNlIG9mIGlubGluZWQgaGFuZHNcbiAgaWYgKGVsZW1lbnRzLmhhbmRzKSBhdHRhY2hIYW5kcyhzdGF0ZSwgZWxlbWVudHMuaGFuZHMudG9wLCBlbGVtZW50cy5oYW5kcy5ib3R0b20pO1xuXG4gIHN0YXRlLmRvbS53cmFwRWxlbWVudHMuYm9hcmQgPSBib2FyZFdyYXA7XG4gIHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZCA9IGVsZW1lbnRzO1xuICBzdGF0ZS5kb20uYm91bmRzLmJvYXJkLmJvdW5kcy5jbGVhcigpO1xuXG4gIHN0YXRlLmRvbS5lbGVtZW50VW5iaW5kcy5zZXQoZWxlbWVudHMuYm9hcmQsIGV2ZW50cy5iaW5kQm9hcmQoc3RhdGUsIGVsZW1lbnRzKSk7XG5cbiAgc3RhdGUuZHJhd2FibGUucHJldlN2Z0hhc2ggPSAnJztcbiAgc3RhdGUucHJvbW90aW9uLnByZXZQcm9tb3Rpb25IYXNoID0gJyc7XG5cbiAgcmVuZGVyKHN0YXRlLCBlbGVtZW50cyk7XG4gIGlmIChyZXN0b3JlRm9jdXMpIGVsZW1lbnRzLmJvYXJkLmZvY3VzKHsgcHJldmVudFNjcm9sbDogdHJ1ZSB9KTtcbn1cblxuZnVuY3Rpb24gYXR0YWNoSGFuZHMoc3RhdGU6IFN0YXRlLCBoYW5kVG9wV3JhcD86IEhUTUxFbGVtZW50LCBoYW5kQm90dG9tV3JhcD86IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gIGlmIChoYW5kVG9wV3JhcCkgc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzPy50b3A/LnJlbW92ZSgpO1xuICBpZiAoaGFuZEJvdHRvbVdyYXApIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcz8uYm90dG9tPy5yZW1vdmUoKTtcbiAgZGV0YWNoRWxlbWVudHMoeyBoYW5kczogeyB0b3A6ICEhaGFuZFRvcFdyYXAsIGJvdHRvbTogISFoYW5kQm90dG9tV3JhcCB9IH0sIHN0YXRlLCB0cnVlKTtcbiAgaWYgKCFzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMpIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcyA9IHt9O1xuXG4gIGlmIChoYW5kVG9wV3JhcCkge1xuICAgIGNvbnN0IGhhbmRUb3AgPSB3cmFwSGFuZChoYW5kVG9wV3JhcCwgJ3RvcCcsIHN0YXRlKTtcbiAgICBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMudG9wID0gaGFuZFRvcDtcbiAgICBzdGF0ZS5kb20uZWxlbWVudFVuYmluZHMuc2V0KGhhbmRUb3AsIGV2ZW50cy5iaW5kSGFuZChzdGF0ZSwgaGFuZFRvcCkpO1xuICAgIHJlbmRlckhhbmQoc3RhdGUsIGhhbmRUb3ApO1xuICB9XG4gIGlmIChoYW5kQm90dG9tV3JhcCkge1xuICAgIGNvbnN0IGhhbmRCb3R0b20gPSB3cmFwSGFuZChoYW5kQm90dG9tV3JhcCwgJ2JvdHRvbScsIHN0YXRlKTtcbiAgICBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMuYm90dG9tID0gaGFuZEJvdHRvbTtcbiAgICBzdGF0ZS5kb20uZWxlbWVudFVuYmluZHMuc2V0KGhhbmRCb3R0b20sIGV2ZW50cy5iaW5kSGFuZChzdGF0ZSwgaGFuZEJvdHRvbSkpO1xuICAgIHJlbmRlckhhbmQoc3RhdGUsIGhhbmRCb3R0b20pO1xuICB9XG5cbiAgaWYgKGhhbmRUb3BXcmFwIHx8IGhhbmRCb3R0b21XcmFwKSB7XG4gICAgc3RhdGUuZG9tLmJvdW5kcy5oYW5kcy5ib3VuZHMuY2xlYXIoKTtcbiAgICBzdGF0ZS5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzLmNsZWFyKCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZHJhd0FsbCh3cmFwRWxlbWVudHM6IFdyYXBFbGVtZW50cywgc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5kb20uZGVzdHJveWVkKSByZXR1cm47XG4gIGlmICh3cmFwRWxlbWVudHMuaGFuZHMpIHtcbiAgICBpZiAoIXN0YXRlLmRvbS53cmFwRWxlbWVudHMuaGFuZHMpIHN0YXRlLmRvbS53cmFwRWxlbWVudHMuaGFuZHMgPSB7fTtcbiAgICBpZiAod3JhcEVsZW1lbnRzLmhhbmRzLnRvcCkgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5oYW5kcy50b3AgPSB3cmFwRWxlbWVudHMuaGFuZHMudG9wO1xuICAgIGlmICh3cmFwRWxlbWVudHMuaGFuZHMuYm90dG9tKSBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmhhbmRzLmJvdHRvbSA9IHdyYXBFbGVtZW50cy5oYW5kcy5ib3R0b207XG4gIH1cbiAgaWYgKHdyYXBFbGVtZW50cy5ib2FyZCkgYXR0YWNoQm9hcmQoc3RhdGUsIHdyYXBFbGVtZW50cy5ib2FyZCk7XG4gIGlmICh3cmFwRWxlbWVudHMuaGFuZHMgJiYgIXN0YXRlLmhhbmRzLmlubGluZWQpXG4gICAgYXR0YWNoSGFuZHMoc3RhdGUsIHdyYXBFbGVtZW50cy5oYW5kcy50b3AsIHdyYXBFbGVtZW50cy5oYW5kcy5ib3R0b20pO1xuICBlbHNlIGlmIChzdGF0ZS5oYW5kcy5pbmxpbmVkICYmICFzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQpIHtcbiAgICBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHM/LnRvcD8ucmVtb3ZlKCk7XG4gICAgc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzPy5ib3R0b20/LnJlbW92ZSgpO1xuICAgIGRldGFjaEVsZW1lbnRzKHsgaGFuZHM6IHsgdG9wOiB0cnVlLCBib3R0b206IHRydWUgfSB9LCBzdGF0ZSwgdHJ1ZSk7XG4gIH1cblxuICAvLyBzaGFwZXMgbWlnaHQgZGVwZW5kIGJvdGggb24gYm9hcmQgYW5kIGhhbmRzIC0gcmVkcmF3IG9ubHkgYWZ0ZXIgYm90aCBhcmUgZG9uZVxuICBzdGF0ZS5kb20ucmVkcmF3U2hhcGVzKCk7XG5cbiAgY29uc3QgaGFuZHMgPVxuICAgIHN0YXRlLmhhbmRzLmlubGluZWQgJiYgd3JhcEVsZW1lbnRzLmJvYXJkXG4gICAgICA/IHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZD8uaGFuZHNcbiAgICAgIDogd3JhcEVsZW1lbnRzLmhhbmRzO1xuICBpZiAoc3RhdGUuZXZlbnRzLmluc2VydClcbiAgICBzdGF0ZS5ldmVudHMuaW5zZXJ0KHdyYXBFbGVtZW50cy5ib2FyZCAmJiBzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQsIHtcbiAgICAgIHRvcDogaGFuZHM/LnRvcCAmJiBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHM/LnRvcCxcbiAgICAgIGJvdHRvbTogaGFuZHM/LmJvdHRvbSAmJiBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHM/LmJvdHRvbSxcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRldGFjaEVsZW1lbnRzKFxuICB3ZWI6IFdyYXBFbGVtZW50c0Jvb2xlYW4sXG4gIHN0YXRlOiBTdGF0ZSxcbiAga2VlcFdyYXBFbGVtZW50cyA9IGZhbHNlLFxuKTogdm9pZCB7XG4gIGNvbnN0IGlubGluZUhhbmRzID0gd2ViLmJvYXJkID8gc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkPy5oYW5kcyA6IHVuZGVmaW5lZDtcbiAgY29uc3QgZGV0YWNoVG9wID1cbiAgICB3ZWIuaGFuZHM/LnRvcCB8fFxuICAgICghIWlubGluZUhhbmRzPy50b3AgJiYgaW5saW5lSGFuZHMudG9wLmZpcnN0RWxlbWVudENoaWxkID09PSBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHM/LnRvcCk7XG4gIGNvbnN0IGRldGFjaEJvdHRvbSA9XG4gICAgd2ViLmhhbmRzPy5ib3R0b20gfHxcbiAgICAoISFpbmxpbmVIYW5kcz8uYm90dG9tICYmXG4gICAgICBpbmxpbmVIYW5kcy5ib3R0b20uZmlyc3RFbGVtZW50Q2hpbGQgPT09IHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcz8uYm90dG9tKTtcbiAgaWYgKCFrZWVwV3JhcEVsZW1lbnRzKSB7XG4gICAgaWYgKHdlYi5ib2FyZCkgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5ib2FyZCA9IHVuZGVmaW5lZDtcbiAgICBpZiAod2ViLmhhbmRzPy50b3AgJiYgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5oYW5kcylcbiAgICAgIHN0YXRlLmRvbS53cmFwRWxlbWVudHMuaGFuZHMudG9wID0gdW5kZWZpbmVkO1xuICAgIGlmICh3ZWIuaGFuZHM/LmJvdHRvbSAmJiBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmhhbmRzKVxuICAgICAgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5oYW5kcy5ib3R0b20gPSB1bmRlZmluZWQ7XG4gIH1cbiAgaWYgKHdlYi5ib2FyZCkge1xuICAgIGlmIChzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQpIHVuYmluZEVsZW1lbnQoc3RhdGUsIHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZC5ib2FyZCk7XG4gICAgc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzLmNsZWFyKCk7XG4gIH1cbiAgaWYgKHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcykge1xuICAgIGlmIChkZXRhY2hUb3ApIHtcbiAgICAgIGlmIChzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMudG9wKSB1bmJpbmRFbGVtZW50KHN0YXRlLCBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMudG9wKTtcbiAgICAgIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcy50b3AgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmIChkZXRhY2hCb3R0b20pIHtcbiAgICAgIGlmIChzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMuYm90dG9tKSB1bmJpbmRFbGVtZW50KHN0YXRlLCBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMuYm90dG9tKTtcbiAgICAgIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcy5ib3R0b20gPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmIChkZXRhY2hUb3AgfHwgZGV0YWNoQm90dG9tKSB7XG4gICAgICBzdGF0ZS5kb20uYm91bmRzLmhhbmRzLmJvdW5kcy5jbGVhcigpO1xuICAgICAgc3RhdGUuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcy5jbGVhcigpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiB1bmJpbmRFbGVtZW50KHN0YXRlOiBTdGF0ZSwgZWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gIHN0YXRlLmRvbS5lbGVtZW50VW5iaW5kcy5nZXQoZWwpPy4oKTtcbiAgc3RhdGUuZG9tLmVsZW1lbnRVbmJpbmRzLmRlbGV0ZShlbCk7XG4gIHN0YXRlLmRvbS5yZXNpemVPYnNlcnZlcj8udW5vYnNlcnZlKGVsKTtcbn1cbiIsICJpbXBvcnQgeyBhbmltLCByZW5kZXIgfSBmcm9tICcuL2FuaW0uanMnO1xuaW1wb3J0ICogYXMgYm9hcmQgZnJvbSAnLi9ib2FyZC5qcyc7XG5pbXBvcnQgdHlwZSB7IENvbmZpZyB9IGZyb20gJy4vY29uZmlnLmpzJztcbmltcG9ydCB7IGFwcGx5QW5pbWF0aW9uLCBjb25maWd1cmUgfSBmcm9tICcuL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBkZXRhY2hFbGVtZW50cywgcmVkcmF3QWxsIH0gZnJvbSAnLi9kb20uanMnO1xuaW1wb3J0IHsgY2FuY2VsIGFzIGRyYWdDYW5jZWwsIGRyYWdOZXdQaWVjZSB9IGZyb20gJy4vZHJhZy5qcyc7XG5pbXBvcnQgdHlwZSB7IERyYXdTaGFwZSwgU3F1YXJlSGlnaGxpZ2h0IH0gZnJvbSAnLi9kcmF3LmpzJztcbmltcG9ydCB7IGJpbmREb2N1bWVudCB9IGZyb20gJy4vZXZlbnRzLmpzJztcbmltcG9ydCB7IGFkZFRvSGFuZCwgcmVtb3ZlRnJvbUhhbmQgfSBmcm9tICcuL2hhbmRzLmpzJztcbmltcG9ydCB7IGJvYXJkVG9TZmVuLCBoYW5kc1RvU2ZlbiwgaW5mZXJEaW1lbnNpb25zIH0gZnJvbSAnLi9zZmVuLmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXBpIHtcbiAgLy8gYXR0YWNoIGVsZW1lbnRzIHRvIGN1cnJlbnQgc2cgaW5zdGFuY2VcbiAgYXR0YWNoKHdyYXBFbGVtZW50czogc2cuV3JhcEVsZW1lbnRzKTogdm9pZDtcblxuICAvLyBkZXRhY2ggZWxlbWVudHMgZnJvbSBjdXJyZW50IHNnIGluc3RhbmNlXG4gIGRldGFjaCh3cmFwRWxlbWVudHNCb29sZWFuOiBzZy5XcmFwRWxlbWVudHNCb29sZWFuKTogdm9pZDtcblxuICAvLyByZWNvbmZpZ3VyZSB0aGUgaW5zdGFuY2UuIEFjY2VwdHMgYWxsIGNvbmZpZyBvcHRpb25zXG4gIC8vIGJvYXJkIHdpbGwgYmUgYW5pbWF0ZWQgYWNjb3JkaW5nbHksIGlmIGFuaW1hdGlvbnMgYXJlIGVuYWJsZWRcbiAgc2V0KGNvbmZpZzogQ29uZmlnLCBza2lwQW5pbWF0aW9uPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gcmVhZCBzaG9naWdyb3VuZCBzdGF0ZTsgd3JpdGUgYXQgeW91ciBvd24gcmlza3NcbiAgc3RhdGU6IFN0YXRlO1xuXG4gIC8vIGdldCB0aGUgcG9zaXRpb24gb24gdGhlIGJvYXJkIGluIEZvcnN5dGggbm90YXRpb25cbiAgZ2V0Qm9hcmRTZmVuKCk6IHNnLkJvYXJkU2ZlbjtcblxuICAvLyBnZXQgdGhlIHBpZWNlcyBpbiBoYW5kIGluIEZvcnN5dGggbm90YXRpb25cbiAgZ2V0SGFuZHNTZmVuKCk6IHNnLkhhbmRzU2ZlbjtcblxuICAvLyBjaGFuZ2UgdGhlIHZpZXcgYW5nbGVcbiAgdG9nZ2xlT3JpZW50YXRpb24oKTogdm9pZDtcblxuICAvLyBwZXJmb3JtIGEgbW92ZSBwcm9ncmFtbWF0aWNhbGx5XG4gIG1vdmUob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXksIHByb20/OiBib29sZWFuKTogdm9pZDtcblxuICAvLyBwZXJmb3JtIGEgZHJvcCBwcm9ncmFtbWF0aWNhbGx5LCBieSBkZWZhdWx0IHBpZWNlIGlzIHRha2VuIGZyb20gaGFuZFxuICBkcm9wKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb20/OiBib29sZWFuLCBzcGFyZT86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIGFkZCBhbmQvb3IgcmVtb3ZlIGFyYml0cmFyeSBwaWVjZXMgb24gdGhlIGJvYXJkXG4gIHNldFBpZWNlcyhwaWVjZXM6IHNnLlBpZWNlc0RpZmYpOiB2b2lkO1xuXG4gIC8vIGFkZCBwaWVjZS5yb2xlIHRvIGhhbmQgb2YgcGllY2UuY29sb3JcbiAgYWRkVG9IYW5kKHBpZWNlOiBzZy5QaWVjZSwgY291bnQ/OiBudW1iZXIpOiB2b2lkO1xuXG4gIC8vIHJlbW92ZSBwaWVjZS5yb2xlIGZyb20gaGFuZCBvZiBwaWVjZS5jb2xvclxuICByZW1vdmVGcm9tSGFuZChwaWVjZTogc2cuUGllY2UsIGNvdW50PzogbnVtYmVyKTogdm9pZDtcblxuICAvLyBjbGljayBhIHNxdWFyZSBwcm9ncmFtbWF0aWNhbGx5XG4gIHNlbGVjdFNxdWFyZShrZXk6IHNnLktleSB8IG51bGwsIHByb20/OiBib29sZWFuLCBmb3JjZT86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIHNlbGVjdCBhIHBpZWNlIGZyb20gaGFuZCB0byBkcm9wIHByb2dyYW1hdGljYWxseSwgYnkgZGVmYXVsdCBwaWVjZSBpbiBoYW5kIGlzIHNlbGVjdGVkXG4gIHNlbGVjdFBpZWNlKHBpZWNlOiBzZy5QaWVjZSB8IG51bGwsIHNwYXJlPzogYm9vbGVhbiwgZm9yY2U/OiBib29sZWFuKTogdm9pZDtcblxuICAvLyBwbGF5IHRoZSBjdXJyZW50IHByZW1vdmUsIGlmIGFueTsgcmV0dXJucyB0cnVlIGlmIHByZW1vdmUgd2FzIHBsYXllZFxuICBwbGF5UHJlbW92ZSgpOiBib29sZWFuO1xuXG4gIC8vIGNhbmNlbCB0aGUgY3VycmVudCBwcmVtb3ZlLCBpZiBhbnlcbiAgY2FuY2VsUHJlbW92ZSgpOiB2b2lkO1xuXG4gIC8vIHBsYXkgdGhlIGN1cnJlbnQgcHJlZHJvcCwgaWYgYW55OyByZXR1cm5zIHRydWUgaWYgcHJlbW92ZSB3YXMgcGxheWVkXG4gIHBsYXlQcmVkcm9wKCk6IGJvb2xlYW47XG5cbiAgLy8gY2FuY2VsIHRoZSBjdXJyZW50IHByZWRyb3AsIGlmIGFueVxuICBjYW5jZWxQcmVkcm9wKCk6IHZvaWQ7XG5cbiAgLy8gY2FuY2VsIHRoZSBjdXJyZW50IG1vdmUgb3IgZHJvcCBiZWluZyBtYWRlLCBwcmVtb3ZlcyBhbmQgcHJlZHJvcHNcbiAgY2FuY2VsTW92ZU9yRHJvcCgpOiB2b2lkO1xuXG4gIC8vIGNhbmNlbCBjdXJyZW50IG1vdmUgb3IgZHJvcCBhbmQgcHJldmVudCBmdXJ0aGVyIG9uZXNcbiAgc3RvcCgpOiB2b2lkO1xuXG4gIC8vIHByb2dyYW1tYXRpY2FsbHkgZHJhdyB1c2VyIHNoYXBlc1xuICBzZXRTaGFwZXMoc2hhcGVzOiBEcmF3U2hhcGVbXSk6IHZvaWQ7XG5cbiAgLy8gcHJvZ3JhbW1hdGljYWxseSBkcmF3IGF1dG8gc2hhcGVzXG4gIHNldEF1dG9TaGFwZXMoc2hhcGVzOiBEcmF3U2hhcGVbXSk6IHZvaWQ7XG5cbiAgLy8gcHJvZ3JhbW1hdGljYWxseSBoaWdobGlnaHQgc3F1YXJlc1xuICBzZXRTcXVhcmVIaWdobGlnaHRzKHNxdWFyZXM6IFNxdWFyZUhpZ2hsaWdodFtdKTogdm9pZDtcblxuICAvLyBmb3IgcGllY2UgZHJvcHBpbmcgYW5kIGJvYXJkIGVkaXRvcnNcbiAgZHJhZ05ld1BpZWNlKHBpZWNlOiBzZy5QaWVjZSwgZXZlbnQ6IHNnLk1vdWNoRXZlbnQsIHNwYXJlPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gdW5iaW5kcyBhbGwgZXZlbnRzXG4gIC8vIChpbXBvcnRhbnQgZm9yIGRvY3VtZW50LXdpZGUgZXZlbnRzIGxpa2Ugc2Nyb2xsIGFuZCBtb3VzZW1vdmUpXG4gIGRlc3Ryb3k6IHNnLlVuYmluZDtcbn1cblxuLy8gc2VlIEFQSSB0eXBlcyBhbmQgZG9jdW1lbnRhdGlvbnMgaW4gYXBpLmQudHNcbmV4cG9ydCBmdW5jdGlvbiBzdGFydChzdGF0ZTogU3RhdGUpOiBBcGkge1xuICByZXR1cm4ge1xuICAgIGF0dGFjaCh3cmFwRWxlbWVudHM6IHNnLldyYXBFbGVtZW50cyk6IHZvaWQge1xuICAgICAgcmVkcmF3QWxsKHdyYXBFbGVtZW50cywgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBkZXRhY2god3JhcEVsZW1lbnRzQm9vbGVhbjogc2cuV3JhcEVsZW1lbnRzQm9vbGVhbik6IHZvaWQge1xuICAgICAgZGV0YWNoRWxlbWVudHMod3JhcEVsZW1lbnRzQm9vbGVhbiwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzZXQodXBkYXRlOiBDb25maWcsIHNraXBBbmltYXRpb24/OiBib29sZWFuKTogdm9pZCB7XG4gICAgICBpZiAoc3RhdGUuZG9tLmRlc3Ryb3llZCkgcmV0dXJuO1xuICAgICAgY29uc3QgY29uZmlnID0geyAuLi51cGRhdGUsIHZpZXdPbmx5OiB1cGRhdGUudmlld09ubHkgPz8gc3RhdGUudmlld09ubHkgfTtcbiAgICAgIGNvbnN0IGNoYW5nZWQgPSA8VD4odmFsdWU6IFQgfCB1bmRlZmluZWQsIGN1cnJlbnQ6IFQpOiBib29sZWFuID0+XG4gICAgICAgIHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IGN1cnJlbnQ7XG4gICAgICBjb25zdCB2aWV3T25seUNoYW5nZWQgPSBjaGFuZ2VkKGNvbmZpZy52aWV3T25seSwgc3RhdGUudmlld09ubHkpO1xuICAgICAgY29uc3QgbmV3RGltcyA9IGNvbmZpZy5zZmVuPy5ib2FyZCAmJiBpbmZlckRpbWVuc2lvbnMoY29uZmlnLnNmZW4uYm9hcmQpO1xuICAgICAgY29uc3QgdG9SZWRyYXcgPVxuICAgICAgICB2aWV3T25seUNoYW5nZWQgfHxcbiAgICAgICAgY2hhbmdlZChjb25maWcub3JpZW50YXRpb24sIHN0YXRlLm9yaWVudGF0aW9uKSB8fFxuICAgICAgICBjaGFuZ2VkKGNvbmZpZy5jb29yZGluYXRlcz8uZW5hYmxlZCwgc3RhdGUuY29vcmRpbmF0ZXMuZW5hYmxlZCkgfHxcbiAgICAgICAgY2hhbmdlZChjb25maWcuY29vcmRpbmF0ZXM/LmZpbGVzLCBzdGF0ZS5jb29yZGluYXRlcy5maWxlcykgfHxcbiAgICAgICAgY2hhbmdlZChjb25maWcuY29vcmRpbmF0ZXM/LnJhbmtzLCBzdGF0ZS5jb29yZGluYXRlcy5yYW5rcykgfHxcbiAgICAgICAgY2hhbmdlZChjb25maWcuZHJhd2FibGU/LnZpc2libGUsIHN0YXRlLmRyYXdhYmxlLnZpc2libGUpIHx8XG4gICAgICAgIGNoYW5nZWQoY29uZmlnLmhhbmRzPy5pbmxpbmVkLCBzdGF0ZS5oYW5kcy5pbmxpbmVkKSB8fFxuICAgICAgICAhIWNvbmZpZy5zcXVhcmVSYXRpbz8uc29tZSgodmFsdWUsIGkpID0+IHZhbHVlICE9PSBzdGF0ZS5zcXVhcmVSYXRpb1tpXSkgfHxcbiAgICAgICAgISEoXG4gICAgICAgICAgbmV3RGltcyAmJlxuICAgICAgICAgIChuZXdEaW1zLmZpbGVzICE9PSBzdGF0ZS5kaW1lbnNpb25zLmZpbGVzIHx8IG5ld0RpbXMucmFua3MgIT09IHN0YXRlLmRpbWVuc2lvbnMucmFua3MpXG4gICAgICAgICkgfHxcbiAgICAgICAgISEoXG4gICAgICAgICAgY29uZmlnLmhhbmRzPy5yb2xlcyAmJlxuICAgICAgICAgIChjb25maWcuaGFuZHMucm9sZXMubGVuZ3RoICE9PSBzdGF0ZS5oYW5kcy5yb2xlcy5sZW5ndGggfHxcbiAgICAgICAgICAgIGNvbmZpZy5oYW5kcy5yb2xlcy5zb21lKChyLCBpKSA9PiByICE9PSBzdGF0ZS5oYW5kcy5yb2xlc1tpXSkpXG4gICAgICAgICk7XG5cbiAgICAgIGlmICh0b1JlZHJhdyB8fCBjb25maWcuZHJhd2FibGU/LmVuYWJsZWQgPT09IGZhbHNlKSBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgICAgaWYgKHRvUmVkcmF3KSB7XG4gICAgICAgIGJvYXJkLnJlc2V0KHN0YXRlKTtcbiAgICAgICAgY29uZmlndXJlKHN0YXRlLCBjb25maWcpO1xuICAgICAgICBpZiAodmlld09ubHlDaGFuZ2VkKSB7XG4gICAgICAgICAgc3RhdGUuZG9tLnVuYmluZCgpO1xuICAgICAgICAgIHN0YXRlLmRvbS51bmJpbmQgPSBiaW5kRG9jdW1lbnQoc3RhdGUpO1xuICAgICAgICB9XG4gICAgICAgIHJlZHJhd0FsbChzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLCBzdGF0ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhcHBseUFuaW1hdGlvbihzdGF0ZSwgY29uZmlnKTtcbiAgICAgICAgaWYgKHNraXBBbmltYXRpb24pIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICAoY29uZmlnLnNmZW4/LmJvYXJkICYmICFza2lwQW5pbWF0aW9uID8gYW5pbSA6IHJlbmRlcikoXG4gICAgICAgICAgKHN0YXRlKSA9PiBjb25maWd1cmUoc3RhdGUsIGNvbmZpZyksXG4gICAgICAgICAgc3RhdGUsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHN0YXRlLFxuXG4gICAgZ2V0Qm9hcmRTZmVuOiAoKSA9PiBib2FyZFRvU2ZlbihzdGF0ZS5waWVjZXMsIHN0YXRlLmRpbWVuc2lvbnMsIHN0YXRlLmZvcnN5dGgudG9Gb3JzeXRoKSxcblxuICAgIGdldEhhbmRzU2ZlbjogKCkgPT5cbiAgICAgIGhhbmRzVG9TZmVuKHN0YXRlLmhhbmRzLmhhbmRNYXAsIHN0YXRlLmhhbmRzLnJvbGVzLCBzdGF0ZS5mb3JzeXRoLnRvRm9yc3l0aCksXG5cbiAgICB0b2dnbGVPcmllbnRhdGlvbigpOiB2b2lkIHtcbiAgICAgIGJvYXJkLnRvZ2dsZU9yaWVudGF0aW9uKHN0YXRlKTtcbiAgICAgIHJlZHJhd0FsbChzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIG1vdmUob3JpZywgZGVzdCwgcHJvbSk6IHZvaWQge1xuICAgICAgYW5pbShcbiAgICAgICAgKHN0YXRlKSA9PlxuICAgICAgICAgIGJvYXJkLmJhc2VNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0LCBwcm9tIHx8IHN0YXRlLnByb21vdGlvbi5mb3JjZU1vdmVQcm9tb3Rpb24ob3JpZywgZGVzdCkpLFxuICAgICAgICBzdGF0ZSxcbiAgICAgICk7XG4gICAgfSxcblxuICAgIGRyb3AocGllY2UsIGtleSwgcHJvbSwgc3BhcmUpOiB2b2lkIHtcbiAgICAgIGFuaW0oXG4gICAgICAgIChzdGF0ZSkgPT5cbiAgICAgICAgICBib2FyZC5iYXNlRHJvcChcbiAgICAgICAgICAgIHN0YXRlLFxuICAgICAgICAgICAgcGllY2UsXG4gICAgICAgICAgICBrZXksXG4gICAgICAgICAgICBwcm9tIHx8IHN0YXRlLnByb21vdGlvbi5mb3JjZURyb3BQcm9tb3Rpb24ocGllY2UsIGtleSksXG4gICAgICAgICAgICAhIXNwYXJlLFxuICAgICAgICAgICksXG4gICAgICAgIHN0YXRlLFxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgc2V0UGllY2VzKHBpZWNlcyk6IHZvaWQge1xuICAgICAgYW5pbSgoc3RhdGUpID0+IGJvYXJkLnNldFBpZWNlcyhzdGF0ZSwgcGllY2VzKSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBhZGRUb0hhbmQocGllY2U6IHNnLlBpZWNlLCBjb3VudDogbnVtYmVyKTogdm9pZCB7XG4gICAgICByZW5kZXIoKHN0YXRlKSA9PiBhZGRUb0hhbmQoc3RhdGUsIHBpZWNlLCBjb3VudCksIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlRnJvbUhhbmQocGllY2U6IHNnLlBpZWNlLCBjb3VudDogbnVtYmVyKTogdm9pZCB7XG4gICAgICByZW5kZXIoKHN0YXRlKSA9PiByZW1vdmVGcm9tSGFuZChzdGF0ZSwgcGllY2UsIGNvdW50KSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzZWxlY3RTcXVhcmUoa2V5LCBwcm9tLCBmb3JjZSk6IHZvaWQge1xuICAgICAgaWYgKGtleSkgYW5pbSgoc3RhdGUpID0+IGJvYXJkLnNlbGVjdFNxdWFyZShzdGF0ZSwga2V5LCBwcm9tLCBmb3JjZSksIHN0YXRlKTtcbiAgICAgIGVsc2UgaWYgKHN0YXRlLnNlbGVjdGVkKSB7XG4gICAgICAgIGJvYXJkLnVuc2VsZWN0KHN0YXRlKTtcbiAgICAgICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBzZWxlY3RQaWVjZShwaWVjZSwgc3BhcmUsIGZvcmNlKTogdm9pZCB7XG4gICAgICBpZiAocGllY2UpIHJlbmRlcigoc3RhdGUpID0+IGJvYXJkLnNlbGVjdFBpZWNlKHN0YXRlLCBwaWVjZSwgc3BhcmUsIGZvcmNlLCB0cnVlKSwgc3RhdGUpO1xuICAgICAgZWxzZSBpZiAoc3RhdGUuc2VsZWN0ZWRQaWVjZSkge1xuICAgICAgICBib2FyZC51bnNlbGVjdChzdGF0ZSk7XG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcGxheVByZW1vdmUoKTogYm9vbGVhbiB7XG4gICAgICBpZiAoc3RhdGUucHJlbW92YWJsZS5jdXJyZW50KSB7XG4gICAgICAgIGlmIChhbmltKGJvYXJkLnBsYXlQcmVtb3ZlLCBzdGF0ZSkpIHJldHVybiB0cnVlO1xuICAgICAgICAvLyBpZiB0aGUgcHJlbW92ZSBjb3VsZG4ndCBiZSBwbGF5ZWQsIHJlZHJhdyB0byBjbGVhciBpdCB1cFxuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIHBsYXlQcmVkcm9wKCk6IGJvb2xlYW4ge1xuICAgICAgaWYgKHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50KSB7XG4gICAgICAgIGlmIChhbmltKGJvYXJkLnBsYXlQcmVkcm9wLCBzdGF0ZSkpIHJldHVybiB0cnVlO1xuICAgICAgICAvLyBpZiB0aGUgcHJlZHJvcCBjb3VsZG4ndCBiZSBwbGF5ZWQsIHJlZHJhdyB0byBjbGVhciBpdCB1cFxuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIGNhbmNlbFByZW1vdmUoKTogdm9pZCB7XG4gICAgICByZW5kZXIoYm9hcmQudW5zZXRQcmVtb3ZlLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGNhbmNlbFByZWRyb3AoKTogdm9pZCB7XG4gICAgICByZW5kZXIoYm9hcmQudW5zZXRQcmVkcm9wLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGNhbmNlbE1vdmVPckRyb3AoKTogdm9pZCB7XG4gICAgICByZW5kZXIoKHN0YXRlKSA9PiB7XG4gICAgICAgIGJvYXJkLmNhbmNlbE1vdmVPckRyb3Aoc3RhdGUpO1xuICAgICAgICBkcmFnQ2FuY2VsKHN0YXRlKTtcbiAgICAgIH0sIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc3RvcCgpOiB2b2lkIHtcbiAgICAgIHJlbmRlcigoc3RhdGUpID0+IHtcbiAgICAgICAgYm9hcmQuc3RvcChzdGF0ZSk7XG4gICAgICB9LCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHNldEF1dG9TaGFwZXMoc2hhcGVzOiBEcmF3U2hhcGVbXSk6IHZvaWQge1xuICAgICAgcmVuZGVyKChzdGF0ZSkgPT4ge1xuICAgICAgICBzdGF0ZS5kcmF3YWJsZS5hdXRvU2hhcGVzID0gc2hhcGVzO1xuICAgICAgfSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzZXRTaGFwZXMoc2hhcGVzOiBEcmF3U2hhcGVbXSk6IHZvaWQge1xuICAgICAgcmVuZGVyKChzdGF0ZSkgPT4ge1xuICAgICAgICBzdGF0ZS5kcmF3YWJsZS5zaGFwZXMgPSBzaGFwZXM7XG4gICAgICB9LCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHNldFNxdWFyZUhpZ2hsaWdodHMoc3F1YXJlczogU3F1YXJlSGlnaGxpZ2h0W10pOiB2b2lkIHtcbiAgICAgIHJlbmRlcigoc3RhdGUpID0+IHtcbiAgICAgICAgc3RhdGUuZHJhd2FibGUuc3F1YXJlcyA9IHNxdWFyZXM7XG4gICAgICB9LCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGRyYWdOZXdQaWVjZShwaWVjZSwgZXZlbnQsIHNwYXJlKTogdm9pZCB7XG4gICAgICBkcmFnTmV3UGllY2Uoc3RhdGUsIHBpZWNlLCBldmVudCwgc3BhcmUpO1xuICAgIH0sXG5cbiAgICBkZXN0cm95KCk6IHZvaWQge1xuICAgICAgYm9hcmQuc3RvcChzdGF0ZSk7XG4gICAgICBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgICAgc3RhdGUuZG9tLmVsZW1lbnRVbmJpbmRzLmZvckVhY2goKHVuYmluZCkgPT4ge1xuICAgICAgICB1bmJpbmQoKTtcbiAgICAgIH0pO1xuICAgICAgc3RhdGUuZG9tLmVsZW1lbnRVbmJpbmRzLmNsZWFyKCk7XG4gICAgICBzdGF0ZS5kb20udW5iaW5kKCk7XG4gICAgICBzdGF0ZS5kb20uZGVzdHJveWVkID0gdHJ1ZTtcbiAgICB9LFxuICB9O1xufVxuIiwgImltcG9ydCB7IHJlbmRlckhhbmQgfSBmcm9tICcuL2hhbmRzLmpzJztcbmltcG9ydCB7IHJlbmRlciB9IGZyb20gJy4vcmVuZGVyLmpzJztcbmltcG9ydCB7IHJlbmRlclNoYXBlcyB9IGZyb20gJy4vc2hhcGVzLmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlZHJhd1NoYXBlc05vdyhzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZD8uc2hhcGVzKVxuICAgIHJlbmRlclNoYXBlcyhcbiAgICAgIHN0YXRlLFxuICAgICAgc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkLnNoYXBlcy5zdmcsXG4gICAgICBzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQuc2hhcGVzLmN1c3RvbVN2ZyxcbiAgICAgIHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZC5zaGFwZXMuZnJlZVBpZWNlcyxcbiAgICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVkcmF3Tm93KHN0YXRlOiBTdGF0ZSwgc2tpcFNoYXBlcz86IGJvb2xlYW4pOiB2b2lkIHtcbiAgY29uc3QgYm9hcmRFbHMgPSBzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQ7XG4gIGlmIChib2FyZEVscykge1xuICAgIHJlbmRlcihzdGF0ZSwgYm9hcmRFbHMpO1xuICAgIGlmICghc2tpcFNoYXBlcykgcmVkcmF3U2hhcGVzTm93KHN0YXRlKTtcbiAgfVxuXG4gIGNvbnN0IGhhbmRFbHMgPSBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHM7XG4gIGlmIChoYW5kRWxzKSB7XG4gICAgaWYgKGhhbmRFbHMudG9wKSByZW5kZXJIYW5kKHN0YXRlLCBoYW5kRWxzLnRvcCk7XG4gICAgaWYgKGhhbmRFbHMuYm90dG9tKSByZW5kZXJIYW5kKHN0YXRlLCBoYW5kRWxzLmJvdHRvbSk7XG4gIH1cbn1cbiIsICJpbXBvcnQgdHlwZSB7IEFuaW1DdXJyZW50IH0gZnJvbSAnLi9hbmltLmpzJztcbmltcG9ydCB0eXBlIHsgRHJhZ0N1cnJlbnQgfSBmcm9tICcuL2RyYWcuanMnO1xuaW1wb3J0IHR5cGUgeyBEcmF3YWJsZSB9IGZyb20gJy4vZHJhdy5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEhlYWRsZXNzU3RhdGUge1xuICBwaWVjZXM6IHNnLlBpZWNlcztcbiAgb3JpZW50YXRpb246IHNnLkNvbG9yOyAvLyBib2FyZCBvcmllbnRhdGlvbi4gc2VudGUgfCBnb3RlXG4gIGRpbWVuc2lvbnM6IHNnLkRpbWVuc2lvbnM7IC8vIGJvYXJkIGRpbWVuc2lvbnMgLSBtYXggMTZ4MTZcbiAgdHVybkNvbG9yOiBzZy5Db2xvcjsgLy8gdHVybiB0byBwbGF5LiBzZW50ZSB8IGdvdGVcbiAgYWN0aXZlQ29sb3I/OiBzZy5Db2xvciB8ICdib3RoJzsgLy8gY29sb3IgdGhhdCBjYW4gbW92ZSBvciBkcm9wLiBzZW50ZSB8IGdvdGUgfCBib3RoIHwgdW5kZWZpbmVkXG4gIGNoZWNrcz86IHNnLktleVtdOyAvLyBzcXVhcmVzIGN1cnJlbnRseSBpbiBjaGVjayBbXCI1YVwiXVxuICBsYXN0RGVzdHM/OiBzZy5LZXlbXTsgLy8gc3F1YXJlcyBwYXJ0IG9mIHRoZSBsYXN0IG1vdmUgb3IgZHJvcCBbXCIyYlwiOyBcIjhoXCJdXG4gIGxhc3RQaWVjZT86IHNnLlBpZWNlOyAvLyBwaWVjZSBwYXJ0IG9mIHRoZSBsYXN0IGRyb3BcbiAgc2VsZWN0ZWQ/OiBzZy5LZXk7IC8vIHNxdWFyZSBjdXJyZW50bHkgc2VsZWN0ZWQgXCIxYVwiXG4gIHNlbGVjdGVkUGllY2U/OiBzZy5QaWVjZTsgLy8gcGllY2UgaW4gaGFuZCBjdXJyZW50bHkgc2VsZWN0ZWRcbiAgaG92ZXJlZD86IHNnLktleTsgLy8gc3F1YXJlIGN1cnJlbnRseSBiZWluZyBob3ZlcmVkXG4gIHZpZXdPbmx5OiBib29sZWFuOyAvLyBkb24ndCBiaW5kIGludGVyYWN0aW9uIGV2ZW50c1xuICBzcXVhcmVSYXRpbzogc2cuTnVtYmVyUGFpcjsgLy8gcmF0aW8gb2YgdGhlIGJvYXJkIFt3aWR0aCwgaGVpZ2h0XVxuICBkaXNhYmxlQ29udGV4dE1lbnU6IGJvb2xlYW47IC8vIGJlY2F1c2Ugd2hvIG5lZWRzIGEgY29udGV4dCBtZW51IG9uIGEgc2hvZ2kgYm9hcmRcbiAgYmxvY2tUb3VjaFNjcm9sbDogYm9vbGVhbjsgLy8gYmxvY2sgc2Nyb2xsaW5nIHZpYSB0b3VjaCBkcmFnZ2luZyBvbiB0aGUgYm9hcmQsIGUuZy4gZm9yIGNvb3JkaW5hdGUgdHJhaW5pbmdcbiAgc2NhbGVEb3duUGllY2VzOiBib29sZWFuO1xuICBjb29yZGluYXRlczoge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGluY2x1ZGUgY29vcmRzIGF0dHJpYnV0ZXNcbiAgICBmaWxlczogc2cuTm90YXRpb247XG4gICAgcmFua3M6IHNnLk5vdGF0aW9uO1xuICB9O1xuICBoaWdobGlnaHQ6IHtcbiAgICBsYXN0RGVzdHM6IGJvb2xlYW47IC8vIGFkZCBsYXN0LWRlc3QgY2xhc3MgdG8gc3F1YXJlcyBhbmQgcGllY2VzXG4gICAgY2hlY2s6IGJvb2xlYW47IC8vIGFkZCBjaGVjayBjbGFzcyB0byBzcXVhcmVzXG4gICAgY2hlY2tSb2xlczogc2cuUm9sZVN0cmluZ1tdOyAvLyByb2xlcyB0byBiZSBoaWdobGlnaHRlZCB3aGVuIGNoZWNrIGlzIGJvb2xlYW4gaXMgcGFzc2VkIGZyb20gY29uZmlnXG4gICAgaG92ZXJlZDogYm9vbGVhbjsgLy8gYWRkIGhvdmVyIGNsYXNzIHRvIGhvdmVyZWQgc3F1YXJlc1xuICB9O1xuICBhbmltYXRpb246IHsgZW5hYmxlZDogYm9vbGVhbjsgaGFuZHM6IGJvb2xlYW47IGR1cmF0aW9uOiBudW1iZXI7IGN1cnJlbnQ/OiBBbmltQ3VycmVudCB9O1xuICBoYW5kczoge1xuICAgIGlubGluZWQ6IGJvb2xlYW47IC8vIGF0dGFjaGVzIHNnLWhhbmRzIGRpcmVjdGx5IHRvIHNnLXdyYXAsIGlnbm9yZXMgSFRNTEVsZW1lbnRzIHBhc3NlZCB0byBTaG9naWdyb3VuZFxuICAgIGhhbmRNYXA6IHNnLkhhbmRzO1xuICAgIHJvbGVzOiBzZy5Sb2xlU3RyaW5nW107IC8vIHJvbGVzIHRvIHJlbmRlciBpbiBzZy1oYW5kXG4gIH07XG4gIG1vdmFibGU6IHtcbiAgICBmcmVlOiBib29sZWFuOyAvLyBhbGwgbW92ZXMgYXJlIHZhbGlkIC0gYm9hcmQgZWRpdG9yXG4gICAgZGVzdHM/OiBzZy5Nb3ZlRGVzdHM7IC8vIHZhbGlkIG1vdmVzLiB7XCI3Z1wiIFtcIjdmXCJdIFwiNWlcIiBbXCI0aFwiIFwiNWhcIiBcIjZoXCJdfVxuICAgIHNob3dEZXN0czogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIGRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIGV2ZW50czoge1xuICAgICAgYWZ0ZXI/OiAob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXksIHByb206IGJvb2xlYW4sIG1ldGFkYXRhOiBzZy5Nb3ZlTWV0YWRhdGEpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgbW92ZSBoYXMgYmVlbiBwbGF5ZWRcbiAgICB9O1xuICB9O1xuICBkcm9wcGFibGU6IHtcbiAgICBmcmVlOiBib29sZWFuOyAvLyBhbGwgZHJvcHMgYXJlIHZhbGlkIC0gYm9hcmQgZWRpdG9yXG4gICAgZGVzdHM/OiBzZy5Ecm9wRGVzdHM7IC8vIHZhbGlkIGRyb3BzLiB7XCJzZW50ZSBwYXduXCIgW1wiM2FcIiBcIjRhXCJdIFwic2VudGUgbGFuY2VcIiBbXCIzYVwiIFwiM2NcIl19XG4gICAgc2hvd0Rlc3RzOiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgc3BhcmU6IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gcmVtb3ZlIGRyb3BwZWQgcGllY2UgZnJvbSBoYW5kIGFmdGVyIGRyb3AgLSBib2FyZCBlZGl0b3JcbiAgICBldmVudHM6IHtcbiAgICAgIGFmdGVyPzogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb206IGJvb2xlYW4sIG1ldGFkYXRhOiBzZy5Nb3ZlTWV0YWRhdGEpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgZHJvcCBoYXMgYmVlbiBwbGF5ZWRcbiAgICB9O1xuICB9O1xuICBwcmVtb3ZhYmxlOiB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjsgLy8gYWxsb3cgcHJlbW92ZXMgZm9yIGNvbG9yIHRoYXQgY2FuIG5vdCBtb3ZlXG4gICAgc2hvd0Rlc3RzOiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgcHJlLWRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIGRlc3RzPzogc2cuS2V5W107IC8vIHByZW1vdmUgZGVzdGluYXRpb25zIGZvciB0aGUgY3VycmVudCBzZWxlY3Rpb25cbiAgICBjdXJyZW50PzogeyBvcmlnOiBzZy5LZXk7IGRlc3Q6IHNnLktleTsgcHJvbTogYm9vbGVhbiB9O1xuICAgIGdlbmVyYXRlPzogKGtleTogc2cuS2V5LCBwaWVjZXM6IHNnLlBpZWNlcykgPT4gc2cuS2V5W107XG4gICAgZXZlbnRzOiB7XG4gICAgICBzZXQ/OiAob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXksIHByb206IGJvb2xlYW4pID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlbW92ZSBoYXMgYmVlbiBzZXRcbiAgICAgIHVuc2V0PzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVtb3ZlIGhhcyBiZWVuIHVuc2V0XG4gICAgfTtcbiAgfTtcbiAgcHJlZHJvcHBhYmxlOiB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjsgLy8gYWxsb3cgcHJlZHJvcHMgZm9yIGNvbG9yIHRoYXQgY2FuIG5vdCBtb3ZlXG4gICAgc2hvd0Rlc3RzOiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgcHJlLWRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIGRlc3RzPzogc2cuS2V5W107IC8vIHByZW1vdmUgZGVzdGluYXRpb25zIGZvciB0aGUgZHJvcCBzZWxlY3Rpb25cbiAgICBjdXJyZW50PzogeyBwaWVjZTogc2cuUGllY2U7IGtleTogc2cuS2V5OyBwcm9tOiBib29sZWFuIH07XG4gICAgZ2VuZXJhdGU/OiAocGllY2U6IHNnLlBpZWNlLCBwaWVjZXM6IHNnLlBpZWNlcykgPT4gc2cuS2V5W107XG4gICAgZXZlbnRzOiB7XG4gICAgICBzZXQ/OiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSwgcHJvbTogYm9vbGVhbikgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVkcm9wIGhhcyBiZWVuIHNldFxuICAgICAgdW5zZXQ/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZWRyb3AgaGFzIGJlZW4gdW5zZXRcbiAgICB9O1xuICB9O1xuICBkcmFnZ2FibGU6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBhbGxvdyBtb3ZlcyAmIHByZW1vdmVzIHRvIHVzZSBkcmFnJ24gZHJvcFxuICAgIGRpc3RhbmNlOiBudW1iZXI7IC8vIG1pbmltdW0gZGlzdGFuY2UgdG8gaW5pdGlhdGUgYSBkcmFnOyBpbiBwaXhlbHNcbiAgICBhdXRvRGlzdGFuY2U6IGJvb2xlYW47IC8vIGxldHMgc2hvZ2lncm91bmQgc2V0IGRpc3RhbmNlIHRvIHplcm8gd2hlbiB1c2VyIGRyYWdzIHBpZWNlc1xuICAgIHNob3dHaG9zdDogYm9vbGVhbjsgLy8gc2hvdyBnaG9zdCBvZiBwaWVjZSBiZWluZyBkcmFnZ2VkXG4gICAgc2hvd1RvdWNoU3F1YXJlT3ZlcmxheTogYm9vbGVhbjsgLy8gc2hvdyBzcXVhcmUgb3ZlcmxheSBvbiB0aGUgc3F1YXJlIHRoYXQgaXMgY3VycmVudGx5IGJlaW5nIGhvdmVyZWQsIHRvdWNoIG9ubHlcbiAgICBkZWxldGVPbkRyb3BPZmY6IGJvb2xlYW47IC8vIGRlbGV0ZSBhIHBpZWNlIHdoZW4gaXQgaXMgZHJvcHBlZCBvZmYgdGhlIGJvYXJkIC0gYm9hcmQgZWRpdG9yXG4gICAgYWRkVG9IYW5kT25Ecm9wT2ZmOiBib29sZWFuOyAvLyBhZGQgYSBwaWVjZSB0byBoYW5kIHdoZW4gaXQgaXMgZHJvcHBlZCBvbiBpdCwgcmVxdWlyZXMgZGVsZXRlT25Ecm9wT2ZmIC0gYm9hcmQgZWRpdG9yXG4gICAgY3VycmVudD86IERyYWdDdXJyZW50O1xuICB9O1xuICBzZWxlY3RhYmxlOiB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjsgLy8gZGlzYWJsZSB0byBlbmZvcmNlIGRyYWdnaW5nIG92ZXIgY2xpY2stY2xpY2sgbW92ZVxuICAgIGZvcmNlU3BhcmVzOiBib29sZWFuOyAvLyBhbGxvdyBkcm9wcGluZyBzcGFyZSBwaWVjZXMgZXZlbiB3aXRoIHNlbGVjdGFibGUgZGlzYWJsZWRcbiAgICBkZWxldGVPblRvdWNoOiBib29sZWFuOyAvLyBzZWxlY3RpbmcgYSBwaWVjZSBvbiB0aGUgYm9hcmQgb3IgaW4gaGFuZCB3aWxsIHJlbW92ZSBpdCAtIGJvYXJkIGVkaXRvclxuICAgIGFkZFNwYXJlc1RvSGFuZDogYm9vbGVhbjsgLy8gYWRkIHNlbGVjdGVkIHNwYXJlIHBpZWNlIHRvIGhhbmQgLSBib2FyZCBlZGl0b3JcbiAgfTtcbiAga2V5Ym9hcmQ6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBhcnJvdyBrZXlzLCBFbnRlciBhbmQgRXNjYXBlIG9uIHRoZSBmb2N1c2VkIGJvYXJkXG4gICAgY3VycmVudD86IHNnLktleSB8IHNnLlBpZWNlOyAvLyBjdXJzb3IsIGluZGVwZW5kZW50IG9mIHRoZSBzZWxlY3RlZCBwaWVjZVxuICAgIGZvY3VzZWQ6IGJvb2xlYW47XG4gIH07XG4gIHByb21vdGlvbjoge1xuICAgIHByb21vdGVzVG86IChyb2xlOiBzZy5Sb2xlU3RyaW5nKSA9PiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIHVucHJvbW90ZXNUbzogKHJvbGU6IHNnLlJvbGVTdHJpbmcpID0+IHNnLlJvbGVTdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgbW92ZVByb21vdGlvbkRpYWxvZzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KSA9PiBib29sZWFuO1xuICAgIGZvcmNlTW92ZVByb21vdGlvbjogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KSA9PiBib29sZWFuO1xuICAgIGRyb3BQcm9tb3Rpb25EaWFsb2c6IChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5KSA9PiBib29sZWFuO1xuICAgIGZvcmNlRHJvcFByb21vdGlvbjogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXkpID0+IGJvb2xlYW47XG4gICAgY3VycmVudD86IHtcbiAgICAgIHBpZWNlOiBzZy5QaWVjZTtcbiAgICAgIHByb21vdGVkUGllY2U6IHNnLlBpZWNlO1xuICAgICAga2V5OiBzZy5LZXk7XG4gICAgICBkcmFnZ2VkOiBib29sZWFuOyAvLyBubyBhbmltYXRpb25zIHdpdGggZHJhZ1xuICAgICAga2V5Ym9hcmRDaG9pY2U/OiBib29sZWFuOyAvLyB1bmRlZmluZWQgZGVmYXVsdHMgdG8gdGhlIHByb21vdGVkIG9wdGlvblxuICAgIH07XG4gICAgZXZlbnRzOiB7XG4gICAgICBpbml0aWF0ZWQ/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBwcm9tb3Rpb24gZGlhbG9nIGlzIHN0YXJ0ZWRcbiAgICAgIGFmdGVyPzogKHBpZWNlOiBzZy5QaWVjZSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHVzZXIgc2VsZWN0cyBhIHBpZWNlXG4gICAgICBjYW5jZWw/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdXNlciBjYW5jZWxzIHRoZSBzZWxlY3Rpb25cbiAgICB9O1xuICAgIHByZXZQcm9tb3Rpb25IYXNoOiBzdHJpbmc7XG4gIH07XG4gIGZvcnN5dGg6IHtcbiAgICB0b0ZvcnN5dGg/OiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIGZyb21Gb3JzeXRoPzogKHN0cjogc3RyaW5nKSA9PiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkO1xuICB9O1xuICBldmVudHM6IHtcbiAgICBjaGFuZ2U/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHNpdHVhdGlvbiBjaGFuZ2VzIG9uIHRoZSBib2FyZFxuICAgIG1vdmU/OiAob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXksIHByb206IGJvb2xlYW4sIGNhcHR1cmVkUGllY2U/OiBzZy5QaWVjZSkgPT4gdm9pZDtcbiAgICBkcm9wPzogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb206IGJvb2xlYW4pID0+IHZvaWQ7XG4gICAgc2VsZWN0PzogKGtleTogc2cuS2V5KSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBhIHNxdWFyZSBpcyBzZWxlY3RlZFxuICAgIHVuc2VsZWN0PzogKGtleTogc2cuS2V5KSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBhIHNlbGVjdGVkIHNxdWFyZSBpcyBkaXJlY3RseSB1bnNlbGVjdGVkIC0gZHJvcHBlZCBiYWNrIG9yIGNsaWNrZWQgb24gdGhlIG9yaWdpbmFsIHNxdWFyZVxuICAgIHBpZWNlU2VsZWN0PzogKHBpZWNlOiBzZy5QaWVjZSkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gYSBwaWVjZSBpbiBoYW5kIGlzIHNlbGVjdGVkXG4gICAgcGllY2VVbnNlbGVjdD86IChwaWVjZTogc2cuUGllY2UpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIGEgc2VsZWN0ZWQgcGllY2UgaXMgZGlyZWN0bHkgdW5zZWxlY3RlZCAtIGRyb3BwZWQgYmFjayBvciBjbGlja2VkIG9uIHRoZSBzYW1lIHBpZWNlXG4gICAgaW5zZXJ0PzogKGJvYXJkRWxlbWVudHM/OiBzZy5Cb2FyZEVsZW1lbnRzLCBoYW5kRWxlbWVudHM/OiBzZy5IYW5kRWxlbWVudHMpID0+IHZvaWQ7IC8vIHdoZW4gdGhlIGJvYXJkIG9yIGhhbmRzIERPTSBoYXMgYmVlbiAocmUpaW5zZXJ0ZWRcbiAgfTtcbiAgZHJhd2FibGU6IERyYXdhYmxlO1xufVxuZXhwb3J0IGludGVyZmFjZSBTdGF0ZSBleHRlbmRzIEhlYWRsZXNzU3RhdGUge1xuICBkb206IHNnLkRvbTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRzKCk6IEhlYWRsZXNzU3RhdGUge1xuICByZXR1cm4ge1xuICAgIHBpZWNlczogbmV3IE1hcCgpLFxuICAgIGRpbWVuc2lvbnM6IHsgZmlsZXM6IDksIHJhbmtzOiA5IH0sXG4gICAgb3JpZW50YXRpb246ICdzZW50ZScsXG4gICAgdHVybkNvbG9yOiAnc2VudGUnLFxuICAgIGFjdGl2ZUNvbG9yOiAnYm90aCcsXG4gICAgdmlld09ubHk6IGZhbHNlLFxuICAgIHNxdWFyZVJhdGlvOiBbMTEsIDEyXSxcbiAgICBkaXNhYmxlQ29udGV4dE1lbnU6IHRydWUsXG4gICAgYmxvY2tUb3VjaFNjcm9sbDogZmFsc2UsXG4gICAgc2NhbGVEb3duUGllY2VzOiB0cnVlLFxuICAgIGNvb3JkaW5hdGVzOiB7IGVuYWJsZWQ6IHRydWUsIGZpbGVzOiAnbnVtZXJpYycsIHJhbmtzOiAnbnVtZXJpYycgfSxcbiAgICBoaWdobGlnaHQ6IHsgbGFzdERlc3RzOiB0cnVlLCBjaGVjazogdHJ1ZSwgY2hlY2tSb2xlczogWydraW5nJ10sIGhvdmVyZWQ6IGZhbHNlIH0sXG4gICAgYW5pbWF0aW9uOiB7IGVuYWJsZWQ6IHRydWUsIGhhbmRzOiB0cnVlLCBkdXJhdGlvbjogMjUwIH0sXG4gICAgaGFuZHM6IHtcbiAgICAgIGlubGluZWQ6IGZhbHNlLFxuICAgICAgaGFuZE1hcDogbmV3IE1hcDxzZy5Db2xvciwgc2cuSGFuZD4oW1xuICAgICAgICBbJ3NlbnRlJywgbmV3IE1hcCgpXSxcbiAgICAgICAgWydnb3RlJywgbmV3IE1hcCgpXSxcbiAgICAgIF0pLFxuICAgICAgcm9sZXM6IFsncm9vaycsICdiaXNob3AnLCAnZ29sZCcsICdzaWx2ZXInLCAna25pZ2h0JywgJ2xhbmNlJywgJ3Bhd24nXSxcbiAgICB9LFxuICAgIG1vdmFibGU6IHsgZnJlZTogdHJ1ZSwgc2hvd0Rlc3RzOiB0cnVlLCBldmVudHM6IHt9IH0sXG4gICAgZHJvcHBhYmxlOiB7IGZyZWU6IHRydWUsIHNob3dEZXN0czogdHJ1ZSwgc3BhcmU6IGZhbHNlLCBldmVudHM6IHt9IH0sXG4gICAgcHJlbW92YWJsZTogeyBlbmFibGVkOiB0cnVlLCBzaG93RGVzdHM6IHRydWUsIGV2ZW50czoge30gfSxcbiAgICBwcmVkcm9wcGFibGU6IHsgZW5hYmxlZDogdHJ1ZSwgc2hvd0Rlc3RzOiB0cnVlLCBldmVudHM6IHt9IH0sXG4gICAgZHJhZ2dhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgZGlzdGFuY2U6IDMsXG4gICAgICBhdXRvRGlzdGFuY2U6IHRydWUsXG4gICAgICBzaG93R2hvc3Q6IHRydWUsXG4gICAgICBzaG93VG91Y2hTcXVhcmVPdmVybGF5OiB0cnVlLFxuICAgICAgZGVsZXRlT25Ecm9wT2ZmOiBmYWxzZSxcbiAgICAgIGFkZFRvSGFuZE9uRHJvcE9mZjogZmFsc2UsXG4gICAgfSxcbiAgICBzZWxlY3RhYmxlOiB7IGVuYWJsZWQ6IHRydWUsIGZvcmNlU3BhcmVzOiBmYWxzZSwgZGVsZXRlT25Ub3VjaDogZmFsc2UsIGFkZFNwYXJlc1RvSGFuZDogZmFsc2UgfSxcbiAgICBrZXlib2FyZDogeyBlbmFibGVkOiBmYWxzZSwgZm9jdXNlZDogZmFsc2UgfSxcbiAgICBwcm9tb3Rpb246IHtcbiAgICAgIG1vdmVQcm9tb3Rpb25EaWFsb2c6ICgpID0+IGZhbHNlLFxuICAgICAgZm9yY2VNb3ZlUHJvbW90aW9uOiAoKSA9PiBmYWxzZSxcbiAgICAgIGRyb3BQcm9tb3Rpb25EaWFsb2c6ICgpID0+IGZhbHNlLFxuICAgICAgZm9yY2VEcm9wUHJvbW90aW9uOiAoKSA9PiBmYWxzZSxcbiAgICAgIHByb21vdGVzVG86ICgpID0+IHVuZGVmaW5lZCxcbiAgICAgIHVucHJvbW90ZXNUbzogKCkgPT4gdW5kZWZpbmVkLFxuICAgICAgZXZlbnRzOiB7fSxcbiAgICAgIHByZXZQcm9tb3Rpb25IYXNoOiAnJyxcbiAgICB9LFxuICAgIGZvcnN5dGg6IHt9LFxuICAgIGV2ZW50czoge30sXG4gICAgZHJhd2FibGU6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsIC8vIGNhbiBkcmF3XG4gICAgICB2aXNpYmxlOiB0cnVlLCAvLyBjYW4gdmlld1xuICAgICAgZm9yY2VkOiBmYWxzZSwgLy8gY2FuIG9ubHkgZHJhd1xuICAgICAgZXJhc2VPbkNsaWNrOiB0cnVlLFxuICAgICAgc2hhcGVzOiBbXSxcbiAgICAgIGF1dG9TaGFwZXM6IFtdLFxuICAgICAgc3F1YXJlczogW10sXG4gICAgICBwcmV2U3ZnSGFzaDogJycsXG4gICAgfSxcbiAgfTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IEFwaSB9IGZyb20gJy4vYXBpLmpzJztcbmltcG9ydCB7IHN0YXJ0IH0gZnJvbSAnLi9hcGkuanMnO1xuaW1wb3J0IHR5cGUgeyBDb25maWcgfSBmcm9tICcuL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBjb25maWd1cmUgfSBmcm9tICcuL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyByZWRyYXdBbGwgfSBmcm9tICcuL2RvbS5qcyc7XG5pbXBvcnQgeyBiaW5kRG9jdW1lbnQgfSBmcm9tICcuL2V2ZW50cy5qcyc7XG5pbXBvcnQgeyByZWRyYXdOb3csIHJlZHJhd1NoYXBlc05vdyB9IGZyb20gJy4vcmVkcmF3LmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB7IGRlZmF1bHRzIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSB7IERPTVJlY3RNYXAsIFBpZWNlTmFtZSwgUGllY2VOb2RlLCBXcmFwRWxlbWVudHMgfSBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIFNob2dpZ3JvdW5kKGNvbmZpZz86IENvbmZpZywgd3JhcEVsZW1lbnRzPzogV3JhcEVsZW1lbnRzKTogQXBpIHtcbiAgY29uc3Qgc3RhdGUgPSBkZWZhdWx0cygpIGFzIFN0YXRlO1xuICBjb25maWd1cmUoc3RhdGUsIGNvbmZpZyB8fCB7fSk7XG5cbiAgY29uc3QgcmVkcmF3U3RhdGVOb3cgPSAoc2tpcFNoYXBlcz86IGJvb2xlYW4pID0+IHtcbiAgICByZWRyYXdOb3coc3RhdGUsIHNraXBTaGFwZXMpO1xuICB9O1xuXG4gIHN0YXRlLmRvbSA9IHtcbiAgICB3cmFwRWxlbWVudHM6IHt9LFxuICAgIGVsZW1lbnRzOiB7fSxcbiAgICBib3VuZHM6IHtcbiAgICAgIGJvYXJkOiB7XG4gICAgICAgIGJvdW5kczogdXRpbC5tZW1vKCgpID0+IHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZD8ucGllY2VzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKSxcbiAgICAgIH0sXG4gICAgICBoYW5kczoge1xuICAgICAgICBib3VuZHM6IHV0aWwubWVtbygoKSA9PiB7XG4gICAgICAgICAgY29uc3QgaGFuZHNSZWN0czogRE9NUmVjdE1hcDwndG9wJyB8ICdib3R0b20nPiA9IG5ldyBNYXAoKTtcbiAgICAgICAgICBjb25zdCBoYW5kRWxzID0gc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzO1xuICAgICAgICAgIGlmIChoYW5kRWxzPy50b3ApIGhhbmRzUmVjdHMuc2V0KCd0b3AnLCBoYW5kRWxzLnRvcC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSk7XG4gICAgICAgICAgaWYgKGhhbmRFbHM/LmJvdHRvbSkgaGFuZHNSZWN0cy5zZXQoJ2JvdHRvbScsIGhhbmRFbHMuYm90dG9tLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKTtcbiAgICAgICAgICByZXR1cm4gaGFuZHNSZWN0cztcbiAgICAgICAgfSksXG4gICAgICAgIHBpZWNlQm91bmRzOiB1dGlsLm1lbW8oKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGhhbmRQaWVjZXNSZWN0czogRE9NUmVjdE1hcDxQaWVjZU5hbWU+ID0gbmV3IE1hcCgpO1xuICAgICAgICAgIGNvbnN0IGhhbmRFbHMgPSBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHM7XG5cbiAgICAgICAgICBpZiAoaGFuZEVscz8udG9wKSB7XG4gICAgICAgICAgICBsZXQgd3JhcEVsID0gaGFuZEVscy50b3AuZmlyc3RFbGVtZW50Q2hpbGQgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICB3aGlsZSAod3JhcEVsKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHBpZWNlRWwgPSB3cmFwRWwuZmlyc3RFbGVtZW50Q2hpbGQgYXMgUGllY2VOb2RlO1xuICAgICAgICAgICAgICBjb25zdCBwaWVjZSA9IHsgcm9sZTogcGllY2VFbC5zZ1JvbGUsIGNvbG9yOiBwaWVjZUVsLnNnQ29sb3IgfTtcbiAgICAgICAgICAgICAgaGFuZFBpZWNlc1JlY3RzLnNldCh1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKSwgcGllY2VFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSk7XG4gICAgICAgICAgICAgIHdyYXBFbCA9IHdyYXBFbC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChoYW5kRWxzPy5ib3R0b20pIHtcbiAgICAgICAgICAgIGxldCB3cmFwRWwgPSBoYW5kRWxzLmJvdHRvbS5maXJzdEVsZW1lbnRDaGlsZCBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHdoaWxlICh3cmFwRWwpIHtcbiAgICAgICAgICAgICAgY29uc3QgcGllY2VFbCA9IHdyYXBFbC5maXJzdEVsZW1lbnRDaGlsZCBhcyBQaWVjZU5vZGU7XG4gICAgICAgICAgICAgIGNvbnN0IHBpZWNlID0geyByb2xlOiBwaWVjZUVsLnNnUm9sZSwgY29sb3I6IHBpZWNlRWwuc2dDb2xvciB9O1xuICAgICAgICAgICAgICBoYW5kUGllY2VzUmVjdHMuc2V0KHV0aWwucGllY2VOYW1lT2YocGllY2UpLCBwaWVjZUVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKTtcbiAgICAgICAgICAgICAgd3JhcEVsID0gd3JhcEVsLm5leHRFbGVtZW50U2libGluZyBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGhhbmRQaWVjZXNSZWN0cztcbiAgICAgICAgfSksXG4gICAgICB9LFxuICAgIH0sXG4gICAgcmVkcmF3Tm93OiByZWRyYXdTdGF0ZU5vdyxcbiAgICByZWRyYXc6IGRlYm91bmNlUmVkcmF3KHJlZHJhd1N0YXRlTm93KSxcbiAgICByZWRyYXdTaGFwZXM6IGRlYm91bmNlUmVkcmF3KCgpID0+IHJlZHJhd1NoYXBlc05vdyhzdGF0ZSkpLFxuICAgIHVuYmluZDogYmluZERvY3VtZW50KHN0YXRlKSxcbiAgICBlbGVtZW50VW5iaW5kczogbmV3IE1hcCgpLFxuICAgIGRlc3Ryb3llZDogZmFsc2UsXG4gIH07XG5cbiAgaWYgKHdyYXBFbGVtZW50cykgcmVkcmF3QWxsKHdyYXBFbGVtZW50cywgc3RhdGUpO1xuXG4gIHJldHVybiBzdGFydChzdGF0ZSk7XG59XG5cbmZ1bmN0aW9uIGRlYm91bmNlUmVkcmF3KGY6ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCk6ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCB7XG4gIGxldCByZWRyYXdpbmcgPSBmYWxzZTtcbiAgcmV0dXJuICguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgIGlmIChyZWRyYXdpbmcpIHJldHVybjtcbiAgICByZWRyYXdpbmcgPSB0cnVlO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICBmKC4uLmFyZ3MpO1xuICAgICAgcmVkcmF3aW5nID0gZmFsc2U7XG4gICAgfSk7XG4gIH07XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNFTyxNQUFNLFNBQVMsQ0FBQyxTQUFTLE1BQU07QUFFL0IsTUFBTSxRQUFRO0FBQUEsSUFDbkI7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQ08sTUFBTSxRQUFRO0FBQUEsSUFDbkI7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBRU8sTUFBTSxVQUEwQixNQUFNLFVBQVU7QUFBQSxJQUNyRCxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sTUFBTSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztBQUFBLEVBQzdDOzs7QUN4Q08sTUFBTSxVQUFVLENBQUMsUUFBd0Is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UUFBUSxPQUFPLHNCQUFzQixDQUFDO0FBQ3BGLG1CQUFPO0FBQUEsVUFDVCxDQUFDO0FBQUEsVUFDRCxhQUFrQixLQUFLLE1BQU07QUFDM0Isa0JBQU0sa0JBQXlDLG9CQUFJLElBQUk7QUFDdkQsa0JBQU0sVUFBVSxNQUFNLElBQUksU0FBUztBQUVuQyxnQkFBSSxtQ0FBUyxLQUFLO0FBQ2hCLGtCQUFJLFNBQVMsUUFBUSxJQUFJO0FBQ3pCLHFCQUFPLFFBQVE7QUFDYixzQkFBTSxVQUFVLE9BQU87QUFDdkIsc0JBQU0sUUFBUSxFQUFFLE1BQU0sUUFBUSxRQUFRLE9BQU8sUUFBUSxRQUFRO0FBQzdELGdDQUFnQixJQUFTLFlBQVksS0FBSyxHQUFHLFFBQVEsc0JBQXNCLENBQUM7QUFDNUUseUJBQVMsT0FBTztBQUFBLGNBQ2xCO0FBQUEsWUFDRjtBQUNBLGdCQUFJLG1DQUFTLFFBQVE7QUFDbkIsa0JBQUksU0FBUyxRQUFRLE9BQU87QUFDNUIscUJBQU8sUUFBUTtBQUNiLHNCQUFNLFVBQVUsT0FBTztBQUN2QixzQkFBTSxRQUFRLEVBQUUsTUFBTSxRQUFRLFFBQVEsT0FBTyxRQUFRLFFBQVE7QUFDN0QsZ0NBQWdCLElBQVMsWUFBWSxLQUFLLEdBQUcsUUFBUSxzQkFBc0IsQ0FBQztBQUM1RSx5QkFBUyxPQUFPO0FBQUEsY0FDbEI7QUFBQSxZQUNGO0FBQ0EsbUJBQU87QUFBQSxVQUNULENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRjtBQUFBLE1BQ0EsV0FBVztBQUFBLE1BQ1gsUUFBUSxlQUFlLGNBQWM7QUFBQSxNQUNyQyxjQUFjLGVBQWUsTUFBTSxnQkFBZ0IsS0FBSyxDQUFDO0FBQUEsTUFDekQsUUFBUSxhQUFhLEtBQUs7QUFBQSxNQUMxQixnQkFBZ0Isb0JBQUksSUFBSTtBQUFBLE1BQ3hCLFdBQVc7QUFBQSxJQUNiO0FBRUEsUUFBSSxhQUFjLFdBQVUsY0FBYyxLQUFLO0FBRS9DLFdBQU9DLE9BQU0sS0FBSztBQUFBLEVBQ3BCO0FBRUEsV0FBUyxlQUFlLEdBQXVEO0FBQzdFLFFBQUksWUFBWTtBQUNoQixXQUFPLElBQUksU0FBZ0I7QUFDekIsVUFBSSxVQUFXO0FBQ2Ysa0JBQVk7QUFDWiw0QkFBc0IsTUFBTTtBQUMxQixVQUFFLEdBQUcsSUFBSTtBQUNULG9CQUFZO0FBQUEsTUFDZCxDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0Y7OztBckJsRkEsTUFBTyxnQkFBUTsiLAogICJuYW1lcyI6IFsibm93IiwgIm1vdmUiLCAicmFua3MiLCAiYnJ1c2hlcyIsICJlbCIsICJkZXN0IiwgInN0YXJ0IiwgImNlbnRlciIsICJjYW5jZWwiLCAibW92ZSIsICJlbmQiLCAidW5zZWxlY3QiLCAicyIsICJjYW5jZWwiLCAiX2EiLCAibW92ZSIsICJlbmQiLCAiY2FuY2VsIiwgInN0YXJ0IiwgInJlbmRlciIsICJhbmltIiwgImsiLCAicmFua3MiLCAiZmlsZXMiLCAicmVuZGVySGFuZCIsICJyZW5kZXIiLCAic3RhcnQiLCAic3RhdGUiLCAiY2FuY2VsIiwgInJlbmRlciIsICJzdGFydCJdCn0K
