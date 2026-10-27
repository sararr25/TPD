import 'server-only';
import { db } from './user-passport.ts';
import { DiscoveryError } from './qloo.ts';
import { validateTravel, emptyTravel } from '../travel-state.ts';
export async function readTravel(userId:string) {
  const rows=await db().query('SELECT state, revision FROM user_travel_state WHERE user_id=$1',[userId]);
  return rows.length ? {state:validateTravel(rows[0].state),revision:Number(rows[0].revision)} : {state:emptyTravel(),revision:0};
}
export async function writeTravel(userId:string,value:unknown,revision:unknown) {
  let state;
  try { state=validateTravel(value); } catch { throw new DiscoveryError('invalid_request',400); }
  if (!Number.isSafeInteger(revision) || (revision as number)<0) throw new DiscoveryError('invalid_request',400);
  if (revision !== 0) {
    const updated=await db().query('UPDATE user_travel_state SET state=$2::jsonb,revision=revision+1,updated_at=now() WHERE user_id=$1 AND revision=$3 RETURNING revision',[userId,JSON.stringify(state),revision]);
    if(!updated.length)throw new DiscoveryError('travel_conflict',409);
    return {revision:Number(updated[0].revision)};
  }
  const rows=await db().query('INSERT INTO user_travel_state (user_id,state,revision) VALUES ($1,$2::jsonb,1) ON CONFLICT (user_id) DO NOTHING RETURNING revision',[userId,JSON.stringify(state)]);
  if(!rows.length)throw new DiscoveryError('travel_conflict',409);
  return {revision:Number(rows[0].revision)};
}
export async function deleteTravel(userId:string) { await db().query('DELETE FROM user_travel_state WHERE user_id=$1',[userId]); }
