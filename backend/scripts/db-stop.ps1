$PgBin = "C:\Program Files\PostgreSQL\17\bin"
$DataDir = "$env:USERPROFILE\.e-tiri\pgdata"

& "$PgBin\pg_ctl.exe" -D $DataDir stop -m fast
