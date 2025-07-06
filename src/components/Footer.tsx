
import Link from 'next/link';
import Image from 'next/image';
import { Logo } from './Logo';
import { Mail, Facebook, Youtube, Linkedin, Instagram } from 'lucide-react';

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

const PinterestIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="currentColor"
      {...props}
    >
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.088-.79-.167-2.006.034-2.868.182-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.428 1.81-2.428.852 0 1.264.64 1.264 1.408 0 .858-.545 2.14-.828 3.33-.236.995.5 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.135-4.515 4.34 0 .859.331 1.781.745 2.281a.3.3 0 0 1 .069.288l-.278 1.133c-.044.183-.145.223-.335.134-1.249-.58-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.775 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.525-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.938.33 1.96.504 3.031.504 5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
    </svg>
);


export function Footer() {
  const socialLinks = [
    { icon: Facebook, href: '#' },
    { icon: XIcon, href: '#' },
    { icon: Youtube, href: '#' },
    { icon: PinterestIcon, href: '#' },
    { icon: Linkedin, href: '#' },
    { icon: Instagram, href: '#' },
  ];

  const sections = [
    {
      title: 'Back to Top',
      links: [
        { name: 'Search', href: '#' },
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
        { name: 'FAQ', href: '#' },
        { name: 'How To', href: '#' },
        { name: 'Contact', href: '#' },
        { name: 'Site Map', href: '#' },
        { name: 'Home', href: '/' },
      ],
    },
    {
      title: 'Security & Legal',
      links: [
        { name: 'Security Center', href: '#' },
        { name: 'Terms of Use', href: '#' },
        { name: 'Advertiser Agreement', href: '#' },
        { name: 'Privacy Policy', href: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-muted text-muted-foreground mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Logo and Contact */}
          <div className="space-y-6">
            <Link href="/">
              <Logo className="h-8 w-auto" />
            </Link>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <a href="mailto:Ops@airplanedeals.com" className="hover:underline text-sm">
                Ops@airplanedeals.com
              </a>
            </div>
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <Link key={index} href={social.href} className="text-muted-foreground hover:text-foreground">
                  <social.icon className="h-6 w-6" />
                </Link>
              ))}
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4 text-sm">SHOP FASTER WITH THE APP</h4>
              <div className="flex gap-2">
                <Link href="#">
                  <Image src="https://placehold.co/135x40.png" alt="Get it on Google Play" width={135} height={40} data-ai-hint="google play" />
                </Link>
                <Link href="#">
                  <Image src="https://placehold.co/120x40.png" alt="Download on the App Store" width={120} height={40} data-ai-hint="app store" />
                </Link>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {sections.map((section) => (
            <div key={section.title} className="pt-2">
              <h3 className="font-bold text-foreground mb-4 border-b border-gray-400 pb-2">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="hover:underline text-sm">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-gray-300">
        <div className="container mx-auto px-4 py-6 text-center text-xs">
          © {new Date().getFullYear()} Airplane Deals. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
