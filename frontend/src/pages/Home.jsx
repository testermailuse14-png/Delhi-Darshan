import { ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Calculator, Sparkles, ArrowRight,Car } from "lucide-react";


export const Home = () => {
  return (
    <div className="relative w-full h-screen bg-[url('/bg.jpg')] bg-cover bg-center">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-black/40"></div>

      {/* Text Content */}
      <div className="relative z-10 flex flex-col justify-center-x items-center h-full">
        <div className="text-center mt-35 px-10"> {/* 'mt-50' for margin from top, adjust as needed */}
          <h1 className="text-white font-bold  font-serif text-5xl leading-tight">Discover The Heart Of India</h1>
          <h2 className="text-white text-2xl font-bold mt-2">Like Never before</h2>
        </div>
        <div className="space-x-5 pt-5">
          <Link to="/places" className="relative inline-block px-6 py-2 rounded-2xl font-semibold text-white bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_4px_0_#b45309] transition-all duration-300 hover:shadow-[0_6px_12px_rgba(245,158,11,0.6)] hover:-translate-y-1 active:translate-y-0 active:shadow-[0_2px_0_#b45309]">
            Explore
          </Link>
          <Link to="/signin" className="relative inline-block px-6 py-2 rounded-2xl font-semibold text-white bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_4px_0_#b45309] transition-all duration-300 hover:shadow-[0_6px_12px_rgba(245,158,11,0.6)] hover:-translate-y-1 active:translate-y-0 active:shadow-[0_2px_0_#b45309]">
            Sign Up
          </Link>
        </div>
            <motion.div
              animate={{ y: [0, 10, 0] }}  // moves down slightly and back up
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex justify-center items-center mt-4"
            >
              <ArrowDown size={40} className="text-white" />
            </motion.div>
      </div>
      {/* Features Section */}
      <section className="py-20 bg-muted/30 bg-linear-to-b from-white to-amber-400">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif  font-bold mb-4">What We Offer</h2>
            <p className="text-amber-600 text-lg">Everything you need for your Delhi adventure</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/Places" className="group">
              <div className="bg-card p-8 rounded-lg shadow-lg hover:shadow-[var(--shadow-hover)] transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <MapPin className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Tourist Places</h3>
                <p className="text-muted-foreground">Discover popular attractions and hidden gems across Delhi</p>
              </div>
            </Link>
            <Link to="/cab-booking" className="group">
              <div className="bg-card p-8 rounded-lg shadow-lg hover:shadow-[var(--shadow-hover)] transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                  <Car className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Cab Booking</h3>
                <p className="text-muted-foreground">Calculate estimated fares for your journey and connect with the local drivers.</p>
              </div>
            </Link>
            <Link to="/hidden-gems" className="group">
              <div className="bg-card p-8 rounded-lg shadow-lg hover:shadow-[var(--shadow-hover)] transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <Sparkles className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Hidden Gems</h3>
                <p className="text-muted-foreground">Find and share secret spots loved by locals and experience Delhi like a local.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
