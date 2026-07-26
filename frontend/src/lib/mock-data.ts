export type Competitor = {
  id: string;
  name: string;
  website: string;
  industry: string;
  country: string;
  status: "active" | "paused" | "scanning";
  lastScan: string;
  products: number;
  notes?: string;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  heroIngredient: string;
  claims: string[];
  price: number;
  currency: string;
  launchDate: string;
  retailer: string;
  positioning: string;
  opportunityScore: number;
  image: string;
};

export type Alert = {
  id: string;
  type:
    | "new_product"
    | "price_drop"
    | "website_update"
    | "social"
    | "ad_campaign"
    | "packaging";
  competitor: string;
  title: string;
  description: string;
  time: string;
  severity: "low" | "medium" | "high";
};

export const competitors: Competitor[] = [
  {
    id: "c1",
    name: "NutraPeak",
    website: "nutrapeak.com",
    industry: "Wellness & Supplements",
    country: "United States",
    status: "active",
    lastScan: "2h ago",
    products: 42,
  },
  {
    id: "c2",
    name: "VitalCore Labs",
    website: "vitalcorelabs.com",
    industry: "Sports Nutrition",
    country: "United Kingdom",
    status: "active",
    lastScan: "5h ago",
    products: 28,
  },
  {
    id: "c3",
    name: "PureBloom",
    website: "purebloom.io",
    industry: "Beauty & Wellness",
    country: "Canada",
    status: "scanning",
    lastScan: "in progress",
    products: 61,
  },
  {
    id: "c4",
    name: "OmegaRoot",
    website: "omegaroot.co",
    industry: "Plant-Based Supplements",
    country: "Germany",
    status: "active",
    lastScan: "1d ago",
    products: 19,
  },
  {
    id: "c5",
    name: "ZenithBio",
    website: "zenithbio.com",
    industry: "Functional Nutrition",
    country: "Australia",
    status: "paused",
    lastScan: "3d ago",
    products: 34,
  },
  {
    id: "c6",
    name: "Lumen Health",
    website: "lumenhealth.co",
    industry: "Sleep & Recovery",
    country: "United States",
    status: "active",
    lastScan: "12m ago",
    products: 22,
  },
];

export const products: Product[] = [
  {
    id: "p1",
    name: "DeepSleep Nightly Formula",
    brand: "Lumen Health",
    category: "Sleep",
    heroIngredient: "Ashwagandha KSM-66",
    claims: ["Better sleep", "Non-habit forming", "Vegan"],
    price: 34.99,
    currency: "USD",
    launchDate: "2025-11-04",
    retailer: "Amazon, iHerb",
    positioning: "Premium",
    opportunityScore: 87,
    image: "sleep",
  },
  {
    id: "p2",
    name: "ImmunoBoost Elderberry+",
    brand: "NutraPeak",
    category: "Immunity",
    heroIngredient: "Black Elderberry",
    claims: ["Immune support", "Kids-safe", "Sugar-free"],
    price: 21.5,
    currency: "USD",
    launchDate: "2025-10-22",
    retailer: "Walmart, DTC",
    positioning: "Mass-market",
    opportunityScore: 74,
    image: "immunity",
  },
  {
    id: "p3",
    name: "Collagen Radiance Peptides",
    brand: "PureBloom",
    category: "Beauty",
    heroIngredient: "Marine Collagen",
    claims: ["Skin elasticity", "Hair & nails", "Grass-fed"],
    price: 44.0,
    currency: "USD",
    launchDate: "2025-09-14",
    retailer: "Sephora, DTC",
    positioning: "Prestige",
    opportunityScore: 92,
    image: "collagen",
  },
  {
    id: "p4",
    name: "FocusEdge Nootropic Stack",
    brand: "VitalCore Labs",
    category: "Cognitive",
    heroIngredient: "Lion's Mane",
    claims: ["Focus", "Mental clarity", "Clean label"],
    price: 39.0,
    currency: "USD",
    launchDate: "2025-08-30",
    retailer: "DTC",
    positioning: "Premium",
    opportunityScore: 81,
    image: "focus",
  },
  {
    id: "p5",
    name: "GreensDaily Ritual",
    brand: "OmegaRoot",
    category: "Greens",
    heroIngredient: "Spirulina + Chlorella",
    claims: ["Detox", "Energy", "Organic"],
    price: 54.0,
    currency: "USD",
    launchDate: "2025-07-19",
    retailer: "Whole Foods, DTC",
    positioning: "Premium",
    opportunityScore: 69,
    image: "greens",
  },
  {
    id: "p6",
    name: "MagRest Magnesium Glycinate",
    brand: "ZenithBio",
    category: "Sleep",
    heroIngredient: "Magnesium Glycinate",
    claims: ["Calm", "Muscle recovery", "High absorption"],
    price: 24.0,
    currency: "USD",
    launchDate: "2025-06-11",
    retailer: "iHerb",
    positioning: "Mid-market",
    opportunityScore: 65,
    image: "magnesium",
  },
];

