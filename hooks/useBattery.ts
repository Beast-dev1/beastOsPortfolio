import { useState, useEffect, useRef } from 'react';

// Battery Status API - not in standard Navigator types
interface BatteryManager {
  level: number;
  charging: boolean;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

export interface UseBatteryReturn {
  level: number | null;
  charging: boolean | null;
  supported: boolean;
}

/** Duration to wait before treating "100%, not charging" as a placeholder (e.g. desktop with no real battery). */
const PLACEHOLDER_CHECK_MS = 4000;

/**
 * Hook for accessing device battery level and charging status via the Web Battery API.
 * Returns null values and supported: false when API is unavailable or returns a placeholder (e.g. desktop PC always reporting 100%).
 */
export function useBattery(): UseBatteryReturn {
  const [level, setLevel] = useState<number | null>(null);
  const [charging, setCharging] = useState<boolean | null>(null);
  const everHadRealBattery = useRef(false);

  useEffect(() => {
    if (!('getBattery' in navigator)) {
      return;
    }

    let cancelled = false;
    let refreshId: ReturnType<typeof setInterval> | null = null;
    let placeholderCheckId: ReturnType<typeof setTimeout> | null = null;
    let battery: BatteryManager | null = null;

    const updateBattery = () => {
      if (!battery || cancelled) return;
      const roundedLevel = Math.round(battery.level * 100);
      if (roundedLevel !== 100 || battery.charging) {
        everHadRealBattery.current = true;
      }
      setLevel(roundedLevel);
      setCharging(battery.charging);
    };

    const initBattery = async () => {
      try {
        battery = await (navigator as NavigatorWithBattery).getBattery!();
        if (cancelled) return;

        updateBattery();

        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);

        // Periodic refresh: events may not fire reliably on some devices
        refreshId = setInterval(updateBattery, 10000);

        // Many desktops/unsupported environments report level=1 (100%) and charging=false and never change.
        // After a short delay, if we've only ever seen 100% and not charging, treat as placeholder and hide percentage.
        placeholderCheckId = setTimeout(() => {
          if (cancelled || everHadRealBattery.current) return;
          if (battery && battery.level >= 0.99 && !battery.charging) {
            setLevel(null);
            setCharging(null);
            if (refreshId) {
              clearInterval(refreshId);
              refreshId = null;
            }
            if (battery) {
              battery.removeEventListener('levelchange', updateBattery);
              battery.removeEventListener('chargingchange', updateBattery);
            }
          }
        }, PLACEHOLDER_CHECK_MS);
      } catch {
        // API error - leave state as null
      }
    };

    initBattery();

    return () => {
      cancelled = true;
      if (refreshId) clearInterval(refreshId);
      if (placeholderCheckId) clearTimeout(placeholderCheckId);
      if (battery) {
        battery.removeEventListener('levelchange', updateBattery);
        battery.removeEventListener('chargingchange', updateBattery);
      }
    };
  }, []);

  return {
    level,
    charging,
    supported: level !== null || charging !== null,
  };
}
