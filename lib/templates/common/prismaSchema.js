export function prismaSchemaTemplate(db) {
  const provider =
    db === 'postgres' ? 'postgresql'
    : db === 'mysql' ? 'mysql'
    : db === 'mongodb' ? 'mongodb'
    : 'sqlite';

  const datasource = `datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}`;

  const generator = `generator client {
  provider = "prisma-client-js"
}`;

  // Mantemos o model mínimo e mapeamos para "users" para ficar coerente
  // com os exemplos (Sequelize usa tableName: 'users', etc.)
  const model =
    db === 'mongodb'
      ? `model User {
  id    String  @id @default(auto()) @map("_id") @db.ObjectId
  email String  @unique
  name  String?

  @@map("users")
}`
      : `model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?

  @@map("users")
}`;

  return `${datasource}

${generator}

${model}
`;
}
