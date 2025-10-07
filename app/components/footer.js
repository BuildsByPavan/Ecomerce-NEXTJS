"use client";

import { FaArrowRight, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { useRouter } from "next/navigation";

function Footer() {
  const router = useRouter();

  const navigateTo = (path) => {
    router.push(path);
  };

  return (
    <footer className="w-full bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white py-12 px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">

        {/* Brand & Newsletter */}
        <div className="flex flex-col p-2">
          <h1 className="mb-4 text-3xl font-bold text-white">Exclusive</h1>
          <h3
            className="mb-2 text-lg text-gray-300 cursor-pointer px-4 py-2 rounded-md hover:bg-blue-600 hover:text-white transition-all duration-300 inline-block"
          >
            Subscribe
          </h3>

          <p className="text-sm text-gray-400 mb-4">Get 10% off on your first order</p>
          <div className="relative w-full group">
            <input
              type="email"
              placeholder="Your email"
              className="w-full pr-12 pl-4 py-3 rounded-md border border-gray-600 bg-gray-800 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <FaArrowRight
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white text-lg cursor-pointer hover:text-blue-500 scale-110 transition"
            />
          </div>
        </div>

        {/* Support */}
        <div className="flex flex-col p-2">
          <h1 className="mb-4 text-2xl font-semibold text-white">Support</h1>
          <p className="mb-2 text-gray-400 text-sm">5-54/A Old Duppada, Shivalayam Street, Vizianagaram, Andhra Pradesh</p>
          <p className="mb-2 text-gray-400 text-sm">exclusive@gmail.com</p>
          <p className="text-gray-400 text-sm">+91 8639201363</p>
        </div>

        {/* Account */}
        <div className="flex flex-col p-2">
          <h1 className="mb-4 text-2xl font-semibold text-white">Account</h1>
          {["profile", "Cart","login","register"].map((item, index) => (
            <p
              key={index}
              onClick={() => navigateTo(`/${item.toLowerCase().replace(/\s/g, "")}`)}
              className="mb-2 text-gray-400 text-sm cursor-pointer hover:text-blue-500 hover:underline transition"
            >
              {item}
            </p>
          ))}
        </div>

        {/* Quick Links */}
        <div className="flex flex-col p-2">
          <h1 className="mb-4 text-2xl font-semibold text-white">Quick Links</h1>
          {["Privacy Policy", "Terms Of Use", "FAQ", "Contact"].map((item, index) => (
            <p
              key={index}
              onClick={() => navigateTo(`/${item.toLowerCase().replace(/\s/g, "")}`)}
              className="mb-2 text-gray-400 text-sm cursor-pointer hover:text-blue-500 hover:underline transition"
            >
              {item}
            </p>
          ))}
        </div>
      </div>

      {/* Bottom section */}
      <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between max-w-6xl mx-auto">
        <div className="flex gap-6 mb-4 sm:mb-0">
          {[
            { icon: FaFacebookF, link: "https://facebook.com", hover: "text-blue-500" },
            { icon: FaTwitter, link: "https://twitter.com", hover: "text-sky-400" },
            { icon: FaInstagram, link: "https://instagram.com", hover: "text-pink-500" },
            { icon: FaLinkedinIn, link: "https://linkedin.com", hover: "text-blue-400" },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <a
                key={index}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xl transition transform hover:${item.hover} hover:scale-110 cursor-pointer`}
              >
                <Icon />
              </a>
            );
          })}
        </div>
        <p className="text-gray-400 text-sm text-center sm:text-left">
          © {new Date().getFullYear()} Exclusive. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
