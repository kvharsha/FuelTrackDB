export interface Position {
  latitude: number;
  longitude: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export const geolocation = {
  getCurrentPosition: (): Promise<Position> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({ code: -1, message: 'Geolocation is not supported by this browser' });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject({
            code: error.code,
            message: error.message,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  },

  watchPosition: (
    onSuccess: (position: Position) => void,
    onError?: (error: GeolocationError) => void
  ): number => {
    if (!navigator.geolocation) {
      onError?.({ code: -1, message: 'Geolocation is not supported by this browser' });
      return -1;
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        onSuccess({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        onError?.({
          code: error.code,
          message: error.message,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  },

  clearWatch: (watchId: number): void => {
    if (watchId >= 0) {
      navigator.geolocation.clearWatch(watchId);
    }
  },
};

