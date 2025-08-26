import type { DecoratorOptions, IsolatedDeclarationsOptions, JsxOptions, TransformOptions } from "oxc-transform";
import type { CompilerOptions } from "./loose-types.js";

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
}: Pick<CompilerOptions, "experimentalDecorators" | "emitDecoratorMetadata">): DecoratorOptions | undefined => {
  const emitDecorator = experimentalDecorators !== null && experimentalDecorators !== undefined;
  if (emitDecorator) {
    return {
      legacy: experimentalDecorators,
      emitDecoratorMetadata: !!(experimentalDecorators && emitDecoratorMetadata),
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

const migrate = ({
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
}: CompilerOptions): TransformOptions => {
  return {
    target: target?.toLowerCase(),
    sourcemap: !!sourceMap,
    sourceType: "module",
    assumptions: {
      setPublicClassFields: !useDefineForClassFields,
    },
    jsx: normalizeJSX({ jsx, jsxFactory, jsxFragmentFactory, jsxImportSource }),
    decorator: normalizeDecorator({
      experimentalDecorators,
      emitDecoratorMetadata,
    }),
    typescript: {
      removeClassFieldsWithoutInitializer: !useDefineForClassFields,
      rewriteImportExtensions: true,
      declaration: normalizeDeclaration({
        declaration,
        declarationMap,
        stripInternal,
      }),
    },
  };
};

export default migrate;
