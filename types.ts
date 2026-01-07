
export interface RefinementHistory {
  id: string;
  original: string;
  refined: string;
  timestamp: number;
}

export enum ToneType {
  PROFESSIONAL = 'Professional & Formal',
  ACADEMIC = 'Academic & Rigorous',
  BUSINESS = 'Business & Persuasive',
  FRIENDLY = 'Friendly & Warm',
  CONCISE = 'Clear & Concise'
}

export interface RefinementResponse {
  refinedText: string;
  explanation?: string;
}
