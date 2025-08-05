export interface ScoreDetail {
  question: string;
  score: number;
  description_matches: boolean;
  vision_matches: boolean;
  keyword: string;
}

export interface Property {
  id: string;
  listingId: string;
  provider: string;
  url: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  address: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
  facts: {
    area_m2: number;
    rooms: number;
    beds: number;
    rent_monthly: number;
    deposit: number;
    currency: string;
    furnished: boolean;
    availableFrom?: string;
  };
  overall_score?: number;
  score_details?: ScoreDetail[];
}