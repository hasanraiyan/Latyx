import { useAuth, RedirectToSignIn } from '@clerk/clerk-react';
import { Outlet } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';

export default function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  return <Outlet />;
}
