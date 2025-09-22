export function repoPortTemplate() {
  return `export interface IUserDTO { email: string; name?: string | null }
export abstract class UserRepository {
  abstract list(): Promise<any[]>;
  abstract get(id: string | number): Promise<any | null>;
  abstract create(dto: IUserDTO): Promise<any>;
  abstract update(id: string | number, dto: Partial<IUserDTO>): Promise<any | null>;
  abstract delete(id: string | number): Promise<number>;
}
`;
}
