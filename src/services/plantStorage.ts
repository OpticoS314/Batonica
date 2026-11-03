import { Plant } from '../types/plant';
import { INITIAL_PLANTS } from '../data/seedPlants';

const STORAGE_KEY = 'botanica_plant_catalog_v4_plants_only';
const SUBSCRIBERS: Array<(plants: Plant[]) => void> = [];

function notifySubscribers(plants: Plant[]) {
  SUBSCRIBERS.forEach(callback => {
    try {
      callback(plants);
    } catch (err) {
      console.error('Subscriber notification error:', err);
    }
  });
}

export const plantStorage = {
  // Load plants from localStorage or seed
  getPlantsSync(): Plant[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed reading from localStorage, using initial seed', e);
    }

    // First time setup: seed with initial plants
    this.savePlantsSync(INITIAL_PLANTS);
    return INITIAL_PLANTS;
  },

  savePlantsSync(plants: Plant[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
      notifySubscribers(plants);
    } catch (e) {
      console.error('Failed writing plants to localStorage', e);
    }
  },

  // Async API emulating backend service
  async getPlants(): Promise<Plant[]> {
    await new Promise(resolve => setTimeout(resolve, 80));
    return this.getPlantsSync();
  },

  async getPlantById(id: string): Promise<Plant | undefined> {
    await new Promise(resolve => setTimeout(resolve, 40));
    const plants = this.getPlantsSync();
    return plants.find(p => p.id === id);
  },

  async updatePlantPricing(plantId: string, price: number): Promise<Plant> {
    await new Promise(resolve => setTimeout(resolve, 120));
    const plants = this.getPlantsSync();
    const index = plants.findIndex(p => p.id === plantId);
    if (index === -1) {
      throw new Error(`Plant with ID "${plantId}" not found.`);
    }

    const current = plants[index];
    const updated: Plant = {
      ...current,
      price: Math.max(0, Number(price.toFixed(2))),
      updatedAt: new Date().toISOString()
    };

    plants[index] = updated;
    this.savePlantsSync(plants);
    return updated;
  },

  async createPlant(plantData: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Plant> {
    await new Promise(resolve => setTimeout(resolve, 150));
    const plants = this.getPlantsSync();
    
    // Generate clean ID from name
    const slug = plantData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `plant-${Date.now()}`;
    const id = `${slug}-${Math.random().toString(36).substring(2, 6)}`;

    const newPlant: Plant = {
      ...plantData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedCatalog = [newPlant, ...plants];
    this.savePlantsSync(updatedCatalog);
    return newPlant;
  },

  async updatePlant(plantId: string, partial: Partial<Plant>): Promise<Plant> {
    await new Promise(resolve => setTimeout(resolve, 120));
    const plants = this.getPlantsSync();
    const index = plants.findIndex(p => p.id === plantId);
    if (index === -1) {
      throw new Error(`Plant with ID "${plantId}" not found.`);
    }

    const updated: Plant = {
      ...plants[index],
      ...partial,
      updatedAt: new Date().toISOString()
    };

    plants[index] = updated;
    this.savePlantsSync(plants);
    return updated;
  },

  async deletePlant(plantId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const plants = this.getPlantsSync();
    const filtered = plants.filter(p => p.id !== plantId);
    this.savePlantsSync(filtered);
    return true;
  },

  async restorePlant(plant: Plant): Promise<Plant> {
    await new Promise(resolve => setTimeout(resolve, 80));
    const plants = this.getPlantsSync();
    const alreadyExists = plants.some(p => p.id === plant.id);
    if (!alreadyExists) {
      const updated = [plant, ...plants];
      this.savePlantsSync(updated);
    }
    return plant;
  },

  async resetCatalog(): Promise<Plant[]> {
    await new Promise(resolve => setTimeout(resolve, 150));
    this.savePlantsSync(INITIAL_PLANTS);
    return INITIAL_PLANTS;
  },

  subscribe(callback: (plants: Plant[]) => void): () => void {
    SUBSCRIBERS.push(callback);
    // Call immediately with current state
    callback(this.getPlantsSync());
    return () => {
      const idx = SUBSCRIBERS.indexOf(callback);
      if (idx !== -1) {
        SUBSCRIBERS.splice(idx, 1);
      }
    };
  }
};
