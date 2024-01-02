FROM node:alpine
COPY . ./code
WORKDIR /code/my-app
RUN npm install
RUN npm run build
WORKDIR /code/
RUN npm install
EXPOSE 80
CMD ["node", "index.js"]
