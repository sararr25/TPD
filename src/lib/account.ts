import { MESSAGES, type Selection } from "./discovery-client";
import type { Answers } from "./quiz";
import { FEEDBACK_KEY, parseFeedback, type Feedback } from "./feedback";

// Browser side of the signed-in-only API (E06): Passport, hidden places,
// collections and account deletion. Hidden places also live in this browser,
// so guests can use "Not for me" too.
async function call<T>(path: string, method: "GET" | "PUT" | "POST" | "DELETE", body?: object, owner?: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...(owner ? { "X-Beesyde-User": owner } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Your account could not be reached. Please try again.");
  }
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      MESSAGES[data.error] || "Your account could not be updated. Please try again.",
    );
  return data as T;
}

export async function loadAccountPassport(): Promise<Selection[] | null> {
  return (await call<{ passport: Selection[] | null }>("/api/passport", "GET")).passport;
}
export async function saveAccountPassport(passport: Selection[], owner?: string) {
  await call("/api/passport", "PUT", { passport: passport.map((s) => s.token) }, owner);
}
export async function deleteAccountPassport(owner?:string) {
  if(!owner)throw new Error("Wait for your account before deleting its data.");
  await call("/api/passport", "DELETE",undefined,owner);
}

export async function loadAccountQuiz(): Promise<Answers | null> {
  return (await call<{ answers: Answers | null }>("/api/quiz", "GET")).answers;
}
export async function saveAccountQuiz(answers: Answers, owner?: string) {
  await call("/api/quiz", "PUT", { answers }, owner);
}
export async function deleteAccountQuiz(owner?:string) {
  if(!owner)throw new Error("Wait for your account before deleting its data.");
  await call("/api/quiz", "DELETE",undefined,owner);
}

export type Hidden = { id: string; name: string };
export const HIDDEN_KEY = "beesyde-hidden-v1";
export function readHidden(raw: string | null): Hidden[] {
  try {
    const a: unknown = JSON.parse(raw || "null");
    if (!Array.isArray(a)) return [];
    const seen = new Set<string>();
    return a
      .filter(
        (h): h is Hidden =>
          !!h &&
          typeof h.id === "string" &&
          /^[0-9a-f-]{36}$/i.test(h.id) &&
          typeof h.name === "string" &&
          h.name.length <= 200 &&
          !seen.has(h.id) &&
          !!seen.add(h.id),
      )
      .slice(0, 100);
  } catch {
    return [];
  }
}
export const hiddenKey=(owner?:string)=>owner?`${HIDDEN_KEY}:${owner}`:HIDDEN_KEY;
function localHidden(owner?:string) {
  return readHidden(localStorage.getItem(hiddenKey(owner)));
}
function storeHidden(list: Hidden[],owner?:string) {
  localStorage.setItem(hiddenKey(owner), JSON.stringify(list));
}
// This browser's hidden places, plus the account's when signed in.
export async function loadHidden(signedIn: boolean,owner?:string): Promise<Hidden[]> {
  const local = localHidden(signedIn?owner:undefined);
  if (!signedIn) return local;
  const { hidden } = await call<{ hidden: Hidden[] }>("/api/hidden", "GET",undefined,owner);
  const ids = new Set(hidden.map((h) => h.id));
  return [...hidden, ...local.filter((h) => !ids.has(h.id))];
}
export async function hidePlace(place: Hidden, token: string, signedIn: boolean,owner?:string) {
  storeHidden([...localHidden(signedIn?owner:undefined).filter((h) => h.id !== place.id), place],signedIn?owner:undefined);
  if (signedIn) await call("/api/hidden", "POST", { place: token },owner);
}
export async function unhidePlace(id: string, signedIn: boolean,owner?:string) {
  storeHidden(localHidden(signedIn?owner:undefined).filter((h) => h.id !== id),signedIn?owner:undefined);
  if (signedIn) await call("/api/hidden", "DELETE", { id },owner);
}

export type CollectionItem = {
  placeId: string;
  name: string;
  address: string | null;
  lat: number | null;
  lon: number | null;
  note: string | null;
  savedAt: string;
};
export type Collection = { id: string; name: string; createdAt: string; items: CollectionItem[] };
export async function loadCollections(owner?: string): Promise<Collection[]> {
  return (await call<{ collections: Collection[] }>("/api/collections", "GET", undefined, owner)).collections;
}
export async function saveToCollection(collection: string, token: string, note: string, owner?: string) {
  await call("/api/collections", "POST", { collection, place: token, note }, owner);
}
export async function removeFromCollection(collectionId: string, placeId: string, owner?: string) {
  await call("/api/collections", "DELETE", { collectionId, placeId }, owner);
}
export async function deleteCollection(collectionId: string, owner?: string) {
  await call("/api/collections", "DELETE", { collectionId }, owner);
}

export async function deleteAccount(owner?:string) {
  if(!owner)throw new Error("Wait for your account before deleting its data.");
  await call("/api/account", "DELETE",undefined,owner);
}

// Gradual feedback (D3): always in this browser; signed in, the account copy
// wins and an empty account adopts this browser's votes.
export const feedbackKey=(owner?:string)=>owner?`${FEEDBACK_KEY}:${owner}`:FEEDBACK_KEY;
function storeFeedback(fb:Feedback,owner?:string){try{localStorage.setItem(feedbackKey(owner),JSON.stringify(fb));}catch{throw new Error("Browser storage could not save your feedback.");}}
export function localFeedback(owner?:string):Feedback{try{return parseFeedback(localStorage.getItem(feedbackKey(owner)));}catch{return {votes:[],dismissed:[]};}}
export async function loadFeedback(signedIn:boolean,owner?:string):Promise<Feedback>{
 if(!signedIn)return localFeedback();
 if(!owner)throw new Error("Wait for your account before loading preferences.");
 const {feedback}=await call<{feedback:Feedback|null}>("/api/feedback","GET",undefined,owner);
 // Legacy global feedback has no reliable account owner. Never upload it to an account.
 if(feedback){storeFeedback(feedback,owner);return feedback;}
 return localFeedback(owner);
}
export async function saveFeedback(fb:Feedback,signedIn:boolean,owner?:string){
 if(signedIn&&!owner)throw new Error("Wait for your account before saving preferences.");
 storeFeedback(fb,signedIn?owner:undefined);
 if(signedIn)await call("/api/feedback","PUT",{feedback:fb},owner);
}
export async function deleteAccountFeedback(owner?:string){if(!owner)throw new Error("Wait for your account before deleting its data.");await call("/api/feedback","DELETE",undefined,owner);if(owner)localStorage.removeItem(feedbackKey(owner));}
