import { MESSAGES, type Selection } from "./discovery-client";

// Browser side of /api/passport (E06): the signed-in user's saved Passport.
async function call<T>(method: "GET" | "PUT" | "DELETE", body?: object): Promise<T> {
  let response: Response;
  try {
    response = await fetch("/api/passport", {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Your account could not be reached. Your choices are still on this browser.");
  }
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      MESSAGES[data.error] ||
        "Your account could not be updated. Your choices are still on this browser.",
    );
  return data as T;
}
export async function loadAccountPassport(): Promise<Selection[] | null> {
  return (await call<{ passport: Selection[] | null }>("GET")).passport;
}
export async function saveAccountPassport(passport: Selection[]) {
  await call("PUT", { passport: passport.map((s) => s.token) });
}
export async function deleteAccountPassport() {
  await call("DELETE");
}
