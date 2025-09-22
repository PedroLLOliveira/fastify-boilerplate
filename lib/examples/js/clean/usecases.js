export function usecasesTemplate() {
  return `export const CreateUser = (repo) => ({ execute: (dto) => repo.create(dto) });
export const UpdateUser = (repo) => ({ execute: (id, dto) => repo.update(id, dto) });
export const DeleteUser = (repo) => ({ execute: (id) => repo.delete(id) });
export const GetUser = (repo) => ({ execute: (id) => repo.get(id) });
export const ListUsers = (repo) => ({ execute: () => repo.list() });
`;
}
