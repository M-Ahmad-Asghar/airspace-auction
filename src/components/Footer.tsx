import Link from 'next/link';
import { Logo } from './Logo';
import { Mail, Facebook, Youtube, Instagram } from 'lucide-react';

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export function Footer() {
  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/airplanedeals', name: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com/airplanedeals', name: 'Instagram' },
    { icon: XIcon, href: 'https://x.com/airplanedeals', name: 'X (Twitter)' },
    { icon: Youtube, href: 'https://youtube.com/@airplanedeals', name: 'YouTube' },
  ];

  const sections = [
    {
      title: 'Browse',
      links: [
        { name: 'Search', href: '/home' },
        { name: 'Aircraft', href: '/home?category=Aircraft' },
        { name: 'Parts', href: '/home?category=Parts' },
        { name: 'Events', href: '/home?category=Events' },
        { name: 'Real Estate', href: '/home?category=Real+Estate' },
        { name: 'Places', href: '/home?category=Places' },
        { name: 'Services', href: '/home?category=Services' },
      ],
    },
    {
      title: 'Help & Support',
      links: [
        { name: 'FAQ', href: '/faq' },
        { name: 'How To', href: '/how-to' },
        { name: 'Contact', href: '/contact' },
        { name: 'Site Map', href: '/site-map' },
        { name: 'Home', href: '/' },
      ],
    },
    {
      title: 'Security & Legal',
      links: [
        { name: 'Security Center', href: '/security-center' },
        { name: 'Terms of Use', href: '/terms' },
        { name: 'Advertiser Agreement', href: '/advertiser-agreement' },
        { name: 'Privacy Policy', href: '/privacy' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Logo and Contact */}
          <div className="space-y-6">
            <Link href="/">
              <Logo className="h-8 w-auto text-white" />
            </Link>
            <div className="flex items-center gap-2 text-gray-300">
              <Mail className="h-5 w-5" />
              <a href="mailto:Ops@airplanedeals.com" className="hover:text-white transition-colors text-sm">
                Ops@airplanedeals.com
              </a>
            </div>
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <Link 
                  key={index} 
                  href={social.href} 
                  className="text-gray-400 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.name}
                >
                  <social.icon className="h-6 w-6" />
                </Link>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {sections.map((section) => (
            <div key={section.title} className="pt-2">
              <h3 className="font-bold text-white mb-4 border-b border-gray-700 pb-2">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="hover:text-white transition-colors text-sm text-gray-300">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 py-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Airplane Deals. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
