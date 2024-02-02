import { toJsxRuntime } from "hast-util-to-jsx-runtime";
//@ts-ignore
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import {
  BundledLanguage,
  BundledTheme,
  CodeToHastOptions,
  codeToHast,
} from "shiki";

type Options = Omit<
  CodeToHastOptions<BundledLanguage, BundledTheme>,
  "theme"
> & {
  type?: "full" | "inline";
  log?: boolean;
  removeFirstLine?: boolean;
  removeLastLine?: boolean;
};

type Root = Awaited<ReturnType<typeof codeToHast>>;

function convertToInline(tree: Root) {
  const pre: any = tree.children[0];
  const code = pre.children[0];
  return {
    type: "element",
    tagName: "span",
    children: code.children,
  };
}

export async function codeToJsx(code: string | string[], options: Options) {
  let sourceCode = "";
  if (Array.isArray(code)) {
    sourceCode = code.join("\n");
  } else {
    sourceCode = code;
  }

  let tree: any = await codeToHast(sourceCode, {
    ...options,
    theme: "github-dark-dimmed",
  });

  if (options.type === "inline") {
    tree = convertToInline(tree);

    if (options.removeFirstLine) {
      tree.children.shift();
      tree.children.shift();
    }

    if (options.removeLastLine) {
      tree.children.pop();
    }
  }

  if (options.log) {
    console.log(JSON.stringify(tree, null, 2));
  }

  return toJsxRuntime(tree, {
    Fragment,
    jsx,
    jsxs,
  });
}
