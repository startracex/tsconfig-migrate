import type { CompilerOptions } from "./loose-types.js";
import { defaultUseDefineForClassFields } from "./shared.js";
import type { JscConfig, JscTarget, ModuleConfig, Options, ReactConfig } from "@swc/core";

// Present in SWC runtime as `jsc.rewriteRelativeImportExtensions`; @swc/types may lag.
type SwcJscConfig = NonNullable<JscConfig> & {
  rewriteRelativeImportExtensions?: boolean;
};

const normalizeTarget = (target: string | null | undefined): JscTarget | undefined => {
  if (!target) {
    return;
  }
  const normalized = target.toLowerCase();
  return (normalized === "es6" ? "es2015" : normalized) as JscTarget;
};

const normalizeModuleType = (module: string | null | undefined): ModuleConfig["type"] => {
  const moduleLower = module?.toLowerCase();
  switch (moduleLower) {
    case "amd":
    case "commonjs":
    case "umd":
      return moduleLower;
    case "system":
      return "systemjs";
    default:
      return moduleLower?.startsWith("node") ? "nodenext" : "es6";
  }
};

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
    importSource: jsxImportSource ?? undefined,
    pragmaFrag: jsxFragmentFactory ?? undefined,
    pragma: jsxFactory ?? undefined,
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
  rewriteRelativeImportExtensions,
}: CompilerOptions): Options => {
  const emitDecorator = experimentalDecorators !== null && experimentalDecorators !== undefined;
  const useDefine =
    useDefineForClassFields !== null && useDefineForClassFields !== undefined
      ? useDefineForClassFields
      : defaultUseDefineForClassFields(target);

  const jsc: SwcJscConfig = {
    target: normalizeTarget(target),
    externalHelpers: !!importHelpers,
    rewriteRelativeImportExtensions: !!rewriteRelativeImportExtensions,
    parser: {
      syntax: "typescript",
      tsx: !!jsx,
      decorators: emitDecorator,
    },
    transform: {
      decoratorMetadata: !!(emitDecorator && experimentalDecorators && emitDecoratorMetadata),
      decoratorVersion: emitDecorator ? (experimentalDecorators ? "2021-12" : "2023-11") : undefined,
      legacyDecorator: emitDecorator ? experimentalDecorators : undefined,
      useDefineForClassFields: useDefine,
      verbatimModuleSyntax: !!verbatimModuleSyntax,
      react: normalizeJSX({
        jsx,
        jsxFactory,
        jsxFragmentFactory,
        jsxImportSource,
      }),
    },
    experimental: {
      emitIsolatedDts: !!declaration,
      keepImportAssertions: true,
    },
  };

  return {
    module: {
      type: normalizeModuleType(module),
      importInterop: esModuleInterop ? "swc" : "none",
    },
    // Cast only for the undeclared rewriteRelativeImportExtensions field.
    jsc: jsc as Options["jsc"],
    sourceMaps: inlineSourceMap ? "inline" : sourceMap || false,
    sourceRoot: sourceRoot ?? undefined,
    inlineSourcesContent: inlineSources ?? true,
  };
};

export default migrateOptions;
