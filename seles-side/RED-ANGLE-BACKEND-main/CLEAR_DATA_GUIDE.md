# 🗑️ Clear Previous Data - Complete Guide

## Step-by-Step Instructions

### Step 1: Create Database Backup (⚠️ IMPORTANT - DO THIS FIRST)

This backup saves your current database state, so you can restore it if needed.

```bash
cd /Users/vennimalaimohans/Documents/EchoDigital\ Projects/RED-ANGLE-BACKEND-main

# Make the backup script executable
chmod +x backup-database.sh

# Run the backup
./backup-database.sh
```

**Result:** A backup file will be created in `database-backups/` folder with timestamp.

---

### Step 2: Clear All Database Data

Run the data clearing script to delete all records while keeping the database schema:

```bash
cd /Users/vennimalaimohans/Documents/EchoDigital\ Projects/RED-ANGLE-BACKEND-main

# Run the clear data script (requires Node.js and Prisma setup)
npx ts-node clear-data.ts
```

**What it does:**
- ✅ Deletes all records from all tables
- ✅ Resets auto-increment sequences back to 1
- ✅ Keeps all table schemas intact
- ✅ Logs progress of each table

---

### Step 3: (Optional) Reseed Initial Data

If you have a seed script, run it to populate fresh starter data:

```bash
cd /Users/vennimalaimohans/Documents/EchoDigital\ Projects/RED-ANGLE-BACKEND-main

# Run Prisma seed
npx prisma db seed
```

---

## Alternative: Complete Reset with Migrations

If you want to completely reset including the schema:

```bash
# Reset database (drops everything and reruns all migrations)
npx prisma migrate reset
```

⚠️ **Warning:** This is more aggressive and takes longer. Use only if needed.

---

## Restore from Backup (If Needed)

If something goes wrong, restore your backup:

```bash
# Check available backups
ls -lh database-backups/

# Restore a specific backup
psql postgresql://postgres:Mohan1234@localhost:5432/Redangle < database-backups/Redangle_backup_YYYYMMDD_HHMMSS.sql
```

---

## Quick Reference

| Action | Command |
|--------|---------|
| **Backup Database** | `./backup-database.sh` |
| **Clear Data Only** | `npx ts-node clear-data.ts` |
| **Reseed Data** | `npx prisma db seed` |
| **Complete Reset** | `npx prisma migrate reset` |
| **List Backups** | `ls -lh database-backups/` |

---

## Notes

- ⏱️ Backup process typically takes 10-30 seconds depending on data size
- 🔄 Clearing data is usually very fast (< 5 seconds)
- 💾 Backups are stored in `database-backups/` with timestamp
- 🔑 Database credentials: `postgres:Mohan1234@localhost:5432/Redangle`

---

**Next Step:** Run Step 1 & 2 to backup and clear your data! 🚀
