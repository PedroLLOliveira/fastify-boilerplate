import path from 'path';
import fsp from 'fs/promises';

export async function makeFolders({ root, answers, ext }) {
  const srcDir = path.join(root, 'src');
  const pluginDir = path.join(srcDir, 'plugins');
  const routesDir = path.join(srcDir, 'routes');
  const configDir = path.join(srcDir, 'config');

  await fsp.mkdir(srcDir, { recursive: true });
  await fsp.mkdir(pluginDir, { recursive: true });
  await fsp.mkdir(routesDir, { recursive: true });
  await fsp.mkdir(configDir, { recursive: true });

  if (answers.architecture === 'mvc') {
    await fsp.mkdir(path.join(srcDir, 'controllers'), { recursive: true });
    await fsp.mkdir(path.join(srcDir, 'services'), { recursive: true });
    await fsp.mkdir(path.join(srcDir, 'models'), { recursive: true });
  } else if (answers.architecture === 'clean') {
    await fsp.mkdir(path.join(srcDir, 'domain/entities'), { recursive: true });
    await fsp.mkdir(path.join(srcDir, 'domain/repositories'), { recursive: true });
    await fsp.mkdir(path.join(srcDir, 'application/use-cases'), { recursive: true });
    await fsp.mkdir(path.join(srcDir, 'infra/db'), { recursive: true });
    await fsp.mkdir(path.join(srcDir, 'infra/http'), { recursive: true });
    await fsp.mkdir(path.join(srcDir, 'infra/repositories'), { recursive: true });
    await fsp.mkdir(path.join(srcDir, 'main'), { recursive: true });
  } else if (answers.architecture === 'modular') {
    await fsp.mkdir(path.join(srcDir, 'modules/example'), { recursive: true });
  }
}
