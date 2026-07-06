// Minimal ESM resolve hook that maps the project's tsconfig path aliases to
// real files so the PDF component can be imported outside Next's bundler.
// Chained AFTER ts-node/esm so it rewrites specifiers before transpilation.
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve as pathResolve } from "node:path";

const ROOT = process.cwd();
const ALIASES = [
  ["@/", "src/"],
  ["@pages/", "pages/"],
  ["@api/", "pages/api/"],
  ["@components/", "src/components/"],
  ["@data/", "src/data/"],
  ["@styles/", "src/styles/"],
];
const EXTS = ["", ".tsx", ".ts", ".jsx", ".js", "/index.tsx", "/index.ts"];

export async function resolve(specifier, context, nextResolve) {
  for (const [prefix, target] of ALIASES) {
    if (specifier.startsWith(prefix)) {
      const base = pathResolve(ROOT, target + specifier.slice(prefix.length));
      for (const ext of EXTS) {
        if (existsSync(base + ext)) {
          // Delegate so ts-node's load hook still transpiles the file, but force
          // the ESM format flag — the repo's package.json has no "type":"module"
          // so ts-node would otherwise mark these project files as CommonJS.
          const resolved = await nextResolve(pathToFileURL(base + ext).href, context);
          return { ...resolved, format: "module", shortCircuit: true };
        }
      }
    }
  }
  return nextResolve(specifier, context);
}
