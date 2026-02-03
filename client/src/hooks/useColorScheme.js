import { useEffect } from "react";
import { useAuth } from "../auth/useAuth.js";

export function useColorScheme() {
  const { business } = useAuth();

  useEffect(() => {
    if (business?.colorScheme) {
      const colors = business.colorScheme;
      
      // Apply colors to CSS variables
      const root = document.documentElement;
      
      if (colors.primary) {
        root.style.setProperty("--primary", colors.primary);
        // Calculate primary-dark (darker shade)
        const primaryDark = darkenColor(colors.primary, 0.15);
        root.style.setProperty("--primary-dark", primaryDark);
        // Calculate primary-light (lighter shade)
        const primaryLight = lightenColor(colors.primary, 0.2);
        root.style.setProperty("--primary-light", primaryLight);
      }
      
      if (colors.secondary) {
        root.style.setProperty("--secondary", colors.secondary);
      }
      
      if (colors.accent) {
        root.style.setProperty("--accent", colors.accent);
      }
      
      if (colors.tabBackground) {
        root.style.setProperty("--tab-background", colors.tabBackground);
      }
      
      if (colors.iconColor) {
        root.style.setProperty("--icon-color", colors.iconColor);
      }
    } else {
      // Reset to defaults if no color scheme
      const root = document.documentElement;
      root.style.removeProperty("--primary");
      root.style.removeProperty("--primary-dark");
      root.style.removeProperty("--primary-light");
      root.style.removeProperty("--secondary");
      root.style.removeProperty("--accent");
      root.style.removeProperty("--tab-background");
      root.style.removeProperty("--icon-color");
    }
  }, [business?.colorScheme]);
}

// Helper function to darken a color
function darkenColor(color, amount) {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const newR = Math.max(0, Math.floor(r * (1 - amount)));
  const newG = Math.max(0, Math.floor(g * (1 - amount)));
  const newB = Math.max(0, Math.floor(b * (1 - amount)));
  
  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}

// Helper function to lighten a color
function lightenColor(color, amount) {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const newR = Math.min(255, Math.floor(r + (255 - r) * amount));
  const newG = Math.min(255, Math.floor(g + (255 - g) * amount));
  const newB = Math.min(255, Math.floor(b + (255 - b) * amount));
  
  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}
