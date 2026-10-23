import path from "node:path";
import { visit } from "unist-util-visit";

// Turns relative asset paths on MDX components (<Video src="./media/a.webm" />,
// <NotebookCell src="./power.ipynb" />) into bundler imports, so colocated files
// get hashed URLs (media) or are parsed at build time (notebooks).
const ATTRS = new Set(["src", "poster"]);

export default function remarkColocatedAssets() {
  return (tree) => {
    const imports = [];
    visit(tree, ["mdxJsxFlowElement", "mdxJsxTextElement"], (node) => {
      if (!node.name || !/^[A-Z]/.test(node.name)) return;
      for (const attr of [...node.attributes]) {
        if (attr.type !== "mdxJsxAttribute" || !ATTRS.has(attr.name)) continue;
        if (typeof attr.value !== "string" || !attr.value.startsWith("./")) continue;
        const name = `__asset${imports.length}`;
        imports.push({ name, source: attr.value });
        if (attr.name === "src") {
          node.attributes.push({ type: "mdxJsxAttribute", name: "srcName", value: path.posix.basename(attr.value) });
        }
        attr.value = {
          type: "mdxJsxAttributeValueExpression",
          value: name,
          data: { estree: program([{ type: "ExpressionStatement", expression: id(name) }]) },
        };
      }
    });
    if (imports.length === 0) return;
    tree.children.unshift({
      type: "mdxjsEsm",
      value: imports.map((i) => `import ${i.name} from ${JSON.stringify(i.source)}`).join("\n"),
      data: {
        estree: program(
          imports.map((i) => ({
            type: "ImportDeclaration",
            specifiers: [{ type: "ImportDefaultSpecifier", local: id(i.name) }],
            source: { type: "Literal", value: i.source, raw: JSON.stringify(i.source) },
          })),
        ),
      },
    });
  };
}

function id(name) {
  return { type: "Identifier", name };
}

function program(body) {
  return { type: "Program", sourceType: "module", body };
}
