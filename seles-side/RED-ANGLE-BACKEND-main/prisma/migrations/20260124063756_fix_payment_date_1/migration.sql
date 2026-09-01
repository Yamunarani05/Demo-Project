-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "event_id" INTEGER,
ALTER COLUMN "payment_date" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;
