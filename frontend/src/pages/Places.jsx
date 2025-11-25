import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import GoogleMapComponent from "@/components/GoogleMapComponent";
import { searchPlaces } from "@/lib/placeService";

import redFort from "@/assets/redfort.jpeg";
import qutubMinar from "@/assets/qutub-minar.jpeg";
import lotusTemple from "@/assets/lotustemple.jpeg";
import humayunTomb from "@/assets/humayutomb.jpeg";

import { Search, MapPin, Loader, MessageCircle } from "lucide-react";
import {ChatbotSidebar} from "@/components/ChatBotSider";

const popularPlaces = [
  {
    name: "Red Fort",
    image: redFort,
    description:
      "A historic fort in Old Delhi that served as the main residence of the Mughal emperors.",
    location: "Netaji Subhash Marg, Chandni Chowk",
    lat: 28.6562,
    lng: 77.2410,
  },
  {
    name: "Qutub Minar",
    image: qutubMinar,
    description:
      "A UNESCO World Heritage Site, this 73-meter tall minaret is a masterpiece of Indo-Islamic architecture.",
    location: "Mehrauli",
    lat: 28.5244,
    lng: 77.1855,
  },
  {
    name: "Lotus Temple",
    image: lotusTemple,
    description:
      "A Bahá'í House of Worship noted for its flower-like shape and stunning modern architecture.",
    location: "Bahapur, Kalkaji",
    lat: 28.5535,
    lng: 77.2588,
  },
  {
    name: "Humayun's Tomb",
    image: humayunTomb,
    description:
      "The tomb of the Mughal Emperor Humayun, a UNESCO World Heritage Site and inspiration for the Taj Mahal.",
    location: "Nizamuddin East",
    lat: 28.5921,
    lng: 77.2519,
  },
];

export const Places = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [displayedPlaces, setDisplayedPlaces] = useState(popularPlaces);
  const searchInputRef = useRef(null);

  // Chatbot Sidebar State
  const [Open, setOpen] = useState(false);

  // Handle search input
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      setIsSearching(true);
      searchPlaces(query, (predictions) => {
        setSearchResults(predictions || []);
        setShowSuggestions(true);
        setIsSearching(false);
      });
    } else {
      setShowSuggestions(false);
      setDisplayedPlaces(popularPlaces);
    }
  };

  // Click on dynamic search result → navigate
  const handleSuggestionClick = (prediction) => {
    navigate(`/places/${encodeURIComponent(prediction.place_id)}`);
    setShowSuggestions(false);
  };

  // Click on predefined card → navigate
  const handlePredefinedPlaceClick = (place) => {
    navigate(`/places/${encodeURIComponent(place.name)}`);
  };

  // Prepare markers for Google Map
  const mapMarkers = displayedPlaces.map((place) => ({
    title: place.name,
    lat: place.lat,
    lng: place.lng,
    description: place.description,
    location: place.location,
  }));

  return (
    <main className="min-h-screen pt-24 pb-16 bg-linear-to-b from-white to-amber-600">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-amber-600 font-serif">
            Popular Tourist Places
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Discover the most iconic destinations in Delhi - Search any place to explore!
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <div className="flex">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search places in Delhi..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.length > 2 && setShowSuggestions(true)}
                className="rounded-l-2xl"
              />
              <button className="text-white px-4 rounded-r-2xl bg-amber-500 hover:bg-amber-400 flex justify-center items-center">
                {isSearching ? (
                  <Loader className="text-white animate-spin h-5 w-5" />
                ) : (
                  <Search className="text-white" />
                )}
              </button>
            </div>

            {/* Search Dropdown */}
            {showSuggestions && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
                {searchResults.slice(0, 6).map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(result)}
                    className="w-full text-left px-4 py-3 hover:bg-amber-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-amber-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {result.main_text}
                        </p>
                        <p className="text-xs text-gray-500">
                          {result.secondary_text}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Locations on Map</h2>
          <GoogleMapComponent
            markers={mapMarkers}
            zoom={12}
            onMarkerClick={(marker) => {
              const place = displayedPlaces.find((p) => p.name === marker.title);
              if (place) handlePredefinedPlaceClick(place);
            }}
          />
        </div>

        {/* Search or Popular Places Section */}
        {searchResults.length > 0 && showSuggestions ? (
          <>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Search Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.slice(0, 9).map((result, index) => (
                <Card
                  key={index}
                  className="overflow-hidden shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  onClick={() => handleSuggestionClick(result)}
                >
                  <div className="h-48 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                    <MapPin className="h-16 w-16 text-amber-400 opacity-50" />
                  </div>
                  <div className="p-4 text-left">
                    <h3 className="text-xl font-semibold mb-2">{result.main_text}</h3>
                    <p className="text-muted-foreground text-sm">
                      {result.secondary_text}
                    </p>
                    <button className="mt-4 w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors">
                      View Details
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Popular Tourist Places</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedPlaces.map((place, index) => (
                <Card
                  key={index}
                  className="overflow-hidden shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  onClick={() => handlePredefinedPlaceClick(place)}
                >
                  <img
                    src={place.image}
                    alt={place.name}
                    className="h-48 w-full object-cover transform transition-transform duration-500 hover:scale-110"
                  />
                  <div className="p-4 text-left">
                    <h3 className="text-xl font-semibold mb-2">{place.name}</h3>
                    <p className="text-muted-foreground text-sm mb-2">
                      {place.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 gap-1">
                      <MapPin className="w-4 h-4 text-amber-600" />
                      <span>{place.location}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Floating Chatbot Button + Sidebar */}
      <div className="mt-6">
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 p-4 rounded-full bg-amber-600 text-white shadow-lg hover:bg-amber-700 transition"
        >
          <MessageCircle className="h-6 w-6" />
        </button>

        {/* Chatbot Sidebar */}
        <ChatbotSidebar isOpen={Open} onClose={() => setOpen(false)} />
      </div>
    </main>
  );
};
