import { useState } from "react";
import "../index.css";

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-lg)",
  },
  colorGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-sm)",
  },
  label: {
    fontSize: "var(--font-size-sm)",
    fontWeight: 600,
    color: "var(--text-secondary)",
    marginBottom: "var(--spacing-xs)",
  },
  colorRow: {
    display: "flex",
    gap: "var(--spacing-md)",
    alignItems: "center",
  },
  colorInput: {
    width: "60px",
    height: "60px",
    borderRadius: "var(--radius-md)",
    border: "2px solid var(--gray-300)",
    cursor: "pointer",
    padding: 0,
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
  },
  colorPreview: {
    flex: 1,
    height: "60px",
    borderRadius: "var(--radius-md)",
    border: "2px solid var(--gray-300)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "var(--font-size-sm)",
    fontWeight: 600,
    color: "var(--text-primary)",
    background: "var(--bg-primary)",
  },
  presetGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "var(--spacing-md)",
    marginTop: "var(--spacing-md)",
  },
  presetCard: {
    padding: "var(--spacing-md)",
    borderRadius: "var(--radius-lg)",
    border: "2px solid var(--gray-200)",
    cursor: "pointer",
    transition: "all var(--transition-base)",
    textAlign: "center",
  },
  presetCardSelected: {
    borderColor: "var(--primary)",
    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
  },
  presetPreview: {
    width: "100%",
    height: "60px",
    borderRadius: "var(--radius-md)",
    marginBottom: "var(--spacing-sm)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "var(--font-size-xs)",
    fontWeight: 600,
    color: "white",
    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
  },
  presetName: {
    fontSize: "var(--font-size-sm)",
    fontWeight: 600,
    color: "var(--text-primary)",
  },
};

const COLOR_PRESETS = [
  {
    name: "Default",
    primary: "#6366f1",
    secondary: "#8b5cf6",
    accent: "#ec4899",
    tabBackground: "#f3f4f6",
    iconColor: "#6366f1",
    pageBackground: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    name: "Ocean",
    primary: "#0ea5e9",
    secondary: "#06b6d4",
    accent: "#3b82f6",
    tabBackground: "#e0f2fe",
    iconColor: "#0ea5e9",
    pageBackground: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",
  },
  {
    name: "Forest",
    primary: "#10b981",
    secondary: "#059669",
    accent: "#34d399",
    tabBackground: "#d1fae5",
    iconColor: "#10b981",
    pageBackground: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  },
  {
    name: "Sunset",
    primary: "#f59e0b",
    secondary: "#ef4444",
    accent: "#f97316",
    tabBackground: "#fef3c7",
    iconColor: "#f59e0b",
    pageBackground: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
  },
  {
    name: "Purple",
    primary: "#a855f7",
    secondary: "#9333ea",
    accent: "#c084fc",
    tabBackground: "#f3e8ff",
    iconColor: "#a855f7",
    pageBackground: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)",
  },
  {
    name: "Rose",
    primary: "#e11d48",
    secondary: "#be123c",
    accent: "#f43f5e",
    tabBackground: "#ffe4e6",
    iconColor: "#e11d48",
    pageBackground: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
  },
];

export default function ColorPicker({ colorScheme, onChange }) {
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customColors, setCustomColors] = useState(
    colorScheme || {
      primary: "#6366f1",
      secondary: "#8b5cf6",
      accent: "#ec4899",
      tabBackground: "#f3f4f6",
      iconColor: "#6366f1",
    }
  );

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset.name);
    setCustomColors(preset);
    onChange(preset);
  };

  const handleColorChange = (key, value) => {
    const newColors = { ...customColors, [key]: value };
    setCustomColors(newColors);
    setSelectedPreset(null);
    onChange(newColors);
  };

  const getColorLabel = (key) => {
    const labels = {
      primary: "Primary Color",
      secondary: "Secondary Color",
      accent: "Accent Color",
      tabBackground: "Tab Background",
      iconColor: "Icon Color",
      pageBackground: "Page Background",
    };
    return labels[key] || key;
  };

  return (
    <div style={styles.container}>
      <div>
        <div style={styles.label}>Choose a Preset</div>
        <div style={styles.presetGrid}>
          {COLOR_PRESETS.map((preset) => (
            <div
              key={preset.name}
              onClick={() => handlePresetSelect(preset)}
              style={{
                ...styles.presetCard,
                ...(selectedPreset === preset.name
                  ? styles.presetCardSelected
                  : {}),
              }}
            >
              <div
                style={{
                  ...styles.presetPreview,
                  background: `linear-gradient(135deg, ${preset.primary} 0%, ${preset.secondary} 100%)`,
                }}
              >
                Preview
              </div>
              <div style={styles.presetName}>{preset.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "var(--spacing-xl)" }}>
        <div style={styles.label}>Customize Colors</div>
        {Object.entries(customColors).map(([key, value]) => {
          // Skip color input for pageBackground if it's a gradient
          const isGradient = key === "pageBackground" && value.includes("gradient");
          
          return (
            <div key={key} style={styles.colorGroup}>
              <div style={styles.label}>{getColorLabel(key)}</div>
              {isGradient ? (
                <div style={styles.colorRow}>
                  <div
                    style={{
                      ...styles.colorPreview,
                      background: value,
                      width: "100%",
                      color: "white",
                      textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                    }}
                  >
                    {value}
                  </div>
                  <button
                    onClick={() => {
                      // Extract first color from gradient or use primary
                      const firstColor = customColors.primary;
                      handleColorChange(key, firstColor);
                    }}
                    style={{
                      padding: "var(--spacing-sm) var(--spacing-md)",
                      borderRadius: "var(--radius-md)",
                      border: "2px solid var(--gray-300)",
                      background: "var(--bg-primary)",
                      cursor: "pointer",
                      fontSize: "var(--font-size-sm)",
                      marginLeft: "var(--spacing-sm)",
                    }}
                  >
                    Use Solid Color
                  </button>
                </div>
              ) : (
                <div style={styles.colorRow}>
                  <input
                    type="color"
                    value={value.startsWith("#") ? value : "#6366f1"}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    style={styles.colorInput}
                  />
                  <div
                    style={{
                      ...styles.colorPreview,
                      background: value,
                      color: key === "tabBackground" ? "var(--text-primary)" : "white",
                    }}
                  >
                    {value}
                  </div>
                  {key === "pageBackground" && !value.includes("gradient") && (
                    <button
                      onClick={() => {
                        // Create gradient from primary and secondary
                        const gradient = `linear-gradient(135deg, ${customColors.primary} 0%, ${customColors.secondary} 100%)`;
                        handleColorChange(key, gradient);
                      }}
                      style={{
                        padding: "var(--spacing-sm) var(--spacing-md)",
                        borderRadius: "var(--radius-md)",
                        border: "2px solid var(--gray-300)",
                        background: "var(--bg-primary)",
                        cursor: "pointer",
                        fontSize: "var(--font-size-sm)",
                        marginLeft: "var(--spacing-sm)",
                      }}
                    >
                      Use Gradient
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
