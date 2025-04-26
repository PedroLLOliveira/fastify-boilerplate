FROM node:18-slim

WORKDIR /workspace

# Copiar arquivos de dependência primeiro
COPY package*.json ./

# Atualizar npm e instalar dependências
RUN npm install -g npm@latest && npm install

# Copiar código restante
COPY . .

# Criar usuário não-root
RUN useradd -m node
USER node

EXPOSE 3000

CMD ["npm", "run", "dev"]
