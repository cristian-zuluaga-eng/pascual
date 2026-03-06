"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface NavLinkProps {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
  collapsed?: boolean;
}

export function NavLink({
  href,
  children,
  icon,
  collapsed = false,
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`
        flex items-center ${collapsed ? "justify-center" : "justify-start"}
        px-3 py-3 my-1 rounded-sm font-mono transition-colors relative
        ${
          isActive
            ? "text-[#00d9ff] bg-cyan-950/20"
            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
        }
      `}
    >
      {icon && <span className="text-lg">{icon}</span>}
      <span className={collapsed ? "hidden" : "ml-3"}>{children}</span>

      {isActive && (
        <span className="absolute -left-0 top-0 bottom-0 w-0.5 bg-[#00d9ff] shadow-neo rounded-r" />
      )}
    </Link>
  );
}

interface TabLinkProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

export function TabLink({ active, onClick, children }: TabLinkProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 font-mono text-sm transition-all duration-200
        border-b-2 -mb-px
        ${
          active
            ? "text-[#00d9ff] border-[#00d9ff]"
            : "text-zinc-400 border-transparent hover:text-zinc-200"
        }
      `}
    >
      {children}
    </button>
  );
}
