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
    var _a;
    handEl.classList.toggle("promotion", !!s.promotion.current);
    let wrapEl = handEl.firstElementChild;
    while (wrapEl) {
      const pieceEl = wrapEl.firstElementChild;
      const piece = { role: pieceEl.sgRole, color: pieceEl.sgColor };
      const num = ((_a = s.hands.handMap.get(piece.color)) == null ? void 0 : _a.get(piece.role)) || 0;
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
    var _a;
    const pieceCount = ((_a = state.hands.handMap.get(piece.color)) == null ? void 0 : _a.get(piece.role)) || 0;
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
    var _a;
    return (spare || !!((_a = state.hands.handMap.get(piece.color)) == null ? void 0 : _a.get(piece.role))) && (state.activeColor === "both" || state.activeColor === piece.color && state.turnColor === piece.color);
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
    var _a;
    return !!((_a = state.hands.handMap.get(piece.color)) == null ? void 0 : _a.get(piece.role)) && state.predroppable.enabled && state.activeColor === piece.color && state.turnColor !== piece.color;
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
    if (!spare && s.selectable.deleteOnTouch) removeFromHand(s, piece);
    else selectPiece(s, piece, spare);
    const hadPremove = !!s.premovable.current;
    const hadPredrop = !!s.predroppable.current;
    const stillSelected = s.selectedPiece && samePiece(s.selectedPiece, piece);
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
          if (e.cancelable !== false) e.preventDefault();
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2luZGV4LnRzIiwgIi4uL3NyYy9jb25zdGFudHMudHMiLCAiLi4vc3JjL3V0aWwudHMiLCAiLi4vc3JjL2FuaW0udHMiLCAiLi4vc3JjL2hhbmRzLnRzIiwgIi4uL3NyYy9ib2FyZC50cyIsICIuLi9zcmMvc2Zlbi50cyIsICIuLi9zcmMvY29uZmlnLnRzIiwgIi4uL3NyYy9zaGFwZXMudHMiLCAiLi4vc3JjL2RyYXcudHMiLCAiLi4vc3JjL2RyYWcudHMiLCAiLi4vc3JjL2V2ZW50cy50cyIsICIuLi9zcmMvcmVuZGVyLnRzIiwgIi4uL3NyYy9jb29yZHMudHMiLCAiLi4vc3JjL3dyYXAudHMiLCAiLi4vc3JjL2RvbS50cyIsICIuLi9zcmMvYXBpLnRzIiwgIi4uL3NyYy9yZWRyYXcudHMiLCAiLi4vc3JjL3N0YXRlLnRzIiwgIi4uL3NyYy9zaG9naWdyb3VuZC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgU2hvZ2lncm91bmQgfSBmcm9tICcuL3Nob2dpZ3JvdW5kLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgU2hvZ2lncm91bmQ7XG4iLCAiaW1wb3J0IHR5cGUgeyBLZXkgfSBmcm9tICcuL3R5cGVzLmpzJztcblxuZXhwb3J0IGNvbnN0IGNvbG9ycyA9IFsnc2VudGUnLCAnZ290ZSddIGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgZmlsZXMgPSBbXG4gICcxJyxcbiAgJzInLFxuICAnMycsXG4gICc0JyxcbiAgJzUnLFxuICAnNicsXG4gICc3JyxcbiAgJzgnLFxuICAnOScsXG4gICcxMCcsXG4gICcxMScsXG4gICcxMicsXG4gICcxMycsXG4gICcxNCcsXG4gICcxNScsXG4gICcxNicsXG5dIGFzIGNvbnN0O1xuZXhwb3J0IGNvbnN0IHJhbmtzID0gW1xuICAnYScsXG4gICdiJyxcbiAgJ2MnLFxuICAnZCcsXG4gICdlJyxcbiAgJ2YnLFxuICAnZycsXG4gICdoJyxcbiAgJ2knLFxuICAnaicsXG4gICdrJyxcbiAgJ2wnLFxuICAnbScsXG4gICduJyxcbiAgJ28nLFxuICAncCcsXG5dIGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgYWxsS2V5czogcmVhZG9ubHkgS2V5W10gPSBBcnJheS5wcm90b3R5cGUuY29uY2F0KFxuICAuLi5yYW5rcy5tYXAoKHIpID0+IGZpbGVzLm1hcCgoZikgPT4gZiArIHIpKSxcbik7XG5cbmV4cG9ydCBjb25zdCBub3RhdGlvbnMgPSBbJ251bWVyaWMnLCAnamFwYW5lc2UnLCAnZW5naW5lJywgJ2hleCcsICdkaXpoaSddIGFzIGNvbnN0O1xuIiwgImltcG9ydCB7IGFsbEtleXMsIGNvbG9ycyB9IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5cbmV4cG9ydCBjb25zdCBwb3Mya2V5ID0gKHBvczogc2cuUG9zKTogc2cuS2V5ID0+IGFsbEtleXNbcG9zWzBdICsgMTYgKiBwb3NbMV1dO1xuXG5leHBvcnQgY29uc3Qga2V5MnBvcyA9IChrOiBzZy5LZXkpOiBzZy5Qb3MgPT4ge1xuICBpZiAoay5sZW5ndGggPiAyKSByZXR1cm4gW2suY2hhckNvZGVBdCgxKSAtIDM5LCBrLmNoYXJDb2RlQXQoMikgLSA5N107XG4gIGVsc2UgcmV0dXJuIFtrLmNoYXJDb2RlQXQoMCkgLSA0OSwgay5jaGFyQ29kZUF0KDEpIC0gOTddO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIG1lbW88QT4oZjogKCkgPT4gQSk6IHNnLk1lbW88QT4ge1xuICBsZXQgdjogQSB8IHVuZGVmaW5lZDtcbiAgY29uc3QgcmV0ID0gKCk6IEEgPT4ge1xuICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHYgPSBmKCk7XG4gICAgcmV0dXJuIHY7XG4gIH07XG4gIHJldC5jbGVhciA9ICgpID0+IHtcbiAgICB2ID0gdW5kZWZpbmVkO1xuICB9O1xuICByZXR1cm4gcmV0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FsbFVzZXJGdW5jdGlvbjxUIGV4dGVuZHMgKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPihcbiAgZjogVCB8IHVuZGVmaW5lZCxcbiAgLi4uYXJnczogUGFyYW1ldGVyczxUPlxuKTogdm9pZCB7XG4gIGlmIChmKSBzZXRUaW1lb3V0KCgpID0+IGYoLi4uYXJncyksIDEpO1xufVxuXG5leHBvcnQgY29uc3Qgb3Bwb3NpdGUgPSAoYzogc2cuQ29sb3IpOiBzZy5Db2xvciA9PiAoYyA9PT0gJ3NlbnRlJyA/ICdnb3RlJyA6ICdzZW50ZScpO1xuXG5leHBvcnQgY29uc3Qgc2VudGVQb3YgPSAobzogc2cuQ29sb3IpOiBib29sZWFuID0+IG8gPT09ICdzZW50ZSc7XG5cbmV4cG9ydCBjb25zdCBkaXN0YW5jZVNxID0gKHBvczE6IHNnLlBvcywgcG9zMjogc2cuUG9zKTogbnVtYmVyID0+IHtcbiAgY29uc3QgZHggPSBwb3MxWzBdIC0gcG9zMlswXTtcbiAgY29uc3QgZHkgPSBwb3MxWzFdIC0gcG9zMlsxXTtcbiAgcmV0dXJuIGR4ICogZHggKyBkeSAqIGR5O1xufTtcblxuZXhwb3J0IGNvbnN0IHNhbWVQaWVjZSA9IChwMTogc2cuUGllY2UsIHAyOiBzZy5QaWVjZSk6IGJvb2xlYW4gPT5cbiAgcDEucm9sZSA9PT0gcDIucm9sZSAmJiBwMS5jb2xvciA9PT0gcDIuY29sb3I7XG5cbmNvbnN0IHBvc1RvVHJhbnNsYXRlQmFzZSA9IChcbiAgcG9zOiBzZy5Qb3MsXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGFzU2VudGU6IGJvb2xlYW4sXG4gIHhGYWN0b3I6IG51bWJlcixcbiAgeUZhY3RvcjogbnVtYmVyLFxuKTogc2cuTnVtYmVyUGFpciA9PiBbXG4gIChhc1NlbnRlID8gZGltcy5maWxlcyAtIDEgLSBwb3NbMF0gOiBwb3NbMF0pICogeEZhY3RvcixcbiAgKGFzU2VudGUgPyBwb3NbMV0gOiBkaW1zLnJhbmtzIC0gMSAtIHBvc1sxXSkgKiB5RmFjdG9yLFxuXTtcblxuZXhwb3J0IGNvbnN0IHBvc1RvVHJhbnNsYXRlQWJzID0gKFxuICBkaW1zOiBzZy5EaW1lbnNpb25zLFxuICBib3VuZHM6IERPTVJlY3QsXG4pOiAoKHBvczogc2cuUG9zLCBhc1NlbnRlOiBib29sZWFuKSA9PiBzZy5OdW1iZXJQYWlyKSA9PiB7XG4gIGNvbnN0IHhGYWN0b3IgPSBib3VuZHMud2lkdGggLyBkaW1zLmZpbGVzO1xuICBjb25zdCB5RmFjdG9yID0gYm91bmRzLmhlaWdodCAvIGRpbXMucmFua3M7XG4gIHJldHVybiAocG9zLCBhc1NlbnRlKSA9PiBwb3NUb1RyYW5zbGF0ZUJhc2UocG9zLCBkaW1zLCBhc1NlbnRlLCB4RmFjdG9yLCB5RmFjdG9yKTtcbn07XG5cbmV4cG9ydCBjb25zdCBwb3NUb1RyYW5zbGF0ZVJlbCA9XG4gIChkaW1zOiBzZy5EaW1lbnNpb25zKTogKChwb3M6IHNnLlBvcywgYXNTZW50ZTogYm9vbGVhbikgPT4gc2cuTnVtYmVyUGFpcikgPT5cbiAgKHBvcywgYXNTZW50ZSkgPT5cbiAgICBwb3NUb1RyYW5zbGF0ZUJhc2UocG9zLCBkaW1zLCBhc1NlbnRlLCAxMDAsIDEwMCk7XG5cbmV4cG9ydCBjb25zdCB0cmFuc2xhdGVBYnMgPSAoZWw6IEhUTUxFbGVtZW50LCBwb3M6IHNnLk51bWJlclBhaXIsIHNjYWxlOiBudW1iZXIpOiB2b2lkID0+IHtcbiAgZWwuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke3Bvc1swXX1weCwke3Bvc1sxXX1weCkgc2NhbGUoJHtzY2FsZX1gO1xufTtcblxuZXhwb3J0IGNvbnN0IHRyYW5zbGF0ZVJlbCA9IChcbiAgZWw6IEhUTUxFbGVtZW50LFxuICBwZXJjZW50czogc2cuTnVtYmVyUGFpcixcbiAgc2NhbGVGYWN0b3I6IG51bWJlcixcbiAgc2NhbGU/OiBudW1iZXIsXG4pOiB2b2lkID0+IHtcbiAgZWwuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke3BlcmNlbnRzWzBdICogc2NhbGVGYWN0b3J9JSwke3BlcmNlbnRzWzFdICogc2NhbGVGYWN0b3J9JSkgc2NhbGUoJHtcbiAgICBzY2FsZSB8fCBzY2FsZUZhY3RvclxuICB9KWA7XG59O1xuXG5leHBvcnQgY29uc3Qgc2V0RGlzcGxheSA9IChlbDogSFRNTEVsZW1lbnQsIHY6IGJvb2xlYW4pOiB2b2lkID0+IHtcbiAgZWwuc3R5bGUuZGlzcGxheSA9IHYgPyAnJyA6ICdub25lJztcbn07XG5cbmNvbnN0IGlzTW91c2VFdmVudCA9IChlOiBzZy5Nb3VjaEV2ZW50KTogZSBpcyBFdmVudCAmIE1vdXNlRXZlbnQgPT4ge1xuICByZXR1cm4gISFlLmNsaWVudFggfHwgZS5jbGllbnRYID09PSAwO1xufTtcblxuZXhwb3J0IGNvbnN0IGV2ZW50UG9zaXRpb24gPSAoZTogc2cuTW91Y2hFdmVudCk6IHNnLk51bWJlclBhaXIgfCB1bmRlZmluZWQgPT4ge1xuICBpZiAoaXNNb3VzZUV2ZW50KGUpKSByZXR1cm4gW2UuY2xpZW50WCwgZS5jbGllbnRZXTtcbiAgaWYgKGUudGFyZ2V0VG91Y2hlcz8uWzBdKSByZXR1cm4gW2UudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRYLCBlLnRhcmdldFRvdWNoZXNbMF0uY2xpZW50WV07XG4gIHJldHVybjsgLy8gdG91Y2hlbmQgaGFzIG5vIHBvc2l0aW9uIVxufTtcblxuZXhwb3J0IGNvbnN0IGlzUmlnaHRCdXR0b24gPSAoZTogc2cuTW91Y2hFdmVudCk6IGJvb2xlYW4gPT4gZS5idXR0b25zID09PSAyIHx8IGUuYnV0dG9uID09PSAyO1xuXG5leHBvcnQgY29uc3QgaXNNaWRkbGVCdXR0b24gPSAoZTogc2cuTW91Y2hFdmVudCk6IGJvb2xlYW4gPT4gZS5idXR0b25zID09PSA0IHx8IGUuYnV0dG9uID09PSAxO1xuXG5leHBvcnQgY29uc3QgY3JlYXRlRWwgPSAodGFnTmFtZTogc3RyaW5nLCBjbGFzc05hbWU/OiBzdHJpbmcpOiBIVE1MRWxlbWVudCA9PiB7XG4gIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcbiAgaWYgKGNsYXNzTmFtZSkgZWwuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xuICByZXR1cm4gZWw7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gcGllY2VOYW1lT2YocGllY2U6IHNnLlBpZWNlKTogc2cuUGllY2VOYW1lIHtcbiAgcmV0dXJuIGAke3BpZWNlLmNvbG9yfSAke3BpZWNlLnJvbGV9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUGllY2VOYW1lKHBpZWNlTmFtZTogc2cuUGllY2VOYW1lKTogc2cuUGllY2Uge1xuICBjb25zdCBzcGxpdHRlZCA9IHBpZWNlTmFtZS5zcGxpdCgnICcsIDIpO1xuICByZXR1cm4geyBjb2xvcjogc3BsaXR0ZWRbMF0gYXMgc2cuQ29sb3IsIHJvbGU6IHNwbGl0dGVkWzFdIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1BpZWNlTm9kZShlbDogSFRNTEVsZW1lbnQpOiBlbCBpcyBzZy5QaWVjZU5vZGUge1xuICByZXR1cm4gZWwudGFnTmFtZSA9PT0gJ1BJRUNFJztcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc1NxdWFyZU5vZGUoZWw6IEhUTUxFbGVtZW50KTogZWwgaXMgc2cuU3F1YXJlTm9kZSB7XG4gIHJldHVybiBlbC50YWdOYW1lID09PSAnU1EnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZVNxdWFyZUNlbnRlcihcbiAga2V5OiBzZy5LZXksXG4gIGFzU2VudGU6IGJvb2xlYW4sXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGJvdW5kczogRE9NUmVjdCxcbik6IHNnLk51bWJlclBhaXIge1xuICBjb25zdCBwb3MgPSBrZXkycG9zKGtleSk7XG4gIGlmIChhc1NlbnRlKSB7XG4gICAgcG9zWzBdID0gZGltcy5maWxlcyAtIDEgLSBwb3NbMF07XG4gICAgcG9zWzFdID0gZGltcy5yYW5rcyAtIDEgLSBwb3NbMV07XG4gIH1cbiAgcmV0dXJuIFtcbiAgICBib3VuZHMubGVmdCArIChib3VuZHMud2lkdGggKiBwb3NbMF0pIC8gZGltcy5maWxlcyArIGJvdW5kcy53aWR0aCAvIChkaW1zLmZpbGVzICogMiksXG4gICAgYm91bmRzLnRvcCArXG4gICAgICAoYm91bmRzLmhlaWdodCAqIChkaW1zLnJhbmtzIC0gMSAtIHBvc1sxXSkpIC8gZGltcy5yYW5rcyArXG4gICAgICBib3VuZHMuaGVpZ2h0IC8gKGRpbXMucmFua3MgKiAyKSxcbiAgXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRvbVNxdWFyZUluZGV4T2ZLZXkoa2V5OiBzZy5LZXksIGFzU2VudGU6IGJvb2xlYW4sIGRpbXM6IHNnLkRpbWVuc2lvbnMpOiBudW1iZXIge1xuICBjb25zdCBwb3MgPSBrZXkycG9zKGtleSk7XG4gIGxldCBpbmRleCA9IGRpbXMuZmlsZXMgLSAxIC0gcG9zWzBdICsgcG9zWzFdICogZGltcy5maWxlcztcbiAgaWYgKCFhc1NlbnRlKSBpbmRleCA9IGRpbXMuZmlsZXMgKiBkaW1zLnJhbmtzIC0gMSAtIGluZGV4O1xuXG4gIHJldHVybiBpbmRleDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSW5zaWRlUmVjdChyZWN0OiBET01SZWN0LCBwb3M6IHNnLk51bWJlclBhaXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICByZWN0LmxlZnQgPD0gcG9zWzBdICYmXG4gICAgcmVjdC50b3AgPD0gcG9zWzFdICYmXG4gICAgcmVjdC5sZWZ0ICsgcmVjdC53aWR0aCA+IHBvc1swXSAmJlxuICAgIHJlY3QudG9wICsgcmVjdC5oZWlnaHQgPiBwb3NbMV1cbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEtleUF0RG9tUG9zKFxuICBwb3M6IHNnLk51bWJlclBhaXIsXG4gIGFzU2VudGU6IGJvb2xlYW4sXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGJvdW5kczogRE9NUmVjdCxcbik6IHNnLktleSB8IHVuZGVmaW5lZCB7XG4gIGxldCBmaWxlID0gTWF0aC5mbG9vcigoZGltcy5maWxlcyAqIChwb3NbMF0gLSBib3VuZHMubGVmdCkpIC8gYm91bmRzLndpZHRoKTtcbiAgaWYgKGFzU2VudGUpIGZpbGUgPSBkaW1zLmZpbGVzIC0gMSAtIGZpbGU7XG4gIGxldCByYW5rID0gTWF0aC5mbG9vcigoZGltcy5yYW5rcyAqIChwb3NbMV0gLSBib3VuZHMudG9wKSkgLyBib3VuZHMuaGVpZ2h0KTtcbiAgaWYgKCFhc1NlbnRlKSByYW5rID0gZGltcy5yYW5rcyAtIDEgLSByYW5rO1xuICByZXR1cm4gZmlsZSA+PSAwICYmIGZpbGUgPCBkaW1zLmZpbGVzICYmIHJhbmsgPj0gMCAmJiByYW5rIDwgZGltcy5yYW5rc1xuICAgID8gcG9zMmtleShbZmlsZSwgcmFua10pXG4gICAgOiB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRIYW5kUGllY2VBdERvbVBvcyhcbiAgcG9zOiBzZy5OdW1iZXJQYWlyLFxuICByb2xlczogc2cuUm9sZVN0cmluZ1tdLFxuICBib3VuZHM6IE1hcDxzZy5QaWVjZU5hbWUsIERPTVJlY3Q+LFxuKTogc2cuUGllY2UgfCB1bmRlZmluZWQge1xuICBmb3IgKGNvbnN0IGNvbG9yIG9mIGNvbG9ycykge1xuICAgIGZvciAoY29uc3Qgcm9sZSBvZiByb2xlcykge1xuICAgICAgY29uc3QgcGllY2UgPSB7IGNvbG9yLCByb2xlIH07XG4gICAgICBjb25zdCBwaWVjZVJlY3QgPSBib3VuZHMuZ2V0KHBpZWNlTmFtZU9mKHBpZWNlKSk7XG4gICAgICBpZiAocGllY2VSZWN0ICYmIGlzSW5zaWRlUmVjdChwaWVjZVJlY3QsIHBvcykpIHJldHVybiBwaWVjZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcG9zT2ZPdXRzaWRlRWwoXG4gIGxlZnQ6IG51bWJlcixcbiAgdG9wOiBudW1iZXIsXG4gIGFzU2VudGU6IGJvb2xlYW4sXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGJvYXJkQm91bmRzOiBET01SZWN0LFxuKTogc2cuUG9zIHwgdW5kZWZpbmVkIHtcbiAgY29uc3Qgc3FXID0gYm9hcmRCb3VuZHMud2lkdGggLyBkaW1zLmZpbGVzO1xuICBjb25zdCBzcUggPSBib2FyZEJvdW5kcy5oZWlnaHQgLyBkaW1zLnJhbmtzO1xuICBpZiAoIXNxVyB8fCAhc3FIKSByZXR1cm47XG4gIGxldCB4T2ZmID0gKGxlZnQgLSBib2FyZEJvdW5kcy5sZWZ0KSAvIHNxVztcbiAgaWYgKGFzU2VudGUpIHhPZmYgPSBkaW1zLmZpbGVzIC0gMSAtIHhPZmY7XG4gIGxldCB5T2ZmID0gKHRvcCAtIGJvYXJkQm91bmRzLnRvcCkgLyBzcUg7XG4gIGlmICghYXNTZW50ZSkgeU9mZiA9IGRpbXMucmFua3MgLSAxIC0geU9mZjtcbiAgcmV0dXJuIFt4T2ZmLCB5T2ZmXTtcbn1cbiIsICJpbXBvcnQgeyBhbGxLZXlzLCBjb2xvcnMgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwuanMnO1xuXG5leHBvcnQgdHlwZSBNdXRhdGlvbjxBPiA9IChzdGF0ZTogU3RhdGUpID0+IEE7XG5cbi8vIDAsMSBhbmltYXRpb24gZ29hbFxuLy8gMiwzIGFuaW1hdGlvbiBjdXJyZW50IHN0YXR1c1xuZXhwb3J0IHR5cGUgQW5pbVZlY3RvciA9IHNnLk51bWJlclF1YWQ7XG5cbmV4cG9ydCB0eXBlIEFuaW1WZWN0b3JzID0gTWFwPHNnLktleSwgQW5pbVZlY3Rvcj47XG5cbmV4cG9ydCB0eXBlIEFuaW1GYWRpbmdzID0gTWFwPHNnLktleSwgc2cuUGllY2U+O1xuXG5leHBvcnQgdHlwZSBBbmltUHJvbW90aW9ucyA9IE1hcDxzZy5LZXksIHNnLlBpZWNlPjtcblxuZXhwb3J0IGludGVyZmFjZSBBbmltUGxhbiB7XG4gIGFuaW1zOiBBbmltVmVjdG9ycztcbiAgZmFkaW5nczogQW5pbUZhZGluZ3M7XG4gIHByb21vdGlvbnM6IEFuaW1Qcm9tb3Rpb25zO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1DdXJyZW50IHtcbiAgc3RhcnQ6IERPTUhpZ2hSZXNUaW1lU3RhbXA7XG4gIGZyZXF1ZW5jeTogc2cuS0h6O1xuICBwbGFuOiBBbmltUGxhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFuaW08QT4obXV0YXRpb246IE11dGF0aW9uPEE+LCBzdGF0ZTogU3RhdGUpOiBBIHtcbiAgcmV0dXJuIHN0YXRlLmFuaW1hdGlvbi5lbmFibGVkID8gYW5pbWF0ZShtdXRhdGlvbiwgc3RhdGUpIDogcmVuZGVyKG11dGF0aW9uLCBzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXI8QT4obXV0YXRpb246IE11dGF0aW9uPEE+LCBzdGF0ZTogU3RhdGUpOiBBIHtcbiAgY29uc3QgcmVzdWx0ID0gbXV0YXRpb24oc3RhdGUpO1xuICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmludGVyZmFjZSBBbmltUGllY2Uge1xuICBrZXk/OiBzZy5LZXk7XG4gIHBvczogc2cuUG9zO1xuICBwaWVjZTogc2cuUGllY2U7XG59XG5cbnR5cGUgTmV3QW5pbVBpZWNlID0gUmVxdWlyZWQ8QW5pbVBpZWNlPjtcblxuZnVuY3Rpb24gbWFrZVBpZWNlKGtleTogc2cuS2V5LCBwaWVjZTogc2cuUGllY2UpOiBOZXdBbmltUGllY2Uge1xuICByZXR1cm4ge1xuICAgIGtleToga2V5LFxuICAgIHBvczogdXRpbC5rZXkycG9zKGtleSksXG4gICAgcGllY2U6IHBpZWNlLFxuICB9O1xufVxuXG5mdW5jdGlvbiBjbG9zZXIocGllY2U6IEFuaW1QaWVjZSwgcGllY2VzOiBBbmltUGllY2VbXSk6IEFuaW1QaWVjZSB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBwaWVjZXMuc29ydCgocDEsIHAyKSA9PiB7XG4gICAgcmV0dXJuIHV0aWwuZGlzdGFuY2VTcShwaWVjZS5wb3MsIHAxLnBvcykgLSB1dGlsLmRpc3RhbmNlU3EocGllY2UucG9zLCBwMi5wb3MpO1xuICB9KVswXTtcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVBsYW4ocHJldlBpZWNlczogc2cuUGllY2VzLCBwcmV2SGFuZHM6IHNnLkhhbmRzLCBjdXJyZW50OiBTdGF0ZSk6IEFuaW1QbGFuIHtcbiAgY29uc3QgYW5pbXM6IEFuaW1WZWN0b3JzID0gbmV3IE1hcCgpO1xuICBjb25zdCBhbmltZWRPcmlnczogc2cuS2V5W10gPSBbXTtcbiAgY29uc3QgZmFkaW5nczogQW5pbUZhZGluZ3MgPSBuZXcgTWFwKCk7XG4gIGNvbnN0IHByb21vdGlvbnM6IEFuaW1Qcm9tb3Rpb25zID0gbmV3IE1hcCgpO1xuICBjb25zdCBtaXNzaW5nczogQW5pbVBpZWNlW10gPSBbXTtcbiAgY29uc3QgbmV3czogTmV3QW5pbVBpZWNlW10gPSBbXTtcbiAgY29uc3QgcHJlUGllY2VzID0gbmV3IE1hcDxzZy5LZXksIEFuaW1QaWVjZT4oKTtcblxuICBmb3IgKGNvbnN0IFtrLCBwXSBvZiBwcmV2UGllY2VzKSB7XG4gICAgcHJlUGllY2VzLnNldChrLCBtYWtlUGllY2UoaywgcCkpO1xuICB9XG4gIGZvciAoY29uc3Qga2V5IG9mIGFsbEtleXMpIHtcbiAgICBjb25zdCBjdXJQID0gY3VycmVudC5waWVjZXMuZ2V0KGtleSk7XG4gICAgY29uc3QgcHJlUCA9IHByZVBpZWNlcy5nZXQoa2V5KTtcbiAgICBpZiAoY3VyUCkge1xuICAgICAgaWYgKHByZVApIHtcbiAgICAgICAgaWYgKCF1dGlsLnNhbWVQaWVjZShjdXJQLCBwcmVQLnBpZWNlKSkge1xuICAgICAgICAgIG1pc3NpbmdzLnB1c2gocHJlUCk7XG4gICAgICAgICAgbmV3cy5wdXNoKG1ha2VQaWVjZShrZXksIGN1clApKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIG5ld3MucHVzaChtYWtlUGllY2Uoa2V5LCBjdXJQKSk7XG4gICAgfSBlbHNlIGlmIChwcmVQKSBtaXNzaW5ncy5wdXNoKHByZVApO1xuICB9XG4gIGlmIChjdXJyZW50LmFuaW1hdGlvbi5oYW5kcykge1xuICAgIGZvciAoY29uc3QgY29sb3Igb2YgY29sb3JzKSB7XG4gICAgICBjb25zdCBjdXJIID0gY3VycmVudC5oYW5kcy5oYW5kTWFwLmdldChjb2xvcik7XG4gICAgICBjb25zdCBwcmVIID0gcHJldkhhbmRzLmdldChjb2xvcik7XG4gICAgICBpZiAocHJlSCAmJiBjdXJIKSB7XG4gICAgICAgIGZvciAoY29uc3QgW3JvbGUsIG5dIG9mIHByZUgpIHtcbiAgICAgICAgICBjb25zdCBwaWVjZTogc2cuUGllY2UgPSB7IHJvbGUsIGNvbG9yIH07XG4gICAgICAgICAgY29uc3QgY3VyTiA9IGN1ckguZ2V0KHJvbGUpIHx8IDA7XG4gICAgICAgICAgaWYgKGN1ck4gPCBuKSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kUGllY2VPZmZzZXQgPSBjdXJyZW50LmRvbS5ib3VuZHMuaGFuZHNcbiAgICAgICAgICAgICAgLnBpZWNlQm91bmRzKClcbiAgICAgICAgICAgICAgLmdldCh1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKSk7XG4gICAgICAgICAgICBjb25zdCBib3VuZHMgPSBjdXJyZW50LmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gICAgICAgICAgICBjb25zdCBvdXRQb3MgPVxuICAgICAgICAgICAgICBoYW5kUGllY2VPZmZzZXQgJiYgYm91bmRzXG4gICAgICAgICAgICAgICAgPyB1dGlsLnBvc09mT3V0c2lkZUVsKFxuICAgICAgICAgICAgICAgICAgICBoYW5kUGllY2VPZmZzZXQubGVmdCxcbiAgICAgICAgICAgICAgICAgICAgaGFuZFBpZWNlT2Zmc2V0LnRvcCxcbiAgICAgICAgICAgICAgICAgICAgdXRpbC5zZW50ZVBvdihjdXJyZW50Lm9yaWVudGF0aW9uKSxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudC5kaW1lbnNpb25zLFxuICAgICAgICAgICAgICAgICAgICBib3VuZHMsXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAob3V0UG9zKVxuICAgICAgICAgICAgICBtaXNzaW5ncy5wdXNoKHtcbiAgICAgICAgICAgICAgICBwb3M6IG91dFBvcyxcbiAgICAgICAgICAgICAgICBwaWVjZTogcGllY2UsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBmb3IgKGNvbnN0IG5ld1Agb2YgbmV3cykge1xuICAgIGNvbnN0IHByZVAgPSBjbG9zZXIoXG4gICAgICBuZXdQLFxuICAgICAgbWlzc2luZ3MuZmlsdGVyKChwKSA9PiB7XG4gICAgICAgIGlmICh1dGlsLnNhbWVQaWVjZShuZXdQLnBpZWNlLCBwLnBpZWNlKSkgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vIGNoZWNraW5nIHdoZXRoZXIgcHJvbW90ZWQgcGllY2VzIGFyZSB0aGUgc2FtZVxuICAgICAgICBjb25zdCBwUm9sZSA9IGN1cnJlbnQucHJvbW90aW9uLnByb21vdGVzVG8ocC5waWVjZS5yb2xlKTtcbiAgICAgICAgY29uc3QgcFBpZWNlID0gcFJvbGUgJiYgeyBjb2xvcjogcC5waWVjZS5jb2xvciwgcm9sZTogcFJvbGUgfTtcbiAgICAgICAgY29uc3QgblJvbGUgPSBjdXJyZW50LnByb21vdGlvbi5wcm9tb3Rlc1RvKG5ld1AucGllY2Uucm9sZSk7XG4gICAgICAgIGNvbnN0IG5QaWVjZSA9IG5Sb2xlICYmIHsgY29sb3I6IG5ld1AucGllY2UuY29sb3IsIHJvbGU6IG5Sb2xlIH07XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgKCEhcFBpZWNlICYmIHV0aWwuc2FtZVBpZWNlKG5ld1AucGllY2UsIHBQaWVjZSkpIHx8XG4gICAgICAgICAgKCEhblBpZWNlICYmIHV0aWwuc2FtZVBpZWNlKG5QaWVjZSwgcC5waWVjZSkpXG4gICAgICAgICk7XG4gICAgICB9KSxcbiAgICApO1xuICAgIGlmIChwcmVQKSB7XG4gICAgICBjb25zdCB2ZWN0b3IgPSBbcHJlUC5wb3NbMF0gLSBuZXdQLnBvc1swXSwgcHJlUC5wb3NbMV0gLSBuZXdQLnBvc1sxXV07XG4gICAgICBhbmltcy5zZXQobmV3UC5rZXksIHZlY3Rvci5jb25jYXQodmVjdG9yKSBhcyBBbmltVmVjdG9yKTtcbiAgICAgIGlmIChwcmVQLmtleSkgYW5pbWVkT3JpZ3MucHVzaChwcmVQLmtleSk7XG4gICAgICBpZiAoIXV0aWwuc2FtZVBpZWNlKG5ld1AucGllY2UsIHByZVAucGllY2UpICYmIG5ld1Aua2V5KSBwcm9tb3Rpb25zLnNldChuZXdQLmtleSwgcHJlUC5waWVjZSk7XG4gICAgfVxuICB9XG4gIGZvciAoY29uc3QgcCBvZiBtaXNzaW5ncykge1xuICAgIGlmIChwLmtleSAmJiAhYW5pbWVkT3JpZ3MuaW5jbHVkZXMocC5rZXkpKSBmYWRpbmdzLnNldChwLmtleSwgcC5waWVjZSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGFuaW1zOiBhbmltcyxcbiAgICBmYWRpbmdzOiBmYWRpbmdzLFxuICAgIHByb21vdGlvbnM6IHByb21vdGlvbnMsXG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0ZXAoc3RhdGU6IFN0YXRlLCBub3c6IERPTUhpZ2hSZXNUaW1lU3RhbXApOiB2b2lkIHtcbiAgY29uc3QgY3VyID0gc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQ7XG4gIGlmIChjdXIgPT09IHVuZGVmaW5lZCkge1xuICAgIC8vIGFuaW1hdGlvbiB3YXMgY2FuY2VsZWQgOihcbiAgICBpZiAoIXN0YXRlLmRvbS5kZXN0cm95ZWQpIHN0YXRlLmRvbS5yZWRyYXdOb3coKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgcmVzdCA9IDEgLSAobm93IC0gY3VyLnN0YXJ0KSAqIGN1ci5mcmVxdWVuY3k7XG4gIGlmIChyZXN0IDw9IDApIHtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20ucmVkcmF3Tm93KCk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgZWFzZSA9IGVhc2luZyhyZXN0KTtcbiAgICBmb3IgKGNvbnN0IGNmZyBvZiBjdXIucGxhbi5hbmltcy52YWx1ZXMoKSkge1xuICAgICAgY2ZnWzJdID0gY2ZnWzBdICogZWFzZTtcbiAgICAgIGNmZ1szXSA9IGNmZ1sxXSAqIGVhc2U7XG4gICAgfVxuICAgIHN0YXRlLmRvbS5yZWRyYXdOb3codHJ1ZSk7IC8vIG9wdGltaXNhdGlvbjogZG9uJ3QgcmVuZGVyIFNWRyBjaGFuZ2VzIGR1cmluZyBhbmltYXRpb25zXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKChub3cgPSBwZXJmb3JtYW5jZS5ub3coKSkgPT4gc3RlcChzdGF0ZSwgbm93KSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYW5pbWF0ZTxBPihtdXRhdGlvbjogTXV0YXRpb248QT4sIHN0YXRlOiBTdGF0ZSk6IEEge1xuICAvLyBjbG9uZSBzdGF0ZSBiZWZvcmUgbXV0YXRpbmcgaXRcbiAgY29uc3QgcHJldlBpZWNlczogc2cuUGllY2VzID0gbmV3IE1hcChzdGF0ZS5waWVjZXMpO1xuICBjb25zdCBwcmV2SGFuZHM6IHNnLkhhbmRzID0gbmV3IE1hcChbXG4gICAgWydzZW50ZScsIG5ldyBNYXAoc3RhdGUuaGFuZHMuaGFuZE1hcC5nZXQoJ3NlbnRlJykpXSxcbiAgICBbJ2dvdGUnLCBuZXcgTWFwKHN0YXRlLmhhbmRzLmhhbmRNYXAuZ2V0KCdnb3RlJykpXSxcbiAgXSk7XG5cbiAgY29uc3QgcmVzdWx0ID0gbXV0YXRpb24oc3RhdGUpO1xuICBjb25zdCBwbGFuID0gY29tcHV0ZVBsYW4ocHJldlBpZWNlcywgcHJldkhhbmRzLCBzdGF0ZSk7XG4gIGlmIChwbGFuLmFuaW1zLnNpemUgfHwgcGxhbi5mYWRpbmdzLnNpemUpIHtcbiAgICBjb25zdCBhbHJlYWR5UnVubmluZyA9IHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50Py5zdGFydCAhPT0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0ge1xuICAgICAgc3RhcnQ6IHBlcmZvcm1hbmNlLm5vdygpLFxuICAgICAgZnJlcXVlbmN5OiAxIC8gTWF0aC5tYXgoc3RhdGUuYW5pbWF0aW9uLmR1cmF0aW9uLCAxKSxcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgfTtcbiAgICBpZiAoIWFscmVhZHlSdW5uaW5nKSBzdGVwKHN0YXRlLCBwZXJmb3JtYW5jZS5ub3coKSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gZG9uJ3QgYW5pbWF0ZSwganVzdCByZW5kZXIgcmlnaHQgYXdheVxuICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9ncmUvMTY1MDI5NFxuZnVuY3Rpb24gZWFzaW5nKHQ6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiB0IDwgMC41ID8gNCAqIHQgKiB0ICogdCA6ICh0IC0gMSkgKiAoMiAqIHQgLSAyKSAqICgyICogdCAtIDIpICsgMTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IEhlYWRsZXNzU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyBzYW1lUGllY2UgfSBmcm9tICcuL3V0aWwuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gYWRkVG9IYW5kKHM6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwgY250ID0gMSk6IHZvaWQge1xuICBjb25zdCBoYW5kID0gcy5oYW5kcy5oYW5kTWFwLmdldChwaWVjZS5jb2xvcik7XG4gIGNvbnN0IHJvbGUgPVxuICAgIChzLmhhbmRzLnJvbGVzLmluY2x1ZGVzKHBpZWNlLnJvbGUpID8gcGllY2Uucm9sZSA6IHMucHJvbW90aW9uLnVucHJvbW90ZXNUbyhwaWVjZS5yb2xlKSkgfHxcbiAgICBwaWVjZS5yb2xlO1xuICBpZiAoaGFuZCAmJiBzLmhhbmRzLnJvbGVzLmluY2x1ZGVzKHJvbGUpKSBoYW5kLnNldChyb2xlLCAoaGFuZC5nZXQocm9sZSkgfHwgMCkgKyBjbnQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlRnJvbUhhbmQoczogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBjbnQgPSAxKTogdm9pZCB7XG4gIGNvbnN0IGhhbmQgPSBzLmhhbmRzLmhhbmRNYXAuZ2V0KHBpZWNlLmNvbG9yKTtcbiAgY29uc3Qgcm9sZSA9XG4gICAgKHMuaGFuZHMucm9sZXMuaW5jbHVkZXMocGllY2Uucm9sZSkgPyBwaWVjZS5yb2xlIDogcy5wcm9tb3Rpb24udW5wcm9tb3Rlc1RvKHBpZWNlLnJvbGUpKSB8fFxuICAgIHBpZWNlLnJvbGU7XG4gIGNvbnN0IG51bSA9IGhhbmQ/LmdldChyb2xlKTtcbiAgaWYgKGhhbmQgJiYgbnVtKSBoYW5kLnNldChyb2xlLCBNYXRoLm1heChudW0gLSBjbnQsIDApKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckhhbmQoczogSGVhZGxlc3NTdGF0ZSwgaGFuZEVsOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICBoYW5kRWwuY2xhc3NMaXN0LnRvZ2dsZSgncHJvbW90aW9uJywgISFzLnByb21vdGlvbi5jdXJyZW50KTtcbiAgbGV0IHdyYXBFbCA9IGhhbmRFbC5maXJzdEVsZW1lbnRDaGlsZCBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgd2hpbGUgKHdyYXBFbCkge1xuICAgIGNvbnN0IHBpZWNlRWwgPSB3cmFwRWwuZmlyc3RFbGVtZW50Q2hpbGQgYXMgc2cuUGllY2VOb2RlO1xuICAgIGNvbnN0IHBpZWNlID0geyByb2xlOiBwaWVjZUVsLnNnUm9sZSwgY29sb3I6IHBpZWNlRWwuc2dDb2xvciB9O1xuICAgIGNvbnN0IG51bSA9IHMuaGFuZHMuaGFuZE1hcC5nZXQocGllY2UuY29sb3IpPy5nZXQocGllY2Uucm9sZSkgfHwgMDtcbiAgICBjb25zdCBpc1NlbGVjdGVkID0gISFzLnNlbGVjdGVkUGllY2UgJiYgc2FtZVBpZWNlKHBpZWNlLCBzLnNlbGVjdGVkUGllY2UpICYmICFzLmRyb3BwYWJsZS5zcGFyZTtcblxuICAgIHdyYXBFbC5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgJ3NlbGVjdGVkJyxcbiAgICAgIChzLmFjdGl2ZUNvbG9yID09PSAnYm90aCcgfHwgcy5hY3RpdmVDb2xvciA9PT0gcy50dXJuQ29sb3IpICYmIGlzU2VsZWN0ZWQsXG4gICAgKTtcbiAgICB3cmFwRWwuY2xhc3NMaXN0LnRvZ2dsZShcbiAgICAgICdwcmVzZWxlY3RlZCcsXG4gICAgICBzLmFjdGl2ZUNvbG9yICE9PSAnYm90aCcgJiYgcy5hY3RpdmVDb2xvciAhPT0gcy50dXJuQ29sb3IgJiYgaXNTZWxlY3RlZCxcbiAgICApO1xuICAgIHdyYXBFbC5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgJ2xhc3QtZGVzdCcsXG4gICAgICBzLmhpZ2hsaWdodC5sYXN0RGVzdHMgJiYgISFzLmxhc3RQaWVjZSAmJiBzYW1lUGllY2UocGllY2UsIHMubGFzdFBpZWNlKSxcbiAgICApO1xuICAgIHdyYXBFbC5jbGFzc0xpc3QudG9nZ2xlKCdkcmF3aW5nJywgISFzLmRyYXdhYmxlLnBpZWNlICYmIHNhbWVQaWVjZShzLmRyYXdhYmxlLnBpZWNlLCBwaWVjZSkpO1xuICAgIHdyYXBFbC5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgJ2N1cnJlbnQtcHJlJyxcbiAgICAgICEhcy5wcmVkcm9wcGFibGUuY3VycmVudCAmJiBzYW1lUGllY2Uocy5wcmVkcm9wcGFibGUuY3VycmVudC5waWVjZSwgcGllY2UpLFxuICAgICk7XG4gICAgd3JhcEVsLmRhdGFzZXQubmIgPSBudW0udG9TdHJpbmcoKTtcbiAgICB3cmFwRWwgPSB3cmFwRWwubmV4dEVsZW1lbnRTaWJsaW5nIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgYWRkVG9IYW5kLCByZW1vdmVGcm9tSGFuZCB9IGZyb20gJy4vaGFuZHMuanMnO1xuaW1wb3J0IHR5cGUgeyBIZWFkbGVzc1N0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgY2FsbFVzZXJGdW5jdGlvbiwgb3Bwb3NpdGUsIHBpZWNlTmFtZU9mLCBzYW1lUGllY2UgfSBmcm9tICcuL3V0aWwuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gdG9nZ2xlT3JpZW50YXRpb24oc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiB2b2lkIHtcbiAgc3RhdGUub3JpZW50YXRpb24gPSBvcHBvc2l0ZShzdGF0ZS5vcmllbnRhdGlvbik7XG4gIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID1cbiAgICBzdGF0ZS5kcmFnZ2FibGUuY3VycmVudCA9XG4gICAgc3RhdGUucHJvbW90aW9uLmN1cnJlbnQgPVxuICAgIHN0YXRlLmhvdmVyZWQgPVxuICAgIHN0YXRlLnNlbGVjdGVkID1cbiAgICBzdGF0ZS5zZWxlY3RlZFBpZWNlID1cbiAgICAgIHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0KHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgdW5zZXRQcmVtb3ZlKHN0YXRlKTtcbiAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbiAgY2FuY2VsUHJvbW90aW9uKHN0YXRlKTtcbiAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSBzdGF0ZS5kcmFnZ2FibGUuY3VycmVudCA9IHN0YXRlLmhvdmVyZWQgPSB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRQaWVjZXMoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlczogc2cuUGllY2VzRGlmZik6IHZvaWQge1xuICBmb3IgKGNvbnN0IFtrZXksIHBpZWNlXSBvZiBwaWVjZXMpIHtcbiAgICBpZiAocGllY2UpIHN0YXRlLnBpZWNlcy5zZXQoa2V5LCBwaWVjZSk7XG4gICAgZWxzZSBzdGF0ZS5waWVjZXMuZGVsZXRlKGtleSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldENoZWNrcyhzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgY2hlY2tzVmFsdWU6IHNnLktleVtdIHwgc2cuQ29sb3IgfCBib29sZWFuKTogdm9pZCB7XG4gIGlmIChBcnJheS5pc0FycmF5KGNoZWNrc1ZhbHVlKSkge1xuICAgIHN0YXRlLmNoZWNrcyA9IGNoZWNrc1ZhbHVlO1xuICB9IGVsc2Uge1xuICAgIGlmIChjaGVja3NWYWx1ZSA9PT0gdHJ1ZSkgY2hlY2tzVmFsdWUgPSBzdGF0ZS50dXJuQ29sb3I7XG4gICAgaWYgKGNoZWNrc1ZhbHVlKSB7XG4gICAgICBjb25zdCBjaGVja3M6IHNnLktleVtdID0gW107XG4gICAgICBmb3IgKGNvbnN0IFtrLCBwXSBvZiBzdGF0ZS5waWVjZXMpIHtcbiAgICAgICAgaWYgKHN0YXRlLmhpZ2hsaWdodC5jaGVja1JvbGVzLmluY2x1ZGVzKHAucm9sZSkgJiYgcC5jb2xvciA9PT0gY2hlY2tzVmFsdWUpIGNoZWNrcy5wdXNoKGspO1xuICAgICAgfVxuICAgICAgc3RhdGUuY2hlY2tzID0gY2hlY2tzO1xuICAgIH0gZWxzZSBzdGF0ZS5jaGVja3MgPSB1bmRlZmluZWQ7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0UHJlbW92ZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgb3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXksIHByb206IGJvb2xlYW4pOiB2b2lkIHtcbiAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbiAgc3RhdGUucHJlbW92YWJsZS5jdXJyZW50ID0geyBvcmlnLCBkZXN0LCBwcm9tIH07XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJlbW92YWJsZS5ldmVudHMuc2V0LCBvcmlnLCBkZXN0LCBwcm9tKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuc2V0UHJlbW92ZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICBpZiAoc3RhdGUucHJlbW92YWJsZS5jdXJyZW50KSB7XG4gICAgc3RhdGUucHJlbW92YWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJlbW92YWJsZS5ldmVudHMudW5zZXQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNldFByZWRyb3Aoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb206IGJvb2xlYW4pOiB2b2lkIHtcbiAgdW5zZXRQcmVtb3ZlKHN0YXRlKTtcbiAgc3RhdGUucHJlZHJvcHBhYmxlLmN1cnJlbnQgPSB7IHBpZWNlLCBrZXksIHByb20gfTtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcmVkcm9wcGFibGUuZXZlbnRzLnNldCwgcGllY2UsIGtleSwgcHJvbSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnNldFByZWRyb3Aoc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50KSB7XG4gICAgc3RhdGUucHJlZHJvcHBhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcmVkcm9wcGFibGUuZXZlbnRzLnVuc2V0KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFzZU1vdmUoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBvcmlnOiBzZy5LZXksXG4gIGRlc3Q6IHNnLktleSxcbiAgcHJvbTogYm9vbGVhbixcbik6IHNnLlBpZWNlIHwgYm9vbGVhbiB7XG4gIGNvbnN0IG9yaWdQaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQob3JpZyk7XG4gIGNvbnN0IGRlc3RQaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQoZGVzdCk7XG4gIGlmIChvcmlnID09PSBkZXN0IHx8ICFvcmlnUGllY2UpIHJldHVybiBmYWxzZTtcbiAgY29uc3QgY2FwdHVyZWQgPSBkZXN0UGllY2UgJiYgZGVzdFBpZWNlLmNvbG9yICE9PSBvcmlnUGllY2UuY29sb3IgPyBkZXN0UGllY2UgOiB1bmRlZmluZWQ7XG4gIGNvbnN0IHByb21QaWVjZSA9IHByb20gJiYgcHJvbW90ZVBpZWNlKHN0YXRlLCBvcmlnUGllY2UpO1xuICBpZiAoZGVzdCA9PT0gc3RhdGUuc2VsZWN0ZWQgfHwgb3JpZyA9PT0gc3RhdGUuc2VsZWN0ZWQpIHVuc2VsZWN0KHN0YXRlKTtcbiAgc3RhdGUucGllY2VzLnNldChkZXN0LCBwcm9tUGllY2UgfHwgb3JpZ1BpZWNlKTtcbiAgc3RhdGUucGllY2VzLmRlbGV0ZShvcmlnKTtcbiAgc3RhdGUubGFzdERlc3RzID0gW29yaWcsIGRlc3RdO1xuICBzdGF0ZS5sYXN0UGllY2UgPSB1bmRlZmluZWQ7XG4gIHN0YXRlLmNoZWNrcyA9IHVuZGVmaW5lZDtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMubW92ZSwgb3JpZywgZGVzdCwgcHJvbSwgY2FwdHVyZWQpO1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5jaGFuZ2UpO1xuICByZXR1cm4gY2FwdHVyZWQgfHwgdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2VEcm9wKFxuICBzdGF0ZTogSGVhZGxlc3NTdGF0ZSxcbiAgcGllY2U6IHNnLlBpZWNlLFxuICBrZXk6IHNnLktleSxcbiAgcHJvbTogYm9vbGVhbixcbik6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZUNvdW50ID0gc3RhdGUuaGFuZHMuaGFuZE1hcC5nZXQocGllY2UuY29sb3IpPy5nZXQocGllY2Uucm9sZSkgfHwgMDtcbiAgaWYgKCFwaWVjZUNvdW50ICYmICFzdGF0ZS5kcm9wcGFibGUuc3BhcmUpIHJldHVybiBmYWxzZTtcbiAgY29uc3QgcHJvbVBpZWNlID0gcHJvbSAmJiBwcm9tb3RlUGllY2Uoc3RhdGUsIHBpZWNlKTtcbiAgaWYgKFxuICAgIGtleSA9PT0gc3RhdGUuc2VsZWN0ZWQgfHxcbiAgICAoIXN0YXRlLmRyb3BwYWJsZS5zcGFyZSAmJlxuICAgICAgcGllY2VDb3VudCA9PT0gMSAmJlxuICAgICAgc3RhdGUuc2VsZWN0ZWRQaWVjZSAmJlxuICAgICAgc2FtZVBpZWNlKHN0YXRlLnNlbGVjdGVkUGllY2UsIHBpZWNlKSlcbiAgKVxuICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgc3RhdGUucGllY2VzLnNldChrZXksIHByb21QaWVjZSB8fCBwaWVjZSk7XG4gIHN0YXRlLmxhc3REZXN0cyA9IFtrZXldO1xuICBzdGF0ZS5sYXN0UGllY2UgPSBwaWVjZTtcbiAgc3RhdGUuY2hlY2tzID0gdW5kZWZpbmVkO1xuICBpZiAoIXN0YXRlLmRyb3BwYWJsZS5zcGFyZSkgcmVtb3ZlRnJvbUhhbmQoc3RhdGUsIHBpZWNlKTtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuZHJvcCwgcGllY2UsIGtleSwgcHJvbSk7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBiYXNlVXNlck1vdmUoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBvcmlnOiBzZy5LZXksXG4gIGRlc3Q6IHNnLktleSxcbiAgcHJvbTogYm9vbGVhbixcbik6IHNnLlBpZWNlIHwgYm9vbGVhbiB7XG4gIGNvbnN0IHJlc3VsdCA9IGJhc2VNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0LCBwcm9tKTtcbiAgaWYgKHJlc3VsdCkge1xuICAgIHN0YXRlLm1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZHJvcHBhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLnR1cm5Db2xvciA9IG9wcG9zaXRlKHN0YXRlLnR1cm5Db2xvcik7XG4gICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gYmFzZVVzZXJEcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tOiBib29sZWFuKTogYm9vbGVhbiB7XG4gIGNvbnN0IHJlc3VsdCA9IGJhc2VEcm9wKHN0YXRlLCBwaWVjZSwga2V5LCBwcm9tKTtcbiAgaWYgKHJlc3VsdCkge1xuICAgIHN0YXRlLm1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZHJvcHBhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLnR1cm5Db2xvciA9IG9wcG9zaXRlKHN0YXRlLnR1cm5Db2xvcik7XG4gICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZXJEcm9wKFxuICBzdGF0ZTogSGVhZGxlc3NTdGF0ZSxcbiAgcGllY2U6IHNnLlBpZWNlLFxuICBrZXk6IHNnLktleSxcbiAgcHJvbT86IGJvb2xlYW4sXG4pOiBib29sZWFuIHtcbiAgY29uc3QgcmVhbFByb20gPSBwcm9tIHx8IHN0YXRlLnByb21vdGlvbi5mb3JjZURyb3BQcm9tb3Rpb24ocGllY2UsIGtleSk7XG4gIGlmIChjYW5Ecm9wKHN0YXRlLCBwaWVjZSwga2V5KSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGJhc2VVc2VyRHJvcChzdGF0ZSwgcGllY2UsIGtleSwgcmVhbFByb20pO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZHJvcHBhYmxlLmV2ZW50cy5hZnRlciwgcGllY2UsIGtleSwgcmVhbFByb20sIHsgcHJlbWFkZTogZmFsc2UgfSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoY2FuUHJlZHJvcChzdGF0ZSwgcGllY2UsIGtleSkpIHtcbiAgICBzZXRQcmVkcm9wKHN0YXRlLCBwaWVjZSwga2V5LCByZWFsUHJvbSk7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlck1vdmUoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBvcmlnOiBzZy5LZXksXG4gIGRlc3Q6IHNnLktleSxcbiAgcHJvbT86IGJvb2xlYW4sXG4pOiBib29sZWFuIHtcbiAgY29uc3QgcmVhbFByb20gPSBwcm9tIHx8IHN0YXRlLnByb21vdGlvbi5mb3JjZU1vdmVQcm9tb3Rpb24ob3JpZywgZGVzdCk7XG4gIGlmIChjYW5Nb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGJhc2VVc2VyTW92ZShzdGF0ZSwgb3JpZywgZGVzdCwgcmVhbFByb20pO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgICAgIGNvbnN0IG1ldGFkYXRhOiBzZy5Nb3ZlTWV0YWRhdGEgPSB7IHByZW1hZGU6IGZhbHNlIH07XG4gICAgICBpZiAocmVzdWx0ICE9PSB0cnVlKSBtZXRhZGF0YS5jYXB0dXJlZCA9IHJlc3VsdDtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUubW92YWJsZS5ldmVudHMuYWZ0ZXIsIG9yaWcsIGRlc3QsIHJlYWxQcm9tLCBtZXRhZGF0YSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoY2FuUHJlbW92ZShzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICBzZXRQcmVtb3ZlKHN0YXRlLCBvcmlnLCBkZXN0LCByZWFsUHJvbSk7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFzZVByb21vdGlvbkRpYWxvZyhzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwcm9tb3RlZFBpZWNlID0gcHJvbW90ZVBpZWNlKHN0YXRlLCBwaWVjZSk7XG4gIGlmIChzdGF0ZS52aWV3T25seSB8fCBzdGF0ZS5wcm9tb3Rpb24uY3VycmVudCB8fCAhcHJvbW90ZWRQaWVjZSkgcmV0dXJuIGZhbHNlO1xuXG4gIHN0YXRlLnByb21vdGlvbi5jdXJyZW50ID0geyBwaWVjZSwgcHJvbW90ZWRQaWVjZSwga2V5LCBkcmFnZ2VkOiAhIXN0YXRlLmRyYWdnYWJsZS5jdXJyZW50IH07XG4gIHN0YXRlLmhvdmVyZWQgPSBrZXk7XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9tb3Rpb25EaWFsb2dEcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5KTogYm9vbGVhbiB7XG4gIGlmIChcbiAgICBjYW5Ecm9wUHJvbW90ZShzdGF0ZSwgcGllY2UsIGtleSkgJiZcbiAgICAoY2FuRHJvcChzdGF0ZSwgcGllY2UsIGtleSkgfHwgY2FuUHJlZHJvcChzdGF0ZSwgcGllY2UsIGtleSkpXG4gICkge1xuICAgIGlmIChiYXNlUHJvbW90aW9uRGlhbG9nKHN0YXRlLCBwaWVjZSwga2V5KSkge1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcm9tb3Rpb24uZXZlbnRzLmluaXRpYXRlZCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvbW90aW9uRGlhbG9nTW92ZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgb3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgaWYgKFxuICAgIGNhbk1vdmVQcm9tb3RlKHN0YXRlLCBvcmlnLCBkZXN0KSAmJlxuICAgIChjYW5Nb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSB8fCBjYW5QcmVtb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSlcbiAgKSB7XG4gICAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXMuZ2V0KG9yaWcpO1xuICAgIGlmIChwaWVjZSAmJiBiYXNlUHJvbW90aW9uRGlhbG9nKHN0YXRlLCBwaWVjZSwgZGVzdCkpIHtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJvbW90aW9uLmV2ZW50cy5pbml0aWF0ZWQpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gcHJvbW90ZVBpZWNlKHM6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSk6IHNnLlBpZWNlIHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgcHJvbVJvbGUgPSBzLnByb21vdGlvbi5wcm9tb3Rlc1RvKHBpZWNlLnJvbGUpO1xuICByZXR1cm4gcHJvbVJvbGUgIT09IHVuZGVmaW5lZCA/IHsgY29sb3I6IHBpZWNlLmNvbG9yLCByb2xlOiBwcm9tUm9sZSB9IDogdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVsZXRlUGllY2Uoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIGtleTogc2cuS2V5KTogdm9pZCB7XG4gIGlmIChzdGF0ZS5waWVjZXMuZGVsZXRlKGtleSkpIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RTcXVhcmUoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBrZXk6IHNnLktleSxcbiAgcHJvbT86IGJvb2xlYW4sXG4gIGZvcmNlPzogYm9vbGVhbixcbik6IHZvaWQge1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5zZWxlY3QsIGtleSk7XG5cbiAgLy8gdW5zZWxlY3QgaWYgc2VsZWN0aW5nIHNlbGVjdGVkIGtleSwga2VlcCBzZWxlY3RlZCBmb3IgZHJhZ1xuICBpZiAoIXN0YXRlLmRyYWdnYWJsZS5lbmFibGVkICYmIHN0YXRlLnNlbGVjdGVkID09PSBrZXkpIHtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy51bnNlbGVjdCwga2V5KTtcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gdHJ5IG1vdmluZy9kcm9wcGluZ1xuICBpZiAoXG4gICAgc3RhdGUuc2VsZWN0YWJsZS5lbmFibGVkIHx8XG4gICAgZm9yY2UgfHxcbiAgICAoc3RhdGUuc2VsZWN0YWJsZS5mb3JjZVNwYXJlcyAmJiBzdGF0ZS5zZWxlY3RlZFBpZWNlICYmIHN0YXRlLmRyb3BwYWJsZS5zcGFyZSlcbiAgKSB7XG4gICAgaWYgKHN0YXRlLnNlbGVjdGVkUGllY2UgJiYgdXNlckRyb3Aoc3RhdGUsIHN0YXRlLnNlbGVjdGVkUGllY2UsIGtleSwgcHJvbSkpIHJldHVybjtcbiAgICBlbHNlIGlmIChzdGF0ZS5zZWxlY3RlZCAmJiB1c2VyTW92ZShzdGF0ZSwgc3RhdGUuc2VsZWN0ZWQsIGtleSwgcHJvbSkpIHJldHVybjtcbiAgfVxuXG4gIGlmIChcbiAgICAoc3RhdGUuc2VsZWN0YWJsZS5lbmFibGVkIHx8IHN0YXRlLmRyYWdnYWJsZS5lbmFibGVkIHx8IGZvcmNlKSAmJlxuICAgIChpc01vdmFibGUoc3RhdGUsIGtleSkgfHwgaXNQcmVtb3ZhYmxlKHN0YXRlLCBrZXkpKVxuICApIHtcbiAgICBzZXRTZWxlY3RlZChzdGF0ZSwga2V5KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0UGllY2UoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBwaWVjZTogc2cuUGllY2UsXG4gIHNwYXJlPzogYm9vbGVhbixcbiAgZm9yY2U/OiBib29sZWFuLFxuICBhcGk/OiBib29sZWFuLFxuKTogdm9pZCB7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLnBpZWNlU2VsZWN0LCBwaWVjZSk7XG5cbiAgaWYgKHN0YXRlLnNlbGVjdGFibGUuYWRkU3BhcmVzVG9IYW5kICYmIHN0YXRlLmRyb3BwYWJsZS5zcGFyZSAmJiBzdGF0ZS5zZWxlY3RlZFBpZWNlKSB7XG4gICAgYWRkVG9IYW5kKHN0YXRlLCB7IHJvbGU6IHN0YXRlLnNlbGVjdGVkUGllY2Uucm9sZSwgY29sb3I6IHBpZWNlLmNvbG9yIH0pO1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICB9IGVsc2UgaWYgKFxuICAgICFhcGkgJiZcbiAgICAhc3RhdGUuZHJhZ2dhYmxlLmVuYWJsZWQgJiZcbiAgICBzdGF0ZS5zZWxlY3RlZFBpZWNlICYmXG4gICAgc2FtZVBpZWNlKHN0YXRlLnNlbGVjdGVkUGllY2UsIHBpZWNlKVxuICApIHtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5waWVjZVVuc2VsZWN0LCBwaWVjZSk7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICB9IGVsc2UgaWYgKFxuICAgIChzdGF0ZS5zZWxlY3RhYmxlLmVuYWJsZWQgfHwgc3RhdGUuZHJhZ2dhYmxlLmVuYWJsZWQgfHwgZm9yY2UpICYmXG4gICAgKGlzRHJvcHBhYmxlKHN0YXRlLCBwaWVjZSwgISFzcGFyZSkgfHwgaXNQcmVkcm9wcGFibGUoc3RhdGUsIHBpZWNlKSlcbiAgKSB7XG4gICAgc2V0U2VsZWN0ZWRQaWVjZShzdGF0ZSwgcGllY2UpO1xuICAgIHN0YXRlLmRyb3BwYWJsZS5zcGFyZSA9ICEhc3BhcmU7XG4gIH0gZWxzZSB7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRTZWxlY3RlZChzdGF0ZTogSGVhZGxlc3NTdGF0ZSwga2V5OiBzZy5LZXkpOiB2b2lkIHtcbiAgdW5zZWxlY3Qoc3RhdGUpO1xuICBzdGF0ZS5zZWxlY3RlZCA9IGtleTtcbiAgc2V0UHJlRGVzdHMoc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0U2VsZWN0ZWRQaWVjZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlKTogdm9pZCB7XG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgc3RhdGUuc2VsZWN0ZWRQaWVjZSA9IHBpZWNlO1xuICBzZXRQcmVEZXN0cyhzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRQcmVEZXN0cyhzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICBzdGF0ZS5wcmVtb3ZhYmxlLmRlc3RzID0gc3RhdGUucHJlZHJvcHBhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuXG4gIGlmIChzdGF0ZS5zZWxlY3RlZCAmJiBpc1ByZW1vdmFibGUoc3RhdGUsIHN0YXRlLnNlbGVjdGVkKSAmJiBzdGF0ZS5wcmVtb3ZhYmxlLmdlbmVyYXRlKVxuICAgIHN0YXRlLnByZW1vdmFibGUuZGVzdHMgPSBzdGF0ZS5wcmVtb3ZhYmxlLmdlbmVyYXRlKHN0YXRlLnNlbGVjdGVkLCBzdGF0ZS5waWVjZXMpO1xuICBlbHNlIGlmIChcbiAgICBzdGF0ZS5zZWxlY3RlZFBpZWNlICYmXG4gICAgaXNQcmVkcm9wcGFibGUoc3RhdGUsIHN0YXRlLnNlbGVjdGVkUGllY2UpICYmXG4gICAgc3RhdGUucHJlZHJvcHBhYmxlLmdlbmVyYXRlXG4gIClcbiAgICBzdGF0ZS5wcmVkcm9wcGFibGUuZGVzdHMgPSBzdGF0ZS5wcmVkcm9wcGFibGUuZ2VuZXJhdGUoc3RhdGUuc2VsZWN0ZWRQaWVjZSwgc3RhdGUucGllY2VzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuc2VsZWN0KHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIHN0YXRlLnNlbGVjdGVkID1cbiAgICBzdGF0ZS5zZWxlY3RlZFBpZWNlID1cbiAgICBzdGF0ZS5wcmVtb3ZhYmxlLmRlc3RzID1cbiAgICBzdGF0ZS5wcmVkcm9wcGFibGUuZGVzdHMgPVxuICAgIHN0YXRlLnByb21vdGlvbi5jdXJyZW50ID1cbiAgICAgIHVuZGVmaW5lZDtcbiAgc3RhdGUuZHJvcHBhYmxlLnNwYXJlID0gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGlzTW92YWJsZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgb3JpZzogc2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzLmdldChvcmlnKTtcbiAgcmV0dXJuIChcbiAgICAhIXBpZWNlICYmXG4gICAgKHN0YXRlLmFjdGl2ZUNvbG9yID09PSAnYm90aCcgfHxcbiAgICAgIChzdGF0ZS5hY3RpdmVDb2xvciA9PT0gcGllY2UuY29sb3IgJiYgc3RhdGUudHVybkNvbG9yID09PSBwaWVjZS5jb2xvcikpXG4gICk7XG59XG5cbmZ1bmN0aW9uIGlzRHJvcHBhYmxlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIHNwYXJlOiBib29sZWFuKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgKHNwYXJlIHx8ICEhc3RhdGUuaGFuZHMuaGFuZE1hcC5nZXQocGllY2UuY29sb3IpPy5nZXQocGllY2Uucm9sZSkpICYmXG4gICAgKHN0YXRlLmFjdGl2ZUNvbG9yID09PSAnYm90aCcgfHxcbiAgICAgIChzdGF0ZS5hY3RpdmVDb2xvciA9PT0gcGllY2UuY29sb3IgJiYgc3RhdGUudHVybkNvbG9yID09PSBwaWVjZS5jb2xvcikpXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5Nb3ZlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIG9yaWcgIT09IGRlc3QgJiZcbiAgICBpc01vdmFibGUoc3RhdGUsIG9yaWcpICYmXG4gICAgKHN0YXRlLm1vdmFibGUuZnJlZSB8fCAhIXN0YXRlLm1vdmFibGUuZGVzdHM/LmdldChvcmlnKT8uaW5jbHVkZXMoZGVzdCkpXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5Ecm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGRlc3Q6IHNnLktleSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIGlzRHJvcHBhYmxlKHN0YXRlLCBwaWVjZSwgc3RhdGUuZHJvcHBhYmxlLnNwYXJlKSAmJlxuICAgIChzdGF0ZS5kcm9wcGFibGUuZnJlZSB8fFxuICAgICAgc3RhdGUuZHJvcHBhYmxlLnNwYXJlIHx8XG4gICAgICAhIXN0YXRlLmRyb3BwYWJsZS5kZXN0cz8uZ2V0KHBpZWNlTmFtZU9mKHBpZWNlKSk/LmluY2x1ZGVzKGRlc3QpKVxuICApO1xufVxuXG5mdW5jdGlvbiBjYW5Nb3ZlUHJvbW90ZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgb3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXMuZ2V0KG9yaWcpO1xuICByZXR1cm4gISFwaWVjZSAmJiBzdGF0ZS5wcm9tb3Rpb24ubW92ZVByb21vdGlvbkRpYWxvZyhvcmlnLCBkZXN0KTtcbn1cblxuZnVuY3Rpb24gY2FuRHJvcFByb21vdGUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgcmV0dXJuICFzdGF0ZS5kcm9wcGFibGUuc3BhcmUgJiYgc3RhdGUucHJvbW90aW9uLmRyb3BQcm9tb3Rpb25EaWFsb2cocGllY2UsIGtleSk7XG59XG5cbmZ1bmN0aW9uIGlzUHJlbW92YWJsZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgb3JpZzogc2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzLmdldChvcmlnKTtcbiAgcmV0dXJuIChcbiAgICAhIXBpZWNlICYmXG4gICAgc3RhdGUucHJlbW92YWJsZS5lbmFibGVkICYmXG4gICAgc3RhdGUuYWN0aXZlQ29sb3IgPT09IHBpZWNlLmNvbG9yICYmXG4gICAgc3RhdGUudHVybkNvbG9yICE9PSBwaWVjZS5jb2xvclxuICApO1xufVxuXG5mdW5jdGlvbiBpc1ByZWRyb3BwYWJsZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgISFzdGF0ZS5oYW5kcy5oYW5kTWFwLmdldChwaWVjZS5jb2xvcik/LmdldChwaWVjZS5yb2xlKSAmJlxuICAgIHN0YXRlLnByZWRyb3BwYWJsZS5lbmFibGVkICYmXG4gICAgc3RhdGUuYWN0aXZlQ29sb3IgPT09IHBpZWNlLmNvbG9yICYmXG4gICAgc3RhdGUudHVybkNvbG9yICE9PSBwaWVjZS5jb2xvclxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuUHJlbW92ZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgb3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBvcmlnICE9PSBkZXN0ICYmXG4gICAgaXNQcmVtb3ZhYmxlKHN0YXRlLCBvcmlnKSAmJlxuICAgICEhc3RhdGUucHJlbW92YWJsZS5nZW5lcmF0ZSAmJlxuICAgIHN0YXRlLnByZW1vdmFibGUuZ2VuZXJhdGUob3JpZywgc3RhdGUucGllY2VzKS5pbmNsdWRlcyhkZXN0KVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuUHJlZHJvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBkZXN0OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgY29uc3QgZGVzdFBpZWNlID0gc3RhdGUucGllY2VzLmdldChkZXN0KTtcbiAgcmV0dXJuIChcbiAgICBpc1ByZWRyb3BwYWJsZShzdGF0ZSwgcGllY2UpICYmXG4gICAgKCFkZXN0UGllY2UgfHwgZGVzdFBpZWNlLmNvbG9yICE9PSBzdGF0ZS5hY3RpdmVDb2xvcikgJiZcbiAgICAhIXN0YXRlLnByZWRyb3BwYWJsZS5nZW5lcmF0ZSAmJlxuICAgIHN0YXRlLnByZWRyb3BwYWJsZS5nZW5lcmF0ZShwaWVjZSwgc3RhdGUucGllY2VzKS5pbmNsdWRlcyhkZXN0KVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEcmFnZ2FibGUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIHN0YXRlLmRyYWdnYWJsZS5lbmFibGVkICYmXG4gICAgKHN0YXRlLmFjdGl2ZUNvbG9yID09PSAnYm90aCcgfHxcbiAgICAgIChzdGF0ZS5hY3RpdmVDb2xvciA9PT0gcGllY2UuY29sb3IgJiZcbiAgICAgICAgKHN0YXRlLnR1cm5Db2xvciA9PT0gcGllY2UuY29sb3IgfHwgc3RhdGUucHJlbW92YWJsZS5lbmFibGVkKSkpXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwbGF5UHJlbW92ZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IGJvb2xlYW4ge1xuICBjb25zdCBtb3ZlID0gc3RhdGUucHJlbW92YWJsZS5jdXJyZW50O1xuICBpZiAoIW1vdmUpIHJldHVybiBmYWxzZTtcbiAgY29uc3Qgb3JpZyA9IG1vdmUub3JpZztcbiAgY29uc3QgZGVzdCA9IG1vdmUuZGVzdDtcbiAgY29uc3QgcHJvbSA9IG1vdmUucHJvbTtcbiAgbGV0IHN1Y2Nlc3MgPSBmYWxzZTtcbiAgaWYgKGNhbk1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYmFzZVVzZXJNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0LCBwcm9tKTtcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICBjb25zdCBtZXRhZGF0YTogc2cuTW92ZU1ldGFkYXRhID0geyBwcmVtYWRlOiB0cnVlIH07XG4gICAgICBpZiAocmVzdWx0ICE9PSB0cnVlKSBtZXRhZGF0YS5jYXB0dXJlZCA9IHJlc3VsdDtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUubW92YWJsZS5ldmVudHMuYWZ0ZXIsIG9yaWcsIGRlc3QsIHByb20sIG1ldGFkYXRhKTtcbiAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgIH1cbiAgfVxuICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICByZXR1cm4gc3VjY2Vzcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBsYXlQcmVkcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogYm9vbGVhbiB7XG4gIGNvbnN0IGRyb3AgPSBzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudDtcbiAgaWYgKCFkcm9wKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IHBpZWNlID0gZHJvcC5waWVjZTtcbiAgY29uc3Qga2V5ID0gZHJvcC5rZXk7XG4gIGNvbnN0IHByb20gPSBkcm9wLnByb207XG4gIGxldCBzdWNjZXNzID0gZmFsc2U7XG4gIGlmIChjYW5Ecm9wKHN0YXRlLCBwaWVjZSwga2V5KSkge1xuICAgIGlmIChiYXNlVXNlckRyb3Aoc3RhdGUsIHBpZWNlLCBrZXksIHByb20pKSB7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmRyb3BwYWJsZS5ldmVudHMuYWZ0ZXIsIHBpZWNlLCBrZXksIHByb20sIHsgcHJlbWFkZTogdHJ1ZSB9KTtcbiAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgIH1cbiAgfVxuICB1bnNldFByZWRyb3Aoc3RhdGUpO1xuICByZXR1cm4gc3VjY2Vzcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbmNlbE1vdmVPckRyb3Aoc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiB2b2lkIHtcbiAgdW5zZXRQcmVtb3ZlKHN0YXRlKTtcbiAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbiAgdW5zZWxlY3Qoc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsUHJvbW90aW9uKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIGlmICghc3RhdGUucHJvbW90aW9uLmN1cnJlbnQpIHJldHVybjtcblxuICB1bnNlbGVjdChzdGF0ZSk7XG4gIHN0YXRlLnByb21vdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICBzdGF0ZS5ob3ZlcmVkID0gdW5kZWZpbmVkO1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByb21vdGlvbi5ldmVudHMuY2FuY2VsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0b3Aoc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiB2b2lkIHtcbiAgc3RhdGUuYWN0aXZlQ29sb3IgPVxuICAgIHN0YXRlLm1vdmFibGUuZGVzdHMgPVxuICAgIHN0YXRlLmRyb3BwYWJsZS5kZXN0cyA9XG4gICAgc3RhdGUuZHJhZ2dhYmxlLmN1cnJlbnQgPVxuICAgIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID1cbiAgICBzdGF0ZS5wcm9tb3Rpb24uY3VycmVudCA9XG4gICAgc3RhdGUuaG92ZXJlZCA9XG4gICAgICB1bmRlZmluZWQ7XG4gIGNhbmNlbE1vdmVPckRyb3Aoc3RhdGUpO1xufVxuIiwgImltcG9ydCB7IGZpbGVzLCByYW5rcyB9IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyBwb3Mya2V5IH0gZnJvbSAnLi91dGlsLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGluZmVyRGltZW5zaW9ucyhib2FyZFNmZW46IHNnLkJvYXJkU2Zlbik6IHNnLkRpbWVuc2lvbnMge1xuICBjb25zdCByYW5rcyA9IGJvYXJkU2Zlbi5zcGxpdCgnLycpO1xuICBjb25zdCBmaXJzdEZpbGUgPSByYW5rc1swXS5zcGxpdCgnJyk7XG4gIGxldCBmaWxlc0NudCA9IDA7XG4gIGxldCBjbnQgPSAwO1xuICBmb3IgKGNvbnN0IGMgb2YgZmlyc3RGaWxlKSB7XG4gICAgY29uc3QgbmIgPSBjLmNoYXJDb2RlQXQoMCk7XG4gICAgaWYgKG5iIDwgNTggJiYgbmIgPiA0NykgY250ID0gY250ICogMTAgKyBuYiAtIDQ4O1xuICAgIGVsc2UgaWYgKGMgIT09ICcrJykge1xuICAgICAgZmlsZXNDbnQgKz0gY250ICsgMTtcbiAgICAgIGNudCA9IDA7XG4gICAgfVxuICB9XG4gIGZpbGVzQ250ICs9IGNudDtcbiAgcmV0dXJuIHsgZmlsZXM6IGZpbGVzQ250LCByYW5rczogcmFua3MubGVuZ3RoIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZmVuVG9Cb2FyZChcbiAgc2Zlbjogc2cuQm9hcmRTZmVuLFxuICBkaW1zOiBzZy5EaW1lbnNpb25zLFxuICBmcm9tRm9yc3l0aD86IChmb3JzeXRoOiBzdHJpbmcpID0+IHNnLlJvbGVTdHJpbmcgfCB1bmRlZmluZWQsXG4pOiBzZy5QaWVjZXMge1xuICBjb25zdCBzZmVuUGFyc2VyID0gZnJvbUZvcnN5dGggfHwgc3RhbmRhcmRGcm9tRm9yc3l0aDtcbiAgY29uc3QgcGllY2VzOiBzZy5QaWVjZXMgPSBuZXcgTWFwKCk7XG4gIGxldCB4ID0gZGltcy5maWxlcyAtIDE7XG4gIGxldCB5ID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgc3dpdGNoIChzZmVuW2ldKSB7XG4gICAgICBjYXNlICcgJzpcbiAgICAgIGNhc2UgJ18nOlxuICAgICAgICByZXR1cm4gcGllY2VzO1xuICAgICAgY2FzZSAnLyc6XG4gICAgICAgICsreTtcbiAgICAgICAgaWYgKHkgPiBkaW1zLnJhbmtzIC0gMSkgcmV0dXJuIHBpZWNlcztcbiAgICAgICAgeCA9IGRpbXMuZmlsZXMgLSAxO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgY29uc3QgbmIxID0gc2ZlbltpXS5jaGFyQ29kZUF0KDApO1xuICAgICAgICBjb25zdCBuYjIgPSBzZmVuW2kgKyAxXSAmJiBzZmVuW2kgKyAxXS5jaGFyQ29kZUF0KDApO1xuICAgICAgICBpZiAobmIxIDwgNTggJiYgbmIxID4gNDcpIHtcbiAgICAgICAgICBpZiAobmIyICYmIG5iMiA8IDU4ICYmIG5iMiA+IDQ3KSB7XG4gICAgICAgICAgICB4IC09IChuYjEgLSA0OCkgKiAxMCArIChuYjIgLSA0OCk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgfSBlbHNlIHggLT0gbmIxIC0gNDg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3Qgcm9sZVN0ciA9IHNmZW5baV0gPT09ICcrJyAmJiBzZmVuLmxlbmd0aCA+IGkgKyAxID8gYCske3NmZW5bKytpXX1gIDogc2ZlbltpXTtcbiAgICAgICAgICBjb25zdCByb2xlID0gc2ZlblBhcnNlcihyb2xlU3RyKTtcbiAgICAgICAgICBpZiAoeCA+PSAwICYmIHJvbGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbG9yID0gcm9sZVN0ciA9PT0gcm9sZVN0ci50b0xvd2VyQ2FzZSgpID8gJ2dvdGUnIDogJ3NlbnRlJztcbiAgICAgICAgICAgIHBpZWNlcy5zZXQocG9zMmtleShbeCwgeV0pLCB7XG4gICAgICAgICAgICAgIHJvbGU6IHJvbGUsXG4gICAgICAgICAgICAgIGNvbG9yOiBjb2xvcixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICAtLXg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBpZWNlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJvYXJkVG9TZmVuKFxuICBwaWVjZXM6IHNnLlBpZWNlcyxcbiAgZGltczogc2cuRGltZW5zaW9ucyxcbiAgdG9Gb3JzeXRoPzogKHJvbGU6IHNnLlJvbGVTdHJpbmcpID0+IHN0cmluZyB8IHVuZGVmaW5lZCxcbik6IHNnLkJvYXJkU2ZlbiB7XG4gIGNvbnN0IHNmZW5SZW5kZXJlciA9IHRvRm9yc3l0aCB8fCBzdGFuZGFyZFRvRm9yc3l0aDtcbiAgY29uc3QgcmV2ZXJzZWRGaWxlcyA9IGZpbGVzLnNsaWNlKDAsIGRpbXMuZmlsZXMpLnJldmVyc2UoKTtcbiAgcmV0dXJuIHJhbmtzXG4gICAgLnNsaWNlKDAsIGRpbXMucmFua3MpXG4gICAgLm1hcCgoeSkgPT5cbiAgICAgIHJldmVyc2VkRmlsZXNcbiAgICAgICAgLm1hcCgoeCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHBpZWNlID0gcGllY2VzLmdldCgoeCArIHkpIGFzIHNnLktleSk7XG4gICAgICAgICAgY29uc3QgZm9yc3l0aCA9IHBpZWNlICYmIHNmZW5SZW5kZXJlcihwaWVjZS5yb2xlKTtcbiAgICAgICAgICBpZiAoZm9yc3l0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHBpZWNlLmNvbG9yID09PSAnc2VudGUnID8gZm9yc3l0aC50b1VwcGVyQ2FzZSgpIDogZm9yc3l0aC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIH0gZWxzZSByZXR1cm4gJzEnO1xuICAgICAgICB9KVxuICAgICAgICAuam9pbignJyksXG4gICAgKVxuICAgIC5qb2luKCcvJylcbiAgICAucmVwbGFjZSgvMXsyLH0vZywgKHMpID0+IHMubGVuZ3RoLnRvU3RyaW5nKCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2ZlblRvSGFuZHMoXG4gIHNmZW46IHNnLkhhbmRzU2ZlbixcbiAgZnJvbUZvcnN5dGg/OiAoZm9yc3l0aDogc3RyaW5nKSA9PiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkLFxuKTogc2cuSGFuZHMge1xuICBjb25zdCBzZmVuUGFyc2VyID0gZnJvbUZvcnN5dGggfHwgc3RhbmRhcmRGcm9tRm9yc3l0aDtcbiAgY29uc3Qgc2VudGU6IHNnLkhhbmQgPSBuZXcgTWFwKCk7XG4gIGNvbnN0IGdvdGU6IHNnLkhhbmQgPSBuZXcgTWFwKCk7XG5cbiAgbGV0IHRtcE51bSA9IDA7XG4gIGxldCBudW0gPSAxO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHNmZW4ubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBuYiA9IHNmZW5baV0uY2hhckNvZGVBdCgwKTtcbiAgICBpZiAobmIgPCA1OCAmJiBuYiA+IDQ3KSB7XG4gICAgICB0bXBOdW0gPSB0bXBOdW0gKiAxMCArIG5iIC0gNDg7XG4gICAgICBudW0gPSB0bXBOdW07XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHJvbGVTdHIgPSBzZmVuW2ldID09PSAnKycgJiYgc2Zlbi5sZW5ndGggPiBpICsgMSA/IGArJHtzZmVuWysraV19YCA6IHNmZW5baV07XG4gICAgICBjb25zdCByb2xlID0gc2ZlblBhcnNlcihyb2xlU3RyKTtcbiAgICAgIGlmIChyb2xlKSB7XG4gICAgICAgIGNvbnN0IGNvbG9yID0gcm9sZVN0ciA9PT0gcm9sZVN0ci50b0xvd2VyQ2FzZSgpID8gJ2dvdGUnIDogJ3NlbnRlJztcbiAgICAgICAgaWYgKGNvbG9yID09PSAnc2VudGUnKSBzZW50ZS5zZXQocm9sZSwgKHNlbnRlLmdldChyb2xlKSB8fCAwKSArIG51bSk7XG4gICAgICAgIGVsc2UgZ290ZS5zZXQocm9sZSwgKGdvdGUuZ2V0KHJvbGUpIHx8IDApICsgbnVtKTtcbiAgICAgIH1cbiAgICAgIHRtcE51bSA9IDA7XG4gICAgICBudW0gPSAxO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgTWFwKFtcbiAgICBbJ3NlbnRlJywgc2VudGVdLFxuICAgIFsnZ290ZScsIGdvdGVdLFxuICBdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRzVG9TZmVuKFxuICBoYW5kczogc2cuSGFuZHMsXG4gIHJvbGVzOiBzZy5Sb2xlU3RyaW5nW10sXG4gIHRvRm9yc3l0aD86IChyb2xlOiBzZy5Sb2xlU3RyaW5nKSA9PiBzdHJpbmcgfCB1bmRlZmluZWQsXG4pOiBzZy5IYW5kc1NmZW4ge1xuICBjb25zdCBzZmVuUmVuZGVyZXIgPSB0b0ZvcnN5dGggfHwgc3RhbmRhcmRUb0ZvcnN5dGg7XG5cbiAgbGV0IHNlbnRlSGFuZFN0ciA9ICcnO1xuICBsZXQgZ290ZUhhbmRTdHIgPSAnJztcbiAgZm9yIChjb25zdCByb2xlIG9mIHJvbGVzKSB7XG4gICAgY29uc3QgZm9yc3l0aCA9IHNmZW5SZW5kZXJlcihyb2xlKTtcbiAgICBpZiAoZm9yc3l0aCkge1xuICAgICAgY29uc3Qgc2VudGVDbnQgPSBoYW5kcy5nZXQoJ3NlbnRlJyk/LmdldChyb2xlKTtcbiAgICAgIGNvbnN0IGdvdGVDbnQgPSBoYW5kcy5nZXQoJ2dvdGUnKT8uZ2V0KHJvbGUpO1xuICAgICAgaWYgKHNlbnRlQ250KSBzZW50ZUhhbmRTdHIgKz0gc2VudGVDbnQgPiAxID8gc2VudGVDbnQudG9TdHJpbmcoKSArIGZvcnN5dGggOiBmb3JzeXRoO1xuICAgICAgaWYgKGdvdGVDbnQpIGdvdGVIYW5kU3RyICs9IGdvdGVDbnQgPiAxID8gZ290ZUNudC50b1N0cmluZygpICsgZm9yc3l0aCA6IGZvcnN5dGg7XG4gICAgfVxuICB9XG4gIGlmIChzZW50ZUhhbmRTdHIgfHwgZ290ZUhhbmRTdHIpIHJldHVybiBzZW50ZUhhbmRTdHIudG9VcHBlckNhc2UoKSArIGdvdGVIYW5kU3RyLnRvTG93ZXJDYXNlKCk7XG4gIGVsc2UgcmV0dXJuICctJztcbn1cblxuZnVuY3Rpb24gc3RhbmRhcmRGcm9tRm9yc3l0aChmb3JzeXRoOiBzdHJpbmcpOiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgc3dpdGNoIChmb3JzeXRoLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdwJzpcbiAgICAgIHJldHVybiAncGF3bic7XG4gICAgY2FzZSAnbCc6XG4gICAgICByZXR1cm4gJ2xhbmNlJztcbiAgICBjYXNlICduJzpcbiAgICAgIHJldHVybiAna25pZ2h0JztcbiAgICBjYXNlICdzJzpcbiAgICAgIHJldHVybiAnc2lsdmVyJztcbiAgICBjYXNlICdnJzpcbiAgICAgIHJldHVybiAnZ29sZCc7XG4gICAgY2FzZSAnYic6XG4gICAgICByZXR1cm4gJ2Jpc2hvcCc7XG4gICAgY2FzZSAncic6XG4gICAgICByZXR1cm4gJ3Jvb2snO1xuICAgIGNhc2UgJytwJzpcbiAgICAgIHJldHVybiAndG9raW4nO1xuICAgIGNhc2UgJytsJzpcbiAgICAgIHJldHVybiAncHJvbW90ZWRsYW5jZSc7XG4gICAgY2FzZSAnK24nOlxuICAgICAgcmV0dXJuICdwcm9tb3RlZGtuaWdodCc7XG4gICAgY2FzZSAnK3MnOlxuICAgICAgcmV0dXJuICdwcm9tb3RlZHNpbHZlcic7XG4gICAgY2FzZSAnK2InOlxuICAgICAgcmV0dXJuICdob3JzZSc7XG4gICAgY2FzZSAnK3InOlxuICAgICAgcmV0dXJuICdkcmFnb24nO1xuICAgIGNhc2UgJ2snOlxuICAgICAgcmV0dXJuICdraW5nJztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuO1xuICB9XG59XG5leHBvcnQgZnVuY3Rpb24gc3RhbmRhcmRUb0ZvcnN5dGgocm9sZTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgc3dpdGNoIChyb2xlKSB7XG4gICAgY2FzZSAncGF3bic6XG4gICAgICByZXR1cm4gJ3AnO1xuICAgIGNhc2UgJ2xhbmNlJzpcbiAgICAgIHJldHVybiAnbCc7XG4gICAgY2FzZSAna25pZ2h0JzpcbiAgICAgIHJldHVybiAnbic7XG4gICAgY2FzZSAnc2lsdmVyJzpcbiAgICAgIHJldHVybiAncyc7XG4gICAgY2FzZSAnZ29sZCc6XG4gICAgICByZXR1cm4gJ2cnO1xuICAgIGNhc2UgJ2Jpc2hvcCc6XG4gICAgICByZXR1cm4gJ2InO1xuICAgIGNhc2UgJ3Jvb2snOlxuICAgICAgcmV0dXJuICdyJztcbiAgICBjYXNlICd0b2tpbic6XG4gICAgICByZXR1cm4gJytwJztcbiAgICBjYXNlICdwcm9tb3RlZGxhbmNlJzpcbiAgICAgIHJldHVybiAnK2wnO1xuICAgIGNhc2UgJ3Byb21vdGVka25pZ2h0JzpcbiAgICAgIHJldHVybiAnK24nO1xuICAgIGNhc2UgJ3Byb21vdGVkc2lsdmVyJzpcbiAgICAgIHJldHVybiAnK3MnO1xuICAgIGNhc2UgJ2hvcnNlJzpcbiAgICAgIHJldHVybiAnK2InO1xuICAgIGNhc2UgJ2RyYWdvbic6XG4gICAgICByZXR1cm4gJytyJztcbiAgICBjYXNlICdraW5nJzpcbiAgICAgIHJldHVybiAnayc7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybjtcbiAgfVxufVxuIiwgImltcG9ydCB7IHNldENoZWNrcywgc2V0UHJlRGVzdHMgfSBmcm9tICcuL2JvYXJkLmpzJztcbmltcG9ydCB0eXBlIHsgRHJhd1NoYXBlLCBTcXVhcmVIaWdobGlnaHQgfSBmcm9tICcuL2RyYXcuanMnO1xuaW1wb3J0IHsgaW5mZXJEaW1lbnNpb25zLCBzZmVuVG9Cb2FyZCwgc2ZlblRvSGFuZHMgfSBmcm9tICcuL3NmZW4uanMnO1xuaW1wb3J0IHR5cGUgeyBIZWFkbGVzc1N0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbmZpZyB7XG4gIHNmZW4/OiB7XG4gICAgYm9hcmQ/OiBzZy5Cb2FyZFNmZW47IC8vIHBpZWNlcyBvbiB0aGUgYm9hcmQgaW4gRm9yc3l0aCBub3RhdGlvblxuICAgIGhhbmRzPzogc2cuSGFuZHNTZmVuOyAvLyBwaWVjZXMgaW4gaGFuZCBpbiBGb3JzeXRoIG5vdGF0aW9uXG4gIH07XG4gIG9yaWVudGF0aW9uPzogc2cuQ29sb3I7IC8vIGJvYXJkIG9yaWVudGF0aW9uLiBzZW50ZSB8IGdvdGVcbiAgdHVybkNvbG9yPzogc2cuQ29sb3I7IC8vIHR1cm4gdG8gcGxheS4gc2VudGUgfCBnb3RlXG4gIGFjdGl2ZUNvbG9yPzogc2cuQ29sb3IgfCAnYm90aCc7IC8vIGNvbG9yIHRoYXQgY2FuIG1vdmUgb3IgZHJvcC4gc2VudGUgfCBnb3RlIHwgYm90aCB8IHVuZGVmaW5lZFxuICBjaGVja3M/OiBzZy5LZXlbXSB8IHNnLkNvbG9yIHwgYm9vbGVhbjsgLy8gc3F1YXJlcyBjdXJyZW50bHkgaW4gY2hlY2sgW1wiNWFcIl0sIGNvbG9yIGluIGNoZWNrIChzZWUgaGlnaGxpZ2h0LmNoZWNrUm9sZXMpIG9yIGJvb2xlYW4gZm9yIGN1cnJlbnQgdHVybiBjb2xvclxuICBsYXN0RGVzdHM/OiBzZy5LZXlbXTsgLy8gc3F1YXJlcyBwYXJ0IG9mIHRoZSBsYXN0IG1vdmUgb3IgZHJvcCBbXCIzY1wiLCBcIjRjXCJdXG4gIGxhc3RQaWVjZT86IHNnLlBpZWNlOyAvLyBwaWVjZSBwYXJ0IG9mIHRoZSBsYXN0IGRyb3BcbiAgc2VsZWN0ZWQ/OiBzZy5LZXk7IC8vIHNxdWFyZSBjdXJyZW50bHkgc2VsZWN0ZWQgXCIxYVwiXG4gIHNlbGVjdGVkUGllY2U/OiBzZy5QaWVjZTsgLy8gcGllY2UgaW4gaGFuZCBjdXJyZW50bHkgc2VsZWN0ZWRcbiAgaG92ZXJlZD86IHNnLktleTsgLy8gc3F1YXJlIGN1cnJlbnRseSBiZWluZyBob3ZlcmVkXG4gIHZpZXdPbmx5PzogYm9vbGVhbjsgLy8gZG9uJ3QgYmluZCBldmVudHM6IHRoZSB1c2VyIHdpbGwgbmV2ZXIgYmUgYWJsZSB0byBtb3ZlIHBpZWNlcyBhcm91bmRcbiAgc3F1YXJlUmF0aW8/OiBzZy5OdW1iZXJQYWlyOyAvLyByYXRpbyBvZiBhIHNpbmdsZSBzcXVhcmUgW3dpZHRoLCBoZWlnaHRdXG4gIGRpc2FibGVDb250ZXh0TWVudT86IGJvb2xlYW47IC8vIGJlY2F1c2Ugd2hvIG5lZWRzIGEgY29udGV4dCBtZW51IG9uIGEgYm9hcmQsIG9ubHkgd2l0aG91dCB2aWV3T25seVxuICBibG9ja1RvdWNoU2Nyb2xsPzogYm9vbGVhbjsgLy8gYmxvY2sgc2Nyb2xsaW5nIHZpYSB0b3VjaCBkcmFnZ2luZyBvbiB0aGUgYm9hcmQsIGUuZy4gZm9yIGNvb3JkaW5hdGUgdHJhaW5pbmdcbiAgc2NhbGVEb3duUGllY2VzPzogYm9vbGVhbjsgLy8gaGVscGZ1bCBmb3IgcG5ncyAtIGh0dHBzOi8vY3RpZGQuY29tLzIwMTUvc3ZnLWJhY2tncm91bmQtc2NhbGluZ1xuICBjb29yZGluYXRlcz86IHtcbiAgICBlbmFibGVkPzogYm9vbGVhbjsgLy8gaW5jbHVkZSBjb29yZHMgYXR0cmlidXRlc1xuICAgIGZpbGVzPzogc2cuTm90YXRpb247XG4gICAgcmFua3M/OiBzZy5Ob3RhdGlvbjtcbiAgfTtcbiAgaGlnaGxpZ2h0Pzoge1xuICAgIGxhc3REZXN0cz86IGJvb2xlYW47IC8vIGFkZCBsYXN0LWRlc3QgY2xhc3MgdG8gc3F1YXJlcyBhbmQgcGllY2VzXG4gICAgY2hlY2s/OiBib29sZWFuOyAvLyBhZGQgY2hlY2sgY2xhc3MgdG8gc3F1YXJlc1xuICAgIGNoZWNrUm9sZXM/OiBzZy5Sb2xlU3RyaW5nW107IC8vIHJvbGVzIHRvIGJlIGhpZ2hsaWdodGVkIHdoZW4gY2hlY2sgaXMgYm9vbGVhbiBpcyBwYXNzZWQgZnJvbSBjb25maWdcbiAgICBob3ZlcmVkPzogYm9vbGVhbjsgLy8gYWRkIGhvdmVyIGNsYXNzIHRvIGhvdmVyZWQgc3F1YXJlc1xuICB9O1xuICBhbmltYXRpb24/OiB7IGVuYWJsZWQ/OiBib29sZWFuOyBoYW5kcz86IGJvb2xlYW47IGR1cmF0aW9uPzogbnVtYmVyIH07XG4gIGhhbmRzPzoge1xuICAgIGlubGluZWQ/OiBib29sZWFuOyAvLyBhdHRhY2hlcyBzZy1oYW5kcyBkaXJlY3RseSB0byBzZy13cmFwLCBpZ25vcmVzIEhUTUxFbGVtZW50cyBwYXNzZWQgdG8gU2hvZ2lncm91bmRcbiAgICByb2xlcz86IHNnLlJvbGVTdHJpbmdbXTsgLy8gcm9sZXMgdG8gcmVuZGVyIGluIHNnLWhhbmRcbiAgfTtcbiAgbW92YWJsZT86IHtcbiAgICBmcmVlPzogYm9vbGVhbjsgLy8gYWxsIG1vdmVzIGFyZSB2YWxpZCAtIGJvYXJkIGVkaXRvclxuICAgIGRlc3RzPzogc2cuTW92ZURlc3RzOyAvLyB2YWxpZCBtb3Zlcy4ge1wiMmFcIiBbXCIzYVwiIFwiNGFcIl0gXCIxYlwiIFtcIjNhXCIgXCIzY1wiXX1cbiAgICBzaG93RGVzdHM/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgZXZlbnRzPzoge1xuICAgICAgYWZ0ZXI/OiAob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXksIHByb206IGJvb2xlYW4sIG1ldGFkYXRhOiBzZy5Nb3ZlTWV0YWRhdGEpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgbW92ZSBoYXMgYmVlbiBwbGF5ZWRcbiAgICB9O1xuICB9O1xuICBkcm9wcGFibGU/OiB7XG4gICAgZnJlZT86IGJvb2xlYW47IC8vIGFsbCBkcm9wcyBhcmUgdmFsaWQgLSBib2FyZCBlZGl0b3JcbiAgICBkZXN0cz86IHNnLkRyb3BEZXN0czsgLy8gdmFsaWQgZHJvcHMuIHtcInNlbnRlIHBhd25cIiBbXCIzYVwiIFwiNGFcIl0gXCJzZW50ZSBsYW5jZVwiIFtcIjNhXCIgXCIzY1wiXX1cbiAgICBzaG93RGVzdHM/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgc3BhcmU/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIHJlbW92ZSBkcm9wcGVkIHBpZWNlIGZyb20gaGFuZCBhZnRlciBkcm9wIC0gYm9hcmQgZWRpdG9yXG4gICAgZXZlbnRzPzoge1xuICAgICAgYWZ0ZXI/OiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSwgcHJvbTogYm9vbGVhbiwgbWV0YWRhdGE6IHNnLk1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBkcm9wIGhhcyBiZWVuIHBsYXllZFxuICAgIH07XG4gIH07XG4gIHByZW1vdmFibGU/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGFsbG93IHByZW1vdmVzIGZvciBjb2xvciB0aGF0IGNhbiBub3QgbW92ZVxuICAgIHNob3dEZXN0cz86IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBwcmUtZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgZGVzdHM/OiBzZy5LZXlbXTsgLy8gcHJlbW92ZSBkZXN0aW5hdGlvbnMgZm9yIHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgIGdlbmVyYXRlPzogKGtleTogc2cuS2V5LCBwaWVjZXM6IHNnLlBpZWNlcykgPT4gc2cuS2V5W107IC8vIGZ1bmN0aW9uIHRvIGdlbmVyYXRlIGRlc3RpbmF0aW9ucyB0aGF0IHVzZXIgY2FuIHByZW1vdmUgdG9cbiAgICBldmVudHM/OiB7XG4gICAgICBzZXQ/OiAob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXksIHByb206IGJvb2xlYW4pID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlbW92ZSBoYXMgYmVlbiBzZXRcbiAgICAgIHVuc2V0PzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVtb3ZlIGhhcyBiZWVuIHVuc2V0XG4gICAgfTtcbiAgfTtcbiAgcHJlZHJvcHBhYmxlPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuOyAvLyBhbGxvdyBwcmVkcm9wcyBmb3IgY29sb3IgdGhhdCBjYW4gbm90IG1vdmVcbiAgICBzaG93RGVzdHM/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgcHJlLWRlc3QgY2xhc3Mgb24gc3F1YXJlcyBmb3IgZHJvcHNcbiAgICBkZXN0cz86IHNnLktleVtdOyAvLyBwcmVtb3ZlIGRlc3RpbmF0aW9ucyBmb3IgdGhlIGRyb3Agc2VsZWN0aW9uXG4gICAgZ2VuZXJhdGU/OiAocGllY2U6IHNnLlBpZWNlLCBwaWVjZXM6IHNnLlBpZWNlcykgPT4gc2cuS2V5W107IC8vIGZ1bmN0aW9uIHRvIGdlbmVyYXRlIGRlc3RpbmF0aW9ucyB0aGF0IHVzZXIgY2FuIHByZWRyb3Agb25cbiAgICBldmVudHM/OiB7XG4gICAgICBzZXQ/OiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSwgcHJvbTogYm9vbGVhbikgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVkcm9wIGhhcyBiZWVuIHNldFxuICAgICAgdW5zZXQ/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZWRyb3AgaGFzIGJlZW4gdW5zZXRcbiAgICB9O1xuICB9O1xuICBkcmFnZ2FibGU/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGFsbG93IG1vdmVzICYgcHJlbW92ZXMgdG8gdXNlIGRyYWcnbiBkcm9wXG4gICAgZGlzdGFuY2U/OiBudW1iZXI7IC8vIG1pbmltdW0gZGlzdGFuY2UgdG8gaW5pdGlhdGUgYSBkcmFnOyBpbiBwaXhlbHNcbiAgICBhdXRvRGlzdGFuY2U/OiBib29sZWFuOyAvLyBsZXRzIHNob2dpZ3JvdW5kIHNldCBkaXN0YW5jZSB0byB6ZXJvIHdoZW4gdXNlciBkcmFncyBwaWVjZXNcbiAgICBzaG93R2hvc3Q/OiBib29sZWFuOyAvLyBzaG93IGdob3N0IG9mIHBpZWNlIGJlaW5nIGRyYWdnZWRcbiAgICBzaG93VG91Y2hTcXVhcmVPdmVybGF5PzogYm9vbGVhbjsgLy8gc2hvdyBzcXVhcmUgb3ZlcmxheSBvbiB0aGUgc3F1YXJlIHRoYXQgaXMgY3VycmVudGx5IGJlaW5nIGhvdmVyZWQsIHRvdWNoIG9ubHlcbiAgICBkZWxldGVPbkRyb3BPZmY/OiBib29sZWFuOyAvLyBkZWxldGUgYSBwaWVjZSB3aGVuIGl0IGlzIGRyb3BwZWQgb2ZmIHRoZSBib2FyZFxuICAgIGFkZFRvSGFuZE9uRHJvcE9mZj86IGJvb2xlYW47IC8vIGFkZCBhIHBpZWNlIHRvIGhhbmQgd2hlbiBpdCBpcyBkcm9wcGVkIG9uIGl0LCByZXF1aXJlcyBkZWxldGVPbkRyb3BPZmZcbiAgfTtcbiAgc2VsZWN0YWJsZT86IHtcbiAgICBlbmFibGVkPzogYm9vbGVhbjsgLy8gZGlzYWJsZSB0byBlbmZvcmNlIGRyYWdnaW5nIG92ZXIgY2xpY2stY2xpY2sgbW92ZVxuICAgIGZvcmNlU3BhcmVzPzogYm9vbGVhbjsgLy8gYWxsb3cgZHJvcHBpbmcgc3BhcmUgcGllY2VzIGV2ZW4gd2l0aCBzZWxlY3RhYmxlIGRpc2FibGVkXG4gICAgZGVsZXRlT25Ub3VjaD86IGJvb2xlYW47IC8vIHNlbGVjdGluZyBhIHBpZWNlIG9uIHRoZSBib2FyZCBvciBpbiBoYW5kIHdpbGwgcmVtb3ZlIGl0IC0gYm9hcmQgZWRpdG9yXG4gICAgYWRkU3BhcmVzVG9IYW5kPzogYm9vbGVhbjsgLy8gYWRkIHNlbGVjdGVkIHNwYXJlIHBpZWNlIHRvIGhhbmQgLSBib2FyZCBlZGl0b3JcbiAgfTtcbiAgZXZlbnRzPzoge1xuICAgIGNoYW5nZT86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgc2l0dWF0aW9uIGNoYW5nZXMgb24gdGhlIGJvYXJkXG4gICAgbW92ZT86IChvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSwgcHJvbTogYm9vbGVhbiwgY2FwdHVyZWRQaWVjZT86IHNnLlBpZWNlKSA9PiB2b2lkO1xuICAgIGRyb3A/OiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSwgcHJvbTogYm9vbGVhbikgPT4gdm9pZDtcbiAgICBzZWxlY3Q/OiAoa2V5OiBzZy5LZXkpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIGEgc3F1YXJlIGlzIHNlbGVjdGVkXG4gICAgdW5zZWxlY3Q/OiAoa2V5OiBzZy5LZXkpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIGEgc2VsZWN0ZWQgc3F1YXJlIGlzIGRpcmVjdGx5IHVuc2VsZWN0ZWQgLSBkcm9wcGVkIGJhY2sgb3IgY2xpY2tlZCBvbiB0aGUgb3JpZ2luYWwgc3F1YXJlXG4gICAgcGllY2VTZWxlY3Q/OiAocGllY2U6IHNnLlBpZWNlKSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBhIHBpZWNlIGluIGhhbmQgaXMgc2VsZWN0ZWRcbiAgICBwaWVjZVVuc2VsZWN0PzogKHBpZWNlOiBzZy5QaWVjZSkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gYSBzZWxlY3RlZCBwaWVjZSBpcyBkaXJlY3RseSB1bnNlbGVjdGVkIC0gZHJvcHBlZCBiYWNrIG9yIGNsaWNrZWQgb24gdGhlIHNhbWUgcGllY2VcbiAgICBpbnNlcnQ/OiAoYm9hcmRFbGVtZW50cz86IHNnLkJvYXJkRWxlbWVudHMsIGhhbmRFbGVtZW50cz86IHNnLkhhbmRFbGVtZW50cykgPT4gdm9pZDsgLy8gd2hlbiB0aGUgYm9hcmQvaGFuZHMgRE9NIGhhcyBiZWVuIChyZSlpbnNlcnRlZFxuICB9O1xuICBkcmF3YWJsZT86IHtcbiAgICBlbmFibGVkPzogYm9vbGVhbjsgLy8gY2FuIGRyYXdcbiAgICB2aXNpYmxlPzogYm9vbGVhbjsgLy8gY2FuIHZpZXdcbiAgICBmb3JjZWQ/OiBib29sZWFuOyAvLyBjYW4gb25seSBkcmF3XG4gICAgZXJhc2VPbkNsaWNrPzogYm9vbGVhbjtcbiAgICBzaGFwZXM/OiBEcmF3U2hhcGVbXTtcbiAgICBhdXRvU2hhcGVzPzogRHJhd1NoYXBlW107XG4gICAgc3F1YXJlcz86IFNxdWFyZUhpZ2hsaWdodFtdO1xuICAgIG9uQ2hhbmdlPzogKHNoYXBlczogRHJhd1NoYXBlW10pID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciBkcmF3YWJsZSBzaGFwZXMgY2hhbmdlXG4gIH07XG4gIGZvcnN5dGg/OiB7XG4gICAgdG9Gb3JzeXRoPzogKHJvbGU6IHNnLlJvbGVTdHJpbmcpID0+IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBmcm9tRm9yc3l0aD86IChzdHI6IHN0cmluZykgPT4gc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZDtcbiAgfTtcbiAgcHJvbW90aW9uPzoge1xuICAgIHByb21vdGVzVG8/OiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICB1bnByb21vdGVzVG8/OiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBtb3ZlUHJvbW90aW9uRGlhbG9nPzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KSA9PiBib29sZWFuOyAvLyBhY3RpdmF0ZSBwcm9tb3Rpb24gZGlhbG9nXG4gICAgZm9yY2VNb3ZlUHJvbW90aW9uPzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KSA9PiBib29sZWFuOyAvLyBhdXRvIHByb21vdGUgYWZ0ZXIgbW92ZVxuICAgIGRyb3BQcm9tb3Rpb25EaWFsb2c/OiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSkgPT4gYm9vbGVhbjsgLy8gYWN0aXZhdGUgcHJvbW90aW9uIGRpYWxvZ1xuICAgIGZvcmNlRHJvcFByb21vdGlvbj86IChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5KSA9PiBib29sZWFuOyAvLyBhdXRvIHByb21vdGUgYWZ0ZXIgZHJvcFxuICAgIGV2ZW50cz86IHtcbiAgICAgIGluaXRpYXRlZD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIHByb21vdGlvbiBkaWFsb2cgaXMgc3RhcnRlZFxuICAgICAgYWZ0ZXI/OiAocGllY2U6IHNnLlBpZWNlKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdXNlciBzZWxlY3RzIGEgcGllY2VcbiAgICAgIGNhbmNlbD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB1c2VyIGNhbmNlbHMgdGhlIHNlbGVjdGlvblxuICAgIH07XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseUFuaW1hdGlvbihzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgY29uZmlnOiBDb25maWcpOiB2b2lkIHtcbiAgaWYgKGNvbmZpZy5hbmltYXRpb24pIHtcbiAgICBkZWVwTWVyZ2Uoc3RhdGUuYW5pbWF0aW9uLCBjb25maWcuYW5pbWF0aW9uKTtcbiAgICAvLyBubyBuZWVkIGZvciBzdWNoIHNob3J0IGFuaW1hdGlvbnNcbiAgICBpZiAoKHN0YXRlLmFuaW1hdGlvbi5kdXJhdGlvbiB8fCAwKSA8IDcwKSBzdGF0ZS5hbmltYXRpb24uZW5hYmxlZCA9IGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25maWd1cmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIGNvbmZpZzogQ29uZmlnKTogdm9pZCB7XG4gIC8vIGRvbid0IG1lcmdlLCBqdXN0IG92ZXJyaWRlLlxuICBpZiAoY29uZmlnLm1vdmFibGU/LmRlc3RzKSBzdGF0ZS5tb3ZhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICBpZiAoY29uZmlnLmRyb3BwYWJsZT8uZGVzdHMpIHN0YXRlLmRyb3BwYWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbiAgaWYgKGNvbmZpZy5kcmF3YWJsZT8uc2hhcGVzKSBzdGF0ZS5kcmF3YWJsZS5zaGFwZXMgPSBbXTtcbiAgaWYgKGNvbmZpZy5kcmF3YWJsZT8uYXV0b1NoYXBlcykgc3RhdGUuZHJhd2FibGUuYXV0b1NoYXBlcyA9IFtdO1xuICBpZiAoY29uZmlnLmRyYXdhYmxlPy5zcXVhcmVzKSBzdGF0ZS5kcmF3YWJsZS5zcXVhcmVzID0gW107XG4gIGlmIChjb25maWcuaGFuZHM/LnJvbGVzKSBzdGF0ZS5oYW5kcy5yb2xlcyA9IFtdO1xuXG4gIGRlZXBNZXJnZShzdGF0ZSwgY29uZmlnKTtcblxuICAvLyBpZiBhIHNmZW4gd2FzIHByb3ZpZGVkLCByZXBsYWNlIHRoZSBwaWVjZXMsIGV4Y2VwdCB0aGUgY3VycmVudGx5IGRyYWdnZWQgb25lXG4gIGlmIChjb25maWcuc2Zlbj8uYm9hcmQpIHtcbiAgICBzdGF0ZS5kaW1lbnNpb25zID0gaW5mZXJEaW1lbnNpb25zKGNvbmZpZy5zZmVuLmJvYXJkKTtcbiAgICBzdGF0ZS5waWVjZXMgPSBzZmVuVG9Cb2FyZChjb25maWcuc2Zlbi5ib2FyZCwgc3RhdGUuZGltZW5zaW9ucywgc3RhdGUuZm9yc3l0aC5mcm9tRm9yc3l0aCk7XG4gICAgc3RhdGUuZHJhd2FibGUuc2hhcGVzID0gY29uZmlnLmRyYXdhYmxlPy5zaGFwZXMgfHwgW107XG4gIH1cblxuICBpZiAoY29uZmlnLnNmZW4/LmhhbmRzKSB7XG4gICAgc3RhdGUuaGFuZHMuaGFuZE1hcCA9IHNmZW5Ub0hhbmRzKGNvbmZpZy5zZmVuLmhhbmRzLCBzdGF0ZS5mb3JzeXRoLmZyb21Gb3JzeXRoKTtcbiAgfVxuXG4gIC8vIGFwcGx5IGNvbmZpZyB2YWx1ZXMgdGhhdCBjb3VsZCBiZSB1bmRlZmluZWQgeWV0IG1lYW5pbmdmdWxcbiAgaWYgKCdjaGVja3MnIGluIGNvbmZpZykgc2V0Q2hlY2tzKHN0YXRlLCBjb25maWcuY2hlY2tzIHx8IGZhbHNlKTtcbiAgaWYgKCdsYXN0UGllY2UnIGluIGNvbmZpZyAmJiAhY29uZmlnLmxhc3RQaWVjZSkgc3RhdGUubGFzdFBpZWNlID0gdW5kZWZpbmVkO1xuXG4gIC8vIGluIGNhc2Ugb2YgZHJvcCBsYXN0IG1vdmUsIHRoZXJlJ3MgYSBzaW5nbGUgc3F1YXJlLlxuICAvLyBpZiB0aGUgcHJldmlvdXMgbGFzdCBtb3ZlIGhhZCB0d28gc3F1YXJlcyxcbiAgLy8gdGhlIG1lcmdlIGFsZ29yaXRobSB3aWxsIGluY29ycmVjdGx5IGtlZXAgdGhlIHNlY29uZCBzcXVhcmUuXG4gIGlmICgnbGFzdERlc3RzJyBpbiBjb25maWcgJiYgIWNvbmZpZy5sYXN0RGVzdHMpIHN0YXRlLmxhc3REZXN0cyA9IHVuZGVmaW5lZDtcbiAgZWxzZSBpZiAoY29uZmlnLmxhc3REZXN0cykgc3RhdGUubGFzdERlc3RzID0gY29uZmlnLmxhc3REZXN0cztcblxuICAvLyBmaXggbW92ZS9wcmVtb3ZlIGRlc3RzXG4gIHNldFByZURlc3RzKHN0YXRlKTtcblxuICBhcHBseUFuaW1hdGlvbihzdGF0ZSwgY29uZmlnKTtcbn1cblxuZnVuY3Rpb24gZGVlcE1lcmdlKGJhc2U6IGFueSwgZXh0ZW5kOiBhbnkpOiB2b2lkIHtcbiAgZm9yIChjb25zdCBrZXkgaW4gZXh0ZW5kKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChleHRlbmQsIGtleSkpIHtcbiAgICAgIGlmIChcbiAgICAgICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGJhc2UsIGtleSkgJiZcbiAgICAgICAgaXNQbGFpbk9iamVjdChiYXNlW2tleV0pICYmXG4gICAgICAgIGlzUGxhaW5PYmplY3QoZXh0ZW5kW2tleV0pXG4gICAgICApXG4gICAgICAgIGRlZXBNZXJnZShiYXNlW2tleV0sIGV4dGVuZFtrZXldKTtcbiAgICAgIGVsc2UgYmFzZVtrZXldID0gZXh0ZW5kW2tleV07XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3QobzogdW5rbm93bik6IGJvb2xlYW4ge1xuICBpZiAodHlwZW9mIG8gIT09ICdvYmplY3QnIHx8IG8gPT09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgY29uc3QgcHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yobyk7XG4gIHJldHVybiBwcm90byA9PT0gT2JqZWN0LnByb3RvdHlwZSB8fCBwcm90byA9PT0gbnVsbDtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IERyYXdDdXJyZW50LCBEcmF3U2hhcGUsIERyYXdTaGFwZVBpZWNlIH0gZnJvbSAnLi9kcmF3LmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQge1xuICBjcmVhdGVFbCxcbiAga2V5MnBvcyxcbiAgcGllY2VOYW1lT2YsXG4gIHBvc09mT3V0c2lkZUVsLFxuICBwb3NUb1RyYW5zbGF0ZVJlbCxcbiAgc2FtZVBpZWNlLFxuICBzZW50ZVBvdixcbiAgdHJhbnNsYXRlUmVsLFxufSBmcm9tICcuL3V0aWwuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU1ZHRWxlbWVudCh0YWdOYW1lOiBzdHJpbmcpOiBTVkdFbGVtZW50IHtcbiAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCB0YWdOYW1lKTtcbn1cblxuaW50ZXJmYWNlIFNoYXBlIHtcbiAgc2hhcGU6IERyYXdTaGFwZTtcbiAgaGFzaDogSGFzaDtcbiAgY3VycmVudD86IGJvb2xlYW47XG59XG5cbnR5cGUgQXJyb3dEZXN0cyA9IE1hcDxzZy5LZXkgfCBzZy5QaWVjZU5hbWUsIG51bWJlcj47IC8vIGhvdyBtYW55IGFycm93cyBsYW5kIG9uIGEgc3F1YXJlXG5cbnR5cGUgSGFzaCA9IHN0cmluZztcblxuY29uc3Qgb3V0c2lkZUFycm93SGFzaCA9ICdvdXRzaWRlQXJyb3cnO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyU2hhcGVzKFxuICBzdGF0ZTogU3RhdGUsXG4gIHN2ZzogU1ZHRWxlbWVudCxcbiAgY3VzdG9tU3ZnOiBTVkdFbGVtZW50LFxuICBmcmVlUGllY2VzOiBIVE1MRWxlbWVudCxcbik6IHZvaWQge1xuICBjb25zdCBkID0gc3RhdGUuZHJhd2FibGU7XG4gIGNvbnN0IGN1ckQgPSBkLmN1cnJlbnQ7XG4gIGNvbnN0IGN1ciA9IGN1ckQ/LmRlc3QgPyAoY3VyRCBhcyBEcmF3U2hhcGUpIDogdW5kZWZpbmVkO1xuICBjb25zdCBvdXRzaWRlQXJyb3cgPSAhIWN1ckQgJiYgIWN1cjtcbiAgY29uc3QgYXJyb3dEZXN0czogQXJyb3dEZXN0cyA9IG5ldyBNYXAoKTtcbiAgY29uc3QgcGllY2VNYXAgPSBuZXcgTWFwPHNnLktleSwgRHJhd1NoYXBlPigpO1xuXG4gIGNvbnN0IGhhc2hCb3VuZHMgPSAoKSA9PiB7XG4gICAgLy8gdG9kbyBhbHNvIHBvc3NpYmxlIHBpZWNlIGJvdW5kc1xuICAgIGNvbnN0IGJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gICAgcmV0dXJuIChib3VuZHMgJiYgYm91bmRzLndpZHRoLnRvU3RyaW5nKCkgKyBib3VuZHMuaGVpZ2h0KSB8fCAnJztcbiAgfTtcblxuICBmb3IgKGNvbnN0IHMgb2YgZC5zaGFwZXMuY29uY2F0KGQuYXV0b1NoYXBlcykuY29uY2F0KGN1ciA/IFtjdXJdIDogW10pKSB7XG4gICAgY29uc3QgZGVzdE5hbWUgPSBpc1BpZWNlKHMuZGVzdCkgPyBwaWVjZU5hbWVPZihzLmRlc3QpIDogcy5kZXN0O1xuICAgIGlmICghc2FtZVBpZWNlT3JLZXkocy5kZXN0LCBzLm9yaWcpKVxuICAgICAgYXJyb3dEZXN0cy5zZXQoZGVzdE5hbWUsIChhcnJvd0Rlc3RzLmdldChkZXN0TmFtZSkgfHwgMCkgKyAxKTtcbiAgfVxuXG4gIGZvciAoY29uc3QgcyBvZiBkLnNoYXBlcy5jb25jYXQoY3VyID8gW2N1cl0gOiBbXSkuY29uY2F0KGQuYXV0b1NoYXBlcykpIHtcbiAgICBpZiAocy5waWVjZSAmJiAhaXNQaWVjZShzLm9yaWcpKSBwaWVjZU1hcC5zZXQocy5vcmlnLCBzKTtcbiAgfVxuICBjb25zdCBwaWVjZVNoYXBlcyA9IFsuLi5waWVjZU1hcC52YWx1ZXMoKV0ubWFwKChzKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNoYXBlOiBzLFxuICAgICAgaGFzaDogc2hhcGVIYXNoKHMsIGFycm93RGVzdHMsIGZhbHNlLCBoYXNoQm91bmRzKSxcbiAgICB9O1xuICB9KTtcblxuICBjb25zdCBzaGFwZXM6IFNoYXBlW10gPSBkLnNoYXBlcy5jb25jYXQoZC5hdXRvU2hhcGVzKS5tYXAoKHM6IERyYXdTaGFwZSkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBzaGFwZTogcyxcbiAgICAgIGhhc2g6IHNoYXBlSGFzaChzLCBhcnJvd0Rlc3RzLCBmYWxzZSwgaGFzaEJvdW5kcyksXG4gICAgfTtcbiAgfSk7XG4gIGlmIChjdXIpXG4gICAgc2hhcGVzLnB1c2goe1xuICAgICAgc2hhcGU6IGN1cixcbiAgICAgIGhhc2g6IHNoYXBlSGFzaChjdXIsIGFycm93RGVzdHMsIHRydWUsIGhhc2hCb3VuZHMpLFxuICAgICAgY3VycmVudDogdHJ1ZSxcbiAgICB9KTtcblxuICBjb25zdCBmdWxsSGFzaCA9IHNoYXBlcy5tYXAoKHNjKSA9PiBzYy5oYXNoKS5qb2luKCc7JykgKyAob3V0c2lkZUFycm93ID8gb3V0c2lkZUFycm93SGFzaCA6ICcnKTtcbiAgaWYgKGZ1bGxIYXNoID09PSBzdGF0ZS5kcmF3YWJsZS5wcmV2U3ZnSGFzaCkgcmV0dXJuO1xuICBzdGF0ZS5kcmF3YWJsZS5wcmV2U3ZnSGFzaCA9IGZ1bGxIYXNoO1xuXG4gIC8qXG4gICAgLS0gRE9NIGhpZXJhcmNoeSAtLVxuICAgIDxzdmcgY2xhc3M9XCJzZy1zaGFwZXNcIj4gKDw9IHN2ZylcbiAgICAgIDxkZWZzPlxuICAgICAgICAuLi4oZm9yIGJydXNoZXMpLi4uXG4gICAgICA8L2RlZnM+XG4gICAgICA8Zz5cbiAgICAgICAgLi4uKGZvciBhcnJvd3MgYW5kIGNpcmNsZXMpLi4uXG4gICAgICA8L2c+XG4gICAgPC9zdmc+XG4gICAgPHN2ZyBjbGFzcz1cInNnLWN1c3RvbS1zdmdzXCI+ICg8PSBjdXN0b21TdmcpXG4gICAgICA8Zz5cbiAgICAgICAgLi4uKGZvciBjdXN0b20gc3ZncykuLi5cbiAgICAgIDwvZz5cbiAgICA8c2ctZnJlZS1waWVjZXM+ICg8PSBmcmVlUGllY2VzKVxuICAgICAgLi4uKGZvciBwaWVjZXMpLi4uXG4gICAgPC9zZy1mcmVlLXBpZWNlcz5cbiAgICA8L3N2Zz5cbiAgKi9cbiAgY29uc3QgZGVmc0VsID0gc3ZnLnF1ZXJ5U2VsZWN0b3IoJ2RlZnMnKSBhcyBTVkdFbGVtZW50O1xuICBjb25zdCBzaGFwZXNFbCA9IHN2Zy5xdWVyeVNlbGVjdG9yKCdnJykgYXMgU1ZHRWxlbWVudDtcbiAgY29uc3QgY3VzdG9tU3Znc0VsID0gY3VzdG9tU3ZnLnF1ZXJ5U2VsZWN0b3IoJ2cnKSBhcyBTVkdFbGVtZW50O1xuXG4gIHN5bmNEZWZzKHNoYXBlcywgb3V0c2lkZUFycm93ID8gY3VyRCA6IHVuZGVmaW5lZCwgZGVmc0VsKTtcbiAgc3luY1NoYXBlcyhcbiAgICBzaGFwZXMuZmlsdGVyKChzKSA9PiAhcy5zaGFwZS5jdXN0b21TdmcgJiYgKCFzLnNoYXBlLnBpZWNlIHx8IHMuY3VycmVudCkpLFxuICAgIHNoYXBlc0VsLFxuICAgIChzaGFwZSkgPT4gcmVuZGVyU1ZHU2hhcGUoc3RhdGUsIHNoYXBlLCBhcnJvd0Rlc3RzKSxcbiAgICBvdXRzaWRlQXJyb3csXG4gICk7XG4gIHN5bmNTaGFwZXMoXG4gICAgc2hhcGVzLmZpbHRlcigocykgPT4gcy5zaGFwZS5jdXN0b21TdmcpLFxuICAgIGN1c3RvbVN2Z3NFbCxcbiAgICAoc2hhcGUpID0+IHJlbmRlclNWR1NoYXBlKHN0YXRlLCBzaGFwZSwgYXJyb3dEZXN0cyksXG4gICk7XG4gIHN5bmNTaGFwZXMocGllY2VTaGFwZXMsIGZyZWVQaWVjZXMsIChzaGFwZSkgPT4gcmVuZGVyUGllY2Uoc3RhdGUsIHNoYXBlKSk7XG5cbiAgaWYgKCFvdXRzaWRlQXJyb3cgJiYgY3VyRCkgY3VyRC5hcnJvdyA9IHVuZGVmaW5lZDtcblxuICBpZiAob3V0c2lkZUFycm93ICYmICFjdXJELmFycm93KSB7XG4gICAgY29uc3Qgb3JpZyA9IHBpZWNlT3JLZXlUb1BvcyhjdXJELm9yaWcsIHN0YXRlKTtcbiAgICBpZiAob3JpZykge1xuICAgICAgY29uc3QgZyA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnZycpLCB7XG4gICAgICAgIGNsYXNzOiBzaGFwZUNsYXNzKGN1ckQuYnJ1c2gsIHRydWUsIHRydWUpLFxuICAgICAgICBzZ0hhc2g6IG91dHNpZGVBcnJvd0hhc2gsXG4gICAgICB9KTtcbiAgICAgIGNvbnN0IGVsID0gcmVuZGVyQXJyb3coY3VyRC5icnVzaCwgb3JpZywgb3JpZywgc3RhdGUuc3F1YXJlUmF0aW8sIHRydWUsIGZhbHNlKTtcbiAgICAgIGcuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgY3VyRC5hcnJvdyA9IGVsO1xuICAgICAgc2hhcGVzRWwuYXBwZW5kQ2hpbGQoZyk7XG4gICAgfVxuICB9XG59XG5cbi8vIGFwcGVuZCBvbmx5LiBEb24ndCB0cnkgdG8gdXBkYXRlL3JlbW92ZS5cbmZ1bmN0aW9uIHN5bmNEZWZzKFxuICBzaGFwZXM6IFNoYXBlW10sXG4gIG91dHNpZGVTaGFwZTogRHJhd0N1cnJlbnQgfCB1bmRlZmluZWQsXG4gIGRlZnNFbDogU1ZHRWxlbWVudCxcbik6IHZvaWQge1xuICBjb25zdCBicnVzaGVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGZvciAoY29uc3QgcyBvZiBzaGFwZXMpIHtcbiAgICBpZiAoIXNhbWVQaWVjZU9yS2V5KHMuc2hhcGUuZGVzdCwgcy5zaGFwZS5vcmlnKSkgYnJ1c2hlcy5hZGQocy5zaGFwZS5icnVzaCk7XG4gIH1cbiAgaWYgKG91dHNpZGVTaGFwZSkgYnJ1c2hlcy5hZGQob3V0c2lkZVNoYXBlLmJydXNoKTtcbiAgY29uc3Qga2V5c0luRG9tID0gbmV3IFNldCgpO1xuICBsZXQgZWw6IFNWR0VsZW1lbnQgfCB1bmRlZmluZWQgPSBkZWZzRWwuZmlyc3RFbGVtZW50Q2hpbGQgYXMgU1ZHRWxlbWVudDtcbiAgd2hpbGUgKGVsKSB7XG4gICAga2V5c0luRG9tLmFkZChlbC5nZXRBdHRyaWJ1dGUoJ3NnS2V5JykpO1xuICAgIGVsID0gZWwubmV4dEVsZW1lbnRTaWJsaW5nIGFzIFNWR0VsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIH1cbiAgZm9yIChjb25zdCBrZXkgb2YgYnJ1c2hlcykge1xuICAgIGNvbnN0IGJydXNoID0ga2V5IHx8ICdwcmltYXJ5JztcbiAgICBpZiAoIWtleXNJbkRvbS5oYXMoYnJ1c2gpKSBkZWZzRWwuYXBwZW5kQ2hpbGQocmVuZGVyTWFya2VyKGJydXNoKSk7XG4gIH1cbn1cblxuLy8gYXBwZW5kIGFuZCByZW1vdmUgb25seS4gTm8gdXBkYXRlcy5cbmV4cG9ydCBmdW5jdGlvbiBzeW5jU2hhcGVzKFxuICBzaGFwZXM6IFNoYXBlW10sXG4gIHJvb3Q6IEhUTUxFbGVtZW50IHwgU1ZHRWxlbWVudCxcbiAgcmVuZGVyU2hhcGU6IChzaGFwZTogU2hhcGUpID0+IEhUTUxFbGVtZW50IHwgU1ZHRWxlbWVudCB8IHVuZGVmaW5lZCxcbiAgb3V0c2lkZUFycm93PzogYm9vbGVhbixcbik6IHZvaWQge1xuICBjb25zdCBoYXNoZXNJbkRvbSA9IG5ldyBNYXAoKTsgLy8gYnkgaGFzaFxuICBjb25zdCB0b1JlbW92ZTogU1ZHRWxlbWVudFtdID0gW107XG4gIGZvciAoY29uc3Qgc2Mgb2Ygc2hhcGVzKSBoYXNoZXNJbkRvbS5zZXQoc2MuaGFzaCwgZmFsc2UpO1xuICBpZiAob3V0c2lkZUFycm93KSBoYXNoZXNJbkRvbS5zZXQob3V0c2lkZUFycm93SGFzaCwgdHJ1ZSk7XG4gIGxldCBlbDogU1ZHRWxlbWVudCB8IHVuZGVmaW5lZCA9IHJvb3QuZmlyc3RFbGVtZW50Q2hpbGQgYXMgU1ZHRWxlbWVudDtcbiAgbGV0IGVsSGFzaDogSGFzaCB8IG51bGw7XG4gIHdoaWxlIChlbCkge1xuICAgIGVsSGFzaCA9IGVsLmdldEF0dHJpYnV0ZSgnc2dIYXNoJyk7XG4gICAgLy8gZm91bmQgYSBzaGFwZSBlbGVtZW50IHRoYXQncyBoZXJlIHRvIHN0YXlcbiAgICBpZiAoaGFzaGVzSW5Eb20uaGFzKGVsSGFzaCkpIGhhc2hlc0luRG9tLnNldChlbEhhc2gsIHRydWUpO1xuICAgIC8vIG9yIHJlbW92ZSBpdFxuICAgIGVsc2UgdG9SZW1vdmUucHVzaChlbCk7XG4gICAgZWwgPSBlbC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgU1ZHRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgfVxuICAvLyByZW1vdmUgb2xkIHNoYXBlc1xuICBmb3IgKGNvbnN0IGVsIG9mIHRvUmVtb3ZlKSByb290LnJlbW92ZUNoaWxkKGVsKTtcbiAgLy8gaW5zZXJ0IHNoYXBlcyB0aGF0IGFyZSBub3QgeWV0IGluIGRvbVxuICBmb3IgKGNvbnN0IHNjIG9mIHNoYXBlcykge1xuICAgIGlmICghaGFzaGVzSW5Eb20uZ2V0KHNjLmhhc2gpKSB7XG4gICAgICBjb25zdCBzaGFwZUVsID0gcmVuZGVyU2hhcGUoc2MpO1xuICAgICAgaWYgKHNoYXBlRWwpIHJvb3QuYXBwZW5kQ2hpbGQoc2hhcGVFbCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNoYXBlSGFzaChcbiAgeyBvcmlnLCBkZXN0LCBicnVzaCwgcGllY2UsIGN1c3RvbVN2ZywgZGVzY3JpcHRpb24gfTogRHJhd1NoYXBlLFxuICBhcnJvd0Rlc3RzOiBBcnJvd0Rlc3RzLFxuICBjdXJyZW50OiBib29sZWFuLFxuICBib3VuZEhhc2g6ICgpID0+IHN0cmluZyxcbik6IEhhc2gge1xuICByZXR1cm4gW1xuICAgIGN1cnJlbnQsXG4gICAgKGlzUGllY2Uob3JpZykgfHwgaXNQaWVjZShkZXN0KSkgJiYgYm91bmRIYXNoKCksXG4gICAgaXNQaWVjZShvcmlnKSA/IHBpZWNlSGFzaChvcmlnKSA6IG9yaWcsXG4gICAgaXNQaWVjZShkZXN0KSA/IHBpZWNlSGFzaChkZXN0KSA6IGRlc3QsXG4gICAgYnJ1c2gsXG4gICAgKGFycm93RGVzdHMuZ2V0KGlzUGllY2UoZGVzdCkgPyBwaWVjZU5hbWVPZihkZXN0KSA6IGRlc3QpIHx8IDApID4gMSxcbiAgICBwaWVjZSAmJiBwaWVjZUhhc2gocGllY2UpLFxuICAgIGN1c3RvbVN2ZyAmJiBjdXN0b21TdmdIYXNoKGN1c3RvbVN2ZyksXG4gICAgZGVzY3JpcHRpb24sXG4gIF1cbiAgICAuZmlsdGVyKCh4KSA9PiB4KVxuICAgIC5qb2luKCcsJyk7XG59XG5cbmZ1bmN0aW9uIHBpZWNlSGFzaChwaWVjZTogRHJhd1NoYXBlUGllY2UpOiBIYXNoIHtcbiAgcmV0dXJuIFtwaWVjZS5jb2xvciwgcGllY2Uucm9sZSwgcGllY2Uuc2NhbGVdLmZpbHRlcigoeCkgPT4geCkuam9pbignLCcpO1xufVxuXG5mdW5jdGlvbiBjdXN0b21TdmdIYXNoKHM6IHN0cmluZyk6IEhhc2gge1xuICAvLyBSb2xsaW5nIGhhc2ggd2l0aCBiYXNlIDMxIChjZi4gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNzYxNjQ2MS9nZW5lcmF0ZS1hLWhhc2gtZnJvbS1zdHJpbmctaW4tamF2YXNjcmlwdClcbiAgbGV0IGggPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHMubGVuZ3RoOyBpKyspIHtcbiAgICBoID0gKChoIDw8IDUpIC0gaCArIHMuY2hhckNvZGVBdChpKSkgPj4+IDA7XG4gIH1cbiAgcmV0dXJuIGBjdXN0b20tJHtoLnRvU3RyaW5nKCl9YDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyU1ZHU2hhcGUoXG4gIHN0YXRlOiBTdGF0ZSxcbiAgeyBzaGFwZSwgY3VycmVudCwgaGFzaCB9OiBTaGFwZSxcbiAgYXJyb3dEZXN0czogQXJyb3dEZXN0cyxcbik6IFNWR0VsZW1lbnQgfCB1bmRlZmluZWQge1xuICBjb25zdCBvcmlnID0gcGllY2VPcktleVRvUG9zKHNoYXBlLm9yaWcsIHN0YXRlKTtcbiAgaWYgKCFvcmlnKSByZXR1cm47XG4gIGlmIChzaGFwZS5jdXN0b21TdmcpIHtcbiAgICByZXR1cm4gcmVuZGVyQ3VzdG9tU3ZnKHNoYXBlLmJydXNoLCBzaGFwZS5jdXN0b21TdmcsIG9yaWcsIHN0YXRlLnNxdWFyZVJhdGlvKTtcbiAgfSBlbHNlIHtcbiAgICBsZXQgZWw6IFNWR0VsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgY29uc3QgZGVzdCA9ICFzYW1lUGllY2VPcktleShzaGFwZS5vcmlnLCBzaGFwZS5kZXN0KSAmJiBwaWVjZU9yS2V5VG9Qb3Moc2hhcGUuZGVzdCwgc3RhdGUpO1xuICAgIGlmIChkZXN0KSB7XG4gICAgICBlbCA9IHJlbmRlckFycm93KFxuICAgICAgICBzaGFwZS5icnVzaCxcbiAgICAgICAgb3JpZyxcbiAgICAgICAgZGVzdCxcbiAgICAgICAgc3RhdGUuc3F1YXJlUmF0aW8sXG4gICAgICAgICEhY3VycmVudCxcbiAgICAgICAgKGFycm93RGVzdHMuZ2V0KGlzUGllY2Uoc2hhcGUuZGVzdCkgPyBwaWVjZU5hbWVPZihzaGFwZS5kZXN0KSA6IHNoYXBlLmRlc3QpIHx8IDApID4gMSxcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmIChzYW1lUGllY2VPcktleShzaGFwZS5kZXN0LCBzaGFwZS5vcmlnKSkge1xuICAgICAgbGV0IHJhdGlvOiBzZy5OdW1iZXJQYWlyID0gc3RhdGUuc3F1YXJlUmF0aW87XG4gICAgICBpZiAoaXNQaWVjZShzaGFwZS5vcmlnKSkge1xuICAgICAgICBjb25zdCBwaWVjZUJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMoKS5nZXQocGllY2VOYW1lT2Yoc2hhcGUub3JpZykpO1xuICAgICAgICBjb25zdCBib3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpO1xuICAgICAgICBpZiAocGllY2VCb3VuZHMgJiYgYm91bmRzKSB7XG4gICAgICAgICAgY29uc3QgaGVpZ2h0QmFzZSA9IHBpZWNlQm91bmRzLmhlaWdodCAvIChib3VuZHMuaGVpZ2h0IC8gc3RhdGUuZGltZW5zaW9ucy5yYW5rcyk7XG4gICAgICAgICAgLy8gd2Ugd2FudCB0byBrZWVwIHRoZSByYXRpbyB0aGF0IGlzIG9uIHRoZSBib2FyZFxuICAgICAgICAgIHJhdGlvID0gW2hlaWdodEJhc2UgKiBzdGF0ZS5zcXVhcmVSYXRpb1swXSwgaGVpZ2h0QmFzZSAqIHN0YXRlLnNxdWFyZVJhdGlvWzFdXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWwgPSByZW5kZXJFbGxpcHNlKG9yaWcsIHJhdGlvLCAhIWN1cnJlbnQpO1xuICAgIH1cbiAgICBpZiAoZWwpIHtcbiAgICAgIGNvbnN0IGcgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ2cnKSwge1xuICAgICAgICBjbGFzczogc2hhcGVDbGFzcyhzaGFwZS5icnVzaCwgISFjdXJyZW50LCBmYWxzZSksXG4gICAgICAgIHNnSGFzaDogaGFzaCxcbiAgICAgIH0pO1xuICAgICAgZy5hcHBlbmRDaGlsZChlbCk7XG4gICAgICBjb25zdCBkZXNjRWwgPSBzaGFwZS5kZXNjcmlwdGlvbiAmJiByZW5kZXJEZXNjcmlwdGlvbihzdGF0ZSwgc2hhcGUsIGFycm93RGVzdHMpO1xuICAgICAgaWYgKGRlc2NFbCkgZy5hcHBlbmRDaGlsZChkZXNjRWwpO1xuICAgICAgcmV0dXJuIGc7XG4gICAgfSBlbHNlIHJldHVybjtcbiAgfVxufVxuXG5mdW5jdGlvbiByZW5kZXJDdXN0b21TdmcoXG4gIGJydXNoOiBzdHJpbmcsXG4gIGN1c3RvbVN2Zzogc3RyaW5nLFxuICBwb3M6IHNnLlBvcyxcbiAgcmF0aW86IHNnLk51bWJlclBhaXIsXG4pOiBTVkdFbGVtZW50IHtcbiAgY29uc3QgW3gsIHldID0gcG9zO1xuXG4gIC8vIFRyYW5zbGF0ZSB0byB0b3AtbGVmdCBvZiBgb3JpZ2Agc3F1YXJlXG4gIGNvbnN0IGcgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ2cnKSwgeyB0cmFuc2Zvcm06IGB0cmFuc2xhdGUoJHt4fSwke3l9KWAgfSk7XG5cbiAgY29uc3Qgc3ZnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdzdmcnKSwge1xuICAgIGNsYXNzOiBicnVzaCxcbiAgICB3aWR0aDogcmF0aW9bMF0sXG4gICAgaGVpZ2h0OiByYXRpb1sxXSxcbiAgICB2aWV3Qm94OiBgMCAwICR7cmF0aW9bMF0gKiAxMH0gJHtyYXRpb1sxXSAqIDEwfWAsXG4gIH0pO1xuXG4gIGcuYXBwZW5kQ2hpbGQoc3ZnKTtcbiAgc3ZnLmlubmVySFRNTCA9IGN1c3RvbVN2ZztcblxuICByZXR1cm4gZztcbn1cblxuZnVuY3Rpb24gcmVuZGVyRWxsaXBzZShwb3M6IHNnLlBvcywgcmF0aW86IHNnLk51bWJlclBhaXIsIGN1cnJlbnQ6IGJvb2xlYW4pOiBTVkdFbGVtZW50IHtcbiAgY29uc3QgbyA9IHBvcztcbiAgY29uc3Qgd2lkdGhzID0gZWxsaXBzZVdpZHRoKHJhdGlvKTtcbiAgcmV0dXJuIHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnZWxsaXBzZScpLCB7XG4gICAgJ3N0cm9rZS13aWR0aCc6IHdpZHRoc1tjdXJyZW50ID8gMCA6IDFdLFxuICAgIGZpbGw6ICdub25lJyxcbiAgICBjeDogb1swXSxcbiAgICBjeTogb1sxXSxcbiAgICByeDogcmF0aW9bMF0gLyAyIC0gd2lkdGhzWzFdIC8gMixcbiAgICByeTogcmF0aW9bMV0gLyAyIC0gd2lkdGhzWzFdIC8gMixcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckFycm93KFxuICBicnVzaDogc3RyaW5nLFxuICBvcmlnOiBzZy5Qb3MsXG4gIGRlc3Q6IHNnLlBvcyxcbiAgcmF0aW86IHNnLk51bWJlclBhaXIsXG4gIGN1cnJlbnQ6IGJvb2xlYW4sXG4gIHNob3J0ZW46IGJvb2xlYW4sXG4pOiBTVkdFbGVtZW50IHtcbiAgY29uc3QgbSA9IGFycm93TWFyZ2luKHNob3J0ZW4gJiYgIWN1cnJlbnQsIHJhdGlvKTtcbiAgY29uc3QgYSA9IG9yaWc7XG4gIGNvbnN0IGIgPSBkZXN0O1xuICBjb25zdCBkeCA9IGJbMF0gLSBhWzBdO1xuICBjb25zdCBkeSA9IGJbMV0gLSBhWzFdO1xuICBjb25zdCBhbmdsZSA9IE1hdGguYXRhbjIoZHksIGR4KTtcbiAgY29uc3QgeG8gPSBNYXRoLmNvcyhhbmdsZSkgKiBtO1xuICBjb25zdCB5byA9IE1hdGguc2luKGFuZ2xlKSAqIG07XG4gIHJldHVybiBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ2xpbmUnKSwge1xuICAgICdzdHJva2Utd2lkdGgnOiBsaW5lV2lkdGgoY3VycmVudCwgcmF0aW8pLFxuICAgICdzdHJva2UtbGluZWNhcCc6ICdyb3VuZCcsXG4gICAgJ21hcmtlci1lbmQnOiBgdXJsKCNhcnJvd2hlYWQtJHticnVzaCB8fCAncHJpbWFyeSd9KWAsXG4gICAgeDE6IGFbMF0sXG4gICAgeTE6IGFbMV0sXG4gICAgeDI6IGJbMF0gLSB4byxcbiAgICB5MjogYlsxXSAtIHlvLFxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclBpZWNlKHN0YXRlOiBTdGF0ZSwgeyBzaGFwZSB9OiBTaGFwZSk6IHNnLlBpZWNlTm9kZSB8IHVuZGVmaW5lZCB7XG4gIGlmICghc2hhcGUucGllY2UgfHwgaXNQaWVjZShzaGFwZS5vcmlnKSkgcmV0dXJuO1xuXG4gIGNvbnN0IG9yaWcgPSBzaGFwZS5vcmlnO1xuICBjb25zdCBzY2FsZSA9IChzaGFwZS5waWVjZS5zY2FsZSB8fCAxKSAqIChzdGF0ZS5zY2FsZURvd25QaWVjZXMgPyAwLjUgOiAxKTtcblxuICBjb25zdCBwaWVjZUVsID0gY3JlYXRlRWwoJ3BpZWNlJywgcGllY2VOYW1lT2Yoc2hhcGUucGllY2UpKSBhcyBzZy5QaWVjZU5vZGU7XG4gIHBpZWNlRWwuc2dLZXkgPSBvcmlnO1xuICBwaWVjZUVsLnNnU2NhbGUgPSBzY2FsZTtcbiAgdHJhbnNsYXRlUmVsKFxuICAgIHBpZWNlRWwsXG4gICAgcG9zVG9UcmFuc2xhdGVSZWwoc3RhdGUuZGltZW5zaW9ucykoa2V5MnBvcyhvcmlnKSwgc2VudGVQb3Yoc3RhdGUub3JpZW50YXRpb24pKSxcbiAgICBzdGF0ZS5zY2FsZURvd25QaWVjZXMgPyAwLjUgOiAxLFxuICAgIHNjYWxlLFxuICApO1xuXG4gIHJldHVybiBwaWVjZUVsO1xufVxuXG5mdW5jdGlvbiByZW5kZXJEZXNjcmlwdGlvbihcbiAgc3RhdGU6IFN0YXRlLFxuICBzaGFwZTogRHJhd1NoYXBlLFxuICBhcnJvd0Rlc3RzOiBBcnJvd0Rlc3RzLFxuKTogU1ZHRWxlbWVudCB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IG9yaWcgPSBwaWVjZU9yS2V5VG9Qb3Moc2hhcGUub3JpZywgc3RhdGUpO1xuICBpZiAoIW9yaWcgfHwgIXNoYXBlLmRlc2NyaXB0aW9uKSByZXR1cm47XG4gIGNvbnN0IGRlc3QgPSAhc2FtZVBpZWNlT3JLZXkoc2hhcGUub3JpZywgc2hhcGUuZGVzdCkgJiYgcGllY2VPcktleVRvUG9zKHNoYXBlLmRlc3QsIHN0YXRlKTtcbiAgY29uc3QgZGlmZiA9IGRlc3QgPyBbZGVzdFswXSAtIG9yaWdbMF0sIGRlc3RbMV0gLSBvcmlnWzFdXSA6IFswLCAwXTtcbiAgY29uc3Qgb2Zmc2V0ID1cbiAgICAoYXJyb3dEZXN0cy5nZXQoaXNQaWVjZShzaGFwZS5kZXN0KSA/IHBpZWNlTmFtZU9mKHNoYXBlLmRlc3QpIDogc2hhcGUuZGVzdCkgfHwgMCkgPiAxXG4gICAgICA/IDAuM1xuICAgICAgOiAwLjE1O1xuICBjb25zdCBjbG9zZSA9XG4gICAgKGRpZmZbMF0gPT09IDAgfHwgTWF0aC5hYnMoZGlmZlswXSkgPT09IHN0YXRlLnNxdWFyZVJhdGlvWzBdKSAmJlxuICAgIChkaWZmWzFdID09PSAwIHx8IE1hdGguYWJzKGRpZmZbMV0pID09PSBzdGF0ZS5zcXVhcmVSYXRpb1sxXSk7XG4gIGNvbnN0IHJhdGlvID0gZGVzdCA/IDAuNTUgLSAoY2xvc2UgPyBvZmZzZXQgOiAwKSA6IDA7XG4gIGNvbnN0IG1pZDogc2cuUG9zID0gW29yaWdbMF0gKyBkaWZmWzBdICogcmF0aW8sIG9yaWdbMV0gKyBkaWZmWzFdICogcmF0aW9dO1xuICBjb25zdCB0ZXh0TGVuZ3RoID0gc2hhcGUuZGVzY3JpcHRpb24ubGVuZ3RoO1xuICBjb25zdCBnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdnJyksIHsgY2xhc3M6ICdkZXNjcmlwdGlvbicgfSk7XG4gIGNvbnN0IGNpcmNsZSA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnZWxsaXBzZScpLCB7XG4gICAgY3g6IG1pZFswXSxcbiAgICBjeTogbWlkWzFdLFxuICAgIHJ4OiB0ZXh0TGVuZ3RoICsgMS41LFxuICAgIHJ5OiAyLjUsXG4gIH0pO1xuICBjb25zdCB0ZXh0ID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCd0ZXh0JyksIHtcbiAgICB4OiBtaWRbMF0sXG4gICAgeTogbWlkWzFdLFxuICAgICd0ZXh0LWFuY2hvcic6ICdtaWRkbGUnLFxuICAgICdkb21pbmFudC1iYXNlbGluZSc6ICdjZW50cmFsJyxcbiAgfSk7XG4gIGcuYXBwZW5kQ2hpbGQoY2lyY2xlKTtcbiAgdGV4dC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzaGFwZS5kZXNjcmlwdGlvbikpO1xuICBnLmFwcGVuZENoaWxkKHRleHQpO1xuICByZXR1cm4gZztcbn1cblxuZnVuY3Rpb24gcmVuZGVyTWFya2VyKGJydXNoOiBzdHJpbmcpOiBTVkdFbGVtZW50IHtcbiAgY29uc3QgbWFya2VyID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdtYXJrZXInKSwge1xuICAgIGlkOiBgYXJyb3doZWFkLSR7YnJ1c2h9YCxcbiAgICBvcmllbnQ6ICdhdXRvJyxcbiAgICBtYXJrZXJXaWR0aDogNCxcbiAgICBtYXJrZXJIZWlnaHQ6IDgsXG4gICAgcmVmWDogMi4wNSxcbiAgICByZWZZOiAyLjAxLFxuICB9KTtcbiAgbWFya2VyLmFwcGVuZENoaWxkKFxuICAgIHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgncGF0aCcpLCB7XG4gICAgICBkOiAnTTAsMCBWNCBMMywyIFonLFxuICAgIH0pLFxuICApO1xuICBtYXJrZXIuc2V0QXR0cmlidXRlKCdzZ0tleScsIGJydXNoKTtcbiAgcmV0dXJuIG1hcmtlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldEF0dHJpYnV0ZXMoZWw6IFNWR0VsZW1lbnQsIGF0dHJzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogU1ZHRWxlbWVudCB7XG4gIGZvciAoY29uc3Qga2V5IGluIGF0dHJzKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChhdHRycywga2V5KSkgZWwuc2V0QXR0cmlidXRlKGtleSwgYXR0cnNba2V5XSk7XG4gIH1cbiAgcmV0dXJuIGVsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcG9zMnVzZXIoXG4gIHBvczogc2cuUG9zLFxuICBjb2xvcjogc2cuQ29sb3IsXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIHJhdGlvOiBzZy5OdW1iZXJQYWlyLFxuKTogc2cuTnVtYmVyUGFpciB7XG4gIHJldHVybiBjb2xvciA9PT0gJ3NlbnRlJ1xuICAgID8gWyhkaW1zLmZpbGVzIC0gMSAtIHBvc1swXSkgKiByYXRpb1swXSwgcG9zWzFdICogcmF0aW9bMV1dXG4gICAgOiBbcG9zWzBdICogcmF0aW9bMF0sIChkaW1zLnJhbmtzIC0gMSAtIHBvc1sxXSkgKiByYXRpb1sxXV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1BpZWNlKHg6IHNnLktleSB8IHNnLlBpZWNlKTogeCBpcyBzZy5QaWVjZSB7XG4gIHJldHVybiB0eXBlb2YgeCA9PT0gJ29iamVjdCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYW1lUGllY2VPcktleShrcDE6IHNnLktleSB8IHNnLlBpZWNlLCBrcDI6IHNnLktleSB8IHNnLlBpZWNlKTogYm9vbGVhbiB7XG4gIHJldHVybiAoaXNQaWVjZShrcDEpICYmIGlzUGllY2Uoa3AyKSAmJiBzYW1lUGllY2Uoa3AxLCBrcDIpKSB8fCBrcDEgPT09IGtwMjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZXNCb3VuZHMoc2hhcGVzOiBEcmF3U2hhcGVbXSk6IGJvb2xlYW4ge1xuICByZXR1cm4gc2hhcGVzLnNvbWUoKHMpID0+IGlzUGllY2Uocy5vcmlnKSB8fCBpc1BpZWNlKHMuZGVzdCkpO1xufVxuXG5mdW5jdGlvbiBzaGFwZUNsYXNzKGJydXNoOiBzdHJpbmcsIGN1cnJlbnQ6IGJvb2xlYW4sIG91dHNpZGU6IGJvb2xlYW4pOiBzdHJpbmcge1xuICByZXR1cm4gYnJ1c2ggKyAoY3VycmVudCA/ICcgY3VycmVudCcgOiAnJykgKyAob3V0c2lkZSA/ICcgb3V0c2lkZScgOiAnJyk7XG59XG5cbmZ1bmN0aW9uIHJhdGlvQXZlcmFnZShyYXRpbzogc2cuTnVtYmVyUGFpcik6IG51bWJlciB7XG4gIHJldHVybiAocmF0aW9bMF0gKyByYXRpb1sxXSkgLyAyO1xufVxuXG5mdW5jdGlvbiBlbGxpcHNlV2lkdGgocmF0aW86IHNnLk51bWJlclBhaXIpOiBbbnVtYmVyLCBudW1iZXJdIHtcbiAgcmV0dXJuIFsoMyAvIDY0KSAqIHJhdGlvQXZlcmFnZShyYXRpbyksICg0IC8gNjQpICogcmF0aW9BdmVyYWdlKHJhdGlvKV07XG59XG5cbmZ1bmN0aW9uIGxpbmVXaWR0aChjdXJyZW50OiBib29sZWFuLCByYXRpbzogc2cuTnVtYmVyUGFpcik6IG51bWJlciB7XG4gIHJldHVybiAoKGN1cnJlbnQgPyA4LjUgOiAxMCkgLyA2NCkgKiByYXRpb0F2ZXJhZ2UocmF0aW8pO1xufVxuXG5mdW5jdGlvbiBhcnJvd01hcmdpbihzaG9ydGVuOiBib29sZWFuLCByYXRpbzogc2cuTnVtYmVyUGFpcik6IG51bWJlciB7XG4gIHJldHVybiAoKHNob3J0ZW4gPyAyMCA6IDEwKSAvIDY0KSAqIHJhdGlvQXZlcmFnZShyYXRpbyk7XG59XG5cbmZ1bmN0aW9uIHBpZWNlT3JLZXlUb1BvcyhrcDogc2cuS2V5IHwgc2cuUGllY2UsIHN0YXRlOiBTdGF0ZSk6IHNnLlBvcyB8IHVuZGVmaW5lZCB7XG4gIGlmIChpc1BpZWNlKGtwKSkge1xuICAgIGNvbnN0IHBpZWNlQm91bmRzID0gc3RhdGUuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcygpLmdldChwaWVjZU5hbWVPZihrcCkpO1xuICAgIGNvbnN0IGJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gICAgY29uc3Qgb2Zmc2V0ID0gc2VudGVQb3Yoc3RhdGUub3JpZW50YXRpb24pID8gWzAuNSwgLTAuNV0gOiBbLTAuNSwgMC41XTtcbiAgICBjb25zdCBwb3MgPVxuICAgICAgcGllY2VCb3VuZHMgJiZcbiAgICAgIGJvdW5kcyAmJlxuICAgICAgcG9zT2ZPdXRzaWRlRWwoXG4gICAgICAgIHBpZWNlQm91bmRzLmxlZnQgKyBwaWVjZUJvdW5kcy53aWR0aCAvIDIsXG4gICAgICAgIHBpZWNlQm91bmRzLnRvcCArIHBpZWNlQm91bmRzLmhlaWdodCAvIDIsXG4gICAgICAgIHNlbnRlUG92KHN0YXRlLm9yaWVudGF0aW9uKSxcbiAgICAgICAgc3RhdGUuZGltZW5zaW9ucyxcbiAgICAgICAgYm91bmRzLFxuICAgICAgKTtcbiAgICByZXR1cm4gKFxuICAgICAgcG9zICYmXG4gICAgICBwb3MydXNlcihcbiAgICAgICAgW3Bvc1swXSArIG9mZnNldFswXSwgcG9zWzFdICsgb2Zmc2V0WzFdXSxcbiAgICAgICAgc3RhdGUub3JpZW50YXRpb24sXG4gICAgICAgIHN0YXRlLmRpbWVuc2lvbnMsXG4gICAgICAgIHN0YXRlLnNxdWFyZVJhdGlvLFxuICAgICAgKVxuICAgICk7XG4gIH0gZWxzZSByZXR1cm4gcG9zMnVzZXIoa2V5MnBvcyhrcCksIHN0YXRlLm9yaWVudGF0aW9uLCBzdGF0ZS5kaW1lbnNpb25zLCBzdGF0ZS5zcXVhcmVSYXRpbyk7XG59XG4iLCAiaW1wb3J0IHsgY2FuY2VsTW92ZU9yRHJvcCwgdW5zZWxlY3QgfSBmcm9tICcuL2JvYXJkLmpzJztcbmltcG9ydCB7IGlzUGllY2UsIHBvczJ1c2VyLCBzYW1lUGllY2VPcktleSwgc2V0QXR0cmlidXRlcyB9IGZyb20gJy4vc2hhcGVzLmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQge1xuICBldmVudFBvc2l0aW9uLFxuICBnZXRIYW5kUGllY2VBdERvbVBvcyxcbiAgZ2V0S2V5QXREb21Qb3MsXG4gIGlzUmlnaHRCdXR0b24sXG4gIHBvc09mT3V0c2lkZUVsLFxuICBzYW1lUGllY2UsXG4gIHNlbnRlUG92LFxufSBmcm9tICcuL3V0aWwuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdTaGFwZSB7XG4gIG9yaWc6IHNnLktleSB8IHNnLlBpZWNlO1xuICBkZXN0OiBzZy5LZXkgfCBzZy5QaWVjZTtcbiAgcGllY2U/OiBEcmF3U2hhcGVQaWVjZTtcbiAgY3VzdG9tU3ZnPzogc3RyaW5nOyAvLyBzdmdcbiAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG4gIGJydXNoOiBzdHJpbmc7IC8vIGNzcyBjbGFzcyB0byBiZSBhcHBlbmRlZFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNxdWFyZUhpZ2hsaWdodCB7XG4gIGtleTogc2cuS2V5O1xuICBjbGFzc05hbWU6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEcmF3U2hhcGVQaWVjZSB7XG4gIHJvbGU6IHNnLlJvbGVTdHJpbmc7XG4gIGNvbG9yOiBzZy5Db2xvcjtcbiAgc2NhbGU/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd2FibGUge1xuICBlbmFibGVkOiBib29sZWFuOyAvLyBjYW4gZHJhd1xuICB2aXNpYmxlOiBib29sZWFuOyAvLyBjYW4gdmlld1xuICBmb3JjZWQ6IGJvb2xlYW47IC8vIGNhbiBvbmx5IGRyYXdcbiAgZXJhc2VPbkNsaWNrOiBib29sZWFuO1xuICBvbkNoYW5nZT86IChzaGFwZXM6IERyYXdTaGFwZVtdKSA9PiB2b2lkO1xuICBzaGFwZXM6IERyYXdTaGFwZVtdOyAvLyB1c2VyIHNoYXBlc1xuICBhdXRvU2hhcGVzOiBEcmF3U2hhcGVbXTsgLy8gY29tcHV0ZXIgc2hhcGVzXG4gIHNxdWFyZXM6IFNxdWFyZUhpZ2hsaWdodFtdO1xuICBjdXJyZW50PzogRHJhd0N1cnJlbnQ7XG4gIHByZXZTdmdIYXNoOiBzdHJpbmc7XG4gIHBpZWNlPzogc2cuUGllY2U7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd0N1cnJlbnQge1xuICBvcmlnOiBzZy5LZXkgfCBzZy5QaWVjZTtcbiAgZGVzdD86IHNnLktleSB8IHNnLlBpZWNlOyAvLyB1bmRlZmluZWQgaWYgb3V0c2lkZSBib2FyZC9oYW5kc1xuICBhcnJvdz86IFNWR0VsZW1lbnQ7XG4gIHBpZWNlPzogc2cuUGllY2U7XG4gIHBvczogc2cuTnVtYmVyUGFpcjtcbiAgYnJ1c2g6IHN0cmluZzsgLy8gYnJ1c2ggbmFtZSBmb3Igc2hhcGVcbn1cblxuY29uc3QgYnJ1c2hlcyA9IFsncHJpbWFyeScsICdhbHRlcm5hdGl2ZTAnLCAnYWx0ZXJuYXRpdmUxJywgJ2FsdGVybmF0aXZlMiddO1xuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnQoc3RhdGU6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIC8vIHN1cHBvcnQgb25lIGZpbmdlciB0b3VjaCBvbmx5XG4gIGlmIChlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDEpIHJldHVybjtcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gIGlmIChlLmN0cmxLZXkpIHVuc2VsZWN0KHN0YXRlKTtcbiAgZWxzZSBjYW5jZWxNb3ZlT3JEcm9wKHN0YXRlKTtcblxuICBjb25zdCBwb3MgPSBldmVudFBvc2l0aW9uKGUpO1xuICBjb25zdCBib3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpO1xuICBjb25zdCBvcmlnID1cbiAgICBwb3MgJiYgYm91bmRzICYmIGdldEtleUF0RG9tUG9zKHBvcywgc2VudGVQb3Yoc3RhdGUub3JpZW50YXRpb24pLCBzdGF0ZS5kaW1lbnNpb25zLCBib3VuZHMpO1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLmRyYXdhYmxlLnBpZWNlO1xuICBpZiAoIW9yaWcpIHJldHVybjtcbiAgc3RhdGUuZHJhd2FibGUuY3VycmVudCA9IHtcbiAgICBvcmlnLFxuICAgIGRlc3Q6IHVuZGVmaW5lZCxcbiAgICBwb3MsXG4gICAgcGllY2UsXG4gICAgYnJ1c2g6IGV2ZW50QnJ1c2goZSwgaXNSaWdodEJ1dHRvbihlKSB8fCBzdGF0ZS5kcmF3YWJsZS5mb3JjZWQpLFxuICB9O1xuICBwcm9jZXNzRHJhdyhzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydEZyb21IYW5kKHN0YXRlOiBTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBlOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIC8vIHN1cHBvcnQgb25lIGZpbmdlciB0b3VjaCBvbmx5XG4gIGlmIChlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDEpIHJldHVybjtcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gIGlmIChlLmN0cmxLZXkpIHVuc2VsZWN0KHN0YXRlKTtcbiAgZWxzZSBjYW5jZWxNb3ZlT3JEcm9wKHN0YXRlKTtcblxuICBjb25zdCBwb3MgPSBldmVudFBvc2l0aW9uKGUpO1xuICBpZiAoIXBvcykgcmV0dXJuO1xuICBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50ID0ge1xuICAgIG9yaWc6IHBpZWNlLFxuICAgIGRlc3Q6IHVuZGVmaW5lZCxcbiAgICBwb3MsXG4gICAgYnJ1c2g6IGV2ZW50QnJ1c2goZSwgaXNSaWdodEJ1dHRvbihlKSB8fCBzdGF0ZS5kcmF3YWJsZS5mb3JjZWQpLFxuICB9O1xuICBwcm9jZXNzRHJhdyhzdGF0ZSk7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NEcmF3KHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIGNvbnN0IGN1ciA9IHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQ7XG4gICAgY29uc3QgYm91bmRzID0gc3RhdGUuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKTtcbiAgICBpZiAoY3VyICYmIGJvdW5kcykge1xuICAgICAgY29uc3QgZGVzdCA9XG4gICAgICAgIGdldEtleUF0RG9tUG9zKGN1ci5wb3MsIHNlbnRlUG92KHN0YXRlLm9yaWVudGF0aW9uKSwgc3RhdGUuZGltZW5zaW9ucywgYm91bmRzKSB8fFxuICAgICAgICBnZXRIYW5kUGllY2VBdERvbVBvcyhjdXIucG9zLCBzdGF0ZS5oYW5kcy5yb2xlcywgc3RhdGUuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcygpKTtcbiAgICAgIGlmIChjdXIuZGVzdCAhPT0gZGVzdCAmJiAhKGN1ci5kZXN0ICYmIGRlc3QgJiYgc2FtZVBpZWNlT3JLZXkoZGVzdCwgY3VyLmRlc3QpKSkge1xuICAgICAgICBjdXIuZGVzdCA9IGRlc3Q7XG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXdOb3coKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG91dFBvcyA9IHBvc09mT3V0c2lkZUVsKFxuICAgICAgICBjdXIucG9zWzBdLFxuICAgICAgICBjdXIucG9zWzFdLFxuICAgICAgICBzZW50ZVBvdihzdGF0ZS5vcmllbnRhdGlvbiksXG4gICAgICAgIHN0YXRlLmRpbWVuc2lvbnMsXG4gICAgICAgIGJvdW5kcyxcbiAgICAgICk7XG4gICAgICBpZiAoIWN1ci5kZXN0ICYmIGN1ci5hcnJvdyAmJiBvdXRQb3MpIHtcbiAgICAgICAgY29uc3QgZGVzdCA9IHBvczJ1c2VyKG91dFBvcywgc3RhdGUub3JpZW50YXRpb24sIHN0YXRlLmRpbWVuc2lvbnMsIHN0YXRlLnNxdWFyZVJhdGlvKTtcblxuICAgICAgICBzZXRBdHRyaWJ1dGVzKGN1ci5hcnJvdywge1xuICAgICAgICAgIHgyOiBkZXN0WzBdIC0gc3RhdGUuc3F1YXJlUmF0aW9bMF0gLyAyLFxuICAgICAgICAgIHkyOiBkZXN0WzFdIC0gc3RhdGUuc3F1YXJlUmF0aW9bMV0gLyAyLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHByb2Nlc3NEcmF3KHN0YXRlKTtcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZShzdGF0ZTogU3RhdGUsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgY29uc3QgcG9zID0gZXZlbnRQb3NpdGlvbihlKTtcbiAgaWYgKHBvcyAmJiBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50KSBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50LnBvcyA9IHBvcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuZChzdGF0ZTogU3RhdGUsIF86IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgY29uc3QgY3VyID0gc3RhdGUuZHJhd2FibGUuY3VycmVudDtcbiAgaWYgKGN1cikge1xuICAgIGFkZFNoYXBlKHN0YXRlLmRyYXdhYmxlLCBjdXIpO1xuICAgIGNhbmNlbChzdGF0ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbmNlbChzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQpIHtcbiAgICBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXIoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGNvbnN0IGRyYXdhYmxlTGVuZ3RoID0gc3RhdGUuZHJhd2FibGUuc2hhcGVzLmxlbmd0aDtcbiAgaWYgKGRyYXdhYmxlTGVuZ3RoIHx8IHN0YXRlLmRyYXdhYmxlLnBpZWNlKSB7XG4gICAgc3RhdGUuZHJhd2FibGUuc2hhcGVzID0gW107XG4gICAgc3RhdGUuZHJhd2FibGUucGllY2UgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgIGlmIChkcmF3YWJsZUxlbmd0aCkgb25DaGFuZ2Uoc3RhdGUuZHJhd2FibGUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXREcmF3UGllY2Uoc3RhdGU6IFN0YXRlLCBwaWVjZTogc2cuUGllY2UpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLmRyYXdhYmxlLnBpZWNlICYmIHNhbWVQaWVjZShzdGF0ZS5kcmF3YWJsZS5waWVjZSwgcGllY2UpKVxuICAgIHN0YXRlLmRyYXdhYmxlLnBpZWNlID0gdW5kZWZpbmVkO1xuICBlbHNlIHN0YXRlLmRyYXdhYmxlLnBpZWNlID0gcGllY2U7XG4gIHN0YXRlLmRvbS5yZWRyYXcoKTtcbn1cblxuZnVuY3Rpb24gZXZlbnRCcnVzaChlOiBzZy5Nb3VjaEV2ZW50LCBhbGxvd0ZpcnN0TW9kaWZpZXI6IGJvb2xlYW4pOiBzdHJpbmcge1xuICBjb25zdCBtb2RBID0gYWxsb3dGaXJzdE1vZGlmaWVyICYmIChlLnNoaWZ0S2V5IHx8IGUuY3RybEtleSk7XG4gIGNvbnN0IG1vZEIgPSBlLmFsdEtleSB8fCBlLm1ldGFLZXkgfHwgZS5nZXRNb2RpZmllclN0YXRlPy4oJ0FsdEdyYXBoJyk7XG4gIHJldHVybiBicnVzaGVzWyhtb2RBID8gMSA6IDApICsgKG1vZEIgPyAyIDogMCldO1xufVxuXG5mdW5jdGlvbiBhZGRTaGFwZShkcmF3YWJsZTogRHJhd2FibGUsIGN1cjogRHJhd0N1cnJlbnQpOiB2b2lkIHtcbiAgaWYgKCFjdXIuZGVzdCkgcmV0dXJuO1xuXG4gIGNvbnN0IHNpbWlsYXJTaGFwZSA9IChzOiBEcmF3U2hhcGUpID0+XG4gICAgY3VyLmRlc3QgJiYgc2FtZVBpZWNlT3JLZXkoY3VyLm9yaWcsIHMub3JpZykgJiYgc2FtZVBpZWNlT3JLZXkoY3VyLmRlc3QsIHMuZGVzdCk7XG5cbiAgLy8gc2VwYXJhdGUgc2hhcGUgZm9yIHBpZWNlc1xuICBjb25zdCBwaWVjZSA9IGN1ci5waWVjZTtcbiAgY3VyLnBpZWNlID0gdW5kZWZpbmVkO1xuXG4gIGNvbnN0IHNpbWlsYXIgPSBkcmF3YWJsZS5zaGFwZXMuZmluZChzaW1pbGFyU2hhcGUpO1xuICBjb25zdCByZW1vdmVQaWVjZSA9IGRyYXdhYmxlLnNoYXBlcy5maW5kKFxuICAgIChzKSA9PiBzaW1pbGFyU2hhcGUocykgJiYgcGllY2UgJiYgcy5waWVjZSAmJiBzYW1lUGllY2UocGllY2UsIHMucGllY2UpLFxuICApO1xuICBjb25zdCBkaWZmUGllY2UgPSBkcmF3YWJsZS5zaGFwZXMuZmluZChcbiAgICAocykgPT4gc2ltaWxhclNoYXBlKHMpICYmIHBpZWNlICYmIHMucGllY2UgJiYgIXNhbWVQaWVjZShwaWVjZSwgcy5waWVjZSksXG4gICk7XG5cbiAgLy8gcmVtb3ZlIGV2ZXJ5IHNpbWlsYXIgc2hhcGVcbiAgaWYgKHNpbWlsYXIpIGRyYXdhYmxlLnNoYXBlcyA9IGRyYXdhYmxlLnNoYXBlcy5maWx0ZXIoKHMpID0+ICFzaW1pbGFyU2hhcGUocykpO1xuXG4gIGlmICghaXNQaWVjZShjdXIub3JpZykgJiYgcGllY2UgJiYgIXJlbW92ZVBpZWNlKSB7XG4gICAgZHJhd2FibGUuc2hhcGVzLnB1c2goe1xuICAgICAgb3JpZzogY3VyLm9yaWcsXG4gICAgICBkZXN0OiBjdXIub3JpZyxcbiAgICAgIHBpZWNlOiBwaWVjZSxcbiAgICAgIGJydXNoOiBjdXIuYnJ1c2gsXG4gICAgfSk7XG4gICAgLy8gZm9yY2UgY2lyY2xlIGFyb3VuZCBkcmF3biBwaWVjZXNcbiAgICBpZiAoIXNhbWVQaWVjZU9yS2V5KGN1ci5vcmlnLCBjdXIuZGVzdCkpXG4gICAgICBkcmF3YWJsZS5zaGFwZXMucHVzaCh7XG4gICAgICAgIG9yaWc6IGN1ci5vcmlnLFxuICAgICAgICBkZXN0OiBjdXIub3JpZyxcbiAgICAgICAgYnJ1c2g6IGN1ci5icnVzaCxcbiAgICAgIH0pO1xuICB9XG5cbiAgaWYgKCFzaW1pbGFyIHx8IGRpZmZQaWVjZSB8fCBzaW1pbGFyLmJydXNoICE9PSBjdXIuYnJ1c2gpIGRyYXdhYmxlLnNoYXBlcy5wdXNoKGN1ciBhcyBEcmF3U2hhcGUpO1xuICBvbkNoYW5nZShkcmF3YWJsZSk7XG59XG5cbmZ1bmN0aW9uIG9uQ2hhbmdlKGRyYXdhYmxlOiBEcmF3YWJsZSk6IHZvaWQge1xuICBpZiAoZHJhd2FibGUub25DaGFuZ2UpIGRyYXdhYmxlLm9uQ2hhbmdlKGRyYXdhYmxlLnNoYXBlcyk7XG59XG4iLCAiaW1wb3J0IHsgYW5pbSB9IGZyb20gJy4vYW5pbS5qcyc7XG5pbXBvcnQgKiBhcyBib2FyZCBmcm9tICcuL2JvYXJkLmpzJztcbmltcG9ydCB7IGNsZWFyIGFzIGRyYXdDbGVhciB9IGZyb20gJy4vZHJhdy5qcyc7XG5pbXBvcnQgeyBhZGRUb0hhbmQsIHJlbW92ZUZyb21IYW5kIH0gZnJvbSAnLi9oYW5kcy5qcyc7XG5pbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIERyYWdDdXJyZW50IHtcbiAgcGllY2U6IHNnLlBpZWNlOyAvLyBwaWVjZSBiZWluZyBkcmFnZ2VkXG4gIHBvczogc2cuTnVtYmVyUGFpcjsgLy8gbGF0ZXN0IGV2ZW50IHBvc2l0aW9uXG4gIG9yaWdQb3M6IHNnLk51bWJlclBhaXI7IC8vIGZpcnN0IGV2ZW50IHBvc2l0aW9uXG4gIHN0YXJ0ZWQ6IGJvb2xlYW47IC8vIHdoZXRoZXIgdGhlIGRyYWcgaGFzIHN0YXJ0ZWQ7IGFzIHBlciB0aGUgZGlzdGFuY2Ugc2V0dGluZ1xuICBzcGFyZTogYm9vbGVhbjsgLy8gd2hldGhlciB0aGlzIHBpZWNlIGlzIGEgc3BhcmUgb25lXG4gIHRvdWNoOiBib29sZWFuOyAvLyB3YXMgdGhlIGRyYWdnaW5nIGluaXRpYXRlZCBmcm9tIHRvdWNoIGV2ZW50XG4gIG9yaWdpblRhcmdldDogRXZlbnRUYXJnZXQgfCBudWxsO1xuICBmcm9tQm9hcmQ/OiB7XG4gICAgb3JpZzogc2cuS2V5OyAvLyBvcmlnIGtleSBvZiBkcmFnZ2luZyBwaWVjZVxuICAgIHByZXZpb3VzbHlTZWxlY3RlZD86IHNnLktleTsgLy8gc2VsZWN0ZWQgcGllY2UgYmVmb3JlIGRyYWcgYmVnYW5cbiAgICBrZXlIYXNDaGFuZ2VkOiBib29sZWFuOyAvLyB3aGV0aGVyIHRoZSBkcmFnIGhhcyBsZWZ0IHRoZSBvcmlnIGtleSBvciBwaWVjZVxuICB9O1xuICBmcm9tT3V0c2lkZT86IHtcbiAgICBvcmlnaW5Cb3VuZHM6IERPTVJlY3QgfCB1bmRlZmluZWQ7IC8vIGJvdW5kcyBvZiB0aGUgcGllY2UgdGhhdCBpbml0aWF0ZWQgdGhlIGRyYWdcbiAgICBsZWZ0T3JpZ2luOiBib29sZWFuOyAvLyBoYXZlIHdlIGV2ZXIgbGVmdCBvcmlnaW5Cb3VuZHNcbiAgICBwcmV2aW91c2x5U2VsZWN0ZWRQaWVjZT86IHNnLlBpZWNlO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnQoczogU3RhdGUsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgY29uc3QgYm91bmRzID0gcy5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpO1xuICBjb25zdCBwb3NpdGlvbiA9IHV0aWwuZXZlbnRQb3NpdGlvbihlKTtcbiAgY29uc3Qgb3JpZyA9XG4gICAgYm91bmRzICYmXG4gICAgcG9zaXRpb24gJiZcbiAgICB1dGlsLmdldEtleUF0RG9tUG9zKHBvc2l0aW9uLCB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pLCBzLmRpbWVuc2lvbnMsIGJvdW5kcyk7XG5cbiAgaWYgKCFvcmlnKSByZXR1cm47XG5cbiAgY29uc3QgcGllY2UgPSBzLnBpZWNlcy5nZXQob3JpZyk7XG4gIGNvbnN0IHByZXZpb3VzbHlTZWxlY3RlZCA9IHMuc2VsZWN0ZWQ7XG4gIGlmIChcbiAgICAhcHJldmlvdXNseVNlbGVjdGVkICYmXG4gICAgcy5kcmF3YWJsZS5lbmFibGVkICYmXG4gICAgKHMuZHJhd2FibGUuZXJhc2VPbkNsaWNrIHx8ICFwaWVjZSB8fCBwaWVjZS5jb2xvciAhPT0gcy50dXJuQ29sb3IpXG4gIClcbiAgICBkcmF3Q2xlYXIocyk7XG5cbiAgLy8gUHJldmVudCB0b3VjaCBzY3JvbGwgYW5kIGNyZWF0ZSBubyBjb3JyZXNwb25kaW5nIG1vdXNlIGV2ZW50LCBpZiB0aGVyZVxuICAvLyBpcyBhbiBpbnRlbnQgdG8gaW50ZXJhY3Qgd2l0aCB0aGUgYm9hcmQuXG4gIGlmIChcbiAgICBlLmNhbmNlbGFibGUgIT09IGZhbHNlICYmXG4gICAgKCFlLnRvdWNoZXMgfHxcbiAgICAgIHMuYmxvY2tUb3VjaFNjcm9sbCB8fFxuICAgICAgcy5zZWxlY3RlZFBpZWNlIHx8XG4gICAgICBwaWVjZSB8fFxuICAgICAgcHJldmlvdXNseVNlbGVjdGVkIHx8XG4gICAgICBwaWVjZUNsb3NlVG8ocywgcG9zaXRpb24sIGJvdW5kcykpXG4gIClcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIGNvbnN0IGhhZFByZW1vdmUgPSAhIXMucHJlbW92YWJsZS5jdXJyZW50O1xuICBjb25zdCBoYWRQcmVkcm9wID0gISFzLnByZWRyb3BwYWJsZS5jdXJyZW50O1xuICBpZiAocy5zZWxlY3RhYmxlLmRlbGV0ZU9uVG91Y2gpIGJvYXJkLmRlbGV0ZVBpZWNlKHMsIG9yaWcpO1xuICBlbHNlIGlmIChzLnNlbGVjdGVkKSB7XG4gICAgaWYgKCFib2FyZC5wcm9tb3Rpb25EaWFsb2dNb3ZlKHMsIHMuc2VsZWN0ZWQsIG9yaWcpKSB7XG4gICAgICBpZiAoYm9hcmQuY2FuTW92ZShzLCBzLnNlbGVjdGVkLCBvcmlnKSkgYW5pbSgoc3RhdGUpID0+IGJvYXJkLnNlbGVjdFNxdWFyZShzdGF0ZSwgb3JpZyksIHMpO1xuICAgICAgZWxzZSBib2FyZC5zZWxlY3RTcXVhcmUocywgb3JpZyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHMuc2VsZWN0ZWRQaWVjZSkge1xuICAgIGlmICghYm9hcmQucHJvbW90aW9uRGlhbG9nRHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIG9yaWcpKSB7XG4gICAgICBpZiAoYm9hcmQuY2FuRHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIG9yaWcpKVxuICAgICAgICBhbmltKChzdGF0ZSkgPT4gYm9hcmQuc2VsZWN0U3F1YXJlKHN0YXRlLCBvcmlnKSwgcyk7XG4gICAgICBlbHNlIGJvYXJkLnNlbGVjdFNxdWFyZShzLCBvcmlnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgYm9hcmQuc2VsZWN0U3F1YXJlKHMsIG9yaWcpO1xuICB9XG5cbiAgY29uc3Qgc3RpbGxTZWxlY3RlZCA9IHMuc2VsZWN0ZWQgPT09IG9yaWc7XG4gIGNvbnN0IGRyYWdnZWRFbCA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkPy5kcmFnZ2VkO1xuXG4gIGlmIChwaWVjZSAmJiBkcmFnZ2VkRWwgJiYgc3RpbGxTZWxlY3RlZCAmJiBib2FyZC5pc0RyYWdnYWJsZShzLCBwaWVjZSkpIHtcbiAgICBjb25zdCB0b3VjaCA9IGUudHlwZSA9PT0gJ3RvdWNoc3RhcnQnO1xuXG4gICAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHtcbiAgICAgIHBpZWNlLFxuICAgICAgcG9zOiBwb3NpdGlvbixcbiAgICAgIG9yaWdQb3M6IHBvc2l0aW9uLFxuICAgICAgc3RhcnRlZDogcy5kcmFnZ2FibGUuYXV0b0Rpc3RhbmNlICYmICF0b3VjaCxcbiAgICAgIHNwYXJlOiBmYWxzZSxcbiAgICAgIHRvdWNoLFxuICAgICAgb3JpZ2luVGFyZ2V0OiBlLnRhcmdldCxcbiAgICAgIGZyb21Cb2FyZDoge1xuICAgICAgICBvcmlnLFxuICAgICAgICBwcmV2aW91c2x5U2VsZWN0ZWQsXG4gICAgICAgIGtleUhhc0NoYW5nZWQ6IGZhbHNlLFxuICAgICAgfSxcbiAgICB9O1xuXG4gICAgZHJhZ2dlZEVsLnNnQ29sb3IgPSBwaWVjZS5jb2xvcjtcbiAgICBkcmFnZ2VkRWwuc2dSb2xlID0gcGllY2Uucm9sZTtcbiAgICBkcmFnZ2VkRWwuY2xhc3NOYW1lID0gYGRyYWdnaW5nICR7dXRpbC5waWVjZU5hbWVPZihwaWVjZSl9YDtcbiAgICBkcmFnZ2VkRWwuY2xhc3NMaXN0LnRvZ2dsZSgndG91Y2gnLCB0b3VjaCk7XG5cbiAgICBwcm9jZXNzRHJhZyhzKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoaGFkUHJlbW92ZSkgYm9hcmQudW5zZXRQcmVtb3ZlKHMpO1xuICAgIGlmIChoYWRQcmVkcm9wKSBib2FyZC51bnNldFByZWRyb3Aocyk7XG4gIH1cbiAgcy5kb20ucmVkcmF3KCk7XG59XG5cbmZ1bmN0aW9uIHBpZWNlQ2xvc2VUbyhzOiBTdGF0ZSwgcG9zOiBzZy5OdW1iZXJQYWlyLCBib3VuZHM6IERPTVJlY3QpOiBib29sZWFuIHtcbiAgY29uc3QgYXNTZW50ZSA9IHV0aWwuc2VudGVQb3Yocy5vcmllbnRhdGlvbik7XG4gIGNvbnN0IHJhZGl1c1NxID0gKGJvdW5kcy53aWR0aCAvIHMuZGltZW5zaW9ucy5maWxlcykgKiogMjtcbiAgZm9yIChjb25zdCBrZXkgb2Ygcy5waWVjZXMua2V5cygpKSB7XG4gICAgY29uc3QgY2VudGVyID0gdXRpbC5jb21wdXRlU3F1YXJlQ2VudGVyKGtleSwgYXNTZW50ZSwgcy5kaW1lbnNpb25zLCBib3VuZHMpO1xuICAgIGlmICh1dGlsLmRpc3RhbmNlU3EoY2VudGVyLCBwb3MpIDw9IHJhZGl1c1NxKSByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcmFnTmV3UGllY2UoczogU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwgZTogc2cuTW91Y2hFdmVudCwgc3BhcmU/OiBib29sZWFuKTogdm9pZCB7XG4gIGNvbnN0IHByZXZpb3VzbHlTZWxlY3RlZFBpZWNlID0gcy5zZWxlY3RlZFBpZWNlO1xuICBjb25zdCBkcmFnZ2VkRWwgPSBzLmRvbS5lbGVtZW50cy5ib2FyZD8uZHJhZ2dlZDtcbiAgY29uc3QgcG9zaXRpb24gPSB1dGlsLmV2ZW50UG9zaXRpb24oZSk7XG4gIGNvbnN0IHRvdWNoID0gZS50eXBlID09PSAndG91Y2hzdGFydCc7XG5cbiAgaWYgKCFwcmV2aW91c2x5U2VsZWN0ZWRQaWVjZSAmJiAhc3BhcmUgJiYgcy5kcmF3YWJsZS5lbmFibGVkICYmIHMuZHJhd2FibGUuZXJhc2VPbkNsaWNrKVxuICAgIGRyYXdDbGVhcihzKTtcblxuICBpZiAoIXNwYXJlICYmIHMuc2VsZWN0YWJsZS5kZWxldGVPblRvdWNoKSByZW1vdmVGcm9tSGFuZChzLCBwaWVjZSk7XG4gIGVsc2UgYm9hcmQuc2VsZWN0UGllY2UocywgcGllY2UsIHNwYXJlKTtcblxuICBjb25zdCBoYWRQcmVtb3ZlID0gISFzLnByZW1vdmFibGUuY3VycmVudDtcbiAgY29uc3QgaGFkUHJlZHJvcCA9ICEhcy5wcmVkcm9wcGFibGUuY3VycmVudDtcbiAgY29uc3Qgc3RpbGxTZWxlY3RlZCA9IHMuc2VsZWN0ZWRQaWVjZSAmJiB1dGlsLnNhbWVQaWVjZShzLnNlbGVjdGVkUGllY2UsIHBpZWNlKTtcblxuICBpZiAoZHJhZ2dlZEVsICYmIHBvc2l0aW9uICYmIHMuc2VsZWN0ZWRQaWVjZSAmJiBzdGlsbFNlbGVjdGVkICYmIGJvYXJkLmlzRHJhZ2dhYmxlKHMsIHBpZWNlKSkge1xuICAgIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB7XG4gICAgICBwaWVjZTogcy5zZWxlY3RlZFBpZWNlLFxuICAgICAgcG9zOiBwb3NpdGlvbixcbiAgICAgIG9yaWdQb3M6IHBvc2l0aW9uLFxuICAgICAgdG91Y2gsXG4gICAgICBzdGFydGVkOiBzLmRyYWdnYWJsZS5hdXRvRGlzdGFuY2UgJiYgIXRvdWNoLFxuICAgICAgc3BhcmU6ICEhc3BhcmUsXG4gICAgICBvcmlnaW5UYXJnZXQ6IGUudGFyZ2V0LFxuICAgICAgZnJvbU91dHNpZGU6IHtcbiAgICAgICAgb3JpZ2luQm91bmRzOiAhc3BhcmVcbiAgICAgICAgICA/IHMuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcygpLmdldCh1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKSlcbiAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgbGVmdE9yaWdpbjogZmFsc2UsXG4gICAgICAgIHByZXZpb3VzbHlTZWxlY3RlZFBpZWNlOiAhc3BhcmUgPyBwcmV2aW91c2x5U2VsZWN0ZWRQaWVjZSA6IHVuZGVmaW5lZCxcbiAgICAgIH0sXG4gICAgfTtcblxuICAgIGRyYWdnZWRFbC5zZ0NvbG9yID0gcGllY2UuY29sb3I7XG4gICAgZHJhZ2dlZEVsLnNnUm9sZSA9IHBpZWNlLnJvbGU7XG4gICAgZHJhZ2dlZEVsLmNsYXNzTmFtZSA9IGBkcmFnZ2luZyAke3V0aWwucGllY2VOYW1lT2YocGllY2UpfWA7XG4gICAgZHJhZ2dlZEVsLmNsYXNzTGlzdC50b2dnbGUoJ3RvdWNoJywgdG91Y2gpO1xuXG4gICAgcHJvY2Vzc0RyYWcocyk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGhhZFByZW1vdmUpIGJvYXJkLnVuc2V0UHJlbW92ZShzKTtcbiAgICBpZiAoaGFkUHJlZHJvcCkgYm9hcmQudW5zZXRQcmVkcm9wKHMpO1xuICB9XG4gIHMuZG9tLnJlZHJhdygpO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzRHJhZyhzOiBTdGF0ZSk6IHZvaWQge1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIGNvbnN0IGN1ciA9IHMuZHJhZ2dhYmxlLmN1cnJlbnQ7XG4gICAgY29uc3QgZHJhZ2dlZEVsID0gcy5kb20uZWxlbWVudHMuYm9hcmQ/LmRyYWdnZWQ7XG4gICAgY29uc3QgYm91bmRzID0gcy5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpO1xuICAgIGlmICghY3VyIHx8ICFkcmFnZ2VkRWwgfHwgIWJvdW5kcykgcmV0dXJuO1xuICAgIC8vIGNhbmNlbCBhbmltYXRpb25zIHdoaWxlIGRyYWdnaW5nXG4gICAgaWYgKGN1ci5mcm9tQm9hcmQ/Lm9yaWcgJiYgcy5hbmltYXRpb24uY3VycmVudD8ucGxhbi5hbmltcy5oYXMoY3VyLmZyb21Cb2FyZC5vcmlnKSlcbiAgICAgIHMuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgLy8gaWYgbW92aW5nIHBpZWNlIGlzIGdvbmUsIGNhbmNlbFxuICAgIGNvbnN0IG9yaWdQaWVjZSA9IGN1ci5mcm9tQm9hcmQgPyBzLnBpZWNlcy5nZXQoY3VyLmZyb21Cb2FyZC5vcmlnKSA6IGN1ci5waWVjZTtcbiAgICBpZiAoIW9yaWdQaWVjZSB8fCAhdXRpbC5zYW1lUGllY2Uob3JpZ1BpZWNlLCBjdXIucGllY2UpKSBjYW5jZWwocyk7XG4gICAgZWxzZSB7XG4gICAgICBpZiAoIWN1ci5zdGFydGVkICYmIHV0aWwuZGlzdGFuY2VTcShjdXIucG9zLCBjdXIub3JpZ1BvcykgPj0gcy5kcmFnZ2FibGUuZGlzdGFuY2UgKiogMikge1xuICAgICAgICBjdXIuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgIHMuZG9tLnJlZHJhdygpO1xuICAgICAgfVxuICAgICAgaWYgKGN1ci5zdGFydGVkKSB7XG4gICAgICAgIHV0aWwudHJhbnNsYXRlQWJzKFxuICAgICAgICAgIGRyYWdnZWRFbCxcbiAgICAgICAgICBbXG4gICAgICAgICAgICBjdXIucG9zWzBdIC0gYm91bmRzLmxlZnQgLSBib3VuZHMud2lkdGggLyAocy5kaW1lbnNpb25zLmZpbGVzICogMiksXG4gICAgICAgICAgICBjdXIucG9zWzFdIC0gYm91bmRzLnRvcCAtIGJvdW5kcy5oZWlnaHQgLyAocy5kaW1lbnNpb25zLnJhbmtzICogMiksXG4gICAgICAgICAgXSxcbiAgICAgICAgICBzLnNjYWxlRG93blBpZWNlcyA/IDAuNSA6IDEsXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKCFkcmFnZ2VkRWwuc2dEcmFnZ2luZykge1xuICAgICAgICAgIGRyYWdnZWRFbC5zZ0RyYWdnaW5nID0gdHJ1ZTtcbiAgICAgICAgICB1dGlsLnNldERpc3BsYXkoZHJhZ2dlZEVsLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBob3ZlciA9IHV0aWwuZ2V0S2V5QXREb21Qb3MoXG4gICAgICAgICAgY3VyLnBvcyxcbiAgICAgICAgICB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pLFxuICAgICAgICAgIHMuZGltZW5zaW9ucyxcbiAgICAgICAgICBib3VuZHMsXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKGN1ci5mcm9tQm9hcmQpXG4gICAgICAgICAgY3VyLmZyb21Cb2FyZC5rZXlIYXNDaGFuZ2VkID0gY3VyLmZyb21Cb2FyZC5rZXlIYXNDaGFuZ2VkIHx8IGN1ci5mcm9tQm9hcmQub3JpZyAhPT0gaG92ZXI7XG4gICAgICAgIGVsc2UgaWYgKGN1ci5mcm9tT3V0c2lkZSlcbiAgICAgICAgICBjdXIuZnJvbU91dHNpZGUubGVmdE9yaWdpbiA9XG4gICAgICAgICAgICBjdXIuZnJvbU91dHNpZGUubGVmdE9yaWdpbiB8fFxuICAgICAgICAgICAgKCEhY3VyLmZyb21PdXRzaWRlLm9yaWdpbkJvdW5kcyAmJlxuICAgICAgICAgICAgICAhdXRpbC5pc0luc2lkZVJlY3QoY3VyLmZyb21PdXRzaWRlLm9yaWdpbkJvdW5kcywgY3VyLnBvcykpO1xuXG4gICAgICAgIC8vIGlmIHRoZSBob3ZlcmVkIHNxdWFyZSBjaGFuZ2VkXG4gICAgICAgIGlmIChob3ZlciAhPT0gcy5ob3ZlcmVkKSB7XG4gICAgICAgICAgdXBkYXRlSG92ZXJlZFNxdWFyZXMocywgaG92ZXIpO1xuICAgICAgICAgIGlmIChjdXIudG91Y2ggJiYgcy5kb20uZWxlbWVudHMuYm9hcmQ/LnNxdWFyZU92ZXIpIHtcbiAgICAgICAgICAgIGlmIChob3ZlciAmJiBzLmRyYWdnYWJsZS5zaG93VG91Y2hTcXVhcmVPdmVybGF5KSB7XG4gICAgICAgICAgICAgIHV0aWwudHJhbnNsYXRlQWJzKFxuICAgICAgICAgICAgICAgIHMuZG9tLmVsZW1lbnRzLmJvYXJkLnNxdWFyZU92ZXIsXG4gICAgICAgICAgICAgICAgdXRpbC5wb3NUb1RyYW5zbGF0ZUFicyhzLmRpbWVuc2lvbnMsIGJvdW5kcykoXG4gICAgICAgICAgICAgICAgICB1dGlsLmtleTJwb3MoaG92ZXIpLFxuICAgICAgICAgICAgICAgICAgdXRpbC5zZW50ZVBvdihzLm9yaWVudGF0aW9uKSxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIHV0aWwuc2V0RGlzcGxheShzLmRvbS5lbGVtZW50cy5ib2FyZC5zcXVhcmVPdmVyLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHV0aWwuc2V0RGlzcGxheShzLmRvbS5lbGVtZW50cy5ib2FyZC5zcXVhcmVPdmVyLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHByb2Nlc3NEcmFnKHMpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmUoczogU3RhdGUsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgLy8gc3VwcG9ydCBvbmUgZmluZ2VyIHRvdWNoIG9ubHlcbiAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQgJiYgKCFlLnRvdWNoZXMgfHwgZS50b3VjaGVzLmxlbmd0aCA8IDIpKSB7XG4gICAgY29uc3QgcG9zID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpO1xuICAgIGlmIChwb3MpIHMuZHJhZ2dhYmxlLmN1cnJlbnQucG9zID0gcG9zO1xuICB9IGVsc2UgaWYgKFxuICAgIChzLnNlbGVjdGVkIHx8IHMuc2VsZWN0ZWRQaWVjZSB8fCBzLmhpZ2hsaWdodC5ob3ZlcmVkKSAmJlxuICAgICFzLmRyYWdnYWJsZS5jdXJyZW50ICYmXG4gICAgKCFlLnRvdWNoZXMgfHwgZS50b3VjaGVzLmxlbmd0aCA8IDIpXG4gICkge1xuICAgIGNvbnN0IHBvcyA9IHV0aWwuZXZlbnRQb3NpdGlvbihlKTtcbiAgICBjb25zdCBib3VuZHMgPSBzLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gICAgY29uc3QgaG92ZXIgPVxuICAgICAgcG9zICYmIGJvdW5kcyAmJiB1dGlsLmdldEtleUF0RG9tUG9zKHBvcywgdXRpbC5zZW50ZVBvdihzLm9yaWVudGF0aW9uKSwgcy5kaW1lbnNpb25zLCBib3VuZHMpO1xuICAgIGlmIChob3ZlciAhPT0gcy5ob3ZlcmVkKSB1cGRhdGVIb3ZlcmVkU3F1YXJlcyhzLCBob3Zlcik7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuZChzOiBTdGF0ZSwgZTogc2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICBjb25zdCBjdXIgPSBzLmRyYWdnYWJsZS5jdXJyZW50O1xuICBpZiAoIWN1cikgcmV0dXJuO1xuICAvLyBjcmVhdGUgbm8gY29ycmVzcG9uZGluZyBtb3VzZSBldmVudFxuICBpZiAoZS50eXBlID09PSAndG91Y2hlbmQnICYmIGUuY2FuY2VsYWJsZSAhPT0gZmFsc2UpIGUucHJldmVudERlZmF1bHQoKTtcbiAgLy8gY29tcGFyaW5nIHdpdGggdGhlIG9yaWdpbiB0YXJnZXQgaXMgYW4gZWFzeSB3YXkgdG8gdGVzdCB0aGF0IHRoZSBlbmQgZXZlbnRcbiAgLy8gaGFzIHRoZSBzYW1lIHRvdWNoIG9yaWdpblxuICBpZiAoZS50eXBlID09PSAndG91Y2hlbmQnICYmIGN1ci5vcmlnaW5UYXJnZXQgIT09IGUudGFyZ2V0ICYmICFjdXIuZnJvbU91dHNpZGUpIHtcbiAgICBzLmRyYWdnYWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGlmIChzLmhvdmVyZWQgJiYgIXMuaGlnaGxpZ2h0LmhvdmVyZWQpIHVwZGF0ZUhvdmVyZWRTcXVhcmVzKHMsIHVuZGVmaW5lZCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGJvYXJkLnVuc2V0UHJlbW92ZShzKTtcbiAgYm9hcmQudW5zZXRQcmVkcm9wKHMpO1xuICAvLyB0b3VjaGVuZCBoYXMgbm8gcG9zaXRpb247IHNvIHVzZSB0aGUgbGFzdCB0b3VjaG1vdmUgcG9zaXRpb24gaW5zdGVhZFxuICBjb25zdCBldmVudFBvcyA9IHV0aWwuZXZlbnRQb3NpdGlvbihlKSB8fCBjdXIucG9zO1xuICBjb25zdCBib3VuZHMgPSBzLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gIGNvbnN0IGRlc3QgPVxuICAgIGJvdW5kcyAmJiB1dGlsLmdldEtleUF0RG9tUG9zKGV2ZW50UG9zLCB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pLCBzLmRpbWVuc2lvbnMsIGJvdW5kcyk7XG5cbiAgaWYgKGRlc3QgJiYgY3VyLnN0YXJ0ZWQgJiYgY3VyLmZyb21Cb2FyZD8ub3JpZyAhPT0gZGVzdCkge1xuICAgIGlmIChjdXIuZnJvbU91dHNpZGUgJiYgIWJvYXJkLnByb21vdGlvbkRpYWxvZ0Ryb3AocywgY3VyLnBpZWNlLCBkZXN0KSlcbiAgICAgIGJvYXJkLnVzZXJEcm9wKHMsIGN1ci5waWVjZSwgZGVzdCk7XG4gICAgZWxzZSBpZiAoY3VyLmZyb21Cb2FyZCAmJiAhYm9hcmQucHJvbW90aW9uRGlhbG9nTW92ZShzLCBjdXIuZnJvbUJvYXJkLm9yaWcsIGRlc3QpKVxuICAgICAgYm9hcmQudXNlck1vdmUocywgY3VyLmZyb21Cb2FyZC5vcmlnLCBkZXN0KTtcbiAgfSBlbHNlIGlmIChzLmRyYWdnYWJsZS5kZWxldGVPbkRyb3BPZmYgJiYgIWRlc3QpIHtcbiAgICBpZiAoY3VyLmZyb21Cb2FyZCkgcy5waWVjZXMuZGVsZXRlKGN1ci5mcm9tQm9hcmQub3JpZyk7XG4gICAgZWxzZSBpZiAoY3VyLmZyb21PdXRzaWRlICYmICFjdXIuc3BhcmUpIHJlbW92ZUZyb21IYW5kKHMsIGN1ci5waWVjZSk7XG5cbiAgICBpZiAocy5kcmFnZ2FibGUuYWRkVG9IYW5kT25Ecm9wT2ZmKSB7XG4gICAgICBjb25zdCBoYW5kQm91bmRzID0gcy5kb20uYm91bmRzLmhhbmRzLmJvdW5kcygpO1xuICAgICAgY29uc3QgaGFuZEJvdW5kc1RvcCA9IGhhbmRCb3VuZHMuZ2V0KCd0b3AnKTtcbiAgICAgIGNvbnN0IGhhbmRCb3VuZHNCb3R0b20gPSBoYW5kQm91bmRzLmdldCgnYm90dG9tJyk7XG4gICAgICBpZiAoaGFuZEJvdW5kc1RvcCAmJiB1dGlsLmlzSW5zaWRlUmVjdChoYW5kQm91bmRzVG9wLCBjdXIucG9zKSlcbiAgICAgICAgYWRkVG9IYW5kKHMsIHtcbiAgICAgICAgICBjb2xvcjogdXRpbC5vcHBvc2l0ZShzLm9yaWVudGF0aW9uKSxcbiAgICAgICAgICByb2xlOiBjdXIucGllY2Uucm9sZSxcbiAgICAgICAgfSk7XG4gICAgICBlbHNlIGlmIChoYW5kQm91bmRzQm90dG9tICYmIHV0aWwuaXNJbnNpZGVSZWN0KGhhbmRCb3VuZHNCb3R0b20sIGN1ci5wb3MpKVxuICAgICAgICBhZGRUb0hhbmQocywgeyBjb2xvcjogcy5vcmllbnRhdGlvbiwgcm9sZTogY3VyLnBpZWNlLnJvbGUgfSk7XG5cbiAgICAgIGJvYXJkLnVuc2VsZWN0KHMpO1xuICAgIH1cbiAgICB1dGlsLmNhbGxVc2VyRnVuY3Rpb24ocy5ldmVudHMuY2hhbmdlKTtcbiAgfVxuXG4gIGlmIChcbiAgICBjdXIuZnJvbUJvYXJkICYmXG4gICAgKGN1ci5mcm9tQm9hcmQub3JpZyA9PT0gY3VyLmZyb21Cb2FyZC5wcmV2aW91c2x5U2VsZWN0ZWQgfHwgY3VyLmZyb21Cb2FyZC5rZXlIYXNDaGFuZ2VkKSAmJlxuICAgIChjdXIuZnJvbUJvYXJkLm9yaWcgPT09IGRlc3QgfHwgIWRlc3QpXG4gICkge1xuICAgIHVuc2VsZWN0KHMsIGN1ciwgZGVzdCk7XG4gIH0gZWxzZSBpZiAoXG4gICAgKCFkZXN0ICYmIGN1ci5mcm9tT3V0c2lkZT8ubGVmdE9yaWdpbikgfHxcbiAgICAoY3VyLmZyb21PdXRzaWRlPy5vcmlnaW5Cb3VuZHMgJiZcbiAgICAgIHV0aWwuaXNJbnNpZGVSZWN0KGN1ci5mcm9tT3V0c2lkZS5vcmlnaW5Cb3VuZHMsIGN1ci5wb3MpICYmXG4gICAgICBjdXIuZnJvbU91dHNpZGUucHJldmlvdXNseVNlbGVjdGVkUGllY2UgJiZcbiAgICAgIHV0aWwuc2FtZVBpZWNlKGN1ci5mcm9tT3V0c2lkZS5wcmV2aW91c2x5U2VsZWN0ZWRQaWVjZSwgY3VyLnBpZWNlKSlcbiAgKSB7XG4gICAgdW5zZWxlY3QocywgY3VyLCBkZXN0KTtcbiAgfSBlbHNlIGlmICghcy5zZWxlY3RhYmxlLmVuYWJsZWQgJiYgIXMucHJvbW90aW9uLmN1cnJlbnQpIHtcbiAgICB1bnNlbGVjdChzLCBjdXIsIGRlc3QpO1xuICB9XG5cbiAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgaWYgKCFzLmhpZ2hsaWdodC5ob3ZlcmVkICYmICFzLnByb21vdGlvbi5jdXJyZW50KSBzLmhvdmVyZWQgPSB1bmRlZmluZWQ7XG4gIHMuZG9tLnJlZHJhdygpO1xufVxuXG5mdW5jdGlvbiB1bnNlbGVjdChzOiBTdGF0ZSwgY3VyOiBEcmFnQ3VycmVudCwgZGVzdD86IHNnLktleSk6IHZvaWQge1xuICBpZiAoY3VyLmZyb21Cb2FyZCAmJiBjdXIuZnJvbUJvYXJkLm9yaWcgPT09IGRlc3QpXG4gICAgdXRpbC5jYWxsVXNlckZ1bmN0aW9uKHMuZXZlbnRzLnVuc2VsZWN0LCBjdXIuZnJvbUJvYXJkLm9yaWcpO1xuICBlbHNlIGlmIChcbiAgICBjdXIuZnJvbU91dHNpZGU/Lm9yaWdpbkJvdW5kcyAmJlxuICAgIHV0aWwuaXNJbnNpZGVSZWN0KGN1ci5mcm9tT3V0c2lkZS5vcmlnaW5Cb3VuZHMsIGN1ci5wb3MpXG4gIClcbiAgICB1dGlsLmNhbGxVc2VyRnVuY3Rpb24ocy5ldmVudHMucGllY2VVbnNlbGVjdCwgY3VyLnBpZWNlKTtcbiAgYm9hcmQudW5zZWxlY3Qocyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWwoczogU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQpIHtcbiAgICBzLmRyYWdnYWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGlmICghcy5oaWdobGlnaHQuaG92ZXJlZCkgcy5ob3ZlcmVkID0gdW5kZWZpbmVkO1xuICAgIGJvYXJkLnVuc2VsZWN0KHMpO1xuICAgIHMuZG9tLnJlZHJhdygpO1xuICB9XG59XG5cbi8vIHN1cHBvcnQgb25lIGZpbmdlciB0b3VjaCBvbmx5IG9yIGxlZnQgY2xpY2tcbmV4cG9ydCBmdW5jdGlvbiB1bndhbnRlZEV2ZW50KGU6IHNnLk1vdWNoRXZlbnQpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICAhZS5pc1RydXN0ZWQgfHxcbiAgICAoZS5idXR0b24gIT09IHVuZGVmaW5lZCAmJiBlLmJ1dHRvbiAhPT0gMCkgfHxcbiAgICAoISFlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDEpXG4gICk7XG59XG5cbmZ1bmN0aW9uIHZhbGlkRGVzdFRvSG92ZXIoczogU3RhdGUsIGtleTogc2cuS2V5KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgKCEhcy5zZWxlY3RlZCAmJiAoYm9hcmQuY2FuTW92ZShzLCBzLnNlbGVjdGVkLCBrZXkpIHx8IGJvYXJkLmNhblByZW1vdmUocywgcy5zZWxlY3RlZCwga2V5KSkpIHx8XG4gICAgKCEhcy5zZWxlY3RlZFBpZWNlICYmXG4gICAgICAoYm9hcmQuY2FuRHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIGtleSkgfHwgYm9hcmQuY2FuUHJlZHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIGtleSkpKVxuICApO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVIb3ZlcmVkU3F1YXJlcyhzOiBTdGF0ZSwga2V5OiBzZy5LZXkgfCB1bmRlZmluZWQpOiB2b2lkIHtcbiAgY29uc3Qgc3FhdXJlRWxzID0gcy5kb20uZWxlbWVudHMuYm9hcmQ/LnNxdWFyZXMuY2hpbGRyZW47XG4gIGlmICghc3FhdXJlRWxzIHx8IHMucHJvbW90aW9uLmN1cnJlbnQpIHJldHVybjtcblxuICBjb25zdCBwcmV2SG92ZXIgPSBzLmhvdmVyZWQ7XG4gIGlmIChzLmhpZ2hsaWdodC5ob3ZlcmVkIHx8IChrZXkgJiYgdmFsaWREZXN0VG9Ib3ZlcihzLCBrZXkpKSkgcy5ob3ZlcmVkID0ga2V5O1xuICBlbHNlIHMuaG92ZXJlZCA9IHVuZGVmaW5lZDtcblxuICBjb25zdCBhc1NlbnRlID0gdXRpbC5zZW50ZVBvdihzLm9yaWVudGF0aW9uKTtcbiAgY29uc3QgY3VySW5kZXggPSBzLmhvdmVyZWQgJiYgdXRpbC5kb21TcXVhcmVJbmRleE9mS2V5KHMuaG92ZXJlZCwgYXNTZW50ZSwgcy5kaW1lbnNpb25zKTtcbiAgY29uc3QgY3VySG92ZXJFbCA9IGN1ckluZGV4ICE9PSB1bmRlZmluZWQgJiYgc3FhdXJlRWxzW2N1ckluZGV4XTtcbiAgaWYgKGN1ckhvdmVyRWwpIGN1ckhvdmVyRWwuY2xhc3NMaXN0LmFkZCgnaG92ZXInKTtcblxuICBjb25zdCBwcmV2SW5kZXggPSBwcmV2SG92ZXIgJiYgdXRpbC5kb21TcXVhcmVJbmRleE9mS2V5KHByZXZIb3ZlciwgYXNTZW50ZSwgcy5kaW1lbnNpb25zKTtcbiAgY29uc3QgcHJldkhvdmVyRWwgPSBwcmV2SW5kZXggIT09IHVuZGVmaW5lZCAmJiBzcWF1cmVFbHNbcHJldkluZGV4XTtcbiAgaWYgKHByZXZIb3ZlckVsKSBwcmV2SG92ZXJFbC5jbGFzc0xpc3QucmVtb3ZlKCdob3ZlcicpO1xufVxuIiwgImltcG9ydCB7IGFuaW0gfSBmcm9tICcuL2FuaW0uanMnO1xuaW1wb3J0IHsgY2FuY2VsUHJvbW90aW9uLCBzZWxlY3RTcXVhcmUsIHVzZXJEcm9wLCB1c2VyTW92ZSB9IGZyb20gJy4vYm9hcmQuanMnO1xuaW1wb3J0ICogYXMgZHJhZyBmcm9tICcuL2RyYWcuanMnO1xuaW1wb3J0ICogYXMgZHJhdyBmcm9tICcuL2RyYXcuanMnO1xuaW1wb3J0IHsgdXNlc0JvdW5kcyB9IGZyb20gJy4vc2hhcGVzLmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQge1xuICBjYWxsVXNlckZ1bmN0aW9uLFxuICBldmVudFBvc2l0aW9uLFxuICBnZXRIYW5kUGllY2VBdERvbVBvcyxcbiAgaXNNaWRkbGVCdXR0b24sXG4gIGlzUGllY2VOb2RlLFxuICBpc1JpZ2h0QnV0dG9uLFxuICBzYW1lUGllY2UsXG59IGZyb20gJy4vdXRpbC5qcyc7XG5cbnR5cGUgTW91Y2hCaW5kID0gKGU6IHNnLk1vdWNoRXZlbnQpID0+IHZvaWQ7XG50eXBlIFN0YXRlTW91Y2hCaW5kID0gKGQ6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KSA9PiB2b2lkO1xuXG5mdW5jdGlvbiBjbGVhckJvdW5kcyhzOiBTdGF0ZSk6IHZvaWQge1xuICBzLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzLmNsZWFyKCk7XG4gIHMuZG9tLmJvdW5kcy5oYW5kcy5ib3VuZHMuY2xlYXIoKTtcbiAgcy5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzLmNsZWFyKCk7XG59XG5cbmZ1bmN0aW9uIG9uUmVzaXplKHM6IFN0YXRlKTogKCkgPT4gdm9pZCB7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgY2xlYXJCb3VuZHMocyk7XG4gICAgaWYgKHVzZXNCb3VuZHMocy5kcmF3YWJsZS5zaGFwZXMuY29uY2F0KHMuZHJhd2FibGUuYXV0b1NoYXBlcykpKSBzLmRvbS5yZWRyYXdTaGFwZXMoKTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRCb2FyZChzOiBTdGF0ZSwgYm9hcmRFbHM6IHNnLkJvYXJkRWxlbWVudHMpOiB2b2lkIHtcbiAgaWYgKCdSZXNpemVPYnNlcnZlcicgaW4gd2luZG93KSBuZXcgUmVzaXplT2JzZXJ2ZXIob25SZXNpemUocykpLm9ic2VydmUoYm9hcmRFbHMuYm9hcmQpO1xuXG4gIGlmIChzLnZpZXdPbmx5KSByZXR1cm47XG5cbiAgY29uc3QgcGllY2VzRWwgPSBib2FyZEVscy5waWVjZXM7XG4gIGNvbnN0IHByb21vdGlvbkVsID0gYm9hcmRFbHMucHJvbW90aW9uO1xuXG4gIC8vIENhbm5vdCBiZSBwYXNzaXZlLCBiZWNhdXNlIHdlIHByZXZlbnQgdG91Y2ggc2Nyb2xsaW5nIGFuZCBkcmFnZ2luZyBvZiBzZWxlY3RlZCBlbGVtZW50cy5cbiAgY29uc3Qgb25TdGFydCA9IHN0YXJ0RHJhZ09yRHJhdyhzKTtcbiAgcGllY2VzRWwuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIG9uU3RhcnQgYXMgRXZlbnRMaXN0ZW5lciwge1xuICAgIHBhc3NpdmU6IGZhbHNlLFxuICB9KTtcbiAgcGllY2VzRWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25TdGFydCBhcyBFdmVudExpc3RlbmVyLCB7XG4gICAgcGFzc2l2ZTogZmFsc2UsXG4gIH0pO1xuICBpZiAocy5kaXNhYmxlQ29udGV4dE1lbnUgfHwgcy5kcmF3YWJsZS5lbmFibGVkKVxuICAgIHBpZWNlc0VsLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgKGUpID0+IGUucHJldmVudERlZmF1bHQoKSk7XG5cbiAgaWYgKHByb21vdGlvbkVsKSB7XG4gICAgY29uc3QgcGllY2VTZWxlY3Rpb24gPSAoZTogc2cuTW91Y2hFdmVudCkgPT4gcHJvbW90ZShzLCBlKTtcbiAgICBwcm9tb3Rpb25FbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHBpZWNlU2VsZWN0aW9uIGFzIEV2ZW50TGlzdGVuZXIpO1xuICAgIGlmIChzLmRpc2FibGVDb250ZXh0TWVudSlcbiAgICAgIHByb21vdGlvbkVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgKGUpID0+IGUucHJldmVudERlZmF1bHQoKSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRIYW5kKHM6IFN0YXRlLCBoYW5kRWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gIGlmICgnUmVzaXplT2JzZXJ2ZXInIGluIHdpbmRvdykgbmV3IFJlc2l6ZU9ic2VydmVyKG9uUmVzaXplKHMpKS5vYnNlcnZlKGhhbmRFbCk7XG5cbiAgaWYgKHMudmlld09ubHkpIHJldHVybjtcblxuICBjb25zdCBvblN0YXJ0ID0gc3RhcnREcmFnRnJvbUhhbmQocyk7XG4gIGhhbmRFbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvblN0YXJ0IGFzIEV2ZW50TGlzdGVuZXIsIHsgcGFzc2l2ZTogZmFsc2UgfSk7XG4gIGhhbmRFbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25TdGFydCBhcyBFdmVudExpc3RlbmVyLCB7XG4gICAgcGFzc2l2ZTogZmFsc2UsXG4gIH0pO1xuICBoYW5kRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgaWYgKHMucHJvbW90aW9uLmN1cnJlbnQpIHtcbiAgICAgIGNhbmNlbFByb21vdGlvbihzKTtcbiAgICAgIHMuZG9tLnJlZHJhdygpO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHMuZGlzYWJsZUNvbnRleHRNZW51IHx8IHMuZHJhd2FibGUuZW5hYmxlZClcbiAgICBoYW5kRWwuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcbn1cblxuLy8gcmV0dXJucyB0aGUgdW5iaW5kIGZ1bmN0aW9uXG5leHBvcnQgZnVuY3Rpb24gYmluZERvY3VtZW50KHM6IFN0YXRlKTogc2cuVW5iaW5kIHtcbiAgY29uc3QgdW5iaW5kczogc2cuVW5iaW5kW10gPSBbXTtcblxuICAvLyBPbGQgdmVyc2lvbnMgb2YgRWRnZSBhbmQgU2FmYXJpIGRvIG5vdCBzdXBwb3J0IFJlc2l6ZU9ic2VydmVyLiBTZW5kXG4gIC8vIHNob2dpZ3JvdW5kLnJlc2l6ZSBpZiBhIHVzZXIgYWN0aW9uIGhhcyBjaGFuZ2VkIHRoZSBib3VuZHMgb2YgdGhlIGJvYXJkLlxuICBpZiAoISgnUmVzaXplT2JzZXJ2ZXInIGluIHdpbmRvdykpIHtcbiAgICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZShkb2N1bWVudC5ib2R5LCAnc2hvZ2lncm91bmQucmVzaXplJywgb25SZXNpemUocykpKTtcbiAgfVxuXG4gIGlmICghcy52aWV3T25seSkge1xuICAgIGNvbnN0IG9ubW92ZSA9IGRyYWdPckRyYXcocywgZHJhZy5tb3ZlLCBkcmF3Lm1vdmUpO1xuICAgIGNvbnN0IG9uZW5kID0gZHJhZ09yRHJhdyhzLCBkcmFnLmVuZCwgZHJhdy5lbmQpO1xuXG4gICAgZm9yIChjb25zdCBldiBvZiBbJ3RvdWNobW92ZScsICdtb3VzZW1vdmUnXSlcbiAgICAgIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKGRvY3VtZW50LCBldiwgb25tb3ZlIGFzIEV2ZW50TGlzdGVuZXIpKTtcbiAgICBmb3IgKGNvbnN0IGV2IG9mIFsndG91Y2hlbmQnLCAnbW91c2V1cCddKVxuICAgICAgdW5iaW5kcy5wdXNoKHVuYmluZGFibGUoZG9jdW1lbnQsIGV2LCBvbmVuZCBhcyBFdmVudExpc3RlbmVyKSk7XG5cbiAgICB1bmJpbmRzLnB1c2goXG4gICAgICB1bmJpbmRhYmxlKGRvY3VtZW50LCAnc2Nyb2xsJywgKCkgPT4gY2xlYXJCb3VuZHMocyksIHsgY2FwdHVyZTogdHJ1ZSwgcGFzc2l2ZTogdHJ1ZSB9KSxcbiAgICApO1xuICAgIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKHdpbmRvdywgJ3Jlc2l6ZScsICgpID0+IGNsZWFyQm91bmRzKHMpLCB7IHBhc3NpdmU6IHRydWUgfSkpO1xuICB9XG5cbiAgcmV0dXJuICgpID0+XG4gICAgdW5iaW5kcy5mb3JFYWNoKChmKSA9PiB7XG4gICAgICBmKCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHVuYmluZGFibGUoXG4gIGVsOiBFdmVudFRhcmdldCxcbiAgZXZlbnROYW1lOiBzdHJpbmcsXG4gIGNhbGxiYWNrOiBFdmVudExpc3RlbmVyLFxuICBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMsXG4pOiBzZy5VbmJpbmQge1xuICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2ssIG9wdGlvbnMpO1xuICByZXR1cm4gKCkgPT4gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrLCBvcHRpb25zKTtcbn1cblxuZnVuY3Rpb24gc3RhcnREcmFnT3JEcmF3KHM6IFN0YXRlKTogTW91Y2hCaW5kIHtcbiAgcmV0dXJuIChlKSA9PiB7XG4gICAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQpIGRyYWcuY2FuY2VsKHMpO1xuICAgIGVsc2UgaWYgKHMuZHJhd2FibGUuY3VycmVudCkgZHJhdy5jYW5jZWwocyk7XG4gICAgZWxzZSBpZiAoZS5zaGlmdEtleSB8fCBpc1JpZ2h0QnV0dG9uKGUpIHx8IHMuZHJhd2FibGUuZm9yY2VkKSB7XG4gICAgICBpZiAocy5kcmF3YWJsZS5lbmFibGVkKSBkcmF3LnN0YXJ0KHMsIGUpO1xuICAgIH0gZWxzZSBpZiAoIXMudmlld09ubHkgJiYgIWRyYWcudW53YW50ZWRFdmVudChlKSkgZHJhZy5zdGFydChzLCBlKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZHJhZ09yRHJhdyhzOiBTdGF0ZSwgd2l0aERyYWc6IFN0YXRlTW91Y2hCaW5kLCB3aXRoRHJhdzogU3RhdGVNb3VjaEJpbmQpOiBNb3VjaEJpbmQge1xuICByZXR1cm4gKGUpID0+IHtcbiAgICBpZiAocy5kcmF3YWJsZS5jdXJyZW50KSB7XG4gICAgICBpZiAocy5kcmF3YWJsZS5lbmFibGVkKSB3aXRoRHJhdyhzLCBlKTtcbiAgICB9IGVsc2UgaWYgKCFzLnZpZXdPbmx5KSB3aXRoRHJhZyhzLCBlKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3RhcnREcmFnRnJvbUhhbmQoczogU3RhdGUpOiBNb3VjaEJpbmQge1xuICByZXR1cm4gKGUpID0+IHtcbiAgICBpZiAocy5wcm9tb3Rpb24uY3VycmVudCkgcmV0dXJuO1xuXG4gICAgY29uc3QgcG9zID0gZXZlbnRQb3NpdGlvbihlKTtcbiAgICBjb25zdCBwaWVjZSA9IHBvcyAmJiBnZXRIYW5kUGllY2VBdERvbVBvcyhwb3MsIHMuaGFuZHMucm9sZXMsIHMuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcygpKTtcblxuICAgIGlmIChwaWVjZSkge1xuICAgICAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQpIGRyYWcuY2FuY2VsKHMpO1xuICAgICAgZWxzZSBpZiAocy5kcmF3YWJsZS5jdXJyZW50KSBkcmF3LmNhbmNlbChzKTtcbiAgICAgIGVsc2UgaWYgKGlzTWlkZGxlQnV0dG9uKGUpKSB7XG4gICAgICAgIGlmIChzLmRyYXdhYmxlLmVuYWJsZWQpIHtcbiAgICAgICAgICBpZiAoZS5jYW5jZWxhYmxlICE9PSBmYWxzZSkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIGRyYXcuc2V0RHJhd1BpZWNlKHMsIHBpZWNlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChlLnNoaWZ0S2V5IHx8IGlzUmlnaHRCdXR0b24oZSkgfHwgcy5kcmF3YWJsZS5mb3JjZWQpIHtcbiAgICAgICAgaWYgKHMuZHJhd2FibGUuZW5hYmxlZCkgZHJhdy5zdGFydEZyb21IYW5kKHMsIHBpZWNlLCBlKTtcbiAgICAgIH0gZWxzZSBpZiAoIXMudmlld09ubHkgJiYgIWRyYWcudW53YW50ZWRFdmVudChlKSkge1xuICAgICAgICBpZiAoZS5jYW5jZWxhYmxlICE9PSBmYWxzZSkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBkcmFnLmRyYWdOZXdQaWVjZShzLCBwaWVjZSwgZSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBwcm9tb3RlKHM6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICBjb25zdCBjdXIgPSBzLnByb21vdGlvbi5jdXJyZW50O1xuICBpZiAodGFyZ2V0ICYmIGlzUGllY2VOb2RlKHRhcmdldCkgJiYgY3VyKSB7XG4gICAgY29uc3QgcGllY2UgPSB7IGNvbG9yOiB0YXJnZXQuc2dDb2xvciwgcm9sZTogdGFyZ2V0LnNnUm9sZSB9O1xuICAgIGNvbnN0IHByb20gPSAhc2FtZVBpZWNlKGN1ci5waWVjZSwgcGllY2UpO1xuICAgIGlmIChjdXIuZHJhZ2dlZCB8fCAocy50dXJuQ29sb3IgIT09IHMuYWN0aXZlQ29sb3IgJiYgcy5hY3RpdmVDb2xvciAhPT0gJ2JvdGgnKSkge1xuICAgICAgaWYgKHMuc2VsZWN0ZWQpIHVzZXJNb3ZlKHMsIHMuc2VsZWN0ZWQsIGN1ci5rZXksIHByb20pO1xuICAgICAgZWxzZSBpZiAocy5zZWxlY3RlZFBpZWNlKSB1c2VyRHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIGN1ci5rZXksIHByb20pO1xuICAgIH0gZWxzZSBhbmltKChzKSA9PiBzZWxlY3RTcXVhcmUocywgY3VyLmtleSwgcHJvbSksIHMpO1xuXG4gICAgY2FsbFVzZXJGdW5jdGlvbihzLnByb21vdGlvbi5ldmVudHMuYWZ0ZXIsIHBpZWNlKTtcbiAgfSBlbHNlIGFuaW0oKHMpID0+IGNhbmNlbFByb21vdGlvbihzKSwgcyk7XG4gIHMucHJvbW90aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG5cbiAgcy5kb20ucmVkcmF3KCk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBBbmltQ3VycmVudCwgQW5pbUZhZGluZ3MsIEFuaW1Qcm9tb3Rpb25zLCBBbmltVmVjdG9yLCBBbmltVmVjdG9ycyB9IGZyb20gJy4vYW5pbS5qcyc7XG5pbXBvcnQgdHlwZSB7IERyYWdDdXJyZW50IH0gZnJvbSAnLi9kcmFnLmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQge1xuICBjcmVhdGVFbCxcbiAgaXNQaWVjZU5vZGUsXG4gIGlzU3F1YXJlTm9kZSxcbiAga2V5MnBvcyxcbiAgcGllY2VOYW1lT2YsXG4gIHBvc1RvVHJhbnNsYXRlUmVsLFxuICBzZW50ZVBvdixcbiAgc2V0RGlzcGxheSxcbiAgdHJhbnNsYXRlUmVsLFxufSBmcm9tICcuL3V0aWwuanMnO1xuXG50eXBlIFNxdWFyZUNsYXNzZXMgPSBNYXA8c2cuS2V5LCBzdHJpbmc+O1xuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyKHM6IFN0YXRlLCBib2FyZEVsczogc2cuQm9hcmRFbGVtZW50cyk6IHZvaWQge1xuICBjb25zdCBhc1NlbnRlOiBib29sZWFuID0gc2VudGVQb3Yocy5vcmllbnRhdGlvbik7XG4gIGNvbnN0IHNjYWxlRG93biA9IHMuc2NhbGVEb3duUGllY2VzID8gMC41IDogMTtcbiAgY29uc3QgcG9zVG9UcmFuc2xhdGUgPSBwb3NUb1RyYW5zbGF0ZVJlbChzLmRpbWVuc2lvbnMpO1xuICBjb25zdCBzcXVhcmVzRWw6IEhUTUxFbGVtZW50ID0gYm9hcmRFbHMuc3F1YXJlcztcbiAgY29uc3QgcGllY2VzRWw6IEhUTUxFbGVtZW50ID0gYm9hcmRFbHMucGllY2VzO1xuICBjb25zdCBkcmFnZ2VkRWw6IHNnLlBpZWNlTm9kZSB8IHVuZGVmaW5lZCA9IGJvYXJkRWxzLmRyYWdnZWQ7XG4gIGNvbnN0IHNxdWFyZU92ZXJFbDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQgPSBib2FyZEVscy5zcXVhcmVPdmVyO1xuICBjb25zdCBwcm9tb3Rpb25FbDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQgPSBib2FyZEVscy5wcm9tb3Rpb247XG4gIGNvbnN0IHBpZWNlczogc2cuUGllY2VzID0gcy5waWVjZXM7XG4gIGNvbnN0IGN1ckFuaW06IEFuaW1DdXJyZW50IHwgdW5kZWZpbmVkID0gcy5hbmltYXRpb24uY3VycmVudDtcbiAgY29uc3QgYW5pbXM6IEFuaW1WZWN0b3JzID0gY3VyQW5pbSA/IGN1ckFuaW0ucGxhbi5hbmltcyA6IG5ldyBNYXAoKTtcbiAgY29uc3QgZmFkaW5nczogQW5pbUZhZGluZ3MgPSBjdXJBbmltID8gY3VyQW5pbS5wbGFuLmZhZGluZ3MgOiBuZXcgTWFwKCk7XG4gIGNvbnN0IHByb21vdGlvbnM6IEFuaW1Qcm9tb3Rpb25zID0gY3VyQW5pbSA/IGN1ckFuaW0ucGxhbi5wcm9tb3Rpb25zIDogbmV3IE1hcCgpO1xuICBjb25zdCBjdXJEcmFnOiBEcmFnQ3VycmVudCB8IHVuZGVmaW5lZCA9IHMuZHJhZ2dhYmxlLmN1cnJlbnQ7XG4gIGNvbnN0IGN1clByb21LZXk6IHNnLktleSB8IHVuZGVmaW5lZCA9IHMucHJvbW90aW9uLmN1cnJlbnQ/LmRyYWdnZWQgPyBzLnNlbGVjdGVkIDogdW5kZWZpbmVkO1xuICBjb25zdCBzcXVhcmVzOiBTcXVhcmVDbGFzc2VzID0gY29tcHV0ZVNxdWFyZUNsYXNzZXMocyk7XG4gIGNvbnN0IHNhbWVQaWVjZXMgPSBuZXcgU2V0PHNnLktleT4oKTtcbiAgY29uc3QgbW92ZWRQaWVjZXMgPSBuZXcgTWFwPHNnLlBpZWNlTmFtZSwgc2cuUGllY2VOb2RlW10+KCk7XG5cbiAgLy8gaWYgcGllY2Ugbm90IGJlaW5nIGRyYWdnZWQgYW55bW9yZSwgaGlkZSBpdFxuICBpZiAoIWN1ckRyYWcgJiYgZHJhZ2dlZEVsPy5zZ0RyYWdnaW5nKSB7XG4gICAgZHJhZ2dlZEVsLnNnRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICBzZXREaXNwbGF5KGRyYWdnZWRFbCwgZmFsc2UpO1xuICAgIGlmIChzcXVhcmVPdmVyRWwpIHNldERpc3BsYXkoc3F1YXJlT3ZlckVsLCBmYWxzZSk7XG4gIH1cblxuICBsZXQgazogc2cuS2V5O1xuICBsZXQgZWw6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICBsZXQgcGllY2VBdEtleTogc2cuUGllY2UgfCB1bmRlZmluZWQ7XG4gIGxldCBlbFBpZWNlTmFtZTogc2cuUGllY2VOYW1lO1xuICBsZXQgYW5pbTogQW5pbVZlY3RvciB8IHVuZGVmaW5lZDtcbiAgbGV0IGZhZGluZzogc2cuUGllY2UgfCB1bmRlZmluZWQ7XG4gIGxldCBwcm9tOiBzZy5QaWVjZSB8IHVuZGVmaW5lZDtcbiAgbGV0IHBNdmRzZXQ6IHNnLlBpZWNlTm9kZVtdIHwgdW5kZWZpbmVkO1xuICBsZXQgcE12ZDogc2cuUGllY2VOb2RlIHwgdW5kZWZpbmVkO1xuXG4gIC8vIHdhbGsgb3ZlciBhbGwgYm9hcmQgZG9tIGVsZW1lbnRzLCBhcHBseSBhbmltYXRpb25zIGFuZCBmbGFnIG1vdmVkIHBpZWNlc1xuICBlbCA9IHBpZWNlc0VsLmZpcnN0RWxlbWVudENoaWxkIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICB3aGlsZSAoZWwpIHtcbiAgICBpZiAoaXNQaWVjZU5vZGUoZWwpKSB7XG4gICAgICBrID0gZWwuc2dLZXk7XG4gICAgICBwaWVjZUF0S2V5ID0gcGllY2VzLmdldChrKTtcbiAgICAgIGFuaW0gPSBhbmltcy5nZXQoayk7XG4gICAgICBmYWRpbmcgPSBmYWRpbmdzLmdldChrKTtcbiAgICAgIHByb20gPSBwcm9tb3Rpb25zLmdldChrKTtcbiAgICAgIGVsUGllY2VOYW1lID0gcGllY2VOYW1lT2YoeyBjb2xvcjogZWwuc2dDb2xvciwgcm9sZTogZWwuc2dSb2xlIH0pO1xuXG4gICAgICAvLyBpZiBwaWVjZSBkcmFnZ2VkIGFkZCBvciByZW1vdmUgZ2hvc3QgY2xhc3Mgb3IgaWYgcHJvbW90aW9uIGRpYWxvZyBpcyBhY3RpdmUgZm9yIHRoZSBwaWVjZSBhZGQgcHJvbSBjbGFzc1xuICAgICAgaWYgKFxuICAgICAgICAoKGN1ckRyYWc/LnN0YXJ0ZWQgJiYgY3VyRHJhZy5mcm9tQm9hcmQ/Lm9yaWcgPT09IGspIHx8IChjdXJQcm9tS2V5ICYmIGN1clByb21LZXkgPT09IGspKSAmJlxuICAgICAgICAhZWwuc2dHaG9zdFxuICAgICAgKSB7XG4gICAgICAgIGVsLnNnR2hvc3QgPSB0cnVlO1xuICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnaG9zdCcpO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgZWwuc2dHaG9zdCAmJlxuICAgICAgICAoIWN1ckRyYWcgfHwgY3VyRHJhZy5mcm9tQm9hcmQ/Lm9yaWcgIT09IGspICYmXG4gICAgICAgICghY3VyUHJvbUtleSB8fCBjdXJQcm9tS2V5ICE9PSBrKVxuICAgICAgKSB7XG4gICAgICAgIGVsLnNnR2hvc3QgPSBmYWxzZTtcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2hvc3QnKTtcbiAgICAgIH1cbiAgICAgIC8vIHJlbW92ZSBmYWRpbmcgY2xhc3MgaWYgaXQgc3RpbGwgcmVtYWluc1xuICAgICAgaWYgKCFmYWRpbmcgJiYgZWwuc2dGYWRpbmcpIHtcbiAgICAgICAgZWwuc2dGYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZmFkaW5nJyk7XG4gICAgICB9XG4gICAgICAvLyB0aGVyZSBpcyBub3cgYSBwaWVjZSBhdCB0aGlzIGRvbSBrZXlcbiAgICAgIGlmIChwaWVjZUF0S2V5KSB7XG4gICAgICAgIC8vIGNvbnRpbnVlIGFuaW1hdGlvbiBpZiBhbHJlYWR5IGFuaW1hdGluZyBhbmQgc2FtZSBwaWVjZSBvciBwcm9tb3RpbmcgcGllY2VcbiAgICAgICAgLy8gKG90aGVyd2lzZSBpdCBjb3VsZCBhbmltYXRlIGEgY2FwdHVyZWQgcGllY2UpXG4gICAgICAgIGlmIChcbiAgICAgICAgICBhbmltICYmXG4gICAgICAgICAgZWwuc2dBbmltYXRpbmcgJiZcbiAgICAgICAgICAoZWxQaWVjZU5hbWUgPT09IHBpZWNlTmFtZU9mKHBpZWNlQXRLZXkpIHx8IChwcm9tICYmIGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihwcm9tKSkpXG4gICAgICAgICkge1xuICAgICAgICAgIGNvbnN0IHBvcyA9IGtleTJwb3Moayk7XG4gICAgICAgICAgcG9zWzBdICs9IGFuaW1bMl07XG4gICAgICAgICAgcG9zWzFdICs9IGFuaW1bM107XG4gICAgICAgICAgdHJhbnNsYXRlUmVsKGVsLCBwb3NUb1RyYW5zbGF0ZShwb3MsIGFzU2VudGUpLCBzY2FsZURvd24pO1xuICAgICAgICB9IGVsc2UgaWYgKGVsLnNnQW5pbWF0aW5nKSB7XG4gICAgICAgICAgZWwuc2dBbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdhbmltJyk7XG4gICAgICAgICAgdHJhbnNsYXRlUmVsKGVsLCBwb3NUb1RyYW5zbGF0ZShrZXkycG9zKGspLCBhc1NlbnRlKSwgc2NhbGVEb3duKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzYW1lIHBpZWNlOiBmbGFnIGFzIHNhbWVcbiAgICAgICAgaWYgKGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihwaWVjZUF0S2V5KSAmJiAoIWZhZGluZyB8fCAhZWwuc2dGYWRpbmcpKSB7XG4gICAgICAgICAgc2FtZVBpZWNlcy5hZGQoayk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZGlmZmVyZW50IHBpZWNlOiBmbGFnIGFzIG1vdmVkIHVubGVzcyBpdCBpcyBhIGZhZGluZyBwaWVjZSBvciBhbiBhbmltYXRlZCBwcm9tb3RpbmcgcGllY2VcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaWYgKGZhZGluZyAmJiBlbFBpZWNlTmFtZSA9PT0gcGllY2VOYW1lT2YoZmFkaW5nKSkge1xuICAgICAgICAgICAgZWwuc2dGYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZmFkaW5nJyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChwcm9tICYmIGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihwcm9tKSkge1xuICAgICAgICAgICAgc2FtZVBpZWNlcy5hZGQoayk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFwcGVuZFZhbHVlKG1vdmVkUGllY2VzLCBlbFBpZWNlTmFtZSwgZWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gbm8gcGllY2U6IGZsYWcgYXMgbW92ZWRcbiAgICAgIGVsc2Uge1xuICAgICAgICBhcHBlbmRWYWx1ZShtb3ZlZFBpZWNlcywgZWxQaWVjZU5hbWUsIGVsKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWwgPSBlbC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIH1cblxuICAvLyB3YWxrIG92ZXIgYWxsIHNxdWFyZXMgYW5kIGFwcGx5IGNsYXNzZXNcbiAgbGV0IHNxRWwgPSBzcXVhcmVzRWwuZmlyc3RFbGVtZW50Q2hpbGQgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIHdoaWxlIChzcUVsICYmIGlzU3F1YXJlTm9kZShzcUVsKSkge1xuICAgIHNxRWwuY2xhc3NOYW1lID0gc3F1YXJlcy5nZXQoc3FFbC5zZ0tleSkgfHwgJyc7XG4gICAgc3FFbCA9IHNxRWwubmV4dEVsZW1lbnRTaWJsaW5nIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICB9XG5cbiAgLy8gd2FsayBvdmVyIGFsbCBwaWVjZXMgaW4gY3VycmVudCBzZXQsIGFwcGx5IGRvbSBjaGFuZ2VzIHRvIG1vdmVkIHBpZWNlc1xuICAvLyBvciBhcHBlbmQgbmV3IHBpZWNlc1xuICBmb3IgKGNvbnN0IFtrLCBwXSBvZiBwaWVjZXMpIHtcbiAgICBjb25zdCBwaWVjZSA9IHByb21vdGlvbnMuZ2V0KGspIHx8IHA7XG4gICAgYW5pbSA9IGFuaW1zLmdldChrKTtcbiAgICBpZiAoIXNhbWVQaWVjZXMuaGFzKGspKSB7XG4gICAgICBwTXZkc2V0ID0gbW92ZWRQaWVjZXMuZ2V0KHBpZWNlTmFtZU9mKHBpZWNlKSk7XG4gICAgICBwTXZkID0gcE12ZHNldD8ucG9wKCk7XG4gICAgICAvLyBhIHNhbWUgcGllY2Ugd2FzIG1vdmVkXG4gICAgICBpZiAocE12ZCkge1xuICAgICAgICAvLyBhcHBseSBkb20gY2hhbmdlc1xuICAgICAgICBwTXZkLnNnS2V5ID0gaztcbiAgICAgICAgaWYgKHBNdmQuc2dGYWRpbmcpIHtcbiAgICAgICAgICBwTXZkLnNnRmFkaW5nID0gZmFsc2U7XG4gICAgICAgICAgcE12ZC5jbGFzc0xpc3QucmVtb3ZlKCdmYWRpbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwb3MgPSBrZXkycG9zKGspO1xuICAgICAgICBpZiAoYW5pbSkge1xuICAgICAgICAgIHBNdmQuc2dBbmltYXRpbmcgPSB0cnVlO1xuICAgICAgICAgIHBNdmQuY2xhc3NMaXN0LmFkZCgnYW5pbScpO1xuICAgICAgICAgIHBvc1swXSArPSBhbmltWzJdO1xuICAgICAgICAgIHBvc1sxXSArPSBhbmltWzNdO1xuICAgICAgICB9XG4gICAgICAgIHRyYW5zbGF0ZVJlbChwTXZkLCBwb3NUb1RyYW5zbGF0ZShwb3MsIGFzU2VudGUpLCBzY2FsZURvd24pO1xuICAgICAgfVxuICAgICAgLy8gbm8gcGllY2UgaW4gbW92ZWQgb2JqOiBpbnNlcnQgdGhlIG5ldyBwaWVjZVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IHBpZWNlTm9kZSA9IGNyZWF0ZUVsKCdwaWVjZScsIHBpZWNlTmFtZU9mKHApKSBhcyBzZy5QaWVjZU5vZGU7XG4gICAgICAgIGNvbnN0IHBvcyA9IGtleTJwb3Moayk7XG5cbiAgICAgICAgcGllY2VOb2RlLnNnQ29sb3IgPSBwLmNvbG9yO1xuICAgICAgICBwaWVjZU5vZGUuc2dSb2xlID0gcC5yb2xlO1xuICAgICAgICBwaWVjZU5vZGUuc2dLZXkgPSBrO1xuICAgICAgICBpZiAoYW5pbSkge1xuICAgICAgICAgIHBpZWNlTm9kZS5zZ0FuaW1hdGluZyA9IHRydWU7XG4gICAgICAgICAgcG9zWzBdICs9IGFuaW1bMl07XG4gICAgICAgICAgcG9zWzFdICs9IGFuaW1bM107XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNsYXRlUmVsKHBpZWNlTm9kZSwgcG9zVG9UcmFuc2xhdGUocG9zLCBhc1NlbnRlKSwgc2NhbGVEb3duKTtcblxuICAgICAgICBwaWVjZXNFbC5hcHBlbmRDaGlsZChwaWVjZU5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvLyByZW1vdmUgYW55IGVsZW1lbnQgdGhhdCByZW1haW5zIGluIHRoZSBtb3ZlZCBzZXRzXG4gIGZvciAoY29uc3Qgbm9kZXMgb2YgbW92ZWRQaWVjZXMudmFsdWVzKCkpIHtcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICAgIHBpZWNlc0VsLnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChwcm9tb3Rpb25FbCkgcmVuZGVyUHJvbW90aW9uKHMsIHByb21vdGlvbkVsKTtcbn1cblxuZnVuY3Rpb24gYXBwZW5kVmFsdWU8SywgVj4obWFwOiBNYXA8SywgVltdPiwga2V5OiBLLCB2YWx1ZTogVik6IHZvaWQge1xuICBjb25zdCBhcnIgPSBtYXAuZ2V0KGtleSk7XG4gIGlmIChhcnIpIGFyci5wdXNoKHZhbHVlKTtcbiAgZWxzZSBtYXAuc2V0KGtleSwgW3ZhbHVlXSk7XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVTcXVhcmVDbGFzc2VzKHM6IFN0YXRlKTogU3F1YXJlQ2xhc3NlcyB7XG4gIGNvbnN0IHNxdWFyZXM6IFNxdWFyZUNsYXNzZXMgPSBuZXcgTWFwKCk7XG4gIGlmIChzLmxhc3REZXN0cyAmJiBzLmhpZ2hsaWdodC5sYXN0RGVzdHMpXG4gICAgZm9yIChjb25zdCBrIG9mIHMubGFzdERlc3RzKSBhZGRTcXVhcmUoc3F1YXJlcywgaywgJ2xhc3QtZGVzdCcpO1xuICBpZiAocy5jaGVja3MgJiYgcy5oaWdobGlnaHQuY2hlY2spXG4gICAgZm9yIChjb25zdCBjaGVjayBvZiBzLmNoZWNrcykgYWRkU3F1YXJlKHNxdWFyZXMsIGNoZWNrLCAnY2hlY2snKTtcbiAgaWYgKHMuaG92ZXJlZCkgYWRkU3F1YXJlKHNxdWFyZXMsIHMuaG92ZXJlZCwgJ2hvdmVyJyk7XG4gIGlmIChzLnNlbGVjdGVkKSB7XG4gICAgaWYgKHMuYWN0aXZlQ29sb3IgPT09ICdib3RoJyB8fCBzLmFjdGl2ZUNvbG9yID09PSBzLnR1cm5Db2xvcilcbiAgICAgIGFkZFNxdWFyZShzcXVhcmVzLCBzLnNlbGVjdGVkLCAnc2VsZWN0ZWQnKTtcbiAgICBlbHNlIGFkZFNxdWFyZShzcXVhcmVzLCBzLnNlbGVjdGVkLCAncHJlc2VsZWN0ZWQnKTtcbiAgICBpZiAocy5tb3ZhYmxlLnNob3dEZXN0cykge1xuICAgICAgY29uc3QgZGVzdHMgPSBzLm1vdmFibGUuZGVzdHM/LmdldChzLnNlbGVjdGVkKTtcbiAgICAgIGlmIChkZXN0cylcbiAgICAgICAgZm9yIChjb25zdCBrIG9mIGRlc3RzKSB7XG4gICAgICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIGssIGBkZXN0JHtzLnBpZWNlcy5oYXMoaykgPyAnIG9jJyA6ICcnfWApO1xuICAgICAgICB9XG4gICAgICBjb25zdCBwRGVzdHMgPSBzLnByZW1vdmFibGUuZGVzdHM7XG4gICAgICBpZiAocERlc3RzKVxuICAgICAgICBmb3IgKGNvbnN0IGsgb2YgcERlc3RzKSB7XG4gICAgICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIGssIGBwcmUtZGVzdCR7cy5waWVjZXMuaGFzKGspID8gJyBvYycgOiAnJ31gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIGlmIChzLnNlbGVjdGVkUGllY2UpIHtcbiAgICBpZiAocy5kcm9wcGFibGUuc2hvd0Rlc3RzKSB7XG4gICAgICBjb25zdCBkZXN0cyA9IHMuZHJvcHBhYmxlLmRlc3RzPy5nZXQocGllY2VOYW1lT2Yocy5zZWxlY3RlZFBpZWNlKSk7XG4gICAgICBpZiAoZGVzdHMpXG4gICAgICAgIGZvciAoY29uc3QgayBvZiBkZXN0cykge1xuICAgICAgICAgIGFkZFNxdWFyZShzcXVhcmVzLCBrLCAnZGVzdCcpO1xuICAgICAgICB9XG4gICAgICBjb25zdCBwRGVzdHMgPSBzLnByZWRyb3BwYWJsZS5kZXN0cztcbiAgICAgIGlmIChwRGVzdHMpXG4gICAgICAgIGZvciAoY29uc3QgayBvZiBwRGVzdHMpIHtcbiAgICAgICAgICBhZGRTcXVhcmUoc3F1YXJlcywgaywgYHByZS1kZXN0JHtzLnBpZWNlcy5oYXMoaykgPyAnIG9jJyA6ICcnfWApO1xuICAgICAgICB9XG4gICAgfVxuICB9XG4gIGNvbnN0IHByZW1vdmUgPSBzLnByZW1vdmFibGUuY3VycmVudDtcbiAgaWYgKHByZW1vdmUpIHtcbiAgICBhZGRTcXVhcmUoc3F1YXJlcywgcHJlbW92ZS5vcmlnLCAnY3VycmVudC1wcmUnKTtcbiAgICBhZGRTcXVhcmUoc3F1YXJlcywgcHJlbW92ZS5kZXN0LCBgY3VycmVudC1wcmUke3ByZW1vdmUucHJvbSA/ICcgcHJvbScgOiAnJ31gKTtcbiAgfSBlbHNlIGlmIChzLnByZWRyb3BwYWJsZS5jdXJyZW50KVxuICAgIGFkZFNxdWFyZShcbiAgICAgIHNxdWFyZXMsXG4gICAgICBzLnByZWRyb3BwYWJsZS5jdXJyZW50LmtleSxcbiAgICAgIGBjdXJyZW50LXByZSR7cy5wcmVkcm9wcGFibGUuY3VycmVudC5wcm9tID8gJyBwcm9tJyA6ICcnfWAsXG4gICAgKTtcblxuICBmb3IgKGNvbnN0IHNxaCBvZiBzLmRyYXdhYmxlLnNxdWFyZXMpIHtcbiAgICBhZGRTcXVhcmUoc3F1YXJlcywgc3FoLmtleSwgc3FoLmNsYXNzTmFtZSk7XG4gIH1cblxuICByZXR1cm4gc3F1YXJlcztcbn1cblxuZnVuY3Rpb24gYWRkU3F1YXJlKHNxdWFyZXM6IFNxdWFyZUNsYXNzZXMsIGtleTogc2cuS2V5LCBrbGFzczogc3RyaW5nKTogdm9pZCB7XG4gIGNvbnN0IGNsYXNzZXMgPSBzcXVhcmVzLmdldChrZXkpO1xuICBpZiAoY2xhc3Nlcykgc3F1YXJlcy5zZXQoa2V5LCBgJHtjbGFzc2VzfSAke2tsYXNzfWApO1xuICBlbHNlIHNxdWFyZXMuc2V0KGtleSwga2xhc3MpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJQcm9tb3Rpb24oczogU3RhdGUsIHByb21vdGlvbkVsOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICBjb25zdCBjdXIgPSBzLnByb21vdGlvbi5jdXJyZW50O1xuICBjb25zdCBrZXkgPSBjdXI/LmtleTtcbiAgY29uc3QgcGllY2VzID0gY3VyID8gW2N1ci5wcm9tb3RlZFBpZWNlLCBjdXIucGllY2VdIDogW107XG4gIGNvbnN0IGhhc2ggPSBwcm9tb3Rpb25IYXNoKCEhY3VyLCBrZXksIHBpZWNlcyk7XG4gIGlmIChzLnByb21vdGlvbi5wcmV2UHJvbW90aW9uSGFzaCA9PT0gaGFzaCkgcmV0dXJuO1xuICBzLnByb21vdGlvbi5wcmV2UHJvbW90aW9uSGFzaCA9IGhhc2g7XG5cbiAgaWYgKGtleSkge1xuICAgIGNvbnN0IGFzU2VudGUgPSBzZW50ZVBvdihzLm9yaWVudGF0aW9uKTtcbiAgICBjb25zdCBpbml0UG9zID0ga2V5MnBvcyhrZXkpO1xuICAgIGNvbnN0IGNvbG9yID0gY3VyLnBpZWNlLmNvbG9yO1xuICAgIGNvbnN0IHByb21vdGlvblNxdWFyZSA9IGNyZWF0ZUVsKCdzZy1wcm9tb3Rpb24tc3F1YXJlJyk7XG4gICAgY29uc3QgcHJvbW90aW9uQ2hvaWNlcyA9IGNyZWF0ZUVsKCdzZy1wcm9tb3Rpb24tY2hvaWNlcycpO1xuICAgIGlmIChzLm9yaWVudGF0aW9uICE9PSBjb2xvcikgcHJvbW90aW9uQ2hvaWNlcy5jbGFzc0xpc3QuYWRkKCdyZXZlcnNlZCcpO1xuICAgIHRyYW5zbGF0ZVJlbChwcm9tb3Rpb25TcXVhcmUsIHBvc1RvVHJhbnNsYXRlUmVsKHMuZGltZW5zaW9ucykoaW5pdFBvcywgYXNTZW50ZSksIDEpO1xuXG4gICAgZm9yIChjb25zdCBwIG9mIHBpZWNlcykge1xuICAgICAgY29uc3QgcGllY2VOb2RlID0gY3JlYXRlRWwoJ3BpZWNlJywgcGllY2VOYW1lT2YocCkpIGFzIHNnLlBpZWNlTm9kZTtcbiAgICAgIHBpZWNlTm9kZS5zZ0NvbG9yID0gcC5jb2xvcjtcbiAgICAgIHBpZWNlTm9kZS5zZ1JvbGUgPSBwLnJvbGU7XG4gICAgICBwcm9tb3Rpb25DaG9pY2VzLmFwcGVuZENoaWxkKHBpZWNlTm9kZSk7XG4gICAgfVxuXG4gICAgcHJvbW90aW9uRWwuaW5uZXJIVE1MID0gJyc7XG4gICAgcHJvbW90aW9uU3F1YXJlLmFwcGVuZENoaWxkKHByb21vdGlvbkNob2ljZXMpO1xuICAgIHByb21vdGlvbkVsLmFwcGVuZENoaWxkKHByb21vdGlvblNxdWFyZSk7XG4gICAgc2V0RGlzcGxheShwcm9tb3Rpb25FbCwgdHJ1ZSk7XG4gIH0gZWxzZSB7XG4gICAgc2V0RGlzcGxheShwcm9tb3Rpb25FbCwgZmFsc2UpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHByb21vdGlvbkhhc2goYWN0aXZlOiBib29sZWFuLCBrZXk6IHNnLktleSB8IHVuZGVmaW5lZCwgcGllY2VzOiBzZy5QaWVjZVtdKTogc3RyaW5nIHtcbiAgcmV0dXJuIFthY3RpdmUsIGtleSwgcGllY2VzLm1hcCgocCkgPT4gcGllY2VOYW1lT2YocCkpLmpvaW4oJyAnKV0uam9pbignICcpO1xufVxuIiwgImltcG9ydCB0eXBlIHsgTm90YXRpb24gfSBmcm9tICcuL3R5cGVzLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNvb3Jkcyhub3RhdGlvbjogTm90YXRpb24pOiBzdHJpbmdbXSB7XG4gIHN3aXRjaCAobm90YXRpb24pIHtcbiAgICBjYXNlICdkaXpoaSc6XG4gICAgICByZXR1cm4gW1xuICAgICAgICAnJyxcbiAgICAgICAgJycsXG4gICAgICAgICcnLFxuICAgICAgICAnJyxcbiAgICAgICAgJ+S6pScsXG4gICAgICAgICfmiIwnLFxuICAgICAgICAn6YWJJyxcbiAgICAgICAgJ+eUsycsXG4gICAgICAgICfmnKonLFxuICAgICAgICAn5Y2IJyxcbiAgICAgICAgJ+W3sycsXG4gICAgICAgICfovrAnLFxuICAgICAgICAn5Y2vJyxcbiAgICAgICAgJ+WvhScsXG4gICAgICAgICfkuJEnLFxuICAgICAgICAn5a2QJyxcbiAgICAgIF07XG4gICAgY2FzZSAnamFwYW5lc2UnOlxuICAgICAgcmV0dXJuIFtcbiAgICAgICAgJ+WNgeWFrScsXG4gICAgICAgICfljYHkupQnLFxuICAgICAgICAn5Y2B5ZubJyxcbiAgICAgICAgJ+WNgeS4iScsXG4gICAgICAgICfljYHkuownLFxuICAgICAgICAn5Y2B5LiAJyxcbiAgICAgICAgJ+WNgScsXG4gICAgICAgICfkuZ0nLFxuICAgICAgICAn5YWrJyxcbiAgICAgICAgJ+S4gycsXG4gICAgICAgICflha0nLFxuICAgICAgICAn5LqUJyxcbiAgICAgICAgJ+WbmycsXG4gICAgICAgICfkuIknLFxuICAgICAgICAn5LqMJyxcbiAgICAgICAgJ+S4gCcsXG4gICAgICBdO1xuICAgIGNhc2UgJ2VuZ2luZSc6XG4gICAgICByZXR1cm4gWydwJywgJ28nLCAnbicsICdtJywgJ2wnLCAnaycsICdqJywgJ2knLCAnaCcsICdnJywgJ2YnLCAnZScsICdkJywgJ2MnLCAnYicsICdhJ107XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldHVybiBbJzEwJywgJ2YnLCAnZScsICdkJywgJ2MnLCAnYicsICdhJywgJzknLCAnOCcsICc3JywgJzYnLCAnNScsICc0JywgJzMnLCAnMicsICcxJ107XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBbXG4gICAgICAgICcxNicsXG4gICAgICAgICcxNScsXG4gICAgICAgICcxNCcsXG4gICAgICAgICcxMycsXG4gICAgICAgICcxMicsXG4gICAgICAgICcxMScsXG4gICAgICAgICcxMCcsXG4gICAgICAgICc5JyxcbiAgICAgICAgJzgnLFxuICAgICAgICAnNycsXG4gICAgICAgICc2JyxcbiAgICAgICAgJzUnLFxuICAgICAgICAnNCcsXG4gICAgICAgICczJyxcbiAgICAgICAgJzInLFxuICAgICAgICAnMScsXG4gICAgICBdO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgY29sb3JzIH0gZnJvbSAnLi9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgY29vcmRzIH0gZnJvbSAnLi9jb29yZHMuanMnO1xuaW1wb3J0IHsgY3JlYXRlU1ZHRWxlbWVudCwgc2V0QXR0cmlidXRlcyB9IGZyb20gJy4vc2hhcGVzLmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlIHtcbiAgQm9hcmRFbGVtZW50cyxcbiAgQ29sb3IsXG4gIERpbWVuc2lvbnMsXG4gIEhhbmRFbGVtZW50cyxcbiAgUGllY2VOb2RlLFxuICBSb2xlU3RyaW5nLFxuICBTaGFwZXNFbGVtZW50cyxcbiAgU3F1YXJlTm9kZSxcbn0gZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyBjcmVhdGVFbCwgb3Bwb3NpdGUsIHBpZWNlTmFtZU9mLCBwb3Mya2V5LCBzZXREaXNwbGF5IH0gZnJvbSAnLi91dGlsLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIHdyYXBCb2FyZChib2FyZFdyYXA6IEhUTUxFbGVtZW50LCBzOiBTdGF0ZSk6IEJvYXJkRWxlbWVudHMge1xuICAvLyAuc2ctd3JhcCAoZWxlbWVudCBwYXNzZWQgdG8gU2hvZ2lncm91bmQpXG4gIC8vICAgICBzZy1oYW5kLXdyYXBcbiAgLy8gICAgIHNnLWJvYXJkXG4gIC8vICAgICAgIHNnLXNxdWFyZXNcbiAgLy8gICAgICAgc2ctcGllY2VzXG4gIC8vICAgICAgIHBpZWNlIGRyYWdnaW5nXG4gIC8vICAgICAgIHNnLXByb21vdGlvblxuICAvLyAgICAgICBzZy1zcXVhcmUtb3ZlclxuICAvLyAgICAgICBzdmcuc2ctc2hhcGVzXG4gIC8vICAgICAgICAgZGVmc1xuICAvLyAgICAgICAgIGdcbiAgLy8gICAgICAgc3ZnLnNnLWN1c3RvbS1zdmdzXG4gIC8vICAgICAgICAgZ1xuICAvLyAgICAgc2ctaGFuZC13cmFwXG4gIC8vICAgICBzZy1mcmVlLXBpZWNlc1xuICAvLyAgICAgICBjb29yZHMucmFua3NcbiAgLy8gICAgICAgY29vcmRzLmZpbGVzXG5cbiAgY29uc3QgYm9hcmQgPSBjcmVhdGVFbCgnc2ctYm9hcmQnKTtcblxuICBjb25zdCBzcXVhcmVzID0gcmVuZGVyU3F1YXJlcyhzLmRpbWVuc2lvbnMsIHMub3JpZW50YXRpb24pO1xuICBib2FyZC5hcHBlbmRDaGlsZChzcXVhcmVzKTtcblxuICBjb25zdCBwaWVjZXMgPSBjcmVhdGVFbCgnc2ctcGllY2VzJyk7XG4gIGJvYXJkLmFwcGVuZENoaWxkKHBpZWNlcyk7XG5cbiAgbGV0IGRyYWdnZWQ6IFBpZWNlTm9kZSB8IHVuZGVmaW5lZDtcbiAgbGV0IHByb21vdGlvbjogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIGxldCBzcXVhcmVPdmVyOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgaWYgKCFzLnZpZXdPbmx5KSB7XG4gICAgZHJhZ2dlZCA9IGNyZWF0ZUVsKCdwaWVjZScpIGFzIFBpZWNlTm9kZTtcbiAgICBzZXREaXNwbGF5KGRyYWdnZWQsIGZhbHNlKTtcbiAgICBib2FyZC5hcHBlbmRDaGlsZChkcmFnZ2VkKTtcblxuICAgIHByb21vdGlvbiA9IGNyZWF0ZUVsKCdzZy1wcm9tb3Rpb24nKTtcbiAgICBzZXREaXNwbGF5KHByb21vdGlvbiwgZmFsc2UpO1xuICAgIGJvYXJkLmFwcGVuZENoaWxkKHByb21vdGlvbik7XG5cbiAgICBzcXVhcmVPdmVyID0gY3JlYXRlRWwoJ3NnLXNxdWFyZS1vdmVyJyk7XG4gICAgc2V0RGlzcGxheShzcXVhcmVPdmVyLCBmYWxzZSk7XG4gICAgYm9hcmQuYXBwZW5kQ2hpbGQoc3F1YXJlT3Zlcik7XG4gIH1cblxuICBsZXQgc2hhcGVzOiBTaGFwZXNFbGVtZW50cyB8IHVuZGVmaW5lZDtcbiAgaWYgKHMuZHJhd2FibGUudmlzaWJsZSkge1xuICAgIGNvbnN0IHN2ZyA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnc3ZnJyksIHtcbiAgICAgIGNsYXNzOiAnc2ctc2hhcGVzJyxcbiAgICAgIHZpZXdCb3g6IGAtJHtzLnNxdWFyZVJhdGlvWzBdIC8gMn0gLSR7cy5zcXVhcmVSYXRpb1sxXSAvIDJ9ICR7cy5kaW1lbnNpb25zLmZpbGVzICogcy5zcXVhcmVSYXRpb1swXX0gJHtcbiAgICAgICAgcy5kaW1lbnNpb25zLnJhbmtzICogcy5zcXVhcmVSYXRpb1sxXVxuICAgICAgfWAsXG4gICAgfSk7XG4gICAgc3ZnLmFwcGVuZENoaWxkKGNyZWF0ZVNWR0VsZW1lbnQoJ2RlZnMnKSk7XG4gICAgc3ZnLmFwcGVuZENoaWxkKGNyZWF0ZVNWR0VsZW1lbnQoJ2cnKSk7XG5cbiAgICBjb25zdCBjdXN0b21TdmcgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ3N2ZycpLCB7XG4gICAgICBjbGFzczogJ3NnLWN1c3RvbS1zdmdzJyxcbiAgICAgIHZpZXdCb3g6IGAwIDAgJHtzLmRpbWVuc2lvbnMuZmlsZXMgKiBzLnNxdWFyZVJhdGlvWzBdfSAke3MuZGltZW5zaW9ucy5yYW5rcyAqIHMuc3F1YXJlUmF0aW9bMV19YCxcbiAgICB9KTtcbiAgICBjdXN0b21TdmcuYXBwZW5kQ2hpbGQoY3JlYXRlU1ZHRWxlbWVudCgnZycpKTtcblxuICAgIGNvbnN0IGZyZWVQaWVjZXMgPSBjcmVhdGVFbCgnc2ctZnJlZS1waWVjZXMnKTtcblxuICAgIGJvYXJkLmFwcGVuZENoaWxkKHN2Zyk7XG4gICAgYm9hcmQuYXBwZW5kQ2hpbGQoY3VzdG9tU3ZnKTtcbiAgICBib2FyZC5hcHBlbmRDaGlsZChmcmVlUGllY2VzKTtcblxuICAgIHNoYXBlcyA9IHtcbiAgICAgIHN2ZyxcbiAgICAgIGZyZWVQaWVjZXMsXG4gICAgICBjdXN0b21TdmcsXG4gICAgfTtcbiAgfVxuXG4gIGlmIChzLmNvb3JkaW5hdGVzLmVuYWJsZWQpIHtcbiAgICBjb25zdCBvcmllbnRDbGFzcyA9IHMub3JpZW50YXRpb24gPT09ICdnb3RlJyA/ICcgZ290ZScgOiAnJztcbiAgICBjb25zdCByYW5rcyA9IGNvb3JkcyhzLmNvb3JkaW5hdGVzLnJhbmtzKTtcbiAgICBjb25zdCBmaWxlcyA9IGNvb3JkcyhzLmNvb3JkaW5hdGVzLmZpbGVzKTtcbiAgICBib2FyZC5hcHBlbmRDaGlsZChyZW5kZXJDb29yZHMocmFua3MsIGByYW5rcyR7b3JpZW50Q2xhc3N9YCwgcy5kaW1lbnNpb25zLnJhbmtzKSk7XG4gICAgYm9hcmQuYXBwZW5kQ2hpbGQocmVuZGVyQ29vcmRzKGZpbGVzLCBgZmlsZXMke29yaWVudENsYXNzfWAsIHMuZGltZW5zaW9ucy5maWxlcykpO1xuICB9XG5cbiAgYm9hcmRXcmFwLmlubmVySFRNTCA9ICcnO1xuXG4gIGNvbnN0IGRpbUNscyA9IGBkLSR7cy5kaW1lbnNpb25zLmZpbGVzfXgke3MuZGltZW5zaW9ucy5yYW5rc31gO1xuXG4gIC8vIHJlbW92ZSBhbGwgb3RoZXIgZGltZW5zaW9uIGNsYXNzZXNcbiAgYm9hcmRXcmFwLmNsYXNzTGlzdC5mb3JFYWNoKChjKSA9PiB7XG4gICAgaWYgKGMuc3Vic3RyaW5nKDAsIDIpID09PSAnZC0nICYmIGMgIT09IGRpbUNscykgYm9hcmRXcmFwLmNsYXNzTGlzdC5yZW1vdmUoYyk7XG4gIH0pO1xuXG4gIC8vIGVuc3VyZSB0aGUgc2ctd3JhcCBjbGFzcyBhbmQgZGltZW5zaW9ucyBjbGFzcyBpcyBzZXQgYmVmb3JlaGFuZCB0byBhdm9pZCByZWNvbXB1dGluZyBzdHlsZXNcbiAgYm9hcmRXcmFwLmNsYXNzTGlzdC5hZGQoJ3NnLXdyYXAnLCBkaW1DbHMpO1xuXG4gIGZvciAoY29uc3QgYyBvZiBjb2xvcnMpIGJvYXJkV3JhcC5jbGFzc0xpc3QudG9nZ2xlKGBvcmllbnRhdGlvbi0ke2N9YCwgcy5vcmllbnRhdGlvbiA9PT0gYyk7XG4gIGJvYXJkV3JhcC5jbGFzc0xpc3QudG9nZ2xlKCdtYW5pcHVsYWJsZScsICFzLnZpZXdPbmx5KTtcblxuICBib2FyZFdyYXAuYXBwZW5kQ2hpbGQoYm9hcmQpO1xuXG4gIGxldCBoYW5kczogSGFuZEVsZW1lbnRzIHwgdW5kZWZpbmVkO1xuICBpZiAocy5oYW5kcy5pbmxpbmVkKSB7XG4gICAgY29uc3QgaGFuZFdyYXBUb3AgPSBjcmVhdGVFbCgnc2ctaGFuZC13cmFwJywgJ2lubGluZWQnKTtcbiAgICBjb25zdCBoYW5kV3JhcEJvdHRvbSA9IGNyZWF0ZUVsKCdzZy1oYW5kLXdyYXAnLCAnaW5saW5lZCcpO1xuICAgIGJvYXJkV3JhcC5pbnNlcnRCZWZvcmUoaGFuZFdyYXBCb3R0b20sIGJvYXJkLm5leHRFbGVtZW50U2libGluZyk7XG4gICAgYm9hcmRXcmFwLmluc2VydEJlZm9yZShoYW5kV3JhcFRvcCwgYm9hcmQpO1xuICAgIGhhbmRzID0ge1xuICAgICAgdG9wOiBoYW5kV3JhcFRvcCxcbiAgICAgIGJvdHRvbTogaGFuZFdyYXBCb3R0b20sXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYm9hcmQsXG4gICAgc3F1YXJlcyxcbiAgICBwaWVjZXMsXG4gICAgcHJvbW90aW9uLFxuICAgIHNxdWFyZU92ZXIsXG4gICAgZHJhZ2dlZCxcbiAgICBzaGFwZXMsXG4gICAgaGFuZHMsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwSGFuZChoYW5kV3JhcDogSFRNTEVsZW1lbnQsIHBvczogJ3RvcCcgfCAnYm90dG9tJywgczogU3RhdGUpOiBIVE1MRWxlbWVudCB7XG4gIGNvbnN0IGhhbmQgPSByZW5kZXJIYW5kKHBvcyA9PT0gJ3RvcCcgPyBvcHBvc2l0ZShzLm9yaWVudGF0aW9uKSA6IHMub3JpZW50YXRpb24sIHMuaGFuZHMucm9sZXMpO1xuICBoYW5kV3JhcC5pbm5lckhUTUwgPSAnJztcblxuICBjb25zdCByb2xlQ250Q2xzID0gYHItJHtzLmhhbmRzLnJvbGVzLmxlbmd0aH1gO1xuXG4gIC8vIHJlbW92ZSBhbGwgb3RoZXIgcm9sZSBjb3VudCBjbGFzc2VzXG4gIGhhbmRXcmFwLmNsYXNzTGlzdC5mb3JFYWNoKChjKSA9PiB7XG4gICAgaWYgKGMuc3Vic3RyaW5nKDAsIDIpID09PSAnci0nICYmIGMgIT09IHJvbGVDbnRDbHMpIGhhbmRXcmFwLmNsYXNzTGlzdC5yZW1vdmUoYyk7XG4gIH0pO1xuXG4gIC8vIGVuc3VyZSB0aGUgc2ctaGFuZC13cmFwIGNsYXNzLCBoYW5kIHBvcyBjbGFzcyBhbmQgcm9sZSBudW1iZXIgY2xhc3MgaXMgc2V0IGJlZm9yZWhhbmQgdG8gYXZvaWQgcmVjb21wdXRpbmcgc3R5bGVzXG4gIGhhbmRXcmFwLmNsYXNzTGlzdC5hZGQoJ3NnLWhhbmQtd3JhcCcsIGBoYW5kLSR7cG9zfWAsIHJvbGVDbnRDbHMpO1xuICBoYW5kV3JhcC5hcHBlbmRDaGlsZChoYW5kKTtcblxuICBmb3IgKGNvbnN0IGMgb2YgY29sb3JzKSBoYW5kV3JhcC5jbGFzc0xpc3QudG9nZ2xlKGBvcmllbnRhdGlvbi0ke2N9YCwgcy5vcmllbnRhdGlvbiA9PT0gYyk7XG4gIGhhbmRXcmFwLmNsYXNzTGlzdC50b2dnbGUoJ21hbmlwdWxhYmxlJywgIXMudmlld09ubHkpO1xuXG4gIHJldHVybiBoYW5kO1xufVxuXG5mdW5jdGlvbiByZW5kZXJDb29yZHMoZWxlbXM6IHJlYWRvbmx5IHN0cmluZ1tdLCBjbGFzc05hbWU6IHN0cmluZywgdHJpbTogbnVtYmVyKTogSFRNTEVsZW1lbnQge1xuICBjb25zdCBlbCA9IGNyZWF0ZUVsKCdjb29yZHMnLCBjbGFzc05hbWUpO1xuICBsZXQgZjogSFRNTEVsZW1lbnQ7XG4gIGZvciAoY29uc3QgZWxlbSBvZiBlbGVtcy5zbGljZSgtdHJpbSkpIHtcbiAgICBmID0gY3JlYXRlRWwoJ2Nvb3JkJyk7XG4gICAgZi50ZXh0Q29udGVudCA9IGVsZW07XG4gICAgZWwuYXBwZW5kQ2hpbGQoZik7XG4gIH1cbiAgcmV0dXJuIGVsO1xufVxuXG5mdW5jdGlvbiByZW5kZXJTcXVhcmVzKGRpbXM6IERpbWVuc2lvbnMsIG9yaWVudGF0aW9uOiBDb2xvcik6IEhUTUxFbGVtZW50IHtcbiAgY29uc3Qgc3F1YXJlcyA9IGNyZWF0ZUVsKCdzZy1zcXVhcmVzJyk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkaW1zLnJhbmtzICogZGltcy5maWxlczsgaSsrKSB7XG4gICAgY29uc3Qgc3EgPSBjcmVhdGVFbCgnc3EnKSBhcyBTcXVhcmVOb2RlO1xuICAgIHNxLnNnS2V5ID1cbiAgICAgIG9yaWVudGF0aW9uID09PSAnc2VudGUnXG4gICAgICAgID8gcG9zMmtleShbZGltcy5maWxlcyAtIDEgLSAoaSAlIGRpbXMuZmlsZXMpLCBNYXRoLmZsb29yKGkgLyBkaW1zLmZpbGVzKV0pXG4gICAgICAgIDogcG9zMmtleShbaSAlIGRpbXMuZmlsZXMsIGRpbXMucmFua3MgLSAxIC0gTWF0aC5mbG9vcihpIC8gZGltcy5maWxlcyldKTtcbiAgICBzcXVhcmVzLmFwcGVuZENoaWxkKHNxKTtcbiAgfVxuXG4gIHJldHVybiBzcXVhcmVzO1xufVxuXG5mdW5jdGlvbiByZW5kZXJIYW5kKGNvbG9yOiBDb2xvciwgcm9sZXM6IFJvbGVTdHJpbmdbXSk6IEhUTUxFbGVtZW50IHtcbiAgY29uc3QgaGFuZCA9IGNyZWF0ZUVsKCdzZy1oYW5kJyk7XG4gIGZvciAoY29uc3Qgcm9sZSBvZiByb2xlcykge1xuICAgIGNvbnN0IHBpZWNlID0geyByb2xlOiByb2xlLCBjb2xvcjogY29sb3IgfTtcbiAgICBjb25zdCB3cmFwRWwgPSBjcmVhdGVFbCgnc2ctaHAtd3JhcCcpO1xuICAgIGNvbnN0IHBpZWNlRWwgPSBjcmVhdGVFbCgncGllY2UnLCBwaWVjZU5hbWVPZihwaWVjZSkpIGFzIFBpZWNlTm9kZTtcbiAgICBwaWVjZUVsLnNnQ29sb3IgPSBjb2xvcjtcbiAgICBwaWVjZUVsLnNnUm9sZSA9IHJvbGU7XG4gICAgd3JhcEVsLmFwcGVuZENoaWxkKHBpZWNlRWwpO1xuICAgIGhhbmQuYXBwZW5kQ2hpbGQod3JhcEVsKTtcbiAgfVxuICByZXR1cm4gaGFuZDtcbn1cbiIsICJpbXBvcnQgKiBhcyBldmVudHMgZnJvbSAnLi9ldmVudHMuanMnO1xuaW1wb3J0IHsgcmVuZGVySGFuZCB9IGZyb20gJy4vaGFuZHMuanMnO1xuaW1wb3J0IHsgcmVuZGVyIH0gZnJvbSAnLi9yZW5kZXIuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgeyBXcmFwRWxlbWVudHMsIFdyYXBFbGVtZW50c0Jvb2xlYW4gfSBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IHdyYXBCb2FyZCwgd3JhcEhhbmQgfSBmcm9tICcuL3dyYXAuanMnO1xuXG5mdW5jdGlvbiBhdHRhY2hCb2FyZChzdGF0ZTogU3RhdGUsIGJvYXJkV3JhcDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgY29uc3QgZWxlbWVudHMgPSB3cmFwQm9hcmQoYm9hcmRXcmFwLCBzdGF0ZSk7XG5cbiAgLy8gaW4gY2FzZSBvZiBpbmxpbmVkIGhhbmRzXG4gIGlmIChlbGVtZW50cy5oYW5kcykgYXR0YWNoSGFuZHMoc3RhdGUsIGVsZW1lbnRzLmhhbmRzLnRvcCwgZWxlbWVudHMuaGFuZHMuYm90dG9tKTtcblxuICBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmJvYXJkID0gYm9hcmRXcmFwO1xuICBzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQgPSBlbGVtZW50cztcbiAgc3RhdGUuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMuY2xlYXIoKTtcblxuICBldmVudHMuYmluZEJvYXJkKHN0YXRlLCBlbGVtZW50cyk7XG5cbiAgc3RhdGUuZHJhd2FibGUucHJldlN2Z0hhc2ggPSAnJztcbiAgc3RhdGUucHJvbW90aW9uLnByZXZQcm9tb3Rpb25IYXNoID0gJyc7XG5cbiAgcmVuZGVyKHN0YXRlLCBlbGVtZW50cyk7XG59XG5cbmZ1bmN0aW9uIGF0dGFjaEhhbmRzKHN0YXRlOiBTdGF0ZSwgaGFuZFRvcFdyYXA/OiBIVE1MRWxlbWVudCwgaGFuZEJvdHRvbVdyYXA/OiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICBpZiAoIXN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcykgc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzID0ge307XG4gIGlmICghc3RhdGUuZG9tLndyYXBFbGVtZW50cy5oYW5kcykgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5oYW5kcyA9IHt9O1xuXG4gIGlmIChoYW5kVG9wV3JhcCkge1xuICAgIGNvbnN0IGhhbmRUb3AgPSB3cmFwSGFuZChoYW5kVG9wV3JhcCwgJ3RvcCcsIHN0YXRlKTtcbiAgICBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmhhbmRzLnRvcCA9IGhhbmRUb3BXcmFwO1xuICAgIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcy50b3AgPSBoYW5kVG9wO1xuICAgIGV2ZW50cy5iaW5kSGFuZChzdGF0ZSwgaGFuZFRvcCk7XG4gICAgcmVuZGVySGFuZChzdGF0ZSwgaGFuZFRvcCk7XG4gIH1cbiAgaWYgKGhhbmRCb3R0b21XcmFwKSB7XG4gICAgY29uc3QgaGFuZEJvdHRvbSA9IHdyYXBIYW5kKGhhbmRCb3R0b21XcmFwLCAnYm90dG9tJywgc3RhdGUpO1xuICAgIHN0YXRlLmRvbS53cmFwRWxlbWVudHMuaGFuZHMuYm90dG9tID0gaGFuZEJvdHRvbVdyYXA7XG4gICAgc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzLmJvdHRvbSA9IGhhbmRCb3R0b207XG4gICAgZXZlbnRzLmJpbmRIYW5kKHN0YXRlLCBoYW5kQm90dG9tKTtcbiAgICByZW5kZXJIYW5kKHN0YXRlLCBoYW5kQm90dG9tKTtcbiAgfVxuXG4gIGlmIChoYW5kVG9wV3JhcCB8fCBoYW5kQm90dG9tV3JhcCkge1xuICAgIHN0YXRlLmRvbS5ib3VuZHMuaGFuZHMuYm91bmRzLmNsZWFyKCk7XG4gICAgc3RhdGUuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcy5jbGVhcigpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWRyYXdBbGwod3JhcEVsZW1lbnRzOiBXcmFwRWxlbWVudHMsIHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBpZiAod3JhcEVsZW1lbnRzLmJvYXJkKSBhdHRhY2hCb2FyZChzdGF0ZSwgd3JhcEVsZW1lbnRzLmJvYXJkKTtcbiAgaWYgKHdyYXBFbGVtZW50cy5oYW5kcyAmJiAhc3RhdGUuaGFuZHMuaW5saW5lZClcbiAgICBhdHRhY2hIYW5kcyhzdGF0ZSwgd3JhcEVsZW1lbnRzLmhhbmRzLnRvcCwgd3JhcEVsZW1lbnRzLmhhbmRzLmJvdHRvbSk7XG5cbiAgLy8gc2hhcGVzIG1pZ2h0IGRlcGVuZCBib3RoIG9uIGJvYXJkIGFuZCBoYW5kcyAtIHJlZHJhdyBvbmx5IGFmdGVyIGJvdGggYXJlIGRvbmVcbiAgc3RhdGUuZG9tLnJlZHJhd1NoYXBlcygpO1xuXG4gIGlmIChzdGF0ZS5ldmVudHMuaW5zZXJ0KVxuICAgIHN0YXRlLmV2ZW50cy5pbnNlcnQod3JhcEVsZW1lbnRzLmJvYXJkICYmIHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZCwge1xuICAgICAgdG9wOiB3cmFwRWxlbWVudHMuaGFuZHM/LnRvcCAmJiBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHM/LnRvcCxcbiAgICAgIGJvdHRvbTogd3JhcEVsZW1lbnRzLmhhbmRzPy5ib3R0b20gJiYgc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzPy5ib3R0b20sXG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXRhY2hFbGVtZW50cyh3ZWI6IFdyYXBFbGVtZW50c0Jvb2xlYW4sIHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBpZiAod2ViLmJvYXJkKSB7XG4gICAgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5ib2FyZCA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMuY2xlYXIoKTtcbiAgfVxuICBpZiAoc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzICYmIHN0YXRlLmRvbS53cmFwRWxlbWVudHMuaGFuZHMpIHtcbiAgICBpZiAod2ViLmhhbmRzPy50b3ApIHtcbiAgICAgIHN0YXRlLmRvbS53cmFwRWxlbWVudHMuaGFuZHMudG9wID0gdW5kZWZpbmVkO1xuICAgICAgc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzLnRvcCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKHdlYi5oYW5kcz8uYm90dG9tKSB7XG4gICAgICBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmhhbmRzLmJvdHRvbSA9IHVuZGVmaW5lZDtcbiAgICAgIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcy5ib3R0b20gPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmICh3ZWIuaGFuZHM/LnRvcCB8fCB3ZWIuaGFuZHM/LmJvdHRvbSkge1xuICAgICAgc3RhdGUuZG9tLmJvdW5kcy5oYW5kcy5ib3VuZHMuY2xlYXIoKTtcbiAgICAgIHN0YXRlLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMuY2xlYXIoKTtcbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBhbmltLCByZW5kZXIgfSBmcm9tICcuL2FuaW0uanMnO1xuaW1wb3J0ICogYXMgYm9hcmQgZnJvbSAnLi9ib2FyZC5qcyc7XG5pbXBvcnQgdHlwZSB7IENvbmZpZyB9IGZyb20gJy4vY29uZmlnLmpzJztcbmltcG9ydCB7IGFwcGx5QW5pbWF0aW9uLCBjb25maWd1cmUgfSBmcm9tICcuL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBkZXRhY2hFbGVtZW50cywgcmVkcmF3QWxsIH0gZnJvbSAnLi9kb20uanMnO1xuaW1wb3J0IHsgY2FuY2VsIGFzIGRyYWdDYW5jZWwsIGRyYWdOZXdQaWVjZSB9IGZyb20gJy4vZHJhZy5qcyc7XG5pbXBvcnQgdHlwZSB7IERyYXdTaGFwZSwgU3F1YXJlSGlnaGxpZ2h0IH0gZnJvbSAnLi9kcmF3LmpzJztcbmltcG9ydCB7IGFkZFRvSGFuZCwgcmVtb3ZlRnJvbUhhbmQgfSBmcm9tICcuL2hhbmRzLmpzJztcbmltcG9ydCB7IGJvYXJkVG9TZmVuLCBoYW5kc1RvU2ZlbiwgaW5mZXJEaW1lbnNpb25zIH0gZnJvbSAnLi9zZmVuLmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXBpIHtcbiAgLy8gYXR0YWNoIGVsZW1lbnRzIHRvIGN1cnJlbnQgc2cgaW5zdGFuY2VcbiAgYXR0YWNoKHdyYXBFbGVtZW50czogc2cuV3JhcEVsZW1lbnRzKTogdm9pZDtcblxuICAvLyBkZXRhY2ggZWxlbWVudHMgZnJvbSBjdXJyZW50IHNnIGluc3RhbmNlXG4gIGRldGFjaCh3cmFwRWxlbWVudHNCb29sZWFuOiBzZy5XcmFwRWxlbWVudHNCb29sZWFuKTogdm9pZDtcblxuICAvLyByZWNvbmZpZ3VyZSB0aGUgaW5zdGFuY2UuIEFjY2VwdHMgYWxsIGNvbmZpZyBvcHRpb25zXG4gIC8vIGJvYXJkIHdpbGwgYmUgYW5pbWF0ZWQgYWNjb3JkaW5nbHksIGlmIGFuaW1hdGlvbnMgYXJlIGVuYWJsZWRcbiAgc2V0KGNvbmZpZzogQ29uZmlnLCBza2lwQW5pbWF0aW9uPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gcmVhZCBzaG9naWdyb3VuZCBzdGF0ZTsgd3JpdGUgYXQgeW91ciBvd24gcmlza3NcbiAgc3RhdGU6IFN0YXRlO1xuXG4gIC8vIGdldCB0aGUgcG9zaXRpb24gb24gdGhlIGJvYXJkIGluIEZvcnN5dGggbm90YXRpb25cbiAgZ2V0Qm9hcmRTZmVuKCk6IHNnLkJvYXJkU2ZlbjtcblxuICAvLyBnZXQgdGhlIHBpZWNlcyBpbiBoYW5kIGluIEZvcnN5dGggbm90YXRpb25cbiAgZ2V0SGFuZHNTZmVuKCk6IHNnLkhhbmRzU2ZlbjtcblxuICAvLyBjaGFuZ2UgdGhlIHZpZXcgYW5nbGVcbiAgdG9nZ2xlT3JpZW50YXRpb24oKTogdm9pZDtcblxuICAvLyBwZXJmb3JtIGEgbW92ZSBwcm9ncmFtbWF0aWNhbGx5XG4gIG1vdmUob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXksIHByb20/OiBib29sZWFuKTogdm9pZDtcblxuICAvLyBwZXJmb3JtIGEgZHJvcCBwcm9ncmFtbWF0aWNhbGx5LCBieSBkZWZhdWx0IHBpZWNlIGlzIHRha2VuIGZyb20gaGFuZFxuICBkcm9wKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb20/OiBib29sZWFuLCBzcGFyZT86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIGFkZCBhbmQvb3IgcmVtb3ZlIGFyYml0cmFyeSBwaWVjZXMgb24gdGhlIGJvYXJkXG4gIHNldFBpZWNlcyhwaWVjZXM6IHNnLlBpZWNlc0RpZmYpOiB2b2lkO1xuXG4gIC8vIGFkZCBwaWVjZS5yb2xlIHRvIGhhbmQgb2YgcGllY2UuY29sb3JcbiAgYWRkVG9IYW5kKHBpZWNlOiBzZy5QaWVjZSwgY291bnQ/OiBudW1iZXIpOiB2b2lkO1xuXG4gIC8vIHJlbW92ZSBwaWVjZS5yb2xlIGZyb20gaGFuZCBvZiBwaWVjZS5jb2xvclxuICByZW1vdmVGcm9tSGFuZChwaWVjZTogc2cuUGllY2UsIGNvdW50PzogbnVtYmVyKTogdm9pZDtcblxuICAvLyBjbGljayBhIHNxdWFyZSBwcm9ncmFtbWF0aWNhbGx5XG4gIHNlbGVjdFNxdWFyZShrZXk6IHNnLktleSB8IG51bGwsIHByb20/OiBib29sZWFuLCBmb3JjZT86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIHNlbGVjdCBhIHBpZWNlIGZyb20gaGFuZCB0byBkcm9wIHByb2dyYW1hdGljYWxseSwgYnkgZGVmYXVsdCBwaWVjZSBpbiBoYW5kIGlzIHNlbGVjdGVkXG4gIHNlbGVjdFBpZWNlKHBpZWNlOiBzZy5QaWVjZSB8IG51bGwsIHNwYXJlPzogYm9vbGVhbiwgZm9yY2U/OiBib29sZWFuKTogdm9pZDtcblxuICAvLyBwbGF5IHRoZSBjdXJyZW50IHByZW1vdmUsIGlmIGFueTsgcmV0dXJucyB0cnVlIGlmIHByZW1vdmUgd2FzIHBsYXllZFxuICBwbGF5UHJlbW92ZSgpOiBib29sZWFuO1xuXG4gIC8vIGNhbmNlbCB0aGUgY3VycmVudCBwcmVtb3ZlLCBpZiBhbnlcbiAgY2FuY2VsUHJlbW92ZSgpOiB2b2lkO1xuXG4gIC8vIHBsYXkgdGhlIGN1cnJlbnQgcHJlZHJvcCwgaWYgYW55OyByZXR1cm5zIHRydWUgaWYgcHJlbW92ZSB3YXMgcGxheWVkXG4gIHBsYXlQcmVkcm9wKCk6IGJvb2xlYW47XG5cbiAgLy8gY2FuY2VsIHRoZSBjdXJyZW50IHByZWRyb3AsIGlmIGFueVxuICBjYW5jZWxQcmVkcm9wKCk6IHZvaWQ7XG5cbiAgLy8gY2FuY2VsIHRoZSBjdXJyZW50IG1vdmUgb3IgZHJvcCBiZWluZyBtYWRlLCBwcmVtb3ZlcyBhbmQgcHJlZHJvcHNcbiAgY2FuY2VsTW92ZU9yRHJvcCgpOiB2b2lkO1xuXG4gIC8vIGNhbmNlbCBjdXJyZW50IG1vdmUgb3IgZHJvcCBhbmQgcHJldmVudCBmdXJ0aGVyIG9uZXNcbiAgc3RvcCgpOiB2b2lkO1xuXG4gIC8vIHByb2dyYW1tYXRpY2FsbHkgZHJhdyB1c2VyIHNoYXBlc1xuICBzZXRTaGFwZXMoc2hhcGVzOiBEcmF3U2hhcGVbXSk6IHZvaWQ7XG5cbiAgLy8gcHJvZ3JhbW1hdGljYWxseSBkcmF3IGF1dG8gc2hhcGVzXG4gIHNldEF1dG9TaGFwZXMoc2hhcGVzOiBEcmF3U2hhcGVbXSk6IHZvaWQ7XG5cbiAgLy8gcHJvZ3JhbW1hdGljYWxseSBoaWdobGlnaHQgc3F1YXJlc1xuICBzZXRTcXVhcmVIaWdobGlnaHRzKHNxdWFyZXM6IFNxdWFyZUhpZ2hsaWdodFtdKTogdm9pZDtcblxuICAvLyBmb3IgcGllY2UgZHJvcHBpbmcgYW5kIGJvYXJkIGVkaXRvcnNcbiAgZHJhZ05ld1BpZWNlKHBpZWNlOiBzZy5QaWVjZSwgZXZlbnQ6IHNnLk1vdWNoRXZlbnQsIHNwYXJlPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gdW5iaW5kcyBhbGwgZXZlbnRzXG4gIC8vIChpbXBvcnRhbnQgZm9yIGRvY3VtZW50LXdpZGUgZXZlbnRzIGxpa2Ugc2Nyb2xsIGFuZCBtb3VzZW1vdmUpXG4gIGRlc3Ryb3k6IHNnLlVuYmluZDtcbn1cblxuLy8gc2VlIEFQSSB0eXBlcyBhbmQgZG9jdW1lbnRhdGlvbnMgaW4gYXBpLmQudHNcbmV4cG9ydCBmdW5jdGlvbiBzdGFydChzdGF0ZTogU3RhdGUpOiBBcGkge1xuICByZXR1cm4ge1xuICAgIGF0dGFjaCh3cmFwRWxlbWVudHM6IHNnLldyYXBFbGVtZW50cyk6IHZvaWQge1xuICAgICAgcmVkcmF3QWxsKHdyYXBFbGVtZW50cywgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBkZXRhY2god3JhcEVsZW1lbnRzQm9vbGVhbjogc2cuV3JhcEVsZW1lbnRzQm9vbGVhbik6IHZvaWQge1xuICAgICAgZGV0YWNoRWxlbWVudHMod3JhcEVsZW1lbnRzQm9vbGVhbiwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzZXQoY29uZmlnOiBDb25maWcsIHNraXBBbmltYXRpb24/OiBib29sZWFuKTogdm9pZCB7XG4gICAgICBmdW5jdGlvbiBnZXRCeVBhdGgocGF0aDogc3RyaW5nLCBvYmo6IGFueSkge1xuICAgICAgICBjb25zdCBwcm9wZXJ0aWVzID0gcGF0aC5zcGxpdCgnLicpO1xuICAgICAgICByZXR1cm4gcHJvcGVydGllcy5yZWR1Y2UoKHByZXYsIGN1cnIpID0+IHByZXYgJiYgcHJldltjdXJyXSwgb2JqKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZm9yY2VSZWRyYXdQcm9wczogKGAke2tleW9mIENvbmZpZ31gIHwgYCR7a2V5b2YgQ29uZmlnfS4ke3N0cmluZ31gKVtdID0gW1xuICAgICAgICAnb3JpZW50YXRpb24nLFxuICAgICAgICAndmlld09ubHknLFxuICAgICAgICAnY29vcmRpbmF0ZXMuZW5hYmxlZCcsXG4gICAgICAgICdjb29yZGluYXRlcy5ub3RhdGlvbicsXG4gICAgICAgICdkcmF3YWJsZS52aXNpYmxlJyxcbiAgICAgICAgJ2hhbmRzLmlubGluZWQnLFxuICAgICAgXTtcbiAgICAgIGNvbnN0IG5ld0RpbXMgPSBjb25maWcuc2Zlbj8uYm9hcmQgJiYgaW5mZXJEaW1lbnNpb25zKGNvbmZpZy5zZmVuLmJvYXJkKTtcbiAgICAgIGNvbnN0IHRvUmVkcmF3ID1cbiAgICAgICAgZm9yY2VSZWRyYXdQcm9wcy5zb21lKChwKSA9PiB7XG4gICAgICAgICAgY29uc3QgY1JlcyA9IGdldEJ5UGF0aChwLCBjb25maWcpO1xuICAgICAgICAgIHJldHVybiBjUmVzICYmIGNSZXMgIT09IGdldEJ5UGF0aChwLCBzdGF0ZSk7XG4gICAgICAgIH0pIHx8XG4gICAgICAgICEhKFxuICAgICAgICAgIG5ld0RpbXMgJiZcbiAgICAgICAgICAobmV3RGltcy5maWxlcyAhPT0gc3RhdGUuZGltZW5zaW9ucy5maWxlcyB8fCBuZXdEaW1zLnJhbmtzICE9PSBzdGF0ZS5kaW1lbnNpb25zLnJhbmtzKVxuICAgICAgICApIHx8XG4gICAgICAgICEhY29uZmlnLmhhbmRzPy5yb2xlcz8uZXZlcnkoKHIsIGkpID0+IHIgPT09IHN0YXRlLmhhbmRzLnJvbGVzW2ldKTtcblxuICAgICAgaWYgKHRvUmVkcmF3KSB7XG4gICAgICAgIGJvYXJkLnJlc2V0KHN0YXRlKTtcbiAgICAgICAgY29uZmlndXJlKHN0YXRlLCBjb25maWcpO1xuICAgICAgICByZWRyYXdBbGwoc3RhdGUuZG9tLndyYXBFbGVtZW50cywgc3RhdGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXBwbHlBbmltYXRpb24oc3RhdGUsIGNvbmZpZyk7XG4gICAgICAgIChjb25maWcuc2Zlbj8uYm9hcmQgJiYgIXNraXBBbmltYXRpb24gPyBhbmltIDogcmVuZGVyKShcbiAgICAgICAgICAoc3RhdGUpID0+IGNvbmZpZ3VyZShzdGF0ZSwgY29uZmlnKSxcbiAgICAgICAgICBzdGF0ZSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RhdGUsXG5cbiAgICBnZXRCb2FyZFNmZW46ICgpID0+IGJvYXJkVG9TZmVuKHN0YXRlLnBpZWNlcywgc3RhdGUuZGltZW5zaW9ucywgc3RhdGUuZm9yc3l0aC50b0ZvcnN5dGgpLFxuXG4gICAgZ2V0SGFuZHNTZmVuOiAoKSA9PlxuICAgICAgaGFuZHNUb1NmZW4oc3RhdGUuaGFuZHMuaGFuZE1hcCwgc3RhdGUuaGFuZHMucm9sZXMsIHN0YXRlLmZvcnN5dGgudG9Gb3JzeXRoKSxcblxuICAgIHRvZ2dsZU9yaWVudGF0aW9uKCk6IHZvaWQge1xuICAgICAgYm9hcmQudG9nZ2xlT3JpZW50YXRpb24oc3RhdGUpO1xuICAgICAgcmVkcmF3QWxsKHN0YXRlLmRvbS53cmFwRWxlbWVudHMsIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgbW92ZShvcmlnLCBkZXN0LCBwcm9tKTogdm9pZCB7XG4gICAgICBhbmltKFxuICAgICAgICAoc3RhdGUpID0+XG4gICAgICAgICAgYm9hcmQuYmFzZU1vdmUoc3RhdGUsIG9yaWcsIGRlc3QsIHByb20gfHwgc3RhdGUucHJvbW90aW9uLmZvcmNlTW92ZVByb21vdGlvbihvcmlnLCBkZXN0KSksXG4gICAgICAgIHN0YXRlLFxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgZHJvcChwaWVjZSwga2V5LCBwcm9tLCBzcGFyZSk6IHZvaWQge1xuICAgICAgYW5pbSgoc3RhdGUpID0+IHtcbiAgICAgICAgc3RhdGUuZHJvcHBhYmxlLnNwYXJlID0gISFzcGFyZTtcbiAgICAgICAgYm9hcmQuYmFzZURyb3Aoc3RhdGUsIHBpZWNlLCBrZXksIHByb20gfHwgc3RhdGUucHJvbW90aW9uLmZvcmNlRHJvcFByb21vdGlvbihwaWVjZSwga2V5KSk7XG4gICAgICB9LCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHNldFBpZWNlcyhwaWVjZXMpOiB2b2lkIHtcbiAgICAgIGFuaW0oKHN0YXRlKSA9PiBib2FyZC5zZXRQaWVjZXMoc3RhdGUsIHBpZWNlcyksIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgYWRkVG9IYW5kKHBpZWNlOiBzZy5QaWVjZSwgY291bnQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgcmVuZGVyKChzdGF0ZSkgPT4gYWRkVG9IYW5kKHN0YXRlLCBwaWVjZSwgY291bnQpLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHJlbW92ZUZyb21IYW5kKHBpZWNlOiBzZy5QaWVjZSwgY291bnQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgcmVuZGVyKChzdGF0ZSkgPT4gcmVtb3ZlRnJvbUhhbmQoc3RhdGUsIHBpZWNlLCBjb3VudCksIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc2VsZWN0U3F1YXJlKGtleSwgcHJvbSwgZm9yY2UpOiB2b2lkIHtcbiAgICAgIGlmIChrZXkpIGFuaW0oKHN0YXRlKSA9PiBib2FyZC5zZWxlY3RTcXVhcmUoc3RhdGUsIGtleSwgcHJvbSwgZm9yY2UpLCBzdGF0ZSk7XG4gICAgICBlbHNlIGlmIChzdGF0ZS5zZWxlY3RlZCkge1xuICAgICAgICBib2FyZC51bnNlbGVjdChzdGF0ZSk7XG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc2VsZWN0UGllY2UocGllY2UsIHNwYXJlLCBmb3JjZSk6IHZvaWQge1xuICAgICAgaWYgKHBpZWNlKSByZW5kZXIoKHN0YXRlKSA9PiBib2FyZC5zZWxlY3RQaWVjZShzdGF0ZSwgcGllY2UsIHNwYXJlLCBmb3JjZSwgdHJ1ZSksIHN0YXRlKTtcbiAgICAgIGVsc2UgaWYgKHN0YXRlLnNlbGVjdGVkUGllY2UpIHtcbiAgICAgICAgYm9hcmQudW5zZWxlY3Qoc3RhdGUpO1xuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHBsYXlQcmVtb3ZlKCk6IGJvb2xlYW4ge1xuICAgICAgaWYgKHN0YXRlLnByZW1vdmFibGUuY3VycmVudCkge1xuICAgICAgICBpZiAoYW5pbShib2FyZC5wbGF5UHJlbW92ZSwgc3RhdGUpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgLy8gaWYgdGhlIHByZW1vdmUgY291bGRuJ3QgYmUgcGxheWVkLCByZWRyYXcgdG8gY2xlYXIgaXQgdXBcbiAgICAgICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICBwbGF5UHJlZHJvcCgpOiBib29sZWFuIHtcbiAgICAgIGlmIChzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCkge1xuICAgICAgICBpZiAoYW5pbShib2FyZC5wbGF5UHJlZHJvcCwgc3RhdGUpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgLy8gaWYgdGhlIHByZWRyb3AgY291bGRuJ3QgYmUgcGxheWVkLCByZWRyYXcgdG8gY2xlYXIgaXQgdXBcbiAgICAgICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICBjYW5jZWxQcmVtb3ZlKCk6IHZvaWQge1xuICAgICAgcmVuZGVyKGJvYXJkLnVuc2V0UHJlbW92ZSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBjYW5jZWxQcmVkcm9wKCk6IHZvaWQge1xuICAgICAgcmVuZGVyKGJvYXJkLnVuc2V0UHJlZHJvcCwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBjYW5jZWxNb3ZlT3JEcm9wKCk6IHZvaWQge1xuICAgICAgcmVuZGVyKChzdGF0ZSkgPT4ge1xuICAgICAgICBib2FyZC5jYW5jZWxNb3ZlT3JEcm9wKHN0YXRlKTtcbiAgICAgICAgZHJhZ0NhbmNlbChzdGF0ZSk7XG4gICAgICB9LCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHN0b3AoKTogdm9pZCB7XG4gICAgICByZW5kZXIoKHN0YXRlKSA9PiB7XG4gICAgICAgIGJvYXJkLnN0b3Aoc3RhdGUpO1xuICAgICAgfSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzZXRBdXRvU2hhcGVzKHNoYXBlczogRHJhd1NoYXBlW10pOiB2b2lkIHtcbiAgICAgIHJlbmRlcigoc3RhdGUpID0+IHtcbiAgICAgICAgc3RhdGUuZHJhd2FibGUuYXV0b1NoYXBlcyA9IHNoYXBlcztcbiAgICAgIH0sIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc2V0U2hhcGVzKHNoYXBlczogRHJhd1NoYXBlW10pOiB2b2lkIHtcbiAgICAgIHJlbmRlcigoc3RhdGUpID0+IHtcbiAgICAgICAgc3RhdGUuZHJhd2FibGUuc2hhcGVzID0gc2hhcGVzO1xuICAgICAgfSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzZXRTcXVhcmVIaWdobGlnaHRzKHNxdWFyZXM6IFNxdWFyZUhpZ2hsaWdodFtdKTogdm9pZCB7XG4gICAgICByZW5kZXIoKHN0YXRlKSA9PiB7XG4gICAgICAgIHN0YXRlLmRyYXdhYmxlLnNxdWFyZXMgPSBzcXVhcmVzO1xuICAgICAgfSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBkcmFnTmV3UGllY2UocGllY2UsIGV2ZW50LCBzcGFyZSk6IHZvaWQge1xuICAgICAgZHJhZ05ld1BpZWNlKHN0YXRlLCBwaWVjZSwgZXZlbnQsIHNwYXJlKTtcbiAgICB9LFxuXG4gICAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICAgIGJvYXJkLnN0b3Aoc3RhdGUpO1xuICAgICAgc3RhdGUuZG9tLnVuYmluZCgpO1xuICAgICAgc3RhdGUuZG9tLmRlc3Ryb3llZCA9IHRydWU7XG4gICAgfSxcbiAgfTtcbn1cbiIsICJpbXBvcnQgeyByZW5kZXJIYW5kIH0gZnJvbSAnLi9oYW5kcy5qcyc7XG5pbXBvcnQgeyByZW5kZXIgfSBmcm9tICcuL3JlbmRlci5qcyc7XG5pbXBvcnQgeyByZW5kZXJTaGFwZXMgfSBmcm9tICcuL3NoYXBlcy5qcyc7XG5pbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZWRyYXdTaGFwZXNOb3coc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQ/LnNoYXBlcylcbiAgICByZW5kZXJTaGFwZXMoXG4gICAgICBzdGF0ZSxcbiAgICAgIHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZC5zaGFwZXMuc3ZnLFxuICAgICAgc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkLnNoYXBlcy5jdXN0b21TdmcsXG4gICAgICBzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQuc2hhcGVzLmZyZWVQaWVjZXMsXG4gICAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZHJhd05vdyhzdGF0ZTogU3RhdGUsIHNraXBTaGFwZXM/OiBib29sZWFuKTogdm9pZCB7XG4gIGNvbnN0IGJvYXJkRWxzID0gc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkO1xuICBpZiAoYm9hcmRFbHMpIHtcbiAgICByZW5kZXIoc3RhdGUsIGJvYXJkRWxzKTtcbiAgICBpZiAoIXNraXBTaGFwZXMpIHJlZHJhd1NoYXBlc05vdyhzdGF0ZSk7XG4gIH1cblxuICBjb25zdCBoYW5kRWxzID0gc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzO1xuICBpZiAoaGFuZEVscykge1xuICAgIGlmIChoYW5kRWxzLnRvcCkgcmVuZGVySGFuZChzdGF0ZSwgaGFuZEVscy50b3ApO1xuICAgIGlmIChoYW5kRWxzLmJvdHRvbSkgcmVuZGVySGFuZChzdGF0ZSwgaGFuZEVscy5ib3R0b20pO1xuICB9XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBBbmltQ3VycmVudCB9IGZyb20gJy4vYW5pbS5qcyc7XG5pbXBvcnQgdHlwZSB7IERyYWdDdXJyZW50IH0gZnJvbSAnLi9kcmFnLmpzJztcbmltcG9ydCB0eXBlIHsgRHJhd2FibGUgfSBmcm9tICcuL2RyYXcuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBIZWFkbGVzc1N0YXRlIHtcbiAgcGllY2VzOiBzZy5QaWVjZXM7XG4gIG9yaWVudGF0aW9uOiBzZy5Db2xvcjsgLy8gYm9hcmQgb3JpZW50YXRpb24uIHNlbnRlIHwgZ290ZVxuICBkaW1lbnNpb25zOiBzZy5EaW1lbnNpb25zOyAvLyBib2FyZCBkaW1lbnNpb25zIC0gbWF4IDE2eDE2XG4gIHR1cm5Db2xvcjogc2cuQ29sb3I7IC8vIHR1cm4gdG8gcGxheS4gc2VudGUgfCBnb3RlXG4gIGFjdGl2ZUNvbG9yPzogc2cuQ29sb3IgfCAnYm90aCc7IC8vIGNvbG9yIHRoYXQgY2FuIG1vdmUgb3IgZHJvcC4gc2VudGUgfCBnb3RlIHwgYm90aCB8IHVuZGVmaW5lZFxuICBjaGVja3M/OiBzZy5LZXlbXTsgLy8gc3F1YXJlcyBjdXJyZW50bHkgaW4gY2hlY2sgW1wiNWFcIl1cbiAgbGFzdERlc3RzPzogc2cuS2V5W107IC8vIHNxdWFyZXMgcGFydCBvZiB0aGUgbGFzdCBtb3ZlIG9yIGRyb3AgW1wiMmJcIjsgXCI4aFwiXVxuICBsYXN0UGllY2U/OiBzZy5QaWVjZTsgLy8gcGllY2UgcGFydCBvZiB0aGUgbGFzdCBkcm9wXG4gIHNlbGVjdGVkPzogc2cuS2V5OyAvLyBzcXVhcmUgY3VycmVudGx5IHNlbGVjdGVkIFwiMWFcIlxuICBzZWxlY3RlZFBpZWNlPzogc2cuUGllY2U7IC8vIHBpZWNlIGluIGhhbmQgY3VycmVudGx5IHNlbGVjdGVkXG4gIGhvdmVyZWQ/OiBzZy5LZXk7IC8vIHNxdWFyZSBjdXJyZW50bHkgYmVpbmcgaG92ZXJlZFxuICB2aWV3T25seTogYm9vbGVhbjsgLy8gZG9uJ3QgYmluZCBldmVudHM6IHRoZSB1c2VyIHdpbGwgbmV2ZXIgYmUgYWJsZSB0byBtb3ZlIHBpZWNlcyBhcm91bmRcbiAgc3F1YXJlUmF0aW86IHNnLk51bWJlclBhaXI7IC8vIHJhdGlvIG9mIHRoZSBib2FyZCBbd2lkdGgsIGhlaWdodF1cbiAgZGlzYWJsZUNvbnRleHRNZW51OiBib29sZWFuOyAvLyBiZWNhdXNlIHdobyBuZWVkcyBhIGNvbnRleHQgbWVudSBvbiBhIHNob2dpIGJvYXJkXG4gIGJsb2NrVG91Y2hTY3JvbGw6IGJvb2xlYW47IC8vIGJsb2NrIHNjcm9sbGluZyB2aWEgdG91Y2ggZHJhZ2dpbmcgb24gdGhlIGJvYXJkLCBlLmcuIGZvciBjb29yZGluYXRlIHRyYWluaW5nXG4gIHNjYWxlRG93blBpZWNlczogYm9vbGVhbjtcbiAgY29vcmRpbmF0ZXM6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBpbmNsdWRlIGNvb3JkcyBhdHRyaWJ1dGVzXG4gICAgZmlsZXM6IHNnLk5vdGF0aW9uO1xuICAgIHJhbmtzOiBzZy5Ob3RhdGlvbjtcbiAgfTtcbiAgaGlnaGxpZ2h0OiB7XG4gICAgbGFzdERlc3RzOiBib29sZWFuOyAvLyBhZGQgbGFzdC1kZXN0IGNsYXNzIHRvIHNxdWFyZXMgYW5kIHBpZWNlc1xuICAgIGNoZWNrOiBib29sZWFuOyAvLyBhZGQgY2hlY2sgY2xhc3MgdG8gc3F1YXJlc1xuICAgIGNoZWNrUm9sZXM6IHNnLlJvbGVTdHJpbmdbXTsgLy8gcm9sZXMgdG8gYmUgaGlnaGxpZ2h0ZWQgd2hlbiBjaGVjayBpcyBib29sZWFuIGlzIHBhc3NlZCBmcm9tIGNvbmZpZ1xuICAgIGhvdmVyZWQ6IGJvb2xlYW47IC8vIGFkZCBob3ZlciBjbGFzcyB0byBob3ZlcmVkIHNxdWFyZXNcbiAgfTtcbiAgYW5pbWF0aW9uOiB7IGVuYWJsZWQ6IGJvb2xlYW47IGhhbmRzOiBib29sZWFuOyBkdXJhdGlvbjogbnVtYmVyOyBjdXJyZW50PzogQW5pbUN1cnJlbnQgfTtcbiAgaGFuZHM6IHtcbiAgICBpbmxpbmVkOiBib29sZWFuOyAvLyBhdHRhY2hlcyBzZy1oYW5kcyBkaXJlY3RseSB0byBzZy13cmFwLCBpZ25vcmVzIEhUTUxFbGVtZW50cyBwYXNzZWQgdG8gU2hvZ2lncm91bmRcbiAgICBoYW5kTWFwOiBzZy5IYW5kcztcbiAgICByb2xlczogc2cuUm9sZVN0cmluZ1tdOyAvLyByb2xlcyB0byByZW5kZXIgaW4gc2ctaGFuZFxuICB9O1xuICBtb3ZhYmxlOiB7XG4gICAgZnJlZTogYm9vbGVhbjsgLy8gYWxsIG1vdmVzIGFyZSB2YWxpZCAtIGJvYXJkIGVkaXRvclxuICAgIGRlc3RzPzogc2cuTW92ZURlc3RzOyAvLyB2YWxpZCBtb3Zlcy4ge1wiN2dcIiBbXCI3ZlwiXSBcIjVpXCIgW1wiNGhcIiBcIjVoXCIgXCI2aFwiXX1cbiAgICBzaG93RGVzdHM6IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBkZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBldmVudHM6IHtcbiAgICAgIGFmdGVyPzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tOiBib29sZWFuLCBtZXRhZGF0YTogc2cuTW92ZU1ldGFkYXRhKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIG1vdmUgaGFzIGJlZW4gcGxheWVkXG4gICAgfTtcbiAgfTtcbiAgZHJvcHBhYmxlOiB7XG4gICAgZnJlZTogYm9vbGVhbjsgLy8gYWxsIGRyb3BzIGFyZSB2YWxpZCAtIGJvYXJkIGVkaXRvclxuICAgIGRlc3RzPzogc2cuRHJvcERlc3RzOyAvLyB2YWxpZCBkcm9wcy4ge1wic2VudGUgcGF3blwiIFtcIjNhXCIgXCI0YVwiXSBcInNlbnRlIGxhbmNlXCIgW1wiM2FcIiBcIjNjXCJdfVxuICAgIHNob3dEZXN0czogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIGRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIHNwYXJlOiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIHJlbW92ZSBkcm9wcGVkIHBpZWNlIGZyb20gaGFuZCBhZnRlciBkcm9wIC0gYm9hcmQgZWRpdG9yXG4gICAgZXZlbnRzOiB7XG4gICAgICBhZnRlcj86IChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tOiBib29sZWFuLCBtZXRhZGF0YTogc2cuTW92ZU1ldGFkYXRhKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIGRyb3AgaGFzIGJlZW4gcGxheWVkXG4gICAgfTtcbiAgfTtcbiAgcHJlbW92YWJsZToge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGFsbG93IHByZW1vdmVzIGZvciBjb2xvciB0aGF0IGNhbiBub3QgbW92ZVxuICAgIHNob3dEZXN0czogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIHByZS1kZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBkZXN0cz86IHNnLktleVtdOyAvLyBwcmVtb3ZlIGRlc3RpbmF0aW9ucyBmb3IgdGhlIGN1cnJlbnQgc2VsZWN0aW9uXG4gICAgY3VycmVudD86IHsgb3JpZzogc2cuS2V5OyBkZXN0OiBzZy5LZXk7IHByb206IGJvb2xlYW4gfTtcbiAgICBnZW5lcmF0ZT86IChrZXk6IHNnLktleSwgcGllY2VzOiBzZy5QaWVjZXMpID0+IHNnLktleVtdO1xuICAgIGV2ZW50czoge1xuICAgICAgc2V0PzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tOiBib29sZWFuKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZW1vdmUgaGFzIGJlZW4gc2V0XG4gICAgICB1bnNldD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlbW92ZSBoYXMgYmVlbiB1bnNldFxuICAgIH07XG4gIH07XG4gIHByZWRyb3BwYWJsZToge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGFsbG93IHByZWRyb3BzIGZvciBjb2xvciB0aGF0IGNhbiBub3QgbW92ZVxuICAgIHNob3dEZXN0czogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIHByZS1kZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBkZXN0cz86IHNnLktleVtdOyAvLyBwcmVtb3ZlIGRlc3RpbmF0aW9ucyBmb3IgdGhlIGRyb3Agc2VsZWN0aW9uXG4gICAgY3VycmVudD86IHsgcGllY2U6IHNnLlBpZWNlOyBrZXk6IHNnLktleTsgcHJvbTogYm9vbGVhbiB9O1xuICAgIGdlbmVyYXRlPzogKHBpZWNlOiBzZy5QaWVjZSwgcGllY2VzOiBzZy5QaWVjZXMpID0+IHNnLktleVtdO1xuICAgIGV2ZW50czoge1xuICAgICAgc2V0PzogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb206IGJvb2xlYW4pID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlZHJvcCBoYXMgYmVlbiBzZXRcbiAgICAgIHVuc2V0PzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVkcm9wIGhhcyBiZWVuIHVuc2V0XG4gICAgfTtcbiAgfTtcbiAgZHJhZ2dhYmxlOiB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjsgLy8gYWxsb3cgbW92ZXMgJiBwcmVtb3ZlcyB0byB1c2UgZHJhZyduIGRyb3BcbiAgICBkaXN0YW5jZTogbnVtYmVyOyAvLyBtaW5pbXVtIGRpc3RhbmNlIHRvIGluaXRpYXRlIGEgZHJhZzsgaW4gcGl4ZWxzXG4gICAgYXV0b0Rpc3RhbmNlOiBib29sZWFuOyAvLyBsZXRzIHNob2dpZ3JvdW5kIHNldCBkaXN0YW5jZSB0byB6ZXJvIHdoZW4gdXNlciBkcmFncyBwaWVjZXNcbiAgICBzaG93R2hvc3Q6IGJvb2xlYW47IC8vIHNob3cgZ2hvc3Qgb2YgcGllY2UgYmVpbmcgZHJhZ2dlZFxuICAgIHNob3dUb3VjaFNxdWFyZU92ZXJsYXk6IGJvb2xlYW47IC8vIHNob3cgc3F1YXJlIG92ZXJsYXkgb24gdGhlIHNxdWFyZSB0aGF0IGlzIGN1cnJlbnRseSBiZWluZyBob3ZlcmVkLCB0b3VjaCBvbmx5XG4gICAgZGVsZXRlT25Ecm9wT2ZmOiBib29sZWFuOyAvLyBkZWxldGUgYSBwaWVjZSB3aGVuIGl0IGlzIGRyb3BwZWQgb2ZmIHRoZSBib2FyZCAtIGJvYXJkIGVkaXRvclxuICAgIGFkZFRvSGFuZE9uRHJvcE9mZjogYm9vbGVhbjsgLy8gYWRkIGEgcGllY2UgdG8gaGFuZCB3aGVuIGl0IGlzIGRyb3BwZWQgb24gaXQsIHJlcXVpcmVzIGRlbGV0ZU9uRHJvcE9mZiAtIGJvYXJkIGVkaXRvclxuICAgIGN1cnJlbnQ/OiBEcmFnQ3VycmVudDtcbiAgfTtcbiAgc2VsZWN0YWJsZToge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGRpc2FibGUgdG8gZW5mb3JjZSBkcmFnZ2luZyBvdmVyIGNsaWNrLWNsaWNrIG1vdmVcbiAgICBmb3JjZVNwYXJlczogYm9vbGVhbjsgLy8gYWxsb3cgZHJvcHBpbmcgc3BhcmUgcGllY2VzIGV2ZW4gd2l0aCBzZWxlY3RhYmxlIGRpc2FibGVkXG4gICAgZGVsZXRlT25Ub3VjaDogYm9vbGVhbjsgLy8gc2VsZWN0aW5nIGEgcGllY2Ugb24gdGhlIGJvYXJkIG9yIGluIGhhbmQgd2lsbCByZW1vdmUgaXQgLSBib2FyZCBlZGl0b3JcbiAgICBhZGRTcGFyZXNUb0hhbmQ6IGJvb2xlYW47IC8vIGFkZCBzZWxlY3RlZCBzcGFyZSBwaWVjZSB0byBoYW5kIC0gYm9hcmQgZWRpdG9yXG4gIH07XG4gIHByb21vdGlvbjoge1xuICAgIHByb21vdGVzVG86IChyb2xlOiBzZy5Sb2xlU3RyaW5nKSA9PiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIHVucHJvbW90ZXNUbzogKHJvbGU6IHNnLlJvbGVTdHJpbmcpID0+IHNnLlJvbGVTdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgbW92ZVByb21vdGlvbkRpYWxvZzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KSA9PiBib29sZWFuO1xuICAgIGZvcmNlTW92ZVByb21vdGlvbjogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KSA9PiBib29sZWFuO1xuICAgIGRyb3BQcm9tb3Rpb25EaWFsb2c6IChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5KSA9PiBib29sZWFuO1xuICAgIGZvcmNlRHJvcFByb21vdGlvbjogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXkpID0+IGJvb2xlYW47XG4gICAgY3VycmVudD86IHtcbiAgICAgIHBpZWNlOiBzZy5QaWVjZTtcbiAgICAgIHByb21vdGVkUGllY2U6IHNnLlBpZWNlO1xuICAgICAga2V5OiBzZy5LZXk7XG4gICAgICBkcmFnZ2VkOiBib29sZWFuOyAvLyBubyBhbmltYXRpb25zIHdpdGggZHJhZ1xuICAgIH07XG4gICAgZXZlbnRzOiB7XG4gICAgICBpbml0aWF0ZWQ/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBwcm9tb3Rpb24gZGlhbG9nIGlzIHN0YXJ0ZWRcbiAgICAgIGFmdGVyPzogKHBpZWNlOiBzZy5QaWVjZSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHVzZXIgc2VsZWN0cyBhIHBpZWNlXG4gICAgICBjYW5jZWw/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdXNlciBjYW5jZWxzIHRoZSBzZWxlY3Rpb25cbiAgICB9O1xuICAgIHByZXZQcm9tb3Rpb25IYXNoOiBzdHJpbmc7XG4gIH07XG4gIGZvcnN5dGg6IHtcbiAgICB0b0ZvcnN5dGg/OiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIGZyb21Gb3JzeXRoPzogKHN0cjogc3RyaW5nKSA9PiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkO1xuICB9O1xuICBldmVudHM6IHtcbiAgICBjaGFuZ2U/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHNpdHVhdGlvbiBjaGFuZ2VzIG9uIHRoZSBib2FyZFxuICAgIG1vdmU/OiAob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXksIHByb206IGJvb2xlYW4sIGNhcHR1cmVkUGllY2U/OiBzZy5QaWVjZSkgPT4gdm9pZDtcbiAgICBkcm9wPzogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb206IGJvb2xlYW4pID0+IHZvaWQ7XG4gICAgc2VsZWN0PzogKGtleTogc2cuS2V5KSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBhIHNxdWFyZSBpcyBzZWxlY3RlZFxuICAgIHVuc2VsZWN0PzogKGtleTogc2cuS2V5KSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBhIHNlbGVjdGVkIHNxdWFyZSBpcyBkaXJlY3RseSB1bnNlbGVjdGVkIC0gZHJvcHBlZCBiYWNrIG9yIGNsaWNrZWQgb24gdGhlIG9yaWdpbmFsIHNxdWFyZVxuICAgIHBpZWNlU2VsZWN0PzogKHBpZWNlOiBzZy5QaWVjZSkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gYSBwaWVjZSBpbiBoYW5kIGlzIHNlbGVjdGVkXG4gICAgcGllY2VVbnNlbGVjdD86IChwaWVjZTogc2cuUGllY2UpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIGEgc2VsZWN0ZWQgcGllY2UgaXMgZGlyZWN0bHkgdW5zZWxlY3RlZCAtIGRyb3BwZWQgYmFjayBvciBjbGlja2VkIG9uIHRoZSBzYW1lIHBpZWNlXG4gICAgaW5zZXJ0PzogKGJvYXJkRWxlbWVudHM/OiBzZy5Cb2FyZEVsZW1lbnRzLCBoYW5kRWxlbWVudHM/OiBzZy5IYW5kRWxlbWVudHMpID0+IHZvaWQ7IC8vIHdoZW4gdGhlIGJvYXJkIG9yIGhhbmRzIERPTSBoYXMgYmVlbiAocmUpaW5zZXJ0ZWRcbiAgfTtcbiAgZHJhd2FibGU6IERyYXdhYmxlO1xufVxuZXhwb3J0IGludGVyZmFjZSBTdGF0ZSBleHRlbmRzIEhlYWRsZXNzU3RhdGUge1xuICBkb206IHNnLkRvbTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRzKCk6IEhlYWRsZXNzU3RhdGUge1xuICByZXR1cm4ge1xuICAgIHBpZWNlczogbmV3IE1hcCgpLFxuICAgIGRpbWVuc2lvbnM6IHsgZmlsZXM6IDksIHJhbmtzOiA5IH0sXG4gICAgb3JpZW50YXRpb246ICdzZW50ZScsXG4gICAgdHVybkNvbG9yOiAnc2VudGUnLFxuICAgIGFjdGl2ZUNvbG9yOiAnYm90aCcsXG4gICAgdmlld09ubHk6IGZhbHNlLFxuICAgIHNxdWFyZVJhdGlvOiBbMTEsIDEyXSxcbiAgICBkaXNhYmxlQ29udGV4dE1lbnU6IHRydWUsXG4gICAgYmxvY2tUb3VjaFNjcm9sbDogZmFsc2UsXG4gICAgc2NhbGVEb3duUGllY2VzOiB0cnVlLFxuICAgIGNvb3JkaW5hdGVzOiB7IGVuYWJsZWQ6IHRydWUsIGZpbGVzOiAnbnVtZXJpYycsIHJhbmtzOiAnbnVtZXJpYycgfSxcbiAgICBoaWdobGlnaHQ6IHsgbGFzdERlc3RzOiB0cnVlLCBjaGVjazogdHJ1ZSwgY2hlY2tSb2xlczogWydraW5nJ10sIGhvdmVyZWQ6IGZhbHNlIH0sXG4gICAgYW5pbWF0aW9uOiB7IGVuYWJsZWQ6IHRydWUsIGhhbmRzOiB0cnVlLCBkdXJhdGlvbjogMjUwIH0sXG4gICAgaGFuZHM6IHtcbiAgICAgIGlubGluZWQ6IGZhbHNlLFxuICAgICAgaGFuZE1hcDogbmV3IE1hcDxzZy5Db2xvciwgc2cuSGFuZD4oW1xuICAgICAgICBbJ3NlbnRlJywgbmV3IE1hcCgpXSxcbiAgICAgICAgWydnb3RlJywgbmV3IE1hcCgpXSxcbiAgICAgIF0pLFxuICAgICAgcm9sZXM6IFsncm9vaycsICdiaXNob3AnLCAnZ29sZCcsICdzaWx2ZXInLCAna25pZ2h0JywgJ2xhbmNlJywgJ3Bhd24nXSxcbiAgICB9LFxuICAgIG1vdmFibGU6IHsgZnJlZTogdHJ1ZSwgc2hvd0Rlc3RzOiB0cnVlLCBldmVudHM6IHt9IH0sXG4gICAgZHJvcHBhYmxlOiB7IGZyZWU6IHRydWUsIHNob3dEZXN0czogdHJ1ZSwgc3BhcmU6IGZhbHNlLCBldmVudHM6IHt9IH0sXG4gICAgcHJlbW92YWJsZTogeyBlbmFibGVkOiB0cnVlLCBzaG93RGVzdHM6IHRydWUsIGV2ZW50czoge30gfSxcbiAgICBwcmVkcm9wcGFibGU6IHsgZW5hYmxlZDogdHJ1ZSwgc2hvd0Rlc3RzOiB0cnVlLCBldmVudHM6IHt9IH0sXG4gICAgZHJhZ2dhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgZGlzdGFuY2U6IDMsXG4gICAgICBhdXRvRGlzdGFuY2U6IHRydWUsXG4gICAgICBzaG93R2hvc3Q6IHRydWUsXG4gICAgICBzaG93VG91Y2hTcXVhcmVPdmVybGF5OiB0cnVlLFxuICAgICAgZGVsZXRlT25Ecm9wT2ZmOiBmYWxzZSxcbiAgICAgIGFkZFRvSGFuZE9uRHJvcE9mZjogZmFsc2UsXG4gICAgfSxcbiAgICBzZWxlY3RhYmxlOiB7IGVuYWJsZWQ6IHRydWUsIGZvcmNlU3BhcmVzOiBmYWxzZSwgZGVsZXRlT25Ub3VjaDogZmFsc2UsIGFkZFNwYXJlc1RvSGFuZDogZmFsc2UgfSxcbiAgICBwcm9tb3Rpb246IHtcbiAgICAgIG1vdmVQcm9tb3Rpb25EaWFsb2c6ICgpID0+IGZhbHNlLFxuICAgICAgZm9yY2VNb3ZlUHJvbW90aW9uOiAoKSA9PiBmYWxzZSxcbiAgICAgIGRyb3BQcm9tb3Rpb25EaWFsb2c6ICgpID0+IGZhbHNlLFxuICAgICAgZm9yY2VEcm9wUHJvbW90aW9uOiAoKSA9PiBmYWxzZSxcbiAgICAgIHByb21vdGVzVG86ICgpID0+IHVuZGVmaW5lZCxcbiAgICAgIHVucHJvbW90ZXNUbzogKCkgPT4gdW5kZWZpbmVkLFxuICAgICAgZXZlbnRzOiB7fSxcbiAgICAgIHByZXZQcm9tb3Rpb25IYXNoOiAnJyxcbiAgICB9LFxuICAgIGZvcnN5dGg6IHt9LFxuICAgIGV2ZW50czoge30sXG4gICAgZHJhd2FibGU6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsIC8vIGNhbiBkcmF3XG4gICAgICB2aXNpYmxlOiB0cnVlLCAvLyBjYW4gdmlld1xuICAgICAgZm9yY2VkOiBmYWxzZSwgLy8gY2FuIG9ubHkgZHJhd1xuICAgICAgZXJhc2VPbkNsaWNrOiB0cnVlLFxuICAgICAgc2hhcGVzOiBbXSxcbiAgICAgIGF1dG9TaGFwZXM6IFtdLFxuICAgICAgc3F1YXJlczogW10sXG4gICAgICBwcmV2U3ZnSGFzaDogJycsXG4gICAgfSxcbiAgfTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IEFwaSB9IGZyb20gJy4vYXBpLmpzJztcbmltcG9ydCB7IHN0YXJ0IH0gZnJvbSAnLi9hcGkuanMnO1xuaW1wb3J0IHR5cGUgeyBDb25maWcgfSBmcm9tICcuL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBjb25maWd1cmUgfSBmcm9tICcuL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyByZWRyYXdBbGwgfSBmcm9tICcuL2RvbS5qcyc7XG5pbXBvcnQgeyBiaW5kRG9jdW1lbnQgfSBmcm9tICcuL2V2ZW50cy5qcyc7XG5pbXBvcnQgeyByZWRyYXdOb3csIHJlZHJhd1NoYXBlc05vdyB9IGZyb20gJy4vcmVkcmF3LmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB7IGRlZmF1bHRzIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSB7IERPTVJlY3RNYXAsIFBpZWNlTmFtZSwgUGllY2VOb2RlLCBXcmFwRWxlbWVudHMgfSBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIFNob2dpZ3JvdW5kKGNvbmZpZz86IENvbmZpZywgd3JhcEVsZW1lbnRzPzogV3JhcEVsZW1lbnRzKTogQXBpIHtcbiAgY29uc3Qgc3RhdGUgPSBkZWZhdWx0cygpIGFzIFN0YXRlO1xuICBjb25maWd1cmUoc3RhdGUsIGNvbmZpZyB8fCB7fSk7XG5cbiAgY29uc3QgcmVkcmF3U3RhdGVOb3cgPSAoc2tpcFNoYXBlcz86IGJvb2xlYW4pID0+IHtcbiAgICByZWRyYXdOb3coc3RhdGUsIHNraXBTaGFwZXMpO1xuICB9O1xuXG4gIHN0YXRlLmRvbSA9IHtcbiAgICB3cmFwRWxlbWVudHM6IHdyYXBFbGVtZW50cyB8fCB7fSxcbiAgICBlbGVtZW50czoge30sXG4gICAgYm91bmRzOiB7XG4gICAgICBib2FyZDoge1xuICAgICAgICBib3VuZHM6IHV0aWwubWVtbygoKSA9PiBzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQ/LnBpZWNlcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSksXG4gICAgICB9LFxuICAgICAgaGFuZHM6IHtcbiAgICAgICAgYm91bmRzOiB1dGlsLm1lbW8oKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGhhbmRzUmVjdHM6IERPTVJlY3RNYXA8J3RvcCcgfCAnYm90dG9tJz4gPSBuZXcgTWFwKCk7XG4gICAgICAgICAgY29uc3QgaGFuZEVscyA9IHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcztcbiAgICAgICAgICBpZiAoaGFuZEVscz8udG9wKSBoYW5kc1JlY3RzLnNldCgndG9wJywgaGFuZEVscy50b3AuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpO1xuICAgICAgICAgIGlmIChoYW5kRWxzPy5ib3R0b20pIGhhbmRzUmVjdHMuc2V0KCdib3R0b20nLCBoYW5kRWxzLmJvdHRvbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSk7XG4gICAgICAgICAgcmV0dXJuIGhhbmRzUmVjdHM7XG4gICAgICAgIH0pLFxuICAgICAgICBwaWVjZUJvdW5kczogdXRpbC5tZW1vKCgpID0+IHtcbiAgICAgICAgICBjb25zdCBoYW5kUGllY2VzUmVjdHM6IERPTVJlY3RNYXA8UGllY2VOYW1lPiA9IG5ldyBNYXAoKTtcbiAgICAgICAgICBjb25zdCBoYW5kRWxzID0gc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzO1xuXG4gICAgICAgICAgaWYgKGhhbmRFbHM/LnRvcCkge1xuICAgICAgICAgICAgbGV0IHdyYXBFbCA9IGhhbmRFbHMudG9wLmZpcnN0RWxlbWVudENoaWxkIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgd2hpbGUgKHdyYXBFbCkge1xuICAgICAgICAgICAgICBjb25zdCBwaWVjZUVsID0gd3JhcEVsLmZpcnN0RWxlbWVudENoaWxkIGFzIFBpZWNlTm9kZTtcbiAgICAgICAgICAgICAgY29uc3QgcGllY2UgPSB7IHJvbGU6IHBpZWNlRWwuc2dSb2xlLCBjb2xvcjogcGllY2VFbC5zZ0NvbG9yIH07XG4gICAgICAgICAgICAgIGhhbmRQaWVjZXNSZWN0cy5zZXQodXRpbC5waWVjZU5hbWVPZihwaWVjZSksIHBpZWNlRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpO1xuICAgICAgICAgICAgICB3cmFwRWwgPSB3cmFwRWwubmV4dEVsZW1lbnRTaWJsaW5nIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaGFuZEVscz8uYm90dG9tKSB7XG4gICAgICAgICAgICBsZXQgd3JhcEVsID0gaGFuZEVscy5ib3R0b20uZmlyc3RFbGVtZW50Q2hpbGQgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICB3aGlsZSAod3JhcEVsKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHBpZWNlRWwgPSB3cmFwRWwuZmlyc3RFbGVtZW50Q2hpbGQgYXMgUGllY2VOb2RlO1xuICAgICAgICAgICAgICBjb25zdCBwaWVjZSA9IHsgcm9sZTogcGllY2VFbC5zZ1JvbGUsIGNvbG9yOiBwaWVjZUVsLnNnQ29sb3IgfTtcbiAgICAgICAgICAgICAgaGFuZFBpZWNlc1JlY3RzLnNldCh1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKSwgcGllY2VFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSk7XG4gICAgICAgICAgICAgIHdyYXBFbCA9IHdyYXBFbC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBoYW5kUGllY2VzUmVjdHM7XG4gICAgICAgIH0pLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHJlZHJhd05vdzogcmVkcmF3U3RhdGVOb3csXG4gICAgcmVkcmF3OiBkZWJvdW5jZVJlZHJhdyhyZWRyYXdTdGF0ZU5vdyksXG4gICAgcmVkcmF3U2hhcGVzOiBkZWJvdW5jZVJlZHJhdygoKSA9PiByZWRyYXdTaGFwZXNOb3coc3RhdGUpKSxcbiAgICB1bmJpbmQ6IGJpbmREb2N1bWVudChzdGF0ZSksXG4gICAgZGVzdHJveWVkOiBmYWxzZSxcbiAgfTtcblxuICBpZiAod3JhcEVsZW1lbnRzKSByZWRyYXdBbGwod3JhcEVsZW1lbnRzLCBzdGF0ZSk7XG5cbiAgcmV0dXJuIHN0YXJ0KHN0YXRlKTtcbn1cblxuZnVuY3Rpb24gZGVib3VuY2VSZWRyYXcoZjogKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkKTogKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkIHtcbiAgbGV0IHJlZHJhd2luZyA9IGZhbHNlO1xuICByZXR1cm4gKC4uLmFyZ3M6IGFueVtdKSA9PiB7XG4gICAgaWYgKHJlZHJhd2luZykgcmV0dXJuO1xuICAgIHJlZHJhd2luZyA9IHRydWU7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIGYoLi4uYXJncyk7XG4gICAgICByZWRyYXdpbmcgPSBmYWxzZTtcbiAgICB9KTtcbiAgfTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNFTyxNQUFNLFNBQVMsQ0FBQyxTQUFTLE1BQU07QUFFL0IsTUFBTSxRQUFRO0FBQUEsSUFDbkI7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQ08sTUFBTSxRQUFRO0FBQUEsSUFDbkI7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBRU8sTUFBTSxVQUEwQixNQUFNLFVBQVU7QUFBQSxJQUNyRCxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sTUFBTSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztBQUFBLEVBQzdDOzs7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QjtBQUFBLFlBQ0Y7QUFDQSxnQkFBSSxtQ0FBUyxRQUFRO0FBQ25CLGtCQUFJLFNBQVMsUUFBUSxPQUFPO0FBQzVCLHFCQUFPLFFBQVE7QUFDYixzQkFBTSxVQUFVLE9BQU87QUFDdkIsc0JBQU0sUUFBUSxFQUFFLE1BQU0sUUFBUSxRQUFRLE9BQU8sUUFBUSxRQUFRO0FBQzdELGdDQUFnQixJQUFTLFlBQVksS0FBSyxHQUFHLFFBQVEsc0JBQXNCLENBQUM7QUFDNUUseUJBQVMsT0FBTztBQUFBLGNBQ2xCO0FBQUEsWUFDRjtBQUNBLG1CQUFPO0FBQUEsVUFDVCxDQUFDO0FBQUEsUUFDSDtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFdBQVc7QUFBQSxNQUNYLFFBQVEsZUFBZSxjQUFjO0FBQUEsTUFDckMsY0FBYyxlQUFlLE1BQU0sZ0JBQWdCLEtBQUssQ0FBQztBQUFBLE1BQ3pELFFBQVEsYUFBYSxLQUFLO0FBQUEsTUFDMUIsV0FBVztBQUFBLElBQ2I7QUFFQSxRQUFJLGFBQWMsV0FBVSxjQUFjLEtBQUs7QUFFL0MsV0FBT0MsT0FBTSxLQUFLO0FBQUEsRUFDcEI7QUFFQSxXQUFTLGVBQWUsR0FBdUQ7QUFDN0UsUUFBSSxZQUFZO0FBQ2hCLFdBQU8sSUFBSSxTQUFnQjtBQUN6QixVQUFJLFVBQVc7QUFDZixrQkFBWTtBQUNaLDRCQUFzQixNQUFNO0FBQzFCLFVBQUUsR0FBRyxJQUFJO0FBQ1Qsb0JBQVk7QUFBQSxNQUNkLENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRjs7O0FuQmpGQSxNQUFPLGdCQUFROyIsCiAgIm5hbWVzIjogWyJub3ciLCAibW92ZSIsICJyYW5rcyIsICJicnVzaGVzIiwgImVsIiwgImRlc3QiLCAic3RhcnQiLCAiY2FuY2VsIiwgIm1vdmUiLCAiZW5kIiwgInVuc2VsZWN0IiwgIm1vdmUiLCAiZW5kIiwgImNhbmNlbCIsICJzdGFydCIsICJzIiwgInJlbmRlciIsICJhbmltIiwgImsiLCAicmFua3MiLCAiZmlsZXMiLCAicmVuZGVySGFuZCIsICJyZW5kZXIiLCAic3RhcnQiLCAic3RhdGUiLCAiY2FuY2VsIiwgInJlbmRlciIsICJzdGFydCJdCn0K
