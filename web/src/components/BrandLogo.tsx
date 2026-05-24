import { Link } from "@/i18n/navigation";

const BRAND_NAME = "TakVPN";

type Props = {
  className?: string;
};

/** Wordmark is always Latin "TakVPN", regardless of page locale. */
export function BrandLogo({ className = "" }: Props) {
  return (
    <Link
      href="/"
      lang="en"
      dir="ltr"
      className={`font-brand font-semibold text-xl tracking-tight text-brand-600 ${className}`.trim()}
    >
      {BRAND_NAME}
    </Link>
  );
}

export const brandName = BRAND_NAME;
