'use client';

import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';

import { ChevronDown } from '@/public/assets/icons/chevron-down';

interface DropdownItem {
  href: string;
  label: string;
  adminOnly?: boolean;
}

interface DropdownProps {
  label: string;
  items: DropdownItem[];
  userRole?: string;
}

export function Dropdown({ label, items, userRole }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredItems = items.filter(item =>
    !item.adminOnly || userRole === 'ADMIN'
  );

  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-600 hover:text-primary-color-80 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
      >
        {label}
        <ChevronDown className={`ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            {filteredItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-color-80 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
