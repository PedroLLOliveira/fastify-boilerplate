# Estratégia de testes

## Objetivo

Provar o produto final, não só as funções que concatenam strings. A maior regressão possível é um CLI “verde” que gera uma API que não instala ou não sobe.

## Camadas

### 1. Unitários

Cobrem normalização de argumentos, validação, catálogo de dependencies, resolução de profile e renderizadores puros.

### 2. Contrato de arquivos

Para cada profile, validar caminhos, arquivos essenciais, conteúdo crítico, scripts e ausência de imports quebrados.

### 3. Geração real

Criar um diretório temporário e executar o CLI em modo não interativo. Validar que a árvore foi criada e que a geração é idempotente/rejeita colisões conforme spec.

### 4. Runtime gerado

Após instalar o projeto temporário:

- executar typecheck/build;
- executar testes da própria app;
- iniciar ou instanciar `buildApp()`;
- testar `/health` e a rota exemplo por `app.inject()`;
- fechar recursos corretamente.

### 5. Documentação e referências

Validar que scripts documentados existem, profiles do README pertencem à matriz e IDs de fonte usados em exemplos existem no catálogo.

## Política de cobertura

Cobertura numérica é indicador secundário. A prioridade é cobertura de contrato por profile. Um profile sem geração real não é suportado, mesmo que tenha 100% de cobertura unitária.
