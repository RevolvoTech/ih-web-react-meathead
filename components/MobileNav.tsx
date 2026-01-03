"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const sections = [
  { id: "hero", label: "Home" },
  { id: "showcase", label: "Nutrition" },
  { id: "comparison", label: "Us vs Them" },
  { id: "protocol", label: "Protocol" },
  { id: "why", label: "Why Us" },
  { id: "math", label: "The Math" },
  { id: "cooking", label: "Cook Guide" },
  { id: "founders", label: "Founders" },
  { id: "reviews", label: "Reviews" },
  { id: "pricing", label: "Pricing" },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsOpen(false);
    }
  };

  return (
    <>
      <motion.button
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 right-4 z-40 md:hidden bg-meathead-red hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-all duration-300"
        aria-label="Toggle Menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 z-30 md:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-64 bg-meathead-charcoal border-l-2 border-meathead-red/30 z-40 md:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-heading text-2xl text-meathead-red uppercase tracking-tighter">
                    Menu
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <nav className="space-y-2">
                  {sections.map((section, index) => (
                    <motion.button
                      key={section.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => scrollToSection(section.id)}
                      className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-meathead-gray transition-all duration-300 font-data"
                    >
                      <span className="text-meathead-red mr-2 font-bold">{String(index + 1).padStart(2, '0')}</span>
                      {section.label}
                    </motion.button>
                  ))}
                </nav>

                <div className="mt-8 pt-8 border-t border-meathead-red/20">
                  <a
                    href="https://wa.me/923366957572"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-green-500 hover:bg-green-600 text-white font-heading text-center py-3 rounded-lg uppercase tracking-wider transition-all duration-300"
                  >
                    Order Now
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
