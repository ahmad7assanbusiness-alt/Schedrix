import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import { api } from '../api/client.js';
import { requestNotificationPermission, subscribeToPushNotifications } from '../services/notificationService.js';

const NotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const hasHandledPrompt = useRef(false); // Track if we've already handled the prompt

  // Check if app is installed as PWA
  const isInstalledPWA = () => {
    return window.navigator.standalone || 
           window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: fullscreen)').matches;
  };

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationPrompt.jsx:20',message:'useEffect triggered - checking if prompt should show',data:{hasUser:!!user,currentShowPrompt:showPrompt,hasHandledPrompt:hasHandledPrompt.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A,C'})}).catch(()=>{});
    // #endregion
    
    // Only show prompt for installed PWAs, not browsers
    if (!isInstalledPWA()) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationPrompt.jsx:25',message:'Not installed PWA, returning early',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return;
    }

    // Only show prompt AFTER user is logged in (not on Welcome page or auth pages)
    if (!user || location.pathname === '/welcome' || location.pathname.startsWith('/auth/')) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationPrompt.jsx:30',message:'User not logged in or on auth page, not showing prompt',data:{hasUser:!!user,pathname:location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return;
    }

    // Don't show if we've already handled the prompt in this session
    if (hasHandledPrompt.current) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationPrompt.jsx:31',message:'Prompt already handled this session, skipping',data:{hasHandledPrompt:hasHandledPrompt.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A,C'})}).catch(()=>{});
      // #endregion
      return;
    }

    // Check if we've already shown the prompt before (using localStorage)
    const promptShown = localStorage.getItem('opticore_notification_prompt_shown');
    if (promptShown === 'true') {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationPrompt.jsx:38',message:'Prompt already shown before (localStorage), skipping',data:{promptShown},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A,C'})}).catch(()=>{});
      // #endregion
      return;
    }

    // Don't show if already showing
    if (showPrompt) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationPrompt.jsx:44',message:'Prompt already showing, skipping',data:{currentShowPrompt:showPrompt},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A,C'})}).catch(()=>{});
      // #endregion
      return;
    }

    // Show the prompt - user is logged in and this is the first time
    // Add a delay to ensure page is fully loaded after login
    const timer = setTimeout(() => {
      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationPrompt.jsx:66',message:'Showing prompt for first time after login',data:{currentShowPrompt:showPrompt,pathname:location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'A,C'})}).catch(()=>{});
        // #endregion
        setShowPrompt(true);
      } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationPrompt.jsx:69',message:'Error in setShowPrompt(true)',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        console.error('Error showing notification prompt:', error);
      }
    }, 1000); // Delay 1 second after login to let dashboard load

    return () => clearTimeout(timer);
  }, [user, location.pathname]); // Depend on user and location

  const handleAllow = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationPrompt.jsx:103',message:'handleAllow called',data:{currentShowPrompt:showPrompt,userPermission:user?.notificationPermission,hasHandledPrompt:hasHandledPrompt.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B,D'})}).catch(()=>{});
    // #endregion
    setIsLoading(true);
    // Mark as handled immediately to prevent re-showing
    hasHandledPrompt.current = true;
    // Mark as shown in localStorage so it never shows again
    localStorage.setItem('opticore_notification_prompt_shown', 'true');
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationPrompt.jsx:113',message:'Set hasHandledPrompt and localStorage flag',data:{hasHandledPrompt:hasHandledPrompt.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A,C'})}).catch(()=>{});
    // #endregion
    // Don't hide immediately - wait for system permission response
    
    try {
      // Request notification permission (this shows the system dialog)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationPrompt.jsx:113',message:'Calling requestNotificationPermission',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      const permission = await requestNotificationPermission();
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationPrompt.jsx:116',message:'requestNotificationPermission returned',data:{permission,currentShowPrompt:showPrompt},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B,D'})}).catch(()=>{});
      // #endregion
      
      // Hide the modal immediately after we get the system response
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationPrompt.jsx:119',message:'Calling setShowPrompt(false) in handleAllow',data:{permission,currentShowPrompt:showPrompt},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      // Hide immediately - React will re-render and remove the overlay
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
        
      }
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationPrompt.jsx:102',message:'Error in handleAllow catch block',data:{error:error.message,currentShowPrompt:showPrompt},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      console.error('Error handling notification permission:', error);
      // Hide modal even on error
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationPrompt.jsx:106',message:'Calling setShowPrompt(false) in catch block',data:{error:error.message,currentShowPrompt:showPrompt},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'B,D'})}).catch(()=>{});
      // #endregion
      setShowPrompt(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeny = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationPrompt.jsx:115',message:'handleDeny called',data:{currentShowPrompt:showPrompt,hasHandledPrompt:hasHandledPrompt.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'B,D'})}).catch(()=>{});
    // #endregion
    setIsLoading(true);
    // Mark as handled immediately to prevent re-showing
    hasHandledPrompt.current = true;
    // Mark as shown in localStorage so it never shows again
    localStorage.setItem('opticore_notification_prompt_shown', 'true');
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationPrompt.jsx:121',message:'Set hasHandledPrompt and localStorage flag in handleDeny',data:{hasHandledPrompt:hasHandledPrompt.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A,C'})}).catch(()=>{});
    // #endregion
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationPrompt.jsx:124',message:'Calling setShowPrompt(false) in handleDeny',data:{currentShowPrompt:showPrompt},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    setShowPrompt(false); // Hide immediately
    
    // Update user in database (optional - for tracking)
    try {
      await api.post('/notifications/permission', {
        permission: 'denied',
        prompted: true
      });
    } catch (error) {
      console.error('Error updating notification permission:', error);
      // Continue even if API fails
    } finally {
      setIsLoading(false);
    }
  };

  // Ensure component returns null immediately when not showing - no overlay in DOM
  if (!showPrompt) {
    return null;
  }
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationPrompt.jsx:186',message:'Component render: showPrompt is true, rendering modal',data:{showPrompt,userPermission:user?.notificationPermission,isLoading},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion

  // Ensure overlay is completely removed when not showing
  if (!showPrompt) {
    return null;
  }

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
    zIndex: 9999, // Lower z-index to avoid blocking other elements
    padding: 'var(--spacing-lg)',
    animation: 'fadeIn 0.3s ease-out',
    pointerEvents: 'auto', // Ensure overlay can receive clicks
  },
  overlayHidden: {
    display: 'none', // Completely hide when not showing
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