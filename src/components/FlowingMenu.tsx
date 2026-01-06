"use client";

import { useMemo, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";

type MenuItemProps = {
  link: string;
  text: string;
  image: string;
  isLast?: boolean;
  onSelect?: () => void;
};

type FlowingMenuProps = {
  items?: MenuItemProps[];
  onSelect?: () => void;
};

const animationDefaults = { duration: 0.6, ease: "expo.out" };

const FlowingMenu = ({ items = [], onSelect }: FlowingMenuProps) => {
  return (
    <div className="h-full w-full">
      <nav className="flex h-full flex-col overflow-hidden rounded-2xl">
        {items.map((item, idx) => (
          <MenuItem key={`${item.text}-${idx}`} {...item} isLast={idx === items.length - 1} onSelect={onSelect} />
        ))}
      </nav>
    </div>
  );
};

const MenuItem = ({ link, text, image, isLast, onSelect }: MenuItemProps) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeInnerRef = useRef<HTMLDivElement>(null);

  const findClosestEdge = (mouseX: number, mouseY: number, width: number, height: number): "top" | "bottom" => {
    const topEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY, 2);
    const bottomEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY - height, 2);
    return topEdgeDist < bottomEdgeDist ? "top" : "bottom";
  };

  const handleMouseEnter = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);

    const tl = gsap.timeline({ defaults: animationDefaults });
    tl.set(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" })
      .set(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" })
      .to([marqueeRef.current, marqueeInnerRef.current], { y: "0%" });
  };

  const handleMouseLeave = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);

    const tl = gsap.timeline({ defaults: animationDefaults });
    tl.to(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }).to(marqueeInnerRef.current, {
      y: edge === "top" ? "101%" : "-101%",
    });
  };

  const repeatedMarqueeContent = useMemo(() => {
    return Array.from({ length: 4 }).map((_, idx) => (
        <span key={idx} className="flex items-center">
        <span className="px-[1vw] pt-[0.6vh] text-[1.35vh] font-normal uppercase leading-[1.2] text-[#e91e63]">
          {text}
        </span>
        <span
          className="mx-[2vw] my-[1.2vh] h-[4.8vh] w-[160px] rounded-[50px] bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
      </span>
    ));
  }, [text, image]);

  return (
    <div className={`relative flex-1 overflow-hidden text-center ${isLast ? "" : "border-b border-[#fedae1]"}`} ref={itemRef}>
      <Link
        className="flex h-full items-center justify-center text-[1.35vh] font-semibold uppercase text-[#e91e63] no-underline transition-colors hover:text-[#ff6781] focus-visible:text-[#ff6781]"
        href={link}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onSelect}
      >
        {text}
      </Link>
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-full translate-y-[101%] overflow-hidden bg-white"
        ref={marqueeRef}
      >
        <div className="flex h-full w-[200%]" ref={marqueeInnerRef}>
          <div className="relative flex h-full w-[200%] items-center will-change-transform animate-marquee">
            {repeatedMarqueeContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowingMenu;
