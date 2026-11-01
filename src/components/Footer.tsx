import React from 'react';
import { MessageCircle } from 'lucide-react';
import { GharmalakMark } from './Logo';
import { useLang } from '../data/translations';
import { buildWhatsAppUrl } from '../data/clubData';
import { RoutePath } from './Header';
import { Reveal } from './MotionPrimitives';

interface FooterProps {
  onNavigate: (path: RoutePath, hash?: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { t } = useLang();

  const handleNav = (e: React.MouseEvent, path: RoutePath, hash?: string) => {
    e.preventDefault();
    onNavigate(path, hash);
  };

  return (
    <footer className="bg-[#064E3B] text-white border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Brand & Tagline: Logo gentle scale-in + tagline reveal from left */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <Reveal variant="scale-up" scale={0.9} duration={0.44}>
              <a
                href="/"
                onClick={(e) => handleNav(e, '/')}
                className="group flex items-center gap-2.5 text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 transition-opacity duration-200 hover:opacity-90"
              >
                <span className="transition-transform duration-300 ease-out group-hover:rotate-6 group-hover:scale-105">
                  <GharmalakMark size={24} color="#FFC928" />
                </span>
                <span>
                  Gharmalak<span className="text-[#FFC928] font-medium">.com</span>
                </span>
              </a>
            </Reveal>
            <span className="hidden sm:inline text-white/30" aria-hidden="true">
              ·
            </span>
            <Reveal variant="slide-left" x={-20} delay={0.06} duration={0.48}>
              <p className="text-sm text-white/80">{t.footer_line}</p>
            </Reveal>
          </div>

          {/* Navigation & Legal Links: Reveal from alternating right direction */}
          <Reveal variant="slide-right" x={24} delay={0.1} duration={0.52}>
            <nav
              aria-label="Footer"
              className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/85"
            >
              <a
                href="/how-it-works"
                onClick={(e) => handleNav(e, '/how-it-works')}
                className="gm-footer-link hover:text-[#FFC928] whitespace-nowrap"
              >
                {t.nav_how}
              </a>
              <a
                href="/deals"
                onClick={(e) => handleNav(e, '/deals')}
                className="gm-footer-link hover:text-[#FFC928] whitespace-nowrap"
              >
                {t.nav_deals}
              </a>
              <a
                href="/round/solar-nagpur"
                onClick={(e) => handleNav(e, '/round/solar-nagpur')}
                className="gm-footer-link hover:text-[#FFC928] whitespace-nowrap"
              >
                {t.nav_round}
              </a>
              <a
                href="/property/vedira-anand"
                onClick={(e) => handleNav(e, '/property/vedira-anand')}
                className="gm-footer-link hover:text-[#FFC928] whitespace-nowrap"
              >
                Vedira Anand
              </a>
              <a
                id="footer-for-business-link"
                href="/for-business"
                onClick={(e) => handleNav(e, '/for-business')}
                className="gm-footer-link hover:text-[#FFC928] whitespace-nowrap"
              >
                For Business
              </a>
              <a
                href="/privacy"
                onClick={(e) => handleNav(e, '/privacy')}
                className="gm-footer-link hover:text-[#FFC928] whitespace-nowrap"
              >
                {t.privacy}
              </a>
              <a
                href={buildWhatsAppUrl('Hi Gharmalak, I want to know more about the club.')}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-[#FFC928] hover:underline whitespace-nowrap transition-transform duration-200 hover:-translate-y-0.5"
              >
                <MessageCircle className="w-4 h-4 transition-transform duration-300 ease-out group-hover:rotate-12 group-hover:scale-110" />
                <span>+91 77678 77675</span>
              </a>
              <span className="text-white/60 whitespace-nowrap">
                © {new Date().getFullYear()} Gharmalak
              </span>
            </nav>
          </Reveal>
        </div>
      </div>
    </footer>
  );
}
