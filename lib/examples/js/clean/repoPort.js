export function repoPortTemplate() {
  return `export class UserRepository {
  list() { throw new Error('not implemented'); }
  get(_id) { throw new Error('not implemented'); }
  create(_dto) { throw new Error('not implemented'); }
  update(_id, _dto) { throw new Error('not implemented'); }
  delete(_id) { throw new Error('not implemented'); }
}
`;
}
