import path from 'path';
import fsp from 'fs/promises';
import { usersRouteTemplate } from './routes.js';
import * as MVC from './mvc/index.js';
import * as CLEAN from './clean/index.js';
import * as MODULAR from './modular/index.js';

function injectIntoMarkers(code, { importLine, registerLine }) {
  const importMarker = '// @gen:imports';
  const routesMarker = '// @gen:routes';

  // Imports
  if (!code.includes(importLine)) {
    if (!code.includes(importMarker)) {
      throw new Error(`Marker não encontrado no server: ${importMarker}`);
    }
    code = code.replace(importMarker, `${importLine}\n${importMarker}`);
  }

  // Routes
  if (!code.includes(registerLine)) {
    if (!code.includes(routesMarker)) {
      throw new Error(`Marker não encontrado no server: ${routesMarker}`);
    }
    code = code.replace(routesMarker, `    ${registerLine}\n\n    ${routesMarker}`);
  }

  return code;
}

export async function generateExamples({ root, answers, ext }) {
  const srcDir = path.join(root, 'src');
  const routesDir = path.join(srcDir, 'routes');

  // 1) Gera rota users (JS)
  await fsp.writeFile(
    path.join(routesDir, `users.${ext}`),
    usersRouteTemplate(answers.architecture),
    'utf8'
  );

  // 2) Gera árvore de exemplo pela arquitetura
  if (answers.architecture === 'mvc') {
    await MVC.generate({ root, ext, orm: answers.orm });
  } else if (answers.architecture === 'clean') {
    await CLEAN.generate({ root, ext, orm: answers.orm });
  } else {
    await MODULAR.generate({ root, ext, orm: answers.orm });
  }

  // 3) Injeta import + register no server.js (via markers)
  const serverFile = path.join(srcDir, `server.${ext}`);
  let code = await fsp.readFile(serverFile, 'utf8');

  // No server JS base (writeBaseFiles), imports são com extensão explícita (.js)
  const importLine = `import users from './routes/users.${ext}';`;
  const registerLine = `await app.register(users, { prefix: '/api' });`;

  code = injectIntoMarkers(code, { importLine, registerLine });

  await fsp.writeFile(serverFile, code, 'utf8');
}
