import { useState, useEffect } from "react";
import "../index.css";

const styles = {
  banner: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: "var(--bg-primary)",
    borderTop: "2px solid var(--primary)",
    padding: "var(--spacing-lg)",
    boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.15)",
    zIndex: 10000,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "var(--spacing-md)",
    flexWrap: "wrap",
  },
  content: {
    flex: 1,
    minWidth: "200px",
  },
  title: {
    fontSize: "var(--font-size-base)",
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: "var(--spacing-xs)",
  },
  description: {
    fontSize: "var(--font-size-sm)",
    color: "var(--text-secondary)",
  },
  buttonGroup: {
    display: "flex",
    gap: "var(--spacing-sm)",
    flexWrap: "wrap",
  },
  button: {
    padding: "var(--spacing-sm) var(--spacing-md)",
    borderRadius: "var(--radius-md)",
    border: "none",
    fontSize: "var(--font-size-sm)",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all var(--transition-base)",
  },
  installButton: {
    background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
    color: "white",
    boxShadow: "0 2px 8px rgba(99, 102, 241, 0.3)",
  },
  dismissButton: {
    background: "var(--gray-100)",
    color: "var(--text-secondary)",
  },
  iosInstructions: {
    marginTop: "var(--spacing-md)",
    padding: "var(--spacing-md)",
    background: "var(--gray-50)",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-sm)",
    color: "var(--text-secondary)",
  },
  instructionStep: {
    marginBottom: "var(--spacing-xs)",
    display: "flex",
    alignItems: "flex-start",
    gap: "var(--spacing-sm)",
  },
  instructionNumber: {
    fontWeight: 700,
    color: "var(--primary)",
    minWidth: "20px",
  },
};

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if already shown (localStorage)
    const installPromptShown = localStorage.getItem("installPromptShown");
    if (installPromptShown === "true") {
      return;
    }

    // Android/Chrome install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Show iOS instructions after a delay if on iOS
    if (iOS) {
      const timer = setTimeout(() => {
        setShowIOSPrompt(true);
      }, 3000); // Show after 3 seconds
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    localStorage.setItem("installPromptShown", "true");
  };

  const handleDismiss = () => {
    setDeferredPrompt(null);
    setShowIOSPrompt(false);
    localStorage.setItem("installPromptShown", "true");
  };

  if (isInstalled) return null;

  // Android/Chrome prompt
  if (deferredPrompt && !isIOS) {
    return (
      <div style={styles.banner}>
        <div style={styles.content}>
          <div style={styles.title}>Install Schedrix</div>
          <div style={styles.description}>
            Add Schedrix to your home screen for quick access and a better experience.
          </div>
        </div>
        <div style={styles.buttonGroup}>
          <button
            onClick={handleInstallClick}
            style={{ ...styles.button, ...styles.installButton }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            style={{ ...styles.button, ...styles.dismissButton }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--gray-200)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--gray-100)";
            }}
          >
            Not Now
          </button>
        </div>
      </div>
    );
  }

  // iOS prompt
  if (showIOSPrompt && isIOS) {
    return (
      <div style={styles.banner}>
        <div style={styles.content}>
          <div style={styles.title}>Install Schedrix on iOS</div>
          <div style={styles.description}>
            Add Schedrix to your home screen for quick access.
          </div>
          <div style={styles.iosInstructions}>
            <div style={styles.instructionStep}>
              <span style={styles.instructionNumber}>1.</span>
              <span>Tap the Share button <span style={{ fontSize: "1.2em" }}>⎋</span> at the bottom of your screen</span>
            </div>
            <div style={styles.instructionStep}>
              <span style={styles.instructionNumber}>2.</span>
              <span>Scroll down and tap "Add to Home Screen"</span>
            </div>
            <div style={styles.instructionStep}>
              <span style={styles.instructionNumber}>3.</span>
              <span>Tap "Add" to confirm</span>
            </div>
          </div>
        </div>
        <div style={styles.buttonGroup}>
          <button
            onClick={handleDismiss}
            style={{ ...styles.button, ...styles.dismissButton }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--gray-200)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--gray-100)";
            }}
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  return null;
}
