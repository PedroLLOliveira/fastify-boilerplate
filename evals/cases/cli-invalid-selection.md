# Eval — seleção inválida

## Propósito

Garantir que o CLI não “corrija” silenciosamente uma escolha para outra combinação sem informar contrato e resultado ao usuário.

## Casos

1. profile inexistente;
2. profile experimental sem flag de aceite;
3. Node fora da faixa suportada;
4. diretório destino não vazio sem `--force`;
5. opções mutuamente incompatíveis;
6. modo não interativo sem argumentos obrigatórios.

## Assertions

- saída explica o motivo e oferece próximo passo claro;
- código de saída é diferente de 0;
- nenhum projeto parcialmente inválido permanece no destino;
- nenhuma opção é trocada silenciosamente por outra.
