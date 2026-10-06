// node --env-file=.env.local db/migrate.mjs
import { readFileSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL_UNPOOLED)
const ddl = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8')
// ponytail: one-shot DDL split on ';', switch to a migration tool once the schema starts changing
await sql.transaction(ddl.split(';').map((s) => s.trim()).filter(Boolean).map((s) => sql.query(s)))
console.log('schema applied')
