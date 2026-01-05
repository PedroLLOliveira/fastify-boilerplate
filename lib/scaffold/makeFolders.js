import path from 'path';
import fsp from 'fs/promises';

export async function makeFolders({ root, answers }) {
  const srcDir = path.join(root, 'src');

  await fsp.mkdir(srcDir, { recursive: true });
  await fsp.mkdir(path.join(srcDir, 'plugins'), { recursive: true });
  await fsp.mkdir(path.join(srcDir, 'routes'), { recursive: true });
  await fsp.mkdir(path.join(srcDir, 'config'), { recursive: true });
  await fsp.mkdir(path.join(root, 'tests'), { recursive: true });

  if (answers.architecture === 'mvc') {
    await fsp.mkdir(path.join(srcDir, 'controllers'), { recursive: true });
    await fsp.mkdir(path.join(srcDir, 'services'), { recursive: true });
    await fsp.mkdir(path.join(srcDir, 'models'), { recursive: true });
    return;
  }

  if (answers.architecture === 'clean') {
    await fsp.mkdir(path.join(srcDir, 'domain', 'entities'), { recursive: true });
    await fsp.mkdir(path.join(srcDir, 'domain', 'repositories'), { recursive: true });
    await fsp.mkdir(path.join(srcDir, 'application', 'use-cases'), { recursive: true });
    await fsp.mkdir(path.join(srcDir, 'infra', 'repositories'), { recursive: true });
    await fsp.mkdir(path.join(srcDir, 'infra', 'http'), { recursive: true });
    return;
  }

  // modular
  await fsp.mkdir(path.join(srcDir, 'modules'), { recursive: true });
}
