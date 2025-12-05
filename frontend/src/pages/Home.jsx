import Button from "../components/tools/Button";
import LazyImage from "../components/tools/LazyImage";
import homeImage from "../../public/home.png";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      {/* Section d'Accueil (Home Section) - Le contenu existant */}
      <div className="w-full max-w-6xl bg-orange-700 rounded-3xl shadow-lg overflow-hidden mt-12">
        <div className="px-8 md:px-16 py-12 flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Left Content Section - positioned behind image */}
          <div className="flex-1 relative z-0">
            <h1 className="absolute top-1/8 left-0 text-4xl md:text-5xl lg:text-6xl font-bold text-gray-300 whitespace-nowrap">
              Find Your Inspiration
            </h1>

            <p className="mt-32 text-lg text-white mb-8 leading-relaxed max-w-md">
              <span className="font-bold">FastShop</span> is a modern online store that offers a
              wide range of high-quality electronic devices, combining performance, innovation, and
              affordability for every tech enthusiast.
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
              <LazyImage
                src={homeImage}
                alt="Woman wearing red headphones - FETTY inspiration"
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <section className="w-full max-w-6xl mt-20 mb-20 p-4 md:p-0">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold uppercase text-orange-600">Notre Histoire</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mt-2">
            L'Âge de la{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-600 to-red-500">
              Tech Accessible
            </span>
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl border border-gray-100/50">
          <p className="text-center text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            <span className="font-bold">FastShop</span> est votre partenaire pour l'avenir. Nous
            sélectionnons des dispositifs qui non seulement surpassent les attentes, mais
            redéfinissent ce que signifie être à la pointe de la technologie.
          </p>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Carte 1 : Notre Mission */}
            <div className="p-8 bg-gray-50 rounded-2xl shadow-inner hover:shadow-lg transition duration-300 transform hover:-translate-y-1 border border-orange-100">
              <div className="flex items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">Notre Mission</h3>
              </div>
              <p className="mb-4 leading-relaxed text-gray-700">
                Rendre la <span className="font-semibold">technologie de pointe</span> accessible à
                tous. Nous sélectionnons rigoureusement des produits qui allient
                <span className="font-semibold"> performance, innovation et design épuré</span> pour
                chaque passionné de tech.
              </p>
              <p className="leading-relaxed text-gray-700 font-medium">
                Notre engagement : Simplicité, Fiabilité, et Inspiration.
              </p>
            </div>

            {/* Carte 2 : Ce Que Nous Offrons */}
            <div className="p-8 bg-gray-50 rounded-2xl shadow-inner hover:shadow-lg transition duration-300 transform hover:-translate-y-1 border border-orange-100">
              <div className="flex items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">Ce Que Nous Offrons</h3>
              </div>
              <ul className="space-y-3 leading-relaxed text-gray-700">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2 mt-1">✓</span>
                  Innovation Quotidienne : Un catalogue constamment mis à jour avec les dernières
                  tendances.
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2 mt-1">✓</span>
                  Transparence : Des fiches produits détaillées et des avis clients vérifiés.
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2 mt-1">✓</span>
                  Support Premium : Une assistance personnalisée et rapide, toujours là pour vous.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      {/* --- Fin de la Nouvelle Section "À Propos" --- */}
    </main>
  );
}
