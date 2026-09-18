export function clubToSlug(club: string): string {
  return encodeURIComponent(club);
}

export function slugToClub(slug: string): string {
  return decodeURIComponent(slug);
}
