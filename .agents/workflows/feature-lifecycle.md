# Workflow: feature lifecycle

## Entrada

Uma solicitação descrevendo uma feature, um bug ou uma alteração de perfil.

## Etapas

### 1. Discovery

- localizar contratos existentes;
- mapear o fluxo: CLI → profile → dependencies → templates → app gerada → docs;
- verificar se a solicitação é mudança funcional, correção, documentação ou decisão de produto;
- abrir ADR se a decisão alterar política de suporte.

### 2. Specification

Criar a spec com cenários em linguagem observável. Exemplo:

> Dado `--architecture modular --persistence none`, quando o usuário executa o CLI em um diretório vazio, então a aplicação gerada instala, passa no typecheck e responde `200` em `/health`.

### 3. Planning

Definir arquivos, compatibilidade, migração, riscos e testes. Não escrever “adicionar suporte a X” sem explicitar quais capabilities, dependências e arquivos serão gerados.

### 4. Implementation

Executar tarefas pequenas. A cada alteração de template, verificar seu impacto no `package.json`, imports e árvore.

### 5. Verification

Executar a eval do profile e registrar o resultado no `acceptance.md`.

### 6. Convergence

Comparar spec, plano, tarefas, docs e comportamento real. Itens ausentes viram novas tarefas, não promessas vagas.
