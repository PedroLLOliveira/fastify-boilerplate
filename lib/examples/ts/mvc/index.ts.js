import path from 'path';
import fsp from 'fs/promises';

import { controllerTemplate } from './controller.ts.js';
import { serviceTemplate } from './service.ts.js';
import { modelTemplate } from './model.ts.js';

export async function generate({ root, ext, orm }) {
  const base = path.join(root, 'src');
  const controllersDir = path.join(base, 'controllers');
  const servicesDir = path.join(base, 'services');
  const modelsDir = path.join(base, 'models');

  await fsp.mkdir(controllersDir, { recursive: true });
  await fsp.mkdir(servicesDir, { recursive: true });
  await fsp.mkdir(modelsDir, { recursive: true });

  if (orm !== 'prisma') {
    await fsp.writeFile(path.join(modelsDir, `user.${ext}`), modelTemplate(orm), 'utf8');
  }
  await fsp.writeFile(path.join(servicesDir, `userService.${ext}`), serviceTemplate(orm), 'utf8');
  await fsp.writeFile(path.join(controllersDir, `userController.${ext}`), controllerTemplate(orm), 'utf8');
}
