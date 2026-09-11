import React from 'react';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-400 py-6 border-t border-gray-800">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Compact Content Row */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-4 border-b border-gray-800/80">
                    {/* Brand Section */}
                    <div className="flex items-center gap-3">
                        <img src="/images/k4kissan-logo.svg" alt="K4kissan" className="h-7 w-auto object-contain brightness-200" />
                        <span className="text-xs text-gray-400 hidden sm:inline border-l border-gray-700 pl-3">
                            Direct farm-to-doorstep agricultural marketplace.
                            <br />Khet Se Bazzar Tak
                        </span>
                    </div>

                    {/* Compact Contact Badges */}
                    <div className="flex items-center gap-5 text-xs text-gray-300 flex-wrap justify-center">
                        <span className="flex items-center gap-1.5 hover:text-emerald-400 transition">
                            <Phone size={14} className="text-emerald-500" />
                            +91 98765 43210
                        </span>
                        <span className="flex items-center gap-1.5 hover:text-emerald-400 transition">
                            <Mail size={14} className="text-emerald-500" />
                            support@k4kissan.com
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-400 hidden lg:flex">
                            <MapPin size={14} className="text-emerald-500" />
                            Agri District, India
                        </span>
                    </div>
                </div>

                {/* Bottom Row: Copyright text alongside horizontal social media icons */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <p className="text-gray-400 text-center sm:text-left">
                        &copy; 2026 K4kissan. All rights reserved.
                    </p>

                    <div className="flex items-center gap-3">
                        <a href="#" className="bg-gray-800 p-1.5 rounded-full text-gray-300 hover:bg-emerald-600 hover:text-white transition" aria-label="Facebook">
                            <Facebook size={15} />
                        </a>
                        <a href="#" className="bg-gray-800 p-1.5 rounded-full text-gray-300 hover:bg-emerald-600 hover:text-white transition" aria-label="Twitter">
                            <Twitter size={15} />
                        </a>
                        <a href="#" className="bg-gray-800 p-1.5 rounded-full text-gray-300 hover:bg-emerald-600 hover:text-white transition" aria-label="Instagram">
                            <Instagram size={15} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
