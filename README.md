My take on using HTMX to create a responsive, dynamic web applications.
WIP

# Installation

```
bun install
```

# Running development server

```
bun dev
```

# Docker

### Production
Build the production image:
```bash
docker build -t thewall:prod .
```

Run the container (mounting the database for persistence):
```bash
# Create a file for the db if it doesn't exist
touch thewall.db

# Run with volume mount & env vars
docker run -p 3000:3000 \
  -v $(pwd)/thewall.db:/usr/src/app/thewall.db \
  -e DATABASE_NAME=thewall.db \
  thewall:prod
```

### Development
Build the dev image:
```bash
docker build -f Dockerfile.dev -t thewall:dev .
```

Run with hot-reloading (mounting source code):
```bash
docker run -p 3000:3000 \
  -v $(pwd):/app \
  -v /app/node_modules \
  thewall:dev
```
