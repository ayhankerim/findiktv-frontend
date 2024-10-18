export function slugify(text: string): string {
  const trMap: { [key: string]: string } = {
    "çÇ": "c",
    "ğĞ": "g",
    "şŞ": "s",
    "üÜ": "u",
    "ıİ": "i",
    "öÖ": "o",
  };
  
  for (const key in trMap) {
    if (Object.prototype.hasOwnProperty.call(trMap, key)) {
      text = text.replace(new RegExp("[" + key + "]", "g"), trMap[key]);
    }
  }
  
  return text
    .replace(/[^-a-zA-Z0-9\s]+/gi, "")
    .replace(/\s/gi, "-")
    .replace(/[-]+/gi, "-")
    .toLowerCase();
}
