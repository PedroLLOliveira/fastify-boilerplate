export function entityTemplate() {
  return `export class User {
  constructor(public id: number | string, public email: string, public name: string | null) {}
}
`;
}
