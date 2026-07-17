import { visit } from 'unist-util-visit';
import type { Root, Code } from 'mdast';

/**
 * Replaces ```mermaid code fences with <Mermaid chart="..."/> JSX elements so
 * diagrams render as SVG instead of highlighted code. The Mermaid component is
 * registered globally in components/mdx.tsx.
 */
export function remarkMermaid() {
  return (tree: Root) => {
    visit(tree, 'code', (node: Code, index, parent) => {
      if (node.lang !== 'mermaid' || parent === undefined || index === undefined) return;

      parent.children[index] = {
        type: 'mdxJsxFlowElement',
        name: 'Mermaid',
        attributes: [{ type: 'mdxJsxAttribute', name: 'chart', value: node.value }],
        children: [],
        // mdast types don't know MDX JSX nodes; the MDX pipeline does.
      } as never;
    });
  };
}
