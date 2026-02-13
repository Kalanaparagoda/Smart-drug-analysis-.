
export interface MedicineInfo {
  brandName: string;
  genericName: string;
  ingredients: string[];
  purpose: string;
  reasonsForUse: string[];
  sideEffects: string[];
  relatedMedicines: string[];
  isMedicine: boolean;
  confidence: number;
  imageUrl?: string;
}

export interface AnalysisResult {
  data?: MedicineInfo;
  error?: string;
}