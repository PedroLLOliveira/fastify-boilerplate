# Matriz de Compatibilidade e Impacto — Runtime Contracts

Este documento cataloga como os contratos de Respostas, Liveness/Readiness e Logs impactam arquitetonicamente cada Profile da V2. A spec não causa incompatibilidade ou retrocesso funcional.

| Profile V2 | Erro 400 (Validation) | Erro 500 (Internal) | `/health` (Liveness) | `/ready` (Readiness) |
|---|---|---|---|---|
| **Minimal** | N/A (Sem schemas no repo) | Padrão (Sem vazamento) | Retorna `200` fixo | Retorna `200` fixo (ausência de dependências) |
| **Modular** | Ativado no `users.schema` | Padrão (Sem vazamento) | Retorna `200` fixo | Retorna `200` fixo (ausência de dependências) |
| **Modular Kysely** | Ativado no `users.schema` | Impede expor `KyselyError` | Retorna `200` fixo | Realiza `SELECT 1`. Retorna `200` ou `503`. |

## Risco Transversal

1. **Atualização do `app.ts`**: Alterar o template base de todos os profiles obriga refatoração cruzada dos mocks de testes dentro do framework gerador da V2.
2. **Backward Compatibility**: A V1 não sofrerá port destes contratos. A introdução explícita de `setErrorHandler` pode impactar desenvolvedores se eles estiverem utilizando as opções antigas de templates. Porém, como a V2 é acionada estritamente pelas flags bypass (ex: `--profile modular`), os motores legados (`bin/cli.js`) estão absolutamente fora de risco material de alteração acidental.
