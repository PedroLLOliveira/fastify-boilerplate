export function entityTemplate() {
  return `export class User {
  constructor(id, email, name) {
    this.id = id; this.email = email; this.name = name;
  }
}
`;
}
