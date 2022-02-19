var Shogiground = (function () {
    'use strict';

    function isColor(x) {
        return colors.includes(x);
    }
    function isRole(x) {
        return roles.includes(x);
    }
    const colors = ['sente', 'gote'];
    const roles = [
        'king',
        'rook',
        'bishop',
        'gold',
        'silver',
        'knight',
        'lance',
        'pawn',
        'dragon',
        'horse',
        'promotedsilver',
        'promotedknight',
        'promotedlance',
        'tokin',
    ];
    const files = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const ranks = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];

    // 1a, 1b, 1c ...
    const allKeys = Array.prototype.concat(...files.map(c => ranks.map(r => c + r)));
    const pos2key = (pos) => allKeys[9 * pos[0] + pos[1]];
    const key2pos = (k) => [k.charCodeAt(0) - 49, k.charCodeAt(1) - 97];
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
    const timer = () => {
        let startAt;
        return {
            start() {
                startAt = performance.now();
            },
            cancel() {
                startAt = undefined;
            },
            stop() {
                if (!startAt)
                    return 0;
                const time = performance.now() - startAt;
                startAt = undefined;
                return time;
            },
        };
    };
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
    const posToTranslateRel = (dims) => (pos, asSente) => posToTranslateBase(pos, dims, asSente, 50, 50);
    // scale, because https://ctidd.com/2015/svg-background-scaling, but for pgn
    // we don't scale squares
    const translateAbs = (el, pos, scale = true) => {
        el.style.transform = `translate(${pos[0]}px,${pos[1]}px) ${scale ? 'scale(0.5)' : ''}`;
    };
    const translateRel = (el, percents, scale = true) => {
        const scaleRatio = scale ? 1 : 2;
        el.style.transform = `translate(${scaleRatio * percents[0]}%,${scaleRatio * percents[1]}%) ${scale ? 'scale(0.5)' : ''}`;
    };
    const setVisible = (el, v) => {
        el.style.visibility = v ? 'visible' : 'hidden';
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
    const createEl = (tagName, className) => {
        const el = document.createElement(tagName);
        if (className)
            el.className = className;
        return el;
    };
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
        state.animation.current = state.draggable.current = state.selected = undefined;
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
    function setPremove(state, orig, dest, meta) {
        unsetPredrop(state);
        state.premovable.current = [orig, dest];
        callUserFunction(state.premovable.events.set, orig, dest, meta);
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
        const pd = state.predroppable;
        if (pd.current) {
            pd.current = undefined;
            callUserFunction(pd.events.unset);
        }
    }
    function baseMove(state, orig, dest) {
        const origPiece = state.pieces.get(orig), destPiece = state.pieces.get(dest);
        if (orig === dest || !origPiece)
            return false;
        const captured = destPiece && destPiece.color !== origPiece.color ? destPiece : undefined;
        if (state.hands.enabled && captured) {
            const afterRole = state.hands.captureProcessing(captured.role);
            if (afterRole)
                addToHand(state, { color: opposite(captured.color), role: afterRole });
        }
        if (dest === state.selected)
            unselect(state);
        callUserFunction(state.events.move, orig, dest, captured);
        state.pieces.set(dest, origPiece);
        state.pieces.delete(orig);
        state.lastMove = [orig, dest];
        state.check = undefined;
        callUserFunction(state.events.change);
        return captured || true;
    }
    function baseDrop(state, piece, key, force) {
        if (state.pieces.has(key)) {
            if (force)
                state.pieces.delete(key);
            else
                return false;
        }
        callUserFunction(state.events.drop, piece, key);
        state.pieces.set(key, piece);
        state.lastMove = [key];
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
    function baseUserDrop(state, piece, key, force) {
        const result = baseDrop(state, piece, key, force);
        if (result) {
            state.movable.dests = undefined;
            state.droppable.dests = undefined;
            state.turnColor = opposite(state.turnColor);
            state.animation.current = undefined;
        }
        return result;
    }
    function userDrop(state, piece, dest, force, fromHand) {
        if (canDrop(state, piece, dest) || force) {
            if (baseUserDrop(state, piece, dest, force) && fromHand) {
                removeFromHand(state, piece);
                cancelDropMode(state);
            }
            callUserFunction(state.droppable.events.after, piece, dest, {
                premove: false,
                predrop: false,
            });
        }
        else if (canPredrop(state, piece, dest)) {
            setPredrop(state, piece, dest);
        }
        else {
            unsetPremove(state);
            unsetPredrop(state);
        }
        unselect(state);
    }
    function userMove(state, orig, dest) {
        if (canMove(state, orig, dest)) {
            const result = baseUserMove(state, orig, dest);
            if (result) {
                const holdTime = state.hold.stop();
                unselect(state);
                const metadata = {
                    premove: false,
                    ctrlKey: state.stats.ctrlKey,
                    holdTime,
                };
                if (result !== true)
                    metadata.captured = result;
                callUserFunction(state.movable.events.after, orig, dest, metadata);
                return true;
            }
        }
        else if (canPremove(state, orig, dest)) {
            setPremove(state, orig, dest, {
                ctrlKey: state.stats.ctrlKey,
            });
            unselect(state);
            return true;
        }
        unselect(state);
        return false;
    }
    function addToHand(state, piece, cnt = 1) {
        const hand = state.hands.handMap.get(piece.color);
        if (hand)
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
        if (state.selected) {
            if (state.selected === key && !state.draggable.enabled) {
                unselect(state);
                state.hold.cancel();
                return;
            }
            else if ((state.selectable.enabled || force) && state.selected !== key) {
                if (userMove(state, state.selected, key)) {
                    state.stats.dragged = false;
                    return;
                }
            }
        }
        if (isMovable(state, key) || isPremovable(state, key)) {
            setSelected(state, key);
            state.hold.start();
        }
    }
    function setSelected(state, key) {
        state.selected = key;
        if (isPremovable(state, key)) {
            state.premovable.dests = premove(state.pieces, key, state.dimensions);
        }
        else {
            state.premovable.dests = undefined;
            state.predroppable.dests = undefined;
        }
    }
    function unselect(state) {
        state.selected = undefined;
        state.premovable.dests = undefined;
        state.predroppable.dests = undefined;
        state.hold.cancel();
    }
    function cancelDropMode(state) {
        state.dropmode.active = false;
        state.dropmode.piece = undefined;
    }
    function isMovable(state, orig) {
        const piece = state.pieces.get(orig);
        return (!!piece && (state.activeColor === 'both' || (state.activeColor === piece.color && state.turnColor === piece.color)));
    }
    function canMove(state, orig, dest) {
        var _a, _b;
        return (orig !== dest && isMovable(state, orig) && (state.movable.free || !!((_b = (_a = state.movable.dests) === null || _a === void 0 ? void 0 : _a.get(orig)) === null || _b === void 0 ? void 0 : _b.includes(dest))));
    }
    function canDrop(state, piece, dest) {
        var _a, _b;
        return (!state.pieces.has(dest) &&
            (state.activeColor === 'both' || (state.activeColor === piece.color && state.turnColor === piece.color)) &&
            (state.droppable.free || !!((_b = (_a = state.droppable.dests) === null || _a === void 0 ? void 0 : _a.get(piece.role)) === null || _b === void 0 ? void 0 : _b.includes(dest))));
    }
    function isPremovable(state, orig) {
        const piece = state.pieces.get(orig);
        return !!piece && state.premovable.enabled && state.activeColor === piece.color && state.turnColor !== piece.color;
    }
    function isPredroppable(state, piece) {
        var _a;
        return ((state.dropmode.active || !!((_a = state.draggable.current) === null || _a === void 0 ? void 0 : _a.newPiece)) &&
            state.predroppable.enabled &&
            state.activeColor === piece.color &&
            state.turnColor !== piece.color);
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
    function isDraggable(state, orig) {
        const piece = state.pieces.get(orig);
        return (!!piece &&
            state.draggable.enabled &&
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
                const metadata = { premove: true };
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
                    premove: false,
                    predrop: true,
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
        cancelDropMode(state);
    }
    function stop(state) {
        state.activeColor = state.movable.dests = state.droppable.dests = state.animation.current = undefined;
        cancelMoveOrDrop(state);
    }
    function getKeyAtDomPos(pos, asSente, dims, bounds) {
        let file = Math.floor((dims.files * (pos[0] - bounds.left)) / bounds.width);
        if (asSente)
            file = dims.files - 1 - file;
        let rank = dims.ranks - 1 - Math.floor((dims.ranks * (pos[1] - bounds.top)) / bounds.height);
        if (asSente)
            rank = dims.ranks - 1 - rank;
        return file >= 0 && file < dims.files && rank >= 0 && rank < dims.ranks ? pos2key([file, rank]) : undefined;
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
            else {
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
                    const nb = sfen[i].charCodeAt(0);
                    if (nb < 58 && nb > 47)
                        x -= nb - 48;
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
    function writeHands(hands, handRoles) {
        var _a, _b;
        let senteHandStr = '';
        let goteHandStr = '';
        for (const role of handRoles) {
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
            const pieceToDrop = state.pieces.get('00');
            state.pieces = readBoard(config.sfen.board, state.dimensions);
            if (pieceToDrop)
                state.pieces.set('00', pieceToDrop);
            state.drawable.shapes = [];
        }
        if ((_e = config.sfen) === null || _e === void 0 ? void 0 : _e.hands) {
            state.hands.handMap = readHands(config.sfen.hands);
        }
        // apply config values that could be undefined yet meaningful
        if ('check' in config)
            setCheck(state, config.check || false);
        if ('lastMove' in config && !config.lastMove)
            state.lastMove = undefined;
        // in case of drop last move, there's a single square.
        // if the previous last move had two squares,
        // the merge algorithm will incorrectly keep the second square.
        else if (config.lastMove)
            state.lastMove = config.lastMove;
        // fix move/premove dests
        if (state.selected)
            setSelected(state, state.selected);
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
    function computePlan(prevPieces, current) {
        const anims = new Map(), animedOrigs = [], fadings = new Map(), missings = [], news = [], prePieces = new Map();
        let curP, preP, vector;
        for (const [k, p] of prevPieces) {
            prePieces.set(k, makePiece(k, p));
        }
        for (const key of allKeys) {
            curP = current.pieces.get(key);
            preP = prePieces.get(key);
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
        for (const newP of news) {
            preP = closer(newP, missings.filter(p => samePiece(newP.piece, p.piece)));
            if (preP) {
                vector = [preP.pos[0] - newP.pos[0], preP.pos[1] - newP.pos[1]];
                anims.set(newP.key, vector.concat(vector));
                animedOrigs.push(preP.key);
            }
        }
        for (const p of missings) {
            if (!animedOrigs.includes(p.key))
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
        const prevPieces = new Map(state.pieces);
        const result = mutation(state);
        const plan = computePlan(prevPieces, state);
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

    const brushes = ['green', 'red', 'blue', 'yellow'];
    function start$2(state, e) {
        // support one finger touch only
        if (e.touches && e.touches.length > 1)
            return;
        e.stopPropagation();
        e.preventDefault();
        e.ctrlKey ? unselect(state) : cancelMoveOrDrop(state);
        const pos = eventPosition(e), orig = getKeyAtDomPos(pos, sentePov(state), state.dimensions, state.dom.bounds()), piece = state.drawable.piece;
        if (!orig)
            return;
        state.drawable.current = {
            orig,
            pos,
            piece,
            brush: eventBrush(e),
        };
        processDraw(state);
    }
    function processDraw(state) {
        requestAnimationFrame(() => {
            const cur = state.drawable.current;
            if (cur) {
                const mouseSq = getKeyAtDomPos(cur.pos, sentePov(state), state.dimensions, state.dom.bounds());
                if (mouseSq !== cur.mouseSq) {
                    cur.mouseSq = mouseSq;
                    cur.dest = mouseSq !== cur.orig ? mouseSq : undefined;
                    cur.piece = cur.dest ? undefined : state.drawable.piece;
                    state.dom.redrawNow();
                }
                processDraw(state);
            }
        });
    }
    function move$1(state, e) {
        if (state.drawable.current)
            state.drawable.current.pos = eventPosition(e);
    }
    function end$1(state) {
        const cur = state.drawable.current;
        if (cur) {
            if (cur.mouseSq)
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
        if (state.drawable.shapes.length) {
            state.drawable.shapes = [];
            state.dom.redraw();
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
        const similarShape = (s) => s.orig === cur.orig && s.dest === cur.dest;
        // replacing the piece
        const diffPieceSameSquare = (s) => s.orig === cur.orig &&
            s.piece &&
            cur.piece &&
            (s.piece.color !== cur.piece.color || s.piece.role !== cur.piece.role);
        const similar = drawable.shapes.find(similarShape);
        const diffPiece = drawable.shapes.find(diffPieceSameSquare);
        // If we found something on the target square, first we remove everything on there
        if (similar)
            drawable.shapes = drawable.shapes.filter(s => !similarShape(s));
        // We add the shape if we found no similar or if we are just replacing the piece
        if (!similar || similar.brush !== cur.brush || diffPiece)
            drawable.shapes.push(cur);
        // Adding circle around piece
        if (cur.piece && (!similar || similar.brush !== cur.brush || diffPiece))
            drawable.shapes.push({ orig: cur.orig, brush: cur.brush });
        onChange(drawable);
    }
    function onChange(drawable) {
        if (drawable.onChange)
            drawable.onChange(drawable.shapes);
    }

    function start$1(s, e) {
        if (!e.isTrusted || (e.button !== undefined && e.button !== 0))
            return; // only touch or left click
        if (e.touches && e.touches.length > 1)
            return; // support one finger touch only
        const bounds = s.dom.bounds(), position = eventPosition(e), orig = getKeyAtDomPos(position, sentePov(s), s.dimensions, bounds);
        if (!orig)
            return;
        const piece = s.pieces.get(orig);
        const previouslySelected = s.selected;
        if (!previouslySelected && s.drawable.enabled && (s.drawable.eraseOnClick || !piece || piece.color !== s.turnColor))
            clear(s);
        // Prevent touch scroll and create no corresponding mouse event, if there
        // is an intent to interact with the board.
        if (e.cancelable !== false &&
            (!e.touches || s.blockTouchScroll || piece || previouslySelected || pieceCloseTo(s, position)))
            e.preventDefault();
        const hadPremove = !!s.premovable.current;
        const hadPredrop = !!s.predroppable.current || !!s.predroppable.dests;
        s.stats.ctrlKey = e.ctrlKey;
        if (s.selected && canMove(s, s.selected, orig)) {
            anim(state => selectSquare(state, orig), s);
        }
        else {
            selectSquare(s, orig);
        }
        const stillSelected = s.selected === orig;
        const element = pieceElementByKey(s, orig);
        if (piece && element && stillSelected && isDraggable(s, orig)) {
            s.draggable.current = {
                orig,
                piece,
                origPos: position,
                pos: position,
                started: s.draggable.autoDistance && s.stats.dragged,
                element,
                previouslySelected,
                originTarget: e.target,
                keyHasChanged: false,
            };
            element.sgDragging = true;
            element.classList.add('dragging');
            // place ghost
            const ghost = s.dom.elements.ghost;
            if (ghost) {
                ghost.className = `ghost ${piece.color} ${piece.role}`;
                translateAbs(ghost, posToTranslateAbs(s.dimensions, bounds)(key2pos(orig), sentePov(s)));
                setVisible(ghost, true);
            }
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
        const asSente = sentePov(s), bounds = s.dom.bounds(), radiusSq = Math.pow(bounds.width / s.dimensions.files, 2);
        for (const key of s.pieces.keys()) {
            const center = computeSquareCenter(key, asSente, s.dimensions, bounds);
            if (distanceSq(center, pos) <= radiusSq)
                return true;
        }
        return false;
    }
    function dragNewPiece(s, piece, e, hand, force) {
        var _a;
        const key = '00';
        s.pieces.set(key, piece);
        unselect(s);
        s.dom.redraw();
        const position = eventPosition(e);
        s.draggable.current = {
            orig: key,
            piece,
            origPos: position,
            pos: position,
            started: true,
            element: () => pieceElementByKey(s, key),
            originTarget: e.target,
            newPiece: true,
            fromHand: hand,
            force: force,
            keyHasChanged: s.dropmode.active && ((_a = s.dropmode.piece) === null || _a === void 0 ? void 0 : _a.role) === piece.role && s.dropmode.piece.color === piece.color,
        };
        if (isPredroppable(s, piece))
            s.predroppable.dests = predrop(s.pieces, piece, s.dimensions);
        if (hand) {
            s.dropmode.active = true;
            s.dropmode.piece = piece;
        }
        processDrag(s);
    }
    function processDrag(s) {
        requestAnimationFrame(() => {
            var _a;
            const cur = s.draggable.current;
            if (!cur)
                return;
            // cancel animations while dragging
            if ((_a = s.animation.current) === null || _a === void 0 ? void 0 : _a.plan.anims.has(cur.orig))
                s.animation.current = undefined;
            // if moving piece is gone, cancel
            const origPiece = s.pieces.get(cur.orig);
            if (!origPiece || !samePiece(origPiece, cur.piece))
                cancel(s);
            else {
                if (!cur.started && distanceSq(cur.pos, cur.origPos) >= Math.pow(s.draggable.distance, 2))
                    cur.started = true;
                if (cur.started) {
                    // support lazy elements
                    if (typeof cur.element === 'function') {
                        const found = cur.element();
                        if (!found)
                            return;
                        found.sgDragging = true;
                        found.classList.add('dragging');
                        cur.element = found;
                    }
                    const bounds = s.dom.bounds();
                    translateAbs(cur.element, [
                        cur.pos[0] - bounds.left - bounds.width / (s.dimensions.files * 2),
                        cur.pos[1] - bounds.top - bounds.height / (s.dimensions.ranks * 2),
                    ]);
                    cur.keyHasChanged =
                        cur.keyHasChanged ||
                            (!cur.newPiece && cur.orig !== getKeyAtDomPos(cur.pos, sentePov(s), s.dimensions, bounds)) ||
                            (!!cur.fromHand && distanceSq(cur.pos, cur.origPos) >= Math.pow(s.draggable.distance, 4));
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
        const cur = s.draggable.current;
        if (!cur)
            return;
        // create no corresponding mouse event
        if (e.type === 'touchend' && e.cancelable !== false)
            e.preventDefault();
        // comparing with the origin target is an easy way to test that the end event
        // has the same touch origin
        if (e.type === 'touchend' && cur.originTarget !== e.target && !cur.newPiece) {
            s.draggable.current = undefined;
            return;
        }
        unsetPremove(s);
        unsetPredrop(s);
        // touchend has no position; so use the last touchmove position instead
        const eventPos = eventPosition(e) || cur.pos;
        const dest = getKeyAtDomPos(eventPos, sentePov(s), s.dimensions, s.dom.bounds());
        if (dest && cur.started && cur.orig !== dest) {
            if (cur.newPiece) {
                userDrop(s, cur.piece, dest, cur.force, cur.fromHand);
                s.pieces.delete('00');
            }
            else {
                s.stats.ctrlKey = e.ctrlKey;
                if (userMove(s, cur.orig, dest))
                    s.stats.dragged = true;
            }
        }
        else if (cur.newPiece) {
            s.pieces.delete(cur.orig);
            if (cur.fromHand && cur.keyHasChanged) {
                cancelDropMode(s);
            }
        }
        else if (s.draggable.deleteOnDropOff && !dest) {
            s.draggable.lastDropOff = cur;
            s.pieces.delete(cur.orig);
            callUserFunction(s.events.change);
        }
        if ((cur.orig === cur.previouslySelected || cur.keyHasChanged) && (cur.orig === dest || !dest))
            unselect(s);
        else if (!s.selectable.enabled)
            unselect(s);
        removeDragElements(s);
        s.draggable.current = undefined;
        s.dom.redraw();
    }
    function cancel(s) {
        const cur = s.draggable.current;
        if (cur) {
            if (cur.newPiece)
                s.pieces.delete(cur.orig);
            s.draggable.current = undefined;
            unselect(s);
            removeDragElements(s);
            s.dom.redraw();
        }
    }
    function removeDragElements(s) {
        const e = s.dom.elements;
        if (e.ghost)
            setVisible(e.ghost, false);
    }
    function pieceElementByKey(s, key) {
        let el = s.dom.elements.board.firstChild;
        while (el) {
            if (el.sgKey === key && el.tagName === 'PIECE')
                return el;
            el = el.nextSibling;
        }
        return;
    }

    // see API types and documentations in dts/api.d.ts
    function start(state, redrawAll) {
        function toggleOrientation$1() {
            toggleOrientation(state);
            redrawAll();
        }
        return {
            set(config) {
                if (config.orientation && config.orientation !== state.orientation)
                    toggleOrientation$1();
                applyAnimation(state, config);
                (config.sfen ? anim : render$1)(state => configure(state, config), state);
            },
            state,
            getBoardSfen: () => writeBoard(state.pieces, state.dimensions),
            getHandsSfen: () => writeHands(state.hands.handMap, state.hands.handRoles),
            toggleOrientation: toggleOrientation$1,
            move(orig, dest) {
                anim(state => baseMove(state, orig, dest), state);
            },
            drop(piece, key) {
                anim(state => baseDrop(state, piece, key), state);
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
            selectSquare(key, force) {
                if (key)
                    anim(state => selectSquare(state, key, force), state);
                else if (state.selected) {
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
            getKeyAtDomPos(pos) {
                return getKeyAtDomPos(pos, sentePov(state), state.dimensions, state.dom.bounds());
            },
            redrawAll,
            dragNewPiece(piece, event, hand, force) {
                dragNewPiece(state, piece, event, hand, force);
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
            grid: false,
            viewOnly: false,
            disableContextMenu: false,
            resizable: true,
            blockTouchScroll: false,
            coordinates: {
                enabled: true,
                notation: 0 /* WESTERN */,
            },
            highlight: {
                lastMove: true,
                check: true,
            },
            animation: {
                enabled: true,
                duration: 200,
            },
            hands: {
                handMap: new Map(),
                enabled: true,
                handRoles: ['rook', 'bishop', 'gold', 'silver', 'knight', 'lance', 'pawn'],
                captureProcessing: (role) => {
                    switch (role) {
                        case 'tokin':
                            return 'pawn';
                        case 'promotedlance':
                            return 'lance';
                        case 'promotedknight':
                            return 'knight';
                        case 'promotedsilver':
                            return 'silver';
                        case 'dragon':
                            return 'rook';
                        case 'horse':
                            return 'bishop';
                        case 'king':
                            return undefined;
                        default:
                            return role;
                    }
                },
            },
            movable: {
                free: true,
                showDests: true,
                events: {},
            },
            droppable: {
                free: true,
                showDests: true,
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
                deleteOnDropOff: false,
            },
            dropmode: {
                active: false,
                fromHand: true,
            },
            selectable: {
                enabled: true,
            },
            stats: {
                // on touchscreen, default to "tap-tap" moves
                // instead of drag
                dragged: !('ontouchstart' in window),
            },
            events: {},
            drawable: {
                enabled: true,
                visible: true,
                eraseOnClick: true,
                shapes: [],
                autoShapes: [],
                brushes: {
                    green: { key: 'g', color: '#15781B', opacity: 1, lineWidth: 10 },
                    red: { key: 'r', color: '#882020', opacity: 1, lineWidth: 10 },
                    blue: { key: 'b', color: '#003088', opacity: 1, lineWidth: 10 },
                    yellow: { key: 'y', color: '#e68f00', opacity: 1, lineWidth: 10 },
                    paleBlue: { key: 'pb', color: '#003088', opacity: 0.4, lineWidth: 15 },
                    paleGreen: { key: 'pg', color: '#15781B', opacity: 0.4, lineWidth: 15 },
                    paleRed: { key: 'pr', color: '#882020', opacity: 0.4, lineWidth: 15 },
                    paleGrey: {
                        key: 'pgr',
                        color: '#4a4a4a',
                        opacity: 0.35,
                        lineWidth: 15,
                    },
                },
                prevSvgHash: '',
            },
            hold: timer(),
        };
    }

    function createElement(tagName) {
        return document.createElementNS('http://www.w3.org/2000/svg', tagName);
    }
    function renderSvg(state, svg, customSvg) {
        const d = state.drawable, curD = d.current, cur = curD && curD.mouseSq ? curD : undefined, arrowDests = new Map(), bounds = state.dom.bounds();
        for (const s of d.shapes.concat(d.autoShapes).concat(cur ? [cur] : [])) {
            if (s.dest)
                arrowDests.set(s.dest, (arrowDests.get(s.dest) || 0) + 1);
        }
        const shapes = d.shapes.concat(d.autoShapes).map((s) => {
            return {
                shape: s,
                current: false,
                hash: shapeHash(s, arrowDests, false, bounds),
            };
        });
        if (cur)
            shapes.push({
                shape: cur,
                current: true,
                hash: shapeHash(cur, arrowDests, true, bounds),
            });
        const fullHash = shapes.map(sc => sc.hash).join(';');
        if (fullHash === state.drawable.prevSvgHash)
            return;
        state.drawable.prevSvgHash = fullHash;
        /*
          -- DOM hierarchy --
          <svg class="sg-shapes">      (<= svg)
            <defs>
              ...(for brushes)...
            </defs>
            <g>
              ...(for arrows, circles, and pieces)...
            </g>
          </svg>
          <svg class="sg-custom-svgs"> (<= customSvg)
            <g>
              ...(for custom svgs)...
            </g>
          </svg>
        */
        const defsEl = svg.querySelector('defs');
        const shapesEl = svg.querySelector('g');
        const customSvgsEl = customSvg.querySelector('g');
        syncDefs(d, shapes, defsEl);
        syncShapes(state, shapes.filter(s => !s.shape.customSvg), d.brushes, arrowDests, shapesEl);
        syncShapes(state, shapes.filter(s => s.shape.customSvg), d.brushes, arrowDests, customSvgsEl);
    }
    // append only. Don't try to update/remove.
    function syncDefs(d, shapes, defsEl) {
        const brushes = new Map();
        let brush;
        for (const s of shapes) {
            if (s.shape.dest) {
                brush = d.brushes[s.shape.brush];
                if (s.shape.modifiers)
                    brush = makeCustomBrush(brush, s.shape.modifiers);
                brushes.set(brush.key, brush);
            }
        }
        const keysInDom = new Set();
        let el = defsEl.firstChild;
        while (el) {
            keysInDom.add(el.getAttribute('sgKey'));
            el = el.nextSibling;
        }
        for (const [key, brush] of brushes.entries()) {
            if (!keysInDom.has(key))
                defsEl.appendChild(renderMarker(brush));
        }
    }
    // append and remove only. No updates.
    function syncShapes(state, shapes, brushes, arrowDests, root) {
        const bounds = state.dom.bounds(), hashesInDom = new Map(), // by hash
        toRemove = [];
        for (const sc of shapes)
            hashesInDom.set(sc.hash, false);
        let el = root.firstChild, elHash;
        while (el) {
            elHash = el.getAttribute('sgHash');
            // found a shape element that's here to stay
            if (hashesInDom.has(elHash))
                hashesInDom.set(elHash, true);
            // or remove it
            else
                toRemove.push(el);
            el = el.nextSibling;
        }
        // remove old shapes
        for (const el of toRemove)
            root.removeChild(el);
        // insert shapes that are not yet in dom
        for (const sc of shapes) {
            if (!hashesInDom.get(sc.hash))
                root.appendChild(renderShape(state, sc, brushes, arrowDests, bounds));
        }
    }
    function shapeHash({ orig, dest, brush, piece, modifiers, customSvg }, arrowDests, current, bounds) {
        return [
            bounds.width,
            bounds.height,
            current,
            orig,
            dest,
            brush,
            dest && (arrowDests.get(dest) || 0) > 1,
            piece && pieceHash(piece),
            modifiers && modifiersHash(modifiers),
            customSvg && customSvgHash(customSvg),
        ]
            .filter(x => x)
            .join(',');
    }
    function pieceHash(piece) {
        return [piece.color, piece.role, piece.scale].filter(x => x).join(',');
    }
    function modifiersHash(m) {
        return '' + (m.lineWidth || '');
    }
    function customSvgHash(s) {
        // Rolling hash with base 31 (cf. https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript)
        let h = 0;
        for (let i = 0; i < s.length; i++) {
            h = ((h << 5) - h + s.charCodeAt(i)) >>> 0;
        }
        return 'custom-' + h.toString();
    }
    function renderShape(state, { shape, current, hash }, brushes, arrowDests, bounds) {
        const dims = state.dimensions;
        let el;
        if (shape.customSvg) {
            const orig = orient(key2pos(shape.orig), state.orientation, dims);
            el = renderCustomSvg(shape.customSvg, orig, dims, bounds);
        }
        else if (shape.piece && !shape.dest)
            el = renderPiece(orient(key2pos(shape.orig), state.orientation, dims), shape.piece, dims, bounds);
        else {
            const orig = orient(key2pos(shape.orig), state.orientation, dims);
            if (shape.dest) {
                let brush = brushes[shape.brush];
                if (shape.modifiers)
                    brush = makeCustomBrush(brush, shape.modifiers);
                el = renderArrow(brush, orig, orient(key2pos(shape.dest), state.orientation, dims), current, (arrowDests.get(shape.dest) || 0) > 1, dims, bounds);
            }
            else
                el = renderCircle(brushes[shape.brush], orig, current, dims, bounds);
        }
        el.setAttribute('sgHash', hash);
        return el;
    }
    function renderCustomSvg(customSvg, pos, dims, bounds) {
        const { width, height } = bounds;
        const w = width / dims.files;
        const h = height / dims.ranks;
        const x = pos[0] * w;
        const y = (dims.ranks - 1 - pos[1]) * h;
        // Translate to top-left of `orig` square
        const g = setAttributes(createElement('g'), { transform: `translate(${x},${y})` });
        // Give 100x100 coordinate system to the user for `orig` square
        const svg = setAttributes(createElement('svg'), { width: w, height: w, viewBox: '0 0 100 100' });
        g.appendChild(svg);
        svg.innerHTML = customSvg;
        return g;
    }
    function renderCircle(brush, pos, current, dims, bounds) {
        const o = pos2px(pos, bounds, dims), widths = circleWidth(dims, bounds), radius = (bounds.width + bounds.height) / (dims.files * 4);
        return setAttributes(createElement('circle'), {
            stroke: brush.color,
            'stroke-width': widths[current ? 0 : 1],
            fill: 'none',
            opacity: opacity(brush, current),
            cx: o[0],
            cy: o[1],
            r: radius - widths[1] / 2,
        });
    }
    function renderArrow(brush, orig, dest, current, shorten, dims, bounds) {
        const m = arrowMargin(dims, bounds, shorten && !current), a = pos2px(orig, bounds, dims), b = pos2px(dest, bounds, dims), dx = b[0] - a[0], dy = b[1] - a[1], angle = Math.atan2(dy, dx), xo = Math.cos(angle) * m, yo = Math.sin(angle) * m;
        return setAttributes(createElement('line'), {
            stroke: brush.color,
            'stroke-width': lineWidth(brush, dims, current, bounds),
            'stroke-linecap': 'round',
            'marker-end': 'url(#arrowhead-' + brush.key + ')',
            opacity: opacity(brush, current),
            x1: a[0],
            y1: a[1],
            x2: b[0] - xo,
            y2: b[1] - yo,
        });
    }
    function renderPiece(pos, piece, dims, bounds) {
        const o = pos2px(pos, bounds, dims), size = (bounds.width / dims.files) * (piece.scale || 0.8);
        // todo - remove foreignObject - seems like it's buggy on chromium and safari?
        const el = setAttributes(createElement('foreignObject'), {
            className: `${piece.role} ${piece.color}`,
            x: o[0] - size / 2,
            y: o[1] - size / 2,
            width: size,
            height: size,
        });
        const pieceEl = createEl('piece', `${piece.color} ${piece.role}`);
        pieceEl.style.width = '200%';
        pieceEl.style.height = '200%';
        pieceEl.style.margin = '-50%';
        pieceEl.style.transform = 'scale(0.5)';
        el.append(pieceEl);
        return el;
    }
    function renderMarker(brush) {
        const marker = setAttributes(createElement('marker'), {
            id: 'arrowhead-' + brush.key,
            orient: 'auto',
            markerWidth: 4,
            markerHeight: 8,
            refX: 2.05,
            refY: 2.01,
        });
        marker.appendChild(setAttributes(createElement('path'), {
            d: 'M0,0 V4 L3,2 Z',
            fill: brush.color,
        }));
        marker.setAttribute('sgKey', brush.key);
        return marker;
    }
    function setAttributes(el, attrs) {
        for (const key in attrs)
            el.setAttribute(key, attrs[key]);
        return el;
    }
    function orient(pos, color, dims) {
        return color === 'sente' ? [dims.files - 1 - pos[0], dims.ranks - 1 - pos[1]] : pos;
    }
    function makeCustomBrush(base, modifiers) {
        return {
            color: base.color,
            opacity: Math.round(base.opacity * 10) / 10,
            lineWidth: Math.round(modifiers.lineWidth || base.lineWidth),
            key: [base.key, modifiers.lineWidth].filter(x => x).join(''),
        };
    }
    function circleWidth(dims, bounds) {
        const base = bounds.width / (55 * dims.files);
        return [3 * base, 4 * base];
    }
    function lineWidth(brush, dims, current, bounds) {
        return (((brush.lineWidth || 10) * (current ? 0.85 : 1)) / (55 * dims.files)) * bounds.width;
    }
    function opacity(brush, current) {
        return (brush.opacity || 1) * (current ? 0.9 : 1);
    }
    function arrowMargin(dims, bounds, shorten) {
        return ((shorten ? 20 : 10) / (55 * dims.files)) * bounds.width;
    }
    function pos2px(pos, bounds, dims) {
        return [((pos[0] + 0.5) * bounds.width) / dims.files, ((dims.ranks - 0.5 - pos[1]) * bounds.height) / dims.ranks];
    }

    function renderWrap(element, s, relative) {
        // .sg-wrap (element passed to Shogiground)
        //     sg-container
        //       sg-hand
        //       sg-board
        //       svg.sg-grid
        //       sg-hand
        //       svg.sg-shapes
        //         defs
        //         g
        //       svg.sg-custom-svgs
        //         g
        //       coords.ranks
        //       coords.files
        //       piece.ghost
        element.innerHTML = '';
        // ensure the sg-wrap class is set
        // so bounds calculation can use the CSS width/height values
        // add that class yourself to the element before calling shogiground
        // for a slight performance improvement! (avoids recomputing style)
        element.classList.add('sg-wrap', `d-${s.dimensions.files}x${s.dimensions.ranks}`);
        for (const c of colors)
            element.classList.toggle('orientation-' + c, s.orientation === c);
        element.classList.toggle('manipulable', !s.viewOnly);
        const container = createEl('sg-container');
        element.appendChild(container);
        const board = createEl('sg-board');
        container.appendChild(board);
        let handTop, handBot;
        if (s.hands.enabled) {
            handTop = createEl('sg-hand', 'hand-top');
            handBot = createEl('sg-hand', 'hand-bot');
            container.insertBefore(handTop, board);
            container.insertBefore(handBot, board.nextSibling);
        }
        if (s.grid)
            container.insertBefore(makeGridSVG(s.dimensions), board.nextSibling);
        let svg;
        let customSvg;
        if (s.drawable.visible && !relative) {
            svg = setAttributes(createElement('svg'), { class: 'sg-shapes' });
            svg.appendChild(createElement('defs'));
            svg.appendChild(createElement('g'));
            customSvg = setAttributes(createElement('svg'), { class: 'sg-custom-svgs' });
            customSvg.appendChild(createElement('g'));
            container.appendChild(svg);
            container.appendChild(customSvg);
        }
        if (s.coordinates.enabled) {
            const orientClass = s.orientation === 'gote' ? ' gote' : '';
            const ranks = ranksByNotation(s.coordinates.notation);
            container.appendChild(renderCoords(ranks, 'ranks' + orientClass, s.dimensions.ranks));
            container.appendChild(renderCoords(['9', '8', '7', '6', '5', '4', '3', '2', '1'], 'files' + orientClass, s.dimensions.files));
        }
        let ghost;
        if (s.draggable.showGhost && !relative) {
            ghost = createEl('piece', 'ghost');
            setVisible(ghost, false);
            container.appendChild(ghost);
        }
        return {
            board,
            handTop,
            handBot,
            container,
            ghost,
            svg,
            customSvg,
        };
    }
    function ranksByNotation(notation) {
        switch (notation) {
            case 2 /* JAPANESE */:
                return ['九', '八', '七', '六', '五', '四', '三', '二', '一'];
            case 3 /* WESTERN2 */:
                return ['i', 'h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
            default:
                return ['9', '8', '7', '6', '5', '4', '3', '2', '1'];
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
    function makeGridSVG(dims) {
        const multiplier = 90;
        const width = dims.files * multiplier;
        const height = dims.ranks * multiplier;
        const svg = setAttributes(createElement('svg'), {
            class: 'sg-grid',
            viewBox: `0 0 ${width} ${height}`,
            preserveAspectRatio: 'none',
        });
        for (let i = 0; i <= dims.ranks; i++) {
            svg.appendChild(setAttributes(createElement('line'), {
                x1: 0,
                x2: width,
                y1: multiplier * i,
                y2: multiplier * i,
            }));
        }
        for (let i = 0; i <= dims.files; i++) {
            svg.appendChild(setAttributes(createElement('line'), {
                x1: multiplier * i,
                x2: multiplier * i,
                y1: 0,
                y2: height,
            }));
        }
        // we use line instead of circle, so the radius stays the same on non square boards
        const radius = Math.floor((width + height) / multiplier / 2);
        const offsetX = Math.floor(dims.files / 3) * multiplier;
        const offsetY = Math.floor(dims.ranks / 3) * multiplier;
        for (const x of [false, true])
            for (const y of [false, true])
                svg.appendChild(setAttributes(createElement('line'), {
                    x1: x ? width - offsetX : offsetX,
                    x2: x ? width - offsetX : offsetX,
                    y1: y ? height - offsetY : offsetY,
                    y2: y ? height - offsetY : offsetY,
                    'stroke-linecap': 'round',
                    'stroke-width': radius,
                }));
        return svg;
    }

    function drop(s, e) {
        if (!s.dropmode.active)
            return;
        if (e.cancelable)
            e.preventDefault();
        unsetPremove(s);
        unsetPredrop(s);
        const piece = s.dropmode.piece;
        if (piece) {
            const position = eventPosition(e);
            const dest = position && getKeyAtDomPos(position, sentePov(s), s.dimensions, s.dom.bounds());
            if (dest) {
                userDrop(s, piece, dest, false, true);
                if (s.dropmode.fromHand) {
                    cancelDropMode(s);
                }
            }
        }
        s.dom.redraw();
    }

    function bindBoard(s, boundsUpdated) {
        const boardEl = s.dom.elements.board;
        if (!s.dom.relative && s.resizable && 'ResizeObserver' in window)
            new ResizeObserver(boundsUpdated).observe(boardEl);
        if (s.viewOnly)
            return;
        // Cannot be passive, because we prevent touch scrolling and dragging of selected elements.
        const onStart = startDragOrDraw(s);
        boardEl.addEventListener('touchstart', onStart, {
            passive: false,
        });
        boardEl.addEventListener('mousedown', onStart, {
            passive: false,
        });
        if (s.disableContextMenu || s.drawable.enabled) {
            boardEl.addEventListener('contextmenu', e => e.preventDefault());
        }
    }
    function bindHands(s) {
        if (!s.hands.enabled || s.viewOnly || !s.dom.elements.handTop || !s.dom.elements.handBot)
            return;
        bindHand(s, s.dom.elements.handBot);
        bindHand(s, s.dom.elements.handTop);
    }
    function bindHand(s, handEl) {
        handEl.addEventListener('mousedown', startDragFromHand(s), { passive: false });
        handEl.addEventListener('touchstart', startDragFromHand(s), {
            passive: false,
        });
        if (s.disableContextMenu || s.drawable.enabled)
            handEl.addEventListener('contextmenu', e => e.preventDefault());
    }
    // returns the unbind function
    function bindDocument(s, boundsUpdated) {
        const unbinds = [];
        // Old versions of Edge and Safari do not support ResizeObserver. Send
        // shogiground.resize if a user action has changed the bounds of the board.
        if (!s.dom.relative && s.resizable && !('ResizeObserver' in window)) {
            unbinds.push(unbindable(document.body, 'shogiground.resize', boundsUpdated));
        }
        if (!s.viewOnly) {
            const onmove = dragOrDraw(s, move, move$1);
            const onend = dragOrDraw(s, end, end$1);
            for (const ev of ['touchmove', 'mousemove'])
                unbinds.push(unbindable(document, ev, onmove));
            for (const ev of ['touchend', 'mouseup'])
                unbinds.push(unbindable(document, ev, onend));
            const onScroll = () => s.dom.bounds.clear();
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
            else if (!s.viewOnly) {
                if (s.dropmode.active && !squareOccupied(s, e))
                    drop(s, e);
                else {
                    cancelDropMode(s);
                    start$1(s, e);
                }
            }
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
    function squareOccupied(s, e) {
        const position = eventPosition(e);
        const dest = position && getKeyAtDomPos(position, sentePov(s), s.dimensions, s.dom.bounds());
        if (dest && s.pieces.has(dest))
            return true;
        return false;
    }
    function getPiece(pieceEl) {
        const role = pieceEl.dataset.role;
        const color = pieceEl.dataset.color;
        if (isRole(role) && isColor(color))
            return { role: role, color: color };
        return;
    }
    function startDragFromHand(s) {
        return e => {
            var _a;
            e.preventDefault();
            const piece = getPiece(e.target);
            if (piece &&
                (s.activeColor === 'both' || s.activeColor === piece.color) &&
                ((_a = s.hands.handMap.get(piece.color)) === null || _a === void 0 ? void 0 : _a.get(piece.role))) {
                dragNewPiece(s, piece, e, true, false);
            }
        };
    }

    // ported from https://github.com/veloce/lichobile/blob/master/src/js/shogiground/view.js
    // in case of bugs, blame @veloce
    function render(s) {
        const asSente = sentePov(s), posToTranslate = s.dom.relative ? posToTranslateRel(s.dimensions) : posToTranslateAbs(s.dimensions, s.dom.bounds()), translate = s.dom.relative ? translateRel : translateAbs, boardEl = s.dom.elements.board, handTopEl = s.dom.elements.handTop, handBotEl = s.dom.elements.handBot, pieces = s.pieces, curAnim = s.animation.current, anims = curAnim ? curAnim.plan.anims : new Map(), fadings = curAnim ? curAnim.plan.fadings : new Map(), curDrag = s.draggable.current, squares = computeSquareClasses(s), samePieces = new Set(), sameSquares = new Set(), movedPieces = new Map(), movedSquares = new Map(); // by class name
        let k, el, pieceAtKey, elPieceName, anim, fading, pMvdset, pMvd, sMvdset, sMvd;
        // walk over all board dom elements, apply animations and flag moved pieces
        el = boardEl.firstChild;
        while (el) {
            k = el.sgKey;
            if (isPieceNode(el)) {
                pieceAtKey = pieces.get(k);
                anim = anims.get(k);
                fading = fadings.get(k);
                elPieceName = el.sgPiece;
                // if piece not being dragged anymore, remove dragging style
                if (el.sgDragging && (!curDrag || curDrag.orig !== k)) {
                    el.classList.remove('dragging');
                    translate(el, posToTranslate(key2pos(k), asSente));
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
                        translate(el, posToTranslate(pos, asSente));
                    }
                    else if (el.sgAnimating) {
                        el.sgAnimating = false;
                        el.classList.remove('anim');
                        translate(el, posToTranslate(key2pos(k), asSente));
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
            else if (isSquareNode(el)) {
                const cn = el.className;
                if (squares.get(k) === cn)
                    sameSquares.add(k);
                else
                    appendValue(movedSquares, cn, el);
            }
            el = el.nextSibling;
        }
        // walk over all squares in current set, apply dom changes to moved squares
        // or append new squares
        for (const [sk, className] of squares) {
            if (!sameSquares.has(sk)) {
                sMvdset = movedSquares.get(className);
                sMvd = sMvdset && sMvdset.pop();
                const translation = posToTranslate(key2pos(sk), asSente);
                if (sMvd) {
                    sMvd.sgKey = sk;
                    translate(sMvd, translation, false);
                }
                else {
                    const squareNode = createEl('square', className);
                    squareNode.sgKey = sk;
                    translate(squareNode, translation, false);
                    boardEl.insertBefore(squareNode, boardEl.firstChild);
                }
            }
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
                    translate(pMvd, posToTranslate(pos, asSente));
                }
                // no piece in moved obj: insert the new piece
                // assumes the new piece is not being dragged
                else {
                    const pieceName = pieceNameOf(p), pieceNode = createEl('piece', pieceName), pos = key2pos(k);
                    pieceNode.sgPiece = pieceName;
                    pieceNode.sgKey = k;
                    if (anim) {
                        pieceNode.sgAnimating = true;
                        pos[0] += anim[2];
                        pos[1] += anim[3];
                    }
                    translate(pieceNode, posToTranslate(pos, asSente));
                    boardEl.appendChild(pieceNode);
                }
            }
        }
        if (s.hands.enabled && handTopEl && handBotEl) {
            updateHand(s, opposite(s.orientation), handTopEl);
            updateHand(s, s.orientation, handBotEl);
        }
        // remove any element that remains in the moved sets
        for (const nodes of movedPieces.values())
            removeNodes(s, nodes);
        for (const nodes of movedSquares.values())
            removeNodes(s, nodes);
    }
    function updateBounds(s) {
        if (s.dom.relative)
            return;
        const asSente = sentePov(s), posToTranslate = posToTranslateAbs(s.dimensions, s.dom.bounds());
        let el = s.dom.elements.board.firstChild;
        while (el) {
            if (isPieceNode(el) && !el.sgAnimating)
                translateAbs(el, posToTranslate(key2pos(el.sgKey), asSente));
            else if (isSquareNode(el))
                translateAbs(el, posToTranslate(key2pos(el.sgKey), asSente), false);
            el = el.nextSibling;
        }
    }
    function isPieceNode(el) {
        return el.tagName === 'PIECE';
    }
    function isSquareNode(el) {
        return el.tagName === 'SQUARE';
    }
    function removeNodes(s, nodes) {
        for (const node of nodes)
            s.dom.elements.board.removeChild(node);
    }
    function pieceNameOf(piece) {
        return `${piece.color} ${piece.role}`;
    }
    function computeSquareClasses(s) {
        var _a, _b, _c, _d;
        const squares = new Map();
        if (s.lastMove && s.highlight.lastMove)
            for (const k of s.lastMove) {
                if (!k.includes('*'))
                    addSquare(squares, k, 'last-move');
            }
        if (s.check && s.highlight.check)
            addSquare(squares, s.check, 'check');
        if (s.selected) {
            addSquare(squares, s.selected, 'selected');
            if (s.movable.showDests) {
                const dests = (_a = s.movable.dests) === null || _a === void 0 ? void 0 : _a.get(s.selected);
                if (dests)
                    for (const k of dests) {
                        addSquare(squares, k, 'move-dest' + (s.pieces.has(k) ? ' oc' : ''));
                    }
                const pDests = s.premovable.dests;
                if (pDests)
                    for (const k of pDests) {
                        addSquare(squares, k, 'premove-dest' + (s.pieces.has(k) ? ' oc' : ''));
                    }
            }
        }
        else if (s.dropmode.active || ((_b = s.draggable.current) === null || _b === void 0 ? void 0 : _b.newPiece)) {
            const piece = s.dropmode.active ? s.dropmode.piece : (_c = s.draggable.current) === null || _c === void 0 ? void 0 : _c.piece;
            if (piece && s.droppable.showDests) {
                const dests = (_d = s.droppable.dests) === null || _d === void 0 ? void 0 : _d.get(piece.role);
                if (dests)
                    for (const k of dests) {
                        addSquare(squares, k, 'move-dest');
                    }
                const pDests = s.predroppable.dests;
                if (pDests && s.turnColor !== piece.color)
                    for (const k of pDests) {
                        addSquare(squares, k, 'premove-dest' + (s.pieces.has(k) ? ' oc' : ''));
                    }
            }
        }
        const premove = s.premovable.current;
        if (premove)
            for (const k of premove)
                addSquare(squares, k, 'current-premove');
        else if (s.predroppable.current)
            addSquare(squares, s.predroppable.current.key, 'current-premove');
        return squares;
    }
    function addSquare(squares, key, klass) {
        const classes = squares.get(key);
        if (classes)
            squares.set(key, `${classes} ${klass}`);
        else
            squares.set(key, klass);
    }
    function makeHandPiece(piece, hands, selected) {
        var _a;
        const pieceEl = createEl('piece', pieceNameOf(piece));
        const num = ((_a = hands.get(piece.color)) === null || _a === void 0 ? void 0 : _a.get(piece.role)) || 0;
        pieceEl.dataset.role = piece.role;
        pieceEl.dataset.color = piece.color;
        pieceEl.dataset.nb = num.toString();
        pieceEl.classList.toggle('selected', selected);
        return pieceEl;
    }
    function updateHand(s, color, handEl) {
        var _a, _b, _c;
        if (handEl.children.length !== s.hands.handRoles.length) {
            handEl.innerHTML = '';
            for (const role of s.hands.handRoles) {
                handEl.appendChild(makeHandPiece({ role: role, color: color }, s.hands.handMap, s.dropmode.active && ((_a = s.dropmode.piece) === null || _a === void 0 ? void 0 : _a.color) === color && s.dropmode.piece.role === role));
            }
        }
        else {
            let piece = handEl.firstChild;
            while (piece) {
                const role = piece.dataset.role;
                const num = ((_b = s.hands.handMap.get(color)) === null || _b === void 0 ? void 0 : _b.get(role)) || 0;
                piece.classList.toggle('selected', s.dropmode.active && ((_c = s.dropmode.piece) === null || _c === void 0 ? void 0 : _c.color) === color && s.dropmode.piece.role === role);
                piece.dataset.nb = num.toString();
                piece = piece.nextSibling;
            }
        }
    }
    function appendValue(map, key, value) {
        const arr = map.get(key);
        if (arr)
            arr.push(value);
        else
            map.set(key, [value]);
    }

    function Shogiground(element, config) {
        const maybeState = defaults();
        configure(maybeState, config || {});
        function redrawAll() {
            const prevUnbind = 'dom' in maybeState ? maybeState.dom.unbind : undefined;
            // compute bounds from existing board element if possible
            // this allows non-square boards from CSS to be handled (for ratio)
            const relative = maybeState.viewOnly && !maybeState.drawable.visible, elements = renderWrap(element, maybeState, relative), bounds = memo(() => elements.board.getBoundingClientRect()), redrawNow = (skipSvg) => {
                render(state);
                if (!skipSvg && elements.svg && elements.customSvg)
                    renderSvg(state, elements.svg, elements.customSvg);
            }, boundsUpdated = () => {
                bounds.clear();
                updateBounds(state);
                if (elements.svg && elements.customSvg)
                    renderSvg(state, elements.svg, elements.customSvg);
            };
            const state = maybeState;
            state.dom = {
                elements,
                bounds,
                redraw: debounceRedraw(redrawNow),
                redrawNow,
                unbind: prevUnbind,
                relative,
            };
            state.drawable.prevSvgHash = '';
            redrawNow(false);
            bindBoard(state, boundsUpdated);
            bindHands(state);
            if (!prevUnbind)
                state.dom.unbind = bindDocument(state, boundsUpdated);
            state.events.insert && state.events.insert(elements);
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
