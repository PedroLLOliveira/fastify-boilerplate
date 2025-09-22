export function usersRouteTemplate(arch) {
  const importPath =
    arch === 'mvc' ? "../controllers/userController"
    : arch === 'clean' ? "../infra/http/users.controller"
    : "../modules/users";

  return `import * as handlers from '${importPath}.js';

export default async function users(fastify, _opts) {
  fastify.get('/users', handlers.listUsers(fastify));
  fastify.get('/users/:id', handlers.getUser(fastify));
  fastify.post('/users', handlers.createUser(fastify));
  fastify.put('/users/:id', handlers.updateUser(fastify));
  fastify.delete('/users/:id', handlers.deleteUser(fastify));
}
`;
}
