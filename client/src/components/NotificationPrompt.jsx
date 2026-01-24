import { useState, useEffect } from 'react';
import { useAuth } from '../auth/useAuth.js';
import { api } from '../api/client.js';
import { NotificationService } from '../services/notificationService.js';

const NotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateUser } = useAuth();

  useEffect(() => {
    // Check if we should show the prompt
    const shouldShowPrompt = () => {
      if (!user) return false;
      
      // Don't show if user has already granted permission
      if (user.notificationPermission === 'granted') return false;
      
      // Show if user has never been prompted or has denied but we should ask again
      if (user.notificationPermission === 'pending' || 
          (user.notificationPermission === 'denied' && !user.notificationPrompted)) {
        return true;
      }
      
      return false;
    };

    if (shouldShowPrompt()) {
      // Small delay to let the page load
      setTimeout(() => setShowPrompt(true), 2000);
    }
  }, [user]);

  const handleAllow = async () => {
    setIsLoading(true);
    try {
      // Request notification permission
      const permission = await NotificationService.requestPermission();
      
      if (permission === 'granted') {
        // Subscribe to notifications
        const subscription = await NotificationService.subscribe();
        
        // Update user in database
        await api.post('/notifications/permission', {
          permission: 'granted',
          prompted: true
        });
        
        // Update user state
        updateUser({
          ...user,
          notificationPermission: 'granted',
          notificationPrompted: true
        });
        
        setShowPrompt(false);
      } else {
        // Permission denied
        await api.post('/notifications/permission', {
          permission: 'denied',
          prompted: true
        });
        
        updateUser({
          ...user,
          notificationPermission: 'denied',
          notificationPrompted: true
        });
        
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Error handling notification permission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeny = async () => {
    setIsLoading(true);
    try {
      // Update user in database
      await api.post('/notifications/permission', {
        permission: 'denied',
        prompted: false // Keep false so we ask again next time
      });
      
      // Update user state
      updateUser({
        ...user,
        notificationPermission: 'denied',
        notificationPrompted: false
      });
      
      setShowPrompt(false);
    } catch (error) {
      console.error('Error updating notification permission:', error);
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
            style={styles.allowButton}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {isLoading ? 'Setting up...' : 'Allow Notifications'}
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