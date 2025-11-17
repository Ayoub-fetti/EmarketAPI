import Button from "./Button";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-3xl font-bold text-gray-900 mb-6">
            Empowering your digital lifestyle with the best devices at great
            prices.
          </h2>
          <Button
            size="lg"
            variant="primary"
            >
            Contact Us
          </Button>
        </div>

        <div className="border-t border-gray-200 pt-8 mb-8">
          <nav className="flex justify-center gap-8 mb-8">
            <a
              href="#"
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              About
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              Products
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              Works
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              Support
            </a>
          </nav>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <p className="text-gray-600 text-sm">
                © Copyright 2025, All Rights Reserved
              </p>

              <div className="flex gap-6">
                <a
                  href="#"
                  aria-label="Twitter"
                  className="text-gray-600 hover:text-orange-600 transition-colors"
                >
                  <i class="fa-brands fa-x-twitter"></i>{" "}
                </a>
                <a
                  href="#"
                  aria-label="Facebook"
                  className="text-gray-600 hover:text-orange-600 transition-colors"
                >
                  <i class="fa-brands fa-facebook-f"></i>{" "}
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="text-gray-600 hover:text-orange-600 transition-colors"
                >
                  <i class="fa-brands fa-instagram"></i>
                </a>
                <a
                  href="#"
                  aria-label="GitHub"
                  className="text-gray-600 hover:text-orange-600 transition-colors"
                >
                  <i class="fa-brands fa-github"></i>
                </a>
              </div>

              <div className="flex gap-8">
                <a
                  href="#"
                  className="text-gray-600 hover:text-orange-600 text-sm font-medium transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:text-orange-600 text-sm font-medium transition-colors"
                >
                  Terms & Conditions
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
