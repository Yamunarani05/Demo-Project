if (process.env.NODE_ENV === "production") {
  console.error("❌ Prisma dev/reset is blocked in production");
  process.exit(1);
}
