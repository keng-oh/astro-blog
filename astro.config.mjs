// @ts-check
import { readdirSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import { rehypeWrapCodeBlocks } from './src/lib/rehype-wrap-code-blocks.mjs';
import { remarkWikiLinks } from './src/lib/remark-wiki-links.mjs';

const blogSlugs = readdirSync('./src/content/blog')
  .filter((file) => file.endsWith('.md'))
  .map((file) => file.replace(/\.md$/, ''));

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  markdown: {
    syntaxHighlight: false,
    processor: unified({
      remarkPlugins: [
        [
          remarkWikiLinks,
          {
            slugs: blogSlugs,
            hrefTemplate: (slug) => `/blog/${slug}`,
            className: 'wikilink',
          },
        ],
      ],
      rehypePlugins: [rehypeWrapCodeBlocks],
    }),
  },

  integrations: [react()],
});