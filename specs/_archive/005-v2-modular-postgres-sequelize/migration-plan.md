# Plano de Migração e Convergência (V1 -> V2) para Usuários Sequelize

A natureza geradora (Scaffold) implica que usuários que basearam seus projetos legados na V1 (fortemente inclinada ao Sequelize) e desejam adotar a infraestrutura arquitetural rigorosa da V2 terão que efetuar refatorações estruturais manuais e pontuais dentro de seus projetos ativos. Este documento elucida as ações esperadas que mapeiam do formato flexível da V1 para o encapsulamento restrito da V2.

## Passo 1: Delegação da Inicialização e Otimização de Pool de Dados
A V1 por vezes permitia instâncias soltas (globais) ou conexões não declarativas sendo chamadas arbitrariamente do núcleo em handlers.
**Adequação V2:**
- Extirpar injeções de Models instanciados globalmente e abraçar a padronização central do plugin `src/db/database.ts`.
- Mover inteiramente os controles do pool de conexões aos gatilhos de ciclo de vida atrelados a um Plugin restrito (`src/plugins/db-sequelize.ts`), repassando o controle do encerramento incondicional de soquetes nativamente ao disparo `onClose` das premissas do Fastify.

## Passo 2: Ocultação Integral dos Models em Handlers
Na V1, muitas rotas controladoras importavam as Entidades (Models) e injetavam verbos brutos, como `User.findOne(...)`.
**Adequação V2:**
- Proibir estritamente essa conduta. Remova imports e métodos de banco da sua controladora.
- Separe em camadas sequenciais: introduza instâncias de coordenação e delegação nas sub-pastas por unidade semântica (`users.service.ts`) operando a validação ou cruzamentos e passe a responsabilidade material inteiramente ao provedor restrito (`users.repository.ts`). Esta é a única classe validada para importar de fato os Models do Sequelize.

## Passo 3: Adaptação ao Global Error Handler Restrito
A Spec 004 baniu hardcoded strings. Projetos V1 falhavam capturando blocos impuros de string `catch (err) { if(err.message.includes('unique constraint')) return 409...}`.
**Adequação V2:**
- Nas consultas do Repositório (e estritamente nele), envelopar a ação com detecção em bloco try/catch sobre a estrutura base nativa: `if (error instanceof UniqueConstraintError)`.
- Realizar a intercepção e, sem vazar a referência crua, instanciar uma conversão para um objeto Error da sua API semântica (Ex: `DomainConflictError`).
- Configurar o `setErrorHandler` na raiz principal (que agora fica em `app.ts`) para simplesmente formatar `if (error.name === 'DomainConflictError')` ou afim, retornando uma payload imaculada estruturada padronizando a resposta perante a quebra de contrato restrita sem interrogar o nome dos módulos SQL.
