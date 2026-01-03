"use client";

import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-meathead-black border-t border-meathead-gray py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <Image
                src="/images/logo.png"
                alt="Meathead Logo"
                width={60}
                height={60}
                className="w-16 h-16 md:w-[60px] md:h-[60px] rounded-full"
              />
              <span className="font-heading text-3xl text-meathead-red uppercase tracking-tighter">MEATHEAD</span>
            </div>
            <p className="text-gray-400 text-sm">
              Premium beef patties for serious gains.
              <br />
              No BS. Just quality protein.
            </p>
          </div>

          <div className="text-center">
            <h3 className="font-heading font-bold text-xl text-meathead-red mb-4 uppercase tracking-tighter">CONTACT</h3>
            <a
              href="https://wa.me/923354818171"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors duration-300 block mb-4"
            >
              WhatsApp: +92 335 4818171
            </a>
            <div className="mt-4 pt-4 border-t border-meathead-gray/30">
              <p className="text-gray-400 text-xs mb-2 font-data">DELIVERY AREAS</p>
              <p className="text-gray-300 text-sm">
                Bahria 7, 8 | DHA 1, 2, 4
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Friday 6-8 PM
              </p>
            </div>
          </div>

          <div className="text-center md:text-right">
            <h3 className="font-heading font-bold text-xl text-meathead-red mb-4 uppercase tracking-tighter">THE PROMISE</h3>
            <p className="text-gray-400 text-sm">
              24G+ Protein
              <br />
              125G Patty
              <br />
              80/20 Precision
              <br />
              0% Fillers
            </p>
          </div>
        </div>

        <div className="border-t border-meathead-gray pt-8 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} Meathead. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Built for athletes who demand real protein.
          </p>
        </div>
      </div>
    </footer>
  );
}
