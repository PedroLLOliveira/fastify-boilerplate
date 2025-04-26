// templates/mvc/src/server.js
import 'dotenv/config';
import app from './app.js';

// ORM_INJECTION_POINT

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await app.listen({ port });
    console.log(`Server listening on ${app.server.address().port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();