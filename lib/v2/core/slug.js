// Achado 18: "Meu Projeto!!" virava `name` de package.json sem nenhum
// tratamento. npm tolera (o pacote gerado é sempre `private`), mas o valor
// gravado nunca seria publicável como está. `toPackageName` deriva um nome
// válido; o nome de pasta/exibição (o que o usuário digitou) continua sendo
// usado como está em todo o resto (README, mensagens do CLI).
export function toPackageName(name) {
  const slug = String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'app';
}
