import { CompanyLogoImage } from "@/features/jobs/company-logo-image";
import { companyInitials, companyLogoUrl } from "@/features/jobs/company-logos";
import type { Company } from "@/features/jobs/types";

/** DoRoboty Design logo tile: small logo or ink initials; never a platform illustration. */
export function CompanyLogo({
  company,
  size = "default",
}: {
  company: Pick<Company, "name" | "slug" | "logoUrl">;
  size?: "default" | "large" | "small";
}) {
  const src = companyLogoUrl(company);
  const dimension = size === "large" ? 56 : size === "small" ? 40 : 48;
  const initials = companyInitials(company.name);
  return (
    <span
      aria-hidden="true"
      data-company-logo={company.slug}
      data-size={size === "default" ? undefined : size}
      data-initials={src ? undefined : ""}
      className="ds-logo-tile"
    >
      {src ? <CompanyLogoImage src={src} dimension={dimension} initials={initials} /> : initials}
    </span>
  );
}
