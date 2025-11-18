import React, { useEffect, memo, useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { useMap } from 'react-leaflet';
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import SignalWifi4BarIcon from '@mui/icons-material/SignalWifi4Bar';
import SignalWifi3BarIcon from '@mui/icons-material/SignalWifi3Bar';
import SignalWifi2BarIcon from '@mui/icons-material/SignalWifi2Bar';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import Battery3BarIcon from '@mui/icons-material/Battery3Bar';
import Battery1BarIcon from '@mui/icons-material/Battery1Bar';
import Battery0BarIcon from '@mui/icons-material/Battery0Bar';
import type { WifiQuality } from '../../store/mapSlice';
import { getWifiQuality } from '../../utils/wifi';

interface MapControlsProps {
  userLocation: [number, number] | null;
  wifiQuality: WifiQuality;
  onWifiQualityChange: (quality: WifiQuality) => void;
}

const MapControls: React.FC<MapControlsProps> = memo(({
  userLocation,
  wifiQuality,
  onWifiQualityChange,
}) => {
  const map = useMap();
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);

  useEffect(() => {
    // Measure WiFi quality every 15 seconds
    const interval = setInterval(async () => {
      const quality = await getWifiQuality();
      onWifiQualityChange(quality);
    }, 15000);

    // Initial measurement
    getWifiQuality().then(onWifiQualityChange);

    return () => clearInterval(interval);
  }, [onWifiQualityChange]);

  // Battery status (if supported)
  useEffect(() => {
    const getBatteryStatus = async () => {
      try {
        // @ts-ignore - Battery API may not be in types
        if (navigator.getBattery) {
          // @ts-ignore
          const battery = await navigator.getBattery();
          setBatteryLevel(battery.level * 100);
          battery.addEventListener('levelchange', () => {
            setBatteryLevel(battery.level * 100);
          });
        }
      } catch (e) {
        // Battery API not supported
      }
    };
    getBatteryStatus();
  }, []);

  const handleLocate = () => {
    if (userLocation) {
      map.flyTo(userLocation, 16, {
        animate: true,
        duration: 1.5,
      });
    }
  };

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  const getWifiIcon = () => {
    switch (wifiQuality) {
      case 'excellent':
        return <SignalWifi4BarIcon color="success" />;
      case 'ok':
        return <SignalWifi3BarIcon color="success" />;
      case 'poor':
        return <SignalWifi2BarIcon color="warning" />;
      case 'offline':
        return <WifiOffIcon color="error" />;
      default:
        return <WifiIcon />;
    }
  };

  const getWifiTooltip = () => {
    switch (wifiQuality) {
      case 'excellent':
        return 'Network: Excellent';
      case 'ok':
        return 'Network: Good';
      case 'poor':
        return 'Network: Poor';
      case 'offline':
        return 'Network: Offline';
      default:
        return 'Network Status';
    }
  };

  return (
    <Box
      className="floating-controls bottom-right-controls"
      sx={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {/* Current Location */}
      <Tooltip title="Go to Current Location" placement="left">
        <IconButton
          onClick={handleLocate}
          sx={{
            backgroundColor: 'white',
            '&:hover': { transform: 'scale(1.1)', backgroundColor: 'rgba(255, 255, 255, 0.9)' },
            transition: 'transform 0.2s',
            boxShadow: 3,
          }}
        >
          <LocationSearchingIcon color={userLocation ? 'primary' : 'action'} />
        </IconButton>
      </Tooltip>

      {/* Zoom Controls */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: 3,
        }}
      >
        <IconButton
          onClick={handleZoomIn}
          sx={{
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
          }}
        >
          <AddIcon />
        </IconButton>
        <IconButton
          onClick={handleZoomOut}
          sx={{
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
          }}
        >
          <RemoveIcon />
        </IconButton>
      </Box>

      {/* WiFi Meter */}
      <Tooltip title={getWifiTooltip()} placement="left">
        <IconButton
          sx={{
            backgroundColor: 'white',
            '&:hover': { transform: 'scale(1.1)', backgroundColor: 'rgba(255, 255, 255, 0.9)' },
            transition: 'transform 0.2s',
            boxShadow: 3,
          }}
        >
          {getWifiIcon()}
        </IconButton>
      </Tooltip>

      {/* Battery Status (if supported) */}
      {batteryLevel !== null && (
        <Tooltip title={`Battery: ${Math.round(batteryLevel)}%`} placement="left">
          <IconButton
            sx={{
              backgroundColor: 'white',
              '&:hover': { transform: 'scale(1.1)', backgroundColor: 'rgba(255, 255, 255, 0.9)' },
              transition: 'transform 0.2s',
              boxShadow: 3,
            }}
          >
            {batteryLevel > 75 ? (
              <BatteryFullIcon color="success" />
            ) : batteryLevel > 50 ? (
              <Battery3BarIcon color="success" />
            ) : batteryLevel > 25 ? (
              <Battery1BarIcon color="warning" />
            ) : (
              <Battery0BarIcon color="error" />
            )}
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
});

MapControls.displayName = 'MapControls';

export default MapControls;

