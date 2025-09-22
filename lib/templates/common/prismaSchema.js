export function prismaSchemaTemplate(db) {
  const provider =
    db === 'postgres' ? 'postgresql' :
    db === 'mysql' ? 'mysql' :
    db === 'mongodb' ? 'mongodb' : 'sqlite';

  const datasource = `datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}`;

  const generator = `generator client {
  provider = "prisma-client-js"
}`;

  const model =
    db === 'mongodb'
      ? `model User {
  id    String @id @default(auto()) @map("_id") @db.ObjectId
  email String @unique
  name  String?
}`
      : `model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String?
}`;

  return `${datasource}

${generator}

${model}
`;
}
