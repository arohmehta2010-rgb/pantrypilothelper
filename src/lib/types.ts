export interface Recipe {
  name: string;
  description: string;
  servings: number;
  prepTime: string;
  cookTime: string;
  estimatedCost: string;
  ingredients: { item: string; amount: string }[];
  steps: string[];
  nutrition: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
    sugar: string;
    sodium: string;
  };
  tips?: string;
}
