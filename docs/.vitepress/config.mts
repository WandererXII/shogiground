import { defineConfig } from 'vitepress';

const base = `${(process.env.DOCS_BASE || '/').replace(/\/+$/, '')}/`;
const siteUrl = `${(process.env.DOCS_URL || 'https://wandererxii.github.io/shogiground').replace(/\/+$/, '')}/`;

export default defineConfig({
  title: 'Shogiground',
  description: 'The open source TypeScript shogi board UI used by Lishogi. Interactive demo, setup guide, configuration, and API documentation.',
  lang: 'en',
  base,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}favicon.svg` }],
    ['script', {}, `
      (() => {
        const root = document.documentElement;
        const lock = document.createElement('meta');
        lock.name = 'darkreader-lock';
        const syncDarkReader = () => {
          if (root.classList.contains('dark')) {
            if (!lock.isConnected) document.head.appendChild(lock);
          } else {
            lock.remove();
          }
        };
        syncDarkReader();
        new MutationObserver(syncDarkReader).observe(root, {
          attributes: true,
          attributeFilter: ['class'],
        });
      })();
    `],
  ],
  sitemap: { hostname: siteUrl },
  transformHead({ page }) {
    if (page === '404.md') {
      return [['meta', { name: 'robots', content: 'noindex' }]];
    }
  },
  transformPageData(pageData) {
    pageData.frontmatter.head ??= [];
    if (pageData.relativePath === '404.md') {
      return;
    }

    const path = pageData.relativePath.replace(/index\.md$/, '').replace(/\.md$/, '.html');
    const url = new URL(path, siteUrl).href;
    const title = pageData.frontmatter.titleTemplate === false
      ? pageData.title
      : `${pageData.title} | Shogiground`;
    pageData.frontmatter.head.push(
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:site_name', content: 'Shogiground' }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: pageData.description }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { name: 'twitter:card', content: 'summary' }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: pageData.description }],
    );
  },
  themeConfig: {
    sidebar: [
      { text: 'Documentation', items: [
        { text: 'How to set up', link: '/setup' },
        { text: 'Configuration', link: '/configuration' },
        { text: 'API', link: '/api' },
        { text: 'Styling', link: '/styling' },
      ] },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/WandererXII/shogiground' }],
    search: { provider: 'local' },
    outline: [2, 3],
    footer: { message: 'Released under the GPL-3.0-or-later license.' },
  },
});
