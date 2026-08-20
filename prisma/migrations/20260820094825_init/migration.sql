-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_configs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'BAIC BJ30e',
    "model" TEXT NOT NULL DEFAULT 'BJ30e Hybrid Dual-Motor',
    "tankCapacityLitres" DOUBLE PRECISION NOT NULL DEFAULT 52.0,
    "fullRangeBenchmarkKm" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'Rs',
    "distanceUnit" TEXT NOT NULL DEFAULT 'km',
    "volumeUnit" TEXT NOT NULL DEFAULT 'L',
    "theme" TEXT NOT NULL DEFAULT 'system',
    "authEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vehicleConfigId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "pricePerLitre" DOUBLE PRECISION NOT NULL,
    "litresFueled" DOUBLE PRECISION NOT NULL,
    "currentOdometer" DOUBLE PRECISION NOT NULL,
    "afterFuelingOdometer" DOUBLE PRECISION,
    "gasStation" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fuel_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_trips" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vehicleConfigId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalOdometer" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pre_trip_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vehicleConfigId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentOdometer" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pre_trip_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_audit_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "analyzedEntries" INTEGER NOT NULL,
    "economyRating" TEXT NOT NULL,
    "avgEconomyKmPerL" DOUBLE PRECISION NOT NULL,
    "recommendations" TEXT[],
    "rawResponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_audit_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "vehicle_configs_userId_idx" ON "vehicle_configs"("userId");

-- CreateIndex
CREATE INDEX "fuel_entries_userId_date_idx" ON "fuel_entries"("userId", "date" DESC);

-- CreateIndex
CREATE INDEX "fuel_entries_vehicleConfigId_idx" ON "fuel_entries"("vehicleConfigId");

-- CreateIndex
CREATE INDEX "daily_trips_userId_date_idx" ON "daily_trips"("userId", "date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "daily_trips_vehicleConfigId_date_key" ON "daily_trips"("vehicleConfigId", "date");

-- CreateIndex
CREATE INDEX "pre_trip_logs_userId_date_idx" ON "pre_trip_logs"("userId", "date" DESC);

-- CreateIndex
CREATE INDEX "pre_trip_logs_vehicleConfigId_idx" ON "pre_trip_logs"("vehicleConfigId");

-- CreateIndex
CREATE INDEX "ai_audit_reports_userId_createdAt_idx" ON "ai_audit_reports"("userId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_configs" ADD CONSTRAINT "vehicle_configs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_entries" ADD CONSTRAINT "fuel_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_entries" ADD CONSTRAINT "fuel_entries_vehicleConfigId_fkey" FOREIGN KEY ("vehicleConfigId") REFERENCES "vehicle_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_trips" ADD CONSTRAINT "daily_trips_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_trips" ADD CONSTRAINT "daily_trips_vehicleConfigId_fkey" FOREIGN KEY ("vehicleConfigId") REFERENCES "vehicle_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pre_trip_logs" ADD CONSTRAINT "pre_trip_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pre_trip_logs" ADD CONSTRAINT "pre_trip_logs_vehicleConfigId_fkey" FOREIGN KEY ("vehicleConfigId") REFERENCES "vehicle_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_audit_reports" ADD CONSTRAINT "ai_audit_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
