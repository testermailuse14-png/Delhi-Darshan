import DistanceCalculator from "@/components/DistanceCalculator";

export const CabCalculatorPage = () => {
  return (
    <main className="min-h-screen pt-24 pb-16 bg-linear-to-b from-white to-amber-500">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-amber-600 font-serif">
            Cab Fare Calculator
          </h1>
          <p className="text-muted-foreground text-lg">
            Calculate estimated cab fares based on actual distance using Google Maps
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <DistanceCalculator />
        </div>
      </div>
    </main>
  );
};
