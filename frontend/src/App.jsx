import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Places } from './pages/Places';
import { PlaceDetail } from './pages/PlaceDetail';
import { CabCalculatorPage } from './pages/CabBooking';
import { HiddenGems  } from './pages/HiddenGems';
import { Auth } from './pages/Auth';
import './App.css'
import { Routes, Route } from 'react-router-dom';
import { Toaster } from "sonner";
import { AuthProvider } from './context/AuthContext';
import { useLoadScript } from '@react-google-maps/api';

function AppContent() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'geometry'],
    preventGoogleFontsLoading: true,
  });
  if (loadError) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 flex items-center justify-center">
          <p className="text-gray-600">Error loading Google Maps</p>
        </main>
      </>
    );
  }

  if (!isLoaded) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 flex items-center justify-center">
          <p className="text-gray-600">Loading map resources...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/places" element={<Places/>} />
        <Route path="/places/:placeId" element={<PlaceDetail />} />
        <Route path="/cab-booking" element={<CabCalculatorPage />} />
        <Route path="/hidden-gems" element={<HiddenGems />} />
        <Route path="/signin" element={<Auth />} />
      </Routes>
      <Toaster
            position="bottom-center"
            richColors
            closeButton
            duration={3000}
      />
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
