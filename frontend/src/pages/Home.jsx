import Button from "../components/tools/Button";
import homeImage from "../../public/home.png";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-orange-700 rounded-3xl shadow-lg overflow-hidden -mt-16">
        <div className="px-8 md:px-16 py-12 flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Left Content Section - positioned behind image */}
          <div className="flex-1 relative z-0">
            <h1 className="absolute top-1/8 left-0 text-4xl md:text-5xl lg:text-6xl font-bold text-gray-300 whitespace-nowrap">
              Find Your Inspiration
            </h1>

            <p className="mt-32 text-lg text-white mb-8 leading-relaxed max-w-md">
              FastShop is a modern online store that offers a wide range of
              high-quality electronic devices, combining performance,
              innovation, and affordability for every tech enthusiast.
            </p>
            <Link to="/products">
              <Button size="lg" variant="secondary">
                Explore All Products
              </Button>
            </Link>
          </div>

          {/* Right Image Section - overlays on top of h1 */}
          <div className="flex-1 flex justify-center relative z-10">
            <div className="relative top-12 w-full max-w-md h-96 flex items-center justify-center">
              <img
                src={homeImage}
                alt="Woman wearing red headphones - FETTY inspiration"
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
