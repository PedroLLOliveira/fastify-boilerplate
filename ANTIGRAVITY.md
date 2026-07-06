# Uso no Antigravity

Este repositório não depende de uma configuração proprietária do Antigravity. A portabilidade vem do `AGENTS.md`, das skills padronizadas e das specs versionadas.

## Ritual de uma sessão

1. Crie um artefato de plano antes de alterar código.
2. Leia `AGENTS.md`, a constituição e a skill relevante.
3. Para uma feature ou correção material, trabalhe em uma spec dedicada.
4. Mantenha o trabalho em uma missão por vez: descoberta, implementação ou validação.
5. Gere evidência verificável: resultado de testes, árvore gerada, resposta de `/health`, snapshots ou logs sem dados sensíveis.
6. Antes de finalizar, faça uma convergência entre spec, plano, tarefas e mudança real.

## Papéis sugeridos no Agent Manager

- **Analista de contrato**: compara CLI, templates, dependências e documentação.
- **Implementador**: realiza uma tarefa pequena já especificada.
- **Verificador**: executa evals, identifica regressões e não altera produto sem uma tarefa explícita.
- **Documentador técnico**: atualiza exemplos, referências e ADRs.

Não rode vários agentes alterando o mesmo perfil ou o mesmo conjunto de templates simultaneamente. Paralelize investigação, documentação e validação; serialize mudanças em arquivos compartilhados.

## Segurança operacional

Use aprovação humana para qualquer ação que tenha efeito externo: publicação NPM, release no GitHub, deploy, acesso a credenciais, alteração de CI, execução de migrações ou exclusão de arquivos.
