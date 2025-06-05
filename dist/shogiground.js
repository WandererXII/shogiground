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
      wrapEl.classList.toggle("last-dest", !!s.lastPiece && samePiece(piece, s.lastPiece));
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2luZGV4LnRzIiwgIi4uL3NyYy9jb25zdGFudHMudHMiLCAiLi4vc3JjL3V0aWwudHMiLCAiLi4vc3JjL2hhbmRzLnRzIiwgIi4uL3NyYy9ib2FyZC50cyIsICIuLi9zcmMvc2Zlbi50cyIsICIuLi9zcmMvY29uZmlnLnRzIiwgIi4uL3NyYy9hbmltLnRzIiwgIi4uL3NyYy9zaGFwZXMudHMiLCAiLi4vc3JjL2RyYXcudHMiLCAiLi4vc3JjL2RyYWcudHMiLCAiLi4vc3JjL2Nvb3Jkcy50cyIsICIuLi9zcmMvd3JhcC50cyIsICIuLi9zcmMvZXZlbnRzLnRzIiwgIi4uL3NyYy9yZW5kZXIudHMiLCAiLi4vc3JjL2RvbS50cyIsICIuLi9zcmMvYXBpLnRzIiwgIi4uL3NyYy9zdGF0ZS50cyIsICIuLi9zcmMvcmVkcmF3LnRzIiwgIi4uL3NyYy9zaG9naWdyb3VuZC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgU2hvZ2lncm91bmQgfSBmcm9tICcuL3Nob2dpZ3JvdW5kLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgU2hvZ2lncm91bmQ7XG4iLCAiaW1wb3J0IHR5cGUgeyBLZXkgfSBmcm9tICcuL3R5cGVzLmpzJztcblxuZXhwb3J0IGNvbnN0IGNvbG9ycyA9IFsnc2VudGUnLCAnZ290ZSddIGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgZmlsZXMgPSBbXG4gICcxJyxcbiAgJzInLFxuICAnMycsXG4gICc0JyxcbiAgJzUnLFxuICAnNicsXG4gICc3JyxcbiAgJzgnLFxuICAnOScsXG4gICcxMCcsXG4gICcxMScsXG4gICcxMicsXG4gICcxMycsXG4gICcxNCcsXG4gICcxNScsXG4gICcxNicsXG5dIGFzIGNvbnN0O1xuZXhwb3J0IGNvbnN0IHJhbmtzID0gW1xuICAnYScsXG4gICdiJyxcbiAgJ2MnLFxuICAnZCcsXG4gICdlJyxcbiAgJ2YnLFxuICAnZycsXG4gICdoJyxcbiAgJ2knLFxuICAnaicsXG4gICdrJyxcbiAgJ2wnLFxuICAnbScsXG4gICduJyxcbiAgJ28nLFxuICAncCcsXG5dIGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgYWxsS2V5czogcmVhZG9ubHkgS2V5W10gPSBBcnJheS5wcm90b3R5cGUuY29uY2F0KFxuICAuLi5yYW5rcy5tYXAoKHIpID0+IGZpbGVzLm1hcCgoZikgPT4gZiArIHIpKSxcbik7XG5cbmV4cG9ydCBjb25zdCBub3RhdGlvbnMgPSBbJ251bWVyaWMnLCAnamFwYW5lc2UnLCAnZW5naW5lJywgJ2hleCcsICdkaXpoaSddIGFzIGNvbnN0O1xuIiwgImltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyBhbGxLZXlzLCBjb2xvcnMgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5cbmV4cG9ydCBjb25zdCBwb3Mya2V5ID0gKHBvczogc2cuUG9zKTogc2cuS2V5ID0+IGFsbEtleXNbcG9zWzBdICsgMTYgKiBwb3NbMV1dO1xuXG5leHBvcnQgY29uc3Qga2V5MnBvcyA9IChrOiBzZy5LZXkpOiBzZy5Qb3MgPT4ge1xuICBpZiAoay5sZW5ndGggPiAyKSByZXR1cm4gW2suY2hhckNvZGVBdCgxKSAtIDM5LCBrLmNoYXJDb2RlQXQoMikgLSA5N107XG4gIGVsc2UgcmV0dXJuIFtrLmNoYXJDb2RlQXQoMCkgLSA0OSwgay5jaGFyQ29kZUF0KDEpIC0gOTddO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIG1lbW88QT4oZjogKCkgPT4gQSk6IHNnLk1lbW88QT4ge1xuICBsZXQgdjogQSB8IHVuZGVmaW5lZDtcbiAgY29uc3QgcmV0ID0gKCk6IEEgPT4ge1xuICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHYgPSBmKCk7XG4gICAgcmV0dXJuIHY7XG4gIH07XG4gIHJldC5jbGVhciA9ICgpID0+IHtcbiAgICB2ID0gdW5kZWZpbmVkO1xuICB9O1xuICByZXR1cm4gcmV0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FsbFVzZXJGdW5jdGlvbjxUIGV4dGVuZHMgKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPihcbiAgZjogVCB8IHVuZGVmaW5lZCxcbiAgLi4uYXJnczogUGFyYW1ldGVyczxUPlxuKTogdm9pZCB7XG4gIGlmIChmKSBzZXRUaW1lb3V0KCgpID0+IGYoLi4uYXJncyksIDEpO1xufVxuXG5leHBvcnQgY29uc3Qgb3Bwb3NpdGUgPSAoYzogc2cuQ29sb3IpOiBzZy5Db2xvciA9PiAoYyA9PT0gJ3NlbnRlJyA/ICdnb3RlJyA6ICdzZW50ZScpO1xuXG5leHBvcnQgY29uc3Qgc2VudGVQb3YgPSAobzogc2cuQ29sb3IpOiBib29sZWFuID0+IG8gPT09ICdzZW50ZSc7XG5cbmV4cG9ydCBjb25zdCBkaXN0YW5jZVNxID0gKHBvczE6IHNnLlBvcywgcG9zMjogc2cuUG9zKTogbnVtYmVyID0+IHtcbiAgY29uc3QgZHggPSBwb3MxWzBdIC0gcG9zMlswXSxcbiAgICBkeSA9IHBvczFbMV0gLSBwb3MyWzFdO1xuICByZXR1cm4gZHggKiBkeCArIGR5ICogZHk7XG59O1xuXG5leHBvcnQgY29uc3Qgc2FtZVBpZWNlID0gKHAxOiBzZy5QaWVjZSwgcDI6IHNnLlBpZWNlKTogYm9vbGVhbiA9PlxuICBwMS5yb2xlID09PSBwMi5yb2xlICYmIHAxLmNvbG9yID09PSBwMi5jb2xvcjtcblxuY29uc3QgcG9zVG9UcmFuc2xhdGVCYXNlID0gKFxuICBwb3M6IHNnLlBvcyxcbiAgZGltczogc2cuRGltZW5zaW9ucyxcbiAgYXNTZW50ZTogYm9vbGVhbixcbiAgeEZhY3RvcjogbnVtYmVyLFxuICB5RmFjdG9yOiBudW1iZXIsXG4pOiBzZy5OdW1iZXJQYWlyID0+IFtcbiAgKGFzU2VudGUgPyBkaW1zLmZpbGVzIC0gMSAtIHBvc1swXSA6IHBvc1swXSkgKiB4RmFjdG9yLFxuICAoYXNTZW50ZSA/IHBvc1sxXSA6IGRpbXMucmFua3MgLSAxIC0gcG9zWzFdKSAqIHlGYWN0b3IsXG5dO1xuXG5leHBvcnQgY29uc3QgcG9zVG9UcmFuc2xhdGVBYnMgPSAoXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGJvdW5kczogRE9NUmVjdCxcbik6ICgocG9zOiBzZy5Qb3MsIGFzU2VudGU6IGJvb2xlYW4pID0+IHNnLk51bWJlclBhaXIpID0+IHtcbiAgY29uc3QgeEZhY3RvciA9IGJvdW5kcy53aWR0aCAvIGRpbXMuZmlsZXMsXG4gICAgeUZhY3RvciA9IGJvdW5kcy5oZWlnaHQgLyBkaW1zLnJhbmtzO1xuICByZXR1cm4gKHBvcywgYXNTZW50ZSkgPT4gcG9zVG9UcmFuc2xhdGVCYXNlKHBvcywgZGltcywgYXNTZW50ZSwgeEZhY3RvciwgeUZhY3Rvcik7XG59O1xuXG5leHBvcnQgY29uc3QgcG9zVG9UcmFuc2xhdGVSZWwgPVxuICAoZGltczogc2cuRGltZW5zaW9ucyk6ICgocG9zOiBzZy5Qb3MsIGFzU2VudGU6IGJvb2xlYW4pID0+IHNnLk51bWJlclBhaXIpID0+XG4gIChwb3MsIGFzU2VudGUpID0+XG4gICAgcG9zVG9UcmFuc2xhdGVCYXNlKHBvcywgZGltcywgYXNTZW50ZSwgMTAwLCAxMDApO1xuXG5leHBvcnQgY29uc3QgdHJhbnNsYXRlQWJzID0gKGVsOiBIVE1MRWxlbWVudCwgcG9zOiBzZy5OdW1iZXJQYWlyLCBzY2FsZTogbnVtYmVyKTogdm9pZCA9PiB7XG4gIGVsLnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUoJHtwb3NbMF19cHgsJHtwb3NbMV19cHgpIHNjYWxlKCR7c2NhbGV9YDtcbn07XG5cbmV4cG9ydCBjb25zdCB0cmFuc2xhdGVSZWwgPSAoXG4gIGVsOiBIVE1MRWxlbWVudCxcbiAgcGVyY2VudHM6IHNnLk51bWJlclBhaXIsXG4gIHNjYWxlRmFjdG9yOiBudW1iZXIsXG4gIHNjYWxlPzogbnVtYmVyLFxuKTogdm9pZCA9PiB7XG4gIGVsLnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUoJHtwZXJjZW50c1swXSAqIHNjYWxlRmFjdG9yfSUsJHtwZXJjZW50c1sxXSAqIHNjYWxlRmFjdG9yfSUpIHNjYWxlKCR7XG4gICAgc2NhbGUgfHwgc2NhbGVGYWN0b3JcbiAgfSlgO1xufTtcblxuZXhwb3J0IGNvbnN0IHNldERpc3BsYXkgPSAoZWw6IEhUTUxFbGVtZW50LCB2OiBib29sZWFuKTogdm9pZCA9PiB7XG4gIGVsLnN0eWxlLmRpc3BsYXkgPSB2ID8gJycgOiAnbm9uZSc7XG59O1xuXG5leHBvcnQgY29uc3QgZXZlbnRQb3NpdGlvbiA9IChlOiBzZy5Nb3VjaEV2ZW50KTogc2cuTnVtYmVyUGFpciB8IHVuZGVmaW5lZCA9PiB7XG4gIGlmIChlLmNsaWVudFggfHwgZS5jbGllbnRYID09PSAwKSByZXR1cm4gW2UuY2xpZW50WCwgZS5jbGllbnRZIV07XG4gIGlmIChlLnRhcmdldFRvdWNoZXM/LlswXSkgcmV0dXJuIFtlLnRhcmdldFRvdWNoZXNbMF0uY2xpZW50WCwgZS50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFldO1xuICByZXR1cm47IC8vIHRvdWNoZW5kIGhhcyBubyBwb3NpdGlvbiFcbn07XG5cbmV4cG9ydCBjb25zdCBpc1JpZ2h0QnV0dG9uID0gKGU6IHNnLk1vdWNoRXZlbnQpOiBib29sZWFuID0+IGUuYnV0dG9ucyA9PT0gMiB8fCBlLmJ1dHRvbiA9PT0gMjtcblxuZXhwb3J0IGNvbnN0IGlzTWlkZGxlQnV0dG9uID0gKGU6IHNnLk1vdWNoRXZlbnQpOiBib29sZWFuID0+IGUuYnV0dG9ucyA9PT0gNCB8fCBlLmJ1dHRvbiA9PT0gMTtcblxuZXhwb3J0IGNvbnN0IGNyZWF0ZUVsID0gKHRhZ05hbWU6IHN0cmluZywgY2xhc3NOYW1lPzogc3RyaW5nKTogSFRNTEVsZW1lbnQgPT4ge1xuICBjb25zdCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnTmFtZSk7XG4gIGlmIChjbGFzc05hbWUpIGVsLmNsYXNzTmFtZSA9IGNsYXNzTmFtZTtcbiAgcmV0dXJuIGVsO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHBpZWNlTmFtZU9mKHBpZWNlOiBzZy5QaWVjZSk6IHNnLlBpZWNlTmFtZSB7XG4gIHJldHVybiBgJHtwaWVjZS5jb2xvcn0gJHtwaWVjZS5yb2xlfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVBpZWNlTmFtZShwaWVjZU5hbWU6IHNnLlBpZWNlTmFtZSk6IHNnLlBpZWNlIHtcbiAgY29uc3Qgc3BsaXR0ZWQgPSBwaWVjZU5hbWUuc3BsaXQoJyAnLCAyKTtcbiAgcmV0dXJuIHsgY29sb3I6IHNwbGl0dGVkWzBdIGFzIHNnLkNvbG9yLCByb2xlOiBzcGxpdHRlZFsxXSB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQaWVjZU5vZGUoZWw6IEhUTUxFbGVtZW50KTogZWwgaXMgc2cuUGllY2VOb2RlIHtcbiAgcmV0dXJuIGVsLnRhZ05hbWUgPT09ICdQSUVDRSc7XG59XG5leHBvcnQgZnVuY3Rpb24gaXNTcXVhcmVOb2RlKGVsOiBIVE1MRWxlbWVudCk6IGVsIGlzIHNnLlNxdWFyZU5vZGUge1xuICByZXR1cm4gZWwudGFnTmFtZSA9PT0gJ1NRJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVTcXVhcmVDZW50ZXIoXG4gIGtleTogc2cuS2V5LFxuICBhc1NlbnRlOiBib29sZWFuLFxuICBkaW1zOiBzZy5EaW1lbnNpb25zLFxuICBib3VuZHM6IERPTVJlY3QsXG4pOiBzZy5OdW1iZXJQYWlyIHtcbiAgY29uc3QgcG9zID0ga2V5MnBvcyhrZXkpO1xuICBpZiAoYXNTZW50ZSkge1xuICAgIHBvc1swXSA9IGRpbXMuZmlsZXMgLSAxIC0gcG9zWzBdO1xuICAgIHBvc1sxXSA9IGRpbXMucmFua3MgLSAxIC0gcG9zWzFdO1xuICB9XG4gIHJldHVybiBbXG4gICAgYm91bmRzLmxlZnQgKyAoYm91bmRzLndpZHRoICogcG9zWzBdKSAvIGRpbXMuZmlsZXMgKyBib3VuZHMud2lkdGggLyAoZGltcy5maWxlcyAqIDIpLFxuICAgIGJvdW5kcy50b3AgK1xuICAgICAgKGJvdW5kcy5oZWlnaHQgKiAoZGltcy5yYW5rcyAtIDEgLSBwb3NbMV0pKSAvIGRpbXMucmFua3MgK1xuICAgICAgYm91bmRzLmhlaWdodCAvIChkaW1zLnJhbmtzICogMiksXG4gIF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkb21TcXVhcmVJbmRleE9mS2V5KGtleTogc2cuS2V5LCBhc1NlbnRlOiBib29sZWFuLCBkaW1zOiBzZy5EaW1lbnNpb25zKTogbnVtYmVyIHtcbiAgY29uc3QgcG9zID0ga2V5MnBvcyhrZXkpO1xuICBsZXQgaW5kZXggPSBkaW1zLmZpbGVzIC0gMSAtIHBvc1swXSArIHBvc1sxXSAqIGRpbXMuZmlsZXM7XG4gIGlmICghYXNTZW50ZSkgaW5kZXggPSBkaW1zLmZpbGVzICogZGltcy5yYW5rcyAtIDEgLSBpbmRleDtcblxuICByZXR1cm4gaW5kZXg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0luc2lkZVJlY3QocmVjdDogRE9NUmVjdCwgcG9zOiBzZy5OdW1iZXJQYWlyKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgcmVjdC5sZWZ0IDw9IHBvc1swXSAmJlxuICAgIHJlY3QudG9wIDw9IHBvc1sxXSAmJlxuICAgIHJlY3QubGVmdCArIHJlY3Qud2lkdGggPiBwb3NbMF0gJiZcbiAgICByZWN0LnRvcCArIHJlY3QuaGVpZ2h0ID4gcG9zWzFdXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRLZXlBdERvbVBvcyhcbiAgcG9zOiBzZy5OdW1iZXJQYWlyLFxuICBhc1NlbnRlOiBib29sZWFuLFxuICBkaW1zOiBzZy5EaW1lbnNpb25zLFxuICBib3VuZHM6IERPTVJlY3QsXG4pOiBzZy5LZXkgfCB1bmRlZmluZWQge1xuICBsZXQgZmlsZSA9IE1hdGguZmxvb3IoKGRpbXMuZmlsZXMgKiAocG9zWzBdIC0gYm91bmRzLmxlZnQpKSAvIGJvdW5kcy53aWR0aCk7XG4gIGlmIChhc1NlbnRlKSBmaWxlID0gZGltcy5maWxlcyAtIDEgLSBmaWxlO1xuICBsZXQgcmFuayA9IE1hdGguZmxvb3IoKGRpbXMucmFua3MgKiAocG9zWzFdIC0gYm91bmRzLnRvcCkpIC8gYm91bmRzLmhlaWdodCk7XG4gIGlmICghYXNTZW50ZSkgcmFuayA9IGRpbXMucmFua3MgLSAxIC0gcmFuaztcbiAgcmV0dXJuIGZpbGUgPj0gMCAmJiBmaWxlIDwgZGltcy5maWxlcyAmJiByYW5rID49IDAgJiYgcmFuayA8IGRpbXMucmFua3NcbiAgICA/IHBvczJrZXkoW2ZpbGUsIHJhbmtdKVxuICAgIDogdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGFuZFBpZWNlQXREb21Qb3MoXG4gIHBvczogc2cuTnVtYmVyUGFpcixcbiAgcm9sZXM6IHNnLlJvbGVTdHJpbmdbXSxcbiAgYm91bmRzOiBNYXA8c2cuUGllY2VOYW1lLCBET01SZWN0Pixcbik6IHNnLlBpZWNlIHwgdW5kZWZpbmVkIHtcbiAgZm9yIChjb25zdCBjb2xvciBvZiBjb2xvcnMpIHtcbiAgICBmb3IgKGNvbnN0IHJvbGUgb2Ygcm9sZXMpIHtcbiAgICAgIGNvbnN0IHBpZWNlID0geyBjb2xvciwgcm9sZSB9LFxuICAgICAgICBwaWVjZVJlY3QgPSBib3VuZHMuZ2V0KHBpZWNlTmFtZU9mKHBpZWNlKSk7XG4gICAgICBpZiAocGllY2VSZWN0ICYmIGlzSW5zaWRlUmVjdChwaWVjZVJlY3QsIHBvcykpIHJldHVybiBwaWVjZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcG9zT2ZPdXRzaWRlRWwoXG4gIGxlZnQ6IG51bWJlcixcbiAgdG9wOiBudW1iZXIsXG4gIGFzU2VudGU6IGJvb2xlYW4sXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGJvYXJkQm91bmRzOiBET01SZWN0LFxuKTogc2cuUG9zIHwgdW5kZWZpbmVkIHtcbiAgY29uc3Qgc3FXID0gYm9hcmRCb3VuZHMud2lkdGggLyBkaW1zLmZpbGVzLFxuICAgIHNxSCA9IGJvYXJkQm91bmRzLmhlaWdodCAvIGRpbXMucmFua3M7XG4gIGlmICghc3FXIHx8ICFzcUgpIHJldHVybjtcbiAgbGV0IHhPZmYgPSAobGVmdCAtIGJvYXJkQm91bmRzLmxlZnQpIC8gc3FXO1xuICBpZiAoYXNTZW50ZSkgeE9mZiA9IGRpbXMuZmlsZXMgLSAxIC0geE9mZjtcbiAgbGV0IHlPZmYgPSAodG9wIC0gYm9hcmRCb3VuZHMudG9wKSAvIHNxSDtcbiAgaWYgKCFhc1NlbnRlKSB5T2ZmID0gZGltcy5yYW5rcyAtIDEgLSB5T2ZmO1xuICByZXR1cm4gW3hPZmYsIHlPZmZdO1xufVxuIiwgImltcG9ydCB0eXBlIHsgSGVhZGxlc3NTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IHNhbWVQaWVjZSB9IGZyb20gJy4vdXRpbC5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRUb0hhbmQoczogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBjbnQgPSAxKTogdm9pZCB7XG4gIGNvbnN0IGhhbmQgPSBzLmhhbmRzLmhhbmRNYXAuZ2V0KHBpZWNlLmNvbG9yKSxcbiAgICByb2xlID1cbiAgICAgIChzLmhhbmRzLnJvbGVzLmluY2x1ZGVzKHBpZWNlLnJvbGUpID8gcGllY2Uucm9sZSA6IHMucHJvbW90aW9uLnVucHJvbW90ZXNUbyhwaWVjZS5yb2xlKSkgfHxcbiAgICAgIHBpZWNlLnJvbGU7XG4gIGlmIChoYW5kICYmIHMuaGFuZHMucm9sZXMuaW5jbHVkZXMocm9sZSkpIGhhbmQuc2V0KHJvbGUsIChoYW5kLmdldChyb2xlKSB8fCAwKSArIGNudCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVGcm9tSGFuZChzOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGNudCA9IDEpOiB2b2lkIHtcbiAgY29uc3QgaGFuZCA9IHMuaGFuZHMuaGFuZE1hcC5nZXQocGllY2UuY29sb3IpLFxuICAgIHJvbGUgPVxuICAgICAgKHMuaGFuZHMucm9sZXMuaW5jbHVkZXMocGllY2Uucm9sZSkgPyBwaWVjZS5yb2xlIDogcy5wcm9tb3Rpb24udW5wcm9tb3Rlc1RvKHBpZWNlLnJvbGUpKSB8fFxuICAgICAgcGllY2Uucm9sZSxcbiAgICBudW0gPSBoYW5kPy5nZXQocm9sZSk7XG4gIGlmIChoYW5kICYmIG51bSkgaGFuZC5zZXQocm9sZSwgTWF0aC5tYXgobnVtIC0gY250LCAwKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJIYW5kKHM6IEhlYWRsZXNzU3RhdGUsIGhhbmRFbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgaGFuZEVsLmNsYXNzTGlzdC50b2dnbGUoJ3Byb21vdGlvbicsICEhcy5wcm9tb3Rpb24uY3VycmVudCk7XG4gIGxldCB3cmFwRWwgPSBoYW5kRWwuZmlyc3RFbGVtZW50Q2hpbGQgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIHdoaWxlICh3cmFwRWwpIHtcbiAgICBjb25zdCBwaWVjZUVsID0gd3JhcEVsLmZpcnN0RWxlbWVudENoaWxkIGFzIHNnLlBpZWNlTm9kZSxcbiAgICAgIHBpZWNlID0geyByb2xlOiBwaWVjZUVsLnNnUm9sZSwgY29sb3I6IHBpZWNlRWwuc2dDb2xvciB9LFxuICAgICAgbnVtID0gcy5oYW5kcy5oYW5kTWFwLmdldChwaWVjZS5jb2xvcik/LmdldChwaWVjZS5yb2xlKSB8fCAwLFxuICAgICAgaXNTZWxlY3RlZCA9ICEhcy5zZWxlY3RlZFBpZWNlICYmIHNhbWVQaWVjZShwaWVjZSwgcy5zZWxlY3RlZFBpZWNlKSAmJiAhcy5kcm9wcGFibGUuc3BhcmU7XG5cbiAgICB3cmFwRWwuY2xhc3NMaXN0LnRvZ2dsZShcbiAgICAgICdzZWxlY3RlZCcsXG4gICAgICAocy5hY3RpdmVDb2xvciA9PT0gJ2JvdGgnIHx8IHMuYWN0aXZlQ29sb3IgPT09IHMudHVybkNvbG9yKSAmJiBpc1NlbGVjdGVkLFxuICAgICk7XG4gICAgd3JhcEVsLmNsYXNzTGlzdC50b2dnbGUoXG4gICAgICAncHJlc2VsZWN0ZWQnLFxuICAgICAgcy5hY3RpdmVDb2xvciAhPT0gJ2JvdGgnICYmIHMuYWN0aXZlQ29sb3IgIT09IHMudHVybkNvbG9yICYmIGlzU2VsZWN0ZWQsXG4gICAgKTtcbiAgICB3cmFwRWwuY2xhc3NMaXN0LnRvZ2dsZSgnbGFzdC1kZXN0JywgISFzLmxhc3RQaWVjZSAmJiBzYW1lUGllY2UocGllY2UsIHMubGFzdFBpZWNlKSk7XG4gICAgd3JhcEVsLmNsYXNzTGlzdC50b2dnbGUoJ2RyYXdpbmcnLCAhIXMuZHJhd2FibGUucGllY2UgJiYgc2FtZVBpZWNlKHMuZHJhd2FibGUucGllY2UsIHBpZWNlKSk7XG4gICAgd3JhcEVsLmNsYXNzTGlzdC50b2dnbGUoXG4gICAgICAnY3VycmVudC1wcmUnLFxuICAgICAgISFzLnByZWRyb3BwYWJsZS5jdXJyZW50ICYmIHNhbWVQaWVjZShzLnByZWRyb3BwYWJsZS5jdXJyZW50LnBpZWNlLCBwaWVjZSksXG4gICAgKTtcbiAgICB3cmFwRWwuZGF0YXNldC5uYiA9IG51bS50b1N0cmluZygpO1xuICAgIHdyYXBFbCA9IHdyYXBFbC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIH1cbn1cbiIsICJpbXBvcnQgdHlwZSB7IEhlYWRsZXNzU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyBjYWxsVXNlckZ1bmN0aW9uLCBvcHBvc2l0ZSwgcGllY2VOYW1lT2YsIHNhbWVQaWVjZSB9IGZyb20gJy4vdXRpbC5qcyc7XG5pbXBvcnQgeyBhZGRUb0hhbmQsIHJlbW92ZUZyb21IYW5kIH0gZnJvbSAnLi9oYW5kcy5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiB0b2dnbGVPcmllbnRhdGlvbihzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICBzdGF0ZS5vcmllbnRhdGlvbiA9IG9wcG9zaXRlKHN0YXRlLm9yaWVudGF0aW9uKTtcbiAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPVxuICAgIHN0YXRlLmRyYWdnYWJsZS5jdXJyZW50ID1cbiAgICBzdGF0ZS5wcm9tb3Rpb24uY3VycmVudCA9XG4gICAgc3RhdGUuaG92ZXJlZCA9XG4gICAgc3RhdGUuc2VsZWN0ZWQgPVxuICAgIHN0YXRlLnNlbGVjdGVkUGllY2UgPVxuICAgICAgdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzZXQoc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiB2b2lkIHtcbiAgdW5zZWxlY3Qoc3RhdGUpO1xuICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICB1bnNldFByZWRyb3Aoc3RhdGUpO1xuICBjYW5jZWxQcm9tb3Rpb24oc3RhdGUpO1xuICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHN0YXRlLmRyYWdnYWJsZS5jdXJyZW50ID0gc3RhdGUuaG92ZXJlZCA9IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFBpZWNlcyhzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2VzOiBzZy5QaWVjZXNEaWZmKTogdm9pZCB7XG4gIGZvciAoY29uc3QgW2tleSwgcGllY2VdIG9mIHBpZWNlcykge1xuICAgIGlmIChwaWVjZSkgc3RhdGUucGllY2VzLnNldChrZXksIHBpZWNlKTtcbiAgICBlbHNlIHN0YXRlLnBpZWNlcy5kZWxldGUoa2V5KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0Q2hlY2tzKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBjaGVja3NWYWx1ZTogc2cuS2V5W10gfCBzZy5Db2xvciB8IGJvb2xlYW4pOiB2b2lkIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoY2hlY2tzVmFsdWUpKSB7XG4gICAgc3RhdGUuY2hlY2tzID0gY2hlY2tzVmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGNoZWNrc1ZhbHVlID09PSB0cnVlKSBjaGVja3NWYWx1ZSA9IHN0YXRlLnR1cm5Db2xvcjtcbiAgICBpZiAoY2hlY2tzVmFsdWUpIHtcbiAgICAgIGNvbnN0IGNoZWNrczogc2cuS2V5W10gPSBbXTtcbiAgICAgIGZvciAoY29uc3QgW2ssIHBdIG9mIHN0YXRlLnBpZWNlcykge1xuICAgICAgICBpZiAoc3RhdGUuaGlnaGxpZ2h0LmNoZWNrUm9sZXMuaW5jbHVkZXMocC5yb2xlKSAmJiBwLmNvbG9yID09PSBjaGVja3NWYWx1ZSkgY2hlY2tzLnB1c2goayk7XG4gICAgICB9XG4gICAgICBzdGF0ZS5jaGVja3MgPSBjaGVja3M7XG4gICAgfSBlbHNlIHN0YXRlLmNoZWNrcyA9IHVuZGVmaW5lZDtcbiAgfVxufVxuXG5mdW5jdGlvbiBzZXRQcmVtb3ZlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSwgcHJvbTogYm9vbGVhbik6IHZvaWQge1xuICB1bnNldFByZWRyb3Aoc3RhdGUpO1xuICBzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQgPSB7IG9yaWcsIGRlc3QsIHByb20gfTtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcmVtb3ZhYmxlLmV2ZW50cy5zZXQsIG9yaWcsIGRlc3QsIHByb20pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5zZXRQcmVtb3ZlKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQpIHtcbiAgICBzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcmVtb3ZhYmxlLmV2ZW50cy51bnNldCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0UHJlZHJvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSwgcHJvbTogYm9vbGVhbik6IHZvaWQge1xuICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICBzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCA9IHsgcGllY2UsIGtleSwgcHJvbSB9O1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByZWRyb3BwYWJsZS5ldmVudHMuc2V0LCBwaWVjZSwga2V5LCBwcm9tKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuc2V0UHJlZHJvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICBpZiAoc3RhdGUucHJlZHJvcHBhYmxlLmN1cnJlbnQpIHtcbiAgICBzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByZWRyb3BwYWJsZS5ldmVudHMudW5zZXQpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYXNlTW92ZShcbiAgc3RhdGU6IEhlYWRsZXNzU3RhdGUsXG4gIG9yaWc6IHNnLktleSxcbiAgZGVzdDogc2cuS2V5LFxuICBwcm9tOiBib29sZWFuLFxuKTogc2cuUGllY2UgfCBib29sZWFuIHtcbiAgY29uc3Qgb3JpZ1BpZWNlID0gc3RhdGUucGllY2VzLmdldChvcmlnKSxcbiAgICBkZXN0UGllY2UgPSBzdGF0ZS5waWVjZXMuZ2V0KGRlc3QpO1xuICBpZiAob3JpZyA9PT0gZGVzdCB8fCAhb3JpZ1BpZWNlKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IGNhcHR1cmVkID0gZGVzdFBpZWNlICYmIGRlc3RQaWVjZS5jb2xvciAhPT0gb3JpZ1BpZWNlLmNvbG9yID8gZGVzdFBpZWNlIDogdW5kZWZpbmVkLFxuICAgIHByb21QaWVjZSA9IHByb20gJiYgcHJvbW90ZVBpZWNlKHN0YXRlLCBvcmlnUGllY2UpO1xuICBpZiAoZGVzdCA9PT0gc3RhdGUuc2VsZWN0ZWQgfHwgb3JpZyA9PT0gc3RhdGUuc2VsZWN0ZWQpIHVuc2VsZWN0KHN0YXRlKTtcbiAgc3RhdGUucGllY2VzLnNldChkZXN0LCBwcm9tUGllY2UgfHwgb3JpZ1BpZWNlKTtcbiAgc3RhdGUucGllY2VzLmRlbGV0ZShvcmlnKTtcbiAgc3RhdGUubGFzdERlc3RzID0gW29yaWcsIGRlc3RdO1xuICBzdGF0ZS5sYXN0UGllY2UgPSB1bmRlZmluZWQ7XG4gIHN0YXRlLmNoZWNrcyA9IHVuZGVmaW5lZDtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMubW92ZSwgb3JpZywgZGVzdCwgcHJvbSwgY2FwdHVyZWQpO1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5jaGFuZ2UpO1xuICByZXR1cm4gY2FwdHVyZWQgfHwgdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2VEcm9wKFxuICBzdGF0ZTogSGVhZGxlc3NTdGF0ZSxcbiAgcGllY2U6IHNnLlBpZWNlLFxuICBrZXk6IHNnLktleSxcbiAgcHJvbTogYm9vbGVhbixcbik6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZUNvdW50ID0gc3RhdGUuaGFuZHMuaGFuZE1hcC5nZXQocGllY2UuY29sb3IpPy5nZXQocGllY2Uucm9sZSkgfHwgMDtcbiAgaWYgKCFwaWVjZUNvdW50ICYmICFzdGF0ZS5kcm9wcGFibGUuc3BhcmUpIHJldHVybiBmYWxzZTtcbiAgY29uc3QgcHJvbVBpZWNlID0gcHJvbSAmJiBwcm9tb3RlUGllY2Uoc3RhdGUsIHBpZWNlKTtcbiAgaWYgKFxuICAgIGtleSA9PT0gc3RhdGUuc2VsZWN0ZWQgfHxcbiAgICAoIXN0YXRlLmRyb3BwYWJsZS5zcGFyZSAmJlxuICAgICAgcGllY2VDb3VudCA9PT0gMSAmJlxuICAgICAgc3RhdGUuc2VsZWN0ZWRQaWVjZSAmJlxuICAgICAgc2FtZVBpZWNlKHN0YXRlLnNlbGVjdGVkUGllY2UsIHBpZWNlKSlcbiAgKVxuICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgc3RhdGUucGllY2VzLnNldChrZXksIHByb21QaWVjZSB8fCBwaWVjZSk7XG4gIHN0YXRlLmxhc3REZXN0cyA9IFtrZXldO1xuICBzdGF0ZS5sYXN0UGllY2UgPSBwaWVjZTtcbiAgc3RhdGUuY2hlY2tzID0gdW5kZWZpbmVkO1xuICBpZiAoIXN0YXRlLmRyb3BwYWJsZS5zcGFyZSkgcmVtb3ZlRnJvbUhhbmQoc3RhdGUsIHBpZWNlKTtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuZHJvcCwgcGllY2UsIGtleSwgcHJvbSk7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBiYXNlVXNlck1vdmUoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBvcmlnOiBzZy5LZXksXG4gIGRlc3Q6IHNnLktleSxcbiAgcHJvbTogYm9vbGVhbixcbik6IHNnLlBpZWNlIHwgYm9vbGVhbiB7XG4gIGNvbnN0IHJlc3VsdCA9IGJhc2VNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0LCBwcm9tKTtcbiAgaWYgKHJlc3VsdCkge1xuICAgIHN0YXRlLm1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZHJvcHBhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLnR1cm5Db2xvciA9IG9wcG9zaXRlKHN0YXRlLnR1cm5Db2xvcik7XG4gICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gYmFzZVVzZXJEcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tOiBib29sZWFuKTogYm9vbGVhbiB7XG4gIGNvbnN0IHJlc3VsdCA9IGJhc2VEcm9wKHN0YXRlLCBwaWVjZSwga2V5LCBwcm9tKTtcbiAgaWYgKHJlc3VsdCkge1xuICAgIHN0YXRlLm1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZHJvcHBhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLnR1cm5Db2xvciA9IG9wcG9zaXRlKHN0YXRlLnR1cm5Db2xvcik7XG4gICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZXJEcm9wKFxuICBzdGF0ZTogSGVhZGxlc3NTdGF0ZSxcbiAgcGllY2U6IHNnLlBpZWNlLFxuICBrZXk6IHNnLktleSxcbiAgcHJvbT86IGJvb2xlYW4sXG4pOiBib29sZWFuIHtcbiAgY29uc3QgcmVhbFByb20gPSBwcm9tIHx8IHN0YXRlLnByb21vdGlvbi5mb3JjZURyb3BQcm9tb3Rpb24ocGllY2UsIGtleSk7XG4gIGlmIChjYW5Ecm9wKHN0YXRlLCBwaWVjZSwga2V5KSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGJhc2VVc2VyRHJvcChzdGF0ZSwgcGllY2UsIGtleSwgcmVhbFByb20pO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZHJvcHBhYmxlLmV2ZW50cy5hZnRlciwgcGllY2UsIGtleSwgcmVhbFByb20sIHsgcHJlbWFkZTogZmFsc2UgfSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoY2FuUHJlZHJvcChzdGF0ZSwgcGllY2UsIGtleSkpIHtcbiAgICBzZXRQcmVkcm9wKHN0YXRlLCBwaWVjZSwga2V5LCByZWFsUHJvbSk7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlck1vdmUoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBvcmlnOiBzZy5LZXksXG4gIGRlc3Q6IHNnLktleSxcbiAgcHJvbT86IGJvb2xlYW4sXG4pOiBib29sZWFuIHtcbiAgY29uc3QgcmVhbFByb20gPSBwcm9tIHx8IHN0YXRlLnByb21vdGlvbi5mb3JjZU1vdmVQcm9tb3Rpb24ob3JpZywgZGVzdCk7XG4gIGlmIChjYW5Nb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGJhc2VVc2VyTW92ZShzdGF0ZSwgb3JpZywgZGVzdCwgcmVhbFByb20pO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgICAgIGNvbnN0IG1ldGFkYXRhOiBzZy5Nb3ZlTWV0YWRhdGEgPSB7IHByZW1hZGU6IGZhbHNlIH07XG4gICAgICBpZiAocmVzdWx0ICE9PSB0cnVlKSBtZXRhZGF0YS5jYXB0dXJlZCA9IHJlc3VsdDtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUubW92YWJsZS5ldmVudHMuYWZ0ZXIsIG9yaWcsIGRlc3QsIHJlYWxQcm9tLCBtZXRhZGF0YSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoY2FuUHJlbW92ZShzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICBzZXRQcmVtb3ZlKHN0YXRlLCBvcmlnLCBkZXN0LCByZWFsUHJvbSk7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFzZVByb21vdGlvbkRpYWxvZyhzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwcm9tb3RlZFBpZWNlID0gcHJvbW90ZVBpZWNlKHN0YXRlLCBwaWVjZSk7XG4gIGlmIChzdGF0ZS52aWV3T25seSB8fCBzdGF0ZS5wcm9tb3Rpb24uY3VycmVudCB8fCAhcHJvbW90ZWRQaWVjZSkgcmV0dXJuIGZhbHNlO1xuXG4gIHN0YXRlLnByb21vdGlvbi5jdXJyZW50ID0geyBwaWVjZSwgcHJvbW90ZWRQaWVjZSwga2V5LCBkcmFnZ2VkOiAhIXN0YXRlLmRyYWdnYWJsZS5jdXJyZW50IH07XG4gIHN0YXRlLmhvdmVyZWQgPSBrZXk7XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9tb3Rpb25EaWFsb2dEcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5KTogYm9vbGVhbiB7XG4gIGlmIChcbiAgICBjYW5Ecm9wUHJvbW90ZShzdGF0ZSwgcGllY2UsIGtleSkgJiZcbiAgICAoY2FuRHJvcChzdGF0ZSwgcGllY2UsIGtleSkgfHwgY2FuUHJlZHJvcChzdGF0ZSwgcGllY2UsIGtleSkpXG4gICkge1xuICAgIGlmIChiYXNlUHJvbW90aW9uRGlhbG9nKHN0YXRlLCBwaWVjZSwga2V5KSkge1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcm9tb3Rpb24uZXZlbnRzLmluaXRpYXRlZCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvbW90aW9uRGlhbG9nTW92ZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgb3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgaWYgKFxuICAgIGNhbk1vdmVQcm9tb3RlKHN0YXRlLCBvcmlnLCBkZXN0KSAmJlxuICAgIChjYW5Nb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSB8fCBjYW5QcmVtb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSlcbiAgKSB7XG4gICAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXMuZ2V0KG9yaWcpO1xuICAgIGlmIChwaWVjZSAmJiBiYXNlUHJvbW90aW9uRGlhbG9nKHN0YXRlLCBwaWVjZSwgZGVzdCkpIHtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJvbW90aW9uLmV2ZW50cy5pbml0aWF0ZWQpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gcHJvbW90ZVBpZWNlKHM6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSk6IHNnLlBpZWNlIHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgcHJvbVJvbGUgPSBzLnByb21vdGlvbi5wcm9tb3Rlc1RvKHBpZWNlLnJvbGUpO1xuICByZXR1cm4gcHJvbVJvbGUgIT09IHVuZGVmaW5lZCA/IHsgY29sb3I6IHBpZWNlLmNvbG9yLCByb2xlOiBwcm9tUm9sZSB9IDogdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVsZXRlUGllY2Uoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIGtleTogc2cuS2V5KTogdm9pZCB7XG4gIGlmIChzdGF0ZS5waWVjZXMuZGVsZXRlKGtleSkpIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RTcXVhcmUoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBrZXk6IHNnLktleSxcbiAgcHJvbT86IGJvb2xlYW4sXG4gIGZvcmNlPzogYm9vbGVhbixcbik6IHZvaWQge1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5zZWxlY3QsIGtleSk7XG5cbiAgLy8gdW5zZWxlY3QgaWYgc2VsZWN0aW5nIHNlbGVjdGVkIGtleSwga2VlcCBzZWxlY3RlZCBmb3IgZHJhZ1xuICBpZiAoIXN0YXRlLmRyYWdnYWJsZS5lbmFibGVkICYmIHN0YXRlLnNlbGVjdGVkID09PSBrZXkpIHtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy51bnNlbGVjdCwga2V5KTtcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gdHJ5IG1vdmluZy9kcm9wcGluZ1xuICBpZiAoXG4gICAgc3RhdGUuc2VsZWN0YWJsZS5lbmFibGVkIHx8XG4gICAgZm9yY2UgfHxcbiAgICAoc3RhdGUuc2VsZWN0YWJsZS5mb3JjZVNwYXJlcyAmJiBzdGF0ZS5zZWxlY3RlZFBpZWNlICYmIHN0YXRlLmRyb3BwYWJsZS5zcGFyZSlcbiAgKSB7XG4gICAgaWYgKHN0YXRlLnNlbGVjdGVkUGllY2UgJiYgdXNlckRyb3Aoc3RhdGUsIHN0YXRlLnNlbGVjdGVkUGllY2UsIGtleSwgcHJvbSkpIHJldHVybjtcbiAgICBlbHNlIGlmIChzdGF0ZS5zZWxlY3RlZCAmJiB1c2VyTW92ZShzdGF0ZSwgc3RhdGUuc2VsZWN0ZWQsIGtleSwgcHJvbSkpIHJldHVybjtcbiAgfVxuXG4gIGlmIChcbiAgICAoc3RhdGUuc2VsZWN0YWJsZS5lbmFibGVkIHx8IHN0YXRlLmRyYWdnYWJsZS5lbmFibGVkIHx8IGZvcmNlKSAmJlxuICAgIChpc01vdmFibGUoc3RhdGUsIGtleSkgfHwgaXNQcmVtb3ZhYmxlKHN0YXRlLCBrZXkpKVxuICApIHtcbiAgICBzZXRTZWxlY3RlZChzdGF0ZSwga2V5KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0UGllY2UoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBwaWVjZTogc2cuUGllY2UsXG4gIHNwYXJlPzogYm9vbGVhbixcbiAgZm9yY2U/OiBib29sZWFuLFxuICBhcGk/OiBib29sZWFuLFxuKTogdm9pZCB7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLnBpZWNlU2VsZWN0LCBwaWVjZSk7XG5cbiAgaWYgKHN0YXRlLnNlbGVjdGFibGUuYWRkU3BhcmVzVG9IYW5kICYmIHN0YXRlLmRyb3BwYWJsZS5zcGFyZSAmJiBzdGF0ZS5zZWxlY3RlZFBpZWNlKSB7XG4gICAgYWRkVG9IYW5kKHN0YXRlLCB7IHJvbGU6IHN0YXRlLnNlbGVjdGVkUGllY2Uucm9sZSwgY29sb3I6IHBpZWNlLmNvbG9yIH0pO1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICB9IGVsc2UgaWYgKFxuICAgICFhcGkgJiZcbiAgICAhc3RhdGUuZHJhZ2dhYmxlLmVuYWJsZWQgJiZcbiAgICBzdGF0ZS5zZWxlY3RlZFBpZWNlICYmXG4gICAgc2FtZVBpZWNlKHN0YXRlLnNlbGVjdGVkUGllY2UsIHBpZWNlKVxuICApIHtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5waWVjZVVuc2VsZWN0LCBwaWVjZSk7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICB9IGVsc2UgaWYgKFxuICAgIChzdGF0ZS5zZWxlY3RhYmxlLmVuYWJsZWQgfHwgc3RhdGUuZHJhZ2dhYmxlLmVuYWJsZWQgfHwgZm9yY2UpICYmXG4gICAgKGlzRHJvcHBhYmxlKHN0YXRlLCBwaWVjZSwgISFzcGFyZSkgfHwgaXNQcmVkcm9wcGFibGUoc3RhdGUsIHBpZWNlKSlcbiAgKSB7XG4gICAgc2V0U2VsZWN0ZWRQaWVjZShzdGF0ZSwgcGllY2UpO1xuICAgIHN0YXRlLmRyb3BwYWJsZS5zcGFyZSA9ICEhc3BhcmU7XG4gIH0gZWxzZSB7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRTZWxlY3RlZChzdGF0ZTogSGVhZGxlc3NTdGF0ZSwga2V5OiBzZy5LZXkpOiB2b2lkIHtcbiAgdW5zZWxlY3Qoc3RhdGUpO1xuICBzdGF0ZS5zZWxlY3RlZCA9IGtleTtcbiAgc2V0UHJlRGVzdHMoc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0U2VsZWN0ZWRQaWVjZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlKTogdm9pZCB7XG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgc3RhdGUuc2VsZWN0ZWRQaWVjZSA9IHBpZWNlO1xuICBzZXRQcmVEZXN0cyhzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRQcmVEZXN0cyhzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICBzdGF0ZS5wcmVtb3ZhYmxlLmRlc3RzID0gc3RhdGUucHJlZHJvcHBhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuXG4gIGlmIChzdGF0ZS5zZWxlY3RlZCAmJiBpc1ByZW1vdmFibGUoc3RhdGUsIHN0YXRlLnNlbGVjdGVkKSAmJiBzdGF0ZS5wcmVtb3ZhYmxlLmdlbmVyYXRlKVxuICAgIHN0YXRlLnByZW1vdmFibGUuZGVzdHMgPSBzdGF0ZS5wcmVtb3ZhYmxlLmdlbmVyYXRlKHN0YXRlLnNlbGVjdGVkLCBzdGF0ZS5waWVjZXMpO1xuICBlbHNlIGlmIChcbiAgICBzdGF0ZS5zZWxlY3RlZFBpZWNlICYmXG4gICAgaXNQcmVkcm9wcGFibGUoc3RhdGUsIHN0YXRlLnNlbGVjdGVkUGllY2UpICYmXG4gICAgc3RhdGUucHJlZHJvcHBhYmxlLmdlbmVyYXRlXG4gIClcbiAgICBzdGF0ZS5wcmVkcm9wcGFibGUuZGVzdHMgPSBzdGF0ZS5wcmVkcm9wcGFibGUuZ2VuZXJhdGUoc3RhdGUuc2VsZWN0ZWRQaWVjZSwgc3RhdGUucGllY2VzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuc2VsZWN0KHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIHN0YXRlLnNlbGVjdGVkID1cbiAgICBzdGF0ZS5zZWxlY3RlZFBpZWNlID1cbiAgICBzdGF0ZS5wcmVtb3ZhYmxlLmRlc3RzID1cbiAgICBzdGF0ZS5wcmVkcm9wcGFibGUuZGVzdHMgPVxuICAgIHN0YXRlLnByb21vdGlvbi5jdXJyZW50ID1cbiAgICAgIHVuZGVmaW5lZDtcbiAgc3RhdGUuZHJvcHBhYmxlLnNwYXJlID0gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGlzTW92YWJsZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgb3JpZzogc2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzLmdldChvcmlnKTtcbiAgcmV0dXJuIChcbiAgICAhIXBpZWNlICYmXG4gICAgKHN0YXRlLmFjdGl2ZUNvbG9yID09PSAnYm90aCcgfHxcbiAgICAgIChzdGF0ZS5hY3RpdmVDb2xvciA9PT0gcGllY2UuY29sb3IgJiYgc3RhdGUudHVybkNvbG9yID09PSBwaWVjZS5jb2xvcikpXG4gICk7XG59XG5cbmZ1bmN0aW9uIGlzRHJvcHBhYmxlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIHNwYXJlOiBib29sZWFuKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgKHNwYXJlIHx8ICEhc3RhdGUuaGFuZHMuaGFuZE1hcC5nZXQocGllY2UuY29sb3IpPy5nZXQocGllY2Uucm9sZSkpICYmXG4gICAgKHN0YXRlLmFjdGl2ZUNvbG9yID09PSAnYm90aCcgfHxcbiAgICAgIChzdGF0ZS5hY3RpdmVDb2xvciA9PT0gcGllY2UuY29sb3IgJiYgc3RhdGUudHVybkNvbG9yID09PSBwaWVjZS5jb2xvcikpXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5Nb3ZlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIG9yaWcgIT09IGRlc3QgJiZcbiAgICBpc01vdmFibGUoc3RhdGUsIG9yaWcpICYmXG4gICAgKHN0YXRlLm1vdmFibGUuZnJlZSB8fCAhIXN0YXRlLm1vdmFibGUuZGVzdHM/LmdldChvcmlnKT8uaW5jbHVkZXMoZGVzdCkpXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5Ecm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGRlc3Q6IHNnLktleSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIGlzRHJvcHBhYmxlKHN0YXRlLCBwaWVjZSwgc3RhdGUuZHJvcHBhYmxlLnNwYXJlKSAmJlxuICAgIChzdGF0ZS5kcm9wcGFibGUuZnJlZSB8fFxuICAgICAgc3RhdGUuZHJvcHBhYmxlLnNwYXJlIHx8XG4gICAgICAhIXN0YXRlLmRyb3BwYWJsZS5kZXN0cz8uZ2V0KHBpZWNlTmFtZU9mKHBpZWNlKSk/LmluY2x1ZGVzKGRlc3QpKVxuICApO1xufVxuXG5mdW5jdGlvbiBjYW5Nb3ZlUHJvbW90ZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgb3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXMuZ2V0KG9yaWcpO1xuICByZXR1cm4gISFwaWVjZSAmJiBzdGF0ZS5wcm9tb3Rpb24ubW92ZVByb21vdGlvbkRpYWxvZyhvcmlnLCBkZXN0KTtcbn1cblxuZnVuY3Rpb24gY2FuRHJvcFByb21vdGUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgcmV0dXJuICFzdGF0ZS5kcm9wcGFibGUuc3BhcmUgJiYgc3RhdGUucHJvbW90aW9uLmRyb3BQcm9tb3Rpb25EaWFsb2cocGllY2UsIGtleSk7XG59XG5cbmZ1bmN0aW9uIGlzUHJlbW92YWJsZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgb3JpZzogc2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzLmdldChvcmlnKTtcbiAgcmV0dXJuIChcbiAgICAhIXBpZWNlICYmXG4gICAgc3RhdGUucHJlbW92YWJsZS5lbmFibGVkICYmXG4gICAgc3RhdGUuYWN0aXZlQ29sb3IgPT09IHBpZWNlLmNvbG9yICYmXG4gICAgc3RhdGUudHVybkNvbG9yICE9PSBwaWVjZS5jb2xvclxuICApO1xufVxuXG5mdW5jdGlvbiBpc1ByZWRyb3BwYWJsZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgISFzdGF0ZS5oYW5kcy5oYW5kTWFwLmdldChwaWVjZS5jb2xvcik/LmdldChwaWVjZS5yb2xlKSAmJlxuICAgIHN0YXRlLnByZWRyb3BwYWJsZS5lbmFibGVkICYmXG4gICAgc3RhdGUuYWN0aXZlQ29sb3IgPT09IHBpZWNlLmNvbG9yICYmXG4gICAgc3RhdGUudHVybkNvbG9yICE9PSBwaWVjZS5jb2xvclxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuUHJlbW92ZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgb3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBvcmlnICE9PSBkZXN0ICYmXG4gICAgaXNQcmVtb3ZhYmxlKHN0YXRlLCBvcmlnKSAmJlxuICAgICEhc3RhdGUucHJlbW92YWJsZS5nZW5lcmF0ZSAmJlxuICAgIHN0YXRlLnByZW1vdmFibGUuZ2VuZXJhdGUob3JpZywgc3RhdGUucGllY2VzKS5pbmNsdWRlcyhkZXN0KVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuUHJlZHJvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBkZXN0OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgY29uc3QgZGVzdFBpZWNlID0gc3RhdGUucGllY2VzLmdldChkZXN0KTtcbiAgcmV0dXJuIChcbiAgICBpc1ByZWRyb3BwYWJsZShzdGF0ZSwgcGllY2UpICYmXG4gICAgKCFkZXN0UGllY2UgfHwgZGVzdFBpZWNlLmNvbG9yICE9PSBzdGF0ZS5hY3RpdmVDb2xvcikgJiZcbiAgICAhIXN0YXRlLnByZWRyb3BwYWJsZS5nZW5lcmF0ZSAmJlxuICAgIHN0YXRlLnByZWRyb3BwYWJsZS5nZW5lcmF0ZShwaWVjZSwgc3RhdGUucGllY2VzKS5pbmNsdWRlcyhkZXN0KVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEcmFnZ2FibGUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIHN0YXRlLmRyYWdnYWJsZS5lbmFibGVkICYmXG4gICAgKHN0YXRlLmFjdGl2ZUNvbG9yID09PSAnYm90aCcgfHxcbiAgICAgIChzdGF0ZS5hY3RpdmVDb2xvciA9PT0gcGllY2UuY29sb3IgJiZcbiAgICAgICAgKHN0YXRlLnR1cm5Db2xvciA9PT0gcGllY2UuY29sb3IgfHwgc3RhdGUucHJlbW92YWJsZS5lbmFibGVkKSkpXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwbGF5UHJlbW92ZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IGJvb2xlYW4ge1xuICBjb25zdCBtb3ZlID0gc3RhdGUucHJlbW92YWJsZS5jdXJyZW50O1xuICBpZiAoIW1vdmUpIHJldHVybiBmYWxzZTtcbiAgY29uc3Qgb3JpZyA9IG1vdmUub3JpZyxcbiAgICBkZXN0ID0gbW92ZS5kZXN0LFxuICAgIHByb20gPSBtb3ZlLnByb207XG4gIGxldCBzdWNjZXNzID0gZmFsc2U7XG4gIGlmIChjYW5Nb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGJhc2VVc2VyTW92ZShzdGF0ZSwgb3JpZywgZGVzdCwgcHJvbSk7XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgY29uc3QgbWV0YWRhdGE6IHNnLk1vdmVNZXRhZGF0YSA9IHsgcHJlbWFkZTogdHJ1ZSB9O1xuICAgICAgaWYgKHJlc3VsdCAhPT0gdHJ1ZSkgbWV0YWRhdGEuY2FwdHVyZWQgPSByZXN1bHQ7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLm1vdmFibGUuZXZlbnRzLmFmdGVyLCBvcmlnLCBkZXN0LCBwcm9tLCBtZXRhZGF0YSk7XG4gICAgICBzdWNjZXNzID0gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgdW5zZXRQcmVtb3ZlKHN0YXRlKTtcbiAgcmV0dXJuIHN1Y2Nlc3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwbGF5UHJlZHJvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IGJvb2xlYW4ge1xuICBjb25zdCBkcm9wID0gc3RhdGUucHJlZHJvcHBhYmxlLmN1cnJlbnQ7XG4gIGlmICghZHJvcCkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBwaWVjZSA9IGRyb3AucGllY2UsXG4gICAga2V5ID0gZHJvcC5rZXksXG4gICAgcHJvbSA9IGRyb3AucHJvbTtcbiAgbGV0IHN1Y2Nlc3MgPSBmYWxzZTtcbiAgaWYgKGNhbkRyb3Aoc3RhdGUsIHBpZWNlLCBrZXkpKSB7XG4gICAgaWYgKGJhc2VVc2VyRHJvcChzdGF0ZSwgcGllY2UsIGtleSwgcHJvbSkpIHtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZHJvcHBhYmxlLmV2ZW50cy5hZnRlciwgcGllY2UsIGtleSwgcHJvbSwgeyBwcmVtYWRlOiB0cnVlIH0pO1xuICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgfVxuICB9XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIHJldHVybiBzdWNjZXNzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsTW92ZU9yRHJvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICB1bnNldFByZWRyb3Aoc3RhdGUpO1xuICB1bnNlbGVjdChzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWxQcm9tb3Rpb24oc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiB2b2lkIHtcbiAgaWYgKCFzdGF0ZS5wcm9tb3Rpb24uY3VycmVudCkgcmV0dXJuO1xuXG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgc3RhdGUucHJvbW90aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIHN0YXRlLmhvdmVyZWQgPSB1bmRlZmluZWQ7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJvbW90aW9uLmV2ZW50cy5jYW5jZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICBzdGF0ZS5hY3RpdmVDb2xvciA9XG4gICAgc3RhdGUubW92YWJsZS5kZXN0cyA9XG4gICAgc3RhdGUuZHJvcHBhYmxlLmRlc3RzID1cbiAgICBzdGF0ZS5kcmFnZ2FibGUuY3VycmVudCA9XG4gICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPVxuICAgIHN0YXRlLnByb21vdGlvbi5jdXJyZW50ID1cbiAgICBzdGF0ZS5ob3ZlcmVkID1cbiAgICAgIHVuZGVmaW5lZDtcbiAgY2FuY2VsTW92ZU9yRHJvcChzdGF0ZSk7XG59XG4iLCAiaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IGZpbGVzLCByYW5rcyB9IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IHBvczJrZXkgfSBmcm9tICcuL3V0aWwuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gaW5mZXJEaW1lbnNpb25zKGJvYXJkU2Zlbjogc2cuQm9hcmRTZmVuKTogc2cuRGltZW5zaW9ucyB7XG4gIGNvbnN0IHJhbmtzID0gYm9hcmRTZmVuLnNwbGl0KCcvJyksXG4gICAgZmlyc3RGaWxlID0gcmFua3NbMF0uc3BsaXQoJycpO1xuICBsZXQgZmlsZXNDbnQgPSAwLFxuICAgIGNudCA9IDA7XG4gIGZvciAoY29uc3QgYyBvZiBmaXJzdEZpbGUpIHtcbiAgICBjb25zdCBuYiA9IGMuY2hhckNvZGVBdCgwKTtcbiAgICBpZiAobmIgPCA1OCAmJiBuYiA+IDQ3KSBjbnQgPSBjbnQgKiAxMCArIG5iIC0gNDg7XG4gICAgZWxzZSBpZiAoYyAhPT0gJysnKSB7XG4gICAgICBmaWxlc0NudCArPSBjbnQgKyAxO1xuICAgICAgY250ID0gMDtcbiAgICB9XG4gIH1cbiAgZmlsZXNDbnQgKz0gY250O1xuICByZXR1cm4geyBmaWxlczogZmlsZXNDbnQsIHJhbmtzOiByYW5rcy5sZW5ndGggfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNmZW5Ub0JvYXJkKFxuICBzZmVuOiBzZy5Cb2FyZFNmZW4sXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGZyb21Gb3JzeXRoPzogKGZvcnN5dGg6IHN0cmluZykgPT4gc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZCxcbik6IHNnLlBpZWNlcyB7XG4gIGNvbnN0IHNmZW5QYXJzZXIgPSBmcm9tRm9yc3l0aCB8fCBzdGFuZGFyZEZyb21Gb3JzeXRoLFxuICAgIHBpZWNlczogc2cuUGllY2VzID0gbmV3IE1hcCgpO1xuICBsZXQgeCA9IGRpbXMuZmlsZXMgLSAxLFxuICAgIHkgPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHNmZW4ubGVuZ3RoOyBpKyspIHtcbiAgICBzd2l0Y2ggKHNmZW5baV0pIHtcbiAgICAgIGNhc2UgJyAnOlxuICAgICAgY2FzZSAnXyc6XG4gICAgICAgIHJldHVybiBwaWVjZXM7XG4gICAgICBjYXNlICcvJzpcbiAgICAgICAgKyt5O1xuICAgICAgICBpZiAoeSA+IGRpbXMucmFua3MgLSAxKSByZXR1cm4gcGllY2VzO1xuICAgICAgICB4ID0gZGltcy5maWxlcyAtIDE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDoge1xuICAgICAgICBjb25zdCBuYjEgPSBzZmVuW2ldLmNoYXJDb2RlQXQoMCksXG4gICAgICAgICAgbmIyID0gc2ZlbltpICsgMV0gJiYgc2ZlbltpICsgMV0uY2hhckNvZGVBdCgwKTtcbiAgICAgICAgaWYgKG5iMSA8IDU4ICYmIG5iMSA+IDQ3KSB7XG4gICAgICAgICAgaWYgKG5iMiAmJiBuYjIgPCA1OCAmJiBuYjIgPiA0Nykge1xuICAgICAgICAgICAgeCAtPSAobmIxIC0gNDgpICogMTAgKyAobmIyIC0gNDgpO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgIH0gZWxzZSB4IC09IG5iMSAtIDQ4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHJvbGVTdHIgPSBzZmVuW2ldID09PSAnKycgJiYgc2Zlbi5sZW5ndGggPiBpICsgMSA/ICcrJyArIHNmZW5bKytpXSA6IHNmZW5baV0sXG4gICAgICAgICAgICByb2xlID0gc2ZlblBhcnNlcihyb2xlU3RyKTtcbiAgICAgICAgICBpZiAoeCA+PSAwICYmIHJvbGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbG9yID0gcm9sZVN0ciA9PT0gcm9sZVN0ci50b0xvd2VyQ2FzZSgpID8gJ2dvdGUnIDogJ3NlbnRlJztcbiAgICAgICAgICAgIHBpZWNlcy5zZXQocG9zMmtleShbeCwgeV0pLCB7XG4gICAgICAgICAgICAgIHJvbGU6IHJvbGUsXG4gICAgICAgICAgICAgIGNvbG9yOiBjb2xvcixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICAtLXg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBpZWNlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJvYXJkVG9TZmVuKFxuICBwaWVjZXM6IHNnLlBpZWNlcyxcbiAgZGltczogc2cuRGltZW5zaW9ucyxcbiAgdG9Gb3JzeXRoPzogKHJvbGU6IHNnLlJvbGVTdHJpbmcpID0+IHN0cmluZyB8IHVuZGVmaW5lZCxcbik6IHNnLkJvYXJkU2ZlbiB7XG4gIGNvbnN0IHNmZW5SZW5kZXJlciA9IHRvRm9yc3l0aCB8fCBzdGFuZGFyZFRvRm9yc3l0aCxcbiAgICByZXZlcnNlZEZpbGVzID0gZmlsZXMuc2xpY2UoMCwgZGltcy5maWxlcykucmV2ZXJzZSgpO1xuICByZXR1cm4gcmFua3NcbiAgICAuc2xpY2UoMCwgZGltcy5yYW5rcylcbiAgICAubWFwKCh5KSA9PlxuICAgICAgcmV2ZXJzZWRGaWxlc1xuICAgICAgICAubWFwKCh4KSA9PiB7XG4gICAgICAgICAgY29uc3QgcGllY2UgPSBwaWVjZXMuZ2V0KCh4ICsgeSkgYXMgc2cuS2V5KSxcbiAgICAgICAgICAgIGZvcnN5dGggPSBwaWVjZSAmJiBzZmVuUmVuZGVyZXIocGllY2Uucm9sZSk7XG4gICAgICAgICAgaWYgKGZvcnN5dGgpIHtcbiAgICAgICAgICAgIHJldHVybiBwaWVjZS5jb2xvciA9PT0gJ3NlbnRlJyA/IGZvcnN5dGgudG9VcHBlckNhc2UoKSA6IGZvcnN5dGgudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICB9IGVsc2UgcmV0dXJuICcxJztcbiAgICAgICAgfSlcbiAgICAgICAgLmpvaW4oJycpLFxuICAgIClcbiAgICAuam9pbignLycpXG4gICAgLnJlcGxhY2UoLzF7Mix9L2csIChzKSA9PiBzLmxlbmd0aC50b1N0cmluZygpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNmZW5Ub0hhbmRzKFxuICBzZmVuOiBzZy5IYW5kc1NmZW4sXG4gIGZyb21Gb3JzeXRoPzogKGZvcnN5dGg6IHN0cmluZykgPT4gc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZCxcbik6IHNnLkhhbmRzIHtcbiAgY29uc3Qgc2ZlblBhcnNlciA9IGZyb21Gb3JzeXRoIHx8IHN0YW5kYXJkRnJvbUZvcnN5dGgsXG4gICAgc2VudGU6IHNnLkhhbmQgPSBuZXcgTWFwKCksXG4gICAgZ290ZTogc2cuSGFuZCA9IG5ldyBNYXAoKTtcblxuICBsZXQgdG1wTnVtID0gMCxcbiAgICBudW0gPSAxO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHNmZW4ubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBuYiA9IHNmZW5baV0uY2hhckNvZGVBdCgwKTtcbiAgICBpZiAobmIgPCA1OCAmJiBuYiA+IDQ3KSB7XG4gICAgICB0bXBOdW0gPSB0bXBOdW0gKiAxMCArIG5iIC0gNDg7XG4gICAgICBudW0gPSB0bXBOdW07XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHJvbGVTdHIgPSBzZmVuW2ldID09PSAnKycgJiYgc2Zlbi5sZW5ndGggPiBpICsgMSA/ICcrJyArIHNmZW5bKytpXSA6IHNmZW5baV0sXG4gICAgICAgIHJvbGUgPSBzZmVuUGFyc2VyKHJvbGVTdHIpO1xuICAgICAgaWYgKHJvbGUpIHtcbiAgICAgICAgY29uc3QgY29sb3IgPSByb2xlU3RyID09PSByb2xlU3RyLnRvTG93ZXJDYXNlKCkgPyAnZ290ZScgOiAnc2VudGUnO1xuICAgICAgICBpZiAoY29sb3IgPT09ICdzZW50ZScpIHNlbnRlLnNldChyb2xlLCAoc2VudGUuZ2V0KHJvbGUpIHx8IDApICsgbnVtKTtcbiAgICAgICAgZWxzZSBnb3RlLnNldChyb2xlLCAoZ290ZS5nZXQocm9sZSkgfHwgMCkgKyBudW0pO1xuICAgICAgfVxuICAgICAgdG1wTnVtID0gMDtcbiAgICAgIG51bSA9IDE7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBNYXAoW1xuICAgIFsnc2VudGUnLCBzZW50ZV0sXG4gICAgWydnb3RlJywgZ290ZV0sXG4gIF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFuZHNUb1NmZW4oXG4gIGhhbmRzOiBzZy5IYW5kcyxcbiAgcm9sZXM6IHNnLlJvbGVTdHJpbmdbXSxcbiAgdG9Gb3JzeXRoPzogKHJvbGU6IHNnLlJvbGVTdHJpbmcpID0+IHN0cmluZyB8IHVuZGVmaW5lZCxcbik6IHNnLkhhbmRzU2ZlbiB7XG4gIGNvbnN0IHNmZW5SZW5kZXJlciA9IHRvRm9yc3l0aCB8fCBzdGFuZGFyZFRvRm9yc3l0aDtcblxuICBsZXQgc2VudGVIYW5kU3RyID0gJycsXG4gICAgZ290ZUhhbmRTdHIgPSAnJztcbiAgZm9yIChjb25zdCByb2xlIG9mIHJvbGVzKSB7XG4gICAgY29uc3QgZm9yc3l0aCA9IHNmZW5SZW5kZXJlcihyb2xlKTtcbiAgICBpZiAoZm9yc3l0aCkge1xuICAgICAgY29uc3Qgc2VudGVDbnQgPSBoYW5kcy5nZXQoJ3NlbnRlJyk/LmdldChyb2xlKSxcbiAgICAgICAgZ290ZUNudCA9IGhhbmRzLmdldCgnZ290ZScpPy5nZXQocm9sZSk7XG4gICAgICBpZiAoc2VudGVDbnQpIHNlbnRlSGFuZFN0ciArPSBzZW50ZUNudCA+IDEgPyBzZW50ZUNudC50b1N0cmluZygpICsgZm9yc3l0aCA6IGZvcnN5dGg7XG4gICAgICBpZiAoZ290ZUNudCkgZ290ZUhhbmRTdHIgKz0gZ290ZUNudCA+IDEgPyBnb3RlQ250LnRvU3RyaW5nKCkgKyBmb3JzeXRoIDogZm9yc3l0aDtcbiAgICB9XG4gIH1cbiAgaWYgKHNlbnRlSGFuZFN0ciB8fCBnb3RlSGFuZFN0cikgcmV0dXJuIHNlbnRlSGFuZFN0ci50b1VwcGVyQ2FzZSgpICsgZ290ZUhhbmRTdHIudG9Mb3dlckNhc2UoKTtcbiAgZWxzZSByZXR1cm4gJy0nO1xufVxuXG5mdW5jdGlvbiBzdGFuZGFyZEZyb21Gb3JzeXRoKGZvcnN5dGg6IHN0cmluZyk6IHNnLlJvbGVTdHJpbmcgfCB1bmRlZmluZWQge1xuICBzd2l0Y2ggKGZvcnN5dGgudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ3AnOlxuICAgICAgcmV0dXJuICdwYXduJztcbiAgICBjYXNlICdsJzpcbiAgICAgIHJldHVybiAnbGFuY2UnO1xuICAgIGNhc2UgJ24nOlxuICAgICAgcmV0dXJuICdrbmlnaHQnO1xuICAgIGNhc2UgJ3MnOlxuICAgICAgcmV0dXJuICdzaWx2ZXInO1xuICAgIGNhc2UgJ2cnOlxuICAgICAgcmV0dXJuICdnb2xkJztcbiAgICBjYXNlICdiJzpcbiAgICAgIHJldHVybiAnYmlzaG9wJztcbiAgICBjYXNlICdyJzpcbiAgICAgIHJldHVybiAncm9vayc7XG4gICAgY2FzZSAnK3AnOlxuICAgICAgcmV0dXJuICd0b2tpbic7XG4gICAgY2FzZSAnK2wnOlxuICAgICAgcmV0dXJuICdwcm9tb3RlZGxhbmNlJztcbiAgICBjYXNlICcrbic6XG4gICAgICByZXR1cm4gJ3Byb21vdGVka25pZ2h0JztcbiAgICBjYXNlICcrcyc6XG4gICAgICByZXR1cm4gJ3Byb21vdGVkc2lsdmVyJztcbiAgICBjYXNlICcrYic6XG4gICAgICByZXR1cm4gJ2hvcnNlJztcbiAgICBjYXNlICcrcic6XG4gICAgICByZXR1cm4gJ2RyYWdvbic7XG4gICAgY2FzZSAnayc6XG4gICAgICByZXR1cm4gJ2tpbmcnO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm47XG4gIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBzdGFuZGFyZFRvRm9yc3l0aChyb2xlOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICBzd2l0Y2ggKHJvbGUpIHtcbiAgICBjYXNlICdwYXduJzpcbiAgICAgIHJldHVybiAncCc7XG4gICAgY2FzZSAnbGFuY2UnOlxuICAgICAgcmV0dXJuICdsJztcbiAgICBjYXNlICdrbmlnaHQnOlxuICAgICAgcmV0dXJuICduJztcbiAgICBjYXNlICdzaWx2ZXInOlxuICAgICAgcmV0dXJuICdzJztcbiAgICBjYXNlICdnb2xkJzpcbiAgICAgIHJldHVybiAnZyc7XG4gICAgY2FzZSAnYmlzaG9wJzpcbiAgICAgIHJldHVybiAnYic7XG4gICAgY2FzZSAncm9vayc6XG4gICAgICByZXR1cm4gJ3InO1xuICAgIGNhc2UgJ3Rva2luJzpcbiAgICAgIHJldHVybiAnK3AnO1xuICAgIGNhc2UgJ3Byb21vdGVkbGFuY2UnOlxuICAgICAgcmV0dXJuICcrbCc7XG4gICAgY2FzZSAncHJvbW90ZWRrbmlnaHQnOlxuICAgICAgcmV0dXJuICcrbic7XG4gICAgY2FzZSAncHJvbW90ZWRzaWx2ZXInOlxuICAgICAgcmV0dXJuICcrcyc7XG4gICAgY2FzZSAnaG9yc2UnOlxuICAgICAgcmV0dXJuICcrYic7XG4gICAgY2FzZSAnZHJhZ29uJzpcbiAgICAgIHJldHVybiAnK3InO1xuICAgIGNhc2UgJ2tpbmcnOlxuICAgICAgcmV0dXJuICdrJztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuO1xuICB9XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBIZWFkbGVzc1N0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSB7IERyYXdTaGFwZSwgU3F1YXJlSGlnaGxpZ2h0IH0gZnJvbSAnLi9kcmF3LmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyBzZXRDaGVja3MsIHNldFByZURlc3RzIH0gZnJvbSAnLi9ib2FyZC5qcyc7XG5pbXBvcnQgeyBpbmZlckRpbWVuc2lvbnMsIHNmZW5Ub0JvYXJkLCBzZmVuVG9IYW5kcyB9IGZyb20gJy4vc2Zlbi5qcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29uZmlnIHtcbiAgc2Zlbj86IHtcbiAgICBib2FyZD86IHNnLkJvYXJkU2ZlbjsgLy8gcGllY2VzIG9uIHRoZSBib2FyZCBpbiBGb3JzeXRoIG5vdGF0aW9uXG4gICAgaGFuZHM/OiBzZy5IYW5kc1NmZW47IC8vIHBpZWNlcyBpbiBoYW5kIGluIEZvcnN5dGggbm90YXRpb25cbiAgfTtcbiAgb3JpZW50YXRpb24/OiBzZy5Db2xvcjsgLy8gYm9hcmQgb3JpZW50YXRpb24uIHNlbnRlIHwgZ290ZVxuICB0dXJuQ29sb3I/OiBzZy5Db2xvcjsgLy8gdHVybiB0byBwbGF5LiBzZW50ZSB8IGdvdGVcbiAgYWN0aXZlQ29sb3I/OiBzZy5Db2xvciB8ICdib3RoJzsgLy8gY29sb3IgdGhhdCBjYW4gbW92ZSBvciBkcm9wLiBzZW50ZSB8IGdvdGUgfCBib3RoIHwgdW5kZWZpbmVkXG4gIGNoZWNrcz86IHNnLktleVtdIHwgc2cuQ29sb3IgfCBib29sZWFuOyAvLyBzcXVhcmVzIGN1cnJlbnRseSBpbiBjaGVjayBbXCI1YVwiXSwgY29sb3IgaW4gY2hlY2sgKHNlZSBoaWdobGlnaHQuY2hlY2tSb2xlcykgb3IgYm9vbGVhbiBmb3IgY3VycmVudCB0dXJuIGNvbG9yXG4gIGxhc3REZXN0cz86IHNnLktleVtdOyAvLyBzcXVhcmVzIHBhcnQgb2YgdGhlIGxhc3QgbW92ZSBvciBkcm9wIFtcIjNjXCIsIFwiNGNcIl1cbiAgbGFzdFBpZWNlPzogc2cuUGllY2U7IC8vIHBpZWNlIHBhcnQgb2YgdGhlIGxhc3QgZHJvcFxuICBzZWxlY3RlZD86IHNnLktleTsgLy8gc3F1YXJlIGN1cnJlbnRseSBzZWxlY3RlZCBcIjFhXCJcbiAgc2VsZWN0ZWRQaWVjZT86IHNnLlBpZWNlOyAvLyBwaWVjZSBpbiBoYW5kIGN1cnJlbnRseSBzZWxlY3RlZFxuICBob3ZlcmVkPzogc2cuS2V5OyAvLyBzcXVhcmUgY3VycmVudGx5IGJlaW5nIGhvdmVyZWRcbiAgdmlld09ubHk/OiBib29sZWFuOyAvLyBkb24ndCBiaW5kIGV2ZW50czogdGhlIHVzZXIgd2lsbCBuZXZlciBiZSBhYmxlIHRvIG1vdmUgcGllY2VzIGFyb3VuZFxuICBzcXVhcmVSYXRpbz86IHNnLk51bWJlclBhaXI7IC8vIHJhdGlvIG9mIGEgc2luZ2xlIHNxdWFyZSBbd2lkdGgsIGhlaWdodF1cbiAgZGlzYWJsZUNvbnRleHRNZW51PzogYm9vbGVhbjsgLy8gYmVjYXVzZSB3aG8gbmVlZHMgYSBjb250ZXh0IG1lbnUgb24gYSBib2FyZCwgb25seSB3aXRob3V0IHZpZXdPbmx5XG4gIGJsb2NrVG91Y2hTY3JvbGw/OiBib29sZWFuOyAvLyBibG9jayBzY3JvbGxpbmcgdmlhIHRvdWNoIGRyYWdnaW5nIG9uIHRoZSBib2FyZCwgZS5nLiBmb3IgY29vcmRpbmF0ZSB0cmFpbmluZ1xuICBzY2FsZURvd25QaWVjZXM/OiBib29sZWFuOyAvLyBoZWxwZnVsIGZvciBwbmdzIC0gaHR0cHM6Ly9jdGlkZC5jb20vMjAxNS9zdmctYmFja2dyb3VuZC1zY2FsaW5nXG4gIGNvb3JkaW5hdGVzPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuOyAvLyBpbmNsdWRlIGNvb3JkcyBhdHRyaWJ1dGVzXG4gICAgZmlsZXM/OiBzZy5Ob3RhdGlvbjtcbiAgICByYW5rcz86IHNnLk5vdGF0aW9uO1xuICB9O1xuICBoaWdobGlnaHQ/OiB7XG4gICAgbGFzdERlc3RzPzogYm9vbGVhbjsgLy8gYWRkIGxhc3QtZGVzdCBjbGFzcyB0byBzcXVhcmVzIGFuZCBwaWVjZXNcbiAgICBjaGVjaz86IGJvb2xlYW47IC8vIGFkZCBjaGVjayBjbGFzcyB0byBzcXVhcmVzXG4gICAgY2hlY2tSb2xlcz86IHNnLlJvbGVTdHJpbmdbXTsgLy8gcm9sZXMgdG8gYmUgaGlnaGxpZ2h0ZWQgd2hlbiBjaGVjayBpcyBib29sZWFuIGlzIHBhc3NlZCBmcm9tIGNvbmZpZ1xuICAgIGhvdmVyZWQ/OiBib29sZWFuOyAvLyBhZGQgaG92ZXIgY2xhc3MgdG8gaG92ZXJlZCBzcXVhcmVzXG4gIH07XG4gIGFuaW1hdGlvbj86IHsgZW5hYmxlZD86IGJvb2xlYW47IGhhbmRzPzogYm9vbGVhbjsgZHVyYXRpb24/OiBudW1iZXIgfTtcbiAgaGFuZHM/OiB7XG4gICAgaW5saW5lZD86IGJvb2xlYW47IC8vIGF0dGFjaGVzIHNnLWhhbmRzIGRpcmVjdGx5IHRvIHNnLXdyYXAsIGlnbm9yZXMgSFRNTEVsZW1lbnRzIHBhc3NlZCB0byBTaG9naWdyb3VuZFxuICAgIHJvbGVzPzogc2cuUm9sZVN0cmluZ1tdOyAvLyByb2xlcyB0byByZW5kZXIgaW4gc2ctaGFuZFxuICB9O1xuICBtb3ZhYmxlPzoge1xuICAgIGZyZWU/OiBib29sZWFuOyAvLyBhbGwgbW92ZXMgYXJlIHZhbGlkIC0gYm9hcmQgZWRpdG9yXG4gICAgZGVzdHM/OiBzZy5Nb3ZlRGVzdHM7IC8vIHZhbGlkIG1vdmVzLiB7XCIyYVwiIFtcIjNhXCIgXCI0YVwiXSBcIjFiXCIgW1wiM2FcIiBcIjNjXCJdfVxuICAgIHNob3dEZXN0cz86IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBkZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBldmVudHM/OiB7XG4gICAgICBhZnRlcj86IChvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSwgcHJvbTogYm9vbGVhbiwgbWV0YWRhdGE6IHNnLk1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBtb3ZlIGhhcyBiZWVuIHBsYXllZFxuICAgIH07XG4gIH07XG4gIGRyb3BwYWJsZT86IHtcbiAgICBmcmVlPzogYm9vbGVhbjsgLy8gYWxsIGRyb3BzIGFyZSB2YWxpZCAtIGJvYXJkIGVkaXRvclxuICAgIGRlc3RzPzogc2cuRHJvcERlc3RzOyAvLyB2YWxpZCBkcm9wcy4ge1wic2VudGUgcGF3blwiIFtcIjNhXCIgXCI0YVwiXSBcInNlbnRlIGxhbmNlXCIgW1wiM2FcIiBcIjNjXCJdfVxuICAgIHNob3dEZXN0cz86IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBkZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBzcGFyZT86IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gcmVtb3ZlIGRyb3BwZWQgcGllY2UgZnJvbSBoYW5kIGFmdGVyIGRyb3AgLSBib2FyZCBlZGl0b3JcbiAgICBldmVudHM/OiB7XG4gICAgICBhZnRlcj86IChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tOiBib29sZWFuLCBtZXRhZGF0YTogc2cuTW92ZU1ldGFkYXRhKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIGRyb3AgaGFzIGJlZW4gcGxheWVkXG4gICAgfTtcbiAgfTtcbiAgcHJlbW92YWJsZT86IHtcbiAgICBlbmFibGVkPzogYm9vbGVhbjsgLy8gYWxsb3cgcHJlbW92ZXMgZm9yIGNvbG9yIHRoYXQgY2FuIG5vdCBtb3ZlXG4gICAgc2hvd0Rlc3RzPzogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIHByZS1kZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBkZXN0cz86IHNnLktleVtdOyAvLyBwcmVtb3ZlIGRlc3RpbmF0aW9ucyBmb3IgdGhlIGN1cnJlbnQgc2VsZWN0aW9uXG4gICAgZ2VuZXJhdGU/OiAoa2V5OiBzZy5LZXksIHBpZWNlczogc2cuUGllY2VzKSA9PiBzZy5LZXlbXTsgLy8gZnVuY3Rpb24gdG8gZ2VuZXJhdGUgZGVzdGluYXRpb25zIHRoYXQgdXNlciBjYW4gcHJlbW92ZSB0b1xuICAgIGV2ZW50cz86IHtcbiAgICAgIHNldD86IChvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSwgcHJvbTogYm9vbGVhbikgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVtb3ZlIGhhcyBiZWVuIHNldFxuICAgICAgdW5zZXQ/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZW1vdmUgaGFzIGJlZW4gdW5zZXRcbiAgICB9O1xuICB9O1xuICBwcmVkcm9wcGFibGU/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGFsbG93IHByZWRyb3BzIGZvciBjb2xvciB0aGF0IGNhbiBub3QgbW92ZVxuICAgIHNob3dEZXN0cz86IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBwcmUtZGVzdCBjbGFzcyBvbiBzcXVhcmVzIGZvciBkcm9wc1xuICAgIGRlc3RzPzogc2cuS2V5W107IC8vIHByZW1vdmUgZGVzdGluYXRpb25zIGZvciB0aGUgZHJvcCBzZWxlY3Rpb25cbiAgICBnZW5lcmF0ZT86IChwaWVjZTogc2cuUGllY2UsIHBpZWNlczogc2cuUGllY2VzKSA9PiBzZy5LZXlbXTsgLy8gZnVuY3Rpb24gdG8gZ2VuZXJhdGUgZGVzdGluYXRpb25zIHRoYXQgdXNlciBjYW4gcHJlZHJvcCBvblxuICAgIGV2ZW50cz86IHtcbiAgICAgIHNldD86IChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tOiBib29sZWFuKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZWRyb3AgaGFzIGJlZW4gc2V0XG4gICAgICB1bnNldD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlZHJvcCBoYXMgYmVlbiB1bnNldFxuICAgIH07XG4gIH07XG4gIGRyYWdnYWJsZT86IHtcbiAgICBlbmFibGVkPzogYm9vbGVhbjsgLy8gYWxsb3cgbW92ZXMgJiBwcmVtb3ZlcyB0byB1c2UgZHJhZyduIGRyb3BcbiAgICBkaXN0YW5jZT86IG51bWJlcjsgLy8gbWluaW11bSBkaXN0YW5jZSB0byBpbml0aWF0ZSBhIGRyYWc7IGluIHBpeGVsc1xuICAgIGF1dG9EaXN0YW5jZT86IGJvb2xlYW47IC8vIGxldHMgc2hvZ2lncm91bmQgc2V0IGRpc3RhbmNlIHRvIHplcm8gd2hlbiB1c2VyIGRyYWdzIHBpZWNlc1xuICAgIHNob3dHaG9zdD86IGJvb2xlYW47IC8vIHNob3cgZ2hvc3Qgb2YgcGllY2UgYmVpbmcgZHJhZ2dlZFxuICAgIHNob3dUb3VjaFNxdWFyZU92ZXJsYXk/OiBib29sZWFuOyAvLyBzaG93IHNxdWFyZSBvdmVybGF5IG9uIHRoZSBzcXVhcmUgdGhhdCBpcyBjdXJyZW50bHkgYmVpbmcgaG92ZXJlZCwgdG91Y2ggb25seVxuICAgIGRlbGV0ZU9uRHJvcE9mZj86IGJvb2xlYW47IC8vIGRlbGV0ZSBhIHBpZWNlIHdoZW4gaXQgaXMgZHJvcHBlZCBvZmYgdGhlIGJvYXJkXG4gICAgYWRkVG9IYW5kT25Ecm9wT2ZmPzogYm9vbGVhbjsgLy8gYWRkIGEgcGllY2UgdG8gaGFuZCB3aGVuIGl0IGlzIGRyb3BwZWQgb24gaXQsIHJlcXVpcmVzIGRlbGV0ZU9uRHJvcE9mZlxuICB9O1xuICBzZWxlY3RhYmxlPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuOyAvLyBkaXNhYmxlIHRvIGVuZm9yY2UgZHJhZ2dpbmcgb3ZlciBjbGljay1jbGljayBtb3ZlXG4gICAgZm9yY2VTcGFyZXM/OiBib29sZWFuOyAvLyBhbGxvdyBkcm9wcGluZyBzcGFyZSBwaWVjZXMgZXZlbiB3aXRoIHNlbGVjdGFibGUgZGlzYWJsZWRcbiAgICBkZWxldGVPblRvdWNoPzogYm9vbGVhbjsgLy8gc2VsZWN0aW5nIGEgcGllY2Ugb24gdGhlIGJvYXJkIG9yIGluIGhhbmQgd2lsbCByZW1vdmUgaXQgLSBib2FyZCBlZGl0b3JcbiAgICBhZGRTcGFyZXNUb0hhbmQ/OiBib29sZWFuOyAvLyBhZGQgc2VsZWN0ZWQgc3BhcmUgcGllY2UgdG8gaGFuZCAtIGJvYXJkIGVkaXRvclxuICB9O1xuICBldmVudHM/OiB7XG4gICAgY2hhbmdlPzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBzaXR1YXRpb24gY2hhbmdlcyBvbiB0aGUgYm9hcmRcbiAgICBtb3ZlPzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tOiBib29sZWFuLCBjYXB0dXJlZFBpZWNlPzogc2cuUGllY2UpID0+IHZvaWQ7XG4gICAgZHJvcD86IChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tOiBib29sZWFuKSA9PiB2b2lkO1xuICAgIHNlbGVjdD86IChrZXk6IHNnLktleSkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gYSBzcXVhcmUgaXMgc2VsZWN0ZWRcbiAgICB1bnNlbGVjdD86IChrZXk6IHNnLktleSkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gYSBzZWxlY3RlZCBzcXVhcmUgaXMgZGlyZWN0bHkgdW5zZWxlY3RlZCAtIGRyb3BwZWQgYmFjayBvciBjbGlja2VkIG9uIHRoZSBvcmlnaW5hbCBzcXVhcmVcbiAgICBwaWVjZVNlbGVjdD86IChwaWVjZTogc2cuUGllY2UpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIGEgcGllY2UgaW4gaGFuZCBpcyBzZWxlY3RlZFxuICAgIHBpZWNlVW5zZWxlY3Q/OiAocGllY2U6IHNnLlBpZWNlKSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBhIHNlbGVjdGVkIHBpZWNlIGlzIGRpcmVjdGx5IHVuc2VsZWN0ZWQgLSBkcm9wcGVkIGJhY2sgb3IgY2xpY2tlZCBvbiB0aGUgc2FtZSBwaWVjZVxuICAgIGluc2VydD86IChib2FyZEVsZW1lbnRzPzogc2cuQm9hcmRFbGVtZW50cywgaGFuZEVsZW1lbnRzPzogc2cuSGFuZEVsZW1lbnRzKSA9PiB2b2lkOyAvLyB3aGVuIHRoZSBib2FyZC9oYW5kcyBET00gaGFzIGJlZW4gKHJlKWluc2VydGVkXG4gIH07XG4gIGRyYXdhYmxlPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuOyAvLyBjYW4gZHJhd1xuICAgIHZpc2libGU/OiBib29sZWFuOyAvLyBjYW4gdmlld1xuICAgIGZvcmNlZD86IGJvb2xlYW47IC8vIGNhbiBvbmx5IGRyYXdcbiAgICBlcmFzZU9uQ2xpY2s/OiBib29sZWFuO1xuICAgIHNoYXBlcz86IERyYXdTaGFwZVtdO1xuICAgIGF1dG9TaGFwZXM/OiBEcmF3U2hhcGVbXTtcbiAgICBzcXVhcmVzPzogU3F1YXJlSGlnaGxpZ2h0W107XG4gICAgb25DaGFuZ2U/OiAoc2hhcGVzOiBEcmF3U2hhcGVbXSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIGRyYXdhYmxlIHNoYXBlcyBjaGFuZ2VcbiAgfTtcbiAgZm9yc3l0aD86IHtcbiAgICB0b0ZvcnN5dGg/OiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIGZyb21Gb3JzeXRoPzogKHN0cjogc3RyaW5nKSA9PiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkO1xuICB9O1xuICBwcm9tb3Rpb24/OiB7XG4gICAgcHJvbW90ZXNUbz86IChyb2xlOiBzZy5Sb2xlU3RyaW5nKSA9PiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIHVucHJvbW90ZXNUbz86IChyb2xlOiBzZy5Sb2xlU3RyaW5nKSA9PiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIG1vdmVQcm9tb3Rpb25EaWFsb2c/OiAob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXkpID0+IGJvb2xlYW47IC8vIGFjdGl2YXRlIHByb21vdGlvbiBkaWFsb2dcbiAgICBmb3JjZU1vdmVQcm9tb3Rpb24/OiAob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXkpID0+IGJvb2xlYW47IC8vIGF1dG8gcHJvbW90ZSBhZnRlciBtb3ZlXG4gICAgZHJvcFByb21vdGlvbkRpYWxvZz86IChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5KSA9PiBib29sZWFuOyAvLyBhY3RpdmF0ZSBwcm9tb3Rpb24gZGlhbG9nXG4gICAgZm9yY2VEcm9wUHJvbW90aW9uPzogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXkpID0+IGJvb2xlYW47IC8vIGF1dG8gcHJvbW90ZSBhZnRlciBkcm9wXG4gICAgZXZlbnRzPzoge1xuICAgICAgaW5pdGlhdGVkPzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gcHJvbW90aW9uIGRpYWxvZyBpcyBzdGFydGVkXG4gICAgICBhZnRlcj86IChwaWVjZTogc2cuUGllY2UpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB1c2VyIHNlbGVjdHMgYSBwaWVjZVxuICAgICAgY2FuY2VsPzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHVzZXIgY2FuY2VscyB0aGUgc2VsZWN0aW9uXG4gICAgfTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5QW5pbWF0aW9uKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBjb25maWc6IENvbmZpZyk6IHZvaWQge1xuICBpZiAoY29uZmlnLmFuaW1hdGlvbikge1xuICAgIGRlZXBNZXJnZShzdGF0ZS5hbmltYXRpb24sIGNvbmZpZy5hbmltYXRpb24pO1xuICAgIC8vIG5vIG5lZWQgZm9yIHN1Y2ggc2hvcnQgYW5pbWF0aW9uc1xuICAgIGlmICgoc3RhdGUuYW5pbWF0aW9uLmR1cmF0aW9uIHx8IDApIDwgNzApIHN0YXRlLmFuaW1hdGlvbi5lbmFibGVkID0gZmFsc2U7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmZpZ3VyZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgY29uZmlnOiBDb25maWcpOiB2b2lkIHtcbiAgLy8gZG9uJ3QgbWVyZ2UsIGp1c3Qgb3ZlcnJpZGUuXG4gIGlmIChjb25maWcubW92YWJsZT8uZGVzdHMpIHN0YXRlLm1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gIGlmIChjb25maWcuZHJvcHBhYmxlPy5kZXN0cykgc3RhdGUuZHJvcHBhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICBpZiAoY29uZmlnLmRyYXdhYmxlPy5zaGFwZXMpIHN0YXRlLmRyYXdhYmxlLnNoYXBlcyA9IFtdO1xuICBpZiAoY29uZmlnLmRyYXdhYmxlPy5hdXRvU2hhcGVzKSBzdGF0ZS5kcmF3YWJsZS5hdXRvU2hhcGVzID0gW107XG4gIGlmIChjb25maWcuZHJhd2FibGU/LnNxdWFyZXMpIHN0YXRlLmRyYXdhYmxlLnNxdWFyZXMgPSBbXTtcbiAgaWYgKGNvbmZpZy5oYW5kcz8ucm9sZXMpIHN0YXRlLmhhbmRzLnJvbGVzID0gW107XG5cbiAgZGVlcE1lcmdlKHN0YXRlLCBjb25maWcpO1xuXG4gIC8vIGlmIGEgc2ZlbiB3YXMgcHJvdmlkZWQsIHJlcGxhY2UgdGhlIHBpZWNlcywgZXhjZXB0IHRoZSBjdXJyZW50bHkgZHJhZ2dlZCBvbmVcbiAgaWYgKGNvbmZpZy5zZmVuPy5ib2FyZCkge1xuICAgIHN0YXRlLmRpbWVuc2lvbnMgPSBpbmZlckRpbWVuc2lvbnMoY29uZmlnLnNmZW4uYm9hcmQpO1xuICAgIHN0YXRlLnBpZWNlcyA9IHNmZW5Ub0JvYXJkKGNvbmZpZy5zZmVuLmJvYXJkLCBzdGF0ZS5kaW1lbnNpb25zLCBzdGF0ZS5mb3JzeXRoLmZyb21Gb3JzeXRoKTtcbiAgICBzdGF0ZS5kcmF3YWJsZS5zaGFwZXMgPSBjb25maWcuZHJhd2FibGU/LnNoYXBlcyB8fCBbXTtcbiAgfVxuXG4gIGlmIChjb25maWcuc2Zlbj8uaGFuZHMpIHtcbiAgICBzdGF0ZS5oYW5kcy5oYW5kTWFwID0gc2ZlblRvSGFuZHMoY29uZmlnLnNmZW4uaGFuZHMsIHN0YXRlLmZvcnN5dGguZnJvbUZvcnN5dGgpO1xuICB9XG5cbiAgLy8gYXBwbHkgY29uZmlnIHZhbHVlcyB0aGF0IGNvdWxkIGJlIHVuZGVmaW5lZCB5ZXQgbWVhbmluZ2Z1bFxuICBpZiAoJ2NoZWNrcycgaW4gY29uZmlnKSBzZXRDaGVja3Moc3RhdGUsIGNvbmZpZy5jaGVja3MgfHwgZmFsc2UpO1xuICBpZiAoJ2xhc3RQaWVjZScgaW4gY29uZmlnICYmICFjb25maWcubGFzdFBpZWNlKSBzdGF0ZS5sYXN0UGllY2UgPSB1bmRlZmluZWQ7XG5cbiAgLy8gaW4gY2FzZSBvZiBkcm9wIGxhc3QgbW92ZSwgdGhlcmUncyBhIHNpbmdsZSBzcXVhcmUuXG4gIC8vIGlmIHRoZSBwcmV2aW91cyBsYXN0IG1vdmUgaGFkIHR3byBzcXVhcmVzLFxuICAvLyB0aGUgbWVyZ2UgYWxnb3JpdGhtIHdpbGwgaW5jb3JyZWN0bHkga2VlcCB0aGUgc2Vjb25kIHNxdWFyZS5cbiAgaWYgKCdsYXN0RGVzdHMnIGluIGNvbmZpZyAmJiAhY29uZmlnLmxhc3REZXN0cykgc3RhdGUubGFzdERlc3RzID0gdW5kZWZpbmVkO1xuICBlbHNlIGlmIChjb25maWcubGFzdERlc3RzKSBzdGF0ZS5sYXN0RGVzdHMgPSBjb25maWcubGFzdERlc3RzO1xuXG4gIC8vIGZpeCBtb3ZlL3ByZW1vdmUgZGVzdHNcbiAgc2V0UHJlRGVzdHMoc3RhdGUpO1xuXG4gIGFwcGx5QW5pbWF0aW9uKHN0YXRlLCBjb25maWcpO1xufVxuXG5mdW5jdGlvbiBkZWVwTWVyZ2UoYmFzZTogYW55LCBleHRlbmQ6IGFueSk6IHZvaWQge1xuICBmb3IgKGNvbnN0IGtleSBpbiBleHRlbmQpIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGV4dGVuZCwga2V5KSkge1xuICAgICAgaWYgKFxuICAgICAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYmFzZSwga2V5KSAmJlxuICAgICAgICBpc1BsYWluT2JqZWN0KGJhc2Vba2V5XSkgJiZcbiAgICAgICAgaXNQbGFpbk9iamVjdChleHRlbmRba2V5XSlcbiAgICAgIClcbiAgICAgICAgZGVlcE1lcmdlKGJhc2Vba2V5XSwgZXh0ZW5kW2tleV0pO1xuICAgICAgZWxzZSBiYXNlW2tleV0gPSBleHRlbmRba2V5XTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNQbGFpbk9iamVjdChvOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIGlmICh0eXBlb2YgbyAhPT0gJ29iamVjdCcgfHwgbyA9PT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvKTtcbiAgcmV0dXJuIHByb3RvID09PSBPYmplY3QucHJvdG90eXBlIHx8IHByb3RvID09PSBudWxsO1xufVxuIiwgImltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyBhbGxLZXlzLCBjb2xvcnMgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbC5qcyc7XG5cbmV4cG9ydCB0eXBlIE11dGF0aW9uPEE+ID0gKHN0YXRlOiBTdGF0ZSkgPT4gQTtcblxuLy8gMCwxIGFuaW1hdGlvbiBnb2FsXG4vLyAyLDMgYW5pbWF0aW9uIGN1cnJlbnQgc3RhdHVzXG5leHBvcnQgdHlwZSBBbmltVmVjdG9yID0gc2cuTnVtYmVyUXVhZDtcblxuZXhwb3J0IHR5cGUgQW5pbVZlY3RvcnMgPSBNYXA8c2cuS2V5LCBBbmltVmVjdG9yPjtcblxuZXhwb3J0IHR5cGUgQW5pbUZhZGluZ3MgPSBNYXA8c2cuS2V5LCBzZy5QaWVjZT47XG5cbmV4cG9ydCB0eXBlIEFuaW1Qcm9tb3Rpb25zID0gTWFwPHNnLktleSwgc2cuUGllY2U+O1xuXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1QbGFuIHtcbiAgYW5pbXM6IEFuaW1WZWN0b3JzO1xuICBmYWRpbmdzOiBBbmltRmFkaW5ncztcbiAgcHJvbW90aW9uczogQW5pbVByb21vdGlvbnM7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbUN1cnJlbnQge1xuICBzdGFydDogRE9NSGlnaFJlc1RpbWVTdGFtcDtcbiAgZnJlcXVlbmN5OiBzZy5LSHo7XG4gIHBsYW46IEFuaW1QbGFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW5pbTxBPihtdXRhdGlvbjogTXV0YXRpb248QT4sIHN0YXRlOiBTdGF0ZSk6IEEge1xuICByZXR1cm4gc3RhdGUuYW5pbWF0aW9uLmVuYWJsZWQgPyBhbmltYXRlKG11dGF0aW9uLCBzdGF0ZSkgOiByZW5kZXIobXV0YXRpb24sIHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlcjxBPihtdXRhdGlvbjogTXV0YXRpb248QT4sIHN0YXRlOiBTdGF0ZSk6IEEge1xuICBjb25zdCByZXN1bHQgPSBtdXRhdGlvbihzdGF0ZSk7XG4gIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuaW50ZXJmYWNlIEFuaW1QaWVjZSB7XG4gIGtleT86IHNnLktleTtcbiAgcG9zOiBzZy5Qb3M7XG4gIHBpZWNlOiBzZy5QaWVjZTtcbn1cblxuZnVuY3Rpb24gbWFrZVBpZWNlKGtleTogc2cuS2V5LCBwaWVjZTogc2cuUGllY2UpOiBBbmltUGllY2Uge1xuICByZXR1cm4ge1xuICAgIGtleToga2V5LFxuICAgIHBvczogdXRpbC5rZXkycG9zKGtleSksXG4gICAgcGllY2U6IHBpZWNlLFxuICB9O1xufVxuXG5mdW5jdGlvbiBjbG9zZXIocGllY2U6IEFuaW1QaWVjZSwgcGllY2VzOiBBbmltUGllY2VbXSk6IEFuaW1QaWVjZSB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBwaWVjZXMuc29ydCgocDEsIHAyKSA9PiB7XG4gICAgcmV0dXJuIHV0aWwuZGlzdGFuY2VTcShwaWVjZS5wb3MsIHAxLnBvcykgLSB1dGlsLmRpc3RhbmNlU3EocGllY2UucG9zLCBwMi5wb3MpO1xuICB9KVswXTtcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVBsYW4ocHJldlBpZWNlczogc2cuUGllY2VzLCBwcmV2SGFuZHM6IHNnLkhhbmRzLCBjdXJyZW50OiBTdGF0ZSk6IEFuaW1QbGFuIHtcbiAgY29uc3QgYW5pbXM6IEFuaW1WZWN0b3JzID0gbmV3IE1hcCgpLFxuICAgIGFuaW1lZE9yaWdzOiBzZy5LZXlbXSA9IFtdLFxuICAgIGZhZGluZ3M6IEFuaW1GYWRpbmdzID0gbmV3IE1hcCgpLFxuICAgIHByb21vdGlvbnM6IEFuaW1Qcm9tb3Rpb25zID0gbmV3IE1hcCgpLFxuICAgIG1pc3NpbmdzOiBBbmltUGllY2VbXSA9IFtdLFxuICAgIG5ld3M6IEFuaW1QaWVjZVtdID0gW10sXG4gICAgcHJlUGllY2VzID0gbmV3IE1hcDxzZy5LZXksIEFuaW1QaWVjZT4oKTtcblxuICBmb3IgKGNvbnN0IFtrLCBwXSBvZiBwcmV2UGllY2VzKSB7XG4gICAgcHJlUGllY2VzLnNldChrLCBtYWtlUGllY2UoaywgcCkpO1xuICB9XG4gIGZvciAoY29uc3Qga2V5IG9mIGFsbEtleXMpIHtcbiAgICBjb25zdCBjdXJQID0gY3VycmVudC5waWVjZXMuZ2V0KGtleSksXG4gICAgICBwcmVQID0gcHJlUGllY2VzLmdldChrZXkpO1xuICAgIGlmIChjdXJQKSB7XG4gICAgICBpZiAocHJlUCkge1xuICAgICAgICBpZiAoIXV0aWwuc2FtZVBpZWNlKGN1clAsIHByZVAucGllY2UpKSB7XG4gICAgICAgICAgbWlzc2luZ3MucHVzaChwcmVQKTtcbiAgICAgICAgICBuZXdzLnB1c2gobWFrZVBpZWNlKGtleSwgY3VyUCkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgbmV3cy5wdXNoKG1ha2VQaWVjZShrZXksIGN1clApKTtcbiAgICB9IGVsc2UgaWYgKHByZVApIG1pc3NpbmdzLnB1c2gocHJlUCk7XG4gIH1cbiAgaWYgKGN1cnJlbnQuYW5pbWF0aW9uLmhhbmRzKSB7XG4gICAgZm9yIChjb25zdCBjb2xvciBvZiBjb2xvcnMpIHtcbiAgICAgIGNvbnN0IGN1ckggPSBjdXJyZW50LmhhbmRzLmhhbmRNYXAuZ2V0KGNvbG9yKSxcbiAgICAgICAgcHJlSCA9IHByZXZIYW5kcy5nZXQoY29sb3IpO1xuICAgICAgaWYgKHByZUggJiYgY3VySCkge1xuICAgICAgICBmb3IgKGNvbnN0IFtyb2xlLCBuXSBvZiBwcmVIKSB7XG4gICAgICAgICAgY29uc3QgcGllY2U6IHNnLlBpZWNlID0geyByb2xlLCBjb2xvciB9LFxuICAgICAgICAgICAgY3VyTiA9IGN1ckguZ2V0KHJvbGUpIHx8IDA7XG4gICAgICAgICAgaWYgKGN1ck4gPCBuKSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kUGllY2VPZmZzZXQgPSBjdXJyZW50LmRvbS5ib3VuZHMuaGFuZHNcbiAgICAgICAgICAgICAgICAucGllY2VCb3VuZHMoKVxuICAgICAgICAgICAgICAgIC5nZXQodXRpbC5waWVjZU5hbWVPZihwaWVjZSkpLFxuICAgICAgICAgICAgICBib3VuZHMgPSBjdXJyZW50LmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCksXG4gICAgICAgICAgICAgIG91dFBvcyA9XG4gICAgICAgICAgICAgICAgaGFuZFBpZWNlT2Zmc2V0ICYmIGJvdW5kc1xuICAgICAgICAgICAgICAgICAgPyB1dGlsLnBvc09mT3V0c2lkZUVsKFxuICAgICAgICAgICAgICAgICAgICAgIGhhbmRQaWVjZU9mZnNldC5sZWZ0LFxuICAgICAgICAgICAgICAgICAgICAgIGhhbmRQaWVjZU9mZnNldC50b3AsXG4gICAgICAgICAgICAgICAgICAgICAgdXRpbC5zZW50ZVBvdihjdXJyZW50Lm9yaWVudGF0aW9uKSxcbiAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50LmRpbWVuc2lvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgYm91bmRzLFxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmIChvdXRQb3MpXG4gICAgICAgICAgICAgIG1pc3NpbmdzLnB1c2goe1xuICAgICAgICAgICAgICAgIHBvczogb3V0UG9zLFxuICAgICAgICAgICAgICAgIHBpZWNlOiBwaWVjZSxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGZvciAoY29uc3QgbmV3UCBvZiBuZXdzKSB7XG4gICAgY29uc3QgcHJlUCA9IGNsb3NlcihcbiAgICAgIG5ld1AsXG4gICAgICBtaXNzaW5ncy5maWx0ZXIoKHApID0+IHtcbiAgICAgICAgaWYgKHV0aWwuc2FtZVBpZWNlKG5ld1AucGllY2UsIHAucGllY2UpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgLy8gY2hlY2tpbmcgd2hldGhlciBwcm9tb3RlZCBwaWVjZXMgYXJlIHRoZSBzYW1lXG4gICAgICAgIGNvbnN0IHBSb2xlID0gY3VycmVudC5wcm9tb3Rpb24ucHJvbW90ZXNUbyhwLnBpZWNlLnJvbGUpLFxuICAgICAgICAgIHBQaWVjZSA9IHBSb2xlICYmIHsgY29sb3I6IHAucGllY2UuY29sb3IsIHJvbGU6IHBSb2xlIH07XG4gICAgICAgIGNvbnN0IG5Sb2xlID0gY3VycmVudC5wcm9tb3Rpb24ucHJvbW90ZXNUbyhuZXdQLnBpZWNlLnJvbGUpLFxuICAgICAgICAgIG5QaWVjZSA9IG5Sb2xlICYmIHsgY29sb3I6IG5ld1AucGllY2UuY29sb3IsIHJvbGU6IG5Sb2xlIH07XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgKCEhcFBpZWNlICYmIHV0aWwuc2FtZVBpZWNlKG5ld1AucGllY2UsIHBQaWVjZSkpIHx8XG4gICAgICAgICAgKCEhblBpZWNlICYmIHV0aWwuc2FtZVBpZWNlKG5QaWVjZSwgcC5waWVjZSkpXG4gICAgICAgICk7XG4gICAgICB9KSxcbiAgICApO1xuICAgIGlmIChwcmVQKSB7XG4gICAgICBjb25zdCB2ZWN0b3IgPSBbcHJlUC5wb3NbMF0gLSBuZXdQLnBvc1swXSwgcHJlUC5wb3NbMV0gLSBuZXdQLnBvc1sxXV07XG4gICAgICBhbmltcy5zZXQobmV3UC5rZXkhLCB2ZWN0b3IuY29uY2F0KHZlY3RvcikgYXMgQW5pbVZlY3Rvcik7XG4gICAgICBpZiAocHJlUC5rZXkpIGFuaW1lZE9yaWdzLnB1c2gocHJlUC5rZXkpO1xuICAgICAgaWYgKCF1dGlsLnNhbWVQaWVjZShuZXdQLnBpZWNlLCBwcmVQLnBpZWNlKSAmJiBuZXdQLmtleSkgcHJvbW90aW9ucy5zZXQobmV3UC5rZXksIHByZVAucGllY2UpO1xuICAgIH1cbiAgfVxuICBmb3IgKGNvbnN0IHAgb2YgbWlzc2luZ3MpIHtcbiAgICBpZiAocC5rZXkgJiYgIWFuaW1lZE9yaWdzLmluY2x1ZGVzKHAua2V5KSkgZmFkaW5ncy5zZXQocC5rZXksIHAucGllY2UpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBhbmltczogYW5pbXMsXG4gICAgZmFkaW5nczogZmFkaW5ncyxcbiAgICBwcm9tb3Rpb25zOiBwcm9tb3Rpb25zLFxuICB9O1xufVxuXG5mdW5jdGlvbiBzdGVwKHN0YXRlOiBTdGF0ZSwgbm93OiBET01IaWdoUmVzVGltZVN0YW1wKTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50O1xuICBpZiAoY3VyID09PSB1bmRlZmluZWQpIHtcbiAgICAvLyBhbmltYXRpb24gd2FzIGNhbmNlbGVkIDooXG4gICAgaWYgKCFzdGF0ZS5kb20uZGVzdHJveWVkKSBzdGF0ZS5kb20ucmVkcmF3Tm93KCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IHJlc3QgPSAxIC0gKG5vdyAtIGN1ci5zdGFydCkgKiBjdXIuZnJlcXVlbmN5O1xuICBpZiAocmVzdCA8PSAwKSB7XG4gICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZG9tLnJlZHJhd05vdygpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGVhc2UgPSBlYXNpbmcocmVzdCk7XG4gICAgZm9yIChjb25zdCBjZmcgb2YgY3VyLnBsYW4uYW5pbXMudmFsdWVzKCkpIHtcbiAgICAgIGNmZ1syXSA9IGNmZ1swXSAqIGVhc2U7XG4gICAgICBjZmdbM10gPSBjZmdbMV0gKiBlYXNlO1xuICAgIH1cbiAgICBzdGF0ZS5kb20ucmVkcmF3Tm93KHRydWUpOyAvLyBvcHRpbWlzYXRpb246IGRvbid0IHJlbmRlciBTVkcgY2hhbmdlcyBkdXJpbmcgYW5pbWF0aW9uc1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgobm93ID0gcGVyZm9ybWFuY2Uubm93KCkpID0+IHN0ZXAoc3RhdGUsIG5vdykpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFuaW1hdGU8QT4obXV0YXRpb246IE11dGF0aW9uPEE+LCBzdGF0ZTogU3RhdGUpOiBBIHtcbiAgLy8gY2xvbmUgc3RhdGUgYmVmb3JlIG11dGF0aW5nIGl0XG4gIGNvbnN0IHByZXZQaWVjZXM6IHNnLlBpZWNlcyA9IG5ldyBNYXAoc3RhdGUucGllY2VzKSxcbiAgICBwcmV2SGFuZHM6IHNnLkhhbmRzID0gbmV3IE1hcChbXG4gICAgICBbJ3NlbnRlJywgbmV3IE1hcChzdGF0ZS5oYW5kcy5oYW5kTWFwLmdldCgnc2VudGUnKSldLFxuICAgICAgWydnb3RlJywgbmV3IE1hcChzdGF0ZS5oYW5kcy5oYW5kTWFwLmdldCgnZ290ZScpKV0sXG4gICAgXSk7XG5cbiAgY29uc3QgcmVzdWx0ID0gbXV0YXRpb24oc3RhdGUpLFxuICAgIHBsYW4gPSBjb21wdXRlUGxhbihwcmV2UGllY2VzLCBwcmV2SGFuZHMsIHN0YXRlKTtcbiAgaWYgKHBsYW4uYW5pbXMuc2l6ZSB8fCBwbGFuLmZhZGluZ3Muc2l6ZSkge1xuICAgIGNvbnN0IGFscmVhZHlSdW5uaW5nID0gc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQ/LnN0YXJ0ICE9PSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB7XG4gICAgICBzdGFydDogcGVyZm9ybWFuY2Uubm93KCksXG4gICAgICBmcmVxdWVuY3k6IDEgLyBNYXRoLm1heChzdGF0ZS5hbmltYXRpb24uZHVyYXRpb24sIDEpLFxuICAgICAgcGxhbjogcGxhbixcbiAgICB9O1xuICAgIGlmICghYWxyZWFkeVJ1bm5pbmcpIHN0ZXAoc3RhdGUsIHBlcmZvcm1hbmNlLm5vdygpKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBkb24ndCBhbmltYXRlLCBqdXN0IHJlbmRlciByaWdodCBhd2F5XG4gICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2dyZS8xNjUwMjk0XG5mdW5jdGlvbiBlYXNpbmcodDogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIHQgPCAwLjUgPyA0ICogdCAqIHQgKiB0IDogKHQgLSAxKSAqICgyICogdCAtIDIpICogKDIgKiB0IC0gMikgKyAxO1xufVxuIiwgImltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlIHsgRHJhd1NoYXBlLCBEcmF3U2hhcGVQaWVjZSwgRHJhd0N1cnJlbnQgfSBmcm9tICcuL2RyYXcuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7XG4gIGNyZWF0ZUVsLFxuICBrZXkycG9zLFxuICBwaWVjZU5hbWVPZixcbiAgcG9zVG9UcmFuc2xhdGVSZWwsXG4gIHNhbWVQaWVjZSxcbiAgdHJhbnNsYXRlUmVsLFxuICBwb3NPZk91dHNpZGVFbCxcbiAgc2VudGVQb3YsXG59IGZyb20gJy4vdXRpbC5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTVkdFbGVtZW50KHRhZ05hbWU6IHN0cmluZyk6IFNWR0VsZW1lbnQge1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsIHRhZ05hbWUpO1xufVxuXG5pbnRlcmZhY2UgU2hhcGUge1xuICBzaGFwZTogRHJhd1NoYXBlO1xuICBoYXNoOiBIYXNoO1xuICBjdXJyZW50PzogYm9vbGVhbjtcbn1cblxudHlwZSBBcnJvd0Rlc3RzID0gTWFwPHNnLktleSB8IHNnLlBpZWNlTmFtZSwgbnVtYmVyPjsgLy8gaG93IG1hbnkgYXJyb3dzIGxhbmQgb24gYSBzcXVhcmVcblxudHlwZSBIYXNoID0gc3RyaW5nO1xuXG5jb25zdCBvdXRzaWRlQXJyb3dIYXNoID0gJ291dHNpZGVBcnJvdyc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJTaGFwZXMoXG4gIHN0YXRlOiBTdGF0ZSxcbiAgc3ZnOiBTVkdFbGVtZW50LFxuICBjdXN0b21Tdmc6IFNWR0VsZW1lbnQsXG4gIGZyZWVQaWVjZXM6IEhUTUxFbGVtZW50LFxuKTogdm9pZCB7XG4gIGNvbnN0IGQgPSBzdGF0ZS5kcmF3YWJsZSxcbiAgICBjdXJEID0gZC5jdXJyZW50LFxuICAgIGN1ciA9IGN1ckQ/LmRlc3QgPyAoY3VyRCBhcyBEcmF3U2hhcGUpIDogdW5kZWZpbmVkLFxuICAgIG91dHNpZGVBcnJvdyA9ICEhY3VyRCAmJiAhY3VyLFxuICAgIGFycm93RGVzdHM6IEFycm93RGVzdHMgPSBuZXcgTWFwKCksXG4gICAgcGllY2VNYXAgPSBuZXcgTWFwPHNnLktleSwgRHJhd1NoYXBlPigpO1xuXG4gIGNvbnN0IGhhc2hCb3VuZHMgPSAoKSA9PiB7XG4gICAgLy8gdG9kbyBhbHNvIHBvc3NpYmxlIHBpZWNlIGJvdW5kc1xuICAgIGNvbnN0IGJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gICAgcmV0dXJuIChib3VuZHMgJiYgYm91bmRzLndpZHRoLnRvU3RyaW5nKCkgKyBib3VuZHMuaGVpZ2h0KSB8fCAnJztcbiAgfTtcblxuICBmb3IgKGNvbnN0IHMgb2YgZC5zaGFwZXMuY29uY2F0KGQuYXV0b1NoYXBlcykuY29uY2F0KGN1ciA/IFtjdXJdIDogW10pKSB7XG4gICAgY29uc3QgZGVzdE5hbWUgPSBpc1BpZWNlKHMuZGVzdCkgPyBwaWVjZU5hbWVPZihzLmRlc3QpIDogcy5kZXN0O1xuICAgIGlmICghc2FtZVBpZWNlT3JLZXkocy5kZXN0LCBzLm9yaWcpKVxuICAgICAgYXJyb3dEZXN0cy5zZXQoZGVzdE5hbWUsIChhcnJvd0Rlc3RzLmdldChkZXN0TmFtZSkgfHwgMCkgKyAxKTtcbiAgfVxuXG4gIGZvciAoY29uc3QgcyBvZiBkLnNoYXBlcy5jb25jYXQoY3VyID8gW2N1cl0gOiBbXSkuY29uY2F0KGQuYXV0b1NoYXBlcykpIHtcbiAgICBpZiAocy5waWVjZSAmJiAhaXNQaWVjZShzLm9yaWcpKSBwaWVjZU1hcC5zZXQocy5vcmlnLCBzKTtcbiAgfVxuICBjb25zdCBwaWVjZVNoYXBlcyA9IFsuLi5waWVjZU1hcC52YWx1ZXMoKV0ubWFwKChzKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNoYXBlOiBzLFxuICAgICAgaGFzaDogc2hhcGVIYXNoKHMsIGFycm93RGVzdHMsIGZhbHNlLCBoYXNoQm91bmRzKSxcbiAgICB9O1xuICB9KTtcblxuICBjb25zdCBzaGFwZXM6IFNoYXBlW10gPSBkLnNoYXBlcy5jb25jYXQoZC5hdXRvU2hhcGVzKS5tYXAoKHM6IERyYXdTaGFwZSkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBzaGFwZTogcyxcbiAgICAgIGhhc2g6IHNoYXBlSGFzaChzLCBhcnJvd0Rlc3RzLCBmYWxzZSwgaGFzaEJvdW5kcyksXG4gICAgfTtcbiAgfSk7XG4gIGlmIChjdXIpXG4gICAgc2hhcGVzLnB1c2goe1xuICAgICAgc2hhcGU6IGN1cixcbiAgICAgIGhhc2g6IHNoYXBlSGFzaChjdXIsIGFycm93RGVzdHMsIHRydWUsIGhhc2hCb3VuZHMpLFxuICAgICAgY3VycmVudDogdHJ1ZSxcbiAgICB9KTtcblxuICBjb25zdCBmdWxsSGFzaCA9IHNoYXBlcy5tYXAoKHNjKSA9PiBzYy5oYXNoKS5qb2luKCc7JykgKyAob3V0c2lkZUFycm93ID8gb3V0c2lkZUFycm93SGFzaCA6ICcnKTtcbiAgaWYgKGZ1bGxIYXNoID09PSBzdGF0ZS5kcmF3YWJsZS5wcmV2U3ZnSGFzaCkgcmV0dXJuO1xuICBzdGF0ZS5kcmF3YWJsZS5wcmV2U3ZnSGFzaCA9IGZ1bGxIYXNoO1xuXG4gIC8qXG4gICAgLS0gRE9NIGhpZXJhcmNoeSAtLVxuICAgIDxzdmcgY2xhc3M9XCJzZy1zaGFwZXNcIj4gKDw9IHN2ZylcbiAgICAgIDxkZWZzPlxuICAgICAgICAuLi4oZm9yIGJydXNoZXMpLi4uXG4gICAgICA8L2RlZnM+XG4gICAgICA8Zz5cbiAgICAgICAgLi4uKGZvciBhcnJvd3MgYW5kIGNpcmNsZXMpLi4uXG4gICAgICA8L2c+XG4gICAgPC9zdmc+XG4gICAgPHN2ZyBjbGFzcz1cInNnLWN1c3RvbS1zdmdzXCI+ICg8PSBjdXN0b21TdmcpXG4gICAgICA8Zz5cbiAgICAgICAgLi4uKGZvciBjdXN0b20gc3ZncykuLi5cbiAgICAgIDwvZz5cbiAgICA8c2ctZnJlZS1waWVjZXM+ICg8PSBmcmVlUGllY2VzKVxuICAgICAgLi4uKGZvciBwaWVjZXMpLi4uXG4gICAgPC9zZy1mcmVlLXBpZWNlcz5cbiAgICA8L3N2Zz5cbiAgKi9cbiAgY29uc3QgZGVmc0VsID0gc3ZnLnF1ZXJ5U2VsZWN0b3IoJ2RlZnMnKSBhcyBTVkdFbGVtZW50LFxuICAgIHNoYXBlc0VsID0gc3ZnLnF1ZXJ5U2VsZWN0b3IoJ2cnKSBhcyBTVkdFbGVtZW50LFxuICAgIGN1c3RvbVN2Z3NFbCA9IGN1c3RvbVN2Zy5xdWVyeVNlbGVjdG9yKCdnJykgYXMgU1ZHRWxlbWVudDtcblxuICBzeW5jRGVmcyhzaGFwZXMsIG91dHNpZGVBcnJvdyA/IGN1ckQgOiB1bmRlZmluZWQsIGRlZnNFbCk7XG4gIHN5bmNTaGFwZXMoXG4gICAgc2hhcGVzLmZpbHRlcigocykgPT4gIXMuc2hhcGUuY3VzdG9tU3ZnICYmICghcy5zaGFwZS5waWVjZSB8fCBzLmN1cnJlbnQpKSxcbiAgICBzaGFwZXNFbCxcbiAgICAoc2hhcGUpID0+IHJlbmRlclNWR1NoYXBlKHN0YXRlLCBzaGFwZSwgYXJyb3dEZXN0cyksXG4gICAgb3V0c2lkZUFycm93LFxuICApO1xuICBzeW5jU2hhcGVzKFxuICAgIHNoYXBlcy5maWx0ZXIoKHMpID0+IHMuc2hhcGUuY3VzdG9tU3ZnKSxcbiAgICBjdXN0b21TdmdzRWwsXG4gICAgKHNoYXBlKSA9PiByZW5kZXJTVkdTaGFwZShzdGF0ZSwgc2hhcGUsIGFycm93RGVzdHMpLFxuICApO1xuICBzeW5jU2hhcGVzKHBpZWNlU2hhcGVzLCBmcmVlUGllY2VzLCAoc2hhcGUpID0+IHJlbmRlclBpZWNlKHN0YXRlLCBzaGFwZSkpO1xuXG4gIGlmICghb3V0c2lkZUFycm93ICYmIGN1ckQpIGN1ckQuYXJyb3cgPSB1bmRlZmluZWQ7XG5cbiAgaWYgKG91dHNpZGVBcnJvdyAmJiAhY3VyRC5hcnJvdykge1xuICAgIGNvbnN0IG9yaWcgPSBwaWVjZU9yS2V5VG9Qb3MoY3VyRC5vcmlnLCBzdGF0ZSk7XG4gICAgaWYgKG9yaWcpIHtcbiAgICAgIGNvbnN0IGcgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ2cnKSwge1xuICAgICAgICAgIGNsYXNzOiBzaGFwZUNsYXNzKGN1ckQuYnJ1c2gsIHRydWUsIHRydWUpLFxuICAgICAgICAgIHNnSGFzaDogb3V0c2lkZUFycm93SGFzaCxcbiAgICAgICAgfSksXG4gICAgICAgIGVsID0gcmVuZGVyQXJyb3coY3VyRC5icnVzaCwgb3JpZywgb3JpZywgc3RhdGUuc3F1YXJlUmF0aW8sIHRydWUsIGZhbHNlKTtcbiAgICAgIGcuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgY3VyRC5hcnJvdyA9IGVsO1xuICAgICAgc2hhcGVzRWwuYXBwZW5kQ2hpbGQoZyk7XG4gICAgfVxuICB9XG59XG5cbi8vIGFwcGVuZCBvbmx5LiBEb24ndCB0cnkgdG8gdXBkYXRlL3JlbW92ZS5cbmZ1bmN0aW9uIHN5bmNEZWZzKFxuICBzaGFwZXM6IFNoYXBlW10sXG4gIG91dHNpZGVTaGFwZTogRHJhd0N1cnJlbnQgfCB1bmRlZmluZWQsXG4gIGRlZnNFbDogU1ZHRWxlbWVudCxcbik6IHZvaWQge1xuICBjb25zdCBicnVzaGVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGZvciAoY29uc3QgcyBvZiBzaGFwZXMpIHtcbiAgICBpZiAoIXNhbWVQaWVjZU9yS2V5KHMuc2hhcGUuZGVzdCwgcy5zaGFwZS5vcmlnKSkgYnJ1c2hlcy5hZGQocy5zaGFwZS5icnVzaCk7XG4gIH1cbiAgaWYgKG91dHNpZGVTaGFwZSkgYnJ1c2hlcy5hZGQob3V0c2lkZVNoYXBlLmJydXNoKTtcbiAgY29uc3Qga2V5c0luRG9tID0gbmV3IFNldCgpO1xuICBsZXQgZWw6IFNWR0VsZW1lbnQgfCB1bmRlZmluZWQgPSBkZWZzRWwuZmlyc3RFbGVtZW50Q2hpbGQgYXMgU1ZHRWxlbWVudDtcbiAgd2hpbGUgKGVsKSB7XG4gICAga2V5c0luRG9tLmFkZChlbC5nZXRBdHRyaWJ1dGUoJ3NnS2V5JykpO1xuICAgIGVsID0gZWwubmV4dEVsZW1lbnRTaWJsaW5nIGFzIFNWR0VsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIH1cbiAgZm9yIChjb25zdCBrZXkgb2YgYnJ1c2hlcykge1xuICAgIGNvbnN0IGJydXNoID0ga2V5IHx8ICdwcmltYXJ5JztcbiAgICBpZiAoIWtleXNJbkRvbS5oYXMoYnJ1c2gpKSBkZWZzRWwuYXBwZW5kQ2hpbGQocmVuZGVyTWFya2VyKGJydXNoKSk7XG4gIH1cbn1cblxuLy8gYXBwZW5kIGFuZCByZW1vdmUgb25seS4gTm8gdXBkYXRlcy5cbmV4cG9ydCBmdW5jdGlvbiBzeW5jU2hhcGVzKFxuICBzaGFwZXM6IFNoYXBlW10sXG4gIHJvb3Q6IEhUTUxFbGVtZW50IHwgU1ZHRWxlbWVudCxcbiAgcmVuZGVyU2hhcGU6IChzaGFwZTogU2hhcGUpID0+IEhUTUxFbGVtZW50IHwgU1ZHRWxlbWVudCB8IHVuZGVmaW5lZCxcbiAgb3V0c2lkZUFycm93PzogYm9vbGVhbixcbik6IHZvaWQge1xuICBjb25zdCBoYXNoZXNJbkRvbSA9IG5ldyBNYXAoKSwgLy8gYnkgaGFzaFxuICAgIHRvUmVtb3ZlOiBTVkdFbGVtZW50W10gPSBbXTtcbiAgZm9yIChjb25zdCBzYyBvZiBzaGFwZXMpIGhhc2hlc0luRG9tLnNldChzYy5oYXNoLCBmYWxzZSk7XG4gIGlmIChvdXRzaWRlQXJyb3cpIGhhc2hlc0luRG9tLnNldChvdXRzaWRlQXJyb3dIYXNoLCB0cnVlKTtcbiAgbGV0IGVsOiBTVkdFbGVtZW50IHwgdW5kZWZpbmVkID0gcm9vdC5maXJzdEVsZW1lbnRDaGlsZCBhcyBTVkdFbGVtZW50LFxuICAgIGVsSGFzaDogSGFzaDtcbiAgd2hpbGUgKGVsKSB7XG4gICAgZWxIYXNoID0gZWwuZ2V0QXR0cmlidXRlKCdzZ0hhc2gnKSE7XG4gICAgLy8gZm91bmQgYSBzaGFwZSBlbGVtZW50IHRoYXQncyBoZXJlIHRvIHN0YXlcbiAgICBpZiAoaGFzaGVzSW5Eb20uaGFzKGVsSGFzaCkpIGhhc2hlc0luRG9tLnNldChlbEhhc2gsIHRydWUpO1xuICAgIC8vIG9yIHJlbW92ZSBpdFxuICAgIGVsc2UgdG9SZW1vdmUucHVzaChlbCk7XG4gICAgZWwgPSBlbC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgU1ZHRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgfVxuICAvLyByZW1vdmUgb2xkIHNoYXBlc1xuICBmb3IgKGNvbnN0IGVsIG9mIHRvUmVtb3ZlKSByb290LnJlbW92ZUNoaWxkKGVsKTtcbiAgLy8gaW5zZXJ0IHNoYXBlcyB0aGF0IGFyZSBub3QgeWV0IGluIGRvbVxuICBmb3IgKGNvbnN0IHNjIG9mIHNoYXBlcykge1xuICAgIGlmICghaGFzaGVzSW5Eb20uZ2V0KHNjLmhhc2gpKSB7XG4gICAgICBjb25zdCBzaGFwZUVsID0gcmVuZGVyU2hhcGUoc2MpO1xuICAgICAgaWYgKHNoYXBlRWwpIHJvb3QuYXBwZW5kQ2hpbGQoc2hhcGVFbCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNoYXBlSGFzaChcbiAgeyBvcmlnLCBkZXN0LCBicnVzaCwgcGllY2UsIGN1c3RvbVN2ZywgZGVzY3JpcHRpb24gfTogRHJhd1NoYXBlLFxuICBhcnJvd0Rlc3RzOiBBcnJvd0Rlc3RzLFxuICBjdXJyZW50OiBib29sZWFuLFxuICBib3VuZEhhc2g6ICgpID0+IHN0cmluZyxcbik6IEhhc2gge1xuICByZXR1cm4gW1xuICAgIGN1cnJlbnQsXG4gICAgKGlzUGllY2Uob3JpZykgfHwgaXNQaWVjZShkZXN0KSkgJiYgYm91bmRIYXNoKCksXG4gICAgaXNQaWVjZShvcmlnKSA/IHBpZWNlSGFzaChvcmlnKSA6IG9yaWcsXG4gICAgaXNQaWVjZShkZXN0KSA/IHBpZWNlSGFzaChkZXN0KSA6IGRlc3QsXG4gICAgYnJ1c2gsXG4gICAgKGFycm93RGVzdHMuZ2V0KGlzUGllY2UoZGVzdCkgPyBwaWVjZU5hbWVPZihkZXN0KSA6IGRlc3QpIHx8IDApID4gMSxcbiAgICBwaWVjZSAmJiBwaWVjZUhhc2gocGllY2UpLFxuICAgIGN1c3RvbVN2ZyAmJiBjdXN0b21TdmdIYXNoKGN1c3RvbVN2ZyksXG4gICAgZGVzY3JpcHRpb24sXG4gIF1cbiAgICAuZmlsdGVyKCh4KSA9PiB4KVxuICAgIC5qb2luKCcsJyk7XG59XG5cbmZ1bmN0aW9uIHBpZWNlSGFzaChwaWVjZTogRHJhd1NoYXBlUGllY2UpOiBIYXNoIHtcbiAgcmV0dXJuIFtwaWVjZS5jb2xvciwgcGllY2Uucm9sZSwgcGllY2Uuc2NhbGVdLmZpbHRlcigoeCkgPT4geCkuam9pbignLCcpO1xufVxuXG5mdW5jdGlvbiBjdXN0b21TdmdIYXNoKHM6IHN0cmluZyk6IEhhc2gge1xuICAvLyBSb2xsaW5nIGhhc2ggd2l0aCBiYXNlIDMxIChjZi4gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNzYxNjQ2MS9nZW5lcmF0ZS1hLWhhc2gtZnJvbS1zdHJpbmctaW4tamF2YXNjcmlwdClcbiAgbGV0IGggPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHMubGVuZ3RoOyBpKyspIHtcbiAgICBoID0gKChoIDw8IDUpIC0gaCArIHMuY2hhckNvZGVBdChpKSkgPj4+IDA7XG4gIH1cbiAgcmV0dXJuICdjdXN0b20tJyArIGgudG9TdHJpbmcoKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyU1ZHU2hhcGUoXG4gIHN0YXRlOiBTdGF0ZSxcbiAgeyBzaGFwZSwgY3VycmVudCwgaGFzaCB9OiBTaGFwZSxcbiAgYXJyb3dEZXN0czogQXJyb3dEZXN0cyxcbik6IFNWR0VsZW1lbnQgfCB1bmRlZmluZWQge1xuICBjb25zdCBvcmlnID0gcGllY2VPcktleVRvUG9zKHNoYXBlLm9yaWcsIHN0YXRlKTtcbiAgaWYgKCFvcmlnKSByZXR1cm47XG4gIGlmIChzaGFwZS5jdXN0b21TdmcpIHtcbiAgICByZXR1cm4gcmVuZGVyQ3VzdG9tU3ZnKHNoYXBlLmJydXNoLCBzaGFwZS5jdXN0b21TdmcsIG9yaWcsIHN0YXRlLnNxdWFyZVJhdGlvKTtcbiAgfSBlbHNlIHtcbiAgICBsZXQgZWw6IFNWR0VsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgY29uc3QgZGVzdCA9ICFzYW1lUGllY2VPcktleShzaGFwZS5vcmlnLCBzaGFwZS5kZXN0KSAmJiBwaWVjZU9yS2V5VG9Qb3Moc2hhcGUuZGVzdCwgc3RhdGUpO1xuICAgIGlmIChkZXN0KSB7XG4gICAgICBlbCA9IHJlbmRlckFycm93KFxuICAgICAgICBzaGFwZS5icnVzaCxcbiAgICAgICAgb3JpZyxcbiAgICAgICAgZGVzdCxcbiAgICAgICAgc3RhdGUuc3F1YXJlUmF0aW8sXG4gICAgICAgICEhY3VycmVudCxcbiAgICAgICAgKGFycm93RGVzdHMuZ2V0KGlzUGllY2Uoc2hhcGUuZGVzdCkgPyBwaWVjZU5hbWVPZihzaGFwZS5kZXN0KSA6IHNoYXBlLmRlc3QpIHx8IDApID4gMSxcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmIChzYW1lUGllY2VPcktleShzaGFwZS5kZXN0LCBzaGFwZS5vcmlnKSkge1xuICAgICAgbGV0IHJhdGlvOiBzZy5OdW1iZXJQYWlyID0gc3RhdGUuc3F1YXJlUmF0aW87XG4gICAgICBpZiAoaXNQaWVjZShzaGFwZS5vcmlnKSkge1xuICAgICAgICBjb25zdCBwaWVjZUJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMoKS5nZXQocGllY2VOYW1lT2Yoc2hhcGUub3JpZykpLFxuICAgICAgICAgIGJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gICAgICAgIGlmIChwaWVjZUJvdW5kcyAmJiBib3VuZHMpIHtcbiAgICAgICAgICBjb25zdCBoZWlnaHRCYXNlID0gcGllY2VCb3VuZHMuaGVpZ2h0IC8gKGJvdW5kcy5oZWlnaHQgLyBzdGF0ZS5kaW1lbnNpb25zLnJhbmtzKTtcbiAgICAgICAgICAvLyB3ZSB3YW50IHRvIGtlZXAgdGhlIHJhdGlvIHRoYXQgaXMgb24gdGhlIGJvYXJkXG4gICAgICAgICAgcmF0aW8gPSBbaGVpZ2h0QmFzZSAqIHN0YXRlLnNxdWFyZVJhdGlvWzBdLCBoZWlnaHRCYXNlICogc3RhdGUuc3F1YXJlUmF0aW9bMV1dO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbCA9IHJlbmRlckVsbGlwc2Uob3JpZywgcmF0aW8sICEhY3VycmVudCk7XG4gICAgfVxuICAgIGlmIChlbCkge1xuICAgICAgY29uc3QgZyA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnZycpLCB7XG4gICAgICAgIGNsYXNzOiBzaGFwZUNsYXNzKHNoYXBlLmJydXNoLCAhIWN1cnJlbnQsIGZhbHNlKSxcbiAgICAgICAgc2dIYXNoOiBoYXNoLFxuICAgICAgfSk7XG4gICAgICBnLmFwcGVuZENoaWxkKGVsKTtcbiAgICAgIGNvbnN0IGRlc2NFbCA9IHNoYXBlLmRlc2NyaXB0aW9uICYmIHJlbmRlckRlc2NyaXB0aW9uKHN0YXRlLCBzaGFwZSwgYXJyb3dEZXN0cyk7XG4gICAgICBpZiAoZGVzY0VsKSBnLmFwcGVuZENoaWxkKGRlc2NFbCk7XG4gICAgICByZXR1cm4gZztcbiAgICB9IGVsc2UgcmV0dXJuO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlckN1c3RvbVN2ZyhcbiAgYnJ1c2g6IHN0cmluZyxcbiAgY3VzdG9tU3ZnOiBzdHJpbmcsXG4gIHBvczogc2cuUG9zLFxuICByYXRpbzogc2cuTnVtYmVyUGFpcixcbik6IFNWR0VsZW1lbnQge1xuICBjb25zdCBbeCwgeV0gPSBwb3M7XG5cbiAgLy8gVHJhbnNsYXRlIHRvIHRvcC1sZWZ0IG9mIGBvcmlnYCBzcXVhcmVcbiAgY29uc3QgZyA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnZycpLCB7IHRyYW5zZm9ybTogYHRyYW5zbGF0ZSgke3h9LCR7eX0pYCB9KTtcblxuICBjb25zdCBzdmcgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ3N2ZycpLCB7XG4gICAgY2xhc3M6IGJydXNoLFxuICAgIHdpZHRoOiByYXRpb1swXSxcbiAgICBoZWlnaHQ6IHJhdGlvWzFdLFxuICAgIHZpZXdCb3g6IGAwIDAgJHtyYXRpb1swXSAqIDEwfSAke3JhdGlvWzFdICogMTB9YCxcbiAgfSk7XG5cbiAgZy5hcHBlbmRDaGlsZChzdmcpO1xuICBzdmcuaW5uZXJIVE1MID0gY3VzdG9tU3ZnO1xuXG4gIHJldHVybiBnO1xufVxuXG5mdW5jdGlvbiByZW5kZXJFbGxpcHNlKHBvczogc2cuUG9zLCByYXRpbzogc2cuTnVtYmVyUGFpciwgY3VycmVudDogYm9vbGVhbik6IFNWR0VsZW1lbnQge1xuICBjb25zdCBvID0gcG9zLFxuICAgIHdpZHRocyA9IGVsbGlwc2VXaWR0aChyYXRpbyk7XG4gIHJldHVybiBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ2VsbGlwc2UnKSwge1xuICAgICdzdHJva2Utd2lkdGgnOiB3aWR0aHNbY3VycmVudCA/IDAgOiAxXSxcbiAgICBmaWxsOiAnbm9uZScsXG4gICAgY3g6IG9bMF0sXG4gICAgY3k6IG9bMV0sXG4gICAgcng6IHJhdGlvWzBdIC8gMiAtIHdpZHRoc1sxXSAvIDIsXG4gICAgcnk6IHJhdGlvWzFdIC8gMiAtIHdpZHRoc1sxXSAvIDIsXG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZW5kZXJBcnJvdyhcbiAgYnJ1c2g6IHN0cmluZyxcbiAgb3JpZzogc2cuUG9zLFxuICBkZXN0OiBzZy5Qb3MsXG4gIHJhdGlvOiBzZy5OdW1iZXJQYWlyLFxuICBjdXJyZW50OiBib29sZWFuLFxuICBzaG9ydGVuOiBib29sZWFuLFxuKTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IG0gPSBhcnJvd01hcmdpbihzaG9ydGVuICYmICFjdXJyZW50LCByYXRpbyksXG4gICAgYSA9IG9yaWcsXG4gICAgYiA9IGRlc3QsXG4gICAgZHggPSBiWzBdIC0gYVswXSxcbiAgICBkeSA9IGJbMV0gLSBhWzFdLFxuICAgIGFuZ2xlID0gTWF0aC5hdGFuMihkeSwgZHgpLFxuICAgIHhvID0gTWF0aC5jb3MoYW5nbGUpICogbSxcbiAgICB5byA9IE1hdGguc2luKGFuZ2xlKSAqIG07XG4gIHJldHVybiBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ2xpbmUnKSwge1xuICAgICdzdHJva2Utd2lkdGgnOiBsaW5lV2lkdGgoY3VycmVudCwgcmF0aW8pLFxuICAgICdzdHJva2UtbGluZWNhcCc6ICdyb3VuZCcsXG4gICAgJ21hcmtlci1lbmQnOiAndXJsKCNhcnJvd2hlYWQtJyArIChicnVzaCB8fCAncHJpbWFyeScpICsgJyknLFxuICAgIHgxOiBhWzBdLFxuICAgIHkxOiBhWzFdLFxuICAgIHgyOiBiWzBdIC0geG8sXG4gICAgeTI6IGJbMV0gLSB5byxcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJQaWVjZShzdGF0ZTogU3RhdGUsIHsgc2hhcGUgfTogU2hhcGUpOiBzZy5QaWVjZU5vZGUgfCB1bmRlZmluZWQge1xuICBpZiAoIXNoYXBlLnBpZWNlIHx8IGlzUGllY2Uoc2hhcGUub3JpZykpIHJldHVybjtcblxuICBjb25zdCBvcmlnID0gc2hhcGUub3JpZyxcbiAgICBzY2FsZSA9IChzaGFwZS5waWVjZS5zY2FsZSB8fCAxKSAqIChzdGF0ZS5zY2FsZURvd25QaWVjZXMgPyAwLjUgOiAxKTtcblxuICBjb25zdCBwaWVjZUVsID0gY3JlYXRlRWwoJ3BpZWNlJywgcGllY2VOYW1lT2Yoc2hhcGUucGllY2UpKSBhcyBzZy5QaWVjZU5vZGU7XG4gIHBpZWNlRWwuc2dLZXkgPSBvcmlnO1xuICBwaWVjZUVsLnNnU2NhbGUgPSBzY2FsZTtcbiAgdHJhbnNsYXRlUmVsKFxuICAgIHBpZWNlRWwsXG4gICAgcG9zVG9UcmFuc2xhdGVSZWwoc3RhdGUuZGltZW5zaW9ucykoa2V5MnBvcyhvcmlnKSwgc2VudGVQb3Yoc3RhdGUub3JpZW50YXRpb24pKSxcbiAgICBzdGF0ZS5zY2FsZURvd25QaWVjZXMgPyAwLjUgOiAxLFxuICAgIHNjYWxlLFxuICApO1xuXG4gIHJldHVybiBwaWVjZUVsO1xufVxuXG5mdW5jdGlvbiByZW5kZXJEZXNjcmlwdGlvbihcbiAgc3RhdGU6IFN0YXRlLFxuICBzaGFwZTogRHJhd1NoYXBlLFxuICBhcnJvd0Rlc3RzOiBBcnJvd0Rlc3RzLFxuKTogU1ZHRWxlbWVudCB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IG9yaWcgPSBwaWVjZU9yS2V5VG9Qb3Moc2hhcGUub3JpZywgc3RhdGUpO1xuICBpZiAoIW9yaWcgfHwgIXNoYXBlLmRlc2NyaXB0aW9uKSByZXR1cm47XG4gIGNvbnN0IGRlc3QgPSAhc2FtZVBpZWNlT3JLZXkoc2hhcGUub3JpZywgc2hhcGUuZGVzdCkgJiYgcGllY2VPcktleVRvUG9zKHNoYXBlLmRlc3QsIHN0YXRlKSxcbiAgICBkaWZmID0gZGVzdCA/IFtkZXN0WzBdIC0gb3JpZ1swXSwgZGVzdFsxXSAtIG9yaWdbMV1dIDogWzAsIDBdLFxuICAgIG9mZnNldCA9XG4gICAgICAoYXJyb3dEZXN0cy5nZXQoaXNQaWVjZShzaGFwZS5kZXN0KSA/IHBpZWNlTmFtZU9mKHNoYXBlLmRlc3QpIDogc2hhcGUuZGVzdCkgfHwgMCkgPiAxXG4gICAgICAgID8gMC4zXG4gICAgICAgIDogMC4xNSxcbiAgICBjbG9zZSA9XG4gICAgICAoZGlmZlswXSA9PT0gMCB8fCBNYXRoLmFicyhkaWZmWzBdKSA9PT0gc3RhdGUuc3F1YXJlUmF0aW9bMF0pICYmXG4gICAgICAoZGlmZlsxXSA9PT0gMCB8fCBNYXRoLmFicyhkaWZmWzFdKSA9PT0gc3RhdGUuc3F1YXJlUmF0aW9bMV0pLFxuICAgIHJhdGlvID0gZGVzdCA/IDAuNTUgLSAoY2xvc2UgPyBvZmZzZXQgOiAwKSA6IDAsXG4gICAgbWlkOiBzZy5Qb3MgPSBbb3JpZ1swXSArIGRpZmZbMF0gKiByYXRpbywgb3JpZ1sxXSArIGRpZmZbMV0gKiByYXRpb10sXG4gICAgdGV4dExlbmd0aCA9IHNoYXBlLmRlc2NyaXB0aW9uLmxlbmd0aDtcbiAgY29uc3QgZyA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnZycpLCB7IGNsYXNzOiAnZGVzY3JpcHRpb24nIH0pLFxuICAgIGNpcmNsZSA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnZWxsaXBzZScpLCB7XG4gICAgICBjeDogbWlkWzBdLFxuICAgICAgY3k6IG1pZFsxXSxcbiAgICAgIHJ4OiB0ZXh0TGVuZ3RoICsgMS41LFxuICAgICAgcnk6IDIuNSxcbiAgICB9KSxcbiAgICB0ZXh0ID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCd0ZXh0JyksIHtcbiAgICAgIHg6IG1pZFswXSxcbiAgICAgIHk6IG1pZFsxXSxcbiAgICAgICd0ZXh0LWFuY2hvcic6ICdtaWRkbGUnLFxuICAgICAgJ2RvbWluYW50LWJhc2VsaW5lJzogJ2NlbnRyYWwnLFxuICAgIH0pO1xuICBnLmFwcGVuZENoaWxkKGNpcmNsZSk7XG4gIHRleHQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoc2hhcGUuZGVzY3JpcHRpb24pKTtcbiAgZy5hcHBlbmRDaGlsZCh0ZXh0KTtcbiAgcmV0dXJuIGc7XG59XG5cbmZ1bmN0aW9uIHJlbmRlck1hcmtlcihicnVzaDogc3RyaW5nKTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IG1hcmtlciA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnbWFya2VyJyksIHtcbiAgICBpZDogJ2Fycm93aGVhZC0nICsgYnJ1c2gsXG4gICAgb3JpZW50OiAnYXV0bycsXG4gICAgbWFya2VyV2lkdGg6IDQsXG4gICAgbWFya2VySGVpZ2h0OiA4LFxuICAgIHJlZlg6IDIuMDUsXG4gICAgcmVmWTogMi4wMSxcbiAgfSk7XG4gIG1hcmtlci5hcHBlbmRDaGlsZChcbiAgICBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ3BhdGgnKSwge1xuICAgICAgZDogJ00wLDAgVjQgTDMsMiBaJyxcbiAgICB9KSxcbiAgKTtcbiAgbWFya2VyLnNldEF0dHJpYnV0ZSgnc2dLZXknLCBicnVzaCk7XG4gIHJldHVybiBtYXJrZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRBdHRyaWJ1dGVzKGVsOiBTVkdFbGVtZW50LCBhdHRyczogUmVjb3JkPHN0cmluZywgYW55Pik6IFNWR0VsZW1lbnQge1xuICBmb3IgKGNvbnN0IGtleSBpbiBhdHRycykge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYXR0cnMsIGtleSkpIGVsLnNldEF0dHJpYnV0ZShrZXksIGF0dHJzW2tleV0pO1xuICB9XG4gIHJldHVybiBlbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBvczJ1c2VyKFxuICBwb3M6IHNnLlBvcyxcbiAgY29sb3I6IHNnLkNvbG9yLFxuICBkaW1zOiBzZy5EaW1lbnNpb25zLFxuICByYXRpbzogc2cuTnVtYmVyUGFpcixcbik6IHNnLk51bWJlclBhaXIge1xuICByZXR1cm4gY29sb3IgPT09ICdzZW50ZSdcbiAgICA/IFsoZGltcy5maWxlcyAtIDEgLSBwb3NbMF0pICogcmF0aW9bMF0sIHBvc1sxXSAqIHJhdGlvWzFdXVxuICAgIDogW3Bvc1swXSAqIHJhdGlvWzBdLCAoZGltcy5yYW5rcyAtIDEgLSBwb3NbMV0pICogcmF0aW9bMV1dO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQaWVjZSh4OiBzZy5LZXkgfCBzZy5QaWVjZSk6IHggaXMgc2cuUGllY2Uge1xuICByZXR1cm4gdHlwZW9mIHggPT09ICdvYmplY3QnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2FtZVBpZWNlT3JLZXkoa3AxOiBzZy5LZXkgfCBzZy5QaWVjZSwga3AyOiBzZy5LZXkgfCBzZy5QaWVjZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKGlzUGllY2Uoa3AxKSAmJiBpc1BpZWNlKGtwMikgJiYgc2FtZVBpZWNlKGtwMSwga3AyKSkgfHwga3AxID09PSBrcDI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VzQm91bmRzKHNoYXBlczogRHJhd1NoYXBlW10pOiBib29sZWFuIHtcbiAgcmV0dXJuIHNoYXBlcy5zb21lKChzKSA9PiBpc1BpZWNlKHMub3JpZykgfHwgaXNQaWVjZShzLmRlc3QpKTtcbn1cblxuZnVuY3Rpb24gc2hhcGVDbGFzcyhicnVzaDogc3RyaW5nLCBjdXJyZW50OiBib29sZWFuLCBvdXRzaWRlOiBib29sZWFuKTogc3RyaW5nIHtcbiAgcmV0dXJuIGJydXNoICsgKGN1cnJlbnQgPyAnIGN1cnJlbnQnIDogJycpICsgKG91dHNpZGUgPyAnIG91dHNpZGUnIDogJycpO1xufVxuXG5mdW5jdGlvbiByYXRpb0F2ZXJhZ2UocmF0aW86IHNnLk51bWJlclBhaXIpOiBudW1iZXIge1xuICByZXR1cm4gKHJhdGlvWzBdICsgcmF0aW9bMV0pIC8gMjtcbn1cblxuZnVuY3Rpb24gZWxsaXBzZVdpZHRoKHJhdGlvOiBzZy5OdW1iZXJQYWlyKTogW251bWJlciwgbnVtYmVyXSB7XG4gIHJldHVybiBbKDMgLyA2NCkgKiByYXRpb0F2ZXJhZ2UocmF0aW8pLCAoNCAvIDY0KSAqIHJhdGlvQXZlcmFnZShyYXRpbyldO1xufVxuXG5mdW5jdGlvbiBsaW5lV2lkdGgoY3VycmVudDogYm9vbGVhbiwgcmF0aW86IHNnLk51bWJlclBhaXIpOiBudW1iZXIge1xuICByZXR1cm4gKChjdXJyZW50ID8gOC41IDogMTApIC8gNjQpICogcmF0aW9BdmVyYWdlKHJhdGlvKTtcbn1cblxuZnVuY3Rpb24gYXJyb3dNYXJnaW4oc2hvcnRlbjogYm9vbGVhbiwgcmF0aW86IHNnLk51bWJlclBhaXIpOiBudW1iZXIge1xuICByZXR1cm4gKChzaG9ydGVuID8gMjAgOiAxMCkgLyA2NCkgKiByYXRpb0F2ZXJhZ2UocmF0aW8pO1xufVxuXG5mdW5jdGlvbiBwaWVjZU9yS2V5VG9Qb3Moa3A6IHNnLktleSB8IHNnLlBpZWNlLCBzdGF0ZTogU3RhdGUpOiBzZy5Qb3MgfCB1bmRlZmluZWQge1xuICBpZiAoaXNQaWVjZShrcCkpIHtcbiAgICBjb25zdCBwaWVjZUJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMoKS5nZXQocGllY2VOYW1lT2Yoa3ApKSxcbiAgICAgIGJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCksXG4gICAgICBvZmZzZXQgPSBzZW50ZVBvdihzdGF0ZS5vcmllbnRhdGlvbikgPyBbMC41LCAtMC41XSA6IFstMC41LCAwLjVdLFxuICAgICAgcG9zID1cbiAgICAgICAgcGllY2VCb3VuZHMgJiZcbiAgICAgICAgYm91bmRzICYmXG4gICAgICAgIHBvc09mT3V0c2lkZUVsKFxuICAgICAgICAgIHBpZWNlQm91bmRzLmxlZnQgKyBwaWVjZUJvdW5kcy53aWR0aCAvIDIsXG4gICAgICAgICAgcGllY2VCb3VuZHMudG9wICsgcGllY2VCb3VuZHMuaGVpZ2h0IC8gMixcbiAgICAgICAgICBzZW50ZVBvdihzdGF0ZS5vcmllbnRhdGlvbiksXG4gICAgICAgICAgc3RhdGUuZGltZW5zaW9ucyxcbiAgICAgICAgICBib3VuZHMsXG4gICAgICAgICk7XG4gICAgcmV0dXJuIChcbiAgICAgIHBvcyAmJlxuICAgICAgcG9zMnVzZXIoXG4gICAgICAgIFtwb3NbMF0gKyBvZmZzZXRbMF0sIHBvc1sxXSArIG9mZnNldFsxXV0sXG4gICAgICAgIHN0YXRlLm9yaWVudGF0aW9uLFxuICAgICAgICBzdGF0ZS5kaW1lbnNpb25zLFxuICAgICAgICBzdGF0ZS5zcXVhcmVSYXRpbyxcbiAgICAgIClcbiAgICApO1xuICB9IGVsc2UgcmV0dXJuIHBvczJ1c2VyKGtleTJwb3Moa3ApLCBzdGF0ZS5vcmllbnRhdGlvbiwgc3RhdGUuZGltZW5zaW9ucywgc3RhdGUuc3F1YXJlUmF0aW8pO1xufVxuIiwgImltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyB1bnNlbGVjdCwgY2FuY2VsTW92ZU9yRHJvcCB9IGZyb20gJy4vYm9hcmQuanMnO1xuaW1wb3J0IHtcbiAgZXZlbnRQb3NpdGlvbixcbiAgaXNSaWdodEJ1dHRvbixcbiAgcG9zT2ZPdXRzaWRlRWwsXG4gIHNhbWVQaWVjZSxcbiAgZ2V0SGFuZFBpZWNlQXREb21Qb3MsXG4gIGdldEtleUF0RG9tUG9zLFxuICBzZW50ZVBvdixcbn0gZnJvbSAnLi91dGlsLmpzJztcbmltcG9ydCB7IGlzUGllY2UsIHBvczJ1c2VyLCBzYW1lUGllY2VPcktleSwgc2V0QXR0cmlidXRlcyB9IGZyb20gJy4vc2hhcGVzLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBEcmF3U2hhcGUge1xuICBvcmlnOiBzZy5LZXkgfCBzZy5QaWVjZTtcbiAgZGVzdDogc2cuS2V5IHwgc2cuUGllY2U7XG4gIHBpZWNlPzogRHJhd1NoYXBlUGllY2U7XG4gIGN1c3RvbVN2Zz86IHN0cmluZzsgLy8gc3ZnXG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xuICBicnVzaDogc3RyaW5nOyAvLyBjc3MgY2xhc3MgdG8gYmUgYXBwZW5kZWRcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTcXVhcmVIaWdobGlnaHQge1xuICBrZXk6IHNnLktleTtcbiAgY2xhc3NOYW1lOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd1NoYXBlUGllY2Uge1xuICByb2xlOiBzZy5Sb2xlU3RyaW5nO1xuICBjb2xvcjogc2cuQ29sb3I7XG4gIHNjYWxlPzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdhYmxlIHtcbiAgZW5hYmxlZDogYm9vbGVhbjsgLy8gY2FuIGRyYXdcbiAgdmlzaWJsZTogYm9vbGVhbjsgLy8gY2FuIHZpZXdcbiAgZm9yY2VkOiBib29sZWFuOyAvLyBjYW4gb25seSBkcmF3XG4gIGVyYXNlT25DbGljazogYm9vbGVhbjtcbiAgb25DaGFuZ2U/OiAoc2hhcGVzOiBEcmF3U2hhcGVbXSkgPT4gdm9pZDtcbiAgc2hhcGVzOiBEcmF3U2hhcGVbXTsgLy8gdXNlciBzaGFwZXNcbiAgYXV0b1NoYXBlczogRHJhd1NoYXBlW107IC8vIGNvbXB1dGVyIHNoYXBlc1xuICBzcXVhcmVzOiBTcXVhcmVIaWdobGlnaHRbXTtcbiAgY3VycmVudD86IERyYXdDdXJyZW50O1xuICBwcmV2U3ZnSGFzaDogc3RyaW5nO1xuICBwaWVjZT86IHNnLlBpZWNlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdDdXJyZW50IHtcbiAgb3JpZzogc2cuS2V5IHwgc2cuUGllY2U7XG4gIGRlc3Q/OiBzZy5LZXkgfCBzZy5QaWVjZTsgLy8gdW5kZWZpbmVkIGlmIG91dHNpZGUgYm9hcmQvaGFuZHNcbiAgYXJyb3c/OiBTVkdFbGVtZW50O1xuICBwaWVjZT86IHNnLlBpZWNlO1xuICBwb3M6IHNnLk51bWJlclBhaXI7XG4gIGJydXNoOiBzdHJpbmc7IC8vIGJydXNoIG5hbWUgZm9yIHNoYXBlXG59XG5cbmNvbnN0IGJydXNoZXMgPSBbJ3ByaW1hcnknLCAnYWx0ZXJuYXRpdmUwJywgJ2FsdGVybmF0aXZlMScsICdhbHRlcm5hdGl2ZTInXTtcblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0KHN0YXRlOiBTdGF0ZSwgZTogc2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICAvLyBzdXBwb3J0IG9uZSBmaW5nZXIgdG91Y2ggb25seVxuICBpZiAoZS50b3VjaGVzICYmIGUudG91Y2hlcy5sZW5ndGggPiAxKSByZXR1cm47XG4gIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIGUucHJldmVudERlZmF1bHQoKTtcblxuICBpZiAoZS5jdHJsS2V5KSB1bnNlbGVjdChzdGF0ZSk7XG4gIGVsc2UgY2FuY2VsTW92ZU9yRHJvcChzdGF0ZSk7XG5cbiAgY29uc3QgcG9zID0gZXZlbnRQb3NpdGlvbihlKSxcbiAgICBib3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpLFxuICAgIG9yaWcgPVxuICAgICAgcG9zICYmIGJvdW5kcyAmJiBnZXRLZXlBdERvbVBvcyhwb3MsIHNlbnRlUG92KHN0YXRlLm9yaWVudGF0aW9uKSwgc3RhdGUuZGltZW5zaW9ucywgYm91bmRzKSxcbiAgICBwaWVjZSA9IHN0YXRlLmRyYXdhYmxlLnBpZWNlO1xuICBpZiAoIW9yaWcpIHJldHVybjtcbiAgc3RhdGUuZHJhd2FibGUuY3VycmVudCA9IHtcbiAgICBvcmlnLFxuICAgIGRlc3Q6IHVuZGVmaW5lZCxcbiAgICBwb3MsXG4gICAgcGllY2UsXG4gICAgYnJ1c2g6IGV2ZW50QnJ1c2goZSwgaXNSaWdodEJ1dHRvbihlKSB8fCBzdGF0ZS5kcmF3YWJsZS5mb3JjZWQpLFxuICB9O1xuICBwcm9jZXNzRHJhdyhzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydEZyb21IYW5kKHN0YXRlOiBTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBlOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIC8vIHN1cHBvcnQgb25lIGZpbmdlciB0b3VjaCBvbmx5XG4gIGlmIChlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDEpIHJldHVybjtcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gIGlmIChlLmN0cmxLZXkpIHVuc2VsZWN0KHN0YXRlKTtcbiAgZWxzZSBjYW5jZWxNb3ZlT3JEcm9wKHN0YXRlKTtcblxuICBjb25zdCBwb3MgPSBldmVudFBvc2l0aW9uKGUpO1xuICBpZiAoIXBvcykgcmV0dXJuO1xuICBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50ID0ge1xuICAgIG9yaWc6IHBpZWNlLFxuICAgIGRlc3Q6IHVuZGVmaW5lZCxcbiAgICBwb3MsXG4gICAgYnJ1c2g6IGV2ZW50QnJ1c2goZSwgaXNSaWdodEJ1dHRvbihlKSB8fCBzdGF0ZS5kcmF3YWJsZS5mb3JjZWQpLFxuICB9O1xuICBwcm9jZXNzRHJhdyhzdGF0ZSk7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NEcmF3KHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIGNvbnN0IGN1ciA9IHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQsXG4gICAgICBib3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpO1xuICAgIGlmIChjdXIgJiYgYm91bmRzKSB7XG4gICAgICBjb25zdCBkZXN0ID1cbiAgICAgICAgZ2V0S2V5QXREb21Qb3MoY3VyLnBvcywgc2VudGVQb3Yoc3RhdGUub3JpZW50YXRpb24pLCBzdGF0ZS5kaW1lbnNpb25zLCBib3VuZHMpIHx8XG4gICAgICAgIGdldEhhbmRQaWVjZUF0RG9tUG9zKGN1ci5wb3MsIHN0YXRlLmhhbmRzLnJvbGVzLCBzdGF0ZS5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzKCkpO1xuICAgICAgaWYgKGN1ci5kZXN0ICE9PSBkZXN0ICYmICEoY3VyLmRlc3QgJiYgZGVzdCAmJiBzYW1lUGllY2VPcktleShkZXN0LCBjdXIuZGVzdCkpKSB7XG4gICAgICAgIGN1ci5kZXN0ID0gZGVzdDtcbiAgICAgICAgc3RhdGUuZG9tLnJlZHJhd05vdygpO1xuICAgICAgfVxuICAgICAgY29uc3Qgb3V0UG9zID0gcG9zT2ZPdXRzaWRlRWwoXG4gICAgICAgIGN1ci5wb3NbMF0sXG4gICAgICAgIGN1ci5wb3NbMV0sXG4gICAgICAgIHNlbnRlUG92KHN0YXRlLm9yaWVudGF0aW9uKSxcbiAgICAgICAgc3RhdGUuZGltZW5zaW9ucyxcbiAgICAgICAgYm91bmRzLFxuICAgICAgKTtcbiAgICAgIGlmICghY3VyLmRlc3QgJiYgY3VyLmFycm93ICYmIG91dFBvcykge1xuICAgICAgICBjb25zdCBkZXN0ID0gcG9zMnVzZXIob3V0UG9zLCBzdGF0ZS5vcmllbnRhdGlvbiwgc3RhdGUuZGltZW5zaW9ucywgc3RhdGUuc3F1YXJlUmF0aW8pO1xuXG4gICAgICAgIHNldEF0dHJpYnV0ZXMoY3VyLmFycm93LCB7XG4gICAgICAgICAgeDI6IGRlc3RbMF0gLSBzdGF0ZS5zcXVhcmVSYXRpb1swXSAvIDIsXG4gICAgICAgICAgeTI6IGRlc3RbMV0gLSBzdGF0ZS5zcXVhcmVSYXRpb1sxXSAvIDIsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcHJvY2Vzc0RyYXcoc3RhdGUpO1xuICAgIH1cbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3ZlKHN0YXRlOiBTdGF0ZSwgZTogc2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICBpZiAoc3RhdGUuZHJhd2FibGUuY3VycmVudCkgc3RhdGUuZHJhd2FibGUuY3VycmVudC5wb3MgPSBldmVudFBvc2l0aW9uKGUpITtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuZChzdGF0ZTogU3RhdGUsIF86IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgY29uc3QgY3VyID0gc3RhdGUuZHJhd2FibGUuY3VycmVudDtcbiAgaWYgKGN1cikge1xuICAgIGFkZFNoYXBlKHN0YXRlLmRyYXdhYmxlLCBjdXIpO1xuICAgIGNhbmNlbChzdGF0ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbmNlbChzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQpIHtcbiAgICBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXIoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGNvbnN0IGRyYXdhYmxlTGVuZ3RoID0gc3RhdGUuZHJhd2FibGUuc2hhcGVzLmxlbmd0aDtcbiAgaWYgKGRyYXdhYmxlTGVuZ3RoIHx8IHN0YXRlLmRyYXdhYmxlLnBpZWNlKSB7XG4gICAgc3RhdGUuZHJhd2FibGUuc2hhcGVzID0gW107XG4gICAgc3RhdGUuZHJhd2FibGUucGllY2UgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgIGlmIChkcmF3YWJsZUxlbmd0aCkgb25DaGFuZ2Uoc3RhdGUuZHJhd2FibGUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXREcmF3UGllY2Uoc3RhdGU6IFN0YXRlLCBwaWVjZTogc2cuUGllY2UpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLmRyYXdhYmxlLnBpZWNlICYmIHNhbWVQaWVjZShzdGF0ZS5kcmF3YWJsZS5waWVjZSwgcGllY2UpKVxuICAgIHN0YXRlLmRyYXdhYmxlLnBpZWNlID0gdW5kZWZpbmVkO1xuICBlbHNlIHN0YXRlLmRyYXdhYmxlLnBpZWNlID0gcGllY2U7XG4gIHN0YXRlLmRvbS5yZWRyYXcoKTtcbn1cblxuZnVuY3Rpb24gZXZlbnRCcnVzaChlOiBzZy5Nb3VjaEV2ZW50LCBhbGxvd0ZpcnN0TW9kaWZpZXI6IGJvb2xlYW4pOiBzdHJpbmcge1xuICBjb25zdCBtb2RBID0gYWxsb3dGaXJzdE1vZGlmaWVyICYmIChlLnNoaWZ0S2V5IHx8IGUuY3RybEtleSksXG4gICAgbW9kQiA9IGUuYWx0S2V5IHx8IGUubWV0YUtleSB8fCBlLmdldE1vZGlmaWVyU3RhdGU/LignQWx0R3JhcGgnKTtcbiAgcmV0dXJuIGJydXNoZXNbKG1vZEEgPyAxIDogMCkgKyAobW9kQiA/IDIgOiAwKV07XG59XG5cbmZ1bmN0aW9uIGFkZFNoYXBlKGRyYXdhYmxlOiBEcmF3YWJsZSwgY3VyOiBEcmF3Q3VycmVudCk6IHZvaWQge1xuICBpZiAoIWN1ci5kZXN0KSByZXR1cm47XG5cbiAgY29uc3Qgc2ltaWxhclNoYXBlID0gKHM6IERyYXdTaGFwZSkgPT5cbiAgICBjdXIuZGVzdCAmJiBzYW1lUGllY2VPcktleShjdXIub3JpZywgcy5vcmlnKSAmJiBzYW1lUGllY2VPcktleShjdXIuZGVzdCwgcy5kZXN0KTtcblxuICAvLyBzZXBhcmF0ZSBzaGFwZSBmb3IgcGllY2VzXG4gIGNvbnN0IHBpZWNlID0gY3VyLnBpZWNlO1xuICBjdXIucGllY2UgPSB1bmRlZmluZWQ7XG5cbiAgY29uc3Qgc2ltaWxhciA9IGRyYXdhYmxlLnNoYXBlcy5maW5kKHNpbWlsYXJTaGFwZSksXG4gICAgcmVtb3ZlUGllY2UgPSBkcmF3YWJsZS5zaGFwZXMuZmluZChcbiAgICAgIChzKSA9PiBzaW1pbGFyU2hhcGUocykgJiYgcGllY2UgJiYgcy5waWVjZSAmJiBzYW1lUGllY2UocGllY2UsIHMucGllY2UpLFxuICAgICksXG4gICAgZGlmZlBpZWNlID0gZHJhd2FibGUuc2hhcGVzLmZpbmQoXG4gICAgICAocykgPT4gc2ltaWxhclNoYXBlKHMpICYmIHBpZWNlICYmIHMucGllY2UgJiYgIXNhbWVQaWVjZShwaWVjZSwgcy5waWVjZSksXG4gICAgKTtcblxuICAvLyByZW1vdmUgZXZlcnkgc2ltaWxhciBzaGFwZVxuICBpZiAoc2ltaWxhcikgZHJhd2FibGUuc2hhcGVzID0gZHJhd2FibGUuc2hhcGVzLmZpbHRlcigocykgPT4gIXNpbWlsYXJTaGFwZShzKSk7XG5cbiAgaWYgKCFpc1BpZWNlKGN1ci5vcmlnKSAmJiBwaWVjZSAmJiAhcmVtb3ZlUGllY2UpIHtcbiAgICBkcmF3YWJsZS5zaGFwZXMucHVzaCh7IG9yaWc6IGN1ci5vcmlnLCBkZXN0OiBjdXIub3JpZywgcGllY2U6IHBpZWNlLCBicnVzaDogY3VyLmJydXNoIH0pO1xuICAgIC8vIGZvcmNlIGNpcmNsZSBhcm91bmQgZHJhd24gcGllY2VzXG4gICAgaWYgKCFzYW1lUGllY2VPcktleShjdXIub3JpZywgY3VyLmRlc3QpKVxuICAgICAgZHJhd2FibGUuc2hhcGVzLnB1c2goeyBvcmlnOiBjdXIub3JpZywgZGVzdDogY3VyLm9yaWcsIGJydXNoOiBjdXIuYnJ1c2ggfSk7XG4gIH1cblxuICBpZiAoIXNpbWlsYXIgfHwgZGlmZlBpZWNlIHx8IHNpbWlsYXIuYnJ1c2ggIT09IGN1ci5icnVzaCkgZHJhd2FibGUuc2hhcGVzLnB1c2goY3VyIGFzIERyYXdTaGFwZSk7XG4gIG9uQ2hhbmdlKGRyYXdhYmxlKTtcbn1cblxuZnVuY3Rpb24gb25DaGFuZ2UoZHJhd2FibGU6IERyYXdhYmxlKTogdm9pZCB7XG4gIGlmIChkcmF3YWJsZS5vbkNoYW5nZSkgZHJhd2FibGUub25DaGFuZ2UoZHJhd2FibGUuc2hhcGVzKTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0ICogYXMgYm9hcmQgZnJvbSAnLi9ib2FyZC5qcyc7XG5pbXBvcnQgeyBhZGRUb0hhbmQsIHJlbW92ZUZyb21IYW5kIH0gZnJvbSAnLi9oYW5kcy5qcyc7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbC5qcyc7XG5pbXBvcnQgeyBjbGVhciBhcyBkcmF3Q2xlYXIgfSBmcm9tICcuL2RyYXcuanMnO1xuaW1wb3J0IHsgYW5pbSB9IGZyb20gJy4vYW5pbS5qcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhZ0N1cnJlbnQge1xuICBwaWVjZTogc2cuUGllY2U7IC8vIHBpZWNlIGJlaW5nIGRyYWdnZWRcbiAgcG9zOiBzZy5OdW1iZXJQYWlyOyAvLyBsYXRlc3QgZXZlbnQgcG9zaXRpb25cbiAgb3JpZ1Bvczogc2cuTnVtYmVyUGFpcjsgLy8gZmlyc3QgZXZlbnQgcG9zaXRpb25cbiAgc3RhcnRlZDogYm9vbGVhbjsgLy8gd2hldGhlciB0aGUgZHJhZyBoYXMgc3RhcnRlZDsgYXMgcGVyIHRoZSBkaXN0YW5jZSBzZXR0aW5nXG4gIHRvdWNoOiBib29sZWFuOyAvLyB3YXMgdGhlIGRyYWdnaW5nIGluaXRpYXRlZCBmcm9tIHRvdWNoIGV2ZW50XG4gIG9yaWdpblRhcmdldDogRXZlbnRUYXJnZXQgfCBudWxsO1xuICBmcm9tQm9hcmQ/OiB7XG4gICAgb3JpZzogc2cuS2V5OyAvLyBvcmlnIGtleSBvZiBkcmFnZ2luZyBwaWVjZVxuICAgIHByZXZpb3VzbHlTZWxlY3RlZD86IHNnLktleTsgLy8gc2VsZWN0ZWQgcGllY2UgYmVmb3JlIGRyYWcgYmVnYW5cbiAgICBrZXlIYXNDaGFuZ2VkOiBib29sZWFuOyAvLyB3aGV0aGVyIHRoZSBkcmFnIGhhcyBsZWZ0IHRoZSBvcmlnIGtleSBvciBwaWVjZVxuICB9O1xuICBmcm9tT3V0c2lkZT86IHtcbiAgICBvcmlnaW5Cb3VuZHM6IERPTVJlY3QgfCB1bmRlZmluZWQ7IC8vIGJvdW5kcyBvZiB0aGUgcGllY2UgdGhhdCBpbml0aWF0ZWQgdGhlIGRyYWdcbiAgICBsZWZ0T3JpZ2luOiBib29sZWFuOyAvLyBoYXZlIHdlIGV2ZXIgbGVmdCBvcmlnaW5Cb3VuZHNcbiAgICBwcmV2aW91c2x5U2VsZWN0ZWRQaWVjZT86IHNnLlBpZWNlO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnQoczogU3RhdGUsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgY29uc3QgYm91bmRzID0gcy5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpLFxuICAgIHBvc2l0aW9uID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpLFxuICAgIG9yaWcgPVxuICAgICAgYm91bmRzICYmXG4gICAgICBwb3NpdGlvbiAmJlxuICAgICAgdXRpbC5nZXRLZXlBdERvbVBvcyhwb3NpdGlvbiwgdXRpbC5zZW50ZVBvdihzLm9yaWVudGF0aW9uKSwgcy5kaW1lbnNpb25zLCBib3VuZHMpO1xuXG4gIGlmICghb3JpZykgcmV0dXJuO1xuXG4gIGNvbnN0IHBpZWNlID0gcy5waWVjZXMuZ2V0KG9yaWcpLFxuICAgIHByZXZpb3VzbHlTZWxlY3RlZCA9IHMuc2VsZWN0ZWQ7XG4gIGlmIChcbiAgICAhcHJldmlvdXNseVNlbGVjdGVkICYmXG4gICAgcy5kcmF3YWJsZS5lbmFibGVkICYmXG4gICAgKHMuZHJhd2FibGUuZXJhc2VPbkNsaWNrIHx8ICFwaWVjZSB8fCBwaWVjZS5jb2xvciAhPT0gcy50dXJuQ29sb3IpXG4gIClcbiAgICBkcmF3Q2xlYXIocyk7XG5cbiAgLy8gUHJldmVudCB0b3VjaCBzY3JvbGwgYW5kIGNyZWF0ZSBubyBjb3JyZXNwb25kaW5nIG1vdXNlIGV2ZW50LCBpZiB0aGVyZVxuICAvLyBpcyBhbiBpbnRlbnQgdG8gaW50ZXJhY3Qgd2l0aCB0aGUgYm9hcmQuXG4gIGlmIChcbiAgICBlLmNhbmNlbGFibGUgIT09IGZhbHNlICYmXG4gICAgKCFlLnRvdWNoZXMgfHxcbiAgICAgIHMuYmxvY2tUb3VjaFNjcm9sbCB8fFxuICAgICAgcy5zZWxlY3RlZFBpZWNlIHx8XG4gICAgICBwaWVjZSB8fFxuICAgICAgcHJldmlvdXNseVNlbGVjdGVkIHx8XG4gICAgICBwaWVjZUNsb3NlVG8ocywgcG9zaXRpb24sIGJvdW5kcykpXG4gIClcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIGNvbnN0IGhhZFByZW1vdmUgPSAhIXMucHJlbW92YWJsZS5jdXJyZW50O1xuICBjb25zdCBoYWRQcmVkcm9wID0gISFzLnByZWRyb3BwYWJsZS5jdXJyZW50O1xuICBpZiAocy5zZWxlY3RhYmxlLmRlbGV0ZU9uVG91Y2gpIGJvYXJkLmRlbGV0ZVBpZWNlKHMsIG9yaWcpO1xuICBlbHNlIGlmIChzLnNlbGVjdGVkKSB7XG4gICAgaWYgKCFib2FyZC5wcm9tb3Rpb25EaWFsb2dNb3ZlKHMsIHMuc2VsZWN0ZWQsIG9yaWcpKSB7XG4gICAgICBpZiAoYm9hcmQuY2FuTW92ZShzLCBzLnNlbGVjdGVkLCBvcmlnKSkgYW5pbSgoc3RhdGUpID0+IGJvYXJkLnNlbGVjdFNxdWFyZShzdGF0ZSwgb3JpZyksIHMpO1xuICAgICAgZWxzZSBib2FyZC5zZWxlY3RTcXVhcmUocywgb3JpZyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHMuc2VsZWN0ZWRQaWVjZSkge1xuICAgIGlmICghYm9hcmQucHJvbW90aW9uRGlhbG9nRHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIG9yaWcpKSB7XG4gICAgICBpZiAoYm9hcmQuY2FuRHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIG9yaWcpKVxuICAgICAgICBhbmltKChzdGF0ZSkgPT4gYm9hcmQuc2VsZWN0U3F1YXJlKHN0YXRlLCBvcmlnKSwgcyk7XG4gICAgICBlbHNlIGJvYXJkLnNlbGVjdFNxdWFyZShzLCBvcmlnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgYm9hcmQuc2VsZWN0U3F1YXJlKHMsIG9yaWcpO1xuICB9XG5cbiAgY29uc3Qgc3RpbGxTZWxlY3RlZCA9IHMuc2VsZWN0ZWQgPT09IG9yaWcsXG4gICAgZHJhZ2dlZEVsID0gcy5kb20uZWxlbWVudHMuYm9hcmQ/LmRyYWdnZWQ7XG5cbiAgaWYgKHBpZWNlICYmIGRyYWdnZWRFbCAmJiBzdGlsbFNlbGVjdGVkICYmIGJvYXJkLmlzRHJhZ2dhYmxlKHMsIHBpZWNlKSkge1xuICAgIGNvbnN0IHRvdWNoID0gZS50eXBlID09PSAndG91Y2hzdGFydCc7XG5cbiAgICBzLmRyYWdnYWJsZS5jdXJyZW50ID0ge1xuICAgICAgcGllY2UsXG4gICAgICBwb3M6IHBvc2l0aW9uLFxuICAgICAgb3JpZ1BvczogcG9zaXRpb24sXG4gICAgICBzdGFydGVkOiBzLmRyYWdnYWJsZS5hdXRvRGlzdGFuY2UgJiYgIXRvdWNoLFxuICAgICAgdG91Y2gsXG4gICAgICBvcmlnaW5UYXJnZXQ6IGUudGFyZ2V0LFxuICAgICAgZnJvbUJvYXJkOiB7XG4gICAgICAgIG9yaWcsXG4gICAgICAgIHByZXZpb3VzbHlTZWxlY3RlZCxcbiAgICAgICAga2V5SGFzQ2hhbmdlZDogZmFsc2UsXG4gICAgICB9LFxuICAgIH07XG5cbiAgICBkcmFnZ2VkRWwuc2dDb2xvciA9IHBpZWNlLmNvbG9yO1xuICAgIGRyYWdnZWRFbC5zZ1JvbGUgPSBwaWVjZS5yb2xlO1xuICAgIGRyYWdnZWRFbC5jbGFzc05hbWUgPSBgZHJhZ2dpbmcgJHt1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKX1gO1xuICAgIGRyYWdnZWRFbC5jbGFzc0xpc3QudG9nZ2xlKCd0b3VjaCcsIHRvdWNoKTtcblxuICAgIHByb2Nlc3NEcmFnKHMpO1xuICB9IGVsc2Uge1xuICAgIGlmIChoYWRQcmVtb3ZlKSBib2FyZC51bnNldFByZW1vdmUocyk7XG4gICAgaWYgKGhhZFByZWRyb3ApIGJvYXJkLnVuc2V0UHJlZHJvcChzKTtcbiAgfVxuICBzLmRvbS5yZWRyYXcoKTtcbn1cblxuZnVuY3Rpb24gcGllY2VDbG9zZVRvKHM6IFN0YXRlLCBwb3M6IHNnLk51bWJlclBhaXIsIGJvdW5kczogRE9NUmVjdCk6IGJvb2xlYW4ge1xuICBjb25zdCBhc1NlbnRlID0gdXRpbC5zZW50ZVBvdihzLm9yaWVudGF0aW9uKSxcbiAgICByYWRpdXNTcSA9IE1hdGgucG93KGJvdW5kcy53aWR0aCAvIHMuZGltZW5zaW9ucy5maWxlcywgMik7XG4gIGZvciAoY29uc3Qga2V5IG9mIHMucGllY2VzLmtleXMoKSkge1xuICAgIGNvbnN0IGNlbnRlciA9IHV0aWwuY29tcHV0ZVNxdWFyZUNlbnRlcihrZXksIGFzU2VudGUsIHMuZGltZW5zaW9ucywgYm91bmRzKTtcbiAgICBpZiAodXRpbC5kaXN0YW5jZVNxKGNlbnRlciwgcG9zKSA8PSByYWRpdXNTcSkgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZHJhZ05ld1BpZWNlKHM6IFN0YXRlLCBwaWVjZTogc2cuUGllY2UsIGU6IHNnLk1vdWNoRXZlbnQsIHNwYXJlPzogYm9vbGVhbik6IHZvaWQge1xuICBjb25zdCBwcmV2aW91c2x5U2VsZWN0ZWRQaWVjZSA9IHMuc2VsZWN0ZWRQaWVjZSxcbiAgICBkcmFnZ2VkRWwgPSBzLmRvbS5lbGVtZW50cy5ib2FyZD8uZHJhZ2dlZCxcbiAgICBwb3NpdGlvbiA9IHV0aWwuZXZlbnRQb3NpdGlvbihlKSxcbiAgICB0b3VjaCA9IGUudHlwZSA9PT0gJ3RvdWNoc3RhcnQnO1xuXG4gIGlmICghcHJldmlvdXNseVNlbGVjdGVkUGllY2UgJiYgIXNwYXJlICYmIHMuZHJhd2FibGUuZW5hYmxlZCAmJiBzLmRyYXdhYmxlLmVyYXNlT25DbGljaylcbiAgICBkcmF3Q2xlYXIocyk7XG5cbiAgaWYgKCFzcGFyZSAmJiBzLnNlbGVjdGFibGUuZGVsZXRlT25Ub3VjaCkgcmVtb3ZlRnJvbUhhbmQocywgcGllY2UpO1xuICBlbHNlIGJvYXJkLnNlbGVjdFBpZWNlKHMsIHBpZWNlLCBzcGFyZSk7XG5cbiAgY29uc3QgaGFkUHJlbW92ZSA9ICEhcy5wcmVtb3ZhYmxlLmN1cnJlbnQsXG4gICAgaGFkUHJlZHJvcCA9ICEhcy5wcmVkcm9wcGFibGUuY3VycmVudCxcbiAgICBzdGlsbFNlbGVjdGVkID0gcy5zZWxlY3RlZFBpZWNlICYmIHV0aWwuc2FtZVBpZWNlKHMuc2VsZWN0ZWRQaWVjZSwgcGllY2UpO1xuXG4gIGlmIChkcmFnZ2VkRWwgJiYgcG9zaXRpb24gJiYgcy5zZWxlY3RlZFBpZWNlICYmIHN0aWxsU2VsZWN0ZWQgJiYgYm9hcmQuaXNEcmFnZ2FibGUocywgcGllY2UpKSB7XG4gICAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHtcbiAgICAgIHBpZWNlOiBzLnNlbGVjdGVkUGllY2UsXG4gICAgICBwb3M6IHBvc2l0aW9uLFxuICAgICAgb3JpZ1BvczogcG9zaXRpb24sXG4gICAgICB0b3VjaCxcbiAgICAgIHN0YXJ0ZWQ6IHMuZHJhZ2dhYmxlLmF1dG9EaXN0YW5jZSAmJiAhdG91Y2gsXG4gICAgICBvcmlnaW5UYXJnZXQ6IGUudGFyZ2V0LFxuICAgICAgZnJvbU91dHNpZGU6IHtcbiAgICAgICAgb3JpZ2luQm91bmRzOiAhc3BhcmVcbiAgICAgICAgICA/IHMuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcygpLmdldCh1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKSlcbiAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgbGVmdE9yaWdpbjogZmFsc2UsXG4gICAgICAgIHByZXZpb3VzbHlTZWxlY3RlZFBpZWNlOiAhc3BhcmUgPyBwcmV2aW91c2x5U2VsZWN0ZWRQaWVjZSA6IHVuZGVmaW5lZCxcbiAgICAgIH0sXG4gICAgfTtcblxuICAgIGRyYWdnZWRFbC5zZ0NvbG9yID0gcGllY2UuY29sb3I7XG4gICAgZHJhZ2dlZEVsLnNnUm9sZSA9IHBpZWNlLnJvbGU7XG4gICAgZHJhZ2dlZEVsLmNsYXNzTmFtZSA9IGBkcmFnZ2luZyAke3V0aWwucGllY2VOYW1lT2YocGllY2UpfWA7XG4gICAgZHJhZ2dlZEVsLmNsYXNzTGlzdC50b2dnbGUoJ3RvdWNoJywgdG91Y2gpO1xuXG4gICAgcHJvY2Vzc0RyYWcocyk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGhhZFByZW1vdmUpIGJvYXJkLnVuc2V0UHJlbW92ZShzKTtcbiAgICBpZiAoaGFkUHJlZHJvcCkgYm9hcmQudW5zZXRQcmVkcm9wKHMpO1xuICB9XG4gIHMuZG9tLnJlZHJhdygpO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzRHJhZyhzOiBTdGF0ZSk6IHZvaWQge1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIGNvbnN0IGN1ciA9IHMuZHJhZ2dhYmxlLmN1cnJlbnQsXG4gICAgICBkcmFnZ2VkRWwgPSBzLmRvbS5lbGVtZW50cy5ib2FyZD8uZHJhZ2dlZCxcbiAgICAgIGJvdW5kcyA9IHMuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKTtcbiAgICBpZiAoIWN1ciB8fCAhZHJhZ2dlZEVsIHx8ICFib3VuZHMpIHJldHVybjtcbiAgICAvLyBjYW5jZWwgYW5pbWF0aW9ucyB3aGlsZSBkcmFnZ2luZ1xuICAgIGlmIChjdXIuZnJvbUJvYXJkPy5vcmlnICYmIHMuYW5pbWF0aW9uLmN1cnJlbnQ/LnBsYW4uYW5pbXMuaGFzKGN1ci5mcm9tQm9hcmQub3JpZykpXG4gICAgICBzLmFuaW1hdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIC8vIGlmIG1vdmluZyBwaWVjZSBpcyBnb25lLCBjYW5jZWxcbiAgICBjb25zdCBvcmlnUGllY2UgPSBjdXIuZnJvbUJvYXJkID8gcy5waWVjZXMuZ2V0KGN1ci5mcm9tQm9hcmQub3JpZykgOiBjdXIucGllY2U7XG4gICAgaWYgKCFvcmlnUGllY2UgfHwgIXV0aWwuc2FtZVBpZWNlKG9yaWdQaWVjZSwgY3VyLnBpZWNlKSkgY2FuY2VsKHMpO1xuICAgIGVsc2Uge1xuICAgICAgaWYgKFxuICAgICAgICAhY3VyLnN0YXJ0ZWQgJiZcbiAgICAgICAgdXRpbC5kaXN0YW5jZVNxKGN1ci5wb3MsIGN1ci5vcmlnUG9zKSA+PSBNYXRoLnBvdyhzLmRyYWdnYWJsZS5kaXN0YW5jZSwgMilcbiAgICAgICkge1xuICAgICAgICBjdXIuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgIHMuZG9tLnJlZHJhdygpO1xuICAgICAgfVxuICAgICAgaWYgKGN1ci5zdGFydGVkKSB7XG4gICAgICAgIHV0aWwudHJhbnNsYXRlQWJzKFxuICAgICAgICAgIGRyYWdnZWRFbCxcbiAgICAgICAgICBbXG4gICAgICAgICAgICBjdXIucG9zWzBdIC0gYm91bmRzLmxlZnQgLSBib3VuZHMud2lkdGggLyAocy5kaW1lbnNpb25zLmZpbGVzICogMiksXG4gICAgICAgICAgICBjdXIucG9zWzFdIC0gYm91bmRzLnRvcCAtIGJvdW5kcy5oZWlnaHQgLyAocy5kaW1lbnNpb25zLnJhbmtzICogMiksXG4gICAgICAgICAgXSxcbiAgICAgICAgICBzLnNjYWxlRG93blBpZWNlcyA/IDAuNSA6IDEsXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKCFkcmFnZ2VkRWwuc2dEcmFnZ2luZykge1xuICAgICAgICAgIGRyYWdnZWRFbC5zZ0RyYWdnaW5nID0gdHJ1ZTtcbiAgICAgICAgICB1dGlsLnNldERpc3BsYXkoZHJhZ2dlZEVsLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBob3ZlciA9IHV0aWwuZ2V0S2V5QXREb21Qb3MoXG4gICAgICAgICAgY3VyLnBvcyxcbiAgICAgICAgICB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pLFxuICAgICAgICAgIHMuZGltZW5zaW9ucyxcbiAgICAgICAgICBib3VuZHMsXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKGN1ci5mcm9tQm9hcmQpXG4gICAgICAgICAgY3VyLmZyb21Cb2FyZC5rZXlIYXNDaGFuZ2VkID0gY3VyLmZyb21Cb2FyZC5rZXlIYXNDaGFuZ2VkIHx8IGN1ci5mcm9tQm9hcmQub3JpZyAhPT0gaG92ZXI7XG4gICAgICAgIGVsc2UgaWYgKGN1ci5mcm9tT3V0c2lkZSlcbiAgICAgICAgICBjdXIuZnJvbU91dHNpZGUubGVmdE9yaWdpbiA9XG4gICAgICAgICAgICBjdXIuZnJvbU91dHNpZGUubGVmdE9yaWdpbiB8fFxuICAgICAgICAgICAgKCEhY3VyLmZyb21PdXRzaWRlLm9yaWdpbkJvdW5kcyAmJlxuICAgICAgICAgICAgICAhdXRpbC5pc0luc2lkZVJlY3QoY3VyLmZyb21PdXRzaWRlLm9yaWdpbkJvdW5kcywgY3VyLnBvcykpO1xuXG4gICAgICAgIC8vIGlmIHRoZSBob3ZlcmVkIHNxdWFyZSBjaGFuZ2VkXG4gICAgICAgIGlmIChob3ZlciAhPT0gcy5ob3ZlcmVkKSB7XG4gICAgICAgICAgdXBkYXRlSG92ZXJlZFNxdWFyZXMocywgaG92ZXIpO1xuICAgICAgICAgIGlmIChjdXIudG91Y2ggJiYgcy5kb20uZWxlbWVudHMuYm9hcmQ/LnNxdWFyZU92ZXIpIHtcbiAgICAgICAgICAgIGlmIChob3ZlciAmJiBzLmRyYWdnYWJsZS5zaG93VG91Y2hTcXVhcmVPdmVybGF5KSB7XG4gICAgICAgICAgICAgIHV0aWwudHJhbnNsYXRlQWJzKFxuICAgICAgICAgICAgICAgIHMuZG9tLmVsZW1lbnRzLmJvYXJkLnNxdWFyZU92ZXIsXG4gICAgICAgICAgICAgICAgdXRpbC5wb3NUb1RyYW5zbGF0ZUFicyhzLmRpbWVuc2lvbnMsIGJvdW5kcykoXG4gICAgICAgICAgICAgICAgICB1dGlsLmtleTJwb3MoaG92ZXIpLFxuICAgICAgICAgICAgICAgICAgdXRpbC5zZW50ZVBvdihzLm9yaWVudGF0aW9uKSxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIHV0aWwuc2V0RGlzcGxheShzLmRvbS5lbGVtZW50cy5ib2FyZC5zcXVhcmVPdmVyLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHV0aWwuc2V0RGlzcGxheShzLmRvbS5lbGVtZW50cy5ib2FyZC5zcXVhcmVPdmVyLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHByb2Nlc3NEcmFnKHMpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmUoczogU3RhdGUsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgLy8gc3VwcG9ydCBvbmUgZmluZ2VyIHRvdWNoIG9ubHlcbiAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQgJiYgKCFlLnRvdWNoZXMgfHwgZS50b3VjaGVzLmxlbmd0aCA8IDIpKSB7XG4gICAgcy5kcmFnZ2FibGUuY3VycmVudC5wb3MgPSB1dGlsLmV2ZW50UG9zaXRpb24oZSkhO1xuICB9IGVsc2UgaWYgKFxuICAgIChzLnNlbGVjdGVkIHx8IHMuc2VsZWN0ZWRQaWVjZSB8fCBzLmhpZ2hsaWdodC5ob3ZlcmVkKSAmJlxuICAgICFzLmRyYWdnYWJsZS5jdXJyZW50ICYmXG4gICAgKCFlLnRvdWNoZXMgfHwgZS50b3VjaGVzLmxlbmd0aCA8IDIpXG4gICkge1xuICAgIGNvbnN0IGJvdW5kcyA9IHMuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKSxcbiAgICAgIGhvdmVyID1cbiAgICAgICAgYm91bmRzICYmXG4gICAgICAgIHV0aWwuZ2V0S2V5QXREb21Qb3MoXG4gICAgICAgICAgdXRpbC5ldmVudFBvc2l0aW9uKGUpISxcbiAgICAgICAgICB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pLFxuICAgICAgICAgIHMuZGltZW5zaW9ucyxcbiAgICAgICAgICBib3VuZHMsXG4gICAgICAgICk7XG4gICAgaWYgKGhvdmVyICE9PSBzLmhvdmVyZWQpIHVwZGF0ZUhvdmVyZWRTcXVhcmVzKHMsIGhvdmVyKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5kKHM6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHMuZHJhZ2dhYmxlLmN1cnJlbnQ7XG4gIGlmICghY3VyKSByZXR1cm47XG4gIC8vIGNyZWF0ZSBubyBjb3JyZXNwb25kaW5nIG1vdXNlIGV2ZW50XG4gIGlmIChlLnR5cGUgPT09ICd0b3VjaGVuZCcgJiYgZS5jYW5jZWxhYmxlICE9PSBmYWxzZSkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAvLyBjb21wYXJpbmcgd2l0aCB0aGUgb3JpZ2luIHRhcmdldCBpcyBhbiBlYXN5IHdheSB0byB0ZXN0IHRoYXQgdGhlIGVuZCBldmVudFxuICAvLyBoYXMgdGhlIHNhbWUgdG91Y2ggb3JpZ2luXG4gIGlmIChlLnR5cGUgPT09ICd0b3VjaGVuZCcgJiYgY3VyLm9yaWdpblRhcmdldCAhPT0gZS50YXJnZXQgJiYgIWN1ci5mcm9tT3V0c2lkZSkge1xuICAgIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgaWYgKHMuaG92ZXJlZCAmJiAhcy5oaWdobGlnaHQuaG92ZXJlZCkgdXBkYXRlSG92ZXJlZFNxdWFyZXMocywgdW5kZWZpbmVkKTtcbiAgICByZXR1cm47XG4gIH1cbiAgYm9hcmQudW5zZXRQcmVtb3ZlKHMpO1xuICBib2FyZC51bnNldFByZWRyb3Aocyk7XG4gIC8vIHRvdWNoZW5kIGhhcyBubyBwb3NpdGlvbjsgc28gdXNlIHRoZSBsYXN0IHRvdWNobW92ZSBwb3NpdGlvbiBpbnN0ZWFkXG4gIGNvbnN0IGV2ZW50UG9zID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpIHx8IGN1ci5wb3MsXG4gICAgYm91bmRzID0gcy5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpLFxuICAgIGRlc3QgPVxuICAgICAgYm91bmRzICYmIHV0aWwuZ2V0S2V5QXREb21Qb3MoZXZlbnRQb3MsIHV0aWwuc2VudGVQb3Yocy5vcmllbnRhdGlvbiksIHMuZGltZW5zaW9ucywgYm91bmRzKTtcblxuICBpZiAoZGVzdCAmJiBjdXIuc3RhcnRlZCAmJiBjdXIuZnJvbUJvYXJkPy5vcmlnICE9PSBkZXN0KSB7XG4gICAgaWYgKGN1ci5mcm9tT3V0c2lkZSAmJiAhYm9hcmQucHJvbW90aW9uRGlhbG9nRHJvcChzLCBjdXIucGllY2UsIGRlc3QpKVxuICAgICAgYm9hcmQudXNlckRyb3AocywgY3VyLnBpZWNlLCBkZXN0KTtcbiAgICBlbHNlIGlmIChjdXIuZnJvbUJvYXJkICYmICFib2FyZC5wcm9tb3Rpb25EaWFsb2dNb3ZlKHMsIGN1ci5mcm9tQm9hcmQub3JpZywgZGVzdCkpXG4gICAgICBib2FyZC51c2VyTW92ZShzLCBjdXIuZnJvbUJvYXJkLm9yaWcsIGRlc3QpO1xuICB9IGVsc2UgaWYgKHMuZHJhZ2dhYmxlLmRlbGV0ZU9uRHJvcE9mZiAmJiAhZGVzdCkge1xuICAgIGlmIChjdXIuZnJvbUJvYXJkKSBzLnBpZWNlcy5kZWxldGUoY3VyLmZyb21Cb2FyZC5vcmlnKTtcbiAgICBlbHNlIGlmIChjdXIuZnJvbU91dHNpZGUgJiYgIXMuZHJvcHBhYmxlLnNwYXJlKSByZW1vdmVGcm9tSGFuZChzLCBjdXIucGllY2UpO1xuXG4gICAgaWYgKHMuZHJhZ2dhYmxlLmFkZFRvSGFuZE9uRHJvcE9mZikge1xuICAgICAgY29uc3QgaGFuZEJvdW5kcyA9IHMuZG9tLmJvdW5kcy5oYW5kcy5ib3VuZHMoKSxcbiAgICAgICAgaGFuZEJvdW5kc1RvcCA9IGhhbmRCb3VuZHMuZ2V0KCd0b3AnKSxcbiAgICAgICAgaGFuZEJvdW5kc0JvdHRvbSA9IGhhbmRCb3VuZHMuZ2V0KCdib3R0b20nKTtcbiAgICAgIGlmIChoYW5kQm91bmRzVG9wICYmIHV0aWwuaXNJbnNpZGVSZWN0KGhhbmRCb3VuZHNUb3AsIGN1ci5wb3MpKVxuICAgICAgICBhZGRUb0hhbmQocywgeyBjb2xvcjogdXRpbC5vcHBvc2l0ZShzLm9yaWVudGF0aW9uKSwgcm9sZTogY3VyLnBpZWNlLnJvbGUgfSk7XG4gICAgICBlbHNlIGlmIChoYW5kQm91bmRzQm90dG9tICYmIHV0aWwuaXNJbnNpZGVSZWN0KGhhbmRCb3VuZHNCb3R0b20sIGN1ci5wb3MpKVxuICAgICAgICBhZGRUb0hhbmQocywgeyBjb2xvcjogcy5vcmllbnRhdGlvbiwgcm9sZTogY3VyLnBpZWNlLnJvbGUgfSk7XG5cbiAgICAgIGJvYXJkLnVuc2VsZWN0KHMpO1xuICAgIH1cbiAgICB1dGlsLmNhbGxVc2VyRnVuY3Rpb24ocy5ldmVudHMuY2hhbmdlKTtcbiAgfVxuXG4gIGlmIChcbiAgICBjdXIuZnJvbUJvYXJkICYmXG4gICAgKGN1ci5mcm9tQm9hcmQub3JpZyA9PT0gY3VyLmZyb21Cb2FyZC5wcmV2aW91c2x5U2VsZWN0ZWQgfHwgY3VyLmZyb21Cb2FyZC5rZXlIYXNDaGFuZ2VkKSAmJlxuICAgIChjdXIuZnJvbUJvYXJkLm9yaWcgPT09IGRlc3QgfHwgIWRlc3QpXG4gICkge1xuICAgIHVuc2VsZWN0KHMsIGN1ciwgZGVzdCk7XG4gIH0gZWxzZSBpZiAoXG4gICAgKCFkZXN0ICYmIGN1ci5mcm9tT3V0c2lkZT8ubGVmdE9yaWdpbikgfHxcbiAgICAoY3VyLmZyb21PdXRzaWRlPy5vcmlnaW5Cb3VuZHMgJiZcbiAgICAgIHV0aWwuaXNJbnNpZGVSZWN0KGN1ci5mcm9tT3V0c2lkZS5vcmlnaW5Cb3VuZHMsIGN1ci5wb3MpICYmXG4gICAgICBjdXIuZnJvbU91dHNpZGUucHJldmlvdXNseVNlbGVjdGVkUGllY2UgJiZcbiAgICAgIHV0aWwuc2FtZVBpZWNlKGN1ci5mcm9tT3V0c2lkZS5wcmV2aW91c2x5U2VsZWN0ZWRQaWVjZSwgY3VyLnBpZWNlKSlcbiAgKSB7XG4gICAgdW5zZWxlY3QocywgY3VyLCBkZXN0KTtcbiAgfSBlbHNlIGlmICghcy5zZWxlY3RhYmxlLmVuYWJsZWQgJiYgIXMucHJvbW90aW9uLmN1cnJlbnQpIHtcbiAgICB1bnNlbGVjdChzLCBjdXIsIGRlc3QpO1xuICB9XG5cbiAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgaWYgKCFzLmhpZ2hsaWdodC5ob3ZlcmVkICYmICFzLnByb21vdGlvbi5jdXJyZW50KSBzLmhvdmVyZWQgPSB1bmRlZmluZWQ7XG4gIHMuZG9tLnJlZHJhdygpO1xufVxuXG5mdW5jdGlvbiB1bnNlbGVjdChzOiBTdGF0ZSwgY3VyOiBEcmFnQ3VycmVudCwgZGVzdD86IHNnLktleSk6IHZvaWQge1xuICBpZiAoY3VyLmZyb21Cb2FyZCAmJiBjdXIuZnJvbUJvYXJkLm9yaWcgPT09IGRlc3QpXG4gICAgdXRpbC5jYWxsVXNlckZ1bmN0aW9uKHMuZXZlbnRzLnVuc2VsZWN0LCBjdXIuZnJvbUJvYXJkLm9yaWcpO1xuICBlbHNlIGlmIChcbiAgICBjdXIuZnJvbU91dHNpZGU/Lm9yaWdpbkJvdW5kcyAmJlxuICAgIHV0aWwuaXNJbnNpZGVSZWN0KGN1ci5mcm9tT3V0c2lkZS5vcmlnaW5Cb3VuZHMsIGN1ci5wb3MpXG4gIClcbiAgICB1dGlsLmNhbGxVc2VyRnVuY3Rpb24ocy5ldmVudHMucGllY2VVbnNlbGVjdCwgY3VyLnBpZWNlKTtcbiAgYm9hcmQudW5zZWxlY3Qocyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWwoczogU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQpIHtcbiAgICBzLmRyYWdnYWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGlmICghcy5oaWdobGlnaHQuaG92ZXJlZCkgcy5ob3ZlcmVkID0gdW5kZWZpbmVkO1xuICAgIGJvYXJkLnVuc2VsZWN0KHMpO1xuICAgIHMuZG9tLnJlZHJhdygpO1xuICB9XG59XG5cbi8vIHN1cHBvcnQgb25lIGZpbmdlciB0b3VjaCBvbmx5IG9yIGxlZnQgY2xpY2tcbmV4cG9ydCBmdW5jdGlvbiB1bndhbnRlZEV2ZW50KGU6IHNnLk1vdWNoRXZlbnQpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICAhZS5pc1RydXN0ZWQgfHxcbiAgICAoZS5idXR0b24gIT09IHVuZGVmaW5lZCAmJiBlLmJ1dHRvbiAhPT0gMCkgfHxcbiAgICAoISFlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDEpXG4gICk7XG59XG5cbmZ1bmN0aW9uIHZhbGlkRGVzdFRvSG92ZXIoczogU3RhdGUsIGtleTogc2cuS2V5KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgKCEhcy5zZWxlY3RlZCAmJiAoYm9hcmQuY2FuTW92ZShzLCBzLnNlbGVjdGVkLCBrZXkpIHx8IGJvYXJkLmNhblByZW1vdmUocywgcy5zZWxlY3RlZCwga2V5KSkpIHx8XG4gICAgKCEhcy5zZWxlY3RlZFBpZWNlICYmXG4gICAgICAoYm9hcmQuY2FuRHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIGtleSkgfHwgYm9hcmQuY2FuUHJlZHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIGtleSkpKVxuICApO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVIb3ZlcmVkU3F1YXJlcyhzOiBTdGF0ZSwga2V5OiBzZy5LZXkgfCB1bmRlZmluZWQpOiB2b2lkIHtcbiAgY29uc3Qgc3FhdXJlRWxzID0gcy5kb20uZWxlbWVudHMuYm9hcmQ/LnNxdWFyZXMuY2hpbGRyZW47XG4gIGlmICghc3FhdXJlRWxzIHx8IHMucHJvbW90aW9uLmN1cnJlbnQpIHJldHVybjtcblxuICBjb25zdCBwcmV2SG92ZXIgPSBzLmhvdmVyZWQ7XG4gIGlmIChzLmhpZ2hsaWdodC5ob3ZlcmVkIHx8IChrZXkgJiYgdmFsaWREZXN0VG9Ib3ZlcihzLCBrZXkpKSkgcy5ob3ZlcmVkID0ga2V5O1xuICBlbHNlIHMuaG92ZXJlZCA9IHVuZGVmaW5lZDtcblxuICBjb25zdCBhc1NlbnRlID0gdXRpbC5zZW50ZVBvdihzLm9yaWVudGF0aW9uKSxcbiAgICBjdXJJbmRleCA9IHMuaG92ZXJlZCAmJiB1dGlsLmRvbVNxdWFyZUluZGV4T2ZLZXkocy5ob3ZlcmVkLCBhc1NlbnRlLCBzLmRpbWVuc2lvbnMpLFxuICAgIGN1ckhvdmVyRWwgPSBjdXJJbmRleCAhPT0gdW5kZWZpbmVkICYmIHNxYXVyZUVsc1tjdXJJbmRleF07XG4gIGlmIChjdXJIb3ZlckVsKSBjdXJIb3ZlckVsLmNsYXNzTGlzdC5hZGQoJ2hvdmVyJyk7XG5cbiAgY29uc3QgcHJldkluZGV4ID0gcHJldkhvdmVyICYmIHV0aWwuZG9tU3F1YXJlSW5kZXhPZktleShwcmV2SG92ZXIsIGFzU2VudGUsIHMuZGltZW5zaW9ucyksXG4gICAgcHJldkhvdmVyRWwgPSBwcmV2SW5kZXggIT09IHVuZGVmaW5lZCAmJiBzcWF1cmVFbHNbcHJldkluZGV4XTtcbiAgaWYgKHByZXZIb3ZlckVsKSBwcmV2SG92ZXJFbC5jbGFzc0xpc3QucmVtb3ZlKCdob3ZlcicpO1xufVxuIiwgImltcG9ydCB0eXBlIHsgTm90YXRpb24gfSBmcm9tICcuL3R5cGVzLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNvb3Jkcyhub3RhdGlvbjogTm90YXRpb24pOiBzdHJpbmdbXSB7XG4gIHN3aXRjaCAobm90YXRpb24pIHtcbiAgICBjYXNlICdkaXpoaSc6XG4gICAgICByZXR1cm4gW1xuICAgICAgICAnJyxcbiAgICAgICAgJycsXG4gICAgICAgICcnLFxuICAgICAgICAnJyxcbiAgICAgICAgJ+S6pScsXG4gICAgICAgICfmiIwnLFxuICAgICAgICAn6YWJJyxcbiAgICAgICAgJ+eUsycsXG4gICAgICAgICfmnKonLFxuICAgICAgICAn5Y2IJyxcbiAgICAgICAgJ+W3sycsXG4gICAgICAgICfovrAnLFxuICAgICAgICAn5Y2vJyxcbiAgICAgICAgJ+WvhScsXG4gICAgICAgICfkuJEnLFxuICAgICAgICAn5a2QJyxcbiAgICAgIF07XG4gICAgY2FzZSAnamFwYW5lc2UnOlxuICAgICAgcmV0dXJuIFtcbiAgICAgICAgJ+WNgeWFrScsXG4gICAgICAgICfljYHkupQnLFxuICAgICAgICAn5Y2B5ZubJyxcbiAgICAgICAgJ+WNgeS4iScsXG4gICAgICAgICfljYHkuownLFxuICAgICAgICAn5Y2B5LiAJyxcbiAgICAgICAgJ+WNgScsXG4gICAgICAgICfkuZ0nLFxuICAgICAgICAn5YWrJyxcbiAgICAgICAgJ+S4gycsXG4gICAgICAgICflha0nLFxuICAgICAgICAn5LqUJyxcbiAgICAgICAgJ+WbmycsXG4gICAgICAgICfkuIknLFxuICAgICAgICAn5LqMJyxcbiAgICAgICAgJ+S4gCcsXG4gICAgICBdO1xuICAgIGNhc2UgJ2VuZ2luZSc6XG4gICAgICByZXR1cm4gWydwJywgJ28nLCAnbicsICdtJywgJ2wnLCAnaycsICdqJywgJ2knLCAnaCcsICdnJywgJ2YnLCAnZScsICdkJywgJ2MnLCAnYicsICdhJ107XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldHVybiBbJzEwJywgJ2YnLCAnZScsICdkJywgJ2MnLCAnYicsICdhJywgJzknLCAnOCcsICc3JywgJzYnLCAnNScsICc0JywgJzMnLCAnMicsICcxJ107XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBbXG4gICAgICAgICcxNicsXG4gICAgICAgICcxNScsXG4gICAgICAgICcxNCcsXG4gICAgICAgICcxMycsXG4gICAgICAgICcxMicsXG4gICAgICAgICcxMScsXG4gICAgICAgICcxMCcsXG4gICAgICAgICc5JyxcbiAgICAgICAgJzgnLFxuICAgICAgICAnNycsXG4gICAgICAgICc2JyxcbiAgICAgICAgJzUnLFxuICAgICAgICAnNCcsXG4gICAgICAgICczJyxcbiAgICAgICAgJzInLFxuICAgICAgICAnMScsXG4gICAgICBdO1xuICB9XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUge1xuICBEaW1lbnNpb25zLFxuICBTcXVhcmVOb2RlLFxuICBDb2xvcixcbiAgUGllY2VOb2RlLFxuICBSb2xlU3RyaW5nLFxuICBIYW5kRWxlbWVudHMsXG4gIEJvYXJkRWxlbWVudHMsXG59IGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgY29sb3JzIH0gZnJvbSAnLi9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgY3JlYXRlRWwsIG9wcG9zaXRlLCBwaWVjZU5hbWVPZiwgcG9zMmtleSwgc2V0RGlzcGxheSB9IGZyb20gJy4vdXRpbC5qcyc7XG5pbXBvcnQgeyBjcmVhdGVTVkdFbGVtZW50LCBzZXRBdHRyaWJ1dGVzIH0gZnJvbSAnLi9zaGFwZXMuanMnO1xuaW1wb3J0IHsgY29vcmRzIH0gZnJvbSAnLi9jb29yZHMuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gd3JhcEJvYXJkKGJvYXJkV3JhcDogSFRNTEVsZW1lbnQsIHM6IFN0YXRlKTogQm9hcmRFbGVtZW50cyB7XG4gIC8vIC5zZy13cmFwIChlbGVtZW50IHBhc3NlZCB0byBTaG9naWdyb3VuZClcbiAgLy8gICAgIHNnLWhhbmQtd3JhcFxuICAvLyAgICAgc2ctYm9hcmRcbiAgLy8gICAgICAgc2ctc3F1YXJlc1xuICAvLyAgICAgICBzZy1waWVjZXNcbiAgLy8gICAgICAgcGllY2UgZHJhZ2dpbmdcbiAgLy8gICAgICAgc2ctcHJvbW90aW9uXG4gIC8vICAgICAgIHNnLXNxdWFyZS1vdmVyXG4gIC8vICAgICAgIHN2Zy5zZy1zaGFwZXNcbiAgLy8gICAgICAgICBkZWZzXG4gIC8vICAgICAgICAgZ1xuICAvLyAgICAgICBzdmcuc2ctY3VzdG9tLXN2Z3NcbiAgLy8gICAgICAgICBnXG4gIC8vICAgICBzZy1oYW5kLXdyYXBcbiAgLy8gICAgIHNnLWZyZWUtcGllY2VzXG4gIC8vICAgICAgIGNvb3Jkcy5yYW5rc1xuICAvLyAgICAgICBjb29yZHMuZmlsZXNcblxuICBjb25zdCBib2FyZCA9IGNyZWF0ZUVsKCdzZy1ib2FyZCcpO1xuXG4gIGNvbnN0IHNxdWFyZXMgPSByZW5kZXJTcXVhcmVzKHMuZGltZW5zaW9ucywgcy5vcmllbnRhdGlvbik7XG4gIGJvYXJkLmFwcGVuZENoaWxkKHNxdWFyZXMpO1xuXG4gIGNvbnN0IHBpZWNlcyA9IGNyZWF0ZUVsKCdzZy1waWVjZXMnKTtcbiAgYm9hcmQuYXBwZW5kQ2hpbGQocGllY2VzKTtcblxuICBsZXQgZHJhZ2dlZCwgcHJvbW90aW9uLCBzcXVhcmVPdmVyO1xuICBpZiAoIXMudmlld09ubHkpIHtcbiAgICBkcmFnZ2VkID0gY3JlYXRlRWwoJ3BpZWNlJykgYXMgUGllY2VOb2RlO1xuICAgIHNldERpc3BsYXkoZHJhZ2dlZCwgZmFsc2UpO1xuICAgIGJvYXJkLmFwcGVuZENoaWxkKGRyYWdnZWQpO1xuXG4gICAgcHJvbW90aW9uID0gY3JlYXRlRWwoJ3NnLXByb21vdGlvbicpO1xuICAgIHNldERpc3BsYXkocHJvbW90aW9uLCBmYWxzZSk7XG4gICAgYm9hcmQuYXBwZW5kQ2hpbGQocHJvbW90aW9uKTtcblxuICAgIHNxdWFyZU92ZXIgPSBjcmVhdGVFbCgnc2ctc3F1YXJlLW92ZXInKTtcbiAgICBzZXREaXNwbGF5KHNxdWFyZU92ZXIsIGZhbHNlKTtcbiAgICBib2FyZC5hcHBlbmRDaGlsZChzcXVhcmVPdmVyKTtcbiAgfVxuXG4gIGxldCBzaGFwZXM7XG4gIGlmIChzLmRyYXdhYmxlLnZpc2libGUpIHtcbiAgICBjb25zdCBzdmcgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ3N2ZycpLCB7XG4gICAgICBjbGFzczogJ3NnLXNoYXBlcycsXG4gICAgICB2aWV3Qm94OiBgLSR7cy5zcXVhcmVSYXRpb1swXSAvIDJ9IC0ke3Muc3F1YXJlUmF0aW9bMV0gLyAyfSAke3MuZGltZW5zaW9ucy5maWxlcyAqIHMuc3F1YXJlUmF0aW9bMF19ICR7XG4gICAgICAgIHMuZGltZW5zaW9ucy5yYW5rcyAqIHMuc3F1YXJlUmF0aW9bMV1cbiAgICAgIH1gLFxuICAgIH0pO1xuICAgIHN2Zy5hcHBlbmRDaGlsZChjcmVhdGVTVkdFbGVtZW50KCdkZWZzJykpO1xuICAgIHN2Zy5hcHBlbmRDaGlsZChjcmVhdGVTVkdFbGVtZW50KCdnJykpO1xuXG4gICAgY29uc3QgY3VzdG9tU3ZnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdzdmcnKSwge1xuICAgICAgY2xhc3M6ICdzZy1jdXN0b20tc3ZncycsXG4gICAgICB2aWV3Qm94OiBgMCAwICR7cy5kaW1lbnNpb25zLmZpbGVzICogcy5zcXVhcmVSYXRpb1swXX0gJHtzLmRpbWVuc2lvbnMucmFua3MgKiBzLnNxdWFyZVJhdGlvWzFdfWAsXG4gICAgfSk7XG4gICAgY3VzdG9tU3ZnLmFwcGVuZENoaWxkKGNyZWF0ZVNWR0VsZW1lbnQoJ2cnKSk7XG5cbiAgICBjb25zdCBmcmVlUGllY2VzID0gY3JlYXRlRWwoJ3NnLWZyZWUtcGllY2VzJyk7XG5cbiAgICBib2FyZC5hcHBlbmRDaGlsZChzdmcpO1xuICAgIGJvYXJkLmFwcGVuZENoaWxkKGN1c3RvbVN2Zyk7XG4gICAgYm9hcmQuYXBwZW5kQ2hpbGQoZnJlZVBpZWNlcyk7XG5cbiAgICBzaGFwZXMgPSB7XG4gICAgICBzdmcsXG4gICAgICBmcmVlUGllY2VzLFxuICAgICAgY3VzdG9tU3ZnLFxuICAgIH07XG4gIH1cblxuICBpZiAocy5jb29yZGluYXRlcy5lbmFibGVkKSB7XG4gICAgY29uc3Qgb3JpZW50Q2xhc3MgPSBzLm9yaWVudGF0aW9uID09PSAnZ290ZScgPyAnIGdvdGUnIDogJycsXG4gICAgICByYW5rcyA9IGNvb3JkcyhzLmNvb3JkaW5hdGVzLnJhbmtzKSxcbiAgICAgIGZpbGVzID0gY29vcmRzKHMuY29vcmRpbmF0ZXMuZmlsZXMpO1xuICAgIGJvYXJkLmFwcGVuZENoaWxkKHJlbmRlckNvb3JkcyhyYW5rcywgJ3JhbmtzJyArIG9yaWVudENsYXNzLCBzLmRpbWVuc2lvbnMucmFua3MpKTtcbiAgICBib2FyZC5hcHBlbmRDaGlsZChyZW5kZXJDb29yZHMoZmlsZXMsICdmaWxlcycgKyBvcmllbnRDbGFzcywgcy5kaW1lbnNpb25zLmZpbGVzKSk7XG4gIH1cblxuICBib2FyZFdyYXAuaW5uZXJIVE1MID0gJyc7XG5cbiAgY29uc3QgZGltQ2xzID0gYGQtJHtzLmRpbWVuc2lvbnMuZmlsZXN9eCR7cy5kaW1lbnNpb25zLnJhbmtzfWA7XG5cbiAgLy8gcmVtb3ZlIGFsbCBvdGhlciBkaW1lbnNpb24gY2xhc3Nlc1xuICBib2FyZFdyYXAuY2xhc3NMaXN0LmZvckVhY2goKGMpID0+IHtcbiAgICBpZiAoYy5zdWJzdHJpbmcoMCwgMikgPT09ICdkLScgJiYgYyAhPT0gZGltQ2xzKSBib2FyZFdyYXAuY2xhc3NMaXN0LnJlbW92ZShjKTtcbiAgfSk7XG5cbiAgLy8gZW5zdXJlIHRoZSBzZy13cmFwIGNsYXNzIGFuZCBkaW1lbnNpb25zIGNsYXNzIGlzIHNldCBiZWZvcmVoYW5kIHRvIGF2b2lkIHJlY29tcHV0aW5nIHN0eWxlc1xuICBib2FyZFdyYXAuY2xhc3NMaXN0LmFkZCgnc2ctd3JhcCcsIGRpbUNscyk7XG5cbiAgZm9yIChjb25zdCBjIG9mIGNvbG9ycykgYm9hcmRXcmFwLmNsYXNzTGlzdC50b2dnbGUoJ29yaWVudGF0aW9uLScgKyBjLCBzLm9yaWVudGF0aW9uID09PSBjKTtcbiAgYm9hcmRXcmFwLmNsYXNzTGlzdC50b2dnbGUoJ21hbmlwdWxhYmxlJywgIXMudmlld09ubHkpO1xuXG4gIGJvYXJkV3JhcC5hcHBlbmRDaGlsZChib2FyZCk7XG5cbiAgbGV0IGhhbmRzOiBIYW5kRWxlbWVudHMgfCB1bmRlZmluZWQ7XG4gIGlmIChzLmhhbmRzLmlubGluZWQpIHtcbiAgICBjb25zdCBoYW5kV3JhcFRvcCA9IGNyZWF0ZUVsKCdzZy1oYW5kLXdyYXAnLCAnaW5saW5lZCcpLFxuICAgICAgaGFuZFdyYXBCb3R0b20gPSBjcmVhdGVFbCgnc2ctaGFuZC13cmFwJywgJ2lubGluZWQnKTtcbiAgICBib2FyZFdyYXAuaW5zZXJ0QmVmb3JlKGhhbmRXcmFwQm90dG9tLCBib2FyZC5uZXh0RWxlbWVudFNpYmxpbmcpO1xuICAgIGJvYXJkV3JhcC5pbnNlcnRCZWZvcmUoaGFuZFdyYXBUb3AsIGJvYXJkKTtcbiAgICBoYW5kcyA9IHtcbiAgICAgIHRvcDogaGFuZFdyYXBUb3AsXG4gICAgICBib3R0b206IGhhbmRXcmFwQm90dG9tLFxuICAgIH07XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGJvYXJkLFxuICAgIHNxdWFyZXMsXG4gICAgcGllY2VzLFxuICAgIHByb21vdGlvbixcbiAgICBzcXVhcmVPdmVyLFxuICAgIGRyYWdnZWQsXG4gICAgc2hhcGVzLFxuICAgIGhhbmRzLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd3JhcEhhbmQoaGFuZFdyYXA6IEhUTUxFbGVtZW50LCBwb3M6ICd0b3AnIHwgJ2JvdHRvbScsIHM6IFN0YXRlKTogSFRNTEVsZW1lbnQge1xuICBjb25zdCBoYW5kID0gcmVuZGVySGFuZChwb3MgPT09ICd0b3AnID8gb3Bwb3NpdGUocy5vcmllbnRhdGlvbikgOiBzLm9yaWVudGF0aW9uLCBzLmhhbmRzLnJvbGVzKTtcbiAgaGFuZFdyYXAuaW5uZXJIVE1MID0gJyc7XG5cbiAgY29uc3Qgcm9sZUNudENscyA9IGByLSR7cy5oYW5kcy5yb2xlcy5sZW5ndGh9YDtcblxuICAvLyByZW1vdmUgYWxsIG90aGVyIHJvbGUgY291bnQgY2xhc3Nlc1xuICBoYW5kV3JhcC5jbGFzc0xpc3QuZm9yRWFjaCgoYykgPT4ge1xuICAgIGlmIChjLnN1YnN0cmluZygwLCAyKSA9PT0gJ3ItJyAmJiBjICE9PSByb2xlQ250Q2xzKSBoYW5kV3JhcC5jbGFzc0xpc3QucmVtb3ZlKGMpO1xuICB9KTtcblxuICAvLyBlbnN1cmUgdGhlIHNnLWhhbmQtd3JhcCBjbGFzcywgaGFuZCBwb3MgY2xhc3MgYW5kIHJvbGUgbnVtYmVyIGNsYXNzIGlzIHNldCBiZWZvcmVoYW5kIHRvIGF2b2lkIHJlY29tcHV0aW5nIHN0eWxlc1xuICBoYW5kV3JhcC5jbGFzc0xpc3QuYWRkKCdzZy1oYW5kLXdyYXAnLCBgaGFuZC0ke3Bvc31gLCByb2xlQ250Q2xzKTtcbiAgaGFuZFdyYXAuYXBwZW5kQ2hpbGQoaGFuZCk7XG5cbiAgZm9yIChjb25zdCBjIG9mIGNvbG9ycykgaGFuZFdyYXAuY2xhc3NMaXN0LnRvZ2dsZSgnb3JpZW50YXRpb24tJyArIGMsIHMub3JpZW50YXRpb24gPT09IGMpO1xuICBoYW5kV3JhcC5jbGFzc0xpc3QudG9nZ2xlKCdtYW5pcHVsYWJsZScsICFzLnZpZXdPbmx5KTtcblxuICByZXR1cm4gaGFuZDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyQ29vcmRzKGVsZW1zOiByZWFkb25seSBzdHJpbmdbXSwgY2xhc3NOYW1lOiBzdHJpbmcsIHRyaW06IG51bWJlcik6IEhUTUxFbGVtZW50IHtcbiAgY29uc3QgZWwgPSBjcmVhdGVFbCgnY29vcmRzJywgY2xhc3NOYW1lKTtcbiAgbGV0IGY6IEhUTUxFbGVtZW50O1xuICBmb3IgKGNvbnN0IGVsZW0gb2YgZWxlbXMuc2xpY2UoLXRyaW0pKSB7XG4gICAgZiA9IGNyZWF0ZUVsKCdjb29yZCcpO1xuICAgIGYudGV4dENvbnRlbnQgPSBlbGVtO1xuICAgIGVsLmFwcGVuZENoaWxkKGYpO1xuICB9XG4gIHJldHVybiBlbDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyU3F1YXJlcyhkaW1zOiBEaW1lbnNpb25zLCBvcmllbnRhdGlvbjogQ29sb3IpOiBIVE1MRWxlbWVudCB7XG4gIGNvbnN0IHNxdWFyZXMgPSBjcmVhdGVFbCgnc2ctc3F1YXJlcycpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGltcy5yYW5rcyAqIGRpbXMuZmlsZXM7IGkrKykge1xuICAgIGNvbnN0IHNxID0gY3JlYXRlRWwoJ3NxJykgYXMgU3F1YXJlTm9kZTtcbiAgICBzcS5zZ0tleSA9XG4gICAgICBvcmllbnRhdGlvbiA9PT0gJ3NlbnRlJ1xuICAgICAgICA/IHBvczJrZXkoW2RpbXMuZmlsZXMgLSAxIC0gKGkgJSBkaW1zLmZpbGVzKSwgTWF0aC5mbG9vcihpIC8gZGltcy5maWxlcyldKVxuICAgICAgICA6IHBvczJrZXkoW2kgJSBkaW1zLmZpbGVzLCBkaW1zLnJhbmtzIC0gMSAtIE1hdGguZmxvb3IoaSAvIGRpbXMuZmlsZXMpXSk7XG4gICAgc3F1YXJlcy5hcHBlbmRDaGlsZChzcSk7XG4gIH1cblxuICByZXR1cm4gc3F1YXJlcztcbn1cblxuZnVuY3Rpb24gcmVuZGVySGFuZChjb2xvcjogQ29sb3IsIHJvbGVzOiBSb2xlU3RyaW5nW10pOiBIVE1MRWxlbWVudCB7XG4gIGNvbnN0IGhhbmQgPSBjcmVhdGVFbCgnc2ctaGFuZCcpO1xuICBmb3IgKGNvbnN0IHJvbGUgb2Ygcm9sZXMpIHtcbiAgICBjb25zdCBwaWVjZSA9IHsgcm9sZTogcm9sZSwgY29sb3I6IGNvbG9yIH0sXG4gICAgICB3cmFwRWwgPSBjcmVhdGVFbCgnc2ctaHAtd3JhcCcpLFxuICAgICAgcGllY2VFbCA9IGNyZWF0ZUVsKCdwaWVjZScsIHBpZWNlTmFtZU9mKHBpZWNlKSkgYXMgUGllY2VOb2RlO1xuICAgIHBpZWNlRWwuc2dDb2xvciA9IGNvbG9yO1xuICAgIHBpZWNlRWwuc2dSb2xlID0gcm9sZTtcbiAgICB3cmFwRWwuYXBwZW5kQ2hpbGQocGllY2VFbCk7XG4gICAgaGFuZC5hcHBlbmRDaGlsZCh3cmFwRWwpO1xuICB9XG4gIHJldHVybiBoYW5kO1xufVxuIiwgImltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgKiBhcyBkcmFnIGZyb20gJy4vZHJhZy5qcyc7XG5pbXBvcnQgKiBhcyBkcmF3IGZyb20gJy4vZHJhdy5qcyc7XG5pbXBvcnQge1xuICBjYWxsVXNlckZ1bmN0aW9uLFxuICBldmVudFBvc2l0aW9uLFxuICBnZXRIYW5kUGllY2VBdERvbVBvcyxcbiAgaXNNaWRkbGVCdXR0b24sXG4gIGlzUGllY2VOb2RlLFxuICBpc1JpZ2h0QnV0dG9uLFxuICBzYW1lUGllY2UsXG59IGZyb20gJy4vdXRpbC5qcyc7XG5pbXBvcnQgeyBhbmltIH0gZnJvbSAnLi9hbmltLmpzJztcbmltcG9ydCB7IHVzZXJEcm9wLCB1c2VyTW92ZSwgY2FuY2VsUHJvbW90aW9uLCBzZWxlY3RTcXVhcmUgfSBmcm9tICcuL2JvYXJkLmpzJztcbmltcG9ydCB7IHVzZXNCb3VuZHMgfSBmcm9tICcuL3NoYXBlcy5qcyc7XG5cbnR5cGUgTW91Y2hCaW5kID0gKGU6IHNnLk1vdWNoRXZlbnQpID0+IHZvaWQ7XG50eXBlIFN0YXRlTW91Y2hCaW5kID0gKGQ6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KSA9PiB2b2lkO1xuXG5mdW5jdGlvbiBjbGVhckJvdW5kcyhzOiBTdGF0ZSk6IHZvaWQge1xuICBzLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzLmNsZWFyKCk7XG4gIHMuZG9tLmJvdW5kcy5oYW5kcy5ib3VuZHMuY2xlYXIoKTtcbiAgcy5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzLmNsZWFyKCk7XG59XG5cbmZ1bmN0aW9uIG9uUmVzaXplKHM6IFN0YXRlKTogKCkgPT4gdm9pZCB7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgY2xlYXJCb3VuZHMocyk7XG4gICAgaWYgKHVzZXNCb3VuZHMocy5kcmF3YWJsZS5zaGFwZXMuY29uY2F0KHMuZHJhd2FibGUuYXV0b1NoYXBlcykpKSBzLmRvbS5yZWRyYXdTaGFwZXMoKTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRCb2FyZChzOiBTdGF0ZSwgYm9hcmRFbHM6IHNnLkJvYXJkRWxlbWVudHMpOiB2b2lkIHtcbiAgaWYgKCdSZXNpemVPYnNlcnZlcicgaW4gd2luZG93KSBuZXcgUmVzaXplT2JzZXJ2ZXIob25SZXNpemUocykpLm9ic2VydmUoYm9hcmRFbHMuYm9hcmQpO1xuXG4gIGlmIChzLnZpZXdPbmx5KSByZXR1cm47XG5cbiAgY29uc3QgcGllY2VzRWwgPSBib2FyZEVscy5waWVjZXMsXG4gICAgcHJvbW90aW9uRWwgPSBib2FyZEVscy5wcm9tb3Rpb247XG5cbiAgLy8gQ2Fubm90IGJlIHBhc3NpdmUsIGJlY2F1c2Ugd2UgcHJldmVudCB0b3VjaCBzY3JvbGxpbmcgYW5kIGRyYWdnaW5nIG9mIHNlbGVjdGVkIGVsZW1lbnRzLlxuICBjb25zdCBvblN0YXJ0ID0gc3RhcnREcmFnT3JEcmF3KHMpO1xuICBwaWVjZXNFbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25TdGFydCBhcyBFdmVudExpc3RlbmVyLCB7XG4gICAgcGFzc2l2ZTogZmFsc2UsXG4gIH0pO1xuICBwaWVjZXNFbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvblN0YXJ0IGFzIEV2ZW50TGlzdGVuZXIsIHtcbiAgICBwYXNzaXZlOiBmYWxzZSxcbiAgfSk7XG4gIGlmIChzLmRpc2FibGVDb250ZXh0TWVudSB8fCBzLmRyYXdhYmxlLmVuYWJsZWQpXG4gICAgcGllY2VzRWwuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcblxuICBpZiAocHJvbW90aW9uRWwpIHtcbiAgICBjb25zdCBwaWVjZVNlbGVjdGlvbiA9IChlOiBzZy5Nb3VjaEV2ZW50KSA9PiBwcm9tb3RlKHMsIGUpO1xuICAgIHByb21vdGlvbkVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcGllY2VTZWxlY3Rpb24gYXMgRXZlbnRMaXN0ZW5lcik7XG4gICAgaWYgKHMuZGlzYWJsZUNvbnRleHRNZW51KVxuICAgICAgcHJvbW90aW9uRWwuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYmluZEhhbmQoczogU3RhdGUsIGhhbmRFbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgaWYgKCdSZXNpemVPYnNlcnZlcicgaW4gd2luZG93KSBuZXcgUmVzaXplT2JzZXJ2ZXIob25SZXNpemUocykpLm9ic2VydmUoaGFuZEVsKTtcblxuICBpZiAocy52aWV3T25seSkgcmV0dXJuO1xuXG4gIGNvbnN0IG9uU3RhcnQgPSBzdGFydERyYWdGcm9tSGFuZChzKTtcbiAgaGFuZEVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uU3RhcnQgYXMgRXZlbnRMaXN0ZW5lciwgeyBwYXNzaXZlOiBmYWxzZSB9KTtcbiAgaGFuZEVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblN0YXJ0IGFzIEV2ZW50TGlzdGVuZXIsIHtcbiAgICBwYXNzaXZlOiBmYWxzZSxcbiAgfSk7XG4gIGhhbmRFbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICBpZiAocy5wcm9tb3Rpb24uY3VycmVudCkge1xuICAgICAgY2FuY2VsUHJvbW90aW9uKHMpO1xuICAgICAgcy5kb20ucmVkcmF3KCk7XG4gICAgfVxuICB9KTtcblxuICBpZiAocy5kaXNhYmxlQ29udGV4dE1lbnUgfHwgcy5kcmF3YWJsZS5lbmFibGVkKVxuICAgIGhhbmRFbC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xufVxuXG4vLyByZXR1cm5zIHRoZSB1bmJpbmQgZnVuY3Rpb25cbmV4cG9ydCBmdW5jdGlvbiBiaW5kRG9jdW1lbnQoczogU3RhdGUpOiBzZy5VbmJpbmQge1xuICBjb25zdCB1bmJpbmRzOiBzZy5VbmJpbmRbXSA9IFtdO1xuXG4gIC8vIE9sZCB2ZXJzaW9ucyBvZiBFZGdlIGFuZCBTYWZhcmkgZG8gbm90IHN1cHBvcnQgUmVzaXplT2JzZXJ2ZXIuIFNlbmRcbiAgLy8gc2hvZ2lncm91bmQucmVzaXplIGlmIGEgdXNlciBhY3Rpb24gaGFzIGNoYW5nZWQgdGhlIGJvdW5kcyBvZiB0aGUgYm9hcmQuXG4gIGlmICghKCdSZXNpemVPYnNlcnZlcicgaW4gd2luZG93KSkge1xuICAgIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKGRvY3VtZW50LmJvZHksICdzaG9naWdyb3VuZC5yZXNpemUnLCBvblJlc2l6ZShzKSkpO1xuICB9XG5cbiAgaWYgKCFzLnZpZXdPbmx5KSB7XG4gICAgY29uc3Qgb25tb3ZlID0gZHJhZ09yRHJhdyhzLCBkcmFnLm1vdmUsIGRyYXcubW92ZSksXG4gICAgICBvbmVuZCA9IGRyYWdPckRyYXcocywgZHJhZy5lbmQsIGRyYXcuZW5kKTtcblxuICAgIGZvciAoY29uc3QgZXYgb2YgWyd0b3VjaG1vdmUnLCAnbW91c2Vtb3ZlJ10pXG4gICAgICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZShkb2N1bWVudCwgZXYsIG9ubW92ZSBhcyBFdmVudExpc3RlbmVyKSk7XG4gICAgZm9yIChjb25zdCBldiBvZiBbJ3RvdWNoZW5kJywgJ21vdXNldXAnXSlcbiAgICAgIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKGRvY3VtZW50LCBldiwgb25lbmQgYXMgRXZlbnRMaXN0ZW5lcikpO1xuXG4gICAgdW5iaW5kcy5wdXNoKFxuICAgICAgdW5iaW5kYWJsZShkb2N1bWVudCwgJ3Njcm9sbCcsICgpID0+IGNsZWFyQm91bmRzKHMpLCB7IGNhcHR1cmU6IHRydWUsIHBhc3NpdmU6IHRydWUgfSksXG4gICAgKTtcbiAgICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZSh3aW5kb3csICdyZXNpemUnLCAoKSA9PiBjbGVhckJvdW5kcyhzKSwgeyBwYXNzaXZlOiB0cnVlIH0pKTtcbiAgfVxuXG4gIHJldHVybiAoKSA9PiB1bmJpbmRzLmZvckVhY2goKGYpID0+IGYoKSk7XG59XG5cbmZ1bmN0aW9uIHVuYmluZGFibGUoXG4gIGVsOiBFdmVudFRhcmdldCxcbiAgZXZlbnROYW1lOiBzdHJpbmcsXG4gIGNhbGxiYWNrOiBFdmVudExpc3RlbmVyLFxuICBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMsXG4pOiBzZy5VbmJpbmQge1xuICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2ssIG9wdGlvbnMpO1xuICByZXR1cm4gKCkgPT4gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrLCBvcHRpb25zKTtcbn1cblxuZnVuY3Rpb24gc3RhcnREcmFnT3JEcmF3KHM6IFN0YXRlKTogTW91Y2hCaW5kIHtcbiAgcmV0dXJuIChlKSA9PiB7XG4gICAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQpIGRyYWcuY2FuY2VsKHMpO1xuICAgIGVsc2UgaWYgKHMuZHJhd2FibGUuY3VycmVudCkgZHJhdy5jYW5jZWwocyk7XG4gICAgZWxzZSBpZiAoZS5zaGlmdEtleSB8fCBpc1JpZ2h0QnV0dG9uKGUpIHx8IHMuZHJhd2FibGUuZm9yY2VkKSB7XG4gICAgICBpZiAocy5kcmF3YWJsZS5lbmFibGVkKSBkcmF3LnN0YXJ0KHMsIGUpO1xuICAgIH0gZWxzZSBpZiAoIXMudmlld09ubHkgJiYgIWRyYWcudW53YW50ZWRFdmVudChlKSkgZHJhZy5zdGFydChzLCBlKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZHJhZ09yRHJhdyhzOiBTdGF0ZSwgd2l0aERyYWc6IFN0YXRlTW91Y2hCaW5kLCB3aXRoRHJhdzogU3RhdGVNb3VjaEJpbmQpOiBNb3VjaEJpbmQge1xuICByZXR1cm4gKGUpID0+IHtcbiAgICBpZiAocy5kcmF3YWJsZS5jdXJyZW50KSB7XG4gICAgICBpZiAocy5kcmF3YWJsZS5lbmFibGVkKSB3aXRoRHJhdyhzLCBlKTtcbiAgICB9IGVsc2UgaWYgKCFzLnZpZXdPbmx5KSB3aXRoRHJhZyhzLCBlKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3RhcnREcmFnRnJvbUhhbmQoczogU3RhdGUpOiBNb3VjaEJpbmQge1xuICByZXR1cm4gKGUpID0+IHtcbiAgICBpZiAocy5wcm9tb3Rpb24uY3VycmVudCkgcmV0dXJuO1xuXG4gICAgY29uc3QgcG9zID0gZXZlbnRQb3NpdGlvbihlKSxcbiAgICAgIHBpZWNlID0gcG9zICYmIGdldEhhbmRQaWVjZUF0RG9tUG9zKHBvcywgcy5oYW5kcy5yb2xlcywgcy5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzKCkpO1xuXG4gICAgaWYgKHBpZWNlKSB7XG4gICAgICBpZiAocy5kcmFnZ2FibGUuY3VycmVudCkgZHJhZy5jYW5jZWwocyk7XG4gICAgICBlbHNlIGlmIChzLmRyYXdhYmxlLmN1cnJlbnQpIGRyYXcuY2FuY2VsKHMpO1xuICAgICAgZWxzZSBpZiAoaXNNaWRkbGVCdXR0b24oZSkpIHtcbiAgICAgICAgaWYgKHMuZHJhd2FibGUuZW5hYmxlZCkge1xuICAgICAgICAgIGlmIChlLmNhbmNlbGFibGUgIT09IGZhbHNlKSBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgZHJhdy5zZXREcmF3UGllY2UocywgcGllY2UpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGUuc2hpZnRLZXkgfHwgaXNSaWdodEJ1dHRvbihlKSB8fCBzLmRyYXdhYmxlLmZvcmNlZCkge1xuICAgICAgICBpZiAocy5kcmF3YWJsZS5lbmFibGVkKSBkcmF3LnN0YXJ0RnJvbUhhbmQocywgcGllY2UsIGUpO1xuICAgICAgfSBlbHNlIGlmICghcy52aWV3T25seSAmJiAhZHJhZy51bndhbnRlZEV2ZW50KGUpKSB7XG4gICAgICAgIGlmIChlLmNhbmNlbGFibGUgIT09IGZhbHNlKSBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGRyYWcuZHJhZ05ld1BpZWNlKHMsIHBpZWNlLCBlKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIHByb21vdGUoczogU3RhdGUsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudCB8IG51bGwsXG4gICAgY3VyID0gcy5wcm9tb3Rpb24uY3VycmVudDtcbiAgaWYgKHRhcmdldCAmJiBpc1BpZWNlTm9kZSh0YXJnZXQpICYmIGN1cikge1xuICAgIGNvbnN0IHBpZWNlID0geyBjb2xvcjogdGFyZ2V0LnNnQ29sb3IsIHJvbGU6IHRhcmdldC5zZ1JvbGUgfSxcbiAgICAgIHByb20gPSAhc2FtZVBpZWNlKGN1ci5waWVjZSwgcGllY2UpO1xuICAgIGlmIChjdXIuZHJhZ2dlZCB8fCAocy50dXJuQ29sb3IgIT09IHMuYWN0aXZlQ29sb3IgJiYgcy5hY3RpdmVDb2xvciAhPT0gJ2JvdGgnKSkge1xuICAgICAgaWYgKHMuc2VsZWN0ZWQpIHVzZXJNb3ZlKHMsIHMuc2VsZWN0ZWQsIGN1ci5rZXksIHByb20pO1xuICAgICAgZWxzZSBpZiAocy5zZWxlY3RlZFBpZWNlKSB1c2VyRHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIGN1ci5rZXksIHByb20pO1xuICAgIH0gZWxzZSBhbmltKChzKSA9PiBzZWxlY3RTcXVhcmUocywgY3VyLmtleSwgcHJvbSksIHMpO1xuXG4gICAgY2FsbFVzZXJGdW5jdGlvbihzLnByb21vdGlvbi5ldmVudHMuYWZ0ZXIsIHBpZWNlKTtcbiAgfSBlbHNlIGFuaW0oKHMpID0+IGNhbmNlbFByb21vdGlvbihzKSwgcyk7XG4gIHMucHJvbW90aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG5cbiAgcy5kb20ucmVkcmF3KCk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgeyBBbmltQ3VycmVudCwgQW5pbVZlY3RvcnMsIEFuaW1WZWN0b3IsIEFuaW1GYWRpbmdzLCBBbmltUHJvbW90aW9ucyB9IGZyb20gJy4vYW5pbS5qcyc7XG5pbXBvcnQgdHlwZSB7IERyYWdDdXJyZW50IH0gZnJvbSAnLi9kcmFnLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQge1xuICBrZXkycG9zLFxuICBjcmVhdGVFbCxcbiAgc2V0RGlzcGxheSxcbiAgcG9zVG9UcmFuc2xhdGVSZWwsXG4gIHRyYW5zbGF0ZVJlbCxcbiAgcGllY2VOYW1lT2YsXG4gIHNlbnRlUG92LFxuICBpc1BpZWNlTm9kZSxcbiAgaXNTcXVhcmVOb2RlLFxufSBmcm9tICcuL3V0aWwuanMnO1xuXG50eXBlIFNxdWFyZUNsYXNzZXMgPSBNYXA8c2cuS2V5LCBzdHJpbmc+O1xuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyKHM6IFN0YXRlLCBib2FyZEVsczogc2cuQm9hcmRFbGVtZW50cyk6IHZvaWQge1xuICBjb25zdCBhc1NlbnRlOiBib29sZWFuID0gc2VudGVQb3Yocy5vcmllbnRhdGlvbiksXG4gICAgc2NhbGVEb3duID0gcy5zY2FsZURvd25QaWVjZXMgPyAwLjUgOiAxLFxuICAgIHBvc1RvVHJhbnNsYXRlID0gcG9zVG9UcmFuc2xhdGVSZWwocy5kaW1lbnNpb25zKSxcbiAgICBzcXVhcmVzRWw6IEhUTUxFbGVtZW50ID0gYm9hcmRFbHMuc3F1YXJlcyxcbiAgICBwaWVjZXNFbDogSFRNTEVsZW1lbnQgPSBib2FyZEVscy5waWVjZXMsXG4gICAgZHJhZ2dlZEVsOiBzZy5QaWVjZU5vZGUgfCB1bmRlZmluZWQgPSBib2FyZEVscy5kcmFnZ2VkLFxuICAgIHNxdWFyZU92ZXJFbDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQgPSBib2FyZEVscy5zcXVhcmVPdmVyLFxuICAgIHByb21vdGlvbkVsOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZCA9IGJvYXJkRWxzLnByb21vdGlvbixcbiAgICBwaWVjZXM6IHNnLlBpZWNlcyA9IHMucGllY2VzLFxuICAgIGN1ckFuaW06IEFuaW1DdXJyZW50IHwgdW5kZWZpbmVkID0gcy5hbmltYXRpb24uY3VycmVudCxcbiAgICBhbmltczogQW5pbVZlY3RvcnMgPSBjdXJBbmltID8gY3VyQW5pbS5wbGFuLmFuaW1zIDogbmV3IE1hcCgpLFxuICAgIGZhZGluZ3M6IEFuaW1GYWRpbmdzID0gY3VyQW5pbSA/IGN1ckFuaW0ucGxhbi5mYWRpbmdzIDogbmV3IE1hcCgpLFxuICAgIHByb21vdGlvbnM6IEFuaW1Qcm9tb3Rpb25zID0gY3VyQW5pbSA/IGN1ckFuaW0ucGxhbi5wcm9tb3Rpb25zIDogbmV3IE1hcCgpLFxuICAgIGN1ckRyYWc6IERyYWdDdXJyZW50IHwgdW5kZWZpbmVkID0gcy5kcmFnZ2FibGUuY3VycmVudCxcbiAgICBjdXJQcm9tS2V5OiBzZy5LZXkgfCB1bmRlZmluZWQgPSBzLnByb21vdGlvbi5jdXJyZW50Py5kcmFnZ2VkID8gcy5zZWxlY3RlZCA6IHVuZGVmaW5lZCxcbiAgICBzcXVhcmVzOiBTcXVhcmVDbGFzc2VzID0gY29tcHV0ZVNxdWFyZUNsYXNzZXMocyksXG4gICAgc2FtZVBpZWNlcyA9IG5ldyBTZXQ8c2cuS2V5PigpLFxuICAgIG1vdmVkUGllY2VzID0gbmV3IE1hcDxzZy5QaWVjZU5hbWUsIHNnLlBpZWNlTm9kZVtdPigpO1xuXG4gIC8vIGlmIHBpZWNlIG5vdCBiZWluZyBkcmFnZ2VkIGFueW1vcmUsIGhpZGUgaXRcbiAgaWYgKCFjdXJEcmFnICYmIGRyYWdnZWRFbD8uc2dEcmFnZ2luZykge1xuICAgIGRyYWdnZWRFbC5zZ0RyYWdnaW5nID0gZmFsc2U7XG4gICAgc2V0RGlzcGxheShkcmFnZ2VkRWwsIGZhbHNlKTtcbiAgICBpZiAoc3F1YXJlT3ZlckVsKSBzZXREaXNwbGF5KHNxdWFyZU92ZXJFbCwgZmFsc2UpO1xuICB9XG5cbiAgbGV0IGs6IHNnLktleSxcbiAgICBlbDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQsXG4gICAgcGllY2VBdEtleTogc2cuUGllY2UgfCB1bmRlZmluZWQsXG4gICAgZWxQaWVjZU5hbWU6IHNnLlBpZWNlTmFtZSxcbiAgICBhbmltOiBBbmltVmVjdG9yIHwgdW5kZWZpbmVkLFxuICAgIGZhZGluZzogc2cuUGllY2UgfCB1bmRlZmluZWQsXG4gICAgcHJvbTogc2cuUGllY2UgfCB1bmRlZmluZWQsXG4gICAgcE12ZHNldDogc2cuUGllY2VOb2RlW10gfCB1bmRlZmluZWQsXG4gICAgcE12ZDogc2cuUGllY2VOb2RlIHwgdW5kZWZpbmVkO1xuXG4gIC8vIHdhbGsgb3ZlciBhbGwgYm9hcmQgZG9tIGVsZW1lbnRzLCBhcHBseSBhbmltYXRpb25zIGFuZCBmbGFnIG1vdmVkIHBpZWNlc1xuICBlbCA9IHBpZWNlc0VsLmZpcnN0RWxlbWVudENoaWxkIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICB3aGlsZSAoZWwpIHtcbiAgICBpZiAoaXNQaWVjZU5vZGUoZWwpKSB7XG4gICAgICBrID0gZWwuc2dLZXk7XG4gICAgICBwaWVjZUF0S2V5ID0gcGllY2VzLmdldChrKTtcbiAgICAgIGFuaW0gPSBhbmltcy5nZXQoayk7XG4gICAgICBmYWRpbmcgPSBmYWRpbmdzLmdldChrKTtcbiAgICAgIHByb20gPSBwcm9tb3Rpb25zLmdldChrKTtcbiAgICAgIGVsUGllY2VOYW1lID0gcGllY2VOYW1lT2YoeyBjb2xvcjogZWwuc2dDb2xvciwgcm9sZTogZWwuc2dSb2xlIH0pO1xuXG4gICAgICAvLyBpZiBwaWVjZSBkcmFnZ2VkIGFkZCBvciByZW1vdmUgZ2hvc3QgY2xhc3Mgb3IgaWYgcHJvbW90aW9uIGRpYWxvZyBpcyBhY3RpdmUgZm9yIHRoZSBwaWVjZSBhZGQgcHJvbSBjbGFzc1xuICAgICAgaWYgKFxuICAgICAgICAoKGN1ckRyYWc/LnN0YXJ0ZWQgJiYgY3VyRHJhZy5mcm9tQm9hcmQ/Lm9yaWcgPT09IGspIHx8IChjdXJQcm9tS2V5ICYmIGN1clByb21LZXkgPT09IGspKSAmJlxuICAgICAgICAhZWwuc2dHaG9zdFxuICAgICAgKSB7XG4gICAgICAgIGVsLnNnR2hvc3QgPSB0cnVlO1xuICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnaG9zdCcpO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgZWwuc2dHaG9zdCAmJlxuICAgICAgICAoIWN1ckRyYWcgfHwgY3VyRHJhZy5mcm9tQm9hcmQ/Lm9yaWcgIT09IGspICYmXG4gICAgICAgICghY3VyUHJvbUtleSB8fCBjdXJQcm9tS2V5ICE9PSBrKVxuICAgICAgKSB7XG4gICAgICAgIGVsLnNnR2hvc3QgPSBmYWxzZTtcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2hvc3QnKTtcbiAgICAgIH1cbiAgICAgIC8vIHJlbW92ZSBmYWRpbmcgY2xhc3MgaWYgaXQgc3RpbGwgcmVtYWluc1xuICAgICAgaWYgKCFmYWRpbmcgJiYgZWwuc2dGYWRpbmcpIHtcbiAgICAgICAgZWwuc2dGYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZmFkaW5nJyk7XG4gICAgICB9XG4gICAgICAvLyB0aGVyZSBpcyBub3cgYSBwaWVjZSBhdCB0aGlzIGRvbSBrZXlcbiAgICAgIGlmIChwaWVjZUF0S2V5KSB7XG4gICAgICAgIC8vIGNvbnRpbnVlIGFuaW1hdGlvbiBpZiBhbHJlYWR5IGFuaW1hdGluZyBhbmQgc2FtZSBwaWVjZSBvciBwcm9tb3RpbmcgcGllY2VcbiAgICAgICAgLy8gKG90aGVyd2lzZSBpdCBjb3VsZCBhbmltYXRlIGEgY2FwdHVyZWQgcGllY2UpXG4gICAgICAgIGlmIChcbiAgICAgICAgICBhbmltICYmXG4gICAgICAgICAgZWwuc2dBbmltYXRpbmcgJiZcbiAgICAgICAgICAoZWxQaWVjZU5hbWUgPT09IHBpZWNlTmFtZU9mKHBpZWNlQXRLZXkpIHx8IChwcm9tICYmIGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihwcm9tKSkpXG4gICAgICAgICkge1xuICAgICAgICAgIGNvbnN0IHBvcyA9IGtleTJwb3Moayk7XG4gICAgICAgICAgcG9zWzBdICs9IGFuaW1bMl07XG4gICAgICAgICAgcG9zWzFdICs9IGFuaW1bM107XG4gICAgICAgICAgdHJhbnNsYXRlUmVsKGVsLCBwb3NUb1RyYW5zbGF0ZShwb3MsIGFzU2VudGUpLCBzY2FsZURvd24pO1xuICAgICAgICB9IGVsc2UgaWYgKGVsLnNnQW5pbWF0aW5nKSB7XG4gICAgICAgICAgZWwuc2dBbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdhbmltJyk7XG4gICAgICAgICAgdHJhbnNsYXRlUmVsKGVsLCBwb3NUb1RyYW5zbGF0ZShrZXkycG9zKGspLCBhc1NlbnRlKSwgc2NhbGVEb3duKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzYW1lIHBpZWNlOiBmbGFnIGFzIHNhbWVcbiAgICAgICAgaWYgKGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihwaWVjZUF0S2V5KSAmJiAoIWZhZGluZyB8fCAhZWwuc2dGYWRpbmcpKSB7XG4gICAgICAgICAgc2FtZVBpZWNlcy5hZGQoayk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZGlmZmVyZW50IHBpZWNlOiBmbGFnIGFzIG1vdmVkIHVubGVzcyBpdCBpcyBhIGZhZGluZyBwaWVjZSBvciBhbiBhbmltYXRlZCBwcm9tb3RpbmcgcGllY2VcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaWYgKGZhZGluZyAmJiBlbFBpZWNlTmFtZSA9PT0gcGllY2VOYW1lT2YoZmFkaW5nKSkge1xuICAgICAgICAgICAgZWwuc2dGYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZmFkaW5nJyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChwcm9tICYmIGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihwcm9tKSkge1xuICAgICAgICAgICAgc2FtZVBpZWNlcy5hZGQoayk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFwcGVuZFZhbHVlKG1vdmVkUGllY2VzLCBlbFBpZWNlTmFtZSwgZWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gbm8gcGllY2U6IGZsYWcgYXMgbW92ZWRcbiAgICAgIGVsc2Uge1xuICAgICAgICBhcHBlbmRWYWx1ZShtb3ZlZFBpZWNlcywgZWxQaWVjZU5hbWUsIGVsKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWwgPSBlbC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIH1cblxuICAvLyB3YWxrIG92ZXIgYWxsIHNxdWFyZXMgYW5kIGFwcGx5IGNsYXNzZXNcbiAgbGV0IHNxRWwgPSBzcXVhcmVzRWwuZmlyc3RFbGVtZW50Q2hpbGQgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIHdoaWxlIChzcUVsICYmIGlzU3F1YXJlTm9kZShzcUVsKSkge1xuICAgIHNxRWwuY2xhc3NOYW1lID0gc3F1YXJlcy5nZXQoc3FFbC5zZ0tleSkgfHwgJyc7XG4gICAgc3FFbCA9IHNxRWwubmV4dEVsZW1lbnRTaWJsaW5nIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICB9XG5cbiAgLy8gd2FsayBvdmVyIGFsbCBwaWVjZXMgaW4gY3VycmVudCBzZXQsIGFwcGx5IGRvbSBjaGFuZ2VzIHRvIG1vdmVkIHBpZWNlc1xuICAvLyBvciBhcHBlbmQgbmV3IHBpZWNlc1xuICBmb3IgKGNvbnN0IFtrLCBwXSBvZiBwaWVjZXMpIHtcbiAgICBjb25zdCBwaWVjZSA9IHByb21vdGlvbnMuZ2V0KGspIHx8IHA7XG4gICAgYW5pbSA9IGFuaW1zLmdldChrKTtcbiAgICBpZiAoIXNhbWVQaWVjZXMuaGFzKGspKSB7XG4gICAgICBwTXZkc2V0ID0gbW92ZWRQaWVjZXMuZ2V0KHBpZWNlTmFtZU9mKHBpZWNlKSk7XG4gICAgICBwTXZkID0gcE12ZHNldD8ucG9wKCk7XG4gICAgICAvLyBhIHNhbWUgcGllY2Ugd2FzIG1vdmVkXG4gICAgICBpZiAocE12ZCkge1xuICAgICAgICAvLyBhcHBseSBkb20gY2hhbmdlc1xuICAgICAgICBwTXZkLnNnS2V5ID0gaztcbiAgICAgICAgaWYgKHBNdmQuc2dGYWRpbmcpIHtcbiAgICAgICAgICBwTXZkLnNnRmFkaW5nID0gZmFsc2U7XG4gICAgICAgICAgcE12ZC5jbGFzc0xpc3QucmVtb3ZlKCdmYWRpbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwb3MgPSBrZXkycG9zKGspO1xuICAgICAgICBpZiAoYW5pbSkge1xuICAgICAgICAgIHBNdmQuc2dBbmltYXRpbmcgPSB0cnVlO1xuICAgICAgICAgIHBNdmQuY2xhc3NMaXN0LmFkZCgnYW5pbScpO1xuICAgICAgICAgIHBvc1swXSArPSBhbmltWzJdO1xuICAgICAgICAgIHBvc1sxXSArPSBhbmltWzNdO1xuICAgICAgICB9XG4gICAgICAgIHRyYW5zbGF0ZVJlbChwTXZkLCBwb3NUb1RyYW5zbGF0ZShwb3MsIGFzU2VudGUpLCBzY2FsZURvd24pO1xuICAgICAgfVxuICAgICAgLy8gbm8gcGllY2UgaW4gbW92ZWQgb2JqOiBpbnNlcnQgdGhlIG5ldyBwaWVjZVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IHBpZWNlTm9kZSA9IGNyZWF0ZUVsKCdwaWVjZScsIHBpZWNlTmFtZU9mKHApKSBhcyBzZy5QaWVjZU5vZGUsXG4gICAgICAgICAgcG9zID0ga2V5MnBvcyhrKTtcblxuICAgICAgICBwaWVjZU5vZGUuc2dDb2xvciA9IHAuY29sb3I7XG4gICAgICAgIHBpZWNlTm9kZS5zZ1JvbGUgPSBwLnJvbGU7XG4gICAgICAgIHBpZWNlTm9kZS5zZ0tleSA9IGs7XG4gICAgICAgIGlmIChhbmltKSB7XG4gICAgICAgICAgcGllY2VOb2RlLnNnQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgICAgICBwb3NbMF0gKz0gYW5pbVsyXTtcbiAgICAgICAgICBwb3NbMV0gKz0gYW5pbVszXTtcbiAgICAgICAgfVxuICAgICAgICB0cmFuc2xhdGVSZWwocGllY2VOb2RlLCBwb3NUb1RyYW5zbGF0ZShwb3MsIGFzU2VudGUpLCBzY2FsZURvd24pO1xuXG4gICAgICAgIHBpZWNlc0VsLmFwcGVuZENoaWxkKHBpZWNlTm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8vIHJlbW92ZSBhbnkgZWxlbWVudCB0aGF0IHJlbWFpbnMgaW4gdGhlIG1vdmVkIHNldHNcbiAgZm9yIChjb25zdCBub2RlcyBvZiBtb3ZlZFBpZWNlcy52YWx1ZXMoKSkge1xuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgICAgcGllY2VzRWwucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHByb21vdGlvbkVsKSByZW5kZXJQcm9tb3Rpb24ocywgcHJvbW90aW9uRWwpO1xufVxuXG5mdW5jdGlvbiBhcHBlbmRWYWx1ZTxLLCBWPihtYXA6IE1hcDxLLCBWW10+LCBrZXk6IEssIHZhbHVlOiBWKTogdm9pZCB7XG4gIGNvbnN0IGFyciA9IG1hcC5nZXQoa2V5KTtcbiAgaWYgKGFycikgYXJyLnB1c2godmFsdWUpO1xuICBlbHNlIG1hcC5zZXQoa2V5LCBbdmFsdWVdKTtcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVNxdWFyZUNsYXNzZXMoczogU3RhdGUpOiBTcXVhcmVDbGFzc2VzIHtcbiAgY29uc3Qgc3F1YXJlczogU3F1YXJlQ2xhc3NlcyA9IG5ldyBNYXAoKTtcbiAgaWYgKHMubGFzdERlc3RzICYmIHMuaGlnaGxpZ2h0Lmxhc3REZXN0cylcbiAgICBmb3IgKGNvbnN0IGsgb2Ygcy5sYXN0RGVzdHMpIGFkZFNxdWFyZShzcXVhcmVzLCBrLCAnbGFzdC1kZXN0Jyk7XG4gIGlmIChzLmNoZWNrcyAmJiBzLmhpZ2hsaWdodC5jaGVjaylcbiAgICBmb3IgKGNvbnN0IGNoZWNrIG9mIHMuY2hlY2tzKSBhZGRTcXVhcmUoc3F1YXJlcywgY2hlY2ssICdjaGVjaycpO1xuICBpZiAocy5ob3ZlcmVkKSBhZGRTcXVhcmUoc3F1YXJlcywgcy5ob3ZlcmVkLCAnaG92ZXInKTtcbiAgaWYgKHMuc2VsZWN0ZWQpIHtcbiAgICBpZiAocy5hY3RpdmVDb2xvciA9PT0gJ2JvdGgnIHx8IHMuYWN0aXZlQ29sb3IgPT09IHMudHVybkNvbG9yKVxuICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIHMuc2VsZWN0ZWQsICdzZWxlY3RlZCcpO1xuICAgIGVsc2UgYWRkU3F1YXJlKHNxdWFyZXMsIHMuc2VsZWN0ZWQsICdwcmVzZWxlY3RlZCcpO1xuICAgIGlmIChzLm1vdmFibGUuc2hvd0Rlc3RzKSB7XG4gICAgICBjb25zdCBkZXN0cyA9IHMubW92YWJsZS5kZXN0cz8uZ2V0KHMuc2VsZWN0ZWQpO1xuICAgICAgaWYgKGRlc3RzKVxuICAgICAgICBmb3IgKGNvbnN0IGsgb2YgZGVzdHMpIHtcbiAgICAgICAgICBhZGRTcXVhcmUoc3F1YXJlcywgaywgJ2Rlc3QnICsgKHMucGllY2VzLmhhcyhrKSA/ICcgb2MnIDogJycpKTtcbiAgICAgICAgfVxuICAgICAgY29uc3QgcERlc3RzID0gcy5wcmVtb3ZhYmxlLmRlc3RzO1xuICAgICAgaWYgKHBEZXN0cylcbiAgICAgICAgZm9yIChjb25zdCBrIG9mIHBEZXN0cykge1xuICAgICAgICAgIGFkZFNxdWFyZShzcXVhcmVzLCBrLCAncHJlLWRlc3QnICsgKHMucGllY2VzLmhhcyhrKSA/ICcgb2MnIDogJycpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIGlmIChzLnNlbGVjdGVkUGllY2UpIHtcbiAgICBpZiAocy5kcm9wcGFibGUuc2hvd0Rlc3RzKSB7XG4gICAgICBjb25zdCBkZXN0cyA9IHMuZHJvcHBhYmxlLmRlc3RzPy5nZXQocGllY2VOYW1lT2Yocy5zZWxlY3RlZFBpZWNlKSk7XG4gICAgICBpZiAoZGVzdHMpXG4gICAgICAgIGZvciAoY29uc3QgayBvZiBkZXN0cykge1xuICAgICAgICAgIGFkZFNxdWFyZShzcXVhcmVzLCBrLCAnZGVzdCcpO1xuICAgICAgICB9XG4gICAgICBjb25zdCBwRGVzdHMgPSBzLnByZWRyb3BwYWJsZS5kZXN0cztcbiAgICAgIGlmIChwRGVzdHMpXG4gICAgICAgIGZvciAoY29uc3QgayBvZiBwRGVzdHMpIHtcbiAgICAgICAgICBhZGRTcXVhcmUoc3F1YXJlcywgaywgJ3ByZS1kZXN0JyArIChzLnBpZWNlcy5oYXMoaykgPyAnIG9jJyA6ICcnKSk7XG4gICAgICAgIH1cbiAgICB9XG4gIH1cbiAgY29uc3QgcHJlbW92ZSA9IHMucHJlbW92YWJsZS5jdXJyZW50O1xuICBpZiAocHJlbW92ZSkge1xuICAgIGFkZFNxdWFyZShzcXVhcmVzLCBwcmVtb3ZlLm9yaWcsICdjdXJyZW50LXByZScpO1xuICAgIGFkZFNxdWFyZShzcXVhcmVzLCBwcmVtb3ZlLmRlc3QsICdjdXJyZW50LXByZScgKyAocHJlbW92ZS5wcm9tID8gJyBwcm9tJyA6ICcnKSk7XG4gIH0gZWxzZSBpZiAocy5wcmVkcm9wcGFibGUuY3VycmVudClcbiAgICBhZGRTcXVhcmUoXG4gICAgICBzcXVhcmVzLFxuICAgICAgcy5wcmVkcm9wcGFibGUuY3VycmVudC5rZXksXG4gICAgICAnY3VycmVudC1wcmUnICsgKHMucHJlZHJvcHBhYmxlLmN1cnJlbnQucHJvbSA/ICcgcHJvbScgOiAnJyksXG4gICAgKTtcblxuICBmb3IgKGNvbnN0IHNxaCBvZiBzLmRyYXdhYmxlLnNxdWFyZXMpIHtcbiAgICBhZGRTcXVhcmUoc3F1YXJlcywgc3FoLmtleSwgc3FoLmNsYXNzTmFtZSk7XG4gIH1cblxuICByZXR1cm4gc3F1YXJlcztcbn1cblxuZnVuY3Rpb24gYWRkU3F1YXJlKHNxdWFyZXM6IFNxdWFyZUNsYXNzZXMsIGtleTogc2cuS2V5LCBrbGFzczogc3RyaW5nKTogdm9pZCB7XG4gIGNvbnN0IGNsYXNzZXMgPSBzcXVhcmVzLmdldChrZXkpO1xuICBpZiAoY2xhc3Nlcykgc3F1YXJlcy5zZXQoa2V5LCBgJHtjbGFzc2VzfSAke2tsYXNzfWApO1xuICBlbHNlIHNxdWFyZXMuc2V0KGtleSwga2xhc3MpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJQcm9tb3Rpb24oczogU3RhdGUsIHByb21vdGlvbkVsOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICBjb25zdCBjdXIgPSBzLnByb21vdGlvbi5jdXJyZW50LFxuICAgIGtleSA9IGN1cj8ua2V5LFxuICAgIHBpZWNlcyA9IGN1ciA/IFtjdXIucHJvbW90ZWRQaWVjZSwgY3VyLnBpZWNlXSA6IFtdLFxuICAgIGhhc2ggPSBwcm9tb3Rpb25IYXNoKCEhY3VyLCBrZXksIHBpZWNlcyk7XG4gIGlmIChzLnByb21vdGlvbi5wcmV2UHJvbW90aW9uSGFzaCA9PT0gaGFzaCkgcmV0dXJuO1xuICBzLnByb21vdGlvbi5wcmV2UHJvbW90aW9uSGFzaCA9IGhhc2g7XG5cbiAgaWYgKGtleSkge1xuICAgIGNvbnN0IGFzU2VudGUgPSBzZW50ZVBvdihzLm9yaWVudGF0aW9uKSxcbiAgICAgIGluaXRQb3MgPSBrZXkycG9zKGtleSksXG4gICAgICBjb2xvciA9IGN1ci5waWVjZS5jb2xvcixcbiAgICAgIHByb21vdGlvblNxdWFyZSA9IGNyZWF0ZUVsKCdzZy1wcm9tb3Rpb24tc3F1YXJlJyksXG4gICAgICBwcm9tb3Rpb25DaG9pY2VzID0gY3JlYXRlRWwoJ3NnLXByb21vdGlvbi1jaG9pY2VzJyk7XG4gICAgaWYgKHMub3JpZW50YXRpb24gIT09IGNvbG9yKSBwcm9tb3Rpb25DaG9pY2VzLmNsYXNzTGlzdC5hZGQoJ3JldmVyc2VkJyk7XG4gICAgdHJhbnNsYXRlUmVsKHByb21vdGlvblNxdWFyZSwgcG9zVG9UcmFuc2xhdGVSZWwocy5kaW1lbnNpb25zKShpbml0UG9zLCBhc1NlbnRlKSwgMSk7XG5cbiAgICBmb3IgKGNvbnN0IHAgb2YgcGllY2VzKSB7XG4gICAgICBjb25zdCBwaWVjZU5vZGUgPSBjcmVhdGVFbCgncGllY2UnLCBwaWVjZU5hbWVPZihwKSkgYXMgc2cuUGllY2VOb2RlO1xuICAgICAgcGllY2VOb2RlLnNnQ29sb3IgPSBwLmNvbG9yO1xuICAgICAgcGllY2VOb2RlLnNnUm9sZSA9IHAucm9sZTtcbiAgICAgIHByb21vdGlvbkNob2ljZXMuYXBwZW5kQ2hpbGQocGllY2VOb2RlKTtcbiAgICB9XG5cbiAgICBwcm9tb3Rpb25FbC5pbm5lckhUTUwgPSAnJztcbiAgICBwcm9tb3Rpb25TcXVhcmUuYXBwZW5kQ2hpbGQocHJvbW90aW9uQ2hvaWNlcyk7XG4gICAgcHJvbW90aW9uRWwuYXBwZW5kQ2hpbGQocHJvbW90aW9uU3F1YXJlKTtcbiAgICBzZXREaXNwbGF5KHByb21vdGlvbkVsLCB0cnVlKTtcbiAgfSBlbHNlIHtcbiAgICBzZXREaXNwbGF5KHByb21vdGlvbkVsLCBmYWxzZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcHJvbW90aW9uSGFzaChhY3RpdmU6IGJvb2xlYW4sIGtleTogc2cuS2V5IHwgdW5kZWZpbmVkLCBwaWVjZXM6IHNnLlBpZWNlW10pOiBzdHJpbmcge1xuICByZXR1cm4gW2FjdGl2ZSwga2V5LCBwaWVjZXMubWFwKChwKSA9PiBwaWVjZU5hbWVPZihwKSkuam9pbignICcpXS5qb2luKCcgJyk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgeyBXcmFwRWxlbWVudHMsIFdyYXBFbGVtZW50c0Jvb2xlYW4gfSBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IHdyYXBCb2FyZCwgd3JhcEhhbmQgfSBmcm9tICcuL3dyYXAuanMnO1xuaW1wb3J0ICogYXMgZXZlbnRzIGZyb20gJy4vZXZlbnRzLmpzJztcbmltcG9ydCB7IHJlbmRlckhhbmQgfSBmcm9tICcuL2hhbmRzLmpzJztcbmltcG9ydCB7IHJlbmRlciB9IGZyb20gJy4vcmVuZGVyLmpzJztcblxuZnVuY3Rpb24gYXR0YWNoQm9hcmQoc3RhdGU6IFN0YXRlLCBib2FyZFdyYXA6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gIGNvbnN0IGVsZW1lbnRzID0gd3JhcEJvYXJkKGJvYXJkV3JhcCwgc3RhdGUpO1xuXG4gIC8vIGluIGNhc2Ugb2YgaW5saW5lZCBoYW5kc1xuICBpZiAoZWxlbWVudHMuaGFuZHMpIGF0dGFjaEhhbmRzKHN0YXRlLCBlbGVtZW50cy5oYW5kcy50b3AsIGVsZW1lbnRzLmhhbmRzLmJvdHRvbSk7XG5cbiAgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5ib2FyZCA9IGJvYXJkV3JhcDtcbiAgc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkID0gZWxlbWVudHM7XG4gIHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzLmNsZWFyKCk7XG5cbiAgZXZlbnRzLmJpbmRCb2FyZChzdGF0ZSwgZWxlbWVudHMpO1xuXG4gIHN0YXRlLmRyYXdhYmxlLnByZXZTdmdIYXNoID0gJyc7XG4gIHN0YXRlLnByb21vdGlvbi5wcmV2UHJvbW90aW9uSGFzaCA9ICcnO1xuXG4gIHJlbmRlcihzdGF0ZSwgZWxlbWVudHMpO1xufVxuXG5mdW5jdGlvbiBhdHRhY2hIYW5kcyhzdGF0ZTogU3RhdGUsIGhhbmRUb3BXcmFwPzogSFRNTEVsZW1lbnQsIGhhbmRCb3R0b21XcmFwPzogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgaWYgKCFzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMpIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcyA9IHt9O1xuICBpZiAoIXN0YXRlLmRvbS53cmFwRWxlbWVudHMuaGFuZHMpIHN0YXRlLmRvbS53cmFwRWxlbWVudHMuaGFuZHMgPSB7fTtcblxuICBpZiAoaGFuZFRvcFdyYXApIHtcbiAgICBjb25zdCBoYW5kVG9wID0gd3JhcEhhbmQoaGFuZFRvcFdyYXAsICd0b3AnLCBzdGF0ZSk7XG4gICAgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5oYW5kcy50b3AgPSBoYW5kVG9wV3JhcDtcbiAgICBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMudG9wID0gaGFuZFRvcDtcbiAgICBldmVudHMuYmluZEhhbmQoc3RhdGUsIGhhbmRUb3ApO1xuICAgIHJlbmRlckhhbmQoc3RhdGUsIGhhbmRUb3ApO1xuICB9XG4gIGlmIChoYW5kQm90dG9tV3JhcCkge1xuICAgIGNvbnN0IGhhbmRCb3R0b20gPSB3cmFwSGFuZChoYW5kQm90dG9tV3JhcCwgJ2JvdHRvbScsIHN0YXRlKTtcbiAgICBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmhhbmRzLmJvdHRvbSA9IGhhbmRCb3R0b21XcmFwO1xuICAgIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcy5ib3R0b20gPSBoYW5kQm90dG9tO1xuICAgIGV2ZW50cy5iaW5kSGFuZChzdGF0ZSwgaGFuZEJvdHRvbSk7XG4gICAgcmVuZGVySGFuZChzdGF0ZSwgaGFuZEJvdHRvbSk7XG4gIH1cblxuICBpZiAoaGFuZFRvcFdyYXAgfHwgaGFuZEJvdHRvbVdyYXApIHtcbiAgICBzdGF0ZS5kb20uYm91bmRzLmhhbmRzLmJvdW5kcy5jbGVhcigpO1xuICAgIHN0YXRlLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMuY2xlYXIoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVkcmF3QWxsKHdyYXBFbGVtZW50czogV3JhcEVsZW1lbnRzLCBzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHdyYXBFbGVtZW50cy5ib2FyZCkgYXR0YWNoQm9hcmQoc3RhdGUsIHdyYXBFbGVtZW50cy5ib2FyZCk7XG4gIGlmICh3cmFwRWxlbWVudHMuaGFuZHMgJiYgIXN0YXRlLmhhbmRzLmlubGluZWQpXG4gICAgYXR0YWNoSGFuZHMoc3RhdGUsIHdyYXBFbGVtZW50cy5oYW5kcy50b3AsIHdyYXBFbGVtZW50cy5oYW5kcy5ib3R0b20pO1xuXG4gIC8vIHNoYXBlcyBtaWdodCBkZXBlbmQgYm90aCBvbiBib2FyZCBhbmQgaGFuZHMgLSByZWRyYXcgb25seSBhZnRlciBib3RoIGFyZSBkb25lXG4gIHN0YXRlLmRvbS5yZWRyYXdTaGFwZXMoKTtcblxuICBpZiAoc3RhdGUuZXZlbnRzLmluc2VydClcbiAgICBzdGF0ZS5ldmVudHMuaW5zZXJ0KHdyYXBFbGVtZW50cy5ib2FyZCAmJiBzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQsIHtcbiAgICAgIHRvcDogd3JhcEVsZW1lbnRzLmhhbmRzPy50b3AgJiYgc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzPy50b3AsXG4gICAgICBib3R0b206IHdyYXBFbGVtZW50cy5oYW5kcz8uYm90dG9tICYmIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcz8uYm90dG9tLFxuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGV0YWNoRWxlbWVudHMod2ViOiBXcmFwRWxlbWVudHNCb29sZWFuLCBzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHdlYi5ib2FyZCkge1xuICAgIHN0YXRlLmRvbS53cmFwRWxlbWVudHMuYm9hcmQgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzLmNsZWFyKCk7XG4gIH1cbiAgaWYgKHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcyAmJiBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmhhbmRzKSB7XG4gICAgaWYgKHdlYi5oYW5kcz8udG9wKSB7XG4gICAgICBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmhhbmRzLnRvcCA9IHVuZGVmaW5lZDtcbiAgICAgIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcy50b3AgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmICh3ZWIuaGFuZHM/LmJvdHRvbSkge1xuICAgICAgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5oYW5kcy5ib3R0b20gPSB1bmRlZmluZWQ7XG4gICAgICBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMuYm90dG9tID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAod2ViLmhhbmRzPy50b3AgfHwgd2ViLmhhbmRzPy5ib3R0b20pIHtcbiAgICAgIHN0YXRlLmRvbS5ib3VuZHMuaGFuZHMuYm91bmRzLmNsZWFyKCk7XG4gICAgICBzdGF0ZS5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzLmNsZWFyKCk7XG4gICAgfVxuICB9XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBDb25maWcgfSBmcm9tICcuL2NvbmZpZy5qcyc7XG5pbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSB7IERyYXdTaGFwZSwgU3F1YXJlSGlnaGxpZ2h0IH0gZnJvbSAnLi9kcmF3LmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgKiBhcyBib2FyZCBmcm9tICcuL2JvYXJkLmpzJztcbmltcG9ydCB7IGFkZFRvSGFuZCwgcmVtb3ZlRnJvbUhhbmQgfSBmcm9tICcuL2hhbmRzLmpzJztcbmltcG9ydCB7IGluZmVyRGltZW5zaW9ucywgYm9hcmRUb1NmZW4sIGhhbmRzVG9TZmVuIH0gZnJvbSAnLi9zZmVuLmpzJztcbmltcG9ydCB7IGFwcGx5QW5pbWF0aW9uLCBjb25maWd1cmUgfSBmcm9tICcuL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBhbmltLCByZW5kZXIgfSBmcm9tICcuL2FuaW0uanMnO1xuaW1wb3J0IHsgY2FuY2VsIGFzIGRyYWdDYW5jZWwsIGRyYWdOZXdQaWVjZSB9IGZyb20gJy4vZHJhZy5qcyc7XG5pbXBvcnQgeyBkZXRhY2hFbGVtZW50cywgcmVkcmF3QWxsIH0gZnJvbSAnLi9kb20uanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFwaSB7XG4gIC8vIGF0dGFjaCBlbGVtZW50cyB0byBjdXJyZW50IHNnIGluc3RhbmNlXG4gIGF0dGFjaCh3cmFwRWxlbWVudHM6IHNnLldyYXBFbGVtZW50cyk6IHZvaWQ7XG5cbiAgLy8gZGV0YWNoIGVsZW1lbnRzIGZyb20gY3VycmVudCBzZyBpbnN0YW5jZVxuICBkZXRhY2god3JhcEVsZW1lbnRzQm9vbGVhbjogc2cuV3JhcEVsZW1lbnRzQm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gcmVjb25maWd1cmUgdGhlIGluc3RhbmNlLiBBY2NlcHRzIGFsbCBjb25maWcgb3B0aW9uc1xuICAvLyBib2FyZCB3aWxsIGJlIGFuaW1hdGVkIGFjY29yZGluZ2x5LCBpZiBhbmltYXRpb25zIGFyZSBlbmFibGVkXG4gIHNldChjb25maWc6IENvbmZpZywgc2tpcEFuaW1hdGlvbj86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIHJlYWQgc2hvZ2lncm91bmQgc3RhdGU7IHdyaXRlIGF0IHlvdXIgb3duIHJpc2tzXG4gIHN0YXRlOiBTdGF0ZTtcblxuICAvLyBnZXQgdGhlIHBvc2l0aW9uIG9uIHRoZSBib2FyZCBpbiBGb3JzeXRoIG5vdGF0aW9uXG4gIGdldEJvYXJkU2ZlbigpOiBzZy5Cb2FyZFNmZW47XG5cbiAgLy8gZ2V0IHRoZSBwaWVjZXMgaW4gaGFuZCBpbiBGb3JzeXRoIG5vdGF0aW9uXG4gIGdldEhhbmRzU2ZlbigpOiBzZy5IYW5kc1NmZW47XG5cbiAgLy8gY2hhbmdlIHRoZSB2aWV3IGFuZ2xlXG4gIHRvZ2dsZU9yaWVudGF0aW9uKCk6IHZvaWQ7XG5cbiAgLy8gcGVyZm9ybSBhIG1vdmUgcHJvZ3JhbW1hdGljYWxseVxuICBtb3ZlKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gcGVyZm9ybSBhIGRyb3AgcHJvZ3JhbW1hdGljYWxseSwgYnkgZGVmYXVsdCBwaWVjZSBpcyB0YWtlbiBmcm9tIGhhbmRcbiAgZHJvcChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tPzogYm9vbGVhbiwgc3BhcmU/OiBib29sZWFuKTogdm9pZDtcblxuICAvLyBhZGQgYW5kL29yIHJlbW92ZSBhcmJpdHJhcnkgcGllY2VzIG9uIHRoZSBib2FyZFxuICBzZXRQaWVjZXMocGllY2VzOiBzZy5QaWVjZXNEaWZmKTogdm9pZDtcblxuICAvLyBhZGQgcGllY2Uucm9sZSB0byBoYW5kIG9mIHBpZWNlLmNvbG9yXG4gIGFkZFRvSGFuZChwaWVjZTogc2cuUGllY2UsIGNvdW50PzogbnVtYmVyKTogdm9pZDtcblxuICAvLyByZW1vdmUgcGllY2Uucm9sZSBmcm9tIGhhbmQgb2YgcGllY2UuY29sb3JcbiAgcmVtb3ZlRnJvbUhhbmQocGllY2U6IHNnLlBpZWNlLCBjb3VudD86IG51bWJlcik6IHZvaWQ7XG5cbiAgLy8gY2xpY2sgYSBzcXVhcmUgcHJvZ3JhbW1hdGljYWxseVxuICBzZWxlY3RTcXVhcmUoa2V5OiBzZy5LZXkgfCBudWxsLCBwcm9tPzogYm9vbGVhbiwgZm9yY2U/OiBib29sZWFuKTogdm9pZDtcblxuICAvLyBzZWxlY3QgYSBwaWVjZSBmcm9tIGhhbmQgdG8gZHJvcCBwcm9ncmFtYXRpY2FsbHksIGJ5IGRlZmF1bHQgcGllY2UgaW4gaGFuZCBpcyBzZWxlY3RlZFxuICBzZWxlY3RQaWVjZShwaWVjZTogc2cuUGllY2UgfCBudWxsLCBzcGFyZT86IGJvb2xlYW4sIGZvcmNlPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gcGxheSB0aGUgY3VycmVudCBwcmVtb3ZlLCBpZiBhbnk7IHJldHVybnMgdHJ1ZSBpZiBwcmVtb3ZlIHdhcyBwbGF5ZWRcbiAgcGxheVByZW1vdmUoKTogYm9vbGVhbjtcblxuICAvLyBjYW5jZWwgdGhlIGN1cnJlbnQgcHJlbW92ZSwgaWYgYW55XG4gIGNhbmNlbFByZW1vdmUoKTogdm9pZDtcblxuICAvLyBwbGF5IHRoZSBjdXJyZW50IHByZWRyb3AsIGlmIGFueTsgcmV0dXJucyB0cnVlIGlmIHByZW1vdmUgd2FzIHBsYXllZFxuICBwbGF5UHJlZHJvcCgpOiBib29sZWFuO1xuXG4gIC8vIGNhbmNlbCB0aGUgY3VycmVudCBwcmVkcm9wLCBpZiBhbnlcbiAgY2FuY2VsUHJlZHJvcCgpOiB2b2lkO1xuXG4gIC8vIGNhbmNlbCB0aGUgY3VycmVudCBtb3ZlIG9yIGRyb3AgYmVpbmcgbWFkZSwgcHJlbW92ZXMgYW5kIHByZWRyb3BzXG4gIGNhbmNlbE1vdmVPckRyb3AoKTogdm9pZDtcblxuICAvLyBjYW5jZWwgY3VycmVudCBtb3ZlIG9yIGRyb3AgYW5kIHByZXZlbnQgZnVydGhlciBvbmVzXG4gIHN0b3AoKTogdm9pZDtcblxuICAvLyBwcm9ncmFtbWF0aWNhbGx5IGRyYXcgdXNlciBzaGFwZXNcbiAgc2V0U2hhcGVzKHNoYXBlczogRHJhd1NoYXBlW10pOiB2b2lkO1xuXG4gIC8vIHByb2dyYW1tYXRpY2FsbHkgZHJhdyBhdXRvIHNoYXBlc1xuICBzZXRBdXRvU2hhcGVzKHNoYXBlczogRHJhd1NoYXBlW10pOiB2b2lkO1xuXG4gIC8vIHByb2dyYW1tYXRpY2FsbHkgaGlnaGxpZ2h0IHNxdWFyZXNcbiAgc2V0U3F1YXJlSGlnaGxpZ2h0cyhzcXVhcmVzOiBTcXVhcmVIaWdobGlnaHRbXSk6IHZvaWQ7XG5cbiAgLy8gZm9yIHBpZWNlIGRyb3BwaW5nIGFuZCBib2FyZCBlZGl0b3JzXG4gIGRyYWdOZXdQaWVjZShwaWVjZTogc2cuUGllY2UsIGV2ZW50OiBzZy5Nb3VjaEV2ZW50LCBzcGFyZT86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIHVuYmluZHMgYWxsIGV2ZW50c1xuICAvLyAoaW1wb3J0YW50IGZvciBkb2N1bWVudC13aWRlIGV2ZW50cyBsaWtlIHNjcm9sbCBhbmQgbW91c2Vtb3ZlKVxuICBkZXN0cm95OiBzZy5VbmJpbmQ7XG59XG5cbi8vIHNlZSBBUEkgdHlwZXMgYW5kIGRvY3VtZW50YXRpb25zIGluIGFwaS5kLnRzXG5leHBvcnQgZnVuY3Rpb24gc3RhcnQoc3RhdGU6IFN0YXRlKTogQXBpIHtcbiAgcmV0dXJuIHtcbiAgICBhdHRhY2god3JhcEVsZW1lbnRzOiBzZy5XcmFwRWxlbWVudHMpOiB2b2lkIHtcbiAgICAgIHJlZHJhd0FsbCh3cmFwRWxlbWVudHMsIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgZGV0YWNoKHdyYXBFbGVtZW50c0Jvb2xlYW46IHNnLldyYXBFbGVtZW50c0Jvb2xlYW4pOiB2b2lkIHtcbiAgICAgIGRldGFjaEVsZW1lbnRzKHdyYXBFbGVtZW50c0Jvb2xlYW4sIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc2V0KGNvbmZpZzogQ29uZmlnLCBza2lwQW5pbWF0aW9uPzogYm9vbGVhbik6IHZvaWQge1xuICAgICAgZnVuY3Rpb24gZ2V0QnlQYXRoKHBhdGg6IHN0cmluZywgb2JqOiBhbnkpIHtcbiAgICAgICAgY29uc3QgcHJvcGVydGllcyA9IHBhdGguc3BsaXQoJy4nKTtcbiAgICAgICAgcmV0dXJuIHByb3BlcnRpZXMucmVkdWNlKChwcmV2LCBjdXJyKSA9PiBwcmV2ICYmIHByZXZbY3Vycl0sIG9iaik7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGZvcmNlUmVkcmF3UHJvcHM6IChgJHtrZXlvZiBDb25maWd9YCB8IGAke2tleW9mIENvbmZpZ30uJHtzdHJpbmd9YClbXSA9IFtcbiAgICAgICAgJ29yaWVudGF0aW9uJyxcbiAgICAgICAgJ3ZpZXdPbmx5JyxcbiAgICAgICAgJ2Nvb3JkaW5hdGVzLmVuYWJsZWQnLFxuICAgICAgICAnY29vcmRpbmF0ZXMubm90YXRpb24nLFxuICAgICAgICAnZHJhd2FibGUudmlzaWJsZScsXG4gICAgICAgICdoYW5kcy5pbmxpbmVkJyxcbiAgICAgIF07XG4gICAgICBjb25zdCBuZXdEaW1zID0gY29uZmlnLnNmZW4/LmJvYXJkICYmIGluZmVyRGltZW5zaW9ucyhjb25maWcuc2Zlbi5ib2FyZCk7XG4gICAgICBjb25zdCB0b1JlZHJhdyA9XG4gICAgICAgIGZvcmNlUmVkcmF3UHJvcHMuc29tZSgocCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGNSZXMgPSBnZXRCeVBhdGgocCwgY29uZmlnKTtcbiAgICAgICAgICByZXR1cm4gY1JlcyAmJiBjUmVzICE9PSBnZXRCeVBhdGgocCwgc3RhdGUpO1xuICAgICAgICB9KSB8fFxuICAgICAgICAhIShcbiAgICAgICAgICBuZXdEaW1zICYmXG4gICAgICAgICAgKG5ld0RpbXMuZmlsZXMgIT09IHN0YXRlLmRpbWVuc2lvbnMuZmlsZXMgfHwgbmV3RGltcy5yYW5rcyAhPT0gc3RhdGUuZGltZW5zaW9ucy5yYW5rcylcbiAgICAgICAgKSB8fFxuICAgICAgICAhIWNvbmZpZy5oYW5kcz8ucm9sZXM/LmV2ZXJ5KChyLCBpKSA9PiByID09PSBzdGF0ZS5oYW5kcy5yb2xlc1tpXSk7XG5cbiAgICAgIGlmICh0b1JlZHJhdykge1xuICAgICAgICBib2FyZC5yZXNldChzdGF0ZSk7XG4gICAgICAgIGNvbmZpZ3VyZShzdGF0ZSwgY29uZmlnKTtcbiAgICAgICAgcmVkcmF3QWxsKHN0YXRlLmRvbS53cmFwRWxlbWVudHMsIHN0YXRlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFwcGx5QW5pbWF0aW9uKHN0YXRlLCBjb25maWcpO1xuICAgICAgICAoY29uZmlnLnNmZW4/LmJvYXJkICYmICFza2lwQW5pbWF0aW9uID8gYW5pbSA6IHJlbmRlcikoXG4gICAgICAgICAgKHN0YXRlKSA9PiBjb25maWd1cmUoc3RhdGUsIGNvbmZpZyksXG4gICAgICAgICAgc3RhdGUsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHN0YXRlLFxuXG4gICAgZ2V0Qm9hcmRTZmVuOiAoKSA9PiBib2FyZFRvU2ZlbihzdGF0ZS5waWVjZXMsIHN0YXRlLmRpbWVuc2lvbnMsIHN0YXRlLmZvcnN5dGgudG9Gb3JzeXRoKSxcblxuICAgIGdldEhhbmRzU2ZlbjogKCkgPT5cbiAgICAgIGhhbmRzVG9TZmVuKHN0YXRlLmhhbmRzLmhhbmRNYXAsIHN0YXRlLmhhbmRzLnJvbGVzLCBzdGF0ZS5mb3JzeXRoLnRvRm9yc3l0aCksXG5cbiAgICB0b2dnbGVPcmllbnRhdGlvbigpOiB2b2lkIHtcbiAgICAgIGJvYXJkLnRvZ2dsZU9yaWVudGF0aW9uKHN0YXRlKTtcbiAgICAgIHJlZHJhd0FsbChzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIG1vdmUob3JpZywgZGVzdCwgcHJvbSk6IHZvaWQge1xuICAgICAgYW5pbShcbiAgICAgICAgKHN0YXRlKSA9PlxuICAgICAgICAgIGJvYXJkLmJhc2VNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0LCBwcm9tIHx8IHN0YXRlLnByb21vdGlvbi5mb3JjZU1vdmVQcm9tb3Rpb24ob3JpZywgZGVzdCkpLFxuICAgICAgICBzdGF0ZSxcbiAgICAgICk7XG4gICAgfSxcblxuICAgIGRyb3AocGllY2UsIGtleSwgcHJvbSwgc3BhcmUpOiB2b2lkIHtcbiAgICAgIGFuaW0oKHN0YXRlKSA9PiB7XG4gICAgICAgIHN0YXRlLmRyb3BwYWJsZS5zcGFyZSA9ICEhc3BhcmU7XG4gICAgICAgIGJvYXJkLmJhc2VEcm9wKHN0YXRlLCBwaWVjZSwga2V5LCBwcm9tIHx8IHN0YXRlLnByb21vdGlvbi5mb3JjZURyb3BQcm9tb3Rpb24ocGllY2UsIGtleSkpO1xuICAgICAgfSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzZXRQaWVjZXMocGllY2VzKTogdm9pZCB7XG4gICAgICBhbmltKChzdGF0ZSkgPT4gYm9hcmQuc2V0UGllY2VzKHN0YXRlLCBwaWVjZXMpLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGFkZFRvSGFuZChwaWVjZTogc2cuUGllY2UsIGNvdW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgIHJlbmRlcigoc3RhdGUpID0+IGFkZFRvSGFuZChzdGF0ZSwgcGllY2UsIGNvdW50KSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICByZW1vdmVGcm9tSGFuZChwaWVjZTogc2cuUGllY2UsIGNvdW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgIHJlbmRlcigoc3RhdGUpID0+IHJlbW92ZUZyb21IYW5kKHN0YXRlLCBwaWVjZSwgY291bnQpLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHNlbGVjdFNxdWFyZShrZXksIHByb20sIGZvcmNlKTogdm9pZCB7XG4gICAgICBpZiAoa2V5KSBhbmltKChzdGF0ZSkgPT4gYm9hcmQuc2VsZWN0U3F1YXJlKHN0YXRlLCBrZXksIHByb20sIGZvcmNlKSwgc3RhdGUpO1xuICAgICAgZWxzZSBpZiAoc3RhdGUuc2VsZWN0ZWQpIHtcbiAgICAgICAgYm9hcmQudW5zZWxlY3Qoc3RhdGUpO1xuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHNlbGVjdFBpZWNlKHBpZWNlLCBzcGFyZSwgZm9yY2UpOiB2b2lkIHtcbiAgICAgIGlmIChwaWVjZSkgcmVuZGVyKChzdGF0ZSkgPT4gYm9hcmQuc2VsZWN0UGllY2Uoc3RhdGUsIHBpZWNlLCBzcGFyZSwgZm9yY2UsIHRydWUpLCBzdGF0ZSk7XG4gICAgICBlbHNlIGlmIChzdGF0ZS5zZWxlY3RlZFBpZWNlKSB7XG4gICAgICAgIGJvYXJkLnVuc2VsZWN0KHN0YXRlKTtcbiAgICAgICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBwbGF5UHJlbW92ZSgpOiBib29sZWFuIHtcbiAgICAgIGlmIChzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQpIHtcbiAgICAgICAgaWYgKGFuaW0oYm9hcmQucGxheVByZW1vdmUsIHN0YXRlKSkgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vIGlmIHRoZSBwcmVtb3ZlIGNvdWxkbid0IGJlIHBsYXllZCwgcmVkcmF3IHRvIGNsZWFyIGl0IHVwXG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgcGxheVByZWRyb3AoKTogYm9vbGVhbiB7XG4gICAgICBpZiAoc3RhdGUucHJlZHJvcHBhYmxlLmN1cnJlbnQpIHtcbiAgICAgICAgaWYgKGFuaW0oYm9hcmQucGxheVByZWRyb3AsIHN0YXRlKSkgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vIGlmIHRoZSBwcmVkcm9wIGNvdWxkbid0IGJlIHBsYXllZCwgcmVkcmF3IHRvIGNsZWFyIGl0IHVwXG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgY2FuY2VsUHJlbW92ZSgpOiB2b2lkIHtcbiAgICAgIHJlbmRlcihib2FyZC51bnNldFByZW1vdmUsIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgY2FuY2VsUHJlZHJvcCgpOiB2b2lkIHtcbiAgICAgIHJlbmRlcihib2FyZC51bnNldFByZWRyb3AsIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgY2FuY2VsTW92ZU9yRHJvcCgpOiB2b2lkIHtcbiAgICAgIHJlbmRlcigoc3RhdGUpID0+IHtcbiAgICAgICAgYm9hcmQuY2FuY2VsTW92ZU9yRHJvcChzdGF0ZSk7XG4gICAgICAgIGRyYWdDYW5jZWwoc3RhdGUpO1xuICAgICAgfSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzdG9wKCk6IHZvaWQge1xuICAgICAgcmVuZGVyKChzdGF0ZSkgPT4ge1xuICAgICAgICBib2FyZC5zdG9wKHN0YXRlKTtcbiAgICAgIH0sIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc2V0QXV0b1NoYXBlcyhzaGFwZXM6IERyYXdTaGFwZVtdKTogdm9pZCB7XG4gICAgICByZW5kZXIoKHN0YXRlKSA9PiAoc3RhdGUuZHJhd2FibGUuYXV0b1NoYXBlcyA9IHNoYXBlcyksIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc2V0U2hhcGVzKHNoYXBlczogRHJhd1NoYXBlW10pOiB2b2lkIHtcbiAgICAgIHJlbmRlcigoc3RhdGUpID0+IChzdGF0ZS5kcmF3YWJsZS5zaGFwZXMgPSBzaGFwZXMpLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHNldFNxdWFyZUhpZ2hsaWdodHMoc3F1YXJlczogU3F1YXJlSGlnaGxpZ2h0W10pOiB2b2lkIHtcbiAgICAgIHJlbmRlcigoc3RhdGUpID0+IChzdGF0ZS5kcmF3YWJsZS5zcXVhcmVzID0gc3F1YXJlcyksIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgZHJhZ05ld1BpZWNlKHBpZWNlLCBldmVudCwgc3BhcmUpOiB2b2lkIHtcbiAgICAgIGRyYWdOZXdQaWVjZShzdGF0ZSwgcGllY2UsIGV2ZW50LCBzcGFyZSk7XG4gICAgfSxcblxuICAgIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgICBib2FyZC5zdG9wKHN0YXRlKTtcbiAgICAgIHN0YXRlLmRvbS51bmJpbmQoKTtcbiAgICAgIHN0YXRlLmRvbS5kZXN0cm95ZWQgPSB0cnVlO1xuICAgIH0sXG4gIH07XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBBbmltQ3VycmVudCB9IGZyb20gJy4vYW5pbS5qcyc7XG5pbXBvcnQgdHlwZSB7IERyYWdDdXJyZW50IH0gZnJvbSAnLi9kcmFnLmpzJztcbmltcG9ydCB0eXBlIHsgRHJhd2FibGUgfSBmcm9tICcuL2RyYXcuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBIZWFkbGVzc1N0YXRlIHtcbiAgcGllY2VzOiBzZy5QaWVjZXM7XG4gIG9yaWVudGF0aW9uOiBzZy5Db2xvcjsgLy8gYm9hcmQgb3JpZW50YXRpb24uIHNlbnRlIHwgZ290ZVxuICBkaW1lbnNpb25zOiBzZy5EaW1lbnNpb25zOyAvLyBib2FyZCBkaW1lbnNpb25zIC0gbWF4IDE2eDE2XG4gIHR1cm5Db2xvcjogc2cuQ29sb3I7IC8vIHR1cm4gdG8gcGxheS4gc2VudGUgfCBnb3RlXG4gIGFjdGl2ZUNvbG9yPzogc2cuQ29sb3IgfCAnYm90aCc7IC8vIGNvbG9yIHRoYXQgY2FuIG1vdmUgb3IgZHJvcC4gc2VudGUgfCBnb3RlIHwgYm90aCB8IHVuZGVmaW5lZFxuICBjaGVja3M/OiBzZy5LZXlbXTsgLy8gc3F1YXJlcyBjdXJyZW50bHkgaW4gY2hlY2sgW1wiNWFcIl1cbiAgbGFzdERlc3RzPzogc2cuS2V5W107IC8vIHNxdWFyZXMgcGFydCBvZiB0aGUgbGFzdCBtb3ZlIG9yIGRyb3AgW1wiMmJcIjsgXCI4aFwiXVxuICBsYXN0UGllY2U/OiBzZy5QaWVjZTsgLy8gcGllY2UgcGFydCBvZiB0aGUgbGFzdCBkcm9wXG4gIHNlbGVjdGVkPzogc2cuS2V5OyAvLyBzcXVhcmUgY3VycmVudGx5IHNlbGVjdGVkIFwiMWFcIlxuICBzZWxlY3RlZFBpZWNlPzogc2cuUGllY2U7IC8vIHBpZWNlIGluIGhhbmQgY3VycmVudGx5IHNlbGVjdGVkXG4gIGhvdmVyZWQ/OiBzZy5LZXk7IC8vIHNxdWFyZSBjdXJyZW50bHkgYmVpbmcgaG92ZXJlZFxuICB2aWV3T25seTogYm9vbGVhbjsgLy8gZG9uJ3QgYmluZCBldmVudHM6IHRoZSB1c2VyIHdpbGwgbmV2ZXIgYmUgYWJsZSB0byBtb3ZlIHBpZWNlcyBhcm91bmRcbiAgc3F1YXJlUmF0aW86IHNnLk51bWJlclBhaXI7IC8vIHJhdGlvIG9mIHRoZSBib2FyZCBbd2lkdGgsIGhlaWdodF1cbiAgZGlzYWJsZUNvbnRleHRNZW51OiBib29sZWFuOyAvLyBiZWNhdXNlIHdobyBuZWVkcyBhIGNvbnRleHQgbWVudSBvbiBhIHNob2dpIGJvYXJkXG4gIGJsb2NrVG91Y2hTY3JvbGw6IGJvb2xlYW47IC8vIGJsb2NrIHNjcm9sbGluZyB2aWEgdG91Y2ggZHJhZ2dpbmcgb24gdGhlIGJvYXJkLCBlLmcuIGZvciBjb29yZGluYXRlIHRyYWluaW5nXG4gIHNjYWxlRG93blBpZWNlczogYm9vbGVhbjtcbiAgY29vcmRpbmF0ZXM6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBpbmNsdWRlIGNvb3JkcyBhdHRyaWJ1dGVzXG4gICAgZmlsZXM6IHNnLk5vdGF0aW9uO1xuICAgIHJhbmtzOiBzZy5Ob3RhdGlvbjtcbiAgfTtcbiAgaGlnaGxpZ2h0OiB7XG4gICAgbGFzdERlc3RzOiBib29sZWFuOyAvLyBhZGQgbGFzdC1kZXN0IGNsYXNzIHRvIHNxdWFyZXMgYW5kIHBpZWNlc1xuICAgIGNoZWNrOiBib29sZWFuOyAvLyBhZGQgY2hlY2sgY2xhc3MgdG8gc3F1YXJlc1xuICAgIGNoZWNrUm9sZXM6IHNnLlJvbGVTdHJpbmdbXTsgLy8gcm9sZXMgdG8gYmUgaGlnaGxpZ2h0ZWQgd2hlbiBjaGVjayBpcyBib29sZWFuIGlzIHBhc3NlZCBmcm9tIGNvbmZpZ1xuICAgIGhvdmVyZWQ6IGJvb2xlYW47IC8vIGFkZCBob3ZlciBjbGFzcyB0byBob3ZlcmVkIHNxdWFyZXNcbiAgfTtcbiAgYW5pbWF0aW9uOiB7IGVuYWJsZWQ6IGJvb2xlYW47IGhhbmRzOiBib29sZWFuOyBkdXJhdGlvbjogbnVtYmVyOyBjdXJyZW50PzogQW5pbUN1cnJlbnQgfTtcbiAgaGFuZHM6IHtcbiAgICBpbmxpbmVkOiBib29sZWFuOyAvLyBhdHRhY2hlcyBzZy1oYW5kcyBkaXJlY3RseSB0byBzZy13cmFwLCBpZ25vcmVzIEhUTUxFbGVtZW50cyBwYXNzZWQgdG8gU2hvZ2lncm91bmRcbiAgICBoYW5kTWFwOiBzZy5IYW5kcztcbiAgICByb2xlczogc2cuUm9sZVN0cmluZ1tdOyAvLyByb2xlcyB0byByZW5kZXIgaW4gc2ctaGFuZFxuICB9O1xuICBtb3ZhYmxlOiB7XG4gICAgZnJlZTogYm9vbGVhbjsgLy8gYWxsIG1vdmVzIGFyZSB2YWxpZCAtIGJvYXJkIGVkaXRvclxuICAgIGRlc3RzPzogc2cuTW92ZURlc3RzOyAvLyB2YWxpZCBtb3Zlcy4ge1wiN2dcIiBbXCI3ZlwiXSBcIjVpXCIgW1wiNGhcIiBcIjVoXCIgXCI2aFwiXX1cbiAgICBzaG93RGVzdHM6IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBkZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBldmVudHM6IHtcbiAgICAgIGFmdGVyPzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tOiBib29sZWFuLCBtZXRhZGF0YTogc2cuTW92ZU1ldGFkYXRhKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIG1vdmUgaGFzIGJlZW4gcGxheWVkXG4gICAgfTtcbiAgfTtcbiAgZHJvcHBhYmxlOiB7XG4gICAgZnJlZTogYm9vbGVhbjsgLy8gYWxsIGRyb3BzIGFyZSB2YWxpZCAtIGJvYXJkIGVkaXRvclxuICAgIGRlc3RzPzogc2cuRHJvcERlc3RzOyAvLyB2YWxpZCBkcm9wcy4ge1wic2VudGUgcGF3blwiIFtcIjNhXCIgXCI0YVwiXSBcInNlbnRlIGxhbmNlXCIgW1wiM2FcIiBcIjNjXCJdfVxuICAgIHNob3dEZXN0czogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIGRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIHNwYXJlOiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIHJlbW92ZSBkcm9wcGVkIHBpZWNlIGZyb20gaGFuZCBhZnRlciBkcm9wIC0gYm9hcmQgZWRpdG9yXG4gICAgZXZlbnRzOiB7XG4gICAgICBhZnRlcj86IChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tOiBib29sZWFuLCBtZXRhZGF0YTogc2cuTW92ZU1ldGFkYXRhKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIGRyb3AgaGFzIGJlZW4gcGxheWVkXG4gICAgfTtcbiAgfTtcbiAgcHJlbW92YWJsZToge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGFsbG93IHByZW1vdmVzIGZvciBjb2xvciB0aGF0IGNhbiBub3QgbW92ZVxuICAgIHNob3dEZXN0czogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIHByZS1kZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBkZXN0cz86IHNnLktleVtdOyAvLyBwcmVtb3ZlIGRlc3RpbmF0aW9ucyBmb3IgdGhlIGN1cnJlbnQgc2VsZWN0aW9uXG4gICAgY3VycmVudD86IHsgb3JpZzogc2cuS2V5OyBkZXN0OiBzZy5LZXk7IHByb206IGJvb2xlYW4gfTtcbiAgICBnZW5lcmF0ZT86IChrZXk6IHNnLktleSwgcGllY2VzOiBzZy5QaWVjZXMpID0+IHNnLktleVtdO1xuICAgIGV2ZW50czoge1xuICAgICAgc2V0PzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tOiBib29sZWFuKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZW1vdmUgaGFzIGJlZW4gc2V0XG4gICAgICB1bnNldD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlbW92ZSBoYXMgYmVlbiB1bnNldFxuICAgIH07XG4gIH07XG4gIHByZWRyb3BwYWJsZToge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGFsbG93IHByZWRyb3BzIGZvciBjb2xvciB0aGF0IGNhbiBub3QgbW92ZVxuICAgIHNob3dEZXN0czogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIHByZS1kZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBkZXN0cz86IHNnLktleVtdOyAvLyBwcmVtb3ZlIGRlc3RpbmF0aW9ucyBmb3IgdGhlIGRyb3Agc2VsZWN0aW9uXG4gICAgY3VycmVudD86IHsgcGllY2U6IHNnLlBpZWNlOyBrZXk6IHNnLktleTsgcHJvbTogYm9vbGVhbiB9O1xuICAgIGdlbmVyYXRlPzogKHBpZWNlOiBzZy5QaWVjZSwgcGllY2VzOiBzZy5QaWVjZXMpID0+IHNnLktleVtdO1xuICAgIGV2ZW50czoge1xuICAgICAgc2V0PzogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb206IGJvb2xlYW4pID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlZHJvcCBoYXMgYmVlbiBzZXRcbiAgICAgIHVuc2V0PzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVkcm9wIGhhcyBiZWVuIHVuc2V0XG4gICAgfTtcbiAgfTtcbiAgZHJhZ2dhYmxlOiB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjsgLy8gYWxsb3cgbW92ZXMgJiBwcmVtb3ZlcyB0byB1c2UgZHJhZyduIGRyb3BcbiAgICBkaXN0YW5jZTogbnVtYmVyOyAvLyBtaW5pbXVtIGRpc3RhbmNlIHRvIGluaXRpYXRlIGEgZHJhZzsgaW4gcGl4ZWxzXG4gICAgYXV0b0Rpc3RhbmNlOiBib29sZWFuOyAvLyBsZXRzIHNob2dpZ3JvdW5kIHNldCBkaXN0YW5jZSB0byB6ZXJvIHdoZW4gdXNlciBkcmFncyBwaWVjZXNcbiAgICBzaG93R2hvc3Q6IGJvb2xlYW47IC8vIHNob3cgZ2hvc3Qgb2YgcGllY2UgYmVpbmcgZHJhZ2dlZFxuICAgIHNob3dUb3VjaFNxdWFyZU92ZXJsYXk6IGJvb2xlYW47IC8vIHNob3cgc3F1YXJlIG92ZXJsYXkgb24gdGhlIHNxdWFyZSB0aGF0IGlzIGN1cnJlbnRseSBiZWluZyBob3ZlcmVkLCB0b3VjaCBvbmx5XG4gICAgZGVsZXRlT25Ecm9wT2ZmOiBib29sZWFuOyAvLyBkZWxldGUgYSBwaWVjZSB3aGVuIGl0IGlzIGRyb3BwZWQgb2ZmIHRoZSBib2FyZCAtIGJvYXJkIGVkaXRvclxuICAgIGFkZFRvSGFuZE9uRHJvcE9mZjogYm9vbGVhbjsgLy8gYWRkIGEgcGllY2UgdG8gaGFuZCB3aGVuIGl0IGlzIGRyb3BwZWQgb24gaXQsIHJlcXVpcmVzIGRlbGV0ZU9uRHJvcE9mZiAtIGJvYXJkIGVkaXRvclxuICAgIGN1cnJlbnQ/OiBEcmFnQ3VycmVudDtcbiAgfTtcbiAgc2VsZWN0YWJsZToge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGRpc2FibGUgdG8gZW5mb3JjZSBkcmFnZ2luZyBvdmVyIGNsaWNrLWNsaWNrIG1vdmVcbiAgICBmb3JjZVNwYXJlczogYm9vbGVhbjsgLy8gYWxsb3cgZHJvcHBpbmcgc3BhcmUgcGllY2VzIGV2ZW4gd2l0aCBzZWxlY3RhYmxlIGRpc2FibGVkXG4gICAgZGVsZXRlT25Ub3VjaDogYm9vbGVhbjsgLy8gc2VsZWN0aW5nIGEgcGllY2Ugb24gdGhlIGJvYXJkIG9yIGluIGhhbmQgd2lsbCByZW1vdmUgaXQgLSBib2FyZCBlZGl0b3JcbiAgICBhZGRTcGFyZXNUb0hhbmQ6IGJvb2xlYW47IC8vIGFkZCBzZWxlY3RlZCBzcGFyZSBwaWVjZSB0byBoYW5kIC0gYm9hcmQgZWRpdG9yXG4gIH07XG4gIHByb21vdGlvbjoge1xuICAgIHByb21vdGVzVG86IChyb2xlOiBzZy5Sb2xlU3RyaW5nKSA9PiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIHVucHJvbW90ZXNUbzogKHJvbGU6IHNnLlJvbGVTdHJpbmcpID0+IHNnLlJvbGVTdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgbW92ZVByb21vdGlvbkRpYWxvZzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KSA9PiBib29sZWFuO1xuICAgIGZvcmNlTW92ZVByb21vdGlvbjogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KSA9PiBib29sZWFuO1xuICAgIGRyb3BQcm9tb3Rpb25EaWFsb2c6IChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5KSA9PiBib29sZWFuO1xuICAgIGZvcmNlRHJvcFByb21vdGlvbjogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXkpID0+IGJvb2xlYW47XG4gICAgY3VycmVudD86IHtcbiAgICAgIHBpZWNlOiBzZy5QaWVjZTtcbiAgICAgIHByb21vdGVkUGllY2U6IHNnLlBpZWNlO1xuICAgICAga2V5OiBzZy5LZXk7XG4gICAgICBkcmFnZ2VkOiBib29sZWFuOyAvLyBubyBhbmltYXRpb25zIHdpdGggZHJhZ1xuICAgIH07XG4gICAgZXZlbnRzOiB7XG4gICAgICBpbml0aWF0ZWQ/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBwcm9tb3Rpb24gZGlhbG9nIGlzIHN0YXJ0ZWRcbiAgICAgIGFmdGVyPzogKHBpZWNlOiBzZy5QaWVjZSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHVzZXIgc2VsZWN0cyBhIHBpZWNlXG4gICAgICBjYW5jZWw/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdXNlciBjYW5jZWxzIHRoZSBzZWxlY3Rpb25cbiAgICB9O1xuICAgIHByZXZQcm9tb3Rpb25IYXNoOiBzdHJpbmc7XG4gIH07XG4gIGZvcnN5dGg6IHtcbiAgICB0b0ZvcnN5dGg/OiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIGZyb21Gb3JzeXRoPzogKHN0cjogc3RyaW5nKSA9PiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkO1xuICB9O1xuICBldmVudHM6IHtcbiAgICBjaGFuZ2U/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHNpdHVhdGlvbiBjaGFuZ2VzIG9uIHRoZSBib2FyZFxuICAgIG1vdmU/OiAob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXksIHByb206IGJvb2xlYW4sIGNhcHR1cmVkUGllY2U/OiBzZy5QaWVjZSkgPT4gdm9pZDtcbiAgICBkcm9wPzogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb206IGJvb2xlYW4pID0+IHZvaWQ7XG4gICAgc2VsZWN0PzogKGtleTogc2cuS2V5KSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBhIHNxdWFyZSBpcyBzZWxlY3RlZFxuICAgIHVuc2VsZWN0PzogKGtleTogc2cuS2V5KSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBhIHNlbGVjdGVkIHNxdWFyZSBpcyBkaXJlY3RseSB1bnNlbGVjdGVkIC0gZHJvcHBlZCBiYWNrIG9yIGNsaWNrZWQgb24gdGhlIG9yaWdpbmFsIHNxdWFyZVxuICAgIHBpZWNlU2VsZWN0PzogKHBpZWNlOiBzZy5QaWVjZSkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gYSBwaWVjZSBpbiBoYW5kIGlzIHNlbGVjdGVkXG4gICAgcGllY2VVbnNlbGVjdD86IChwaWVjZTogc2cuUGllY2UpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIGEgc2VsZWN0ZWQgcGllY2UgaXMgZGlyZWN0bHkgdW5zZWxlY3RlZCAtIGRyb3BwZWQgYmFjayBvciBjbGlja2VkIG9uIHRoZSBzYW1lIHBpZWNlXG4gICAgaW5zZXJ0PzogKGJvYXJkRWxlbWVudHM/OiBzZy5Cb2FyZEVsZW1lbnRzLCBoYW5kRWxlbWVudHM/OiBzZy5IYW5kRWxlbWVudHMpID0+IHZvaWQ7IC8vIHdoZW4gdGhlIGJvYXJkIG9yIGhhbmRzIERPTSBoYXMgYmVlbiAocmUpaW5zZXJ0ZWRcbiAgfTtcbiAgZHJhd2FibGU6IERyYXdhYmxlO1xufVxuZXhwb3J0IGludGVyZmFjZSBTdGF0ZSBleHRlbmRzIEhlYWRsZXNzU3RhdGUge1xuICBkb206IHNnLkRvbTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRzKCk6IEhlYWRsZXNzU3RhdGUge1xuICByZXR1cm4ge1xuICAgIHBpZWNlczogbmV3IE1hcCgpLFxuICAgIGRpbWVuc2lvbnM6IHsgZmlsZXM6IDksIHJhbmtzOiA5IH0sXG4gICAgb3JpZW50YXRpb246ICdzZW50ZScsXG4gICAgdHVybkNvbG9yOiAnc2VudGUnLFxuICAgIGFjdGl2ZUNvbG9yOiAnYm90aCcsXG4gICAgdmlld09ubHk6IGZhbHNlLFxuICAgIHNxdWFyZVJhdGlvOiBbMTEsIDEyXSxcbiAgICBkaXNhYmxlQ29udGV4dE1lbnU6IHRydWUsXG4gICAgYmxvY2tUb3VjaFNjcm9sbDogZmFsc2UsXG4gICAgc2NhbGVEb3duUGllY2VzOiB0cnVlLFxuICAgIGNvb3JkaW5hdGVzOiB7IGVuYWJsZWQ6IHRydWUsIGZpbGVzOiAnbnVtZXJpYycsIHJhbmtzOiAnbnVtZXJpYycgfSxcbiAgICBoaWdobGlnaHQ6IHsgbGFzdERlc3RzOiB0cnVlLCBjaGVjazogdHJ1ZSwgY2hlY2tSb2xlczogWydraW5nJ10sIGhvdmVyZWQ6IGZhbHNlIH0sXG4gICAgYW5pbWF0aW9uOiB7IGVuYWJsZWQ6IHRydWUsIGhhbmRzOiB0cnVlLCBkdXJhdGlvbjogMjUwIH0sXG4gICAgaGFuZHM6IHtcbiAgICAgIGlubGluZWQ6IGZhbHNlLFxuICAgICAgaGFuZE1hcDogbmV3IE1hcDxzZy5Db2xvciwgc2cuSGFuZD4oW1xuICAgICAgICBbJ3NlbnRlJywgbmV3IE1hcCgpXSxcbiAgICAgICAgWydnb3RlJywgbmV3IE1hcCgpXSxcbiAgICAgIF0pLFxuICAgICAgcm9sZXM6IFsncm9vaycsICdiaXNob3AnLCAnZ29sZCcsICdzaWx2ZXInLCAna25pZ2h0JywgJ2xhbmNlJywgJ3Bhd24nXSxcbiAgICB9LFxuICAgIG1vdmFibGU6IHsgZnJlZTogdHJ1ZSwgc2hvd0Rlc3RzOiB0cnVlLCBldmVudHM6IHt9IH0sXG4gICAgZHJvcHBhYmxlOiB7IGZyZWU6IHRydWUsIHNob3dEZXN0czogdHJ1ZSwgc3BhcmU6IGZhbHNlLCBldmVudHM6IHt9IH0sXG4gICAgcHJlbW92YWJsZTogeyBlbmFibGVkOiB0cnVlLCBzaG93RGVzdHM6IHRydWUsIGV2ZW50czoge30gfSxcbiAgICBwcmVkcm9wcGFibGU6IHsgZW5hYmxlZDogdHJ1ZSwgc2hvd0Rlc3RzOiB0cnVlLCBldmVudHM6IHt9IH0sXG4gICAgZHJhZ2dhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgZGlzdGFuY2U6IDMsXG4gICAgICBhdXRvRGlzdGFuY2U6IHRydWUsXG4gICAgICBzaG93R2hvc3Q6IHRydWUsXG4gICAgICBzaG93VG91Y2hTcXVhcmVPdmVybGF5OiB0cnVlLFxuICAgICAgZGVsZXRlT25Ecm9wT2ZmOiBmYWxzZSxcbiAgICAgIGFkZFRvSGFuZE9uRHJvcE9mZjogZmFsc2UsXG4gICAgfSxcbiAgICBzZWxlY3RhYmxlOiB7IGVuYWJsZWQ6IHRydWUsIGZvcmNlU3BhcmVzOiBmYWxzZSwgZGVsZXRlT25Ub3VjaDogZmFsc2UsIGFkZFNwYXJlc1RvSGFuZDogZmFsc2UgfSxcbiAgICBwcm9tb3Rpb246IHtcbiAgICAgIG1vdmVQcm9tb3Rpb25EaWFsb2c6ICgpID0+IGZhbHNlLFxuICAgICAgZm9yY2VNb3ZlUHJvbW90aW9uOiAoKSA9PiBmYWxzZSxcbiAgICAgIGRyb3BQcm9tb3Rpb25EaWFsb2c6ICgpID0+IGZhbHNlLFxuICAgICAgZm9yY2VEcm9wUHJvbW90aW9uOiAoKSA9PiBmYWxzZSxcbiAgICAgIHByb21vdGVzVG86ICgpID0+IHVuZGVmaW5lZCxcbiAgICAgIHVucHJvbW90ZXNUbzogKCkgPT4gdW5kZWZpbmVkLFxuICAgICAgZXZlbnRzOiB7fSxcbiAgICAgIHByZXZQcm9tb3Rpb25IYXNoOiAnJyxcbiAgICB9LFxuICAgIGZvcnN5dGg6IHt9LFxuICAgIGV2ZW50czoge30sXG4gICAgZHJhd2FibGU6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsIC8vIGNhbiBkcmF3XG4gICAgICB2aXNpYmxlOiB0cnVlLCAvLyBjYW4gdmlld1xuICAgICAgZm9yY2VkOiBmYWxzZSwgLy8gY2FuIG9ubHkgZHJhd1xuICAgICAgZXJhc2VPbkNsaWNrOiB0cnVlLFxuICAgICAgc2hhcGVzOiBbXSxcbiAgICAgIGF1dG9TaGFwZXM6IFtdLFxuICAgICAgc3F1YXJlczogW10sXG4gICAgICBwcmV2U3ZnSGFzaDogJycsXG4gICAgfSxcbiAgfTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgeyByZW5kZXIgfSBmcm9tICcuL3JlbmRlci5qcyc7XG5pbXBvcnQgeyByZW5kZXJIYW5kIH0gZnJvbSAnLi9oYW5kcy5qcyc7XG5pbXBvcnQgeyByZW5kZXJTaGFwZXMgfSBmcm9tICcuL3NoYXBlcy5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZWRyYXdTaGFwZXNOb3coc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQ/LnNoYXBlcylcbiAgICByZW5kZXJTaGFwZXMoXG4gICAgICBzdGF0ZSxcbiAgICAgIHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZC5zaGFwZXMuc3ZnLFxuICAgICAgc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkLnNoYXBlcy5jdXN0b21TdmcsXG4gICAgICBzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQuc2hhcGVzLmZyZWVQaWVjZXMsXG4gICAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZHJhd05vdyhzdGF0ZTogU3RhdGUsIHNraXBTaGFwZXM/OiBib29sZWFuKTogdm9pZCB7XG4gIGNvbnN0IGJvYXJkRWxzID0gc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkO1xuICBpZiAoYm9hcmRFbHMpIHtcbiAgICByZW5kZXIoc3RhdGUsIGJvYXJkRWxzKTtcbiAgICBpZiAoIXNraXBTaGFwZXMpIHJlZHJhd1NoYXBlc05vdyhzdGF0ZSk7XG4gIH1cblxuICBjb25zdCBoYW5kRWxzID0gc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzO1xuICBpZiAoaGFuZEVscykge1xuICAgIGlmIChoYW5kRWxzLnRvcCkgcmVuZGVySGFuZChzdGF0ZSwgaGFuZEVscy50b3ApO1xuICAgIGlmIChoYW5kRWxzLmJvdHRvbSkgcmVuZGVySGFuZChzdGF0ZSwgaGFuZEVscy5ib3R0b20pO1xuICB9XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBET01SZWN0TWFwLCBQaWVjZU5hbWUsIFBpZWNlTm9kZSwgV3JhcEVsZW1lbnRzIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgdHlwZSB7IEFwaSB9IGZyb20gJy4vYXBpLmpzJztcbmltcG9ydCB0eXBlIHsgQ29uZmlnIH0gZnJvbSAnLi9jb25maWcuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHsgc3RhcnQgfSBmcm9tICcuL2FwaS5qcyc7XG5pbXBvcnQgeyBjb25maWd1cmUgfSBmcm9tICcuL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBkZWZhdWx0cyB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwuanMnO1xuaW1wb3J0IHsgcmVkcmF3QWxsIH0gZnJvbSAnLi9kb20uanMnO1xuaW1wb3J0IHsgYmluZERvY3VtZW50IH0gZnJvbSAnLi9ldmVudHMuanMnO1xuaW1wb3J0IHsgcmVkcmF3Tm93LCByZWRyYXdTaGFwZXNOb3cgfSBmcm9tICcuL3JlZHJhdy5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBTaG9naWdyb3VuZChjb25maWc/OiBDb25maWcsIHdyYXBFbGVtZW50cz86IFdyYXBFbGVtZW50cyk6IEFwaSB7XG4gIGNvbnN0IHN0YXRlID0gZGVmYXVsdHMoKSBhcyBTdGF0ZTtcbiAgY29uZmlndXJlKHN0YXRlLCBjb25maWcgfHwge30pO1xuXG4gIGNvbnN0IHJlZHJhd1N0YXRlTm93ID0gKHNraXBTaGFwZXM/OiBib29sZWFuKSA9PiB7XG4gICAgcmVkcmF3Tm93KHN0YXRlLCBza2lwU2hhcGVzKTtcbiAgfTtcblxuICBzdGF0ZS5kb20gPSB7XG4gICAgd3JhcEVsZW1lbnRzOiB3cmFwRWxlbWVudHMgfHwge30sXG4gICAgZWxlbWVudHM6IHt9LFxuICAgIGJvdW5kczoge1xuICAgICAgYm9hcmQ6IHtcbiAgICAgICAgYm91bmRzOiB1dGlsLm1lbW8oKCkgPT4gc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkPy5waWVjZXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpLFxuICAgICAgfSxcbiAgICAgIGhhbmRzOiB7XG4gICAgICAgIGJvdW5kczogdXRpbC5tZW1vKCgpID0+IHtcbiAgICAgICAgICBjb25zdCBoYW5kc1JlY3RzOiBET01SZWN0TWFwPCd0b3AnIHwgJ2JvdHRvbSc+ID0gbmV3IE1hcCgpLFxuICAgICAgICAgICAgaGFuZEVscyA9IHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcztcbiAgICAgICAgICBpZiAoaGFuZEVscz8udG9wKSBoYW5kc1JlY3RzLnNldCgndG9wJywgaGFuZEVscy50b3AuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpO1xuICAgICAgICAgIGlmIChoYW5kRWxzPy5ib3R0b20pIGhhbmRzUmVjdHMuc2V0KCdib3R0b20nLCBoYW5kRWxzLmJvdHRvbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSk7XG4gICAgICAgICAgcmV0dXJuIGhhbmRzUmVjdHM7XG4gICAgICAgIH0pLFxuICAgICAgICBwaWVjZUJvdW5kczogdXRpbC5tZW1vKCgpID0+IHtcbiAgICAgICAgICBjb25zdCBoYW5kUGllY2VzUmVjdHM6IERPTVJlY3RNYXA8UGllY2VOYW1lPiA9IG5ldyBNYXAoKSxcbiAgICAgICAgICAgIGhhbmRFbHMgPSBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHM7XG5cbiAgICAgICAgICBpZiAoaGFuZEVscz8udG9wKSB7XG4gICAgICAgICAgICBsZXQgd3JhcEVsID0gaGFuZEVscy50b3AuZmlyc3RFbGVtZW50Q2hpbGQgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICB3aGlsZSAod3JhcEVsKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHBpZWNlRWwgPSB3cmFwRWwuZmlyc3RFbGVtZW50Q2hpbGQgYXMgUGllY2VOb2RlLFxuICAgICAgICAgICAgICAgIHBpZWNlID0geyByb2xlOiBwaWVjZUVsLnNnUm9sZSwgY29sb3I6IHBpZWNlRWwuc2dDb2xvciB9O1xuICAgICAgICAgICAgICBoYW5kUGllY2VzUmVjdHMuc2V0KHV0aWwucGllY2VOYW1lT2YocGllY2UpLCBwaWVjZUVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKTtcbiAgICAgICAgICAgICAgd3JhcEVsID0gd3JhcEVsLm5leHRFbGVtZW50U2libGluZyBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGhhbmRFbHM/LmJvdHRvbSkge1xuICAgICAgICAgICAgbGV0IHdyYXBFbCA9IGhhbmRFbHMuYm90dG9tLmZpcnN0RWxlbWVudENoaWxkIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgd2hpbGUgKHdyYXBFbCkge1xuICAgICAgICAgICAgICBjb25zdCBwaWVjZUVsID0gd3JhcEVsLmZpcnN0RWxlbWVudENoaWxkIGFzIFBpZWNlTm9kZSxcbiAgICAgICAgICAgICAgICBwaWVjZSA9IHsgcm9sZTogcGllY2VFbC5zZ1JvbGUsIGNvbG9yOiBwaWVjZUVsLnNnQ29sb3IgfTtcbiAgICAgICAgICAgICAgaGFuZFBpZWNlc1JlY3RzLnNldCh1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKSwgcGllY2VFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSk7XG4gICAgICAgICAgICAgIHdyYXBFbCA9IHdyYXBFbC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBoYW5kUGllY2VzUmVjdHM7XG4gICAgICAgIH0pLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHJlZHJhd05vdzogcmVkcmF3U3RhdGVOb3csXG4gICAgcmVkcmF3OiBkZWJvdW5jZVJlZHJhdyhyZWRyYXdTdGF0ZU5vdyksXG4gICAgcmVkcmF3U2hhcGVzOiBkZWJvdW5jZVJlZHJhdygoKSA9PiByZWRyYXdTaGFwZXNOb3coc3RhdGUpKSxcbiAgICB1bmJpbmQ6IGJpbmREb2N1bWVudChzdGF0ZSksXG4gICAgZGVzdHJveWVkOiBmYWxzZSxcbiAgfTtcblxuICBpZiAod3JhcEVsZW1lbnRzKSByZWRyYXdBbGwod3JhcEVsZW1lbnRzLCBzdGF0ZSk7XG5cbiAgcmV0dXJuIHN0YXJ0KHN0YXRlKTtcbn1cblxuZnVuY3Rpb24gZGVib3VuY2VSZWRyYXcoZjogKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkKTogKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkIHtcbiAgbGV0IHJlZHJhd2luZyA9IGZhbHNlO1xuICByZXR1cm4gKC4uLmFyZ3M6IGFueVtdKSA9PiB7XG4gICAgaWYgKHJlZHJhd2luZykgcmV0dXJuO1xuICAgIHJlZHJhd2luZyA9IHRydWU7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIGYoLi4uYXJncyk7XG4gICAgICByZWRyYXdpbmcgPSBmYWxzZTtcbiAgICB9KTtcbiAgfTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNFTyxNQUFNLFNBQVMsQ0FBQyxTQUFTLE1BQU07QUFFL0IsTUFBTSxRQUFRO0FBQUEsSUFDbkI7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQ08sTUFBTSxRQUFRO0FBQUEsSUFDbkI7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBRU8sTUFBTSxVQUEwQixNQUFNLFVBQVU7QUFBQSxJQUNyRCxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sTUFBTSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztBQUFBLEVBQzdDOzs7QUN4Q08sTUFBTSxVQUFVLENBQUMsUUFBd0IsUUFBUSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDO0FBRXJFLE1BQU0sVUFBVSxDQUFDLE1BQXNCO0FBQzVDLFFBQUksRUFBRSxTQUFTLEVBQUcsUUFBTyxDQUFDLEVBQUUsV0FB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QixLQUFLLENBQUM7QUFBQSxNQUN6RCxRQUFRLGFBQWEsS0FBSztBQUFBLE1BQzFCLFdBQVc7QUFBQSxJQUNiO0FBRUEsUUFBSSxhQUFjLFdBQVUsY0FBYyxLQUFLO0FBRS9DLFdBQU9DLE9BQU0sS0FBSztBQUFBLEVBQ3BCO0FBRUEsV0FBUyxlQUFlLEdBQXVEO0FBQzdFLFFBQUksWUFBWTtBQUNoQixXQUFPLElBQUksU0FBZ0I7QUFDekIsVUFBSSxVQUFXO0FBQ2Ysa0JBQVk7QUFDWiw0QkFBc0IsTUFBTTtBQUMxQixVQUFFLEdBQUcsSUFBSTtBQUNULG9CQUFZO0FBQUEsTUFDZCxDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0Y7OztBbkJqRkEsTUFBTyxnQkFBUTsiLAogICJuYW1lcyI6IFsibW92ZSIsICJyYW5rcyIsICJub3ciLCAiYnJ1c2hlcyIsICJlbCIsICJkZXN0IiwgInN0YXJ0IiwgImNhbmNlbCIsICJtb3ZlIiwgImVuZCIsICJ1bnNlbGVjdCIsICJyYW5rcyIsICJmaWxlcyIsICJyZW5kZXJIYW5kIiwgIm1vdmUiLCAiZW5kIiwgImNhbmNlbCIsICJzdGFydCIsICJzIiwgInJlbmRlciIsICJhbmltIiwgImsiLCAicmVuZGVyIiwgInN0YXJ0IiwgInN0YXRlIiwgImNhbmNlbCIsICJyZW5kZXIiLCAic3RhcnQiXQp9Cg==
