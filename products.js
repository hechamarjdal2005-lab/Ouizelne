/* ==========================================================================
   PRODUCT DATA — Coopérative Féminine Ouizelne
   --------------------------------------------------------------------------
   Edit this one place to update the whole site (home + shop).
   Each product:
     id       : unique string
     name     : product name
     price    : number, in Moroccan Dirham (DH)
     category : one of the CATEGORIES keys below
     icon     : emoji used inside the placeholder image
     colors   : [from, to] gradient used for the placeholder image
     img      : optional real image URL — leave "" to keep the CSS placeholder.
                When you have a photo, drop the URL here and it is used
                automatically with the gradient as fallback.
     desc     : short description shown on cards / shop
   ========================================================================== */

const CATEGORIES = {
  argan:       { label: "Argan Oil",               icon: "🫒" },
  ground:      { label: "Traditional Ground Products", icon: "🌾" },
  cosmetics:   { label: "Natural Cosmetics",       icon: "🧼" },
  handcrafted: { label: "Handcrafted Goods",       icon: "🧺" }
};

const PRODUCTS = [
  /* ---------------------------- Argan Oil ---------------------------- */
  {
    id: "argan-pure-100",
    name: "Pure Cosmetic Argan Oil · 100ml",
    price: 180,
    category: "argan",
    icon: "🫒",
    colors: ["#d99a4e", "#a5642a"],
    img: "",
    desc: "Cold-pressed, 100% organic argan oil for skin & hair, hand-made by the women."
  },
  {
    id: "argan-roasted-250",
    name: "Roasted Culinary Argan Oil · 250ml",
    price: 150,
    category: "argan",
    icon: "🫒",
    colors: ["#c98a3d", "#8a5220"],
    img: "",
    desc: "Nutty, toasted argan oil — a treasured Amazigh kitchen staple."
  },
  {
    id: "amlou-200",
    name: "Amlou · Argan, Almond & Honey · 200g",
    price: 130,
    category: "argan",
    icon: "🍯",
    colors: ["#e0a85a", "#a0662c"],
    img: "",
    desc: "Creamy traditional spread of ground almonds, argan oil and pure honey."
  },
  {
    id: "argan-50",
    name: "Pure Argan Oil · 50ml",
    price: 110,
    category: "argan",
    icon: "💧",
    colors: ["#dcae63", "#9c642b"],
    img: "",
    desc: "A travel-size bottle of our signature organic argan oil."
  },

  /* --------------------- Traditional Ground Products ------------------ */
  {
    id: "ground-almond-500",
    name: "Ground Almonds · 500g",
    price: 90,
    category: "ground",
    icon: "🌰",
    colors: ["#d9b48a", "#9a6f45"],
    img: "",
    desc: "Freshly stone-ground almonds, prepared the traditional way."
  },
  {
    id: "ground-sesame-500",
    name: "Ground Sesame · 500g",
    price: 70,
    category: "ground",
    icon: "🌾",
    colors: ["#e3c98f", "#a8874a"],
    img: "",
    desc: "Aromatic ground sesame (semsem), perfect for breads and sweets."
  },
  {
    id: "ground-barley-500",
    name: "Roasted Barley Flour · 500g",
    price: 60,
    category: "ground",
    icon: "🌾",
    colors: ["#cdb083", "#8c6f43"],
    img: "",
    desc: "Soulou — roasted barley flour for a hearty, traditional porridge."
  },
  {
    id: "ground-walnut-500",
    name: "Ground Walnuts · 500g",
    price: 160,
    category: "ground",
    icon: "🥜",
    colors: ["#cfa877", "#7f5a35"],
    img: "",
    desc: "Hand-ground walnuts from the High Atlas valleys."
  },

  /* ------------------------- Natural Cosmetics ------------------------ */
  {
    id: "soap-beldi",
    name: "Savon Beldi · Traditional Black Soap",
    price: 45,
    category: "cosmetics",
    icon: "🧼",
    colors: ["#8a7f63", "#4d4634"],
    img: "",
    desc: "Gentle olive-based black soap for the hammam ritual."
  },
  {
    id: "rhassoul-250",
    name: "Rhassoul Clay · 250g",
    price: 55,
    category: "cosmetics",
    icon: "🏺",
    colors: ["#b98a5e", "#7a5432"],
    img: "",
    desc: "Mineral-rich ghassoul clay that softens skin and hair."
  },
  {
    id: "argan-rose-cream",
    name: "Argan & Rose Facial Cream",
    price: 120,
    category: "cosmetics",
    icon: "🌹",
    colors: ["#d98a7a", "#9c5148"],
    img: "",
    desc: "Nourishing day cream with argan oil and hand-picked rose water."
  },
  {
    id: "rose-water-200",
    name: "Pure Rose Water · 200ml",
    price: 65,
    category: "cosmetics",
    icon: "🌸",
    colors: ["#e0a0a0", "#a85f5f"],
    img: "",
    desc: "Distilled Damascus rose water from the valley of roses."
  },

  /* ------------------------- Handcrafted Goods ------------------------ */
  {
    id: "berber-basket",
    name: "Handwoven Berber Basket",
    price: 220,
    category: "handcrafted",
    icon: "🧺",
    colors: ["#c79a5c", "#7c5a30"],
    img: "",
    desc: "A sturdy basket woven by hand from local palm and doum leaves."
  },
  {
    id: "clay-tagine",
    name: "Traditional Clay Tagine Pot",
    price: 280,
    category: "handcrafted",
    icon: "🍲",
    colors: ["#bd6a45", "#7c3f26"],
    img: "",
    desc: "Unglazed clay tagine for slow-cooked, flavourful meals."
  },
  {
    id: "wool-blanket",
    name: "Handmade Wool Blanket",
    price: 650,
    category: "handcrafted",
    icon: "🛋️",
    colors: ["#c98f6a", "#7d4b30"],
    img: "",
    desc: "Warm, hand-loomed wool blanket with traditional Amazigh patterns."
  },
  {
    id: "ceramic-bowl",
    name: "Hand-painted Ceramic Bowl",
    price: 140,
    category: "handcrafted",
    icon: "🥣",
    colors: ["#d98e5a", "#8f4f2a"],
    img: "",
    desc: "A colourful hand-painted bowl, each one unique."
  }
];

/* Expose for the other scripts */
window.CATEGORIES = CATEGORIES;
window.PRODUCTS = PRODUCTS;
