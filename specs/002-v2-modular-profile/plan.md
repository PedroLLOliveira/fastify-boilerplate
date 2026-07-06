# Plano — V2 Modular Profile

## Design Arquitetural no Gerador (V2 Core)

- Expandiremos a engine V2 introduzida na Spec 001. A nova variante será orquestrada via pacote em `lib/v2/profiles/modular.js`.
- Os conteúdos textuais estáticos dos arquivos serão definidos em `lib/v2/templates/modular/`.
- Compartilharemos configurações fundamentais (`tsconfig.json`, `.eslintrc.cjs`, `.env.example`, `server.ts`) dos templates `minimal` caso a estrutura seja 100% equivalente, evitando duplicação, ou criaremos cópias independentes focadas na legibilidade dos agentes geradores.

## Desenho da Arquitetura Gerada (Modular)

O padrão baseia-se em "feature modules" em vez de separação por "layer" (como MVC tradicional). Cada diretório dentro de `modules/` agrupa as rotas, lógicas e validações estritas àquele domínio:

1. **Routing (`*.route.ts`)**: Fastify plugin registrando verbos HTTP.
2. **Controller (`*.handler.ts`)**: Tradução de inputs e outputs HTTP para chamadas locais.
3. **Business Logic (`*.service.ts`)**: Funções ou classes puras em TypeScript lidando com a lógica agnóstica de transporte HTTP.
4. **Validations (`*.schema.ts`)**: Declaração JSON Schema acoplada ao compilador nativo do Fastify.

Nesta iteração, devido à ausência de persistência, o arquivo `*.service.ts` usará arrays estáticos em memória.

## Garantia de Qualidade

1. **Ausência de Replaces (Regex/String.replace)**: O gerador vai apenas montar um objeto de manifest (onde `src/app.ts` importará estaticamente o `users` e `health`). Ao adicionar esse perfil, mantemos a promessa de não gerar código "imprevisível".
2. **Eval Automática**: O script `tests/v2/eval-modular.test.js` recriará o mesmo fluxo do eval minimal: geração -> dependências -> lint -> build -> tests -> success.

## Riscos

- **Evolução de Múltiplos Profiles**: Manter `minimal` e `modular` pode gerar repetição nos arquivos de configuração se houver atualizações na fundação TS (NodeNext). 
  - *Mitigação*: Uso de variáveis de template compartilhadas na layer V2 para arquivos "globais", ou aceitar a duplicação explícita na pasta `lib/v2/templates` para manter cada profile testável individualmente.
