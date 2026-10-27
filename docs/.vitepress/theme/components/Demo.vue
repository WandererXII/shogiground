<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { withBase } from 'vitepress';
import { mountDemo } from '../demo/demo.js';
import '../../../../assets/style.css';
import '../demo/demo.css';

const root = ref(null);
let dispose;
onMounted(() => {
  dispose = mountDemo(root.value);
});
onBeforeUnmount(() => {
  dispose?.();
});
</script>

<template>
  <div ref="root" class="demo">
    <header class="page-header">
      <div>
        <h1>Shogiground</h1>
        <p class="intro">
          Shogiground is a free, open source shogi board UI for the web, written in TypeScript.
          It powers <a href="https://lishogi.org">Lishogi</a>, including its
          <a href="https://lishogi.org/analysis">analysis board</a>,
          <a href="https://lishogi.org/editor">board editor</a>, and
          <a href="https://lishogi.org/training">puzzles</a>.
        </p>
        <p class="intro">
          Add an interactive shogi board to your application with piece moves and drops,
          hands, animations, drawing tools, and SFEN support. Shogiground works with mouse
          and touch input, supports shogi variants, and can be configured and styled to fit
          your application. Your application supplies the game rules.
        </p>
        <p class="intro">
          <a :href="withBase('/setup.html')">Get started</a> ·
          <a :href="withBase('/configuration.html')">Explore the configuration</a> ·
          <a href="https://github.com/WandererXII/shogiground">View on GitHub</a>
        </p>
      </div>
    </header>
    <section aria-labelledby="demo-heading">
      <h2 id="demo-heading">Interactive demo</h2>
      <p class="intro demo-intro">
        Try moving and dropping pieces, drawing on the board, and changing the configuration below.
        To try promotion, move a pawn into the opponent's territory.
      </p>
      <section class="board-stage" aria-label="Interactive board">
        <div id="demo-layout" class="demo-layout">
          <div id="hand-top" class="sg-hand-wrap" aria-label="Top hand"></div>
          <div class="main-board"><div id="board" class="sg-wrap"></div></div>
          <div id="hand-bottom" class="sg-hand-wrap" aria-label="Bottom hand"></div>
        </div>
      </section>
      <div class="board-toolbar" aria-label="Board controls">
        <div class="control-buttons">
          <button id="reset" type="button">Reset demo</button>
        </div>
        <p>Drag to move · Click a hand piece to drop · Right-click to draw</p>
      </div>
    </section>
    <section class="config-editor" aria-labelledby="editor-heading">
      <header class="editor-header">
        <div>
          <p class="eyebrow">Try it live</p>
          <h2 id="editor-heading">Board configuration</h2>
          <p>
            Changes apply to the board above. Arrays, pieces, and maps use JSON.
            Callback signatures are listed for reference.
          </p>
        </div>
        <div class="config-search">
          <label for="config-search">Find a setting</label>
          <input id="config-search" type="search" placeholder="e.g. animation or draggable" autocomplete="off" />
        </div>
      </header>
      <p id="config-status" class="config-status" role="status">Loading configuration…</p>
      <p id="config-empty" hidden>No settings match your search.</p>
      <div id="config-fields"></div>
      <noscript>The interactive board and configuration editor require JavaScript.</noscript>
    </section>
  </div>
</template>
