import type { DecoratorOptions, IsolatedDeclarationsOptions, JsxOptions, TransformOptions } from "oxc-transform";
import type { CompilerOptions } from "./loose-types.js";
import { defaultUseDefineForClassFields } from "./shared.js";

const normalizeDeclaration = ({
  declaration,
  declarationMap,
  stripInternal,
}: Pick<CompilerOptions, "declaration" | "declarationMap" | "stripInternal">): IsolatedDeclarationsOptions | undefined => {
  if (declaration) {
    return {
      sourcemap: !!declarationMap,
      stripInternal: !!stripInternal,
    };
  }
};

const normalizeDecorator = ({
  experimentalDecorators,
  emitDecoratorMetadata,
  strictNullChecks,
}: Pick<CompilerOptions, "experimentalDecorators" | "emitDecoratorMetadata" | "strictNullChecks">): DecoratorOptions | undefined => {
  const emitDecorator = experimentalDecorators !== null && experimentalDecorators !== undefined;
  if (emitDecorator) {
    return {
      legacy: experimentalDecorators,
      emitDecoratorMetadata: !!(experimentalDecorators && emitDecoratorMetadata),
      ...(strictNullChecks !== null && strictNullChecks !== undefined
        ? { strictNullChecks }
        : {}),
    };
  }
};

const normalizeJSX = ({
  jsx,
  jsxFactory,
  jsxFragmentFactory,
  jsxImportSource,
}: Pick<CompilerOptions, "jsx" | "jsxFactory" | "jsxFragmentFactory" | "jsxImportSource">): "preserve" | JsxOptions | undefined => {
  if (!jsx) {
    return;
  }
  if (jsx === "preserve" || jsx === "react-native") {
    return "preserve";
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
  declaration,
  declarationMap,
  sourceMap,
  jsx,
  jsxFactory,
  jsxFragmentFactory,
  jsxImportSource,
  experimentalDecorators,
  emitDecoratorMetadata,
  useDefineForClassFields,
  stripInternal,
  rewriteRelativeImportExtensions,
  verbatimModuleSyntax,
  strictNullChecks,
}: CompilerOptions): TransformOptions => {
  const useDefine =
    useDefineForClassFields !== null && useDefineForClassFields !== undefined
      ? useDefineForClassFields
      : defaultUseDefineForClassFields(target);
  return {
    target: target?.toLowerCase(),
    sourcemap: !!sourceMap,
    assumptions: {
      // setPublicClassFields + removeClassFieldsWithoutInitializer ≈ useDefineForClassFields: false
      setPublicClassFields: !useDefine,
    },
    jsx: normalizeJSX({ jsx, jsxFactory, jsxFragmentFactory, jsxImportSource }),
    decorator: normalizeDecorator({
      experimentalDecorators,
      emitDecoratorMetadata,
      strictNullChecks,
    }),
    typescript: {
      removeClassFieldsWithoutInitializer: !useDefine,
      onlyRemoveTypeImports: !!verbatimModuleSyntax,
      rewriteImportExtensions: !!rewriteRelativeImportExtensions,
      declaration: normalizeDeclaration({
        declaration,
        declarationMap,
        stripInternal,
      }),
    },
  };
};

export default migrateOptions;
