import type { ReactNode } from "react";
import { Link, type LinkProps } from "react-router";

/** Contextual return as a tertiary link (DoRoboty Design). */
export function BackLink({ to, children }: { to: LinkProps["to"]; children: ReactNode }) {
  return (
    <Link to={to} className="ds-back">
      <span aria-hidden="true">←&nbsp;</span>
      {children}
    </Link>
  );
}
