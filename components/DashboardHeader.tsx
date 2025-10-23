"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { MagneticButton } from "@/components/MagneticButton"
import LogoutButton from "@/components/auth/LogoutButton"

type NavItem = {
  href: string
  label: string
  exact?: boolean
}

type Action = {
  href: string
  label: string
  variant?: "primary" | "secondary" | "ghost"
  className?: string
}

type DashboardHeaderProps = {
  homeHref: string
  title: string
  subtitle: string
  navItems?: NavItem[]
  actions?: Action[]
  userInitials?: string
  showSettings?: boolean
  settingsHref?: string
}

export function DashboardHeader({
  homeHref,
  title,
  subtitle,
  navItems = [],
  actions = [],
  userInitials = "U",
  showSettings = false,
  settingsHref = "/settings",
}: DashboardHeaderProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (href: string, exact?: boolean) => {
    if (!pathname) return false
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6 md:px-12">
      <Link
        href={homeHref}
        className="flex items-center gap-3 rounded-full bg-foreground/10 px-4 py-2 backdrop-blur-xl transition-transform duration-300 hover:scale-[1.03]"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/15 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-foreground/25">
          <span className="font-sans text-xl font-bold text-foreground">D</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight text-foreground/90">{title}</span>
          <span className="text-xs text-foreground/60">{subtitle}</span>
        </div>
      </Link>

      {navItems.length > 0 && (
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative font-sans text-sm font-medium transition-colors ${
                  active ? "text-foreground" : "text-foreground/80 hover:text-foreground"
                }`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300 ${
                    active ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            )
          })}
        </div>
      )}

      <div className="flex items-center gap-3 md:gap-4">
        {actions.map((action) => (
          <MagneticButton
            key={`${action.href}-${action.label}`}
            href={action.href}
            variant={action.variant ?? "secondary"}
            className={`inline-flex ${action.className ?? ""}`}
          >
            {action.label}
          </MagneticButton>
        ))}

        <div
          className="relative"
          onMouseEnter={() => setMenuOpen(true)}
          onMouseLeave={() => setMenuOpen(false)}
          onFocus={() => setMenuOpen(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setMenuOpen(false)
            }
          }}
        >
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/15 backdrop-blur-md text-sm font-semibold text-foreground transition-all duration-200 hover:scale-105 hover:bg-foreground/25"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {userInitials}
          </button>
          <div
            className={`absolute right-0 top-full z-50 pt-3 transition duration-200 transform ${
              menuOpen
                ? "pointer-events-auto opacity-100 translate-y-0"
                : "pointer-events-none opacity-0 -translate-y-2"
            }`}
            role="menu"
          >
            <div className="rounded-2xl border border-foreground/20 bg-foreground/15 p-3 text-sm shadow-2xl backdrop-blur-xl whitespace-nowrap">
              {showSettings && (
                <Link
                  href={settingsHref}
                  className="block rounded-lg px-3 py-2 text-foreground/90 transition hover:bg-foreground/10 hover:text-foreground"
                  role="menuitem"
                >
                  Settings
                </Link>
              )}
              <LogoutButton className="block rounded-lg px-3 py-2 text-left text-foreground/90 transition hover:bg-foreground/10 hover:text-foreground" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
