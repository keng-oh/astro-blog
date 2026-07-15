import { visit } from 'unist-util-visit';

export function rehypeWrapCodeBlocks() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'pre' || !parent || index == null) return;

      const codeNode = node.children.find(
        (child) => child.type === 'element' && child.tagName === 'code'
      );
      const classNames = codeNode?.properties?.className ?? [];
      const languageClass = classNames.find(
        (name) => typeof name === 'string' && name.startsWith('language-')
      );
      const language = languageClass ? languageClass.slice('language-'.length) : '';

      parent.children[index] = {
        type: 'element',
        tagName: 'figure',
        properties: { className: ['code'] },
        children: [
          {
            type: 'element',
            tagName: 'figcaption',
            properties: { className: ['codehead'] },
            children: [
              {
                type: 'element',
                tagName: 'span',
                properties: {},
                children: [{ type: 'text', value: language }],
              },
            ],
          },
          node,
        ],
      };
    });
  };
}
