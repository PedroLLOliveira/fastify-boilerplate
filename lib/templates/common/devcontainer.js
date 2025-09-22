export function devContainerTemplate() {
  return `{
  "name": "Fastify Team",
  "build": { "dockerfile": "Dockerfile" },
  "forwardPorts": [3000],
  "postCreateCommand": "npm install",
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode"
      ]
    }
  }
}
`;
}

export function devContainerDockerfile() {
  return `FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bullseye
WORKDIR /workspaces/app
`;
}
