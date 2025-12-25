FROM node:20.10.0-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build
# Ensure questions.json is in dist
RUN cp questions.json dist/

EXPOSE 7000
CMD ["node", "dist/server.js"]
