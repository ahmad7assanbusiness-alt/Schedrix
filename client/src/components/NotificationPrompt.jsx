import { useState, useEffect } from 'react';
import { useAuth } from '../auth/useAuth.js';
import { api } from '../api/client.js';
import { requestNotificationPermission, subscribeToPushNotifications } from '../services/notificationService.js';

const NotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateUser } = useAuth();

  // Check if app is installed as PWA
  const isInstalledPWA = () => {
    return window.navigator.standalone || 
           window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: fullscreen)').matches;
  };

  useEffect(() => {
    // Only show prompt for installed PWAs, not browsers
    if (!isInstalledPWA()) {
      return;
    }

    // Check if we should show the prompt
    const shouldShowPrompt = () => {
      if (!user) return false;
      
      // Don't show if user has already granted or denied permission (and was prompted)
      if (user.notificationPermission === 'granted') return false;
      if (user.notificationPermission === 'denied' && user.notificationPrompted) return false;
      
      // Show if user has never been prompted (pending) or denied but not prompted yet
      if (user.notificationPermission === 'pending' || 
          (user.notificationPermission === 'denied' && !user.notificationPrompted)) {
        return true;
      }
      
      return false;
    };

    if (shouldShowPrompt()) {
      // Show immediately on first PWA open (no delay)
      try {
        setShowPrompt(true);
      } catch (error) {
        console.error('Error showing notification prompt:', error);
      }
    }
  }, [user]);

  const handleAllow = async () => {
    setIsLoading(true);
    // Don't hide immediately - wait for system permission response
    
    try {
      // Request notification permission (this shows the system dialog)
      const permission = await requestNotificationPermission();
      
      // Now hide the modal after we get the system response
      setShowPrompt(false);
      
      if (permission) {
        // Permission granted - subscribe to notifications
        try {
          await subscribeToPushNotifications();
        } catch (subError) {
          console.error('Error subscribing to push notifications:', subError);
          // Continue even if subscription fails
        }
        
        // Update user in database
        try {
          await api.post('/notifications/permission', {
            permission: 'granted',
            prompted: true
          });
        } catch (apiError) {
          console.error('Error updating permission in database:', apiError);
          // Continue even if API call fails
        }
        
        // Update user state
        updateUser({
          ...user,
          notificationPermission: 'granted',
          notificationPrompted: true
        });
      } else {
        // Permission denied by system
        try {
          await api.post('/notifications/permission', {
            permission: 'denied',
            prompted: true
          });
        } catch (apiError) {
          console.error('Error updating permission in database:', apiError);
        }
        
        updateUser({
          ...user,
          notificationPermission: 'denied',
          notificationPrompted: true
        });
      }
    } catch (error) {
      console.error('Error handling notification permission:', error);
      // Hide modal even on error
      setShowPrompt(false);
      
      // Mark as prompted so we don't show again
      try {
        await api.post('/notifications/permission', {
          permission: 'denied',
          prompted: true
        });
        updateUser({
          ...user,
          notificationPermission: 'denied',
          notificationPrompted: true
        });
      } catch (apiError) {
        console.error('Error updating permission after error:', apiError);
        // Update state even if API fails
        updateUser({
          ...user,
          notificationPermission: 'denied',
          notificationPrompted: true
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeny = async () => {
    setIsLoading(true);
    setShowPrompt(false); // Hide immediately
    
    try {
      // Update user in database - mark as denied and prompted
      await api.post('/notifications/permission', {
        permission: 'denied',
        prompted: true // Mark as prompted so we don't ask again
      });
      
      // Update user state
      updateUser({
        ...user,
        notificationPermission: 'denied',
        notificationPrompted: true
      });
    } catch (error) {
      console.error('Error updating notification permission:', error);
      // Update state even if API fails
      updateUser({
        ...user,
        notificationPermission: 'denied',
        notificationPrompted: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.icon}>
          🔔
        </div>
        <h2 style={styles.title}>Stay Updated with Opticore</h2>
        <p style={styles.description}>
          Get instant notifications for schedule updates, availability requests, and important announcements.
        </p>
        
        <div style={styles.benefits}>
          <div style={styles.benefit}>
            <span style={styles.benefitIcon}>📅</span>
            <span>Schedule changes & updates</span>
          </div>
          <div style={styles.benefit}>
            <span style={styles.benefitIcon}>⏰</span>
            <span>Availability request reminders</span>
          </div>
          <div style={styles.benefit}>
            <span style={styles.benefitIcon}>🔄</span>
            <span>App updates & new features</span>
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button 
            onClick={handleAllow} 
            disabled={isLoading}
            style={{
              ...styles.allowButton,
              ...(isLoading ? { opacity: 0.7, cursor: 'not-allowed' } : {})
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {isLoading ? 'Waiting for permission...' : 'Allow Notifications'}
          </button>
          
          <button 
            onClick={handleDeny} 
            disabled={isLoading}
            style={styles.denyButton}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.borderColor = 'var(--gray-400)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--gray-200)';
            }}
          >
            Not Now
          </button>
        </div>
        
        <p style={styles.footnote}>
          You can change this setting anytime in your browser or app settings.
        </p>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: 'var(--spacing-lg)',
    animation: 'fadeIn 0.3s ease-out',
  },
  modal: {
    background: 'var(--bg-primary)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--spacing-2xl)',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid var(--gray-100)',
    textAlign: 'center',
    animation: 'slideUp 0.3s ease-out',
  },
  icon: {
    fontSize: '3rem',
    marginBottom: 'var(--spacing-lg)',
  },
  title: {
    fontSize: 'var(--font-size-xl)',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: 'var(--spacing-md)',
    margin: 0,
  },
  description: {
    fontSize: 'var(--font-size-base)',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    marginBottom: 'var(--spacing-lg)',
    margin: '0 0 var(--spacing-lg) 0',
  },
  benefits: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
    marginBottom: 'var(--spacing-xl)',
    textAlign: 'left',
  },
  benefit: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--text-secondary)',
  },
  benefitIcon: {
    fontSize: 'var(--font-size-lg)',
    width: '24px',
    flexShrink: 0,
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
    marginBottom: 'var(--spacing-lg)',
  },
  allowButton: {
    width: '100%',
    padding: 'var(--spacing-md) var(--spacing-lg)',
    fontSize: 'var(--font-size-base)',
    fontWeight: 600,
    color: 'white',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
    cursor: 'pointer',
    transition: 'all var(--transition-base)',
    boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)',
  },
  denyButton: {
    width: '100%',
    padding: 'var(--spacing-md) var(--spacing-lg)',
    fontSize: 'var(--font-size-base)',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    background: 'transparent',
    border: '1px solid var(--gray-200)',
    borderRadius: 'var(--radius-lg)',
    cursor: 'pointer',
    transition: 'all var(--transition-base)',
  },
  footnote: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--text-tertiary)',
    margin: 0,
    lineHeight: 1.4,
  },
};

export default NotificationPrompt;