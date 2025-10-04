export function tsconfigTemplate() {
  return JSON.stringify(
    {
      compilerOptions: {
        target: "ES2022",
        module: "commonjs",
        moduleResolution: "node",
        rootDir: "src",
        outDir: "dist",
        strict: true,
        skipLibCheck: true,
        esModuleInterop: true,
        resolveJsonModule: true,
        forceConsistentCasingInFileNames: true,
        types: ["node"]
      },
      include: ["src/**/*.ts", "src/types/**/*.d.ts"],
      exclude: ["node_modules", "dist"]
    },
    null,
    2
  );
}