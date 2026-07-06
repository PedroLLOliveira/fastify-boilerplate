# Decisões de Design — V2 Modular Postgres Sequelize

## 1. Captura Tipada de Conflito de Unicidade
- **Decisão:** Em oposição a perfis v1 ou arquiteturas relaxadas que lançavam exceções literais propagando os pacotes do ORM ao Fastify global, estipulamos que a rotina injetada no repositório (`users.repository.ts`) deve conter blocos interseptores. Quando houver interceptação do estrito `UniqueConstraintError` emitido pelo Sequelize, lançará um novo objeto em TypeScript, como `DomainConflictError`.
- **Justificativa:** O framework Kysely possui suas tipologias para erros sintáticos de SQL, enquanto o Sequelize empacota de forma abstrata as constraints. Proteger a rota central globalizando a tipagem estabiliza a adoção plena do **Spec 004**, erradicando comparações via strings frágeis que costumam estourar perante atualizações idiomáticas de driver.

## 2. Delegação Isolada do Sequelize CLI
- **Decisão:** Não implementaremos uma rotina migratória imperativa programada internamente (como o bypass exigido em scripts manuais do Kysely). Retornaremos à padronização com `.sequelizerc` e a pasta tradicional de migrations/seeds acessíveis apenas via pacote dev `sequelize-cli`.
- **Justificativa:** Usuários adeptos deste ORM já possuem uma memória muscular robusta orientada pela documentação oficial da ferramenta, além disso, evita duplicação estrutural desnecessária no motor do nosso gerador para tentar replicar comandos complexos (ex: generators e seeders já estabelecidos na base Sequelize).

## 3. Banimento da Interface ORM Genérica (Ausência de Herança Polimórfica)
- **Decisão:** Abster-se-á inteiramente de conceber interfaces-base transmutáveis ou abstratas na sintaxe para acoplar Repositórios. Isto implica que `UserRepository` da pasta Kysely diferirá em implantação escrita do `UserRepository` do pacote Sequelize, apesar de as assinaturas lógicas permanecerem análogas aos Controllers.
- **Justificativa:** Solicitado explicitamente pelos regulamentos de constituição e pelos limites do escopo. Tentar criar um "super ORM base layer" sobrecarregaria a arquitetura e criaria gargalos complexos nas tipagens TypeScript (onde Sequelize atua muito dependente do Decorator/Class/Model e o Kysely favorece declarações funcionais baseadas em Interfaces SQL puras). Aceitar replicação semântica dos repositórios nas saídas garante modularidade máxima e facilidade de descarte e manutenção independente para cada tecnologia injetada sem estragar adjacências.
