# Decisões — V2 Runtime Contracts

## 1. Fastify Native Errors vs. Classes Abstratas Customizadas
**Contexto**: Muitos projetos Node instituem estruturas de erros monstruosas como `AppError`, `DomainError`, herdando a classe global do V8.
**Decisão**: Usaremos exclusivamente os códigos padrão retornados nativamente pelo Validation Engine do Fastify (Ajv) e um `setErrorHandler` global interceptando classes puras do Node (`Error`).
**Motivo**: Mantém os profiles pequenos e leves. O desenvolvedor é quem deve construir complexidade de Domínio caso queira (via bibliotecas como `http-errors`), sem herdar um monolito opinativo do boilerplate inicial.

## 2. Separação Estrita de Sondas K8s (Health vs Ready)
**Contexto**: Maioria dos times agrupa testes de banco dentro da rota `/health`.
**Decisão**: Será instituído duas sondas:
- Liveness `/health`: Nunca atinge dependências externas. Responde rápido para não sofrer kill do orquestrador.
- Readiness `/ready`: Avalia bancos de dados e serviços dependentes (apenas nos profiles de persistência) para remover a rota de carga momentaneamente caso falhe (503).
**Motivo**: Melhor resiliência nativa. Uma falha de rede temporária no PostgreSQL não deve desligar o conteiner inteiro, apenas tirá-lo do load balancer provisoriamente.

## 3. Logs Seguros Nativos sem Dependências de Terceiros
**Contexto**: Logger é vital. Pode expor payloads sensíveis de APIs ou falhas SQL perigosas em headers (`DATABASE_URL`).
**Decisão**: Usa-se o framework Pino embutido no core do Fastify (`{ logger: true }`).
**Motivo**: Pino gera saídas JSON já formatadas por default, extremamente eficientes. O `setErrorHandler` irá suprimir vazamentos capturando a stack e escrevendo apenas em `request.log.error(error)` mantendo o `reply.send()` limpo com uma Generic Error Message para o client.
