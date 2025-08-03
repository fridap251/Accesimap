
export type AccessibilityStatus = 'yes' | 'no' | 'partial' | 'unknown';

export interface AccessibilityFeatures {
  ramps: AccessibilityStatus;
  elevators: AccessibilityStatus;
  restrooms: AccessibilityStatus;
  parking: AccessibilityStatus;
  audioVisual: AccessibilityStatus;
  sensory: AccessibilityStatus;
  serviceAnimal: AccessibilityStatus;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
}

export interface Location {
  id:string;
  name: string;
  address: string;
  type: string;
  overallRating: number;
  photos: string[];
  features: AccessibilityFeatures;
  reviews: Review[];
}

export type AccessibilityFilter = keyof AccessibilityFeatures;