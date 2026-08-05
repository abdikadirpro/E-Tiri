$PgBin = "C:\Program Files\PostgreSQL\17\bin"
$DataDir = "$env:USERPROFILE\.e-tiri\pgdata"
$LogFile = "$env:USERPROFILE\.e-tiri\pg.log"

& "$PgBin\pg_ctl.exe" -D $DataDir -l $LogFile -o "-p 5433" start
