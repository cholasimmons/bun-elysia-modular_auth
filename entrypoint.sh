#!/bin/sh

echo "🚀 Waiting for database..."
until nc -z -v -w20 $DATABASE_HOST $DATABASE_PORT; do #db 5432
  echo "⏳ Database is not ready - waiting..."
  sleep 5
done
echo "✅ Database is up!"

# Navigate to app directory
cd /usr/src/app

# Ensure dependencies are installed
bun install

# Apply only safe migrations (DOES NOT format database)
echo "🔄 Deploying migrations..."
bunx prisma migrate deploy  # Replace with your migration command

echo "🌱 Seeding database..."
bunx prisma db seed  # Replace with your seed command

echo "🎉 Starting the application..."
exec bun run start  # Start the actual application in prod
