FROM node:20-bullseye

# Evitar avisos de apt-get durante a construção
ENV DEBIAN_FRONTEND=noninteractive

# Instalar ferramentas úteis para desenvolvimento
RUN apt-get update \
    && apt-get -y install git procps curl wget nano \
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# Configurar o diretório de trabalho
WORKDIR /workspace

# Definir usuário não-root para segurança
USER node

# Configurar um entrypoint mais confiável
ENTRYPOINT ["/bin/bash", "-c"]
CMD ["while sleep 1000; do :; done"]