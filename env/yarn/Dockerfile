FROM node:18-alpine

WORKDIR /app

# Install required system dependencies
RUN apk add --no-cache ansible python3 py3-pip openssh-client make sudo git curl jq
RUN apk add --repository http://dl-cdn.alpinelinux.org/alpine/edge/testing github-cli
RUN echo "node ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

# Setup GitHub CLI with PAT
ARG GITHUB_TOKEN
RUN if [ -n "$GITHUB_TOKEN" ]; then \
    token="$GITHUB_TOKEN" && \
    unset GITHUB_TOKEN && \
    echo "$token" | gh auth login --with-token; \
    fi

# Install dependencies first for better caching
COPY ./next-ui/package*.json ./
RUN npm install

# Copy the rest of the application
COPY ./next-ui ./

EXPOSE 3000

# Install Next.js globally
RUN npm install -g next

CMD ["npm", "run", "dev"]