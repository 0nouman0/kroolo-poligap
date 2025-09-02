export function getInitials(name?: string): string {
  if (!name) return "👤";
  const words = name.trim().split(" ");
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return words[0].charAt(0).toUpperCase();
}
