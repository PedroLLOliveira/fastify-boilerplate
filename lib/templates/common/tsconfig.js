export function tsconfigTemplate() {
  return JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'NodeNext',
      outDir: 'dist',
      skipLibCheck: true,
      strict: true,
      esModuleInterop: true
    },
    include: ['src']
  }, null, 2);
}
