import Link from 'next/link';
import { MapPin, Sparkles, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-20 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white">
                <Sparkles size={16} />
              </div>
              <span className="logo-script text-2xl text-white font-bold">Vibespot</span>
            </div>
            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              Your authentic guide to discovering cafés, street food, and family dining in Kakinada, Andhra Pradesh. Designed with love for students, young foodies, and families.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <MapPin size={14} className="text-orange-500 shrink-0" />
              <span>Covering Suryaraopeta, Bhanugudi, Ramanayyapeta, SRMT Mall & more</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200 mb-3">
              Explore Kakinada
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link href="/" className="hover:text-orange-400 transition-colors">
                  All 54 Places
                </Link>
              </li>
              <li>
                <Link href="/?category=Caf%C3%A9s" className="hover:text-orange-400 transition-colors">
                  Cafés & Hangouts
                </Link>
              </li>
              <li>
                <Link href="/?category=Street%20Food%20%26%20Quick%20Bites" className="hover:text-orange-400 transition-colors">
                  Street Food & Quick Bites
                </Link>
              </li>
              <li>
                <Link href="/?category=Restaurants%20%26%20Family%20Dining" className="hover:text-orange-400 transition-colors">
                  Family Dining
                </Link>
              </li>
              <li>
                <Link href="/?tags=Budget-Friendly" className="hover:text-orange-400 transition-colors">
                  Budget Friendly
                </Link>
              </li>
            </ul>
          </div>

          {/* Transparency & Community */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200 mb-3">
              Transparency
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed mb-3">
              Distances calculated via straight-line Haversine formula based on your GPS location.
            </p>
            <p className="text-xs text-stone-500 leading-relaxed">
              No scraped Google Maps photos. Only permitted images or curated category placeholders are displayed.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Vibespot Kakinada. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart size={12} className="text-rose-500 fill-rose-500" /> for the Kakinada foodie community
          </p>
        </div>
      </div>
    </footer>
  );
}

