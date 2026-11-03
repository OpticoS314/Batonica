export type PlantCategory = 
  | 'All'
  | 'Indoor'
  | 'Foliage'
  | 'Low Light'
  | 'Air Purifying'
  | 'Succulents'
  | 'Flowering'
  | 'Pet Friendly';

export type LightLevel = 
  | 'Low Light'
  | 'Indirect Bright'
  | 'Direct Sunlight'
  | 'Low to Medium';

export type WateringFrequency = 
  | 'Every 1-2 Weeks'
  | 'Weekly'
  | 'Every 2-3 Weeks'
  | 'When Topsoil is Dry';

export type CareDifficulty = 'Easy Care' | 'Moderate' | 'Green Thumb';

export interface Plant {
  id: string;
  name: string;
  scientificName: string;
  category: PlantCategory;
  shortDescription: string;
  fullDescription: string;
  price: number; // Plant price
  originalPrice?: number; // Optional comparison price / discount
  imageUrl: string;
  additionalImages?: string[];
  light: LightLevel;
  watering: WateringFrequency;
  humidity: 'Low' | 'Medium' | 'High';
  difficulty: CareDifficulty;
  isPetFriendly: boolean;
  isPopular?: boolean;
  inStock?: boolean;
  stockQuantity: number;
  tags: string[];
  heightInfo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  plant: Plant;
  quantity: number;
}
