var Shogiground = (function () {
    'use strict';

    function isPieceNode(el) {
        return el.tagName === 'PIECE';
    }
    function isSquareNode(el) {
        return el.tagName === 'SQ';
    }
    const colors = ['sente', 'gote'];
    const files = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    const ranks = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];

    // 1a, 2a, 3a ...
    const allKeys = Array.prototype.concat(...ranks.map(r => files.map(f => f + r)));
    const pos2key = (pos) => allKeys[pos[0] + 12 * pos[1]];
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
    const opposite = (c) => (c === 'sente' ? 'gote' : 'sente');
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
    const translateRel = (el, percents, scale) => {
        el.style.transform = `translate(${percents[0] * scale}%,${percents[1] * scale}%) scale(${scale})`;
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

    function diff(a, b) {
        return Math.abs(a - b);
    }
    function pawn(color) {
        return (x1, y1, x2, y2) => (color === 'sente' ? x1 === x2 && y1 - 1 === y2 : x1 === x2 && y1 + 1 === y2);
    }
    function knight(color) {
        return (x1, y1, x2, y2) => diff(x1, x2) === 1 && diff(y1, y2) === 2 && (color === 'sente' ? y2 < y1 : y2 > y1);
    }
    const bishop = (x1, y1, x2, y2) => {
        return diff(x1, x2) === diff(y1, y2);
    };
    const rook = (x1, y1, x2, y2) => {
        return x1 === x2 || y1 === y2;
    };
    const king = (x1, y1, x2, y2) => {
        return diff(x1, x2) < 2 && diff(y1, y2) < 2;
    };
    function lance(color) {
        return (x1, y1, x2, y2) => (color === 'sente' ? x1 === x2 && y2 < y1 : x1 === x2 && y1 < y2);
    }
    function silver(color) {
        return (x1, y1, x2, y2) => diff(x1, x2) < 2 &&
            diff(y1, y2) < 2 &&
            y1 !== y2 &&
            (color === 'sente' ? x1 !== x2 || y2 < y1 : x1 !== x2 || y2 > y1);
    }
    function gold(color) {
        return (x1, y1, x2, y2) => diff(x1, x2) < 2 && diff(y1, y2) < 2 && (color === 'sente' ? y2 <= y1 || x1 === x2 : y2 >= y1 || x1 === x2);
    }
    const horse = (x1, y1, x2, y2) => {
        return king(x1, y1, x2, y2) || bishop(x1, y1, x2, y2);
    };
    const dragon = (x1, y1, x2, y2) => {
        return king(x1, y1, x2, y2) || rook(x1, y1, x2, y2);
    };
    const allPos = allKeys.map(key2pos);
    function premove(pieces, key, dims) {
        const piece = pieces.get(key);
        if (!piece)
            return [];
        const pos = key2pos(key), r = piece.role, mobility = r === 'pawn'
            ? pawn(piece.color)
            : r === 'knight'
                ? knight(piece.color)
                : r === 'bishop'
                    ? bishop
                    : r === 'rook'
                        ? rook
                        : r === 'king'
                            ? king
                            : r === 'silver'
                                ? silver(piece.color)
                                : r === 'lance'
                                    ? lance(piece.color)
                                    : r === 'horse'
                                        ? horse
                                        : r === 'dragon'
                                            ? dragon
                                            : gold(piece.color);
        return allPos
            .filter(pos2 => (pos[0] !== pos2[0] || pos[1] !== pos2[1]) &&
            mobility(pos[0], pos[1], pos2[0], pos2[1]) &&
            pos2[0] < dims.files &&
            pos2[1] < dims.ranks)
            .map(pos2key);
    }

    function lastRow(dims, pos, color) {
        return color === 'sente' ? pos[1] === 0 : pos[1] === dims.ranks - 1;
    }
    function lastTwoRows(dims, pos, color) {
        return lastRow(dims, pos, color) || (color === 'sente' ? pos[1] === 1 : pos[1] === dims.ranks - 2);
    }
    function predrop(pieces, dropPiece, dims) {
        const color = dropPiece.color;
        const role = dropPiece.role;
        return allKeys.filter(key => {
            const p = pieces.get(key);
            const pos = key2pos(key);
            return ((!p || p.color !== color) &&
                pos[0] < dims.files &&
                pos[1] < dims.ranks &&
                (role === 'pawn' || role === 'lance'
                    ? !lastRow(dims, pos, color)
                    : role === 'knight'
                        ? !lastTwoRows(dims, pos, color)
                        : true));
        });
    }

    function callUserFunction(f, ...args) {
        if (f)
            setTimeout(() => f(...args), 1);
    }
    function toggleOrientation(state) {
        state.orientation = opposite(state.orientation);
        state.animation.current = state.draggable.current = state.selected = state.selectedPiece = undefined;
    }
    function reset(state) {
        state.lastDests = undefined;
        state.animation.current = state.draggable.current = undefined;
        unselect(state);
        unsetPremove(state);
        unsetPredrop(state);
    }
    function setPieces(state, pieces) {
        for (const [key, piece] of pieces) {
            if (piece)
                state.pieces.set(key, piece);
            else
                state.pieces.delete(key);
        }
    }
    function setCheck(state, color) {
        state.check = undefined;
        if (color === true)
            color = state.turnColor;
        if (color)
            for (const [k, p] of state.pieces) {
                if (p.role === 'king' && p.color === color) {
                    state.check = k;
                }
            }
    }
    function setPremove(state, orig, dest) {
        unsetPredrop(state);
        state.premovable.current = [orig, dest];
        callUserFunction(state.premovable.events.set, orig, dest);
    }
    function unsetPremove(state) {
        if (state.premovable.current) {
            state.premovable.current = undefined;
            callUserFunction(state.premovable.events.unset);
        }
    }
    function setPredrop(state, piece, key) {
        unsetPremove(state);
        state.predroppable.current = { piece, key };
        callUserFunction(state.predroppable.events.set, piece, key);
    }
    function unsetPredrop(state) {
        if (state.predroppable.current) {
            state.predroppable.current = undefined;
            callUserFunction(state.predroppable.events.unset);
        }
    }
    function baseMove(state, orig, dest) {
        const origPiece = state.pieces.get(orig), destPiece = state.pieces.get(dest);
        if (orig === dest || !origPiece)
            return false;
        const captured = destPiece && destPiece.color !== origPiece.color ? destPiece : undefined;
        if (dest === state.selected)
            unselect(state);
        callUserFunction(state.events.move, orig, dest, captured);
        state.pieces.set(dest, origPiece);
        state.pieces.delete(orig);
        state.lastDests = [orig, dest];
        state.check = undefined;
        callUserFunction(state.events.change);
        return captured || true;
    }
    function baseDrop(state, piece, key) {
        if (state.pieces.has(key) && !state.droppable.free)
            return false;
        callUserFunction(state.events.drop, piece, key);
        state.pieces.set(key, piece);
        state.lastDests = [key];
        if (!state.droppable.spare)
            removeFromHand(state, piece);
        state.check = undefined;
        callUserFunction(state.events.change);
        return true;
    }
    function baseUserMove(state, orig, dest) {
        const result = baseMove(state, orig, dest);
        if (result) {
            state.movable.dests = undefined;
            state.droppable.dests = undefined;
            state.turnColor = opposite(state.turnColor);
            state.animation.current = undefined;
        }
        return result;
    }
    function baseUserDrop(state, piece, key) {
        const result = baseDrop(state, piece, key);
        if (result) {
            state.movable.dests = undefined;
            state.droppable.dests = undefined;
            state.turnColor = opposite(state.turnColor);
            state.animation.current = undefined;
        }
        return result;
    }
    function userDrop(state, piece, dest) {
        if (canDrop(state, piece, dest)) {
            const result = baseUserDrop(state, piece, dest);
            if (result) {
                unselect(state);
                callUserFunction(state.droppable.events.after, piece, dest, {
                    premade: false,
                });
                return true;
            }
        }
        else if (canPredrop(state, piece, dest)) {
            setPredrop(state, piece, dest);
            unselect(state);
            return true;
        }
        unselect(state);
        return false;
    }
    function userMove(state, orig, dest) {
        if (canMove(state, orig, dest)) {
            const result = baseUserMove(state, orig, dest);
            if (result) {
                unselect(state);
                const metadata = {
                    premade: false,
                };
                if (result !== true)
                    metadata.captured = result;
                callUserFunction(state.movable.events.after, orig, dest, metadata);
                return true;
            }
        }
        else if (canPremove(state, orig, dest)) {
            setPremove(state, orig, dest);
            unselect(state);
            return true;
        }
        unselect(state);
        return false;
    }
    function addToHand(state, piece, cnt = 1) {
        const hand = state.hands.handMap.get(piece.color);
        if (hand && state.hands.roles.includes(piece.role))
            hand.set(piece.role, (hand.get(piece.role) || 0) + cnt);
    }
    function removeFromHand(state, piece, cnt = 1) {
        const hand = state.hands.handMap.get(piece.color);
        const num = hand === null || hand === void 0 ? void 0 : hand.get(piece.role);
        if (hand && num)
            hand.set(piece.role, Math.max(num - cnt, 0));
    }
    function selectSquare(state, key, force) {
        callUserFunction(state.events.select, key);
        if ((state.selectable.enabled || force) && state.selectedPiece) {
            if (userDrop(state, state.selectedPiece, key))
                return;
        }
        else if (state.selected) {
            if (state.selected === key && !state.draggable.enabled) {
                unselect(state);
                return;
            }
            else if ((state.selectable.enabled || force) && state.selected !== key) {
                if (userMove(state, state.selected, key)) {
                    return;
                }
            }
        }
        if (isMovable(state, key) || isPremovable(state, key)) {
            setSelected(state, key);
        }
    }
    function selectPiece(state, piece, spare) {
        callUserFunction(state.events.pieceSelect, piece);
        state.droppable.spare = !!spare;
        if (!state.draggable.enabled && state.selectedPiece && samePiece(state.selectedPiece, piece))
            unselect(state);
        else if (isDroppable(state, piece) || isPredroppable(state, piece)) {
            setSelectedPiece(state, piece);
        }
    }
    function setSelected(state, key) {
        unselect(state);
        state.selected = key;
        if (isPremovable(state, key)) {
            state.premovable.dests = premove(state.pieces, key, state.dimensions);
        }
    }
    function setSelectedPiece(state, piece) {
        unselect(state);
        state.selectedPiece = piece;
        if (isPredroppable(state, piece)) {
            state.predroppable.dests = predrop(state.pieces, piece, state.dimensions);
        }
    }
    function unselect(state) {
        state.selected = state.selectedPiece = state.premovable.dests = state.predroppable.dests = undefined;
    }
    function isMovable(state, orig) {
        const piece = state.pieces.get(orig);
        return (!!piece && (state.activeColor === 'both' || (state.activeColor === piece.color && state.turnColor === piece.color)));
    }
    function isDroppable(state, piece) {
        return state.activeColor === 'both' || (state.activeColor === piece.color && state.turnColor === piece.color);
    }
    function canMove(state, orig, dest) {
        var _a, _b;
        return (orig !== dest && isMovable(state, orig) && (state.movable.free || !!((_b = (_a = state.movable.dests) === null || _a === void 0 ? void 0 : _a.get(orig)) === null || _b === void 0 ? void 0 : _b.includes(dest))));
    }
    function canDrop(state, piece, dest) {
        var _a, _b;
        return (isDroppable(state, piece) && (state.droppable.free || !!((_b = (_a = state.droppable.dests) === null || _a === void 0 ? void 0 : _a.get(piece.role)) === null || _b === void 0 ? void 0 : _b.includes(dest))));
    }
    function isPremovable(state, orig) {
        const piece = state.pieces.get(orig);
        return !!piece && state.premovable.enabled && state.activeColor === piece.color && state.turnColor !== piece.color;
    }
    function isPredroppable(state, piece) {
        return state.predroppable.enabled && state.activeColor === piece.color && state.turnColor !== piece.color;
    }
    function canPremove(state, orig, dest) {
        return orig !== dest && isPremovable(state, orig) && premove(state.pieces, orig, state.dimensions).includes(dest);
    }
    function canPredrop(state, piece, dest) {
        const destPiece = state.pieces.get(dest);
        return (isPredroppable(state, piece) &&
            (!destPiece || destPiece.color !== state.activeColor) &&
            predrop(state.pieces, piece, state.dimensions).includes(dest));
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
        const orig = move[0], dest = move[1];
        let success = false;
        if (canMove(state, orig, dest)) {
            const result = baseUserMove(state, orig, dest);
            if (result) {
                const metadata = { premade: true };
                if (result !== true)
                    metadata.captured = result;
                callUserFunction(state.movable.events.after, orig, dest, metadata);
                success = true;
            }
        }
        unsetPremove(state);
        return success;
    }
    function playPredrop(state) {
        const drop = state.predroppable.current;
        let success = false;
        if (!drop)
            return false;
        if (canDrop(state, drop.piece, drop.key)) {
            if (baseUserDrop(state, drop.piece, drop.key)) {
                callUserFunction(state.droppable.events.after, drop.piece, drop.key, {
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
        unselect(state);
    }
    function stop(state) {
        state.activeColor =
            state.movable.dests =
                state.droppable.dests =
                    state.draggable.current =
                        state.animation.current =
                            undefined;
        cancelMoveOrDrop(state);
    }
    function sentePov(s) {
        return s.orientation === 'sente';
    }

    function stringToRole(ch) {
        switch (ch) {
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
    const letters = {
        pawn: 'p',
        lance: 'l',
        knight: 'n',
        silver: 's',
        gold: 'g',
        bishop: 'b',
        rook: 'r',
        king: 'k',
        tokin: '+p',
        promotedlance: '+l',
        promotedknight: '+n',
        promotedsilver: '+s',
        horse: '+b',
        dragon: '+r',
    };
    function inferDimensions(boardSfen) {
        const ranks = boardSfen.split('/');
        const firstFile = ranks[0].split('');
        let filesCnt = 0;
        let cnt = 0;
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
    function readBoard(sfen, dims) {
        const pieces = new Map();
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
                        const roleStr = (sfen[i] === '+' && sfen.length > i + 1 ? '+' + sfen[++i] : sfen[i]).toLowerCase();
                        const role = stringToRole(roleStr);
                        if (x >= 0 && role) {
                            const color = sfen[i] === roleStr || '+' + sfen[i] === roleStr ? 'gote' : 'sente';
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
    function writeBoard(pieces, dims) {
        const reversedFiles = files.slice(dims.files).reverse();
        return ranks
            .slice(dims.ranks)
            .map(y => reversedFiles
            .map(x => {
            const piece = pieces.get((x + y));
            if (piece) {
                const letter = letters[piece.role];
                return piece.color === 'sente' ? letter.toUpperCase() : letter;
            }
            else
                return '1';
        })
            .join(''))
            .join('/')
            .replace(/1{2,}/g, s => s.length.toString());
    }
    function readHands(str) {
        const sente = new Map();
        const gote = new Map();
        let tmpNum = 0;
        let num = 1;
        for (let i = 0; i < str.length; i++) {
            const nb = str[i].charCodeAt(0);
            if (nb < 58 && nb > 47) {
                tmpNum = tmpNum * 10 + nb - 48;
                num = tmpNum;
            }
            else {
                const roleStr = (str[i] === '+' && str.length > i + 1 ? '+' + str[++i] : str[i]).toLowerCase();
                const role = stringToRole(roleStr);
                if (role) {
                    const color = str[i] === roleStr || '+' + str[i] === roleStr ? 'gote' : 'sente';
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
    function writeHands(hands, roles) {
        var _a, _b;
        let senteHandStr = '';
        let goteHandStr = '';
        for (const role of roles) {
            const senteCnt = (_a = hands.get('sente')) === null || _a === void 0 ? void 0 : _a.get(role);
            const goteCnt = (_b = hands.get('gote')) === null || _b === void 0 ? void 0 : _b.get(role);
            if (senteCnt)
                senteHandStr += senteCnt > 1 ? senteCnt.toString() + letters[role] : letters[role];
            if (goteCnt)
                goteHandStr += goteCnt > 1 ? goteCnt.toString() + letters[role] : letters[role];
        }
        if (senteHandStr || goteHandStr)
            return senteHandStr.toUpperCase() + goteHandStr;
        return '-';
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
        var _a, _b, _c, _d, _e;
        // don't merge destinations and autoShapes. Just override.
        if ((_a = config.movable) === null || _a === void 0 ? void 0 : _a.dests)
            state.movable.dests = undefined;
        if ((_b = config.droppable) === null || _b === void 0 ? void 0 : _b.dests)
            state.droppable.dests = undefined;
        if ((_c = config.drawable) === null || _c === void 0 ? void 0 : _c.autoShapes)
            state.drawable.autoShapes = [];
        deepMerge(state, config);
        // if a sfen was provided, replace the pieces, except the currently dragged one
        if ((_d = config.sfen) === null || _d === void 0 ? void 0 : _d.board) {
            state.dimensions = inferDimensions(config.sfen.board);
            state.pieces = readBoard(config.sfen.board, state.dimensions);
            state.drawable.shapes = [];
        }
        if ((_e = config.sfen) === null || _e === void 0 ? void 0 : _e.hands) {
            state.hands.handMap = readHands(config.sfen.hands);
        }
        // apply config values that could be undefined yet meaningful
        if ('check' in config)
            setCheck(state, config.check || false);
        if ('lastDests' in config && !config.lastDests)
            state.lastDests = undefined;
        // in case of drop last move, there's a single square.
        // if the previous last move had two squares,
        // the merge algorithm will incorrectly keep the second square.
        else if (config.lastDests)
            state.lastDests = config.lastDests;
        // fix move/premove dests
        if (state.selected)
            setSelected(state, state.selected);
        if (state.selectedPiece)
            setSelectedPiece(state, state.selectedPiece);
        applyAnimation(state, config);
    }
    function deepMerge(base, extend) {
        for (const key in extend) {
            if (isObject(base[key]) && isObject(extend[key]))
                deepMerge(base[key], extend[key]);
            else
                base[key] = extend[key];
        }
    }
    function isObject(o) {
        return typeof o === 'object';
    }

    function anim(mutation, state) {
        return state.animation.enabled ? animate(mutation, state) : render$1(mutation, state);
    }
    function render$1(mutation, state) {
        const result = mutation(state);
        state.dom.redraw();
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
        const anims = new Map(), animedOrigs = [], fadings = new Map(), missings = [], news = [], prePieces = new Map();
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
                    for (const [role, n] of curH) {
                        const piece = { role, color }, preN = preH.get(role);
                        if (preN && preN > n) {
                            const handPieceOffset = current.dom.hands.pieceBounds().get(pieceNameOf(piece));
                            if (handPieceOffset)
                                missings.push({
                                    pos: posOfOutsideEl(handPieceOffset.left, handPieceOffset.top, sentePov(current), current.dimensions, current.dom.board.bounds()),
                                    piece: piece,
                                });
                        }
                    }
                }
            }
        }
        for (const newP of news) {
            const preP = closer(newP, missings.filter(p => samePiece(newP.piece, p.piece)));
            if (preP) {
                const vector = [preP.pos[0] - newP.pos[0], preP.pos[1] - newP.pos[1]];
                anims.set(newP.key, vector.concat(vector));
                if (preP.key)
                    animedOrigs.push(preP.key);
            }
        }
        for (const p of missings) {
            if (p.key && !animedOrigs.includes(p.key))
                fadings.set(p.key, p.piece);
        }
        return {
            anims: anims,
            fadings: fadings,
        };
    }
    function step(state, now) {
        const cur = state.animation.current;
        if (cur === undefined) {
            // animation was canceled :(
            if (!state.dom.destroyed)
                state.dom.redrawNow();
            return;
        }
        const rest = 1 - (now - cur.start) * cur.frequency;
        if (rest <= 0) {
            state.animation.current = undefined;
            state.dom.redrawNow();
        }
        else {
            const ease = easing(rest);
            for (const cfg of cur.plan.anims.values()) {
                cfg[2] = cfg[0] * ease;
                cfg[3] = cfg[1] * ease;
            }
            state.dom.redrawNow(true); // optimisation: don't render SVG changes during animations
            requestAnimationFrame((now = performance.now()) => step(state, now));
        }
    }
    function animate(mutation, state) {
        // clone state before mutating it
        const prevPieces = new Map(state.pieces), prevHands = new Map([
            ['sente', new Map(state.hands.handMap.get('sente') || new Map())],
            ['gote', new Map(state.hands.handMap.get('gote') || new Map())],
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
            state.dom.redraw();
        }
        return result;
    }
    // https://gist.github.com/gre/1650294
    function easing(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    function createSVGElement(tagName) {
        return document.createElementNS('http://www.w3.org/2000/svg', tagName);
    }
    const outsideArrowHash = 'outsideArrow';
    function renderShapes(state, svg, customSvg, freePieces) {
        const d = state.drawable, curD = d.current, cur = (curD === null || curD === void 0 ? void 0 : curD.dest) ? curD : undefined, outsideArrow = !!curD && !cur, arrowDests = new Map(), pieceMap = new Map();
        const hashBounds = () => {
            // todo also possible piece bounds
            const bounds = state.dom.board.bounds();
            return bounds.width.toString() + bounds.height;
        };
        for (const s of d.shapes.concat(d.autoShapes).concat(cur ? [cur] : [])) {
            const destName = isPiece(s.dest) ? pieceNameOf(s.dest) : s.dest;
            if (destName && !samePieceOrKey(s.dest, s.orig))
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
        const defsEl = svg.querySelector('defs');
        const shapesEl = svg.querySelector('g');
        const customSvgsEl = customSvg.querySelector('g');
        syncDefs(shapes, outsideArrow ? curD : undefined, defsEl);
        syncShapes(shapes.filter(s => !s.shape.customSvg && (!s.shape.piece || s.current)), shapesEl, shape => renderSVGShape(state, shape, arrowDests), outsideArrow);
        syncShapes(shapes.filter(s => s.shape.customSvg), customSvgsEl, shape => renderSVGShape(state, shape, arrowDests));
        syncShapes(pieceShapes, freePieces, shape => renderPiece(state, shape));
        if (!outsideArrow && curD)
            curD.arrow = undefined;
        if (outsideArrow && !curD.arrow) {
            const orig = pieceOrKeyToPos(curD.orig, state);
            if (orig) {
                const el = renderArrow(curD.brush, orig, orig, state.squareRatio, true, false, true);
                el.setAttribute('sgHash', outsideArrowHash);
                curD.arrow = el;
                shapesEl.appendChild(el);
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
            if (!keysInDom.has(key))
                defsEl.appendChild(renderMarker(key));
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
    function shapeHash({ orig, dest, brush, piece, customSvg }, arrowDests, current, boundHash) {
        return [
            current,
            (isPiece(orig) || isPiece(dest)) && boundHash(),
            isPiece(orig) ? pieceHash(orig) : orig,
            isPiece(dest) ? pieceHash(dest) : dest,
            brush,
            (arrowDests.get(isPiece(dest) ? pieceNameOf(dest) : dest) || 0) > 1,
            piece && pieceHash(piece),
            customSvg && customSvgHash(customSvg),
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
        let el;
        if (shape.customSvg) {
            el = renderCustomSvg(shape.customSvg, orig);
        }
        else {
            const dest = !samePieceOrKey(shape.orig, shape.dest) && pieceOrKeyToPos(shape.dest, state);
            if (dest) {
                el = renderArrow(shape.brush, orig, dest, state.squareRatio, !!current, (arrowDests.get((isPiece(shape.dest) ? pieceNameOf(shape.dest) : shape.dest)) || 0) > 1, false);
            }
            else if (samePieceOrKey(shape.dest, shape.orig)) {
                let ratio = state.squareRatio;
                if (isPiece(shape.orig)) {
                    const pieceBounds = state.dom.hands.pieceBounds().get(pieceNameOf(shape.orig)), bounds = state.dom.board.bounds();
                    if (pieceBounds) {
                        const heightBase = pieceBounds.height / (bounds.height / state.dimensions.files);
                        // we want to keep the ratio that is on the board
                        ratio = [heightBase * state.squareRatio[0], heightBase * state.squareRatio[1]];
                    }
                }
                el = renderEllipse(shape.brush, orig, ratio, !!current);
            }
        }
        if (el) {
            el.setAttribute('sgHash', hash);
            return el;
        }
        return;
    }
    function renderCustomSvg(customSvg, pos) {
        const [x, y] = pos;
        // Translate to top-left of `orig` square
        const g = setAttributes(createSVGElement('g'), { transform: `translate(${x},${y})` });
        // Give 100x100 coordinate system to the user for `orig` square
        const svg = setAttributes(createSVGElement('svg'), { width: 1, height: 1, viewBox: '0 0 100 100' });
        g.appendChild(svg);
        svg.innerHTML = customSvg;
        return g;
    }
    function renderEllipse(brush, pos, ratio, current) {
        const o = pos, widths = ellipseWidth(ratio);
        return setAttributes(createSVGElement('ellipse'), {
            class: brush,
            'stroke-width': widths[current ? 0 : 1],
            fill: 'none',
            cx: o[0],
            cy: o[1],
            rx: ratio[0] / 2 - widths[1] / 2,
            ry: ratio[1] / 2 - widths[1] / 2,
        });
    }
    function renderArrow(brush, orig, dest, ratio, current, shorten, outside) {
        const m = arrowMargin(shorten && !current, ratio), a = orig, b = dest, dx = b[0] - a[0], dy = b[1] - a[1], angle = Math.atan2(dy, dx), xo = Math.cos(angle) * m, yo = Math.sin(angle) * m;
        return setAttributes(createSVGElement('line'), {
            class: shapeClass(brush, current, outside),
            'stroke-width': lineWidth(current, ratio),
            'stroke-linecap': 'round',
            'marker-end': 'url(#arrowhead-' + brush + ')',
            x1: a[0],
            y1: a[1],
            x2: b[0] - xo,
            y2: b[1] - yo,
        });
    }
    function renderPiece(state, { shape, hash }) {
        if (!shape.piece || isPiece(shape.orig))
            return;
        const orig = shape.orig, scale = (shape.piece.scale || 1) * (state.scaleDownPieces ? 0.5 : 1);
        const pieceEl = createEl('piece', pieceNameOf(shape.piece));
        pieceEl.setAttribute('sgHash', hash);
        pieceEl.sgKey = orig;
        pieceEl.sgScale = scale;
        translateRel(pieceEl, posToTranslateRel(state.dimensions)(key2pos(orig), sentePov(state)), scale);
        return pieceEl;
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
        for (const key in attrs)
            el.setAttribute(key, attrs[key]);
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
            const pieceBounds = state.dom.hands.pieceBounds().get(pieceNameOf(kp)), offset = sentePov(state) ? [0.5, -0.5] : [-0.5, 0.5], pos = pieceBounds &&
                posOfOutsideEl(pieceBounds.left + pieceBounds.width / 2, pieceBounds.top + pieceBounds.height / 2, sentePov(state), state.dimensions, state.dom.board.bounds());
            return (pos && pos2user([pos[0] + offset[0], pos[1] + offset[1]], state.orientation, state.dimensions, state.squareRatio));
        }
        else
            return pos2user(key2pos(kp), state.orientation, state.dimensions, state.squareRatio);
    }

    const brushes = ['primary', 'alternative0', 'alternative1', 'alternative2'];
    function start$2(state, e) {
        // support one finger touch only
        if (e.touches && e.touches.length > 1)
            return;
        e.stopPropagation();
        e.preventDefault();
        e.ctrlKey ? unselect(state) : cancelMoveOrDrop(state);
        const pos = eventPosition(e), orig = pos && getKeyAtDomPos(pos, sentePov(state), state.dimensions, state.dom.board.bounds()), piece = state.drawable.piece;
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
        e.ctrlKey ? unselect(state) : cancelMoveOrDrop(state);
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
            const cur = state.drawable.current;
            if (cur) {
                const bounds = state.dom.board.bounds(), dest = getKeyAtDomPos(cur.pos, sentePov(state), state.dimensions, bounds) ||
                    getHandPieceAtDomPos(cur.pos, state.hands.roles, state.dom.hands.pieceBounds());
                if (cur.dest !== dest && !(cur.dest && dest && samePieceOrKey(dest, cur.dest))) {
                    cur.dest = dest;
                    state.dom.redrawNow();
                }
                if (!cur.dest && cur.arrow) {
                    const dest = pos2user(posOfOutsideEl(cur.pos[0], cur.pos[1], sentePov(state), state.dimensions, bounds), state.orientation, state.dimensions, state.squareRatio);
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
            state.dom.redraw();
        }
    }
    function clear(state) {
        const drawableLength = state.drawable.shapes.length;
        if (drawableLength || state.drawable.piece) {
            state.drawable.shapes = [];
            state.drawable.piece = undefined;
            state.dom.redraw();
            if (drawableLength)
                onChange(state.drawable);
        }
    }
    function eventBrush(e) {
        var _a;
        const modA = (e.shiftKey || e.ctrlKey) && isRightButton(e);
        const modB = e.altKey || e.metaKey || ((_a = e.getModifierState) === null || _a === void 0 ? void 0 : _a.call(e, 'AltGraph'));
        return brushes[(modA ? 1 : 0) + (modB ? 2 : 0)];
    }
    function addShape(drawable, cur) {
        if (!cur.dest)
            return;
        const similarShape = (s) => samePieceOrKey(cur.orig, s.orig) && samePieceOrKey(cur.dest, s.dest);
        // separate shape for pieces
        const piece = cur.piece;
        cur.piece = undefined;
        const similar = drawable.shapes.find(similarShape);
        const removePiece = drawable.shapes.find(s => similarShape(s) && piece && s.piece && samePiece(piece, s.piece));
        const diffPiece = drawable.shapes.find(s => similarShape(s) && piece && s.piece && !samePiece(piece, s.piece));
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
        const bounds = s.dom.board.bounds(), position = eventPosition(e), orig = position && getKeyAtDomPos(position, sentePov(s), s.dimensions, bounds);
        if (!orig)
            return;
        const piece = s.pieces.get(orig), previouslySelected = s.selected;
        if (!previouslySelected && s.drawable.enabled && (s.drawable.eraseOnClick || !piece || piece.color !== s.turnColor))
            clear(s);
        // Prevent touch scroll and create no corresponding mouse event, if there
        // is an intent to interact with the board.
        if (e.cancelable !== false &&
            (!e.touches || s.blockTouchScroll || s.selectedPiece || piece || previouslySelected || pieceCloseTo(s, position)))
            e.preventDefault();
        const hadPremove = !!s.premovable.current;
        const hadPredrop = !!s.predroppable.current;
        if (s.selectable.deleteOnTouch)
            s.pieces.delete(orig);
        else if ((s.selectedPiece && canDrop(s, s.selectedPiece, orig)) ||
            (s.selected && canMove(s, s.selected, orig))) {
            anim(state => selectSquare(state, orig), s);
        }
        else {
            selectSquare(s, orig);
        }
        const stillSelected = s.selected === orig, draggedEl = s.dom.board.elements.dragged;
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
        s.dom.redraw();
    }
    function pieceCloseTo(s, pos) {
        const asSente = sentePov(s), bounds = s.dom.board.bounds(), radiusSq = Math.pow(bounds.width / s.dimensions.files, 2);
        for (const key of s.pieces.keys()) {
            const center = computeSquareCenter(key, asSente, s.dimensions, bounds);
            if (distanceSq(center, pos) <= radiusSq)
                return true;
        }
        return false;
    }
    function dragNewPiece(s, piece, e, spare) {
        const previouslySelectedPiece = s.selectedPiece, draggedEl = s.dom.board.elements.dragged, position = eventPosition(e), touch = e.type === 'touchstart';
        if (!draggedEl)
            return;
        if (!previouslySelectedPiece && !spare && s.drawable.enabled && s.drawable.eraseOnClick)
            clear(s);
        selectPiece(s, piece, spare);
        const hadPremove = !!s.premovable.current;
        const hadPredrop = !!s.predroppable.current;
        if (isDraggable(s, piece)) {
            s.draggable.current = {
                piece,
                pos: position,
                origPos: position,
                touch,
                started: s.draggable.autoDistance && !touch,
                originTarget: e.target,
                fromOutside: {
                    originBounds: !spare ? s.dom.hands.pieceBounds().get(pieceNameOf(piece)) : undefined,
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
        s.dom.redraw();
    }
    function processDrag(s) {
        requestAnimationFrame(() => {
            var _a, _b;
            const cur = s.draggable.current, draggedEl = s.dom.board.elements.dragged;
            if (!cur || !draggedEl)
                return;
            // cancel animations while dragging
            if (((_a = cur.fromBoard) === null || _a === void 0 ? void 0 : _a.orig) && ((_b = s.animation.current) === null || _b === void 0 ? void 0 : _b.plan.anims.has(cur.fromBoard.orig)))
                s.animation.current = undefined;
            // if moving piece is gone, cancel
            const origPiece = cur.fromBoard ? s.pieces.get(cur.fromBoard.orig) : cur.piece;
            if (!origPiece || !samePiece(origPiece, cur.piece))
                cancel(s);
            else {
                if (!cur.started && distanceSq(cur.pos, cur.origPos) >= Math.pow(s.draggable.distance, 2)) {
                    cur.started = true;
                    s.dom.redraw();
                }
                if (cur.started) {
                    const bounds = s.dom.board.bounds();
                    translateAbs(draggedEl, [
                        cur.pos[0] - bounds.left - bounds.width / (s.dimensions.files * 2),
                        cur.pos[1] - bounds.top - bounds.height / (s.dimensions.ranks * 2),
                    ], s.scaleDownPieces ? 0.5 : 1);
                    if (!draggedEl.sgDragging) {
                        draggedEl.sgDragging = true;
                        setDisplay(draggedEl, true);
                    }
                    const hover = getKeyAtDomPos(cur.pos, sentePov(s), s.dimensions, bounds);
                    if (cur.fromBoard)
                        cur.fromBoard.keyHasChanged = cur.fromBoard.keyHasChanged || cur.fromBoard.orig !== hover;
                    else if (cur.fromOutside)
                        cur.fromOutside.leftOrigin =
                            cur.fromOutside.leftOrigin ||
                                (!!cur.fromOutside.originBounds && !isInsideRect(cur.fromOutside.originBounds, cur.pos));
                    // if the hovered square changed
                    if (hover !== cur.hovering) {
                        const prevHover = cur.hovering;
                        cur.hovering = hover;
                        updateHovers(s, prevHover);
                        if (cur.touch && s.dom.board.elements.squareOver) {
                            if (hover && s.draggable.showTouchSquareOverlay) {
                                translateAbs(s.dom.board.elements.squareOver, posToTranslateAbs(s.dimensions, bounds)(key2pos(hover), sentePov(s)), 1);
                                setDisplay(s.dom.board.elements.squareOver, true);
                            }
                            else {
                                setDisplay(s.dom.board.elements.squareOver, false);
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
            return;
        }
        unsetPremove(s);
        unsetPredrop(s);
        // touchend has no position; so use the last touchmove position instead
        const eventPos = eventPosition(e) || cur.pos;
        const dest = getKeyAtDomPos(eventPos, sentePov(s), s.dimensions, s.dom.board.bounds());
        if (dest && cur.started && ((_a = cur.fromBoard) === null || _a === void 0 ? void 0 : _a.orig) !== dest) {
            if (cur.fromOutside)
                userDrop(s, cur.piece, dest);
            else if (cur.fromBoard)
                userMove(s, cur.fromBoard.orig, dest);
        }
        else if (s.draggable.deleteOnDropOff && !dest) {
            if (cur.fromBoard)
                s.pieces.delete(cur.fromBoard.orig);
            else if (cur.fromOutside)
                removeFromHand(s, cur.piece);
            if (s.draggable.addToHandOnDropOff) {
                const handBounds = s.dom.hands.bounds(), handBoundsTop = handBounds.get('top'), handBoundsBottom = handBounds.get('bottom');
                if (handBoundsTop && isInsideRect(handBoundsTop, cur.pos))
                    addToHand(s, { color: opposite(s.orientation), role: cur.piece.role });
                else if (handBoundsBottom && isInsideRect(handBoundsBottom, cur.pos))
                    addToHand(s, { color: s.orientation, role: cur.piece.role });
            }
            callUserFunction(s.events.change);
        }
        if (cur.fromBoard &&
            (cur.fromBoard.orig === cur.fromBoard.previouslySelected || cur.fromBoard.keyHasChanged) &&
            (cur.fromBoard.orig === dest || !dest))
            unselect(s);
        else if (((_b = cur.fromOutside) === null || _b === void 0 ? void 0 : _b.leftOrigin) ||
            (((_c = cur.fromOutside) === null || _c === void 0 ? void 0 : _c.originBounds) &&
                isInsideRect(cur.fromOutside.originBounds, cur.pos) &&
                cur.fromOutside.previouslySelectedPiece &&
                samePiece(cur.fromOutside.previouslySelectedPiece, cur.piece)))
            unselect(s);
        else if (!s.selectable.enabled)
            unselect(s);
        s.draggable.current = undefined;
        s.dom.redraw();
    }
    function cancel(s) {
        if (s.draggable.current) {
            s.draggable.current = undefined;
            unselect(s);
            s.dom.redraw();
        }
    }
    // support one finger touch only or left click
    function unwantedEvent(e) {
        return !e.isTrusted || (e.button !== undefined && e.button !== 0) || (!!e.touches && e.touches.length > 1);
    }
    function updateHovers(s, prevHover) {
        var _a;
        const asSente = sentePov(s), sqaureEls = s.dom.board.elements.squares.children;
        const curIndex = ((_a = s.draggable.current) === null || _a === void 0 ? void 0 : _a.hovering) && domSquareIndexOfKey(s.draggable.current.hovering, asSente, s.dimensions), curHoverEl = curIndex && sqaureEls[curIndex];
        if (curHoverEl)
            curHoverEl.classList.add('hover');
        const prevIndex = prevHover && domSquareIndexOfKey(prevHover, asSente, s.dimensions), prevHoverEl = prevIndex && sqaureEls[prevIndex];
        if (prevHoverEl)
            prevHoverEl.classList.remove('hover');
    }

    function setPromotion(s, key, pieces) {
        s.promotion.active = true;
        s.promotion.key = key;
        s.promotion.pieces = pieces;
    }
    function unsetPromotion(s) {
        s.promotion.active = false;
        s.promotion.key = undefined;
        s.promotion.pieces = undefined;
    }
    function renderPromotions(s) {
        const promotionEl = s.dom.board.elements.promotion;
        if (!s.promotion.active || !s.promotion.key || !s.promotion.pieces || !promotionEl)
            return;
        const asSente = sentePov(s), initPos = key2pos(s.promotion.key);
        const promotionSquare = createEl('sg-promotion-square'), promotionChoices = createEl('sg-promotion-choices');
        translateRel(promotionSquare, posToTranslateRel(s.dimensions)(initPos, asSente), 1);
        s.promotion.pieces.forEach(p => {
            const pieceNode = createEl('piece', pieceNameOf(p));
            pieceNode.sgColor = p.color;
            pieceNode.sgRole = p.role;
            promotionChoices.appendChild(pieceNode);
        });
        promotionEl.innerHTML = '';
        promotionSquare.appendChild(promotionChoices);
        promotionEl.appendChild(promotionSquare);
        setDisplay(promotionEl, s.promotion.active);
    }
    function promote(s, e) {
        e.preventDefault();
        const key = s.promotion.key, target = e.target;
        if (s.promotion.active && key && target && isPieceNode(target)) {
            const piece = { color: target.sgColor, role: target.sgRole };
            s.pieces.set(key, piece);
            callUserFunction(s.promotion.after, piece);
        }
        else
            callUserFunction(s.promotion.cancel);
        unsetPromotion(s);
        setDisplay(s.dom.board.elements.promotion, false);
        s.dom.redraw();
    }
    function cancelPromotion(s) {
        if (!s.promotion.active)
            return;
        callUserFunction(s.promotion.cancel);
        unsetPromotion(s);
        if (s.dom.board.elements.promotion)
            setDisplay(s.dom.board.elements.promotion, false);
        s.dom.redraw();
    }

    // see API types and documentations in api.d.ts
    function start(state, redrawAll) {
        function toggleOrientation$1() {
            toggleOrientation(state);
            redrawAll();
        }
        return {
            set(config) {
                var _a, _b;
                let toRedraw = false;
                if (config.orientation && config.orientation !== state.orientation) {
                    toggleOrientation(state);
                    toRedraw = true;
                }
                if (config.viewOnly !== undefined && config.viewOnly !== state.viewOnly) {
                    state.viewOnly = config.viewOnly;
                    reset(state);
                    toRedraw = true;
                }
                if (config.viewOnly !== undefined && config.viewOnly !== state.viewOnly) {
                    state.viewOnly = config.viewOnly;
                    reset(state);
                    toRedraw = true;
                }
                if (((_a = config.hands) === null || _a === void 0 ? void 0 : _a.roles) !== undefined && config.hands.roles !== state.hands.roles) {
                    state.hands.roles = config.hands.roles;
                    toRedraw = true;
                }
                if (toRedraw)
                    redrawAll();
                applyAnimation(state, config);
                (((_b = config.sfen) === null || _b === void 0 ? void 0 : _b.board) ? anim : render$1)(state => configure(state, config), state);
            },
            state,
            getBoardSfen: () => writeBoard(state.pieces, state.dimensions),
            getHandsSfen: () => writeHands(state.hands.handMap, state.hands.roles),
            toggleOrientation: toggleOrientation$1,
            move(orig, dest) {
                anim(state => baseMove(state, orig, dest), state);
            },
            drop(piece, key, spare) {
                anim(state => {
                    state.droppable.spare = !!spare;
                    baseDrop(state, piece, key);
                }, state);
            },
            setPieces(pieces) {
                anim(state => setPieces(state, pieces), state);
            },
            addToHand(piece, count) {
                render$1(state => addToHand(state, piece, count), state);
            },
            removeFromHand(piece, count) {
                render$1(state => removeFromHand(state, piece, count), state);
            },
            startPromotion(key, pieces) {
                render$1(state => setPromotion(state, key, pieces), state);
            },
            stopPromotion() {
                render$1(state => unsetPromotion(state), state);
            },
            selectSquare(key, force) {
                if (key)
                    anim(state => selectSquare(state, key, force), state);
                else if (state.selected) {
                    unselect(state);
                    state.dom.redraw();
                }
            },
            selectPiece(piece, spare) {
                if (piece)
                    render$1(state => selectPiece(state, piece, spare), state);
                else if (state.selectedPiece) {
                    unselect(state);
                    state.dom.redraw();
                }
            },
            playPremove() {
                if (state.premovable.current) {
                    if (anim(playPremove, state))
                        return true;
                    // if the premove couldn't be played, redraw to clear it up
                    state.dom.redraw();
                }
                return false;
            },
            playPredrop() {
                if (state.predroppable.current) {
                    const result = playPredrop(state);
                    state.dom.redraw();
                    return result;
                }
                return false;
            },
            cancelPremove() {
                render$1(unsetPremove, state);
            },
            cancelPredrop() {
                render$1(unsetPredrop, state);
            },
            cancelMove() {
                render$1(state => {
                    cancelMoveOrDrop(state);
                    cancel(state);
                }, state);
            },
            stop() {
                render$1(state => {
                    stop(state);
                    cancel(state);
                }, state);
            },
            setAutoShapes(shapes) {
                render$1(state => (state.drawable.autoShapes = shapes), state);
            },
            setShapes(shapes) {
                render$1(state => (state.drawable.shapes = shapes), state);
            },
            redrawAll,
            dragNewPiece(piece, event, spare) {
                dragNewPiece(state, piece, event, spare);
            },
            destroy() {
                stop(state);
                state.dom.unbind && state.dom.unbind();
                state.dom.destroyed = true;
            },
        };
    }

    function defaults() {
        return {
            pieces: readBoard('lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL', { files: 9, ranks: 9 }),
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
                notation: 0 /* WESTERN */,
            },
            highlight: {
                lastDests: true,
                check: true,
            },
            animation: {
                enabled: true,
                hands: true,
                duration: 250,
            },
            hands: {
                inlined: false,
                handMap: new Map(),
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
                active: false,
            },
            events: {},
            drawable: {
                enabled: true,
                visible: true,
                eraseOnClick: true,
                shapes: [],
                autoShapes: [],
                prevSvgHash: '',
            },
        };
    }

    function wrapBoard(wrapElements, s) {
        // .sg-wrap (element passed to Shogiground)
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
        //     sg-free-pieces
        //       coords.ranks
        //       coords.files
        var _a;
        const board = createEl('sg-board');
        const squares = renderSquares(s.dimensions, s.orientation);
        board.appendChild(squares);
        const pieces = createEl('sg-pieces');
        board.appendChild(pieces);
        let dragged, promotion, squareOver;
        if (!s.viewOnly) {
            dragged = createEl('piece');
            setDisplay(dragged, !!s.draggable.current);
            board.appendChild(dragged);
            promotion = createEl('sg-promotion');
            setDisplay(promotion, s.promotion.active);
            board.appendChild(promotion);
            squareOver = createEl('sg-square-over');
            setDisplay(squareOver, !!((_a = s.draggable.current) === null || _a === void 0 ? void 0 : _a.touch));
            board.appendChild(squareOver);
        }
        let svg;
        let customSvg;
        let freePieces;
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
            const orientClass = s.orientation === 'gote' ? ' gote' : '';
            const ranks = ranksByNotation(s.coordinates.notation);
            board.appendChild(renderCoords(ranks, 'ranks' + orientClass, s.dimensions.ranks));
            board.appendChild(renderCoords(['12', '11', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1'], 'files' + orientClass, s.dimensions.files));
        }
        wrapElements.board.innerHTML = '';
        // ensure the sg-wrap class and dimensions class i set beforehand to avoid recomputing style
        wrapElements.board.classList.add('sg-wrap', `d-${s.dimensions.files}x${s.dimensions.ranks}`);
        for (const c of colors)
            wrapElements.board.classList.toggle('orientation-' + c, s.orientation === c);
        wrapElements.board.classList.toggle('manipulable', !s.viewOnly);
        wrapElements.board.appendChild(board);
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
        };
    }
    function wrapHands(wrapElements, s) {
        let handTop, handBottom;
        if (s.hands.inlined || wrapElements.handTop || wrapElements.handBottom) {
            handTop = renderHand(opposite(s.orientation), s.hands.roles);
            handBottom = renderHand(s.orientation, s.hands.roles);
            if (s.hands.inlined && wrapElements.board.firstElementChild) {
                wrapElements.board.insertBefore(handTop, wrapElements.board.firstElementChild);
                wrapElements.board.insertBefore(handBottom, wrapElements.board.firstElementChild.nextElementSibling);
            }
            else {
                if (wrapElements.handTop) {
                    wrapElements.handTop.innerHTML = '';
                    wrapElements.handTop.classList.add('hand-top');
                    wrapElements.handTop.appendChild(handTop);
                }
                if (wrapElements.handBottom) {
                    wrapElements.handBottom.innerHTML = '';
                    wrapElements.handBottom.classList.add('hand-bottom');
                    wrapElements.handBottom.appendChild(handBottom);
                }
            }
        }
        return {
            top: handTop,
            bottom: handBottom,
        };
    }
    function ranksByNotation(notation) {
        switch (notation) {
            case 2 /* JAPANESE */:
                return ['十二', '十一', '十', '九', '八', '七', '六', '五', '四', '三', '二', '一'];
            case 3 /* WESTERN2 */:
                return ['l', 'k', 'j', 'i', 'h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
            default:
                return ['12', '11', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1'];
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
            const piece = { role: role, color: color }, pieceEl = createEl('piece', pieceNameOf(piece));
            pieceEl.sgColor = color;
            pieceEl.sgRole = role;
            hand.appendChild(pieceEl);
        }
        return hand;
    }

    function bindBoard(s, onResize) {
        if ('ResizeObserver' in window)
            new ResizeObserver(onResize).observe(s.dom.board.elements.board);
        if (s.viewOnly)
            return;
        const piecesEl = s.dom.board.elements.pieces;
        const promotionEl = s.dom.board.elements.promotion;
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
            promotionEl.addEventListener('click', pieceSelection, {
                passive: false,
            });
            if (s.disableContextMenu)
                promotionEl.addEventListener('contextmenu', e => e.preventDefault());
        }
    }
    function bindHands(s, onResize) {
        if (s.dom.hands.elements.top)
            bindHand(s, s.dom.hands.elements.top, onResize);
        if (s.dom.hands.elements.bottom)
            bindHand(s, s.dom.hands.elements.bottom, onResize);
    }
    function bindHand(s, handEl, onResize) {
        if ('ResizeObserver' in window)
            new ResizeObserver(onResize).observe(handEl);
        if (s.viewOnly)
            return;
        const onStart = startDragFromHand(s);
        handEl.addEventListener('mousedown', onStart, { passive: false });
        handEl.addEventListener('touchstart', onStart, {
            passive: false,
        });
        if (s.dom.board.elements.promotion)
            handEl.addEventListener('click', () => cancelPromotion(s));
        if (s.disableContextMenu || s.drawable.enabled)
            handEl.addEventListener('contextmenu', e => e.preventDefault());
    }
    // returns the unbind function
    function bindDocument(s, onResize) {
        const unbinds = [];
        // Old versions of Edge and Safari do not support ResizeObserver. Send
        // shogiground.resize if a user action has changed the bounds of the board.
        if (!('ResizeObserver' in window)) {
            unbinds.push(unbindable(document.body, 'shogiground.resize', onResize));
        }
        if (!s.viewOnly) {
            const onmove = dragOrDraw(s, move, move$1);
            const onend = dragOrDraw(s, end, end$1);
            for (const ev of ['touchmove', 'mousemove'])
                unbinds.push(unbindable(document, ev, onmove));
            for (const ev of ['touchend', 'mouseup'])
                unbinds.push(unbindable(document, ev, onend));
            const onScroll = () => {
                s.dom.board.bounds.clear();
                s.dom.hands.bounds.clear();
                s.dom.hands.pieceBounds.clear();
            };
            unbinds.push(unbindable(document, 'scroll', onScroll, { capture: true, passive: true }));
            unbinds.push(unbindable(window, 'resize', onScroll, { passive: true }));
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
            var _a;
            if (s.promotion.active)
                return;
            const pos = eventPosition(e), piece = pos && getHandPieceAtDomPos(pos, s.hands.roles, s.dom.hands.pieceBounds());
            if (piece) {
                if (s.drawable.enabled && isMiddleButton(e)) {
                    if (s.drawable.piece && samePiece(s.drawable.piece, piece))
                        s.drawable.piece = undefined;
                    else
                        s.drawable.piece = piece;
                    s.dom.redraw();
                }
                else if (s.drawable.enabled && (e.shiftKey || isRightButton(e))) {
                    startFromHand(s, piece, e);
                }
                else if (!s.viewOnly && !unwantedEvent(e)) {
                    if (s.selectable.deleteOnTouch) {
                        removeFromHand(s, piece);
                        s.dom.redraw();
                    }
                    else if ((s.activeColor === 'both' || s.activeColor === piece.color) &&
                        ((_a = s.hands.handMap.get(piece.color)) === null || _a === void 0 ? void 0 : _a.get(piece.role))) {
                        if (e.cancelable !== false)
                            e.preventDefault();
                        dragNewPiece(s, piece, e);
                    }
                }
            }
        };
    }

    function render(s) {
        var _a, _b;
        const asSente = sentePov(s), scaleDown = s.scaleDownPieces ? 0.5 : 1, posToTranslate = posToTranslateRel(s.dimensions), squaresEl = s.dom.board.elements.squares, piecesEl = s.dom.board.elements.pieces, draggedEl = s.dom.board.elements.dragged, squareOverEl = s.dom.board.elements.squareOver, handTopEl = s.dom.hands.elements.top, handBotEl = s.dom.hands.elements.bottom, pieces = s.pieces, curAnim = s.animation.current, anims = curAnim ? curAnim.plan.anims : new Map(), fadings = curAnim ? curAnim.plan.fadings : new Map(), curDrag = s.draggable.current, squares = computeSquareClasses(s), samePieces = new Set(), movedPieces = new Map();
        // if piece not being dragged anymore, hide it
        if (!curDrag && (draggedEl === null || draggedEl === void 0 ? void 0 : draggedEl.sgDragging)) {
            draggedEl.sgDragging = false;
            setDisplay(draggedEl, false);
            if (squareOverEl)
                setDisplay(squareOverEl, false);
        }
        let k, el, pieceAtKey, elPieceName, anim, fading, pMvdset, pMvd;
        // walk over all board dom elements, apply animations and flag moved pieces
        el = piecesEl.firstElementChild;
        while (el) {
            if (isPieceNode(el)) {
                k = el.sgKey;
                pieceAtKey = pieces.get(k);
                anim = anims.get(k);
                fading = fadings.get(k);
                elPieceName = pieceNameOf({ color: el.sgColor, role: el.sgRole });
                // if piece dragged add or remove ghost class
                if ((curDrag === null || curDrag === void 0 ? void 0 : curDrag.started) && ((_a = curDrag.fromBoard) === null || _a === void 0 ? void 0 : _a.orig) === k) {
                    el.classList.add('ghost');
                    el.sgGhost = true;
                }
                else if (el.sgGhost && (!curDrag || ((_b = curDrag.fromBoard) === null || _b === void 0 ? void 0 : _b.orig) !== k)) {
                    el.classList.remove('ghost');
                    el.sgDragging = false;
                }
                // remove fading class if it still remains
                if (!fading && el.sgFading) {
                    el.sgFading = false;
                    el.classList.remove('fading');
                }
                // there is now a piece at this dom key
                if (pieceAtKey) {
                    // continue animation if already animating and same piece
                    // (otherwise it could animate a captured piece)
                    if (anim && el.sgAnimating && elPieceName === pieceNameOf(pieceAtKey)) {
                        const pos = key2pos(k);
                        pos[0] += anim[2];
                        pos[1] += anim[3];
                        el.classList.add('anim');
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
                    // different piece: flag as moved unless it is a fading piece
                    else {
                        if (fading && elPieceName === pieceNameOf(fading)) {
                            el.classList.add('fading');
                            el.sgFading = true;
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
            anim = anims.get(k);
            if (!samePieces.has(k)) {
                pMvdset = movedPieces.get(pieceNameOf(p));
                pMvd = pMvdset && pMvdset.pop();
                // a same piece was moved
                if (pMvd) {
                    // apply dom changes
                    pMvd.sgKey = k;
                    if (pMvd.sgFading) {
                        pMvd.classList.remove('fading');
                        pMvd.sgFading = false;
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
                // assumes the new piece is not being dragged
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
        if (handTopEl)
            updateHand(s, handTopEl);
        if (handBotEl)
            updateHand(s, handBotEl);
        // remove any element that remains in the moved sets
        for (const nodes of movedPieces.values())
            removeNodes(s, nodes);
    }
    function removeNodes(s, nodes) {
        for (const node of nodes)
            s.dom.board.elements.pieces.removeChild(node);
    }
    function computeSquareClasses(s) {
        var _a, _b, _c;
        const squares = new Map();
        if (s.lastDests && s.highlight.lastDests)
            for (const k of s.lastDests)
                addSquare(squares, k, 'last-dest');
        if (s.check && s.highlight.check)
            addSquare(squares, s.check, 'check');
        if ((_a = s.draggable.current) === null || _a === void 0 ? void 0 : _a.hovering)
            addSquare(squares, s.draggable.current.hovering, 'hover');
        if (s.selected) {
            if (s.activeColor === 'both' || s.activeColor === s.turnColor)
                addSquare(squares, s.selected, 'selected');
            else
                addSquare(squares, s.selected, 'preselected');
            if (s.movable.showDests) {
                const dests = (_b = s.movable.dests) === null || _b === void 0 ? void 0 : _b.get(s.selected);
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
                const dests = (_c = s.droppable.dests) === null || _c === void 0 ? void 0 : _c.get(s.selectedPiece.role);
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
        if (premove)
            for (const k of premove)
                addSquare(squares, k, 'current-pre');
        else if (s.predroppable.current)
            addSquare(squares, s.predroppable.current.key, 'current-pre');
        return squares;
    }
    function addSquare(squares, key, klass) {
        const classes = squares.get(key);
        if (classes)
            squares.set(key, `${classes} ${klass}`);
        else
            squares.set(key, klass);
    }
    function updateHand(s, handEl) {
        var _a;
        handEl.classList.toggle('promotion', s.promotion.active);
        let pieceEl = handEl.firstElementChild;
        while (pieceEl) {
            const piece = { role: pieceEl.sgRole, color: pieceEl.sgColor };
            const num = ((_a = s.hands.handMap.get(piece.color)) === null || _a === void 0 ? void 0 : _a.get(piece.role)) || 0;
            const isSelected = !!s.selectedPiece && samePiece(piece, s.selectedPiece) && !s.droppable.spare;
            pieceEl.classList.toggle('selected', (s.activeColor === 'both' || s.activeColor === s.turnColor) && isSelected);
            pieceEl.classList.toggle('preselected', s.activeColor !== 'both' && s.activeColor !== s.turnColor && isSelected);
            pieceEl.classList.toggle('drawing', !!s.drawable.piece && samePiece(s.drawable.piece, piece));
            pieceEl.classList.toggle('current-pre', !!s.predroppable.current && samePiece(s.predroppable.current.piece, piece));
            pieceEl.dataset.nb = num.toString();
            pieceEl = pieceEl.nextElementSibling;
        }
    }
    function appendValue(map, key, value) {
        const arr = map.get(key);
        if (arr)
            arr.push(value);
        else
            map.set(key, [value]);
    }

    function Shogiground(wrapElements, config) {
        const maybeState = defaults();
        configure(maybeState, config || {});
        function redrawAll() {
            const prevUnbind = 'dom' in maybeState ? maybeState.dom.unbind : undefined;
            const boardElements = wrapBoard(wrapElements, maybeState), handElements = wrapHands(wrapElements, maybeState), boardBounds = memo(() => boardElements.pieces.getBoundingClientRect()), handsBounds = memo(() => {
                const handsRects = new Map();
                if (handElements.top)
                    handsRects.set('top', handElements.top.getBoundingClientRect());
                if (handElements.bottom)
                    handsRects.set('bottom', handElements.bottom.getBoundingClientRect());
                return handsRects;
            }), handPiecesBounds = memo(() => {
                const handPiecesRects = new Map();
                if (handElements.top) {
                    let el = handElements.top.firstElementChild;
                    while (el) {
                        const piece = { role: el.sgRole, color: el.sgColor };
                        handPiecesRects.set(pieceNameOf(piece), el.getBoundingClientRect());
                        el = el.nextElementSibling;
                    }
                }
                if (handElements.bottom) {
                    let el = handElements.bottom.firstElementChild;
                    while (el) {
                        const piece = { role: el.sgRole, color: el.sgColor };
                        handPiecesRects.set(pieceNameOf(piece), el.getBoundingClientRect());
                        el = el.nextElementSibling;
                    }
                }
                return handPiecesRects;
            }), redrawNow = (skipShapes) => {
                render(state);
                renderPromotions(state);
                if (!skipShapes && boardElements.svg)
                    renderShapes(state, boardElements.svg, boardElements.customSvg, boardElements.freePieces);
            }, onResize = () => {
                boardBounds.clear();
                handsBounds.clear();
                handPiecesBounds.clear();
                if (maybeState.drawable.shapes.some(s => isPiece(s.orig) || isPiece(s.dest)) && boardElements.svg)
                    renderShapes(state, boardElements.svg, boardElements.customSvg, boardElements.freePieces);
            };
            const state = maybeState;
            state.dom = {
                board: {
                    elements: boardElements,
                    bounds: boardBounds,
                },
                hands: {
                    elements: handElements,
                    pieceBounds: handPiecesBounds,
                    bounds: handsBounds,
                },
                wrapElements,
                redraw: debounceRedraw(redrawNow),
                redrawNow,
                unbind: prevUnbind,
            };
            state.drawable.prevSvgHash = '';
            redrawNow(false);
            bindBoard(state, onResize);
            bindHands(state, onResize);
            if (!prevUnbind)
                state.dom.unbind = bindDocument(state, onResize);
            state.events.insert && state.events.insert(boardElements, handElements);
            return state;
        }
        return start(redrawAll(), redrawAll);
    }
    function debounceRedraw(redrawNow) {
        let redrawing = false;
        return () => {
            if (redrawing)
                return;
            redrawing = true;
            requestAnimationFrame(() => {
                redrawNow();
                redrawing = false;
            });
        };
    }

    return Shogiground;

})();
