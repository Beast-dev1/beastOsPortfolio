import { useState, useEffect } from 'react';

// Battery Status API - not in standard Navigator types
interface BatteryManager {
  level: number;
  charging: boolean;
  addEventListener(type: string, listener: EventListener): void;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

export interface UseBatteryReturn {
  level: number | null;
  charging: boolean | null;
  supported: boolean;
}

/**
 * Hook for accessing device battery level and charging status via the Web Battery API.
 * Returns null values and supported: false when API is unavailable (e.g., desktop PC, unsupported browser).
 */
export function useBattery(): UseBatteryReturn {
  const [level, setLevel] = useState<number | null>(null);
  const [charging, setCharging] = useState<boolean | null>(null);

  useEffect(() => {
    if (!('getBattery' in navigator)) {
      return;
    }

    let cancelled = false;
    let refreshId: ReturnType<typeof setInterval> | null = null;

    const initBattery = async () => {
      try {
        const battery = await (navigator as NavigatorWithBattery).getBattery!();
        if (cancelled) return;

        const updateBattery = () => {
          setLevel(Math.round(battery.level * 100));
          setCharging(battery.charging);
        };

        updateBattery();

        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);

        // Periodic refresh: events may not fire reliably on some devices
        refreshId = setInterval(updateBattery, 10000);
      } catch {
        // API error - leave state as null
      }
    };

    initBattery();

    return () => {
      cancelled = true;
      if (refreshId) clearInterval(refreshId);
    };
  }, []);

  return {
    level,
    charging,
    supported: level !== null || charging !== null,
  };
}
