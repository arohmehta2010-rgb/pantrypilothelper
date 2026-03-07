import { useState, useCallback } from "react";

export type UnitSystem = "metric" | "imperial";

// Conversion helpers — internal storage is always metric
export const kgToLbs = (kg: number) => parseFloat((kg * 2.20462).toFixed(1));
export const lbsToKg = (lbs: number) => parseFloat((lbs / 2.20462).toFixed(1));
export const cmToIn = (cm: number) => parseFloat((cm / 2.54).toFixed(1));
export const inToCm = (inches: number) => parseFloat((inches * 2.54).toFixed(1));
export const cmToFtIn = (cm: number) => {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { ft, in: inches };
};
export const ftInToCm = (ft: number, inches: number) =>
  parseFloat(((ft * 12 + inches) * 2.54).toFixed(1));

export function displayWeight(kg: number, unit: UnitSystem) {
  return unit === "imperial" ? `${kgToLbs(kg)} lbs` : `${kg} kg`;
}
export function displayLength(cm: number, unit: UnitSystem) {
  return unit === "imperial" ? `${cmToIn(cm)} in` : `${cm} cm`;
}
export function displayHeight(cm: number, unit: UnitSystem) {
  if (unit === "imperial") {
    const { ft, in: inches } = cmToFtIn(cm);
    return `${ft}'${inches}"`;
  }
  return `${cm} cm`;
}

export function weightLabel(unit: UnitSystem) {
  return unit === "imperial" ? "lbs" : "kg";
}
export function lengthLabel(unit: UnitSystem) {
  return unit === "imperial" ? "in" : "cm";
}
export function heightLabel(unit: UnitSystem) {
  return unit === "imperial" ? "ft / in" : "cm";
}

export function useUnitSystem() {
  const [unit, setUnitState] = useState<UnitSystem>(() => {
    try {
      return (localStorage.getItem("pp_unit_system") as UnitSystem) || "metric";
    } catch {
      return "metric";
    }
  });

  const setUnit = useCallback((u: UnitSystem) => {
    setUnitState(u);
    localStorage.setItem("pp_unit_system", u);
  }, []);

  return { unit, setUnit };
}
