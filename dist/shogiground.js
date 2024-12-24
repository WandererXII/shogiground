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
  var index_default = Shogiground;
  return __toCommonJS(index_exports);
})();
Shogiground = Shogiground.default;
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2luZGV4LnRzIiwgIi4uL3NyYy9jb25zdGFudHMudHMiLCAiLi4vc3JjL3V0aWwudHMiLCAiLi4vc3JjL2hhbmRzLnRzIiwgIi4uL3NyYy9ib2FyZC50cyIsICIuLi9zcmMvc2Zlbi50cyIsICIuLi9zcmMvY29uZmlnLnRzIiwgIi4uL3NyYy9hbmltLnRzIiwgIi4uL3NyYy9zaGFwZXMudHMiLCAiLi4vc3JjL2RyYXcudHMiLCAiLi4vc3JjL2RyYWcudHMiLCAiLi4vc3JjL2Nvb3Jkcy50cyIsICIuLi9zcmMvd3JhcC50cyIsICIuLi9zcmMvZXZlbnRzLnRzIiwgIi4uL3NyYy9yZW5kZXIudHMiLCAiLi4vc3JjL2RvbS50cyIsICIuLi9zcmMvYXBpLnRzIiwgIi4uL3NyYy9zdGF0ZS50cyIsICIuLi9zcmMvcmVkcmF3LnRzIiwgIi4uL3NyYy9zaG9naWdyb3VuZC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgU2hvZ2lncm91bmQgfSBmcm9tICcuL3Nob2dpZ3JvdW5kLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgU2hvZ2lncm91bmQ7XG4iLCAiaW1wb3J0IHR5cGUgeyBLZXkgfSBmcm9tICcuL3R5cGVzLmpzJztcblxuZXhwb3J0IGNvbnN0IGNvbG9ycyA9IFsnc2VudGUnLCAnZ290ZSddIGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgZmlsZXMgPSBbXG4gICcxJyxcbiAgJzInLFxuICAnMycsXG4gICc0JyxcbiAgJzUnLFxuICAnNicsXG4gICc3JyxcbiAgJzgnLFxuICAnOScsXG4gICcxMCcsXG4gICcxMScsXG4gICcxMicsXG4gICcxMycsXG4gICcxNCcsXG4gICcxNScsXG4gICcxNicsXG5dIGFzIGNvbnN0O1xuZXhwb3J0IGNvbnN0IHJhbmtzID0gW1xuICAnYScsXG4gICdiJyxcbiAgJ2MnLFxuICAnZCcsXG4gICdlJyxcbiAgJ2YnLFxuICAnZycsXG4gICdoJyxcbiAgJ2knLFxuICAnaicsXG4gICdrJyxcbiAgJ2wnLFxuICAnbScsXG4gICduJyxcbiAgJ28nLFxuICAncCcsXG5dIGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgYWxsS2V5czogcmVhZG9ubHkgS2V5W10gPSBBcnJheS5wcm90b3R5cGUuY29uY2F0KFxuICAuLi5yYW5rcy5tYXAociA9PiBmaWxlcy5tYXAoZiA9PiBmICsgcikpXG4pO1xuXG5leHBvcnQgY29uc3Qgbm90YXRpb25zID0gWydudW1lcmljJywgJ2phcGFuZXNlJywgJ2VuZ2luZScsICdoZXgnLCAnZGl6aGknXSBhcyBjb25zdDtcbiIsICJpbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgYWxsS2V5cywgY29sb3JzIH0gZnJvbSAnLi9jb25zdGFudHMuanMnO1xuXG5leHBvcnQgY29uc3QgcG9zMmtleSA9IChwb3M6IHNnLlBvcyk6IHNnLktleSA9PiBhbGxLZXlzW3Bvc1swXSArIDE2ICogcG9zWzFdXTtcblxuZXhwb3J0IGNvbnN0IGtleTJwb3MgPSAoazogc2cuS2V5KTogc2cuUG9zID0+IHtcbiAgaWYgKGsubGVuZ3RoID4gMikgcmV0dXJuIFtrLmNoYXJDb2RlQXQoMSkgLSAzOSwgay5jaGFyQ29kZUF0KDIpIC0gOTddO1xuICBlbHNlIHJldHVybiBbay5jaGFyQ29kZUF0KDApIC0gNDksIGsuY2hhckNvZGVBdCgxKSAtIDk3XTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBtZW1vPEE+KGY6ICgpID0+IEEpOiBzZy5NZW1vPEE+IHtcbiAgbGV0IHY6IEEgfCB1bmRlZmluZWQ7XG4gIGNvbnN0IHJldCA9ICgpOiBBID0+IHtcbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB2ID0gZigpO1xuICAgIHJldHVybiB2O1xuICB9O1xuICByZXQuY2xlYXIgPSAoKSA9PiB7XG4gICAgdiA9IHVuZGVmaW5lZDtcbiAgfTtcbiAgcmV0dXJuIHJldDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGxVc2VyRnVuY3Rpb248VCBleHRlbmRzICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZD4oXG4gIGY6IFQgfCB1bmRlZmluZWQsXG4gIC4uLmFyZ3M6IFBhcmFtZXRlcnM8VD5cbik6IHZvaWQge1xuICBpZiAoZikgc2V0VGltZW91dCgoKSA9PiBmKC4uLmFyZ3MpLCAxKTtcbn1cblxuZXhwb3J0IGNvbnN0IG9wcG9zaXRlID0gKGM6IHNnLkNvbG9yKTogc2cuQ29sb3IgPT4gKGMgPT09ICdzZW50ZScgPyAnZ290ZScgOiAnc2VudGUnKTtcblxuZXhwb3J0IGNvbnN0IHNlbnRlUG92ID0gKG86IHNnLkNvbG9yKTogYm9vbGVhbiA9PiBvID09PSAnc2VudGUnO1xuXG5leHBvcnQgY29uc3QgZGlzdGFuY2VTcSA9IChwb3MxOiBzZy5Qb3MsIHBvczI6IHNnLlBvcyk6IG51bWJlciA9PiB7XG4gIGNvbnN0IGR4ID0gcG9zMVswXSAtIHBvczJbMF0sXG4gICAgZHkgPSBwb3MxWzFdIC0gcG9zMlsxXTtcbiAgcmV0dXJuIGR4ICogZHggKyBkeSAqIGR5O1xufTtcblxuZXhwb3J0IGNvbnN0IHNhbWVQaWVjZSA9IChwMTogc2cuUGllY2UsIHAyOiBzZy5QaWVjZSk6IGJvb2xlYW4gPT5cbiAgcDEucm9sZSA9PT0gcDIucm9sZSAmJiBwMS5jb2xvciA9PT0gcDIuY29sb3I7XG5cbmNvbnN0IHBvc1RvVHJhbnNsYXRlQmFzZSA9IChcbiAgcG9zOiBzZy5Qb3MsXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGFzU2VudGU6IGJvb2xlYW4sXG4gIHhGYWN0b3I6IG51bWJlcixcbiAgeUZhY3RvcjogbnVtYmVyXG4pOiBzZy5OdW1iZXJQYWlyID0+IFtcbiAgKGFzU2VudGUgPyBkaW1zLmZpbGVzIC0gMSAtIHBvc1swXSA6IHBvc1swXSkgKiB4RmFjdG9yLFxuICAoYXNTZW50ZSA/IHBvc1sxXSA6IGRpbXMucmFua3MgLSAxIC0gcG9zWzFdKSAqIHlGYWN0b3IsXG5dO1xuXG5leHBvcnQgY29uc3QgcG9zVG9UcmFuc2xhdGVBYnMgPSAoXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGJvdW5kczogRE9NUmVjdFxuKTogKChwb3M6IHNnLlBvcywgYXNTZW50ZTogYm9vbGVhbikgPT4gc2cuTnVtYmVyUGFpcikgPT4ge1xuICBjb25zdCB4RmFjdG9yID0gYm91bmRzLndpZHRoIC8gZGltcy5maWxlcyxcbiAgICB5RmFjdG9yID0gYm91bmRzLmhlaWdodCAvIGRpbXMucmFua3M7XG4gIHJldHVybiAocG9zLCBhc1NlbnRlKSA9PiBwb3NUb1RyYW5zbGF0ZUJhc2UocG9zLCBkaW1zLCBhc1NlbnRlLCB4RmFjdG9yLCB5RmFjdG9yKTtcbn07XG5cbmV4cG9ydCBjb25zdCBwb3NUb1RyYW5zbGF0ZVJlbCA9XG4gIChkaW1zOiBzZy5EaW1lbnNpb25zKTogKChwb3M6IHNnLlBvcywgYXNTZW50ZTogYm9vbGVhbikgPT4gc2cuTnVtYmVyUGFpcikgPT5cbiAgKHBvcywgYXNTZW50ZSkgPT5cbiAgICBwb3NUb1RyYW5zbGF0ZUJhc2UocG9zLCBkaW1zLCBhc1NlbnRlLCAxMDAsIDEwMCk7XG5cbmV4cG9ydCBjb25zdCB0cmFuc2xhdGVBYnMgPSAoZWw6IEhUTUxFbGVtZW50LCBwb3M6IHNnLk51bWJlclBhaXIsIHNjYWxlOiBudW1iZXIpOiB2b2lkID0+IHtcbiAgZWwuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke3Bvc1swXX1weCwke3Bvc1sxXX1weCkgc2NhbGUoJHtzY2FsZX1gO1xufTtcblxuZXhwb3J0IGNvbnN0IHRyYW5zbGF0ZVJlbCA9IChcbiAgZWw6IEhUTUxFbGVtZW50LFxuICBwZXJjZW50czogc2cuTnVtYmVyUGFpcixcbiAgc2NhbGVGYWN0b3I6IG51bWJlcixcbiAgc2NhbGU/OiBudW1iZXJcbik6IHZvaWQgPT4ge1xuICBlbC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKCR7cGVyY2VudHNbMF0gKiBzY2FsZUZhY3Rvcn0lLCR7cGVyY2VudHNbMV0gKiBzY2FsZUZhY3Rvcn0lKSBzY2FsZSgke1xuICAgIHNjYWxlIHx8IHNjYWxlRmFjdG9yXG4gIH0pYDtcbn07XG5cbmV4cG9ydCBjb25zdCBzZXREaXNwbGF5ID0gKGVsOiBIVE1MRWxlbWVudCwgdjogYm9vbGVhbik6IHZvaWQgPT4ge1xuICBlbC5zdHlsZS5kaXNwbGF5ID0gdiA/ICcnIDogJ25vbmUnO1xufTtcblxuZXhwb3J0IGNvbnN0IGV2ZW50UG9zaXRpb24gPSAoZTogc2cuTW91Y2hFdmVudCk6IHNnLk51bWJlclBhaXIgfCB1bmRlZmluZWQgPT4ge1xuICBpZiAoZS5jbGllbnRYIHx8IGUuY2xpZW50WCA9PT0gMCkgcmV0dXJuIFtlLmNsaWVudFgsIGUuY2xpZW50WSFdO1xuICBpZiAoZS50YXJnZXRUb3VjaGVzPy5bMF0pIHJldHVybiBbZS50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFgsIGUudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRZXTtcbiAgcmV0dXJuOyAvLyB0b3VjaGVuZCBoYXMgbm8gcG9zaXRpb24hXG59O1xuXG5leHBvcnQgY29uc3QgaXNSaWdodEJ1dHRvbiA9IChlOiBzZy5Nb3VjaEV2ZW50KTogYm9vbGVhbiA9PiBlLmJ1dHRvbnMgPT09IDIgfHwgZS5idXR0b24gPT09IDI7XG5cbmV4cG9ydCBjb25zdCBpc01pZGRsZUJ1dHRvbiA9IChlOiBzZy5Nb3VjaEV2ZW50KTogYm9vbGVhbiA9PiBlLmJ1dHRvbnMgPT09IDQgfHwgZS5idXR0b24gPT09IDE7XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVFbCA9ICh0YWdOYW1lOiBzdHJpbmcsIGNsYXNzTmFtZT86IHN0cmluZyk6IEhUTUxFbGVtZW50ID0+IHtcbiAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xuICBpZiAoY2xhc3NOYW1lKSBlbC5jbGFzc05hbWUgPSBjbGFzc05hbWU7XG4gIHJldHVybiBlbDtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBwaWVjZU5hbWVPZihwaWVjZTogc2cuUGllY2UpOiBzZy5QaWVjZU5hbWUge1xuICByZXR1cm4gYCR7cGllY2UuY29sb3J9ICR7cGllY2Uucm9sZX1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VQaWVjZU5hbWUocGllY2VOYW1lOiBzZy5QaWVjZU5hbWUpOiBzZy5QaWVjZSB7XG4gIGNvbnN0IHNwbGl0dGVkID0gcGllY2VOYW1lLnNwbGl0KCcgJywgMik7XG4gIHJldHVybiB7IGNvbG9yOiBzcGxpdHRlZFswXSBhcyBzZy5Db2xvciwgcm9sZTogc3BsaXR0ZWRbMV0gfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUGllY2VOb2RlKGVsOiBIVE1MRWxlbWVudCk6IGVsIGlzIHNnLlBpZWNlTm9kZSB7XG4gIHJldHVybiBlbC50YWdOYW1lID09PSAnUElFQ0UnO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzU3F1YXJlTm9kZShlbDogSFRNTEVsZW1lbnQpOiBlbCBpcyBzZy5TcXVhcmVOb2RlIHtcbiAgcmV0dXJuIGVsLnRhZ05hbWUgPT09ICdTUSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlU3F1YXJlQ2VudGVyKFxuICBrZXk6IHNnLktleSxcbiAgYXNTZW50ZTogYm9vbGVhbixcbiAgZGltczogc2cuRGltZW5zaW9ucyxcbiAgYm91bmRzOiBET01SZWN0XG4pOiBzZy5OdW1iZXJQYWlyIHtcbiAgY29uc3QgcG9zID0ga2V5MnBvcyhrZXkpO1xuICBpZiAoYXNTZW50ZSkge1xuICAgIHBvc1swXSA9IGRpbXMuZmlsZXMgLSAxIC0gcG9zWzBdO1xuICAgIHBvc1sxXSA9IGRpbXMucmFua3MgLSAxIC0gcG9zWzFdO1xuICB9XG4gIHJldHVybiBbXG4gICAgYm91bmRzLmxlZnQgKyAoYm91bmRzLndpZHRoICogcG9zWzBdKSAvIGRpbXMuZmlsZXMgKyBib3VuZHMud2lkdGggLyAoZGltcy5maWxlcyAqIDIpLFxuICAgIGJvdW5kcy50b3AgK1xuICAgICAgKGJvdW5kcy5oZWlnaHQgKiAoZGltcy5yYW5rcyAtIDEgLSBwb3NbMV0pKSAvIGRpbXMucmFua3MgK1xuICAgICAgYm91bmRzLmhlaWdodCAvIChkaW1zLnJhbmtzICogMiksXG4gIF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkb21TcXVhcmVJbmRleE9mS2V5KGtleTogc2cuS2V5LCBhc1NlbnRlOiBib29sZWFuLCBkaW1zOiBzZy5EaW1lbnNpb25zKTogbnVtYmVyIHtcbiAgY29uc3QgcG9zID0ga2V5MnBvcyhrZXkpO1xuICBsZXQgaW5kZXggPSBkaW1zLmZpbGVzIC0gMSAtIHBvc1swXSArIHBvc1sxXSAqIGRpbXMuZmlsZXM7XG4gIGlmICghYXNTZW50ZSkgaW5kZXggPSBkaW1zLmZpbGVzICogZGltcy5yYW5rcyAtIDEgLSBpbmRleDtcblxuICByZXR1cm4gaW5kZXg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0luc2lkZVJlY3QocmVjdDogRE9NUmVjdCwgcG9zOiBzZy5OdW1iZXJQYWlyKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgcmVjdC5sZWZ0IDw9IHBvc1swXSAmJlxuICAgIHJlY3QudG9wIDw9IHBvc1sxXSAmJlxuICAgIHJlY3QubGVmdCArIHJlY3Qud2lkdGggPiBwb3NbMF0gJiZcbiAgICByZWN0LnRvcCArIHJlY3QuaGVpZ2h0ID4gcG9zWzFdXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRLZXlBdERvbVBvcyhcbiAgcG9zOiBzZy5OdW1iZXJQYWlyLFxuICBhc1NlbnRlOiBib29sZWFuLFxuICBkaW1zOiBzZy5EaW1lbnNpb25zLFxuICBib3VuZHM6IERPTVJlY3Rcbik6IHNnLktleSB8IHVuZGVmaW5lZCB7XG4gIGxldCBmaWxlID0gTWF0aC5mbG9vcigoZGltcy5maWxlcyAqIChwb3NbMF0gLSBib3VuZHMubGVmdCkpIC8gYm91bmRzLndpZHRoKTtcbiAgaWYgKGFzU2VudGUpIGZpbGUgPSBkaW1zLmZpbGVzIC0gMSAtIGZpbGU7XG4gIGxldCByYW5rID0gTWF0aC5mbG9vcigoZGltcy5yYW5rcyAqIChwb3NbMV0gLSBib3VuZHMudG9wKSkgLyBib3VuZHMuaGVpZ2h0KTtcbiAgaWYgKCFhc1NlbnRlKSByYW5rID0gZGltcy5yYW5rcyAtIDEgLSByYW5rO1xuICByZXR1cm4gZmlsZSA+PSAwICYmIGZpbGUgPCBkaW1zLmZpbGVzICYmIHJhbmsgPj0gMCAmJiByYW5rIDwgZGltcy5yYW5rc1xuICAgID8gcG9zMmtleShbZmlsZSwgcmFua10pXG4gICAgOiB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRIYW5kUGllY2VBdERvbVBvcyhcbiAgcG9zOiBzZy5OdW1iZXJQYWlyLFxuICByb2xlczogc2cuUm9sZVN0cmluZ1tdLFxuICBib3VuZHM6IE1hcDxzZy5QaWVjZU5hbWUsIERPTVJlY3Q+XG4pOiBzZy5QaWVjZSB8IHVuZGVmaW5lZCB7XG4gIGZvciAoY29uc3QgY29sb3Igb2YgY29sb3JzKSB7XG4gICAgZm9yIChjb25zdCByb2xlIG9mIHJvbGVzKSB7XG4gICAgICBjb25zdCBwaWVjZSA9IHsgY29sb3IsIHJvbGUgfSxcbiAgICAgICAgcGllY2VSZWN0ID0gYm91bmRzLmdldChwaWVjZU5hbWVPZihwaWVjZSkpO1xuICAgICAgaWYgKHBpZWNlUmVjdCAmJiBpc0luc2lkZVJlY3QocGllY2VSZWN0LCBwb3MpKSByZXR1cm4gcGllY2U7XG4gICAgfVxuICB9XG4gIHJldHVybjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBvc09mT3V0c2lkZUVsKFxuICBsZWZ0OiBudW1iZXIsXG4gIHRvcDogbnVtYmVyLFxuICBhc1NlbnRlOiBib29sZWFuLFxuICBkaW1zOiBzZy5EaW1lbnNpb25zLFxuICBib2FyZEJvdW5kczogRE9NUmVjdFxuKTogc2cuUG9zIHwgdW5kZWZpbmVkIHtcbiAgY29uc3Qgc3FXID0gYm9hcmRCb3VuZHMud2lkdGggLyBkaW1zLmZpbGVzLFxuICAgIHNxSCA9IGJvYXJkQm91bmRzLmhlaWdodCAvIGRpbXMucmFua3M7XG4gIGlmICghc3FXIHx8ICFzcUgpIHJldHVybjtcbiAgbGV0IHhPZmYgPSAobGVmdCAtIGJvYXJkQm91bmRzLmxlZnQpIC8gc3FXO1xuICBpZiAoYXNTZW50ZSkgeE9mZiA9IGRpbXMuZmlsZXMgLSAxIC0geE9mZjtcbiAgbGV0IHlPZmYgPSAodG9wIC0gYm9hcmRCb3VuZHMudG9wKSAvIHNxSDtcbiAgaWYgKCFhc1NlbnRlKSB5T2ZmID0gZGltcy5yYW5rcyAtIDEgLSB5T2ZmO1xuICByZXR1cm4gW3hPZmYsIHlPZmZdO1xufVxuIiwgImltcG9ydCB0eXBlIHsgSGVhZGxlc3NTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IHNhbWVQaWVjZSB9IGZyb20gJy4vdXRpbC5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRUb0hhbmQoczogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBjbnQgPSAxKTogdm9pZCB7XG4gIGNvbnN0IGhhbmQgPSBzLmhhbmRzLmhhbmRNYXAuZ2V0KHBpZWNlLmNvbG9yKSxcbiAgICByb2xlID1cbiAgICAgIChzLmhhbmRzLnJvbGVzLmluY2x1ZGVzKHBpZWNlLnJvbGUpID8gcGllY2Uucm9sZSA6IHMucHJvbW90aW9uLnVucHJvbW90ZXNUbyhwaWVjZS5yb2xlKSkgfHxcbiAgICAgIHBpZWNlLnJvbGU7XG4gIGlmIChoYW5kICYmIHMuaGFuZHMucm9sZXMuaW5jbHVkZXMocm9sZSkpIGhhbmQuc2V0KHJvbGUsIChoYW5kLmdldChyb2xlKSB8fCAwKSArIGNudCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVGcm9tSGFuZChzOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGNudCA9IDEpOiB2b2lkIHtcbiAgY29uc3QgaGFuZCA9IHMuaGFuZHMuaGFuZE1hcC5nZXQocGllY2UuY29sb3IpLFxuICAgIHJvbGUgPVxuICAgICAgKHMuaGFuZHMucm9sZXMuaW5jbHVkZXMocGllY2Uucm9sZSkgPyBwaWVjZS5yb2xlIDogcy5wcm9tb3Rpb24udW5wcm9tb3Rlc1RvKHBpZWNlLnJvbGUpKSB8fFxuICAgICAgcGllY2Uucm9sZSxcbiAgICBudW0gPSBoYW5kPy5nZXQocm9sZSk7XG4gIGlmIChoYW5kICYmIG51bSkgaGFuZC5zZXQocm9sZSwgTWF0aC5tYXgobnVtIC0gY250LCAwKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJIYW5kKHM6IEhlYWRsZXNzU3RhdGUsIGhhbmRFbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgaGFuZEVsLmNsYXNzTGlzdC50b2dnbGUoJ3Byb21vdGlvbicsICEhcy5wcm9tb3Rpb24uY3VycmVudCk7XG4gIGxldCB3cmFwRWwgPSBoYW5kRWwuZmlyc3RFbGVtZW50Q2hpbGQgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIHdoaWxlICh3cmFwRWwpIHtcbiAgICBjb25zdCBwaWVjZUVsID0gd3JhcEVsLmZpcnN0RWxlbWVudENoaWxkIGFzIHNnLlBpZWNlTm9kZSxcbiAgICAgIHBpZWNlID0geyByb2xlOiBwaWVjZUVsLnNnUm9sZSwgY29sb3I6IHBpZWNlRWwuc2dDb2xvciB9LFxuICAgICAgbnVtID0gcy5oYW5kcy5oYW5kTWFwLmdldChwaWVjZS5jb2xvcik/LmdldChwaWVjZS5yb2xlKSB8fCAwLFxuICAgICAgaXNTZWxlY3RlZCA9ICEhcy5zZWxlY3RlZFBpZWNlICYmIHNhbWVQaWVjZShwaWVjZSwgcy5zZWxlY3RlZFBpZWNlKSAmJiAhcy5kcm9wcGFibGUuc3BhcmU7XG5cbiAgICB3cmFwRWwuY2xhc3NMaXN0LnRvZ2dsZShcbiAgICAgICdzZWxlY3RlZCcsXG4gICAgICAocy5hY3RpdmVDb2xvciA9PT0gJ2JvdGgnIHx8IHMuYWN0aXZlQ29sb3IgPT09IHMudHVybkNvbG9yKSAmJiBpc1NlbGVjdGVkXG4gICAgKTtcbiAgICB3cmFwRWwuY2xhc3NMaXN0LnRvZ2dsZShcbiAgICAgICdwcmVzZWxlY3RlZCcsXG4gICAgICBzLmFjdGl2ZUNvbG9yICE9PSAnYm90aCcgJiYgcy5hY3RpdmVDb2xvciAhPT0gcy50dXJuQ29sb3IgJiYgaXNTZWxlY3RlZFxuICAgICk7XG4gICAgd3JhcEVsLmNsYXNzTGlzdC50b2dnbGUoJ2RyYXdpbmcnLCAhIXMuZHJhd2FibGUucGllY2UgJiYgc2FtZVBpZWNlKHMuZHJhd2FibGUucGllY2UsIHBpZWNlKSk7XG4gICAgd3JhcEVsLmNsYXNzTGlzdC50b2dnbGUoXG4gICAgICAnY3VycmVudC1wcmUnLFxuICAgICAgISFzLnByZWRyb3BwYWJsZS5jdXJyZW50ICYmIHNhbWVQaWVjZShzLnByZWRyb3BwYWJsZS5jdXJyZW50LnBpZWNlLCBwaWVjZSlcbiAgICApO1xuICAgIHdyYXBFbC5kYXRhc2V0Lm5iID0gbnVtLnRvU3RyaW5nKCk7XG4gICAgd3JhcEVsID0gd3JhcEVsLm5leHRFbGVtZW50U2libGluZyBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgfVxufVxuIiwgImltcG9ydCB0eXBlIHsgSGVhZGxlc3NTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IGNhbGxVc2VyRnVuY3Rpb24sIG9wcG9zaXRlLCBwaWVjZU5hbWVPZiwgc2FtZVBpZWNlIH0gZnJvbSAnLi91dGlsLmpzJztcbmltcG9ydCB7IGFkZFRvSGFuZCwgcmVtb3ZlRnJvbUhhbmQgfSBmcm9tICcuL2hhbmRzLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIHRvZ2dsZU9yaWVudGF0aW9uKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIHN0YXRlLm9yaWVudGF0aW9uID0gb3Bwb3NpdGUoc3RhdGUub3JpZW50YXRpb24pO1xuICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9XG4gICAgc3RhdGUuZHJhZ2dhYmxlLmN1cnJlbnQgPVxuICAgIHN0YXRlLnByb21vdGlvbi5jdXJyZW50ID1cbiAgICBzdGF0ZS5ob3ZlcmVkID1cbiAgICBzdGF0ZS5zZWxlY3RlZCA9XG4gICAgc3RhdGUuc2VsZWN0ZWRQaWVjZSA9XG4gICAgICB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldChzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICB1bnNlbGVjdChzdGF0ZSk7XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIGNhbmNlbFByb21vdGlvbihzdGF0ZSk7XG4gIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0gc3RhdGUuZHJhZ2dhYmxlLmN1cnJlbnQgPSBzdGF0ZS5ob3ZlcmVkID0gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0UGllY2VzKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZXM6IHNnLlBpZWNlc0RpZmYpOiB2b2lkIHtcbiAgZm9yIChjb25zdCBba2V5LCBwaWVjZV0gb2YgcGllY2VzKSB7XG4gICAgaWYgKHBpZWNlKSBzdGF0ZS5waWVjZXMuc2V0KGtleSwgcGllY2UpO1xuICAgIGVsc2Ugc3RhdGUucGllY2VzLmRlbGV0ZShrZXkpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRDaGVja3Moc3RhdGU6IEhlYWRsZXNzU3RhdGUsIGNoZWNrc1ZhbHVlOiBzZy5LZXlbXSB8IHNnLkNvbG9yIHwgYm9vbGVhbik6IHZvaWQge1xuICBpZiAoQXJyYXkuaXNBcnJheShjaGVja3NWYWx1ZSkpIHtcbiAgICBzdGF0ZS5jaGVja3MgPSBjaGVja3NWYWx1ZTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoY2hlY2tzVmFsdWUgPT09IHRydWUpIGNoZWNrc1ZhbHVlID0gc3RhdGUudHVybkNvbG9yO1xuICAgIGlmIChjaGVja3NWYWx1ZSkge1xuICAgICAgY29uc3QgY2hlY2tzOiBzZy5LZXlbXSA9IFtdO1xuICAgICAgZm9yIChjb25zdCBbaywgcF0gb2Ygc3RhdGUucGllY2VzKSB7XG4gICAgICAgIGlmIChzdGF0ZS5oaWdobGlnaHQuY2hlY2tSb2xlcy5pbmNsdWRlcyhwLnJvbGUpICYmIHAuY29sb3IgPT09IGNoZWNrc1ZhbHVlKSBjaGVja3MucHVzaChrKTtcbiAgICAgIH1cbiAgICAgIHN0YXRlLmNoZWNrcyA9IGNoZWNrcztcbiAgICB9IGVsc2Ugc3RhdGUuY2hlY2tzID0gdW5kZWZpbmVkO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNldFByZW1vdmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tOiBib29sZWFuKTogdm9pZCB7XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIHN0YXRlLnByZW1vdmFibGUuY3VycmVudCA9IHsgb3JpZywgZGVzdCwgcHJvbSB9O1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByZW1vdmFibGUuZXZlbnRzLnNldCwgb3JpZywgZGVzdCwgcHJvbSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnNldFByZW1vdmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLnByZW1vdmFibGUuY3VycmVudCkge1xuICAgIHN0YXRlLnByZW1vdmFibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByZW1vdmFibGUuZXZlbnRzLnVuc2V0KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzZXRQcmVkcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tOiBib29sZWFuKTogdm9pZCB7XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50ID0geyBwaWVjZSwga2V5LCBwcm9tIH07XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJlZHJvcHBhYmxlLmV2ZW50cy5zZXQsIHBpZWNlLCBrZXksIHByb20pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5zZXRQcmVkcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCkge1xuICAgIHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJlZHJvcHBhYmxlLmV2ZW50cy51bnNldCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2VNb3ZlKFxuICBzdGF0ZTogSGVhZGxlc3NTdGF0ZSxcbiAgb3JpZzogc2cuS2V5LFxuICBkZXN0OiBzZy5LZXksXG4gIHByb206IGJvb2xlYW5cbik6IHNnLlBpZWNlIHwgYm9vbGVhbiB7XG4gIGNvbnN0IG9yaWdQaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQob3JpZyksXG4gICAgZGVzdFBpZWNlID0gc3RhdGUucGllY2VzLmdldChkZXN0KTtcbiAgaWYgKG9yaWcgPT09IGRlc3QgfHwgIW9yaWdQaWVjZSkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBjYXB0dXJlZCA9IGRlc3RQaWVjZSAmJiBkZXN0UGllY2UuY29sb3IgIT09IG9yaWdQaWVjZS5jb2xvciA/IGRlc3RQaWVjZSA6IHVuZGVmaW5lZCxcbiAgICBwcm9tUGllY2UgPSBwcm9tICYmIHByb21vdGVQaWVjZShzdGF0ZSwgb3JpZ1BpZWNlKTtcbiAgaWYgKGRlc3QgPT09IHN0YXRlLnNlbGVjdGVkIHx8IG9yaWcgPT09IHN0YXRlLnNlbGVjdGVkKSB1bnNlbGVjdChzdGF0ZSk7XG4gIHN0YXRlLnBpZWNlcy5zZXQoZGVzdCwgcHJvbVBpZWNlIHx8IG9yaWdQaWVjZSk7XG4gIHN0YXRlLnBpZWNlcy5kZWxldGUob3JpZyk7XG4gIHN0YXRlLmxhc3REZXN0cyA9IFtvcmlnLCBkZXN0XTtcbiAgc3RhdGUuY2hlY2tzID0gdW5kZWZpbmVkO1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5tb3ZlLCBvcmlnLCBkZXN0LCBwcm9tLCBjYXB0dXJlZCk7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG4gIHJldHVybiBjYXB0dXJlZCB8fCB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFzZURyb3AoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBwaWVjZTogc2cuUGllY2UsXG4gIGtleTogc2cuS2V5LFxuICBwcm9tOiBib29sZWFuXG4pOiBib29sZWFuIHtcbiAgY29uc3QgcGllY2VDb3VudCA9IHN0YXRlLmhhbmRzLmhhbmRNYXAuZ2V0KHBpZWNlLmNvbG9yKT8uZ2V0KHBpZWNlLnJvbGUpIHx8IDA7XG4gIGlmICghcGllY2VDb3VudCAmJiAhc3RhdGUuZHJvcHBhYmxlLnNwYXJlKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IHByb21QaWVjZSA9IHByb20gJiYgcHJvbW90ZVBpZWNlKHN0YXRlLCBwaWVjZSk7XG4gIGlmIChcbiAgICBrZXkgPT09IHN0YXRlLnNlbGVjdGVkIHx8XG4gICAgKCFzdGF0ZS5kcm9wcGFibGUuc3BhcmUgJiZcbiAgICAgIHBpZWNlQ291bnQgPT09IDEgJiZcbiAgICAgIHN0YXRlLnNlbGVjdGVkUGllY2UgJiZcbiAgICAgIHNhbWVQaWVjZShzdGF0ZS5zZWxlY3RlZFBpZWNlLCBwaWVjZSkpXG4gIClcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gIHN0YXRlLnBpZWNlcy5zZXQoa2V5LCBwcm9tUGllY2UgfHwgcGllY2UpO1xuICBzdGF0ZS5sYXN0RGVzdHMgPSBba2V5XTtcbiAgc3RhdGUuY2hlY2tzID0gdW5kZWZpbmVkO1xuICBpZiAoIXN0YXRlLmRyb3BwYWJsZS5zcGFyZSkgcmVtb3ZlRnJvbUhhbmQoc3RhdGUsIHBpZWNlKTtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuZHJvcCwgcGllY2UsIGtleSwgcHJvbSk7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBiYXNlVXNlck1vdmUoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBvcmlnOiBzZy5LZXksXG4gIGRlc3Q6IHNnLktleSxcbiAgcHJvbTogYm9vbGVhblxuKTogc2cuUGllY2UgfCBib29sZWFuIHtcbiAgY29uc3QgcmVzdWx0ID0gYmFzZU1vdmUoc3RhdGUsIG9yaWcsIGRlc3QsIHByb20pO1xuICBpZiAocmVzdWx0KSB7XG4gICAgc3RhdGUubW92YWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kcm9wcGFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUudHVybkNvbG9yID0gb3Bwb3NpdGUoc3RhdGUudHVybkNvbG9yKTtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBiYXNlVXNlckRyb3Aoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb206IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgY29uc3QgcmVzdWx0ID0gYmFzZURyb3Aoc3RhdGUsIHBpZWNlLCBrZXksIHByb20pO1xuICBpZiAocmVzdWx0KSB7XG4gICAgc3RhdGUubW92YWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kcm9wcGFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUudHVybkNvbG9yID0gb3Bwb3NpdGUoc3RhdGUudHVybkNvbG9yKTtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlckRyb3AoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBwaWVjZTogc2cuUGllY2UsXG4gIGtleTogc2cuS2V5LFxuICBwcm9tPzogYm9vbGVhblxuKTogYm9vbGVhbiB7XG4gIGNvbnN0IHJlYWxQcm9tID0gcHJvbSB8fCBzdGF0ZS5wcm9tb3Rpb24uZm9yY2VEcm9wUHJvbW90aW9uKHBpZWNlLCBrZXkpO1xuICBpZiAoY2FuRHJvcChzdGF0ZSwgcGllY2UsIGtleSkpIHtcbiAgICBjb25zdCByZXN1bHQgPSBiYXNlVXNlckRyb3Aoc3RhdGUsIHBpZWNlLCBrZXksIHJlYWxQcm9tKTtcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmRyb3BwYWJsZS5ldmVudHMuYWZ0ZXIsIHBpZWNlLCBrZXksIHJlYWxQcm9tLCB7XG4gICAgICAgIHByZW1hZGU6IGZhbHNlLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoY2FuUHJlZHJvcChzdGF0ZSwgcGllY2UsIGtleSkpIHtcbiAgICBzZXRQcmVkcm9wKHN0YXRlLCBwaWVjZSwga2V5LCByZWFsUHJvbSk7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlck1vdmUoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBvcmlnOiBzZy5LZXksXG4gIGRlc3Q6IHNnLktleSxcbiAgcHJvbT86IGJvb2xlYW5cbik6IGJvb2xlYW4ge1xuICBjb25zdCByZWFsUHJvbSA9IHByb20gfHwgc3RhdGUucHJvbW90aW9uLmZvcmNlTW92ZVByb21vdGlvbihvcmlnLCBkZXN0KTtcbiAgaWYgKGNhbk1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYmFzZVVzZXJNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0LCByZWFsUHJvbSk7XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgICAgY29uc3QgbWV0YWRhdGE6IHNnLk1vdmVNZXRhZGF0YSA9IHtcbiAgICAgICAgcHJlbWFkZTogZmFsc2UsXG4gICAgICB9O1xuICAgICAgaWYgKHJlc3VsdCAhPT0gdHJ1ZSkgbWV0YWRhdGEuY2FwdHVyZWQgPSByZXN1bHQ7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLm1vdmFibGUuZXZlbnRzLmFmdGVyLCBvcmlnLCBkZXN0LCByZWFsUHJvbSwgbWV0YWRhdGEpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9IGVsc2UgaWYgKGNhblByZW1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpKSB7XG4gICAgc2V0UHJlbW92ZShzdGF0ZSwgb3JpZywgZGVzdCwgcmVhbFByb20pO1xuICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB1bnNlbGVjdChzdGF0ZSk7XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2VQcm9tb3Rpb25EaWFsb2coc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgY29uc3QgcHJvbW90ZWRQaWVjZSA9IHByb21vdGVQaWVjZShzdGF0ZSwgcGllY2UpO1xuICBpZiAoc3RhdGUudmlld09ubHkgfHwgc3RhdGUucHJvbW90aW9uLmN1cnJlbnQgfHwgIXByb21vdGVkUGllY2UpIHJldHVybiBmYWxzZTtcblxuICBzdGF0ZS5wcm9tb3Rpb24uY3VycmVudCA9IHtcbiAgICBwaWVjZSxcbiAgICBwcm9tb3RlZFBpZWNlLFxuICAgIGtleSxcbiAgICBkcmFnZ2VkOiAhIXN0YXRlLmRyYWdnYWJsZS5jdXJyZW50LFxuICB9O1xuICBzdGF0ZS5ob3ZlcmVkID0ga2V5O1xuXG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvbW90aW9uRGlhbG9nRHJvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSk6IGJvb2xlYW4ge1xuICBpZiAoXG4gICAgY2FuRHJvcFByb21vdGUoc3RhdGUsIHBpZWNlLCBrZXkpICYmXG4gICAgKGNhbkRyb3Aoc3RhdGUsIHBpZWNlLCBrZXkpIHx8IGNhblByZWRyb3Aoc3RhdGUsIHBpZWNlLCBrZXkpKVxuICApIHtcbiAgICBpZiAoYmFzZVByb21vdGlvbkRpYWxvZyhzdGF0ZSwgcGllY2UsIGtleSkpIHtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJvbW90aW9uLmV2ZW50cy5pbml0aWF0ZWQpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb21vdGlvbkRpYWxvZ01vdmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KTogYm9vbGVhbiB7XG4gIGlmIChcbiAgICBjYW5Nb3ZlUHJvbW90ZShzdGF0ZSwgb3JpZywgZGVzdCkgJiZcbiAgICAoY2FuTW92ZShzdGF0ZSwgb3JpZywgZGVzdCkgfHwgY2FuUHJlbW92ZShzdGF0ZSwgb3JpZywgZGVzdCkpXG4gICkge1xuICAgIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzLmdldChvcmlnKTtcbiAgICBpZiAocGllY2UgJiYgYmFzZVByb21vdGlvbkRpYWxvZyhzdGF0ZSwgcGllY2UsIGRlc3QpKSB7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByb21vdGlvbi5ldmVudHMuaW5pdGlhdGVkKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHByb21vdGVQaWVjZShzOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UpOiBzZy5QaWVjZSB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IHByb21Sb2xlID0gcy5wcm9tb3Rpb24ucHJvbW90ZXNUbyhwaWVjZS5yb2xlKTtcbiAgcmV0dXJuIHByb21Sb2xlICE9PSB1bmRlZmluZWQgPyB7IGNvbG9yOiBwaWVjZS5jb2xvciwgcm9sZTogcHJvbVJvbGUgfSA6IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlbGV0ZVBpZWNlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBrZXk6IHNnLktleSk6IHZvaWQge1xuICBpZiAoc3RhdGUucGllY2VzLmRlbGV0ZShrZXkpKSBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5jaGFuZ2UpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0U3F1YXJlKFxuICBzdGF0ZTogSGVhZGxlc3NTdGF0ZSxcbiAga2V5OiBzZy5LZXksXG4gIHByb20/OiBib29sZWFuLFxuICBmb3JjZT86IGJvb2xlYW5cbik6IHZvaWQge1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5zZWxlY3QsIGtleSk7XG5cbiAgLy8gdW5zZWxlY3QgaWYgc2VsZWN0aW5nIHNlbGVjdGVkIGtleSwga2VlcCBzZWxlY3RlZCBmb3IgZHJhZ1xuICBpZiAoIXN0YXRlLmRyYWdnYWJsZS5lbmFibGVkICYmIHN0YXRlLnNlbGVjdGVkID09PSBrZXkpIHtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy51bnNlbGVjdCwga2V5KTtcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gdHJ5IG1vdmluZy9kcm9wcGluZ1xuICBpZiAoXG4gICAgc3RhdGUuc2VsZWN0YWJsZS5lbmFibGVkIHx8XG4gICAgZm9yY2UgfHxcbiAgICAoc3RhdGUuc2VsZWN0YWJsZS5mb3JjZVNwYXJlcyAmJiBzdGF0ZS5zZWxlY3RlZFBpZWNlICYmIHN0YXRlLmRyb3BwYWJsZS5zcGFyZSlcbiAgKSB7XG4gICAgaWYgKHN0YXRlLnNlbGVjdGVkUGllY2UgJiYgdXNlckRyb3Aoc3RhdGUsIHN0YXRlLnNlbGVjdGVkUGllY2UsIGtleSwgcHJvbSkpIHJldHVybjtcbiAgICBlbHNlIGlmIChzdGF0ZS5zZWxlY3RlZCAmJiB1c2VyTW92ZShzdGF0ZSwgc3RhdGUuc2VsZWN0ZWQsIGtleSwgcHJvbSkpIHJldHVybjtcbiAgfVxuXG4gIGlmIChcbiAgICAoc3RhdGUuc2VsZWN0YWJsZS5lbmFibGVkIHx8IHN0YXRlLmRyYWdnYWJsZS5lbmFibGVkIHx8IGZvcmNlKSAmJlxuICAgIChpc01vdmFibGUoc3RhdGUsIGtleSkgfHwgaXNQcmVtb3ZhYmxlKHN0YXRlLCBrZXkpKVxuICApIHtcbiAgICBzZXRTZWxlY3RlZChzdGF0ZSwga2V5KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0UGllY2UoXG4gIHN0YXRlOiBIZWFkbGVzc1N0YXRlLFxuICBwaWVjZTogc2cuUGllY2UsXG4gIHNwYXJlPzogYm9vbGVhbixcbiAgZm9yY2U/OiBib29sZWFuLFxuICBhcGk/OiBib29sZWFuXG4pOiB2b2lkIHtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMucGllY2VTZWxlY3QsIHBpZWNlKTtcblxuICBpZiAoc3RhdGUuc2VsZWN0YWJsZS5hZGRTcGFyZXNUb0hhbmQgJiYgc3RhdGUuZHJvcHBhYmxlLnNwYXJlICYmIHN0YXRlLnNlbGVjdGVkUGllY2UpIHtcbiAgICBhZGRUb0hhbmQoc3RhdGUsIHsgcm9sZTogc3RhdGUuc2VsZWN0ZWRQaWVjZS5yb2xlLCBjb2xvcjogcGllY2UuY29sb3IgfSk7XG4gICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuY2hhbmdlKTtcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gIH0gZWxzZSBpZiAoXG4gICAgIWFwaSAmJlxuICAgICFzdGF0ZS5kcmFnZ2FibGUuZW5hYmxlZCAmJlxuICAgIHN0YXRlLnNlbGVjdGVkUGllY2UgJiZcbiAgICBzYW1lUGllY2Uoc3RhdGUuc2VsZWN0ZWRQaWVjZSwgcGllY2UpXG4gICkge1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLnBpZWNlVW5zZWxlY3QsIHBpZWNlKTtcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gIH0gZWxzZSBpZiAoXG4gICAgKHN0YXRlLnNlbGVjdGFibGUuZW5hYmxlZCB8fCBzdGF0ZS5kcmFnZ2FibGUuZW5hYmxlZCB8fCBmb3JjZSkgJiZcbiAgICAoaXNEcm9wcGFibGUoc3RhdGUsIHBpZWNlLCAhIXNwYXJlKSB8fCBpc1ByZWRyb3BwYWJsZShzdGF0ZSwgcGllY2UpKVxuICApIHtcbiAgICBzZXRTZWxlY3RlZFBpZWNlKHN0YXRlLCBwaWVjZSk7XG4gICAgc3RhdGUuZHJvcHBhYmxlLnNwYXJlID0gISFzcGFyZTtcbiAgfSBlbHNlIHtcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFNlbGVjdGVkKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBrZXk6IHNnLktleSk6IHZvaWQge1xuICB1bnNlbGVjdChzdGF0ZSk7XG4gIHN0YXRlLnNlbGVjdGVkID0ga2V5O1xuICBzZXRQcmVEZXN0cyhzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRTZWxlY3RlZFBpZWNlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UpOiB2b2lkIHtcbiAgdW5zZWxlY3Qoc3RhdGUpO1xuICBzdGF0ZS5zZWxlY3RlZFBpZWNlID0gcGllY2U7XG4gIHNldFByZURlc3RzKHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFByZURlc3RzKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIHN0YXRlLnByZW1vdmFibGUuZGVzdHMgPSBzdGF0ZS5wcmVkcm9wcGFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG5cbiAgaWYgKHN0YXRlLnNlbGVjdGVkICYmIGlzUHJlbW92YWJsZShzdGF0ZSwgc3RhdGUuc2VsZWN0ZWQpICYmIHN0YXRlLnByZW1vdmFibGUuZ2VuZXJhdGUpXG4gICAgc3RhdGUucHJlbW92YWJsZS5kZXN0cyA9IHN0YXRlLnByZW1vdmFibGUuZ2VuZXJhdGUoc3RhdGUuc2VsZWN0ZWQsIHN0YXRlLnBpZWNlcyk7XG4gIGVsc2UgaWYgKFxuICAgIHN0YXRlLnNlbGVjdGVkUGllY2UgJiZcbiAgICBpc1ByZWRyb3BwYWJsZShzdGF0ZSwgc3RhdGUuc2VsZWN0ZWRQaWVjZSkgJiZcbiAgICBzdGF0ZS5wcmVkcm9wcGFibGUuZ2VuZXJhdGVcbiAgKVxuICAgIHN0YXRlLnByZWRyb3BwYWJsZS5kZXN0cyA9IHN0YXRlLnByZWRyb3BwYWJsZS5nZW5lcmF0ZShzdGF0ZS5zZWxlY3RlZFBpZWNlLCBzdGF0ZS5waWVjZXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5zZWxlY3Qoc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiB2b2lkIHtcbiAgc3RhdGUuc2VsZWN0ZWQgPVxuICAgIHN0YXRlLnNlbGVjdGVkUGllY2UgPVxuICAgIHN0YXRlLnByZW1vdmFibGUuZGVzdHMgPVxuICAgIHN0YXRlLnByZWRyb3BwYWJsZS5kZXN0cyA9XG4gICAgc3RhdGUucHJvbW90aW9uLmN1cnJlbnQgPVxuICAgICAgdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBpc01vdmFibGUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQob3JpZyk7XG4gIHJldHVybiAoXG4gICAgISFwaWVjZSAmJlxuICAgIChzdGF0ZS5hY3RpdmVDb2xvciA9PT0gJ2JvdGgnIHx8XG4gICAgICAoc3RhdGUuYWN0aXZlQ29sb3IgPT09IHBpZWNlLmNvbG9yICYmIHN0YXRlLnR1cm5Db2xvciA9PT0gcGllY2UuY29sb3IpKVxuICApO1xufVxuXG5mdW5jdGlvbiBpc0Ryb3BwYWJsZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBzcGFyZTogYm9vbGVhbik6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIChzcGFyZSB8fCAhIXN0YXRlLmhhbmRzLmhhbmRNYXAuZ2V0KHBpZWNlLmNvbG9yKT8uZ2V0KHBpZWNlLnJvbGUpKSAmJlxuICAgIChzdGF0ZS5hY3RpdmVDb2xvciA9PT0gJ2JvdGgnIHx8XG4gICAgICAoc3RhdGUuYWN0aXZlQ29sb3IgPT09IHBpZWNlLmNvbG9yICYmIHN0YXRlLnR1cm5Db2xvciA9PT0gcGllY2UuY29sb3IpKVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuTW92ZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgb3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBvcmlnICE9PSBkZXN0ICYmXG4gICAgaXNNb3ZhYmxlKHN0YXRlLCBvcmlnKSAmJlxuICAgIChzdGF0ZS5tb3ZhYmxlLmZyZWUgfHwgISFzdGF0ZS5tb3ZhYmxlLmRlc3RzPy5nZXQob3JpZyk/LmluY2x1ZGVzKGRlc3QpKVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuRHJvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBkZXN0OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBpc0Ryb3BwYWJsZShzdGF0ZSwgcGllY2UsIHN0YXRlLmRyb3BwYWJsZS5zcGFyZSkgJiZcbiAgICAoc3RhdGUuZHJvcHBhYmxlLmZyZWUgfHxcbiAgICAgIHN0YXRlLmRyb3BwYWJsZS5zcGFyZSB8fFxuICAgICAgISFzdGF0ZS5kcm9wcGFibGUuZGVzdHM/LmdldChwaWVjZU5hbWVPZihwaWVjZSkpPy5pbmNsdWRlcyhkZXN0KSlcbiAgKTtcbn1cblxuZnVuY3Rpb24gY2FuTW92ZVByb21vdGUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzLmdldChvcmlnKTtcbiAgcmV0dXJuICEhcGllY2UgJiYgc3RhdGUucHJvbW90aW9uLm1vdmVQcm9tb3Rpb25EaWFsb2cob3JpZywgZGVzdCk7XG59XG5cbmZ1bmN0aW9uIGNhbkRyb3BQcm9tb3RlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5KTogYm9vbGVhbiB7XG4gIHJldHVybiAhc3RhdGUuZHJvcHBhYmxlLnNwYXJlICYmIHN0YXRlLnByb21vdGlvbi5kcm9wUHJvbW90aW9uRGlhbG9nKHBpZWNlLCBrZXkpO1xufVxuXG5mdW5jdGlvbiBpc1ByZW1vdmFibGUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQob3JpZyk7XG4gIHJldHVybiAoXG4gICAgISFwaWVjZSAmJlxuICAgIHN0YXRlLnByZW1vdmFibGUuZW5hYmxlZCAmJlxuICAgIHN0YXRlLmFjdGl2ZUNvbG9yID09PSBwaWVjZS5jb2xvciAmJlxuICAgIHN0YXRlLnR1cm5Db2xvciAhPT0gcGllY2UuY29sb3JcbiAgKTtcbn1cblxuZnVuY3Rpb24gaXNQcmVkcm9wcGFibGUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgICEhc3RhdGUuaGFuZHMuaGFuZE1hcC5nZXQocGllY2UuY29sb3IpPy5nZXQocGllY2Uucm9sZSkgJiZcbiAgICBzdGF0ZS5wcmVkcm9wcGFibGUuZW5hYmxlZCAmJlxuICAgIHN0YXRlLmFjdGl2ZUNvbG9yID09PSBwaWVjZS5jb2xvciAmJlxuICAgIHN0YXRlLnR1cm5Db2xvciAhPT0gcGllY2UuY29sb3JcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhblByZW1vdmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgb3JpZyAhPT0gZGVzdCAmJlxuICAgIGlzUHJlbW92YWJsZShzdGF0ZSwgb3JpZykgJiZcbiAgICAhIXN0YXRlLnByZW1vdmFibGUuZ2VuZXJhdGUgJiZcbiAgICBzdGF0ZS5wcmVtb3ZhYmxlLmdlbmVyYXRlKG9yaWcsIHN0YXRlLnBpZWNlcykuaW5jbHVkZXMoZGVzdClcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhblByZWRyb3Aoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwgZGVzdDogc2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IGRlc3RQaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQoZGVzdCk7XG4gIHJldHVybiAoXG4gICAgaXNQcmVkcm9wcGFibGUoc3RhdGUsIHBpZWNlKSAmJlxuICAgICghZGVzdFBpZWNlIHx8IGRlc3RQaWVjZS5jb2xvciAhPT0gc3RhdGUuYWN0aXZlQ29sb3IpICYmXG4gICAgISFzdGF0ZS5wcmVkcm9wcGFibGUuZ2VuZXJhdGUgJiZcbiAgICBzdGF0ZS5wcmVkcm9wcGFibGUuZ2VuZXJhdGUocGllY2UsIHN0YXRlLnBpZWNlcykuaW5jbHVkZXMoZGVzdClcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRHJhZ2dhYmxlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBzdGF0ZS5kcmFnZ2FibGUuZW5hYmxlZCAmJlxuICAgIChzdGF0ZS5hY3RpdmVDb2xvciA9PT0gJ2JvdGgnIHx8XG4gICAgICAoc3RhdGUuYWN0aXZlQ29sb3IgPT09IHBpZWNlLmNvbG9yICYmXG4gICAgICAgIChzdGF0ZS50dXJuQ29sb3IgPT09IHBpZWNlLmNvbG9yIHx8IHN0YXRlLnByZW1vdmFibGUuZW5hYmxlZCkpKVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGxheVByZW1vdmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiBib29sZWFuIHtcbiAgY29uc3QgbW92ZSA9IHN0YXRlLnByZW1vdmFibGUuY3VycmVudDtcbiAgaWYgKCFtb3ZlKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IG9yaWcgPSBtb3ZlLm9yaWcsXG4gICAgZGVzdCA9IG1vdmUuZGVzdCxcbiAgICBwcm9tID0gbW92ZS5wcm9tO1xuICBsZXQgc3VjY2VzcyA9IGZhbHNlO1xuICBpZiAoY2FuTW92ZShzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICBjb25zdCByZXN1bHQgPSBiYXNlVXNlck1vdmUoc3RhdGUsIG9yaWcsIGRlc3QsIHByb20pO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIGNvbnN0IG1ldGFkYXRhOiBzZy5Nb3ZlTWV0YWRhdGEgPSB7IHByZW1hZGU6IHRydWUgfTtcbiAgICAgIGlmIChyZXN1bHQgIT09IHRydWUpIG1ldGFkYXRhLmNhcHR1cmVkID0gcmVzdWx0O1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5tb3ZhYmxlLmV2ZW50cy5hZnRlciwgb3JpZywgZGVzdCwgcHJvbSwgbWV0YWRhdGEpO1xuICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgfVxuICB9XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHJldHVybiBzdWNjZXNzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGxheVByZWRyb3Aoc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiBib29sZWFuIHtcbiAgY29uc3QgZHJvcCA9IHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50O1xuICBpZiAoIWRyb3ApIHJldHVybiBmYWxzZTtcbiAgY29uc3QgcGllY2UgPSBkcm9wLnBpZWNlLFxuICAgIGtleSA9IGRyb3Aua2V5LFxuICAgIHByb20gPSBkcm9wLnByb207XG4gIGxldCBzdWNjZXNzID0gZmFsc2U7XG4gIGlmIChjYW5Ecm9wKHN0YXRlLCBwaWVjZSwga2V5KSkge1xuICAgIGlmIChiYXNlVXNlckRyb3Aoc3RhdGUsIHBpZWNlLCBrZXksIHByb20pKSB7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmRyb3BwYWJsZS5ldmVudHMuYWZ0ZXIsIHBpZWNlLCBrZXksIHByb20sIHtcbiAgICAgICAgcHJlbWFkZTogdHJ1ZSxcbiAgICAgIH0pO1xuICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgfVxuICB9XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIHJldHVybiBzdWNjZXNzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsTW92ZU9yRHJvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICB1bnNldFByZWRyb3Aoc3RhdGUpO1xuICB1bnNlbGVjdChzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWxQcm9tb3Rpb24oc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiB2b2lkIHtcbiAgaWYgKCFzdGF0ZS5wcm9tb3Rpb24uY3VycmVudCkgcmV0dXJuO1xuXG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgc3RhdGUucHJvbW90aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIHN0YXRlLmhvdmVyZWQgPSB1bmRlZmluZWQ7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJvbW90aW9uLmV2ZW50cy5jYW5jZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICBzdGF0ZS5hY3RpdmVDb2xvciA9XG4gICAgc3RhdGUubW92YWJsZS5kZXN0cyA9XG4gICAgc3RhdGUuZHJvcHBhYmxlLmRlc3RzID1cbiAgICBzdGF0ZS5kcmFnZ2FibGUuY3VycmVudCA9XG4gICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPVxuICAgIHN0YXRlLnByb21vdGlvbi5jdXJyZW50ID1cbiAgICBzdGF0ZS5ob3ZlcmVkID1cbiAgICAgIHVuZGVmaW5lZDtcbiAgY2FuY2VsTW92ZU9yRHJvcChzdGF0ZSk7XG59XG4iLCAiaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IGZpbGVzLCByYW5rcyB9IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IHBvczJrZXkgfSBmcm9tICcuL3V0aWwuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gaW5mZXJEaW1lbnNpb25zKGJvYXJkU2Zlbjogc2cuQm9hcmRTZmVuKTogc2cuRGltZW5zaW9ucyB7XG4gIGNvbnN0IHJhbmtzID0gYm9hcmRTZmVuLnNwbGl0KCcvJyksXG4gICAgZmlyc3RGaWxlID0gcmFua3NbMF0uc3BsaXQoJycpO1xuICBsZXQgZmlsZXNDbnQgPSAwLFxuICAgIGNudCA9IDA7XG4gIGZvciAoY29uc3QgYyBvZiBmaXJzdEZpbGUpIHtcbiAgICBjb25zdCBuYiA9IGMuY2hhckNvZGVBdCgwKTtcbiAgICBpZiAobmIgPCA1OCAmJiBuYiA+IDQ3KSBjbnQgPSBjbnQgKiAxMCArIG5iIC0gNDg7XG4gICAgZWxzZSBpZiAoYyAhPT0gJysnKSB7XG4gICAgICBmaWxlc0NudCArPSBjbnQgKyAxO1xuICAgICAgY250ID0gMDtcbiAgICB9XG4gIH1cbiAgZmlsZXNDbnQgKz0gY250O1xuICByZXR1cm4geyBmaWxlczogZmlsZXNDbnQsIHJhbmtzOiByYW5rcy5sZW5ndGggfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNmZW5Ub0JvYXJkKFxuICBzZmVuOiBzZy5Cb2FyZFNmZW4sXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGZyb21Gb3JzeXRoPzogKGZvcnN5dGg6IHN0cmluZykgPT4gc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZFxuKTogc2cuUGllY2VzIHtcbiAgY29uc3Qgc2ZlblBhcnNlciA9IGZyb21Gb3JzeXRoIHx8IHN0YW5kYXJkRnJvbUZvcnN5dGgsXG4gICAgcGllY2VzOiBzZy5QaWVjZXMgPSBuZXcgTWFwKCk7XG4gIGxldCB4ID0gZGltcy5maWxlcyAtIDEsXG4gICAgeSA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2Zlbi5sZW5ndGg7IGkrKykge1xuICAgIHN3aXRjaCAoc2ZlbltpXSkge1xuICAgICAgY2FzZSAnICc6XG4gICAgICBjYXNlICdfJzpcbiAgICAgICAgcmV0dXJuIHBpZWNlcztcbiAgICAgIGNhc2UgJy8nOlxuICAgICAgICArK3k7XG4gICAgICAgIGlmICh5ID4gZGltcy5yYW5rcyAtIDEpIHJldHVybiBwaWVjZXM7XG4gICAgICAgIHggPSBkaW1zLmZpbGVzIC0gMTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIGNvbnN0IG5iMSA9IHNmZW5baV0uY2hhckNvZGVBdCgwKSxcbiAgICAgICAgICBuYjIgPSBzZmVuW2kgKyAxXSAmJiBzZmVuW2kgKyAxXS5jaGFyQ29kZUF0KDApO1xuICAgICAgICBpZiAobmIxIDwgNTggJiYgbmIxID4gNDcpIHtcbiAgICAgICAgICBpZiAobmIyICYmIG5iMiA8IDU4ICYmIG5iMiA+IDQ3KSB7XG4gICAgICAgICAgICB4IC09IChuYjEgLSA0OCkgKiAxMCArIChuYjIgLSA0OCk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgfSBlbHNlIHggLT0gbmIxIC0gNDg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3Qgcm9sZVN0ciA9IHNmZW5baV0gPT09ICcrJyAmJiBzZmVuLmxlbmd0aCA+IGkgKyAxID8gJysnICsgc2ZlblsrK2ldIDogc2ZlbltpXSxcbiAgICAgICAgICAgIHJvbGUgPSBzZmVuUGFyc2VyKHJvbGVTdHIpO1xuICAgICAgICAgIGlmICh4ID49IDAgJiYgcm9sZSkge1xuICAgICAgICAgICAgY29uc3QgY29sb3IgPSByb2xlU3RyID09PSByb2xlU3RyLnRvTG93ZXJDYXNlKCkgPyAnZ290ZScgOiAnc2VudGUnO1xuICAgICAgICAgICAgcGllY2VzLnNldChwb3Mya2V5KFt4LCB5XSksIHtcbiAgICAgICAgICAgICAgcm9sZTogcm9sZSxcbiAgICAgICAgICAgICAgY29sb3I6IGNvbG9yLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC0teDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcGllY2VzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYm9hcmRUb1NmZW4oXG4gIHBpZWNlczogc2cuUGllY2VzLFxuICBkaW1zOiBzZy5EaW1lbnNpb25zLFxuICB0b0ZvcnN5dGg/OiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc3RyaW5nIHwgdW5kZWZpbmVkXG4pOiBzZy5Cb2FyZFNmZW4ge1xuICBjb25zdCBzZmVuUmVuZGVyZXIgPSB0b0ZvcnN5dGggfHwgc3RhbmRhcmRUb0ZvcnN5dGgsXG4gICAgcmV2ZXJzZWRGaWxlcyA9IGZpbGVzLnNsaWNlKDAsIGRpbXMuZmlsZXMpLnJldmVyc2UoKTtcbiAgcmV0dXJuIHJhbmtzXG4gICAgLnNsaWNlKDAsIGRpbXMucmFua3MpXG4gICAgLm1hcCh5ID0+XG4gICAgICByZXZlcnNlZEZpbGVzXG4gICAgICAgIC5tYXAoeCA9PiB7XG4gICAgICAgICAgY29uc3QgcGllY2UgPSBwaWVjZXMuZ2V0KCh4ICsgeSkgYXMgc2cuS2V5KSxcbiAgICAgICAgICAgIGZvcnN5dGggPSBwaWVjZSAmJiBzZmVuUmVuZGVyZXIocGllY2Uucm9sZSk7XG4gICAgICAgICAgaWYgKGZvcnN5dGgpIHtcbiAgICAgICAgICAgIHJldHVybiBwaWVjZS5jb2xvciA9PT0gJ3NlbnRlJyA/IGZvcnN5dGgudG9VcHBlckNhc2UoKSA6IGZvcnN5dGgudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICB9IGVsc2UgcmV0dXJuICcxJztcbiAgICAgICAgfSlcbiAgICAgICAgLmpvaW4oJycpXG4gICAgKVxuICAgIC5qb2luKCcvJylcbiAgICAucmVwbGFjZSgvMXsyLH0vZywgcyA9PiBzLmxlbmd0aC50b1N0cmluZygpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNmZW5Ub0hhbmRzKFxuICBzZmVuOiBzZy5IYW5kc1NmZW4sXG4gIGZyb21Gb3JzeXRoPzogKGZvcnN5dGg6IHN0cmluZykgPT4gc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZFxuKTogc2cuSGFuZHMge1xuICBjb25zdCBzZmVuUGFyc2VyID0gZnJvbUZvcnN5dGggfHwgc3RhbmRhcmRGcm9tRm9yc3l0aCxcbiAgICBzZW50ZTogc2cuSGFuZCA9IG5ldyBNYXAoKSxcbiAgICBnb3RlOiBzZy5IYW5kID0gbmV3IE1hcCgpO1xuXG4gIGxldCB0bXBOdW0gPSAwLFxuICAgIG51bSA9IDE7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2Zlbi5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IG5iID0gc2ZlbltpXS5jaGFyQ29kZUF0KDApO1xuICAgIGlmIChuYiA8IDU4ICYmIG5iID4gNDcpIHtcbiAgICAgIHRtcE51bSA9IHRtcE51bSAqIDEwICsgbmIgLSA0ODtcbiAgICAgIG51bSA9IHRtcE51bTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgcm9sZVN0ciA9IHNmZW5baV0gPT09ICcrJyAmJiBzZmVuLmxlbmd0aCA+IGkgKyAxID8gJysnICsgc2ZlblsrK2ldIDogc2ZlbltpXSxcbiAgICAgICAgcm9sZSA9IHNmZW5QYXJzZXIocm9sZVN0cik7XG4gICAgICBpZiAocm9sZSkge1xuICAgICAgICBjb25zdCBjb2xvciA9IHJvbGVTdHIgPT09IHJvbGVTdHIudG9Mb3dlckNhc2UoKSA/ICdnb3RlJyA6ICdzZW50ZSc7XG4gICAgICAgIGlmIChjb2xvciA9PT0gJ3NlbnRlJykgc2VudGUuc2V0KHJvbGUsIChzZW50ZS5nZXQocm9sZSkgfHwgMCkgKyBudW0pO1xuICAgICAgICBlbHNlIGdvdGUuc2V0KHJvbGUsIChnb3RlLmdldChyb2xlKSB8fCAwKSArIG51bSk7XG4gICAgICB9XG4gICAgICB0bXBOdW0gPSAwO1xuICAgICAgbnVtID0gMTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IE1hcChbXG4gICAgWydzZW50ZScsIHNlbnRlXSxcbiAgICBbJ2dvdGUnLCBnb3RlXSxcbiAgXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYW5kc1RvU2ZlbihcbiAgaGFuZHM6IHNnLkhhbmRzLFxuICByb2xlczogc2cuUm9sZVN0cmluZ1tdLFxuICB0b0ZvcnN5dGg/OiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc3RyaW5nIHwgdW5kZWZpbmVkXG4pOiBzZy5IYW5kc1NmZW4ge1xuICBjb25zdCBzZmVuUmVuZGVyZXIgPSB0b0ZvcnN5dGggfHwgc3RhbmRhcmRUb0ZvcnN5dGg7XG5cbiAgbGV0IHNlbnRlSGFuZFN0ciA9ICcnLFxuICAgIGdvdGVIYW5kU3RyID0gJyc7XG4gIGZvciAoY29uc3Qgcm9sZSBvZiByb2xlcykge1xuICAgIGNvbnN0IGZvcnN5dGggPSBzZmVuUmVuZGVyZXIocm9sZSk7XG4gICAgaWYgKGZvcnN5dGgpIHtcbiAgICAgIGNvbnN0IHNlbnRlQ250ID0gaGFuZHMuZ2V0KCdzZW50ZScpPy5nZXQocm9sZSksXG4gICAgICAgIGdvdGVDbnQgPSBoYW5kcy5nZXQoJ2dvdGUnKT8uZ2V0KHJvbGUpO1xuICAgICAgaWYgKHNlbnRlQ250KSBzZW50ZUhhbmRTdHIgKz0gc2VudGVDbnQgPiAxID8gc2VudGVDbnQudG9TdHJpbmcoKSArIGZvcnN5dGggOiBmb3JzeXRoO1xuICAgICAgaWYgKGdvdGVDbnQpIGdvdGVIYW5kU3RyICs9IGdvdGVDbnQgPiAxID8gZ290ZUNudC50b1N0cmluZygpICsgZm9yc3l0aCA6IGZvcnN5dGg7XG4gICAgfVxuICB9XG4gIGlmIChzZW50ZUhhbmRTdHIgfHwgZ290ZUhhbmRTdHIpIHJldHVybiBzZW50ZUhhbmRTdHIudG9VcHBlckNhc2UoKSArIGdvdGVIYW5kU3RyLnRvTG93ZXJDYXNlKCk7XG4gIGVsc2UgcmV0dXJuICctJztcbn1cblxuZnVuY3Rpb24gc3RhbmRhcmRGcm9tRm9yc3l0aChmb3JzeXRoOiBzdHJpbmcpOiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgc3dpdGNoIChmb3JzeXRoLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdwJzpcbiAgICAgIHJldHVybiAncGF3bic7XG4gICAgY2FzZSAnbCc6XG4gICAgICByZXR1cm4gJ2xhbmNlJztcbiAgICBjYXNlICduJzpcbiAgICAgIHJldHVybiAna25pZ2h0JztcbiAgICBjYXNlICdzJzpcbiAgICAgIHJldHVybiAnc2lsdmVyJztcbiAgICBjYXNlICdnJzpcbiAgICAgIHJldHVybiAnZ29sZCc7XG4gICAgY2FzZSAnYic6XG4gICAgICByZXR1cm4gJ2Jpc2hvcCc7XG4gICAgY2FzZSAncic6XG4gICAgICByZXR1cm4gJ3Jvb2snO1xuICAgIGNhc2UgJytwJzpcbiAgICAgIHJldHVybiAndG9raW4nO1xuICAgIGNhc2UgJytsJzpcbiAgICAgIHJldHVybiAncHJvbW90ZWRsYW5jZSc7XG4gICAgY2FzZSAnK24nOlxuICAgICAgcmV0dXJuICdwcm9tb3RlZGtuaWdodCc7XG4gICAgY2FzZSAnK3MnOlxuICAgICAgcmV0dXJuICdwcm9tb3RlZHNpbHZlcic7XG4gICAgY2FzZSAnK2InOlxuICAgICAgcmV0dXJuICdob3JzZSc7XG4gICAgY2FzZSAnK3InOlxuICAgICAgcmV0dXJuICdkcmFnb24nO1xuICAgIGNhc2UgJ2snOlxuICAgICAgcmV0dXJuICdraW5nJztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuO1xuICB9XG59XG5leHBvcnQgZnVuY3Rpb24gc3RhbmRhcmRUb0ZvcnN5dGgocm9sZTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgc3dpdGNoIChyb2xlKSB7XG4gICAgY2FzZSAncGF3bic6XG4gICAgICByZXR1cm4gJ3AnO1xuICAgIGNhc2UgJ2xhbmNlJzpcbiAgICAgIHJldHVybiAnbCc7XG4gICAgY2FzZSAna25pZ2h0JzpcbiAgICAgIHJldHVybiAnbic7XG4gICAgY2FzZSAnc2lsdmVyJzpcbiAgICAgIHJldHVybiAncyc7XG4gICAgY2FzZSAnZ29sZCc6XG4gICAgICByZXR1cm4gJ2cnO1xuICAgIGNhc2UgJ2Jpc2hvcCc6XG4gICAgICByZXR1cm4gJ2InO1xuICAgIGNhc2UgJ3Jvb2snOlxuICAgICAgcmV0dXJuICdyJztcbiAgICBjYXNlICd0b2tpbic6XG4gICAgICByZXR1cm4gJytwJztcbiAgICBjYXNlICdwcm9tb3RlZGxhbmNlJzpcbiAgICAgIHJldHVybiAnK2wnO1xuICAgIGNhc2UgJ3Byb21vdGVka25pZ2h0JzpcbiAgICAgIHJldHVybiAnK24nO1xuICAgIGNhc2UgJ3Byb21vdGVkc2lsdmVyJzpcbiAgICAgIHJldHVybiAnK3MnO1xuICAgIGNhc2UgJ2hvcnNlJzpcbiAgICAgIHJldHVybiAnK2InO1xuICAgIGNhc2UgJ2RyYWdvbic6XG4gICAgICByZXR1cm4gJytyJztcbiAgICBjYXNlICdraW5nJzpcbiAgICAgIHJldHVybiAnayc7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybjtcbiAgfVxufVxuIiwgImltcG9ydCB0eXBlIHsgSGVhZGxlc3NTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgeyBEcmF3U2hhcGUsIFNxdWFyZUhpZ2hsaWdodCB9IGZyb20gJy4vZHJhdy5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgc2V0Q2hlY2tzLCBzZXRQcmVEZXN0cyB9IGZyb20gJy4vYm9hcmQuanMnO1xuaW1wb3J0IHsgaW5mZXJEaW1lbnNpb25zLCBzZmVuVG9Cb2FyZCwgc2ZlblRvSGFuZHMgfSBmcm9tICcuL3NmZW4uanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbmZpZyB7XG4gIHNmZW4/OiB7XG4gICAgYm9hcmQ/OiBzZy5Cb2FyZFNmZW47IC8vIHBpZWNlcyBvbiB0aGUgYm9hcmQgaW4gRm9yc3l0aCBub3RhdGlvblxuICAgIGhhbmRzPzogc2cuSGFuZHNTZmVuOyAvLyBwaWVjZXMgaW4gaGFuZCBpbiBGb3JzeXRoIG5vdGF0aW9uXG4gIH07XG4gIG9yaWVudGF0aW9uPzogc2cuQ29sb3I7IC8vIGJvYXJkIG9yaWVudGF0aW9uLiBzZW50ZSB8IGdvdGVcbiAgdHVybkNvbG9yPzogc2cuQ29sb3I7IC8vIHR1cm4gdG8gcGxheS4gc2VudGUgfCBnb3RlXG4gIGFjdGl2ZUNvbG9yPzogc2cuQ29sb3IgfCAnYm90aCc7IC8vIGNvbG9yIHRoYXQgY2FuIG1vdmUgb3IgZHJvcC4gc2VudGUgfCBnb3RlIHwgYm90aCB8IHVuZGVmaW5lZFxuICBjaGVja3M/OiBzZy5LZXlbXSB8IHNnLkNvbG9yIHwgYm9vbGVhbjsgLy8gc3F1YXJlcyBjdXJyZW50bHkgaW4gY2hlY2sgW1wiNWFcIl0sIGNvbG9yIGluIGNoZWNrIChzZWUgaGlnaGxpZ2h0LmNoZWNrUm9sZXMpIG9yIGJvb2xlYW4gZm9yIGN1cnJlbnQgdHVybiBjb2xvclxuICBsYXN0RGVzdHM/OiBzZy5LZXlbXTsgLy8gc3F1YXJlcyBwYXJ0IG9mIHRoZSBsYXN0IG1vdmUgb3IgZHJvcCBbXCIzY1wiLCBcIjRjXCJdXG4gIHNlbGVjdGVkPzogc2cuS2V5OyAvLyBzcXVhcmUgY3VycmVudGx5IHNlbGVjdGVkIFwiMWFcIlxuICBzZWxlY3RlZFBpZWNlPzogc2cuUGllY2U7IC8vIHBpZWNlIGluIGhhbmQgY3VycmVudGx5IHNlbGVjdGVkXG4gIGhvdmVyZWQ/OiBzZy5LZXk7IC8vIHNxdWFyZSBjdXJyZW50bHkgYmVpbmcgaG92ZXJlZFxuICB2aWV3T25seT86IGJvb2xlYW47IC8vIGRvbid0IGJpbmQgZXZlbnRzOiB0aGUgdXNlciB3aWxsIG5ldmVyIGJlIGFibGUgdG8gbW92ZSBwaWVjZXMgYXJvdW5kXG4gIHNxdWFyZVJhdGlvPzogc2cuTnVtYmVyUGFpcjsgLy8gcmF0aW8gb2YgYSBzaW5nbGUgc3F1YXJlIFt3aWR0aCwgaGVpZ2h0XVxuICBkaXNhYmxlQ29udGV4dE1lbnU/OiBib29sZWFuOyAvLyBiZWNhdXNlIHdobyBuZWVkcyBhIGNvbnRleHQgbWVudSBvbiBhIGJvYXJkLCBvbmx5IHdpdGhvdXQgdmlld09ubHlcbiAgYmxvY2tUb3VjaFNjcm9sbD86IGJvb2xlYW47IC8vIGJsb2NrIHNjcm9sbGluZyB2aWEgdG91Y2ggZHJhZ2dpbmcgb24gdGhlIGJvYXJkLCBlLmcuIGZvciBjb29yZGluYXRlIHRyYWluaW5nXG4gIHNjYWxlRG93blBpZWNlcz86IGJvb2xlYW47IC8vIGhlbHBmdWwgZm9yIHBuZ3MgLSBodHRwczovL2N0aWRkLmNvbS8yMDE1L3N2Zy1iYWNrZ3JvdW5kLXNjYWxpbmdcbiAgY29vcmRpbmF0ZXM/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGluY2x1ZGUgY29vcmRzIGF0dHJpYnV0ZXNcbiAgICBmaWxlcz86IHNnLk5vdGF0aW9uO1xuICAgIHJhbmtzPzogc2cuTm90YXRpb247XG4gIH07XG4gIGhpZ2hsaWdodD86IHtcbiAgICBsYXN0RGVzdHM/OiBib29sZWFuOyAvLyBhZGQgbGFzdC1kZXN0IGNsYXNzIHRvIHNxdWFyZXNcbiAgICBjaGVjaz86IGJvb2xlYW47IC8vIGFkZCBjaGVjayBjbGFzcyB0byBzcXVhcmVzXG4gICAgY2hlY2tSb2xlcz86IHNnLlJvbGVTdHJpbmdbXTsgLy8gcm9sZXMgdG8gYmUgaGlnaGxpZ2h0ZWQgd2hlbiBjaGVjayBpcyBib29sZWFuIGlzIHBhc3NlZCBmcm9tIGNvbmZpZ1xuICAgIGhvdmVyZWQ/OiBib29sZWFuOyAvLyBhZGQgaG92ZXIgY2xhc3MgdG8gaG92ZXJlZCBzcXVhcmVzXG4gIH07XG4gIGFuaW1hdGlvbj86IHtcbiAgICBlbmFibGVkPzogYm9vbGVhbjtcbiAgICBoYW5kcz86IGJvb2xlYW47XG4gICAgZHVyYXRpb24/OiBudW1iZXI7XG4gIH07XG4gIGhhbmRzPzoge1xuICAgIGlubGluZWQ/OiBib29sZWFuOyAvLyBhdHRhY2hlcyBzZy1oYW5kcyBkaXJlY3RseSB0byBzZy13cmFwLCBpZ25vcmVzIEhUTUxFbGVtZW50cyBwYXNzZWQgdG8gU2hvZ2lncm91bmRcbiAgICByb2xlcz86IHNnLlJvbGVTdHJpbmdbXTsgLy8gcm9sZXMgdG8gcmVuZGVyIGluIHNnLWhhbmRcbiAgfTtcbiAgbW92YWJsZT86IHtcbiAgICBmcmVlPzogYm9vbGVhbjsgLy8gYWxsIG1vdmVzIGFyZSB2YWxpZCAtIGJvYXJkIGVkaXRvclxuICAgIGRlc3RzPzogc2cuTW92ZURlc3RzOyAvLyB2YWxpZCBtb3Zlcy4ge1wiMmFcIiBbXCIzYVwiIFwiNGFcIl0gXCIxYlwiIFtcIjNhXCIgXCIzY1wiXX1cbiAgICBzaG93RGVzdHM/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgZXZlbnRzPzoge1xuICAgICAgYWZ0ZXI/OiAob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXksIHByb206IGJvb2xlYW4sIG1ldGFkYXRhOiBzZy5Nb3ZlTWV0YWRhdGEpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgbW92ZSBoYXMgYmVlbiBwbGF5ZWRcbiAgICB9O1xuICB9O1xuICBkcm9wcGFibGU/OiB7XG4gICAgZnJlZT86IGJvb2xlYW47IC8vIGFsbCBkcm9wcyBhcmUgdmFsaWQgLSBib2FyZCBlZGl0b3JcbiAgICBkZXN0cz86IHNnLkRyb3BEZXN0czsgLy8gdmFsaWQgZHJvcHMuIHtcInNlbnRlIHBhd25cIiBbXCIzYVwiIFwiNGFcIl0gXCJzZW50ZSBsYW5jZVwiIFtcIjNhXCIgXCIzY1wiXX1cbiAgICBzaG93RGVzdHM/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgc3BhcmU/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIHJlbW92ZSBkcm9wcGVkIHBpZWNlIGZyb20gaGFuZCBhZnRlciBkcm9wIC0gYm9hcmQgZWRpdG9yXG4gICAgZXZlbnRzPzoge1xuICAgICAgYWZ0ZXI/OiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSwgcHJvbTogYm9vbGVhbiwgbWV0YWRhdGE6IHNnLk1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBkcm9wIGhhcyBiZWVuIHBsYXllZFxuICAgIH07XG4gIH07XG4gIHByZW1vdmFibGU/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGFsbG93IHByZW1vdmVzIGZvciBjb2xvciB0aGF0IGNhbiBub3QgbW92ZVxuICAgIHNob3dEZXN0cz86IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBwcmUtZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgZGVzdHM/OiBzZy5LZXlbXTsgLy8gcHJlbW92ZSBkZXN0aW5hdGlvbnMgZm9yIHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgIGdlbmVyYXRlPzogKGtleTogc2cuS2V5LCBwaWVjZXM6IHNnLlBpZWNlcykgPT4gc2cuS2V5W107IC8vIGZ1bmN0aW9uIHRvIGdlbmVyYXRlIGRlc3RpbmF0aW9ucyB0aGF0IHVzZXIgY2FuIHByZW1vdmUgdG9cbiAgICBldmVudHM/OiB7XG4gICAgICBzZXQ/OiAob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXksIHByb206IGJvb2xlYW4pID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlbW92ZSBoYXMgYmVlbiBzZXRcbiAgICAgIHVuc2V0PzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVtb3ZlIGhhcyBiZWVuIHVuc2V0XG4gICAgfTtcbiAgfTtcbiAgcHJlZHJvcHBhYmxlPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuOyAvLyBhbGxvdyBwcmVkcm9wcyBmb3IgY29sb3IgdGhhdCBjYW4gbm90IG1vdmVcbiAgICBzaG93RGVzdHM/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgcHJlLWRlc3QgY2xhc3Mgb24gc3F1YXJlcyBmb3IgZHJvcHNcbiAgICBkZXN0cz86IHNnLktleVtdOyAvLyBwcmVtb3ZlIGRlc3RpbmF0aW9ucyBmb3IgdGhlIGRyb3Agc2VsZWN0aW9uXG4gICAgZ2VuZXJhdGU/OiAocGllY2U6IHNnLlBpZWNlLCBwaWVjZXM6IHNnLlBpZWNlcykgPT4gc2cuS2V5W107IC8vIGZ1bmN0aW9uIHRvIGdlbmVyYXRlIGRlc3RpbmF0aW9ucyB0aGF0IHVzZXIgY2FuIHByZWRyb3Agb25cbiAgICBldmVudHM/OiB7XG4gICAgICBzZXQ/OiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSwgcHJvbTogYm9vbGVhbikgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVkcm9wIGhhcyBiZWVuIHNldFxuICAgICAgdW5zZXQ/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZWRyb3AgaGFzIGJlZW4gdW5zZXRcbiAgICB9O1xuICB9O1xuICBkcmFnZ2FibGU/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGFsbG93IG1vdmVzICYgcHJlbW92ZXMgdG8gdXNlIGRyYWcnbiBkcm9wXG4gICAgZGlzdGFuY2U/OiBudW1iZXI7IC8vIG1pbmltdW0gZGlzdGFuY2UgdG8gaW5pdGlhdGUgYSBkcmFnOyBpbiBwaXhlbHNcbiAgICBhdXRvRGlzdGFuY2U/OiBib29sZWFuOyAvLyBsZXRzIHNob2dpZ3JvdW5kIHNldCBkaXN0YW5jZSB0byB6ZXJvIHdoZW4gdXNlciBkcmFncyBwaWVjZXNcbiAgICBzaG93R2hvc3Q/OiBib29sZWFuOyAvLyBzaG93IGdob3N0IG9mIHBpZWNlIGJlaW5nIGRyYWdnZWRcbiAgICBzaG93VG91Y2hTcXVhcmVPdmVybGF5PzogYm9vbGVhbjsgLy8gc2hvdyBzcXVhcmUgb3ZlcmxheSBvbiB0aGUgc3F1YXJlIHRoYXQgaXMgY3VycmVudGx5IGJlaW5nIGhvdmVyZWQsIHRvdWNoIG9ubHlcbiAgICBkZWxldGVPbkRyb3BPZmY/OiBib29sZWFuOyAvLyBkZWxldGUgYSBwaWVjZSB3aGVuIGl0IGlzIGRyb3BwZWQgb2ZmIHRoZSBib2FyZFxuICAgIGFkZFRvSGFuZE9uRHJvcE9mZj86IGJvb2xlYW47IC8vIGFkZCBhIHBpZWNlIHRvIGhhbmQgd2hlbiBpdCBpcyBkcm9wcGVkIG9uIGl0LCByZXF1aXJlcyBkZWxldGVPbkRyb3BPZmZcbiAgfTtcbiAgc2VsZWN0YWJsZT86IHtcbiAgICBlbmFibGVkPzogYm9vbGVhbjsgLy8gZGlzYWJsZSB0byBlbmZvcmNlIGRyYWdnaW5nIG92ZXIgY2xpY2stY2xpY2sgbW92ZVxuICAgIGZvcmNlU3BhcmVzPzogYm9vbGVhbjsgLy8gYWxsb3cgZHJvcHBpbmcgc3BhcmUgcGllY2VzIGV2ZW4gd2l0aCBzZWxlY3RhYmxlIGRpc2FibGVkXG4gICAgZGVsZXRlT25Ub3VjaD86IGJvb2xlYW47IC8vIHNlbGVjdGluZyBhIHBpZWNlIG9uIHRoZSBib2FyZCBvciBpbiBoYW5kIHdpbGwgcmVtb3ZlIGl0IC0gYm9hcmQgZWRpdG9yXG4gICAgYWRkU3BhcmVzVG9IYW5kPzogYm9vbGVhbjsgLy8gYWRkIHNlbGVjdGVkIHNwYXJlIHBpZWNlIHRvIGhhbmQgLSBib2FyZCBlZGl0b3JcbiAgfTtcbiAgZXZlbnRzPzoge1xuICAgIGNoYW5nZT86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgc2l0dWF0aW9uIGNoYW5nZXMgb24gdGhlIGJvYXJkXG4gICAgbW92ZT86IChvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSwgcHJvbTogYm9vbGVhbiwgY2FwdHVyZWRQaWVjZT86IHNnLlBpZWNlKSA9PiB2b2lkO1xuICAgIGRyb3A/OiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSwgcHJvbTogYm9vbGVhbikgPT4gdm9pZDtcbiAgICBzZWxlY3Q/OiAoa2V5OiBzZy5LZXkpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIGEgc3F1YXJlIGlzIHNlbGVjdGVkXG4gICAgdW5zZWxlY3Q/OiAoa2V5OiBzZy5LZXkpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIGEgc2VsZWN0ZWQgc3F1YXJlIGlzIGRpcmVjdGx5IHVuc2VsZWN0ZWQgLSBkcm9wcGVkIGJhY2sgb3IgY2xpY2tlZCBvbiB0aGUgb3JpZ2luYWwgc3F1YXJlXG4gICAgcGllY2VTZWxlY3Q/OiAocGllY2U6IHNnLlBpZWNlKSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBhIHBpZWNlIGluIGhhbmQgaXMgc2VsZWN0ZWRcbiAgICBwaWVjZVVuc2VsZWN0PzogKHBpZWNlOiBzZy5QaWVjZSkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gYSBzZWxlY3RlZCBwaWVjZSBpcyBkaXJlY3RseSB1bnNlbGVjdGVkIC0gZHJvcHBlZCBiYWNrIG9yIGNsaWNrZWQgb24gdGhlIHNhbWUgcGllY2VcbiAgICBpbnNlcnQ/OiAoYm9hcmRFbGVtZW50cz86IHNnLkJvYXJkRWxlbWVudHMsIGhhbmRFbGVtZW50cz86IHNnLkhhbmRFbGVtZW50cykgPT4gdm9pZDsgLy8gd2hlbiB0aGUgYm9hcmQvaGFuZHMgRE9NIGhhcyBiZWVuIChyZSlpbnNlcnRlZFxuICB9O1xuICBkcmF3YWJsZT86IHtcbiAgICBlbmFibGVkPzogYm9vbGVhbjsgLy8gY2FuIGRyYXdcbiAgICB2aXNpYmxlPzogYm9vbGVhbjsgLy8gY2FuIHZpZXdcbiAgICBmb3JjZWQ/OiBib29sZWFuOyAvLyBjYW4gb25seSBkcmF3XG4gICAgZXJhc2VPbkNsaWNrPzogYm9vbGVhbjtcbiAgICBzaGFwZXM/OiBEcmF3U2hhcGVbXTtcbiAgICBhdXRvU2hhcGVzPzogRHJhd1NoYXBlW107XG4gICAgc3F1YXJlcz86IFNxdWFyZUhpZ2hsaWdodFtdO1xuICAgIG9uQ2hhbmdlPzogKHNoYXBlczogRHJhd1NoYXBlW10pID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciBkcmF3YWJsZSBzaGFwZXMgY2hhbmdlXG4gIH07XG4gIGZvcnN5dGg/OiB7XG4gICAgdG9Gb3JzeXRoPzogKHJvbGU6IHNnLlJvbGVTdHJpbmcpID0+IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBmcm9tRm9yc3l0aD86IChzdHI6IHN0cmluZykgPT4gc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZDtcbiAgfTtcbiAgcHJvbW90aW9uPzoge1xuICAgIHByb21vdGVzVG8/OiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICB1bnByb21vdGVzVG8/OiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBtb3ZlUHJvbW90aW9uRGlhbG9nPzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KSA9PiBib29sZWFuOyAvLyBhY3RpdmF0ZSBwcm9tb3Rpb24gZGlhbG9nXG4gICAgZm9yY2VNb3ZlUHJvbW90aW9uPzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KSA9PiBib29sZWFuOyAvLyBhdXRvIHByb21vdGUgYWZ0ZXIgbW92ZVxuICAgIGRyb3BQcm9tb3Rpb25EaWFsb2c/OiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSkgPT4gYm9vbGVhbjsgLy8gYWN0aXZhdGUgcHJvbW90aW9uIGRpYWxvZ1xuICAgIGZvcmNlRHJvcFByb21vdGlvbj86IChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5KSA9PiBib29sZWFuOyAvLyBhdXRvIHByb21vdGUgYWZ0ZXIgZHJvcFxuICAgIGV2ZW50cz86IHtcbiAgICAgIGluaXRpYXRlZD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIHByb21vdGlvbiBkaWFsb2cgaXMgc3RhcnRlZFxuICAgICAgYWZ0ZXI/OiAocGllY2U6IHNnLlBpZWNlKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdXNlciBzZWxlY3RzIGEgcGllY2VcbiAgICAgIGNhbmNlbD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB1c2VyIGNhbmNlbHMgdGhlIHNlbGVjdGlvblxuICAgIH07XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseUFuaW1hdGlvbihzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgY29uZmlnOiBDb25maWcpOiB2b2lkIHtcbiAgaWYgKGNvbmZpZy5hbmltYXRpb24pIHtcbiAgICBkZWVwTWVyZ2Uoc3RhdGUuYW5pbWF0aW9uLCBjb25maWcuYW5pbWF0aW9uKTtcbiAgICAvLyBubyBuZWVkIGZvciBzdWNoIHNob3J0IGFuaW1hdGlvbnNcbiAgICBpZiAoKHN0YXRlLmFuaW1hdGlvbi5kdXJhdGlvbiB8fCAwKSA8IDcwKSBzdGF0ZS5hbmltYXRpb24uZW5hYmxlZCA9IGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25maWd1cmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIGNvbmZpZzogQ29uZmlnKTogdm9pZCB7XG4gIC8vIGRvbid0IG1lcmdlLCBqdXN0IG92ZXJyaWRlLlxuICBpZiAoY29uZmlnLm1vdmFibGU/LmRlc3RzKSBzdGF0ZS5tb3ZhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICBpZiAoY29uZmlnLmRyb3BwYWJsZT8uZGVzdHMpIHN0YXRlLmRyb3BwYWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbiAgaWYgKGNvbmZpZy5kcmF3YWJsZT8uc2hhcGVzKSBzdGF0ZS5kcmF3YWJsZS5zaGFwZXMgPSBbXTtcbiAgaWYgKGNvbmZpZy5kcmF3YWJsZT8uYXV0b1NoYXBlcykgc3RhdGUuZHJhd2FibGUuYXV0b1NoYXBlcyA9IFtdO1xuICBpZiAoY29uZmlnLmRyYXdhYmxlPy5zcXVhcmVzKSBzdGF0ZS5kcmF3YWJsZS5zcXVhcmVzID0gW107XG4gIGlmIChjb25maWcuaGFuZHM/LnJvbGVzKSBzdGF0ZS5oYW5kcy5yb2xlcyA9IFtdO1xuXG4gIGRlZXBNZXJnZShzdGF0ZSwgY29uZmlnKTtcblxuICAvLyBpZiBhIHNmZW4gd2FzIHByb3ZpZGVkLCByZXBsYWNlIHRoZSBwaWVjZXMsIGV4Y2VwdCB0aGUgY3VycmVudGx5IGRyYWdnZWQgb25lXG4gIGlmIChjb25maWcuc2Zlbj8uYm9hcmQpIHtcbiAgICBzdGF0ZS5kaW1lbnNpb25zID0gaW5mZXJEaW1lbnNpb25zKGNvbmZpZy5zZmVuLmJvYXJkKTtcbiAgICBzdGF0ZS5waWVjZXMgPSBzZmVuVG9Cb2FyZChjb25maWcuc2Zlbi5ib2FyZCwgc3RhdGUuZGltZW5zaW9ucywgc3RhdGUuZm9yc3l0aC5mcm9tRm9yc3l0aCk7XG4gICAgc3RhdGUuZHJhd2FibGUuc2hhcGVzID0gY29uZmlnLmRyYXdhYmxlPy5zaGFwZXMgfHwgW107XG4gIH1cblxuICBpZiAoY29uZmlnLnNmZW4/LmhhbmRzKSB7XG4gICAgc3RhdGUuaGFuZHMuaGFuZE1hcCA9IHNmZW5Ub0hhbmRzKGNvbmZpZy5zZmVuLmhhbmRzLCBzdGF0ZS5mb3JzeXRoLmZyb21Gb3JzeXRoKTtcbiAgfVxuXG4gIC8vIGFwcGx5IGNvbmZpZyB2YWx1ZXMgdGhhdCBjb3VsZCBiZSB1bmRlZmluZWQgeWV0IG1lYW5pbmdmdWxcbiAgaWYgKCdjaGVja3MnIGluIGNvbmZpZykgc2V0Q2hlY2tzKHN0YXRlLCBjb25maWcuY2hlY2tzIHx8IGZhbHNlKTtcbiAgaWYgKCdsYXN0RGVzdHMnIGluIGNvbmZpZyAmJiAhY29uZmlnLmxhc3REZXN0cykgc3RhdGUubGFzdERlc3RzID0gdW5kZWZpbmVkO1xuICAvLyBpbiBjYXNlIG9mIGRyb3AgbGFzdCBtb3ZlLCB0aGVyZSdzIGEgc2luZ2xlIHNxdWFyZS5cbiAgLy8gaWYgdGhlIHByZXZpb3VzIGxhc3QgbW92ZSBoYWQgdHdvIHNxdWFyZXMsXG4gIC8vIHRoZSBtZXJnZSBhbGdvcml0aG0gd2lsbCBpbmNvcnJlY3RseSBrZWVwIHRoZSBzZWNvbmQgc3F1YXJlLlxuICBlbHNlIGlmIChjb25maWcubGFzdERlc3RzKSBzdGF0ZS5sYXN0RGVzdHMgPSBjb25maWcubGFzdERlc3RzO1xuXG4gIC8vIGZpeCBtb3ZlL3ByZW1vdmUgZGVzdHNcbiAgc2V0UHJlRGVzdHMoc3RhdGUpO1xuXG4gIGFwcGx5QW5pbWF0aW9uKHN0YXRlLCBjb25maWcpO1xufVxuXG5mdW5jdGlvbiBkZWVwTWVyZ2UoYmFzZTogYW55LCBleHRlbmQ6IGFueSk6IHZvaWQge1xuICBmb3IgKGNvbnN0IGtleSBpbiBleHRlbmQpIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGV4dGVuZCwga2V5KSkge1xuICAgICAgaWYgKFxuICAgICAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYmFzZSwga2V5KSAmJlxuICAgICAgICBpc1BsYWluT2JqZWN0KGJhc2Vba2V5XSkgJiZcbiAgICAgICAgaXNQbGFpbk9iamVjdChleHRlbmRba2V5XSlcbiAgICAgIClcbiAgICAgICAgZGVlcE1lcmdlKGJhc2Vba2V5XSwgZXh0ZW5kW2tleV0pO1xuICAgICAgZWxzZSBiYXNlW2tleV0gPSBleHRlbmRba2V5XTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNQbGFpbk9iamVjdChvOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIGlmICh0eXBlb2YgbyAhPT0gJ29iamVjdCcgfHwgbyA9PT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvKTtcbiAgcmV0dXJuIHByb3RvID09PSBPYmplY3QucHJvdG90eXBlIHx8IHByb3RvID09PSBudWxsO1xufVxuIiwgImltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyBhbGxLZXlzLCBjb2xvcnMgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbC5qcyc7XG5cbmV4cG9ydCB0eXBlIE11dGF0aW9uPEE+ID0gKHN0YXRlOiBTdGF0ZSkgPT4gQTtcblxuLy8gMCwxIGFuaW1hdGlvbiBnb2FsXG4vLyAyLDMgYW5pbWF0aW9uIGN1cnJlbnQgc3RhdHVzXG5leHBvcnQgdHlwZSBBbmltVmVjdG9yID0gc2cuTnVtYmVyUXVhZDtcblxuZXhwb3J0IHR5cGUgQW5pbVZlY3RvcnMgPSBNYXA8c2cuS2V5LCBBbmltVmVjdG9yPjtcblxuZXhwb3J0IHR5cGUgQW5pbUZhZGluZ3MgPSBNYXA8c2cuS2V5LCBzZy5QaWVjZT47XG5cbmV4cG9ydCB0eXBlIEFuaW1Qcm9tb3Rpb25zID0gTWFwPHNnLktleSwgc2cuUGllY2U+O1xuXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1QbGFuIHtcbiAgYW5pbXM6IEFuaW1WZWN0b3JzO1xuICBmYWRpbmdzOiBBbmltRmFkaW5ncztcbiAgcHJvbW90aW9uczogQW5pbVByb21vdGlvbnM7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbUN1cnJlbnQge1xuICBzdGFydDogRE9NSGlnaFJlc1RpbWVTdGFtcDtcbiAgZnJlcXVlbmN5OiBzZy5LSHo7XG4gIHBsYW46IEFuaW1QbGFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW5pbTxBPihtdXRhdGlvbjogTXV0YXRpb248QT4sIHN0YXRlOiBTdGF0ZSk6IEEge1xuICByZXR1cm4gc3RhdGUuYW5pbWF0aW9uLmVuYWJsZWQgPyBhbmltYXRlKG11dGF0aW9uLCBzdGF0ZSkgOiByZW5kZXIobXV0YXRpb24sIHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlcjxBPihtdXRhdGlvbjogTXV0YXRpb248QT4sIHN0YXRlOiBTdGF0ZSk6IEEge1xuICBjb25zdCByZXN1bHQgPSBtdXRhdGlvbihzdGF0ZSk7XG4gIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuaW50ZXJmYWNlIEFuaW1QaWVjZSB7XG4gIGtleT86IHNnLktleTtcbiAgcG9zOiBzZy5Qb3M7XG4gIHBpZWNlOiBzZy5QaWVjZTtcbn1cblxuZnVuY3Rpb24gbWFrZVBpZWNlKGtleTogc2cuS2V5LCBwaWVjZTogc2cuUGllY2UpOiBBbmltUGllY2Uge1xuICByZXR1cm4ge1xuICAgIGtleToga2V5LFxuICAgIHBvczogdXRpbC5rZXkycG9zKGtleSksXG4gICAgcGllY2U6IHBpZWNlLFxuICB9O1xufVxuXG5mdW5jdGlvbiBjbG9zZXIocGllY2U6IEFuaW1QaWVjZSwgcGllY2VzOiBBbmltUGllY2VbXSk6IEFuaW1QaWVjZSB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBwaWVjZXMuc29ydCgocDEsIHAyKSA9PiB7XG4gICAgcmV0dXJuIHV0aWwuZGlzdGFuY2VTcShwaWVjZS5wb3MsIHAxLnBvcykgLSB1dGlsLmRpc3RhbmNlU3EocGllY2UucG9zLCBwMi5wb3MpO1xuICB9KVswXTtcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVBsYW4ocHJldlBpZWNlczogc2cuUGllY2VzLCBwcmV2SGFuZHM6IHNnLkhhbmRzLCBjdXJyZW50OiBTdGF0ZSk6IEFuaW1QbGFuIHtcbiAgY29uc3QgYW5pbXM6IEFuaW1WZWN0b3JzID0gbmV3IE1hcCgpLFxuICAgIGFuaW1lZE9yaWdzOiBzZy5LZXlbXSA9IFtdLFxuICAgIGZhZGluZ3M6IEFuaW1GYWRpbmdzID0gbmV3IE1hcCgpLFxuICAgIHByb21vdGlvbnM6IEFuaW1Qcm9tb3Rpb25zID0gbmV3IE1hcCgpLFxuICAgIG1pc3NpbmdzOiBBbmltUGllY2VbXSA9IFtdLFxuICAgIG5ld3M6IEFuaW1QaWVjZVtdID0gW10sXG4gICAgcHJlUGllY2VzID0gbmV3IE1hcDxzZy5LZXksIEFuaW1QaWVjZT4oKTtcblxuICBmb3IgKGNvbnN0IFtrLCBwXSBvZiBwcmV2UGllY2VzKSB7XG4gICAgcHJlUGllY2VzLnNldChrLCBtYWtlUGllY2UoaywgcCkpO1xuICB9XG4gIGZvciAoY29uc3Qga2V5IG9mIGFsbEtleXMpIHtcbiAgICBjb25zdCBjdXJQID0gY3VycmVudC5waWVjZXMuZ2V0KGtleSksXG4gICAgICBwcmVQID0gcHJlUGllY2VzLmdldChrZXkpO1xuICAgIGlmIChjdXJQKSB7XG4gICAgICBpZiAocHJlUCkge1xuICAgICAgICBpZiAoIXV0aWwuc2FtZVBpZWNlKGN1clAsIHByZVAucGllY2UpKSB7XG4gICAgICAgICAgbWlzc2luZ3MucHVzaChwcmVQKTtcbiAgICAgICAgICBuZXdzLnB1c2gobWFrZVBpZWNlKGtleSwgY3VyUCkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgbmV3cy5wdXNoKG1ha2VQaWVjZShrZXksIGN1clApKTtcbiAgICB9IGVsc2UgaWYgKHByZVApIG1pc3NpbmdzLnB1c2gocHJlUCk7XG4gIH1cbiAgaWYgKGN1cnJlbnQuYW5pbWF0aW9uLmhhbmRzKSB7XG4gICAgZm9yIChjb25zdCBjb2xvciBvZiBjb2xvcnMpIHtcbiAgICAgIGNvbnN0IGN1ckggPSBjdXJyZW50LmhhbmRzLmhhbmRNYXAuZ2V0KGNvbG9yKSxcbiAgICAgICAgcHJlSCA9IHByZXZIYW5kcy5nZXQoY29sb3IpO1xuICAgICAgaWYgKHByZUggJiYgY3VySCkge1xuICAgICAgICBmb3IgKGNvbnN0IFtyb2xlLCBuXSBvZiBwcmVIKSB7XG4gICAgICAgICAgY29uc3QgcGllY2U6IHNnLlBpZWNlID0geyByb2xlLCBjb2xvciB9LFxuICAgICAgICAgICAgY3VyTiA9IGN1ckguZ2V0KHJvbGUpIHx8IDA7XG4gICAgICAgICAgaWYgKGN1ck4gPCBuKSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kUGllY2VPZmZzZXQgPSBjdXJyZW50LmRvbS5ib3VuZHMuaGFuZHNcbiAgICAgICAgICAgICAgICAucGllY2VCb3VuZHMoKVxuICAgICAgICAgICAgICAgIC5nZXQodXRpbC5waWVjZU5hbWVPZihwaWVjZSkpLFxuICAgICAgICAgICAgICBib3VuZHMgPSBjdXJyZW50LmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCksXG4gICAgICAgICAgICAgIG91dFBvcyA9XG4gICAgICAgICAgICAgICAgaGFuZFBpZWNlT2Zmc2V0ICYmIGJvdW5kc1xuICAgICAgICAgICAgICAgICAgPyB1dGlsLnBvc09mT3V0c2lkZUVsKFxuICAgICAgICAgICAgICAgICAgICAgIGhhbmRQaWVjZU9mZnNldC5sZWZ0LFxuICAgICAgICAgICAgICAgICAgICAgIGhhbmRQaWVjZU9mZnNldC50b3AsXG4gICAgICAgICAgICAgICAgICAgICAgdXRpbC5zZW50ZVBvdihjdXJyZW50Lm9yaWVudGF0aW9uKSxcbiAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50LmRpbWVuc2lvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgYm91bmRzXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKG91dFBvcylcbiAgICAgICAgICAgICAgbWlzc2luZ3MucHVzaCh7XG4gICAgICAgICAgICAgICAgcG9zOiBvdXRQb3MsXG4gICAgICAgICAgICAgICAgcGllY2U6IHBpZWNlLFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZm9yIChjb25zdCBuZXdQIG9mIG5ld3MpIHtcbiAgICBjb25zdCBwcmVQID0gY2xvc2VyKFxuICAgICAgbmV3UCxcbiAgICAgIG1pc3NpbmdzLmZpbHRlcihwID0+IHtcbiAgICAgICAgaWYgKHV0aWwuc2FtZVBpZWNlKG5ld1AucGllY2UsIHAucGllY2UpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgLy8gY2hlY2tpbmcgd2hldGhlciBwcm9tb3RlZCBwaWVjZXMgYXJlIHRoZSBzYW1lXG4gICAgICAgIGNvbnN0IHBSb2xlID0gY3VycmVudC5wcm9tb3Rpb24ucHJvbW90ZXNUbyhwLnBpZWNlLnJvbGUpLFxuICAgICAgICAgIHBQaWVjZSA9IHBSb2xlICYmIHsgY29sb3I6IHAucGllY2UuY29sb3IsIHJvbGU6IHBSb2xlIH07XG4gICAgICAgIGNvbnN0IG5Sb2xlID0gY3VycmVudC5wcm9tb3Rpb24ucHJvbW90ZXNUbyhuZXdQLnBpZWNlLnJvbGUpLFxuICAgICAgICAgIG5QaWVjZSA9IG5Sb2xlICYmIHsgY29sb3I6IG5ld1AucGllY2UuY29sb3IsIHJvbGU6IG5Sb2xlIH07XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgKCEhcFBpZWNlICYmIHV0aWwuc2FtZVBpZWNlKG5ld1AucGllY2UsIHBQaWVjZSkpIHx8XG4gICAgICAgICAgKCEhblBpZWNlICYmIHV0aWwuc2FtZVBpZWNlKG5QaWVjZSwgcC5waWVjZSkpXG4gICAgICAgICk7XG4gICAgICB9KVxuICAgICk7XG4gICAgaWYgKHByZVApIHtcbiAgICAgIGNvbnN0IHZlY3RvciA9IFtwcmVQLnBvc1swXSAtIG5ld1AucG9zWzBdLCBwcmVQLnBvc1sxXSAtIG5ld1AucG9zWzFdXTtcbiAgICAgIGFuaW1zLnNldChuZXdQLmtleSEsIHZlY3Rvci5jb25jYXQodmVjdG9yKSBhcyBBbmltVmVjdG9yKTtcbiAgICAgIGlmIChwcmVQLmtleSkgYW5pbWVkT3JpZ3MucHVzaChwcmVQLmtleSk7XG4gICAgICBpZiAoIXV0aWwuc2FtZVBpZWNlKG5ld1AucGllY2UsIHByZVAucGllY2UpICYmIG5ld1Aua2V5KSBwcm9tb3Rpb25zLnNldChuZXdQLmtleSwgcHJlUC5waWVjZSk7XG4gICAgfVxuICB9XG4gIGZvciAoY29uc3QgcCBvZiBtaXNzaW5ncykge1xuICAgIGlmIChwLmtleSAmJiAhYW5pbWVkT3JpZ3MuaW5jbHVkZXMocC5rZXkpKSBmYWRpbmdzLnNldChwLmtleSwgcC5waWVjZSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGFuaW1zOiBhbmltcyxcbiAgICBmYWRpbmdzOiBmYWRpbmdzLFxuICAgIHByb21vdGlvbnM6IHByb21vdGlvbnMsXG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0ZXAoc3RhdGU6IFN0YXRlLCBub3c6IERPTUhpZ2hSZXNUaW1lU3RhbXApOiB2b2lkIHtcbiAgY29uc3QgY3VyID0gc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQ7XG4gIGlmIChjdXIgPT09IHVuZGVmaW5lZCkge1xuICAgIC8vIGFuaW1hdGlvbiB3YXMgY2FuY2VsZWQgOihcbiAgICBpZiAoIXN0YXRlLmRvbS5kZXN0cm95ZWQpIHN0YXRlLmRvbS5yZWRyYXdOb3coKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgcmVzdCA9IDEgLSAobm93IC0gY3VyLnN0YXJ0KSAqIGN1ci5mcmVxdWVuY3k7XG4gIGlmIChyZXN0IDw9IDApIHtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20ucmVkcmF3Tm93KCk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgZWFzZSA9IGVhc2luZyhyZXN0KTtcbiAgICBmb3IgKGNvbnN0IGNmZyBvZiBjdXIucGxhbi5hbmltcy52YWx1ZXMoKSkge1xuICAgICAgY2ZnWzJdID0gY2ZnWzBdICogZWFzZTtcbiAgICAgIGNmZ1szXSA9IGNmZ1sxXSAqIGVhc2U7XG4gICAgfVxuICAgIHN0YXRlLmRvbS5yZWRyYXdOb3codHJ1ZSk7IC8vIG9wdGltaXNhdGlvbjogZG9uJ3QgcmVuZGVyIFNWRyBjaGFuZ2VzIGR1cmluZyBhbmltYXRpb25zXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKChub3cgPSBwZXJmb3JtYW5jZS5ub3coKSkgPT4gc3RlcChzdGF0ZSwgbm93KSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYW5pbWF0ZTxBPihtdXRhdGlvbjogTXV0YXRpb248QT4sIHN0YXRlOiBTdGF0ZSk6IEEge1xuICAvLyBjbG9uZSBzdGF0ZSBiZWZvcmUgbXV0YXRpbmcgaXRcbiAgY29uc3QgcHJldlBpZWNlczogc2cuUGllY2VzID0gbmV3IE1hcChzdGF0ZS5waWVjZXMpLFxuICAgIHByZXZIYW5kczogc2cuSGFuZHMgPSBuZXcgTWFwKFtcbiAgICAgIFsnc2VudGUnLCBuZXcgTWFwKHN0YXRlLmhhbmRzLmhhbmRNYXAuZ2V0KCdzZW50ZScpKV0sXG4gICAgICBbJ2dvdGUnLCBuZXcgTWFwKHN0YXRlLmhhbmRzLmhhbmRNYXAuZ2V0KCdnb3RlJykpXSxcbiAgICBdKTtcblxuICBjb25zdCByZXN1bHQgPSBtdXRhdGlvbihzdGF0ZSksXG4gICAgcGxhbiA9IGNvbXB1dGVQbGFuKHByZXZQaWVjZXMsIHByZXZIYW5kcywgc3RhdGUpO1xuICBpZiAocGxhbi5hbmltcy5zaXplIHx8IHBsYW4uZmFkaW5ncy5zaXplKSB7XG4gICAgY29uc3QgYWxyZWFkeVJ1bm5pbmcgPSBzdGF0ZS5hbmltYXRpb24uY3VycmVudD8uc3RhcnQgIT09IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHtcbiAgICAgIHN0YXJ0OiBwZXJmb3JtYW5jZS5ub3coKSxcbiAgICAgIGZyZXF1ZW5jeTogMSAvIE1hdGgubWF4KHN0YXRlLmFuaW1hdGlvbi5kdXJhdGlvbiwgMSksXG4gICAgICBwbGFuOiBwbGFuLFxuICAgIH07XG4gICAgaWYgKCFhbHJlYWR5UnVubmluZykgc3RlcChzdGF0ZSwgcGVyZm9ybWFuY2Uubm93KCkpO1xuICB9IGVsc2Uge1xuICAgIC8vIGRvbid0IGFuaW1hdGUsIGp1c3QgcmVuZGVyIHJpZ2h0IGF3YXlcbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vZ3JlLzE2NTAyOTRcbmZ1bmN0aW9uIGVhc2luZyh0OiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gdCA8IDAuNSA/IDQgKiB0ICogdCAqIHQgOiAodCAtIDEpICogKDIgKiB0IC0gMikgKiAoMiAqIHQgLSAyKSArIDE7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgeyBEcmF3U2hhcGUsIERyYXdTaGFwZVBpZWNlLCBEcmF3Q3VycmVudCB9IGZyb20gJy4vZHJhdy5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHtcbiAgY3JlYXRlRWwsXG4gIGtleTJwb3MsXG4gIHBpZWNlTmFtZU9mLFxuICBwb3NUb1RyYW5zbGF0ZVJlbCxcbiAgc2FtZVBpZWNlLFxuICB0cmFuc2xhdGVSZWwsXG4gIHBvc09mT3V0c2lkZUVsLFxuICBzZW50ZVBvdixcbn0gZnJvbSAnLi91dGlsLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNWR0VsZW1lbnQodGFnTmFtZTogc3RyaW5nKTogU1ZHRWxlbWVudCB7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgdGFnTmFtZSk7XG59XG5cbmludGVyZmFjZSBTaGFwZSB7XG4gIHNoYXBlOiBEcmF3U2hhcGU7XG4gIGhhc2g6IEhhc2g7XG4gIGN1cnJlbnQ/OiBib29sZWFuO1xufVxuXG50eXBlIEFycm93RGVzdHMgPSBNYXA8c2cuS2V5IHwgc2cuUGllY2VOYW1lLCBudW1iZXI+OyAvLyBob3cgbWFueSBhcnJvd3MgbGFuZCBvbiBhIHNxdWFyZVxuXG50eXBlIEhhc2ggPSBzdHJpbmc7XG5cbmNvbnN0IG91dHNpZGVBcnJvd0hhc2ggPSAnb3V0c2lkZUFycm93JztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclNoYXBlcyhcbiAgc3RhdGU6IFN0YXRlLFxuICBzdmc6IFNWR0VsZW1lbnQsXG4gIGN1c3RvbVN2ZzogU1ZHRWxlbWVudCxcbiAgZnJlZVBpZWNlczogSFRNTEVsZW1lbnRcbik6IHZvaWQge1xuICBjb25zdCBkID0gc3RhdGUuZHJhd2FibGUsXG4gICAgY3VyRCA9IGQuY3VycmVudCxcbiAgICBjdXIgPSBjdXJEPy5kZXN0ID8gKGN1ckQgYXMgRHJhd1NoYXBlKSA6IHVuZGVmaW5lZCxcbiAgICBvdXRzaWRlQXJyb3cgPSAhIWN1ckQgJiYgIWN1cixcbiAgICBhcnJvd0Rlc3RzOiBBcnJvd0Rlc3RzID0gbmV3IE1hcCgpLFxuICAgIHBpZWNlTWFwID0gbmV3IE1hcDxzZy5LZXksIERyYXdTaGFwZT4oKTtcblxuICBjb25zdCBoYXNoQm91bmRzID0gKCkgPT4ge1xuICAgIC8vIHRvZG8gYWxzbyBwb3NzaWJsZSBwaWVjZSBib3VuZHNcbiAgICBjb25zdCBib3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpO1xuICAgIHJldHVybiAoYm91bmRzICYmIGJvdW5kcy53aWR0aC50b1N0cmluZygpICsgYm91bmRzLmhlaWdodCkgfHwgJyc7XG4gIH07XG5cbiAgZm9yIChjb25zdCBzIG9mIGQuc2hhcGVzLmNvbmNhdChkLmF1dG9TaGFwZXMpLmNvbmNhdChjdXIgPyBbY3VyXSA6IFtdKSkge1xuICAgIGNvbnN0IGRlc3ROYW1lID0gaXNQaWVjZShzLmRlc3QpID8gcGllY2VOYW1lT2Yocy5kZXN0KSA6IHMuZGVzdDtcbiAgICBpZiAoIXNhbWVQaWVjZU9yS2V5KHMuZGVzdCwgcy5vcmlnKSlcbiAgICAgIGFycm93RGVzdHMuc2V0KGRlc3ROYW1lLCAoYXJyb3dEZXN0cy5nZXQoZGVzdE5hbWUpIHx8IDApICsgMSk7XG4gIH1cblxuICBmb3IgKGNvbnN0IHMgb2YgZC5zaGFwZXMuY29uY2F0KGN1ciA/IFtjdXJdIDogW10pLmNvbmNhdChkLmF1dG9TaGFwZXMpKSB7XG4gICAgaWYgKHMucGllY2UgJiYgIWlzUGllY2Uocy5vcmlnKSkgcGllY2VNYXAuc2V0KHMub3JpZywgcyk7XG4gIH1cbiAgY29uc3QgcGllY2VTaGFwZXMgPSBbLi4ucGllY2VNYXAudmFsdWVzKCldLm1hcChzID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgc2hhcGU6IHMsXG4gICAgICBoYXNoOiBzaGFwZUhhc2gocywgYXJyb3dEZXN0cywgZmFsc2UsIGhhc2hCb3VuZHMpLFxuICAgIH07XG4gIH0pO1xuXG4gIGNvbnN0IHNoYXBlczogU2hhcGVbXSA9IGQuc2hhcGVzLmNvbmNhdChkLmF1dG9TaGFwZXMpLm1hcCgoczogRHJhd1NoYXBlKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNoYXBlOiBzLFxuICAgICAgaGFzaDogc2hhcGVIYXNoKHMsIGFycm93RGVzdHMsIGZhbHNlLCBoYXNoQm91bmRzKSxcbiAgICB9O1xuICB9KTtcbiAgaWYgKGN1cilcbiAgICBzaGFwZXMucHVzaCh7XG4gICAgICBzaGFwZTogY3VyLFxuICAgICAgaGFzaDogc2hhcGVIYXNoKGN1ciwgYXJyb3dEZXN0cywgdHJ1ZSwgaGFzaEJvdW5kcyksXG4gICAgICBjdXJyZW50OiB0cnVlLFxuICAgIH0pO1xuXG4gIGNvbnN0IGZ1bGxIYXNoID0gc2hhcGVzLm1hcChzYyA9PiBzYy5oYXNoKS5qb2luKCc7JykgKyAob3V0c2lkZUFycm93ID8gb3V0c2lkZUFycm93SGFzaCA6ICcnKTtcbiAgaWYgKGZ1bGxIYXNoID09PSBzdGF0ZS5kcmF3YWJsZS5wcmV2U3ZnSGFzaCkgcmV0dXJuO1xuICBzdGF0ZS5kcmF3YWJsZS5wcmV2U3ZnSGFzaCA9IGZ1bGxIYXNoO1xuXG4gIC8qXG4gICAgLS0gRE9NIGhpZXJhcmNoeSAtLVxuICAgIDxzdmcgY2xhc3M9XCJzZy1zaGFwZXNcIj4gKDw9IHN2ZylcbiAgICAgIDxkZWZzPlxuICAgICAgICAuLi4oZm9yIGJydXNoZXMpLi4uXG4gICAgICA8L2RlZnM+XG4gICAgICA8Zz5cbiAgICAgICAgLi4uKGZvciBhcnJvd3MgYW5kIGNpcmNsZXMpLi4uXG4gICAgICA8L2c+XG4gICAgPC9zdmc+XG4gICAgPHN2ZyBjbGFzcz1cInNnLWN1c3RvbS1zdmdzXCI+ICg8PSBjdXN0b21TdmcpXG4gICAgICA8Zz5cbiAgICAgICAgLi4uKGZvciBjdXN0b20gc3ZncykuLi5cbiAgICAgIDwvZz5cbiAgICA8c2ctZnJlZS1waWVjZXM+ICg8PSBmcmVlUGllY2VzKVxuICAgICAgLi4uKGZvciBwaWVjZXMpLi4uXG4gICAgPC9zZy1mcmVlLXBpZWNlcz5cbiAgICA8L3N2Zz5cbiAgKi9cbiAgY29uc3QgZGVmc0VsID0gc3ZnLnF1ZXJ5U2VsZWN0b3IoJ2RlZnMnKSBhcyBTVkdFbGVtZW50LFxuICAgIHNoYXBlc0VsID0gc3ZnLnF1ZXJ5U2VsZWN0b3IoJ2cnKSBhcyBTVkdFbGVtZW50LFxuICAgIGN1c3RvbVN2Z3NFbCA9IGN1c3RvbVN2Zy5xdWVyeVNlbGVjdG9yKCdnJykgYXMgU1ZHRWxlbWVudDtcblxuICBzeW5jRGVmcyhzaGFwZXMsIG91dHNpZGVBcnJvdyA/IGN1ckQgOiB1bmRlZmluZWQsIGRlZnNFbCk7XG4gIHN5bmNTaGFwZXMoXG4gICAgc2hhcGVzLmZpbHRlcihzID0+ICFzLnNoYXBlLmN1c3RvbVN2ZyAmJiAoIXMuc2hhcGUucGllY2UgfHwgcy5jdXJyZW50KSksXG4gICAgc2hhcGVzRWwsXG4gICAgc2hhcGUgPT4gcmVuZGVyU1ZHU2hhcGUoc3RhdGUsIHNoYXBlLCBhcnJvd0Rlc3RzKSxcbiAgICBvdXRzaWRlQXJyb3dcbiAgKTtcbiAgc3luY1NoYXBlcyhcbiAgICBzaGFwZXMuZmlsdGVyKHMgPT4gcy5zaGFwZS5jdXN0b21TdmcpLFxuICAgIGN1c3RvbVN2Z3NFbCxcbiAgICBzaGFwZSA9PiByZW5kZXJTVkdTaGFwZShzdGF0ZSwgc2hhcGUsIGFycm93RGVzdHMpXG4gICk7XG4gIHN5bmNTaGFwZXMocGllY2VTaGFwZXMsIGZyZWVQaWVjZXMsIHNoYXBlID0+IHJlbmRlclBpZWNlKHN0YXRlLCBzaGFwZSkpO1xuXG4gIGlmICghb3V0c2lkZUFycm93ICYmIGN1ckQpIGN1ckQuYXJyb3cgPSB1bmRlZmluZWQ7XG5cbiAgaWYgKG91dHNpZGVBcnJvdyAmJiAhY3VyRC5hcnJvdykge1xuICAgIGNvbnN0IG9yaWcgPSBwaWVjZU9yS2V5VG9Qb3MoY3VyRC5vcmlnLCBzdGF0ZSk7XG4gICAgaWYgKG9yaWcpIHtcbiAgICAgIGNvbnN0IGcgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ2cnKSwge1xuICAgICAgICAgIGNsYXNzOiBzaGFwZUNsYXNzKGN1ckQuYnJ1c2gsIHRydWUsIHRydWUpLFxuICAgICAgICAgIHNnSGFzaDogb3V0c2lkZUFycm93SGFzaCxcbiAgICAgICAgfSksXG4gICAgICAgIGVsID0gcmVuZGVyQXJyb3coY3VyRC5icnVzaCwgb3JpZywgb3JpZywgc3RhdGUuc3F1YXJlUmF0aW8sIHRydWUsIGZhbHNlKTtcbiAgICAgIGcuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgY3VyRC5hcnJvdyA9IGVsO1xuICAgICAgc2hhcGVzRWwuYXBwZW5kQ2hpbGQoZyk7XG4gICAgfVxuICB9XG59XG5cbi8vIGFwcGVuZCBvbmx5LiBEb24ndCB0cnkgdG8gdXBkYXRlL3JlbW92ZS5cbmZ1bmN0aW9uIHN5bmNEZWZzKFxuICBzaGFwZXM6IFNoYXBlW10sXG4gIG91dHNpZGVTaGFwZTogRHJhd0N1cnJlbnQgfCB1bmRlZmluZWQsXG4gIGRlZnNFbDogU1ZHRWxlbWVudFxuKTogdm9pZCB7XG4gIGNvbnN0IGJydXNoZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgZm9yIChjb25zdCBzIG9mIHNoYXBlcykge1xuICAgIGlmICghc2FtZVBpZWNlT3JLZXkocy5zaGFwZS5kZXN0LCBzLnNoYXBlLm9yaWcpKSBicnVzaGVzLmFkZChzLnNoYXBlLmJydXNoKTtcbiAgfVxuICBpZiAob3V0c2lkZVNoYXBlKSBicnVzaGVzLmFkZChvdXRzaWRlU2hhcGUuYnJ1c2gpO1xuICBjb25zdCBrZXlzSW5Eb20gPSBuZXcgU2V0KCk7XG4gIGxldCBlbDogU1ZHRWxlbWVudCB8IHVuZGVmaW5lZCA9IGRlZnNFbC5maXJzdEVsZW1lbnRDaGlsZCBhcyBTVkdFbGVtZW50O1xuICB3aGlsZSAoZWwpIHtcbiAgICBrZXlzSW5Eb20uYWRkKGVsLmdldEF0dHJpYnV0ZSgnc2dLZXknKSk7XG4gICAgZWwgPSBlbC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgU1ZHRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgfVxuICBmb3IgKGNvbnN0IGtleSBvZiBicnVzaGVzKSB7XG4gICAgY29uc3QgYnJ1c2ggPSBrZXkgfHwgJ3ByaW1hcnknO1xuICAgIGlmICgha2V5c0luRG9tLmhhcyhicnVzaCkpIGRlZnNFbC5hcHBlbmRDaGlsZChyZW5kZXJNYXJrZXIoYnJ1c2gpKTtcbiAgfVxufVxuXG4vLyBhcHBlbmQgYW5kIHJlbW92ZSBvbmx5LiBObyB1cGRhdGVzLlxuZXhwb3J0IGZ1bmN0aW9uIHN5bmNTaGFwZXMoXG4gIHNoYXBlczogU2hhcGVbXSxcbiAgcm9vdDogSFRNTEVsZW1lbnQgfCBTVkdFbGVtZW50LFxuICByZW5kZXJTaGFwZTogKHNoYXBlOiBTaGFwZSkgPT4gSFRNTEVsZW1lbnQgfCBTVkdFbGVtZW50IHwgdW5kZWZpbmVkLFxuICBvdXRzaWRlQXJyb3c/OiBib29sZWFuXG4pOiB2b2lkIHtcbiAgY29uc3QgaGFzaGVzSW5Eb20gPSBuZXcgTWFwKCksIC8vIGJ5IGhhc2hcbiAgICB0b1JlbW92ZTogU1ZHRWxlbWVudFtdID0gW107XG4gIGZvciAoY29uc3Qgc2Mgb2Ygc2hhcGVzKSBoYXNoZXNJbkRvbS5zZXQoc2MuaGFzaCwgZmFsc2UpO1xuICBpZiAob3V0c2lkZUFycm93KSBoYXNoZXNJbkRvbS5zZXQob3V0c2lkZUFycm93SGFzaCwgdHJ1ZSk7XG4gIGxldCBlbDogU1ZHRWxlbWVudCB8IHVuZGVmaW5lZCA9IHJvb3QuZmlyc3RFbGVtZW50Q2hpbGQgYXMgU1ZHRWxlbWVudCxcbiAgICBlbEhhc2g6IEhhc2g7XG4gIHdoaWxlIChlbCkge1xuICAgIGVsSGFzaCA9IGVsLmdldEF0dHJpYnV0ZSgnc2dIYXNoJykhO1xuICAgIC8vIGZvdW5kIGEgc2hhcGUgZWxlbWVudCB0aGF0J3MgaGVyZSB0byBzdGF5XG4gICAgaWYgKGhhc2hlc0luRG9tLmhhcyhlbEhhc2gpKSBoYXNoZXNJbkRvbS5zZXQoZWxIYXNoLCB0cnVlKTtcbiAgICAvLyBvciByZW1vdmUgaXRcbiAgICBlbHNlIHRvUmVtb3ZlLnB1c2goZWwpO1xuICAgIGVsID0gZWwubmV4dEVsZW1lbnRTaWJsaW5nIGFzIFNWR0VsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIH1cbiAgLy8gcmVtb3ZlIG9sZCBzaGFwZXNcbiAgZm9yIChjb25zdCBlbCBvZiB0b1JlbW92ZSkgcm9vdC5yZW1vdmVDaGlsZChlbCk7XG4gIC8vIGluc2VydCBzaGFwZXMgdGhhdCBhcmUgbm90IHlldCBpbiBkb21cbiAgZm9yIChjb25zdCBzYyBvZiBzaGFwZXMpIHtcbiAgICBpZiAoIWhhc2hlc0luRG9tLmdldChzYy5oYXNoKSkge1xuICAgICAgY29uc3Qgc2hhcGVFbCA9IHJlbmRlclNoYXBlKHNjKTtcbiAgICAgIGlmIChzaGFwZUVsKSByb290LmFwcGVuZENoaWxkKHNoYXBlRWwpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzaGFwZUhhc2goXG4gIHsgb3JpZywgZGVzdCwgYnJ1c2gsIHBpZWNlLCBjdXN0b21TdmcsIGRlc2NyaXB0aW9uIH06IERyYXdTaGFwZSxcbiAgYXJyb3dEZXN0czogQXJyb3dEZXN0cyxcbiAgY3VycmVudDogYm9vbGVhbixcbiAgYm91bmRIYXNoOiAoKSA9PiBzdHJpbmdcbik6IEhhc2gge1xuICByZXR1cm4gW1xuICAgIGN1cnJlbnQsXG4gICAgKGlzUGllY2Uob3JpZykgfHwgaXNQaWVjZShkZXN0KSkgJiYgYm91bmRIYXNoKCksXG4gICAgaXNQaWVjZShvcmlnKSA/IHBpZWNlSGFzaChvcmlnKSA6IG9yaWcsXG4gICAgaXNQaWVjZShkZXN0KSA/IHBpZWNlSGFzaChkZXN0KSA6IGRlc3QsXG4gICAgYnJ1c2gsXG4gICAgKGFycm93RGVzdHMuZ2V0KGlzUGllY2UoZGVzdCkgPyBwaWVjZU5hbWVPZihkZXN0KSA6IGRlc3QpIHx8IDApID4gMSxcbiAgICBwaWVjZSAmJiBwaWVjZUhhc2gocGllY2UpLFxuICAgIGN1c3RvbVN2ZyAmJiBjdXN0b21TdmdIYXNoKGN1c3RvbVN2ZyksXG4gICAgZGVzY3JpcHRpb24sXG4gIF1cbiAgICAuZmlsdGVyKHggPT4geClcbiAgICAuam9pbignLCcpO1xufVxuXG5mdW5jdGlvbiBwaWVjZUhhc2gocGllY2U6IERyYXdTaGFwZVBpZWNlKTogSGFzaCB7XG4gIHJldHVybiBbcGllY2UuY29sb3IsIHBpZWNlLnJvbGUsIHBpZWNlLnNjYWxlXS5maWx0ZXIoeCA9PiB4KS5qb2luKCcsJyk7XG59XG5cbmZ1bmN0aW9uIGN1c3RvbVN2Z0hhc2goczogc3RyaW5nKTogSGFzaCB7XG4gIC8vIFJvbGxpbmcgaGFzaCB3aXRoIGJhc2UgMzEgKGNmLiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy83NjE2NDYxL2dlbmVyYXRlLWEtaGFzaC1mcm9tLXN0cmluZy1pbi1qYXZhc2NyaXB0KVxuICBsZXQgaCA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcy5sZW5ndGg7IGkrKykge1xuICAgIGggPSAoKGggPDwgNSkgLSBoICsgcy5jaGFyQ29kZUF0KGkpKSA+Pj4gMDtcbiAgfVxuICByZXR1cm4gJ2N1c3RvbS0nICsgaC50b1N0cmluZygpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJTVkdTaGFwZShcbiAgc3RhdGU6IFN0YXRlLFxuICB7IHNoYXBlLCBjdXJyZW50LCBoYXNoIH06IFNoYXBlLFxuICBhcnJvd0Rlc3RzOiBBcnJvd0Rlc3RzXG4pOiBTVkdFbGVtZW50IHwgdW5kZWZpbmVkIHtcbiAgY29uc3Qgb3JpZyA9IHBpZWNlT3JLZXlUb1BvcyhzaGFwZS5vcmlnLCBzdGF0ZSk7XG4gIGlmICghb3JpZykgcmV0dXJuO1xuICBpZiAoc2hhcGUuY3VzdG9tU3ZnKSB7XG4gICAgcmV0dXJuIHJlbmRlckN1c3RvbVN2ZyhzaGFwZS5icnVzaCwgc2hhcGUuY3VzdG9tU3ZnLCBvcmlnLCBzdGF0ZS5zcXVhcmVSYXRpbyk7XG4gIH0gZWxzZSB7XG4gICAgbGV0IGVsOiBTVkdFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgIGNvbnN0IGRlc3QgPSAhc2FtZVBpZWNlT3JLZXkoc2hhcGUub3JpZywgc2hhcGUuZGVzdCkgJiYgcGllY2VPcktleVRvUG9zKHNoYXBlLmRlc3QsIHN0YXRlKTtcbiAgICBpZiAoZGVzdCkge1xuICAgICAgZWwgPSByZW5kZXJBcnJvdyhcbiAgICAgICAgc2hhcGUuYnJ1c2gsXG4gICAgICAgIG9yaWcsXG4gICAgICAgIGRlc3QsXG4gICAgICAgIHN0YXRlLnNxdWFyZVJhdGlvLFxuICAgICAgICAhIWN1cnJlbnQsXG4gICAgICAgIChhcnJvd0Rlc3RzLmdldChpc1BpZWNlKHNoYXBlLmRlc3QpID8gcGllY2VOYW1lT2Yoc2hhcGUuZGVzdCkgOiBzaGFwZS5kZXN0KSB8fCAwKSA+IDFcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmIChzYW1lUGllY2VPcktleShzaGFwZS5kZXN0LCBzaGFwZS5vcmlnKSkge1xuICAgICAgbGV0IHJhdGlvOiBzZy5OdW1iZXJQYWlyID0gc3RhdGUuc3F1YXJlUmF0aW87XG4gICAgICBpZiAoaXNQaWVjZShzaGFwZS5vcmlnKSkge1xuICAgICAgICBjb25zdCBwaWVjZUJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMoKS5nZXQocGllY2VOYW1lT2Yoc2hhcGUub3JpZykpLFxuICAgICAgICAgIGJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gICAgICAgIGlmIChwaWVjZUJvdW5kcyAmJiBib3VuZHMpIHtcbiAgICAgICAgICBjb25zdCBoZWlnaHRCYXNlID0gcGllY2VCb3VuZHMuaGVpZ2h0IC8gKGJvdW5kcy5oZWlnaHQgLyBzdGF0ZS5kaW1lbnNpb25zLnJhbmtzKTtcbiAgICAgICAgICAvLyB3ZSB3YW50IHRvIGtlZXAgdGhlIHJhdGlvIHRoYXQgaXMgb24gdGhlIGJvYXJkXG4gICAgICAgICAgcmF0aW8gPSBbaGVpZ2h0QmFzZSAqIHN0YXRlLnNxdWFyZVJhdGlvWzBdLCBoZWlnaHRCYXNlICogc3RhdGUuc3F1YXJlUmF0aW9bMV1dO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbCA9IHJlbmRlckVsbGlwc2Uob3JpZywgcmF0aW8sICEhY3VycmVudCk7XG4gICAgfVxuICAgIGlmIChlbCkge1xuICAgICAgY29uc3QgZyA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnZycpLCB7XG4gICAgICAgIGNsYXNzOiBzaGFwZUNsYXNzKHNoYXBlLmJydXNoLCAhIWN1cnJlbnQsIGZhbHNlKSxcbiAgICAgICAgc2dIYXNoOiBoYXNoLFxuICAgICAgfSk7XG4gICAgICBnLmFwcGVuZENoaWxkKGVsKTtcbiAgICAgIGNvbnN0IGRlc2NFbCA9IHNoYXBlLmRlc2NyaXB0aW9uICYmIHJlbmRlckRlc2NyaXB0aW9uKHN0YXRlLCBzaGFwZSwgYXJyb3dEZXN0cyk7XG4gICAgICBpZiAoZGVzY0VsKSBnLmFwcGVuZENoaWxkKGRlc2NFbCk7XG4gICAgICByZXR1cm4gZztcbiAgICB9IGVsc2UgcmV0dXJuO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlckN1c3RvbVN2ZyhcbiAgYnJ1c2g6IHN0cmluZyxcbiAgY3VzdG9tU3ZnOiBzdHJpbmcsXG4gIHBvczogc2cuUG9zLFxuICByYXRpbzogc2cuTnVtYmVyUGFpclxuKTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IFt4LCB5XSA9IHBvcztcblxuICAvLyBUcmFuc2xhdGUgdG8gdG9wLWxlZnQgb2YgYG9yaWdgIHNxdWFyZVxuICBjb25zdCBnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdnJyksIHsgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7eH0sJHt5fSlgIH0pO1xuXG4gIGNvbnN0IHN2ZyA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnc3ZnJyksIHtcbiAgICBjbGFzczogYnJ1c2gsXG4gICAgd2lkdGg6IHJhdGlvWzBdLFxuICAgIGhlaWdodDogcmF0aW9bMV0sXG4gICAgdmlld0JveDogYDAgMCAke3JhdGlvWzBdICogMTB9ICR7cmF0aW9bMV0gKiAxMH1gLFxuICB9KTtcblxuICBnLmFwcGVuZENoaWxkKHN2Zyk7XG4gIHN2Zy5pbm5lckhUTUwgPSBjdXN0b21Tdmc7XG5cbiAgcmV0dXJuIGc7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckVsbGlwc2UocG9zOiBzZy5Qb3MsIHJhdGlvOiBzZy5OdW1iZXJQYWlyLCBjdXJyZW50OiBib29sZWFuKTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IG8gPSBwb3MsXG4gICAgd2lkdGhzID0gZWxsaXBzZVdpZHRoKHJhdGlvKTtcbiAgcmV0dXJuIHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnZWxsaXBzZScpLCB7XG4gICAgJ3N0cm9rZS13aWR0aCc6IHdpZHRoc1tjdXJyZW50ID8gMCA6IDFdLFxuICAgIGZpbGw6ICdub25lJyxcbiAgICBjeDogb1swXSxcbiAgICBjeTogb1sxXSxcbiAgICByeDogcmF0aW9bMF0gLyAyIC0gd2lkdGhzWzFdIC8gMixcbiAgICByeTogcmF0aW9bMV0gLyAyIC0gd2lkdGhzWzFdIC8gMixcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckFycm93KFxuICBicnVzaDogc3RyaW5nLFxuICBvcmlnOiBzZy5Qb3MsXG4gIGRlc3Q6IHNnLlBvcyxcbiAgcmF0aW86IHNnLk51bWJlclBhaXIsXG4gIGN1cnJlbnQ6IGJvb2xlYW4sXG4gIHNob3J0ZW46IGJvb2xlYW5cbik6IFNWR0VsZW1lbnQge1xuICBjb25zdCBtID0gYXJyb3dNYXJnaW4oc2hvcnRlbiAmJiAhY3VycmVudCwgcmF0aW8pLFxuICAgIGEgPSBvcmlnLFxuICAgIGIgPSBkZXN0LFxuICAgIGR4ID0gYlswXSAtIGFbMF0sXG4gICAgZHkgPSBiWzFdIC0gYVsxXSxcbiAgICBhbmdsZSA9IE1hdGguYXRhbjIoZHksIGR4KSxcbiAgICB4byA9IE1hdGguY29zKGFuZ2xlKSAqIG0sXG4gICAgeW8gPSBNYXRoLnNpbihhbmdsZSkgKiBtO1xuICByZXR1cm4gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdsaW5lJyksIHtcbiAgICAnc3Ryb2tlLXdpZHRoJzogbGluZVdpZHRoKGN1cnJlbnQsIHJhdGlvKSxcbiAgICAnc3Ryb2tlLWxpbmVjYXAnOiAncm91bmQnLFxuICAgICdtYXJrZXItZW5kJzogJ3VybCgjYXJyb3doZWFkLScgKyAoYnJ1c2ggfHwgJ3ByaW1hcnknKSArICcpJyxcbiAgICB4MTogYVswXSxcbiAgICB5MTogYVsxXSxcbiAgICB4MjogYlswXSAtIHhvLFxuICAgIHkyOiBiWzFdIC0geW8sXG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyUGllY2Uoc3RhdGU6IFN0YXRlLCB7IHNoYXBlIH06IFNoYXBlKTogc2cuUGllY2VOb2RlIHwgdW5kZWZpbmVkIHtcbiAgaWYgKCFzaGFwZS5waWVjZSB8fCBpc1BpZWNlKHNoYXBlLm9yaWcpKSByZXR1cm47XG5cbiAgY29uc3Qgb3JpZyA9IHNoYXBlLm9yaWcsXG4gICAgc2NhbGUgPSAoc2hhcGUucGllY2Uuc2NhbGUgfHwgMSkgKiAoc3RhdGUuc2NhbGVEb3duUGllY2VzID8gMC41IDogMSk7XG5cbiAgY29uc3QgcGllY2VFbCA9IGNyZWF0ZUVsKCdwaWVjZScsIHBpZWNlTmFtZU9mKHNoYXBlLnBpZWNlKSkgYXMgc2cuUGllY2VOb2RlO1xuICBwaWVjZUVsLnNnS2V5ID0gb3JpZztcbiAgcGllY2VFbC5zZ1NjYWxlID0gc2NhbGU7XG4gIHRyYW5zbGF0ZVJlbChcbiAgICBwaWVjZUVsLFxuICAgIHBvc1RvVHJhbnNsYXRlUmVsKHN0YXRlLmRpbWVuc2lvbnMpKGtleTJwb3Mob3JpZyksIHNlbnRlUG92KHN0YXRlLm9yaWVudGF0aW9uKSksXG4gICAgc3RhdGUuc2NhbGVEb3duUGllY2VzID8gMC41IDogMSxcbiAgICBzY2FsZVxuICApO1xuXG4gIHJldHVybiBwaWVjZUVsO1xufVxuXG5mdW5jdGlvbiByZW5kZXJEZXNjcmlwdGlvbihcbiAgc3RhdGU6IFN0YXRlLFxuICBzaGFwZTogRHJhd1NoYXBlLFxuICBhcnJvd0Rlc3RzOiBBcnJvd0Rlc3RzXG4pOiBTVkdFbGVtZW50IHwgdW5kZWZpbmVkIHtcbiAgY29uc3Qgb3JpZyA9IHBpZWNlT3JLZXlUb1BvcyhzaGFwZS5vcmlnLCBzdGF0ZSk7XG4gIGlmICghb3JpZyB8fCAhc2hhcGUuZGVzY3JpcHRpb24pIHJldHVybjtcbiAgY29uc3QgZGVzdCA9ICFzYW1lUGllY2VPcktleShzaGFwZS5vcmlnLCBzaGFwZS5kZXN0KSAmJiBwaWVjZU9yS2V5VG9Qb3Moc2hhcGUuZGVzdCwgc3RhdGUpLFxuICAgIGRpZmYgPSBkZXN0ID8gW2Rlc3RbMF0gLSBvcmlnWzBdLCBkZXN0WzFdIC0gb3JpZ1sxXV0gOiBbMCwgMF0sXG4gICAgb2Zmc2V0ID1cbiAgICAgIChhcnJvd0Rlc3RzLmdldChpc1BpZWNlKHNoYXBlLmRlc3QpID8gcGllY2VOYW1lT2Yoc2hhcGUuZGVzdCkgOiBzaGFwZS5kZXN0KSB8fCAwKSA+IDFcbiAgICAgICAgPyAwLjNcbiAgICAgICAgOiAwLjE1LFxuICAgIGNsb3NlID1cbiAgICAgIChkaWZmWzBdID09PSAwIHx8IE1hdGguYWJzKGRpZmZbMF0pID09PSBzdGF0ZS5zcXVhcmVSYXRpb1swXSkgJiZcbiAgICAgIChkaWZmWzFdID09PSAwIHx8IE1hdGguYWJzKGRpZmZbMV0pID09PSBzdGF0ZS5zcXVhcmVSYXRpb1sxXSksXG4gICAgcmF0aW8gPSBkZXN0ID8gMC41NSAtIChjbG9zZSA/IG9mZnNldCA6IDApIDogMCxcbiAgICBtaWQ6IHNnLlBvcyA9IFtvcmlnWzBdICsgZGlmZlswXSAqIHJhdGlvLCBvcmlnWzFdICsgZGlmZlsxXSAqIHJhdGlvXSxcbiAgICB0ZXh0TGVuZ3RoID0gc2hhcGUuZGVzY3JpcHRpb24ubGVuZ3RoO1xuICBjb25zdCBnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdnJyksIHsgY2xhc3M6ICdkZXNjcmlwdGlvbicgfSksXG4gICAgY2lyY2xlID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdlbGxpcHNlJyksIHtcbiAgICAgIGN4OiBtaWRbMF0sXG4gICAgICBjeTogbWlkWzFdLFxuICAgICAgcng6IHRleHRMZW5ndGggKyAxLjUsXG4gICAgICByeTogMi41LFxuICAgIH0pLFxuICAgIHRleHQgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ3RleHQnKSwge1xuICAgICAgeDogbWlkWzBdLFxuICAgICAgeTogbWlkWzFdLFxuICAgICAgJ3RleHQtYW5jaG9yJzogJ21pZGRsZScsXG4gICAgICAnZG9taW5hbnQtYmFzZWxpbmUnOiAnY2VudHJhbCcsXG4gICAgfSk7XG4gIGcuYXBwZW5kQ2hpbGQoY2lyY2xlKTtcbiAgdGV4dC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzaGFwZS5kZXNjcmlwdGlvbikpO1xuICBnLmFwcGVuZENoaWxkKHRleHQpO1xuICByZXR1cm4gZztcbn1cblxuZnVuY3Rpb24gcmVuZGVyTWFya2VyKGJydXNoOiBzdHJpbmcpOiBTVkdFbGVtZW50IHtcbiAgY29uc3QgbWFya2VyID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdtYXJrZXInKSwge1xuICAgIGlkOiAnYXJyb3doZWFkLScgKyBicnVzaCxcbiAgICBvcmllbnQ6ICdhdXRvJyxcbiAgICBtYXJrZXJXaWR0aDogNCxcbiAgICBtYXJrZXJIZWlnaHQ6IDgsXG4gICAgcmVmWDogMi4wNSxcbiAgICByZWZZOiAyLjAxLFxuICB9KTtcbiAgbWFya2VyLmFwcGVuZENoaWxkKFxuICAgIHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgncGF0aCcpLCB7XG4gICAgICBkOiAnTTAsMCBWNCBMMywyIFonLFxuICAgIH0pXG4gICk7XG4gIG1hcmtlci5zZXRBdHRyaWJ1dGUoJ3NnS2V5JywgYnJ1c2gpO1xuICByZXR1cm4gbWFya2VyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0QXR0cmlidXRlcyhlbDogU1ZHRWxlbWVudCwgYXR0cnM6IFJlY29yZDxzdHJpbmcsIGFueT4pOiBTVkdFbGVtZW50IHtcbiAgZm9yIChjb25zdCBrZXkgaW4gYXR0cnMpIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGF0dHJzLCBrZXkpKSBlbC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyc1trZXldKTtcbiAgfVxuICByZXR1cm4gZWw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwb3MydXNlcihcbiAgcG9zOiBzZy5Qb3MsXG4gIGNvbG9yOiBzZy5Db2xvcixcbiAgZGltczogc2cuRGltZW5zaW9ucyxcbiAgcmF0aW86IHNnLk51bWJlclBhaXJcbik6IHNnLk51bWJlclBhaXIge1xuICByZXR1cm4gY29sb3IgPT09ICdzZW50ZSdcbiAgICA/IFsoZGltcy5maWxlcyAtIDEgLSBwb3NbMF0pICogcmF0aW9bMF0sIHBvc1sxXSAqIHJhdGlvWzFdXVxuICAgIDogW3Bvc1swXSAqIHJhdGlvWzBdLCAoZGltcy5yYW5rcyAtIDEgLSBwb3NbMV0pICogcmF0aW9bMV1dO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQaWVjZSh4OiBzZy5LZXkgfCBzZy5QaWVjZSk6IHggaXMgc2cuUGllY2Uge1xuICByZXR1cm4gdHlwZW9mIHggPT09ICdvYmplY3QnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2FtZVBpZWNlT3JLZXkoa3AxOiBzZy5LZXkgfCBzZy5QaWVjZSwga3AyOiBzZy5LZXkgfCBzZy5QaWVjZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKGlzUGllY2Uoa3AxKSAmJiBpc1BpZWNlKGtwMikgJiYgc2FtZVBpZWNlKGtwMSwga3AyKSkgfHwga3AxID09PSBrcDI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VzQm91bmRzKHNoYXBlczogRHJhd1NoYXBlW10pOiBib29sZWFuIHtcbiAgcmV0dXJuIHNoYXBlcy5zb21lKHMgPT4gaXNQaWVjZShzLm9yaWcpIHx8IGlzUGllY2Uocy5kZXN0KSk7XG59XG5cbmZ1bmN0aW9uIHNoYXBlQ2xhc3MoYnJ1c2g6IHN0cmluZywgY3VycmVudDogYm9vbGVhbiwgb3V0c2lkZTogYm9vbGVhbik6IHN0cmluZyB7XG4gIHJldHVybiBicnVzaCArIChjdXJyZW50ID8gJyBjdXJyZW50JyA6ICcnKSArIChvdXRzaWRlID8gJyBvdXRzaWRlJyA6ICcnKTtcbn1cblxuZnVuY3Rpb24gcmF0aW9BdmVyYWdlKHJhdGlvOiBzZy5OdW1iZXJQYWlyKTogbnVtYmVyIHtcbiAgcmV0dXJuIChyYXRpb1swXSArIHJhdGlvWzFdKSAvIDI7XG59XG5cbmZ1bmN0aW9uIGVsbGlwc2VXaWR0aChyYXRpbzogc2cuTnVtYmVyUGFpcik6IFtudW1iZXIsIG51bWJlcl0ge1xuICByZXR1cm4gWygzIC8gNjQpICogcmF0aW9BdmVyYWdlKHJhdGlvKSwgKDQgLyA2NCkgKiByYXRpb0F2ZXJhZ2UocmF0aW8pXTtcbn1cblxuZnVuY3Rpb24gbGluZVdpZHRoKGN1cnJlbnQ6IGJvb2xlYW4sIHJhdGlvOiBzZy5OdW1iZXJQYWlyKTogbnVtYmVyIHtcbiAgcmV0dXJuICgoY3VycmVudCA/IDguNSA6IDEwKSAvIDY0KSAqIHJhdGlvQXZlcmFnZShyYXRpbyk7XG59XG5cbmZ1bmN0aW9uIGFycm93TWFyZ2luKHNob3J0ZW46IGJvb2xlYW4sIHJhdGlvOiBzZy5OdW1iZXJQYWlyKTogbnVtYmVyIHtcbiAgcmV0dXJuICgoc2hvcnRlbiA/IDIwIDogMTApIC8gNjQpICogcmF0aW9BdmVyYWdlKHJhdGlvKTtcbn1cblxuZnVuY3Rpb24gcGllY2VPcktleVRvUG9zKGtwOiBzZy5LZXkgfCBzZy5QaWVjZSwgc3RhdGU6IFN0YXRlKTogc2cuUG9zIHwgdW5kZWZpbmVkIHtcbiAgaWYgKGlzUGllY2Uoa3ApKSB7XG4gICAgY29uc3QgcGllY2VCb3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzKCkuZ2V0KHBpZWNlTmFtZU9mKGtwKSksXG4gICAgICBib3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpLFxuICAgICAgb2Zmc2V0ID0gc2VudGVQb3Yoc3RhdGUub3JpZW50YXRpb24pID8gWzAuNSwgLTAuNV0gOiBbLTAuNSwgMC41XSxcbiAgICAgIHBvcyA9XG4gICAgICAgIHBpZWNlQm91bmRzICYmXG4gICAgICAgIGJvdW5kcyAmJlxuICAgICAgICBwb3NPZk91dHNpZGVFbChcbiAgICAgICAgICBwaWVjZUJvdW5kcy5sZWZ0ICsgcGllY2VCb3VuZHMud2lkdGggLyAyLFxuICAgICAgICAgIHBpZWNlQm91bmRzLnRvcCArIHBpZWNlQm91bmRzLmhlaWdodCAvIDIsXG4gICAgICAgICAgc2VudGVQb3Yoc3RhdGUub3JpZW50YXRpb24pLFxuICAgICAgICAgIHN0YXRlLmRpbWVuc2lvbnMsXG4gICAgICAgICAgYm91bmRzXG4gICAgICAgICk7XG4gICAgcmV0dXJuIChcbiAgICAgIHBvcyAmJlxuICAgICAgcG9zMnVzZXIoXG4gICAgICAgIFtwb3NbMF0gKyBvZmZzZXRbMF0sIHBvc1sxXSArIG9mZnNldFsxXV0sXG4gICAgICAgIHN0YXRlLm9yaWVudGF0aW9uLFxuICAgICAgICBzdGF0ZS5kaW1lbnNpb25zLFxuICAgICAgICBzdGF0ZS5zcXVhcmVSYXRpb1xuICAgICAgKVxuICAgICk7XG4gIH0gZWxzZSByZXR1cm4gcG9zMnVzZXIoa2V5MnBvcyhrcCksIHN0YXRlLm9yaWVudGF0aW9uLCBzdGF0ZS5kaW1lbnNpb25zLCBzdGF0ZS5zcXVhcmVSYXRpbyk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IHVuc2VsZWN0LCBjYW5jZWxNb3ZlT3JEcm9wIH0gZnJvbSAnLi9ib2FyZC5qcyc7XG5pbXBvcnQge1xuICBldmVudFBvc2l0aW9uLFxuICBpc1JpZ2h0QnV0dG9uLFxuICBwb3NPZk91dHNpZGVFbCxcbiAgc2FtZVBpZWNlLFxuICBnZXRIYW5kUGllY2VBdERvbVBvcyxcbiAgZ2V0S2V5QXREb21Qb3MsXG4gIHNlbnRlUG92LFxufSBmcm9tICcuL3V0aWwuanMnO1xuaW1wb3J0IHsgaXNQaWVjZSwgcG9zMnVzZXIsIHNhbWVQaWVjZU9yS2V5LCBzZXRBdHRyaWJ1dGVzIH0gZnJvbSAnLi9zaGFwZXMuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdTaGFwZSB7XG4gIG9yaWc6IHNnLktleSB8IHNnLlBpZWNlO1xuICBkZXN0OiBzZy5LZXkgfCBzZy5QaWVjZTtcbiAgcGllY2U/OiBEcmF3U2hhcGVQaWVjZTtcbiAgY3VzdG9tU3ZnPzogc3RyaW5nOyAvLyBzdmdcbiAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG4gIGJydXNoOiBzdHJpbmc7IC8vIGNzcyBjbGFzcyB0byBiZSBhcHBlbmRlZFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNxdWFyZUhpZ2hsaWdodCB7XG4gIGtleTogc2cuS2V5O1xuICBjbGFzc05hbWU6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEcmF3U2hhcGVQaWVjZSB7XG4gIHJvbGU6IHNnLlJvbGVTdHJpbmc7XG4gIGNvbG9yOiBzZy5Db2xvcjtcbiAgc2NhbGU/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd2FibGUge1xuICBlbmFibGVkOiBib29sZWFuOyAvLyBjYW4gZHJhd1xuICB2aXNpYmxlOiBib29sZWFuOyAvLyBjYW4gdmlld1xuICBmb3JjZWQ6IGJvb2xlYW47IC8vIGNhbiBvbmx5IGRyYXdcbiAgZXJhc2VPbkNsaWNrOiBib29sZWFuO1xuICBvbkNoYW5nZT86IChzaGFwZXM6IERyYXdTaGFwZVtdKSA9PiB2b2lkO1xuICBzaGFwZXM6IERyYXdTaGFwZVtdOyAvLyB1c2VyIHNoYXBlc1xuICBhdXRvU2hhcGVzOiBEcmF3U2hhcGVbXTsgLy8gY29tcHV0ZXIgc2hhcGVzXG4gIHNxdWFyZXM6IFNxdWFyZUhpZ2hsaWdodFtdO1xuICBjdXJyZW50PzogRHJhd0N1cnJlbnQ7XG4gIHByZXZTdmdIYXNoOiBzdHJpbmc7XG4gIHBpZWNlPzogc2cuUGllY2U7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd0N1cnJlbnQge1xuICBvcmlnOiBzZy5LZXkgfCBzZy5QaWVjZTtcbiAgZGVzdD86IHNnLktleSB8IHNnLlBpZWNlOyAvLyB1bmRlZmluZWQgaWYgb3V0c2lkZSBib2FyZC9oYW5kc1xuICBhcnJvdz86IFNWR0VsZW1lbnQ7XG4gIHBpZWNlPzogc2cuUGllY2U7XG4gIHBvczogc2cuTnVtYmVyUGFpcjtcbiAgYnJ1c2g6IHN0cmluZzsgLy8gYnJ1c2ggbmFtZSBmb3Igc2hhcGVcbn1cblxuY29uc3QgYnJ1c2hlcyA9IFsncHJpbWFyeScsICdhbHRlcm5hdGl2ZTAnLCAnYWx0ZXJuYXRpdmUxJywgJ2FsdGVybmF0aXZlMiddO1xuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnQoc3RhdGU6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIC8vIHN1cHBvcnQgb25lIGZpbmdlciB0b3VjaCBvbmx5XG4gIGlmIChlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDEpIHJldHVybjtcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gIGlmIChlLmN0cmxLZXkpIHVuc2VsZWN0KHN0YXRlKTtcbiAgZWxzZSBjYW5jZWxNb3ZlT3JEcm9wKHN0YXRlKTtcblxuICBjb25zdCBwb3MgPSBldmVudFBvc2l0aW9uKGUpLFxuICAgIGJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCksXG4gICAgb3JpZyA9XG4gICAgICBwb3MgJiYgYm91bmRzICYmIGdldEtleUF0RG9tUG9zKHBvcywgc2VudGVQb3Yoc3RhdGUub3JpZW50YXRpb24pLCBzdGF0ZS5kaW1lbnNpb25zLCBib3VuZHMpLFxuICAgIHBpZWNlID0gc3RhdGUuZHJhd2FibGUucGllY2U7XG4gIGlmICghb3JpZykgcmV0dXJuO1xuICBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50ID0ge1xuICAgIG9yaWcsXG4gICAgZGVzdDogdW5kZWZpbmVkLFxuICAgIHBvcyxcbiAgICBwaWVjZSxcbiAgICBicnVzaDogZXZlbnRCcnVzaChlLCBpc1JpZ2h0QnV0dG9uKGUpIHx8IHN0YXRlLmRyYXdhYmxlLmZvcmNlZCksXG4gIH07XG4gIHByb2Nlc3NEcmF3KHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0RnJvbUhhbmQoc3RhdGU6IFN0YXRlLCBwaWVjZTogc2cuUGllY2UsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgLy8gc3VwcG9ydCBvbmUgZmluZ2VyIHRvdWNoIG9ubHlcbiAgaWYgKGUudG91Y2hlcyAmJiBlLnRvdWNoZXMubGVuZ3RoID4gMSkgcmV0dXJuO1xuICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgaWYgKGUuY3RybEtleSkgdW5zZWxlY3Qoc3RhdGUpO1xuICBlbHNlIGNhbmNlbE1vdmVPckRyb3Aoc3RhdGUpO1xuXG4gIGNvbnN0IHBvcyA9IGV2ZW50UG9zaXRpb24oZSk7XG4gIGlmICghcG9zKSByZXR1cm47XG4gIHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQgPSB7XG4gICAgb3JpZzogcGllY2UsXG4gICAgZGVzdDogdW5kZWZpbmVkLFxuICAgIHBvcyxcbiAgICBicnVzaDogZXZlbnRCcnVzaChlLCBpc1JpZ2h0QnV0dG9uKGUpIHx8IHN0YXRlLmRyYXdhYmxlLmZvcmNlZCksXG4gIH07XG4gIHByb2Nlc3NEcmF3KHN0YXRlKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0RyYXcoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgY29uc3QgY3VyID0gc3RhdGUuZHJhd2FibGUuY3VycmVudCxcbiAgICAgIGJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gICAgaWYgKGN1ciAmJiBib3VuZHMpIHtcbiAgICAgIGNvbnN0IGRlc3QgPVxuICAgICAgICBnZXRLZXlBdERvbVBvcyhjdXIucG9zLCBzZW50ZVBvdihzdGF0ZS5vcmllbnRhdGlvbiksIHN0YXRlLmRpbWVuc2lvbnMsIGJvdW5kcykgfHxcbiAgICAgICAgZ2V0SGFuZFBpZWNlQXREb21Qb3MoY3VyLnBvcywgc3RhdGUuaGFuZHMucm9sZXMsIHN0YXRlLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMoKSk7XG4gICAgICBpZiAoY3VyLmRlc3QgIT09IGRlc3QgJiYgIShjdXIuZGVzdCAmJiBkZXN0ICYmIHNhbWVQaWVjZU9yS2V5KGRlc3QsIGN1ci5kZXN0KSkpIHtcbiAgICAgICAgY3VyLmRlc3QgPSBkZXN0O1xuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3Tm93KCk7XG4gICAgICB9XG4gICAgICBjb25zdCBvdXRQb3MgPSBwb3NPZk91dHNpZGVFbChcbiAgICAgICAgY3VyLnBvc1swXSxcbiAgICAgICAgY3VyLnBvc1sxXSxcbiAgICAgICAgc2VudGVQb3Yoc3RhdGUub3JpZW50YXRpb24pLFxuICAgICAgICBzdGF0ZS5kaW1lbnNpb25zLFxuICAgICAgICBib3VuZHNcbiAgICAgICk7XG4gICAgICBpZiAoIWN1ci5kZXN0ICYmIGN1ci5hcnJvdyAmJiBvdXRQb3MpIHtcbiAgICAgICAgY29uc3QgZGVzdCA9IHBvczJ1c2VyKG91dFBvcywgc3RhdGUub3JpZW50YXRpb24sIHN0YXRlLmRpbWVuc2lvbnMsIHN0YXRlLnNxdWFyZVJhdGlvKTtcblxuICAgICAgICBzZXRBdHRyaWJ1dGVzKGN1ci5hcnJvdywge1xuICAgICAgICAgIHgyOiBkZXN0WzBdIC0gc3RhdGUuc3F1YXJlUmF0aW9bMF0gLyAyLFxuICAgICAgICAgIHkyOiBkZXN0WzFdIC0gc3RhdGUuc3F1YXJlUmF0aW9bMV0gLyAyLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHByb2Nlc3NEcmF3KHN0YXRlKTtcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZShzdGF0ZTogU3RhdGUsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQpIHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQucG9zID0gZXZlbnRQb3NpdGlvbihlKSE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmQoc3RhdGU6IFN0YXRlLCBfOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQ7XG4gIGlmIChjdXIpIHtcbiAgICBhZGRTaGFwZShzdGF0ZS5kcmF3YWJsZSwgY3VyKTtcbiAgICBjYW5jZWwoc3RhdGUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWwoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5kcmF3YWJsZS5jdXJyZW50KSB7XG4gICAgc3RhdGUuZHJhd2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBjb25zdCBkcmF3YWJsZUxlbmd0aCA9IHN0YXRlLmRyYXdhYmxlLnNoYXBlcy5sZW5ndGg7XG4gIGlmIChkcmF3YWJsZUxlbmd0aCB8fCBzdGF0ZS5kcmF3YWJsZS5waWVjZSkge1xuICAgIHN0YXRlLmRyYXdhYmxlLnNoYXBlcyA9IFtdO1xuICAgIHN0YXRlLmRyYXdhYmxlLnBpZWNlID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICBpZiAoZHJhd2FibGVMZW5ndGgpIG9uQ2hhbmdlKHN0YXRlLmRyYXdhYmxlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0RHJhd1BpZWNlKHN0YXRlOiBTdGF0ZSwgcGllY2U6IHNnLlBpZWNlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5kcmF3YWJsZS5waWVjZSAmJiBzYW1lUGllY2Uoc3RhdGUuZHJhd2FibGUucGllY2UsIHBpZWNlKSlcbiAgICBzdGF0ZS5kcmF3YWJsZS5waWVjZSA9IHVuZGVmaW5lZDtcbiAgZWxzZSBzdGF0ZS5kcmF3YWJsZS5waWVjZSA9IHBpZWNlO1xuICBzdGF0ZS5kb20ucmVkcmF3KCk7XG59XG5cbmZ1bmN0aW9uIGV2ZW50QnJ1c2goZTogc2cuTW91Y2hFdmVudCwgYWxsb3dGaXJzdE1vZGlmaWVyOiBib29sZWFuKTogc3RyaW5nIHtcbiAgY29uc3QgbW9kQSA9IGFsbG93Rmlyc3RNb2RpZmllciAmJiAoZS5zaGlmdEtleSB8fCBlLmN0cmxLZXkpLFxuICAgIG1vZEIgPSBlLmFsdEtleSB8fCBlLm1ldGFLZXkgfHwgZS5nZXRNb2RpZmllclN0YXRlPy4oJ0FsdEdyYXBoJyk7XG4gIHJldHVybiBicnVzaGVzWyhtb2RBID8gMSA6IDApICsgKG1vZEIgPyAyIDogMCldO1xufVxuXG5mdW5jdGlvbiBhZGRTaGFwZShkcmF3YWJsZTogRHJhd2FibGUsIGN1cjogRHJhd0N1cnJlbnQpOiB2b2lkIHtcbiAgaWYgKCFjdXIuZGVzdCkgcmV0dXJuO1xuXG4gIGNvbnN0IHNpbWlsYXJTaGFwZSA9IChzOiBEcmF3U2hhcGUpID0+XG4gICAgY3VyLmRlc3QgJiYgc2FtZVBpZWNlT3JLZXkoY3VyLm9yaWcsIHMub3JpZykgJiYgc2FtZVBpZWNlT3JLZXkoY3VyLmRlc3QsIHMuZGVzdCk7XG5cbiAgLy8gc2VwYXJhdGUgc2hhcGUgZm9yIHBpZWNlc1xuICBjb25zdCBwaWVjZSA9IGN1ci5waWVjZTtcbiAgY3VyLnBpZWNlID0gdW5kZWZpbmVkO1xuXG4gIGNvbnN0IHNpbWlsYXIgPSBkcmF3YWJsZS5zaGFwZXMuZmluZChzaW1pbGFyU2hhcGUpLFxuICAgIHJlbW92ZVBpZWNlID0gZHJhd2FibGUuc2hhcGVzLmZpbmQoXG4gICAgICBzID0+IHNpbWlsYXJTaGFwZShzKSAmJiBwaWVjZSAmJiBzLnBpZWNlICYmIHNhbWVQaWVjZShwaWVjZSwgcy5waWVjZSlcbiAgICApLFxuICAgIGRpZmZQaWVjZSA9IGRyYXdhYmxlLnNoYXBlcy5maW5kKFxuICAgICAgcyA9PiBzaW1pbGFyU2hhcGUocykgJiYgcGllY2UgJiYgcy5waWVjZSAmJiAhc2FtZVBpZWNlKHBpZWNlLCBzLnBpZWNlKVxuICAgICk7XG5cbiAgLy8gcmVtb3ZlIGV2ZXJ5IHNpbWlsYXIgc2hhcGVcbiAgaWYgKHNpbWlsYXIpIGRyYXdhYmxlLnNoYXBlcyA9IGRyYXdhYmxlLnNoYXBlcy5maWx0ZXIocyA9PiAhc2ltaWxhclNoYXBlKHMpKTtcblxuICBpZiAoIWlzUGllY2UoY3VyLm9yaWcpICYmIHBpZWNlICYmICFyZW1vdmVQaWVjZSkge1xuICAgIGRyYXdhYmxlLnNoYXBlcy5wdXNoKHsgb3JpZzogY3VyLm9yaWcsIGRlc3Q6IGN1ci5vcmlnLCBwaWVjZTogcGllY2UsIGJydXNoOiBjdXIuYnJ1c2ggfSk7XG4gICAgLy8gZm9yY2UgY2lyY2xlIGFyb3VuZCBkcmF3biBwaWVjZXNcbiAgICBpZiAoIXNhbWVQaWVjZU9yS2V5KGN1ci5vcmlnLCBjdXIuZGVzdCkpXG4gICAgICBkcmF3YWJsZS5zaGFwZXMucHVzaCh7IG9yaWc6IGN1ci5vcmlnLCBkZXN0OiBjdXIub3JpZywgYnJ1c2g6IGN1ci5icnVzaCB9KTtcbiAgfVxuXG4gIGlmICghc2ltaWxhciB8fCBkaWZmUGllY2UgfHwgc2ltaWxhci5icnVzaCAhPT0gY3VyLmJydXNoKSBkcmF3YWJsZS5zaGFwZXMucHVzaChjdXIgYXMgRHJhd1NoYXBlKTtcbiAgb25DaGFuZ2UoZHJhd2FibGUpO1xufVxuXG5mdW5jdGlvbiBvbkNoYW5nZShkcmF3YWJsZTogRHJhd2FibGUpOiB2b2lkIHtcbiAgaWYgKGRyYXdhYmxlLm9uQ2hhbmdlKSBkcmF3YWJsZS5vbkNoYW5nZShkcmF3YWJsZS5zaGFwZXMpO1xufVxuIiwgImltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgKiBhcyBib2FyZCBmcm9tICcuL2JvYXJkLmpzJztcbmltcG9ydCB7IGFkZFRvSGFuZCwgcmVtb3ZlRnJvbUhhbmQgfSBmcm9tICcuL2hhbmRzLmpzJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsLmpzJztcbmltcG9ydCB7IGNsZWFyIGFzIGRyYXdDbGVhciB9IGZyb20gJy4vZHJhdy5qcyc7XG5pbXBvcnQgeyBhbmltIH0gZnJvbSAnLi9hbmltLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBEcmFnQ3VycmVudCB7XG4gIHBpZWNlOiBzZy5QaWVjZTsgLy8gcGllY2UgYmVpbmcgZHJhZ2dlZFxuICBwb3M6IHNnLk51bWJlclBhaXI7IC8vIGxhdGVzdCBldmVudCBwb3NpdGlvblxuICBvcmlnUG9zOiBzZy5OdW1iZXJQYWlyOyAvLyBmaXJzdCBldmVudCBwb3NpdGlvblxuICBzdGFydGVkOiBib29sZWFuOyAvLyB3aGV0aGVyIHRoZSBkcmFnIGhhcyBzdGFydGVkOyBhcyBwZXIgdGhlIGRpc3RhbmNlIHNldHRpbmdcbiAgdG91Y2g6IGJvb2xlYW47IC8vIHdhcyB0aGUgZHJhZ2dpbmcgaW5pdGlhdGVkIGZyb20gdG91Y2ggZXZlbnRcbiAgb3JpZ2luVGFyZ2V0OiBFdmVudFRhcmdldCB8IG51bGw7XG4gIGZyb21Cb2FyZD86IHtcbiAgICBvcmlnOiBzZy5LZXk7IC8vIG9yaWcga2V5IG9mIGRyYWdnaW5nIHBpZWNlXG4gICAgcHJldmlvdXNseVNlbGVjdGVkPzogc2cuS2V5OyAvLyBzZWxlY3RlZCBwaWVjZSBiZWZvcmUgZHJhZyBiZWdhblxuICAgIGtleUhhc0NoYW5nZWQ6IGJvb2xlYW47IC8vIHdoZXRoZXIgdGhlIGRyYWcgaGFzIGxlZnQgdGhlIG9yaWcga2V5IG9yIHBpZWNlXG4gIH07XG4gIGZyb21PdXRzaWRlPzoge1xuICAgIG9yaWdpbkJvdW5kczogRE9NUmVjdCB8IHVuZGVmaW5lZDsgLy8gYm91bmRzIG9mIHRoZSBwaWVjZSB0aGF0IGluaXRpYXRlZCB0aGUgZHJhZ1xuICAgIGxlZnRPcmlnaW46IGJvb2xlYW47IC8vIGhhdmUgd2UgZXZlciBsZWZ0IG9yaWdpbkJvdW5kc1xuICAgIHByZXZpb3VzbHlTZWxlY3RlZFBpZWNlPzogc2cuUGllY2U7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydChzOiBTdGF0ZSwgZTogc2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICBjb25zdCBib3VuZHMgPSBzLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCksXG4gICAgcG9zaXRpb24gPSB1dGlsLmV2ZW50UG9zaXRpb24oZSksXG4gICAgb3JpZyA9XG4gICAgICBib3VuZHMgJiZcbiAgICAgIHBvc2l0aW9uICYmXG4gICAgICB1dGlsLmdldEtleUF0RG9tUG9zKHBvc2l0aW9uLCB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pLCBzLmRpbWVuc2lvbnMsIGJvdW5kcyk7XG5cbiAgaWYgKCFvcmlnKSByZXR1cm47XG5cbiAgY29uc3QgcGllY2UgPSBzLnBpZWNlcy5nZXQob3JpZyksXG4gICAgcHJldmlvdXNseVNlbGVjdGVkID0gcy5zZWxlY3RlZDtcbiAgaWYgKFxuICAgICFwcmV2aW91c2x5U2VsZWN0ZWQgJiZcbiAgICBzLmRyYXdhYmxlLmVuYWJsZWQgJiZcbiAgICAocy5kcmF3YWJsZS5lcmFzZU9uQ2xpY2sgfHwgIXBpZWNlIHx8IHBpZWNlLmNvbG9yICE9PSBzLnR1cm5Db2xvcilcbiAgKVxuICAgIGRyYXdDbGVhcihzKTtcblxuICAvLyBQcmV2ZW50IHRvdWNoIHNjcm9sbCBhbmQgY3JlYXRlIG5vIGNvcnJlc3BvbmRpbmcgbW91c2UgZXZlbnQsIGlmIHRoZXJlXG4gIC8vIGlzIGFuIGludGVudCB0byBpbnRlcmFjdCB3aXRoIHRoZSBib2FyZC5cbiAgaWYgKFxuICAgIGUuY2FuY2VsYWJsZSAhPT0gZmFsc2UgJiZcbiAgICAoIWUudG91Y2hlcyB8fFxuICAgICAgcy5ibG9ja1RvdWNoU2Nyb2xsIHx8XG4gICAgICBzLnNlbGVjdGVkUGllY2UgfHxcbiAgICAgIHBpZWNlIHx8XG4gICAgICBwcmV2aW91c2x5U2VsZWN0ZWQgfHxcbiAgICAgIHBpZWNlQ2xvc2VUbyhzLCBwb3NpdGlvbiwgYm91bmRzKSlcbiAgKVxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgY29uc3QgaGFkUHJlbW92ZSA9ICEhcy5wcmVtb3ZhYmxlLmN1cnJlbnQ7XG4gIGNvbnN0IGhhZFByZWRyb3AgPSAhIXMucHJlZHJvcHBhYmxlLmN1cnJlbnQ7XG4gIGlmIChzLnNlbGVjdGFibGUuZGVsZXRlT25Ub3VjaCkgYm9hcmQuZGVsZXRlUGllY2Uocywgb3JpZyk7XG4gIGVsc2UgaWYgKHMuc2VsZWN0ZWQpIHtcbiAgICBpZiAoIWJvYXJkLnByb21vdGlvbkRpYWxvZ01vdmUocywgcy5zZWxlY3RlZCwgb3JpZykpIHtcbiAgICAgIGlmIChib2FyZC5jYW5Nb3ZlKHMsIHMuc2VsZWN0ZWQsIG9yaWcpKSBhbmltKHN0YXRlID0+IGJvYXJkLnNlbGVjdFNxdWFyZShzdGF0ZSwgb3JpZyksIHMpO1xuICAgICAgZWxzZSBib2FyZC5zZWxlY3RTcXVhcmUocywgb3JpZyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHMuc2VsZWN0ZWRQaWVjZSkge1xuICAgIGlmICghYm9hcmQucHJvbW90aW9uRGlhbG9nRHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIG9yaWcpKSB7XG4gICAgICBpZiAoYm9hcmQuY2FuRHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIG9yaWcpKVxuICAgICAgICBhbmltKHN0YXRlID0+IGJvYXJkLnNlbGVjdFNxdWFyZShzdGF0ZSwgb3JpZyksIHMpO1xuICAgICAgZWxzZSBib2FyZC5zZWxlY3RTcXVhcmUocywgb3JpZyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGJvYXJkLnNlbGVjdFNxdWFyZShzLCBvcmlnKTtcbiAgfVxuXG4gIGNvbnN0IHN0aWxsU2VsZWN0ZWQgPSBzLnNlbGVjdGVkID09PSBvcmlnLFxuICAgIGRyYWdnZWRFbCA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkPy5kcmFnZ2VkO1xuXG4gIGlmIChwaWVjZSAmJiBkcmFnZ2VkRWwgJiYgc3RpbGxTZWxlY3RlZCAmJiBib2FyZC5pc0RyYWdnYWJsZShzLCBwaWVjZSkpIHtcbiAgICBjb25zdCB0b3VjaCA9IGUudHlwZSA9PT0gJ3RvdWNoc3RhcnQnO1xuXG4gICAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHtcbiAgICAgIHBpZWNlLFxuICAgICAgcG9zOiBwb3NpdGlvbixcbiAgICAgIG9yaWdQb3M6IHBvc2l0aW9uLFxuICAgICAgc3RhcnRlZDogcy5kcmFnZ2FibGUuYXV0b0Rpc3RhbmNlICYmICF0b3VjaCxcbiAgICAgIHRvdWNoLFxuICAgICAgb3JpZ2luVGFyZ2V0OiBlLnRhcmdldCxcbiAgICAgIGZyb21Cb2FyZDoge1xuICAgICAgICBvcmlnLFxuICAgICAgICBwcmV2aW91c2x5U2VsZWN0ZWQsXG4gICAgICAgIGtleUhhc0NoYW5nZWQ6IGZhbHNlLFxuICAgICAgfSxcbiAgICB9O1xuXG4gICAgZHJhZ2dlZEVsLnNnQ29sb3IgPSBwaWVjZS5jb2xvcjtcbiAgICBkcmFnZ2VkRWwuc2dSb2xlID0gcGllY2Uucm9sZTtcbiAgICBkcmFnZ2VkRWwuY2xhc3NOYW1lID0gYGRyYWdnaW5nICR7dXRpbC5waWVjZU5hbWVPZihwaWVjZSl9YDtcbiAgICBkcmFnZ2VkRWwuY2xhc3NMaXN0LnRvZ2dsZSgndG91Y2gnLCB0b3VjaCk7XG5cbiAgICBwcm9jZXNzRHJhZyhzKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoaGFkUHJlbW92ZSkgYm9hcmQudW5zZXRQcmVtb3ZlKHMpO1xuICAgIGlmIChoYWRQcmVkcm9wKSBib2FyZC51bnNldFByZWRyb3Aocyk7XG4gIH1cbiAgcy5kb20ucmVkcmF3KCk7XG59XG5cbmZ1bmN0aW9uIHBpZWNlQ2xvc2VUbyhzOiBTdGF0ZSwgcG9zOiBzZy5OdW1iZXJQYWlyLCBib3VuZHM6IERPTVJlY3QpOiBib29sZWFuIHtcbiAgY29uc3QgYXNTZW50ZSA9IHV0aWwuc2VudGVQb3Yocy5vcmllbnRhdGlvbiksXG4gICAgcmFkaXVzU3EgPSBNYXRoLnBvdyhib3VuZHMud2lkdGggLyBzLmRpbWVuc2lvbnMuZmlsZXMsIDIpO1xuICBmb3IgKGNvbnN0IGtleSBvZiBzLnBpZWNlcy5rZXlzKCkpIHtcbiAgICBjb25zdCBjZW50ZXIgPSB1dGlsLmNvbXB1dGVTcXVhcmVDZW50ZXIoa2V5LCBhc1NlbnRlLCBzLmRpbWVuc2lvbnMsIGJvdW5kcyk7XG4gICAgaWYgKHV0aWwuZGlzdGFuY2VTcShjZW50ZXIsIHBvcykgPD0gcmFkaXVzU3EpIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRyYWdOZXdQaWVjZShzOiBTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBlOiBzZy5Nb3VjaEV2ZW50LCBzcGFyZT86IGJvb2xlYW4pOiB2b2lkIHtcbiAgY29uc3QgcHJldmlvdXNseVNlbGVjdGVkUGllY2UgPSBzLnNlbGVjdGVkUGllY2UsXG4gICAgZHJhZ2dlZEVsID0gcy5kb20uZWxlbWVudHMuYm9hcmQ/LmRyYWdnZWQsXG4gICAgcG9zaXRpb24gPSB1dGlsLmV2ZW50UG9zaXRpb24oZSksXG4gICAgdG91Y2ggPSBlLnR5cGUgPT09ICd0b3VjaHN0YXJ0JztcblxuICBpZiAoIXByZXZpb3VzbHlTZWxlY3RlZFBpZWNlICYmICFzcGFyZSAmJiBzLmRyYXdhYmxlLmVuYWJsZWQgJiYgcy5kcmF3YWJsZS5lcmFzZU9uQ2xpY2spXG4gICAgZHJhd0NsZWFyKHMpO1xuXG4gIGlmICghc3BhcmUgJiYgcy5zZWxlY3RhYmxlLmRlbGV0ZU9uVG91Y2gpIHJlbW92ZUZyb21IYW5kKHMsIHBpZWNlKTtcbiAgZWxzZSBib2FyZC5zZWxlY3RQaWVjZShzLCBwaWVjZSwgc3BhcmUpO1xuXG4gIGNvbnN0IGhhZFByZW1vdmUgPSAhIXMucHJlbW92YWJsZS5jdXJyZW50LFxuICAgIGhhZFByZWRyb3AgPSAhIXMucHJlZHJvcHBhYmxlLmN1cnJlbnQsXG4gICAgc3RpbGxTZWxlY3RlZCA9IHMuc2VsZWN0ZWRQaWVjZSAmJiB1dGlsLnNhbWVQaWVjZShzLnNlbGVjdGVkUGllY2UsIHBpZWNlKTtcblxuICBpZiAoZHJhZ2dlZEVsICYmIHBvc2l0aW9uICYmIHMuc2VsZWN0ZWRQaWVjZSAmJiBzdGlsbFNlbGVjdGVkICYmIGJvYXJkLmlzRHJhZ2dhYmxlKHMsIHBpZWNlKSkge1xuICAgIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB7XG4gICAgICBwaWVjZTogcy5zZWxlY3RlZFBpZWNlLFxuICAgICAgcG9zOiBwb3NpdGlvbixcbiAgICAgIG9yaWdQb3M6IHBvc2l0aW9uLFxuICAgICAgdG91Y2gsXG4gICAgICBzdGFydGVkOiBzLmRyYWdnYWJsZS5hdXRvRGlzdGFuY2UgJiYgIXRvdWNoLFxuICAgICAgb3JpZ2luVGFyZ2V0OiBlLnRhcmdldCxcbiAgICAgIGZyb21PdXRzaWRlOiB7XG4gICAgICAgIG9yaWdpbkJvdW5kczogIXNwYXJlXG4gICAgICAgICAgPyBzLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMoKS5nZXQodXRpbC5waWVjZU5hbWVPZihwaWVjZSkpXG4gICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgIGxlZnRPcmlnaW46IGZhbHNlLFxuICAgICAgICBwcmV2aW91c2x5U2VsZWN0ZWRQaWVjZTogIXNwYXJlID8gcHJldmlvdXNseVNlbGVjdGVkUGllY2UgOiB1bmRlZmluZWQsXG4gICAgICB9LFxuICAgIH07XG5cbiAgICBkcmFnZ2VkRWwuc2dDb2xvciA9IHBpZWNlLmNvbG9yO1xuICAgIGRyYWdnZWRFbC5zZ1JvbGUgPSBwaWVjZS5yb2xlO1xuICAgIGRyYWdnZWRFbC5jbGFzc05hbWUgPSBgZHJhZ2dpbmcgJHt1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKX1gO1xuICAgIGRyYWdnZWRFbC5jbGFzc0xpc3QudG9nZ2xlKCd0b3VjaCcsIHRvdWNoKTtcblxuICAgIHByb2Nlc3NEcmFnKHMpO1xuICB9IGVsc2Uge1xuICAgIGlmIChoYWRQcmVtb3ZlKSBib2FyZC51bnNldFByZW1vdmUocyk7XG4gICAgaWYgKGhhZFByZWRyb3ApIGJvYXJkLnVuc2V0UHJlZHJvcChzKTtcbiAgfVxuICBzLmRvbS5yZWRyYXcoKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0RyYWcoczogU3RhdGUpOiB2b2lkIHtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBjb25zdCBjdXIgPSBzLmRyYWdnYWJsZS5jdXJyZW50LFxuICAgICAgZHJhZ2dlZEVsID0gcy5kb20uZWxlbWVudHMuYm9hcmQ/LmRyYWdnZWQsXG4gICAgICBib3VuZHMgPSBzLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCk7XG4gICAgaWYgKCFjdXIgfHwgIWRyYWdnZWRFbCB8fCAhYm91bmRzKSByZXR1cm47XG4gICAgLy8gY2FuY2VsIGFuaW1hdGlvbnMgd2hpbGUgZHJhZ2dpbmdcbiAgICBpZiAoY3VyLmZyb21Cb2FyZD8ub3JpZyAmJiBzLmFuaW1hdGlvbi5jdXJyZW50Py5wbGFuLmFuaW1zLmhhcyhjdXIuZnJvbUJvYXJkLm9yaWcpKVxuICAgICAgcy5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICAvLyBpZiBtb3ZpbmcgcGllY2UgaXMgZ29uZSwgY2FuY2VsXG4gICAgY29uc3Qgb3JpZ1BpZWNlID0gY3VyLmZyb21Cb2FyZCA/IHMucGllY2VzLmdldChjdXIuZnJvbUJvYXJkLm9yaWcpIDogY3VyLnBpZWNlO1xuICAgIGlmICghb3JpZ1BpZWNlIHx8ICF1dGlsLnNhbWVQaWVjZShvcmlnUGllY2UsIGN1ci5waWVjZSkpIGNhbmNlbChzKTtcbiAgICBlbHNlIHtcbiAgICAgIGlmIChcbiAgICAgICAgIWN1ci5zdGFydGVkICYmXG4gICAgICAgIHV0aWwuZGlzdGFuY2VTcShjdXIucG9zLCBjdXIub3JpZ1BvcykgPj0gTWF0aC5wb3cocy5kcmFnZ2FibGUuZGlzdGFuY2UsIDIpXG4gICAgICApIHtcbiAgICAgICAgY3VyLnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICBzLmRvbS5yZWRyYXcoKTtcbiAgICAgIH1cbiAgICAgIGlmIChjdXIuc3RhcnRlZCkge1xuICAgICAgICB1dGlsLnRyYW5zbGF0ZUFicyhcbiAgICAgICAgICBkcmFnZ2VkRWwsXG4gICAgICAgICAgW1xuICAgICAgICAgICAgY3VyLnBvc1swXSAtIGJvdW5kcy5sZWZ0IC0gYm91bmRzLndpZHRoIC8gKHMuZGltZW5zaW9ucy5maWxlcyAqIDIpLFxuICAgICAgICAgICAgY3VyLnBvc1sxXSAtIGJvdW5kcy50b3AgLSBib3VuZHMuaGVpZ2h0IC8gKHMuZGltZW5zaW9ucy5yYW5rcyAqIDIpLFxuICAgICAgICAgIF0sXG4gICAgICAgICAgcy5zY2FsZURvd25QaWVjZXMgPyAwLjUgOiAxXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKCFkcmFnZ2VkRWwuc2dEcmFnZ2luZykge1xuICAgICAgICAgIGRyYWdnZWRFbC5zZ0RyYWdnaW5nID0gdHJ1ZTtcbiAgICAgICAgICB1dGlsLnNldERpc3BsYXkoZHJhZ2dlZEVsLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBob3ZlciA9IHV0aWwuZ2V0S2V5QXREb21Qb3MoXG4gICAgICAgICAgY3VyLnBvcyxcbiAgICAgICAgICB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pLFxuICAgICAgICAgIHMuZGltZW5zaW9ucyxcbiAgICAgICAgICBib3VuZHNcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoY3VyLmZyb21Cb2FyZClcbiAgICAgICAgICBjdXIuZnJvbUJvYXJkLmtleUhhc0NoYW5nZWQgPSBjdXIuZnJvbUJvYXJkLmtleUhhc0NoYW5nZWQgfHwgY3VyLmZyb21Cb2FyZC5vcmlnICE9PSBob3ZlcjtcbiAgICAgICAgZWxzZSBpZiAoY3VyLmZyb21PdXRzaWRlKVxuICAgICAgICAgIGN1ci5mcm9tT3V0c2lkZS5sZWZ0T3JpZ2luID1cbiAgICAgICAgICAgIGN1ci5mcm9tT3V0c2lkZS5sZWZ0T3JpZ2luIHx8XG4gICAgICAgICAgICAoISFjdXIuZnJvbU91dHNpZGUub3JpZ2luQm91bmRzICYmXG4gICAgICAgICAgICAgICF1dGlsLmlzSW5zaWRlUmVjdChjdXIuZnJvbU91dHNpZGUub3JpZ2luQm91bmRzLCBjdXIucG9zKSk7XG5cbiAgICAgICAgLy8gaWYgdGhlIGhvdmVyZWQgc3F1YXJlIGNoYW5nZWRcbiAgICAgICAgaWYgKGhvdmVyICE9PSBzLmhvdmVyZWQpIHtcbiAgICAgICAgICB1cGRhdGVIb3ZlcmVkU3F1YXJlcyhzLCBob3Zlcik7XG4gICAgICAgICAgaWYgKGN1ci50b3VjaCAmJiBzLmRvbS5lbGVtZW50cy5ib2FyZD8uc3F1YXJlT3Zlcikge1xuICAgICAgICAgICAgaWYgKGhvdmVyICYmIHMuZHJhZ2dhYmxlLnNob3dUb3VjaFNxdWFyZU92ZXJsYXkpIHtcbiAgICAgICAgICAgICAgdXRpbC50cmFuc2xhdGVBYnMoXG4gICAgICAgICAgICAgICAgcy5kb20uZWxlbWVudHMuYm9hcmQuc3F1YXJlT3ZlcixcbiAgICAgICAgICAgICAgICB1dGlsLnBvc1RvVHJhbnNsYXRlQWJzKHMuZGltZW5zaW9ucywgYm91bmRzKShcbiAgICAgICAgICAgICAgICAgIHV0aWwua2V5MnBvcyhob3ZlciksXG4gICAgICAgICAgICAgICAgICB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIHV0aWwuc2V0RGlzcGxheShzLmRvbS5lbGVtZW50cy5ib2FyZC5zcXVhcmVPdmVyLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHV0aWwuc2V0RGlzcGxheShzLmRvbS5lbGVtZW50cy5ib2FyZC5zcXVhcmVPdmVyLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHByb2Nlc3NEcmFnKHMpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmUoczogU3RhdGUsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgLy8gc3VwcG9ydCBvbmUgZmluZ2VyIHRvdWNoIG9ubHlcbiAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQgJiYgKCFlLnRvdWNoZXMgfHwgZS50b3VjaGVzLmxlbmd0aCA8IDIpKSB7XG4gICAgcy5kcmFnZ2FibGUuY3VycmVudC5wb3MgPSB1dGlsLmV2ZW50UG9zaXRpb24oZSkhO1xuICB9IGVsc2UgaWYgKFxuICAgIChzLnNlbGVjdGVkIHx8IHMuc2VsZWN0ZWRQaWVjZSB8fCBzLmhpZ2hsaWdodC5ob3ZlcmVkKSAmJlxuICAgICFzLmRyYWdnYWJsZS5jdXJyZW50ICYmXG4gICAgKCFlLnRvdWNoZXMgfHwgZS50b3VjaGVzLmxlbmd0aCA8IDIpXG4gICkge1xuICAgIGNvbnN0IGJvdW5kcyA9IHMuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKSxcbiAgICAgIGhvdmVyID1cbiAgICAgICAgYm91bmRzICYmXG4gICAgICAgIHV0aWwuZ2V0S2V5QXREb21Qb3MoXG4gICAgICAgICAgdXRpbC5ldmVudFBvc2l0aW9uKGUpISxcbiAgICAgICAgICB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pLFxuICAgICAgICAgIHMuZGltZW5zaW9ucyxcbiAgICAgICAgICBib3VuZHNcbiAgICAgICAgKTtcbiAgICBpZiAoaG92ZXIgIT09IHMuaG92ZXJlZCkgdXBkYXRlSG92ZXJlZFNxdWFyZXMocywgaG92ZXIpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmQoczogU3RhdGUsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgY29uc3QgY3VyID0gcy5kcmFnZ2FibGUuY3VycmVudDtcbiAgaWYgKCFjdXIpIHJldHVybjtcbiAgLy8gY3JlYXRlIG5vIGNvcnJlc3BvbmRpbmcgbW91c2UgZXZlbnRcbiAgaWYgKGUudHlwZSA9PT0gJ3RvdWNoZW5kJyAmJiBlLmNhbmNlbGFibGUgIT09IGZhbHNlKSBlLnByZXZlbnREZWZhdWx0KCk7XG4gIC8vIGNvbXBhcmluZyB3aXRoIHRoZSBvcmlnaW4gdGFyZ2V0IGlzIGFuIGVhc3kgd2F5IHRvIHRlc3QgdGhhdCB0aGUgZW5kIGV2ZW50XG4gIC8vIGhhcyB0aGUgc2FtZSB0b3VjaCBvcmlnaW5cbiAgaWYgKGUudHlwZSA9PT0gJ3RvdWNoZW5kJyAmJiBjdXIub3JpZ2luVGFyZ2V0ICE9PSBlLnRhcmdldCAmJiAhY3VyLmZyb21PdXRzaWRlKSB7XG4gICAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBpZiAocy5ob3ZlcmVkICYmICFzLmhpZ2hsaWdodC5ob3ZlcmVkKSB1cGRhdGVIb3ZlcmVkU3F1YXJlcyhzLCB1bmRlZmluZWQpO1xuICAgIHJldHVybjtcbiAgfVxuICBib2FyZC51bnNldFByZW1vdmUocyk7XG4gIGJvYXJkLnVuc2V0UHJlZHJvcChzKTtcbiAgLy8gdG91Y2hlbmQgaGFzIG5vIHBvc2l0aW9uOyBzbyB1c2UgdGhlIGxhc3QgdG91Y2htb3ZlIHBvc2l0aW9uIGluc3RlYWRcbiAgY29uc3QgZXZlbnRQb3MgPSB1dGlsLmV2ZW50UG9zaXRpb24oZSkgfHwgY3VyLnBvcyxcbiAgICBib3VuZHMgPSBzLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCksXG4gICAgZGVzdCA9XG4gICAgICBib3VuZHMgJiYgdXRpbC5nZXRLZXlBdERvbVBvcyhldmVudFBvcywgdXRpbC5zZW50ZVBvdihzLm9yaWVudGF0aW9uKSwgcy5kaW1lbnNpb25zLCBib3VuZHMpO1xuXG4gIGlmIChkZXN0ICYmIGN1ci5zdGFydGVkICYmIGN1ci5mcm9tQm9hcmQ/Lm9yaWcgIT09IGRlc3QpIHtcbiAgICBpZiAoY3VyLmZyb21PdXRzaWRlICYmICFib2FyZC5wcm9tb3Rpb25EaWFsb2dEcm9wKHMsIGN1ci5waWVjZSwgZGVzdCkpXG4gICAgICBib2FyZC51c2VyRHJvcChzLCBjdXIucGllY2UsIGRlc3QpO1xuICAgIGVsc2UgaWYgKGN1ci5mcm9tQm9hcmQgJiYgIWJvYXJkLnByb21vdGlvbkRpYWxvZ01vdmUocywgY3VyLmZyb21Cb2FyZC5vcmlnLCBkZXN0KSlcbiAgICAgIGJvYXJkLnVzZXJNb3ZlKHMsIGN1ci5mcm9tQm9hcmQub3JpZywgZGVzdCk7XG4gIH0gZWxzZSBpZiAocy5kcmFnZ2FibGUuZGVsZXRlT25Ecm9wT2ZmICYmICFkZXN0KSB7XG4gICAgaWYgKGN1ci5mcm9tQm9hcmQpIHMucGllY2VzLmRlbGV0ZShjdXIuZnJvbUJvYXJkLm9yaWcpO1xuICAgIGVsc2UgaWYgKGN1ci5mcm9tT3V0c2lkZSAmJiAhcy5kcm9wcGFibGUuc3BhcmUpIHJlbW92ZUZyb21IYW5kKHMsIGN1ci5waWVjZSk7XG5cbiAgICBpZiAocy5kcmFnZ2FibGUuYWRkVG9IYW5kT25Ecm9wT2ZmKSB7XG4gICAgICBjb25zdCBoYW5kQm91bmRzID0gcy5kb20uYm91bmRzLmhhbmRzLmJvdW5kcygpLFxuICAgICAgICBoYW5kQm91bmRzVG9wID0gaGFuZEJvdW5kcy5nZXQoJ3RvcCcpLFxuICAgICAgICBoYW5kQm91bmRzQm90dG9tID0gaGFuZEJvdW5kcy5nZXQoJ2JvdHRvbScpO1xuICAgICAgaWYgKGhhbmRCb3VuZHNUb3AgJiYgdXRpbC5pc0luc2lkZVJlY3QoaGFuZEJvdW5kc1RvcCwgY3VyLnBvcykpXG4gICAgICAgIGFkZFRvSGFuZChzLCB7IGNvbG9yOiB1dGlsLm9wcG9zaXRlKHMub3JpZW50YXRpb24pLCByb2xlOiBjdXIucGllY2Uucm9sZSB9KTtcbiAgICAgIGVsc2UgaWYgKGhhbmRCb3VuZHNCb3R0b20gJiYgdXRpbC5pc0luc2lkZVJlY3QoaGFuZEJvdW5kc0JvdHRvbSwgY3VyLnBvcykpXG4gICAgICAgIGFkZFRvSGFuZChzLCB7IGNvbG9yOiBzLm9yaWVudGF0aW9uLCByb2xlOiBjdXIucGllY2Uucm9sZSB9KTtcbiAgICB9XG4gICAgdXRpbC5jYWxsVXNlckZ1bmN0aW9uKHMuZXZlbnRzLmNoYW5nZSk7XG4gIH1cblxuICBpZiAoXG4gICAgY3VyLmZyb21Cb2FyZCAmJlxuICAgIChjdXIuZnJvbUJvYXJkLm9yaWcgPT09IGN1ci5mcm9tQm9hcmQucHJldmlvdXNseVNlbGVjdGVkIHx8IGN1ci5mcm9tQm9hcmQua2V5SGFzQ2hhbmdlZCkgJiZcbiAgICAoY3VyLmZyb21Cb2FyZC5vcmlnID09PSBkZXN0IHx8ICFkZXN0KVxuICApIHtcbiAgICB1bnNlbGVjdChzLCBjdXIsIGRlc3QpO1xuICB9IGVsc2UgaWYgKFxuICAgICghZGVzdCAmJiBjdXIuZnJvbU91dHNpZGU/LmxlZnRPcmlnaW4pIHx8XG4gICAgKGN1ci5mcm9tT3V0c2lkZT8ub3JpZ2luQm91bmRzICYmXG4gICAgICB1dGlsLmlzSW5zaWRlUmVjdChjdXIuZnJvbU91dHNpZGUub3JpZ2luQm91bmRzLCBjdXIucG9zKSAmJlxuICAgICAgY3VyLmZyb21PdXRzaWRlLnByZXZpb3VzbHlTZWxlY3RlZFBpZWNlICYmXG4gICAgICB1dGlsLnNhbWVQaWVjZShjdXIuZnJvbU91dHNpZGUucHJldmlvdXNseVNlbGVjdGVkUGllY2UsIGN1ci5waWVjZSkpXG4gICkge1xuICAgIHVuc2VsZWN0KHMsIGN1ciwgZGVzdCk7XG4gIH0gZWxzZSBpZiAoIXMuc2VsZWN0YWJsZS5lbmFibGVkICYmICFzLnByb21vdGlvbi5jdXJyZW50KSB7XG4gICAgdW5zZWxlY3QocywgY3VyLCBkZXN0KTtcbiAgfVxuXG4gIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIGlmICghcy5oaWdobGlnaHQuaG92ZXJlZCAmJiAhcy5wcm9tb3Rpb24uY3VycmVudCkgcy5ob3ZlcmVkID0gdW5kZWZpbmVkO1xuICBzLmRvbS5yZWRyYXcoKTtcbn1cblxuZnVuY3Rpb24gdW5zZWxlY3QoczogU3RhdGUsIGN1cjogRHJhZ0N1cnJlbnQsIGRlc3Q/OiBzZy5LZXkpOiB2b2lkIHtcbiAgaWYgKGN1ci5mcm9tQm9hcmQgJiYgY3VyLmZyb21Cb2FyZC5vcmlnID09PSBkZXN0KVxuICAgIHV0aWwuY2FsbFVzZXJGdW5jdGlvbihzLmV2ZW50cy51bnNlbGVjdCwgY3VyLmZyb21Cb2FyZC5vcmlnKTtcbiAgZWxzZSBpZiAoXG4gICAgY3VyLmZyb21PdXRzaWRlPy5vcmlnaW5Cb3VuZHMgJiZcbiAgICB1dGlsLmlzSW5zaWRlUmVjdChjdXIuZnJvbU91dHNpZGUub3JpZ2luQm91bmRzLCBjdXIucG9zKVxuICApXG4gICAgdXRpbC5jYWxsVXNlckZ1bmN0aW9uKHMuZXZlbnRzLnBpZWNlVW5zZWxlY3QsIGN1ci5waWVjZSk7XG4gIGJvYXJkLnVuc2VsZWN0KHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsKHM6IFN0YXRlKTogdm9pZCB7XG4gIGlmIChzLmRyYWdnYWJsZS5jdXJyZW50KSB7XG4gICAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBpZiAoIXMuaGlnaGxpZ2h0LmhvdmVyZWQpIHMuaG92ZXJlZCA9IHVuZGVmaW5lZDtcbiAgICBib2FyZC51bnNlbGVjdChzKTtcbiAgICBzLmRvbS5yZWRyYXcoKTtcbiAgfVxufVxuXG4vLyBzdXBwb3J0IG9uZSBmaW5nZXIgdG91Y2ggb25seSBvciBsZWZ0IGNsaWNrXG5leHBvcnQgZnVuY3Rpb24gdW53YW50ZWRFdmVudChlOiBzZy5Nb3VjaEV2ZW50KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgIWUuaXNUcnVzdGVkIHx8XG4gICAgKGUuYnV0dG9uICE9PSB1bmRlZmluZWQgJiYgZS5idXR0b24gIT09IDApIHx8XG4gICAgKCEhZS50b3VjaGVzICYmIGUudG91Y2hlcy5sZW5ndGggPiAxKVxuICApO1xufVxuXG5mdW5jdGlvbiB2YWxpZERlc3RUb0hvdmVyKHM6IFN0YXRlLCBrZXk6IHNnLktleSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgICghIXMuc2VsZWN0ZWQgJiYgKGJvYXJkLmNhbk1vdmUocywgcy5zZWxlY3RlZCwga2V5KSB8fCBib2FyZC5jYW5QcmVtb3ZlKHMsIHMuc2VsZWN0ZWQsIGtleSkpKSB8fFxuICAgICghIXMuc2VsZWN0ZWRQaWVjZSAmJlxuICAgICAgKGJvYXJkLmNhbkRyb3Aocywgcy5zZWxlY3RlZFBpZWNlLCBrZXkpIHx8IGJvYXJkLmNhblByZWRyb3Aocywgcy5zZWxlY3RlZFBpZWNlLCBrZXkpKSlcbiAgKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlSG92ZXJlZFNxdWFyZXMoczogU3RhdGUsIGtleTogc2cuS2V5IHwgdW5kZWZpbmVkKTogdm9pZCB7XG4gIGNvbnN0IHNxYXVyZUVscyA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkPy5zcXVhcmVzLmNoaWxkcmVuO1xuICBpZiAoIXNxYXVyZUVscyB8fCBzLnByb21vdGlvbi5jdXJyZW50KSByZXR1cm47XG5cbiAgY29uc3QgcHJldkhvdmVyID0gcy5ob3ZlcmVkO1xuICBpZiAocy5oaWdobGlnaHQuaG92ZXJlZCB8fCAoa2V5ICYmIHZhbGlkRGVzdFRvSG92ZXIocywga2V5KSkpIHMuaG92ZXJlZCA9IGtleTtcbiAgZWxzZSBzLmhvdmVyZWQgPSB1bmRlZmluZWQ7XG5cbiAgY29uc3QgYXNTZW50ZSA9IHV0aWwuc2VudGVQb3Yocy5vcmllbnRhdGlvbiksXG4gICAgY3VySW5kZXggPSBzLmhvdmVyZWQgJiYgdXRpbC5kb21TcXVhcmVJbmRleE9mS2V5KHMuaG92ZXJlZCwgYXNTZW50ZSwgcy5kaW1lbnNpb25zKSxcbiAgICBjdXJIb3ZlckVsID0gY3VySW5kZXggIT09IHVuZGVmaW5lZCAmJiBzcWF1cmVFbHNbY3VySW5kZXhdO1xuICBpZiAoY3VySG92ZXJFbCkgY3VySG92ZXJFbC5jbGFzc0xpc3QuYWRkKCdob3ZlcicpO1xuXG4gIGNvbnN0IHByZXZJbmRleCA9IHByZXZIb3ZlciAmJiB1dGlsLmRvbVNxdWFyZUluZGV4T2ZLZXkocHJldkhvdmVyLCBhc1NlbnRlLCBzLmRpbWVuc2lvbnMpLFxuICAgIHByZXZIb3ZlckVsID0gcHJldkluZGV4ICE9PSB1bmRlZmluZWQgJiYgc3FhdXJlRWxzW3ByZXZJbmRleF07XG4gIGlmIChwcmV2SG92ZXJFbCkgcHJldkhvdmVyRWwuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXInKTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IE5vdGF0aW9uIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjb29yZHMobm90YXRpb246IE5vdGF0aW9uKTogc3RyaW5nW10ge1xuICBzd2l0Y2ggKG5vdGF0aW9uKSB7XG4gICAgY2FzZSAnZGl6aGknOlxuICAgICAgcmV0dXJuIFtcbiAgICAgICAgJycsXG4gICAgICAgICcnLFxuICAgICAgICAnJyxcbiAgICAgICAgJycsXG4gICAgICAgICfkuqUnLFxuICAgICAgICAn5oiMJyxcbiAgICAgICAgJ+mFiScsXG4gICAgICAgICfnlLMnLFxuICAgICAgICAn5pyqJyxcbiAgICAgICAgJ+WNiCcsXG4gICAgICAgICflt7MnLFxuICAgICAgICAn6L6wJyxcbiAgICAgICAgJ+WNrycsXG4gICAgICAgICflr4UnLFxuICAgICAgICAn5LiRJyxcbiAgICAgICAgJ+WtkCcsXG4gICAgICBdO1xuICAgIGNhc2UgJ2phcGFuZXNlJzpcbiAgICAgIHJldHVybiBbXG4gICAgICAgICfljYHlha0nLFxuICAgICAgICAn5Y2B5LqUJyxcbiAgICAgICAgJ+WNgeWbmycsXG4gICAgICAgICfljYHkuIknLFxuICAgICAgICAn5Y2B5LqMJyxcbiAgICAgICAgJ+WNgeS4gCcsXG4gICAgICAgICfljYEnLFxuICAgICAgICAn5LmdJyxcbiAgICAgICAgJ+WFqycsXG4gICAgICAgICfkuIMnLFxuICAgICAgICAn5YWtJyxcbiAgICAgICAgJ+S6lCcsXG4gICAgICAgICflm5snLFxuICAgICAgICAn5LiJJyxcbiAgICAgICAgJ+S6jCcsXG4gICAgICAgICfkuIAnLFxuICAgICAgXTtcbiAgICBjYXNlICdlbmdpbmUnOlxuICAgICAgcmV0dXJuIFsncCcsICdvJywgJ24nLCAnbScsICdsJywgJ2snLCAnaicsICdpJywgJ2gnLCAnZycsICdmJywgJ2UnLCAnZCcsICdjJywgJ2InLCAnYSddO1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXR1cm4gWycxMCcsICdmJywgJ2UnLCAnZCcsICdjJywgJ2InLCAnYScsICc5JywgJzgnLCAnNycsICc2JywgJzUnLCAnNCcsICczJywgJzInLCAnMSddO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gW1xuICAgICAgICAnMTYnLFxuICAgICAgICAnMTUnLFxuICAgICAgICAnMTQnLFxuICAgICAgICAnMTMnLFxuICAgICAgICAnMTInLFxuICAgICAgICAnMTEnLFxuICAgICAgICAnMTAnLFxuICAgICAgICAnOScsXG4gICAgICAgICc4JyxcbiAgICAgICAgJzcnLFxuICAgICAgICAnNicsXG4gICAgICAgICc1JyxcbiAgICAgICAgJzQnLFxuICAgICAgICAnMycsXG4gICAgICAgICcyJyxcbiAgICAgICAgJzEnLFxuICAgICAgXTtcbiAgfVxufVxuIiwgImltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlIHtcbiAgRGltZW5zaW9ucyxcbiAgU3F1YXJlTm9kZSxcbiAgQ29sb3IsXG4gIFBpZWNlTm9kZSxcbiAgUm9sZVN0cmluZyxcbiAgSGFuZEVsZW1lbnRzLFxuICBCb2FyZEVsZW1lbnRzLFxufSBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IGNvbG9ycyB9IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IGNyZWF0ZUVsLCBvcHBvc2l0ZSwgcGllY2VOYW1lT2YsIHBvczJrZXksIHNldERpc3BsYXkgfSBmcm9tICcuL3V0aWwuanMnO1xuaW1wb3J0IHsgY3JlYXRlU1ZHRWxlbWVudCwgc2V0QXR0cmlidXRlcyB9IGZyb20gJy4vc2hhcGVzLmpzJztcbmltcG9ydCB7IGNvb3JkcyB9IGZyb20gJy4vY29vcmRzLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIHdyYXBCb2FyZChib2FyZFdyYXA6IEhUTUxFbGVtZW50LCBzOiBTdGF0ZSk6IEJvYXJkRWxlbWVudHMge1xuICAvLyAuc2ctd3JhcCAoZWxlbWVudCBwYXNzZWQgdG8gU2hvZ2lncm91bmQpXG4gIC8vICAgICBzZy1oYW5kLXdyYXBcbiAgLy8gICAgIHNnLWJvYXJkXG4gIC8vICAgICAgIHNnLXNxdWFyZXNcbiAgLy8gICAgICAgc2ctcGllY2VzXG4gIC8vICAgICAgIHBpZWNlIGRyYWdnaW5nXG4gIC8vICAgICAgIHNnLXByb21vdGlvblxuICAvLyAgICAgICBzZy1zcXVhcmUtb3ZlclxuICAvLyAgICAgICBzdmcuc2ctc2hhcGVzXG4gIC8vICAgICAgICAgZGVmc1xuICAvLyAgICAgICAgIGdcbiAgLy8gICAgICAgc3ZnLnNnLWN1c3RvbS1zdmdzXG4gIC8vICAgICAgICAgZ1xuICAvLyAgICAgc2ctaGFuZC13cmFwXG4gIC8vICAgICBzZy1mcmVlLXBpZWNlc1xuICAvLyAgICAgICBjb29yZHMucmFua3NcbiAgLy8gICAgICAgY29vcmRzLmZpbGVzXG5cbiAgY29uc3QgYm9hcmQgPSBjcmVhdGVFbCgnc2ctYm9hcmQnKTtcblxuICBjb25zdCBzcXVhcmVzID0gcmVuZGVyU3F1YXJlcyhzLmRpbWVuc2lvbnMsIHMub3JpZW50YXRpb24pO1xuICBib2FyZC5hcHBlbmRDaGlsZChzcXVhcmVzKTtcblxuICBjb25zdCBwaWVjZXMgPSBjcmVhdGVFbCgnc2ctcGllY2VzJyk7XG4gIGJvYXJkLmFwcGVuZENoaWxkKHBpZWNlcyk7XG5cbiAgbGV0IGRyYWdnZWQsIHByb21vdGlvbiwgc3F1YXJlT3ZlcjtcbiAgaWYgKCFzLnZpZXdPbmx5KSB7XG4gICAgZHJhZ2dlZCA9IGNyZWF0ZUVsKCdwaWVjZScpIGFzIFBpZWNlTm9kZTtcbiAgICBzZXREaXNwbGF5KGRyYWdnZWQsIGZhbHNlKTtcbiAgICBib2FyZC5hcHBlbmRDaGlsZChkcmFnZ2VkKTtcblxuICAgIHByb21vdGlvbiA9IGNyZWF0ZUVsKCdzZy1wcm9tb3Rpb24nKTtcbiAgICBzZXREaXNwbGF5KHByb21vdGlvbiwgZmFsc2UpO1xuICAgIGJvYXJkLmFwcGVuZENoaWxkKHByb21vdGlvbik7XG5cbiAgICBzcXVhcmVPdmVyID0gY3JlYXRlRWwoJ3NnLXNxdWFyZS1vdmVyJyk7XG4gICAgc2V0RGlzcGxheShzcXVhcmVPdmVyLCBmYWxzZSk7XG4gICAgYm9hcmQuYXBwZW5kQ2hpbGQoc3F1YXJlT3Zlcik7XG4gIH1cblxuICBsZXQgc2hhcGVzO1xuICBpZiAocy5kcmF3YWJsZS52aXNpYmxlKSB7XG4gICAgY29uc3Qgc3ZnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdzdmcnKSwge1xuICAgICAgY2xhc3M6ICdzZy1zaGFwZXMnLFxuICAgICAgdmlld0JveDogYC0ke3Muc3F1YXJlUmF0aW9bMF0gLyAyfSAtJHtzLnNxdWFyZVJhdGlvWzFdIC8gMn0gJHtzLmRpbWVuc2lvbnMuZmlsZXMgKiBzLnNxdWFyZVJhdGlvWzBdfSAke1xuICAgICAgICBzLmRpbWVuc2lvbnMucmFua3MgKiBzLnNxdWFyZVJhdGlvWzFdXG4gICAgICB9YCxcbiAgICB9KTtcbiAgICBzdmcuYXBwZW5kQ2hpbGQoY3JlYXRlU1ZHRWxlbWVudCgnZGVmcycpKTtcbiAgICBzdmcuYXBwZW5kQ2hpbGQoY3JlYXRlU1ZHRWxlbWVudCgnZycpKTtcblxuICAgIGNvbnN0IGN1c3RvbVN2ZyA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgnc3ZnJyksIHtcbiAgICAgIGNsYXNzOiAnc2ctY3VzdG9tLXN2Z3MnLFxuICAgICAgdmlld0JveDogYDAgMCAke3MuZGltZW5zaW9ucy5maWxlcyAqIHMuc3F1YXJlUmF0aW9bMF19ICR7cy5kaW1lbnNpb25zLnJhbmtzICogcy5zcXVhcmVSYXRpb1sxXX1gLFxuICAgIH0pO1xuICAgIGN1c3RvbVN2Zy5hcHBlbmRDaGlsZChjcmVhdGVTVkdFbGVtZW50KCdnJykpO1xuXG4gICAgY29uc3QgZnJlZVBpZWNlcyA9IGNyZWF0ZUVsKCdzZy1mcmVlLXBpZWNlcycpO1xuXG4gICAgYm9hcmQuYXBwZW5kQ2hpbGQoc3ZnKTtcbiAgICBib2FyZC5hcHBlbmRDaGlsZChjdXN0b21TdmcpO1xuICAgIGJvYXJkLmFwcGVuZENoaWxkKGZyZWVQaWVjZXMpO1xuXG4gICAgc2hhcGVzID0ge1xuICAgICAgc3ZnLFxuICAgICAgZnJlZVBpZWNlcyxcbiAgICAgIGN1c3RvbVN2ZyxcbiAgICB9O1xuICB9XG5cbiAgaWYgKHMuY29vcmRpbmF0ZXMuZW5hYmxlZCkge1xuICAgIGNvbnN0IG9yaWVudENsYXNzID0gcy5vcmllbnRhdGlvbiA9PT0gJ2dvdGUnID8gJyBnb3RlJyA6ICcnLFxuICAgICAgcmFua3MgPSBjb29yZHMocy5jb29yZGluYXRlcy5yYW5rcyksXG4gICAgICBmaWxlcyA9IGNvb3JkcyhzLmNvb3JkaW5hdGVzLmZpbGVzKTtcbiAgICBib2FyZC5hcHBlbmRDaGlsZChyZW5kZXJDb29yZHMocmFua3MsICdyYW5rcycgKyBvcmllbnRDbGFzcywgcy5kaW1lbnNpb25zLnJhbmtzKSk7XG4gICAgYm9hcmQuYXBwZW5kQ2hpbGQocmVuZGVyQ29vcmRzKGZpbGVzLCAnZmlsZXMnICsgb3JpZW50Q2xhc3MsIHMuZGltZW5zaW9ucy5maWxlcykpO1xuICB9XG5cbiAgYm9hcmRXcmFwLmlubmVySFRNTCA9ICcnO1xuXG4gIGNvbnN0IGRpbUNscyA9IGBkLSR7cy5kaW1lbnNpb25zLmZpbGVzfXgke3MuZGltZW5zaW9ucy5yYW5rc31gO1xuXG4gIC8vIHJlbW92ZSBhbGwgb3RoZXIgZGltZW5zaW9uIGNsYXNzZXNcbiAgYm9hcmRXcmFwLmNsYXNzTGlzdC5mb3JFYWNoKGMgPT4ge1xuICAgIGlmIChjLnN1YnN0cmluZygwLCAyKSA9PT0gJ2QtJyAmJiBjICE9PSBkaW1DbHMpIGJvYXJkV3JhcC5jbGFzc0xpc3QucmVtb3ZlKGMpO1xuICB9KTtcblxuICAvLyBlbnN1cmUgdGhlIHNnLXdyYXAgY2xhc3MgYW5kIGRpbWVuc2lvbnMgY2xhc3MgaXMgc2V0IGJlZm9yZWhhbmQgdG8gYXZvaWQgcmVjb21wdXRpbmcgc3R5bGVzXG4gIGJvYXJkV3JhcC5jbGFzc0xpc3QuYWRkKCdzZy13cmFwJywgZGltQ2xzKTtcblxuICBmb3IgKGNvbnN0IGMgb2YgY29sb3JzKSBib2FyZFdyYXAuY2xhc3NMaXN0LnRvZ2dsZSgnb3JpZW50YXRpb24tJyArIGMsIHMub3JpZW50YXRpb24gPT09IGMpO1xuICBib2FyZFdyYXAuY2xhc3NMaXN0LnRvZ2dsZSgnbWFuaXB1bGFibGUnLCAhcy52aWV3T25seSk7XG5cbiAgYm9hcmRXcmFwLmFwcGVuZENoaWxkKGJvYXJkKTtcblxuICBsZXQgaGFuZHM6IEhhbmRFbGVtZW50cyB8IHVuZGVmaW5lZDtcbiAgaWYgKHMuaGFuZHMuaW5saW5lZCkge1xuICAgIGNvbnN0IGhhbmRXcmFwVG9wID0gY3JlYXRlRWwoJ3NnLWhhbmQtd3JhcCcsICdpbmxpbmVkJyksXG4gICAgICBoYW5kV3JhcEJvdHRvbSA9IGNyZWF0ZUVsKCdzZy1oYW5kLXdyYXAnLCAnaW5saW5lZCcpO1xuICAgIGJvYXJkV3JhcC5pbnNlcnRCZWZvcmUoaGFuZFdyYXBCb3R0b20sIGJvYXJkLm5leHRFbGVtZW50U2libGluZyk7XG4gICAgYm9hcmRXcmFwLmluc2VydEJlZm9yZShoYW5kV3JhcFRvcCwgYm9hcmQpO1xuICAgIGhhbmRzID0ge1xuICAgICAgdG9wOiBoYW5kV3JhcFRvcCxcbiAgICAgIGJvdHRvbTogaGFuZFdyYXBCb3R0b20sXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYm9hcmQsXG4gICAgc3F1YXJlcyxcbiAgICBwaWVjZXMsXG4gICAgcHJvbW90aW9uLFxuICAgIHNxdWFyZU92ZXIsXG4gICAgZHJhZ2dlZCxcbiAgICBzaGFwZXMsXG4gICAgaGFuZHMsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwSGFuZChoYW5kV3JhcDogSFRNTEVsZW1lbnQsIHBvczogJ3RvcCcgfCAnYm90dG9tJywgczogU3RhdGUpOiBIVE1MRWxlbWVudCB7XG4gIGNvbnN0IGhhbmQgPSByZW5kZXJIYW5kKHBvcyA9PT0gJ3RvcCcgPyBvcHBvc2l0ZShzLm9yaWVudGF0aW9uKSA6IHMub3JpZW50YXRpb24sIHMuaGFuZHMucm9sZXMpO1xuICBoYW5kV3JhcC5pbm5lckhUTUwgPSAnJztcblxuICBjb25zdCByb2xlQ250Q2xzID0gYHItJHtzLmhhbmRzLnJvbGVzLmxlbmd0aH1gO1xuXG4gIC8vIHJlbW92ZSBhbGwgb3RoZXIgcm9sZSBjb3VudCBjbGFzc2VzXG4gIGhhbmRXcmFwLmNsYXNzTGlzdC5mb3JFYWNoKGMgPT4ge1xuICAgIGlmIChjLnN1YnN0cmluZygwLCAyKSA9PT0gJ3ItJyAmJiBjICE9PSByb2xlQ250Q2xzKSBoYW5kV3JhcC5jbGFzc0xpc3QucmVtb3ZlKGMpO1xuICB9KTtcblxuICAvLyBlbnN1cmUgdGhlIHNnLWhhbmQtd3JhcCBjbGFzcywgaGFuZCBwb3MgY2xhc3MgYW5kIHJvbGUgbnVtYmVyIGNsYXNzIGlzIHNldCBiZWZvcmVoYW5kIHRvIGF2b2lkIHJlY29tcHV0aW5nIHN0eWxlc1xuICBoYW5kV3JhcC5jbGFzc0xpc3QuYWRkKCdzZy1oYW5kLXdyYXAnLCBgaGFuZC0ke3Bvc31gLCByb2xlQ250Q2xzKTtcbiAgaGFuZFdyYXAuYXBwZW5kQ2hpbGQoaGFuZCk7XG5cbiAgZm9yIChjb25zdCBjIG9mIGNvbG9ycykgaGFuZFdyYXAuY2xhc3NMaXN0LnRvZ2dsZSgnb3JpZW50YXRpb24tJyArIGMsIHMub3JpZW50YXRpb24gPT09IGMpO1xuICBoYW5kV3JhcC5jbGFzc0xpc3QudG9nZ2xlKCdtYW5pcHVsYWJsZScsICFzLnZpZXdPbmx5KTtcblxuICByZXR1cm4gaGFuZDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyQ29vcmRzKGVsZW1zOiByZWFkb25seSBzdHJpbmdbXSwgY2xhc3NOYW1lOiBzdHJpbmcsIHRyaW06IG51bWJlcik6IEhUTUxFbGVtZW50IHtcbiAgY29uc3QgZWwgPSBjcmVhdGVFbCgnY29vcmRzJywgY2xhc3NOYW1lKTtcbiAgbGV0IGY6IEhUTUxFbGVtZW50O1xuICBmb3IgKGNvbnN0IGVsZW0gb2YgZWxlbXMuc2xpY2UoLXRyaW0pKSB7XG4gICAgZiA9IGNyZWF0ZUVsKCdjb29yZCcpO1xuICAgIGYudGV4dENvbnRlbnQgPSBlbGVtO1xuICAgIGVsLmFwcGVuZENoaWxkKGYpO1xuICB9XG4gIHJldHVybiBlbDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyU3F1YXJlcyhkaW1zOiBEaW1lbnNpb25zLCBvcmllbnRhdGlvbjogQ29sb3IpOiBIVE1MRWxlbWVudCB7XG4gIGNvbnN0IHNxdWFyZXMgPSBjcmVhdGVFbCgnc2ctc3F1YXJlcycpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGltcy5yYW5rcyAqIGRpbXMuZmlsZXM7IGkrKykge1xuICAgIGNvbnN0IHNxID0gY3JlYXRlRWwoJ3NxJykgYXMgU3F1YXJlTm9kZTtcbiAgICBzcS5zZ0tleSA9XG4gICAgICBvcmllbnRhdGlvbiA9PT0gJ3NlbnRlJ1xuICAgICAgICA/IHBvczJrZXkoW2RpbXMuZmlsZXMgLSAxIC0gKGkgJSBkaW1zLmZpbGVzKSwgTWF0aC5mbG9vcihpIC8gZGltcy5maWxlcyldKVxuICAgICAgICA6IHBvczJrZXkoW2kgJSBkaW1zLmZpbGVzLCBkaW1zLnJhbmtzIC0gMSAtIE1hdGguZmxvb3IoaSAvIGRpbXMuZmlsZXMpXSk7XG4gICAgc3F1YXJlcy5hcHBlbmRDaGlsZChzcSk7XG4gIH1cblxuICByZXR1cm4gc3F1YXJlcztcbn1cblxuZnVuY3Rpb24gcmVuZGVySGFuZChjb2xvcjogQ29sb3IsIHJvbGVzOiBSb2xlU3RyaW5nW10pOiBIVE1MRWxlbWVudCB7XG4gIGNvbnN0IGhhbmQgPSBjcmVhdGVFbCgnc2ctaGFuZCcpO1xuICBmb3IgKGNvbnN0IHJvbGUgb2Ygcm9sZXMpIHtcbiAgICBjb25zdCBwaWVjZSA9IHsgcm9sZTogcm9sZSwgY29sb3I6IGNvbG9yIH0sXG4gICAgICB3cmFwRWwgPSBjcmVhdGVFbCgnc2ctaHAtd3JhcCcpLFxuICAgICAgcGllY2VFbCA9IGNyZWF0ZUVsKCdwaWVjZScsIHBpZWNlTmFtZU9mKHBpZWNlKSkgYXMgUGllY2VOb2RlO1xuICAgIHBpZWNlRWwuc2dDb2xvciA9IGNvbG9yO1xuICAgIHBpZWNlRWwuc2dSb2xlID0gcm9sZTtcbiAgICB3cmFwRWwuYXBwZW5kQ2hpbGQocGllY2VFbCk7XG4gICAgaGFuZC5hcHBlbmRDaGlsZCh3cmFwRWwpO1xuICB9XG4gIHJldHVybiBoYW5kO1xufVxuIiwgImltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgKiBhcyBkcmFnIGZyb20gJy4vZHJhZy5qcyc7XG5pbXBvcnQgKiBhcyBkcmF3IGZyb20gJy4vZHJhdy5qcyc7XG5pbXBvcnQge1xuICBjYWxsVXNlckZ1bmN0aW9uLFxuICBldmVudFBvc2l0aW9uLFxuICBnZXRIYW5kUGllY2VBdERvbVBvcyxcbiAgaXNNaWRkbGVCdXR0b24sXG4gIGlzUGllY2VOb2RlLFxuICBpc1JpZ2h0QnV0dG9uLFxuICBzYW1lUGllY2UsXG59IGZyb20gJy4vdXRpbC5qcyc7XG5pbXBvcnQgeyBhbmltIH0gZnJvbSAnLi9hbmltLmpzJztcbmltcG9ydCB7IHVzZXJEcm9wLCB1c2VyTW92ZSwgY2FuY2VsUHJvbW90aW9uLCBzZWxlY3RTcXVhcmUgfSBmcm9tICcuL2JvYXJkLmpzJztcbmltcG9ydCB7IHVzZXNCb3VuZHMgfSBmcm9tICcuL3NoYXBlcy5qcyc7XG5cbnR5cGUgTW91Y2hCaW5kID0gKGU6IHNnLk1vdWNoRXZlbnQpID0+IHZvaWQ7XG50eXBlIFN0YXRlTW91Y2hCaW5kID0gKGQ6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KSA9PiB2b2lkO1xuXG5mdW5jdGlvbiBjbGVhckJvdW5kcyhzOiBTdGF0ZSk6IHZvaWQge1xuICBzLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzLmNsZWFyKCk7XG4gIHMuZG9tLmJvdW5kcy5oYW5kcy5ib3VuZHMuY2xlYXIoKTtcbiAgcy5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzLmNsZWFyKCk7XG59XG5cbmZ1bmN0aW9uIG9uUmVzaXplKHM6IFN0YXRlKTogKCkgPT4gdm9pZCB7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgY2xlYXJCb3VuZHMocyk7XG4gICAgaWYgKHVzZXNCb3VuZHMocy5kcmF3YWJsZS5zaGFwZXMuY29uY2F0KHMuZHJhd2FibGUuYXV0b1NoYXBlcykpKSBzLmRvbS5yZWRyYXdTaGFwZXMoKTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRCb2FyZChzOiBTdGF0ZSwgYm9hcmRFbHM6IHNnLkJvYXJkRWxlbWVudHMpOiB2b2lkIHtcbiAgaWYgKCdSZXNpemVPYnNlcnZlcicgaW4gd2luZG93KSBuZXcgUmVzaXplT2JzZXJ2ZXIob25SZXNpemUocykpLm9ic2VydmUoYm9hcmRFbHMuYm9hcmQpO1xuXG4gIGlmIChzLnZpZXdPbmx5KSByZXR1cm47XG5cbiAgY29uc3QgcGllY2VzRWwgPSBib2FyZEVscy5waWVjZXMsXG4gICAgcHJvbW90aW9uRWwgPSBib2FyZEVscy5wcm9tb3Rpb247XG5cbiAgLy8gQ2Fubm90IGJlIHBhc3NpdmUsIGJlY2F1c2Ugd2UgcHJldmVudCB0b3VjaCBzY3JvbGxpbmcgYW5kIGRyYWdnaW5nIG9mIHNlbGVjdGVkIGVsZW1lbnRzLlxuICBjb25zdCBvblN0YXJ0ID0gc3RhcnREcmFnT3JEcmF3KHMpO1xuICBwaWVjZXNFbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25TdGFydCBhcyBFdmVudExpc3RlbmVyLCB7XG4gICAgcGFzc2l2ZTogZmFsc2UsXG4gIH0pO1xuICBwaWVjZXNFbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvblN0YXJ0IGFzIEV2ZW50TGlzdGVuZXIsIHtcbiAgICBwYXNzaXZlOiBmYWxzZSxcbiAgfSk7XG4gIGlmIChzLmRpc2FibGVDb250ZXh0TWVudSB8fCBzLmRyYXdhYmxlLmVuYWJsZWQpXG4gICAgcGllY2VzRWwuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBlID0+IGUucHJldmVudERlZmF1bHQoKSk7XG5cbiAgaWYgKHByb21vdGlvbkVsKSB7XG4gICAgY29uc3QgcGllY2VTZWxlY3Rpb24gPSAoZTogc2cuTW91Y2hFdmVudCkgPT4gcHJvbW90ZShzLCBlKTtcbiAgICBwcm9tb3Rpb25FbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHBpZWNlU2VsZWN0aW9uIGFzIEV2ZW50TGlzdGVuZXIpO1xuICAgIGlmIChzLmRpc2FibGVDb250ZXh0TWVudSkgcHJvbW90aW9uRWwuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBlID0+IGUucHJldmVudERlZmF1bHQoKSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRIYW5kKHM6IFN0YXRlLCBoYW5kRWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gIGlmICgnUmVzaXplT2JzZXJ2ZXInIGluIHdpbmRvdykgbmV3IFJlc2l6ZU9ic2VydmVyKG9uUmVzaXplKHMpKS5vYnNlcnZlKGhhbmRFbCk7XG5cbiAgaWYgKHMudmlld09ubHkpIHJldHVybjtcblxuICBjb25zdCBvblN0YXJ0ID0gc3RhcnREcmFnRnJvbUhhbmQocyk7XG4gIGhhbmRFbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvblN0YXJ0IGFzIEV2ZW50TGlzdGVuZXIsIHsgcGFzc2l2ZTogZmFsc2UgfSk7XG4gIGhhbmRFbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25TdGFydCBhcyBFdmVudExpc3RlbmVyLCB7XG4gICAgcGFzc2l2ZTogZmFsc2UsXG4gIH0pO1xuICBoYW5kRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgaWYgKHMucHJvbW90aW9uLmN1cnJlbnQpIHtcbiAgICAgIGNhbmNlbFByb21vdGlvbihzKTtcbiAgICAgIHMuZG9tLnJlZHJhdygpO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHMuZGlzYWJsZUNvbnRleHRNZW51IHx8IHMuZHJhd2FibGUuZW5hYmxlZClcbiAgICBoYW5kRWwuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBlID0+IGUucHJldmVudERlZmF1bHQoKSk7XG59XG5cbi8vIHJldHVybnMgdGhlIHVuYmluZCBmdW5jdGlvblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmREb2N1bWVudChzOiBTdGF0ZSk6IHNnLlVuYmluZCB7XG4gIGNvbnN0IHVuYmluZHM6IHNnLlVuYmluZFtdID0gW107XG5cbiAgLy8gT2xkIHZlcnNpb25zIG9mIEVkZ2UgYW5kIFNhZmFyaSBkbyBub3Qgc3VwcG9ydCBSZXNpemVPYnNlcnZlci4gU2VuZFxuICAvLyBzaG9naWdyb3VuZC5yZXNpemUgaWYgYSB1c2VyIGFjdGlvbiBoYXMgY2hhbmdlZCB0aGUgYm91bmRzIG9mIHRoZSBib2FyZC5cbiAgaWYgKCEoJ1Jlc2l6ZU9ic2VydmVyJyBpbiB3aW5kb3cpKSB7XG4gICAgdW5iaW5kcy5wdXNoKHVuYmluZGFibGUoZG9jdW1lbnQuYm9keSwgJ3Nob2dpZ3JvdW5kLnJlc2l6ZScsIG9uUmVzaXplKHMpKSk7XG4gIH1cblxuICBpZiAoIXMudmlld09ubHkpIHtcbiAgICBjb25zdCBvbm1vdmUgPSBkcmFnT3JEcmF3KHMsIGRyYWcubW92ZSwgZHJhdy5tb3ZlKSxcbiAgICAgIG9uZW5kID0gZHJhZ09yRHJhdyhzLCBkcmFnLmVuZCwgZHJhdy5lbmQpO1xuXG4gICAgZm9yIChjb25zdCBldiBvZiBbJ3RvdWNobW92ZScsICdtb3VzZW1vdmUnXSlcbiAgICAgIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKGRvY3VtZW50LCBldiwgb25tb3ZlIGFzIEV2ZW50TGlzdGVuZXIpKTtcbiAgICBmb3IgKGNvbnN0IGV2IG9mIFsndG91Y2hlbmQnLCAnbW91c2V1cCddKVxuICAgICAgdW5iaW5kcy5wdXNoKHVuYmluZGFibGUoZG9jdW1lbnQsIGV2LCBvbmVuZCBhcyBFdmVudExpc3RlbmVyKSk7XG5cbiAgICB1bmJpbmRzLnB1c2goXG4gICAgICB1bmJpbmRhYmxlKGRvY3VtZW50LCAnc2Nyb2xsJywgKCkgPT4gY2xlYXJCb3VuZHMocyksIHsgY2FwdHVyZTogdHJ1ZSwgcGFzc2l2ZTogdHJ1ZSB9KVxuICAgICk7XG4gICAgdW5iaW5kcy5wdXNoKHVuYmluZGFibGUod2luZG93LCAncmVzaXplJywgKCkgPT4gY2xlYXJCb3VuZHMocyksIHsgcGFzc2l2ZTogdHJ1ZSB9KSk7XG4gIH1cblxuICByZXR1cm4gKCkgPT4gdW5iaW5kcy5mb3JFYWNoKGYgPT4gZigpKTtcbn1cblxuZnVuY3Rpb24gdW5iaW5kYWJsZShcbiAgZWw6IEV2ZW50VGFyZ2V0LFxuICBldmVudE5hbWU6IHN0cmluZyxcbiAgY2FsbGJhY2s6IEV2ZW50TGlzdGVuZXIsXG4gIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9uc1xuKTogc2cuVW5iaW5kIHtcbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrLCBvcHRpb25zKTtcbiAgcmV0dXJuICgpID0+IGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjaywgb3B0aW9ucyk7XG59XG5cbmZ1bmN0aW9uIHN0YXJ0RHJhZ09yRHJhdyhzOiBTdGF0ZSk6IE1vdWNoQmluZCB7XG4gIHJldHVybiBlID0+IHtcbiAgICBpZiAocy5kcmFnZ2FibGUuY3VycmVudCkgZHJhZy5jYW5jZWwocyk7XG4gICAgZWxzZSBpZiAocy5kcmF3YWJsZS5jdXJyZW50KSBkcmF3LmNhbmNlbChzKTtcbiAgICBlbHNlIGlmIChlLnNoaWZ0S2V5IHx8IGlzUmlnaHRCdXR0b24oZSkgfHwgcy5kcmF3YWJsZS5mb3JjZWQpIHtcbiAgICAgIGlmIChzLmRyYXdhYmxlLmVuYWJsZWQpIGRyYXcuc3RhcnQocywgZSk7XG4gICAgfSBlbHNlIGlmICghcy52aWV3T25seSAmJiAhZHJhZy51bndhbnRlZEV2ZW50KGUpKSBkcmFnLnN0YXJ0KHMsIGUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBkcmFnT3JEcmF3KHM6IFN0YXRlLCB3aXRoRHJhZzogU3RhdGVNb3VjaEJpbmQsIHdpdGhEcmF3OiBTdGF0ZU1vdWNoQmluZCk6IE1vdWNoQmluZCB7XG4gIHJldHVybiBlID0+IHtcbiAgICBpZiAocy5kcmF3YWJsZS5jdXJyZW50KSB7XG4gICAgICBpZiAocy5kcmF3YWJsZS5lbmFibGVkKSB3aXRoRHJhdyhzLCBlKTtcbiAgICB9IGVsc2UgaWYgKCFzLnZpZXdPbmx5KSB3aXRoRHJhZyhzLCBlKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3RhcnREcmFnRnJvbUhhbmQoczogU3RhdGUpOiBNb3VjaEJpbmQge1xuICByZXR1cm4gZSA9PiB7XG4gICAgaWYgKHMucHJvbW90aW9uLmN1cnJlbnQpIHJldHVybjtcblxuICAgIGNvbnN0IHBvcyA9IGV2ZW50UG9zaXRpb24oZSksXG4gICAgICBwaWVjZSA9IHBvcyAmJiBnZXRIYW5kUGllY2VBdERvbVBvcyhwb3MsIHMuaGFuZHMucm9sZXMsIHMuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcygpKTtcblxuICAgIGlmIChwaWVjZSkge1xuICAgICAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQpIGRyYWcuY2FuY2VsKHMpO1xuICAgICAgZWxzZSBpZiAocy5kcmF3YWJsZS5jdXJyZW50KSBkcmF3LmNhbmNlbChzKTtcbiAgICAgIGVsc2UgaWYgKGlzTWlkZGxlQnV0dG9uKGUpKSB7XG4gICAgICAgIGlmIChzLmRyYXdhYmxlLmVuYWJsZWQpIHtcbiAgICAgICAgICBpZiAoZS5jYW5jZWxhYmxlICE9PSBmYWxzZSkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIGRyYXcuc2V0RHJhd1BpZWNlKHMsIHBpZWNlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChlLnNoaWZ0S2V5IHx8IGlzUmlnaHRCdXR0b24oZSkgfHwgcy5kcmF3YWJsZS5mb3JjZWQpIHtcbiAgICAgICAgaWYgKHMuZHJhd2FibGUuZW5hYmxlZCkgZHJhdy5zdGFydEZyb21IYW5kKHMsIHBpZWNlLCBlKTtcbiAgICAgIH0gZWxzZSBpZiAoIXMudmlld09ubHkgJiYgIWRyYWcudW53YW50ZWRFdmVudChlKSkge1xuICAgICAgICBpZiAoZS5jYW5jZWxhYmxlICE9PSBmYWxzZSkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBkcmFnLmRyYWdOZXdQaWVjZShzLCBwaWVjZSwgZSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBwcm9tb3RlKHM6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQgfCBudWxsLFxuICAgIGN1ciA9IHMucHJvbW90aW9uLmN1cnJlbnQ7XG4gIGlmICh0YXJnZXQgJiYgaXNQaWVjZU5vZGUodGFyZ2V0KSAmJiBjdXIpIHtcbiAgICBjb25zdCBwaWVjZSA9IHsgY29sb3I6IHRhcmdldC5zZ0NvbG9yLCByb2xlOiB0YXJnZXQuc2dSb2xlIH0sXG4gICAgICBwcm9tID0gIXNhbWVQaWVjZShjdXIucGllY2UsIHBpZWNlKTtcbiAgICBpZiAoY3VyLmRyYWdnZWQgfHwgKHMudHVybkNvbG9yICE9PSBzLmFjdGl2ZUNvbG9yICYmIHMuYWN0aXZlQ29sb3IgIT09ICdib3RoJykpIHtcbiAgICAgIGlmIChzLnNlbGVjdGVkKSB1c2VyTW92ZShzLCBzLnNlbGVjdGVkLCBjdXIua2V5LCBwcm9tKTtcbiAgICAgIGVsc2UgaWYgKHMuc2VsZWN0ZWRQaWVjZSkgdXNlckRyb3Aocywgcy5zZWxlY3RlZFBpZWNlLCBjdXIua2V5LCBwcm9tKTtcbiAgICB9IGVsc2UgYW5pbShzID0+IHNlbGVjdFNxdWFyZShzLCBjdXIua2V5LCBwcm9tKSwgcyk7XG5cbiAgICBjYWxsVXNlckZ1bmN0aW9uKHMucHJvbW90aW9uLmV2ZW50cy5hZnRlciwgcGllY2UpO1xuICB9IGVsc2UgYW5pbShzID0+IGNhbmNlbFByb21vdGlvbihzKSwgcyk7XG4gIHMucHJvbW90aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG5cbiAgcy5kb20ucmVkcmF3KCk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgeyBBbmltQ3VycmVudCwgQW5pbVZlY3RvcnMsIEFuaW1WZWN0b3IsIEFuaW1GYWRpbmdzLCBBbmltUHJvbW90aW9ucyB9IGZyb20gJy4vYW5pbS5qcyc7XG5pbXBvcnQgdHlwZSB7IERyYWdDdXJyZW50IH0gZnJvbSAnLi9kcmFnLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQge1xuICBrZXkycG9zLFxuICBjcmVhdGVFbCxcbiAgc2V0RGlzcGxheSxcbiAgcG9zVG9UcmFuc2xhdGVSZWwsXG4gIHRyYW5zbGF0ZVJlbCxcbiAgcGllY2VOYW1lT2YsXG4gIHNlbnRlUG92LFxuICBpc1BpZWNlTm9kZSxcbiAgaXNTcXVhcmVOb2RlLFxufSBmcm9tICcuL3V0aWwuanMnO1xuXG50eXBlIFNxdWFyZUNsYXNzZXMgPSBNYXA8c2cuS2V5LCBzdHJpbmc+O1xuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyKHM6IFN0YXRlLCBib2FyZEVsczogc2cuQm9hcmRFbGVtZW50cyk6IHZvaWQge1xuICBjb25zdCBhc1NlbnRlOiBib29sZWFuID0gc2VudGVQb3Yocy5vcmllbnRhdGlvbiksXG4gICAgc2NhbGVEb3duID0gcy5zY2FsZURvd25QaWVjZXMgPyAwLjUgOiAxLFxuICAgIHBvc1RvVHJhbnNsYXRlID0gcG9zVG9UcmFuc2xhdGVSZWwocy5kaW1lbnNpb25zKSxcbiAgICBzcXVhcmVzRWw6IEhUTUxFbGVtZW50ID0gYm9hcmRFbHMuc3F1YXJlcyxcbiAgICBwaWVjZXNFbDogSFRNTEVsZW1lbnQgPSBib2FyZEVscy5waWVjZXMsXG4gICAgZHJhZ2dlZEVsOiBzZy5QaWVjZU5vZGUgfCB1bmRlZmluZWQgPSBib2FyZEVscy5kcmFnZ2VkLFxuICAgIHNxdWFyZU92ZXJFbDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQgPSBib2FyZEVscy5zcXVhcmVPdmVyLFxuICAgIHByb21vdGlvbkVsOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZCA9IGJvYXJkRWxzLnByb21vdGlvbixcbiAgICBwaWVjZXM6IHNnLlBpZWNlcyA9IHMucGllY2VzLFxuICAgIGN1ckFuaW06IEFuaW1DdXJyZW50IHwgdW5kZWZpbmVkID0gcy5hbmltYXRpb24uY3VycmVudCxcbiAgICBhbmltczogQW5pbVZlY3RvcnMgPSBjdXJBbmltID8gY3VyQW5pbS5wbGFuLmFuaW1zIDogbmV3IE1hcCgpLFxuICAgIGZhZGluZ3M6IEFuaW1GYWRpbmdzID0gY3VyQW5pbSA/IGN1ckFuaW0ucGxhbi5mYWRpbmdzIDogbmV3IE1hcCgpLFxuICAgIHByb21vdGlvbnM6IEFuaW1Qcm9tb3Rpb25zID0gY3VyQW5pbSA/IGN1ckFuaW0ucGxhbi5wcm9tb3Rpb25zIDogbmV3IE1hcCgpLFxuICAgIGN1ckRyYWc6IERyYWdDdXJyZW50IHwgdW5kZWZpbmVkID0gcy5kcmFnZ2FibGUuY3VycmVudCxcbiAgICBjdXJQcm9tS2V5OiBzZy5LZXkgfCB1bmRlZmluZWQgPSBzLnByb21vdGlvbi5jdXJyZW50Py5kcmFnZ2VkID8gcy5zZWxlY3RlZCA6IHVuZGVmaW5lZCxcbiAgICBzcXVhcmVzOiBTcXVhcmVDbGFzc2VzID0gY29tcHV0ZVNxdWFyZUNsYXNzZXMocyksXG4gICAgc2FtZVBpZWNlcyA9IG5ldyBTZXQ8c2cuS2V5PigpLFxuICAgIG1vdmVkUGllY2VzID0gbmV3IE1hcDxzZy5QaWVjZU5hbWUsIHNnLlBpZWNlTm9kZVtdPigpO1xuXG4gIC8vIGlmIHBpZWNlIG5vdCBiZWluZyBkcmFnZ2VkIGFueW1vcmUsIGhpZGUgaXRcbiAgaWYgKCFjdXJEcmFnICYmIGRyYWdnZWRFbD8uc2dEcmFnZ2luZykge1xuICAgIGRyYWdnZWRFbC5zZ0RyYWdnaW5nID0gZmFsc2U7XG4gICAgc2V0RGlzcGxheShkcmFnZ2VkRWwsIGZhbHNlKTtcbiAgICBpZiAoc3F1YXJlT3ZlckVsKSBzZXREaXNwbGF5KHNxdWFyZU92ZXJFbCwgZmFsc2UpO1xuICB9XG5cbiAgbGV0IGs6IHNnLktleSxcbiAgICBlbDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQsXG4gICAgcGllY2VBdEtleTogc2cuUGllY2UgfCB1bmRlZmluZWQsXG4gICAgZWxQaWVjZU5hbWU6IHNnLlBpZWNlTmFtZSxcbiAgICBhbmltOiBBbmltVmVjdG9yIHwgdW5kZWZpbmVkLFxuICAgIGZhZGluZzogc2cuUGllY2UgfCB1bmRlZmluZWQsXG4gICAgcHJvbTogc2cuUGllY2UgfCB1bmRlZmluZWQsXG4gICAgcE12ZHNldDogc2cuUGllY2VOb2RlW10gfCB1bmRlZmluZWQsXG4gICAgcE12ZDogc2cuUGllY2VOb2RlIHwgdW5kZWZpbmVkO1xuXG4gIC8vIHdhbGsgb3ZlciBhbGwgYm9hcmQgZG9tIGVsZW1lbnRzLCBhcHBseSBhbmltYXRpb25zIGFuZCBmbGFnIG1vdmVkIHBpZWNlc1xuICBlbCA9IHBpZWNlc0VsLmZpcnN0RWxlbWVudENoaWxkIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICB3aGlsZSAoZWwpIHtcbiAgICBpZiAoaXNQaWVjZU5vZGUoZWwpKSB7XG4gICAgICBrID0gZWwuc2dLZXk7XG4gICAgICBwaWVjZUF0S2V5ID0gcGllY2VzLmdldChrKTtcbiAgICAgIGFuaW0gPSBhbmltcy5nZXQoayk7XG4gICAgICBmYWRpbmcgPSBmYWRpbmdzLmdldChrKTtcbiAgICAgIHByb20gPSBwcm9tb3Rpb25zLmdldChrKTtcbiAgICAgIGVsUGllY2VOYW1lID0gcGllY2VOYW1lT2YoeyBjb2xvcjogZWwuc2dDb2xvciwgcm9sZTogZWwuc2dSb2xlIH0pO1xuXG4gICAgICAvLyBpZiBwaWVjZSBkcmFnZ2VkIGFkZCBvciByZW1vdmUgZ2hvc3QgY2xhc3Mgb3IgaWYgcHJvbW90aW9uIGRpYWxvZyBpcyBhY3RpdmUgZm9yIHRoZSBwaWVjZSBhZGQgcHJvbSBjbGFzc1xuICAgICAgaWYgKFxuICAgICAgICAoKGN1ckRyYWc/LnN0YXJ0ZWQgJiYgY3VyRHJhZy5mcm9tQm9hcmQ/Lm9yaWcgPT09IGspIHx8IChjdXJQcm9tS2V5ICYmIGN1clByb21LZXkgPT09IGspKSAmJlxuICAgICAgICAhZWwuc2dHaG9zdFxuICAgICAgKSB7XG4gICAgICAgIGVsLnNnR2hvc3QgPSB0cnVlO1xuICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnaG9zdCcpO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgZWwuc2dHaG9zdCAmJlxuICAgICAgICAoIWN1ckRyYWcgfHwgY3VyRHJhZy5mcm9tQm9hcmQ/Lm9yaWcgIT09IGspICYmXG4gICAgICAgICghY3VyUHJvbUtleSB8fCBjdXJQcm9tS2V5ICE9PSBrKVxuICAgICAgKSB7XG4gICAgICAgIGVsLnNnR2hvc3QgPSBmYWxzZTtcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2hvc3QnKTtcbiAgICAgIH1cbiAgICAgIC8vIHJlbW92ZSBmYWRpbmcgY2xhc3MgaWYgaXQgc3RpbGwgcmVtYWluc1xuICAgICAgaWYgKCFmYWRpbmcgJiYgZWwuc2dGYWRpbmcpIHtcbiAgICAgICAgZWwuc2dGYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZmFkaW5nJyk7XG4gICAgICB9XG4gICAgICAvLyB0aGVyZSBpcyBub3cgYSBwaWVjZSBhdCB0aGlzIGRvbSBrZXlcbiAgICAgIGlmIChwaWVjZUF0S2V5KSB7XG4gICAgICAgIC8vIGNvbnRpbnVlIGFuaW1hdGlvbiBpZiBhbHJlYWR5IGFuaW1hdGluZyBhbmQgc2FtZSBwaWVjZSBvciBwcm9tb3RpbmcgcGllY2VcbiAgICAgICAgLy8gKG90aGVyd2lzZSBpdCBjb3VsZCBhbmltYXRlIGEgY2FwdHVyZWQgcGllY2UpXG4gICAgICAgIGlmIChcbiAgICAgICAgICBhbmltICYmXG4gICAgICAgICAgZWwuc2dBbmltYXRpbmcgJiZcbiAgICAgICAgICAoZWxQaWVjZU5hbWUgPT09IHBpZWNlTmFtZU9mKHBpZWNlQXRLZXkpIHx8IChwcm9tICYmIGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihwcm9tKSkpXG4gICAgICAgICkge1xuICAgICAgICAgIGNvbnN0IHBvcyA9IGtleTJwb3Moayk7XG4gICAgICAgICAgcG9zWzBdICs9IGFuaW1bMl07XG4gICAgICAgICAgcG9zWzFdICs9IGFuaW1bM107XG4gICAgICAgICAgdHJhbnNsYXRlUmVsKGVsLCBwb3NUb1RyYW5zbGF0ZShwb3MsIGFzU2VudGUpLCBzY2FsZURvd24pO1xuICAgICAgICB9IGVsc2UgaWYgKGVsLnNnQW5pbWF0aW5nKSB7XG4gICAgICAgICAgZWwuc2dBbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdhbmltJyk7XG4gICAgICAgICAgdHJhbnNsYXRlUmVsKGVsLCBwb3NUb1RyYW5zbGF0ZShrZXkycG9zKGspLCBhc1NlbnRlKSwgc2NhbGVEb3duKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzYW1lIHBpZWNlOiBmbGFnIGFzIHNhbWVcbiAgICAgICAgaWYgKGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihwaWVjZUF0S2V5KSAmJiAoIWZhZGluZyB8fCAhZWwuc2dGYWRpbmcpKSB7XG4gICAgICAgICAgc2FtZVBpZWNlcy5hZGQoayk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZGlmZmVyZW50IHBpZWNlOiBmbGFnIGFzIG1vdmVkIHVubGVzcyBpdCBpcyBhIGZhZGluZyBwaWVjZSBvciBhbiBhbmltYXRlZCBwcm9tb3RpbmcgcGllY2VcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaWYgKGZhZGluZyAmJiBlbFBpZWNlTmFtZSA9PT0gcGllY2VOYW1lT2YoZmFkaW5nKSkge1xuICAgICAgICAgICAgZWwuc2dGYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZmFkaW5nJyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChwcm9tICYmIGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihwcm9tKSkge1xuICAgICAgICAgICAgc2FtZVBpZWNlcy5hZGQoayk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFwcGVuZFZhbHVlKG1vdmVkUGllY2VzLCBlbFBpZWNlTmFtZSwgZWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gbm8gcGllY2U6IGZsYWcgYXMgbW92ZWRcbiAgICAgIGVsc2Uge1xuICAgICAgICBhcHBlbmRWYWx1ZShtb3ZlZFBpZWNlcywgZWxQaWVjZU5hbWUsIGVsKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWwgPSBlbC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIH1cblxuICAvLyB3YWxrIG92ZXIgYWxsIHNxdWFyZXMgYW5kIGFwcGx5IGNsYXNzZXNcbiAgbGV0IHNxRWwgPSBzcXVhcmVzRWwuZmlyc3RFbGVtZW50Q2hpbGQgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIHdoaWxlIChzcUVsICYmIGlzU3F1YXJlTm9kZShzcUVsKSkge1xuICAgIHNxRWwuY2xhc3NOYW1lID0gc3F1YXJlcy5nZXQoc3FFbC5zZ0tleSkgfHwgJyc7XG4gICAgc3FFbCA9IHNxRWwubmV4dEVsZW1lbnRTaWJsaW5nIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICB9XG5cbiAgLy8gd2FsayBvdmVyIGFsbCBwaWVjZXMgaW4gY3VycmVudCBzZXQsIGFwcGx5IGRvbSBjaGFuZ2VzIHRvIG1vdmVkIHBpZWNlc1xuICAvLyBvciBhcHBlbmQgbmV3IHBpZWNlc1xuICBmb3IgKGNvbnN0IFtrLCBwXSBvZiBwaWVjZXMpIHtcbiAgICBjb25zdCBwaWVjZSA9IHByb21vdGlvbnMuZ2V0KGspIHx8IHA7XG4gICAgYW5pbSA9IGFuaW1zLmdldChrKTtcbiAgICBpZiAoIXNhbWVQaWVjZXMuaGFzKGspKSB7XG4gICAgICBwTXZkc2V0ID0gbW92ZWRQaWVjZXMuZ2V0KHBpZWNlTmFtZU9mKHBpZWNlKSk7XG4gICAgICBwTXZkID0gcE12ZHNldD8ucG9wKCk7XG4gICAgICAvLyBhIHNhbWUgcGllY2Ugd2FzIG1vdmVkXG4gICAgICBpZiAocE12ZCkge1xuICAgICAgICAvLyBhcHBseSBkb20gY2hhbmdlc1xuICAgICAgICBwTXZkLnNnS2V5ID0gaztcbiAgICAgICAgaWYgKHBNdmQuc2dGYWRpbmcpIHtcbiAgICAgICAgICBwTXZkLnNnRmFkaW5nID0gZmFsc2U7XG4gICAgICAgICAgcE12ZC5jbGFzc0xpc3QucmVtb3ZlKCdmYWRpbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwb3MgPSBrZXkycG9zKGspO1xuICAgICAgICBpZiAoYW5pbSkge1xuICAgICAgICAgIHBNdmQuc2dBbmltYXRpbmcgPSB0cnVlO1xuICAgICAgICAgIHBNdmQuY2xhc3NMaXN0LmFkZCgnYW5pbScpO1xuICAgICAgICAgIHBvc1swXSArPSBhbmltWzJdO1xuICAgICAgICAgIHBvc1sxXSArPSBhbmltWzNdO1xuICAgICAgICB9XG4gICAgICAgIHRyYW5zbGF0ZVJlbChwTXZkLCBwb3NUb1RyYW5zbGF0ZShwb3MsIGFzU2VudGUpLCBzY2FsZURvd24pO1xuICAgICAgfVxuICAgICAgLy8gbm8gcGllY2UgaW4gbW92ZWQgb2JqOiBpbnNlcnQgdGhlIG5ldyBwaWVjZVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IHBpZWNlTm9kZSA9IGNyZWF0ZUVsKCdwaWVjZScsIHBpZWNlTmFtZU9mKHApKSBhcyBzZy5QaWVjZU5vZGUsXG4gICAgICAgICAgcG9zID0ga2V5MnBvcyhrKTtcblxuICAgICAgICBwaWVjZU5vZGUuc2dDb2xvciA9IHAuY29sb3I7XG4gICAgICAgIHBpZWNlTm9kZS5zZ1JvbGUgPSBwLnJvbGU7XG4gICAgICAgIHBpZWNlTm9kZS5zZ0tleSA9IGs7XG4gICAgICAgIGlmIChhbmltKSB7XG4gICAgICAgICAgcGllY2VOb2RlLnNnQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgICAgICBwb3NbMF0gKz0gYW5pbVsyXTtcbiAgICAgICAgICBwb3NbMV0gKz0gYW5pbVszXTtcbiAgICAgICAgfVxuICAgICAgICB0cmFuc2xhdGVSZWwocGllY2VOb2RlLCBwb3NUb1RyYW5zbGF0ZShwb3MsIGFzU2VudGUpLCBzY2FsZURvd24pO1xuXG4gICAgICAgIHBpZWNlc0VsLmFwcGVuZENoaWxkKHBpZWNlTm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8vIHJlbW92ZSBhbnkgZWxlbWVudCB0aGF0IHJlbWFpbnMgaW4gdGhlIG1vdmVkIHNldHNcbiAgZm9yIChjb25zdCBub2RlcyBvZiBtb3ZlZFBpZWNlcy52YWx1ZXMoKSkge1xuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgICAgcGllY2VzRWwucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHByb21vdGlvbkVsKSByZW5kZXJQcm9tb3Rpb24ocywgcHJvbW90aW9uRWwpO1xufVxuXG5mdW5jdGlvbiBhcHBlbmRWYWx1ZTxLLCBWPihtYXA6IE1hcDxLLCBWW10+LCBrZXk6IEssIHZhbHVlOiBWKTogdm9pZCB7XG4gIGNvbnN0IGFyciA9IG1hcC5nZXQoa2V5KTtcbiAgaWYgKGFycikgYXJyLnB1c2godmFsdWUpO1xuICBlbHNlIG1hcC5zZXQoa2V5LCBbdmFsdWVdKTtcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVNxdWFyZUNsYXNzZXMoczogU3RhdGUpOiBTcXVhcmVDbGFzc2VzIHtcbiAgY29uc3Qgc3F1YXJlczogU3F1YXJlQ2xhc3NlcyA9IG5ldyBNYXAoKTtcbiAgaWYgKHMubGFzdERlc3RzICYmIHMuaGlnaGxpZ2h0Lmxhc3REZXN0cylcbiAgICBmb3IgKGNvbnN0IGsgb2Ygcy5sYXN0RGVzdHMpIGFkZFNxdWFyZShzcXVhcmVzLCBrLCAnbGFzdC1kZXN0Jyk7XG4gIGlmIChzLmNoZWNrcyAmJiBzLmhpZ2hsaWdodC5jaGVjaylcbiAgICBmb3IgKGNvbnN0IGNoZWNrIG9mIHMuY2hlY2tzKSBhZGRTcXVhcmUoc3F1YXJlcywgY2hlY2ssICdjaGVjaycpO1xuICBpZiAocy5ob3ZlcmVkKSBhZGRTcXVhcmUoc3F1YXJlcywgcy5ob3ZlcmVkLCAnaG92ZXInKTtcbiAgaWYgKHMuc2VsZWN0ZWQpIHtcbiAgICBpZiAocy5hY3RpdmVDb2xvciA9PT0gJ2JvdGgnIHx8IHMuYWN0aXZlQ29sb3IgPT09IHMudHVybkNvbG9yKVxuICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIHMuc2VsZWN0ZWQsICdzZWxlY3RlZCcpO1xuICAgIGVsc2UgYWRkU3F1YXJlKHNxdWFyZXMsIHMuc2VsZWN0ZWQsICdwcmVzZWxlY3RlZCcpO1xuICAgIGlmIChzLm1vdmFibGUuc2hvd0Rlc3RzKSB7XG4gICAgICBjb25zdCBkZXN0cyA9IHMubW92YWJsZS5kZXN0cz8uZ2V0KHMuc2VsZWN0ZWQpO1xuICAgICAgaWYgKGRlc3RzKVxuICAgICAgICBmb3IgKGNvbnN0IGsgb2YgZGVzdHMpIHtcbiAgICAgICAgICBhZGRTcXVhcmUoc3F1YXJlcywgaywgJ2Rlc3QnICsgKHMucGllY2VzLmhhcyhrKSA/ICcgb2MnIDogJycpKTtcbiAgICAgICAgfVxuICAgICAgY29uc3QgcERlc3RzID0gcy5wcmVtb3ZhYmxlLmRlc3RzO1xuICAgICAgaWYgKHBEZXN0cylcbiAgICAgICAgZm9yIChjb25zdCBrIG9mIHBEZXN0cykge1xuICAgICAgICAgIGFkZFNxdWFyZShzcXVhcmVzLCBrLCAncHJlLWRlc3QnICsgKHMucGllY2VzLmhhcyhrKSA/ICcgb2MnIDogJycpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIGlmIChzLnNlbGVjdGVkUGllY2UpIHtcbiAgICBpZiAocy5kcm9wcGFibGUuc2hvd0Rlc3RzKSB7XG4gICAgICBjb25zdCBkZXN0cyA9IHMuZHJvcHBhYmxlLmRlc3RzPy5nZXQocGllY2VOYW1lT2Yocy5zZWxlY3RlZFBpZWNlKSk7XG4gICAgICBpZiAoZGVzdHMpXG4gICAgICAgIGZvciAoY29uc3QgayBvZiBkZXN0cykge1xuICAgICAgICAgIGFkZFNxdWFyZShzcXVhcmVzLCBrLCAnZGVzdCcpO1xuICAgICAgICB9XG4gICAgICBjb25zdCBwRGVzdHMgPSBzLnByZWRyb3BwYWJsZS5kZXN0cztcbiAgICAgIGlmIChwRGVzdHMpXG4gICAgICAgIGZvciAoY29uc3QgayBvZiBwRGVzdHMpIHtcbiAgICAgICAgICBhZGRTcXVhcmUoc3F1YXJlcywgaywgJ3ByZS1kZXN0JyArIChzLnBpZWNlcy5oYXMoaykgPyAnIG9jJyA6ICcnKSk7XG4gICAgICAgIH1cbiAgICB9XG4gIH1cbiAgY29uc3QgcHJlbW92ZSA9IHMucHJlbW92YWJsZS5jdXJyZW50O1xuICBpZiAocHJlbW92ZSkge1xuICAgIGFkZFNxdWFyZShzcXVhcmVzLCBwcmVtb3ZlLm9yaWcsICdjdXJyZW50LXByZScpO1xuICAgIGFkZFNxdWFyZShzcXVhcmVzLCBwcmVtb3ZlLmRlc3QsICdjdXJyZW50LXByZScgKyAocHJlbW92ZS5wcm9tID8gJyBwcm9tJyA6ICcnKSk7XG4gIH0gZWxzZSBpZiAocy5wcmVkcm9wcGFibGUuY3VycmVudClcbiAgICBhZGRTcXVhcmUoXG4gICAgICBzcXVhcmVzLFxuICAgICAgcy5wcmVkcm9wcGFibGUuY3VycmVudC5rZXksXG4gICAgICAnY3VycmVudC1wcmUnICsgKHMucHJlZHJvcHBhYmxlLmN1cnJlbnQucHJvbSA/ICcgcHJvbScgOiAnJylcbiAgICApO1xuXG4gIGZvciAoY29uc3Qgc3FoIG9mIHMuZHJhd2FibGUuc3F1YXJlcykge1xuICAgIGFkZFNxdWFyZShzcXVhcmVzLCBzcWgua2V5LCBzcWguY2xhc3NOYW1lKTtcbiAgfVxuXG4gIHJldHVybiBzcXVhcmVzO1xufVxuXG5mdW5jdGlvbiBhZGRTcXVhcmUoc3F1YXJlczogU3F1YXJlQ2xhc3Nlcywga2V5OiBzZy5LZXksIGtsYXNzOiBzdHJpbmcpOiB2b2lkIHtcbiAgY29uc3QgY2xhc3NlcyA9IHNxdWFyZXMuZ2V0KGtleSk7XG4gIGlmIChjbGFzc2VzKSBzcXVhcmVzLnNldChrZXksIGAke2NsYXNzZXN9ICR7a2xhc3N9YCk7XG4gIGVsc2Ugc3F1YXJlcy5zZXQoa2V5LCBrbGFzcyk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclByb21vdGlvbihzOiBTdGF0ZSwgcHJvbW90aW9uRWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHMucHJvbW90aW9uLmN1cnJlbnQsXG4gICAga2V5ID0gY3VyPy5rZXksXG4gICAgcGllY2VzID0gY3VyID8gW2N1ci5wcm9tb3RlZFBpZWNlLCBjdXIucGllY2VdIDogW10sXG4gICAgaGFzaCA9IHByb21vdGlvbkhhc2goISFjdXIsIGtleSwgcGllY2VzKTtcbiAgaWYgKHMucHJvbW90aW9uLnByZXZQcm9tb3Rpb25IYXNoID09PSBoYXNoKSByZXR1cm47XG4gIHMucHJvbW90aW9uLnByZXZQcm9tb3Rpb25IYXNoID0gaGFzaDtcblxuICBpZiAoa2V5KSB7XG4gICAgY29uc3QgYXNTZW50ZSA9IHNlbnRlUG92KHMub3JpZW50YXRpb24pLFxuICAgICAgaW5pdFBvcyA9IGtleTJwb3Moa2V5KSxcbiAgICAgIGNvbG9yID0gY3VyLnBpZWNlLmNvbG9yLFxuICAgICAgcHJvbW90aW9uU3F1YXJlID0gY3JlYXRlRWwoJ3NnLXByb21vdGlvbi1zcXVhcmUnKSxcbiAgICAgIHByb21vdGlvbkNob2ljZXMgPSBjcmVhdGVFbCgnc2ctcHJvbW90aW9uLWNob2ljZXMnKTtcbiAgICBpZiAocy5vcmllbnRhdGlvbiAhPT0gY29sb3IpIHByb21vdGlvbkNob2ljZXMuY2xhc3NMaXN0LmFkZCgncmV2ZXJzZWQnKTtcbiAgICB0cmFuc2xhdGVSZWwocHJvbW90aW9uU3F1YXJlLCBwb3NUb1RyYW5zbGF0ZVJlbChzLmRpbWVuc2lvbnMpKGluaXRQb3MsIGFzU2VudGUpLCAxKTtcblxuICAgIGZvciAoY29uc3QgcCBvZiBwaWVjZXMpIHtcbiAgICAgIGNvbnN0IHBpZWNlTm9kZSA9IGNyZWF0ZUVsKCdwaWVjZScsIHBpZWNlTmFtZU9mKHApKSBhcyBzZy5QaWVjZU5vZGU7XG4gICAgICBwaWVjZU5vZGUuc2dDb2xvciA9IHAuY29sb3I7XG4gICAgICBwaWVjZU5vZGUuc2dSb2xlID0gcC5yb2xlO1xuICAgICAgcHJvbW90aW9uQ2hvaWNlcy5hcHBlbmRDaGlsZChwaWVjZU5vZGUpO1xuICAgIH1cblxuICAgIHByb21vdGlvbkVsLmlubmVySFRNTCA9ICcnO1xuICAgIHByb21vdGlvblNxdWFyZS5hcHBlbmRDaGlsZChwcm9tb3Rpb25DaG9pY2VzKTtcbiAgICBwcm9tb3Rpb25FbC5hcHBlbmRDaGlsZChwcm9tb3Rpb25TcXVhcmUpO1xuICAgIHNldERpc3BsYXkocHJvbW90aW9uRWwsIHRydWUpO1xuICB9IGVsc2Uge1xuICAgIHNldERpc3BsYXkocHJvbW90aW9uRWwsIGZhbHNlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwcm9tb3Rpb25IYXNoKGFjdGl2ZTogYm9vbGVhbiwga2V5OiBzZy5LZXkgfCB1bmRlZmluZWQsIHBpZWNlczogc2cuUGllY2VbXSk6IHN0cmluZyB7XG4gIHJldHVybiBbYWN0aXZlLCBrZXksIHBpZWNlcy5tYXAocCA9PiBwaWVjZU5hbWVPZihwKSkuam9pbignICcpXS5qb2luKCcgJyk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgeyBXcmFwRWxlbWVudHMsIFdyYXBFbGVtZW50c0Jvb2xlYW4gfSBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IHdyYXBCb2FyZCwgd3JhcEhhbmQgfSBmcm9tICcuL3dyYXAuanMnO1xuaW1wb3J0ICogYXMgZXZlbnRzIGZyb20gJy4vZXZlbnRzLmpzJztcbmltcG9ydCB7IHJlbmRlckhhbmQgfSBmcm9tICcuL2hhbmRzLmpzJztcbmltcG9ydCB7IHJlbmRlciB9IGZyb20gJy4vcmVuZGVyLmpzJztcblxuZnVuY3Rpb24gYXR0YWNoQm9hcmQoc3RhdGU6IFN0YXRlLCBib2FyZFdyYXA6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gIGNvbnN0IGVsZW1lbnRzID0gd3JhcEJvYXJkKGJvYXJkV3JhcCwgc3RhdGUpO1xuXG4gIC8vIGluIGNhc2Ugb2YgaW5saW5lZCBoYW5kc1xuICBpZiAoZWxlbWVudHMuaGFuZHMpIGF0dGFjaEhhbmRzKHN0YXRlLCBlbGVtZW50cy5oYW5kcy50b3AsIGVsZW1lbnRzLmhhbmRzLmJvdHRvbSk7XG5cbiAgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5ib2FyZCA9IGJvYXJkV3JhcDtcbiAgc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkID0gZWxlbWVudHM7XG4gIHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzLmNsZWFyKCk7XG5cbiAgZXZlbnRzLmJpbmRCb2FyZChzdGF0ZSwgZWxlbWVudHMpO1xuXG4gIHN0YXRlLmRyYXdhYmxlLnByZXZTdmdIYXNoID0gJyc7XG4gIHN0YXRlLnByb21vdGlvbi5wcmV2UHJvbW90aW9uSGFzaCA9ICcnO1xuXG4gIHJlbmRlcihzdGF0ZSwgZWxlbWVudHMpO1xufVxuXG5mdW5jdGlvbiBhdHRhY2hIYW5kcyhzdGF0ZTogU3RhdGUsIGhhbmRUb3BXcmFwPzogSFRNTEVsZW1lbnQsIGhhbmRCb3R0b21XcmFwPzogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgaWYgKCFzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMpIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcyA9IHt9O1xuICBpZiAoIXN0YXRlLmRvbS53cmFwRWxlbWVudHMuaGFuZHMpIHN0YXRlLmRvbS53cmFwRWxlbWVudHMuaGFuZHMgPSB7fTtcblxuICBpZiAoaGFuZFRvcFdyYXApIHtcbiAgICBjb25zdCBoYW5kVG9wID0gd3JhcEhhbmQoaGFuZFRvcFdyYXAsICd0b3AnLCBzdGF0ZSk7XG4gICAgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5oYW5kcy50b3AgPSBoYW5kVG9wV3JhcDtcbiAgICBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMudG9wID0gaGFuZFRvcDtcbiAgICBldmVudHMuYmluZEhhbmQoc3RhdGUsIGhhbmRUb3ApO1xuICAgIHJlbmRlckhhbmQoc3RhdGUsIGhhbmRUb3ApO1xuICB9XG4gIGlmIChoYW5kQm90dG9tV3JhcCkge1xuICAgIGNvbnN0IGhhbmRCb3R0b20gPSB3cmFwSGFuZChoYW5kQm90dG9tV3JhcCwgJ2JvdHRvbScsIHN0YXRlKTtcbiAgICBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmhhbmRzLmJvdHRvbSA9IGhhbmRCb3R0b21XcmFwO1xuICAgIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcy5ib3R0b20gPSBoYW5kQm90dG9tO1xuICAgIGV2ZW50cy5iaW5kSGFuZChzdGF0ZSwgaGFuZEJvdHRvbSk7XG4gICAgcmVuZGVySGFuZChzdGF0ZSwgaGFuZEJvdHRvbSk7XG4gIH1cblxuICBpZiAoaGFuZFRvcFdyYXAgfHwgaGFuZEJvdHRvbVdyYXApIHtcbiAgICBzdGF0ZS5kb20uYm91bmRzLmhhbmRzLmJvdW5kcy5jbGVhcigpO1xuICAgIHN0YXRlLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMuY2xlYXIoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVkcmF3QWxsKHdyYXBFbGVtZW50czogV3JhcEVsZW1lbnRzLCBzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHdyYXBFbGVtZW50cy5ib2FyZCkgYXR0YWNoQm9hcmQoc3RhdGUsIHdyYXBFbGVtZW50cy5ib2FyZCk7XG4gIGlmICh3cmFwRWxlbWVudHMuaGFuZHMgJiYgIXN0YXRlLmhhbmRzLmlubGluZWQpXG4gICAgYXR0YWNoSGFuZHMoc3RhdGUsIHdyYXBFbGVtZW50cy5oYW5kcy50b3AsIHdyYXBFbGVtZW50cy5oYW5kcy5ib3R0b20pO1xuXG4gIC8vIHNoYXBlcyBtaWdodCBkZXBlbmQgYm90aCBvbiBib2FyZCBhbmQgaGFuZHMgLSByZWRyYXcgb25seSBhZnRlciBib3RoIGFyZSBkb25lXG4gIHN0YXRlLmRvbS5yZWRyYXdTaGFwZXMoKTtcblxuICBpZiAoc3RhdGUuZXZlbnRzLmluc2VydClcbiAgICBzdGF0ZS5ldmVudHMuaW5zZXJ0KHdyYXBFbGVtZW50cy5ib2FyZCAmJiBzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQsIHtcbiAgICAgIHRvcDogd3JhcEVsZW1lbnRzLmhhbmRzPy50b3AgJiYgc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzPy50b3AsXG4gICAgICBib3R0b206IHdyYXBFbGVtZW50cy5oYW5kcz8uYm90dG9tICYmIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcz8uYm90dG9tLFxuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGV0YWNoRWxlbWVudHMod2ViOiBXcmFwRWxlbWVudHNCb29sZWFuLCBzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHdlYi5ib2FyZCkge1xuICAgIHN0YXRlLmRvbS53cmFwRWxlbWVudHMuYm9hcmQgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzLmNsZWFyKCk7XG4gIH1cbiAgaWYgKHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcyAmJiBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmhhbmRzKSB7XG4gICAgaWYgKHdlYi5oYW5kcz8udG9wKSB7XG4gICAgICBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmhhbmRzLnRvcCA9IHVuZGVmaW5lZDtcbiAgICAgIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcy50b3AgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmICh3ZWIuaGFuZHM/LmJvdHRvbSkge1xuICAgICAgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5oYW5kcy5ib3R0b20gPSB1bmRlZmluZWQ7XG4gICAgICBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMuYm90dG9tID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAod2ViLmhhbmRzPy50b3AgfHwgd2ViLmhhbmRzPy5ib3R0b20pIHtcbiAgICAgIHN0YXRlLmRvbS5ib3VuZHMuaGFuZHMuYm91bmRzLmNsZWFyKCk7XG4gICAgICBzdGF0ZS5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzLmNsZWFyKCk7XG4gICAgfVxuICB9XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBDb25maWcgfSBmcm9tICcuL2NvbmZpZy5qcyc7XG5pbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSB7IERyYXdTaGFwZSwgU3F1YXJlSGlnaGxpZ2h0IH0gZnJvbSAnLi9kcmF3LmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgKiBhcyBib2FyZCBmcm9tICcuL2JvYXJkLmpzJztcbmltcG9ydCB7IGFkZFRvSGFuZCwgcmVtb3ZlRnJvbUhhbmQgfSBmcm9tICcuL2hhbmRzLmpzJztcbmltcG9ydCB7IGluZmVyRGltZW5zaW9ucywgYm9hcmRUb1NmZW4sIGhhbmRzVG9TZmVuIH0gZnJvbSAnLi9zZmVuLmpzJztcbmltcG9ydCB7IGFwcGx5QW5pbWF0aW9uLCBjb25maWd1cmUgfSBmcm9tICcuL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBhbmltLCByZW5kZXIgfSBmcm9tICcuL2FuaW0uanMnO1xuaW1wb3J0IHsgY2FuY2VsIGFzIGRyYWdDYW5jZWwsIGRyYWdOZXdQaWVjZSB9IGZyb20gJy4vZHJhZy5qcyc7XG5pbXBvcnQgeyBkZXRhY2hFbGVtZW50cywgcmVkcmF3QWxsIH0gZnJvbSAnLi9kb20uanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFwaSB7XG4gIC8vIGF0dGFjaCBlbGVtZW50cyB0byBjdXJyZW50IHNnIGluc3RhbmNlXG4gIGF0dGFjaCh3cmFwRWxlbWVudHM6IHNnLldyYXBFbGVtZW50cyk6IHZvaWQ7XG5cbiAgLy8gZGV0YWNoIGVsZW1lbnRzIGZyb20gY3VycmVudCBzZyBpbnN0YW5jZVxuICBkZXRhY2god3JhcEVsZW1lbnRzQm9vbGVhbjogc2cuV3JhcEVsZW1lbnRzQm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gcmVjb25maWd1cmUgdGhlIGluc3RhbmNlLiBBY2NlcHRzIGFsbCBjb25maWcgb3B0aW9uc1xuICAvLyBib2FyZCB3aWxsIGJlIGFuaW1hdGVkIGFjY29yZGluZ2x5LCBpZiBhbmltYXRpb25zIGFyZSBlbmFibGVkXG4gIHNldChjb25maWc6IENvbmZpZywgc2tpcEFuaW1hdGlvbj86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIHJlYWQgc2hvZ2lncm91bmQgc3RhdGU7IHdyaXRlIGF0IHlvdXIgb3duIHJpc2tzXG4gIHN0YXRlOiBTdGF0ZTtcblxuICAvLyBnZXQgdGhlIHBvc2l0aW9uIG9uIHRoZSBib2FyZCBpbiBGb3JzeXRoIG5vdGF0aW9uXG4gIGdldEJvYXJkU2ZlbigpOiBzZy5Cb2FyZFNmZW47XG5cbiAgLy8gZ2V0IHRoZSBwaWVjZXMgaW4gaGFuZCBpbiBGb3JzeXRoIG5vdGF0aW9uXG4gIGdldEhhbmRzU2ZlbigpOiBzZy5IYW5kc1NmZW47XG5cbiAgLy8gY2hhbmdlIHRoZSB2aWV3IGFuZ2xlXG4gIHRvZ2dsZU9yaWVudGF0aW9uKCk6IHZvaWQ7XG5cbiAgLy8gcGVyZm9ybSBhIG1vdmUgcHJvZ3JhbW1hdGljYWxseVxuICBtb3ZlKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gcGVyZm9ybSBhIGRyb3AgcHJvZ3JhbW1hdGljYWxseSwgYnkgZGVmYXVsdCBwaWVjZSBpcyB0YWtlbiBmcm9tIGhhbmRcbiAgZHJvcChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tPzogYm9vbGVhbiwgc3BhcmU/OiBib29sZWFuKTogdm9pZDtcblxuICAvLyBhZGQgYW5kL29yIHJlbW92ZSBhcmJpdHJhcnkgcGllY2VzIG9uIHRoZSBib2FyZFxuICBzZXRQaWVjZXMocGllY2VzOiBzZy5QaWVjZXNEaWZmKTogdm9pZDtcblxuICAvLyBhZGQgcGllY2Uucm9sZSB0byBoYW5kIG9mIHBpZWNlLmNvbG9yXG4gIGFkZFRvSGFuZChwaWVjZTogc2cuUGllY2UsIGNvdW50PzogbnVtYmVyKTogdm9pZDtcblxuICAvLyByZW1vdmUgcGllY2Uucm9sZSBmcm9tIGhhbmQgb2YgcGllY2UuY29sb3JcbiAgcmVtb3ZlRnJvbUhhbmQocGllY2U6IHNnLlBpZWNlLCBjb3VudD86IG51bWJlcik6IHZvaWQ7XG5cbiAgLy8gY2xpY2sgYSBzcXVhcmUgcHJvZ3JhbW1hdGljYWxseVxuICBzZWxlY3RTcXVhcmUoa2V5OiBzZy5LZXkgfCBudWxsLCBwcm9tPzogYm9vbGVhbiwgZm9yY2U/OiBib29sZWFuKTogdm9pZDtcblxuICAvLyBzZWxlY3QgYSBwaWVjZSBmcm9tIGhhbmQgdG8gZHJvcCBwcm9ncmFtYXRpY2FsbHksIGJ5IGRlZmF1bHQgcGllY2UgaW4gaGFuZCBpcyBzZWxlY3RlZFxuICBzZWxlY3RQaWVjZShwaWVjZTogc2cuUGllY2UgfCBudWxsLCBzcGFyZT86IGJvb2xlYW4sIGZvcmNlPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gcGxheSB0aGUgY3VycmVudCBwcmVtb3ZlLCBpZiBhbnk7IHJldHVybnMgdHJ1ZSBpZiBwcmVtb3ZlIHdhcyBwbGF5ZWRcbiAgcGxheVByZW1vdmUoKTogYm9vbGVhbjtcblxuICAvLyBjYW5jZWwgdGhlIGN1cnJlbnQgcHJlbW92ZSwgaWYgYW55XG4gIGNhbmNlbFByZW1vdmUoKTogdm9pZDtcblxuICAvLyBwbGF5IHRoZSBjdXJyZW50IHByZWRyb3AsIGlmIGFueTsgcmV0dXJucyB0cnVlIGlmIHByZW1vdmUgd2FzIHBsYXllZFxuICBwbGF5UHJlZHJvcCgpOiBib29sZWFuO1xuXG4gIC8vIGNhbmNlbCB0aGUgY3VycmVudCBwcmVkcm9wLCBpZiBhbnlcbiAgY2FuY2VsUHJlZHJvcCgpOiB2b2lkO1xuXG4gIC8vIGNhbmNlbCB0aGUgY3VycmVudCBtb3ZlIG9yIGRyb3AgYmVpbmcgbWFkZSwgcHJlbW92ZXMgYW5kIHByZWRyb3BzXG4gIGNhbmNlbE1vdmVPckRyb3AoKTogdm9pZDtcblxuICAvLyBjYW5jZWwgY3VycmVudCBtb3ZlIG9yIGRyb3AgYW5kIHByZXZlbnQgZnVydGhlciBvbmVzXG4gIHN0b3AoKTogdm9pZDtcblxuICAvLyBwcm9ncmFtbWF0aWNhbGx5IGRyYXcgdXNlciBzaGFwZXNcbiAgc2V0U2hhcGVzKHNoYXBlczogRHJhd1NoYXBlW10pOiB2b2lkO1xuXG4gIC8vIHByb2dyYW1tYXRpY2FsbHkgZHJhdyBhdXRvIHNoYXBlc1xuICBzZXRBdXRvU2hhcGVzKHNoYXBlczogRHJhd1NoYXBlW10pOiB2b2lkO1xuXG4gIC8vIHByb2dyYW1tYXRpY2FsbHkgaGlnaGxpZ2h0IHNxdWFyZXNcbiAgc2V0U3F1YXJlSGlnaGxpZ2h0cyhzcXVhcmVzOiBTcXVhcmVIaWdobGlnaHRbXSk6IHZvaWQ7XG5cbiAgLy8gZm9yIHBpZWNlIGRyb3BwaW5nIGFuZCBib2FyZCBlZGl0b3JzXG4gIGRyYWdOZXdQaWVjZShwaWVjZTogc2cuUGllY2UsIGV2ZW50OiBzZy5Nb3VjaEV2ZW50LCBzcGFyZT86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIHVuYmluZHMgYWxsIGV2ZW50c1xuICAvLyAoaW1wb3J0YW50IGZvciBkb2N1bWVudC13aWRlIGV2ZW50cyBsaWtlIHNjcm9sbCBhbmQgbW91c2Vtb3ZlKVxuICBkZXN0cm95OiBzZy5VbmJpbmQ7XG59XG5cbi8vIHNlZSBBUEkgdHlwZXMgYW5kIGRvY3VtZW50YXRpb25zIGluIGFwaS5kLnRzXG5leHBvcnQgZnVuY3Rpb24gc3RhcnQoc3RhdGU6IFN0YXRlKTogQXBpIHtcbiAgcmV0dXJuIHtcbiAgICBhdHRhY2god3JhcEVsZW1lbnRzOiBzZy5XcmFwRWxlbWVudHMpOiB2b2lkIHtcbiAgICAgIHJlZHJhd0FsbCh3cmFwRWxlbWVudHMsIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgZGV0YWNoKHdyYXBFbGVtZW50c0Jvb2xlYW46IHNnLldyYXBFbGVtZW50c0Jvb2xlYW4pOiB2b2lkIHtcbiAgICAgIGRldGFjaEVsZW1lbnRzKHdyYXBFbGVtZW50c0Jvb2xlYW4sIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc2V0KGNvbmZpZzogQ29uZmlnLCBza2lwQW5pbWF0aW9uPzogYm9vbGVhbik6IHZvaWQge1xuICAgICAgZnVuY3Rpb24gZ2V0QnlQYXRoKHBhdGg6IHN0cmluZywgb2JqOiBhbnkpIHtcbiAgICAgICAgY29uc3QgcHJvcGVydGllcyA9IHBhdGguc3BsaXQoJy4nKTtcbiAgICAgICAgcmV0dXJuIHByb3BlcnRpZXMucmVkdWNlKChwcmV2LCBjdXJyKSA9PiBwcmV2ICYmIHByZXZbY3Vycl0sIG9iaik7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGZvcmNlUmVkcmF3UHJvcHM6IChgJHtrZXlvZiBDb25maWd9YCB8IGAke2tleW9mIENvbmZpZ30uJHtzdHJpbmd9YClbXSA9IFtcbiAgICAgICAgJ29yaWVudGF0aW9uJyxcbiAgICAgICAgJ3ZpZXdPbmx5JyxcbiAgICAgICAgJ2Nvb3JkaW5hdGVzLmVuYWJsZWQnLFxuICAgICAgICAnY29vcmRpbmF0ZXMubm90YXRpb24nLFxuICAgICAgICAnZHJhd2FibGUudmlzaWJsZScsXG4gICAgICAgICdoYW5kcy5pbmxpbmVkJyxcbiAgICAgIF07XG4gICAgICBjb25zdCBuZXdEaW1zID0gY29uZmlnLnNmZW4/LmJvYXJkICYmIGluZmVyRGltZW5zaW9ucyhjb25maWcuc2Zlbi5ib2FyZCk7XG4gICAgICBjb25zdCB0b1JlZHJhdyA9XG4gICAgICAgIGZvcmNlUmVkcmF3UHJvcHMuc29tZShwID0+IHtcbiAgICAgICAgICBjb25zdCBjUmVzID0gZ2V0QnlQYXRoKHAsIGNvbmZpZyk7XG4gICAgICAgICAgcmV0dXJuIGNSZXMgJiYgY1JlcyAhPT0gZ2V0QnlQYXRoKHAsIHN0YXRlKTtcbiAgICAgICAgfSkgfHxcbiAgICAgICAgISEoXG4gICAgICAgICAgbmV3RGltcyAmJlxuICAgICAgICAgIChuZXdEaW1zLmZpbGVzICE9PSBzdGF0ZS5kaW1lbnNpb25zLmZpbGVzIHx8IG5ld0RpbXMucmFua3MgIT09IHN0YXRlLmRpbWVuc2lvbnMucmFua3MpXG4gICAgICAgICkgfHxcbiAgICAgICAgISFjb25maWcuaGFuZHM/LnJvbGVzPy5ldmVyeSgociwgaSkgPT4gciA9PT0gc3RhdGUuaGFuZHMucm9sZXNbaV0pO1xuXG4gICAgICBpZiAodG9SZWRyYXcpIHtcbiAgICAgICAgYm9hcmQucmVzZXQoc3RhdGUpO1xuICAgICAgICBjb25maWd1cmUoc3RhdGUsIGNvbmZpZyk7XG4gICAgICAgIHJlZHJhd0FsbChzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLCBzdGF0ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhcHBseUFuaW1hdGlvbihzdGF0ZSwgY29uZmlnKTtcbiAgICAgICAgKGNvbmZpZy5zZmVuPy5ib2FyZCAmJiAhc2tpcEFuaW1hdGlvbiA/IGFuaW0gOiByZW5kZXIpKFxuICAgICAgICAgIHN0YXRlID0+IGNvbmZpZ3VyZShzdGF0ZSwgY29uZmlnKSxcbiAgICAgICAgICBzdGF0ZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBzdGF0ZSxcblxuICAgIGdldEJvYXJkU2ZlbjogKCkgPT4gYm9hcmRUb1NmZW4oc3RhdGUucGllY2VzLCBzdGF0ZS5kaW1lbnNpb25zLCBzdGF0ZS5mb3JzeXRoLnRvRm9yc3l0aCksXG5cbiAgICBnZXRIYW5kc1NmZW46ICgpID0+XG4gICAgICBoYW5kc1RvU2ZlbihzdGF0ZS5oYW5kcy5oYW5kTWFwLCBzdGF0ZS5oYW5kcy5yb2xlcywgc3RhdGUuZm9yc3l0aC50b0ZvcnN5dGgpLFxuXG4gICAgdG9nZ2xlT3JpZW50YXRpb24oKTogdm9pZCB7XG4gICAgICBib2FyZC50b2dnbGVPcmllbnRhdGlvbihzdGF0ZSk7XG4gICAgICByZWRyYXdBbGwoc3RhdGUuZG9tLndyYXBFbGVtZW50cywgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBtb3ZlKG9yaWcsIGRlc3QsIHByb20pOiB2b2lkIHtcbiAgICAgIGFuaW0oXG4gICAgICAgIHN0YXRlID0+XG4gICAgICAgICAgYm9hcmQuYmFzZU1vdmUoc3RhdGUsIG9yaWcsIGRlc3QsIHByb20gfHwgc3RhdGUucHJvbW90aW9uLmZvcmNlTW92ZVByb21vdGlvbihvcmlnLCBkZXN0KSksXG4gICAgICAgIHN0YXRlXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBkcm9wKHBpZWNlLCBrZXksIHByb20sIHNwYXJlKTogdm9pZCB7XG4gICAgICBhbmltKHN0YXRlID0+IHtcbiAgICAgICAgc3RhdGUuZHJvcHBhYmxlLnNwYXJlID0gISFzcGFyZTtcbiAgICAgICAgYm9hcmQuYmFzZURyb3Aoc3RhdGUsIHBpZWNlLCBrZXksIHByb20gfHwgc3RhdGUucHJvbW90aW9uLmZvcmNlRHJvcFByb21vdGlvbihwaWVjZSwga2V5KSk7XG4gICAgICB9LCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHNldFBpZWNlcyhwaWVjZXMpOiB2b2lkIHtcbiAgICAgIGFuaW0oc3RhdGUgPT4gYm9hcmQuc2V0UGllY2VzKHN0YXRlLCBwaWVjZXMpLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGFkZFRvSGFuZChwaWVjZTogc2cuUGllY2UsIGNvdW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgIHJlbmRlcihzdGF0ZSA9PiBhZGRUb0hhbmQoc3RhdGUsIHBpZWNlLCBjb3VudCksIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlRnJvbUhhbmQocGllY2U6IHNnLlBpZWNlLCBjb3VudDogbnVtYmVyKTogdm9pZCB7XG4gICAgICByZW5kZXIoc3RhdGUgPT4gcmVtb3ZlRnJvbUhhbmQoc3RhdGUsIHBpZWNlLCBjb3VudCksIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc2VsZWN0U3F1YXJlKGtleSwgcHJvbSwgZm9yY2UpOiB2b2lkIHtcbiAgICAgIGlmIChrZXkpIGFuaW0oc3RhdGUgPT4gYm9hcmQuc2VsZWN0U3F1YXJlKHN0YXRlLCBrZXksIHByb20sIGZvcmNlKSwgc3RhdGUpO1xuICAgICAgZWxzZSBpZiAoc3RhdGUuc2VsZWN0ZWQpIHtcbiAgICAgICAgYm9hcmQudW5zZWxlY3Qoc3RhdGUpO1xuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHNlbGVjdFBpZWNlKHBpZWNlLCBzcGFyZSwgZm9yY2UpOiB2b2lkIHtcbiAgICAgIGlmIChwaWVjZSkgcmVuZGVyKHN0YXRlID0+IGJvYXJkLnNlbGVjdFBpZWNlKHN0YXRlLCBwaWVjZSwgc3BhcmUsIGZvcmNlLCB0cnVlKSwgc3RhdGUpO1xuICAgICAgZWxzZSBpZiAoc3RhdGUuc2VsZWN0ZWRQaWVjZSkge1xuICAgICAgICBib2FyZC51bnNlbGVjdChzdGF0ZSk7XG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcGxheVByZW1vdmUoKTogYm9vbGVhbiB7XG4gICAgICBpZiAoc3RhdGUucHJlbW92YWJsZS5jdXJyZW50KSB7XG4gICAgICAgIGlmIChhbmltKGJvYXJkLnBsYXlQcmVtb3ZlLCBzdGF0ZSkpIHJldHVybiB0cnVlO1xuICAgICAgICAvLyBpZiB0aGUgcHJlbW92ZSBjb3VsZG4ndCBiZSBwbGF5ZWQsIHJlZHJhdyB0byBjbGVhciBpdCB1cFxuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIHBsYXlQcmVkcm9wKCk6IGJvb2xlYW4ge1xuICAgICAgaWYgKHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50KSB7XG4gICAgICAgIGlmIChhbmltKGJvYXJkLnBsYXlQcmVkcm9wLCBzdGF0ZSkpIHJldHVybiB0cnVlO1xuICAgICAgICAvLyBpZiB0aGUgcHJlZHJvcCBjb3VsZG4ndCBiZSBwbGF5ZWQsIHJlZHJhdyB0byBjbGVhciBpdCB1cFxuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIGNhbmNlbFByZW1vdmUoKTogdm9pZCB7XG4gICAgICByZW5kZXIoYm9hcmQudW5zZXRQcmVtb3ZlLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGNhbmNlbFByZWRyb3AoKTogdm9pZCB7XG4gICAgICByZW5kZXIoYm9hcmQudW5zZXRQcmVkcm9wLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGNhbmNlbE1vdmVPckRyb3AoKTogdm9pZCB7XG4gICAgICByZW5kZXIoc3RhdGUgPT4ge1xuICAgICAgICBib2FyZC5jYW5jZWxNb3ZlT3JEcm9wKHN0YXRlKTtcbiAgICAgICAgZHJhZ0NhbmNlbChzdGF0ZSk7XG4gICAgICB9LCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHN0b3AoKTogdm9pZCB7XG4gICAgICByZW5kZXIoc3RhdGUgPT4ge1xuICAgICAgICBib2FyZC5zdG9wKHN0YXRlKTtcbiAgICAgIH0sIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc2V0QXV0b1NoYXBlcyhzaGFwZXM6IERyYXdTaGFwZVtdKTogdm9pZCB7XG4gICAgICByZW5kZXIoc3RhdGUgPT4gKHN0YXRlLmRyYXdhYmxlLmF1dG9TaGFwZXMgPSBzaGFwZXMpLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHNldFNoYXBlcyhzaGFwZXM6IERyYXdTaGFwZVtdKTogdm9pZCB7XG4gICAgICByZW5kZXIoc3RhdGUgPT4gKHN0YXRlLmRyYXdhYmxlLnNoYXBlcyA9IHNoYXBlcyksIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc2V0U3F1YXJlSGlnaGxpZ2h0cyhzcXVhcmVzOiBTcXVhcmVIaWdobGlnaHRbXSk6IHZvaWQge1xuICAgICAgcmVuZGVyKHN0YXRlID0+IChzdGF0ZS5kcmF3YWJsZS5zcXVhcmVzID0gc3F1YXJlcyksIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgZHJhZ05ld1BpZWNlKHBpZWNlLCBldmVudCwgc3BhcmUpOiB2b2lkIHtcbiAgICAgIGRyYWdOZXdQaWVjZShzdGF0ZSwgcGllY2UsIGV2ZW50LCBzcGFyZSk7XG4gICAgfSxcblxuICAgIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgICBib2FyZC5zdG9wKHN0YXRlKTtcbiAgICAgIHN0YXRlLmRvbS51bmJpbmQoKTtcbiAgICAgIHN0YXRlLmRvbS5kZXN0cm95ZWQgPSB0cnVlO1xuICAgIH0sXG4gIH07XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBBbmltQ3VycmVudCB9IGZyb20gJy4vYW5pbS5qcyc7XG5pbXBvcnQgdHlwZSB7IERyYWdDdXJyZW50IH0gZnJvbSAnLi9kcmFnLmpzJztcbmltcG9ydCB0eXBlIHsgRHJhd2FibGUgfSBmcm9tICcuL2RyYXcuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBIZWFkbGVzc1N0YXRlIHtcbiAgcGllY2VzOiBzZy5QaWVjZXM7XG4gIG9yaWVudGF0aW9uOiBzZy5Db2xvcjsgLy8gYm9hcmQgb3JpZW50YXRpb24uIHNlbnRlIHwgZ290ZVxuICBkaW1lbnNpb25zOiBzZy5EaW1lbnNpb25zOyAvLyBib2FyZCBkaW1lbnNpb25zIC0gbWF4IDE2eDE2XG4gIHR1cm5Db2xvcjogc2cuQ29sb3I7IC8vIHR1cm4gdG8gcGxheS4gc2VudGUgfCBnb3RlXG4gIGFjdGl2ZUNvbG9yPzogc2cuQ29sb3IgfCAnYm90aCc7IC8vIGNvbG9yIHRoYXQgY2FuIG1vdmUgb3IgZHJvcC4gc2VudGUgfCBnb3RlIHwgYm90aCB8IHVuZGVmaW5lZFxuICBjaGVja3M/OiBzZy5LZXlbXTsgLy8gc3F1YXJlcyBjdXJyZW50bHkgaW4gY2hlY2sgW1wiNWFcIl1cbiAgbGFzdERlc3RzPzogc2cuS2V5W107IC8vIHNxdWFyZXMgcGFydCBvZiB0aGUgbGFzdCBtb3ZlIG9yIGRyb3AgW1wiMmJcIjsgXCI4aFwiXVxuICBzZWxlY3RlZD86IHNnLktleTsgLy8gc3F1YXJlIGN1cnJlbnRseSBzZWxlY3RlZCBcIjFhXCJcbiAgc2VsZWN0ZWRQaWVjZT86IHNnLlBpZWNlOyAvLyBwaWVjZSBpbiBoYW5kIGN1cnJlbnRseSBzZWxlY3RlZFxuICBob3ZlcmVkPzogc2cuS2V5OyAvLyBzcXVhcmUgY3VycmVudGx5IGJlaW5nIGhvdmVyZWRcbiAgdmlld09ubHk6IGJvb2xlYW47IC8vIGRvbid0IGJpbmQgZXZlbnRzOiB0aGUgdXNlciB3aWxsIG5ldmVyIGJlIGFibGUgdG8gbW92ZSBwaWVjZXMgYXJvdW5kXG4gIHNxdWFyZVJhdGlvOiBzZy5OdW1iZXJQYWlyOyAvLyByYXRpbyBvZiB0aGUgYm9hcmQgW3dpZHRoLCBoZWlnaHRdXG4gIGRpc2FibGVDb250ZXh0TWVudTogYm9vbGVhbjsgLy8gYmVjYXVzZSB3aG8gbmVlZHMgYSBjb250ZXh0IG1lbnUgb24gYSBzaG9naSBib2FyZFxuICBibG9ja1RvdWNoU2Nyb2xsOiBib29sZWFuOyAvLyBibG9jayBzY3JvbGxpbmcgdmlhIHRvdWNoIGRyYWdnaW5nIG9uIHRoZSBib2FyZCwgZS5nLiBmb3IgY29vcmRpbmF0ZSB0cmFpbmluZ1xuICBzY2FsZURvd25QaWVjZXM6IGJvb2xlYW47XG4gIGNvb3JkaW5hdGVzOiB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjsgLy8gaW5jbHVkZSBjb29yZHMgYXR0cmlidXRlc1xuICAgIGZpbGVzOiBzZy5Ob3RhdGlvbjtcbiAgICByYW5rczogc2cuTm90YXRpb247XG4gIH07XG4gIGhpZ2hsaWdodDoge1xuICAgIGxhc3REZXN0czogYm9vbGVhbjsgLy8gYWRkIGxhc3QtZGVzdCBjbGFzcyB0byBzcXVhcmVzXG4gICAgY2hlY2s6IGJvb2xlYW47IC8vIGFkZCBjaGVjayBjbGFzcyB0byBzcXVhcmVzXG4gICAgY2hlY2tSb2xlczogc2cuUm9sZVN0cmluZ1tdOyAvLyByb2xlcyB0byBiZSBoaWdobGlnaHRlZCB3aGVuIGNoZWNrIGlzIGJvb2xlYW4gaXMgcGFzc2VkIGZyb20gY29uZmlnXG4gICAgaG92ZXJlZDogYm9vbGVhbjsgLy8gYWRkIGhvdmVyIGNsYXNzIHRvIGhvdmVyZWQgc3F1YXJlc1xuICB9O1xuICBhbmltYXRpb246IHtcbiAgICBlbmFibGVkOiBib29sZWFuO1xuICAgIGhhbmRzOiBib29sZWFuO1xuICAgIGR1cmF0aW9uOiBudW1iZXI7XG4gICAgY3VycmVudD86IEFuaW1DdXJyZW50O1xuICB9O1xuICBoYW5kczoge1xuICAgIGlubGluZWQ6IGJvb2xlYW47IC8vIGF0dGFjaGVzIHNnLWhhbmRzIGRpcmVjdGx5IHRvIHNnLXdyYXAsIGlnbm9yZXMgSFRNTEVsZW1lbnRzIHBhc3NlZCB0byBTaG9naWdyb3VuZFxuICAgIGhhbmRNYXA6IHNnLkhhbmRzO1xuICAgIHJvbGVzOiBzZy5Sb2xlU3RyaW5nW107IC8vIHJvbGVzIHRvIHJlbmRlciBpbiBzZy1oYW5kXG4gIH07XG4gIG1vdmFibGU6IHtcbiAgICBmcmVlOiBib29sZWFuOyAvLyBhbGwgbW92ZXMgYXJlIHZhbGlkIC0gYm9hcmQgZWRpdG9yXG4gICAgZGVzdHM/OiBzZy5Nb3ZlRGVzdHM7IC8vIHZhbGlkIG1vdmVzLiB7XCI3Z1wiIFtcIjdmXCJdIFwiNWlcIiBbXCI0aFwiIFwiNWhcIiBcIjZoXCJdfVxuICAgIHNob3dEZXN0czogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIGRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIGV2ZW50czoge1xuICAgICAgYWZ0ZXI/OiAob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXksIHByb206IGJvb2xlYW4sIG1ldGFkYXRhOiBzZy5Nb3ZlTWV0YWRhdGEpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgbW92ZSBoYXMgYmVlbiBwbGF5ZWRcbiAgICB9O1xuICB9O1xuICBkcm9wcGFibGU6IHtcbiAgICBmcmVlOiBib29sZWFuOyAvLyBhbGwgZHJvcHMgYXJlIHZhbGlkIC0gYm9hcmQgZWRpdG9yXG4gICAgZGVzdHM/OiBzZy5Ecm9wRGVzdHM7IC8vIHZhbGlkIGRyb3BzLiB7XCJzZW50ZSBwYXduXCIgW1wiM2FcIiBcIjRhXCJdIFwic2VudGUgbGFuY2VcIiBbXCIzYVwiIFwiM2NcIl19XG4gICAgc2hvd0Rlc3RzOiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgc3BhcmU6IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gcmVtb3ZlIGRyb3BwZWQgcGllY2UgZnJvbSBoYW5kIGFmdGVyIGRyb3AgLSBib2FyZCBlZGl0b3JcbiAgICBldmVudHM6IHtcbiAgICAgIGFmdGVyPzogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb206IGJvb2xlYW4sIG1ldGFkYXRhOiBzZy5Nb3ZlTWV0YWRhdGEpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgZHJvcCBoYXMgYmVlbiBwbGF5ZWRcbiAgICB9O1xuICB9O1xuICBwcmVtb3ZhYmxlOiB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjsgLy8gYWxsb3cgcHJlbW92ZXMgZm9yIGNvbG9yIHRoYXQgY2FuIG5vdCBtb3ZlXG4gICAgc2hvd0Rlc3RzOiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgcHJlLWRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIGRlc3RzPzogc2cuS2V5W107IC8vIHByZW1vdmUgZGVzdGluYXRpb25zIGZvciB0aGUgY3VycmVudCBzZWxlY3Rpb25cbiAgICBjdXJyZW50Pzoge1xuICAgICAgb3JpZzogc2cuS2V5O1xuICAgICAgZGVzdDogc2cuS2V5O1xuICAgICAgcHJvbTogYm9vbGVhbjtcbiAgICB9O1xuICAgIGdlbmVyYXRlPzogKGtleTogc2cuS2V5LCBwaWVjZXM6IHNnLlBpZWNlcykgPT4gc2cuS2V5W107XG4gICAgZXZlbnRzOiB7XG4gICAgICBzZXQ/OiAob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXksIHByb206IGJvb2xlYW4pID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlbW92ZSBoYXMgYmVlbiBzZXRcbiAgICAgIHVuc2V0PzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVtb3ZlIGhhcyBiZWVuIHVuc2V0XG4gICAgfTtcbiAgfTtcbiAgcHJlZHJvcHBhYmxlOiB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjsgLy8gYWxsb3cgcHJlZHJvcHMgZm9yIGNvbG9yIHRoYXQgY2FuIG5vdCBtb3ZlXG4gICAgc2hvd0Rlc3RzOiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgcHJlLWRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIGRlc3RzPzogc2cuS2V5W107IC8vIHByZW1vdmUgZGVzdGluYXRpb25zIGZvciB0aGUgZHJvcCBzZWxlY3Rpb25cbiAgICBjdXJyZW50Pzoge1xuICAgICAgcGllY2U6IHNnLlBpZWNlO1xuICAgICAga2V5OiBzZy5LZXk7XG4gICAgICBwcm9tOiBib29sZWFuO1xuICAgIH07XG4gICAgZ2VuZXJhdGU/OiAocGllY2U6IHNnLlBpZWNlLCBwaWVjZXM6IHNnLlBpZWNlcykgPT4gc2cuS2V5W107XG4gICAgZXZlbnRzOiB7XG4gICAgICBzZXQ/OiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSwgcHJvbTogYm9vbGVhbikgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVkcm9wIGhhcyBiZWVuIHNldFxuICAgICAgdW5zZXQ/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZWRyb3AgaGFzIGJlZW4gdW5zZXRcbiAgICB9O1xuICB9O1xuICBkcmFnZ2FibGU6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBhbGxvdyBtb3ZlcyAmIHByZW1vdmVzIHRvIHVzZSBkcmFnJ24gZHJvcFxuICAgIGRpc3RhbmNlOiBudW1iZXI7IC8vIG1pbmltdW0gZGlzdGFuY2UgdG8gaW5pdGlhdGUgYSBkcmFnOyBpbiBwaXhlbHNcbiAgICBhdXRvRGlzdGFuY2U6IGJvb2xlYW47IC8vIGxldHMgc2hvZ2lncm91bmQgc2V0IGRpc3RhbmNlIHRvIHplcm8gd2hlbiB1c2VyIGRyYWdzIHBpZWNlc1xuICAgIHNob3dHaG9zdDogYm9vbGVhbjsgLy8gc2hvdyBnaG9zdCBvZiBwaWVjZSBiZWluZyBkcmFnZ2VkXG4gICAgc2hvd1RvdWNoU3F1YXJlT3ZlcmxheTogYm9vbGVhbjsgLy8gc2hvdyBzcXVhcmUgb3ZlcmxheSBvbiB0aGUgc3F1YXJlIHRoYXQgaXMgY3VycmVudGx5IGJlaW5nIGhvdmVyZWQsIHRvdWNoIG9ubHlcbiAgICBkZWxldGVPbkRyb3BPZmY6IGJvb2xlYW47IC8vIGRlbGV0ZSBhIHBpZWNlIHdoZW4gaXQgaXMgZHJvcHBlZCBvZmYgdGhlIGJvYXJkIC0gYm9hcmQgZWRpdG9yXG4gICAgYWRkVG9IYW5kT25Ecm9wT2ZmOiBib29sZWFuOyAvLyBhZGQgYSBwaWVjZSB0byBoYW5kIHdoZW4gaXQgaXMgZHJvcHBlZCBvbiBpdCwgcmVxdWlyZXMgZGVsZXRlT25Ecm9wT2ZmIC0gYm9hcmQgZWRpdG9yXG4gICAgY3VycmVudD86IERyYWdDdXJyZW50O1xuICB9O1xuICBzZWxlY3RhYmxlOiB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjsgLy8gZGlzYWJsZSB0byBlbmZvcmNlIGRyYWdnaW5nIG92ZXIgY2xpY2stY2xpY2sgbW92ZVxuICAgIGZvcmNlU3BhcmVzOiBib29sZWFuOyAvLyBhbGxvdyBkcm9wcGluZyBzcGFyZSBwaWVjZXMgZXZlbiB3aXRoIHNlbGVjdGFibGUgZGlzYWJsZWRcbiAgICBkZWxldGVPblRvdWNoOiBib29sZWFuOyAvLyBzZWxlY3RpbmcgYSBwaWVjZSBvbiB0aGUgYm9hcmQgb3IgaW4gaGFuZCB3aWxsIHJlbW92ZSBpdCAtIGJvYXJkIGVkaXRvclxuICAgIGFkZFNwYXJlc1RvSGFuZDogYm9vbGVhbjsgLy8gYWRkIHNlbGVjdGVkIHNwYXJlIHBpZWNlIHRvIGhhbmQgLSBib2FyZCBlZGl0b3JcbiAgfTtcbiAgcHJvbW90aW9uOiB7XG4gICAgcHJvbW90ZXNUbzogKHJvbGU6IHNnLlJvbGVTdHJpbmcpID0+IHNnLlJvbGVTdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgdW5wcm9tb3Rlc1RvOiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBtb3ZlUHJvbW90aW9uRGlhbG9nOiAob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXkpID0+IGJvb2xlYW47XG4gICAgZm9yY2VNb3ZlUHJvbW90aW9uOiAob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXkpID0+IGJvb2xlYW47XG4gICAgZHJvcFByb21vdGlvbkRpYWxvZzogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXkpID0+IGJvb2xlYW47XG4gICAgZm9yY2VEcm9wUHJvbW90aW9uOiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSkgPT4gYm9vbGVhbjtcbiAgICBjdXJyZW50Pzoge1xuICAgICAgcGllY2U6IHNnLlBpZWNlO1xuICAgICAgcHJvbW90ZWRQaWVjZTogc2cuUGllY2U7XG4gICAgICBrZXk6IHNnLktleTtcbiAgICAgIGRyYWdnZWQ6IGJvb2xlYW47IC8vIG5vIGFuaW1hdGlvbnMgd2l0aCBkcmFnXG4gICAgfTtcbiAgICBldmVudHM6IHtcbiAgICAgIGluaXRpYXRlZD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIHByb21vdGlvbiBkaWFsb2cgaXMgc3RhcnRlZFxuICAgICAgYWZ0ZXI/OiAocGllY2U6IHNnLlBpZWNlKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdXNlciBzZWxlY3RzIGEgcGllY2VcbiAgICAgIGNhbmNlbD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB1c2VyIGNhbmNlbHMgdGhlIHNlbGVjdGlvblxuICAgIH07XG4gICAgcHJldlByb21vdGlvbkhhc2g6IHN0cmluZztcbiAgfTtcbiAgZm9yc3l0aDoge1xuICAgIHRvRm9yc3l0aD86IChyb2xlOiBzZy5Sb2xlU3RyaW5nKSA9PiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgZnJvbUZvcnN5dGg/OiAoc3RyOiBzdHJpbmcpID0+IHNnLlJvbGVTdHJpbmcgfCB1bmRlZmluZWQ7XG4gIH07XG4gIGV2ZW50czoge1xuICAgIGNoYW5nZT86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgc2l0dWF0aW9uIGNoYW5nZXMgb24gdGhlIGJvYXJkXG4gICAgbW92ZT86IChvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSwgcHJvbTogYm9vbGVhbiwgY2FwdHVyZWRQaWVjZT86IHNnLlBpZWNlKSA9PiB2b2lkO1xuICAgIGRyb3A/OiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSwgcHJvbTogYm9vbGVhbikgPT4gdm9pZDtcbiAgICBzZWxlY3Q/OiAoa2V5OiBzZy5LZXkpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIGEgc3F1YXJlIGlzIHNlbGVjdGVkXG4gICAgdW5zZWxlY3Q/OiAoa2V5OiBzZy5LZXkpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIGEgc2VsZWN0ZWQgc3F1YXJlIGlzIGRpcmVjdGx5IHVuc2VsZWN0ZWQgLSBkcm9wcGVkIGJhY2sgb3IgY2xpY2tlZCBvbiB0aGUgb3JpZ2luYWwgc3F1YXJlXG4gICAgcGllY2VTZWxlY3Q/OiAocGllY2U6IHNnLlBpZWNlKSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBhIHBpZWNlIGluIGhhbmQgaXMgc2VsZWN0ZWRcbiAgICBwaWVjZVVuc2VsZWN0PzogKHBpZWNlOiBzZy5QaWVjZSkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gYSBzZWxlY3RlZCBwaWVjZSBpcyBkaXJlY3RseSB1bnNlbGVjdGVkIC0gZHJvcHBlZCBiYWNrIG9yIGNsaWNrZWQgb24gdGhlIHNhbWUgcGllY2VcbiAgICBpbnNlcnQ/OiAoYm9hcmRFbGVtZW50cz86IHNnLkJvYXJkRWxlbWVudHMsIGhhbmRFbGVtZW50cz86IHNnLkhhbmRFbGVtZW50cykgPT4gdm9pZDsgLy8gd2hlbiB0aGUgYm9hcmQgb3IgaGFuZHMgRE9NIGhhcyBiZWVuIChyZSlpbnNlcnRlZFxuICB9O1xuICBkcmF3YWJsZTogRHJhd2FibGU7XG59XG5leHBvcnQgaW50ZXJmYWNlIFN0YXRlIGV4dGVuZHMgSGVhZGxlc3NTdGF0ZSB7XG4gIGRvbTogc2cuRG9tO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdHMoKTogSGVhZGxlc3NTdGF0ZSB7XG4gIHJldHVybiB7XG4gICAgcGllY2VzOiBuZXcgTWFwKCksXG4gICAgZGltZW5zaW9uczogeyBmaWxlczogOSwgcmFua3M6IDkgfSxcbiAgICBvcmllbnRhdGlvbjogJ3NlbnRlJyxcbiAgICB0dXJuQ29sb3I6ICdzZW50ZScsXG4gICAgYWN0aXZlQ29sb3I6ICdib3RoJyxcbiAgICB2aWV3T25seTogZmFsc2UsXG4gICAgc3F1YXJlUmF0aW86IFsxMSwgMTJdLFxuICAgIGRpc2FibGVDb250ZXh0TWVudTogdHJ1ZSxcbiAgICBibG9ja1RvdWNoU2Nyb2xsOiBmYWxzZSxcbiAgICBzY2FsZURvd25QaWVjZXM6IHRydWUsXG4gICAgY29vcmRpbmF0ZXM6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBmaWxlczogJ251bWVyaWMnLFxuICAgICAgcmFua3M6ICdudW1lcmljJyxcbiAgICB9LFxuICAgIGhpZ2hsaWdodDoge1xuICAgICAgbGFzdERlc3RzOiB0cnVlLFxuICAgICAgY2hlY2s6IHRydWUsXG4gICAgICBjaGVja1JvbGVzOiBbJ2tpbmcnXSxcbiAgICAgIGhvdmVyZWQ6IGZhbHNlLFxuICAgIH0sXG4gICAgYW5pbWF0aW9uOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgaGFuZHM6IHRydWUsXG4gICAgICBkdXJhdGlvbjogMjUwLFxuICAgIH0sXG4gICAgaGFuZHM6IHtcbiAgICAgIGlubGluZWQ6IGZhbHNlLFxuICAgICAgaGFuZE1hcDogbmV3IE1hcDxzZy5Db2xvciwgc2cuSGFuZD4oW1xuICAgICAgICBbJ3NlbnRlJywgbmV3IE1hcCgpXSxcbiAgICAgICAgWydnb3RlJywgbmV3IE1hcCgpXSxcbiAgICAgIF0pLFxuICAgICAgcm9sZXM6IFsncm9vaycsICdiaXNob3AnLCAnZ29sZCcsICdzaWx2ZXInLCAna25pZ2h0JywgJ2xhbmNlJywgJ3Bhd24nXSxcbiAgICB9LFxuICAgIG1vdmFibGU6IHtcbiAgICAgIGZyZWU6IHRydWUsXG4gICAgICBzaG93RGVzdHM6IHRydWUsXG4gICAgICBldmVudHM6IHt9LFxuICAgIH0sXG4gICAgZHJvcHBhYmxlOiB7XG4gICAgICBmcmVlOiB0cnVlLFxuICAgICAgc2hvd0Rlc3RzOiB0cnVlLFxuICAgICAgc3BhcmU6IGZhbHNlLFxuICAgICAgZXZlbnRzOiB7fSxcbiAgICB9LFxuICAgIHByZW1vdmFibGU6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBzaG93RGVzdHM6IHRydWUsXG4gICAgICBldmVudHM6IHt9LFxuICAgIH0sXG4gICAgcHJlZHJvcHBhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgc2hvd0Rlc3RzOiB0cnVlLFxuICAgICAgZXZlbnRzOiB7fSxcbiAgICB9LFxuICAgIGRyYWdnYWJsZToge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGRpc3RhbmNlOiAzLFxuICAgICAgYXV0b0Rpc3RhbmNlOiB0cnVlLFxuICAgICAgc2hvd0dob3N0OiB0cnVlLFxuICAgICAgc2hvd1RvdWNoU3F1YXJlT3ZlcmxheTogdHJ1ZSxcbiAgICAgIGRlbGV0ZU9uRHJvcE9mZjogZmFsc2UsXG4gICAgICBhZGRUb0hhbmRPbkRyb3BPZmY6IGZhbHNlLFxuICAgIH0sXG4gICAgc2VsZWN0YWJsZToge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGZvcmNlU3BhcmVzOiBmYWxzZSxcbiAgICAgIGRlbGV0ZU9uVG91Y2g6IGZhbHNlLFxuICAgICAgYWRkU3BhcmVzVG9IYW5kOiBmYWxzZSxcbiAgICB9LFxuICAgIHByb21vdGlvbjoge1xuICAgICAgbW92ZVByb21vdGlvbkRpYWxvZzogKCkgPT4gZmFsc2UsXG4gICAgICBmb3JjZU1vdmVQcm9tb3Rpb246ICgpID0+IGZhbHNlLFxuICAgICAgZHJvcFByb21vdGlvbkRpYWxvZzogKCkgPT4gZmFsc2UsXG4gICAgICBmb3JjZURyb3BQcm9tb3Rpb246ICgpID0+IGZhbHNlLFxuICAgICAgcHJvbW90ZXNUbzogKCkgPT4gdW5kZWZpbmVkLFxuICAgICAgdW5wcm9tb3Rlc1RvOiAoKSA9PiB1bmRlZmluZWQsXG4gICAgICBldmVudHM6IHt9LFxuICAgICAgcHJldlByb21vdGlvbkhhc2g6ICcnLFxuICAgIH0sXG4gICAgZm9yc3l0aDoge30sXG4gICAgZXZlbnRzOiB7fSxcbiAgICBkcmF3YWJsZToge1xuICAgICAgZW5hYmxlZDogdHJ1ZSwgLy8gY2FuIGRyYXdcbiAgICAgIHZpc2libGU6IHRydWUsIC8vIGNhbiB2aWV3XG4gICAgICBmb3JjZWQ6IGZhbHNlLCAvLyBjYW4gb25seSBkcmF3XG4gICAgICBlcmFzZU9uQ2xpY2s6IHRydWUsXG4gICAgICBzaGFwZXM6IFtdLFxuICAgICAgYXV0b1NoYXBlczogW10sXG4gICAgICBzcXVhcmVzOiBbXSxcbiAgICAgIHByZXZTdmdIYXNoOiAnJyxcbiAgICB9LFxuICB9O1xufVxuIiwgImltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB7IHJlbmRlciB9IGZyb20gJy4vcmVuZGVyLmpzJztcbmltcG9ydCB7IHJlbmRlckhhbmQgfSBmcm9tICcuL2hhbmRzLmpzJztcbmltcG9ydCB7IHJlbmRlclNoYXBlcyB9IGZyb20gJy4vc2hhcGVzLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlZHJhd1NoYXBlc05vdyhzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZD8uc2hhcGVzKVxuICAgIHJlbmRlclNoYXBlcyhcbiAgICAgIHN0YXRlLFxuICAgICAgc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkLnNoYXBlcy5zdmcsXG4gICAgICBzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQuc2hhcGVzLmN1c3RvbVN2ZyxcbiAgICAgIHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZC5zaGFwZXMuZnJlZVBpZWNlc1xuICAgICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWRyYXdOb3coc3RhdGU6IFN0YXRlLCBza2lwU2hhcGVzPzogYm9vbGVhbik6IHZvaWQge1xuICBjb25zdCBib2FyZEVscyA9IHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZDtcbiAgaWYgKGJvYXJkRWxzKSB7XG4gICAgcmVuZGVyKHN0YXRlLCBib2FyZEVscyk7XG4gICAgaWYgKCFza2lwU2hhcGVzKSByZWRyYXdTaGFwZXNOb3coc3RhdGUpO1xuICB9XG5cbiAgY29uc3QgaGFuZEVscyA9IHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcztcbiAgaWYgKGhhbmRFbHMpIHtcbiAgICBpZiAoaGFuZEVscy50b3ApIHJlbmRlckhhbmQoc3RhdGUsIGhhbmRFbHMudG9wKTtcbiAgICBpZiAoaGFuZEVscy5ib3R0b20pIHJlbmRlckhhbmQoc3RhdGUsIGhhbmRFbHMuYm90dG9tKTtcbiAgfVxufVxuIiwgImltcG9ydCB0eXBlIHsgRE9NUmVjdE1hcCwgUGllY2VOYW1lLCBQaWVjZU5vZGUsIFdyYXBFbGVtZW50cyB9IGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHR5cGUgeyBBcGkgfSBmcm9tICcuL2FwaS5qcyc7XG5pbXBvcnQgdHlwZSB7IENvbmZpZyB9IGZyb20gJy4vY29uZmlnLmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB7IHN0YXJ0IH0gZnJvbSAnLi9hcGkuanMnO1xuaW1wb3J0IHsgY29uZmlndXJlIH0gZnJvbSAnLi9jb25maWcuanMnO1xuaW1wb3J0IHsgZGVmYXVsdHMgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsLmpzJztcbmltcG9ydCB7IHJlZHJhd0FsbCB9IGZyb20gJy4vZG9tLmpzJztcbmltcG9ydCB7IGJpbmREb2N1bWVudCB9IGZyb20gJy4vZXZlbnRzLmpzJztcbmltcG9ydCB7IHJlZHJhd05vdywgcmVkcmF3U2hhcGVzTm93IH0gZnJvbSAnLi9yZWRyYXcuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gU2hvZ2lncm91bmQoY29uZmlnPzogQ29uZmlnLCB3cmFwRWxlbWVudHM/OiBXcmFwRWxlbWVudHMpOiBBcGkge1xuICBjb25zdCBzdGF0ZSA9IGRlZmF1bHRzKCkgYXMgU3RhdGU7XG4gIGNvbmZpZ3VyZShzdGF0ZSwgY29uZmlnIHx8IHt9KTtcblxuICBjb25zdCByZWRyYXdTdGF0ZU5vdyA9IChza2lwU2hhcGVzPzogYm9vbGVhbikgPT4ge1xuICAgIHJlZHJhd05vdyhzdGF0ZSwgc2tpcFNoYXBlcyk7XG4gIH07XG5cbiAgc3RhdGUuZG9tID0ge1xuICAgIHdyYXBFbGVtZW50czogd3JhcEVsZW1lbnRzIHx8IHt9LFxuICAgIGVsZW1lbnRzOiB7fSxcbiAgICBib3VuZHM6IHtcbiAgICAgIGJvYXJkOiB7XG4gICAgICAgIGJvdW5kczogdXRpbC5tZW1vKCgpID0+IHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZD8ucGllY2VzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKSxcbiAgICAgIH0sXG4gICAgICBoYW5kczoge1xuICAgICAgICBib3VuZHM6IHV0aWwubWVtbygoKSA9PiB7XG4gICAgICAgICAgY29uc3QgaGFuZHNSZWN0czogRE9NUmVjdE1hcDwndG9wJyB8ICdib3R0b20nPiA9IG5ldyBNYXAoKSxcbiAgICAgICAgICAgIGhhbmRFbHMgPSBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHM7XG4gICAgICAgICAgaWYgKGhhbmRFbHM/LnRvcCkgaGFuZHNSZWN0cy5zZXQoJ3RvcCcsIGhhbmRFbHMudG9wLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKTtcbiAgICAgICAgICBpZiAoaGFuZEVscz8uYm90dG9tKSBoYW5kc1JlY3RzLnNldCgnYm90dG9tJywgaGFuZEVscy5ib3R0b20uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpO1xuICAgICAgICAgIHJldHVybiBoYW5kc1JlY3RzO1xuICAgICAgICB9KSxcbiAgICAgICAgcGllY2VCb3VuZHM6IHV0aWwubWVtbygoKSA9PiB7XG4gICAgICAgICAgY29uc3QgaGFuZFBpZWNlc1JlY3RzOiBET01SZWN0TWFwPFBpZWNlTmFtZT4gPSBuZXcgTWFwKCksXG4gICAgICAgICAgICBoYW5kRWxzID0gc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzO1xuXG4gICAgICAgICAgaWYgKGhhbmRFbHM/LnRvcCkge1xuICAgICAgICAgICAgbGV0IHdyYXBFbCA9IGhhbmRFbHMudG9wLmZpcnN0RWxlbWVudENoaWxkIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgd2hpbGUgKHdyYXBFbCkge1xuICAgICAgICAgICAgICBjb25zdCBwaWVjZUVsID0gd3JhcEVsLmZpcnN0RWxlbWVudENoaWxkIGFzIFBpZWNlTm9kZSxcbiAgICAgICAgICAgICAgICBwaWVjZSA9IHsgcm9sZTogcGllY2VFbC5zZ1JvbGUsIGNvbG9yOiBwaWVjZUVsLnNnQ29sb3IgfTtcbiAgICAgICAgICAgICAgaGFuZFBpZWNlc1JlY3RzLnNldCh1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKSwgcGllY2VFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSk7XG4gICAgICAgICAgICAgIHdyYXBFbCA9IHdyYXBFbC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChoYW5kRWxzPy5ib3R0b20pIHtcbiAgICAgICAgICAgIGxldCB3cmFwRWwgPSBoYW5kRWxzLmJvdHRvbS5maXJzdEVsZW1lbnRDaGlsZCBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHdoaWxlICh3cmFwRWwpIHtcbiAgICAgICAgICAgICAgY29uc3QgcGllY2VFbCA9IHdyYXBFbC5maXJzdEVsZW1lbnRDaGlsZCBhcyBQaWVjZU5vZGUsXG4gICAgICAgICAgICAgICAgcGllY2UgPSB7IHJvbGU6IHBpZWNlRWwuc2dSb2xlLCBjb2xvcjogcGllY2VFbC5zZ0NvbG9yIH07XG4gICAgICAgICAgICAgIGhhbmRQaWVjZXNSZWN0cy5zZXQodXRpbC5waWVjZU5hbWVPZihwaWVjZSksIHBpZWNlRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpO1xuICAgICAgICAgICAgICB3cmFwRWwgPSB3cmFwRWwubmV4dEVsZW1lbnRTaWJsaW5nIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gaGFuZFBpZWNlc1JlY3RzO1xuICAgICAgICB9KSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICByZWRyYXdOb3c6IHJlZHJhd1N0YXRlTm93LFxuICAgIHJlZHJhdzogZGVib3VuY2VSZWRyYXcocmVkcmF3U3RhdGVOb3cpLFxuICAgIHJlZHJhd1NoYXBlczogZGVib3VuY2VSZWRyYXcoKCkgPT4gcmVkcmF3U2hhcGVzTm93KHN0YXRlKSksXG4gICAgdW5iaW5kOiBiaW5kRG9jdW1lbnQoc3RhdGUpLFxuICAgIGRlc3Ryb3llZDogZmFsc2UsXG4gIH07XG5cbiAgaWYgKHdyYXBFbGVtZW50cykgcmVkcmF3QWxsKHdyYXBFbGVtZW50cywgc3RhdGUpO1xuXG4gIHJldHVybiBzdGFydChzdGF0ZSk7XG59XG5cbmZ1bmN0aW9uIGRlYm91bmNlUmVkcmF3KGY6ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCk6ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCB7XG4gIGxldCByZWRyYXdpbmcgPSBmYWxzZTtcbiAgcmV0dXJuICguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgIGlmIChyZWRyYXdpbmcpIHJldHVybjtcbiAgICByZWRyYXdpbmcgPSB0cnVlO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICBmKC4uLmFyZ3MpO1xuICAgICAgcmVkcmF3aW5nID0gZmFsc2U7XG4gICAgfSk7XG4gIH07XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDRU8sTUFBTSxTQUFTLENBQUMsU0FBUyxNQUFNO0FBRS9CLE1BQU0sUUFBUTtBQUFBLElBQ25CO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUNPLE1BQU0sUUFBUTtBQUFBLElBQ25CO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUVPLE1BQU0sVUFBMEIsTUFBTSxVQUFVO0FBQUEsSUFDckQsR0FBRyxNQUFNLElBQUksT0FBSyxNQUFNLElBQUksT0FBSyxJQUFJLENBQUMsQ0FBQztBQUFBLEVBQ3pDOzs7QUN4Q08sTUFBTSxVQUFVLENBQUMsUUFBd0IsUUFBUSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDO0FBRXJFLE1BQU0sVUFBVSxDQUFDLE1BQXNCO0FBQzVDLFFBQUksRUFBRSxTQUFTLEVBQUcsUUFBTyxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksSUFBSSxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUU7QUFBQSxRQUMvRCxRQUFPLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxJQUFJLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRTtBQUFBLEVBQ3pEO0FBRU8sV0FBUyxLQUFRLEdBQXdCO0FBQzlDLFFBQUk7QUFDSixVQUFNLE1BQU0sTUFBUztBQUNuQixVQUFJLE1BQU0sT0FBVyxLQUFJLEVBQUU7QUFDM0IsYUFBTztBQUFBLElBQ1Q7QUFDQSxRQUFJLFFBQVEsTUFBTTtBQUNoQixVQUFJO0FBQUEsSUFDTjtBQUNBLFdBQU87QUFBQSxFQUNUO0FBRU8sV0FBUyxpQkFDZCxNQUNHLE1BQ0c7QUFDTixRQUFJLEVBQUcsWUFBVyxNQUFNLEVBQUUsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUFBLEVBQ3ZDO0FBRU8sTUFBTSxXQUFXLENBQUMsTUFBMkIsTUFBTSxVQUFVLFNBQVM7QUFFdEUsTUFBTSxXQUFXLENBQUMsTUFBeUIsTUFBTTtBQUVqRCxNQUFNLGFBQWEsQ0FBQyxNQUFjLFNBQXlCO0FBQ2hFLFVBQU0sS0FBSyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsR0FDekIsS0FBSyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUM7QUFDdkIsV0FBTyxLQUFLLEtBQUssS0FBSztBQUFBLEVBQ3hCO0FBRU8sTUFBTSxZQUFZLENBQUMsSUFBYyxPQUN0QyxHQUFHLFNBQVMsR0FBRyxRQUFRLEdBQUcsVUFBVSxHQUFHO0FBRXpDLE1BQU0scUJBQXFCLENBQ3pCLEtBQ0EsTUFDQSxTQUNBLFNBQ0EsWUFDa0I7QUFBQSxLQUNqQixVQUFVLEtBQUssUUFBUSxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLO0FBQUEsS0FDOUMsVUFBVSxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSztBQUFBLEVBQ2pEO0FBRU8sTUFBTSxvQkFBb0IsQ0FDL0IsTUFDQSxXQUN1RDtBQUN2RCxVQUFNLFVBQVUsT0FBTyxRQUFRLEtBQUssT0FDbEMsVUFBVSxPQUFPLFNBQVMsS0FBSztBQUNqQyxXQUFPLENBQUMsS0FBSyxZQUFZLG1CQUFtQixLQUFLLE1BQU0sU0FBUyxTQUFTLE9BQU87QUFBQSxFQUNsRjtBQUVPLE1BQU0sb0JBQ1gsQ0FBQyxTQUNELENBQUMsS0FBSyxZQUNKLG1CQUFtQixLQUFLLE1BQU0sU0FBUyxLQUFLLEdBQUc7QUFFNUMsTUFBTSxlQUFlLENBQUMsSUFBaUIsS0FBb0IsVUFBd0I7QUFDeEYsT0FBRyxNQUFNLFlBQVksYUFBYSxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLGFBQWEsS0FBSztBQUFBLEVBQ3hFO0FBRU8sTUFBTSxlQUFlLENBQzFCLElBQ0EsVUFDQSxhQUNBLFVBQ1M7QUFDVCxPQUFHLE1BQU0sWUFBWSxhQUFhLFNBQVMsQ0FBQyxJQUFJLFdBQVcsS0FBSyxTQUFTLENBQUMsSUFBSSxXQUFXLFlBQ3ZGLFNBQVMsV0FDWDtBQUFBLEVBQ0Y7QUFFTyxNQUFNLGFBQWEsQ0FBQyxJQUFpQixNQUFxQjtBQUMvRCxPQUFHLE1BQU0sVUFBVSxJQUFJLEtBQUs7QUFBQSxFQUM5QjtBQUVPLE1BQU0sZ0JBQWdCLENBQUMsTUFBZ0Q7QUF0RjlFO0FBdUZFLFFBQUksRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFHLFFBQU8sQ0FBQyxFQUFFLFNBQVMsRUFBRSxPQUFRO0FBQy9ELFNBQUksT0FBRSxrQkFBRixtQkFBa0IsR0FBSSxRQUFPLENBQUMsRUFBRSxjQUFjLENBQUMsRUFBRSxTQUFTLEVBQUUsY0FBYyxDQUFDLEVBQUUsT0FBTztBQUN4RjtBQUFBLEVBQ0Y7QUFFTyxNQUFNLGdCQUFnQixDQUFDLE1BQThCLEVBQUUsWUFBWSxLQUFLLEVBQUUsV0FBVztBQUVyRixNQUFNLGlCQUFpQixDQUFDLE1BQThCLEVBQUUsWUFBWSxLQUFLLEVBQUUsV0FBVztBQUV0RixNQUFNLFdBQVcsQ0FBQyxTQUFpQixjQUFvQztBQUM1RSxVQUFNLEtBQUssU0FBUyxjQUFjLE9BQU87QUFDekMsUUFBSSxVQUFXLElBQUcsWUFBWTtBQUM5QixXQUFPO0FBQUEsRUFDVDtBQUVPLFdBQVMsWUFBWSxPQUErQjtBQUN6RCxXQUFPLEdBQUcsTUFBTSxLQUFLLElBQUksTUFBTSxJQUFJO0FBQUEsRUFDckM7QUFPTyxXQUFTLFlBQVksSUFBcUM7QUFDL0QsV0FBTyxHQUFHLFlBQVk7QUFBQSxFQUN4QjtBQUNPLFdBQVMsYUFBYSxJQUFzQztBQUNqRSxXQUFPLEdBQUcsWUFBWTtBQUFBLEVBQ3hCO0FBRU8sV0FBUyxvQkFDZCxLQUNBLFNBQ0EsTUFDQSxRQUNlO0FBQ2YsVUFBTSxNQUFNLFFBQVEsR0FBRztBQUN2QixRQUFJLFNBQVM7QUFDWCxVQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUM7QUFDL0IsVUFBSSxDQUFDLElBQUksS0FBSyxRQUFRLElBQUksSUFBSSxDQUFDO0FBQUEsSUFDakM7QUFDQSxXQUFPO0FBQUEsTUFDTCxPQUFPLE9BQVEsT0FBTyxRQUFRLElBQUksQ0FBQyxJQUFLLEtBQUssUUFBUSxPQUFPLFNBQVMsS0FBSyxRQUFRO0FBQUEsTUFDbEYsT0FBTyxNQUNKLE9BQU8sVUFBVSxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBTSxLQUFLLFFBQ25ELE9BQU8sVUFBVSxLQUFLLFFBQVE7QUFBQSxJQUNsQztBQUFBLEVBQ0Y7QUFFTyxXQUFTLG9CQUFvQixLQUFhLFNBQWtCLE1BQTZCO0FBQzlGLFVBQU0sTUFBTSxRQUFRLEdBQUc7QUFDdkIsUUFBSSxRQUFRLEtBQUssUUFBUSxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUs7QUFDcEQsUUFBSSxDQUFDLFFBQVMsU0FBUSxLQUFLLFFBQVEsS0FBSyxRQUFRLElBQUk7QUFFcEQsV0FBTztBQUFBLEVBQ1Q7QUFFTyxXQUFTLGFBQWEsTUFBZSxLQUE2QjtBQUN2RSxXQUNFLEtBQUssUUFBUSxJQUFJLENBQUMsS0FDbEIsS0FBSyxPQUFPLElBQUksQ0FBQyxLQUNqQixLQUFLLE9BQU8sS0FBSyxRQUFRLElBQUksQ0FBQyxLQUM5QixLQUFLLE1BQU0sS0FBSyxTQUFTLElBQUksQ0FBQztBQUFBLEVBRWxDO0FBRU8sV0FBUyxlQUNkLEtBQ0EsU0FDQSxNQUNBLFFBQ29CO0FBQ3BCLFFBQUksT0FBTyxLQUFLLE1BQU8sS0FBSyxTQUFTLElBQUksQ0FBQyxJQUFJLE9BQU8sUUFBUyxPQUFPLEtBQUs7QUFDMUUsUUFBSSxRQUFTLFFBQU8sS0FBSyxRQUFRLElBQUk7QUFDckMsUUFBSSxPQUFPLEtBQUssTUFBTyxLQUFLLFNBQVMsSUFBSSxDQUFDLElBQUksT0FBTyxPQUFRLE9BQU8sTUFBTTtBQUMxRSxRQUFJLENBQUMsUUFBUyxRQUFPLEtBQUssUUFBUSxJQUFJO0FBQ3RDLFdBQU8sUUFBUSxLQUFLLE9BQU8sS0FBSyxTQUFTLFFBQVEsS0FBSyxPQUFPLEtBQUssUUFDOUQsUUFBUSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQ3BCO0FBQUEsRUFDTjtBQUVPLFdBQVMscUJBQ2QsS0FDQSxPQUNBLFFBQ3NCO0FBQ3RCLGVBQVcsU0FBUyxRQUFRO0FBQzFCLGlCQUFXLFFBQVEsT0FBTztBQUN4QixjQUFNLFFBQVEsRUFBRSxPQUFPLEtBQUssR0FDMUIsWUFBWSxPQUFPLElBQUksWUFBWSxLQUFLLENBQUM7QUFDM0MsWUFBSSxhQUFhLGFBQWEsV0FBVyxHQUFHLEVBQUcsUUFBTztBQUFBLE1BQ3hEO0FBQUEsSUFDRjtBQUNBO0FBQUEsRUFDRjtBQUVPLFdBQVMsZUFDZCxNQUNBLEtBQ0EsU0FDQSxNQUNBLGFBQ29CO0FBQ3BCLFVBQU0sTUFBTSxZQUFZLFFBQVEsS0FBSyxPQUNuQyxNQUFNLFlBQVksU0FBUyxLQUFLO0FBQ2xDLFFBQUksQ0FBQyxPQUFPLENBQUMsSUFBSztBQUNsQixRQUFJLFFBQVEsT0FBTyxZQUFZLFFBQVE7QUFDdkMsUUFBSSxRQUFTLFFBQU8sS0FBSyxRQUFRLElBQUk7QUFDckMsUUFBSSxRQUFRLE1BQU0sWUFBWSxPQUFPO0FBQ3JDLFFBQUksQ0FBQyxRQUFTLFFBQU8sS0FBSyxRQUFRLElBQUk7QUFDdEMsV0FBTyxDQUFDLE1BQU0sSUFBSTtBQUFBLEVBQ3BCOzs7QUNuTU8sV0FBUyxVQUFVLEdBQWtCLE9BQWlCLE1BQU0sR0FBUztBQUMxRSxVQUFNLE9BQU8sRUFBRSxNQUFNLFFBQVEsSUFBSSxNQUFNLEtBQUssR0FDMUMsUUFDRyxFQUFFLE1BQU0sTUFBTSxTQUFTLE1BQU0sSUFBSSxJQUFJLE1BQU0sT0FBTyxFQUFFLFVBQVUsYUFBYSxNQUFNLElBQUksTUFDdEYsTUFBTTtBQUNWLFFBQUksUUFBUSxFQUFFLE1BQU0sTUFBTSxTQUFTLElBQUksRUFBRyxNQUFLLElBQUksT0FBTyxLQUFLLElBQUksSUFBSSxLQUFLLEtBQUssR0FBRztBQUFBLEVBQ3RGO0FBRU8sV0FBUyxlQUFlLEdBQWtCLE9BQWlCLE1BQU0sR0FBUztBQUMvRSxVQUFNLE9BQU8sRUFBRSxNQUFNLFFBQVEsSUFBSSxNQUFNLEtBQUssR0FDMUMsUUFDRyxFQUFFLE1BQU0sTUFBTSxTQUFTLE1BQU0sSUFBSSxJQUFJLE1BQU0sT0FBTyxFQUFFLFVBQVUsYUFBYSxNQUFNLElBQUksTUFDdEYsTUFBTSxNQUNSLE1BQU0sNkJBQU0sSUFBSTtBQUNsQixRQUFJLFFBQVEsSUFBSyxNQUFLLElBQUksTUFBTSxLQUFLLElBQUksTUFBTSxLQUFLLENBQUMsQ0FBQztBQUFBLEVBQ3hEO0FBRU8sV0FBUyxXQUFXLEdBQWtCLFFBQTJCO0FBckJ4RTtBQXNCRSxXQUFPLFVBQVUsT0FBTyxhQUFhLENBQUMsQ0FBQyxFQUFFLFVBQVUsT0FBTztBQUMxRCxRQUFJLFNBQVMsT0FBTztBQUNwQixXQUFPLFFBQVE7QUFDYixZQUFNLFVBQVUsT0FBTyxtQkFDckIsUUFBUSxFQUFFLE1BQU0sUUFBUSxRQUFRLE9BQU8sUUFBUSxRQUFRLEdBQ3ZELFFBQU0sT0FBRSxNQUFNLFFBQVEsSUFBSSxNQUFNLEtBQUssTUFBL0IsbUJBQWtDLElBQUksTUFBTSxVQUFTLEdBQzNELGFBQWEsQ0FBQyxDQUFDLEVBQUUsaUJBQWlCLFVBQVUsT0FBTyxFQUFFLGFBQWEsS0FBSyxDQUFDLEVBQUUsVUFBVTtBQUV0RixhQUFPLFVBQVU7QUFBQSxRQUNmO0FBQUEsU0FDQyxFQUFFLGdCQUFnQixVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsY0FBYztBQUFBLE1BQ2pFO0FBQ0EsYUFBTyxVQUFVO0FBQUEsUUFDZjtBQUFBLFFBQ0EsRUFBRSxnQkFBZ0IsVUFBVSxFQUFFLGdCQUFnQixFQUFFLGFBQWE7QUFBQSxNQUMvRDtBQUNBLGFBQU8sVUFBVSxPQUFPLFdBQVcsQ0FBQyxDQUFDLEVBQUUsU0FBUyxTQUFTLFVBQVUsRUFBRSxTQUFTLE9BQU8sS0FBSyxDQUFDO0FBQzNGLGFBQU8sVUFBVTtBQUFBLFFBQ2Y7QUFBQSxRQUNBLENBQUMsQ0FBQyxFQUFFLGFBQWEsV0FBVyxVQUFVLEVBQUUsYUFBYSxRQUFRLE9BQU8sS0FBSztBQUFBLE1BQzNFO0FBQ0EsYUFBTyxRQUFRLEtBQUssSUFBSSxTQUFTO0FBQ2pDLGVBQVMsT0FBTztBQUFBLElBQ2xCO0FBQUEsRUFDRjs7O0FDekNPLFdBQVMsa0JBQWtCLE9BQTRCO0FBQzVELFVBQU0sY0FBYyxTQUFTLE1BQU0sV0FBVztBQUM5QyxVQUFNLFVBQVUsVUFDZCxNQUFNLFVBQVUsVUFDaEIsTUFBTSxVQUFVLFVBQ2hCLE1BQU0sVUFDTixNQUFNLFdBQ04sTUFBTSxnQkFDSjtBQUFBLEVBQ047QUFFTyxXQUFTLE1BQU0sT0FBNEI7QUFDaEQsYUFBUyxLQUFLO0FBQ2QsaUJBQWEsS0FBSztBQUNsQixpQkFBYSxLQUFLO0FBQ2xCLG9CQUFnQixLQUFLO0FBQ3JCLFVBQU0sVUFBVSxVQUFVLE1BQU0sVUFBVSxVQUFVLE1BQU0sVUFBVTtBQUFBLEVBQ3RFO0FBRU8sV0FBUyxVQUFVLE9BQXNCLFFBQTZCO0FBQzNFLGVBQVcsQ0FBQyxLQUFLLEtBQUssS0FBSyxRQUFRO0FBQ2pDLFVBQUksTUFBTyxPQUFNLE9BQU8sSUFBSSxLQUFLLEtBQUs7QUFBQSxVQUNqQyxPQUFNLE9BQU8sT0FBTyxHQUFHO0FBQUEsSUFDOUI7QUFBQSxFQUNGO0FBRU8sV0FBUyxVQUFVLE9BQXNCLGFBQWtEO0FBQ2hHLFFBQUksTUFBTSxRQUFRLFdBQVcsR0FBRztBQUM5QixZQUFNLFNBQVM7QUFBQSxJQUNqQixPQUFPO0FBQ0wsVUFBSSxnQkFBZ0IsS0FBTSxlQUFjLE1BQU07QUFDOUMsVUFBSSxhQUFhO0FBQ2YsY0FBTSxTQUFtQixDQUFDO0FBQzFCLG1CQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssTUFBTSxRQUFRO0FBQ2pDLGNBQUksTUFBTSxVQUFVLFdBQVcsU0FBUyxFQUFFLElBQUksS0FBSyxFQUFFLFVBQVUsWUFBYSxRQUFPLEtBQUssQ0FBQztBQUFBLFFBQzNGO0FBQ0EsY0FBTSxTQUFTO0FBQUEsTUFDakIsTUFBTyxPQUFNLFNBQVM7QUFBQSxJQUN4QjtBQUFBLEVBQ0Y7QUFFQSxXQUFTLFdBQVcsT0FBc0IsTUFBYyxNQUFjLE1BQXFCO0FBQ3pGLGlCQUFhLEtBQUs7QUFDbEIsVUFBTSxXQUFXLFVBQVUsRUFBRSxNQUFNLE1BQU0sS0FBSztBQUM5QyxxQkFBaUIsTUFBTSxXQUFXLE9BQU8sS0FBSyxNQUFNLE1BQU0sSUFBSTtBQUFBLEVBQ2hFO0FBRU8sV0FBUyxhQUFhLE9BQTRCO0FBQ3ZELFFBQUksTUFBTSxXQUFXLFNBQVM7QUFDNUIsWUFBTSxXQUFXLFVBQVU7QUFDM0IsdUJBQWlCLE1BQU0sV0FBVyxPQUFPLEtBQUs7QUFBQSxJQUNoRDtBQUFBLEVBQ0Y7QUFFQSxXQUFTLFdBQVcsT0FBc0IsT0FBaUIsS0FBYSxNQUFxQjtBQUMzRixpQkFBYSxLQUFLO0FBQ2xCLFVBQU0sYUFBYSxVQUFVLEVBQUUsT0FBTyxLQUFLLEtBQUs7QUFDaEQscUJBQWlCLE1BQU0sYUFBYSxPQUFPLEtBQUssT0FBTyxLQUFLLElBQUk7QUFBQSxFQUNsRTtBQUVPLFdBQVMsYUFBYSxPQUE0QjtBQUN2RCxRQUFJLE1BQU0sYUFBYSxTQUFTO0FBQzlCLFlBQU0sYUFBYSxVQUFVO0FBQzdCLHVCQUFpQixNQUFNLGFBQWEsT0FBTyxLQUFLO0FBQUEsSUFDbEQ7QUFBQSxFQUNGO0FBRU8sV0FBUyxTQUNkLE9BQ0EsTUFDQSxNQUNBLE1BQ29CO0FBQ3BCLFVBQU0sWUFBWSxNQUFNLE9BQU8sSUFBSSxJQUFJLEdBQ3JDLFlBQVksTUFBTSxPQUFPLElBQUksSUFBSTtBQUNuQyxRQUFJLFNBQVMsUUFBUSxDQUFDLFVBQVcsUUFBTztBQUN4QyxVQUFNLFdBQVcsYUFBYSxVQUFVLFVBQVUsVUFBVSxRQUFRLFlBQVksUUFDOUUsWUFBWSxRQUFRLGFBQWEsT0FBTyxTQUFTO0FBQ25ELFFBQUksU0FBUyxNQUFNLFlBQVksU0FBUyxNQUFNLFNBQVUsVUFBUyxLQUFLO0FBQ3RFLFVBQU0sT0FBTyxJQUFJLE1BQU0sYUFBYSxTQUFTO0FBQzdDLFVBQU0sT0FBTyxPQUFPLElBQUk7QUFDeEIsVUFBTSxZQUFZLENBQUMsTUFBTSxJQUFJO0FBQzdCLFVBQU0sU0FBUztBQUNmLHFCQUFpQixNQUFNLE9BQU8sTUFBTSxNQUFNLE1BQU0sTUFBTSxRQUFRO0FBQzlELHFCQUFpQixNQUFNLE9BQU8sTUFBTTtBQUNwQyxXQUFPLFlBQVk7QUFBQSxFQUNyQjtBQUVPLFdBQVMsU0FDZCxPQUNBLE9BQ0EsS0FDQSxNQUNTO0FBbEdYO0FBbUdFLFVBQU0sZUFBYSxXQUFNLE1BQU0sUUFBUSxJQUFJLE1BQU0sS0FBSyxNQUFuQyxtQkFBc0MsSUFBSSxNQUFNLFVBQVM7QUFDNUUsUUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLFVBQVUsTUFBTyxRQUFPO0FBQ2xELFVBQU0sWUFBWSxRQUFRLGFBQWEsT0FBTyxLQUFLO0FBQ25ELFFBQ0UsUUFBUSxNQUFNLFlBQ2IsQ0FBQyxNQUFNLFVBQVUsU0FDaEIsZUFBZSxLQUNmLE1BQU0saUJBQ04sVUFBVSxNQUFNLGVBQWUsS0FBSztBQUV0QyxlQUFTLEtBQUs7QUFDaEIsVUFBTSxPQUFPLElBQUksS0FBSyxhQUFhLEtBQUs7QUFDeEMsVUFBTSxZQUFZLENBQUMsR0FBRztBQUN0QixVQUFNLFNBQVM7QUFDZixRQUFJLENBQUMsTUFBTSxVQUFVLE1BQU8sZ0JBQWUsT0FBTyxLQUFLO0FBQ3ZELHFCQUFpQixNQUFNLE9BQU8sTUFBTSxPQUFPLEtBQUssSUFBSTtBQUNwRCxxQkFBaUIsTUFBTSxPQUFPLE1BQU07QUFDcEMsV0FBTztBQUFBLEVBQ1Q7QUFFQSxXQUFTLGFBQ1AsT0FDQSxNQUNBLE1BQ0EsTUFDb0I7QUFDcEIsVUFBTSxTQUFTLFNBQVMsT0FBTyxNQUFNLE1BQU0sSUFBSTtBQUMvQyxRQUFJLFFBQVE7QUFDVixZQUFNLFFBQVEsUUFBUTtBQUN0QixZQUFNLFVBQVUsUUFBUTtBQUN4QixZQUFNLFlBQVksU0FBUyxNQUFNLFNBQVM7QUFDMUMsWUFBTSxVQUFVLFVBQVU7QUFBQSxJQUM1QjtBQUNBLFdBQU87QUFBQSxFQUNUO0FBRUEsV0FBUyxhQUFhLE9BQXNCLE9BQWlCLEtBQWEsTUFBd0I7QUFDaEcsVUFBTSxTQUFTLFNBQVMsT0FBTyxPQUFPLEtBQUssSUFBSTtBQUMvQyxRQUFJLFFBQVE7QUFDVixZQUFNLFFBQVEsUUFBUTtBQUN0QixZQUFNLFVBQVUsUUFBUTtBQUN4QixZQUFNLFlBQVksU0FBUyxNQUFNLFNBQVM7QUFDMUMsWUFBTSxVQUFVLFVBQVU7QUFBQSxJQUM1QjtBQUNBLFdBQU87QUFBQSxFQUNUO0FBRU8sV0FBUyxTQUNkLE9BQ0EsT0FDQSxLQUNBLE1BQ1M7QUFDVCxVQUFNLFdBQVcsUUFBUSxNQUFNLFVBQVUsbUJBQW1CLE9BQU8sR0FBRztBQUN0RSxRQUFJLFFBQVEsT0FBTyxPQUFPLEdBQUcsR0FBRztBQUM5QixZQUFNLFNBQVMsYUFBYSxPQUFPLE9BQU8sS0FBSyxRQUFRO0FBQ3ZELFVBQUksUUFBUTtBQUNWLGlCQUFTLEtBQUs7QUFDZCx5QkFBaUIsTUFBTSxVQUFVLE9BQU8sT0FBTyxPQUFPLEtBQUssVUFBVTtBQUFBLFVBQ25FLFNBQVM7QUFBQSxRQUNYLENBQUM7QUFDRCxlQUFPO0FBQUEsTUFDVDtBQUFBLElBQ0YsV0FBVyxXQUFXLE9BQU8sT0FBTyxHQUFHLEdBQUc7QUFDeEMsaUJBQVcsT0FBTyxPQUFPLEtBQUssUUFBUTtBQUN0QyxlQUFTLEtBQUs7QUFDZCxhQUFPO0FBQUEsSUFDVDtBQUNBLGFBQVMsS0FBSztBQUNkLFdBQU87QUFBQSxFQUNUO0FBRU8sV0FBUyxTQUNkLE9BQ0EsTUFDQSxNQUNBLE1BQ1M7QUFDVCxVQUFNLFdBQVcsUUFBUSxNQUFNLFVBQVUsbUJBQW1CLE1BQU0sSUFBSTtBQUN0RSxRQUFJLFFBQVEsT0FBTyxNQUFNLElBQUksR0FBRztBQUM5QixZQUFNLFNBQVMsYUFBYSxPQUFPLE1BQU0sTUFBTSxRQUFRO0FBQ3ZELFVBQUksUUFBUTtBQUNWLGlCQUFTLEtBQUs7QUFDZCxjQUFNLFdBQTRCO0FBQUEsVUFDaEMsU0FBUztBQUFBLFFBQ1g7QUFDQSxZQUFJLFdBQVcsS0FBTSxVQUFTLFdBQVc7QUFDekMseUJBQWlCLE1BQU0sUUFBUSxPQUFPLE9BQU8sTUFBTSxNQUFNLFVBQVUsUUFBUTtBQUMzRSxlQUFPO0FBQUEsTUFDVDtBQUFBLElBQ0YsV0FBVyxXQUFXLE9BQU8sTUFBTSxJQUFJLEdBQUc7QUFDeEMsaUJBQVcsT0FBTyxNQUFNLE1BQU0sUUFBUTtBQUN0QyxlQUFTLEtBQUs7QUFDZCxhQUFPO0FBQUEsSUFDVDtBQUNBLGFBQVMsS0FBSztBQUNkLFdBQU87QUFBQSxFQUNUO0FBRU8sV0FBUyxvQkFBb0IsT0FBc0IsT0FBaUIsS0FBc0I7QUFDL0YsVUFBTSxnQkFBZ0IsYUFBYSxPQUFPLEtBQUs7QUFDL0MsUUFBSSxNQUFNLFlBQVksTUFBTSxVQUFVLFdBQVcsQ0FBQyxjQUFlLFFBQU87QUFFeEUsVUFBTSxVQUFVLFVBQVU7QUFBQSxNQUN4QjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQSxTQUFTLENBQUMsQ0FBQyxNQUFNLFVBQVU7QUFBQSxJQUM3QjtBQUNBLFVBQU0sVUFBVTtBQUVoQixXQUFPO0FBQUEsRUFDVDtBQUVPLFdBQVMsb0JBQW9CLE9BQXNCLE9BQWlCLEtBQXNCO0FBQy9GLFFBQ0UsZUFBZSxPQUFPLE9BQU8sR0FBRyxNQUMvQixRQUFRLE9BQU8sT0FBTyxHQUFHLEtBQUssV0FBVyxPQUFPLE9BQU8sR0FBRyxJQUMzRDtBQUNBLFVBQUksb0JBQW9CLE9BQU8sT0FBTyxHQUFHLEdBQUc7QUFDMUMseUJBQWlCLE1BQU0sVUFBVSxPQUFPLFNBQVM7QUFDakQsZUFBTztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFFTyxXQUFTLG9CQUFvQixPQUFzQixNQUFjLE1BQXVCO0FBQzdGLFFBQ0UsZUFBZSxPQUFPLE1BQU0sSUFBSSxNQUMvQixRQUFRLE9BQU8sTUFBTSxJQUFJLEtBQUssV0FBVyxPQUFPLE1BQU0sSUFBSSxJQUMzRDtBQUNBLFlBQU0sUUFBUSxNQUFNLE9BQU8sSUFBSSxJQUFJO0FBQ25DLFVBQUksU0FBUyxvQkFBb0IsT0FBTyxPQUFPLElBQUksR0FBRztBQUNwRCx5QkFBaUIsTUFBTSxVQUFVLE9BQU8sU0FBUztBQUNqRCxlQUFPO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUVBLFdBQVMsYUFBYSxHQUFrQixPQUF1QztBQUM3RSxVQUFNLFdBQVcsRUFBRSxVQUFVLFdBQVcsTUFBTSxJQUFJO0FBQ2xELFdBQU8sYUFBYSxTQUFZLEVBQUUsT0FBTyxNQUFNLE9BQU8sTUFBTSxTQUFTLElBQUk7QUFBQSxFQUMzRTtBQUVPLFdBQVMsWUFBWSxPQUFzQixLQUFtQjtBQUNuRSxRQUFJLE1BQU0sT0FBTyxPQUFPLEdBQUcsRUFBRyxrQkFBaUIsTUFBTSxPQUFPLE1BQU07QUFBQSxFQUNwRTtBQUVPLFdBQVMsYUFDZCxPQUNBLEtBQ0EsTUFDQSxPQUNNO0FBQ04scUJBQWlCLE1BQU0sT0FBTyxRQUFRLEdBQUc7QUFHekMsUUFBSSxDQUFDLE1BQU0sVUFBVSxXQUFXLE1BQU0sYUFBYSxLQUFLO0FBQ3RELHVCQUFpQixNQUFNLE9BQU8sVUFBVSxHQUFHO0FBQzNDLGVBQVMsS0FBSztBQUNkO0FBQUEsSUFDRjtBQUdBLFFBQ0UsTUFBTSxXQUFXLFdBQ2pCLFNBQ0MsTUFBTSxXQUFXLGVBQWUsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLE9BQ3hFO0FBQ0EsVUFBSSxNQUFNLGlCQUFpQixTQUFTLE9BQU8sTUFBTSxlQUFlLEtBQUssSUFBSSxFQUFHO0FBQUEsZUFDbkUsTUFBTSxZQUFZLFNBQVMsT0FBTyxNQUFNLFVBQVUsS0FBSyxJQUFJLEVBQUc7QUFBQSxJQUN6RTtBQUVBLFNBQ0csTUFBTSxXQUFXLFdBQVcsTUFBTSxVQUFVLFdBQVcsV0FDdkQsVUFBVSxPQUFPLEdBQUcsS0FBSyxhQUFhLE9BQU8sR0FBRyxJQUNqRDtBQUNBLGtCQUFZLE9BQU8sR0FBRztBQUFBLElBQ3hCO0FBQUEsRUFDRjtBQUVPLFdBQVMsWUFDZCxPQUNBLE9BQ0EsT0FDQSxPQUNBLEtBQ007QUFDTixxQkFBaUIsTUFBTSxPQUFPLGFBQWEsS0FBSztBQUVoRCxRQUFJLE1BQU0sV0FBVyxtQkFBbUIsTUFBTSxVQUFVLFNBQVMsTUFBTSxlQUFlO0FBQ3BGLGdCQUFVLE9BQU8sRUFBRSxNQUFNLE1BQU0sY0FBYyxNQUFNLE9BQU8sTUFBTSxNQUFNLENBQUM7QUFDdkUsdUJBQWlCLE1BQU0sT0FBTyxNQUFNO0FBQ3BDLGVBQVMsS0FBSztBQUFBLElBQ2hCLFdBQ0UsQ0FBQyxPQUNELENBQUMsTUFBTSxVQUFVLFdBQ2pCLE1BQU0saUJBQ04sVUFBVSxNQUFNLGVBQWUsS0FBSyxHQUNwQztBQUNBLHVCQUFpQixNQUFNLE9BQU8sZUFBZSxLQUFLO0FBQ2xELGVBQVMsS0FBSztBQUFBLElBQ2hCLFlBQ0csTUFBTSxXQUFXLFdBQVcsTUFBTSxVQUFVLFdBQVcsV0FDdkQsWUFBWSxPQUFPLE9BQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxlQUFlLE9BQU8sS0FBSyxJQUNsRTtBQUNBLHVCQUFpQixPQUFPLEtBQUs7QUFDN0IsWUFBTSxVQUFVLFFBQVEsQ0FBQyxDQUFDO0FBQUEsSUFDNUIsT0FBTztBQUNMLGVBQVMsS0FBSztBQUFBLElBQ2hCO0FBQUEsRUFDRjtBQUVPLFdBQVMsWUFBWSxPQUFzQixLQUFtQjtBQUNuRSxhQUFTLEtBQUs7QUFDZCxVQUFNLFdBQVc7QUFDakIsZ0JBQVksS0FBSztBQUFBLEVBQ25CO0FBRU8sV0FBUyxpQkFBaUIsT0FBc0IsT0FBdUI7QUFDNUUsYUFBUyxLQUFLO0FBQ2QsVUFBTSxnQkFBZ0I7QUFDdEIsZ0JBQVksS0FBSztBQUFBLEVBQ25CO0FBRU8sV0FBUyxZQUFZLE9BQTRCO0FBQ3RELFVBQU0sV0FBVyxRQUFRLE1BQU0sYUFBYSxRQUFRO0FBRXBELFFBQUksTUFBTSxZQUFZLGFBQWEsT0FBTyxNQUFNLFFBQVEsS0FBSyxNQUFNLFdBQVc7QUFDNUUsWUFBTSxXQUFXLFFBQVEsTUFBTSxXQUFXLFNBQVMsTUFBTSxVQUFVLE1BQU0sTUFBTTtBQUFBLGFBRS9FLE1BQU0saUJBQ04sZUFBZSxPQUFPLE1BQU0sYUFBYSxLQUN6QyxNQUFNLGFBQWE7QUFFbkIsWUFBTSxhQUFhLFFBQVEsTUFBTSxhQUFhLFNBQVMsTUFBTSxlQUFlLE1BQU0sTUFBTTtBQUFBLEVBQzVGO0FBRU8sV0FBUyxTQUFTLE9BQTRCO0FBQ25ELFVBQU0sV0FDSixNQUFNLGdCQUNOLE1BQU0sV0FBVyxRQUNqQixNQUFNLGFBQWEsUUFDbkIsTUFBTSxVQUFVLFVBQ2Q7QUFBQSxFQUNOO0FBRUEsV0FBUyxVQUFVLE9BQXNCLE1BQXVCO0FBQzlELFVBQU0sUUFBUSxNQUFNLE9BQU8sSUFBSSxJQUFJO0FBQ25DLFdBQ0UsQ0FBQyxDQUFDLFVBQ0QsTUFBTSxnQkFBZ0IsVUFDcEIsTUFBTSxnQkFBZ0IsTUFBTSxTQUFTLE1BQU0sY0FBYyxNQUFNO0FBQUEsRUFFdEU7QUFFQSxXQUFTLFlBQVksT0FBc0IsT0FBaUIsT0FBeUI7QUFyV3JGO0FBc1dFLFlBQ0csU0FBUyxDQUFDLEdBQUMsV0FBTSxNQUFNLFFBQVEsSUFBSSxNQUFNLEtBQUssTUFBbkMsbUJBQXNDLElBQUksTUFBTSxZQUMzRCxNQUFNLGdCQUFnQixVQUNwQixNQUFNLGdCQUFnQixNQUFNLFNBQVMsTUFBTSxjQUFjLE1BQU07QUFBQSxFQUV0RTtBQUVPLFdBQVMsUUFBUSxPQUFzQixNQUFjLE1BQXVCO0FBN1duRjtBQThXRSxXQUNFLFNBQVMsUUFDVCxVQUFVLE9BQU8sSUFBSSxNQUNwQixNQUFNLFFBQVEsUUFBUSxDQUFDLEdBQUMsaUJBQU0sUUFBUSxVQUFkLG1CQUFxQixJQUFJLFVBQXpCLG1CQUFnQyxTQUFTO0FBQUEsRUFFdEU7QUFFTyxXQUFTLFFBQVEsT0FBc0IsT0FBaUIsTUFBdUI7QUFyWHRGO0FBc1hFLFdBQ0UsWUFBWSxPQUFPLE9BQU8sTUFBTSxVQUFVLEtBQUssTUFDOUMsTUFBTSxVQUFVLFFBQ2YsTUFBTSxVQUFVLFNBQ2hCLENBQUMsR0FBQyxpQkFBTSxVQUFVLFVBQWhCLG1CQUF1QixJQUFJLFlBQVksS0FBSyxPQUE1QyxtQkFBZ0QsU0FBUztBQUFBLEVBRWpFO0FBRUEsV0FBUyxlQUFlLE9BQXNCLE1BQWMsTUFBdUI7QUFDakYsVUFBTSxRQUFRLE1BQU0sT0FBTyxJQUFJLElBQUk7QUFDbkMsV0FBTyxDQUFDLENBQUMsU0FBUyxNQUFNLFVBQVUsb0JBQW9CLE1BQU0sSUFBSTtBQUFBLEVBQ2xFO0FBRUEsV0FBUyxlQUFlLE9BQXNCLE9BQWlCLEtBQXNCO0FBQ25GLFdBQU8sQ0FBQyxNQUFNLFVBQVUsU0FBUyxNQUFNLFVBQVUsb0JBQW9CLE9BQU8sR0FBRztBQUFBLEVBQ2pGO0FBRUEsV0FBUyxhQUFhLE9BQXNCLE1BQXVCO0FBQ2pFLFVBQU0sUUFBUSxNQUFNLE9BQU8sSUFBSSxJQUFJO0FBQ25DLFdBQ0UsQ0FBQyxDQUFDLFNBQ0YsTUFBTSxXQUFXLFdBQ2pCLE1BQU0sZ0JBQWdCLE1BQU0sU0FDNUIsTUFBTSxjQUFjLE1BQU07QUFBQSxFQUU5QjtBQUVBLFdBQVMsZUFBZSxPQUFzQixPQUEwQjtBQWpaeEU7QUFrWkUsV0FDRSxDQUFDLEdBQUMsV0FBTSxNQUFNLFFBQVEsSUFBSSxNQUFNLEtBQUssTUFBbkMsbUJBQXNDLElBQUksTUFBTSxVQUNsRCxNQUFNLGFBQWEsV0FDbkIsTUFBTSxnQkFBZ0IsTUFBTSxTQUM1QixNQUFNLGNBQWMsTUFBTTtBQUFBLEVBRTlCO0FBRU8sV0FBUyxXQUFXLE9BQXNCLE1BQWMsTUFBdUI7QUFDcEYsV0FDRSxTQUFTLFFBQ1QsYUFBYSxPQUFPLElBQUksS0FDeEIsQ0FBQyxDQUFDLE1BQU0sV0FBVyxZQUNuQixNQUFNLFdBQVcsU0FBUyxNQUFNLE1BQU0sTUFBTSxFQUFFLFNBQVMsSUFBSTtBQUFBLEVBRS9EO0FBRU8sV0FBUyxXQUFXLE9BQXNCLE9BQWlCLE1BQXVCO0FBQ3ZGLFVBQU0sWUFBWSxNQUFNLE9BQU8sSUFBSSxJQUFJO0FBQ3ZDLFdBQ0UsZUFBZSxPQUFPLEtBQUssTUFDMUIsQ0FBQyxhQUFhLFVBQVUsVUFBVSxNQUFNLGdCQUN6QyxDQUFDLENBQUMsTUFBTSxhQUFhLFlBQ3JCLE1BQU0sYUFBYSxTQUFTLE9BQU8sTUFBTSxNQUFNLEVBQUUsU0FBUyxJQUFJO0FBQUEsRUFFbEU7QUFFTyxXQUFTLFlBQVksT0FBc0IsT0FBMEI7QUFDMUUsV0FDRSxNQUFNLFVBQVUsWUFDZixNQUFNLGdCQUFnQixVQUNwQixNQUFNLGdCQUFnQixNQUFNLFVBQzFCLE1BQU0sY0FBYyxNQUFNLFNBQVMsTUFBTSxXQUFXO0FBQUEsRUFFN0Q7QUFFTyxXQUFTLFlBQVksT0FBK0I7QUFDekQsVUFBTUEsUUFBTyxNQUFNLFdBQVc7QUFDOUIsUUFBSSxDQUFDQSxNQUFNLFFBQU87QUFDbEIsVUFBTSxPQUFPQSxNQUFLLE1BQ2hCLE9BQU9BLE1BQUssTUFDWixPQUFPQSxNQUFLO0FBQ2QsUUFBSSxVQUFVO0FBQ2QsUUFBSSxRQUFRLE9BQU8sTUFBTSxJQUFJLEdBQUc7QUFDOUIsWUFBTSxTQUFTLGFBQWEsT0FBTyxNQUFNLE1BQU0sSUFBSTtBQUNuRCxVQUFJLFFBQVE7QUFDVixjQUFNLFdBQTRCLEVBQUUsU0FBUyxLQUFLO0FBQ2xELFlBQUksV0FBVyxLQUFNLFVBQVMsV0FBVztBQUN6Qyx5QkFBaUIsTUFBTSxRQUFRLE9BQU8sT0FBTyxNQUFNLE1BQU0sTUFBTSxRQUFRO0FBQ3ZFLGtCQUFVO0FBQUEsTUFDWjtBQUFBLElBQ0Y7QUFDQSxpQkFBYSxLQUFLO0FBQ2xCLFdBQU87QUFBQSxFQUNUO0FBRU8sV0FBUyxZQUFZLE9BQStCO0FBQ3pELFVBQU0sT0FBTyxNQUFNLGFBQWE7QUFDaEMsUUFBSSxDQUFDLEtBQU0sUUFBTztBQUNsQixVQUFNLFFBQVEsS0FBSyxPQUNqQixNQUFNLEtBQUssS0FDWCxPQUFPLEtBQUs7QUFDZCxRQUFJLFVBQVU7QUFDZCxRQUFJLFFBQVEsT0FBTyxPQUFPLEdBQUcsR0FBRztBQUM5QixVQUFJLGFBQWEsT0FBTyxPQUFPLEtBQUssSUFBSSxHQUFHO0FBQ3pDLHlCQUFpQixNQUFNLFVBQVUsT0FBTyxPQUFPLE9BQU8sS0FBSyxNQUFNO0FBQUEsVUFDL0QsU0FBUztBQUFBLFFBQ1gsQ0FBQztBQUNELGtCQUFVO0FBQUEsTUFDWjtBQUFBLElBQ0Y7QUFDQSxpQkFBYSxLQUFLO0FBQ2xCLFdBQU87QUFBQSxFQUNUO0FBRU8sV0FBUyxpQkFBaUIsT0FBNEI7QUFDM0QsaUJBQWEsS0FBSztBQUNsQixpQkFBYSxLQUFLO0FBQ2xCLGFBQVMsS0FBSztBQUFBLEVBQ2hCO0FBRU8sV0FBUyxnQkFBZ0IsT0FBNEI7QUFDMUQsUUFBSSxDQUFDLE1BQU0sVUFBVSxRQUFTO0FBRTlCLGFBQVMsS0FBSztBQUNkLFVBQU0sVUFBVSxVQUFVO0FBQzFCLFVBQU0sVUFBVTtBQUNoQixxQkFBaUIsTUFBTSxVQUFVLE9BQU8sTUFBTTtBQUFBLEVBQ2hEO0FBRU8sV0FBUyxLQUFLLE9BQTRCO0FBQy9DLFVBQU0sY0FDSixNQUFNLFFBQVEsUUFDZCxNQUFNLFVBQVUsUUFDaEIsTUFBTSxVQUFVLFVBQ2hCLE1BQU0sVUFBVSxVQUNoQixNQUFNLFVBQVUsVUFDaEIsTUFBTSxVQUNKO0FBQ0oscUJBQWlCLEtBQUs7QUFBQSxFQUN4Qjs7O0FDbGZPLFdBQVMsZ0JBQWdCLFdBQXdDO0FBQ3RFLFVBQU1DLFNBQVEsVUFBVSxNQUFNLEdBQUcsR0FDL0IsWUFBWUEsT0FBTSxDQUFDLEVBQUUsTUFBTSxFQUFFO0FBQy9CLFFBQUksV0FBVyxHQUNiLE1BQU07QUFDUixlQUFXLEtBQUssV0FBVztBQUN6QixZQUFNLEtBQUssRUFBRSxXQUFXLENBQUM7QUFDekIsVUFBSSxLQUFLLE1BQU0sS0FBSyxHQUFJLE9BQU0sTUFBTSxLQUFLLEtBQUs7QUFBQSxlQUNyQyxNQUFNLEtBQUs7QUFDbEIsb0JBQVksTUFBTTtBQUNsQixjQUFNO0FBQUEsTUFDUjtBQUFBLElBQ0Y7QUFDQSxnQkFBWTtBQUNaLFdBQU8sRUFBRSxPQUFPLFVBQVUsT0FBT0EsT0FBTSxPQUFPO0FBQUEsRUFDaEQ7QUFFTyxXQUFTLFlBQ2QsTUFDQSxNQUNBLGFBQ1c7QUFDWCxVQUFNLGFBQWEsZUFBZSxxQkFDaEMsU0FBb0Isb0JBQUksSUFBSTtBQUM5QixRQUFJLElBQUksS0FBSyxRQUFRLEdBQ25CLElBQUk7QUFDTixhQUFTLElBQUksR0FBRyxJQUFJLEtBQUssUUFBUSxLQUFLO0FBQ3BDLGNBQVEsS0FBSyxDQUFDLEdBQUc7QUFBQSxRQUNmLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFDSCxpQkFBTztBQUFBLFFBQ1QsS0FBSztBQUNILFlBQUU7QUFDRixjQUFJLElBQUksS0FBSyxRQUFRLEVBQUcsUUFBTztBQUMvQixjQUFJLEtBQUssUUFBUTtBQUNqQjtBQUFBLFFBQ0YsU0FBUztBQUNQLGdCQUFNLE1BQU0sS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEdBQzlCLE1BQU0sS0FBSyxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQztBQUMvQyxjQUFJLE1BQU0sTUFBTSxNQUFNLElBQUk7QUFDeEIsZ0JBQUksT0FBTyxNQUFNLE1BQU0sTUFBTSxJQUFJO0FBQy9CLG9CQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU07QUFDOUI7QUFBQSxZQUNGLE1BQU8sTUFBSyxNQUFNO0FBQUEsVUFDcEIsT0FBTztBQUNMLGtCQUFNLFVBQVUsS0FBSyxDQUFDLE1BQU0sT0FBTyxLQUFLLFNBQVMsSUFBSSxJQUFJLE1BQU0sS0FBSyxFQUFFLENBQUMsSUFBSSxLQUFLLENBQUMsR0FDL0UsT0FBTyxXQUFXLE9BQU87QUFDM0IsZ0JBQUksS0FBSyxLQUFLLE1BQU07QUFDbEIsb0JBQU0sUUFBUSxZQUFZLFFBQVEsWUFBWSxJQUFJLFNBQVM7QUFDM0QscUJBQU8sSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRztBQUFBLGdCQUMxQjtBQUFBLGdCQUNBO0FBQUEsY0FDRixDQUFDO0FBQUEsWUFDSDtBQUNBLGNBQUU7QUFBQSxVQUNKO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFFTyxXQUFTLFlBQ2QsUUFDQSxNQUNBLFdBQ2M7QUFDZCxVQUFNLGVBQWUsYUFBYSxtQkFDaEMsZ0JBQWdCLE1BQU0sTUFBTSxHQUFHLEtBQUssS0FBSyxFQUFFLFFBQVE7QUFDckQsV0FBTyxNQUNKLE1BQU0sR0FBRyxLQUFLLEtBQUssRUFDbkI7QUFBQSxNQUFJLE9BQ0gsY0FDRyxJQUFJLE9BQUs7QUFDUixjQUFNLFFBQVEsT0FBTyxJQUFLLElBQUksQ0FBWSxHQUN4QyxVQUFVLFNBQVMsYUFBYSxNQUFNLElBQUk7QUFDNUMsWUFBSSxTQUFTO0FBQ1gsaUJBQU8sTUFBTSxVQUFVLFVBQVUsUUFBUSxZQUFZLElBQUksUUFBUSxZQUFZO0FBQUEsUUFDL0UsTUFBTyxRQUFPO0FBQUEsTUFDaEIsQ0FBQyxFQUNBLEtBQUssRUFBRTtBQUFBLElBQ1osRUFDQyxLQUFLLEdBQUcsRUFDUixRQUFRLFVBQVUsT0FBSyxFQUFFLE9BQU8sU0FBUyxDQUFDO0FBQUEsRUFDL0M7QUFFTyxXQUFTLFlBQ2QsTUFDQSxhQUNVO0FBQ1YsVUFBTSxhQUFhLGVBQWUscUJBQ2hDLFFBQWlCLG9CQUFJLElBQUksR0FDekIsT0FBZ0Isb0JBQUksSUFBSTtBQUUxQixRQUFJLFNBQVMsR0FDWCxNQUFNO0FBQ1IsYUFBUyxJQUFJLEdBQUcsSUFBSSxLQUFLLFFBQVEsS0FBSztBQUNwQyxZQUFNLEtBQUssS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDO0FBQy9CLFVBQUksS0FBSyxNQUFNLEtBQUssSUFBSTtBQUN0QixpQkFBUyxTQUFTLEtBQUssS0FBSztBQUM1QixjQUFNO0FBQUEsTUFDUixPQUFPO0FBQ0wsY0FBTSxVQUFVLEtBQUssQ0FBQyxNQUFNLE9BQU8sS0FBSyxTQUFTLElBQUksSUFBSSxNQUFNLEtBQUssRUFBRSxDQUFDLElBQUksS0FBSyxDQUFDLEdBQy9FLE9BQU8sV0FBVyxPQUFPO0FBQzNCLFlBQUksTUFBTTtBQUNSLGdCQUFNLFFBQVEsWUFBWSxRQUFRLFlBQVksSUFBSSxTQUFTO0FBQzNELGNBQUksVUFBVSxRQUFTLE9BQU0sSUFBSSxPQUFPLE1BQU0sSUFBSSxJQUFJLEtBQUssS0FBSyxHQUFHO0FBQUEsY0FDOUQsTUFBSyxJQUFJLE9BQU8sS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLEdBQUc7QUFBQSxRQUNqRDtBQUNBLGlCQUFTO0FBQ1QsY0FBTTtBQUFBLE1BQ1I7QUFBQSxJQUNGO0FBRUEsV0FBTyxvQkFBSSxJQUFJO0FBQUEsTUFDYixDQUFDLFNBQVMsS0FBSztBQUFBLE1BQ2YsQ0FBQyxRQUFRLElBQUk7QUFBQSxJQUNmLENBQUM7QUFBQSxFQUNIO0FBRU8sV0FBUyxZQUNkLE9BQ0EsT0FDQSxXQUNjO0FBaEloQjtBQWlJRSxVQUFNLGVBQWUsYUFBYTtBQUVsQyxRQUFJLGVBQWUsSUFDakIsY0FBYztBQUNoQixlQUFXLFFBQVEsT0FBTztBQUN4QixZQUFNLFVBQVUsYUFBYSxJQUFJO0FBQ2pDLFVBQUksU0FBUztBQUNYLGNBQU0sWUFBVyxXQUFNLElBQUksT0FBTyxNQUFqQixtQkFBb0IsSUFBSSxPQUN2QyxXQUFVLFdBQU0sSUFBSSxNQUFNLE1BQWhCLG1CQUFtQixJQUFJO0FBQ25DLFlBQUksU0FBVSxpQkFBZ0IsV0FBVyxJQUFJLFNBQVMsU0FBUyxJQUFJLFVBQVU7QUFDN0UsWUFBSSxRQUFTLGdCQUFlLFVBQVUsSUFBSSxRQUFRLFNBQVMsSUFBSSxVQUFVO0FBQUEsTUFDM0U7QUFBQSxJQUNGO0FBQ0EsUUFBSSxnQkFBZ0IsWUFBYSxRQUFPLGFBQWEsWUFBWSxJQUFJLFlBQVksWUFBWTtBQUFBLFFBQ3hGLFFBQU87QUFBQSxFQUNkO0FBRUEsV0FBUyxvQkFBb0IsU0FBNEM7QUFDdkUsWUFBUSxRQUFRLFlBQVksR0FBRztBQUFBLE1BQzdCLEtBQUs7QUFDSCxlQUFPO0FBQUEsTUFDVCxLQUFLO0FBQ0gsZUFBTztBQUFBLE1BQ1QsS0FBSztBQUNILGVBQU87QUFBQSxNQUNULEtBQUs7QUFDSCxlQUFPO0FBQUEsTUFDVCxLQUFLO0FBQ0gsZUFBTztBQUFBLE1BQ1QsS0FBSztBQUNILGVBQU87QUFBQSxNQUNULEtBQUs7QUFDSCxlQUFPO0FBQUEsTUFDVCxLQUFLO0FBQ0gsZUFBTztBQUFBLE1BQ1QsS0FBSztBQUNILGVBQU87QUFBQSxNQUNULEtBQUs7QUFDSCxlQUFPO0FBQUEsTUFDVCxLQUFLO0FBQ0gsZUFBTztBQUFBLE1BQ1QsS0FBSztBQUNILGVBQU87QUFBQSxNQUNULEtBQUs7QUFDSCxlQUFPO0FBQUEsTUFDVCxLQUFLO0FBQ0gsZUFBTztBQUFBLE1BQ1Q7QUFDRTtBQUFBLElBQ0o7QUFBQSxFQUNGO0FBQ08sV0FBUyxrQkFBa0IsTUFBa0M7QUFDbEUsWUFBUSxNQUFNO0FBQUEsTUFDWixLQUFLO0FBQ0gsZUFBTztBQUFBLE1BQ1QsS0FBSztBQUNILGVBQU87QUFBQSxNQUNULEtBQUs7QUFDSCxlQUFPO0FBQUEsTUFDVCxLQUFLO0FBQ0gsZUFBTztBQUFBLE1BQ1QsS0FBSztBQUNILGVBQU87QUFBQSxNQUNULEtBQUs7QUFDSCxlQUFPO0FBQUEsTUFDVCxLQUFLO0FBQ0gsZUFBTztBQUFBLE1BQ1QsS0FBSztBQUNILGVBQU87QUFBQSxNQUNULEtBQUs7QUFDSCxlQUFPO0FBQUEsTUFDVCxLQUFLO0FBQ0gsZUFBTztBQUFBLE1BQ1QsS0FBSztBQUNILGVBQU87QUFBQSxNQUNULEtBQUs7QUFDSCxlQUFPO0FBQUEsTUFDVCxLQUFLO0FBQ0gsZUFBTztBQUFBLE1BQ1QsS0FBSztBQUNILGVBQU87QUFBQSxNQUNUO0FBQ0U7QUFBQSxJQUNKO0FBQUEsRUFDRjs7O0FDOUVPLFdBQVMsZUFBZSxPQUFzQixRQUFzQjtBQUN6RSxRQUFJLE9BQU8sV0FBVztBQUNwQixnQkFBVSxNQUFNLFdBQVcsT0FBTyxTQUFTO0FBRTNDLFdBQUssTUFBTSxVQUFVLFlBQVksS0FBSyxHQUFJLE9BQU0sVUFBVSxVQUFVO0FBQUEsSUFDdEU7QUFBQSxFQUNGO0FBRU8sV0FBUyxVQUFVLE9BQXNCLFFBQXNCO0FBL0l0RTtBQWlKRSxTQUFJLFlBQU8sWUFBUCxtQkFBZ0IsTUFBTyxPQUFNLFFBQVEsUUFBUTtBQUNqRCxTQUFJLFlBQU8sY0FBUCxtQkFBa0IsTUFBTyxPQUFNLFVBQVUsUUFBUTtBQUNyRCxTQUFJLFlBQU8sYUFBUCxtQkFBaUIsT0FBUSxPQUFNLFNBQVMsU0FBUyxDQUFDO0FBQ3RELFNBQUksWUFBTyxhQUFQLG1CQUFpQixXQUFZLE9BQU0sU0FBUyxhQUFhLENBQUM7QUFDOUQsU0FBSSxZQUFPLGFBQVAsbUJBQWlCLFFBQVMsT0FBTSxTQUFTLFVBQVUsQ0FBQztBQUN4RCxTQUFJLFlBQU8sVUFBUCxtQkFBYyxNQUFPLE9BQU0sTUFBTSxRQUFRLENBQUM7QUFFOUMsY0FBVSxPQUFPLE1BQU07QUFHdkIsU0FBSSxZQUFPLFNBQVAsbUJBQWEsT0FBTztBQUN0QixZQUFNLGFBQWEsZ0JBQWdCLE9BQU8sS0FBSyxLQUFLO0FBQ3BELFlBQU0sU0FBUyxZQUFZLE9BQU8sS0FBSyxPQUFPLE1BQU0sWUFBWSxNQUFNLFFBQVEsV0FBVztBQUN6RixZQUFNLFNBQVMsV0FBUyxZQUFPLGFBQVAsbUJBQWlCLFdBQVUsQ0FBQztBQUFBLElBQ3REO0FBRUEsU0FBSSxZQUFPLFNBQVAsbUJBQWEsT0FBTztBQUN0QixZQUFNLE1BQU0sVUFBVSxZQUFZLE9BQU8sS0FBSyxPQUFPLE1BQU0sUUFBUSxXQUFXO0FBQUEsSUFDaEY7QUFHQSxRQUFJLFlBQVksT0FBUSxXQUFVLE9BQU8sT0FBTyxVQUFVLEtBQUs7QUFDL0QsUUFBSSxlQUFlLFVBQVUsQ0FBQyxPQUFPLFVBQVcsT0FBTSxZQUFZO0FBQUEsYUFJekQsT0FBTyxVQUFXLE9BQU0sWUFBWSxPQUFPO0FBR3BELGdCQUFZLEtBQUs7QUFFakIsbUJBQWUsT0FBTyxNQUFNO0FBQUEsRUFDOUI7QUFFQSxXQUFTLFVBQVUsTUFBVyxRQUFtQjtBQUMvQyxlQUFXLE9BQU8sUUFBUTtBQUN4QixVQUFJLE9BQU8sVUFBVSxlQUFlLEtBQUssUUFBUSxHQUFHLEdBQUc7QUFDckQsWUFDRSxPQUFPLFVBQVUsZUFBZSxLQUFLLE1BQU0sR0FBRyxLQUM5QyxjQUFjLEtBQUssR0FBRyxDQUFDLEtBQ3ZCLGNBQWMsT0FBTyxHQUFHLENBQUM7QUFFekIsb0JBQVUsS0FBSyxHQUFHLEdBQUcsT0FBTyxHQUFHLENBQUM7QUFBQSxZQUM3QixNQUFLLEdBQUcsSUFBSSxPQUFPLEdBQUc7QUFBQSxNQUM3QjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUEsV0FBUyxjQUFjLEdBQXFCO0FBQzFDLFFBQUksT0FBTyxNQUFNLFlBQVksTUFBTSxLQUFNLFFBQU87QUFDaEQsVUFBTSxRQUFRLE9BQU8sZUFBZSxDQUFDO0FBQ3JDLFdBQU8sVUFBVSxPQUFPLGFBQWEsVUFBVTtBQUFBLEVBQ2pEOzs7QUN4S08sV0FBUyxLQUFRLFVBQXVCLE9BQWlCO0FBQzlELFdBQU8sTUFBTSxVQUFVLFVBQVUsUUFBUSxVQUFVLEtBQUssSUFBSSxPQUFPLFVBQVUsS0FBSztBQUFBLEVBQ3BGO0FBRU8sV0FBUyxPQUFVLFVBQXVCLE9BQWlCO0FBQ2hFLFVBQU0sU0FBUyxTQUFTLEtBQUs7QUFDN0IsVUFBTSxJQUFJLE9BQU87QUFDakIsV0FBTztBQUFBLEVBQ1Q7QUFRQSxXQUFTLFVBQVUsS0FBYSxPQUE0QjtBQUMxRCxXQUFPO0FBQUEsTUFDTDtBQUFBLE1BQ0EsS0FBVSxRQUFRLEdBQUc7QUFBQSxNQUNyQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUEsV0FBUyxPQUFPLE9BQWtCLFFBQTRDO0FBQzVFLFdBQU8sT0FBTyxLQUFLLENBQUMsSUFBSSxPQUFPO0FBQzdCLGFBQVksV0FBVyxNQUFNLEtBQUssR0FBRyxHQUFHLElBQVMsV0FBVyxNQUFNLEtBQUssR0FBRyxHQUFHO0FBQUEsSUFDL0UsQ0FBQyxFQUFFLENBQUM7QUFBQSxFQUNOO0FBRUEsV0FBUyxZQUFZLFlBQXVCLFdBQXFCLFNBQTBCO0FBQ3pGLFVBQU0sUUFBcUIsb0JBQUksSUFBSSxHQUNqQyxjQUF3QixDQUFDLEdBQ3pCLFVBQXVCLG9CQUFJLElBQUksR0FDL0IsYUFBNkIsb0JBQUksSUFBSSxHQUNyQyxXQUF3QixDQUFDLEdBQ3pCLE9BQW9CLENBQUMsR0FDckIsWUFBWSxvQkFBSSxJQUF1QjtBQUV6QyxlQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssWUFBWTtBQUMvQixnQkFBVSxJQUFJLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQztBQUFBLElBQ2xDO0FBQ0EsZUFBVyxPQUFPLFNBQVM7QUFDekIsWUFBTSxPQUFPLFFBQVEsT0FBTyxJQUFJLEdBQUcsR0FDakMsT0FBTyxVQUFVLElBQUksR0FBRztBQUMxQixVQUFJLE1BQU07QUFDUixZQUFJLE1BQU07QUFDUixjQUFJLENBQU0sVUFBVSxNQUFNLEtBQUssS0FBSyxHQUFHO0FBQ3JDLHFCQUFTLEtBQUssSUFBSTtBQUNsQixpQkFBSyxLQUFLLFVBQVUsS0FBSyxJQUFJLENBQUM7QUFBQSxVQUNoQztBQUFBLFFBQ0YsTUFBTyxNQUFLLEtBQUssVUFBVSxLQUFLLElBQUksQ0FBQztBQUFBLE1BQ3ZDLFdBQVcsS0FBTSxVQUFTLEtBQUssSUFBSTtBQUFBLElBQ3JDO0FBQ0EsUUFBSSxRQUFRLFVBQVUsT0FBTztBQUMzQixpQkFBVyxTQUFTLFFBQVE7QUFDMUIsY0FBTSxPQUFPLFFBQVEsTUFBTSxRQUFRLElBQUksS0FBSyxHQUMxQyxPQUFPLFVBQVUsSUFBSSxLQUFLO0FBQzVCLFlBQUksUUFBUSxNQUFNO0FBQ2hCLHFCQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssTUFBTTtBQUM1QixrQkFBTSxRQUFrQixFQUFFLE1BQU0sTUFBTSxHQUNwQyxPQUFPLEtBQUssSUFBSSxJQUFJLEtBQUs7QUFDM0IsZ0JBQUksT0FBTyxHQUFHO0FBQ1osb0JBQU0sa0JBQWtCLFFBQVEsSUFBSSxPQUFPLE1BQ3RDLFlBQVksRUFDWixJQUFTLFlBQVksS0FBSyxDQUFDLEdBQzlCLFNBQVMsUUFBUSxJQUFJLE9BQU8sTUFBTSxPQUFPLEdBQ3pDLFNBQ0UsbUJBQW1CLFNBQ1Y7QUFBQSxnQkFDSCxnQkFBZ0I7QUFBQSxnQkFDaEIsZ0JBQWdCO0FBQUEsZ0JBQ1gsU0FBUyxRQUFRLFdBQVc7QUFBQSxnQkFDakMsUUFBUTtBQUFBLGdCQUNSO0FBQUEsY0FDRixJQUNBO0FBQ1Isa0JBQUk7QUFDRix5QkFBUyxLQUFLO0FBQUEsa0JBQ1osS0FBSztBQUFBLGtCQUNMO0FBQUEsZ0JBQ0YsQ0FBQztBQUFBLFlBQ0w7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQ0EsZUFBVyxRQUFRLE1BQU07QUFDdkIsWUFBTSxPQUFPO0FBQUEsUUFDWDtBQUFBLFFBQ0EsU0FBUyxPQUFPLE9BQUs7QUFDbkIsY0FBUyxVQUFVLEtBQUssT0FBTyxFQUFFLEtBQUssRUFBRyxRQUFPO0FBRWhELGdCQUFNLFFBQVEsUUFBUSxVQUFVLFdBQVcsRUFBRSxNQUFNLElBQUksR0FDckQsU0FBUyxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sT0FBTyxNQUFNLE1BQU07QUFDeEQsZ0JBQU0sUUFBUSxRQUFRLFVBQVUsV0FBVyxLQUFLLE1BQU0sSUFBSSxHQUN4RCxTQUFTLFNBQVMsRUFBRSxPQUFPLEtBQUssTUFBTSxPQUFPLE1BQU0sTUFBTTtBQUMzRCxpQkFDRyxDQUFDLENBQUMsVUFBZSxVQUFVLEtBQUssT0FBTyxNQUFNLEtBQzdDLENBQUMsQ0FBQyxVQUFlLFVBQVUsUUFBUSxFQUFFLEtBQUs7QUFBQSxRQUUvQyxDQUFDO0FBQUEsTUFDSDtBQUNBLFVBQUksTUFBTTtBQUNSLGNBQU0sU0FBUyxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUM7QUFDcEUsY0FBTSxJQUFJLEtBQUssS0FBTSxPQUFPLE9BQU8sTUFBTSxDQUFlO0FBQ3hELFlBQUksS0FBSyxJQUFLLGFBQVksS0FBSyxLQUFLLEdBQUc7QUFDdkMsWUFBSSxDQUFNLFVBQVUsS0FBSyxPQUFPLEtBQUssS0FBSyxLQUFLLEtBQUssSUFBSyxZQUFXLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSztBQUFBLE1BQzlGO0FBQUEsSUFDRjtBQUNBLGVBQVcsS0FBSyxVQUFVO0FBQ3hCLFVBQUksRUFBRSxPQUFPLENBQUMsWUFBWSxTQUFTLEVBQUUsR0FBRyxFQUFHLFNBQVEsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLO0FBQUEsSUFDdkU7QUFFQSxXQUFPO0FBQUEsTUFDTDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFFQSxXQUFTLEtBQUssT0FBYyxLQUFnQztBQUMxRCxVQUFNLE1BQU0sTUFBTSxVQUFVO0FBQzVCLFFBQUksUUFBUSxRQUFXO0FBRXJCLFVBQUksQ0FBQyxNQUFNLElBQUksVUFBVyxPQUFNLElBQUksVUFBVTtBQUM5QztBQUFBLElBQ0Y7QUFDQSxVQUFNLE9BQU8sS0FBSyxNQUFNLElBQUksU0FBUyxJQUFJO0FBQ3pDLFFBQUksUUFBUSxHQUFHO0FBQ2IsWUFBTSxVQUFVLFVBQVU7QUFDMUIsWUFBTSxJQUFJLFVBQVU7QUFBQSxJQUN0QixPQUFPO0FBQ0wsWUFBTSxPQUFPLE9BQU8sSUFBSTtBQUN4QixpQkFBVyxPQUFPLElBQUksS0FBSyxNQUFNLE9BQU8sR0FBRztBQUN6QyxZQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSTtBQUNsQixZQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSTtBQUFBLE1BQ3BCO0FBQ0EsWUFBTSxJQUFJLFVBQVUsSUFBSTtBQUN4Qiw0QkFBc0IsQ0FBQ0MsT0FBTSxZQUFZLElBQUksTUFBTSxLQUFLLE9BQU9BLElBQUcsQ0FBQztBQUFBLElBQ3JFO0FBQUEsRUFDRjtBQUVBLFdBQVMsUUFBVyxVQUF1QixPQUFpQjtBQTVLNUQ7QUE4S0UsVUFBTSxhQUF3QixJQUFJLElBQUksTUFBTSxNQUFNLEdBQ2hELFlBQXNCLG9CQUFJLElBQUk7QUFBQSxNQUM1QixDQUFDLFNBQVMsSUFBSSxJQUFJLE1BQU0sTUFBTSxRQUFRLElBQUksT0FBTyxDQUFDLENBQUM7QUFBQSxNQUNuRCxDQUFDLFFBQVEsSUFBSSxJQUFJLE1BQU0sTUFBTSxRQUFRLElBQUksTUFBTSxDQUFDLENBQUM7QUFBQSxJQUNuRCxDQUFDO0FBRUgsVUFBTSxTQUFTLFNBQVMsS0FBSyxHQUMzQixPQUFPLFlBQVksWUFBWSxXQUFXLEtBQUs7QUFDakQsUUFBSSxLQUFLLE1BQU0sUUFBUSxLQUFLLFFBQVEsTUFBTTtBQUN4QyxZQUFNLG1CQUFpQixXQUFNLFVBQVUsWUFBaEIsbUJBQXlCLFdBQVU7QUFDMUQsWUFBTSxVQUFVLFVBQVU7QUFBQSxRQUN4QixPQUFPLFlBQVksSUFBSTtBQUFBLFFBQ3ZCLFdBQVcsSUFBSSxLQUFLLElBQUksTUFBTSxVQUFVLFVBQVUsQ0FBQztBQUFBLFFBQ25EO0FBQUEsTUFDRjtBQUNBLFVBQUksQ0FBQyxlQUFnQixNQUFLLE9BQU8sWUFBWSxJQUFJLENBQUM7QUFBQSxJQUNwRCxPQUFPO0FBRUwsWUFBTSxJQUFJLE9BQU87QUFBQSxJQUNuQjtBQUNBLFdBQU87QUFBQSxFQUNUO0FBR0EsV0FBUyxPQUFPLEdBQW1CO0FBQ2pDLFdBQU8sSUFBSSxNQUFNLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxNQUFNLElBQUksSUFBSSxNQUFNLElBQUksSUFBSSxLQUFLO0FBQUEsRUFDekU7OztBQzFMTyxXQUFTLGlCQUFpQixTQUE2QjtBQUM1RCxXQUFPLFNBQVMsZ0JBQWdCLDhCQUE4QixPQUFPO0FBQUEsRUFDdkU7QUFZQSxNQUFNLG1CQUFtQjtBQUVsQixXQUFTLGFBQ2QsT0FDQSxLQUNBLFdBQ0EsWUFDTTtBQUNOLFVBQU0sSUFBSSxNQUFNLFVBQ2QsT0FBTyxFQUFFLFNBQ1QsT0FBTSw2QkFBTSxRQUFRLE9BQXFCLFFBQ3pDLGVBQWUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUMxQixhQUF5QixvQkFBSSxJQUFJLEdBQ2pDLFdBQVcsb0JBQUksSUFBdUI7QUFFeEMsVUFBTSxhQUFhLE1BQU07QUFFdkIsWUFBTSxTQUFTLE1BQU0sSUFBSSxPQUFPLE1BQU0sT0FBTztBQUM3QyxhQUFRLFVBQVUsT0FBTyxNQUFNLFNBQVMsSUFBSSxPQUFPLFVBQVc7QUFBQSxJQUNoRTtBQUVBLGVBQVcsS0FBSyxFQUFFLE9BQU8sT0FBTyxFQUFFLFVBQVUsRUFBRSxPQUFPLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUc7QUFDdEUsWUFBTSxXQUFXLFFBQVEsRUFBRSxJQUFJLElBQUksWUFBWSxFQUFFLElBQUksSUFBSSxFQUFFO0FBQzNELFVBQUksQ0FBQyxlQUFlLEVBQUUsTUFBTSxFQUFFLElBQUk7QUFDaEMsbUJBQVcsSUFBSSxXQUFXLFdBQVcsSUFBSSxRQUFRLEtBQUssS0FBSyxDQUFDO0FBQUEsSUFDaEU7QUFFQSxlQUFXLEtBQUssRUFBRSxPQUFPLE9BQU8sTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsVUFBVSxHQUFHO0FBQ3RFLFVBQUksRUFBRSxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRyxVQUFTLElBQUksRUFBRSxNQUFNLENBQUM7QUFBQSxJQUN6RDtBQUNBLFVBQU0sY0FBYyxDQUFDLEdBQUcsU0FBUyxPQUFPLENBQUMsRUFBRSxJQUFJLE9BQUs7QUFDbEQsYUFBTztBQUFBLFFBQ0wsT0FBTztBQUFBLFFBQ1AsTUFBTSxVQUFVLEdBQUcsWUFBWSxPQUFPLFVBQVU7QUFBQSxNQUNsRDtBQUFBLElBQ0YsQ0FBQztBQUVELFVBQU0sU0FBa0IsRUFBRSxPQUFPLE9BQU8sRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQWlCO0FBQzFFLGFBQU87QUFBQSxRQUNMLE9BQU87QUFBQSxRQUNQLE1BQU0sVUFBVSxHQUFHLFlBQVksT0FBTyxVQUFVO0FBQUEsTUFDbEQ7QUFBQSxJQUNGLENBQUM7QUFDRCxRQUFJO0FBQ0YsYUFBTyxLQUFLO0FBQUEsUUFDVixPQUFPO0FBQUEsUUFDUCxNQUFNLFVBQVUsS0FBSyxZQUFZLE1BQU0sVUFBVTtBQUFBLFFBQ2pELFNBQVM7QUFBQSxNQUNYLENBQUM7QUFFSCxVQUFNLFdBQVcsT0FBTyxJQUFJLFFBQU0sR0FBRyxJQUFJLEVBQUUsS0FBSyxHQUFHLEtBQUssZUFBZSxtQkFBbUI7QUFDMUYsUUFBSSxhQUFhLE1BQU0sU0FBUyxZQUFhO0FBQzdDLFVBQU0sU0FBUyxjQUFjO0FBcUI3QixVQUFNLFNBQVMsSUFBSSxjQUFjLE1BQU0sR0FDckMsV0FBVyxJQUFJLGNBQWMsR0FBRyxHQUNoQyxlQUFlLFVBQVUsY0FBYyxHQUFHO0FBRTVDLGFBQVMsUUFBUSxlQUFlLE9BQU8sUUFBVyxNQUFNO0FBQ3hEO0FBQUEsTUFDRSxPQUFPLE9BQU8sT0FBSyxDQUFDLEVBQUUsTUFBTSxjQUFjLENBQUMsRUFBRSxNQUFNLFNBQVMsRUFBRSxRQUFRO0FBQUEsTUFDdEU7QUFBQSxNQUNBLFdBQVMsZUFBZSxPQUFPLE9BQU8sVUFBVTtBQUFBLE1BQ2hEO0FBQUEsSUFDRjtBQUNBO0FBQUEsTUFDRSxPQUFPLE9BQU8sT0FBSyxFQUFFLE1BQU0sU0FBUztBQUFBLE1BQ3BDO0FBQUEsTUFDQSxXQUFTLGVBQWUsT0FBTyxPQUFPLFVBQVU7QUFBQSxJQUNsRDtBQUNBLGVBQVcsYUFBYSxZQUFZLFdBQVMsWUFBWSxPQUFPLEtBQUssQ0FBQztBQUV0RSxRQUFJLENBQUMsZ0JBQWdCLEtBQU0sTUFBSyxRQUFRO0FBRXhDLFFBQUksZ0JBQWdCLENBQUMsS0FBSyxPQUFPO0FBQy9CLFlBQU0sT0FBTyxnQkFBZ0IsS0FBSyxNQUFNLEtBQUs7QUFDN0MsVUFBSSxNQUFNO0FBQ1IsY0FBTSxJQUFJLGNBQWMsaUJBQWlCLEdBQUcsR0FBRztBQUFBLFVBQzNDLE9BQU8sV0FBVyxLQUFLLE9BQU8sTUFBTSxJQUFJO0FBQUEsVUFDeEMsUUFBUTtBQUFBLFFBQ1YsQ0FBQyxHQUNELEtBQUssWUFBWSxLQUFLLE9BQU8sTUFBTSxNQUFNLE1BQU0sYUFBYSxNQUFNLEtBQUs7QUFDekUsVUFBRSxZQUFZLEVBQUU7QUFDaEIsYUFBSyxRQUFRO0FBQ2IsaUJBQVMsWUFBWSxDQUFDO0FBQUEsTUFDeEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUdBLFdBQVMsU0FDUCxRQUNBLGNBQ0EsUUFDTTtBQUNOLFVBQU1DLFdBQVUsb0JBQUksSUFBWTtBQUNoQyxlQUFXLEtBQUssUUFBUTtBQUN0QixVQUFJLENBQUMsZUFBZSxFQUFFLE1BQU0sTUFBTSxFQUFFLE1BQU0sSUFBSSxFQUFHLENBQUFBLFNBQVEsSUFBSSxFQUFFLE1BQU0sS0FBSztBQUFBLElBQzVFO0FBQ0EsUUFBSSxhQUFjLENBQUFBLFNBQVEsSUFBSSxhQUFhLEtBQUs7QUFDaEQsVUFBTSxZQUFZLG9CQUFJLElBQUk7QUFDMUIsUUFBSSxLQUE2QixPQUFPO0FBQ3hDLFdBQU8sSUFBSTtBQUNULGdCQUFVLElBQUksR0FBRyxhQUFhLE9BQU8sQ0FBQztBQUN0QyxXQUFLLEdBQUc7QUFBQSxJQUNWO0FBQ0EsZUFBVyxPQUFPQSxVQUFTO0FBQ3pCLFlBQU0sUUFBUSxPQUFPO0FBQ3JCLFVBQUksQ0FBQyxVQUFVLElBQUksS0FBSyxFQUFHLFFBQU8sWUFBWSxhQUFhLEtBQUssQ0FBQztBQUFBLElBQ25FO0FBQUEsRUFDRjtBQUdPLFdBQVMsV0FDZCxRQUNBLE1BQ0EsYUFDQSxjQUNNO0FBQ04sVUFBTSxjQUFjLG9CQUFJLElBQUksR0FDMUIsV0FBeUIsQ0FBQztBQUM1QixlQUFXLE1BQU0sT0FBUSxhQUFZLElBQUksR0FBRyxNQUFNLEtBQUs7QUFDdkQsUUFBSSxhQUFjLGFBQVksSUFBSSxrQkFBa0IsSUFBSTtBQUN4RCxRQUFJLEtBQTZCLEtBQUssbUJBQ3BDO0FBQ0YsV0FBTyxJQUFJO0FBQ1QsZUFBUyxHQUFHLGFBQWEsUUFBUTtBQUVqQyxVQUFJLFlBQVksSUFBSSxNQUFNLEVBQUcsYUFBWSxJQUFJLFFBQVEsSUFBSTtBQUFBLFVBRXBELFVBQVMsS0FBSyxFQUFFO0FBQ3JCLFdBQUssR0FBRztBQUFBLElBQ1Y7QUFFQSxlQUFXQyxPQUFNLFNBQVUsTUFBSyxZQUFZQSxHQUFFO0FBRTlDLGVBQVcsTUFBTSxRQUFRO0FBQ3ZCLFVBQUksQ0FBQyxZQUFZLElBQUksR0FBRyxJQUFJLEdBQUc7QUFDN0IsY0FBTSxVQUFVLFlBQVksRUFBRTtBQUM5QixZQUFJLFFBQVMsTUFBSyxZQUFZLE9BQU87QUFBQSxNQUN2QztBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUEsV0FBUyxVQUNQLEVBQUUsTUFBTSxNQUFNLE9BQU8sT0FBTyxXQUFXLFlBQVksR0FDbkQsWUFDQSxTQUNBLFdBQ007QUFDTixXQUFPO0FBQUEsTUFDTDtBQUFBLE9BQ0MsUUFBUSxJQUFJLEtBQUssUUFBUSxJQUFJLE1BQU0sVUFBVTtBQUFBLE1BQzlDLFFBQVEsSUFBSSxJQUFJLFVBQVUsSUFBSSxJQUFJO0FBQUEsTUFDbEMsUUFBUSxJQUFJLElBQUksVUFBVSxJQUFJLElBQUk7QUFBQSxNQUNsQztBQUFBLE9BQ0MsV0FBVyxJQUFJLFFBQVEsSUFBSSxJQUFJLFlBQVksSUFBSSxJQUFJLElBQUksS0FBSyxLQUFLO0FBQUEsTUFDbEUsU0FBUyxVQUFVLEtBQUs7QUFBQSxNQUN4QixhQUFhLGNBQWMsU0FBUztBQUFBLE1BQ3BDO0FBQUEsSUFDRixFQUNHLE9BQU8sT0FBSyxDQUFDLEVBQ2IsS0FBSyxHQUFHO0FBQUEsRUFDYjtBQUVBLFdBQVMsVUFBVSxPQUE2QjtBQUM5QyxXQUFPLENBQUMsTUFBTSxPQUFPLE1BQU0sTUFBTSxNQUFNLEtBQUssRUFBRSxPQUFPLE9BQUssQ0FBQyxFQUFFLEtBQUssR0FBRztBQUFBLEVBQ3ZFO0FBRUEsV0FBUyxjQUFjLEdBQWlCO0FBRXRDLFFBQUksSUFBSTtBQUNSLGFBQVMsSUFBSSxHQUFHLElBQUksRUFBRSxRQUFRLEtBQUs7QUFDakMsV0FBTSxLQUFLLEtBQUssSUFBSSxFQUFFLFdBQVcsQ0FBQyxNQUFPO0FBQUEsSUFDM0M7QUFDQSxXQUFPLFlBQVksRUFBRSxTQUFTO0FBQUEsRUFDaEM7QUFFQSxXQUFTLGVBQ1AsT0FDQSxFQUFFLE9BQU8sU0FBUyxLQUFLLEdBQ3ZCLFlBQ3dCO0FBQ3hCLFVBQU0sT0FBTyxnQkFBZ0IsTUFBTSxNQUFNLEtBQUs7QUFDOUMsUUFBSSxDQUFDLEtBQU07QUFDWCxRQUFJLE1BQU0sV0FBVztBQUNuQixhQUFPLGdCQUFnQixNQUFNLE9BQU8sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXO0FBQUEsSUFDOUUsT0FBTztBQUNMLFVBQUk7QUFDSixZQUFNLE9BQU8sQ0FBQyxlQUFlLE1BQU0sTUFBTSxNQUFNLElBQUksS0FBSyxnQkFBZ0IsTUFBTSxNQUFNLEtBQUs7QUFDekYsVUFBSSxNQUFNO0FBQ1IsYUFBSztBQUFBLFVBQ0gsTUFBTTtBQUFBLFVBQ047QUFBQSxVQUNBO0FBQUEsVUFDQSxNQUFNO0FBQUEsVUFDTixDQUFDLENBQUM7QUFBQSxXQUNELFdBQVcsSUFBSSxRQUFRLE1BQU0sSUFBSSxJQUFJLFlBQVksTUFBTSxJQUFJLElBQUksTUFBTSxJQUFJLEtBQUssS0FBSztBQUFBLFFBQ3RGO0FBQUEsTUFDRixXQUFXLGVBQWUsTUFBTSxNQUFNLE1BQU0sSUFBSSxHQUFHO0FBQ2pELFlBQUksUUFBdUIsTUFBTTtBQUNqQyxZQUFJLFFBQVEsTUFBTSxJQUFJLEdBQUc7QUFDdkIsZ0JBQU0sY0FBYyxNQUFNLElBQUksT0FBTyxNQUFNLFlBQVksRUFBRSxJQUFJLFlBQVksTUFBTSxJQUFJLENBQUMsR0FDbEYsU0FBUyxNQUFNLElBQUksT0FBTyxNQUFNLE9BQU87QUFDekMsY0FBSSxlQUFlLFFBQVE7QUFDekIsa0JBQU0sYUFBYSxZQUFZLFVBQVUsT0FBTyxTQUFTLE1BQU0sV0FBVztBQUUxRSxvQkFBUSxDQUFDLGFBQWEsTUFBTSxZQUFZLENBQUMsR0FBRyxhQUFhLE1BQU0sWUFBWSxDQUFDLENBQUM7QUFBQSxVQUMvRTtBQUFBLFFBQ0Y7QUFDQSxhQUFLLGNBQWMsTUFBTSxPQUFPLENBQUMsQ0FBQyxPQUFPO0FBQUEsTUFDM0M7QUFDQSxVQUFJLElBQUk7QUFDTixjQUFNLElBQUksY0FBYyxpQkFBaUIsR0FBRyxHQUFHO0FBQUEsVUFDN0MsT0FBTyxXQUFXLE1BQU0sT0FBTyxDQUFDLENBQUMsU0FBUyxLQUFLO0FBQUEsVUFDL0MsUUFBUTtBQUFBLFFBQ1YsQ0FBQztBQUNELFVBQUUsWUFBWSxFQUFFO0FBQ2hCLGNBQU0sU0FBUyxNQUFNLGVBQWUsa0JBQWtCLE9BQU8sT0FBTyxVQUFVO0FBQzlFLFlBQUksT0FBUSxHQUFFLFlBQVksTUFBTTtBQUNoQyxlQUFPO0FBQUEsTUFDVCxNQUFPO0FBQUEsSUFDVDtBQUFBLEVBQ0Y7QUFFQSxXQUFTLGdCQUNQLE9BQ0EsV0FDQSxLQUNBLE9BQ1k7QUFDWixVQUFNLENBQUMsR0FBRyxDQUFDLElBQUk7QUFHZixVQUFNLElBQUksY0FBYyxpQkFBaUIsR0FBRyxHQUFHLEVBQUUsV0FBVyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztBQUVwRixVQUFNLE1BQU0sY0FBYyxpQkFBaUIsS0FBSyxHQUFHO0FBQUEsTUFDakQsT0FBTztBQUFBLE1BQ1AsT0FBTyxNQUFNLENBQUM7QUFBQSxNQUNkLFFBQVEsTUFBTSxDQUFDO0FBQUEsTUFDZixTQUFTLE9BQU8sTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUU7QUFBQSxJQUNoRCxDQUFDO0FBRUQsTUFBRSxZQUFZLEdBQUc7QUFDakIsUUFBSSxZQUFZO0FBRWhCLFdBQU87QUFBQSxFQUNUO0FBRUEsV0FBUyxjQUFjLEtBQWEsT0FBc0IsU0FBOEI7QUFDdEYsVUFBTSxJQUFJLEtBQ1IsU0FBUyxhQUFhLEtBQUs7QUFDN0IsV0FBTyxjQUFjLGlCQUFpQixTQUFTLEdBQUc7QUFBQSxNQUNoRCxnQkFBZ0IsT0FBTyxVQUFVLElBQUksQ0FBQztBQUFBLE1BQ3RDLE1BQU07QUFBQSxNQUNOLElBQUksRUFBRSxDQUFDO0FBQUEsTUFDUCxJQUFJLEVBQUUsQ0FBQztBQUFBLE1BQ1AsSUFBSSxNQUFNLENBQUMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxJQUFJO0FBQUEsTUFDL0IsSUFBSSxNQUFNLENBQUMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxJQUFJO0FBQUEsSUFDakMsQ0FBQztBQUFBLEVBQ0g7QUFFQSxXQUFTLFlBQ1AsT0FDQSxNQUNBLE1BQ0EsT0FDQSxTQUNBLFNBQ1k7QUFDWixVQUFNLElBQUksWUFBWSxXQUFXLENBQUMsU0FBUyxLQUFLLEdBQzlDLElBQUksTUFDSixJQUFJLE1BQ0osS0FBSyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsR0FDZixLQUFLLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUNmLFFBQVEsS0FBSyxNQUFNLElBQUksRUFBRSxHQUN6QixLQUFLLEtBQUssSUFBSSxLQUFLLElBQUksR0FDdkIsS0FBSyxLQUFLLElBQUksS0FBSyxJQUFJO0FBQ3pCLFdBQU8sY0FBYyxpQkFBaUIsTUFBTSxHQUFHO0FBQUEsTUFDN0MsZ0JBQWdCLFVBQVUsU0FBUyxLQUFLO0FBQUEsTUFDeEMsa0JBQWtCO0FBQUEsTUFDbEIsY0FBYyxxQkFBcUIsU0FBUyxhQUFhO0FBQUEsTUFDekQsSUFBSSxFQUFFLENBQUM7QUFBQSxNQUNQLElBQUksRUFBRSxDQUFDO0FBQUEsTUFDUCxJQUFJLEVBQUUsQ0FBQyxJQUFJO0FBQUEsTUFDWCxJQUFJLEVBQUUsQ0FBQyxJQUFJO0FBQUEsSUFDYixDQUFDO0FBQUEsRUFDSDtBQUVPLFdBQVMsWUFBWSxPQUFjLEVBQUUsTUFBTSxHQUFvQztBQUNwRixRQUFJLENBQUMsTUFBTSxTQUFTLFFBQVEsTUFBTSxJQUFJLEVBQUc7QUFFekMsVUFBTSxPQUFPLE1BQU0sTUFDakIsU0FBUyxNQUFNLE1BQU0sU0FBUyxNQUFNLE1BQU0sa0JBQWtCLE1BQU07QUFFcEUsVUFBTSxVQUFVLFNBQVMsU0FBUyxZQUFZLE1BQU0sS0FBSyxDQUFDO0FBQzFELFlBQVEsUUFBUTtBQUNoQixZQUFRLFVBQVU7QUFDbEI7QUFBQSxNQUNFO0FBQUEsTUFDQSxrQkFBa0IsTUFBTSxVQUFVLEVBQUUsUUFBUSxJQUFJLEdBQUcsU0FBUyxNQUFNLFdBQVcsQ0FBQztBQUFBLE1BQzlFLE1BQU0sa0JBQWtCLE1BQU07QUFBQSxNQUM5QjtBQUFBLElBQ0Y7QUFFQSxXQUFPO0FBQUEsRUFDVDtBQUVBLFdBQVMsa0JBQ1AsT0FDQSxPQUNBLFlBQ3dCO0FBQ3hCLFVBQU0sT0FBTyxnQkFBZ0IsTUFBTSxNQUFNLEtBQUs7QUFDOUMsUUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLFlBQWE7QUFDakMsVUFBTSxPQUFPLENBQUMsZUFBZSxNQUFNLE1BQU0sTUFBTSxJQUFJLEtBQUssZ0JBQWdCLE1BQU0sTUFBTSxLQUFLLEdBQ3ZGLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FDNUQsVUFDRyxXQUFXLElBQUksUUFBUSxNQUFNLElBQUksSUFBSSxZQUFZLE1BQU0sSUFBSSxJQUFJLE1BQU0sSUFBSSxLQUFLLEtBQUssSUFDaEYsTUFDQSxNQUNOLFNBQ0csS0FBSyxDQUFDLE1BQU0sS0FBSyxLQUFLLElBQUksS0FBSyxDQUFDLENBQUMsTUFBTSxNQUFNLFlBQVksQ0FBQyxPQUMxRCxLQUFLLENBQUMsTUFBTSxLQUFLLEtBQUssSUFBSSxLQUFLLENBQUMsQ0FBQyxNQUFNLE1BQU0sWUFBWSxDQUFDLElBQzdELFFBQVEsT0FBTyxRQUFRLFFBQVEsU0FBUyxLQUFLLEdBQzdDLE1BQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxPQUFPLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssR0FDbkUsYUFBYSxNQUFNLFlBQVk7QUFDakMsVUFBTSxJQUFJLGNBQWMsaUJBQWlCLEdBQUcsR0FBRyxFQUFFLE9BQU8sY0FBYyxDQUFDLEdBQ3JFLFNBQVMsY0FBYyxpQkFBaUIsU0FBUyxHQUFHO0FBQUEsTUFDbEQsSUFBSSxJQUFJLENBQUM7QUFBQSxNQUNULElBQUksSUFBSSxDQUFDO0FBQUEsTUFDVCxJQUFJLGFBQWE7QUFBQSxNQUNqQixJQUFJO0FBQUEsSUFDTixDQUFDLEdBQ0QsT0FBTyxjQUFjLGlCQUFpQixNQUFNLEdBQUc7QUFBQSxNQUM3QyxHQUFHLElBQUksQ0FBQztBQUFBLE1BQ1IsR0FBRyxJQUFJLENBQUM7QUFBQSxNQUNSLGVBQWU7QUFBQSxNQUNmLHFCQUFxQjtBQUFBLElBQ3ZCLENBQUM7QUFDSCxNQUFFLFlBQVksTUFBTTtBQUNwQixTQUFLLFlBQVksU0FBUyxlQUFlLE1BQU0sV0FBVyxDQUFDO0FBQzNELE1BQUUsWUFBWSxJQUFJO0FBQ2xCLFdBQU87QUFBQSxFQUNUO0FBRUEsV0FBUyxhQUFhLE9BQTJCO0FBQy9DLFVBQU0sU0FBUyxjQUFjLGlCQUFpQixRQUFRLEdBQUc7QUFBQSxNQUN2RCxJQUFJLGVBQWU7QUFBQSxNQUNuQixRQUFRO0FBQUEsTUFDUixhQUFhO0FBQUEsTUFDYixjQUFjO0FBQUEsTUFDZCxNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsSUFDUixDQUFDO0FBQ0QsV0FBTztBQUFBLE1BQ0wsY0FBYyxpQkFBaUIsTUFBTSxHQUFHO0FBQUEsUUFDdEMsR0FBRztBQUFBLE1BQ0wsQ0FBQztBQUFBLElBQ0g7QUFDQSxXQUFPLGFBQWEsU0FBUyxLQUFLO0FBQ2xDLFdBQU87QUFBQSxFQUNUO0FBRU8sV0FBUyxjQUFjLElBQWdCLE9BQXdDO0FBQ3BGLGVBQVcsT0FBTyxPQUFPO0FBQ3ZCLFVBQUksT0FBTyxVQUFVLGVBQWUsS0FBSyxPQUFPLEdBQUcsRUFBRyxJQUFHLGFBQWEsS0FBSyxNQUFNLEdBQUcsQ0FBQztBQUFBLElBQ3ZGO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFFTyxXQUFTLFNBQ2QsS0FDQSxPQUNBLE1BQ0EsT0FDZTtBQUNmLFdBQU8sVUFBVSxVQUNiLEVBQUUsS0FBSyxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsSUFDeEQsQ0FBQyxJQUFJLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxNQUFNLENBQUMsQ0FBQztBQUFBLEVBQzlEO0FBRU8sV0FBUyxRQUFRLEdBQXFDO0FBQzNELFdBQU8sT0FBTyxNQUFNO0FBQUEsRUFDdEI7QUFFTyxXQUFTLGVBQWUsS0FBd0IsS0FBaUM7QUFDdEYsV0FBUSxRQUFRLEdBQUcsS0FBSyxRQUFRLEdBQUcsS0FBSyxVQUFVLEtBQUssR0FBRyxLQUFNLFFBQVE7QUFBQSxFQUMxRTtBQUVPLFdBQVMsV0FBVyxRQUE4QjtBQUN2RCxXQUFPLE9BQU8sS0FBSyxPQUFLLFFBQVEsRUFBRSxJQUFJLEtBQUssUUFBUSxFQUFFLElBQUksQ0FBQztBQUFBLEVBQzVEO0FBRUEsV0FBUyxXQUFXLE9BQWUsU0FBa0IsU0FBMEI7QUFDN0UsV0FBTyxTQUFTLFVBQVUsYUFBYSxPQUFPLFVBQVUsYUFBYTtBQUFBLEVBQ3ZFO0FBRUEsV0FBUyxhQUFhLE9BQThCO0FBQ2xELFlBQVEsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUs7QUFBQSxFQUNqQztBQUVBLFdBQVMsYUFBYSxPQUF3QztBQUM1RCxXQUFPLENBQUUsSUFBSSxLQUFNLGFBQWEsS0FBSyxHQUFJLElBQUksS0FBTSxhQUFhLEtBQUssQ0FBQztBQUFBLEVBQ3hFO0FBRUEsV0FBUyxVQUFVLFNBQWtCLE9BQThCO0FBQ2pFLFlBQVMsVUFBVSxNQUFNLE1BQU0sS0FBTSxhQUFhLEtBQUs7QUFBQSxFQUN6RDtBQUVBLFdBQVMsWUFBWSxTQUFrQixPQUE4QjtBQUNuRSxZQUFTLFVBQVUsS0FBSyxNQUFNLEtBQU0sYUFBYSxLQUFLO0FBQUEsRUFDeEQ7QUFFQSxXQUFTLGdCQUFnQixJQUF1QixPQUFrQztBQUNoRixRQUFJLFFBQVEsRUFBRSxHQUFHO0FBQ2YsWUFBTSxjQUFjLE1BQU0sSUFBSSxPQUFPLE1BQU0sWUFBWSxFQUFFLElBQUksWUFBWSxFQUFFLENBQUMsR0FDMUUsU0FBUyxNQUFNLElBQUksT0FBTyxNQUFNLE9BQU8sR0FDdkMsU0FBUyxTQUFTLE1BQU0sV0FBVyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FDL0QsTUFDRSxlQUNBLFVBQ0E7QUFBQSxRQUNFLFlBQVksT0FBTyxZQUFZLFFBQVE7QUFBQSxRQUN2QyxZQUFZLE1BQU0sWUFBWSxTQUFTO0FBQUEsUUFDdkMsU0FBUyxNQUFNLFdBQVc7QUFBQSxRQUMxQixNQUFNO0FBQUEsUUFDTjtBQUFBLE1BQ0Y7QUFDSixhQUNFLE9BQ0E7QUFBQSxRQUNFLENBQUMsSUFBSSxDQUFDLElBQUksT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUM7QUFBQSxRQUN2QyxNQUFNO0FBQUEsUUFDTixNQUFNO0FBQUEsUUFDTixNQUFNO0FBQUEsTUFDUjtBQUFBLElBRUosTUFBTyxRQUFPLFNBQVMsUUFBUSxFQUFFLEdBQUcsTUFBTSxhQUFhLE1BQU0sWUFBWSxNQUFNLFdBQVc7QUFBQSxFQUM1Rjs7O0FDN2FBLE1BQU0sVUFBVSxDQUFDLFdBQVcsZ0JBQWdCLGdCQUFnQixjQUFjO0FBRW5FLFdBQVMsTUFBTSxPQUFjLEdBQXdCO0FBRTFELFFBQUksRUFBRSxXQUFXLEVBQUUsUUFBUSxTQUFTLEVBQUc7QUFDdkMsTUFBRSxnQkFBZ0I7QUFDbEIsTUFBRSxlQUFlO0FBRWpCLFFBQUksRUFBRSxRQUFTLFVBQVMsS0FBSztBQUFBLFFBQ3hCLGtCQUFpQixLQUFLO0FBRTNCLFVBQU0sTUFBTSxjQUFjLENBQUMsR0FDekIsU0FBUyxNQUFNLElBQUksT0FBTyxNQUFNLE9BQU8sR0FDdkMsT0FDRSxPQUFPLFVBQVUsZUFBZSxLQUFLLFNBQVMsTUFBTSxXQUFXLEdBQUcsTUFBTSxZQUFZLE1BQU0sR0FDNUYsUUFBUSxNQUFNLFNBQVM7QUFDekIsUUFBSSxDQUFDLEtBQU07QUFDWCxVQUFNLFNBQVMsVUFBVTtBQUFBLE1BQ3ZCO0FBQUEsTUFDQSxNQUFNO0FBQUEsTUFDTjtBQUFBLE1BQ0E7QUFBQSxNQUNBLE9BQU8sV0FBVyxHQUFHLGNBQWMsQ0FBQyxLQUFLLE1BQU0sU0FBUyxNQUFNO0FBQUEsSUFDaEU7QUFDQSxnQkFBWSxLQUFLO0FBQUEsRUFDbkI7QUFFTyxXQUFTLGNBQWMsT0FBYyxPQUFpQixHQUF3QjtBQUVuRixRQUFJLEVBQUUsV0FBVyxFQUFFLFFBQVEsU0FBUyxFQUFHO0FBQ3ZDLE1BQUUsZ0JBQWdCO0FBQ2xCLE1BQUUsZUFBZTtBQUVqQixRQUFJLEVBQUUsUUFBUyxVQUFTLEtBQUs7QUFBQSxRQUN4QixrQkFBaUIsS0FBSztBQUUzQixVQUFNLE1BQU0sY0FBYyxDQUFDO0FBQzNCLFFBQUksQ0FBQyxJQUFLO0FBQ1YsVUFBTSxTQUFTLFVBQVU7QUFBQSxNQUN2QixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTjtBQUFBLE1BQ0EsT0FBTyxXQUFXLEdBQUcsY0FBYyxDQUFDLEtBQUssTUFBTSxTQUFTLE1BQU07QUFBQSxJQUNoRTtBQUNBLGdCQUFZLEtBQUs7QUFBQSxFQUNuQjtBQUVBLFdBQVMsWUFBWSxPQUFvQjtBQUN2QywwQkFBc0IsTUFBTTtBQUMxQixZQUFNLE1BQU0sTUFBTSxTQUFTLFNBQ3pCLFNBQVMsTUFBTSxJQUFJLE9BQU8sTUFBTSxPQUFPO0FBQ3pDLFVBQUksT0FBTyxRQUFRO0FBQ2pCLGNBQU0sT0FDSixlQUFlLElBQUksS0FBSyxTQUFTLE1BQU0sV0FBVyxHQUFHLE1BQU0sWUFBWSxNQUFNLEtBQzdFLHFCQUFxQixJQUFJLEtBQUssTUFBTSxNQUFNLE9BQU8sTUFBTSxJQUFJLE9BQU8sTUFBTSxZQUFZLENBQUM7QUFDdkYsWUFBSSxJQUFJLFNBQVMsUUFBUSxFQUFFLElBQUksUUFBUSxRQUFRLGVBQWUsTUFBTSxJQUFJLElBQUksSUFBSTtBQUM5RSxjQUFJLE9BQU87QUFDWCxnQkFBTSxJQUFJLFVBQVU7QUFBQSxRQUN0QjtBQUNBLGNBQU0sU0FBUztBQUFBLFVBQ2IsSUFBSSxJQUFJLENBQUM7QUFBQSxVQUNULElBQUksSUFBSSxDQUFDO0FBQUEsVUFDVCxTQUFTLE1BQU0sV0FBVztBQUFBLFVBQzFCLE1BQU07QUFBQSxVQUNOO0FBQUEsUUFDRjtBQUNBLFlBQUksQ0FBQyxJQUFJLFFBQVEsSUFBSSxTQUFTLFFBQVE7QUFDcEMsZ0JBQU1DLFFBQU8sU0FBUyxRQUFRLE1BQU0sYUFBYSxNQUFNLFlBQVksTUFBTSxXQUFXO0FBRXBGLHdCQUFjLElBQUksT0FBTztBQUFBLFlBQ3ZCLElBQUlBLE1BQUssQ0FBQyxJQUFJLE1BQU0sWUFBWSxDQUFDLElBQUk7QUFBQSxZQUNyQyxJQUFJQSxNQUFLLENBQUMsSUFBSSxNQUFNLFlBQVksQ0FBQyxJQUFJO0FBQUEsVUFDdkMsQ0FBQztBQUFBLFFBQ0g7QUFDQSxvQkFBWSxLQUFLO0FBQUEsTUFDbkI7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBRU8sV0FBUyxLQUFLLE9BQWMsR0FBd0I7QUFDekQsUUFBSSxNQUFNLFNBQVMsUUFBUyxPQUFNLFNBQVMsUUFBUSxNQUFNLGNBQWMsQ0FBQztBQUFBLEVBQzFFO0FBRU8sV0FBUyxJQUFJLE9BQWMsR0FBd0I7QUFDeEQsVUFBTSxNQUFNLE1BQU0sU0FBUztBQUMzQixRQUFJLEtBQUs7QUFDUCxlQUFTLE1BQU0sVUFBVSxHQUFHO0FBQzVCLGFBQU8sS0FBSztBQUFBLElBQ2Q7QUFBQSxFQUNGO0FBRU8sV0FBUyxPQUFPLE9BQW9CO0FBQ3pDLFFBQUksTUFBTSxTQUFTLFNBQVM7QUFDMUIsWUFBTSxTQUFTLFVBQVU7QUFDekIsWUFBTSxJQUFJLE9BQU87QUFBQSxJQUNuQjtBQUFBLEVBQ0Y7QUFFTyxXQUFTLE1BQU0sT0FBb0I7QUFDeEMsVUFBTSxpQkFBaUIsTUFBTSxTQUFTLE9BQU87QUFDN0MsUUFBSSxrQkFBa0IsTUFBTSxTQUFTLE9BQU87QUFDMUMsWUFBTSxTQUFTLFNBQVMsQ0FBQztBQUN6QixZQUFNLFNBQVMsUUFBUTtBQUN2QixZQUFNLElBQUksT0FBTztBQUNqQixVQUFJLGVBQWdCLFVBQVMsTUFBTSxRQUFRO0FBQUEsSUFDN0M7QUFBQSxFQUNGO0FBRU8sV0FBUyxhQUFhLE9BQWMsT0FBdUI7QUFDaEUsUUFBSSxNQUFNLFNBQVMsU0FBUyxVQUFVLE1BQU0sU0FBUyxPQUFPLEtBQUs7QUFDL0QsWUFBTSxTQUFTLFFBQVE7QUFBQSxRQUNwQixPQUFNLFNBQVMsUUFBUTtBQUM1QixVQUFNLElBQUksT0FBTztBQUFBLEVBQ25CO0FBRUEsV0FBUyxXQUFXLEdBQWtCLG9CQUFxQztBQTVLM0U7QUE2S0UsVUFBTSxPQUFPLHVCQUF1QixFQUFFLFlBQVksRUFBRSxVQUNsRCxPQUFPLEVBQUUsVUFBVSxFQUFFLGFBQVcsT0FBRSxxQkFBRiwyQkFBcUI7QUFDdkQsV0FBTyxTQUFTLE9BQU8sSUFBSSxNQUFNLE9BQU8sSUFBSSxFQUFFO0FBQUEsRUFDaEQ7QUFFQSxXQUFTLFNBQVMsVUFBb0IsS0FBd0I7QUFDNUQsUUFBSSxDQUFDLElBQUksS0FBTTtBQUVmLFVBQU0sZUFBZSxDQUFDLE1BQ3BCLElBQUksUUFBUSxlQUFlLElBQUksTUFBTSxFQUFFLElBQUksS0FBSyxlQUFlLElBQUksTUFBTSxFQUFFLElBQUk7QUFHakYsVUFBTSxRQUFRLElBQUk7QUFDbEIsUUFBSSxRQUFRO0FBRVosVUFBTSxVQUFVLFNBQVMsT0FBTyxLQUFLLFlBQVksR0FDL0MsY0FBYyxTQUFTLE9BQU87QUFBQSxNQUM1QixPQUFLLGFBQWEsQ0FBQyxLQUFLLFNBQVMsRUFBRSxTQUFTLFVBQVUsT0FBTyxFQUFFLEtBQUs7QUFBQSxJQUN0RSxHQUNBLFlBQVksU0FBUyxPQUFPO0FBQUEsTUFDMUIsT0FBSyxhQUFhLENBQUMsS0FBSyxTQUFTLEVBQUUsU0FBUyxDQUFDLFVBQVUsT0FBTyxFQUFFLEtBQUs7QUFBQSxJQUN2RTtBQUdGLFFBQUksUUFBUyxVQUFTLFNBQVMsU0FBUyxPQUFPLE9BQU8sT0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBRTNFLFFBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxLQUFLLFNBQVMsQ0FBQyxhQUFhO0FBQy9DLGVBQVMsT0FBTyxLQUFLLEVBQUUsTUFBTSxJQUFJLE1BQU0sTUFBTSxJQUFJLE1BQU0sT0FBYyxPQUFPLElBQUksTUFBTSxDQUFDO0FBRXZGLFVBQUksQ0FBQyxlQUFlLElBQUksTUFBTSxJQUFJLElBQUk7QUFDcEMsaUJBQVMsT0FBTyxLQUFLLEVBQUUsTUFBTSxJQUFJLE1BQU0sTUFBTSxJQUFJLE1BQU0sT0FBTyxJQUFJLE1BQU0sQ0FBQztBQUFBLElBQzdFO0FBRUEsUUFBSSxDQUFDLFdBQVcsYUFBYSxRQUFRLFVBQVUsSUFBSSxNQUFPLFVBQVMsT0FBTyxLQUFLLEdBQWdCO0FBQy9GLGFBQVMsUUFBUTtBQUFBLEVBQ25CO0FBRUEsV0FBUyxTQUFTLFVBQTBCO0FBQzFDLFFBQUksU0FBUyxTQUFVLFVBQVMsU0FBUyxTQUFTLE1BQU07QUFBQSxFQUMxRDs7O0FDekxPLFdBQVNDLE9BQU0sR0FBVSxHQUF3QjtBQTNCeEQ7QUE0QkUsVUFBTSxTQUFTLEVBQUUsSUFBSSxPQUFPLE1BQU0sT0FBTyxHQUN2QyxXQUFnQixjQUFjLENBQUMsR0FDL0IsT0FDRSxVQUNBLFlBQ0ssZUFBZSxVQUFlLFNBQVMsRUFBRSxXQUFXLEdBQUcsRUFBRSxZQUFZLE1BQU07QUFFcEYsUUFBSSxDQUFDLEtBQU07QUFFWCxVQUFNLFFBQVEsRUFBRSxPQUFPLElBQUksSUFBSSxHQUM3QixxQkFBcUIsRUFBRTtBQUN6QixRQUNFLENBQUMsc0JBQ0QsRUFBRSxTQUFTLFlBQ1YsRUFBRSxTQUFTLGdCQUFnQixDQUFDLFNBQVMsTUFBTSxVQUFVLEVBQUU7QUFFeEQsWUFBVSxDQUFDO0FBSWIsUUFDRSxFQUFFLGVBQWUsVUFDaEIsQ0FBQyxFQUFFLFdBQ0YsRUFBRSxvQkFDRixFQUFFLGlCQUNGLFNBQ0Esc0JBQ0EsYUFBYSxHQUFHLFVBQVUsTUFBTTtBQUVsQyxRQUFFLGVBQWU7QUFDbkIsVUFBTSxhQUFhLENBQUMsQ0FBQyxFQUFFLFdBQVc7QUFDbEMsVUFBTSxhQUFhLENBQUMsQ0FBQyxFQUFFLGFBQWE7QUFDcEMsUUFBSSxFQUFFLFdBQVcsY0FBZSxDQUFNLFlBQVksR0FBRyxJQUFJO0FBQUEsYUFDaEQsRUFBRSxVQUFVO0FBQ25CLFVBQUksQ0FBTyxvQkFBb0IsR0FBRyxFQUFFLFVBQVUsSUFBSSxHQUFHO0FBQ25ELFlBQVUsUUFBUSxHQUFHLEVBQUUsVUFBVSxJQUFJLEVBQUcsTUFBSyxXQUFlLGFBQWEsT0FBTyxJQUFJLEdBQUcsQ0FBQztBQUFBLFlBQ25GLENBQU0sYUFBYSxHQUFHLElBQUk7QUFBQSxNQUNqQztBQUFBLElBQ0YsV0FBVyxFQUFFLGVBQWU7QUFDMUIsVUFBSSxDQUFPLG9CQUFvQixHQUFHLEVBQUUsZUFBZSxJQUFJLEdBQUc7QUFDeEQsWUFBVSxRQUFRLEdBQUcsRUFBRSxlQUFlLElBQUk7QUFDeEMsZUFBSyxXQUFlLGFBQWEsT0FBTyxJQUFJLEdBQUcsQ0FBQztBQUFBLFlBQzdDLENBQU0sYUFBYSxHQUFHLElBQUk7QUFBQSxNQUNqQztBQUFBLElBQ0YsT0FBTztBQUNMLE1BQU0sYUFBYSxHQUFHLElBQUk7QUFBQSxJQUM1QjtBQUVBLFVBQU0sZ0JBQWdCLEVBQUUsYUFBYSxNQUNuQyxhQUFZLE9BQUUsSUFBSSxTQUFTLFVBQWYsbUJBQXNCO0FBRXBDLFFBQUksU0FBUyxhQUFhLGlCQUF1QixZQUFZLEdBQUcsS0FBSyxHQUFHO0FBQ3RFLFlBQU0sUUFBUSxFQUFFLFNBQVM7QUFFekIsUUFBRSxVQUFVLFVBQVU7QUFBQSxRQUNwQjtBQUFBLFFBQ0EsS0FBSztBQUFBLFFBQ0wsU0FBUztBQUFBLFFBQ1QsU0FBUyxFQUFFLFVBQVUsZ0JBQWdCLENBQUM7QUFBQSxRQUN0QztBQUFBLFFBQ0EsY0FBYyxFQUFFO0FBQUEsUUFDaEIsV0FBVztBQUFBLFVBQ1Q7QUFBQSxVQUNBO0FBQUEsVUFDQSxlQUFlO0FBQUEsUUFDakI7QUFBQSxNQUNGO0FBRUEsZ0JBQVUsVUFBVSxNQUFNO0FBQzFCLGdCQUFVLFNBQVMsTUFBTTtBQUN6QixnQkFBVSxZQUFZLFlBQWlCLFlBQVksS0FBSyxDQUFDO0FBQ3pELGdCQUFVLFVBQVUsT0FBTyxTQUFTLEtBQUs7QUFFekMsa0JBQVksQ0FBQztBQUFBLElBQ2YsT0FBTztBQUNMLFVBQUksV0FBWSxDQUFNLGFBQWEsQ0FBQztBQUNwQyxVQUFJLFdBQVksQ0FBTSxhQUFhLENBQUM7QUFBQSxJQUN0QztBQUNBLE1BQUUsSUFBSSxPQUFPO0FBQUEsRUFDZjtBQUVBLFdBQVMsYUFBYSxHQUFVLEtBQW9CLFFBQTBCO0FBQzVFLFVBQU0sVUFBZSxTQUFTLEVBQUUsV0FBVyxHQUN6QyxXQUFXLEtBQUssSUFBSSxPQUFPLFFBQVEsRUFBRSxXQUFXLE9BQU8sQ0FBQztBQUMxRCxlQUFXLE9BQU8sRUFBRSxPQUFPLEtBQUssR0FBRztBQUNqQyxZQUFNLFNBQWMsb0JBQW9CLEtBQUssU0FBUyxFQUFFLFlBQVksTUFBTTtBQUMxRSxVQUFTLFdBQVcsUUFBUSxHQUFHLEtBQUssU0FBVSxRQUFPO0FBQUEsSUFDdkQ7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUVPLFdBQVMsYUFBYSxHQUFVLE9BQWlCLEdBQWtCLE9BQXVCO0FBdkhqRztBQXdIRSxVQUFNLDBCQUEwQixFQUFFLGVBQ2hDLGFBQVksT0FBRSxJQUFJLFNBQVMsVUFBZixtQkFBc0IsU0FDbEMsV0FBZ0IsY0FBYyxDQUFDLEdBQy9CLFFBQVEsRUFBRSxTQUFTO0FBRXJCLFFBQUksQ0FBQywyQkFBMkIsQ0FBQyxTQUFTLEVBQUUsU0FBUyxXQUFXLEVBQUUsU0FBUztBQUN6RSxZQUFVLENBQUM7QUFFYixRQUFJLENBQUMsU0FBUyxFQUFFLFdBQVcsY0FBZSxnQkFBZSxHQUFHLEtBQUs7QUFBQSxRQUM1RCxDQUFNLFlBQVksR0FBRyxPQUFPLEtBQUs7QUFFdEMsVUFBTSxhQUFhLENBQUMsQ0FBQyxFQUFFLFdBQVcsU0FDaEMsYUFBYSxDQUFDLENBQUMsRUFBRSxhQUFhLFNBQzlCLGdCQUFnQixFQUFFLGlCQUFzQixVQUFVLEVBQUUsZUFBZSxLQUFLO0FBRTFFLFFBQUksYUFBYSxZQUFZLEVBQUUsaUJBQWlCLGlCQUF1QixZQUFZLEdBQUcsS0FBSyxHQUFHO0FBQzVGLFFBQUUsVUFBVSxVQUFVO0FBQUEsUUFDcEIsT0FBTyxFQUFFO0FBQUEsUUFDVCxLQUFLO0FBQUEsUUFDTCxTQUFTO0FBQUEsUUFDVDtBQUFBLFFBQ0EsU0FBUyxFQUFFLFVBQVUsZ0JBQWdCLENBQUM7QUFBQSxRQUN0QyxjQUFjLEVBQUU7QUFBQSxRQUNoQixhQUFhO0FBQUEsVUFDWCxjQUFjLENBQUMsUUFDWCxFQUFFLElBQUksT0FBTyxNQUFNLFlBQVksRUFBRSxJQUFTLFlBQVksS0FBSyxDQUFDLElBQzVEO0FBQUEsVUFDSixZQUFZO0FBQUEsVUFDWix5QkFBeUIsQ0FBQyxRQUFRLDBCQUEwQjtBQUFBLFFBQzlEO0FBQUEsTUFDRjtBQUVBLGdCQUFVLFVBQVUsTUFBTTtBQUMxQixnQkFBVSxTQUFTLE1BQU07QUFDekIsZ0JBQVUsWUFBWSxZQUFpQixZQUFZLEtBQUssQ0FBQztBQUN6RCxnQkFBVSxVQUFVLE9BQU8sU0FBUyxLQUFLO0FBRXpDLGtCQUFZLENBQUM7QUFBQSxJQUNmLE9BQU87QUFDTCxVQUFJLFdBQVksQ0FBTSxhQUFhLENBQUM7QUFDcEMsVUFBSSxXQUFZLENBQU0sYUFBYSxDQUFDO0FBQUEsSUFDdEM7QUFDQSxNQUFFLElBQUksT0FBTztBQUFBLEVBQ2Y7QUFFQSxXQUFTLFlBQVksR0FBZ0I7QUFDbkMsMEJBQXNCLE1BQU07QUF0SzlCO0FBdUtJLFlBQU0sTUFBTSxFQUFFLFVBQVUsU0FDdEIsYUFBWSxPQUFFLElBQUksU0FBUyxVQUFmLG1CQUFzQixTQUNsQyxTQUFTLEVBQUUsSUFBSSxPQUFPLE1BQU0sT0FBTztBQUNyQyxVQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxPQUFRO0FBRW5DLFlBQUksU0FBSSxjQUFKLG1CQUFlLFdBQVEsT0FBRSxVQUFVLFlBQVosbUJBQXFCLEtBQUssTUFBTSxJQUFJLElBQUksVUFBVTtBQUMzRSxVQUFFLFVBQVUsVUFBVTtBQUV4QixZQUFNLFlBQVksSUFBSSxZQUFZLEVBQUUsT0FBTyxJQUFJLElBQUksVUFBVSxJQUFJLElBQUksSUFBSTtBQUN6RSxVQUFJLENBQUMsYUFBYSxDQUFNLFVBQVUsV0FBVyxJQUFJLEtBQUssRUFBRyxDQUFBQyxRQUFPLENBQUM7QUFBQSxXQUM1RDtBQUNILFlBQ0UsQ0FBQyxJQUFJLFdBQ0EsV0FBVyxJQUFJLEtBQUssSUFBSSxPQUFPLEtBQUssS0FBSyxJQUFJLEVBQUUsVUFBVSxVQUFVLENBQUMsR0FDekU7QUFDQSxjQUFJLFVBQVU7QUFDZCxZQUFFLElBQUksT0FBTztBQUFBLFFBQ2Y7QUFDQSxZQUFJLElBQUksU0FBUztBQUNmLFVBQUs7QUFBQSxZQUNIO0FBQUEsWUFDQTtBQUFBLGNBQ0UsSUFBSSxJQUFJLENBQUMsSUFBSSxPQUFPLE9BQU8sT0FBTyxTQUFTLEVBQUUsV0FBVyxRQUFRO0FBQUEsY0FDaEUsSUFBSSxJQUFJLENBQUMsSUFBSSxPQUFPLE1BQU0sT0FBTyxVQUFVLEVBQUUsV0FBVyxRQUFRO0FBQUEsWUFDbEU7QUFBQSxZQUNBLEVBQUUsa0JBQWtCLE1BQU07QUFBQSxVQUM1QjtBQUVBLGNBQUksQ0FBQyxVQUFVLFlBQVk7QUFDekIsc0JBQVUsYUFBYTtBQUN2QixZQUFLLFdBQVcsV0FBVyxJQUFJO0FBQUEsVUFDakM7QUFDQSxnQkFBTSxRQUFhO0FBQUEsWUFDakIsSUFBSTtBQUFBLFlBQ0MsU0FBUyxFQUFFLFdBQVc7QUFBQSxZQUMzQixFQUFFO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFFQSxjQUFJLElBQUk7QUFDTixnQkFBSSxVQUFVLGdCQUFnQixJQUFJLFVBQVUsaUJBQWlCLElBQUksVUFBVSxTQUFTO0FBQUEsbUJBQzdFLElBQUk7QUFDWCxnQkFBSSxZQUFZLGFBQ2QsSUFBSSxZQUFZLGNBQ2YsQ0FBQyxDQUFDLElBQUksWUFBWSxnQkFDakIsQ0FBTSxhQUFhLElBQUksWUFBWSxjQUFjLElBQUksR0FBRztBQUc5RCxjQUFJLFVBQVUsRUFBRSxTQUFTO0FBQ3ZCLGlDQUFxQixHQUFHLEtBQUs7QUFDN0IsZ0JBQUksSUFBSSxXQUFTLE9BQUUsSUFBSSxTQUFTLFVBQWYsbUJBQXNCLGFBQVk7QUFDakQsa0JBQUksU0FBUyxFQUFFLFVBQVUsd0JBQXdCO0FBQy9DLGdCQUFLO0FBQUEsa0JBQ0gsRUFBRSxJQUFJLFNBQVMsTUFBTTtBQUFBLGtCQUNoQixrQkFBa0IsRUFBRSxZQUFZLE1BQU07QUFBQSxvQkFDcEMsUUFBUSxLQUFLO0FBQUEsb0JBQ2IsU0FBUyxFQUFFLFdBQVc7QUFBQSxrQkFDN0I7QUFBQSxrQkFDQTtBQUFBLGdCQUNGO0FBQ0EsZ0JBQUssV0FBVyxFQUFFLElBQUksU0FBUyxNQUFNLFlBQVksSUFBSTtBQUFBLGNBQ3ZELE9BQU87QUFDTCxnQkFBSyxXQUFXLEVBQUUsSUFBSSxTQUFTLE1BQU0sWUFBWSxLQUFLO0FBQUEsY0FDeEQ7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQ0Esa0JBQVksQ0FBQztBQUFBLElBQ2YsQ0FBQztBQUFBLEVBQ0g7QUFFTyxXQUFTQyxNQUFLLEdBQVUsR0FBd0I7QUFFckQsUUFBSSxFQUFFLFVBQVUsWUFBWSxDQUFDLEVBQUUsV0FBVyxFQUFFLFFBQVEsU0FBUyxJQUFJO0FBQy9ELFFBQUUsVUFBVSxRQUFRLE1BQVcsY0FBYyxDQUFDO0FBQUEsSUFDaEQsWUFDRyxFQUFFLFlBQVksRUFBRSxpQkFBaUIsRUFBRSxVQUFVLFlBQzlDLENBQUMsRUFBRSxVQUFVLFlBQ1osQ0FBQyxFQUFFLFdBQVcsRUFBRSxRQUFRLFNBQVMsSUFDbEM7QUFDQSxZQUFNLFNBQVMsRUFBRSxJQUFJLE9BQU8sTUFBTSxPQUFPLEdBQ3ZDLFFBQ0UsVUFDSztBQUFBLFFBQ0UsY0FBYyxDQUFDO0FBQUEsUUFDZixTQUFTLEVBQUUsV0FBVztBQUFBLFFBQzNCLEVBQUU7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUNKLFVBQUksVUFBVSxFQUFFLFFBQVMsc0JBQXFCLEdBQUcsS0FBSztBQUFBLElBQ3hEO0FBQUEsRUFDRjtBQUVPLFdBQVNDLEtBQUksR0FBVSxHQUF3QjtBQXJRdEQ7QUFzUUUsVUFBTSxNQUFNLEVBQUUsVUFBVTtBQUN4QixRQUFJLENBQUMsSUFBSztBQUVWLFFBQUksRUFBRSxTQUFTLGNBQWMsRUFBRSxlQUFlLE1BQU8sR0FBRSxlQUFlO0FBR3RFLFFBQUksRUFBRSxTQUFTLGNBQWMsSUFBSSxpQkFBaUIsRUFBRSxVQUFVLENBQUMsSUFBSSxhQUFhO0FBQzlFLFFBQUUsVUFBVSxVQUFVO0FBQ3RCLFVBQUksRUFBRSxXQUFXLENBQUMsRUFBRSxVQUFVLFFBQVMsc0JBQXFCLEdBQUcsTUFBUztBQUN4RTtBQUFBLElBQ0Y7QUFDQSxJQUFNLGFBQWEsQ0FBQztBQUNwQixJQUFNLGFBQWEsQ0FBQztBQUVwQixVQUFNLFdBQWdCLGNBQWMsQ0FBQyxLQUFLLElBQUksS0FDNUMsU0FBUyxFQUFFLElBQUksT0FBTyxNQUFNLE9BQU8sR0FDbkMsT0FDRSxVQUFlLGVBQWUsVUFBZSxTQUFTLEVBQUUsV0FBVyxHQUFHLEVBQUUsWUFBWSxNQUFNO0FBRTlGLFFBQUksUUFBUSxJQUFJLGFBQVcsU0FBSSxjQUFKLG1CQUFlLFVBQVMsTUFBTTtBQUN2RCxVQUFJLElBQUksZUFBZSxDQUFPLG9CQUFvQixHQUFHLElBQUksT0FBTyxJQUFJO0FBQ2xFLFFBQU0sU0FBUyxHQUFHLElBQUksT0FBTyxJQUFJO0FBQUEsZUFDMUIsSUFBSSxhQUFhLENBQU8sb0JBQW9CLEdBQUcsSUFBSSxVQUFVLE1BQU0sSUFBSTtBQUM5RSxRQUFNLFNBQVMsR0FBRyxJQUFJLFVBQVUsTUFBTSxJQUFJO0FBQUEsSUFDOUMsV0FBVyxFQUFFLFVBQVUsbUJBQW1CLENBQUMsTUFBTTtBQUMvQyxVQUFJLElBQUksVUFBVyxHQUFFLE9BQU8sT0FBTyxJQUFJLFVBQVUsSUFBSTtBQUFBLGVBQzVDLElBQUksZUFBZSxDQUFDLEVBQUUsVUFBVSxNQUFPLGdCQUFlLEdBQUcsSUFBSSxLQUFLO0FBRTNFLFVBQUksRUFBRSxVQUFVLG9CQUFvQjtBQUNsQyxjQUFNLGFBQWEsRUFBRSxJQUFJLE9BQU8sTUFBTSxPQUFPLEdBQzNDLGdCQUFnQixXQUFXLElBQUksS0FBSyxHQUNwQyxtQkFBbUIsV0FBVyxJQUFJLFFBQVE7QUFDNUMsWUFBSSxpQkFBc0IsYUFBYSxlQUFlLElBQUksR0FBRztBQUMzRCxvQkFBVSxHQUFHLEVBQUUsT0FBWSxTQUFTLEVBQUUsV0FBVyxHQUFHLE1BQU0sSUFBSSxNQUFNLEtBQUssQ0FBQztBQUFBLGlCQUNuRSxvQkFBeUIsYUFBYSxrQkFBa0IsSUFBSSxHQUFHO0FBQ3RFLG9CQUFVLEdBQUcsRUFBRSxPQUFPLEVBQUUsYUFBYSxNQUFNLElBQUksTUFBTSxLQUFLLENBQUM7QUFBQSxNQUMvRDtBQUNBLE1BQUssaUJBQWlCLEVBQUUsT0FBTyxNQUFNO0FBQUEsSUFDdkM7QUFFQSxRQUNFLElBQUksY0FDSCxJQUFJLFVBQVUsU0FBUyxJQUFJLFVBQVUsc0JBQXNCLElBQUksVUFBVSxtQkFDekUsSUFBSSxVQUFVLFNBQVMsUUFBUSxDQUFDLE9BQ2pDO0FBQ0EsTUFBQUMsVUFBUyxHQUFHLEtBQUssSUFBSTtBQUFBLElBQ3ZCLFdBQ0csQ0FBQyxVQUFRLFNBQUksZ0JBQUosbUJBQWlCLGlCQUMxQixTQUFJLGdCQUFKLG1CQUFpQixpQkFDWCxhQUFhLElBQUksWUFBWSxjQUFjLElBQUksR0FBRyxLQUN2RCxJQUFJLFlBQVksMkJBQ1gsVUFBVSxJQUFJLFlBQVkseUJBQXlCLElBQUksS0FBSyxHQUNuRTtBQUNBLE1BQUFBLFVBQVMsR0FBRyxLQUFLLElBQUk7QUFBQSxJQUN2QixXQUFXLENBQUMsRUFBRSxXQUFXLFdBQVcsQ0FBQyxFQUFFLFVBQVUsU0FBUztBQUN4RCxNQUFBQSxVQUFTLEdBQUcsS0FBSyxJQUFJO0FBQUEsSUFDdkI7QUFFQSxNQUFFLFVBQVUsVUFBVTtBQUN0QixRQUFJLENBQUMsRUFBRSxVQUFVLFdBQVcsQ0FBQyxFQUFFLFVBQVUsUUFBUyxHQUFFLFVBQVU7QUFDOUQsTUFBRSxJQUFJLE9BQU87QUFBQSxFQUNmO0FBRUEsV0FBU0EsVUFBUyxHQUFVLEtBQWtCLE1BQXFCO0FBclVuRTtBQXNVRSxRQUFJLElBQUksYUFBYSxJQUFJLFVBQVUsU0FBUztBQUMxQyxNQUFLLGlCQUFpQixFQUFFLE9BQU8sVUFBVSxJQUFJLFVBQVUsSUFBSTtBQUFBLGVBRTNELFNBQUksZ0JBQUosbUJBQWlCLGlCQUNaLGFBQWEsSUFBSSxZQUFZLGNBQWMsSUFBSSxHQUFHO0FBRXZELE1BQUssaUJBQWlCLEVBQUUsT0FBTyxlQUFlLElBQUksS0FBSztBQUN6RCxJQUFNLFNBQVMsQ0FBQztBQUFBLEVBQ2xCO0FBRU8sV0FBU0gsUUFBTyxHQUFnQjtBQUNyQyxRQUFJLEVBQUUsVUFBVSxTQUFTO0FBQ3ZCLFFBQUUsVUFBVSxVQUFVO0FBQ3RCLFVBQUksQ0FBQyxFQUFFLFVBQVUsUUFBUyxHQUFFLFVBQVU7QUFDdEMsTUFBTSxTQUFTLENBQUM7QUFDaEIsUUFBRSxJQUFJLE9BQU87QUFBQSxJQUNmO0FBQUEsRUFDRjtBQUdPLFdBQVMsY0FBYyxHQUEyQjtBQUN2RCxXQUNFLENBQUMsRUFBRSxhQUNGLEVBQUUsV0FBVyxVQUFhLEVBQUUsV0FBVyxLQUN2QyxDQUFDLENBQUMsRUFBRSxXQUFXLEVBQUUsUUFBUSxTQUFTO0FBQUEsRUFFdkM7QUFFQSxXQUFTLGlCQUFpQixHQUFVLEtBQXNCO0FBQ3hELFdBQ0csQ0FBQyxDQUFDLEVBQUUsYUFBbUIsUUFBUSxHQUFHLEVBQUUsVUFBVSxHQUFHLEtBQVcsV0FBVyxHQUFHLEVBQUUsVUFBVSxHQUFHLE1BQ3pGLENBQUMsQ0FBQyxFQUFFLGtCQUNJLFFBQVEsR0FBRyxFQUFFLGVBQWUsR0FBRyxLQUFXLFdBQVcsR0FBRyxFQUFFLGVBQWUsR0FBRztBQUFBLEVBRXpGO0FBRUEsV0FBUyxxQkFBcUIsR0FBVSxLQUErQjtBQTFXdkU7QUEyV0UsVUFBTSxhQUFZLE9BQUUsSUFBSSxTQUFTLFVBQWYsbUJBQXNCLFFBQVE7QUFDaEQsUUFBSSxDQUFDLGFBQWEsRUFBRSxVQUFVLFFBQVM7QUFFdkMsVUFBTSxZQUFZLEVBQUU7QUFDcEIsUUFBSSxFQUFFLFVBQVUsV0FBWSxPQUFPLGlCQUFpQixHQUFHLEdBQUcsRUFBSSxHQUFFLFVBQVU7QUFBQSxRQUNyRSxHQUFFLFVBQVU7QUFFakIsVUFBTSxVQUFlLFNBQVMsRUFBRSxXQUFXLEdBQ3pDLFdBQVcsRUFBRSxXQUFnQixvQkFBb0IsRUFBRSxTQUFTLFNBQVMsRUFBRSxVQUFVLEdBQ2pGLGFBQWEsYUFBYSxVQUFhLFVBQVUsUUFBUTtBQUMzRCxRQUFJLFdBQVksWUFBVyxVQUFVLElBQUksT0FBTztBQUVoRCxVQUFNLFlBQVksYUFBa0Isb0JBQW9CLFdBQVcsU0FBUyxFQUFFLFVBQVUsR0FDdEYsY0FBYyxjQUFjLFVBQWEsVUFBVSxTQUFTO0FBQzlELFFBQUksWUFBYSxhQUFZLFVBQVUsT0FBTyxPQUFPO0FBQUEsRUFDdkQ7OztBQ3hYTyxXQUFTLE9BQU8sVUFBOEI7QUFDbkQsWUFBUSxVQUFVO0FBQUEsTUFDaEIsS0FBSztBQUNILGVBQU87QUFBQSxVQUNMO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsUUFDRjtBQUFBLE1BQ0YsS0FBSztBQUNILGVBQU87QUFBQSxVQUNMO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsUUFDRjtBQUFBLE1BQ0YsS0FBSztBQUNILGVBQU8sQ0FBQyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxHQUFHO0FBQUEsTUFDeEYsS0FBSztBQUNILGVBQU8sQ0FBQyxNQUFNLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxHQUFHO0FBQUEsTUFDekY7QUFDRSxlQUFPO0FBQUEsVUFDTDtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFFBQ0Y7QUFBQSxJQUNKO0FBQUEsRUFDRjs7O0FDbkRPLFdBQVMsVUFBVSxXQUF3QixHQUF5QjtBQW1CekUsVUFBTSxRQUFRLFNBQVMsVUFBVTtBQUVqQyxVQUFNLFVBQVUsY0FBYyxFQUFFLFlBQVksRUFBRSxXQUFXO0FBQ3pELFVBQU0sWUFBWSxPQUFPO0FBRXpCLFVBQU0sU0FBUyxTQUFTLFdBQVc7QUFDbkMsVUFBTSxZQUFZLE1BQU07QUFFeEIsUUFBSSxTQUFTLFdBQVc7QUFDeEIsUUFBSSxDQUFDLEVBQUUsVUFBVTtBQUNmLGdCQUFVLFNBQVMsT0FBTztBQUMxQixpQkFBVyxTQUFTLEtBQUs7QUFDekIsWUFBTSxZQUFZLE9BQU87QUFFekIsa0JBQVksU0FBUyxjQUFjO0FBQ25DLGlCQUFXLFdBQVcsS0FBSztBQUMzQixZQUFNLFlBQVksU0FBUztBQUUzQixtQkFBYSxTQUFTLGdCQUFnQjtBQUN0QyxpQkFBVyxZQUFZLEtBQUs7QUFDNUIsWUFBTSxZQUFZLFVBQVU7QUFBQSxJQUM5QjtBQUVBLFFBQUk7QUFDSixRQUFJLEVBQUUsU0FBUyxTQUFTO0FBQ3RCLFlBQU0sTUFBTSxjQUFjLGlCQUFpQixLQUFLLEdBQUc7QUFBQSxRQUNqRCxPQUFPO0FBQUEsUUFDUCxTQUFTLElBQUksRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxXQUFXLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQyxJQUNqRyxFQUFFLFdBQVcsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUN0QztBQUFBLE1BQ0YsQ0FBQztBQUNELFVBQUksWUFBWSxpQkFBaUIsTUFBTSxDQUFDO0FBQ3hDLFVBQUksWUFBWSxpQkFBaUIsR0FBRyxDQUFDO0FBRXJDLFlBQU0sWUFBWSxjQUFjLGlCQUFpQixLQUFLLEdBQUc7QUFBQSxRQUN2RCxPQUFPO0FBQUEsUUFDUCxTQUFTLE9BQU8sRUFBRSxXQUFXLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFBQSxNQUNoRyxDQUFDO0FBQ0QsZ0JBQVUsWUFBWSxpQkFBaUIsR0FBRyxDQUFDO0FBRTNDLFlBQU0sYUFBYSxTQUFTLGdCQUFnQjtBQUU1QyxZQUFNLFlBQVksR0FBRztBQUNyQixZQUFNLFlBQVksU0FBUztBQUMzQixZQUFNLFlBQVksVUFBVTtBQUU1QixlQUFTO0FBQUEsUUFDUDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFFQSxRQUFJLEVBQUUsWUFBWSxTQUFTO0FBQ3pCLFlBQU0sY0FBYyxFQUFFLGdCQUFnQixTQUFTLFVBQVUsSUFDdkRJLFNBQVEsT0FBTyxFQUFFLFlBQVksS0FBSyxHQUNsQ0MsU0FBUSxPQUFPLEVBQUUsWUFBWSxLQUFLO0FBQ3BDLFlBQU0sWUFBWSxhQUFhRCxRQUFPLFVBQVUsYUFBYSxFQUFFLFdBQVcsS0FBSyxDQUFDO0FBQ2hGLFlBQU0sWUFBWSxhQUFhQyxRQUFPLFVBQVUsYUFBYSxFQUFFLFdBQVcsS0FBSyxDQUFDO0FBQUEsSUFDbEY7QUFFQSxjQUFVLFlBQVk7QUFFdEIsVUFBTSxTQUFTLEtBQUssRUFBRSxXQUFXLEtBQUssSUFBSSxFQUFFLFdBQVcsS0FBSztBQUc1RCxjQUFVLFVBQVUsUUFBUSxPQUFLO0FBQy9CLFVBQUksRUFBRSxVQUFVLEdBQUcsQ0FBQyxNQUFNLFFBQVEsTUFBTSxPQUFRLFdBQVUsVUFBVSxPQUFPLENBQUM7QUFBQSxJQUM5RSxDQUFDO0FBR0QsY0FBVSxVQUFVLElBQUksV0FBVyxNQUFNO0FBRXpDLGVBQVcsS0FBSyxPQUFRLFdBQVUsVUFBVSxPQUFPLGlCQUFpQixHQUFHLEVBQUUsZ0JBQWdCLENBQUM7QUFDMUYsY0FBVSxVQUFVLE9BQU8sZUFBZSxDQUFDLEVBQUUsUUFBUTtBQUVyRCxjQUFVLFlBQVksS0FBSztBQUUzQixRQUFJO0FBQ0osUUFBSSxFQUFFLE1BQU0sU0FBUztBQUNuQixZQUFNLGNBQWMsU0FBUyxnQkFBZ0IsU0FBUyxHQUNwRCxpQkFBaUIsU0FBUyxnQkFBZ0IsU0FBUztBQUNyRCxnQkFBVSxhQUFhLGdCQUFnQixNQUFNLGtCQUFrQjtBQUMvRCxnQkFBVSxhQUFhLGFBQWEsS0FBSztBQUN6QyxjQUFRO0FBQUEsUUFDTixLQUFLO0FBQUEsUUFDTCxRQUFRO0FBQUEsTUFDVjtBQUFBLElBQ0Y7QUFFQSxXQUFPO0FBQUEsTUFDTDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUVPLFdBQVMsU0FBUyxVQUF1QixLQUF1QixHQUF1QjtBQUM1RixVQUFNLE9BQU9DLFlBQVcsUUFBUSxRQUFRLFNBQVMsRUFBRSxXQUFXLElBQUksRUFBRSxhQUFhLEVBQUUsTUFBTSxLQUFLO0FBQzlGLGFBQVMsWUFBWTtBQUVyQixVQUFNLGFBQWEsS0FBSyxFQUFFLE1BQU0sTUFBTSxNQUFNO0FBRzVDLGFBQVMsVUFBVSxRQUFRLE9BQUs7QUFDOUIsVUFBSSxFQUFFLFVBQVUsR0FBRyxDQUFDLE1BQU0sUUFBUSxNQUFNLFdBQVksVUFBUyxVQUFVLE9BQU8sQ0FBQztBQUFBLElBQ2pGLENBQUM7QUFHRCxhQUFTLFVBQVUsSUFBSSxnQkFBZ0IsUUFBUSxHQUFHLElBQUksVUFBVTtBQUNoRSxhQUFTLFlBQVksSUFBSTtBQUV6QixlQUFXLEtBQUssT0FBUSxVQUFTLFVBQVUsT0FBTyxpQkFBaUIsR0FBRyxFQUFFLGdCQUFnQixDQUFDO0FBQ3pGLGFBQVMsVUFBVSxPQUFPLGVBQWUsQ0FBQyxFQUFFLFFBQVE7QUFFcEQsV0FBTztBQUFBLEVBQ1Q7QUFFQSxXQUFTLGFBQWEsT0FBMEIsV0FBbUIsTUFBMkI7QUFDNUYsVUFBTSxLQUFLLFNBQVMsVUFBVSxTQUFTO0FBQ3ZDLFFBQUk7QUFDSixlQUFXLFFBQVEsTUFBTSxNQUFNLENBQUMsSUFBSSxHQUFHO0FBQ3JDLFVBQUksU0FBUyxPQUFPO0FBQ3BCLFFBQUUsY0FBYztBQUNoQixTQUFHLFlBQVksQ0FBQztBQUFBLElBQ2xCO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFFQSxXQUFTLGNBQWMsTUFBa0IsYUFBaUM7QUFDeEUsVUFBTSxVQUFVLFNBQVMsWUFBWTtBQUVyQyxhQUFTLElBQUksR0FBRyxJQUFJLEtBQUssUUFBUSxLQUFLLE9BQU8sS0FBSztBQUNoRCxZQUFNLEtBQUssU0FBUyxJQUFJO0FBQ3hCLFNBQUcsUUFDRCxnQkFBZ0IsVUFDWixRQUFRLENBQUMsS0FBSyxRQUFRLElBQUssSUFBSSxLQUFLLE9BQVEsS0FBSyxNQUFNLElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxJQUN2RSxRQUFRLENBQUMsSUFBSSxLQUFLLE9BQU8sS0FBSyxRQUFRLElBQUksS0FBSyxNQUFNLElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQztBQUMzRSxjQUFRLFlBQVksRUFBRTtBQUFBLElBQ3hCO0FBRUEsV0FBTztBQUFBLEVBQ1Q7QUFFQSxXQUFTQSxZQUFXLE9BQWMsT0FBa0M7QUFDbEUsVUFBTSxPQUFPLFNBQVMsU0FBUztBQUMvQixlQUFXLFFBQVEsT0FBTztBQUN4QixZQUFNLFFBQVEsRUFBRSxNQUFZLE1BQWEsR0FDdkMsU0FBUyxTQUFTLFlBQVksR0FDOUIsVUFBVSxTQUFTLFNBQVMsWUFBWSxLQUFLLENBQUM7QUFDaEQsY0FBUSxVQUFVO0FBQ2xCLGNBQVEsU0FBUztBQUNqQixhQUFPLFlBQVksT0FBTztBQUMxQixXQUFLLFlBQVksTUFBTTtBQUFBLElBQ3pCO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7OztBQy9LQSxXQUFTLFlBQVksR0FBZ0I7QUFDbkMsTUFBRSxJQUFJLE9BQU8sTUFBTSxPQUFPLE1BQU07QUFDaEMsTUFBRSxJQUFJLE9BQU8sTUFBTSxPQUFPLE1BQU07QUFDaEMsTUFBRSxJQUFJLE9BQU8sTUFBTSxZQUFZLE1BQU07QUFBQSxFQUN2QztBQUVBLFdBQVMsU0FBUyxHQUFzQjtBQUN0QyxXQUFPLE1BQU07QUFDWCxrQkFBWSxDQUFDO0FBQ2IsVUFBSSxXQUFXLEVBQUUsU0FBUyxPQUFPLE9BQU8sRUFBRSxTQUFTLFVBQVUsQ0FBQyxFQUFHLEdBQUUsSUFBSSxhQUFhO0FBQUEsSUFDdEY7QUFBQSxFQUNGO0FBRU8sV0FBUyxVQUFVLEdBQVUsVUFBa0M7QUFDcEUsUUFBSSxvQkFBb0IsT0FBUSxLQUFJLGVBQWUsU0FBUyxDQUFDLENBQUMsRUFBRSxRQUFRLFNBQVMsS0FBSztBQUV0RixRQUFJLEVBQUUsU0FBVTtBQUVoQixVQUFNLFdBQVcsU0FBUyxRQUN4QixjQUFjLFNBQVM7QUFHekIsVUFBTSxVQUFVLGdCQUFnQixDQUFDO0FBQ2pDLGFBQVMsaUJBQWlCLGNBQWMsU0FBMEI7QUFBQSxNQUNoRSxTQUFTO0FBQUEsSUFDWCxDQUFDO0FBQ0QsYUFBUyxpQkFBaUIsYUFBYSxTQUEwQjtBQUFBLE1BQy9ELFNBQVM7QUFBQSxJQUNYLENBQUM7QUFDRCxRQUFJLEVBQUUsc0JBQXNCLEVBQUUsU0FBUztBQUNyQyxlQUFTLGlCQUFpQixlQUFlLE9BQUssRUFBRSxlQUFlLENBQUM7QUFFbEUsUUFBSSxhQUFhO0FBQ2YsWUFBTSxpQkFBaUIsQ0FBQyxNQUFxQixRQUFRLEdBQUcsQ0FBQztBQUN6RCxrQkFBWSxpQkFBaUIsU0FBUyxjQUErQjtBQUNyRSxVQUFJLEVBQUUsbUJBQW9CLGFBQVksaUJBQWlCLGVBQWUsT0FBSyxFQUFFLGVBQWUsQ0FBQztBQUFBLElBQy9GO0FBQUEsRUFDRjtBQUVPLFdBQVMsU0FBUyxHQUFVLFFBQTJCO0FBQzVELFFBQUksb0JBQW9CLE9BQVEsS0FBSSxlQUFlLFNBQVMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxNQUFNO0FBRTlFLFFBQUksRUFBRSxTQUFVO0FBRWhCLFVBQU0sVUFBVSxrQkFBa0IsQ0FBQztBQUNuQyxXQUFPLGlCQUFpQixhQUFhLFNBQTBCLEVBQUUsU0FBUyxNQUFNLENBQUM7QUFDakYsV0FBTyxpQkFBaUIsY0FBYyxTQUEwQjtBQUFBLE1BQzlELFNBQVM7QUFBQSxJQUNYLENBQUM7QUFDRCxXQUFPLGlCQUFpQixTQUFTLE1BQU07QUFDckMsVUFBSSxFQUFFLFVBQVUsU0FBUztBQUN2Qix3QkFBZ0IsQ0FBQztBQUNqQixVQUFFLElBQUksT0FBTztBQUFBLE1BQ2Y7QUFBQSxJQUNGLENBQUM7QUFFRCxRQUFJLEVBQUUsc0JBQXNCLEVBQUUsU0FBUztBQUNyQyxhQUFPLGlCQUFpQixlQUFlLE9BQUssRUFBRSxlQUFlLENBQUM7QUFBQSxFQUNsRTtBQUdPLFdBQVMsYUFBYSxHQUFxQjtBQUNoRCxVQUFNLFVBQXVCLENBQUM7QUFJOUIsUUFBSSxFQUFFLG9CQUFvQixTQUFTO0FBQ2pDLGNBQVEsS0FBSyxXQUFXLFNBQVMsTUFBTSxzQkFBc0IsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUFBLElBQzNFO0FBRUEsUUFBSSxDQUFDLEVBQUUsVUFBVTtBQUNmLFlBQU0sU0FBUyxXQUFXLEdBQVFDLE9BQVcsSUFBSSxHQUMvQyxRQUFRLFdBQVcsR0FBUUMsTUFBVSxHQUFHO0FBRTFDLGlCQUFXLE1BQU0sQ0FBQyxhQUFhLFdBQVc7QUFDeEMsZ0JBQVEsS0FBSyxXQUFXLFVBQVUsSUFBSSxNQUF1QixDQUFDO0FBQ2hFLGlCQUFXLE1BQU0sQ0FBQyxZQUFZLFNBQVM7QUFDckMsZ0JBQVEsS0FBSyxXQUFXLFVBQVUsSUFBSSxLQUFzQixDQUFDO0FBRS9ELGNBQVE7QUFBQSxRQUNOLFdBQVcsVUFBVSxVQUFVLE1BQU0sWUFBWSxDQUFDLEdBQUcsRUFBRSxTQUFTLE1BQU0sU0FBUyxLQUFLLENBQUM7QUFBQSxNQUN2RjtBQUNBLGNBQVEsS0FBSyxXQUFXLFFBQVEsVUFBVSxNQUFNLFlBQVksQ0FBQyxHQUFHLEVBQUUsU0FBUyxLQUFLLENBQUMsQ0FBQztBQUFBLElBQ3BGO0FBRUEsV0FBTyxNQUFNLFFBQVEsUUFBUSxPQUFLLEVBQUUsQ0FBQztBQUFBLEVBQ3ZDO0FBRUEsV0FBUyxXQUNQLElBQ0EsV0FDQSxVQUNBLFNBQ1c7QUFDWCxPQUFHLGlCQUFpQixXQUFXLFVBQVUsT0FBTztBQUNoRCxXQUFPLE1BQU0sR0FBRyxvQkFBb0IsV0FBVyxVQUFVLE9BQU87QUFBQSxFQUNsRTtBQUVBLFdBQVMsZ0JBQWdCLEdBQXFCO0FBQzVDLFdBQU8sT0FBSztBQUNWLFVBQUksRUFBRSxVQUFVLFFBQVMsQ0FBS0MsUUFBTyxDQUFDO0FBQUEsZUFDN0IsRUFBRSxTQUFTLFFBQVMsQ0FBSyxPQUFPLENBQUM7QUFBQSxlQUNqQyxFQUFFLFlBQVksY0FBYyxDQUFDLEtBQUssRUFBRSxTQUFTLFFBQVE7QUFDNUQsWUFBSSxFQUFFLFNBQVMsUUFBUyxDQUFLLE1BQU0sR0FBRyxDQUFDO0FBQUEsTUFDekMsV0FBVyxDQUFDLEVBQUUsWUFBWSxDQUFNLGNBQWMsQ0FBQyxFQUFHLENBQUtDLE9BQU0sR0FBRyxDQUFDO0FBQUEsSUFDbkU7QUFBQSxFQUNGO0FBRUEsV0FBUyxXQUFXLEdBQVUsVUFBMEIsVUFBcUM7QUFDM0YsV0FBTyxPQUFLO0FBQ1YsVUFBSSxFQUFFLFNBQVMsU0FBUztBQUN0QixZQUFJLEVBQUUsU0FBUyxRQUFTLFVBQVMsR0FBRyxDQUFDO0FBQUEsTUFDdkMsV0FBVyxDQUFDLEVBQUUsU0FBVSxVQUFTLEdBQUcsQ0FBQztBQUFBLElBQ3ZDO0FBQUEsRUFDRjtBQUVBLFdBQVMsa0JBQWtCLEdBQXFCO0FBQzlDLFdBQU8sT0FBSztBQUNWLFVBQUksRUFBRSxVQUFVLFFBQVM7QUFFekIsWUFBTSxNQUFNLGNBQWMsQ0FBQyxHQUN6QixRQUFRLE9BQU8scUJBQXFCLEtBQUssRUFBRSxNQUFNLE9BQU8sRUFBRSxJQUFJLE9BQU8sTUFBTSxZQUFZLENBQUM7QUFFMUYsVUFBSSxPQUFPO0FBQ1QsWUFBSSxFQUFFLFVBQVUsUUFBUyxDQUFLRCxRQUFPLENBQUM7QUFBQSxpQkFDN0IsRUFBRSxTQUFTLFFBQVMsQ0FBSyxPQUFPLENBQUM7QUFBQSxpQkFDakMsZUFBZSxDQUFDLEdBQUc7QUFDMUIsY0FBSSxFQUFFLFNBQVMsU0FBUztBQUN0QixnQkFBSSxFQUFFLGVBQWUsTUFBTyxHQUFFLGVBQWU7QUFDN0MsWUFBSyxhQUFhLEdBQUcsS0FBSztBQUFBLFVBQzVCO0FBQUEsUUFDRixXQUFXLEVBQUUsWUFBWSxjQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsUUFBUTtBQUM5RCxjQUFJLEVBQUUsU0FBUyxRQUFTLENBQUssY0FBYyxHQUFHLE9BQU8sQ0FBQztBQUFBLFFBQ3hELFdBQVcsQ0FBQyxFQUFFLFlBQVksQ0FBTSxjQUFjLENBQUMsR0FBRztBQUNoRCxjQUFJLEVBQUUsZUFBZSxNQUFPLEdBQUUsZUFBZTtBQUM3QyxVQUFLLGFBQWEsR0FBRyxPQUFPLENBQUM7QUFBQSxRQUMvQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUVBLFdBQVMsUUFBUSxHQUFVLEdBQXdCO0FBQ2pELE1BQUUsZ0JBQWdCO0FBRWxCLFVBQU0sU0FBUyxFQUFFLFFBQ2YsTUFBTSxFQUFFLFVBQVU7QUFDcEIsUUFBSSxVQUFVLFlBQVksTUFBTSxLQUFLLEtBQUs7QUFDeEMsWUFBTSxRQUFRLEVBQUUsT0FBTyxPQUFPLFNBQVMsTUFBTSxPQUFPLE9BQU8sR0FDekQsT0FBTyxDQUFDLFVBQVUsSUFBSSxPQUFPLEtBQUs7QUFDcEMsVUFBSSxJQUFJLFdBQVksRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixRQUFTO0FBQzlFLFlBQUksRUFBRSxTQUFVLFVBQVMsR0FBRyxFQUFFLFVBQVUsSUFBSSxLQUFLLElBQUk7QUFBQSxpQkFDNUMsRUFBRSxjQUFlLFVBQVMsR0FBRyxFQUFFLGVBQWUsSUFBSSxLQUFLLElBQUk7QUFBQSxNQUN0RSxNQUFPLE1BQUssQ0FBQUUsT0FBSyxhQUFhQSxJQUFHLElBQUksS0FBSyxJQUFJLEdBQUcsQ0FBQztBQUVsRCx1QkFBaUIsRUFBRSxVQUFVLE9BQU8sT0FBTyxLQUFLO0FBQUEsSUFDbEQsTUFBTyxNQUFLLENBQUFBLE9BQUssZ0JBQWdCQSxFQUFDLEdBQUcsQ0FBQztBQUN0QyxNQUFFLFVBQVUsVUFBVTtBQUV0QixNQUFFLElBQUksT0FBTztBQUFBLEVBQ2Y7OztBQ2pLTyxXQUFTQyxRQUFPLEdBQVUsVUFBa0M7QUFsQm5FO0FBbUJFLFVBQU0sVUFBbUIsU0FBUyxFQUFFLFdBQVcsR0FDN0MsWUFBWSxFQUFFLGtCQUFrQixNQUFNLEdBQ3RDLGlCQUFpQixrQkFBa0IsRUFBRSxVQUFVLEdBQy9DLFlBQXlCLFNBQVMsU0FDbEMsV0FBd0IsU0FBUyxRQUNqQyxZQUFzQyxTQUFTLFNBQy9DLGVBQXdDLFNBQVMsWUFDakQsY0FBdUMsU0FBUyxXQUNoRCxTQUFvQixFQUFFLFFBQ3RCLFVBQW1DLEVBQUUsVUFBVSxTQUMvQyxRQUFxQixVQUFVLFFBQVEsS0FBSyxRQUFRLG9CQUFJLElBQUksR0FDNUQsVUFBdUIsVUFBVSxRQUFRLEtBQUssVUFBVSxvQkFBSSxJQUFJLEdBQ2hFLGFBQTZCLFVBQVUsUUFBUSxLQUFLLGFBQWEsb0JBQUksSUFBSSxHQUN6RSxVQUFtQyxFQUFFLFVBQVUsU0FDL0MsZUFBaUMsT0FBRSxVQUFVLFlBQVosbUJBQXFCLFdBQVUsRUFBRSxXQUFXLFFBQzdFLFVBQXlCLHFCQUFxQixDQUFDLEdBQy9DLGFBQWEsb0JBQUksSUFBWSxHQUM3QixjQUFjLG9CQUFJLElBQWtDO0FBR3RELFFBQUksQ0FBQyxZQUFXLHVDQUFXLGFBQVk7QUFDckMsZ0JBQVUsYUFBYTtBQUN2QixpQkFBVyxXQUFXLEtBQUs7QUFDM0IsVUFBSSxhQUFjLFlBQVcsY0FBYyxLQUFLO0FBQUEsSUFDbEQ7QUFFQSxRQUFJLEdBQ0YsSUFDQSxZQUNBLGFBQ0FDLE9BQ0EsUUFDQSxNQUNBLFNBQ0E7QUFHRixTQUFLLFNBQVM7QUFDZCxXQUFPLElBQUk7QUFDVCxVQUFJLFlBQVksRUFBRSxHQUFHO0FBQ25CLFlBQUksR0FBRztBQUNQLHFCQUFhLE9BQU8sSUFBSSxDQUFDO0FBQ3pCLFFBQUFBLFFBQU8sTUFBTSxJQUFJLENBQUM7QUFDbEIsaUJBQVMsUUFBUSxJQUFJLENBQUM7QUFDdEIsZUFBTyxXQUFXLElBQUksQ0FBQztBQUN2QixzQkFBYyxZQUFZLEVBQUUsT0FBTyxHQUFHLFNBQVMsTUFBTSxHQUFHLE9BQU8sQ0FBQztBQUdoRSxjQUNJLG1DQUFTLGNBQVcsYUFBUSxjQUFSLG1CQUFtQixVQUFTLEtBQU8sY0FBYyxlQUFlLE1BQ3RGLENBQUMsR0FBRyxTQUNKO0FBQ0EsYUFBRyxVQUFVO0FBQ2IsYUFBRyxVQUFVLElBQUksT0FBTztBQUFBLFFBQzFCLFdBQ0UsR0FBRyxZQUNGLENBQUMsYUFBVyxhQUFRLGNBQVIsbUJBQW1CLFVBQVMsT0FDeEMsQ0FBQyxjQUFjLGVBQWUsSUFDL0I7QUFDQSxhQUFHLFVBQVU7QUFDYixhQUFHLFVBQVUsT0FBTyxPQUFPO0FBQUEsUUFDN0I7QUFFQSxZQUFJLENBQUMsVUFBVSxHQUFHLFVBQVU7QUFDMUIsYUFBRyxXQUFXO0FBQ2QsYUFBRyxVQUFVLE9BQU8sUUFBUTtBQUFBLFFBQzlCO0FBRUEsWUFBSSxZQUFZO0FBR2QsY0FDRUEsU0FDQSxHQUFHLGdCQUNGLGdCQUFnQixZQUFZLFVBQVUsS0FBTSxRQUFRLGdCQUFnQixZQUFZLElBQUksSUFDckY7QUFDQSxrQkFBTSxNQUFNLFFBQVEsQ0FBQztBQUNyQixnQkFBSSxDQUFDLEtBQUtBLE1BQUssQ0FBQztBQUNoQixnQkFBSSxDQUFDLEtBQUtBLE1BQUssQ0FBQztBQUNoQix5QkFBYSxJQUFJLGVBQWUsS0FBSyxPQUFPLEdBQUcsU0FBUztBQUFBLFVBQzFELFdBQVcsR0FBRyxhQUFhO0FBQ3pCLGVBQUcsY0FBYztBQUNqQixlQUFHLFVBQVUsT0FBTyxNQUFNO0FBQzFCLHlCQUFhLElBQUksZUFBZSxRQUFRLENBQUMsR0FBRyxPQUFPLEdBQUcsU0FBUztBQUFBLFVBQ2pFO0FBRUEsY0FBSSxnQkFBZ0IsWUFBWSxVQUFVLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxXQUFXO0FBQ3hFLHVCQUFXLElBQUksQ0FBQztBQUFBLFVBQ2xCLE9BRUs7QUFDSCxnQkFBSSxVQUFVLGdCQUFnQixZQUFZLE1BQU0sR0FBRztBQUNqRCxpQkFBRyxXQUFXO0FBQ2QsaUJBQUcsVUFBVSxJQUFJLFFBQVE7QUFBQSxZQUMzQixXQUFXLFFBQVEsZ0JBQWdCLFlBQVksSUFBSSxHQUFHO0FBQ3BELHlCQUFXLElBQUksQ0FBQztBQUFBLFlBQ2xCLE9BQU87QUFDTCwwQkFBWSxhQUFhLGFBQWEsRUFBRTtBQUFBLFlBQzFDO0FBQUEsVUFDRjtBQUFBLFFBQ0YsT0FFSztBQUNILHNCQUFZLGFBQWEsYUFBYSxFQUFFO0FBQUEsUUFDMUM7QUFBQSxNQUNGO0FBQ0EsV0FBSyxHQUFHO0FBQUEsSUFDVjtBQUdBLFFBQUksT0FBTyxVQUFVO0FBQ3JCLFdBQU8sUUFBUSxhQUFhLElBQUksR0FBRztBQUNqQyxXQUFLLFlBQVksUUFBUSxJQUFJLEtBQUssS0FBSyxLQUFLO0FBQzVDLGFBQU8sS0FBSztBQUFBLElBQ2Q7QUFJQSxlQUFXLENBQUNDLElBQUcsQ0FBQyxLQUFLLFFBQVE7QUFDM0IsWUFBTSxRQUFRLFdBQVcsSUFBSUEsRUFBQyxLQUFLO0FBQ25DLE1BQUFELFFBQU8sTUFBTSxJQUFJQyxFQUFDO0FBQ2xCLFVBQUksQ0FBQyxXQUFXLElBQUlBLEVBQUMsR0FBRztBQUN0QixrQkFBVSxZQUFZLElBQUksWUFBWSxLQUFLLENBQUM7QUFDNUMsZUFBTyxtQ0FBUztBQUVoQixZQUFJLE1BQU07QUFFUixlQUFLLFFBQVFBO0FBQ2IsY0FBSSxLQUFLLFVBQVU7QUFDakIsaUJBQUssV0FBVztBQUNoQixpQkFBSyxVQUFVLE9BQU8sUUFBUTtBQUFBLFVBQ2hDO0FBQ0EsZ0JBQU0sTUFBTSxRQUFRQSxFQUFDO0FBQ3JCLGNBQUlELE9BQU07QUFDUixpQkFBSyxjQUFjO0FBQ25CLGlCQUFLLFVBQVUsSUFBSSxNQUFNO0FBQ3pCLGdCQUFJLENBQUMsS0FBS0EsTUFBSyxDQUFDO0FBQ2hCLGdCQUFJLENBQUMsS0FBS0EsTUFBSyxDQUFDO0FBQUEsVUFDbEI7QUFDQSx1QkFBYSxNQUFNLGVBQWUsS0FBSyxPQUFPLEdBQUcsU0FBUztBQUFBLFFBQzVELE9BRUs7QUFDSCxnQkFBTSxZQUFZLFNBQVMsU0FBUyxZQUFZLENBQUMsQ0FBQyxHQUNoRCxNQUFNLFFBQVFDLEVBQUM7QUFFakIsb0JBQVUsVUFBVSxFQUFFO0FBQ3RCLG9CQUFVLFNBQVMsRUFBRTtBQUNyQixvQkFBVSxRQUFRQTtBQUNsQixjQUFJRCxPQUFNO0FBQ1Isc0JBQVUsY0FBYztBQUN4QixnQkFBSSxDQUFDLEtBQUtBLE1BQUssQ0FBQztBQUNoQixnQkFBSSxDQUFDLEtBQUtBLE1BQUssQ0FBQztBQUFBLFVBQ2xCO0FBQ0EsdUJBQWEsV0FBVyxlQUFlLEtBQUssT0FBTyxHQUFHLFNBQVM7QUFFL0QsbUJBQVMsWUFBWSxTQUFTO0FBQUEsUUFDaEM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUVBLGVBQVcsU0FBUyxZQUFZLE9BQU8sR0FBRztBQUN4QyxpQkFBVyxRQUFRLE9BQU87QUFDeEIsaUJBQVMsWUFBWSxJQUFJO0FBQUEsTUFDM0I7QUFBQSxJQUNGO0FBRUEsUUFBSSxZQUFhLGlCQUFnQixHQUFHLFdBQVc7QUFBQSxFQUNqRDtBQUVBLFdBQVMsWUFBa0IsS0FBa0IsS0FBUSxPQUFnQjtBQUNuRSxVQUFNLE1BQU0sSUFBSSxJQUFJLEdBQUc7QUFDdkIsUUFBSSxJQUFLLEtBQUksS0FBSyxLQUFLO0FBQUEsUUFDbEIsS0FBSSxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUM7QUFBQSxFQUMzQjtBQUVBLFdBQVMscUJBQXFCLEdBQXlCO0FBbk12RDtBQW9NRSxVQUFNLFVBQXlCLG9CQUFJLElBQUk7QUFDdkMsUUFBSSxFQUFFLGFBQWEsRUFBRSxVQUFVO0FBQzdCLGlCQUFXLEtBQUssRUFBRSxVQUFXLFdBQVUsU0FBUyxHQUFHLFdBQVc7QUFDaEUsUUFBSSxFQUFFLFVBQVUsRUFBRSxVQUFVO0FBQzFCLGlCQUFXLFNBQVMsRUFBRSxPQUFRLFdBQVUsU0FBUyxPQUFPLE9BQU87QUFDakUsUUFBSSxFQUFFLFFBQVMsV0FBVSxTQUFTLEVBQUUsU0FBUyxPQUFPO0FBQ3BELFFBQUksRUFBRSxVQUFVO0FBQ2QsVUFBSSxFQUFFLGdCQUFnQixVQUFVLEVBQUUsZ0JBQWdCLEVBQUU7QUFDbEQsa0JBQVUsU0FBUyxFQUFFLFVBQVUsVUFBVTtBQUFBLFVBQ3RDLFdBQVUsU0FBUyxFQUFFLFVBQVUsYUFBYTtBQUNqRCxVQUFJLEVBQUUsUUFBUSxXQUFXO0FBQ3ZCLGNBQU0sU0FBUSxPQUFFLFFBQVEsVUFBVixtQkFBaUIsSUFBSSxFQUFFO0FBQ3JDLFlBQUk7QUFDRixxQkFBVyxLQUFLLE9BQU87QUFDckIsc0JBQVUsU0FBUyxHQUFHLFVBQVUsRUFBRSxPQUFPLElBQUksQ0FBQyxJQUFJLFFBQVEsR0FBRztBQUFBLFVBQy9EO0FBQ0YsY0FBTSxTQUFTLEVBQUUsV0FBVztBQUM1QixZQUFJO0FBQ0YscUJBQVcsS0FBSyxRQUFRO0FBQ3RCLHNCQUFVLFNBQVMsR0FBRyxjQUFjLEVBQUUsT0FBTyxJQUFJLENBQUMsSUFBSSxRQUFRLEdBQUc7QUFBQSxVQUNuRTtBQUFBLE1BQ0o7QUFBQSxJQUNGLFdBQVcsRUFBRSxlQUFlO0FBQzFCLFVBQUksRUFBRSxVQUFVLFdBQVc7QUFDekIsY0FBTSxTQUFRLE9BQUUsVUFBVSxVQUFaLG1CQUFtQixJQUFJLFlBQVksRUFBRSxhQUFhO0FBQ2hFLFlBQUk7QUFDRixxQkFBVyxLQUFLLE9BQU87QUFDckIsc0JBQVUsU0FBUyxHQUFHLE1BQU07QUFBQSxVQUM5QjtBQUNGLGNBQU0sU0FBUyxFQUFFLGFBQWE7QUFDOUIsWUFBSTtBQUNGLHFCQUFXLEtBQUssUUFBUTtBQUN0QixzQkFBVSxTQUFTLEdBQUcsY0FBYyxFQUFFLE9BQU8sSUFBSSxDQUFDLElBQUksUUFBUSxHQUFHO0FBQUEsVUFDbkU7QUFBQSxNQUNKO0FBQUEsSUFDRjtBQUNBLFVBQU0sVUFBVSxFQUFFLFdBQVc7QUFDN0IsUUFBSSxTQUFTO0FBQ1gsZ0JBQVUsU0FBUyxRQUFRLE1BQU0sYUFBYTtBQUM5QyxnQkFBVSxTQUFTLFFBQVEsTUFBTSxpQkFBaUIsUUFBUSxPQUFPLFVBQVUsR0FBRztBQUFBLElBQ2hGLFdBQVcsRUFBRSxhQUFhO0FBQ3hCO0FBQUEsUUFDRTtBQUFBLFFBQ0EsRUFBRSxhQUFhLFFBQVE7QUFBQSxRQUN2QixpQkFBaUIsRUFBRSxhQUFhLFFBQVEsT0FBTyxVQUFVO0FBQUEsTUFDM0Q7QUFFRixlQUFXLE9BQU8sRUFBRSxTQUFTLFNBQVM7QUFDcEMsZ0JBQVUsU0FBUyxJQUFJLEtBQUssSUFBSSxTQUFTO0FBQUEsSUFDM0M7QUFFQSxXQUFPO0FBQUEsRUFDVDtBQUVBLFdBQVMsVUFBVSxTQUF3QixLQUFhLE9BQXFCO0FBQzNFLFVBQU0sVUFBVSxRQUFRLElBQUksR0FBRztBQUMvQixRQUFJLFFBQVMsU0FBUSxJQUFJLEtBQUssR0FBRyxPQUFPLElBQUksS0FBSyxFQUFFO0FBQUEsUUFDOUMsU0FBUSxJQUFJLEtBQUssS0FBSztBQUFBLEVBQzdCO0FBRUEsV0FBUyxnQkFBZ0IsR0FBVSxhQUFnQztBQUNqRSxVQUFNLE1BQU0sRUFBRSxVQUFVLFNBQ3RCLE1BQU0sMkJBQUssS0FDWCxTQUFTLE1BQU0sQ0FBQyxJQUFJLGVBQWUsSUFBSSxLQUFLLElBQUksQ0FBQyxHQUNqRCxPQUFPLGNBQWMsQ0FBQyxDQUFDLEtBQUssS0FBSyxNQUFNO0FBQ3pDLFFBQUksRUFBRSxVQUFVLHNCQUFzQixLQUFNO0FBQzVDLE1BQUUsVUFBVSxvQkFBb0I7QUFFaEMsUUFBSSxLQUFLO0FBQ1AsWUFBTSxVQUFVLFNBQVMsRUFBRSxXQUFXLEdBQ3BDLFVBQVUsUUFBUSxHQUFHLEdBQ3JCLFFBQVEsSUFBSSxNQUFNLE9BQ2xCLGtCQUFrQixTQUFTLHFCQUFxQixHQUNoRCxtQkFBbUIsU0FBUyxzQkFBc0I7QUFDcEQsVUFBSSxFQUFFLGdCQUFnQixNQUFPLGtCQUFpQixVQUFVLElBQUksVUFBVTtBQUN0RSxtQkFBYSxpQkFBaUIsa0JBQWtCLEVBQUUsVUFBVSxFQUFFLFNBQVMsT0FBTyxHQUFHLENBQUM7QUFFbEYsaUJBQVcsS0FBSyxRQUFRO0FBQ3RCLGNBQU0sWUFBWSxTQUFTLFNBQVMsWUFBWSxDQUFDLENBQUM7QUFDbEQsa0JBQVUsVUFBVSxFQUFFO0FBQ3RCLGtCQUFVLFNBQVMsRUFBRTtBQUNyQix5QkFBaUIsWUFBWSxTQUFTO0FBQUEsTUFDeEM7QUFFQSxrQkFBWSxZQUFZO0FBQ3hCLHNCQUFnQixZQUFZLGdCQUFnQjtBQUM1QyxrQkFBWSxZQUFZLGVBQWU7QUFDdkMsaUJBQVcsYUFBYSxJQUFJO0FBQUEsSUFDOUIsT0FBTztBQUNMLGlCQUFXLGFBQWEsS0FBSztBQUFBLElBQy9CO0FBQUEsRUFDRjtBQUVBLFdBQVMsY0FBYyxRQUFpQixLQUF5QixRQUE0QjtBQUMzRixXQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sSUFBSSxPQUFLLFlBQVksQ0FBQyxDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUc7QUFBQSxFQUMxRTs7O0FDNVJBLFdBQVMsWUFBWSxPQUFjLFdBQThCO0FBQy9ELFVBQU0sV0FBVyxVQUFVLFdBQVcsS0FBSztBQUczQyxRQUFJLFNBQVMsTUFBTyxhQUFZLE9BQU8sU0FBUyxNQUFNLEtBQUssU0FBUyxNQUFNLE1BQU07QUFFaEYsVUFBTSxJQUFJLGFBQWEsUUFBUTtBQUMvQixVQUFNLElBQUksU0FBUyxRQUFRO0FBQzNCLFVBQU0sSUFBSSxPQUFPLE1BQU0sT0FBTyxNQUFNO0FBRXBDLElBQU8sVUFBVSxPQUFPLFFBQVE7QUFFaEMsVUFBTSxTQUFTLGNBQWM7QUFDN0IsVUFBTSxVQUFVLG9CQUFvQjtBQUVwQyxJQUFBRSxRQUFPLE9BQU8sUUFBUTtBQUFBLEVBQ3hCO0FBRUEsV0FBUyxZQUFZLE9BQWMsYUFBMkIsZ0JBQW9DO0FBQ2hHLFFBQUksQ0FBQyxNQUFNLElBQUksU0FBUyxNQUFPLE9BQU0sSUFBSSxTQUFTLFFBQVEsQ0FBQztBQUMzRCxRQUFJLENBQUMsTUFBTSxJQUFJLGFBQWEsTUFBTyxPQUFNLElBQUksYUFBYSxRQUFRLENBQUM7QUFFbkUsUUFBSSxhQUFhO0FBQ2YsWUFBTSxVQUFVLFNBQVMsYUFBYSxPQUFPLEtBQUs7QUFDbEQsWUFBTSxJQUFJLGFBQWEsTUFBTSxNQUFNO0FBQ25DLFlBQU0sSUFBSSxTQUFTLE1BQU0sTUFBTTtBQUMvQixNQUFPLFNBQVMsT0FBTyxPQUFPO0FBQzlCLGlCQUFXLE9BQU8sT0FBTztBQUFBLElBQzNCO0FBQ0EsUUFBSSxnQkFBZ0I7QUFDbEIsWUFBTSxhQUFhLFNBQVMsZ0JBQWdCLFVBQVUsS0FBSztBQUMzRCxZQUFNLElBQUksYUFBYSxNQUFNLFNBQVM7QUFDdEMsWUFBTSxJQUFJLFNBQVMsTUFBTSxTQUFTO0FBQ2xDLE1BQU8sU0FBUyxPQUFPLFVBQVU7QUFDakMsaUJBQVcsT0FBTyxVQUFVO0FBQUEsSUFDOUI7QUFFQSxRQUFJLGVBQWUsZ0JBQWdCO0FBQ2pDLFlBQU0sSUFBSSxPQUFPLE1BQU0sT0FBTyxNQUFNO0FBQ3BDLFlBQU0sSUFBSSxPQUFPLE1BQU0sWUFBWSxNQUFNO0FBQUEsSUFDM0M7QUFBQSxFQUNGO0FBRU8sV0FBUyxVQUFVLGNBQTRCLE9BQW9CO0FBbEQxRTtBQW1ERSxRQUFJLGFBQWEsTUFBTyxhQUFZLE9BQU8sYUFBYSxLQUFLO0FBQzdELFFBQUksYUFBYSxTQUFTLENBQUMsTUFBTSxNQUFNO0FBQ3JDLGtCQUFZLE9BQU8sYUFBYSxNQUFNLEtBQUssYUFBYSxNQUFNLE1BQU07QUFHdEUsVUFBTSxJQUFJLGFBQWE7QUFFdkIsUUFBSSxNQUFNLE9BQU87QUFDZixZQUFNLE9BQU8sT0FBTyxhQUFhLFNBQVMsTUFBTSxJQUFJLFNBQVMsT0FBTztBQUFBLFFBQ2xFLE9BQUssa0JBQWEsVUFBYixtQkFBb0IsVUFBTyxXQUFNLElBQUksU0FBUyxVQUFuQixtQkFBMEI7QUFBQSxRQUMxRCxVQUFRLGtCQUFhLFVBQWIsbUJBQW9CLGFBQVUsV0FBTSxJQUFJLFNBQVMsVUFBbkIsbUJBQTBCO0FBQUEsTUFDbEUsQ0FBQztBQUFBLEVBQ0w7QUFFTyxXQUFTLGVBQWUsS0FBMEIsT0FBb0I7QUFqRTdFO0FBa0VFLFFBQUksSUFBSSxPQUFPO0FBQ2IsWUFBTSxJQUFJLGFBQWEsUUFBUTtBQUMvQixZQUFNLElBQUksU0FBUyxRQUFRO0FBQzNCLFlBQU0sSUFBSSxPQUFPLE1BQU0sT0FBTyxNQUFNO0FBQUEsSUFDdEM7QUFDQSxRQUFJLE1BQU0sSUFBSSxTQUFTLFNBQVMsTUFBTSxJQUFJLGFBQWEsT0FBTztBQUM1RCxXQUFJLFNBQUksVUFBSixtQkFBVyxLQUFLO0FBQ2xCLGNBQU0sSUFBSSxhQUFhLE1BQU0sTUFBTTtBQUNuQyxjQUFNLElBQUksU0FBUyxNQUFNLE1BQU07QUFBQSxNQUNqQztBQUNBLFdBQUksU0FBSSxVQUFKLG1CQUFXLFFBQVE7QUFDckIsY0FBTSxJQUFJLGFBQWEsTUFBTSxTQUFTO0FBQ3RDLGNBQU0sSUFBSSxTQUFTLE1BQU0sU0FBUztBQUFBLE1BQ3BDO0FBQ0EsWUFBSSxTQUFJLFVBQUosbUJBQVcsVUFBTyxTQUFJLFVBQUosbUJBQVcsU0FBUTtBQUN2QyxjQUFNLElBQUksT0FBTyxNQUFNLE9BQU8sTUFBTTtBQUNwQyxjQUFNLElBQUksT0FBTyxNQUFNLFlBQVksTUFBTTtBQUFBLE1BQzNDO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7OztBQ09PLFdBQVNDLE9BQU0sT0FBbUI7QUFDdkMsV0FBTztBQUFBLE1BQ0wsT0FBTyxjQUFxQztBQUMxQyxrQkFBVSxjQUFjLEtBQUs7QUFBQSxNQUMvQjtBQUFBLE1BRUEsT0FBTyxxQkFBbUQ7QUFDeEQsdUJBQWUscUJBQXFCLEtBQUs7QUFBQSxNQUMzQztBQUFBLE1BRUEsSUFBSSxRQUFnQixlQUErQjtBQXRHdkQ7QUF1R00saUJBQVMsVUFBVSxNQUFjLEtBQVU7QUFDekMsZ0JBQU0sYUFBYSxLQUFLLE1BQU0sR0FBRztBQUNqQyxpQkFBTyxXQUFXLE9BQU8sQ0FBQyxNQUFNLFNBQVMsUUFBUSxLQUFLLElBQUksR0FBRyxHQUFHO0FBQUEsUUFDbEU7QUFFQSxjQUFNLG1CQUF3RTtBQUFBLFVBQzVFO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxRQUNGO0FBQ0EsY0FBTSxZQUFVLFlBQU8sU0FBUCxtQkFBYSxVQUFTLGdCQUFnQixPQUFPLEtBQUssS0FBSztBQUN2RSxjQUFNLFdBQ0osaUJBQWlCLEtBQUssT0FBSztBQUN6QixnQkFBTSxPQUFPLFVBQVUsR0FBRyxNQUFNO0FBQ2hDLGlCQUFPLFFBQVEsU0FBUyxVQUFVLEdBQUcsS0FBSztBQUFBLFFBQzVDLENBQUMsS0FDRCxDQUFDLEVBQ0MsWUFDQyxRQUFRLFVBQVUsTUFBTSxXQUFXLFNBQVMsUUFBUSxVQUFVLE1BQU0sV0FBVyxXQUVsRixDQUFDLEdBQUMsa0JBQU8sVUFBUCxtQkFBYyxVQUFkLG1CQUFxQixNQUFNLENBQUMsR0FBRyxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sQ0FBQztBQUVsRSxZQUFJLFVBQVU7QUFDWixVQUFNLE1BQU0sS0FBSztBQUNqQixvQkFBVSxPQUFPLE1BQU07QUFDdkIsb0JBQVUsTUFBTSxJQUFJLGNBQWMsS0FBSztBQUFBLFFBQ3pDLE9BQU87QUFDTCx5QkFBZSxPQUFPLE1BQU07QUFDNUIsYUFBQyxZQUFPLFNBQVAsbUJBQWEsVUFBUyxDQUFDLGdCQUFnQixPQUFPO0FBQUEsWUFDN0MsQ0FBQUMsV0FBUyxVQUFVQSxRQUFPLE1BQU07QUFBQSxZQUNoQztBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLE1BRUE7QUFBQSxNQUVBLGNBQWMsTUFBTSxZQUFZLE1BQU0sUUFBUSxNQUFNLFlBQVksTUFBTSxRQUFRLFNBQVM7QUFBQSxNQUV2RixjQUFjLE1BQ1osWUFBWSxNQUFNLE1BQU0sU0FBUyxNQUFNLE1BQU0sT0FBTyxNQUFNLFFBQVEsU0FBUztBQUFBLE1BRTdFLG9CQUEwQjtBQUN4QixRQUFNLGtCQUFrQixLQUFLO0FBQzdCLGtCQUFVLE1BQU0sSUFBSSxjQUFjLEtBQUs7QUFBQSxNQUN6QztBQUFBLE1BRUEsS0FBSyxNQUFNLE1BQU0sTUFBWTtBQUMzQjtBQUFBLFVBQ0UsQ0FBQUEsV0FDUSxTQUFTQSxRQUFPLE1BQU0sTUFBTSxRQUFRQSxPQUFNLFVBQVUsbUJBQW1CLE1BQU0sSUFBSSxDQUFDO0FBQUEsVUFDMUY7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLE1BRUEsS0FBSyxPQUFPLEtBQUssTUFBTSxPQUFhO0FBQ2xDLGFBQUssQ0FBQUEsV0FBUztBQUNaLFVBQUFBLE9BQU0sVUFBVSxRQUFRLENBQUMsQ0FBQztBQUMxQixVQUFNLFNBQVNBLFFBQU8sT0FBTyxLQUFLLFFBQVFBLE9BQU0sVUFBVSxtQkFBbUIsT0FBTyxHQUFHLENBQUM7QUFBQSxRQUMxRixHQUFHLEtBQUs7QUFBQSxNQUNWO0FBQUEsTUFFQSxVQUFVLFFBQWM7QUFDdEIsYUFBSyxDQUFBQSxXQUFlLFVBQVVBLFFBQU8sTUFBTSxHQUFHLEtBQUs7QUFBQSxNQUNyRDtBQUFBLE1BRUEsVUFBVSxPQUFpQixPQUFxQjtBQUM5QyxlQUFPLENBQUFBLFdBQVMsVUFBVUEsUUFBTyxPQUFPLEtBQUssR0FBRyxLQUFLO0FBQUEsTUFDdkQ7QUFBQSxNQUVBLGVBQWUsT0FBaUIsT0FBcUI7QUFDbkQsZUFBTyxDQUFBQSxXQUFTLGVBQWVBLFFBQU8sT0FBTyxLQUFLLEdBQUcsS0FBSztBQUFBLE1BQzVEO0FBQUEsTUFFQSxhQUFhLEtBQUssTUFBTSxPQUFhO0FBQ25DLFlBQUksSUFBSyxNQUFLLENBQUFBLFdBQWUsYUFBYUEsUUFBTyxLQUFLLE1BQU0sS0FBSyxHQUFHLEtBQUs7QUFBQSxpQkFDaEUsTUFBTSxVQUFVO0FBQ3ZCLFVBQU0sU0FBUyxLQUFLO0FBQ3BCLGdCQUFNLElBQUksT0FBTztBQUFBLFFBQ25CO0FBQUEsTUFDRjtBQUFBLE1BRUEsWUFBWSxPQUFPLE9BQU8sT0FBYTtBQUNyQyxZQUFJLE1BQU8sUUFBTyxDQUFBQSxXQUFlLFlBQVlBLFFBQU8sT0FBTyxPQUFPLE9BQU8sSUFBSSxHQUFHLEtBQUs7QUFBQSxpQkFDNUUsTUFBTSxlQUFlO0FBQzVCLFVBQU0sU0FBUyxLQUFLO0FBQ3BCLGdCQUFNLElBQUksT0FBTztBQUFBLFFBQ25CO0FBQUEsTUFDRjtBQUFBLE1BRUEsY0FBdUI7QUFDckIsWUFBSSxNQUFNLFdBQVcsU0FBUztBQUM1QixjQUFJLEtBQVcsYUFBYSxLQUFLLEVBQUcsUUFBTztBQUUzQyxnQkFBTSxJQUFJLE9BQU87QUFBQSxRQUNuQjtBQUNBLGVBQU87QUFBQSxNQUNUO0FBQUEsTUFFQSxjQUF1QjtBQUNyQixZQUFJLE1BQU0sYUFBYSxTQUFTO0FBQzlCLGNBQUksS0FBVyxhQUFhLEtBQUssRUFBRyxRQUFPO0FBRTNDLGdCQUFNLElBQUksT0FBTztBQUFBLFFBQ25CO0FBQ0EsZUFBTztBQUFBLE1BQ1Q7QUFBQSxNQUVBLGdCQUFzQjtBQUNwQixlQUFhLGNBQWMsS0FBSztBQUFBLE1BQ2xDO0FBQUEsTUFFQSxnQkFBc0I7QUFDcEIsZUFBYSxjQUFjLEtBQUs7QUFBQSxNQUNsQztBQUFBLE1BRUEsbUJBQXlCO0FBQ3ZCLGVBQU8sQ0FBQUEsV0FBUztBQUNkLFVBQU0saUJBQWlCQSxNQUFLO0FBQzVCLFVBQUFDLFFBQVdELE1BQUs7QUFBQSxRQUNsQixHQUFHLEtBQUs7QUFBQSxNQUNWO0FBQUEsTUFFQSxPQUFhO0FBQ1gsZUFBTyxDQUFBQSxXQUFTO0FBQ2QsVUFBTSxLQUFLQSxNQUFLO0FBQUEsUUFDbEIsR0FBRyxLQUFLO0FBQUEsTUFDVjtBQUFBLE1BRUEsY0FBYyxRQUEyQjtBQUN2QyxlQUFPLENBQUFBLFdBQVVBLE9BQU0sU0FBUyxhQUFhLFFBQVMsS0FBSztBQUFBLE1BQzdEO0FBQUEsTUFFQSxVQUFVLFFBQTJCO0FBQ25DLGVBQU8sQ0FBQUEsV0FBVUEsT0FBTSxTQUFTLFNBQVMsUUFBUyxLQUFLO0FBQUEsTUFDekQ7QUFBQSxNQUVBLG9CQUFvQixTQUFrQztBQUNwRCxlQUFPLENBQUFBLFdBQVVBLE9BQU0sU0FBUyxVQUFVLFNBQVUsS0FBSztBQUFBLE1BQzNEO0FBQUEsTUFFQSxhQUFhLE9BQU8sT0FBTyxPQUFhO0FBQ3RDLHFCQUFhLE9BQU8sT0FBTyxPQUFPLEtBQUs7QUFBQSxNQUN6QztBQUFBLE1BRUEsVUFBZ0I7QUFDZCxRQUFNLEtBQUssS0FBSztBQUNoQixjQUFNLElBQUksT0FBTztBQUNqQixjQUFNLElBQUksWUFBWTtBQUFBLE1BQ3hCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7OztBQy9HTyxXQUFTLFdBQTBCO0FBQ3hDLFdBQU87QUFBQSxNQUNMLFFBQVEsb0JBQUksSUFBSTtBQUFBLE1BQ2hCLFlBQVksRUFBRSxPQUFPLEdBQUcsT0FBTyxFQUFFO0FBQUEsTUFDakMsYUFBYTtBQUFBLE1BQ2IsV0FBVztBQUFBLE1BQ1gsYUFBYTtBQUFBLE1BQ2IsVUFBVTtBQUFBLE1BQ1YsYUFBYSxDQUFDLElBQUksRUFBRTtBQUFBLE1BQ3BCLG9CQUFvQjtBQUFBLE1BQ3BCLGtCQUFrQjtBQUFBLE1BQ2xCLGlCQUFpQjtBQUFBLE1BQ2pCLGFBQWE7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULE9BQU87QUFBQSxRQUNQLE9BQU87QUFBQSxNQUNUO0FBQUEsTUFDQSxXQUFXO0FBQUEsUUFDVCxXQUFXO0FBQUEsUUFDWCxPQUFPO0FBQUEsUUFDUCxZQUFZLENBQUMsTUFBTTtBQUFBLFFBQ25CLFNBQVM7QUFBQSxNQUNYO0FBQUEsTUFDQSxXQUFXO0FBQUEsUUFDVCxTQUFTO0FBQUEsUUFDVCxPQUFPO0FBQUEsUUFDUCxVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsT0FBTztBQUFBLFFBQ0wsU0FBUztBQUFBLFFBQ1QsU0FBUyxvQkFBSSxJQUF1QjtBQUFBLFVBQ2xDLENBQUMsU0FBUyxvQkFBSSxJQUFJLENBQUM7QUFBQSxVQUNuQixDQUFDLFFBQVEsb0JBQUksSUFBSSxDQUFDO0FBQUEsUUFDcEIsQ0FBQztBQUFBLFFBQ0QsT0FBTyxDQUFDLFFBQVEsVUFBVSxRQUFRLFVBQVUsVUFBVSxTQUFTLE1BQU07QUFBQSxNQUN2RTtBQUFBLE1BQ0EsU0FBUztBQUFBLFFBQ1AsTUFBTTtBQUFBLFFBQ04sV0FBVztBQUFBLFFBQ1gsUUFBUSxDQUFDO0FBQUEsTUFDWDtBQUFBLE1BQ0EsV0FBVztBQUFBLFFBQ1QsTUFBTTtBQUFBLFFBQ04sV0FBVztBQUFBLFFBQ1gsT0FBTztBQUFBLFFBQ1AsUUFBUSxDQUFDO0FBQUEsTUFDWDtBQUFBLE1BQ0EsWUFBWTtBQUFBLFFBQ1YsU0FBUztBQUFBLFFBQ1QsV0FBVztBQUFBLFFBQ1gsUUFBUSxDQUFDO0FBQUEsTUFDWDtBQUFBLE1BQ0EsY0FBYztBQUFBLFFBQ1osU0FBUztBQUFBLFFBQ1QsV0FBVztBQUFBLFFBQ1gsUUFBUSxDQUFDO0FBQUEsTUFDWDtBQUFBLE1BQ0EsV0FBVztBQUFBLFFBQ1QsU0FBUztBQUFBLFFBQ1QsVUFBVTtBQUFBLFFBQ1YsY0FBYztBQUFBLFFBQ2QsV0FBVztBQUFBLFFBQ1gsd0JBQXdCO0FBQUEsUUFDeEIsaUJBQWlCO0FBQUEsUUFDakIsb0JBQW9CO0FBQUEsTUFDdEI7QUFBQSxNQUNBLFlBQVk7QUFBQSxRQUNWLFNBQVM7QUFBQSxRQUNULGFBQWE7QUFBQSxRQUNiLGVBQWU7QUFBQSxRQUNmLGlCQUFpQjtBQUFBLE1BQ25CO0FBQUEsTUFDQSxXQUFXO0FBQUEsUUFDVCxxQkFBcUIsTUFBTTtBQUFBLFFBQzNCLG9CQUFvQixNQUFNO0FBQUEsUUFDMUIscUJBQXFCLE1BQU07QUFBQSxRQUMzQixvQkFBb0IsTUFBTTtBQUFBLFFBQzFCLFlBQVksTUFBTTtBQUFBLFFBQ2xCLGNBQWMsTUFBTTtBQUFBLFFBQ3BCLFFBQVEsQ0FBQztBQUFBLFFBQ1QsbUJBQW1CO0FBQUEsTUFDckI7QUFBQSxNQUNBLFNBQVMsQ0FBQztBQUFBLE1BQ1YsUUFBUSxDQUFDO0FBQUEsTUFDVCxVQUFVO0FBQUEsUUFDUixTQUFTO0FBQUE7QUFBQSxRQUNULFNBQVM7QUFBQTtBQUFBLFFBQ1QsUUFBUTtBQUFBO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxRQUFRLENBQUM7QUFBQSxRQUNULFlBQVksQ0FBQztBQUFBLFFBQ2IsU0FBUyxDQUFDO0FBQUEsUUFDVixhQUFhO0FBQUEsTUFDZjtBQUFBLElBQ0Y7QUFBQSxFQUNGOzs7QUM1T08sV0FBUyxnQkFBZ0IsT0FBb0I7QUFMcEQ7QUFNRSxTQUFJLFdBQU0sSUFBSSxTQUFTLFVBQW5CLG1CQUEwQjtBQUM1QjtBQUFBLFFBQ0U7QUFBQSxRQUNBLE1BQU0sSUFBSSxTQUFTLE1BQU0sT0FBTztBQUFBLFFBQ2hDLE1BQU0sSUFBSSxTQUFTLE1BQU0sT0FBTztBQUFBLFFBQ2hDLE1BQU0sSUFBSSxTQUFTLE1BQU0sT0FBTztBQUFBLE1BQ2xDO0FBQUEsRUFDSjtBQUVPLFdBQVMsVUFBVSxPQUFjLFlBQTRCO0FBQ2xFLFVBQU0sV0FBVyxNQUFNLElBQUksU0FBUztBQUNwQyxRQUFJLFVBQVU7QUFDWixNQUFBRSxRQUFPLE9BQU8sUUFBUTtBQUN0QixVQUFJLENBQUMsV0FBWSxpQkFBZ0IsS0FBSztBQUFBLElBQ3hDO0FBRUEsVUFBTSxVQUFVLE1BQU0sSUFBSSxTQUFTO0FBQ25DLFFBQUksU0FBUztBQUNYLFVBQUksUUFBUSxJQUFLLFlBQVcsT0FBTyxRQUFRLEdBQUc7QUFDOUMsVUFBSSxRQUFRLE9BQVEsWUFBVyxPQUFPLFFBQVEsTUFBTTtBQUFBLElBQ3REO0FBQUEsRUFDRjs7O0FDZk8sV0FBUyxZQUFZLFFBQWlCLGNBQWtDO0FBQzdFLFVBQU0sUUFBUSxTQUFTO0FBQ3ZCLGNBQVUsT0FBTyxVQUFVLENBQUMsQ0FBQztBQUU3QixVQUFNLGlCQUFpQixDQUFDLGVBQXlCO0FBQy9DLGdCQUFVLE9BQU8sVUFBVTtBQUFBLElBQzdCO0FBRUEsVUFBTSxNQUFNO0FBQUEsTUFDVixjQUFjLGdCQUFnQixDQUFDO0FBQUEsTUFDL0IsVUFBVSxDQUFDO0FBQUEsTUFDWCxRQUFRO0FBQUEsUUFDTixPQUFPO0FBQUEsVUFDTCxRQUFhLEtBQUssTUFBRztBQXpCN0I7QUF5QmdDLCtCQUFNLElBQUksU0FBUyxVQUFuQixtQkFBMEIsT0FBTztBQUFBLFdBQXVCO0FBQUEsUUFDbEY7QUFBQSxRQUNBLE9BQU87QUFBQSxVQUNMLFFBQWEsS0FBSyxNQUFNO0FBQ3RCLGtCQUFNLGFBQTJDLG9CQUFJLElBQUksR0FDdkQsVUFBVSxNQUFNLElBQUksU0FBUztBQUMvQixnQkFBSSxtQ0FBUyxJQUFLLFlBQVcsSUFBSSxPQUFPLFFBQVEsSUFBSSxzQkFBc0IsQ0FBQztBQUMzRSxnQkFBSSxtQ0FBUyxPQUFRLFlBQVcsSUFBSSxVQUFVLFFBQVEsT0FBTyxzQkFBc0IsQ0FBQztBQUNwRixtQkFBTztBQUFBLFVBQ1QsQ0FBQztBQUFBLFVBQ0QsYUFBa0IsS0FBSyxNQUFNO0FBQzNCLGtCQUFNLGtCQUF5QyxvQkFBSSxJQUFJLEdBQ3JELFVBQVUsTUFBTSxJQUFJLFNBQVM7QUFFL0IsZ0JBQUksbUNBQVMsS0FBSztBQUNoQixrQkFBSSxTQUFTLFFBQVEsSUFBSTtBQUN6QixxQkFBTyxRQUFRO0FBQ2Isc0JBQU0sVUFBVSxPQUFPLG1CQUNyQixRQUFRLEVBQUUsTUFBTSxRQUFRLFFBQVEsT0FBTyxRQUFRLFFBQVE7QUFDekQsZ0NBQWdCLElBQVMsWUFBWSxLQUFLLEdBQUcsUUFBUSxzQkFBc0IsQ0FBQztBQUM1RSx5QkFBUyxPQUFPO0FBQUEsY0FDbEI7QUFBQSxZQUNGO0FBQ0EsZ0JBQUksbUNBQVMsUUFBUTtBQUNuQixrQkFBSSxTQUFTLFFBQVEsT0FBTztBQUM1QixxQkFBTyxRQUFRO0FBQ2Isc0JBQU0sVUFBVSxPQUFPLG1CQUNyQixRQUFRLEVBQUUsTUFBTSxRQUFRLFFBQVEsT0FBTyxRQUFRLFFBQVE7QUFDekQsZ0NBQWdCLElBQVMsWUFBWSxLQUFLLEdBQUcsUUFBUSxzQkFBc0IsQ0FBQztBQUM1RSx5QkFBUyxPQUFPO0FBQUEsY0FDbEI7QUFBQSxZQUNGO0FBQ0EsbUJBQU87QUFBQSxVQUNULENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRjtBQUFBLE1BQ0EsV0FBVztBQUFBLE1BQ1gsUUFBUSxlQUFlLGNBQWM7QUFBQSxNQUNyQyxjQUFjLGVBQWUsTUFBTSxnQkFBZ0IsS0FBSyxDQUFDO0FBQUEsTUFDekQsUUFBUSxhQUFhLEtBQUs7QUFBQSxNQUMxQixXQUFXO0FBQUEsSUFDYjtBQUVBLFFBQUksYUFBYyxXQUFVLGNBQWMsS0FBSztBQUUvQyxXQUFPQyxPQUFNLEtBQUs7QUFBQSxFQUNwQjtBQUVBLFdBQVMsZUFBZSxHQUF1RDtBQUM3RSxRQUFJLFlBQVk7QUFDaEIsV0FBTyxJQUFJLFNBQWdCO0FBQ3pCLFVBQUksVUFBVztBQUNmLGtCQUFZO0FBQ1osNEJBQXNCLE1BQU07QUFDMUIsVUFBRSxHQUFHLElBQUk7QUFDVCxvQkFBWTtBQUFBLE1BQ2QsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGOzs7QW5CakZBLE1BQU8sZ0JBQVE7IiwKICAibmFtZXMiOiBbIm1vdmUiLCAicmFua3MiLCAibm93IiwgImJydXNoZXMiLCAiZWwiLCAiZGVzdCIsICJzdGFydCIsICJjYW5jZWwiLCAibW92ZSIsICJlbmQiLCAidW5zZWxlY3QiLCAicmFua3MiLCAiZmlsZXMiLCAicmVuZGVySGFuZCIsICJtb3ZlIiwgImVuZCIsICJjYW5jZWwiLCAic3RhcnQiLCAicyIsICJyZW5kZXIiLCAiYW5pbSIsICJrIiwgInJlbmRlciIsICJzdGFydCIsICJzdGF0ZSIsICJjYW5jZWwiLCAicmVuZGVyIiwgInN0YXJ0Il0KfQo=
