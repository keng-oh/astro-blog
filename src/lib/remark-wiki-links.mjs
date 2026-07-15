import { visit } from 'unist-util-visit';

const WIKILINK_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

/**
 * Minimal Obsidian-style [[wikilink]] / [[target|alias]] support.
 *
 * Written in-house because @portaljs/remark-wiki-link is incompatible with
 * the micromark v4 / mdast-util-from-markdown v2 toolchain Astro 7 ships
 * (its micromark extension corrupts the parser's enter/exit stack and
 * crashes the build). Operating on the mdast text nodes after the fact
 * sidesteps that class of bug entirely.
 *
 * Unresolved targets (no matching slug) fall back to plain text rather
 * than a dead link.
 */
export function remarkWikiLinks({ slugs = [], hrefTemplate = (slug) => `/${slug}`, className = 'wikilink' } = {}) {
  const slugSet = new Set(slugs);

  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index == null || !node.value.includes('[[')) return;

      WIKILINK_RE.lastIndex = 0;
      const value = node.value;
      const newNodes = [];
      let lastIndex = 0;
      let match;

      while ((match = WIKILINK_RE.exec(value))) {
        const [fullMatch, rawTarget, rawAlias] = match;
        const matchStart = match.index;

        if (matchStart > lastIndex) {
          newNodes.push({ type: 'text', value: value.slice(lastIndex, matchStart) });
        }

        const hashIndex = rawTarget.indexOf('#');
        const targetSlug = (hashIndex === -1 ? rawTarget : rawTarget.slice(0, hashIndex)).trim();
        const heading = hashIndex === -1 ? '' : rawTarget.slice(hashIndex);
        const label = (rawAlias ?? rawTarget).trim();

        if (slugSet.has(targetSlug)) {
          newNodes.push({
            type: 'link',
            url: `${hrefTemplate(targetSlug)}${heading}`,
            data: { hProperties: { className: [className] } },
            children: [{ type: 'text', value: label }],
          });
        } else {
          newNodes.push({ type: 'text', value: label });
        }

        lastIndex = matchStart + fullMatch.length;
      }

      if (newNodes.length === 0) return;

      if (lastIndex < value.length) {
        newNodes.push({ type: 'text', value: value.slice(lastIndex) });
      }

      parent.children.splice(index, 1, ...newNodes);
      return index + newNodes.length;
    });
  };
}
