# Build static files - needs amd64 platform for phantomjs (icons)
FROM --platform=linux/amd64 node:16 AS builder
WORKDIR /srv
RUN yarn global add grunt-cli
COPY . ./
# Install grunt task dependencies
RUN yarn install
# Install editor dependencies
WORKDIR /srv/editor
RUN yarn install
# Build
RUN grunt

# Host static files
FROM nginx
COPY --from=builder /srv/dist /usr/share/nginx/html
EXPOSE 80
