# Build static files - needs amd64 platform for phantomjs (icons)
FROM --platform=linux/amd64 node:16 AS builder
WORKDIR /srv
RUN yarn global add grunt-cli
COPY . ./
# Install grunt task dependencies
RUN yarn install
# Install editor dependencies
WORKDIR /srv/editor
RUN yarn install --frozen-lockfile
# Build
WORKDIR /srv/editor
RUN grunt editor

# Host editor
FROM --platform=linux/amd64 node:16
COPY --from=builder /srv/editor/package.json /srv/dist/package.json
COPY --from=builder /srv/editor/build /srv/dist
WORKDIR /srv/dist
ENV ICONS_DIR  /srv/icons
RUN yarn install --production
CMD ["node", "index.js"]
EXPOSE 3000
