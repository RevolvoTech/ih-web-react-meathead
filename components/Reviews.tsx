"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const reviews = [
  {
    name: "Hassan_Liftz",
    role: "Gym Bro",
    rating: 5,
    review: "Ordered Batch 01 after a heavy leg day at GritFit. The pump was so real I almost tore my favorite stringer. 24g+ of protein? Felt like 50g. My testosterone increased just by looking at the packaging. No seed oils = No lethargy. I'm ready to fight a bear now.",
    response: "Bear season is open, Hassan. See you next Saturday for the double patty.",
    rotation: "-rotate-1",
    borderColor: "border-green-500/50",
  },
  {
    name: "Anonymous Vegan",
    role: "Hater",
    rating: 1,
    review: "Absolutely disgusting. Too much meat. Too much blood. Stay away. This is everything wrong with toxic masculinity and carnivore culture.",
    response: "Our bad. We forgot to add the soy fillers and kale. Go eat a salad; we've got PRs to hit. 💪",
    rotation: "rotate-0",
    borderColor: "border-meathead-red",
    highlight: true,
  },
  {
    name: "StackOverflow_Warrior",
    role: "Software Dev",
    rating: 5,
    review: "Finally, a burger with zero bugs. The 80/20 fat ratio is a perfectly optimized algorithm. No bloat, no lag, just high-performance fuel. It's like a Clean Code version of a meal. 10/10 Documentation on the protein sourcing.",
    response: "Merge request accepted. Deployment to your stomach is scheduled for Saturday afternoon.",
    rotation: "rotate-1",
    borderColor: "border-blue-500/50",
  },
];

export default function Reviews() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="py-20 px-4 bg-meathead-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-5xl md:text-7xl mb-4 uppercase tracking-heading">
            THE GOOD, THE BAD,
            <br />
            AND THE <span className="text-meathead-red">SOY-FREE</span>
          </h2>
          <p className="text-gray-400 text-lg">Real reviews from real people (yes, even the haters)</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className={`relative ${review.rotation}`}
            >
              <div
                className={`bg-meathead-gray/80 backdrop-blur-sm border-2 ${
                  review.highlight ? review.borderColor : `${review.borderColor} hover:border-opacity-100`
                } rounded-xl p-6 ${review.highlight ? 'shadow-xl shadow-meathead-red/20' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-white font-bold">{review.name}</p>
                    <p className="text-gray-400 text-sm font-data">{review.role}</p>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? 'text-yellow-400' : 'text-gray-600'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>

                <blockquote className="text-gray-300 text-sm leading-relaxed mb-4 italic">
                  "{review.review}"
                </blockquote>

                <div className="pt-4 mt-4 border-t border-meathead-red/20">
                  <p className="text-xs text-gray-400 mb-1 font-data uppercase tracking-wider">Our Response:</p>
                  <p className="text-white text-sm font-bold">{review.response}</p>
                </div>
              </div>

              {review.highlight && (
                <div className="absolute -top-3 -right-3 bg-meathead-red text-white font-heading text-xs px-3 py-1 rounded-full uppercase tracking-heading">
                  Not for Everyone
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 text-sm italic">
            Got beef with us? DM us on WhatsApp. We'll either fix it or roast you back. 🔥
          </p>
        </motion.div>
      </div>
    </section>
  );
}
