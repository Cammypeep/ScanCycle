export const MATERIALS = [
  "steel",
  "aluminum",
  "other_metal",
  "plastic",
  "glass",
  "paper_cardboard",
  "e_waste",
  "mixed_unknown",
] as const;
export type Material = (typeof MATERIALS)[number];

export const RECYCLABILITY = [
  "recyclable",
  "conditional",
  "special_handling",
  "not_recyclable",
  "uncertain",
] as const;
export type Recyclability = (typeof RECYCLABILITY)[number];

export const BIN_COLORS = ["blue", "green", "yellow", "gray", "black", "brown", "red", "special_dropoff"] as const;
export type BinColor = (typeof BIN_COLORS)[number];

export const BIN_SWATCH: Record<BinColor, string> = {
  blue: "#2563eb",
  green: "#16a34a",
  yellow: "#eab308",
  gray: "#9ca3af",
  black: "#1f2937",
  brown: "#92400e",
  red: "#dc2626",
  special_dropoff: "#f97316",
};

export interface Analysis {
  objectName: string;
  binColor?: BinColor;
  binName?: string;
  primaryMaterial: Material;
  secondaryMaterials: Material[];
  recyclability: Recyclability;
  identificationExplanation: string;
  preparationSteps: string[];
  environmentalInfo: string;
  safetyWarnings: string[];
  uncertaintyNotes: string | null;
  needsVerification: boolean;
}

export interface ScanRecord {
  id: string;
  createdAt: number;
  image: string; // small data URL thumbnail
  analysis: Analysis;
}

export const MATERIAL_LABEL: Record<Material, string> = {
  steel: "Steel",
  aluminum: "Aluminum",
  other_metal: "Other metal",
  plastic: "Plastic",
  glass: "Glass",
  paper_cardboard: "Paper / Cardboard",
  e_waste: "Electronic waste",
  mixed_unknown: "Mixed / Unknown",
};

export const RECYCLABILITY_LABEL: Record<Recyclability, string> = {
  recyclable: "Generally recyclable",
  conditional: "Recyclable with conditions",
  special_handling: "Special drop-off required",
  not_recyclable: "Generally not recyclable",
  uncertain: "Needs verification",
};
