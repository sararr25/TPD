import type { Tag } from './discovery';

// Presentation only: original tag IDs, facets and search constraints are untouched.
export function displayTags(tags: readonly Tag[]): Tag[] {
  const clean = (name: string) => name.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const hasSeafood = tags.some(tag => clean(tag.name).toLowerCase() === 'seafood');
  const seen = new Set<string>();
  return tags.flatMap(tag => {
    const name = clean(tag.name), key = name.toLowerCase();
    if (!name || seen.has(key) || (hasSeafood && key === 'fresh seafood')) return [];
    seen.add(key);
    return [{ ...tag, name: key === 'specialty non alcoholic' ? 'Specialty alcohol-free drinks' : name }];
  });
}
