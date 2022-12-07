var Shogiground = (function () {
    'use strict';

    function isPieceNode(el) {
        return el.tagName === 'PIECE';
    }
    function isSquareNode(el) {
        return el.tagName === 'SQ';
    }
    const colors = ['sente', 'gote'];
    const files = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'];
    const ranks = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p'];

    // 1a, 2a, 3a ...
    const allKeys = Array.prototype.concat(...ranks.map(r => files.map(f => f + r)));
    const pos2key = (pos) => allKeys[pos[0] + 16 * pos[1]];
    const key2pos = (k) => {
        if (k.length > 2)
            return [k.charCodeAt(1) - 39, k.charCodeAt(2) - 97];
        else
            return [k.charCodeAt(0) - 49, k.charCodeAt(1) - 97];
    };
    function memo(f) {
        let v;
        const ret = () => {
            if (v === undefined)
                v = f();
            return v;
        };
        ret.clear = () => {
            v = undefined;
        };
        return ret;
    }
    function callUserFunction(f, ...args) {
        if (f)
            setTimeout(() => f(...args), 1);
    }
    const opposite = (c) => (c === 'sente' ? 'gote' : 'sente');
    const sentePov = (o) => o === 'sente';
    const distanceSq = (pos1, pos2) => {
        const dx = pos1[0] - pos2[0], dy = pos1[1] - pos2[1];
        return dx * dx + dy * dy;
    };
    const samePiece = (p1, p2) => p1.role === p2.role && p1.color === p2.color;
    const posToTranslateBase = (pos, dims, asSente, xFactor, yFactor) => [
        (asSente ? dims.files - 1 - pos[0] : pos[0]) * xFactor,
        (asSente ? pos[1] : dims.ranks - 1 - pos[1]) * yFactor,
    ];
    const posToTranslateAbs = (dims, bounds) => {
        const xFactor = bounds.width / dims.files, yFactor = bounds.height / dims.ranks;
        return (pos, asSente) => posToTranslateBase(pos, dims, asSente, xFactor, yFactor);
    };
    const posToTranslateRel = (dims) => (pos, asSente) => posToTranslateBase(pos, dims, asSente, 100, 100);
    const translateAbs = (el, pos, scale) => {
        el.style.transform = `translate(${pos[0]}px,${pos[1]}px) scale(${scale}`;
    };
    const translateRel = (el, percents, scaleFactor, scale) => {
        el.style.transform = `translate(${percents[0] * scaleFactor}%,${percents[1] * scaleFactor}%) scale(${scale || scaleFactor})`;
    };
    const setDisplay = (el, v) => {
        el.style.display = v ? '' : 'none';
    };
    const eventPosition = (e) => {
        var _a;
        if (e.clientX || e.clientX === 0)
            return [e.clientX, e.clientY];
        if ((_a = e.targetTouches) === null || _a === void 0 ? void 0 : _a[0])
            return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
        return; // touchend has no position!
    };
    const isRightButton = (e) => e.buttons === 2 || e.button === 2;
    const isMiddleButton = (e) => e.buttons === 4 || e.button === 1;
    const createEl = (tagName, className) => {
        const el = document.createElement(tagName);
        if (className)
            el.className = className;
        return el;
    };
    function pieceNameOf(piece) {
        return `${piece.color} ${piece.role}`;
    }
    function computeSquareCenter(key, asSente, dims, bounds) {
        const pos = key2pos(key);
        if (asSente) {
            pos[0] = dims.files - 1 - pos[0];
            pos[1] = dims.ranks - 1 - pos[1];
        }
        return [
            bounds.left + (bounds.width * pos[0]) / dims.files + bounds.width / (dims.files * 2),
            bounds.top + (bounds.height * (dims.ranks - 1 - pos[1])) / dims.ranks + bounds.height / (dims.ranks * 2),
        ];
    }
    function domSquareIndexOfKey(key, asSente, dims) {
        const pos = key2pos(key);
        let index = dims.files - 1 - pos[0] + pos[1] * dims.files;
        if (!asSente)
            index = dims.files * dims.ranks - 1 - index;
        return index;
    }
    function isInsideRect(rect, pos) {
        return (rect.left <= pos[0] && rect.top <= pos[1] && rect.left + rect.width > pos[0] && rect.top + rect.height > pos[1]);
    }
    function getKeyAtDomPos(pos, asSente, dims, bounds) {
        let file = Math.floor((dims.files * (pos[0] - bounds.left)) / bounds.width);
        if (asSente)
            file = dims.files - 1 - file;
        let rank = Math.floor((dims.ranks * (pos[1] - bounds.top)) / bounds.height);
        if (!asSente)
            rank = dims.ranks - 1 - rank;
        return file >= 0 && file < dims.files && rank >= 0 && rank < dims.ranks ? pos2key([file, rank]) : undefined;
    }
    function getHandPieceAtDomPos(pos, roles, bounds) {
        for (const color of colors) {
            for (const role of roles) {
                const piece = { color, role }, pieceRect = bounds.get(pieceNameOf(piece));
                if (pieceRect && isInsideRect(pieceRect, pos))
                    return piece;
            }
        }
        return;
    }
    function posOfOutsideEl(left, top, asSente, dims, boardBounds) {
        const sqW = boardBounds.width / dims.files, sqH = boardBounds.height / dims.ranks;
        let xOff = (left - boardBounds.left) / sqW;
        if (asSente)
            xOff = dims.files - 1 - xOff;
        let yOff = (top - boardBounds.top) / sqH;
        if (!asSente)
            yOff = dims.ranks - 1 - yOff;
        return [xOff, yOff];
    }

    function addToHand(s, piece, cnt = 1) {
        const hand = s.hands.handMap.get(piece.color);
        if (hand && s.hands.roles.includes(piece.role))
            hand.set(piece.role, (hand.get(piece.role) || 0) + cnt);
    }
    function removeFromHand(s, piece, cnt = 1) {
        const hand = s.hands.handMap.get(piece.color), num = hand === null || hand === void 0 ? void 0 : hand.get(piece.role);
        if (hand && num)
            hand.set(piece.role, Math.max(num - cnt, 0));
    }
    function renderHand$1(s, handEl) {
        var _a;
        handEl.classList.toggle('promotion', !!s.promotion.current);
        let wrapEl = handEl.firstElementChild;
        while (wrapEl) {
            const pieceEl = wrapEl.firstElementChild, piece = { role: pieceEl.sgRole, color: pieceEl.sgColor }, num = ((_a = s.hands.handMap.get(piece.color)) === null || _a === void 0 ? void 0 : _a.get(piece.role)) || 0, isSelected = !!s.selectedPiece && samePiece(piece, s.selectedPiece) && !s.droppable.spare;
            wrapEl.classList.toggle('selected', (s.activeColor === 'both' || s.activeColor === s.turnColor) && isSelected);
            wrapEl.classList.toggle('preselected', s.activeColor !== 'both' && s.activeColor !== s.turnColor && isSelected);
            wrapEl.classList.toggle('drawing', !!s.drawable.piece && samePiece(s.drawable.piece, piece));
            wrapEl.classList.toggle('current-pre', !!s.predroppable.current && samePiece(s.predroppable.current.piece, piece));
            wrapEl.dataset.nb = num.toString();
            wrapEl = wrapEl.nextElementSibling;
        }
    }

    function toggleOrientation(state) {
        state.orientation = opposite(state.orientation);
        state.animation.current =
            state.draggable.current =
                state.promotion.current =
                    state.hovered =
                        state.selected =
                            state.selectedPiece =
                                undefined;
    }
    function reset(state) {
        unselect$1(state);
        unsetPremove(state);
        unsetPredrop(state);
        cancelPromotion(state);
        state.animation.current = state.draggable.current = state.hovered = undefined;
    }
    function setPieces(state, pieces) {
        for (const [key, piece] of pieces) {
            if (piece)
                state.pieces.set(key, piece);
            else
                state.pieces.delete(key);
        }
    }
    function setChecks(state, checksValue) {
        if (Array.isArray(checksValue)) {
            state.checks = checksValue;
        }
        else {
            if (checksValue === true)
                checksValue = state.turnColor;
            if (checksValue) {
                const checks = [];
                for (const [k, p] of state.pieces) {
                    if (state.highlight.checkRoles.includes(p.role) && p.color === checksValue)
                        checks.push(k);
                }
                state.checks = checks;
            }
            else
                state.checks = undefined;
        }
    }
    function setPremove(state, orig, dest, prom) {
        unsetPredrop(state);
        state.premovable.current = { orig, dest, prom };
        callUserFunction(state.premovable.events.set, orig, dest, prom);
    }
    function unsetPremove(state) {
        if (state.premovable.current) {
            state.premovable.current = undefined;
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
            state.predroppable.current = undefined;
            callUserFunction(state.predroppable.events.unset);
        }
    }
    function baseMove(state, orig, dest, prom) {
        const origPiece = state.pieces.get(orig), destPiece = state.pieces.get(dest);
        if (orig === dest || !origPiece)
            return false;
        const captured = destPiece && destPiece.color !== origPiece.color ? destPiece : undefined, promPiece = prom && promotePiece(state, origPiece);
        if (dest === state.selected || orig === state.selected)
            unselect$1(state);
        state.pieces.set(dest, promPiece || origPiece);
        state.pieces.delete(orig);
        state.lastDests = [orig, dest];
        state.checks = undefined;
        callUserFunction(state.events.move, orig, dest, prom, captured);
        callUserFunction(state.events.change);
        return captured || true;
    }
    function baseDrop(state, piece, key, prom) {
        var _a;
        const pieceCount = ((_a = state.hands.handMap.get(piece.color)) === null || _a === void 0 ? void 0 : _a.get(piece.role)) || 0;
        if (!pieceCount && !state.droppable.spare)
            return false;
        const promPiece = prom && promotePiece(state, piece);
        if (key === state.selected ||
            (!state.droppable.spare && pieceCount === 1 && state.selectedPiece && samePiece(state.selectedPiece, piece)))
            unselect$1(state);
        state.pieces.set(key, promPiece || piece);
        state.lastDests = [key];
        state.checks = undefined;
        if (!state.droppable.spare)
            removeFromHand(state, piece);
        callUserFunction(state.events.drop, piece, key, prom);
        callUserFunction(state.events.change);
        return true;
    }
    function baseUserMove(state, orig, dest, prom) {
        const result = baseMove(state, orig, dest, prom);
        if (result) {
            state.movable.dests = undefined;
            state.droppable.dests = undefined;
            state.turnColor = opposite(state.turnColor);
            state.animation.current = undefined;
        }
        return result;
    }
    function baseUserDrop(state, piece, key, prom) {
        const result = baseDrop(state, piece, key, prom);
        if (result) {
            state.movable.dests = undefined;
            state.droppable.dests = undefined;
            state.turnColor = opposite(state.turnColor);
            state.animation.current = undefined;
        }
        return result;
    }
    function userDrop(state, piece, key, prom) {
        const realProm = prom || state.promotion.forceDropPromotion(piece, key);
        if (canDrop(state, piece, key)) {
            const result = baseUserDrop(state, piece, key, realProm);
            if (result) {
                unselect$1(state);
                callUserFunction(state.droppable.events.after, piece, key, realProm, {
                    premade: false,
                });
                return true;
            }
        }
        else if (canPredrop(state, piece, key)) {
            setPredrop(state, piece, key, realProm);
            unselect$1(state);
            return true;
        }
        unselect$1(state);
        return false;
    }
    function userMove(state, orig, dest, prom) {
        const realProm = prom || state.promotion.forceMovePromotion(orig, dest);
        if (canMove(state, orig, dest)) {
            const result = baseUserMove(state, orig, dest, realProm);
            if (result) {
                unselect$1(state);
                const metadata = {
                    premade: false,
                };
                if (result !== true)
                    metadata.captured = result;
                callUserFunction(state.movable.events.after, orig, dest, realProm, metadata);
                return true;
            }
        }
        else if (canPremove(state, orig, dest)) {
            setPremove(state, orig, dest, realProm);
            unselect$1(state);
            return true;
        }
        unselect$1(state);
        return false;
    }
    function basePromotionDialog(state, piece, key) {
        const promotedPiece = promotePiece(state, piece);
        if (state.viewOnly || state.promotion.current || !promotedPiece)
            return false;
        state.promotion.current = {
            piece,
            promotedPiece,
            key,
            dragged: !!state.draggable.current,
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
        return promRole !== undefined ? { color: piece.color, role: promRole } : undefined;
    }
    function deletePiece(state, key) {
        if (state.pieces.delete(key))
            callUserFunction(state.events.change);
    }
    function selectSquare(state, key, prom, force) {
        callUserFunction(state.events.select, key);
        // unselect if selecting selected key, keep selected for drag
        if (!state.draggable.enabled && state.selected === key) {
            callUserFunction(state.events.unselect, key);
            unselect$1(state);
            return;
        }
        // try moving/dropping
        if (state.selectable.enabled || force) {
            if (state.selectedPiece && userDrop(state, state.selectedPiece, key, prom))
                return;
            else if (state.selected && userMove(state, state.selected, key, prom))
                return;
        }
        if ((state.selectable.enabled || state.draggable.enabled || force) &&
            (isMovable(state, key) || isPremovable(state, key))) {
            setSelected(state, key);
        }
    }
    function selectPiece(state, piece, spare, force) {
        callUserFunction(state.events.pieceSelect, piece);
        // unselect if selecting the selected piece, keep selected for drag
        if (!state.draggable.enabled && state.selectedPiece && samePiece(state.selectedPiece, piece)) {
            callUserFunction(state.events.pieceUnselect, piece);
            unselect$1(state);
        }
        else if ((state.selectable.enabled || state.draggable.enabled || force) &&
            (isDroppable(state, piece, !!spare) || isPredroppable(state, piece))) {
            setSelectedPiece(state, piece);
            state.droppable.spare = !!spare;
        }
        else {
            unselect$1(state);
        }
    }
    function setSelected(state, key) {
        unselect$1(state);
        state.selected = key;
        setPreDests(state);
    }
    function setSelectedPiece(state, piece) {
        unselect$1(state);
        state.selectedPiece = piece;
        setPreDests(state);
    }
    function setPreDests(state) {
        state.premovable.dests = state.predroppable.dests = undefined;
        if (state.selected && isPremovable(state, state.selected) && state.premovable.generate)
            state.premovable.dests = state.premovable.generate(state.selected, state.pieces);
        else if (state.selectedPiece && isPredroppable(state, state.selectedPiece) && state.predroppable.generate)
            state.predroppable.dests = state.predroppable.generate(state.selectedPiece, state.pieces);
    }
    function unselect$1(state) {
        state.selected =
            state.selectedPiece =
                state.premovable.dests =
                    state.predroppable.dests =
                        state.promotion.current =
                            undefined;
    }
    function isMovable(state, orig) {
        const piece = state.pieces.get(orig);
        return (!!piece && (state.activeColor === 'both' || (state.activeColor === piece.color && state.turnColor === piece.color)));
    }
    function isDroppable(state, piece, spare) {
        var _a;
        return ((spare || !!((_a = state.hands.handMap.get(piece.color)) === null || _a === void 0 ? void 0 : _a.get(piece.role))) &&
            (state.activeColor === 'both' || (state.activeColor === piece.color && state.turnColor === piece.color)));
    }
    function canMove(state, orig, dest) {
        var _a, _b;
        return (orig !== dest && isMovable(state, orig) && (state.movable.free || !!((_b = (_a = state.movable.dests) === null || _a === void 0 ? void 0 : _a.get(orig)) === null || _b === void 0 ? void 0 : _b.includes(dest))));
    }
    function canDrop(state, piece, dest) {
        var _a, _b;
        return (isDroppable(state, piece, state.droppable.spare) &&
            (state.droppable.free || state.droppable.spare || !!((_b = (_a = state.droppable.dests) === null || _a === void 0 ? void 0 : _a.get(pieceNameOf(piece))) === null || _b === void 0 ? void 0 : _b.includes(dest))));
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
        return (!!((_a = state.hands.handMap.get(piece.color)) === null || _a === void 0 ? void 0 : _a.get(piece.role)) &&
            state.predroppable.enabled &&
            state.activeColor === piece.color &&
            state.turnColor !== piece.color);
    }
    function canPremove(state, orig, dest) {
        return (orig !== dest &&
            isPremovable(state, orig) &&
            !!state.premovable.generate &&
            state.premovable.generate(orig, state.pieces).includes(dest));
    }
    function canPredrop(state, piece, dest) {
        const destPiece = state.pieces.get(dest);
        return (isPredroppable(state, piece) &&
            (!destPiece || destPiece.color !== state.activeColor) &&
            !!state.predroppable.generate &&
            state.predroppable.generate(piece, state.pieces).includes(dest));
    }
    function isDraggable(state, piece) {
        return (state.draggable.enabled &&
            (state.activeColor === 'both' ||
                (state.activeColor === piece.color && (state.turnColor === piece.color || state.premovable.enabled))));
    }
    function playPremove(state) {
        const move = state.premovable.current;
        if (!move)
            return false;
        const orig = move.orig, dest = move.dest, prom = move.prom;
        let success = false;
        if (canMove(state, orig, dest)) {
            const result = baseUserMove(state, orig, dest, prom);
            if (result) {
                const metadata = { premade: true };
                if (result !== true)
                    metadata.captured = result;
                callUserFunction(state.movable.events.after, orig, dest, prom, metadata);
                success = true;
            }
        }
        unsetPremove(state);
        return success;
    }
    function playPredrop(state) {
        const drop = state.predroppable.current;
        if (!drop)
            return false;
        const piece = drop.piece, key = drop.key, prom = drop.prom;
        let success = false;
        if (canDrop(state, piece, key)) {
            if (baseUserDrop(state, piece, key, prom)) {
                callUserFunction(state.droppable.events.after, piece, key, prom, {
                    premade: true,
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
        unselect$1(state);
    }
    function cancelPromotion(state) {
        if (!state.promotion.current)
            return;
        unselect$1(state);
        state.promotion.current = undefined;
        state.hovered = undefined;
        callUserFunction(state.promotion.events.cancel);
    }
    function stop(state) {
        state.activeColor =
            state.movable.dests =
                state.droppable.dests =
                    state.draggable.current =
                        state.animation.current =
                            state.promotion.current =
                                state.hovered =
                                    undefined;
        cancelMoveOrDrop(state);
    }

    function inferDimensions(boardSfen) {
        const ranks = boardSfen.split('/'), firstFile = ranks[0].split('');
        let filesCnt = 0, cnt = 0;
        for (const c of firstFile) {
            const nb = c.charCodeAt(0);
            if (nb < 58 && nb > 47)
                cnt = cnt * 10 + nb - 48;
            else if (c !== '+') {
                filesCnt += cnt + 1;
                cnt = 0;
            }
        }
        filesCnt += cnt;
        return { files: filesCnt, ranks: ranks.length };
    }
    function sfenToBoard(sfen, dims, fromForsyth) {
        const sfenParser = fromForsyth || standardFromForsyth, pieces = new Map();
        let x = dims.files - 1, y = 0;
        for (let i = 0; i < sfen.length; i++) {
            switch (sfen[i]) {
                case ' ':
                case '_':
                    return pieces;
                case '/':
                    ++y;
                    if (y > dims.ranks - 1)
                        return pieces;
                    x = dims.files - 1;
                    break;
                default: {
                    const nb1 = sfen[i].charCodeAt(0), nb2 = sfen[i + 1] && sfen[i + 1].charCodeAt(0);
                    if (nb1 < 58 && nb1 > 47) {
                        if (nb2 && nb2 < 58 && nb2 > 47) {
                            x -= (nb1 - 48) * 10 + (nb2 - 48);
                            i++;
                        }
                        else
                            x -= nb1 - 48;
                    }
                    else {
                        const roleStr = sfen[i] === '+' && sfen.length > i + 1 ? '+' + sfen[++i] : sfen[i], role = sfenParser(roleStr);
                        if (x >= 0 && role) {
                            const color = roleStr === roleStr.toLowerCase() ? 'gote' : 'sente';
                            pieces.set(pos2key([x, y]), {
                                role: role,
                                color: color,
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
        return ranks
            .slice(0, dims.ranks)
            .map(y => reversedFiles
            .map(x => {
            const piece = pieces.get((x + y)), forsyth = piece && sfenRenderer(piece.role);
            if (forsyth) {
                return piece.color === 'sente' ? forsyth.toUpperCase() : forsyth.toLowerCase();
            }
            else
                return '1';
        })
            .join(''))
            .join('/')
            .replace(/1{2,}/g, s => s.length.toString());
    }
    function sfenToHands(sfen, fromForsyth) {
        const sfenParser = fromForsyth || standardFromForsyth, sente = new Map(), gote = new Map();
        let tmpNum = 0, num = 1;
        for (let i = 0; i < sfen.length; i++) {
            const nb = sfen[i].charCodeAt(0);
            if (nb < 58 && nb > 47) {
                tmpNum = tmpNum * 10 + nb - 48;
                num = tmpNum;
            }
            else {
                const roleStr = sfen[i] === '+' && sfen.length > i + 1 ? '+' + sfen[++i] : sfen[i], role = sfenParser(roleStr);
                if (role) {
                    const color = roleStr === roleStr.toLowerCase() ? 'gote' : 'sente';
                    if (color === 'sente')
                        sente.set(role, (sente.get(role) || 0) + num);
                    else
                        gote.set(role, (gote.get(role) || 0) + num);
                }
                tmpNum = 0;
                num = 1;
            }
        }
        return new Map([
            ['sente', sente],
            ['gote', gote],
        ]);
    }
    function handsToSfen(hands, roles, toForsyth) {
        var _a, _b;
        const sfenRenderer = toForsyth || standardToForsyth;
        let senteHandStr = '', goteHandStr = '';
        for (const role of roles) {
            const forsyth = sfenRenderer(role);
            if (forsyth) {
                const senteCnt = (_a = hands.get('sente')) === null || _a === void 0 ? void 0 : _a.get(role), goteCnt = (_b = hands.get('gote')) === null || _b === void 0 ? void 0 : _b.get(role);
                if (senteCnt)
                    senteHandStr += senteCnt > 1 ? senteCnt.toString() + forsyth : forsyth;
                if (goteCnt)
                    goteHandStr += goteCnt > 1 ? goteCnt.toString() + forsyth : forsyth;
            }
        }
        if (senteHandStr || goteHandStr)
            return senteHandStr.toUpperCase() + goteHandStr.toLowerCase();
        else
            return '-';
    }
    function standardFromForsyth(forsyth) {
        switch (forsyth.toLowerCase()) {
            case 'p':
                return 'pawn';
            case 'l':
                return 'lance';
            case 'n':
                return 'knight';
            case 's':
                return 'silver';
            case 'g':
                return 'gold';
            case 'b':
                return 'bishop';
            case 'r':
                return 'rook';
            case '+p':
                return 'tokin';
            case '+l':
                return 'promotedlance';
            case '+n':
                return 'promotedknight';
            case '+s':
                return 'promotedsilver';
            case '+b':
                return 'horse';
            case '+r':
                return 'dragon';
            case 'k':
                return 'king';
            default:
                return;
        }
    }
    function standardToForsyth(role) {
        switch (role) {
            case 'pawn':
                return 'p';
            case 'lance':
                return 'l';
            case 'knight':
                return 'n';
            case 'silver':
                return 's';
            case 'gold':
                return 'g';
            case 'bishop':
                return 'b';
            case 'rook':
                return 'r';
            case 'tokin':
                return '+p';
            case 'promotedlance':
                return '+l';
            case 'promotedknight':
                return '+n';
            case 'promotedsilver':
                return '+s';
            case 'horse':
                return '+b';
            case 'dragon':
                return '+r';
            case 'king':
                return 'k';
            default:
                return;
        }
    }

    function applyAnimation(state, config) {
        if (config.animation) {
            deepMerge(state.animation, config.animation);
            // no need for such short animations
            if ((state.animation.duration || 0) < 70)
                state.animation.enabled = false;
        }
    }
    function configure(state, config) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        // don't merge, just override.
        if ((_a = config.movable) === null || _a === void 0 ? void 0 : _a.dests)
            state.movable.dests = undefined;
        if ((_b = config.droppable) === null || _b === void 0 ? void 0 : _b.dests)
            state.droppable.dests = undefined;
        if ((_c = config.drawable) === null || _c === void 0 ? void 0 : _c.shapes)
            state.drawable.shapes = [];
        if ((_d = config.drawable) === null || _d === void 0 ? void 0 : _d.autoShapes)
            state.drawable.autoShapes = [];
        if ((_e = config.drawable) === null || _e === void 0 ? void 0 : _e.squares)
            state.drawable.squares = [];
        if ((_f = config.hands) === null || _f === void 0 ? void 0 : _f.roles)
            state.hands.roles = [];
        deepMerge(state, config);
        // if a sfen was provided, replace the pieces, except the currently dragged one
        if ((_g = config.sfen) === null || _g === void 0 ? void 0 : _g.board) {
            state.dimensions = inferDimensions(config.sfen.board);
            state.pieces = sfenToBoard(config.sfen.board, state.dimensions, state.forsyth.fromForsyth);
            state.drawable.shapes = ((_h = config.drawable) === null || _h === void 0 ? void 0 : _h.shapes) || [];
        }
        if ((_j = config.sfen) === null || _j === void 0 ? void 0 : _j.hands) {
            state.hands.handMap = sfenToHands(config.sfen.hands, state.forsyth.fromForsyth);
        }
        // apply config values that could be undefined yet meaningful
        if ('checks' in config)
            setChecks(state, config.checks || false);
        if ('lastDests' in config && !config.lastDests)
            state.lastDests = undefined;
        // in case of drop last move, there's a single square.
        // if the previous last move had two squares,
        // the merge algorithm will incorrectly keep the second square.
        else if (config.lastDests)
            state.lastDests = config.lastDests;
        // fix move/premove dests
        setPreDests(state);
        applyAnimation(state, config);
    }
    function deepMerge(base, extend) {
        for (const key in extend) {
            if (Object.prototype.hasOwnProperty.call(extend, key)) {
                if (Object.prototype.hasOwnProperty.call(base, key) && isPlainObject(base[key]) && isPlainObject(extend[key]))
                    deepMerge(base[key], extend[key]);
                else
                    base[key] = extend[key];
            }
        }
    }
    function isPlainObject(o) {
        if (typeof o !== 'object' || o === null)
            return false;
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
    }

    function render$1(s, boardEls) {
        var _a, _b, _c;
        const asSente = sentePov(s.orientation), scaleDown = s.scaleDownPieces ? 0.5 : 1, posToTranslate = posToTranslateRel(s.dimensions), squaresEl = boardEls.squares, piecesEl = boardEls.pieces, draggedEl = boardEls.dragged, squareOverEl = boardEls.squareOver, promotionEl = boardEls.promotion, pieces = s.pieces, curAnim = s.animation.current, anims = curAnim ? curAnim.plan.anims : new Map(), fadings = curAnim ? curAnim.plan.fadings : new Map(), promotions = curAnim ? curAnim.plan.promotions : new Map(), curDrag = s.draggable.current, curPromKey = ((_a = s.promotion.current) === null || _a === void 0 ? void 0 : _a.dragged) ? s.selected : undefined, squares = computeSquareClasses(s), samePieces = new Set(), movedPieces = new Map();
        // if piece not being dragged anymore, hide it
        if (!curDrag && (draggedEl === null || draggedEl === void 0 ? void 0 : draggedEl.sgDragging)) {
            draggedEl.sgDragging = false;
            setDisplay(draggedEl, false);
            if (squareOverEl)
                setDisplay(squareOverEl, false);
        }
        let k, el, pieceAtKey, elPieceName, anim, fading, prom, pMvdset, pMvd;
        // walk over all board dom elements, apply animations and flag moved pieces
        el = piecesEl.firstElementChild;
        while (el) {
            if (isPieceNode(el)) {
                k = el.sgKey;
                pieceAtKey = pieces.get(k);
                anim = anims.get(k);
                fading = fadings.get(k);
                prom = promotions.get(k);
                elPieceName = pieceNameOf({ color: el.sgColor, role: el.sgRole });
                // if piece dragged add or remove ghost class or if promotion dialog is active for the piece add prom class
                if ((((curDrag === null || curDrag === void 0 ? void 0 : curDrag.started) && ((_b = curDrag.fromBoard) === null || _b === void 0 ? void 0 : _b.orig) === k) || (curPromKey && curPromKey === k)) && !el.sgGhost) {
                    el.sgGhost = true;
                    el.classList.add('ghost');
                }
                else if (el.sgGhost && (!curDrag || ((_c = curDrag.fromBoard) === null || _c === void 0 ? void 0 : _c.orig) !== k) && (!curPromKey || curPromKey !== k)) {
                    el.sgGhost = false;
                    el.classList.remove('ghost');
                }
                // remove fading class if it still remains
                if (!fading && el.sgFading) {
                    el.sgFading = false;
                    el.classList.remove('fading');
                }
                // there is now a piece at this dom key
                if (pieceAtKey) {
                    // continue animation if already animating and same piece or promoting piece
                    // (otherwise it could animate a captured piece)
                    if (anim &&
                        el.sgAnimating &&
                        (elPieceName === pieceNameOf(pieceAtKey) || (prom && elPieceName === pieceNameOf(prom)))) {
                        const pos = key2pos(k);
                        pos[0] += anim[2];
                        pos[1] += anim[3];
                        translateRel(el, posToTranslate(pos, asSente), scaleDown);
                    }
                    else if (el.sgAnimating) {
                        el.sgAnimating = false;
                        el.classList.remove('anim');
                        translateRel(el, posToTranslate(key2pos(k), asSente), scaleDown);
                    }
                    // same piece: flag as same
                    if (elPieceName === pieceNameOf(pieceAtKey) && (!fading || !el.sgFading)) {
                        samePieces.add(k);
                    }
                    // different piece: flag as moved unless it is a fading piece or an animated promoting piece
                    else {
                        if (fading && elPieceName === pieceNameOf(fading)) {
                            el.sgFading = true;
                            el.classList.add('fading');
                        }
                        else if (prom && elPieceName === pieceNameOf(prom)) {
                            samePieces.add(k);
                        }
                        else {
                            appendValue(movedPieces, elPieceName, el);
                        }
                    }
                }
                // no piece: flag as moved
                else {
                    appendValue(movedPieces, elPieceName, el);
                }
            }
            el = el.nextElementSibling;
        }
        // walk over all squares and apply classes
        let sqEl = squaresEl.firstElementChild;
        while (sqEl && isSquareNode(sqEl)) {
            sqEl.className = squares.get(sqEl.sgKey) || '';
            sqEl = sqEl.nextElementSibling;
        }
        // walk over all pieces in current set, apply dom changes to moved pieces
        // or append new pieces
        for (const [k, p] of pieces) {
            const piece = promotions.get(k) || p;
            anim = anims.get(k);
            if (!samePieces.has(k)) {
                pMvdset = movedPieces.get(pieceNameOf(piece));
                pMvd = pMvdset && pMvdset.pop();
                // a same piece was moved
                if (pMvd) {
                    // apply dom changes
                    pMvd.sgKey = k;
                    if (pMvd.sgFading) {
                        pMvd.sgFading = false;
                        pMvd.classList.remove('fading');
                    }
                    const pos = key2pos(k);
                    if (anim) {
                        pMvd.sgAnimating = true;
                        pMvd.classList.add('anim');
                        pos[0] += anim[2];
                        pos[1] += anim[3];
                    }
                    translateRel(pMvd, posToTranslate(pos, asSente), scaleDown);
                }
                // no piece in moved obj: insert the new piece
                else {
                    const pieceNode = createEl('piece', pieceNameOf(p)), pos = key2pos(k);
                    pieceNode.sgColor = p.color;
                    pieceNode.sgRole = p.role;
                    pieceNode.sgKey = k;
                    if (anim) {
                        pieceNode.sgAnimating = true;
                        pos[0] += anim[2];
                        pos[1] += anim[3];
                    }
                    translateRel(pieceNode, posToTranslate(pos, asSente), scaleDown);
                    piecesEl.appendChild(pieceNode);
                }
            }
        }
        // remove any element that remains in the moved sets
        for (const nodes of movedPieces.values())
            removeNodes(s, nodes);
        if (promotionEl)
            renderPromotion(s, promotionEl);
    }
    function removeNodes(s, nodes) {
        for (const node of nodes)
            s.dom.elements.board.pieces.removeChild(node);
    }
    function appendValue(map, key, value) {
        const arr = map.get(key);
        if (arr)
            arr.push(value);
        else
            map.set(key, [value]);
    }
    function computeSquareClasses(s) {
        var _a, _b;
        const squares = new Map();
        if (s.lastDests && s.highlight.lastDests)
            for (const k of s.lastDests)
                addSquare(squares, k, 'last-dest');
        if (s.checks && s.highlight.check)
            for (const check of s.checks)
                addSquare(squares, check, 'check');
        if (s.hovered)
            addSquare(squares, s.hovered, 'hover');
        if (s.selected) {
            if (s.activeColor === 'both' || s.activeColor === s.turnColor)
                addSquare(squares, s.selected, 'selected');
            else
                addSquare(squares, s.selected, 'preselected');
            if (s.movable.showDests) {
                const dests = (_a = s.movable.dests) === null || _a === void 0 ? void 0 : _a.get(s.selected);
                if (dests)
                    for (const k of dests) {
                        addSquare(squares, k, 'dest' + (s.pieces.has(k) ? ' oc' : ''));
                    }
                const pDests = s.premovable.dests;
                if (pDests)
                    for (const k of pDests) {
                        addSquare(squares, k, 'pre-dest' + (s.pieces.has(k) ? ' oc' : ''));
                    }
            }
        }
        else if (s.selectedPiece) {
            if (s.droppable.showDests) {
                const dests = (_b = s.droppable.dests) === null || _b === void 0 ? void 0 : _b.get(pieceNameOf(s.selectedPiece));
                if (dests)
                    for (const k of dests) {
                        addSquare(squares, k, 'dest');
                    }
                const pDests = s.predroppable.dests;
                if (pDests)
                    for (const k of pDests) {
                        addSquare(squares, k, 'pre-dest' + (s.pieces.has(k) ? ' oc' : ''));
                    }
            }
        }
        const premove = s.premovable.current;
        if (premove) {
            addSquare(squares, premove.orig, 'current-pre');
            addSquare(squares, premove.dest, 'current-pre' + (premove.prom ? ' prom' : ''));
        }
        else if (s.predroppable.current)
            addSquare(squares, s.predroppable.current.key, 'current-pre' + (s.predroppable.current.prom ? ' prom' : ''));
        for (const sqh of s.drawable.squares) {
            addSquare(squares, sqh.key, sqh.className);
        }
        return squares;
    }
    function addSquare(squares, key, klass) {
        const classes = squares.get(key);
        if (classes)
            squares.set(key, `${classes} ${klass}`);
        else
            squares.set(key, klass);
    }
    function renderPromotion(s, promotionEl) {
        const cur = s.promotion.current, key = cur && cur.key, pieces = cur ? [cur.promotedPiece, cur.piece] : [], hash = promotionHash(!!cur, key, pieces);
        if (s.promotion.prevPromotionHash === hash)
            return;
        s.promotion.prevPromotionHash = hash;
        if (key) {
            const asSente = sentePov(s.orientation), initPos = key2pos(key), color = cur.piece.color, promotionSquare = createEl('sg-promotion-square'), promotionChoices = createEl('sg-promotion-choices');
            if (s.orientation !== color)
                promotionChoices.classList.add('reversed');
            translateRel(promotionSquare, posToTranslateRel(s.dimensions)(initPos, asSente), 1);
            for (const p of pieces) {
                const pieceNode = createEl('piece', pieceNameOf(p));
                pieceNode.sgColor = p.color;
                pieceNode.sgRole = p.role;
                promotionChoices.appendChild(pieceNode);
            }
            promotionEl.innerHTML = '';
            promotionSquare.appendChild(promotionChoices);
            promotionEl.appendChild(promotionSquare);
            setDisplay(promotionEl, true);
        }
        else {
            setDisplay(promotionEl, false);
        }
    }
    function promotionHash(active, key, pieces) {
        return [active, key, pieces.map(p => pieceNameOf(p)).join(' ')].join(' ');
    }

    function createSVGElement(tagName) {
        return document.createElementNS('http://www.w3.org/2000/svg', tagName);
    }
    const outsideArrowHash = 'outsideArrow';
    function renderShapes(state, svg, customSvg, freePieces) {
        const d = state.drawable, curD = d.current, cur = (curD === null || curD === void 0 ? void 0 : curD.dest) ? curD : undefined, outsideArrow = !!curD && !cur, arrowDests = new Map(), pieceMap = new Map();
        const hashBounds = () => {
            // todo also possible piece bounds
            const bounds = state.dom.bounds.board.bounds();
            return (bounds && bounds.width.toString() + bounds.height) || '';
        };
        for (const s of d.shapes.concat(d.autoShapes).concat(cur ? [cur] : [])) {
            const destName = isPiece(s.dest) ? pieceNameOf(s.dest) : s.dest;
            if (!samePieceOrKey(s.dest, s.orig))
                arrowDests.set(destName, (arrowDests.get(destName) || 0) + 1);
        }
        for (const s of d.shapes.concat(cur ? [cur] : []).concat(d.autoShapes)) {
            if (s.piece && !isPiece(s.orig))
                pieceMap.set(s.orig, s);
        }
        const pieceShapes = [...pieceMap.values()].map(s => {
            return {
                shape: s,
                hash: shapeHash(s, arrowDests, false, hashBounds),
            };
        });
        const shapes = d.shapes.concat(d.autoShapes).map((s) => {
            return {
                shape: s,
                hash: shapeHash(s, arrowDests, false, hashBounds),
            };
        });
        if (cur)
            shapes.push({
                shape: cur,
                hash: shapeHash(cur, arrowDests, true, hashBounds),
                current: true,
            });
        const fullHash = shapes.map(sc => sc.hash).join(';') + (outsideArrow ? outsideArrowHash : '');
        if (fullHash === state.drawable.prevSvgHash)
            return;
        state.drawable.prevSvgHash = fullHash;
        /*
          -- DOM hierarchy --
          <svg class="sg-shapes"> (<= svg)
            <defs>
              ...(for brushes)...
            </defs>
            <g>
              ...(for arrows and circles)...
            </g>
          </svg>
          <svg class="sg-custom-svgs"> (<= customSvg)
            <g>
              ...(for custom svgs)...
            </g>
          <sg-free-pieces> (<= freePieces)
            ...(for pieces)...
          </sg-free-pieces>
          </svg>
        */
        const defsEl = svg.querySelector('defs'), shapesEl = svg.querySelector('g'), customSvgsEl = customSvg.querySelector('g');
        syncDefs(shapes, outsideArrow ? curD : undefined, defsEl);
        syncShapes(shapes.filter(s => !s.shape.customSvg && (!s.shape.piece || s.current)), shapesEl, shape => renderSVGShape(state, shape, arrowDests), outsideArrow);
        syncShapes(shapes.filter(s => s.shape.customSvg), customSvgsEl, shape => renderSVGShape(state, shape, arrowDests));
        syncShapes(pieceShapes, freePieces, shape => renderPiece(state, shape));
        if (!outsideArrow && curD)
            curD.arrow = undefined;
        if (outsideArrow && !curD.arrow) {
            const orig = pieceOrKeyToPos(curD.orig, state);
            if (orig) {
                const g = setAttributes(createSVGElement('g'), {
                    class: shapeClass(curD.brush, true, true),
                    sgHash: outsideArrowHash,
                }), el = renderArrow(curD.brush, orig, orig, state.squareRatio, true, false);
                g.appendChild(el);
                curD.arrow = el;
                shapesEl.appendChild(g);
            }
        }
    }
    // append only. Don't try to update/remove.
    function syncDefs(shapes, outsideShape, defsEl) {
        const brushes = new Set();
        for (const s of shapes) {
            if (!samePieceOrKey(s.shape.dest, s.shape.orig))
                brushes.add(s.shape.brush);
        }
        if (outsideShape)
            brushes.add(outsideShape.brush);
        const keysInDom = new Set();
        let el = defsEl.firstElementChild;
        while (el) {
            keysInDom.add(el.getAttribute('sgKey'));
            el = el.nextElementSibling;
        }
        for (const key of brushes) {
            const brush = key || 'primary';
            if (!keysInDom.has(brush))
                defsEl.appendChild(renderMarker(brush));
        }
    }
    // append and remove only. No updates.
    function syncShapes(shapes, root, renderShape, outsideArrow) {
        const hashesInDom = new Map(), // by hash
        toRemove = [];
        for (const sc of shapes)
            hashesInDom.set(sc.hash, false);
        if (outsideArrow)
            hashesInDom.set(outsideArrowHash, true);
        let el = root.firstElementChild, elHash;
        while (el) {
            elHash = el.getAttribute('sgHash');
            // found a shape element that's here to stay
            if (hashesInDom.has(elHash))
                hashesInDom.set(elHash, true);
            // or remove it
            else
                toRemove.push(el);
            el = el.nextElementSibling;
        }
        // remove old shapes
        for (const el of toRemove)
            root.removeChild(el);
        // insert shapes that are not yet in dom
        for (const sc of shapes) {
            if (!hashesInDom.get(sc.hash)) {
                const shapeEl = renderShape(sc);
                if (shapeEl)
                    root.appendChild(shapeEl);
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
            description,
        ]
            .filter(x => x)
            .join(',');
    }
    function pieceHash(piece) {
        return [piece.color, piece.role, piece.scale].filter(x => x).join(',');
    }
    function customSvgHash(s) {
        // Rolling hash with base 31 (cf. https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript)
        let h = 0;
        for (let i = 0; i < s.length; i++) {
            h = ((h << 5) - h + s.charCodeAt(i)) >>> 0;
        }
        return 'custom-' + h.toString();
    }
    function renderSVGShape(state, { shape, current, hash }, arrowDests) {
        const orig = pieceOrKeyToPos(shape.orig, state);
        if (!orig)
            return;
        if (shape.customSvg) {
            return renderCustomSvg(shape.brush, shape.customSvg, orig, state.squareRatio);
        }
        else {
            let el;
            const dest = !samePieceOrKey(shape.orig, shape.dest) && pieceOrKeyToPos(shape.dest, state);
            if (dest) {
                el = renderArrow(shape.brush, orig, dest, state.squareRatio, !!current, (arrowDests.get((isPiece(shape.dest) ? pieceNameOf(shape.dest) : shape.dest)) || 0) > 1);
            }
            else if (samePieceOrKey(shape.dest, shape.orig)) {
                let ratio = state.squareRatio;
                if (isPiece(shape.orig)) {
                    const pieceBounds = state.dom.bounds.hands.pieceBounds().get(pieceNameOf(shape.orig)), bounds = state.dom.bounds.board.bounds();
                    if (pieceBounds && bounds) {
                        const heightBase = pieceBounds.height / (bounds.height / state.dimensions.files);
                        // we want to keep the ratio that is on the board
                        ratio = [heightBase * state.squareRatio[0], heightBase * state.squareRatio[1]];
                    }
                }
                el = renderEllipse(orig, ratio, !!current);
            }
            if (el) {
                const g = setAttributes(createSVGElement('g'), {
                    class: shapeClass(shape.brush, !!current, false),
                    sgHash: hash,
                });
                g.appendChild(el);
                const descEl = shape.description && renderDescription(state, shape, arrowDests);
                if (descEl)
                    g.appendChild(descEl);
                return g;
            }
            else
                return;
        }
    }
    function renderCustomSvg(brush, customSvg, pos, ratio) {
        const [x, y] = pos;
        // Translate to top-left of `orig` square
        const g = setAttributes(createSVGElement('g'), { transform: `translate(${x},${y})` });
        const svg = setAttributes(createSVGElement('svg'), {
            class: brush,
            width: ratio[0],
            height: ratio[1],
            viewBox: `0 0 ${ratio[0] * 10} ${ratio[1] * 10}`,
        });
        g.appendChild(svg);
        svg.innerHTML = customSvg;
        return g;
    }
    function renderEllipse(pos, ratio, current) {
        const o = pos, widths = ellipseWidth(ratio);
        return setAttributes(createSVGElement('ellipse'), {
            'stroke-width': widths[current ? 0 : 1],
            fill: 'none',
            cx: o[0],
            cy: o[1],
            rx: ratio[0] / 2 - widths[1] / 2,
            ry: ratio[1] / 2 - widths[1] / 2,
        });
    }
    function renderArrow(brush, orig, dest, ratio, current, shorten) {
        const m = arrowMargin(shorten && !current, ratio), a = orig, b = dest, dx = b[0] - a[0], dy = b[1] - a[1], angle = Math.atan2(dy, dx), xo = Math.cos(angle) * m, yo = Math.sin(angle) * m;
        return setAttributes(createSVGElement('line'), {
            'stroke-width': lineWidth(current, ratio),
            'stroke-linecap': 'round',
            'marker-end': 'url(#arrowhead-' + (brush || 'primary') + ')',
            x1: a[0],
            y1: a[1],
            x2: b[0] - xo,
            y2: b[1] - yo,
        });
    }
    function renderPiece(state, { shape }) {
        if (!shape.piece || isPiece(shape.orig))
            return;
        const orig = shape.orig, scale = (shape.piece.scale || 1) * (state.scaleDownPieces ? 0.5 : 1);
        const pieceEl = createEl('piece', pieceNameOf(shape.piece));
        pieceEl.sgKey = orig;
        pieceEl.sgScale = scale;
        translateRel(pieceEl, posToTranslateRel(state.dimensions)(key2pos(orig), sentePov(state.orientation)), state.scaleDownPieces ? 0.5 : 1, scale);
        return pieceEl;
    }
    function renderDescription(state, shape, arrowDests) {
        const orig = pieceOrKeyToPos(shape.orig, state);
        if (!orig || !shape.description)
            return;
        const dest = !samePieceOrKey(shape.orig, shape.dest) && pieceOrKeyToPos(shape.dest, state), diff = dest ? [dest[0] - orig[0], dest[1] - orig[1]] : [0, 0], offset = (arrowDests.get(isPiece(shape.dest) ? pieceNameOf(shape.dest) : shape.dest) || 0) > 1 ? 0.3 : 0.15, close = (diff[0] === 0 || Math.abs(diff[0]) === state.squareRatio[0]) &&
            (diff[1] === 0 || Math.abs(diff[1]) === state.squareRatio[1]), ratio = dest ? 0.55 - (close ? offset : 0) : 0, mid = [orig[0] + diff[0] * ratio, orig[1] + diff[1] * ratio], textLength = shape.description.length;
        const g = setAttributes(createSVGElement('g'), { class: 'description' }), circle = setAttributes(createSVGElement('ellipse'), {
            cx: mid[0],
            cy: mid[1],
            rx: textLength + 1.5,
            ry: 2.5,
        }), text = setAttributes(createSVGElement('text'), {
            x: mid[0],
            y: mid[1],
            'text-anchor': 'middle',
            'dominant-baseline': 'central',
        });
        g.appendChild(circle);
        text.appendChild(document.createTextNode(shape.description));
        g.appendChild(text);
        return g;
    }
    function renderMarker(brush) {
        const marker = setAttributes(createSVGElement('marker'), {
            id: 'arrowhead-' + brush,
            orient: 'auto',
            markerWidth: 4,
            markerHeight: 8,
            refX: 2.05,
            refY: 2.01,
        });
        marker.appendChild(setAttributes(createSVGElement('path'), {
            d: 'M0,0 V4 L3,2 Z',
        }));
        marker.setAttribute('sgKey', brush);
        return marker;
    }
    function setAttributes(el, attrs) {
        for (const key in attrs) {
            if (Object.prototype.hasOwnProperty.call(attrs, key))
                el.setAttribute(key, attrs[key]);
        }
        return el;
    }
    function pos2user(pos, color, dims, ratio) {
        return color === 'sente'
            ? [(dims.files - 1 - pos[0]) * ratio[0], pos[1] * ratio[1]]
            : [pos[0] * ratio[0], (dims.ranks - 1 - pos[1]) * ratio[1]];
    }
    function isPiece(x) {
        return typeof x === 'object';
    }
    function samePieceOrKey(kp1, kp2) {
        return (isPiece(kp1) && isPiece(kp2) && samePiece(kp1, kp2)) || kp1 === kp2;
    }
    function usesBounds(shapes) {
        return shapes.some(s => isPiece(s.orig) || isPiece(s.dest));
    }
    function shapeClass(brush, current, outside) {
        return brush + (current ? ' current' : '') + (outside ? ' outside' : '');
    }
    function ratioAverage(ratio) {
        return (ratio[0] + ratio[1]) / 2;
    }
    function ellipseWidth(ratio) {
        return [(3 / 64) * ratioAverage(ratio), (4 / 64) * ratioAverage(ratio)];
    }
    function lineWidth(current, ratio) {
        return ((current ? 8.5 : 10) / 64) * ratioAverage(ratio);
    }
    function arrowMargin(shorten, ratio) {
        return ((shorten ? 20 : 10) / 64) * ratioAverage(ratio);
    }
    function pieceOrKeyToPos(kp, state) {
        if (isPiece(kp)) {
            const pieceBounds = state.dom.bounds.hands.pieceBounds().get(pieceNameOf(kp)), bounds = state.dom.bounds.board.bounds(), offset = sentePov(state.orientation) ? [0.5, -0.5] : [-0.5, 0.5], pos = pieceBounds &&
                bounds &&
                posOfOutsideEl(pieceBounds.left + pieceBounds.width / 2, pieceBounds.top + pieceBounds.height / 2, sentePov(state.orientation), state.dimensions, bounds);
            return (pos && pos2user([pos[0] + offset[0], pos[1] + offset[1]], state.orientation, state.dimensions, state.squareRatio));
        }
        else
            return pos2user(key2pos(kp), state.orientation, state.dimensions, state.squareRatio);
    }

    function redrawShapesNow(state) {
        var _a;
        if ((_a = state.dom.elements.board) === null || _a === void 0 ? void 0 : _a.svg)
            renderShapes(state, state.dom.elements.board.svg, state.dom.elements.board.customSvg, state.dom.elements.board.freePieces);
    }
    const redrawShapes = debounceRedraw(redrawShapesNow);
    function redrawNow(state, skipShapes) {
        const boardEls = state.dom.elements.board;
        if (boardEls) {
            render$1(state, boardEls);
            if (!skipShapes)
                redrawShapesNow(state);
        }
        const handEls = state.dom.elements.hands;
        if (handEls) {
            if (handEls.top)
                renderHand$1(state, handEls.top);
            if (handEls.bottom)
                renderHand$1(state, handEls.bottom);
        }
    }
    const redraw = debounceRedraw(redrawNow);
    function debounceRedraw(f) {
        let redrawing = false;
        return (...args) => {
            if (redrawing)
                return;
            redrawing = true;
            requestAnimationFrame(() => {
                f(...args);
                redrawing = false;
            });
        };
    }

    function anim(mutation, state) {
        return state.animation.enabled ? animate(mutation, state) : render(mutation, state);
    }
    function render(mutation, state) {
        const result = mutation(state);
        redraw(state);
        return result;
    }
    function makePiece(key, piece) {
        return {
            key: key,
            pos: key2pos(key),
            piece: piece,
        };
    }
    function closer(piece, pieces) {
        return pieces.sort((p1, p2) => {
            return distanceSq(piece.pos, p1.pos) - distanceSq(piece.pos, p2.pos);
        })[0];
    }
    function computePlan(prevPieces, prevHands, current) {
        const anims = new Map(), animedOrigs = [], fadings = new Map(), promotions = new Map(), missings = [], news = [], prePieces = new Map();
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
                }
                else
                    news.push(makePiece(key, curP));
            }
            else if (preP)
                missings.push(preP);
        }
        if (current.animation.hands) {
            for (const color of colors) {
                const curH = current.hands.handMap.get(color), preH = prevHands.get(color);
                if (preH && curH) {
                    for (const [role, n] of preH) {
                        const piece = { role, color }, curN = curH.get(role) || 0;
                        if (curN < n) {
                            const handPieceOffset = current.dom.bounds.hands.pieceBounds().get(pieceNameOf(piece)), bounds = current.dom.bounds.board.bounds();
                            if (handPieceOffset && bounds)
                                missings.push({
                                    pos: posOfOutsideEl(handPieceOffset.left, handPieceOffset.top, sentePov(current.orientation), current.dimensions, bounds),
                                    piece: piece,
                                });
                        }
                    }
                }
            }
        }
        for (const newP of news) {
            const preP = closer(newP, missings.filter(p => {
                if (samePiece(newP.piece, p.piece))
                    return true;
                // checking whether promoted pieces are the same
                const pRole = current.promotion.promotesTo(p.piece.role), pPiece = pRole && { color: p.piece.color, role: pRole };
                const nRole = current.promotion.promotesTo(newP.piece.role), nPiece = nRole && { color: newP.piece.color, role: nRole };
                return (!!pPiece && samePiece(newP.piece, pPiece)) || (!!nPiece && samePiece(nPiece, p.piece));
            }));
            if (preP) {
                const vector = [preP.pos[0] - newP.pos[0], preP.pos[1] - newP.pos[1]];
                anims.set(newP.key, vector.concat(vector));
                if (preP.key)
                    animedOrigs.push(preP.key);
                if (!samePiece(newP.piece, preP.piece) && newP.key)
                    promotions.set(newP.key, preP.piece);
            }
        }
        for (const p of missings) {
            if (p.key && !animedOrigs.includes(p.key))
                fadings.set(p.key, p.piece);
        }
        return {
            anims: anims,
            fadings: fadings,
            promotions: promotions,
        };
    }
    function step(state, now) {
        const cur = state.animation.current;
        if (cur === undefined) {
            // animation was canceled :(
            if (!state.dom.destroyed)
                redrawNow(state);
            return;
        }
        const rest = 1 - (now - cur.start) * cur.frequency;
        if (rest <= 0) {
            state.animation.current = undefined;
            redrawNow(state);
        }
        else {
            const ease = easing(rest);
            for (const cfg of cur.plan.anims.values()) {
                cfg[2] = cfg[0] * ease;
                cfg[3] = cfg[1] * ease;
            }
            redrawNow(state, true); // optimisation: don't render SVG changes during animations
            requestAnimationFrame((now = performance.now()) => step(state, now));
        }
    }
    function animate(mutation, state) {
        // clone state before mutating it
        const prevPieces = new Map(state.pieces), prevHands = new Map([
            ['sente', new Map(state.hands.handMap.get('sente'))],
            ['gote', new Map(state.hands.handMap.get('gote'))],
        ]);
        const result = mutation(state), plan = computePlan(prevPieces, prevHands, state);
        if (plan.anims.size || plan.fadings.size) {
            const alreadyRunning = state.animation.current && state.animation.current.start;
            state.animation.current = {
                start: performance.now(),
                frequency: 1 / state.animation.duration,
                plan: plan,
            };
            if (!alreadyRunning)
                step(state, performance.now());
        }
        else {
            // don't animate, just render right away
            redraw(state);
        }
        return result;
    }
    // https://gist.github.com/gre/1650294
    function easing(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    const brushes = ['primary', 'alternative0', 'alternative1', 'alternative2'];
    function start$2(state, e) {
        // support one finger touch only
        if (e.touches && e.touches.length > 1)
            return;
        e.stopPropagation();
        e.preventDefault();
        e.ctrlKey ? unselect$1(state) : cancelMoveOrDrop(state);
        const pos = eventPosition(e), bounds = state.dom.bounds.board.bounds(), orig = pos && bounds && getKeyAtDomPos(pos, sentePov(state.orientation), state.dimensions, bounds), piece = state.drawable.piece;
        if (!orig)
            return;
        state.drawable.current = {
            orig,
            dest: undefined,
            pos,
            piece,
            brush: eventBrush(e),
        };
        processDraw(state);
    }
    function startFromHand(state, piece, e) {
        // support one finger touch only
        if (e.touches && e.touches.length > 1)
            return;
        e.stopPropagation();
        e.preventDefault();
        e.ctrlKey ? unselect$1(state) : cancelMoveOrDrop(state);
        const pos = eventPosition(e);
        if (!pos)
            return;
        state.drawable.current = {
            orig: piece,
            dest: undefined,
            pos,
            brush: eventBrush(e),
        };
        processDraw(state);
    }
    function processDraw(state) {
        requestAnimationFrame(() => {
            const cur = state.drawable.current, bounds = state.dom.bounds.board.bounds();
            if (cur && bounds) {
                const dest = getKeyAtDomPos(cur.pos, sentePov(state.orientation), state.dimensions, bounds) ||
                    getHandPieceAtDomPos(cur.pos, state.hands.roles, state.dom.bounds.hands.pieceBounds());
                if (cur.dest !== dest && !(cur.dest && dest && samePieceOrKey(dest, cur.dest))) {
                    cur.dest = dest;
                    redrawNow(state);
                }
                if (!cur.dest && cur.arrow) {
                    const dest = pos2user(posOfOutsideEl(cur.pos[0], cur.pos[1], sentePov(state.orientation), state.dimensions, bounds), state.orientation, state.dimensions, state.squareRatio);
                    setAttributes(cur.arrow, { x2: dest[0] - state.squareRatio[0] / 2, y2: dest[1] - state.squareRatio[1] / 2 });
                }
                processDraw(state);
            }
        });
    }
    function move$1(state, e) {
        if (state.drawable.current)
            state.drawable.current.pos = eventPosition(e);
    }
    function end$1(state, _) {
        const cur = state.drawable.current;
        if (cur) {
            addShape(state.drawable, cur);
            cancel$1(state);
        }
    }
    function cancel$1(state) {
        if (state.drawable.current) {
            state.drawable.current = undefined;
            redraw(state);
        }
    }
    function clear(state) {
        const drawableLength = state.drawable.shapes.length;
        if (drawableLength || state.drawable.piece) {
            state.drawable.shapes = [];
            state.drawable.piece = undefined;
            redraw(state);
            if (drawableLength)
                onChange(state.drawable);
        }
    }
    function setDrawPiece(state, piece) {
        if (state.drawable.piece && samePiece(state.drawable.piece, piece))
            state.drawable.piece = undefined;
        else
            state.drawable.piece = piece;
        redraw(state);
    }
    function eventBrush(e) {
        var _a;
        const modA = (e.shiftKey || e.ctrlKey) && isRightButton(e), modB = e.altKey || e.metaKey || ((_a = e.getModifierState) === null || _a === void 0 ? void 0 : _a.call(e, 'AltGraph'));
        return brushes[(modA ? 1 : 0) + (modB ? 2 : 0)];
    }
    function addShape(drawable, cur) {
        if (!cur.dest)
            return;
        const similarShape = (s) => samePieceOrKey(cur.orig, s.orig) && samePieceOrKey(cur.dest, s.dest);
        // separate shape for pieces
        const piece = cur.piece;
        cur.piece = undefined;
        const similar = drawable.shapes.find(similarShape), removePiece = drawable.shapes.find(s => similarShape(s) && piece && s.piece && samePiece(piece, s.piece)), diffPiece = drawable.shapes.find(s => similarShape(s) && piece && s.piece && !samePiece(piece, s.piece));
        // remove every similar shape
        if (similar)
            drawable.shapes = drawable.shapes.filter(s => !similarShape(s));
        if (!isPiece(cur.orig) && piece && !removePiece) {
            drawable.shapes.push({ orig: cur.orig, dest: cur.orig, piece: piece, brush: cur.brush });
            // force circle around drawn pieces
            if (!samePieceOrKey(cur.orig, cur.dest))
                drawable.shapes.push({ orig: cur.orig, dest: cur.orig, brush: cur.brush });
        }
        if (!similar || diffPiece || similar.brush !== cur.brush)
            drawable.shapes.push(cur);
        onChange(drawable);
    }
    function onChange(drawable) {
        if (drawable.onChange)
            drawable.onChange(drawable.shapes);
    }

    function start$1(s, e) {
        var _a;
        const bounds = s.dom.bounds.board.bounds(), position = eventPosition(e), orig = bounds && position && getKeyAtDomPos(position, sentePov(s.orientation), s.dimensions, bounds);
        if (!orig)
            return;
        const piece = s.pieces.get(orig), previouslySelected = s.selected;
        if (!previouslySelected && s.drawable.enabled && (s.drawable.eraseOnClick || !piece || piece.color !== s.turnColor))
            clear(s);
        // Prevent touch scroll and create no corresponding mouse event, if there
        // is an intent to interact with the board.
        if (e.cancelable !== false &&
            (!e.touches ||
                s.blockTouchScroll ||
                s.selectedPiece ||
                piece ||
                previouslySelected ||
                pieceCloseTo(s, position, bounds)))
            e.preventDefault();
        const hadPremove = !!s.premovable.current;
        const hadPredrop = !!s.predroppable.current;
        if (s.selectable.deleteOnTouch)
            deletePiece(s, orig);
        else if (s.selected) {
            if (!promotionDialogMove(s, s.selected, orig)) {
                if (canMove(s, s.selected, orig))
                    anim(state => selectSquare(state, orig), s);
                else
                    selectSquare(s, orig);
            }
        }
        else if (s.selectedPiece) {
            if (!promotionDialogDrop(s, s.selectedPiece, orig)) {
                if (canDrop(s, s.selectedPiece, orig))
                    anim(state => selectSquare(state, orig), s);
                else
                    selectSquare(s, orig);
            }
        }
        else {
            selectSquare(s, orig);
        }
        const stillSelected = s.selected === orig, draggedEl = (_a = s.dom.elements.board) === null || _a === void 0 ? void 0 : _a.dragged;
        if (piece && draggedEl && stillSelected && isDraggable(s, piece)) {
            const touch = e.type === 'touchstart';
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
                    keyHasChanged: false,
                },
            };
            draggedEl.sgColor = piece.color;
            draggedEl.sgRole = piece.role;
            draggedEl.className = `dragging ${pieceNameOf(piece)}`;
            draggedEl.classList.toggle('touch', touch);
            processDrag(s);
        }
        else {
            if (hadPremove)
                unsetPremove(s);
            if (hadPredrop)
                unsetPredrop(s);
        }
        redraw(s);
    }
    function pieceCloseTo(s, pos, bounds) {
        const asSente = sentePov(s.orientation), radiusSq = Math.pow(bounds.width / s.dimensions.files, 2);
        for (const key of s.pieces.keys()) {
            const center = computeSquareCenter(key, asSente, s.dimensions, bounds);
            if (distanceSq(center, pos) <= radiusSq)
                return true;
        }
        return false;
    }
    function dragNewPiece(s, piece, e, spare) {
        var _a;
        const previouslySelectedPiece = s.selectedPiece, draggedEl = (_a = s.dom.elements.board) === null || _a === void 0 ? void 0 : _a.dragged, position = eventPosition(e), touch = e.type === 'touchstart';
        if (!previouslySelectedPiece && !spare && s.drawable.enabled && s.drawable.eraseOnClick)
            clear(s);
        if (!spare && s.selectable.deleteOnTouch)
            removeFromHand(s, piece);
        else
            selectPiece(s, piece, spare);
        const hadPremove = !!s.premovable.current, hadPredrop = !!s.predroppable.current, stillSelected = s.selectedPiece && samePiece(s.selectedPiece, piece);
        if (draggedEl && s.selectedPiece && stillSelected && isDraggable(s, piece)) {
            s.draggable.current = {
                piece: s.selectedPiece,
                pos: position,
                origPos: position,
                touch,
                started: s.draggable.autoDistance && !touch,
                originTarget: e.target,
                fromOutside: {
                    originBounds: !spare ? s.dom.bounds.hands.pieceBounds().get(pieceNameOf(piece)) : undefined,
                    leftOrigin: false,
                    previouslySelectedPiece: !spare ? previouslySelectedPiece : undefined,
                },
            };
            draggedEl.sgColor = piece.color;
            draggedEl.sgRole = piece.role;
            draggedEl.className = `dragging ${pieceNameOf(piece)}`;
            draggedEl.classList.toggle('touch', touch);
            processDrag(s);
        }
        else {
            if (hadPremove)
                unsetPremove(s);
            if (hadPredrop)
                unsetPredrop(s);
        }
        redraw(s);
    }
    function processDrag(s) {
        requestAnimationFrame(() => {
            var _a, _b, _c, _d;
            const cur = s.draggable.current, draggedEl = (_a = s.dom.elements.board) === null || _a === void 0 ? void 0 : _a.dragged, bounds = s.dom.bounds.board.bounds();
            if (!cur || !draggedEl || !bounds)
                return;
            // cancel animations while dragging
            if (((_b = cur.fromBoard) === null || _b === void 0 ? void 0 : _b.orig) && ((_c = s.animation.current) === null || _c === void 0 ? void 0 : _c.plan.anims.has(cur.fromBoard.orig)))
                s.animation.current = undefined;
            // if moving piece is gone, cancel
            const origPiece = cur.fromBoard ? s.pieces.get(cur.fromBoard.orig) : cur.piece;
            if (!origPiece || !samePiece(origPiece, cur.piece))
                cancel(s);
            else {
                if (!cur.started && distanceSq(cur.pos, cur.origPos) >= Math.pow(s.draggable.distance, 2)) {
                    cur.started = true;
                    redraw(s);
                }
                if (cur.started) {
                    translateAbs(draggedEl, [
                        cur.pos[0] - bounds.left - bounds.width / (s.dimensions.files * 2),
                        cur.pos[1] - bounds.top - bounds.height / (s.dimensions.ranks * 2),
                    ], s.scaleDownPieces ? 0.5 : 1);
                    if (!draggedEl.sgDragging) {
                        draggedEl.sgDragging = true;
                        setDisplay(draggedEl, true);
                    }
                    const hover = getKeyAtDomPos(cur.pos, sentePov(s.orientation), s.dimensions, bounds);
                    if (cur.fromBoard)
                        cur.fromBoard.keyHasChanged = cur.fromBoard.keyHasChanged || cur.fromBoard.orig !== hover;
                    else if (cur.fromOutside)
                        cur.fromOutside.leftOrigin =
                            cur.fromOutside.leftOrigin ||
                                (!!cur.fromOutside.originBounds && !isInsideRect(cur.fromOutside.originBounds, cur.pos));
                    // if the hovered square changed
                    if (hover !== s.hovered) {
                        updateHoveredSquares(s, hover);
                        if (cur.touch && ((_d = s.dom.elements.board) === null || _d === void 0 ? void 0 : _d.squareOver)) {
                            if (hover && s.draggable.showTouchSquareOverlay) {
                                translateAbs(s.dom.elements.board.squareOver, posToTranslateAbs(s.dimensions, bounds)(key2pos(hover), sentePov(s.orientation)), 1);
                                setDisplay(s.dom.elements.board.squareOver, true);
                            }
                            else {
                                setDisplay(s.dom.elements.board.squareOver, false);
                            }
                        }
                    }
                }
            }
            processDrag(s);
        });
    }
    function move(s, e) {
        // support one finger touch only
        if (s.draggable.current && (!e.touches || e.touches.length < 2)) {
            s.draggable.current.pos = eventPosition(e);
        }
        else if ((s.selected || s.selectedPiece || s.highlight.hovered) &&
            !s.draggable.current &&
            (!e.touches || e.touches.length < 2)) {
            const bounds = s.dom.bounds.board.bounds(), hover = bounds && getKeyAtDomPos(eventPosition(e), sentePov(s.orientation), s.dimensions, bounds);
            if (hover !== s.hovered)
                updateHoveredSquares(s, hover);
        }
    }
    function end(s, e) {
        var _a, _b, _c;
        const cur = s.draggable.current;
        if (!cur)
            return;
        // create no corresponding mouse event
        if (e.type === 'touchend' && e.cancelable !== false)
            e.preventDefault();
        // comparing with the origin target is an easy way to test that the end event
        // has the same touch origin
        if (e.type === 'touchend' && cur.originTarget !== e.target && !cur.fromOutside) {
            s.draggable.current = undefined;
            if (s.hovered && !s.highlight.hovered)
                updateHoveredSquares(s, undefined);
            return;
        }
        unsetPremove(s);
        unsetPredrop(s);
        // touchend has no position; so use the last touchmove position instead
        const eventPos = eventPosition(e) || cur.pos, bounds = s.dom.bounds.board.bounds(), dest = bounds && getKeyAtDomPos(eventPos, sentePov(s.orientation), s.dimensions, bounds);
        if (dest && cur.started && ((_a = cur.fromBoard) === null || _a === void 0 ? void 0 : _a.orig) !== dest) {
            if (cur.fromOutside && !promotionDialogDrop(s, cur.piece, dest))
                userDrop(s, cur.piece, dest);
            else if (cur.fromBoard && !promotionDialogMove(s, cur.fromBoard.orig, dest))
                userMove(s, cur.fromBoard.orig, dest);
        }
        else if (s.draggable.deleteOnDropOff && !dest) {
            if (cur.fromBoard)
                s.pieces.delete(cur.fromBoard.orig);
            else if (cur.fromOutside && !s.droppable.spare)
                removeFromHand(s, cur.piece);
            if (s.draggable.addToHandOnDropOff) {
                const handBounds = s.dom.bounds.hands.bounds(), handBoundsTop = handBounds.get('top'), handBoundsBottom = handBounds.get('bottom');
                if (handBoundsTop && isInsideRect(handBoundsTop, cur.pos))
                    addToHand(s, { color: opposite(s.orientation), role: cur.piece.role });
                else if (handBoundsBottom && isInsideRect(handBoundsBottom, cur.pos))
                    addToHand(s, { color: s.orientation, role: cur.piece.role });
            }
            callUserFunction(s.events.change);
        }
        if (cur.fromBoard &&
            (cur.fromBoard.orig === cur.fromBoard.previouslySelected || cur.fromBoard.keyHasChanged) &&
            (cur.fromBoard.orig === dest || !dest)) {
            unselect(s, cur, dest);
        }
        else if ((!dest && ((_b = cur.fromOutside) === null || _b === void 0 ? void 0 : _b.leftOrigin)) ||
            (((_c = cur.fromOutside) === null || _c === void 0 ? void 0 : _c.originBounds) &&
                isInsideRect(cur.fromOutside.originBounds, cur.pos) &&
                cur.fromOutside.previouslySelectedPiece &&
                samePiece(cur.fromOutside.previouslySelectedPiece, cur.piece))) {
            unselect(s, cur, dest);
        }
        else if (!s.selectable.enabled && !s.promotion.current) {
            unselect(s, cur, dest);
        }
        s.draggable.current = undefined;
        if (!s.highlight.hovered && !s.promotion.current)
            s.hovered = undefined;
        redraw(s);
    }
    function unselect(s, cur, dest) {
        var _a;
        if (cur.fromBoard && cur.fromBoard.orig === dest)
            callUserFunction(s.events.unselect, cur.fromBoard.orig);
        else if (((_a = cur.fromOutside) === null || _a === void 0 ? void 0 : _a.originBounds) && isInsideRect(cur.fromOutside.originBounds, cur.pos))
            callUserFunction(s.events.pieceUnselect, cur.piece);
        unselect$1(s);
    }
    function cancel(s) {
        if (s.draggable.current) {
            s.draggable.current = undefined;
            if (!s.highlight.hovered)
                s.hovered = undefined;
            unselect$1(s);
            redraw(s);
        }
    }
    // support one finger touch only or left click
    function unwantedEvent(e) {
        return !e.isTrusted || (e.button !== undefined && e.button !== 0) || (!!e.touches && e.touches.length > 1);
    }
    function validDestToHover(s, key) {
        return ((!!s.selected && (canMove(s, s.selected, key) || canPremove(s, s.selected, key))) ||
            (!!s.selectedPiece && (canDrop(s, s.selectedPiece, key) || canPredrop(s, s.selectedPiece, key))));
    }
    function updateHoveredSquares(s, key) {
        var _a;
        const sqaureEls = (_a = s.dom.elements.board) === null || _a === void 0 ? void 0 : _a.squares.children;
        if (!sqaureEls || s.promotion.current)
            return;
        const prevHover = s.hovered;
        if (s.highlight.hovered || (key && validDestToHover(s, key)))
            s.hovered = key;
        else
            s.hovered = undefined;
        const asSente = sentePov(s.orientation), curIndex = s.hovered && domSquareIndexOfKey(s.hovered, asSente, s.dimensions), curHoverEl = curIndex !== undefined && sqaureEls[curIndex];
        if (curHoverEl)
            curHoverEl.classList.add('hover');
        const prevIndex = prevHover && domSquareIndexOfKey(prevHover, asSente, s.dimensions), prevHoverEl = prevIndex !== undefined && sqaureEls[prevIndex];
        if (prevHoverEl)
            prevHoverEl.classList.remove('hover');
    }

    function wrapBoard(boardWrap, s) {
        // .sg-wrap (element passed to Shogiground)
        //     sg-hand-wrap
        //     sg-board
        //       sg-squares
        //       sg-pieces
        //       piece dragging
        //       sg-promotion
        //       sg-square-over
        //       svg.sg-shapes
        //         defs
        //         g
        //       svg.sg-custom-svgs
        //         g
        //     sg-hand-wrap
        //     sg-free-pieces
        //       coords.ranks
        //       coords.files
        const board = createEl('sg-board');
        const squares = renderSquares(s.dimensions, s.orientation);
        board.appendChild(squares);
        const pieces = createEl('sg-pieces');
        board.appendChild(pieces);
        let dragged, promotion, squareOver;
        if (!s.viewOnly) {
            dragged = createEl('piece');
            setDisplay(dragged, false);
            board.appendChild(dragged);
            promotion = createEl('sg-promotion');
            setDisplay(promotion, false);
            board.appendChild(promotion);
            squareOver = createEl('sg-square-over');
            setDisplay(squareOver, false);
            board.appendChild(squareOver);
        }
        let svg, customSvg, freePieces;
        if (s.drawable.visible) {
            svg = setAttributes(createSVGElement('svg'), {
                class: 'sg-shapes',
                viewBox: `-${s.squareRatio[0] / 2} -${s.squareRatio[1] / 2} ${s.dimensions.files * s.squareRatio[0]} ${s.dimensions.ranks * s.squareRatio[1]}`,
            });
            svg.appendChild(createSVGElement('defs'));
            svg.appendChild(createSVGElement('g'));
            customSvg = setAttributes(createSVGElement('svg'), {
                class: 'sg-custom-svgs',
                viewBox: `0 0 ${s.dimensions.files * s.squareRatio[0]} ${s.dimensions.ranks * s.squareRatio[1]}`,
            });
            customSvg.appendChild(createSVGElement('g'));
            freePieces = createEl('sg-free-pieces');
            board.appendChild(svg);
            board.appendChild(customSvg);
            board.appendChild(freePieces);
        }
        if (s.coordinates.enabled) {
            const orientClass = s.orientation === 'gote' ? ' gote' : '', ranks = coordsByNotation(s.coordinates.ranks), files = coordsByNotation(s.coordinates.files);
            board.appendChild(renderCoords(ranks, 'ranks' + orientClass, s.dimensions.ranks));
            board.appendChild(renderCoords(files, 'files' + orientClass, s.dimensions.files));
        }
        boardWrap.innerHTML = '';
        const dimCls = `d-${s.dimensions.files}x${s.dimensions.ranks}`;
        // remove all other dimension classes
        boardWrap.classList.forEach(c => {
            if (c.substring(0, 2) === 'd-' && c !== dimCls)
                boardWrap.classList.remove(c);
        });
        // ensure the sg-wrap class and dimensions class is set beforehand to avoid recomputing styles
        boardWrap.classList.add('sg-wrap', dimCls);
        for (const c of colors)
            boardWrap.classList.toggle('orientation-' + c, s.orientation === c);
        boardWrap.classList.toggle('manipulable', !s.viewOnly);
        boardWrap.appendChild(board);
        let hands;
        if (s.hands.inlined) {
            const handWrapTop = createEl('sg-hand-wrap'), handWrapBottom = createEl('sg-hand-wrap');
            boardWrap.insertBefore(handWrapBottom, board.nextElementSibling);
            boardWrap.insertBefore(handWrapTop, board);
            hands = {
                top: handWrapTop,
                bottom: handWrapBottom,
            };
        }
        return {
            board,
            squares,
            pieces,
            promotion,
            squareOver,
            dragged,
            svg,
            customSvg,
            freePieces,
            hands,
        };
    }
    function wrapHand(handWrap, pos, s) {
        const hand = renderHand(pos === 'top' ? opposite(s.orientation) : s.orientation, s.hands.roles);
        handWrap.innerHTML = '';
        const roleCntCls = `r-${s.hands.roles.length}`;
        // remove all other role count classes
        handWrap.classList.forEach(c => {
            if (c.substring(0, 2) === 'r-' && c !== roleCntCls)
                handWrap.classList.remove(c);
        });
        // ensure the sg-hand-wrap class, hand pos class and role number class is set beforehand to avoid recomputing styles
        handWrap.classList.add('sg-hand-wrap', `hand-${pos}`, roleCntCls);
        handWrap.appendChild(hand);
        for (const c of colors)
            handWrap.classList.toggle('orientation-' + c, s.orientation === c);
        handWrap.classList.toggle('manipulable', !s.viewOnly);
        return hand;
    }
    function coordsByNotation(notation) {
        switch (notation) {
            case 1 /* Notation.JAPANESE */:
                return [
                    '十六',
                    '十五',
                    '十四',
                    '十三',
                    '十二',
                    '十一',
                    '十',
                    '九',
                    '八',
                    '七',
                    '六',
                    '五',
                    '四',
                    '三',
                    '二',
                    '一',
                ];
            case 2 /* Notation.ENGINE */:
                return ['p', 'o', 'n', 'm', 'l', 'k', 'j', 'i', 'h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
            case 3 /* Notation.HEX */:
                return ['10', 'f', 'e', 'd', 'c', 'b', 'a', '9', '8', '7', '6', '5', '4', '3', '2', '1'];
            default:
                return ['16', '15', '14', '13', '12', '11', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1'];
        }
    }
    function renderCoords(elems, className, trim) {
        const el = createEl('coords', className);
        let f;
        for (const elem of elems.slice(-trim)) {
            f = createEl('coord');
            f.textContent = elem;
            el.appendChild(f);
        }
        return el;
    }
    function renderSquares(dims, orientation) {
        const squares = createEl('sg-squares');
        for (let i = 0; i < dims.ranks * dims.files; i++) {
            const sq = createEl('sq');
            sq.sgKey =
                orientation === 'sente'
                    ? pos2key([dims.files - 1 - (i % dims.files), Math.floor(i / dims.files)])
                    : pos2key([i % dims.files, dims.files - 1 - Math.floor(i / dims.files)]);
            squares.appendChild(sq);
        }
        return squares;
    }
    function renderHand(color, roles) {
        const hand = createEl('sg-hand');
        for (const role of roles) {
            const piece = { role: role, color: color }, wrapEl = createEl('sg-hp-wrap'), pieceEl = createEl('piece', pieceNameOf(piece));
            pieceEl.sgColor = color;
            pieceEl.sgRole = role;
            wrapEl.appendChild(pieceEl);
            hand.appendChild(wrapEl);
        }
        return hand;
    }

    function clearBounds(s) {
        s.dom.bounds.board.bounds.clear();
        s.dom.bounds.hands.bounds.clear();
        s.dom.bounds.hands.pieceBounds.clear();
    }
    function onResize(s) {
        return () => {
            clearBounds(s);
            if (usesBounds(s.drawable.shapes.concat(s.drawable.autoShapes)))
                redrawShapes(s);
        };
    }
    function bindBoard(s, boardEls) {
        if ('ResizeObserver' in window)
            new ResizeObserver(onResize(s)).observe(boardEls.board);
        if (s.viewOnly)
            return;
        const piecesEl = boardEls.pieces, promotionEl = boardEls.promotion;
        // Cannot be passive, because we prevent touch scrolling and dragging of selected elements.
        const onStart = startDragOrDraw(s);
        piecesEl.addEventListener('touchstart', onStart, {
            passive: false,
        });
        piecesEl.addEventListener('mousedown', onStart, {
            passive: false,
        });
        if (s.disableContextMenu || s.drawable.enabled)
            piecesEl.addEventListener('contextmenu', e => e.preventDefault());
        if (promotionEl) {
            const pieceSelection = (e) => promote(s, e);
            promotionEl.addEventListener('click', pieceSelection);
            if (s.disableContextMenu)
                promotionEl.addEventListener('contextmenu', e => e.preventDefault());
        }
    }
    function bindHand(s, handEl) {
        if ('ResizeObserver' in window)
            new ResizeObserver(onResize(s)).observe(handEl);
        if (s.viewOnly)
            return;
        const onStart = startDragFromHand(s);
        handEl.addEventListener('mousedown', onStart, { passive: false });
        handEl.addEventListener('touchstart', onStart, {
            passive: false,
        });
        handEl.addEventListener('click', () => {
            if (s.promotion.current) {
                cancelPromotion(s);
                redraw(s);
            }
        });
        if (s.disableContextMenu || s.drawable.enabled)
            handEl.addEventListener('contextmenu', e => e.preventDefault());
    }
    // returns the unbind function
    function bindDocument(s) {
        const unbinds = [];
        // Old versions of Edge and Safari do not support ResizeObserver. Send
        // shogiground.resize if a user action has changed the bounds of the board.
        if (!('ResizeObserver' in window)) {
            unbinds.push(unbindable(document.body, 'shogiground.resize', onResize(s)));
        }
        if (!s.viewOnly) {
            const onmove = dragOrDraw(s, move, move$1), onend = dragOrDraw(s, end, end$1);
            for (const ev of ['touchmove', 'mousemove'])
                unbinds.push(unbindable(document, ev, onmove));
            for (const ev of ['touchend', 'mouseup'])
                unbinds.push(unbindable(document, ev, onend));
            unbinds.push(unbindable(document, 'scroll', () => clearBounds(s), { capture: true, passive: true }));
            unbinds.push(unbindable(window, 'resize', () => clearBounds(s), { passive: true }));
        }
        return () => unbinds.forEach(f => f());
    }
    function unbindable(el, eventName, callback, options) {
        el.addEventListener(eventName, callback, options);
        return () => el.removeEventListener(eventName, callback, options);
    }
    function startDragOrDraw(s) {
        return e => {
            if (s.draggable.current)
                cancel(s);
            else if (s.drawable.current)
                cancel$1(s);
            else if (e.shiftKey || isRightButton(e)) {
                if (s.drawable.enabled)
                    start$2(s, e);
            }
            else if (!s.viewOnly && !unwantedEvent(e))
                start$1(s, e);
        };
    }
    function dragOrDraw(s, withDrag, withDraw) {
        return e => {
            if (s.drawable.current) {
                if (s.drawable.enabled)
                    withDraw(s, e);
            }
            else if (!s.viewOnly)
                withDrag(s, e);
        };
    }
    function startDragFromHand(s) {
        return e => {
            if (s.promotion.current)
                return;
            const pos = eventPosition(e), piece = pos && getHandPieceAtDomPos(pos, s.hands.roles, s.dom.bounds.hands.pieceBounds());
            if (piece) {
                if (s.draggable.current)
                    cancel(s);
                else if (s.drawable.current)
                    cancel$1(s);
                else if (isMiddleButton(e)) {
                    if (s.drawable.enabled) {
                        if (e.cancelable !== false)
                            e.preventDefault();
                        setDrawPiece(s, piece);
                    }
                }
                else if (e.shiftKey || isRightButton(e)) {
                    if (s.drawable.enabled)
                        startFromHand(s, piece, e);
                }
                else if (!s.viewOnly && !unwantedEvent(e)) {
                    if (e.cancelable !== false)
                        e.preventDefault();
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
            if (cur.dragged || (s.turnColor !== s.activeColor && s.activeColor !== 'both')) {
                if (s.selected)
                    userMove(s, s.selected, cur.key, prom);
                else if (s.selectedPiece)
                    userDrop(s, s.selectedPiece, cur.key, prom);
            }
            else
                anim(s => selectSquare(s, cur.key, prom), s);
            callUserFunction(s.promotion.events.after, piece);
        }
        else
            anim(s => cancelPromotion(s), s);
        s.promotion.current = undefined;
        redraw(s);
    }

    function attachBoard(state, boardWrap) {
        const elements = wrapBoard(boardWrap, state);
        // in case of inlined hands
        if (elements.hands)
            attachHands(state, elements.hands.top, elements.hands.bottom);
        state.dom.wrapElements.board = boardWrap;
        state.dom.elements.board = elements;
        state.dom.bounds.board.bounds.clear();
        bindBoard(state, elements);
        state.drawable.prevSvgHash = '';
        state.promotion.prevPromotionHash = '';
        render$1(state, elements);
    }
    function attachHands(state, handTopWrap, handBottomWrap) {
        if (!state.dom.elements.hands)
            state.dom.elements.hands = {};
        if (!state.dom.wrapElements.hands)
            state.dom.wrapElements.hands = {};
        if (handTopWrap) {
            const handTop = wrapHand(handTopWrap, 'top', state);
            state.dom.wrapElements.hands.top = handTopWrap;
            state.dom.elements.hands.top = handTop;
            bindHand(state, handTop);
            renderHand$1(state, handTop);
        }
        if (handBottomWrap) {
            const handBottom = wrapHand(handBottomWrap, 'bottom', state);
            state.dom.wrapElements.hands.bottom = handBottomWrap;
            state.dom.elements.hands.bottom = handBottom;
            bindHand(state, handBottom);
            renderHand$1(state, handBottom);
        }
        if (handTopWrap || handBottomWrap) {
            state.dom.bounds.hands.bounds.clear();
            state.dom.bounds.hands.pieceBounds.clear();
        }
    }
    function redrawAll(wrapElements, state) {
        var _a, _b, _c, _d;
        if (wrapElements.board)
            attachBoard(state, wrapElements.board);
        if (wrapElements.hands && !state.hands.inlined)
            attachHands(state, wrapElements.hands.top, wrapElements.hands.bottom);
        // shapes might depend both on board and hands - redraw only after both are done
        redrawShapes(state);
        state.events.insert &&
            state.events.insert(wrapElements.board && state.dom.elements.board, {
                top: ((_a = wrapElements.hands) === null || _a === void 0 ? void 0 : _a.top) && ((_b = state.dom.elements.hands) === null || _b === void 0 ? void 0 : _b.top),
                bottom: ((_c = wrapElements.hands) === null || _c === void 0 ? void 0 : _c.bottom) && ((_d = state.dom.elements.hands) === null || _d === void 0 ? void 0 : _d.bottom),
            });
    }
    function detachElements(web, state) {
        var _a, _b, _c, _d;
        if (web.board) {
            state.dom.wrapElements.board = undefined;
            state.dom.elements.board = undefined;
            state.dom.bounds.board.bounds.clear();
        }
        if (state.dom.elements.hands && state.dom.wrapElements.hands) {
            if ((_a = web.hands) === null || _a === void 0 ? void 0 : _a.top) {
                state.dom.wrapElements.hands.top = undefined;
                state.dom.elements.hands.top = undefined;
            }
            if ((_b = web.hands) === null || _b === void 0 ? void 0 : _b.bottom) {
                state.dom.wrapElements.hands.bottom = undefined;
                state.dom.elements.hands.bottom = undefined;
            }
            if (((_c = web.hands) === null || _c === void 0 ? void 0 : _c.top) || ((_d = web.hands) === null || _d === void 0 ? void 0 : _d.bottom)) {
                state.dom.bounds.hands.bounds.clear();
                state.dom.bounds.hands.pieceBounds.clear();
            }
        }
    }

    // see API types and documentations in api.d.ts
    function start(state) {
        return {
            attach(wrapElements) {
                redrawAll(wrapElements, state);
            },
            detach(wrapElementsBoolean) {
                detachElements(wrapElementsBoolean, state);
            },
            set(config, skipAnimation) {
                var _a, _b, _c;
                function getByPath(path, obj) {
                    const properties = path.split('.');
                    return properties.reduce((prev, curr) => prev && prev[curr], obj);
                }
                const forceRedrawProps = [
                    'orientation',
                    'viewOnly',
                    'coordinates.enabled',
                    'coordinates.notation',
                    'drawable.visible',
                    'hands.inlined',
                ];
                const newDims = ((_a = config.sfen) === null || _a === void 0 ? void 0 : _a.board) && inferDimensions(config.sfen.board);
                const toRedraw = forceRedrawProps.some(p => {
                    const cRes = getByPath(p, config);
                    return cRes && cRes !== getByPath(p, state);
                }) ||
                    !!(newDims && (newDims.files !== state.dimensions.files || newDims.ranks !== state.dimensions.ranks)) ||
                    !!(((_b = config.hands) === null || _b === void 0 ? void 0 : _b.roles) && config.hands.roles.every((r, i) => r === state.hands.roles[i]));
                if (toRedraw) {
                    reset(state);
                    configure(state, config);
                    redrawAll(state.dom.wrapElements, state);
                }
                else {
                    applyAnimation(state, config);
                    (((_c = config.sfen) === null || _c === void 0 ? void 0 : _c.board) && !skipAnimation ? anim : render)(state => configure(state, config), state);
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
                anim(state => baseMove(state, orig, dest, prom || state.promotion.forceMovePromotion(orig, dest)), state);
            },
            drop(piece, key, prom, spare) {
                anim(state => {
                    state.droppable.spare = !!spare;
                    baseDrop(state, piece, key, prom || state.promotion.forceDropPromotion(piece, key));
                }, state);
            },
            setPieces(pieces) {
                anim(state => setPieces(state, pieces), state);
            },
            addToHand(piece, count) {
                render(state => addToHand(state, piece, count), state);
            },
            removeFromHand(piece, count) {
                render(state => removeFromHand(state, piece, count), state);
            },
            selectSquare(key, prom, force) {
                if (key)
                    anim(state => selectSquare(state, key, prom, force), state);
                else if (state.selected) {
                    unselect$1(state);
                    redraw(state);
                }
            },
            selectPiece(piece, spare, force) {
                if (piece)
                    render(state => selectPiece(state, piece, spare, force), state);
                else if (state.selectedPiece) {
                    unselect$1(state);
                    redraw(state);
                }
            },
            playPremove() {
                if (state.premovable.current) {
                    if (anim(playPremove, state))
                        return true;
                    // if the premove couldn't be played, redraw to clear it up
                    redraw(state);
                }
                return false;
            },
            playPredrop() {
                if (state.predroppable.current) {
                    if (anim(playPredrop, state))
                        return true;
                    // if the predrop couldn't be played, redraw to clear it up
                    redraw(state);
                }
                return false;
            },
            cancelPremove() {
                render(unsetPremove, state);
            },
            cancelPredrop() {
                render(unsetPredrop, state);
            },
            cancelMove() {
                render(state => {
                    cancelMoveOrDrop(state);
                    cancel(state);
                }, state);
            },
            stop() {
                render(state => {
                    stop(state);
                }, state);
            },
            setAutoShapes(shapes) {
                render(state => (state.drawable.autoShapes = shapes), state);
            },
            setShapes(shapes) {
                render(state => (state.drawable.shapes = shapes), state);
            },
            setSquareHighlights(squares) {
                render(state => (state.drawable.squares = squares), state);
            },
            dragNewPiece(piece, event, spare) {
                dragNewPiece(state, piece, event, spare);
            },
            destroy() {
                stop(state);
                state.dom.unbind();
                state.dom.destroyed = true;
            },
        };
    }

    function defaults() {
        return {
            pieces: new Map(),
            dimensions: { files: 9, ranks: 9 },
            orientation: 'sente',
            turnColor: 'sente',
            activeColor: 'both',
            viewOnly: false,
            squareRatio: [11, 12],
            disableContextMenu: true,
            blockTouchScroll: false,
            scaleDownPieces: true,
            coordinates: {
                enabled: true,
                files: 0 /* sg.Notation.NUMERIC */,
                ranks: 0 /* sg.Notation.NUMERIC */,
            },
            highlight: {
                lastDests: true,
                check: true,
                checkRoles: ['king'],
                hovered: false,
            },
            animation: {
                enabled: true,
                hands: true,
                duration: 250,
            },
            hands: {
                inlined: false,
                handMap: new Map([
                    ['sente', new Map()],
                    ['gote', new Map()],
                ]),
                roles: ['rook', 'bishop', 'gold', 'silver', 'knight', 'lance', 'pawn'],
            },
            movable: {
                free: true,
                showDests: true,
                events: {},
            },
            droppable: {
                free: true,
                showDests: true,
                spare: false,
                events: {},
            },
            premovable: {
                enabled: true,
                showDests: true,
                events: {},
            },
            predroppable: {
                enabled: true,
                showDests: true,
                events: {},
            },
            draggable: {
                enabled: true,
                distance: 3,
                autoDistance: true,
                showGhost: true,
                showTouchSquareOverlay: true,
                deleteOnDropOff: false,
                addToHandOnDropOff: false,
            },
            selectable: {
                enabled: true,
                deleteOnTouch: false,
            },
            promotion: {
                movePromotionDialog: () => false,
                forceMovePromotion: () => false,
                dropPromotionDialog: () => false,
                forceDropPromotion: () => false,
                promotesTo: () => undefined,
                events: {},
                prevPromotionHash: '',
            },
            forsyth: {},
            events: {},
            drawable: {
                enabled: true,
                visible: true,
                eraseOnClick: true,
                shapes: [],
                autoShapes: [],
                squares: [],
                prevSvgHash: '',
            },
        };
    }

    function Shogiground(config, wrapElements) {
        const state = defaults();
        configure(state, config || {});
        state.dom = {
            wrapElements: wrapElements || {},
            elements: {},
            bounds: {
                board: {
                    bounds: memo(() => { var _a; return (_a = state.dom.elements.board) === null || _a === void 0 ? void 0 : _a.pieces.getBoundingClientRect(); }),
                },
                hands: {
                    bounds: memo(() => {
                        const handsRects = new Map(), handEls = state.dom.elements.hands;
                        if (handEls === null || handEls === void 0 ? void 0 : handEls.top)
                            handsRects.set('top', handEls.top.getBoundingClientRect());
                        if (handEls === null || handEls === void 0 ? void 0 : handEls.bottom)
                            handsRects.set('bottom', handEls.bottom.getBoundingClientRect());
                        return handsRects;
                    }),
                    pieceBounds: memo(() => {
                        const handPiecesRects = new Map(), handEls = state.dom.elements.hands;
                        if (handEls === null || handEls === void 0 ? void 0 : handEls.top) {
                            let wrapEl = handEls.top.firstElementChild;
                            while (wrapEl) {
                                const pieceEl = wrapEl.firstElementChild, piece = { role: pieceEl.sgRole, color: pieceEl.sgColor };
                                handPiecesRects.set(pieceNameOf(piece), pieceEl.getBoundingClientRect());
                                wrapEl = wrapEl.nextElementSibling;
                            }
                        }
                        if (handEls === null || handEls === void 0 ? void 0 : handEls.bottom) {
                            let wrapEl = handEls.bottom.firstElementChild;
                            while (wrapEl) {
                                const pieceEl = wrapEl.firstElementChild, piece = { role: pieceEl.sgRole, color: pieceEl.sgColor };
                                handPiecesRects.set(pieceNameOf(piece), pieceEl.getBoundingClientRect());
                                wrapEl = wrapEl.nextElementSibling;
                            }
                        }
                        return handPiecesRects;
                    }),
                },
            },
            unbind: bindDocument(state),
            destroyed: false,
        };
        if (wrapElements)
            redrawAll(wrapElements, state);
        return start(state);
    }

    return Shogiground;

})();