export const alerts: Alert[] = [
  {
    id: "a1",
    type: "new_product",
    competitor: "Lumen Health",
    title: "New product launched: DeepSleep Nightly Formula",
    description: "Ashwagandha-led sleep SKU at $34.99, listed on Amazon.",
    time: "2h ago",
    severity: "high",
  },
  {
    id: "a2",
    type: "price_drop",
    competitor: "NutraPeak",
    title: "Price drop: ImmunoBoost Elderberry+ −18%",
    description: "$26.50 → $21.50 on DTC store. Bundled with kids' variant.",
    time: "6h ago",
    severity: "medium",
  },
  {
    id: "a3",
    type: "ad_campaign",
    competitor: "PureBloom",
    title: "New ad campaign detected on Meta",
    description: "Collagen Radiance creative bundle running in US/UK.",
    time: "1d ago",
    severity: "medium",
  },
  {
    id: "a4",
    type: "packaging",
    competitor: "OmegaRoot",
    title: "Packaging refresh on GreensDaily Ritual",
    description: "New matte black tin, updated claim: 'Certified Organic'.",
    time: "2d ago",
    severity: "low",
  },
  {
    id: "a5",
    type: "website_update",
    competitor: "VitalCore Labs",
    title: "Homepage messaging changed",
    description: "Hero updated to 'Cognitive performance, engineered.'",
    time: "3d ago",
    severity: "low",
  },
];

export const activityTrend = [
  { month: "Jun", launches: 4, priceChanges: 6, claims: 3 },
  { month: "Jul", launches: 6, priceChanges: 4, claims: 5 },
  { month: "Aug", launches: 5, priceChanges: 8, claims: 7 },
  { month: "Sep", launches: 8, priceChanges: 5, claims: 6 },
  { month: "Oct", launches: 11, priceChanges: 9, claims: 10 },
  { month: "Nov", launches: 14, priceChanges: 12, claims: 13 },
];

export const categoryTrend = [
  { category: "Sleep", value: 32 },
  { category: "Immunity", value: 28 },
  { category: "Beauty", value: 41 },
  { category: "Cognitive", value: 24 },
  { category: "Greens", value: 19 },
  { category: "Energy", value: 22 },
];

export const claimsDistribution = [
  { name: "Clean label", value: 34 },
  { name: "Vegan", value: 22 },
  { name: "Sugar-free", value: 18 },
  { name: "Organic", value: 15 },
  { name: "Non-GMO", value: 11 },
];

export const ingredientTrend = [
  { week: "W1", Ashwagandha: 12, Collagen: 20, "Lion's Mane": 8, Elderberry: 14 },
  { week: "W2", Ashwagandha: 18, Collagen: 22, "Lion's Mane": 11, Elderberry: 12 },
  { week: "W3", Ashwagandha: 24, Collagen: 28, "Lion's Mane": 15, Elderberry: 16 },
  { week: "W4", Ashwagandha: 31, Collagen: 30, "Lion's Mane": 22, Elderberry: 18 },
  { week: "W5", Ashwagandha: 42, Collagen: 34, "Lion's Mane": 28, Elderberry: 21 },
];
