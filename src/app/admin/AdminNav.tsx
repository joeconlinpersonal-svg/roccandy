"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type NavItem = {
  label: string;
  href: string;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

export function AdminNav({ sections }: { sections: NavSection[] }) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!navRef.current) return;
      if (!navRef.current.contains(event.target as Node)) {
        setOpenKey(null);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const toggle = (key: string) => {
    setOpenKey((current) => (current === key ? null : key));
  };

  const close = () => setOpenKey(null);

  return (
    <nav ref={navRef} className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-zinc-700">
      {sections.map((section) =>
        section.items.length === 1 ? (
          <Link key={section.label} href={section.items[0].href} className="hover:text-zinc-900">
            {section.label}
          </Link>
        ) : (
          <div key={section.label} className="relative">
            <button
              type="button"
              data-plain-button
              onClick={() => toggle(section.label)}
              className="inline-flex cursor-pointer items-center gap-2 hover:text-zinc-900"
              aria-haspopup="menu"
              aria-expanded={openKey === section.label}
            >
              {section.label}
              <svg
                viewBox="0 0 16 16"
                className={`h-3 w-3 transition-transform ${openKey === section.label ? "rotate-180" : ""}`}
                aria-hidden="true"
              >
                <path d="M4 6l4 4 4-4z" fill="currentColor" />
              </svg>
            </button>
            {openKey === section.label ? (
              <div className="absolute left-1/2 top-full z-40 mt-3 min-w-[220px] -translate-x-1/2 rounded-2xl border border-zinc-200 bg-white px-2 py-2 text-xs normal-case tracking-[0.16em] shadow-lg">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className="block rounded-xl px-3 py-2 text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ),
      )}
    </nav>
  );
}
