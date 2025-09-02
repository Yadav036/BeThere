/*
  Warnings:

  - You are about to drop the `EventInvite` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."EventInvite" DROP CONSTRAINT "EventInvite_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EventInvite" DROP CONSTRAINT "EventInvite_invitedUserId_fkey";

-- DropTable
DROP TABLE "public"."EventInvite";
