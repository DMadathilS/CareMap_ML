// src/types/provider.ts
export interface CategoryCard {
  id: number;
  label: string;
  icon: JSX.Element;
  count: number;
  categoryKey: string;
}
export interface Provider {
  id: number;
  name: string;
  address: string;
  phone_number: string;
  website: string;
  latitude: number;
  longitude: number;
}
