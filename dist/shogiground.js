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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2luZGV4LnRzIiwgIi4uL3NyYy9jb25zdGFudHMudHMiLCAiLi4vc3JjL3V0aWwudHMiLCAiLi4vc3JjL2FuaW0udHMiLCAiLi4vc3JjL2hhbmRzLnRzIiwgIi4uL3NyYy9ib2FyZC50cyIsICIuLi9zcmMvc2Zlbi50cyIsICIuLi9zcmMvY29uZmlnLnRzIiwgIi4uL3NyYy9zaGFwZXMudHMiLCAiLi4vc3JjL2RyYXcudHMiLCAiLi4vc3JjL2RyYWcudHMiLCAiLi4vc3JjL2V2ZW50cy50cyIsICIuLi9zcmMvcmVuZGVyLnRzIiwgIi4uL3NyYy9jb29yZHMudHMiLCAiLi4vc3JjL3dyYXAudHMiLCAiLi4vc3JjL2RvbS50cyIsICIuLi9zcmMvYXBpLnRzIiwgIi4uL3NyYy9yZWRyYXcudHMiLCAiLi4vc3JjL3N0YXRlLnRzIiwgIi4uL3NyYy9zaG9naWdyb3VuZC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgU2hvZ2lncm91bmQgfSBmcm9tICcuL3Nob2dpZ3JvdW5kLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgU2hvZ2lncm91bmQ7XG4iLCAiaW1wb3J0IHR5cGUgeyBLZXkgfSBmcm9tICcuL3R5cGVzLmpzJztcblxuZXhwb3J0IGNvbnN0IGNvbG9ycyA9IFsnc2VudGUnLCAnZ290ZSddIGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgZmlsZXMgPSBbXG4gICcxJyxcbiAgJzInLFxuICAnMycsXG4gICc0JyxcbiAgJzUnLFxuICAnNicsXG4gICc3JyxcbiAgJzgnLFxuICAnOScsXG4gICcxMCcsXG4gICcxMScsXG4gICcxMicsXG4gICcxMycsXG4gICcxNCcsXG4gICcxNScsXG4gICcxNicsXG5dIGFzIGNvbnN0O1xuZXhwb3J0IGNvbnN0IHJhbmtzID0gW1xuICAnYScsXG4gICdiJyxcbiAgJ2MnLFxuICAnZCcsXG4gICdlJyxcbiAgJ2YnLFxuICAnZycsXG4gICdoJyxcbiAgJ2knLFxuICAnaicsXG4gICdrJyxcbiAgJ2wnLFxuICAnbScsXG4gICduJyxcbiAgJ28nLFxuICAncCcsXG5dIGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgYWxsS2V5czogcmVhZG9ubHkgS2V5W10gPSBBcnJheS5wcm90b3R5cGUuY29uY2F0KFxuICAuLi5yYW5rcy5tYXAoKHIpID0+IGZpbGVzLm1hcCgoZikgPT4gZiArIHIpKSxcbik7XG5cbmV4cG9ydCBjb25zdCBub3RhdGlvbnMgPSBbJ251bWVyaWMnLCAnamFwYW5lc2UnLCAnZW5naW5lJywgJ2hleCcsICdkaXpoaSddIGFzIGNvbnN0O1xuIiwgImltcG9ydCB7IGFsbEtleXMsIGNvbG9ycyB9IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5cbmV4cG9ydCBjb25zdCBwb3Mya2V5ID0gKHBvczogc2cuUG9zKTogc2cuS2V5ID0+IGFsbEtleXNbcG9zWzBdICsgMTYgKiBwb3NbMV1dO1xuXG5leHBvcnQgY29uc3Qga2V5MnBvcyA9IChrOiBzZy5LZXkpOiBzZy5Qb3MgPT4ge1xuICBpZiAoay5sZW5ndGggPiAyKSByZXR1cm4gW2suY2hhckNvZGVBdCgxKSAtIDM5LCBrLmNoYXJDb2RlQXQoMikgLSA5N107XG4gIGVsc2UgcmV0dXJuIFtrLmNoYXJDb2RlQXQoMCkgLSA0OSwgay5jaGFyQ29kZUF0KDEpIC0gOTddO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIG1lbW88QT4oZjogKCkgPT4gQSk6IHNnLk1lbW88QT4ge1xuICBsZXQgdjogQSB8IHVuZGVmaW5lZDtcbiAgY29uc3QgcmV0ID0gKCk6IEEgPT4ge1xuICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHYgPSBmKCk7XG4gICAgcmV0dXJuIHY7XG4gIH07XG4gIHJldC5jbGVhciA9ICgpID0+IHtcbiAgICB2ID0gdW5kZWZpbmVkO1xuICB9O1xuICByZXR1cm4gcmV0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FsbFVzZXJGdW5jdGlvbjxUIGV4dGVuZHMgKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPihcbiAgZjogVCB8IHVuZGVmaW5lZCxcbiAgLi4uYXJnczogUGFyYW1ldGVyczxUPlxuKTogdm9pZCB7XG4gIGlmIChmKSBzZXRUaW1lb3V0KCgpID0+IGYoLi4uYXJncyksIDEpO1xufVxuXG5leHBvcnQgY29uc3Qgb3Bwb3NpdGUgPSAoYzogc2cuQ29sb3IpOiBzZy5Db2xvciA9PiAoYyA9PT0gJ3NlbnRlJyA/ICdnb3RlJyA6ICdzZW50ZScpO1xuXG5leHBvcnQgY29uc3Qgc2VudGVQb3YgPSAobzogc2cuQ29sb3IpOiBib29sZWFuID0+IG8gPT09ICdzZW50ZSc7XG5cbmV4cG9ydCBjb25zdCBkaXN0YW5jZVNxID0gKHBvczE6IHNnLlBvcywgcG9zMjogc2cuUG9zKTogbnVtYmVyID0+IHtcbiAgY29uc3QgZHggPSBwb3MxWzBdIC0gcG9zMlswXTtcbiAgY29uc3QgZHkgPSBwb3MxWzFdIC0gcG9zMlsxXTtcbiAgcmV0dXJuIGR4ICogZHggKyBkeSAqIGR5O1xufTtcblxuZXhwb3J0IGNvbnN0IHNhbWVQaWVjZSA9IChwMTogc2cuUGllY2UsIHAyOiBzZy5QaWVjZSk6IGJvb2xlYW4gPT5cbiAgcDEucm9sZSA9PT0gcDIucm9sZSAmJiBwMS5jb2xvciA9PT0gcDIuY29sb3I7XG5cbmNvbnN0IHBvc1RvVHJhbnNsYXRlQmFzZSA9IChcbiAgcG9zOiBzZy5Qb3MsXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGFzU2VudGU6IGJvb2xlYW4sXG4gIHhGYWN0b3I6IG51bWJlcixcbiAgeUZhY3RvcjogbnVtYmVyLFxuKTogc2cuTnVtYmVyUGFpciA9PiBbXG4gIChhc1NlbnRlID8gZGltcy5maWxlcyAtIDEgLSBwb3NbMF0gOiBwb3NbMF0pICogeEZhY3RvcixcbiAgKGFzU2VudGUgPyBwb3NbMV0gOiBkaW1zLnJhbmtzIC0gMSAtIHBvc1sxXSkgKiB5RmFjdG9yLFxuXTtcblxuZXhwb3J0IGNvbnN0IHBvc1RvVHJhbnNsYXRlQWJzID0gKFxuICBkaW1zOiBzZy5EaW1lbnNpb25zLFxuICBib3VuZHM6IERPTVJlY3QsXG4pOiAoKHBvczogc2cuUG9zLCBhc1NlbnRlOiBib29sZWFuKSA9PiBzZy5OdW1iZXJQYWlyKSA9PiB7XG4gIGNvbnN0IHhGYWN0b3IgPSBib3VuZHMud2lkdGggLyBkaW1zLmZpbGVzO1xuICBjb25zdCB5RmFjdG9yID0gYm91bmRzLmhlaWdodCAvIGRpbXMucmFua3M7XG4gIHJldHVybiAocG9zLCBhc1NlbnRlKSA9PiBwb3NUb1RyYW5zbGF0ZUJhc2UocG9zLCBkaW1zLCBhc1NlbnRlLCB4RmFjdG9yLCB5RmFjdG9yKTtcbn07XG5cbmV4cG9ydCBjb25zdCBwb3NUb1RyYW5zbGF0ZVJlbCA9XG4gIChkaW1zOiBzZy5EaW1lbnNpb25zKTogKChwb3M6IHNnLlBvcywgYXNTZW50ZTogYm9vbGVhbikgPT4gc2cuTnVtYmVyUGFpcikgPT5cbiAgKHBvcywgYXNTZW50ZSkgPT5cbiAgICBwb3NUb1RyYW5zbGF0ZUJhc2UocG9zLCBkaW1zLCBhc1NlbnRlLCAxMDAsIDEwMCk7XG5cbmV4cG9ydCBjb25zdCB0cmFuc2xhdGVBYnMgPSAoZWw6IEhUTUxFbGVtZW50LCBwb3M6IHNnLk51bWJlclBhaXIsIHNjYWxlOiBudW1iZXIpOiB2b2lkID0+IHtcbiAgZWwuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke3Bvc1swXX1weCwke3Bvc1sxXX1weCkgc2NhbGUoJHtzY2FsZX1gO1xufTtcblxuZXhwb3J0IGNvbnN0IHRyYW5zbGF0ZVJlbCA9IChcbiAgZWw6IEhUTUxFbGVtZW50LFxuICBwZXJjZW50czogc2cuTnVtYmVyUGFpcixcbiAgc2NhbGVGYWN0b3I6IG51bWJlcixcbiAgc2NhbGU/OiBudW1iZXIsXG4pOiB2b2lkID0+IHtcbiAgZWwuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke3BlcmNlbnRzWzBdICogc2NhbGVGYWN0b3J9JSwke3BlcmNlbnRzWzFdICogc2NhbGVGYWN0b3J9JSkgc2NhbGUoJHtcbiAgICBzY2FsZSB8fCBzY2FsZUZhY3RvclxuICB9KWA7XG59O1xuXG5leHBvcnQgY29uc3Qgc2V0RGlzcGxheSA9IChlbDogSFRNTEVsZW1lbnQsIHY6IGJvb2xlYW4pOiB2b2lkID0+IHtcbiAgZWwuc3R5bGUuZGlzcGxheSA9IHYgPyAnJyA6ICdub25lJztcbn07XG5cbmNvbnN0IGlzTW91c2VFdmVudCA9IChlOiBzZy5Nb3VjaEV2ZW50KTogZSBpcyBFdmVudCAmIE1vdXNlRXZlbnQgPT4ge1xuICByZXR1cm4gISFlLmNsaWVudFggfHwgZS5jbGllbnRYID09PSAwO1xufTtcblxuZXhwb3J0IGNvbnN0IGV2ZW50UG9zaXRpb24gPSAoZTogc2cuTW91Y2hFdmVudCk6IHNnLk51bWJlclBhaXIgfCB1bmRlZmluZWQgPT4ge1xuICBpZiAoaXNNb3VzZUV2ZW50KGUpKSByZXR1cm4gW2UuY2xpZW50WCwgZS5jbGllbnRZXTtcbiAgaWYgKGUudGFyZ2V0VG91Y2hlcz8uWzBdKSByZXR1cm4gW2UudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRYLCBlLnRhcmdldFRvdWNoZXNbMF0uY2xpZW50WV07XG4gIHJldHVybjsgLy8gdG91Y2hlbmQgaGFzIG5vIHBvc2l0aW9uIVxufTtcblxuZXhwb3J0IGNvbnN0IGlzUmlnaHRCdXR0b24gPSAoZTogc2cuTW91Y2hFdmVudCk6IGJvb2xlYW4gPT4gZS5idXR0b25zID09PSAyIHx8IGUuYnV0dG9uID09PSAyO1xuXG5leHBvcnQgY29uc3QgaXNNaWRkbGVCdXR0b24gPSAoZTogc2cuTW91Y2hFdmVudCk6IGJvb2xlYW4gPT4gZS5idXR0b25zID09PSA0IHx8IGUuYnV0dG9uID09PSAxO1xuXG5leHBvcnQgY29uc3QgY3JlYXRlRWwgPSAodGFnTmFtZTogc3RyaW5nLCBjbGFzc05hbWU/OiBzdHJpbmcpOiBIVE1MRWxlbWVudCA9PiB7XG4gIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcbiAgaWYgKGNsYXNzTmFtZSkgZWwuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xuICByZXR1cm4gZWw7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gcGllY2VOYW1lT2YocGllY2U6IHNnLlBpZWNlKTogc2cuUGllY2VOYW1lIHtcbiAgcmV0dXJuIGAke3BpZWNlLmNvbG9yfSAke3BpZWNlLnJvbGV9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUGllY2VOYW1lKHBpZWNlTmFtZTogc2cuUGllY2VOYW1lKTogc2cuUGllY2Uge1xuICBjb25zdCBzcGxpdHRlZCA9IHBpZWNlTmFtZS5zcGxpdCgnICcsIDIpO1xuICByZXR1cm4geyBjb2xvcjogc3BsaXR0ZWRbMF0gYXMgc2cuQ29sb3IsIHJvbGU6IHNwbGl0dGVkWzFdIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1BpZWNlTm9kZShlbDogSFRNTEVsZW1lbnQpOiBlbCBpcyBzZy5QaWVjZU5vZGUge1xuICByZXR1cm4gZWwudGFnTmFtZSA9PT0gJ1BJRUNFJztcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc1NxdWFyZU5vZGUoZWw6IEhUTUxFbGVtZW50KTogZWwgaXMgc2cuU3F1YXJlTm9kZSB7XG4gIHJldHVybiBlbC50YWdOYW1lID09PSAnU1EnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZVNxdWFyZUNlbnRlcihcbiAga2V5OiBzZy5LZXksXG4gIGFzU2VudGU6IGJvb2xlYW4sXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGJvdW5kczogRE9NUmVjdCxcbik6IHNnLk51bWJlclBhaXIge1xuICBjb25zdCBwb3MgPSBrZXkycG9zKGtleSk7XG4gIGlmIChhc1NlbnRlKSB7XG4gICAgcG9zWzBdID0gZGltcy5maWxlcyAtIDEgLSBwb3NbMF07XG4gICAgcG9zWzFdID0gZGltcy5yYW5rcyAtIDEgLSBwb3NbMV07XG4gIH1cbiAgcmV0dXJuIFtcbiAgICBib3VuZHMubGVmdCArIChib3VuZHMud2lkdGggKiBwb3NbMF0pIC8gZGltcy5maWxlcyArIGJvdW5kcy53aWR0aCAvIChkaW1zLmZpbGVzICogMiksXG4gICAgYm91bmRzLnRvcCArXG4gICAgICAoYm91bmRzLmhlaWdodCAqIChkaW1zLnJhbmtzIC0gMSAtIHBvc1sxXSkpIC8gZGltcy5yYW5rcyArXG4gICAgICBib3VuZHMuaGVpZ2h0IC8gKGRpbXMucmFua3MgKiAyKSxcbiAgXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRvbVNxdWFyZUluZGV4T2ZLZXkoa2V5OiBzZy5LZXksIGFzU2VudGU6IGJvb2xlYW4sIGRpbXM6IHNnLkRpbWVuc2lvbnMpOiBudW1iZXIge1xuICBjb25zdCBwb3MgPSBrZXkycG9zKGtleSk7XG4gIGxldCBpbmRleCA9IGRpbXMuZmlsZXMgLSAxIC0gcG9zWzBdICsgcG9zWzFdICogZGltcy5maWxlcztcbiAgaWYgKCFhc1NlbnRlKSBpbmRleCA9IGRpbXMuZmlsZXMgKiBkaW1zLnJhbmtzIC0gMSAtIGluZGV4O1xuXG4gIHJldHVybiBpbmRleDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSW5zaWRlUmVjdChyZWN0OiBET01SZWN0LCBwb3M6IHNnLk51bWJlclBhaXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICByZWN0LmxlZnQgPD0gcG9zWzBdICYmXG4gICAgcmVjdC50b3AgPD0gcG9zWzFdICYmXG4gICAgcmVjdC5sZWZ0ICsgcmVjdC53aWR0aCA+IHBvc1swXSAmJlxuICAgIHJlY3QudG9wICsgcmVjdC5oZWlnaHQgPiBwb3NbMV1cbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTmVhclJlY3QocmVjdDogRE9NUmVjdCwgcG9zOiBzZy5OdW1iZXJQYWlyLCByOiBudW1iZXIpOiBib29sZWFuIHtcbiAgY29uc3QgW3gsIHldID0gcG9zO1xuXG4gIGNvbnN0IGNsb3Nlc3RYID0gTWF0aC5tYXgocmVjdC5sZWZ0LCBNYXRoLm1pbih4LCByZWN0LnJpZ2h0KSk7XG4gIGNvbnN0IGNsb3Nlc3RZID0gTWF0aC5tYXgocmVjdC50b3AsIE1hdGgubWluKHksIHJlY3QuYm90dG9tKSk7XG5cbiAgY29uc3QgZHggPSB4IC0gY2xvc2VzdFg7XG4gIGNvbnN0IGR5ID0geSAtIGNsb3Nlc3RZO1xuXG4gIHJldHVybiBkeCAqIGR4ICsgZHkgKiBkeSA8PSByICogcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEtleUF0RG9tUG9zKFxuICBwb3M6IHNnLk51bWJlclBhaXIsXG4gIGFzU2VudGU6IGJvb2xlYW4sXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGJvdW5kczogRE9NUmVjdCxcbik6IHNnLktleSB8IHVuZGVmaW5lZCB7XG4gIGxldCBmaWxlID0gTWF0aC5mbG9vcigoZGltcy5maWxlcyAqIChwb3NbMF0gLSBib3VuZHMubGVmdCkpIC8gYm91bmRzLndpZHRoKTtcbiAgaWYgKGFzU2VudGUpIGZpbGUgPSBkaW1zLmZpbGVzIC0gMSAtIGZpbGU7XG4gIGxldCByYW5rID0gTWF0aC5mbG9vcigoZGltcy5yYW5rcyAqIChwb3NbMV0gLSBib3VuZHMudG9wKSkgLyBib3VuZHMuaGVpZ2h0KTtcbiAgaWYgKCFhc1NlbnRlKSByYW5rID0gZGltcy5yYW5rcyAtIDEgLSByYW5rO1xuICByZXR1cm4gZmlsZSA+PSAwICYmIGZpbGUgPCBkaW1zLmZpbGVzICYmIHJhbmsgPj0gMCAmJiByYW5rIDwgZGltcy5yYW5rc1xuICAgID8gcG9zMmtleShbZmlsZSwgcmFua10pXG4gICAgOiB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRIYW5kUGllY2VBdERvbVBvcyhcbiAgcG9zOiBzZy5OdW1iZXJQYWlyLFxuICByb2xlczogc2cuUm9sZVN0cmluZ1tdLFxuICBib3VuZHM6IE1hcDxzZy5QaWVjZU5hbWUsIERPTVJlY3Q+LFxuKTogc2cuUGllY2UgfCB1bmRlZmluZWQge1xuICBmb3IgKGNvbnN0IGNvbG9yIG9mIGNvbG9ycykge1xuICAgIGZvciAoY29uc3Qgcm9sZSBvZiByb2xlcykge1xuICAgICAgY29uc3QgcGllY2UgPSB7IGNvbG9yLCByb2xlIH07XG4gICAgICBjb25zdCBwaWVjZVJlY3QgPSBib3VuZHMuZ2V0KHBpZWNlTmFtZU9mKHBpZWNlKSk7XG4gICAgICBpZiAocGllY2VSZWN0ICYmIGlzSW5zaWRlUmVjdChwaWVjZVJlY3QsIHBvcykpIHJldHVybiBwaWVjZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcG9zT2ZPdXRzaWRlRWwoXG4gIGxlZnQ6IG51bWJlcixcbiAgdG9wOiBudW1iZXIsXG4gIGFzU2VudGU6IGJvb2xlYW4sXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGJvYXJkQm91bmRzOiBET01SZWN0LFxuKTogc2cuUG9zIHwgdW5kZWZpbmVkIHtcbiAgY29uc3Qgc3FXID0gYm9hcmRCb3VuZHMud2lkdGggLyBkaW1zLmZpbGVzO1xuICBjb25zdCBzcUggPSBib2FyZEJvdW5kcy5oZWlnaHQgLyBkaW1zLnJhbmtzO1xuICBpZiAoIXNxVyB8fCAhc3FIKSByZXR1cm47XG4gIGxldCB4T2ZmID0gKGxlZnQgLSBib2FyZEJvdW5kcy5sZWZ0KSAvIHNxVztcbiAgaWYgKGFzU2VudGUpIHhPZmYgPSBkaW1zLmZpbGVzIC0gMSAtIHhPZmY7XG4gIGxldCB5T2ZmID0gKHRvcCAtIGJvYXJkQm91bmRzLnRvcCkgLyBzcUg7XG4gIGlmICghYXNTZW50ZSkgeU9mZiA9IGRpbXMucmFua3MgLSAxIC0geU9mZjtcbiAgcmV0dXJuIFt4T2ZmLCB5T2ZmXTtcbn1cbiIsICJpbXBvcnQgeyBhbGxLZXlzLCBjb2xvcnMgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwuanMnO1xuXG5leHBvcnQgdHlwZSBNdXRhdGlvbjxBPiA9IChzdGF0ZTogU3RhdGUpID0+IEE7XG5cbi8vIDAsMSBhbmltYXRpb24gZ29hbFxuLy8gMiwzIGFuaW1hdGlvbiBjdXJyZW50IHN0YXR1c1xuZXhwb3J0IHR5cGUgQW5pbVZlY3RvciA9IHNnLk51bWJlclF1YWQ7XG5cbmV4cG9ydCB0eXBlIEFuaW1WZWN0b3JzID0gTWFwPHNnLktleSwgQW5pbVZlY3Rvcj47XG5cbmV4cG9ydCB0eXBlIEFuaW1GYWRpbmdzID0gTWFwPHNnLktleSwgc2cuUGllY2U+O1xuXG5leHBvcnQgdHlwZSBBbmltUHJvbW90aW9ucyA9IE1hcDxzZy5LZXksIHNnLlBpZWNlPjtcblxuZXhwb3J0IGludGVyZmFjZSBBbmltUGxhbiB7XG4gIGFuaW1zOiBBbmltVmVjdG9ycztcbiAgZmFkaW5nczogQW5pbUZhZGluZ3M7XG4gIHByb21vdGlvbnM6IEFuaW1Qcm9tb3Rpb25zO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1DdXJyZW50IHtcbiAgc3RhcnQ6IERPTUhpZ2hSZXNUaW1lU3RhbXA7XG4gIGZyZXF1ZW5jeTogc2cuS0h6O1xuICBwbGFuOiBBbmltUGxhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFuaW08QT4obXV0YXRpb246IE11dGF0aW9uPEE+LCBzdGF0ZTogU3RhdGUpOiBBIHtcbiAgcmV0dXJuIHN0YXRlLmFuaW1hdGlvbi5lbmFibGVkID8gYW5pbWF0ZShtdXRhdGlvbiwgc3RhdGUpIDogcmVuZGVyKG11dGF0aW9uLCBzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXI8QT4obXV0YXRpb246IE11dGF0aW9uPEE+LCBzdGF0ZTogU3RhdGUpOiBBIHtcbiAgY29uc3QgcmVzdWx0ID0gbXV0YXRpb24oc3RhdGUpO1xuICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmludGVyZmFjZSBBbmltUGllY2Uge1xuICBrZXk/OiBzZy5LZXk7XG4gIHBvczogc2cuUG9zO1xuICBwaWVjZTogc2cuUGllY2U7XG59XG5cbnR5cGUgTmV3QW5pbVBpZWNlID0gUmVxdWlyZWQ8QW5pbVBpZWNlPjtcblxuZnVuY3Rpb24gbWFrZVBpZWNlKGtleTogc2cuS2V5LCBwaWVjZTogc2cuUGllY2UpOiBOZXdBbmltUGllY2Uge1xuICByZXR1cm4ge1xuICAgIGtleToga2V5LFxuICAgIHBvczogdXRpbC5rZXkycG9zKGtleSksXG4gICAgcGllY2U6IHBpZWNlLFxuICB9O1xufVxuXG5mdW5jdGlvbiBjbG9zZXIocGllY2U6IEFuaW1QaWVjZSwgcGllY2VzOiBBbmltUGllY2VbXSk6IEFuaW1QaWVjZSB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBwaWVjZXMuc29ydCgocDEsIHAyKSA9PiB7XG4gICAgcmV0dXJuIHV0aWwuZGlzdGFuY2VTcShwaWVjZS5wb3MsIHAxLnBvcykgLSB1dGlsLmRpc3RhbmNlU3EocGllY2UucG9zLCBwMi5wb3MpO1xuICB9KVswXTtcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVBsYW4ocHJldlBpZWNlczogc2cuUGllY2VzLCBwcmV2SGFuZHM6IHNnLkhhbmRzLCBjdXJyZW50OiBTdGF0ZSk6IEFuaW1QbGFuIHtcbiAgY29uc3QgYW5pbXM6IEFuaW1WZWN0b3JzID0gbmV3IE1hcCgpO1xuICBjb25zdCBhbmltZWRPcmlnczogc2cuS2V5W10gPSBbXTtcbiAgY29uc3QgZmFkaW5nczogQW5pbUZhZGluZ3MgPSBuZXcgTWFwKCk7XG4gIGNvbnN0IHByb21vdGlvbnM6IEFuaW1Qcm9tb3Rpb25zID0gbmV3IE1hcCgpO1xuICBjb25zdCBtaXNzaW5nczogQW5pbVBpZWNlW10gPSBbXTtcbiAgY29uc3QgbmV3czogTmV3QW5pbVBpZWNlW10gPSBbXTtcbiAgY29uc3QgcHJlUGllY2VzID0gbmV3IE1hcDxzZy5LZXksIEFuaW1QaWVjZT4oKTtcblxuICBmb3IgKGNvbnN0IFtrLCBwXSBvZiBwcmV2UGllY2VzKSB7XG4gICAgcHJlUGllY2VzLnNldChrLCBtYWtlUGllY2UoaywgcCkpO1xuICB9XG4gIGZvciAoY29uc3Qga2V5IG9mIGFsbEtleXMpIHtcbiAgICBjb25zdCBjdXJQID0gY3VycmVudC5waWVjZXMuZ2V0KGtleSk7XG4gICAgY29uc3QgcHJlUCA9IHByZVBpZWNlcy5nZXQoa2V5KTtcbiAgICBpZiAoY3VyUCkge1xuICAgICAgaWYgKHByZVApIHtcbiAgICAgICAgaWYgKCF1dGlsLnNhbWVQaWVjZShjdXJQLCBwcmVQLnBpZWNlKSkge1xuICAgICAgICAgIG1pc3NpbmdzLnB1c2gocHJlUCk7XG4gICAgICAgICAgbmV3cy5wdXNoKG1ha2VQaWVjZShrZXksIGN1clApKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIG5ld3MucHVzaChtYWtlUGllY2Uoa2V5LCBjdXJQKSk7XG4gICAgfSBlbHNlIGlmIChwcmVQKSBtaXNzaW5ncy5wdXNoKHByZVApO1xuICB9XG4gIGlmIChjdXJyZW50LmFuaW1hdGlvbi5oYW5kcykge1xuICAgIGZvciAoY29uc3QgY29sb3Igb2YgY29sb3JzKSB7XG4gICAgICBjb25zdCBjdXJIID0gY3VycmVudC5oYW5kcy5oYW5kTWFwLmdldChjb2xvcik7XG4gICAgICBjb25zdCBwcmVIID0gcHJldkhhbmRzLmdldChjb2xvcik7XG4gICAgICBpZiAocHJlSCAmJiBjdXJIKSB7XG4gICAgICAgIGZvciAoY29uc3QgW3JvbGUsIG5dIG9mIHByZUgpIHtcbiAgICAgICAgICBjb25zdCBwaWVjZTogc2cuUGllY2UgPSB7IHJvbGUsIGNvbG9yIH07XG4gICAgICAgICAgY29uc3QgY3VyTiA9IGN1ckguZ2V0KHJvbGUpIHx8IDA7XG4gICAgICAgICAgaWYgKGN1ck4gPCBuKSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kUGllY2VPZmZzZXQgPSBjdXJyZW50LmRvbS5ib3VuZHMuaGFuZHNcbiAgICAgICAgICAgICAgLnBpZWNlQm91bmRzKClcbiAgICAgICAgICAgICAgLmdldCh1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKSk7XG4gICAgICAgICAgICBjb25zdCBib3VuZHMgPSBjdXJyZW50LmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gICAgICAgICAgICBjb25zdCBvdXRQb3MgPVxuICAgICAgICAgICAgICBoYW5kUGllY2VPZmZzZXQgJiYgYm91bmRzXG4gICAgICAgICAgICAgICAgPyB1dGlsLnBvc09mT3V0c2lkZUVsKFxuICAgICAgICAgICAgICAgICAgICBoYW5kUGllY2VPZmZzZXQubGVmdCxcbiAgICAgICAgICAgICAgICAgICAgaGFuZFBpZWNlT2Zmc2V0LnRvcCxcbiAgICAgICAgICAgICAgICAgICAgdXRpbC5zZW50ZVBvdihjdXJyZW50Lm9yaWVudGF0aW9uKSxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudC5kaW1lbnNpb25zLFxuICAgICAgICAgICAgICAgICAgICBib3VuZHMsXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAob3V0UG9zKVxuICAgICAgICAgICAgICBtaXNzaW5ncy5wdXNoKHtcbiAgICAgICAgICAgICAgICBwb3M6IG91dFBvcyxcbiAgICAgICAgICAgICAgICBwaWVjZTogcGllY2UsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBmb3IgKGNvbnN0IG5ld1Agb2YgbmV3cykge1xuICAgIGNvbnN0IHByZVAgPSBjbG9zZXIoXG4gICAgICBuZXdQLFxuICAgICAgbWlzc2luZ3MuZmlsdGVyKChwKSA9PiB7XG4gICAgICAgIGlmICh1dGlsLnNhbWVQaWVjZShuZXdQLnBpZWNlLCBwLnBpZWNlKSkgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vIGNoZWNraW5nIHdoZXRoZXIgcHJvbW90ZWQgcGllY2VzIGFyZSB0aGUgc2FtZVxuICAgICAgICBjb25zdCBwUm9sZSA9IGN1cnJlbnQucHJvbW90aW9uLnByb21vdGVzVG8ocC5waWVjZS5yb2xlKTtcbiAgICAgICAgY29uc3QgcFBpZWNlID0gcFJvbGUgJiYgeyBjb2xvcjogcC5waWVjZS5jb2xvciwgcm9sZTogcFJvbGUgfTtcbiAgICAgICAgY29uc3QgblJvbGUgPSBjdXJyZW50LnByb21vdGlvbi5wcm9tb3Rlc1RvKG5ld1AucGllY2Uucm9sZSk7XG4gICAgICAgIGNvbnN0IG5QaWVjZSA9IG5Sb2xlICYmIHsgY29sb3I6IG5ld1AucGllY2UuY29sb3IsIHJvbGU6IG5Sb2xlIH07XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgKCEhcFBpZWNlICYmIHV0aWwuc2FtZVBpZWNlKG5ld1AucGllY2UsIHBQaWVjZSkpIHx8XG4gICAgICAgICAgKCEhblBpZWNlICYmIHV0aWwuc2FtZVBpZWNlKG5QaWVjZSwgcC5waWVjZSkpXG4gICAgICAgICk7XG4gICAgICB9KSxcbiAgICApO1xuICAgIGlmIChwcmVQKSB7XG4gICAgICBjb25zdCB2ZWN0b3IgPSBbcHJlUC5wb3NbMF0gLSBuZXdQLnBvc1swXSwgcHJlUC5wb3NbMV0gLSBuZXdQLnBvc1sxXV07XG4gICAgICBhbmltcy5zZXQobmV3UC5rZXksIHZlY3Rvci5jb25jYXQodmVjdG9yKSBhcyBBbmltVmVjdG9yKTtcbiAgICAgIGlmIChwcmVQLmtleSkgYW5pbWVkT3JpZ3MucHVzaChwcmVQLmtleSk7XG4gICAgICBpZiAoIXV0aWwuc2FtZVBpZWNlKG5ld1AucGllY2UsIHByZVAucGllY2UpICYmIG5ld1Aua2V5KSBwcm9tb3Rpb25zLnNldChuZXdQLmtleSwgcHJlUC5waWVjZSk7XG4gICAgfVxuICB9XG4gIGZvciAoY29uc3QgcCBvZiBtaXNzaW5ncykge1xuICAgIGlmIChwLmtleSAmJiAhYW5pbWVkT3JpZ3MuaW5jbHVkZXMocC5rZXkpKSBmYWRpbmdzLnNldChwLmtleSwgcC5waWVjZSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGFuaW1zOiBhbmltcyxcbiAgICBmYWRpbmdzOiBmYWRpbmdzLFxuICAgIHByb21vdGlvbnM6IHByb21vdGlvbnMsXG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0ZXAoc3RhdGU6IFN0YXRlLCBub3c6IERPTUhpZ2hSZXNUaW1lU3RhbXApOiB2b2lkIHtcbiAgY29uc3QgY3VyID0gc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQ7XG4gIGlmIChjdXIgPT09IHVuZGVmaW5lZCkge1xuICAgIC8vIGFuaW1hdGlvbiB3YXMgY2FuY2VsZWQgOihcbiAgICBpZiAoIXN0YXRlLmRvbS5kZXN0cm95ZWQpIHN0YXRlLmRvbS5yZWRyYXdOb3coKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgcmVzdCA9IDEgLSAobm93IC0gY3VyLnN0YXJ0KSAqIGN1ci5mcmVxdWVuY3k7XG4gIGlmIChyZXN0IDw9IDApIHtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20ucmVkcmF3Tm93KCk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgZWFzZSA9IGVhc2luZyhyZXN0KTtcbiAgICBmb3IgKGNvbnN0IGNmZyBvZiBjdXIucGxhbi5hbmltcy52YWx1ZXMoKSkge1xuICAgICAgY2ZnWzJdID0gY2ZnWzBdICogZWFzZTtcbiAgICAgIGNmZ1szXSA9IGNmZ1sxXSAqIGVhc2U7XG4gICAgfVxuICAgIHN0YXRlLmRvbS5yZWRyYXdOb3codHJ1ZSk7IC8vIG9wdGltaXNhdGlvbjogZG9uJ3QgcmVuZGVyIFNWRyBjaGFuZ2VzIGR1cmluZyBhbmltYXRpb25zXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKChub3cgPSBwZXJmb3JtYW5jZS5ub3coKSkgPT4gc3RlcChzdGF0ZSwgbm93KSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYW5pbWF0ZTxBPihtdXRhdGlvbjogTXV0YXRpb248QT4sIHN0YXRlOiBTdGF0ZSk6IEEge1xuICAvLyBjbG9uZSBzdGF0ZSBiZWZvcmUgbXV0YXRpbmcgaXRcbiAgY29uc3QgcHJldlBpZWNlczogc2cuUGllY2VzID0gbmV3IE1hcChzdGF0ZS5waWVjZXMpO1xuICBjb25zdCBwcmV2SGFuZHM6IHNnLkhhbmRzID0gbmV3IE1hcChbXG4gICAgWydzZW50ZScsIG5ldyBNYXAoc3RhdGUuaGFuZHMuaGFuZE1hcC5nZXQoJ3NlbnRlJykpXSxcbiAgICBbJ2dvdGUnLCBuZXcgTWFwKHN0YXRlLmhhbmRzLmhhbmRNYXAuZ2V0KCdnb3RlJykpXSxcbiAgXSk7XG5cbiAgY29uc3QgcmVzdWx0ID0gbXV0YXRpb24oc3RhdGUpO1xuICBjb25zdCBwbGFuID0gY29tcHV0ZVBsYW4ocHJldlBpZWNlcywgcHJldkhhbmRzLCBzdGF0ZSk7XG4gIGlmIChwbGFuLmFuaW1zLnNpemUgfHwgcGxhbi5mYWRpbmdzLnNpemUpIHtcbiAgICBjb25zdCBhbHJlYWR5UnVubmluZyA9IHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50Py5zdGFydCAhPT0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0ge1xuICAgICAgc3RhcnQ6IHBlcmZvcm1hbmNlLm5vdygpLFxuICAgICAgZnJlcXVlbmN5OiAxIC8gTWF0aC5tYXgoc3RhdGUuYW5pbWF0aW9uLmR1cmF0aW9uLCAxKSxcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgfTtcbiAgICBpZiAoIWFscmVhZHlSdW5uaW5nKSBzdGVwKHN0YXRlLCBwZXJmb3JtYW5jZS5ub3coKSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gZG9uJ3QgYW5pbWF0ZSwganVzdCByZW5kZXIgcmlnaHQgYXdheVxuICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9ncmUvMTY1MDI5NFxuZnVuY3Rpb24gZWFzaW5nKHQ6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiB0IDwgMC41ID8gNCAqIHQgKiB0ICogdCA6ICh0IC0gMSkgKiAoMiAqIHQgLSAyKSAqICgyICogdCAtIDIpICsgMTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IEhlYWRsZXNzU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyBzYW1lUGllY2UgfSBmcm9tICcuL3V0aWwuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gbnVtYmVySW5IYW5kKHM6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSk6IG51bWJlciB7XG4gIHJldHVybiBzLmhhbmRzLmhhbmRNYXAuZ2V0KHBpZWNlLmNvbG9yKT8uZ2V0KHBpZWNlLnJvbGUpIHx8IDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRUb0hhbmQoczogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBjbnQgPSAxKTogdm9pZCB7XG4gIGNvbnN0IGhhbmQgPSBzLmhhbmRzLmhhbmRNYXAuZ2V0KHBpZWNlLmNvbG9yKTtcbiAgY29uc3Qgcm9sZSA9XG4gICAgKHMuaGFuZHMucm9sZXMuaW5jbHVkZXMocGllY2Uucm9sZSkgPyBwaWVjZS5yb2xlIDogcy5wcm9tb3Rpb24udW5wcm9tb3Rlc1RvKHBpZWNlLnJvbGUpKSB8fFxuICAgIHBpZWNlLnJvbGU7XG4gIGlmIChoYW5kICYmIHMuaGFuZHMucm9sZXMuaW5jbHVkZXMocm9sZSkpIGhhbmQuc2V0KHJvbGUsIChoYW5kLmdldChyb2xlKSB8fCAwKSArIGNudCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVGcm9tSGFuZChzOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGNudCA9IDEpOiB2b2lkIHtcbiAgY29uc3QgaGFuZCA9IHMuaGFuZHMuaGFuZE1hcC5nZXQocGllY2UuY29sb3IpO1xuICBjb25zdCByb2xlID1cbiAgICAocy5oYW5kcy5yb2xlcy5pbmNsdWRlcyhwaWVjZS5yb2xlKSA/IHBpZWNlLnJvbGUgOiBzLnByb21vdGlvbi51bnByb21vdGVzVG8ocGllY2Uucm9sZSkpIHx8XG4gICAgcGllY2Uucm9sZTtcbiAgY29uc3QgbnVtID0gaGFuZD8uZ2V0KHJvbGUpO1xuICBpZiAoaGFuZCAmJiBudW0pIGhhbmQuc2V0KHJvbGUsIE1hdGgubWF4KG51bSAtIGNudCwgMCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVySGFuZChzOiBIZWFkbGVzc1N0YXRlLCBoYW5kRWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gIGhhbmRFbC5jbGFzc0xpc3QudG9nZ2xlKCdwcm9tb3Rpb24nLCAhIXMucHJvbW90aW9uLmN1cnJlbnQpO1xuICBsZXQgd3JhcEVsID0gaGFuZEVsLmZpcnN0RWxlbWVudENoaWxkIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICB3aGlsZSAod3JhcEVsKSB7XG4gICAgY29uc3QgcGllY2VFbCA9IHdyYXBFbC5maXJzdEVsZW1lbnRDaGlsZCBhcyBzZy5QaWVjZU5vZGU7XG4gICAgY29uc3QgcGllY2UgPSB7IHJvbGU6IHBpZWNlRWwuc2dSb2xlLCBjb2xvcjogcGllY2VFbC5zZ0NvbG9yIH07XG4gICAgY29uc3QgbnVtID0gbnVtYmVySW5IYW5kKHMsIHBpZWNlKTtcbiAgICBjb25zdCBpc1NlbGVjdGVkID0gISFzLnNlbGVjdGVkUGllY2UgJiYgc2FtZVBpZWNlKHBpZWNlLCBzLnNlbGVjdGVkUGllY2UpICYmICFzLmRyb3BwYWJsZS5zcGFyZTtcblxuICAgIHdyYXBFbC5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgJ3NlbGVjdGVkJyxcbiAgICAgIChzLmFjdGl2ZUNvbG9yID09PSAnYm90aCcgfHwgcy5hY3RpdmVDb2xvciA9PT0gcy50dXJuQ29sb3IpICYmIGlzU2VsZWN0ZWQsXG4gICAgKTtcbiAgICB3cmFwRWwuY2xhc3NMaXN0LnRvZ2dsZShcbiAgICAgICdwcmVzZWxlY3RlZCcsXG4gICAgICBzLmFjdGl2ZUNvbG9yICE9PSAnYm90aCcgJiYgcy5hY3RpdmVDb2xvciAhPT0gcy50dXJuQ29sb3IgJiYgaXNTZWxlY3RlZCxcbiAgICApO1xuICAgIHdyYXBFbC5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgJ2xhc3QtZGVzdCcsXG4gICAgICBzLmhpZ2hsaWdodC5sYXN0RGVzdHMgJiYgISFzLmxhc3RQaWVjZSAmJiBzYW1lUGllY2UocGllY2UsIHMubGFzdFBpZWNlKSxcbiAgICApO1xuICAgIHdyYXBFbC5jbGFzc0xpc3QudG9nZ2xlKCdkcmF3aW5nJywgISFzLmRyYXdhYmxlLnBpZWNlICYmIHNhbWVQaWVjZShzLmRyYXdhYmxlLnBpZWNlLCBwaWVjZSkpO1xuICAgIHdyYXBFbC5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgJ2N1cnJlbnQtcHJlJyxcbiAgICAgICEhcy5wcmVkcm9wcGFibGUuY3VycmVudCAmJiBzYW1lUGllY2Uocy5wcmVkcm9wcGFibGUuY3VycmVudC5waWVjZSwgcGllY2UpLFxuICAgICk7XG4gICAgd3JhcEVsLmRhdGFzZXQubmIgPSBudW0udG9TdHJpbmcoKTtcbiAgICB3cmFwRWwgPSB3cmFwRWwubmV4dEVsZW1lbnRTaWJsaW5nIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgYWRkVG9IYW5kLCBudW1iZXJJbkhhbmQsIHJlbW92ZUZyb21IYW5kIH0gZnJvbSAnLi9oYW5kcy5qcyc7XG5pbXBvcnQgdHlwZSB7IEhlYWRsZXNzU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyBjYWxsVXNlckZ1bmN0aW9uLCBvcHBvc2l0ZSwgcGllY2VOYW1lT2YsIHNhbWVQaWVjZSB9IGZyb20gJy4vdXRpbC5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiB0b2dnbGVPcmllbnRhdGlvbihzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICBzdGF0ZS5vcmllbnRhdGlvbiA9IG9wcG9zaXRlKHN0YXRlLm9yaWVudGF0aW9uKTtcbiAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPVxuICAgIHN0YXRlLmRyYWdnYWJsZS5jdXJyZW50ID1cbiAgICBzdGF0ZS5wcm9tb3Rpb24uY3VycmVudCA9XG4gICAgc3RhdGUuaG92ZXJlZCA9XG4gICAgc3RhdGUuc2VsZWN0ZWQgPVxuICAgIHN0YXRlLnNlbGVjdGVkUGllY2UgPVxuICAgICAgdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzZXQoc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiB2b2lkIHtcbiAgY2FuY2VsUHJvbW90aW9uKHN0YXRlKTtcbiAgdW5zZWxlY3Qoc3RhdGUpO1xuICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICB1bnNldFByZWRyb3Aoc3RhdGUpO1xuICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHN0YXRlLmRyYWdnYWJsZS5jdXJyZW50ID0gc3RhdGUuaG92ZXJlZCA9IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFBpZWNlcyhzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2VzOiBzZy5QaWVjZXNEaWZmKTogdm9pZCB7XG4gIGZvciAoY29uc3QgW2tleSwgcGllY2VdIG9mIHBpZWNlcykge1xuICAgIGlmIChwaWVjZSkgc3RhdGUucGllY2VzLnNldChrZXksIHBpZWNlKTtcbiAgICBlbHNlIHN0YXRlLnBpZWNlcy5kZWxldGUoa2V5KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0Q2hlY2tzKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBjaGVja3NWYWx1ZTogc2cuS2V5W10gfCBzZy5Db2xvciB8IGJvb2xlYW4pOiB2b2lkIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoY2hlY2tzVmFsdWUpKSB7XG4gICAgc3RhdGUuY2hlY2tzID0gY2hlY2tzVmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGNoZWNrc1ZhbHVlID09PSB0cnVlKSBjaGVja3NWYWx1ZSA9IHN0YXRlLnR1cm5Db2xvcjtcbiAgICBpZiAoY2hlY2tzVmFsdWUpIHtcbiAgICAgIGNvbnN0IGNoZWNrczogc2cuS2V5W10gPSBbXTtcbiAgICAgIGZvciAoY29uc3QgW2ssIHBdIG9mIHN0YXRlLnBpZWNlcykge1xuICAgICAgICBpZiAoc3RhdGUuaGlnaGxpZ2h0LmNoZWNrUm9sZXMuaW5jbHVkZXMocC5yb2xlKSAmJiBwLmNvbG9yID09PSBjaGVja3NWYWx1ZSkgY2hlY2tzLnB1c2goayk7XG4gICAgICB9XG4gICAgICBzdGF0ZS5jaGVja3MgPSBjaGVja3M7XG4gICAgfSBlbHNlIHN0YXRlLmNoZWNrcyA9IHVuZGVmaW5lZDtcbiAgfVxufVxuXG5mdW5jdGlvbiBzZXRQcmVtb3ZlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSwgcHJvbTogYm9vbGVhbik6IHZvaWQge1xuICB1bnNldFByZWRyb3Aoc3RhdGUpO1xuICBzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQgPSB7IG9yaWcsIGRlc3QsIHByb20gfTtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcmVtb3ZhYmxlLmV2ZW50cy5zZXQsIG9yaWcsIGRlc3QsIHByb20pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5zZXRQcmVtb3ZlKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQpIHtcbiAgICBzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcmVtb3ZhYmxlLmV2ZW50cy51bnNldCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0UHJlZHJvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSwgcHJvbTogYm9vbGVhbik6IHZvaWQge1xuICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICBzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCA9IHsgcGllY2UsIGtleSwgcHJvbSB9O1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByZWRyb3BwYWJsZS5ldmVudHMuc2V0LCBwaWVjZSwga2V5LCBwcm9tKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuc2V0UHJlZHJvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICBpZiAoc3RhdGUucHJlZHJvcHBhYmxlLmN1cnJlbnQpIHtcbiAgICBzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByZWRyb3BwYWJsZS5ldmVudHMudW5zZXQpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYXNlTW92ZShcbiAgc3RhdGU6IEhlYWRsZXNzU3RhdGUsXG4gIG9yaWc6IHNnLktleSxcbiAgZGVzdDogc2cuS2V5LFxuICBwcm9tOiBib29sZWFuLFxuKTogc2cuUGllY2UgfCBib29sZWFuIHtcbiAgY29uc3Qgb3JpZ1BpZWNlID0gc3RhdGUucGllY2VzLmdldChvcmlnKTtcbiAgY29uc3QgZGVzdFBpZWNlID0gc3RhdGUucGllY2VzLmdldChkZXN0KTtcbiAgaWYgKG9yaWcgPT09IGRlc3QgfHwgIW9yaWdQaWVjZSkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBjYXB0dXJlZCA9IGRlc3RQaWVjZSAmJiBkZXN0UGllY2UuY29sb3IgIT09IG9yaWdQaWVjZS5jb2xvciA/IGRlc3RQaWVjZSA6IHVuZGVmaW5lZDtcbiAgY29uc3QgcHJvbVBpZWNlID0gcHJvbSAmJiBwcm9tb3RlUGllY2Uoc3RhdGUsIG9yaWdQaWVjZSk7XG4gIGlmIChkZXN0ID09PSBzdGF0ZS5zZWxlY3RlZCB8fCBvcmlnID09PSBzdGF0ZS5zZWxlY3RlZCkgdW5zZWxlY3Qoc3RhdGUpO1xuICBzdGF0ZS5waWVjZXMuc2V0KGRlc3QsIHByb21QaWVjZSB8fCBvcmlnUGllY2UpO1xuICBzdGF0ZS5waWVjZXMuZGVsZXRlKG9yaWcpO1xuICBzdGF0ZS5sYXN0RGVzdHMgPSBbb3JpZywgZGVzdF07XG4gIHN0YXRlLmxhc3RQaWVjZSA9IHVuZGVmaW5lZDtcbiAgc3RhdGUuY2hlY2tzID0gdW5kZWZpbmVkO1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5tb3ZlLCBvcmlnLCBkZXN0LCBwcm9tLCBjYXB0dXJlZCk7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG4gIHJldHVybiBjYXB0dXJlZCB8fCB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFzZURyb3AoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBwaWVjZTogc2cuUGllY2UsXG4gIGtleTogc2cuS2V5LFxuICBwcm9tOiBib29sZWFuLFxuICBzcGFyZTogYm9vbGVhbiA9IHN0YXRlLmRyb3BwYWJsZS5zcGFyZSxcbik6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZUNvdW50ID0gbnVtYmVySW5IYW5kKHN0YXRlLCBwaWVjZSk7XG4gIGlmICghcGllY2VDb3VudCAmJiAhc3BhcmUpIHJldHVybiBmYWxzZTtcbiAgY29uc3QgcHJvbVBpZWNlID0gcHJvbSAmJiBwcm9tb3RlUGllY2Uoc3RhdGUsIHBpZWNlKTtcbiAgaWYgKFxuICAgIGtleSA9PT0gc3RhdGUuc2VsZWN0ZWQgfHxcbiAgICAoIXNwYXJlICYmIHBpZWNlQ291bnQgPT09IDEgJiYgc3RhdGUuc2VsZWN0ZWRQaWVjZSAmJiBzYW1lUGllY2Uoc3RhdGUuc2VsZWN0ZWRQaWVjZSwgcGllY2UpKVxuICApXG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICBzdGF0ZS5waWVjZXMuc2V0KGtleSwgcHJvbVBpZWNlIHx8IHBpZWNlKTtcbiAgc3RhdGUubGFzdERlc3RzID0gW2tleV07XG4gIHN0YXRlLmxhc3RQaWVjZSA9IHBpZWNlO1xuICBzdGF0ZS5jaGVja3MgPSB1bmRlZmluZWQ7XG4gIGlmICghc3BhcmUpIHJlbW92ZUZyb21IYW5kKHN0YXRlLCBwaWVjZSk7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmRyb3AsIHBpZWNlLCBrZXksIHByb20pO1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5jaGFuZ2UpO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gYmFzZVVzZXJNb3ZlKFxuICBzdGF0ZTogSGVhZGxlc3NTdGF0ZSxcbiAgb3JpZzogc2cuS2V5LFxuICBkZXN0OiBzZy5LZXksXG4gIHByb206IGJvb2xlYW4sXG4pOiBzZy5QaWVjZSB8IGJvb2xlYW4ge1xuICBjb25zdCByZXN1bHQgPSBiYXNlTW92ZShzdGF0ZSwgb3JpZywgZGVzdCwgcHJvbSk7XG4gIGlmIChyZXN1bHQpIHtcbiAgICBzdGF0ZS5tb3ZhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmRyb3BwYWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS50dXJuQ29sb3IgPSBvcHBvc2l0ZShzdGF0ZS50dXJuQ29sb3IpO1xuICAgIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGJhc2VVc2VyRHJvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSwgcHJvbTogYm9vbGVhbik6IGJvb2xlYW4ge1xuICBjb25zdCByZXN1bHQgPSBiYXNlRHJvcChzdGF0ZSwgcGllY2UsIGtleSwgcHJvbSk7XG4gIGlmIChyZXN1bHQpIHtcbiAgICBzdGF0ZS5tb3ZhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmRyb3BwYWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS50dXJuQ29sb3IgPSBvcHBvc2l0ZShzdGF0ZS50dXJuQ29sb3IpO1xuICAgIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VyRHJvcChcbiAgc3RhdGU6IEhlYWRsZXNzU3RhdGUsXG4gIHBpZWNlOiBzZy5QaWVjZSxcbiAga2V5OiBzZy5LZXksXG4gIHByb20/OiBib29sZWFuLFxuKTogYm9vbGVhbiB7XG4gIGNvbnN0IHJlYWxQcm9tID0gcHJvbSB8fCBzdGF0ZS5wcm9tb3Rpb24uZm9yY2VEcm9wUHJvbW90aW9uKHBpZWNlLCBrZXkpO1xuICBpZiAoY2FuRHJvcChzdGF0ZSwgcGllY2UsIGtleSkpIHtcbiAgICBjb25zdCByZXN1bHQgPSBiYXNlVXNlckRyb3Aoc3RhdGUsIHBpZWNlLCBrZXksIHJlYWxQcm9tKTtcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmRyb3BwYWJsZS5ldmVudHMuYWZ0ZXIsIHBpZWNlLCBrZXksIHJlYWxQcm9tLCB7IHByZW1hZGU6IGZhbHNlIH0pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9IGVsc2UgaWYgKGNhblByZWRyb3Aoc3RhdGUsIHBpZWNlLCBrZXkpKSB7XG4gICAgc2V0UHJlZHJvcChzdGF0ZSwgcGllY2UsIGtleSwgcmVhbFByb20pO1xuICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB1bnNlbGVjdChzdGF0ZSk7XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZXJNb3ZlKFxuICBzdGF0ZTogSGVhZGxlc3NTdGF0ZSxcbiAgb3JpZzogc2cuS2V5LFxuICBkZXN0OiBzZy5LZXksXG4gIHByb20/OiBib29sZWFuLFxuKTogYm9vbGVhbiB7XG4gIGNvbnN0IHJlYWxQcm9tID0gcHJvbSB8fCBzdGF0ZS5wcm9tb3Rpb24uZm9yY2VNb3ZlUHJvbW90aW9uKG9yaWcsIGRlc3QpO1xuICBpZiAoY2FuTW92ZShzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICBjb25zdCByZXN1bHQgPSBiYXNlVXNlck1vdmUoc3RhdGUsIG9yaWcsIGRlc3QsIHJlYWxQcm9tKTtcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgICBjb25zdCBtZXRhZGF0YTogc2cuTW92ZU1ldGFkYXRhID0geyBwcmVtYWRlOiBmYWxzZSB9O1xuICAgICAgaWYgKHJlc3VsdCAhPT0gdHJ1ZSkgbWV0YWRhdGEuY2FwdHVyZWQgPSByZXN1bHQ7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLm1vdmFibGUuZXZlbnRzLmFmdGVyLCBvcmlnLCBkZXN0LCByZWFsUHJvbSwgbWV0YWRhdGEpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9IGVsc2UgaWYgKGNhblByZW1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpKSB7XG4gICAgc2V0UHJlbW92ZShzdGF0ZSwgb3JpZywgZGVzdCwgcmVhbFByb20pO1xuICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB1bnNlbGVjdChzdGF0ZSk7XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2VQcm9tb3Rpb25EaWFsb2coc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgY29uc3QgcHJvbW90ZWRQaWVjZSA9IHByb21vdGVQaWVjZShzdGF0ZSwgcGllY2UpO1xuICBpZiAoc3RhdGUudmlld09ubHkgfHwgc3RhdGUucHJvbW90aW9uLmN1cnJlbnQgfHwgIXByb21vdGVkUGllY2UpIHJldHVybiBmYWxzZTtcblxuICBzdGF0ZS5wcm9tb3Rpb24uY3VycmVudCA9IHsgcGllY2UsIHByb21vdGVkUGllY2UsIGtleSwgZHJhZ2dlZDogISFzdGF0ZS5kcmFnZ2FibGUuY3VycmVudCB9O1xuICBzdGF0ZS5ob3ZlcmVkID0ga2V5O1xuXG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvbW90aW9uRGlhbG9nRHJvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSk6IGJvb2xlYW4ge1xuICBpZiAoXG4gICAgY2FuRHJvcFByb21vdGUoc3RhdGUsIHBpZWNlLCBrZXkpICYmXG4gICAgKGNhbkRyb3Aoc3RhdGUsIHBpZWNlLCBrZXkpIHx8IGNhblByZWRyb3Aoc3RhdGUsIHBpZWNlLCBrZXkpKVxuICApIHtcbiAgICBpZiAoYmFzZVByb21vdGlvbkRpYWxvZyhzdGF0ZSwgcGllY2UsIGtleSkpIHtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJvbW90aW9uLmV2ZW50cy5pbml0aWF0ZWQpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb21vdGlvbkRpYWxvZ01vdmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KTogYm9vbGVhbiB7XG4gIGlmIChcbiAgICBjYW5Nb3ZlUHJvbW90ZShzdGF0ZSwgb3JpZywgZGVzdCkgJiZcbiAgICAoY2FuTW92ZShzdGF0ZSwgb3JpZywgZGVzdCkgfHwgY2FuUHJlbW92ZShzdGF0ZSwgb3JpZywgZGVzdCkpXG4gICkge1xuICAgIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzLmdldChvcmlnKTtcbiAgICBpZiAocGllY2UgJiYgYmFzZVByb21vdGlvbkRpYWxvZyhzdGF0ZSwgcGllY2UsIGRlc3QpKSB7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByb21vdGlvbi5ldmVudHMuaW5pdGlhdGVkKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHByb21vdGVQaWVjZShzOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UpOiBzZy5QaWVjZSB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IHByb21Sb2xlID0gcy5wcm9tb3Rpb24ucHJvbW90ZXNUbyhwaWVjZS5yb2xlKTtcbiAgcmV0dXJuIHByb21Sb2xlICE9PSB1bmRlZmluZWQgPyB7IGNvbG9yOiBwaWVjZS5jb2xvciwgcm9sZTogcHJvbVJvbGUgfSA6IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlbGV0ZVBpZWNlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBrZXk6IHNnLktleSk6IHZvaWQge1xuICBpZiAoc3RhdGUucGllY2VzLmRlbGV0ZShrZXkpKSBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5jaGFuZ2UpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0U3F1YXJlKFxuICBzdGF0ZTogSGVhZGxlc3NTdGF0ZSxcbiAga2V5OiBzZy5LZXksXG4gIHByb20/OiBib29sZWFuLFxuICBmb3JjZT86IGJvb2xlYW4sXG4pOiB2b2lkIHtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuc2VsZWN0LCBrZXkpO1xuXG4gIC8vIHVuc2VsZWN0IGlmIHNlbGVjdGluZyBzZWxlY3RlZCBrZXksIGtlZXAgc2VsZWN0ZWQgZm9yIGRyYWdcbiAgaWYgKCFzdGF0ZS5kcmFnZ2FibGUuZW5hYmxlZCAmJiBzdGF0ZS5zZWxlY3RlZCA9PT0ga2V5KSB7XG4gICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMudW5zZWxlY3QsIGtleSk7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIHRyeSBtb3ZpbmcvZHJvcHBpbmdcbiAgaWYgKFxuICAgIHN0YXRlLnNlbGVjdGFibGUuZW5hYmxlZCB8fFxuICAgIGZvcmNlIHx8XG4gICAgKHN0YXRlLnNlbGVjdGFibGUuZm9yY2VTcGFyZXMgJiYgc3RhdGUuc2VsZWN0ZWRQaWVjZSAmJiBzdGF0ZS5kcm9wcGFibGUuc3BhcmUpXG4gICkge1xuICAgIGlmIChzdGF0ZS5zZWxlY3RlZFBpZWNlICYmIHVzZXJEcm9wKHN0YXRlLCBzdGF0ZS5zZWxlY3RlZFBpZWNlLCBrZXksIHByb20pKSByZXR1cm47XG4gICAgZWxzZSBpZiAoc3RhdGUuc2VsZWN0ZWQgJiYgdXNlck1vdmUoc3RhdGUsIHN0YXRlLnNlbGVjdGVkLCBrZXksIHByb20pKSByZXR1cm47XG4gIH1cblxuICBpZiAoXG4gICAgKHN0YXRlLnNlbGVjdGFibGUuZW5hYmxlZCB8fCBzdGF0ZS5kcmFnZ2FibGUuZW5hYmxlZCB8fCBmb3JjZSkgJiZcbiAgICAoaXNNb3ZhYmxlKHN0YXRlLCBrZXkpIHx8IGlzUHJlbW92YWJsZShzdGF0ZSwga2V5KSlcbiAgKSB7XG4gICAgc2V0U2VsZWN0ZWQoc3RhdGUsIGtleSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdFBpZWNlKFxuICBzdGF0ZTogSGVhZGxlc3NTdGF0ZSxcbiAgcGllY2U6IHNnLlBpZWNlLFxuICBzcGFyZT86IGJvb2xlYW4sXG4gIGZvcmNlPzogYm9vbGVhbixcbiAgYXBpPzogYm9vbGVhbixcbik6IHZvaWQge1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5waWVjZVNlbGVjdCwgcGllY2UpO1xuXG4gIGlmIChzdGF0ZS5zZWxlY3RhYmxlLmFkZFNwYXJlc1RvSGFuZCAmJiBzdGF0ZS5kcm9wcGFibGUuc3BhcmUgJiYgc3RhdGUuc2VsZWN0ZWRQaWVjZSkge1xuICAgIGFkZFRvSGFuZChzdGF0ZSwgeyByb2xlOiBzdGF0ZS5zZWxlY3RlZFBpZWNlLnJvbGUsIGNvbG9yOiBwaWVjZS5jb2xvciB9KTtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5jaGFuZ2UpO1xuICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgfSBlbHNlIGlmIChcbiAgICAhYXBpICYmXG4gICAgIXN0YXRlLmRyYWdnYWJsZS5lbmFibGVkICYmXG4gICAgc3RhdGUuc2VsZWN0ZWRQaWVjZSAmJlxuICAgIHNhbWVQaWVjZShzdGF0ZS5zZWxlY3RlZFBpZWNlLCBwaWVjZSlcbiAgKSB7XG4gICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMucGllY2VVbnNlbGVjdCwgcGllY2UpO1xuICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgfSBlbHNlIGlmIChcbiAgICAoc3RhdGUuc2VsZWN0YWJsZS5lbmFibGVkIHx8IHN0YXRlLmRyYWdnYWJsZS5lbmFibGVkIHx8IGZvcmNlKSAmJlxuICAgIChpc0Ryb3BwYWJsZShzdGF0ZSwgcGllY2UsICEhc3BhcmUpIHx8IGlzUHJlZHJvcHBhYmxlKHN0YXRlLCBwaWVjZSkpXG4gICkge1xuICAgIHNldFNlbGVjdGVkUGllY2Uoc3RhdGUsIHBpZWNlKTtcbiAgICBzdGF0ZS5kcm9wcGFibGUuc3BhcmUgPSAhIXNwYXJlO1xuICB9IGVsc2Uge1xuICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0U2VsZWN0ZWQoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIGtleTogc2cuS2V5KTogdm9pZCB7XG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgc3RhdGUuc2VsZWN0ZWQgPSBrZXk7XG4gIHNldFByZURlc3RzKHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFNlbGVjdGVkUGllY2Uoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSk6IHZvaWQge1xuICB1bnNlbGVjdChzdGF0ZSk7XG4gIHN0YXRlLnNlbGVjdGVkUGllY2UgPSBwaWVjZTtcbiAgc2V0UHJlRGVzdHMoc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0UHJlRGVzdHMoc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiB2b2lkIHtcbiAgc3RhdGUucHJlbW92YWJsZS5kZXN0cyA9IHN0YXRlLnByZWRyb3BwYWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcblxuICBpZiAoc3RhdGUuc2VsZWN0ZWQgJiYgaXNQcmVtb3ZhYmxlKHN0YXRlLCBzdGF0ZS5zZWxlY3RlZCkgJiYgc3RhdGUucHJlbW92YWJsZS5nZW5lcmF0ZSlcbiAgICBzdGF0ZS5wcmVtb3ZhYmxlLmRlc3RzID0gc3RhdGUucHJlbW92YWJsZS5nZW5lcmF0ZShzdGF0ZS5zZWxlY3RlZCwgc3RhdGUucGllY2VzKTtcbiAgZWxzZSBpZiAoXG4gICAgc3RhdGUuc2VsZWN0ZWRQaWVjZSAmJlxuICAgIGlzUHJlZHJvcHBhYmxlKHN0YXRlLCBzdGF0ZS5zZWxlY3RlZFBpZWNlKSAmJlxuICAgIHN0YXRlLnByZWRyb3BwYWJsZS5nZW5lcmF0ZVxuICApXG4gICAgc3RhdGUucHJlZHJvcHBhYmxlLmRlc3RzID0gc3RhdGUucHJlZHJvcHBhYmxlLmdlbmVyYXRlKHN0YXRlLnNlbGVjdGVkUGllY2UsIHN0YXRlLnBpZWNlcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnNlbGVjdChzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICBzdGF0ZS5zZWxlY3RlZCA9XG4gICAgc3RhdGUuc2VsZWN0ZWRQaWVjZSA9XG4gICAgc3RhdGUucHJlbW92YWJsZS5kZXN0cyA9XG4gICAgc3RhdGUucHJlZHJvcHBhYmxlLmRlc3RzID1cbiAgICBzdGF0ZS5wcm9tb3Rpb24uY3VycmVudCA9XG4gICAgICB1bmRlZmluZWQ7XG4gIHN0YXRlLmRyb3BwYWJsZS5zcGFyZSA9IGZhbHNlO1xufVxuXG5mdW5jdGlvbiBpc01vdmFibGUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQob3JpZyk7XG4gIHJldHVybiAoXG4gICAgISFwaWVjZSAmJlxuICAgIChzdGF0ZS5hY3RpdmVDb2xvciA9PT0gJ2JvdGgnIHx8XG4gICAgICAoc3RhdGUuYWN0aXZlQ29sb3IgPT09IHBpZWNlLmNvbG9yICYmIHN0YXRlLnR1cm5Db2xvciA9PT0gcGllY2UuY29sb3IpKVxuICApO1xufVxuXG5mdW5jdGlvbiBpc0Ryb3BwYWJsZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBzcGFyZTogYm9vbGVhbik6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIChzcGFyZSB8fCBudW1iZXJJbkhhbmQoc3RhdGUsIHBpZWNlKSA+IDApICYmXG4gICAgKHN0YXRlLmFjdGl2ZUNvbG9yID09PSAnYm90aCcgfHxcbiAgICAgIChzdGF0ZS5hY3RpdmVDb2xvciA9PT0gcGllY2UuY29sb3IgJiYgc3RhdGUudHVybkNvbG9yID09PSBwaWVjZS5jb2xvcikpXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5Nb3ZlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIG9yaWcgIT09IGRlc3QgJiZcbiAgICBpc01vdmFibGUoc3RhdGUsIG9yaWcpICYmXG4gICAgKHN0YXRlLm1vdmFibGUuZnJlZSB8fCAhIXN0YXRlLm1vdmFibGUuZGVzdHM/LmdldChvcmlnKT8uaW5jbHVkZXMoZGVzdCkpXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5Ecm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGRlc3Q6IHNnLktleSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIGlzRHJvcHBhYmxlKHN0YXRlLCBwaWVjZSwgc3RhdGUuZHJvcHBhYmxlLnNwYXJlKSAmJlxuICAgIChzdGF0ZS5kcm9wcGFibGUuZnJlZSB8fFxuICAgICAgc3RhdGUuZHJvcHBhYmxlLnNwYXJlIHx8XG4gICAgICAhIXN0YXRlLmRyb3BwYWJsZS5kZXN0cz8uZ2V0KHBpZWNlTmFtZU9mKHBpZWNlKSk/LmluY2x1ZGVzKGRlc3QpKVxuICApO1xufVxuXG5mdW5jdGlvbiBjYW5Nb3ZlUHJvbW90ZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgb3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXMuZ2V0KG9yaWcpO1xuICByZXR1cm4gISFwaWVjZSAmJiBzdGF0ZS5wcm9tb3Rpb24ubW92ZVByb21vdGlvbkRpYWxvZyhvcmlnLCBkZXN0KTtcbn1cblxuZnVuY3Rpb24gY2FuRHJvcFByb21vdGUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgcmV0dXJuICFzdGF0ZS5kcm9wcGFibGUuc3BhcmUgJiYgc3RhdGUucHJvbW90aW9uLmRyb3BQcm9tb3Rpb25EaWFsb2cocGllY2UsIGtleSk7XG59XG5cbmZ1bmN0aW9uIGlzUHJlbW92YWJsZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgb3JpZzogc2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzLmdldChvcmlnKTtcbiAgcmV0dXJuIChcbiAgICAhIXBpZWNlICYmXG4gICAgc3RhdGUucHJlbW92YWJsZS5lbmFibGVkICYmXG4gICAgc3RhdGUuYWN0aXZlQ29sb3IgPT09IHBpZWNlLmNvbG9yICYmXG4gICAgc3RhdGUudHVybkNvbG9yICE9PSBwaWVjZS5jb2xvclxuICApO1xufVxuXG5mdW5jdGlvbiBpc1ByZWRyb3BwYWJsZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgbnVtYmVySW5IYW5kKHN0YXRlLCBwaWVjZSkgPiAwICYmXG4gICAgc3RhdGUucHJlZHJvcHBhYmxlLmVuYWJsZWQgJiZcbiAgICBzdGF0ZS5hY3RpdmVDb2xvciA9PT0gcGllY2UuY29sb3IgJiZcbiAgICBzdGF0ZS50dXJuQ29sb3IgIT09IHBpZWNlLmNvbG9yXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5QcmVtb3ZlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIG9yaWcgIT09IGRlc3QgJiZcbiAgICBpc1ByZW1vdmFibGUoc3RhdGUsIG9yaWcpICYmXG4gICAgISFzdGF0ZS5wcmVtb3ZhYmxlLmdlbmVyYXRlICYmXG4gICAgc3RhdGUucHJlbW92YWJsZS5nZW5lcmF0ZShvcmlnLCBzdGF0ZS5waWVjZXMpLmluY2x1ZGVzKGRlc3QpXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5QcmVkcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGRlc3Q6IHNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBkZXN0UGllY2UgPSBzdGF0ZS5waWVjZXMuZ2V0KGRlc3QpO1xuICByZXR1cm4gKFxuICAgIGlzUHJlZHJvcHBhYmxlKHN0YXRlLCBwaWVjZSkgJiZcbiAgICAoIWRlc3RQaWVjZSB8fCBkZXN0UGllY2UuY29sb3IgIT09IHN0YXRlLmFjdGl2ZUNvbG9yKSAmJlxuICAgICEhc3RhdGUucHJlZHJvcHBhYmxlLmdlbmVyYXRlICYmXG4gICAgc3RhdGUucHJlZHJvcHBhYmxlLmdlbmVyYXRlKHBpZWNlLCBzdGF0ZS5waWVjZXMpLmluY2x1ZGVzKGRlc3QpXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RyYWdnYWJsZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBmcm9tSGFuZCA9IGZhbHNlKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgc3RhdGUuZHJhZ2dhYmxlLmVuYWJsZWQgJiZcbiAgICAoc3RhdGUuYWN0aXZlQ29sb3IgPT09ICdib3RoJyB8fFxuICAgICAgKHN0YXRlLmFjdGl2ZUNvbG9yID09PSBwaWVjZS5jb2xvciAmJlxuICAgICAgICAoc3RhdGUudHVybkNvbG9yID09PSBwaWVjZS5jb2xvciB8fFxuICAgICAgICAgIChmcm9tSGFuZCA/IHN0YXRlLnByZWRyb3BwYWJsZS5lbmFibGVkIDogc3RhdGUucHJlbW92YWJsZS5lbmFibGVkKSkpKVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGxheVByZW1vdmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiBib29sZWFuIHtcbiAgY29uc3QgbW92ZSA9IHN0YXRlLnByZW1vdmFibGUuY3VycmVudDtcbiAgaWYgKCFtb3ZlKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IG9yaWcgPSBtb3ZlLm9yaWc7XG4gIGNvbnN0IGRlc3QgPSBtb3ZlLmRlc3Q7XG4gIGNvbnN0IHByb20gPSBtb3ZlLnByb207XG4gIGxldCBzdWNjZXNzID0gZmFsc2U7XG4gIGlmIChjYW5Nb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGJhc2VVc2VyTW92ZShzdGF0ZSwgb3JpZywgZGVzdCwgcHJvbSk7XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgY29uc3QgbWV0YWRhdGE6IHNnLk1vdmVNZXRhZGF0YSA9IHsgcHJlbWFkZTogdHJ1ZSB9O1xuICAgICAgaWYgKHJlc3VsdCAhPT0gdHJ1ZSkgbWV0YWRhdGEuY2FwdHVyZWQgPSByZXN1bHQ7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLm1vdmFibGUuZXZlbnRzLmFmdGVyLCBvcmlnLCBkZXN0LCBwcm9tLCBtZXRhZGF0YSk7XG4gICAgICBzdWNjZXNzID0gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgdW5zZXRQcmVtb3ZlKHN0YXRlKTtcbiAgcmV0dXJuIHN1Y2Nlc3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwbGF5UHJlZHJvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IGJvb2xlYW4ge1xuICBjb25zdCBkcm9wID0gc3RhdGUucHJlZHJvcHBhYmxlLmN1cnJlbnQ7XG4gIGlmICghZHJvcCkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBwaWVjZSA9IGRyb3AucGllY2U7XG4gIGNvbnN0IGtleSA9IGRyb3Aua2V5O1xuICBjb25zdCBwcm9tID0gZHJvcC5wcm9tO1xuICBsZXQgc3VjY2VzcyA9IGZhbHNlO1xuICBpZiAoY2FuRHJvcChzdGF0ZSwgcGllY2UsIGtleSkpIHtcbiAgICBpZiAoYmFzZVVzZXJEcm9wKHN0YXRlLCBwaWVjZSwga2V5LCBwcm9tKSkge1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5kcm9wcGFibGUuZXZlbnRzLmFmdGVyLCBwaWVjZSwga2V5LCBwcm9tLCB7IHByZW1hZGU6IHRydWUgfSk7XG4gICAgICBzdWNjZXNzID0gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbiAgcmV0dXJuIHN1Y2Nlc3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWxNb3ZlT3JEcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIHVuc2VsZWN0KHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbmNlbFByb21vdGlvbihzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICBpZiAoIXN0YXRlLnByb21vdGlvbi5jdXJyZW50KSByZXR1cm47XG5cbiAgdW5zZWxlY3Qoc3RhdGUpO1xuICBzdGF0ZS5wcm9tb3Rpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgc3RhdGUuaG92ZXJlZCA9IHVuZGVmaW5lZDtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcm9tb3Rpb24uZXZlbnRzLmNhbmNlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdG9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIHN0YXRlLmFjdGl2ZUNvbG9yID1cbiAgICBzdGF0ZS5tb3ZhYmxlLmRlc3RzID1cbiAgICBzdGF0ZS5kcm9wcGFibGUuZGVzdHMgPVxuICAgIHN0YXRlLmRyYWdnYWJsZS5jdXJyZW50ID1cbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9XG4gICAgc3RhdGUucHJvbW90aW9uLmN1cnJlbnQgPVxuICAgIHN0YXRlLmhvdmVyZWQgPVxuICAgICAgdW5kZWZpbmVkO1xuICBjYW5jZWxNb3ZlT3JEcm9wKHN0YXRlKTtcbn1cbiIsICJpbXBvcnQgeyBmaWxlcywgcmFua3MgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgcG9zMmtleSB9IGZyb20gJy4vdXRpbC5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmZlckRpbWVuc2lvbnMoYm9hcmRTZmVuOiBzZy5Cb2FyZFNmZW4pOiBzZy5EaW1lbnNpb25zIHtcbiAgY29uc3QgcmFua3MgPSBib2FyZFNmZW4uc3BsaXQoJy8nKTtcbiAgY29uc3QgZmlyc3RGaWxlID0gcmFua3NbMF0uc3BsaXQoJycpO1xuICBsZXQgZmlsZXNDbnQgPSAwO1xuICBsZXQgY250ID0gMDtcbiAgZm9yIChjb25zdCBjIG9mIGZpcnN0RmlsZSkge1xuICAgIGNvbnN0IG5iID0gYy5jaGFyQ29kZUF0KDApO1xuICAgIGlmIChuYiA8IDU4ICYmIG5iID4gNDcpIGNudCA9IGNudCAqIDEwICsgbmIgLSA0ODtcbiAgICBlbHNlIGlmIChjICE9PSAnKycpIHtcbiAgICAgIGZpbGVzQ250ICs9IGNudCArIDE7XG4gICAgICBjbnQgPSAwO1xuICAgIH1cbiAgfVxuICBmaWxlc0NudCArPSBjbnQ7XG4gIHJldHVybiB7IGZpbGVzOiBmaWxlc0NudCwgcmFua3M6IHJhbmtzLmxlbmd0aCB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2ZlblRvQm9hcmQoXG4gIHNmZW46IHNnLkJvYXJkU2ZlbixcbiAgZGltczogc2cuRGltZW5zaW9ucyxcbiAgZnJvbUZvcnN5dGg/OiAoZm9yc3l0aDogc3RyaW5nKSA9PiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkLFxuKTogc2cuUGllY2VzIHtcbiAgY29uc3Qgc2ZlblBhcnNlciA9IGZyb21Gb3JzeXRoIHx8IHN0YW5kYXJkRnJvbUZvcnN5dGg7XG4gIGNvbnN0IHBpZWNlczogc2cuUGllY2VzID0gbmV3IE1hcCgpO1xuICBsZXQgeCA9IGRpbXMuZmlsZXMgLSAxO1xuICBsZXQgeSA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2Zlbi5sZW5ndGg7IGkrKykge1xuICAgIHN3aXRjaCAoc2ZlbltpXSkge1xuICAgICAgY2FzZSAnICc6XG4gICAgICBjYXNlICdfJzpcbiAgICAgICAgcmV0dXJuIHBpZWNlcztcbiAgICAgIGNhc2UgJy8nOlxuICAgICAgICArK3k7XG4gICAgICAgIGlmICh5ID4gZGltcy5yYW5rcyAtIDEpIHJldHVybiBwaWVjZXM7XG4gICAgICAgIHggPSBkaW1zLmZpbGVzIC0gMTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIGNvbnN0IG5iMSA9IHNmZW5baV0uY2hhckNvZGVBdCgwKTtcbiAgICAgICAgY29uc3QgbmIyID0gc2ZlbltpICsgMV0gJiYgc2ZlbltpICsgMV0uY2hhckNvZGVBdCgwKTtcbiAgICAgICAgaWYgKG5iMSA8IDU4ICYmIG5iMSA+IDQ3KSB7XG4gICAgICAgICAgaWYgKG5iMiAmJiBuYjIgPCA1OCAmJiBuYjIgPiA0Nykge1xuICAgICAgICAgICAgeCAtPSAobmIxIC0gNDgpICogMTAgKyAobmIyIC0gNDgpO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgIH0gZWxzZSB4IC09IG5iMSAtIDQ4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHJvbGVTdHIgPSBzZmVuW2ldID09PSAnKycgJiYgc2Zlbi5sZW5ndGggPiBpICsgMSA/IGArJHtzZmVuWysraV19YCA6IHNmZW5baV07XG4gICAgICAgICAgY29uc3Qgcm9sZSA9IHNmZW5QYXJzZXIocm9sZVN0cik7XG4gICAgICAgICAgaWYgKHggPj0gMCAmJiByb2xlKSB7XG4gICAgICAgICAgICBjb25zdCBjb2xvciA9IHJvbGVTdHIgPT09IHJvbGVTdHIudG9Mb3dlckNhc2UoKSA/ICdnb3RlJyA6ICdzZW50ZSc7XG4gICAgICAgICAgICBwaWVjZXMuc2V0KHBvczJrZXkoW3gsIHldKSwge1xuICAgICAgICAgICAgICByb2xlOiByb2xlLFxuICAgICAgICAgICAgICBjb2xvcjogY29sb3IsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLS14O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBwaWVjZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBib2FyZFRvU2ZlbihcbiAgcGllY2VzOiBzZy5QaWVjZXMsXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIHRvRm9yc3l0aD86IChyb2xlOiBzZy5Sb2xlU3RyaW5nKSA9PiBzdHJpbmcgfCB1bmRlZmluZWQsXG4pOiBzZy5Cb2FyZFNmZW4ge1xuICBjb25zdCBzZmVuUmVuZGVyZXIgPSB0b0ZvcnN5dGggfHwgc3RhbmRhcmRUb0ZvcnN5dGg7XG4gIGNvbnN0IHJldmVyc2VkRmlsZXMgPSBmaWxlcy5zbGljZSgwLCBkaW1zLmZpbGVzKS5yZXZlcnNlKCk7XG4gIHJldHVybiByYW5rc1xuICAgIC5zbGljZSgwLCBkaW1zLnJhbmtzKVxuICAgIC5tYXAoKHkpID0+XG4gICAgICByZXZlcnNlZEZpbGVzXG4gICAgICAgIC5tYXAoKHgpID0+IHtcbiAgICAgICAgICBjb25zdCBwaWVjZSA9IHBpZWNlcy5nZXQoKHggKyB5KSBhcyBzZy5LZXkpO1xuICAgICAgICAgIGNvbnN0IGZvcnN5dGggPSBwaWVjZSAmJiBzZmVuUmVuZGVyZXIocGllY2Uucm9sZSk7XG4gICAgICAgICAgaWYgKGZvcnN5dGgpIHtcbiAgICAgICAgICAgIHJldHVybiBwaWVjZS5jb2xvciA9PT0gJ3NlbnRlJyA/IGZvcnN5dGgudG9VcHBlckNhc2UoKSA6IGZvcnN5dGgudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICB9IGVsc2UgcmV0dXJuICcxJztcbiAgICAgICAgfSlcbiAgICAgICAgLmpvaW4oJycpLFxuICAgIClcbiAgICAuam9pbignLycpXG4gICAgLnJlcGxhY2UoLzF7Mix9L2csIChzKSA9PiBzLmxlbmd0aC50b1N0cmluZygpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNmZW5Ub0hhbmRzKFxuICBzZmVuOiBzZy5IYW5kc1NmZW4sXG4gIGZyb21Gb3JzeXRoPzogKGZvcnN5dGg6IHN0cmluZykgPT4gc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZCxcbik6IHNnLkhhbmRzIHtcbiAgY29uc3Qgc2ZlblBhcnNlciA9IGZyb21Gb3JzeXRoIHx8IHN0YW5kYXJkRnJvbUZvcnN5dGg7XG4gIGNvbnN0IHNlbnRlOiBzZy5IYW5kID0gbmV3IE1hcCgpO1xuICBjb25zdCBnb3RlOiBzZy5IYW5kID0gbmV3IE1hcCgpO1xuXG4gIGxldCB0bXBOdW0gPSAwO1xuICBsZXQgbnVtID0gMTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgbmIgPSBzZmVuW2ldLmNoYXJDb2RlQXQoMCk7XG4gICAgaWYgKG5iIDwgNTggJiYgbmIgPiA0Nykge1xuICAgICAgdG1wTnVtID0gdG1wTnVtICogMTAgKyBuYiAtIDQ4O1xuICAgICAgbnVtID0gdG1wTnVtO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCByb2xlU3RyID0gc2ZlbltpXSA9PT0gJysnICYmIHNmZW4ubGVuZ3RoID4gaSArIDEgPyBgKyR7c2ZlblsrK2ldfWAgOiBzZmVuW2ldO1xuICAgICAgY29uc3Qgcm9sZSA9IHNmZW5QYXJzZXIocm9sZVN0cik7XG4gICAgICBpZiAocm9sZSkge1xuICAgICAgICBjb25zdCBjb2xvciA9IHJvbGVTdHIgPT09IHJvbGVTdHIudG9Mb3dlckNhc2UoKSA/ICdnb3RlJyA6ICdzZW50ZSc7XG4gICAgICAgIGlmIChjb2xvciA9PT0gJ3NlbnRlJykgc2VudGUuc2V0KHJvbGUsIChzZW50ZS5nZXQocm9sZSkgfHwgMCkgKyBudW0pO1xuICAgICAgICBlbHNlIGdvdGUuc2V0KHJvbGUsIChnb3RlLmdldChyb2xlKSB8fCAwKSArIG51bSk7XG4gICAgICB9XG4gICAgICB0bXBOdW0gPSAwO1xuICAgICAgbnVtID0gMTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IE1hcChbXG4gICAgWydzZW50ZScsIHNlbnRlXSxcbiAgICBbJ2dvdGUnLCBnb3RlXSxcbiAgXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYW5kc1RvU2ZlbihcbiAgaGFuZHM6IHNnLkhhbmRzLFxuICByb2xlczogc2cuUm9sZVN0cmluZ1tdLFxuICB0b0ZvcnN5dGg/OiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc3RyaW5nIHwgdW5kZWZpbmVkLFxuKTogc2cuSGFuZHNTZmVuIHtcbiAgY29uc3Qgc2ZlblJlbmRlcmVyID0gdG9Gb3JzeXRoIHx8IHN0YW5kYXJkVG9Gb3JzeXRoO1xuXG4gIGxldCBzZW50ZUhhbmRTdHIgPSAnJztcbiAgbGV0IGdvdGVIYW5kU3RyID0gJyc7XG4gIGZvciAoY29uc3Qgcm9sZSBvZiByb2xlcykge1xuICAgIGNvbnN0IGZvcnN5dGggPSBzZmVuUmVuZGVyZXIocm9sZSk7XG4gICAgaWYgKGZvcnN5dGgpIHtcbiAgICAgIGNvbnN0IHNlbnRlQ250ID0gaGFuZHMuZ2V0KCdzZW50ZScpPy5nZXQocm9sZSk7XG4gICAgICBjb25zdCBnb3RlQ250ID0gaGFuZHMuZ2V0KCdnb3RlJyk/LmdldChyb2xlKTtcbiAgICAgIGlmIChzZW50ZUNudCkgc2VudGVIYW5kU3RyICs9IHNlbnRlQ250ID4gMSA/IHNlbnRlQ250LnRvU3RyaW5nKCkgKyBmb3JzeXRoIDogZm9yc3l0aDtcbiAgICAgIGlmIChnb3RlQ250KSBnb3RlSGFuZFN0ciArPSBnb3RlQ250ID4gMSA/IGdvdGVDbnQudG9TdHJpbmcoKSArIGZvcnN5dGggOiBmb3JzeXRoO1xuICAgIH1cbiAgfVxuICBpZiAoc2VudGVIYW5kU3RyIHx8IGdvdGVIYW5kU3RyKSByZXR1cm4gc2VudGVIYW5kU3RyLnRvVXBwZXJDYXNlKCkgKyBnb3RlSGFuZFN0ci50b0xvd2VyQ2FzZSgpO1xuICBlbHNlIHJldHVybiAnLSc7XG59XG5cbmZ1bmN0aW9uIHN0YW5kYXJkRnJvbUZvcnN5dGgoZm9yc3l0aDogc3RyaW5nKTogc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIHN3aXRjaCAoZm9yc3l0aC50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAncCc6XG4gICAgICByZXR1cm4gJ3Bhd24nO1xuICAgIGNhc2UgJ2wnOlxuICAgICAgcmV0dXJuICdsYW5jZSc7XG4gICAgY2FzZSAnbic6XG4gICAgICByZXR1cm4gJ2tuaWdodCc7XG4gICAgY2FzZSAncyc6XG4gICAgICByZXR1cm4gJ3NpbHZlcic7XG4gICAgY2FzZSAnZyc6XG4gICAgICByZXR1cm4gJ2dvbGQnO1xuICAgIGNhc2UgJ2InOlxuICAgICAgcmV0dXJuICdiaXNob3AnO1xuICAgIGNhc2UgJ3InOlxuICAgICAgcmV0dXJuICdyb29rJztcbiAgICBjYXNlICcrcCc6XG4gICAgICByZXR1cm4gJ3Rva2luJztcbiAgICBjYXNlICcrbCc6XG4gICAgICByZXR1cm4gJ3Byb21vdGVkbGFuY2UnO1xuICAgIGNhc2UgJytuJzpcbiAgICAgIHJldHVybiAncHJvbW90ZWRrbmlnaHQnO1xuICAgIGNhc2UgJytzJzpcbiAgICAgIHJldHVybiAncHJvbW90ZWRzaWx2ZXInO1xuICAgIGNhc2UgJytiJzpcbiAgICAgIHJldHVybiAnaG9yc2UnO1xuICAgIGNhc2UgJytyJzpcbiAgICAgIHJldHVybiAnZHJhZ29uJztcbiAgICBjYXNlICdrJzpcbiAgICAgIHJldHVybiAna2luZyc7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybjtcbiAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIHN0YW5kYXJkVG9Gb3JzeXRoKHJvbGU6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIHN3aXRjaCAocm9sZSkge1xuICAgIGNhc2UgJ3Bhd24nOlxuICAgICAgcmV0dXJuICdwJztcbiAgICBjYXNlICdsYW5jZSc6XG4gICAgICByZXR1cm4gJ2wnO1xuICAgIGNhc2UgJ2tuaWdodCc6XG4gICAgICByZXR1cm4gJ24nO1xuICAgIGNhc2UgJ3NpbHZlcic6XG4gICAgICByZXR1cm4gJ3MnO1xuICAgIGNhc2UgJ2dvbGQnOlxuICAgICAgcmV0dXJuICdnJztcbiAgICBjYXNlICdiaXNob3AnOlxuICAgICAgcmV0dXJuICdiJztcbiAgICBjYXNlICdyb29rJzpcbiAgICAgIHJldHVybiAncic7XG4gICAgY2FzZSAndG9raW4nOlxuICAgICAgcmV0dXJuICcrcCc7XG4gICAgY2FzZSAncHJvbW90ZWRsYW5jZSc6XG4gICAgICByZXR1cm4gJytsJztcbiAgICBjYXNlICdwcm9tb3RlZGtuaWdodCc6XG4gICAgICByZXR1cm4gJytuJztcbiAgICBjYXNlICdwcm9tb3RlZHNpbHZlcic6XG4gICAgICByZXR1cm4gJytzJztcbiAgICBjYXNlICdob3JzZSc6XG4gICAgICByZXR1cm4gJytiJztcbiAgICBjYXNlICdkcmFnb24nOlxuICAgICAgcmV0dXJuICcrcic7XG4gICAgY2FzZSAna2luZyc6XG4gICAgICByZXR1cm4gJ2snO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm47XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBzZXRDaGVja3MsIHNldFByZURlc3RzLCB1bnNlbGVjdCB9IGZyb20gJy4vYm9hcmQuanMnO1xuaW1wb3J0IHsgaW5mZXJEaW1lbnNpb25zLCBzZmVuVG9Cb2FyZCwgc2ZlblRvSGFuZHMgfSBmcm9tICcuL3NmZW4uanMnO1xuaW1wb3J0IHR5cGUgeyBIZWFkbGVzc1N0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgc2FtZVBpZWNlIH0gZnJvbSAnLi91dGlsLmpzJztcblxudHlwZSBEZWVwUGFydGlhbDxULCBBdG9taWMgPSBuZXZlcj4gPSBUIGV4dGVuZHNcbiAgfCBBdG9taWNcbiAgfCAoKC4uLmFyZ3M6IG5ldmVyW10pID0+IHVua25vd24pXG4gIHwgcmVhZG9ubHkgdW5rbm93bltdXG4gIHwgUmVhZG9ubHlNYXA8dW5rbm93biwgdW5rbm93bj5cbiAgfCBSZWFkb25seVNldDx1bmtub3duPlxuICA/IFRcbiAgOiBUIGV4dGVuZHMgb2JqZWN0XG4gICAgPyB7IFtLIGluIGtleW9mIFRdPzogRGVlcFBhcnRpYWw8VFtLXSwgQXRvbWljPiB9XG4gICAgOiBUO1xuXG4vLyBLZWVwIGludGVybmFsIGZpZWxkcyBvdXQgb2YgY29uZmlnLCBpbmNsdWRpbmcgdGhvc2UgbmVzdGVkIGFsb25nc2lkZSBvcHRpb25zLlxudHlwZSBDb25maWd1cmFibGVTdGF0ZSA9IE9taXQ8XG4gIEhlYWRsZXNzU3RhdGUsXG4gIHwgJ3BpZWNlcydcbiAgfCAnZGltZW5zaW9ucydcbiAgfCAnY2hlY2tzJ1xuICB8ICdob3ZlcmVkJ1xuICB8ICdhbmltYXRpb24nXG4gIHwgJ2hhbmRzJ1xuICB8ICdwcmVtb3ZhYmxlJ1xuICB8ICdwcmVkcm9wcGFibGUnXG4gIHwgJ2RyYWdnYWJsZSdcbiAgfCAncHJvbW90aW9uJ1xuICB8ICdkcmF3YWJsZSdcbj4gJiB7XG4gIGFuaW1hdGlvbjogT21pdDxIZWFkbGVzc1N0YXRlWydhbmltYXRpb24nXSwgJ2N1cnJlbnQnPjtcbiAgaGFuZHM6IE9taXQ8SGVhZGxlc3NTdGF0ZVsnaGFuZHMnXSwgJ2hhbmRNYXAnPjtcbiAgcHJlbW92YWJsZTogT21pdDxIZWFkbGVzc1N0YXRlWydwcmVtb3ZhYmxlJ10sICdjdXJyZW50JyB8ICdkZXN0cyc+O1xuICBwcmVkcm9wcGFibGU6IE9taXQ8SGVhZGxlc3NTdGF0ZVsncHJlZHJvcHBhYmxlJ10sICdjdXJyZW50JyB8ICdkZXN0cyc+O1xuICBkcmFnZ2FibGU6IE9taXQ8SGVhZGxlc3NTdGF0ZVsnZHJhZ2dhYmxlJ10sICdjdXJyZW50Jz47XG4gIHByb21vdGlvbjogT21pdDxIZWFkbGVzc1N0YXRlWydwcm9tb3Rpb24nXSwgJ2N1cnJlbnQnIHwgJ3ByZXZQcm9tb3Rpb25IYXNoJz47XG4gIGRyYXdhYmxlOiBPbWl0PEhlYWRsZXNzU3RhdGVbJ2RyYXdhYmxlJ10sICdjdXJyZW50JyB8ICdwcmV2U3ZnSGFzaCcgfCAncGllY2UnPjtcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29uZmlnIGV4dGVuZHMgRGVlcFBhcnRpYWw8Q29uZmlndXJhYmxlU3RhdGUsIHNnLlBpZWNlPiB7XG4gIHNmZW4/OiB7XG4gICAgYm9hcmQ/OiBzZy5Cb2FyZFNmZW47IC8vIHBpZWNlcyBvbiB0aGUgYm9hcmQgaW4gRm9yc3l0aCBub3RhdGlvblxuICAgIGhhbmRzPzogc2cuSGFuZHNTZmVuOyAvLyBwaWVjZXMgaW4gaGFuZCBpbiBGb3JzeXRoIG5vdGF0aW9uXG4gIH07XG4gIGNoZWNrcz86IHNnLktleVtdIHwgc2cuQ29sb3IgfCBib29sZWFuOyAvLyBzcXVhcmVzIGN1cnJlbnRseSBpbiBjaGVjayBbXCI1YVwiXSwgY29sb3IgaW4gY2hlY2sgKHNlZSBoaWdobGlnaHQuY2hlY2tSb2xlcykgb3IgYm9vbGVhbiBmb3IgY3VycmVudCB0dXJuIGNvbG9yXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseUFuaW1hdGlvbihzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgY29uZmlnOiBDb25maWcpOiB2b2lkIHtcbiAgaWYgKGNvbmZpZy5hbmltYXRpb24pIHtcbiAgICBkZWVwTWVyZ2Uoc3RhdGUuYW5pbWF0aW9uLCBjb25maWcuYW5pbWF0aW9uKTtcbiAgICAvLyBubyBuZWVkIGZvciBzdWNoIHNob3J0IGFuaW1hdGlvbnNcbiAgICBpZiAoKHN0YXRlLmFuaW1hdGlvbi5kdXJhdGlvbiB8fCAwKSA8IDcwKSBzdGF0ZS5hbmltYXRpb24uZW5hYmxlZCA9IGZhbHNlO1xuICAgIGlmICghc3RhdGUuYW5pbWF0aW9uLmVuYWJsZWQpIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25maWd1cmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIGNvbmZpZzogQ29uZmlnKTogdm9pZCB7XG4gIC8vIGRvbid0IG1lcmdlLCBqdXN0IG92ZXJyaWRlLlxuICBpZiAoY29uZmlnLm1vdmFibGU/LmRlc3RzKSBzdGF0ZS5tb3ZhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICBpZiAoY29uZmlnLmRyb3BwYWJsZT8uZGVzdHMpIHN0YXRlLmRyb3BwYWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbiAgaWYgKGNvbmZpZy5kcmF3YWJsZT8uc2hhcGVzKSBzdGF0ZS5kcmF3YWJsZS5zaGFwZXMgPSBbXTtcbiAgaWYgKGNvbmZpZy5kcmF3YWJsZT8uYXV0b1NoYXBlcykgc3RhdGUuZHJhd2FibGUuYXV0b1NoYXBlcyA9IFtdO1xuICBpZiAoY29uZmlnLmRyYXdhYmxlPy5zcXVhcmVzKSBzdGF0ZS5kcmF3YWJsZS5zcXVhcmVzID0gW107XG4gIGlmIChjb25maWcuaGFuZHM/LnJvbGVzKSBzdGF0ZS5oYW5kcy5yb2xlcyA9IFtdO1xuXG4gIGRlZXBNZXJnZShzdGF0ZSwgY29uZmlnKTtcblxuICAvLyBpZiBhIHNmZW4gd2FzIHByb3ZpZGVkLCByZXBsYWNlIHRoZSBwaWVjZXMsIGV4Y2VwdCB0aGUgY3VycmVudGx5IGRyYWdnZWQgb25lXG4gIGlmIChjb25maWcuc2Zlbj8uYm9hcmQpIHtcbiAgICBzdGF0ZS5kaW1lbnNpb25zID0gaW5mZXJEaW1lbnNpb25zKGNvbmZpZy5zZmVuLmJvYXJkKTtcbiAgICBzdGF0ZS5waWVjZXMgPSBzZmVuVG9Cb2FyZChjb25maWcuc2Zlbi5ib2FyZCwgc3RhdGUuZGltZW5zaW9ucywgc3RhdGUuZm9yc3l0aC5mcm9tRm9yc3l0aCk7XG4gICAgaWYgKHN0YXRlLnByb21vdGlvbi5jdXJyZW50KSB7XG4gICAgICAvLyBLZWVwIHBlbmRpbmcgcHJlbW92ZSBwcm9tb3Rpb24gd2hlbiB0aGUgc2VsZWN0ZWQgcGllY2Ugc3Vydml2ZXMgdGhlIHVwZGF0ZS5cbiAgICAgIGNvbnN0IHBpZWNlID0gc3RhdGUuc2VsZWN0ZWQgPyBzdGF0ZS5waWVjZXMuZ2V0KHN0YXRlLnNlbGVjdGVkKSA6IHN0YXRlLnNlbGVjdGVkUGllY2U7XG4gICAgICBpZiAoIXBpZWNlIHx8ICFzYW1lUGllY2UocGllY2UsIHN0YXRlLnByb21vdGlvbi5jdXJyZW50LnBpZWNlKSkgdW5zZWxlY3Qoc3RhdGUpO1xuICAgIH1cbiAgICBzdGF0ZS5kcmF3YWJsZS5zaGFwZXMgPSBjb25maWcuZHJhd2FibGU/LnNoYXBlcyB8fCBbXTtcbiAgfVxuXG4gIGlmIChjb25maWcuc2Zlbj8uaGFuZHMpIHtcbiAgICBzdGF0ZS5oYW5kcy5oYW5kTWFwID0gc2ZlblRvSGFuZHMoY29uZmlnLnNmZW4uaGFuZHMsIHN0YXRlLmZvcnN5dGguZnJvbUZvcnN5dGgpO1xuICB9XG5cbiAgLy8gYXBwbHkgY29uZmlnIHZhbHVlcyB0aGF0IGNvdWxkIGJlIHVuZGVmaW5lZCB5ZXQgbWVhbmluZ2Z1bFxuICBpZiAoJ2NoZWNrcycgaW4gY29uZmlnKSBzZXRDaGVja3Moc3RhdGUsIGNvbmZpZy5jaGVja3MgfHwgZmFsc2UpO1xuICBpZiAoJ2xhc3RQaWVjZScgaW4gY29uZmlnICYmICFjb25maWcubGFzdFBpZWNlKSBzdGF0ZS5sYXN0UGllY2UgPSB1bmRlZmluZWQ7XG5cbiAgLy8gaW4gY2FzZSBvZiBkcm9wIGxhc3QgbW92ZSwgdGhlcmUncyBhIHNpbmdsZSBzcXVhcmUuXG4gIC8vIGlmIHRoZSBwcmV2aW91cyBsYXN0IG1vdmUgaGFkIHR3byBzcXVhcmVzLFxuICAvLyB0aGUgbWVyZ2UgYWxnb3JpdGhtIHdpbGwgaW5jb3JyZWN0bHkga2VlcCB0aGUgc2Vjb25kIHNxdWFyZS5cbiAgaWYgKCdsYXN0RGVzdHMnIGluIGNvbmZpZyAmJiAhY29uZmlnLmxhc3REZXN0cykgc3RhdGUubGFzdERlc3RzID0gdW5kZWZpbmVkO1xuICBlbHNlIGlmIChjb25maWcubGFzdERlc3RzKSBzdGF0ZS5sYXN0RGVzdHMgPSBjb25maWcubGFzdERlc3RzO1xuXG4gIC8vIGZpeCBtb3ZlL3ByZW1vdmUgZGVzdHNcbiAgc2V0UHJlRGVzdHMoc3RhdGUpO1xuXG4gIGFwcGx5QW5pbWF0aW9uKHN0YXRlLCBjb25maWcpO1xufVxuXG5mdW5jdGlvbiBkZWVwTWVyZ2UoYmFzZTogYW55LCBleHRlbmQ6IGFueSk6IHZvaWQge1xuICBmb3IgKGNvbnN0IGtleSBpbiBleHRlbmQpIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGV4dGVuZCwga2V5KSkge1xuICAgICAgaWYgKFxuICAgICAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYmFzZSwga2V5KSAmJlxuICAgICAgICBpc1BsYWluT2JqZWN0KGJhc2Vba2V5XSkgJiZcbiAgICAgICAgaXNQbGFpbk9iamVjdChleHRlbmRba2V5XSlcbiAgICAgIClcbiAgICAgICAgZGVlcE1lcmdlKGJhc2Vba2V5XSwgZXh0ZW5kW2tleV0pO1xuICAgICAgZWxzZSBiYXNlW2tleV0gPSBleHRlbmRba2V5XTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNQbGFpbk9iamVjdChvOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIGlmICh0eXBlb2YgbyAhPT0gJ29iamVjdCcgfHwgbyA9PT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvKTtcbiAgcmV0dXJuIHByb3RvID09PSBPYmplY3QucHJvdG90eXBlIHx8IHByb3RvID09PSBudWxsO1xufVxuIiwgImltcG9ydCB0eXBlIHsgRHJhd0N1cnJlbnQsIERyYXdTaGFwZSwgRHJhd1NoYXBlUGllY2UgfSBmcm9tICcuL2RyYXcuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7XG4gIGNyZWF0ZUVsLFxuICBrZXkycG9zLFxuICBwaWVjZU5hbWVPZixcbiAgcG9zT2ZPdXRzaWRlRWwsXG4gIHBvc1RvVHJhbnNsYXRlUmVsLFxuICBzYW1lUGllY2UsXG4gIHNlbnRlUG92LFxuICB0cmFuc2xhdGVSZWwsXG59IGZyb20gJy4vdXRpbC5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTVkdFbGVtZW50KHRhZ05hbWU6IHN0cmluZyk6IFNWR0VsZW1lbnQge1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsIHRhZ05hbWUpO1xufVxuXG5pbnRlcmZhY2UgU2hhcGUge1xuICBzaGFwZTogRHJhd1NoYXBlO1xuICBoYXNoOiBIYXNoO1xuICBjdXJyZW50PzogYm9vbGVhbjtcbn1cblxudHlwZSBBcnJvd0Rlc3RzID0gTWFwPHNnLktleSB8IHNnLlBpZWNlTmFtZSwgbnVtYmVyPjsgLy8gaG93IG1hbnkgYXJyb3dzIGxhbmQgb24gYSBzcXVhcmVcblxudHlwZSBIYXNoID0gc3RyaW5nO1xuXG5jb25zdCBvdXRzaWRlQXJyb3dIYXNoID0gJ291dHNpZGVBcnJvdyc7XG5jb25zdCBkZWZhdWx0QnJ1c2ggPSAncHJpbWFyeSc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJTaGFwZXMoXG4gIHN0YXRlOiBTdGF0ZSxcbiAgc3ZnOiBTVkdFbGVtZW50LFxuICBjdXN0b21Tdmc6IFNWR0VsZW1lbnQsXG4gIGZyZWVQaWVjZXM6IEhUTUxFbGVtZW50LFxuKTogdm9pZCB7XG4gIGNvbnN0IGQgPSBzdGF0ZS5kcmF3YWJsZTtcbiAgY29uc3QgY3VyRCA9IGQuY3VycmVudDtcbiAgY29uc3QgY3VyID0gY3VyRD8uZGVzdCA/IChjdXJEIGFzIERyYXdTaGFwZSkgOiB1bmRlZmluZWQ7XG4gIGNvbnN0IG91dHNpZGVBcnJvdyA9ICEhY3VyRCAmJiAhY3VyO1xuICBjb25zdCBhcnJvd0Rlc3RzOiBBcnJvd0Rlc3RzID0gbmV3IE1hcCgpO1xuICBjb25zdCBwaWVjZU1hcCA9IG5ldyBNYXA8c2cuS2V5LCBEcmF3U2hhcGU+KCk7XG5cbiAgY29uc3QgaGFzaEJvdW5kcyA9IChwaWVjZTogc2cuUGllY2UpID0+IHtcbiAgICBjb25zdCBib3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpO1xuICAgIGNvbnN0IHBpZWNlQm91bmRzID0gc3RhdGUuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcygpLmdldChwaWVjZU5hbWVPZihwaWVjZSkpO1xuICAgIHJldHVybiBib3VuZHMgJiYgcGllY2VCb3VuZHNcbiAgICAgID8gW1xuICAgICAgICAgIGJvdW5kcy53aWR0aCxcbiAgICAgICAgICBib3VuZHMuaGVpZ2h0LFxuICAgICAgICAgIHBpZWNlQm91bmRzLmxlZnQgLSBib3VuZHMubGVmdCxcbiAgICAgICAgICBwaWVjZUJvdW5kcy50b3AgLSBib3VuZHMudG9wLFxuICAgICAgICAgIHBpZWNlQm91bmRzLndpZHRoLFxuICAgICAgICAgIHBpZWNlQm91bmRzLmhlaWdodCxcbiAgICAgICAgXS5qb2luKCc6JylcbiAgICAgIDogJyc7XG4gIH07XG5cbiAgZm9yIChjb25zdCBzIG9mIGQuc2hhcGVzLmNvbmNhdChkLmF1dG9TaGFwZXMpLmNvbmNhdChjdXIgPyBbY3VyXSA6IFtdKSkge1xuICAgIGNvbnN0IGRlc3ROYW1lID0gaXNQaWVjZShzLmRlc3QpID8gcGllY2VOYW1lT2Yocy5kZXN0KSA6IHMuZGVzdDtcbiAgICBpZiAoIXNhbWVQaWVjZU9yS2V5KHMuZGVzdCwgcy5vcmlnKSlcbiAgICAgIGFycm93RGVzdHMuc2V0KGRlc3ROYW1lLCAoYXJyb3dEZXN0cy5nZXQoZGVzdE5hbWUpIHx8IDApICsgMSk7XG4gIH1cblxuICBmb3IgKGNvbnN0IHMgb2YgZC5zaGFwZXMuY29uY2F0KGN1ciA/IFtjdXJdIDogW10pLmNvbmNhdChkLmF1dG9TaGFwZXMpKSB7XG4gICAgaWYgKHMucGllY2UgJiYgIWlzUGllY2Uocy5vcmlnKSkgcGllY2VNYXAuc2V0KHMub3JpZywgcyk7XG4gIH1cbiAgY29uc3QgcGllY2VTaGFwZXMgPSBbLi4ucGllY2VNYXAudmFsdWVzKCldLm1hcCgocykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBzaGFwZTogcyxcbiAgICAgIGhhc2g6IHNoYXBlSGFzaChzLCBhcnJvd0Rlc3RzLCBmYWxzZSwgaGFzaEJvdW5kcyksXG4gICAgfTtcbiAgfSk7XG5cbiAgY29uc3Qgc2hhcGVzOiBTaGFwZVtdID0gZC5zaGFwZXMuY29uY2F0KGQuYXV0b1NoYXBlcykubWFwKChzOiBEcmF3U2hhcGUpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgc2hhcGU6IHMsXG4gICAgICBoYXNoOiBzaGFwZUhhc2gocywgYXJyb3dEZXN0cywgZmFsc2UsIGhhc2hCb3VuZHMpLFxuICAgIH07XG4gIH0pO1xuICBpZiAoY3VyKVxuICAgIHNoYXBlcy5wdXNoKHtcbiAgICAgIHNoYXBlOiBjdXIsXG4gICAgICBoYXNoOiBzaGFwZUhhc2goY3VyLCBhcnJvd0Rlc3RzLCB0cnVlLCBoYXNoQm91bmRzKSxcbiAgICAgIGN1cnJlbnQ6IHRydWUsXG4gICAgfSk7XG5cbiAgY29uc3QgZnVsbEhhc2ggPVxuICAgIHNoYXBlcy5tYXAoKHNjKSA9PiBzYy5oYXNoKS5qb2luKCc7JykgK1xuICAgIChvdXRzaWRlQXJyb3cgPyBvdXRzaWRlQXJyb3dIYXNoIDogJycpICtcbiAgICBzdGF0ZS5zY2FsZURvd25QaWVjZXM7XG4gIGlmIChmdWxsSGFzaCA9PT0gc3RhdGUuZHJhd2FibGUucHJldlN2Z0hhc2gpIHJldHVybjtcbiAgc3RhdGUuZHJhd2FibGUucHJldlN2Z0hhc2ggPSBmdWxsSGFzaDtcblxuICAvKlxuICAgIC0tIERPTSBoaWVyYXJjaHkgLS1cbiAgICA8c3ZnIGNsYXNzPVwic2ctc2hhcGVzXCI+ICg8PSBzdmcpXG4gICAgICA8ZGVmcz5cbiAgICAgICAgLi4uKGZvciBicnVzaGVzKS4uLlxuICAgICAgPC9kZWZzPlxuICAgICAgPGc+XG4gICAgICAgIC4uLihmb3IgYXJyb3dzIGFuZCBjaXJjbGVzKS4uLlxuICAgICAgPC9nPlxuICAgIDwvc3ZnPlxuICAgIDxzdmcgY2xhc3M9XCJzZy1jdXN0b20tc3Znc1wiPiAoPD0gY3VzdG9tU3ZnKVxuICAgICAgPGc+XG4gICAgICAgIC4uLihmb3IgY3VzdG9tIHN2Z3MpLi4uXG4gICAgICA8L2c+XG4gICAgPHNnLWZyZWUtcGllY2VzPiAoPD0gZnJlZVBpZWNlcylcbiAgICAgIC4uLihmb3IgcGllY2VzKS4uLlxuICAgIDwvc2ctZnJlZS1waWVjZXM+XG4gICAgPC9zdmc+XG4gICovXG4gIGNvbnN0IGRlZnNFbCA9IHN2Zy5xdWVyeVNlbGVjdG9yKCdkZWZzJykgYXMgU1ZHRWxlbWVudDtcbiAgY29uc3Qgc2hhcGVzRWwgPSBzdmcucXVlcnlTZWxlY3RvcignZycpIGFzIFNWR0VsZW1lbnQ7XG4gIGNvbnN0IGN1c3RvbVN2Z3NFbCA9IGN1c3RvbVN2Zy5xdWVyeVNlbGVjdG9yKCdnJykgYXMgU1ZHRWxlbWVudDtcblxuICBzeW5jRGVmcyhzaGFwZXMsIG91dHNpZGVBcnJvdyA/IGN1ckQgOiB1bmRlZmluZWQsIGRlZnNFbCk7XG4gIHN5bmNTaGFwZXMoXG4gICAgc2hhcGVzLmZpbHRlcigocykgPT4gIXMuc2hhcGUuY3VzdG9tU3ZnICYmICghcy5zaGFwZS5waWVjZSB8fCBzLmN1cnJlbnQpKSxcbiAgICBzaGFwZXNFbCxcbiAgICAoc2hhcGUpID0+IHJlbmRlclNWR1NoYXBlKHN0YXRlLCBzaGFwZSwgYXJyb3dEZXN0cyksXG4gICAgb3V0c2lkZUFycm93LFxuICApO1xuICBzeW5jU2hhcGVzKFxuICAgIHNoYXBlcy5maWx0ZXIoKHMpID0+IHMuc2hhcGUuY3VzdG9tU3ZnKSxcbiAgICBjdXN0b21TdmdzRWwsXG4gICAgKHNoYXBlKSA9PiByZW5kZXJTVkdTaGFwZShzdGF0ZSwgc2hhcGUsIGFycm93RGVzdHMpLFxuICApO1xuICBzeW5jU2hhcGVzKHBpZWNlU2hhcGVzLCBmcmVlUGllY2VzLCAoc2hhcGUpID0+IHJlbmRlclBpZWNlKHN0YXRlLCBzaGFwZSkpO1xuXG4gIGlmICghb3V0c2lkZUFycm93ICYmIGN1ckQpIGN1ckQuYXJyb3cgPSB1bmRlZmluZWQ7XG5cbiAgaWYgKG91dHNpZGVBcnJvdyAmJiAhY3VyRC5hcnJvdykge1xuICAgIGNvbnN0IG9yaWcgPSBwaWVjZU9yS2V5VG9Qb3MoY3VyRC5vcmlnLCBzdGF0ZSk7XG4gICAgaWYgKG9yaWcpIHtcbiAgICAgIGNvbnN0IGcgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ2cnKSwge1xuICAgICAgICBjbGFzczogc2hhcGVDbGFzcyhjdXJELmJydXNoLCB0cnVlLCB0cnVlKSxcbiAgICAgICAgc2dIYXNoOiBvdXRzaWRlQXJyb3dIYXNoLFxuICAgICAgfSk7XG4gICAgICBjb25zdCBlbCA9IHJlbmRlckFycm93KGN1ckQuYnJ1c2gsIG9yaWcsIG9yaWcsIHN0YXRlLnNxdWFyZVJhdGlvLCB0cnVlLCBmYWxzZSk7XG4gICAgICBnLmFwcGVuZENoaWxkKGVsKTtcbiAgICAgIGN1ckQuYXJyb3cgPSBlbDtcbiAgICAgIHNoYXBlc0VsLmFwcGVuZENoaWxkKGcpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBhcHBlbmQgb25seS4gRG9uJ3QgdHJ5IHRvIHVwZGF0ZS9yZW1vdmUuXG5mdW5jdGlvbiBzeW5jRGVmcyhcbiAgc2hhcGVzOiBTaGFwZVtdLFxuICBvdXRzaWRlU2hhcGU6IERyYXdDdXJyZW50IHwgdW5kZWZpbmVkLFxuICBkZWZzRWw6IFNWR0VsZW1lbnQsXG4pOiB2b2lkIHtcbiAgY29uc3QgYnJ1c2hlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBmb3IgKGNvbnN0IHMgb2Ygc2hhcGVzKSB7XG4gICAgaWYgKCFzYW1lUGllY2VPcktleShzLnNoYXBlLmRlc3QsIHMuc2hhcGUub3JpZykpIGJydXNoZXMuYWRkKHMuc2hhcGUuYnJ1c2gpO1xuICB9XG4gIGlmIChvdXRzaWRlU2hhcGUpIGJydXNoZXMuYWRkKG91dHNpZGVTaGFwZS5icnVzaCk7XG4gIGNvbnN0IGtleXNJbkRvbSA9IG5ldyBTZXQoKTtcbiAgbGV0IGVsOiBTVkdFbGVtZW50IHwgdW5kZWZpbmVkID0gZGVmc0VsLmZpcnN0RWxlbWVudENoaWxkIGFzIFNWR0VsZW1lbnQ7XG4gIHdoaWxlIChlbCkge1xuICAgIGtleXNJbkRvbS5hZGQoZWwuZ2V0QXR0cmlidXRlKCdzZ0tleScpKTtcbiAgICBlbCA9IGVsLm5leHRFbGVtZW50U2libGluZyBhcyBTVkdFbGVtZW50IHwgdW5kZWZpbmVkO1xuICB9XG4gIGZvciAoY29uc3Qga2V5IG9mIGJydXNoZXMpIHtcbiAgICBjb25zdCBicnVzaCA9IGtleSB8fCBkZWZhdWx0QnJ1c2g7XG4gICAgaWYgKCFrZXlzSW5Eb20uaGFzKGJydXNoKSkgZGVmc0VsLmFwcGVuZENoaWxkKHJlbmRlck1hcmtlcihicnVzaCkpO1xuICB9XG59XG5cbi8vIGFwcGVuZCBhbmQgcmVtb3ZlIG9ubHkuIE5vIHVwZGF0ZXMuXG5leHBvcnQgZnVuY3Rpb24gc3luY1NoYXBlcyhcbiAgc2hhcGVzOiBTaGFwZVtdLFxuICByb290OiBIVE1MRWxlbWVudCB8IFNWR0VsZW1lbnQsXG4gIHJlbmRlclNoYXBlOiAoc2hhcGU6IFNoYXBlKSA9PiBIVE1MRWxlbWVudCB8IFNWR0VsZW1lbnQgfCB1bmRlZmluZWQsXG4gIG91dHNpZGVBcnJvdz86IGJvb2xlYW4sXG4pOiB2b2lkIHtcbiAgY29uc3QgaGFzaGVzSW5Eb20gPSBuZXcgTWFwKCk7IC8vIGJ5IGhhc2hcbiAgY29uc3QgdG9SZW1vdmU6IFNWR0VsZW1lbnRbXSA9IFtdO1xuICBmb3IgKGNvbnN0IHNjIG9mIHNoYXBlcykgaGFzaGVzSW5Eb20uc2V0KHNjLmhhc2gsIGZhbHNlKTtcbiAgaWYgKG91dHNpZGVBcnJvdykgaGFzaGVzSW5Eb20uc2V0KG91dHNpZGVBcnJvd0hhc2gsIHRydWUpO1xuICBsZXQgZWw6IFNWR0VsZW1lbnQgfCB1bmRlZmluZWQgPSByb290LmZpcnN0RWxlbWVudENoaWxkIGFzIFNWR0VsZW1lbnQ7XG4gIGxldCBlbEhhc2g6IEhhc2ggfCBudWxsO1xuICB3aGlsZSAoZWwpIHtcbiAgICBlbEhhc2ggPSBlbC5nZXRBdHRyaWJ1dGUoJ3NnSGFzaCcpO1xuICAgIC8vIGZvdW5kIGEgc2hhcGUgZWxlbWVudCB0aGF0J3MgaGVyZSB0byBzdGF5XG4gICAgaWYgKGhhc2hlc0luRG9tLmhhcyhlbEhhc2gpKSBoYXNoZXNJbkRvbS5zZXQoZWxIYXNoLCB0cnVlKTtcbiAgICAvLyBvciByZW1vdmUgaXRcbiAgICBlbHNlIHRvUmVtb3ZlLnB1c2goZWwpO1xuICAgIGVsID0gZWwubmV4dEVsZW1lbnRTaWJsaW5nIGFzIFNWR0VsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIH1cbiAgLy8gcmVtb3ZlIG9sZCBzaGFwZXNcbiAgZm9yIChjb25zdCBlbCBvZiB0b1JlbW92ZSkgcm9vdC5yZW1vdmVDaGlsZChlbCk7XG4gIC8vIGluc2VydCBzaGFwZXMgdGhhdCBhcmUgbm90IHlldCBpbiBkb21cbiAgZm9yIChjb25zdCBzYyBvZiBzaGFwZXMpIHtcbiAgICBpZiAoIWhhc2hlc0luRG9tLmdldChzYy5oYXNoKSkge1xuICAgICAgY29uc3Qgc2hhcGVFbCA9IHJlbmRlclNoYXBlKHNjKTtcbiAgICAgIGlmIChzaGFwZUVsKSByb290LmFwcGVuZENoaWxkKHNoYXBlRWwpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzaGFwZUhhc2goXG4gIHsgb3JpZywgZGVzdCwgYnJ1c2gsIHBpZWNlLCBjdXN0b21TdmcsIGRlc2NyaXB0aW9uIH06IERyYXdTaGFwZSxcbiAgYXJyb3dEZXN0czogQXJyb3dEZXN0cyxcbiAgY3VycmVudDogYm9vbGVhbixcbiAgYm91bmRIYXNoOiAocGllY2U6IHNnLlBpZWNlKSA9PiBzdHJpbmcsXG4pOiBIYXNoIHtcbiAgcmV0dXJuIFtcbiAgICBjdXJyZW50LFxuICAgIGlzUGllY2Uob3JpZykgJiYgYm91bmRIYXNoKG9yaWcpLFxuICAgIGlzUGllY2UoZGVzdCkgJiYgYm91bmRIYXNoKGRlc3QpLFxuICAgIGlzUGllY2Uob3JpZykgPyBwaWVjZUhhc2gob3JpZykgOiBvcmlnLFxuICAgIGlzUGllY2UoZGVzdCkgPyBwaWVjZUhhc2goZGVzdCkgOiBkZXN0LFxuICAgIGJydXNoLFxuICAgIChhcnJvd0Rlc3RzLmdldChpc1BpZWNlKGRlc3QpID8gcGllY2VOYW1lT2YoZGVzdCkgOiBkZXN0KSB8fCAwKSA+IDEsXG4gICAgcGllY2UgJiYgcGllY2VIYXNoKHBpZWNlKSxcbiAgICBjdXN0b21TdmcgJiYgY3VzdG9tU3ZnSGFzaChjdXN0b21TdmcpLFxuICAgIGRlc2NyaXB0aW9uLFxuICBdXG4gICAgLmZpbHRlcigoeCkgPT4geClcbiAgICAuam9pbignLCcpO1xufVxuXG5mdW5jdGlvbiBwaWVjZUhhc2gocGllY2U6IERyYXdTaGFwZVBpZWNlKTogSGFzaCB7XG4gIHJldHVybiBbcGllY2UuY29sb3IsIHBpZWNlLnJvbGUsIHBpZWNlLnNjYWxlXS5maWx0ZXIoKHgpID0+IHgpLmpvaW4oJywnKTtcbn1cblxuZnVuY3Rpb24gY3VzdG9tU3ZnSGFzaChzOiBzdHJpbmcpOiBIYXNoIHtcbiAgLy8gUm9sbGluZyBoYXNoIHdpdGggYmFzZSAzMSAoY2YuIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzc2MTY0NjEvZ2VuZXJhdGUtYS1oYXNoLWZyb20tc3RyaW5nLWluLWphdmFzY3JpcHQpXG4gIGxldCBoID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzLmxlbmd0aDsgaSsrKSB7XG4gICAgaCA9ICgoaCA8PCA1KSAtIGggKyBzLmNoYXJDb2RlQXQoaSkpID4+PiAwO1xuICB9XG4gIHJldHVybiBgY3VzdG9tLSR7aC50b1N0cmluZygpfWA7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclNWR1NoYXBlKFxuICBzdGF0ZTogU3RhdGUsXG4gIHsgc2hhcGUsIGN1cnJlbnQsIGhhc2ggfTogU2hhcGUsXG4gIGFycm93RGVzdHM6IEFycm93RGVzdHMsXG4pOiBTVkdFbGVtZW50IHwgdW5kZWZpbmVkIHtcbiAgY29uc3Qgb3JpZyA9IHBpZWNlT3JLZXlUb1BvcyhzaGFwZS5vcmlnLCBzdGF0ZSk7XG4gIGlmICghb3JpZykgcmV0dXJuO1xuICBpZiAoc2hhcGUuY3VzdG9tU3ZnKSB7XG4gICAgcmV0dXJuIHJlbmRlckN1c3RvbVN2ZyhzaGFwZS5icnVzaCwgc2hhcGUuY3VzdG9tU3ZnLCBvcmlnLCBzdGF0ZS5zcXVhcmVSYXRpbyk7XG4gIH0gZWxzZSB7XG4gICAgbGV0IGVsOiBTVkdFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgIGNvbnN0IGRlc3QgPSAhc2FtZVBpZWNlT3JLZXkoc2hhcGUub3JpZywgc2hhcGUuZGVzdCkgJiYgcGllY2VPcktleVRvUG9zKHNoYXBlLmRlc3QsIHN0YXRlKTtcbiAgICBpZiAoZGVzdCkge1xuICAgICAgZWwgPSByZW5kZXJBcnJvdyhcbiAgICAgICAgc2hhcGUuYnJ1c2gsXG4gICAgICAgIG9yaWcsXG4gICAgICAgIGRlc3QsXG4gICAgICAgIHN0YXRlLnNxdWFyZVJhdGlvLFxuICAgICAgICAhIWN1cnJlbnQsXG4gICAgICAgIChhcnJvd0Rlc3RzLmdldChpc1BpZWNlKHNoYXBlLmRlc3QpID8gcGllY2VOYW1lT2Yoc2hhcGUuZGVzdCkgOiBzaGFwZS5kZXN0KSB8fCAwKSA+IDEsXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAoc2FtZVBpZWNlT3JLZXkoc2hhcGUuZGVzdCwgc2hhcGUub3JpZykpIHtcbiAgICAgIGxldCByYXRpbzogc2cuTnVtYmVyUGFpciA9IHN0YXRlLnNxdWFyZVJhdGlvO1xuICAgICAgaWYgKGlzUGllY2Uoc2hhcGUub3JpZykpIHtcbiAgICAgICAgY29uc3QgcGllY2VCb3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzKCkuZ2V0KHBpZWNlTmFtZU9mKHNoYXBlLm9yaWcpKTtcbiAgICAgICAgY29uc3QgYm91bmRzID0gc3RhdGUuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKTtcbiAgICAgICAgaWYgKHBpZWNlQm91bmRzICYmIGJvdW5kcykge1xuICAgICAgICAgIGNvbnN0IGhlaWdodEJhc2UgPSBwaWVjZUJvdW5kcy5oZWlnaHQgLyAoYm91bmRzLmhlaWdodCAvIHN0YXRlLmRpbWVuc2lvbnMucmFua3MpO1xuICAgICAgICAgIC8vIHdlIHdhbnQgdG8ga2VlcCB0aGUgcmF0aW8gdGhhdCBpcyBvbiB0aGUgYm9hcmRcbiAgICAgICAgICByYXRpbyA9IFtoZWlnaHRCYXNlICogc3RhdGUuc3F1YXJlUmF0aW9bMF0sIGhlaWdodEJhc2UgKiBzdGF0ZS5zcXVhcmVSYXRpb1sxXV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsID0gcmVuZGVyRWxsaXBzZShvcmlnLCByYXRpbywgISFjdXJyZW50KTtcbiAgICB9XG4gICAgaWYgKGVsKSB7XG4gICAgICBjb25zdCBnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdnJyksIHtcbiAgICAgICAgY2xhc3M6IHNoYXBlQ2xhc3Moc2hhcGUuYnJ1c2gsICEhY3VycmVudCwgZmFsc2UpLFxuICAgICAgICBzZ0hhc2g6IGhhc2gsXG4gICAgICB9KTtcbiAgICAgIGcuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgY29uc3QgZGVzY0VsID0gc2hhcGUuZGVzY3JpcHRpb24gJiYgcmVuZGVyRGVzY3JpcHRpb24oc3RhdGUsIHNoYXBlLCBhcnJvd0Rlc3RzKTtcbiAgICAgIGlmIChkZXNjRWwpIGcuYXBwZW5kQ2hpbGQoZGVzY0VsKTtcbiAgICAgIHJldHVybiBnO1xuICAgIH0gZWxzZSByZXR1cm47XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyQ3VzdG9tU3ZnKFxuICBicnVzaDogc3RyaW5nLFxuICBjdXN0b21Tdmc6IHN0cmluZyxcbiAgcG9zOiBzZy5Qb3MsXG4gIHJhdGlvOiBzZy5OdW1iZXJQYWlyLFxuKTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IFt4LCB5XSA9IHBvcztcblxuICAvLyBUcmFuc2xhdGUgdG8gdG9wLWxlZnQgb2YgYG9yaWdgIHNxdWFyZVxuICBjb25zdCBnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdnJyksIHsgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7eH0sJHt5fSlgIH0pO1xuXG4gIGNvbnN0IHN2ZyA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnc3ZnJyksIHtcbiAgICBjbGFzczogYnJ1c2gsXG4gICAgd2lkdGg6IHJhdGlvWzBdLFxuICAgIGhlaWdodDogcmF0aW9bMV0sXG4gICAgdmlld0JveDogYDAgMCAke3JhdGlvWzBdICogMTB9ICR7cmF0aW9bMV0gKiAxMH1gLFxuICB9KTtcblxuICBnLmFwcGVuZENoaWxkKHN2Zyk7XG4gIHN2Zy5pbm5lckhUTUwgPSBjdXN0b21Tdmc7XG5cbiAgcmV0dXJuIGc7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckVsbGlwc2UocG9zOiBzZy5Qb3MsIHJhdGlvOiBzZy5OdW1iZXJQYWlyLCBjdXJyZW50OiBib29sZWFuKTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IG8gPSBwb3M7XG4gIGNvbnN0IHdpZHRocyA9IGVsbGlwc2VXaWR0aChyYXRpbyk7XG4gIHJldHVybiBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ2VsbGlwc2UnKSwge1xuICAgICdzdHJva2Utd2lkdGgnOiB3aWR0aHNbY3VycmVudCA/IDAgOiAxXSxcbiAgICBmaWxsOiAnbm9uZScsXG4gICAgY3g6IG9bMF0sXG4gICAgY3k6IG9bMV0sXG4gICAgcng6IHJhdGlvWzBdIC8gMiAtIHdpZHRoc1sxXSAvIDIsXG4gICAgcnk6IHJhdGlvWzFdIC8gMiAtIHdpZHRoc1sxXSAvIDIsXG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZW5kZXJBcnJvdyhcbiAgYnJ1c2g6IHN0cmluZyxcbiAgb3JpZzogc2cuUG9zLFxuICBkZXN0OiBzZy5Qb3MsXG4gIHJhdGlvOiBzZy5OdW1iZXJQYWlyLFxuICBjdXJyZW50OiBib29sZWFuLFxuICBzaG9ydGVuOiBib29sZWFuLFxuKTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IG0gPSBhcnJvd01hcmdpbihzaG9ydGVuICYmICFjdXJyZW50LCByYXRpbyk7XG4gIGNvbnN0IGEgPSBvcmlnO1xuICBjb25zdCBiID0gZGVzdDtcbiAgY29uc3QgZHggPSBiWzBdIC0gYVswXTtcbiAgY29uc3QgZHkgPSBiWzFdIC0gYVsxXTtcbiAgY29uc3QgYW5nbGUgPSBNYXRoLmF0YW4yKGR5LCBkeCk7XG4gIGNvbnN0IHhvID0gTWF0aC5jb3MoYW5nbGUpICogbTtcbiAgY29uc3QgeW8gPSBNYXRoLnNpbihhbmdsZSkgKiBtO1xuICByZXR1cm4gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdsaW5lJyksIHtcbiAgICAnc3Ryb2tlLXdpZHRoJzogbGluZVdpZHRoKGN1cnJlbnQsIHJhdGlvKSxcbiAgICAnc3Ryb2tlLWxpbmVjYXAnOiAncm91bmQnLFxuICAgICdtYXJrZXItZW5kJzogYHVybCgjYXJyb3doZWFkLSR7YnJ1c2ggfHwgZGVmYXVsdEJydXNofSlgLFxuICAgIHgxOiBhWzBdLFxuICAgIHkxOiBhWzFdLFxuICAgIHgyOiBiWzBdIC0geG8sXG4gICAgeTI6IGJbMV0gLSB5byxcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJQaWVjZShzdGF0ZTogU3RhdGUsIHsgc2hhcGUgfTogU2hhcGUpOiBzZy5QaWVjZU5vZGUgfCB1bmRlZmluZWQge1xuICBpZiAoIXNoYXBlLnBpZWNlIHx8IGlzUGllY2Uoc2hhcGUub3JpZykpIHJldHVybjtcblxuICBjb25zdCBvcmlnID0gc2hhcGUub3JpZztcbiAgY29uc3Qgc2NhbGUgPSAoc2hhcGUucGllY2Uuc2NhbGUgfHwgMSkgKiAoc3RhdGUuc2NhbGVEb3duUGllY2VzID8gMC41IDogMSk7XG5cbiAgY29uc3QgcGllY2VFbCA9IGNyZWF0ZUVsKCdwaWVjZScsIHBpZWNlTmFtZU9mKHNoYXBlLnBpZWNlKSkgYXMgc2cuUGllY2VOb2RlO1xuICBwaWVjZUVsLnNnS2V5ID0gb3JpZztcbiAgcGllY2VFbC5zZ1NjYWxlID0gc2NhbGU7XG4gIHRyYW5zbGF0ZVJlbChcbiAgICBwaWVjZUVsLFxuICAgIHBvc1RvVHJhbnNsYXRlUmVsKHN0YXRlLmRpbWVuc2lvbnMpKGtleTJwb3Mob3JpZyksIHNlbnRlUG92KHN0YXRlLm9yaWVudGF0aW9uKSksXG4gICAgc3RhdGUuc2NhbGVEb3duUGllY2VzID8gMC41IDogMSxcbiAgICBzY2FsZSxcbiAgKTtcblxuICByZXR1cm4gcGllY2VFbDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyRGVzY3JpcHRpb24oXG4gIHN0YXRlOiBTdGF0ZSxcbiAgc2hhcGU6IERyYXdTaGFwZSxcbiAgYXJyb3dEZXN0czogQXJyb3dEZXN0cyxcbik6IFNWR0VsZW1lbnQgfCB1bmRlZmluZWQge1xuICBjb25zdCBvcmlnID0gcGllY2VPcktleVRvUG9zKHNoYXBlLm9yaWcsIHN0YXRlKTtcbiAgaWYgKCFvcmlnIHx8ICFzaGFwZS5kZXNjcmlwdGlvbikgcmV0dXJuO1xuICBjb25zdCBkZXN0ID0gIXNhbWVQaWVjZU9yS2V5KHNoYXBlLm9yaWcsIHNoYXBlLmRlc3QpICYmIHBpZWNlT3JLZXlUb1BvcyhzaGFwZS5kZXN0LCBzdGF0ZSk7XG4gIGNvbnN0IGRpZmYgPSBkZXN0ID8gW2Rlc3RbMF0gLSBvcmlnWzBdLCBkZXN0WzFdIC0gb3JpZ1sxXV0gOiBbMCwgMF07XG4gIGNvbnN0IG9mZnNldCA9XG4gICAgKGFycm93RGVzdHMuZ2V0KGlzUGllY2Uoc2hhcGUuZGVzdCkgPyBwaWVjZU5hbWVPZihzaGFwZS5kZXN0KSA6IHNoYXBlLmRlc3QpIHx8IDApID4gMVxuICAgICAgPyAwLjNcbiAgICAgIDogMC4xNTtcbiAgY29uc3QgY2xvc2UgPVxuICAgIChkaWZmWzBdID09PSAwIHx8IE1hdGguYWJzKGRpZmZbMF0pID09PSBzdGF0ZS5zcXVhcmVSYXRpb1swXSkgJiZcbiAgICAoZGlmZlsxXSA9PT0gMCB8fCBNYXRoLmFicyhkaWZmWzFdKSA9PT0gc3RhdGUuc3F1YXJlUmF0aW9bMV0pO1xuICBjb25zdCByYXRpbyA9IGRlc3QgPyAwLjU1IC0gKGNsb3NlID8gb2Zmc2V0IDogMCkgOiAwO1xuICBjb25zdCBtaWQ6IHNnLlBvcyA9IFtvcmlnWzBdICsgZGlmZlswXSAqIHJhdGlvLCBvcmlnWzFdICsgZGlmZlsxXSAqIHJhdGlvXTtcbiAgY29uc3QgdGV4dExlbmd0aCA9IHNoYXBlLmRlc2NyaXB0aW9uLmxlbmd0aDtcbiAgY29uc3QgZyA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnZycpLCB7IGNsYXNzOiAnZGVzY3JpcHRpb24nIH0pO1xuICBjb25zdCBjaXJjbGUgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ2VsbGlwc2UnKSwge1xuICAgIGN4OiBtaWRbMF0sXG4gICAgY3k6IG1pZFsxXSxcbiAgICByeDogdGV4dExlbmd0aCArIDEuNSxcbiAgICByeTogMi41LFxuICB9KTtcbiAgY29uc3QgdGV4dCA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgndGV4dCcpLCB7XG4gICAgeDogbWlkWzBdLFxuICAgIHk6IG1pZFsxXSxcbiAgICAndGV4dC1hbmNob3InOiAnbWlkZGxlJyxcbiAgICAnZG9taW5hbnQtYmFzZWxpbmUnOiAnY2VudHJhbCcsXG4gIH0pO1xuICBnLmFwcGVuZENoaWxkKGNpcmNsZSk7XG4gIHRleHQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoc2hhcGUuZGVzY3JpcHRpb24pKTtcbiAgZy5hcHBlbmRDaGlsZCh0ZXh0KTtcbiAgcmV0dXJuIGc7XG59XG5cbmZ1bmN0aW9uIHJlbmRlck1hcmtlcihicnVzaDogc3RyaW5nKTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IG1hcmtlciA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnbWFya2VyJyksIHtcbiAgICBpZDogYGFycm93aGVhZC0ke2JydXNofWAsXG4gICAgb3JpZW50OiAnYXV0bycsXG4gICAgbWFya2VyV2lkdGg6IDQsXG4gICAgbWFya2VySGVpZ2h0OiA4LFxuICAgIHJlZlg6IDIuMDUsXG4gICAgcmVmWTogMi4wMSxcbiAgfSk7XG4gIG1hcmtlci5hcHBlbmRDaGlsZChcbiAgICBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ3BhdGgnKSwge1xuICAgICAgZDogJ00wLDAgVjQgTDMsMiBaJyxcbiAgICB9KSxcbiAgKTtcbiAgbWFya2VyLnNldEF0dHJpYnV0ZSgnc2dLZXknLCBicnVzaCk7XG4gIHJldHVybiBtYXJrZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRBdHRyaWJ1dGVzKGVsOiBTVkdFbGVtZW50LCBhdHRyczogUmVjb3JkPHN0cmluZywgYW55Pik6IFNWR0VsZW1lbnQge1xuICBmb3IgKGNvbnN0IGtleSBpbiBhdHRycykge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYXR0cnMsIGtleSkpIGVsLnNldEF0dHJpYnV0ZShrZXksIGF0dHJzW2tleV0pO1xuICB9XG4gIHJldHVybiBlbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBvczJ1c2VyKFxuICBwb3M6IHNnLlBvcyxcbiAgY29sb3I6IHNnLkNvbG9yLFxuICBkaW1zOiBzZy5EaW1lbnNpb25zLFxuICByYXRpbzogc2cuTnVtYmVyUGFpcixcbik6IHNnLk51bWJlclBhaXIge1xuICByZXR1cm4gY29sb3IgPT09ICdzZW50ZSdcbiAgICA/IFsoZGltcy5maWxlcyAtIDEgLSBwb3NbMF0pICogcmF0aW9bMF0sIHBvc1sxXSAqIHJhdGlvWzFdXVxuICAgIDogW3Bvc1swXSAqIHJhdGlvWzBdLCAoZGltcy5yYW5rcyAtIDEgLSBwb3NbMV0pICogcmF0aW9bMV1dO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQaWVjZSh4OiBzZy5LZXkgfCBzZy5QaWVjZSk6IHggaXMgc2cuUGllY2Uge1xuICByZXR1cm4gdHlwZW9mIHggPT09ICdvYmplY3QnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2FtZVBpZWNlT3JLZXkoa3AxOiBzZy5LZXkgfCBzZy5QaWVjZSwga3AyOiBzZy5LZXkgfCBzZy5QaWVjZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKGlzUGllY2Uoa3AxKSAmJiBpc1BpZWNlKGtwMikgJiYgc2FtZVBpZWNlKGtwMSwga3AyKSkgfHwga3AxID09PSBrcDI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VzQm91bmRzKHNoYXBlczogRHJhd1NoYXBlW10pOiBib29sZWFuIHtcbiAgcmV0dXJuIHNoYXBlcy5zb21lKChzKSA9PiBpc1BpZWNlKHMub3JpZykgfHwgaXNQaWVjZShzLmRlc3QpKTtcbn1cblxuZnVuY3Rpb24gc2hhcGVDbGFzcyhicnVzaDogc3RyaW5nLCBjdXJyZW50OiBib29sZWFuLCBvdXRzaWRlOiBib29sZWFuKTogc3RyaW5nIHtcbiAgcmV0dXJuIChicnVzaCB8fCBkZWZhdWx0QnJ1c2gpICsgKGN1cnJlbnQgPyAnIGN1cnJlbnQnIDogJycpICsgKG91dHNpZGUgPyAnIG91dHNpZGUnIDogJycpO1xufVxuXG5mdW5jdGlvbiByYXRpb0F2ZXJhZ2UocmF0aW86IHNnLk51bWJlclBhaXIpOiBudW1iZXIge1xuICByZXR1cm4gKHJhdGlvWzBdICsgcmF0aW9bMV0pIC8gMjtcbn1cblxuZnVuY3Rpb24gZWxsaXBzZVdpZHRoKHJhdGlvOiBzZy5OdW1iZXJQYWlyKTogW251bWJlciwgbnVtYmVyXSB7XG4gIHJldHVybiBbKDMgLyA2NCkgKiByYXRpb0F2ZXJhZ2UocmF0aW8pLCAoNCAvIDY0KSAqIHJhdGlvQXZlcmFnZShyYXRpbyldO1xufVxuXG5mdW5jdGlvbiBsaW5lV2lkdGgoY3VycmVudDogYm9vbGVhbiwgcmF0aW86IHNnLk51bWJlclBhaXIpOiBudW1iZXIge1xuICByZXR1cm4gKChjdXJyZW50ID8gOC41IDogMTApIC8gNjQpICogcmF0aW9BdmVyYWdlKHJhdGlvKTtcbn1cblxuZnVuY3Rpb24gYXJyb3dNYXJnaW4oc2hvcnRlbjogYm9vbGVhbiwgcmF0aW86IHNnLk51bWJlclBhaXIpOiBudW1iZXIge1xuICByZXR1cm4gKChzaG9ydGVuID8gMjAgOiAxMCkgLyA2NCkgKiByYXRpb0F2ZXJhZ2UocmF0aW8pO1xufVxuXG5mdW5jdGlvbiBwaWVjZU9yS2V5VG9Qb3Moa3A6IHNnLktleSB8IHNnLlBpZWNlLCBzdGF0ZTogU3RhdGUpOiBzZy5Qb3MgfCB1bmRlZmluZWQge1xuICBpZiAoaXNQaWVjZShrcCkpIHtcbiAgICBjb25zdCBwaWVjZUJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMoKS5nZXQocGllY2VOYW1lT2Yoa3ApKTtcbiAgICBjb25zdCBib3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpO1xuICAgIGNvbnN0IG9mZnNldCA9IHNlbnRlUG92KHN0YXRlLm9yaWVudGF0aW9uKSA/IFswLjUsIC0wLjVdIDogWy0wLjUsIDAuNV07XG4gICAgY29uc3QgcG9zID1cbiAgICAgIHBpZWNlQm91bmRzICYmXG4gICAgICBib3VuZHMgJiZcbiAgICAgIHBvc09mT3V0c2lkZUVsKFxuICAgICAgICBwaWVjZUJvdW5kcy5sZWZ0ICsgcGllY2VCb3VuZHMud2lkdGggLyAyLFxuICAgICAgICBwaWVjZUJvdW5kcy50b3AgKyBwaWVjZUJvdW5kcy5oZWlnaHQgLyAyLFxuICAgICAgICBzZW50ZVBvdihzdGF0ZS5vcmllbnRhdGlvbiksXG4gICAgICAgIHN0YXRlLmRpbWVuc2lvbnMsXG4gICAgICAgIGJvdW5kcyxcbiAgICAgICk7XG4gICAgcmV0dXJuIChcbiAgICAgIHBvcyAmJlxuICAgICAgcG9zMnVzZXIoXG4gICAgICAgIFtwb3NbMF0gKyBvZmZzZXRbMF0sIHBvc1sxXSArIG9mZnNldFsxXV0sXG4gICAgICAgIHN0YXRlLm9yaWVudGF0aW9uLFxuICAgICAgICBzdGF0ZS5kaW1lbnNpb25zLFxuICAgICAgICBzdGF0ZS5zcXVhcmVSYXRpbyxcbiAgICAgIClcbiAgICApO1xuICB9IGVsc2UgcmV0dXJuIHBvczJ1c2VyKGtleTJwb3Moa3ApLCBzdGF0ZS5vcmllbnRhdGlvbiwgc3RhdGUuZGltZW5zaW9ucywgc3RhdGUuc3F1YXJlUmF0aW8pO1xufVxuIiwgImltcG9ydCB7IGNhbmNlbE1vdmVPckRyb3AsIHVuc2VsZWN0IH0gZnJvbSAnLi9ib2FyZC5qcyc7XG5pbXBvcnQgeyBpc1BpZWNlLCBwb3MydXNlciwgc2FtZVBpZWNlT3JLZXksIHNldEF0dHJpYnV0ZXMgfSBmcm9tICcuL3NoYXBlcy5qcyc7XG5pbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHtcbiAgZXZlbnRQb3NpdGlvbixcbiAgZ2V0SGFuZFBpZWNlQXREb21Qb3MsXG4gIGdldEtleUF0RG9tUG9zLFxuICBpc1JpZ2h0QnV0dG9uLFxuICBwb3NPZk91dHNpZGVFbCxcbiAgc2FtZVBpZWNlLFxuICBzZW50ZVBvdixcbn0gZnJvbSAnLi91dGlsLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBEcmF3U2hhcGUge1xuICBvcmlnOiBzZy5LZXkgfCBzZy5QaWVjZTtcbiAgZGVzdDogc2cuS2V5IHwgc2cuUGllY2U7XG4gIHBpZWNlPzogRHJhd1NoYXBlUGllY2U7XG4gIGN1c3RvbVN2Zz86IHN0cmluZzsgLy8gc3ZnXG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xuICBicnVzaDogc3RyaW5nOyAvLyBjc3MgY2xhc3MgdG8gYmUgYXBwZW5kZWRcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTcXVhcmVIaWdobGlnaHQge1xuICBrZXk6IHNnLktleTtcbiAgY2xhc3NOYW1lOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd1NoYXBlUGllY2Uge1xuICByb2xlOiBzZy5Sb2xlU3RyaW5nO1xuICBjb2xvcjogc2cuQ29sb3I7XG4gIHNjYWxlPzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdhYmxlIHtcbiAgZW5hYmxlZDogYm9vbGVhbjsgLy8gY2FuIGRyYXdcbiAgdmlzaWJsZTogYm9vbGVhbjsgLy8gY2FuIHZpZXdcbiAgZm9yY2VkOiBib29sZWFuOyAvLyBjYW4gb25seSBkcmF3XG4gIGVyYXNlT25DbGljazogYm9vbGVhbjtcbiAgb25DaGFuZ2U/OiAoc2hhcGVzOiBEcmF3U2hhcGVbXSkgPT4gdm9pZDtcbiAgc2hhcGVzOiBEcmF3U2hhcGVbXTsgLy8gdXNlciBzaGFwZXNcbiAgYXV0b1NoYXBlczogRHJhd1NoYXBlW107IC8vIGNvbXB1dGVyIHNoYXBlc1xuICBzcXVhcmVzOiBTcXVhcmVIaWdobGlnaHRbXTtcbiAgY3VycmVudD86IERyYXdDdXJyZW50O1xuICBwcmV2U3ZnSGFzaDogc3RyaW5nO1xuICBwaWVjZT86IHNnLlBpZWNlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdDdXJyZW50IHtcbiAgb3JpZzogc2cuS2V5IHwgc2cuUGllY2U7XG4gIGRlc3Q/OiBzZy5LZXkgfCBzZy5QaWVjZTsgLy8gdW5kZWZpbmVkIGlmIG91dHNpZGUgYm9hcmQvaGFuZHNcbiAgYXJyb3c/OiBTVkdFbGVtZW50O1xuICBwaWVjZT86IHNnLlBpZWNlO1xuICBwb3M6IHNnLk51bWJlclBhaXI7XG4gIGJydXNoOiBzdHJpbmc7IC8vIGJydXNoIG5hbWUgZm9yIHNoYXBlXG59XG5cbmNvbnN0IGJydXNoZXMgPSBbJ3ByaW1hcnknLCAnYWx0ZXJuYXRpdmUwJywgJ2FsdGVybmF0aXZlMScsICdhbHRlcm5hdGl2ZTInXTtcblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0KHN0YXRlOiBTdGF0ZSwgZTogc2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICAvLyBzdXBwb3J0IG9uZSBmaW5nZXIgdG91Y2ggb25seVxuICBpZiAoZS50b3VjaGVzICYmIGUudG91Y2hlcy5sZW5ndGggPiAxKSByZXR1cm47XG4gIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIGUucHJldmVudERlZmF1bHQoKTtcblxuICBpZiAoZS5jdHJsS2V5KSB1bnNlbGVjdChzdGF0ZSk7XG4gIGVsc2UgY2FuY2VsTW92ZU9yRHJvcChzdGF0ZSk7XG5cbiAgY29uc3QgcG9zID0gZXZlbnRQb3NpdGlvbihlKTtcbiAgY29uc3QgYm91bmRzID0gc3RhdGUuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKTtcbiAgY29uc3Qgb3JpZyA9XG4gICAgcG9zICYmIGJvdW5kcyAmJiBnZXRLZXlBdERvbVBvcyhwb3MsIHNlbnRlUG92KHN0YXRlLm9yaWVudGF0aW9uKSwgc3RhdGUuZGltZW5zaW9ucywgYm91bmRzKTtcbiAgY29uc3QgcGllY2UgPSBzdGF0ZS5kcmF3YWJsZS5waWVjZTtcbiAgaWYgKCFvcmlnKSByZXR1cm47XG4gIHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQgPSB7XG4gICAgb3JpZyxcbiAgICBkZXN0OiB1bmRlZmluZWQsXG4gICAgcG9zLFxuICAgIHBpZWNlLFxuICAgIGJydXNoOiBldmVudEJydXNoKGUsIGlzUmlnaHRCdXR0b24oZSkgfHwgc3RhdGUuZHJhd2FibGUuZm9yY2VkKSxcbiAgfTtcbiAgcHJvY2Vzc0RyYXcoc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRGcm9tSGFuZChzdGF0ZTogU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwgZTogc2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICAvLyBzdXBwb3J0IG9uZSBmaW5nZXIgdG91Y2ggb25seVxuICBpZiAoZS50b3VjaGVzICYmIGUudG91Y2hlcy5sZW5ndGggPiAxKSByZXR1cm47XG4gIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIGUucHJldmVudERlZmF1bHQoKTtcblxuICBpZiAoZS5jdHJsS2V5KSB1bnNlbGVjdChzdGF0ZSk7XG4gIGVsc2UgY2FuY2VsTW92ZU9yRHJvcChzdGF0ZSk7XG5cbiAgY29uc3QgcG9zID0gZXZlbnRQb3NpdGlvbihlKTtcbiAgaWYgKCFwb3MpIHJldHVybjtcbiAgc3RhdGUuZHJhd2FibGUuY3VycmVudCA9IHtcbiAgICBvcmlnOiBwaWVjZSxcbiAgICBkZXN0OiB1bmRlZmluZWQsXG4gICAgcG9zLFxuICAgIGJydXNoOiBldmVudEJydXNoKGUsIGlzUmlnaHRCdXR0b24oZSkgfHwgc3RhdGUuZHJhd2FibGUuZm9yY2VkKSxcbiAgfTtcbiAgcHJvY2Vzc0RyYXcoc3RhdGUpO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzRHJhdyhzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBjb25zdCBjdXIgPSBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50O1xuICAgIGNvbnN0IGJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gICAgaWYgKGN1ciAmJiBib3VuZHMpIHtcbiAgICAgIGNvbnN0IGRlc3QgPSBnZXREZXN0aW5hdGlvbihzdGF0ZSwgY3VyLnBvcyk7XG4gICAgICBpZiAoY3VyLmRlc3QgIT09IGRlc3QgJiYgIShjdXIuZGVzdCAmJiBkZXN0ICYmIHNhbWVQaWVjZU9yS2V5KGRlc3QsIGN1ci5kZXN0KSkpIHtcbiAgICAgICAgY3VyLmRlc3QgPSBkZXN0O1xuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3Tm93KCk7XG4gICAgICB9XG4gICAgICBjb25zdCBvdXRQb3MgPSBwb3NPZk91dHNpZGVFbChcbiAgICAgICAgY3VyLnBvc1swXSxcbiAgICAgICAgY3VyLnBvc1sxXSxcbiAgICAgICAgc2VudGVQb3Yoc3RhdGUub3JpZW50YXRpb24pLFxuICAgICAgICBzdGF0ZS5kaW1lbnNpb25zLFxuICAgICAgICBib3VuZHMsXG4gICAgICApO1xuICAgICAgaWYgKCFjdXIuZGVzdCAmJiBjdXIuYXJyb3cgJiYgb3V0UG9zKSB7XG4gICAgICAgIGNvbnN0IGRlc3QgPSBwb3MydXNlcihvdXRQb3MsIHN0YXRlLm9yaWVudGF0aW9uLCBzdGF0ZS5kaW1lbnNpb25zLCBzdGF0ZS5zcXVhcmVSYXRpbyk7XG5cbiAgICAgICAgc2V0QXR0cmlidXRlcyhjdXIuYXJyb3csIHtcbiAgICAgICAgICB4MjogZGVzdFswXSAtIHN0YXRlLnNxdWFyZVJhdGlvWzBdIC8gMixcbiAgICAgICAgICB5MjogZGVzdFsxXSAtIHN0YXRlLnNxdWFyZVJhdGlvWzFdIC8gMixcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBwcm9jZXNzRHJhdyhzdGF0ZSk7XG4gICAgfVxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmUoc3RhdGU6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGNvbnN0IHBvcyA9IGV2ZW50UG9zaXRpb24oZSk7XG4gIGlmIChwb3MgJiYgc3RhdGUuZHJhd2FibGUuY3VycmVudCkgc3RhdGUuZHJhd2FibGUuY3VycmVudC5wb3MgPSBwb3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmQoc3RhdGU6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQ7XG4gIGlmIChjdXIpIHtcbiAgICBjdXIuZGVzdCA9IGdldERlc3RpbmF0aW9uKHN0YXRlLCBldmVudFBvc2l0aW9uKGUpIHx8IGN1ci5wb3MpO1xuICAgIGFkZFNoYXBlKHN0YXRlLmRyYXdhYmxlLCBjdXIpO1xuICAgIGNhbmNlbChzdGF0ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RGVzdGluYXRpb24oc3RhdGU6IFN0YXRlLCBwb3M6IHNnLk51bWJlclBhaXIpOiBzZy5LZXkgfCBzZy5QaWVjZSB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gIHJldHVybiAoXG4gICAgYm91bmRzICYmXG4gICAgKGdldEtleUF0RG9tUG9zKHBvcywgc2VudGVQb3Yoc3RhdGUub3JpZW50YXRpb24pLCBzdGF0ZS5kaW1lbnNpb25zLCBib3VuZHMpIHx8XG4gICAgICBnZXRIYW5kUGllY2VBdERvbVBvcyhwb3MsIHN0YXRlLmhhbmRzLnJvbGVzLCBzdGF0ZS5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzKCkpKVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBpZiAoc3RhdGUuZHJhd2FibGUuY3VycmVudCkge1xuICAgIHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhcihzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgY29uc3QgZHJhd2FibGVMZW5ndGggPSBzdGF0ZS5kcmF3YWJsZS5zaGFwZXMubGVuZ3RoO1xuICBpZiAoZHJhd2FibGVMZW5ndGggfHwgc3RhdGUuZHJhd2FibGUucGllY2UpIHtcbiAgICBzdGF0ZS5kcmF3YWJsZS5zaGFwZXMgPSBbXTtcbiAgICBzdGF0ZS5kcmF3YWJsZS5waWVjZSA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgaWYgKGRyYXdhYmxlTGVuZ3RoKSBvbkNoYW5nZShzdGF0ZS5kcmF3YWJsZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldERyYXdQaWVjZShzdGF0ZTogU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSk6IHZvaWQge1xuICBpZiAoc3RhdGUuZHJhd2FibGUucGllY2UgJiYgc2FtZVBpZWNlKHN0YXRlLmRyYXdhYmxlLnBpZWNlLCBwaWVjZSkpXG4gICAgc3RhdGUuZHJhd2FibGUucGllY2UgPSB1bmRlZmluZWQ7XG4gIGVsc2Ugc3RhdGUuZHJhd2FibGUucGllY2UgPSBwaWVjZTtcbiAgc3RhdGUuZG9tLnJlZHJhdygpO1xufVxuXG5mdW5jdGlvbiBldmVudEJydXNoKGU6IHNnLk1vdWNoRXZlbnQsIGFsbG93Rmlyc3RNb2RpZmllcjogYm9vbGVhbik6IHN0cmluZyB7XG4gIGNvbnN0IG1vZEEgPSBhbGxvd0ZpcnN0TW9kaWZpZXIgJiYgKGUuc2hpZnRLZXkgfHwgZS5jdHJsS2V5KTtcbiAgY29uc3QgbW9kQiA9IGUuYWx0S2V5IHx8IGUubWV0YUtleSB8fCBlLmdldE1vZGlmaWVyU3RhdGU/LignQWx0R3JhcGgnKTtcbiAgcmV0dXJuIGJydXNoZXNbKG1vZEEgPyAxIDogMCkgKyAobW9kQiA/IDIgOiAwKV07XG59XG5cbmZ1bmN0aW9uIGFkZFNoYXBlKGRyYXdhYmxlOiBEcmF3YWJsZSwgY3VyOiBEcmF3Q3VycmVudCk6IHZvaWQge1xuICBpZiAoIWN1ci5kZXN0KSByZXR1cm47XG5cbiAgY29uc3Qgc2ltaWxhclNoYXBlID0gKHM6IERyYXdTaGFwZSkgPT5cbiAgICBjdXIuZGVzdCAmJiBzYW1lUGllY2VPcktleShjdXIub3JpZywgcy5vcmlnKSAmJiBzYW1lUGllY2VPcktleShjdXIuZGVzdCwgcy5kZXN0KTtcblxuICAvLyBzZXBhcmF0ZSBzaGFwZSBmb3IgcGllY2VzXG4gIGNvbnN0IHBpZWNlID0gY3VyLnBpZWNlO1xuICBjdXIucGllY2UgPSB1bmRlZmluZWQ7XG5cbiAgY29uc3Qgc2ltaWxhciA9IGRyYXdhYmxlLnNoYXBlcy5maW5kKHNpbWlsYXJTaGFwZSk7XG4gIGNvbnN0IHJlbW92ZVBpZWNlID0gZHJhd2FibGUuc2hhcGVzLmZpbmQoXG4gICAgKHMpID0+IHNpbWlsYXJTaGFwZShzKSAmJiBwaWVjZSAmJiBzLnBpZWNlICYmIHNhbWVQaWVjZShwaWVjZSwgcy5waWVjZSksXG4gICk7XG4gIGNvbnN0IGRpZmZQaWVjZSA9IGRyYXdhYmxlLnNoYXBlcy5maW5kKFxuICAgIChzKSA9PiBzaW1pbGFyU2hhcGUocykgJiYgcGllY2UgJiYgcy5waWVjZSAmJiAhc2FtZVBpZWNlKHBpZWNlLCBzLnBpZWNlKSxcbiAgKTtcblxuICAvLyByZW1vdmUgZXZlcnkgc2ltaWxhciBzaGFwZVxuICBpZiAoc2ltaWxhcikgZHJhd2FibGUuc2hhcGVzID0gZHJhd2FibGUuc2hhcGVzLmZpbHRlcigocykgPT4gIXNpbWlsYXJTaGFwZShzKSk7XG5cbiAgaWYgKCFpc1BpZWNlKGN1ci5vcmlnKSAmJiBwaWVjZSAmJiAhcmVtb3ZlUGllY2UpIHtcbiAgICBkcmF3YWJsZS5zaGFwZXMucHVzaCh7XG4gICAgICBvcmlnOiBjdXIub3JpZyxcbiAgICAgIGRlc3Q6IGN1ci5vcmlnLFxuICAgICAgcGllY2U6IHBpZWNlLFxuICAgICAgYnJ1c2g6IGN1ci5icnVzaCxcbiAgICB9KTtcbiAgICAvLyBmb3JjZSBjaXJjbGUgYXJvdW5kIGRyYXduIHBpZWNlc1xuICAgIGlmICghc2FtZVBpZWNlT3JLZXkoY3VyLm9yaWcsIGN1ci5kZXN0KSlcbiAgICAgIGRyYXdhYmxlLnNoYXBlcy5wdXNoKHtcbiAgICAgICAgb3JpZzogY3VyLm9yaWcsXG4gICAgICAgIGRlc3Q6IGN1ci5vcmlnLFxuICAgICAgICBicnVzaDogY3VyLmJydXNoLFxuICAgICAgfSk7XG4gIH1cblxuICBpZiAoIXNpbWlsYXIgfHwgZGlmZlBpZWNlIHx8IHNpbWlsYXIuYnJ1c2ggIT09IGN1ci5icnVzaCkgZHJhd2FibGUuc2hhcGVzLnB1c2goY3VyIGFzIERyYXdTaGFwZSk7XG4gIG9uQ2hhbmdlKGRyYXdhYmxlKTtcbn1cblxuZnVuY3Rpb24gb25DaGFuZ2UoZHJhd2FibGU6IERyYXdhYmxlKTogdm9pZCB7XG4gIGlmIChkcmF3YWJsZS5vbkNoYW5nZSkgZHJhd2FibGUub25DaGFuZ2UoZHJhd2FibGUuc2hhcGVzKTtcbn1cbiIsICJpbXBvcnQgeyBhbmltIH0gZnJvbSAnLi9hbmltLmpzJztcbmltcG9ydCAqIGFzIGJvYXJkIGZyb20gJy4vYm9hcmQuanMnO1xuaW1wb3J0IHsgY29sb3JzIH0gZnJvbSAnLi9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgY2xlYXIgYXMgZHJhd0NsZWFyIH0gZnJvbSAnLi9kcmF3LmpzJztcbmltcG9ydCB7IGFkZFRvSGFuZCwgbnVtYmVySW5IYW5kLCByZW1vdmVGcm9tSGFuZCB9IGZyb20gJy4vaGFuZHMuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBEcmFnQ3VycmVudCB7XG4gIHBpZWNlOiBzZy5QaWVjZTsgLy8gcGllY2UgYmVpbmcgZHJhZ2dlZFxuICBwb3M6IHNnLk51bWJlclBhaXI7IC8vIGxhdGVzdCBldmVudCBwb3NpdGlvblxuICBvcmlnUG9zOiBzZy5OdW1iZXJQYWlyOyAvLyBmaXJzdCBldmVudCBwb3NpdGlvblxuICBzdGFydGVkOiBib29sZWFuOyAvLyB3aGV0aGVyIHRoZSBkcmFnIGhhcyBzdGFydGVkOyBhcyBwZXIgdGhlIGRpc3RhbmNlIHNldHRpbmdcbiAgc3BhcmU6IGJvb2xlYW47IC8vIHdoZXRoZXIgdGhpcyBwaWVjZSBpcyBhIHNwYXJlIG9uZVxuICB0b3VjaDogYm9vbGVhbjsgLy8gd2FzIHRoZSBkcmFnZ2luZyBpbml0aWF0ZWQgZnJvbSB0b3VjaCBldmVudFxuICBvcmlnaW5UYXJnZXQ6IEV2ZW50VGFyZ2V0IHwgbnVsbDtcbiAgZnJvbUJvYXJkPzoge1xuICAgIG9yaWc6IHNnLktleTsgLy8gb3JpZyBrZXkgb2YgZHJhZ2dpbmcgcGllY2VcbiAgICBwcmV2aW91c2x5U2VsZWN0ZWQ/OiBzZy5LZXk7IC8vIHNlbGVjdGVkIHBpZWNlIGJlZm9yZSBkcmFnIGJlZ2FuXG4gICAga2V5SGFzQ2hhbmdlZDogYm9vbGVhbjsgLy8gd2hldGhlciB0aGUgZHJhZyBoYXMgbGVmdCB0aGUgb3JpZyBrZXkgb3IgcGllY2VcbiAgfTtcbiAgZnJvbU91dHNpZGU/OiB7XG4gICAgb3JpZ2luQm91bmRzOiBET01SZWN0IHwgdW5kZWZpbmVkOyAvLyBib3VuZHMgb2YgdGhlIHBpZWNlIHRoYXQgaW5pdGlhdGVkIHRoZSBkcmFnXG4gICAgbGVmdE9yaWdpbjogYm9vbGVhbjsgLy8gaGF2ZSB3ZSBldmVyIGxlZnQgb3JpZ2luQm91bmRzXG4gICAgcHJldmlvdXNseVNlbGVjdGVkUGllY2U/OiBzZy5QaWVjZTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0KHM6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGNvbnN0IGJvdW5kcyA9IHMuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKTtcbiAgY29uc3QgcG9zaXRpb24gPSB1dGlsLmV2ZW50UG9zaXRpb24oZSk7XG4gIGNvbnN0IG9yaWcgPVxuICAgIGJvdW5kcyAmJlxuICAgIHBvc2l0aW9uICYmXG4gICAgdXRpbC5nZXRLZXlBdERvbVBvcyhwb3NpdGlvbiwgdXRpbC5zZW50ZVBvdihzLm9yaWVudGF0aW9uKSwgcy5kaW1lbnNpb25zLCBib3VuZHMpO1xuXG4gIGlmICghb3JpZykgcmV0dXJuO1xuXG4gIGNvbnN0IHBpZWNlID0gcy5waWVjZXMuZ2V0KG9yaWcpO1xuICBjb25zdCBwcmV2aW91c2x5U2VsZWN0ZWQgPSBzLnNlbGVjdGVkO1xuICBpZiAoXG4gICAgIXByZXZpb3VzbHlTZWxlY3RlZCAmJlxuICAgIHMuZHJhd2FibGUuZW5hYmxlZCAmJlxuICAgIChzLmRyYXdhYmxlLmVyYXNlT25DbGljayB8fCAhcGllY2UgfHwgcGllY2UuY29sb3IgIT09IHMudHVybkNvbG9yKVxuICApXG4gICAgZHJhd0NsZWFyKHMpO1xuXG4gIC8vIFByZXZlbnQgdG91Y2ggc2Nyb2xsIGFuZCBjcmVhdGUgbm8gY29ycmVzcG9uZGluZyBtb3VzZSBldmVudCwgaWYgdGhlcmVcbiAgLy8gaXMgYW4gaW50ZW50IHRvIGludGVyYWN0IHdpdGggdGhlIGJvYXJkLlxuICBpZiAoXG4gICAgZS5jYW5jZWxhYmxlICE9PSBmYWxzZSAmJlxuICAgICghZS50b3VjaGVzIHx8XG4gICAgICBzLmJsb2NrVG91Y2hTY3JvbGwgfHxcbiAgICAgIHMuc2VsZWN0ZWRQaWVjZSB8fFxuICAgICAgcGllY2UgfHxcbiAgICAgIHByZXZpb3VzbHlTZWxlY3RlZCB8fFxuICAgICAgcGllY2VDbG9zZVRvKHMsIHBvc2l0aW9uLCBib3VuZHMpKVxuICApXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICBjb25zdCBoYWRQcmVtb3ZlID0gISFzLnByZW1vdmFibGUuY3VycmVudDtcbiAgY29uc3QgaGFkUHJlZHJvcCA9ICEhcy5wcmVkcm9wcGFibGUuY3VycmVudDtcbiAgaWYgKHMuc2VsZWN0YWJsZS5kZWxldGVPblRvdWNoKSBib2FyZC5kZWxldGVQaWVjZShzLCBvcmlnKTtcbiAgZWxzZSBpZiAocy5zZWxlY3RlZCkge1xuICAgIGlmICghYm9hcmQucHJvbW90aW9uRGlhbG9nTW92ZShzLCBzLnNlbGVjdGVkLCBvcmlnKSkge1xuICAgICAgaWYgKGJvYXJkLmNhbk1vdmUocywgcy5zZWxlY3RlZCwgb3JpZykpIGFuaW0oKHN0YXRlKSA9PiBib2FyZC5zZWxlY3RTcXVhcmUoc3RhdGUsIG9yaWcpLCBzKTtcbiAgICAgIGVsc2UgYm9hcmQuc2VsZWN0U3F1YXJlKHMsIG9yaWcpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChzLnNlbGVjdGVkUGllY2UpIHtcbiAgICBpZiAoIWJvYXJkLnByb21vdGlvbkRpYWxvZ0Ryb3Aocywgcy5zZWxlY3RlZFBpZWNlLCBvcmlnKSkge1xuICAgICAgaWYgKGJvYXJkLmNhbkRyb3Aocywgcy5zZWxlY3RlZFBpZWNlLCBvcmlnKSlcbiAgICAgICAgYW5pbSgoc3RhdGUpID0+IGJvYXJkLnNlbGVjdFNxdWFyZShzdGF0ZSwgb3JpZyksIHMpO1xuICAgICAgZWxzZSBib2FyZC5zZWxlY3RTcXVhcmUocywgb3JpZyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGJvYXJkLnNlbGVjdFNxdWFyZShzLCBvcmlnKTtcbiAgfVxuXG4gIGNvbnN0IHN0aWxsU2VsZWN0ZWQgPSBzLnNlbGVjdGVkID09PSBvcmlnO1xuICBjb25zdCBkcmFnZ2VkRWwgPSBzLmRvbS5lbGVtZW50cy5ib2FyZD8uZHJhZ2dlZDtcblxuICBpZiAocGllY2UgJiYgZHJhZ2dlZEVsICYmIHN0aWxsU2VsZWN0ZWQgJiYgYm9hcmQuaXNEcmFnZ2FibGUocywgcGllY2UpKSB7XG4gICAgY29uc3QgdG91Y2ggPSBlLnR5cGUgPT09ICd0b3VjaHN0YXJ0JztcblxuICAgIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB7XG4gICAgICBwaWVjZSxcbiAgICAgIHBvczogcG9zaXRpb24sXG4gICAgICBvcmlnUG9zOiBwb3NpdGlvbixcbiAgICAgIHN0YXJ0ZWQ6IHMuZHJhZ2dhYmxlLmF1dG9EaXN0YW5jZSAmJiAhdG91Y2gsXG4gICAgICBzcGFyZTogZmFsc2UsXG4gICAgICB0b3VjaCxcbiAgICAgIG9yaWdpblRhcmdldDogZS50YXJnZXQsXG4gICAgICBmcm9tQm9hcmQ6IHtcbiAgICAgICAgb3JpZyxcbiAgICAgICAgcHJldmlvdXNseVNlbGVjdGVkLFxuICAgICAgICBrZXlIYXNDaGFuZ2VkOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgfTtcblxuICAgIGRyYWdnZWRFbC5zZ0NvbG9yID0gcGllY2UuY29sb3I7XG4gICAgZHJhZ2dlZEVsLnNnUm9sZSA9IHBpZWNlLnJvbGU7XG4gICAgZHJhZ2dlZEVsLmNsYXNzTmFtZSA9IGBkcmFnZ2luZyAke3V0aWwucGllY2VOYW1lT2YocGllY2UpfWA7XG4gICAgZHJhZ2dlZEVsLmNsYXNzTGlzdC50b2dnbGUoJ3RvdWNoJywgdG91Y2gpO1xuXG4gICAgcHJvY2Vzc0RyYWcocyk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGhhZFByZW1vdmUpIGJvYXJkLnVuc2V0UHJlbW92ZShzKTtcbiAgICBpZiAoaGFkUHJlZHJvcCkgYm9hcmQudW5zZXRQcmVkcm9wKHMpO1xuICB9XG4gIHMuZG9tLnJlZHJhdygpO1xufVxuXG5mdW5jdGlvbiBwaWVjZUNsb3NlVG8oczogU3RhdGUsIHBvczogc2cuTnVtYmVyUGFpciwgYm91bmRzOiBET01SZWN0KTogYm9vbGVhbiB7XG4gIGNvbnN0IGFzU2VudGUgPSB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pO1xuICBjb25zdCByYWRpdXNTcSA9IChib3VuZHMud2lkdGggLyBzLmRpbWVuc2lvbnMuZmlsZXMpICoqIDI7XG4gIGZvciAoY29uc3Qga2V5IG9mIHMucGllY2VzLmtleXMoKSkge1xuICAgIGNvbnN0IGNlbnRlciA9IHV0aWwuY29tcHV0ZVNxdWFyZUNlbnRlcihrZXksIGFzU2VudGUsIHMuZGltZW5zaW9ucywgYm91bmRzKTtcbiAgICBpZiAodXRpbC5kaXN0YW5jZVNxKGNlbnRlciwgcG9zKSA8PSByYWRpdXNTcSkgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZHJhZ05ld1BpZWNlKHM6IFN0YXRlLCBwaWVjZTogc2cuUGllY2UsIGU6IHNnLk1vdWNoRXZlbnQsIHNwYXJlPzogYm9vbGVhbik6IHZvaWQge1xuICBjb25zdCBwcmV2aW91c2x5U2VsZWN0ZWRQaWVjZSA9IHMuc2VsZWN0ZWRQaWVjZTtcbiAgY29uc3QgZHJhZ2dlZEVsID0gcy5kb20uZWxlbWVudHMuYm9hcmQ/LmRyYWdnZWQ7XG4gIGNvbnN0IHBvc2l0aW9uID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpO1xuICBjb25zdCB0b3VjaCA9IGUudHlwZSA9PT0gJ3RvdWNoc3RhcnQnO1xuXG4gIGlmICghcHJldmlvdXNseVNlbGVjdGVkUGllY2UgJiYgIXNwYXJlICYmIHMuZHJhd2FibGUuZW5hYmxlZCAmJiBzLmRyYXdhYmxlLmVyYXNlT25DbGljaylcbiAgICBkcmF3Q2xlYXIocyk7XG5cbiAgaWYgKCFzcGFyZSAmJiBzLnNlbGVjdGFibGUuZGVsZXRlT25Ub3VjaCkge1xuICAgIHJlbW92ZUZyb21IYW5kKHMsIHBpZWNlKTtcbiAgICBib2FyZC51bnNlbGVjdChzKTtcbiAgICB1dGlsLmNhbGxVc2VyRnVuY3Rpb24ocy5ldmVudHMuY2hhbmdlKTtcbiAgfSBlbHNlIGJvYXJkLnNlbGVjdFBpZWNlKHMsIHBpZWNlLCBzcGFyZSk7XG5cbiAgY29uc3QgaGFkUHJlbW92ZSA9ICEhcy5wcmVtb3ZhYmxlLmN1cnJlbnQ7XG4gIGNvbnN0IGhhZFByZWRyb3AgPSAhIXMucHJlZHJvcHBhYmxlLmN1cnJlbnQ7XG4gIGNvbnN0IHN0aWxsU2VsZWN0ZWQgPSBzLnNlbGVjdGVkUGllY2UgJiYgdXRpbC5zYW1lUGllY2Uocy5zZWxlY3RlZFBpZWNlLCBwaWVjZSk7XG5cbiAgLy8gUHJldmVudCB0b3VjaCBzY3JvbGwgYW5kIGNyZWF0ZSBubyBjb3JyZXNwb25kaW5nIG1vdXNlIGV2ZW50LCBpZiB0aGVyZVxuICAvLyBpcyBhbiBpbnRlbnQgdG8gaW50ZXJhY3Qgd2l0aCB0aGUgaGFuZHMuXG4gIGlmIChcbiAgICBlLmNhbmNlbGFibGUgIT09IGZhbHNlICYmXG4gICAgKCFlLnRvdWNoZXMgfHxcbiAgICAgIHMuYmxvY2tUb3VjaFNjcm9sbCB8fFxuICAgICAgcy5zZWxlY3RlZFBpZWNlIHx8XG4gICAgICBwcmV2aW91c2x5U2VsZWN0ZWRQaWVjZSB8fFxuICAgICAgc3RpbGxTZWxlY3RlZCB8fFxuICAgICAgbnVtYmVySW5IYW5kKHMsIHBpZWNlKSA+IDAgfHxcbiAgICAgIChwb3NpdGlvbiAmJiBoYW5kUGllY2VDbG9zZVRvKHMsIHBvc2l0aW9uKSkpXG4gIClcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgaWYgKFxuICAgIGRyYWdnZWRFbCAmJlxuICAgIHBvc2l0aW9uICYmXG4gICAgcy5zZWxlY3RlZFBpZWNlICYmXG4gICAgc3RpbGxTZWxlY3RlZCAmJlxuICAgIGJvYXJkLmlzRHJhZ2dhYmxlKHMsIHBpZWNlLCB0cnVlKVxuICApIHtcbiAgICBzLmRyYWdnYWJsZS5jdXJyZW50ID0ge1xuICAgICAgcGllY2U6IHMuc2VsZWN0ZWRQaWVjZSxcbiAgICAgIHBvczogcG9zaXRpb24sXG4gICAgICBvcmlnUG9zOiBwb3NpdGlvbixcbiAgICAgIHRvdWNoLFxuICAgICAgc3RhcnRlZDogcy5kcmFnZ2FibGUuYXV0b0Rpc3RhbmNlICYmICF0b3VjaCxcbiAgICAgIHNwYXJlOiAhIXNwYXJlLFxuICAgICAgb3JpZ2luVGFyZ2V0OiBlLnRhcmdldCxcbiAgICAgIGZyb21PdXRzaWRlOiB7XG4gICAgICAgIG9yaWdpbkJvdW5kczogIXNwYXJlXG4gICAgICAgICAgPyBzLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMoKS5nZXQodXRpbC5waWVjZU5hbWVPZihwaWVjZSkpXG4gICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgIGxlZnRPcmlnaW46IGZhbHNlLFxuICAgICAgICBwcmV2aW91c2x5U2VsZWN0ZWRQaWVjZTogIXNwYXJlID8gcHJldmlvdXNseVNlbGVjdGVkUGllY2UgOiB1bmRlZmluZWQsXG4gICAgICB9LFxuICAgIH07XG5cbiAgICBkcmFnZ2VkRWwuc2dDb2xvciA9IHBpZWNlLmNvbG9yO1xuICAgIGRyYWdnZWRFbC5zZ1JvbGUgPSBwaWVjZS5yb2xlO1xuICAgIGRyYWdnZWRFbC5jbGFzc05hbWUgPSBgZHJhZ2dpbmcgJHt1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKX1gO1xuICAgIGRyYWdnZWRFbC5jbGFzc0xpc3QudG9nZ2xlKCd0b3VjaCcsIHRvdWNoKTtcblxuICAgIHByb2Nlc3NEcmFnKHMpO1xuICB9IGVsc2Uge1xuICAgIGlmIChoYWRQcmVtb3ZlKSBib2FyZC51bnNldFByZW1vdmUocyk7XG4gICAgaWYgKGhhZFByZWRyb3ApIGJvYXJkLnVuc2V0UHJlZHJvcChzKTtcbiAgfVxuICBzLmRvbS5yZWRyYXcoKTtcbn1cblxuZnVuY3Rpb24gaXNEcmFnUGllY2VWYWxpZChzOiBTdGF0ZSwgY3VyOiBEcmFnQ3VycmVudCk6IGJvb2xlYW4ge1xuICBpZiAoIWN1ci5mcm9tQm9hcmQpIHJldHVybiBjdXIuc3BhcmUgfHwgbnVtYmVySW5IYW5kKHMsIGN1ci5waWVjZSkgPiAwO1xuICBjb25zdCBvcmlnUGllY2UgPSBzLnBpZWNlcy5nZXQoY3VyLmZyb21Cb2FyZC5vcmlnKTtcbiAgcmV0dXJuICEhb3JpZ1BpZWNlICYmIHV0aWwuc2FtZVBpZWNlKG9yaWdQaWVjZSwgY3VyLnBpZWNlKTtcbn1cblxuZnVuY3Rpb24gdHJ5U3RhcnREcmFnKHM6IFN0YXRlLCBjdXI6IERyYWdDdXJyZW50LCBwb3M6IHNnLk51bWJlclBhaXIpOiBib29sZWFuIHtcbiAgaWYgKCFjdXIuc3RhcnRlZCAmJiB1dGlsLmRpc3RhbmNlU3EocG9zLCBjdXIub3JpZ1BvcykgPj0gcy5kcmFnZ2FibGUuZGlzdGFuY2UgKiogMikgcmV0dXJuIHRydWU7XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0RyYWcoczogU3RhdGUpOiB2b2lkIHtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBjb25zdCBjdXIgPSBzLmRyYWdnYWJsZS5jdXJyZW50O1xuICAgIGNvbnN0IGRyYWdnZWRFbCA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkPy5kcmFnZ2VkO1xuICAgIGNvbnN0IGJvdW5kcyA9IHMuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKTtcbiAgICBpZiAoIWN1ciB8fCAhZHJhZ2dlZEVsIHx8ICFib3VuZHMpIHJldHVybjtcbiAgICAvLyBjYW5jZWwgYW5pbWF0aW9ucyB3aGlsZSBkcmFnZ2luZ1xuICAgIGlmIChjdXIuZnJvbUJvYXJkPy5vcmlnICYmIHMuYW5pbWF0aW9uLmN1cnJlbnQ/LnBsYW4uYW5pbXMuaGFzKGN1ci5mcm9tQm9hcmQub3JpZykpXG4gICAgICBzLmFuaW1hdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIC8vIGlmIG1vdmluZyBwaWVjZSBpcyBnb25lLCBjYW5jZWxcbiAgICBpZiAoIWlzRHJhZ1BpZWNlVmFsaWQocywgY3VyKSkgY2FuY2VsKHMpO1xuICAgIGVsc2Uge1xuICAgICAgaWYgKHRyeVN0YXJ0RHJhZyhzLCBjdXIsIGN1ci5wb3MpKSB7XG4gICAgICAgIGN1ci5zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgcy5kb20ucmVkcmF3KCk7XG4gICAgICB9XG4gICAgICBpZiAoY3VyLnN0YXJ0ZWQpIHtcbiAgICAgICAgdXRpbC50cmFuc2xhdGVBYnMoXG4gICAgICAgICAgZHJhZ2dlZEVsLFxuICAgICAgICAgIFtcbiAgICAgICAgICAgIGN1ci5wb3NbMF0gLSBib3VuZHMubGVmdCAtIGJvdW5kcy53aWR0aCAvIChzLmRpbWVuc2lvbnMuZmlsZXMgKiAyKSxcbiAgICAgICAgICAgIGN1ci5wb3NbMV0gLSBib3VuZHMudG9wIC0gYm91bmRzLmhlaWdodCAvIChzLmRpbWVuc2lvbnMucmFua3MgKiAyKSxcbiAgICAgICAgICBdLFxuICAgICAgICAgIHMuc2NhbGVEb3duUGllY2VzID8gMC41IDogMSxcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoIWRyYWdnZWRFbC5zZ0RyYWdnaW5nKSB7XG4gICAgICAgICAgZHJhZ2dlZEVsLnNnRHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgICAgIHV0aWwuc2V0RGlzcGxheShkcmFnZ2VkRWwsIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhvdmVyID0gdXRpbC5nZXRLZXlBdERvbVBvcyhcbiAgICAgICAgICBjdXIucG9zLFxuICAgICAgICAgIHV0aWwuc2VudGVQb3Yocy5vcmllbnRhdGlvbiksXG4gICAgICAgICAgcy5kaW1lbnNpb25zLFxuICAgICAgICAgIGJvdW5kcyxcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoY3VyLmZyb21Cb2FyZClcbiAgICAgICAgICBjdXIuZnJvbUJvYXJkLmtleUhhc0NoYW5nZWQgPSBjdXIuZnJvbUJvYXJkLmtleUhhc0NoYW5nZWQgfHwgY3VyLmZyb21Cb2FyZC5vcmlnICE9PSBob3ZlcjtcbiAgICAgICAgZWxzZSBpZiAoY3VyLmZyb21PdXRzaWRlKVxuICAgICAgICAgIGN1ci5mcm9tT3V0c2lkZS5sZWZ0T3JpZ2luID1cbiAgICAgICAgICAgIGN1ci5mcm9tT3V0c2lkZS5sZWZ0T3JpZ2luIHx8XG4gICAgICAgICAgICAoISFjdXIuZnJvbU91dHNpZGUub3JpZ2luQm91bmRzICYmXG4gICAgICAgICAgICAgICF1dGlsLmlzSW5zaWRlUmVjdChjdXIuZnJvbU91dHNpZGUub3JpZ2luQm91bmRzLCBjdXIucG9zKSk7XG5cbiAgICAgICAgLy8gaWYgdGhlIGhvdmVyZWQgc3F1YXJlIGNoYW5nZWRcbiAgICAgICAgaWYgKGhvdmVyICE9PSBzLmhvdmVyZWQpIHtcbiAgICAgICAgICB1cGRhdGVIb3ZlcmVkU3F1YXJlcyhzLCBob3Zlcik7XG4gICAgICAgICAgaWYgKGN1ci50b3VjaCAmJiBzLmRvbS5lbGVtZW50cy5ib2FyZD8uc3F1YXJlT3Zlcikge1xuICAgICAgICAgICAgaWYgKGhvdmVyICYmIHMuZHJhZ2dhYmxlLnNob3dUb3VjaFNxdWFyZU92ZXJsYXkpIHtcbiAgICAgICAgICAgICAgdXRpbC50cmFuc2xhdGVBYnMoXG4gICAgICAgICAgICAgICAgcy5kb20uZWxlbWVudHMuYm9hcmQuc3F1YXJlT3ZlcixcbiAgICAgICAgICAgICAgICB1dGlsLnBvc1RvVHJhbnNsYXRlQWJzKHMuZGltZW5zaW9ucywgYm91bmRzKShcbiAgICAgICAgICAgICAgICAgIHV0aWwua2V5MnBvcyhob3ZlciksXG4gICAgICAgICAgICAgICAgICB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgMSxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgdXRpbC5zZXREaXNwbGF5KHMuZG9tLmVsZW1lbnRzLmJvYXJkLnNxdWFyZU92ZXIsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdXRpbC5zZXREaXNwbGF5KHMuZG9tLmVsZW1lbnRzLmJvYXJkLnNxdWFyZU92ZXIsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcHJvY2Vzc0RyYWcocyk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZShzOiBTdGF0ZSwgZTogc2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICAvLyBzdXBwb3J0IG9uZSBmaW5nZXIgdG91Y2ggb25seVxuICBpZiAocy5kcmFnZ2FibGUuY3VycmVudCAmJiAoIWUudG91Y2hlcyB8fCBlLnRvdWNoZXMubGVuZ3RoIDwgMikpIHtcbiAgICBjb25zdCBwb3MgPSB1dGlsLmV2ZW50UG9zaXRpb24oZSk7XG4gICAgaWYgKHBvcykgcy5kcmFnZ2FibGUuY3VycmVudC5wb3MgPSBwb3M7XG4gIH0gZWxzZSBpZiAoXG4gICAgKHMuc2VsZWN0ZWQgfHwgcy5zZWxlY3RlZFBpZWNlIHx8IHMuaGlnaGxpZ2h0LmhvdmVyZWQpICYmXG4gICAgIXMuZHJhZ2dhYmxlLmN1cnJlbnQgJiZcbiAgICAoIWUudG91Y2hlcyB8fCBlLnRvdWNoZXMubGVuZ3RoIDwgMilcbiAgKSB7XG4gICAgY29uc3QgcG9zID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpO1xuICAgIGNvbnN0IGJvdW5kcyA9IHMuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKTtcbiAgICBjb25zdCBob3ZlciA9XG4gICAgICBwb3MgJiYgYm91bmRzICYmIHV0aWwuZ2V0S2V5QXREb21Qb3MocG9zLCB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pLCBzLmRpbWVuc2lvbnMsIGJvdW5kcyk7XG4gICAgaWYgKGhvdmVyICE9PSBzLmhvdmVyZWQpIHVwZGF0ZUhvdmVyZWRTcXVhcmVzKHMsIGhvdmVyKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5kKHM6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHMuZHJhZ2dhYmxlLmN1cnJlbnQ7XG4gIGlmICghY3VyKSByZXR1cm47XG4gIC8vIGNyZWF0ZSBubyBjb3JyZXNwb25kaW5nIG1vdXNlIGV2ZW50XG4gIGlmIChlLnR5cGUgPT09ICd0b3VjaGVuZCcgJiYgZS5jYW5jZWxhYmxlICE9PSBmYWxzZSkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAvLyBUaGUgb3JpZ2luIG1heSBoYXZlIGNoYW5nZWQgc2luY2UgdGhlIGxhc3QgYW5pbWF0aW9uIGZyYW1lLlxuICBpZiAoIWlzRHJhZ1BpZWNlVmFsaWQocywgY3VyKSkge1xuICAgIGNhbmNlbChzKTtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gY29tcGFyaW5nIHdpdGggdGhlIG9yaWdpbiB0YXJnZXQgaXMgYW4gZWFzeSB3YXkgdG8gdGVzdCB0aGF0IHRoZSBlbmQgZXZlbnRcbiAgLy8gaGFzIHRoZSBzYW1lIHRvdWNoIG9yaWdpblxuICBpZiAoZS50eXBlID09PSAndG91Y2hlbmQnICYmIGN1ci5vcmlnaW5UYXJnZXQgIT09IGUudGFyZ2V0ICYmICFjdXIuZnJvbU91dHNpZGUpIHtcbiAgICBzLmRyYWdnYWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGlmIChzLmhvdmVyZWQgJiYgIXMuaGlnaGxpZ2h0LmhvdmVyZWQpIHVwZGF0ZUhvdmVyZWRTcXVhcmVzKHMsIHVuZGVmaW5lZCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGJvYXJkLnVuc2V0UHJlbW92ZShzKTtcbiAgYm9hcmQudW5zZXRQcmVkcm9wKHMpO1xuICAvLyB0b3VjaGVuZCBoYXMgbm8gcG9zaXRpb247IHNvIHVzZSB0aGUgbGFzdCB0b3VjaG1vdmUgcG9zaXRpb24gaW5zdGVhZFxuICBjb25zdCBldmVudFBvcyA9IHV0aWwuZXZlbnRQb3NpdGlvbihlKSB8fCBjdXIucG9zO1xuXG4gIGlmICh0cnlTdGFydERyYWcocywgY3VyLCBldmVudFBvcykpIHtcbiAgICBjdXIuc3RhcnRlZCA9IHRydWU7XG4gIH1cblxuICBjb25zdCBib3VuZHMgPSBzLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gIGNvbnN0IGRlc3QgPVxuICAgIGJvdW5kcyAmJiB1dGlsLmdldEtleUF0RG9tUG9zKGV2ZW50UG9zLCB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pLCBzLmRpbWVuc2lvbnMsIGJvdW5kcyk7XG4gIGNvbnN0IG9yaWdpbkhhbmRCb3VuZHMgPVxuICAgIGN1ci5mcm9tT3V0c2lkZSAmJiAhY3VyLnNwYXJlXG4gICAgICA/IHMuZG9tLmJvdW5kcy5oYW5kcy5ib3VuZHMoKS5nZXQoY3VyLnBpZWNlLmNvbG9yID09PSBzLm9yaWVudGF0aW9uID8gJ2JvdHRvbScgOiAndG9wJykgfHxcbiAgICAgICAgY3VyLmZyb21PdXRzaWRlLm9yaWdpbkJvdW5kc1xuICAgICAgOiB1bmRlZmluZWQ7XG5cbiAgaWYgKGRlc3QgJiYgY3VyLnN0YXJ0ZWQgJiYgY3VyLmZyb21Cb2FyZD8ub3JpZyAhPT0gZGVzdCkge1xuICAgIGlmIChjdXIuZnJvbU91dHNpZGUgJiYgIWJvYXJkLnByb21vdGlvbkRpYWxvZ0Ryb3AocywgY3VyLnBpZWNlLCBkZXN0KSlcbiAgICAgIGJvYXJkLnVzZXJEcm9wKHMsIGN1ci5waWVjZSwgZGVzdCk7XG4gICAgZWxzZSBpZiAoY3VyLmZyb21Cb2FyZCAmJiAhYm9hcmQucHJvbW90aW9uRGlhbG9nTW92ZShzLCBjdXIuZnJvbUJvYXJkLm9yaWcsIGRlc3QpKVxuICAgICAgYm9hcmQudXNlck1vdmUocywgY3VyLmZyb21Cb2FyZC5vcmlnLCBkZXN0KTtcbiAgfSBlbHNlIGlmIChcbiAgICBzLmRyYWdnYWJsZS5kZWxldGVPbkRyb3BPZmYgJiZcbiAgICBjdXIuc3RhcnRlZCAmJlxuICAgICFkZXN0ICYmXG4gICAgKCFvcmlnaW5IYW5kQm91bmRzIHx8ICF1dGlsLmlzSW5zaWRlUmVjdChvcmlnaW5IYW5kQm91bmRzLCBldmVudFBvcykpXG4gICkge1xuICAgIGlmIChjdXIuZnJvbUJvYXJkKSBzLnBpZWNlcy5kZWxldGUoY3VyLmZyb21Cb2FyZC5vcmlnKTtcbiAgICBlbHNlIGlmIChjdXIuZnJvbU91dHNpZGUgJiYgIWN1ci5zcGFyZSkgcmVtb3ZlRnJvbUhhbmQocywgY3VyLnBpZWNlKTtcblxuICAgIGlmIChzLmRyYWdnYWJsZS5hZGRUb0hhbmRPbkRyb3BPZmYpIHtcbiAgICAgIGNvbnN0IGhhbmRCb3VuZHMgPSBzLmRvbS5ib3VuZHMuaGFuZHMuYm91bmRzKCk7XG4gICAgICBjb25zdCBoYW5kQm91bmRzVG9wID0gaGFuZEJvdW5kcy5nZXQoJ3RvcCcpO1xuICAgICAgY29uc3QgaGFuZEJvdW5kc0JvdHRvbSA9IGhhbmRCb3VuZHMuZ2V0KCdib3R0b20nKTtcbiAgICAgIGlmIChoYW5kQm91bmRzVG9wICYmIHV0aWwuaXNJbnNpZGVSZWN0KGhhbmRCb3VuZHNUb3AsIGV2ZW50UG9zKSlcbiAgICAgICAgYWRkVG9IYW5kKHMsIHtcbiAgICAgICAgICBjb2xvcjogdXRpbC5vcHBvc2l0ZShzLm9yaWVudGF0aW9uKSxcbiAgICAgICAgICByb2xlOiBjdXIucGllY2Uucm9sZSxcbiAgICAgICAgfSk7XG4gICAgICBlbHNlIGlmIChoYW5kQm91bmRzQm90dG9tICYmIHV0aWwuaXNJbnNpZGVSZWN0KGhhbmRCb3VuZHNCb3R0b20sIGV2ZW50UG9zKSlcbiAgICAgICAgYWRkVG9IYW5kKHMsIHsgY29sb3I6IHMub3JpZW50YXRpb24sIHJvbGU6IGN1ci5waWVjZS5yb2xlIH0pO1xuXG4gICAgICBib2FyZC51bnNlbGVjdChzKTtcbiAgICB9XG4gICAgdXRpbC5jYWxsVXNlckZ1bmN0aW9uKHMuZXZlbnRzLmNoYW5nZSk7XG4gIH1cblxuICBpZiAoXG4gICAgY3VyLmZyb21Cb2FyZCAmJlxuICAgIChjdXIuZnJvbUJvYXJkLm9yaWcgPT09IGN1ci5mcm9tQm9hcmQucHJldmlvdXNseVNlbGVjdGVkIHx8IGN1ci5mcm9tQm9hcmQua2V5SGFzQ2hhbmdlZCkgJiZcbiAgICAoY3VyLmZyb21Cb2FyZC5vcmlnID09PSBkZXN0IHx8ICFkZXN0KVxuICApIHtcbiAgICB1bnNlbGVjdChzLCBjdXIsIGRlc3QpO1xuICB9IGVsc2UgaWYgKFxuICAgICghZGVzdCAmJiBjdXIuZnJvbU91dHNpZGU/LmxlZnRPcmlnaW4pIHx8XG4gICAgKGN1ci5mcm9tT3V0c2lkZT8ub3JpZ2luQm91bmRzICYmXG4gICAgICB1dGlsLmlzSW5zaWRlUmVjdChjdXIuZnJvbU91dHNpZGUub3JpZ2luQm91bmRzLCBjdXIucG9zKSAmJlxuICAgICAgY3VyLmZyb21PdXRzaWRlLnByZXZpb3VzbHlTZWxlY3RlZFBpZWNlICYmXG4gICAgICB1dGlsLnNhbWVQaWVjZShjdXIuZnJvbU91dHNpZGUucHJldmlvdXNseVNlbGVjdGVkUGllY2UsIGN1ci5waWVjZSkpXG4gICkge1xuICAgIHVuc2VsZWN0KHMsIGN1ciwgZGVzdCk7XG4gIH0gZWxzZSBpZiAoIXMuc2VsZWN0YWJsZS5lbmFibGVkICYmICFzLnByb21vdGlvbi5jdXJyZW50KSB7XG4gICAgdW5zZWxlY3QocywgY3VyLCBkZXN0KTtcbiAgfVxuXG4gIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIGlmICghcy5oaWdobGlnaHQuaG92ZXJlZCAmJiAhcy5wcm9tb3Rpb24uY3VycmVudCkgcy5ob3ZlcmVkID0gdW5kZWZpbmVkO1xuICBzLmRvbS5yZWRyYXcoKTtcbn1cblxuZnVuY3Rpb24gaGFuZFBpZWNlQ2xvc2VUbyhzOiBTdGF0ZSwgcG9zOiBzZy5OdW1iZXJQYWlyKTogYm9vbGVhbiB7XG4gIGZvciAoY29uc3QgY29sb3Igb2YgY29sb3JzKSB7XG4gICAgZm9yIChjb25zdCByb2xlIG9mIHMuaGFuZHMucm9sZXMpIHtcbiAgICAgIGNvbnN0IHBpZWNlID0geyBjb2xvciwgcm9sZSB9O1xuICAgICAgY29uc3QgcmVjdCA9IHMuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcygpLmdldCh1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKSk7XG5cbiAgICAgIGlmIChyZWN0ICYmIHV0aWwuaXNOZWFyUmVjdChyZWN0LCBwb3MsIHJlY3Qud2lkdGggLyAyKSAmJiBudW1iZXJJbkhhbmQocywgcGllY2UpID4gMClcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiB1bnNlbGVjdChzOiBTdGF0ZSwgY3VyOiBEcmFnQ3VycmVudCwgZGVzdD86IHNnLktleSk6IHZvaWQge1xuICBpZiAoY3VyLmZyb21Cb2FyZCAmJiBjdXIuZnJvbUJvYXJkLm9yaWcgPT09IGRlc3QpXG4gICAgdXRpbC5jYWxsVXNlckZ1bmN0aW9uKHMuZXZlbnRzLnVuc2VsZWN0LCBjdXIuZnJvbUJvYXJkLm9yaWcpO1xuICBlbHNlIGlmIChcbiAgICBjdXIuZnJvbU91dHNpZGU/Lm9yaWdpbkJvdW5kcyAmJlxuICAgIHV0aWwuaXNJbnNpZGVSZWN0KGN1ci5mcm9tT3V0c2lkZS5vcmlnaW5Cb3VuZHMsIGN1ci5wb3MpXG4gIClcbiAgICB1dGlsLmNhbGxVc2VyRnVuY3Rpb24ocy5ldmVudHMucGllY2VVbnNlbGVjdCwgY3VyLnBpZWNlKTtcbiAgYm9hcmQudW5zZWxlY3Qocyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWwoczogU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQpIHtcbiAgICBzLmRyYWdnYWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGlmICghcy5oaWdobGlnaHQuaG92ZXJlZCkgcy5ob3ZlcmVkID0gdW5kZWZpbmVkO1xuICAgIGJvYXJkLnVuc2VsZWN0KHMpO1xuICAgIHMuZG9tLnJlZHJhdygpO1xuICB9XG59XG5cbi8vIHN1cHBvcnQgb25lIGZpbmdlciB0b3VjaCBvbmx5IG9yIGxlZnQgY2xpY2tcbmV4cG9ydCBmdW5jdGlvbiB1bndhbnRlZEV2ZW50KGU6IHNnLk1vdWNoRXZlbnQpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICAhZS5pc1RydXN0ZWQgfHxcbiAgICAoZS5idXR0b24gIT09IHVuZGVmaW5lZCAmJiBlLmJ1dHRvbiAhPT0gMCkgfHxcbiAgICAoISFlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDEpXG4gICk7XG59XG5cbmZ1bmN0aW9uIHZhbGlkRGVzdFRvSG92ZXIoczogU3RhdGUsIGtleTogc2cuS2V5KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgKCEhcy5zZWxlY3RlZCAmJiAoYm9hcmQuY2FuTW92ZShzLCBzLnNlbGVjdGVkLCBrZXkpIHx8IGJvYXJkLmNhblByZW1vdmUocywgcy5zZWxlY3RlZCwga2V5KSkpIHx8XG4gICAgKCEhcy5zZWxlY3RlZFBpZWNlICYmXG4gICAgICAoYm9hcmQuY2FuRHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIGtleSkgfHwgYm9hcmQuY2FuUHJlZHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIGtleSkpKVxuICApO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVIb3ZlcmVkU3F1YXJlcyhzOiBTdGF0ZSwga2V5OiBzZy5LZXkgfCB1bmRlZmluZWQpOiB2b2lkIHtcbiAgY29uc3Qgc3FhdXJlRWxzID0gcy5kb20uZWxlbWVudHMuYm9hcmQ/LnNxdWFyZXMuY2hpbGRyZW47XG4gIGlmICghc3FhdXJlRWxzIHx8IHMucHJvbW90aW9uLmN1cnJlbnQpIHJldHVybjtcblxuICBjb25zdCBwcmV2SG92ZXIgPSBzLmhvdmVyZWQ7XG4gIGlmIChzLmhpZ2hsaWdodC5ob3ZlcmVkIHx8IChrZXkgJiYgdmFsaWREZXN0VG9Ib3ZlcihzLCBrZXkpKSkgcy5ob3ZlcmVkID0ga2V5O1xuICBlbHNlIHMuaG92ZXJlZCA9IHVuZGVmaW5lZDtcblxuICBjb25zdCBhc1NlbnRlID0gdXRpbC5zZW50ZVBvdihzLm9yaWVudGF0aW9uKTtcbiAgY29uc3QgY3VySW5kZXggPSBzLmhvdmVyZWQgJiYgdXRpbC5kb21TcXVhcmVJbmRleE9mS2V5KHMuaG92ZXJlZCwgYXNTZW50ZSwgcy5kaW1lbnNpb25zKTtcbiAgY29uc3QgY3VySG92ZXJFbCA9IGN1ckluZGV4ICE9PSB1bmRlZmluZWQgJiYgc3FhdXJlRWxzW2N1ckluZGV4XTtcbiAgaWYgKGN1ckhvdmVyRWwpIGN1ckhvdmVyRWwuY2xhc3NMaXN0LmFkZCgnaG92ZXInKTtcblxuICBjb25zdCBwcmV2SW5kZXggPSBwcmV2SG92ZXIgJiYgdXRpbC5kb21TcXVhcmVJbmRleE9mS2V5KHByZXZIb3ZlciwgYXNTZW50ZSwgcy5kaW1lbnNpb25zKTtcbiAgY29uc3QgcHJldkhvdmVyRWwgPSBwcmV2SW5kZXggIT09IHVuZGVmaW5lZCAmJiBzcWF1cmVFbHNbcHJldkluZGV4XTtcbiAgaWYgKHByZXZIb3ZlckVsKSBwcmV2SG92ZXJFbC5jbGFzc0xpc3QucmVtb3ZlKCdob3ZlcicpO1xufVxuIiwgImltcG9ydCB7IGFuaW0gfSBmcm9tICcuL2FuaW0uanMnO1xuaW1wb3J0IHsgY2FuY2VsUHJvbW90aW9uLCBzZWxlY3RTcXVhcmUsIHVzZXJEcm9wLCB1c2VyTW92ZSB9IGZyb20gJy4vYm9hcmQuanMnO1xuaW1wb3J0ICogYXMgZHJhZyBmcm9tICcuL2RyYWcuanMnO1xuaW1wb3J0ICogYXMgZHJhdyBmcm9tICcuL2RyYXcuanMnO1xuaW1wb3J0IHsgdXNlc0JvdW5kcyB9IGZyb20gJy4vc2hhcGVzLmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQge1xuICBjYWxsVXNlckZ1bmN0aW9uLFxuICBldmVudFBvc2l0aW9uLFxuICBnZXRIYW5kUGllY2VBdERvbVBvcyxcbiAgaXNNaWRkbGVCdXR0b24sXG4gIGlzUGllY2VOb2RlLFxuICBpc1JpZ2h0QnV0dG9uLFxuICBzYW1lUGllY2UsXG59IGZyb20gJy4vdXRpbC5qcyc7XG5cbnR5cGUgTW91Y2hCaW5kID0gKGU6IHNnLk1vdWNoRXZlbnQpID0+IHZvaWQ7XG50eXBlIFN0YXRlTW91Y2hCaW5kID0gKGQ6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KSA9PiB2b2lkO1xuXG5mdW5jdGlvbiBjbGVhckJvdW5kcyhzOiBTdGF0ZSk6IHZvaWQge1xuICBzLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzLmNsZWFyKCk7XG4gIHMuZG9tLmJvdW5kcy5oYW5kcy5ib3VuZHMuY2xlYXIoKTtcbiAgcy5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzLmNsZWFyKCk7XG59XG5cbmZ1bmN0aW9uIG9uUmVzaXplKHM6IFN0YXRlKTogKCkgPT4gdm9pZCB7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgY2xlYXJCb3VuZHMocyk7XG4gICAgaWYgKHVzZXNCb3VuZHMocy5kcmF3YWJsZS5zaGFwZXMuY29uY2F0KHMuZHJhd2FibGUuYXV0b1NoYXBlcykpKSBzLmRvbS5yZWRyYXdTaGFwZXMoKTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRCb2FyZChzOiBTdGF0ZSwgYm9hcmRFbHM6IHNnLkJvYXJkRWxlbWVudHMpOiBzZy5VbmJpbmQge1xuICBvYnNlcnZlUmVzaXplKHMsIGJvYXJkRWxzLmJvYXJkKTtcbiAgY29uc3QgdW5iaW5kczogc2cuVW5iaW5kW10gPSBbXTtcblxuICBpZiAoIXMudmlld09ubHkpIHtcbiAgICBjb25zdCBwaWVjZXNFbCA9IGJvYXJkRWxzLnBpZWNlcztcbiAgICBjb25zdCBwcm9tb3Rpb25FbCA9IGJvYXJkRWxzLnByb21vdGlvbjtcblxuICAgIC8vIENhbm5vdCBiZSBwYXNzaXZlLCBiZWNhdXNlIHdlIHByZXZlbnQgdG91Y2ggc2Nyb2xsaW5nIGFuZCBkcmFnZ2luZyBvZiBzZWxlY3RlZCBlbGVtZW50cy5cbiAgICBjb25zdCBvblN0YXJ0ID0gc3RhcnREcmFnT3JEcmF3KHMpIGFzIEV2ZW50TGlzdGVuZXI7XG4gICAgZm9yIChjb25zdCBldiBvZiBbJ3RvdWNoc3RhcnQnLCAnbW91c2Vkb3duJ10pXG4gICAgICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZShwaWVjZXNFbCwgZXYsIG9uU3RhcnQsIHsgcGFzc2l2ZTogZmFsc2UgfSkpO1xuICAgIHVuYmluZHMucHVzaChcbiAgICAgIHVuYmluZGFibGUocGllY2VzRWwsICdjb250ZXh0bWVudScsIChlKSA9PiB7XG4gICAgICAgIGlmIChzLmRpc2FibGVDb250ZXh0TWVudSB8fCBzLmRyYXdhYmxlLmVuYWJsZWQpIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH0pLFxuICAgICk7XG5cbiAgICBpZiAocHJvbW90aW9uRWwpIHtcbiAgICAgIGNvbnN0IHBpZWNlU2VsZWN0aW9uID0gKGU6IHNnLk1vdWNoRXZlbnQpID0+IHByb21vdGUocywgZSk7XG4gICAgICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZShwcm9tb3Rpb25FbCwgJ2NsaWNrJywgcGllY2VTZWxlY3Rpb24gYXMgRXZlbnRMaXN0ZW5lcikpO1xuICAgICAgdW5iaW5kcy5wdXNoKFxuICAgICAgICB1bmJpbmRhYmxlKHByb21vdGlvbkVsLCAnY29udGV4dG1lbnUnLCAoZSkgPT4ge1xuICAgICAgICAgIGlmIChzLmRpc2FibGVDb250ZXh0TWVudSkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9KSxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuICgpID0+IHtcbiAgICB1bmJpbmRzLmZvckVhY2goKGYpID0+IHtcbiAgICAgIGYoKTtcbiAgICB9KTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRIYW5kKHM6IFN0YXRlLCBoYW5kRWw6IEhUTUxFbGVtZW50KTogc2cuVW5iaW5kIHtcbiAgb2JzZXJ2ZVJlc2l6ZShzLCBoYW5kRWwpO1xuICBjb25zdCB1bmJpbmRzOiBzZy5VbmJpbmRbXSA9IFtdO1xuXG4gIGlmICghcy52aWV3T25seSkge1xuICAgIGNvbnN0IG9uU3RhcnQgPSBzdGFydERyYWdGcm9tSGFuZChzKSBhcyBFdmVudExpc3RlbmVyO1xuICAgIGZvciAoY29uc3QgZXYgb2YgWydtb3VzZWRvd24nLCAndG91Y2hzdGFydCddKVxuICAgICAgdW5iaW5kcy5wdXNoKHVuYmluZGFibGUoaGFuZEVsLCBldiwgb25TdGFydCwgeyBwYXNzaXZlOiBmYWxzZSB9KSk7XG4gICAgdW5iaW5kcy5wdXNoKFxuICAgICAgdW5iaW5kYWJsZShoYW5kRWwsICdjbGljaycsICgpID0+IHtcbiAgICAgICAgaWYgKHMucHJvbW90aW9uLmN1cnJlbnQpIHtcbiAgICAgICAgICBjYW5jZWxQcm9tb3Rpb24ocyk7XG4gICAgICAgICAgcy5kb20ucmVkcmF3KCk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgdW5iaW5kYWJsZShoYW5kRWwsICdjb250ZXh0bWVudScsIChlKSA9PiB7XG4gICAgICAgIGlmIChzLmRpc2FibGVDb250ZXh0TWVudSB8fCBzLmRyYXdhYmxlLmVuYWJsZWQpIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICByZXR1cm4gKCkgPT4ge1xuICAgIHVuYmluZHMuZm9yRWFjaCgoZikgPT4ge1xuICAgICAgZigpO1xuICAgIH0pO1xuICB9O1xufVxuXG5mdW5jdGlvbiBvYnNlcnZlUmVzaXplKHM6IFN0YXRlLCBlbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgaWYgKCdSZXNpemVPYnNlcnZlcicgaW4gd2luZG93KSB7XG4gICAgaWYgKCFzLmRvbS5yZXNpemVPYnNlcnZlcikgcy5kb20ucmVzaXplT2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIob25SZXNpemUocykpO1xuICAgIHMuZG9tLnJlc2l6ZU9ic2VydmVyLm9ic2VydmUoZWwpO1xuICB9XG59XG5cbi8vIHJldHVybnMgdGhlIHVuYmluZCBmdW5jdGlvblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmREb2N1bWVudChzOiBTdGF0ZSk6IHNnLlVuYmluZCB7XG4gIGNvbnN0IHVuYmluZHM6IHNnLlVuYmluZFtdID0gW107XG4gIHVuYmluZHMucHVzaCgoKSA9PiBzLmRvbS5yZXNpemVPYnNlcnZlcj8uZGlzY29ubmVjdCgpKTtcblxuICAvLyBPbGQgdmVyc2lvbnMgb2YgRWRnZSBhbmQgU2FmYXJpIGRvIG5vdCBzdXBwb3J0IFJlc2l6ZU9ic2VydmVyLiBTZW5kXG4gIC8vIHNob2dpZ3JvdW5kLnJlc2l6ZSBpZiBhIHVzZXIgYWN0aW9uIGhhcyBjaGFuZ2VkIHRoZSBib3VuZHMgb2YgdGhlIGJvYXJkLlxuICBpZiAoISgnUmVzaXplT2JzZXJ2ZXInIGluIHdpbmRvdykpIHtcbiAgICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZShkb2N1bWVudC5ib2R5LCAnc2hvZ2lncm91bmQucmVzaXplJywgb25SZXNpemUocykpKTtcbiAgfVxuXG4gIGlmICghcy52aWV3T25seSkge1xuICAgIGNvbnN0IG9ubW92ZSA9IGRyYWdPckRyYXcocywgZHJhZy5tb3ZlLCBkcmF3Lm1vdmUpO1xuICAgIGNvbnN0IG9uZW5kID0gZHJhZ09yRHJhdyhzLCBkcmFnLmVuZCwgZHJhdy5lbmQpO1xuICAgIGNvbnN0IG9uY2FuY2VsID0gZHJhZ09yRHJhdyhzLCBkcmFnLmNhbmNlbCwgZHJhdy5jYW5jZWwpO1xuXG4gICAgZm9yIChjb25zdCBldiBvZiBbJ3RvdWNobW92ZScsICdtb3VzZW1vdmUnXSlcbiAgICAgIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKGRvY3VtZW50LCBldiwgb25tb3ZlIGFzIEV2ZW50TGlzdGVuZXIpKTtcbiAgICBmb3IgKGNvbnN0IGV2IG9mIFsndG91Y2hlbmQnLCAnbW91c2V1cCddKVxuICAgICAgdW5iaW5kcy5wdXNoKHVuYmluZGFibGUoZG9jdW1lbnQsIGV2LCBvbmVuZCBhcyBFdmVudExpc3RlbmVyKSk7XG4gICAgdW5iaW5kcy5wdXNoKHVuYmluZGFibGUoZG9jdW1lbnQsICd0b3VjaGNhbmNlbCcsIG9uY2FuY2VsIGFzIEV2ZW50TGlzdGVuZXIpKTtcblxuICAgIHVuYmluZHMucHVzaChcbiAgICAgIHVuYmluZGFibGUoZG9jdW1lbnQsICdzY3JvbGwnLCAoKSA9PiBjbGVhckJvdW5kcyhzKSwgeyBjYXB0dXJlOiB0cnVlLCBwYXNzaXZlOiB0cnVlIH0pLFxuICAgICk7XG4gICAgdW5iaW5kcy5wdXNoKHVuYmluZGFibGUod2luZG93LCAncmVzaXplJywgKCkgPT4gY2xlYXJCb3VuZHMocyksIHsgcGFzc2l2ZTogdHJ1ZSB9KSk7XG4gIH1cblxuICByZXR1cm4gKCkgPT5cbiAgICB1bmJpbmRzLmZvckVhY2goKGYpID0+IHtcbiAgICAgIGYoKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gdW5iaW5kYWJsZShcbiAgZWw6IEV2ZW50VGFyZ2V0LFxuICBldmVudE5hbWU6IHN0cmluZyxcbiAgY2FsbGJhY2s6IEV2ZW50TGlzdGVuZXIsXG4gIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyxcbik6IHNnLlVuYmluZCB7XG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjaywgb3B0aW9ucyk7XG4gIHJldHVybiAoKSA9PiBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2ssIG9wdGlvbnMpO1xufVxuXG5mdW5jdGlvbiBzdGFydERyYWdPckRyYXcoczogU3RhdGUpOiBNb3VjaEJpbmQge1xuICByZXR1cm4gKGUpID0+IHtcbiAgICBpZiAocy5kcmFnZ2FibGUuY3VycmVudCkgZHJhZy5jYW5jZWwocyk7XG4gICAgZWxzZSBpZiAocy5kcmF3YWJsZS5jdXJyZW50KSBkcmF3LmNhbmNlbChzKTtcbiAgICBlbHNlIGlmIChlLnNoaWZ0S2V5IHx8IGlzUmlnaHRCdXR0b24oZSkgfHwgcy5kcmF3YWJsZS5mb3JjZWQpIHtcbiAgICAgIGlmIChzLmRyYXdhYmxlLmVuYWJsZWQpIGRyYXcuc3RhcnQocywgZSk7XG4gICAgfSBlbHNlIGlmICghcy52aWV3T25seSAmJiAhZHJhZy51bndhbnRlZEV2ZW50KGUpKSBkcmFnLnN0YXJ0KHMsIGUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBkcmFnT3JEcmF3KHM6IFN0YXRlLCB3aXRoRHJhZzogU3RhdGVNb3VjaEJpbmQsIHdpdGhEcmF3OiBTdGF0ZU1vdWNoQmluZCk6IE1vdWNoQmluZCB7XG4gIHJldHVybiAoZSkgPT4ge1xuICAgIGlmIChzLmRyYXdhYmxlLmN1cnJlbnQpIHtcbiAgICAgIGlmIChzLmRyYXdhYmxlLmVuYWJsZWQpIHdpdGhEcmF3KHMsIGUpO1xuICAgIH0gZWxzZSBpZiAoIXMudmlld09ubHkpIHdpdGhEcmFnKHMsIGUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdGFydERyYWdGcm9tSGFuZChzOiBTdGF0ZSk6IE1vdWNoQmluZCB7XG4gIHJldHVybiAoZSkgPT4ge1xuICAgIGlmIChzLnByb21vdGlvbi5jdXJyZW50KSByZXR1cm47XG5cbiAgICBjb25zdCBwb3MgPSBldmVudFBvc2l0aW9uKGUpO1xuICAgIGNvbnN0IHBpZWNlID0gcG9zICYmIGdldEhhbmRQaWVjZUF0RG9tUG9zKHBvcywgcy5oYW5kcy5yb2xlcywgcy5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzKCkpO1xuXG4gICAgaWYgKHBpZWNlKSB7XG4gICAgICBpZiAocy5kcmFnZ2FibGUuY3VycmVudCkgZHJhZy5jYW5jZWwocyk7XG4gICAgICBlbHNlIGlmIChzLmRyYXdhYmxlLmN1cnJlbnQpIGRyYXcuY2FuY2VsKHMpO1xuICAgICAgZWxzZSBpZiAoaXNNaWRkbGVCdXR0b24oZSkpIHtcbiAgICAgICAgaWYgKHMuZHJhd2FibGUuZW5hYmxlZCkge1xuICAgICAgICAgIGlmIChlLmNhbmNlbGFibGUgIT09IGZhbHNlKSBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgZHJhdy5zZXREcmF3UGllY2UocywgcGllY2UpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGUuc2hpZnRLZXkgfHwgaXNSaWdodEJ1dHRvbihlKSB8fCBzLmRyYXdhYmxlLmZvcmNlZCkge1xuICAgICAgICBpZiAocy5kcmF3YWJsZS5lbmFibGVkKSBkcmF3LnN0YXJ0RnJvbUhhbmQocywgcGllY2UsIGUpO1xuICAgICAgfSBlbHNlIGlmICghcy52aWV3T25seSAmJiAhZHJhZy51bndhbnRlZEV2ZW50KGUpKSB7XG4gICAgICAgIGRyYWcuZHJhZ05ld1BpZWNlKHMsIHBpZWNlLCBlKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIHByb21vdGUoczogU3RhdGUsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudCB8IG51bGw7XG4gIGNvbnN0IGN1ciA9IHMucHJvbW90aW9uLmN1cnJlbnQ7XG4gIGlmICh0YXJnZXQgJiYgaXNQaWVjZU5vZGUodGFyZ2V0KSAmJiBjdXIpIHtcbiAgICBjb25zdCBwaWVjZSA9IHsgY29sb3I6IHRhcmdldC5zZ0NvbG9yLCByb2xlOiB0YXJnZXQuc2dSb2xlIH07XG4gICAgY29uc3QgcHJvbSA9ICFzYW1lUGllY2UoY3VyLnBpZWNlLCBwaWVjZSk7XG4gICAgaWYgKGN1ci5kcmFnZ2VkIHx8IChzLnR1cm5Db2xvciAhPT0gcy5hY3RpdmVDb2xvciAmJiBzLmFjdGl2ZUNvbG9yICE9PSAnYm90aCcpKSB7XG4gICAgICBpZiAocy5zZWxlY3RlZCkgdXNlck1vdmUocywgcy5zZWxlY3RlZCwgY3VyLmtleSwgcHJvbSk7XG4gICAgICBlbHNlIGlmIChzLnNlbGVjdGVkUGllY2UpIHVzZXJEcm9wKHMsIHMuc2VsZWN0ZWRQaWVjZSwgY3VyLmtleSwgcHJvbSk7XG4gICAgfSBlbHNlIGFuaW0oKHMpID0+IHNlbGVjdFNxdWFyZShzLCBjdXIua2V5LCBwcm9tKSwgcyk7XG5cbiAgICBjYWxsVXNlckZ1bmN0aW9uKHMucHJvbW90aW9uLmV2ZW50cy5hZnRlciwgcGllY2UpO1xuICB9IGVsc2UgYW5pbSgocykgPT4gY2FuY2VsUHJvbW90aW9uKHMpLCBzKTtcbiAgcy5wcm9tb3Rpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcblxuICBzLmRvbS5yZWRyYXcoKTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IEFuaW1DdXJyZW50LCBBbmltRmFkaW5ncywgQW5pbVByb21vdGlvbnMsIEFuaW1WZWN0b3IsIEFuaW1WZWN0b3JzIH0gZnJvbSAnLi9hbmltLmpzJztcbmltcG9ydCB0eXBlIHsgRHJhZ0N1cnJlbnQgfSBmcm9tICcuL2RyYWcuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7XG4gIGNyZWF0ZUVsLFxuICBpc1BpZWNlTm9kZSxcbiAgaXNTcXVhcmVOb2RlLFxuICBrZXkycG9zLFxuICBwaWVjZU5hbWVPZixcbiAgcG9zVG9UcmFuc2xhdGVSZWwsXG4gIHNlbnRlUG92LFxuICBzZXREaXNwbGF5LFxuICB0cmFuc2xhdGVSZWwsXG59IGZyb20gJy4vdXRpbC5qcyc7XG5cbnR5cGUgU3F1YXJlQ2xhc3NlcyA9IE1hcDxzZy5LZXksIHN0cmluZz47XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXIoczogU3RhdGUsIGJvYXJkRWxzOiBzZy5Cb2FyZEVsZW1lbnRzKTogdm9pZCB7XG4gIGNvbnN0IGFzU2VudGU6IGJvb2xlYW4gPSBzZW50ZVBvdihzLm9yaWVudGF0aW9uKTtcbiAgY29uc3Qgc2NhbGVEb3duID0gcy5zY2FsZURvd25QaWVjZXMgPyAwLjUgOiAxO1xuICBjb25zdCBwb3NUb1RyYW5zbGF0ZSA9IHBvc1RvVHJhbnNsYXRlUmVsKHMuZGltZW5zaW9ucyk7XG4gIGNvbnN0IHNxdWFyZXNFbDogSFRNTEVsZW1lbnQgPSBib2FyZEVscy5zcXVhcmVzO1xuICBjb25zdCBwaWVjZXNFbDogSFRNTEVsZW1lbnQgPSBib2FyZEVscy5waWVjZXM7XG4gIGNvbnN0IGRyYWdnZWRFbDogc2cuUGllY2VOb2RlIHwgdW5kZWZpbmVkID0gYm9hcmRFbHMuZHJhZ2dlZDtcbiAgY29uc3Qgc3F1YXJlT3ZlckVsOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZCA9IGJvYXJkRWxzLnNxdWFyZU92ZXI7XG4gIGNvbnN0IHByb21vdGlvbkVsOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZCA9IGJvYXJkRWxzLnByb21vdGlvbjtcbiAgY29uc3QgcGllY2VzOiBzZy5QaWVjZXMgPSBzLnBpZWNlcztcbiAgY29uc3QgY3VyQW5pbTogQW5pbUN1cnJlbnQgfCB1bmRlZmluZWQgPSBzLmFuaW1hdGlvbi5jdXJyZW50O1xuICBjb25zdCBhbmltczogQW5pbVZlY3RvcnMgPSBjdXJBbmltID8gY3VyQW5pbS5wbGFuLmFuaW1zIDogbmV3IE1hcCgpO1xuICBjb25zdCBmYWRpbmdzOiBBbmltRmFkaW5ncyA9IGN1ckFuaW0gPyBjdXJBbmltLnBsYW4uZmFkaW5ncyA6IG5ldyBNYXAoKTtcbiAgY29uc3QgcHJvbW90aW9uczogQW5pbVByb21vdGlvbnMgPSBjdXJBbmltID8gY3VyQW5pbS5wbGFuLnByb21vdGlvbnMgOiBuZXcgTWFwKCk7XG4gIGNvbnN0IGN1ckRyYWc6IERyYWdDdXJyZW50IHwgdW5kZWZpbmVkID0gcy5kcmFnZ2FibGUuY3VycmVudDtcbiAgY29uc3QgY3VyUHJvbUtleTogc2cuS2V5IHwgdW5kZWZpbmVkID0gcy5wcm9tb3Rpb24uY3VycmVudD8uZHJhZ2dlZCA/IHMuc2VsZWN0ZWQgOiB1bmRlZmluZWQ7XG4gIGNvbnN0IHNxdWFyZXM6IFNxdWFyZUNsYXNzZXMgPSBjb21wdXRlU3F1YXJlQ2xhc3NlcyhzKTtcbiAgY29uc3Qgc2FtZVBpZWNlcyA9IG5ldyBTZXQ8c2cuS2V5PigpO1xuICBjb25zdCBtb3ZlZFBpZWNlcyA9IG5ldyBNYXA8c2cuUGllY2VOYW1lLCBzZy5QaWVjZU5vZGVbXT4oKTtcblxuICAvLyBpZiBwaWVjZSBub3QgYmVpbmcgZHJhZ2dlZCBhbnltb3JlLCBoaWRlIGl0XG4gIGlmICghY3VyRHJhZyAmJiBkcmFnZ2VkRWw/LnNnRHJhZ2dpbmcpIHtcbiAgICBkcmFnZ2VkRWwuc2dEcmFnZ2luZyA9IGZhbHNlO1xuICAgIHNldERpc3BsYXkoZHJhZ2dlZEVsLCBmYWxzZSk7XG4gICAgaWYgKHNxdWFyZU92ZXJFbCkgc2V0RGlzcGxheShzcXVhcmVPdmVyRWwsIGZhbHNlKTtcbiAgfVxuXG4gIGxldCBrOiBzZy5LZXk7XG4gIGxldCBlbDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIGxldCBwaWVjZUF0S2V5OiBzZy5QaWVjZSB8IHVuZGVmaW5lZDtcbiAgbGV0IGVsUGllY2VOYW1lOiBzZy5QaWVjZU5hbWU7XG4gIGxldCBhbmltOiBBbmltVmVjdG9yIHwgdW5kZWZpbmVkO1xuICBsZXQgZmFkaW5nOiBzZy5QaWVjZSB8IHVuZGVmaW5lZDtcbiAgbGV0IHByb206IHNnLlBpZWNlIHwgdW5kZWZpbmVkO1xuICBsZXQgcE12ZHNldDogc2cuUGllY2VOb2RlW10gfCB1bmRlZmluZWQ7XG4gIGxldCBwTXZkOiBzZy5QaWVjZU5vZGUgfCB1bmRlZmluZWQ7XG5cbiAgLy8gd2FsayBvdmVyIGFsbCBib2FyZCBkb20gZWxlbWVudHMsIGFwcGx5IGFuaW1hdGlvbnMgYW5kIGZsYWcgbW92ZWQgcGllY2VzXG4gIGVsID0gcGllY2VzRWwuZmlyc3RFbGVtZW50Q2hpbGQgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIHdoaWxlIChlbCkge1xuICAgIGlmIChpc1BpZWNlTm9kZShlbCkpIHtcbiAgICAgIGsgPSBlbC5zZ0tleTtcbiAgICAgIHBpZWNlQXRLZXkgPSBwaWVjZXMuZ2V0KGspO1xuICAgICAgYW5pbSA9IGFuaW1zLmdldChrKTtcbiAgICAgIGZhZGluZyA9IGZhZGluZ3MuZ2V0KGspO1xuICAgICAgcHJvbSA9IHByb21vdGlvbnMuZ2V0KGspO1xuICAgICAgZWxQaWVjZU5hbWUgPSBwaWVjZU5hbWVPZih7IGNvbG9yOiBlbC5zZ0NvbG9yLCByb2xlOiBlbC5zZ1JvbGUgfSk7XG5cbiAgICAgIC8vIEdob3N0IHRoZSBvcmlnaW4gZHVyaW5nIGEgZHJhZyBvciBkcmFnZ2VkIHByb21vdGlvbi5cbiAgICAgIGlmIChcbiAgICAgICAgKChjdXJEcmFnPy5zdGFydGVkICYmIGN1ckRyYWcuZnJvbUJvYXJkPy5vcmlnID09PSBrKSB8fCAoY3VyUHJvbUtleSAmJiBjdXJQcm9tS2V5ID09PSBrKSkgJiZcbiAgICAgICAgIWVsLnNnR2hvc3RcbiAgICAgICkge1xuICAgICAgICBlbC5zZ0dob3N0ID0gdHJ1ZTtcbiAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2hvc3QnKTtcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIGVsLnNnR2hvc3QgJiZcbiAgICAgICAgKCFjdXJEcmFnIHx8IGN1ckRyYWcuZnJvbUJvYXJkPy5vcmlnICE9PSBrKSAmJlxuICAgICAgICAoIWN1clByb21LZXkgfHwgY3VyUHJvbUtleSAhPT0gaylcbiAgICAgICkge1xuICAgICAgICBlbC5zZ0dob3N0ID0gZmFsc2U7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2dob3N0Jyk7XG4gICAgICAgIHNldERpc3BsYXkoZWwsIHRydWUpO1xuICAgICAgfVxuICAgICAgaWYgKGVsLnNnR2hvc3QpIHNldERpc3BsYXkoZWwsIHMuZHJhZ2dhYmxlLnNob3dHaG9zdCB8fCBjdXJQcm9tS2V5ID09PSBrKTtcbiAgICAgIC8vIHJlbW92ZSBmYWRpbmcgY2xhc3MgaWYgaXQgc3RpbGwgcmVtYWluc1xuICAgICAgaWYgKCFmYWRpbmcgJiYgZWwuc2dGYWRpbmcpIHtcbiAgICAgICAgZWwuc2dGYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZmFkaW5nJyk7XG4gICAgICB9XG4gICAgICAvLyB0aGVyZSBpcyBub3cgYSBwaWVjZSBhdCB0aGlzIGRvbSBrZXlcbiAgICAgIGlmIChwaWVjZUF0S2V5KSB7XG4gICAgICAgIC8vIGNvbnRpbnVlIGFuaW1hdGlvbiBpZiBhbHJlYWR5IGFuaW1hdGluZyBhbmQgc2FtZSBwaWVjZSBvciBwcm9tb3RpbmcgcGllY2VcbiAgICAgICAgLy8gKG90aGVyd2lzZSBpdCBjb3VsZCBhbmltYXRlIGEgY2FwdHVyZWQgcGllY2UpXG4gICAgICAgIGlmIChcbiAgICAgICAgICBhbmltICYmXG4gICAgICAgICAgZWwuc2dBbmltYXRpbmcgJiZcbiAgICAgICAgICAoZWxQaWVjZU5hbWUgPT09IHBpZWNlTmFtZU9mKHBpZWNlQXRLZXkpIHx8IChwcm9tICYmIGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihwcm9tKSkpXG4gICAgICAgICkge1xuICAgICAgICAgIGNvbnN0IHBvcyA9IGtleTJwb3Moayk7XG4gICAgICAgICAgcG9zWzBdICs9IGFuaW1bMl07XG4gICAgICAgICAgcG9zWzFdICs9IGFuaW1bM107XG4gICAgICAgICAgdHJhbnNsYXRlUmVsKGVsLCBwb3NUb1RyYW5zbGF0ZShwb3MsIGFzU2VudGUpLCBzY2FsZURvd24pO1xuICAgICAgICAgIGVsLnNnU2NhbGVkRG93biA9IHMuc2NhbGVEb3duUGllY2VzO1xuICAgICAgICB9IGVsc2UgaWYgKGVsLnNnQW5pbWF0aW5nIHx8IGVsLnNnU2NhbGVkRG93biAhPT0gcy5zY2FsZURvd25QaWVjZXMpIHtcbiAgICAgICAgICBpZiAoZWwuc2dBbmltYXRpbmcpIHtcbiAgICAgICAgICAgIGVsLnNnQW5pbWF0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdhbmltJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRyYW5zbGF0ZVJlbChlbCwgcG9zVG9UcmFuc2xhdGUoa2V5MnBvcyhrKSwgYXNTZW50ZSksIHNjYWxlRG93bik7XG4gICAgICAgICAgZWwuc2dTY2FsZWREb3duID0gcy5zY2FsZURvd25QaWVjZXM7XG4gICAgICAgIH1cbiAgICAgICAgLy8gc2FtZSBwaWVjZTogZmxhZyBhcyBzYW1lXG4gICAgICAgIGlmIChlbFBpZWNlTmFtZSA9PT0gcGllY2VOYW1lT2YocGllY2VBdEtleSkgJiYgKCFmYWRpbmcgfHwgIWVsLnNnRmFkaW5nKSkge1xuICAgICAgICAgIHNhbWVQaWVjZXMuYWRkKGspO1xuICAgICAgICB9XG4gICAgICAgIC8vIGRpZmZlcmVudCBwaWVjZTogZmxhZyBhcyBtb3ZlZCB1bmxlc3MgaXQgaXMgYSBmYWRpbmcgcGllY2Ugb3IgYW4gYW5pbWF0ZWQgcHJvbW90aW5nIHBpZWNlXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGlmIChmYWRpbmcgJiYgZWxQaWVjZU5hbWUgPT09IHBpZWNlTmFtZU9mKGZhZGluZykpIHtcbiAgICAgICAgICAgIGVsLnNnRmFkaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2ZhZGluZycpO1xuICAgICAgICAgIH0gZWxzZSBpZiAocHJvbSAmJiBlbFBpZWNlTmFtZSA9PT0gcGllY2VOYW1lT2YocHJvbSkpIHtcbiAgICAgICAgICAgIHNhbWVQaWVjZXMuYWRkKGspO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcHBlbmRWYWx1ZShtb3ZlZFBpZWNlcywgZWxQaWVjZU5hbWUsIGVsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIG5vIHBpZWNlOiBmbGFnIGFzIG1vdmVkXG4gICAgICBlbHNlIHtcbiAgICAgICAgYXBwZW5kVmFsdWUobW92ZWRQaWVjZXMsIGVsUGllY2VOYW1lLCBlbCk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsID0gZWwubmV4dEVsZW1lbnRTaWJsaW5nIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICB9XG5cbiAgLy8gd2FsayBvdmVyIGFsbCBzcXVhcmVzIGFuZCBhcHBseSBjbGFzc2VzXG4gIGxldCBzcUVsID0gc3F1YXJlc0VsLmZpcnN0RWxlbWVudENoaWxkIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICB3aGlsZSAoc3FFbCAmJiBpc1NxdWFyZU5vZGUoc3FFbCkpIHtcbiAgICBzcUVsLmNsYXNzTmFtZSA9IHNxdWFyZXMuZ2V0KHNxRWwuc2dLZXkpIHx8ICcnO1xuICAgIHNxRWwgPSBzcUVsLm5leHRFbGVtZW50U2libGluZyBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8vIHdhbGsgb3ZlciBhbGwgcGllY2VzIGluIGN1cnJlbnQgc2V0LCBhcHBseSBkb20gY2hhbmdlcyB0byBtb3ZlZCBwaWVjZXNcbiAgLy8gb3IgYXBwZW5kIG5ldyBwaWVjZXNcbiAgZm9yIChjb25zdCBbaywgcF0gb2YgcGllY2VzKSB7XG4gICAgY29uc3QgcGllY2UgPSBwcm9tb3Rpb25zLmdldChrKSB8fCBwO1xuICAgIGFuaW0gPSBhbmltcy5nZXQoayk7XG4gICAgaWYgKCFzYW1lUGllY2VzLmhhcyhrKSkge1xuICAgICAgcE12ZHNldCA9IG1vdmVkUGllY2VzLmdldChwaWVjZU5hbWVPZihwaWVjZSkpO1xuICAgICAgcE12ZCA9IHBNdmRzZXQ/LnBvcCgpO1xuICAgICAgLy8gYSBzYW1lIHBpZWNlIHdhcyBtb3ZlZFxuICAgICAgaWYgKHBNdmQpIHtcbiAgICAgICAgLy8gYXBwbHkgZG9tIGNoYW5nZXNcbiAgICAgICAgcE12ZC5zZ0tleSA9IGs7XG4gICAgICAgIGlmIChwTXZkLnNnRmFkaW5nKSB7XG4gICAgICAgICAgcE12ZC5zZ0ZhZGluZyA9IGZhbHNlO1xuICAgICAgICAgIHBNdmQuY2xhc3NMaXN0LnJlbW92ZSgnZmFkaW5nJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcG9zID0ga2V5MnBvcyhrKTtcbiAgICAgICAgaWYgKGFuaW0pIHtcbiAgICAgICAgICBwTXZkLnNnQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgICAgICBwTXZkLmNsYXNzTGlzdC5hZGQoJ2FuaW0nKTtcbiAgICAgICAgICBwb3NbMF0gKz0gYW5pbVsyXTtcbiAgICAgICAgICBwb3NbMV0gKz0gYW5pbVszXTtcbiAgICAgICAgfVxuICAgICAgICB0cmFuc2xhdGVSZWwocE12ZCwgcG9zVG9UcmFuc2xhdGUocG9zLCBhc1NlbnRlKSwgc2NhbGVEb3duKTtcbiAgICAgICAgcE12ZC5zZ1NjYWxlZERvd24gPSBzLnNjYWxlRG93blBpZWNlcztcbiAgICAgIH1cbiAgICAgIC8vIG5vIHBpZWNlIGluIG1vdmVkIG9iajogaW5zZXJ0IHRoZSBuZXcgcGllY2VcbiAgICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBwaWVjZU5vZGUgPSBjcmVhdGVFbCgncGllY2UnLCBwaWVjZU5hbWVPZihwKSkgYXMgc2cuUGllY2VOb2RlO1xuICAgICAgICBjb25zdCBwb3MgPSBrZXkycG9zKGspO1xuXG4gICAgICAgIHBpZWNlTm9kZS5zZ0NvbG9yID0gcC5jb2xvcjtcbiAgICAgICAgcGllY2VOb2RlLnNnUm9sZSA9IHAucm9sZTtcbiAgICAgICAgcGllY2VOb2RlLnNnS2V5ID0gaztcbiAgICAgICAgaWYgKGFuaW0pIHtcbiAgICAgICAgICBwaWVjZU5vZGUuc2dBbmltYXRpbmcgPSB0cnVlO1xuICAgICAgICAgIHBvc1swXSArPSBhbmltWzJdO1xuICAgICAgICAgIHBvc1sxXSArPSBhbmltWzNdO1xuICAgICAgICB9XG4gICAgICAgIHRyYW5zbGF0ZVJlbChwaWVjZU5vZGUsIHBvc1RvVHJhbnNsYXRlKHBvcywgYXNTZW50ZSksIHNjYWxlRG93bik7XG4gICAgICAgIHBpZWNlTm9kZS5zZ1NjYWxlZERvd24gPSBzLnNjYWxlRG93blBpZWNlcztcblxuICAgICAgICBwaWVjZXNFbC5hcHBlbmRDaGlsZChwaWVjZU5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvLyByZW1vdmUgYW55IGVsZW1lbnQgdGhhdCByZW1haW5zIGluIHRoZSBtb3ZlZCBzZXRzXG4gIGZvciAoY29uc3Qgbm9kZXMgb2YgbW92ZWRQaWVjZXMudmFsdWVzKCkpIHtcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICAgIHBpZWNlc0VsLnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChwcm9tb3Rpb25FbCkgcmVuZGVyUHJvbW90aW9uKHMsIHByb21vdGlvbkVsKTtcbn1cblxuZnVuY3Rpb24gYXBwZW5kVmFsdWU8SywgVj4obWFwOiBNYXA8SywgVltdPiwga2V5OiBLLCB2YWx1ZTogVik6IHZvaWQge1xuICBjb25zdCBhcnIgPSBtYXAuZ2V0KGtleSk7XG4gIGlmIChhcnIpIGFyci5wdXNoKHZhbHVlKTtcbiAgZWxzZSBtYXAuc2V0KGtleSwgW3ZhbHVlXSk7XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVTcXVhcmVDbGFzc2VzKHM6IFN0YXRlKTogU3F1YXJlQ2xhc3NlcyB7XG4gIGNvbnN0IHNxdWFyZXM6IFNxdWFyZUNsYXNzZXMgPSBuZXcgTWFwKCk7XG4gIGlmIChzLmxhc3REZXN0cyAmJiBzLmhpZ2hsaWdodC5sYXN0RGVzdHMpXG4gICAgZm9yIChjb25zdCBrIG9mIHMubGFzdERlc3RzKSBhZGRTcXVhcmUoc3F1YXJlcywgaywgJ2xhc3QtZGVzdCcpO1xuICBpZiAocy5jaGVja3MgJiYgcy5oaWdobGlnaHQuY2hlY2spXG4gICAgZm9yIChjb25zdCBjaGVjayBvZiBzLmNoZWNrcykgYWRkU3F1YXJlKHNxdWFyZXMsIGNoZWNrLCAnY2hlY2snKTtcbiAgaWYgKHMuaG92ZXJlZCkgYWRkU3F1YXJlKHNxdWFyZXMsIHMuaG92ZXJlZCwgJ2hvdmVyJyk7XG4gIGlmIChzLnNlbGVjdGVkKSB7XG4gICAgaWYgKHMuYWN0aXZlQ29sb3IgPT09ICdib3RoJyB8fCBzLmFjdGl2ZUNvbG9yID09PSBzLnR1cm5Db2xvcilcbiAgICAgIGFkZFNxdWFyZShzcXVhcmVzLCBzLnNlbGVjdGVkLCAnc2VsZWN0ZWQnKTtcbiAgICBlbHNlIGFkZFNxdWFyZShzcXVhcmVzLCBzLnNlbGVjdGVkLCAncHJlc2VsZWN0ZWQnKTtcbiAgICBpZiAocy5tb3ZhYmxlLnNob3dEZXN0cykge1xuICAgICAgY29uc3QgZGVzdHMgPSBzLm1vdmFibGUuZGVzdHM/LmdldChzLnNlbGVjdGVkKTtcbiAgICAgIGlmIChkZXN0cylcbiAgICAgICAgZm9yIChjb25zdCBrIG9mIGRlc3RzKSB7XG4gICAgICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIGssIGBkZXN0JHtzLnBpZWNlcy5oYXMoaykgPyAnIG9jJyA6ICcnfWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChzLnByZW1vdmFibGUuc2hvd0Rlc3RzKSB7XG4gICAgICBjb25zdCBwRGVzdHMgPSBzLnByZW1vdmFibGUuZGVzdHM7XG4gICAgICBpZiAocERlc3RzKVxuICAgICAgICBmb3IgKGNvbnN0IGsgb2YgcERlc3RzKSB7XG4gICAgICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIGssIGBwcmUtZGVzdCR7cy5waWVjZXMuaGFzKGspID8gJyBvYycgOiAnJ31gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIGlmIChzLnNlbGVjdGVkUGllY2UpIHtcbiAgICBpZiAocy5kcm9wcGFibGUuc2hvd0Rlc3RzKSB7XG4gICAgICBjb25zdCBkZXN0cyA9IHMuZHJvcHBhYmxlLmRlc3RzPy5nZXQocGllY2VOYW1lT2Yocy5zZWxlY3RlZFBpZWNlKSk7XG4gICAgICBpZiAoZGVzdHMpXG4gICAgICAgIGZvciAoY29uc3QgayBvZiBkZXN0cykge1xuICAgICAgICAgIGFkZFNxdWFyZShzcXVhcmVzLCBrLCAnZGVzdCcpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChzLnByZWRyb3BwYWJsZS5zaG93RGVzdHMpIHtcbiAgICAgIGNvbnN0IHBEZXN0cyA9IHMucHJlZHJvcHBhYmxlLmRlc3RzO1xuICAgICAgaWYgKHBEZXN0cylcbiAgICAgICAgZm9yIChjb25zdCBrIG9mIHBEZXN0cykge1xuICAgICAgICAgIGFkZFNxdWFyZShzcXVhcmVzLCBrLCBgcHJlLWRlc3Qke3MucGllY2VzLmhhcyhrKSA/ICcgb2MnIDogJyd9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gIH1cbiAgY29uc3QgcHJlbW92ZSA9IHMucHJlbW92YWJsZS5jdXJyZW50O1xuICBpZiAocHJlbW92ZSkge1xuICAgIGFkZFNxdWFyZShzcXVhcmVzLCBwcmVtb3ZlLm9yaWcsICdjdXJyZW50LXByZScpO1xuICAgIGFkZFNxdWFyZShzcXVhcmVzLCBwcmVtb3ZlLmRlc3QsIGBjdXJyZW50LXByZSR7cHJlbW92ZS5wcm9tID8gJyBwcm9tJyA6ICcnfWApO1xuICB9IGVsc2UgaWYgKHMucHJlZHJvcHBhYmxlLmN1cnJlbnQpXG4gICAgYWRkU3F1YXJlKFxuICAgICAgc3F1YXJlcyxcbiAgICAgIHMucHJlZHJvcHBhYmxlLmN1cnJlbnQua2V5LFxuICAgICAgYGN1cnJlbnQtcHJlJHtzLnByZWRyb3BwYWJsZS5jdXJyZW50LnByb20gPyAnIHByb20nIDogJyd9YCxcbiAgICApO1xuXG4gIGZvciAoY29uc3Qgc3FoIG9mIHMuZHJhd2FibGUuc3F1YXJlcykge1xuICAgIGFkZFNxdWFyZShzcXVhcmVzLCBzcWgua2V5LCBzcWguY2xhc3NOYW1lKTtcbiAgfVxuXG4gIHJldHVybiBzcXVhcmVzO1xufVxuXG5mdW5jdGlvbiBhZGRTcXVhcmUoc3F1YXJlczogU3F1YXJlQ2xhc3Nlcywga2V5OiBzZy5LZXksIGtsYXNzOiBzdHJpbmcpOiB2b2lkIHtcbiAgY29uc3QgY2xhc3NlcyA9IHNxdWFyZXMuZ2V0KGtleSk7XG4gIGlmIChjbGFzc2VzKSBzcXVhcmVzLnNldChrZXksIGAke2NsYXNzZXN9ICR7a2xhc3N9YCk7XG4gIGVsc2Ugc3F1YXJlcy5zZXQoa2V5LCBrbGFzcyk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclByb21vdGlvbihzOiBTdGF0ZSwgcHJvbW90aW9uRWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHMucHJvbW90aW9uLmN1cnJlbnQ7XG4gIGNvbnN0IGtleSA9IGN1cj8ua2V5O1xuICBjb25zdCBwaWVjZXMgPSBjdXIgPyBbY3VyLnByb21vdGVkUGllY2UsIGN1ci5waWVjZV0gOiBbXTtcbiAgY29uc3QgaGFzaCA9IHByb21vdGlvbkhhc2goISFjdXIsIGtleSwgcGllY2VzKTtcbiAgaWYgKHMucHJvbW90aW9uLnByZXZQcm9tb3Rpb25IYXNoID09PSBoYXNoKSByZXR1cm47XG4gIHMucHJvbW90aW9uLnByZXZQcm9tb3Rpb25IYXNoID0gaGFzaDtcblxuICBpZiAoa2V5KSB7XG4gICAgY29uc3QgYXNTZW50ZSA9IHNlbnRlUG92KHMub3JpZW50YXRpb24pO1xuICAgIGNvbnN0IGluaXRQb3MgPSBrZXkycG9zKGtleSk7XG4gICAgY29uc3QgY29sb3IgPSBjdXIucGllY2UuY29sb3I7XG4gICAgY29uc3QgcHJvbW90aW9uU3F1YXJlID0gY3JlYXRlRWwoJ3NnLXByb21vdGlvbi1zcXVhcmUnKTtcbiAgICBjb25zdCBwcm9tb3Rpb25DaG9pY2VzID0gY3JlYXRlRWwoJ3NnLXByb21vdGlvbi1jaG9pY2VzJyk7XG4gICAgaWYgKHMub3JpZW50YXRpb24gIT09IGNvbG9yKSBwcm9tb3Rpb25DaG9pY2VzLmNsYXNzTGlzdC5hZGQoJ3JldmVyc2VkJyk7XG4gICAgdHJhbnNsYXRlUmVsKHByb21vdGlvblNxdWFyZSwgcG9zVG9UcmFuc2xhdGVSZWwocy5kaW1lbnNpb25zKShpbml0UG9zLCBhc1NlbnRlKSwgMSk7XG5cbiAgICBmb3IgKGNvbnN0IHAgb2YgcGllY2VzKSB7XG4gICAgICBjb25zdCBwaWVjZU5vZGUgPSBjcmVhdGVFbCgncGllY2UnLCBwaWVjZU5hbWVPZihwKSkgYXMgc2cuUGllY2VOb2RlO1xuICAgICAgcGllY2VOb2RlLnNnQ29sb3IgPSBwLmNvbG9yO1xuICAgICAgcGllY2VOb2RlLnNnUm9sZSA9IHAucm9sZTtcbiAgICAgIHByb21vdGlvbkNob2ljZXMuYXBwZW5kQ2hpbGQocGllY2VOb2RlKTtcbiAgICB9XG5cbiAgICBwcm9tb3Rpb25FbC5pbm5lckhUTUwgPSAnJztcbiAgICBwcm9tb3Rpb25TcXVhcmUuYXBwZW5kQ2hpbGQocHJvbW90aW9uQ2hvaWNlcyk7XG4gICAgcHJvbW90aW9uRWwuYXBwZW5kQ2hpbGQocHJvbW90aW9uU3F1YXJlKTtcbiAgICBzZXREaXNwbGF5KHByb21vdGlvbkVsLCB0cnVlKTtcbiAgfSBlbHNlIHtcbiAgICBzZXREaXNwbGF5KHByb21vdGlvbkVsLCBmYWxzZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcHJvbW90aW9uSGFzaChhY3RpdmU6IGJvb2xlYW4sIGtleTogc2cuS2V5IHwgdW5kZWZpbmVkLCBwaWVjZXM6IHNnLlBpZWNlW10pOiBzdHJpbmcge1xuICByZXR1cm4gW2FjdGl2ZSwga2V5LCBwaWVjZXMubWFwKChwKSA9PiBwaWVjZU5hbWVPZihwKSkuam9pbignICcpXS5qb2luKCcgJyk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBOb3RhdGlvbiB9IGZyb20gJy4vdHlwZXMuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gY29vcmRzKG5vdGF0aW9uOiBOb3RhdGlvbik6IHN0cmluZ1tdIHtcbiAgc3dpdGNoIChub3RhdGlvbikge1xuICAgIGNhc2UgJ2RpemhpJzpcbiAgICAgIHJldHVybiBbXG4gICAgICAgICcnLFxuICAgICAgICAnJyxcbiAgICAgICAgJycsXG4gICAgICAgICcnLFxuICAgICAgICAn5LqlJyxcbiAgICAgICAgJ+aIjCcsXG4gICAgICAgICfphYknLFxuICAgICAgICAn55SzJyxcbiAgICAgICAgJ+acqicsXG4gICAgICAgICfljYgnLFxuICAgICAgICAn5bezJyxcbiAgICAgICAgJ+i+sCcsXG4gICAgICAgICflja8nLFxuICAgICAgICAn5a+FJyxcbiAgICAgICAgJ+S4kScsXG4gICAgICAgICflrZAnLFxuICAgICAgXTtcbiAgICBjYXNlICdqYXBhbmVzZSc6XG4gICAgICByZXR1cm4gW1xuICAgICAgICAn5Y2B5YWtJyxcbiAgICAgICAgJ+WNgeS6lCcsXG4gICAgICAgICfljYHlm5snLFxuICAgICAgICAn5Y2B5LiJJyxcbiAgICAgICAgJ+WNgeS6jCcsXG4gICAgICAgICfljYHkuIAnLFxuICAgICAgICAn5Y2BJyxcbiAgICAgICAgJ+S5nScsXG4gICAgICAgICflhasnLFxuICAgICAgICAn5LiDJyxcbiAgICAgICAgJ+WFrScsXG4gICAgICAgICfkupQnLFxuICAgICAgICAn5ZubJyxcbiAgICAgICAgJ+S4iScsXG4gICAgICAgICfkuownLFxuICAgICAgICAn5LiAJyxcbiAgICAgIF07XG4gICAgY2FzZSAnZW5naW5lJzpcbiAgICAgIHJldHVybiBbJ3AnLCAnbycsICduJywgJ20nLCAnbCcsICdrJywgJ2onLCAnaScsICdoJywgJ2cnLCAnZicsICdlJywgJ2QnLCAnYycsICdiJywgJ2EnXTtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0dXJuIFsnMTAnLCAnZicsICdlJywgJ2QnLCAnYycsICdiJywgJ2EnLCAnOScsICc4JywgJzcnLCAnNicsICc1JywgJzQnLCAnMycsICcyJywgJzEnXTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIFtcbiAgICAgICAgJzE2JyxcbiAgICAgICAgJzE1JyxcbiAgICAgICAgJzE0JyxcbiAgICAgICAgJzEzJyxcbiAgICAgICAgJzEyJyxcbiAgICAgICAgJzExJyxcbiAgICAgICAgJzEwJyxcbiAgICAgICAgJzknLFxuICAgICAgICAnOCcsXG4gICAgICAgICc3JyxcbiAgICAgICAgJzYnLFxuICAgICAgICAnNScsXG4gICAgICAgICc0JyxcbiAgICAgICAgJzMnLFxuICAgICAgICAnMicsXG4gICAgICAgICcxJyxcbiAgICAgIF07XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBjb2xvcnMgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgeyBjb29yZHMgfSBmcm9tICcuL2Nvb3Jkcy5qcyc7XG5pbXBvcnQgeyBjcmVhdGVTVkdFbGVtZW50LCBzZXRBdHRyaWJ1dGVzIH0gZnJvbSAnLi9zaGFwZXMuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUge1xuICBCb2FyZEVsZW1lbnRzLFxuICBDb2xvcixcbiAgRGltZW5zaW9ucyxcbiAgSGFuZEVsZW1lbnRzLFxuICBQaWVjZU5vZGUsXG4gIFJvbGVTdHJpbmcsXG4gIFNoYXBlc0VsZW1lbnRzLFxuICBTcXVhcmVOb2RlLFxufSBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IGNyZWF0ZUVsLCBvcHBvc2l0ZSwgcGllY2VOYW1lT2YsIHBvczJrZXksIHNldERpc3BsYXkgfSBmcm9tICcuL3V0aWwuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gd3JhcEJvYXJkKGJvYXJkV3JhcDogSFRNTEVsZW1lbnQsIHM6IFN0YXRlKTogQm9hcmRFbGVtZW50cyB7XG4gIC8vIC5zZy13cmFwIChlbGVtZW50IHBhc3NlZCB0byBTaG9naWdyb3VuZClcbiAgLy8gICAgIHNnLWhhbmQtd3JhcFxuICAvLyAgICAgc2ctYm9hcmRcbiAgLy8gICAgICAgc2ctc3F1YXJlc1xuICAvLyAgICAgICBzZy1waWVjZXNcbiAgLy8gICAgICAgcGllY2UgZHJhZ2dpbmdcbiAgLy8gICAgICAgc2ctcHJvbW90aW9uXG4gIC8vICAgICAgIHNnLXNxdWFyZS1vdmVyXG4gIC8vICAgICAgIHN2Zy5zZy1zaGFwZXNcbiAgLy8gICAgICAgICBkZWZzXG4gIC8vICAgICAgICAgZ1xuICAvLyAgICAgICBzdmcuc2ctY3VzdG9tLXN2Z3NcbiAgLy8gICAgICAgICBnXG4gIC8vICAgICBzZy1oYW5kLXdyYXBcbiAgLy8gICAgIHNnLWZyZWUtcGllY2VzXG4gIC8vICAgICAgIGNvb3Jkcy5yYW5rc1xuICAvLyAgICAgICBjb29yZHMuZmlsZXNcblxuICBjb25zdCBib2FyZCA9IGNyZWF0ZUVsKCdzZy1ib2FyZCcpO1xuXG4gIGNvbnN0IHNxdWFyZXMgPSByZW5kZXJTcXVhcmVzKHMuZGltZW5zaW9ucywgcy5vcmllbnRhdGlvbik7XG4gIGJvYXJkLmFwcGVuZENoaWxkKHNxdWFyZXMpO1xuXG4gIGNvbnN0IHBpZWNlcyA9IGNyZWF0ZUVsKCdzZy1waWVjZXMnKTtcbiAgYm9hcmQuYXBwZW5kQ2hpbGQocGllY2VzKTtcblxuICBsZXQgZHJhZ2dlZDogUGllY2VOb2RlIHwgdW5kZWZpbmVkO1xuICBsZXQgcHJvbW90aW9uOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgbGV0IHNxdWFyZU92ZXI6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICBpZiAoIXMudmlld09ubHkpIHtcbiAgICBkcmFnZ2VkID0gY3JlYXRlRWwoJ3BpZWNlJykgYXMgUGllY2VOb2RlO1xuICAgIHNldERpc3BsYXkoZHJhZ2dlZCwgZmFsc2UpO1xuICAgIGJvYXJkLmFwcGVuZENoaWxkKGRyYWdnZWQpO1xuXG4gICAgcHJvbW90aW9uID0gY3JlYXRlRWwoJ3NnLXByb21vdGlvbicpO1xuICAgIHNldERpc3BsYXkocHJvbW90aW9uLCBmYWxzZSk7XG4gICAgYm9hcmQuYXBwZW5kQ2hpbGQocHJvbW90aW9uKTtcblxuICAgIHNxdWFyZU92ZXIgPSBjcmVhdGVFbCgnc2ctc3F1YXJlLW92ZXInKTtcbiAgICBzZXREaXNwbGF5KHNxdWFyZU92ZXIsIGZhbHNlKTtcbiAgICBib2FyZC5hcHBlbmRDaGlsZChzcXVhcmVPdmVyKTtcbiAgfVxuXG4gIGxldCBzaGFwZXM6IFNoYXBlc0VsZW1lbnRzIHwgdW5kZWZpbmVkO1xuICBpZiAocy5kcmF3YWJsZS52aXNpYmxlKSB7XG4gICAgY29uc3Qgc3ZnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdzdmcnKSwge1xuICAgICAgY2xhc3M6ICdzZy1zaGFwZXMnLFxuICAgICAgdmlld0JveDogYC0ke3Muc3F1YXJlUmF0aW9bMF0gLyAyfSAtJHtzLnNxdWFyZVJhdGlvWzFdIC8gMn0gJHtzLmRpbWVuc2lvbnMuZmlsZXMgKiBzLnNxdWFyZVJhdGlvWzBdfSAke1xuICAgICAgICBzLmRpbWVuc2lvbnMucmFua3MgKiBzLnNxdWFyZVJhdGlvWzFdXG4gICAgICB9YCxcbiAgICB9KTtcbiAgICBzdmcuYXBwZW5kQ2hpbGQoY3JlYXRlU1ZHRWxlbWVudCgnZGVmcycpKTtcbiAgICBzdmcuYXBwZW5kQ2hpbGQoY3JlYXRlU1ZHRWxlbWVudCgnZycpKTtcblxuICAgIGNvbnN0IGN1c3RvbVN2ZyA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnc3ZnJyksIHtcbiAgICAgIGNsYXNzOiAnc2ctY3VzdG9tLXN2Z3MnLFxuICAgICAgdmlld0JveDogYDAgMCAke3MuZGltZW5zaW9ucy5maWxlcyAqIHMuc3F1YXJlUmF0aW9bMF19ICR7cy5kaW1lbnNpb25zLnJhbmtzICogcy5zcXVhcmVSYXRpb1sxXX1gLFxuICAgIH0pO1xuICAgIGN1c3RvbVN2Zy5hcHBlbmRDaGlsZChjcmVhdGVTVkdFbGVtZW50KCdnJykpO1xuXG4gICAgY29uc3QgZnJlZVBpZWNlcyA9IGNyZWF0ZUVsKCdzZy1mcmVlLXBpZWNlcycpO1xuXG4gICAgYm9hcmQuYXBwZW5kQ2hpbGQoc3ZnKTtcbiAgICBib2FyZC5hcHBlbmRDaGlsZChjdXN0b21TdmcpO1xuICAgIGJvYXJkLmFwcGVuZENoaWxkKGZyZWVQaWVjZXMpO1xuXG4gICAgc2hhcGVzID0ge1xuICAgICAgc3ZnLFxuICAgICAgZnJlZVBpZWNlcyxcbiAgICAgIGN1c3RvbVN2ZyxcbiAgICB9O1xuICB9XG5cbiAgaWYgKHMuY29vcmRpbmF0ZXMuZW5hYmxlZCkge1xuICAgIGNvbnN0IG9yaWVudENsYXNzID0gcy5vcmllbnRhdGlvbiA9PT0gJ2dvdGUnID8gJyBnb3RlJyA6ICcnO1xuICAgIGNvbnN0IHJhbmtzID0gY29vcmRzKHMuY29vcmRpbmF0ZXMucmFua3MpO1xuICAgIGNvbnN0IGZpbGVzID0gY29vcmRzKHMuY29vcmRpbmF0ZXMuZmlsZXMpO1xuICAgIGJvYXJkLmFwcGVuZENoaWxkKHJlbmRlckNvb3JkcyhyYW5rcywgYHJhbmtzJHtvcmllbnRDbGFzc31gLCBzLmRpbWVuc2lvbnMucmFua3MpKTtcbiAgICBib2FyZC5hcHBlbmRDaGlsZChyZW5kZXJDb29yZHMoZmlsZXMsIGBmaWxlcyR7b3JpZW50Q2xhc3N9YCwgcy5kaW1lbnNpb25zLmZpbGVzKSk7XG4gIH1cblxuICBib2FyZFdyYXAuaW5uZXJIVE1MID0gJyc7XG5cbiAgY29uc3QgZGltQ2xzID0gYGQtJHtzLmRpbWVuc2lvbnMuZmlsZXN9eCR7cy5kaW1lbnNpb25zLnJhbmtzfWA7XG5cbiAgLy8gcmVtb3ZlIGFsbCBvdGhlciBkaW1lbnNpb24gY2xhc3Nlc1xuICBib2FyZFdyYXAuY2xhc3NMaXN0LmZvckVhY2goKGMpID0+IHtcbiAgICBpZiAoYy5zdWJzdHJpbmcoMCwgMikgPT09ICdkLScgJiYgYyAhPT0gZGltQ2xzKSBib2FyZFdyYXAuY2xhc3NMaXN0LnJlbW92ZShjKTtcbiAgfSk7XG5cbiAgLy8gZW5zdXJlIHRoZSBzZy13cmFwIGNsYXNzIGFuZCBkaW1lbnNpb25zIGNsYXNzIGlzIHNldCBiZWZvcmVoYW5kIHRvIGF2b2lkIHJlY29tcHV0aW5nIHN0eWxlc1xuICBib2FyZFdyYXAuY2xhc3NMaXN0LmFkZCgnc2ctd3JhcCcsIGRpbUNscyk7XG5cbiAgZm9yIChjb25zdCBjIG9mIGNvbG9ycykgYm9hcmRXcmFwLmNsYXNzTGlzdC50b2dnbGUoYG9yaWVudGF0aW9uLSR7Y31gLCBzLm9yaWVudGF0aW9uID09PSBjKTtcbiAgYm9hcmRXcmFwLmNsYXNzTGlzdC50b2dnbGUoJ21hbmlwdWxhYmxlJywgIXMudmlld09ubHkpO1xuXG4gIGJvYXJkV3JhcC5hcHBlbmRDaGlsZChib2FyZCk7XG5cbiAgbGV0IGhhbmRzOiBIYW5kRWxlbWVudHMgfCB1bmRlZmluZWQ7XG4gIGlmIChzLmhhbmRzLmlubGluZWQpIHtcbiAgICBjb25zdCBoYW5kV3JhcFRvcCA9IGNyZWF0ZUVsKCdzZy1oYW5kLXdyYXAnLCAnaW5saW5lZCcpO1xuICAgIGNvbnN0IGhhbmRXcmFwQm90dG9tID0gY3JlYXRlRWwoJ3NnLWhhbmQtd3JhcCcsICdpbmxpbmVkJyk7XG4gICAgYm9hcmRXcmFwLmluc2VydEJlZm9yZShoYW5kV3JhcEJvdHRvbSwgYm9hcmQubmV4dEVsZW1lbnRTaWJsaW5nKTtcbiAgICBib2FyZFdyYXAuaW5zZXJ0QmVmb3JlKGhhbmRXcmFwVG9wLCBib2FyZCk7XG4gICAgaGFuZHMgPSB7XG4gICAgICB0b3A6IGhhbmRXcmFwVG9wLFxuICAgICAgYm90dG9tOiBoYW5kV3JhcEJvdHRvbSxcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBib2FyZCxcbiAgICBzcXVhcmVzLFxuICAgIHBpZWNlcyxcbiAgICBwcm9tb3Rpb24sXG4gICAgc3F1YXJlT3ZlcixcbiAgICBkcmFnZ2VkLFxuICAgIHNoYXBlcyxcbiAgICBoYW5kcyxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyYXBIYW5kKGhhbmRXcmFwOiBIVE1MRWxlbWVudCwgcG9zOiAndG9wJyB8ICdib3R0b20nLCBzOiBTdGF0ZSk6IEhUTUxFbGVtZW50IHtcbiAgY29uc3QgaGFuZCA9IHJlbmRlckhhbmQocG9zID09PSAndG9wJyA/IG9wcG9zaXRlKHMub3JpZW50YXRpb24pIDogcy5vcmllbnRhdGlvbiwgcy5oYW5kcy5yb2xlcyk7XG4gIGhhbmRXcmFwLmlubmVySFRNTCA9ICcnO1xuXG4gIGNvbnN0IHJvbGVDbnRDbHMgPSBgci0ke3MuaGFuZHMucm9sZXMubGVuZ3RofWA7XG5cbiAgLy8gcmVtb3ZlIGFsbCBvdGhlciByb2xlIGNvdW50IGNsYXNzZXNcbiAgaGFuZFdyYXAuY2xhc3NMaXN0LmZvckVhY2goKGMpID0+IHtcbiAgICBpZiAoYy5zdWJzdHJpbmcoMCwgMikgPT09ICdyLScgJiYgYyAhPT0gcm9sZUNudENscykgaGFuZFdyYXAuY2xhc3NMaXN0LnJlbW92ZShjKTtcbiAgfSk7XG5cbiAgLy8gZW5zdXJlIHRoZSBzZy1oYW5kLXdyYXAgY2xhc3MsIGhhbmQgcG9zIGNsYXNzIGFuZCByb2xlIG51bWJlciBjbGFzcyBpcyBzZXQgYmVmb3JlaGFuZCB0byBhdm9pZCByZWNvbXB1dGluZyBzdHlsZXNcbiAgaGFuZFdyYXAuY2xhc3NMaXN0LmFkZCgnc2ctaGFuZC13cmFwJywgYGhhbmQtJHtwb3N9YCwgcm9sZUNudENscyk7XG4gIGhhbmRXcmFwLmFwcGVuZENoaWxkKGhhbmQpO1xuXG4gIGZvciAoY29uc3QgYyBvZiBjb2xvcnMpIGhhbmRXcmFwLmNsYXNzTGlzdC50b2dnbGUoYG9yaWVudGF0aW9uLSR7Y31gLCBzLm9yaWVudGF0aW9uID09PSBjKTtcbiAgaGFuZFdyYXAuY2xhc3NMaXN0LnRvZ2dsZSgnbWFuaXB1bGFibGUnLCAhcy52aWV3T25seSk7XG5cbiAgcmV0dXJuIGhhbmQ7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckNvb3JkcyhlbGVtczogcmVhZG9ubHkgc3RyaW5nW10sIGNsYXNzTmFtZTogc3RyaW5nLCB0cmltOiBudW1iZXIpOiBIVE1MRWxlbWVudCB7XG4gIGNvbnN0IGVsID0gY3JlYXRlRWwoJ2Nvb3JkcycsIGNsYXNzTmFtZSk7XG4gIGxldCBmOiBIVE1MRWxlbWVudDtcbiAgZm9yIChjb25zdCBlbGVtIG9mIGVsZW1zLnNsaWNlKC10cmltKSkge1xuICAgIGYgPSBjcmVhdGVFbCgnY29vcmQnKTtcbiAgICBmLnRleHRDb250ZW50ID0gZWxlbTtcbiAgICBlbC5hcHBlbmRDaGlsZChmKTtcbiAgfVxuICByZXR1cm4gZWw7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclNxdWFyZXMoZGltczogRGltZW5zaW9ucywgb3JpZW50YXRpb246IENvbG9yKTogSFRNTEVsZW1lbnQge1xuICBjb25zdCBzcXVhcmVzID0gY3JlYXRlRWwoJ3NnLXNxdWFyZXMnKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGRpbXMucmFua3MgKiBkaW1zLmZpbGVzOyBpKyspIHtcbiAgICBjb25zdCBzcSA9IGNyZWF0ZUVsKCdzcScpIGFzIFNxdWFyZU5vZGU7XG4gICAgc3Euc2dLZXkgPVxuICAgICAgb3JpZW50YXRpb24gPT09ICdzZW50ZSdcbiAgICAgICAgPyBwb3Mya2V5KFtkaW1zLmZpbGVzIC0gMSAtIChpICUgZGltcy5maWxlcyksIE1hdGguZmxvb3IoaSAvIGRpbXMuZmlsZXMpXSlcbiAgICAgICAgOiBwb3Mya2V5KFtpICUgZGltcy5maWxlcywgZGltcy5yYW5rcyAtIDEgLSBNYXRoLmZsb29yKGkgLyBkaW1zLmZpbGVzKV0pO1xuICAgIHNxdWFyZXMuYXBwZW5kQ2hpbGQoc3EpO1xuICB9XG5cbiAgcmV0dXJuIHNxdWFyZXM7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckhhbmQoY29sb3I6IENvbG9yLCByb2xlczogUm9sZVN0cmluZ1tdKTogSFRNTEVsZW1lbnQge1xuICBjb25zdCBoYW5kID0gY3JlYXRlRWwoJ3NnLWhhbmQnKTtcbiAgZm9yIChjb25zdCByb2xlIG9mIHJvbGVzKSB7XG4gICAgY29uc3QgcGllY2UgPSB7IHJvbGU6IHJvbGUsIGNvbG9yOiBjb2xvciB9O1xuICAgIGNvbnN0IHdyYXBFbCA9IGNyZWF0ZUVsKCdzZy1ocC13cmFwJyk7XG4gICAgY29uc3QgcGllY2VFbCA9IGNyZWF0ZUVsKCdwaWVjZScsIHBpZWNlTmFtZU9mKHBpZWNlKSkgYXMgUGllY2VOb2RlO1xuICAgIHBpZWNlRWwuc2dDb2xvciA9IGNvbG9yO1xuICAgIHBpZWNlRWwuc2dSb2xlID0gcm9sZTtcbiAgICB3cmFwRWwuYXBwZW5kQ2hpbGQocGllY2VFbCk7XG4gICAgaGFuZC5hcHBlbmRDaGlsZCh3cmFwRWwpO1xuICB9XG4gIHJldHVybiBoYW5kO1xufVxuIiwgImltcG9ydCAqIGFzIGV2ZW50cyBmcm9tICcuL2V2ZW50cy5qcyc7XG5pbXBvcnQgeyByZW5kZXJIYW5kIH0gZnJvbSAnLi9oYW5kcy5qcyc7XG5pbXBvcnQgeyByZW5kZXIgfSBmcm9tICcuL3JlbmRlci5qcyc7XG5pbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSB7IFdyYXBFbGVtZW50cywgV3JhcEVsZW1lbnRzQm9vbGVhbiB9IGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgd3JhcEJvYXJkLCB3cmFwSGFuZCB9IGZyb20gJy4vd3JhcC5qcyc7XG5cbmZ1bmN0aW9uIGF0dGFjaEJvYXJkKHN0YXRlOiBTdGF0ZSwgYm9hcmRXcmFwOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICBkZXRhY2hFbGVtZW50cyh7IGJvYXJkOiB0cnVlIH0sIHN0YXRlLCB0cnVlKTtcbiAgY29uc3QgZWxlbWVudHMgPSB3cmFwQm9hcmQoYm9hcmRXcmFwLCBzdGF0ZSk7XG5cbiAgLy8gaW4gY2FzZSBvZiBpbmxpbmVkIGhhbmRzXG4gIGlmIChlbGVtZW50cy5oYW5kcykgYXR0YWNoSGFuZHMoc3RhdGUsIGVsZW1lbnRzLmhhbmRzLnRvcCwgZWxlbWVudHMuaGFuZHMuYm90dG9tKTtcblxuICBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmJvYXJkID0gYm9hcmRXcmFwO1xuICBzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQgPSBlbGVtZW50cztcbiAgc3RhdGUuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMuY2xlYXIoKTtcblxuICBzdGF0ZS5kb20uZWxlbWVudFVuYmluZHMuc2V0KGVsZW1lbnRzLmJvYXJkLCBldmVudHMuYmluZEJvYXJkKHN0YXRlLCBlbGVtZW50cykpO1xuXG4gIHN0YXRlLmRyYXdhYmxlLnByZXZTdmdIYXNoID0gJyc7XG4gIHN0YXRlLnByb21vdGlvbi5wcmV2UHJvbW90aW9uSGFzaCA9ICcnO1xuXG4gIHJlbmRlcihzdGF0ZSwgZWxlbWVudHMpO1xufVxuXG5mdW5jdGlvbiBhdHRhY2hIYW5kcyhzdGF0ZTogU3RhdGUsIGhhbmRUb3BXcmFwPzogSFRNTEVsZW1lbnQsIGhhbmRCb3R0b21XcmFwPzogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgaWYgKGhhbmRUb3BXcmFwKSBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHM/LnRvcD8ucmVtb3ZlKCk7XG4gIGlmIChoYW5kQm90dG9tV3JhcCkgc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzPy5ib3R0b20/LnJlbW92ZSgpO1xuICBkZXRhY2hFbGVtZW50cyh7IGhhbmRzOiB7IHRvcDogISFoYW5kVG9wV3JhcCwgYm90dG9tOiAhIWhhbmRCb3R0b21XcmFwIH0gfSwgc3RhdGUsIHRydWUpO1xuICBpZiAoIXN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcykgc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzID0ge307XG5cbiAgaWYgKGhhbmRUb3BXcmFwKSB7XG4gICAgY29uc3QgaGFuZFRvcCA9IHdyYXBIYW5kKGhhbmRUb3BXcmFwLCAndG9wJywgc3RhdGUpO1xuICAgIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcy50b3AgPSBoYW5kVG9wO1xuICAgIHN0YXRlLmRvbS5lbGVtZW50VW5iaW5kcy5zZXQoaGFuZFRvcCwgZXZlbnRzLmJpbmRIYW5kKHN0YXRlLCBoYW5kVG9wKSk7XG4gICAgcmVuZGVySGFuZChzdGF0ZSwgaGFuZFRvcCk7XG4gIH1cbiAgaWYgKGhhbmRCb3R0b21XcmFwKSB7XG4gICAgY29uc3QgaGFuZEJvdHRvbSA9IHdyYXBIYW5kKGhhbmRCb3R0b21XcmFwLCAnYm90dG9tJywgc3RhdGUpO1xuICAgIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcy5ib3R0b20gPSBoYW5kQm90dG9tO1xuICAgIHN0YXRlLmRvbS5lbGVtZW50VW5iaW5kcy5zZXQoaGFuZEJvdHRvbSwgZXZlbnRzLmJpbmRIYW5kKHN0YXRlLCBoYW5kQm90dG9tKSk7XG4gICAgcmVuZGVySGFuZChzdGF0ZSwgaGFuZEJvdHRvbSk7XG4gIH1cblxuICBpZiAoaGFuZFRvcFdyYXAgfHwgaGFuZEJvdHRvbVdyYXApIHtcbiAgICBzdGF0ZS5kb20uYm91bmRzLmhhbmRzLmJvdW5kcy5jbGVhcigpO1xuICAgIHN0YXRlLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMuY2xlYXIoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVkcmF3QWxsKHdyYXBFbGVtZW50czogV3JhcEVsZW1lbnRzLCBzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLmRvbS5kZXN0cm95ZWQpIHJldHVybjtcbiAgaWYgKHdyYXBFbGVtZW50cy5oYW5kcykge1xuICAgIGlmICghc3RhdGUuZG9tLndyYXBFbGVtZW50cy5oYW5kcykgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5oYW5kcyA9IHt9O1xuICAgIGlmICh3cmFwRWxlbWVudHMuaGFuZHMudG9wKSBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmhhbmRzLnRvcCA9IHdyYXBFbGVtZW50cy5oYW5kcy50b3A7XG4gICAgaWYgKHdyYXBFbGVtZW50cy5oYW5kcy5ib3R0b20pIHN0YXRlLmRvbS53cmFwRWxlbWVudHMuaGFuZHMuYm90dG9tID0gd3JhcEVsZW1lbnRzLmhhbmRzLmJvdHRvbTtcbiAgfVxuICBpZiAod3JhcEVsZW1lbnRzLmJvYXJkKSBhdHRhY2hCb2FyZChzdGF0ZSwgd3JhcEVsZW1lbnRzLmJvYXJkKTtcbiAgaWYgKHdyYXBFbGVtZW50cy5oYW5kcyAmJiAhc3RhdGUuaGFuZHMuaW5saW5lZClcbiAgICBhdHRhY2hIYW5kcyhzdGF0ZSwgd3JhcEVsZW1lbnRzLmhhbmRzLnRvcCwgd3JhcEVsZW1lbnRzLmhhbmRzLmJvdHRvbSk7XG4gIGVsc2UgaWYgKHN0YXRlLmhhbmRzLmlubGluZWQgJiYgIXN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZCkge1xuICAgIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcz8udG9wPy5yZW1vdmUoKTtcbiAgICBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHM/LmJvdHRvbT8ucmVtb3ZlKCk7XG4gICAgZGV0YWNoRWxlbWVudHMoeyBoYW5kczogeyB0b3A6IHRydWUsIGJvdHRvbTogdHJ1ZSB9IH0sIHN0YXRlLCB0cnVlKTtcbiAgfVxuXG4gIC8vIHNoYXBlcyBtaWdodCBkZXBlbmQgYm90aCBvbiBib2FyZCBhbmQgaGFuZHMgLSByZWRyYXcgb25seSBhZnRlciBib3RoIGFyZSBkb25lXG4gIHN0YXRlLmRvbS5yZWRyYXdTaGFwZXMoKTtcblxuICBjb25zdCBoYW5kcyA9XG4gICAgc3RhdGUuaGFuZHMuaW5saW5lZCAmJiB3cmFwRWxlbWVudHMuYm9hcmRcbiAgICAgID8gc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkPy5oYW5kc1xuICAgICAgOiB3cmFwRWxlbWVudHMuaGFuZHM7XG4gIGlmIChzdGF0ZS5ldmVudHMuaW5zZXJ0KVxuICAgIHN0YXRlLmV2ZW50cy5pbnNlcnQod3JhcEVsZW1lbnRzLmJvYXJkICYmIHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZCwge1xuICAgICAgdG9wOiBoYW5kcz8udG9wICYmIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcz8udG9wLFxuICAgICAgYm90dG9tOiBoYW5kcz8uYm90dG9tICYmIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcz8uYm90dG9tLFxuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGV0YWNoRWxlbWVudHMoXG4gIHdlYjogV3JhcEVsZW1lbnRzQm9vbGVhbixcbiAgc3RhdGU6IFN0YXRlLFxuICBrZWVwV3JhcEVsZW1lbnRzID0gZmFsc2UsXG4pOiB2b2lkIHtcbiAgY29uc3QgaW5saW5lSGFuZHMgPSB3ZWIuYm9hcmQgPyBzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQ/LmhhbmRzIDogdW5kZWZpbmVkO1xuICBjb25zdCBkZXRhY2hUb3AgPVxuICAgIHdlYi5oYW5kcz8udG9wIHx8XG4gICAgKCEhaW5saW5lSGFuZHM/LnRvcCAmJiBpbmxpbmVIYW5kcy50b3AuZmlyc3RFbGVtZW50Q2hpbGQgPT09IHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcz8udG9wKTtcbiAgY29uc3QgZGV0YWNoQm90dG9tID1cbiAgICB3ZWIuaGFuZHM/LmJvdHRvbSB8fFxuICAgICghIWlubGluZUhhbmRzPy5ib3R0b20gJiZcbiAgICAgIGlubGluZUhhbmRzLmJvdHRvbS5maXJzdEVsZW1lbnRDaGlsZCA9PT0gc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzPy5ib3R0b20pO1xuICBpZiAoIWtlZXBXcmFwRWxlbWVudHMpIHtcbiAgICBpZiAod2ViLmJvYXJkKSBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmJvYXJkID0gdW5kZWZpbmVkO1xuICAgIGlmICh3ZWIuaGFuZHM/LnRvcCAmJiBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmhhbmRzKVxuICAgICAgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5oYW5kcy50b3AgPSB1bmRlZmluZWQ7XG4gICAgaWYgKHdlYi5oYW5kcz8uYm90dG9tICYmIHN0YXRlLmRvbS53cmFwRWxlbWVudHMuaGFuZHMpXG4gICAgICBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmhhbmRzLmJvdHRvbSA9IHVuZGVmaW5lZDtcbiAgfVxuICBpZiAod2ViLmJvYXJkKSB7XG4gICAgaWYgKHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZCkgdW5iaW5kRWxlbWVudChzdGF0ZSwgc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkLmJvYXJkKTtcbiAgICBzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMuY2xlYXIoKTtcbiAgfVxuICBpZiAoc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzKSB7XG4gICAgaWYgKGRldGFjaFRvcCkge1xuICAgICAgaWYgKHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcy50b3ApIHVuYmluZEVsZW1lbnQoc3RhdGUsIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcy50b3ApO1xuICAgICAgc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzLnRvcCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKGRldGFjaEJvdHRvbSkge1xuICAgICAgaWYgKHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcy5ib3R0b20pIHVuYmluZEVsZW1lbnQoc3RhdGUsIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcy5ib3R0b20pO1xuICAgICAgc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzLmJvdHRvbSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKGRldGFjaFRvcCB8fCBkZXRhY2hCb3R0b20pIHtcbiAgICAgIHN0YXRlLmRvbS5ib3VuZHMuaGFuZHMuYm91bmRzLmNsZWFyKCk7XG4gICAgICBzdGF0ZS5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzLmNsZWFyKCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHVuYmluZEVsZW1lbnQoc3RhdGU6IFN0YXRlLCBlbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgc3RhdGUuZG9tLmVsZW1lbnRVbmJpbmRzLmdldChlbCk/LigpO1xuICBzdGF0ZS5kb20uZWxlbWVudFVuYmluZHMuZGVsZXRlKGVsKTtcbiAgc3RhdGUuZG9tLnJlc2l6ZU9ic2VydmVyPy51bm9ic2VydmUoZWwpO1xufVxuIiwgImltcG9ydCB7IGFuaW0sIHJlbmRlciB9IGZyb20gJy4vYW5pbS5qcyc7XG5pbXBvcnQgKiBhcyBib2FyZCBmcm9tICcuL2JvYXJkLmpzJztcbmltcG9ydCB0eXBlIHsgQ29uZmlnIH0gZnJvbSAnLi9jb25maWcuanMnO1xuaW1wb3J0IHsgYXBwbHlBbmltYXRpb24sIGNvbmZpZ3VyZSB9IGZyb20gJy4vY29uZmlnLmpzJztcbmltcG9ydCB7IGRldGFjaEVsZW1lbnRzLCByZWRyYXdBbGwgfSBmcm9tICcuL2RvbS5qcyc7XG5pbXBvcnQgeyBjYW5jZWwgYXMgZHJhZ0NhbmNlbCwgZHJhZ05ld1BpZWNlIH0gZnJvbSAnLi9kcmFnLmpzJztcbmltcG9ydCB0eXBlIHsgRHJhd1NoYXBlLCBTcXVhcmVIaWdobGlnaHQgfSBmcm9tICcuL2RyYXcuanMnO1xuaW1wb3J0IHsgYmluZERvY3VtZW50IH0gZnJvbSAnLi9ldmVudHMuanMnO1xuaW1wb3J0IHsgYWRkVG9IYW5kLCByZW1vdmVGcm9tSGFuZCB9IGZyb20gJy4vaGFuZHMuanMnO1xuaW1wb3J0IHsgYm9hcmRUb1NmZW4sIGhhbmRzVG9TZmVuLCBpbmZlckRpbWVuc2lvbnMgfSBmcm9tICcuL3NmZW4uanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBBcGkge1xuICAvLyBhdHRhY2ggZWxlbWVudHMgdG8gY3VycmVudCBzZyBpbnN0YW5jZVxuICBhdHRhY2god3JhcEVsZW1lbnRzOiBzZy5XcmFwRWxlbWVudHMpOiB2b2lkO1xuXG4gIC8vIGRldGFjaCBlbGVtZW50cyBmcm9tIGN1cnJlbnQgc2cgaW5zdGFuY2VcbiAgZGV0YWNoKHdyYXBFbGVtZW50c0Jvb2xlYW46IHNnLldyYXBFbGVtZW50c0Jvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIHJlY29uZmlndXJlIHRoZSBpbnN0YW5jZS4gQWNjZXB0cyBhbGwgY29uZmlnIG9wdGlvbnNcbiAgLy8gYm9hcmQgd2lsbCBiZSBhbmltYXRlZCBhY2NvcmRpbmdseSwgaWYgYW5pbWF0aW9ucyBhcmUgZW5hYmxlZFxuICBzZXQoY29uZmlnOiBDb25maWcsIHNraXBBbmltYXRpb24/OiBib29sZWFuKTogdm9pZDtcblxuICAvLyByZWFkIHNob2dpZ3JvdW5kIHN0YXRlOyB3cml0ZSBhdCB5b3VyIG93biByaXNrc1xuICBzdGF0ZTogU3RhdGU7XG5cbiAgLy8gZ2V0IHRoZSBwb3NpdGlvbiBvbiB0aGUgYm9hcmQgaW4gRm9yc3l0aCBub3RhdGlvblxuICBnZXRCb2FyZFNmZW4oKTogc2cuQm9hcmRTZmVuO1xuXG4gIC8vIGdldCB0aGUgcGllY2VzIGluIGhhbmQgaW4gRm9yc3l0aCBub3RhdGlvblxuICBnZXRIYW5kc1NmZW4oKTogc2cuSGFuZHNTZmVuO1xuXG4gIC8vIGNoYW5nZSB0aGUgdmlldyBhbmdsZVxuICB0b2dnbGVPcmllbnRhdGlvbigpOiB2b2lkO1xuXG4gIC8vIHBlcmZvcm0gYSBtb3ZlIHByb2dyYW1tYXRpY2FsbHlcbiAgbW92ZShvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSwgcHJvbT86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIHBlcmZvcm0gYSBkcm9wIHByb2dyYW1tYXRpY2FsbHksIGJ5IGRlZmF1bHQgcGllY2UgaXMgdGFrZW4gZnJvbSBoYW5kXG4gIGRyb3AocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSwgcHJvbT86IGJvb2xlYW4sIHNwYXJlPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gYWRkIGFuZC9vciByZW1vdmUgYXJiaXRyYXJ5IHBpZWNlcyBvbiB0aGUgYm9hcmRcbiAgc2V0UGllY2VzKHBpZWNlczogc2cuUGllY2VzRGlmZik6IHZvaWQ7XG5cbiAgLy8gYWRkIHBpZWNlLnJvbGUgdG8gaGFuZCBvZiBwaWVjZS5jb2xvclxuICBhZGRUb0hhbmQocGllY2U6IHNnLlBpZWNlLCBjb3VudD86IG51bWJlcik6IHZvaWQ7XG5cbiAgLy8gcmVtb3ZlIHBpZWNlLnJvbGUgZnJvbSBoYW5kIG9mIHBpZWNlLmNvbG9yXG4gIHJlbW92ZUZyb21IYW5kKHBpZWNlOiBzZy5QaWVjZSwgY291bnQ/OiBudW1iZXIpOiB2b2lkO1xuXG4gIC8vIGNsaWNrIGEgc3F1YXJlIHByb2dyYW1tYXRpY2FsbHlcbiAgc2VsZWN0U3F1YXJlKGtleTogc2cuS2V5IHwgbnVsbCwgcHJvbT86IGJvb2xlYW4sIGZvcmNlPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gc2VsZWN0IGEgcGllY2UgZnJvbSBoYW5kIHRvIGRyb3AgcHJvZ3JhbWF0aWNhbGx5LCBieSBkZWZhdWx0IHBpZWNlIGluIGhhbmQgaXMgc2VsZWN0ZWRcbiAgc2VsZWN0UGllY2UocGllY2U6IHNnLlBpZWNlIHwgbnVsbCwgc3BhcmU/OiBib29sZWFuLCBmb3JjZT86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIHBsYXkgdGhlIGN1cnJlbnQgcHJlbW92ZSwgaWYgYW55OyByZXR1cm5zIHRydWUgaWYgcHJlbW92ZSB3YXMgcGxheWVkXG4gIHBsYXlQcmVtb3ZlKCk6IGJvb2xlYW47XG5cbiAgLy8gY2FuY2VsIHRoZSBjdXJyZW50IHByZW1vdmUsIGlmIGFueVxuICBjYW5jZWxQcmVtb3ZlKCk6IHZvaWQ7XG5cbiAgLy8gcGxheSB0aGUgY3VycmVudCBwcmVkcm9wLCBpZiBhbnk7IHJldHVybnMgdHJ1ZSBpZiBwcmVtb3ZlIHdhcyBwbGF5ZWRcbiAgcGxheVByZWRyb3AoKTogYm9vbGVhbjtcblxuICAvLyBjYW5jZWwgdGhlIGN1cnJlbnQgcHJlZHJvcCwgaWYgYW55XG4gIGNhbmNlbFByZWRyb3AoKTogdm9pZDtcblxuICAvLyBjYW5jZWwgdGhlIGN1cnJlbnQgbW92ZSBvciBkcm9wIGJlaW5nIG1hZGUsIHByZW1vdmVzIGFuZCBwcmVkcm9wc1xuICBjYW5jZWxNb3ZlT3JEcm9wKCk6IHZvaWQ7XG5cbiAgLy8gY2FuY2VsIGN1cnJlbnQgbW92ZSBvciBkcm9wIGFuZCBwcmV2ZW50IGZ1cnRoZXIgb25lc1xuICBzdG9wKCk6IHZvaWQ7XG5cbiAgLy8gcHJvZ3JhbW1hdGljYWxseSBkcmF3IHVzZXIgc2hhcGVzXG4gIHNldFNoYXBlcyhzaGFwZXM6IERyYXdTaGFwZVtdKTogdm9pZDtcblxuICAvLyBwcm9ncmFtbWF0aWNhbGx5IGRyYXcgYXV0byBzaGFwZXNcbiAgc2V0QXV0b1NoYXBlcyhzaGFwZXM6IERyYXdTaGFwZVtdKTogdm9pZDtcblxuICAvLyBwcm9ncmFtbWF0aWNhbGx5IGhpZ2hsaWdodCBzcXVhcmVzXG4gIHNldFNxdWFyZUhpZ2hsaWdodHMoc3F1YXJlczogU3F1YXJlSGlnaGxpZ2h0W10pOiB2b2lkO1xuXG4gIC8vIGZvciBwaWVjZSBkcm9wcGluZyBhbmQgYm9hcmQgZWRpdG9yc1xuICBkcmFnTmV3UGllY2UocGllY2U6IHNnLlBpZWNlLCBldmVudDogc2cuTW91Y2hFdmVudCwgc3BhcmU/OiBib29sZWFuKTogdm9pZDtcblxuICAvLyB1bmJpbmRzIGFsbCBldmVudHNcbiAgLy8gKGltcG9ydGFudCBmb3IgZG9jdW1lbnQtd2lkZSBldmVudHMgbGlrZSBzY3JvbGwgYW5kIG1vdXNlbW92ZSlcbiAgZGVzdHJveTogc2cuVW5iaW5kO1xufVxuXG4vLyBzZWUgQVBJIHR5cGVzIGFuZCBkb2N1bWVudGF0aW9ucyBpbiBhcGkuZC50c1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0KHN0YXRlOiBTdGF0ZSk6IEFwaSB7XG4gIHJldHVybiB7XG4gICAgYXR0YWNoKHdyYXBFbGVtZW50czogc2cuV3JhcEVsZW1lbnRzKTogdm9pZCB7XG4gICAgICByZWRyYXdBbGwod3JhcEVsZW1lbnRzLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGRldGFjaCh3cmFwRWxlbWVudHNCb29sZWFuOiBzZy5XcmFwRWxlbWVudHNCb29sZWFuKTogdm9pZCB7XG4gICAgICBkZXRhY2hFbGVtZW50cyh3cmFwRWxlbWVudHNCb29sZWFuLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHNldCh1cGRhdGU6IENvbmZpZywgc2tpcEFuaW1hdGlvbj86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgIGlmIChzdGF0ZS5kb20uZGVzdHJveWVkKSByZXR1cm47XG4gICAgICBjb25zdCBjb25maWcgPSB7IC4uLnVwZGF0ZSwgdmlld09ubHk6IHVwZGF0ZS52aWV3T25seSA/PyBzdGF0ZS52aWV3T25seSB9O1xuICAgICAgY29uc3QgY2hhbmdlZCA9IDxUPih2YWx1ZTogVCB8IHVuZGVmaW5lZCwgY3VycmVudDogVCk6IGJvb2xlYW4gPT5cbiAgICAgICAgdmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gY3VycmVudDtcbiAgICAgIGNvbnN0IHZpZXdPbmx5Q2hhbmdlZCA9IGNoYW5nZWQoY29uZmlnLnZpZXdPbmx5LCBzdGF0ZS52aWV3T25seSk7XG4gICAgICBjb25zdCBuZXdEaW1zID0gY29uZmlnLnNmZW4/LmJvYXJkICYmIGluZmVyRGltZW5zaW9ucyhjb25maWcuc2Zlbi5ib2FyZCk7XG4gICAgICBjb25zdCB0b1JlZHJhdyA9XG4gICAgICAgIHZpZXdPbmx5Q2hhbmdlZCB8fFxuICAgICAgICBjaGFuZ2VkKGNvbmZpZy5vcmllbnRhdGlvbiwgc3RhdGUub3JpZW50YXRpb24pIHx8XG4gICAgICAgIGNoYW5nZWQoY29uZmlnLmNvb3JkaW5hdGVzPy5lbmFibGVkLCBzdGF0ZS5jb29yZGluYXRlcy5lbmFibGVkKSB8fFxuICAgICAgICBjaGFuZ2VkKGNvbmZpZy5jb29yZGluYXRlcz8uZmlsZXMsIHN0YXRlLmNvb3JkaW5hdGVzLmZpbGVzKSB8fFxuICAgICAgICBjaGFuZ2VkKGNvbmZpZy5jb29yZGluYXRlcz8ucmFua3MsIHN0YXRlLmNvb3JkaW5hdGVzLnJhbmtzKSB8fFxuICAgICAgICBjaGFuZ2VkKGNvbmZpZy5kcmF3YWJsZT8udmlzaWJsZSwgc3RhdGUuZHJhd2FibGUudmlzaWJsZSkgfHxcbiAgICAgICAgY2hhbmdlZChjb25maWcuaGFuZHM/LmlubGluZWQsIHN0YXRlLmhhbmRzLmlubGluZWQpIHx8XG4gICAgICAgICEhY29uZmlnLnNxdWFyZVJhdGlvPy5zb21lKCh2YWx1ZSwgaSkgPT4gdmFsdWUgIT09IHN0YXRlLnNxdWFyZVJhdGlvW2ldKSB8fFxuICAgICAgICAhIShcbiAgICAgICAgICBuZXdEaW1zICYmXG4gICAgICAgICAgKG5ld0RpbXMuZmlsZXMgIT09IHN0YXRlLmRpbWVuc2lvbnMuZmlsZXMgfHwgbmV3RGltcy5yYW5rcyAhPT0gc3RhdGUuZGltZW5zaW9ucy5yYW5rcylcbiAgICAgICAgKSB8fFxuICAgICAgICAhIShcbiAgICAgICAgICBjb25maWcuaGFuZHM/LnJvbGVzICYmXG4gICAgICAgICAgKGNvbmZpZy5oYW5kcy5yb2xlcy5sZW5ndGggIT09IHN0YXRlLmhhbmRzLnJvbGVzLmxlbmd0aCB8fFxuICAgICAgICAgICAgY29uZmlnLmhhbmRzLnJvbGVzLnNvbWUoKHIsIGkpID0+IHIgIT09IHN0YXRlLmhhbmRzLnJvbGVzW2ldKSlcbiAgICAgICAgKTtcblxuICAgICAgaWYgKHRvUmVkcmF3IHx8IGNvbmZpZy5kcmF3YWJsZT8uZW5hYmxlZCA9PT0gZmFsc2UpIHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgICBpZiAodG9SZWRyYXcpIHtcbiAgICAgICAgYm9hcmQucmVzZXQoc3RhdGUpO1xuICAgICAgICBjb25maWd1cmUoc3RhdGUsIGNvbmZpZyk7XG4gICAgICAgIGlmICh2aWV3T25seUNoYW5nZWQpIHtcbiAgICAgICAgICBzdGF0ZS5kb20udW5iaW5kKCk7XG4gICAgICAgICAgc3RhdGUuZG9tLnVuYmluZCA9IGJpbmREb2N1bWVudChzdGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVkcmF3QWxsKHN0YXRlLmRvbS53cmFwRWxlbWVudHMsIHN0YXRlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFwcGx5QW5pbWF0aW9uKHN0YXRlLCBjb25maWcpO1xuICAgICAgICBpZiAoc2tpcEFuaW1hdGlvbikgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgICAgIChjb25maWcuc2Zlbj8uYm9hcmQgJiYgIXNraXBBbmltYXRpb24gPyBhbmltIDogcmVuZGVyKShcbiAgICAgICAgICAoc3RhdGUpID0+IGNvbmZpZ3VyZShzdGF0ZSwgY29uZmlnKSxcbiAgICAgICAgICBzdGF0ZSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RhdGUsXG5cbiAgICBnZXRCb2FyZFNmZW46ICgpID0+IGJvYXJkVG9TZmVuKHN0YXRlLnBpZWNlcywgc3RhdGUuZGltZW5zaW9ucywgc3RhdGUuZm9yc3l0aC50b0ZvcnN5dGgpLFxuXG4gICAgZ2V0SGFuZHNTZmVuOiAoKSA9PlxuICAgICAgaGFuZHNUb1NmZW4oc3RhdGUuaGFuZHMuaGFuZE1hcCwgc3RhdGUuaGFuZHMucm9sZXMsIHN0YXRlLmZvcnN5dGgudG9Gb3JzeXRoKSxcblxuICAgIHRvZ2dsZU9yaWVudGF0aW9uKCk6IHZvaWQge1xuICAgICAgYm9hcmQudG9nZ2xlT3JpZW50YXRpb24oc3RhdGUpO1xuICAgICAgcmVkcmF3QWxsKHN0YXRlLmRvbS53cmFwRWxlbWVudHMsIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgbW92ZShvcmlnLCBkZXN0LCBwcm9tKTogdm9pZCB7XG4gICAgICBhbmltKFxuICAgICAgICAoc3RhdGUpID0+XG4gICAgICAgICAgYm9hcmQuYmFzZU1vdmUoc3RhdGUsIG9yaWcsIGRlc3QsIHByb20gfHwgc3RhdGUucHJvbW90aW9uLmZvcmNlTW92ZVByb21vdGlvbihvcmlnLCBkZXN0KSksXG4gICAgICAgIHN0YXRlLFxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgZHJvcChwaWVjZSwga2V5LCBwcm9tLCBzcGFyZSk6IHZvaWQge1xuICAgICAgYW5pbShcbiAgICAgICAgKHN0YXRlKSA9PlxuICAgICAgICAgIGJvYXJkLmJhc2VEcm9wKFxuICAgICAgICAgICAgc3RhdGUsXG4gICAgICAgICAgICBwaWVjZSxcbiAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgIHByb20gfHwgc3RhdGUucHJvbW90aW9uLmZvcmNlRHJvcFByb21vdGlvbihwaWVjZSwga2V5KSxcbiAgICAgICAgICAgICEhc3BhcmUsXG4gICAgICAgICAgKSxcbiAgICAgICAgc3RhdGUsXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBzZXRQaWVjZXMocGllY2VzKTogdm9pZCB7XG4gICAgICBhbmltKChzdGF0ZSkgPT4gYm9hcmQuc2V0UGllY2VzKHN0YXRlLCBwaWVjZXMpLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGFkZFRvSGFuZChwaWVjZTogc2cuUGllY2UsIGNvdW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgIHJlbmRlcigoc3RhdGUpID0+IGFkZFRvSGFuZChzdGF0ZSwgcGllY2UsIGNvdW50KSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICByZW1vdmVGcm9tSGFuZChwaWVjZTogc2cuUGllY2UsIGNvdW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgIHJlbmRlcigoc3RhdGUpID0+IHJlbW92ZUZyb21IYW5kKHN0YXRlLCBwaWVjZSwgY291bnQpLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHNlbGVjdFNxdWFyZShrZXksIHByb20sIGZvcmNlKTogdm9pZCB7XG4gICAgICBpZiAoa2V5KSBhbmltKChzdGF0ZSkgPT4gYm9hcmQuc2VsZWN0U3F1YXJlKHN0YXRlLCBrZXksIHByb20sIGZvcmNlKSwgc3RhdGUpO1xuICAgICAgZWxzZSBpZiAoc3RhdGUuc2VsZWN0ZWQpIHtcbiAgICAgICAgYm9hcmQudW5zZWxlY3Qoc3RhdGUpO1xuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHNlbGVjdFBpZWNlKHBpZWNlLCBzcGFyZSwgZm9yY2UpOiB2b2lkIHtcbiAgICAgIGlmIChwaWVjZSkgcmVuZGVyKChzdGF0ZSkgPT4gYm9hcmQuc2VsZWN0UGllY2Uoc3RhdGUsIHBpZWNlLCBzcGFyZSwgZm9yY2UsIHRydWUpLCBzdGF0ZSk7XG4gICAgICBlbHNlIGlmIChzdGF0ZS5zZWxlY3RlZFBpZWNlKSB7XG4gICAgICAgIGJvYXJkLnVuc2VsZWN0KHN0YXRlKTtcbiAgICAgICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBwbGF5UHJlbW92ZSgpOiBib29sZWFuIHtcbiAgICAgIGlmIChzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQpIHtcbiAgICAgICAgaWYgKGFuaW0oYm9hcmQucGxheVByZW1vdmUsIHN0YXRlKSkgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vIGlmIHRoZSBwcmVtb3ZlIGNvdWxkbid0IGJlIHBsYXllZCwgcmVkcmF3IHRvIGNsZWFyIGl0IHVwXG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgcGxheVByZWRyb3AoKTogYm9vbGVhbiB7XG4gICAgICBpZiAoc3RhdGUucHJlZHJvcHBhYmxlLmN1cnJlbnQpIHtcbiAgICAgICAgaWYgKGFuaW0oYm9hcmQucGxheVByZWRyb3AsIHN0YXRlKSkgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vIGlmIHRoZSBwcmVkcm9wIGNvdWxkbid0IGJlIHBsYXllZCwgcmVkcmF3IHRvIGNsZWFyIGl0IHVwXG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgY2FuY2VsUHJlbW92ZSgpOiB2b2lkIHtcbiAgICAgIHJlbmRlcihib2FyZC51bnNldFByZW1vdmUsIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgY2FuY2VsUHJlZHJvcCgpOiB2b2lkIHtcbiAgICAgIHJlbmRlcihib2FyZC51bnNldFByZWRyb3AsIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgY2FuY2VsTW92ZU9yRHJvcCgpOiB2b2lkIHtcbiAgICAgIHJlbmRlcigoc3RhdGUpID0+IHtcbiAgICAgICAgYm9hcmQuY2FuY2VsTW92ZU9yRHJvcChzdGF0ZSk7XG4gICAgICAgIGRyYWdDYW5jZWwoc3RhdGUpO1xuICAgICAgfSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzdG9wKCk6IHZvaWQge1xuICAgICAgcmVuZGVyKChzdGF0ZSkgPT4ge1xuICAgICAgICBib2FyZC5zdG9wKHN0YXRlKTtcbiAgICAgIH0sIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc2V0QXV0b1NoYXBlcyhzaGFwZXM6IERyYXdTaGFwZVtdKTogdm9pZCB7XG4gICAgICByZW5kZXIoKHN0YXRlKSA9PiB7XG4gICAgICAgIHN0YXRlLmRyYXdhYmxlLmF1dG9TaGFwZXMgPSBzaGFwZXM7XG4gICAgICB9LCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHNldFNoYXBlcyhzaGFwZXM6IERyYXdTaGFwZVtdKTogdm9pZCB7XG4gICAgICByZW5kZXIoKHN0YXRlKSA9PiB7XG4gICAgICAgIHN0YXRlLmRyYXdhYmxlLnNoYXBlcyA9IHNoYXBlcztcbiAgICAgIH0sIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc2V0U3F1YXJlSGlnaGxpZ2h0cyhzcXVhcmVzOiBTcXVhcmVIaWdobGlnaHRbXSk6IHZvaWQge1xuICAgICAgcmVuZGVyKChzdGF0ZSkgPT4ge1xuICAgICAgICBzdGF0ZS5kcmF3YWJsZS5zcXVhcmVzID0gc3F1YXJlcztcbiAgICAgIH0sIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgZHJhZ05ld1BpZWNlKHBpZWNlLCBldmVudCwgc3BhcmUpOiB2b2lkIHtcbiAgICAgIGRyYWdOZXdQaWVjZShzdGF0ZSwgcGllY2UsIGV2ZW50LCBzcGFyZSk7XG4gICAgfSxcblxuICAgIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgICBib2FyZC5zdG9wKHN0YXRlKTtcbiAgICAgIHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgICBzdGF0ZS5kb20uZWxlbWVudFVuYmluZHMuZm9yRWFjaCgodW5iaW5kKSA9PiB7XG4gICAgICAgIHVuYmluZCgpO1xuICAgICAgfSk7XG4gICAgICBzdGF0ZS5kb20uZWxlbWVudFVuYmluZHMuY2xlYXIoKTtcbiAgICAgIHN0YXRlLmRvbS51bmJpbmQoKTtcbiAgICAgIHN0YXRlLmRvbS5kZXN0cm95ZWQgPSB0cnVlO1xuICAgIH0sXG4gIH07XG59XG4iLCAiaW1wb3J0IHsgcmVuZGVySGFuZCB9IGZyb20gJy4vaGFuZHMuanMnO1xuaW1wb3J0IHsgcmVuZGVyIH0gZnJvbSAnLi9yZW5kZXIuanMnO1xuaW1wb3J0IHsgcmVuZGVyU2hhcGVzIH0gZnJvbSAnLi9zaGFwZXMuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVkcmF3U2hhcGVzTm93KHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBpZiAoc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkPy5zaGFwZXMpXG4gICAgcmVuZGVyU2hhcGVzKFxuICAgICAgc3RhdGUsXG4gICAgICBzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQuc2hhcGVzLnN2ZyxcbiAgICAgIHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZC5zaGFwZXMuY3VzdG9tU3ZnLFxuICAgICAgc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkLnNoYXBlcy5mcmVlUGllY2VzLFxuICAgICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWRyYXdOb3coc3RhdGU6IFN0YXRlLCBza2lwU2hhcGVzPzogYm9vbGVhbik6IHZvaWQge1xuICBjb25zdCBib2FyZEVscyA9IHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZDtcbiAgaWYgKGJvYXJkRWxzKSB7XG4gICAgcmVuZGVyKHN0YXRlLCBib2FyZEVscyk7XG4gICAgaWYgKCFza2lwU2hhcGVzKSByZWRyYXdTaGFwZXNOb3coc3RhdGUpO1xuICB9XG5cbiAgY29uc3QgaGFuZEVscyA9IHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcztcbiAgaWYgKGhhbmRFbHMpIHtcbiAgICBpZiAoaGFuZEVscy50b3ApIHJlbmRlckhhbmQoc3RhdGUsIGhhbmRFbHMudG9wKTtcbiAgICBpZiAoaGFuZEVscy5ib3R0b20pIHJlbmRlckhhbmQoc3RhdGUsIGhhbmRFbHMuYm90dG9tKTtcbiAgfVxufVxuIiwgImltcG9ydCB0eXBlIHsgQW5pbUN1cnJlbnQgfSBmcm9tICcuL2FuaW0uanMnO1xuaW1wb3J0IHR5cGUgeyBEcmFnQ3VycmVudCB9IGZyb20gJy4vZHJhZy5qcyc7XG5pbXBvcnQgdHlwZSB7IERyYXdhYmxlIH0gZnJvbSAnLi9kcmF3LmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSGVhZGxlc3NTdGF0ZSB7XG4gIHBpZWNlczogc2cuUGllY2VzO1xuICBvcmllbnRhdGlvbjogc2cuQ29sb3I7IC8vIGJvYXJkIG9yaWVudGF0aW9uLiBzZW50ZSB8IGdvdGVcbiAgZGltZW5zaW9uczogc2cuRGltZW5zaW9uczsgLy8gYm9hcmQgZGltZW5zaW9ucyAtIG1heCAxNngxNlxuICB0dXJuQ29sb3I6IHNnLkNvbG9yOyAvLyB0dXJuIHRvIHBsYXkuIHNlbnRlIHwgZ290ZVxuICBhY3RpdmVDb2xvcj86IHNnLkNvbG9yIHwgJ2JvdGgnOyAvLyBjb2xvciB0aGF0IGNhbiBtb3ZlIG9yIGRyb3AuIHNlbnRlIHwgZ290ZSB8IGJvdGggfCB1bmRlZmluZWRcbiAgY2hlY2tzPzogc2cuS2V5W107IC8vIHNxdWFyZXMgY3VycmVudGx5IGluIGNoZWNrIFtcIjVhXCJdXG4gIGxhc3REZXN0cz86IHNnLktleVtdOyAvLyBzcXVhcmVzIHBhcnQgb2YgdGhlIGxhc3QgbW92ZSBvciBkcm9wIFtcIjJiXCI7IFwiOGhcIl1cbiAgbGFzdFBpZWNlPzogc2cuUGllY2U7IC8vIHBpZWNlIHBhcnQgb2YgdGhlIGxhc3QgZHJvcFxuICBzZWxlY3RlZD86IHNnLktleTsgLy8gc3F1YXJlIGN1cnJlbnRseSBzZWxlY3RlZCBcIjFhXCJcbiAgc2VsZWN0ZWRQaWVjZT86IHNnLlBpZWNlOyAvLyBwaWVjZSBpbiBoYW5kIGN1cnJlbnRseSBzZWxlY3RlZFxuICBob3ZlcmVkPzogc2cuS2V5OyAvLyBzcXVhcmUgY3VycmVudGx5IGJlaW5nIGhvdmVyZWRcbiAgdmlld09ubHk6IGJvb2xlYW47IC8vIGRvbid0IGJpbmQgaW50ZXJhY3Rpb24gZXZlbnRzXG4gIHNxdWFyZVJhdGlvOiBzZy5OdW1iZXJQYWlyOyAvLyByYXRpbyBvZiB0aGUgYm9hcmQgW3dpZHRoLCBoZWlnaHRdXG4gIGRpc2FibGVDb250ZXh0TWVudTogYm9vbGVhbjsgLy8gYmVjYXVzZSB3aG8gbmVlZHMgYSBjb250ZXh0IG1lbnUgb24gYSBzaG9naSBib2FyZFxuICBibG9ja1RvdWNoU2Nyb2xsOiBib29sZWFuOyAvLyBibG9jayBzY3JvbGxpbmcgdmlhIHRvdWNoIGRyYWdnaW5nIG9uIHRoZSBib2FyZCwgZS5nLiBmb3IgY29vcmRpbmF0ZSB0cmFpbmluZ1xuICBzY2FsZURvd25QaWVjZXM6IGJvb2xlYW47XG4gIGNvb3JkaW5hdGVzOiB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjsgLy8gaW5jbHVkZSBjb29yZHMgYXR0cmlidXRlc1xuICAgIGZpbGVzOiBzZy5Ob3RhdGlvbjtcbiAgICByYW5rczogc2cuTm90YXRpb247XG4gIH07XG4gIGhpZ2hsaWdodDoge1xuICAgIGxhc3REZXN0czogYm9vbGVhbjsgLy8gYWRkIGxhc3QtZGVzdCBjbGFzcyB0byBzcXVhcmVzIGFuZCBwaWVjZXNcbiAgICBjaGVjazogYm9vbGVhbjsgLy8gYWRkIGNoZWNrIGNsYXNzIHRvIHNxdWFyZXNcbiAgICBjaGVja1JvbGVzOiBzZy5Sb2xlU3RyaW5nW107IC8vIHJvbGVzIHRvIGJlIGhpZ2hsaWdodGVkIHdoZW4gY2hlY2sgaXMgYm9vbGVhbiBpcyBwYXNzZWQgZnJvbSBjb25maWdcbiAgICBob3ZlcmVkOiBib29sZWFuOyAvLyBhZGQgaG92ZXIgY2xhc3MgdG8gaG92ZXJlZCBzcXVhcmVzXG4gIH07XG4gIGFuaW1hdGlvbjogeyBlbmFibGVkOiBib29sZWFuOyBoYW5kczogYm9vbGVhbjsgZHVyYXRpb246IG51bWJlcjsgY3VycmVudD86IEFuaW1DdXJyZW50IH07XG4gIGhhbmRzOiB7XG4gICAgaW5saW5lZDogYm9vbGVhbjsgLy8gYXR0YWNoZXMgc2ctaGFuZHMgZGlyZWN0bHkgdG8gc2ctd3JhcCwgaWdub3JlcyBIVE1MRWxlbWVudHMgcGFzc2VkIHRvIFNob2dpZ3JvdW5kXG4gICAgaGFuZE1hcDogc2cuSGFuZHM7XG4gICAgcm9sZXM6IHNnLlJvbGVTdHJpbmdbXTsgLy8gcm9sZXMgdG8gcmVuZGVyIGluIHNnLWhhbmRcbiAgfTtcbiAgbW92YWJsZToge1xuICAgIGZyZWU6IGJvb2xlYW47IC8vIGFsbCBtb3ZlcyBhcmUgdmFsaWQgLSBib2FyZCBlZGl0b3JcbiAgICBkZXN0cz86IHNnLk1vdmVEZXN0czsgLy8gdmFsaWQgbW92ZXMuIHtcIjdnXCIgW1wiN2ZcIl0gXCI1aVwiIFtcIjRoXCIgXCI1aFwiIFwiNmhcIl19XG4gICAgc2hvd0Rlc3RzOiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgZXZlbnRzOiB7XG4gICAgICBhZnRlcj86IChvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSwgcHJvbTogYm9vbGVhbiwgbWV0YWRhdGE6IHNnLk1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBtb3ZlIGhhcyBiZWVuIHBsYXllZFxuICAgIH07XG4gIH07XG4gIGRyb3BwYWJsZToge1xuICAgIGZyZWU6IGJvb2xlYW47IC8vIGFsbCBkcm9wcyBhcmUgdmFsaWQgLSBib2FyZCBlZGl0b3JcbiAgICBkZXN0cz86IHNnLkRyb3BEZXN0czsgLy8gdmFsaWQgZHJvcHMuIHtcInNlbnRlIHBhd25cIiBbXCIzYVwiIFwiNGFcIl0gXCJzZW50ZSBsYW5jZVwiIFtcIjNhXCIgXCIzY1wiXX1cbiAgICBzaG93RGVzdHM6IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBkZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBzcGFyZTogYm9vbGVhbjsgLy8gd2hldGhlciB0byByZW1vdmUgZHJvcHBlZCBwaWVjZSBmcm9tIGhhbmQgYWZ0ZXIgZHJvcCAtIGJvYXJkIGVkaXRvclxuICAgIGV2ZW50czoge1xuICAgICAgYWZ0ZXI/OiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSwgcHJvbTogYm9vbGVhbiwgbWV0YWRhdGE6IHNnLk1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBkcm9wIGhhcyBiZWVuIHBsYXllZFxuICAgIH07XG4gIH07XG4gIHByZW1vdmFibGU6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBhbGxvdyBwcmVtb3ZlcyBmb3IgY29sb3IgdGhhdCBjYW4gbm90IG1vdmVcbiAgICBzaG93RGVzdHM6IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBwcmUtZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgZGVzdHM/OiBzZy5LZXlbXTsgLy8gcHJlbW92ZSBkZXN0aW5hdGlvbnMgZm9yIHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgIGN1cnJlbnQ/OiB7IG9yaWc6IHNnLktleTsgZGVzdDogc2cuS2V5OyBwcm9tOiBib29sZWFuIH07XG4gICAgZ2VuZXJhdGU/OiAoa2V5OiBzZy5LZXksIHBpZWNlczogc2cuUGllY2VzKSA9PiBzZy5LZXlbXTtcbiAgICBldmVudHM6IHtcbiAgICAgIHNldD86IChvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSwgcHJvbTogYm9vbGVhbikgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVtb3ZlIGhhcyBiZWVuIHNldFxuICAgICAgdW5zZXQ/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZW1vdmUgaGFzIGJlZW4gdW5zZXRcbiAgICB9O1xuICB9O1xuICBwcmVkcm9wcGFibGU6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBhbGxvdyBwcmVkcm9wcyBmb3IgY29sb3IgdGhhdCBjYW4gbm90IG1vdmVcbiAgICBzaG93RGVzdHM6IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBwcmUtZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgZGVzdHM/OiBzZy5LZXlbXTsgLy8gcHJlbW92ZSBkZXN0aW5hdGlvbnMgZm9yIHRoZSBkcm9wIHNlbGVjdGlvblxuICAgIGN1cnJlbnQ/OiB7IHBpZWNlOiBzZy5QaWVjZTsga2V5OiBzZy5LZXk7IHByb206IGJvb2xlYW4gfTtcbiAgICBnZW5lcmF0ZT86IChwaWVjZTogc2cuUGllY2UsIHBpZWNlczogc2cuUGllY2VzKSA9PiBzZy5LZXlbXTtcbiAgICBldmVudHM6IHtcbiAgICAgIHNldD86IChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tOiBib29sZWFuKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZWRyb3AgaGFzIGJlZW4gc2V0XG4gICAgICB1bnNldD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlZHJvcCBoYXMgYmVlbiB1bnNldFxuICAgIH07XG4gIH07XG4gIGRyYWdnYWJsZToge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGFsbG93IG1vdmVzICYgcHJlbW92ZXMgdG8gdXNlIGRyYWcnbiBkcm9wXG4gICAgZGlzdGFuY2U6IG51bWJlcjsgLy8gbWluaW11bSBkaXN0YW5jZSB0byBpbml0aWF0ZSBhIGRyYWc7IGluIHBpeGVsc1xuICAgIGF1dG9EaXN0YW5jZTogYm9vbGVhbjsgLy8gbGV0cyBzaG9naWdyb3VuZCBzZXQgZGlzdGFuY2UgdG8gemVybyB3aGVuIHVzZXIgZHJhZ3MgcGllY2VzXG4gICAgc2hvd0dob3N0OiBib29sZWFuOyAvLyBzaG93IGdob3N0IG9mIHBpZWNlIGJlaW5nIGRyYWdnZWRcbiAgICBzaG93VG91Y2hTcXVhcmVPdmVybGF5OiBib29sZWFuOyAvLyBzaG93IHNxdWFyZSBvdmVybGF5IG9uIHRoZSBzcXVhcmUgdGhhdCBpcyBjdXJyZW50bHkgYmVpbmcgaG92ZXJlZCwgdG91Y2ggb25seVxuICAgIGRlbGV0ZU9uRHJvcE9mZjogYm9vbGVhbjsgLy8gZGVsZXRlIGEgcGllY2Ugd2hlbiBpdCBpcyBkcm9wcGVkIG9mZiB0aGUgYm9hcmQgLSBib2FyZCBlZGl0b3JcbiAgICBhZGRUb0hhbmRPbkRyb3BPZmY6IGJvb2xlYW47IC8vIGFkZCBhIHBpZWNlIHRvIGhhbmQgd2hlbiBpdCBpcyBkcm9wcGVkIG9uIGl0LCByZXF1aXJlcyBkZWxldGVPbkRyb3BPZmYgLSBib2FyZCBlZGl0b3JcbiAgICBjdXJyZW50PzogRHJhZ0N1cnJlbnQ7XG4gIH07XG4gIHNlbGVjdGFibGU6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBkaXNhYmxlIHRvIGVuZm9yY2UgZHJhZ2dpbmcgb3ZlciBjbGljay1jbGljayBtb3ZlXG4gICAgZm9yY2VTcGFyZXM6IGJvb2xlYW47IC8vIGFsbG93IGRyb3BwaW5nIHNwYXJlIHBpZWNlcyBldmVuIHdpdGggc2VsZWN0YWJsZSBkaXNhYmxlZFxuICAgIGRlbGV0ZU9uVG91Y2g6IGJvb2xlYW47IC8vIHNlbGVjdGluZyBhIHBpZWNlIG9uIHRoZSBib2FyZCBvciBpbiBoYW5kIHdpbGwgcmVtb3ZlIGl0IC0gYm9hcmQgZWRpdG9yXG4gICAgYWRkU3BhcmVzVG9IYW5kOiBib29sZWFuOyAvLyBhZGQgc2VsZWN0ZWQgc3BhcmUgcGllY2UgdG8gaGFuZCAtIGJvYXJkIGVkaXRvclxuICB9O1xuICBwcm9tb3Rpb246IHtcbiAgICBwcm9tb3Rlc1RvOiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICB1bnByb21vdGVzVG86IChyb2xlOiBzZy5Sb2xlU3RyaW5nKSA9PiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIG1vdmVQcm9tb3Rpb25EaWFsb2c6IChvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSkgPT4gYm9vbGVhbjtcbiAgICBmb3JjZU1vdmVQcm9tb3Rpb246IChvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSkgPT4gYm9vbGVhbjtcbiAgICBkcm9wUHJvbW90aW9uRGlhbG9nOiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSkgPT4gYm9vbGVhbjtcbiAgICBmb3JjZURyb3BQcm9tb3Rpb246IChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5KSA9PiBib29sZWFuO1xuICAgIGN1cnJlbnQ/OiB7XG4gICAgICBwaWVjZTogc2cuUGllY2U7XG4gICAgICBwcm9tb3RlZFBpZWNlOiBzZy5QaWVjZTtcbiAgICAgIGtleTogc2cuS2V5O1xuICAgICAgZHJhZ2dlZDogYm9vbGVhbjsgLy8gbm8gYW5pbWF0aW9ucyB3aXRoIGRyYWdcbiAgICB9O1xuICAgIGV2ZW50czoge1xuICAgICAgaW5pdGlhdGVkPzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gcHJvbW90aW9uIGRpYWxvZyBpcyBzdGFydGVkXG4gICAgICBhZnRlcj86IChwaWVjZTogc2cuUGllY2UpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB1c2VyIHNlbGVjdHMgYSBwaWVjZVxuICAgICAgY2FuY2VsPzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHVzZXIgY2FuY2VscyB0aGUgc2VsZWN0aW9uXG4gICAgfTtcbiAgICBwcmV2UHJvbW90aW9uSGFzaDogc3RyaW5nO1xuICB9O1xuICBmb3JzeXRoOiB7XG4gICAgdG9Gb3JzeXRoPzogKHJvbGU6IHNnLlJvbGVTdHJpbmcpID0+IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBmcm9tRm9yc3l0aD86IChzdHI6IHN0cmluZykgPT4gc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZDtcbiAgfTtcbiAgZXZlbnRzOiB7XG4gICAgY2hhbmdlPzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBzaXR1YXRpb24gY2hhbmdlcyBvbiB0aGUgYm9hcmRcbiAgICBtb3ZlPzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tOiBib29sZWFuLCBjYXB0dXJlZFBpZWNlPzogc2cuUGllY2UpID0+IHZvaWQ7XG4gICAgZHJvcD86IChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tOiBib29sZWFuKSA9PiB2b2lkO1xuICAgIHNlbGVjdD86IChrZXk6IHNnLktleSkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gYSBzcXVhcmUgaXMgc2VsZWN0ZWRcbiAgICB1bnNlbGVjdD86IChrZXk6IHNnLktleSkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gYSBzZWxlY3RlZCBzcXVhcmUgaXMgZGlyZWN0bHkgdW5zZWxlY3RlZCAtIGRyb3BwZWQgYmFjayBvciBjbGlja2VkIG9uIHRoZSBvcmlnaW5hbCBzcXVhcmVcbiAgICBwaWVjZVNlbGVjdD86IChwaWVjZTogc2cuUGllY2UpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIGEgcGllY2UgaW4gaGFuZCBpcyBzZWxlY3RlZFxuICAgIHBpZWNlVW5zZWxlY3Q/OiAocGllY2U6IHNnLlBpZWNlKSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBhIHNlbGVjdGVkIHBpZWNlIGlzIGRpcmVjdGx5IHVuc2VsZWN0ZWQgLSBkcm9wcGVkIGJhY2sgb3IgY2xpY2tlZCBvbiB0aGUgc2FtZSBwaWVjZVxuICAgIGluc2VydD86IChib2FyZEVsZW1lbnRzPzogc2cuQm9hcmRFbGVtZW50cywgaGFuZEVsZW1lbnRzPzogc2cuSGFuZEVsZW1lbnRzKSA9PiB2b2lkOyAvLyB3aGVuIHRoZSBib2FyZCBvciBoYW5kcyBET00gaGFzIGJlZW4gKHJlKWluc2VydGVkXG4gIH07XG4gIGRyYXdhYmxlOiBEcmF3YWJsZTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgU3RhdGUgZXh0ZW5kcyBIZWFkbGVzc1N0YXRlIHtcbiAgZG9tOiBzZy5Eb207XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWZhdWx0cygpOiBIZWFkbGVzc1N0YXRlIHtcbiAgcmV0dXJuIHtcbiAgICBwaWVjZXM6IG5ldyBNYXAoKSxcbiAgICBkaW1lbnNpb25zOiB7IGZpbGVzOiA5LCByYW5rczogOSB9LFxuICAgIG9yaWVudGF0aW9uOiAnc2VudGUnLFxuICAgIHR1cm5Db2xvcjogJ3NlbnRlJyxcbiAgICBhY3RpdmVDb2xvcjogJ2JvdGgnLFxuICAgIHZpZXdPbmx5OiBmYWxzZSxcbiAgICBzcXVhcmVSYXRpbzogWzExLCAxMl0sXG4gICAgZGlzYWJsZUNvbnRleHRNZW51OiB0cnVlLFxuICAgIGJsb2NrVG91Y2hTY3JvbGw6IGZhbHNlLFxuICAgIHNjYWxlRG93blBpZWNlczogdHJ1ZSxcbiAgICBjb29yZGluYXRlczogeyBlbmFibGVkOiB0cnVlLCBmaWxlczogJ251bWVyaWMnLCByYW5rczogJ251bWVyaWMnIH0sXG4gICAgaGlnaGxpZ2h0OiB7IGxhc3REZXN0czogdHJ1ZSwgY2hlY2s6IHRydWUsIGNoZWNrUm9sZXM6IFsna2luZyddLCBob3ZlcmVkOiBmYWxzZSB9LFxuICAgIGFuaW1hdGlvbjogeyBlbmFibGVkOiB0cnVlLCBoYW5kczogdHJ1ZSwgZHVyYXRpb246IDI1MCB9LFxuICAgIGhhbmRzOiB7XG4gICAgICBpbmxpbmVkOiBmYWxzZSxcbiAgICAgIGhhbmRNYXA6IG5ldyBNYXA8c2cuQ29sb3IsIHNnLkhhbmQ+KFtcbiAgICAgICAgWydzZW50ZScsIG5ldyBNYXAoKV0sXG4gICAgICAgIFsnZ290ZScsIG5ldyBNYXAoKV0sXG4gICAgICBdKSxcbiAgICAgIHJvbGVzOiBbJ3Jvb2snLCAnYmlzaG9wJywgJ2dvbGQnLCAnc2lsdmVyJywgJ2tuaWdodCcsICdsYW5jZScsICdwYXduJ10sXG4gICAgfSxcbiAgICBtb3ZhYmxlOiB7IGZyZWU6IHRydWUsIHNob3dEZXN0czogdHJ1ZSwgZXZlbnRzOiB7fSB9LFxuICAgIGRyb3BwYWJsZTogeyBmcmVlOiB0cnVlLCBzaG93RGVzdHM6IHRydWUsIHNwYXJlOiBmYWxzZSwgZXZlbnRzOiB7fSB9LFxuICAgIHByZW1vdmFibGU6IHsgZW5hYmxlZDogdHJ1ZSwgc2hvd0Rlc3RzOiB0cnVlLCBldmVudHM6IHt9IH0sXG4gICAgcHJlZHJvcHBhYmxlOiB7IGVuYWJsZWQ6IHRydWUsIHNob3dEZXN0czogdHJ1ZSwgZXZlbnRzOiB7fSB9LFxuICAgIGRyYWdnYWJsZToge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGRpc3RhbmNlOiAzLFxuICAgICAgYXV0b0Rpc3RhbmNlOiB0cnVlLFxuICAgICAgc2hvd0dob3N0OiB0cnVlLFxuICAgICAgc2hvd1RvdWNoU3F1YXJlT3ZlcmxheTogdHJ1ZSxcbiAgICAgIGRlbGV0ZU9uRHJvcE9mZjogZmFsc2UsXG4gICAgICBhZGRUb0hhbmRPbkRyb3BPZmY6IGZhbHNlLFxuICAgIH0sXG4gICAgc2VsZWN0YWJsZTogeyBlbmFibGVkOiB0cnVlLCBmb3JjZVNwYXJlczogZmFsc2UsIGRlbGV0ZU9uVG91Y2g6IGZhbHNlLCBhZGRTcGFyZXNUb0hhbmQ6IGZhbHNlIH0sXG4gICAgcHJvbW90aW9uOiB7XG4gICAgICBtb3ZlUHJvbW90aW9uRGlhbG9nOiAoKSA9PiBmYWxzZSxcbiAgICAgIGZvcmNlTW92ZVByb21vdGlvbjogKCkgPT4gZmFsc2UsXG4gICAgICBkcm9wUHJvbW90aW9uRGlhbG9nOiAoKSA9PiBmYWxzZSxcbiAgICAgIGZvcmNlRHJvcFByb21vdGlvbjogKCkgPT4gZmFsc2UsXG4gICAgICBwcm9tb3Rlc1RvOiAoKSA9PiB1bmRlZmluZWQsXG4gICAgICB1bnByb21vdGVzVG86ICgpID0+IHVuZGVmaW5lZCxcbiAgICAgIGV2ZW50czoge30sXG4gICAgICBwcmV2UHJvbW90aW9uSGFzaDogJycsXG4gICAgfSxcbiAgICBmb3JzeXRoOiB7fSxcbiAgICBldmVudHM6IHt9LFxuICAgIGRyYXdhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLCAvLyBjYW4gZHJhd1xuICAgICAgdmlzaWJsZTogdHJ1ZSwgLy8gY2FuIHZpZXdcbiAgICAgIGZvcmNlZDogZmFsc2UsIC8vIGNhbiBvbmx5IGRyYXdcbiAgICAgIGVyYXNlT25DbGljazogdHJ1ZSxcbiAgICAgIHNoYXBlczogW10sXG4gICAgICBhdXRvU2hhcGVzOiBbXSxcbiAgICAgIHNxdWFyZXM6IFtdLFxuICAgICAgcHJldlN2Z0hhc2g6ICcnLFxuICAgIH0sXG4gIH07XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBBcGkgfSBmcm9tICcuL2FwaS5qcyc7XG5pbXBvcnQgeyBzdGFydCB9IGZyb20gJy4vYXBpLmpzJztcbmltcG9ydCB0eXBlIHsgQ29uZmlnIH0gZnJvbSAnLi9jb25maWcuanMnO1xuaW1wb3J0IHsgY29uZmlndXJlIH0gZnJvbSAnLi9jb25maWcuanMnO1xuaW1wb3J0IHsgcmVkcmF3QWxsIH0gZnJvbSAnLi9kb20uanMnO1xuaW1wb3J0IHsgYmluZERvY3VtZW50IH0gZnJvbSAnLi9ldmVudHMuanMnO1xuaW1wb3J0IHsgcmVkcmF3Tm93LCByZWRyYXdTaGFwZXNOb3cgfSBmcm9tICcuL3JlZHJhdy5qcyc7XG5pbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgeyBkZWZhdWx0cyB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgeyBET01SZWN0TWFwLCBQaWVjZU5hbWUsIFBpZWNlTm9kZSwgV3JhcEVsZW1lbnRzIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbC5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBTaG9naWdyb3VuZChjb25maWc/OiBDb25maWcsIHdyYXBFbGVtZW50cz86IFdyYXBFbGVtZW50cyk6IEFwaSB7XG4gIGNvbnN0IHN0YXRlID0gZGVmYXVsdHMoKSBhcyBTdGF0ZTtcbiAgY29uZmlndXJlKHN0YXRlLCBjb25maWcgfHwge30pO1xuXG4gIGNvbnN0IHJlZHJhd1N0YXRlTm93ID0gKHNraXBTaGFwZXM/OiBib29sZWFuKSA9PiB7XG4gICAgcmVkcmF3Tm93KHN0YXRlLCBza2lwU2hhcGVzKTtcbiAgfTtcblxuICBzdGF0ZS5kb20gPSB7XG4gICAgd3JhcEVsZW1lbnRzOiB7fSxcbiAgICBlbGVtZW50czoge30sXG4gICAgYm91bmRzOiB7XG4gICAgICBib2FyZDoge1xuICAgICAgICBib3VuZHM6IHV0aWwubWVtbygoKSA9PiBzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQ/LnBpZWNlcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSksXG4gICAgICB9LFxuICAgICAgaGFuZHM6IHtcbiAgICAgICAgYm91bmRzOiB1dGlsLm1lbW8oKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGhhbmRzUmVjdHM6IERPTVJlY3RNYXA8J3RvcCcgfCAnYm90dG9tJz4gPSBuZXcgTWFwKCk7XG4gICAgICAgICAgY29uc3QgaGFuZEVscyA9IHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcztcbiAgICAgICAgICBpZiAoaGFuZEVscz8udG9wKSBoYW5kc1JlY3RzLnNldCgndG9wJywgaGFuZEVscy50b3AuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpO1xuICAgICAgICAgIGlmIChoYW5kRWxzPy5ib3R0b20pIGhhbmRzUmVjdHMuc2V0KCdib3R0b20nLCBoYW5kRWxzLmJvdHRvbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSk7XG4gICAgICAgICAgcmV0dXJuIGhhbmRzUmVjdHM7XG4gICAgICAgIH0pLFxuICAgICAgICBwaWVjZUJvdW5kczogdXRpbC5tZW1vKCgpID0+IHtcbiAgICAgICAgICBjb25zdCBoYW5kUGllY2VzUmVjdHM6IERPTVJlY3RNYXA8UGllY2VOYW1lPiA9IG5ldyBNYXAoKTtcbiAgICAgICAgICBjb25zdCBoYW5kRWxzID0gc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzO1xuXG4gICAgICAgICAgaWYgKGhhbmRFbHM/LnRvcCkge1xuICAgICAgICAgICAgbGV0IHdyYXBFbCA9IGhhbmRFbHMudG9wLmZpcnN0RWxlbWVudENoaWxkIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgd2hpbGUgKHdyYXBFbCkge1xuICAgICAgICAgICAgICBjb25zdCBwaWVjZUVsID0gd3JhcEVsLmZpcnN0RWxlbWVudENoaWxkIGFzIFBpZWNlTm9kZTtcbiAgICAgICAgICAgICAgY29uc3QgcGllY2UgPSB7IHJvbGU6IHBpZWNlRWwuc2dSb2xlLCBjb2xvcjogcGllY2VFbC5zZ0NvbG9yIH07XG4gICAgICAgICAgICAgIGhhbmRQaWVjZXNSZWN0cy5zZXQodXRpbC5waWVjZU5hbWVPZihwaWVjZSksIHBpZWNlRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpO1xuICAgICAgICAgICAgICB3cmFwRWwgPSB3cmFwRWwubmV4dEVsZW1lbnRTaWJsaW5nIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaGFuZEVscz8uYm90dG9tKSB7XG4gICAgICAgICAgICBsZXQgd3JhcEVsID0gaGFuZEVscy5ib3R0b20uZmlyc3RFbGVtZW50Q2hpbGQgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICB3aGlsZSAod3JhcEVsKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHBpZWNlRWwgPSB3cmFwRWwuZmlyc3RFbGVtZW50Q2hpbGQgYXMgUGllY2VOb2RlO1xuICAgICAgICAgICAgICBjb25zdCBwaWVjZSA9IHsgcm9sZTogcGllY2VFbC5zZ1JvbGUsIGNvbG9yOiBwaWVjZUVsLnNnQ29sb3IgfTtcbiAgICAgICAgICAgICAgaGFuZFBpZWNlc1JlY3RzLnNldCh1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKSwgcGllY2VFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSk7XG4gICAgICAgICAgICAgIHdyYXBFbCA9IHdyYXBFbC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBoYW5kUGllY2VzUmVjdHM7XG4gICAgICAgIH0pLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHJlZHJhd05vdzogcmVkcmF3U3RhdGVOb3csXG4gICAgcmVkcmF3OiBkZWJvdW5jZVJlZHJhdyhyZWRyYXdTdGF0ZU5vdyksXG4gICAgcmVkcmF3U2hhcGVzOiBkZWJvdW5jZVJlZHJhdygoKSA9PiByZWRyYXdTaGFwZXNOb3coc3RhdGUpKSxcbiAgICB1bmJpbmQ6IGJpbmREb2N1bWVudChzdGF0ZSksXG4gICAgZWxlbWVudFVuYmluZHM6IG5ldyBNYXAoKSxcbiAgICBkZXN0cm95ZWQ6IGZhbHNlLFxuICB9O1xuXG4gIGlmICh3cmFwRWxlbWVudHMpIHJlZHJhd0FsbCh3cmFwRWxlbWVudHMsIHN0YXRlKTtcblxuICByZXR1cm4gc3RhcnQoc3RhdGUpO1xufVxuXG5mdW5jdGlvbiBkZWJvdW5jZVJlZHJhdyhmOiAoLi4uYXJnczogYW55W10pID0+IHZvaWQpOiAoLi4uYXJnczogYW55W10pID0+IHZvaWQge1xuICBsZXQgcmVkcmF3aW5nID0gZmFsc2U7XG4gIHJldHVybiAoLi4uYXJnczogYW55W10pID0+IHtcbiAgICBpZiAocmVkcmF3aW5nKSByZXR1cm47XG4gICAgcmVkcmF3aW5nID0gdHJ1ZTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgZiguLi5hcmdzKTtcbiAgICAgIHJlZHJhd2luZyA9IGZhbHNlO1xuICAgIH0pO1xuICB9O1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDRU8sTUFBTSxTQUFTLENBQUMsU0FBUyxNQUFNO0FBRS9C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TUFDQSxXQUFXO0FBQUEsTUFDWCxRQUFRLGVBQWUsY0FBYztBQUFBLE1BQ3JDLGNBQWMsZUFBZSxNQUFNLGdCQUFnQixLQUFLLENBQUM7QUFBQSxNQUN6RCxRQUFRLGFBQWEsS0FBSztBQUFBLE1BQzFCLGdCQUFnQixvQkFBSSxJQUFJO0FBQUEsTUFDeEIsV0FBVztBQUFBLElBQ2I7QUFFQSxRQUFJLGFBQWMsV0FBVSxjQUFjLEtBQUs7QUFFL0MsV0FBT0MsT0FBTSxLQUFLO0FBQUEsRUFDcEI7QUFFQSxXQUFTLGVBQWUsR0FBdUQ7QUFDN0UsUUFBSSxZQUFZO0FBQ2hCLFdBQU8sSUFBSSxTQUFnQjtBQUN6QixVQUFJLFVBQVc7QUFDZixrQkFBWTtBQUNaLDRCQUFzQixNQUFNO0FBQzFCLFVBQUUsR0FBRyxJQUFJO0FBQ1Qsb0JBQVk7QUFBQSxNQUNkLENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRjs7O0FuQmxGQSxNQUFPLGdCQUFROyIsCiAgIm5hbWVzIjogWyJub3ciLCAibW92ZSIsICJyYW5rcyIsICJicnVzaGVzIiwgImVsIiwgImRlc3QiLCAic3RhcnQiLCAiY2FuY2VsIiwgIm1vdmUiLCAiZW5kIiwgInVuc2VsZWN0IiwgIm1vdmUiLCAiZW5kIiwgImNhbmNlbCIsICJzdGFydCIsICJzIiwgInJlbmRlciIsICJhbmltIiwgImsiLCAicmFua3MiLCAiZmlsZXMiLCAicmVuZGVySGFuZCIsICJyZW5kZXIiLCAic3RhcnQiLCAic3RhdGUiLCAiY2FuY2VsIiwgInJlbmRlciIsICJzdGFydCJdCn0K
