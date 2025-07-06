import type { CompilerOptions } from "./loose-types.js";
import type { JscTarget, ModuleConfig, Options, ReactConfig } from "@swc/core";

const normalizeJSX = ({
  jsx,
  jsxFactory,
  jsxFragmentFactory,
  jsxImportSource,
}: Pick<CompilerOptions, "jsx" | "jsxFactory" | "jsxFragmentFactory" | "jsxImportSource">): ReactConfig | undefined => {
  if (!jsx || jsx === "preserve" || jsx === "react-native") {
    return;
  }
  return {
    runtime: jsx === "react" ? "classic" : "automatic",
    importSource: jsxImportSource,
    pragmaFrag: jsxFragmentFactory,
    pragma: jsxFactory,
    development: jsx === "react-jsxdev",
  };
};

export const migrateOptions = ({
  target,
  sourceMap,
  jsx,
  jsxFactory,
  jsxFragmentFactory,
  jsxImportSource,
  experimentalDecorators,
  emitDecoratorMetadata,
  useDefineForClassFields,
  inlineSourceMap,
  declaration,
  sourceRoot,
  inlineSources,
  module,
  esModuleInterop,
  verbatimModuleSyntax,
  importHelpers,
}: CompilerOptions): Options => {
  let moduleType: ModuleConfig["type"] = "es6";

  switch (module?.toLowerCase()) {
    case "amd":
      moduleType = "amd";
      break;
    case "system":
      moduleType = "systemjs";
      break;
    case "umd":
      moduleType = "umd";
      break;
    case "commonjs":
      moduleType = "commonjs";
      break;
  }

  const emitDecorator = experimentalDecorators !== null && experimentalDecorators !== undefined;
  return {
    module: {
      type: moduleType,
      importInterop: esModuleInterop ? "swc" : "none",
    },
    jsc: {
      target: target?.toLowerCase() as JscTarget,
      externalHelpers: importHelpers,
      parser: {
        syntax: "typescript",
        tsx: !!jsx,
        decorators: emitDecorator,
      },
      transform: {
        decoratorMetadata: emitDecorator && experimentalDecorators && emitDecoratorMetadata,
        decoratorVersion: emitDecorator ? (experimentalDecorators ? "2021-12" : "2022-03") : undefined,
        legacyDecorator: emitDecorator ? experimentalDecorators : undefined,
        useDefineForClassFields,
        verbatimModuleSyntax: verbatimModuleSyntax,
        react: normalizeJSX({ jsx, jsxFactory, jsxFragmentFactory, jsxImportSource }),
      },
      experimental: {
        emitIsolatedDts: declaration,
      },
    },
    sourceMaps: inlineSourceMap ? "inline" : sourceMap,
    sourceRoot: sourceRoot,
    inlineSourcesContent: inlineSources ?? true,
    isModule: module !== "none",
  };
};
