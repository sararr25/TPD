// Qloo photos picked by hand: id for the image URL, 3-letter ring code, country line.
export const COVERS: Record<string, { code: string; country: string; photo?: string }> = {
  Lisbon: { code: "LIS", country: "Portugal", photo: "85E621E5-F91F-4AB7-B8D3-4E385619C2B1-2Q7xn5" },
  Porto: { code: "OPO", country: "Portugal", photo: "A19EA433-1596-47A4-B408-972D63563EE2-1yqYl4" },
  Paris: { code: "PAR", country: "France", photo: "B1BF01AF-08EA-446A-9491-4A1862ECD8BC-1A0koI" },
  Barcelona: { code: "BCN", country: "Spain", photo: "E006CA6B-9A73-40B9-909F-58C4A8CEABDA-1fwLCl" },
  Madrid: { code: "MAD", country: "Spain", photo: "B215D185-5A63-4390-8256-D684657B870F-2v6SN2" },
  Tokyo: { code: "TYO", country: "Japan", photo: "2C22E484-392B-4AE2-A00E-E811AAED1075-0Fv0Om" },
  "New York": { code: "NYC", country: "USA", photo: "5FAFC6A6-45DB-4AC6-80B3-D7BD558420A8-0rXlRA" },
  Osaka: { code: "OSA", country: "Japan", photo: "6014C8FD-94EC-447D-BC3A-9F12A75CEDE9-1lTKpz" },
  "Ho Chi Minh City": { code: "SGN", country: "Vietnam", photo: "AAAD1F0C-25CF-4913-8C5B-B6C154FC3952-0tkPJr" },
  Hanoi: { code: "HAN", country: "Vietnam", photo: "B41AE803-6C0C-4DC0-AE4D-EA3B36F4ED78-0rFUQG" },
  "Phu Quoc": { code: "PQC", country: "Vietnam" },
};

// The hand-picked photo of a city, or null when it has none.
export function cityCover(city: string, size: "420x" | "1200x"): string | null {
  const photo = COVERS[city]?.photo;
  return photo ? `https://images.qloo.com/i/${photo}-${size}-outside.jpg` : null;
}
