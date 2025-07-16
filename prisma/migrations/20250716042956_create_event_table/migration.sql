-- CreateTable
CREATE TABLE "Event" (
    "id" UUID NOT NULL,
    "event" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);
