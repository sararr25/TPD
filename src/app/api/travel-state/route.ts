import { accountRoute, readJson } from '@/lib/server/account-route';
import { readTravel, writeTravel, deleteTravel } from '@/lib/server/user-travel-state';
export const runtime='nodejs';
export function GET(request:Request){return accountRoute(request,id=>readTravel(id));}
export function PUT(request:Request){return accountRoute(request,async id=>{const body=await readJson(request);return writeTravel(id,body.state,body.revision);});}
export function DELETE(request:Request){return accountRoute(request,async id=>{await deleteTravel(id);return {deleted:true};});}
