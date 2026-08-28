/** Tiny deterministic PRNG (mulberry32) so every render sees the same data. */
export function createRandom(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    pick: <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)],
    /** Picks with weights biased towards the start of the list. */
    pickWeighted: <T>(items: readonly T[]): T => {
      const r = next() ** 2;
      return items[Math.min(items.length - 1, Math.floor(r * items.length))];
    },
    chance: (probability: number) => next() < probability,
    shuffle: <T>(items: readonly T[]): T[] => {
      const copy = [...items];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    },
  };
}

export type Random = ReturnType<typeof createRandom>;

export const FEMALE_FIRST_NAMES: [string, string][] = [
  ["Farida", "فريدة"],
  ["Nadine", "نادين"],
  ["Habiba", "حبيبة"],
  ["Menna", "منة"],
  ["Aya", "آية"],
  ["Sara", "سارة"],
  ["Jana", "جنى"],
  ["Malak", "ملك"],
  ["Rowan", "روان"],
  ["Nada", "ندى"],
  ["Shahd", "شهد"],
  ["Yasmine", "ياسمين"],
  ["Mariam", "مريم"],
  ["Laila", "ليلى"],
  ["Hala", "هالة"],
  ["Dalia", "داليا"],
  ["Injy", "إنجي",],
  ["Nourhan", "نورهان"],
  ["Basma", "بسمة"],
  ["Rahma", "رحمة"],
  ["Sherine", "شيرين"],
  ["Amina", "أمينة"],
  ["Toqa", "تقى"],
  ["Ola", "علا"],
  ["Reem", "ريم"],
  ["Fatma", "فاطمة"],
  ["Doaa", "دعاء"],
  ["Kholoud", "خلود"],
  ["Passant", "بسنت"],
  ["Rodina", "رودينا"],
];

export const MALE_FIRST_NAMES: [string, string][] = [
  ["Karim", "كريم"],
  ["Omar", "عمر"],
  ["Hazem", "حازم"],
  ["Tarek", "طارق"],
  ["Sherif", "شريف"],
  ["Marwan", "مروان"],
  ["Amr", "عمرو"],
  ["Mostafa", "مصطفى"],
];

export const LAST_NAMES: [string, string][] = [
  ["Hassan", "حسن"],
  ["El Sayed", "السيد"],
  ["Mahmoud", "محمود"],
  ["Abdelaziz", "عبدالعزيز"],
  ["Fahmy", "فهمي"],
  ["Shawky", "شوقي"],
  ["Zaki", "زكي"],
  ["El Gohary", "الجوهري"],
  ["Ramzy", "رمزي"],
  ["Sabry", "صبري"],
  ["Nabil", "نبيل"],
  ["Kamel", "كامل"],
  ["Hegazy", "حجازي"],
  ["El Masry", "المصري"],
  ["Radwan", "رضوان"],
  ["Sedky", "صدقي"],
  ["Wahba", "وهبة"],
  ["Sultan", "سلطان"],
  ["Darwish", "درويش"],
  ["Fouad", "فؤاد"],
];

export const AVATAR_COLORS = [
  "#7A2F5F",
  "#2B5FA8",
  "#1F7A5C",
  "#B5730B",
  "#9B3D77",
  "#2B3A67",
  "#5A4A7A",
  "#7C2D3A",
  "#8C5A1E",
  "#1F5E52",
];

export const CUSTOMER_TAGS: string[] = [
  "VIP",
  "Laser course",
  "Sensitive skin",
  "Bride",
  "Instalments",
  "Referrer",
  "Prefers female staff",
  "Evenings only",
];

export const ALLERGIES = ["Lidocaine", "Penicillin", "Nickel", "Fragrance", "Latex", "Aspirin"];

export const CONDITIONS = [
  "Melasma",
  "PCOS",
  "Active acne",
  "Rosacea",
  "Keloid tendency",
  "Hypothyroidism",
];

export const TREATMENT_AREAS: Record<string, string[]> = {
  laser: ["Underarms", "Bikini", "Full legs", "Arms", "Upper lip", "Chin", "Back", "Abdomen"],
  skin: ["Full face", "Cheeks", "T-zone", "Neck", "Décolletage"],
  injectables: ["Glabella", "Forehead", "Crow's feet", "Lips", "Cheeks", "Chin", "Jawline"],
  body: ["Abdomen", "Flanks", "Inner thighs", "Arms", "Buttocks"],
  hair: ["Vertex", "Frontal hairline", "Crown", "Temples"],
  nails: ["Hands"],
  consultation: ["Full face"],
};
