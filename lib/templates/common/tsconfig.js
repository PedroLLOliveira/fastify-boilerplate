export function tsconfigTemplate() {
  return JSON.stringify(
    {
      compilerOptions: {
        target: "ES2022",

        module: "NodeNext",
        moduleResolution: "NodeNext",

        rootDir: "src",
        outDir: "dist",

        strict: true,
        skipLibCheck: true,
        esModuleInterop: true,
        resolveJsonModule: true,
        forceConsistentCasingInFileNames: true,

        verbatimModuleSyntax: true,

        types: ["node"]
      },
      include: ["src/**/*.ts", "src/types/**/*.d.ts"],
      exclude: ["node_modules", "dist"]
    },
    null,
    2
  );
}
