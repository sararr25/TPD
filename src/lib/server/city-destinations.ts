import "server-only";
// Exact destination name + country verified on 25 October 2026.
// Barcelona has indistinguishable duplicates; Osaka lacks country confirmation;
// Phu Quoc resolves to a different destination. Never substitute or score them.
export const CITY_DESTINATIONS: Record<string, string> = {
  "Lisbon": "F5031AA6-799B-4FC7-B38F-E23F14F1ED4C",
  "Porto": "E1ACE365-5184-4298-A919-F4609A95490B",
  "Paris": "70E3820A-B1CF-4676-9CDA-C5F6539C53B9",
  "Madrid": "E8E8B7BB-3BF0-42E2-89EF-7A75F902B0B9",
  "New York": "99FB5527-DACF-42DF-816B-36B5D004F639",
  "Tokyo": "1EB0550F-0F82-43A2-B501-4D33B5488FD1",
  "Ho Chi Minh City": "BC1B0D1B-B3C6-471C-A532-F094B9635CBF",
  "Hanoi": "195B60ED-9D44-4DEA-97E1-5DD44FD9C64A"
};
