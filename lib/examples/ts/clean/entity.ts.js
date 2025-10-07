export function entityTemplate() {
  return `/**
 * Referência (TypeScript classes):
 * - TypeScript Handbook — Classes: https://www.typescriptlang.org/docs/handbook/2/classes.html
 */

export class User {
  constructor(
    public id: number | string,
    public email: string,
    public name: string | null
  ) {}
}
`;
}
