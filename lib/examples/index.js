export async function generateExamples(ctx) {
  const entry = ctx.isTS ? './ts/index.js' : './js/index.js';
  const mod = await import(entry);

  if (typeof mod.generateExamples !== 'function') {
    throw new Error(`[examples] Módulo "${entry}" não exporta generateExamples(ctx).`);
  }

  return mod.generateExamples(ctx);
}
