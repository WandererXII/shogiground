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
  var src_exports = {};
  __export(src_exports, {
    default: () => src_default
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
    const dx = pos1[0] - pos2[0], dy = pos1[1] - pos2[1];
    return dx * dx + dy * dy;
  };
  var samePiece = (p1, p2) => p1.role === p2.role && p1.color === p2.color;
  var posToTranslateBase = (pos, dims, asSente, xFactor, yFactor) => [
    (asSente ? dims.files - 1 - pos[0] : pos[0]) * xFactor,
    (asSente ? pos[1] : dims.ranks - 1 - pos[1]) * yFactor
  ];
  var posToTranslateAbs = (dims, bounds) => {
    const xFactor = bounds.width / dims.files, yFactor = bounds.height / dims.ranks;
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
  var eventPosition = (e) => {
    var _a;
    if (e.clientX || e.clientX === 0) return [e.clientX, e.clientY];
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
        const piece = { color, role }, pieceRect = bounds.get(pieceNameOf(piece));
        if (pieceRect && isInsideRect(pieceRect, pos)) return piece;
      }
    }
    return;
  }
  function posOfOutsideEl(left, top, asSente, dims, boardBounds) {
    const sqW = boardBounds.width / dims.files, sqH = boardBounds.height / dims.ranks;
    if (!sqW || !sqH) return;
    let xOff = (left - boardBounds.left) / sqW;
    if (asSente) xOff = dims.files - 1 - xOff;
    let yOff = (top - boardBounds.top) / sqH;
    if (!asSente) yOff = dims.ranks - 1 - yOff;
    return [xOff, yOff];
  }

  // src/hands.ts
  function addToHand(s, piece, cnt = 1) {
    const hand = s.hands.handMap.get(piece.color), role = (s.hands.roles.includes(piece.role) ? piece.role : s.promotion.unpromotesTo(piece.role)) || piece.role;
    if (hand && s.hands.roles.includes(role)) hand.set(role, (hand.get(role) || 0) + cnt);
  }
  function removeFromHand(s, piece, cnt = 1) {
    const hand = s.hands.handMap.get(piece.color), role = (s.hands.roles.includes(piece.role) ? piece.role : s.promotion.unpromotesTo(piece.role)) || piece.role, num = hand == null ? void 0 : hand.get(role);
    if (hand && num) hand.set(role, Math.max(num - cnt, 0));
  }
  function renderHand(s, handEl) {
    var _a;
    handEl.classList.toggle("promotion", !!s.promotion.current);
    let wrapEl = handEl.firstElementChild;
    while (wrapEl) {
      const pieceEl = wrapEl.firstElementChild, piece = { role: pieceEl.sgRole, color: pieceEl.sgColor }, num = ((_a = s.hands.handMap.get(piece.color)) == null ? void 0 : _a.get(piece.role)) || 0, isSelected = !!s.selectedPiece && samePiece(piece, s.selectedPiece) && !s.droppable.spare;
      wrapEl.classList.toggle(
        "selected",
        (s.activeColor === "both" || s.activeColor === s.turnColor) && isSelected
      );
      wrapEl.classList.toggle(
        "preselected",
        s.activeColor !== "both" && s.activeColor !== s.turnColor && isSelected
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
    const origPiece = state.pieces.get(orig), destPiece = state.pieces.get(dest);
    if (orig === dest || !origPiece) return false;
    const captured = destPiece && destPiece.color !== origPiece.color ? destPiece : void 0, promPiece = prom && promotePiece(state, origPiece);
    if (dest === state.selected || orig === state.selected) unselect(state);
    state.pieces.set(dest, promPiece || origPiece);
    state.pieces.delete(orig);
    state.lastDests = [orig, dest];
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
        callUserFunction(state.droppable.events.after, piece, key, realProm, {
          premade: false
        });
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
        const metadata = {
          premade: false
        };
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
    state.promotion.current = {
      piece,
      promotedPiece,
      key,
      dragged: !!state.draggable.current
    };
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
    const orig = move3.orig, dest = move3.dest, prom = move3.prom;
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
    const piece = drop.piece, key = drop.key, prom = drop.prom;
    let success = false;
    if (canDrop(state, piece, key)) {
      if (baseUserDrop(state, piece, key, prom)) {
        callUserFunction(state.droppable.events.after, piece, key, prom, {
          premade: true
        });
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
    const ranks2 = boardSfen.split("/"), firstFile = ranks2[0].split("");
    let filesCnt = 0, cnt = 0;
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
    const sfenParser = fromForsyth || standardFromForsyth, pieces = /* @__PURE__ */ new Map();
    let x = dims.files - 1, y = 0;
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
          const nb1 = sfen[i].charCodeAt(0), nb2 = sfen[i + 1] && sfen[i + 1].charCodeAt(0);
          if (nb1 < 58 && nb1 > 47) {
            if (nb2 && nb2 < 58 && nb2 > 47) {
              x -= (nb1 - 48) * 10 + (nb2 - 48);
              i++;
            } else x -= nb1 - 48;
          } else {
            const roleStr = sfen[i] === "+" && sfen.length > i + 1 ? "+" + sfen[++i] : sfen[i], role = sfenParser(roleStr);
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
    const sfenRenderer = toForsyth || standardToForsyth, reversedFiles = files.slice(0, dims.files).reverse();
    return ranks.slice(0, dims.ranks).map(
      (y) => reversedFiles.map((x) => {
        const piece = pieces.get(x + y), forsyth = piece && sfenRenderer(piece.role);
        if (forsyth) {
          return piece.color === "sente" ? forsyth.toUpperCase() : forsyth.toLowerCase();
        } else return "1";
      }).join("")
    ).join("/").replace(/1{2,}/g, (s) => s.length.toString());
  }
  function sfenToHands(sfen, fromForsyth) {
    const sfenParser = fromForsyth || standardFromForsyth, sente = /* @__PURE__ */ new Map(), gote = /* @__PURE__ */ new Map();
    let tmpNum = 0, num = 1;
    for (let i = 0; i < sfen.length; i++) {
      const nb = sfen[i].charCodeAt(0);
      if (nb < 58 && nb > 47) {
        tmpNum = tmpNum * 10 + nb - 48;
        num = tmpNum;
      } else {
        const roleStr = sfen[i] === "+" && sfen.length > i + 1 ? "+" + sfen[++i] : sfen[i], role = sfenParser(roleStr);
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
    let senteHandStr = "", goteHandStr = "";
    for (const role of roles) {
      const forsyth = sfenRenderer(role);
      if (forsyth) {
        const senteCnt = (_a = hands.get("sente")) == null ? void 0 : _a.get(role), goteCnt = (_b = hands.get("gote")) == null ? void 0 : _b.get(role);
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
    const anims = /* @__PURE__ */ new Map(), animedOrigs = [], fadings = /* @__PURE__ */ new Map(), promotions = /* @__PURE__ */ new Map(), missings = [], news = [], prePieces = /* @__PURE__ */ new Map();
    for (const [k, p] of prevPieces) {
      prePieces.set(k, makePiece(k, p));
    }
    for (const key of allKeys) {
      const curP = current.pieces.get(key), preP = prePieces.get(key);
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
        const curH = current.hands.handMap.get(color), preH = prevHands.get(color);
        if (preH && curH) {
          for (const [role, n] of preH) {
            const piece = { role, color }, curN = curH.get(role) || 0;
            if (curN < n) {
              const handPieceOffset = current.dom.bounds.hands.pieceBounds().get(pieceNameOf(piece)), bounds = current.dom.bounds.board.bounds(), outPos = handPieceOffset && bounds ? posOfOutsideEl(
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
          const pRole = current.promotion.promotesTo(p.piece.role), pPiece = pRole && { color: p.piece.color, role: pRole };
          const nRole = current.promotion.promotesTo(newP.piece.role), nPiece = nRole && { color: newP.piece.color, role: nRole };
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
    const prevPieces = new Map(state.pieces), prevHands = /* @__PURE__ */ new Map([
      ["sente", new Map(state.hands.handMap.get("sente"))],
      ["gote", new Map(state.hands.handMap.get("gote"))]
    ]);
    const result = mutation(state), plan = computePlan(prevPieces, prevHands, state);
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

  // src/shapes.ts
  function createSVGElement(tagName) {
    return document.createElementNS("http://www.w3.org/2000/svg", tagName);
  }
  var outsideArrowHash = "outsideArrow";
  function renderShapes(state, svg, customSvg, freePieces) {
    const d = state.drawable, curD = d.current, cur = (curD == null ? void 0 : curD.dest) ? curD : void 0, outsideArrow = !!curD && !cur, arrowDests = /* @__PURE__ */ new Map(), pieceMap = /* @__PURE__ */ new Map();
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
    const defsEl = svg.querySelector("defs"), shapesEl = svg.querySelector("g"), customSvgsEl = customSvg.querySelector("g");
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
        }), el = renderArrow(curD.brush, orig, orig, state.squareRatio, true, false);
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
    const hashesInDom = /* @__PURE__ */ new Map(), toRemove = [];
    for (const sc of shapes) hashesInDom.set(sc.hash, false);
    if (outsideArrow) hashesInDom.set(outsideArrowHash, true);
    let el = root.firstElementChild, elHash;
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
    return "custom-" + h.toString();
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
          const pieceBounds = state.dom.bounds.hands.pieceBounds().get(pieceNameOf(shape.orig)), bounds = state.dom.bounds.board.bounds();
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
    const o = pos, widths = ellipseWidth(ratio);
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
    const m = arrowMargin(shorten && !current, ratio), a = orig, b = dest, dx = b[0] - a[0], dy = b[1] - a[1], angle = Math.atan2(dy, dx), xo = Math.cos(angle) * m, yo = Math.sin(angle) * m;
    return setAttributes(createSVGElement("line"), {
      "stroke-width": lineWidth(current, ratio),
      "stroke-linecap": "round",
      "marker-end": "url(#arrowhead-" + (brush || "primary") + ")",
      x1: a[0],
      y1: a[1],
      x2: b[0] - xo,
      y2: b[1] - yo
    });
  }
  function renderPiece(state, { shape }) {
    if (!shape.piece || isPiece(shape.orig)) return;
    const orig = shape.orig, scale = (shape.piece.scale || 1) * (state.scaleDownPieces ? 0.5 : 1);
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
    const dest = !samePieceOrKey(shape.orig, shape.dest) && pieceOrKeyToPos(shape.dest, state), diff = dest ? [dest[0] - orig[0], dest[1] - orig[1]] : [0, 0], offset = (arrowDests.get(isPiece(shape.dest) ? pieceNameOf(shape.dest) : shape.dest) || 0) > 1 ? 0.3 : 0.15, close = (diff[0] === 0 || Math.abs(diff[0]) === state.squareRatio[0]) && (diff[1] === 0 || Math.abs(diff[1]) === state.squareRatio[1]), ratio = dest ? 0.55 - (close ? offset : 0) : 0, mid = [orig[0] + diff[0] * ratio, orig[1] + diff[1] * ratio], textLength = shape.description.length;
    const g = setAttributes(createSVGElement("g"), { class: "description" }), circle = setAttributes(createSVGElement("ellipse"), {
      cx: mid[0],
      cy: mid[1],
      rx: textLength + 1.5,
      ry: 2.5
    }), text = setAttributes(createSVGElement("text"), {
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
      id: "arrowhead-" + brush,
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
      const pieceBounds = state.dom.bounds.hands.pieceBounds().get(pieceNameOf(kp)), bounds = state.dom.bounds.board.bounds(), offset = sentePov(state.orientation) ? [0.5, -0.5] : [-0.5, 0.5], pos = pieceBounds && bounds && posOfOutsideEl(
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
    const pos = eventPosition(e), bounds = state.dom.bounds.board.bounds(), orig = pos && bounds && getKeyAtDomPos(pos, sentePov(state.orientation), state.dimensions, bounds), piece = state.drawable.piece;
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
      const cur = state.drawable.current, bounds = state.dom.bounds.board.bounds();
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
    if (state.drawable.current) state.drawable.current.pos = eventPosition(e);
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
    const modA = allowFirstModifier && (e.shiftKey || e.ctrlKey), modB = e.altKey || e.metaKey || ((_a = e.getModifierState) == null ? void 0 : _a.call(e, "AltGraph"));
    return brushes[(modA ? 1 : 0) + (modB ? 2 : 0)];
  }
  function addShape(drawable, cur) {
    if (!cur.dest) return;
    const similarShape = (s) => cur.dest && samePieceOrKey(cur.orig, s.orig) && samePieceOrKey(cur.dest, s.dest);
    const piece = cur.piece;
    cur.piece = void 0;
    const similar = drawable.shapes.find(similarShape), removePiece = drawable.shapes.find(
      (s) => similarShape(s) && piece && s.piece && samePiece(piece, s.piece)
    ), diffPiece = drawable.shapes.find(
      (s) => similarShape(s) && piece && s.piece && !samePiece(piece, s.piece)
    );
    if (similar) drawable.shapes = drawable.shapes.filter((s) => !similarShape(s));
    if (!isPiece(cur.orig) && piece && !removePiece) {
      drawable.shapes.push({ orig: cur.orig, dest: cur.orig, piece, brush: cur.brush });
      if (!samePieceOrKey(cur.orig, cur.dest))
        drawable.shapes.push({ orig: cur.orig, dest: cur.orig, brush: cur.brush });
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
    const bounds = s.dom.bounds.board.bounds(), position = eventPosition(e), orig = bounds && position && getKeyAtDomPos(position, sentePov(s.orientation), s.dimensions, bounds);
    if (!orig) return;
    const piece = s.pieces.get(orig), previouslySelected = s.selected;
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
    const stillSelected = s.selected === orig, draggedEl = (_a = s.dom.elements.board) == null ? void 0 : _a.dragged;
    if (piece && draggedEl && stillSelected && isDraggable(s, piece)) {
      const touch = e.type === "touchstart";
      s.draggable.current = {
        piece,
        pos: position,
        origPos: position,
        started: s.draggable.autoDistance && !touch,
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
    const asSente = sentePov(s.orientation), radiusSq = Math.pow(bounds.width / s.dimensions.files, 2);
    for (const key of s.pieces.keys()) {
      const center = computeSquareCenter(key, asSente, s.dimensions, bounds);
      if (distanceSq(center, pos) <= radiusSq) return true;
    }
    return false;
  }
  function dragNewPiece(s, piece, e, spare) {
    var _a;
    const previouslySelectedPiece = s.selectedPiece, draggedEl = (_a = s.dom.elements.board) == null ? void 0 : _a.dragged, position = eventPosition(e), touch = e.type === "touchstart";
    if (!previouslySelectedPiece && !spare && s.drawable.enabled && s.drawable.eraseOnClick)
      clear(s);
    if (!spare && s.selectable.deleteOnTouch) removeFromHand(s, piece);
    else selectPiece(s, piece, spare);
    const hadPremove = !!s.premovable.current, hadPredrop = !!s.predroppable.current, stillSelected = s.selectedPiece && samePiece(s.selectedPiece, piece);
    if (draggedEl && position && s.selectedPiece && stillSelected && isDraggable(s, piece)) {
      s.draggable.current = {
        piece: s.selectedPiece,
        pos: position,
        origPos: position,
        touch,
        started: s.draggable.autoDistance && !touch,
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
      const cur = s.draggable.current, draggedEl = (_a = s.dom.elements.board) == null ? void 0 : _a.dragged, bounds = s.dom.bounds.board.bounds();
      if (!cur || !draggedEl || !bounds) return;
      if (((_b = cur.fromBoard) == null ? void 0 : _b.orig) && ((_c = s.animation.current) == null ? void 0 : _c.plan.anims.has(cur.fromBoard.orig)))
        s.animation.current = void 0;
      const origPiece = cur.fromBoard ? s.pieces.get(cur.fromBoard.orig) : cur.piece;
      if (!origPiece || !samePiece(origPiece, cur.piece)) cancel2(s);
      else {
        if (!cur.started && distanceSq(cur.pos, cur.origPos) >= Math.pow(s.draggable.distance, 2)) {
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
      s.draggable.current.pos = eventPosition(e);
    } else if ((s.selected || s.selectedPiece || s.highlight.hovered) && !s.draggable.current && (!e.touches || e.touches.length < 2)) {
      const bounds = s.dom.bounds.board.bounds(), hover = bounds && getKeyAtDomPos(
        eventPosition(e),
        sentePov(s.orientation),
        s.dimensions,
        bounds
      );
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
    const eventPos = eventPosition(e) || cur.pos, bounds = s.dom.bounds.board.bounds(), dest = bounds && getKeyAtDomPos(eventPos, sentePov(s.orientation), s.dimensions, bounds);
    if (dest && cur.started && ((_a = cur.fromBoard) == null ? void 0 : _a.orig) !== dest) {
      if (cur.fromOutside && !promotionDialogDrop(s, cur.piece, dest))
        userDrop(s, cur.piece, dest);
      else if (cur.fromBoard && !promotionDialogMove(s, cur.fromBoard.orig, dest))
        userMove(s, cur.fromBoard.orig, dest);
    } else if (s.draggable.deleteOnDropOff && !dest) {
      if (cur.fromBoard) s.pieces.delete(cur.fromBoard.orig);
      else if (cur.fromOutside && !s.droppable.spare) removeFromHand(s, cur.piece);
      if (s.draggable.addToHandOnDropOff) {
        const handBounds = s.dom.bounds.hands.bounds(), handBoundsTop = handBounds.get("top"), handBoundsBottom = handBounds.get("bottom");
        if (handBoundsTop && isInsideRect(handBoundsTop, cur.pos))
          addToHand(s, { color: opposite(s.orientation), role: cur.piece.role });
        else if (handBoundsBottom && isInsideRect(handBoundsBottom, cur.pos))
          addToHand(s, { color: s.orientation, role: cur.piece.role });
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
    const asSente = sentePov(s.orientation), curIndex = s.hovered && domSquareIndexOfKey(s.hovered, asSente, s.dimensions), curHoverEl = curIndex !== void 0 && sqaureEls[curIndex];
    if (curHoverEl) curHoverEl.classList.add("hover");
    const prevIndex = prevHover && domSquareIndexOfKey(prevHover, asSente, s.dimensions), prevHoverEl = prevIndex !== void 0 && sqaureEls[prevIndex];
    if (prevHoverEl) prevHoverEl.classList.remove("hover");
  }

  // src/coords.ts
  function coords(notation) {
    switch (notation) {
      case "japanese":
        return [
          "\u5341\u516D",
          "\u5341\u4E94",
          "\u5341\u56DB",
          "\u5341\u4E09",
          "\u5341\u4E8C",
          "\u5341\u4E00",
          "\u5341",
          "\u4E5D",
          "\u516B",
          "\u4E03",
          "\u516D",
          "\u4E94",
          "\u56DB",
          "\u4E09",
          "\u4E8C",
          "\u4E00"
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
    let dragged, promotion, squareOver;
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
      const orientClass = s.orientation === "gote" ? " gote" : "", ranks2 = coords(s.coordinates.ranks), files2 = coords(s.coordinates.files);
      board.appendChild(renderCoords(ranks2, "ranks" + orientClass, s.dimensions.ranks));
      board.appendChild(renderCoords(files2, "files" + orientClass, s.dimensions.files));
    }
    boardWrap.innerHTML = "";
    const dimCls = `d-${s.dimensions.files}x${s.dimensions.ranks}`;
    boardWrap.classList.forEach((c) => {
      if (c.substring(0, 2) === "d-" && c !== dimCls) boardWrap.classList.remove(c);
    });
    boardWrap.classList.add("sg-wrap", dimCls);
    for (const c of colors) boardWrap.classList.toggle("orientation-" + c, s.orientation === c);
    boardWrap.classList.toggle("manipulable", !s.viewOnly);
    boardWrap.appendChild(board);
    let hands;
    if (s.hands.inlined) {
      const handWrapTop = createEl("sg-hand-wrap", "inlined"), handWrapBottom = createEl("sg-hand-wrap", "inlined");
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
    for (const c of colors) handWrap.classList.toggle("orientation-" + c, s.orientation === c);
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
      const piece = { role, color }, wrapEl = createEl("sg-hp-wrap"), pieceEl = createEl("piece", pieceNameOf(piece));
      pieceEl.sgColor = color;
      pieceEl.sgRole = role;
      wrapEl.appendChild(pieceEl);
      hand.appendChild(wrapEl);
    }
    return hand;
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
    const piecesEl = boardEls.pieces, promotionEl = boardEls.promotion;
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
      if (s.disableContextMenu) promotionEl.addEventListener("contextmenu", (e) => e.preventDefault());
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
      const onmove = dragOrDraw(s, move2, move), onend = dragOrDraw(s, end2, end);
      for (const ev of ["touchmove", "mousemove"])
        unbinds.push(unbindable(document, ev, onmove));
      for (const ev of ["touchend", "mouseup"])
        unbinds.push(unbindable(document, ev, onend));
      unbinds.push(
        unbindable(document, "scroll", () => clearBounds(s), { capture: true, passive: true })
      );
      unbinds.push(unbindable(window, "resize", () => clearBounds(s), { passive: true }));
    }
    return () => unbinds.forEach((f) => f());
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
      const pos = eventPosition(e), piece = pos && getHandPieceAtDomPos(pos, s.hands.roles, s.dom.bounds.hands.pieceBounds());
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
    const target = e.target, cur = s.promotion.current;
    if (target && isPieceNode(target) && cur) {
      const piece = { color: target.sgColor, role: target.sgRole }, prom = !samePiece(cur.piece, piece);
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
    const asSente = sentePov(s.orientation), scaleDown = s.scaleDownPieces ? 0.5 : 1, posToTranslate = posToTranslateRel(s.dimensions), squaresEl = boardEls.squares, piecesEl = boardEls.pieces, draggedEl = boardEls.dragged, squareOverEl = boardEls.squareOver, promotionEl = boardEls.promotion, pieces = s.pieces, curAnim = s.animation.current, anims = curAnim ? curAnim.plan.anims : /* @__PURE__ */ new Map(), fadings = curAnim ? curAnim.plan.fadings : /* @__PURE__ */ new Map(), promotions = curAnim ? curAnim.plan.promotions : /* @__PURE__ */ new Map(), curDrag = s.draggable.current, curPromKey = ((_a = s.promotion.current) == null ? void 0 : _a.dragged) ? s.selected : void 0, squares = computeSquareClasses(s), samePieces = /* @__PURE__ */ new Set(), movedPieces = /* @__PURE__ */ new Map();
    if (!curDrag && (draggedEl == null ? void 0 : draggedEl.sgDragging)) {
      draggedEl.sgDragging = false;
      setDisplay(draggedEl, false);
      if (squareOverEl) setDisplay(squareOverEl, false);
    }
    let k, el, pieceAtKey, elPieceName, anim2, fading, prom, pMvdset, pMvd;
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
          const pieceNode = createEl("piece", pieceNameOf(p)), pos = key2pos(k2);
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
            addSquare(squares, k, "dest" + (s.pieces.has(k) ? " oc" : ""));
          }
        const pDests = s.premovable.dests;
        if (pDests)
          for (const k of pDests) {
            addSquare(squares, k, "pre-dest" + (s.pieces.has(k) ? " oc" : ""));
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
            addSquare(squares, k, "pre-dest" + (s.pieces.has(k) ? " oc" : ""));
          }
      }
    }
    const premove = s.premovable.current;
    if (premove) {
      addSquare(squares, premove.orig, "current-pre");
      addSquare(squares, premove.dest, "current-pre" + (premove.prom ? " prom" : ""));
    } else if (s.predroppable.current)
      addSquare(
        squares,
        s.predroppable.current.key,
        "current-pre" + (s.predroppable.current.prom ? " prom" : "")
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
    const cur = s.promotion.current, key = cur == null ? void 0 : cur.key, pieces = cur ? [cur.promotedPiece, cur.piece] : [], hash = promotionHash(!!cur, key, pieces);
    if (s.promotion.prevPromotionHash === hash) return;
    s.promotion.prevPromotionHash = hash;
    if (key) {
      const asSente = sentePov(s.orientation), initPos = key2pos(key), color = cur.piece.color, promotionSquare = createEl("sg-promotion-square"), promotionChoices = createEl("sg-promotion-choices");
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
        render((state2) => state2.drawable.autoShapes = shapes, state);
      },
      setShapes(shapes) {
        render((state2) => state2.drawable.shapes = shapes, state);
      },
      setSquareHighlights(squares) {
        render((state2) => state2.drawable.squares = squares, state);
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
      coordinates: {
        enabled: true,
        files: "numeric",
        ranks: "numeric"
      },
      highlight: {
        lastDests: true,
        check: true,
        checkRoles: ["king"],
        hovered: false
      },
      animation: {
        enabled: true,
        hands: true,
        duration: 250
      },
      hands: {
        inlined: false,
        handMap: /* @__PURE__ */ new Map([
          ["sente", /* @__PURE__ */ new Map()],
          ["gote", /* @__PURE__ */ new Map()]
        ]),
        roles: ["rook", "bishop", "gold", "silver", "knight", "lance", "pawn"]
      },
      movable: {
        free: true,
        showDests: true,
        events: {}
      },
      droppable: {
        free: true,
        showDests: true,
        spare: false,
        events: {}
      },
      premovable: {
        enabled: true,
        showDests: true,
        events: {}
      },
      predroppable: {
        enabled: true,
        showDests: true,
        events: {}
      },
      draggable: {
        enabled: true,
        distance: 3,
        autoDistance: true,
        showGhost: true,
        showTouchSquareOverlay: true,
        deleteOnDropOff: false,
        addToHandOnDropOff: false
      },
      selectable: {
        enabled: true,
        forceSpares: false,
        deleteOnTouch: false,
        addSparesToHand: false
      },
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
            const handsRects = /* @__PURE__ */ new Map(), handEls = state.dom.elements.hands;
            if (handEls == null ? void 0 : handEls.top) handsRects.set("top", handEls.top.getBoundingClientRect());
            if (handEls == null ? void 0 : handEls.bottom) handsRects.set("bottom", handEls.bottom.getBoundingClientRect());
            return handsRects;
          }),
          pieceBounds: memo(() => {
            const handPiecesRects = /* @__PURE__ */ new Map(), handEls = state.dom.elements.hands;
            if (handEls == null ? void 0 : handEls.top) {
              let wrapEl = handEls.top.firstElementChild;
              while (wrapEl) {
                const pieceEl = wrapEl.firstElementChild, piece = { role: pieceEl.sgRole, color: pieceEl.sgColor };
                handPiecesRects.set(pieceNameOf(piece), pieceEl.getBoundingClientRect());
                wrapEl = wrapEl.nextElementSibling;
              }
            }
            if (handEls == null ? void 0 : handEls.bottom) {
              let wrapEl = handEls.bottom.firstElementChild;
              while (wrapEl) {
                const pieceEl = wrapEl.firstElementChild, piece = { role: pieceEl.sgRole, color: pieceEl.sgColor };
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
  var src_default = Shogiground;
  return __toCommonJS(src_exports);
})();
Shogiground = Shogiground.default;
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2luZGV4LnRzIiwgIi4uL3NyYy9jb25zdGFudHMudHMiLCAiLi4vc3JjL3V0aWwudHMiLCAiLi4vc3JjL2hhbmRzLnRzIiwgIi4uL3NyYy9ib2FyZC50cyIsICIuLi9zcmMvc2Zlbi50cyIsICIuLi9zcmMvY29uZmlnLnRzIiwgIi4uL3NyYy9hbmltLnRzIiwgIi4uL3NyYy9zaGFwZXMudHMiLCAiLi4vc3JjL2RyYXcudHMiLCAiLi4vc3JjL2RyYWcudHMiLCAiLi4vc3JjL2Nvb3Jkcy50cyIsICIuLi9zcmMvd3JhcC50cyIsICIuLi9zcmMvZXZlbnRzLnRzIiwgIi4uL3NyYy9yZW5kZXIudHMiLCAiLi4vc3JjL2RvbS50cyIsICIuLi9zcmMvYXBpLnRzIiwgIi4uL3NyYy9zdGF0ZS50cyIsICIuLi9zcmMvcmVkcmF3LnRzIiwgIi4uL3NyYy9zaG9naWdyb3VuZC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgU2hvZ2lncm91bmQgfSBmcm9tICcuL3Nob2dpZ3JvdW5kLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgU2hvZ2lncm91bmQ7XG4iLCAiaW1wb3J0IHR5cGUgeyBLZXkgfSBmcm9tICcuL3R5cGVzLmpzJztcblxuZXhwb3J0IGNvbnN0IGNvbG9ycyA9IFsnc2VudGUnLCAnZ290ZSddIGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgZmlsZXMgPSBbXG4gICcxJyxcbiAgJzInLFxuICAnMycsXG4gICc0JyxcbiAgJzUnLFxuICAnNicsXG4gICc3JyxcbiAgJzgnLFxuICAnOScsXG4gICcxMCcsXG4gICcxMScsXG4gICcxMicsXG4gICcxMycsXG4gICcxNCcsXG4gICcxNScsXG4gICcxNicsXG5dIGFzIGNvbnN0O1xuZXhwb3J0IGNvbnN0IHJhbmtzID0gW1xuICAnYScsXG4gICdiJyxcbiAgJ2MnLFxuICAnZCcsXG4gICdlJyxcbiAgJ2YnLFxuICAnZycsXG4gICdoJyxcbiAgJ2knLFxuICAnaicsXG4gICdrJyxcbiAgJ2wnLFxuICAnbScsXG4gICduJyxcbiAgJ28nLFxuICAncCcsXG5dIGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgYWxsS2V5czogcmVhZG9ubHkgS2V5W10gPSBBcnJheS5wcm90b3R5cGUuY29uY2F0KFxuICAuLi5yYW5rcy5tYXAociA9PiBmaWxlcy5tYXAoZiA9PiBmICsgcikpXG4pO1xuXG5leHBvcnQgY29uc3Qgbm90YXRpb25zID0gWydudW1lcmljJywgJ2phcGFuZXNlJywgJ2VuZ2luZScsICdoZXgnXSBhcyBjb25zdDtcbiIsICJpbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgYWxsS2V5cywgY29sb3JzIH0gZnJvbSAnLi9jb25zdGFudHMuanMnO1xuXG5leHBvcnQgY29uc3QgcG9zMmtleSA9IChwb3M6IHNnLlBvcyk6IHNnLktleSA9PiBhbGxLZXlzW3Bvc1swXSArIDE2ICogcG9zWzFdXTtcblxuZXhwb3J0IGNvbnN0IGtleTJwb3MgPSAoazogc2cuS2V5KTogc2cuUG9zID0+IHtcbiAgaWYgKGsubGVuZ3RoID4gMikgcmV0dXJuIFtrLmNoYXJDb2RlQXQoMSkgLSAzOSwgay5jaGFyQ29kZUF0KDIpIC0gOTddO1xuICBlbHNlIHJldHVybiBbay5jaGFyQ29kZUF0KDApIC0gNDksIGsuY2hhckNvZGVBdCgxKSAtIDk3XTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBtZW1vPEE+KGY6ICgpID0+IEEpOiBzZy5NZW1vPEE+IHtcbiAgbGV0IHY6IEEgfCB1bmRlZmluZWQ7XG4gIGNvbnN0IHJldCA9ICgpOiBBID0+IHtcbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB2ID0gZigpO1xuICAgIHJldHVybiB2O1xuICB9O1xuICByZXQuY2xlYXIgPSAoKSA9PiB7XG4gICAgdiA9IHVuZGVmaW5lZDtcbiAgfTtcbiAgcmV0dXJuIHJldDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGxVc2VyRnVuY3Rpb248VCBleHRlbmRzICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZD4oXG4gIGY6IFQgfCB1bmRlZmluZWQsXG4gIC4uLmFyZ3M6IFBhcmFtZXRlcnM8VD5cbik6IHZvaWQge1xuICBpZiAoZikgc2V0VGltZW91dCgoKSA9PiBmKC4uLmFyZ3MpLCAxKTtcbn1cblxuZXhwb3J0IGNvbnN0IG9wcG9zaXRlID0gKGM6IHNnLkNvbG9yKTogc2cuQ29sb3IgPT4gKGMgPT09ICdzZW50ZScgPyAnZ290ZScgOiAnc2VudGUnKTtcblxuZXhwb3J0IGNvbnN0IHNlbnRlUG92ID0gKG86IHNnLkNvbG9yKTogYm9vbGVhbiA9PiBvID09PSAnc2VudGUnO1xuXG5leHBvcnQgY29uc3QgZGlzdGFuY2VTcSA9IChwb3MxOiBzZy5Qb3MsIHBvczI6IHNnLlBvcyk6IG51bWJlciA9PiB7XG4gIGNvbnN0IGR4ID0gcG9zMVswXSAtIHBvczJbMF0sXG4gICAgZHkgPSBwb3MxWzFdIC0gcG9zMlsxXTtcbiAgcmV0dXJuIGR4ICogZHggKyBkeSAqIGR5O1xufTtcblxuZXhwb3J0IGNvbnN0IHNhbWVQaWVjZSA9IChwMTogc2cuUGllY2UsIHAyOiBzZy5QaWVjZSk6IGJvb2xlYW4gPT5cbiAgcDEucm9sZSA9PT0gcDIucm9sZSAmJiBwMS5jb2xvciA9PT0gcDIuY29sb3I7XG5cbmNvbnN0IHBvc1RvVHJhbnNsYXRlQmFzZSA9IChcbiAgcG9zOiBzZy5Qb3MsXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGFzU2VudGU6IGJvb2xlYW4sXG4gIHhGYWN0b3I6IG51bWJlcixcbiAgeUZhY3RvcjogbnVtYmVyXG4pOiBzZy5OdW1iZXJQYWlyID0+IFtcbiAgKGFzU2VudGUgPyBkaW1zLmZpbGVzIC0gMSAtIHBvc1swXSA6IHBvc1swXSkgKiB4RmFjdG9yLFxuICAoYXNTZW50ZSA/IHBvc1sxXSA6IGRpbXMucmFua3MgLSAxIC0gcG9zWzFdKSAqIHlGYWN0b3IsXG5dO1xuXG5leHBvcnQgY29uc3QgcG9zVG9UcmFuc2xhdGVBYnMgPSAoXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGJvdW5kczogRE9NUmVjdFxuKTogKChwb3M6IHNnLlBvcywgYXNTZW50ZTogYm9vbGVhbikgPT4gc2cuTnVtYmVyUGFpcikgPT4ge1xuICBjb25zdCB4RmFjdG9yID0gYm91bmRzLndpZHRoIC8gZGltcy5maWxlcyxcbiAgICB5RmFjdG9yID0gYm91bmRzLmhlaWdodCAvIGRpbXMucmFua3M7XG4gIHJldHVybiAocG9zLCBhc1NlbnRlKSA9PiBwb3NUb1RyYW5zbGF0ZUJhc2UocG9zLCBkaW1zLCBhc1NlbnRlLCB4RmFjdG9yLCB5RmFjdG9yKTtcbn07XG5cbmV4cG9ydCBjb25zdCBwb3NUb1RyYW5zbGF0ZVJlbCA9XG4gIChkaW1zOiBzZy5EaW1lbnNpb25zKTogKChwb3M6IHNnLlBvcywgYXNTZW50ZTogYm9vbGVhbikgPT4gc2cuTnVtYmVyUGFpcikgPT5cbiAgKHBvcywgYXNTZW50ZSkgPT5cbiAgICBwb3NUb1RyYW5zbGF0ZUJhc2UocG9zLCBkaW1zLCBhc1NlbnRlLCAxMDAsIDEwMCk7XG5cbmV4cG9ydCBjb25zdCB0cmFuc2xhdGVBYnMgPSAoZWw6IEhUTUxFbGVtZW50LCBwb3M6IHNnLk51bWJlclBhaXIsIHNjYWxlOiBudW1iZXIpOiB2b2lkID0+IHtcbiAgZWwuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke3Bvc1swXX1weCwke3Bvc1sxXX1weCkgc2NhbGUoJHtzY2FsZX1gO1xufTtcblxuZXhwb3J0IGNvbnN0IHRyYW5zbGF0ZVJlbCA9IChcbiAgZWw6IEhUTUxFbGVtZW50LFxuICBwZXJjZW50czogc2cuTnVtYmVyUGFpcixcbiAgc2NhbGVGYWN0b3I6IG51bWJlcixcbiAgc2NhbGU/OiBudW1iZXJcbik6IHZvaWQgPT4ge1xuICBlbC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKCR7cGVyY2VudHNbMF0gKiBzY2FsZUZhY3Rvcn0lLCR7cGVyY2VudHNbMV0gKiBzY2FsZUZhY3Rvcn0lKSBzY2FsZSgke1xuICAgIHNjYWxlIHx8IHNjYWxlRmFjdG9yXG4gIH0pYDtcbn07XG5cbmV4cG9ydCBjb25zdCBzZXREaXNwbGF5ID0gKGVsOiBIVE1MRWxlbWVudCwgdjogYm9vbGVhbik6IHZvaWQgPT4ge1xuICBlbC5zdHlsZS5kaXNwbGF5ID0gdiA/ICcnIDogJ25vbmUnO1xufTtcblxuZXhwb3J0IGNvbnN0IGV2ZW50UG9zaXRpb24gPSAoZTogc2cuTW91Y2hFdmVudCk6IHNnLk51bWJlclBhaXIgfCB1bmRlZmluZWQgPT4ge1xuICBpZiAoZS5jbGllbnRYIHx8IGUuY2xpZW50WCA9PT0gMCkgcmV0dXJuIFtlLmNsaWVudFgsIGUuY2xpZW50WSFdO1xuICBpZiAoZS50YXJnZXRUb3VjaGVzPy5bMF0pIHJldHVybiBbZS50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFgsIGUudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRZXTtcbiAgcmV0dXJuOyAvLyB0b3VjaGVuZCBoYXMgbm8gcG9zaXRpb24hXG59O1xuXG5leHBvcnQgY29uc3QgaXNSaWdodEJ1dHRvbiA9IChlOiBzZy5Nb3VjaEV2ZW50KTogYm9vbGVhbiA9PiBlLmJ1dHRvbnMgPT09IDIgfHwgZS5idXR0b24gPT09IDI7XG5cbmV4cG9ydCBjb25zdCBpc01pZGRsZUJ1dHRvbiA9IChlOiBzZy5Nb3VjaEV2ZW50KTogYm9vbGVhbiA9PiBlLmJ1dHRvbnMgPT09IDQgfHwgZS5idXR0b24gPT09IDE7XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVFbCA9ICh0YWdOYW1lOiBzdHJpbmcsIGNsYXNzTmFtZT86IHN0cmluZyk6IEhUTUxFbGVtZW50ID0+IHtcbiAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xuICBpZiAoY2xhc3NOYW1lKSBlbC5jbGFzc05hbWUgPSBjbGFzc05hbWU7XG4gIHJldHVybiBlbDtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBwaWVjZU5hbWVPZihwaWVjZTogc2cuUGllY2UpOiBzZy5QaWVjZU5hbWUge1xuICByZXR1cm4gYCR7cGllY2UuY29sb3J9ICR7cGllY2Uucm9sZX1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VQaWVjZU5hbWUocGllY2VOYW1lOiBzZy5QaWVjZU5hbWUpOiBzZy5QaWVjZSB7XG4gIGNvbnN0IHNwbGl0dGVkID0gcGllY2VOYW1lLnNwbGl0KCcgJywgMik7XG4gIHJldHVybiB7IGNvbG9yOiBzcGxpdHRlZFswXSBhcyBzZy5Db2xvciwgcm9sZTogc3BsaXR0ZWRbMV0gfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUGllY2VOb2RlKGVsOiBIVE1MRWxlbWVudCk6IGVsIGlzIHNnLlBpZWNlTm9kZSB7XG4gIHJldHVybiBlbC50YWdOYW1lID09PSAnUElFQ0UnO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzU3F1YXJlTm9kZShlbDogSFRNTEVsZW1lbnQpOiBlbCBpcyBzZy5TcXVhcmVOb2RlIHtcbiAgcmV0dXJuIGVsLnRhZ05hbWUgPT09ICdTUSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlU3F1YXJlQ2VudGVyKFxuICBrZXk6IHNnLktleSxcbiAgYXNTZW50ZTogYm9vbGVhbixcbiAgZGltczogc2cuRGltZW5zaW9ucyxcbiAgYm91bmRzOiBET01SZWN0XG4pOiBzZy5OdW1iZXJQYWlyIHtcbiAgY29uc3QgcG9zID0ga2V5MnBvcyhrZXkpO1xuICBpZiAoYXNTZW50ZSkge1xuICAgIHBvc1swXSA9IGRpbXMuZmlsZXMgLSAxIC0gcG9zWzBdO1xuICAgIHBvc1sxXSA9IGRpbXMucmFua3MgLSAxIC0gcG9zWzFdO1xuICB9XG4gIHJldHVybiBbXG4gICAgYm91bmRzLmxlZnQgKyAoYm91bmRzLndpZHRoICogcG9zWzBdKSAvIGRpbXMuZmlsZXMgKyBib3VuZHMud2lkdGggLyAoZGltcy5maWxlcyAqIDIpLFxuICAgIGJvdW5kcy50b3AgK1xuICAgICAgKGJvdW5kcy5oZWlnaHQgKiAoZGltcy5yYW5rcyAtIDEgLSBwb3NbMV0pKSAvIGRpbXMucmFua3MgK1xuICAgICAgYm91bmRzLmhlaWdodCAvIChkaW1zLnJhbmtzICogMiksXG4gIF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkb21TcXVhcmVJbmRleE9mS2V5KGtleTogc2cuS2V5LCBhc1NlbnRlOiBib29sZWFuLCBkaW1zOiBzZy5EaW1lbnNpb25zKTogbnVtYmVyIHtcbiAgY29uc3QgcG9zID0ga2V5MnBvcyhrZXkpO1xuICBsZXQgaW5kZXggPSBkaW1zLmZpbGVzIC0gMSAtIHBvc1swXSArIHBvc1sxXSAqIGRpbXMuZmlsZXM7XG4gIGlmICghYXNTZW50ZSkgaW5kZXggPSBkaW1zLmZpbGVzICogZGltcy5yYW5rcyAtIDEgLSBpbmRleDtcblxuICByZXR1cm4gaW5kZXg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0luc2lkZVJlY3QocmVjdDogRE9NUmVjdCwgcG9zOiBzZy5OdW1iZXJQYWlyKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgcmVjdC5sZWZ0IDw9IHBvc1swXSAmJlxuICAgIHJlY3QudG9wIDw9IHBvc1sxXSAmJlxuICAgIHJlY3QubGVmdCArIHJlY3Qud2lkdGggPiBwb3NbMF0gJiZcbiAgICByZWN0LnRvcCArIHJlY3QuaGVpZ2h0ID4gcG9zWzFdXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRLZXlBdERvbVBvcyhcbiAgcG9zOiBzZy5OdW1iZXJQYWlyLFxuICBhc1NlbnRlOiBib29sZWFuLFxuICBkaW1zOiBzZy5EaW1lbnNpb25zLFxuICBib3VuZHM6IERPTVJlY3Rcbik6IHNnLktleSB8IHVuZGVmaW5lZCB7XG4gIGxldCBmaWxlID0gTWF0aC5mbG9vcigoZGltcy5maWxlcyAqIChwb3NbMF0gLSBib3VuZHMubGVmdCkpIC8gYm91bmRzLndpZHRoKTtcbiAgaWYgKGFzU2VudGUpIGZpbGUgPSBkaW1zLmZpbGVzIC0gMSAtIGZpbGU7XG4gIGxldCByYW5rID0gTWF0aC5mbG9vcigoZGltcy5yYW5rcyAqIChwb3NbMV0gLSBib3VuZHMudG9wKSkgLyBib3VuZHMuaGVpZ2h0KTtcbiAgaWYgKCFhc1NlbnRlKSByYW5rID0gZGltcy5yYW5rcyAtIDEgLSByYW5rO1xuICByZXR1cm4gZmlsZSA+PSAwICYmIGZpbGUgPCBkaW1zLmZpbGVzICYmIHJhbmsgPj0gMCAmJiByYW5rIDwgZGltcy5yYW5rc1xuICAgID8gcG9zMmtleShbZmlsZSwgcmFua10pXG4gICAgOiB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRIYW5kUGllY2VBdERvbVBvcyhcbiAgcG9zOiBzZy5OdW1iZXJQYWlyLFxuICByb2xlczogc2cuUm9sZVN0cmluZ1tdLFxuICBib3VuZHM6IE1hcDxzZy5QaWVjZU5hbWUsIERPTVJlY3Q+XG4pOiBzZy5QaWVjZSB8IHVuZGVmaW5lZCB7XG4gIGZvciAoY29uc3QgY29sb3Igb2YgY29sb3JzKSB7XG4gICAgZm9yIChjb25zdCByb2xlIG9mIHJvbGVzKSB7XG4gICAgICBjb25zdCBwaWVjZSA9IHsgY29sb3IsIHJvbGUgfSxcbiAgICAgICAgcGllY2VSZWN0ID0gYm91bmRzLmdldChwaWVjZU5hbWVPZihwaWVjZSkpO1xuICAgICAgaWYgKHBpZWNlUmVjdCAmJiBpc0luc2lkZVJlY3QocGllY2VSZWN0LCBwb3MpKSByZXR1cm4gcGllY2U7XG4gICAgfVxuICB9XG4gIHJldHVybjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBvc09mT3V0c2lkZUVsKFxuICBsZWZ0OiBudW1iZXIsXG4gIHRvcDogbnVtYmVyLFxuICBhc1NlbnRlOiBib29sZWFuLFxuICBkaW1zOiBzZy5EaW1lbnNpb25zLFxuICBib2FyZEJvdW5kczogRE9NUmVjdFxuKTogc2cuUG9zIHwgdW5kZWZpbmVkIHtcbiAgY29uc3Qgc3FXID0gYm9hcmRCb3VuZHMud2lkdGggLyBkaW1zLmZpbGVzLFxuICAgIHNxSCA9IGJvYXJkQm91bmRzLmhlaWdodCAvIGRpbXMucmFua3M7XG4gIGlmICghc3FXIHx8ICFzcUgpIHJldHVybjtcbiAgbGV0IHhPZmYgPSAobGVmdCAtIGJvYXJkQm91bmRzLmxlZnQpIC8gc3FXO1xuICBpZiAoYXNTZW50ZSkgeE9mZiA9IGRpbXMuZmlsZXMgLSAxIC0geE9mZjtcbiAgbGV0IHlPZmYgPSAodG9wIC0gYm9hcmRCb3VuZHMudG9wKSAvIHNxSDtcbiAgaWYgKCFhc1NlbnRlKSB5T2ZmID0gZGltcy5yYW5rcyAtIDEgLSB5T2ZmO1xuICByZXR1cm4gW3hPZmYsIHlPZmZdO1xufVxuIiwgImltcG9ydCB0eXBlIHsgSGVhZGxlc3NTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IHNhbWVQaWVjZSB9IGZyb20gJy4vdXRpbC5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRUb0hhbmQoczogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBjbnQgPSAxKTogdm9pZCB7XG4gIGNvbnN0IGhhbmQgPSBzLmhhbmRzLmhhbmRNYXAuZ2V0KHBpZWNlLmNvbG9yKSxcbiAgICByb2xlID1cbiAgICAgIChzLmhhbmRzLnJvbGVzLmluY2x1ZGVzKHBpZWNlLnJvbGUpID8gcGllY2Uucm9sZSA6IHMucHJvbW90aW9uLnVucHJvbW90ZXNUbyhwaWVjZS5yb2xlKSkgfHxcbiAgICAgIHBpZWNlLnJvbGU7XG4gIGlmIChoYW5kICYmIHMuaGFuZHMucm9sZXMuaW5jbHVkZXMocm9sZSkpIGhhbmQuc2V0KHJvbGUsIChoYW5kLmdldChyb2xlKSB8fCAwKSArIGNudCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVGcm9tSGFuZChzOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGNudCA9IDEpOiB2b2lkIHtcbiAgY29uc3QgaGFuZCA9IHMuaGFuZHMuaGFuZE1hcC5nZXQocGllY2UuY29sb3IpLFxuICAgIHJvbGUgPVxuICAgICAgKHMuaGFuZHMucm9sZXMuaW5jbHVkZXMocGllY2Uucm9sZSkgPyBwaWVjZS5yb2xlIDogcy5wcm9tb3Rpb24udW5wcm9tb3Rlc1RvKHBpZWNlLnJvbGUpKSB8fFxuICAgICAgcGllY2Uucm9sZSxcbiAgICBudW0gPSBoYW5kPy5nZXQocm9sZSk7XG4gIGlmIChoYW5kICYmIG51bSkgaGFuZC5zZXQocm9sZSwgTWF0aC5tYXgobnVtIC0gY250LCAwKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJIYW5kKHM6IEhlYWRsZXNzU3RhdGUsIGhhbmRFbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgaGFuZEVsLmNsYXNzTGlzdC50b2dnbGUoJ3Byb21vdGlvbicsICEhcy5wcm9tb3Rpb24uY3VycmVudCk7XG4gIGxldCB3cmFwRWwgPSBoYW5kRWwuZmlyc3RFbGVtZW50Q2hpbGQgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIHdoaWxlICh3cmFwRWwpIHtcbiAgICBjb25zdCBwaWVjZUVsID0gd3JhcEVsLmZpcnN0RWxlbWVudENoaWxkIGFzIHNnLlBpZWNlTm9kZSxcbiAgICAgIHBpZWNlID0geyByb2xlOiBwaWVjZUVsLnNnUm9sZSwgY29sb3I6IHBpZWNlRWwuc2dDb2xvciB9LFxuICAgICAgbnVtID0gcy5oYW5kcy5oYW5kTWFwLmdldChwaWVjZS5jb2xvcik/LmdldChwaWVjZS5yb2xlKSB8fCAwLFxuICAgICAgaXNTZWxlY3RlZCA9ICEhcy5zZWxlY3RlZFBpZWNlICYmIHNhbWVQaWVjZShwaWVjZSwgcy5zZWxlY3RlZFBpZWNlKSAmJiAhcy5kcm9wcGFibGUuc3BhcmU7XG5cbiAgICB3cmFwRWwuY2xhc3NMaXN0LnRvZ2dsZShcbiAgICAgICdzZWxlY3RlZCcsXG4gICAgICAocy5hY3RpdmVDb2xvciA9PT0gJ2JvdGgnIHx8IHMuYWN0aXZlQ29sb3IgPT09IHMudHVybkNvbG9yKSAmJiBpc1NlbGVjdGVkXG4gICAgKTtcbiAgICB3cmFwRWwuY2xhc3NMaXN0LnRvZ2dsZShcbiAgICAgICdwcmVzZWxlY3RlZCcsXG4gICAgICBzLmFjdGl2ZUNvbG9yICE9PSAnYm90aCcgJiYgcy5hY3RpdmVDb2xvciAhPT0gcy50dXJuQ29sb3IgJiYgaXNTZWxlY3RlZFxuICAgICk7XG4gICAgd3JhcEVsLmNsYXNzTGlzdC50b2dnbGUoJ2RyYXdpbmcnLCAhIXMuZHJhd2FibGUucGllY2UgJiYgc2FtZVBpZWNlKHMuZHJhd2FibGUucGllY2UsIHBpZWNlKSk7XG4gICAgd3JhcEVsLmNsYXNzTGlzdC50b2dnbGUoXG4gICAgICAnY3VycmVudC1wcmUnLFxuICAgICAgISFzLnByZWRyb3BwYWJsZS5jdXJyZW50ICYmIHNhbWVQaWVjZShzLnByZWRyb3BwYWJsZS5jdXJyZW50LnBpZWNlLCBwaWVjZSlcbiAgICApO1xuICAgIHdyYXBFbC5kYXRhc2V0Lm5iID0gbnVtLnRvU3RyaW5nKCk7XG4gICAgd3JhcEVsID0gd3JhcEVsLm5leHRFbGVtZW50U2libGluZyBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgfVxufVxuIiwgImltcG9ydCB0eXBlIHsgSGVhZGxlc3NTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IGNhbGxVc2VyRnVuY3Rpb24sIG9wcG9zaXRlLCBwaWVjZU5hbWVPZiwgc2FtZVBpZWNlIH0gZnJvbSAnLi91dGlsLmpzJztcbmltcG9ydCB7IGFkZFRvSGFuZCwgcmVtb3ZlRnJvbUhhbmQgfSBmcm9tICcuL2hhbmRzLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIHRvZ2dsZU9yaWVudGF0aW9uKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIHN0YXRlLm9yaWVudGF0aW9uID0gb3Bwb3NpdGUoc3RhdGUub3JpZW50YXRpb24pO1xuICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9XG4gICAgc3RhdGUuZHJhZ2dhYmxlLmN1cnJlbnQgPVxuICAgIHN0YXRlLnByb21vdGlvbi5jdXJyZW50ID1cbiAgICBzdGF0ZS5ob3ZlcmVkID1cbiAgICBzdGF0ZS5zZWxlY3RlZCA9XG4gICAgc3RhdGUuc2VsZWN0ZWRQaWVjZSA9XG4gICAgICB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldChzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICB1bnNlbGVjdChzdGF0ZSk7XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIGNhbmNlbFByb21vdGlvbihzdGF0ZSk7XG4gIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0gc3RhdGUuZHJhZ2dhYmxlLmN1cnJlbnQgPSBzdGF0ZS5ob3ZlcmVkID0gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0UGllY2VzKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZXM6IHNnLlBpZWNlc0RpZmYpOiB2b2lkIHtcbiAgZm9yIChjb25zdCBba2V5LCBwaWVjZV0gb2YgcGllY2VzKSB7XG4gICAgaWYgKHBpZWNlKSBzdGF0ZS5waWVjZXMuc2V0KGtleSwgcGllY2UpO1xuICAgIGVsc2Ugc3RhdGUucGllY2VzLmRlbGV0ZShrZXkpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRDaGVja3Moc3RhdGU6IEhlYWRsZXNzU3RhdGUsIGNoZWNrc1ZhbHVlOiBzZy5LZXlbXSB8IHNnLkNvbG9yIHwgYm9vbGVhbik6IHZvaWQge1xuICBpZiAoQXJyYXkuaXNBcnJheShjaGVja3NWYWx1ZSkpIHtcbiAgICBzdGF0ZS5jaGVja3MgPSBjaGVja3NWYWx1ZTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoY2hlY2tzVmFsdWUgPT09IHRydWUpIGNoZWNrc1ZhbHVlID0gc3RhdGUudHVybkNvbG9yO1xuICAgIGlmIChjaGVja3NWYWx1ZSkge1xuICAgICAgY29uc3QgY2hlY2tzOiBzZy5LZXlbXSA9IFtdO1xuICAgICAgZm9yIChjb25zdCBbaywgcF0gb2Ygc3RhdGUucGllY2VzKSB7XG4gICAgICAgIGlmIChzdGF0ZS5oaWdobGlnaHQuY2hlY2tSb2xlcy5pbmNsdWRlcyhwLnJvbGUpICYmIHAuY29sb3IgPT09IGNoZWNrc1ZhbHVlKSBjaGVja3MucHVzaChrKTtcbiAgICAgIH1cbiAgICAgIHN0YXRlLmNoZWNrcyA9IGNoZWNrcztcbiAgICB9IGVsc2Ugc3RhdGUuY2hlY2tzID0gdW5kZWZpbmVkO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNldFByZW1vdmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tOiBib29sZWFuKTogdm9pZCB7XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIHN0YXRlLnByZW1vdmFibGUuY3VycmVudCA9IHsgb3JpZywgZGVzdCwgcHJvbSB9O1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByZW1vdmFibGUuZXZlbnRzLnNldCwgb3JpZywgZGVzdCwgcHJvbSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnNldFByZW1vdmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLnByZW1vdmFibGUuY3VycmVudCkge1xuICAgIHN0YXRlLnByZW1vdmFibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByZW1vdmFibGUuZXZlbnRzLnVuc2V0KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzZXRQcmVkcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tOiBib29sZWFuKTogdm9pZCB7XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50ID0geyBwaWVjZSwga2V5LCBwcm9tIH07XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJlZHJvcHBhYmxlLmV2ZW50cy5zZXQsIHBpZWNlLCBrZXksIHByb20pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5zZXRQcmVkcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCkge1xuICAgIHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJlZHJvcHBhYmxlLmV2ZW50cy51bnNldCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2VNb3ZlKFxuICBzdGF0ZTogSGVhZGxlc3NTdGF0ZSxcbiAgb3JpZzogc2cuS2V5LFxuICBkZXN0OiBzZy5LZXksXG4gIHByb206IGJvb2xlYW5cbik6IHNnLlBpZWNlIHwgYm9vbGVhbiB7XG4gIGNvbnN0IG9yaWdQaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQob3JpZyksXG4gICAgZGVzdFBpZWNlID0gc3RhdGUucGllY2VzLmdldChkZXN0KTtcbiAgaWYgKG9yaWcgPT09IGRlc3QgfHwgIW9yaWdQaWVjZSkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBjYXB0dXJlZCA9IGRlc3RQaWVjZSAmJiBkZXN0UGllY2UuY29sb3IgIT09IG9yaWdQaWVjZS5jb2xvciA/IGRlc3RQaWVjZSA6IHVuZGVmaW5lZCxcbiAgICBwcm9tUGllY2UgPSBwcm9tICYmIHByb21vdGVQaWVjZShzdGF0ZSwgb3JpZ1BpZWNlKTtcbiAgaWYgKGRlc3QgPT09IHN0YXRlLnNlbGVjdGVkIHx8IG9yaWcgPT09IHN0YXRlLnNlbGVjdGVkKSB1bnNlbGVjdChzdGF0ZSk7XG4gIHN0YXRlLnBpZWNlcy5zZXQoZGVzdCwgcHJvbVBpZWNlIHx8IG9yaWdQaWVjZSk7XG4gIHN0YXRlLnBpZWNlcy5kZWxldGUob3JpZyk7XG4gIHN0YXRlLmxhc3REZXN0cyA9IFtvcmlnLCBkZXN0XTtcbiAgc3RhdGUuY2hlY2tzID0gdW5kZWZpbmVkO1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5tb3ZlLCBvcmlnLCBkZXN0LCBwcm9tLCBjYXB0dXJlZCk7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG4gIHJldHVybiBjYXB0dXJlZCB8fCB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFzZURyb3AoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBwaWVjZTogc2cuUGllY2UsXG4gIGtleTogc2cuS2V5LFxuICBwcm9tOiBib29sZWFuXG4pOiBib29sZWFuIHtcbiAgY29uc3QgcGllY2VDb3VudCA9IHN0YXRlLmhhbmRzLmhhbmRNYXAuZ2V0KHBpZWNlLmNvbG9yKT8uZ2V0KHBpZWNlLnJvbGUpIHx8IDA7XG4gIGlmICghcGllY2VDb3VudCAmJiAhc3RhdGUuZHJvcHBhYmxlLnNwYXJlKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IHByb21QaWVjZSA9IHByb20gJiYgcHJvbW90ZVBpZWNlKHN0YXRlLCBwaWVjZSk7XG4gIGlmIChcbiAgICBrZXkgPT09IHN0YXRlLnNlbGVjdGVkIHx8XG4gICAgKCFzdGF0ZS5kcm9wcGFibGUuc3BhcmUgJiZcbiAgICAgIHBpZWNlQ291bnQgPT09IDEgJiZcbiAgICAgIHN0YXRlLnNlbGVjdGVkUGllY2UgJiZcbiAgICAgIHNhbWVQaWVjZShzdGF0ZS5zZWxlY3RlZFBpZWNlLCBwaWVjZSkpXG4gIClcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gIHN0YXRlLnBpZWNlcy5zZXQoa2V5LCBwcm9tUGllY2UgfHwgcGllY2UpO1xuICBzdGF0ZS5sYXN0RGVzdHMgPSBba2V5XTtcbiAgc3RhdGUuY2hlY2tzID0gdW5kZWZpbmVkO1xuICBpZiAoIXN0YXRlLmRyb3BwYWJsZS5zcGFyZSkgcmVtb3ZlRnJvbUhhbmQoc3RhdGUsIHBpZWNlKTtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuZHJvcCwgcGllY2UsIGtleSwgcHJvbSk7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBiYXNlVXNlck1vdmUoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBvcmlnOiBzZy5LZXksXG4gIGRlc3Q6IHNnLktleSxcbiAgcHJvbTogYm9vbGVhblxuKTogc2cuUGllY2UgfCBib29sZWFuIHtcbiAgY29uc3QgcmVzdWx0ID0gYmFzZU1vdmUoc3RhdGUsIG9yaWcsIGRlc3QsIHByb20pO1xuICBpZiAocmVzdWx0KSB7XG4gICAgc3RhdGUubW92YWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kcm9wcGFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUudHVybkNvbG9yID0gb3Bwb3NpdGUoc3RhdGUudHVybkNvbG9yKTtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBiYXNlVXNlckRyb3Aoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb206IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgY29uc3QgcmVzdWx0ID0gYmFzZURyb3Aoc3RhdGUsIHBpZWNlLCBrZXksIHByb20pO1xuICBpZiAocmVzdWx0KSB7XG4gICAgc3RhdGUubW92YWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kcm9wcGFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUudHVybkNvbG9yID0gb3Bwb3NpdGUoc3RhdGUudHVybkNvbG9yKTtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlckRyb3AoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBwaWVjZTogc2cuUGllY2UsXG4gIGtleTogc2cuS2V5LFxuICBwcm9tPzogYm9vbGVhblxuKTogYm9vbGVhbiB7XG4gIGNvbnN0IHJlYWxQcm9tID0gcHJvbSB8fCBzdGF0ZS5wcm9tb3Rpb24uZm9yY2VEcm9wUHJvbW90aW9uKHBpZWNlLCBrZXkpO1xuICBpZiAoY2FuRHJvcChzdGF0ZSwgcGllY2UsIGtleSkpIHtcbiAgICBjb25zdCByZXN1bHQgPSBiYXNlVXNlckRyb3Aoc3RhdGUsIHBpZWNlLCBrZXksIHJlYWxQcm9tKTtcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmRyb3BwYWJsZS5ldmVudHMuYWZ0ZXIsIHBpZWNlLCBrZXksIHJlYWxQcm9tLCB7XG4gICAgICAgIHByZW1hZGU6IGZhbHNlLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoY2FuUHJlZHJvcChzdGF0ZSwgcGllY2UsIGtleSkpIHtcbiAgICBzZXRQcmVkcm9wKHN0YXRlLCBwaWVjZSwga2V5LCByZWFsUHJvbSk7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlck1vdmUoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBvcmlnOiBzZy5LZXksXG4gIGRlc3Q6IHNnLktleSxcbiAgcHJvbT86IGJvb2xlYW5cbik6IGJvb2xlYW4ge1xuICBjb25zdCByZWFsUHJvbSA9IHByb20gfHwgc3RhdGUucHJvbW90aW9uLmZvcmNlTW92ZVByb21vdGlvbihvcmlnLCBkZXN0KTtcbiAgaWYgKGNhbk1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYmFzZVVzZXJNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0LCByZWFsUHJvbSk7XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgICAgY29uc3QgbWV0YWRhdGE6IHNnLk1vdmVNZXRhZGF0YSA9IHtcbiAgICAgICAgcHJlbWFkZTogZmFsc2UsXG4gICAgICB9O1xuICAgICAgaWYgKHJlc3VsdCAhPT0gdHJ1ZSkgbWV0YWRhdGEuY2FwdHVyZWQgPSByZXN1bHQ7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLm1vdmFibGUuZXZlbnRzLmFmdGVyLCBvcmlnLCBkZXN0LCByZWFsUHJvbSwgbWV0YWRhdGEpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9IGVsc2UgaWYgKGNhblByZW1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpKSB7XG4gICAgc2V0UHJlbW92ZShzdGF0ZSwgb3JpZywgZGVzdCwgcmVhbFByb20pO1xuICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB1bnNlbGVjdChzdGF0ZSk7XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2VQcm9tb3Rpb25EaWFsb2coc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgY29uc3QgcHJvbW90ZWRQaWVjZSA9IHByb21vdGVQaWVjZShzdGF0ZSwgcGllY2UpO1xuICBpZiAoc3RhdGUudmlld09ubHkgfHwgc3RhdGUucHJvbW90aW9uLmN1cnJlbnQgfHwgIXByb21vdGVkUGllY2UpIHJldHVybiBmYWxzZTtcblxuICBzdGF0ZS5wcm9tb3Rpb24uY3VycmVudCA9IHtcbiAgICBwaWVjZSxcbiAgICBwcm9tb3RlZFBpZWNlLFxuICAgIGtleSxcbiAgICBkcmFnZ2VkOiAhIXN0YXRlLmRyYWdnYWJsZS5jdXJyZW50LFxuICB9O1xuICBzdGF0ZS5ob3ZlcmVkID0ga2V5O1xuXG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvbW90aW9uRGlhbG9nRHJvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSk6IGJvb2xlYW4ge1xuICBpZiAoXG4gICAgY2FuRHJvcFByb21vdGUoc3RhdGUsIHBpZWNlLCBrZXkpICYmXG4gICAgKGNhbkRyb3Aoc3RhdGUsIHBpZWNlLCBrZXkpIHx8IGNhblByZWRyb3Aoc3RhdGUsIHBpZWNlLCBrZXkpKVxuICApIHtcbiAgICBpZiAoYmFzZVByb21vdGlvbkRpYWxvZyhzdGF0ZSwgcGllY2UsIGtleSkpIHtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJvbW90aW9uLmV2ZW50cy5pbml0aWF0ZWQpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb21vdGlvbkRpYWxvZ01vdmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KTogYm9vbGVhbiB7XG4gIGlmIChcbiAgICBjYW5Nb3ZlUHJvbW90ZShzdGF0ZSwgb3JpZywgZGVzdCkgJiZcbiAgICAoY2FuTW92ZShzdGF0ZSwgb3JpZywgZGVzdCkgfHwgY2FuUHJlbW92ZShzdGF0ZSwgb3JpZywgZGVzdCkpXG4gICkge1xuICAgIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzLmdldChvcmlnKTtcbiAgICBpZiAocGllY2UgJiYgYmFzZVByb21vdGlvbkRpYWxvZyhzdGF0ZSwgcGllY2UsIGRlc3QpKSB7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByb21vdGlvbi5ldmVudHMuaW5pdGlhdGVkKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHByb21vdGVQaWVjZShzOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UpOiBzZy5QaWVjZSB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IHByb21Sb2xlID0gcy5wcm9tb3Rpb24ucHJvbW90ZXNUbyhwaWVjZS5yb2xlKTtcbiAgcmV0dXJuIHByb21Sb2xlICE9PSB1bmRlZmluZWQgPyB7IGNvbG9yOiBwaWVjZS5jb2xvciwgcm9sZTogcHJvbVJvbGUgfSA6IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlbGV0ZVBpZWNlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBrZXk6IHNnLktleSk6IHZvaWQge1xuICBpZiAoc3RhdGUucGllY2VzLmRlbGV0ZShrZXkpKSBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5jaGFuZ2UpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0U3F1YXJlKFxuICBzdGF0ZTogSGVhZGxlc3NTdGF0ZSxcbiAga2V5OiBzZy5LZXksXG4gIHByb20/OiBib29sZWFuLFxuICBmb3JjZT86IGJvb2xlYW5cbik6IHZvaWQge1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5zZWxlY3QsIGtleSk7XG5cbiAgLy8gdW5zZWxlY3QgaWYgc2VsZWN0aW5nIHNlbGVjdGVkIGtleSwga2VlcCBzZWxlY3RlZCBmb3IgZHJhZ1xuICBpZiAoIXN0YXRlLmRyYWdnYWJsZS5lbmFibGVkICYmIHN0YXRlLnNlbGVjdGVkID09PSBrZXkpIHtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy51bnNlbGVjdCwga2V5KTtcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gdHJ5IG1vdmluZy9kcm9wcGluZ1xuICBpZiAoXG4gICAgc3RhdGUuc2VsZWN0YWJsZS5lbmFibGVkIHx8XG4gICAgZm9yY2UgfHxcbiAgICAoc3RhdGUuc2VsZWN0YWJsZS5mb3JjZVNwYXJlcyAmJiBzdGF0ZS5zZWxlY3RlZFBpZWNlICYmIHN0YXRlLmRyb3BwYWJsZS5zcGFyZSlcbiAgKSB7XG4gICAgaWYgKHN0YXRlLnNlbGVjdGVkUGllY2UgJiYgdXNlckRyb3Aoc3RhdGUsIHN0YXRlLnNlbGVjdGVkUGllY2UsIGtleSwgcHJvbSkpIHJldHVybjtcbiAgICBlbHNlIGlmIChzdGF0ZS5zZWxlY3RlZCAmJiB1c2VyTW92ZShzdGF0ZSwgc3RhdGUuc2VsZWN0ZWQsIGtleSwgcHJvbSkpIHJldHVybjtcbiAgfVxuXG4gIGlmIChcbiAgICAoc3RhdGUuc2VsZWN0YWJsZS5lbmFibGVkIHx8IHN0YXRlLmRyYWdnYWJsZS5lbmFibGVkIHx8IGZvcmNlKSAmJlxuICAgIChpc01vdmFibGUoc3RhdGUsIGtleSkgfHwgaXNQcmVtb3ZhYmxlKHN0YXRlLCBrZXkpKVxuICApIHtcbiAgICBzZXRTZWxlY3RlZChzdGF0ZSwga2V5KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0UGllY2UoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBwaWVjZTogc2cuUGllY2UsXG4gIHNwYXJlPzogYm9vbGVhbixcbiAgZm9yY2U/OiBib29sZWFuLFxuICBhcGk/OiBib29sZWFuXG4pOiB2b2lkIHtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMucGllY2VTZWxlY3QsIHBpZWNlKTtcblxuICBpZiAoc3RhdGUuc2VsZWN0YWJsZS5hZGRTcGFyZXNUb0hhbmQgJiYgc3RhdGUuZHJvcHBhYmxlLnNwYXJlICYmIHN0YXRlLnNlbGVjdGVkUGllY2UpIHtcbiAgICBhZGRUb0hhbmQoc3RhdGUsIHsgcm9sZTogc3RhdGUuc2VsZWN0ZWRQaWVjZS5yb2xlLCBjb2xvcjogcGllY2UuY29sb3IgfSk7XG4gICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuY2hhbmdlKTtcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gIH0gZWxzZSBpZiAoXG4gICAgIWFwaSAmJlxuICAgICFzdGF0ZS5kcmFnZ2FibGUuZW5hYmxlZCAmJlxuICAgIHN0YXRlLnNlbGVjdGVkUGllY2UgJiZcbiAgICBzYW1lUGllY2Uoc3RhdGUuc2VsZWN0ZWRQaWVjZSwgcGllY2UpXG4gICkge1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLnBpZWNlVW5zZWxlY3QsIHBpZWNlKTtcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gIH0gZWxzZSBpZiAoXG4gICAgKHN0YXRlLnNlbGVjdGFibGUuZW5hYmxlZCB8fCBzdGF0ZS5kcmFnZ2FibGUuZW5hYmxlZCB8fCBmb3JjZSkgJiZcbiAgICAoaXNEcm9wcGFibGUoc3RhdGUsIHBpZWNlLCAhIXNwYXJlKSB8fCBpc1ByZWRyb3BwYWJsZShzdGF0ZSwgcGllY2UpKVxuICApIHtcbiAgICBzZXRTZWxlY3RlZFBpZWNlKHN0YXRlLCBwaWVjZSk7XG4gICAgc3RhdGUuZHJvcHBhYmxlLnNwYXJlID0gISFzcGFyZTtcbiAgfSBlbHNlIHtcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFNlbGVjdGVkKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBrZXk6IHNnLktleSk6IHZvaWQge1xuICB1bnNlbGVjdChzdGF0ZSk7XG4gIHN0YXRlLnNlbGVjdGVkID0ga2V5O1xuICBzZXRQcmVEZXN0cyhzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRTZWxlY3RlZFBpZWNlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UpOiB2b2lkIHtcbiAgdW5zZWxlY3Qoc3RhdGUpO1xuICBzdGF0ZS5zZWxlY3RlZFBpZWNlID0gcGllY2U7XG4gIHNldFByZURlc3RzKHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFByZURlc3RzKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIHN0YXRlLnByZW1vdmFibGUuZGVzdHMgPSBzdGF0ZS5wcmVkcm9wcGFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG5cbiAgaWYgKHN0YXRlLnNlbGVjdGVkICYmIGlzUHJlbW92YWJsZShzdGF0ZSwgc3RhdGUuc2VsZWN0ZWQpICYmIHN0YXRlLnByZW1vdmFibGUuZ2VuZXJhdGUpXG4gICAgc3RhdGUucHJlbW92YWJsZS5kZXN0cyA9IHN0YXRlLnByZW1vdmFibGUuZ2VuZXJhdGUoc3RhdGUuc2VsZWN0ZWQsIHN0YXRlLnBpZWNlcyk7XG4gIGVsc2UgaWYgKFxuICAgIHN0YXRlLnNlbGVjdGVkUGllY2UgJiZcbiAgICBpc1ByZWRyb3BwYWJsZShzdGF0ZSwgc3RhdGUuc2VsZWN0ZWRQaWVjZSkgJiZcbiAgICBzdGF0ZS5wcmVkcm9wcGFibGUuZ2VuZXJhdGVcbiAgKVxuICAgIHN0YXRlLnByZWRyb3BwYWJsZS5kZXN0cyA9IHN0YXRlLnByZWRyb3BwYWJsZS5nZW5lcmF0ZShzdGF0ZS5zZWxlY3RlZFBpZWNlLCBzdGF0ZS5waWVjZXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5zZWxlY3Qoc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiB2b2lkIHtcbiAgc3RhdGUuc2VsZWN0ZWQgPVxuICAgIHN0YXRlLnNlbGVjdGVkUGllY2UgPVxuICAgIHN0YXRlLnByZW1vdmFibGUuZGVzdHMgPVxuICAgIHN0YXRlLnByZWRyb3BwYWJsZS5kZXN0cyA9XG4gICAgc3RhdGUucHJvbW90aW9uLmN1cnJlbnQgPVxuICAgICAgdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBpc01vdmFibGUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQob3JpZyk7XG4gIHJldHVybiAoXG4gICAgISFwaWVjZSAmJlxuICAgIChzdGF0ZS5hY3RpdmVDb2xvciA9PT0gJ2JvdGgnIHx8XG4gICAgICAoc3RhdGUuYWN0aXZlQ29sb3IgPT09IHBpZWNlLmNvbG9yICYmIHN0YXRlLnR1cm5Db2xvciA9PT0gcGllY2UuY29sb3IpKVxuICApO1xufVxuXG5mdW5jdGlvbiBpc0Ryb3BwYWJsZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBzcGFyZTogYm9vbGVhbik6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIChzcGFyZSB8fCAhIXN0YXRlLmhhbmRzLmhhbmRNYXAuZ2V0KHBpZWNlLmNvbG9yKT8uZ2V0KHBpZWNlLnJvbGUpKSAmJlxuICAgIChzdGF0ZS5hY3RpdmVDb2xvciA9PT0gJ2JvdGgnIHx8XG4gICAgICAoc3RhdGUuYWN0aXZlQ29sb3IgPT09IHBpZWNlLmNvbG9yICYmIHN0YXRlLnR1cm5Db2xvciA9PT0gcGllY2UuY29sb3IpKVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuTW92ZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgb3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBvcmlnICE9PSBkZXN0ICYmXG4gICAgaXNNb3ZhYmxlKHN0YXRlLCBvcmlnKSAmJlxuICAgIChzdGF0ZS5tb3ZhYmxlLmZyZWUgfHwgISFzdGF0ZS5tb3ZhYmxlLmRlc3RzPy5nZXQob3JpZyk/LmluY2x1ZGVzKGRlc3QpKVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuRHJvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBkZXN0OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBpc0Ryb3BwYWJsZShzdGF0ZSwgcGllY2UsIHN0YXRlLmRyb3BwYWJsZS5zcGFyZSkgJiZcbiAgICAoc3RhdGUuZHJvcHBhYmxlLmZyZWUgfHxcbiAgICAgIHN0YXRlLmRyb3BwYWJsZS5zcGFyZSB8fFxuICAgICAgISFzdGF0ZS5kcm9wcGFibGUuZGVzdHM/LmdldChwaWVjZU5hbWVPZihwaWVjZSkpPy5pbmNsdWRlcyhkZXN0KSlcbiAgKTtcbn1cblxuZnVuY3Rpb24gY2FuTW92ZVByb21vdGUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzLmdldChvcmlnKTtcbiAgcmV0dXJuICEhcGllY2UgJiYgc3RhdGUucHJvbW90aW9uLm1vdmVQcm9tb3Rpb25EaWFsb2cob3JpZywgZGVzdCk7XG59XG5cbmZ1bmN0aW9uIGNhbkRyb3BQcm9tb3RlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5KTogYm9vbGVhbiB7XG4gIHJldHVybiAhc3RhdGUuZHJvcHBhYmxlLnNwYXJlICYmIHN0YXRlLnByb21vdGlvbi5kcm9wUHJvbW90aW9uRGlhbG9nKHBpZWNlLCBrZXkpO1xufVxuXG5mdW5jdGlvbiBpc1ByZW1vdmFibGUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQob3JpZyk7XG4gIHJldHVybiAoXG4gICAgISFwaWVjZSAmJlxuICAgIHN0YXRlLnByZW1vdmFibGUuZW5hYmxlZCAmJlxuICAgIHN0YXRlLmFjdGl2ZUNvbG9yID09PSBwaWVjZS5jb2xvciAmJlxuICAgIHN0YXRlLnR1cm5Db2xvciAhPT0gcGllY2UuY29sb3JcbiAgKTtcbn1cblxuZnVuY3Rpb24gaXNQcmVkcm9wcGFibGUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgICEhc3RhdGUuaGFuZHMuaGFuZE1hcC5nZXQocGllY2UuY29sb3IpPy5nZXQocGllY2Uucm9sZSkgJiZcbiAgICBzdGF0ZS5wcmVkcm9wcGFibGUuZW5hYmxlZCAmJlxuICAgIHN0YXRlLmFjdGl2ZUNvbG9yID09PSBwaWVjZS5jb2xvciAmJlxuICAgIHN0YXRlLnR1cm5Db2xvciAhPT0gcGllY2UuY29sb3JcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhblByZW1vdmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgb3JpZyAhPT0gZGVzdCAmJlxuICAgIGlzUHJlbW92YWJsZShzdGF0ZSwgb3JpZykgJiZcbiAgICAhIXN0YXRlLnByZW1vdmFibGUuZ2VuZXJhdGUgJiZcbiAgICBzdGF0ZS5wcmVtb3ZhYmxlLmdlbmVyYXRlKG9yaWcsIHN0YXRlLnBpZWNlcykuaW5jbHVkZXMoZGVzdClcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhblByZWRyb3Aoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwgZGVzdDogc2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IGRlc3RQaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQoZGVzdCk7XG4gIHJldHVybiAoXG4gICAgaXNQcmVkcm9wcGFibGUoc3RhdGUsIHBpZWNlKSAmJlxuICAgICghZGVzdFBpZWNlIHx8IGRlc3RQaWVjZS5jb2xvciAhPT0gc3RhdGUuYWN0aXZlQ29sb3IpICYmXG4gICAgISFzdGF0ZS5wcmVkcm9wcGFibGUuZ2VuZXJhdGUgJiZcbiAgICBzdGF0ZS5wcmVkcm9wcGFibGUuZ2VuZXJhdGUocGllY2UsIHN0YXRlLnBpZWNlcykuaW5jbHVkZXMoZGVzdClcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRHJhZ2dhYmxlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBzdGF0ZS5kcmFnZ2FibGUuZW5hYmxlZCAmJlxuICAgIChzdGF0ZS5hY3RpdmVDb2xvciA9PT0gJ2JvdGgnIHx8XG4gICAgICAoc3RhdGUuYWN0aXZlQ29sb3IgPT09IHBpZWNlLmNvbG9yICYmXG4gICAgICAgIChzdGF0ZS50dXJuQ29sb3IgPT09IHBpZWNlLmNvbG9yIHx8IHN0YXRlLnByZW1vdmFibGUuZW5hYmxlZCkpKVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGxheVByZW1vdmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiBib29sZWFuIHtcbiAgY29uc3QgbW92ZSA9IHN0YXRlLnByZW1vdmFibGUuY3VycmVudDtcbiAgaWYgKCFtb3ZlKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IG9yaWcgPSBtb3ZlLm9yaWcsXG4gICAgZGVzdCA9IG1vdmUuZGVzdCxcbiAgICBwcm9tID0gbW92ZS5wcm9tO1xuICBsZXQgc3VjY2VzcyA9IGZhbHNlO1xuICBpZiAoY2FuTW92ZShzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICBjb25zdCByZXN1bHQgPSBiYXNlVXNlck1vdmUoc3RhdGUsIG9yaWcsIGRlc3QsIHByb20pO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIGNvbnN0IG1ldGFkYXRhOiBzZy5Nb3ZlTWV0YWRhdGEgPSB7IHByZW1hZGU6IHRydWUgfTtcbiAgICAgIGlmIChyZXN1bHQgIT09IHRydWUpIG1ldGFkYXRhLmNhcHR1cmVkID0gcmVzdWx0O1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5tb3ZhYmxlLmV2ZW50cy5hZnRlciwgb3JpZywgZGVzdCwgcHJvbSwgbWV0YWRhdGEpO1xuICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgfVxuICB9XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHJldHVybiBzdWNjZXNzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGxheVByZWRyb3Aoc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiBib29sZWFuIHtcbiAgY29uc3QgZHJvcCA9IHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50O1xuICBpZiAoIWRyb3ApIHJldHVybiBmYWxzZTtcbiAgY29uc3QgcGllY2UgPSBkcm9wLnBpZWNlLFxuICAgIGtleSA9IGRyb3Aua2V5LFxuICAgIHByb20gPSBkcm9wLnByb207XG4gIGxldCBzdWNjZXNzID0gZmFsc2U7XG4gIGlmIChjYW5Ecm9wKHN0YXRlLCBwaWVjZSwga2V5KSkge1xuICAgIGlmIChiYXNlVXNlckRyb3Aoc3RhdGUsIHBpZWNlLCBrZXksIHByb20pKSB7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmRyb3BwYWJsZS5ldmVudHMuYWZ0ZXIsIHBpZWNlLCBrZXksIHByb20sIHtcbiAgICAgICAgcHJlbWFkZTogdHJ1ZSxcbiAgICAgIH0pO1xuICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgfVxuICB9XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIHJldHVybiBzdWNjZXNzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsTW92ZU9yRHJvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICB1bnNldFByZWRyb3Aoc3RhdGUpO1xuICB1bnNlbGVjdChzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWxQcm9tb3Rpb24oc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiB2b2lkIHtcbiAgaWYgKCFzdGF0ZS5wcm9tb3Rpb24uY3VycmVudCkgcmV0dXJuO1xuXG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgc3RhdGUucHJvbW90aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIHN0YXRlLmhvdmVyZWQgPSB1bmRlZmluZWQ7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJvbW90aW9uLmV2ZW50cy5jYW5jZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICBzdGF0ZS5hY3RpdmVDb2xvciA9XG4gICAgc3RhdGUubW92YWJsZS5kZXN0cyA9XG4gICAgc3RhdGUuZHJvcHBhYmxlLmRlc3RzID1cbiAgICBzdGF0ZS5kcmFnZ2FibGUuY3VycmVudCA9XG4gICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPVxuICAgIHN0YXRlLnByb21vdGlvbi5jdXJyZW50ID1cbiAgICBzdGF0ZS5ob3ZlcmVkID1cbiAgICAgIHVuZGVmaW5lZDtcbiAgY2FuY2VsTW92ZU9yRHJvcChzdGF0ZSk7XG59XG4iLCAiaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IGZpbGVzLCByYW5rcyB9IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IHBvczJrZXkgfSBmcm9tICcuL3V0aWwuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gaW5mZXJEaW1lbnNpb25zKGJvYXJkU2Zlbjogc2cuQm9hcmRTZmVuKTogc2cuRGltZW5zaW9ucyB7XG4gIGNvbnN0IHJhbmtzID0gYm9hcmRTZmVuLnNwbGl0KCcvJyksXG4gICAgZmlyc3RGaWxlID0gcmFua3NbMF0uc3BsaXQoJycpO1xuICBsZXQgZmlsZXNDbnQgPSAwLFxuICAgIGNudCA9IDA7XG4gIGZvciAoY29uc3QgYyBvZiBmaXJzdEZpbGUpIHtcbiAgICBjb25zdCBuYiA9IGMuY2hhckNvZGVBdCgwKTtcbiAgICBpZiAobmIgPCA1OCAmJiBuYiA+IDQ3KSBjbnQgPSBjbnQgKiAxMCArIG5iIC0gNDg7XG4gICAgZWxzZSBpZiAoYyAhPT0gJysnKSB7XG4gICAgICBmaWxlc0NudCArPSBjbnQgKyAxO1xuICAgICAgY250ID0gMDtcbiAgICB9XG4gIH1cbiAgZmlsZXNDbnQgKz0gY250O1xuICByZXR1cm4geyBmaWxlczogZmlsZXNDbnQsIHJhbmtzOiByYW5rcy5sZW5ndGggfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNmZW5Ub0JvYXJkKFxuICBzZmVuOiBzZy5Cb2FyZFNmZW4sXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGZyb21Gb3JzeXRoPzogKGZvcnN5dGg6IHN0cmluZykgPT4gc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZFxuKTogc2cuUGllY2VzIHtcbiAgY29uc3Qgc2ZlblBhcnNlciA9IGZyb21Gb3JzeXRoIHx8IHN0YW5kYXJkRnJvbUZvcnN5dGgsXG4gICAgcGllY2VzOiBzZy5QaWVjZXMgPSBuZXcgTWFwKCk7XG4gIGxldCB4ID0gZGltcy5maWxlcyAtIDEsXG4gICAgeSA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2Zlbi5sZW5ndGg7IGkrKykge1xuICAgIHN3aXRjaCAoc2ZlbltpXSkge1xuICAgICAgY2FzZSAnICc6XG4gICAgICBjYXNlICdfJzpcbiAgICAgICAgcmV0dXJuIHBpZWNlcztcbiAgICAgIGNhc2UgJy8nOlxuICAgICAgICArK3k7XG4gICAgICAgIGlmICh5ID4gZGltcy5yYW5rcyAtIDEpIHJldHVybiBwaWVjZXM7XG4gICAgICAgIHggPSBkaW1zLmZpbGVzIC0gMTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIGNvbnN0IG5iMSA9IHNmZW5baV0uY2hhckNvZGVBdCgwKSxcbiAgICAgICAgICBuYjIgPSBzZmVuW2kgKyAxXSAmJiBzZmVuW2kgKyAxXS5jaGFyQ29kZUF0KDApO1xuICAgICAgICBpZiAobmIxIDwgNTggJiYgbmIxID4gNDcpIHtcbiAgICAgICAgICBpZiAobmIyICYmIG5iMiA8IDU4ICYmIG5iMiA+IDQ3KSB7XG4gICAgICAgICAgICB4IC09IChuYjEgLSA0OCkgKiAxMCArIChuYjIgLSA0OCk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgfSBlbHNlIHggLT0gbmIxIC0gNDg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3Qgcm9sZVN0ciA9IHNmZW5baV0gPT09ICcrJyAmJiBzZmVuLmxlbmd0aCA+IGkgKyAxID8gJysnICsgc2ZlblsrK2ldIDogc2ZlbltpXSxcbiAgICAgICAgICAgIHJvbGUgPSBzZmVuUGFyc2VyKHJvbGVTdHIpO1xuICAgICAgICAgIGlmICh4ID49IDAgJiYgcm9sZSkge1xuICAgICAgICAgICAgY29uc3QgY29sb3IgPSByb2xlU3RyID09PSByb2xlU3RyLnRvTG93ZXJDYXNlKCkgPyAnZ290ZScgOiAnc2VudGUnO1xuICAgICAgICAgICAgcGllY2VzLnNldChwb3Mya2V5KFt4LCB5XSksIHtcbiAgICAgICAgICAgICAgcm9sZTogcm9sZSxcbiAgICAgICAgICAgICAgY29sb3I6IGNvbG9yLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC0teDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcGllY2VzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYm9hcmRUb1NmZW4oXG4gIHBpZWNlczogc2cuUGllY2VzLFxuICBkaW1zOiBzZy5EaW1lbnNpb25zLFxuICB0b0ZvcnN5dGg/OiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc3RyaW5nIHwgdW5kZWZpbmVkXG4pOiBzZy5Cb2FyZFNmZW4ge1xuICBjb25zdCBzZmVuUmVuZGVyZXIgPSB0b0ZvcnN5dGggfHwgc3RhbmRhcmRUb0ZvcnN5dGgsXG4gICAgcmV2ZXJzZWRGaWxlcyA9IGZpbGVzLnNsaWNlKDAsIGRpbXMuZmlsZXMpLnJldmVyc2UoKTtcbiAgcmV0dXJuIHJhbmtzXG4gICAgLnNsaWNlKDAsIGRpbXMucmFua3MpXG4gICAgLm1hcCh5ID0+XG4gICAgICByZXZlcnNlZEZpbGVzXG4gICAgICAgIC5tYXAoeCA9PiB7XG4gICAgICAgICAgY29uc3QgcGllY2UgPSBwaWVjZXMuZ2V0KCh4ICsgeSkgYXMgc2cuS2V5KSxcbiAgICAgICAgICAgIGZvcnN5dGggPSBwaWVjZSAmJiBzZmVuUmVuZGVyZXIocGllY2Uucm9sZSk7XG4gICAgICAgICAgaWYgKGZvcnN5dGgpIHtcbiAgICAgICAgICAgIHJldHVybiBwaWVjZS5jb2xvciA9PT0gJ3NlbnRlJyA/IGZvcnN5dGgudG9VcHBlckNhc2UoKSA6IGZvcnN5dGgudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICB9IGVsc2UgcmV0dXJuICcxJztcbiAgICAgICAgfSlcbiAgICAgICAgLmpvaW4oJycpXG4gICAgKVxuICAgIC5qb2luKCcvJylcbiAgICAucmVwbGFjZSgvMXsyLH0vZywgcyA9PiBzLmxlbmd0aC50b1N0cmluZygpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNmZW5Ub0hhbmRzKFxuICBzZmVuOiBzZy5IYW5kc1NmZW4sXG4gIGZyb21Gb3JzeXRoPzogKGZvcnN5dGg6IHN0cmluZykgPT4gc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZFxuKTogc2cuSGFuZHMge1xuICBjb25zdCBzZmVuUGFyc2VyID0gZnJvbUZvcnN5dGggfHwgc3RhbmRhcmRGcm9tRm9yc3l0aCxcbiAgICBzZW50ZTogc2cuSGFuZCA9IG5ldyBNYXAoKSxcbiAgICBnb3RlOiBzZy5IYW5kID0gbmV3IE1hcCgpO1xuXG4gIGxldCB0bXBOdW0gPSAwLFxuICAgIG51bSA9IDE7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2Zlbi5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IG5iID0gc2ZlbltpXS5jaGFyQ29kZUF0KDApO1xuICAgIGlmIChuYiA8IDU4ICYmIG5iID4gNDcpIHtcbiAgICAgIHRtcE51bSA9IHRtcE51bSAqIDEwICsgbmIgLSA0ODtcbiAgICAgIG51bSA9IHRtcE51bTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgcm9sZVN0ciA9IHNmZW5baV0gPT09ICcrJyAmJiBzZmVuLmxlbmd0aCA+IGkgKyAxID8gJysnICsgc2ZlblsrK2ldIDogc2ZlbltpXSxcbiAgICAgICAgcm9sZSA9IHNmZW5QYXJzZXIocm9sZVN0cik7XG4gICAgICBpZiAocm9sZSkge1xuICAgICAgICBjb25zdCBjb2xvciA9IHJvbGVTdHIgPT09IHJvbGVTdHIudG9Mb3dlckNhc2UoKSA/ICdnb3RlJyA6ICdzZW50ZSc7XG4gICAgICAgIGlmIChjb2xvciA9PT0gJ3NlbnRlJykgc2VudGUuc2V0KHJvbGUsIChzZW50ZS5nZXQocm9sZSkgfHwgMCkgKyBudW0pO1xuICAgICAgICBlbHNlIGdvdGUuc2V0KHJvbGUsIChnb3RlLmdldChyb2xlKSB8fCAwKSArIG51bSk7XG4gICAgICB9XG4gICAgICB0bXBOdW0gPSAwO1xuICAgICAgbnVtID0gMTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IE1hcChbXG4gICAgWydzZW50ZScsIHNlbnRlXSxcbiAgICBbJ2dvdGUnLCBnb3RlXSxcbiAgXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYW5kc1RvU2ZlbihcbiAgaGFuZHM6IHNnLkhhbmRzLFxuICByb2xlczogc2cuUm9sZVN0cmluZ1tdLFxuICB0b0ZvcnN5dGg/OiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc3RyaW5nIHwgdW5kZWZpbmVkXG4pOiBzZy5IYW5kc1NmZW4ge1xuICBjb25zdCBzZmVuUmVuZGVyZXIgPSB0b0ZvcnN5dGggfHwgc3RhbmRhcmRUb0ZvcnN5dGg7XG5cbiAgbGV0IHNlbnRlSGFuZFN0ciA9ICcnLFxuICAgIGdvdGVIYW5kU3RyID0gJyc7XG4gIGZvciAoY29uc3Qgcm9sZSBvZiByb2xlcykge1xuICAgIGNvbnN0IGZvcnN5dGggPSBzZmVuUmVuZGVyZXIocm9sZSk7XG4gICAgaWYgKGZvcnN5dGgpIHtcbiAgICAgIGNvbnN0IHNlbnRlQ250ID0gaGFuZHMuZ2V0KCdzZW50ZScpPy5nZXQocm9sZSksXG4gICAgICAgIGdvdGVDbnQgPSBoYW5kcy5nZXQoJ2dvdGUnKT8uZ2V0KHJvbGUpO1xuICAgICAgaWYgKHNlbnRlQ250KSBzZW50ZUhhbmRTdHIgKz0gc2VudGVDbnQgPiAxID8gc2VudGVDbnQudG9TdHJpbmcoKSArIGZvcnN5dGggOiBmb3JzeXRoO1xuICAgICAgaWYgKGdvdGVDbnQpIGdvdGVIYW5kU3RyICs9IGdvdGVDbnQgPiAxID8gZ290ZUNudC50b1N0cmluZygpICsgZm9yc3l0aCA6IGZvcnN5dGg7XG4gICAgfVxuICB9XG4gIGlmIChzZW50ZUhhbmRTdHIgfHwgZ290ZUhhbmRTdHIpIHJldHVybiBzZW50ZUhhbmRTdHIudG9VcHBlckNhc2UoKSArIGdvdGVIYW5kU3RyLnRvTG93ZXJDYXNlKCk7XG4gIGVsc2UgcmV0dXJuICctJztcbn1cblxuZnVuY3Rpb24gc3RhbmRhcmRGcm9tRm9yc3l0aChmb3JzeXRoOiBzdHJpbmcpOiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgc3dpdGNoIChmb3JzeXRoLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdwJzpcbiAgICAgIHJldHVybiAncGF3bic7XG4gICAgY2FzZSAnbCc6XG4gICAgICByZXR1cm4gJ2xhbmNlJztcbiAgICBjYXNlICduJzpcbiAgICAgIHJldHVybiAna25pZ2h0JztcbiAgICBjYXNlICdzJzpcbiAgICAgIHJldHVybiAnc2lsdmVyJztcbiAgICBjYXNlICdnJzpcbiAgICAgIHJldHVybiAnZ29sZCc7XG4gICAgY2FzZSAnYic6XG4gICAgICByZXR1cm4gJ2Jpc2hvcCc7XG4gICAgY2FzZSAncic6XG4gICAgICByZXR1cm4gJ3Jvb2snO1xuICAgIGNhc2UgJytwJzpcbiAgICAgIHJldHVybiAndG9raW4nO1xuICAgIGNhc2UgJytsJzpcbiAgICAgIHJldHVybiAncHJvbW90ZWRsYW5jZSc7XG4gICAgY2FzZSAnK24nOlxuICAgICAgcmV0dXJuICdwcm9tb3RlZGtuaWdodCc7XG4gICAgY2FzZSAnK3MnOlxuICAgICAgcmV0dXJuICdwcm9tb3RlZHNpbHZlcic7XG4gICAgY2FzZSAnK2InOlxuICAgICAgcmV0dXJuICdob3JzZSc7XG4gICAgY2FzZSAnK3InOlxuICAgICAgcmV0dXJuICdkcmFnb24nO1xuICAgIGNhc2UgJ2snOlxuICAgICAgcmV0dXJuICdraW5nJztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuO1xuICB9XG59XG5leHBvcnQgZnVuY3Rpb24gc3RhbmRhcmRUb0ZvcnN5dGgocm9sZTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgc3dpdGNoIChyb2xlKSB7XG4gICAgY2FzZSAncGF3bic6XG4gICAgICByZXR1cm4gJ3AnO1xuICAgIGNhc2UgJ2xhbmNlJzpcbiAgICAgIHJldHVybiAnbCc7XG4gICAgY2FzZSAna25pZ2h0JzpcbiAgICAgIHJldHVybiAnbic7XG4gICAgY2FzZSAnc2lsdmVyJzpcbiAgICAgIHJldHVybiAncyc7XG4gICAgY2FzZSAnZ29sZCc6XG4gICAgICByZXR1cm4gJ2cnO1xuICAgIGNhc2UgJ2Jpc2hvcCc6XG4gICAgICByZXR1cm4gJ2InO1xuICAgIGNhc2UgJ3Jvb2snOlxuICAgICAgcmV0dXJuICdyJztcbiAgICBjYXNlICd0b2tpbic6XG4gICAgICByZXR1cm4gJytwJztcbiAgICBjYXNlICdwcm9tb3RlZGxhbmNlJzpcbiAgICAgIHJldHVybiAnK2wnO1xuICAgIGNhc2UgJ3Byb21vdGVka25pZ2h0JzpcbiAgICAgIHJldHVybiAnK24nO1xuICAgIGNhc2UgJ3Byb21vdGVkc2lsdmVyJzpcbiAgICAgIHJldHVybiAnK3MnO1xuICAgIGNhc2UgJ2hvcnNlJzpcbiAgICAgIHJldHVybiAnK2InO1xuICAgIGNhc2UgJ2RyYWdvbic6XG4gICAgICByZXR1cm4gJytyJztcbiAgICBjYXNlICdraW5nJzpcbiAgICAgIHJldHVybiAnayc7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybjtcbiAgfVxufVxuIiwgImltcG9ydCB0eXBlIHsgSGVhZGxlc3NTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgeyBEcmF3U2hhcGUsIFNxdWFyZUhpZ2hsaWdodCB9IGZyb20gJy4vZHJhdy5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgc2V0Q2hlY2tzLCBzZXRQcmVEZXN0cyB9IGZyb20gJy4vYm9hcmQuanMnO1xuaW1wb3J0IHsgaW5mZXJEaW1lbnNpb25zLCBzZmVuVG9Cb2FyZCwgc2ZlblRvSGFuZHMgfSBmcm9tICcuL3NmZW4uanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbmZpZyB7XG4gIHNmZW4/OiB7XG4gICAgYm9hcmQ/OiBzZy5Cb2FyZFNmZW47IC8vIHBpZWNlcyBvbiB0aGUgYm9hcmQgaW4gRm9yc3l0aCBub3RhdGlvblxuICAgIGhhbmRzPzogc2cuSGFuZHNTZmVuOyAvLyBwaWVjZXMgaW4gaGFuZCBpbiBGb3JzeXRoIG5vdGF0aW9uXG4gIH07XG4gIG9yaWVudGF0aW9uPzogc2cuQ29sb3I7IC8vIGJvYXJkIG9yaWVudGF0aW9uLiBzZW50ZSB8IGdvdGVcbiAgdHVybkNvbG9yPzogc2cuQ29sb3I7IC8vIHR1cm4gdG8gcGxheS4gc2VudGUgfCBnb3RlXG4gIGFjdGl2ZUNvbG9yPzogc2cuQ29sb3IgfCAnYm90aCc7IC8vIGNvbG9yIHRoYXQgY2FuIG1vdmUgb3IgZHJvcC4gc2VudGUgfCBnb3RlIHwgYm90aCB8IHVuZGVmaW5lZFxuICBjaGVja3M/OiBzZy5LZXlbXSB8IHNnLkNvbG9yIHwgYm9vbGVhbjsgLy8gc3F1YXJlcyBjdXJyZW50bHkgaW4gY2hlY2sgW1wiNWFcIl0sIGNvbG9yIGluIGNoZWNrIChzZWUgaGlnaGxpZ2h0LmNoZWNrUm9sZXMpIG9yIGJvb2xlYW4gZm9yIGN1cnJlbnQgdHVybiBjb2xvclxuICBsYXN0RGVzdHM/OiBzZy5LZXlbXTsgLy8gc3F1YXJlcyBwYXJ0IG9mIHRoZSBsYXN0IG1vdmUgb3IgZHJvcCBbXCIzY1wiLCBcIjRjXCJdXG4gIHNlbGVjdGVkPzogc2cuS2V5OyAvLyBzcXVhcmUgY3VycmVudGx5IHNlbGVjdGVkIFwiMWFcIlxuICBzZWxlY3RlZFBpZWNlPzogc2cuUGllY2U7IC8vIHBpZWNlIGluIGhhbmQgY3VycmVudGx5IHNlbGVjdGVkXG4gIGhvdmVyZWQ/OiBzZy5LZXk7IC8vIHNxdWFyZSBjdXJyZW50bHkgYmVpbmcgaG92ZXJlZFxuICB2aWV3T25seT86IGJvb2xlYW47IC8vIGRvbid0IGJpbmQgZXZlbnRzOiB0aGUgdXNlciB3aWxsIG5ldmVyIGJlIGFibGUgdG8gbW92ZSBwaWVjZXMgYXJvdW5kXG4gIHNxdWFyZVJhdGlvPzogc2cuTnVtYmVyUGFpcjsgLy8gcmF0aW8gb2YgYSBzaW5nbGUgc3F1YXJlIFt3aWR0aCwgaGVpZ2h0XVxuICBkaXNhYmxlQ29udGV4dE1lbnU/OiBib29sZWFuOyAvLyBiZWNhdXNlIHdobyBuZWVkcyBhIGNvbnRleHQgbWVudSBvbiBhIGJvYXJkLCBvbmx5IHdpdGhvdXQgdmlld09ubHlcbiAgYmxvY2tUb3VjaFNjcm9sbD86IGJvb2xlYW47IC8vIGJsb2NrIHNjcm9sbGluZyB2aWEgdG91Y2ggZHJhZ2dpbmcgb24gdGhlIGJvYXJkLCBlLmcuIGZvciBjb29yZGluYXRlIHRyYWluaW5nXG4gIHNjYWxlRG93blBpZWNlcz86IGJvb2xlYW47IC8vIGhlbHBmdWwgZm9yIHBuZ3MgLSBodHRwczovL2N0aWRkLmNvbS8yMDE1L3N2Zy1iYWNrZ3JvdW5kLXNjYWxpbmdcbiAgY29vcmRpbmF0ZXM/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGluY2x1ZGUgY29vcmRzIGF0dHJpYnV0ZXNcbiAgICBmaWxlcz86IHNnLk5vdGF0aW9uO1xuICAgIHJhbmtzPzogc2cuTm90YXRpb247XG4gIH07XG4gIGhpZ2hsaWdodD86IHtcbiAgICBsYXN0RGVzdHM/OiBib29sZWFuOyAvLyBhZGQgbGFzdC1kZXN0IGNsYXNzIHRvIHNxdWFyZXNcbiAgICBjaGVjaz86IGJvb2xlYW47IC8vIGFkZCBjaGVjayBjbGFzcyB0byBzcXVhcmVzXG4gICAgY2hlY2tSb2xlcz86IHNnLlJvbGVTdHJpbmdbXTsgLy8gcm9sZXMgdG8gYmUgaGlnaGxpZ2h0ZWQgd2hlbiBjaGVjayBpcyBib29sZWFuIGlzIHBhc3NlZCBmcm9tIGNvbmZpZ1xuICAgIGhvdmVyZWQ/OiBib29sZWFuOyAvLyBhZGQgaG92ZXIgY2xhc3MgdG8gaG92ZXJlZCBzcXVhcmVzXG4gIH07XG4gIGFuaW1hdGlvbj86IHtcbiAgICBlbmFibGVkPzogYm9vbGVhbjtcbiAgICBoYW5kcz86IGJvb2xlYW47XG4gICAgZHVyYXRpb24/OiBudW1iZXI7XG4gIH07XG4gIGhhbmRzPzoge1xuICAgIGlubGluZWQ/OiBib29sZWFuOyAvLyBhdHRhY2hlcyBzZy1oYW5kcyBkaXJlY3RseSB0byBzZy13cmFwLCBpZ25vcmVzIEhUTUxFbGVtZW50cyBwYXNzZWQgdG8gU2hvZ2lncm91bmRcbiAgICByb2xlcz86IHNnLlJvbGVTdHJpbmdbXTsgLy8gcm9sZXMgdG8gcmVuZGVyIGluIHNnLWhhbmRcbiAgfTtcbiAgbW92YWJsZT86IHtcbiAgICBmcmVlPzogYm9vbGVhbjsgLy8gYWxsIG1vdmVzIGFyZSB2YWxpZCAtIGJvYXJkIGVkaXRvclxuICAgIGRlc3RzPzogc2cuTW92ZURlc3RzOyAvLyB2YWxpZCBtb3Zlcy4ge1wiMmFcIiBbXCIzYVwiIFwiNGFcIl0gXCIxYlwiIFtcIjNhXCIgXCIzY1wiXX1cbiAgICBzaG93RGVzdHM/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgZXZlbnRzPzoge1xuICAgICAgYWZ0ZXI/OiAob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXksIHByb206IGJvb2xlYW4sIG1ldGFkYXRhOiBzZy5Nb3ZlTWV0YWRhdGEpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgbW92ZSBoYXMgYmVlbiBwbGF5ZWRcbiAgICB9O1xuICB9O1xuICBkcm9wcGFibGU/OiB7XG4gICAgZnJlZT86IGJvb2xlYW47IC8vIGFsbCBkcm9wcyBhcmUgdmFsaWQgLSBib2FyZCBlZGl0b3JcbiAgICBkZXN0cz86IHNnLkRyb3BEZXN0czsgLy8gdmFsaWQgZHJvcHMuIHtcInNlbnRlIHBhd25cIiBbXCIzYVwiIFwiNGFcIl0gXCJzZW50ZSBsYW5jZVwiIFtcIjNhXCIgXCIzY1wiXX1cbiAgICBzaG93RGVzdHM/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgc3BhcmU/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIHJlbW92ZSBkcm9wcGVkIHBpZWNlIGZyb20gaGFuZCBhZnRlciBkcm9wIC0gYm9hcmQgZWRpdG9yXG4gICAgZXZlbnRzPzoge1xuICAgICAgYWZ0ZXI/OiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSwgcHJvbTogYm9vbGVhbiwgbWV0YWRhdGE6IHNnLk1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBkcm9wIGhhcyBiZWVuIHBsYXllZFxuICAgIH07XG4gIH07XG4gIHByZW1vdmFibGU/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGFsbG93IHByZW1vdmVzIGZvciBjb2xvciB0aGF0IGNhbiBub3QgbW92ZVxuICAgIHNob3dEZXN0cz86IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBwcmUtZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgZGVzdHM/OiBzZy5LZXlbXTsgLy8gcHJlbW92ZSBkZXN0aW5hdGlvbnMgZm9yIHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgIGdlbmVyYXRlPzogKGtleTogc2cuS2V5LCBwaWVjZXM6IHNnLlBpZWNlcykgPT4gc2cuS2V5W107IC8vIGZ1bmN0aW9uIHRvIGdlbmVyYXRlIGRlc3RpbmF0aW9ucyB0aGF0IHVzZXIgY2FuIHByZW1vdmUgdG9cbiAgICBldmVudHM/OiB7XG4gICAgICBzZXQ/OiAob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXksIHByb206IGJvb2xlYW4pID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlbW92ZSBoYXMgYmVlbiBzZXRcbiAgICAgIHVuc2V0PzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVtb3ZlIGhhcyBiZWVuIHVuc2V0XG4gICAgfTtcbiAgfTtcbiAgcHJlZHJvcHBhYmxlPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuOyAvLyBhbGxvdyBwcmVkcm9wcyBmb3IgY29sb3IgdGhhdCBjYW4gbm90IG1vdmVcbiAgICBzaG93RGVzdHM/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgcHJlLWRlc3QgY2xhc3Mgb24gc3F1YXJlcyBmb3IgZHJvcHNcbiAgICBkZXN0cz86IHNnLktleVtdOyAvLyBwcmVtb3ZlIGRlc3RpbmF0aW9ucyBmb3IgdGhlIGRyb3Agc2VsZWN0aW9uXG4gICAgZ2VuZXJhdGU/OiAocGllY2U6IHNnLlBpZWNlLCBwaWVjZXM6IHNnLlBpZWNlcykgPT4gc2cuS2V5W107IC8vIGZ1bmN0aW9uIHRvIGdlbmVyYXRlIGRlc3RpbmF0aW9ucyB0aGF0IHVzZXIgY2FuIHByZWRyb3Agb25cbiAgICBldmVudHM/OiB7XG4gICAgICBzZXQ/OiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSwgcHJvbTogYm9vbGVhbikgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVkcm9wIGhhcyBiZWVuIHNldFxuICAgICAgdW5zZXQ/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZWRyb3AgaGFzIGJlZW4gdW5zZXRcbiAgICB9O1xuICB9O1xuICBkcmFnZ2FibGU/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGFsbG93IG1vdmVzICYgcHJlbW92ZXMgdG8gdXNlIGRyYWcnbiBkcm9wXG4gICAgZGlzdGFuY2U/OiBudW1iZXI7IC8vIG1pbmltdW0gZGlzdGFuY2UgdG8gaW5pdGlhdGUgYSBkcmFnOyBpbiBwaXhlbHNcbiAgICBhdXRvRGlzdGFuY2U/OiBib29sZWFuOyAvLyBsZXRzIHNob2dpZ3JvdW5kIHNldCBkaXN0YW5jZSB0byB6ZXJvIHdoZW4gdXNlciBkcmFncyBwaWVjZXNcbiAgICBzaG93R2hvc3Q/OiBib29sZWFuOyAvLyBzaG93IGdob3N0IG9mIHBpZWNlIGJlaW5nIGRyYWdnZWRcbiAgICBzaG93VG91Y2hTcXVhcmVPdmVybGF5PzogYm9vbGVhbjsgLy8gc2hvdyBzcXVhcmUgb3ZlcmxheSBvbiB0aGUgc3F1YXJlIHRoYXQgaXMgY3VycmVudGx5IGJlaW5nIGhvdmVyZWQsIHRvdWNoIG9ubHlcbiAgICBkZWxldGVPbkRyb3BPZmY/OiBib29sZWFuOyAvLyBkZWxldGUgYSBwaWVjZSB3aGVuIGl0IGlzIGRyb3BwZWQgb2ZmIHRoZSBib2FyZFxuICAgIGFkZFRvSGFuZE9uRHJvcE9mZj86IGJvb2xlYW47IC8vIGFkZCBhIHBpZWNlIHRvIGhhbmQgd2hlbiBpdCBpcyBkcm9wcGVkIG9uIGl0LCByZXF1aXJlcyBkZWxldGVPbkRyb3BPZmZcbiAgfTtcbiAgc2VsZWN0YWJsZT86IHtcbiAgICBlbmFibGVkPzogYm9vbGVhbjsgLy8gZGlzYWJsZSB0byBlbmZvcmNlIGRyYWdnaW5nIG92ZXIgY2xpY2stY2xpY2sgbW92ZVxuICAgIGZvcmNlU3BhcmVzPzogYm9vbGVhbjsgLy8gYWxsb3cgZHJvcHBpbmcgc3BhcmUgcGllY2VzIGV2ZW4gd2l0aCBzZWxlY3RhYmxlIGRpc2FibGVkXG4gICAgZGVsZXRlT25Ub3VjaD86IGJvb2xlYW47IC8vIHNlbGVjdGluZyBhIHBpZWNlIG9uIHRoZSBib2FyZCBvciBpbiBoYW5kIHdpbGwgcmVtb3ZlIGl0IC0gYm9hcmQgZWRpdG9yXG4gICAgYWRkU3BhcmVzVG9IYW5kPzogYm9vbGVhbjsgLy8gYWRkIHNlbGVjdGVkIHNwYXJlIHBpZWNlIHRvIGhhbmQgLSBib2FyZCBlZGl0b3JcbiAgfTtcbiAgZXZlbnRzPzoge1xuICAgIGNoYW5nZT86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgc2l0dWF0aW9uIGNoYW5nZXMgb24gdGhlIGJvYXJkXG4gICAgbW92ZT86IChvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSwgcHJvbTogYm9vbGVhbiwgY2FwdHVyZWRQaWVjZT86IHNnLlBpZWNlKSA9PiB2b2lkO1xuICAgIGRyb3A/OiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSwgcHJvbTogYm9vbGVhbikgPT4gdm9pZDtcbiAgICBzZWxlY3Q/OiAoa2V5OiBzZy5LZXkpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIGEgc3F1YXJlIGlzIHNlbGVjdGVkXG4gICAgdW5zZWxlY3Q/OiAoa2V5OiBzZy5LZXkpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIGEgc2VsZWN0ZWQgc3F1YXJlIGlzIGRpcmVjdGx5IHVuc2VsZWN0ZWQgLSBkcm9wcGVkIGJhY2sgb3IgY2xpY2tlZCBvbiB0aGUgb3JpZ2luYWwgc3F1YXJlXG4gICAgcGllY2VTZWxlY3Q/OiAocGllY2U6IHNnLlBpZWNlKSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBhIHBpZWNlIGluIGhhbmQgaXMgc2VsZWN0ZWRcbiAgICBwaWVjZVVuc2VsZWN0PzogKHBpZWNlOiBzZy5QaWVjZSkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gYSBzZWxlY3RlZCBwaWVjZSBpcyBkaXJlY3RseSB1bnNlbGVjdGVkIC0gZHJvcHBlZCBiYWNrIG9yIGNsaWNrZWQgb24gdGhlIHNhbWUgcGllY2VcbiAgICBpbnNlcnQ/OiAoYm9hcmRFbGVtZW50cz86IHNnLkJvYXJkRWxlbWVudHMsIGhhbmRFbGVtZW50cz86IHNnLkhhbmRFbGVtZW50cykgPT4gdm9pZDsgLy8gd2hlbiB0aGUgYm9hcmQvaGFuZHMgRE9NIGhhcyBiZWVuIChyZSlpbnNlcnRlZFxuICB9O1xuICBkcmF3YWJsZT86IHtcbiAgICBlbmFibGVkPzogYm9vbGVhbjsgLy8gY2FuIGRyYXdcbiAgICB2aXNpYmxlPzogYm9vbGVhbjsgLy8gY2FuIHZpZXdcbiAgICBmb3JjZWQ/OiBib29sZWFuOyAvLyBjYW4gb25seSBkcmF3XG4gICAgZXJhc2VPbkNsaWNrPzogYm9vbGVhbjtcbiAgICBzaGFwZXM/OiBEcmF3U2hhcGVbXTtcbiAgICBhdXRvU2hhcGVzPzogRHJhd1NoYXBlW107XG4gICAgc3F1YXJlcz86IFNxdWFyZUhpZ2hsaWdodFtdO1xuICAgIG9uQ2hhbmdlPzogKHNoYXBlczogRHJhd1NoYXBlW10pID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciBkcmF3YWJsZSBzaGFwZXMgY2hhbmdlXG4gIH07XG4gIGZvcnN5dGg/OiB7XG4gICAgdG9Gb3JzeXRoPzogKHJvbGU6IHNnLlJvbGVTdHJpbmcpID0+IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBmcm9tRm9yc3l0aD86IChzdHI6IHN0cmluZykgPT4gc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZDtcbiAgfTtcbiAgcHJvbW90aW9uPzoge1xuICAgIHByb21vdGVzVG8/OiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICB1bnByb21vdGVzVG8/OiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBtb3ZlUHJvbW90aW9uRGlhbG9nPzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KSA9PiBib29sZWFuOyAvLyBhY3RpdmF0ZSBwcm9tb3Rpb24gZGlhbG9nXG4gICAgZm9yY2VNb3ZlUHJvbW90aW9uPzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KSA9PiBib29sZWFuOyAvLyBhdXRvIHByb21vdGUgYWZ0ZXIgbW92ZVxuICAgIGRyb3BQcm9tb3Rpb25EaWFsb2c/OiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSkgPT4gYm9vbGVhbjsgLy8gYWN0aXZhdGUgcHJvbW90aW9uIGRpYWxvZ1xuICAgIGZvcmNlRHJvcFByb21vdGlvbj86IChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5KSA9PiBib29sZWFuOyAvLyBhdXRvIHByb21vdGUgYWZ0ZXIgZHJvcFxuICAgIGV2ZW50cz86IHtcbiAgICAgIGluaXRpYXRlZD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIHByb21vdGlvbiBkaWFsb2cgaXMgc3RhcnRlZFxuICAgICAgYWZ0ZXI/OiAocGllY2U6IHNnLlBpZWNlKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdXNlciBzZWxlY3RzIGEgcGllY2VcbiAgICAgIGNhbmNlbD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB1c2VyIGNhbmNlbHMgdGhlIHNlbGVjdGlvblxuICAgIH07XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseUFuaW1hdGlvbihzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgY29uZmlnOiBDb25maWcpOiB2b2lkIHtcbiAgaWYgKGNvbmZpZy5hbmltYXRpb24pIHtcbiAgICBkZWVwTWVyZ2Uoc3RhdGUuYW5pbWF0aW9uLCBjb25maWcuYW5pbWF0aW9uKTtcbiAgICAvLyBubyBuZWVkIGZvciBzdWNoIHNob3J0IGFuaW1hdGlvbnNcbiAgICBpZiAoKHN0YXRlLmFuaW1hdGlvbi5kdXJhdGlvbiB8fCAwKSA8IDcwKSBzdGF0ZS5hbmltYXRpb24uZW5hYmxlZCA9IGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25maWd1cmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIGNvbmZpZzogQ29uZmlnKTogdm9pZCB7XG4gIC8vIGRvbid0IG1lcmdlLCBqdXN0IG92ZXJyaWRlLlxuICBpZiAoY29uZmlnLm1vdmFibGU/LmRlc3RzKSBzdGF0ZS5tb3ZhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICBpZiAoY29uZmlnLmRyb3BwYWJsZT8uZGVzdHMpIHN0YXRlLmRyb3BwYWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbiAgaWYgKGNvbmZpZy5kcmF3YWJsZT8uc2hhcGVzKSBzdGF0ZS5kcmF3YWJsZS5zaGFwZXMgPSBbXTtcbiAgaWYgKGNvbmZpZy5kcmF3YWJsZT8uYXV0b1NoYXBlcykgc3RhdGUuZHJhd2FibGUuYXV0b1NoYXBlcyA9IFtdO1xuICBpZiAoY29uZmlnLmRyYXdhYmxlPy5zcXVhcmVzKSBzdGF0ZS5kcmF3YWJsZS5zcXVhcmVzID0gW107XG4gIGlmIChjb25maWcuaGFuZHM/LnJvbGVzKSBzdGF0ZS5oYW5kcy5yb2xlcyA9IFtdO1xuXG4gIGRlZXBNZXJnZShzdGF0ZSwgY29uZmlnKTtcblxuICAvLyBpZiBhIHNmZW4gd2FzIHByb3ZpZGVkLCByZXBsYWNlIHRoZSBwaWVjZXMsIGV4Y2VwdCB0aGUgY3VycmVudGx5IGRyYWdnZWQgb25lXG4gIGlmIChjb25maWcuc2Zlbj8uYm9hcmQpIHtcbiAgICBzdGF0ZS5kaW1lbnNpb25zID0gaW5mZXJEaW1lbnNpb25zKGNvbmZpZy5zZmVuLmJvYXJkKTtcbiAgICBzdGF0ZS5waWVjZXMgPSBzZmVuVG9Cb2FyZChjb25maWcuc2Zlbi5ib2FyZCwgc3RhdGUuZGltZW5zaW9ucywgc3RhdGUuZm9yc3l0aC5mcm9tRm9yc3l0aCk7XG4gICAgc3RhdGUuZHJhd2FibGUuc2hhcGVzID0gY29uZmlnLmRyYXdhYmxlPy5zaGFwZXMgfHwgW107XG4gIH1cblxuICBpZiAoY29uZmlnLnNmZW4/LmhhbmRzKSB7XG4gICAgc3RhdGUuaGFuZHMuaGFuZE1hcCA9IHNmZW5Ub0hhbmRzKGNvbmZpZy5zZmVuLmhhbmRzLCBzdGF0ZS5mb3JzeXRoLmZyb21Gb3JzeXRoKTtcbiAgfVxuXG4gIC8vIGFwcGx5IGNvbmZpZyB2YWx1ZXMgdGhhdCBjb3VsZCBiZSB1bmRlZmluZWQgeWV0IG1lYW5pbmdmdWxcbiAgaWYgKCdjaGVja3MnIGluIGNvbmZpZykgc2V0Q2hlY2tzKHN0YXRlLCBjb25maWcuY2hlY2tzIHx8IGZhbHNlKTtcbiAgaWYgKCdsYXN0RGVzdHMnIGluIGNvbmZpZyAmJiAhY29uZmlnLmxhc3REZXN0cykgc3RhdGUubGFzdERlc3RzID0gdW5kZWZpbmVkO1xuICAvLyBpbiBjYXNlIG9mIGRyb3AgbGFzdCBtb3ZlLCB0aGVyZSdzIGEgc2luZ2xlIHNxdWFyZS5cbiAgLy8gaWYgdGhlIHByZXZpb3VzIGxhc3QgbW92ZSBoYWQgdHdvIHNxdWFyZXMsXG4gIC8vIHRoZSBtZXJnZSBhbGdvcml0aG0gd2lsbCBpbmNvcnJlY3RseSBrZWVwIHRoZSBzZWNvbmQgc3F1YXJlLlxuICBlbHNlIGlmIChjb25maWcubGFzdERlc3RzKSBzdGF0ZS5sYXN0RGVzdHMgPSBjb25maWcubGFzdERlc3RzO1xuXG4gIC8vIGZpeCBtb3ZlL3ByZW1vdmUgZGVzdHNcbiAgc2V0UHJlRGVzdHMoc3RhdGUpO1xuXG4gIGFwcGx5QW5pbWF0aW9uKHN0YXRlLCBjb25maWcpO1xufVxuXG5mdW5jdGlvbiBkZWVwTWVyZ2UoYmFzZTogYW55LCBleHRlbmQ6IGFueSk6IHZvaWQge1xuICBmb3IgKGNvbnN0IGtleSBpbiBleHRlbmQpIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGV4dGVuZCwga2V5KSkge1xuICAgICAgaWYgKFxuICAgICAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYmFzZSwga2V5KSAmJlxuICAgICAgICBpc1BsYWluT2JqZWN0KGJhc2Vba2V5XSkgJiZcbiAgICAgICAgaXNQbGFpbk9iamVjdChleHRlbmRba2V5XSlcbiAgICAgIClcbiAgICAgICAgZGVlcE1lcmdlKGJhc2Vba2V5XSwgZXh0ZW5kW2tleV0pO1xuICAgICAgZWxzZSBiYXNlW2tleV0gPSBleHRlbmRba2V5XTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNQbGFpbk9iamVjdChvOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIGlmICh0eXBlb2YgbyAhPT0gJ29iamVjdCcgfHwgbyA9PT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvKTtcbiAgcmV0dXJuIHByb3RvID09PSBPYmplY3QucHJvdG90eXBlIHx8IHByb3RvID09PSBudWxsO1xufVxuIiwgImltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyBhbGxLZXlzLCBjb2xvcnMgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbC5qcyc7XG5cbmV4cG9ydCB0eXBlIE11dGF0aW9uPEE+ID0gKHN0YXRlOiBTdGF0ZSkgPT4gQTtcblxuLy8gMCwxIGFuaW1hdGlvbiBnb2FsXG4vLyAyLDMgYW5pbWF0aW9uIGN1cnJlbnQgc3RhdHVzXG5leHBvcnQgdHlwZSBBbmltVmVjdG9yID0gc2cuTnVtYmVyUXVhZDtcblxuZXhwb3J0IHR5cGUgQW5pbVZlY3RvcnMgPSBNYXA8c2cuS2V5LCBBbmltVmVjdG9yPjtcblxuZXhwb3J0IHR5cGUgQW5pbUZhZGluZ3MgPSBNYXA8c2cuS2V5LCBzZy5QaWVjZT47XG5cbmV4cG9ydCB0eXBlIEFuaW1Qcm9tb3Rpb25zID0gTWFwPHNnLktleSwgc2cuUGllY2U+O1xuXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1QbGFuIHtcbiAgYW5pbXM6IEFuaW1WZWN0b3JzO1xuICBmYWRpbmdzOiBBbmltRmFkaW5ncztcbiAgcHJvbW90aW9uczogQW5pbVByb21vdGlvbnM7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbUN1cnJlbnQge1xuICBzdGFydDogRE9NSGlnaFJlc1RpbWVTdGFtcDtcbiAgZnJlcXVlbmN5OiBzZy5LSHo7XG4gIHBsYW46IEFuaW1QbGFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW5pbTxBPihtdXRhdGlvbjogTXV0YXRpb248QT4sIHN0YXRlOiBTdGF0ZSk6IEEge1xuICByZXR1cm4gc3RhdGUuYW5pbWF0aW9uLmVuYWJsZWQgPyBhbmltYXRlKG11dGF0aW9uLCBzdGF0ZSkgOiByZW5kZXIobXV0YXRpb24sIHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlcjxBPihtdXRhdGlvbjogTXV0YXRpb248QT4sIHN0YXRlOiBTdGF0ZSk6IEEge1xuICBjb25zdCByZXN1bHQgPSBtdXRhdGlvbihzdGF0ZSk7XG4gIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuaW50ZXJmYWNlIEFuaW1QaWVjZSB7XG4gIGtleT86IHNnLktleTtcbiAgcG9zOiBzZy5Qb3M7XG4gIHBpZWNlOiBzZy5QaWVjZTtcbn1cblxuZnVuY3Rpb24gbWFrZVBpZWNlKGtleTogc2cuS2V5LCBwaWVjZTogc2cuUGllY2UpOiBBbmltUGllY2Uge1xuICByZXR1cm4ge1xuICAgIGtleToga2V5LFxuICAgIHBvczogdXRpbC5rZXkycG9zKGtleSksXG4gICAgcGllY2U6IHBpZWNlLFxuICB9O1xufVxuXG5mdW5jdGlvbiBjbG9zZXIocGllY2U6IEFuaW1QaWVjZSwgcGllY2VzOiBBbmltUGllY2VbXSk6IEFuaW1QaWVjZSB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBwaWVjZXMuc29ydCgocDEsIHAyKSA9PiB7XG4gICAgcmV0dXJuIHV0aWwuZGlzdGFuY2VTcShwaWVjZS5wb3MsIHAxLnBvcykgLSB1dGlsLmRpc3RhbmNlU3EocGllY2UucG9zLCBwMi5wb3MpO1xuICB9KVswXTtcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVBsYW4ocHJldlBpZWNlczogc2cuUGllY2VzLCBwcmV2SGFuZHM6IHNnLkhhbmRzLCBjdXJyZW50OiBTdGF0ZSk6IEFuaW1QbGFuIHtcbiAgY29uc3QgYW5pbXM6IEFuaW1WZWN0b3JzID0gbmV3IE1hcCgpLFxuICAgIGFuaW1lZE9yaWdzOiBzZy5LZXlbXSA9IFtdLFxuICAgIGZhZGluZ3M6IEFuaW1GYWRpbmdzID0gbmV3IE1hcCgpLFxuICAgIHByb21vdGlvbnM6IEFuaW1Qcm9tb3Rpb25zID0gbmV3IE1hcCgpLFxuICAgIG1pc3NpbmdzOiBBbmltUGllY2VbXSA9IFtdLFxuICAgIG5ld3M6IEFuaW1QaWVjZVtdID0gW10sXG4gICAgcHJlUGllY2VzID0gbmV3IE1hcDxzZy5LZXksIEFuaW1QaWVjZT4oKTtcblxuICBmb3IgKGNvbnN0IFtrLCBwXSBvZiBwcmV2UGllY2VzKSB7XG4gICAgcHJlUGllY2VzLnNldChrLCBtYWtlUGllY2UoaywgcCkpO1xuICB9XG4gIGZvciAoY29uc3Qga2V5IG9mIGFsbEtleXMpIHtcbiAgICBjb25zdCBjdXJQID0gY3VycmVudC5waWVjZXMuZ2V0KGtleSksXG4gICAgICBwcmVQID0gcHJlUGllY2VzLmdldChrZXkpO1xuICAgIGlmIChjdXJQKSB7XG4gICAgICBpZiAocHJlUCkge1xuICAgICAgICBpZiAoIXV0aWwuc2FtZVBpZWNlKGN1clAsIHByZVAucGllY2UpKSB7XG4gICAgICAgICAgbWlzc2luZ3MucHVzaChwcmVQKTtcbiAgICAgICAgICBuZXdzLnB1c2gobWFrZVBpZWNlKGtleSwgY3VyUCkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgbmV3cy5wdXNoKG1ha2VQaWVjZShrZXksIGN1clApKTtcbiAgICB9IGVsc2UgaWYgKHByZVApIG1pc3NpbmdzLnB1c2gocHJlUCk7XG4gIH1cbiAgaWYgKGN1cnJlbnQuYW5pbWF0aW9uLmhhbmRzKSB7XG4gICAgZm9yIChjb25zdCBjb2xvciBvZiBjb2xvcnMpIHtcbiAgICAgIGNvbnN0IGN1ckggPSBjdXJyZW50LmhhbmRzLmhhbmRNYXAuZ2V0KGNvbG9yKSxcbiAgICAgICAgcHJlSCA9IHByZXZIYW5kcy5nZXQoY29sb3IpO1xuICAgICAgaWYgKHByZUggJiYgY3VySCkge1xuICAgICAgICBmb3IgKGNvbnN0IFtyb2xlLCBuXSBvZiBwcmVIKSB7XG4gICAgICAgICAgY29uc3QgcGllY2U6IHNnLlBpZWNlID0geyByb2xlLCBjb2xvciB9LFxuICAgICAgICAgICAgY3VyTiA9IGN1ckguZ2V0KHJvbGUpIHx8IDA7XG4gICAgICAgICAgaWYgKGN1ck4gPCBuKSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kUGllY2VPZmZzZXQgPSBjdXJyZW50LmRvbS5ib3VuZHMuaGFuZHNcbiAgICAgICAgICAgICAgICAucGllY2VCb3VuZHMoKVxuICAgICAgICAgICAgICAgIC5nZXQodXRpbC5waWVjZU5hbWVPZihwaWVjZSkpLFxuICAgICAgICAgICAgICBib3VuZHMgPSBjdXJyZW50LmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCksXG4gICAgICAgICAgICAgIG91dFBvcyA9XG4gICAgICAgICAgICAgICAgaGFuZFBpZWNlT2Zmc2V0ICYmIGJvdW5kc1xuICAgICAgICAgICAgICAgICAgPyB1dGlsLnBvc09mT3V0c2lkZUVsKFxuICAgICAgICAgICAgICAgICAgICAgIGhhbmRQaWVjZU9mZnNldC5sZWZ0LFxuICAgICAgICAgICAgICAgICAgICAgIGhhbmRQaWVjZU9mZnNldC50b3AsXG4gICAgICAgICAgICAgICAgICAgICAgdXRpbC5zZW50ZVBvdihjdXJyZW50Lm9yaWVudGF0aW9uKSxcbiAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50LmRpbWVuc2lvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgYm91bmRzXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKG91dFBvcylcbiAgICAgICAgICAgICAgbWlzc2luZ3MucHVzaCh7XG4gICAgICAgICAgICAgICAgcG9zOiBvdXRQb3MsXG4gICAgICAgICAgICAgICAgcGllY2U6IHBpZWNlLFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZm9yIChjb25zdCBuZXdQIG9mIG5ld3MpIHtcbiAgICBjb25zdCBwcmVQID0gY2xvc2VyKFxuICAgICAgbmV3UCxcbiAgICAgIG1pc3NpbmdzLmZpbHRlcihwID0+IHtcbiAgICAgICAgaWYgKHV0aWwuc2FtZVBpZWNlKG5ld1AucGllY2UsIHAucGllY2UpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgLy8gY2hlY2tpbmcgd2hldGhlciBwcm9tb3RlZCBwaWVjZXMgYXJlIHRoZSBzYW1lXG4gICAgICAgIGNvbnN0IHBSb2xlID0gY3VycmVudC5wcm9tb3Rpb24ucHJvbW90ZXNUbyhwLnBpZWNlLnJvbGUpLFxuICAgICAgICAgIHBQaWVjZSA9IHBSb2xlICYmIHsgY29sb3I6IHAucGllY2UuY29sb3IsIHJvbGU6IHBSb2xlIH07XG4gICAgICAgIGNvbnN0IG5Sb2xlID0gY3VycmVudC5wcm9tb3Rpb24ucHJvbW90ZXNUbyhuZXdQLnBpZWNlLnJvbGUpLFxuICAgICAgICAgIG5QaWVjZSA9IG5Sb2xlICYmIHsgY29sb3I6IG5ld1AucGllY2UuY29sb3IsIHJvbGU6IG5Sb2xlIH07XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgKCEhcFBpZWNlICYmIHV0aWwuc2FtZVBpZWNlKG5ld1AucGllY2UsIHBQaWVjZSkpIHx8XG4gICAgICAgICAgKCEhblBpZWNlICYmIHV0aWwuc2FtZVBpZWNlKG5QaWVjZSwgcC5waWVjZSkpXG4gICAgICAgICk7XG4gICAgICB9KVxuICAgICk7XG4gICAgaWYgKHByZVApIHtcbiAgICAgIGNvbnN0IHZlY3RvciA9IFtwcmVQLnBvc1swXSAtIG5ld1AucG9zWzBdLCBwcmVQLnBvc1sxXSAtIG5ld1AucG9zWzFdXTtcbiAgICAgIGFuaW1zLnNldChuZXdQLmtleSEsIHZlY3Rvci5jb25jYXQodmVjdG9yKSBhcyBBbmltVmVjdG9yKTtcbiAgICAgIGlmIChwcmVQLmtleSkgYW5pbWVkT3JpZ3MucHVzaChwcmVQLmtleSk7XG4gICAgICBpZiAoIXV0aWwuc2FtZVBpZWNlKG5ld1AucGllY2UsIHByZVAucGllY2UpICYmIG5ld1Aua2V5KSBwcm9tb3Rpb25zLnNldChuZXdQLmtleSwgcHJlUC5waWVjZSk7XG4gICAgfVxuICB9XG4gIGZvciAoY29uc3QgcCBvZiBtaXNzaW5ncykge1xuICAgIGlmIChwLmtleSAmJiAhYW5pbWVkT3JpZ3MuaW5jbHVkZXMocC5rZXkpKSBmYWRpbmdzLnNldChwLmtleSwgcC5waWVjZSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGFuaW1zOiBhbmltcyxcbiAgICBmYWRpbmdzOiBmYWRpbmdzLFxuICAgIHByb21vdGlvbnM6IHByb21vdGlvbnMsXG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0ZXAoc3RhdGU6IFN0YXRlLCBub3c6IERPTUhpZ2hSZXNUaW1lU3RhbXApOiB2b2lkIHtcbiAgY29uc3QgY3VyID0gc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQ7XG4gIGlmIChjdXIgPT09IHVuZGVmaW5lZCkge1xuICAgIC8vIGFuaW1hdGlvbiB3YXMgY2FuY2VsZWQgOihcbiAgICBpZiAoIXN0YXRlLmRvbS5kZXN0cm95ZWQpIHN0YXRlLmRvbS5yZWRyYXdOb3coKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgcmVzdCA9IDEgLSAobm93IC0gY3VyLnN0YXJ0KSAqIGN1ci5mcmVxdWVuY3k7XG4gIGlmIChyZXN0IDw9IDApIHtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20ucmVkcmF3Tm93KCk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgZWFzZSA9IGVhc2luZyhyZXN0KTtcbiAgICBmb3IgKGNvbnN0IGNmZyBvZiBjdXIucGxhbi5hbmltcy52YWx1ZXMoKSkge1xuICAgICAgY2ZnWzJdID0gY2ZnWzBdICogZWFzZTtcbiAgICAgIGNmZ1szXSA9IGNmZ1sxXSAqIGVhc2U7XG4gICAgfVxuICAgIHN0YXRlLmRvbS5yZWRyYXdOb3codHJ1ZSk7IC8vIG9wdGltaXNhdGlvbjogZG9uJ3QgcmVuZGVyIFNWRyBjaGFuZ2VzIGR1cmluZyBhbmltYXRpb25zXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKChub3cgPSBwZXJmb3JtYW5jZS5ub3coKSkgPT4gc3RlcChzdGF0ZSwgbm93KSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYW5pbWF0ZTxBPihtdXRhdGlvbjogTXV0YXRpb248QT4sIHN0YXRlOiBTdGF0ZSk6IEEge1xuICAvLyBjbG9uZSBzdGF0ZSBiZWZvcmUgbXV0YXRpbmcgaXRcbiAgY29uc3QgcHJldlBpZWNlczogc2cuUGllY2VzID0gbmV3IE1hcChzdGF0ZS5waWVjZXMpLFxuICAgIHByZXZIYW5kczogc2cuSGFuZHMgPSBuZXcgTWFwKFtcbiAgICAgIFsnc2VudGUnLCBuZXcgTWFwKHN0YXRlLmhhbmRzLmhhbmRNYXAuZ2V0KCdzZW50ZScpKV0sXG4gICAgICBbJ2dvdGUnLCBuZXcgTWFwKHN0YXRlLmhhbmRzLmhhbmRNYXAuZ2V0KCdnb3RlJykpXSxcbiAgICBdKTtcblxuICBjb25zdCByZXN1bHQgPSBtdXRhdGlvbihzdGF0ZSksXG4gICAgcGxhbiA9IGNvbXB1dGVQbGFuKHByZXZQaWVjZXMsIHByZXZIYW5kcywgc3RhdGUpO1xuICBpZiAocGxhbi5hbmltcy5zaXplIHx8IHBsYW4uZmFkaW5ncy5zaXplKSB7XG4gICAgY29uc3QgYWxyZWFkeVJ1bm5pbmcgPSBzdGF0ZS5hbmltYXRpb24uY3VycmVudD8uc3RhcnQgIT09IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHtcbiAgICAgIHN0YXJ0OiBwZXJmb3JtYW5jZS5ub3coKSxcbiAgICAgIGZyZXF1ZW5jeTogMSAvIE1hdGgubWF4KHN0YXRlLmFuaW1hdGlvbi5kdXJhdGlvbiwgMSksXG4gICAgICBwbGFuOiBwbGFuLFxuICAgIH07XG4gICAgaWYgKCFhbHJlYWR5UnVubmluZykgc3RlcChzdGF0ZSwgcGVyZm9ybWFuY2Uubm93KCkpO1xuICB9IGVsc2Uge1xuICAgIC8vIGRvbid0IGFuaW1hdGUsIGp1c3QgcmVuZGVyIHJpZ2h0IGF3YXlcbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vZ3JlLzE2NTAyOTRcbmZ1bmN0aW9uIGVhc2luZyh0OiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gdCA8IDAuNSA/IDQgKiB0ICogdCAqIHQgOiAodCAtIDEpICogKDIgKiB0IC0gMikgKiAoMiAqIHQgLSAyKSArIDE7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgeyBEcmF3U2hhcGUsIERyYXdTaGFwZVBpZWNlLCBEcmF3Q3VycmVudCB9IGZyb20gJy4vZHJhdy5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHtcbiAgY3JlYXRlRWwsXG4gIGtleTJwb3MsXG4gIHBpZWNlTmFtZU9mLFxuICBwb3NUb1RyYW5zbGF0ZVJlbCxcbiAgc2FtZVBpZWNlLFxuICB0cmFuc2xhdGVSZWwsXG4gIHBvc09mT3V0c2lkZUVsLFxuICBzZW50ZVBvdixcbn0gZnJvbSAnLi91dGlsLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNWR0VsZW1lbnQodGFnTmFtZTogc3RyaW5nKTogU1ZHRWxlbWVudCB7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgdGFnTmFtZSk7XG59XG5cbmludGVyZmFjZSBTaGFwZSB7XG4gIHNoYXBlOiBEcmF3U2hhcGU7XG4gIGhhc2g6IEhhc2g7XG4gIGN1cnJlbnQ/OiBib29sZWFuO1xufVxuXG50eXBlIEFycm93RGVzdHMgPSBNYXA8c2cuS2V5IHwgc2cuUGllY2VOYW1lLCBudW1iZXI+OyAvLyBob3cgbWFueSBhcnJvd3MgbGFuZCBvbiBhIHNxdWFyZVxuXG50eXBlIEhhc2ggPSBzdHJpbmc7XG5cbmNvbnN0IG91dHNpZGVBcnJvd0hhc2ggPSAnb3V0c2lkZUFycm93JztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclNoYXBlcyhcbiAgc3RhdGU6IFN0YXRlLFxuICBzdmc6IFNWR0VsZW1lbnQsXG4gIGN1c3RvbVN2ZzogU1ZHRWxlbWVudCxcbiAgZnJlZVBpZWNlczogSFRNTEVsZW1lbnRcbik6IHZvaWQge1xuICBjb25zdCBkID0gc3RhdGUuZHJhd2FibGUsXG4gICAgY3VyRCA9IGQuY3VycmVudCxcbiAgICBjdXIgPSBjdXJEPy5kZXN0ID8gKGN1ckQgYXMgRHJhd1NoYXBlKSA6IHVuZGVmaW5lZCxcbiAgICBvdXRzaWRlQXJyb3cgPSAhIWN1ckQgJiYgIWN1cixcbiAgICBhcnJvd0Rlc3RzOiBBcnJvd0Rlc3RzID0gbmV3IE1hcCgpLFxuICAgIHBpZWNlTWFwID0gbmV3IE1hcDxzZy5LZXksIERyYXdTaGFwZT4oKTtcblxuICBjb25zdCBoYXNoQm91bmRzID0gKCkgPT4ge1xuICAgIC8vIHRvZG8gYWxzbyBwb3NzaWJsZSBwaWVjZSBib3VuZHNcbiAgICBjb25zdCBib3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpO1xuICAgIHJldHVybiAoYm91bmRzICYmIGJvdW5kcy53aWR0aC50b1N0cmluZygpICsgYm91bmRzLmhlaWdodCkgfHwgJyc7XG4gIH07XG5cbiAgZm9yIChjb25zdCBzIG9mIGQuc2hhcGVzLmNvbmNhdChkLmF1dG9TaGFwZXMpLmNvbmNhdChjdXIgPyBbY3VyXSA6IFtdKSkge1xuICAgIGNvbnN0IGRlc3ROYW1lID0gaXNQaWVjZShzLmRlc3QpID8gcGllY2VOYW1lT2Yocy5kZXN0KSA6IHMuZGVzdDtcbiAgICBpZiAoIXNhbWVQaWVjZU9yS2V5KHMuZGVzdCwgcy5vcmlnKSlcbiAgICAgIGFycm93RGVzdHMuc2V0KGRlc3ROYW1lLCAoYXJyb3dEZXN0cy5nZXQoZGVzdE5hbWUpIHx8IDApICsgMSk7XG4gIH1cblxuICBmb3IgKGNvbnN0IHMgb2YgZC5zaGFwZXMuY29uY2F0KGN1ciA/IFtjdXJdIDogW10pLmNvbmNhdChkLmF1dG9TaGFwZXMpKSB7XG4gICAgaWYgKHMucGllY2UgJiYgIWlzUGllY2Uocy5vcmlnKSkgcGllY2VNYXAuc2V0KHMub3JpZywgcyk7XG4gIH1cbiAgY29uc3QgcGllY2VTaGFwZXMgPSBbLi4ucGllY2VNYXAudmFsdWVzKCldLm1hcChzID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgc2hhcGU6IHMsXG4gICAgICBoYXNoOiBzaGFwZUhhc2gocywgYXJyb3dEZXN0cywgZmFsc2UsIGhhc2hCb3VuZHMpLFxuICAgIH07XG4gIH0pO1xuXG4gIGNvbnN0IHNoYXBlczogU2hhcGVbXSA9IGQuc2hhcGVzLmNvbmNhdChkLmF1dG9TaGFwZXMpLm1hcCgoczogRHJhd1NoYXBlKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNoYXBlOiBzLFxuICAgICAgaGFzaDogc2hhcGVIYXNoKHMsIGFycm93RGVzdHMsIGZhbHNlLCBoYXNoQm91bmRzKSxcbiAgICB9O1xuICB9KTtcbiAgaWYgKGN1cilcbiAgICBzaGFwZXMucHVzaCh7XG4gICAgICBzaGFwZTogY3VyLFxuICAgICAgaGFzaDogc2hhcGVIYXNoKGN1ciwgYXJyb3dEZXN0cywgdHJ1ZSwgaGFzaEJvdW5kcyksXG4gICAgICBjdXJyZW50OiB0cnVlLFxuICAgIH0pO1xuXG4gIGNvbnN0IGZ1bGxIYXNoID0gc2hhcGVzLm1hcChzYyA9PiBzYy5oYXNoKS5qb2luKCc7JykgKyAob3V0c2lkZUFycm93ID8gb3V0c2lkZUFycm93SGFzaCA6ICcnKTtcbiAgaWYgKGZ1bGxIYXNoID09PSBzdGF0ZS5kcmF3YWJsZS5wcmV2U3ZnSGFzaCkgcmV0dXJuO1xuICBzdGF0ZS5kcmF3YWJsZS5wcmV2U3ZnSGFzaCA9IGZ1bGxIYXNoO1xuXG4gIC8qXG4gICAgLS0gRE9NIGhpZXJhcmNoeSAtLVxuICAgIDxzdmcgY2xhc3M9XCJzZy1zaGFwZXNcIj4gKDw9IHN2ZylcbiAgICAgIDxkZWZzPlxuICAgICAgICAuLi4oZm9yIGJydXNoZXMpLi4uXG4gICAgICA8L2RlZnM+XG4gICAgICA8Zz5cbiAgICAgICAgLi4uKGZvciBhcnJvd3MgYW5kIGNpcmNsZXMpLi4uXG4gICAgICA8L2c+XG4gICAgPC9zdmc+XG4gICAgPHN2ZyBjbGFzcz1cInNnLWN1c3RvbS1zdmdzXCI+ICg8PSBjdXN0b21TdmcpXG4gICAgICA8Zz5cbiAgICAgICAgLi4uKGZvciBjdXN0b20gc3ZncykuLi5cbiAgICAgIDwvZz5cbiAgICA8c2ctZnJlZS1waWVjZXM+ICg8PSBmcmVlUGllY2VzKVxuICAgICAgLi4uKGZvciBwaWVjZXMpLi4uXG4gICAgPC9zZy1mcmVlLXBpZWNlcz5cbiAgICA8L3N2Zz5cbiAgKi9cbiAgY29uc3QgZGVmc0VsID0gc3ZnLnF1ZXJ5U2VsZWN0b3IoJ2RlZnMnKSBhcyBTVkdFbGVtZW50LFxuICAgIHNoYXBlc0VsID0gc3ZnLnF1ZXJ5U2VsZWN0b3IoJ2cnKSBhcyBTVkdFbGVtZW50LFxuICAgIGN1c3RvbVN2Z3NFbCA9IGN1c3RvbVN2Zy5xdWVyeVNlbGVjdG9yKCdnJykgYXMgU1ZHRWxlbWVudDtcblxuICBzeW5jRGVmcyhzaGFwZXMsIG91dHNpZGVBcnJvdyA/IGN1ckQgOiB1bmRlZmluZWQsIGRlZnNFbCk7XG4gIHN5bmNTaGFwZXMoXG4gICAgc2hhcGVzLmZpbHRlcihzID0+ICFzLnNoYXBlLmN1c3RvbVN2ZyAmJiAoIXMuc2hhcGUucGllY2UgfHwgcy5jdXJyZW50KSksXG4gICAgc2hhcGVzRWwsXG4gICAgc2hhcGUgPT4gcmVuZGVyU1ZHU2hhcGUoc3RhdGUsIHNoYXBlLCBhcnJvd0Rlc3RzKSxcbiAgICBvdXRzaWRlQXJyb3dcbiAgKTtcbiAgc3luY1NoYXBlcyhcbiAgICBzaGFwZXMuZmlsdGVyKHMgPT4gcy5zaGFwZS5jdXN0b21TdmcpLFxuICAgIGN1c3RvbVN2Z3NFbCxcbiAgICBzaGFwZSA9PiByZW5kZXJTVkdTaGFwZShzdGF0ZSwgc2hhcGUsIGFycm93RGVzdHMpXG4gICk7XG4gIHN5bmNTaGFwZXMocGllY2VTaGFwZXMsIGZyZWVQaWVjZXMsIHNoYXBlID0+IHJlbmRlclBpZWNlKHN0YXRlLCBzaGFwZSkpO1xuXG4gIGlmICghb3V0c2lkZUFycm93ICYmIGN1ckQpIGN1ckQuYXJyb3cgPSB1bmRlZmluZWQ7XG5cbiAgaWYgKG91dHNpZGVBcnJvdyAmJiAhY3VyRC5hcnJvdykge1xuICAgIGNvbnN0IG9yaWcgPSBwaWVjZU9yS2V5VG9Qb3MoY3VyRC5vcmlnLCBzdGF0ZSk7XG4gICAgaWYgKG9yaWcpIHtcbiAgICAgIGNvbnN0IGcgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ2cnKSwge1xuICAgICAgICAgIGNsYXNzOiBzaGFwZUNsYXNzKGN1ckQuYnJ1c2gsIHRydWUsIHRydWUpLFxuICAgICAgICAgIHNnSGFzaDogb3V0c2lkZUFycm93SGFzaCxcbiAgICAgICAgfSksXG4gICAgICAgIGVsID0gcmVuZGVyQXJyb3coY3VyRC5icnVzaCwgb3JpZywgb3JpZywgc3RhdGUuc3F1YXJlUmF0aW8sIHRydWUsIGZhbHNlKTtcbiAgICAgIGcuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgY3VyRC5hcnJvdyA9IGVsO1xuICAgICAgc2hhcGVzRWwuYXBwZW5kQ2hpbGQoZyk7XG4gICAgfVxuICB9XG59XG5cbi8vIGFwcGVuZCBvbmx5LiBEb24ndCB0cnkgdG8gdXBkYXRlL3JlbW92ZS5cbmZ1bmN0aW9uIHN5bmNEZWZzKFxuICBzaGFwZXM6IFNoYXBlW10sXG4gIG91dHNpZGVTaGFwZTogRHJhd0N1cnJlbnQgfCB1bmRlZmluZWQsXG4gIGRlZnNFbDogU1ZHRWxlbWVudFxuKTogdm9pZCB7XG4gIGNvbnN0IGJydXNoZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgZm9yIChjb25zdCBzIG9mIHNoYXBlcykge1xuICAgIGlmICghc2FtZVBpZWNlT3JLZXkocy5zaGFwZS5kZXN0LCBzLnNoYXBlLm9yaWcpKSBicnVzaGVzLmFkZChzLnNoYXBlLmJydXNoKTtcbiAgfVxuICBpZiAob3V0c2lkZVNoYXBlKSBicnVzaGVzLmFkZChvdXRzaWRlU2hhcGUuYnJ1c2gpO1xuICBjb25zdCBrZXlzSW5Eb20gPSBuZXcgU2V0KCk7XG4gIGxldCBlbDogU1ZHRWxlbWVudCB8IHVuZGVmaW5lZCA9IGRlZnNFbC5maXJzdEVsZW1lbnRDaGlsZCBhcyBTVkdFbGVtZW50O1xuICB3aGlsZSAoZWwpIHtcbiAgICBrZXlzSW5Eb20uYWRkKGVsLmdldEF0dHJpYnV0ZSgnc2dLZXknKSk7XG4gICAgZWwgPSBlbC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgU1ZHRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgfVxuICBmb3IgKGNvbnN0IGtleSBvZiBicnVzaGVzKSB7XG4gICAgY29uc3QgYnJ1c2ggPSBrZXkgfHwgJ3ByaW1hcnknO1xuICAgIGlmICgha2V5c0luRG9tLmhhcyhicnVzaCkpIGRlZnNFbC5hcHBlbmRDaGlsZChyZW5kZXJNYXJrZXIoYnJ1c2gpKTtcbiAgfVxufVxuXG4vLyBhcHBlbmQgYW5kIHJlbW92ZSBvbmx5LiBObyB1cGRhdGVzLlxuZXhwb3J0IGZ1bmN0aW9uIHN5bmNTaGFwZXMoXG4gIHNoYXBlczogU2hhcGVbXSxcbiAgcm9vdDogSFRNTEVsZW1lbnQgfCBTVkdFbGVtZW50LFxuICByZW5kZXJTaGFwZTogKHNoYXBlOiBTaGFwZSkgPT4gSFRNTEVsZW1lbnQgfCBTVkdFbGVtZW50IHwgdW5kZWZpbmVkLFxuICBvdXRzaWRlQXJyb3c/OiBib29sZWFuXG4pOiB2b2lkIHtcbiAgY29uc3QgaGFzaGVzSW5Eb20gPSBuZXcgTWFwKCksIC8vIGJ5IGhhc2hcbiAgICB0b1JlbW92ZTogU1ZHRWxlbWVudFtdID0gW107XG4gIGZvciAoY29uc3Qgc2Mgb2Ygc2hhcGVzKSBoYXNoZXNJbkRvbS5zZXQoc2MuaGFzaCwgZmFsc2UpO1xuICBpZiAob3V0c2lkZUFycm93KSBoYXNoZXNJbkRvbS5zZXQob3V0c2lkZUFycm93SGFzaCwgdHJ1ZSk7XG4gIGxldCBlbDogU1ZHRWxlbWVudCB8IHVuZGVmaW5lZCA9IHJvb3QuZmlyc3RFbGVtZW50Q2hpbGQgYXMgU1ZHRWxlbWVudCxcbiAgICBlbEhhc2g6IEhhc2g7XG4gIHdoaWxlIChlbCkge1xuICAgIGVsSGFzaCA9IGVsLmdldEF0dHJpYnV0ZSgnc2dIYXNoJykhO1xuICAgIC8vIGZvdW5kIGEgc2hhcGUgZWxlbWVudCB0aGF0J3MgaGVyZSB0byBzdGF5XG4gICAgaWYgKGhhc2hlc0luRG9tLmhhcyhlbEhhc2gpKSBoYXNoZXNJbkRvbS5zZXQoZWxIYXNoLCB0cnVlKTtcbiAgICAvLyBvciByZW1vdmUgaXRcbiAgICBlbHNlIHRvUmVtb3ZlLnB1c2goZWwpO1xuICAgIGVsID0gZWwubmV4dEVsZW1lbnRTaWJsaW5nIGFzIFNWR0VsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIH1cbiAgLy8gcmVtb3ZlIG9sZCBzaGFwZXNcbiAgZm9yIChjb25zdCBlbCBvZiB0b1JlbW92ZSkgcm9vdC5yZW1vdmVDaGlsZChlbCk7XG4gIC8vIGluc2VydCBzaGFwZXMgdGhhdCBhcmUgbm90IHlldCBpbiBkb21cbiAgZm9yIChjb25zdCBzYyBvZiBzaGFwZXMpIHtcbiAgICBpZiAoIWhhc2hlc0luRG9tLmdldChzYy5oYXNoKSkge1xuICAgICAgY29uc3Qgc2hhcGVFbCA9IHJlbmRlclNoYXBlKHNjKTtcbiAgICAgIGlmIChzaGFwZUVsKSByb290LmFwcGVuZENoaWxkKHNoYXBlRWwpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzaGFwZUhhc2goXG4gIHsgb3JpZywgZGVzdCwgYnJ1c2gsIHBpZWNlLCBjdXN0b21TdmcsIGRlc2NyaXB0aW9uIH06IERyYXdTaGFwZSxcbiAgYXJyb3dEZXN0czogQXJyb3dEZXN0cyxcbiAgY3VycmVudDogYm9vbGVhbixcbiAgYm91bmRIYXNoOiAoKSA9PiBzdHJpbmdcbik6IEhhc2gge1xuICByZXR1cm4gW1xuICAgIGN1cnJlbnQsXG4gICAgKGlzUGllY2Uob3JpZykgfHwgaXNQaWVjZShkZXN0KSkgJiYgYm91bmRIYXNoKCksXG4gICAgaXNQaWVjZShvcmlnKSA/IHBpZWNlSGFzaChvcmlnKSA6IG9yaWcsXG4gICAgaXNQaWVjZShkZXN0KSA/IHBpZWNlSGFzaChkZXN0KSA6IGRlc3QsXG4gICAgYnJ1c2gsXG4gICAgKGFycm93RGVzdHMuZ2V0KGlzUGllY2UoZGVzdCkgPyBwaWVjZU5hbWVPZihkZXN0KSA6IGRlc3QpIHx8IDApID4gMSxcbiAgICBwaWVjZSAmJiBwaWVjZUhhc2gocGllY2UpLFxuICAgIGN1c3RvbVN2ZyAmJiBjdXN0b21TdmdIYXNoKGN1c3RvbVN2ZyksXG4gICAgZGVzY3JpcHRpb24sXG4gIF1cbiAgICAuZmlsdGVyKHggPT4geClcbiAgICAuam9pbignLCcpO1xufVxuXG5mdW5jdGlvbiBwaWVjZUhhc2gocGllY2U6IERyYXdTaGFwZVBpZWNlKTogSGFzaCB7XG4gIHJldHVybiBbcGllY2UuY29sb3IsIHBpZWNlLnJvbGUsIHBpZWNlLnNjYWxlXS5maWx0ZXIoeCA9PiB4KS5qb2luKCcsJyk7XG59XG5cbmZ1bmN0aW9uIGN1c3RvbVN2Z0hhc2goczogc3RyaW5nKTogSGFzaCB7XG4gIC8vIFJvbGxpbmcgaGFzaCB3aXRoIGJhc2UgMzEgKGNmLiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy83NjE2NDYxL2dlbmVyYXRlLWEtaGFzaC1mcm9tLXN0cmluZy1pbi1qYXZhc2NyaXB0KVxuICBsZXQgaCA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcy5sZW5ndGg7IGkrKykge1xuICAgIGggPSAoKGggPDwgNSkgLSBoICsgcy5jaGFyQ29kZUF0KGkpKSA+Pj4gMDtcbiAgfVxuICByZXR1cm4gJ2N1c3RvbS0nICsgaC50b1N0cmluZygpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJTVkdTaGFwZShcbiAgc3RhdGU6IFN0YXRlLFxuICB7IHNoYXBlLCBjdXJyZW50LCBoYXNoIH06IFNoYXBlLFxuICBhcnJvd0Rlc3RzOiBBcnJvd0Rlc3RzXG4pOiBTVkdFbGVtZW50IHwgdW5kZWZpbmVkIHtcbiAgY29uc3Qgb3JpZyA9IHBpZWNlT3JLZXlUb1BvcyhzaGFwZS5vcmlnLCBzdGF0ZSk7XG4gIGlmICghb3JpZykgcmV0dXJuO1xuICBpZiAoc2hhcGUuY3VzdG9tU3ZnKSB7XG4gICAgcmV0dXJuIHJlbmRlckN1c3RvbVN2ZyhzaGFwZS5icnVzaCwgc2hhcGUuY3VzdG9tU3ZnLCBvcmlnLCBzdGF0ZS5zcXVhcmVSYXRpbyk7XG4gIH0gZWxzZSB7XG4gICAgbGV0IGVsOiBTVkdFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgIGNvbnN0IGRlc3QgPSAhc2FtZVBpZWNlT3JLZXkoc2hhcGUub3JpZywgc2hhcGUuZGVzdCkgJiYgcGllY2VPcktleVRvUG9zKHNoYXBlLmRlc3QsIHN0YXRlKTtcbiAgICBpZiAoZGVzdCkge1xuICAgICAgZWwgPSByZW5kZXJBcnJvdyhcbiAgICAgICAgc2hhcGUuYnJ1c2gsXG4gICAgICAgIG9yaWcsXG4gICAgICAgIGRlc3QsXG4gICAgICAgIHN0YXRlLnNxdWFyZVJhdGlvLFxuICAgICAgICAhIWN1cnJlbnQsXG4gICAgICAgIChhcnJvd0Rlc3RzLmdldChpc1BpZWNlKHNoYXBlLmRlc3QpID8gcGllY2VOYW1lT2Yoc2hhcGUuZGVzdCkgOiBzaGFwZS5kZXN0KSB8fCAwKSA+IDFcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmIChzYW1lUGllY2VPcktleShzaGFwZS5kZXN0LCBzaGFwZS5vcmlnKSkge1xuICAgICAgbGV0IHJhdGlvOiBzZy5OdW1iZXJQYWlyID0gc3RhdGUuc3F1YXJlUmF0aW87XG4gICAgICBpZiAoaXNQaWVjZShzaGFwZS5vcmlnKSkge1xuICAgICAgICBjb25zdCBwaWVjZUJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMoKS5nZXQocGllY2VOYW1lT2Yoc2hhcGUub3JpZykpLFxuICAgICAgICAgIGJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gICAgICAgIGlmIChwaWVjZUJvdW5kcyAmJiBib3VuZHMpIHtcbiAgICAgICAgICBjb25zdCBoZWlnaHRCYXNlID0gcGllY2VCb3VuZHMuaGVpZ2h0IC8gKGJvdW5kcy5oZWlnaHQgLyBzdGF0ZS5kaW1lbnNpb25zLnJhbmtzKTtcbiAgICAgICAgICAvLyB3ZSB3YW50IHRvIGtlZXAgdGhlIHJhdGlvIHRoYXQgaXMgb24gdGhlIGJvYXJkXG4gICAgICAgICAgcmF0aW8gPSBbaGVpZ2h0QmFzZSAqIHN0YXRlLnNxdWFyZVJhdGlvWzBdLCBoZWlnaHRCYXNlICogc3RhdGUuc3F1YXJlUmF0aW9bMV1dO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbCA9IHJlbmRlckVsbGlwc2Uob3JpZywgcmF0aW8sICEhY3VycmVudCk7XG4gICAgfVxuICAgIGlmIChlbCkge1xuICAgICAgY29uc3QgZyA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnZycpLCB7XG4gICAgICAgIGNsYXNzOiBzaGFwZUNsYXNzKHNoYXBlLmJydXNoLCAhIWN1cnJlbnQsIGZhbHNlKSxcbiAgICAgICAgc2dIYXNoOiBoYXNoLFxuICAgICAgfSk7XG4gICAgICBnLmFwcGVuZENoaWxkKGVsKTtcbiAgICAgIGNvbnN0IGRlc2NFbCA9IHNoYXBlLmRlc2NyaXB0aW9uICYmIHJlbmRlckRlc2NyaXB0aW9uKHN0YXRlLCBzaGFwZSwgYXJyb3dEZXN0cyk7XG4gICAgICBpZiAoZGVzY0VsKSBnLmFwcGVuZENoaWxkKGRlc2NFbCk7XG4gICAgICByZXR1cm4gZztcbiAgICB9IGVsc2UgcmV0dXJuO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlckN1c3RvbVN2ZyhcbiAgYnJ1c2g6IHN0cmluZyxcbiAgY3VzdG9tU3ZnOiBzdHJpbmcsXG4gIHBvczogc2cuUG9zLFxuICByYXRpbzogc2cuTnVtYmVyUGFpclxuKTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IFt4LCB5XSA9IHBvcztcblxuICAvLyBUcmFuc2xhdGUgdG8gdG9wLWxlZnQgb2YgYG9yaWdgIHNxdWFyZVxuICBjb25zdCBnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdnJyksIHsgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7eH0sJHt5fSlgIH0pO1xuXG4gIGNvbnN0IHN2ZyA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnc3ZnJyksIHtcbiAgICBjbGFzczogYnJ1c2gsXG4gICAgd2lkdGg6IHJhdGlvWzBdLFxuICAgIGhlaWdodDogcmF0aW9bMV0sXG4gICAgdmlld0JveDogYDAgMCAke3JhdGlvWzBdICogMTB9ICR7cmF0aW9bMV0gKiAxMH1gLFxuICB9KTtcblxuICBnLmFwcGVuZENoaWxkKHN2Zyk7XG4gIHN2Zy5pbm5lckhUTUwgPSBjdXN0b21Tdmc7XG5cbiAgcmV0dXJuIGc7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckVsbGlwc2UocG9zOiBzZy5Qb3MsIHJhdGlvOiBzZy5OdW1iZXJQYWlyLCBjdXJyZW50OiBib29sZWFuKTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IG8gPSBwb3MsXG4gICAgd2lkdGhzID0gZWxsaXBzZVdpZHRoKHJhdGlvKTtcbiAgcmV0dXJuIHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnZWxsaXBzZScpLCB7XG4gICAgJ3N0cm9rZS13aWR0aCc6IHdpZHRoc1tjdXJyZW50ID8gMCA6IDFdLFxuICAgIGZpbGw6ICdub25lJyxcbiAgICBjeDogb1swXSxcbiAgICBjeTogb1sxXSxcbiAgICByeDogcmF0aW9bMF0gLyAyIC0gd2lkdGhzWzFdIC8gMixcbiAgICByeTogcmF0aW9bMV0gLyAyIC0gd2lkdGhzWzFdIC8gMixcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckFycm93KFxuICBicnVzaDogc3RyaW5nLFxuICBvcmlnOiBzZy5Qb3MsXG4gIGRlc3Q6IHNnLlBvcyxcbiAgcmF0aW86IHNnLk51bWJlclBhaXIsXG4gIGN1cnJlbnQ6IGJvb2xlYW4sXG4gIHNob3J0ZW46IGJvb2xlYW5cbik6IFNWR0VsZW1lbnQge1xuICBjb25zdCBtID0gYXJyb3dNYXJnaW4oc2hvcnRlbiAmJiAhY3VycmVudCwgcmF0aW8pLFxuICAgIGEgPSBvcmlnLFxuICAgIGIgPSBkZXN0LFxuICAgIGR4ID0gYlswXSAtIGFbMF0sXG4gICAgZHkgPSBiWzFdIC0gYVsxXSxcbiAgICBhbmdsZSA9IE1hdGguYXRhbjIoZHksIGR4KSxcbiAgICB4byA9IE1hdGguY29zKGFuZ2xlKSAqIG0sXG4gICAgeW8gPSBNYXRoLnNpbihhbmdsZSkgKiBtO1xuICByZXR1cm4gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdsaW5lJyksIHtcbiAgICAnc3Ryb2tlLXdpZHRoJzogbGluZVdpZHRoKGN1cnJlbnQsIHJhdGlvKSxcbiAgICAnc3Ryb2tlLWxpbmVjYXAnOiAncm91bmQnLFxuICAgICdtYXJrZXItZW5kJzogJ3VybCgjYXJyb3doZWFkLScgKyAoYnJ1c2ggfHwgJ3ByaW1hcnknKSArICcpJyxcbiAgICB4MTogYVswXSxcbiAgICB5MTogYVsxXSxcbiAgICB4MjogYlswXSAtIHhvLFxuICAgIHkyOiBiWzFdIC0geW8sXG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyUGllY2Uoc3RhdGU6IFN0YXRlLCB7IHNoYXBlIH06IFNoYXBlKTogc2cuUGllY2VOb2RlIHwgdW5kZWZpbmVkIHtcbiAgaWYgKCFzaGFwZS5waWVjZSB8fCBpc1BpZWNlKHNoYXBlLm9yaWcpKSByZXR1cm47XG5cbiAgY29uc3Qgb3JpZyA9IHNoYXBlLm9yaWcsXG4gICAgc2NhbGUgPSAoc2hhcGUucGllY2Uuc2NhbGUgfHwgMSkgKiAoc3RhdGUuc2NhbGVEb3duUGllY2VzID8gMC41IDogMSk7XG5cbiAgY29uc3QgcGllY2VFbCA9IGNyZWF0ZUVsKCdwaWVjZScsIHBpZWNlTmFtZU9mKHNoYXBlLnBpZWNlKSkgYXMgc2cuUGllY2VOb2RlO1xuICBwaWVjZUVsLnNnS2V5ID0gb3JpZztcbiAgcGllY2VFbC5zZ1NjYWxlID0gc2NhbGU7XG4gIHRyYW5zbGF0ZVJlbChcbiAgICBwaWVjZUVsLFxuICAgIHBvc1RvVHJhbnNsYXRlUmVsKHN0YXRlLmRpbWVuc2lvbnMpKGtleTJwb3Mob3JpZyksIHNlbnRlUG92KHN0YXRlLm9yaWVudGF0aW9uKSksXG4gICAgc3RhdGUuc2NhbGVEb3duUGllY2VzID8gMC41IDogMSxcbiAgICBzY2FsZVxuICApO1xuXG4gIHJldHVybiBwaWVjZUVsO1xufVxuXG5mdW5jdGlvbiByZW5kZXJEZXNjcmlwdGlvbihcbiAgc3RhdGU6IFN0YXRlLFxuICBzaGFwZTogRHJhd1NoYXBlLFxuICBhcnJvd0Rlc3RzOiBBcnJvd0Rlc3RzXG4pOiBTVkdFbGVtZW50IHwgdW5kZWZpbmVkIHtcbiAgY29uc3Qgb3JpZyA9IHBpZWNlT3JLZXlUb1BvcyhzaGFwZS5vcmlnLCBzdGF0ZSk7XG4gIGlmICghb3JpZyB8fCAhc2hhcGUuZGVzY3JpcHRpb24pIHJldHVybjtcbiAgY29uc3QgZGVzdCA9ICFzYW1lUGllY2VPcktleShzaGFwZS5vcmlnLCBzaGFwZS5kZXN0KSAmJiBwaWVjZU9yS2V5VG9Qb3Moc2hhcGUuZGVzdCwgc3RhdGUpLFxuICAgIGRpZmYgPSBkZXN0ID8gW2Rlc3RbMF0gLSBvcmlnWzBdLCBkZXN0WzFdIC0gb3JpZ1sxXV0gOiBbMCwgMF0sXG4gICAgb2Zmc2V0ID1cbiAgICAgIChhcnJvd0Rlc3RzLmdldChpc1BpZWNlKHNoYXBlLmRlc3QpID8gcGllY2VOYW1lT2Yoc2hhcGUuZGVzdCkgOiBzaGFwZS5kZXN0KSB8fCAwKSA+IDFcbiAgICAgICAgPyAwLjNcbiAgICAgICAgOiAwLjE1LFxuICAgIGNsb3NlID1cbiAgICAgIChkaWZmWzBdID09PSAwIHx8IE1hdGguYWJzKGRpZmZbMF0pID09PSBzdGF0ZS5zcXVhcmVSYXRpb1swXSkgJiZcbiAgICAgIChkaWZmWzFdID09PSAwIHx8IE1hdGguYWJzKGRpZmZbMV0pID09PSBzdGF0ZS5zcXVhcmVSYXRpb1sxXSksXG4gICAgcmF0aW8gPSBkZXN0ID8gMC41NSAtIChjbG9zZSA/IG9mZnNldCA6IDApIDogMCxcbiAgICBtaWQ6IHNnLlBvcyA9IFtvcmlnWzBdICsgZGlmZlswXSAqIHJhdGlvLCBvcmlnWzFdICsgZGlmZlsxXSAqIHJhdGlvXSxcbiAgICB0ZXh0TGVuZ3RoID0gc2hhcGUuZGVzY3JpcHRpb24ubGVuZ3RoO1xuICBjb25zdCBnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdnJyksIHsgY2xhc3M6ICdkZXNjcmlwdGlvbicgfSksXG4gICAgY2lyY2xlID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdlbGxpcHNlJyksIHtcbiAgICAgIGN4OiBtaWRbMF0sXG4gICAgICBjeTogbWlkWzFdLFxuICAgICAgcng6IHRleHRMZW5ndGggKyAxLjUsXG4gICAgICByeTogMi41LFxuICAgIH0pLFxuICAgIHRleHQgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ3RleHQnKSwge1xuICAgICAgeDogbWlkWzBdLFxuICAgICAgeTogbWlkWzFdLFxuICAgICAgJ3RleHQtYW5jaG9yJzogJ21pZGRsZScsXG4gICAgICAnZG9taW5hbnQtYmFzZWxpbmUnOiAnY2VudHJhbCcsXG4gICAgfSk7XG4gIGcuYXBwZW5kQ2hpbGQoY2lyY2xlKTtcbiAgdGV4dC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzaGFwZS5kZXNjcmlwdGlvbikpO1xuICBnLmFwcGVuZENoaWxkKHRleHQpO1xuICByZXR1cm4gZztcbn1cblxuZnVuY3Rpb24gcmVuZGVyTWFya2VyKGJydXNoOiBzdHJpbmcpOiBTVkdFbGVtZW50IHtcbiAgY29uc3QgbWFya2VyID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdtYXJrZXInKSwge1xuICAgIGlkOiAnYXJyb3doZWFkLScgKyBicnVzaCxcbiAgICBvcmllbnQ6ICdhdXRvJyxcbiAgICBtYXJrZXJXaWR0aDogNCxcbiAgICBtYXJrZXJIZWlnaHQ6IDgsXG4gICAgcmVmWDogMi4wNSxcbiAgICByZWZZOiAyLjAxLFxuICB9KTtcbiAgbWFya2VyLmFwcGVuZENoaWxkKFxuICAgIHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgncGF0aCcpLCB7XG4gICAgICBkOiAnTTAsMCBWNCBMMywyIFonLFxuICAgIH0pXG4gICk7XG4gIG1hcmtlci5zZXRBdHRyaWJ1dGUoJ3NnS2V5JywgYnJ1c2gpO1xuICByZXR1cm4gbWFya2VyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0QXR0cmlidXRlcyhlbDogU1ZHRWxlbWVudCwgYXR0cnM6IFJlY29yZDxzdHJpbmcsIGFueT4pOiBTVkdFbGVtZW50IHtcbiAgZm9yIChjb25zdCBrZXkgaW4gYXR0cnMpIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGF0dHJzLCBrZXkpKSBlbC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyc1trZXldKTtcbiAgfVxuICByZXR1cm4gZWw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwb3MydXNlcihcbiAgcG9zOiBzZy5Qb3MsXG4gIGNvbG9yOiBzZy5Db2xvcixcbiAgZGltczogc2cuRGltZW5zaW9ucyxcbiAgcmF0aW86IHNnLk51bWJlclBhaXJcbik6IHNnLk51bWJlclBhaXIge1xuICByZXR1cm4gY29sb3IgPT09ICdzZW50ZSdcbiAgICA/IFsoZGltcy5maWxlcyAtIDEgLSBwb3NbMF0pICogcmF0aW9bMF0sIHBvc1sxXSAqIHJhdGlvWzFdXVxuICAgIDogW3Bvc1swXSAqIHJhdGlvWzBdLCAoZGltcy5yYW5rcyAtIDEgLSBwb3NbMV0pICogcmF0aW9bMV1dO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQaWVjZSh4OiBzZy5LZXkgfCBzZy5QaWVjZSk6IHggaXMgc2cuUGllY2Uge1xuICByZXR1cm4gdHlwZW9mIHggPT09ICdvYmplY3QnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2FtZVBpZWNlT3JLZXkoa3AxOiBzZy5LZXkgfCBzZy5QaWVjZSwga3AyOiBzZy5LZXkgfCBzZy5QaWVjZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKGlzUGllY2Uoa3AxKSAmJiBpc1BpZWNlKGtwMikgJiYgc2FtZVBpZWNlKGtwMSwga3AyKSkgfHwga3AxID09PSBrcDI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VzQm91bmRzKHNoYXBlczogRHJhd1NoYXBlW10pOiBib29sZWFuIHtcbiAgcmV0dXJuIHNoYXBlcy5zb21lKHMgPT4gaXNQaWVjZShzLm9yaWcpIHx8IGlzUGllY2Uocy5kZXN0KSk7XG59XG5cbmZ1bmN0aW9uIHNoYXBlQ2xhc3MoYnJ1c2g6IHN0cmluZywgY3VycmVudDogYm9vbGVhbiwgb3V0c2lkZTogYm9vbGVhbik6IHN0cmluZyB7XG4gIHJldHVybiBicnVzaCArIChjdXJyZW50ID8gJyBjdXJyZW50JyA6ICcnKSArIChvdXRzaWRlID8gJyBvdXRzaWRlJyA6ICcnKTtcbn1cblxuZnVuY3Rpb24gcmF0aW9BdmVyYWdlKHJhdGlvOiBzZy5OdW1iZXJQYWlyKTogbnVtYmVyIHtcbiAgcmV0dXJuIChyYXRpb1swXSArIHJhdGlvWzFdKSAvIDI7XG59XG5cbmZ1bmN0aW9uIGVsbGlwc2VXaWR0aChyYXRpbzogc2cuTnVtYmVyUGFpcik6IFtudW1iZXIsIG51bWJlcl0ge1xuICByZXR1cm4gWygzIC8gNjQpICogcmF0aW9BdmVyYWdlKHJhdGlvKSwgKDQgLyA2NCkgKiByYXRpb0F2ZXJhZ2UocmF0aW8pXTtcbn1cblxuZnVuY3Rpb24gbGluZVdpZHRoKGN1cnJlbnQ6IGJvb2xlYW4sIHJhdGlvOiBzZy5OdW1iZXJQYWlyKTogbnVtYmVyIHtcbiAgcmV0dXJuICgoY3VycmVudCA/IDguNSA6IDEwKSAvIDY0KSAqIHJhdGlvQXZlcmFnZShyYXRpbyk7XG59XG5cbmZ1bmN0aW9uIGFycm93TWFyZ2luKHNob3J0ZW46IGJvb2xlYW4sIHJhdGlvOiBzZy5OdW1iZXJQYWlyKTogbnVtYmVyIHtcbiAgcmV0dXJuICgoc2hvcnRlbiA/IDIwIDogMTApIC8gNjQpICogcmF0aW9BdmVyYWdlKHJhdGlvKTtcbn1cblxuZnVuY3Rpb24gcGllY2VPcktleVRvUG9zKGtwOiBzZy5LZXkgfCBzZy5QaWVjZSwgc3RhdGU6IFN0YXRlKTogc2cuUG9zIHwgdW5kZWZpbmVkIHtcbiAgaWYgKGlzUGllY2Uoa3ApKSB7XG4gICAgY29uc3QgcGllY2VCb3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzKCkuZ2V0KHBpZWNlTmFtZU9mKGtwKSksXG4gICAgICBib3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpLFxuICAgICAgb2Zmc2V0ID0gc2VudGVQb3Yoc3RhdGUub3JpZW50YXRpb24pID8gWzAuNSwgLTAuNV0gOiBbLTAuNSwgMC41XSxcbiAgICAgIHBvcyA9XG4gICAgICAgIHBpZWNlQm91bmRzICYmXG4gICAgICAgIGJvdW5kcyAmJlxuICAgICAgICBwb3NPZk91dHNpZGVFbChcbiAgICAgICAgICBwaWVjZUJvdW5kcy5sZWZ0ICsgcGllY2VCb3VuZHMud2lkdGggLyAyLFxuICAgICAgICAgIHBpZWNlQm91bmRzLnRvcCArIHBpZWNlQm91bmRzLmhlaWdodCAvIDIsXG4gICAgICAgICAgc2VudGVQb3Yoc3RhdGUub3JpZW50YXRpb24pLFxuICAgICAgICAgIHN0YXRlLmRpbWVuc2lvbnMsXG4gICAgICAgICAgYm91bmRzXG4gICAgICAgICk7XG4gICAgcmV0dXJuIChcbiAgICAgIHBvcyAmJlxuICAgICAgcG9zMnVzZXIoXG4gICAgICAgIFtwb3NbMF0gKyBvZmZzZXRbMF0sIHBvc1sxXSArIG9mZnNldFsxXV0sXG4gICAgICAgIHN0YXRlLm9yaWVudGF0aW9uLFxuICAgICAgICBzdGF0ZS5kaW1lbnNpb25zLFxuICAgICAgICBzdGF0ZS5zcXVhcmVSYXRpb1xuICAgICAgKVxuICAgICk7XG4gIH0gZWxzZSByZXR1cm4gcG9zMnVzZXIoa2V5MnBvcyhrcCksIHN0YXRlLm9yaWVudGF0aW9uLCBzdGF0ZS5kaW1lbnNpb25zLCBzdGF0ZS5zcXVhcmVSYXRpbyk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IHVuc2VsZWN0LCBjYW5jZWxNb3ZlT3JEcm9wIH0gZnJvbSAnLi9ib2FyZC5qcyc7XG5pbXBvcnQge1xuICBldmVudFBvc2l0aW9uLFxuICBpc1JpZ2h0QnV0dG9uLFxuICBwb3NPZk91dHNpZGVFbCxcbiAgc2FtZVBpZWNlLFxuICBnZXRIYW5kUGllY2VBdERvbVBvcyxcbiAgZ2V0S2V5QXREb21Qb3MsXG4gIHNlbnRlUG92LFxufSBmcm9tICcuL3V0aWwuanMnO1xuaW1wb3J0IHsgaXNQaWVjZSwgcG9zMnVzZXIsIHNhbWVQaWVjZU9yS2V5LCBzZXRBdHRyaWJ1dGVzIH0gZnJvbSAnLi9zaGFwZXMuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdTaGFwZSB7XG4gIG9yaWc6IHNnLktleSB8IHNnLlBpZWNlO1xuICBkZXN0OiBzZy5LZXkgfCBzZy5QaWVjZTtcbiAgcGllY2U/OiBEcmF3U2hhcGVQaWVjZTtcbiAgY3VzdG9tU3ZnPzogc3RyaW5nOyAvLyBzdmdcbiAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG4gIGJydXNoOiBzdHJpbmc7IC8vIGNzcyBjbGFzcyB0byBiZSBhcHBlbmRlZFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNxdWFyZUhpZ2hsaWdodCB7XG4gIGtleTogc2cuS2V5O1xuICBjbGFzc05hbWU6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEcmF3U2hhcGVQaWVjZSB7XG4gIHJvbGU6IHNnLlJvbGVTdHJpbmc7XG4gIGNvbG9yOiBzZy5Db2xvcjtcbiAgc2NhbGU/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd2FibGUge1xuICBlbmFibGVkOiBib29sZWFuOyAvLyBjYW4gZHJhd1xuICB2aXNpYmxlOiBib29sZWFuOyAvLyBjYW4gdmlld1xuICBmb3JjZWQ6IGJvb2xlYW47IC8vIGNhbiBvbmx5IGRyYXdcbiAgZXJhc2VPbkNsaWNrOiBib29sZWFuO1xuICBvbkNoYW5nZT86IChzaGFwZXM6IERyYXdTaGFwZVtdKSA9PiB2b2lkO1xuICBzaGFwZXM6IERyYXdTaGFwZVtdOyAvLyB1c2VyIHNoYXBlc1xuICBhdXRvU2hhcGVzOiBEcmF3U2hhcGVbXTsgLy8gY29tcHV0ZXIgc2hhcGVzXG4gIHNxdWFyZXM6IFNxdWFyZUhpZ2hsaWdodFtdO1xuICBjdXJyZW50PzogRHJhd0N1cnJlbnQ7XG4gIHByZXZTdmdIYXNoOiBzdHJpbmc7XG4gIHBpZWNlPzogc2cuUGllY2U7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd0N1cnJlbnQge1xuICBvcmlnOiBzZy5LZXkgfCBzZy5QaWVjZTtcbiAgZGVzdD86IHNnLktleSB8IHNnLlBpZWNlOyAvLyB1bmRlZmluZWQgaWYgb3V0c2lkZSBib2FyZC9oYW5kc1xuICBhcnJvdz86IFNWR0VsZW1lbnQ7XG4gIHBpZWNlPzogc2cuUGllY2U7XG4gIHBvczogc2cuTnVtYmVyUGFpcjtcbiAgYnJ1c2g6IHN0cmluZzsgLy8gYnJ1c2ggbmFtZSBmb3Igc2hhcGVcbn1cblxuY29uc3QgYnJ1c2hlcyA9IFsncHJpbWFyeScsICdhbHRlcm5hdGl2ZTAnLCAnYWx0ZXJuYXRpdmUxJywgJ2FsdGVybmF0aXZlMiddO1xuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnQoc3RhdGU6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIC8vIHN1cHBvcnQgb25lIGZpbmdlciB0b3VjaCBvbmx5XG4gIGlmIChlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDEpIHJldHVybjtcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gIGlmIChlLmN0cmxLZXkpIHVuc2VsZWN0KHN0YXRlKTtcbiAgZWxzZSBjYW5jZWxNb3ZlT3JEcm9wKHN0YXRlKTtcblxuICBjb25zdCBwb3MgPSBldmVudFBvc2l0aW9uKGUpLFxuICAgIGJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCksXG4gICAgb3JpZyA9XG4gICAgICBwb3MgJiYgYm91bmRzICYmIGdldEtleUF0RG9tUG9zKHBvcywgc2VudGVQb3Yoc3RhdGUub3JpZW50YXRpb24pLCBzdGF0ZS5kaW1lbnNpb25zLCBib3VuZHMpLFxuICAgIHBpZWNlID0gc3RhdGUuZHJhd2FibGUucGllY2U7XG4gIGlmICghb3JpZykgcmV0dXJuO1xuICBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50ID0ge1xuICAgIG9yaWcsXG4gICAgZGVzdDogdW5kZWZpbmVkLFxuICAgIHBvcyxcbiAgICBwaWVjZSxcbiAgICBicnVzaDogZXZlbnRCcnVzaChlLCBpc1JpZ2h0QnV0dG9uKGUpIHx8IHN0YXRlLmRyYXdhYmxlLmZvcmNlZCksXG4gIH07XG4gIHByb2Nlc3NEcmF3KHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0RnJvbUhhbmQoc3RhdGU6IFN0YXRlLCBwaWVjZTogc2cuUGllY2UsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgLy8gc3VwcG9ydCBvbmUgZmluZ2VyIHRvdWNoIG9ubHlcbiAgaWYgKGUudG91Y2hlcyAmJiBlLnRvdWNoZXMubGVuZ3RoID4gMSkgcmV0dXJuO1xuICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgaWYgKGUuY3RybEtleSkgdW5zZWxlY3Qoc3RhdGUpO1xuICBlbHNlIGNhbmNlbE1vdmVPckRyb3Aoc3RhdGUpO1xuXG4gIGNvbnN0IHBvcyA9IGV2ZW50UG9zaXRpb24oZSk7XG4gIGlmICghcG9zKSByZXR1cm47XG4gIHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQgPSB7XG4gICAgb3JpZzogcGllY2UsXG4gICAgZGVzdDogdW5kZWZpbmVkLFxuICAgIHBvcyxcbiAgICBicnVzaDogZXZlbnRCcnVzaChlLCBpc1JpZ2h0QnV0dG9uKGUpIHx8IHN0YXRlLmRyYXdhYmxlLmZvcmNlZCksXG4gIH07XG4gIHByb2Nlc3NEcmF3KHN0YXRlKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0RyYXcoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgY29uc3QgY3VyID0gc3RhdGUuZHJhd2FibGUuY3VycmVudCxcbiAgICAgIGJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gICAgaWYgKGN1ciAmJiBib3VuZHMpIHtcbiAgICAgIGNvbnN0IGRlc3QgPVxuICAgICAgICBnZXRLZXlBdERvbVBvcyhjdXIucG9zLCBzZW50ZVBvdihzdGF0ZS5vcmllbnRhdGlvbiksIHN0YXRlLmRpbWVuc2lvbnMsIGJvdW5kcykgfHxcbiAgICAgICAgZ2V0SGFuZFBpZWNlQXREb21Qb3MoY3VyLnBvcywgc3RhdGUuaGFuZHMucm9sZXMsIHN0YXRlLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMoKSk7XG4gICAgICBpZiAoY3VyLmRlc3QgIT09IGRlc3QgJiYgIShjdXIuZGVzdCAmJiBkZXN0ICYmIHNhbWVQaWVjZU9yS2V5KGRlc3QsIGN1ci5kZXN0KSkpIHtcbiAgICAgICAgY3VyLmRlc3QgPSBkZXN0O1xuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3Tm93KCk7XG4gICAgICB9XG4gICAgICBjb25zdCBvdXRQb3MgPSBwb3NPZk91dHNpZGVFbChcbiAgICAgICAgY3VyLnBvc1swXSxcbiAgICAgICAgY3VyLnBvc1sxXSxcbiAgICAgICAgc2VudGVQb3Yoc3RhdGUub3JpZW50YXRpb24pLFxuICAgICAgICBzdGF0ZS5kaW1lbnNpb25zLFxuICAgICAgICBib3VuZHNcbiAgICAgICk7XG4gICAgICBpZiAoIWN1ci5kZXN0ICYmIGN1ci5hcnJvdyAmJiBvdXRQb3MpIHtcbiAgICAgICAgY29uc3QgZGVzdCA9IHBvczJ1c2VyKG91dFBvcywgc3RhdGUub3JpZW50YXRpb24sIHN0YXRlLmRpbWVuc2lvbnMsIHN0YXRlLnNxdWFyZVJhdGlvKTtcblxuICAgICAgICBzZXRBdHRyaWJ1dGVzKGN1ci5hcnJvdywge1xuICAgICAgICAgIHgyOiBkZXN0WzBdIC0gc3RhdGUuc3F1YXJlUmF0aW9bMF0gLyAyLFxuICAgICAgICAgIHkyOiBkZXN0WzFdIC0gc3RhdGUuc3F1YXJlUmF0aW9bMV0gLyAyLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHByb2Nlc3NEcmF3KHN0YXRlKTtcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZShzdGF0ZTogU3RhdGUsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQpIHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQucG9zID0gZXZlbnRQb3NpdGlvbihlKSE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmQoc3RhdGU6IFN0YXRlLCBfOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQ7XG4gIGlmIChjdXIpIHtcbiAgICBhZGRTaGFwZShzdGF0ZS5kcmF3YWJsZSwgY3VyKTtcbiAgICBjYW5jZWwoc3RhdGUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWwoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5kcmF3YWJsZS5jdXJyZW50KSB7XG4gICAgc3RhdGUuZHJhd2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBjb25zdCBkcmF3YWJsZUxlbmd0aCA9IHN0YXRlLmRyYXdhYmxlLnNoYXBlcy5sZW5ndGg7XG4gIGlmIChkcmF3YWJsZUxlbmd0aCB8fCBzdGF0ZS5kcmF3YWJsZS5waWVjZSkge1xuICAgIHN0YXRlLmRyYXdhYmxlLnNoYXBlcyA9IFtdO1xuICAgIHN0YXRlLmRyYXdhYmxlLnBpZWNlID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICBpZiAoZHJhd2FibGVMZW5ndGgpIG9uQ2hhbmdlKHN0YXRlLmRyYXdhYmxlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0RHJhd1BpZWNlKHN0YXRlOiBTdGF0ZSwgcGllY2U6IHNnLlBpZWNlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5kcmF3YWJsZS5waWVjZSAmJiBzYW1lUGllY2Uoc3RhdGUuZHJhd2FibGUucGllY2UsIHBpZWNlKSlcbiAgICBzdGF0ZS5kcmF3YWJsZS5waWVjZSA9IHVuZGVmaW5lZDtcbiAgZWxzZSBzdGF0ZS5kcmF3YWJsZS5waWVjZSA9IHBpZWNlO1xuICBzdGF0ZS5kb20ucmVkcmF3KCk7XG59XG5cbmZ1bmN0aW9uIGV2ZW50QnJ1c2goZTogc2cuTW91Y2hFdmVudCwgYWxsb3dGaXJzdE1vZGlmaWVyOiBib29sZWFuKTogc3RyaW5nIHtcbiAgY29uc3QgbW9kQSA9IGFsbG93Rmlyc3RNb2RpZmllciAmJiAoZS5zaGlmdEtleSB8fCBlLmN0cmxLZXkpLFxuICAgIG1vZEIgPSBlLmFsdEtleSB8fCBlLm1ldGFLZXkgfHwgZS5nZXRNb2RpZmllclN0YXRlPy4oJ0FsdEdyYXBoJyk7XG4gIHJldHVybiBicnVzaGVzWyhtb2RBID8gMSA6IDApICsgKG1vZEIgPyAyIDogMCldO1xufVxuXG5mdW5jdGlvbiBhZGRTaGFwZShkcmF3YWJsZTogRHJhd2FibGUsIGN1cjogRHJhd0N1cnJlbnQpOiB2b2lkIHtcbiAgaWYgKCFjdXIuZGVzdCkgcmV0dXJuO1xuXG4gIGNvbnN0IHNpbWlsYXJTaGFwZSA9IChzOiBEcmF3U2hhcGUpID0+XG4gICAgY3VyLmRlc3QgJiYgc2FtZVBpZWNlT3JLZXkoY3VyLm9yaWcsIHMub3JpZykgJiYgc2FtZVBpZWNlT3JLZXkoY3VyLmRlc3QsIHMuZGVzdCk7XG5cbiAgLy8gc2VwYXJhdGUgc2hhcGUgZm9yIHBpZWNlc1xuICBjb25zdCBwaWVjZSA9IGN1ci5waWVjZTtcbiAgY3VyLnBpZWNlID0gdW5kZWZpbmVkO1xuXG4gIGNvbnN0IHNpbWlsYXIgPSBkcmF3YWJsZS5zaGFwZXMuZmluZChzaW1pbGFyU2hhcGUpLFxuICAgIHJlbW92ZVBpZWNlID0gZHJhd2FibGUuc2hhcGVzLmZpbmQoXG4gICAgICBzID0+IHNpbWlsYXJTaGFwZShzKSAmJiBwaWVjZSAmJiBzLnBpZWNlICYmIHNhbWVQaWVjZShwaWVjZSwgcy5waWVjZSlcbiAgICApLFxuICAgIGRpZmZQaWVjZSA9IGRyYXdhYmxlLnNoYXBlcy5maW5kKFxuICAgICAgcyA9PiBzaW1pbGFyU2hhcGUocykgJiYgcGllY2UgJiYgcy5waWVjZSAmJiAhc2FtZVBpZWNlKHBpZWNlLCBzLnBpZWNlKVxuICAgICk7XG5cbiAgLy8gcmVtb3ZlIGV2ZXJ5IHNpbWlsYXIgc2hhcGVcbiAgaWYgKHNpbWlsYXIpIGRyYXdhYmxlLnNoYXBlcyA9IGRyYXdhYmxlLnNoYXBlcy5maWx0ZXIocyA9PiAhc2ltaWxhclNoYXBlKHMpKTtcblxuICBpZiAoIWlzUGllY2UoY3VyLm9yaWcpICYmIHBpZWNlICYmICFyZW1vdmVQaWVjZSkge1xuICAgIGRyYXdhYmxlLnNoYXBlcy5wdXNoKHsgb3JpZzogY3VyLm9yaWcsIGRlc3Q6IGN1ci5vcmlnLCBwaWVjZTogcGllY2UsIGJydXNoOiBjdXIuYnJ1c2ggfSk7XG4gICAgLy8gZm9yY2UgY2lyY2xlIGFyb3VuZCBkcmF3biBwaWVjZXNcbiAgICBpZiAoIXNhbWVQaWVjZU9yS2V5KGN1ci5vcmlnLCBjdXIuZGVzdCkpXG4gICAgICBkcmF3YWJsZS5zaGFwZXMucHVzaCh7IG9yaWc6IGN1ci5vcmlnLCBkZXN0OiBjdXIub3JpZywgYnJ1c2g6IGN1ci5icnVzaCB9KTtcbiAgfVxuXG4gIGlmICghc2ltaWxhciB8fCBkaWZmUGllY2UgfHwgc2ltaWxhci5icnVzaCAhPT0gY3VyLmJydXNoKSBkcmF3YWJsZS5zaGFwZXMucHVzaChjdXIgYXMgRHJhd1NoYXBlKTtcbiAgb25DaGFuZ2UoZHJhd2FibGUpO1xufVxuXG5mdW5jdGlvbiBvbkNoYW5nZShkcmF3YWJsZTogRHJhd2FibGUpOiB2b2lkIHtcbiAgaWYgKGRyYXdhYmxlLm9uQ2hhbmdlKSBkcmF3YWJsZS5vbkNoYW5nZShkcmF3YWJsZS5zaGFwZXMpO1xufVxuIiwgImltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgKiBhcyBib2FyZCBmcm9tICcuL2JvYXJkLmpzJztcbmltcG9ydCB7IGFkZFRvSGFuZCwgcmVtb3ZlRnJvbUhhbmQgfSBmcm9tICcuL2hhbmRzLmpzJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsLmpzJztcbmltcG9ydCB7IGNsZWFyIGFzIGRyYXdDbGVhciB9IGZyb20gJy4vZHJhdy5qcyc7XG5pbXBvcnQgeyBhbmltIH0gZnJvbSAnLi9hbmltLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBEcmFnQ3VycmVudCB7XG4gIHBpZWNlOiBzZy5QaWVjZTsgLy8gcGllY2UgYmVpbmcgZHJhZ2dlZFxuICBwb3M6IHNnLk51bWJlclBhaXI7IC8vIGxhdGVzdCBldmVudCBwb3NpdGlvblxuICBvcmlnUG9zOiBzZy5OdW1iZXJQYWlyOyAvLyBmaXJzdCBldmVudCBwb3NpdGlvblxuICBzdGFydGVkOiBib29sZWFuOyAvLyB3aGV0aGVyIHRoZSBkcmFnIGhhcyBzdGFydGVkOyBhcyBwZXIgdGhlIGRpc3RhbmNlIHNldHRpbmdcbiAgdG91Y2g6IGJvb2xlYW47IC8vIHdhcyB0aGUgZHJhZ2dpbmcgaW5pdGlhdGVkIGZyb20gdG91Y2ggZXZlbnRcbiAgb3JpZ2luVGFyZ2V0OiBFdmVudFRhcmdldCB8IG51bGw7XG4gIGZyb21Cb2FyZD86IHtcbiAgICBvcmlnOiBzZy5LZXk7IC8vIG9yaWcga2V5IG9mIGRyYWdnaW5nIHBpZWNlXG4gICAgcHJldmlvdXNseVNlbGVjdGVkPzogc2cuS2V5OyAvLyBzZWxlY3RlZCBwaWVjZSBiZWZvcmUgZHJhZyBiZWdhblxuICAgIGtleUhhc0NoYW5nZWQ6IGJvb2xlYW47IC8vIHdoZXRoZXIgdGhlIGRyYWcgaGFzIGxlZnQgdGhlIG9yaWcga2V5IG9yIHBpZWNlXG4gIH07XG4gIGZyb21PdXRzaWRlPzoge1xuICAgIG9yaWdpbkJvdW5kczogRE9NUmVjdCB8IHVuZGVmaW5lZDsgLy8gYm91bmRzIG9mIHRoZSBwaWVjZSB0aGF0IGluaXRpYXRlZCB0aGUgZHJhZ1xuICAgIGxlZnRPcmlnaW46IGJvb2xlYW47IC8vIGhhdmUgd2UgZXZlciBsZWZ0IG9yaWdpbkJvdW5kc1xuICAgIHByZXZpb3VzbHlTZWxlY3RlZFBpZWNlPzogc2cuUGllY2U7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydChzOiBTdGF0ZSwgZTogc2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICBjb25zdCBib3VuZHMgPSBzLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCksXG4gICAgcG9zaXRpb24gPSB1dGlsLmV2ZW50UG9zaXRpb24oZSksXG4gICAgb3JpZyA9XG4gICAgICBib3VuZHMgJiZcbiAgICAgIHBvc2l0aW9uICYmXG4gICAgICB1dGlsLmdldEtleUF0RG9tUG9zKHBvc2l0aW9uLCB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pLCBzLmRpbWVuc2lvbnMsIGJvdW5kcyk7XG5cbiAgaWYgKCFvcmlnKSByZXR1cm47XG5cbiAgY29uc3QgcGllY2UgPSBzLnBpZWNlcy5nZXQob3JpZyksXG4gICAgcHJldmlvdXNseVNlbGVjdGVkID0gcy5zZWxlY3RlZDtcbiAgaWYgKFxuICAgICFwcmV2aW91c2x5U2VsZWN0ZWQgJiZcbiAgICBzLmRyYXdhYmxlLmVuYWJsZWQgJiZcbiAgICAocy5kcmF3YWJsZS5lcmFzZU9uQ2xpY2sgfHwgIXBpZWNlIHx8IHBpZWNlLmNvbG9yICE9PSBzLnR1cm5Db2xvcilcbiAgKVxuICAgIGRyYXdDbGVhcihzKTtcblxuICAvLyBQcmV2ZW50IHRvdWNoIHNjcm9sbCBhbmQgY3JlYXRlIG5vIGNvcnJlc3BvbmRpbmcgbW91c2UgZXZlbnQsIGlmIHRoZXJlXG4gIC8vIGlzIGFuIGludGVudCB0byBpbnRlcmFjdCB3aXRoIHRoZSBib2FyZC5cbiAgaWYgKFxuICAgIGUuY2FuY2VsYWJsZSAhPT0gZmFsc2UgJiZcbiAgICAoIWUudG91Y2hlcyB8fFxuICAgICAgcy5ibG9ja1RvdWNoU2Nyb2xsIHx8XG4gICAgICBzLnNlbGVjdGVkUGllY2UgfHxcbiAgICAgIHBpZWNlIHx8XG4gICAgICBwcmV2aW91c2x5U2VsZWN0ZWQgfHxcbiAgICAgIHBpZWNlQ2xvc2VUbyhzLCBwb3NpdGlvbiwgYm91bmRzKSlcbiAgKVxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgY29uc3QgaGFkUHJlbW92ZSA9ICEhcy5wcmVtb3ZhYmxlLmN1cnJlbnQ7XG4gIGNvbnN0IGhhZFByZWRyb3AgPSAhIXMucHJlZHJvcHBhYmxlLmN1cnJlbnQ7XG4gIGlmIChzLnNlbGVjdGFibGUuZGVsZXRlT25Ub3VjaCkgYm9hcmQuZGVsZXRlUGllY2Uocywgb3JpZyk7XG4gIGVsc2UgaWYgKHMuc2VsZWN0ZWQpIHtcbiAgICBpZiAoIWJvYXJkLnByb21vdGlvbkRpYWxvZ01vdmUocywgcy5zZWxlY3RlZCwgb3JpZykpIHtcbiAgICAgIGlmIChib2FyZC5jYW5Nb3ZlKHMsIHMuc2VsZWN0ZWQsIG9yaWcpKSBhbmltKHN0YXRlID0+IGJvYXJkLnNlbGVjdFNxdWFyZShzdGF0ZSwgb3JpZyksIHMpO1xuICAgICAgZWxzZSBib2FyZC5zZWxlY3RTcXVhcmUocywgb3JpZyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHMuc2VsZWN0ZWRQaWVjZSkge1xuICAgIGlmICghYm9hcmQucHJvbW90aW9uRGlhbG9nRHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIG9yaWcpKSB7XG4gICAgICBpZiAoYm9hcmQuY2FuRHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIG9yaWcpKVxuICAgICAgICBhbmltKHN0YXRlID0+IGJvYXJkLnNlbGVjdFNxdWFyZShzdGF0ZSwgb3JpZyksIHMpO1xuICAgICAgZWxzZSBib2FyZC5zZWxlY3RTcXVhcmUocywgb3JpZyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGJvYXJkLnNlbGVjdFNxdWFyZShzLCBvcmlnKTtcbiAgfVxuXG4gIGNvbnN0IHN0aWxsU2VsZWN0ZWQgPSBzLnNlbGVjdGVkID09PSBvcmlnLFxuICAgIGRyYWdnZWRFbCA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkPy5kcmFnZ2VkO1xuXG4gIGlmIChwaWVjZSAmJiBkcmFnZ2VkRWwgJiYgc3RpbGxTZWxlY3RlZCAmJiBib2FyZC5pc0RyYWdnYWJsZShzLCBwaWVjZSkpIHtcbiAgICBjb25zdCB0b3VjaCA9IGUudHlwZSA9PT0gJ3RvdWNoc3RhcnQnO1xuXG4gICAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHtcbiAgICAgIHBpZWNlLFxuICAgICAgcG9zOiBwb3NpdGlvbixcbiAgICAgIG9yaWdQb3M6IHBvc2l0aW9uLFxuICAgICAgc3RhcnRlZDogcy5kcmFnZ2FibGUuYXV0b0Rpc3RhbmNlICYmICF0b3VjaCxcbiAgICAgIHRvdWNoLFxuICAgICAgb3JpZ2luVGFyZ2V0OiBlLnRhcmdldCxcbiAgICAgIGZyb21Cb2FyZDoge1xuICAgICAgICBvcmlnLFxuICAgICAgICBwcmV2aW91c2x5U2VsZWN0ZWQsXG4gICAgICAgIGtleUhhc0NoYW5nZWQ6IGZhbHNlLFxuICAgICAgfSxcbiAgICB9O1xuXG4gICAgZHJhZ2dlZEVsLnNnQ29sb3IgPSBwaWVjZS5jb2xvcjtcbiAgICBkcmFnZ2VkRWwuc2dSb2xlID0gcGllY2Uucm9sZTtcbiAgICBkcmFnZ2VkRWwuY2xhc3NOYW1lID0gYGRyYWdnaW5nICR7dXRpbC5waWVjZU5hbWVPZihwaWVjZSl9YDtcbiAgICBkcmFnZ2VkRWwuY2xhc3NMaXN0LnRvZ2dsZSgndG91Y2gnLCB0b3VjaCk7XG5cbiAgICBwcm9jZXNzRHJhZyhzKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoaGFkUHJlbW92ZSkgYm9hcmQudW5zZXRQcmVtb3ZlKHMpO1xuICAgIGlmIChoYWRQcmVkcm9wKSBib2FyZC51bnNldFByZWRyb3Aocyk7XG4gIH1cbiAgcy5kb20ucmVkcmF3KCk7XG59XG5cbmZ1bmN0aW9uIHBpZWNlQ2xvc2VUbyhzOiBTdGF0ZSwgcG9zOiBzZy5OdW1iZXJQYWlyLCBib3VuZHM6IERPTVJlY3QpOiBib29sZWFuIHtcbiAgY29uc3QgYXNTZW50ZSA9IHV0aWwuc2VudGVQb3Yocy5vcmllbnRhdGlvbiksXG4gICAgcmFkaXVzU3EgPSBNYXRoLnBvdyhib3VuZHMud2lkdGggLyBzLmRpbWVuc2lvbnMuZmlsZXMsIDIpO1xuICBmb3IgKGNvbnN0IGtleSBvZiBzLnBpZWNlcy5rZXlzKCkpIHtcbiAgICBjb25zdCBjZW50ZXIgPSB1dGlsLmNvbXB1dGVTcXVhcmVDZW50ZXIoa2V5LCBhc1NlbnRlLCBzLmRpbWVuc2lvbnMsIGJvdW5kcyk7XG4gICAgaWYgKHV0aWwuZGlzdGFuY2VTcShjZW50ZXIsIHBvcykgPD0gcmFkaXVzU3EpIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRyYWdOZXdQaWVjZShzOiBTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBlOiBzZy5Nb3VjaEV2ZW50LCBzcGFyZT86IGJvb2xlYW4pOiB2b2lkIHtcbiAgY29uc3QgcHJldmlvdXNseVNlbGVjdGVkUGllY2UgPSBzLnNlbGVjdGVkUGllY2UsXG4gICAgZHJhZ2dlZEVsID0gcy5kb20uZWxlbWVudHMuYm9hcmQ/LmRyYWdnZWQsXG4gICAgcG9zaXRpb24gPSB1dGlsLmV2ZW50UG9zaXRpb24oZSksXG4gICAgdG91Y2ggPSBlLnR5cGUgPT09ICd0b3VjaHN0YXJ0JztcblxuICBpZiAoIXByZXZpb3VzbHlTZWxlY3RlZFBpZWNlICYmICFzcGFyZSAmJiBzLmRyYXdhYmxlLmVuYWJsZWQgJiYgcy5kcmF3YWJsZS5lcmFzZU9uQ2xpY2spXG4gICAgZHJhd0NsZWFyKHMpO1xuXG4gIGlmICghc3BhcmUgJiYgcy5zZWxlY3RhYmxlLmRlbGV0ZU9uVG91Y2gpIHJlbW92ZUZyb21IYW5kKHMsIHBpZWNlKTtcbiAgZWxzZSBib2FyZC5zZWxlY3RQaWVjZShzLCBwaWVjZSwgc3BhcmUpO1xuXG4gIGNvbnN0IGhhZFByZW1vdmUgPSAhIXMucHJlbW92YWJsZS5jdXJyZW50LFxuICAgIGhhZFByZWRyb3AgPSAhIXMucHJlZHJvcHBhYmxlLmN1cnJlbnQsXG4gICAgc3RpbGxTZWxlY3RlZCA9IHMuc2VsZWN0ZWRQaWVjZSAmJiB1dGlsLnNhbWVQaWVjZShzLnNlbGVjdGVkUGllY2UsIHBpZWNlKTtcblxuICBpZiAoZHJhZ2dlZEVsICYmIHBvc2l0aW9uICYmIHMuc2VsZWN0ZWRQaWVjZSAmJiBzdGlsbFNlbGVjdGVkICYmIGJvYXJkLmlzRHJhZ2dhYmxlKHMsIHBpZWNlKSkge1xuICAgIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB7XG4gICAgICBwaWVjZTogcy5zZWxlY3RlZFBpZWNlLFxuICAgICAgcG9zOiBwb3NpdGlvbixcbiAgICAgIG9yaWdQb3M6IHBvc2l0aW9uLFxuICAgICAgdG91Y2gsXG4gICAgICBzdGFydGVkOiBzLmRyYWdnYWJsZS5hdXRvRGlzdGFuY2UgJiYgIXRvdWNoLFxuICAgICAgb3JpZ2luVGFyZ2V0OiBlLnRhcmdldCxcbiAgICAgIGZyb21PdXRzaWRlOiB7XG4gICAgICAgIG9yaWdpbkJvdW5kczogIXNwYXJlXG4gICAgICAgICAgPyBzLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMoKS5nZXQodXRpbC5waWVjZU5hbWVPZihwaWVjZSkpXG4gICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgIGxlZnRPcmlnaW46IGZhbHNlLFxuICAgICAgICBwcmV2aW91c2x5U2VsZWN0ZWRQaWVjZTogIXNwYXJlID8gcHJldmlvdXNseVNlbGVjdGVkUGllY2UgOiB1bmRlZmluZWQsXG4gICAgICB9LFxuICAgIH07XG5cbiAgICBkcmFnZ2VkRWwuc2dDb2xvciA9IHBpZWNlLmNvbG9yO1xuICAgIGRyYWdnZWRFbC5zZ1JvbGUgPSBwaWVjZS5yb2xlO1xuICAgIGRyYWdnZWRFbC5jbGFzc05hbWUgPSBgZHJhZ2dpbmcgJHt1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKX1gO1xuICAgIGRyYWdnZWRFbC5jbGFzc0xpc3QudG9nZ2xlKCd0b3VjaCcsIHRvdWNoKTtcblxuICAgIHByb2Nlc3NEcmFnKHMpO1xuICB9IGVsc2Uge1xuICAgIGlmIChoYWRQcmVtb3ZlKSBib2FyZC51bnNldFByZW1vdmUocyk7XG4gICAgaWYgKGhhZFByZWRyb3ApIGJvYXJkLnVuc2V0UHJlZHJvcChzKTtcbiAgfVxuICBzLmRvbS5yZWRyYXcoKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0RyYWcoczogU3RhdGUpOiB2b2lkIHtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBjb25zdCBjdXIgPSBzLmRyYWdnYWJsZS5jdXJyZW50LFxuICAgICAgZHJhZ2dlZEVsID0gcy5kb20uZWxlbWVudHMuYm9hcmQ/LmRyYWdnZWQsXG4gICAgICBib3VuZHMgPSBzLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gICAgaWYgKCFjdXIgfHwgIWRyYWdnZWRFbCB8fCAhYm91bmRzKSByZXR1cm47XG4gICAgLy8gY2FuY2VsIGFuaW1hdGlvbnMgd2hpbGUgZHJhZ2dpbmdcbiAgICBpZiAoY3VyLmZyb21Cb2FyZD8ub3JpZyAmJiBzLmFuaW1hdGlvbi5jdXJyZW50Py5wbGFuLmFuaW1zLmhhcyhjdXIuZnJvbUJvYXJkLm9yaWcpKVxuICAgICAgcy5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICAvLyBpZiBtb3ZpbmcgcGllY2UgaXMgZ29uZSwgY2FuY2VsXG4gICAgY29uc3Qgb3JpZ1BpZWNlID0gY3VyLmZyb21Cb2FyZCA/IHMucGllY2VzLmdldChjdXIuZnJvbUJvYXJkLm9yaWcpIDogY3VyLnBpZWNlO1xuICAgIGlmICghb3JpZ1BpZWNlIHx8ICF1dGlsLnNhbWVQaWVjZShvcmlnUGllY2UsIGN1ci5waWVjZSkpIGNhbmNlbChzKTtcbiAgICBlbHNlIHtcbiAgICAgIGlmIChcbiAgICAgICAgIWN1ci5zdGFydGVkICYmXG4gICAgICAgIHV0aWwuZGlzdGFuY2VTcShjdXIucG9zLCBjdXIub3JpZ1BvcykgPj0gTWF0aC5wb3cocy5kcmFnZ2FibGUuZGlzdGFuY2UsIDIpXG4gICAgICApIHtcbiAgICAgICAgY3VyLnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICBzLmRvbS5yZWRyYXcoKTtcbiAgICAgIH1cbiAgICAgIGlmIChjdXIuc3RhcnRlZCkge1xuICAgICAgICB1dGlsLnRyYW5zbGF0ZUFicyhcbiAgICAgICAgICBkcmFnZ2VkRWwsXG4gICAgICAgICAgW1xuICAgICAgICAgICAgY3VyLnBvc1swXSAtIGJvdW5kcy5sZWZ0IC0gYm91bmRzLndpZHRoIC8gKHMuZGltZW5zaW9ucy5maWxlcyAqIDIpLFxuICAgICAgICAgICAgY3VyLnBvc1sxXSAtIGJvdW5kcy50b3AgLSBib3VuZHMuaGVpZ2h0IC8gKHMuZGltZW5zaW9ucy5yYW5rcyAqIDIpLFxuICAgICAgICAgIF0sXG4gICAgICAgICAgcy5zY2FsZURvd25QaWVjZXMgPyAwLjUgOiAxXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKCFkcmFnZ2VkRWwuc2dEcmFnZ2luZykge1xuICAgICAgICAgIGRyYWdnZWRFbC5zZ0RyYWdnaW5nID0gdHJ1ZTtcbiAgICAgICAgICB1dGlsLnNldERpc3BsYXkoZHJhZ2dlZEVsLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBob3ZlciA9IHV0aWwuZ2V0S2V5QXREb21Qb3MoXG4gICAgICAgICAgY3VyLnBvcyxcbiAgICAgICAgICB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pLFxuICAgICAgICAgIHMuZGltZW5zaW9ucyxcbiAgICAgICAgICBib3VuZHNcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoY3VyLmZyb21Cb2FyZClcbiAgICAgICAgICBjdXIuZnJvbUJvYXJkLmtleUhhc0NoYW5nZWQgPSBjdXIuZnJvbUJvYXJkLmtleUhhc0NoYW5nZWQgfHwgY3VyLmZyb21Cb2FyZC5vcmlnICE9PSBob3ZlcjtcbiAgICAgICAgZWxzZSBpZiAoY3VyLmZyb21PdXRzaWRlKVxuICAgICAgICAgIGN1ci5mcm9tT3V0c2lkZS5sZWZ0T3JpZ2luID1cbiAgICAgICAgICAgIGN1ci5mcm9tT3V0c2lkZS5sZWZ0T3JpZ2luIHx8XG4gICAgICAgICAgICAoISFjdXIuZnJvbU91dHNpZGUub3JpZ2luQm91bmRzICYmXG4gICAgICAgICAgICAgICF1dGlsLmlzSW5zaWRlUmVjdChjdXIuZnJvbU91dHNpZGUub3JpZ2luQm91bmRzLCBjdXIucG9zKSk7XG5cbiAgICAgICAgLy8gaWYgdGhlIGhvdmVyZWQgc3F1YXJlIGNoYW5nZWRcbiAgICAgICAgaWYgKGhvdmVyICE9PSBzLmhvdmVyZWQpIHtcbiAgICAgICAgICB1cGRhdGVIb3ZlcmVkU3F1YXJlcyhzLCBob3Zlcik7XG4gICAgICAgICAgaWYgKGN1ci50b3VjaCAmJiBzLmRvbS5lbGVtZW50cy5ib2FyZD8uc3F1YXJlT3Zlcikge1xuICAgICAgICAgICAgaWYgKGhvdmVyICYmIHMuZHJhZ2dhYmxlLnNob3dUb3VjaFNxdWFyZU92ZXJsYXkpIHtcbiAgICAgICAgICAgICAgdXRpbC50cmFuc2xhdGVBYnMoXG4gICAgICAgICAgICAgICAgcy5kb20uZWxlbWVudHMuYm9hcmQuc3F1YXJlT3ZlcixcbiAgICAgICAgICAgICAgICB1dGlsLnBvc1RvVHJhbnNsYXRlQWJzKHMuZGltZW5zaW9ucywgYm91bmRzKShcbiAgICAgICAgICAgICAgICAgIHV0aWwua2V5MnBvcyhob3ZlciksXG4gICAgICAgICAgICAgICAgICB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIHV0aWwuc2V0RGlzcGxheShzLmRvbS5lbGVtZW50cy5ib2FyZC5zcXVhcmVPdmVyLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHV0aWwuc2V0RGlzcGxheShzLmRvbS5lbGVtZW50cy5ib2FyZC5zcXVhcmVPdmVyLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHByb2Nlc3NEcmFnKHMpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmUoczogU3RhdGUsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgLy8gc3VwcG9ydCBvbmUgZmluZ2VyIHRvdWNoIG9ubHlcbiAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQgJiYgKCFlLnRvdWNoZXMgfHwgZS50b3VjaGVzLmxlbmd0aCA8IDIpKSB7XG4gICAgcy5kcmFnZ2FibGUuY3VycmVudC5wb3MgPSB1dGlsLmV2ZW50UG9zaXRpb24oZSkhO1xuICB9IGVsc2UgaWYgKFxuICAgIChzLnNlbGVjdGVkIHx8IHMuc2VsZWN0ZWRQaWVjZSB8fCBzLmhpZ2hsaWdodC5ob3ZlcmVkKSAmJlxuICAgICFzLmRyYWdnYWJsZS5jdXJyZW50ICYmXG4gICAgKCFlLnRvdWNoZXMgfHwgZS50b3VjaGVzLmxlbmd0aCA8IDIpXG4gICkge1xuICAgIGNvbnN0IGJvdW5kcyA9IHMuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKSxcbiAgICAgIGhvdmVyID1cbiAgICAgICAgYm91bmRzICYmXG4gICAgICAgIHV0aWwuZ2V0S2V5QXREb21Qb3MoXG4gICAgICAgICAgdXRpbC5ldmVudFBvc2l0aW9uKGUpISxcbiAgICAgICAgICB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pLFxuICAgICAgICAgIHMuZGltZW5zaW9ucyxcbiAgICAgICAgICBib3VuZHNcbiAgICAgICAgKTtcbiAgICBpZiAoaG92ZXIgIT09IHMuaG92ZXJlZCkgdXBkYXRlSG92ZXJlZFNxdWFyZXMocywgaG92ZXIpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmQoczogU3RhdGUsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgY29uc3QgY3VyID0gcy5kcmFnZ2FibGUuY3VycmVudDtcbiAgaWYgKCFjdXIpIHJldHVybjtcbiAgLy8gY3JlYXRlIG5vIGNvcnJlc3BvbmRpbmcgbW91c2UgZXZlbnRcbiAgaWYgKGUudHlwZSA9PT0gJ3RvdWNoZW5kJyAmJiBlLmNhbmNlbGFibGUgIT09IGZhbHNlKSBlLnByZXZlbnREZWZhdWx0KCk7XG4gIC8vIGNvbXBhcmluZyB3aXRoIHRoZSBvcmlnaW4gdGFyZ2V0IGlzIGFuIGVhc3kgd2F5IHRvIHRlc3QgdGhhdCB0aGUgZW5kIGV2ZW50XG4gIC8vIGhhcyB0aGUgc2FtZSB0b3VjaCBvcmlnaW5cbiAgaWYgKGUudHlwZSA9PT0gJ3RvdWNoZW5kJyAmJiBjdXIub3JpZ2luVGFyZ2V0ICE9PSBlLnRhcmdldCAmJiAhY3VyLmZyb21PdXRzaWRlKSB7XG4gICAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBpZiAocy5ob3ZlcmVkICYmICFzLmhpZ2hsaWdodC5ob3ZlcmVkKSB1cGRhdGVIb3ZlcmVkU3F1YXJlcyhzLCB1bmRlZmluZWQpO1xuICAgIHJldHVybjtcbiAgfVxuICBib2FyZC51bnNldFByZW1vdmUocyk7XG4gIGJvYXJkLnVuc2V0UHJlZHJvcChzKTtcbiAgLy8gdG91Y2hlbmQgaGFzIG5vIHBvc2l0aW9uOyBzbyB1c2UgdGhlIGxhc3QgdG91Y2htb3ZlIHBvc2l0aW9uIGluc3RlYWRcbiAgY29uc3QgZXZlbnRQb3MgPSB1dGlsLmV2ZW50UG9zaXRpb24oZSkgfHwgY3VyLnBvcyxcbiAgICBib3VuZHMgPSBzLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCksXG4gICAgZGVzdCA9XG4gICAgICBib3VuZHMgJiYgdXRpbC5nZXRLZXlBdERvbVBvcyhldmVudFBvcywgdXRpbC5zZW50ZVBvdihzLm9yaWVudGF0aW9uKSwgcy5kaW1lbnNpb25zLCBib3VuZHMpO1xuXG4gIGlmIChkZXN0ICYmIGN1ci5zdGFydGVkICYmIGN1ci5mcm9tQm9hcmQ/Lm9yaWcgIT09IGRlc3QpIHtcbiAgICBpZiAoY3VyLmZyb21PdXRzaWRlICYmICFib2FyZC5wcm9tb3Rpb25EaWFsb2dEcm9wKHMsIGN1ci5waWVjZSwgZGVzdCkpXG4gICAgICBib2FyZC51c2VyRHJvcChzLCBjdXIucGllY2UsIGRlc3QpO1xuICAgIGVsc2UgaWYgKGN1ci5mcm9tQm9hcmQgJiYgIWJvYXJkLnByb21vdGlvbkRpYWxvZ01vdmUocywgY3VyLmZyb21Cb2FyZC5vcmlnLCBkZXN0KSlcbiAgICAgIGJvYXJkLnVzZXJNb3ZlKHMsIGN1ci5mcm9tQm9hcmQub3JpZywgZGVzdCk7XG4gIH0gZWxzZSBpZiAocy5kcmFnZ2FibGUuZGVsZXRlT25Ecm9wT2ZmICYmICFkZXN0KSB7XG4gICAgaWYgKGN1ci5mcm9tQm9hcmQpIHMucGllY2VzLmRlbGV0ZShjdXIuZnJvbUJvYXJkLm9yaWcpO1xuICAgIGVsc2UgaWYgKGN1ci5mcm9tT3V0c2lkZSAmJiAhcy5kcm9wcGFibGUuc3BhcmUpIHJlbW92ZUZyb21IYW5kKHMsIGN1ci5waWVjZSk7XG5cbiAgICBpZiAocy5kcmFnZ2FibGUuYWRkVG9IYW5kT25Ecm9wT2ZmKSB7XG4gICAgICBjb25zdCBoYW5kQm91bmRzID0gcy5kb20uYm91bmRzLmhhbmRzLmJvdW5kcygpLFxuICAgICAgICBoYW5kQm91bmRzVG9wID0gaGFuZEJvdW5kcy5nZXQoJ3RvcCcpLFxuICAgICAgICBoYW5kQm91bmRzQm90dG9tID0gaGFuZEJvdW5kcy5nZXQoJ2JvdHRvbScpO1xuICAgICAgaWYgKGhhbmRCb3VuZHNUb3AgJiYgdXRpbC5pc0luc2lkZVJlY3QoaGFuZEJvdW5kc1RvcCwgY3VyLnBvcykpXG4gICAgICAgIGFkZFRvSGFuZChzLCB7IGNvbG9yOiB1dGlsLm9wcG9zaXRlKHMub3JpZW50YXRpb24pLCByb2xlOiBjdXIucGllY2Uucm9sZSB9KTtcbiAgICAgIGVsc2UgaWYgKGhhbmRCb3VuZHNCb3R0b20gJiYgdXRpbC5pc0luc2lkZVJlY3QoaGFuZEJvdW5kc0JvdHRvbSwgY3VyLnBvcykpXG4gICAgICAgIGFkZFRvSGFuZChzLCB7IGNvbG9yOiBzLm9yaWVudGF0aW9uLCByb2xlOiBjdXIucGllY2Uucm9sZSB9KTtcbiAgICB9XG4gICAgdXRpbC5jYWxsVXNlckZ1bmN0aW9uKHMuZXZlbnRzLmNoYW5nZSk7XG4gIH1cblxuICBpZiAoXG4gICAgY3VyLmZyb21Cb2FyZCAmJlxuICAgIChjdXIuZnJvbUJvYXJkLm9yaWcgPT09IGN1ci5mcm9tQm9hcmQucHJldmlvdXNseVNlbGVjdGVkIHx8IGN1ci5mcm9tQm9hcmQua2V5SGFzQ2hhbmdlZCkgJiZcbiAgICAoY3VyLmZyb21Cb2FyZC5vcmlnID09PSBkZXN0IHx8ICFkZXN0KVxuICApIHtcbiAgICB1bnNlbGVjdChzLCBjdXIsIGRlc3QpO1xuICB9IGVsc2UgaWYgKFxuICAgICghZGVzdCAmJiBjdXIuZnJvbU91dHNpZGU/LmxlZnRPcmlnaW4pIHx8XG4gICAgKGN1ci5mcm9tT3V0c2lkZT8ub3JpZ2luQm91bmRzICYmXG4gICAgICB1dGlsLmlzSW5zaWRlUmVjdChjdXIuZnJvbU91dHNpZGUub3JpZ2luQm91bmRzLCBjdXIucG9zKSAmJlxuICAgICAgY3VyLmZyb21PdXRzaWRlLnByZXZpb3VzbHlTZWxlY3RlZFBpZWNlICYmXG4gICAgICB1dGlsLnNhbWVQaWVjZShjdXIuZnJvbU91dHNpZGUucHJldmlvdXNseVNlbGVjdGVkUGllY2UsIGN1ci5waWVjZSkpXG4gICkge1xuICAgIHVuc2VsZWN0KHMsIGN1ciwgZGVzdCk7XG4gIH0gZWxzZSBpZiAoIXMuc2VsZWN0YWJsZS5lbmFibGVkICYmICFzLnByb21vdGlvbi5jdXJyZW50KSB7XG4gICAgdW5zZWxlY3QocywgY3VyLCBkZXN0KTtcbiAgfVxuXG4gIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIGlmICghcy5oaWdobGlnaHQuaG92ZXJlZCAmJiAhcy5wcm9tb3Rpb24uY3VycmVudCkgcy5ob3ZlcmVkID0gdW5kZWZpbmVkO1xuICBzLmRvbS5yZWRyYXcoKTtcbn1cblxuZnVuY3Rpb24gdW5zZWxlY3QoczogU3RhdGUsIGN1cjogRHJhZ0N1cnJlbnQsIGRlc3Q/OiBzZy5LZXkpOiB2b2lkIHtcbiAgaWYgKGN1ci5mcm9tQm9hcmQgJiYgY3VyLmZyb21Cb2FyZC5vcmlnID09PSBkZXN0KVxuICAgIHV0aWwuY2FsbFVzZXJGdW5jdGlvbihzLmV2ZW50cy51bnNlbGVjdCwgY3VyLmZyb21Cb2FyZC5vcmlnKTtcbiAgZWxzZSBpZiAoXG4gICAgY3VyLmZyb21PdXRzaWRlPy5vcmlnaW5Cb3VuZHMgJiZcbiAgICB1dGlsLmlzSW5zaWRlUmVjdChjdXIuZnJvbU91dHNpZGUub3JpZ2luQm91bmRzLCBjdXIucG9zKVxuICApXG4gICAgdXRpbC5jYWxsVXNlckZ1bmN0aW9uKHMuZXZlbnRzLnBpZWNlVW5zZWxlY3QsIGN1ci5waWVjZSk7XG4gIGJvYXJkLnVuc2VsZWN0KHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsKHM6IFN0YXRlKTogdm9pZCB7XG4gIGlmIChzLmRyYWdnYWJsZS5jdXJyZW50KSB7XG4gICAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBpZiAoIXMuaGlnaGxpZ2h0LmhvdmVyZWQpIHMuaG92ZXJlZCA9IHVuZGVmaW5lZDtcbiAgICBib2FyZC51bnNlbGVjdChzKTtcbiAgICBzLmRvbS5yZWRyYXcoKTtcbiAgfVxufVxuXG4vLyBzdXBwb3J0IG9uZSBmaW5nZXIgdG91Y2ggb25seSBvciBsZWZ0IGNsaWNrXG5leHBvcnQgZnVuY3Rpb24gdW53YW50ZWRFdmVudChlOiBzZy5Nb3VjaEV2ZW50KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgIWUuaXNUcnVzdGVkIHx8XG4gICAgKGUuYnV0dG9uICE9PSB1bmRlZmluZWQgJiYgZS5idXR0b24gIT09IDApIHx8XG4gICAgKCEhZS50b3VjaGVzICYmIGUudG91Y2hlcy5sZW5ndGggPiAxKVxuICApO1xufVxuXG5mdW5jdGlvbiB2YWxpZERlc3RUb0hvdmVyKHM6IFN0YXRlLCBrZXk6IHNnLktleSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgICghIXMuc2VsZWN0ZWQgJiYgKGJvYXJkLmNhbk1vdmUocywgcy5zZWxlY3RlZCwga2V5KSB8fCBib2FyZC5jYW5QcmVtb3ZlKHMsIHMuc2VsZWN0ZWQsIGtleSkpKSB8fFxuICAgICghIXMuc2VsZWN0ZWRQaWVjZSAmJlxuICAgICAgKGJvYXJkLmNhbkRyb3Aocywgcy5zZWxlY3RlZFBpZWNlLCBrZXkpIHx8IGJvYXJkLmNhblByZWRyb3Aocywgcy5zZWxlY3RlZFBpZWNlLCBrZXkpKSlcbiAgKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlSG92ZXJlZFNxdWFyZXMoczogU3RhdGUsIGtleTogc2cuS2V5IHwgdW5kZWZpbmVkKTogdm9pZCB7XG4gIGNvbnN0IHNxYXVyZUVscyA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkPy5zcXVhcmVzLmNoaWxkcmVuO1xuICBpZiAoIXNxYXVyZUVscyB8fCBzLnByb21vdGlvbi5jdXJyZW50KSByZXR1cm47XG5cbiAgY29uc3QgcHJldkhvdmVyID0gcy5ob3ZlcmVkO1xuICBpZiAocy5oaWdobGlnaHQuaG92ZXJlZCB8fCAoa2V5ICYmIHZhbGlkRGVzdFRvSG92ZXIocywga2V5KSkpIHMuaG92ZXJlZCA9IGtleTtcbiAgZWxzZSBzLmhvdmVyZWQgPSB1bmRlZmluZWQ7XG5cbiAgY29uc3QgYXNTZW50ZSA9IHV0aWwuc2VudGVQb3Yocy5vcmllbnRhdGlvbiksXG4gICAgY3VySW5kZXggPSBzLmhvdmVyZWQgJiYgdXRpbC5kb21TcXVhcmVJbmRleE9mS2V5KHMuaG92ZXJlZCwgYXNTZW50ZSwgcy5kaW1lbnNpb25zKSxcbiAgICBjdXJIb3ZlckVsID0gY3VySW5kZXggIT09IHVuZGVmaW5lZCAmJiBzcWF1cmVFbHNbY3VySW5kZXhdO1xuICBpZiAoY3VySG92ZXJFbCkgY3VySG92ZXJFbC5jbGFzc0xpc3QuYWRkKCdob3ZlcicpO1xuXG4gIGNvbnN0IHByZXZJbmRleCA9IHByZXZIb3ZlciAmJiB1dGlsLmRvbVNxdWFyZUluZGV4T2ZLZXkocHJldkhvdmVyLCBhc1NlbnRlLCBzLmRpbWVuc2lvbnMpLFxuICAgIHByZXZIb3ZlckVsID0gcHJldkluZGV4ICE9PSB1bmRlZmluZWQgJiYgc3FhdXJlRWxzW3ByZXZJbmRleF07XG4gIGlmIChwcmV2SG92ZXJFbCkgcHJldkhvdmVyRWwuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXInKTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IE5vdGF0aW9uIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjb29yZHMobm90YXRpb246IE5vdGF0aW9uKTogc3RyaW5nW10ge1xuICBzd2l0Y2ggKG5vdGF0aW9uKSB7XG4gICAgY2FzZSAnamFwYW5lc2UnOlxuICAgICAgcmV0dXJuIFtcbiAgICAgICAgJ1x1NTM0MVx1NTE2RCcsXG4gICAgICAgICdcdTUzNDFcdTRFOTQnLFxuICAgICAgICAnXHU1MzQxXHU1NkRCJyxcbiAgICAgICAgJ1x1NTM0MVx1NEUwOScsXG4gICAgICAgICdcdTUzNDFcdTRFOEMnLFxuICAgICAgICAnXHU1MzQxXHU0RTAwJyxcbiAgICAgICAgJ1x1NTM0MScsXG4gICAgICAgICdcdTRFNUQnLFxuICAgICAgICAnXHU1MTZCJyxcbiAgICAgICAgJ1x1NEUwMycsXG4gICAgICAgICdcdTUxNkQnLFxuICAgICAgICAnXHU0RTk0JyxcbiAgICAgICAgJ1x1NTZEQicsXG4gICAgICAgICdcdTRFMDknLFxuICAgICAgICAnXHU0RThDJyxcbiAgICAgICAgJ1x1NEUwMCcsXG4gICAgICBdO1xuICAgIGNhc2UgJ2VuZ2luZSc6XG4gICAgICByZXR1cm4gWydwJywgJ28nLCAnbicsICdtJywgJ2wnLCAnaycsICdqJywgJ2knLCAnaCcsICdnJywgJ2YnLCAnZScsICdkJywgJ2MnLCAnYicsICdhJ107XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldHVybiBbJzEwJywgJ2YnLCAnZScsICdkJywgJ2MnLCAnYicsICdhJywgJzknLCAnOCcsICc3JywgJzYnLCAnNScsICc0JywgJzMnLCAnMicsICcxJ107XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBbXG4gICAgICAgICcxNicsXG4gICAgICAgICcxNScsXG4gICAgICAgICcxNCcsXG4gICAgICAgICcxMycsXG4gICAgICAgICcxMicsXG4gICAgICAgICcxMScsXG4gICAgICAgICcxMCcsXG4gICAgICAgICc5JyxcbiAgICAgICAgJzgnLFxuICAgICAgICAnNycsXG4gICAgICAgICc2JyxcbiAgICAgICAgJzUnLFxuICAgICAgICAnNCcsXG4gICAgICAgICczJyxcbiAgICAgICAgJzInLFxuICAgICAgICAnMScsXG4gICAgICBdO1xuICB9XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUge1xuICBEaW1lbnNpb25zLFxuICBTcXVhcmVOb2RlLFxuICBDb2xvcixcbiAgUGllY2VOb2RlLFxuICBSb2xlU3RyaW5nLFxuICBIYW5kRWxlbWVudHMsXG4gIEJvYXJkRWxlbWVudHMsXG59IGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgY29sb3JzIH0gZnJvbSAnLi9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgY3JlYXRlRWwsIG9wcG9zaXRlLCBwaWVjZU5hbWVPZiwgcG9zMmtleSwgc2V0RGlzcGxheSB9IGZyb20gJy4vdXRpbC5qcyc7XG5pbXBvcnQgeyBjcmVhdGVTVkdFbGVtZW50LCBzZXRBdHRyaWJ1dGVzIH0gZnJvbSAnLi9zaGFwZXMuanMnO1xuaW1wb3J0IHsgY29vcmRzIH0gZnJvbSAnLi9jb29yZHMuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gd3JhcEJvYXJkKGJvYXJkV3JhcDogSFRNTEVsZW1lbnQsIHM6IFN0YXRlKTogQm9hcmRFbGVtZW50cyB7XG4gIC8vIC5zZy13cmFwIChlbGVtZW50IHBhc3NlZCB0byBTaG9naWdyb3VuZClcbiAgLy8gICAgIHNnLWhhbmQtd3JhcFxuICAvLyAgICAgc2ctYm9hcmRcbiAgLy8gICAgICAgc2ctc3F1YXJlc1xuICAvLyAgICAgICBzZy1waWVjZXNcbiAgLy8gICAgICAgcGllY2UgZHJhZ2dpbmdcbiAgLy8gICAgICAgc2ctcHJvbW90aW9uXG4gIC8vICAgICAgIHNnLXNxdWFyZS1vdmVyXG4gIC8vICAgICAgIHN2Zy5zZy1zaGFwZXNcbiAgLy8gICAgICAgICBkZWZzXG4gIC8vICAgICAgICAgZ1xuICAvLyAgICAgICBzdmcuc2ctY3VzdG9tLXN2Z3NcbiAgLy8gICAgICAgICBnXG4gIC8vICAgICBzZy1oYW5kLXdyYXBcbiAgLy8gICAgIHNnLWZyZWUtcGllY2VzXG4gIC8vICAgICAgIGNvb3Jkcy5yYW5rc1xuICAvLyAgICAgICBjb29yZHMuZmlsZXNcblxuICBjb25zdCBib2FyZCA9IGNyZWF0ZUVsKCdzZy1ib2FyZCcpO1xuXG4gIGNvbnN0IHNxdWFyZXMgPSByZW5kZXJTcXVhcmVzKHMuZGltZW5zaW9ucywgcy5vcmllbnRhdGlvbik7XG4gIGJvYXJkLmFwcGVuZENoaWxkKHNxdWFyZXMpO1xuXG4gIGNvbnN0IHBpZWNlcyA9IGNyZWF0ZUVsKCdzZy1waWVjZXMnKTtcbiAgYm9hcmQuYXBwZW5kQ2hpbGQocGllY2VzKTtcblxuICBsZXQgZHJhZ2dlZCwgcHJvbW90aW9uLCBzcXVhcmVPdmVyO1xuICBpZiAoIXMudmlld09ubHkpIHtcbiAgICBkcmFnZ2VkID0gY3JlYXRlRWwoJ3BpZWNlJykgYXMgUGllY2VOb2RlO1xuICAgIHNldERpc3BsYXkoZHJhZ2dlZCwgZmFsc2UpO1xuICAgIGJvYXJkLmFwcGVuZENoaWxkKGRyYWdnZWQpO1xuXG4gICAgcHJvbW90aW9uID0gY3JlYXRlRWwoJ3NnLXByb21vdGlvbicpO1xuICAgIHNldERpc3BsYXkocHJvbW90aW9uLCBmYWxzZSk7XG4gICAgYm9hcmQuYXBwZW5kQ2hpbGQocHJvbW90aW9uKTtcblxuICAgIHNxdWFyZU92ZXIgPSBjcmVhdGVFbCgnc2ctc3F1YXJlLW92ZXInKTtcbiAgICBzZXREaXNwbGF5KHNxdWFyZU92ZXIsIGZhbHNlKTtcbiAgICBib2FyZC5hcHBlbmRDaGlsZChzcXVhcmVPdmVyKTtcbiAgfVxuXG4gIGxldCBzaGFwZXM7XG4gIGlmIChzLmRyYXdhYmxlLnZpc2libGUpIHtcbiAgICBjb25zdCBzdmcgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ3N2ZycpLCB7XG4gICAgICBjbGFzczogJ3NnLXNoYXBlcycsXG4gICAgICB2aWV3Qm94OiBgLSR7cy5zcXVhcmVSYXRpb1swXSAvIDJ9IC0ke3Muc3F1YXJlUmF0aW9bMV0gLyAyfSAke3MuZGltZW5zaW9ucy5maWxlcyAqIHMuc3F1YXJlUmF0aW9bMF19ICR7XG4gICAgICAgIHMuZGltZW5zaW9ucy5yYW5rcyAqIHMuc3F1YXJlUmF0aW9bMV1cbiAgICAgIH1gLFxuICAgIH0pO1xuICAgIHN2Zy5hcHBlbmRDaGlsZChjcmVhdGVTVkdFbGVtZW50KCdkZWZzJykpO1xuICAgIHN2Zy5hcHBlbmRDaGlsZChjcmVhdGVTVkdFbGVtZW50KCdnJykpO1xuXG4gICAgY29uc3QgY3VzdG9tU3ZnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdzdmcnKSwge1xuICAgICAgY2xhc3M6ICdzZy1jdXN0b20tc3ZncycsXG4gICAgICB2aWV3Qm94OiBgMCAwICR7cy5kaW1lbnNpb25zLmZpbGVzICogcy5zcXVhcmVSYXRpb1swXX0gJHtzLmRpbWVuc2lvbnMucmFua3MgKiBzLnNxdWFyZVJhdGlvWzFdfWAsXG4gICAgfSk7XG4gICAgY3VzdG9tU3ZnLmFwcGVuZENoaWxkKGNyZWF0ZVNWR0VsZW1lbnQoJ2cnKSk7XG5cbiAgICBjb25zdCBmcmVlUGllY2VzID0gY3JlYXRlRWwoJ3NnLWZyZWUtcGllY2VzJyk7XG5cbiAgICBib2FyZC5hcHBlbmRDaGlsZChzdmcpO1xuICAgIGJvYXJkLmFwcGVuZENoaWxkKGN1c3RvbVN2Zyk7XG4gICAgYm9hcmQuYXBwZW5kQ2hpbGQoZnJlZVBpZWNlcyk7XG5cbiAgICBzaGFwZXMgPSB7XG4gICAgICBzdmcsXG4gICAgICBmcmVlUGllY2VzLFxuICAgICAgY3VzdG9tU3ZnLFxuICAgIH07XG4gIH1cblxuICBpZiAocy5jb29yZGluYXRlcy5lbmFibGVkKSB7XG4gICAgY29uc3Qgb3JpZW50Q2xhc3MgPSBzLm9yaWVudGF0aW9uID09PSAnZ290ZScgPyAnIGdvdGUnIDogJycsXG4gICAgICByYW5rcyA9IGNvb3JkcyhzLmNvb3JkaW5hdGVzLnJhbmtzKSxcbiAgICAgIGZpbGVzID0gY29vcmRzKHMuY29vcmRpbmF0ZXMuZmlsZXMpO1xuICAgIGJvYXJkLmFwcGVuZENoaWxkKHJlbmRlckNvb3JkcyhyYW5rcywgJ3JhbmtzJyArIG9yaWVudENsYXNzLCBzLmRpbWVuc2lvbnMucmFua3MpKTtcbiAgICBib2FyZC5hcHBlbmRDaGlsZChyZW5kZXJDb29yZHMoZmlsZXMsICdmaWxlcycgKyBvcmllbnRDbGFzcywgcy5kaW1lbnNpb25zLmZpbGVzKSk7XG4gIH1cblxuICBib2FyZFdyYXAuaW5uZXJIVE1MID0gJyc7XG5cbiAgY29uc3QgZGltQ2xzID0gYGQtJHtzLmRpbWVuc2lvbnMuZmlsZXN9eCR7cy5kaW1lbnNpb25zLnJhbmtzfWA7XG5cbiAgLy8gcmVtb3ZlIGFsbCBvdGhlciBkaW1lbnNpb24gY2xhc3Nlc1xuICBib2FyZFdyYXAuY2xhc3NMaXN0LmZvckVhY2goYyA9PiB7XG4gICAgaWYgKGMuc3Vic3RyaW5nKDAsIDIpID09PSAnZC0nICYmIGMgIT09IGRpbUNscykgYm9hcmRXcmFwLmNsYXNzTGlzdC5yZW1vdmUoYyk7XG4gIH0pO1xuXG4gIC8vIGVuc3VyZSB0aGUgc2ctd3JhcCBjbGFzcyBhbmQgZGltZW5zaW9ucyBjbGFzcyBpcyBzZXQgYmVmb3JlaGFuZCB0byBhdm9pZCByZWNvbXB1dGluZyBzdHlsZXNcbiAgYm9hcmRXcmFwLmNsYXNzTGlzdC5hZGQoJ3NnLXdyYXAnLCBkaW1DbHMpO1xuXG4gIGZvciAoY29uc3QgYyBvZiBjb2xvcnMpIGJvYXJkV3JhcC5jbGFzc0xpc3QudG9nZ2xlKCdvcmllbnRhdGlvbi0nICsgYywgcy5vcmllbnRhdGlvbiA9PT0gYyk7XG4gIGJvYXJkV3JhcC5jbGFzc0xpc3QudG9nZ2xlKCdtYW5pcHVsYWJsZScsICFzLnZpZXdPbmx5KTtcblxuICBib2FyZFdyYXAuYXBwZW5kQ2hpbGQoYm9hcmQpO1xuXG4gIGxldCBoYW5kczogSGFuZEVsZW1lbnRzIHwgdW5kZWZpbmVkO1xuICBpZiAocy5oYW5kcy5pbmxpbmVkKSB7XG4gICAgY29uc3QgaGFuZFdyYXBUb3AgPSBjcmVhdGVFbCgnc2ctaGFuZC13cmFwJywgJ2lubGluZWQnKSxcbiAgICAgIGhhbmRXcmFwQm90dG9tID0gY3JlYXRlRWwoJ3NnLWhhbmQtd3JhcCcsICdpbmxpbmVkJyk7XG4gICAgYm9hcmRXcmFwLmluc2VydEJlZm9yZShoYW5kV3JhcEJvdHRvbSwgYm9hcmQubmV4dEVsZW1lbnRTaWJsaW5nKTtcbiAgICBib2FyZFdyYXAuaW5zZXJ0QmVmb3JlKGhhbmRXcmFwVG9wLCBib2FyZCk7XG4gICAgaGFuZHMgPSB7XG4gICAgICB0b3A6IGhhbmRXcmFwVG9wLFxuICAgICAgYm90dG9tOiBoYW5kV3JhcEJvdHRvbSxcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBib2FyZCxcbiAgICBzcXVhcmVzLFxuICAgIHBpZWNlcyxcbiAgICBwcm9tb3Rpb24sXG4gICAgc3F1YXJlT3ZlcixcbiAgICBkcmFnZ2VkLFxuICAgIHNoYXBlcyxcbiAgICBoYW5kcyxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyYXBIYW5kKGhhbmRXcmFwOiBIVE1MRWxlbWVudCwgcG9zOiAndG9wJyB8ICdib3R0b20nLCBzOiBTdGF0ZSk6IEhUTUxFbGVtZW50IHtcbiAgY29uc3QgaGFuZCA9IHJlbmRlckhhbmQocG9zID09PSAndG9wJyA/IG9wcG9zaXRlKHMub3JpZW50YXRpb24pIDogcy5vcmllbnRhdGlvbiwgcy5oYW5kcy5yb2xlcyk7XG4gIGhhbmRXcmFwLmlubmVySFRNTCA9ICcnO1xuXG4gIGNvbnN0IHJvbGVDbnRDbHMgPSBgci0ke3MuaGFuZHMucm9sZXMubGVuZ3RofWA7XG5cbiAgLy8gcmVtb3ZlIGFsbCBvdGhlciByb2xlIGNvdW50IGNsYXNzZXNcbiAgaGFuZFdyYXAuY2xhc3NMaXN0LmZvckVhY2goYyA9PiB7XG4gICAgaWYgKGMuc3Vic3RyaW5nKDAsIDIpID09PSAnci0nICYmIGMgIT09IHJvbGVDbnRDbHMpIGhhbmRXcmFwLmNsYXNzTGlzdC5yZW1vdmUoYyk7XG4gIH0pO1xuXG4gIC8vIGVuc3VyZSB0aGUgc2ctaGFuZC13cmFwIGNsYXNzLCBoYW5kIHBvcyBjbGFzcyBhbmQgcm9sZSBudW1iZXIgY2xhc3MgaXMgc2V0IGJlZm9yZWhhbmQgdG8gYXZvaWQgcmVjb21wdXRpbmcgc3R5bGVzXG4gIGhhbmRXcmFwLmNsYXNzTGlzdC5hZGQoJ3NnLWhhbmQtd3JhcCcsIGBoYW5kLSR7cG9zfWAsIHJvbGVDbnRDbHMpO1xuICBoYW5kV3JhcC5hcHBlbmRDaGlsZChoYW5kKTtcblxuICBmb3IgKGNvbnN0IGMgb2YgY29sb3JzKSBoYW5kV3JhcC5jbGFzc0xpc3QudG9nZ2xlKCdvcmllbnRhdGlvbi0nICsgYywgcy5vcmllbnRhdGlvbiA9PT0gYyk7XG4gIGhhbmRXcmFwLmNsYXNzTGlzdC50b2dnbGUoJ21hbmlwdWxhYmxlJywgIXMudmlld09ubHkpO1xuXG4gIHJldHVybiBoYW5kO1xufVxuXG5mdW5jdGlvbiByZW5kZXJDb29yZHMoZWxlbXM6IHJlYWRvbmx5IHN0cmluZ1tdLCBjbGFzc05hbWU6IHN0cmluZywgdHJpbTogbnVtYmVyKTogSFRNTEVsZW1lbnQge1xuICBjb25zdCBlbCA9IGNyZWF0ZUVsKCdjb29yZHMnLCBjbGFzc05hbWUpO1xuICBsZXQgZjogSFRNTEVsZW1lbnQ7XG4gIGZvciAoY29uc3QgZWxlbSBvZiBlbGVtcy5zbGljZSgtdHJpbSkpIHtcbiAgICBmID0gY3JlYXRlRWwoJ2Nvb3JkJyk7XG4gICAgZi50ZXh0Q29udGVudCA9IGVsZW07XG4gICAgZWwuYXBwZW5kQ2hpbGQoZik7XG4gIH1cbiAgcmV0dXJuIGVsO1xufVxuXG5mdW5jdGlvbiByZW5kZXJTcXVhcmVzKGRpbXM6IERpbWVuc2lvbnMsIG9yaWVudGF0aW9uOiBDb2xvcik6IEhUTUxFbGVtZW50IHtcbiAgY29uc3Qgc3F1YXJlcyA9IGNyZWF0ZUVsKCdzZy1zcXVhcmVzJyk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkaW1zLnJhbmtzICogZGltcy5maWxlczsgaSsrKSB7XG4gICAgY29uc3Qgc3EgPSBjcmVhdGVFbCgnc3EnKSBhcyBTcXVhcmVOb2RlO1xuICAgIHNxLnNnS2V5ID1cbiAgICAgIG9yaWVudGF0aW9uID09PSAnc2VudGUnXG4gICAgICAgID8gcG9zMmtleShbZGltcy5maWxlcyAtIDEgLSAoaSAlIGRpbXMuZmlsZXMpLCBNYXRoLmZsb29yKGkgLyBkaW1zLmZpbGVzKV0pXG4gICAgICAgIDogcG9zMmtleShbaSAlIGRpbXMuZmlsZXMsIGRpbXMucmFua3MgLSAxIC0gTWF0aC5mbG9vcihpIC8gZGltcy5maWxlcyldKTtcbiAgICBzcXVhcmVzLmFwcGVuZENoaWxkKHNxKTtcbiAgfVxuXG4gIHJldHVybiBzcXVhcmVzO1xufVxuXG5mdW5jdGlvbiByZW5kZXJIYW5kKGNvbG9yOiBDb2xvciwgcm9sZXM6IFJvbGVTdHJpbmdbXSk6IEhUTUxFbGVtZW50IHtcbiAgY29uc3QgaGFuZCA9IGNyZWF0ZUVsKCdzZy1oYW5kJyk7XG4gIGZvciAoY29uc3Qgcm9sZSBvZiByb2xlcykge1xuICAgIGNvbnN0IHBpZWNlID0geyByb2xlOiByb2xlLCBjb2xvcjogY29sb3IgfSxcbiAgICAgIHdyYXBFbCA9IGNyZWF0ZUVsKCdzZy1ocC13cmFwJyksXG4gICAgICBwaWVjZUVsID0gY3JlYXRlRWwoJ3BpZWNlJywgcGllY2VOYW1lT2YocGllY2UpKSBhcyBQaWVjZU5vZGU7XG4gICAgcGllY2VFbC5zZ0NvbG9yID0gY29sb3I7XG4gICAgcGllY2VFbC5zZ1JvbGUgPSByb2xlO1xuICAgIHdyYXBFbC5hcHBlbmRDaGlsZChwaWVjZUVsKTtcbiAgICBoYW5kLmFwcGVuZENoaWxkKHdyYXBFbCk7XG4gIH1cbiAgcmV0dXJuIGhhbmQ7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCAqIGFzIGRyYWcgZnJvbSAnLi9kcmFnLmpzJztcbmltcG9ydCAqIGFzIGRyYXcgZnJvbSAnLi9kcmF3LmpzJztcbmltcG9ydCB7XG4gIGNhbGxVc2VyRnVuY3Rpb24sXG4gIGV2ZW50UG9zaXRpb24sXG4gIGdldEhhbmRQaWVjZUF0RG9tUG9zLFxuICBpc01pZGRsZUJ1dHRvbixcbiAgaXNQaWVjZU5vZGUsXG4gIGlzUmlnaHRCdXR0b24sXG4gIHNhbWVQaWVjZSxcbn0gZnJvbSAnLi91dGlsLmpzJztcbmltcG9ydCB7IGFuaW0gfSBmcm9tICcuL2FuaW0uanMnO1xuaW1wb3J0IHsgdXNlckRyb3AsIHVzZXJNb3ZlLCBjYW5jZWxQcm9tb3Rpb24sIHNlbGVjdFNxdWFyZSB9IGZyb20gJy4vYm9hcmQuanMnO1xuaW1wb3J0IHsgdXNlc0JvdW5kcyB9IGZyb20gJy4vc2hhcGVzLmpzJztcblxudHlwZSBNb3VjaEJpbmQgPSAoZTogc2cuTW91Y2hFdmVudCkgPT4gdm9pZDtcbnR5cGUgU3RhdGVNb3VjaEJpbmQgPSAoZDogU3RhdGUsIGU6IHNnLk1vdWNoRXZlbnQpID0+IHZvaWQ7XG5cbmZ1bmN0aW9uIGNsZWFyQm91bmRzKHM6IFN0YXRlKTogdm9pZCB7XG4gIHMuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMuY2xlYXIoKTtcbiAgcy5kb20uYm91bmRzLmhhbmRzLmJvdW5kcy5jbGVhcigpO1xuICBzLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMuY2xlYXIoKTtcbn1cblxuZnVuY3Rpb24gb25SZXNpemUoczogU3RhdGUpOiAoKSA9PiB2b2lkIHtcbiAgcmV0dXJuICgpID0+IHtcbiAgICBjbGVhckJvdW5kcyhzKTtcbiAgICBpZiAodXNlc0JvdW5kcyhzLmRyYXdhYmxlLnNoYXBlcy5jb25jYXQocy5kcmF3YWJsZS5hdXRvU2hhcGVzKSkpIHMuZG9tLnJlZHJhd1NoYXBlcygpO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmluZEJvYXJkKHM6IFN0YXRlLCBib2FyZEVsczogc2cuQm9hcmRFbGVtZW50cyk6IHZvaWQge1xuICBpZiAoJ1Jlc2l6ZU9ic2VydmVyJyBpbiB3aW5kb3cpIG5ldyBSZXNpemVPYnNlcnZlcihvblJlc2l6ZShzKSkub2JzZXJ2ZShib2FyZEVscy5ib2FyZCk7XG5cbiAgaWYgKHMudmlld09ubHkpIHJldHVybjtcblxuICBjb25zdCBwaWVjZXNFbCA9IGJvYXJkRWxzLnBpZWNlcyxcbiAgICBwcm9tb3Rpb25FbCA9IGJvYXJkRWxzLnByb21vdGlvbjtcblxuICAvLyBDYW5ub3QgYmUgcGFzc2l2ZSwgYmVjYXVzZSB3ZSBwcmV2ZW50IHRvdWNoIHNjcm9sbGluZyBhbmQgZHJhZ2dpbmcgb2Ygc2VsZWN0ZWQgZWxlbWVudHMuXG4gIGNvbnN0IG9uU3RhcnQgPSBzdGFydERyYWdPckRyYXcocyk7XG4gIHBpZWNlc0VsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblN0YXJ0IGFzIEV2ZW50TGlzdGVuZXIsIHtcbiAgICBwYXNzaXZlOiBmYWxzZSxcbiAgfSk7XG4gIHBpZWNlc0VsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uU3RhcnQgYXMgRXZlbnRMaXN0ZW5lciwge1xuICAgIHBhc3NpdmU6IGZhbHNlLFxuICB9KTtcbiAgaWYgKHMuZGlzYWJsZUNvbnRleHRNZW51IHx8IHMuZHJhd2FibGUuZW5hYmxlZClcbiAgICBwaWVjZXNFbC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGUgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcblxuICBpZiAocHJvbW90aW9uRWwpIHtcbiAgICBjb25zdCBwaWVjZVNlbGVjdGlvbiA9IChlOiBzZy5Nb3VjaEV2ZW50KSA9PiBwcm9tb3RlKHMsIGUpO1xuICAgIHByb21vdGlvbkVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcGllY2VTZWxlY3Rpb24gYXMgRXZlbnRMaXN0ZW5lcik7XG4gICAgaWYgKHMuZGlzYWJsZUNvbnRleHRNZW51KSBwcm9tb3Rpb25FbC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGUgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYmluZEhhbmQoczogU3RhdGUsIGhhbmRFbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgaWYgKCdSZXNpemVPYnNlcnZlcicgaW4gd2luZG93KSBuZXcgUmVzaXplT2JzZXJ2ZXIob25SZXNpemUocykpLm9ic2VydmUoaGFuZEVsKTtcblxuICBpZiAocy52aWV3T25seSkgcmV0dXJuO1xuXG4gIGNvbnN0IG9uU3RhcnQgPSBzdGFydERyYWdGcm9tSGFuZChzKTtcbiAgaGFuZEVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uU3RhcnQgYXMgRXZlbnRMaXN0ZW5lciwgeyBwYXNzaXZlOiBmYWxzZSB9KTtcbiAgaGFuZEVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblN0YXJ0IGFzIEV2ZW50TGlzdGVuZXIsIHtcbiAgICBwYXNzaXZlOiBmYWxzZSxcbiAgfSk7XG4gIGhhbmRFbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICBpZiAocy5wcm9tb3Rpb24uY3VycmVudCkge1xuICAgICAgY2FuY2VsUHJvbW90aW9uKHMpO1xuICAgICAgcy5kb20ucmVkcmF3KCk7XG4gICAgfVxuICB9KTtcblxuICBpZiAocy5kaXNhYmxlQ29udGV4dE1lbnUgfHwgcy5kcmF3YWJsZS5lbmFibGVkKVxuICAgIGhhbmRFbC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGUgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcbn1cblxuLy8gcmV0dXJucyB0aGUgdW5iaW5kIGZ1bmN0aW9uXG5leHBvcnQgZnVuY3Rpb24gYmluZERvY3VtZW50KHM6IFN0YXRlKTogc2cuVW5iaW5kIHtcbiAgY29uc3QgdW5iaW5kczogc2cuVW5iaW5kW10gPSBbXTtcblxuICAvLyBPbGQgdmVyc2lvbnMgb2YgRWRnZSBhbmQgU2FmYXJpIGRvIG5vdCBzdXBwb3J0IFJlc2l6ZU9ic2VydmVyLiBTZW5kXG4gIC8vIHNob2dpZ3JvdW5kLnJlc2l6ZSBpZiBhIHVzZXIgYWN0aW9uIGhhcyBjaGFuZ2VkIHRoZSBib3VuZHMgb2YgdGhlIGJvYXJkLlxuICBpZiAoISgnUmVzaXplT2JzZXJ2ZXInIGluIHdpbmRvdykpIHtcbiAgICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZShkb2N1bWVudC5ib2R5LCAnc2hvZ2lncm91bmQucmVzaXplJywgb25SZXNpemUocykpKTtcbiAgfVxuXG4gIGlmICghcy52aWV3T25seSkge1xuICAgIGNvbnN0IG9ubW92ZSA9IGRyYWdPckRyYXcocywgZHJhZy5tb3ZlLCBkcmF3Lm1vdmUpLFxuICAgICAgb25lbmQgPSBkcmFnT3JEcmF3KHMsIGRyYWcuZW5kLCBkcmF3LmVuZCk7XG5cbiAgICBmb3IgKGNvbnN0IGV2IG9mIFsndG91Y2htb3ZlJywgJ21vdXNlbW92ZSddKVxuICAgICAgdW5iaW5kcy5wdXNoKHVuYmluZGFibGUoZG9jdW1lbnQsIGV2LCBvbm1vdmUgYXMgRXZlbnRMaXN0ZW5lcikpO1xuICAgIGZvciAoY29uc3QgZXYgb2YgWyd0b3VjaGVuZCcsICdtb3VzZXVwJ10pXG4gICAgICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZShkb2N1bWVudCwgZXYsIG9uZW5kIGFzIEV2ZW50TGlzdGVuZXIpKTtcblxuICAgIHVuYmluZHMucHVzaChcbiAgICAgIHVuYmluZGFibGUoZG9jdW1lbnQsICdzY3JvbGwnLCAoKSA9PiBjbGVhckJvdW5kcyhzKSwgeyBjYXB0dXJlOiB0cnVlLCBwYXNzaXZlOiB0cnVlIH0pXG4gICAgKTtcbiAgICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZSh3aW5kb3csICdyZXNpemUnLCAoKSA9PiBjbGVhckJvdW5kcyhzKSwgeyBwYXNzaXZlOiB0cnVlIH0pKTtcbiAgfVxuXG4gIHJldHVybiAoKSA9PiB1bmJpbmRzLmZvckVhY2goZiA9PiBmKCkpO1xufVxuXG5mdW5jdGlvbiB1bmJpbmRhYmxlKFxuICBlbDogRXZlbnRUYXJnZXQsXG4gIGV2ZW50TmFtZTogc3RyaW5nLFxuICBjYWxsYmFjazogRXZlbnRMaXN0ZW5lcixcbiAgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zXG4pOiBzZy5VbmJpbmQge1xuICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2ssIG9wdGlvbnMpO1xuICByZXR1cm4gKCkgPT4gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrLCBvcHRpb25zKTtcbn1cblxuZnVuY3Rpb24gc3RhcnREcmFnT3JEcmF3KHM6IFN0YXRlKTogTW91Y2hCaW5kIHtcbiAgcmV0dXJuIGUgPT4ge1xuICAgIGlmIChzLmRyYWdnYWJsZS5jdXJyZW50KSBkcmFnLmNhbmNlbChzKTtcbiAgICBlbHNlIGlmIChzLmRyYXdhYmxlLmN1cnJlbnQpIGRyYXcuY2FuY2VsKHMpO1xuICAgIGVsc2UgaWYgKGUuc2hpZnRLZXkgfHwgaXNSaWdodEJ1dHRvbihlKSB8fCBzLmRyYXdhYmxlLmZvcmNlZCkge1xuICAgICAgaWYgKHMuZHJhd2FibGUuZW5hYmxlZCkgZHJhdy5zdGFydChzLCBlKTtcbiAgICB9IGVsc2UgaWYgKCFzLnZpZXdPbmx5ICYmICFkcmFnLnVud2FudGVkRXZlbnQoZSkpIGRyYWcuc3RhcnQocywgZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGRyYWdPckRyYXcoczogU3RhdGUsIHdpdGhEcmFnOiBTdGF0ZU1vdWNoQmluZCwgd2l0aERyYXc6IFN0YXRlTW91Y2hCaW5kKTogTW91Y2hCaW5kIHtcbiAgcmV0dXJuIGUgPT4ge1xuICAgIGlmIChzLmRyYXdhYmxlLmN1cnJlbnQpIHtcbiAgICAgIGlmIChzLmRyYXdhYmxlLmVuYWJsZWQpIHdpdGhEcmF3KHMsIGUpO1xuICAgIH0gZWxzZSBpZiAoIXMudmlld09ubHkpIHdpdGhEcmFnKHMsIGUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdGFydERyYWdGcm9tSGFuZChzOiBTdGF0ZSk6IE1vdWNoQmluZCB7XG4gIHJldHVybiBlID0+IHtcbiAgICBpZiAocy5wcm9tb3Rpb24uY3VycmVudCkgcmV0dXJuO1xuXG4gICAgY29uc3QgcG9zID0gZXZlbnRQb3NpdGlvbihlKSxcbiAgICAgIHBpZWNlID0gcG9zICYmIGdldEhhbmRQaWVjZUF0RG9tUG9zKHBvcywgcy5oYW5kcy5yb2xlcywgcy5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzKCkpO1xuXG4gICAgaWYgKHBpZWNlKSB7XG4gICAgICBpZiAocy5kcmFnZ2FibGUuY3VycmVudCkgZHJhZy5jYW5jZWwocyk7XG4gICAgICBlbHNlIGlmIChzLmRyYXdhYmxlLmN1cnJlbnQpIGRyYXcuY2FuY2VsKHMpO1xuICAgICAgZWxzZSBpZiAoaXNNaWRkbGVCdXR0b24oZSkpIHtcbiAgICAgICAgaWYgKHMuZHJhd2FibGUuZW5hYmxlZCkge1xuICAgICAgICAgIGlmIChlLmNhbmNlbGFibGUgIT09IGZhbHNlKSBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgZHJhdy5zZXREcmF3UGllY2UocywgcGllY2UpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGUuc2hpZnRLZXkgfHwgaXNSaWdodEJ1dHRvbihlKSB8fCBzLmRyYXdhYmxlLmZvcmNlZCkge1xuICAgICAgICBpZiAocy5kcmF3YWJsZS5lbmFibGVkKSBkcmF3LnN0YXJ0RnJvbUhhbmQocywgcGllY2UsIGUpO1xuICAgICAgfSBlbHNlIGlmICghcy52aWV3T25seSAmJiAhZHJhZy51bndhbnRlZEV2ZW50KGUpKSB7XG4gICAgICAgIGlmIChlLmNhbmNlbGFibGUgIT09IGZhbHNlKSBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGRyYWcuZHJhZ05ld1BpZWNlKHMsIHBpZWNlLCBlKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIHByb21vdGUoczogU3RhdGUsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudCB8IG51bGwsXG4gICAgY3VyID0gcy5wcm9tb3Rpb24uY3VycmVudDtcbiAgaWYgKHRhcmdldCAmJiBpc1BpZWNlTm9kZSh0YXJnZXQpICYmIGN1cikge1xuICAgIGNvbnN0IHBpZWNlID0geyBjb2xvcjogdGFyZ2V0LnNnQ29sb3IsIHJvbGU6IHRhcmdldC5zZ1JvbGUgfSxcbiAgICAgIHByb20gPSAhc2FtZVBpZWNlKGN1ci5waWVjZSwgcGllY2UpO1xuICAgIGlmIChjdXIuZHJhZ2dlZCB8fCAocy50dXJuQ29sb3IgIT09IHMuYWN0aXZlQ29sb3IgJiYgcy5hY3RpdmVDb2xvciAhPT0gJ2JvdGgnKSkge1xuICAgICAgaWYgKHMuc2VsZWN0ZWQpIHVzZXJNb3ZlKHMsIHMuc2VsZWN0ZWQsIGN1ci5rZXksIHByb20pO1xuICAgICAgZWxzZSBpZiAocy5zZWxlY3RlZFBpZWNlKSB1c2VyRHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIGN1ci5rZXksIHByb20pO1xuICAgIH0gZWxzZSBhbmltKHMgPT4gc2VsZWN0U3F1YXJlKHMsIGN1ci5rZXksIHByb20pLCBzKTtcblxuICAgIGNhbGxVc2VyRnVuY3Rpb24ocy5wcm9tb3Rpb24uZXZlbnRzLmFmdGVyLCBwaWVjZSk7XG4gIH0gZWxzZSBhbmltKHMgPT4gY2FuY2VsUHJvbW90aW9uKHMpLCBzKTtcbiAgcy5wcm9tb3Rpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcblxuICBzLmRvbS5yZWRyYXcoKTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSB7IEFuaW1DdXJyZW50LCBBbmltVmVjdG9ycywgQW5pbVZlY3RvciwgQW5pbUZhZGluZ3MsIEFuaW1Qcm9tb3Rpb25zIH0gZnJvbSAnLi9hbmltLmpzJztcbmltcG9ydCB0eXBlIHsgRHJhZ0N1cnJlbnQgfSBmcm9tICcuL2RyYWcuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7XG4gIGtleTJwb3MsXG4gIGNyZWF0ZUVsLFxuICBzZXREaXNwbGF5LFxuICBwb3NUb1RyYW5zbGF0ZVJlbCxcbiAgdHJhbnNsYXRlUmVsLFxuICBwaWVjZU5hbWVPZixcbiAgc2VudGVQb3YsXG4gIGlzUGllY2VOb2RlLFxuICBpc1NxdWFyZU5vZGUsXG59IGZyb20gJy4vdXRpbC5qcyc7XG5cbnR5cGUgU3F1YXJlQ2xhc3NlcyA9IE1hcDxzZy5LZXksIHN0cmluZz47XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXIoczogU3RhdGUsIGJvYXJkRWxzOiBzZy5Cb2FyZEVsZW1lbnRzKTogdm9pZCB7XG4gIGNvbnN0IGFzU2VudGU6IGJvb2xlYW4gPSBzZW50ZVBvdihzLm9yaWVudGF0aW9uKSxcbiAgICBzY2FsZURvd24gPSBzLnNjYWxlRG93blBpZWNlcyA/IDAuNSA6IDEsXG4gICAgcG9zVG9UcmFuc2xhdGUgPSBwb3NUb1RyYW5zbGF0ZVJlbChzLmRpbWVuc2lvbnMpLFxuICAgIHNxdWFyZXNFbDogSFRNTEVsZW1lbnQgPSBib2FyZEVscy5zcXVhcmVzLFxuICAgIHBpZWNlc0VsOiBIVE1MRWxlbWVudCA9IGJvYXJkRWxzLnBpZWNlcyxcbiAgICBkcmFnZ2VkRWw6IHNnLlBpZWNlTm9kZSB8IHVuZGVmaW5lZCA9IGJvYXJkRWxzLmRyYWdnZWQsXG4gICAgc3F1YXJlT3ZlckVsOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZCA9IGJvYXJkRWxzLnNxdWFyZU92ZXIsXG4gICAgcHJvbW90aW9uRWw6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkID0gYm9hcmRFbHMucHJvbW90aW9uLFxuICAgIHBpZWNlczogc2cuUGllY2VzID0gcy5waWVjZXMsXG4gICAgY3VyQW5pbTogQW5pbUN1cnJlbnQgfCB1bmRlZmluZWQgPSBzLmFuaW1hdGlvbi5jdXJyZW50LFxuICAgIGFuaW1zOiBBbmltVmVjdG9ycyA9IGN1ckFuaW0gPyBjdXJBbmltLnBsYW4uYW5pbXMgOiBuZXcgTWFwKCksXG4gICAgZmFkaW5nczogQW5pbUZhZGluZ3MgPSBjdXJBbmltID8gY3VyQW5pbS5wbGFuLmZhZGluZ3MgOiBuZXcgTWFwKCksXG4gICAgcHJvbW90aW9uczogQW5pbVByb21vdGlvbnMgPSBjdXJBbmltID8gY3VyQW5pbS5wbGFuLnByb21vdGlvbnMgOiBuZXcgTWFwKCksXG4gICAgY3VyRHJhZzogRHJhZ0N1cnJlbnQgfCB1bmRlZmluZWQgPSBzLmRyYWdnYWJsZS5jdXJyZW50LFxuICAgIGN1clByb21LZXk6IHNnLktleSB8IHVuZGVmaW5lZCA9IHMucHJvbW90aW9uLmN1cnJlbnQ/LmRyYWdnZWQgPyBzLnNlbGVjdGVkIDogdW5kZWZpbmVkLFxuICAgIHNxdWFyZXM6IFNxdWFyZUNsYXNzZXMgPSBjb21wdXRlU3F1YXJlQ2xhc3NlcyhzKSxcbiAgICBzYW1lUGllY2VzID0gbmV3IFNldDxzZy5LZXk+KCksXG4gICAgbW92ZWRQaWVjZXMgPSBuZXcgTWFwPHNnLlBpZWNlTmFtZSwgc2cuUGllY2VOb2RlW10+KCk7XG5cbiAgLy8gaWYgcGllY2Ugbm90IGJlaW5nIGRyYWdnZWQgYW55bW9yZSwgaGlkZSBpdFxuICBpZiAoIWN1ckRyYWcgJiYgZHJhZ2dlZEVsPy5zZ0RyYWdnaW5nKSB7XG4gICAgZHJhZ2dlZEVsLnNnRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICBzZXREaXNwbGF5KGRyYWdnZWRFbCwgZmFsc2UpO1xuICAgIGlmIChzcXVhcmVPdmVyRWwpIHNldERpc3BsYXkoc3F1YXJlT3ZlckVsLCBmYWxzZSk7XG4gIH1cblxuICBsZXQgazogc2cuS2V5LFxuICAgIGVsOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZCxcbiAgICBwaWVjZUF0S2V5OiBzZy5QaWVjZSB8IHVuZGVmaW5lZCxcbiAgICBlbFBpZWNlTmFtZTogc2cuUGllY2VOYW1lLFxuICAgIGFuaW06IEFuaW1WZWN0b3IgfCB1bmRlZmluZWQsXG4gICAgZmFkaW5nOiBzZy5QaWVjZSB8IHVuZGVmaW5lZCxcbiAgICBwcm9tOiBzZy5QaWVjZSB8IHVuZGVmaW5lZCxcbiAgICBwTXZkc2V0OiBzZy5QaWVjZU5vZGVbXSB8IHVuZGVmaW5lZCxcbiAgICBwTXZkOiBzZy5QaWVjZU5vZGUgfCB1bmRlZmluZWQ7XG5cbiAgLy8gd2FsayBvdmVyIGFsbCBib2FyZCBkb20gZWxlbWVudHMsIGFwcGx5IGFuaW1hdGlvbnMgYW5kIGZsYWcgbW92ZWQgcGllY2VzXG4gIGVsID0gcGllY2VzRWwuZmlyc3RFbGVtZW50Q2hpbGQgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIHdoaWxlIChlbCkge1xuICAgIGlmIChpc1BpZWNlTm9kZShlbCkpIHtcbiAgICAgIGsgPSBlbC5zZ0tleTtcbiAgICAgIHBpZWNlQXRLZXkgPSBwaWVjZXMuZ2V0KGspO1xuICAgICAgYW5pbSA9IGFuaW1zLmdldChrKTtcbiAgICAgIGZhZGluZyA9IGZhZGluZ3MuZ2V0KGspO1xuICAgICAgcHJvbSA9IHByb21vdGlvbnMuZ2V0KGspO1xuICAgICAgZWxQaWVjZU5hbWUgPSBwaWVjZU5hbWVPZih7IGNvbG9yOiBlbC5zZ0NvbG9yLCByb2xlOiBlbC5zZ1JvbGUgfSk7XG5cbiAgICAgIC8vIGlmIHBpZWNlIGRyYWdnZWQgYWRkIG9yIHJlbW92ZSBnaG9zdCBjbGFzcyBvciBpZiBwcm9tb3Rpb24gZGlhbG9nIGlzIGFjdGl2ZSBmb3IgdGhlIHBpZWNlIGFkZCBwcm9tIGNsYXNzXG4gICAgICBpZiAoXG4gICAgICAgICgoY3VyRHJhZz8uc3RhcnRlZCAmJiBjdXJEcmFnLmZyb21Cb2FyZD8ub3JpZyA9PT0gaykgfHwgKGN1clByb21LZXkgJiYgY3VyUHJvbUtleSA9PT0gaykpICYmXG4gICAgICAgICFlbC5zZ0dob3N0XG4gICAgICApIHtcbiAgICAgICAgZWwuc2dHaG9zdCA9IHRydWU7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2dob3N0Jyk7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICBlbC5zZ0dob3N0ICYmXG4gICAgICAgICghY3VyRHJhZyB8fCBjdXJEcmFnLmZyb21Cb2FyZD8ub3JpZyAhPT0gaykgJiZcbiAgICAgICAgKCFjdXJQcm9tS2V5IHx8IGN1clByb21LZXkgIT09IGspXG4gICAgICApIHtcbiAgICAgICAgZWwuc2dHaG9zdCA9IGZhbHNlO1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnaG9zdCcpO1xuICAgICAgfVxuICAgICAgLy8gcmVtb3ZlIGZhZGluZyBjbGFzcyBpZiBpdCBzdGlsbCByZW1haW5zXG4gICAgICBpZiAoIWZhZGluZyAmJiBlbC5zZ0ZhZGluZykge1xuICAgICAgICBlbC5zZ0ZhZGluZyA9IGZhbHNlO1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdmYWRpbmcnKTtcbiAgICAgIH1cbiAgICAgIC8vIHRoZXJlIGlzIG5vdyBhIHBpZWNlIGF0IHRoaXMgZG9tIGtleVxuICAgICAgaWYgKHBpZWNlQXRLZXkpIHtcbiAgICAgICAgLy8gY29udGludWUgYW5pbWF0aW9uIGlmIGFscmVhZHkgYW5pbWF0aW5nIGFuZCBzYW1lIHBpZWNlIG9yIHByb21vdGluZyBwaWVjZVxuICAgICAgICAvLyAob3RoZXJ3aXNlIGl0IGNvdWxkIGFuaW1hdGUgYSBjYXB0dXJlZCBwaWVjZSlcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGFuaW0gJiZcbiAgICAgICAgICBlbC5zZ0FuaW1hdGluZyAmJlxuICAgICAgICAgIChlbFBpZWNlTmFtZSA9PT0gcGllY2VOYW1lT2YocGllY2VBdEtleSkgfHwgKHByb20gJiYgZWxQaWVjZU5hbWUgPT09IHBpZWNlTmFtZU9mKHByb20pKSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29uc3QgcG9zID0ga2V5MnBvcyhrKTtcbiAgICAgICAgICBwb3NbMF0gKz0gYW5pbVsyXTtcbiAgICAgICAgICBwb3NbMV0gKz0gYW5pbVszXTtcbiAgICAgICAgICB0cmFuc2xhdGVSZWwoZWwsIHBvc1RvVHJhbnNsYXRlKHBvcywgYXNTZW50ZSksIHNjYWxlRG93bik7XG4gICAgICAgIH0gZWxzZSBpZiAoZWwuc2dBbmltYXRpbmcpIHtcbiAgICAgICAgICBlbC5zZ0FuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2FuaW0nKTtcbiAgICAgICAgICB0cmFuc2xhdGVSZWwoZWwsIHBvc1RvVHJhbnNsYXRlKGtleTJwb3MoayksIGFzU2VudGUpLCBzY2FsZURvd24pO1xuICAgICAgICB9XG4gICAgICAgIC8vIHNhbWUgcGllY2U6IGZsYWcgYXMgc2FtZVxuICAgICAgICBpZiAoZWxQaWVjZU5hbWUgPT09IHBpZWNlTmFtZU9mKHBpZWNlQXRLZXkpICYmICghZmFkaW5nIHx8ICFlbC5zZ0ZhZGluZykpIHtcbiAgICAgICAgICBzYW1lUGllY2VzLmFkZChrKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBkaWZmZXJlbnQgcGllY2U6IGZsYWcgYXMgbW92ZWQgdW5sZXNzIGl0IGlzIGEgZmFkaW5nIHBpZWNlIG9yIGFuIGFuaW1hdGVkIHByb21vdGluZyBwaWVjZVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpZiAoZmFkaW5nICYmIGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihmYWRpbmcpKSB7XG4gICAgICAgICAgICBlbC5zZ0ZhZGluZyA9IHRydWU7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdmYWRpbmcnKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHByb20gJiYgZWxQaWVjZU5hbWUgPT09IHBpZWNlTmFtZU9mKHByb20pKSB7XG4gICAgICAgICAgICBzYW1lUGllY2VzLmFkZChrKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXBwZW5kVmFsdWUobW92ZWRQaWVjZXMsIGVsUGllY2VOYW1lLCBlbCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBubyBwaWVjZTogZmxhZyBhcyBtb3ZlZFxuICAgICAgZWxzZSB7XG4gICAgICAgIGFwcGVuZFZhbHVlKG1vdmVkUGllY2VzLCBlbFBpZWNlTmFtZSwgZWwpO1xuICAgICAgfVxuICAgIH1cbiAgICBlbCA9IGVsLm5leHRFbGVtZW50U2libGluZyBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8vIHdhbGsgb3ZlciBhbGwgc3F1YXJlcyBhbmQgYXBwbHkgY2xhc3Nlc1xuICBsZXQgc3FFbCA9IHNxdWFyZXNFbC5maXJzdEVsZW1lbnRDaGlsZCBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgd2hpbGUgKHNxRWwgJiYgaXNTcXVhcmVOb2RlKHNxRWwpKSB7XG4gICAgc3FFbC5jbGFzc05hbWUgPSBzcXVhcmVzLmdldChzcUVsLnNnS2V5KSB8fCAnJztcbiAgICBzcUVsID0gc3FFbC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIH1cblxuICAvLyB3YWxrIG92ZXIgYWxsIHBpZWNlcyBpbiBjdXJyZW50IHNldCwgYXBwbHkgZG9tIGNoYW5nZXMgdG8gbW92ZWQgcGllY2VzXG4gIC8vIG9yIGFwcGVuZCBuZXcgcGllY2VzXG4gIGZvciAoY29uc3QgW2ssIHBdIG9mIHBpZWNlcykge1xuICAgIGNvbnN0IHBpZWNlID0gcHJvbW90aW9ucy5nZXQoaykgfHwgcDtcbiAgICBhbmltID0gYW5pbXMuZ2V0KGspO1xuICAgIGlmICghc2FtZVBpZWNlcy5oYXMoaykpIHtcbiAgICAgIHBNdmRzZXQgPSBtb3ZlZFBpZWNlcy5nZXQocGllY2VOYW1lT2YocGllY2UpKTtcbiAgICAgIHBNdmQgPSBwTXZkc2V0Py5wb3AoKTtcbiAgICAgIC8vIGEgc2FtZSBwaWVjZSB3YXMgbW92ZWRcbiAgICAgIGlmIChwTXZkKSB7XG4gICAgICAgIC8vIGFwcGx5IGRvbSBjaGFuZ2VzXG4gICAgICAgIHBNdmQuc2dLZXkgPSBrO1xuICAgICAgICBpZiAocE12ZC5zZ0ZhZGluZykge1xuICAgICAgICAgIHBNdmQuc2dGYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICBwTXZkLmNsYXNzTGlzdC5yZW1vdmUoJ2ZhZGluZycpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBvcyA9IGtleTJwb3Moayk7XG4gICAgICAgIGlmIChhbmltKSB7XG4gICAgICAgICAgcE12ZC5zZ0FuaW1hdGluZyA9IHRydWU7XG4gICAgICAgICAgcE12ZC5jbGFzc0xpc3QuYWRkKCdhbmltJyk7XG4gICAgICAgICAgcG9zWzBdICs9IGFuaW1bMl07XG4gICAgICAgICAgcG9zWzFdICs9IGFuaW1bM107XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNsYXRlUmVsKHBNdmQsIHBvc1RvVHJhbnNsYXRlKHBvcywgYXNTZW50ZSksIHNjYWxlRG93bik7XG4gICAgICB9XG4gICAgICAvLyBubyBwaWVjZSBpbiBtb3ZlZCBvYmo6IGluc2VydCB0aGUgbmV3IHBpZWNlXG4gICAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgcGllY2VOb2RlID0gY3JlYXRlRWwoJ3BpZWNlJywgcGllY2VOYW1lT2YocCkpIGFzIHNnLlBpZWNlTm9kZSxcbiAgICAgICAgICBwb3MgPSBrZXkycG9zKGspO1xuXG4gICAgICAgIHBpZWNlTm9kZS5zZ0NvbG9yID0gcC5jb2xvcjtcbiAgICAgICAgcGllY2VOb2RlLnNnUm9sZSA9IHAucm9sZTtcbiAgICAgICAgcGllY2VOb2RlLnNnS2V5ID0gaztcbiAgICAgICAgaWYgKGFuaW0pIHtcbiAgICAgICAgICBwaWVjZU5vZGUuc2dBbmltYXRpbmcgPSB0cnVlO1xuICAgICAgICAgIHBvc1swXSArPSBhbmltWzJdO1xuICAgICAgICAgIHBvc1sxXSArPSBhbmltWzNdO1xuICAgICAgICB9XG4gICAgICAgIHRyYW5zbGF0ZVJlbChwaWVjZU5vZGUsIHBvc1RvVHJhbnNsYXRlKHBvcywgYXNTZW50ZSksIHNjYWxlRG93bik7XG5cbiAgICAgICAgcGllY2VzRWwuYXBwZW5kQ2hpbGQocGllY2VOb2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLy8gcmVtb3ZlIGFueSBlbGVtZW50IHRoYXQgcmVtYWlucyBpbiB0aGUgbW92ZWQgc2V0c1xuICBmb3IgKGNvbnN0IG5vZGVzIG9mIG1vdmVkUGllY2VzLnZhbHVlcygpKSB7XG4gICAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgICBwaWVjZXNFbC5yZW1vdmVDaGlsZChub2RlKTtcbiAgICB9XG4gIH1cblxuICBpZiAocHJvbW90aW9uRWwpIHJlbmRlclByb21vdGlvbihzLCBwcm9tb3Rpb25FbCk7XG59XG5cbmZ1bmN0aW9uIGFwcGVuZFZhbHVlPEssIFY+KG1hcDogTWFwPEssIFZbXT4sIGtleTogSywgdmFsdWU6IFYpOiB2b2lkIHtcbiAgY29uc3QgYXJyID0gbWFwLmdldChrZXkpO1xuICBpZiAoYXJyKSBhcnIucHVzaCh2YWx1ZSk7XG4gIGVsc2UgbWFwLnNldChrZXksIFt2YWx1ZV0pO1xufVxuXG5mdW5jdGlvbiBjb21wdXRlU3F1YXJlQ2xhc3NlcyhzOiBTdGF0ZSk6IFNxdWFyZUNsYXNzZXMge1xuICBjb25zdCBzcXVhcmVzOiBTcXVhcmVDbGFzc2VzID0gbmV3IE1hcCgpO1xuICBpZiAocy5sYXN0RGVzdHMgJiYgcy5oaWdobGlnaHQubGFzdERlc3RzKVxuICAgIGZvciAoY29uc3QgayBvZiBzLmxhc3REZXN0cykgYWRkU3F1YXJlKHNxdWFyZXMsIGssICdsYXN0LWRlc3QnKTtcbiAgaWYgKHMuY2hlY2tzICYmIHMuaGlnaGxpZ2h0LmNoZWNrKVxuICAgIGZvciAoY29uc3QgY2hlY2sgb2Ygcy5jaGVja3MpIGFkZFNxdWFyZShzcXVhcmVzLCBjaGVjaywgJ2NoZWNrJyk7XG4gIGlmIChzLmhvdmVyZWQpIGFkZFNxdWFyZShzcXVhcmVzLCBzLmhvdmVyZWQsICdob3ZlcicpO1xuICBpZiAocy5zZWxlY3RlZCkge1xuICAgIGlmIChzLmFjdGl2ZUNvbG9yID09PSAnYm90aCcgfHwgcy5hY3RpdmVDb2xvciA9PT0gcy50dXJuQ29sb3IpXG4gICAgICBhZGRTcXVhcmUoc3F1YXJlcywgcy5zZWxlY3RlZCwgJ3NlbGVjdGVkJyk7XG4gICAgZWxzZSBhZGRTcXVhcmUoc3F1YXJlcywgcy5zZWxlY3RlZCwgJ3ByZXNlbGVjdGVkJyk7XG4gICAgaWYgKHMubW92YWJsZS5zaG93RGVzdHMpIHtcbiAgICAgIGNvbnN0IGRlc3RzID0gcy5tb3ZhYmxlLmRlc3RzPy5nZXQocy5zZWxlY3RlZCk7XG4gICAgICBpZiAoZGVzdHMpXG4gICAgICAgIGZvciAoY29uc3QgayBvZiBkZXN0cykge1xuICAgICAgICAgIGFkZFNxdWFyZShzcXVhcmVzLCBrLCAnZGVzdCcgKyAocy5waWVjZXMuaGFzKGspID8gJyBvYycgOiAnJykpO1xuICAgICAgICB9XG4gICAgICBjb25zdCBwRGVzdHMgPSBzLnByZW1vdmFibGUuZGVzdHM7XG4gICAgICBpZiAocERlc3RzKVxuICAgICAgICBmb3IgKGNvbnN0IGsgb2YgcERlc3RzKSB7XG4gICAgICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIGssICdwcmUtZGVzdCcgKyAocy5waWVjZXMuaGFzKGspID8gJyBvYycgOiAnJykpO1xuICAgICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKHMuc2VsZWN0ZWRQaWVjZSkge1xuICAgIGlmIChzLmRyb3BwYWJsZS5zaG93RGVzdHMpIHtcbiAgICAgIGNvbnN0IGRlc3RzID0gcy5kcm9wcGFibGUuZGVzdHM/LmdldChwaWVjZU5hbWVPZihzLnNlbGVjdGVkUGllY2UpKTtcbiAgICAgIGlmIChkZXN0cylcbiAgICAgICAgZm9yIChjb25zdCBrIG9mIGRlc3RzKSB7XG4gICAgICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIGssICdkZXN0Jyk7XG4gICAgICAgIH1cbiAgICAgIGNvbnN0IHBEZXN0cyA9IHMucHJlZHJvcHBhYmxlLmRlc3RzO1xuICAgICAgaWYgKHBEZXN0cylcbiAgICAgICAgZm9yIChjb25zdCBrIG9mIHBEZXN0cykge1xuICAgICAgICAgIGFkZFNxdWFyZShzcXVhcmVzLCBrLCAncHJlLWRlc3QnICsgKHMucGllY2VzLmhhcyhrKSA/ICcgb2MnIDogJycpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgfVxuICBjb25zdCBwcmVtb3ZlID0gcy5wcmVtb3ZhYmxlLmN1cnJlbnQ7XG4gIGlmIChwcmVtb3ZlKSB7XG4gICAgYWRkU3F1YXJlKHNxdWFyZXMsIHByZW1vdmUub3JpZywgJ2N1cnJlbnQtcHJlJyk7XG4gICAgYWRkU3F1YXJlKHNxdWFyZXMsIHByZW1vdmUuZGVzdCwgJ2N1cnJlbnQtcHJlJyArIChwcmVtb3ZlLnByb20gPyAnIHByb20nIDogJycpKTtcbiAgfSBlbHNlIGlmIChzLnByZWRyb3BwYWJsZS5jdXJyZW50KVxuICAgIGFkZFNxdWFyZShcbiAgICAgIHNxdWFyZXMsXG4gICAgICBzLnByZWRyb3BwYWJsZS5jdXJyZW50LmtleSxcbiAgICAgICdjdXJyZW50LXByZScgKyAocy5wcmVkcm9wcGFibGUuY3VycmVudC5wcm9tID8gJyBwcm9tJyA6ICcnKVxuICAgICk7XG5cbiAgZm9yIChjb25zdCBzcWggb2Ygcy5kcmF3YWJsZS5zcXVhcmVzKSB7XG4gICAgYWRkU3F1YXJlKHNxdWFyZXMsIHNxaC5rZXksIHNxaC5jbGFzc05hbWUpO1xuICB9XG5cbiAgcmV0dXJuIHNxdWFyZXM7XG59XG5cbmZ1bmN0aW9uIGFkZFNxdWFyZShzcXVhcmVzOiBTcXVhcmVDbGFzc2VzLCBrZXk6IHNnLktleSwga2xhc3M6IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCBjbGFzc2VzID0gc3F1YXJlcy5nZXQoa2V5KTtcbiAgaWYgKGNsYXNzZXMpIHNxdWFyZXMuc2V0KGtleSwgYCR7Y2xhc3Nlc30gJHtrbGFzc31gKTtcbiAgZWxzZSBzcXVhcmVzLnNldChrZXksIGtsYXNzKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyUHJvbW90aW9uKHM6IFN0YXRlLCBwcm9tb3Rpb25FbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgY29uc3QgY3VyID0gcy5wcm9tb3Rpb24uY3VycmVudCxcbiAgICBrZXkgPSBjdXI/LmtleSxcbiAgICBwaWVjZXMgPSBjdXIgPyBbY3VyLnByb21vdGVkUGllY2UsIGN1ci5waWVjZV0gOiBbXSxcbiAgICBoYXNoID0gcHJvbW90aW9uSGFzaCghIWN1ciwga2V5LCBwaWVjZXMpO1xuICBpZiAocy5wcm9tb3Rpb24ucHJldlByb21vdGlvbkhhc2ggPT09IGhhc2gpIHJldHVybjtcbiAgcy5wcm9tb3Rpb24ucHJldlByb21vdGlvbkhhc2ggPSBoYXNoO1xuXG4gIGlmIChrZXkpIHtcbiAgICBjb25zdCBhc1NlbnRlID0gc2VudGVQb3Yocy5vcmllbnRhdGlvbiksXG4gICAgICBpbml0UG9zID0ga2V5MnBvcyhrZXkpLFxuICAgICAgY29sb3IgPSBjdXIucGllY2UuY29sb3IsXG4gICAgICBwcm9tb3Rpb25TcXVhcmUgPSBjcmVhdGVFbCgnc2ctcHJvbW90aW9uLXNxdWFyZScpLFxuICAgICAgcHJvbW90aW9uQ2hvaWNlcyA9IGNyZWF0ZUVsKCdzZy1wcm9tb3Rpb24tY2hvaWNlcycpO1xuICAgIGlmIChzLm9yaWVudGF0aW9uICE9PSBjb2xvcikgcHJvbW90aW9uQ2hvaWNlcy5jbGFzc0xpc3QuYWRkKCdyZXZlcnNlZCcpO1xuICAgIHRyYW5zbGF0ZVJlbChwcm9tb3Rpb25TcXVhcmUsIHBvc1RvVHJhbnNsYXRlUmVsKHMuZGltZW5zaW9ucykoaW5pdFBvcywgYXNTZW50ZSksIDEpO1xuXG4gICAgZm9yIChjb25zdCBwIG9mIHBpZWNlcykge1xuICAgICAgY29uc3QgcGllY2VOb2RlID0gY3JlYXRlRWwoJ3BpZWNlJywgcGllY2VOYW1lT2YocCkpIGFzIHNnLlBpZWNlTm9kZTtcbiAgICAgIHBpZWNlTm9kZS5zZ0NvbG9yID0gcC5jb2xvcjtcbiAgICAgIHBpZWNlTm9kZS5zZ1JvbGUgPSBwLnJvbGU7XG4gICAgICBwcm9tb3Rpb25DaG9pY2VzLmFwcGVuZENoaWxkKHBpZWNlTm9kZSk7XG4gICAgfVxuXG4gICAgcHJvbW90aW9uRWwuaW5uZXJIVE1MID0gJyc7XG4gICAgcHJvbW90aW9uU3F1YXJlLmFwcGVuZENoaWxkKHByb21vdGlvbkNob2ljZXMpO1xuICAgIHByb21vdGlvbkVsLmFwcGVuZENoaWxkKHByb21vdGlvblNxdWFyZSk7XG4gICAgc2V0RGlzcGxheShwcm9tb3Rpb25FbCwgdHJ1ZSk7XG4gIH0gZWxzZSB7XG4gICAgc2V0RGlzcGxheShwcm9tb3Rpb25FbCwgZmFsc2UpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHByb21vdGlvbkhhc2goYWN0aXZlOiBib29sZWFuLCBrZXk6IHNnLktleSB8IHVuZGVmaW5lZCwgcGllY2VzOiBzZy5QaWVjZVtdKTogc3RyaW5nIHtcbiAgcmV0dXJuIFthY3RpdmUsIGtleSwgcGllY2VzLm1hcChwID0+IHBpZWNlTmFtZU9mKHApKS5qb2luKCcgJyldLmpvaW4oJyAnKTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSB7IFdyYXBFbGVtZW50cywgV3JhcEVsZW1lbnRzQm9vbGVhbiB9IGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgd3JhcEJvYXJkLCB3cmFwSGFuZCB9IGZyb20gJy4vd3JhcC5qcyc7XG5pbXBvcnQgKiBhcyBldmVudHMgZnJvbSAnLi9ldmVudHMuanMnO1xuaW1wb3J0IHsgcmVuZGVySGFuZCB9IGZyb20gJy4vaGFuZHMuanMnO1xuaW1wb3J0IHsgcmVuZGVyIH0gZnJvbSAnLi9yZW5kZXIuanMnO1xuXG5mdW5jdGlvbiBhdHRhY2hCb2FyZChzdGF0ZTogU3RhdGUsIGJvYXJkV3JhcDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgY29uc3QgZWxlbWVudHMgPSB3cmFwQm9hcmQoYm9hcmRXcmFwLCBzdGF0ZSk7XG5cbiAgLy8gaW4gY2FzZSBvZiBpbmxpbmVkIGhhbmRzXG4gIGlmIChlbGVtZW50cy5oYW5kcykgYXR0YWNoSGFuZHMoc3RhdGUsIGVsZW1lbnRzLmhhbmRzLnRvcCwgZWxlbWVudHMuaGFuZHMuYm90dG9tKTtcblxuICBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmJvYXJkID0gYm9hcmRXcmFwO1xuICBzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQgPSBlbGVtZW50cztcbiAgc3RhdGUuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMuY2xlYXIoKTtcblxuICBldmVudHMuYmluZEJvYXJkKHN0YXRlLCBlbGVtZW50cyk7XG5cbiAgc3RhdGUuZHJhd2FibGUucHJldlN2Z0hhc2ggPSAnJztcbiAgc3RhdGUucHJvbW90aW9uLnByZXZQcm9tb3Rpb25IYXNoID0gJyc7XG5cbiAgcmVuZGVyKHN0YXRlLCBlbGVtZW50cyk7XG59XG5cbmZ1bmN0aW9uIGF0dGFjaEhhbmRzKHN0YXRlOiBTdGF0ZSwgaGFuZFRvcFdyYXA/OiBIVE1MRWxlbWVudCwgaGFuZEJvdHRvbVdyYXA/OiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICBpZiAoIXN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcykgc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzID0ge307XG4gIGlmICghc3RhdGUuZG9tLndyYXBFbGVtZW50cy5oYW5kcykgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5oYW5kcyA9IHt9O1xuXG4gIGlmIChoYW5kVG9wV3JhcCkge1xuICAgIGNvbnN0IGhhbmRUb3AgPSB3cmFwSGFuZChoYW5kVG9wV3JhcCwgJ3RvcCcsIHN0YXRlKTtcbiAgICBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmhhbmRzLnRvcCA9IGhhbmRUb3BXcmFwO1xuICAgIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcy50b3AgPSBoYW5kVG9wO1xuICAgIGV2ZW50cy5iaW5kSGFuZChzdGF0ZSwgaGFuZFRvcCk7XG4gICAgcmVuZGVySGFuZChzdGF0ZSwgaGFuZFRvcCk7XG4gIH1cbiAgaWYgKGhhbmRCb3R0b21XcmFwKSB7XG4gICAgY29uc3QgaGFuZEJvdHRvbSA9IHdyYXBIYW5kKGhhbmRCb3R0b21XcmFwLCAnYm90dG9tJywgc3RhdGUpO1xuICAgIHN0YXRlLmRvbS53cmFwRWxlbWVudHMuaGFuZHMuYm90dG9tID0gaGFuZEJvdHRvbVdyYXA7XG4gICAgc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzLmJvdHRvbSA9IGhhbmRCb3R0b207XG4gICAgZXZlbnRzLmJpbmRIYW5kKHN0YXRlLCBoYW5kQm90dG9tKTtcbiAgICByZW5kZXJIYW5kKHN0YXRlLCBoYW5kQm90dG9tKTtcbiAgfVxuXG4gIGlmIChoYW5kVG9wV3JhcCB8fCBoYW5kQm90dG9tV3JhcCkge1xuICAgIHN0YXRlLmRvbS5ib3VuZHMuaGFuZHMuYm91bmRzLmNsZWFyKCk7XG4gICAgc3RhdGUuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcy5jbGVhcigpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWRyYXdBbGwod3JhcEVsZW1lbnRzOiBXcmFwRWxlbWVudHMsIHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBpZiAod3JhcEVsZW1lbnRzLmJvYXJkKSBhdHRhY2hCb2FyZChzdGF0ZSwgd3JhcEVsZW1lbnRzLmJvYXJkKTtcbiAgaWYgKHdyYXBFbGVtZW50cy5oYW5kcyAmJiAhc3RhdGUuaGFuZHMuaW5saW5lZClcbiAgICBhdHRhY2hIYW5kcyhzdGF0ZSwgd3JhcEVsZW1lbnRzLmhhbmRzLnRvcCwgd3JhcEVsZW1lbnRzLmhhbmRzLmJvdHRvbSk7XG5cbiAgLy8gc2hhcGVzIG1pZ2h0IGRlcGVuZCBib3RoIG9uIGJvYXJkIGFuZCBoYW5kcyAtIHJlZHJhdyBvbmx5IGFmdGVyIGJvdGggYXJlIGRvbmVcbiAgc3RhdGUuZG9tLnJlZHJhd1NoYXBlcygpO1xuXG4gIGlmIChzdGF0ZS5ldmVudHMuaW5zZXJ0KVxuICAgIHN0YXRlLmV2ZW50cy5pbnNlcnQod3JhcEVsZW1lbnRzLmJvYXJkICYmIHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZCwge1xuICAgICAgdG9wOiB3cmFwRWxlbWVudHMuaGFuZHM/LnRvcCAmJiBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHM/LnRvcCxcbiAgICAgIGJvdHRvbTogd3JhcEVsZW1lbnRzLmhhbmRzPy5ib3R0b20gJiYgc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzPy5ib3R0b20sXG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXRhY2hFbGVtZW50cyh3ZWI6IFdyYXBFbGVtZW50c0Jvb2xlYW4sIHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBpZiAod2ViLmJvYXJkKSB7XG4gICAgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5ib2FyZCA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMuY2xlYXIoKTtcbiAgfVxuICBpZiAoc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzICYmIHN0YXRlLmRvbS53cmFwRWxlbWVudHMuaGFuZHMpIHtcbiAgICBpZiAod2ViLmhhbmRzPy50b3ApIHtcbiAgICAgIHN0YXRlLmRvbS53cmFwRWxlbWVudHMuaGFuZHMudG9wID0gdW5kZWZpbmVkO1xuICAgICAgc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzLnRvcCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKHdlYi5oYW5kcz8uYm90dG9tKSB7XG4gICAgICBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmhhbmRzLmJvdHRvbSA9IHVuZGVmaW5lZDtcbiAgICAgIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcy5ib3R0b20gPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmICh3ZWIuaGFuZHM/LnRvcCB8fCB3ZWIuaGFuZHM/LmJvdHRvbSkge1xuICAgICAgc3RhdGUuZG9tLmJvdW5kcy5oYW5kcy5ib3VuZHMuY2xlYXIoKTtcbiAgICAgIHN0YXRlLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMuY2xlYXIoKTtcbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgdHlwZSB7IENvbmZpZyB9IGZyb20gJy4vY29uZmlnLmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlIHsgRHJhd1NoYXBlLCBTcXVhcmVIaWdobGlnaHQgfSBmcm9tICcuL2RyYXcuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCAqIGFzIGJvYXJkIGZyb20gJy4vYm9hcmQuanMnO1xuaW1wb3J0IHsgYWRkVG9IYW5kLCByZW1vdmVGcm9tSGFuZCB9IGZyb20gJy4vaGFuZHMuanMnO1xuaW1wb3J0IHsgaW5mZXJEaW1lbnNpb25zLCBib2FyZFRvU2ZlbiwgaGFuZHNUb1NmZW4gfSBmcm9tICcuL3NmZW4uanMnO1xuaW1wb3J0IHsgYXBwbHlBbmltYXRpb24sIGNvbmZpZ3VyZSB9IGZyb20gJy4vY29uZmlnLmpzJztcbmltcG9ydCB7IGFuaW0sIHJlbmRlciB9IGZyb20gJy4vYW5pbS5qcyc7XG5pbXBvcnQgeyBjYW5jZWwgYXMgZHJhZ0NhbmNlbCwgZHJhZ05ld1BpZWNlIH0gZnJvbSAnLi9kcmFnLmpzJztcbmltcG9ydCB7IGRldGFjaEVsZW1lbnRzLCByZWRyYXdBbGwgfSBmcm9tICcuL2RvbS5qcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXBpIHtcbiAgLy8gYXR0YWNoIGVsZW1lbnRzIHRvIGN1cnJlbnQgc2cgaW5zdGFuY2VcbiAgYXR0YWNoKHdyYXBFbGVtZW50czogc2cuV3JhcEVsZW1lbnRzKTogdm9pZDtcblxuICAvLyBkZXRhY2ggZWxlbWVudHMgZnJvbSBjdXJyZW50IHNnIGluc3RhbmNlXG4gIGRldGFjaCh3cmFwRWxlbWVudHNCb29sZWFuOiBzZy5XcmFwRWxlbWVudHNCb29sZWFuKTogdm9pZDtcblxuICAvLyByZWNvbmZpZ3VyZSB0aGUgaW5zdGFuY2UuIEFjY2VwdHMgYWxsIGNvbmZpZyBvcHRpb25zXG4gIC8vIGJvYXJkIHdpbGwgYmUgYW5pbWF0ZWQgYWNjb3JkaW5nbHksIGlmIGFuaW1hdGlvbnMgYXJlIGVuYWJsZWRcbiAgc2V0KGNvbmZpZzogQ29uZmlnLCBza2lwQW5pbWF0aW9uPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gcmVhZCBzaG9naWdyb3VuZCBzdGF0ZTsgd3JpdGUgYXQgeW91ciBvd24gcmlza3NcbiAgc3RhdGU6IFN0YXRlO1xuXG4gIC8vIGdldCB0aGUgcG9zaXRpb24gb24gdGhlIGJvYXJkIGluIEZvcnN5dGggbm90YXRpb25cbiAgZ2V0Qm9hcmRTZmVuKCk6IHNnLkJvYXJkU2ZlbjtcblxuICAvLyBnZXQgdGhlIHBpZWNlcyBpbiBoYW5kIGluIEZvcnN5dGggbm90YXRpb25cbiAgZ2V0SGFuZHNTZmVuKCk6IHNnLkhhbmRzU2ZlbjtcblxuICAvLyBjaGFuZ2UgdGhlIHZpZXcgYW5nbGVcbiAgdG9nZ2xlT3JpZW50YXRpb24oKTogdm9pZDtcblxuICAvLyBwZXJmb3JtIGEgbW92ZSBwcm9ncmFtbWF0aWNhbGx5XG4gIG1vdmUob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXksIHByb20/OiBib29sZWFuKTogdm9pZDtcblxuICAvLyBwZXJmb3JtIGEgZHJvcCBwcm9ncmFtbWF0aWNhbGx5LCBieSBkZWZhdWx0IHBpZWNlIGlzIHRha2VuIGZyb20gaGFuZFxuICBkcm9wKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb20/OiBib29sZWFuLCBzcGFyZT86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIGFkZCBhbmQvb3IgcmVtb3ZlIGFyYml0cmFyeSBwaWVjZXMgb24gdGhlIGJvYXJkXG4gIHNldFBpZWNlcyhwaWVjZXM6IHNnLlBpZWNlc0RpZmYpOiB2b2lkO1xuXG4gIC8vIGFkZCBwaWVjZS5yb2xlIHRvIGhhbmQgb2YgcGllY2UuY29sb3JcbiAgYWRkVG9IYW5kKHBpZWNlOiBzZy5QaWVjZSwgY291bnQ/OiBudW1iZXIpOiB2b2lkO1xuXG4gIC8vIHJlbW92ZSBwaWVjZS5yb2xlIGZyb20gaGFuZCBvZiBwaWVjZS5jb2xvclxuICByZW1vdmVGcm9tSGFuZChwaWVjZTogc2cuUGllY2UsIGNvdW50PzogbnVtYmVyKTogdm9pZDtcblxuICAvLyBjbGljayBhIHNxdWFyZSBwcm9ncmFtbWF0aWNhbGx5XG4gIHNlbGVjdFNxdWFyZShrZXk6IHNnLktleSB8IG51bGwsIHByb20/OiBib29sZWFuLCBmb3JjZT86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIHNlbGVjdCBhIHBpZWNlIGZyb20gaGFuZCB0byBkcm9wIHByb2dyYW1hdGljYWxseSwgYnkgZGVmYXVsdCBwaWVjZSBpbiBoYW5kIGlzIHNlbGVjdGVkXG4gIHNlbGVjdFBpZWNlKHBpZWNlOiBzZy5QaWVjZSB8IG51bGwsIHNwYXJlPzogYm9vbGVhbiwgZm9yY2U/OiBib29sZWFuKTogdm9pZDtcblxuICAvLyBwbGF5IHRoZSBjdXJyZW50IHByZW1vdmUsIGlmIGFueTsgcmV0dXJucyB0cnVlIGlmIHByZW1vdmUgd2FzIHBsYXllZFxuICBwbGF5UHJlbW92ZSgpOiBib29sZWFuO1xuXG4gIC8vIGNhbmNlbCB0aGUgY3VycmVudCBwcmVtb3ZlLCBpZiBhbnlcbiAgY2FuY2VsUHJlbW92ZSgpOiB2b2lkO1xuXG4gIC8vIHBsYXkgdGhlIGN1cnJlbnQgcHJlZHJvcCwgaWYgYW55OyByZXR1cm5zIHRydWUgaWYgcHJlbW92ZSB3YXMgcGxheWVkXG4gIHBsYXlQcmVkcm9wKCk6IGJvb2xlYW47XG5cbiAgLy8gY2FuY2VsIHRoZSBjdXJyZW50IHByZWRyb3AsIGlmIGFueVxuICBjYW5jZWxQcmVkcm9wKCk6IHZvaWQ7XG5cbiAgLy8gY2FuY2VsIHRoZSBjdXJyZW50IG1vdmUgb3IgZHJvcCBiZWluZyBtYWRlLCBwcmVtb3ZlcyBhbmQgcHJlZHJvcHNcbiAgY2FuY2VsTW92ZU9yRHJvcCgpOiB2b2lkO1xuXG4gIC8vIGNhbmNlbCBjdXJyZW50IG1vdmUgb3IgZHJvcCBhbmQgcHJldmVudCBmdXJ0aGVyIG9uZXNcbiAgc3RvcCgpOiB2b2lkO1xuXG4gIC8vIHByb2dyYW1tYXRpY2FsbHkgZHJhdyB1c2VyIHNoYXBlc1xuICBzZXRTaGFwZXMoc2hhcGVzOiBEcmF3U2hhcGVbXSk6IHZvaWQ7XG5cbiAgLy8gcHJvZ3JhbW1hdGljYWxseSBkcmF3IGF1dG8gc2hhcGVzXG4gIHNldEF1dG9TaGFwZXMoc2hhcGVzOiBEcmF3U2hhcGVbXSk6IHZvaWQ7XG5cbiAgLy8gcHJvZ3JhbW1hdGljYWxseSBoaWdobGlnaHQgc3F1YXJlc1xuICBzZXRTcXVhcmVIaWdobGlnaHRzKHNxdWFyZXM6IFNxdWFyZUhpZ2hsaWdodFtdKTogdm9pZDtcblxuICAvLyBmb3IgcGllY2UgZHJvcHBpbmcgYW5kIGJvYXJkIGVkaXRvcnNcbiAgZHJhZ05ld1BpZWNlKHBpZWNlOiBzZy5QaWVjZSwgZXZlbnQ6IHNnLk1vdWNoRXZlbnQsIHNwYXJlPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gdW5iaW5kcyBhbGwgZXZlbnRzXG4gIC8vIChpbXBvcnRhbnQgZm9yIGRvY3VtZW50LXdpZGUgZXZlbnRzIGxpa2Ugc2Nyb2xsIGFuZCBtb3VzZW1vdmUpXG4gIGRlc3Ryb3k6IHNnLlVuYmluZDtcbn1cblxuLy8gc2VlIEFQSSB0eXBlcyBhbmQgZG9jdW1lbnRhdGlvbnMgaW4gYXBpLmQudHNcbmV4cG9ydCBmdW5jdGlvbiBzdGFydChzdGF0ZTogU3RhdGUpOiBBcGkge1xuICByZXR1cm4ge1xuICAgIGF0dGFjaCh3cmFwRWxlbWVudHM6IHNnLldyYXBFbGVtZW50cyk6IHZvaWQge1xuICAgICAgcmVkcmF3QWxsKHdyYXBFbGVtZW50cywgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBkZXRhY2god3JhcEVsZW1lbnRzQm9vbGVhbjogc2cuV3JhcEVsZW1lbnRzQm9vbGVhbik6IHZvaWQge1xuICAgICAgZGV0YWNoRWxlbWVudHMod3JhcEVsZW1lbnRzQm9vbGVhbiwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzZXQoY29uZmlnOiBDb25maWcsIHNraXBBbmltYXRpb24/OiBib29sZWFuKTogdm9pZCB7XG4gICAgICBmdW5jdGlvbiBnZXRCeVBhdGgocGF0aDogc3RyaW5nLCBvYmo6IGFueSkge1xuICAgICAgICBjb25zdCBwcm9wZXJ0aWVzID0gcGF0aC5zcGxpdCgnLicpO1xuICAgICAgICByZXR1cm4gcHJvcGVydGllcy5yZWR1Y2UoKHByZXYsIGN1cnIpID0+IHByZXYgJiYgcHJldltjdXJyXSwgb2JqKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZm9yY2VSZWRyYXdQcm9wczogKGAke2tleW9mIENvbmZpZ31gIHwgYCR7a2V5b2YgQ29uZmlnfS4ke3N0cmluZ31gKVtdID0gW1xuICAgICAgICAnb3JpZW50YXRpb24nLFxuICAgICAgICAndmlld09ubHknLFxuICAgICAgICAnY29vcmRpbmF0ZXMuZW5hYmxlZCcsXG4gICAgICAgICdjb29yZGluYXRlcy5ub3RhdGlvbicsXG4gICAgICAgICdkcmF3YWJsZS52aXNpYmxlJyxcbiAgICAgICAgJ2hhbmRzLmlubGluZWQnLFxuICAgICAgXTtcbiAgICAgIGNvbnN0IG5ld0RpbXMgPSBjb25maWcuc2Zlbj8uYm9hcmQgJiYgaW5mZXJEaW1lbnNpb25zKGNvbmZpZy5zZmVuLmJvYXJkKTtcbiAgICAgIGNvbnN0IHRvUmVkcmF3ID1cbiAgICAgICAgZm9yY2VSZWRyYXdQcm9wcy5zb21lKHAgPT4ge1xuICAgICAgICAgIGNvbnN0IGNSZXMgPSBnZXRCeVBhdGgocCwgY29uZmlnKTtcbiAgICAgICAgICByZXR1cm4gY1JlcyAmJiBjUmVzICE9PSBnZXRCeVBhdGgocCwgc3RhdGUpO1xuICAgICAgICB9KSB8fFxuICAgICAgICAhIShcbiAgICAgICAgICBuZXdEaW1zICYmXG4gICAgICAgICAgKG5ld0RpbXMuZmlsZXMgIT09IHN0YXRlLmRpbWVuc2lvbnMuZmlsZXMgfHwgbmV3RGltcy5yYW5rcyAhPT0gc3RhdGUuZGltZW5zaW9ucy5yYW5rcylcbiAgICAgICAgKSB8fFxuICAgICAgICAhIWNvbmZpZy5oYW5kcz8ucm9sZXM/LmV2ZXJ5KChyLCBpKSA9PiByID09PSBzdGF0ZS5oYW5kcy5yb2xlc1tpXSk7XG5cbiAgICAgIGlmICh0b1JlZHJhdykge1xuICAgICAgICBib2FyZC5yZXNldChzdGF0ZSk7XG4gICAgICAgIGNvbmZpZ3VyZShzdGF0ZSwgY29uZmlnKTtcbiAgICAgICAgcmVkcmF3QWxsKHN0YXRlLmRvbS53cmFwRWxlbWVudHMsIHN0YXRlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFwcGx5QW5pbWF0aW9uKHN0YXRlLCBjb25maWcpO1xuICAgICAgICAoY29uZmlnLnNmZW4/LmJvYXJkICYmICFza2lwQW5pbWF0aW9uID8gYW5pbSA6IHJlbmRlcikoXG4gICAgICAgICAgc3RhdGUgPT4gY29uZmlndXJlKHN0YXRlLCBjb25maWcpLFxuICAgICAgICAgIHN0YXRlXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHN0YXRlLFxuXG4gICAgZ2V0Qm9hcmRTZmVuOiAoKSA9PiBib2FyZFRvU2ZlbihzdGF0ZS5waWVjZXMsIHN0YXRlLmRpbWVuc2lvbnMsIHN0YXRlLmZvcnN5dGgudG9Gb3JzeXRoKSxcblxuICAgIGdldEhhbmRzU2ZlbjogKCkgPT5cbiAgICAgIGhhbmRzVG9TZmVuKHN0YXRlLmhhbmRzLmhhbmRNYXAsIHN0YXRlLmhhbmRzLnJvbGVzLCBzdGF0ZS5mb3JzeXRoLnRvRm9yc3l0aCksXG5cbiAgICB0b2dnbGVPcmllbnRhdGlvbigpOiB2b2lkIHtcbiAgICAgIGJvYXJkLnRvZ2dsZU9yaWVudGF0aW9uKHN0YXRlKTtcbiAgICAgIHJlZHJhd0FsbChzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIG1vdmUob3JpZywgZGVzdCwgcHJvbSk6IHZvaWQge1xuICAgICAgYW5pbShcbiAgICAgICAgc3RhdGUgPT5cbiAgICAgICAgICBib2FyZC5iYXNlTW92ZShzdGF0ZSwgb3JpZywgZGVzdCwgcHJvbSB8fCBzdGF0ZS5wcm9tb3Rpb24uZm9yY2VNb3ZlUHJvbW90aW9uKG9yaWcsIGRlc3QpKSxcbiAgICAgICAgc3RhdGVcbiAgICAgICk7XG4gICAgfSxcblxuICAgIGRyb3AocGllY2UsIGtleSwgcHJvbSwgc3BhcmUpOiB2b2lkIHtcbiAgICAgIGFuaW0oc3RhdGUgPT4ge1xuICAgICAgICBzdGF0ZS5kcm9wcGFibGUuc3BhcmUgPSAhIXNwYXJlO1xuICAgICAgICBib2FyZC5iYXNlRHJvcChzdGF0ZSwgcGllY2UsIGtleSwgcHJvbSB8fCBzdGF0ZS5wcm9tb3Rpb24uZm9yY2VEcm9wUHJvbW90aW9uKHBpZWNlLCBrZXkpKTtcbiAgICAgIH0sIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc2V0UGllY2VzKHBpZWNlcyk6IHZvaWQge1xuICAgICAgYW5pbShzdGF0ZSA9PiBib2FyZC5zZXRQaWVjZXMoc3RhdGUsIHBpZWNlcyksIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgYWRkVG9IYW5kKHBpZWNlOiBzZy5QaWVjZSwgY291bnQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgcmVuZGVyKHN0YXRlID0+IGFkZFRvSGFuZChzdGF0ZSwgcGllY2UsIGNvdW50KSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICByZW1vdmVGcm9tSGFuZChwaWVjZTogc2cuUGllY2UsIGNvdW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgIHJlbmRlcihzdGF0ZSA9PiByZW1vdmVGcm9tSGFuZChzdGF0ZSwgcGllY2UsIGNvdW50KSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzZWxlY3RTcXVhcmUoa2V5LCBwcm9tLCBmb3JjZSk6IHZvaWQge1xuICAgICAgaWYgKGtleSkgYW5pbShzdGF0ZSA9PiBib2FyZC5zZWxlY3RTcXVhcmUoc3RhdGUsIGtleSwgcHJvbSwgZm9yY2UpLCBzdGF0ZSk7XG4gICAgICBlbHNlIGlmIChzdGF0ZS5zZWxlY3RlZCkge1xuICAgICAgICBib2FyZC51bnNlbGVjdChzdGF0ZSk7XG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc2VsZWN0UGllY2UocGllY2UsIHNwYXJlLCBmb3JjZSk6IHZvaWQge1xuICAgICAgaWYgKHBpZWNlKSByZW5kZXIoc3RhdGUgPT4gYm9hcmQuc2VsZWN0UGllY2Uoc3RhdGUsIHBpZWNlLCBzcGFyZSwgZm9yY2UsIHRydWUpLCBzdGF0ZSk7XG4gICAgICBlbHNlIGlmIChzdGF0ZS5zZWxlY3RlZFBpZWNlKSB7XG4gICAgICAgIGJvYXJkLnVuc2VsZWN0KHN0YXRlKTtcbiAgICAgICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBwbGF5UHJlbW92ZSgpOiBib29sZWFuIHtcbiAgICAgIGlmIChzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQpIHtcbiAgICAgICAgaWYgKGFuaW0oYm9hcmQucGxheVByZW1vdmUsIHN0YXRlKSkgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vIGlmIHRoZSBwcmVtb3ZlIGNvdWxkbid0IGJlIHBsYXllZCwgcmVkcmF3IHRvIGNsZWFyIGl0IHVwXG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgcGxheVByZWRyb3AoKTogYm9vbGVhbiB7XG4gICAgICBpZiAoc3RhdGUucHJlZHJvcHBhYmxlLmN1cnJlbnQpIHtcbiAgICAgICAgaWYgKGFuaW0oYm9hcmQucGxheVByZWRyb3AsIHN0YXRlKSkgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vIGlmIHRoZSBwcmVkcm9wIGNvdWxkbid0IGJlIHBsYXllZCwgcmVkcmF3IHRvIGNsZWFyIGl0IHVwXG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgY2FuY2VsUHJlbW92ZSgpOiB2b2lkIHtcbiAgICAgIHJlbmRlcihib2FyZC51bnNldFByZW1vdmUsIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgY2FuY2VsUHJlZHJvcCgpOiB2b2lkIHtcbiAgICAgIHJlbmRlcihib2FyZC51bnNldFByZWRyb3AsIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgY2FuY2VsTW92ZU9yRHJvcCgpOiB2b2lkIHtcbiAgICAgIHJlbmRlcihzdGF0ZSA9PiB7XG4gICAgICAgIGJvYXJkLmNhbmNlbE1vdmVPckRyb3Aoc3RhdGUpO1xuICAgICAgICBkcmFnQ2FuY2VsKHN0YXRlKTtcbiAgICAgIH0sIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc3RvcCgpOiB2b2lkIHtcbiAgICAgIHJlbmRlcihzdGF0ZSA9PiB7XG4gICAgICAgIGJvYXJkLnN0b3Aoc3RhdGUpO1xuICAgICAgfSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzZXRBdXRvU2hhcGVzKHNoYXBlczogRHJhd1NoYXBlW10pOiB2b2lkIHtcbiAgICAgIHJlbmRlcihzdGF0ZSA9PiAoc3RhdGUuZHJhd2FibGUuYXV0b1NoYXBlcyA9IHNoYXBlcyksIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc2V0U2hhcGVzKHNoYXBlczogRHJhd1NoYXBlW10pOiB2b2lkIHtcbiAgICAgIHJlbmRlcihzdGF0ZSA9PiAoc3RhdGUuZHJhd2FibGUuc2hhcGVzID0gc2hhcGVzKSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzZXRTcXVhcmVIaWdobGlnaHRzKHNxdWFyZXM6IFNxdWFyZUhpZ2hsaWdodFtdKTogdm9pZCB7XG4gICAgICByZW5kZXIoc3RhdGUgPT4gKHN0YXRlLmRyYXdhYmxlLnNxdWFyZXMgPSBzcXVhcmVzKSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBkcmFnTmV3UGllY2UocGllY2UsIGV2ZW50LCBzcGFyZSk6IHZvaWQge1xuICAgICAgZHJhZ05ld1BpZWNlKHN0YXRlLCBwaWVjZSwgZXZlbnQsIHNwYXJlKTtcbiAgICB9LFxuXG4gICAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICAgIGJvYXJkLnN0b3Aoc3RhdGUpO1xuICAgICAgc3RhdGUuZG9tLnVuYmluZCgpO1xuICAgICAgc3RhdGUuZG9tLmRlc3Ryb3llZCA9IHRydWU7XG4gICAgfSxcbiAgfTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IEFuaW1DdXJyZW50IH0gZnJvbSAnLi9hbmltLmpzJztcbmltcG9ydCB0eXBlIHsgRHJhZ0N1cnJlbnQgfSBmcm9tICcuL2RyYWcuanMnO1xuaW1wb3J0IHR5cGUgeyBEcmF3YWJsZSB9IGZyb20gJy4vZHJhdy5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEhlYWRsZXNzU3RhdGUge1xuICBwaWVjZXM6IHNnLlBpZWNlcztcbiAgb3JpZW50YXRpb246IHNnLkNvbG9yOyAvLyBib2FyZCBvcmllbnRhdGlvbi4gc2VudGUgfCBnb3RlXG4gIGRpbWVuc2lvbnM6IHNnLkRpbWVuc2lvbnM7IC8vIGJvYXJkIGRpbWVuc2lvbnMgLSBtYXggMTZ4MTZcbiAgdHVybkNvbG9yOiBzZy5Db2xvcjsgLy8gdHVybiB0byBwbGF5LiBzZW50ZSB8IGdvdGVcbiAgYWN0aXZlQ29sb3I/OiBzZy5Db2xvciB8ICdib3RoJzsgLy8gY29sb3IgdGhhdCBjYW4gbW92ZSBvciBkcm9wLiBzZW50ZSB8IGdvdGUgfCBib3RoIHwgdW5kZWZpbmVkXG4gIGNoZWNrcz86IHNnLktleVtdOyAvLyBzcXVhcmVzIGN1cnJlbnRseSBpbiBjaGVjayBbXCI1YVwiXVxuICBsYXN0RGVzdHM/OiBzZy5LZXlbXTsgLy8gc3F1YXJlcyBwYXJ0IG9mIHRoZSBsYXN0IG1vdmUgb3IgZHJvcCBbXCIyYlwiOyBcIjhoXCJdXG4gIHNlbGVjdGVkPzogc2cuS2V5OyAvLyBzcXVhcmUgY3VycmVudGx5IHNlbGVjdGVkIFwiMWFcIlxuICBzZWxlY3RlZFBpZWNlPzogc2cuUGllY2U7IC8vIHBpZWNlIGluIGhhbmQgY3VycmVudGx5IHNlbGVjdGVkXG4gIGhvdmVyZWQ/OiBzZy5LZXk7IC8vIHNxdWFyZSBjdXJyZW50bHkgYmVpbmcgaG92ZXJlZFxuICB2aWV3T25seTogYm9vbGVhbjsgLy8gZG9uJ3QgYmluZCBldmVudHM6IHRoZSB1c2VyIHdpbGwgbmV2ZXIgYmUgYWJsZSB0byBtb3ZlIHBpZWNlcyBhcm91bmRcbiAgc3F1YXJlUmF0aW86IHNnLk51bWJlclBhaXI7IC8vIHJhdGlvIG9mIHRoZSBib2FyZCBbd2lkdGgsIGhlaWdodF1cbiAgZGlzYWJsZUNvbnRleHRNZW51OiBib29sZWFuOyAvLyBiZWNhdXNlIHdobyBuZWVkcyBhIGNvbnRleHQgbWVudSBvbiBhIHNob2dpIGJvYXJkXG4gIGJsb2NrVG91Y2hTY3JvbGw6IGJvb2xlYW47IC8vIGJsb2NrIHNjcm9sbGluZyB2aWEgdG91Y2ggZHJhZ2dpbmcgb24gdGhlIGJvYXJkLCBlLmcuIGZvciBjb29yZGluYXRlIHRyYWluaW5nXG4gIHNjYWxlRG93blBpZWNlczogYm9vbGVhbjtcbiAgY29vcmRpbmF0ZXM6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBpbmNsdWRlIGNvb3JkcyBhdHRyaWJ1dGVzXG4gICAgZmlsZXM6IHNnLk5vdGF0aW9uO1xuICAgIHJhbmtzOiBzZy5Ob3RhdGlvbjtcbiAgfTtcbiAgaGlnaGxpZ2h0OiB7XG4gICAgbGFzdERlc3RzOiBib29sZWFuOyAvLyBhZGQgbGFzdC1kZXN0IGNsYXNzIHRvIHNxdWFyZXNcbiAgICBjaGVjazogYm9vbGVhbjsgLy8gYWRkIGNoZWNrIGNsYXNzIHRvIHNxdWFyZXNcbiAgICBjaGVja1JvbGVzOiBzZy5Sb2xlU3RyaW5nW107IC8vIHJvbGVzIHRvIGJlIGhpZ2hsaWdodGVkIHdoZW4gY2hlY2sgaXMgYm9vbGVhbiBpcyBwYXNzZWQgZnJvbSBjb25maWdcbiAgICBob3ZlcmVkOiBib29sZWFuOyAvLyBhZGQgaG92ZXIgY2xhc3MgdG8gaG92ZXJlZCBzcXVhcmVzXG4gIH07XG4gIGFuaW1hdGlvbjoge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47XG4gICAgaGFuZHM6IGJvb2xlYW47XG4gICAgZHVyYXRpb246IG51bWJlcjtcbiAgICBjdXJyZW50PzogQW5pbUN1cnJlbnQ7XG4gIH07XG4gIGhhbmRzOiB7XG4gICAgaW5saW5lZDogYm9vbGVhbjsgLy8gYXR0YWNoZXMgc2ctaGFuZHMgZGlyZWN0bHkgdG8gc2ctd3JhcCwgaWdub3JlcyBIVE1MRWxlbWVudHMgcGFzc2VkIHRvIFNob2dpZ3JvdW5kXG4gICAgaGFuZE1hcDogc2cuSGFuZHM7XG4gICAgcm9sZXM6IHNnLlJvbGVTdHJpbmdbXTsgLy8gcm9sZXMgdG8gcmVuZGVyIGluIHNnLWhhbmRcbiAgfTtcbiAgbW92YWJsZToge1xuICAgIGZyZWU6IGJvb2xlYW47IC8vIGFsbCBtb3ZlcyBhcmUgdmFsaWQgLSBib2FyZCBlZGl0b3JcbiAgICBkZXN0cz86IHNnLk1vdmVEZXN0czsgLy8gdmFsaWQgbW92ZXMuIHtcIjdnXCIgW1wiN2ZcIl0gXCI1aVwiIFtcIjRoXCIgXCI1aFwiIFwiNmhcIl19XG4gICAgc2hvd0Rlc3RzOiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgZXZlbnRzOiB7XG4gICAgICBhZnRlcj86IChvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSwgcHJvbTogYm9vbGVhbiwgbWV0YWRhdGE6IHNnLk1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBtb3ZlIGhhcyBiZWVuIHBsYXllZFxuICAgIH07XG4gIH07XG4gIGRyb3BwYWJsZToge1xuICAgIGZyZWU6IGJvb2xlYW47IC8vIGFsbCBkcm9wcyBhcmUgdmFsaWQgLSBib2FyZCBlZGl0b3JcbiAgICBkZXN0cz86IHNnLkRyb3BEZXN0czsgLy8gdmFsaWQgZHJvcHMuIHtcInNlbnRlIHBhd25cIiBbXCIzYVwiIFwiNGFcIl0gXCJzZW50ZSBsYW5jZVwiIFtcIjNhXCIgXCIzY1wiXX1cbiAgICBzaG93RGVzdHM6IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBkZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBzcGFyZTogYm9vbGVhbjsgLy8gd2hldGhlciB0byByZW1vdmUgZHJvcHBlZCBwaWVjZSBmcm9tIGhhbmQgYWZ0ZXIgZHJvcCAtIGJvYXJkIGVkaXRvclxuICAgIGV2ZW50czoge1xuICAgICAgYWZ0ZXI/OiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSwgcHJvbTogYm9vbGVhbiwgbWV0YWRhdGE6IHNnLk1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBkcm9wIGhhcyBiZWVuIHBsYXllZFxuICAgIH07XG4gIH07XG4gIHByZW1vdmFibGU6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBhbGxvdyBwcmVtb3ZlcyBmb3IgY29sb3IgdGhhdCBjYW4gbm90IG1vdmVcbiAgICBzaG93RGVzdHM6IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBwcmUtZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgZGVzdHM/OiBzZy5LZXlbXTsgLy8gcHJlbW92ZSBkZXN0aW5hdGlvbnMgZm9yIHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgIGN1cnJlbnQ/OiB7XG4gICAgICBvcmlnOiBzZy5LZXk7XG4gICAgICBkZXN0OiBzZy5LZXk7XG4gICAgICBwcm9tOiBib29sZWFuO1xuICAgIH07XG4gICAgZ2VuZXJhdGU/OiAoa2V5OiBzZy5LZXksIHBpZWNlczogc2cuUGllY2VzKSA9PiBzZy5LZXlbXTtcbiAgICBldmVudHM6IHtcbiAgICAgIHNldD86IChvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSwgcHJvbTogYm9vbGVhbikgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVtb3ZlIGhhcyBiZWVuIHNldFxuICAgICAgdW5zZXQ/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZW1vdmUgaGFzIGJlZW4gdW5zZXRcbiAgICB9O1xuICB9O1xuICBwcmVkcm9wcGFibGU6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBhbGxvdyBwcmVkcm9wcyBmb3IgY29sb3IgdGhhdCBjYW4gbm90IG1vdmVcbiAgICBzaG93RGVzdHM6IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBwcmUtZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgZGVzdHM/OiBzZy5LZXlbXTsgLy8gcHJlbW92ZSBkZXN0aW5hdGlvbnMgZm9yIHRoZSBkcm9wIHNlbGVjdGlvblxuICAgIGN1cnJlbnQ/OiB7XG4gICAgICBwaWVjZTogc2cuUGllY2U7XG4gICAgICBrZXk6IHNnLktleTtcbiAgICAgIHByb206IGJvb2xlYW47XG4gICAgfTtcbiAgICBnZW5lcmF0ZT86IChwaWVjZTogc2cuUGllY2UsIHBpZWNlczogc2cuUGllY2VzKSA9PiBzZy5LZXlbXTtcbiAgICBldmVudHM6IHtcbiAgICAgIHNldD86IChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tOiBib29sZWFuKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZWRyb3AgaGFzIGJlZW4gc2V0XG4gICAgICB1bnNldD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlZHJvcCBoYXMgYmVlbiB1bnNldFxuICAgIH07XG4gIH07XG4gIGRyYWdnYWJsZToge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGFsbG93IG1vdmVzICYgcHJlbW92ZXMgdG8gdXNlIGRyYWcnbiBkcm9wXG4gICAgZGlzdGFuY2U6IG51bWJlcjsgLy8gbWluaW11bSBkaXN0YW5jZSB0byBpbml0aWF0ZSBhIGRyYWc7IGluIHBpeGVsc1xuICAgIGF1dG9EaXN0YW5jZTogYm9vbGVhbjsgLy8gbGV0cyBzaG9naWdyb3VuZCBzZXQgZGlzdGFuY2UgdG8gemVybyB3aGVuIHVzZXIgZHJhZ3MgcGllY2VzXG4gICAgc2hvd0dob3N0OiBib29sZWFuOyAvLyBzaG93IGdob3N0IG9mIHBpZWNlIGJlaW5nIGRyYWdnZWRcbiAgICBzaG93VG91Y2hTcXVhcmVPdmVybGF5OiBib29sZWFuOyAvLyBzaG93IHNxdWFyZSBvdmVybGF5IG9uIHRoZSBzcXVhcmUgdGhhdCBpcyBjdXJyZW50bHkgYmVpbmcgaG92ZXJlZCwgdG91Y2ggb25seVxuICAgIGRlbGV0ZU9uRHJvcE9mZjogYm9vbGVhbjsgLy8gZGVsZXRlIGEgcGllY2Ugd2hlbiBpdCBpcyBkcm9wcGVkIG9mZiB0aGUgYm9hcmQgLSBib2FyZCBlZGl0b3JcbiAgICBhZGRUb0hhbmRPbkRyb3BPZmY6IGJvb2xlYW47IC8vIGFkZCBhIHBpZWNlIHRvIGhhbmQgd2hlbiBpdCBpcyBkcm9wcGVkIG9uIGl0LCByZXF1aXJlcyBkZWxldGVPbkRyb3BPZmYgLSBib2FyZCBlZGl0b3JcbiAgICBjdXJyZW50PzogRHJhZ0N1cnJlbnQ7XG4gIH07XG4gIHNlbGVjdGFibGU6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBkaXNhYmxlIHRvIGVuZm9yY2UgZHJhZ2dpbmcgb3ZlciBjbGljay1jbGljayBtb3ZlXG4gICAgZm9yY2VTcGFyZXM6IGJvb2xlYW47IC8vIGFsbG93IGRyb3BwaW5nIHNwYXJlIHBpZWNlcyBldmVuIHdpdGggc2VsZWN0YWJsZSBkaXNhYmxlZFxuICAgIGRlbGV0ZU9uVG91Y2g6IGJvb2xlYW47IC8vIHNlbGVjdGluZyBhIHBpZWNlIG9uIHRoZSBib2FyZCBvciBpbiBoYW5kIHdpbGwgcmVtb3ZlIGl0IC0gYm9hcmQgZWRpdG9yXG4gICAgYWRkU3BhcmVzVG9IYW5kOiBib29sZWFuOyAvLyBhZGQgc2VsZWN0ZWQgc3BhcmUgcGllY2UgdG8gaGFuZCAtIGJvYXJkIGVkaXRvclxuICB9O1xuICBwcm9tb3Rpb246IHtcbiAgICBwcm9tb3Rlc1RvOiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICB1bnByb21vdGVzVG86IChyb2xlOiBzZy5Sb2xlU3RyaW5nKSA9PiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIG1vdmVQcm9tb3Rpb25EaWFsb2c6IChvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSkgPT4gYm9vbGVhbjtcbiAgICBmb3JjZU1vdmVQcm9tb3Rpb246IChvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSkgPT4gYm9vbGVhbjtcbiAgICBkcm9wUHJvbW90aW9uRGlhbG9nOiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSkgPT4gYm9vbGVhbjtcbiAgICBmb3JjZURyb3BQcm9tb3Rpb246IChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5KSA9PiBib29sZWFuO1xuICAgIGN1cnJlbnQ/OiB7XG4gICAgICBwaWVjZTogc2cuUGllY2U7XG4gICAgICBwcm9tb3RlZFBpZWNlOiBzZy5QaWVjZTtcbiAgICAgIGtleTogc2cuS2V5O1xuICAgICAgZHJhZ2dlZDogYm9vbGVhbjsgLy8gbm8gYW5pbWF0aW9ucyB3aXRoIGRyYWdcbiAgICB9O1xuICAgIGV2ZW50czoge1xuICAgICAgaW5pdGlhdGVkPzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gcHJvbW90aW9uIGRpYWxvZyBpcyBzdGFydGVkXG4gICAgICBhZnRlcj86IChwaWVjZTogc2cuUGllY2UpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB1c2VyIHNlbGVjdHMgYSBwaWVjZVxuICAgICAgY2FuY2VsPzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHVzZXIgY2FuY2VscyB0aGUgc2VsZWN0aW9uXG4gICAgfTtcbiAgICBwcmV2UHJvbW90aW9uSGFzaDogc3RyaW5nO1xuICB9O1xuICBmb3JzeXRoOiB7XG4gICAgdG9Gb3JzeXRoPzogKHJvbGU6IHNnLlJvbGVTdHJpbmcpID0+IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBmcm9tRm9yc3l0aD86IChzdHI6IHN0cmluZykgPT4gc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZDtcbiAgfTtcbiAgZXZlbnRzOiB7XG4gICAgY2hhbmdlPzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBzaXR1YXRpb24gY2hhbmdlcyBvbiB0aGUgYm9hcmRcbiAgICBtb3ZlPzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tOiBib29sZWFuLCBjYXB0dXJlZFBpZWNlPzogc2cuUGllY2UpID0+IHZvaWQ7XG4gICAgZHJvcD86IChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tOiBib29sZWFuKSA9PiB2b2lkO1xuICAgIHNlbGVjdD86IChrZXk6IHNnLktleSkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gYSBzcXVhcmUgaXMgc2VsZWN0ZWRcbiAgICB1bnNlbGVjdD86IChrZXk6IHNnLktleSkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gYSBzZWxlY3RlZCBzcXVhcmUgaXMgZGlyZWN0bHkgdW5zZWxlY3RlZCAtIGRyb3BwZWQgYmFjayBvciBjbGlja2VkIG9uIHRoZSBvcmlnaW5hbCBzcXVhcmVcbiAgICBwaWVjZVNlbGVjdD86IChwaWVjZTogc2cuUGllY2UpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIGEgcGllY2UgaW4gaGFuZCBpcyBzZWxlY3RlZFxuICAgIHBpZWNlVW5zZWxlY3Q/OiAocGllY2U6IHNnLlBpZWNlKSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBhIHNlbGVjdGVkIHBpZWNlIGlzIGRpcmVjdGx5IHVuc2VsZWN0ZWQgLSBkcm9wcGVkIGJhY2sgb3IgY2xpY2tlZCBvbiB0aGUgc2FtZSBwaWVjZVxuICAgIGluc2VydD86IChib2FyZEVsZW1lbnRzPzogc2cuQm9hcmRFbGVtZW50cywgaGFuZEVsZW1lbnRzPzogc2cuSGFuZEVsZW1lbnRzKSA9PiB2b2lkOyAvLyB3aGVuIHRoZSBib2FyZCBvciBoYW5kcyBET00gaGFzIGJlZW4gKHJlKWluc2VydGVkXG4gIH07XG4gIGRyYXdhYmxlOiBEcmF3YWJsZTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgU3RhdGUgZXh0ZW5kcyBIZWFkbGVzc1N0YXRlIHtcbiAgZG9tOiBzZy5Eb207XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWZhdWx0cygpOiBIZWFkbGVzc1N0YXRlIHtcbiAgcmV0dXJuIHtcbiAgICBwaWVjZXM6IG5ldyBNYXAoKSxcbiAgICBkaW1lbnNpb25zOiB7IGZpbGVzOiA5LCByYW5rczogOSB9LFxuICAgIG9yaWVudGF0aW9uOiAnc2VudGUnLFxuICAgIHR1cm5Db2xvcjogJ3NlbnRlJyxcbiAgICBhY3RpdmVDb2xvcjogJ2JvdGgnLFxuICAgIHZpZXdPbmx5OiBmYWxzZSxcbiAgICBzcXVhcmVSYXRpbzogWzExLCAxMl0sXG4gICAgZGlzYWJsZUNvbnRleHRNZW51OiB0cnVlLFxuICAgIGJsb2NrVG91Y2hTY3JvbGw6IGZhbHNlLFxuICAgIHNjYWxlRG93blBpZWNlczogdHJ1ZSxcbiAgICBjb29yZGluYXRlczoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGZpbGVzOiAnbnVtZXJpYycsXG4gICAgICByYW5rczogJ251bWVyaWMnLFxuICAgIH0sXG4gICAgaGlnaGxpZ2h0OiB7XG4gICAgICBsYXN0RGVzdHM6IHRydWUsXG4gICAgICBjaGVjazogdHJ1ZSxcbiAgICAgIGNoZWNrUm9sZXM6IFsna2luZyddLFxuICAgICAgaG92ZXJlZDogZmFsc2UsXG4gICAgfSxcbiAgICBhbmltYXRpb246IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBoYW5kczogdHJ1ZSxcbiAgICAgIGR1cmF0aW9uOiAyNTAsXG4gICAgfSxcbiAgICBoYW5kczoge1xuICAgICAgaW5saW5lZDogZmFsc2UsXG4gICAgICBoYW5kTWFwOiBuZXcgTWFwPHNnLkNvbG9yLCBzZy5IYW5kPihbXG4gICAgICAgIFsnc2VudGUnLCBuZXcgTWFwKCldLFxuICAgICAgICBbJ2dvdGUnLCBuZXcgTWFwKCldLFxuICAgICAgXSksXG4gICAgICByb2xlczogWydyb29rJywgJ2Jpc2hvcCcsICdnb2xkJywgJ3NpbHZlcicsICdrbmlnaHQnLCAnbGFuY2UnLCAncGF3biddLFxuICAgIH0sXG4gICAgbW92YWJsZToge1xuICAgICAgZnJlZTogdHJ1ZSxcbiAgICAgIHNob3dEZXN0czogdHJ1ZSxcbiAgICAgIGV2ZW50czoge30sXG4gICAgfSxcbiAgICBkcm9wcGFibGU6IHtcbiAgICAgIGZyZWU6IHRydWUsXG4gICAgICBzaG93RGVzdHM6IHRydWUsXG4gICAgICBzcGFyZTogZmFsc2UsXG4gICAgICBldmVudHM6IHt9LFxuICAgIH0sXG4gICAgcHJlbW92YWJsZToge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIHNob3dEZXN0czogdHJ1ZSxcbiAgICAgIGV2ZW50czoge30sXG4gICAgfSxcbiAgICBwcmVkcm9wcGFibGU6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBzaG93RGVzdHM6IHRydWUsXG4gICAgICBldmVudHM6IHt9LFxuICAgIH0sXG4gICAgZHJhZ2dhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgZGlzdGFuY2U6IDMsXG4gICAgICBhdXRvRGlzdGFuY2U6IHRydWUsXG4gICAgICBzaG93R2hvc3Q6IHRydWUsXG4gICAgICBzaG93VG91Y2hTcXVhcmVPdmVybGF5OiB0cnVlLFxuICAgICAgZGVsZXRlT25Ecm9wT2ZmOiBmYWxzZSxcbiAgICAgIGFkZFRvSGFuZE9uRHJvcE9mZjogZmFsc2UsXG4gICAgfSxcbiAgICBzZWxlY3RhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgZm9yY2VTcGFyZXM6IGZhbHNlLFxuICAgICAgZGVsZXRlT25Ub3VjaDogZmFsc2UsXG4gICAgICBhZGRTcGFyZXNUb0hhbmQ6IGZhbHNlLFxuICAgIH0sXG4gICAgcHJvbW90aW9uOiB7XG4gICAgICBtb3ZlUHJvbW90aW9uRGlhbG9nOiAoKSA9PiBmYWxzZSxcbiAgICAgIGZvcmNlTW92ZVByb21vdGlvbjogKCkgPT4gZmFsc2UsXG4gICAgICBkcm9wUHJvbW90aW9uRGlhbG9nOiAoKSA9PiBmYWxzZSxcbiAgICAgIGZvcmNlRHJvcFByb21vdGlvbjogKCkgPT4gZmFsc2UsXG4gICAgICBwcm9tb3Rlc1RvOiAoKSA9PiB1bmRlZmluZWQsXG4gICAgICB1bnByb21vdGVzVG86ICgpID0+IHVuZGVmaW5lZCxcbiAgICAgIGV2ZW50czoge30sXG4gICAgICBwcmV2UHJvbW90aW9uSGFzaDogJycsXG4gICAgfSxcbiAgICBmb3JzeXRoOiB7fSxcbiAgICBldmVudHM6IHt9LFxuICAgIGRyYXdhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLCAvLyBjYW4gZHJhd1xuICAgICAgdmlzaWJsZTogdHJ1ZSwgLy8gY2FuIHZpZXdcbiAgICAgIGZvcmNlZDogZmFsc2UsIC8vIGNhbiBvbmx5IGRyYXdcbiAgICAgIGVyYXNlT25DbGljazogdHJ1ZSxcbiAgICAgIHNoYXBlczogW10sXG4gICAgICBhdXRvU2hhcGVzOiBbXSxcbiAgICAgIHNxdWFyZXM6IFtdLFxuICAgICAgcHJldlN2Z0hhc2g6ICcnLFxuICAgIH0sXG4gIH07XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHsgcmVuZGVyIH0gZnJvbSAnLi9yZW5kZXIuanMnO1xuaW1wb3J0IHsgcmVuZGVySGFuZCB9IGZyb20gJy4vaGFuZHMuanMnO1xuaW1wb3J0IHsgcmVuZGVyU2hhcGVzIH0gZnJvbSAnLi9zaGFwZXMuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVkcmF3U2hhcGVzTm93KHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBpZiAoc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkPy5zaGFwZXMpXG4gICAgcmVuZGVyU2hhcGVzKFxuICAgICAgc3RhdGUsXG4gICAgICBzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQuc2hhcGVzLnN2ZyxcbiAgICAgIHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZC5zaGFwZXMuY3VzdG9tU3ZnLFxuICAgICAgc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkLnNoYXBlcy5mcmVlUGllY2VzXG4gICAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZHJhd05vdyhzdGF0ZTogU3RhdGUsIHNraXBTaGFwZXM/OiBib29sZWFuKTogdm9pZCB7XG4gIGNvbnN0IGJvYXJkRWxzID0gc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkO1xuICBpZiAoYm9hcmRFbHMpIHtcbiAgICByZW5kZXIoc3RhdGUsIGJvYXJkRWxzKTtcbiAgICBpZiAoIXNraXBTaGFwZXMpIHJlZHJhd1NoYXBlc05vdyhzdGF0ZSk7XG4gIH1cblxuICBjb25zdCBoYW5kRWxzID0gc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzO1xuICBpZiAoaGFuZEVscykge1xuICAgIGlmIChoYW5kRWxzLnRvcCkgcmVuZGVySGFuZChzdGF0ZSwgaGFuZEVscy50b3ApO1xuICAgIGlmIChoYW5kRWxzLmJvdHRvbSkgcmVuZGVySGFuZChzdGF0ZSwgaGFuZEVscy5ib3R0b20pO1xuICB9XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBET01SZWN0TWFwLCBQaWVjZU5hbWUsIFBpZWNlTm9kZSwgV3JhcEVsZW1lbnRzIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgdHlwZSB7IEFwaSB9IGZyb20gJy4vYXBpLmpzJztcbmltcG9ydCB0eXBlIHsgQ29uZmlnIH0gZnJvbSAnLi9jb25maWcuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHsgc3RhcnQgfSBmcm9tICcuL2FwaS5qcyc7XG5pbXBvcnQgeyBjb25maWd1cmUgfSBmcm9tICcuL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBkZWZhdWx0cyB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwuanMnO1xuaW1wb3J0IHsgcmVkcmF3QWxsIH0gZnJvbSAnLi9kb20uanMnO1xuaW1wb3J0IHsgYmluZERvY3VtZW50IH0gZnJvbSAnLi9ldmVudHMuanMnO1xuaW1wb3J0IHsgcmVkcmF3Tm93LCByZWRyYXdTaGFwZXNOb3cgfSBmcm9tICcuL3JlZHJhdy5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBTaG9naWdyb3VuZChjb25maWc/OiBDb25maWcsIHdyYXBFbGVtZW50cz86IFdyYXBFbGVtZW50cyk6IEFwaSB7XG4gIGNvbnN0IHN0YXRlID0gZGVmYXVsdHMoKSBhcyBTdGF0ZTtcbiAgY29uZmlndXJlKHN0YXRlLCBjb25maWcgfHwge30pO1xuXG4gIGNvbnN0IHJlZHJhd1N0YXRlTm93ID0gKHNraXBTaGFwZXM/OiBib29sZWFuKSA9PiB7XG4gICAgcmVkcmF3Tm93KHN0YXRlLCBza2lwU2hhcGVzKTtcbiAgfTtcblxuICBzdGF0ZS5kb20gPSB7XG4gICAgd3JhcEVsZW1lbnRzOiB3cmFwRWxlbWVudHMgfHwge30sXG4gICAgZWxlbWVudHM6IHt9LFxuICAgIGJvdW5kczoge1xuICAgICAgYm9hcmQ6IHtcbiAgICAgICAgYm91bmRzOiB1dGlsLm1lbW8oKCkgPT4gc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkPy5waWVjZXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpLFxuICAgICAgfSxcbiAgICAgIGhhbmRzOiB7XG4gICAgICAgIGJvdW5kczogdXRpbC5tZW1vKCgpID0+IHtcbiAgICAgICAgICBjb25zdCBoYW5kc1JlY3RzOiBET01SZWN0TWFwPCd0b3AnIHwgJ2JvdHRvbSc+ID0gbmV3IE1hcCgpLFxuICAgICAgICAgICAgaGFuZEVscyA9IHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcztcbiAgICAgICAgICBpZiAoaGFuZEVscz8udG9wKSBoYW5kc1JlY3RzLnNldCgndG9wJywgaGFuZEVscy50b3AuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpO1xuICAgICAgICAgIGlmIChoYW5kRWxzPy5ib3R0b20pIGhhbmRzUmVjdHMuc2V0KCdib3R0b20nLCBoYW5kRWxzLmJvdHRvbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSk7XG4gICAgICAgICAgcmV0dXJuIGhhbmRzUmVjdHM7XG4gICAgICAgIH0pLFxuICAgICAgICBwaWVjZUJvdW5kczogdXRpbC5tZW1vKCgpID0+IHtcbiAgICAgICAgICBjb25zdCBoYW5kUGllY2VzUmVjdHM6IERPTVJlY3RNYXA8UGllY2VOYW1lPiA9IG5ldyBNYXAoKSxcbiAgICAgICAgICAgIGhhbmRFbHMgPSBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHM7XG5cbiAgICAgICAgICBpZiAoaGFuZEVscz8udG9wKSB7XG4gICAgICAgICAgICBsZXQgd3JhcEVsID0gaGFuZEVscy50b3AuZmlyc3RFbGVtZW50Q2hpbGQgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICB3aGlsZSAod3JhcEVsKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHBpZWNlRWwgPSB3cmFwRWwuZmlyc3RFbGVtZW50Q2hpbGQgYXMgUGllY2VOb2RlLFxuICAgICAgICAgICAgICAgIHBpZWNlID0geyByb2xlOiBwaWVjZUVsLnNnUm9sZSwgY29sb3I6IHBpZWNlRWwuc2dDb2xvciB9O1xuICAgICAgICAgICAgICBoYW5kUGllY2VzUmVjdHMuc2V0KHV0aWwucGllY2VOYW1lT2YocGllY2UpLCBwaWVjZUVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKTtcbiAgICAgICAgICAgICAgd3JhcEVsID0gd3JhcEVsLm5leHRFbGVtZW50U2libGluZyBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGhhbmRFbHM/LmJvdHRvbSkge1xuICAgICAgICAgICAgbGV0IHdyYXBFbCA9IGhhbmRFbHMuYm90dG9tLmZpcnN0RWxlbWVudENoaWxkIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgd2hpbGUgKHdyYXBFbCkge1xuICAgICAgICAgICAgICBjb25zdCBwaWVjZUVsID0gd3JhcEVsLmZpcnN0RWxlbWVudENoaWxkIGFzIFBpZWNlTm9kZSxcbiAgICAgICAgICAgICAgICBwaWVjZSA9IHsgcm9sZTogcGllY2VFbC5zZ1JvbGUsIGNvbG9yOiBwaWVjZUVsLnNnQ29sb3IgfTtcbiAgICAgICAgICAgICAgaGFuZFBpZWNlc1JlY3RzLnNldCh1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKSwgcGllY2VFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSk7XG4gICAgICAgICAgICAgIHdyYXBFbCA9IHdyYXBFbC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBoYW5kUGllY2VzUmVjdHM7XG4gICAgICAgIH0pLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHJlZHJhd05vdzogcmVkcmF3U3RhdGVOb3csXG4gICAgcmVkcmF3OiBkZWJvdW5jZVJlZHJhdyhyZWRyYXdTdGF0ZU5vdyksXG4gICAgcmVkcmF3U2hhcGVzOiBkZWJvdW5jZVJlZHJhdygoKSA9PiByZWRyYXdTaGFwZXNOb3coc3RhdGUpKSxcbiAgICB1bmJpbmQ6IGJpbmREb2N1bWVudChzdGF0ZSksXG4gICAgZGVzdHJveWVkOiBmYWxzZSxcbiAgfTtcblxuICBpZiAod3JhcEVsZW1lbnRzKSByZWRyYXdBbGwod3JhcEVsZW1lbnRzLCBzdGF0ZSk7XG5cbiAgcmV0dXJuIHN0YXJ0KHN0YXRlKTtcbn1cblxuZnVuY3Rpb24gZGVib3VuY2VSZWRyYXcoZjogKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkKTogKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkIHtcbiAgbGV0IHJlZHJhd2luZyA9IGZhbHNlO1xuICByZXR1cm4gKC4uLmFyZ3M6IGFueVtdKSA9PiB7XG4gICAgaWYgKHJlZHJhd2luZykgcmV0dXJuO1xuICAgIHJlZHJhd2luZyA9IHRydWU7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIGYoLi4uYXJncyk7XG4gICAgICByZWRyYXdpbmcgPSBmYWxzZTtcbiAgICB9KTtcbiAgfTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNFTyxNQUFNLFNBQVMsQ0FBQyxTQUFTLE1BQU07QUFFL0IsTUFBTSxRQUFRO0FBQUEsSUFDbkI7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FB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QUFzQixDQUFDO0FBQzVFLHlCQUFTLE9BQU87QUFBQSxjQUNsQjtBQUFBLFlBQ0Y7QUFDQSxtQkFBTztBQUFBLFVBQ1QsQ0FBQztBQUFBLFFBQ0g7QUFBQSxNQUNGO0FBQUEsTUFDQSxXQUFXO0FBQUEsTUFDWCxRQUFRLGVBQWUsY0FBYztBQUFBLE1BQ3JDLGNBQWMsZUFBZSxNQUFNLGdCQUFnQixLQUFLLENBQUM7QUFBQSxNQUN6RCxRQUFRLGFBQWEsS0FBSztBQUFBLE1BQzFCLFdBQVc7QUFBQSxJQUNiO0FBRUEsUUFBSSxhQUFjLFdBQVUsY0FBYyxLQUFLO0FBRS9DLFdBQU9DLE9BQU0sS0FBSztBQUFBLEVBQ3BCO0FBRUEsV0FBUyxlQUFlLEdBQXVEO0FBQzdFLFFBQUksWUFBWTtBQUNoQixXQUFPLElBQUksU0FBZ0I7QUFDekIsVUFBSSxVQUFXO0FBQ2Ysa0JBQVk7QUFDWiw0QkFBc0IsTUFBTTtBQUMxQixVQUFFLEdBQUcsSUFBSTtBQUNULG9CQUFZO0FBQUEsTUFDZCxDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0Y7OztBbkJqRkEsTUFBTyxjQUFROyIsCiAgIm5hbWVzIjogWyJtb3ZlIiwgInJhbmtzIiwgIm5vdyIsICJicnVzaGVzIiwgImVsIiwgImRlc3QiLCAic3RhcnQiLCAiY2FuY2VsIiwgIm1vdmUiLCAiZW5kIiwgInVuc2VsZWN0IiwgInJhbmtzIiwgImZpbGVzIiwgInJlbmRlckhhbmQiLCAibW92ZSIsICJlbmQiLCAiY2FuY2VsIiwgInN0YXJ0IiwgInMiLCAicmVuZGVyIiwgImFuaW0iLCAiayIsICJyZW5kZXIiLCAic3RhcnQiLCAic3RhdGUiLCAiY2FuY2VsIiwgInJlbmRlciIsICJzdGFydCJdCn0K
