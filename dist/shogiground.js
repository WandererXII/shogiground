"use strict";
var Shogiground = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
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
    unselect(state);
    unsetPremove(state);
    unsetPredrop(state);
    cancelPromotion(state);
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
  function baseDrop(state, piece, key, prom) {
    const pieceCount = numberInHand(state, piece);
    if (!pieceCount && !state.droppable.spare) return false;
    const promPiece = prom && promotePiece(state, piece);
    if (key === state.selected || !state.droppable.spare && pieceCount === 1 && state.selectedPiece && samePiece(state.selectedPiece, piece))
      unselect(state);
    state.pieces.set(key, promPiece || piece);
    state.lastDests = [key];
    state.lastPiece = piece;
    state.checks = void 0;
    if (!state.droppable.spare) removeFromHand(state, piece);
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
  function isDraggable(state, piece) {
    return state.draggable.enabled && (state.activeColor === "both" || state.activeColor === piece.color && (state.turnColor === piece.color || state.premovable.enabled));
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
  function renderShapes(state, svg, customSvg, freePieces) {
    const d = state.drawable;
    const curD = d.current;
    const cur = (curD == null ? void 0 : curD.dest) ? curD : void 0;
    const outsideArrow = !!curD && !cur;
    const arrowDests = /* @__PURE__ */ new Map();
    const pieceMap = /* @__PURE__ */ new Map();
    const hashBounds = () => {
      const bounds = state.dom.bounds.board.bounds();
      return bounds && bounds.width.toString() + bounds.height || "";
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
    const fullHash = shapes.map((sc) => sc.hash).join(";") + (outsideArrow ? outsideArrowHash : "");
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
      const brush = key || "primary";
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
      (isPiece(orig) || isPiece(dest)) && boundHash(),
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
      "marker-end": `url(#arrowhead-${brush || "primary"})`,
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
    return brush + (current ? " current" : "") + (outside ? " outside" : "");
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
        const dest = getKeyAtDomPos(cur.pos, sentePov(state.orientation), state.dimensions, bounds) || getHandPieceAtDomPos(cur.pos, state.hands.roles, state.dom.bounds.hands.pieceBounds());
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
  function end(state, _) {
    const cur = state.drawable.current;
    if (cur) {
      addShape(state.drawable, cur);
      cancel(state);
    }
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
      const center = computeSquareCenter(key, asSente, s.dimensions, bounds);
      if (distanceSq(center, pos) <= radiusSq) return true;
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
      callUserFunction(s.events.change);
    } else selectPiece(s, piece, spare);
    const hadPremove = !!s.premovable.current;
    const hadPredrop = !!s.predroppable.current;
    const stillSelected = s.selectedPiece && samePiece(s.selectedPiece, piece);
    if (e.cancelable !== false && (!e.touches || s.blockTouchScroll || s.selectedPiece || previouslySelectedPiece || stillSelected || numberInHand(s, piece) > 0 || position && handPieceCloseTo(s, position)))
      e.preventDefault();
    if (draggedEl && position && s.selectedPiece && stillSelected && isDraggable(s, piece)) {
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
  function processDrag(s) {
    requestAnimationFrame(() => {
      var _a, _b, _c, _d;
      const cur = s.draggable.current;
      const draggedEl = (_a = s.dom.elements.board) == null ? void 0 : _a.dragged;
      const bounds = s.dom.bounds.board.bounds();
      if (!cur || !draggedEl || !bounds) return;
      if (((_b = cur.fromBoard) == null ? void 0 : _b.orig) && ((_c = s.animation.current) == null ? void 0 : _c.plan.anims.has(cur.fromBoard.orig)))
        s.animation.current = void 0;
      const origPiece = cur.fromBoard ? s.pieces.get(cur.fromBoard.orig) : cur.piece;
      if (!origPiece || !samePiece(origPiece, cur.piece)) cancel2(s);
      else {
        if (!cur.started && distanceSq(cur.pos, cur.origPos) >= s.draggable.distance ** 2) {
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
    if (e.type === "touchend" && cur.originTarget !== e.target && !cur.fromOutside) {
      s.draggable.current = void 0;
      if (s.hovered && !s.highlight.hovered) updateHoveredSquares(s, void 0);
      return;
    }
    unsetPremove(s);
    unsetPredrop(s);
    const eventPos = eventPosition(e) || cur.pos;
    const bounds = s.dom.bounds.board.bounds();
    const dest = bounds && getKeyAtDomPos(eventPos, sentePov(s.orientation), s.dimensions, bounds);
    if (dest && cur.started && ((_a = cur.fromBoard) == null ? void 0 : _a.orig) !== dest) {
      if (cur.fromOutside && !promotionDialogDrop(s, cur.piece, dest))
        userDrop(s, cur.piece, dest);
      else if (cur.fromBoard && !promotionDialogMove(s, cur.fromBoard.orig, dest))
        userMove(s, cur.fromBoard.orig, dest);
    } else if (s.draggable.deleteOnDropOff && !dest) {
      if (cur.fromBoard) s.pieces.delete(cur.fromBoard.orig);
      else if (cur.fromOutside && !cur.spare) removeFromHand(s, cur.piece);
      if (s.draggable.addToHandOnDropOff) {
        const handBounds = s.dom.bounds.hands.bounds();
        const handBoundsTop = handBounds.get("top");
        const handBoundsBottom = handBounds.get("bottom");
        if (handBoundsTop && isInsideRect(handBoundsTop, cur.pos))
          addToHand(s, {
            color: opposite(s.orientation),
            role: cur.piece.role
          });
        else if (handBoundsBottom && isInsideRect(handBoundsBottom, cur.pos))
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
    if ("ResizeObserver" in window) new ResizeObserver(onResize(s)).observe(boardEls.board);
    if (s.viewOnly) return;
    const piecesEl = boardEls.pieces;
    const promotionEl = boardEls.promotion;
    const onStart = startDragOrDraw(s);
    piecesEl.addEventListener("touchstart", onStart, {
      passive: false
    });
    piecesEl.addEventListener("mousedown", onStart, {
      passive: false
    });
    if (s.disableContextMenu || s.drawable.enabled)
      piecesEl.addEventListener("contextmenu", (e) => e.preventDefault());
    if (promotionEl) {
      const pieceSelection = (e) => promote(s, e);
      promotionEl.addEventListener("click", pieceSelection);
      if (s.disableContextMenu)
        promotionEl.addEventListener("contextmenu", (e) => e.preventDefault());
    }
  }
  function bindHand(s, handEl) {
    if ("ResizeObserver" in window) new ResizeObserver(onResize(s)).observe(handEl);
    if (s.viewOnly) return;
    const onStart = startDragFromHand(s);
    handEl.addEventListener("mousedown", onStart, { passive: false });
    handEl.addEventListener("touchstart", onStart, {
      passive: false
    });
    handEl.addEventListener("click", () => {
      if (s.promotion.current) {
        cancelPromotion(s);
        s.dom.redraw();
      }
    });
    if (s.disableContextMenu || s.drawable.enabled)
      handEl.addEventListener("contextmenu", (e) => e.preventDefault());
  }
  function bindDocument(s) {
    const unbinds = [];
    if (!("ResizeObserver" in window)) {
      unbinds.push(unbindable(document.body, "shogiground.resize", onResize(s)));
    }
    if (!s.viewOnly) {
      const onmove = dragOrDraw(s, move2, move);
      const onend = dragOrDraw(s, end2, end);
      for (const ev of ["touchmove", "mousemove"])
        unbinds.push(unbindable(document, ev, onmove));
      for (const ev of ["touchend", "mouseup"])
        unbinds.push(unbindable(document, ev, onend));
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
    const cur = s.promotion.current;
    if (target && isPieceNode(target) && cur) {
      const piece = { color: target.sgColor, role: target.sgRole };
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
        }
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
          } else if (el.sgAnimating) {
            el.sgAnimating = false;
            el.classList.remove("anim");
            translateRel(el, posToTranslate(key2pos(k), asSente), scaleDown);
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
  }
  function appendValue(map, key, value) {
    const arr = map.get(key);
    if (arr) arr.push(value);
    else map.set(key, [value]);
  }
  function computeSquareClasses(s) {
    var _a, _b;
    const squares = /* @__PURE__ */ new Map();
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
    const elements = wrapBoard(boardWrap, state);
    if (elements.hands) attachHands(state, elements.hands.top, elements.hands.bottom);
    state.dom.wrapElements.board = boardWrap;
    state.dom.elements.board = elements;
    state.dom.bounds.board.bounds.clear();
    bindBoard(state, elements);
    state.drawable.prevSvgHash = "";
    state.promotion.prevPromotionHash = "";
    render2(state, elements);
  }
  function attachHands(state, handTopWrap, handBottomWrap) {
    if (!state.dom.elements.hands) state.dom.elements.hands = {};
    if (!state.dom.wrapElements.hands) state.dom.wrapElements.hands = {};
    if (handTopWrap) {
      const handTop = wrapHand(handTopWrap, "top", state);
      state.dom.wrapElements.hands.top = handTopWrap;
      state.dom.elements.hands.top = handTop;
      bindHand(state, handTop);
      renderHand(state, handTop);
    }
    if (handBottomWrap) {
      const handBottom = wrapHand(handBottomWrap, "bottom", state);
      state.dom.wrapElements.hands.bottom = handBottomWrap;
      state.dom.elements.hands.bottom = handBottom;
      bindHand(state, handBottom);
      renderHand(state, handBottom);
    }
    if (handTopWrap || handBottomWrap) {
      state.dom.bounds.hands.bounds.clear();
      state.dom.bounds.hands.pieceBounds.clear();
    }
  }
  function redrawAll(wrapElements, state) {
    var _a, _b, _c, _d;
    if (wrapElements.board) attachBoard(state, wrapElements.board);
    if (wrapElements.hands && !state.hands.inlined)
      attachHands(state, wrapElements.hands.top, wrapElements.hands.bottom);
    state.dom.redrawShapes();
    if (state.events.insert)
      state.events.insert(wrapElements.board && state.dom.elements.board, {
        top: ((_a = wrapElements.hands) == null ? void 0 : _a.top) && ((_b = state.dom.elements.hands) == null ? void 0 : _b.top),
        bottom: ((_c = wrapElements.hands) == null ? void 0 : _c.bottom) && ((_d = state.dom.elements.hands) == null ? void 0 : _d.bottom)
      });
  }
  function detachElements(web, state) {
    var _a, _b, _c, _d;
    if (web.board) {
      state.dom.wrapElements.board = void 0;
      state.dom.elements.board = void 0;
      state.dom.bounds.board.bounds.clear();
    }
    if (state.dom.elements.hands && state.dom.wrapElements.hands) {
      if ((_a = web.hands) == null ? void 0 : _a.top) {
        state.dom.wrapElements.hands.top = void 0;
        state.dom.elements.hands.top = void 0;
      }
      if ((_b = web.hands) == null ? void 0 : _b.bottom) {
        state.dom.wrapElements.hands.bottom = void 0;
        state.dom.elements.hands.bottom = void 0;
      }
      if (((_c = web.hands) == null ? void 0 : _c.top) || ((_d = web.hands) == null ? void 0 : _d.bottom)) {
        state.dom.bounds.hands.bounds.clear();
        state.dom.bounds.hands.pieceBounds.clear();
      }
    }
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
      set(config, skipAnimation) {
        var _a, _b, _c, _d;
        function getByPath(path, obj) {
          const properties = path.split(".");
          return properties.reduce((prev, curr) => prev && prev[curr], obj);
        }
        const forceRedrawProps = [
          "orientation",
          "viewOnly",
          "coordinates.enabled",
          "coordinates.notation",
          "drawable.visible",
          "hands.inlined"
        ];
        const newDims = ((_a = config.sfen) == null ? void 0 : _a.board) && inferDimensions(config.sfen.board);
        const toRedraw = forceRedrawProps.some((p) => {
          const cRes = getByPath(p, config);
          return cRes && cRes !== getByPath(p, state);
        }) || !!(newDims && (newDims.files !== state.dimensions.files || newDims.ranks !== state.dimensions.ranks)) || !!((_c = (_b = config.hands) == null ? void 0 : _b.roles) == null ? void 0 : _c.every((r, i) => r === state.hands.roles[i]));
        if (toRedraw) {
          reset(state);
          configure(state, config);
          redrawAll(state.dom.wrapElements, state);
        } else {
          applyAnimation(state, config);
          (((_d = config.sfen) == null ? void 0 : _d.board) && !skipAnimation ? anim : render)(
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
        anim((state2) => {
          state2.droppable.spare = !!spare;
          baseDrop(state2, piece, key, prom || state2.promotion.forceDropPromotion(piece, key));
        }, state);
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
      wrapElements: wrapElements || {},
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2luZGV4LnRzIiwgIi4uL3NyYy9jb25zdGFudHMudHMiLCAiLi4vc3JjL3V0aWwudHMiLCAiLi4vc3JjL2FuaW0udHMiLCAiLi4vc3JjL2hhbmRzLnRzIiwgIi4uL3NyYy9ib2FyZC50cyIsICIuLi9zcmMvc2Zlbi50cyIsICIuLi9zcmMvY29uZmlnLnRzIiwgIi4uL3NyYy9zaGFwZXMudHMiLCAiLi4vc3JjL2RyYXcudHMiLCAiLi4vc3JjL2RyYWcudHMiLCAiLi4vc3JjL2V2ZW50cy50cyIsICIuLi9zcmMvcmVuZGVyLnRzIiwgIi4uL3NyYy9jb29yZHMudHMiLCAiLi4vc3JjL3dyYXAudHMiLCAiLi4vc3JjL2RvbS50cyIsICIuLi9zcmMvYXBpLnRzIiwgIi4uL3NyYy9yZWRyYXcudHMiLCAiLi4vc3JjL3N0YXRlLnRzIiwgIi4uL3NyYy9zaG9naWdyb3VuZC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgU2hvZ2lncm91bmQgfSBmcm9tICcuL3Nob2dpZ3JvdW5kLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgU2hvZ2lncm91bmQ7XG4iLCAiaW1wb3J0IHR5cGUgeyBLZXkgfSBmcm9tICcuL3R5cGVzLmpzJztcblxuZXhwb3J0IGNvbnN0IGNvbG9ycyA9IFsnc2VudGUnLCAnZ290ZSddIGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgZmlsZXMgPSBbXG4gICcxJyxcbiAgJzInLFxuICAnMycsXG4gICc0JyxcbiAgJzUnLFxuICAnNicsXG4gICc3JyxcbiAgJzgnLFxuICAnOScsXG4gICcxMCcsXG4gICcxMScsXG4gICcxMicsXG4gICcxMycsXG4gICcxNCcsXG4gICcxNScsXG4gICcxNicsXG5dIGFzIGNvbnN0O1xuZXhwb3J0IGNvbnN0IHJhbmtzID0gW1xuICAnYScsXG4gICdiJyxcbiAgJ2MnLFxuICAnZCcsXG4gICdlJyxcbiAgJ2YnLFxuICAnZycsXG4gICdoJyxcbiAgJ2knLFxuICAnaicsXG4gICdrJyxcbiAgJ2wnLFxuICAnbScsXG4gICduJyxcbiAgJ28nLFxuICAncCcsXG5dIGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgYWxsS2V5czogcmVhZG9ubHkgS2V5W10gPSBBcnJheS5wcm90b3R5cGUuY29uY2F0KFxuICAuLi5yYW5rcy5tYXAoKHIpID0+IGZpbGVzLm1hcCgoZikgPT4gZiArIHIpKSxcbik7XG5cbmV4cG9ydCBjb25zdCBub3RhdGlvbnMgPSBbJ251bWVyaWMnLCAnamFwYW5lc2UnLCAnZW5naW5lJywgJ2hleCcsICdkaXpoaSddIGFzIGNvbnN0O1xuIiwgImltcG9ydCB7IGFsbEtleXMsIGNvbG9ycyB9IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5cbmV4cG9ydCBjb25zdCBwb3Mya2V5ID0gKHBvczogc2cuUG9zKTogc2cuS2V5ID0+IGFsbEtleXNbcG9zWzBdICsgMTYgKiBwb3NbMV1dO1xuXG5leHBvcnQgY29uc3Qga2V5MnBvcyA9IChrOiBzZy5LZXkpOiBzZy5Qb3MgPT4ge1xuICBpZiAoay5sZW5ndGggPiAyKSByZXR1cm4gW2suY2hhckNvZGVBdCgxKSAtIDM5LCBrLmNoYXJDb2RlQXQoMikgLSA5N107XG4gIGVsc2UgcmV0dXJuIFtrLmNoYXJDb2RlQXQoMCkgLSA0OSwgay5jaGFyQ29kZUF0KDEpIC0gOTddO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIG1lbW88QT4oZjogKCkgPT4gQSk6IHNnLk1lbW88QT4ge1xuICBsZXQgdjogQSB8IHVuZGVmaW5lZDtcbiAgY29uc3QgcmV0ID0gKCk6IEEgPT4ge1xuICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHYgPSBmKCk7XG4gICAgcmV0dXJuIHY7XG4gIH07XG4gIHJldC5jbGVhciA9ICgpID0+IHtcbiAgICB2ID0gdW5kZWZpbmVkO1xuICB9O1xuICByZXR1cm4gcmV0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FsbFVzZXJGdW5jdGlvbjxUIGV4dGVuZHMgKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPihcbiAgZjogVCB8IHVuZGVmaW5lZCxcbiAgLi4uYXJnczogUGFyYW1ldGVyczxUPlxuKTogdm9pZCB7XG4gIGlmIChmKSBzZXRUaW1lb3V0KCgpID0+IGYoLi4uYXJncyksIDEpO1xufVxuXG5leHBvcnQgY29uc3Qgb3Bwb3NpdGUgPSAoYzogc2cuQ29sb3IpOiBzZy5Db2xvciA9PiAoYyA9PT0gJ3NlbnRlJyA/ICdnb3RlJyA6ICdzZW50ZScpO1xuXG5leHBvcnQgY29uc3Qgc2VudGVQb3YgPSAobzogc2cuQ29sb3IpOiBib29sZWFuID0+IG8gPT09ICdzZW50ZSc7XG5cbmV4cG9ydCBjb25zdCBkaXN0YW5jZVNxID0gKHBvczE6IHNnLlBvcywgcG9zMjogc2cuUG9zKTogbnVtYmVyID0+IHtcbiAgY29uc3QgZHggPSBwb3MxWzBdIC0gcG9zMlswXTtcbiAgY29uc3QgZHkgPSBwb3MxWzFdIC0gcG9zMlsxXTtcbiAgcmV0dXJuIGR4ICogZHggKyBkeSAqIGR5O1xufTtcblxuZXhwb3J0IGNvbnN0IHNhbWVQaWVjZSA9IChwMTogc2cuUGllY2UsIHAyOiBzZy5QaWVjZSk6IGJvb2xlYW4gPT5cbiAgcDEucm9sZSA9PT0gcDIucm9sZSAmJiBwMS5jb2xvciA9PT0gcDIuY29sb3I7XG5cbmNvbnN0IHBvc1RvVHJhbnNsYXRlQmFzZSA9IChcbiAgcG9zOiBzZy5Qb3MsXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGFzU2VudGU6IGJvb2xlYW4sXG4gIHhGYWN0b3I6IG51bWJlcixcbiAgeUZhY3RvcjogbnVtYmVyLFxuKTogc2cuTnVtYmVyUGFpciA9PiBbXG4gIChhc1NlbnRlID8gZGltcy5maWxlcyAtIDEgLSBwb3NbMF0gOiBwb3NbMF0pICogeEZhY3RvcixcbiAgKGFzU2VudGUgPyBwb3NbMV0gOiBkaW1zLnJhbmtzIC0gMSAtIHBvc1sxXSkgKiB5RmFjdG9yLFxuXTtcblxuZXhwb3J0IGNvbnN0IHBvc1RvVHJhbnNsYXRlQWJzID0gKFxuICBkaW1zOiBzZy5EaW1lbnNpb25zLFxuICBib3VuZHM6IERPTVJlY3QsXG4pOiAoKHBvczogc2cuUG9zLCBhc1NlbnRlOiBib29sZWFuKSA9PiBzZy5OdW1iZXJQYWlyKSA9PiB7XG4gIGNvbnN0IHhGYWN0b3IgPSBib3VuZHMud2lkdGggLyBkaW1zLmZpbGVzO1xuICBjb25zdCB5RmFjdG9yID0gYm91bmRzLmhlaWdodCAvIGRpbXMucmFua3M7XG4gIHJldHVybiAocG9zLCBhc1NlbnRlKSA9PiBwb3NUb1RyYW5zbGF0ZUJhc2UocG9zLCBkaW1zLCBhc1NlbnRlLCB4RmFjdG9yLCB5RmFjdG9yKTtcbn07XG5cbmV4cG9ydCBjb25zdCBwb3NUb1RyYW5zbGF0ZVJlbCA9XG4gIChkaW1zOiBzZy5EaW1lbnNpb25zKTogKChwb3M6IHNnLlBvcywgYXNTZW50ZTogYm9vbGVhbikgPT4gc2cuTnVtYmVyUGFpcikgPT5cbiAgKHBvcywgYXNTZW50ZSkgPT5cbiAgICBwb3NUb1RyYW5zbGF0ZUJhc2UocG9zLCBkaW1zLCBhc1NlbnRlLCAxMDAsIDEwMCk7XG5cbmV4cG9ydCBjb25zdCB0cmFuc2xhdGVBYnMgPSAoZWw6IEhUTUxFbGVtZW50LCBwb3M6IHNnLk51bWJlclBhaXIsIHNjYWxlOiBudW1iZXIpOiB2b2lkID0+IHtcbiAgZWwuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke3Bvc1swXX1weCwke3Bvc1sxXX1weCkgc2NhbGUoJHtzY2FsZX1gO1xufTtcblxuZXhwb3J0IGNvbnN0IHRyYW5zbGF0ZVJlbCA9IChcbiAgZWw6IEhUTUxFbGVtZW50LFxuICBwZXJjZW50czogc2cuTnVtYmVyUGFpcixcbiAgc2NhbGVGYWN0b3I6IG51bWJlcixcbiAgc2NhbGU/OiBudW1iZXIsXG4pOiB2b2lkID0+IHtcbiAgZWwuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke3BlcmNlbnRzWzBdICogc2NhbGVGYWN0b3J9JSwke3BlcmNlbnRzWzFdICogc2NhbGVGYWN0b3J9JSkgc2NhbGUoJHtcbiAgICBzY2FsZSB8fCBzY2FsZUZhY3RvclxuICB9KWA7XG59O1xuXG5leHBvcnQgY29uc3Qgc2V0RGlzcGxheSA9IChlbDogSFRNTEVsZW1lbnQsIHY6IGJvb2xlYW4pOiB2b2lkID0+IHtcbiAgZWwuc3R5bGUuZGlzcGxheSA9IHYgPyAnJyA6ICdub25lJztcbn07XG5cbmNvbnN0IGlzTW91c2VFdmVudCA9IChlOiBzZy5Nb3VjaEV2ZW50KTogZSBpcyBFdmVudCAmIE1vdXNlRXZlbnQgPT4ge1xuICByZXR1cm4gISFlLmNsaWVudFggfHwgZS5jbGllbnRYID09PSAwO1xufTtcblxuZXhwb3J0IGNvbnN0IGV2ZW50UG9zaXRpb24gPSAoZTogc2cuTW91Y2hFdmVudCk6IHNnLk51bWJlclBhaXIgfCB1bmRlZmluZWQgPT4ge1xuICBpZiAoaXNNb3VzZUV2ZW50KGUpKSByZXR1cm4gW2UuY2xpZW50WCwgZS5jbGllbnRZXTtcbiAgaWYgKGUudGFyZ2V0VG91Y2hlcz8uWzBdKSByZXR1cm4gW2UudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRYLCBlLnRhcmdldFRvdWNoZXNbMF0uY2xpZW50WV07XG4gIHJldHVybjsgLy8gdG91Y2hlbmQgaGFzIG5vIHBvc2l0aW9uIVxufTtcblxuZXhwb3J0IGNvbnN0IGlzUmlnaHRCdXR0b24gPSAoZTogc2cuTW91Y2hFdmVudCk6IGJvb2xlYW4gPT4gZS5idXR0b25zID09PSAyIHx8IGUuYnV0dG9uID09PSAyO1xuXG5leHBvcnQgY29uc3QgaXNNaWRkbGVCdXR0b24gPSAoZTogc2cuTW91Y2hFdmVudCk6IGJvb2xlYW4gPT4gZS5idXR0b25zID09PSA0IHx8IGUuYnV0dG9uID09PSAxO1xuXG5leHBvcnQgY29uc3QgY3JlYXRlRWwgPSAodGFnTmFtZTogc3RyaW5nLCBjbGFzc05hbWU/OiBzdHJpbmcpOiBIVE1MRWxlbWVudCA9PiB7XG4gIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcbiAgaWYgKGNsYXNzTmFtZSkgZWwuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xuICByZXR1cm4gZWw7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gcGllY2VOYW1lT2YocGllY2U6IHNnLlBpZWNlKTogc2cuUGllY2VOYW1lIHtcbiAgcmV0dXJuIGAke3BpZWNlLmNvbG9yfSAke3BpZWNlLnJvbGV9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUGllY2VOYW1lKHBpZWNlTmFtZTogc2cuUGllY2VOYW1lKTogc2cuUGllY2Uge1xuICBjb25zdCBzcGxpdHRlZCA9IHBpZWNlTmFtZS5zcGxpdCgnICcsIDIpO1xuICByZXR1cm4geyBjb2xvcjogc3BsaXR0ZWRbMF0gYXMgc2cuQ29sb3IsIHJvbGU6IHNwbGl0dGVkWzFdIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1BpZWNlTm9kZShlbDogSFRNTEVsZW1lbnQpOiBlbCBpcyBzZy5QaWVjZU5vZGUge1xuICByZXR1cm4gZWwudGFnTmFtZSA9PT0gJ1BJRUNFJztcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc1NxdWFyZU5vZGUoZWw6IEhUTUxFbGVtZW50KTogZWwgaXMgc2cuU3F1YXJlTm9kZSB7XG4gIHJldHVybiBlbC50YWdOYW1lID09PSAnU1EnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZVNxdWFyZUNlbnRlcihcbiAga2V5OiBzZy5LZXksXG4gIGFzU2VudGU6IGJvb2xlYW4sXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGJvdW5kczogRE9NUmVjdCxcbik6IHNnLk51bWJlclBhaXIge1xuICBjb25zdCBwb3MgPSBrZXkycG9zKGtleSk7XG4gIGlmIChhc1NlbnRlKSB7XG4gICAgcG9zWzBdID0gZGltcy5maWxlcyAtIDEgLSBwb3NbMF07XG4gICAgcG9zWzFdID0gZGltcy5yYW5rcyAtIDEgLSBwb3NbMV07XG4gIH1cbiAgcmV0dXJuIFtcbiAgICBib3VuZHMubGVmdCArIChib3VuZHMud2lkdGggKiBwb3NbMF0pIC8gZGltcy5maWxlcyArIGJvdW5kcy53aWR0aCAvIChkaW1zLmZpbGVzICogMiksXG4gICAgYm91bmRzLnRvcCArXG4gICAgICAoYm91bmRzLmhlaWdodCAqIChkaW1zLnJhbmtzIC0gMSAtIHBvc1sxXSkpIC8gZGltcy5yYW5rcyArXG4gICAgICBib3VuZHMuaGVpZ2h0IC8gKGRpbXMucmFua3MgKiAyKSxcbiAgXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRvbVNxdWFyZUluZGV4T2ZLZXkoa2V5OiBzZy5LZXksIGFzU2VudGU6IGJvb2xlYW4sIGRpbXM6IHNnLkRpbWVuc2lvbnMpOiBudW1iZXIge1xuICBjb25zdCBwb3MgPSBrZXkycG9zKGtleSk7XG4gIGxldCBpbmRleCA9IGRpbXMuZmlsZXMgLSAxIC0gcG9zWzBdICsgcG9zWzFdICogZGltcy5maWxlcztcbiAgaWYgKCFhc1NlbnRlKSBpbmRleCA9IGRpbXMuZmlsZXMgKiBkaW1zLnJhbmtzIC0gMSAtIGluZGV4O1xuXG4gIHJldHVybiBpbmRleDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSW5zaWRlUmVjdChyZWN0OiBET01SZWN0LCBwb3M6IHNnLk51bWJlclBhaXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICByZWN0LmxlZnQgPD0gcG9zWzBdICYmXG4gICAgcmVjdC50b3AgPD0gcG9zWzFdICYmXG4gICAgcmVjdC5sZWZ0ICsgcmVjdC53aWR0aCA+IHBvc1swXSAmJlxuICAgIHJlY3QudG9wICsgcmVjdC5oZWlnaHQgPiBwb3NbMV1cbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTmVhclJlY3QocmVjdDogRE9NUmVjdCwgcG9zOiBzZy5OdW1iZXJQYWlyLCByOiBudW1iZXIpOiBib29sZWFuIHtcbiAgY29uc3QgW3gsIHldID0gcG9zO1xuXG4gIGNvbnN0IGNsb3Nlc3RYID0gTWF0aC5tYXgocmVjdC5sZWZ0LCBNYXRoLm1pbih4LCByZWN0LnJpZ2h0KSk7XG4gIGNvbnN0IGNsb3Nlc3RZID0gTWF0aC5tYXgocmVjdC50b3AsIE1hdGgubWluKHksIHJlY3QuYm90dG9tKSk7XG5cbiAgY29uc3QgZHggPSB4IC0gY2xvc2VzdFg7XG4gIGNvbnN0IGR5ID0geSAtIGNsb3Nlc3RZO1xuXG4gIHJldHVybiBkeCAqIGR4ICsgZHkgKiBkeSA8PSByICogcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEtleUF0RG9tUG9zKFxuICBwb3M6IHNnLk51bWJlclBhaXIsXG4gIGFzU2VudGU6IGJvb2xlYW4sXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGJvdW5kczogRE9NUmVjdCxcbik6IHNnLktleSB8IHVuZGVmaW5lZCB7XG4gIGxldCBmaWxlID0gTWF0aC5mbG9vcigoZGltcy5maWxlcyAqIChwb3NbMF0gLSBib3VuZHMubGVmdCkpIC8gYm91bmRzLndpZHRoKTtcbiAgaWYgKGFzU2VudGUpIGZpbGUgPSBkaW1zLmZpbGVzIC0gMSAtIGZpbGU7XG4gIGxldCByYW5rID0gTWF0aC5mbG9vcigoZGltcy5yYW5rcyAqIChwb3NbMV0gLSBib3VuZHMudG9wKSkgLyBib3VuZHMuaGVpZ2h0KTtcbiAgaWYgKCFhc1NlbnRlKSByYW5rID0gZGltcy5yYW5rcyAtIDEgLSByYW5rO1xuICByZXR1cm4gZmlsZSA+PSAwICYmIGZpbGUgPCBkaW1zLmZpbGVzICYmIHJhbmsgPj0gMCAmJiByYW5rIDwgZGltcy5yYW5rc1xuICAgID8gcG9zMmtleShbZmlsZSwgcmFua10pXG4gICAgOiB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRIYW5kUGllY2VBdERvbVBvcyhcbiAgcG9zOiBzZy5OdW1iZXJQYWlyLFxuICByb2xlczogc2cuUm9sZVN0cmluZ1tdLFxuICBib3VuZHM6IE1hcDxzZy5QaWVjZU5hbWUsIERPTVJlY3Q+LFxuKTogc2cuUGllY2UgfCB1bmRlZmluZWQge1xuICBmb3IgKGNvbnN0IGNvbG9yIG9mIGNvbG9ycykge1xuICAgIGZvciAoY29uc3Qgcm9sZSBvZiByb2xlcykge1xuICAgICAgY29uc3QgcGllY2UgPSB7IGNvbG9yLCByb2xlIH07XG4gICAgICBjb25zdCBwaWVjZVJlY3QgPSBib3VuZHMuZ2V0KHBpZWNlTmFtZU9mKHBpZWNlKSk7XG4gICAgICBpZiAocGllY2VSZWN0ICYmIGlzSW5zaWRlUmVjdChwaWVjZVJlY3QsIHBvcykpIHJldHVybiBwaWVjZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcG9zT2ZPdXRzaWRlRWwoXG4gIGxlZnQ6IG51bWJlcixcbiAgdG9wOiBudW1iZXIsXG4gIGFzU2VudGU6IGJvb2xlYW4sXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGJvYXJkQm91bmRzOiBET01SZWN0LFxuKTogc2cuUG9zIHwgdW5kZWZpbmVkIHtcbiAgY29uc3Qgc3FXID0gYm9hcmRCb3VuZHMud2lkdGggLyBkaW1zLmZpbGVzO1xuICBjb25zdCBzcUggPSBib2FyZEJvdW5kcy5oZWlnaHQgLyBkaW1zLnJhbmtzO1xuICBpZiAoIXNxVyB8fCAhc3FIKSByZXR1cm47XG4gIGxldCB4T2ZmID0gKGxlZnQgLSBib2FyZEJvdW5kcy5sZWZ0KSAvIHNxVztcbiAgaWYgKGFzU2VudGUpIHhPZmYgPSBkaW1zLmZpbGVzIC0gMSAtIHhPZmY7XG4gIGxldCB5T2ZmID0gKHRvcCAtIGJvYXJkQm91bmRzLnRvcCkgLyBzcUg7XG4gIGlmICghYXNTZW50ZSkgeU9mZiA9IGRpbXMucmFua3MgLSAxIC0geU9mZjtcbiAgcmV0dXJuIFt4T2ZmLCB5T2ZmXTtcbn1cbiIsICJpbXBvcnQgeyBhbGxLZXlzLCBjb2xvcnMgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwuanMnO1xuXG5leHBvcnQgdHlwZSBNdXRhdGlvbjxBPiA9IChzdGF0ZTogU3RhdGUpID0+IEE7XG5cbi8vIDAsMSBhbmltYXRpb24gZ29hbFxuLy8gMiwzIGFuaW1hdGlvbiBjdXJyZW50IHN0YXR1c1xuZXhwb3J0IHR5cGUgQW5pbVZlY3RvciA9IHNnLk51bWJlclF1YWQ7XG5cbmV4cG9ydCB0eXBlIEFuaW1WZWN0b3JzID0gTWFwPHNnLktleSwgQW5pbVZlY3Rvcj47XG5cbmV4cG9ydCB0eXBlIEFuaW1GYWRpbmdzID0gTWFwPHNnLktleSwgc2cuUGllY2U+O1xuXG5leHBvcnQgdHlwZSBBbmltUHJvbW90aW9ucyA9IE1hcDxzZy5LZXksIHNnLlBpZWNlPjtcblxuZXhwb3J0IGludGVyZmFjZSBBbmltUGxhbiB7XG4gIGFuaW1zOiBBbmltVmVjdG9ycztcbiAgZmFkaW5nczogQW5pbUZhZGluZ3M7XG4gIHByb21vdGlvbnM6IEFuaW1Qcm9tb3Rpb25zO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1DdXJyZW50IHtcbiAgc3RhcnQ6IERPTUhpZ2hSZXNUaW1lU3RhbXA7XG4gIGZyZXF1ZW5jeTogc2cuS0h6O1xuICBwbGFuOiBBbmltUGxhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFuaW08QT4obXV0YXRpb246IE11dGF0aW9uPEE+LCBzdGF0ZTogU3RhdGUpOiBBIHtcbiAgcmV0dXJuIHN0YXRlLmFuaW1hdGlvbi5lbmFibGVkID8gYW5pbWF0ZShtdXRhdGlvbiwgc3RhdGUpIDogcmVuZGVyKG11dGF0aW9uLCBzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXI8QT4obXV0YXRpb246IE11dGF0aW9uPEE+LCBzdGF0ZTogU3RhdGUpOiBBIHtcbiAgY29uc3QgcmVzdWx0ID0gbXV0YXRpb24oc3RhdGUpO1xuICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmludGVyZmFjZSBBbmltUGllY2Uge1xuICBrZXk/OiBzZy5LZXk7XG4gIHBvczogc2cuUG9zO1xuICBwaWVjZTogc2cuUGllY2U7XG59XG5cbnR5cGUgTmV3QW5pbVBpZWNlID0gUmVxdWlyZWQ8QW5pbVBpZWNlPjtcblxuZnVuY3Rpb24gbWFrZVBpZWNlKGtleTogc2cuS2V5LCBwaWVjZTogc2cuUGllY2UpOiBOZXdBbmltUGllY2Uge1xuICByZXR1cm4ge1xuICAgIGtleToga2V5LFxuICAgIHBvczogdXRpbC5rZXkycG9zKGtleSksXG4gICAgcGllY2U6IHBpZWNlLFxuICB9O1xufVxuXG5mdW5jdGlvbiBjbG9zZXIocGllY2U6IEFuaW1QaWVjZSwgcGllY2VzOiBBbmltUGllY2VbXSk6IEFuaW1QaWVjZSB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBwaWVjZXMuc29ydCgocDEsIHAyKSA9PiB7XG4gICAgcmV0dXJuIHV0aWwuZGlzdGFuY2VTcShwaWVjZS5wb3MsIHAxLnBvcykgLSB1dGlsLmRpc3RhbmNlU3EocGllY2UucG9zLCBwMi5wb3MpO1xuICB9KVswXTtcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVBsYW4ocHJldlBpZWNlczogc2cuUGllY2VzLCBwcmV2SGFuZHM6IHNnLkhhbmRzLCBjdXJyZW50OiBTdGF0ZSk6IEFuaW1QbGFuIHtcbiAgY29uc3QgYW5pbXM6IEFuaW1WZWN0b3JzID0gbmV3IE1hcCgpO1xuICBjb25zdCBhbmltZWRPcmlnczogc2cuS2V5W10gPSBbXTtcbiAgY29uc3QgZmFkaW5nczogQW5pbUZhZGluZ3MgPSBuZXcgTWFwKCk7XG4gIGNvbnN0IHByb21vdGlvbnM6IEFuaW1Qcm9tb3Rpb25zID0gbmV3IE1hcCgpO1xuICBjb25zdCBtaXNzaW5nczogQW5pbVBpZWNlW10gPSBbXTtcbiAgY29uc3QgbmV3czogTmV3QW5pbVBpZWNlW10gPSBbXTtcbiAgY29uc3QgcHJlUGllY2VzID0gbmV3IE1hcDxzZy5LZXksIEFuaW1QaWVjZT4oKTtcblxuICBmb3IgKGNvbnN0IFtrLCBwXSBvZiBwcmV2UGllY2VzKSB7XG4gICAgcHJlUGllY2VzLnNldChrLCBtYWtlUGllY2UoaywgcCkpO1xuICB9XG4gIGZvciAoY29uc3Qga2V5IG9mIGFsbEtleXMpIHtcbiAgICBjb25zdCBjdXJQID0gY3VycmVudC5waWVjZXMuZ2V0KGtleSk7XG4gICAgY29uc3QgcHJlUCA9IHByZVBpZWNlcy5nZXQoa2V5KTtcbiAgICBpZiAoY3VyUCkge1xuICAgICAgaWYgKHByZVApIHtcbiAgICAgICAgaWYgKCF1dGlsLnNhbWVQaWVjZShjdXJQLCBwcmVQLnBpZWNlKSkge1xuICAgICAgICAgIG1pc3NpbmdzLnB1c2gocHJlUCk7XG4gICAgICAgICAgbmV3cy5wdXNoKG1ha2VQaWVjZShrZXksIGN1clApKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIG5ld3MucHVzaChtYWtlUGllY2Uoa2V5LCBjdXJQKSk7XG4gICAgfSBlbHNlIGlmIChwcmVQKSBtaXNzaW5ncy5wdXNoKHByZVApO1xuICB9XG4gIGlmIChjdXJyZW50LmFuaW1hdGlvbi5oYW5kcykge1xuICAgIGZvciAoY29uc3QgY29sb3Igb2YgY29sb3JzKSB7XG4gICAgICBjb25zdCBjdXJIID0gY3VycmVudC5oYW5kcy5oYW5kTWFwLmdldChjb2xvcik7XG4gICAgICBjb25zdCBwcmVIID0gcHJldkhhbmRzLmdldChjb2xvcik7XG4gICAgICBpZiAocHJlSCAmJiBjdXJIKSB7XG4gICAgICAgIGZvciAoY29uc3QgW3JvbGUsIG5dIG9mIHByZUgpIHtcbiAgICAgICAgICBjb25zdCBwaWVjZTogc2cuUGllY2UgPSB7IHJvbGUsIGNvbG9yIH07XG4gICAgICAgICAgY29uc3QgY3VyTiA9IGN1ckguZ2V0KHJvbGUpIHx8IDA7XG4gICAgICAgICAgaWYgKGN1ck4gPCBuKSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kUGllY2VPZmZzZXQgPSBjdXJyZW50LmRvbS5ib3VuZHMuaGFuZHNcbiAgICAgICAgICAgICAgLnBpZWNlQm91bmRzKClcbiAgICAgICAgICAgICAgLmdldCh1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKSk7XG4gICAgICAgICAgICBjb25zdCBib3VuZHMgPSBjdXJyZW50LmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gICAgICAgICAgICBjb25zdCBvdXRQb3MgPVxuICAgICAgICAgICAgICBoYW5kUGllY2VPZmZzZXQgJiYgYm91bmRzXG4gICAgICAgICAgICAgICAgPyB1dGlsLnBvc09mT3V0c2lkZUVsKFxuICAgICAgICAgICAgICAgICAgICBoYW5kUGllY2VPZmZzZXQubGVmdCxcbiAgICAgICAgICAgICAgICAgICAgaGFuZFBpZWNlT2Zmc2V0LnRvcCxcbiAgICAgICAgICAgICAgICAgICAgdXRpbC5zZW50ZVBvdihjdXJyZW50Lm9yaWVudGF0aW9uKSxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudC5kaW1lbnNpb25zLFxuICAgICAgICAgICAgICAgICAgICBib3VuZHMsXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAob3V0UG9zKVxuICAgICAgICAgICAgICBtaXNzaW5ncy5wdXNoKHtcbiAgICAgICAgICAgICAgICBwb3M6IG91dFBvcyxcbiAgICAgICAgICAgICAgICBwaWVjZTogcGllY2UsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBmb3IgKGNvbnN0IG5ld1Agb2YgbmV3cykge1xuICAgIGNvbnN0IHByZVAgPSBjbG9zZXIoXG4gICAgICBuZXdQLFxuICAgICAgbWlzc2luZ3MuZmlsdGVyKChwKSA9PiB7XG4gICAgICAgIGlmICh1dGlsLnNhbWVQaWVjZShuZXdQLnBpZWNlLCBwLnBpZWNlKSkgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vIGNoZWNraW5nIHdoZXRoZXIgcHJvbW90ZWQgcGllY2VzIGFyZSB0aGUgc2FtZVxuICAgICAgICBjb25zdCBwUm9sZSA9IGN1cnJlbnQucHJvbW90aW9uLnByb21vdGVzVG8ocC5waWVjZS5yb2xlKTtcbiAgICAgICAgY29uc3QgcFBpZWNlID0gcFJvbGUgJiYgeyBjb2xvcjogcC5waWVjZS5jb2xvciwgcm9sZTogcFJvbGUgfTtcbiAgICAgICAgY29uc3QgblJvbGUgPSBjdXJyZW50LnByb21vdGlvbi5wcm9tb3Rlc1RvKG5ld1AucGllY2Uucm9sZSk7XG4gICAgICAgIGNvbnN0IG5QaWVjZSA9IG5Sb2xlICYmIHsgY29sb3I6IG5ld1AucGllY2UuY29sb3IsIHJvbGU6IG5Sb2xlIH07XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgKCEhcFBpZWNlICYmIHV0aWwuc2FtZVBpZWNlKG5ld1AucGllY2UsIHBQaWVjZSkpIHx8XG4gICAgICAgICAgKCEhblBpZWNlICYmIHV0aWwuc2FtZVBpZWNlKG5QaWVjZSwgcC5waWVjZSkpXG4gICAgICAgICk7XG4gICAgICB9KSxcbiAgICApO1xuICAgIGlmIChwcmVQKSB7XG4gICAgICBjb25zdCB2ZWN0b3IgPSBbcHJlUC5wb3NbMF0gLSBuZXdQLnBvc1swXSwgcHJlUC5wb3NbMV0gLSBuZXdQLnBvc1sxXV07XG4gICAgICBhbmltcy5zZXQobmV3UC5rZXksIHZlY3Rvci5jb25jYXQodmVjdG9yKSBhcyBBbmltVmVjdG9yKTtcbiAgICAgIGlmIChwcmVQLmtleSkgYW5pbWVkT3JpZ3MucHVzaChwcmVQLmtleSk7XG4gICAgICBpZiAoIXV0aWwuc2FtZVBpZWNlKG5ld1AucGllY2UsIHByZVAucGllY2UpICYmIG5ld1Aua2V5KSBwcm9tb3Rpb25zLnNldChuZXdQLmtleSwgcHJlUC5waWVjZSk7XG4gICAgfVxuICB9XG4gIGZvciAoY29uc3QgcCBvZiBtaXNzaW5ncykge1xuICAgIGlmIChwLmtleSAmJiAhYW5pbWVkT3JpZ3MuaW5jbHVkZXMocC5rZXkpKSBmYWRpbmdzLnNldChwLmtleSwgcC5waWVjZSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGFuaW1zOiBhbmltcyxcbiAgICBmYWRpbmdzOiBmYWRpbmdzLFxuICAgIHByb21vdGlvbnM6IHByb21vdGlvbnMsXG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0ZXAoc3RhdGU6IFN0YXRlLCBub3c6IERPTUhpZ2hSZXNUaW1lU3RhbXApOiB2b2lkIHtcbiAgY29uc3QgY3VyID0gc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQ7XG4gIGlmIChjdXIgPT09IHVuZGVmaW5lZCkge1xuICAgIC8vIGFuaW1hdGlvbiB3YXMgY2FuY2VsZWQgOihcbiAgICBpZiAoIXN0YXRlLmRvbS5kZXN0cm95ZWQpIHN0YXRlLmRvbS5yZWRyYXdOb3coKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgcmVzdCA9IDEgLSAobm93IC0gY3VyLnN0YXJ0KSAqIGN1ci5mcmVxdWVuY3k7XG4gIGlmIChyZXN0IDw9IDApIHtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20ucmVkcmF3Tm93KCk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgZWFzZSA9IGVhc2luZyhyZXN0KTtcbiAgICBmb3IgKGNvbnN0IGNmZyBvZiBjdXIucGxhbi5hbmltcy52YWx1ZXMoKSkge1xuICAgICAgY2ZnWzJdID0gY2ZnWzBdICogZWFzZTtcbiAgICAgIGNmZ1szXSA9IGNmZ1sxXSAqIGVhc2U7XG4gICAgfVxuICAgIHN0YXRlLmRvbS5yZWRyYXdOb3codHJ1ZSk7IC8vIG9wdGltaXNhdGlvbjogZG9uJ3QgcmVuZGVyIFNWRyBjaGFuZ2VzIGR1cmluZyBhbmltYXRpb25zXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKChub3cgPSBwZXJmb3JtYW5jZS5ub3coKSkgPT4gc3RlcChzdGF0ZSwgbm93KSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYW5pbWF0ZTxBPihtdXRhdGlvbjogTXV0YXRpb248QT4sIHN0YXRlOiBTdGF0ZSk6IEEge1xuICAvLyBjbG9uZSBzdGF0ZSBiZWZvcmUgbXV0YXRpbmcgaXRcbiAgY29uc3QgcHJldlBpZWNlczogc2cuUGllY2VzID0gbmV3IE1hcChzdGF0ZS5waWVjZXMpO1xuICBjb25zdCBwcmV2SGFuZHM6IHNnLkhhbmRzID0gbmV3IE1hcChbXG4gICAgWydzZW50ZScsIG5ldyBNYXAoc3RhdGUuaGFuZHMuaGFuZE1hcC5nZXQoJ3NlbnRlJykpXSxcbiAgICBbJ2dvdGUnLCBuZXcgTWFwKHN0YXRlLmhhbmRzLmhhbmRNYXAuZ2V0KCdnb3RlJykpXSxcbiAgXSk7XG5cbiAgY29uc3QgcmVzdWx0ID0gbXV0YXRpb24oc3RhdGUpO1xuICBjb25zdCBwbGFuID0gY29tcHV0ZVBsYW4ocHJldlBpZWNlcywgcHJldkhhbmRzLCBzdGF0ZSk7XG4gIGlmIChwbGFuLmFuaW1zLnNpemUgfHwgcGxhbi5mYWRpbmdzLnNpemUpIHtcbiAgICBjb25zdCBhbHJlYWR5UnVubmluZyA9IHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50Py5zdGFydCAhPT0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0ge1xuICAgICAgc3RhcnQ6IHBlcmZvcm1hbmNlLm5vdygpLFxuICAgICAgZnJlcXVlbmN5OiAxIC8gTWF0aC5tYXgoc3RhdGUuYW5pbWF0aW9uLmR1cmF0aW9uLCAxKSxcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgfTtcbiAgICBpZiAoIWFscmVhZHlSdW5uaW5nKSBzdGVwKHN0YXRlLCBwZXJmb3JtYW5jZS5ub3coKSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gZG9uJ3QgYW5pbWF0ZSwganVzdCByZW5kZXIgcmlnaHQgYXdheVxuICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9ncmUvMTY1MDI5NFxuZnVuY3Rpb24gZWFzaW5nKHQ6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiB0IDwgMC41ID8gNCAqIHQgKiB0ICogdCA6ICh0IC0gMSkgKiAoMiAqIHQgLSAyKSAqICgyICogdCAtIDIpICsgMTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IEhlYWRsZXNzU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyBzYW1lUGllY2UgfSBmcm9tICcuL3V0aWwuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gbnVtYmVySW5IYW5kKHM6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSk6IG51bWJlciB7XG4gIHJldHVybiBzLmhhbmRzLmhhbmRNYXAuZ2V0KHBpZWNlLmNvbG9yKT8uZ2V0KHBpZWNlLnJvbGUpIHx8IDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRUb0hhbmQoczogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBjbnQgPSAxKTogdm9pZCB7XG4gIGNvbnN0IGhhbmQgPSBzLmhhbmRzLmhhbmRNYXAuZ2V0KHBpZWNlLmNvbG9yKTtcbiAgY29uc3Qgcm9sZSA9XG4gICAgKHMuaGFuZHMucm9sZXMuaW5jbHVkZXMocGllY2Uucm9sZSkgPyBwaWVjZS5yb2xlIDogcy5wcm9tb3Rpb24udW5wcm9tb3Rlc1RvKHBpZWNlLnJvbGUpKSB8fFxuICAgIHBpZWNlLnJvbGU7XG4gIGlmIChoYW5kICYmIHMuaGFuZHMucm9sZXMuaW5jbHVkZXMocm9sZSkpIGhhbmQuc2V0KHJvbGUsIChoYW5kLmdldChyb2xlKSB8fCAwKSArIGNudCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVGcm9tSGFuZChzOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGNudCA9IDEpOiB2b2lkIHtcbiAgY29uc3QgaGFuZCA9IHMuaGFuZHMuaGFuZE1hcC5nZXQocGllY2UuY29sb3IpO1xuICBjb25zdCByb2xlID1cbiAgICAocy5oYW5kcy5yb2xlcy5pbmNsdWRlcyhwaWVjZS5yb2xlKSA/IHBpZWNlLnJvbGUgOiBzLnByb21vdGlvbi51bnByb21vdGVzVG8ocGllY2Uucm9sZSkpIHx8XG4gICAgcGllY2Uucm9sZTtcbiAgY29uc3QgbnVtID0gaGFuZD8uZ2V0KHJvbGUpO1xuICBpZiAoaGFuZCAmJiBudW0pIGhhbmQuc2V0KHJvbGUsIE1hdGgubWF4KG51bSAtIGNudCwgMCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVySGFuZChzOiBIZWFkbGVzc1N0YXRlLCBoYW5kRWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gIGhhbmRFbC5jbGFzc0xpc3QudG9nZ2xlKCdwcm9tb3Rpb24nLCAhIXMucHJvbW90aW9uLmN1cnJlbnQpO1xuICBsZXQgd3JhcEVsID0gaGFuZEVsLmZpcnN0RWxlbWVudENoaWxkIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICB3aGlsZSAod3JhcEVsKSB7XG4gICAgY29uc3QgcGllY2VFbCA9IHdyYXBFbC5maXJzdEVsZW1lbnRDaGlsZCBhcyBzZy5QaWVjZU5vZGU7XG4gICAgY29uc3QgcGllY2UgPSB7IHJvbGU6IHBpZWNlRWwuc2dSb2xlLCBjb2xvcjogcGllY2VFbC5zZ0NvbG9yIH07XG4gICAgY29uc3QgbnVtID0gbnVtYmVySW5IYW5kKHMsIHBpZWNlKTtcbiAgICBjb25zdCBpc1NlbGVjdGVkID0gISFzLnNlbGVjdGVkUGllY2UgJiYgc2FtZVBpZWNlKHBpZWNlLCBzLnNlbGVjdGVkUGllY2UpICYmICFzLmRyb3BwYWJsZS5zcGFyZTtcblxuICAgIHdyYXBFbC5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgJ3NlbGVjdGVkJyxcbiAgICAgIChzLmFjdGl2ZUNvbG9yID09PSAnYm90aCcgfHwgcy5hY3RpdmVDb2xvciA9PT0gcy50dXJuQ29sb3IpICYmIGlzU2VsZWN0ZWQsXG4gICAgKTtcbiAgICB3cmFwRWwuY2xhc3NMaXN0LnRvZ2dsZShcbiAgICAgICdwcmVzZWxlY3RlZCcsXG4gICAgICBzLmFjdGl2ZUNvbG9yICE9PSAnYm90aCcgJiYgcy5hY3RpdmVDb2xvciAhPT0gcy50dXJuQ29sb3IgJiYgaXNTZWxlY3RlZCxcbiAgICApO1xuICAgIHdyYXBFbC5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgJ2xhc3QtZGVzdCcsXG4gICAgICBzLmhpZ2hsaWdodC5sYXN0RGVzdHMgJiYgISFzLmxhc3RQaWVjZSAmJiBzYW1lUGllY2UocGllY2UsIHMubGFzdFBpZWNlKSxcbiAgICApO1xuICAgIHdyYXBFbC5jbGFzc0xpc3QudG9nZ2xlKCdkcmF3aW5nJywgISFzLmRyYXdhYmxlLnBpZWNlICYmIHNhbWVQaWVjZShzLmRyYXdhYmxlLnBpZWNlLCBwaWVjZSkpO1xuICAgIHdyYXBFbC5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgJ2N1cnJlbnQtcHJlJyxcbiAgICAgICEhcy5wcmVkcm9wcGFibGUuY3VycmVudCAmJiBzYW1lUGllY2Uocy5wcmVkcm9wcGFibGUuY3VycmVudC5waWVjZSwgcGllY2UpLFxuICAgICk7XG4gICAgd3JhcEVsLmRhdGFzZXQubmIgPSBudW0udG9TdHJpbmcoKTtcbiAgICB3cmFwRWwgPSB3cmFwRWwubmV4dEVsZW1lbnRTaWJsaW5nIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgYWRkVG9IYW5kLCBudW1iZXJJbkhhbmQsIHJlbW92ZUZyb21IYW5kIH0gZnJvbSAnLi9oYW5kcy5qcyc7XG5pbXBvcnQgdHlwZSB7IEhlYWRsZXNzU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyBjYWxsVXNlckZ1bmN0aW9uLCBvcHBvc2l0ZSwgcGllY2VOYW1lT2YsIHNhbWVQaWVjZSB9IGZyb20gJy4vdXRpbC5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiB0b2dnbGVPcmllbnRhdGlvbihzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICBzdGF0ZS5vcmllbnRhdGlvbiA9IG9wcG9zaXRlKHN0YXRlLm9yaWVudGF0aW9uKTtcbiAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPVxuICAgIHN0YXRlLmRyYWdnYWJsZS5jdXJyZW50ID1cbiAgICBzdGF0ZS5wcm9tb3Rpb24uY3VycmVudCA9XG4gICAgc3RhdGUuaG92ZXJlZCA9XG4gICAgc3RhdGUuc2VsZWN0ZWQgPVxuICAgIHN0YXRlLnNlbGVjdGVkUGllY2UgPVxuICAgICAgdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzZXQoc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiB2b2lkIHtcbiAgdW5zZWxlY3Qoc3RhdGUpO1xuICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICB1bnNldFByZWRyb3Aoc3RhdGUpO1xuICBjYW5jZWxQcm9tb3Rpb24oc3RhdGUpO1xuICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHN0YXRlLmRyYWdnYWJsZS5jdXJyZW50ID0gc3RhdGUuaG92ZXJlZCA9IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFBpZWNlcyhzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2VzOiBzZy5QaWVjZXNEaWZmKTogdm9pZCB7XG4gIGZvciAoY29uc3QgW2tleSwgcGllY2VdIG9mIHBpZWNlcykge1xuICAgIGlmIChwaWVjZSkgc3RhdGUucGllY2VzLnNldChrZXksIHBpZWNlKTtcbiAgICBlbHNlIHN0YXRlLnBpZWNlcy5kZWxldGUoa2V5KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0Q2hlY2tzKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBjaGVja3NWYWx1ZTogc2cuS2V5W10gfCBzZy5Db2xvciB8IGJvb2xlYW4pOiB2b2lkIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoY2hlY2tzVmFsdWUpKSB7XG4gICAgc3RhdGUuY2hlY2tzID0gY2hlY2tzVmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGNoZWNrc1ZhbHVlID09PSB0cnVlKSBjaGVja3NWYWx1ZSA9IHN0YXRlLnR1cm5Db2xvcjtcbiAgICBpZiAoY2hlY2tzVmFsdWUpIHtcbiAgICAgIGNvbnN0IGNoZWNrczogc2cuS2V5W10gPSBbXTtcbiAgICAgIGZvciAoY29uc3QgW2ssIHBdIG9mIHN0YXRlLnBpZWNlcykge1xuICAgICAgICBpZiAoc3RhdGUuaGlnaGxpZ2h0LmNoZWNrUm9sZXMuaW5jbHVkZXMocC5yb2xlKSAmJiBwLmNvbG9yID09PSBjaGVja3NWYWx1ZSkgY2hlY2tzLnB1c2goayk7XG4gICAgICB9XG4gICAgICBzdGF0ZS5jaGVja3MgPSBjaGVja3M7XG4gICAgfSBlbHNlIHN0YXRlLmNoZWNrcyA9IHVuZGVmaW5lZDtcbiAgfVxufVxuXG5mdW5jdGlvbiBzZXRQcmVtb3ZlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSwgcHJvbTogYm9vbGVhbik6IHZvaWQge1xuICB1bnNldFByZWRyb3Aoc3RhdGUpO1xuICBzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQgPSB7IG9yaWcsIGRlc3QsIHByb20gfTtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcmVtb3ZhYmxlLmV2ZW50cy5zZXQsIG9yaWcsIGRlc3QsIHByb20pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5zZXRQcmVtb3ZlKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQpIHtcbiAgICBzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcmVtb3ZhYmxlLmV2ZW50cy51bnNldCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0UHJlZHJvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSwgcHJvbTogYm9vbGVhbik6IHZvaWQge1xuICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICBzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCA9IHsgcGllY2UsIGtleSwgcHJvbSB9O1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByZWRyb3BwYWJsZS5ldmVudHMuc2V0LCBwaWVjZSwga2V5LCBwcm9tKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuc2V0UHJlZHJvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICBpZiAoc3RhdGUucHJlZHJvcHBhYmxlLmN1cnJlbnQpIHtcbiAgICBzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByZWRyb3BwYWJsZS5ldmVudHMudW5zZXQpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYXNlTW92ZShcbiAgc3RhdGU6IEhlYWRsZXNzU3RhdGUsXG4gIG9yaWc6IHNnLktleSxcbiAgZGVzdDogc2cuS2V5LFxuICBwcm9tOiBib29sZWFuLFxuKTogc2cuUGllY2UgfCBib29sZWFuIHtcbiAgY29uc3Qgb3JpZ1BpZWNlID0gc3RhdGUucGllY2VzLmdldChvcmlnKTtcbiAgY29uc3QgZGVzdFBpZWNlID0gc3RhdGUucGllY2VzLmdldChkZXN0KTtcbiAgaWYgKG9yaWcgPT09IGRlc3QgfHwgIW9yaWdQaWVjZSkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBjYXB0dXJlZCA9IGRlc3RQaWVjZSAmJiBkZXN0UGllY2UuY29sb3IgIT09IG9yaWdQaWVjZS5jb2xvciA/IGRlc3RQaWVjZSA6IHVuZGVmaW5lZDtcbiAgY29uc3QgcHJvbVBpZWNlID0gcHJvbSAmJiBwcm9tb3RlUGllY2Uoc3RhdGUsIG9yaWdQaWVjZSk7XG4gIGlmIChkZXN0ID09PSBzdGF0ZS5zZWxlY3RlZCB8fCBvcmlnID09PSBzdGF0ZS5zZWxlY3RlZCkgdW5zZWxlY3Qoc3RhdGUpO1xuICBzdGF0ZS5waWVjZXMuc2V0KGRlc3QsIHByb21QaWVjZSB8fCBvcmlnUGllY2UpO1xuICBzdGF0ZS5waWVjZXMuZGVsZXRlKG9yaWcpO1xuICBzdGF0ZS5sYXN0RGVzdHMgPSBbb3JpZywgZGVzdF07XG4gIHN0YXRlLmxhc3RQaWVjZSA9IHVuZGVmaW5lZDtcbiAgc3RhdGUuY2hlY2tzID0gdW5kZWZpbmVkO1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5tb3ZlLCBvcmlnLCBkZXN0LCBwcm9tLCBjYXB0dXJlZCk7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG4gIHJldHVybiBjYXB0dXJlZCB8fCB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFzZURyb3AoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBwaWVjZTogc2cuUGllY2UsXG4gIGtleTogc2cuS2V5LFxuICBwcm9tOiBib29sZWFuLFxuKTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlQ291bnQgPSBudW1iZXJJbkhhbmQoc3RhdGUsIHBpZWNlKTtcbiAgaWYgKCFwaWVjZUNvdW50ICYmICFzdGF0ZS5kcm9wcGFibGUuc3BhcmUpIHJldHVybiBmYWxzZTtcbiAgY29uc3QgcHJvbVBpZWNlID0gcHJvbSAmJiBwcm9tb3RlUGllY2Uoc3RhdGUsIHBpZWNlKTtcbiAgaWYgKFxuICAgIGtleSA9PT0gc3RhdGUuc2VsZWN0ZWQgfHxcbiAgICAoIXN0YXRlLmRyb3BwYWJsZS5zcGFyZSAmJlxuICAgICAgcGllY2VDb3VudCA9PT0gMSAmJlxuICAgICAgc3RhdGUuc2VsZWN0ZWRQaWVjZSAmJlxuICAgICAgc2FtZVBpZWNlKHN0YXRlLnNlbGVjdGVkUGllY2UsIHBpZWNlKSlcbiAgKVxuICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgc3RhdGUucGllY2VzLnNldChrZXksIHByb21QaWVjZSB8fCBwaWVjZSk7XG4gIHN0YXRlLmxhc3REZXN0cyA9IFtrZXldO1xuICBzdGF0ZS5sYXN0UGllY2UgPSBwaWVjZTtcbiAgc3RhdGUuY2hlY2tzID0gdW5kZWZpbmVkO1xuICBpZiAoIXN0YXRlLmRyb3BwYWJsZS5zcGFyZSkgcmVtb3ZlRnJvbUhhbmQoc3RhdGUsIHBpZWNlKTtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuZHJvcCwgcGllY2UsIGtleSwgcHJvbSk7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBiYXNlVXNlck1vdmUoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBvcmlnOiBzZy5LZXksXG4gIGRlc3Q6IHNnLktleSxcbiAgcHJvbTogYm9vbGVhbixcbik6IHNnLlBpZWNlIHwgYm9vbGVhbiB7XG4gIGNvbnN0IHJlc3VsdCA9IGJhc2VNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0LCBwcm9tKTtcbiAgaWYgKHJlc3VsdCkge1xuICAgIHN0YXRlLm1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZHJvcHBhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLnR1cm5Db2xvciA9IG9wcG9zaXRlKHN0YXRlLnR1cm5Db2xvcik7XG4gICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gYmFzZVVzZXJEcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tOiBib29sZWFuKTogYm9vbGVhbiB7XG4gIGNvbnN0IHJlc3VsdCA9IGJhc2VEcm9wKHN0YXRlLCBwaWVjZSwga2V5LCBwcm9tKTtcbiAgaWYgKHJlc3VsdCkge1xuICAgIHN0YXRlLm1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZHJvcHBhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLnR1cm5Db2xvciA9IG9wcG9zaXRlKHN0YXRlLnR1cm5Db2xvcik7XG4gICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZXJEcm9wKFxuICBzdGF0ZTogSGVhZGxlc3NTdGF0ZSxcbiAgcGllY2U6IHNnLlBpZWNlLFxuICBrZXk6IHNnLktleSxcbiAgcHJvbT86IGJvb2xlYW4sXG4pOiBib29sZWFuIHtcbiAgY29uc3QgcmVhbFByb20gPSBwcm9tIHx8IHN0YXRlLnByb21vdGlvbi5mb3JjZURyb3BQcm9tb3Rpb24ocGllY2UsIGtleSk7XG4gIGlmIChjYW5Ecm9wKHN0YXRlLCBwaWVjZSwga2V5KSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGJhc2VVc2VyRHJvcChzdGF0ZSwgcGllY2UsIGtleSwgcmVhbFByb20pO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZHJvcHBhYmxlLmV2ZW50cy5hZnRlciwgcGllY2UsIGtleSwgcmVhbFByb20sIHsgcHJlbWFkZTogZmFsc2UgfSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoY2FuUHJlZHJvcChzdGF0ZSwgcGllY2UsIGtleSkpIHtcbiAgICBzZXRQcmVkcm9wKHN0YXRlLCBwaWVjZSwga2V5LCByZWFsUHJvbSk7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlck1vdmUoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBvcmlnOiBzZy5LZXksXG4gIGRlc3Q6IHNnLktleSxcbiAgcHJvbT86IGJvb2xlYW4sXG4pOiBib29sZWFuIHtcbiAgY29uc3QgcmVhbFByb20gPSBwcm9tIHx8IHN0YXRlLnByb21vdGlvbi5mb3JjZU1vdmVQcm9tb3Rpb24ob3JpZywgZGVzdCk7XG4gIGlmIChjYW5Nb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGJhc2VVc2VyTW92ZShzdGF0ZSwgb3JpZywgZGVzdCwgcmVhbFByb20pO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgICAgIGNvbnN0IG1ldGFkYXRhOiBzZy5Nb3ZlTWV0YWRhdGEgPSB7IHByZW1hZGU6IGZhbHNlIH07XG4gICAgICBpZiAocmVzdWx0ICE9PSB0cnVlKSBtZXRhZGF0YS5jYXB0dXJlZCA9IHJlc3VsdDtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUubW92YWJsZS5ldmVudHMuYWZ0ZXIsIG9yaWcsIGRlc3QsIHJlYWxQcm9tLCBtZXRhZGF0YSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoY2FuUHJlbW92ZShzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICBzZXRQcmVtb3ZlKHN0YXRlLCBvcmlnLCBkZXN0LCByZWFsUHJvbSk7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFzZVByb21vdGlvbkRpYWxvZyhzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwcm9tb3RlZFBpZWNlID0gcHJvbW90ZVBpZWNlKHN0YXRlLCBwaWVjZSk7XG4gIGlmIChzdGF0ZS52aWV3T25seSB8fCBzdGF0ZS5wcm9tb3Rpb24uY3VycmVudCB8fCAhcHJvbW90ZWRQaWVjZSkgcmV0dXJuIGZhbHNlO1xuXG4gIHN0YXRlLnByb21vdGlvbi5jdXJyZW50ID0geyBwaWVjZSwgcHJvbW90ZWRQaWVjZSwga2V5LCBkcmFnZ2VkOiAhIXN0YXRlLmRyYWdnYWJsZS5jdXJyZW50IH07XG4gIHN0YXRlLmhvdmVyZWQgPSBrZXk7XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9tb3Rpb25EaWFsb2dEcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5KTogYm9vbGVhbiB7XG4gIGlmIChcbiAgICBjYW5Ecm9wUHJvbW90ZShzdGF0ZSwgcGllY2UsIGtleSkgJiZcbiAgICAoY2FuRHJvcChzdGF0ZSwgcGllY2UsIGtleSkgfHwgY2FuUHJlZHJvcChzdGF0ZSwgcGllY2UsIGtleSkpXG4gICkge1xuICAgIGlmIChiYXNlUHJvbW90aW9uRGlhbG9nKHN0YXRlLCBwaWVjZSwga2V5KSkge1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcm9tb3Rpb24uZXZlbnRzLmluaXRpYXRlZCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvbW90aW9uRGlhbG9nTW92ZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgb3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgaWYgKFxuICAgIGNhbk1vdmVQcm9tb3RlKHN0YXRlLCBvcmlnLCBkZXN0KSAmJlxuICAgIChjYW5Nb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSB8fCBjYW5QcmVtb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSlcbiAgKSB7XG4gICAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXMuZ2V0KG9yaWcpO1xuICAgIGlmIChwaWVjZSAmJiBiYXNlUHJvbW90aW9uRGlhbG9nKHN0YXRlLCBwaWVjZSwgZGVzdCkpIHtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJvbW90aW9uLmV2ZW50cy5pbml0aWF0ZWQpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gcHJvbW90ZVBpZWNlKHM6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSk6IHNnLlBpZWNlIHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgcHJvbVJvbGUgPSBzLnByb21vdGlvbi5wcm9tb3Rlc1RvKHBpZWNlLnJvbGUpO1xuICByZXR1cm4gcHJvbVJvbGUgIT09IHVuZGVmaW5lZCA/IHsgY29sb3I6IHBpZWNlLmNvbG9yLCByb2xlOiBwcm9tUm9sZSB9IDogdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVsZXRlUGllY2Uoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIGtleTogc2cuS2V5KTogdm9pZCB7XG4gIGlmIChzdGF0ZS5waWVjZXMuZGVsZXRlKGtleSkpIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RTcXVhcmUoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBrZXk6IHNnLktleSxcbiAgcHJvbT86IGJvb2xlYW4sXG4gIGZvcmNlPzogYm9vbGVhbixcbik6IHZvaWQge1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5zZWxlY3QsIGtleSk7XG5cbiAgLy8gdW5zZWxlY3QgaWYgc2VsZWN0aW5nIHNlbGVjdGVkIGtleSwga2VlcCBzZWxlY3RlZCBmb3IgZHJhZ1xuICBpZiAoIXN0YXRlLmRyYWdnYWJsZS5lbmFibGVkICYmIHN0YXRlLnNlbGVjdGVkID09PSBrZXkpIHtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy51bnNlbGVjdCwga2V5KTtcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gdHJ5IG1vdmluZy9kcm9wcGluZ1xuICBpZiAoXG4gICAgc3RhdGUuc2VsZWN0YWJsZS5lbmFibGVkIHx8XG4gICAgZm9yY2UgfHxcbiAgICAoc3RhdGUuc2VsZWN0YWJsZS5mb3JjZVNwYXJlcyAmJiBzdGF0ZS5zZWxlY3RlZFBpZWNlICYmIHN0YXRlLmRyb3BwYWJsZS5zcGFyZSlcbiAgKSB7XG4gICAgaWYgKHN0YXRlLnNlbGVjdGVkUGllY2UgJiYgdXNlckRyb3Aoc3RhdGUsIHN0YXRlLnNlbGVjdGVkUGllY2UsIGtleSwgcHJvbSkpIHJldHVybjtcbiAgICBlbHNlIGlmIChzdGF0ZS5zZWxlY3RlZCAmJiB1c2VyTW92ZShzdGF0ZSwgc3RhdGUuc2VsZWN0ZWQsIGtleSwgcHJvbSkpIHJldHVybjtcbiAgfVxuXG4gIGlmIChcbiAgICAoc3RhdGUuc2VsZWN0YWJsZS5lbmFibGVkIHx8IHN0YXRlLmRyYWdnYWJsZS5lbmFibGVkIHx8IGZvcmNlKSAmJlxuICAgIChpc01vdmFibGUoc3RhdGUsIGtleSkgfHwgaXNQcmVtb3ZhYmxlKHN0YXRlLCBrZXkpKVxuICApIHtcbiAgICBzZXRTZWxlY3RlZChzdGF0ZSwga2V5KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0UGllY2UoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBwaWVjZTogc2cuUGllY2UsXG4gIHNwYXJlPzogYm9vbGVhbixcbiAgZm9yY2U/OiBib29sZWFuLFxuICBhcGk/OiBib29sZWFuLFxuKTogdm9pZCB7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLnBpZWNlU2VsZWN0LCBwaWVjZSk7XG5cbiAgaWYgKHN0YXRlLnNlbGVjdGFibGUuYWRkU3BhcmVzVG9IYW5kICYmIHN0YXRlLmRyb3BwYWJsZS5zcGFyZSAmJiBzdGF0ZS5zZWxlY3RlZFBpZWNlKSB7XG4gICAgYWRkVG9IYW5kKHN0YXRlLCB7IHJvbGU6IHN0YXRlLnNlbGVjdGVkUGllY2Uucm9sZSwgY29sb3I6IHBpZWNlLmNvbG9yIH0pO1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICB9IGVsc2UgaWYgKFxuICAgICFhcGkgJiZcbiAgICAhc3RhdGUuZHJhZ2dhYmxlLmVuYWJsZWQgJiZcbiAgICBzdGF0ZS5zZWxlY3RlZFBpZWNlICYmXG4gICAgc2FtZVBpZWNlKHN0YXRlLnNlbGVjdGVkUGllY2UsIHBpZWNlKVxuICApIHtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5waWVjZVVuc2VsZWN0LCBwaWVjZSk7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICB9IGVsc2UgaWYgKFxuICAgIChzdGF0ZS5zZWxlY3RhYmxlLmVuYWJsZWQgfHwgc3RhdGUuZHJhZ2dhYmxlLmVuYWJsZWQgfHwgZm9yY2UpICYmXG4gICAgKGlzRHJvcHBhYmxlKHN0YXRlLCBwaWVjZSwgISFzcGFyZSkgfHwgaXNQcmVkcm9wcGFibGUoc3RhdGUsIHBpZWNlKSlcbiAgKSB7XG4gICAgc2V0U2VsZWN0ZWRQaWVjZShzdGF0ZSwgcGllY2UpO1xuICAgIHN0YXRlLmRyb3BwYWJsZS5zcGFyZSA9ICEhc3BhcmU7XG4gIH0gZWxzZSB7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRTZWxlY3RlZChzdGF0ZTogSGVhZGxlc3NTdGF0ZSwga2V5OiBzZy5LZXkpOiB2b2lkIHtcbiAgdW5zZWxlY3Qoc3RhdGUpO1xuICBzdGF0ZS5zZWxlY3RlZCA9IGtleTtcbiAgc2V0UHJlRGVzdHMoc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0U2VsZWN0ZWRQaWVjZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlKTogdm9pZCB7XG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgc3RhdGUuc2VsZWN0ZWRQaWVjZSA9IHBpZWNlO1xuICBzZXRQcmVEZXN0cyhzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRQcmVEZXN0cyhzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICBzdGF0ZS5wcmVtb3ZhYmxlLmRlc3RzID0gc3RhdGUucHJlZHJvcHBhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuXG4gIGlmIChzdGF0ZS5zZWxlY3RlZCAmJiBpc1ByZW1vdmFibGUoc3RhdGUsIHN0YXRlLnNlbGVjdGVkKSAmJiBzdGF0ZS5wcmVtb3ZhYmxlLmdlbmVyYXRlKVxuICAgIHN0YXRlLnByZW1vdmFibGUuZGVzdHMgPSBzdGF0ZS5wcmVtb3ZhYmxlLmdlbmVyYXRlKHN0YXRlLnNlbGVjdGVkLCBzdGF0ZS5waWVjZXMpO1xuICBlbHNlIGlmIChcbiAgICBzdGF0ZS5zZWxlY3RlZFBpZWNlICYmXG4gICAgaXNQcmVkcm9wcGFibGUoc3RhdGUsIHN0YXRlLnNlbGVjdGVkUGllY2UpICYmXG4gICAgc3RhdGUucHJlZHJvcHBhYmxlLmdlbmVyYXRlXG4gIClcbiAgICBzdGF0ZS5wcmVkcm9wcGFibGUuZGVzdHMgPSBzdGF0ZS5wcmVkcm9wcGFibGUuZ2VuZXJhdGUoc3RhdGUuc2VsZWN0ZWRQaWVjZSwgc3RhdGUucGllY2VzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuc2VsZWN0KHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIHN0YXRlLnNlbGVjdGVkID1cbiAgICBzdGF0ZS5zZWxlY3RlZFBpZWNlID1cbiAgICBzdGF0ZS5wcmVtb3ZhYmxlLmRlc3RzID1cbiAgICBzdGF0ZS5wcmVkcm9wcGFibGUuZGVzdHMgPVxuICAgIHN0YXRlLnByb21vdGlvbi5jdXJyZW50ID1cbiAgICAgIHVuZGVmaW5lZDtcbiAgc3RhdGUuZHJvcHBhYmxlLnNwYXJlID0gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGlzTW92YWJsZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgb3JpZzogc2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzLmdldChvcmlnKTtcbiAgcmV0dXJuIChcbiAgICAhIXBpZWNlICYmXG4gICAgKHN0YXRlLmFjdGl2ZUNvbG9yID09PSAnYm90aCcgfHxcbiAgICAgIChzdGF0ZS5hY3RpdmVDb2xvciA9PT0gcGllY2UuY29sb3IgJiYgc3RhdGUudHVybkNvbG9yID09PSBwaWVjZS5jb2xvcikpXG4gICk7XG59XG5cbmZ1bmN0aW9uIGlzRHJvcHBhYmxlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIHNwYXJlOiBib29sZWFuKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgKHNwYXJlIHx8IG51bWJlckluSGFuZChzdGF0ZSwgcGllY2UpID4gMCkgJiZcbiAgICAoc3RhdGUuYWN0aXZlQ29sb3IgPT09ICdib3RoJyB8fFxuICAgICAgKHN0YXRlLmFjdGl2ZUNvbG9yID09PSBwaWVjZS5jb2xvciAmJiBzdGF0ZS50dXJuQ29sb3IgPT09IHBpZWNlLmNvbG9yKSlcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbk1vdmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgb3JpZyAhPT0gZGVzdCAmJlxuICAgIGlzTW92YWJsZShzdGF0ZSwgb3JpZykgJiZcbiAgICAoc3RhdGUubW92YWJsZS5mcmVlIHx8ICEhc3RhdGUubW92YWJsZS5kZXN0cz8uZ2V0KG9yaWcpPy5pbmNsdWRlcyhkZXN0KSlcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbkRyb3Aoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwgZGVzdDogc2cuS2V5KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgaXNEcm9wcGFibGUoc3RhdGUsIHBpZWNlLCBzdGF0ZS5kcm9wcGFibGUuc3BhcmUpICYmXG4gICAgKHN0YXRlLmRyb3BwYWJsZS5mcmVlIHx8XG4gICAgICBzdGF0ZS5kcm9wcGFibGUuc3BhcmUgfHxcbiAgICAgICEhc3RhdGUuZHJvcHBhYmxlLmRlc3RzPy5nZXQocGllY2VOYW1lT2YocGllY2UpKT8uaW5jbHVkZXMoZGVzdCkpXG4gICk7XG59XG5cbmZ1bmN0aW9uIGNhbk1vdmVQcm9tb3RlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQob3JpZyk7XG4gIHJldHVybiAhIXBpZWNlICYmIHN0YXRlLnByb21vdGlvbi5tb3ZlUHJvbW90aW9uRGlhbG9nKG9yaWcsIGRlc3QpO1xufVxuXG5mdW5jdGlvbiBjYW5Ecm9wUHJvbW90ZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSk6IGJvb2xlYW4ge1xuICByZXR1cm4gIXN0YXRlLmRyb3BwYWJsZS5zcGFyZSAmJiBzdGF0ZS5wcm9tb3Rpb24uZHJvcFByb21vdGlvbkRpYWxvZyhwaWVjZSwga2V5KTtcbn1cblxuZnVuY3Rpb24gaXNQcmVtb3ZhYmxlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBvcmlnOiBzZy5LZXkpOiBib29sZWFuIHtcbiAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXMuZ2V0KG9yaWcpO1xuICByZXR1cm4gKFxuICAgICEhcGllY2UgJiZcbiAgICBzdGF0ZS5wcmVtb3ZhYmxlLmVuYWJsZWQgJiZcbiAgICBzdGF0ZS5hY3RpdmVDb2xvciA9PT0gcGllY2UuY29sb3IgJiZcbiAgICBzdGF0ZS50dXJuQ29sb3IgIT09IHBpZWNlLmNvbG9yXG4gICk7XG59XG5cbmZ1bmN0aW9uIGlzUHJlZHJvcHBhYmxlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBudW1iZXJJbkhhbmQoc3RhdGUsIHBpZWNlKSA+IDAgJiZcbiAgICBzdGF0ZS5wcmVkcm9wcGFibGUuZW5hYmxlZCAmJlxuICAgIHN0YXRlLmFjdGl2ZUNvbG9yID09PSBwaWVjZS5jb2xvciAmJlxuICAgIHN0YXRlLnR1cm5Db2xvciAhPT0gcGllY2UuY29sb3JcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhblByZW1vdmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgb3JpZyAhPT0gZGVzdCAmJlxuICAgIGlzUHJlbW92YWJsZShzdGF0ZSwgb3JpZykgJiZcbiAgICAhIXN0YXRlLnByZW1vdmFibGUuZ2VuZXJhdGUgJiZcbiAgICBzdGF0ZS5wcmVtb3ZhYmxlLmdlbmVyYXRlKG9yaWcsIHN0YXRlLnBpZWNlcykuaW5jbHVkZXMoZGVzdClcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhblByZWRyb3Aoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwgZGVzdDogc2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IGRlc3RQaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQoZGVzdCk7XG4gIHJldHVybiAoXG4gICAgaXNQcmVkcm9wcGFibGUoc3RhdGUsIHBpZWNlKSAmJlxuICAgICghZGVzdFBpZWNlIHx8IGRlc3RQaWVjZS5jb2xvciAhPT0gc3RhdGUuYWN0aXZlQ29sb3IpICYmXG4gICAgISFzdGF0ZS5wcmVkcm9wcGFibGUuZ2VuZXJhdGUgJiZcbiAgICBzdGF0ZS5wcmVkcm9wcGFibGUuZ2VuZXJhdGUocGllY2UsIHN0YXRlLnBpZWNlcykuaW5jbHVkZXMoZGVzdClcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRHJhZ2dhYmxlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBzdGF0ZS5kcmFnZ2FibGUuZW5hYmxlZCAmJlxuICAgIChzdGF0ZS5hY3RpdmVDb2xvciA9PT0gJ2JvdGgnIHx8XG4gICAgICAoc3RhdGUuYWN0aXZlQ29sb3IgPT09IHBpZWNlLmNvbG9yICYmXG4gICAgICAgIChzdGF0ZS50dXJuQ29sb3IgPT09IHBpZWNlLmNvbG9yIHx8IHN0YXRlLnByZW1vdmFibGUuZW5hYmxlZCkpKVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGxheVByZW1vdmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiBib29sZWFuIHtcbiAgY29uc3QgbW92ZSA9IHN0YXRlLnByZW1vdmFibGUuY3VycmVudDtcbiAgaWYgKCFtb3ZlKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IG9yaWcgPSBtb3ZlLm9yaWc7XG4gIGNvbnN0IGRlc3QgPSBtb3ZlLmRlc3Q7XG4gIGNvbnN0IHByb20gPSBtb3ZlLnByb207XG4gIGxldCBzdWNjZXNzID0gZmFsc2U7XG4gIGlmIChjYW5Nb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGJhc2VVc2VyTW92ZShzdGF0ZSwgb3JpZywgZGVzdCwgcHJvbSk7XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgY29uc3QgbWV0YWRhdGE6IHNnLk1vdmVNZXRhZGF0YSA9IHsgcHJlbWFkZTogdHJ1ZSB9O1xuICAgICAgaWYgKHJlc3VsdCAhPT0gdHJ1ZSkgbWV0YWRhdGEuY2FwdHVyZWQgPSByZXN1bHQ7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLm1vdmFibGUuZXZlbnRzLmFmdGVyLCBvcmlnLCBkZXN0LCBwcm9tLCBtZXRhZGF0YSk7XG4gICAgICBzdWNjZXNzID0gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgdW5zZXRQcmVtb3ZlKHN0YXRlKTtcbiAgcmV0dXJuIHN1Y2Nlc3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwbGF5UHJlZHJvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IGJvb2xlYW4ge1xuICBjb25zdCBkcm9wID0gc3RhdGUucHJlZHJvcHBhYmxlLmN1cnJlbnQ7XG4gIGlmICghZHJvcCkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBwaWVjZSA9IGRyb3AucGllY2U7XG4gIGNvbnN0IGtleSA9IGRyb3Aua2V5O1xuICBjb25zdCBwcm9tID0gZHJvcC5wcm9tO1xuICBsZXQgc3VjY2VzcyA9IGZhbHNlO1xuICBpZiAoY2FuRHJvcChzdGF0ZSwgcGllY2UsIGtleSkpIHtcbiAgICBpZiAoYmFzZVVzZXJEcm9wKHN0YXRlLCBwaWVjZSwga2V5LCBwcm9tKSkge1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5kcm9wcGFibGUuZXZlbnRzLmFmdGVyLCBwaWVjZSwga2V5LCBwcm9tLCB7IHByZW1hZGU6IHRydWUgfSk7XG4gICAgICBzdWNjZXNzID0gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbiAgcmV0dXJuIHN1Y2Nlc3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWxNb3ZlT3JEcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIHVuc2VsZWN0KHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbmNlbFByb21vdGlvbihzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICBpZiAoIXN0YXRlLnByb21vdGlvbi5jdXJyZW50KSByZXR1cm47XG5cbiAgdW5zZWxlY3Qoc3RhdGUpO1xuICBzdGF0ZS5wcm9tb3Rpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgc3RhdGUuaG92ZXJlZCA9IHVuZGVmaW5lZDtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcm9tb3Rpb24uZXZlbnRzLmNhbmNlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdG9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIHN0YXRlLmFjdGl2ZUNvbG9yID1cbiAgICBzdGF0ZS5tb3ZhYmxlLmRlc3RzID1cbiAgICBzdGF0ZS5kcm9wcGFibGUuZGVzdHMgPVxuICAgIHN0YXRlLmRyYWdnYWJsZS5jdXJyZW50ID1cbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9XG4gICAgc3RhdGUucHJvbW90aW9uLmN1cnJlbnQgPVxuICAgIHN0YXRlLmhvdmVyZWQgPVxuICAgICAgdW5kZWZpbmVkO1xuICBjYW5jZWxNb3ZlT3JEcm9wKHN0YXRlKTtcbn1cbiIsICJpbXBvcnQgeyBmaWxlcywgcmFua3MgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgcG9zMmtleSB9IGZyb20gJy4vdXRpbC5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmZlckRpbWVuc2lvbnMoYm9hcmRTZmVuOiBzZy5Cb2FyZFNmZW4pOiBzZy5EaW1lbnNpb25zIHtcbiAgY29uc3QgcmFua3MgPSBib2FyZFNmZW4uc3BsaXQoJy8nKTtcbiAgY29uc3QgZmlyc3RGaWxlID0gcmFua3NbMF0uc3BsaXQoJycpO1xuICBsZXQgZmlsZXNDbnQgPSAwO1xuICBsZXQgY250ID0gMDtcbiAgZm9yIChjb25zdCBjIG9mIGZpcnN0RmlsZSkge1xuICAgIGNvbnN0IG5iID0gYy5jaGFyQ29kZUF0KDApO1xuICAgIGlmIChuYiA8IDU4ICYmIG5iID4gNDcpIGNudCA9IGNudCAqIDEwICsgbmIgLSA0ODtcbiAgICBlbHNlIGlmIChjICE9PSAnKycpIHtcbiAgICAgIGZpbGVzQ250ICs9IGNudCArIDE7XG4gICAgICBjbnQgPSAwO1xuICAgIH1cbiAgfVxuICBmaWxlc0NudCArPSBjbnQ7XG4gIHJldHVybiB7IGZpbGVzOiBmaWxlc0NudCwgcmFua3M6IHJhbmtzLmxlbmd0aCB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2ZlblRvQm9hcmQoXG4gIHNmZW46IHNnLkJvYXJkU2ZlbixcbiAgZGltczogc2cuRGltZW5zaW9ucyxcbiAgZnJvbUZvcnN5dGg/OiAoZm9yc3l0aDogc3RyaW5nKSA9PiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkLFxuKTogc2cuUGllY2VzIHtcbiAgY29uc3Qgc2ZlblBhcnNlciA9IGZyb21Gb3JzeXRoIHx8IHN0YW5kYXJkRnJvbUZvcnN5dGg7XG4gIGNvbnN0IHBpZWNlczogc2cuUGllY2VzID0gbmV3IE1hcCgpO1xuICBsZXQgeCA9IGRpbXMuZmlsZXMgLSAxO1xuICBsZXQgeSA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2Zlbi5sZW5ndGg7IGkrKykge1xuICAgIHN3aXRjaCAoc2ZlbltpXSkge1xuICAgICAgY2FzZSAnICc6XG4gICAgICBjYXNlICdfJzpcbiAgICAgICAgcmV0dXJuIHBpZWNlcztcbiAgICAgIGNhc2UgJy8nOlxuICAgICAgICArK3k7XG4gICAgICAgIGlmICh5ID4gZGltcy5yYW5rcyAtIDEpIHJldHVybiBwaWVjZXM7XG4gICAgICAgIHggPSBkaW1zLmZpbGVzIC0gMTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIGNvbnN0IG5iMSA9IHNmZW5baV0uY2hhckNvZGVBdCgwKTtcbiAgICAgICAgY29uc3QgbmIyID0gc2ZlbltpICsgMV0gJiYgc2ZlbltpICsgMV0uY2hhckNvZGVBdCgwKTtcbiAgICAgICAgaWYgKG5iMSA8IDU4ICYmIG5iMSA+IDQ3KSB7XG4gICAgICAgICAgaWYgKG5iMiAmJiBuYjIgPCA1OCAmJiBuYjIgPiA0Nykge1xuICAgICAgICAgICAgeCAtPSAobmIxIC0gNDgpICogMTAgKyAobmIyIC0gNDgpO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgIH0gZWxzZSB4IC09IG5iMSAtIDQ4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHJvbGVTdHIgPSBzZmVuW2ldID09PSAnKycgJiYgc2Zlbi5sZW5ndGggPiBpICsgMSA/IGArJHtzZmVuWysraV19YCA6IHNmZW5baV07XG4gICAgICAgICAgY29uc3Qgcm9sZSA9IHNmZW5QYXJzZXIocm9sZVN0cik7XG4gICAgICAgICAgaWYgKHggPj0gMCAmJiByb2xlKSB7XG4gICAgICAgICAgICBjb25zdCBjb2xvciA9IHJvbGVTdHIgPT09IHJvbGVTdHIudG9Mb3dlckNhc2UoKSA/ICdnb3RlJyA6ICdzZW50ZSc7XG4gICAgICAgICAgICBwaWVjZXMuc2V0KHBvczJrZXkoW3gsIHldKSwge1xuICAgICAgICAgICAgICByb2xlOiByb2xlLFxuICAgICAgICAgICAgICBjb2xvcjogY29sb3IsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLS14O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBwaWVjZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBib2FyZFRvU2ZlbihcbiAgcGllY2VzOiBzZy5QaWVjZXMsXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIHRvRm9yc3l0aD86IChyb2xlOiBzZy5Sb2xlU3RyaW5nKSA9PiBzdHJpbmcgfCB1bmRlZmluZWQsXG4pOiBzZy5Cb2FyZFNmZW4ge1xuICBjb25zdCBzZmVuUmVuZGVyZXIgPSB0b0ZvcnN5dGggfHwgc3RhbmRhcmRUb0ZvcnN5dGg7XG4gIGNvbnN0IHJldmVyc2VkRmlsZXMgPSBmaWxlcy5zbGljZSgwLCBkaW1zLmZpbGVzKS5yZXZlcnNlKCk7XG4gIHJldHVybiByYW5rc1xuICAgIC5zbGljZSgwLCBkaW1zLnJhbmtzKVxuICAgIC5tYXAoKHkpID0+XG4gICAgICByZXZlcnNlZEZpbGVzXG4gICAgICAgIC5tYXAoKHgpID0+IHtcbiAgICAgICAgICBjb25zdCBwaWVjZSA9IHBpZWNlcy5nZXQoKHggKyB5KSBhcyBzZy5LZXkpO1xuICAgICAgICAgIGNvbnN0IGZvcnN5dGggPSBwaWVjZSAmJiBzZmVuUmVuZGVyZXIocGllY2Uucm9sZSk7XG4gICAgICAgICAgaWYgKGZvcnN5dGgpIHtcbiAgICAgICAgICAgIHJldHVybiBwaWVjZS5jb2xvciA9PT0gJ3NlbnRlJyA/IGZvcnN5dGgudG9VcHBlckNhc2UoKSA6IGZvcnN5dGgudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICB9IGVsc2UgcmV0dXJuICcxJztcbiAgICAgICAgfSlcbiAgICAgICAgLmpvaW4oJycpLFxuICAgIClcbiAgICAuam9pbignLycpXG4gICAgLnJlcGxhY2UoLzF7Mix9L2csIChzKSA9PiBzLmxlbmd0aC50b1N0cmluZygpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNmZW5Ub0hhbmRzKFxuICBzZmVuOiBzZy5IYW5kc1NmZW4sXG4gIGZyb21Gb3JzeXRoPzogKGZvcnN5dGg6IHN0cmluZykgPT4gc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZCxcbik6IHNnLkhhbmRzIHtcbiAgY29uc3Qgc2ZlblBhcnNlciA9IGZyb21Gb3JzeXRoIHx8IHN0YW5kYXJkRnJvbUZvcnN5dGg7XG4gIGNvbnN0IHNlbnRlOiBzZy5IYW5kID0gbmV3IE1hcCgpO1xuICBjb25zdCBnb3RlOiBzZy5IYW5kID0gbmV3IE1hcCgpO1xuXG4gIGxldCB0bXBOdW0gPSAwO1xuICBsZXQgbnVtID0gMTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgbmIgPSBzZmVuW2ldLmNoYXJDb2RlQXQoMCk7XG4gICAgaWYgKG5iIDwgNTggJiYgbmIgPiA0Nykge1xuICAgICAgdG1wTnVtID0gdG1wTnVtICogMTAgKyBuYiAtIDQ4O1xuICAgICAgbnVtID0gdG1wTnVtO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCByb2xlU3RyID0gc2ZlbltpXSA9PT0gJysnICYmIHNmZW4ubGVuZ3RoID4gaSArIDEgPyBgKyR7c2ZlblsrK2ldfWAgOiBzZmVuW2ldO1xuICAgICAgY29uc3Qgcm9sZSA9IHNmZW5QYXJzZXIocm9sZVN0cik7XG4gICAgICBpZiAocm9sZSkge1xuICAgICAgICBjb25zdCBjb2xvciA9IHJvbGVTdHIgPT09IHJvbGVTdHIudG9Mb3dlckNhc2UoKSA/ICdnb3RlJyA6ICdzZW50ZSc7XG4gICAgICAgIGlmIChjb2xvciA9PT0gJ3NlbnRlJykgc2VudGUuc2V0KHJvbGUsIChzZW50ZS5nZXQocm9sZSkgfHwgMCkgKyBudW0pO1xuICAgICAgICBlbHNlIGdvdGUuc2V0KHJvbGUsIChnb3RlLmdldChyb2xlKSB8fCAwKSArIG51bSk7XG4gICAgICB9XG4gICAgICB0bXBOdW0gPSAwO1xuICAgICAgbnVtID0gMTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IE1hcChbXG4gICAgWydzZW50ZScsIHNlbnRlXSxcbiAgICBbJ2dvdGUnLCBnb3RlXSxcbiAgXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYW5kc1RvU2ZlbihcbiAgaGFuZHM6IHNnLkhhbmRzLFxuICByb2xlczogc2cuUm9sZVN0cmluZ1tdLFxuICB0b0ZvcnN5dGg/OiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc3RyaW5nIHwgdW5kZWZpbmVkLFxuKTogc2cuSGFuZHNTZmVuIHtcbiAgY29uc3Qgc2ZlblJlbmRlcmVyID0gdG9Gb3JzeXRoIHx8IHN0YW5kYXJkVG9Gb3JzeXRoO1xuXG4gIGxldCBzZW50ZUhhbmRTdHIgPSAnJztcbiAgbGV0IGdvdGVIYW5kU3RyID0gJyc7XG4gIGZvciAoY29uc3Qgcm9sZSBvZiByb2xlcykge1xuICAgIGNvbnN0IGZvcnN5dGggPSBzZmVuUmVuZGVyZXIocm9sZSk7XG4gICAgaWYgKGZvcnN5dGgpIHtcbiAgICAgIGNvbnN0IHNlbnRlQ250ID0gaGFuZHMuZ2V0KCdzZW50ZScpPy5nZXQocm9sZSk7XG4gICAgICBjb25zdCBnb3RlQ250ID0gaGFuZHMuZ2V0KCdnb3RlJyk/LmdldChyb2xlKTtcbiAgICAgIGlmIChzZW50ZUNudCkgc2VudGVIYW5kU3RyICs9IHNlbnRlQ250ID4gMSA/IHNlbnRlQ250LnRvU3RyaW5nKCkgKyBmb3JzeXRoIDogZm9yc3l0aDtcbiAgICAgIGlmIChnb3RlQ250KSBnb3RlSGFuZFN0ciArPSBnb3RlQ250ID4gMSA/IGdvdGVDbnQudG9TdHJpbmcoKSArIGZvcnN5dGggOiBmb3JzeXRoO1xuICAgIH1cbiAgfVxuICBpZiAoc2VudGVIYW5kU3RyIHx8IGdvdGVIYW5kU3RyKSByZXR1cm4gc2VudGVIYW5kU3RyLnRvVXBwZXJDYXNlKCkgKyBnb3RlSGFuZFN0ci50b0xvd2VyQ2FzZSgpO1xuICBlbHNlIHJldHVybiAnLSc7XG59XG5cbmZ1bmN0aW9uIHN0YW5kYXJkRnJvbUZvcnN5dGgoZm9yc3l0aDogc3RyaW5nKTogc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIHN3aXRjaCAoZm9yc3l0aC50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAncCc6XG4gICAgICByZXR1cm4gJ3Bhd24nO1xuICAgIGNhc2UgJ2wnOlxuICAgICAgcmV0dXJuICdsYW5jZSc7XG4gICAgY2FzZSAnbic6XG4gICAgICByZXR1cm4gJ2tuaWdodCc7XG4gICAgY2FzZSAncyc6XG4gICAgICByZXR1cm4gJ3NpbHZlcic7XG4gICAgY2FzZSAnZyc6XG4gICAgICByZXR1cm4gJ2dvbGQnO1xuICAgIGNhc2UgJ2InOlxuICAgICAgcmV0dXJuICdiaXNob3AnO1xuICAgIGNhc2UgJ3InOlxuICAgICAgcmV0dXJuICdyb29rJztcbiAgICBjYXNlICcrcCc6XG4gICAgICByZXR1cm4gJ3Rva2luJztcbiAgICBjYXNlICcrbCc6XG4gICAgICByZXR1cm4gJ3Byb21vdGVkbGFuY2UnO1xuICAgIGNhc2UgJytuJzpcbiAgICAgIHJldHVybiAncHJvbW90ZWRrbmlnaHQnO1xuICAgIGNhc2UgJytzJzpcbiAgICAgIHJldHVybiAncHJvbW90ZWRzaWx2ZXInO1xuICAgIGNhc2UgJytiJzpcbiAgICAgIHJldHVybiAnaG9yc2UnO1xuICAgIGNhc2UgJytyJzpcbiAgICAgIHJldHVybiAnZHJhZ29uJztcbiAgICBjYXNlICdrJzpcbiAgICAgIHJldHVybiAna2luZyc7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybjtcbiAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIHN0YW5kYXJkVG9Gb3JzeXRoKHJvbGU6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIHN3aXRjaCAocm9sZSkge1xuICAgIGNhc2UgJ3Bhd24nOlxuICAgICAgcmV0dXJuICdwJztcbiAgICBjYXNlICdsYW5jZSc6XG4gICAgICByZXR1cm4gJ2wnO1xuICAgIGNhc2UgJ2tuaWdodCc6XG4gICAgICByZXR1cm4gJ24nO1xuICAgIGNhc2UgJ3NpbHZlcic6XG4gICAgICByZXR1cm4gJ3MnO1xuICAgIGNhc2UgJ2dvbGQnOlxuICAgICAgcmV0dXJuICdnJztcbiAgICBjYXNlICdiaXNob3AnOlxuICAgICAgcmV0dXJuICdiJztcbiAgICBjYXNlICdyb29rJzpcbiAgICAgIHJldHVybiAncic7XG4gICAgY2FzZSAndG9raW4nOlxuICAgICAgcmV0dXJuICcrcCc7XG4gICAgY2FzZSAncHJvbW90ZWRsYW5jZSc6XG4gICAgICByZXR1cm4gJytsJztcbiAgICBjYXNlICdwcm9tb3RlZGtuaWdodCc6XG4gICAgICByZXR1cm4gJytuJztcbiAgICBjYXNlICdwcm9tb3RlZHNpbHZlcic6XG4gICAgICByZXR1cm4gJytzJztcbiAgICBjYXNlICdob3JzZSc6XG4gICAgICByZXR1cm4gJytiJztcbiAgICBjYXNlICdkcmFnb24nOlxuICAgICAgcmV0dXJuICcrcic7XG4gICAgY2FzZSAna2luZyc6XG4gICAgICByZXR1cm4gJ2snO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm47XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBzZXRDaGVja3MsIHNldFByZURlc3RzIH0gZnJvbSAnLi9ib2FyZC5qcyc7XG5pbXBvcnQgdHlwZSB7IERyYXdTaGFwZSwgU3F1YXJlSGlnaGxpZ2h0IH0gZnJvbSAnLi9kcmF3LmpzJztcbmltcG9ydCB7IGluZmVyRGltZW5zaW9ucywgc2ZlblRvQm9hcmQsIHNmZW5Ub0hhbmRzIH0gZnJvbSAnLi9zZmVuLmpzJztcbmltcG9ydCB0eXBlIHsgSGVhZGxlc3NTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBDb25maWcge1xuICBzZmVuPzoge1xuICAgIGJvYXJkPzogc2cuQm9hcmRTZmVuOyAvLyBwaWVjZXMgb24gdGhlIGJvYXJkIGluIEZvcnN5dGggbm90YXRpb25cbiAgICBoYW5kcz86IHNnLkhhbmRzU2ZlbjsgLy8gcGllY2VzIGluIGhhbmQgaW4gRm9yc3l0aCBub3RhdGlvblxuICB9O1xuICBvcmllbnRhdGlvbj86IHNnLkNvbG9yOyAvLyBib2FyZCBvcmllbnRhdGlvbi4gc2VudGUgfCBnb3RlXG4gIHR1cm5Db2xvcj86IHNnLkNvbG9yOyAvLyB0dXJuIHRvIHBsYXkuIHNlbnRlIHwgZ290ZVxuICBhY3RpdmVDb2xvcj86IHNnLkNvbG9yIHwgJ2JvdGgnOyAvLyBjb2xvciB0aGF0IGNhbiBtb3ZlIG9yIGRyb3AuIHNlbnRlIHwgZ290ZSB8IGJvdGggfCB1bmRlZmluZWRcbiAgY2hlY2tzPzogc2cuS2V5W10gfCBzZy5Db2xvciB8IGJvb2xlYW47IC8vIHNxdWFyZXMgY3VycmVudGx5IGluIGNoZWNrIFtcIjVhXCJdLCBjb2xvciBpbiBjaGVjayAoc2VlIGhpZ2hsaWdodC5jaGVja1JvbGVzKSBvciBib29sZWFuIGZvciBjdXJyZW50IHR1cm4gY29sb3JcbiAgbGFzdERlc3RzPzogc2cuS2V5W107IC8vIHNxdWFyZXMgcGFydCBvZiB0aGUgbGFzdCBtb3ZlIG9yIGRyb3AgW1wiM2NcIiwgXCI0Y1wiXVxuICBsYXN0UGllY2U/OiBzZy5QaWVjZTsgLy8gcGllY2UgcGFydCBvZiB0aGUgbGFzdCBkcm9wXG4gIHNlbGVjdGVkPzogc2cuS2V5OyAvLyBzcXVhcmUgY3VycmVudGx5IHNlbGVjdGVkIFwiMWFcIlxuICBzZWxlY3RlZFBpZWNlPzogc2cuUGllY2U7IC8vIHBpZWNlIGluIGhhbmQgY3VycmVudGx5IHNlbGVjdGVkXG4gIGhvdmVyZWQ/OiBzZy5LZXk7IC8vIHNxdWFyZSBjdXJyZW50bHkgYmVpbmcgaG92ZXJlZFxuICB2aWV3T25seT86IGJvb2xlYW47IC8vIGRvbid0IGJpbmQgZXZlbnRzOiB0aGUgdXNlciB3aWxsIG5ldmVyIGJlIGFibGUgdG8gbW92ZSBwaWVjZXMgYXJvdW5kXG4gIHNxdWFyZVJhdGlvPzogc2cuTnVtYmVyUGFpcjsgLy8gcmF0aW8gb2YgYSBzaW5nbGUgc3F1YXJlIFt3aWR0aCwgaGVpZ2h0XVxuICBkaXNhYmxlQ29udGV4dE1lbnU/OiBib29sZWFuOyAvLyBiZWNhdXNlIHdobyBuZWVkcyBhIGNvbnRleHQgbWVudSBvbiBhIGJvYXJkLCBvbmx5IHdpdGhvdXQgdmlld09ubHlcbiAgYmxvY2tUb3VjaFNjcm9sbD86IGJvb2xlYW47IC8vIGJsb2NrIHNjcm9sbGluZyB2aWEgdG91Y2ggZHJhZ2dpbmcgb24gdGhlIGJvYXJkLCBlLmcuIGZvciBjb29yZGluYXRlIHRyYWluaW5nXG4gIHNjYWxlRG93blBpZWNlcz86IGJvb2xlYW47IC8vIGhlbHBmdWwgZm9yIHBuZ3MgLSBodHRwczovL2N0aWRkLmNvbS8yMDE1L3N2Zy1iYWNrZ3JvdW5kLXNjYWxpbmdcbiAgY29vcmRpbmF0ZXM/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGluY2x1ZGUgY29vcmRzIGF0dHJpYnV0ZXNcbiAgICBmaWxlcz86IHNnLk5vdGF0aW9uO1xuICAgIHJhbmtzPzogc2cuTm90YXRpb247XG4gIH07XG4gIGhpZ2hsaWdodD86IHtcbiAgICBsYXN0RGVzdHM/OiBib29sZWFuOyAvLyBhZGQgbGFzdC1kZXN0IGNsYXNzIHRvIHNxdWFyZXMgYW5kIHBpZWNlc1xuICAgIGNoZWNrPzogYm9vbGVhbjsgLy8gYWRkIGNoZWNrIGNsYXNzIHRvIHNxdWFyZXNcbiAgICBjaGVja1JvbGVzPzogc2cuUm9sZVN0cmluZ1tdOyAvLyByb2xlcyB0byBiZSBoaWdobGlnaHRlZCB3aGVuIGNoZWNrIGlzIGJvb2xlYW4gaXMgcGFzc2VkIGZyb20gY29uZmlnXG4gICAgaG92ZXJlZD86IGJvb2xlYW47IC8vIGFkZCBob3ZlciBjbGFzcyB0byBob3ZlcmVkIHNxdWFyZXNcbiAgfTtcbiAgYW5pbWF0aW9uPzogeyBlbmFibGVkPzogYm9vbGVhbjsgaGFuZHM/OiBib29sZWFuOyBkdXJhdGlvbj86IG51bWJlciB9O1xuICBoYW5kcz86IHtcbiAgICBpbmxpbmVkPzogYm9vbGVhbjsgLy8gYXR0YWNoZXMgc2ctaGFuZHMgZGlyZWN0bHkgdG8gc2ctd3JhcCwgaWdub3JlcyBIVE1MRWxlbWVudHMgcGFzc2VkIHRvIFNob2dpZ3JvdW5kXG4gICAgcm9sZXM/OiBzZy5Sb2xlU3RyaW5nW107IC8vIHJvbGVzIHRvIHJlbmRlciBpbiBzZy1oYW5kXG4gIH07XG4gIG1vdmFibGU/OiB7XG4gICAgZnJlZT86IGJvb2xlYW47IC8vIGFsbCBtb3ZlcyBhcmUgdmFsaWQgLSBib2FyZCBlZGl0b3JcbiAgICBkZXN0cz86IHNnLk1vdmVEZXN0czsgLy8gdmFsaWQgbW92ZXMuIHtcIjJhXCIgW1wiM2FcIiBcIjRhXCJdIFwiMWJcIiBbXCIzYVwiIFwiM2NcIl19XG4gICAgc2hvd0Rlc3RzPzogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIGRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIGV2ZW50cz86IHtcbiAgICAgIGFmdGVyPzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tOiBib29sZWFuLCBtZXRhZGF0YTogc2cuTW92ZU1ldGFkYXRhKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIG1vdmUgaGFzIGJlZW4gcGxheWVkXG4gICAgfTtcbiAgfTtcbiAgZHJvcHBhYmxlPzoge1xuICAgIGZyZWU/OiBib29sZWFuOyAvLyBhbGwgZHJvcHMgYXJlIHZhbGlkIC0gYm9hcmQgZWRpdG9yXG4gICAgZGVzdHM/OiBzZy5Ecm9wRGVzdHM7IC8vIHZhbGlkIGRyb3BzLiB7XCJzZW50ZSBwYXduXCIgW1wiM2FcIiBcIjRhXCJdIFwic2VudGUgbGFuY2VcIiBbXCIzYVwiIFwiM2NcIl19XG4gICAgc2hvd0Rlc3RzPzogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIGRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIHNwYXJlPzogYm9vbGVhbjsgLy8gd2hldGhlciB0byByZW1vdmUgZHJvcHBlZCBwaWVjZSBmcm9tIGhhbmQgYWZ0ZXIgZHJvcCAtIGJvYXJkIGVkaXRvclxuICAgIGV2ZW50cz86IHtcbiAgICAgIGFmdGVyPzogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb206IGJvb2xlYW4sIG1ldGFkYXRhOiBzZy5Nb3ZlTWV0YWRhdGEpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgZHJvcCBoYXMgYmVlbiBwbGF5ZWRcbiAgICB9O1xuICB9O1xuICBwcmVtb3ZhYmxlPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuOyAvLyBhbGxvdyBwcmVtb3ZlcyBmb3IgY29sb3IgdGhhdCBjYW4gbm90IG1vdmVcbiAgICBzaG93RGVzdHM/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgcHJlLWRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIGRlc3RzPzogc2cuS2V5W107IC8vIHByZW1vdmUgZGVzdGluYXRpb25zIGZvciB0aGUgY3VycmVudCBzZWxlY3Rpb25cbiAgICBnZW5lcmF0ZT86IChrZXk6IHNnLktleSwgcGllY2VzOiBzZy5QaWVjZXMpID0+IHNnLktleVtdOyAvLyBmdW5jdGlvbiB0byBnZW5lcmF0ZSBkZXN0aW5hdGlvbnMgdGhhdCB1c2VyIGNhbiBwcmVtb3ZlIHRvXG4gICAgZXZlbnRzPzoge1xuICAgICAgc2V0PzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tOiBib29sZWFuKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZW1vdmUgaGFzIGJlZW4gc2V0XG4gICAgICB1bnNldD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlbW92ZSBoYXMgYmVlbiB1bnNldFxuICAgIH07XG4gIH07XG4gIHByZWRyb3BwYWJsZT86IHtcbiAgICBlbmFibGVkPzogYm9vbGVhbjsgLy8gYWxsb3cgcHJlZHJvcHMgZm9yIGNvbG9yIHRoYXQgY2FuIG5vdCBtb3ZlXG4gICAgc2hvd0Rlc3RzPzogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIHByZS1kZXN0IGNsYXNzIG9uIHNxdWFyZXMgZm9yIGRyb3BzXG4gICAgZGVzdHM/OiBzZy5LZXlbXTsgLy8gcHJlbW92ZSBkZXN0aW5hdGlvbnMgZm9yIHRoZSBkcm9wIHNlbGVjdGlvblxuICAgIGdlbmVyYXRlPzogKHBpZWNlOiBzZy5QaWVjZSwgcGllY2VzOiBzZy5QaWVjZXMpID0+IHNnLktleVtdOyAvLyBmdW5jdGlvbiB0byBnZW5lcmF0ZSBkZXN0aW5hdGlvbnMgdGhhdCB1c2VyIGNhbiBwcmVkcm9wIG9uXG4gICAgZXZlbnRzPzoge1xuICAgICAgc2V0PzogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb206IGJvb2xlYW4pID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlZHJvcCBoYXMgYmVlbiBzZXRcbiAgICAgIHVuc2V0PzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVkcm9wIGhhcyBiZWVuIHVuc2V0XG4gICAgfTtcbiAgfTtcbiAgZHJhZ2dhYmxlPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuOyAvLyBhbGxvdyBtb3ZlcyAmIHByZW1vdmVzIHRvIHVzZSBkcmFnJ24gZHJvcFxuICAgIGRpc3RhbmNlPzogbnVtYmVyOyAvLyBtaW5pbXVtIGRpc3RhbmNlIHRvIGluaXRpYXRlIGEgZHJhZzsgaW4gcGl4ZWxzXG4gICAgYXV0b0Rpc3RhbmNlPzogYm9vbGVhbjsgLy8gbGV0cyBzaG9naWdyb3VuZCBzZXQgZGlzdGFuY2UgdG8gemVybyB3aGVuIHVzZXIgZHJhZ3MgcGllY2VzXG4gICAgc2hvd0dob3N0PzogYm9vbGVhbjsgLy8gc2hvdyBnaG9zdCBvZiBwaWVjZSBiZWluZyBkcmFnZ2VkXG4gICAgc2hvd1RvdWNoU3F1YXJlT3ZlcmxheT86IGJvb2xlYW47IC8vIHNob3cgc3F1YXJlIG92ZXJsYXkgb24gdGhlIHNxdWFyZSB0aGF0IGlzIGN1cnJlbnRseSBiZWluZyBob3ZlcmVkLCB0b3VjaCBvbmx5XG4gICAgZGVsZXRlT25Ecm9wT2ZmPzogYm9vbGVhbjsgLy8gZGVsZXRlIGEgcGllY2Ugd2hlbiBpdCBpcyBkcm9wcGVkIG9mZiB0aGUgYm9hcmRcbiAgICBhZGRUb0hhbmRPbkRyb3BPZmY/OiBib29sZWFuOyAvLyBhZGQgYSBwaWVjZSB0byBoYW5kIHdoZW4gaXQgaXMgZHJvcHBlZCBvbiBpdCwgcmVxdWlyZXMgZGVsZXRlT25Ecm9wT2ZmXG4gIH07XG4gIHNlbGVjdGFibGU/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGRpc2FibGUgdG8gZW5mb3JjZSBkcmFnZ2luZyBvdmVyIGNsaWNrLWNsaWNrIG1vdmVcbiAgICBmb3JjZVNwYXJlcz86IGJvb2xlYW47IC8vIGFsbG93IGRyb3BwaW5nIHNwYXJlIHBpZWNlcyBldmVuIHdpdGggc2VsZWN0YWJsZSBkaXNhYmxlZFxuICAgIGRlbGV0ZU9uVG91Y2g/OiBib29sZWFuOyAvLyBzZWxlY3RpbmcgYSBwaWVjZSBvbiB0aGUgYm9hcmQgb3IgaW4gaGFuZCB3aWxsIHJlbW92ZSBpdCAtIGJvYXJkIGVkaXRvclxuICAgIGFkZFNwYXJlc1RvSGFuZD86IGJvb2xlYW47IC8vIGFkZCBzZWxlY3RlZCBzcGFyZSBwaWVjZSB0byBoYW5kIC0gYm9hcmQgZWRpdG9yXG4gIH07XG4gIGV2ZW50cz86IHtcbiAgICBjaGFuZ2U/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHNpdHVhdGlvbiBjaGFuZ2VzIG9uIHRoZSBib2FyZFxuICAgIG1vdmU/OiAob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXksIHByb206IGJvb2xlYW4sIGNhcHR1cmVkUGllY2U/OiBzZy5QaWVjZSkgPT4gdm9pZDtcbiAgICBkcm9wPzogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb206IGJvb2xlYW4pID0+IHZvaWQ7XG4gICAgc2VsZWN0PzogKGtleTogc2cuS2V5KSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBhIHNxdWFyZSBpcyBzZWxlY3RlZFxuICAgIHVuc2VsZWN0PzogKGtleTogc2cuS2V5KSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBhIHNlbGVjdGVkIHNxdWFyZSBpcyBkaXJlY3RseSB1bnNlbGVjdGVkIC0gZHJvcHBlZCBiYWNrIG9yIGNsaWNrZWQgb24gdGhlIG9yaWdpbmFsIHNxdWFyZVxuICAgIHBpZWNlU2VsZWN0PzogKHBpZWNlOiBzZy5QaWVjZSkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gYSBwaWVjZSBpbiBoYW5kIGlzIHNlbGVjdGVkXG4gICAgcGllY2VVbnNlbGVjdD86IChwaWVjZTogc2cuUGllY2UpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIGEgc2VsZWN0ZWQgcGllY2UgaXMgZGlyZWN0bHkgdW5zZWxlY3RlZCAtIGRyb3BwZWQgYmFjayBvciBjbGlja2VkIG9uIHRoZSBzYW1lIHBpZWNlXG4gICAgaW5zZXJ0PzogKGJvYXJkRWxlbWVudHM/OiBzZy5Cb2FyZEVsZW1lbnRzLCBoYW5kRWxlbWVudHM/OiBzZy5IYW5kRWxlbWVudHMpID0+IHZvaWQ7IC8vIHdoZW4gdGhlIGJvYXJkL2hhbmRzIERPTSBoYXMgYmVlbiAocmUpaW5zZXJ0ZWRcbiAgfTtcbiAgZHJhd2FibGU/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGNhbiBkcmF3XG4gICAgdmlzaWJsZT86IGJvb2xlYW47IC8vIGNhbiB2aWV3XG4gICAgZm9yY2VkPzogYm9vbGVhbjsgLy8gY2FuIG9ubHkgZHJhd1xuICAgIGVyYXNlT25DbGljaz86IGJvb2xlYW47XG4gICAgc2hhcGVzPzogRHJhd1NoYXBlW107XG4gICAgYXV0b1NoYXBlcz86IERyYXdTaGFwZVtdO1xuICAgIHNxdWFyZXM/OiBTcXVhcmVIaWdobGlnaHRbXTtcbiAgICBvbkNoYW5nZT86IChzaGFwZXM6IERyYXdTaGFwZVtdKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgZHJhd2FibGUgc2hhcGVzIGNoYW5nZVxuICB9O1xuICBmb3JzeXRoPzoge1xuICAgIHRvRm9yc3l0aD86IChyb2xlOiBzZy5Sb2xlU3RyaW5nKSA9PiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgZnJvbUZvcnN5dGg/OiAoc3RyOiBzdHJpbmcpID0+IHNnLlJvbGVTdHJpbmcgfCB1bmRlZmluZWQ7XG4gIH07XG4gIHByb21vdGlvbj86IHtcbiAgICBwcm9tb3Rlc1RvPzogKHJvbGU6IHNnLlJvbGVTdHJpbmcpID0+IHNnLlJvbGVTdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgdW5wcm9tb3Rlc1RvPzogKHJvbGU6IHNnLlJvbGVTdHJpbmcpID0+IHNnLlJvbGVTdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgbW92ZVByb21vdGlvbkRpYWxvZz86IChvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSkgPT4gYm9vbGVhbjsgLy8gYWN0aXZhdGUgcHJvbW90aW9uIGRpYWxvZ1xuICAgIGZvcmNlTW92ZVByb21vdGlvbj86IChvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSkgPT4gYm9vbGVhbjsgLy8gYXV0byBwcm9tb3RlIGFmdGVyIG1vdmVcbiAgICBkcm9wUHJvbW90aW9uRGlhbG9nPzogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXkpID0+IGJvb2xlYW47IC8vIGFjdGl2YXRlIHByb21vdGlvbiBkaWFsb2dcbiAgICBmb3JjZURyb3BQcm9tb3Rpb24/OiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSkgPT4gYm9vbGVhbjsgLy8gYXV0byBwcm9tb3RlIGFmdGVyIGRyb3BcbiAgICBldmVudHM/OiB7XG4gICAgICBpbml0aWF0ZWQ/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBwcm9tb3Rpb24gZGlhbG9nIGlzIHN0YXJ0ZWRcbiAgICAgIGFmdGVyPzogKHBpZWNlOiBzZy5QaWVjZSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHVzZXIgc2VsZWN0cyBhIHBpZWNlXG4gICAgICBjYW5jZWw/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdXNlciBjYW5jZWxzIHRoZSBzZWxlY3Rpb25cbiAgICB9O1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlBbmltYXRpb24oc3RhdGU6IEhlYWRsZXNzU3RhdGUsIGNvbmZpZzogQ29uZmlnKTogdm9pZCB7XG4gIGlmIChjb25maWcuYW5pbWF0aW9uKSB7XG4gICAgZGVlcE1lcmdlKHN0YXRlLmFuaW1hdGlvbiwgY29uZmlnLmFuaW1hdGlvbik7XG4gICAgLy8gbm8gbmVlZCBmb3Igc3VjaCBzaG9ydCBhbmltYXRpb25zXG4gICAgaWYgKChzdGF0ZS5hbmltYXRpb24uZHVyYXRpb24gfHwgMCkgPCA3MCkgc3RhdGUuYW5pbWF0aW9uLmVuYWJsZWQgPSBmYWxzZTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uZmlndXJlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBjb25maWc6IENvbmZpZyk6IHZvaWQge1xuICAvLyBkb24ndCBtZXJnZSwganVzdCBvdmVycmlkZS5cbiAgaWYgKGNvbmZpZy5tb3ZhYmxlPy5kZXN0cykgc3RhdGUubW92YWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbiAgaWYgKGNvbmZpZy5kcm9wcGFibGU/LmRlc3RzKSBzdGF0ZS5kcm9wcGFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gIGlmIChjb25maWcuZHJhd2FibGU/LnNoYXBlcykgc3RhdGUuZHJhd2FibGUuc2hhcGVzID0gW107XG4gIGlmIChjb25maWcuZHJhd2FibGU/LmF1dG9TaGFwZXMpIHN0YXRlLmRyYXdhYmxlLmF1dG9TaGFwZXMgPSBbXTtcbiAgaWYgKGNvbmZpZy5kcmF3YWJsZT8uc3F1YXJlcykgc3RhdGUuZHJhd2FibGUuc3F1YXJlcyA9IFtdO1xuICBpZiAoY29uZmlnLmhhbmRzPy5yb2xlcykgc3RhdGUuaGFuZHMucm9sZXMgPSBbXTtcblxuICBkZWVwTWVyZ2Uoc3RhdGUsIGNvbmZpZyk7XG5cbiAgLy8gaWYgYSBzZmVuIHdhcyBwcm92aWRlZCwgcmVwbGFjZSB0aGUgcGllY2VzLCBleGNlcHQgdGhlIGN1cnJlbnRseSBkcmFnZ2VkIG9uZVxuICBpZiAoY29uZmlnLnNmZW4/LmJvYXJkKSB7XG4gICAgc3RhdGUuZGltZW5zaW9ucyA9IGluZmVyRGltZW5zaW9ucyhjb25maWcuc2Zlbi5ib2FyZCk7XG4gICAgc3RhdGUucGllY2VzID0gc2ZlblRvQm9hcmQoY29uZmlnLnNmZW4uYm9hcmQsIHN0YXRlLmRpbWVuc2lvbnMsIHN0YXRlLmZvcnN5dGguZnJvbUZvcnN5dGgpO1xuICAgIHN0YXRlLmRyYXdhYmxlLnNoYXBlcyA9IGNvbmZpZy5kcmF3YWJsZT8uc2hhcGVzIHx8IFtdO1xuICB9XG5cbiAgaWYgKGNvbmZpZy5zZmVuPy5oYW5kcykge1xuICAgIHN0YXRlLmhhbmRzLmhhbmRNYXAgPSBzZmVuVG9IYW5kcyhjb25maWcuc2Zlbi5oYW5kcywgc3RhdGUuZm9yc3l0aC5mcm9tRm9yc3l0aCk7XG4gIH1cblxuICAvLyBhcHBseSBjb25maWcgdmFsdWVzIHRoYXQgY291bGQgYmUgdW5kZWZpbmVkIHlldCBtZWFuaW5nZnVsXG4gIGlmICgnY2hlY2tzJyBpbiBjb25maWcpIHNldENoZWNrcyhzdGF0ZSwgY29uZmlnLmNoZWNrcyB8fCBmYWxzZSk7XG4gIGlmICgnbGFzdFBpZWNlJyBpbiBjb25maWcgJiYgIWNvbmZpZy5sYXN0UGllY2UpIHN0YXRlLmxhc3RQaWVjZSA9IHVuZGVmaW5lZDtcblxuICAvLyBpbiBjYXNlIG9mIGRyb3AgbGFzdCBtb3ZlLCB0aGVyZSdzIGEgc2luZ2xlIHNxdWFyZS5cbiAgLy8gaWYgdGhlIHByZXZpb3VzIGxhc3QgbW92ZSBoYWQgdHdvIHNxdWFyZXMsXG4gIC8vIHRoZSBtZXJnZSBhbGdvcml0aG0gd2lsbCBpbmNvcnJlY3RseSBrZWVwIHRoZSBzZWNvbmQgc3F1YXJlLlxuICBpZiAoJ2xhc3REZXN0cycgaW4gY29uZmlnICYmICFjb25maWcubGFzdERlc3RzKSBzdGF0ZS5sYXN0RGVzdHMgPSB1bmRlZmluZWQ7XG4gIGVsc2UgaWYgKGNvbmZpZy5sYXN0RGVzdHMpIHN0YXRlLmxhc3REZXN0cyA9IGNvbmZpZy5sYXN0RGVzdHM7XG5cbiAgLy8gZml4IG1vdmUvcHJlbW92ZSBkZXN0c1xuICBzZXRQcmVEZXN0cyhzdGF0ZSk7XG5cbiAgYXBwbHlBbmltYXRpb24oc3RhdGUsIGNvbmZpZyk7XG59XG5cbmZ1bmN0aW9uIGRlZXBNZXJnZShiYXNlOiBhbnksIGV4dGVuZDogYW55KTogdm9pZCB7XG4gIGZvciAoY29uc3Qga2V5IGluIGV4dGVuZCkge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZXh0ZW5kLCBrZXkpKSB7XG4gICAgICBpZiAoXG4gICAgICAgIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChiYXNlLCBrZXkpICYmXG4gICAgICAgIGlzUGxhaW5PYmplY3QoYmFzZVtrZXldKSAmJlxuICAgICAgICBpc1BsYWluT2JqZWN0KGV4dGVuZFtrZXldKVxuICAgICAgKVxuICAgICAgICBkZWVwTWVyZ2UoYmFzZVtrZXldLCBleHRlbmRba2V5XSk7XG4gICAgICBlbHNlIGJhc2Vba2V5XSA9IGV4dGVuZFtrZXldO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KG86IHVua25vd24pOiBib29sZWFuIHtcbiAgaWYgKHR5cGVvZiBvICE9PSAnb2JqZWN0JyB8fCBvID09PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG8pO1xuICByZXR1cm4gcHJvdG8gPT09IE9iamVjdC5wcm90b3R5cGUgfHwgcHJvdG8gPT09IG51bGw7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBEcmF3Q3VycmVudCwgRHJhd1NoYXBlLCBEcmF3U2hhcGVQaWVjZSB9IGZyb20gJy4vZHJhdy5qcyc7XG5pbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHtcbiAgY3JlYXRlRWwsXG4gIGtleTJwb3MsXG4gIHBpZWNlTmFtZU9mLFxuICBwb3NPZk91dHNpZGVFbCxcbiAgcG9zVG9UcmFuc2xhdGVSZWwsXG4gIHNhbWVQaWVjZSxcbiAgc2VudGVQb3YsXG4gIHRyYW5zbGF0ZVJlbCxcbn0gZnJvbSAnLi91dGlsLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNWR0VsZW1lbnQodGFnTmFtZTogc3RyaW5nKTogU1ZHRWxlbWVudCB7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgdGFnTmFtZSk7XG59XG5cbmludGVyZmFjZSBTaGFwZSB7XG4gIHNoYXBlOiBEcmF3U2hhcGU7XG4gIGhhc2g6IEhhc2g7XG4gIGN1cnJlbnQ/OiBib29sZWFuO1xufVxuXG50eXBlIEFycm93RGVzdHMgPSBNYXA8c2cuS2V5IHwgc2cuUGllY2VOYW1lLCBudW1iZXI+OyAvLyBob3cgbWFueSBhcnJvd3MgbGFuZCBvbiBhIHNxdWFyZVxuXG50eXBlIEhhc2ggPSBzdHJpbmc7XG5cbmNvbnN0IG91dHNpZGVBcnJvd0hhc2ggPSAnb3V0c2lkZUFycm93JztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclNoYXBlcyhcbiAgc3RhdGU6IFN0YXRlLFxuICBzdmc6IFNWR0VsZW1lbnQsXG4gIGN1c3RvbVN2ZzogU1ZHRWxlbWVudCxcbiAgZnJlZVBpZWNlczogSFRNTEVsZW1lbnQsXG4pOiB2b2lkIHtcbiAgY29uc3QgZCA9IHN0YXRlLmRyYXdhYmxlO1xuICBjb25zdCBjdXJEID0gZC5jdXJyZW50O1xuICBjb25zdCBjdXIgPSBjdXJEPy5kZXN0ID8gKGN1ckQgYXMgRHJhd1NoYXBlKSA6IHVuZGVmaW5lZDtcbiAgY29uc3Qgb3V0c2lkZUFycm93ID0gISFjdXJEICYmICFjdXI7XG4gIGNvbnN0IGFycm93RGVzdHM6IEFycm93RGVzdHMgPSBuZXcgTWFwKCk7XG4gIGNvbnN0IHBpZWNlTWFwID0gbmV3IE1hcDxzZy5LZXksIERyYXdTaGFwZT4oKTtcblxuICBjb25zdCBoYXNoQm91bmRzID0gKCkgPT4ge1xuICAgIC8vIHRvZG8gYWxzbyBwb3NzaWJsZSBwaWVjZSBib3VuZHNcbiAgICBjb25zdCBib3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpO1xuICAgIHJldHVybiAoYm91bmRzICYmIGJvdW5kcy53aWR0aC50b1N0cmluZygpICsgYm91bmRzLmhlaWdodCkgfHwgJyc7XG4gIH07XG5cbiAgZm9yIChjb25zdCBzIG9mIGQuc2hhcGVzLmNvbmNhdChkLmF1dG9TaGFwZXMpLmNvbmNhdChjdXIgPyBbY3VyXSA6IFtdKSkge1xuICAgIGNvbnN0IGRlc3ROYW1lID0gaXNQaWVjZShzLmRlc3QpID8gcGllY2VOYW1lT2Yocy5kZXN0KSA6IHMuZGVzdDtcbiAgICBpZiAoIXNhbWVQaWVjZU9yS2V5KHMuZGVzdCwgcy5vcmlnKSlcbiAgICAgIGFycm93RGVzdHMuc2V0KGRlc3ROYW1lLCAoYXJyb3dEZXN0cy5nZXQoZGVzdE5hbWUpIHx8IDApICsgMSk7XG4gIH1cblxuICBmb3IgKGNvbnN0IHMgb2YgZC5zaGFwZXMuY29uY2F0KGN1ciA/IFtjdXJdIDogW10pLmNvbmNhdChkLmF1dG9TaGFwZXMpKSB7XG4gICAgaWYgKHMucGllY2UgJiYgIWlzUGllY2Uocy5vcmlnKSkgcGllY2VNYXAuc2V0KHMub3JpZywgcyk7XG4gIH1cbiAgY29uc3QgcGllY2VTaGFwZXMgPSBbLi4ucGllY2VNYXAudmFsdWVzKCldLm1hcCgocykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBzaGFwZTogcyxcbiAgICAgIGhhc2g6IHNoYXBlSGFzaChzLCBhcnJvd0Rlc3RzLCBmYWxzZSwgaGFzaEJvdW5kcyksXG4gICAgfTtcbiAgfSk7XG5cbiAgY29uc3Qgc2hhcGVzOiBTaGFwZVtdID0gZC5zaGFwZXMuY29uY2F0KGQuYXV0b1NoYXBlcykubWFwKChzOiBEcmF3U2hhcGUpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgc2hhcGU6IHMsXG4gICAgICBoYXNoOiBzaGFwZUhhc2gocywgYXJyb3dEZXN0cywgZmFsc2UsIGhhc2hCb3VuZHMpLFxuICAgIH07XG4gIH0pO1xuICBpZiAoY3VyKVxuICAgIHNoYXBlcy5wdXNoKHtcbiAgICAgIHNoYXBlOiBjdXIsXG4gICAgICBoYXNoOiBzaGFwZUhhc2goY3VyLCBhcnJvd0Rlc3RzLCB0cnVlLCBoYXNoQm91bmRzKSxcbiAgICAgIGN1cnJlbnQ6IHRydWUsXG4gICAgfSk7XG5cbiAgY29uc3QgZnVsbEhhc2ggPSBzaGFwZXMubWFwKChzYykgPT4gc2MuaGFzaCkuam9pbignOycpICsgKG91dHNpZGVBcnJvdyA/IG91dHNpZGVBcnJvd0hhc2ggOiAnJyk7XG4gIGlmIChmdWxsSGFzaCA9PT0gc3RhdGUuZHJhd2FibGUucHJldlN2Z0hhc2gpIHJldHVybjtcbiAgc3RhdGUuZHJhd2FibGUucHJldlN2Z0hhc2ggPSBmdWxsSGFzaDtcblxuICAvKlxuICAgIC0tIERPTSBoaWVyYXJjaHkgLS1cbiAgICA8c3ZnIGNsYXNzPVwic2ctc2hhcGVzXCI+ICg8PSBzdmcpXG4gICAgICA8ZGVmcz5cbiAgICAgICAgLi4uKGZvciBicnVzaGVzKS4uLlxuICAgICAgPC9kZWZzPlxuICAgICAgPGc+XG4gICAgICAgIC4uLihmb3IgYXJyb3dzIGFuZCBjaXJjbGVzKS4uLlxuICAgICAgPC9nPlxuICAgIDwvc3ZnPlxuICAgIDxzdmcgY2xhc3M9XCJzZy1jdXN0b20tc3Znc1wiPiAoPD0gY3VzdG9tU3ZnKVxuICAgICAgPGc+XG4gICAgICAgIC4uLihmb3IgY3VzdG9tIHN2Z3MpLi4uXG4gICAgICA8L2c+XG4gICAgPHNnLWZyZWUtcGllY2VzPiAoPD0gZnJlZVBpZWNlcylcbiAgICAgIC4uLihmb3IgcGllY2VzKS4uLlxuICAgIDwvc2ctZnJlZS1waWVjZXM+XG4gICAgPC9zdmc+XG4gICovXG4gIGNvbnN0IGRlZnNFbCA9IHN2Zy5xdWVyeVNlbGVjdG9yKCdkZWZzJykgYXMgU1ZHRWxlbWVudDtcbiAgY29uc3Qgc2hhcGVzRWwgPSBzdmcucXVlcnlTZWxlY3RvcignZycpIGFzIFNWR0VsZW1lbnQ7XG4gIGNvbnN0IGN1c3RvbVN2Z3NFbCA9IGN1c3RvbVN2Zy5xdWVyeVNlbGVjdG9yKCdnJykgYXMgU1ZHRWxlbWVudDtcblxuICBzeW5jRGVmcyhzaGFwZXMsIG91dHNpZGVBcnJvdyA/IGN1ckQgOiB1bmRlZmluZWQsIGRlZnNFbCk7XG4gIHN5bmNTaGFwZXMoXG4gICAgc2hhcGVzLmZpbHRlcigocykgPT4gIXMuc2hhcGUuY3VzdG9tU3ZnICYmICghcy5zaGFwZS5waWVjZSB8fCBzLmN1cnJlbnQpKSxcbiAgICBzaGFwZXNFbCxcbiAgICAoc2hhcGUpID0+IHJlbmRlclNWR1NoYXBlKHN0YXRlLCBzaGFwZSwgYXJyb3dEZXN0cyksXG4gICAgb3V0c2lkZUFycm93LFxuICApO1xuICBzeW5jU2hhcGVzKFxuICAgIHNoYXBlcy5maWx0ZXIoKHMpID0+IHMuc2hhcGUuY3VzdG9tU3ZnKSxcbiAgICBjdXN0b21TdmdzRWwsXG4gICAgKHNoYXBlKSA9PiByZW5kZXJTVkdTaGFwZShzdGF0ZSwgc2hhcGUsIGFycm93RGVzdHMpLFxuICApO1xuICBzeW5jU2hhcGVzKHBpZWNlU2hhcGVzLCBmcmVlUGllY2VzLCAoc2hhcGUpID0+IHJlbmRlclBpZWNlKHN0YXRlLCBzaGFwZSkpO1xuXG4gIGlmICghb3V0c2lkZUFycm93ICYmIGN1ckQpIGN1ckQuYXJyb3cgPSB1bmRlZmluZWQ7XG5cbiAgaWYgKG91dHNpZGVBcnJvdyAmJiAhY3VyRC5hcnJvdykge1xuICAgIGNvbnN0IG9yaWcgPSBwaWVjZU9yS2V5VG9Qb3MoY3VyRC5vcmlnLCBzdGF0ZSk7XG4gICAgaWYgKG9yaWcpIHtcbiAgICAgIGNvbnN0IGcgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ2cnKSwge1xuICAgICAgICBjbGFzczogc2hhcGVDbGFzcyhjdXJELmJydXNoLCB0cnVlLCB0cnVlKSxcbiAgICAgICAgc2dIYXNoOiBvdXRzaWRlQXJyb3dIYXNoLFxuICAgICAgfSk7XG4gICAgICBjb25zdCBlbCA9IHJlbmRlckFycm93KGN1ckQuYnJ1c2gsIG9yaWcsIG9yaWcsIHN0YXRlLnNxdWFyZVJhdGlvLCB0cnVlLCBmYWxzZSk7XG4gICAgICBnLmFwcGVuZENoaWxkKGVsKTtcbiAgICAgIGN1ckQuYXJyb3cgPSBlbDtcbiAgICAgIHNoYXBlc0VsLmFwcGVuZENoaWxkKGcpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBhcHBlbmQgb25seS4gRG9uJ3QgdHJ5IHRvIHVwZGF0ZS9yZW1vdmUuXG5mdW5jdGlvbiBzeW5jRGVmcyhcbiAgc2hhcGVzOiBTaGFwZVtdLFxuICBvdXRzaWRlU2hhcGU6IERyYXdDdXJyZW50IHwgdW5kZWZpbmVkLFxuICBkZWZzRWw6IFNWR0VsZW1lbnQsXG4pOiB2b2lkIHtcbiAgY29uc3QgYnJ1c2hlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBmb3IgKGNvbnN0IHMgb2Ygc2hhcGVzKSB7XG4gICAgaWYgKCFzYW1lUGllY2VPcktleShzLnNoYXBlLmRlc3QsIHMuc2hhcGUub3JpZykpIGJydXNoZXMuYWRkKHMuc2hhcGUuYnJ1c2gpO1xuICB9XG4gIGlmIChvdXRzaWRlU2hhcGUpIGJydXNoZXMuYWRkKG91dHNpZGVTaGFwZS5icnVzaCk7XG4gIGNvbnN0IGtleXNJbkRvbSA9IG5ldyBTZXQoKTtcbiAgbGV0IGVsOiBTVkdFbGVtZW50IHwgdW5kZWZpbmVkID0gZGVmc0VsLmZpcnN0RWxlbWVudENoaWxkIGFzIFNWR0VsZW1lbnQ7XG4gIHdoaWxlIChlbCkge1xuICAgIGtleXNJbkRvbS5hZGQoZWwuZ2V0QXR0cmlidXRlKCdzZ0tleScpKTtcbiAgICBlbCA9IGVsLm5leHRFbGVtZW50U2libGluZyBhcyBTVkdFbGVtZW50IHwgdW5kZWZpbmVkO1xuICB9XG4gIGZvciAoY29uc3Qga2V5IG9mIGJydXNoZXMpIHtcbiAgICBjb25zdCBicnVzaCA9IGtleSB8fCAncHJpbWFyeSc7XG4gICAgaWYgKCFrZXlzSW5Eb20uaGFzKGJydXNoKSkgZGVmc0VsLmFwcGVuZENoaWxkKHJlbmRlck1hcmtlcihicnVzaCkpO1xuICB9XG59XG5cbi8vIGFwcGVuZCBhbmQgcmVtb3ZlIG9ubHkuIE5vIHVwZGF0ZXMuXG5leHBvcnQgZnVuY3Rpb24gc3luY1NoYXBlcyhcbiAgc2hhcGVzOiBTaGFwZVtdLFxuICByb290OiBIVE1MRWxlbWVudCB8IFNWR0VsZW1lbnQsXG4gIHJlbmRlclNoYXBlOiAoc2hhcGU6IFNoYXBlKSA9PiBIVE1MRWxlbWVudCB8IFNWR0VsZW1lbnQgfCB1bmRlZmluZWQsXG4gIG91dHNpZGVBcnJvdz86IGJvb2xlYW4sXG4pOiB2b2lkIHtcbiAgY29uc3QgaGFzaGVzSW5Eb20gPSBuZXcgTWFwKCk7IC8vIGJ5IGhhc2hcbiAgY29uc3QgdG9SZW1vdmU6IFNWR0VsZW1lbnRbXSA9IFtdO1xuICBmb3IgKGNvbnN0IHNjIG9mIHNoYXBlcykgaGFzaGVzSW5Eb20uc2V0KHNjLmhhc2gsIGZhbHNlKTtcbiAgaWYgKG91dHNpZGVBcnJvdykgaGFzaGVzSW5Eb20uc2V0KG91dHNpZGVBcnJvd0hhc2gsIHRydWUpO1xuICBsZXQgZWw6IFNWR0VsZW1lbnQgfCB1bmRlZmluZWQgPSByb290LmZpcnN0RWxlbWVudENoaWxkIGFzIFNWR0VsZW1lbnQ7XG4gIGxldCBlbEhhc2g6IEhhc2ggfCBudWxsO1xuICB3aGlsZSAoZWwpIHtcbiAgICBlbEhhc2ggPSBlbC5nZXRBdHRyaWJ1dGUoJ3NnSGFzaCcpO1xuICAgIC8vIGZvdW5kIGEgc2hhcGUgZWxlbWVudCB0aGF0J3MgaGVyZSB0byBzdGF5XG4gICAgaWYgKGhhc2hlc0luRG9tLmhhcyhlbEhhc2gpKSBoYXNoZXNJbkRvbS5zZXQoZWxIYXNoLCB0cnVlKTtcbiAgICAvLyBvciByZW1vdmUgaXRcbiAgICBlbHNlIHRvUmVtb3ZlLnB1c2goZWwpO1xuICAgIGVsID0gZWwubmV4dEVsZW1lbnRTaWJsaW5nIGFzIFNWR0VsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIH1cbiAgLy8gcmVtb3ZlIG9sZCBzaGFwZXNcbiAgZm9yIChjb25zdCBlbCBvZiB0b1JlbW92ZSkgcm9vdC5yZW1vdmVDaGlsZChlbCk7XG4gIC8vIGluc2VydCBzaGFwZXMgdGhhdCBhcmUgbm90IHlldCBpbiBkb21cbiAgZm9yIChjb25zdCBzYyBvZiBzaGFwZXMpIHtcbiAgICBpZiAoIWhhc2hlc0luRG9tLmdldChzYy5oYXNoKSkge1xuICAgICAgY29uc3Qgc2hhcGVFbCA9IHJlbmRlclNoYXBlKHNjKTtcbiAgICAgIGlmIChzaGFwZUVsKSByb290LmFwcGVuZENoaWxkKHNoYXBlRWwpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzaGFwZUhhc2goXG4gIHsgb3JpZywgZGVzdCwgYnJ1c2gsIHBpZWNlLCBjdXN0b21TdmcsIGRlc2NyaXB0aW9uIH06IERyYXdTaGFwZSxcbiAgYXJyb3dEZXN0czogQXJyb3dEZXN0cyxcbiAgY3VycmVudDogYm9vbGVhbixcbiAgYm91bmRIYXNoOiAoKSA9PiBzdHJpbmcsXG4pOiBIYXNoIHtcbiAgcmV0dXJuIFtcbiAgICBjdXJyZW50LFxuICAgIChpc1BpZWNlKG9yaWcpIHx8IGlzUGllY2UoZGVzdCkpICYmIGJvdW5kSGFzaCgpLFxuICAgIGlzUGllY2Uob3JpZykgPyBwaWVjZUhhc2gob3JpZykgOiBvcmlnLFxuICAgIGlzUGllY2UoZGVzdCkgPyBwaWVjZUhhc2goZGVzdCkgOiBkZXN0LFxuICAgIGJydXNoLFxuICAgIChhcnJvd0Rlc3RzLmdldChpc1BpZWNlKGRlc3QpID8gcGllY2VOYW1lT2YoZGVzdCkgOiBkZXN0KSB8fCAwKSA+IDEsXG4gICAgcGllY2UgJiYgcGllY2VIYXNoKHBpZWNlKSxcbiAgICBjdXN0b21TdmcgJiYgY3VzdG9tU3ZnSGFzaChjdXN0b21TdmcpLFxuICAgIGRlc2NyaXB0aW9uLFxuICBdXG4gICAgLmZpbHRlcigoeCkgPT4geClcbiAgICAuam9pbignLCcpO1xufVxuXG5mdW5jdGlvbiBwaWVjZUhhc2gocGllY2U6IERyYXdTaGFwZVBpZWNlKTogSGFzaCB7XG4gIHJldHVybiBbcGllY2UuY29sb3IsIHBpZWNlLnJvbGUsIHBpZWNlLnNjYWxlXS5maWx0ZXIoKHgpID0+IHgpLmpvaW4oJywnKTtcbn1cblxuZnVuY3Rpb24gY3VzdG9tU3ZnSGFzaChzOiBzdHJpbmcpOiBIYXNoIHtcbiAgLy8gUm9sbGluZyBoYXNoIHdpdGggYmFzZSAzMSAoY2YuIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzc2MTY0NjEvZ2VuZXJhdGUtYS1oYXNoLWZyb20tc3RyaW5nLWluLWphdmFzY3JpcHQpXG4gIGxldCBoID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzLmxlbmd0aDsgaSsrKSB7XG4gICAgaCA9ICgoaCA8PCA1KSAtIGggKyBzLmNoYXJDb2RlQXQoaSkpID4+PiAwO1xuICB9XG4gIHJldHVybiBgY3VzdG9tLSR7aC50b1N0cmluZygpfWA7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclNWR1NoYXBlKFxuICBzdGF0ZTogU3RhdGUsXG4gIHsgc2hhcGUsIGN1cnJlbnQsIGhhc2ggfTogU2hhcGUsXG4gIGFycm93RGVzdHM6IEFycm93RGVzdHMsXG4pOiBTVkdFbGVtZW50IHwgdW5kZWZpbmVkIHtcbiAgY29uc3Qgb3JpZyA9IHBpZWNlT3JLZXlUb1BvcyhzaGFwZS5vcmlnLCBzdGF0ZSk7XG4gIGlmICghb3JpZykgcmV0dXJuO1xuICBpZiAoc2hhcGUuY3VzdG9tU3ZnKSB7XG4gICAgcmV0dXJuIHJlbmRlckN1c3RvbVN2ZyhzaGFwZS5icnVzaCwgc2hhcGUuY3VzdG9tU3ZnLCBvcmlnLCBzdGF0ZS5zcXVhcmVSYXRpbyk7XG4gIH0gZWxzZSB7XG4gICAgbGV0IGVsOiBTVkdFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgIGNvbnN0IGRlc3QgPSAhc2FtZVBpZWNlT3JLZXkoc2hhcGUub3JpZywgc2hhcGUuZGVzdCkgJiYgcGllY2VPcktleVRvUG9zKHNoYXBlLmRlc3QsIHN0YXRlKTtcbiAgICBpZiAoZGVzdCkge1xuICAgICAgZWwgPSByZW5kZXJBcnJvdyhcbiAgICAgICAgc2hhcGUuYnJ1c2gsXG4gICAgICAgIG9yaWcsXG4gICAgICAgIGRlc3QsXG4gICAgICAgIHN0YXRlLnNxdWFyZVJhdGlvLFxuICAgICAgICAhIWN1cnJlbnQsXG4gICAgICAgIChhcnJvd0Rlc3RzLmdldChpc1BpZWNlKHNoYXBlLmRlc3QpID8gcGllY2VOYW1lT2Yoc2hhcGUuZGVzdCkgOiBzaGFwZS5kZXN0KSB8fCAwKSA+IDEsXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAoc2FtZVBpZWNlT3JLZXkoc2hhcGUuZGVzdCwgc2hhcGUub3JpZykpIHtcbiAgICAgIGxldCByYXRpbzogc2cuTnVtYmVyUGFpciA9IHN0YXRlLnNxdWFyZVJhdGlvO1xuICAgICAgaWYgKGlzUGllY2Uoc2hhcGUub3JpZykpIHtcbiAgICAgICAgY29uc3QgcGllY2VCb3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzKCkuZ2V0KHBpZWNlTmFtZU9mKHNoYXBlLm9yaWcpKTtcbiAgICAgICAgY29uc3QgYm91bmRzID0gc3RhdGUuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKTtcbiAgICAgICAgaWYgKHBpZWNlQm91bmRzICYmIGJvdW5kcykge1xuICAgICAgICAgIGNvbnN0IGhlaWdodEJhc2UgPSBwaWVjZUJvdW5kcy5oZWlnaHQgLyAoYm91bmRzLmhlaWdodCAvIHN0YXRlLmRpbWVuc2lvbnMucmFua3MpO1xuICAgICAgICAgIC8vIHdlIHdhbnQgdG8ga2VlcCB0aGUgcmF0aW8gdGhhdCBpcyBvbiB0aGUgYm9hcmRcbiAgICAgICAgICByYXRpbyA9IFtoZWlnaHRCYXNlICogc3RhdGUuc3F1YXJlUmF0aW9bMF0sIGhlaWdodEJhc2UgKiBzdGF0ZS5zcXVhcmVSYXRpb1sxXV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsID0gcmVuZGVyRWxsaXBzZShvcmlnLCByYXRpbywgISFjdXJyZW50KTtcbiAgICB9XG4gICAgaWYgKGVsKSB7XG4gICAgICBjb25zdCBnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdnJyksIHtcbiAgICAgICAgY2xhc3M6IHNoYXBlQ2xhc3Moc2hhcGUuYnJ1c2gsICEhY3VycmVudCwgZmFsc2UpLFxuICAgICAgICBzZ0hhc2g6IGhhc2gsXG4gICAgICB9KTtcbiAgICAgIGcuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgY29uc3QgZGVzY0VsID0gc2hhcGUuZGVzY3JpcHRpb24gJiYgcmVuZGVyRGVzY3JpcHRpb24oc3RhdGUsIHNoYXBlLCBhcnJvd0Rlc3RzKTtcbiAgICAgIGlmIChkZXNjRWwpIGcuYXBwZW5kQ2hpbGQoZGVzY0VsKTtcbiAgICAgIHJldHVybiBnO1xuICAgIH0gZWxzZSByZXR1cm47XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyQ3VzdG9tU3ZnKFxuICBicnVzaDogc3RyaW5nLFxuICBjdXN0b21Tdmc6IHN0cmluZyxcbiAgcG9zOiBzZy5Qb3MsXG4gIHJhdGlvOiBzZy5OdW1iZXJQYWlyLFxuKTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IFt4LCB5XSA9IHBvcztcblxuICAvLyBUcmFuc2xhdGUgdG8gdG9wLWxlZnQgb2YgYG9yaWdgIHNxdWFyZVxuICBjb25zdCBnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdnJyksIHsgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7eH0sJHt5fSlgIH0pO1xuXG4gIGNvbnN0IHN2ZyA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnc3ZnJyksIHtcbiAgICBjbGFzczogYnJ1c2gsXG4gICAgd2lkdGg6IHJhdGlvWzBdLFxuICAgIGhlaWdodDogcmF0aW9bMV0sXG4gICAgdmlld0JveDogYDAgMCAke3JhdGlvWzBdICogMTB9ICR7cmF0aW9bMV0gKiAxMH1gLFxuICB9KTtcblxuICBnLmFwcGVuZENoaWxkKHN2Zyk7XG4gIHN2Zy5pbm5lckhUTUwgPSBjdXN0b21Tdmc7XG5cbiAgcmV0dXJuIGc7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckVsbGlwc2UocG9zOiBzZy5Qb3MsIHJhdGlvOiBzZy5OdW1iZXJQYWlyLCBjdXJyZW50OiBib29sZWFuKTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IG8gPSBwb3M7XG4gIGNvbnN0IHdpZHRocyA9IGVsbGlwc2VXaWR0aChyYXRpbyk7XG4gIHJldHVybiBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ2VsbGlwc2UnKSwge1xuICAgICdzdHJva2Utd2lkdGgnOiB3aWR0aHNbY3VycmVudCA/IDAgOiAxXSxcbiAgICBmaWxsOiAnbm9uZScsXG4gICAgY3g6IG9bMF0sXG4gICAgY3k6IG9bMV0sXG4gICAgcng6IHJhdGlvWzBdIC8gMiAtIHdpZHRoc1sxXSAvIDIsXG4gICAgcnk6IHJhdGlvWzFdIC8gMiAtIHdpZHRoc1sxXSAvIDIsXG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZW5kZXJBcnJvdyhcbiAgYnJ1c2g6IHN0cmluZyxcbiAgb3JpZzogc2cuUG9zLFxuICBkZXN0OiBzZy5Qb3MsXG4gIHJhdGlvOiBzZy5OdW1iZXJQYWlyLFxuICBjdXJyZW50OiBib29sZWFuLFxuICBzaG9ydGVuOiBib29sZWFuLFxuKTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IG0gPSBhcnJvd01hcmdpbihzaG9ydGVuICYmICFjdXJyZW50LCByYXRpbyk7XG4gIGNvbnN0IGEgPSBvcmlnO1xuICBjb25zdCBiID0gZGVzdDtcbiAgY29uc3QgZHggPSBiWzBdIC0gYVswXTtcbiAgY29uc3QgZHkgPSBiWzFdIC0gYVsxXTtcbiAgY29uc3QgYW5nbGUgPSBNYXRoLmF0YW4yKGR5LCBkeCk7XG4gIGNvbnN0IHhvID0gTWF0aC5jb3MoYW5nbGUpICogbTtcbiAgY29uc3QgeW8gPSBNYXRoLnNpbihhbmdsZSkgKiBtO1xuICByZXR1cm4gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdsaW5lJyksIHtcbiAgICAnc3Ryb2tlLXdpZHRoJzogbGluZVdpZHRoKGN1cnJlbnQsIHJhdGlvKSxcbiAgICAnc3Ryb2tlLWxpbmVjYXAnOiAncm91bmQnLFxuICAgICdtYXJrZXItZW5kJzogYHVybCgjYXJyb3doZWFkLSR7YnJ1c2ggfHwgJ3ByaW1hcnknfSlgLFxuICAgIHgxOiBhWzBdLFxuICAgIHkxOiBhWzFdLFxuICAgIHgyOiBiWzBdIC0geG8sXG4gICAgeTI6IGJbMV0gLSB5byxcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJQaWVjZShzdGF0ZTogU3RhdGUsIHsgc2hhcGUgfTogU2hhcGUpOiBzZy5QaWVjZU5vZGUgfCB1bmRlZmluZWQge1xuICBpZiAoIXNoYXBlLnBpZWNlIHx8IGlzUGllY2Uoc2hhcGUub3JpZykpIHJldHVybjtcblxuICBjb25zdCBvcmlnID0gc2hhcGUub3JpZztcbiAgY29uc3Qgc2NhbGUgPSAoc2hhcGUucGllY2Uuc2NhbGUgfHwgMSkgKiAoc3RhdGUuc2NhbGVEb3duUGllY2VzID8gMC41IDogMSk7XG5cbiAgY29uc3QgcGllY2VFbCA9IGNyZWF0ZUVsKCdwaWVjZScsIHBpZWNlTmFtZU9mKHNoYXBlLnBpZWNlKSkgYXMgc2cuUGllY2VOb2RlO1xuICBwaWVjZUVsLnNnS2V5ID0gb3JpZztcbiAgcGllY2VFbC5zZ1NjYWxlID0gc2NhbGU7XG4gIHRyYW5zbGF0ZVJlbChcbiAgICBwaWVjZUVsLFxuICAgIHBvc1RvVHJhbnNsYXRlUmVsKHN0YXRlLmRpbWVuc2lvbnMpKGtleTJwb3Mob3JpZyksIHNlbnRlUG92KHN0YXRlLm9yaWVudGF0aW9uKSksXG4gICAgc3RhdGUuc2NhbGVEb3duUGllY2VzID8gMC41IDogMSxcbiAgICBzY2FsZSxcbiAgKTtcblxuICByZXR1cm4gcGllY2VFbDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyRGVzY3JpcHRpb24oXG4gIHN0YXRlOiBTdGF0ZSxcbiAgc2hhcGU6IERyYXdTaGFwZSxcbiAgYXJyb3dEZXN0czogQXJyb3dEZXN0cyxcbik6IFNWR0VsZW1lbnQgfCB1bmRlZmluZWQge1xuICBjb25zdCBvcmlnID0gcGllY2VPcktleVRvUG9zKHNoYXBlLm9yaWcsIHN0YXRlKTtcbiAgaWYgKCFvcmlnIHx8ICFzaGFwZS5kZXNjcmlwdGlvbikgcmV0dXJuO1xuICBjb25zdCBkZXN0ID0gIXNhbWVQaWVjZU9yS2V5KHNoYXBlLm9yaWcsIHNoYXBlLmRlc3QpICYmIHBpZWNlT3JLZXlUb1BvcyhzaGFwZS5kZXN0LCBzdGF0ZSk7XG4gIGNvbnN0IGRpZmYgPSBkZXN0ID8gW2Rlc3RbMF0gLSBvcmlnWzBdLCBkZXN0WzFdIC0gb3JpZ1sxXV0gOiBbMCwgMF07XG4gIGNvbnN0IG9mZnNldCA9XG4gICAgKGFycm93RGVzdHMuZ2V0KGlzUGllY2Uoc2hhcGUuZGVzdCkgPyBwaWVjZU5hbWVPZihzaGFwZS5kZXN0KSA6IHNoYXBlLmRlc3QpIHx8IDApID4gMVxuICAgICAgPyAwLjNcbiAgICAgIDogMC4xNTtcbiAgY29uc3QgY2xvc2UgPVxuICAgIChkaWZmWzBdID09PSAwIHx8IE1hdGguYWJzKGRpZmZbMF0pID09PSBzdGF0ZS5zcXVhcmVSYXRpb1swXSkgJiZcbiAgICAoZGlmZlsxXSA9PT0gMCB8fCBNYXRoLmFicyhkaWZmWzFdKSA9PT0gc3RhdGUuc3F1YXJlUmF0aW9bMV0pO1xuICBjb25zdCByYXRpbyA9IGRlc3QgPyAwLjU1IC0gKGNsb3NlID8gb2Zmc2V0IDogMCkgOiAwO1xuICBjb25zdCBtaWQ6IHNnLlBvcyA9IFtvcmlnWzBdICsgZGlmZlswXSAqIHJhdGlvLCBvcmlnWzFdICsgZGlmZlsxXSAqIHJhdGlvXTtcbiAgY29uc3QgdGV4dExlbmd0aCA9IHNoYXBlLmRlc2NyaXB0aW9uLmxlbmd0aDtcbiAgY29uc3QgZyA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnZycpLCB7IGNsYXNzOiAnZGVzY3JpcHRpb24nIH0pO1xuICBjb25zdCBjaXJjbGUgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ2VsbGlwc2UnKSwge1xuICAgIGN4OiBtaWRbMF0sXG4gICAgY3k6IG1pZFsxXSxcbiAgICByeDogdGV4dExlbmd0aCArIDEuNSxcbiAgICByeTogMi41LFxuICB9KTtcbiAgY29uc3QgdGV4dCA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgndGV4dCcpLCB7XG4gICAgeDogbWlkWzBdLFxuICAgIHk6IG1pZFsxXSxcbiAgICAndGV4dC1hbmNob3InOiAnbWlkZGxlJyxcbiAgICAnZG9taW5hbnQtYmFzZWxpbmUnOiAnY2VudHJhbCcsXG4gIH0pO1xuICBnLmFwcGVuZENoaWxkKGNpcmNsZSk7XG4gIHRleHQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoc2hhcGUuZGVzY3JpcHRpb24pKTtcbiAgZy5hcHBlbmRDaGlsZCh0ZXh0KTtcbiAgcmV0dXJuIGc7XG59XG5cbmZ1bmN0aW9uIHJlbmRlck1hcmtlcihicnVzaDogc3RyaW5nKTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IG1hcmtlciA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnbWFya2VyJyksIHtcbiAgICBpZDogYGFycm93aGVhZC0ke2JydXNofWAsXG4gICAgb3JpZW50OiAnYXV0bycsXG4gICAgbWFya2VyV2lkdGg6IDQsXG4gICAgbWFya2VySGVpZ2h0OiA4LFxuICAgIHJlZlg6IDIuMDUsXG4gICAgcmVmWTogMi4wMSxcbiAgfSk7XG4gIG1hcmtlci5hcHBlbmRDaGlsZChcbiAgICBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ3BhdGgnKSwge1xuICAgICAgZDogJ00wLDAgVjQgTDMsMiBaJyxcbiAgICB9KSxcbiAgKTtcbiAgbWFya2VyLnNldEF0dHJpYnV0ZSgnc2dLZXknLCBicnVzaCk7XG4gIHJldHVybiBtYXJrZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRBdHRyaWJ1dGVzKGVsOiBTVkdFbGVtZW50LCBhdHRyczogUmVjb3JkPHN0cmluZywgYW55Pik6IFNWR0VsZW1lbnQge1xuICBmb3IgKGNvbnN0IGtleSBpbiBhdHRycykge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYXR0cnMsIGtleSkpIGVsLnNldEF0dHJpYnV0ZShrZXksIGF0dHJzW2tleV0pO1xuICB9XG4gIHJldHVybiBlbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBvczJ1c2VyKFxuICBwb3M6IHNnLlBvcyxcbiAgY29sb3I6IHNnLkNvbG9yLFxuICBkaW1zOiBzZy5EaW1lbnNpb25zLFxuICByYXRpbzogc2cuTnVtYmVyUGFpcixcbik6IHNnLk51bWJlclBhaXIge1xuICByZXR1cm4gY29sb3IgPT09ICdzZW50ZSdcbiAgICA/IFsoZGltcy5maWxlcyAtIDEgLSBwb3NbMF0pICogcmF0aW9bMF0sIHBvc1sxXSAqIHJhdGlvWzFdXVxuICAgIDogW3Bvc1swXSAqIHJhdGlvWzBdLCAoZGltcy5yYW5rcyAtIDEgLSBwb3NbMV0pICogcmF0aW9bMV1dO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQaWVjZSh4OiBzZy5LZXkgfCBzZy5QaWVjZSk6IHggaXMgc2cuUGllY2Uge1xuICByZXR1cm4gdHlwZW9mIHggPT09ICdvYmplY3QnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2FtZVBpZWNlT3JLZXkoa3AxOiBzZy5LZXkgfCBzZy5QaWVjZSwga3AyOiBzZy5LZXkgfCBzZy5QaWVjZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKGlzUGllY2Uoa3AxKSAmJiBpc1BpZWNlKGtwMikgJiYgc2FtZVBpZWNlKGtwMSwga3AyKSkgfHwga3AxID09PSBrcDI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VzQm91bmRzKHNoYXBlczogRHJhd1NoYXBlW10pOiBib29sZWFuIHtcbiAgcmV0dXJuIHNoYXBlcy5zb21lKChzKSA9PiBpc1BpZWNlKHMub3JpZykgfHwgaXNQaWVjZShzLmRlc3QpKTtcbn1cblxuZnVuY3Rpb24gc2hhcGVDbGFzcyhicnVzaDogc3RyaW5nLCBjdXJyZW50OiBib29sZWFuLCBvdXRzaWRlOiBib29sZWFuKTogc3RyaW5nIHtcbiAgcmV0dXJuIGJydXNoICsgKGN1cnJlbnQgPyAnIGN1cnJlbnQnIDogJycpICsgKG91dHNpZGUgPyAnIG91dHNpZGUnIDogJycpO1xufVxuXG5mdW5jdGlvbiByYXRpb0F2ZXJhZ2UocmF0aW86IHNnLk51bWJlclBhaXIpOiBudW1iZXIge1xuICByZXR1cm4gKHJhdGlvWzBdICsgcmF0aW9bMV0pIC8gMjtcbn1cblxuZnVuY3Rpb24gZWxsaXBzZVdpZHRoKHJhdGlvOiBzZy5OdW1iZXJQYWlyKTogW251bWJlciwgbnVtYmVyXSB7XG4gIHJldHVybiBbKDMgLyA2NCkgKiByYXRpb0F2ZXJhZ2UocmF0aW8pLCAoNCAvIDY0KSAqIHJhdGlvQXZlcmFnZShyYXRpbyldO1xufVxuXG5mdW5jdGlvbiBsaW5lV2lkdGgoY3VycmVudDogYm9vbGVhbiwgcmF0aW86IHNnLk51bWJlclBhaXIpOiBudW1iZXIge1xuICByZXR1cm4gKChjdXJyZW50ID8gOC41IDogMTApIC8gNjQpICogcmF0aW9BdmVyYWdlKHJhdGlvKTtcbn1cblxuZnVuY3Rpb24gYXJyb3dNYXJnaW4oc2hvcnRlbjogYm9vbGVhbiwgcmF0aW86IHNnLk51bWJlclBhaXIpOiBudW1iZXIge1xuICByZXR1cm4gKChzaG9ydGVuID8gMjAgOiAxMCkgLyA2NCkgKiByYXRpb0F2ZXJhZ2UocmF0aW8pO1xufVxuXG5mdW5jdGlvbiBwaWVjZU9yS2V5VG9Qb3Moa3A6IHNnLktleSB8IHNnLlBpZWNlLCBzdGF0ZTogU3RhdGUpOiBzZy5Qb3MgfCB1bmRlZmluZWQge1xuICBpZiAoaXNQaWVjZShrcCkpIHtcbiAgICBjb25zdCBwaWVjZUJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMoKS5nZXQocGllY2VOYW1lT2Yoa3ApKTtcbiAgICBjb25zdCBib3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpO1xuICAgIGNvbnN0IG9mZnNldCA9IHNlbnRlUG92KHN0YXRlLm9yaWVudGF0aW9uKSA/IFswLjUsIC0wLjVdIDogWy0wLjUsIDAuNV07XG4gICAgY29uc3QgcG9zID1cbiAgICAgIHBpZWNlQm91bmRzICYmXG4gICAgICBib3VuZHMgJiZcbiAgICAgIHBvc09mT3V0c2lkZUVsKFxuICAgICAgICBwaWVjZUJvdW5kcy5sZWZ0ICsgcGllY2VCb3VuZHMud2lkdGggLyAyLFxuICAgICAgICBwaWVjZUJvdW5kcy50b3AgKyBwaWVjZUJvdW5kcy5oZWlnaHQgLyAyLFxuICAgICAgICBzZW50ZVBvdihzdGF0ZS5vcmllbnRhdGlvbiksXG4gICAgICAgIHN0YXRlLmRpbWVuc2lvbnMsXG4gICAgICAgIGJvdW5kcyxcbiAgICAgICk7XG4gICAgcmV0dXJuIChcbiAgICAgIHBvcyAmJlxuICAgICAgcG9zMnVzZXIoXG4gICAgICAgIFtwb3NbMF0gKyBvZmZzZXRbMF0sIHBvc1sxXSArIG9mZnNldFsxXV0sXG4gICAgICAgIHN0YXRlLm9yaWVudGF0aW9uLFxuICAgICAgICBzdGF0ZS5kaW1lbnNpb25zLFxuICAgICAgICBzdGF0ZS5zcXVhcmVSYXRpbyxcbiAgICAgIClcbiAgICApO1xuICB9IGVsc2UgcmV0dXJuIHBvczJ1c2VyKGtleTJwb3Moa3ApLCBzdGF0ZS5vcmllbnRhdGlvbiwgc3RhdGUuZGltZW5zaW9ucywgc3RhdGUuc3F1YXJlUmF0aW8pO1xufVxuIiwgImltcG9ydCB7IGNhbmNlbE1vdmVPckRyb3AsIHVuc2VsZWN0IH0gZnJvbSAnLi9ib2FyZC5qcyc7XG5pbXBvcnQgeyBpc1BpZWNlLCBwb3MydXNlciwgc2FtZVBpZWNlT3JLZXksIHNldEF0dHJpYnV0ZXMgfSBmcm9tICcuL3NoYXBlcy5qcyc7XG5pbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHtcbiAgZXZlbnRQb3NpdGlvbixcbiAgZ2V0SGFuZFBpZWNlQXREb21Qb3MsXG4gIGdldEtleUF0RG9tUG9zLFxuICBpc1JpZ2h0QnV0dG9uLFxuICBwb3NPZk91dHNpZGVFbCxcbiAgc2FtZVBpZWNlLFxuICBzZW50ZVBvdixcbn0gZnJvbSAnLi91dGlsLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBEcmF3U2hhcGUge1xuICBvcmlnOiBzZy5LZXkgfCBzZy5QaWVjZTtcbiAgZGVzdDogc2cuS2V5IHwgc2cuUGllY2U7XG4gIHBpZWNlPzogRHJhd1NoYXBlUGllY2U7XG4gIGN1c3RvbVN2Zz86IHN0cmluZzsgLy8gc3ZnXG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xuICBicnVzaDogc3RyaW5nOyAvLyBjc3MgY2xhc3MgdG8gYmUgYXBwZW5kZWRcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTcXVhcmVIaWdobGlnaHQge1xuICBrZXk6IHNnLktleTtcbiAgY2xhc3NOYW1lOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd1NoYXBlUGllY2Uge1xuICByb2xlOiBzZy5Sb2xlU3RyaW5nO1xuICBjb2xvcjogc2cuQ29sb3I7XG4gIHNjYWxlPzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdhYmxlIHtcbiAgZW5hYmxlZDogYm9vbGVhbjsgLy8gY2FuIGRyYXdcbiAgdmlzaWJsZTogYm9vbGVhbjsgLy8gY2FuIHZpZXdcbiAgZm9yY2VkOiBib29sZWFuOyAvLyBjYW4gb25seSBkcmF3XG4gIGVyYXNlT25DbGljazogYm9vbGVhbjtcbiAgb25DaGFuZ2U/OiAoc2hhcGVzOiBEcmF3U2hhcGVbXSkgPT4gdm9pZDtcbiAgc2hhcGVzOiBEcmF3U2hhcGVbXTsgLy8gdXNlciBzaGFwZXNcbiAgYXV0b1NoYXBlczogRHJhd1NoYXBlW107IC8vIGNvbXB1dGVyIHNoYXBlc1xuICBzcXVhcmVzOiBTcXVhcmVIaWdobGlnaHRbXTtcbiAgY3VycmVudD86IERyYXdDdXJyZW50O1xuICBwcmV2U3ZnSGFzaDogc3RyaW5nO1xuICBwaWVjZT86IHNnLlBpZWNlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdDdXJyZW50IHtcbiAgb3JpZzogc2cuS2V5IHwgc2cuUGllY2U7XG4gIGRlc3Q/OiBzZy5LZXkgfCBzZy5QaWVjZTsgLy8gdW5kZWZpbmVkIGlmIG91dHNpZGUgYm9hcmQvaGFuZHNcbiAgYXJyb3c/OiBTVkdFbGVtZW50O1xuICBwaWVjZT86IHNnLlBpZWNlO1xuICBwb3M6IHNnLk51bWJlclBhaXI7XG4gIGJydXNoOiBzdHJpbmc7IC8vIGJydXNoIG5hbWUgZm9yIHNoYXBlXG59XG5cbmNvbnN0IGJydXNoZXMgPSBbJ3ByaW1hcnknLCAnYWx0ZXJuYXRpdmUwJywgJ2FsdGVybmF0aXZlMScsICdhbHRlcm5hdGl2ZTInXTtcblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0KHN0YXRlOiBTdGF0ZSwgZTogc2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICAvLyBzdXBwb3J0IG9uZSBmaW5nZXIgdG91Y2ggb25seVxuICBpZiAoZS50b3VjaGVzICYmIGUudG91Y2hlcy5sZW5ndGggPiAxKSByZXR1cm47XG4gIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIGUucHJldmVudERlZmF1bHQoKTtcblxuICBpZiAoZS5jdHJsS2V5KSB1bnNlbGVjdChzdGF0ZSk7XG4gIGVsc2UgY2FuY2VsTW92ZU9yRHJvcChzdGF0ZSk7XG5cbiAgY29uc3QgcG9zID0gZXZlbnRQb3NpdGlvbihlKTtcbiAgY29uc3QgYm91bmRzID0gc3RhdGUuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKTtcbiAgY29uc3Qgb3JpZyA9XG4gICAgcG9zICYmIGJvdW5kcyAmJiBnZXRLZXlBdERvbVBvcyhwb3MsIHNlbnRlUG92KHN0YXRlLm9yaWVudGF0aW9uKSwgc3RhdGUuZGltZW5zaW9ucywgYm91bmRzKTtcbiAgY29uc3QgcGllY2UgPSBzdGF0ZS5kcmF3YWJsZS5waWVjZTtcbiAgaWYgKCFvcmlnKSByZXR1cm47XG4gIHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQgPSB7XG4gICAgb3JpZyxcbiAgICBkZXN0OiB1bmRlZmluZWQsXG4gICAgcG9zLFxuICAgIHBpZWNlLFxuICAgIGJydXNoOiBldmVudEJydXNoKGUsIGlzUmlnaHRCdXR0b24oZSkgfHwgc3RhdGUuZHJhd2FibGUuZm9yY2VkKSxcbiAgfTtcbiAgcHJvY2Vzc0RyYXcoc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRGcm9tSGFuZChzdGF0ZTogU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwgZTogc2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICAvLyBzdXBwb3J0IG9uZSBmaW5nZXIgdG91Y2ggb25seVxuICBpZiAoZS50b3VjaGVzICYmIGUudG91Y2hlcy5sZW5ndGggPiAxKSByZXR1cm47XG4gIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIGUucHJldmVudERlZmF1bHQoKTtcblxuICBpZiAoZS5jdHJsS2V5KSB1bnNlbGVjdChzdGF0ZSk7XG4gIGVsc2UgY2FuY2VsTW92ZU9yRHJvcChzdGF0ZSk7XG5cbiAgY29uc3QgcG9zID0gZXZlbnRQb3NpdGlvbihlKTtcbiAgaWYgKCFwb3MpIHJldHVybjtcbiAgc3RhdGUuZHJhd2FibGUuY3VycmVudCA9IHtcbiAgICBvcmlnOiBwaWVjZSxcbiAgICBkZXN0OiB1bmRlZmluZWQsXG4gICAgcG9zLFxuICAgIGJydXNoOiBldmVudEJydXNoKGUsIGlzUmlnaHRCdXR0b24oZSkgfHwgc3RhdGUuZHJhd2FibGUuZm9yY2VkKSxcbiAgfTtcbiAgcHJvY2Vzc0RyYXcoc3RhdGUpO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzRHJhdyhzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBjb25zdCBjdXIgPSBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50O1xuICAgIGNvbnN0IGJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gICAgaWYgKGN1ciAmJiBib3VuZHMpIHtcbiAgICAgIGNvbnN0IGRlc3QgPVxuICAgICAgICBnZXRLZXlBdERvbVBvcyhjdXIucG9zLCBzZW50ZVBvdihzdGF0ZS5vcmllbnRhdGlvbiksIHN0YXRlLmRpbWVuc2lvbnMsIGJvdW5kcykgfHxcbiAgICAgICAgZ2V0SGFuZFBpZWNlQXREb21Qb3MoY3VyLnBvcywgc3RhdGUuaGFuZHMucm9sZXMsIHN0YXRlLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMoKSk7XG4gICAgICBpZiAoY3VyLmRlc3QgIT09IGRlc3QgJiYgIShjdXIuZGVzdCAmJiBkZXN0ICYmIHNhbWVQaWVjZU9yS2V5KGRlc3QsIGN1ci5kZXN0KSkpIHtcbiAgICAgICAgY3VyLmRlc3QgPSBkZXN0O1xuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3Tm93KCk7XG4gICAgICB9XG4gICAgICBjb25zdCBvdXRQb3MgPSBwb3NPZk91dHNpZGVFbChcbiAgICAgICAgY3VyLnBvc1swXSxcbiAgICAgICAgY3VyLnBvc1sxXSxcbiAgICAgICAgc2VudGVQb3Yoc3RhdGUub3JpZW50YXRpb24pLFxuICAgICAgICBzdGF0ZS5kaW1lbnNpb25zLFxuICAgICAgICBib3VuZHMsXG4gICAgICApO1xuICAgICAgaWYgKCFjdXIuZGVzdCAmJiBjdXIuYXJyb3cgJiYgb3V0UG9zKSB7XG4gICAgICAgIGNvbnN0IGRlc3QgPSBwb3MydXNlcihvdXRQb3MsIHN0YXRlLm9yaWVudGF0aW9uLCBzdGF0ZS5kaW1lbnNpb25zLCBzdGF0ZS5zcXVhcmVSYXRpbyk7XG5cbiAgICAgICAgc2V0QXR0cmlidXRlcyhjdXIuYXJyb3csIHtcbiAgICAgICAgICB4MjogZGVzdFswXSAtIHN0YXRlLnNxdWFyZVJhdGlvWzBdIC8gMixcbiAgICAgICAgICB5MjogZGVzdFsxXSAtIHN0YXRlLnNxdWFyZVJhdGlvWzFdIC8gMixcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBwcm9jZXNzRHJhdyhzdGF0ZSk7XG4gICAgfVxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmUoc3RhdGU6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGNvbnN0IHBvcyA9IGV2ZW50UG9zaXRpb24oZSk7XG4gIGlmIChwb3MgJiYgc3RhdGUuZHJhd2FibGUuY3VycmVudCkgc3RhdGUuZHJhd2FibGUuY3VycmVudC5wb3MgPSBwb3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmQoc3RhdGU6IFN0YXRlLCBfOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQ7XG4gIGlmIChjdXIpIHtcbiAgICBhZGRTaGFwZShzdGF0ZS5kcmF3YWJsZSwgY3VyKTtcbiAgICBjYW5jZWwoc3RhdGUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWwoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5kcmF3YWJsZS5jdXJyZW50KSB7XG4gICAgc3RhdGUuZHJhd2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBjb25zdCBkcmF3YWJsZUxlbmd0aCA9IHN0YXRlLmRyYXdhYmxlLnNoYXBlcy5sZW5ndGg7XG4gIGlmIChkcmF3YWJsZUxlbmd0aCB8fCBzdGF0ZS5kcmF3YWJsZS5waWVjZSkge1xuICAgIHN0YXRlLmRyYXdhYmxlLnNoYXBlcyA9IFtdO1xuICAgIHN0YXRlLmRyYXdhYmxlLnBpZWNlID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICBpZiAoZHJhd2FibGVMZW5ndGgpIG9uQ2hhbmdlKHN0YXRlLmRyYXdhYmxlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0RHJhd1BpZWNlKHN0YXRlOiBTdGF0ZSwgcGllY2U6IHNnLlBpZWNlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5kcmF3YWJsZS5waWVjZSAmJiBzYW1lUGllY2Uoc3RhdGUuZHJhd2FibGUucGllY2UsIHBpZWNlKSlcbiAgICBzdGF0ZS5kcmF3YWJsZS5waWVjZSA9IHVuZGVmaW5lZDtcbiAgZWxzZSBzdGF0ZS5kcmF3YWJsZS5waWVjZSA9IHBpZWNlO1xuICBzdGF0ZS5kb20ucmVkcmF3KCk7XG59XG5cbmZ1bmN0aW9uIGV2ZW50QnJ1c2goZTogc2cuTW91Y2hFdmVudCwgYWxsb3dGaXJzdE1vZGlmaWVyOiBib29sZWFuKTogc3RyaW5nIHtcbiAgY29uc3QgbW9kQSA9IGFsbG93Rmlyc3RNb2RpZmllciAmJiAoZS5zaGlmdEtleSB8fCBlLmN0cmxLZXkpO1xuICBjb25zdCBtb2RCID0gZS5hbHRLZXkgfHwgZS5tZXRhS2V5IHx8IGUuZ2V0TW9kaWZpZXJTdGF0ZT8uKCdBbHRHcmFwaCcpO1xuICByZXR1cm4gYnJ1c2hlc1sobW9kQSA/IDEgOiAwKSArIChtb2RCID8gMiA6IDApXTtcbn1cblxuZnVuY3Rpb24gYWRkU2hhcGUoZHJhd2FibGU6IERyYXdhYmxlLCBjdXI6IERyYXdDdXJyZW50KTogdm9pZCB7XG4gIGlmICghY3VyLmRlc3QpIHJldHVybjtcblxuICBjb25zdCBzaW1pbGFyU2hhcGUgPSAoczogRHJhd1NoYXBlKSA9PlxuICAgIGN1ci5kZXN0ICYmIHNhbWVQaWVjZU9yS2V5KGN1ci5vcmlnLCBzLm9yaWcpICYmIHNhbWVQaWVjZU9yS2V5KGN1ci5kZXN0LCBzLmRlc3QpO1xuXG4gIC8vIHNlcGFyYXRlIHNoYXBlIGZvciBwaWVjZXNcbiAgY29uc3QgcGllY2UgPSBjdXIucGllY2U7XG4gIGN1ci5waWVjZSA9IHVuZGVmaW5lZDtcblxuICBjb25zdCBzaW1pbGFyID0gZHJhd2FibGUuc2hhcGVzLmZpbmQoc2ltaWxhclNoYXBlKTtcbiAgY29uc3QgcmVtb3ZlUGllY2UgPSBkcmF3YWJsZS5zaGFwZXMuZmluZChcbiAgICAocykgPT4gc2ltaWxhclNoYXBlKHMpICYmIHBpZWNlICYmIHMucGllY2UgJiYgc2FtZVBpZWNlKHBpZWNlLCBzLnBpZWNlKSxcbiAgKTtcbiAgY29uc3QgZGlmZlBpZWNlID0gZHJhd2FibGUuc2hhcGVzLmZpbmQoXG4gICAgKHMpID0+IHNpbWlsYXJTaGFwZShzKSAmJiBwaWVjZSAmJiBzLnBpZWNlICYmICFzYW1lUGllY2UocGllY2UsIHMucGllY2UpLFxuICApO1xuXG4gIC8vIHJlbW92ZSBldmVyeSBzaW1pbGFyIHNoYXBlXG4gIGlmIChzaW1pbGFyKSBkcmF3YWJsZS5zaGFwZXMgPSBkcmF3YWJsZS5zaGFwZXMuZmlsdGVyKChzKSA9PiAhc2ltaWxhclNoYXBlKHMpKTtcblxuICBpZiAoIWlzUGllY2UoY3VyLm9yaWcpICYmIHBpZWNlICYmICFyZW1vdmVQaWVjZSkge1xuICAgIGRyYXdhYmxlLnNoYXBlcy5wdXNoKHtcbiAgICAgIG9yaWc6IGN1ci5vcmlnLFxuICAgICAgZGVzdDogY3VyLm9yaWcsXG4gICAgICBwaWVjZTogcGllY2UsXG4gICAgICBicnVzaDogY3VyLmJydXNoLFxuICAgIH0pO1xuICAgIC8vIGZvcmNlIGNpcmNsZSBhcm91bmQgZHJhd24gcGllY2VzXG4gICAgaWYgKCFzYW1lUGllY2VPcktleShjdXIub3JpZywgY3VyLmRlc3QpKVxuICAgICAgZHJhd2FibGUuc2hhcGVzLnB1c2goe1xuICAgICAgICBvcmlnOiBjdXIub3JpZyxcbiAgICAgICAgZGVzdDogY3VyLm9yaWcsXG4gICAgICAgIGJydXNoOiBjdXIuYnJ1c2gsXG4gICAgICB9KTtcbiAgfVxuXG4gIGlmICghc2ltaWxhciB8fCBkaWZmUGllY2UgfHwgc2ltaWxhci5icnVzaCAhPT0gY3VyLmJydXNoKSBkcmF3YWJsZS5zaGFwZXMucHVzaChjdXIgYXMgRHJhd1NoYXBlKTtcbiAgb25DaGFuZ2UoZHJhd2FibGUpO1xufVxuXG5mdW5jdGlvbiBvbkNoYW5nZShkcmF3YWJsZTogRHJhd2FibGUpOiB2b2lkIHtcbiAgaWYgKGRyYXdhYmxlLm9uQ2hhbmdlKSBkcmF3YWJsZS5vbkNoYW5nZShkcmF3YWJsZS5zaGFwZXMpO1xufVxuIiwgImltcG9ydCB7IGFuaW0gfSBmcm9tICcuL2FuaW0uanMnO1xuaW1wb3J0ICogYXMgYm9hcmQgZnJvbSAnLi9ib2FyZC5qcyc7XG5pbXBvcnQgeyBjb2xvcnMgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgeyBjbGVhciBhcyBkcmF3Q2xlYXIgfSBmcm9tICcuL2RyYXcuanMnO1xuaW1wb3J0IHsgYWRkVG9IYW5kLCBudW1iZXJJbkhhbmQsIHJlbW92ZUZyb21IYW5kIH0gZnJvbSAnLi9oYW5kcy5qcyc7XG5pbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIERyYWdDdXJyZW50IHtcbiAgcGllY2U6IHNnLlBpZWNlOyAvLyBwaWVjZSBiZWluZyBkcmFnZ2VkXG4gIHBvczogc2cuTnVtYmVyUGFpcjsgLy8gbGF0ZXN0IGV2ZW50IHBvc2l0aW9uXG4gIG9yaWdQb3M6IHNnLk51bWJlclBhaXI7IC8vIGZpcnN0IGV2ZW50IHBvc2l0aW9uXG4gIHN0YXJ0ZWQ6IGJvb2xlYW47IC8vIHdoZXRoZXIgdGhlIGRyYWcgaGFzIHN0YXJ0ZWQ7IGFzIHBlciB0aGUgZGlzdGFuY2Ugc2V0dGluZ1xuICBzcGFyZTogYm9vbGVhbjsgLy8gd2hldGhlciB0aGlzIHBpZWNlIGlzIGEgc3BhcmUgb25lXG4gIHRvdWNoOiBib29sZWFuOyAvLyB3YXMgdGhlIGRyYWdnaW5nIGluaXRpYXRlZCBmcm9tIHRvdWNoIGV2ZW50XG4gIG9yaWdpblRhcmdldDogRXZlbnRUYXJnZXQgfCBudWxsO1xuICBmcm9tQm9hcmQ/OiB7XG4gICAgb3JpZzogc2cuS2V5OyAvLyBvcmlnIGtleSBvZiBkcmFnZ2luZyBwaWVjZVxuICAgIHByZXZpb3VzbHlTZWxlY3RlZD86IHNnLktleTsgLy8gc2VsZWN0ZWQgcGllY2UgYmVmb3JlIGRyYWcgYmVnYW5cbiAgICBrZXlIYXNDaGFuZ2VkOiBib29sZWFuOyAvLyB3aGV0aGVyIHRoZSBkcmFnIGhhcyBsZWZ0IHRoZSBvcmlnIGtleSBvciBwaWVjZVxuICB9O1xuICBmcm9tT3V0c2lkZT86IHtcbiAgICBvcmlnaW5Cb3VuZHM6IERPTVJlY3QgfCB1bmRlZmluZWQ7IC8vIGJvdW5kcyBvZiB0aGUgcGllY2UgdGhhdCBpbml0aWF0ZWQgdGhlIGRyYWdcbiAgICBsZWZ0T3JpZ2luOiBib29sZWFuOyAvLyBoYXZlIHdlIGV2ZXIgbGVmdCBvcmlnaW5Cb3VuZHNcbiAgICBwcmV2aW91c2x5U2VsZWN0ZWRQaWVjZT86IHNnLlBpZWNlO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnQoczogU3RhdGUsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgY29uc3QgYm91bmRzID0gcy5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpO1xuICBjb25zdCBwb3NpdGlvbiA9IHV0aWwuZXZlbnRQb3NpdGlvbihlKTtcbiAgY29uc3Qgb3JpZyA9XG4gICAgYm91bmRzICYmXG4gICAgcG9zaXRpb24gJiZcbiAgICB1dGlsLmdldEtleUF0RG9tUG9zKHBvc2l0aW9uLCB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pLCBzLmRpbWVuc2lvbnMsIGJvdW5kcyk7XG5cbiAgaWYgKCFvcmlnKSByZXR1cm47XG5cbiAgY29uc3QgcGllY2UgPSBzLnBpZWNlcy5nZXQob3JpZyk7XG4gIGNvbnN0IHByZXZpb3VzbHlTZWxlY3RlZCA9IHMuc2VsZWN0ZWQ7XG4gIGlmIChcbiAgICAhcHJldmlvdXNseVNlbGVjdGVkICYmXG4gICAgcy5kcmF3YWJsZS5lbmFibGVkICYmXG4gICAgKHMuZHJhd2FibGUuZXJhc2VPbkNsaWNrIHx8ICFwaWVjZSB8fCBwaWVjZS5jb2xvciAhPT0gcy50dXJuQ29sb3IpXG4gIClcbiAgICBkcmF3Q2xlYXIocyk7XG5cbiAgLy8gUHJldmVudCB0b3VjaCBzY3JvbGwgYW5kIGNyZWF0ZSBubyBjb3JyZXNwb25kaW5nIG1vdXNlIGV2ZW50LCBpZiB0aGVyZVxuICAvLyBpcyBhbiBpbnRlbnQgdG8gaW50ZXJhY3Qgd2l0aCB0aGUgYm9hcmQuXG4gIGlmIChcbiAgICBlLmNhbmNlbGFibGUgIT09IGZhbHNlICYmXG4gICAgKCFlLnRvdWNoZXMgfHxcbiAgICAgIHMuYmxvY2tUb3VjaFNjcm9sbCB8fFxuICAgICAgcy5zZWxlY3RlZFBpZWNlIHx8XG4gICAgICBwaWVjZSB8fFxuICAgICAgcHJldmlvdXNseVNlbGVjdGVkIHx8XG4gICAgICBwaWVjZUNsb3NlVG8ocywgcG9zaXRpb24sIGJvdW5kcykpXG4gIClcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIGNvbnN0IGhhZFByZW1vdmUgPSAhIXMucHJlbW92YWJsZS5jdXJyZW50O1xuICBjb25zdCBoYWRQcmVkcm9wID0gISFzLnByZWRyb3BwYWJsZS5jdXJyZW50O1xuICBpZiAocy5zZWxlY3RhYmxlLmRlbGV0ZU9uVG91Y2gpIGJvYXJkLmRlbGV0ZVBpZWNlKHMsIG9yaWcpO1xuICBlbHNlIGlmIChzLnNlbGVjdGVkKSB7XG4gICAgaWYgKCFib2FyZC5wcm9tb3Rpb25EaWFsb2dNb3ZlKHMsIHMuc2VsZWN0ZWQsIG9yaWcpKSB7XG4gICAgICBpZiAoYm9hcmQuY2FuTW92ZShzLCBzLnNlbGVjdGVkLCBvcmlnKSkgYW5pbSgoc3RhdGUpID0+IGJvYXJkLnNlbGVjdFNxdWFyZShzdGF0ZSwgb3JpZyksIHMpO1xuICAgICAgZWxzZSBib2FyZC5zZWxlY3RTcXVhcmUocywgb3JpZyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHMuc2VsZWN0ZWRQaWVjZSkge1xuICAgIGlmICghYm9hcmQucHJvbW90aW9uRGlhbG9nRHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIG9yaWcpKSB7XG4gICAgICBpZiAoYm9hcmQuY2FuRHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIG9yaWcpKVxuICAgICAgICBhbmltKChzdGF0ZSkgPT4gYm9hcmQuc2VsZWN0U3F1YXJlKHN0YXRlLCBvcmlnKSwgcyk7XG4gICAgICBlbHNlIGJvYXJkLnNlbGVjdFNxdWFyZShzLCBvcmlnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgYm9hcmQuc2VsZWN0U3F1YXJlKHMsIG9yaWcpO1xuICB9XG5cbiAgY29uc3Qgc3RpbGxTZWxlY3RlZCA9IHMuc2VsZWN0ZWQgPT09IG9yaWc7XG4gIGNvbnN0IGRyYWdnZWRFbCA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkPy5kcmFnZ2VkO1xuXG4gIGlmIChwaWVjZSAmJiBkcmFnZ2VkRWwgJiYgc3RpbGxTZWxlY3RlZCAmJiBib2FyZC5pc0RyYWdnYWJsZShzLCBwaWVjZSkpIHtcbiAgICBjb25zdCB0b3VjaCA9IGUudHlwZSA9PT0gJ3RvdWNoc3RhcnQnO1xuXG4gICAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHtcbiAgICAgIHBpZWNlLFxuICAgICAgcG9zOiBwb3NpdGlvbixcbiAgICAgIG9yaWdQb3M6IHBvc2l0aW9uLFxuICAgICAgc3RhcnRlZDogcy5kcmFnZ2FibGUuYXV0b0Rpc3RhbmNlICYmICF0b3VjaCxcbiAgICAgIHNwYXJlOiBmYWxzZSxcbiAgICAgIHRvdWNoLFxuICAgICAgb3JpZ2luVGFyZ2V0OiBlLnRhcmdldCxcbiAgICAgIGZyb21Cb2FyZDoge1xuICAgICAgICBvcmlnLFxuICAgICAgICBwcmV2aW91c2x5U2VsZWN0ZWQsXG4gICAgICAgIGtleUhhc0NoYW5nZWQ6IGZhbHNlLFxuICAgICAgfSxcbiAgICB9O1xuXG4gICAgZHJhZ2dlZEVsLnNnQ29sb3IgPSBwaWVjZS5jb2xvcjtcbiAgICBkcmFnZ2VkRWwuc2dSb2xlID0gcGllY2Uucm9sZTtcbiAgICBkcmFnZ2VkRWwuY2xhc3NOYW1lID0gYGRyYWdnaW5nICR7dXRpbC5waWVjZU5hbWVPZihwaWVjZSl9YDtcbiAgICBkcmFnZ2VkRWwuY2xhc3NMaXN0LnRvZ2dsZSgndG91Y2gnLCB0b3VjaCk7XG5cbiAgICBwcm9jZXNzRHJhZyhzKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoaGFkUHJlbW92ZSkgYm9hcmQudW5zZXRQcmVtb3ZlKHMpO1xuICAgIGlmIChoYWRQcmVkcm9wKSBib2FyZC51bnNldFByZWRyb3Aocyk7XG4gIH1cbiAgcy5kb20ucmVkcmF3KCk7XG59XG5cbmZ1bmN0aW9uIHBpZWNlQ2xvc2VUbyhzOiBTdGF0ZSwgcG9zOiBzZy5OdW1iZXJQYWlyLCBib3VuZHM6IERPTVJlY3QpOiBib29sZWFuIHtcbiAgY29uc3QgYXNTZW50ZSA9IHV0aWwuc2VudGVQb3Yocy5vcmllbnRhdGlvbik7XG4gIGNvbnN0IHJhZGl1c1NxID0gKGJvdW5kcy53aWR0aCAvIHMuZGltZW5zaW9ucy5maWxlcykgKiogMjtcbiAgZm9yIChjb25zdCBrZXkgb2Ygcy5waWVjZXMua2V5cygpKSB7XG4gICAgY29uc3QgY2VudGVyID0gdXRpbC5jb21wdXRlU3F1YXJlQ2VudGVyKGtleSwgYXNTZW50ZSwgcy5kaW1lbnNpb25zLCBib3VuZHMpO1xuICAgIGlmICh1dGlsLmRpc3RhbmNlU3EoY2VudGVyLCBwb3MpIDw9IHJhZGl1c1NxKSByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcmFnTmV3UGllY2UoczogU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwgZTogc2cuTW91Y2hFdmVudCwgc3BhcmU/OiBib29sZWFuKTogdm9pZCB7XG4gIGNvbnN0IHByZXZpb3VzbHlTZWxlY3RlZFBpZWNlID0gcy5zZWxlY3RlZFBpZWNlO1xuICBjb25zdCBkcmFnZ2VkRWwgPSBzLmRvbS5lbGVtZW50cy5ib2FyZD8uZHJhZ2dlZDtcbiAgY29uc3QgcG9zaXRpb24gPSB1dGlsLmV2ZW50UG9zaXRpb24oZSk7XG4gIGNvbnN0IHRvdWNoID0gZS50eXBlID09PSAndG91Y2hzdGFydCc7XG5cbiAgaWYgKCFwcmV2aW91c2x5U2VsZWN0ZWRQaWVjZSAmJiAhc3BhcmUgJiYgcy5kcmF3YWJsZS5lbmFibGVkICYmIHMuZHJhd2FibGUuZXJhc2VPbkNsaWNrKVxuICAgIGRyYXdDbGVhcihzKTtcblxuICBpZiAoIXNwYXJlICYmIHMuc2VsZWN0YWJsZS5kZWxldGVPblRvdWNoKSB7XG4gICAgcmVtb3ZlRnJvbUhhbmQocywgcGllY2UpO1xuICAgIHV0aWwuY2FsbFVzZXJGdW5jdGlvbihzLmV2ZW50cy5jaGFuZ2UpO1xuICB9IGVsc2UgYm9hcmQuc2VsZWN0UGllY2UocywgcGllY2UsIHNwYXJlKTtcblxuICBjb25zdCBoYWRQcmVtb3ZlID0gISFzLnByZW1vdmFibGUuY3VycmVudDtcbiAgY29uc3QgaGFkUHJlZHJvcCA9ICEhcy5wcmVkcm9wcGFibGUuY3VycmVudDtcbiAgY29uc3Qgc3RpbGxTZWxlY3RlZCA9IHMuc2VsZWN0ZWRQaWVjZSAmJiB1dGlsLnNhbWVQaWVjZShzLnNlbGVjdGVkUGllY2UsIHBpZWNlKTtcblxuICAvLyBQcmV2ZW50IHRvdWNoIHNjcm9sbCBhbmQgY3JlYXRlIG5vIGNvcnJlc3BvbmRpbmcgbW91c2UgZXZlbnQsIGlmIHRoZXJlXG4gIC8vIGlzIGFuIGludGVudCB0byBpbnRlcmFjdCB3aXRoIHRoZSBoYW5kcy5cbiAgaWYgKFxuICAgIGUuY2FuY2VsYWJsZSAhPT0gZmFsc2UgJiZcbiAgICAoIWUudG91Y2hlcyB8fFxuICAgICAgcy5ibG9ja1RvdWNoU2Nyb2xsIHx8XG4gICAgICBzLnNlbGVjdGVkUGllY2UgfHxcbiAgICAgIHByZXZpb3VzbHlTZWxlY3RlZFBpZWNlIHx8XG4gICAgICBzdGlsbFNlbGVjdGVkIHx8XG4gICAgICBudW1iZXJJbkhhbmQocywgcGllY2UpID4gMCB8fFxuICAgICAgKHBvc2l0aW9uICYmIGhhbmRQaWVjZUNsb3NlVG8ocywgcG9zaXRpb24pKSlcbiAgKVxuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICBpZiAoZHJhZ2dlZEVsICYmIHBvc2l0aW9uICYmIHMuc2VsZWN0ZWRQaWVjZSAmJiBzdGlsbFNlbGVjdGVkICYmIGJvYXJkLmlzRHJhZ2dhYmxlKHMsIHBpZWNlKSkge1xuICAgIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB7XG4gICAgICBwaWVjZTogcy5zZWxlY3RlZFBpZWNlLFxuICAgICAgcG9zOiBwb3NpdGlvbixcbiAgICAgIG9yaWdQb3M6IHBvc2l0aW9uLFxuICAgICAgdG91Y2gsXG4gICAgICBzdGFydGVkOiBzLmRyYWdnYWJsZS5hdXRvRGlzdGFuY2UgJiYgIXRvdWNoLFxuICAgICAgc3BhcmU6ICEhc3BhcmUsXG4gICAgICBvcmlnaW5UYXJnZXQ6IGUudGFyZ2V0LFxuICAgICAgZnJvbU91dHNpZGU6IHtcbiAgICAgICAgb3JpZ2luQm91bmRzOiAhc3BhcmVcbiAgICAgICAgICA/IHMuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcygpLmdldCh1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKSlcbiAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgbGVmdE9yaWdpbjogZmFsc2UsXG4gICAgICAgIHByZXZpb3VzbHlTZWxlY3RlZFBpZWNlOiAhc3BhcmUgPyBwcmV2aW91c2x5U2VsZWN0ZWRQaWVjZSA6IHVuZGVmaW5lZCxcbiAgICAgIH0sXG4gICAgfTtcblxuICAgIGRyYWdnZWRFbC5zZ0NvbG9yID0gcGllY2UuY29sb3I7XG4gICAgZHJhZ2dlZEVsLnNnUm9sZSA9IHBpZWNlLnJvbGU7XG4gICAgZHJhZ2dlZEVsLmNsYXNzTmFtZSA9IGBkcmFnZ2luZyAke3V0aWwucGllY2VOYW1lT2YocGllY2UpfWA7XG4gICAgZHJhZ2dlZEVsLmNsYXNzTGlzdC50b2dnbGUoJ3RvdWNoJywgdG91Y2gpO1xuXG4gICAgcHJvY2Vzc0RyYWcocyk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGhhZFByZW1vdmUpIGJvYXJkLnVuc2V0UHJlbW92ZShzKTtcbiAgICBpZiAoaGFkUHJlZHJvcCkgYm9hcmQudW5zZXRQcmVkcm9wKHMpO1xuICB9XG4gIHMuZG9tLnJlZHJhdygpO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzRHJhZyhzOiBTdGF0ZSk6IHZvaWQge1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIGNvbnN0IGN1ciA9IHMuZHJhZ2dhYmxlLmN1cnJlbnQ7XG4gICAgY29uc3QgZHJhZ2dlZEVsID0gcy5kb20uZWxlbWVudHMuYm9hcmQ/LmRyYWdnZWQ7XG4gICAgY29uc3QgYm91bmRzID0gcy5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpO1xuICAgIGlmICghY3VyIHx8ICFkcmFnZ2VkRWwgfHwgIWJvdW5kcykgcmV0dXJuO1xuICAgIC8vIGNhbmNlbCBhbmltYXRpb25zIHdoaWxlIGRyYWdnaW5nXG4gICAgaWYgKGN1ci5mcm9tQm9hcmQ/Lm9yaWcgJiYgcy5hbmltYXRpb24uY3VycmVudD8ucGxhbi5hbmltcy5oYXMoY3VyLmZyb21Cb2FyZC5vcmlnKSlcbiAgICAgIHMuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgLy8gaWYgbW92aW5nIHBpZWNlIGlzIGdvbmUsIGNhbmNlbFxuICAgIGNvbnN0IG9yaWdQaWVjZSA9IGN1ci5mcm9tQm9hcmQgPyBzLnBpZWNlcy5nZXQoY3VyLmZyb21Cb2FyZC5vcmlnKSA6IGN1ci5waWVjZTtcbiAgICBpZiAoIW9yaWdQaWVjZSB8fCAhdXRpbC5zYW1lUGllY2Uob3JpZ1BpZWNlLCBjdXIucGllY2UpKSBjYW5jZWwocyk7XG4gICAgZWxzZSB7XG4gICAgICBpZiAoIWN1ci5zdGFydGVkICYmIHV0aWwuZGlzdGFuY2VTcShjdXIucG9zLCBjdXIub3JpZ1BvcykgPj0gcy5kcmFnZ2FibGUuZGlzdGFuY2UgKiogMikge1xuICAgICAgICBjdXIuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgIHMuZG9tLnJlZHJhdygpO1xuICAgICAgfVxuICAgICAgaWYgKGN1ci5zdGFydGVkKSB7XG4gICAgICAgIHV0aWwudHJhbnNsYXRlQWJzKFxuICAgICAgICAgIGRyYWdnZWRFbCxcbiAgICAgICAgICBbXG4gICAgICAgICAgICBjdXIucG9zWzBdIC0gYm91bmRzLmxlZnQgLSBib3VuZHMud2lkdGggLyAocy5kaW1lbnNpb25zLmZpbGVzICogMiksXG4gICAgICAgICAgICBjdXIucG9zWzFdIC0gYm91bmRzLnRvcCAtIGJvdW5kcy5oZWlnaHQgLyAocy5kaW1lbnNpb25zLnJhbmtzICogMiksXG4gICAgICAgICAgXSxcbiAgICAgICAgICBzLnNjYWxlRG93blBpZWNlcyA/IDAuNSA6IDEsXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKCFkcmFnZ2VkRWwuc2dEcmFnZ2luZykge1xuICAgICAgICAgIGRyYWdnZWRFbC5zZ0RyYWdnaW5nID0gdHJ1ZTtcbiAgICAgICAgICB1dGlsLnNldERpc3BsYXkoZHJhZ2dlZEVsLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBob3ZlciA9IHV0aWwuZ2V0S2V5QXREb21Qb3MoXG4gICAgICAgICAgY3VyLnBvcyxcbiAgICAgICAgICB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pLFxuICAgICAgICAgIHMuZGltZW5zaW9ucyxcbiAgICAgICAgICBib3VuZHMsXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKGN1ci5mcm9tQm9hcmQpXG4gICAgICAgICAgY3VyLmZyb21Cb2FyZC5rZXlIYXNDaGFuZ2VkID0gY3VyLmZyb21Cb2FyZC5rZXlIYXNDaGFuZ2VkIHx8IGN1ci5mcm9tQm9hcmQub3JpZyAhPT0gaG92ZXI7XG4gICAgICAgIGVsc2UgaWYgKGN1ci5mcm9tT3V0c2lkZSlcbiAgICAgICAgICBjdXIuZnJvbU91dHNpZGUubGVmdE9yaWdpbiA9XG4gICAgICAgICAgICBjdXIuZnJvbU91dHNpZGUubGVmdE9yaWdpbiB8fFxuICAgICAgICAgICAgKCEhY3VyLmZyb21PdXRzaWRlLm9yaWdpbkJvdW5kcyAmJlxuICAgICAgICAgICAgICAhdXRpbC5pc0luc2lkZVJlY3QoY3VyLmZyb21PdXRzaWRlLm9yaWdpbkJvdW5kcywgY3VyLnBvcykpO1xuXG4gICAgICAgIC8vIGlmIHRoZSBob3ZlcmVkIHNxdWFyZSBjaGFuZ2VkXG4gICAgICAgIGlmIChob3ZlciAhPT0gcy5ob3ZlcmVkKSB7XG4gICAgICAgICAgdXBkYXRlSG92ZXJlZFNxdWFyZXMocywgaG92ZXIpO1xuICAgICAgICAgIGlmIChjdXIudG91Y2ggJiYgcy5kb20uZWxlbWVudHMuYm9hcmQ/LnNxdWFyZU92ZXIpIHtcbiAgICAgICAgICAgIGlmIChob3ZlciAmJiBzLmRyYWdnYWJsZS5zaG93VG91Y2hTcXVhcmVPdmVybGF5KSB7XG4gICAgICAgICAgICAgIHV0aWwudHJhbnNsYXRlQWJzKFxuICAgICAgICAgICAgICAgIHMuZG9tLmVsZW1lbnRzLmJvYXJkLnNxdWFyZU92ZXIsXG4gICAgICAgICAgICAgICAgdXRpbC5wb3NUb1RyYW5zbGF0ZUFicyhzLmRpbWVuc2lvbnMsIGJvdW5kcykoXG4gICAgICAgICAgICAgICAgICB1dGlsLmtleTJwb3MoaG92ZXIpLFxuICAgICAgICAgICAgICAgICAgdXRpbC5zZW50ZVBvdihzLm9yaWVudGF0aW9uKSxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIHV0aWwuc2V0RGlzcGxheShzLmRvbS5lbGVtZW50cy5ib2FyZC5zcXVhcmVPdmVyLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHV0aWwuc2V0RGlzcGxheShzLmRvbS5lbGVtZW50cy5ib2FyZC5zcXVhcmVPdmVyLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHByb2Nlc3NEcmFnKHMpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmUoczogU3RhdGUsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgLy8gc3VwcG9ydCBvbmUgZmluZ2VyIHRvdWNoIG9ubHlcbiAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQgJiYgKCFlLnRvdWNoZXMgfHwgZS50b3VjaGVzLmxlbmd0aCA8IDIpKSB7XG4gICAgY29uc3QgcG9zID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpO1xuICAgIGlmIChwb3MpIHMuZHJhZ2dhYmxlLmN1cnJlbnQucG9zID0gcG9zO1xuICB9IGVsc2UgaWYgKFxuICAgIChzLnNlbGVjdGVkIHx8IHMuc2VsZWN0ZWRQaWVjZSB8fCBzLmhpZ2hsaWdodC5ob3ZlcmVkKSAmJlxuICAgICFzLmRyYWdnYWJsZS5jdXJyZW50ICYmXG4gICAgKCFlLnRvdWNoZXMgfHwgZS50b3VjaGVzLmxlbmd0aCA8IDIpXG4gICkge1xuICAgIGNvbnN0IHBvcyA9IHV0aWwuZXZlbnRQb3NpdGlvbihlKTtcbiAgICBjb25zdCBib3VuZHMgPSBzLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gICAgY29uc3QgaG92ZXIgPVxuICAgICAgcG9zICYmIGJvdW5kcyAmJiB1dGlsLmdldEtleUF0RG9tUG9zKHBvcywgdXRpbC5zZW50ZVBvdihzLm9yaWVudGF0aW9uKSwgcy5kaW1lbnNpb25zLCBib3VuZHMpO1xuICAgIGlmIChob3ZlciAhPT0gcy5ob3ZlcmVkKSB1cGRhdGVIb3ZlcmVkU3F1YXJlcyhzLCBob3Zlcik7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuZChzOiBTdGF0ZSwgZTogc2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICBjb25zdCBjdXIgPSBzLmRyYWdnYWJsZS5jdXJyZW50O1xuICBpZiAoIWN1cikgcmV0dXJuO1xuICAvLyBjcmVhdGUgbm8gY29ycmVzcG9uZGluZyBtb3VzZSBldmVudFxuICBpZiAoZS50eXBlID09PSAndG91Y2hlbmQnICYmIGUuY2FuY2VsYWJsZSAhPT0gZmFsc2UpIGUucHJldmVudERlZmF1bHQoKTtcbiAgLy8gY29tcGFyaW5nIHdpdGggdGhlIG9yaWdpbiB0YXJnZXQgaXMgYW4gZWFzeSB3YXkgdG8gdGVzdCB0aGF0IHRoZSBlbmQgZXZlbnRcbiAgLy8gaGFzIHRoZSBzYW1lIHRvdWNoIG9yaWdpblxuICBpZiAoZS50eXBlID09PSAndG91Y2hlbmQnICYmIGN1ci5vcmlnaW5UYXJnZXQgIT09IGUudGFyZ2V0ICYmICFjdXIuZnJvbU91dHNpZGUpIHtcbiAgICBzLmRyYWdnYWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGlmIChzLmhvdmVyZWQgJiYgIXMuaGlnaGxpZ2h0LmhvdmVyZWQpIHVwZGF0ZUhvdmVyZWRTcXVhcmVzKHMsIHVuZGVmaW5lZCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGJvYXJkLnVuc2V0UHJlbW92ZShzKTtcbiAgYm9hcmQudW5zZXRQcmVkcm9wKHMpO1xuICAvLyB0b3VjaGVuZCBoYXMgbm8gcG9zaXRpb247IHNvIHVzZSB0aGUgbGFzdCB0b3VjaG1vdmUgcG9zaXRpb24gaW5zdGVhZFxuICBjb25zdCBldmVudFBvcyA9IHV0aWwuZXZlbnRQb3NpdGlvbihlKSB8fCBjdXIucG9zO1xuICBjb25zdCBib3VuZHMgPSBzLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gIGNvbnN0IGRlc3QgPVxuICAgIGJvdW5kcyAmJiB1dGlsLmdldEtleUF0RG9tUG9zKGV2ZW50UG9zLCB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pLCBzLmRpbWVuc2lvbnMsIGJvdW5kcyk7XG5cbiAgaWYgKGRlc3QgJiYgY3VyLnN0YXJ0ZWQgJiYgY3VyLmZyb21Cb2FyZD8ub3JpZyAhPT0gZGVzdCkge1xuICAgIGlmIChjdXIuZnJvbU91dHNpZGUgJiYgIWJvYXJkLnByb21vdGlvbkRpYWxvZ0Ryb3AocywgY3VyLnBpZWNlLCBkZXN0KSlcbiAgICAgIGJvYXJkLnVzZXJEcm9wKHMsIGN1ci5waWVjZSwgZGVzdCk7XG4gICAgZWxzZSBpZiAoY3VyLmZyb21Cb2FyZCAmJiAhYm9hcmQucHJvbW90aW9uRGlhbG9nTW92ZShzLCBjdXIuZnJvbUJvYXJkLm9yaWcsIGRlc3QpKVxuICAgICAgYm9hcmQudXNlck1vdmUocywgY3VyLmZyb21Cb2FyZC5vcmlnLCBkZXN0KTtcbiAgfSBlbHNlIGlmIChzLmRyYWdnYWJsZS5kZWxldGVPbkRyb3BPZmYgJiYgIWRlc3QpIHtcbiAgICBpZiAoY3VyLmZyb21Cb2FyZCkgcy5waWVjZXMuZGVsZXRlKGN1ci5mcm9tQm9hcmQub3JpZyk7XG4gICAgZWxzZSBpZiAoY3VyLmZyb21PdXRzaWRlICYmICFjdXIuc3BhcmUpIHJlbW92ZUZyb21IYW5kKHMsIGN1ci5waWVjZSk7XG5cbiAgICBpZiAocy5kcmFnZ2FibGUuYWRkVG9IYW5kT25Ecm9wT2ZmKSB7XG4gICAgICBjb25zdCBoYW5kQm91bmRzID0gcy5kb20uYm91bmRzLmhhbmRzLmJvdW5kcygpO1xuICAgICAgY29uc3QgaGFuZEJvdW5kc1RvcCA9IGhhbmRCb3VuZHMuZ2V0KCd0b3AnKTtcbiAgICAgIGNvbnN0IGhhbmRCb3VuZHNCb3R0b20gPSBoYW5kQm91bmRzLmdldCgnYm90dG9tJyk7XG4gICAgICBpZiAoaGFuZEJvdW5kc1RvcCAmJiB1dGlsLmlzSW5zaWRlUmVjdChoYW5kQm91bmRzVG9wLCBjdXIucG9zKSlcbiAgICAgICAgYWRkVG9IYW5kKHMsIHtcbiAgICAgICAgICBjb2xvcjogdXRpbC5vcHBvc2l0ZShzLm9yaWVudGF0aW9uKSxcbiAgICAgICAgICByb2xlOiBjdXIucGllY2Uucm9sZSxcbiAgICAgICAgfSk7XG4gICAgICBlbHNlIGlmIChoYW5kQm91bmRzQm90dG9tICYmIHV0aWwuaXNJbnNpZGVSZWN0KGhhbmRCb3VuZHNCb3R0b20sIGN1ci5wb3MpKVxuICAgICAgICBhZGRUb0hhbmQocywgeyBjb2xvcjogcy5vcmllbnRhdGlvbiwgcm9sZTogY3VyLnBpZWNlLnJvbGUgfSk7XG5cbiAgICAgIGJvYXJkLnVuc2VsZWN0KHMpO1xuICAgIH1cbiAgICB1dGlsLmNhbGxVc2VyRnVuY3Rpb24ocy5ldmVudHMuY2hhbmdlKTtcbiAgfVxuXG4gIGlmIChcbiAgICBjdXIuZnJvbUJvYXJkICYmXG4gICAgKGN1ci5mcm9tQm9hcmQub3JpZyA9PT0gY3VyLmZyb21Cb2FyZC5wcmV2aW91c2x5U2VsZWN0ZWQgfHwgY3VyLmZyb21Cb2FyZC5rZXlIYXNDaGFuZ2VkKSAmJlxuICAgIChjdXIuZnJvbUJvYXJkLm9yaWcgPT09IGRlc3QgfHwgIWRlc3QpXG4gICkge1xuICAgIHVuc2VsZWN0KHMsIGN1ciwgZGVzdCk7XG4gIH0gZWxzZSBpZiAoXG4gICAgKCFkZXN0ICYmIGN1ci5mcm9tT3V0c2lkZT8ubGVmdE9yaWdpbikgfHxcbiAgICAoY3VyLmZyb21PdXRzaWRlPy5vcmlnaW5Cb3VuZHMgJiZcbiAgICAgIHV0aWwuaXNJbnNpZGVSZWN0KGN1ci5mcm9tT3V0c2lkZS5vcmlnaW5Cb3VuZHMsIGN1ci5wb3MpICYmXG4gICAgICBjdXIuZnJvbU91dHNpZGUucHJldmlvdXNseVNlbGVjdGVkUGllY2UgJiZcbiAgICAgIHV0aWwuc2FtZVBpZWNlKGN1ci5mcm9tT3V0c2lkZS5wcmV2aW91c2x5U2VsZWN0ZWRQaWVjZSwgY3VyLnBpZWNlKSlcbiAgKSB7XG4gICAgdW5zZWxlY3QocywgY3VyLCBkZXN0KTtcbiAgfSBlbHNlIGlmICghcy5zZWxlY3RhYmxlLmVuYWJsZWQgJiYgIXMucHJvbW90aW9uLmN1cnJlbnQpIHtcbiAgICB1bnNlbGVjdChzLCBjdXIsIGRlc3QpO1xuICB9XG5cbiAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgaWYgKCFzLmhpZ2hsaWdodC5ob3ZlcmVkICYmICFzLnByb21vdGlvbi5jdXJyZW50KSBzLmhvdmVyZWQgPSB1bmRlZmluZWQ7XG4gIHMuZG9tLnJlZHJhdygpO1xufVxuXG5mdW5jdGlvbiBoYW5kUGllY2VDbG9zZVRvKHM6IFN0YXRlLCBwb3M6IHNnLk51bWJlclBhaXIpOiBib29sZWFuIHtcbiAgZm9yIChjb25zdCBjb2xvciBvZiBjb2xvcnMpIHtcbiAgICBmb3IgKGNvbnN0IHJvbGUgb2Ygcy5oYW5kcy5yb2xlcykge1xuICAgICAgY29uc3QgcGllY2UgPSB7IGNvbG9yLCByb2xlIH07XG4gICAgICBjb25zdCByZWN0ID0gcy5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzKCkuZ2V0KHV0aWwucGllY2VOYW1lT2YocGllY2UpKTtcblxuICAgICAgaWYgKHJlY3QgJiYgdXRpbC5pc05lYXJSZWN0KHJlY3QsIHBvcywgcmVjdC53aWR0aCAvIDIpICYmIG51bWJlckluSGFuZChzLCBwaWVjZSkgPiAwKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHVuc2VsZWN0KHM6IFN0YXRlLCBjdXI6IERyYWdDdXJyZW50LCBkZXN0Pzogc2cuS2V5KTogdm9pZCB7XG4gIGlmIChjdXIuZnJvbUJvYXJkICYmIGN1ci5mcm9tQm9hcmQub3JpZyA9PT0gZGVzdClcbiAgICB1dGlsLmNhbGxVc2VyRnVuY3Rpb24ocy5ldmVudHMudW5zZWxlY3QsIGN1ci5mcm9tQm9hcmQub3JpZyk7XG4gIGVsc2UgaWYgKFxuICAgIGN1ci5mcm9tT3V0c2lkZT8ub3JpZ2luQm91bmRzICYmXG4gICAgdXRpbC5pc0luc2lkZVJlY3QoY3VyLmZyb21PdXRzaWRlLm9yaWdpbkJvdW5kcywgY3VyLnBvcylcbiAgKVxuICAgIHV0aWwuY2FsbFVzZXJGdW5jdGlvbihzLmV2ZW50cy5waWVjZVVuc2VsZWN0LCBjdXIucGllY2UpO1xuICBib2FyZC51bnNlbGVjdChzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbmNlbChzOiBTdGF0ZSk6IHZvaWQge1xuICBpZiAocy5kcmFnZ2FibGUuY3VycmVudCkge1xuICAgIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgaWYgKCFzLmhpZ2hsaWdodC5ob3ZlcmVkKSBzLmhvdmVyZWQgPSB1bmRlZmluZWQ7XG4gICAgYm9hcmQudW5zZWxlY3Qocyk7XG4gICAgcy5kb20ucmVkcmF3KCk7XG4gIH1cbn1cblxuLy8gc3VwcG9ydCBvbmUgZmluZ2VyIHRvdWNoIG9ubHkgb3IgbGVmdCBjbGlja1xuZXhwb3J0IGZ1bmN0aW9uIHVud2FudGVkRXZlbnQoZTogc2cuTW91Y2hFdmVudCk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgICFlLmlzVHJ1c3RlZCB8fFxuICAgIChlLmJ1dHRvbiAhPT0gdW5kZWZpbmVkICYmIGUuYnV0dG9uICE9PSAwKSB8fFxuICAgICghIWUudG91Y2hlcyAmJiBlLnRvdWNoZXMubGVuZ3RoID4gMSlcbiAgKTtcbn1cblxuZnVuY3Rpb24gdmFsaWREZXN0VG9Ib3ZlcihzOiBTdGF0ZSwga2V5OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICAoISFzLnNlbGVjdGVkICYmIChib2FyZC5jYW5Nb3ZlKHMsIHMuc2VsZWN0ZWQsIGtleSkgfHwgYm9hcmQuY2FuUHJlbW92ZShzLCBzLnNlbGVjdGVkLCBrZXkpKSkgfHxcbiAgICAoISFzLnNlbGVjdGVkUGllY2UgJiZcbiAgICAgIChib2FyZC5jYW5Ecm9wKHMsIHMuc2VsZWN0ZWRQaWVjZSwga2V5KSB8fCBib2FyZC5jYW5QcmVkcm9wKHMsIHMuc2VsZWN0ZWRQaWVjZSwga2V5KSkpXG4gICk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUhvdmVyZWRTcXVhcmVzKHM6IFN0YXRlLCBrZXk6IHNnLktleSB8IHVuZGVmaW5lZCk6IHZvaWQge1xuICBjb25zdCBzcWF1cmVFbHMgPSBzLmRvbS5lbGVtZW50cy5ib2FyZD8uc3F1YXJlcy5jaGlsZHJlbjtcbiAgaWYgKCFzcWF1cmVFbHMgfHwgcy5wcm9tb3Rpb24uY3VycmVudCkgcmV0dXJuO1xuXG4gIGNvbnN0IHByZXZIb3ZlciA9IHMuaG92ZXJlZDtcbiAgaWYgKHMuaGlnaGxpZ2h0LmhvdmVyZWQgfHwgKGtleSAmJiB2YWxpZERlc3RUb0hvdmVyKHMsIGtleSkpKSBzLmhvdmVyZWQgPSBrZXk7XG4gIGVsc2Ugcy5ob3ZlcmVkID0gdW5kZWZpbmVkO1xuXG4gIGNvbnN0IGFzU2VudGUgPSB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pO1xuICBjb25zdCBjdXJJbmRleCA9IHMuaG92ZXJlZCAmJiB1dGlsLmRvbVNxdWFyZUluZGV4T2ZLZXkocy5ob3ZlcmVkLCBhc1NlbnRlLCBzLmRpbWVuc2lvbnMpO1xuICBjb25zdCBjdXJIb3ZlckVsID0gY3VySW5kZXggIT09IHVuZGVmaW5lZCAmJiBzcWF1cmVFbHNbY3VySW5kZXhdO1xuICBpZiAoY3VySG92ZXJFbCkgY3VySG92ZXJFbC5jbGFzc0xpc3QuYWRkKCdob3ZlcicpO1xuXG4gIGNvbnN0IHByZXZJbmRleCA9IHByZXZIb3ZlciAmJiB1dGlsLmRvbVNxdWFyZUluZGV4T2ZLZXkocHJldkhvdmVyLCBhc1NlbnRlLCBzLmRpbWVuc2lvbnMpO1xuICBjb25zdCBwcmV2SG92ZXJFbCA9IHByZXZJbmRleCAhPT0gdW5kZWZpbmVkICYmIHNxYXVyZUVsc1twcmV2SW5kZXhdO1xuICBpZiAocHJldkhvdmVyRWwpIHByZXZIb3ZlckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hvdmVyJyk7XG59XG4iLCAiaW1wb3J0IHsgYW5pbSB9IGZyb20gJy4vYW5pbS5qcyc7XG5pbXBvcnQgeyBjYW5jZWxQcm9tb3Rpb24sIHNlbGVjdFNxdWFyZSwgdXNlckRyb3AsIHVzZXJNb3ZlIH0gZnJvbSAnLi9ib2FyZC5qcyc7XG5pbXBvcnQgKiBhcyBkcmFnIGZyb20gJy4vZHJhZy5qcyc7XG5pbXBvcnQgKiBhcyBkcmF3IGZyb20gJy4vZHJhdy5qcyc7XG5pbXBvcnQgeyB1c2VzQm91bmRzIH0gZnJvbSAnLi9zaGFwZXMuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7XG4gIGNhbGxVc2VyRnVuY3Rpb24sXG4gIGV2ZW50UG9zaXRpb24sXG4gIGdldEhhbmRQaWVjZUF0RG9tUG9zLFxuICBpc01pZGRsZUJ1dHRvbixcbiAgaXNQaWVjZU5vZGUsXG4gIGlzUmlnaHRCdXR0b24sXG4gIHNhbWVQaWVjZSxcbn0gZnJvbSAnLi91dGlsLmpzJztcblxudHlwZSBNb3VjaEJpbmQgPSAoZTogc2cuTW91Y2hFdmVudCkgPT4gdm9pZDtcbnR5cGUgU3RhdGVNb3VjaEJpbmQgPSAoZDogU3RhdGUsIGU6IHNnLk1vdWNoRXZlbnQpID0+IHZvaWQ7XG5cbmZ1bmN0aW9uIGNsZWFyQm91bmRzKHM6IFN0YXRlKTogdm9pZCB7XG4gIHMuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMuY2xlYXIoKTtcbiAgcy5kb20uYm91bmRzLmhhbmRzLmJvdW5kcy5jbGVhcigpO1xuICBzLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMuY2xlYXIoKTtcbn1cblxuZnVuY3Rpb24gb25SZXNpemUoczogU3RhdGUpOiAoKSA9PiB2b2lkIHtcbiAgcmV0dXJuICgpID0+IHtcbiAgICBjbGVhckJvdW5kcyhzKTtcbiAgICBpZiAodXNlc0JvdW5kcyhzLmRyYXdhYmxlLnNoYXBlcy5jb25jYXQocy5kcmF3YWJsZS5hdXRvU2hhcGVzKSkpIHMuZG9tLnJlZHJhd1NoYXBlcygpO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmluZEJvYXJkKHM6IFN0YXRlLCBib2FyZEVsczogc2cuQm9hcmRFbGVtZW50cyk6IHZvaWQge1xuICBpZiAoJ1Jlc2l6ZU9ic2VydmVyJyBpbiB3aW5kb3cpIG5ldyBSZXNpemVPYnNlcnZlcihvblJlc2l6ZShzKSkub2JzZXJ2ZShib2FyZEVscy5ib2FyZCk7XG5cbiAgaWYgKHMudmlld09ubHkpIHJldHVybjtcblxuICBjb25zdCBwaWVjZXNFbCA9IGJvYXJkRWxzLnBpZWNlcztcbiAgY29uc3QgcHJvbW90aW9uRWwgPSBib2FyZEVscy5wcm9tb3Rpb247XG5cbiAgLy8gQ2Fubm90IGJlIHBhc3NpdmUsIGJlY2F1c2Ugd2UgcHJldmVudCB0b3VjaCBzY3JvbGxpbmcgYW5kIGRyYWdnaW5nIG9mIHNlbGVjdGVkIGVsZW1lbnRzLlxuICBjb25zdCBvblN0YXJ0ID0gc3RhcnREcmFnT3JEcmF3KHMpO1xuICBwaWVjZXNFbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25TdGFydCBhcyBFdmVudExpc3RlbmVyLCB7XG4gICAgcGFzc2l2ZTogZmFsc2UsXG4gIH0pO1xuICBwaWVjZXNFbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvblN0YXJ0IGFzIEV2ZW50TGlzdGVuZXIsIHtcbiAgICBwYXNzaXZlOiBmYWxzZSxcbiAgfSk7XG4gIGlmIChzLmRpc2FibGVDb250ZXh0TWVudSB8fCBzLmRyYXdhYmxlLmVuYWJsZWQpXG4gICAgcGllY2VzRWwuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcblxuICBpZiAocHJvbW90aW9uRWwpIHtcbiAgICBjb25zdCBwaWVjZVNlbGVjdGlvbiA9IChlOiBzZy5Nb3VjaEV2ZW50KSA9PiBwcm9tb3RlKHMsIGUpO1xuICAgIHByb21vdGlvbkVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcGllY2VTZWxlY3Rpb24gYXMgRXZlbnRMaXN0ZW5lcik7XG4gICAgaWYgKHMuZGlzYWJsZUNvbnRleHRNZW51KVxuICAgICAgcHJvbW90aW9uRWwuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYmluZEhhbmQoczogU3RhdGUsIGhhbmRFbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgaWYgKCdSZXNpemVPYnNlcnZlcicgaW4gd2luZG93KSBuZXcgUmVzaXplT2JzZXJ2ZXIob25SZXNpemUocykpLm9ic2VydmUoaGFuZEVsKTtcblxuICBpZiAocy52aWV3T25seSkgcmV0dXJuO1xuXG4gIGNvbnN0IG9uU3RhcnQgPSBzdGFydERyYWdGcm9tSGFuZChzKTtcbiAgaGFuZEVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uU3RhcnQgYXMgRXZlbnRMaXN0ZW5lciwgeyBwYXNzaXZlOiBmYWxzZSB9KTtcbiAgaGFuZEVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblN0YXJ0IGFzIEV2ZW50TGlzdGVuZXIsIHtcbiAgICBwYXNzaXZlOiBmYWxzZSxcbiAgfSk7XG4gIGhhbmRFbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICBpZiAocy5wcm9tb3Rpb24uY3VycmVudCkge1xuICAgICAgY2FuY2VsUHJvbW90aW9uKHMpO1xuICAgICAgcy5kb20ucmVkcmF3KCk7XG4gICAgfVxuICB9KTtcblxuICBpZiAocy5kaXNhYmxlQ29udGV4dE1lbnUgfHwgcy5kcmF3YWJsZS5lbmFibGVkKVxuICAgIGhhbmRFbC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xufVxuXG4vLyByZXR1cm5zIHRoZSB1bmJpbmQgZnVuY3Rpb25cbmV4cG9ydCBmdW5jdGlvbiBiaW5kRG9jdW1lbnQoczogU3RhdGUpOiBzZy5VbmJpbmQge1xuICBjb25zdCB1bmJpbmRzOiBzZy5VbmJpbmRbXSA9IFtdO1xuXG4gIC8vIE9sZCB2ZXJzaW9ucyBvZiBFZGdlIGFuZCBTYWZhcmkgZG8gbm90IHN1cHBvcnQgUmVzaXplT2JzZXJ2ZXIuIFNlbmRcbiAgLy8gc2hvZ2lncm91bmQucmVzaXplIGlmIGEgdXNlciBhY3Rpb24gaGFzIGNoYW5nZWQgdGhlIGJvdW5kcyBvZiB0aGUgYm9hcmQuXG4gIGlmICghKCdSZXNpemVPYnNlcnZlcicgaW4gd2luZG93KSkge1xuICAgIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKGRvY3VtZW50LmJvZHksICdzaG9naWdyb3VuZC5yZXNpemUnLCBvblJlc2l6ZShzKSkpO1xuICB9XG5cbiAgaWYgKCFzLnZpZXdPbmx5KSB7XG4gICAgY29uc3Qgb25tb3ZlID0gZHJhZ09yRHJhdyhzLCBkcmFnLm1vdmUsIGRyYXcubW92ZSk7XG4gICAgY29uc3Qgb25lbmQgPSBkcmFnT3JEcmF3KHMsIGRyYWcuZW5kLCBkcmF3LmVuZCk7XG5cbiAgICBmb3IgKGNvbnN0IGV2IG9mIFsndG91Y2htb3ZlJywgJ21vdXNlbW92ZSddKVxuICAgICAgdW5iaW5kcy5wdXNoKHVuYmluZGFibGUoZG9jdW1lbnQsIGV2LCBvbm1vdmUgYXMgRXZlbnRMaXN0ZW5lcikpO1xuICAgIGZvciAoY29uc3QgZXYgb2YgWyd0b3VjaGVuZCcsICdtb3VzZXVwJ10pXG4gICAgICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZShkb2N1bWVudCwgZXYsIG9uZW5kIGFzIEV2ZW50TGlzdGVuZXIpKTtcblxuICAgIHVuYmluZHMucHVzaChcbiAgICAgIHVuYmluZGFibGUoZG9jdW1lbnQsICdzY3JvbGwnLCAoKSA9PiBjbGVhckJvdW5kcyhzKSwgeyBjYXB0dXJlOiB0cnVlLCBwYXNzaXZlOiB0cnVlIH0pLFxuICAgICk7XG4gICAgdW5iaW5kcy5wdXNoKHVuYmluZGFibGUod2luZG93LCAncmVzaXplJywgKCkgPT4gY2xlYXJCb3VuZHMocyksIHsgcGFzc2l2ZTogdHJ1ZSB9KSk7XG4gIH1cblxuICByZXR1cm4gKCkgPT5cbiAgICB1bmJpbmRzLmZvckVhY2goKGYpID0+IHtcbiAgICAgIGYoKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gdW5iaW5kYWJsZShcbiAgZWw6IEV2ZW50VGFyZ2V0LFxuICBldmVudE5hbWU6IHN0cmluZyxcbiAgY2FsbGJhY2s6IEV2ZW50TGlzdGVuZXIsXG4gIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyxcbik6IHNnLlVuYmluZCB7XG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjaywgb3B0aW9ucyk7XG4gIHJldHVybiAoKSA9PiBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2ssIG9wdGlvbnMpO1xufVxuXG5mdW5jdGlvbiBzdGFydERyYWdPckRyYXcoczogU3RhdGUpOiBNb3VjaEJpbmQge1xuICByZXR1cm4gKGUpID0+IHtcbiAgICBpZiAocy5kcmFnZ2FibGUuY3VycmVudCkgZHJhZy5jYW5jZWwocyk7XG4gICAgZWxzZSBpZiAocy5kcmF3YWJsZS5jdXJyZW50KSBkcmF3LmNhbmNlbChzKTtcbiAgICBlbHNlIGlmIChlLnNoaWZ0S2V5IHx8IGlzUmlnaHRCdXR0b24oZSkgfHwgcy5kcmF3YWJsZS5mb3JjZWQpIHtcbiAgICAgIGlmIChzLmRyYXdhYmxlLmVuYWJsZWQpIGRyYXcuc3RhcnQocywgZSk7XG4gICAgfSBlbHNlIGlmICghcy52aWV3T25seSAmJiAhZHJhZy51bndhbnRlZEV2ZW50KGUpKSBkcmFnLnN0YXJ0KHMsIGUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBkcmFnT3JEcmF3KHM6IFN0YXRlLCB3aXRoRHJhZzogU3RhdGVNb3VjaEJpbmQsIHdpdGhEcmF3OiBTdGF0ZU1vdWNoQmluZCk6IE1vdWNoQmluZCB7XG4gIHJldHVybiAoZSkgPT4ge1xuICAgIGlmIChzLmRyYXdhYmxlLmN1cnJlbnQpIHtcbiAgICAgIGlmIChzLmRyYXdhYmxlLmVuYWJsZWQpIHdpdGhEcmF3KHMsIGUpO1xuICAgIH0gZWxzZSBpZiAoIXMudmlld09ubHkpIHdpdGhEcmFnKHMsIGUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdGFydERyYWdGcm9tSGFuZChzOiBTdGF0ZSk6IE1vdWNoQmluZCB7XG4gIHJldHVybiAoZSkgPT4ge1xuICAgIGlmIChzLnByb21vdGlvbi5jdXJyZW50KSByZXR1cm47XG5cbiAgICBjb25zdCBwb3MgPSBldmVudFBvc2l0aW9uKGUpO1xuICAgIGNvbnN0IHBpZWNlID0gcG9zICYmIGdldEhhbmRQaWVjZUF0RG9tUG9zKHBvcywgcy5oYW5kcy5yb2xlcywgcy5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzKCkpO1xuXG4gICAgaWYgKHBpZWNlKSB7XG4gICAgICBpZiAocy5kcmFnZ2FibGUuY3VycmVudCkgZHJhZy5jYW5jZWwocyk7XG4gICAgICBlbHNlIGlmIChzLmRyYXdhYmxlLmN1cnJlbnQpIGRyYXcuY2FuY2VsKHMpO1xuICAgICAgZWxzZSBpZiAoaXNNaWRkbGVCdXR0b24oZSkpIHtcbiAgICAgICAgaWYgKHMuZHJhd2FibGUuZW5hYmxlZCkge1xuICAgICAgICAgIGlmIChlLmNhbmNlbGFibGUgIT09IGZhbHNlKSBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgZHJhdy5zZXREcmF3UGllY2UocywgcGllY2UpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGUuc2hpZnRLZXkgfHwgaXNSaWdodEJ1dHRvbihlKSB8fCBzLmRyYXdhYmxlLmZvcmNlZCkge1xuICAgICAgICBpZiAocy5kcmF3YWJsZS5lbmFibGVkKSBkcmF3LnN0YXJ0RnJvbUhhbmQocywgcGllY2UsIGUpO1xuICAgICAgfSBlbHNlIGlmICghcy52aWV3T25seSAmJiAhZHJhZy51bndhbnRlZEV2ZW50KGUpKSB7XG4gICAgICAgIGRyYWcuZHJhZ05ld1BpZWNlKHMsIHBpZWNlLCBlKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIHByb21vdGUoczogU3RhdGUsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudCB8IG51bGw7XG4gIGNvbnN0IGN1ciA9IHMucHJvbW90aW9uLmN1cnJlbnQ7XG4gIGlmICh0YXJnZXQgJiYgaXNQaWVjZU5vZGUodGFyZ2V0KSAmJiBjdXIpIHtcbiAgICBjb25zdCBwaWVjZSA9IHsgY29sb3I6IHRhcmdldC5zZ0NvbG9yLCByb2xlOiB0YXJnZXQuc2dSb2xlIH07XG4gICAgY29uc3QgcHJvbSA9ICFzYW1lUGllY2UoY3VyLnBpZWNlLCBwaWVjZSk7XG4gICAgaWYgKGN1ci5kcmFnZ2VkIHx8IChzLnR1cm5Db2xvciAhPT0gcy5hY3RpdmVDb2xvciAmJiBzLmFjdGl2ZUNvbG9yICE9PSAnYm90aCcpKSB7XG4gICAgICBpZiAocy5zZWxlY3RlZCkgdXNlck1vdmUocywgcy5zZWxlY3RlZCwgY3VyLmtleSwgcHJvbSk7XG4gICAgICBlbHNlIGlmIChzLnNlbGVjdGVkUGllY2UpIHVzZXJEcm9wKHMsIHMuc2VsZWN0ZWRQaWVjZSwgY3VyLmtleSwgcHJvbSk7XG4gICAgfSBlbHNlIGFuaW0oKHMpID0+IHNlbGVjdFNxdWFyZShzLCBjdXIua2V5LCBwcm9tKSwgcyk7XG5cbiAgICBjYWxsVXNlckZ1bmN0aW9uKHMucHJvbW90aW9uLmV2ZW50cy5hZnRlciwgcGllY2UpO1xuICB9IGVsc2UgYW5pbSgocykgPT4gY2FuY2VsUHJvbW90aW9uKHMpLCBzKTtcbiAgcy5wcm9tb3Rpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcblxuICBzLmRvbS5yZWRyYXcoKTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IEFuaW1DdXJyZW50LCBBbmltRmFkaW5ncywgQW5pbVByb21vdGlvbnMsIEFuaW1WZWN0b3IsIEFuaW1WZWN0b3JzIH0gZnJvbSAnLi9hbmltLmpzJztcbmltcG9ydCB0eXBlIHsgRHJhZ0N1cnJlbnQgfSBmcm9tICcuL2RyYWcuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7XG4gIGNyZWF0ZUVsLFxuICBpc1BpZWNlTm9kZSxcbiAgaXNTcXVhcmVOb2RlLFxuICBrZXkycG9zLFxuICBwaWVjZU5hbWVPZixcbiAgcG9zVG9UcmFuc2xhdGVSZWwsXG4gIHNlbnRlUG92LFxuICBzZXREaXNwbGF5LFxuICB0cmFuc2xhdGVSZWwsXG59IGZyb20gJy4vdXRpbC5qcyc7XG5cbnR5cGUgU3F1YXJlQ2xhc3NlcyA9IE1hcDxzZy5LZXksIHN0cmluZz47XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXIoczogU3RhdGUsIGJvYXJkRWxzOiBzZy5Cb2FyZEVsZW1lbnRzKTogdm9pZCB7XG4gIGNvbnN0IGFzU2VudGU6IGJvb2xlYW4gPSBzZW50ZVBvdihzLm9yaWVudGF0aW9uKTtcbiAgY29uc3Qgc2NhbGVEb3duID0gcy5zY2FsZURvd25QaWVjZXMgPyAwLjUgOiAxO1xuICBjb25zdCBwb3NUb1RyYW5zbGF0ZSA9IHBvc1RvVHJhbnNsYXRlUmVsKHMuZGltZW5zaW9ucyk7XG4gIGNvbnN0IHNxdWFyZXNFbDogSFRNTEVsZW1lbnQgPSBib2FyZEVscy5zcXVhcmVzO1xuICBjb25zdCBwaWVjZXNFbDogSFRNTEVsZW1lbnQgPSBib2FyZEVscy5waWVjZXM7XG4gIGNvbnN0IGRyYWdnZWRFbDogc2cuUGllY2VOb2RlIHwgdW5kZWZpbmVkID0gYm9hcmRFbHMuZHJhZ2dlZDtcbiAgY29uc3Qgc3F1YXJlT3ZlckVsOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZCA9IGJvYXJkRWxzLnNxdWFyZU92ZXI7XG4gIGNvbnN0IHByb21vdGlvbkVsOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZCA9IGJvYXJkRWxzLnByb21vdGlvbjtcbiAgY29uc3QgcGllY2VzOiBzZy5QaWVjZXMgPSBzLnBpZWNlcztcbiAgY29uc3QgY3VyQW5pbTogQW5pbUN1cnJlbnQgfCB1bmRlZmluZWQgPSBzLmFuaW1hdGlvbi5jdXJyZW50O1xuICBjb25zdCBhbmltczogQW5pbVZlY3RvcnMgPSBjdXJBbmltID8gY3VyQW5pbS5wbGFuLmFuaW1zIDogbmV3IE1hcCgpO1xuICBjb25zdCBmYWRpbmdzOiBBbmltRmFkaW5ncyA9IGN1ckFuaW0gPyBjdXJBbmltLnBsYW4uZmFkaW5ncyA6IG5ldyBNYXAoKTtcbiAgY29uc3QgcHJvbW90aW9uczogQW5pbVByb21vdGlvbnMgPSBjdXJBbmltID8gY3VyQW5pbS5wbGFuLnByb21vdGlvbnMgOiBuZXcgTWFwKCk7XG4gIGNvbnN0IGN1ckRyYWc6IERyYWdDdXJyZW50IHwgdW5kZWZpbmVkID0gcy5kcmFnZ2FibGUuY3VycmVudDtcbiAgY29uc3QgY3VyUHJvbUtleTogc2cuS2V5IHwgdW5kZWZpbmVkID0gcy5wcm9tb3Rpb24uY3VycmVudD8uZHJhZ2dlZCA/IHMuc2VsZWN0ZWQgOiB1bmRlZmluZWQ7XG4gIGNvbnN0IHNxdWFyZXM6IFNxdWFyZUNsYXNzZXMgPSBjb21wdXRlU3F1YXJlQ2xhc3NlcyhzKTtcbiAgY29uc3Qgc2FtZVBpZWNlcyA9IG5ldyBTZXQ8c2cuS2V5PigpO1xuICBjb25zdCBtb3ZlZFBpZWNlcyA9IG5ldyBNYXA8c2cuUGllY2VOYW1lLCBzZy5QaWVjZU5vZGVbXT4oKTtcblxuICAvLyBpZiBwaWVjZSBub3QgYmVpbmcgZHJhZ2dlZCBhbnltb3JlLCBoaWRlIGl0XG4gIGlmICghY3VyRHJhZyAmJiBkcmFnZ2VkRWw/LnNnRHJhZ2dpbmcpIHtcbiAgICBkcmFnZ2VkRWwuc2dEcmFnZ2luZyA9IGZhbHNlO1xuICAgIHNldERpc3BsYXkoZHJhZ2dlZEVsLCBmYWxzZSk7XG4gICAgaWYgKHNxdWFyZU92ZXJFbCkgc2V0RGlzcGxheShzcXVhcmVPdmVyRWwsIGZhbHNlKTtcbiAgfVxuXG4gIGxldCBrOiBzZy5LZXk7XG4gIGxldCBlbDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIGxldCBwaWVjZUF0S2V5OiBzZy5QaWVjZSB8IHVuZGVmaW5lZDtcbiAgbGV0IGVsUGllY2VOYW1lOiBzZy5QaWVjZU5hbWU7XG4gIGxldCBhbmltOiBBbmltVmVjdG9yIHwgdW5kZWZpbmVkO1xuICBsZXQgZmFkaW5nOiBzZy5QaWVjZSB8IHVuZGVmaW5lZDtcbiAgbGV0IHByb206IHNnLlBpZWNlIHwgdW5kZWZpbmVkO1xuICBsZXQgcE12ZHNldDogc2cuUGllY2VOb2RlW10gfCB1bmRlZmluZWQ7XG4gIGxldCBwTXZkOiBzZy5QaWVjZU5vZGUgfCB1bmRlZmluZWQ7XG5cbiAgLy8gd2FsayBvdmVyIGFsbCBib2FyZCBkb20gZWxlbWVudHMsIGFwcGx5IGFuaW1hdGlvbnMgYW5kIGZsYWcgbW92ZWQgcGllY2VzXG4gIGVsID0gcGllY2VzRWwuZmlyc3RFbGVtZW50Q2hpbGQgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIHdoaWxlIChlbCkge1xuICAgIGlmIChpc1BpZWNlTm9kZShlbCkpIHtcbiAgICAgIGsgPSBlbC5zZ0tleTtcbiAgICAgIHBpZWNlQXRLZXkgPSBwaWVjZXMuZ2V0KGspO1xuICAgICAgYW5pbSA9IGFuaW1zLmdldChrKTtcbiAgICAgIGZhZGluZyA9IGZhZGluZ3MuZ2V0KGspO1xuICAgICAgcHJvbSA9IHByb21vdGlvbnMuZ2V0KGspO1xuICAgICAgZWxQaWVjZU5hbWUgPSBwaWVjZU5hbWVPZih7IGNvbG9yOiBlbC5zZ0NvbG9yLCByb2xlOiBlbC5zZ1JvbGUgfSk7XG5cbiAgICAgIC8vIGlmIHBpZWNlIGRyYWdnZWQgYWRkIG9yIHJlbW92ZSBnaG9zdCBjbGFzcyBvciBpZiBwcm9tb3Rpb24gZGlhbG9nIGlzIGFjdGl2ZSBmb3IgdGhlIHBpZWNlIGFkZCBwcm9tIGNsYXNzXG4gICAgICBpZiAoXG4gICAgICAgICgoY3VyRHJhZz8uc3RhcnRlZCAmJiBjdXJEcmFnLmZyb21Cb2FyZD8ub3JpZyA9PT0gaykgfHwgKGN1clByb21LZXkgJiYgY3VyUHJvbUtleSA9PT0gaykpICYmXG4gICAgICAgICFlbC5zZ0dob3N0XG4gICAgICApIHtcbiAgICAgICAgZWwuc2dHaG9zdCA9IHRydWU7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2dob3N0Jyk7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICBlbC5zZ0dob3N0ICYmXG4gICAgICAgICghY3VyRHJhZyB8fCBjdXJEcmFnLmZyb21Cb2FyZD8ub3JpZyAhPT0gaykgJiZcbiAgICAgICAgKCFjdXJQcm9tS2V5IHx8IGN1clByb21LZXkgIT09IGspXG4gICAgICApIHtcbiAgICAgICAgZWwuc2dHaG9zdCA9IGZhbHNlO1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnaG9zdCcpO1xuICAgICAgfVxuICAgICAgLy8gcmVtb3ZlIGZhZGluZyBjbGFzcyBpZiBpdCBzdGlsbCByZW1haW5zXG4gICAgICBpZiAoIWZhZGluZyAmJiBlbC5zZ0ZhZGluZykge1xuICAgICAgICBlbC5zZ0ZhZGluZyA9IGZhbHNlO1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdmYWRpbmcnKTtcbiAgICAgIH1cbiAgICAgIC8vIHRoZXJlIGlzIG5vdyBhIHBpZWNlIGF0IHRoaXMgZG9tIGtleVxuICAgICAgaWYgKHBpZWNlQXRLZXkpIHtcbiAgICAgICAgLy8gY29udGludWUgYW5pbWF0aW9uIGlmIGFscmVhZHkgYW5pbWF0aW5nIGFuZCBzYW1lIHBpZWNlIG9yIHByb21vdGluZyBwaWVjZVxuICAgICAgICAvLyAob3RoZXJ3aXNlIGl0IGNvdWxkIGFuaW1hdGUgYSBjYXB0dXJlZCBwaWVjZSlcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGFuaW0gJiZcbiAgICAgICAgICBlbC5zZ0FuaW1hdGluZyAmJlxuICAgICAgICAgIChlbFBpZWNlTmFtZSA9PT0gcGllY2VOYW1lT2YocGllY2VBdEtleSkgfHwgKHByb20gJiYgZWxQaWVjZU5hbWUgPT09IHBpZWNlTmFtZU9mKHByb20pKSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29uc3QgcG9zID0ga2V5MnBvcyhrKTtcbiAgICAgICAgICBwb3NbMF0gKz0gYW5pbVsyXTtcbiAgICAgICAgICBwb3NbMV0gKz0gYW5pbVszXTtcbiAgICAgICAgICB0cmFuc2xhdGVSZWwoZWwsIHBvc1RvVHJhbnNsYXRlKHBvcywgYXNTZW50ZSksIHNjYWxlRG93bik7XG4gICAgICAgIH0gZWxzZSBpZiAoZWwuc2dBbmltYXRpbmcpIHtcbiAgICAgICAgICBlbC5zZ0FuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2FuaW0nKTtcbiAgICAgICAgICB0cmFuc2xhdGVSZWwoZWwsIHBvc1RvVHJhbnNsYXRlKGtleTJwb3MoayksIGFzU2VudGUpLCBzY2FsZURvd24pO1xuICAgICAgICB9XG4gICAgICAgIC8vIHNhbWUgcGllY2U6IGZsYWcgYXMgc2FtZVxuICAgICAgICBpZiAoZWxQaWVjZU5hbWUgPT09IHBpZWNlTmFtZU9mKHBpZWNlQXRLZXkpICYmICghZmFkaW5nIHx8ICFlbC5zZ0ZhZGluZykpIHtcbiAgICAgICAgICBzYW1lUGllY2VzLmFkZChrKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBkaWZmZXJlbnQgcGllY2U6IGZsYWcgYXMgbW92ZWQgdW5sZXNzIGl0IGlzIGEgZmFkaW5nIHBpZWNlIG9yIGFuIGFuaW1hdGVkIHByb21vdGluZyBwaWVjZVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpZiAoZmFkaW5nICYmIGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihmYWRpbmcpKSB7XG4gICAgICAgICAgICBlbC5zZ0ZhZGluZyA9IHRydWU7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdmYWRpbmcnKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHByb20gJiYgZWxQaWVjZU5hbWUgPT09IHBpZWNlTmFtZU9mKHByb20pKSB7XG4gICAgICAgICAgICBzYW1lUGllY2VzLmFkZChrKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXBwZW5kVmFsdWUobW92ZWRQaWVjZXMsIGVsUGllY2VOYW1lLCBlbCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBubyBwaWVjZTogZmxhZyBhcyBtb3ZlZFxuICAgICAgZWxzZSB7XG4gICAgICAgIGFwcGVuZFZhbHVlKG1vdmVkUGllY2VzLCBlbFBpZWNlTmFtZSwgZWwpO1xuICAgICAgfVxuICAgIH1cbiAgICBlbCA9IGVsLm5leHRFbGVtZW50U2libGluZyBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8vIHdhbGsgb3ZlciBhbGwgc3F1YXJlcyBhbmQgYXBwbHkgY2xhc3Nlc1xuICBsZXQgc3FFbCA9IHNxdWFyZXNFbC5maXJzdEVsZW1lbnRDaGlsZCBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgd2hpbGUgKHNxRWwgJiYgaXNTcXVhcmVOb2RlKHNxRWwpKSB7XG4gICAgc3FFbC5jbGFzc05hbWUgPSBzcXVhcmVzLmdldChzcUVsLnNnS2V5KSB8fCAnJztcbiAgICBzcUVsID0gc3FFbC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIH1cblxuICAvLyB3YWxrIG92ZXIgYWxsIHBpZWNlcyBpbiBjdXJyZW50IHNldCwgYXBwbHkgZG9tIGNoYW5nZXMgdG8gbW92ZWQgcGllY2VzXG4gIC8vIG9yIGFwcGVuZCBuZXcgcGllY2VzXG4gIGZvciAoY29uc3QgW2ssIHBdIG9mIHBpZWNlcykge1xuICAgIGNvbnN0IHBpZWNlID0gcHJvbW90aW9ucy5nZXQoaykgfHwgcDtcbiAgICBhbmltID0gYW5pbXMuZ2V0KGspO1xuICAgIGlmICghc2FtZVBpZWNlcy5oYXMoaykpIHtcbiAgICAgIHBNdmRzZXQgPSBtb3ZlZFBpZWNlcy5nZXQocGllY2VOYW1lT2YocGllY2UpKTtcbiAgICAgIHBNdmQgPSBwTXZkc2V0Py5wb3AoKTtcbiAgICAgIC8vIGEgc2FtZSBwaWVjZSB3YXMgbW92ZWRcbiAgICAgIGlmIChwTXZkKSB7XG4gICAgICAgIC8vIGFwcGx5IGRvbSBjaGFuZ2VzXG4gICAgICAgIHBNdmQuc2dLZXkgPSBrO1xuICAgICAgICBpZiAocE12ZC5zZ0ZhZGluZykge1xuICAgICAgICAgIHBNdmQuc2dGYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICBwTXZkLmNsYXNzTGlzdC5yZW1vdmUoJ2ZhZGluZycpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBvcyA9IGtleTJwb3Moayk7XG4gICAgICAgIGlmIChhbmltKSB7XG4gICAgICAgICAgcE12ZC5zZ0FuaW1hdGluZyA9IHRydWU7XG4gICAgICAgICAgcE12ZC5jbGFzc0xpc3QuYWRkKCdhbmltJyk7XG4gICAgICAgICAgcG9zWzBdICs9IGFuaW1bMl07XG4gICAgICAgICAgcG9zWzFdICs9IGFuaW1bM107XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNsYXRlUmVsKHBNdmQsIHBvc1RvVHJhbnNsYXRlKHBvcywgYXNTZW50ZSksIHNjYWxlRG93bik7XG4gICAgICB9XG4gICAgICAvLyBubyBwaWVjZSBpbiBtb3ZlZCBvYmo6IGluc2VydCB0aGUgbmV3IHBpZWNlXG4gICAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgcGllY2VOb2RlID0gY3JlYXRlRWwoJ3BpZWNlJywgcGllY2VOYW1lT2YocCkpIGFzIHNnLlBpZWNlTm9kZTtcbiAgICAgICAgY29uc3QgcG9zID0ga2V5MnBvcyhrKTtcblxuICAgICAgICBwaWVjZU5vZGUuc2dDb2xvciA9IHAuY29sb3I7XG4gICAgICAgIHBpZWNlTm9kZS5zZ1JvbGUgPSBwLnJvbGU7XG4gICAgICAgIHBpZWNlTm9kZS5zZ0tleSA9IGs7XG4gICAgICAgIGlmIChhbmltKSB7XG4gICAgICAgICAgcGllY2VOb2RlLnNnQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgICAgICBwb3NbMF0gKz0gYW5pbVsyXTtcbiAgICAgICAgICBwb3NbMV0gKz0gYW5pbVszXTtcbiAgICAgICAgfVxuICAgICAgICB0cmFuc2xhdGVSZWwocGllY2VOb2RlLCBwb3NUb1RyYW5zbGF0ZShwb3MsIGFzU2VudGUpLCBzY2FsZURvd24pO1xuXG4gICAgICAgIHBpZWNlc0VsLmFwcGVuZENoaWxkKHBpZWNlTm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8vIHJlbW92ZSBhbnkgZWxlbWVudCB0aGF0IHJlbWFpbnMgaW4gdGhlIG1vdmVkIHNldHNcbiAgZm9yIChjb25zdCBub2RlcyBvZiBtb3ZlZFBpZWNlcy52YWx1ZXMoKSkge1xuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgICAgcGllY2VzRWwucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHByb21vdGlvbkVsKSByZW5kZXJQcm9tb3Rpb24ocywgcHJvbW90aW9uRWwpO1xufVxuXG5mdW5jdGlvbiBhcHBlbmRWYWx1ZTxLLCBWPihtYXA6IE1hcDxLLCBWW10+LCBrZXk6IEssIHZhbHVlOiBWKTogdm9pZCB7XG4gIGNvbnN0IGFyciA9IG1hcC5nZXQoa2V5KTtcbiAgaWYgKGFycikgYXJyLnB1c2godmFsdWUpO1xuICBlbHNlIG1hcC5zZXQoa2V5LCBbdmFsdWVdKTtcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVNxdWFyZUNsYXNzZXMoczogU3RhdGUpOiBTcXVhcmVDbGFzc2VzIHtcbiAgY29uc3Qgc3F1YXJlczogU3F1YXJlQ2xhc3NlcyA9IG5ldyBNYXAoKTtcbiAgaWYgKHMubGFzdERlc3RzICYmIHMuaGlnaGxpZ2h0Lmxhc3REZXN0cylcbiAgICBmb3IgKGNvbnN0IGsgb2Ygcy5sYXN0RGVzdHMpIGFkZFNxdWFyZShzcXVhcmVzLCBrLCAnbGFzdC1kZXN0Jyk7XG4gIGlmIChzLmNoZWNrcyAmJiBzLmhpZ2hsaWdodC5jaGVjaylcbiAgICBmb3IgKGNvbnN0IGNoZWNrIG9mIHMuY2hlY2tzKSBhZGRTcXVhcmUoc3F1YXJlcywgY2hlY2ssICdjaGVjaycpO1xuICBpZiAocy5ob3ZlcmVkKSBhZGRTcXVhcmUoc3F1YXJlcywgcy5ob3ZlcmVkLCAnaG92ZXInKTtcbiAgaWYgKHMuc2VsZWN0ZWQpIHtcbiAgICBpZiAocy5hY3RpdmVDb2xvciA9PT0gJ2JvdGgnIHx8IHMuYWN0aXZlQ29sb3IgPT09IHMudHVybkNvbG9yKVxuICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIHMuc2VsZWN0ZWQsICdzZWxlY3RlZCcpO1xuICAgIGVsc2UgYWRkU3F1YXJlKHNxdWFyZXMsIHMuc2VsZWN0ZWQsICdwcmVzZWxlY3RlZCcpO1xuICAgIGlmIChzLm1vdmFibGUuc2hvd0Rlc3RzKSB7XG4gICAgICBjb25zdCBkZXN0cyA9IHMubW92YWJsZS5kZXN0cz8uZ2V0KHMuc2VsZWN0ZWQpO1xuICAgICAgaWYgKGRlc3RzKVxuICAgICAgICBmb3IgKGNvbnN0IGsgb2YgZGVzdHMpIHtcbiAgICAgICAgICBhZGRTcXVhcmUoc3F1YXJlcywgaywgYGRlc3Qke3MucGllY2VzLmhhcyhrKSA/ICcgb2MnIDogJyd9YCk7XG4gICAgICAgIH1cbiAgICAgIGNvbnN0IHBEZXN0cyA9IHMucHJlbW92YWJsZS5kZXN0cztcbiAgICAgIGlmIChwRGVzdHMpXG4gICAgICAgIGZvciAoY29uc3QgayBvZiBwRGVzdHMpIHtcbiAgICAgICAgICBhZGRTcXVhcmUoc3F1YXJlcywgaywgYHByZS1kZXN0JHtzLnBpZWNlcy5oYXMoaykgPyAnIG9jJyA6ICcnfWApO1xuICAgICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKHMuc2VsZWN0ZWRQaWVjZSkge1xuICAgIGlmIChzLmRyb3BwYWJsZS5zaG93RGVzdHMpIHtcbiAgICAgIGNvbnN0IGRlc3RzID0gcy5kcm9wcGFibGUuZGVzdHM/LmdldChwaWVjZU5hbWVPZihzLnNlbGVjdGVkUGllY2UpKTtcbiAgICAgIGlmIChkZXN0cylcbiAgICAgICAgZm9yIChjb25zdCBrIG9mIGRlc3RzKSB7XG4gICAgICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIGssICdkZXN0Jyk7XG4gICAgICAgIH1cbiAgICAgIGNvbnN0IHBEZXN0cyA9IHMucHJlZHJvcHBhYmxlLmRlc3RzO1xuICAgICAgaWYgKHBEZXN0cylcbiAgICAgICAgZm9yIChjb25zdCBrIG9mIHBEZXN0cykge1xuICAgICAgICAgIGFkZFNxdWFyZShzcXVhcmVzLCBrLCBgcHJlLWRlc3Qke3MucGllY2VzLmhhcyhrKSA/ICcgb2MnIDogJyd9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gIH1cbiAgY29uc3QgcHJlbW92ZSA9IHMucHJlbW92YWJsZS5jdXJyZW50O1xuICBpZiAocHJlbW92ZSkge1xuICAgIGFkZFNxdWFyZShzcXVhcmVzLCBwcmVtb3ZlLm9yaWcsICdjdXJyZW50LXByZScpO1xuICAgIGFkZFNxdWFyZShzcXVhcmVzLCBwcmVtb3ZlLmRlc3QsIGBjdXJyZW50LXByZSR7cHJlbW92ZS5wcm9tID8gJyBwcm9tJyA6ICcnfWApO1xuICB9IGVsc2UgaWYgKHMucHJlZHJvcHBhYmxlLmN1cnJlbnQpXG4gICAgYWRkU3F1YXJlKFxuICAgICAgc3F1YXJlcyxcbiAgICAgIHMucHJlZHJvcHBhYmxlLmN1cnJlbnQua2V5LFxuICAgICAgYGN1cnJlbnQtcHJlJHtzLnByZWRyb3BwYWJsZS5jdXJyZW50LnByb20gPyAnIHByb20nIDogJyd9YCxcbiAgICApO1xuXG4gIGZvciAoY29uc3Qgc3FoIG9mIHMuZHJhd2FibGUuc3F1YXJlcykge1xuICAgIGFkZFNxdWFyZShzcXVhcmVzLCBzcWgua2V5LCBzcWguY2xhc3NOYW1lKTtcbiAgfVxuXG4gIHJldHVybiBzcXVhcmVzO1xufVxuXG5mdW5jdGlvbiBhZGRTcXVhcmUoc3F1YXJlczogU3F1YXJlQ2xhc3Nlcywga2V5OiBzZy5LZXksIGtsYXNzOiBzdHJpbmcpOiB2b2lkIHtcbiAgY29uc3QgY2xhc3NlcyA9IHNxdWFyZXMuZ2V0KGtleSk7XG4gIGlmIChjbGFzc2VzKSBzcXVhcmVzLnNldChrZXksIGAke2NsYXNzZXN9ICR7a2xhc3N9YCk7XG4gIGVsc2Ugc3F1YXJlcy5zZXQoa2V5LCBrbGFzcyk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclByb21vdGlvbihzOiBTdGF0ZSwgcHJvbW90aW9uRWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHMucHJvbW90aW9uLmN1cnJlbnQ7XG4gIGNvbnN0IGtleSA9IGN1cj8ua2V5O1xuICBjb25zdCBwaWVjZXMgPSBjdXIgPyBbY3VyLnByb21vdGVkUGllY2UsIGN1ci5waWVjZV0gOiBbXTtcbiAgY29uc3QgaGFzaCA9IHByb21vdGlvbkhhc2goISFjdXIsIGtleSwgcGllY2VzKTtcbiAgaWYgKHMucHJvbW90aW9uLnByZXZQcm9tb3Rpb25IYXNoID09PSBoYXNoKSByZXR1cm47XG4gIHMucHJvbW90aW9uLnByZXZQcm9tb3Rpb25IYXNoID0gaGFzaDtcblxuICBpZiAoa2V5KSB7XG4gICAgY29uc3QgYXNTZW50ZSA9IHNlbnRlUG92KHMub3JpZW50YXRpb24pO1xuICAgIGNvbnN0IGluaXRQb3MgPSBrZXkycG9zKGtleSk7XG4gICAgY29uc3QgY29sb3IgPSBjdXIucGllY2UuY29sb3I7XG4gICAgY29uc3QgcHJvbW90aW9uU3F1YXJlID0gY3JlYXRlRWwoJ3NnLXByb21vdGlvbi1zcXVhcmUnKTtcbiAgICBjb25zdCBwcm9tb3Rpb25DaG9pY2VzID0gY3JlYXRlRWwoJ3NnLXByb21vdGlvbi1jaG9pY2VzJyk7XG4gICAgaWYgKHMub3JpZW50YXRpb24gIT09IGNvbG9yKSBwcm9tb3Rpb25DaG9pY2VzLmNsYXNzTGlzdC5hZGQoJ3JldmVyc2VkJyk7XG4gICAgdHJhbnNsYXRlUmVsKHByb21vdGlvblNxdWFyZSwgcG9zVG9UcmFuc2xhdGVSZWwocy5kaW1lbnNpb25zKShpbml0UG9zLCBhc1NlbnRlKSwgMSk7XG5cbiAgICBmb3IgKGNvbnN0IHAgb2YgcGllY2VzKSB7XG4gICAgICBjb25zdCBwaWVjZU5vZGUgPSBjcmVhdGVFbCgncGllY2UnLCBwaWVjZU5hbWVPZihwKSkgYXMgc2cuUGllY2VOb2RlO1xuICAgICAgcGllY2VOb2RlLnNnQ29sb3IgPSBwLmNvbG9yO1xuICAgICAgcGllY2VOb2RlLnNnUm9sZSA9IHAucm9sZTtcbiAgICAgIHByb21vdGlvbkNob2ljZXMuYXBwZW5kQ2hpbGQocGllY2VOb2RlKTtcbiAgICB9XG5cbiAgICBwcm9tb3Rpb25FbC5pbm5lckhUTUwgPSAnJztcbiAgICBwcm9tb3Rpb25TcXVhcmUuYXBwZW5kQ2hpbGQocHJvbW90aW9uQ2hvaWNlcyk7XG4gICAgcHJvbW90aW9uRWwuYXBwZW5kQ2hpbGQocHJvbW90aW9uU3F1YXJlKTtcbiAgICBzZXREaXNwbGF5KHByb21vdGlvbkVsLCB0cnVlKTtcbiAgfSBlbHNlIHtcbiAgICBzZXREaXNwbGF5KHByb21vdGlvbkVsLCBmYWxzZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcHJvbW90aW9uSGFzaChhY3RpdmU6IGJvb2xlYW4sIGtleTogc2cuS2V5IHwgdW5kZWZpbmVkLCBwaWVjZXM6IHNnLlBpZWNlW10pOiBzdHJpbmcge1xuICByZXR1cm4gW2FjdGl2ZSwga2V5LCBwaWVjZXMubWFwKChwKSA9PiBwaWVjZU5hbWVPZihwKSkuam9pbignICcpXS5qb2luKCcgJyk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBOb3RhdGlvbiB9IGZyb20gJy4vdHlwZXMuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gY29vcmRzKG5vdGF0aW9uOiBOb3RhdGlvbik6IHN0cmluZ1tdIHtcbiAgc3dpdGNoIChub3RhdGlvbikge1xuICAgIGNhc2UgJ2RpemhpJzpcbiAgICAgIHJldHVybiBbXG4gICAgICAgICcnLFxuICAgICAgICAnJyxcbiAgICAgICAgJycsXG4gICAgICAgICcnLFxuICAgICAgICAn5LqlJyxcbiAgICAgICAgJ+aIjCcsXG4gICAgICAgICfphYknLFxuICAgICAgICAn55SzJyxcbiAgICAgICAgJ+acqicsXG4gICAgICAgICfljYgnLFxuICAgICAgICAn5bezJyxcbiAgICAgICAgJ+i+sCcsXG4gICAgICAgICflja8nLFxuICAgICAgICAn5a+FJyxcbiAgICAgICAgJ+S4kScsXG4gICAgICAgICflrZAnLFxuICAgICAgXTtcbiAgICBjYXNlICdqYXBhbmVzZSc6XG4gICAgICByZXR1cm4gW1xuICAgICAgICAn5Y2B5YWtJyxcbiAgICAgICAgJ+WNgeS6lCcsXG4gICAgICAgICfljYHlm5snLFxuICAgICAgICAn5Y2B5LiJJyxcbiAgICAgICAgJ+WNgeS6jCcsXG4gICAgICAgICfljYHkuIAnLFxuICAgICAgICAn5Y2BJyxcbiAgICAgICAgJ+S5nScsXG4gICAgICAgICflhasnLFxuICAgICAgICAn5LiDJyxcbiAgICAgICAgJ+WFrScsXG4gICAgICAgICfkupQnLFxuICAgICAgICAn5ZubJyxcbiAgICAgICAgJ+S4iScsXG4gICAgICAgICfkuownLFxuICAgICAgICAn5LiAJyxcbiAgICAgIF07XG4gICAgY2FzZSAnZW5naW5lJzpcbiAgICAgIHJldHVybiBbJ3AnLCAnbycsICduJywgJ20nLCAnbCcsICdrJywgJ2onLCAnaScsICdoJywgJ2cnLCAnZicsICdlJywgJ2QnLCAnYycsICdiJywgJ2EnXTtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0dXJuIFsnMTAnLCAnZicsICdlJywgJ2QnLCAnYycsICdiJywgJ2EnLCAnOScsICc4JywgJzcnLCAnNicsICc1JywgJzQnLCAnMycsICcyJywgJzEnXTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIFtcbiAgICAgICAgJzE2JyxcbiAgICAgICAgJzE1JyxcbiAgICAgICAgJzE0JyxcbiAgICAgICAgJzEzJyxcbiAgICAgICAgJzEyJyxcbiAgICAgICAgJzExJyxcbiAgICAgICAgJzEwJyxcbiAgICAgICAgJzknLFxuICAgICAgICAnOCcsXG4gICAgICAgICc3JyxcbiAgICAgICAgJzYnLFxuICAgICAgICAnNScsXG4gICAgICAgICc0JyxcbiAgICAgICAgJzMnLFxuICAgICAgICAnMicsXG4gICAgICAgICcxJyxcbiAgICAgIF07XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBjb2xvcnMgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgeyBjb29yZHMgfSBmcm9tICcuL2Nvb3Jkcy5qcyc7XG5pbXBvcnQgeyBjcmVhdGVTVkdFbGVtZW50LCBzZXRBdHRyaWJ1dGVzIH0gZnJvbSAnLi9zaGFwZXMuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUge1xuICBCb2FyZEVsZW1lbnRzLFxuICBDb2xvcixcbiAgRGltZW5zaW9ucyxcbiAgSGFuZEVsZW1lbnRzLFxuICBQaWVjZU5vZGUsXG4gIFJvbGVTdHJpbmcsXG4gIFNoYXBlc0VsZW1lbnRzLFxuICBTcXVhcmVOb2RlLFxufSBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IGNyZWF0ZUVsLCBvcHBvc2l0ZSwgcGllY2VOYW1lT2YsIHBvczJrZXksIHNldERpc3BsYXkgfSBmcm9tICcuL3V0aWwuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gd3JhcEJvYXJkKGJvYXJkV3JhcDogSFRNTEVsZW1lbnQsIHM6IFN0YXRlKTogQm9hcmRFbGVtZW50cyB7XG4gIC8vIC5zZy13cmFwIChlbGVtZW50IHBhc3NlZCB0byBTaG9naWdyb3VuZClcbiAgLy8gICAgIHNnLWhhbmQtd3JhcFxuICAvLyAgICAgc2ctYm9hcmRcbiAgLy8gICAgICAgc2ctc3F1YXJlc1xuICAvLyAgICAgICBzZy1waWVjZXNcbiAgLy8gICAgICAgcGllY2UgZHJhZ2dpbmdcbiAgLy8gICAgICAgc2ctcHJvbW90aW9uXG4gIC8vICAgICAgIHNnLXNxdWFyZS1vdmVyXG4gIC8vICAgICAgIHN2Zy5zZy1zaGFwZXNcbiAgLy8gICAgICAgICBkZWZzXG4gIC8vICAgICAgICAgZ1xuICAvLyAgICAgICBzdmcuc2ctY3VzdG9tLXN2Z3NcbiAgLy8gICAgICAgICBnXG4gIC8vICAgICBzZy1oYW5kLXdyYXBcbiAgLy8gICAgIHNnLWZyZWUtcGllY2VzXG4gIC8vICAgICAgIGNvb3Jkcy5yYW5rc1xuICAvLyAgICAgICBjb29yZHMuZmlsZXNcblxuICBjb25zdCBib2FyZCA9IGNyZWF0ZUVsKCdzZy1ib2FyZCcpO1xuXG4gIGNvbnN0IHNxdWFyZXMgPSByZW5kZXJTcXVhcmVzKHMuZGltZW5zaW9ucywgcy5vcmllbnRhdGlvbik7XG4gIGJvYXJkLmFwcGVuZENoaWxkKHNxdWFyZXMpO1xuXG4gIGNvbnN0IHBpZWNlcyA9IGNyZWF0ZUVsKCdzZy1waWVjZXMnKTtcbiAgYm9hcmQuYXBwZW5kQ2hpbGQocGllY2VzKTtcblxuICBsZXQgZHJhZ2dlZDogUGllY2VOb2RlIHwgdW5kZWZpbmVkO1xuICBsZXQgcHJvbW90aW9uOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgbGV0IHNxdWFyZU92ZXI6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICBpZiAoIXMudmlld09ubHkpIHtcbiAgICBkcmFnZ2VkID0gY3JlYXRlRWwoJ3BpZWNlJykgYXMgUGllY2VOb2RlO1xuICAgIHNldERpc3BsYXkoZHJhZ2dlZCwgZmFsc2UpO1xuICAgIGJvYXJkLmFwcGVuZENoaWxkKGRyYWdnZWQpO1xuXG4gICAgcHJvbW90aW9uID0gY3JlYXRlRWwoJ3NnLXByb21vdGlvbicpO1xuICAgIHNldERpc3BsYXkocHJvbW90aW9uLCBmYWxzZSk7XG4gICAgYm9hcmQuYXBwZW5kQ2hpbGQocHJvbW90aW9uKTtcblxuICAgIHNxdWFyZU92ZXIgPSBjcmVhdGVFbCgnc2ctc3F1YXJlLW92ZXInKTtcbiAgICBzZXREaXNwbGF5KHNxdWFyZU92ZXIsIGZhbHNlKTtcbiAgICBib2FyZC5hcHBlbmRDaGlsZChzcXVhcmVPdmVyKTtcbiAgfVxuXG4gIGxldCBzaGFwZXM6IFNoYXBlc0VsZW1lbnRzIHwgdW5kZWZpbmVkO1xuICBpZiAocy5kcmF3YWJsZS52aXNpYmxlKSB7XG4gICAgY29uc3Qgc3ZnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdzdmcnKSwge1xuICAgICAgY2xhc3M6ICdzZy1zaGFwZXMnLFxuICAgICAgdmlld0JveDogYC0ke3Muc3F1YXJlUmF0aW9bMF0gLyAyfSAtJHtzLnNxdWFyZVJhdGlvWzFdIC8gMn0gJHtzLmRpbWVuc2lvbnMuZmlsZXMgKiBzLnNxdWFyZVJhdGlvWzBdfSAke1xuICAgICAgICBzLmRpbWVuc2lvbnMucmFua3MgKiBzLnNxdWFyZVJhdGlvWzFdXG4gICAgICB9YCxcbiAgICB9KTtcbiAgICBzdmcuYXBwZW5kQ2hpbGQoY3JlYXRlU1ZHRWxlbWVudCgnZGVmcycpKTtcbiAgICBzdmcuYXBwZW5kQ2hpbGQoY3JlYXRlU1ZHRWxlbWVudCgnZycpKTtcblxuICAgIGNvbnN0IGN1c3RvbVN2ZyA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnc3ZnJyksIHtcbiAgICAgIGNsYXNzOiAnc2ctY3VzdG9tLXN2Z3MnLFxuICAgICAgdmlld0JveDogYDAgMCAke3MuZGltZW5zaW9ucy5maWxlcyAqIHMuc3F1YXJlUmF0aW9bMF19ICR7cy5kaW1lbnNpb25zLnJhbmtzICogcy5zcXVhcmVSYXRpb1sxXX1gLFxuICAgIH0pO1xuICAgIGN1c3RvbVN2Zy5hcHBlbmRDaGlsZChjcmVhdGVTVkdFbGVtZW50KCdnJykpO1xuXG4gICAgY29uc3QgZnJlZVBpZWNlcyA9IGNyZWF0ZUVsKCdzZy1mcmVlLXBpZWNlcycpO1xuXG4gICAgYm9hcmQuYXBwZW5kQ2hpbGQoc3ZnKTtcbiAgICBib2FyZC5hcHBlbmRDaGlsZChjdXN0b21TdmcpO1xuICAgIGJvYXJkLmFwcGVuZENoaWxkKGZyZWVQaWVjZXMpO1xuXG4gICAgc2hhcGVzID0ge1xuICAgICAgc3ZnLFxuICAgICAgZnJlZVBpZWNlcyxcbiAgICAgIGN1c3RvbVN2ZyxcbiAgICB9O1xuICB9XG5cbiAgaWYgKHMuY29vcmRpbmF0ZXMuZW5hYmxlZCkge1xuICAgIGNvbnN0IG9yaWVudENsYXNzID0gcy5vcmllbnRhdGlvbiA9PT0gJ2dvdGUnID8gJyBnb3RlJyA6ICcnO1xuICAgIGNvbnN0IHJhbmtzID0gY29vcmRzKHMuY29vcmRpbmF0ZXMucmFua3MpO1xuICAgIGNvbnN0IGZpbGVzID0gY29vcmRzKHMuY29vcmRpbmF0ZXMuZmlsZXMpO1xuICAgIGJvYXJkLmFwcGVuZENoaWxkKHJlbmRlckNvb3JkcyhyYW5rcywgYHJhbmtzJHtvcmllbnRDbGFzc31gLCBzLmRpbWVuc2lvbnMucmFua3MpKTtcbiAgICBib2FyZC5hcHBlbmRDaGlsZChyZW5kZXJDb29yZHMoZmlsZXMsIGBmaWxlcyR7b3JpZW50Q2xhc3N9YCwgcy5kaW1lbnNpb25zLmZpbGVzKSk7XG4gIH1cblxuICBib2FyZFdyYXAuaW5uZXJIVE1MID0gJyc7XG5cbiAgY29uc3QgZGltQ2xzID0gYGQtJHtzLmRpbWVuc2lvbnMuZmlsZXN9eCR7cy5kaW1lbnNpb25zLnJhbmtzfWA7XG5cbiAgLy8gcmVtb3ZlIGFsbCBvdGhlciBkaW1lbnNpb24gY2xhc3Nlc1xuICBib2FyZFdyYXAuY2xhc3NMaXN0LmZvckVhY2goKGMpID0+IHtcbiAgICBpZiAoYy5zdWJzdHJpbmcoMCwgMikgPT09ICdkLScgJiYgYyAhPT0gZGltQ2xzKSBib2FyZFdyYXAuY2xhc3NMaXN0LnJlbW92ZShjKTtcbiAgfSk7XG5cbiAgLy8gZW5zdXJlIHRoZSBzZy13cmFwIGNsYXNzIGFuZCBkaW1lbnNpb25zIGNsYXNzIGlzIHNldCBiZWZvcmVoYW5kIHRvIGF2b2lkIHJlY29tcHV0aW5nIHN0eWxlc1xuICBib2FyZFdyYXAuY2xhc3NMaXN0LmFkZCgnc2ctd3JhcCcsIGRpbUNscyk7XG5cbiAgZm9yIChjb25zdCBjIG9mIGNvbG9ycykgYm9hcmRXcmFwLmNsYXNzTGlzdC50b2dnbGUoYG9yaWVudGF0aW9uLSR7Y31gLCBzLm9yaWVudGF0aW9uID09PSBjKTtcbiAgYm9hcmRXcmFwLmNsYXNzTGlzdC50b2dnbGUoJ21hbmlwdWxhYmxlJywgIXMudmlld09ubHkpO1xuXG4gIGJvYXJkV3JhcC5hcHBlbmRDaGlsZChib2FyZCk7XG5cbiAgbGV0IGhhbmRzOiBIYW5kRWxlbWVudHMgfCB1bmRlZmluZWQ7XG4gIGlmIChzLmhhbmRzLmlubGluZWQpIHtcbiAgICBjb25zdCBoYW5kV3JhcFRvcCA9IGNyZWF0ZUVsKCdzZy1oYW5kLXdyYXAnLCAnaW5saW5lZCcpO1xuICAgIGNvbnN0IGhhbmRXcmFwQm90dG9tID0gY3JlYXRlRWwoJ3NnLWhhbmQtd3JhcCcsICdpbmxpbmVkJyk7XG4gICAgYm9hcmRXcmFwLmluc2VydEJlZm9yZShoYW5kV3JhcEJvdHRvbSwgYm9hcmQubmV4dEVsZW1lbnRTaWJsaW5nKTtcbiAgICBib2FyZFdyYXAuaW5zZXJ0QmVmb3JlKGhhbmRXcmFwVG9wLCBib2FyZCk7XG4gICAgaGFuZHMgPSB7XG4gICAgICB0b3A6IGhhbmRXcmFwVG9wLFxuICAgICAgYm90dG9tOiBoYW5kV3JhcEJvdHRvbSxcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBib2FyZCxcbiAgICBzcXVhcmVzLFxuICAgIHBpZWNlcyxcbiAgICBwcm9tb3Rpb24sXG4gICAgc3F1YXJlT3ZlcixcbiAgICBkcmFnZ2VkLFxuICAgIHNoYXBlcyxcbiAgICBoYW5kcyxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyYXBIYW5kKGhhbmRXcmFwOiBIVE1MRWxlbWVudCwgcG9zOiAndG9wJyB8ICdib3R0b20nLCBzOiBTdGF0ZSk6IEhUTUxFbGVtZW50IHtcbiAgY29uc3QgaGFuZCA9IHJlbmRlckhhbmQocG9zID09PSAndG9wJyA/IG9wcG9zaXRlKHMub3JpZW50YXRpb24pIDogcy5vcmllbnRhdGlvbiwgcy5oYW5kcy5yb2xlcyk7XG4gIGhhbmRXcmFwLmlubmVySFRNTCA9ICcnO1xuXG4gIGNvbnN0IHJvbGVDbnRDbHMgPSBgci0ke3MuaGFuZHMucm9sZXMubGVuZ3RofWA7XG5cbiAgLy8gcmVtb3ZlIGFsbCBvdGhlciByb2xlIGNvdW50IGNsYXNzZXNcbiAgaGFuZFdyYXAuY2xhc3NMaXN0LmZvckVhY2goKGMpID0+IHtcbiAgICBpZiAoYy5zdWJzdHJpbmcoMCwgMikgPT09ICdyLScgJiYgYyAhPT0gcm9sZUNudENscykgaGFuZFdyYXAuY2xhc3NMaXN0LnJlbW92ZShjKTtcbiAgfSk7XG5cbiAgLy8gZW5zdXJlIHRoZSBzZy1oYW5kLXdyYXAgY2xhc3MsIGhhbmQgcG9zIGNsYXNzIGFuZCByb2xlIG51bWJlciBjbGFzcyBpcyBzZXQgYmVmb3JlaGFuZCB0byBhdm9pZCByZWNvbXB1dGluZyBzdHlsZXNcbiAgaGFuZFdyYXAuY2xhc3NMaXN0LmFkZCgnc2ctaGFuZC13cmFwJywgYGhhbmQtJHtwb3N9YCwgcm9sZUNudENscyk7XG4gIGhhbmRXcmFwLmFwcGVuZENoaWxkKGhhbmQpO1xuXG4gIGZvciAoY29uc3QgYyBvZiBjb2xvcnMpIGhhbmRXcmFwLmNsYXNzTGlzdC50b2dnbGUoYG9yaWVudGF0aW9uLSR7Y31gLCBzLm9yaWVudGF0aW9uID09PSBjKTtcbiAgaGFuZFdyYXAuY2xhc3NMaXN0LnRvZ2dsZSgnbWFuaXB1bGFibGUnLCAhcy52aWV3T25seSk7XG5cbiAgcmV0dXJuIGhhbmQ7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckNvb3JkcyhlbGVtczogcmVhZG9ubHkgc3RyaW5nW10sIGNsYXNzTmFtZTogc3RyaW5nLCB0cmltOiBudW1iZXIpOiBIVE1MRWxlbWVudCB7XG4gIGNvbnN0IGVsID0gY3JlYXRlRWwoJ2Nvb3JkcycsIGNsYXNzTmFtZSk7XG4gIGxldCBmOiBIVE1MRWxlbWVudDtcbiAgZm9yIChjb25zdCBlbGVtIG9mIGVsZW1zLnNsaWNlKC10cmltKSkge1xuICAgIGYgPSBjcmVhdGVFbCgnY29vcmQnKTtcbiAgICBmLnRleHRDb250ZW50ID0gZWxlbTtcbiAgICBlbC5hcHBlbmRDaGlsZChmKTtcbiAgfVxuICByZXR1cm4gZWw7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclNxdWFyZXMoZGltczogRGltZW5zaW9ucywgb3JpZW50YXRpb246IENvbG9yKTogSFRNTEVsZW1lbnQge1xuICBjb25zdCBzcXVhcmVzID0gY3JlYXRlRWwoJ3NnLXNxdWFyZXMnKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGRpbXMucmFua3MgKiBkaW1zLmZpbGVzOyBpKyspIHtcbiAgICBjb25zdCBzcSA9IGNyZWF0ZUVsKCdzcScpIGFzIFNxdWFyZU5vZGU7XG4gICAgc3Euc2dLZXkgPVxuICAgICAgb3JpZW50YXRpb24gPT09ICdzZW50ZSdcbiAgICAgICAgPyBwb3Mya2V5KFtkaW1zLmZpbGVzIC0gMSAtIChpICUgZGltcy5maWxlcyksIE1hdGguZmxvb3IoaSAvIGRpbXMuZmlsZXMpXSlcbiAgICAgICAgOiBwb3Mya2V5KFtpICUgZGltcy5maWxlcywgZGltcy5yYW5rcyAtIDEgLSBNYXRoLmZsb29yKGkgLyBkaW1zLmZpbGVzKV0pO1xuICAgIHNxdWFyZXMuYXBwZW5kQ2hpbGQoc3EpO1xuICB9XG5cbiAgcmV0dXJuIHNxdWFyZXM7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckhhbmQoY29sb3I6IENvbG9yLCByb2xlczogUm9sZVN0cmluZ1tdKTogSFRNTEVsZW1lbnQge1xuICBjb25zdCBoYW5kID0gY3JlYXRlRWwoJ3NnLWhhbmQnKTtcbiAgZm9yIChjb25zdCByb2xlIG9mIHJvbGVzKSB7XG4gICAgY29uc3QgcGllY2UgPSB7IHJvbGU6IHJvbGUsIGNvbG9yOiBjb2xvciB9O1xuICAgIGNvbnN0IHdyYXBFbCA9IGNyZWF0ZUVsKCdzZy1ocC13cmFwJyk7XG4gICAgY29uc3QgcGllY2VFbCA9IGNyZWF0ZUVsKCdwaWVjZScsIHBpZWNlTmFtZU9mKHBpZWNlKSkgYXMgUGllY2VOb2RlO1xuICAgIHBpZWNlRWwuc2dDb2xvciA9IGNvbG9yO1xuICAgIHBpZWNlRWwuc2dSb2xlID0gcm9sZTtcbiAgICB3cmFwRWwuYXBwZW5kQ2hpbGQocGllY2VFbCk7XG4gICAgaGFuZC5hcHBlbmRDaGlsZCh3cmFwRWwpO1xuICB9XG4gIHJldHVybiBoYW5kO1xufVxuIiwgImltcG9ydCAqIGFzIGV2ZW50cyBmcm9tICcuL2V2ZW50cy5qcyc7XG5pbXBvcnQgeyByZW5kZXJIYW5kIH0gZnJvbSAnLi9oYW5kcy5qcyc7XG5pbXBvcnQgeyByZW5kZXIgfSBmcm9tICcuL3JlbmRlci5qcyc7XG5pbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSB7IFdyYXBFbGVtZW50cywgV3JhcEVsZW1lbnRzQm9vbGVhbiB9IGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgd3JhcEJvYXJkLCB3cmFwSGFuZCB9IGZyb20gJy4vd3JhcC5qcyc7XG5cbmZ1bmN0aW9uIGF0dGFjaEJvYXJkKHN0YXRlOiBTdGF0ZSwgYm9hcmRXcmFwOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICBjb25zdCBlbGVtZW50cyA9IHdyYXBCb2FyZChib2FyZFdyYXAsIHN0YXRlKTtcblxuICAvLyBpbiBjYXNlIG9mIGlubGluZWQgaGFuZHNcbiAgaWYgKGVsZW1lbnRzLmhhbmRzKSBhdHRhY2hIYW5kcyhzdGF0ZSwgZWxlbWVudHMuaGFuZHMudG9wLCBlbGVtZW50cy5oYW5kcy5ib3R0b20pO1xuXG4gIHN0YXRlLmRvbS53cmFwRWxlbWVudHMuYm9hcmQgPSBib2FyZFdyYXA7XG4gIHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZCA9IGVsZW1lbnRzO1xuICBzdGF0ZS5kb20uYm91bmRzLmJvYXJkLmJvdW5kcy5jbGVhcigpO1xuXG4gIGV2ZW50cy5iaW5kQm9hcmQoc3RhdGUsIGVsZW1lbnRzKTtcblxuICBzdGF0ZS5kcmF3YWJsZS5wcmV2U3ZnSGFzaCA9ICcnO1xuICBzdGF0ZS5wcm9tb3Rpb24ucHJldlByb21vdGlvbkhhc2ggPSAnJztcblxuICByZW5kZXIoc3RhdGUsIGVsZW1lbnRzKTtcbn1cblxuZnVuY3Rpb24gYXR0YWNoSGFuZHMoc3RhdGU6IFN0YXRlLCBoYW5kVG9wV3JhcD86IEhUTUxFbGVtZW50LCBoYW5kQm90dG9tV3JhcD86IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gIGlmICghc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzKSBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMgPSB7fTtcbiAgaWYgKCFzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmhhbmRzKSBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmhhbmRzID0ge307XG5cbiAgaWYgKGhhbmRUb3BXcmFwKSB7XG4gICAgY29uc3QgaGFuZFRvcCA9IHdyYXBIYW5kKGhhbmRUb3BXcmFwLCAndG9wJywgc3RhdGUpO1xuICAgIHN0YXRlLmRvbS53cmFwRWxlbWVudHMuaGFuZHMudG9wID0gaGFuZFRvcFdyYXA7XG4gICAgc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzLnRvcCA9IGhhbmRUb3A7XG4gICAgZXZlbnRzLmJpbmRIYW5kKHN0YXRlLCBoYW5kVG9wKTtcbiAgICByZW5kZXJIYW5kKHN0YXRlLCBoYW5kVG9wKTtcbiAgfVxuICBpZiAoaGFuZEJvdHRvbVdyYXApIHtcbiAgICBjb25zdCBoYW5kQm90dG9tID0gd3JhcEhhbmQoaGFuZEJvdHRvbVdyYXAsICdib3R0b20nLCBzdGF0ZSk7XG4gICAgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5oYW5kcy5ib3R0b20gPSBoYW5kQm90dG9tV3JhcDtcbiAgICBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMuYm90dG9tID0gaGFuZEJvdHRvbTtcbiAgICBldmVudHMuYmluZEhhbmQoc3RhdGUsIGhhbmRCb3R0b20pO1xuICAgIHJlbmRlckhhbmQoc3RhdGUsIGhhbmRCb3R0b20pO1xuICB9XG5cbiAgaWYgKGhhbmRUb3BXcmFwIHx8IGhhbmRCb3R0b21XcmFwKSB7XG4gICAgc3RhdGUuZG9tLmJvdW5kcy5oYW5kcy5ib3VuZHMuY2xlYXIoKTtcbiAgICBzdGF0ZS5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzLmNsZWFyKCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZHJhd0FsbCh3cmFwRWxlbWVudHM6IFdyYXBFbGVtZW50cywgc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGlmICh3cmFwRWxlbWVudHMuYm9hcmQpIGF0dGFjaEJvYXJkKHN0YXRlLCB3cmFwRWxlbWVudHMuYm9hcmQpO1xuICBpZiAod3JhcEVsZW1lbnRzLmhhbmRzICYmICFzdGF0ZS5oYW5kcy5pbmxpbmVkKVxuICAgIGF0dGFjaEhhbmRzKHN0YXRlLCB3cmFwRWxlbWVudHMuaGFuZHMudG9wLCB3cmFwRWxlbWVudHMuaGFuZHMuYm90dG9tKTtcblxuICAvLyBzaGFwZXMgbWlnaHQgZGVwZW5kIGJvdGggb24gYm9hcmQgYW5kIGhhbmRzIC0gcmVkcmF3IG9ubHkgYWZ0ZXIgYm90aCBhcmUgZG9uZVxuICBzdGF0ZS5kb20ucmVkcmF3U2hhcGVzKCk7XG5cbiAgaWYgKHN0YXRlLmV2ZW50cy5pbnNlcnQpXG4gICAgc3RhdGUuZXZlbnRzLmluc2VydCh3cmFwRWxlbWVudHMuYm9hcmQgJiYgc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkLCB7XG4gICAgICB0b3A6IHdyYXBFbGVtZW50cy5oYW5kcz8udG9wICYmIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcz8udG9wLFxuICAgICAgYm90dG9tOiB3cmFwRWxlbWVudHMuaGFuZHM/LmJvdHRvbSAmJiBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHM/LmJvdHRvbSxcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRldGFjaEVsZW1lbnRzKHdlYjogV3JhcEVsZW1lbnRzQm9vbGVhbiwgc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGlmICh3ZWIuYm9hcmQpIHtcbiAgICBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmJvYXJkID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZCA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20uYm91bmRzLmJvYXJkLmJvdW5kcy5jbGVhcigpO1xuICB9XG4gIGlmIChzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMgJiYgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5oYW5kcykge1xuICAgIGlmICh3ZWIuaGFuZHM/LnRvcCkge1xuICAgICAgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5oYW5kcy50b3AgPSB1bmRlZmluZWQ7XG4gICAgICBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMudG9wID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAod2ViLmhhbmRzPy5ib3R0b20pIHtcbiAgICAgIHN0YXRlLmRvbS53cmFwRWxlbWVudHMuaGFuZHMuYm90dG9tID0gdW5kZWZpbmVkO1xuICAgICAgc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzLmJvdHRvbSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKHdlYi5oYW5kcz8udG9wIHx8IHdlYi5oYW5kcz8uYm90dG9tKSB7XG4gICAgICBzdGF0ZS5kb20uYm91bmRzLmhhbmRzLmJvdW5kcy5jbGVhcigpO1xuICAgICAgc3RhdGUuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcy5jbGVhcigpO1xuICAgIH1cbiAgfVxufVxuIiwgImltcG9ydCB7IGFuaW0sIHJlbmRlciB9IGZyb20gJy4vYW5pbS5qcyc7XG5pbXBvcnQgKiBhcyBib2FyZCBmcm9tICcuL2JvYXJkLmpzJztcbmltcG9ydCB0eXBlIHsgQ29uZmlnIH0gZnJvbSAnLi9jb25maWcuanMnO1xuaW1wb3J0IHsgYXBwbHlBbmltYXRpb24sIGNvbmZpZ3VyZSB9IGZyb20gJy4vY29uZmlnLmpzJztcbmltcG9ydCB7IGRldGFjaEVsZW1lbnRzLCByZWRyYXdBbGwgfSBmcm9tICcuL2RvbS5qcyc7XG5pbXBvcnQgeyBjYW5jZWwgYXMgZHJhZ0NhbmNlbCwgZHJhZ05ld1BpZWNlIH0gZnJvbSAnLi9kcmFnLmpzJztcbmltcG9ydCB0eXBlIHsgRHJhd1NoYXBlLCBTcXVhcmVIaWdobGlnaHQgfSBmcm9tICcuL2RyYXcuanMnO1xuaW1wb3J0IHsgYWRkVG9IYW5kLCByZW1vdmVGcm9tSGFuZCB9IGZyb20gJy4vaGFuZHMuanMnO1xuaW1wb3J0IHsgYm9hcmRUb1NmZW4sIGhhbmRzVG9TZmVuLCBpbmZlckRpbWVuc2lvbnMgfSBmcm9tICcuL3NmZW4uanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBBcGkge1xuICAvLyBhdHRhY2ggZWxlbWVudHMgdG8gY3VycmVudCBzZyBpbnN0YW5jZVxuICBhdHRhY2god3JhcEVsZW1lbnRzOiBzZy5XcmFwRWxlbWVudHMpOiB2b2lkO1xuXG4gIC8vIGRldGFjaCBlbGVtZW50cyBmcm9tIGN1cnJlbnQgc2cgaW5zdGFuY2VcbiAgZGV0YWNoKHdyYXBFbGVtZW50c0Jvb2xlYW46IHNnLldyYXBFbGVtZW50c0Jvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIHJlY29uZmlndXJlIHRoZSBpbnN0YW5jZS4gQWNjZXB0cyBhbGwgY29uZmlnIG9wdGlvbnNcbiAgLy8gYm9hcmQgd2lsbCBiZSBhbmltYXRlZCBhY2NvcmRpbmdseSwgaWYgYW5pbWF0aW9ucyBhcmUgZW5hYmxlZFxuICBzZXQoY29uZmlnOiBDb25maWcsIHNraXBBbmltYXRpb24/OiBib29sZWFuKTogdm9pZDtcblxuICAvLyByZWFkIHNob2dpZ3JvdW5kIHN0YXRlOyB3cml0ZSBhdCB5b3VyIG93biByaXNrc1xuICBzdGF0ZTogU3RhdGU7XG5cbiAgLy8gZ2V0IHRoZSBwb3NpdGlvbiBvbiB0aGUgYm9hcmQgaW4gRm9yc3l0aCBub3RhdGlvblxuICBnZXRCb2FyZFNmZW4oKTogc2cuQm9hcmRTZmVuO1xuXG4gIC8vIGdldCB0aGUgcGllY2VzIGluIGhhbmQgaW4gRm9yc3l0aCBub3RhdGlvblxuICBnZXRIYW5kc1NmZW4oKTogc2cuSGFuZHNTZmVuO1xuXG4gIC8vIGNoYW5nZSB0aGUgdmlldyBhbmdsZVxuICB0b2dnbGVPcmllbnRhdGlvbigpOiB2b2lkO1xuXG4gIC8vIHBlcmZvcm0gYSBtb3ZlIHByb2dyYW1tYXRpY2FsbHlcbiAgbW92ZShvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSwgcHJvbT86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIHBlcmZvcm0gYSBkcm9wIHByb2dyYW1tYXRpY2FsbHksIGJ5IGRlZmF1bHQgcGllY2UgaXMgdGFrZW4gZnJvbSBoYW5kXG4gIGRyb3AocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSwgcHJvbT86IGJvb2xlYW4sIHNwYXJlPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gYWRkIGFuZC9vciByZW1vdmUgYXJiaXRyYXJ5IHBpZWNlcyBvbiB0aGUgYm9hcmRcbiAgc2V0UGllY2VzKHBpZWNlczogc2cuUGllY2VzRGlmZik6IHZvaWQ7XG5cbiAgLy8gYWRkIHBpZWNlLnJvbGUgdG8gaGFuZCBvZiBwaWVjZS5jb2xvclxuICBhZGRUb0hhbmQocGllY2U6IHNnLlBpZWNlLCBjb3VudD86IG51bWJlcik6IHZvaWQ7XG5cbiAgLy8gcmVtb3ZlIHBpZWNlLnJvbGUgZnJvbSBoYW5kIG9mIHBpZWNlLmNvbG9yXG4gIHJlbW92ZUZyb21IYW5kKHBpZWNlOiBzZy5QaWVjZSwgY291bnQ/OiBudW1iZXIpOiB2b2lkO1xuXG4gIC8vIGNsaWNrIGEgc3F1YXJlIHByb2dyYW1tYXRpY2FsbHlcbiAgc2VsZWN0U3F1YXJlKGtleTogc2cuS2V5IHwgbnVsbCwgcHJvbT86IGJvb2xlYW4sIGZvcmNlPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gc2VsZWN0IGEgcGllY2UgZnJvbSBoYW5kIHRvIGRyb3AgcHJvZ3JhbWF0aWNhbGx5LCBieSBkZWZhdWx0IHBpZWNlIGluIGhhbmQgaXMgc2VsZWN0ZWRcbiAgc2VsZWN0UGllY2UocGllY2U6IHNnLlBpZWNlIHwgbnVsbCwgc3BhcmU/OiBib29sZWFuLCBmb3JjZT86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIHBsYXkgdGhlIGN1cnJlbnQgcHJlbW92ZSwgaWYgYW55OyByZXR1cm5zIHRydWUgaWYgcHJlbW92ZSB3YXMgcGxheWVkXG4gIHBsYXlQcmVtb3ZlKCk6IGJvb2xlYW47XG5cbiAgLy8gY2FuY2VsIHRoZSBjdXJyZW50IHByZW1vdmUsIGlmIGFueVxuICBjYW5jZWxQcmVtb3ZlKCk6IHZvaWQ7XG5cbiAgLy8gcGxheSB0aGUgY3VycmVudCBwcmVkcm9wLCBpZiBhbnk7IHJldHVybnMgdHJ1ZSBpZiBwcmVtb3ZlIHdhcyBwbGF5ZWRcbiAgcGxheVByZWRyb3AoKTogYm9vbGVhbjtcblxuICAvLyBjYW5jZWwgdGhlIGN1cnJlbnQgcHJlZHJvcCwgaWYgYW55XG4gIGNhbmNlbFByZWRyb3AoKTogdm9pZDtcblxuICAvLyBjYW5jZWwgdGhlIGN1cnJlbnQgbW92ZSBvciBkcm9wIGJlaW5nIG1hZGUsIHByZW1vdmVzIGFuZCBwcmVkcm9wc1xuICBjYW5jZWxNb3ZlT3JEcm9wKCk6IHZvaWQ7XG5cbiAgLy8gY2FuY2VsIGN1cnJlbnQgbW92ZSBvciBkcm9wIGFuZCBwcmV2ZW50IGZ1cnRoZXIgb25lc1xuICBzdG9wKCk6IHZvaWQ7XG5cbiAgLy8gcHJvZ3JhbW1hdGljYWxseSBkcmF3IHVzZXIgc2hhcGVzXG4gIHNldFNoYXBlcyhzaGFwZXM6IERyYXdTaGFwZVtdKTogdm9pZDtcblxuICAvLyBwcm9ncmFtbWF0aWNhbGx5IGRyYXcgYXV0byBzaGFwZXNcbiAgc2V0QXV0b1NoYXBlcyhzaGFwZXM6IERyYXdTaGFwZVtdKTogdm9pZDtcblxuICAvLyBwcm9ncmFtbWF0aWNhbGx5IGhpZ2hsaWdodCBzcXVhcmVzXG4gIHNldFNxdWFyZUhpZ2hsaWdodHMoc3F1YXJlczogU3F1YXJlSGlnaGxpZ2h0W10pOiB2b2lkO1xuXG4gIC8vIGZvciBwaWVjZSBkcm9wcGluZyBhbmQgYm9hcmQgZWRpdG9yc1xuICBkcmFnTmV3UGllY2UocGllY2U6IHNnLlBpZWNlLCBldmVudDogc2cuTW91Y2hFdmVudCwgc3BhcmU/OiBib29sZWFuKTogdm9pZDtcblxuICAvLyB1bmJpbmRzIGFsbCBldmVudHNcbiAgLy8gKGltcG9ydGFudCBmb3IgZG9jdW1lbnQtd2lkZSBldmVudHMgbGlrZSBzY3JvbGwgYW5kIG1vdXNlbW92ZSlcbiAgZGVzdHJveTogc2cuVW5iaW5kO1xufVxuXG4vLyBzZWUgQVBJIHR5cGVzIGFuZCBkb2N1bWVudGF0aW9ucyBpbiBhcGkuZC50c1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0KHN0YXRlOiBTdGF0ZSk6IEFwaSB7XG4gIHJldHVybiB7XG4gICAgYXR0YWNoKHdyYXBFbGVtZW50czogc2cuV3JhcEVsZW1lbnRzKTogdm9pZCB7XG4gICAgICByZWRyYXdBbGwod3JhcEVsZW1lbnRzLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGRldGFjaCh3cmFwRWxlbWVudHNCb29sZWFuOiBzZy5XcmFwRWxlbWVudHNCb29sZWFuKTogdm9pZCB7XG4gICAgICBkZXRhY2hFbGVtZW50cyh3cmFwRWxlbWVudHNCb29sZWFuLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHNldChjb25maWc6IENvbmZpZywgc2tpcEFuaW1hdGlvbj86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgIGZ1bmN0aW9uIGdldEJ5UGF0aChwYXRoOiBzdHJpbmcsIG9iajogYW55KSB7XG4gICAgICAgIGNvbnN0IHByb3BlcnRpZXMgPSBwYXRoLnNwbGl0KCcuJyk7XG4gICAgICAgIHJldHVybiBwcm9wZXJ0aWVzLnJlZHVjZSgocHJldiwgY3VycikgPT4gcHJldiAmJiBwcmV2W2N1cnJdLCBvYmopO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBmb3JjZVJlZHJhd1Byb3BzOiAoYCR7a2V5b2YgQ29uZmlnfWAgfCBgJHtrZXlvZiBDb25maWd9LiR7c3RyaW5nfWApW10gPSBbXG4gICAgICAgICdvcmllbnRhdGlvbicsXG4gICAgICAgICd2aWV3T25seScsXG4gICAgICAgICdjb29yZGluYXRlcy5lbmFibGVkJyxcbiAgICAgICAgJ2Nvb3JkaW5hdGVzLm5vdGF0aW9uJyxcbiAgICAgICAgJ2RyYXdhYmxlLnZpc2libGUnLFxuICAgICAgICAnaGFuZHMuaW5saW5lZCcsXG4gICAgICBdO1xuICAgICAgY29uc3QgbmV3RGltcyA9IGNvbmZpZy5zZmVuPy5ib2FyZCAmJiBpbmZlckRpbWVuc2lvbnMoY29uZmlnLnNmZW4uYm9hcmQpO1xuICAgICAgY29uc3QgdG9SZWRyYXcgPVxuICAgICAgICBmb3JjZVJlZHJhd1Byb3BzLnNvbWUoKHApID0+IHtcbiAgICAgICAgICBjb25zdCBjUmVzID0gZ2V0QnlQYXRoKHAsIGNvbmZpZyk7XG4gICAgICAgICAgcmV0dXJuIGNSZXMgJiYgY1JlcyAhPT0gZ2V0QnlQYXRoKHAsIHN0YXRlKTtcbiAgICAgICAgfSkgfHxcbiAgICAgICAgISEoXG4gICAgICAgICAgbmV3RGltcyAmJlxuICAgICAgICAgIChuZXdEaW1zLmZpbGVzICE9PSBzdGF0ZS5kaW1lbnNpb25zLmZpbGVzIHx8IG5ld0RpbXMucmFua3MgIT09IHN0YXRlLmRpbWVuc2lvbnMucmFua3MpXG4gICAgICAgICkgfHxcbiAgICAgICAgISFjb25maWcuaGFuZHM/LnJvbGVzPy5ldmVyeSgociwgaSkgPT4gciA9PT0gc3RhdGUuaGFuZHMucm9sZXNbaV0pO1xuXG4gICAgICBpZiAodG9SZWRyYXcpIHtcbiAgICAgICAgYm9hcmQucmVzZXQoc3RhdGUpO1xuICAgICAgICBjb25maWd1cmUoc3RhdGUsIGNvbmZpZyk7XG4gICAgICAgIHJlZHJhd0FsbChzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLCBzdGF0ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhcHBseUFuaW1hdGlvbihzdGF0ZSwgY29uZmlnKTtcbiAgICAgICAgKGNvbmZpZy5zZmVuPy5ib2FyZCAmJiAhc2tpcEFuaW1hdGlvbiA/IGFuaW0gOiByZW5kZXIpKFxuICAgICAgICAgIChzdGF0ZSkgPT4gY29uZmlndXJlKHN0YXRlLCBjb25maWcpLFxuICAgICAgICAgIHN0YXRlLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBzdGF0ZSxcblxuICAgIGdldEJvYXJkU2ZlbjogKCkgPT4gYm9hcmRUb1NmZW4oc3RhdGUucGllY2VzLCBzdGF0ZS5kaW1lbnNpb25zLCBzdGF0ZS5mb3JzeXRoLnRvRm9yc3l0aCksXG5cbiAgICBnZXRIYW5kc1NmZW46ICgpID0+XG4gICAgICBoYW5kc1RvU2ZlbihzdGF0ZS5oYW5kcy5oYW5kTWFwLCBzdGF0ZS5oYW5kcy5yb2xlcywgc3RhdGUuZm9yc3l0aC50b0ZvcnN5dGgpLFxuXG4gICAgdG9nZ2xlT3JpZW50YXRpb24oKTogdm9pZCB7XG4gICAgICBib2FyZC50b2dnbGVPcmllbnRhdGlvbihzdGF0ZSk7XG4gICAgICByZWRyYXdBbGwoc3RhdGUuZG9tLndyYXBFbGVtZW50cywgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBtb3ZlKG9yaWcsIGRlc3QsIHByb20pOiB2b2lkIHtcbiAgICAgIGFuaW0oXG4gICAgICAgIChzdGF0ZSkgPT5cbiAgICAgICAgICBib2FyZC5iYXNlTW92ZShzdGF0ZSwgb3JpZywgZGVzdCwgcHJvbSB8fCBzdGF0ZS5wcm9tb3Rpb24uZm9yY2VNb3ZlUHJvbW90aW9uKG9yaWcsIGRlc3QpKSxcbiAgICAgICAgc3RhdGUsXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBkcm9wKHBpZWNlLCBrZXksIHByb20sIHNwYXJlKTogdm9pZCB7XG4gICAgICBhbmltKChzdGF0ZSkgPT4ge1xuICAgICAgICBzdGF0ZS5kcm9wcGFibGUuc3BhcmUgPSAhIXNwYXJlO1xuICAgICAgICBib2FyZC5iYXNlRHJvcChzdGF0ZSwgcGllY2UsIGtleSwgcHJvbSB8fCBzdGF0ZS5wcm9tb3Rpb24uZm9yY2VEcm9wUHJvbW90aW9uKHBpZWNlLCBrZXkpKTtcbiAgICAgIH0sIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc2V0UGllY2VzKHBpZWNlcyk6IHZvaWQge1xuICAgICAgYW5pbSgoc3RhdGUpID0+IGJvYXJkLnNldFBpZWNlcyhzdGF0ZSwgcGllY2VzKSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBhZGRUb0hhbmQocGllY2U6IHNnLlBpZWNlLCBjb3VudDogbnVtYmVyKTogdm9pZCB7XG4gICAgICByZW5kZXIoKHN0YXRlKSA9PiBhZGRUb0hhbmQoc3RhdGUsIHBpZWNlLCBjb3VudCksIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlRnJvbUhhbmQocGllY2U6IHNnLlBpZWNlLCBjb3VudDogbnVtYmVyKTogdm9pZCB7XG4gICAgICByZW5kZXIoKHN0YXRlKSA9PiByZW1vdmVGcm9tSGFuZChzdGF0ZSwgcGllY2UsIGNvdW50KSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzZWxlY3RTcXVhcmUoa2V5LCBwcm9tLCBmb3JjZSk6IHZvaWQge1xuICAgICAgaWYgKGtleSkgYW5pbSgoc3RhdGUpID0+IGJvYXJkLnNlbGVjdFNxdWFyZShzdGF0ZSwga2V5LCBwcm9tLCBmb3JjZSksIHN0YXRlKTtcbiAgICAgIGVsc2UgaWYgKHN0YXRlLnNlbGVjdGVkKSB7XG4gICAgICAgIGJvYXJkLnVuc2VsZWN0KHN0YXRlKTtcbiAgICAgICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBzZWxlY3RQaWVjZShwaWVjZSwgc3BhcmUsIGZvcmNlKTogdm9pZCB7XG4gICAgICBpZiAocGllY2UpIHJlbmRlcigoc3RhdGUpID0+IGJvYXJkLnNlbGVjdFBpZWNlKHN0YXRlLCBwaWVjZSwgc3BhcmUsIGZvcmNlLCB0cnVlKSwgc3RhdGUpO1xuICAgICAgZWxzZSBpZiAoc3RhdGUuc2VsZWN0ZWRQaWVjZSkge1xuICAgICAgICBib2FyZC51bnNlbGVjdChzdGF0ZSk7XG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcGxheVByZW1vdmUoKTogYm9vbGVhbiB7XG4gICAgICBpZiAoc3RhdGUucHJlbW92YWJsZS5jdXJyZW50KSB7XG4gICAgICAgIGlmIChhbmltKGJvYXJkLnBsYXlQcmVtb3ZlLCBzdGF0ZSkpIHJldHVybiB0cnVlO1xuICAgICAgICAvLyBpZiB0aGUgcHJlbW92ZSBjb3VsZG4ndCBiZSBwbGF5ZWQsIHJlZHJhdyB0byBjbGVhciBpdCB1cFxuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIHBsYXlQcmVkcm9wKCk6IGJvb2xlYW4ge1xuICAgICAgaWYgKHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50KSB7XG4gICAgICAgIGlmIChhbmltKGJvYXJkLnBsYXlQcmVkcm9wLCBzdGF0ZSkpIHJldHVybiB0cnVlO1xuICAgICAgICAvLyBpZiB0aGUgcHJlZHJvcCBjb3VsZG4ndCBiZSBwbGF5ZWQsIHJlZHJhdyB0byBjbGVhciBpdCB1cFxuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIGNhbmNlbFByZW1vdmUoKTogdm9pZCB7XG4gICAgICByZW5kZXIoYm9hcmQudW5zZXRQcmVtb3ZlLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGNhbmNlbFByZWRyb3AoKTogdm9pZCB7XG4gICAgICByZW5kZXIoYm9hcmQudW5zZXRQcmVkcm9wLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGNhbmNlbE1vdmVPckRyb3AoKTogdm9pZCB7XG4gICAgICByZW5kZXIoKHN0YXRlKSA9PiB7XG4gICAgICAgIGJvYXJkLmNhbmNlbE1vdmVPckRyb3Aoc3RhdGUpO1xuICAgICAgICBkcmFnQ2FuY2VsKHN0YXRlKTtcbiAgICAgIH0sIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc3RvcCgpOiB2b2lkIHtcbiAgICAgIHJlbmRlcigoc3RhdGUpID0+IHtcbiAgICAgICAgYm9hcmQuc3RvcChzdGF0ZSk7XG4gICAgICB9LCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHNldEF1dG9TaGFwZXMoc2hhcGVzOiBEcmF3U2hhcGVbXSk6IHZvaWQge1xuICAgICAgcmVuZGVyKChzdGF0ZSkgPT4ge1xuICAgICAgICBzdGF0ZS5kcmF3YWJsZS5hdXRvU2hhcGVzID0gc2hhcGVzO1xuICAgICAgfSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzZXRTaGFwZXMoc2hhcGVzOiBEcmF3U2hhcGVbXSk6IHZvaWQge1xuICAgICAgcmVuZGVyKChzdGF0ZSkgPT4ge1xuICAgICAgICBzdGF0ZS5kcmF3YWJsZS5zaGFwZXMgPSBzaGFwZXM7XG4gICAgICB9LCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHNldFNxdWFyZUhpZ2hsaWdodHMoc3F1YXJlczogU3F1YXJlSGlnaGxpZ2h0W10pOiB2b2lkIHtcbiAgICAgIHJlbmRlcigoc3RhdGUpID0+IHtcbiAgICAgICAgc3RhdGUuZHJhd2FibGUuc3F1YXJlcyA9IHNxdWFyZXM7XG4gICAgICB9LCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGRyYWdOZXdQaWVjZShwaWVjZSwgZXZlbnQsIHNwYXJlKTogdm9pZCB7XG4gICAgICBkcmFnTmV3UGllY2Uoc3RhdGUsIHBpZWNlLCBldmVudCwgc3BhcmUpO1xuICAgIH0sXG5cbiAgICBkZXN0cm95KCk6IHZvaWQge1xuICAgICAgYm9hcmQuc3RvcChzdGF0ZSk7XG4gICAgICBzdGF0ZS5kb20udW5iaW5kKCk7XG4gICAgICBzdGF0ZS5kb20uZGVzdHJveWVkID0gdHJ1ZTtcbiAgICB9LFxuICB9O1xufVxuIiwgImltcG9ydCB7IHJlbmRlckhhbmQgfSBmcm9tICcuL2hhbmRzLmpzJztcbmltcG9ydCB7IHJlbmRlciB9IGZyb20gJy4vcmVuZGVyLmpzJztcbmltcG9ydCB7IHJlbmRlclNoYXBlcyB9IGZyb20gJy4vc2hhcGVzLmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlZHJhd1NoYXBlc05vdyhzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZD8uc2hhcGVzKVxuICAgIHJlbmRlclNoYXBlcyhcbiAgICAgIHN0YXRlLFxuICAgICAgc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkLnNoYXBlcy5zdmcsXG4gICAgICBzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQuc2hhcGVzLmN1c3RvbVN2ZyxcbiAgICAgIHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZC5zaGFwZXMuZnJlZVBpZWNlcyxcbiAgICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVkcmF3Tm93KHN0YXRlOiBTdGF0ZSwgc2tpcFNoYXBlcz86IGJvb2xlYW4pOiB2b2lkIHtcbiAgY29uc3QgYm9hcmRFbHMgPSBzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQ7XG4gIGlmIChib2FyZEVscykge1xuICAgIHJlbmRlcihzdGF0ZSwgYm9hcmRFbHMpO1xuICAgIGlmICghc2tpcFNoYXBlcykgcmVkcmF3U2hhcGVzTm93KHN0YXRlKTtcbiAgfVxuXG4gIGNvbnN0IGhhbmRFbHMgPSBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHM7XG4gIGlmIChoYW5kRWxzKSB7XG4gICAgaWYgKGhhbmRFbHMudG9wKSByZW5kZXJIYW5kKHN0YXRlLCBoYW5kRWxzLnRvcCk7XG4gICAgaWYgKGhhbmRFbHMuYm90dG9tKSByZW5kZXJIYW5kKHN0YXRlLCBoYW5kRWxzLmJvdHRvbSk7XG4gIH1cbn1cbiIsICJpbXBvcnQgdHlwZSB7IEFuaW1DdXJyZW50IH0gZnJvbSAnLi9hbmltLmpzJztcbmltcG9ydCB0eXBlIHsgRHJhZ0N1cnJlbnQgfSBmcm9tICcuL2RyYWcuanMnO1xuaW1wb3J0IHR5cGUgeyBEcmF3YWJsZSB9IGZyb20gJy4vZHJhdy5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEhlYWRsZXNzU3RhdGUge1xuICBwaWVjZXM6IHNnLlBpZWNlcztcbiAgb3JpZW50YXRpb246IHNnLkNvbG9yOyAvLyBib2FyZCBvcmllbnRhdGlvbi4gc2VudGUgfCBnb3RlXG4gIGRpbWVuc2lvbnM6IHNnLkRpbWVuc2lvbnM7IC8vIGJvYXJkIGRpbWVuc2lvbnMgLSBtYXggMTZ4MTZcbiAgdHVybkNvbG9yOiBzZy5Db2xvcjsgLy8gdHVybiB0byBwbGF5LiBzZW50ZSB8IGdvdGVcbiAgYWN0aXZlQ29sb3I/OiBzZy5Db2xvciB8ICdib3RoJzsgLy8gY29sb3IgdGhhdCBjYW4gbW92ZSBvciBkcm9wLiBzZW50ZSB8IGdvdGUgfCBib3RoIHwgdW5kZWZpbmVkXG4gIGNoZWNrcz86IHNnLktleVtdOyAvLyBzcXVhcmVzIGN1cnJlbnRseSBpbiBjaGVjayBbXCI1YVwiXVxuICBsYXN0RGVzdHM/OiBzZy5LZXlbXTsgLy8gc3F1YXJlcyBwYXJ0IG9mIHRoZSBsYXN0IG1vdmUgb3IgZHJvcCBbXCIyYlwiOyBcIjhoXCJdXG4gIGxhc3RQaWVjZT86IHNnLlBpZWNlOyAvLyBwaWVjZSBwYXJ0IG9mIHRoZSBsYXN0IGRyb3BcbiAgc2VsZWN0ZWQ/OiBzZy5LZXk7IC8vIHNxdWFyZSBjdXJyZW50bHkgc2VsZWN0ZWQgXCIxYVwiXG4gIHNlbGVjdGVkUGllY2U/OiBzZy5QaWVjZTsgLy8gcGllY2UgaW4gaGFuZCBjdXJyZW50bHkgc2VsZWN0ZWRcbiAgaG92ZXJlZD86IHNnLktleTsgLy8gc3F1YXJlIGN1cnJlbnRseSBiZWluZyBob3ZlcmVkXG4gIHZpZXdPbmx5OiBib29sZWFuOyAvLyBkb24ndCBiaW5kIGV2ZW50czogdGhlIHVzZXIgd2lsbCBuZXZlciBiZSBhYmxlIHRvIG1vdmUgcGllY2VzIGFyb3VuZFxuICBzcXVhcmVSYXRpbzogc2cuTnVtYmVyUGFpcjsgLy8gcmF0aW8gb2YgdGhlIGJvYXJkIFt3aWR0aCwgaGVpZ2h0XVxuICBkaXNhYmxlQ29udGV4dE1lbnU6IGJvb2xlYW47IC8vIGJlY2F1c2Ugd2hvIG5lZWRzIGEgY29udGV4dCBtZW51IG9uIGEgc2hvZ2kgYm9hcmRcbiAgYmxvY2tUb3VjaFNjcm9sbDogYm9vbGVhbjsgLy8gYmxvY2sgc2Nyb2xsaW5nIHZpYSB0b3VjaCBkcmFnZ2luZyBvbiB0aGUgYm9hcmQsIGUuZy4gZm9yIGNvb3JkaW5hdGUgdHJhaW5pbmdcbiAgc2NhbGVEb3duUGllY2VzOiBib29sZWFuO1xuICBjb29yZGluYXRlczoge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGluY2x1ZGUgY29vcmRzIGF0dHJpYnV0ZXNcbiAgICBmaWxlczogc2cuTm90YXRpb247XG4gICAgcmFua3M6IHNnLk5vdGF0aW9uO1xuICB9O1xuICBoaWdobGlnaHQ6IHtcbiAgICBsYXN0RGVzdHM6IGJvb2xlYW47IC8vIGFkZCBsYXN0LWRlc3QgY2xhc3MgdG8gc3F1YXJlcyBhbmQgcGllY2VzXG4gICAgY2hlY2s6IGJvb2xlYW47IC8vIGFkZCBjaGVjayBjbGFzcyB0byBzcXVhcmVzXG4gICAgY2hlY2tSb2xlczogc2cuUm9sZVN0cmluZ1tdOyAvLyByb2xlcyB0byBiZSBoaWdobGlnaHRlZCB3aGVuIGNoZWNrIGlzIGJvb2xlYW4gaXMgcGFzc2VkIGZyb20gY29uZmlnXG4gICAgaG92ZXJlZDogYm9vbGVhbjsgLy8gYWRkIGhvdmVyIGNsYXNzIHRvIGhvdmVyZWQgc3F1YXJlc1xuICB9O1xuICBhbmltYXRpb246IHsgZW5hYmxlZDogYm9vbGVhbjsgaGFuZHM6IGJvb2xlYW47IGR1cmF0aW9uOiBudW1iZXI7IGN1cnJlbnQ/OiBBbmltQ3VycmVudCB9O1xuICBoYW5kczoge1xuICAgIGlubGluZWQ6IGJvb2xlYW47IC8vIGF0dGFjaGVzIHNnLWhhbmRzIGRpcmVjdGx5IHRvIHNnLXdyYXAsIGlnbm9yZXMgSFRNTEVsZW1lbnRzIHBhc3NlZCB0byBTaG9naWdyb3VuZFxuICAgIGhhbmRNYXA6IHNnLkhhbmRzO1xuICAgIHJvbGVzOiBzZy5Sb2xlU3RyaW5nW107IC8vIHJvbGVzIHRvIHJlbmRlciBpbiBzZy1oYW5kXG4gIH07XG4gIG1vdmFibGU6IHtcbiAgICBmcmVlOiBib29sZWFuOyAvLyBhbGwgbW92ZXMgYXJlIHZhbGlkIC0gYm9hcmQgZWRpdG9yXG4gICAgZGVzdHM/OiBzZy5Nb3ZlRGVzdHM7IC8vIHZhbGlkIG1vdmVzLiB7XCI3Z1wiIFtcIjdmXCJdIFwiNWlcIiBbXCI0aFwiIFwiNWhcIiBcIjZoXCJdfVxuICAgIHNob3dEZXN0czogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIGRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIGV2ZW50czoge1xuICAgICAgYWZ0ZXI/OiAob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXksIHByb206IGJvb2xlYW4sIG1ldGFkYXRhOiBzZy5Nb3ZlTWV0YWRhdGEpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgbW92ZSBoYXMgYmVlbiBwbGF5ZWRcbiAgICB9O1xuICB9O1xuICBkcm9wcGFibGU6IHtcbiAgICBmcmVlOiBib29sZWFuOyAvLyBhbGwgZHJvcHMgYXJlIHZhbGlkIC0gYm9hcmQgZWRpdG9yXG4gICAgZGVzdHM/OiBzZy5Ecm9wRGVzdHM7IC8vIHZhbGlkIGRyb3BzLiB7XCJzZW50ZSBwYXduXCIgW1wiM2FcIiBcIjRhXCJdIFwic2VudGUgbGFuY2VcIiBbXCIzYVwiIFwiM2NcIl19XG4gICAgc2hvd0Rlc3RzOiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgc3BhcmU6IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gcmVtb3ZlIGRyb3BwZWQgcGllY2UgZnJvbSBoYW5kIGFmdGVyIGRyb3AgLSBib2FyZCBlZGl0b3JcbiAgICBldmVudHM6IHtcbiAgICAgIGFmdGVyPzogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb206IGJvb2xlYW4sIG1ldGFkYXRhOiBzZy5Nb3ZlTWV0YWRhdGEpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgZHJvcCBoYXMgYmVlbiBwbGF5ZWRcbiAgICB9O1xuICB9O1xuICBwcmVtb3ZhYmxlOiB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjsgLy8gYWxsb3cgcHJlbW92ZXMgZm9yIGNvbG9yIHRoYXQgY2FuIG5vdCBtb3ZlXG4gICAgc2hvd0Rlc3RzOiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgcHJlLWRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIGRlc3RzPzogc2cuS2V5W107IC8vIHByZW1vdmUgZGVzdGluYXRpb25zIGZvciB0aGUgY3VycmVudCBzZWxlY3Rpb25cbiAgICBjdXJyZW50PzogeyBvcmlnOiBzZy5LZXk7IGRlc3Q6IHNnLktleTsgcHJvbTogYm9vbGVhbiB9O1xuICAgIGdlbmVyYXRlPzogKGtleTogc2cuS2V5LCBwaWVjZXM6IHNnLlBpZWNlcykgPT4gc2cuS2V5W107XG4gICAgZXZlbnRzOiB7XG4gICAgICBzZXQ/OiAob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXksIHByb206IGJvb2xlYW4pID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlbW92ZSBoYXMgYmVlbiBzZXRcbiAgICAgIHVuc2V0PzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVtb3ZlIGhhcyBiZWVuIHVuc2V0XG4gICAgfTtcbiAgfTtcbiAgcHJlZHJvcHBhYmxlOiB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjsgLy8gYWxsb3cgcHJlZHJvcHMgZm9yIGNvbG9yIHRoYXQgY2FuIG5vdCBtb3ZlXG4gICAgc2hvd0Rlc3RzOiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgcHJlLWRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIGRlc3RzPzogc2cuS2V5W107IC8vIHByZW1vdmUgZGVzdGluYXRpb25zIGZvciB0aGUgZHJvcCBzZWxlY3Rpb25cbiAgICBjdXJyZW50PzogeyBwaWVjZTogc2cuUGllY2U7IGtleTogc2cuS2V5OyBwcm9tOiBib29sZWFuIH07XG4gICAgZ2VuZXJhdGU/OiAocGllY2U6IHNnLlBpZWNlLCBwaWVjZXM6IHNnLlBpZWNlcykgPT4gc2cuS2V5W107XG4gICAgZXZlbnRzOiB7XG4gICAgICBzZXQ/OiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSwgcHJvbTogYm9vbGVhbikgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVkcm9wIGhhcyBiZWVuIHNldFxuICAgICAgdW5zZXQ/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZWRyb3AgaGFzIGJlZW4gdW5zZXRcbiAgICB9O1xuICB9O1xuICBkcmFnZ2FibGU6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBhbGxvdyBtb3ZlcyAmIHByZW1vdmVzIHRvIHVzZSBkcmFnJ24gZHJvcFxuICAgIGRpc3RhbmNlOiBudW1iZXI7IC8vIG1pbmltdW0gZGlzdGFuY2UgdG8gaW5pdGlhdGUgYSBkcmFnOyBpbiBwaXhlbHNcbiAgICBhdXRvRGlzdGFuY2U6IGJvb2xlYW47IC8vIGxldHMgc2hvZ2lncm91bmQgc2V0IGRpc3RhbmNlIHRvIHplcm8gd2hlbiB1c2VyIGRyYWdzIHBpZWNlc1xuICAgIHNob3dHaG9zdDogYm9vbGVhbjsgLy8gc2hvdyBnaG9zdCBvZiBwaWVjZSBiZWluZyBkcmFnZ2VkXG4gICAgc2hvd1RvdWNoU3F1YXJlT3ZlcmxheTogYm9vbGVhbjsgLy8gc2hvdyBzcXVhcmUgb3ZlcmxheSBvbiB0aGUgc3F1YXJlIHRoYXQgaXMgY3VycmVudGx5IGJlaW5nIGhvdmVyZWQsIHRvdWNoIG9ubHlcbiAgICBkZWxldGVPbkRyb3BPZmY6IGJvb2xlYW47IC8vIGRlbGV0ZSBhIHBpZWNlIHdoZW4gaXQgaXMgZHJvcHBlZCBvZmYgdGhlIGJvYXJkIC0gYm9hcmQgZWRpdG9yXG4gICAgYWRkVG9IYW5kT25Ecm9wT2ZmOiBib29sZWFuOyAvLyBhZGQgYSBwaWVjZSB0byBoYW5kIHdoZW4gaXQgaXMgZHJvcHBlZCBvbiBpdCwgcmVxdWlyZXMgZGVsZXRlT25Ecm9wT2ZmIC0gYm9hcmQgZWRpdG9yXG4gICAgY3VycmVudD86IERyYWdDdXJyZW50O1xuICB9O1xuICBzZWxlY3RhYmxlOiB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjsgLy8gZGlzYWJsZSB0byBlbmZvcmNlIGRyYWdnaW5nIG92ZXIgY2xpY2stY2xpY2sgbW92ZVxuICAgIGZvcmNlU3BhcmVzOiBib29sZWFuOyAvLyBhbGxvdyBkcm9wcGluZyBzcGFyZSBwaWVjZXMgZXZlbiB3aXRoIHNlbGVjdGFibGUgZGlzYWJsZWRcbiAgICBkZWxldGVPblRvdWNoOiBib29sZWFuOyAvLyBzZWxlY3RpbmcgYSBwaWVjZSBvbiB0aGUgYm9hcmQgb3IgaW4gaGFuZCB3aWxsIHJlbW92ZSBpdCAtIGJvYXJkIGVkaXRvclxuICAgIGFkZFNwYXJlc1RvSGFuZDogYm9vbGVhbjsgLy8gYWRkIHNlbGVjdGVkIHNwYXJlIHBpZWNlIHRvIGhhbmQgLSBib2FyZCBlZGl0b3JcbiAgfTtcbiAgcHJvbW90aW9uOiB7XG4gICAgcHJvbW90ZXNUbzogKHJvbGU6IHNnLlJvbGVTdHJpbmcpID0+IHNnLlJvbGVTdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgdW5wcm9tb3Rlc1RvOiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBtb3ZlUHJvbW90aW9uRGlhbG9nOiAob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXkpID0+IGJvb2xlYW47XG4gICAgZm9yY2VNb3ZlUHJvbW90aW9uOiAob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXkpID0+IGJvb2xlYW47XG4gICAgZHJvcFByb21vdGlvbkRpYWxvZzogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXkpID0+IGJvb2xlYW47XG4gICAgZm9yY2VEcm9wUHJvbW90aW9uOiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSkgPT4gYm9vbGVhbjtcbiAgICBjdXJyZW50Pzoge1xuICAgICAgcGllY2U6IHNnLlBpZWNlO1xuICAgICAgcHJvbW90ZWRQaWVjZTogc2cuUGllY2U7XG4gICAgICBrZXk6IHNnLktleTtcbiAgICAgIGRyYWdnZWQ6IGJvb2xlYW47IC8vIG5vIGFuaW1hdGlvbnMgd2l0aCBkcmFnXG4gICAgfTtcbiAgICBldmVudHM6IHtcbiAgICAgIGluaXRpYXRlZD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIHByb21vdGlvbiBkaWFsb2cgaXMgc3RhcnRlZFxuICAgICAgYWZ0ZXI/OiAocGllY2U6IHNnLlBpZWNlKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdXNlciBzZWxlY3RzIGEgcGllY2VcbiAgICAgIGNhbmNlbD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB1c2VyIGNhbmNlbHMgdGhlIHNlbGVjdGlvblxuICAgIH07XG4gICAgcHJldlByb21vdGlvbkhhc2g6IHN0cmluZztcbiAgfTtcbiAgZm9yc3l0aDoge1xuICAgIHRvRm9yc3l0aD86IChyb2xlOiBzZy5Sb2xlU3RyaW5nKSA9PiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgZnJvbUZvcnN5dGg/OiAoc3RyOiBzdHJpbmcpID0+IHNnLlJvbGVTdHJpbmcgfCB1bmRlZmluZWQ7XG4gIH07XG4gIGV2ZW50czoge1xuICAgIGNoYW5nZT86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgc2l0dWF0aW9uIGNoYW5nZXMgb24gdGhlIGJvYXJkXG4gICAgbW92ZT86IChvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSwgcHJvbTogYm9vbGVhbiwgY2FwdHVyZWRQaWVjZT86IHNnLlBpZWNlKSA9PiB2b2lkO1xuICAgIGRyb3A/OiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSwgcHJvbTogYm9vbGVhbikgPT4gdm9pZDtcbiAgICBzZWxlY3Q/OiAoa2V5OiBzZy5LZXkpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIGEgc3F1YXJlIGlzIHNlbGVjdGVkXG4gICAgdW5zZWxlY3Q/OiAoa2V5OiBzZy5LZXkpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIGEgc2VsZWN0ZWQgc3F1YXJlIGlzIGRpcmVjdGx5IHVuc2VsZWN0ZWQgLSBkcm9wcGVkIGJhY2sgb3IgY2xpY2tlZCBvbiB0aGUgb3JpZ2luYWwgc3F1YXJlXG4gICAgcGllY2VTZWxlY3Q/OiAocGllY2U6IHNnLlBpZWNlKSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBhIHBpZWNlIGluIGhhbmQgaXMgc2VsZWN0ZWRcbiAgICBwaWVjZVVuc2VsZWN0PzogKHBpZWNlOiBzZy5QaWVjZSkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gYSBzZWxlY3RlZCBwaWVjZSBpcyBkaXJlY3RseSB1bnNlbGVjdGVkIC0gZHJvcHBlZCBiYWNrIG9yIGNsaWNrZWQgb24gdGhlIHNhbWUgcGllY2VcbiAgICBpbnNlcnQ/OiAoYm9hcmRFbGVtZW50cz86IHNnLkJvYXJkRWxlbWVudHMsIGhhbmRFbGVtZW50cz86IHNnLkhhbmRFbGVtZW50cykgPT4gdm9pZDsgLy8gd2hlbiB0aGUgYm9hcmQgb3IgaGFuZHMgRE9NIGhhcyBiZWVuIChyZSlpbnNlcnRlZFxuICB9O1xuICBkcmF3YWJsZTogRHJhd2FibGU7XG59XG5leHBvcnQgaW50ZXJmYWNlIFN0YXRlIGV4dGVuZHMgSGVhZGxlc3NTdGF0ZSB7XG4gIGRvbTogc2cuRG9tO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdHMoKTogSGVhZGxlc3NTdGF0ZSB7XG4gIHJldHVybiB7XG4gICAgcGllY2VzOiBuZXcgTWFwKCksXG4gICAgZGltZW5zaW9uczogeyBmaWxlczogOSwgcmFua3M6IDkgfSxcbiAgICBvcmllbnRhdGlvbjogJ3NlbnRlJyxcbiAgICB0dXJuQ29sb3I6ICdzZW50ZScsXG4gICAgYWN0aXZlQ29sb3I6ICdib3RoJyxcbiAgICB2aWV3T25seTogZmFsc2UsXG4gICAgc3F1YXJlUmF0aW86IFsxMSwgMTJdLFxuICAgIGRpc2FibGVDb250ZXh0TWVudTogdHJ1ZSxcbiAgICBibG9ja1RvdWNoU2Nyb2xsOiBmYWxzZSxcbiAgICBzY2FsZURvd25QaWVjZXM6IHRydWUsXG4gICAgY29vcmRpbmF0ZXM6IHsgZW5hYmxlZDogdHJ1ZSwgZmlsZXM6ICdudW1lcmljJywgcmFua3M6ICdudW1lcmljJyB9LFxuICAgIGhpZ2hsaWdodDogeyBsYXN0RGVzdHM6IHRydWUsIGNoZWNrOiB0cnVlLCBjaGVja1JvbGVzOiBbJ2tpbmcnXSwgaG92ZXJlZDogZmFsc2UgfSxcbiAgICBhbmltYXRpb246IHsgZW5hYmxlZDogdHJ1ZSwgaGFuZHM6IHRydWUsIGR1cmF0aW9uOiAyNTAgfSxcbiAgICBoYW5kczoge1xuICAgICAgaW5saW5lZDogZmFsc2UsXG4gICAgICBoYW5kTWFwOiBuZXcgTWFwPHNnLkNvbG9yLCBzZy5IYW5kPihbXG4gICAgICAgIFsnc2VudGUnLCBuZXcgTWFwKCldLFxuICAgICAgICBbJ2dvdGUnLCBuZXcgTWFwKCldLFxuICAgICAgXSksXG4gICAgICByb2xlczogWydyb29rJywgJ2Jpc2hvcCcsICdnb2xkJywgJ3NpbHZlcicsICdrbmlnaHQnLCAnbGFuY2UnLCAncGF3biddLFxuICAgIH0sXG4gICAgbW92YWJsZTogeyBmcmVlOiB0cnVlLCBzaG93RGVzdHM6IHRydWUsIGV2ZW50czoge30gfSxcbiAgICBkcm9wcGFibGU6IHsgZnJlZTogdHJ1ZSwgc2hvd0Rlc3RzOiB0cnVlLCBzcGFyZTogZmFsc2UsIGV2ZW50czoge30gfSxcbiAgICBwcmVtb3ZhYmxlOiB7IGVuYWJsZWQ6IHRydWUsIHNob3dEZXN0czogdHJ1ZSwgZXZlbnRzOiB7fSB9LFxuICAgIHByZWRyb3BwYWJsZTogeyBlbmFibGVkOiB0cnVlLCBzaG93RGVzdHM6IHRydWUsIGV2ZW50czoge30gfSxcbiAgICBkcmFnZ2FibGU6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBkaXN0YW5jZTogMyxcbiAgICAgIGF1dG9EaXN0YW5jZTogdHJ1ZSxcbiAgICAgIHNob3dHaG9zdDogdHJ1ZSxcbiAgICAgIHNob3dUb3VjaFNxdWFyZU92ZXJsYXk6IHRydWUsXG4gICAgICBkZWxldGVPbkRyb3BPZmY6IGZhbHNlLFxuICAgICAgYWRkVG9IYW5kT25Ecm9wT2ZmOiBmYWxzZSxcbiAgICB9LFxuICAgIHNlbGVjdGFibGU6IHsgZW5hYmxlZDogdHJ1ZSwgZm9yY2VTcGFyZXM6IGZhbHNlLCBkZWxldGVPblRvdWNoOiBmYWxzZSwgYWRkU3BhcmVzVG9IYW5kOiBmYWxzZSB9LFxuICAgIHByb21vdGlvbjoge1xuICAgICAgbW92ZVByb21vdGlvbkRpYWxvZzogKCkgPT4gZmFsc2UsXG4gICAgICBmb3JjZU1vdmVQcm9tb3Rpb246ICgpID0+IGZhbHNlLFxuICAgICAgZHJvcFByb21vdGlvbkRpYWxvZzogKCkgPT4gZmFsc2UsXG4gICAgICBmb3JjZURyb3BQcm9tb3Rpb246ICgpID0+IGZhbHNlLFxuICAgICAgcHJvbW90ZXNUbzogKCkgPT4gdW5kZWZpbmVkLFxuICAgICAgdW5wcm9tb3Rlc1RvOiAoKSA9PiB1bmRlZmluZWQsXG4gICAgICBldmVudHM6IHt9LFxuICAgICAgcHJldlByb21vdGlvbkhhc2g6ICcnLFxuICAgIH0sXG4gICAgZm9yc3l0aDoge30sXG4gICAgZXZlbnRzOiB7fSxcbiAgICBkcmF3YWJsZToge1xuICAgICAgZW5hYmxlZDogdHJ1ZSwgLy8gY2FuIGRyYXdcbiAgICAgIHZpc2libGU6IHRydWUsIC8vIGNhbiB2aWV3XG4gICAgICBmb3JjZWQ6IGZhbHNlLCAvLyBjYW4gb25seSBkcmF3XG4gICAgICBlcmFzZU9uQ2xpY2s6IHRydWUsXG4gICAgICBzaGFwZXM6IFtdLFxuICAgICAgYXV0b1NoYXBlczogW10sXG4gICAgICBzcXVhcmVzOiBbXSxcbiAgICAgIHByZXZTdmdIYXNoOiAnJyxcbiAgICB9LFxuICB9O1xufVxuIiwgImltcG9ydCB0eXBlIHsgQXBpIH0gZnJvbSAnLi9hcGkuanMnO1xuaW1wb3J0IHsgc3RhcnQgfSBmcm9tICcuL2FwaS5qcyc7XG5pbXBvcnQgdHlwZSB7IENvbmZpZyB9IGZyb20gJy4vY29uZmlnLmpzJztcbmltcG9ydCB7IGNvbmZpZ3VyZSB9IGZyb20gJy4vY29uZmlnLmpzJztcbmltcG9ydCB7IHJlZHJhd0FsbCB9IGZyb20gJy4vZG9tLmpzJztcbmltcG9ydCB7IGJpbmREb2N1bWVudCB9IGZyb20gJy4vZXZlbnRzLmpzJztcbmltcG9ydCB7IHJlZHJhd05vdywgcmVkcmF3U2hhcGVzTm93IH0gZnJvbSAnLi9yZWRyYXcuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHsgZGVmYXVsdHMgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlIHsgRE9NUmVjdE1hcCwgUGllY2VOYW1lLCBQaWVjZU5vZGUsIFdyYXBFbGVtZW50cyB9IGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gU2hvZ2lncm91bmQoY29uZmlnPzogQ29uZmlnLCB3cmFwRWxlbWVudHM/OiBXcmFwRWxlbWVudHMpOiBBcGkge1xuICBjb25zdCBzdGF0ZSA9IGRlZmF1bHRzKCkgYXMgU3RhdGU7XG4gIGNvbmZpZ3VyZShzdGF0ZSwgY29uZmlnIHx8IHt9KTtcblxuICBjb25zdCByZWRyYXdTdGF0ZU5vdyA9IChza2lwU2hhcGVzPzogYm9vbGVhbikgPT4ge1xuICAgIHJlZHJhd05vdyhzdGF0ZSwgc2tpcFNoYXBlcyk7XG4gIH07XG5cbiAgc3RhdGUuZG9tID0ge1xuICAgIHdyYXBFbGVtZW50czogd3JhcEVsZW1lbnRzIHx8IHt9LFxuICAgIGVsZW1lbnRzOiB7fSxcbiAgICBib3VuZHM6IHtcbiAgICAgIGJvYXJkOiB7XG4gICAgICAgIGJvdW5kczogdXRpbC5tZW1vKCgpID0+IHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZD8ucGllY2VzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKSxcbiAgICAgIH0sXG4gICAgICBoYW5kczoge1xuICAgICAgICBib3VuZHM6IHV0aWwubWVtbygoKSA9PiB7XG4gICAgICAgICAgY29uc3QgaGFuZHNSZWN0czogRE9NUmVjdE1hcDwndG9wJyB8ICdib3R0b20nPiA9IG5ldyBNYXAoKTtcbiAgICAgICAgICBjb25zdCBoYW5kRWxzID0gc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzO1xuICAgICAgICAgIGlmIChoYW5kRWxzPy50b3ApIGhhbmRzUmVjdHMuc2V0KCd0b3AnLCBoYW5kRWxzLnRvcC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSk7XG4gICAgICAgICAgaWYgKGhhbmRFbHM/LmJvdHRvbSkgaGFuZHNSZWN0cy5zZXQoJ2JvdHRvbScsIGhhbmRFbHMuYm90dG9tLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKTtcbiAgICAgICAgICByZXR1cm4gaGFuZHNSZWN0cztcbiAgICAgICAgfSksXG4gICAgICAgIHBpZWNlQm91bmRzOiB1dGlsLm1lbW8oKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGhhbmRQaWVjZXNSZWN0czogRE9NUmVjdE1hcDxQaWVjZU5hbWU+ID0gbmV3IE1hcCgpO1xuICAgICAgICAgIGNvbnN0IGhhbmRFbHMgPSBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHM7XG5cbiAgICAgICAgICBpZiAoaGFuZEVscz8udG9wKSB7XG4gICAgICAgICAgICBsZXQgd3JhcEVsID0gaGFuZEVscy50b3AuZmlyc3RFbGVtZW50Q2hpbGQgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICB3aGlsZSAod3JhcEVsKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHBpZWNlRWwgPSB3cmFwRWwuZmlyc3RFbGVtZW50Q2hpbGQgYXMgUGllY2VOb2RlO1xuICAgICAgICAgICAgICBjb25zdCBwaWVjZSA9IHsgcm9sZTogcGllY2VFbC5zZ1JvbGUsIGNvbG9yOiBwaWVjZUVsLnNnQ29sb3IgfTtcbiAgICAgICAgICAgICAgaGFuZFBpZWNlc1JlY3RzLnNldCh1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKSwgcGllY2VFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSk7XG4gICAgICAgICAgICAgIHdyYXBFbCA9IHdyYXBFbC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChoYW5kRWxzPy5ib3R0b20pIHtcbiAgICAgICAgICAgIGxldCB3cmFwRWwgPSBoYW5kRWxzLmJvdHRvbS5maXJzdEVsZW1lbnRDaGlsZCBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHdoaWxlICh3cmFwRWwpIHtcbiAgICAgICAgICAgICAgY29uc3QgcGllY2VFbCA9IHdyYXBFbC5maXJzdEVsZW1lbnRDaGlsZCBhcyBQaWVjZU5vZGU7XG4gICAgICAgICAgICAgIGNvbnN0IHBpZWNlID0geyByb2xlOiBwaWVjZUVsLnNnUm9sZSwgY29sb3I6IHBpZWNlRWwuc2dDb2xvciB9O1xuICAgICAgICAgICAgICBoYW5kUGllY2VzUmVjdHMuc2V0KHV0aWwucGllY2VOYW1lT2YocGllY2UpLCBwaWVjZUVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKTtcbiAgICAgICAgICAgICAgd3JhcEVsID0gd3JhcEVsLm5leHRFbGVtZW50U2libGluZyBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGhhbmRQaWVjZXNSZWN0cztcbiAgICAgICAgfSksXG4gICAgICB9LFxuICAgIH0sXG4gICAgcmVkcmF3Tm93OiByZWRyYXdTdGF0ZU5vdyxcbiAgICByZWRyYXc6IGRlYm91bmNlUmVkcmF3KHJlZHJhd1N0YXRlTm93KSxcbiAgICByZWRyYXdTaGFwZXM6IGRlYm91bmNlUmVkcmF3KCgpID0+IHJlZHJhd1NoYXBlc05vdyhzdGF0ZSkpLFxuICAgIHVuYmluZDogYmluZERvY3VtZW50KHN0YXRlKSxcbiAgICBkZXN0cm95ZWQ6IGZhbHNlLFxuICB9O1xuXG4gIGlmICh3cmFwRWxlbWVudHMpIHJlZHJhd0FsbCh3cmFwRWxlbWVudHMsIHN0YXRlKTtcblxuICByZXR1cm4gc3RhcnQoc3RhdGUpO1xufVxuXG5mdW5jdGlvbiBkZWJvdW5jZVJlZHJhdyhmOiAoLi4uYXJnczogYW55W10pID0+IHZvaWQpOiAoLi4uYXJnczogYW55W10pID0+IHZvaWQge1xuICBsZXQgcmVkcmF3aW5nID0gZmFsc2U7XG4gIHJldHVybiAoLi4uYXJnczogYW55W10pID0+IHtcbiAgICBpZiAocmVkcmF3aW5nKSByZXR1cm47XG4gICAgcmVkcmF3aW5nID0gdHJ1ZTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgZiguLi5hcmdzKTtcbiAgICAgIHJlZHJhd2luZyA9IGZhbHNlO1xuICAgIH0pO1xuICB9O1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ0VPLE1BQU0sU0FBUyxDQUFDLFNBQVMsTUFBTTtBQUUvQixNQUFNLFFBQVE7QUFBQSxJQUNuQjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNB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QU0sUUFBUSxFQUFFLE1BQU0sUUFBUSxRQUFRLE9BQU8sUUFBUSxRQUFRO0FBQzdELGdDQUFnQixJQUFTLFlBQVksS0FBSyxHQUFHLFFBQVEsc0JBQXNCLENBQUM7QUFDNUUseUJBQVMsT0FBTztBQUFBLGNBQ2xCO0FBQUEsWUFDRjtBQUNBLGdCQUFJLG1DQUFTLFFBQVE7QUFDbkIsa0JBQUksU0FBUyxRQUFRLE9BQU87QUFDNUIscUJBQU8sUUFBUTtBQUNiLHNCQUFNLFVBQVUsT0FBTztBQUN2QixzQkFBTSxRQUFRLEVBQUUsTUFBTSxRQUFRLFFBQVEsT0FBTyxRQUFRLFFBQVE7QUFDN0QsZ0NBQWdCLElBQVMsWUFBWSxLQUFLLEdBQUcsUUFBUSxzQkFBc0IsQ0FBQztBQUM1RSx5QkFBUyxPQUFPO0FBQUEsY0FDbEI7QUFBQSxZQUNGO0FBQ0EsbUJBQU87QUFBQSxVQUNULENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRjtBQUFBLE1BQ0EsV0FBVztBQUFBLE1BQ1gsUUFBUSxlQUFlLGNBQWM7QUFBQSxNQUNyQyxjQUFjLGVBQWUsTUFBTSxnQkFBZ0IsS0FBSyxDQUFDO0FBQUEsTUFDekQsUUFBUSxhQUFhLEtBQUs7QUFBQSxNQUMxQixXQUFXO0FBQUEsSUFDYjtBQUVBLFFBQUksYUFBYyxXQUFVLGNBQWMsS0FBSztBQUUvQyxXQUFPQyxPQUFNLEtBQUs7QUFBQSxFQUNwQjtBQUVBLFdBQVMsZUFBZSxHQUF1RDtBQUM3RSxRQUFJLFlBQVk7QUFDaEIsV0FBTyxJQUFJLFNBQWdCO0FBQ3pCLFVBQUksVUFBVztBQUNmLGtCQUFZO0FBQ1osNEJBQXNCLE1BQU07QUFDMUIsVUFBRSxHQUFHLElBQUk7QUFDVCxvQkFBWTtBQUFBLE1BQ2QsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGOzs7QW5CakZBLE1BQU8sZ0JBQVE7IiwKICAibmFtZXMiOiBbIm5vdyIsICJtb3ZlIiwgInJhbmtzIiwgImJydXNoZXMiLCAiZWwiLCAiZGVzdCIsICJzdGFydCIsICJjYW5jZWwiLCAibW92ZSIsICJlbmQiLCAidW5zZWxlY3QiLCAibW92ZSIsICJlbmQiLCAiY2FuY2VsIiwgInN0YXJ0IiwgInMiLCAicmVuZGVyIiwgImFuaW0iLCAiayIsICJyYW5rcyIsICJmaWxlcyIsICJyZW5kZXJIYW5kIiwgInJlbmRlciIsICJzdGFydCIsICJzdGF0ZSIsICJjYW5jZWwiLCAicmVuZGVyIiwgInN0YXJ0Il0KfQo=
