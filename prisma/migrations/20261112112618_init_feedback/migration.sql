-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "services" TEXT[],
    "servicesOther" TEXT,
    "experienceSeamless" TEXT NOT NULL,
    "experienceComments" TEXT,
    "staffRating" TEXT NOT NULL,
    "bookAgain" TEXT NOT NULL,
    "wouldRefer" TEXT NOT NULL,
    "otherComments" TEXT,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);
