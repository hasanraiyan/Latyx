import { Routes, Route } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import EditorPage from '@/pages/EditorPage';
import ApiKeysPage from '@/pages/ApiKeysPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { SignIn, SignUp } from '@clerk/clerk-react';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* Auth routes */}
      <Route
        path="/sign-in/*"
        element={
          <div className="flex justify-center items-center min-h-screen bg-muted/20">
            <SignIn routing="path" path="/sign-in" />
          </div>
        }
      />
      <Route
        path="/sign-up/*"
        element={
          <div className="flex justify-center items-center min-h-screen bg-muted/20">
            <SignUp routing="path" path="/sign-up" />
          </div>
        }
      />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/api-keys" element={<ApiKeysPage />} />
      </Route>
    </Routes>
  );
}

export default App;
