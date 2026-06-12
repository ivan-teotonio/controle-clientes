# ============================
# Estágio 1: base
# ============================
FROM node:22-alpine AS base


# ============================
# Estágio 2: builder
# Instala dependências e gera o build de produção
# ============================
FROM base AS builder

# libc6-compat: necessário porque o Alpine usa musl em vez de glibc,
# e algumas dependências nativas (ex: Prisma engines) esperam glibc
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copia apenas os arquivos de dependências primeiro.
# Assim, se o código mudar mas as dependências não, o Docker
# reaproveita essa camada do cache e não reinstala tudo.
COPY package.json package-lock.json* ./
RUN npm ci

# Copia o restante do código (schema do Prisma, src, etc.)
COPY . .

# Gera o Prisma Client antes do build — o projeto usa
# @prisma/adapter-pg e o client precisa existir em ./app/generated/prisma
RUN npx prisma generate

# Gera o build de produção (output: "standalone" no next.config.ts)
RUN npm run build


# ============================
# Estágio 3: production
# Imagem final, leve, sem ferramentas de build
# ============================
FROM base AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Cria um usuário sem privilégios de root.
# Rodar como root dentro do container é um risco de segurança.
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copia apenas os artefatos finais do builder — nada de
# node_modules de dev, código-fonte ou ferramentas de build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Garante que o usuário nextjs tenha permissão de escrita
# (necessário para o cache/prerender do Next.js)
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next

USER nextjs

EXPOSE 3000

# O output "standalone" gera um server.js próprio,
# não precisa de "next start" nem do node_modules completo
CMD ["node", "server.js"]