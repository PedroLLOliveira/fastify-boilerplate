import path from 'path';
import fsp from 'fs/promises';

import { entityTemplate } from './entity.js';
import { repoPortTemplate } from './repoPort.js';
import { usecasesTemplate } from './usecases.js';
import { repoImplTemplate } from './repoImpl.js';
import { controllerTemplate } from './controller.js';

export async function generate({ root, ext, orm }) {
  const base = path.join(root, 'src');
  const domain = path.join(base, 'domain');
  const application = path.join(base, 'application');
  const infra = path.join(base, 'infra');

  await fsp.mkdir(path.join(domain, 'entities'), { recursive: true });
  await fsp.mkdir(path.join(domain, 'repositories'), { recursive: true });
  await fsp.mkdir(path.join(application, 'use-cases'), { recursive: true });
  await fsp.mkdir(path.join(infra, 'repositories'), { recursive: true });
  await fsp.mkdir(path.join(infra, 'http'), { recursive: true });

  await fsp.writeFile(path.join(domain, 'entities', `User.${ext}`), entityTemplate(), 'utf8');
  await fsp.writeFile(path.join(domain, 'repositories', `UserRepository.${ext}`), repoPortTemplate(), 'utf8');
  await fsp.writeFile(path.join(application, 'use-cases', `index.${ext}`), usecasesTemplate(), 'utf8');
  await fsp.writeFile(path.join(infra, 'repositories', `UserRepository.${ext}`), repoImplTemplate(orm), 'utf8');
  await fsp.writeFile(path.join(infra, 'http', `users.controller.${ext}`), controllerTemplate(), 'utf8');
}
