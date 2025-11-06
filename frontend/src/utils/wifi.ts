import apiClient from '../api/axios';

export type WifiQuality = 'excellent' | 'ok' | 'poor' | 'offline';

/**
 * Measure latency to the API server
 * @returns Latency in milliseconds, or null if offline
 */
export async function measureLatency(): Promise<number | null> {
  if (!navigator.onLine) {
    return null;
  }

  const startTime = performance.now();
  
  try {
    await apiClient.head('/test/');
    const endTime = performance.now();
    return endTime - startTime;
  } catch (error) {
    return null;
  }
}

/**
 * Bucketize latency into quality categories
 */
export function bucketizeLatency(latency: number | null): WifiQuality {
  if (latency === null || !navigator.onLine) {
    return 'offline';
  }
  
  if (latency < 100) {
    return 'excellent';
  } else if (latency < 300) {
    return 'ok';
  } else if (latency < 800) {
    return 'poor';
  } else {
    return 'offline';
  }
}

/**
 * Measure and return quality
 */
export async function getWifiQuality(): Promise<WifiQuality> {
  const latency = await measureLatency();
  return bucketizeLatency(latency);
}

