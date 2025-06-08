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
    const origPiece = state.pieces.get(orig), destPiece = state.pieces.get(dest);
    if (orig === dest || !origPiece) return false;
    const captured = destPiece && destPiece.color !== origPiece.color ? destPiece : void 0, promPiece = prom && promotePiece(state, origPiece);
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
      else if (cur.fromOutside && !cur.spare) removeFromHand(s, cur.piece);
      if (s.draggable.addToHandOnDropOff) {
        const handBounds = s.dom.bounds.hands.bounds(), handBoundsTop = handBounds.get("top"), handBoundsBottom = handBounds.get("bottom");
        if (handBoundsTop && isInsideRect(handBoundsTop, cur.pos))
          addToHand(s, { color: opposite(s.orientation), role: cur.piece.role });
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
    const asSente = sentePov(s.orientation), curIndex = s.hovered && domSquareIndexOfKey(s.hovered, asSente, s.dimensions), curHoverEl = curIndex !== void 0 && sqaureEls[curIndex];
    if (curHoverEl) curHoverEl.classList.add("hover");
    const prevIndex = prevHover && domSquareIndexOfKey(prevHover, asSente, s.dimensions), prevHoverEl = prevIndex !== void 0 && sqaureEls[prevIndex];
    if (prevHoverEl) prevHoverEl.classList.remove("hover");
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
  var index_default = Shogiground;
  return __toCommonJS(index_exports);
})();
Shogiground = Shogiground.default;
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2luZGV4LnRzIiwgIi4uL3NyYy9jb25zdGFudHMudHMiLCAiLi4vc3JjL3V0aWwudHMiLCAiLi4vc3JjL2hhbmRzLnRzIiwgIi4uL3NyYy9ib2FyZC50cyIsICIuLi9zcmMvc2Zlbi50cyIsICIuLi9zcmMvY29uZmlnLnRzIiwgIi4uL3NyYy9hbmltLnRzIiwgIi4uL3NyYy9zaGFwZXMudHMiLCAiLi4vc3JjL2RyYXcudHMiLCAiLi4vc3JjL2RyYWcudHMiLCAiLi4vc3JjL2Nvb3Jkcy50cyIsICIuLi9zcmMvd3JhcC50cyIsICIuLi9zcmMvZXZlbnRzLnRzIiwgIi4uL3NyYy9yZW5kZXIudHMiLCAiLi4vc3JjL2RvbS50cyIsICIuLi9zcmMvYXBpLnRzIiwgIi4uL3NyYy9zdGF0ZS50cyIsICIuLi9zcmMvcmVkcmF3LnRzIiwgIi4uL3NyYy9zaG9naWdyb3VuZC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgU2hvZ2lncm91bmQgfSBmcm9tICcuL3Nob2dpZ3JvdW5kLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgU2hvZ2lncm91bmQ7XG4iLCAiaW1wb3J0IHR5cGUgeyBLZXkgfSBmcm9tICcuL3R5cGVzLmpzJztcblxuZXhwb3J0IGNvbnN0IGNvbG9ycyA9IFsnc2VudGUnLCAnZ290ZSddIGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgZmlsZXMgPSBbXG4gICcxJyxcbiAgJzInLFxuICAnMycsXG4gICc0JyxcbiAgJzUnLFxuICAnNicsXG4gICc3JyxcbiAgJzgnLFxuICAnOScsXG4gICcxMCcsXG4gICcxMScsXG4gICcxMicsXG4gICcxMycsXG4gICcxNCcsXG4gICcxNScsXG4gICcxNicsXG5dIGFzIGNvbnN0O1xuZXhwb3J0IGNvbnN0IHJhbmtzID0gW1xuICAnYScsXG4gICdiJyxcbiAgJ2MnLFxuICAnZCcsXG4gICdlJyxcbiAgJ2YnLFxuICAnZycsXG4gICdoJyxcbiAgJ2knLFxuICAnaicsXG4gICdrJyxcbiAgJ2wnLFxuICAnbScsXG4gICduJyxcbiAgJ28nLFxuICAncCcsXG5dIGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgYWxsS2V5czogcmVhZG9ubHkgS2V5W10gPSBBcnJheS5wcm90b3R5cGUuY29uY2F0KFxuICAuLi5yYW5rcy5tYXAoKHIpID0+IGZpbGVzLm1hcCgoZikgPT4gZiArIHIpKSxcbik7XG5cbmV4cG9ydCBjb25zdCBub3RhdGlvbnMgPSBbJ251bWVyaWMnLCAnamFwYW5lc2UnLCAnZW5naW5lJywgJ2hleCcsICdkaXpoaSddIGFzIGNvbnN0O1xuIiwgImltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyBhbGxLZXlzLCBjb2xvcnMgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5cbmV4cG9ydCBjb25zdCBwb3Mya2V5ID0gKHBvczogc2cuUG9zKTogc2cuS2V5ID0+IGFsbEtleXNbcG9zWzBdICsgMTYgKiBwb3NbMV1dO1xuXG5leHBvcnQgY29uc3Qga2V5MnBvcyA9IChrOiBzZy5LZXkpOiBzZy5Qb3MgPT4ge1xuICBpZiAoay5sZW5ndGggPiAyKSByZXR1cm4gW2suY2hhckNvZGVBdCgxKSAtIDM5LCBrLmNoYXJDb2RlQXQoMikgLSA5N107XG4gIGVsc2UgcmV0dXJuIFtrLmNoYXJDb2RlQXQoMCkgLSA0OSwgay5jaGFyQ29kZUF0KDEpIC0gOTddO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIG1lbW88QT4oZjogKCkgPT4gQSk6IHNnLk1lbW88QT4ge1xuICBsZXQgdjogQSB8IHVuZGVmaW5lZDtcbiAgY29uc3QgcmV0ID0gKCk6IEEgPT4ge1xuICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHYgPSBmKCk7XG4gICAgcmV0dXJuIHY7XG4gIH07XG4gIHJldC5jbGVhciA9ICgpID0+IHtcbiAgICB2ID0gdW5kZWZpbmVkO1xuICB9O1xuICByZXR1cm4gcmV0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FsbFVzZXJGdW5jdGlvbjxUIGV4dGVuZHMgKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPihcbiAgZjogVCB8IHVuZGVmaW5lZCxcbiAgLi4uYXJnczogUGFyYW1ldGVyczxUPlxuKTogdm9pZCB7XG4gIGlmIChmKSBzZXRUaW1lb3V0KCgpID0+IGYoLi4uYXJncyksIDEpO1xufVxuXG5leHBvcnQgY29uc3Qgb3Bwb3NpdGUgPSAoYzogc2cuQ29sb3IpOiBzZy5Db2xvciA9PiAoYyA9PT0gJ3NlbnRlJyA/ICdnb3RlJyA6ICdzZW50ZScpO1xuXG5leHBvcnQgY29uc3Qgc2VudGVQb3YgPSAobzogc2cuQ29sb3IpOiBib29sZWFuID0+IG8gPT09ICdzZW50ZSc7XG5cbmV4cG9ydCBjb25zdCBkaXN0YW5jZVNxID0gKHBvczE6IHNnLlBvcywgcG9zMjogc2cuUG9zKTogbnVtYmVyID0+IHtcbiAgY29uc3QgZHggPSBwb3MxWzBdIC0gcG9zMlswXSxcbiAgICBkeSA9IHBvczFbMV0gLSBwb3MyWzFdO1xuICByZXR1cm4gZHggKiBkeCArIGR5ICogZHk7XG59O1xuXG5leHBvcnQgY29uc3Qgc2FtZVBpZWNlID0gKHAxOiBzZy5QaWVjZSwgcDI6IHNnLlBpZWNlKTogYm9vbGVhbiA9PlxuICBwMS5yb2xlID09PSBwMi5yb2xlICYmIHAxLmNvbG9yID09PSBwMi5jb2xvcjtcblxuY29uc3QgcG9zVG9UcmFuc2xhdGVCYXNlID0gKFxuICBwb3M6IHNnLlBvcyxcbiAgZGltczogc2cuRGltZW5zaW9ucyxcbiAgYXNTZW50ZTogYm9vbGVhbixcbiAgeEZhY3RvcjogbnVtYmVyLFxuICB5RmFjdG9yOiBudW1iZXIsXG4pOiBzZy5OdW1iZXJQYWlyID0+IFtcbiAgKGFzU2VudGUgPyBkaW1zLmZpbGVzIC0gMSAtIHBvc1swXSA6IHBvc1swXSkgKiB4RmFjdG9yLFxuICAoYXNTZW50ZSA/IHBvc1sxXSA6IGRpbXMucmFua3MgLSAxIC0gcG9zWzFdKSAqIHlGYWN0b3IsXG5dO1xuXG5leHBvcnQgY29uc3QgcG9zVG9UcmFuc2xhdGVBYnMgPSAoXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGJvdW5kczogRE9NUmVjdCxcbik6ICgocG9zOiBzZy5Qb3MsIGFzU2VudGU6IGJvb2xlYW4pID0+IHNnLk51bWJlclBhaXIpID0+IHtcbiAgY29uc3QgeEZhY3RvciA9IGJvdW5kcy53aWR0aCAvIGRpbXMuZmlsZXMsXG4gICAgeUZhY3RvciA9IGJvdW5kcy5oZWlnaHQgLyBkaW1zLnJhbmtzO1xuICByZXR1cm4gKHBvcywgYXNTZW50ZSkgPT4gcG9zVG9UcmFuc2xhdGVCYXNlKHBvcywgZGltcywgYXNTZW50ZSwgeEZhY3RvciwgeUZhY3Rvcik7XG59O1xuXG5leHBvcnQgY29uc3QgcG9zVG9UcmFuc2xhdGVSZWwgPVxuICAoZGltczogc2cuRGltZW5zaW9ucyk6ICgocG9zOiBzZy5Qb3MsIGFzU2VudGU6IGJvb2xlYW4pID0+IHNnLk51bWJlclBhaXIpID0+XG4gIChwb3MsIGFzU2VudGUpID0+XG4gICAgcG9zVG9UcmFuc2xhdGVCYXNlKHBvcywgZGltcywgYXNTZW50ZSwgMTAwLCAxMDApO1xuXG5leHBvcnQgY29uc3QgdHJhbnNsYXRlQWJzID0gKGVsOiBIVE1MRWxlbWVudCwgcG9zOiBzZy5OdW1iZXJQYWlyLCBzY2FsZTogbnVtYmVyKTogdm9pZCA9PiB7XG4gIGVsLnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUoJHtwb3NbMF19cHgsJHtwb3NbMV19cHgpIHNjYWxlKCR7c2NhbGV9YDtcbn07XG5cbmV4cG9ydCBjb25zdCB0cmFuc2xhdGVSZWwgPSAoXG4gIGVsOiBIVE1MRWxlbWVudCxcbiAgcGVyY2VudHM6IHNnLk51bWJlclBhaXIsXG4gIHNjYWxlRmFjdG9yOiBudW1iZXIsXG4gIHNjYWxlPzogbnVtYmVyLFxuKTogdm9pZCA9PiB7XG4gIGVsLnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUoJHtwZXJjZW50c1swXSAqIHNjYWxlRmFjdG9yfSUsJHtwZXJjZW50c1sxXSAqIHNjYWxlRmFjdG9yfSUpIHNjYWxlKCR7XG4gICAgc2NhbGUgfHwgc2NhbGVGYWN0b3JcbiAgfSlgO1xufTtcblxuZXhwb3J0IGNvbnN0IHNldERpc3BsYXkgPSAoZWw6IEhUTUxFbGVtZW50LCB2OiBib29sZWFuKTogdm9pZCA9PiB7XG4gIGVsLnN0eWxlLmRpc3BsYXkgPSB2ID8gJycgOiAnbm9uZSc7XG59O1xuXG5leHBvcnQgY29uc3QgZXZlbnRQb3NpdGlvbiA9IChlOiBzZy5Nb3VjaEV2ZW50KTogc2cuTnVtYmVyUGFpciB8IHVuZGVmaW5lZCA9PiB7XG4gIGlmIChlLmNsaWVudFggfHwgZS5jbGllbnRYID09PSAwKSByZXR1cm4gW2UuY2xpZW50WCwgZS5jbGllbnRZIV07XG4gIGlmIChlLnRhcmdldFRvdWNoZXM/LlswXSkgcmV0dXJuIFtlLnRhcmdldFRvdWNoZXNbMF0uY2xpZW50WCwgZS50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFldO1xuICByZXR1cm47IC8vIHRvdWNoZW5kIGhhcyBubyBwb3NpdGlvbiFcbn07XG5cbmV4cG9ydCBjb25zdCBpc1JpZ2h0QnV0dG9uID0gKGU6IHNnLk1vdWNoRXZlbnQpOiBib29sZWFuID0+IGUuYnV0dG9ucyA9PT0gMiB8fCBlLmJ1dHRvbiA9PT0gMjtcblxuZXhwb3J0IGNvbnN0IGlzTWlkZGxlQnV0dG9uID0gKGU6IHNnLk1vdWNoRXZlbnQpOiBib29sZWFuID0+IGUuYnV0dG9ucyA9PT0gNCB8fCBlLmJ1dHRvbiA9PT0gMTtcblxuZXhwb3J0IGNvbnN0IGNyZWF0ZUVsID0gKHRhZ05hbWU6IHN0cmluZywgY2xhc3NOYW1lPzogc3RyaW5nKTogSFRNTEVsZW1lbnQgPT4ge1xuICBjb25zdCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnTmFtZSk7XG4gIGlmIChjbGFzc05hbWUpIGVsLmNsYXNzTmFtZSA9IGNsYXNzTmFtZTtcbiAgcmV0dXJuIGVsO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHBpZWNlTmFtZU9mKHBpZWNlOiBzZy5QaWVjZSk6IHNnLlBpZWNlTmFtZSB7XG4gIHJldHVybiBgJHtwaWVjZS5jb2xvcn0gJHtwaWVjZS5yb2xlfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVBpZWNlTmFtZShwaWVjZU5hbWU6IHNnLlBpZWNlTmFtZSk6IHNnLlBpZWNlIHtcbiAgY29uc3Qgc3BsaXR0ZWQgPSBwaWVjZU5hbWUuc3BsaXQoJyAnLCAyKTtcbiAgcmV0dXJuIHsgY29sb3I6IHNwbGl0dGVkWzBdIGFzIHNnLkNvbG9yLCByb2xlOiBzcGxpdHRlZFsxXSB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQaWVjZU5vZGUoZWw6IEhUTUxFbGVtZW50KTogZWwgaXMgc2cuUGllY2VOb2RlIHtcbiAgcmV0dXJuIGVsLnRhZ05hbWUgPT09ICdQSUVDRSc7XG59XG5leHBvcnQgZnVuY3Rpb24gaXNTcXVhcmVOb2RlKGVsOiBIVE1MRWxlbWVudCk6IGVsIGlzIHNnLlNxdWFyZU5vZGUge1xuICByZXR1cm4gZWwudGFnTmFtZSA9PT0gJ1NRJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVTcXVhcmVDZW50ZXIoXG4gIGtleTogc2cuS2V5LFxuICBhc1NlbnRlOiBib29sZWFuLFxuICBkaW1zOiBzZy5EaW1lbnNpb25zLFxuICBib3VuZHM6IERPTVJlY3QsXG4pOiBzZy5OdW1iZXJQYWlyIHtcbiAgY29uc3QgcG9zID0ga2V5MnBvcyhrZXkpO1xuICBpZiAoYXNTZW50ZSkge1xuICAgIHBvc1swXSA9IGRpbXMuZmlsZXMgLSAxIC0gcG9zWzBdO1xuICAgIHBvc1sxXSA9IGRpbXMucmFua3MgLSAxIC0gcG9zWzFdO1xuICB9XG4gIHJldHVybiBbXG4gICAgYm91bmRzLmxlZnQgKyAoYm91bmRzLndpZHRoICogcG9zWzBdKSAvIGRpbXMuZmlsZXMgKyBib3VuZHMud2lkdGggLyAoZGltcy5maWxlcyAqIDIpLFxuICAgIGJvdW5kcy50b3AgK1xuICAgICAgKGJvdW5kcy5oZWlnaHQgKiAoZGltcy5yYW5rcyAtIDEgLSBwb3NbMV0pKSAvIGRpbXMucmFua3MgK1xuICAgICAgYm91bmRzLmhlaWdodCAvIChkaW1zLnJhbmtzICogMiksXG4gIF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkb21TcXVhcmVJbmRleE9mS2V5KGtleTogc2cuS2V5LCBhc1NlbnRlOiBib29sZWFuLCBkaW1zOiBzZy5EaW1lbnNpb25zKTogbnVtYmVyIHtcbiAgY29uc3QgcG9zID0ga2V5MnBvcyhrZXkpO1xuICBsZXQgaW5kZXggPSBkaW1zLmZpbGVzIC0gMSAtIHBvc1swXSArIHBvc1sxXSAqIGRpbXMuZmlsZXM7XG4gIGlmICghYXNTZW50ZSkgaW5kZXggPSBkaW1zLmZpbGVzICogZGltcy5yYW5rcyAtIDEgLSBpbmRleDtcblxuICByZXR1cm4gaW5kZXg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0luc2lkZVJlY3QocmVjdDogRE9NUmVjdCwgcG9zOiBzZy5OdW1iZXJQYWlyKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgcmVjdC5sZWZ0IDw9IHBvc1swXSAmJlxuICAgIHJlY3QudG9wIDw9IHBvc1sxXSAmJlxuICAgIHJlY3QubGVmdCArIHJlY3Qud2lkdGggPiBwb3NbMF0gJiZcbiAgICByZWN0LnRvcCArIHJlY3QuaGVpZ2h0ID4gcG9zWzFdXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRLZXlBdERvbVBvcyhcbiAgcG9zOiBzZy5OdW1iZXJQYWlyLFxuICBhc1NlbnRlOiBib29sZWFuLFxuICBkaW1zOiBzZy5EaW1lbnNpb25zLFxuICBib3VuZHM6IERPTVJlY3QsXG4pOiBzZy5LZXkgfCB1bmRlZmluZWQge1xuICBsZXQgZmlsZSA9IE1hdGguZmxvb3IoKGRpbXMuZmlsZXMgKiAocG9zWzBdIC0gYm91bmRzLmxlZnQpKSAvIGJvdW5kcy53aWR0aCk7XG4gIGlmIChhc1NlbnRlKSBmaWxlID0gZGltcy5maWxlcyAtIDEgLSBmaWxlO1xuICBsZXQgcmFuayA9IE1hdGguZmxvb3IoKGRpbXMucmFua3MgKiAocG9zWzFdIC0gYm91bmRzLnRvcCkpIC8gYm91bmRzLmhlaWdodCk7XG4gIGlmICghYXNTZW50ZSkgcmFuayA9IGRpbXMucmFua3MgLSAxIC0gcmFuaztcbiAgcmV0dXJuIGZpbGUgPj0gMCAmJiBmaWxlIDwgZGltcy5maWxlcyAmJiByYW5rID49IDAgJiYgcmFuayA8IGRpbXMucmFua3NcbiAgICA/IHBvczJrZXkoW2ZpbGUsIHJhbmtdKVxuICAgIDogdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGFuZFBpZWNlQXREb21Qb3MoXG4gIHBvczogc2cuTnVtYmVyUGFpcixcbiAgcm9sZXM6IHNnLlJvbGVTdHJpbmdbXSxcbiAgYm91bmRzOiBNYXA8c2cuUGllY2VOYW1lLCBET01SZWN0Pixcbik6IHNnLlBpZWNlIHwgdW5kZWZpbmVkIHtcbiAgZm9yIChjb25zdCBjb2xvciBvZiBjb2xvcnMpIHtcbiAgICBmb3IgKGNvbnN0IHJvbGUgb2Ygcm9sZXMpIHtcbiAgICAgIGNvbnN0IHBpZWNlID0geyBjb2xvciwgcm9sZSB9LFxuICAgICAgICBwaWVjZVJlY3QgPSBib3VuZHMuZ2V0KHBpZWNlTmFtZU9mKHBpZWNlKSk7XG4gICAgICBpZiAocGllY2VSZWN0ICYmIGlzSW5zaWRlUmVjdChwaWVjZVJlY3QsIHBvcykpIHJldHVybiBwaWVjZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcG9zT2ZPdXRzaWRlRWwoXG4gIGxlZnQ6IG51bWJlcixcbiAgdG9wOiBudW1iZXIsXG4gIGFzU2VudGU6IGJvb2xlYW4sXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGJvYXJkQm91bmRzOiBET01SZWN0LFxuKTogc2cuUG9zIHwgdW5kZWZpbmVkIHtcbiAgY29uc3Qgc3FXID0gYm9hcmRCb3VuZHMud2lkdGggLyBkaW1zLmZpbGVzLFxuICAgIHNxSCA9IGJvYXJkQm91bmRzLmhlaWdodCAvIGRpbXMucmFua3M7XG4gIGlmICghc3FXIHx8ICFzcUgpIHJldHVybjtcbiAgbGV0IHhPZmYgPSAobGVmdCAtIGJvYXJkQm91bmRzLmxlZnQpIC8gc3FXO1xuICBpZiAoYXNTZW50ZSkgeE9mZiA9IGRpbXMuZmlsZXMgLSAxIC0geE9mZjtcbiAgbGV0IHlPZmYgPSAodG9wIC0gYm9hcmRCb3VuZHMudG9wKSAvIHNxSDtcbiAgaWYgKCFhc1NlbnRlKSB5T2ZmID0gZGltcy5yYW5rcyAtIDEgLSB5T2ZmO1xuICByZXR1cm4gW3hPZmYsIHlPZmZdO1xufVxuIiwgImltcG9ydCB0eXBlIHsgSGVhZGxlc3NTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IHNhbWVQaWVjZSB9IGZyb20gJy4vdXRpbC5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRUb0hhbmQoczogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBjbnQgPSAxKTogdm9pZCB7XG4gIGNvbnN0IGhhbmQgPSBzLmhhbmRzLmhhbmRNYXAuZ2V0KHBpZWNlLmNvbG9yKSxcbiAgICByb2xlID1cbiAgICAgIChzLmhhbmRzLnJvbGVzLmluY2x1ZGVzKHBpZWNlLnJvbGUpID8gcGllY2Uucm9sZSA6IHMucHJvbW90aW9uLnVucHJvbW90ZXNUbyhwaWVjZS5yb2xlKSkgfHxcbiAgICAgIHBpZWNlLnJvbGU7XG4gIGlmIChoYW5kICYmIHMuaGFuZHMucm9sZXMuaW5jbHVkZXMocm9sZSkpIGhhbmQuc2V0KHJvbGUsIChoYW5kLmdldChyb2xlKSB8fCAwKSArIGNudCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVGcm9tSGFuZChzOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGNudCA9IDEpOiB2b2lkIHtcbiAgY29uc3QgaGFuZCA9IHMuaGFuZHMuaGFuZE1hcC5nZXQocGllY2UuY29sb3IpLFxuICAgIHJvbGUgPVxuICAgICAgKHMuaGFuZHMucm9sZXMuaW5jbHVkZXMocGllY2Uucm9sZSkgPyBwaWVjZS5yb2xlIDogcy5wcm9tb3Rpb24udW5wcm9tb3Rlc1RvKHBpZWNlLnJvbGUpKSB8fFxuICAgICAgcGllY2Uucm9sZSxcbiAgICBudW0gPSBoYW5kPy5nZXQocm9sZSk7XG4gIGlmIChoYW5kICYmIG51bSkgaGFuZC5zZXQocm9sZSwgTWF0aC5tYXgobnVtIC0gY250LCAwKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJIYW5kKHM6IEhlYWRsZXNzU3RhdGUsIGhhbmRFbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgaGFuZEVsLmNsYXNzTGlzdC50b2dnbGUoJ3Byb21vdGlvbicsICEhcy5wcm9tb3Rpb24uY3VycmVudCk7XG4gIGxldCB3cmFwRWwgPSBoYW5kRWwuZmlyc3RFbGVtZW50Q2hpbGQgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIHdoaWxlICh3cmFwRWwpIHtcbiAgICBjb25zdCBwaWVjZUVsID0gd3JhcEVsLmZpcnN0RWxlbWVudENoaWxkIGFzIHNnLlBpZWNlTm9kZSxcbiAgICAgIHBpZWNlID0geyByb2xlOiBwaWVjZUVsLnNnUm9sZSwgY29sb3I6IHBpZWNlRWwuc2dDb2xvciB9LFxuICAgICAgbnVtID0gcy5oYW5kcy5oYW5kTWFwLmdldChwaWVjZS5jb2xvcik/LmdldChwaWVjZS5yb2xlKSB8fCAwLFxuICAgICAgaXNTZWxlY3RlZCA9ICEhcy5zZWxlY3RlZFBpZWNlICYmIHNhbWVQaWVjZShwaWVjZSwgcy5zZWxlY3RlZFBpZWNlKSAmJiAhcy5kcm9wcGFibGUuc3BhcmU7XG5cbiAgICB3cmFwRWwuY2xhc3NMaXN0LnRvZ2dsZShcbiAgICAgICdzZWxlY3RlZCcsXG4gICAgICAocy5hY3RpdmVDb2xvciA9PT0gJ2JvdGgnIHx8IHMuYWN0aXZlQ29sb3IgPT09IHMudHVybkNvbG9yKSAmJiBpc1NlbGVjdGVkLFxuICAgICk7XG4gICAgd3JhcEVsLmNsYXNzTGlzdC50b2dnbGUoXG4gICAgICAncHJlc2VsZWN0ZWQnLFxuICAgICAgcy5hY3RpdmVDb2xvciAhPT0gJ2JvdGgnICYmIHMuYWN0aXZlQ29sb3IgIT09IHMudHVybkNvbG9yICYmIGlzU2VsZWN0ZWQsXG4gICAgKTtcbiAgICB3cmFwRWwuY2xhc3NMaXN0LnRvZ2dsZShcbiAgICAgICdsYXN0LWRlc3QnLFxuICAgICAgcy5oaWdobGlnaHQubGFzdERlc3RzICYmICEhcy5sYXN0UGllY2UgJiYgc2FtZVBpZWNlKHBpZWNlLCBzLmxhc3RQaWVjZSksXG4gICAgKTtcbiAgICB3cmFwRWwuY2xhc3NMaXN0LnRvZ2dsZSgnZHJhd2luZycsICEhcy5kcmF3YWJsZS5waWVjZSAmJiBzYW1lUGllY2Uocy5kcmF3YWJsZS5waWVjZSwgcGllY2UpKTtcbiAgICB3cmFwRWwuY2xhc3NMaXN0LnRvZ2dsZShcbiAgICAgICdjdXJyZW50LXByZScsXG4gICAgICAhIXMucHJlZHJvcHBhYmxlLmN1cnJlbnQgJiYgc2FtZVBpZWNlKHMucHJlZHJvcHBhYmxlLmN1cnJlbnQucGllY2UsIHBpZWNlKSxcbiAgICApO1xuICAgIHdyYXBFbC5kYXRhc2V0Lm5iID0gbnVtLnRvU3RyaW5nKCk7XG4gICAgd3JhcEVsID0gd3JhcEVsLm5leHRFbGVtZW50U2libGluZyBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgfVxufVxuIiwgImltcG9ydCB0eXBlIHsgSGVhZGxlc3NTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IGNhbGxVc2VyRnVuY3Rpb24sIG9wcG9zaXRlLCBwaWVjZU5hbWVPZiwgc2FtZVBpZWNlIH0gZnJvbSAnLi91dGlsLmpzJztcbmltcG9ydCB7IGFkZFRvSGFuZCwgcmVtb3ZlRnJvbUhhbmQgfSBmcm9tICcuL2hhbmRzLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIHRvZ2dsZU9yaWVudGF0aW9uKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIHN0YXRlLm9yaWVudGF0aW9uID0gb3Bwb3NpdGUoc3RhdGUub3JpZW50YXRpb24pO1xuICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9XG4gICAgc3RhdGUuZHJhZ2dhYmxlLmN1cnJlbnQgPVxuICAgIHN0YXRlLnByb21vdGlvbi5jdXJyZW50ID1cbiAgICBzdGF0ZS5ob3ZlcmVkID1cbiAgICBzdGF0ZS5zZWxlY3RlZCA9XG4gICAgc3RhdGUuc2VsZWN0ZWRQaWVjZSA9XG4gICAgICB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldChzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICB1bnNlbGVjdChzdGF0ZSk7XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIGNhbmNlbFByb21vdGlvbihzdGF0ZSk7XG4gIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0gc3RhdGUuZHJhZ2dhYmxlLmN1cnJlbnQgPSBzdGF0ZS5ob3ZlcmVkID0gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0UGllY2VzKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZXM6IHNnLlBpZWNlc0RpZmYpOiB2b2lkIHtcbiAgZm9yIChjb25zdCBba2V5LCBwaWVjZV0gb2YgcGllY2VzKSB7XG4gICAgaWYgKHBpZWNlKSBzdGF0ZS5waWVjZXMuc2V0KGtleSwgcGllY2UpO1xuICAgIGVsc2Ugc3RhdGUucGllY2VzLmRlbGV0ZShrZXkpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRDaGVja3Moc3RhdGU6IEhlYWRsZXNzU3RhdGUsIGNoZWNrc1ZhbHVlOiBzZy5LZXlbXSB8IHNnLkNvbG9yIHwgYm9vbGVhbik6IHZvaWQge1xuICBpZiAoQXJyYXkuaXNBcnJheShjaGVja3NWYWx1ZSkpIHtcbiAgICBzdGF0ZS5jaGVja3MgPSBjaGVja3NWYWx1ZTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoY2hlY2tzVmFsdWUgPT09IHRydWUpIGNoZWNrc1ZhbHVlID0gc3RhdGUudHVybkNvbG9yO1xuICAgIGlmIChjaGVja3NWYWx1ZSkge1xuICAgICAgY29uc3QgY2hlY2tzOiBzZy5LZXlbXSA9IFtdO1xuICAgICAgZm9yIChjb25zdCBbaywgcF0gb2Ygc3RhdGUucGllY2VzKSB7XG4gICAgICAgIGlmIChzdGF0ZS5oaWdobGlnaHQuY2hlY2tSb2xlcy5pbmNsdWRlcyhwLnJvbGUpICYmIHAuY29sb3IgPT09IGNoZWNrc1ZhbHVlKSBjaGVja3MucHVzaChrKTtcbiAgICAgIH1cbiAgICAgIHN0YXRlLmNoZWNrcyA9IGNoZWNrcztcbiAgICB9IGVsc2Ugc3RhdGUuY2hlY2tzID0gdW5kZWZpbmVkO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNldFByZW1vdmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tOiBib29sZWFuKTogdm9pZCB7XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIHN0YXRlLnByZW1vdmFibGUuY3VycmVudCA9IHsgb3JpZywgZGVzdCwgcHJvbSB9O1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByZW1vdmFibGUuZXZlbnRzLnNldCwgb3JpZywgZGVzdCwgcHJvbSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnNldFByZW1vdmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLnByZW1vdmFibGUuY3VycmVudCkge1xuICAgIHN0YXRlLnByZW1vdmFibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByZW1vdmFibGUuZXZlbnRzLnVuc2V0KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzZXRQcmVkcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tOiBib29sZWFuKTogdm9pZCB7XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50ID0geyBwaWVjZSwga2V5LCBwcm9tIH07XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJlZHJvcHBhYmxlLmV2ZW50cy5zZXQsIHBpZWNlLCBrZXksIHByb20pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5zZXRQcmVkcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCkge1xuICAgIHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJlZHJvcHBhYmxlLmV2ZW50cy51bnNldCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2VNb3ZlKFxuICBzdGF0ZTogSGVhZGxlc3NTdGF0ZSxcbiAgb3JpZzogc2cuS2V5LFxuICBkZXN0OiBzZy5LZXksXG4gIHByb206IGJvb2xlYW4sXG4pOiBzZy5QaWVjZSB8IGJvb2xlYW4ge1xuICBjb25zdCBvcmlnUGllY2UgPSBzdGF0ZS5waWVjZXMuZ2V0KG9yaWcpLFxuICAgIGRlc3RQaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQoZGVzdCk7XG4gIGlmIChvcmlnID09PSBkZXN0IHx8ICFvcmlnUGllY2UpIHJldHVybiBmYWxzZTtcbiAgY29uc3QgY2FwdHVyZWQgPSBkZXN0UGllY2UgJiYgZGVzdFBpZWNlLmNvbG9yICE9PSBvcmlnUGllY2UuY29sb3IgPyBkZXN0UGllY2UgOiB1bmRlZmluZWQsXG4gICAgcHJvbVBpZWNlID0gcHJvbSAmJiBwcm9tb3RlUGllY2Uoc3RhdGUsIG9yaWdQaWVjZSk7XG4gIGlmIChkZXN0ID09PSBzdGF0ZS5zZWxlY3RlZCB8fCBvcmlnID09PSBzdGF0ZS5zZWxlY3RlZCkgdW5zZWxlY3Qoc3RhdGUpO1xuICBzdGF0ZS5waWVjZXMuc2V0KGRlc3QsIHByb21QaWVjZSB8fCBvcmlnUGllY2UpO1xuICBzdGF0ZS5waWVjZXMuZGVsZXRlKG9yaWcpO1xuICBzdGF0ZS5sYXN0RGVzdHMgPSBbb3JpZywgZGVzdF07XG4gIHN0YXRlLmxhc3RQaWVjZSA9IHVuZGVmaW5lZDtcbiAgc3RhdGUuY2hlY2tzID0gdW5kZWZpbmVkO1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5tb3ZlLCBvcmlnLCBkZXN0LCBwcm9tLCBjYXB0dXJlZCk7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG4gIHJldHVybiBjYXB0dXJlZCB8fCB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFzZURyb3AoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBwaWVjZTogc2cuUGllY2UsXG4gIGtleTogc2cuS2V5LFxuICBwcm9tOiBib29sZWFuLFxuKTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlQ291bnQgPSBzdGF0ZS5oYW5kcy5oYW5kTWFwLmdldChwaWVjZS5jb2xvcik/LmdldChwaWVjZS5yb2xlKSB8fCAwO1xuICBpZiAoIXBpZWNlQ291bnQgJiYgIXN0YXRlLmRyb3BwYWJsZS5zcGFyZSkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBwcm9tUGllY2UgPSBwcm9tICYmIHByb21vdGVQaWVjZShzdGF0ZSwgcGllY2UpO1xuICBpZiAoXG4gICAga2V5ID09PSBzdGF0ZS5zZWxlY3RlZCB8fFxuICAgICghc3RhdGUuZHJvcHBhYmxlLnNwYXJlICYmXG4gICAgICBwaWVjZUNvdW50ID09PSAxICYmXG4gICAgICBzdGF0ZS5zZWxlY3RlZFBpZWNlICYmXG4gICAgICBzYW1lUGllY2Uoc3RhdGUuc2VsZWN0ZWRQaWVjZSwgcGllY2UpKVxuICApXG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICBzdGF0ZS5waWVjZXMuc2V0KGtleSwgcHJvbVBpZWNlIHx8IHBpZWNlKTtcbiAgc3RhdGUubGFzdERlc3RzID0gW2tleV07XG4gIHN0YXRlLmxhc3RQaWVjZSA9IHBpZWNlO1xuICBzdGF0ZS5jaGVja3MgPSB1bmRlZmluZWQ7XG4gIGlmICghc3RhdGUuZHJvcHBhYmxlLnNwYXJlKSByZW1vdmVGcm9tSGFuZChzdGF0ZSwgcGllY2UpO1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5kcm9wLCBwaWVjZSwga2V5LCBwcm9tKTtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuY2hhbmdlKTtcbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGJhc2VVc2VyTW92ZShcbiAgc3RhdGU6IEhlYWRsZXNzU3RhdGUsXG4gIG9yaWc6IHNnLktleSxcbiAgZGVzdDogc2cuS2V5LFxuICBwcm9tOiBib29sZWFuLFxuKTogc2cuUGllY2UgfCBib29sZWFuIHtcbiAgY29uc3QgcmVzdWx0ID0gYmFzZU1vdmUoc3RhdGUsIG9yaWcsIGRlc3QsIHByb20pO1xuICBpZiAocmVzdWx0KSB7XG4gICAgc3RhdGUubW92YWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kcm9wcGFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUudHVybkNvbG9yID0gb3Bwb3NpdGUoc3RhdGUudHVybkNvbG9yKTtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBiYXNlVXNlckRyb3Aoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb206IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgY29uc3QgcmVzdWx0ID0gYmFzZURyb3Aoc3RhdGUsIHBpZWNlLCBrZXksIHByb20pO1xuICBpZiAocmVzdWx0KSB7XG4gICAgc3RhdGUubW92YWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kcm9wcGFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUudHVybkNvbG9yID0gb3Bwb3NpdGUoc3RhdGUudHVybkNvbG9yKTtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlckRyb3AoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBwaWVjZTogc2cuUGllY2UsXG4gIGtleTogc2cuS2V5LFxuICBwcm9tPzogYm9vbGVhbixcbik6IGJvb2xlYW4ge1xuICBjb25zdCByZWFsUHJvbSA9IHByb20gfHwgc3RhdGUucHJvbW90aW9uLmZvcmNlRHJvcFByb21vdGlvbihwaWVjZSwga2V5KTtcbiAgaWYgKGNhbkRyb3Aoc3RhdGUsIHBpZWNlLCBrZXkpKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYmFzZVVzZXJEcm9wKHN0YXRlLCBwaWVjZSwga2V5LCByZWFsUHJvbSk7XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5kcm9wcGFibGUuZXZlbnRzLmFmdGVyLCBwaWVjZSwga2V5LCByZWFsUHJvbSwgeyBwcmVtYWRlOiBmYWxzZSB9KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSBlbHNlIGlmIChjYW5QcmVkcm9wKHN0YXRlLCBwaWVjZSwga2V5KSkge1xuICAgIHNldFByZWRyb3Aoc3RhdGUsIHBpZWNlLCBrZXksIHJlYWxQcm9tKTtcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgdW5zZWxlY3Qoc3RhdGUpO1xuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VyTW92ZShcbiAgc3RhdGU6IEhlYWRsZXNzU3RhdGUsXG4gIG9yaWc6IHNnLktleSxcbiAgZGVzdDogc2cuS2V5LFxuICBwcm9tPzogYm9vbGVhbixcbik6IGJvb2xlYW4ge1xuICBjb25zdCByZWFsUHJvbSA9IHByb20gfHwgc3RhdGUucHJvbW90aW9uLmZvcmNlTW92ZVByb21vdGlvbihvcmlnLCBkZXN0KTtcbiAgaWYgKGNhbk1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYmFzZVVzZXJNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0LCByZWFsUHJvbSk7XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgICAgY29uc3QgbWV0YWRhdGE6IHNnLk1vdmVNZXRhZGF0YSA9IHsgcHJlbWFkZTogZmFsc2UgfTtcbiAgICAgIGlmIChyZXN1bHQgIT09IHRydWUpIG1ldGFkYXRhLmNhcHR1cmVkID0gcmVzdWx0O1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5tb3ZhYmxlLmV2ZW50cy5hZnRlciwgb3JpZywgZGVzdCwgcmVhbFByb20sIG1ldGFkYXRhKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSBlbHNlIGlmIChjYW5QcmVtb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSkge1xuICAgIHNldFByZW1vdmUoc3RhdGUsIG9yaWcsIGRlc3QsIHJlYWxQcm9tKTtcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgdW5zZWxlY3Qoc3RhdGUpO1xuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYXNlUHJvbW90aW9uRGlhbG9nKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHByb21vdGVkUGllY2UgPSBwcm9tb3RlUGllY2Uoc3RhdGUsIHBpZWNlKTtcbiAgaWYgKHN0YXRlLnZpZXdPbmx5IHx8IHN0YXRlLnByb21vdGlvbi5jdXJyZW50IHx8ICFwcm9tb3RlZFBpZWNlKSByZXR1cm4gZmFsc2U7XG5cbiAgc3RhdGUucHJvbW90aW9uLmN1cnJlbnQgPSB7IHBpZWNlLCBwcm9tb3RlZFBpZWNlLCBrZXksIGRyYWdnZWQ6ICEhc3RhdGUuZHJhZ2dhYmxlLmN1cnJlbnQgfTtcbiAgc3RhdGUuaG92ZXJlZCA9IGtleTtcblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb21vdGlvbkRpYWxvZ0Ryb3Aoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgaWYgKFxuICAgIGNhbkRyb3BQcm9tb3RlKHN0YXRlLCBwaWVjZSwga2V5KSAmJlxuICAgIChjYW5Ecm9wKHN0YXRlLCBwaWVjZSwga2V5KSB8fCBjYW5QcmVkcm9wKHN0YXRlLCBwaWVjZSwga2V5KSlcbiAgKSB7XG4gICAgaWYgKGJhc2VQcm9tb3Rpb25EaWFsb2coc3RhdGUsIHBpZWNlLCBrZXkpKSB7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByb21vdGlvbi5ldmVudHMuaW5pdGlhdGVkKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9tb3Rpb25EaWFsb2dNb3ZlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSk6IGJvb2xlYW4ge1xuICBpZiAoXG4gICAgY2FuTW92ZVByb21vdGUoc3RhdGUsIG9yaWcsIGRlc3QpICYmXG4gICAgKGNhbk1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpIHx8IGNhblByZW1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpKVxuICApIHtcbiAgICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQob3JpZyk7XG4gICAgaWYgKHBpZWNlICYmIGJhc2VQcm9tb3Rpb25EaWFsb2coc3RhdGUsIHBpZWNlLCBkZXN0KSkge1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcm9tb3Rpb24uZXZlbnRzLmluaXRpYXRlZCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBwcm9tb3RlUGllY2UoczogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlKTogc2cuUGllY2UgfCB1bmRlZmluZWQge1xuICBjb25zdCBwcm9tUm9sZSA9IHMucHJvbW90aW9uLnByb21vdGVzVG8ocGllY2Uucm9sZSk7XG4gIHJldHVybiBwcm9tUm9sZSAhPT0gdW5kZWZpbmVkID8geyBjb2xvcjogcGllY2UuY29sb3IsIHJvbGU6IHByb21Sb2xlIH0gOiB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWxldGVQaWVjZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwga2V5OiBzZy5LZXkpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLnBpZWNlcy5kZWxldGUoa2V5KSkgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuY2hhbmdlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdFNxdWFyZShcbiAgc3RhdGU6IEhlYWRsZXNzU3RhdGUsXG4gIGtleTogc2cuS2V5LFxuICBwcm9tPzogYm9vbGVhbixcbiAgZm9yY2U/OiBib29sZWFuLFxuKTogdm9pZCB7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLnNlbGVjdCwga2V5KTtcblxuICAvLyB1bnNlbGVjdCBpZiBzZWxlY3Rpbmcgc2VsZWN0ZWQga2V5LCBrZWVwIHNlbGVjdGVkIGZvciBkcmFnXG4gIGlmICghc3RhdGUuZHJhZ2dhYmxlLmVuYWJsZWQgJiYgc3RhdGUuc2VsZWN0ZWQgPT09IGtleSkge1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLnVuc2VsZWN0LCBrZXkpO1xuICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyB0cnkgbW92aW5nL2Ryb3BwaW5nXG4gIGlmIChcbiAgICBzdGF0ZS5zZWxlY3RhYmxlLmVuYWJsZWQgfHxcbiAgICBmb3JjZSB8fFxuICAgIChzdGF0ZS5zZWxlY3RhYmxlLmZvcmNlU3BhcmVzICYmIHN0YXRlLnNlbGVjdGVkUGllY2UgJiYgc3RhdGUuZHJvcHBhYmxlLnNwYXJlKVxuICApIHtcbiAgICBpZiAoc3RhdGUuc2VsZWN0ZWRQaWVjZSAmJiB1c2VyRHJvcChzdGF0ZSwgc3RhdGUuc2VsZWN0ZWRQaWVjZSwga2V5LCBwcm9tKSkgcmV0dXJuO1xuICAgIGVsc2UgaWYgKHN0YXRlLnNlbGVjdGVkICYmIHVzZXJNb3ZlKHN0YXRlLCBzdGF0ZS5zZWxlY3RlZCwga2V5LCBwcm9tKSkgcmV0dXJuO1xuICB9XG5cbiAgaWYgKFxuICAgIChzdGF0ZS5zZWxlY3RhYmxlLmVuYWJsZWQgfHwgc3RhdGUuZHJhZ2dhYmxlLmVuYWJsZWQgfHwgZm9yY2UpICYmXG4gICAgKGlzTW92YWJsZShzdGF0ZSwga2V5KSB8fCBpc1ByZW1vdmFibGUoc3RhdGUsIGtleSkpXG4gICkge1xuICAgIHNldFNlbGVjdGVkKHN0YXRlLCBrZXkpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RQaWVjZShcbiAgc3RhdGU6IEhlYWRsZXNzU3RhdGUsXG4gIHBpZWNlOiBzZy5QaWVjZSxcbiAgc3BhcmU/OiBib29sZWFuLFxuICBmb3JjZT86IGJvb2xlYW4sXG4gIGFwaT86IGJvb2xlYW4sXG4pOiB2b2lkIHtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMucGllY2VTZWxlY3QsIHBpZWNlKTtcblxuICBpZiAoc3RhdGUuc2VsZWN0YWJsZS5hZGRTcGFyZXNUb0hhbmQgJiYgc3RhdGUuZHJvcHBhYmxlLnNwYXJlICYmIHN0YXRlLnNlbGVjdGVkUGllY2UpIHtcbiAgICBhZGRUb0hhbmQoc3RhdGUsIHsgcm9sZTogc3RhdGUuc2VsZWN0ZWRQaWVjZS5yb2xlLCBjb2xvcjogcGllY2UuY29sb3IgfSk7XG4gICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuY2hhbmdlKTtcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gIH0gZWxzZSBpZiAoXG4gICAgIWFwaSAmJlxuICAgICFzdGF0ZS5kcmFnZ2FibGUuZW5hYmxlZCAmJlxuICAgIHN0YXRlLnNlbGVjdGVkUGllY2UgJiZcbiAgICBzYW1lUGllY2Uoc3RhdGUuc2VsZWN0ZWRQaWVjZSwgcGllY2UpXG4gICkge1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLnBpZWNlVW5zZWxlY3QsIHBpZWNlKTtcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gIH0gZWxzZSBpZiAoXG4gICAgKHN0YXRlLnNlbGVjdGFibGUuZW5hYmxlZCB8fCBzdGF0ZS5kcmFnZ2FibGUuZW5hYmxlZCB8fCBmb3JjZSkgJiZcbiAgICAoaXNEcm9wcGFibGUoc3RhdGUsIHBpZWNlLCAhIXNwYXJlKSB8fCBpc1ByZWRyb3BwYWJsZShzdGF0ZSwgcGllY2UpKVxuICApIHtcbiAgICBzZXRTZWxlY3RlZFBpZWNlKHN0YXRlLCBwaWVjZSk7XG4gICAgc3RhdGUuZHJvcHBhYmxlLnNwYXJlID0gISFzcGFyZTtcbiAgfSBlbHNlIHtcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFNlbGVjdGVkKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBrZXk6IHNnLktleSk6IHZvaWQge1xuICB1bnNlbGVjdChzdGF0ZSk7XG4gIHN0YXRlLnNlbGVjdGVkID0ga2V5O1xuICBzZXRQcmVEZXN0cyhzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRTZWxlY3RlZFBpZWNlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UpOiB2b2lkIHtcbiAgdW5zZWxlY3Qoc3RhdGUpO1xuICBzdGF0ZS5zZWxlY3RlZFBpZWNlID0gcGllY2U7XG4gIHNldFByZURlc3RzKHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFByZURlc3RzKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIHN0YXRlLnByZW1vdmFibGUuZGVzdHMgPSBzdGF0ZS5wcmVkcm9wcGFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG5cbiAgaWYgKHN0YXRlLnNlbGVjdGVkICYmIGlzUHJlbW92YWJsZShzdGF0ZSwgc3RhdGUuc2VsZWN0ZWQpICYmIHN0YXRlLnByZW1vdmFibGUuZ2VuZXJhdGUpXG4gICAgc3RhdGUucHJlbW92YWJsZS5kZXN0cyA9IHN0YXRlLnByZW1vdmFibGUuZ2VuZXJhdGUoc3RhdGUuc2VsZWN0ZWQsIHN0YXRlLnBpZWNlcyk7XG4gIGVsc2UgaWYgKFxuICAgIHN0YXRlLnNlbGVjdGVkUGllY2UgJiZcbiAgICBpc1ByZWRyb3BwYWJsZShzdGF0ZSwgc3RhdGUuc2VsZWN0ZWRQaWVjZSkgJiZcbiAgICBzdGF0ZS5wcmVkcm9wcGFibGUuZ2VuZXJhdGVcbiAgKVxuICAgIHN0YXRlLnByZWRyb3BwYWJsZS5kZXN0cyA9IHN0YXRlLnByZWRyb3BwYWJsZS5nZW5lcmF0ZShzdGF0ZS5zZWxlY3RlZFBpZWNlLCBzdGF0ZS5waWVjZXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5zZWxlY3Qoc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiB2b2lkIHtcbiAgc3RhdGUuc2VsZWN0ZWQgPVxuICAgIHN0YXRlLnNlbGVjdGVkUGllY2UgPVxuICAgIHN0YXRlLnByZW1vdmFibGUuZGVzdHMgPVxuICAgIHN0YXRlLnByZWRyb3BwYWJsZS5kZXN0cyA9XG4gICAgc3RhdGUucHJvbW90aW9uLmN1cnJlbnQgPVxuICAgICAgdW5kZWZpbmVkO1xuICBzdGF0ZS5kcm9wcGFibGUuc3BhcmUgPSBmYWxzZTtcbn1cblxuZnVuY3Rpb24gaXNNb3ZhYmxlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBvcmlnOiBzZy5LZXkpOiBib29sZWFuIHtcbiAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXMuZ2V0KG9yaWcpO1xuICByZXR1cm4gKFxuICAgICEhcGllY2UgJiZcbiAgICAoc3RhdGUuYWN0aXZlQ29sb3IgPT09ICdib3RoJyB8fFxuICAgICAgKHN0YXRlLmFjdGl2ZUNvbG9yID09PSBwaWVjZS5jb2xvciAmJiBzdGF0ZS50dXJuQ29sb3IgPT09IHBpZWNlLmNvbG9yKSlcbiAgKTtcbn1cblxuZnVuY3Rpb24gaXNEcm9wcGFibGUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwgc3BhcmU6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICAoc3BhcmUgfHwgISFzdGF0ZS5oYW5kcy5oYW5kTWFwLmdldChwaWVjZS5jb2xvcik/LmdldChwaWVjZS5yb2xlKSkgJiZcbiAgICAoc3RhdGUuYWN0aXZlQ29sb3IgPT09ICdib3RoJyB8fFxuICAgICAgKHN0YXRlLmFjdGl2ZUNvbG9yID09PSBwaWVjZS5jb2xvciAmJiBzdGF0ZS50dXJuQ29sb3IgPT09IHBpZWNlLmNvbG9yKSlcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbk1vdmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgb3JpZyAhPT0gZGVzdCAmJlxuICAgIGlzTW92YWJsZShzdGF0ZSwgb3JpZykgJiZcbiAgICAoc3RhdGUubW92YWJsZS5mcmVlIHx8ICEhc3RhdGUubW92YWJsZS5kZXN0cz8uZ2V0KG9yaWcpPy5pbmNsdWRlcyhkZXN0KSlcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbkRyb3Aoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwgZGVzdDogc2cuS2V5KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgaXNEcm9wcGFibGUoc3RhdGUsIHBpZWNlLCBzdGF0ZS5kcm9wcGFibGUuc3BhcmUpICYmXG4gICAgKHN0YXRlLmRyb3BwYWJsZS5mcmVlIHx8XG4gICAgICBzdGF0ZS5kcm9wcGFibGUuc3BhcmUgfHxcbiAgICAgICEhc3RhdGUuZHJvcHBhYmxlLmRlc3RzPy5nZXQocGllY2VOYW1lT2YocGllY2UpKT8uaW5jbHVkZXMoZGVzdCkpXG4gICk7XG59XG5cbmZ1bmN0aW9uIGNhbk1vdmVQcm9tb3RlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQob3JpZyk7XG4gIHJldHVybiAhIXBpZWNlICYmIHN0YXRlLnByb21vdGlvbi5tb3ZlUHJvbW90aW9uRGlhbG9nKG9yaWcsIGRlc3QpO1xufVxuXG5mdW5jdGlvbiBjYW5Ecm9wUHJvbW90ZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSk6IGJvb2xlYW4ge1xuICByZXR1cm4gIXN0YXRlLmRyb3BwYWJsZS5zcGFyZSAmJiBzdGF0ZS5wcm9tb3Rpb24uZHJvcFByb21vdGlvbkRpYWxvZyhwaWVjZSwga2V5KTtcbn1cblxuZnVuY3Rpb24gaXNQcmVtb3ZhYmxlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBvcmlnOiBzZy5LZXkpOiBib29sZWFuIHtcbiAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXMuZ2V0KG9yaWcpO1xuICByZXR1cm4gKFxuICAgICEhcGllY2UgJiZcbiAgICBzdGF0ZS5wcmVtb3ZhYmxlLmVuYWJsZWQgJiZcbiAgICBzdGF0ZS5hY3RpdmVDb2xvciA9PT0gcGllY2UuY29sb3IgJiZcbiAgICBzdGF0ZS50dXJuQ29sb3IgIT09IHBpZWNlLmNvbG9yXG4gICk7XG59XG5cbmZ1bmN0aW9uIGlzUHJlZHJvcHBhYmxlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICAhIXN0YXRlLmhhbmRzLmhhbmRNYXAuZ2V0KHBpZWNlLmNvbG9yKT8uZ2V0KHBpZWNlLnJvbGUpICYmXG4gICAgc3RhdGUucHJlZHJvcHBhYmxlLmVuYWJsZWQgJiZcbiAgICBzdGF0ZS5hY3RpdmVDb2xvciA9PT0gcGllY2UuY29sb3IgJiZcbiAgICBzdGF0ZS50dXJuQ29sb3IgIT09IHBpZWNlLmNvbG9yXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5QcmVtb3ZlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIG9yaWcgIT09IGRlc3QgJiZcbiAgICBpc1ByZW1vdmFibGUoc3RhdGUsIG9yaWcpICYmXG4gICAgISFzdGF0ZS5wcmVtb3ZhYmxlLmdlbmVyYXRlICYmXG4gICAgc3RhdGUucHJlbW92YWJsZS5nZW5lcmF0ZShvcmlnLCBzdGF0ZS5waWVjZXMpLmluY2x1ZGVzKGRlc3QpXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5QcmVkcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGRlc3Q6IHNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBkZXN0UGllY2UgPSBzdGF0ZS5waWVjZXMuZ2V0KGRlc3QpO1xuICByZXR1cm4gKFxuICAgIGlzUHJlZHJvcHBhYmxlKHN0YXRlLCBwaWVjZSkgJiZcbiAgICAoIWRlc3RQaWVjZSB8fCBkZXN0UGllY2UuY29sb3IgIT09IHN0YXRlLmFjdGl2ZUNvbG9yKSAmJlxuICAgICEhc3RhdGUucHJlZHJvcHBhYmxlLmdlbmVyYXRlICYmXG4gICAgc3RhdGUucHJlZHJvcHBhYmxlLmdlbmVyYXRlKHBpZWNlLCBzdGF0ZS5waWVjZXMpLmluY2x1ZGVzKGRlc3QpXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RyYWdnYWJsZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgc3RhdGUuZHJhZ2dhYmxlLmVuYWJsZWQgJiZcbiAgICAoc3RhdGUuYWN0aXZlQ29sb3IgPT09ICdib3RoJyB8fFxuICAgICAgKHN0YXRlLmFjdGl2ZUNvbG9yID09PSBwaWVjZS5jb2xvciAmJlxuICAgICAgICAoc3RhdGUudHVybkNvbG9yID09PSBwaWVjZS5jb2xvciB8fCBzdGF0ZS5wcmVtb3ZhYmxlLmVuYWJsZWQpKSlcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBsYXlQcmVtb3ZlKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogYm9vbGVhbiB7XG4gIGNvbnN0IG1vdmUgPSBzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQ7XG4gIGlmICghbW92ZSkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBvcmlnID0gbW92ZS5vcmlnLFxuICAgIGRlc3QgPSBtb3ZlLmRlc3QsXG4gICAgcHJvbSA9IG1vdmUucHJvbTtcbiAgbGV0IHN1Y2Nlc3MgPSBmYWxzZTtcbiAgaWYgKGNhbk1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYmFzZVVzZXJNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0LCBwcm9tKTtcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICBjb25zdCBtZXRhZGF0YTogc2cuTW92ZU1ldGFkYXRhID0geyBwcmVtYWRlOiB0cnVlIH07XG4gICAgICBpZiAocmVzdWx0ICE9PSB0cnVlKSBtZXRhZGF0YS5jYXB0dXJlZCA9IHJlc3VsdDtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUubW92YWJsZS5ldmVudHMuYWZ0ZXIsIG9yaWcsIGRlc3QsIHByb20sIG1ldGFkYXRhKTtcbiAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgIH1cbiAgfVxuICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICByZXR1cm4gc3VjY2Vzcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBsYXlQcmVkcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogYm9vbGVhbiB7XG4gIGNvbnN0IGRyb3AgPSBzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudDtcbiAgaWYgKCFkcm9wKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IHBpZWNlID0gZHJvcC5waWVjZSxcbiAgICBrZXkgPSBkcm9wLmtleSxcbiAgICBwcm9tID0gZHJvcC5wcm9tO1xuICBsZXQgc3VjY2VzcyA9IGZhbHNlO1xuICBpZiAoY2FuRHJvcChzdGF0ZSwgcGllY2UsIGtleSkpIHtcbiAgICBpZiAoYmFzZVVzZXJEcm9wKHN0YXRlLCBwaWVjZSwga2V5LCBwcm9tKSkge1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5kcm9wcGFibGUuZXZlbnRzLmFmdGVyLCBwaWVjZSwga2V5LCBwcm9tLCB7IHByZW1hZGU6IHRydWUgfSk7XG4gICAgICBzdWNjZXNzID0gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbiAgcmV0dXJuIHN1Y2Nlc3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWxNb3ZlT3JEcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIHVuc2VsZWN0KHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbmNlbFByb21vdGlvbihzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICBpZiAoIXN0YXRlLnByb21vdGlvbi5jdXJyZW50KSByZXR1cm47XG5cbiAgdW5zZWxlY3Qoc3RhdGUpO1xuICBzdGF0ZS5wcm9tb3Rpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgc3RhdGUuaG92ZXJlZCA9IHVuZGVmaW5lZDtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcm9tb3Rpb24uZXZlbnRzLmNhbmNlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdG9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIHN0YXRlLmFjdGl2ZUNvbG9yID1cbiAgICBzdGF0ZS5tb3ZhYmxlLmRlc3RzID1cbiAgICBzdGF0ZS5kcm9wcGFibGUuZGVzdHMgPVxuICAgIHN0YXRlLmRyYWdnYWJsZS5jdXJyZW50ID1cbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9XG4gICAgc3RhdGUucHJvbW90aW9uLmN1cnJlbnQgPVxuICAgIHN0YXRlLmhvdmVyZWQgPVxuICAgICAgdW5kZWZpbmVkO1xuICBjYW5jZWxNb3ZlT3JEcm9wKHN0YXRlKTtcbn1cbiIsICJpbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgZmlsZXMsIHJhbmtzIH0gZnJvbSAnLi9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgcG9zMmtleSB9IGZyb20gJy4vdXRpbC5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmZlckRpbWVuc2lvbnMoYm9hcmRTZmVuOiBzZy5Cb2FyZFNmZW4pOiBzZy5EaW1lbnNpb25zIHtcbiAgY29uc3QgcmFua3MgPSBib2FyZFNmZW4uc3BsaXQoJy8nKSxcbiAgICBmaXJzdEZpbGUgPSByYW5rc1swXS5zcGxpdCgnJyk7XG4gIGxldCBmaWxlc0NudCA9IDAsXG4gICAgY250ID0gMDtcbiAgZm9yIChjb25zdCBjIG9mIGZpcnN0RmlsZSkge1xuICAgIGNvbnN0IG5iID0gYy5jaGFyQ29kZUF0KDApO1xuICAgIGlmIChuYiA8IDU4ICYmIG5iID4gNDcpIGNudCA9IGNudCAqIDEwICsgbmIgLSA0ODtcbiAgICBlbHNlIGlmIChjICE9PSAnKycpIHtcbiAgICAgIGZpbGVzQ250ICs9IGNudCArIDE7XG4gICAgICBjbnQgPSAwO1xuICAgIH1cbiAgfVxuICBmaWxlc0NudCArPSBjbnQ7XG4gIHJldHVybiB7IGZpbGVzOiBmaWxlc0NudCwgcmFua3M6IHJhbmtzLmxlbmd0aCB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2ZlblRvQm9hcmQoXG4gIHNmZW46IHNnLkJvYXJkU2ZlbixcbiAgZGltczogc2cuRGltZW5zaW9ucyxcbiAgZnJvbUZvcnN5dGg/OiAoZm9yc3l0aDogc3RyaW5nKSA9PiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkLFxuKTogc2cuUGllY2VzIHtcbiAgY29uc3Qgc2ZlblBhcnNlciA9IGZyb21Gb3JzeXRoIHx8IHN0YW5kYXJkRnJvbUZvcnN5dGgsXG4gICAgcGllY2VzOiBzZy5QaWVjZXMgPSBuZXcgTWFwKCk7XG4gIGxldCB4ID0gZGltcy5maWxlcyAtIDEsXG4gICAgeSA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2Zlbi5sZW5ndGg7IGkrKykge1xuICAgIHN3aXRjaCAoc2ZlbltpXSkge1xuICAgICAgY2FzZSAnICc6XG4gICAgICBjYXNlICdfJzpcbiAgICAgICAgcmV0dXJuIHBpZWNlcztcbiAgICAgIGNhc2UgJy8nOlxuICAgICAgICArK3k7XG4gICAgICAgIGlmICh5ID4gZGltcy5yYW5rcyAtIDEpIHJldHVybiBwaWVjZXM7XG4gICAgICAgIHggPSBkaW1zLmZpbGVzIC0gMTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIGNvbnN0IG5iMSA9IHNmZW5baV0uY2hhckNvZGVBdCgwKSxcbiAgICAgICAgICBuYjIgPSBzZmVuW2kgKyAxXSAmJiBzZmVuW2kgKyAxXS5jaGFyQ29kZUF0KDApO1xuICAgICAgICBpZiAobmIxIDwgNTggJiYgbmIxID4gNDcpIHtcbiAgICAgICAgICBpZiAobmIyICYmIG5iMiA8IDU4ICYmIG5iMiA+IDQ3KSB7XG4gICAgICAgICAgICB4IC09IChuYjEgLSA0OCkgKiAxMCArIChuYjIgLSA0OCk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgfSBlbHNlIHggLT0gbmIxIC0gNDg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3Qgcm9sZVN0ciA9IHNmZW5baV0gPT09ICcrJyAmJiBzZmVuLmxlbmd0aCA+IGkgKyAxID8gJysnICsgc2ZlblsrK2ldIDogc2ZlbltpXSxcbiAgICAgICAgICAgIHJvbGUgPSBzZmVuUGFyc2VyKHJvbGVTdHIpO1xuICAgICAgICAgIGlmICh4ID49IDAgJiYgcm9sZSkge1xuICAgICAgICAgICAgY29uc3QgY29sb3IgPSByb2xlU3RyID09PSByb2xlU3RyLnRvTG93ZXJDYXNlKCkgPyAnZ290ZScgOiAnc2VudGUnO1xuICAgICAgICAgICAgcGllY2VzLnNldChwb3Mya2V5KFt4LCB5XSksIHtcbiAgICAgICAgICAgICAgcm9sZTogcm9sZSxcbiAgICAgICAgICAgICAgY29sb3I6IGNvbG9yLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC0teDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcGllY2VzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYm9hcmRUb1NmZW4oXG4gIHBpZWNlczogc2cuUGllY2VzLFxuICBkaW1zOiBzZy5EaW1lbnNpb25zLFxuICB0b0ZvcnN5dGg/OiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc3RyaW5nIHwgdW5kZWZpbmVkLFxuKTogc2cuQm9hcmRTZmVuIHtcbiAgY29uc3Qgc2ZlblJlbmRlcmVyID0gdG9Gb3JzeXRoIHx8IHN0YW5kYXJkVG9Gb3JzeXRoLFxuICAgIHJldmVyc2VkRmlsZXMgPSBmaWxlcy5zbGljZSgwLCBkaW1zLmZpbGVzKS5yZXZlcnNlKCk7XG4gIHJldHVybiByYW5rc1xuICAgIC5zbGljZSgwLCBkaW1zLnJhbmtzKVxuICAgIC5tYXAoKHkpID0+XG4gICAgICByZXZlcnNlZEZpbGVzXG4gICAgICAgIC5tYXAoKHgpID0+IHtcbiAgICAgICAgICBjb25zdCBwaWVjZSA9IHBpZWNlcy5nZXQoKHggKyB5KSBhcyBzZy5LZXkpLFxuICAgICAgICAgICAgZm9yc3l0aCA9IHBpZWNlICYmIHNmZW5SZW5kZXJlcihwaWVjZS5yb2xlKTtcbiAgICAgICAgICBpZiAoZm9yc3l0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHBpZWNlLmNvbG9yID09PSAnc2VudGUnID8gZm9yc3l0aC50b1VwcGVyQ2FzZSgpIDogZm9yc3l0aC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIH0gZWxzZSByZXR1cm4gJzEnO1xuICAgICAgICB9KVxuICAgICAgICAuam9pbignJyksXG4gICAgKVxuICAgIC5qb2luKCcvJylcbiAgICAucmVwbGFjZSgvMXsyLH0vZywgKHMpID0+IHMubGVuZ3RoLnRvU3RyaW5nKCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2ZlblRvSGFuZHMoXG4gIHNmZW46IHNnLkhhbmRzU2ZlbixcbiAgZnJvbUZvcnN5dGg/OiAoZm9yc3l0aDogc3RyaW5nKSA9PiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkLFxuKTogc2cuSGFuZHMge1xuICBjb25zdCBzZmVuUGFyc2VyID0gZnJvbUZvcnN5dGggfHwgc3RhbmRhcmRGcm9tRm9yc3l0aCxcbiAgICBzZW50ZTogc2cuSGFuZCA9IG5ldyBNYXAoKSxcbiAgICBnb3RlOiBzZy5IYW5kID0gbmV3IE1hcCgpO1xuXG4gIGxldCB0bXBOdW0gPSAwLFxuICAgIG51bSA9IDE7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2Zlbi5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IG5iID0gc2ZlbltpXS5jaGFyQ29kZUF0KDApO1xuICAgIGlmIChuYiA8IDU4ICYmIG5iID4gNDcpIHtcbiAgICAgIHRtcE51bSA9IHRtcE51bSAqIDEwICsgbmIgLSA0ODtcbiAgICAgIG51bSA9IHRtcE51bTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgcm9sZVN0ciA9IHNmZW5baV0gPT09ICcrJyAmJiBzZmVuLmxlbmd0aCA+IGkgKyAxID8gJysnICsgc2ZlblsrK2ldIDogc2ZlbltpXSxcbiAgICAgICAgcm9sZSA9IHNmZW5QYXJzZXIocm9sZVN0cik7XG4gICAgICBpZiAocm9sZSkge1xuICAgICAgICBjb25zdCBjb2xvciA9IHJvbGVTdHIgPT09IHJvbGVTdHIudG9Mb3dlckNhc2UoKSA/ICdnb3RlJyA6ICdzZW50ZSc7XG4gICAgICAgIGlmIChjb2xvciA9PT0gJ3NlbnRlJykgc2VudGUuc2V0KHJvbGUsIChzZW50ZS5nZXQocm9sZSkgfHwgMCkgKyBudW0pO1xuICAgICAgICBlbHNlIGdvdGUuc2V0KHJvbGUsIChnb3RlLmdldChyb2xlKSB8fCAwKSArIG51bSk7XG4gICAgICB9XG4gICAgICB0bXBOdW0gPSAwO1xuICAgICAgbnVtID0gMTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IE1hcChbXG4gICAgWydzZW50ZScsIHNlbnRlXSxcbiAgICBbJ2dvdGUnLCBnb3RlXSxcbiAgXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYW5kc1RvU2ZlbihcbiAgaGFuZHM6IHNnLkhhbmRzLFxuICByb2xlczogc2cuUm9sZVN0cmluZ1tdLFxuICB0b0ZvcnN5dGg/OiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc3RyaW5nIHwgdW5kZWZpbmVkLFxuKTogc2cuSGFuZHNTZmVuIHtcbiAgY29uc3Qgc2ZlblJlbmRlcmVyID0gdG9Gb3JzeXRoIHx8IHN0YW5kYXJkVG9Gb3JzeXRoO1xuXG4gIGxldCBzZW50ZUhhbmRTdHIgPSAnJyxcbiAgICBnb3RlSGFuZFN0ciA9ICcnO1xuICBmb3IgKGNvbnN0IHJvbGUgb2Ygcm9sZXMpIHtcbiAgICBjb25zdCBmb3JzeXRoID0gc2ZlblJlbmRlcmVyKHJvbGUpO1xuICAgIGlmIChmb3JzeXRoKSB7XG4gICAgICBjb25zdCBzZW50ZUNudCA9IGhhbmRzLmdldCgnc2VudGUnKT8uZ2V0KHJvbGUpLFxuICAgICAgICBnb3RlQ250ID0gaGFuZHMuZ2V0KCdnb3RlJyk/LmdldChyb2xlKTtcbiAgICAgIGlmIChzZW50ZUNudCkgc2VudGVIYW5kU3RyICs9IHNlbnRlQ250ID4gMSA/IHNlbnRlQ250LnRvU3RyaW5nKCkgKyBmb3JzeXRoIDogZm9yc3l0aDtcbiAgICAgIGlmIChnb3RlQ250KSBnb3RlSGFuZFN0ciArPSBnb3RlQ250ID4gMSA/IGdvdGVDbnQudG9TdHJpbmcoKSArIGZvcnN5dGggOiBmb3JzeXRoO1xuICAgIH1cbiAgfVxuICBpZiAoc2VudGVIYW5kU3RyIHx8IGdvdGVIYW5kU3RyKSByZXR1cm4gc2VudGVIYW5kU3RyLnRvVXBwZXJDYXNlKCkgKyBnb3RlSGFuZFN0ci50b0xvd2VyQ2FzZSgpO1xuICBlbHNlIHJldHVybiAnLSc7XG59XG5cbmZ1bmN0aW9uIHN0YW5kYXJkRnJvbUZvcnN5dGgoZm9yc3l0aDogc3RyaW5nKTogc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIHN3aXRjaCAoZm9yc3l0aC50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAncCc6XG4gICAgICByZXR1cm4gJ3Bhd24nO1xuICAgIGNhc2UgJ2wnOlxuICAgICAgcmV0dXJuICdsYW5jZSc7XG4gICAgY2FzZSAnbic6XG4gICAgICByZXR1cm4gJ2tuaWdodCc7XG4gICAgY2FzZSAncyc6XG4gICAgICByZXR1cm4gJ3NpbHZlcic7XG4gICAgY2FzZSAnZyc6XG4gICAgICByZXR1cm4gJ2dvbGQnO1xuICAgIGNhc2UgJ2InOlxuICAgICAgcmV0dXJuICdiaXNob3AnO1xuICAgIGNhc2UgJ3InOlxuICAgICAgcmV0dXJuICdyb29rJztcbiAgICBjYXNlICcrcCc6XG4gICAgICByZXR1cm4gJ3Rva2luJztcbiAgICBjYXNlICcrbCc6XG4gICAgICByZXR1cm4gJ3Byb21vdGVkbGFuY2UnO1xuICAgIGNhc2UgJytuJzpcbiAgICAgIHJldHVybiAncHJvbW90ZWRrbmlnaHQnO1xuICAgIGNhc2UgJytzJzpcbiAgICAgIHJldHVybiAncHJvbW90ZWRzaWx2ZXInO1xuICAgIGNhc2UgJytiJzpcbiAgICAgIHJldHVybiAnaG9yc2UnO1xuICAgIGNhc2UgJytyJzpcbiAgICAgIHJldHVybiAnZHJhZ29uJztcbiAgICBjYXNlICdrJzpcbiAgICAgIHJldHVybiAna2luZyc7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybjtcbiAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIHN0YW5kYXJkVG9Gb3JzeXRoKHJvbGU6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIHN3aXRjaCAocm9sZSkge1xuICAgIGNhc2UgJ3Bhd24nOlxuICAgICAgcmV0dXJuICdwJztcbiAgICBjYXNlICdsYW5jZSc6XG4gICAgICByZXR1cm4gJ2wnO1xuICAgIGNhc2UgJ2tuaWdodCc6XG4gICAgICByZXR1cm4gJ24nO1xuICAgIGNhc2UgJ3NpbHZlcic6XG4gICAgICByZXR1cm4gJ3MnO1xuICAgIGNhc2UgJ2dvbGQnOlxuICAgICAgcmV0dXJuICdnJztcbiAgICBjYXNlICdiaXNob3AnOlxuICAgICAgcmV0dXJuICdiJztcbiAgICBjYXNlICdyb29rJzpcbiAgICAgIHJldHVybiAncic7XG4gICAgY2FzZSAndG9raW4nOlxuICAgICAgcmV0dXJuICcrcCc7XG4gICAgY2FzZSAncHJvbW90ZWRsYW5jZSc6XG4gICAgICByZXR1cm4gJytsJztcbiAgICBjYXNlICdwcm9tb3RlZGtuaWdodCc6XG4gICAgICByZXR1cm4gJytuJztcbiAgICBjYXNlICdwcm9tb3RlZHNpbHZlcic6XG4gICAgICByZXR1cm4gJytzJztcbiAgICBjYXNlICdob3JzZSc6XG4gICAgICByZXR1cm4gJytiJztcbiAgICBjYXNlICdkcmFnb24nOlxuICAgICAgcmV0dXJuICcrcic7XG4gICAgY2FzZSAna2luZyc6XG4gICAgICByZXR1cm4gJ2snO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm47XG4gIH1cbn1cbiIsICJpbXBvcnQgdHlwZSB7IEhlYWRsZXNzU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlIHsgRHJhd1NoYXBlLCBTcXVhcmVIaWdobGlnaHQgfSBmcm9tICcuL2RyYXcuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IHNldENoZWNrcywgc2V0UHJlRGVzdHMgfSBmcm9tICcuL2JvYXJkLmpzJztcbmltcG9ydCB7IGluZmVyRGltZW5zaW9ucywgc2ZlblRvQm9hcmQsIHNmZW5Ub0hhbmRzIH0gZnJvbSAnLi9zZmVuLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBDb25maWcge1xuICBzZmVuPzoge1xuICAgIGJvYXJkPzogc2cuQm9hcmRTZmVuOyAvLyBwaWVjZXMgb24gdGhlIGJvYXJkIGluIEZvcnN5dGggbm90YXRpb25cbiAgICBoYW5kcz86IHNnLkhhbmRzU2ZlbjsgLy8gcGllY2VzIGluIGhhbmQgaW4gRm9yc3l0aCBub3RhdGlvblxuICB9O1xuICBvcmllbnRhdGlvbj86IHNnLkNvbG9yOyAvLyBib2FyZCBvcmllbnRhdGlvbi4gc2VudGUgfCBnb3RlXG4gIHR1cm5Db2xvcj86IHNnLkNvbG9yOyAvLyB0dXJuIHRvIHBsYXkuIHNlbnRlIHwgZ290ZVxuICBhY3RpdmVDb2xvcj86IHNnLkNvbG9yIHwgJ2JvdGgnOyAvLyBjb2xvciB0aGF0IGNhbiBtb3ZlIG9yIGRyb3AuIHNlbnRlIHwgZ290ZSB8IGJvdGggfCB1bmRlZmluZWRcbiAgY2hlY2tzPzogc2cuS2V5W10gfCBzZy5Db2xvciB8IGJvb2xlYW47IC8vIHNxdWFyZXMgY3VycmVudGx5IGluIGNoZWNrIFtcIjVhXCJdLCBjb2xvciBpbiBjaGVjayAoc2VlIGhpZ2hsaWdodC5jaGVja1JvbGVzKSBvciBib29sZWFuIGZvciBjdXJyZW50IHR1cm4gY29sb3JcbiAgbGFzdERlc3RzPzogc2cuS2V5W107IC8vIHNxdWFyZXMgcGFydCBvZiB0aGUgbGFzdCBtb3ZlIG9yIGRyb3AgW1wiM2NcIiwgXCI0Y1wiXVxuICBsYXN0UGllY2U/OiBzZy5QaWVjZTsgLy8gcGllY2UgcGFydCBvZiB0aGUgbGFzdCBkcm9wXG4gIHNlbGVjdGVkPzogc2cuS2V5OyAvLyBzcXVhcmUgY3VycmVudGx5IHNlbGVjdGVkIFwiMWFcIlxuICBzZWxlY3RlZFBpZWNlPzogc2cuUGllY2U7IC8vIHBpZWNlIGluIGhhbmQgY3VycmVudGx5IHNlbGVjdGVkXG4gIGhvdmVyZWQ/OiBzZy5LZXk7IC8vIHNxdWFyZSBjdXJyZW50bHkgYmVpbmcgaG92ZXJlZFxuICB2aWV3T25seT86IGJvb2xlYW47IC8vIGRvbid0IGJpbmQgZXZlbnRzOiB0aGUgdXNlciB3aWxsIG5ldmVyIGJlIGFibGUgdG8gbW92ZSBwaWVjZXMgYXJvdW5kXG4gIHNxdWFyZVJhdGlvPzogc2cuTnVtYmVyUGFpcjsgLy8gcmF0aW8gb2YgYSBzaW5nbGUgc3F1YXJlIFt3aWR0aCwgaGVpZ2h0XVxuICBkaXNhYmxlQ29udGV4dE1lbnU/OiBib29sZWFuOyAvLyBiZWNhdXNlIHdobyBuZWVkcyBhIGNvbnRleHQgbWVudSBvbiBhIGJvYXJkLCBvbmx5IHdpdGhvdXQgdmlld09ubHlcbiAgYmxvY2tUb3VjaFNjcm9sbD86IGJvb2xlYW47IC8vIGJsb2NrIHNjcm9sbGluZyB2aWEgdG91Y2ggZHJhZ2dpbmcgb24gdGhlIGJvYXJkLCBlLmcuIGZvciBjb29yZGluYXRlIHRyYWluaW5nXG4gIHNjYWxlRG93blBpZWNlcz86IGJvb2xlYW47IC8vIGhlbHBmdWwgZm9yIHBuZ3MgLSBodHRwczovL2N0aWRkLmNvbS8yMDE1L3N2Zy1iYWNrZ3JvdW5kLXNjYWxpbmdcbiAgY29vcmRpbmF0ZXM/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGluY2x1ZGUgY29vcmRzIGF0dHJpYnV0ZXNcbiAgICBmaWxlcz86IHNnLk5vdGF0aW9uO1xuICAgIHJhbmtzPzogc2cuTm90YXRpb247XG4gIH07XG4gIGhpZ2hsaWdodD86IHtcbiAgICBsYXN0RGVzdHM/OiBib29sZWFuOyAvLyBhZGQgbGFzdC1kZXN0IGNsYXNzIHRvIHNxdWFyZXMgYW5kIHBpZWNlc1xuICAgIGNoZWNrPzogYm9vbGVhbjsgLy8gYWRkIGNoZWNrIGNsYXNzIHRvIHNxdWFyZXNcbiAgICBjaGVja1JvbGVzPzogc2cuUm9sZVN0cmluZ1tdOyAvLyByb2xlcyB0byBiZSBoaWdobGlnaHRlZCB3aGVuIGNoZWNrIGlzIGJvb2xlYW4gaXMgcGFzc2VkIGZyb20gY29uZmlnXG4gICAgaG92ZXJlZD86IGJvb2xlYW47IC8vIGFkZCBob3ZlciBjbGFzcyB0byBob3ZlcmVkIHNxdWFyZXNcbiAgfTtcbiAgYW5pbWF0aW9uPzogeyBlbmFibGVkPzogYm9vbGVhbjsgaGFuZHM/OiBib29sZWFuOyBkdXJhdGlvbj86IG51bWJlciB9O1xuICBoYW5kcz86IHtcbiAgICBpbmxpbmVkPzogYm9vbGVhbjsgLy8gYXR0YWNoZXMgc2ctaGFuZHMgZGlyZWN0bHkgdG8gc2ctd3JhcCwgaWdub3JlcyBIVE1MRWxlbWVudHMgcGFzc2VkIHRvIFNob2dpZ3JvdW5kXG4gICAgcm9sZXM/OiBzZy5Sb2xlU3RyaW5nW107IC8vIHJvbGVzIHRvIHJlbmRlciBpbiBzZy1oYW5kXG4gIH07XG4gIG1vdmFibGU/OiB7XG4gICAgZnJlZT86IGJvb2xlYW47IC8vIGFsbCBtb3ZlcyBhcmUgdmFsaWQgLSBib2FyZCBlZGl0b3JcbiAgICBkZXN0cz86IHNnLk1vdmVEZXN0czsgLy8gdmFsaWQgbW92ZXMuIHtcIjJhXCIgW1wiM2FcIiBcIjRhXCJdIFwiMWJcIiBbXCIzYVwiIFwiM2NcIl19XG4gICAgc2hvd0Rlc3RzPzogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIGRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIGV2ZW50cz86IHtcbiAgICAgIGFmdGVyPzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tOiBib29sZWFuLCBtZXRhZGF0YTogc2cuTW92ZU1ldGFkYXRhKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIG1vdmUgaGFzIGJlZW4gcGxheWVkXG4gICAgfTtcbiAgfTtcbiAgZHJvcHBhYmxlPzoge1xuICAgIGZyZWU/OiBib29sZWFuOyAvLyBhbGwgZHJvcHMgYXJlIHZhbGlkIC0gYm9hcmQgZWRpdG9yXG4gICAgZGVzdHM/OiBzZy5Ecm9wRGVzdHM7IC8vIHZhbGlkIGRyb3BzLiB7XCJzZW50ZSBwYXduXCIgW1wiM2FcIiBcIjRhXCJdIFwic2VudGUgbGFuY2VcIiBbXCIzYVwiIFwiM2NcIl19XG4gICAgc2hvd0Rlc3RzPzogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIGRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIHNwYXJlPzogYm9vbGVhbjsgLy8gd2hldGhlciB0byByZW1vdmUgZHJvcHBlZCBwaWVjZSBmcm9tIGhhbmQgYWZ0ZXIgZHJvcCAtIGJvYXJkIGVkaXRvclxuICAgIGV2ZW50cz86IHtcbiAgICAgIGFmdGVyPzogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb206IGJvb2xlYW4sIG1ldGFkYXRhOiBzZy5Nb3ZlTWV0YWRhdGEpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgZHJvcCBoYXMgYmVlbiBwbGF5ZWRcbiAgICB9O1xuICB9O1xuICBwcmVtb3ZhYmxlPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuOyAvLyBhbGxvdyBwcmVtb3ZlcyBmb3IgY29sb3IgdGhhdCBjYW4gbm90IG1vdmVcbiAgICBzaG93RGVzdHM/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgcHJlLWRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIGRlc3RzPzogc2cuS2V5W107IC8vIHByZW1vdmUgZGVzdGluYXRpb25zIGZvciB0aGUgY3VycmVudCBzZWxlY3Rpb25cbiAgICBnZW5lcmF0ZT86IChrZXk6IHNnLktleSwgcGllY2VzOiBzZy5QaWVjZXMpID0+IHNnLktleVtdOyAvLyBmdW5jdGlvbiB0byBnZW5lcmF0ZSBkZXN0aW5hdGlvbnMgdGhhdCB1c2VyIGNhbiBwcmVtb3ZlIHRvXG4gICAgZXZlbnRzPzoge1xuICAgICAgc2V0PzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tOiBib29sZWFuKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZW1vdmUgaGFzIGJlZW4gc2V0XG4gICAgICB1bnNldD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlbW92ZSBoYXMgYmVlbiB1bnNldFxuICAgIH07XG4gIH07XG4gIHByZWRyb3BwYWJsZT86IHtcbiAgICBlbmFibGVkPzogYm9vbGVhbjsgLy8gYWxsb3cgcHJlZHJvcHMgZm9yIGNvbG9yIHRoYXQgY2FuIG5vdCBtb3ZlXG4gICAgc2hvd0Rlc3RzPzogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIHByZS1kZXN0IGNsYXNzIG9uIHNxdWFyZXMgZm9yIGRyb3BzXG4gICAgZGVzdHM/OiBzZy5LZXlbXTsgLy8gcHJlbW92ZSBkZXN0aW5hdGlvbnMgZm9yIHRoZSBkcm9wIHNlbGVjdGlvblxuICAgIGdlbmVyYXRlPzogKHBpZWNlOiBzZy5QaWVjZSwgcGllY2VzOiBzZy5QaWVjZXMpID0+IHNnLktleVtdOyAvLyBmdW5jdGlvbiB0byBnZW5lcmF0ZSBkZXN0aW5hdGlvbnMgdGhhdCB1c2VyIGNhbiBwcmVkcm9wIG9uXG4gICAgZXZlbnRzPzoge1xuICAgICAgc2V0PzogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb206IGJvb2xlYW4pID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlZHJvcCBoYXMgYmVlbiBzZXRcbiAgICAgIHVuc2V0PzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVkcm9wIGhhcyBiZWVuIHVuc2V0XG4gICAgfTtcbiAgfTtcbiAgZHJhZ2dhYmxlPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuOyAvLyBhbGxvdyBtb3ZlcyAmIHByZW1vdmVzIHRvIHVzZSBkcmFnJ24gZHJvcFxuICAgIGRpc3RhbmNlPzogbnVtYmVyOyAvLyBtaW5pbXVtIGRpc3RhbmNlIHRvIGluaXRpYXRlIGEgZHJhZzsgaW4gcGl4ZWxzXG4gICAgYXV0b0Rpc3RhbmNlPzogYm9vbGVhbjsgLy8gbGV0cyBzaG9naWdyb3VuZCBzZXQgZGlzdGFuY2UgdG8gemVybyB3aGVuIHVzZXIgZHJhZ3MgcGllY2VzXG4gICAgc2hvd0dob3N0PzogYm9vbGVhbjsgLy8gc2hvdyBnaG9zdCBvZiBwaWVjZSBiZWluZyBkcmFnZ2VkXG4gICAgc2hvd1RvdWNoU3F1YXJlT3ZlcmxheT86IGJvb2xlYW47IC8vIHNob3cgc3F1YXJlIG92ZXJsYXkgb24gdGhlIHNxdWFyZSB0aGF0IGlzIGN1cnJlbnRseSBiZWluZyBob3ZlcmVkLCB0b3VjaCBvbmx5XG4gICAgZGVsZXRlT25Ecm9wT2ZmPzogYm9vbGVhbjsgLy8gZGVsZXRlIGEgcGllY2Ugd2hlbiBpdCBpcyBkcm9wcGVkIG9mZiB0aGUgYm9hcmRcbiAgICBhZGRUb0hhbmRPbkRyb3BPZmY/OiBib29sZWFuOyAvLyBhZGQgYSBwaWVjZSB0byBoYW5kIHdoZW4gaXQgaXMgZHJvcHBlZCBvbiBpdCwgcmVxdWlyZXMgZGVsZXRlT25Ecm9wT2ZmXG4gIH07XG4gIHNlbGVjdGFibGU/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGRpc2FibGUgdG8gZW5mb3JjZSBkcmFnZ2luZyBvdmVyIGNsaWNrLWNsaWNrIG1vdmVcbiAgICBmb3JjZVNwYXJlcz86IGJvb2xlYW47IC8vIGFsbG93IGRyb3BwaW5nIHNwYXJlIHBpZWNlcyBldmVuIHdpdGggc2VsZWN0YWJsZSBkaXNhYmxlZFxuICAgIGRlbGV0ZU9uVG91Y2g/OiBib29sZWFuOyAvLyBzZWxlY3RpbmcgYSBwaWVjZSBvbiB0aGUgYm9hcmQgb3IgaW4gaGFuZCB3aWxsIHJlbW92ZSBpdCAtIGJvYXJkIGVkaXRvclxuICAgIGFkZFNwYXJlc1RvSGFuZD86IGJvb2xlYW47IC8vIGFkZCBzZWxlY3RlZCBzcGFyZSBwaWVjZSB0byBoYW5kIC0gYm9hcmQgZWRpdG9yXG4gIH07XG4gIGV2ZW50cz86IHtcbiAgICBjaGFuZ2U/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHNpdHVhdGlvbiBjaGFuZ2VzIG9uIHRoZSBib2FyZFxuICAgIG1vdmU/OiAob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXksIHByb206IGJvb2xlYW4sIGNhcHR1cmVkUGllY2U/OiBzZy5QaWVjZSkgPT4gdm9pZDtcbiAgICBkcm9wPzogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb206IGJvb2xlYW4pID0+IHZvaWQ7XG4gICAgc2VsZWN0PzogKGtleTogc2cuS2V5KSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBhIHNxdWFyZSBpcyBzZWxlY3RlZFxuICAgIHVuc2VsZWN0PzogKGtleTogc2cuS2V5KSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBhIHNlbGVjdGVkIHNxdWFyZSBpcyBkaXJlY3RseSB1bnNlbGVjdGVkIC0gZHJvcHBlZCBiYWNrIG9yIGNsaWNrZWQgb24gdGhlIG9yaWdpbmFsIHNxdWFyZVxuICAgIHBpZWNlU2VsZWN0PzogKHBpZWNlOiBzZy5QaWVjZSkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gYSBwaWVjZSBpbiBoYW5kIGlzIHNlbGVjdGVkXG4gICAgcGllY2VVbnNlbGVjdD86IChwaWVjZTogc2cuUGllY2UpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIGEgc2VsZWN0ZWQgcGllY2UgaXMgZGlyZWN0bHkgdW5zZWxlY3RlZCAtIGRyb3BwZWQgYmFjayBvciBjbGlja2VkIG9uIHRoZSBzYW1lIHBpZWNlXG4gICAgaW5zZXJ0PzogKGJvYXJkRWxlbWVudHM/OiBzZy5Cb2FyZEVsZW1lbnRzLCBoYW5kRWxlbWVudHM/OiBzZy5IYW5kRWxlbWVudHMpID0+IHZvaWQ7IC8vIHdoZW4gdGhlIGJvYXJkL2hhbmRzIERPTSBoYXMgYmVlbiAocmUpaW5zZXJ0ZWRcbiAgfTtcbiAgZHJhd2FibGU/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGNhbiBkcmF3XG4gICAgdmlzaWJsZT86IGJvb2xlYW47IC8vIGNhbiB2aWV3XG4gICAgZm9yY2VkPzogYm9vbGVhbjsgLy8gY2FuIG9ubHkgZHJhd1xuICAgIGVyYXNlT25DbGljaz86IGJvb2xlYW47XG4gICAgc2hhcGVzPzogRHJhd1NoYXBlW107XG4gICAgYXV0b1NoYXBlcz86IERyYXdTaGFwZVtdO1xuICAgIHNxdWFyZXM/OiBTcXVhcmVIaWdobGlnaHRbXTtcbiAgICBvbkNoYW5nZT86IChzaGFwZXM6IERyYXdTaGFwZVtdKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgZHJhd2FibGUgc2hhcGVzIGNoYW5nZVxuICB9O1xuICBmb3JzeXRoPzoge1xuICAgIHRvRm9yc3l0aD86IChyb2xlOiBzZy5Sb2xlU3RyaW5nKSA9PiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgZnJvbUZvcnN5dGg/OiAoc3RyOiBzdHJpbmcpID0+IHNnLlJvbGVTdHJpbmcgfCB1bmRlZmluZWQ7XG4gIH07XG4gIHByb21vdGlvbj86IHtcbiAgICBwcm9tb3Rlc1RvPzogKHJvbGU6IHNnLlJvbGVTdHJpbmcpID0+IHNnLlJvbGVTdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgdW5wcm9tb3Rlc1RvPzogKHJvbGU6IHNnLlJvbGVTdHJpbmcpID0+IHNnLlJvbGVTdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgbW92ZVByb21vdGlvbkRpYWxvZz86IChvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSkgPT4gYm9vbGVhbjsgLy8gYWN0aXZhdGUgcHJvbW90aW9uIGRpYWxvZ1xuICAgIGZvcmNlTW92ZVByb21vdGlvbj86IChvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSkgPT4gYm9vbGVhbjsgLy8gYXV0byBwcm9tb3RlIGFmdGVyIG1vdmVcbiAgICBkcm9wUHJvbW90aW9uRGlhbG9nPzogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXkpID0+IGJvb2xlYW47IC8vIGFjdGl2YXRlIHByb21vdGlvbiBkaWFsb2dcbiAgICBmb3JjZURyb3BQcm9tb3Rpb24/OiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSkgPT4gYm9vbGVhbjsgLy8gYXV0byBwcm9tb3RlIGFmdGVyIGRyb3BcbiAgICBldmVudHM/OiB7XG4gICAgICBpbml0aWF0ZWQ/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBwcm9tb3Rpb24gZGlhbG9nIGlzIHN0YXJ0ZWRcbiAgICAgIGFmdGVyPzogKHBpZWNlOiBzZy5QaWVjZSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHVzZXIgc2VsZWN0cyBhIHBpZWNlXG4gICAgICBjYW5jZWw/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdXNlciBjYW5jZWxzIHRoZSBzZWxlY3Rpb25cbiAgICB9O1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlBbmltYXRpb24oc3RhdGU6IEhlYWRsZXNzU3RhdGUsIGNvbmZpZzogQ29uZmlnKTogdm9pZCB7XG4gIGlmIChjb25maWcuYW5pbWF0aW9uKSB7XG4gICAgZGVlcE1lcmdlKHN0YXRlLmFuaW1hdGlvbiwgY29uZmlnLmFuaW1hdGlvbik7XG4gICAgLy8gbm8gbmVlZCBmb3Igc3VjaCBzaG9ydCBhbmltYXRpb25zXG4gICAgaWYgKChzdGF0ZS5hbmltYXRpb24uZHVyYXRpb24gfHwgMCkgPCA3MCkgc3RhdGUuYW5pbWF0aW9uLmVuYWJsZWQgPSBmYWxzZTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uZmlndXJlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBjb25maWc6IENvbmZpZyk6IHZvaWQge1xuICAvLyBkb24ndCBtZXJnZSwganVzdCBvdmVycmlkZS5cbiAgaWYgKGNvbmZpZy5tb3ZhYmxlPy5kZXN0cykgc3RhdGUubW92YWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbiAgaWYgKGNvbmZpZy5kcm9wcGFibGU/LmRlc3RzKSBzdGF0ZS5kcm9wcGFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gIGlmIChjb25maWcuZHJhd2FibGU/LnNoYXBlcykgc3RhdGUuZHJhd2FibGUuc2hhcGVzID0gW107XG4gIGlmIChjb25maWcuZHJhd2FibGU/LmF1dG9TaGFwZXMpIHN0YXRlLmRyYXdhYmxlLmF1dG9TaGFwZXMgPSBbXTtcbiAgaWYgKGNvbmZpZy5kcmF3YWJsZT8uc3F1YXJlcykgc3RhdGUuZHJhd2FibGUuc3F1YXJlcyA9IFtdO1xuICBpZiAoY29uZmlnLmhhbmRzPy5yb2xlcykgc3RhdGUuaGFuZHMucm9sZXMgPSBbXTtcblxuICBkZWVwTWVyZ2Uoc3RhdGUsIGNvbmZpZyk7XG5cbiAgLy8gaWYgYSBzZmVuIHdhcyBwcm92aWRlZCwgcmVwbGFjZSB0aGUgcGllY2VzLCBleGNlcHQgdGhlIGN1cnJlbnRseSBkcmFnZ2VkIG9uZVxuICBpZiAoY29uZmlnLnNmZW4/LmJvYXJkKSB7XG4gICAgc3RhdGUuZGltZW5zaW9ucyA9IGluZmVyRGltZW5zaW9ucyhjb25maWcuc2Zlbi5ib2FyZCk7XG4gICAgc3RhdGUucGllY2VzID0gc2ZlblRvQm9hcmQoY29uZmlnLnNmZW4uYm9hcmQsIHN0YXRlLmRpbWVuc2lvbnMsIHN0YXRlLmZvcnN5dGguZnJvbUZvcnN5dGgpO1xuICAgIHN0YXRlLmRyYXdhYmxlLnNoYXBlcyA9IGNvbmZpZy5kcmF3YWJsZT8uc2hhcGVzIHx8IFtdO1xuICB9XG5cbiAgaWYgKGNvbmZpZy5zZmVuPy5oYW5kcykge1xuICAgIHN0YXRlLmhhbmRzLmhhbmRNYXAgPSBzZmVuVG9IYW5kcyhjb25maWcuc2Zlbi5oYW5kcywgc3RhdGUuZm9yc3l0aC5mcm9tRm9yc3l0aCk7XG4gIH1cblxuICAvLyBhcHBseSBjb25maWcgdmFsdWVzIHRoYXQgY291bGQgYmUgdW5kZWZpbmVkIHlldCBtZWFuaW5nZnVsXG4gIGlmICgnY2hlY2tzJyBpbiBjb25maWcpIHNldENoZWNrcyhzdGF0ZSwgY29uZmlnLmNoZWNrcyB8fCBmYWxzZSk7XG4gIGlmICgnbGFzdFBpZWNlJyBpbiBjb25maWcgJiYgIWNvbmZpZy5sYXN0UGllY2UpIHN0YXRlLmxhc3RQaWVjZSA9IHVuZGVmaW5lZDtcblxuICAvLyBpbiBjYXNlIG9mIGRyb3AgbGFzdCBtb3ZlLCB0aGVyZSdzIGEgc2luZ2xlIHNxdWFyZS5cbiAgLy8gaWYgdGhlIHByZXZpb3VzIGxhc3QgbW92ZSBoYWQgdHdvIHNxdWFyZXMsXG4gIC8vIHRoZSBtZXJnZSBhbGdvcml0aG0gd2lsbCBpbmNvcnJlY3RseSBrZWVwIHRoZSBzZWNvbmQgc3F1YXJlLlxuICBpZiAoJ2xhc3REZXN0cycgaW4gY29uZmlnICYmICFjb25maWcubGFzdERlc3RzKSBzdGF0ZS5sYXN0RGVzdHMgPSB1bmRlZmluZWQ7XG4gIGVsc2UgaWYgKGNvbmZpZy5sYXN0RGVzdHMpIHN0YXRlLmxhc3REZXN0cyA9IGNvbmZpZy5sYXN0RGVzdHM7XG5cbiAgLy8gZml4IG1vdmUvcHJlbW92ZSBkZXN0c1xuICBzZXRQcmVEZXN0cyhzdGF0ZSk7XG5cbiAgYXBwbHlBbmltYXRpb24oc3RhdGUsIGNvbmZpZyk7XG59XG5cbmZ1bmN0aW9uIGRlZXBNZXJnZShiYXNlOiBhbnksIGV4dGVuZDogYW55KTogdm9pZCB7XG4gIGZvciAoY29uc3Qga2V5IGluIGV4dGVuZCkge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZXh0ZW5kLCBrZXkpKSB7XG4gICAgICBpZiAoXG4gICAgICAgIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChiYXNlLCBrZXkpICYmXG4gICAgICAgIGlzUGxhaW5PYmplY3QoYmFzZVtrZXldKSAmJlxuICAgICAgICBpc1BsYWluT2JqZWN0KGV4dGVuZFtrZXldKVxuICAgICAgKVxuICAgICAgICBkZWVwTWVyZ2UoYmFzZVtrZXldLCBleHRlbmRba2V5XSk7XG4gICAgICBlbHNlIGJhc2Vba2V5XSA9IGV4dGVuZFtrZXldO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KG86IHVua25vd24pOiBib29sZWFuIHtcbiAgaWYgKHR5cGVvZiBvICE9PSAnb2JqZWN0JyB8fCBvID09PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG8pO1xuICByZXR1cm4gcHJvdG8gPT09IE9iamVjdC5wcm90b3R5cGUgfHwgcHJvdG8gPT09IG51bGw7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IGFsbEtleXMsIGNvbG9ycyB9IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsLmpzJztcblxuZXhwb3J0IHR5cGUgTXV0YXRpb248QT4gPSAoc3RhdGU6IFN0YXRlKSA9PiBBO1xuXG4vLyAwLDEgYW5pbWF0aW9uIGdvYWxcbi8vIDIsMyBhbmltYXRpb24gY3VycmVudCBzdGF0dXNcbmV4cG9ydCB0eXBlIEFuaW1WZWN0b3IgPSBzZy5OdW1iZXJRdWFkO1xuXG5leHBvcnQgdHlwZSBBbmltVmVjdG9ycyA9IE1hcDxzZy5LZXksIEFuaW1WZWN0b3I+O1xuXG5leHBvcnQgdHlwZSBBbmltRmFkaW5ncyA9IE1hcDxzZy5LZXksIHNnLlBpZWNlPjtcblxuZXhwb3J0IHR5cGUgQW5pbVByb21vdGlvbnMgPSBNYXA8c2cuS2V5LCBzZy5QaWVjZT47XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbVBsYW4ge1xuICBhbmltczogQW5pbVZlY3RvcnM7XG4gIGZhZGluZ3M6IEFuaW1GYWRpbmdzO1xuICBwcm9tb3Rpb25zOiBBbmltUHJvbW90aW9ucztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBbmltQ3VycmVudCB7XG4gIHN0YXJ0OiBET01IaWdoUmVzVGltZVN0YW1wO1xuICBmcmVxdWVuY3k6IHNnLktIejtcbiAgcGxhbjogQW5pbVBsYW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmltPEE+KG11dGF0aW9uOiBNdXRhdGlvbjxBPiwgc3RhdGU6IFN0YXRlKTogQSB7XG4gIHJldHVybiBzdGF0ZS5hbmltYXRpb24uZW5hYmxlZCA/IGFuaW1hdGUobXV0YXRpb24sIHN0YXRlKSA6IHJlbmRlcihtdXRhdGlvbiwgc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyPEE+KG11dGF0aW9uOiBNdXRhdGlvbjxBPiwgc3RhdGU6IFN0YXRlKTogQSB7XG4gIGNvbnN0IHJlc3VsdCA9IG11dGF0aW9uKHN0YXRlKTtcbiAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5pbnRlcmZhY2UgQW5pbVBpZWNlIHtcbiAga2V5Pzogc2cuS2V5O1xuICBwb3M6IHNnLlBvcztcbiAgcGllY2U6IHNnLlBpZWNlO1xufVxuXG5mdW5jdGlvbiBtYWtlUGllY2Uoa2V5OiBzZy5LZXksIHBpZWNlOiBzZy5QaWVjZSk6IEFuaW1QaWVjZSB7XG4gIHJldHVybiB7XG4gICAga2V5OiBrZXksXG4gICAgcG9zOiB1dGlsLmtleTJwb3Moa2V5KSxcbiAgICBwaWVjZTogcGllY2UsXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNsb3NlcihwaWVjZTogQW5pbVBpZWNlLCBwaWVjZXM6IEFuaW1QaWVjZVtdKTogQW5pbVBpZWNlIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHBpZWNlcy5zb3J0KChwMSwgcDIpID0+IHtcbiAgICByZXR1cm4gdXRpbC5kaXN0YW5jZVNxKHBpZWNlLnBvcywgcDEucG9zKSAtIHV0aWwuZGlzdGFuY2VTcShwaWVjZS5wb3MsIHAyLnBvcyk7XG4gIH0pWzBdO1xufVxuXG5mdW5jdGlvbiBjb21wdXRlUGxhbihwcmV2UGllY2VzOiBzZy5QaWVjZXMsIHByZXZIYW5kczogc2cuSGFuZHMsIGN1cnJlbnQ6IFN0YXRlKTogQW5pbVBsYW4ge1xuICBjb25zdCBhbmltczogQW5pbVZlY3RvcnMgPSBuZXcgTWFwKCksXG4gICAgYW5pbWVkT3JpZ3M6IHNnLktleVtdID0gW10sXG4gICAgZmFkaW5nczogQW5pbUZhZGluZ3MgPSBuZXcgTWFwKCksXG4gICAgcHJvbW90aW9uczogQW5pbVByb21vdGlvbnMgPSBuZXcgTWFwKCksXG4gICAgbWlzc2luZ3M6IEFuaW1QaWVjZVtdID0gW10sXG4gICAgbmV3czogQW5pbVBpZWNlW10gPSBbXSxcbiAgICBwcmVQaWVjZXMgPSBuZXcgTWFwPHNnLktleSwgQW5pbVBpZWNlPigpO1xuXG4gIGZvciAoY29uc3QgW2ssIHBdIG9mIHByZXZQaWVjZXMpIHtcbiAgICBwcmVQaWVjZXMuc2V0KGssIG1ha2VQaWVjZShrLCBwKSk7XG4gIH1cbiAgZm9yIChjb25zdCBrZXkgb2YgYWxsS2V5cykge1xuICAgIGNvbnN0IGN1clAgPSBjdXJyZW50LnBpZWNlcy5nZXQoa2V5KSxcbiAgICAgIHByZVAgPSBwcmVQaWVjZXMuZ2V0KGtleSk7XG4gICAgaWYgKGN1clApIHtcbiAgICAgIGlmIChwcmVQKSB7XG4gICAgICAgIGlmICghdXRpbC5zYW1lUGllY2UoY3VyUCwgcHJlUC5waWVjZSkpIHtcbiAgICAgICAgICBtaXNzaW5ncy5wdXNoKHByZVApO1xuICAgICAgICAgIG5ld3MucHVzaChtYWtlUGllY2Uoa2V5LCBjdXJQKSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBuZXdzLnB1c2gobWFrZVBpZWNlKGtleSwgY3VyUCkpO1xuICAgIH0gZWxzZSBpZiAocHJlUCkgbWlzc2luZ3MucHVzaChwcmVQKTtcbiAgfVxuICBpZiAoY3VycmVudC5hbmltYXRpb24uaGFuZHMpIHtcbiAgICBmb3IgKGNvbnN0IGNvbG9yIG9mIGNvbG9ycykge1xuICAgICAgY29uc3QgY3VySCA9IGN1cnJlbnQuaGFuZHMuaGFuZE1hcC5nZXQoY29sb3IpLFxuICAgICAgICBwcmVIID0gcHJldkhhbmRzLmdldChjb2xvcik7XG4gICAgICBpZiAocHJlSCAmJiBjdXJIKSB7XG4gICAgICAgIGZvciAoY29uc3QgW3JvbGUsIG5dIG9mIHByZUgpIHtcbiAgICAgICAgICBjb25zdCBwaWVjZTogc2cuUGllY2UgPSB7IHJvbGUsIGNvbG9yIH0sXG4gICAgICAgICAgICBjdXJOID0gY3VySC5nZXQocm9sZSkgfHwgMDtcbiAgICAgICAgICBpZiAoY3VyTiA8IG4pIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRQaWVjZU9mZnNldCA9IGN1cnJlbnQuZG9tLmJvdW5kcy5oYW5kc1xuICAgICAgICAgICAgICAgIC5waWVjZUJvdW5kcygpXG4gICAgICAgICAgICAgICAgLmdldCh1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKSksXG4gICAgICAgICAgICAgIGJvdW5kcyA9IGN1cnJlbnQuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKSxcbiAgICAgICAgICAgICAgb3V0UG9zID1cbiAgICAgICAgICAgICAgICBoYW5kUGllY2VPZmZzZXQgJiYgYm91bmRzXG4gICAgICAgICAgICAgICAgICA/IHV0aWwucG9zT2ZPdXRzaWRlRWwoXG4gICAgICAgICAgICAgICAgICAgICAgaGFuZFBpZWNlT2Zmc2V0LmxlZnQsXG4gICAgICAgICAgICAgICAgICAgICAgaGFuZFBpZWNlT2Zmc2V0LnRvcCxcbiAgICAgICAgICAgICAgICAgICAgICB1dGlsLnNlbnRlUG92KGN1cnJlbnQub3JpZW50YXRpb24pLFxuICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQuZGltZW5zaW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICBib3VuZHMsXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKG91dFBvcylcbiAgICAgICAgICAgICAgbWlzc2luZ3MucHVzaCh7XG4gICAgICAgICAgICAgICAgcG9zOiBvdXRQb3MsXG4gICAgICAgICAgICAgICAgcGllY2U6IHBpZWNlLFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZm9yIChjb25zdCBuZXdQIG9mIG5ld3MpIHtcbiAgICBjb25zdCBwcmVQID0gY2xvc2VyKFxuICAgICAgbmV3UCxcbiAgICAgIG1pc3NpbmdzLmZpbHRlcigocCkgPT4ge1xuICAgICAgICBpZiAodXRpbC5zYW1lUGllY2UobmV3UC5waWVjZSwgcC5waWVjZSkpIHJldHVybiB0cnVlO1xuICAgICAgICAvLyBjaGVja2luZyB3aGV0aGVyIHByb21vdGVkIHBpZWNlcyBhcmUgdGhlIHNhbWVcbiAgICAgICAgY29uc3QgcFJvbGUgPSBjdXJyZW50LnByb21vdGlvbi5wcm9tb3Rlc1RvKHAucGllY2Uucm9sZSksXG4gICAgICAgICAgcFBpZWNlID0gcFJvbGUgJiYgeyBjb2xvcjogcC5waWVjZS5jb2xvciwgcm9sZTogcFJvbGUgfTtcbiAgICAgICAgY29uc3QgblJvbGUgPSBjdXJyZW50LnByb21vdGlvbi5wcm9tb3Rlc1RvKG5ld1AucGllY2Uucm9sZSksXG4gICAgICAgICAgblBpZWNlID0gblJvbGUgJiYgeyBjb2xvcjogbmV3UC5waWVjZS5jb2xvciwgcm9sZTogblJvbGUgfTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAoISFwUGllY2UgJiYgdXRpbC5zYW1lUGllY2UobmV3UC5waWVjZSwgcFBpZWNlKSkgfHxcbiAgICAgICAgICAoISFuUGllY2UgJiYgdXRpbC5zYW1lUGllY2UoblBpZWNlLCBwLnBpZWNlKSlcbiAgICAgICAgKTtcbiAgICAgIH0pLFxuICAgICk7XG4gICAgaWYgKHByZVApIHtcbiAgICAgIGNvbnN0IHZlY3RvciA9IFtwcmVQLnBvc1swXSAtIG5ld1AucG9zWzBdLCBwcmVQLnBvc1sxXSAtIG5ld1AucG9zWzFdXTtcbiAgICAgIGFuaW1zLnNldChuZXdQLmtleSEsIHZlY3Rvci5jb25jYXQodmVjdG9yKSBhcyBBbmltVmVjdG9yKTtcbiAgICAgIGlmIChwcmVQLmtleSkgYW5pbWVkT3JpZ3MucHVzaChwcmVQLmtleSk7XG4gICAgICBpZiAoIXV0aWwuc2FtZVBpZWNlKG5ld1AucGllY2UsIHByZVAucGllY2UpICYmIG5ld1Aua2V5KSBwcm9tb3Rpb25zLnNldChuZXdQLmtleSwgcHJlUC5waWVjZSk7XG4gICAgfVxuICB9XG4gIGZvciAoY29uc3QgcCBvZiBtaXNzaW5ncykge1xuICAgIGlmIChwLmtleSAmJiAhYW5pbWVkT3JpZ3MuaW5jbHVkZXMocC5rZXkpKSBmYWRpbmdzLnNldChwLmtleSwgcC5waWVjZSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGFuaW1zOiBhbmltcyxcbiAgICBmYWRpbmdzOiBmYWRpbmdzLFxuICAgIHByb21vdGlvbnM6IHByb21vdGlvbnMsXG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0ZXAoc3RhdGU6IFN0YXRlLCBub3c6IERPTUhpZ2hSZXNUaW1lU3RhbXApOiB2b2lkIHtcbiAgY29uc3QgY3VyID0gc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQ7XG4gIGlmIChjdXIgPT09IHVuZGVmaW5lZCkge1xuICAgIC8vIGFuaW1hdGlvbiB3YXMgY2FuY2VsZWQgOihcbiAgICBpZiAoIXN0YXRlLmRvbS5kZXN0cm95ZWQpIHN0YXRlLmRvbS5yZWRyYXdOb3coKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgcmVzdCA9IDEgLSAobm93IC0gY3VyLnN0YXJ0KSAqIGN1ci5mcmVxdWVuY3k7XG4gIGlmIChyZXN0IDw9IDApIHtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20ucmVkcmF3Tm93KCk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgZWFzZSA9IGVhc2luZyhyZXN0KTtcbiAgICBmb3IgKGNvbnN0IGNmZyBvZiBjdXIucGxhbi5hbmltcy52YWx1ZXMoKSkge1xuICAgICAgY2ZnWzJdID0gY2ZnWzBdICogZWFzZTtcbiAgICAgIGNmZ1szXSA9IGNmZ1sxXSAqIGVhc2U7XG4gICAgfVxuICAgIHN0YXRlLmRvbS5yZWRyYXdOb3codHJ1ZSk7IC8vIG9wdGltaXNhdGlvbjogZG9uJ3QgcmVuZGVyIFNWRyBjaGFuZ2VzIGR1cmluZyBhbmltYXRpb25zXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKChub3cgPSBwZXJmb3JtYW5jZS5ub3coKSkgPT4gc3RlcChzdGF0ZSwgbm93KSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYW5pbWF0ZTxBPihtdXRhdGlvbjogTXV0YXRpb248QT4sIHN0YXRlOiBTdGF0ZSk6IEEge1xuICAvLyBjbG9uZSBzdGF0ZSBiZWZvcmUgbXV0YXRpbmcgaXRcbiAgY29uc3QgcHJldlBpZWNlczogc2cuUGllY2VzID0gbmV3IE1hcChzdGF0ZS5waWVjZXMpLFxuICAgIHByZXZIYW5kczogc2cuSGFuZHMgPSBuZXcgTWFwKFtcbiAgICAgIFsnc2VudGUnLCBuZXcgTWFwKHN0YXRlLmhhbmRzLmhhbmRNYXAuZ2V0KCdzZW50ZScpKV0sXG4gICAgICBbJ2dvdGUnLCBuZXcgTWFwKHN0YXRlLmhhbmRzLmhhbmRNYXAuZ2V0KCdnb3RlJykpXSxcbiAgICBdKTtcblxuICBjb25zdCByZXN1bHQgPSBtdXRhdGlvbihzdGF0ZSksXG4gICAgcGxhbiA9IGNvbXB1dGVQbGFuKHByZXZQaWVjZXMsIHByZXZIYW5kcywgc3RhdGUpO1xuICBpZiAocGxhbi5hbmltcy5zaXplIHx8IHBsYW4uZmFkaW5ncy5zaXplKSB7XG4gICAgY29uc3QgYWxyZWFkeVJ1bm5pbmcgPSBzdGF0ZS5hbmltYXRpb24uY3VycmVudD8uc3RhcnQgIT09IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHtcbiAgICAgIHN0YXJ0OiBwZXJmb3JtYW5jZS5ub3coKSxcbiAgICAgIGZyZXF1ZW5jeTogMSAvIE1hdGgubWF4KHN0YXRlLmFuaW1hdGlvbi5kdXJhdGlvbiwgMSksXG4gICAgICBwbGFuOiBwbGFuLFxuICAgIH07XG4gICAgaWYgKCFhbHJlYWR5UnVubmluZykgc3RlcChzdGF0ZSwgcGVyZm9ybWFuY2Uubm93KCkpO1xuICB9IGVsc2Uge1xuICAgIC8vIGRvbid0IGFuaW1hdGUsIGp1c3QgcmVuZGVyIHJpZ2h0IGF3YXlcbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vZ3JlLzE2NTAyOTRcbmZ1bmN0aW9uIGVhc2luZyh0OiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gdCA8IDAuNSA/IDQgKiB0ICogdCAqIHQgOiAodCAtIDEpICogKDIgKiB0IC0gMikgKiAoMiAqIHQgLSAyKSArIDE7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgeyBEcmF3U2hhcGUsIERyYXdTaGFwZVBpZWNlLCBEcmF3Q3VycmVudCB9IGZyb20gJy4vZHJhdy5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHtcbiAgY3JlYXRlRWwsXG4gIGtleTJwb3MsXG4gIHBpZWNlTmFtZU9mLFxuICBwb3NUb1RyYW5zbGF0ZVJlbCxcbiAgc2FtZVBpZWNlLFxuICB0cmFuc2xhdGVSZWwsXG4gIHBvc09mT3V0c2lkZUVsLFxuICBzZW50ZVBvdixcbn0gZnJvbSAnLi91dGlsLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNWR0VsZW1lbnQodGFnTmFtZTogc3RyaW5nKTogU1ZHRWxlbWVudCB7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgdGFnTmFtZSk7XG59XG5cbmludGVyZmFjZSBTaGFwZSB7XG4gIHNoYXBlOiBEcmF3U2hhcGU7XG4gIGhhc2g6IEhhc2g7XG4gIGN1cnJlbnQ/OiBib29sZWFuO1xufVxuXG50eXBlIEFycm93RGVzdHMgPSBNYXA8c2cuS2V5IHwgc2cuUGllY2VOYW1lLCBudW1iZXI+OyAvLyBob3cgbWFueSBhcnJvd3MgbGFuZCBvbiBhIHNxdWFyZVxuXG50eXBlIEhhc2ggPSBzdHJpbmc7XG5cbmNvbnN0IG91dHNpZGVBcnJvd0hhc2ggPSAnb3V0c2lkZUFycm93JztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclNoYXBlcyhcbiAgc3RhdGU6IFN0YXRlLFxuICBzdmc6IFNWR0VsZW1lbnQsXG4gIGN1c3RvbVN2ZzogU1ZHRWxlbWVudCxcbiAgZnJlZVBpZWNlczogSFRNTEVsZW1lbnQsXG4pOiB2b2lkIHtcbiAgY29uc3QgZCA9IHN0YXRlLmRyYXdhYmxlLFxuICAgIGN1ckQgPSBkLmN1cnJlbnQsXG4gICAgY3VyID0gY3VyRD8uZGVzdCA/IChjdXJEIGFzIERyYXdTaGFwZSkgOiB1bmRlZmluZWQsXG4gICAgb3V0c2lkZUFycm93ID0gISFjdXJEICYmICFjdXIsXG4gICAgYXJyb3dEZXN0czogQXJyb3dEZXN0cyA9IG5ldyBNYXAoKSxcbiAgICBwaWVjZU1hcCA9IG5ldyBNYXA8c2cuS2V5LCBEcmF3U2hhcGU+KCk7XG5cbiAgY29uc3QgaGFzaEJvdW5kcyA9ICgpID0+IHtcbiAgICAvLyB0b2RvIGFsc28gcG9zc2libGUgcGllY2UgYm91bmRzXG4gICAgY29uc3QgYm91bmRzID0gc3RhdGUuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKTtcbiAgICByZXR1cm4gKGJvdW5kcyAmJiBib3VuZHMud2lkdGgudG9TdHJpbmcoKSArIGJvdW5kcy5oZWlnaHQpIHx8ICcnO1xuICB9O1xuXG4gIGZvciAoY29uc3QgcyBvZiBkLnNoYXBlcy5jb25jYXQoZC5hdXRvU2hhcGVzKS5jb25jYXQoY3VyID8gW2N1cl0gOiBbXSkpIHtcbiAgICBjb25zdCBkZXN0TmFtZSA9IGlzUGllY2Uocy5kZXN0KSA/IHBpZWNlTmFtZU9mKHMuZGVzdCkgOiBzLmRlc3Q7XG4gICAgaWYgKCFzYW1lUGllY2VPcktleShzLmRlc3QsIHMub3JpZykpXG4gICAgICBhcnJvd0Rlc3RzLnNldChkZXN0TmFtZSwgKGFycm93RGVzdHMuZ2V0KGRlc3ROYW1lKSB8fCAwKSArIDEpO1xuICB9XG5cbiAgZm9yIChjb25zdCBzIG9mIGQuc2hhcGVzLmNvbmNhdChjdXIgPyBbY3VyXSA6IFtdKS5jb25jYXQoZC5hdXRvU2hhcGVzKSkge1xuICAgIGlmIChzLnBpZWNlICYmICFpc1BpZWNlKHMub3JpZykpIHBpZWNlTWFwLnNldChzLm9yaWcsIHMpO1xuICB9XG4gIGNvbnN0IHBpZWNlU2hhcGVzID0gWy4uLnBpZWNlTWFwLnZhbHVlcygpXS5tYXAoKHMpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgc2hhcGU6IHMsXG4gICAgICBoYXNoOiBzaGFwZUhhc2gocywgYXJyb3dEZXN0cywgZmFsc2UsIGhhc2hCb3VuZHMpLFxuICAgIH07XG4gIH0pO1xuXG4gIGNvbnN0IHNoYXBlczogU2hhcGVbXSA9IGQuc2hhcGVzLmNvbmNhdChkLmF1dG9TaGFwZXMpLm1hcCgoczogRHJhd1NoYXBlKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNoYXBlOiBzLFxuICAgICAgaGFzaDogc2hhcGVIYXNoKHMsIGFycm93RGVzdHMsIGZhbHNlLCBoYXNoQm91bmRzKSxcbiAgICB9O1xuICB9KTtcbiAgaWYgKGN1cilcbiAgICBzaGFwZXMucHVzaCh7XG4gICAgICBzaGFwZTogY3VyLFxuICAgICAgaGFzaDogc2hhcGVIYXNoKGN1ciwgYXJyb3dEZXN0cywgdHJ1ZSwgaGFzaEJvdW5kcyksXG4gICAgICBjdXJyZW50OiB0cnVlLFxuICAgIH0pO1xuXG4gIGNvbnN0IGZ1bGxIYXNoID0gc2hhcGVzLm1hcCgoc2MpID0+IHNjLmhhc2gpLmpvaW4oJzsnKSArIChvdXRzaWRlQXJyb3cgPyBvdXRzaWRlQXJyb3dIYXNoIDogJycpO1xuICBpZiAoZnVsbEhhc2ggPT09IHN0YXRlLmRyYXdhYmxlLnByZXZTdmdIYXNoKSByZXR1cm47XG4gIHN0YXRlLmRyYXdhYmxlLnByZXZTdmdIYXNoID0gZnVsbEhhc2g7XG5cbiAgLypcbiAgICAtLSBET00gaGllcmFyY2h5IC0tXG4gICAgPHN2ZyBjbGFzcz1cInNnLXNoYXBlc1wiPiAoPD0gc3ZnKVxuICAgICAgPGRlZnM+XG4gICAgICAgIC4uLihmb3IgYnJ1c2hlcykuLi5cbiAgICAgIDwvZGVmcz5cbiAgICAgIDxnPlxuICAgICAgICAuLi4oZm9yIGFycm93cyBhbmQgY2lyY2xlcykuLi5cbiAgICAgIDwvZz5cbiAgICA8L3N2Zz5cbiAgICA8c3ZnIGNsYXNzPVwic2ctY3VzdG9tLXN2Z3NcIj4gKDw9IGN1c3RvbVN2ZylcbiAgICAgIDxnPlxuICAgICAgICAuLi4oZm9yIGN1c3RvbSBzdmdzKS4uLlxuICAgICAgPC9nPlxuICAgIDxzZy1mcmVlLXBpZWNlcz4gKDw9IGZyZWVQaWVjZXMpXG4gICAgICAuLi4oZm9yIHBpZWNlcykuLi5cbiAgICA8L3NnLWZyZWUtcGllY2VzPlxuICAgIDwvc3ZnPlxuICAqL1xuICBjb25zdCBkZWZzRWwgPSBzdmcucXVlcnlTZWxlY3RvcignZGVmcycpIGFzIFNWR0VsZW1lbnQsXG4gICAgc2hhcGVzRWwgPSBzdmcucXVlcnlTZWxlY3RvcignZycpIGFzIFNWR0VsZW1lbnQsXG4gICAgY3VzdG9tU3Znc0VsID0gY3VzdG9tU3ZnLnF1ZXJ5U2VsZWN0b3IoJ2cnKSBhcyBTVkdFbGVtZW50O1xuXG4gIHN5bmNEZWZzKHNoYXBlcywgb3V0c2lkZUFycm93ID8gY3VyRCA6IHVuZGVmaW5lZCwgZGVmc0VsKTtcbiAgc3luY1NoYXBlcyhcbiAgICBzaGFwZXMuZmlsdGVyKChzKSA9PiAhcy5zaGFwZS5jdXN0b21TdmcgJiYgKCFzLnNoYXBlLnBpZWNlIHx8IHMuY3VycmVudCkpLFxuICAgIHNoYXBlc0VsLFxuICAgIChzaGFwZSkgPT4gcmVuZGVyU1ZHU2hhcGUoc3RhdGUsIHNoYXBlLCBhcnJvd0Rlc3RzKSxcbiAgICBvdXRzaWRlQXJyb3csXG4gICk7XG4gIHN5bmNTaGFwZXMoXG4gICAgc2hhcGVzLmZpbHRlcigocykgPT4gcy5zaGFwZS5jdXN0b21TdmcpLFxuICAgIGN1c3RvbVN2Z3NFbCxcbiAgICAoc2hhcGUpID0+IHJlbmRlclNWR1NoYXBlKHN0YXRlLCBzaGFwZSwgYXJyb3dEZXN0cyksXG4gICk7XG4gIHN5bmNTaGFwZXMocGllY2VTaGFwZXMsIGZyZWVQaWVjZXMsIChzaGFwZSkgPT4gcmVuZGVyUGllY2Uoc3RhdGUsIHNoYXBlKSk7XG5cbiAgaWYgKCFvdXRzaWRlQXJyb3cgJiYgY3VyRCkgY3VyRC5hcnJvdyA9IHVuZGVmaW5lZDtcblxuICBpZiAob3V0c2lkZUFycm93ICYmICFjdXJELmFycm93KSB7XG4gICAgY29uc3Qgb3JpZyA9IHBpZWNlT3JLZXlUb1BvcyhjdXJELm9yaWcsIHN0YXRlKTtcbiAgICBpZiAob3JpZykge1xuICAgICAgY29uc3QgZyA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnZycpLCB7XG4gICAgICAgICAgY2xhc3M6IHNoYXBlQ2xhc3MoY3VyRC5icnVzaCwgdHJ1ZSwgdHJ1ZSksXG4gICAgICAgICAgc2dIYXNoOiBvdXRzaWRlQXJyb3dIYXNoLFxuICAgICAgICB9KSxcbiAgICAgICAgZWwgPSByZW5kZXJBcnJvdyhjdXJELmJydXNoLCBvcmlnLCBvcmlnLCBzdGF0ZS5zcXVhcmVSYXRpbywgdHJ1ZSwgZmFsc2UpO1xuICAgICAgZy5hcHBlbmRDaGlsZChlbCk7XG4gICAgICBjdXJELmFycm93ID0gZWw7XG4gICAgICBzaGFwZXNFbC5hcHBlbmRDaGlsZChnKTtcbiAgICB9XG4gIH1cbn1cblxuLy8gYXBwZW5kIG9ubHkuIERvbid0IHRyeSB0byB1cGRhdGUvcmVtb3ZlLlxuZnVuY3Rpb24gc3luY0RlZnMoXG4gIHNoYXBlczogU2hhcGVbXSxcbiAgb3V0c2lkZVNoYXBlOiBEcmF3Q3VycmVudCB8IHVuZGVmaW5lZCxcbiAgZGVmc0VsOiBTVkdFbGVtZW50LFxuKTogdm9pZCB7XG4gIGNvbnN0IGJydXNoZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgZm9yIChjb25zdCBzIG9mIHNoYXBlcykge1xuICAgIGlmICghc2FtZVBpZWNlT3JLZXkocy5zaGFwZS5kZXN0LCBzLnNoYXBlLm9yaWcpKSBicnVzaGVzLmFkZChzLnNoYXBlLmJydXNoKTtcbiAgfVxuICBpZiAob3V0c2lkZVNoYXBlKSBicnVzaGVzLmFkZChvdXRzaWRlU2hhcGUuYnJ1c2gpO1xuICBjb25zdCBrZXlzSW5Eb20gPSBuZXcgU2V0KCk7XG4gIGxldCBlbDogU1ZHRWxlbWVudCB8IHVuZGVmaW5lZCA9IGRlZnNFbC5maXJzdEVsZW1lbnRDaGlsZCBhcyBTVkdFbGVtZW50O1xuICB3aGlsZSAoZWwpIHtcbiAgICBrZXlzSW5Eb20uYWRkKGVsLmdldEF0dHJpYnV0ZSgnc2dLZXknKSk7XG4gICAgZWwgPSBlbC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgU1ZHRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgfVxuICBmb3IgKGNvbnN0IGtleSBvZiBicnVzaGVzKSB7XG4gICAgY29uc3QgYnJ1c2ggPSBrZXkgfHwgJ3ByaW1hcnknO1xuICAgIGlmICgha2V5c0luRG9tLmhhcyhicnVzaCkpIGRlZnNFbC5hcHBlbmRDaGlsZChyZW5kZXJNYXJrZXIoYnJ1c2gpKTtcbiAgfVxufVxuXG4vLyBhcHBlbmQgYW5kIHJlbW92ZSBvbmx5LiBObyB1cGRhdGVzLlxuZXhwb3J0IGZ1bmN0aW9uIHN5bmNTaGFwZXMoXG4gIHNoYXBlczogU2hhcGVbXSxcbiAgcm9vdDogSFRNTEVsZW1lbnQgfCBTVkdFbGVtZW50LFxuICByZW5kZXJTaGFwZTogKHNoYXBlOiBTaGFwZSkgPT4gSFRNTEVsZW1lbnQgfCBTVkdFbGVtZW50IHwgdW5kZWZpbmVkLFxuICBvdXRzaWRlQXJyb3c/OiBib29sZWFuLFxuKTogdm9pZCB7XG4gIGNvbnN0IGhhc2hlc0luRG9tID0gbmV3IE1hcCgpLCAvLyBieSBoYXNoXG4gICAgdG9SZW1vdmU6IFNWR0VsZW1lbnRbXSA9IFtdO1xuICBmb3IgKGNvbnN0IHNjIG9mIHNoYXBlcykgaGFzaGVzSW5Eb20uc2V0KHNjLmhhc2gsIGZhbHNlKTtcbiAgaWYgKG91dHNpZGVBcnJvdykgaGFzaGVzSW5Eb20uc2V0KG91dHNpZGVBcnJvd0hhc2gsIHRydWUpO1xuICBsZXQgZWw6IFNWR0VsZW1lbnQgfCB1bmRlZmluZWQgPSByb290LmZpcnN0RWxlbWVudENoaWxkIGFzIFNWR0VsZW1lbnQsXG4gICAgZWxIYXNoOiBIYXNoO1xuICB3aGlsZSAoZWwpIHtcbiAgICBlbEhhc2ggPSBlbC5nZXRBdHRyaWJ1dGUoJ3NnSGFzaCcpITtcbiAgICAvLyBmb3VuZCBhIHNoYXBlIGVsZW1lbnQgdGhhdCdzIGhlcmUgdG8gc3RheVxuICAgIGlmIChoYXNoZXNJbkRvbS5oYXMoZWxIYXNoKSkgaGFzaGVzSW5Eb20uc2V0KGVsSGFzaCwgdHJ1ZSk7XG4gICAgLy8gb3IgcmVtb3ZlIGl0XG4gICAgZWxzZSB0b1JlbW92ZS5wdXNoKGVsKTtcbiAgICBlbCA9IGVsLm5leHRFbGVtZW50U2libGluZyBhcyBTVkdFbGVtZW50IHwgdW5kZWZpbmVkO1xuICB9XG4gIC8vIHJlbW92ZSBvbGQgc2hhcGVzXG4gIGZvciAoY29uc3QgZWwgb2YgdG9SZW1vdmUpIHJvb3QucmVtb3ZlQ2hpbGQoZWwpO1xuICAvLyBpbnNlcnQgc2hhcGVzIHRoYXQgYXJlIG5vdCB5ZXQgaW4gZG9tXG4gIGZvciAoY29uc3Qgc2Mgb2Ygc2hhcGVzKSB7XG4gICAgaWYgKCFoYXNoZXNJbkRvbS5nZXQoc2MuaGFzaCkpIHtcbiAgICAgIGNvbnN0IHNoYXBlRWwgPSByZW5kZXJTaGFwZShzYyk7XG4gICAgICBpZiAoc2hhcGVFbCkgcm9vdC5hcHBlbmRDaGlsZChzaGFwZUVsKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2hhcGVIYXNoKFxuICB7IG9yaWcsIGRlc3QsIGJydXNoLCBwaWVjZSwgY3VzdG9tU3ZnLCBkZXNjcmlwdGlvbiB9OiBEcmF3U2hhcGUsXG4gIGFycm93RGVzdHM6IEFycm93RGVzdHMsXG4gIGN1cnJlbnQ6IGJvb2xlYW4sXG4gIGJvdW5kSGFzaDogKCkgPT4gc3RyaW5nLFxuKTogSGFzaCB7XG4gIHJldHVybiBbXG4gICAgY3VycmVudCxcbiAgICAoaXNQaWVjZShvcmlnKSB8fCBpc1BpZWNlKGRlc3QpKSAmJiBib3VuZEhhc2goKSxcbiAgICBpc1BpZWNlKG9yaWcpID8gcGllY2VIYXNoKG9yaWcpIDogb3JpZyxcbiAgICBpc1BpZWNlKGRlc3QpID8gcGllY2VIYXNoKGRlc3QpIDogZGVzdCxcbiAgICBicnVzaCxcbiAgICAoYXJyb3dEZXN0cy5nZXQoaXNQaWVjZShkZXN0KSA/IHBpZWNlTmFtZU9mKGRlc3QpIDogZGVzdCkgfHwgMCkgPiAxLFxuICAgIHBpZWNlICYmIHBpZWNlSGFzaChwaWVjZSksXG4gICAgY3VzdG9tU3ZnICYmIGN1c3RvbVN2Z0hhc2goY3VzdG9tU3ZnKSxcbiAgICBkZXNjcmlwdGlvbixcbiAgXVxuICAgIC5maWx0ZXIoKHgpID0+IHgpXG4gICAgLmpvaW4oJywnKTtcbn1cblxuZnVuY3Rpb24gcGllY2VIYXNoKHBpZWNlOiBEcmF3U2hhcGVQaWVjZSk6IEhhc2gge1xuICByZXR1cm4gW3BpZWNlLmNvbG9yLCBwaWVjZS5yb2xlLCBwaWVjZS5zY2FsZV0uZmlsdGVyKCh4KSA9PiB4KS5qb2luKCcsJyk7XG59XG5cbmZ1bmN0aW9uIGN1c3RvbVN2Z0hhc2goczogc3RyaW5nKTogSGFzaCB7XG4gIC8vIFJvbGxpbmcgaGFzaCB3aXRoIGJhc2UgMzEgKGNmLiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy83NjE2NDYxL2dlbmVyYXRlLWEtaGFzaC1mcm9tLXN0cmluZy1pbi1qYXZhc2NyaXB0KVxuICBsZXQgaCA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcy5sZW5ndGg7IGkrKykge1xuICAgIGggPSAoKGggPDwgNSkgLSBoICsgcy5jaGFyQ29kZUF0KGkpKSA+Pj4gMDtcbiAgfVxuICByZXR1cm4gJ2N1c3RvbS0nICsgaC50b1N0cmluZygpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJTVkdTaGFwZShcbiAgc3RhdGU6IFN0YXRlLFxuICB7IHNoYXBlLCBjdXJyZW50LCBoYXNoIH06IFNoYXBlLFxuICBhcnJvd0Rlc3RzOiBBcnJvd0Rlc3RzLFxuKTogU1ZHRWxlbWVudCB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IG9yaWcgPSBwaWVjZU9yS2V5VG9Qb3Moc2hhcGUub3JpZywgc3RhdGUpO1xuICBpZiAoIW9yaWcpIHJldHVybjtcbiAgaWYgKHNoYXBlLmN1c3RvbVN2Zykge1xuICAgIHJldHVybiByZW5kZXJDdXN0b21Tdmcoc2hhcGUuYnJ1c2gsIHNoYXBlLmN1c3RvbVN2Zywgb3JpZywgc3RhdGUuc3F1YXJlUmF0aW8pO1xuICB9IGVsc2Uge1xuICAgIGxldCBlbDogU1ZHRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgICBjb25zdCBkZXN0ID0gIXNhbWVQaWVjZU9yS2V5KHNoYXBlLm9yaWcsIHNoYXBlLmRlc3QpICYmIHBpZWNlT3JLZXlUb1BvcyhzaGFwZS5kZXN0LCBzdGF0ZSk7XG4gICAgaWYgKGRlc3QpIHtcbiAgICAgIGVsID0gcmVuZGVyQXJyb3coXG4gICAgICAgIHNoYXBlLmJydXNoLFxuICAgICAgICBvcmlnLFxuICAgICAgICBkZXN0LFxuICAgICAgICBzdGF0ZS5zcXVhcmVSYXRpbyxcbiAgICAgICAgISFjdXJyZW50LFxuICAgICAgICAoYXJyb3dEZXN0cy5nZXQoaXNQaWVjZShzaGFwZS5kZXN0KSA/IHBpZWNlTmFtZU9mKHNoYXBlLmRlc3QpIDogc2hhcGUuZGVzdCkgfHwgMCkgPiAxLFxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKHNhbWVQaWVjZU9yS2V5KHNoYXBlLmRlc3QsIHNoYXBlLm9yaWcpKSB7XG4gICAgICBsZXQgcmF0aW86IHNnLk51bWJlclBhaXIgPSBzdGF0ZS5zcXVhcmVSYXRpbztcbiAgICAgIGlmIChpc1BpZWNlKHNoYXBlLm9yaWcpKSB7XG4gICAgICAgIGNvbnN0IHBpZWNlQm91bmRzID0gc3RhdGUuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcygpLmdldChwaWVjZU5hbWVPZihzaGFwZS5vcmlnKSksXG4gICAgICAgICAgYm91bmRzID0gc3RhdGUuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKTtcbiAgICAgICAgaWYgKHBpZWNlQm91bmRzICYmIGJvdW5kcykge1xuICAgICAgICAgIGNvbnN0IGhlaWdodEJhc2UgPSBwaWVjZUJvdW5kcy5oZWlnaHQgLyAoYm91bmRzLmhlaWdodCAvIHN0YXRlLmRpbWVuc2lvbnMucmFua3MpO1xuICAgICAgICAgIC8vIHdlIHdhbnQgdG8ga2VlcCB0aGUgcmF0aW8gdGhhdCBpcyBvbiB0aGUgYm9hcmRcbiAgICAgICAgICByYXRpbyA9IFtoZWlnaHRCYXNlICogc3RhdGUuc3F1YXJlUmF0aW9bMF0sIGhlaWdodEJhc2UgKiBzdGF0ZS5zcXVhcmVSYXRpb1sxXV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsID0gcmVuZGVyRWxsaXBzZShvcmlnLCByYXRpbywgISFjdXJyZW50KTtcbiAgICB9XG4gICAgaWYgKGVsKSB7XG4gICAgICBjb25zdCBnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdnJyksIHtcbiAgICAgICAgY2xhc3M6IHNoYXBlQ2xhc3Moc2hhcGUuYnJ1c2gsICEhY3VycmVudCwgZmFsc2UpLFxuICAgICAgICBzZ0hhc2g6IGhhc2gsXG4gICAgICB9KTtcbiAgICAgIGcuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgY29uc3QgZGVzY0VsID0gc2hhcGUuZGVzY3JpcHRpb24gJiYgcmVuZGVyRGVzY3JpcHRpb24oc3RhdGUsIHNoYXBlLCBhcnJvd0Rlc3RzKTtcbiAgICAgIGlmIChkZXNjRWwpIGcuYXBwZW5kQ2hpbGQoZGVzY0VsKTtcbiAgICAgIHJldHVybiBnO1xuICAgIH0gZWxzZSByZXR1cm47XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyQ3VzdG9tU3ZnKFxuICBicnVzaDogc3RyaW5nLFxuICBjdXN0b21Tdmc6IHN0cmluZyxcbiAgcG9zOiBzZy5Qb3MsXG4gIHJhdGlvOiBzZy5OdW1iZXJQYWlyLFxuKTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IFt4LCB5XSA9IHBvcztcblxuICAvLyBUcmFuc2xhdGUgdG8gdG9wLWxlZnQgb2YgYG9yaWdgIHNxdWFyZVxuICBjb25zdCBnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdnJyksIHsgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7eH0sJHt5fSlgIH0pO1xuXG4gIGNvbnN0IHN2ZyA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnc3ZnJyksIHtcbiAgICBjbGFzczogYnJ1c2gsXG4gICAgd2lkdGg6IHJhdGlvWzBdLFxuICAgIGhlaWdodDogcmF0aW9bMV0sXG4gICAgdmlld0JveDogYDAgMCAke3JhdGlvWzBdICogMTB9ICR7cmF0aW9bMV0gKiAxMH1gLFxuICB9KTtcblxuICBnLmFwcGVuZENoaWxkKHN2Zyk7XG4gIHN2Zy5pbm5lckhUTUwgPSBjdXN0b21Tdmc7XG5cbiAgcmV0dXJuIGc7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckVsbGlwc2UocG9zOiBzZy5Qb3MsIHJhdGlvOiBzZy5OdW1iZXJQYWlyLCBjdXJyZW50OiBib29sZWFuKTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IG8gPSBwb3MsXG4gICAgd2lkdGhzID0gZWxsaXBzZVdpZHRoKHJhdGlvKTtcbiAgcmV0dXJuIHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnZWxsaXBzZScpLCB7XG4gICAgJ3N0cm9rZS13aWR0aCc6IHdpZHRoc1tjdXJyZW50ID8gMCA6IDFdLFxuICAgIGZpbGw6ICdub25lJyxcbiAgICBjeDogb1swXSxcbiAgICBjeTogb1sxXSxcbiAgICByeDogcmF0aW9bMF0gLyAyIC0gd2lkdGhzWzFdIC8gMixcbiAgICByeTogcmF0aW9bMV0gLyAyIC0gd2lkdGhzWzFdIC8gMixcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckFycm93KFxuICBicnVzaDogc3RyaW5nLFxuICBvcmlnOiBzZy5Qb3MsXG4gIGRlc3Q6IHNnLlBvcyxcbiAgcmF0aW86IHNnLk51bWJlclBhaXIsXG4gIGN1cnJlbnQ6IGJvb2xlYW4sXG4gIHNob3J0ZW46IGJvb2xlYW4sXG4pOiBTVkdFbGVtZW50IHtcbiAgY29uc3QgbSA9IGFycm93TWFyZ2luKHNob3J0ZW4gJiYgIWN1cnJlbnQsIHJhdGlvKSxcbiAgICBhID0gb3JpZyxcbiAgICBiID0gZGVzdCxcbiAgICBkeCA9IGJbMF0gLSBhWzBdLFxuICAgIGR5ID0gYlsxXSAtIGFbMV0sXG4gICAgYW5nbGUgPSBNYXRoLmF0YW4yKGR5LCBkeCksXG4gICAgeG8gPSBNYXRoLmNvcyhhbmdsZSkgKiBtLFxuICAgIHlvID0gTWF0aC5zaW4oYW5nbGUpICogbTtcbiAgcmV0dXJuIHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnbGluZScpLCB7XG4gICAgJ3N0cm9rZS13aWR0aCc6IGxpbmVXaWR0aChjdXJyZW50LCByYXRpbyksXG4gICAgJ3N0cm9rZS1saW5lY2FwJzogJ3JvdW5kJyxcbiAgICAnbWFya2VyLWVuZCc6ICd1cmwoI2Fycm93aGVhZC0nICsgKGJydXNoIHx8ICdwcmltYXJ5JykgKyAnKScsXG4gICAgeDE6IGFbMF0sXG4gICAgeTE6IGFbMV0sXG4gICAgeDI6IGJbMF0gLSB4byxcbiAgICB5MjogYlsxXSAtIHlvLFxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclBpZWNlKHN0YXRlOiBTdGF0ZSwgeyBzaGFwZSB9OiBTaGFwZSk6IHNnLlBpZWNlTm9kZSB8IHVuZGVmaW5lZCB7XG4gIGlmICghc2hhcGUucGllY2UgfHwgaXNQaWVjZShzaGFwZS5vcmlnKSkgcmV0dXJuO1xuXG4gIGNvbnN0IG9yaWcgPSBzaGFwZS5vcmlnLFxuICAgIHNjYWxlID0gKHNoYXBlLnBpZWNlLnNjYWxlIHx8IDEpICogKHN0YXRlLnNjYWxlRG93blBpZWNlcyA/IDAuNSA6IDEpO1xuXG4gIGNvbnN0IHBpZWNlRWwgPSBjcmVhdGVFbCgncGllY2UnLCBwaWVjZU5hbWVPZihzaGFwZS5waWVjZSkpIGFzIHNnLlBpZWNlTm9kZTtcbiAgcGllY2VFbC5zZ0tleSA9IG9yaWc7XG4gIHBpZWNlRWwuc2dTY2FsZSA9IHNjYWxlO1xuICB0cmFuc2xhdGVSZWwoXG4gICAgcGllY2VFbCxcbiAgICBwb3NUb1RyYW5zbGF0ZVJlbChzdGF0ZS5kaW1lbnNpb25zKShrZXkycG9zKG9yaWcpLCBzZW50ZVBvdihzdGF0ZS5vcmllbnRhdGlvbikpLFxuICAgIHN0YXRlLnNjYWxlRG93blBpZWNlcyA/IDAuNSA6IDEsXG4gICAgc2NhbGUsXG4gICk7XG5cbiAgcmV0dXJuIHBpZWNlRWw7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckRlc2NyaXB0aW9uKFxuICBzdGF0ZTogU3RhdGUsXG4gIHNoYXBlOiBEcmF3U2hhcGUsXG4gIGFycm93RGVzdHM6IEFycm93RGVzdHMsXG4pOiBTVkdFbGVtZW50IHwgdW5kZWZpbmVkIHtcbiAgY29uc3Qgb3JpZyA9IHBpZWNlT3JLZXlUb1BvcyhzaGFwZS5vcmlnLCBzdGF0ZSk7XG4gIGlmICghb3JpZyB8fCAhc2hhcGUuZGVzY3JpcHRpb24pIHJldHVybjtcbiAgY29uc3QgZGVzdCA9ICFzYW1lUGllY2VPcktleShzaGFwZS5vcmlnLCBzaGFwZS5kZXN0KSAmJiBwaWVjZU9yS2V5VG9Qb3Moc2hhcGUuZGVzdCwgc3RhdGUpLFxuICAgIGRpZmYgPSBkZXN0ID8gW2Rlc3RbMF0gLSBvcmlnWzBdLCBkZXN0WzFdIC0gb3JpZ1sxXV0gOiBbMCwgMF0sXG4gICAgb2Zmc2V0ID1cbiAgICAgIChhcnJvd0Rlc3RzLmdldChpc1BpZWNlKHNoYXBlLmRlc3QpID8gcGllY2VOYW1lT2Yoc2hhcGUuZGVzdCkgOiBzaGFwZS5kZXN0KSB8fCAwKSA+IDFcbiAgICAgICAgPyAwLjNcbiAgICAgICAgOiAwLjE1LFxuICAgIGNsb3NlID1cbiAgICAgIChkaWZmWzBdID09PSAwIHx8IE1hdGguYWJzKGRpZmZbMF0pID09PSBzdGF0ZS5zcXVhcmVSYXRpb1swXSkgJiZcbiAgICAgIChkaWZmWzFdID09PSAwIHx8IE1hdGguYWJzKGRpZmZbMV0pID09PSBzdGF0ZS5zcXVhcmVSYXRpb1sxXSksXG4gICAgcmF0aW8gPSBkZXN0ID8gMC41NSAtIChjbG9zZSA/IG9mZnNldCA6IDApIDogMCxcbiAgICBtaWQ6IHNnLlBvcyA9IFtvcmlnWzBdICsgZGlmZlswXSAqIHJhdGlvLCBvcmlnWzFdICsgZGlmZlsxXSAqIHJhdGlvXSxcbiAgICB0ZXh0TGVuZ3RoID0gc2hhcGUuZGVzY3JpcHRpb24ubGVuZ3RoO1xuICBjb25zdCBnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdnJyksIHsgY2xhc3M6ICdkZXNjcmlwdGlvbicgfSksXG4gICAgY2lyY2xlID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdlbGxpcHNlJyksIHtcbiAgICAgIGN4OiBtaWRbMF0sXG4gICAgICBjeTogbWlkWzFdLFxuICAgICAgcng6IHRleHRMZW5ndGggKyAxLjUsXG4gICAgICByeTogMi41LFxuICAgIH0pLFxuICAgIHRleHQgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ3RleHQnKSwge1xuICAgICAgeDogbWlkWzBdLFxuICAgICAgeTogbWlkWzFdLFxuICAgICAgJ3RleHQtYW5jaG9yJzogJ21pZGRsZScsXG4gICAgICAnZG9taW5hbnQtYmFzZWxpbmUnOiAnY2VudHJhbCcsXG4gICAgfSk7XG4gIGcuYXBwZW5kQ2hpbGQoY2lyY2xlKTtcbiAgdGV4dC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzaGFwZS5kZXNjcmlwdGlvbikpO1xuICBnLmFwcGVuZENoaWxkKHRleHQpO1xuICByZXR1cm4gZztcbn1cblxuZnVuY3Rpb24gcmVuZGVyTWFya2VyKGJydXNoOiBzdHJpbmcpOiBTVkdFbGVtZW50IHtcbiAgY29uc3QgbWFya2VyID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdtYXJrZXInKSwge1xuICAgIGlkOiAnYXJyb3doZWFkLScgKyBicnVzaCxcbiAgICBvcmllbnQ6ICdhdXRvJyxcbiAgICBtYXJrZXJXaWR0aDogNCxcbiAgICBtYXJrZXJIZWlnaHQ6IDgsXG4gICAgcmVmWDogMi4wNSxcbiAgICByZWZZOiAyLjAxLFxuICB9KTtcbiAgbWFya2VyLmFwcGVuZENoaWxkKFxuICAgIHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgncGF0aCcpLCB7XG4gICAgICBkOiAnTTAsMCBWNCBMMywyIFonLFxuICAgIH0pLFxuICApO1xuICBtYXJrZXIuc2V0QXR0cmlidXRlKCdzZ0tleScsIGJydXNoKTtcbiAgcmV0dXJuIG1hcmtlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldEF0dHJpYnV0ZXMoZWw6IFNWR0VsZW1lbnQsIGF0dHJzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogU1ZHRWxlbWVudCB7XG4gIGZvciAoY29uc3Qga2V5IGluIGF0dHJzKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChhdHRycywga2V5KSkgZWwuc2V0QXR0cmlidXRlKGtleSwgYXR0cnNba2V5XSk7XG4gIH1cbiAgcmV0dXJuIGVsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcG9zMnVzZXIoXG4gIHBvczogc2cuUG9zLFxuICBjb2xvcjogc2cuQ29sb3IsXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIHJhdGlvOiBzZy5OdW1iZXJQYWlyLFxuKTogc2cuTnVtYmVyUGFpciB7XG4gIHJldHVybiBjb2xvciA9PT0gJ3NlbnRlJ1xuICAgID8gWyhkaW1zLmZpbGVzIC0gMSAtIHBvc1swXSkgKiByYXRpb1swXSwgcG9zWzFdICogcmF0aW9bMV1dXG4gICAgOiBbcG9zWzBdICogcmF0aW9bMF0sIChkaW1zLnJhbmtzIC0gMSAtIHBvc1sxXSkgKiByYXRpb1sxXV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1BpZWNlKHg6IHNnLktleSB8IHNnLlBpZWNlKTogeCBpcyBzZy5QaWVjZSB7XG4gIHJldHVybiB0eXBlb2YgeCA9PT0gJ29iamVjdCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYW1lUGllY2VPcktleShrcDE6IHNnLktleSB8IHNnLlBpZWNlLCBrcDI6IHNnLktleSB8IHNnLlBpZWNlKTogYm9vbGVhbiB7XG4gIHJldHVybiAoaXNQaWVjZShrcDEpICYmIGlzUGllY2Uoa3AyKSAmJiBzYW1lUGllY2Uoa3AxLCBrcDIpKSB8fCBrcDEgPT09IGtwMjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZXNCb3VuZHMoc2hhcGVzOiBEcmF3U2hhcGVbXSk6IGJvb2xlYW4ge1xuICByZXR1cm4gc2hhcGVzLnNvbWUoKHMpID0+IGlzUGllY2Uocy5vcmlnKSB8fCBpc1BpZWNlKHMuZGVzdCkpO1xufVxuXG5mdW5jdGlvbiBzaGFwZUNsYXNzKGJydXNoOiBzdHJpbmcsIGN1cnJlbnQ6IGJvb2xlYW4sIG91dHNpZGU6IGJvb2xlYW4pOiBzdHJpbmcge1xuICByZXR1cm4gYnJ1c2ggKyAoY3VycmVudCA/ICcgY3VycmVudCcgOiAnJykgKyAob3V0c2lkZSA/ICcgb3V0c2lkZScgOiAnJyk7XG59XG5cbmZ1bmN0aW9uIHJhdGlvQXZlcmFnZShyYXRpbzogc2cuTnVtYmVyUGFpcik6IG51bWJlciB7XG4gIHJldHVybiAocmF0aW9bMF0gKyByYXRpb1sxXSkgLyAyO1xufVxuXG5mdW5jdGlvbiBlbGxpcHNlV2lkdGgocmF0aW86IHNnLk51bWJlclBhaXIpOiBbbnVtYmVyLCBudW1iZXJdIHtcbiAgcmV0dXJuIFsoMyAvIDY0KSAqIHJhdGlvQXZlcmFnZShyYXRpbyksICg0IC8gNjQpICogcmF0aW9BdmVyYWdlKHJhdGlvKV07XG59XG5cbmZ1bmN0aW9uIGxpbmVXaWR0aChjdXJyZW50OiBib29sZWFuLCByYXRpbzogc2cuTnVtYmVyUGFpcik6IG51bWJlciB7XG4gIHJldHVybiAoKGN1cnJlbnQgPyA4LjUgOiAxMCkgLyA2NCkgKiByYXRpb0F2ZXJhZ2UocmF0aW8pO1xufVxuXG5mdW5jdGlvbiBhcnJvd01hcmdpbihzaG9ydGVuOiBib29sZWFuLCByYXRpbzogc2cuTnVtYmVyUGFpcik6IG51bWJlciB7XG4gIHJldHVybiAoKHNob3J0ZW4gPyAyMCA6IDEwKSAvIDY0KSAqIHJhdGlvQXZlcmFnZShyYXRpbyk7XG59XG5cbmZ1bmN0aW9uIHBpZWNlT3JLZXlUb1BvcyhrcDogc2cuS2V5IHwgc2cuUGllY2UsIHN0YXRlOiBTdGF0ZSk6IHNnLlBvcyB8IHVuZGVmaW5lZCB7XG4gIGlmIChpc1BpZWNlKGtwKSkge1xuICAgIGNvbnN0IHBpZWNlQm91bmRzID0gc3RhdGUuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcygpLmdldChwaWVjZU5hbWVPZihrcCkpLFxuICAgICAgYm91bmRzID0gc3RhdGUuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKSxcbiAgICAgIG9mZnNldCA9IHNlbnRlUG92KHN0YXRlLm9yaWVudGF0aW9uKSA/IFswLjUsIC0wLjVdIDogWy0wLjUsIDAuNV0sXG4gICAgICBwb3MgPVxuICAgICAgICBwaWVjZUJvdW5kcyAmJlxuICAgICAgICBib3VuZHMgJiZcbiAgICAgICAgcG9zT2ZPdXRzaWRlRWwoXG4gICAgICAgICAgcGllY2VCb3VuZHMubGVmdCArIHBpZWNlQm91bmRzLndpZHRoIC8gMixcbiAgICAgICAgICBwaWVjZUJvdW5kcy50b3AgKyBwaWVjZUJvdW5kcy5oZWlnaHQgLyAyLFxuICAgICAgICAgIHNlbnRlUG92KHN0YXRlLm9yaWVudGF0aW9uKSxcbiAgICAgICAgICBzdGF0ZS5kaW1lbnNpb25zLFxuICAgICAgICAgIGJvdW5kcyxcbiAgICAgICAgKTtcbiAgICByZXR1cm4gKFxuICAgICAgcG9zICYmXG4gICAgICBwb3MydXNlcihcbiAgICAgICAgW3Bvc1swXSArIG9mZnNldFswXSwgcG9zWzFdICsgb2Zmc2V0WzFdXSxcbiAgICAgICAgc3RhdGUub3JpZW50YXRpb24sXG4gICAgICAgIHN0YXRlLmRpbWVuc2lvbnMsXG4gICAgICAgIHN0YXRlLnNxdWFyZVJhdGlvLFxuICAgICAgKVxuICAgICk7XG4gIH0gZWxzZSByZXR1cm4gcG9zMnVzZXIoa2V5MnBvcyhrcCksIHN0YXRlLm9yaWVudGF0aW9uLCBzdGF0ZS5kaW1lbnNpb25zLCBzdGF0ZS5zcXVhcmVSYXRpbyk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IHVuc2VsZWN0LCBjYW5jZWxNb3ZlT3JEcm9wIH0gZnJvbSAnLi9ib2FyZC5qcyc7XG5pbXBvcnQge1xuICBldmVudFBvc2l0aW9uLFxuICBpc1JpZ2h0QnV0dG9uLFxuICBwb3NPZk91dHNpZGVFbCxcbiAgc2FtZVBpZWNlLFxuICBnZXRIYW5kUGllY2VBdERvbVBvcyxcbiAgZ2V0S2V5QXREb21Qb3MsXG4gIHNlbnRlUG92LFxufSBmcm9tICcuL3V0aWwuanMnO1xuaW1wb3J0IHsgaXNQaWVjZSwgcG9zMnVzZXIsIHNhbWVQaWVjZU9yS2V5LCBzZXRBdHRyaWJ1dGVzIH0gZnJvbSAnLi9zaGFwZXMuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdTaGFwZSB7XG4gIG9yaWc6IHNnLktleSB8IHNnLlBpZWNlO1xuICBkZXN0OiBzZy5LZXkgfCBzZy5QaWVjZTtcbiAgcGllY2U/OiBEcmF3U2hhcGVQaWVjZTtcbiAgY3VzdG9tU3ZnPzogc3RyaW5nOyAvLyBzdmdcbiAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG4gIGJydXNoOiBzdHJpbmc7IC8vIGNzcyBjbGFzcyB0byBiZSBhcHBlbmRlZFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNxdWFyZUhpZ2hsaWdodCB7XG4gIGtleTogc2cuS2V5O1xuICBjbGFzc05hbWU6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEcmF3U2hhcGVQaWVjZSB7XG4gIHJvbGU6IHNnLlJvbGVTdHJpbmc7XG4gIGNvbG9yOiBzZy5Db2xvcjtcbiAgc2NhbGU/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd2FibGUge1xuICBlbmFibGVkOiBib29sZWFuOyAvLyBjYW4gZHJhd1xuICB2aXNpYmxlOiBib29sZWFuOyAvLyBjYW4gdmlld1xuICBmb3JjZWQ6IGJvb2xlYW47IC8vIGNhbiBvbmx5IGRyYXdcbiAgZXJhc2VPbkNsaWNrOiBib29sZWFuO1xuICBvbkNoYW5nZT86IChzaGFwZXM6IERyYXdTaGFwZVtdKSA9PiB2b2lkO1xuICBzaGFwZXM6IERyYXdTaGFwZVtdOyAvLyB1c2VyIHNoYXBlc1xuICBhdXRvU2hhcGVzOiBEcmF3U2hhcGVbXTsgLy8gY29tcHV0ZXIgc2hhcGVzXG4gIHNxdWFyZXM6IFNxdWFyZUhpZ2hsaWdodFtdO1xuICBjdXJyZW50PzogRHJhd0N1cnJlbnQ7XG4gIHByZXZTdmdIYXNoOiBzdHJpbmc7XG4gIHBpZWNlPzogc2cuUGllY2U7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd0N1cnJlbnQge1xuICBvcmlnOiBzZy5LZXkgfCBzZy5QaWVjZTtcbiAgZGVzdD86IHNnLktleSB8IHNnLlBpZWNlOyAvLyB1bmRlZmluZWQgaWYgb3V0c2lkZSBib2FyZC9oYW5kc1xuICBhcnJvdz86IFNWR0VsZW1lbnQ7XG4gIHBpZWNlPzogc2cuUGllY2U7XG4gIHBvczogc2cuTnVtYmVyUGFpcjtcbiAgYnJ1c2g6IHN0cmluZzsgLy8gYnJ1c2ggbmFtZSBmb3Igc2hhcGVcbn1cblxuY29uc3QgYnJ1c2hlcyA9IFsncHJpbWFyeScsICdhbHRlcm5hdGl2ZTAnLCAnYWx0ZXJuYXRpdmUxJywgJ2FsdGVybmF0aXZlMiddO1xuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnQoc3RhdGU6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIC8vIHN1cHBvcnQgb25lIGZpbmdlciB0b3VjaCBvbmx5XG4gIGlmIChlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDEpIHJldHVybjtcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gIGlmIChlLmN0cmxLZXkpIHVuc2VsZWN0KHN0YXRlKTtcbiAgZWxzZSBjYW5jZWxNb3ZlT3JEcm9wKHN0YXRlKTtcblxuICBjb25zdCBwb3MgPSBldmVudFBvc2l0aW9uKGUpLFxuICAgIGJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCksXG4gICAgb3JpZyA9XG4gICAgICBwb3MgJiYgYm91bmRzICYmIGdldEtleUF0RG9tUG9zKHBvcywgc2VudGVQb3Yoc3RhdGUub3JpZW50YXRpb24pLCBzdGF0ZS5kaW1lbnNpb25zLCBib3VuZHMpLFxuICAgIHBpZWNlID0gc3RhdGUuZHJhd2FibGUucGllY2U7XG4gIGlmICghb3JpZykgcmV0dXJuO1xuICBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50ID0ge1xuICAgIG9yaWcsXG4gICAgZGVzdDogdW5kZWZpbmVkLFxuICAgIHBvcyxcbiAgICBwaWVjZSxcbiAgICBicnVzaDogZXZlbnRCcnVzaChlLCBpc1JpZ2h0QnV0dG9uKGUpIHx8IHN0YXRlLmRyYXdhYmxlLmZvcmNlZCksXG4gIH07XG4gIHByb2Nlc3NEcmF3KHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0RnJvbUhhbmQoc3RhdGU6IFN0YXRlLCBwaWVjZTogc2cuUGllY2UsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgLy8gc3VwcG9ydCBvbmUgZmluZ2VyIHRvdWNoIG9ubHlcbiAgaWYgKGUudG91Y2hlcyAmJiBlLnRvdWNoZXMubGVuZ3RoID4gMSkgcmV0dXJuO1xuICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgaWYgKGUuY3RybEtleSkgdW5zZWxlY3Qoc3RhdGUpO1xuICBlbHNlIGNhbmNlbE1vdmVPckRyb3Aoc3RhdGUpO1xuXG4gIGNvbnN0IHBvcyA9IGV2ZW50UG9zaXRpb24oZSk7XG4gIGlmICghcG9zKSByZXR1cm47XG4gIHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQgPSB7XG4gICAgb3JpZzogcGllY2UsXG4gICAgZGVzdDogdW5kZWZpbmVkLFxuICAgIHBvcyxcbiAgICBicnVzaDogZXZlbnRCcnVzaChlLCBpc1JpZ2h0QnV0dG9uKGUpIHx8IHN0YXRlLmRyYXdhYmxlLmZvcmNlZCksXG4gIH07XG4gIHByb2Nlc3NEcmF3KHN0YXRlKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0RyYXcoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgY29uc3QgY3VyID0gc3RhdGUuZHJhd2FibGUuY3VycmVudCxcbiAgICAgIGJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gICAgaWYgKGN1ciAmJiBib3VuZHMpIHtcbiAgICAgIGNvbnN0IGRlc3QgPVxuICAgICAgICBnZXRLZXlBdERvbVBvcyhjdXIucG9zLCBzZW50ZVBvdihzdGF0ZS5vcmllbnRhdGlvbiksIHN0YXRlLmRpbWVuc2lvbnMsIGJvdW5kcykgfHxcbiAgICAgICAgZ2V0SGFuZFBpZWNlQXREb21Qb3MoY3VyLnBvcywgc3RhdGUuaGFuZHMucm9sZXMsIHN0YXRlLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMoKSk7XG4gICAgICBpZiAoY3VyLmRlc3QgIT09IGRlc3QgJiYgIShjdXIuZGVzdCAmJiBkZXN0ICYmIHNhbWVQaWVjZU9yS2V5KGRlc3QsIGN1ci5kZXN0KSkpIHtcbiAgICAgICAgY3VyLmRlc3QgPSBkZXN0O1xuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3Tm93KCk7XG4gICAgICB9XG4gICAgICBjb25zdCBvdXRQb3MgPSBwb3NPZk91dHNpZGVFbChcbiAgICAgICAgY3VyLnBvc1swXSxcbiAgICAgICAgY3VyLnBvc1sxXSxcbiAgICAgICAgc2VudGVQb3Yoc3RhdGUub3JpZW50YXRpb24pLFxuICAgICAgICBzdGF0ZS5kaW1lbnNpb25zLFxuICAgICAgICBib3VuZHMsXG4gICAgICApO1xuICAgICAgaWYgKCFjdXIuZGVzdCAmJiBjdXIuYXJyb3cgJiYgb3V0UG9zKSB7XG4gICAgICAgIGNvbnN0IGRlc3QgPSBwb3MydXNlcihvdXRQb3MsIHN0YXRlLm9yaWVudGF0aW9uLCBzdGF0ZS5kaW1lbnNpb25zLCBzdGF0ZS5zcXVhcmVSYXRpbyk7XG5cbiAgICAgICAgc2V0QXR0cmlidXRlcyhjdXIuYXJyb3csIHtcbiAgICAgICAgICB4MjogZGVzdFswXSAtIHN0YXRlLnNxdWFyZVJhdGlvWzBdIC8gMixcbiAgICAgICAgICB5MjogZGVzdFsxXSAtIHN0YXRlLnNxdWFyZVJhdGlvWzFdIC8gMixcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBwcm9jZXNzRHJhdyhzdGF0ZSk7XG4gICAgfVxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmUoc3RhdGU6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGlmIChzdGF0ZS5kcmF3YWJsZS5jdXJyZW50KSBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50LnBvcyA9IGV2ZW50UG9zaXRpb24oZSkhO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5kKHN0YXRlOiBTdGF0ZSwgXzogc2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICBjb25zdCBjdXIgPSBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50O1xuICBpZiAoY3VyKSB7XG4gICAgYWRkU2hhcGUoc3RhdGUuZHJhd2FibGUsIGN1cik7XG4gICAgY2FuY2VsKHN0YXRlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBpZiAoc3RhdGUuZHJhd2FibGUuY3VycmVudCkge1xuICAgIHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhcihzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgY29uc3QgZHJhd2FibGVMZW5ndGggPSBzdGF0ZS5kcmF3YWJsZS5zaGFwZXMubGVuZ3RoO1xuICBpZiAoZHJhd2FibGVMZW5ndGggfHwgc3RhdGUuZHJhd2FibGUucGllY2UpIHtcbiAgICBzdGF0ZS5kcmF3YWJsZS5zaGFwZXMgPSBbXTtcbiAgICBzdGF0ZS5kcmF3YWJsZS5waWVjZSA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgaWYgKGRyYXdhYmxlTGVuZ3RoKSBvbkNoYW5nZShzdGF0ZS5kcmF3YWJsZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldERyYXdQaWVjZShzdGF0ZTogU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSk6IHZvaWQge1xuICBpZiAoc3RhdGUuZHJhd2FibGUucGllY2UgJiYgc2FtZVBpZWNlKHN0YXRlLmRyYXdhYmxlLnBpZWNlLCBwaWVjZSkpXG4gICAgc3RhdGUuZHJhd2FibGUucGllY2UgPSB1bmRlZmluZWQ7XG4gIGVsc2Ugc3RhdGUuZHJhd2FibGUucGllY2UgPSBwaWVjZTtcbiAgc3RhdGUuZG9tLnJlZHJhdygpO1xufVxuXG5mdW5jdGlvbiBldmVudEJydXNoKGU6IHNnLk1vdWNoRXZlbnQsIGFsbG93Rmlyc3RNb2RpZmllcjogYm9vbGVhbik6IHN0cmluZyB7XG4gIGNvbnN0IG1vZEEgPSBhbGxvd0ZpcnN0TW9kaWZpZXIgJiYgKGUuc2hpZnRLZXkgfHwgZS5jdHJsS2V5KSxcbiAgICBtb2RCID0gZS5hbHRLZXkgfHwgZS5tZXRhS2V5IHx8IGUuZ2V0TW9kaWZpZXJTdGF0ZT8uKCdBbHRHcmFwaCcpO1xuICByZXR1cm4gYnJ1c2hlc1sobW9kQSA/IDEgOiAwKSArIChtb2RCID8gMiA6IDApXTtcbn1cblxuZnVuY3Rpb24gYWRkU2hhcGUoZHJhd2FibGU6IERyYXdhYmxlLCBjdXI6IERyYXdDdXJyZW50KTogdm9pZCB7XG4gIGlmICghY3VyLmRlc3QpIHJldHVybjtcblxuICBjb25zdCBzaW1pbGFyU2hhcGUgPSAoczogRHJhd1NoYXBlKSA9PlxuICAgIGN1ci5kZXN0ICYmIHNhbWVQaWVjZU9yS2V5KGN1ci5vcmlnLCBzLm9yaWcpICYmIHNhbWVQaWVjZU9yS2V5KGN1ci5kZXN0LCBzLmRlc3QpO1xuXG4gIC8vIHNlcGFyYXRlIHNoYXBlIGZvciBwaWVjZXNcbiAgY29uc3QgcGllY2UgPSBjdXIucGllY2U7XG4gIGN1ci5waWVjZSA9IHVuZGVmaW5lZDtcblxuICBjb25zdCBzaW1pbGFyID0gZHJhd2FibGUuc2hhcGVzLmZpbmQoc2ltaWxhclNoYXBlKSxcbiAgICByZW1vdmVQaWVjZSA9IGRyYXdhYmxlLnNoYXBlcy5maW5kKFxuICAgICAgKHMpID0+IHNpbWlsYXJTaGFwZShzKSAmJiBwaWVjZSAmJiBzLnBpZWNlICYmIHNhbWVQaWVjZShwaWVjZSwgcy5waWVjZSksXG4gICAgKSxcbiAgICBkaWZmUGllY2UgPSBkcmF3YWJsZS5zaGFwZXMuZmluZChcbiAgICAgIChzKSA9PiBzaW1pbGFyU2hhcGUocykgJiYgcGllY2UgJiYgcy5waWVjZSAmJiAhc2FtZVBpZWNlKHBpZWNlLCBzLnBpZWNlKSxcbiAgICApO1xuXG4gIC8vIHJlbW92ZSBldmVyeSBzaW1pbGFyIHNoYXBlXG4gIGlmIChzaW1pbGFyKSBkcmF3YWJsZS5zaGFwZXMgPSBkcmF3YWJsZS5zaGFwZXMuZmlsdGVyKChzKSA9PiAhc2ltaWxhclNoYXBlKHMpKTtcblxuICBpZiAoIWlzUGllY2UoY3VyLm9yaWcpICYmIHBpZWNlICYmICFyZW1vdmVQaWVjZSkge1xuICAgIGRyYXdhYmxlLnNoYXBlcy5wdXNoKHsgb3JpZzogY3VyLm9yaWcsIGRlc3Q6IGN1ci5vcmlnLCBwaWVjZTogcGllY2UsIGJydXNoOiBjdXIuYnJ1c2ggfSk7XG4gICAgLy8gZm9yY2UgY2lyY2xlIGFyb3VuZCBkcmF3biBwaWVjZXNcbiAgICBpZiAoIXNhbWVQaWVjZU9yS2V5KGN1ci5vcmlnLCBjdXIuZGVzdCkpXG4gICAgICBkcmF3YWJsZS5zaGFwZXMucHVzaCh7IG9yaWc6IGN1ci5vcmlnLCBkZXN0OiBjdXIub3JpZywgYnJ1c2g6IGN1ci5icnVzaCB9KTtcbiAgfVxuXG4gIGlmICghc2ltaWxhciB8fCBkaWZmUGllY2UgfHwgc2ltaWxhci5icnVzaCAhPT0gY3VyLmJydXNoKSBkcmF3YWJsZS5zaGFwZXMucHVzaChjdXIgYXMgRHJhd1NoYXBlKTtcbiAgb25DaGFuZ2UoZHJhd2FibGUpO1xufVxuXG5mdW5jdGlvbiBvbkNoYW5nZShkcmF3YWJsZTogRHJhd2FibGUpOiB2b2lkIHtcbiAgaWYgKGRyYXdhYmxlLm9uQ2hhbmdlKSBkcmF3YWJsZS5vbkNoYW5nZShkcmF3YWJsZS5zaGFwZXMpO1xufVxuIiwgImltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgKiBhcyBib2FyZCBmcm9tICcuL2JvYXJkLmpzJztcbmltcG9ydCB7IGFkZFRvSGFuZCwgcmVtb3ZlRnJvbUhhbmQgfSBmcm9tICcuL2hhbmRzLmpzJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsLmpzJztcbmltcG9ydCB7IGNsZWFyIGFzIGRyYXdDbGVhciB9IGZyb20gJy4vZHJhdy5qcyc7XG5pbXBvcnQgeyBhbmltIH0gZnJvbSAnLi9hbmltLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBEcmFnQ3VycmVudCB7XG4gIHBpZWNlOiBzZy5QaWVjZTsgLy8gcGllY2UgYmVpbmcgZHJhZ2dlZFxuICBwb3M6IHNnLk51bWJlclBhaXI7IC8vIGxhdGVzdCBldmVudCBwb3NpdGlvblxuICBvcmlnUG9zOiBzZy5OdW1iZXJQYWlyOyAvLyBmaXJzdCBldmVudCBwb3NpdGlvblxuICBzdGFydGVkOiBib29sZWFuOyAvLyB3aGV0aGVyIHRoZSBkcmFnIGhhcyBzdGFydGVkOyBhcyBwZXIgdGhlIGRpc3RhbmNlIHNldHRpbmdcbiAgc3BhcmU6IGJvb2xlYW47IC8vIHdoZXRoZXIgdGhpcyBwaWVjZSBpcyBhIHNwYXJlIG9uZVxuICB0b3VjaDogYm9vbGVhbjsgLy8gd2FzIHRoZSBkcmFnZ2luZyBpbml0aWF0ZWQgZnJvbSB0b3VjaCBldmVudFxuICBvcmlnaW5UYXJnZXQ6IEV2ZW50VGFyZ2V0IHwgbnVsbDtcbiAgZnJvbUJvYXJkPzoge1xuICAgIG9yaWc6IHNnLktleTsgLy8gb3JpZyBrZXkgb2YgZHJhZ2dpbmcgcGllY2VcbiAgICBwcmV2aW91c2x5U2VsZWN0ZWQ/OiBzZy5LZXk7IC8vIHNlbGVjdGVkIHBpZWNlIGJlZm9yZSBkcmFnIGJlZ2FuXG4gICAga2V5SGFzQ2hhbmdlZDogYm9vbGVhbjsgLy8gd2hldGhlciB0aGUgZHJhZyBoYXMgbGVmdCB0aGUgb3JpZyBrZXkgb3IgcGllY2VcbiAgfTtcbiAgZnJvbU91dHNpZGU/OiB7XG4gICAgb3JpZ2luQm91bmRzOiBET01SZWN0IHwgdW5kZWZpbmVkOyAvLyBib3VuZHMgb2YgdGhlIHBpZWNlIHRoYXQgaW5pdGlhdGVkIHRoZSBkcmFnXG4gICAgbGVmdE9yaWdpbjogYm9vbGVhbjsgLy8gaGF2ZSB3ZSBldmVyIGxlZnQgb3JpZ2luQm91bmRzXG4gICAgcHJldmlvdXNseVNlbGVjdGVkUGllY2U/OiBzZy5QaWVjZTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0KHM6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGNvbnN0IGJvdW5kcyA9IHMuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKSxcbiAgICBwb3NpdGlvbiA9IHV0aWwuZXZlbnRQb3NpdGlvbihlKSxcbiAgICBvcmlnID1cbiAgICAgIGJvdW5kcyAmJlxuICAgICAgcG9zaXRpb24gJiZcbiAgICAgIHV0aWwuZ2V0S2V5QXREb21Qb3MocG9zaXRpb24sIHV0aWwuc2VudGVQb3Yocy5vcmllbnRhdGlvbiksIHMuZGltZW5zaW9ucywgYm91bmRzKTtcblxuICBpZiAoIW9yaWcpIHJldHVybjtcblxuICBjb25zdCBwaWVjZSA9IHMucGllY2VzLmdldChvcmlnKSxcbiAgICBwcmV2aW91c2x5U2VsZWN0ZWQgPSBzLnNlbGVjdGVkO1xuICBpZiAoXG4gICAgIXByZXZpb3VzbHlTZWxlY3RlZCAmJlxuICAgIHMuZHJhd2FibGUuZW5hYmxlZCAmJlxuICAgIChzLmRyYXdhYmxlLmVyYXNlT25DbGljayB8fCAhcGllY2UgfHwgcGllY2UuY29sb3IgIT09IHMudHVybkNvbG9yKVxuICApXG4gICAgZHJhd0NsZWFyKHMpO1xuXG4gIC8vIFByZXZlbnQgdG91Y2ggc2Nyb2xsIGFuZCBjcmVhdGUgbm8gY29ycmVzcG9uZGluZyBtb3VzZSBldmVudCwgaWYgdGhlcmVcbiAgLy8gaXMgYW4gaW50ZW50IHRvIGludGVyYWN0IHdpdGggdGhlIGJvYXJkLlxuICBpZiAoXG4gICAgZS5jYW5jZWxhYmxlICE9PSBmYWxzZSAmJlxuICAgICghZS50b3VjaGVzIHx8XG4gICAgICBzLmJsb2NrVG91Y2hTY3JvbGwgfHxcbiAgICAgIHMuc2VsZWN0ZWRQaWVjZSB8fFxuICAgICAgcGllY2UgfHxcbiAgICAgIHByZXZpb3VzbHlTZWxlY3RlZCB8fFxuICAgICAgcGllY2VDbG9zZVRvKHMsIHBvc2l0aW9uLCBib3VuZHMpKVxuICApXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICBjb25zdCBoYWRQcmVtb3ZlID0gISFzLnByZW1vdmFibGUuY3VycmVudDtcbiAgY29uc3QgaGFkUHJlZHJvcCA9ICEhcy5wcmVkcm9wcGFibGUuY3VycmVudDtcbiAgaWYgKHMuc2VsZWN0YWJsZS5kZWxldGVPblRvdWNoKSBib2FyZC5kZWxldGVQaWVjZShzLCBvcmlnKTtcbiAgZWxzZSBpZiAocy5zZWxlY3RlZCkge1xuICAgIGlmICghYm9hcmQucHJvbW90aW9uRGlhbG9nTW92ZShzLCBzLnNlbGVjdGVkLCBvcmlnKSkge1xuICAgICAgaWYgKGJvYXJkLmNhbk1vdmUocywgcy5zZWxlY3RlZCwgb3JpZykpIGFuaW0oKHN0YXRlKSA9PiBib2FyZC5zZWxlY3RTcXVhcmUoc3RhdGUsIG9yaWcpLCBzKTtcbiAgICAgIGVsc2UgYm9hcmQuc2VsZWN0U3F1YXJlKHMsIG9yaWcpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChzLnNlbGVjdGVkUGllY2UpIHtcbiAgICBpZiAoIWJvYXJkLnByb21vdGlvbkRpYWxvZ0Ryb3Aocywgcy5zZWxlY3RlZFBpZWNlLCBvcmlnKSkge1xuICAgICAgaWYgKGJvYXJkLmNhbkRyb3Aocywgcy5zZWxlY3RlZFBpZWNlLCBvcmlnKSlcbiAgICAgICAgYW5pbSgoc3RhdGUpID0+IGJvYXJkLnNlbGVjdFNxdWFyZShzdGF0ZSwgb3JpZyksIHMpO1xuICAgICAgZWxzZSBib2FyZC5zZWxlY3RTcXVhcmUocywgb3JpZyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGJvYXJkLnNlbGVjdFNxdWFyZShzLCBvcmlnKTtcbiAgfVxuXG4gIGNvbnN0IHN0aWxsU2VsZWN0ZWQgPSBzLnNlbGVjdGVkID09PSBvcmlnLFxuICAgIGRyYWdnZWRFbCA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkPy5kcmFnZ2VkO1xuXG4gIGlmIChwaWVjZSAmJiBkcmFnZ2VkRWwgJiYgc3RpbGxTZWxlY3RlZCAmJiBib2FyZC5pc0RyYWdnYWJsZShzLCBwaWVjZSkpIHtcbiAgICBjb25zdCB0b3VjaCA9IGUudHlwZSA9PT0gJ3RvdWNoc3RhcnQnO1xuXG4gICAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHtcbiAgICAgIHBpZWNlLFxuICAgICAgcG9zOiBwb3NpdGlvbixcbiAgICAgIG9yaWdQb3M6IHBvc2l0aW9uLFxuICAgICAgc3RhcnRlZDogcy5kcmFnZ2FibGUuYXV0b0Rpc3RhbmNlICYmICF0b3VjaCxcbiAgICAgIHNwYXJlOiBmYWxzZSxcbiAgICAgIHRvdWNoLFxuICAgICAgb3JpZ2luVGFyZ2V0OiBlLnRhcmdldCxcbiAgICAgIGZyb21Cb2FyZDoge1xuICAgICAgICBvcmlnLFxuICAgICAgICBwcmV2aW91c2x5U2VsZWN0ZWQsXG4gICAgICAgIGtleUhhc0NoYW5nZWQ6IGZhbHNlLFxuICAgICAgfSxcbiAgICB9O1xuXG4gICAgZHJhZ2dlZEVsLnNnQ29sb3IgPSBwaWVjZS5jb2xvcjtcbiAgICBkcmFnZ2VkRWwuc2dSb2xlID0gcGllY2Uucm9sZTtcbiAgICBkcmFnZ2VkRWwuY2xhc3NOYW1lID0gYGRyYWdnaW5nICR7dXRpbC5waWVjZU5hbWVPZihwaWVjZSl9YDtcbiAgICBkcmFnZ2VkRWwuY2xhc3NMaXN0LnRvZ2dsZSgndG91Y2gnLCB0b3VjaCk7XG5cbiAgICBwcm9jZXNzRHJhZyhzKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoaGFkUHJlbW92ZSkgYm9hcmQudW5zZXRQcmVtb3ZlKHMpO1xuICAgIGlmIChoYWRQcmVkcm9wKSBib2FyZC51bnNldFByZWRyb3Aocyk7XG4gIH1cbiAgcy5kb20ucmVkcmF3KCk7XG59XG5cbmZ1bmN0aW9uIHBpZWNlQ2xvc2VUbyhzOiBTdGF0ZSwgcG9zOiBzZy5OdW1iZXJQYWlyLCBib3VuZHM6IERPTVJlY3QpOiBib29sZWFuIHtcbiAgY29uc3QgYXNTZW50ZSA9IHV0aWwuc2VudGVQb3Yocy5vcmllbnRhdGlvbiksXG4gICAgcmFkaXVzU3EgPSBNYXRoLnBvdyhib3VuZHMud2lkdGggLyBzLmRpbWVuc2lvbnMuZmlsZXMsIDIpO1xuICBmb3IgKGNvbnN0IGtleSBvZiBzLnBpZWNlcy5rZXlzKCkpIHtcbiAgICBjb25zdCBjZW50ZXIgPSB1dGlsLmNvbXB1dGVTcXVhcmVDZW50ZXIoa2V5LCBhc1NlbnRlLCBzLmRpbWVuc2lvbnMsIGJvdW5kcyk7XG4gICAgaWYgKHV0aWwuZGlzdGFuY2VTcShjZW50ZXIsIHBvcykgPD0gcmFkaXVzU3EpIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRyYWdOZXdQaWVjZShzOiBTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBlOiBzZy5Nb3VjaEV2ZW50LCBzcGFyZT86IGJvb2xlYW4pOiB2b2lkIHtcbiAgY29uc3QgcHJldmlvdXNseVNlbGVjdGVkUGllY2UgPSBzLnNlbGVjdGVkUGllY2UsXG4gICAgZHJhZ2dlZEVsID0gcy5kb20uZWxlbWVudHMuYm9hcmQ/LmRyYWdnZWQsXG4gICAgcG9zaXRpb24gPSB1dGlsLmV2ZW50UG9zaXRpb24oZSksXG4gICAgdG91Y2ggPSBlLnR5cGUgPT09ICd0b3VjaHN0YXJ0JztcblxuICBpZiAoIXByZXZpb3VzbHlTZWxlY3RlZFBpZWNlICYmICFzcGFyZSAmJiBzLmRyYXdhYmxlLmVuYWJsZWQgJiYgcy5kcmF3YWJsZS5lcmFzZU9uQ2xpY2spXG4gICAgZHJhd0NsZWFyKHMpO1xuXG4gIGlmICghc3BhcmUgJiYgcy5zZWxlY3RhYmxlLmRlbGV0ZU9uVG91Y2gpIHJlbW92ZUZyb21IYW5kKHMsIHBpZWNlKTtcbiAgZWxzZSBib2FyZC5zZWxlY3RQaWVjZShzLCBwaWVjZSwgc3BhcmUpO1xuXG4gIGNvbnN0IGhhZFByZW1vdmUgPSAhIXMucHJlbW92YWJsZS5jdXJyZW50LFxuICAgIGhhZFByZWRyb3AgPSAhIXMucHJlZHJvcHBhYmxlLmN1cnJlbnQsXG4gICAgc3RpbGxTZWxlY3RlZCA9IHMuc2VsZWN0ZWRQaWVjZSAmJiB1dGlsLnNhbWVQaWVjZShzLnNlbGVjdGVkUGllY2UsIHBpZWNlKTtcblxuICBpZiAoZHJhZ2dlZEVsICYmIHBvc2l0aW9uICYmIHMuc2VsZWN0ZWRQaWVjZSAmJiBzdGlsbFNlbGVjdGVkICYmIGJvYXJkLmlzRHJhZ2dhYmxlKHMsIHBpZWNlKSkge1xuICAgIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB7XG4gICAgICBwaWVjZTogcy5zZWxlY3RlZFBpZWNlLFxuICAgICAgcG9zOiBwb3NpdGlvbixcbiAgICAgIG9yaWdQb3M6IHBvc2l0aW9uLFxuICAgICAgdG91Y2gsXG4gICAgICBzdGFydGVkOiBzLmRyYWdnYWJsZS5hdXRvRGlzdGFuY2UgJiYgIXRvdWNoLFxuICAgICAgc3BhcmU6ICEhc3BhcmUsXG4gICAgICBvcmlnaW5UYXJnZXQ6IGUudGFyZ2V0LFxuICAgICAgZnJvbU91dHNpZGU6IHtcbiAgICAgICAgb3JpZ2luQm91bmRzOiAhc3BhcmVcbiAgICAgICAgICA/IHMuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcygpLmdldCh1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKSlcbiAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgbGVmdE9yaWdpbjogZmFsc2UsXG4gICAgICAgIHByZXZpb3VzbHlTZWxlY3RlZFBpZWNlOiAhc3BhcmUgPyBwcmV2aW91c2x5U2VsZWN0ZWRQaWVjZSA6IHVuZGVmaW5lZCxcbiAgICAgIH0sXG4gICAgfTtcblxuICAgIGRyYWdnZWRFbC5zZ0NvbG9yID0gcGllY2UuY29sb3I7XG4gICAgZHJhZ2dlZEVsLnNnUm9sZSA9IHBpZWNlLnJvbGU7XG4gICAgZHJhZ2dlZEVsLmNsYXNzTmFtZSA9IGBkcmFnZ2luZyAke3V0aWwucGllY2VOYW1lT2YocGllY2UpfWA7XG4gICAgZHJhZ2dlZEVsLmNsYXNzTGlzdC50b2dnbGUoJ3RvdWNoJywgdG91Y2gpO1xuXG4gICAgcHJvY2Vzc0RyYWcocyk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGhhZFByZW1vdmUpIGJvYXJkLnVuc2V0UHJlbW92ZShzKTtcbiAgICBpZiAoaGFkUHJlZHJvcCkgYm9hcmQudW5zZXRQcmVkcm9wKHMpO1xuICB9XG4gIHMuZG9tLnJlZHJhdygpO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzRHJhZyhzOiBTdGF0ZSk6IHZvaWQge1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIGNvbnN0IGN1ciA9IHMuZHJhZ2dhYmxlLmN1cnJlbnQsXG4gICAgICBkcmFnZ2VkRWwgPSBzLmRvbS5lbGVtZW50cy5ib2FyZD8uZHJhZ2dlZCxcbiAgICAgIGJvdW5kcyA9IHMuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKTtcbiAgICBpZiAoIWN1ciB8fCAhZHJhZ2dlZEVsIHx8ICFib3VuZHMpIHJldHVybjtcbiAgICAvLyBjYW5jZWwgYW5pbWF0aW9ucyB3aGlsZSBkcmFnZ2luZ1xuICAgIGlmIChjdXIuZnJvbUJvYXJkPy5vcmlnICYmIHMuYW5pbWF0aW9uLmN1cnJlbnQ/LnBsYW4uYW5pbXMuaGFzKGN1ci5mcm9tQm9hcmQub3JpZykpXG4gICAgICBzLmFuaW1hdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIC8vIGlmIG1vdmluZyBwaWVjZSBpcyBnb25lLCBjYW5jZWxcbiAgICBjb25zdCBvcmlnUGllY2UgPSBjdXIuZnJvbUJvYXJkID8gcy5waWVjZXMuZ2V0KGN1ci5mcm9tQm9hcmQub3JpZykgOiBjdXIucGllY2U7XG4gICAgaWYgKCFvcmlnUGllY2UgfHwgIXV0aWwuc2FtZVBpZWNlKG9yaWdQaWVjZSwgY3VyLnBpZWNlKSkgY2FuY2VsKHMpO1xuICAgIGVsc2Uge1xuICAgICAgaWYgKFxuICAgICAgICAhY3VyLnN0YXJ0ZWQgJiZcbiAgICAgICAgdXRpbC5kaXN0YW5jZVNxKGN1ci5wb3MsIGN1ci5vcmlnUG9zKSA+PSBNYXRoLnBvdyhzLmRyYWdnYWJsZS5kaXN0YW5jZSwgMilcbiAgICAgICkge1xuICAgICAgICBjdXIuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgIHMuZG9tLnJlZHJhdygpO1xuICAgICAgfVxuICAgICAgaWYgKGN1ci5zdGFydGVkKSB7XG4gICAgICAgIHV0aWwudHJhbnNsYXRlQWJzKFxuICAgICAgICAgIGRyYWdnZWRFbCxcbiAgICAgICAgICBbXG4gICAgICAgICAgICBjdXIucG9zWzBdIC0gYm91bmRzLmxlZnQgLSBib3VuZHMud2lkdGggLyAocy5kaW1lbnNpb25zLmZpbGVzICogMiksXG4gICAgICAgICAgICBjdXIucG9zWzFdIC0gYm91bmRzLnRvcCAtIGJvdW5kcy5oZWlnaHQgLyAocy5kaW1lbnNpb25zLnJhbmtzICogMiksXG4gICAgICAgICAgXSxcbiAgICAgICAgICBzLnNjYWxlRG93blBpZWNlcyA/IDAuNSA6IDEsXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKCFkcmFnZ2VkRWwuc2dEcmFnZ2luZykge1xuICAgICAgICAgIGRyYWdnZWRFbC5zZ0RyYWdnaW5nID0gdHJ1ZTtcbiAgICAgICAgICB1dGlsLnNldERpc3BsYXkoZHJhZ2dlZEVsLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBob3ZlciA9IHV0aWwuZ2V0S2V5QXREb21Qb3MoXG4gICAgICAgICAgY3VyLnBvcyxcbiAgICAgICAgICB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pLFxuICAgICAgICAgIHMuZGltZW5zaW9ucyxcbiAgICAgICAgICBib3VuZHMsXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKGN1ci5mcm9tQm9hcmQpXG4gICAgICAgICAgY3VyLmZyb21Cb2FyZC5rZXlIYXNDaGFuZ2VkID0gY3VyLmZyb21Cb2FyZC5rZXlIYXNDaGFuZ2VkIHx8IGN1ci5mcm9tQm9hcmQub3JpZyAhPT0gaG92ZXI7XG4gICAgICAgIGVsc2UgaWYgKGN1ci5mcm9tT3V0c2lkZSlcbiAgICAgICAgICBjdXIuZnJvbU91dHNpZGUubGVmdE9yaWdpbiA9XG4gICAgICAgICAgICBjdXIuZnJvbU91dHNpZGUubGVmdE9yaWdpbiB8fFxuICAgICAgICAgICAgKCEhY3VyLmZyb21PdXRzaWRlLm9yaWdpbkJvdW5kcyAmJlxuICAgICAgICAgICAgICAhdXRpbC5pc0luc2lkZVJlY3QoY3VyLmZyb21PdXRzaWRlLm9yaWdpbkJvdW5kcywgY3VyLnBvcykpO1xuXG4gICAgICAgIC8vIGlmIHRoZSBob3ZlcmVkIHNxdWFyZSBjaGFuZ2VkXG4gICAgICAgIGlmIChob3ZlciAhPT0gcy5ob3ZlcmVkKSB7XG4gICAgICAgICAgdXBkYXRlSG92ZXJlZFNxdWFyZXMocywgaG92ZXIpO1xuICAgICAgICAgIGlmIChjdXIudG91Y2ggJiYgcy5kb20uZWxlbWVudHMuYm9hcmQ/LnNxdWFyZU92ZXIpIHtcbiAgICAgICAgICAgIGlmIChob3ZlciAmJiBzLmRyYWdnYWJsZS5zaG93VG91Y2hTcXVhcmVPdmVybGF5KSB7XG4gICAgICAgICAgICAgIHV0aWwudHJhbnNsYXRlQWJzKFxuICAgICAgICAgICAgICAgIHMuZG9tLmVsZW1lbnRzLmJvYXJkLnNxdWFyZU92ZXIsXG4gICAgICAgICAgICAgICAgdXRpbC5wb3NUb1RyYW5zbGF0ZUFicyhzLmRpbWVuc2lvbnMsIGJvdW5kcykoXG4gICAgICAgICAgICAgICAgICB1dGlsLmtleTJwb3MoaG92ZXIpLFxuICAgICAgICAgICAgICAgICAgdXRpbC5zZW50ZVBvdihzLm9yaWVudGF0aW9uKSxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIHV0aWwuc2V0RGlzcGxheShzLmRvbS5lbGVtZW50cy5ib2FyZC5zcXVhcmVPdmVyLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHV0aWwuc2V0RGlzcGxheShzLmRvbS5lbGVtZW50cy5ib2FyZC5zcXVhcmVPdmVyLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHByb2Nlc3NEcmFnKHMpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmUoczogU3RhdGUsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgLy8gc3VwcG9ydCBvbmUgZmluZ2VyIHRvdWNoIG9ubHlcbiAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQgJiYgKCFlLnRvdWNoZXMgfHwgZS50b3VjaGVzLmxlbmd0aCA8IDIpKSB7XG4gICAgcy5kcmFnZ2FibGUuY3VycmVudC5wb3MgPSB1dGlsLmV2ZW50UG9zaXRpb24oZSkhO1xuICB9IGVsc2UgaWYgKFxuICAgIChzLnNlbGVjdGVkIHx8IHMuc2VsZWN0ZWRQaWVjZSB8fCBzLmhpZ2hsaWdodC5ob3ZlcmVkKSAmJlxuICAgICFzLmRyYWdnYWJsZS5jdXJyZW50ICYmXG4gICAgKCFlLnRvdWNoZXMgfHwgZS50b3VjaGVzLmxlbmd0aCA8IDIpXG4gICkge1xuICAgIGNvbnN0IGJvdW5kcyA9IHMuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKSxcbiAgICAgIGhvdmVyID1cbiAgICAgICAgYm91bmRzICYmXG4gICAgICAgIHV0aWwuZ2V0S2V5QXREb21Qb3MoXG4gICAgICAgICAgdXRpbC5ldmVudFBvc2l0aW9uKGUpISxcbiAgICAgICAgICB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pLFxuICAgICAgICAgIHMuZGltZW5zaW9ucyxcbiAgICAgICAgICBib3VuZHMsXG4gICAgICAgICk7XG4gICAgaWYgKGhvdmVyICE9PSBzLmhvdmVyZWQpIHVwZGF0ZUhvdmVyZWRTcXVhcmVzKHMsIGhvdmVyKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5kKHM6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHMuZHJhZ2dhYmxlLmN1cnJlbnQ7XG4gIGlmICghY3VyKSByZXR1cm47XG4gIC8vIGNyZWF0ZSBubyBjb3JyZXNwb25kaW5nIG1vdXNlIGV2ZW50XG4gIGlmIChlLnR5cGUgPT09ICd0b3VjaGVuZCcgJiYgZS5jYW5jZWxhYmxlICE9PSBmYWxzZSkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAvLyBjb21wYXJpbmcgd2l0aCB0aGUgb3JpZ2luIHRhcmdldCBpcyBhbiBlYXN5IHdheSB0byB0ZXN0IHRoYXQgdGhlIGVuZCBldmVudFxuICAvLyBoYXMgdGhlIHNhbWUgdG91Y2ggb3JpZ2luXG4gIGlmIChlLnR5cGUgPT09ICd0b3VjaGVuZCcgJiYgY3VyLm9yaWdpblRhcmdldCAhPT0gZS50YXJnZXQgJiYgIWN1ci5mcm9tT3V0c2lkZSkge1xuICAgIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgaWYgKHMuaG92ZXJlZCAmJiAhcy5oaWdobGlnaHQuaG92ZXJlZCkgdXBkYXRlSG92ZXJlZFNxdWFyZXMocywgdW5kZWZpbmVkKTtcbiAgICByZXR1cm47XG4gIH1cbiAgYm9hcmQudW5zZXRQcmVtb3ZlKHMpO1xuICBib2FyZC51bnNldFByZWRyb3Aocyk7XG4gIC8vIHRvdWNoZW5kIGhhcyBubyBwb3NpdGlvbjsgc28gdXNlIHRoZSBsYXN0IHRvdWNobW92ZSBwb3NpdGlvbiBpbnN0ZWFkXG4gIGNvbnN0IGV2ZW50UG9zID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpIHx8IGN1ci5wb3MsXG4gICAgYm91bmRzID0gcy5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpLFxuICAgIGRlc3QgPVxuICAgICAgYm91bmRzICYmIHV0aWwuZ2V0S2V5QXREb21Qb3MoZXZlbnRQb3MsIHV0aWwuc2VudGVQb3Yocy5vcmllbnRhdGlvbiksIHMuZGltZW5zaW9ucywgYm91bmRzKTtcblxuICBpZiAoZGVzdCAmJiBjdXIuc3RhcnRlZCAmJiBjdXIuZnJvbUJvYXJkPy5vcmlnICE9PSBkZXN0KSB7XG4gICAgaWYgKGN1ci5mcm9tT3V0c2lkZSAmJiAhYm9hcmQucHJvbW90aW9uRGlhbG9nRHJvcChzLCBjdXIucGllY2UsIGRlc3QpKVxuICAgICAgYm9hcmQudXNlckRyb3AocywgY3VyLnBpZWNlLCBkZXN0KTtcbiAgICBlbHNlIGlmIChjdXIuZnJvbUJvYXJkICYmICFib2FyZC5wcm9tb3Rpb25EaWFsb2dNb3ZlKHMsIGN1ci5mcm9tQm9hcmQub3JpZywgZGVzdCkpXG4gICAgICBib2FyZC51c2VyTW92ZShzLCBjdXIuZnJvbUJvYXJkLm9yaWcsIGRlc3QpO1xuICB9IGVsc2UgaWYgKHMuZHJhZ2dhYmxlLmRlbGV0ZU9uRHJvcE9mZiAmJiAhZGVzdCkge1xuICAgIGlmIChjdXIuZnJvbUJvYXJkKSBzLnBpZWNlcy5kZWxldGUoY3VyLmZyb21Cb2FyZC5vcmlnKTtcbiAgICBlbHNlIGlmIChjdXIuZnJvbU91dHNpZGUgJiYgIWN1ci5zcGFyZSkgcmVtb3ZlRnJvbUhhbmQocywgY3VyLnBpZWNlKTtcblxuICAgIGlmIChzLmRyYWdnYWJsZS5hZGRUb0hhbmRPbkRyb3BPZmYpIHtcbiAgICAgIGNvbnN0IGhhbmRCb3VuZHMgPSBzLmRvbS5ib3VuZHMuaGFuZHMuYm91bmRzKCksXG4gICAgICAgIGhhbmRCb3VuZHNUb3AgPSBoYW5kQm91bmRzLmdldCgndG9wJyksXG4gICAgICAgIGhhbmRCb3VuZHNCb3R0b20gPSBoYW5kQm91bmRzLmdldCgnYm90dG9tJyk7XG4gICAgICBpZiAoaGFuZEJvdW5kc1RvcCAmJiB1dGlsLmlzSW5zaWRlUmVjdChoYW5kQm91bmRzVG9wLCBjdXIucG9zKSlcbiAgICAgICAgYWRkVG9IYW5kKHMsIHsgY29sb3I6IHV0aWwub3Bwb3NpdGUocy5vcmllbnRhdGlvbiksIHJvbGU6IGN1ci5waWVjZS5yb2xlIH0pO1xuICAgICAgZWxzZSBpZiAoaGFuZEJvdW5kc0JvdHRvbSAmJiB1dGlsLmlzSW5zaWRlUmVjdChoYW5kQm91bmRzQm90dG9tLCBjdXIucG9zKSlcbiAgICAgICAgYWRkVG9IYW5kKHMsIHsgY29sb3I6IHMub3JpZW50YXRpb24sIHJvbGU6IGN1ci5waWVjZS5yb2xlIH0pO1xuXG4gICAgICBib2FyZC51bnNlbGVjdChzKTtcbiAgICB9XG4gICAgdXRpbC5jYWxsVXNlckZ1bmN0aW9uKHMuZXZlbnRzLmNoYW5nZSk7XG4gIH1cblxuICBpZiAoXG4gICAgY3VyLmZyb21Cb2FyZCAmJlxuICAgIChjdXIuZnJvbUJvYXJkLm9yaWcgPT09IGN1ci5mcm9tQm9hcmQucHJldmlvdXNseVNlbGVjdGVkIHx8IGN1ci5mcm9tQm9hcmQua2V5SGFzQ2hhbmdlZCkgJiZcbiAgICAoY3VyLmZyb21Cb2FyZC5vcmlnID09PSBkZXN0IHx8ICFkZXN0KVxuICApIHtcbiAgICB1bnNlbGVjdChzLCBjdXIsIGRlc3QpO1xuICB9IGVsc2UgaWYgKFxuICAgICghZGVzdCAmJiBjdXIuZnJvbU91dHNpZGU/LmxlZnRPcmlnaW4pIHx8XG4gICAgKGN1ci5mcm9tT3V0c2lkZT8ub3JpZ2luQm91bmRzICYmXG4gICAgICB1dGlsLmlzSW5zaWRlUmVjdChjdXIuZnJvbU91dHNpZGUub3JpZ2luQm91bmRzLCBjdXIucG9zKSAmJlxuICAgICAgY3VyLmZyb21PdXRzaWRlLnByZXZpb3VzbHlTZWxlY3RlZFBpZWNlICYmXG4gICAgICB1dGlsLnNhbWVQaWVjZShjdXIuZnJvbU91dHNpZGUucHJldmlvdXNseVNlbGVjdGVkUGllY2UsIGN1ci5waWVjZSkpXG4gICkge1xuICAgIHVuc2VsZWN0KHMsIGN1ciwgZGVzdCk7XG4gIH0gZWxzZSBpZiAoIXMuc2VsZWN0YWJsZS5lbmFibGVkICYmICFzLnByb21vdGlvbi5jdXJyZW50KSB7XG4gICAgdW5zZWxlY3QocywgY3VyLCBkZXN0KTtcbiAgfVxuXG4gIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIGlmICghcy5oaWdobGlnaHQuaG92ZXJlZCAmJiAhcy5wcm9tb3Rpb24uY3VycmVudCkgcy5ob3ZlcmVkID0gdW5kZWZpbmVkO1xuICBzLmRvbS5yZWRyYXcoKTtcbn1cblxuZnVuY3Rpb24gdW5zZWxlY3QoczogU3RhdGUsIGN1cjogRHJhZ0N1cnJlbnQsIGRlc3Q/OiBzZy5LZXkpOiB2b2lkIHtcbiAgaWYgKGN1ci5mcm9tQm9hcmQgJiYgY3VyLmZyb21Cb2FyZC5vcmlnID09PSBkZXN0KVxuICAgIHV0aWwuY2FsbFVzZXJGdW5jdGlvbihzLmV2ZW50cy51bnNlbGVjdCwgY3VyLmZyb21Cb2FyZC5vcmlnKTtcbiAgZWxzZSBpZiAoXG4gICAgY3VyLmZyb21PdXRzaWRlPy5vcmlnaW5Cb3VuZHMgJiZcbiAgICB1dGlsLmlzSW5zaWRlUmVjdChjdXIuZnJvbU91dHNpZGUub3JpZ2luQm91bmRzLCBjdXIucG9zKVxuICApXG4gICAgdXRpbC5jYWxsVXNlckZ1bmN0aW9uKHMuZXZlbnRzLnBpZWNlVW5zZWxlY3QsIGN1ci5waWVjZSk7XG4gIGJvYXJkLnVuc2VsZWN0KHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsKHM6IFN0YXRlKTogdm9pZCB7XG4gIGlmIChzLmRyYWdnYWJsZS5jdXJyZW50KSB7XG4gICAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBpZiAoIXMuaGlnaGxpZ2h0LmhvdmVyZWQpIHMuaG92ZXJlZCA9IHVuZGVmaW5lZDtcbiAgICBib2FyZC51bnNlbGVjdChzKTtcbiAgICBzLmRvbS5yZWRyYXcoKTtcbiAgfVxufVxuXG4vLyBzdXBwb3J0IG9uZSBmaW5nZXIgdG91Y2ggb25seSBvciBsZWZ0IGNsaWNrXG5leHBvcnQgZnVuY3Rpb24gdW53YW50ZWRFdmVudChlOiBzZy5Nb3VjaEV2ZW50KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgIWUuaXNUcnVzdGVkIHx8XG4gICAgKGUuYnV0dG9uICE9PSB1bmRlZmluZWQgJiYgZS5idXR0b24gIT09IDApIHx8XG4gICAgKCEhZS50b3VjaGVzICYmIGUudG91Y2hlcy5sZW5ndGggPiAxKVxuICApO1xufVxuXG5mdW5jdGlvbiB2YWxpZERlc3RUb0hvdmVyKHM6IFN0YXRlLCBrZXk6IHNnLktleSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgICghIXMuc2VsZWN0ZWQgJiYgKGJvYXJkLmNhbk1vdmUocywgcy5zZWxlY3RlZCwga2V5KSB8fCBib2FyZC5jYW5QcmVtb3ZlKHMsIHMuc2VsZWN0ZWQsIGtleSkpKSB8fFxuICAgICghIXMuc2VsZWN0ZWRQaWVjZSAmJlxuICAgICAgKGJvYXJkLmNhbkRyb3Aocywgcy5zZWxlY3RlZFBpZWNlLCBrZXkpIHx8IGJvYXJkLmNhblByZWRyb3Aocywgcy5zZWxlY3RlZFBpZWNlLCBrZXkpKSlcbiAgKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlSG92ZXJlZFNxdWFyZXMoczogU3RhdGUsIGtleTogc2cuS2V5IHwgdW5kZWZpbmVkKTogdm9pZCB7XG4gIGNvbnN0IHNxYXVyZUVscyA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkPy5zcXVhcmVzLmNoaWxkcmVuO1xuICBpZiAoIXNxYXVyZUVscyB8fCBzLnByb21vdGlvbi5jdXJyZW50KSByZXR1cm47XG5cbiAgY29uc3QgcHJldkhvdmVyID0gcy5ob3ZlcmVkO1xuICBpZiAocy5oaWdobGlnaHQuaG92ZXJlZCB8fCAoa2V5ICYmIHZhbGlkRGVzdFRvSG92ZXIocywga2V5KSkpIHMuaG92ZXJlZCA9IGtleTtcbiAgZWxzZSBzLmhvdmVyZWQgPSB1bmRlZmluZWQ7XG5cbiAgY29uc3QgYXNTZW50ZSA9IHV0aWwuc2VudGVQb3Yocy5vcmllbnRhdGlvbiksXG4gICAgY3VySW5kZXggPSBzLmhvdmVyZWQgJiYgdXRpbC5kb21TcXVhcmVJbmRleE9mS2V5KHMuaG92ZXJlZCwgYXNTZW50ZSwgcy5kaW1lbnNpb25zKSxcbiAgICBjdXJIb3ZlckVsID0gY3VySW5kZXggIT09IHVuZGVmaW5lZCAmJiBzcWF1cmVFbHNbY3VySW5kZXhdO1xuICBpZiAoY3VySG92ZXJFbCkgY3VySG92ZXJFbC5jbGFzc0xpc3QuYWRkKCdob3ZlcicpO1xuXG4gIGNvbnN0IHByZXZJbmRleCA9IHByZXZIb3ZlciAmJiB1dGlsLmRvbVNxdWFyZUluZGV4T2ZLZXkocHJldkhvdmVyLCBhc1NlbnRlLCBzLmRpbWVuc2lvbnMpLFxuICAgIHByZXZIb3ZlckVsID0gcHJldkluZGV4ICE9PSB1bmRlZmluZWQgJiYgc3FhdXJlRWxzW3ByZXZJbmRleF07XG4gIGlmIChwcmV2SG92ZXJFbCkgcHJldkhvdmVyRWwuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXInKTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IE5vdGF0aW9uIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjb29yZHMobm90YXRpb246IE5vdGF0aW9uKTogc3RyaW5nW10ge1xuICBzd2l0Y2ggKG5vdGF0aW9uKSB7XG4gICAgY2FzZSAnZGl6aGknOlxuICAgICAgcmV0dXJuIFtcbiAgICAgICAgJycsXG4gICAgICAgICcnLFxuICAgICAgICAnJyxcbiAgICAgICAgJycsXG4gICAgICAgICfkuqUnLFxuICAgICAgICAn5oiMJyxcbiAgICAgICAgJ+mFiScsXG4gICAgICAgICfnlLMnLFxuICAgICAgICAn5pyqJyxcbiAgICAgICAgJ+WNiCcsXG4gICAgICAgICflt7MnLFxuICAgICAgICAn6L6wJyxcbiAgICAgICAgJ+WNrycsXG4gICAgICAgICflr4UnLFxuICAgICAgICAn5LiRJyxcbiAgICAgICAgJ+WtkCcsXG4gICAgICBdO1xuICAgIGNhc2UgJ2phcGFuZXNlJzpcbiAgICAgIHJldHVybiBbXG4gICAgICAgICfljYHlha0nLFxuICAgICAgICAn5Y2B5LqUJyxcbiAgICAgICAgJ+WNgeWbmycsXG4gICAgICAgICfljYHkuIknLFxuICAgICAgICAn5Y2B5LqMJyxcbiAgICAgICAgJ+WNgeS4gCcsXG4gICAgICAgICfljYEnLFxuICAgICAgICAn5LmdJyxcbiAgICAgICAgJ+WFqycsXG4gICAgICAgICfkuIMnLFxuICAgICAgICAn5YWtJyxcbiAgICAgICAgJ+S6lCcsXG4gICAgICAgICflm5snLFxuICAgICAgICAn5LiJJyxcbiAgICAgICAgJ+S6jCcsXG4gICAgICAgICfkuIAnLFxuICAgICAgXTtcbiAgICBjYXNlICdlbmdpbmUnOlxuICAgICAgcmV0dXJuIFsncCcsICdvJywgJ24nLCAnbScsICdsJywgJ2snLCAnaicsICdpJywgJ2gnLCAnZycsICdmJywgJ2UnLCAnZCcsICdjJywgJ2InLCAnYSddO1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXR1cm4gWycxMCcsICdmJywgJ2UnLCAnZCcsICdjJywgJ2InLCAnYScsICc5JywgJzgnLCAnNycsICc2JywgJzUnLCAnNCcsICczJywgJzInLCAnMSddO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gW1xuICAgICAgICAnMTYnLFxuICAgICAgICAnMTUnLFxuICAgICAgICAnMTQnLFxuICAgICAgICAnMTMnLFxuICAgICAgICAnMTInLFxuICAgICAgICAnMTEnLFxuICAgICAgICAnMTAnLFxuICAgICAgICAnOScsXG4gICAgICAgICc4JyxcbiAgICAgICAgJzcnLFxuICAgICAgICAnNicsXG4gICAgICAgICc1JyxcbiAgICAgICAgJzQnLFxuICAgICAgICAnMycsXG4gICAgICAgICcyJyxcbiAgICAgICAgJzEnLFxuICAgICAgXTtcbiAgfVxufVxuIiwgImltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlIHtcbiAgRGltZW5zaW9ucyxcbiAgU3F1YXJlTm9kZSxcbiAgQ29sb3IsXG4gIFBpZWNlTm9kZSxcbiAgUm9sZVN0cmluZyxcbiAgSGFuZEVsZW1lbnRzLFxuICBCb2FyZEVsZW1lbnRzLFxufSBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IGNvbG9ycyB9IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IGNyZWF0ZUVsLCBvcHBvc2l0ZSwgcGllY2VOYW1lT2YsIHBvczJrZXksIHNldERpc3BsYXkgfSBmcm9tICcuL3V0aWwuanMnO1xuaW1wb3J0IHsgY3JlYXRlU1ZHRWxlbWVudCwgc2V0QXR0cmlidXRlcyB9IGZyb20gJy4vc2hhcGVzLmpzJztcbmltcG9ydCB7IGNvb3JkcyB9IGZyb20gJy4vY29vcmRzLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIHdyYXBCb2FyZChib2FyZFdyYXA6IEhUTUxFbGVtZW50LCBzOiBTdGF0ZSk6IEJvYXJkRWxlbWVudHMge1xuICAvLyAuc2ctd3JhcCAoZWxlbWVudCBwYXNzZWQgdG8gU2hvZ2lncm91bmQpXG4gIC8vICAgICBzZy1oYW5kLXdyYXBcbiAgLy8gICAgIHNnLWJvYXJkXG4gIC8vICAgICAgIHNnLXNxdWFyZXNcbiAgLy8gICAgICAgc2ctcGllY2VzXG4gIC8vICAgICAgIHBpZWNlIGRyYWdnaW5nXG4gIC8vICAgICAgIHNnLXByb21vdGlvblxuICAvLyAgICAgICBzZy1zcXVhcmUtb3ZlclxuICAvLyAgICAgICBzdmcuc2ctc2hhcGVzXG4gIC8vICAgICAgICAgZGVmc1xuICAvLyAgICAgICAgIGdcbiAgLy8gICAgICAgc3ZnLnNnLWN1c3RvbS1zdmdzXG4gIC8vICAgICAgICAgZ1xuICAvLyAgICAgc2ctaGFuZC13cmFwXG4gIC8vICAgICBzZy1mcmVlLXBpZWNlc1xuICAvLyAgICAgICBjb29yZHMucmFua3NcbiAgLy8gICAgICAgY29vcmRzLmZpbGVzXG5cbiAgY29uc3QgYm9hcmQgPSBjcmVhdGVFbCgnc2ctYm9hcmQnKTtcblxuICBjb25zdCBzcXVhcmVzID0gcmVuZGVyU3F1YXJlcyhzLmRpbWVuc2lvbnMsIHMub3JpZW50YXRpb24pO1xuICBib2FyZC5hcHBlbmRDaGlsZChzcXVhcmVzKTtcblxuICBjb25zdCBwaWVjZXMgPSBjcmVhdGVFbCgnc2ctcGllY2VzJyk7XG4gIGJvYXJkLmFwcGVuZENoaWxkKHBpZWNlcyk7XG5cbiAgbGV0IGRyYWdnZWQsIHByb21vdGlvbiwgc3F1YXJlT3ZlcjtcbiAgaWYgKCFzLnZpZXdPbmx5KSB7XG4gICAgZHJhZ2dlZCA9IGNyZWF0ZUVsKCdwaWVjZScpIGFzIFBpZWNlTm9kZTtcbiAgICBzZXREaXNwbGF5KGRyYWdnZWQsIGZhbHNlKTtcbiAgICBib2FyZC5hcHBlbmRDaGlsZChkcmFnZ2VkKTtcblxuICAgIHByb21vdGlvbiA9IGNyZWF0ZUVsKCdzZy1wcm9tb3Rpb24nKTtcbiAgICBzZXREaXNwbGF5KHByb21vdGlvbiwgZmFsc2UpO1xuICAgIGJvYXJkLmFwcGVuZENoaWxkKHByb21vdGlvbik7XG5cbiAgICBzcXVhcmVPdmVyID0gY3JlYXRlRWwoJ3NnLXNxdWFyZS1vdmVyJyk7XG4gICAgc2V0RGlzcGxheShzcXVhcmVPdmVyLCBmYWxzZSk7XG4gICAgYm9hcmQuYXBwZW5kQ2hpbGQoc3F1YXJlT3Zlcik7XG4gIH1cblxuICBsZXQgc2hhcGVzO1xuICBpZiAocy5kcmF3YWJsZS52aXNpYmxlKSB7XG4gICAgY29uc3Qgc3ZnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdzdmcnKSwge1xuICAgICAgY2xhc3M6ICdzZy1zaGFwZXMnLFxuICAgICAgdmlld0JveDogYC0ke3Muc3F1YXJlUmF0aW9bMF0gLyAyfSAtJHtzLnNxdWFyZVJhdGlvWzFdIC8gMn0gJHtzLmRpbWVuc2lvbnMuZmlsZXMgKiBzLnNxdWFyZVJhdGlvWzBdfSAke1xuICAgICAgICBzLmRpbWVuc2lvbnMucmFua3MgKiBzLnNxdWFyZVJhdGlvWzFdXG4gICAgICB9YCxcbiAgICB9KTtcbiAgICBzdmcuYXBwZW5kQ2hpbGQoY3JlYXRlU1ZHRWxlbWVudCgnZGVmcycpKTtcbiAgICBzdmcuYXBwZW5kQ2hpbGQoY3JlYXRlU1ZHRWxlbWVudCgnZycpKTtcblxuICAgIGNvbnN0IGN1c3RvbVN2ZyA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnc3ZnJyksIHtcbiAgICAgIGNsYXNzOiAnc2ctY3VzdG9tLXN2Z3MnLFxuICAgICAgdmlld0JveDogYDAgMCAke3MuZGltZW5zaW9ucy5maWxlcyAqIHMuc3F1YXJlUmF0aW9bMF19ICR7cy5kaW1lbnNpb25zLnJhbmtzICogcy5zcXVhcmVSYXRpb1sxXX1gLFxuICAgIH0pO1xuICAgIGN1c3RvbVN2Zy5hcHBlbmRDaGlsZChjcmVhdGVTVkdFbGVtZW50KCdnJykpO1xuXG4gICAgY29uc3QgZnJlZVBpZWNlcyA9IGNyZWF0ZUVsKCdzZy1mcmVlLXBpZWNlcycpO1xuXG4gICAgYm9hcmQuYXBwZW5kQ2hpbGQoc3ZnKTtcbiAgICBib2FyZC5hcHBlbmRDaGlsZChjdXN0b21TdmcpO1xuICAgIGJvYXJkLmFwcGVuZENoaWxkKGZyZWVQaWVjZXMpO1xuXG4gICAgc2hhcGVzID0ge1xuICAgICAgc3ZnLFxuICAgICAgZnJlZVBpZWNlcyxcbiAgICAgIGN1c3RvbVN2ZyxcbiAgICB9O1xuICB9XG5cbiAgaWYgKHMuY29vcmRpbmF0ZXMuZW5hYmxlZCkge1xuICAgIGNvbnN0IG9yaWVudENsYXNzID0gcy5vcmllbnRhdGlvbiA9PT0gJ2dvdGUnID8gJyBnb3RlJyA6ICcnLFxuICAgICAgcmFua3MgPSBjb29yZHMocy5jb29yZGluYXRlcy5yYW5rcyksXG4gICAgICBmaWxlcyA9IGNvb3JkcyhzLmNvb3JkaW5hdGVzLmZpbGVzKTtcbiAgICBib2FyZC5hcHBlbmRDaGlsZChyZW5kZXJDb29yZHMocmFua3MsICdyYW5rcycgKyBvcmllbnRDbGFzcywgcy5kaW1lbnNpb25zLnJhbmtzKSk7XG4gICAgYm9hcmQuYXBwZW5kQ2hpbGQocmVuZGVyQ29vcmRzKGZpbGVzLCAnZmlsZXMnICsgb3JpZW50Q2xhc3MsIHMuZGltZW5zaW9ucy5maWxlcykpO1xuICB9XG5cbiAgYm9hcmRXcmFwLmlubmVySFRNTCA9ICcnO1xuXG4gIGNvbnN0IGRpbUNscyA9IGBkLSR7cy5kaW1lbnNpb25zLmZpbGVzfXgke3MuZGltZW5zaW9ucy5yYW5rc31gO1xuXG4gIC8vIHJlbW92ZSBhbGwgb3RoZXIgZGltZW5zaW9uIGNsYXNzZXNcbiAgYm9hcmRXcmFwLmNsYXNzTGlzdC5mb3JFYWNoKChjKSA9PiB7XG4gICAgaWYgKGMuc3Vic3RyaW5nKDAsIDIpID09PSAnZC0nICYmIGMgIT09IGRpbUNscykgYm9hcmRXcmFwLmNsYXNzTGlzdC5yZW1vdmUoYyk7XG4gIH0pO1xuXG4gIC8vIGVuc3VyZSB0aGUgc2ctd3JhcCBjbGFzcyBhbmQgZGltZW5zaW9ucyBjbGFzcyBpcyBzZXQgYmVmb3JlaGFuZCB0byBhdm9pZCByZWNvbXB1dGluZyBzdHlsZXNcbiAgYm9hcmRXcmFwLmNsYXNzTGlzdC5hZGQoJ3NnLXdyYXAnLCBkaW1DbHMpO1xuXG4gIGZvciAoY29uc3QgYyBvZiBjb2xvcnMpIGJvYXJkV3JhcC5jbGFzc0xpc3QudG9nZ2xlKCdvcmllbnRhdGlvbi0nICsgYywgcy5vcmllbnRhdGlvbiA9PT0gYyk7XG4gIGJvYXJkV3JhcC5jbGFzc0xpc3QudG9nZ2xlKCdtYW5pcHVsYWJsZScsICFzLnZpZXdPbmx5KTtcblxuICBib2FyZFdyYXAuYXBwZW5kQ2hpbGQoYm9hcmQpO1xuXG4gIGxldCBoYW5kczogSGFuZEVsZW1lbnRzIHwgdW5kZWZpbmVkO1xuICBpZiAocy5oYW5kcy5pbmxpbmVkKSB7XG4gICAgY29uc3QgaGFuZFdyYXBUb3AgPSBjcmVhdGVFbCgnc2ctaGFuZC13cmFwJywgJ2lubGluZWQnKSxcbiAgICAgIGhhbmRXcmFwQm90dG9tID0gY3JlYXRlRWwoJ3NnLWhhbmQtd3JhcCcsICdpbmxpbmVkJyk7XG4gICAgYm9hcmRXcmFwLmluc2VydEJlZm9yZShoYW5kV3JhcEJvdHRvbSwgYm9hcmQubmV4dEVsZW1lbnRTaWJsaW5nKTtcbiAgICBib2FyZFdyYXAuaW5zZXJ0QmVmb3JlKGhhbmRXcmFwVG9wLCBib2FyZCk7XG4gICAgaGFuZHMgPSB7XG4gICAgICB0b3A6IGhhbmRXcmFwVG9wLFxuICAgICAgYm90dG9tOiBoYW5kV3JhcEJvdHRvbSxcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBib2FyZCxcbiAgICBzcXVhcmVzLFxuICAgIHBpZWNlcyxcbiAgICBwcm9tb3Rpb24sXG4gICAgc3F1YXJlT3ZlcixcbiAgICBkcmFnZ2VkLFxuICAgIHNoYXBlcyxcbiAgICBoYW5kcyxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyYXBIYW5kKGhhbmRXcmFwOiBIVE1MRWxlbWVudCwgcG9zOiAndG9wJyB8ICdib3R0b20nLCBzOiBTdGF0ZSk6IEhUTUxFbGVtZW50IHtcbiAgY29uc3QgaGFuZCA9IHJlbmRlckhhbmQocG9zID09PSAndG9wJyA/IG9wcG9zaXRlKHMub3JpZW50YXRpb24pIDogcy5vcmllbnRhdGlvbiwgcy5oYW5kcy5yb2xlcyk7XG4gIGhhbmRXcmFwLmlubmVySFRNTCA9ICcnO1xuXG4gIGNvbnN0IHJvbGVDbnRDbHMgPSBgci0ke3MuaGFuZHMucm9sZXMubGVuZ3RofWA7XG5cbiAgLy8gcmVtb3ZlIGFsbCBvdGhlciByb2xlIGNvdW50IGNsYXNzZXNcbiAgaGFuZFdyYXAuY2xhc3NMaXN0LmZvckVhY2goKGMpID0+IHtcbiAgICBpZiAoYy5zdWJzdHJpbmcoMCwgMikgPT09ICdyLScgJiYgYyAhPT0gcm9sZUNudENscykgaGFuZFdyYXAuY2xhc3NMaXN0LnJlbW92ZShjKTtcbiAgfSk7XG5cbiAgLy8gZW5zdXJlIHRoZSBzZy1oYW5kLXdyYXAgY2xhc3MsIGhhbmQgcG9zIGNsYXNzIGFuZCByb2xlIG51bWJlciBjbGFzcyBpcyBzZXQgYmVmb3JlaGFuZCB0byBhdm9pZCByZWNvbXB1dGluZyBzdHlsZXNcbiAgaGFuZFdyYXAuY2xhc3NMaXN0LmFkZCgnc2ctaGFuZC13cmFwJywgYGhhbmQtJHtwb3N9YCwgcm9sZUNudENscyk7XG4gIGhhbmRXcmFwLmFwcGVuZENoaWxkKGhhbmQpO1xuXG4gIGZvciAoY29uc3QgYyBvZiBjb2xvcnMpIGhhbmRXcmFwLmNsYXNzTGlzdC50b2dnbGUoJ29yaWVudGF0aW9uLScgKyBjLCBzLm9yaWVudGF0aW9uID09PSBjKTtcbiAgaGFuZFdyYXAuY2xhc3NMaXN0LnRvZ2dsZSgnbWFuaXB1bGFibGUnLCAhcy52aWV3T25seSk7XG5cbiAgcmV0dXJuIGhhbmQ7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckNvb3JkcyhlbGVtczogcmVhZG9ubHkgc3RyaW5nW10sIGNsYXNzTmFtZTogc3RyaW5nLCB0cmltOiBudW1iZXIpOiBIVE1MRWxlbWVudCB7XG4gIGNvbnN0IGVsID0gY3JlYXRlRWwoJ2Nvb3JkcycsIGNsYXNzTmFtZSk7XG4gIGxldCBmOiBIVE1MRWxlbWVudDtcbiAgZm9yIChjb25zdCBlbGVtIG9mIGVsZW1zLnNsaWNlKC10cmltKSkge1xuICAgIGYgPSBjcmVhdGVFbCgnY29vcmQnKTtcbiAgICBmLnRleHRDb250ZW50ID0gZWxlbTtcbiAgICBlbC5hcHBlbmRDaGlsZChmKTtcbiAgfVxuICByZXR1cm4gZWw7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclNxdWFyZXMoZGltczogRGltZW5zaW9ucywgb3JpZW50YXRpb246IENvbG9yKTogSFRNTEVsZW1lbnQge1xuICBjb25zdCBzcXVhcmVzID0gY3JlYXRlRWwoJ3NnLXNxdWFyZXMnKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGRpbXMucmFua3MgKiBkaW1zLmZpbGVzOyBpKyspIHtcbiAgICBjb25zdCBzcSA9IGNyZWF0ZUVsKCdzcScpIGFzIFNxdWFyZU5vZGU7XG4gICAgc3Euc2dLZXkgPVxuICAgICAgb3JpZW50YXRpb24gPT09ICdzZW50ZSdcbiAgICAgICAgPyBwb3Mya2V5KFtkaW1zLmZpbGVzIC0gMSAtIChpICUgZGltcy5maWxlcyksIE1hdGguZmxvb3IoaSAvIGRpbXMuZmlsZXMpXSlcbiAgICAgICAgOiBwb3Mya2V5KFtpICUgZGltcy5maWxlcywgZGltcy5yYW5rcyAtIDEgLSBNYXRoLmZsb29yKGkgLyBkaW1zLmZpbGVzKV0pO1xuICAgIHNxdWFyZXMuYXBwZW5kQ2hpbGQoc3EpO1xuICB9XG5cbiAgcmV0dXJuIHNxdWFyZXM7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckhhbmQoY29sb3I6IENvbG9yLCByb2xlczogUm9sZVN0cmluZ1tdKTogSFRNTEVsZW1lbnQge1xuICBjb25zdCBoYW5kID0gY3JlYXRlRWwoJ3NnLWhhbmQnKTtcbiAgZm9yIChjb25zdCByb2xlIG9mIHJvbGVzKSB7XG4gICAgY29uc3QgcGllY2UgPSB7IHJvbGU6IHJvbGUsIGNvbG9yOiBjb2xvciB9LFxuICAgICAgd3JhcEVsID0gY3JlYXRlRWwoJ3NnLWhwLXdyYXAnKSxcbiAgICAgIHBpZWNlRWwgPSBjcmVhdGVFbCgncGllY2UnLCBwaWVjZU5hbWVPZihwaWVjZSkpIGFzIFBpZWNlTm9kZTtcbiAgICBwaWVjZUVsLnNnQ29sb3IgPSBjb2xvcjtcbiAgICBwaWVjZUVsLnNnUm9sZSA9IHJvbGU7XG4gICAgd3JhcEVsLmFwcGVuZENoaWxkKHBpZWNlRWwpO1xuICAgIGhhbmQuYXBwZW5kQ2hpbGQod3JhcEVsKTtcbiAgfVxuICByZXR1cm4gaGFuZDtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0ICogYXMgZHJhZyBmcm9tICcuL2RyYWcuanMnO1xuaW1wb3J0ICogYXMgZHJhdyBmcm9tICcuL2RyYXcuanMnO1xuaW1wb3J0IHtcbiAgY2FsbFVzZXJGdW5jdGlvbixcbiAgZXZlbnRQb3NpdGlvbixcbiAgZ2V0SGFuZFBpZWNlQXREb21Qb3MsXG4gIGlzTWlkZGxlQnV0dG9uLFxuICBpc1BpZWNlTm9kZSxcbiAgaXNSaWdodEJ1dHRvbixcbiAgc2FtZVBpZWNlLFxufSBmcm9tICcuL3V0aWwuanMnO1xuaW1wb3J0IHsgYW5pbSB9IGZyb20gJy4vYW5pbS5qcyc7XG5pbXBvcnQgeyB1c2VyRHJvcCwgdXNlck1vdmUsIGNhbmNlbFByb21vdGlvbiwgc2VsZWN0U3F1YXJlIH0gZnJvbSAnLi9ib2FyZC5qcyc7XG5pbXBvcnQgeyB1c2VzQm91bmRzIH0gZnJvbSAnLi9zaGFwZXMuanMnO1xuXG50eXBlIE1vdWNoQmluZCA9IChlOiBzZy5Nb3VjaEV2ZW50KSA9PiB2b2lkO1xudHlwZSBTdGF0ZU1vdWNoQmluZCA9IChkOiBTdGF0ZSwgZTogc2cuTW91Y2hFdmVudCkgPT4gdm9pZDtcblxuZnVuY3Rpb24gY2xlYXJCb3VuZHMoczogU3RhdGUpOiB2b2lkIHtcbiAgcy5kb20uYm91bmRzLmJvYXJkLmJvdW5kcy5jbGVhcigpO1xuICBzLmRvbS5ib3VuZHMuaGFuZHMuYm91bmRzLmNsZWFyKCk7XG4gIHMuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcy5jbGVhcigpO1xufVxuXG5mdW5jdGlvbiBvblJlc2l6ZShzOiBTdGF0ZSk6ICgpID0+IHZvaWQge1xuICByZXR1cm4gKCkgPT4ge1xuICAgIGNsZWFyQm91bmRzKHMpO1xuICAgIGlmICh1c2VzQm91bmRzKHMuZHJhd2FibGUuc2hhcGVzLmNvbmNhdChzLmRyYXdhYmxlLmF1dG9TaGFwZXMpKSkgcy5kb20ucmVkcmF3U2hhcGVzKCk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kQm9hcmQoczogU3RhdGUsIGJvYXJkRWxzOiBzZy5Cb2FyZEVsZW1lbnRzKTogdm9pZCB7XG4gIGlmICgnUmVzaXplT2JzZXJ2ZXInIGluIHdpbmRvdykgbmV3IFJlc2l6ZU9ic2VydmVyKG9uUmVzaXplKHMpKS5vYnNlcnZlKGJvYXJkRWxzLmJvYXJkKTtcblxuICBpZiAocy52aWV3T25seSkgcmV0dXJuO1xuXG4gIGNvbnN0IHBpZWNlc0VsID0gYm9hcmRFbHMucGllY2VzLFxuICAgIHByb21vdGlvbkVsID0gYm9hcmRFbHMucHJvbW90aW9uO1xuXG4gIC8vIENhbm5vdCBiZSBwYXNzaXZlLCBiZWNhdXNlIHdlIHByZXZlbnQgdG91Y2ggc2Nyb2xsaW5nIGFuZCBkcmFnZ2luZyBvZiBzZWxlY3RlZCBlbGVtZW50cy5cbiAgY29uc3Qgb25TdGFydCA9IHN0YXJ0RHJhZ09yRHJhdyhzKTtcbiAgcGllY2VzRWwuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIG9uU3RhcnQgYXMgRXZlbnRMaXN0ZW5lciwge1xuICAgIHBhc3NpdmU6IGZhbHNlLFxuICB9KTtcbiAgcGllY2VzRWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25TdGFydCBhcyBFdmVudExpc3RlbmVyLCB7XG4gICAgcGFzc2l2ZTogZmFsc2UsXG4gIH0pO1xuICBpZiAocy5kaXNhYmxlQ29udGV4dE1lbnUgfHwgcy5kcmF3YWJsZS5lbmFibGVkKVxuICAgIHBpZWNlc0VsLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgKGUpID0+IGUucHJldmVudERlZmF1bHQoKSk7XG5cbiAgaWYgKHByb21vdGlvbkVsKSB7XG4gICAgY29uc3QgcGllY2VTZWxlY3Rpb24gPSAoZTogc2cuTW91Y2hFdmVudCkgPT4gcHJvbW90ZShzLCBlKTtcbiAgICBwcm9tb3Rpb25FbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHBpZWNlU2VsZWN0aW9uIGFzIEV2ZW50TGlzdGVuZXIpO1xuICAgIGlmIChzLmRpc2FibGVDb250ZXh0TWVudSlcbiAgICAgIHByb21vdGlvbkVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgKGUpID0+IGUucHJldmVudERlZmF1bHQoKSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRIYW5kKHM6IFN0YXRlLCBoYW5kRWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gIGlmICgnUmVzaXplT2JzZXJ2ZXInIGluIHdpbmRvdykgbmV3IFJlc2l6ZU9ic2VydmVyKG9uUmVzaXplKHMpKS5vYnNlcnZlKGhhbmRFbCk7XG5cbiAgaWYgKHMudmlld09ubHkpIHJldHVybjtcblxuICBjb25zdCBvblN0YXJ0ID0gc3RhcnREcmFnRnJvbUhhbmQocyk7XG4gIGhhbmRFbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvblN0YXJ0IGFzIEV2ZW50TGlzdGVuZXIsIHsgcGFzc2l2ZTogZmFsc2UgfSk7XG4gIGhhbmRFbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25TdGFydCBhcyBFdmVudExpc3RlbmVyLCB7XG4gICAgcGFzc2l2ZTogZmFsc2UsXG4gIH0pO1xuICBoYW5kRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgaWYgKHMucHJvbW90aW9uLmN1cnJlbnQpIHtcbiAgICAgIGNhbmNlbFByb21vdGlvbihzKTtcbiAgICAgIHMuZG9tLnJlZHJhdygpO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHMuZGlzYWJsZUNvbnRleHRNZW51IHx8IHMuZHJhd2FibGUuZW5hYmxlZClcbiAgICBoYW5kRWwuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcbn1cblxuLy8gcmV0dXJucyB0aGUgdW5iaW5kIGZ1bmN0aW9uXG5leHBvcnQgZnVuY3Rpb24gYmluZERvY3VtZW50KHM6IFN0YXRlKTogc2cuVW5iaW5kIHtcbiAgY29uc3QgdW5iaW5kczogc2cuVW5iaW5kW10gPSBbXTtcblxuICAvLyBPbGQgdmVyc2lvbnMgb2YgRWRnZSBhbmQgU2FmYXJpIGRvIG5vdCBzdXBwb3J0IFJlc2l6ZU9ic2VydmVyLiBTZW5kXG4gIC8vIHNob2dpZ3JvdW5kLnJlc2l6ZSBpZiBhIHVzZXIgYWN0aW9uIGhhcyBjaGFuZ2VkIHRoZSBib3VuZHMgb2YgdGhlIGJvYXJkLlxuICBpZiAoISgnUmVzaXplT2JzZXJ2ZXInIGluIHdpbmRvdykpIHtcbiAgICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZShkb2N1bWVudC5ib2R5LCAnc2hvZ2lncm91bmQucmVzaXplJywgb25SZXNpemUocykpKTtcbiAgfVxuXG4gIGlmICghcy52aWV3T25seSkge1xuICAgIGNvbnN0IG9ubW92ZSA9IGRyYWdPckRyYXcocywgZHJhZy5tb3ZlLCBkcmF3Lm1vdmUpLFxuICAgICAgb25lbmQgPSBkcmFnT3JEcmF3KHMsIGRyYWcuZW5kLCBkcmF3LmVuZCk7XG5cbiAgICBmb3IgKGNvbnN0IGV2IG9mIFsndG91Y2htb3ZlJywgJ21vdXNlbW92ZSddKVxuICAgICAgdW5iaW5kcy5wdXNoKHVuYmluZGFibGUoZG9jdW1lbnQsIGV2LCBvbm1vdmUgYXMgRXZlbnRMaXN0ZW5lcikpO1xuICAgIGZvciAoY29uc3QgZXYgb2YgWyd0b3VjaGVuZCcsICdtb3VzZXVwJ10pXG4gICAgICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZShkb2N1bWVudCwgZXYsIG9uZW5kIGFzIEV2ZW50TGlzdGVuZXIpKTtcblxuICAgIHVuYmluZHMucHVzaChcbiAgICAgIHVuYmluZGFibGUoZG9jdW1lbnQsICdzY3JvbGwnLCAoKSA9PiBjbGVhckJvdW5kcyhzKSwgeyBjYXB0dXJlOiB0cnVlLCBwYXNzaXZlOiB0cnVlIH0pLFxuICAgICk7XG4gICAgdW5iaW5kcy5wdXNoKHVuYmluZGFibGUod2luZG93LCAncmVzaXplJywgKCkgPT4gY2xlYXJCb3VuZHMocyksIHsgcGFzc2l2ZTogdHJ1ZSB9KSk7XG4gIH1cblxuICByZXR1cm4gKCkgPT4gdW5iaW5kcy5mb3JFYWNoKChmKSA9PiBmKCkpO1xufVxuXG5mdW5jdGlvbiB1bmJpbmRhYmxlKFxuICBlbDogRXZlbnRUYXJnZXQsXG4gIGV2ZW50TmFtZTogc3RyaW5nLFxuICBjYWxsYmFjazogRXZlbnRMaXN0ZW5lcixcbiAgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zLFxuKTogc2cuVW5iaW5kIHtcbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrLCBvcHRpb25zKTtcbiAgcmV0dXJuICgpID0+IGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjaywgb3B0aW9ucyk7XG59XG5cbmZ1bmN0aW9uIHN0YXJ0RHJhZ09yRHJhdyhzOiBTdGF0ZSk6IE1vdWNoQmluZCB7XG4gIHJldHVybiAoZSkgPT4ge1xuICAgIGlmIChzLmRyYWdnYWJsZS5jdXJyZW50KSBkcmFnLmNhbmNlbChzKTtcbiAgICBlbHNlIGlmIChzLmRyYXdhYmxlLmN1cnJlbnQpIGRyYXcuY2FuY2VsKHMpO1xuICAgIGVsc2UgaWYgKGUuc2hpZnRLZXkgfHwgaXNSaWdodEJ1dHRvbihlKSB8fCBzLmRyYXdhYmxlLmZvcmNlZCkge1xuICAgICAgaWYgKHMuZHJhd2FibGUuZW5hYmxlZCkgZHJhdy5zdGFydChzLCBlKTtcbiAgICB9IGVsc2UgaWYgKCFzLnZpZXdPbmx5ICYmICFkcmFnLnVud2FudGVkRXZlbnQoZSkpIGRyYWcuc3RhcnQocywgZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGRyYWdPckRyYXcoczogU3RhdGUsIHdpdGhEcmFnOiBTdGF0ZU1vdWNoQmluZCwgd2l0aERyYXc6IFN0YXRlTW91Y2hCaW5kKTogTW91Y2hCaW5kIHtcbiAgcmV0dXJuIChlKSA9PiB7XG4gICAgaWYgKHMuZHJhd2FibGUuY3VycmVudCkge1xuICAgICAgaWYgKHMuZHJhd2FibGUuZW5hYmxlZCkgd2l0aERyYXcocywgZSk7XG4gICAgfSBlbHNlIGlmICghcy52aWV3T25seSkgd2l0aERyYWcocywgZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0YXJ0RHJhZ0Zyb21IYW5kKHM6IFN0YXRlKTogTW91Y2hCaW5kIHtcbiAgcmV0dXJuIChlKSA9PiB7XG4gICAgaWYgKHMucHJvbW90aW9uLmN1cnJlbnQpIHJldHVybjtcblxuICAgIGNvbnN0IHBvcyA9IGV2ZW50UG9zaXRpb24oZSksXG4gICAgICBwaWVjZSA9IHBvcyAmJiBnZXRIYW5kUGllY2VBdERvbVBvcyhwb3MsIHMuaGFuZHMucm9sZXMsIHMuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcygpKTtcblxuICAgIGlmIChwaWVjZSkge1xuICAgICAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQpIGRyYWcuY2FuY2VsKHMpO1xuICAgICAgZWxzZSBpZiAocy5kcmF3YWJsZS5jdXJyZW50KSBkcmF3LmNhbmNlbChzKTtcbiAgICAgIGVsc2UgaWYgKGlzTWlkZGxlQnV0dG9uKGUpKSB7XG4gICAgICAgIGlmIChzLmRyYXdhYmxlLmVuYWJsZWQpIHtcbiAgICAgICAgICBpZiAoZS5jYW5jZWxhYmxlICE9PSBmYWxzZSkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIGRyYXcuc2V0RHJhd1BpZWNlKHMsIHBpZWNlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChlLnNoaWZ0S2V5IHx8IGlzUmlnaHRCdXR0b24oZSkgfHwgcy5kcmF3YWJsZS5mb3JjZWQpIHtcbiAgICAgICAgaWYgKHMuZHJhd2FibGUuZW5hYmxlZCkgZHJhdy5zdGFydEZyb21IYW5kKHMsIHBpZWNlLCBlKTtcbiAgICAgIH0gZWxzZSBpZiAoIXMudmlld09ubHkgJiYgIWRyYWcudW53YW50ZWRFdmVudChlKSkge1xuICAgICAgICBpZiAoZS5jYW5jZWxhYmxlICE9PSBmYWxzZSkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBkcmFnLmRyYWdOZXdQaWVjZShzLCBwaWVjZSwgZSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBwcm9tb3RlKHM6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQgfCBudWxsLFxuICAgIGN1ciA9IHMucHJvbW90aW9uLmN1cnJlbnQ7XG4gIGlmICh0YXJnZXQgJiYgaXNQaWVjZU5vZGUodGFyZ2V0KSAmJiBjdXIpIHtcbiAgICBjb25zdCBwaWVjZSA9IHsgY29sb3I6IHRhcmdldC5zZ0NvbG9yLCByb2xlOiB0YXJnZXQuc2dSb2xlIH0sXG4gICAgICBwcm9tID0gIXNhbWVQaWVjZShjdXIucGllY2UsIHBpZWNlKTtcbiAgICBpZiAoY3VyLmRyYWdnZWQgfHwgKHMudHVybkNvbG9yICE9PSBzLmFjdGl2ZUNvbG9yICYmIHMuYWN0aXZlQ29sb3IgIT09ICdib3RoJykpIHtcbiAgICAgIGlmIChzLnNlbGVjdGVkKSB1c2VyTW92ZShzLCBzLnNlbGVjdGVkLCBjdXIua2V5LCBwcm9tKTtcbiAgICAgIGVsc2UgaWYgKHMuc2VsZWN0ZWRQaWVjZSkgdXNlckRyb3Aocywgcy5zZWxlY3RlZFBpZWNlLCBjdXIua2V5LCBwcm9tKTtcbiAgICB9IGVsc2UgYW5pbSgocykgPT4gc2VsZWN0U3F1YXJlKHMsIGN1ci5rZXksIHByb20pLCBzKTtcblxuICAgIGNhbGxVc2VyRnVuY3Rpb24ocy5wcm9tb3Rpb24uZXZlbnRzLmFmdGVyLCBwaWVjZSk7XG4gIH0gZWxzZSBhbmltKChzKSA9PiBjYW5jZWxQcm9tb3Rpb24ocyksIHMpO1xuICBzLnByb21vdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuXG4gIHMuZG9tLnJlZHJhdygpO1xufVxuIiwgImltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlIHsgQW5pbUN1cnJlbnQsIEFuaW1WZWN0b3JzLCBBbmltVmVjdG9yLCBBbmltRmFkaW5ncywgQW5pbVByb21vdGlvbnMgfSBmcm9tICcuL2FuaW0uanMnO1xuaW1wb3J0IHR5cGUgeyBEcmFnQ3VycmVudCB9IGZyb20gJy4vZHJhZy5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHtcbiAga2V5MnBvcyxcbiAgY3JlYXRlRWwsXG4gIHNldERpc3BsYXksXG4gIHBvc1RvVHJhbnNsYXRlUmVsLFxuICB0cmFuc2xhdGVSZWwsXG4gIHBpZWNlTmFtZU9mLFxuICBzZW50ZVBvdixcbiAgaXNQaWVjZU5vZGUsXG4gIGlzU3F1YXJlTm9kZSxcbn0gZnJvbSAnLi91dGlsLmpzJztcblxudHlwZSBTcXVhcmVDbGFzc2VzID0gTWFwPHNnLktleSwgc3RyaW5nPjtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlcihzOiBTdGF0ZSwgYm9hcmRFbHM6IHNnLkJvYXJkRWxlbWVudHMpOiB2b2lkIHtcbiAgY29uc3QgYXNTZW50ZTogYm9vbGVhbiA9IHNlbnRlUG92KHMub3JpZW50YXRpb24pLFxuICAgIHNjYWxlRG93biA9IHMuc2NhbGVEb3duUGllY2VzID8gMC41IDogMSxcbiAgICBwb3NUb1RyYW5zbGF0ZSA9IHBvc1RvVHJhbnNsYXRlUmVsKHMuZGltZW5zaW9ucyksXG4gICAgc3F1YXJlc0VsOiBIVE1MRWxlbWVudCA9IGJvYXJkRWxzLnNxdWFyZXMsXG4gICAgcGllY2VzRWw6IEhUTUxFbGVtZW50ID0gYm9hcmRFbHMucGllY2VzLFxuICAgIGRyYWdnZWRFbDogc2cuUGllY2VOb2RlIHwgdW5kZWZpbmVkID0gYm9hcmRFbHMuZHJhZ2dlZCxcbiAgICBzcXVhcmVPdmVyRWw6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkID0gYm9hcmRFbHMuc3F1YXJlT3ZlcixcbiAgICBwcm9tb3Rpb25FbDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQgPSBib2FyZEVscy5wcm9tb3Rpb24sXG4gICAgcGllY2VzOiBzZy5QaWVjZXMgPSBzLnBpZWNlcyxcbiAgICBjdXJBbmltOiBBbmltQ3VycmVudCB8IHVuZGVmaW5lZCA9IHMuYW5pbWF0aW9uLmN1cnJlbnQsXG4gICAgYW5pbXM6IEFuaW1WZWN0b3JzID0gY3VyQW5pbSA/IGN1ckFuaW0ucGxhbi5hbmltcyA6IG5ldyBNYXAoKSxcbiAgICBmYWRpbmdzOiBBbmltRmFkaW5ncyA9IGN1ckFuaW0gPyBjdXJBbmltLnBsYW4uZmFkaW5ncyA6IG5ldyBNYXAoKSxcbiAgICBwcm9tb3Rpb25zOiBBbmltUHJvbW90aW9ucyA9IGN1ckFuaW0gPyBjdXJBbmltLnBsYW4ucHJvbW90aW9ucyA6IG5ldyBNYXAoKSxcbiAgICBjdXJEcmFnOiBEcmFnQ3VycmVudCB8IHVuZGVmaW5lZCA9IHMuZHJhZ2dhYmxlLmN1cnJlbnQsXG4gICAgY3VyUHJvbUtleTogc2cuS2V5IHwgdW5kZWZpbmVkID0gcy5wcm9tb3Rpb24uY3VycmVudD8uZHJhZ2dlZCA/IHMuc2VsZWN0ZWQgOiB1bmRlZmluZWQsXG4gICAgc3F1YXJlczogU3F1YXJlQ2xhc3NlcyA9IGNvbXB1dGVTcXVhcmVDbGFzc2VzKHMpLFxuICAgIHNhbWVQaWVjZXMgPSBuZXcgU2V0PHNnLktleT4oKSxcbiAgICBtb3ZlZFBpZWNlcyA9IG5ldyBNYXA8c2cuUGllY2VOYW1lLCBzZy5QaWVjZU5vZGVbXT4oKTtcblxuICAvLyBpZiBwaWVjZSBub3QgYmVpbmcgZHJhZ2dlZCBhbnltb3JlLCBoaWRlIGl0XG4gIGlmICghY3VyRHJhZyAmJiBkcmFnZ2VkRWw/LnNnRHJhZ2dpbmcpIHtcbiAgICBkcmFnZ2VkRWwuc2dEcmFnZ2luZyA9IGZhbHNlO1xuICAgIHNldERpc3BsYXkoZHJhZ2dlZEVsLCBmYWxzZSk7XG4gICAgaWYgKHNxdWFyZU92ZXJFbCkgc2V0RGlzcGxheShzcXVhcmVPdmVyRWwsIGZhbHNlKTtcbiAgfVxuXG4gIGxldCBrOiBzZy5LZXksXG4gICAgZWw6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkLFxuICAgIHBpZWNlQXRLZXk6IHNnLlBpZWNlIHwgdW5kZWZpbmVkLFxuICAgIGVsUGllY2VOYW1lOiBzZy5QaWVjZU5hbWUsXG4gICAgYW5pbTogQW5pbVZlY3RvciB8IHVuZGVmaW5lZCxcbiAgICBmYWRpbmc6IHNnLlBpZWNlIHwgdW5kZWZpbmVkLFxuICAgIHByb206IHNnLlBpZWNlIHwgdW5kZWZpbmVkLFxuICAgIHBNdmRzZXQ6IHNnLlBpZWNlTm9kZVtdIHwgdW5kZWZpbmVkLFxuICAgIHBNdmQ6IHNnLlBpZWNlTm9kZSB8IHVuZGVmaW5lZDtcblxuICAvLyB3YWxrIG92ZXIgYWxsIGJvYXJkIGRvbSBlbGVtZW50cywgYXBwbHkgYW5pbWF0aW9ucyBhbmQgZmxhZyBtb3ZlZCBwaWVjZXNcbiAgZWwgPSBwaWVjZXNFbC5maXJzdEVsZW1lbnRDaGlsZCBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgd2hpbGUgKGVsKSB7XG4gICAgaWYgKGlzUGllY2VOb2RlKGVsKSkge1xuICAgICAgayA9IGVsLnNnS2V5O1xuICAgICAgcGllY2VBdEtleSA9IHBpZWNlcy5nZXQoayk7XG4gICAgICBhbmltID0gYW5pbXMuZ2V0KGspO1xuICAgICAgZmFkaW5nID0gZmFkaW5ncy5nZXQoayk7XG4gICAgICBwcm9tID0gcHJvbW90aW9ucy5nZXQoayk7XG4gICAgICBlbFBpZWNlTmFtZSA9IHBpZWNlTmFtZU9mKHsgY29sb3I6IGVsLnNnQ29sb3IsIHJvbGU6IGVsLnNnUm9sZSB9KTtcblxuICAgICAgLy8gaWYgcGllY2UgZHJhZ2dlZCBhZGQgb3IgcmVtb3ZlIGdob3N0IGNsYXNzIG9yIGlmIHByb21vdGlvbiBkaWFsb2cgaXMgYWN0aXZlIGZvciB0aGUgcGllY2UgYWRkIHByb20gY2xhc3NcbiAgICAgIGlmIChcbiAgICAgICAgKChjdXJEcmFnPy5zdGFydGVkICYmIGN1ckRyYWcuZnJvbUJvYXJkPy5vcmlnID09PSBrKSB8fCAoY3VyUHJvbUtleSAmJiBjdXJQcm9tS2V5ID09PSBrKSkgJiZcbiAgICAgICAgIWVsLnNnR2hvc3RcbiAgICAgICkge1xuICAgICAgICBlbC5zZ0dob3N0ID0gdHJ1ZTtcbiAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2hvc3QnKTtcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIGVsLnNnR2hvc3QgJiZcbiAgICAgICAgKCFjdXJEcmFnIHx8IGN1ckRyYWcuZnJvbUJvYXJkPy5vcmlnICE9PSBrKSAmJlxuICAgICAgICAoIWN1clByb21LZXkgfHwgY3VyUHJvbUtleSAhPT0gaylcbiAgICAgICkge1xuICAgICAgICBlbC5zZ0dob3N0ID0gZmFsc2U7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2dob3N0Jyk7XG4gICAgICB9XG4gICAgICAvLyByZW1vdmUgZmFkaW5nIGNsYXNzIGlmIGl0IHN0aWxsIHJlbWFpbnNcbiAgICAgIGlmICghZmFkaW5nICYmIGVsLnNnRmFkaW5nKSB7XG4gICAgICAgIGVsLnNnRmFkaW5nID0gZmFsc2U7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2ZhZGluZycpO1xuICAgICAgfVxuICAgICAgLy8gdGhlcmUgaXMgbm93IGEgcGllY2UgYXQgdGhpcyBkb20ga2V5XG4gICAgICBpZiAocGllY2VBdEtleSkge1xuICAgICAgICAvLyBjb250aW51ZSBhbmltYXRpb24gaWYgYWxyZWFkeSBhbmltYXRpbmcgYW5kIHNhbWUgcGllY2Ugb3IgcHJvbW90aW5nIHBpZWNlXG4gICAgICAgIC8vIChvdGhlcndpc2UgaXQgY291bGQgYW5pbWF0ZSBhIGNhcHR1cmVkIHBpZWNlKVxuICAgICAgICBpZiAoXG4gICAgICAgICAgYW5pbSAmJlxuICAgICAgICAgIGVsLnNnQW5pbWF0aW5nICYmXG4gICAgICAgICAgKGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihwaWVjZUF0S2V5KSB8fCAocHJvbSAmJiBlbFBpZWNlTmFtZSA9PT0gcGllY2VOYW1lT2YocHJvbSkpKVxuICAgICAgICApIHtcbiAgICAgICAgICBjb25zdCBwb3MgPSBrZXkycG9zKGspO1xuICAgICAgICAgIHBvc1swXSArPSBhbmltWzJdO1xuICAgICAgICAgIHBvc1sxXSArPSBhbmltWzNdO1xuICAgICAgICAgIHRyYW5zbGF0ZVJlbChlbCwgcG9zVG9UcmFuc2xhdGUocG9zLCBhc1NlbnRlKSwgc2NhbGVEb3duKTtcbiAgICAgICAgfSBlbHNlIGlmIChlbC5zZ0FuaW1hdGluZykge1xuICAgICAgICAgIGVsLnNnQW5pbWF0aW5nID0gZmFsc2U7XG4gICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnYW5pbScpO1xuICAgICAgICAgIHRyYW5zbGF0ZVJlbChlbCwgcG9zVG9UcmFuc2xhdGUoa2V5MnBvcyhrKSwgYXNTZW50ZSksIHNjYWxlRG93bik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gc2FtZSBwaWVjZTogZmxhZyBhcyBzYW1lXG4gICAgICAgIGlmIChlbFBpZWNlTmFtZSA9PT0gcGllY2VOYW1lT2YocGllY2VBdEtleSkgJiYgKCFmYWRpbmcgfHwgIWVsLnNnRmFkaW5nKSkge1xuICAgICAgICAgIHNhbWVQaWVjZXMuYWRkKGspO1xuICAgICAgICB9XG4gICAgICAgIC8vIGRpZmZlcmVudCBwaWVjZTogZmxhZyBhcyBtb3ZlZCB1bmxlc3MgaXQgaXMgYSBmYWRpbmcgcGllY2Ugb3IgYW4gYW5pbWF0ZWQgcHJvbW90aW5nIHBpZWNlXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGlmIChmYWRpbmcgJiYgZWxQaWVjZU5hbWUgPT09IHBpZWNlTmFtZU9mKGZhZGluZykpIHtcbiAgICAgICAgICAgIGVsLnNnRmFkaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2ZhZGluZycpO1xuICAgICAgICAgIH0gZWxzZSBpZiAocHJvbSAmJiBlbFBpZWNlTmFtZSA9PT0gcGllY2VOYW1lT2YocHJvbSkpIHtcbiAgICAgICAgICAgIHNhbWVQaWVjZXMuYWRkKGspO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcHBlbmRWYWx1ZShtb3ZlZFBpZWNlcywgZWxQaWVjZU5hbWUsIGVsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIG5vIHBpZWNlOiBmbGFnIGFzIG1vdmVkXG4gICAgICBlbHNlIHtcbiAgICAgICAgYXBwZW5kVmFsdWUobW92ZWRQaWVjZXMsIGVsUGllY2VOYW1lLCBlbCk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsID0gZWwubmV4dEVsZW1lbnRTaWJsaW5nIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICB9XG5cbiAgLy8gd2FsayBvdmVyIGFsbCBzcXVhcmVzIGFuZCBhcHBseSBjbGFzc2VzXG4gIGxldCBzcUVsID0gc3F1YXJlc0VsLmZpcnN0RWxlbWVudENoaWxkIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICB3aGlsZSAoc3FFbCAmJiBpc1NxdWFyZU5vZGUoc3FFbCkpIHtcbiAgICBzcUVsLmNsYXNzTmFtZSA9IHNxdWFyZXMuZ2V0KHNxRWwuc2dLZXkpIHx8ICcnO1xuICAgIHNxRWwgPSBzcUVsLm5leHRFbGVtZW50U2libGluZyBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8vIHdhbGsgb3ZlciBhbGwgcGllY2VzIGluIGN1cnJlbnQgc2V0LCBhcHBseSBkb20gY2hhbmdlcyB0byBtb3ZlZCBwaWVjZXNcbiAgLy8gb3IgYXBwZW5kIG5ldyBwaWVjZXNcbiAgZm9yIChjb25zdCBbaywgcF0gb2YgcGllY2VzKSB7XG4gICAgY29uc3QgcGllY2UgPSBwcm9tb3Rpb25zLmdldChrKSB8fCBwO1xuICAgIGFuaW0gPSBhbmltcy5nZXQoayk7XG4gICAgaWYgKCFzYW1lUGllY2VzLmhhcyhrKSkge1xuICAgICAgcE12ZHNldCA9IG1vdmVkUGllY2VzLmdldChwaWVjZU5hbWVPZihwaWVjZSkpO1xuICAgICAgcE12ZCA9IHBNdmRzZXQ/LnBvcCgpO1xuICAgICAgLy8gYSBzYW1lIHBpZWNlIHdhcyBtb3ZlZFxuICAgICAgaWYgKHBNdmQpIHtcbiAgICAgICAgLy8gYXBwbHkgZG9tIGNoYW5nZXNcbiAgICAgICAgcE12ZC5zZ0tleSA9IGs7XG4gICAgICAgIGlmIChwTXZkLnNnRmFkaW5nKSB7XG4gICAgICAgICAgcE12ZC5zZ0ZhZGluZyA9IGZhbHNlO1xuICAgICAgICAgIHBNdmQuY2xhc3NMaXN0LnJlbW92ZSgnZmFkaW5nJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcG9zID0ga2V5MnBvcyhrKTtcbiAgICAgICAgaWYgKGFuaW0pIHtcbiAgICAgICAgICBwTXZkLnNnQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgICAgICBwTXZkLmNsYXNzTGlzdC5hZGQoJ2FuaW0nKTtcbiAgICAgICAgICBwb3NbMF0gKz0gYW5pbVsyXTtcbiAgICAgICAgICBwb3NbMV0gKz0gYW5pbVszXTtcbiAgICAgICAgfVxuICAgICAgICB0cmFuc2xhdGVSZWwocE12ZCwgcG9zVG9UcmFuc2xhdGUocG9zLCBhc1NlbnRlKSwgc2NhbGVEb3duKTtcbiAgICAgIH1cbiAgICAgIC8vIG5vIHBpZWNlIGluIG1vdmVkIG9iajogaW5zZXJ0IHRoZSBuZXcgcGllY2VcbiAgICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBwaWVjZU5vZGUgPSBjcmVhdGVFbCgncGllY2UnLCBwaWVjZU5hbWVPZihwKSkgYXMgc2cuUGllY2VOb2RlLFxuICAgICAgICAgIHBvcyA9IGtleTJwb3Moayk7XG5cbiAgICAgICAgcGllY2VOb2RlLnNnQ29sb3IgPSBwLmNvbG9yO1xuICAgICAgICBwaWVjZU5vZGUuc2dSb2xlID0gcC5yb2xlO1xuICAgICAgICBwaWVjZU5vZGUuc2dLZXkgPSBrO1xuICAgICAgICBpZiAoYW5pbSkge1xuICAgICAgICAgIHBpZWNlTm9kZS5zZ0FuaW1hdGluZyA9IHRydWU7XG4gICAgICAgICAgcG9zWzBdICs9IGFuaW1bMl07XG4gICAgICAgICAgcG9zWzFdICs9IGFuaW1bM107XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNsYXRlUmVsKHBpZWNlTm9kZSwgcG9zVG9UcmFuc2xhdGUocG9zLCBhc1NlbnRlKSwgc2NhbGVEb3duKTtcblxuICAgICAgICBwaWVjZXNFbC5hcHBlbmRDaGlsZChwaWVjZU5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvLyByZW1vdmUgYW55IGVsZW1lbnQgdGhhdCByZW1haW5zIGluIHRoZSBtb3ZlZCBzZXRzXG4gIGZvciAoY29uc3Qgbm9kZXMgb2YgbW92ZWRQaWVjZXMudmFsdWVzKCkpIHtcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICAgIHBpZWNlc0VsLnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChwcm9tb3Rpb25FbCkgcmVuZGVyUHJvbW90aW9uKHMsIHByb21vdGlvbkVsKTtcbn1cblxuZnVuY3Rpb24gYXBwZW5kVmFsdWU8SywgVj4obWFwOiBNYXA8SywgVltdPiwga2V5OiBLLCB2YWx1ZTogVik6IHZvaWQge1xuICBjb25zdCBhcnIgPSBtYXAuZ2V0KGtleSk7XG4gIGlmIChhcnIpIGFyci5wdXNoKHZhbHVlKTtcbiAgZWxzZSBtYXAuc2V0KGtleSwgW3ZhbHVlXSk7XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVTcXVhcmVDbGFzc2VzKHM6IFN0YXRlKTogU3F1YXJlQ2xhc3NlcyB7XG4gIGNvbnN0IHNxdWFyZXM6IFNxdWFyZUNsYXNzZXMgPSBuZXcgTWFwKCk7XG4gIGlmIChzLmxhc3REZXN0cyAmJiBzLmhpZ2hsaWdodC5sYXN0RGVzdHMpXG4gICAgZm9yIChjb25zdCBrIG9mIHMubGFzdERlc3RzKSBhZGRTcXVhcmUoc3F1YXJlcywgaywgJ2xhc3QtZGVzdCcpO1xuICBpZiAocy5jaGVja3MgJiYgcy5oaWdobGlnaHQuY2hlY2spXG4gICAgZm9yIChjb25zdCBjaGVjayBvZiBzLmNoZWNrcykgYWRkU3F1YXJlKHNxdWFyZXMsIGNoZWNrLCAnY2hlY2snKTtcbiAgaWYgKHMuaG92ZXJlZCkgYWRkU3F1YXJlKHNxdWFyZXMsIHMuaG92ZXJlZCwgJ2hvdmVyJyk7XG4gIGlmIChzLnNlbGVjdGVkKSB7XG4gICAgaWYgKHMuYWN0aXZlQ29sb3IgPT09ICdib3RoJyB8fCBzLmFjdGl2ZUNvbG9yID09PSBzLnR1cm5Db2xvcilcbiAgICAgIGFkZFNxdWFyZShzcXVhcmVzLCBzLnNlbGVjdGVkLCAnc2VsZWN0ZWQnKTtcbiAgICBlbHNlIGFkZFNxdWFyZShzcXVhcmVzLCBzLnNlbGVjdGVkLCAncHJlc2VsZWN0ZWQnKTtcbiAgICBpZiAocy5tb3ZhYmxlLnNob3dEZXN0cykge1xuICAgICAgY29uc3QgZGVzdHMgPSBzLm1vdmFibGUuZGVzdHM/LmdldChzLnNlbGVjdGVkKTtcbiAgICAgIGlmIChkZXN0cylcbiAgICAgICAgZm9yIChjb25zdCBrIG9mIGRlc3RzKSB7XG4gICAgICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIGssICdkZXN0JyArIChzLnBpZWNlcy5oYXMoaykgPyAnIG9jJyA6ICcnKSk7XG4gICAgICAgIH1cbiAgICAgIGNvbnN0IHBEZXN0cyA9IHMucHJlbW92YWJsZS5kZXN0cztcbiAgICAgIGlmIChwRGVzdHMpXG4gICAgICAgIGZvciAoY29uc3QgayBvZiBwRGVzdHMpIHtcbiAgICAgICAgICBhZGRTcXVhcmUoc3F1YXJlcywgaywgJ3ByZS1kZXN0JyArIChzLnBpZWNlcy5oYXMoaykgPyAnIG9jJyA6ICcnKSk7XG4gICAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAocy5zZWxlY3RlZFBpZWNlKSB7XG4gICAgaWYgKHMuZHJvcHBhYmxlLnNob3dEZXN0cykge1xuICAgICAgY29uc3QgZGVzdHMgPSBzLmRyb3BwYWJsZS5kZXN0cz8uZ2V0KHBpZWNlTmFtZU9mKHMuc2VsZWN0ZWRQaWVjZSkpO1xuICAgICAgaWYgKGRlc3RzKVxuICAgICAgICBmb3IgKGNvbnN0IGsgb2YgZGVzdHMpIHtcbiAgICAgICAgICBhZGRTcXVhcmUoc3F1YXJlcywgaywgJ2Rlc3QnKTtcbiAgICAgICAgfVxuICAgICAgY29uc3QgcERlc3RzID0gcy5wcmVkcm9wcGFibGUuZGVzdHM7XG4gICAgICBpZiAocERlc3RzKVxuICAgICAgICBmb3IgKGNvbnN0IGsgb2YgcERlc3RzKSB7XG4gICAgICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIGssICdwcmUtZGVzdCcgKyAocy5waWVjZXMuaGFzKGspID8gJyBvYycgOiAnJykpO1xuICAgICAgICB9XG4gICAgfVxuICB9XG4gIGNvbnN0IHByZW1vdmUgPSBzLnByZW1vdmFibGUuY3VycmVudDtcbiAgaWYgKHByZW1vdmUpIHtcbiAgICBhZGRTcXVhcmUoc3F1YXJlcywgcHJlbW92ZS5vcmlnLCAnY3VycmVudC1wcmUnKTtcbiAgICBhZGRTcXVhcmUoc3F1YXJlcywgcHJlbW92ZS5kZXN0LCAnY3VycmVudC1wcmUnICsgKHByZW1vdmUucHJvbSA/ICcgcHJvbScgOiAnJykpO1xuICB9IGVsc2UgaWYgKHMucHJlZHJvcHBhYmxlLmN1cnJlbnQpXG4gICAgYWRkU3F1YXJlKFxuICAgICAgc3F1YXJlcyxcbiAgICAgIHMucHJlZHJvcHBhYmxlLmN1cnJlbnQua2V5LFxuICAgICAgJ2N1cnJlbnQtcHJlJyArIChzLnByZWRyb3BwYWJsZS5jdXJyZW50LnByb20gPyAnIHByb20nIDogJycpLFxuICAgICk7XG5cbiAgZm9yIChjb25zdCBzcWggb2Ygcy5kcmF3YWJsZS5zcXVhcmVzKSB7XG4gICAgYWRkU3F1YXJlKHNxdWFyZXMsIHNxaC5rZXksIHNxaC5jbGFzc05hbWUpO1xuICB9XG5cbiAgcmV0dXJuIHNxdWFyZXM7XG59XG5cbmZ1bmN0aW9uIGFkZFNxdWFyZShzcXVhcmVzOiBTcXVhcmVDbGFzc2VzLCBrZXk6IHNnLktleSwga2xhc3M6IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCBjbGFzc2VzID0gc3F1YXJlcy5nZXQoa2V5KTtcbiAgaWYgKGNsYXNzZXMpIHNxdWFyZXMuc2V0KGtleSwgYCR7Y2xhc3Nlc30gJHtrbGFzc31gKTtcbiAgZWxzZSBzcXVhcmVzLnNldChrZXksIGtsYXNzKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyUHJvbW90aW9uKHM6IFN0YXRlLCBwcm9tb3Rpb25FbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgY29uc3QgY3VyID0gcy5wcm9tb3Rpb24uY3VycmVudCxcbiAgICBrZXkgPSBjdXI/LmtleSxcbiAgICBwaWVjZXMgPSBjdXIgPyBbY3VyLnByb21vdGVkUGllY2UsIGN1ci5waWVjZV0gOiBbXSxcbiAgICBoYXNoID0gcHJvbW90aW9uSGFzaCghIWN1ciwga2V5LCBwaWVjZXMpO1xuICBpZiAocy5wcm9tb3Rpb24ucHJldlByb21vdGlvbkhhc2ggPT09IGhhc2gpIHJldHVybjtcbiAgcy5wcm9tb3Rpb24ucHJldlByb21vdGlvbkhhc2ggPSBoYXNoO1xuXG4gIGlmIChrZXkpIHtcbiAgICBjb25zdCBhc1NlbnRlID0gc2VudGVQb3Yocy5vcmllbnRhdGlvbiksXG4gICAgICBpbml0UG9zID0ga2V5MnBvcyhrZXkpLFxuICAgICAgY29sb3IgPSBjdXIucGllY2UuY29sb3IsXG4gICAgICBwcm9tb3Rpb25TcXVhcmUgPSBjcmVhdGVFbCgnc2ctcHJvbW90aW9uLXNxdWFyZScpLFxuICAgICAgcHJvbW90aW9uQ2hvaWNlcyA9IGNyZWF0ZUVsKCdzZy1wcm9tb3Rpb24tY2hvaWNlcycpO1xuICAgIGlmIChzLm9yaWVudGF0aW9uICE9PSBjb2xvcikgcHJvbW90aW9uQ2hvaWNlcy5jbGFzc0xpc3QuYWRkKCdyZXZlcnNlZCcpO1xuICAgIHRyYW5zbGF0ZVJlbChwcm9tb3Rpb25TcXVhcmUsIHBvc1RvVHJhbnNsYXRlUmVsKHMuZGltZW5zaW9ucykoaW5pdFBvcywgYXNTZW50ZSksIDEpO1xuXG4gICAgZm9yIChjb25zdCBwIG9mIHBpZWNlcykge1xuICAgICAgY29uc3QgcGllY2VOb2RlID0gY3JlYXRlRWwoJ3BpZWNlJywgcGllY2VOYW1lT2YocCkpIGFzIHNnLlBpZWNlTm9kZTtcbiAgICAgIHBpZWNlTm9kZS5zZ0NvbG9yID0gcC5jb2xvcjtcbiAgICAgIHBpZWNlTm9kZS5zZ1JvbGUgPSBwLnJvbGU7XG4gICAgICBwcm9tb3Rpb25DaG9pY2VzLmFwcGVuZENoaWxkKHBpZWNlTm9kZSk7XG4gICAgfVxuXG4gICAgcHJvbW90aW9uRWwuaW5uZXJIVE1MID0gJyc7XG4gICAgcHJvbW90aW9uU3F1YXJlLmFwcGVuZENoaWxkKHByb21vdGlvbkNob2ljZXMpO1xuICAgIHByb21vdGlvbkVsLmFwcGVuZENoaWxkKHByb21vdGlvblNxdWFyZSk7XG4gICAgc2V0RGlzcGxheShwcm9tb3Rpb25FbCwgdHJ1ZSk7XG4gIH0gZWxzZSB7XG4gICAgc2V0RGlzcGxheShwcm9tb3Rpb25FbCwgZmFsc2UpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHByb21vdGlvbkhhc2goYWN0aXZlOiBib29sZWFuLCBrZXk6IHNnLktleSB8IHVuZGVmaW5lZCwgcGllY2VzOiBzZy5QaWVjZVtdKTogc3RyaW5nIHtcbiAgcmV0dXJuIFthY3RpdmUsIGtleSwgcGllY2VzLm1hcCgocCkgPT4gcGllY2VOYW1lT2YocCkpLmpvaW4oJyAnKV0uam9pbignICcpO1xufVxuIiwgImltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlIHsgV3JhcEVsZW1lbnRzLCBXcmFwRWxlbWVudHNCb29sZWFuIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyB3cmFwQm9hcmQsIHdyYXBIYW5kIH0gZnJvbSAnLi93cmFwLmpzJztcbmltcG9ydCAqIGFzIGV2ZW50cyBmcm9tICcuL2V2ZW50cy5qcyc7XG5pbXBvcnQgeyByZW5kZXJIYW5kIH0gZnJvbSAnLi9oYW5kcy5qcyc7XG5pbXBvcnQgeyByZW5kZXIgfSBmcm9tICcuL3JlbmRlci5qcyc7XG5cbmZ1bmN0aW9uIGF0dGFjaEJvYXJkKHN0YXRlOiBTdGF0ZSwgYm9hcmRXcmFwOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICBjb25zdCBlbGVtZW50cyA9IHdyYXBCb2FyZChib2FyZFdyYXAsIHN0YXRlKTtcblxuICAvLyBpbiBjYXNlIG9mIGlubGluZWQgaGFuZHNcbiAgaWYgKGVsZW1lbnRzLmhhbmRzKSBhdHRhY2hIYW5kcyhzdGF0ZSwgZWxlbWVudHMuaGFuZHMudG9wLCBlbGVtZW50cy5oYW5kcy5ib3R0b20pO1xuXG4gIHN0YXRlLmRvbS53cmFwRWxlbWVudHMuYm9hcmQgPSBib2FyZFdyYXA7XG4gIHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZCA9IGVsZW1lbnRzO1xuICBzdGF0ZS5kb20uYm91bmRzLmJvYXJkLmJvdW5kcy5jbGVhcigpO1xuXG4gIGV2ZW50cy5iaW5kQm9hcmQoc3RhdGUsIGVsZW1lbnRzKTtcblxuICBzdGF0ZS5kcmF3YWJsZS5wcmV2U3ZnSGFzaCA9ICcnO1xuICBzdGF0ZS5wcm9tb3Rpb24ucHJldlByb21vdGlvbkhhc2ggPSAnJztcblxuICByZW5kZXIoc3RhdGUsIGVsZW1lbnRzKTtcbn1cblxuZnVuY3Rpb24gYXR0YWNoSGFuZHMoc3RhdGU6IFN0YXRlLCBoYW5kVG9wV3JhcD86IEhUTUxFbGVtZW50LCBoYW5kQm90dG9tV3JhcD86IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gIGlmICghc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzKSBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMgPSB7fTtcbiAgaWYgKCFzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmhhbmRzKSBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmhhbmRzID0ge307XG5cbiAgaWYgKGhhbmRUb3BXcmFwKSB7XG4gICAgY29uc3QgaGFuZFRvcCA9IHdyYXBIYW5kKGhhbmRUb3BXcmFwLCAndG9wJywgc3RhdGUpO1xuICAgIHN0YXRlLmRvbS53cmFwRWxlbWVudHMuaGFuZHMudG9wID0gaGFuZFRvcFdyYXA7XG4gICAgc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzLnRvcCA9IGhhbmRUb3A7XG4gICAgZXZlbnRzLmJpbmRIYW5kKHN0YXRlLCBoYW5kVG9wKTtcbiAgICByZW5kZXJIYW5kKHN0YXRlLCBoYW5kVG9wKTtcbiAgfVxuICBpZiAoaGFuZEJvdHRvbVdyYXApIHtcbiAgICBjb25zdCBoYW5kQm90dG9tID0gd3JhcEhhbmQoaGFuZEJvdHRvbVdyYXAsICdib3R0b20nLCBzdGF0ZSk7XG4gICAgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5oYW5kcy5ib3R0b20gPSBoYW5kQm90dG9tV3JhcDtcbiAgICBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMuYm90dG9tID0gaGFuZEJvdHRvbTtcbiAgICBldmVudHMuYmluZEhhbmQoc3RhdGUsIGhhbmRCb3R0b20pO1xuICAgIHJlbmRlckhhbmQoc3RhdGUsIGhhbmRCb3R0b20pO1xuICB9XG5cbiAgaWYgKGhhbmRUb3BXcmFwIHx8IGhhbmRCb3R0b21XcmFwKSB7XG4gICAgc3RhdGUuZG9tLmJvdW5kcy5oYW5kcy5ib3VuZHMuY2xlYXIoKTtcbiAgICBzdGF0ZS5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzLmNsZWFyKCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZHJhd0FsbCh3cmFwRWxlbWVudHM6IFdyYXBFbGVtZW50cywgc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGlmICh3cmFwRWxlbWVudHMuYm9hcmQpIGF0dGFjaEJvYXJkKHN0YXRlLCB3cmFwRWxlbWVudHMuYm9hcmQpO1xuICBpZiAod3JhcEVsZW1lbnRzLmhhbmRzICYmICFzdGF0ZS5oYW5kcy5pbmxpbmVkKVxuICAgIGF0dGFjaEhhbmRzKHN0YXRlLCB3cmFwRWxlbWVudHMuaGFuZHMudG9wLCB3cmFwRWxlbWVudHMuaGFuZHMuYm90dG9tKTtcblxuICAvLyBzaGFwZXMgbWlnaHQgZGVwZW5kIGJvdGggb24gYm9hcmQgYW5kIGhhbmRzIC0gcmVkcmF3IG9ubHkgYWZ0ZXIgYm90aCBhcmUgZG9uZVxuICBzdGF0ZS5kb20ucmVkcmF3U2hhcGVzKCk7XG5cbiAgaWYgKHN0YXRlLmV2ZW50cy5pbnNlcnQpXG4gICAgc3RhdGUuZXZlbnRzLmluc2VydCh3cmFwRWxlbWVudHMuYm9hcmQgJiYgc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkLCB7XG4gICAgICB0b3A6IHdyYXBFbGVtZW50cy5oYW5kcz8udG9wICYmIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcz8udG9wLFxuICAgICAgYm90dG9tOiB3cmFwRWxlbWVudHMuaGFuZHM/LmJvdHRvbSAmJiBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHM/LmJvdHRvbSxcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRldGFjaEVsZW1lbnRzKHdlYjogV3JhcEVsZW1lbnRzQm9vbGVhbiwgc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGlmICh3ZWIuYm9hcmQpIHtcbiAgICBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmJvYXJkID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZCA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20uYm91bmRzLmJvYXJkLmJvdW5kcy5jbGVhcigpO1xuICB9XG4gIGlmIChzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMgJiYgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5oYW5kcykge1xuICAgIGlmICh3ZWIuaGFuZHM/LnRvcCkge1xuICAgICAgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5oYW5kcy50b3AgPSB1bmRlZmluZWQ7XG4gICAgICBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMudG9wID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAod2ViLmhhbmRzPy5ib3R0b20pIHtcbiAgICAgIHN0YXRlLmRvbS53cmFwRWxlbWVudHMuaGFuZHMuYm90dG9tID0gdW5kZWZpbmVkO1xuICAgICAgc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzLmJvdHRvbSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKHdlYi5oYW5kcz8udG9wIHx8IHdlYi5oYW5kcz8uYm90dG9tKSB7XG4gICAgICBzdGF0ZS5kb20uYm91bmRzLmhhbmRzLmJvdW5kcy5jbGVhcigpO1xuICAgICAgc3RhdGUuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcy5jbGVhcigpO1xuICAgIH1cbiAgfVxufVxuIiwgImltcG9ydCB0eXBlIHsgQ29uZmlnIH0gZnJvbSAnLi9jb25maWcuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgeyBEcmF3U2hhcGUsIFNxdWFyZUhpZ2hsaWdodCB9IGZyb20gJy4vZHJhdy5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0ICogYXMgYm9hcmQgZnJvbSAnLi9ib2FyZC5qcyc7XG5pbXBvcnQgeyBhZGRUb0hhbmQsIHJlbW92ZUZyb21IYW5kIH0gZnJvbSAnLi9oYW5kcy5qcyc7XG5pbXBvcnQgeyBpbmZlckRpbWVuc2lvbnMsIGJvYXJkVG9TZmVuLCBoYW5kc1RvU2ZlbiB9IGZyb20gJy4vc2Zlbi5qcyc7XG5pbXBvcnQgeyBhcHBseUFuaW1hdGlvbiwgY29uZmlndXJlIH0gZnJvbSAnLi9jb25maWcuanMnO1xuaW1wb3J0IHsgYW5pbSwgcmVuZGVyIH0gZnJvbSAnLi9hbmltLmpzJztcbmltcG9ydCB7IGNhbmNlbCBhcyBkcmFnQ2FuY2VsLCBkcmFnTmV3UGllY2UgfSBmcm9tICcuL2RyYWcuanMnO1xuaW1wb3J0IHsgZGV0YWNoRWxlbWVudHMsIHJlZHJhd0FsbCB9IGZyb20gJy4vZG9tLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBBcGkge1xuICAvLyBhdHRhY2ggZWxlbWVudHMgdG8gY3VycmVudCBzZyBpbnN0YW5jZVxuICBhdHRhY2god3JhcEVsZW1lbnRzOiBzZy5XcmFwRWxlbWVudHMpOiB2b2lkO1xuXG4gIC8vIGRldGFjaCBlbGVtZW50cyBmcm9tIGN1cnJlbnQgc2cgaW5zdGFuY2VcbiAgZGV0YWNoKHdyYXBFbGVtZW50c0Jvb2xlYW46IHNnLldyYXBFbGVtZW50c0Jvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIHJlY29uZmlndXJlIHRoZSBpbnN0YW5jZS4gQWNjZXB0cyBhbGwgY29uZmlnIG9wdGlvbnNcbiAgLy8gYm9hcmQgd2lsbCBiZSBhbmltYXRlZCBhY2NvcmRpbmdseSwgaWYgYW5pbWF0aW9ucyBhcmUgZW5hYmxlZFxuICBzZXQoY29uZmlnOiBDb25maWcsIHNraXBBbmltYXRpb24/OiBib29sZWFuKTogdm9pZDtcblxuICAvLyByZWFkIHNob2dpZ3JvdW5kIHN0YXRlOyB3cml0ZSBhdCB5b3VyIG93biByaXNrc1xuICBzdGF0ZTogU3RhdGU7XG5cbiAgLy8gZ2V0IHRoZSBwb3NpdGlvbiBvbiB0aGUgYm9hcmQgaW4gRm9yc3l0aCBub3RhdGlvblxuICBnZXRCb2FyZFNmZW4oKTogc2cuQm9hcmRTZmVuO1xuXG4gIC8vIGdldCB0aGUgcGllY2VzIGluIGhhbmQgaW4gRm9yc3l0aCBub3RhdGlvblxuICBnZXRIYW5kc1NmZW4oKTogc2cuSGFuZHNTZmVuO1xuXG4gIC8vIGNoYW5nZSB0aGUgdmlldyBhbmdsZVxuICB0b2dnbGVPcmllbnRhdGlvbigpOiB2b2lkO1xuXG4gIC8vIHBlcmZvcm0gYSBtb3ZlIHByb2dyYW1tYXRpY2FsbHlcbiAgbW92ZShvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSwgcHJvbT86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIHBlcmZvcm0gYSBkcm9wIHByb2dyYW1tYXRpY2FsbHksIGJ5IGRlZmF1bHQgcGllY2UgaXMgdGFrZW4gZnJvbSBoYW5kXG4gIGRyb3AocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSwgcHJvbT86IGJvb2xlYW4sIHNwYXJlPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gYWRkIGFuZC9vciByZW1vdmUgYXJiaXRyYXJ5IHBpZWNlcyBvbiB0aGUgYm9hcmRcbiAgc2V0UGllY2VzKHBpZWNlczogc2cuUGllY2VzRGlmZik6IHZvaWQ7XG5cbiAgLy8gYWRkIHBpZWNlLnJvbGUgdG8gaGFuZCBvZiBwaWVjZS5jb2xvclxuICBhZGRUb0hhbmQocGllY2U6IHNnLlBpZWNlLCBjb3VudD86IG51bWJlcik6IHZvaWQ7XG5cbiAgLy8gcmVtb3ZlIHBpZWNlLnJvbGUgZnJvbSBoYW5kIG9mIHBpZWNlLmNvbG9yXG4gIHJlbW92ZUZyb21IYW5kKHBpZWNlOiBzZy5QaWVjZSwgY291bnQ/OiBudW1iZXIpOiB2b2lkO1xuXG4gIC8vIGNsaWNrIGEgc3F1YXJlIHByb2dyYW1tYXRpY2FsbHlcbiAgc2VsZWN0U3F1YXJlKGtleTogc2cuS2V5IHwgbnVsbCwgcHJvbT86IGJvb2xlYW4sIGZvcmNlPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gc2VsZWN0IGEgcGllY2UgZnJvbSBoYW5kIHRvIGRyb3AgcHJvZ3JhbWF0aWNhbGx5LCBieSBkZWZhdWx0IHBpZWNlIGluIGhhbmQgaXMgc2VsZWN0ZWRcbiAgc2VsZWN0UGllY2UocGllY2U6IHNnLlBpZWNlIHwgbnVsbCwgc3BhcmU/OiBib29sZWFuLCBmb3JjZT86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIHBsYXkgdGhlIGN1cnJlbnQgcHJlbW92ZSwgaWYgYW55OyByZXR1cm5zIHRydWUgaWYgcHJlbW92ZSB3YXMgcGxheWVkXG4gIHBsYXlQcmVtb3ZlKCk6IGJvb2xlYW47XG5cbiAgLy8gY2FuY2VsIHRoZSBjdXJyZW50IHByZW1vdmUsIGlmIGFueVxuICBjYW5jZWxQcmVtb3ZlKCk6IHZvaWQ7XG5cbiAgLy8gcGxheSB0aGUgY3VycmVudCBwcmVkcm9wLCBpZiBhbnk7IHJldHVybnMgdHJ1ZSBpZiBwcmVtb3ZlIHdhcyBwbGF5ZWRcbiAgcGxheVByZWRyb3AoKTogYm9vbGVhbjtcblxuICAvLyBjYW5jZWwgdGhlIGN1cnJlbnQgcHJlZHJvcCwgaWYgYW55XG4gIGNhbmNlbFByZWRyb3AoKTogdm9pZDtcblxuICAvLyBjYW5jZWwgdGhlIGN1cnJlbnQgbW92ZSBvciBkcm9wIGJlaW5nIG1hZGUsIHByZW1vdmVzIGFuZCBwcmVkcm9wc1xuICBjYW5jZWxNb3ZlT3JEcm9wKCk6IHZvaWQ7XG5cbiAgLy8gY2FuY2VsIGN1cnJlbnQgbW92ZSBvciBkcm9wIGFuZCBwcmV2ZW50IGZ1cnRoZXIgb25lc1xuICBzdG9wKCk6IHZvaWQ7XG5cbiAgLy8gcHJvZ3JhbW1hdGljYWxseSBkcmF3IHVzZXIgc2hhcGVzXG4gIHNldFNoYXBlcyhzaGFwZXM6IERyYXdTaGFwZVtdKTogdm9pZDtcblxuICAvLyBwcm9ncmFtbWF0aWNhbGx5IGRyYXcgYXV0byBzaGFwZXNcbiAgc2V0QXV0b1NoYXBlcyhzaGFwZXM6IERyYXdTaGFwZVtdKTogdm9pZDtcblxuICAvLyBwcm9ncmFtbWF0aWNhbGx5IGhpZ2hsaWdodCBzcXVhcmVzXG4gIHNldFNxdWFyZUhpZ2hsaWdodHMoc3F1YXJlczogU3F1YXJlSGlnaGxpZ2h0W10pOiB2b2lkO1xuXG4gIC8vIGZvciBwaWVjZSBkcm9wcGluZyBhbmQgYm9hcmQgZWRpdG9yc1xuICBkcmFnTmV3UGllY2UocGllY2U6IHNnLlBpZWNlLCBldmVudDogc2cuTW91Y2hFdmVudCwgc3BhcmU/OiBib29sZWFuKTogdm9pZDtcblxuICAvLyB1bmJpbmRzIGFsbCBldmVudHNcbiAgLy8gKGltcG9ydGFudCBmb3IgZG9jdW1lbnQtd2lkZSBldmVudHMgbGlrZSBzY3JvbGwgYW5kIG1vdXNlbW92ZSlcbiAgZGVzdHJveTogc2cuVW5iaW5kO1xufVxuXG4vLyBzZWUgQVBJIHR5cGVzIGFuZCBkb2N1bWVudGF0aW9ucyBpbiBhcGkuZC50c1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0KHN0YXRlOiBTdGF0ZSk6IEFwaSB7XG4gIHJldHVybiB7XG4gICAgYXR0YWNoKHdyYXBFbGVtZW50czogc2cuV3JhcEVsZW1lbnRzKTogdm9pZCB7XG4gICAgICByZWRyYXdBbGwod3JhcEVsZW1lbnRzLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGRldGFjaCh3cmFwRWxlbWVudHNCb29sZWFuOiBzZy5XcmFwRWxlbWVudHNCb29sZWFuKTogdm9pZCB7XG4gICAgICBkZXRhY2hFbGVtZW50cyh3cmFwRWxlbWVudHNCb29sZWFuLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHNldChjb25maWc6IENvbmZpZywgc2tpcEFuaW1hdGlvbj86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgIGZ1bmN0aW9uIGdldEJ5UGF0aChwYXRoOiBzdHJpbmcsIG9iajogYW55KSB7XG4gICAgICAgIGNvbnN0IHByb3BlcnRpZXMgPSBwYXRoLnNwbGl0KCcuJyk7XG4gICAgICAgIHJldHVybiBwcm9wZXJ0aWVzLnJlZHVjZSgocHJldiwgY3VycikgPT4gcHJldiAmJiBwcmV2W2N1cnJdLCBvYmopO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBmb3JjZVJlZHJhd1Byb3BzOiAoYCR7a2V5b2YgQ29uZmlnfWAgfCBgJHtrZXlvZiBDb25maWd9LiR7c3RyaW5nfWApW10gPSBbXG4gICAgICAgICdvcmllbnRhdGlvbicsXG4gICAgICAgICd2aWV3T25seScsXG4gICAgICAgICdjb29yZGluYXRlcy5lbmFibGVkJyxcbiAgICAgICAgJ2Nvb3JkaW5hdGVzLm5vdGF0aW9uJyxcbiAgICAgICAgJ2RyYXdhYmxlLnZpc2libGUnLFxuICAgICAgICAnaGFuZHMuaW5saW5lZCcsXG4gICAgICBdO1xuICAgICAgY29uc3QgbmV3RGltcyA9IGNvbmZpZy5zZmVuPy5ib2FyZCAmJiBpbmZlckRpbWVuc2lvbnMoY29uZmlnLnNmZW4uYm9hcmQpO1xuICAgICAgY29uc3QgdG9SZWRyYXcgPVxuICAgICAgICBmb3JjZVJlZHJhd1Byb3BzLnNvbWUoKHApID0+IHtcbiAgICAgICAgICBjb25zdCBjUmVzID0gZ2V0QnlQYXRoKHAsIGNvbmZpZyk7XG4gICAgICAgICAgcmV0dXJuIGNSZXMgJiYgY1JlcyAhPT0gZ2V0QnlQYXRoKHAsIHN0YXRlKTtcbiAgICAgICAgfSkgfHxcbiAgICAgICAgISEoXG4gICAgICAgICAgbmV3RGltcyAmJlxuICAgICAgICAgIChuZXdEaW1zLmZpbGVzICE9PSBzdGF0ZS5kaW1lbnNpb25zLmZpbGVzIHx8IG5ld0RpbXMucmFua3MgIT09IHN0YXRlLmRpbWVuc2lvbnMucmFua3MpXG4gICAgICAgICkgfHxcbiAgICAgICAgISFjb25maWcuaGFuZHM/LnJvbGVzPy5ldmVyeSgociwgaSkgPT4gciA9PT0gc3RhdGUuaGFuZHMucm9sZXNbaV0pO1xuXG4gICAgICBpZiAodG9SZWRyYXcpIHtcbiAgICAgICAgYm9hcmQucmVzZXQoc3RhdGUpO1xuICAgICAgICBjb25maWd1cmUoc3RhdGUsIGNvbmZpZyk7XG4gICAgICAgIHJlZHJhd0FsbChzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLCBzdGF0ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhcHBseUFuaW1hdGlvbihzdGF0ZSwgY29uZmlnKTtcbiAgICAgICAgKGNvbmZpZy5zZmVuPy5ib2FyZCAmJiAhc2tpcEFuaW1hdGlvbiA/IGFuaW0gOiByZW5kZXIpKFxuICAgICAgICAgIChzdGF0ZSkgPT4gY29uZmlndXJlKHN0YXRlLCBjb25maWcpLFxuICAgICAgICAgIHN0YXRlLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBzdGF0ZSxcblxuICAgIGdldEJvYXJkU2ZlbjogKCkgPT4gYm9hcmRUb1NmZW4oc3RhdGUucGllY2VzLCBzdGF0ZS5kaW1lbnNpb25zLCBzdGF0ZS5mb3JzeXRoLnRvRm9yc3l0aCksXG5cbiAgICBnZXRIYW5kc1NmZW46ICgpID0+XG4gICAgICBoYW5kc1RvU2ZlbihzdGF0ZS5oYW5kcy5oYW5kTWFwLCBzdGF0ZS5oYW5kcy5yb2xlcywgc3RhdGUuZm9yc3l0aC50b0ZvcnN5dGgpLFxuXG4gICAgdG9nZ2xlT3JpZW50YXRpb24oKTogdm9pZCB7XG4gICAgICBib2FyZC50b2dnbGVPcmllbnRhdGlvbihzdGF0ZSk7XG4gICAgICByZWRyYXdBbGwoc3RhdGUuZG9tLndyYXBFbGVtZW50cywgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBtb3ZlKG9yaWcsIGRlc3QsIHByb20pOiB2b2lkIHtcbiAgICAgIGFuaW0oXG4gICAgICAgIChzdGF0ZSkgPT5cbiAgICAgICAgICBib2FyZC5iYXNlTW92ZShzdGF0ZSwgb3JpZywgZGVzdCwgcHJvbSB8fCBzdGF0ZS5wcm9tb3Rpb24uZm9yY2VNb3ZlUHJvbW90aW9uKG9yaWcsIGRlc3QpKSxcbiAgICAgICAgc3RhdGUsXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBkcm9wKHBpZWNlLCBrZXksIHByb20sIHNwYXJlKTogdm9pZCB7XG4gICAgICBhbmltKChzdGF0ZSkgPT4ge1xuICAgICAgICBzdGF0ZS5kcm9wcGFibGUuc3BhcmUgPSAhIXNwYXJlO1xuICAgICAgICBib2FyZC5iYXNlRHJvcChzdGF0ZSwgcGllY2UsIGtleSwgcHJvbSB8fCBzdGF0ZS5wcm9tb3Rpb24uZm9yY2VEcm9wUHJvbW90aW9uKHBpZWNlLCBrZXkpKTtcbiAgICAgIH0sIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc2V0UGllY2VzKHBpZWNlcyk6IHZvaWQge1xuICAgICAgYW5pbSgoc3RhdGUpID0+IGJvYXJkLnNldFBpZWNlcyhzdGF0ZSwgcGllY2VzKSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBhZGRUb0hhbmQocGllY2U6IHNnLlBpZWNlLCBjb3VudDogbnVtYmVyKTogdm9pZCB7XG4gICAgICByZW5kZXIoKHN0YXRlKSA9PiBhZGRUb0hhbmQoc3RhdGUsIHBpZWNlLCBjb3VudCksIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlRnJvbUhhbmQocGllY2U6IHNnLlBpZWNlLCBjb3VudDogbnVtYmVyKTogdm9pZCB7XG4gICAgICByZW5kZXIoKHN0YXRlKSA9PiByZW1vdmVGcm9tSGFuZChzdGF0ZSwgcGllY2UsIGNvdW50KSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzZWxlY3RTcXVhcmUoa2V5LCBwcm9tLCBmb3JjZSk6IHZvaWQge1xuICAgICAgaWYgKGtleSkgYW5pbSgoc3RhdGUpID0+IGJvYXJkLnNlbGVjdFNxdWFyZShzdGF0ZSwga2V5LCBwcm9tLCBmb3JjZSksIHN0YXRlKTtcbiAgICAgIGVsc2UgaWYgKHN0YXRlLnNlbGVjdGVkKSB7XG4gICAgICAgIGJvYXJkLnVuc2VsZWN0KHN0YXRlKTtcbiAgICAgICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBzZWxlY3RQaWVjZShwaWVjZSwgc3BhcmUsIGZvcmNlKTogdm9pZCB7XG4gICAgICBpZiAocGllY2UpIHJlbmRlcigoc3RhdGUpID0+IGJvYXJkLnNlbGVjdFBpZWNlKHN0YXRlLCBwaWVjZSwgc3BhcmUsIGZvcmNlLCB0cnVlKSwgc3RhdGUpO1xuICAgICAgZWxzZSBpZiAoc3RhdGUuc2VsZWN0ZWRQaWVjZSkge1xuICAgICAgICBib2FyZC51bnNlbGVjdChzdGF0ZSk7XG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcGxheVByZW1vdmUoKTogYm9vbGVhbiB7XG4gICAgICBpZiAoc3RhdGUucHJlbW92YWJsZS5jdXJyZW50KSB7XG4gICAgICAgIGlmIChhbmltKGJvYXJkLnBsYXlQcmVtb3ZlLCBzdGF0ZSkpIHJldHVybiB0cnVlO1xuICAgICAgICAvLyBpZiB0aGUgcHJlbW92ZSBjb3VsZG4ndCBiZSBwbGF5ZWQsIHJlZHJhdyB0byBjbGVhciBpdCB1cFxuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIHBsYXlQcmVkcm9wKCk6IGJvb2xlYW4ge1xuICAgICAgaWYgKHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50KSB7XG4gICAgICAgIGlmIChhbmltKGJvYXJkLnBsYXlQcmVkcm9wLCBzdGF0ZSkpIHJldHVybiB0cnVlO1xuICAgICAgICAvLyBpZiB0aGUgcHJlZHJvcCBjb3VsZG4ndCBiZSBwbGF5ZWQsIHJlZHJhdyB0byBjbGVhciBpdCB1cFxuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIGNhbmNlbFByZW1vdmUoKTogdm9pZCB7XG4gICAgICByZW5kZXIoYm9hcmQudW5zZXRQcmVtb3ZlLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGNhbmNlbFByZWRyb3AoKTogdm9pZCB7XG4gICAgICByZW5kZXIoYm9hcmQudW5zZXRQcmVkcm9wLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGNhbmNlbE1vdmVPckRyb3AoKTogdm9pZCB7XG4gICAgICByZW5kZXIoKHN0YXRlKSA9PiB7XG4gICAgICAgIGJvYXJkLmNhbmNlbE1vdmVPckRyb3Aoc3RhdGUpO1xuICAgICAgICBkcmFnQ2FuY2VsKHN0YXRlKTtcbiAgICAgIH0sIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc3RvcCgpOiB2b2lkIHtcbiAgICAgIHJlbmRlcigoc3RhdGUpID0+IHtcbiAgICAgICAgYm9hcmQuc3RvcChzdGF0ZSk7XG4gICAgICB9LCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHNldEF1dG9TaGFwZXMoc2hhcGVzOiBEcmF3U2hhcGVbXSk6IHZvaWQge1xuICAgICAgcmVuZGVyKChzdGF0ZSkgPT4gKHN0YXRlLmRyYXdhYmxlLmF1dG9TaGFwZXMgPSBzaGFwZXMpLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHNldFNoYXBlcyhzaGFwZXM6IERyYXdTaGFwZVtdKTogdm9pZCB7XG4gICAgICByZW5kZXIoKHN0YXRlKSA9PiAoc3RhdGUuZHJhd2FibGUuc2hhcGVzID0gc2hhcGVzKSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzZXRTcXVhcmVIaWdobGlnaHRzKHNxdWFyZXM6IFNxdWFyZUhpZ2hsaWdodFtdKTogdm9pZCB7XG4gICAgICByZW5kZXIoKHN0YXRlKSA9PiAoc3RhdGUuZHJhd2FibGUuc3F1YXJlcyA9IHNxdWFyZXMpLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGRyYWdOZXdQaWVjZShwaWVjZSwgZXZlbnQsIHNwYXJlKTogdm9pZCB7XG4gICAgICBkcmFnTmV3UGllY2Uoc3RhdGUsIHBpZWNlLCBldmVudCwgc3BhcmUpO1xuICAgIH0sXG5cbiAgICBkZXN0cm95KCk6IHZvaWQge1xuICAgICAgYm9hcmQuc3RvcChzdGF0ZSk7XG4gICAgICBzdGF0ZS5kb20udW5iaW5kKCk7XG4gICAgICBzdGF0ZS5kb20uZGVzdHJveWVkID0gdHJ1ZTtcbiAgICB9LFxuICB9O1xufVxuIiwgImltcG9ydCB0eXBlIHsgQW5pbUN1cnJlbnQgfSBmcm9tICcuL2FuaW0uanMnO1xuaW1wb3J0IHR5cGUgeyBEcmFnQ3VycmVudCB9IGZyb20gJy4vZHJhZy5qcyc7XG5pbXBvcnQgdHlwZSB7IERyYXdhYmxlIH0gZnJvbSAnLi9kcmF3LmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSGVhZGxlc3NTdGF0ZSB7XG4gIHBpZWNlczogc2cuUGllY2VzO1xuICBvcmllbnRhdGlvbjogc2cuQ29sb3I7IC8vIGJvYXJkIG9yaWVudGF0aW9uLiBzZW50ZSB8IGdvdGVcbiAgZGltZW5zaW9uczogc2cuRGltZW5zaW9uczsgLy8gYm9hcmQgZGltZW5zaW9ucyAtIG1heCAxNngxNlxuICB0dXJuQ29sb3I6IHNnLkNvbG9yOyAvLyB0dXJuIHRvIHBsYXkuIHNlbnRlIHwgZ290ZVxuICBhY3RpdmVDb2xvcj86IHNnLkNvbG9yIHwgJ2JvdGgnOyAvLyBjb2xvciB0aGF0IGNhbiBtb3ZlIG9yIGRyb3AuIHNlbnRlIHwgZ290ZSB8IGJvdGggfCB1bmRlZmluZWRcbiAgY2hlY2tzPzogc2cuS2V5W107IC8vIHNxdWFyZXMgY3VycmVudGx5IGluIGNoZWNrIFtcIjVhXCJdXG4gIGxhc3REZXN0cz86IHNnLktleVtdOyAvLyBzcXVhcmVzIHBhcnQgb2YgdGhlIGxhc3QgbW92ZSBvciBkcm9wIFtcIjJiXCI7IFwiOGhcIl1cbiAgbGFzdFBpZWNlPzogc2cuUGllY2U7IC8vIHBpZWNlIHBhcnQgb2YgdGhlIGxhc3QgZHJvcFxuICBzZWxlY3RlZD86IHNnLktleTsgLy8gc3F1YXJlIGN1cnJlbnRseSBzZWxlY3RlZCBcIjFhXCJcbiAgc2VsZWN0ZWRQaWVjZT86IHNnLlBpZWNlOyAvLyBwaWVjZSBpbiBoYW5kIGN1cnJlbnRseSBzZWxlY3RlZFxuICBob3ZlcmVkPzogc2cuS2V5OyAvLyBzcXVhcmUgY3VycmVudGx5IGJlaW5nIGhvdmVyZWRcbiAgdmlld09ubHk6IGJvb2xlYW47IC8vIGRvbid0IGJpbmQgZXZlbnRzOiB0aGUgdXNlciB3aWxsIG5ldmVyIGJlIGFibGUgdG8gbW92ZSBwaWVjZXMgYXJvdW5kXG4gIHNxdWFyZVJhdGlvOiBzZy5OdW1iZXJQYWlyOyAvLyByYXRpbyBvZiB0aGUgYm9hcmQgW3dpZHRoLCBoZWlnaHRdXG4gIGRpc2FibGVDb250ZXh0TWVudTogYm9vbGVhbjsgLy8gYmVjYXVzZSB3aG8gbmVlZHMgYSBjb250ZXh0IG1lbnUgb24gYSBzaG9naSBib2FyZFxuICBibG9ja1RvdWNoU2Nyb2xsOiBib29sZWFuOyAvLyBibG9jayBzY3JvbGxpbmcgdmlhIHRvdWNoIGRyYWdnaW5nIG9uIHRoZSBib2FyZCwgZS5nLiBmb3IgY29vcmRpbmF0ZSB0cmFpbmluZ1xuICBzY2FsZURvd25QaWVjZXM6IGJvb2xlYW47XG4gIGNvb3JkaW5hdGVzOiB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjsgLy8gaW5jbHVkZSBjb29yZHMgYXR0cmlidXRlc1xuICAgIGZpbGVzOiBzZy5Ob3RhdGlvbjtcbiAgICByYW5rczogc2cuTm90YXRpb247XG4gIH07XG4gIGhpZ2hsaWdodDoge1xuICAgIGxhc3REZXN0czogYm9vbGVhbjsgLy8gYWRkIGxhc3QtZGVzdCBjbGFzcyB0byBzcXVhcmVzIGFuZCBwaWVjZXNcbiAgICBjaGVjazogYm9vbGVhbjsgLy8gYWRkIGNoZWNrIGNsYXNzIHRvIHNxdWFyZXNcbiAgICBjaGVja1JvbGVzOiBzZy5Sb2xlU3RyaW5nW107IC8vIHJvbGVzIHRvIGJlIGhpZ2hsaWdodGVkIHdoZW4gY2hlY2sgaXMgYm9vbGVhbiBpcyBwYXNzZWQgZnJvbSBjb25maWdcbiAgICBob3ZlcmVkOiBib29sZWFuOyAvLyBhZGQgaG92ZXIgY2xhc3MgdG8gaG92ZXJlZCBzcXVhcmVzXG4gIH07XG4gIGFuaW1hdGlvbjogeyBlbmFibGVkOiBib29sZWFuOyBoYW5kczogYm9vbGVhbjsgZHVyYXRpb246IG51bWJlcjsgY3VycmVudD86IEFuaW1DdXJyZW50IH07XG4gIGhhbmRzOiB7XG4gICAgaW5saW5lZDogYm9vbGVhbjsgLy8gYXR0YWNoZXMgc2ctaGFuZHMgZGlyZWN0bHkgdG8gc2ctd3JhcCwgaWdub3JlcyBIVE1MRWxlbWVudHMgcGFzc2VkIHRvIFNob2dpZ3JvdW5kXG4gICAgaGFuZE1hcDogc2cuSGFuZHM7XG4gICAgcm9sZXM6IHNnLlJvbGVTdHJpbmdbXTsgLy8gcm9sZXMgdG8gcmVuZGVyIGluIHNnLWhhbmRcbiAgfTtcbiAgbW92YWJsZToge1xuICAgIGZyZWU6IGJvb2xlYW47IC8vIGFsbCBtb3ZlcyBhcmUgdmFsaWQgLSBib2FyZCBlZGl0b3JcbiAgICBkZXN0cz86IHNnLk1vdmVEZXN0czsgLy8gdmFsaWQgbW92ZXMuIHtcIjdnXCIgW1wiN2ZcIl0gXCI1aVwiIFtcIjRoXCIgXCI1aFwiIFwiNmhcIl19XG4gICAgc2hvd0Rlc3RzOiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgZXZlbnRzOiB7XG4gICAgICBhZnRlcj86IChvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSwgcHJvbTogYm9vbGVhbiwgbWV0YWRhdGE6IHNnLk1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBtb3ZlIGhhcyBiZWVuIHBsYXllZFxuICAgIH07XG4gIH07XG4gIGRyb3BwYWJsZToge1xuICAgIGZyZWU6IGJvb2xlYW47IC8vIGFsbCBkcm9wcyBhcmUgdmFsaWQgLSBib2FyZCBlZGl0b3JcbiAgICBkZXN0cz86IHNnLkRyb3BEZXN0czsgLy8gdmFsaWQgZHJvcHMuIHtcInNlbnRlIHBhd25cIiBbXCIzYVwiIFwiNGFcIl0gXCJzZW50ZSBsYW5jZVwiIFtcIjNhXCIgXCIzY1wiXX1cbiAgICBzaG93RGVzdHM6IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBkZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBzcGFyZTogYm9vbGVhbjsgLy8gd2hldGhlciB0byByZW1vdmUgZHJvcHBlZCBwaWVjZSBmcm9tIGhhbmQgYWZ0ZXIgZHJvcCAtIGJvYXJkIGVkaXRvclxuICAgIGV2ZW50czoge1xuICAgICAgYWZ0ZXI/OiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSwgcHJvbTogYm9vbGVhbiwgbWV0YWRhdGE6IHNnLk1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBkcm9wIGhhcyBiZWVuIHBsYXllZFxuICAgIH07XG4gIH07XG4gIHByZW1vdmFibGU6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBhbGxvdyBwcmVtb3ZlcyBmb3IgY29sb3IgdGhhdCBjYW4gbm90IG1vdmVcbiAgICBzaG93RGVzdHM6IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBwcmUtZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgZGVzdHM/OiBzZy5LZXlbXTsgLy8gcHJlbW92ZSBkZXN0aW5hdGlvbnMgZm9yIHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgIGN1cnJlbnQ/OiB7IG9yaWc6IHNnLktleTsgZGVzdDogc2cuS2V5OyBwcm9tOiBib29sZWFuIH07XG4gICAgZ2VuZXJhdGU/OiAoa2V5OiBzZy5LZXksIHBpZWNlczogc2cuUGllY2VzKSA9PiBzZy5LZXlbXTtcbiAgICBldmVudHM6IHtcbiAgICAgIHNldD86IChvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSwgcHJvbTogYm9vbGVhbikgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVtb3ZlIGhhcyBiZWVuIHNldFxuICAgICAgdW5zZXQ/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZW1vdmUgaGFzIGJlZW4gdW5zZXRcbiAgICB9O1xuICB9O1xuICBwcmVkcm9wcGFibGU6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBhbGxvdyBwcmVkcm9wcyBmb3IgY29sb3IgdGhhdCBjYW4gbm90IG1vdmVcbiAgICBzaG93RGVzdHM6IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBwcmUtZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgZGVzdHM/OiBzZy5LZXlbXTsgLy8gcHJlbW92ZSBkZXN0aW5hdGlvbnMgZm9yIHRoZSBkcm9wIHNlbGVjdGlvblxuICAgIGN1cnJlbnQ/OiB7IHBpZWNlOiBzZy5QaWVjZTsga2V5OiBzZy5LZXk7IHByb206IGJvb2xlYW4gfTtcbiAgICBnZW5lcmF0ZT86IChwaWVjZTogc2cuUGllY2UsIHBpZWNlczogc2cuUGllY2VzKSA9PiBzZy5LZXlbXTtcbiAgICBldmVudHM6IHtcbiAgICAgIHNldD86IChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tOiBib29sZWFuKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZWRyb3AgaGFzIGJlZW4gc2V0XG4gICAgICB1bnNldD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlZHJvcCBoYXMgYmVlbiB1bnNldFxuICAgIH07XG4gIH07XG4gIGRyYWdnYWJsZToge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGFsbG93IG1vdmVzICYgcHJlbW92ZXMgdG8gdXNlIGRyYWcnbiBkcm9wXG4gICAgZGlzdGFuY2U6IG51bWJlcjsgLy8gbWluaW11bSBkaXN0YW5jZSB0byBpbml0aWF0ZSBhIGRyYWc7IGluIHBpeGVsc1xuICAgIGF1dG9EaXN0YW5jZTogYm9vbGVhbjsgLy8gbGV0cyBzaG9naWdyb3VuZCBzZXQgZGlzdGFuY2UgdG8gemVybyB3aGVuIHVzZXIgZHJhZ3MgcGllY2VzXG4gICAgc2hvd0dob3N0OiBib29sZWFuOyAvLyBzaG93IGdob3N0IG9mIHBpZWNlIGJlaW5nIGRyYWdnZWRcbiAgICBzaG93VG91Y2hTcXVhcmVPdmVybGF5OiBib29sZWFuOyAvLyBzaG93IHNxdWFyZSBvdmVybGF5IG9uIHRoZSBzcXVhcmUgdGhhdCBpcyBjdXJyZW50bHkgYmVpbmcgaG92ZXJlZCwgdG91Y2ggb25seVxuICAgIGRlbGV0ZU9uRHJvcE9mZjogYm9vbGVhbjsgLy8gZGVsZXRlIGEgcGllY2Ugd2hlbiBpdCBpcyBkcm9wcGVkIG9mZiB0aGUgYm9hcmQgLSBib2FyZCBlZGl0b3JcbiAgICBhZGRUb0hhbmRPbkRyb3BPZmY6IGJvb2xlYW47IC8vIGFkZCBhIHBpZWNlIHRvIGhhbmQgd2hlbiBpdCBpcyBkcm9wcGVkIG9uIGl0LCByZXF1aXJlcyBkZWxldGVPbkRyb3BPZmYgLSBib2FyZCBlZGl0b3JcbiAgICBjdXJyZW50PzogRHJhZ0N1cnJlbnQ7XG4gIH07XG4gIHNlbGVjdGFibGU6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBkaXNhYmxlIHRvIGVuZm9yY2UgZHJhZ2dpbmcgb3ZlciBjbGljay1jbGljayBtb3ZlXG4gICAgZm9yY2VTcGFyZXM6IGJvb2xlYW47IC8vIGFsbG93IGRyb3BwaW5nIHNwYXJlIHBpZWNlcyBldmVuIHdpdGggc2VsZWN0YWJsZSBkaXNhYmxlZFxuICAgIGRlbGV0ZU9uVG91Y2g6IGJvb2xlYW47IC8vIHNlbGVjdGluZyBhIHBpZWNlIG9uIHRoZSBib2FyZCBvciBpbiBoYW5kIHdpbGwgcmVtb3ZlIGl0IC0gYm9hcmQgZWRpdG9yXG4gICAgYWRkU3BhcmVzVG9IYW5kOiBib29sZWFuOyAvLyBhZGQgc2VsZWN0ZWQgc3BhcmUgcGllY2UgdG8gaGFuZCAtIGJvYXJkIGVkaXRvclxuICB9O1xuICBwcm9tb3Rpb246IHtcbiAgICBwcm9tb3Rlc1RvOiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICB1bnByb21vdGVzVG86IChyb2xlOiBzZy5Sb2xlU3RyaW5nKSA9PiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIG1vdmVQcm9tb3Rpb25EaWFsb2c6IChvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSkgPT4gYm9vbGVhbjtcbiAgICBmb3JjZU1vdmVQcm9tb3Rpb246IChvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSkgPT4gYm9vbGVhbjtcbiAgICBkcm9wUHJvbW90aW9uRGlhbG9nOiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSkgPT4gYm9vbGVhbjtcbiAgICBmb3JjZURyb3BQcm9tb3Rpb246IChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5KSA9PiBib29sZWFuO1xuICAgIGN1cnJlbnQ/OiB7XG4gICAgICBwaWVjZTogc2cuUGllY2U7XG4gICAgICBwcm9tb3RlZFBpZWNlOiBzZy5QaWVjZTtcbiAgICAgIGtleTogc2cuS2V5O1xuICAgICAgZHJhZ2dlZDogYm9vbGVhbjsgLy8gbm8gYW5pbWF0aW9ucyB3aXRoIGRyYWdcbiAgICB9O1xuICAgIGV2ZW50czoge1xuICAgICAgaW5pdGlhdGVkPzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gcHJvbW90aW9uIGRpYWxvZyBpcyBzdGFydGVkXG4gICAgICBhZnRlcj86IChwaWVjZTogc2cuUGllY2UpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB1c2VyIHNlbGVjdHMgYSBwaWVjZVxuICAgICAgY2FuY2VsPzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHVzZXIgY2FuY2VscyB0aGUgc2VsZWN0aW9uXG4gICAgfTtcbiAgICBwcmV2UHJvbW90aW9uSGFzaDogc3RyaW5nO1xuICB9O1xuICBmb3JzeXRoOiB7XG4gICAgdG9Gb3JzeXRoPzogKHJvbGU6IHNnLlJvbGVTdHJpbmcpID0+IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBmcm9tRm9yc3l0aD86IChzdHI6IHN0cmluZykgPT4gc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZDtcbiAgfTtcbiAgZXZlbnRzOiB7XG4gICAgY2hhbmdlPzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBzaXR1YXRpb24gY2hhbmdlcyBvbiB0aGUgYm9hcmRcbiAgICBtb3ZlPzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tOiBib29sZWFuLCBjYXB0dXJlZFBpZWNlPzogc2cuUGllY2UpID0+IHZvaWQ7XG4gICAgZHJvcD86IChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tOiBib29sZWFuKSA9PiB2b2lkO1xuICAgIHNlbGVjdD86IChrZXk6IHNnLktleSkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gYSBzcXVhcmUgaXMgc2VsZWN0ZWRcbiAgICB1bnNlbGVjdD86IChrZXk6IHNnLktleSkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gYSBzZWxlY3RlZCBzcXVhcmUgaXMgZGlyZWN0bHkgdW5zZWxlY3RlZCAtIGRyb3BwZWQgYmFjayBvciBjbGlja2VkIG9uIHRoZSBvcmlnaW5hbCBzcXVhcmVcbiAgICBwaWVjZVNlbGVjdD86IChwaWVjZTogc2cuUGllY2UpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIGEgcGllY2UgaW4gaGFuZCBpcyBzZWxlY3RlZFxuICAgIHBpZWNlVW5zZWxlY3Q/OiAocGllY2U6IHNnLlBpZWNlKSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBhIHNlbGVjdGVkIHBpZWNlIGlzIGRpcmVjdGx5IHVuc2VsZWN0ZWQgLSBkcm9wcGVkIGJhY2sgb3IgY2xpY2tlZCBvbiB0aGUgc2FtZSBwaWVjZVxuICAgIGluc2VydD86IChib2FyZEVsZW1lbnRzPzogc2cuQm9hcmRFbGVtZW50cywgaGFuZEVsZW1lbnRzPzogc2cuSGFuZEVsZW1lbnRzKSA9PiB2b2lkOyAvLyB3aGVuIHRoZSBib2FyZCBvciBoYW5kcyBET00gaGFzIGJlZW4gKHJlKWluc2VydGVkXG4gIH07XG4gIGRyYXdhYmxlOiBEcmF3YWJsZTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgU3RhdGUgZXh0ZW5kcyBIZWFkbGVzc1N0YXRlIHtcbiAgZG9tOiBzZy5Eb207XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWZhdWx0cygpOiBIZWFkbGVzc1N0YXRlIHtcbiAgcmV0dXJuIHtcbiAgICBwaWVjZXM6IG5ldyBNYXAoKSxcbiAgICBkaW1lbnNpb25zOiB7IGZpbGVzOiA5LCByYW5rczogOSB9LFxuICAgIG9yaWVudGF0aW9uOiAnc2VudGUnLFxuICAgIHR1cm5Db2xvcjogJ3NlbnRlJyxcbiAgICBhY3RpdmVDb2xvcjogJ2JvdGgnLFxuICAgIHZpZXdPbmx5OiBmYWxzZSxcbiAgICBzcXVhcmVSYXRpbzogWzExLCAxMl0sXG4gICAgZGlzYWJsZUNvbnRleHRNZW51OiB0cnVlLFxuICAgIGJsb2NrVG91Y2hTY3JvbGw6IGZhbHNlLFxuICAgIHNjYWxlRG93blBpZWNlczogdHJ1ZSxcbiAgICBjb29yZGluYXRlczogeyBlbmFibGVkOiB0cnVlLCBmaWxlczogJ251bWVyaWMnLCByYW5rczogJ251bWVyaWMnIH0sXG4gICAgaGlnaGxpZ2h0OiB7IGxhc3REZXN0czogdHJ1ZSwgY2hlY2s6IHRydWUsIGNoZWNrUm9sZXM6IFsna2luZyddLCBob3ZlcmVkOiBmYWxzZSB9LFxuICAgIGFuaW1hdGlvbjogeyBlbmFibGVkOiB0cnVlLCBoYW5kczogdHJ1ZSwgZHVyYXRpb246IDI1MCB9LFxuICAgIGhhbmRzOiB7XG4gICAgICBpbmxpbmVkOiBmYWxzZSxcbiAgICAgIGhhbmRNYXA6IG5ldyBNYXA8c2cuQ29sb3IsIHNnLkhhbmQ+KFtcbiAgICAgICAgWydzZW50ZScsIG5ldyBNYXAoKV0sXG4gICAgICAgIFsnZ290ZScsIG5ldyBNYXAoKV0sXG4gICAgICBdKSxcbiAgICAgIHJvbGVzOiBbJ3Jvb2snLCAnYmlzaG9wJywgJ2dvbGQnLCAnc2lsdmVyJywgJ2tuaWdodCcsICdsYW5jZScsICdwYXduJ10sXG4gICAgfSxcbiAgICBtb3ZhYmxlOiB7IGZyZWU6IHRydWUsIHNob3dEZXN0czogdHJ1ZSwgZXZlbnRzOiB7fSB9LFxuICAgIGRyb3BwYWJsZTogeyBmcmVlOiB0cnVlLCBzaG93RGVzdHM6IHRydWUsIHNwYXJlOiBmYWxzZSwgZXZlbnRzOiB7fSB9LFxuICAgIHByZW1vdmFibGU6IHsgZW5hYmxlZDogdHJ1ZSwgc2hvd0Rlc3RzOiB0cnVlLCBldmVudHM6IHt9IH0sXG4gICAgcHJlZHJvcHBhYmxlOiB7IGVuYWJsZWQ6IHRydWUsIHNob3dEZXN0czogdHJ1ZSwgZXZlbnRzOiB7fSB9LFxuICAgIGRyYWdnYWJsZToge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGRpc3RhbmNlOiAzLFxuICAgICAgYXV0b0Rpc3RhbmNlOiB0cnVlLFxuICAgICAgc2hvd0dob3N0OiB0cnVlLFxuICAgICAgc2hvd1RvdWNoU3F1YXJlT3ZlcmxheTogdHJ1ZSxcbiAgICAgIGRlbGV0ZU9uRHJvcE9mZjogZmFsc2UsXG4gICAgICBhZGRUb0hhbmRPbkRyb3BPZmY6IGZhbHNlLFxuICAgIH0sXG4gICAgc2VsZWN0YWJsZTogeyBlbmFibGVkOiB0cnVlLCBmb3JjZVNwYXJlczogZmFsc2UsIGRlbGV0ZU9uVG91Y2g6IGZhbHNlLCBhZGRTcGFyZXNUb0hhbmQ6IGZhbHNlIH0sXG4gICAgcHJvbW90aW9uOiB7XG4gICAgICBtb3ZlUHJvbW90aW9uRGlhbG9nOiAoKSA9PiBmYWxzZSxcbiAgICAgIGZvcmNlTW92ZVByb21vdGlvbjogKCkgPT4gZmFsc2UsXG4gICAgICBkcm9wUHJvbW90aW9uRGlhbG9nOiAoKSA9PiBmYWxzZSxcbiAgICAgIGZvcmNlRHJvcFByb21vdGlvbjogKCkgPT4gZmFsc2UsXG4gICAgICBwcm9tb3Rlc1RvOiAoKSA9PiB1bmRlZmluZWQsXG4gICAgICB1bnByb21vdGVzVG86ICgpID0+IHVuZGVmaW5lZCxcbiAgICAgIGV2ZW50czoge30sXG4gICAgICBwcmV2UHJvbW90aW9uSGFzaDogJycsXG4gICAgfSxcbiAgICBmb3JzeXRoOiB7fSxcbiAgICBldmVudHM6IHt9LFxuICAgIGRyYXdhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLCAvLyBjYW4gZHJhd1xuICAgICAgdmlzaWJsZTogdHJ1ZSwgLy8gY2FuIHZpZXdcbiAgICAgIGZvcmNlZDogZmFsc2UsIC8vIGNhbiBvbmx5IGRyYXdcbiAgICAgIGVyYXNlT25DbGljazogdHJ1ZSxcbiAgICAgIHNoYXBlczogW10sXG4gICAgICBhdXRvU2hhcGVzOiBbXSxcbiAgICAgIHNxdWFyZXM6IFtdLFxuICAgICAgcHJldlN2Z0hhc2g6ICcnLFxuICAgIH0sXG4gIH07XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHsgcmVuZGVyIH0gZnJvbSAnLi9yZW5kZXIuanMnO1xuaW1wb3J0IHsgcmVuZGVySGFuZCB9IGZyb20gJy4vaGFuZHMuanMnO1xuaW1wb3J0IHsgcmVuZGVyU2hhcGVzIH0gZnJvbSAnLi9zaGFwZXMuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVkcmF3U2hhcGVzTm93KHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBpZiAoc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkPy5zaGFwZXMpXG4gICAgcmVuZGVyU2hhcGVzKFxuICAgICAgc3RhdGUsXG4gICAgICBzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQuc2hhcGVzLnN2ZyxcbiAgICAgIHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZC5zaGFwZXMuY3VzdG9tU3ZnLFxuICAgICAgc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkLnNoYXBlcy5mcmVlUGllY2VzLFxuICAgICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWRyYXdOb3coc3RhdGU6IFN0YXRlLCBza2lwU2hhcGVzPzogYm9vbGVhbik6IHZvaWQge1xuICBjb25zdCBib2FyZEVscyA9IHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZDtcbiAgaWYgKGJvYXJkRWxzKSB7XG4gICAgcmVuZGVyKHN0YXRlLCBib2FyZEVscyk7XG4gICAgaWYgKCFza2lwU2hhcGVzKSByZWRyYXdTaGFwZXNOb3coc3RhdGUpO1xuICB9XG5cbiAgY29uc3QgaGFuZEVscyA9IHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcztcbiAgaWYgKGhhbmRFbHMpIHtcbiAgICBpZiAoaGFuZEVscy50b3ApIHJlbmRlckhhbmQoc3RhdGUsIGhhbmRFbHMudG9wKTtcbiAgICBpZiAoaGFuZEVscy5ib3R0b20pIHJlbmRlckhhbmQoc3RhdGUsIGhhbmRFbHMuYm90dG9tKTtcbiAgfVxufVxuIiwgImltcG9ydCB0eXBlIHsgRE9NUmVjdE1hcCwgUGllY2VOYW1lLCBQaWVjZU5vZGUsIFdyYXBFbGVtZW50cyB9IGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHR5cGUgeyBBcGkgfSBmcm9tICcuL2FwaS5qcyc7XG5pbXBvcnQgdHlwZSB7IENvbmZpZyB9IGZyb20gJy4vY29uZmlnLmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB7IHN0YXJ0IH0gZnJvbSAnLi9hcGkuanMnO1xuaW1wb3J0IHsgY29uZmlndXJlIH0gZnJvbSAnLi9jb25maWcuanMnO1xuaW1wb3J0IHsgZGVmYXVsdHMgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsLmpzJztcbmltcG9ydCB7IHJlZHJhd0FsbCB9IGZyb20gJy4vZG9tLmpzJztcbmltcG9ydCB7IGJpbmREb2N1bWVudCB9IGZyb20gJy4vZXZlbnRzLmpzJztcbmltcG9ydCB7IHJlZHJhd05vdywgcmVkcmF3U2hhcGVzTm93IH0gZnJvbSAnLi9yZWRyYXcuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gU2hvZ2lncm91bmQoY29uZmlnPzogQ29uZmlnLCB3cmFwRWxlbWVudHM/OiBXcmFwRWxlbWVudHMpOiBBcGkge1xuICBjb25zdCBzdGF0ZSA9IGRlZmF1bHRzKCkgYXMgU3RhdGU7XG4gIGNvbmZpZ3VyZShzdGF0ZSwgY29uZmlnIHx8IHt9KTtcblxuICBjb25zdCByZWRyYXdTdGF0ZU5vdyA9IChza2lwU2hhcGVzPzogYm9vbGVhbikgPT4ge1xuICAgIHJlZHJhd05vdyhzdGF0ZSwgc2tpcFNoYXBlcyk7XG4gIH07XG5cbiAgc3RhdGUuZG9tID0ge1xuICAgIHdyYXBFbGVtZW50czogd3JhcEVsZW1lbnRzIHx8IHt9LFxuICAgIGVsZW1lbnRzOiB7fSxcbiAgICBib3VuZHM6IHtcbiAgICAgIGJvYXJkOiB7XG4gICAgICAgIGJvdW5kczogdXRpbC5tZW1vKCgpID0+IHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZD8ucGllY2VzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKSxcbiAgICAgIH0sXG4gICAgICBoYW5kczoge1xuICAgICAgICBib3VuZHM6IHV0aWwubWVtbygoKSA9PiB7XG4gICAgICAgICAgY29uc3QgaGFuZHNSZWN0czogRE9NUmVjdE1hcDwndG9wJyB8ICdib3R0b20nPiA9IG5ldyBNYXAoKSxcbiAgICAgICAgICAgIGhhbmRFbHMgPSBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHM7XG4gICAgICAgICAgaWYgKGhhbmRFbHM/LnRvcCkgaGFuZHNSZWN0cy5zZXQoJ3RvcCcsIGhhbmRFbHMudG9wLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKTtcbiAgICAgICAgICBpZiAoaGFuZEVscz8uYm90dG9tKSBoYW5kc1JlY3RzLnNldCgnYm90dG9tJywgaGFuZEVscy5ib3R0b20uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpO1xuICAgICAgICAgIHJldHVybiBoYW5kc1JlY3RzO1xuICAgICAgICB9KSxcbiAgICAgICAgcGllY2VCb3VuZHM6IHV0aWwubWVtbygoKSA9PiB7XG4gICAgICAgICAgY29uc3QgaGFuZFBpZWNlc1JlY3RzOiBET01SZWN0TWFwPFBpZWNlTmFtZT4gPSBuZXcgTWFwKCksXG4gICAgICAgICAgICBoYW5kRWxzID0gc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzO1xuXG4gICAgICAgICAgaWYgKGhhbmRFbHM/LnRvcCkge1xuICAgICAgICAgICAgbGV0IHdyYXBFbCA9IGhhbmRFbHMudG9wLmZpcnN0RWxlbWVudENoaWxkIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgd2hpbGUgKHdyYXBFbCkge1xuICAgICAgICAgICAgICBjb25zdCBwaWVjZUVsID0gd3JhcEVsLmZpcnN0RWxlbWVudENoaWxkIGFzIFBpZWNlTm9kZSxcbiAgICAgICAgICAgICAgICBwaWVjZSA9IHsgcm9sZTogcGllY2VFbC5zZ1JvbGUsIGNvbG9yOiBwaWVjZUVsLnNnQ29sb3IgfTtcbiAgICAgICAgICAgICAgaGFuZFBpZWNlc1JlY3RzLnNldCh1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKSwgcGllY2VFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSk7XG4gICAgICAgICAgICAgIHdyYXBFbCA9IHdyYXBFbC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChoYW5kRWxzPy5ib3R0b20pIHtcbiAgICAgICAgICAgIGxldCB3cmFwRWwgPSBoYW5kRWxzLmJvdHRvbS5maXJzdEVsZW1lbnRDaGlsZCBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHdoaWxlICh3cmFwRWwpIHtcbiAgICAgICAgICAgICAgY29uc3QgcGllY2VFbCA9IHdyYXBFbC5maXJzdEVsZW1lbnRDaGlsZCBhcyBQaWVjZU5vZGUsXG4gICAgICAgICAgICAgICAgcGllY2UgPSB7IHJvbGU6IHBpZWNlRWwuc2dSb2xlLCBjb2xvcjogcGllY2VFbC5zZ0NvbG9yIH07XG4gICAgICAgICAgICAgIGhhbmRQaWVjZXNSZWN0cy5zZXQodXRpbC5waWVjZU5hbWVPZihwaWVjZSksIHBpZWNlRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpO1xuICAgICAgICAgICAgICB3cmFwRWwgPSB3cmFwRWwubmV4dEVsZW1lbnRTaWJsaW5nIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gaGFuZFBpZWNlc1JlY3RzO1xuICAgICAgICB9KSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICByZWRyYXdOb3c6IHJlZHJhd1N0YXRlTm93LFxuICAgIHJlZHJhdzogZGVib3VuY2VSZWRyYXcocmVkcmF3U3RhdGVOb3cpLFxuICAgIHJlZHJhd1NoYXBlczogZGVib3VuY2VSZWRyYXcoKCkgPT4gcmVkcmF3U2hhcGVzTm93KHN0YXRlKSksXG4gICAgdW5iaW5kOiBiaW5kRG9jdW1lbnQoc3RhdGUpLFxuICAgIGRlc3Ryb3llZDogZmFsc2UsXG4gIH07XG5cbiAgaWYgKHdyYXBFbGVtZW50cykgcmVkcmF3QWxsKHdyYXBFbGVtZW50cywgc3RhdGUpO1xuXG4gIHJldHVybiBzdGFydChzdGF0ZSk7XG59XG5cbmZ1bmN0aW9uIGRlYm91bmNlUmVkcmF3KGY6ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCk6ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCB7XG4gIGxldCByZWRyYXdpbmcgPSBmYWxzZTtcbiAgcmV0dXJuICguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgIGlmIChyZWRyYXdpbmcpIHJldHVybjtcbiAgICByZWRyYXdpbmcgPSB0cnVlO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICBmKC4uLmFyZ3MpO1xuICAgICAgcmVkcmF3aW5nID0gZmFsc2U7XG4gICAgfSk7XG4gIH07XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDRU8sTUFBTSxTQUFTLENBQUMsU0FBUyxNQUFNO0FBRS9CLE1BQU0sUUFBUTtBQUFBLElBQ25CO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUNPLE1BQU0sUUFBUTtBQUFBLElBQ25CO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUVPLE1BQU0sVUFBMEIsTUFBTSxVQUFVO0FBQUEsSUFDckQsR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLE1BQU0sSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7QUFBQSxFQUM3Qzs7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QUN6RCxnQ0FBZ0IsSUFBUyxZQUFZLEtBQUssR0FBRyxRQUFRLHNCQUFzQixDQUFDO0FBQzVFLHlCQUFTLE9BQU87QUFBQSxjQUNsQjtBQUFBLFlBQ0Y7QUFDQSxtQkFBTztBQUFBLFVBQ1QsQ0FBQztBQUFBLFFBQ0g7QUFBQSxNQUNGO0FBQUEsTUFDQSxXQUFXO0FBQUEsTUFDWCxRQUFRLGVBQWUsY0FBYztBQUFBLE1BQ3JDLGNBQWMsZUFBZSxNQUFNLGdCQUFnQixLQUFLLENBQUM7QUFBQSxNQUN6RCxRQUFRLGFBQWEsS0FBSztBQUFBLE1BQzFCLFdBQVc7QUFBQSxJQUNiO0FBRUEsUUFBSSxhQUFjLFdBQVUsY0FBYyxLQUFLO0FBRS9DLFdBQU9DLE9BQU0sS0FBSztBQUFBLEVBQ3BCO0FBRUEsV0FBUyxlQUFlLEdBQXVEO0FBQzdFLFFBQUksWUFBWTtBQUNoQixXQUFPLElBQUksU0FBZ0I7QUFDekIsVUFBSSxVQUFXO0FBQ2Ysa0JBQVk7QUFDWiw0QkFBc0IsTUFBTTtBQUMxQixVQUFFLEdBQUcsSUFBSTtBQUNULG9CQUFZO0FBQUEsTUFDZCxDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0Y7OztBbkJqRkEsTUFBTyxnQkFBUTsiLAogICJuYW1lcyI6IFsibW92ZSIsICJyYW5rcyIsICJub3ciLCAiYnJ1c2hlcyIsICJlbCIsICJkZXN0IiwgInN0YXJ0IiwgImNhbmNlbCIsICJtb3ZlIiwgImVuZCIsICJ1bnNlbGVjdCIsICJyYW5rcyIsICJmaWxlcyIsICJyZW5kZXJIYW5kIiwgIm1vdmUiLCAiZW5kIiwgImNhbmNlbCIsICJzdGFydCIsICJzIiwgInJlbmRlciIsICJhbmltIiwgImsiLCAicmVuZGVyIiwgInN0YXJ0IiwgInN0YXRlIiwgImNhbmNlbCIsICJyZW5kZXIiLCAic3RhcnQiXQp9Cg==
