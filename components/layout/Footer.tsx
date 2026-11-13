import Link from 'next/link';
import { MapPin, Heart } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export function Footer() {
  return (
    <footer className="bg-white text-stone-600 mt-20 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Logo href="/" className="h-9 w-auto" />
            <p className="text-sm text-stone-500 max-w-sm leading-relaxed">
              Your authentic guide to discovering food, cafés, chillout places, and local gems in Kakinada, Andhra Pradesh. Designed with love for students, young explorers, and families.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <MapPin size={14} className="text-[#FF5A36] shrink-0" />
              <span>Covering Suryaraopeta, Bhanugudi, Ramanayyapeta, SRMT Mall & more</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-3">
              Explore Kakinada
            </h4>
            <ul className="space-y-2 text-sm text-stone-600">
              <li>
                <Link href="/" className="hover:text-[#FF5A36] transition-colors">
                  All Places
                </Link>
              </li>
              <li>
                <Link href="/?category=Caf%C3%A9s" className="hover:text-[#FF5A36] transition-colors">
                  Cafés & Hangouts
                </Link>
              </li>
              <li>
                <Link href="/?category=Street%20Food%20%26%20Quick%20Bites" className="hover:text-[#FF5A36] transition-colors">
                  Street Food & Quick Bites
                </Link>
              </li>
              <li>
                <Link href="/?category=Restaurants%20%26%20Family%20Dining" className="hover:text-[#FF5A36] transition-colors">
                  Family Dining
                </Link>
              </li>
              <li>
                <Link href="/?tags=Budget-Friendly" className="hover:text-[#FF5A36] transition-colors">
                  Budget Friendly
                </Link>
              </li>
              <li className="pt-2 border-t border-stone-100">
                <Link href="/feedback" className="hover:text-[#FF5A36] transition-colors text-[#FF5A36] font-semibold flex items-center gap-1">
                  Report a Bug / Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Transparency & Community */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-3">
              Transparency & Pricing
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed mb-3">
              *<strong>Price for two:</strong> Estimated average costs based on typical orders, not 100% fixed amounts. Actual restaurant bills vary.
            </p>
            <p className="text-xs text-stone-500 leading-relaxed mb-3">
              Distances calculated via straight-line Haversine formula based on your GPS location.
            </p>
            <p className="text-xs text-stone-400 leading-relaxed">
              No scraped Google Maps photos. Only permitted images or curated category placeholders are displayed.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} WhyStayIn Kakinada. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart size={12} className="text-[#FF5A36] fill-[#FF5A36]" /> for the Kakinada community
          </p>
        </div>
      </div>
    </footer>
  );
}

