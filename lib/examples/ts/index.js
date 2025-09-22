import path from 'path';
import fsp from 'fs/promises';
import { usersRouteTemplate } from './routes.ts.js';
import * as MVC from './mvc/index.ts.js';
import * as CLEAN from './clean/index.ts.js';
import * as MODULAR from './modular/index.ts.js';

export async function generateExamples({ root, answers, ext }) {
  const srcDir = path.join(root, 'src');
  const routesDir = path.join(srcDir, 'routes');

  // rota users (TS tipado)
  await fsp.writeFile(path.join(routesDir, `users.${ext}`), usersRouteTemplate(answers.architecture), 'utf8');

  if (answers.architecture === 'mvc') {
    await MVC.generate({ root, ext, orm: answers.orm });
  } else if (answers.architecture === 'clean') {
    await CLEAN.generate({ root, ext, orm: answers.orm });
  } else {
    await MODULAR.generate({ root, ext, orm: answers.orm });
  }

  // injeta import e register de users no server.ts
  const serverFile = path.join(srcDir, `server.${ext}`);
  let code = await fsp.readFile(serverFile, 'utf8');
  if (!code.includes(`./routes/users.${ext}`)) {
    code = code.replace(
      `import health from './routes/health.${ext}';`,
      `import health from './routes/health.${ext}';\nimport users from './routes/users.${ext}';`
    );
  }
  if (!code.includes(`app.register(users`)) {
    code = code.replace(
      `app.register(hello, { prefix: '/api' });`,
      `app.register(hello, { prefix: '/api' });\napp.register(users, { prefix: '/api' });`
    );
  }
  await fsp.writeFile(serverFile, code, 'utf8');
}
