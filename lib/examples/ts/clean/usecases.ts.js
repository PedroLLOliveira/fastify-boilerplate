export function usecasesTemplate() {
  return `import type { UserRepository, IUserDTO } from '../../domain/repositories/UserRepository';
export const CreateUser = (repo: UserRepository) => ({ execute: (dto: IUserDTO) => repo.create(dto) });
export const UpdateUser = (repo: UserRepository) => ({ execute: (id: string | number, dto: Partial<IUserDTO>) => repo.update(id, dto) });
export const DeleteUser = (repo: UserRepository) => ({ execute: (id: string | number) => repo.delete(id) });
export const GetUser = (repo: UserRepository) => ({ execute: (id: string | number) => repo.get(id) });
export const ListUsers = (repo: UserRepository) => ({ execute: () => repo.list() });
`;
}
