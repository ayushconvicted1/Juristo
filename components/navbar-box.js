import Link from "next/link";
import { cn } from "@/lib/utils";

function NavItem({ href, isActive, children, title }) {
  return (
    <Link
      href={href}
      className={cn(
        "px-4 py-2 text-sm transition-colors hover:text-primary",
        isActive ? "font-semibold text-primary" : "text-muted-foreground"
      )}
    >
      {children}
    </Link>
  );
}

export function NavBarBox() {
  return (
    <nav className="flex items-center justify-center gap-4 border-b bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <NavItem href="/documentation" isActive={true}>
        Documentation
      </NavItem>
      <NavItem href="/drafting" isActive={false}>
        Drafting
      </NavItem>
      <NavItem href="/case-prediction" isActive={false}>
        Case Prediction
      </NavItem>
      <NavItem href="/multi-support" isActive={false}>
        MultiSupport
      </NavItem>
    </nav>
  );
}
