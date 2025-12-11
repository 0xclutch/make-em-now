import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from './authy';

function AuthenticatedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSessionValid, setIsSessionValid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const checkAuthAndSession = async () => {
      try {
        // Get current session
        const session = await auth.getSession();
        
        if (!session) {
          if (mounted) {
            setIsAuthenticated(false);
            setIsSessionValid(false);
            setLoading(false);
          }
          return;
        }

        // Try to refresh the session to ensure it's still valid
        try {
          await auth.refreshSession();
          if (mounted) {
            setIsAuthenticated(true);
            setIsSessionValid(true);
          }
        } catch (error) {
          console.error('Session refresh failed:', error);
          if (mounted) {
            setIsAuthenticated(false);
            setIsSessionValid(false);
          }
          await auth.signOut(); // Sign out if session is invalid
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (mounted) {
          setIsAuthenticated(false);
          setIsSessionValid(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Check immediately
    checkAuthAndSession();

    // Set up auth state listener
    const subscription = auth.onAuthStateChange(async (session) => {
      if (!session) {
        if (mounted) {
          setIsAuthenticated(false);
          setIsSessionValid(false);
        }
        return;
      }
      
      // Recheck session validity on auth state change
      checkAuthAndSession();
    });

    // Periodic session check every 5 minutes
    const intervalId = setInterval(checkAuthAndSession, 5 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !isSessionValid) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AuthenticatedRoute;