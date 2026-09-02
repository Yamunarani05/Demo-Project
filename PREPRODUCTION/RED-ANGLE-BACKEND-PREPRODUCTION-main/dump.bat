set PGPASSWORD=password
"C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" -h localhost -p 6000 -U postgres -d "Redangle-Preproduction" -s -O -x -f dump.sql
