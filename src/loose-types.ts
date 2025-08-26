type NullableOptions<T> = { [P in keyof T]?: T[P] | null };

export type CompilerOptions = NullableOptions<{
  target: string;
  module: string;

  experimentalDecorators: boolean;
  emitDecoratorMetadata: boolean;
  useDefineForClassFields: boolean;
  esModuleInterop: boolean;
  verbatimModuleSyntax: boolean;
  importHelpers: boolean;

  jsx: string;
  jsxFactory: string;
  jsxFragmentFactory: string;
  jsxImportSource: string;

  declaration: boolean;
  declarationMap: boolean;
  stripInternal: boolean;

  sourceMap: boolean;
  sourceRoot: string;
  inlineSourceMap: boolean;
  inlineSources: boolean;
}>;
