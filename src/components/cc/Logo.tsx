import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

export function Logo({ to = "/" }: { to?: "/" | "/dashboard" }) {
  return (
    <Link to={to} className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-primary-foreground">
        <ShieldCheck className="h-5 w-5" />
      </span>
      <span className="text-lg font-extrabold tracking-tight">
        Campus<span className="text-brand">Care</span>
      </span>
    </Link>
  );
}
