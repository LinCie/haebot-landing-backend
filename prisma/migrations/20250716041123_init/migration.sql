-- CreateTable
CREATE TABLE "Chat" (
    "id" UUID NOT NULL,
    "chat" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);
