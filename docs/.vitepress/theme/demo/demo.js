import { Shogiground } from '../../../../src/shogiground.ts';
import { fields } from './config-fields.js';

// Each mounted component owns its board, editor, and pending updates.
export function mountDemo(root) {
  const startingBoard = 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL';
  const boardElement = root.querySelector('#board');
  const layout = root.querySelector('#demo-layout');
  const status = root.querySelector('#config-status');
  const editor = root.querySelector('#config-fields');
  const controls = new Map();
  const promotions = {
    pawn: 'tokin',
    lance: 'promotedlance',
    knight: 'promotedknight',
    silver: 'promotedsilver',
    bishop: 'horse',
    rook: 'dragon',
  };
  let ground;

  function inPromotionZone(key, color) {
    const rank = key.charCodeAt(key.length - 1) - 97;
    return color === 'sente' ? rank < 3 : rank >= ground.state.dimensions.ranks - 3;
  }

  function forceMovePromotion(orig, dest) {
    const piece = ground.state.pieces.get(orig);
    if (!piece) return false;
    const rank = dest.charCodeAt(dest.length - 1) - 97;
    const remaining = piece.color === 'sente' ? rank : ground.state.dimensions.ranks - 1 - rank;
    return ((piece.role === 'pawn' || piece.role === 'lance') && remaining === 0) ||
      (piece.role === 'knight' && remaining < 2);
  }

  function createGround() {
    return Shogiground(
      {
        sfen: { board: startingBoard, hands: 'Pp' },
        promotion: {
          promotesTo: role => promotions[role],
          unpromotesTo: role => Object.keys(promotions).find(key => promotions[key] === role),
          movePromotionDialog: (orig, dest) => {
            const piece = ground.state.pieces.get(orig);
            return !!piece && !!promotions[piece.role] && !forceMovePromotion(orig, dest) &&
              (inPromotionZone(orig, piece.color) || inPromotionZone(dest, piece.color));
          },
          forceMovePromotion,
        },
        events: {
          change: sync,
          select: sync,
          unselect: sync,
          pieceSelect: sync,
          pieceUnselect: sync,
        },
        drawable: { onChange: () => queueMicrotask(sync) },
      },
      {
        board: boardElement,
        hands: {
          top: root.querySelector('#hand-top'),
          bottom: root.querySelector('#hand-bottom'),
        },
      },
    );
  }

  function read(path) {
    if (path === 'sfen.board') return ground.getBoardSfen();
    if (path === 'sfen.hands') return ground.getHandsSfen();
    return path.split('.').reduce((value, key) => value?.[key], ground.state);
  }

  function format(value, type) {
    if (value === undefined) return type === 'enum' ? 'undefined' : '';
    if (value instanceof Map) value = Object.fromEntries(value);
    return type === 'json' ? JSON.stringify(value) : String(value);
  }

  function patch(path, value) {
    return path
      .split('.')
      .reverse()
      .reduce((child, key) => ({ [key]: child }), value);
  }

  function square(value) {
    const match = typeof value === 'string' && /^(1[0-6]|[1-9])([a-p])$/.exec(value);
    return (
      !!match &&
      Number(match[1]) <= ground.state.dimensions.files &&
      match[2].charCodeAt(0) - 96 <= ground.state.dimensions.ranks
    );
  }

  function piece(value) {
    return (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      typeof value.role === 'string' &&
      value.role.length > 0 &&
      ['sente', 'gote'].includes(value.color)
    );
  }

  function requireValue(condition, message) {
    if (!condition) throw new Error(message);
  }

  function validateBoard(value) {
    const rows = value.split('/');
    requireValue(rows.length >= 1 && rows.length <= 16, 'Use 1–16 SFEN ranks separated by /.');
    let files;
    for (const row of rows) {
      const tokens = row.match(/(?:\d+|\+[plnsbrPLNSBR]|[plnsgbrkPLNSGBRK])/g) || [];
      requireValue(
        tokens.join('') === row && tokens.length > 0,
        'Use standard SFEN pieces and empty-square counts from 1 to 16.',
      );
      requireValue(
        tokens.every(
          (token) => !/^\d/.test(token) || (/^[1-9]\d*$/.test(token) && Number(token) <= 16),
        ),
        'Empty-square counts must be between 1 and 16.',
      );
      const width = tokens.reduce((sum, token) => sum + (/^\d/.test(token) ? Number(token) : 1), 0);
      requireValue(
        width >= 1 && width <= 16 && (files === undefined || width === files),
        'Every SFEN rank must have the same width, between 1 and 16.',
      );
      files = width;
    }
  }

  function validateHands(value) {
    requireValue(
      value === '-' || /^(?:[1-9]\d*[plnsgbrkPLNSGBRK]|[plnsgbrkPLNSGBRK])+$/.test(value),
      'Use hand SFEN such as Pp, 2R3p, or - for empty hands.',
    );
    for (const match of value.matchAll(/(\d+)/g)) {
      requireValue(Number(match[1]) <= 999, 'The demo limits each hand count to 999.');
    }
  }

  function parse(field, text) {
    const value = text.trim();
    if (field.type === 'boolean') return value === 'true';
    if (field.type === 'enum') return value === 'undefined' ? undefined : value;
    if (field.type === 'number') {
      requireValue(
        value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0,
        'Enter a non-negative number.',
      );
      return Number(value);
    }
    if (field.path === 'sfen.board') {
      validateBoard(value);
      return value;
    }
    if (field.path === 'sfen.hands') {
      validateHands(value);
      return value;
    }
    if (field.path === 'selected') {
      requireValue(
        value === '' || square(value),
        'Use a square inside the current board, or leave blank to clear.',
      );
      return value || undefined;
    }
    if (
      [
        'checks',
        'lastDests',
        'lastPiece',
        'selectedPiece',
        'movable.dests',
        'droppable.dests',
      ].includes(field.path) &&
      value === ''
    )
      return undefined;
    let parsed;
    if (field.path === 'checks' && ['sente', 'gote'].includes(value)) parsed = value;
    else {
      try {
        parsed = JSON.parse(value);
      } catch {
        throw new Error('Enter valid JSON. Use double quotes around strings.');
      }
    }
    // Avoid arbitrary object keys in the recursive config merge.
    function safeKeys(object) {
      if (!object || typeof object !== 'object') return;
      for (const key of Object.keys(object)) {
        requireValue(
          !['__proto__', 'constructor', 'prototype'].includes(key),
          'This object key is not supported.',
        );
        safeKeys(object[key]);
      }
    }
    safeKeys(parsed);
    if (field.path === 'squareRatio') {
      requireValue(
        Array.isArray(parsed) &&
          parsed.length === 2 &&
          parsed.every((n) => Number.isFinite(n) && n > 0),
        'Use two positive numbers, e.g. [11,12].',
      );
    } else if (['lastPiece', 'selectedPiece'].includes(field.path)) {
      requireValue(
        piece(parsed),
        'Use a piece, e.g. {"role":"pawn","color":"sente"}, or leave blank to clear.',
      );
    } else if (['hands.roles', 'highlight.checkRoles'].includes(field.path)) {
      requireValue(
        Array.isArray(parsed) &&
          parsed.every((role) => typeof role === 'string' && role.length > 0) &&
          new Set(parsed).size === parsed.length,
        'Use an array of unique role names, e.g. ["rook","pawn"].',
      );
    } else if (field.path === 'checks') {
      requireValue(
        typeof parsed === 'boolean' ||
          ['sente', 'gote'].includes(parsed) ||
          (Array.isArray(parsed) && parsed.every(square)),
        'Use true, false, sente, gote, or a JSON array of squares. Leave blank to clear.',
      );
    } else if (field.path === 'lastDests') {
      requireValue(
        Array.isArray(parsed) && parsed.every(square),
        'Use a JSON array of squares, e.g. ["7g","7f"].',
      );
    } else if (field.path.endsWith('.dests')) {
      requireValue(
        parsed && typeof parsed === 'object' && !Array.isArray(parsed),
        'Use a JSON object, e.g. {"7g":["7f"]}. Leave blank to clear.',
      );
      for (const [key, dests] of Object.entries(parsed)) {
        requireValue(
          field.path === 'movable.dests' ? square(key) : /^(sente|gote) .+$/.test(key),
          'Map keys must be board squares, or piece names such as sente pawn for drops.',
        );
        requireValue(
          Array.isArray(dests) && dests.every(square),
          'Each destination must be an array of squares inside the current board.',
        );
      }
      return new Map(Object.entries(parsed));
    } else if (field.path === 'drawable.squares') {
      requireValue(
        Array.isArray(parsed) &&
          parsed.every((item) => item && square(item.key) && typeof item.className === 'string'),
        'Use highlights such as [{"key":"5e","className":"selected"}].',
      );
    } else if (['drawable.shapes', 'drawable.autoShapes'].includes(field.path)) {
      requireValue(
        Array.isArray(parsed) &&
          parsed.every(
            (shape) =>
              shape &&
              (square(shape.orig) || piece(shape.orig)) &&
              (square(shape.dest) || piece(shape.dest)) &&
              typeof shape.brush === 'string' &&
              (shape.piece === undefined ||
                (piece(shape.piece) &&
                  (shape.piece.scale === undefined ||
                    (Number.isFinite(shape.piece.scale) && shape.piece.scale > 0)))) &&
              (shape.description === undefined || typeof shape.description === 'string'),
          ),
        'Use shapes such as [{"orig":"7g","dest":"7f","brush":"primary"}].',
      );
      requireValue(
        parsed.every((shape) => shape.customSvg === undefined),
        'Custom SVG must be supplied in application code; it cannot be edited here.',
      );
    }
    return parsed;
  }

  function updateLayout() {
    const { dimensions, squareRatio, hands, scaleDownPieces } = ground.state;
    layout.style.setProperty(
      '--board-ratio',
      (dimensions.files * squareRatio[0]) / (dimensions.ranks * squareRatio[1]),
    );
    layout.style.setProperty('--board-files', dimensions.files);
    layout.style.setProperty('--board-column', `${dimensions.files}fr`);
    layout.style.setProperty('--square-width', squareRatio[0]);
    layout.style.setProperty('--square-height', squareRatio[1]);
    layout.dataset.inlineHands = String(hands.inlined);
    layout.dataset.scaleDown = String(scaleDownPieces);
  }

  function sync() {
    if (!ground) return;
    updateLayout();
    for (const { field, input } of controls.values()) {
      if (input.getAttribute('aria-invalid') === 'true') continue;
      if (document.activeElement !== input || input.tagName === 'SELECT')
        input.value = format(read(field.path), field.type);
    }
  }

  function announce() {
    const count = [...controls.values()].filter(
      ({ input }) => input.getAttribute('aria-invalid') === 'true',
    ).length;
    status.textContent = count
      ? `${count} invalid ${count === 1 ? 'value' : 'values'}. The board keeps the last valid settings.`
      : 'Live · Changes apply automatically';
    status.classList.toggle('has-error', count > 0);
  }

  function buildEditor() {
    const groups = new Map();
    for (const field of fields) {
      let section = groups.get(field.group);
      if (!section) {
        section = document.createElement('details');
        section.className = 'config-group';
        section.open = field.group === 'Position and board';
        const summary = document.createElement('summary');
        summary.textContent = field.group;
        section.append(summary);
        groups.set(field.group, section);
        editor.append(section);
      }
      const row = document.createElement('div');
      row.className = 'config-row';
      row.dataset.search = `${field.path} ${field.description} ${field.group}`.toLowerCase();
      const id = `config-${field.path.replaceAll('.', '-')}`;
      const description = document.createElement('div');
      description.className = 'field-description';
      const label = document.createElement(field.type === 'callback' ? 'code' : 'label');
      label.textContent = field.path;
      if (field.type !== 'callback') label.htmlFor = id;
      const help = document.createElement('p');
      help.id = `${id}-help`;
      help.textContent = field.description;
      description.append(label, help);
      const value = document.createElement('div');
      value.className = 'field-value';
      if (field.type === 'callback') {
        const signature = document.createElement('code');
        signature.className = 'callback-signature';
        signature.textContent = field.signature;
        const note = document.createElement('p');
        note.className = 'field-note';
        note.textContent = 'Set this function in your application code. It cannot be modified here.';
        value.append(signature, note);
      } else {
        const input = document.createElement(
          ['boolean', 'enum'].includes(field.type) ? 'select' : 'input',
        );
        input.id = id;
        input.name = field.path;
        input.setAttribute('aria-describedby', `${id}-help ${id}-error`);
        if (input.tagName === 'SELECT') {
          for (const optionValue of field.options || ['true', 'false']) {
            const option = document.createElement('option');
            option.value = optionValue;
            option.textContent = optionValue === 'undefined' ? 'undefined (disabled)' : optionValue;
            input.append(option);
          }
        } else {
          input.type = field.type === 'number' ? 'number' : 'text';
          input.autocomplete = 'off';
          input.spellcheck = false;
          if (field.type === 'number') {
            input.min = '0';
            input.step = 'any';
          }
          if (field.type === 'json') input.placeholder = 'JSON value';
        }
        const error = document.createElement('p');
        error.id = `${id}-error`;
        error.className = 'field-error';
        let timer;
        function apply() {
          clearTimeout(timer);
          timer = undefined;
          try {
            const parsed = parse(field, input.value);
            ground.set(patch(field.path, parsed));
            input.removeAttribute('aria-invalid');
            error.textContent = '';
            sync();
          } catch (e) {
            input.setAttribute('aria-invalid', 'true');
            error.textContent = e.message;
          }
          announce();
        }
        input.addEventListener('change', apply);
        if (input.tagName === 'INPUT')
          input.addEventListener('input', () => {
            clearTimeout(timer);
            timer = setTimeout(apply, 200);
          });
        input.addEventListener('blur', () => {
          if (timer !== undefined) apply();
          if (!input.hasAttribute('aria-invalid')) input.value = format(read(field.path), field.type);
        });
        controls.set(field.path, {
          field,
          input,
          error,
          cancel: () => {
            clearTimeout(timer);
            timer = undefined;
          },
        });
        value.append(input, error);
        if (field.type === 'json') {
          const note = document.createElement('p');
          note.className = 'field-note';
          note.textContent = field.path.endsWith('.dests')
            ? 'JSON object → Map. Example: ' +
              (field.path === 'movable.dests' ? '{"7g":["7f"]}' : '{"sente pawn":["5e"]}')
            : field.path === 'checks'
              ? 'true / false, sente / gote, or ["5a"]. Blank clears.'
              : 'Use JSON syntax; see Configuration for examples.';
          value.append(note);
        }
      }
      row.append(description, value);
      section.append(row);
    }
    root.querySelector('#config-search').addEventListener('input', (event) => {
      const query = event.target.value.trim().toLowerCase();
      let visible = 0;
      for (const section of groups.values()) {
        let matches = 0;
        for (const row of section.querySelectorAll('.config-row')) {
          row.hidden = !row.dataset.search.includes(query);
          if (!row.hidden) matches++;
        }
        section.hidden = matches === 0;
        if (query && matches) section.open = true;
        visible += matches;
      }
      root.querySelector('#config-empty').hidden = visible !== 0;
    });
  }

  buildEditor();
  ground = createGround();
  sync();
  announce();

  root.querySelector('#reset').addEventListener('click', () => {
    for (const control of controls.values()) {
      control.cancel();
      control.input.removeAttribute('aria-invalid');
      control.error.textContent = '';
    }
    ground.destroy();
    ground = createGround();
    sync();
    announce();
  });

  return () => {
    for (const control of controls.values()) control.cancel();
    ground.destroy();
    ground = undefined;
  };
}
