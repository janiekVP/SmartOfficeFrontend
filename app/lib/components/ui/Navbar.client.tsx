'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
  label: string;
  href?: string;
  dropdown?: Array<{ label: string; href: string }>;
}

export default function Navbar() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const navItems: NavItem[] = [
    {
      label: 'Home',
      href: '/',
    },
    {
      label: 'Floorplans',
      dropdown: [
        { label: 'View All', href: '/floorplan/list' },
        { label: 'Create New', href: '/floorplan/new' },
      ],
    },
    {
      label: 'Sensors',
      dropdown: [
        { label: 'POI Sensors', href: '/poisensor' },
        { label: 'Sensor Data', href: '/sensordata' },
      ],
    },
  ];

  const handleMouseEnter = (label: string) => {
    setOpenDropdown(label);
  };

  const handleMouseLeave = () => {
    setOpenDropdown(null);
  };

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="flex items-center justify-left bg-gray-900 text-white px-6 py-3 shadow">
      <div className="text-xl font-bold pr-6">Smart Office</div>
      <div className="flex gap-6 items-center">
        {navItems.map((item) => (
          <div
            key={item.label}
            className="relative"
            onMouseEnter={() => item.dropdown && handleMouseEnter(item.label)}
            onMouseLeave={handleMouseLeave}
          >
            {item.href ? (
              <Link
                href={item.href}
                className={`hover:text-blue-400 transition-colors ${
                  isActive(item.href) ? 'text-blue-400' : ''
                }`}
              >
                {item.label}
              </Link>
            ) : (
              <button
                className={`hover:text-blue-400 transition-colors flex items-center gap-1 ${
                  openDropdown === item.label ? 'text-blue-400' : ''
                }`}
              >
                {item.label}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            )}

            {item.dropdown && openDropdown === item.label && (
              <div className="absolute top-full left-0 mt-1 bg-gray-800 rounded shadow-lg min-w-[160px] py-2 z-50">
                {item.dropdown.map((dropdownItem) => (
                  <Link
                    key={dropdownItem.href}
                    href={dropdownItem.href}
                    className={`block px-4 py-2 hover:bg-gray-700 transition-colors ${
                      isActive(dropdownItem.href) ? 'text-blue-400' : ''
                    }`}
                  >
                    {dropdownItem.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}