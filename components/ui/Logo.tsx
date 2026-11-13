import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  /** If provided, wraps the logo in a Next.js Link */
  href?: string;
  /** Responsive sizing and style classes (e.g. 'h-8 sm:h-10 w-auto') */
  className?: string;
}

/**
 * WhyStayIn official brand logo.
 * Scales responsively via CSS classes on a single image element.
 */
export function Logo({ href, className = 'h-8 sm:h-10 w-auto' }: LogoProps) {
  const img = (
    <Image
      src="/logo.png"
      alt="WhyStayIn"
      width={937}
      height={274}
      className={`object-contain select-none shrink-0 ${className}`}
      priority
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center shrink-0">
        {img}
      </Link>
    );
  }

  return <span className="inline-flex items-center shrink-0">{img}</span>;
}
