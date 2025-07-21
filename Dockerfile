# Use the official Bun image
FROM oven/bun:1 as base

# Set the working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application
RUN bun run build

# Expose the port
EXPOSE 3020

# Start the application using Vite preview mode
CMD ["bun", "run", "preview"]
