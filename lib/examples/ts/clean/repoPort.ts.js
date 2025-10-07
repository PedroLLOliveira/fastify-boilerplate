export function repoPortTemplate() {
  return `/**
 * Porta do domínio (Repository) — alinhada ao padrão de camadas / Clean Architecture.
 * Para fundamentos de classes/TS: https://www.typescriptlang.org/docs/handbook/2/classes.html
 */

export interface IUserDTO { email: string; name?: string | null }

export abstract class UserRepository {
  abstract list(): Promise<any[]>;
  abstract get(id: string | number): Promise<any | null>;
  abstract create(dto: IUserDTO): Promise<any>;
  abstract update(id: string | number, dto: Partial<IUserDTO>): Promise<any | null>;
  abstract delete(id: string | number): Promise<number>;
}
`;
}
