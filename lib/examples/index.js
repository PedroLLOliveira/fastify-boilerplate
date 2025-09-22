export async function generateExamples(ctx) {
  if (ctx.isTS) {
    const mod = await import('./ts/index.js');
    return mod.generateExamples(ctx);
  }
  const mod = await import('./js/index.js');
  return mod.generateExamples(ctx);
}
