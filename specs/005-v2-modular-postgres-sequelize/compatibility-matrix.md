# Matriz de Compatibilidade e Políticas de Versionamento

A viabilidade técnica deste profile assenta na conjugação entre modernidade da plataforma (Node 20+) e a estabilidade histórica do ecossistema do Sequelize. A prioridade não é a modernidade superficial de usar bibliotecas bleeding-edge instáveis, mas consolidar fundações estáveis na V2.

## Componentes Fundamentais e Restrições de Versão Suportada

| Componente | Versão Fixa Alvo | Justificativa Analítica e Políticas Lockfile |
|---|---|---|
| Node.js | `>=20.0.0` | Adoção de features nativas, notadamente `module: NodeNext` e as instâncias intrínsecas de Node Test Runner, abolindo bibliotecas extras de testes por exigência V2. |
| Fastify | `^5.0.0` | Garantia de infraestrutura core do V2, contemplando plugins robustos, roteamento isolado por instâncias independentes e schemas atrelados e formatados de validação. |
| Sequelize | `^6.37.3` | **Inflexibilidade Estratégica**. Abstém-se categoricamente do uso da flag `latest`. A release Major 6 é amplamente documentada, consolidada em projetos legado e confere plena compatibilidade de tipos. Aguardar estabilização comercial integral do Sequelize v7 antes de especular quebras arquiteturais. |
| Node-Postgres (`pg`) | `^8.11.5` | Suíte e drive binário/SQL primário padronizado no Boilerplate Kysely e que atende igualmente e nativamente aos drivers declarativos por trás da API do Sequelize. |
| Sequelize CLI | `^6.6.2` | (Dependência `dev`) Gerenciador CLI que dita e abstrai o fluxo autônomo e local de migrations e seeders, sem afetar o core em Runtime. |

## Interoperabilidade de Camada Modular e Spec 004
- **TypeScript:** O profile obedece às regulamentações impostas de interoperabilidade total com TypeScript `NodeNext`. Devido à arquitetura do Sequelize baseada em decoradores (classes) frequentemente desatualizada com certas especificações do Typescript (ES6 Modules), a documentação oficial deverá utilizar definições tipadas estáveis (`Model.init`) endossadas na v6.
- **Spec 004 e API Contract:** O acoplamento rígido de que a transição e adoção tecnológica por trás (Kysely → Sequelize ou vice-versa) **NÃO alterará publicamente os endpoints da API HTTP final**. Contratos (400, 404, 409, 500 genéricos sem log vazado, Health/Ready status 200, Timeout/503 falhos de banco sem freeze do loop de eventos Node) permanecerão completamente indiferenciáveis ao usuário final ou frontend conectado, conferindo portabilidade verdadeira aos perfis Modulares suportados pela plataforma.
