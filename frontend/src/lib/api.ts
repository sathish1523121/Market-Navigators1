// api.ts
// Client-side API functions to fetch market trends from the FastAPI backend.

export interface ProductMatch {
  source: "openfoodfacts" | "usda_fdc";
  source_id: string;
  name: string;
  brand?: string;
  category?: string;
  ingredients_text?: string;
  nutrients?: Record<string, any>;
  image_url?: string;
  matched_query: string;
  match_score: number;
}

export interface ExtractedClaim {
  product_source_id: string;
  claim_text: string;
  claim_type: string;
  confidence: number;
  evidence_snippet?: string;
}

export interface IngredientInsight {
  product_source_id: string;
  ingredient_name: string;
  is_active_ingredient: boolean;
  category?: string;
  amount_per_serving?: string;
}

export interface RevenueAttribution {
  product_source_id: string;
  estimated_revenue_usd: number;
  revenue_period: string;
  confidence: number;
  methodology: string;
}

export interface MarketTrendsResponse {
  query: string;
  intent: string;
  products: ProductMatch[];
  claims: ExtractedClaim[];
  ingredients: IngredientInsight[];
  revenue: RevenueAttribution[];
  job_ids: string[];
}

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function fetchMarketTrends(query: string, limit = 25): Promise<MarketTrendsResponse> {
  const response = await fetch(`${BACKEND_URL}/api/trends`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, limit }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API returned ${response.status}: ${errorText}`);
  }

  return response.json();
}

export async function sendAssistantChat(message: string): Promise<{
  reply: string;
  products_count: number;
  claims_count: number;
  ingredients_count: number;
  chart_data: { category: string; value: number }[];
  products: ProductMatch[];
}> {
  const response = await fetch(`${BACKEND_URL}/api/assistant/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Chat API error ${response.status}: ${errorText}`);
  }

  return response.json();
}
