// Apply only the additive proposal on #56/#57; never print connection values.
import {readFileSync} from 'node:fs';
import {neon} from '@neondatabase/serverless';
try{
 if(!process.env.DATABASE_URL)throw Object.assign(new Error(),{code:'not_configured'});
 const sql=neon(process.env.DATABASE_URL);
 const tables=await sql.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('collection','collection_item','user_passport')");
 if(tables.length!==3)throw Object.assign(new Error(),{code:'unexpected_project_schema'});
 await sql.query(readFileSync(new URL('../db/proposals/2026-10-27-travel-state.sql',import.meta.url),'utf8'));
 const columns=await sql.query("SELECT column_name,data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='user_travel_state' ORDER BY ordinal_position");
 const constraints=await sql.query("SELECT contype,pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conrelid='public.user_travel_state'::regclass");
 console.log(JSON.stringify({table:'user_travel_state',columns,constraints}));
}catch(error){console.error(`Travel migration failed: ${error?.code||'unknown'}`);process.exitCode=1;}
