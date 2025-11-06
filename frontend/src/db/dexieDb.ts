import Dexie, { Table } from 'dexie';
import { Station } from '../api/stations';
import { StationFuel } from '../api/stations';
import { OfflinePackage } from '../api/offline';
import { Review } from '../api/reviews';

export interface StationRecord extends Station {
  id?: number;
  cachedAt: number;
}

export interface StationFuelRecord extends StationFuel {
  id?: number;
  cachedAt: number;
}

export interface SettingsRecord {
  key: string;
  value: any;
}

export interface RecentRecord {
  id?: number;
  station: Station;
  visitedAt: number;
}

export interface FavoriteRecord {
  id?: number;
  stationId: number;
  addedAt: number;
}

export interface PackageRecord extends OfflinePackage {
  id?: number;
}

export interface RouteRecord {
  id?: number;
  from: [number, number];
  to: [number, number];
  route: [number, number][];
  distanceKm: number;
  etaMins: number;
  cachedAt: number;
}

export interface TileMetaRecord {
  id?: number;
  z: number;
  x: number;
  y: number;
  url: string;
  cachedAt: number;
}

class FuelTrackDB extends Dexie {
  stations!: Table<StationRecord>;
  stationFuels!: Table<StationFuelRecord>;
  settings!: Table<SettingsRecord>;
  recent!: Table<RecentRecord>;
  favorites!: Table<FavoriteRecord>;
  packages!: Table<PackageRecord>;
  routes!: Table<RouteRecord>;
  tilesMeta!: Table<TileMetaRecord>;

  constructor() {
    super('FuelTrackDB');
    
    this.version(1).stores({
      stations: '++id, station_id, cachedAt',
      stationFuels: '++id, station, fuel_type, cachedAt',
      settings: 'key',
      recent: '++id, station.station_id, visitedAt',
      favorites: '++id, stationId, addedAt',
      packages: '++id, package_id, user',
      routes: '++id, cachedAt',
      tilesMeta: '++id, z, x, y, cachedAt',
    });
  }
}

export const db = new FuelTrackDB();

// Helper functions
export const dbHelpers = {
  // Stations
  async cacheStations(stations: Station[]): Promise<void> {
    await db.stations.clear();
    const records: StationRecord[] = stations.map(s => ({
      ...s,
      cachedAt: Date.now(),
    }));
    await db.stations.bulkAdd(records);
  },

  async getCachedStations(): Promise<Station[]> {
    const records = await db.stations.toArray();
    return records.map(({ id, cachedAt, ...station }) => station);
  },

  // Station Fuels
  async cacheStationFuels(fuels: StationFuel[]): Promise<void> {
    await db.stationFuels.clear();
    const records: StationFuelRecord[] = fuels.map(f => ({
      ...f,
      cachedAt: Date.now(),
    }));
    await db.stationFuels.bulkAdd(records);
  },

  async getCachedStationFuels(): Promise<StationFuel[]> {
    const records = await db.stationFuels.toArray();
    return records.map(({ id, cachedAt, ...fuel }) => fuel);
  },

  // Settings
  async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    const record = await db.settings.get(key);
    return record ? record.value : defaultValue;
  },

  async setSetting<T>(key: string, value: T): Promise<void> {
    await db.settings.put({ key, value });
  },

  // Recent
  async addRecent(station: Station): Promise<void> {
    // Remove if exists
    await db.recent.where('station.station_id').equals(station.station_id).delete();
    // Add to beginning
    await db.recent.add({
      station,
      visitedAt: Date.now(),
    });
    // Keep only last 10
    const all = await db.recent.orderBy('visitedAt').reverse().toArray();
    if (all.length > 10) {
      const toDelete = all.slice(10);
      await db.recent.bulkDelete(toDelete.map(r => r.id!));
    }
  },

  async getRecent(): Promise<Station[]> {
    const records = await db.recent.orderBy('visitedAt').reverse().limit(10).toArray();
    return records.map(r => r.station);
  },

  // Favorites
  async getFavoriteIds(): Promise<number[]> {
    const records = await db.favorites.toArray();
    return records.map(r => r.stationId);
  },

  async addFavorite(stationId: number): Promise<void> {
    await db.favorites.add({
      stationId,
      addedAt: Date.now(),
    });
  },

  async removeFavorite(stationId: number): Promise<void> {
    await db.favorites.where('stationId').equals(stationId).delete();
  },

  // Packages
  async cachePackages(packages: OfflinePackage[]): Promise<void> {
    await db.packages.clear();
    await db.packages.bulkAdd(packages);
  },

  async getCachedPackages(): Promise<OfflinePackage[]> {
    return await db.packages.toArray();
  },
};

