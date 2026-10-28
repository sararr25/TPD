// Original Beesyde flat-vector scenes. See public/quiz-art/README.md.
const artwork: Record<string, string> = {
  bookstore: 'bookstore', gallery: 'gallery', vintage: 'vintage', 'jazz-club': 'jazz', park: 'park', museum: 'museum', cafe: 'cafe', brewery: 'brewery',
  planned:'calendar', improvised:'wander', buzz:'party', quiet:'park', thrifty:'noodles', treat:'spa', known:'noodles', local:'cooking', alone:'reading', crowd:'party', sunrise:'dawn', midnight:'jazz',
  central: 'city', remote: 'retreat', wander: 'wander', booked: 'calendar', noodles: 'noodles', 'wine-bar': 'wine', trail: 'trail', neighbourhood: 'city',
  soul: 'piano', electronic: 'electronic', cinema: 'cinema', cooking: 'cooking', spa: 'spa', records: 'vinyl', 'cafe-book': 'reading', 'walk-anyway': 'rain',
  'film-camera': 'camera', novel: 'reading', headphones: 'headphones', boots: 'boots', outfit: 'vintage', map: 'map', sunscreen: 'sunscreen', sketchbook: 'sketchbook', book: 'reading',
  'ask-local': 'cooking', 'get-lost': 'map', 'bar-counter': 'counter', 'sunrise-hike': 'dawn', 'strangers-party': 'party',
  khruangbin: 'vinyl', 'nina-simone': 'piano', 'daft-punk': 'electronic', 'bad-bunny': 'tropical',
  'before-sunrise': 'train', 'in-the-mood-for-love': 'romance', amelie: 'paris', 'mad-max': 'desert',
};
export function QuizArtwork({ id }: { id: string }) {
  const name = artwork[id];
  if (!name) return null;
  return <img className="taste-art" src={`/quiz-art/${name}.svg`} width={264} height={210} alt="" draggable={false} />;
}
