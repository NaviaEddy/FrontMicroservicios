FROM node:latest AS builder

WORKDIR /app

COPY package*.json ./
COPY vite.config.* ./
COPY tsconfig*.json ./
COPY . .

RUN npm install
RUN npm run build

FROM nginx:latest AS production

COPY --from=builder /app/dist /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
