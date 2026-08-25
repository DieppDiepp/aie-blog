# Frontend image: build Next.js, then run its standalone server output.
FROM node:20-slim AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
# standalone output bundles only what the server needs.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# Article MDX files: not bundled by the standalone output, read at runtime.
COPY --from=builder /app/content ./content
EXPOSE 3000
CMD ["node", "server.js"]
