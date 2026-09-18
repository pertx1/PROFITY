export function Logo({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="profity-logo-grad" x1="2" y1="30" x2="30" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2a78d6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#profity-logo-grad)" />
      <rect x="7" y="18" width="4.6" height="7.5" rx="1.6" fill="white" fillOpacity="0.85" />
      <rect x="13.7" y="12.5" width="4.6" height="13" rx="1.6" fill="white" fillOpacity="0.93" />
      <rect x="20.4" y="6.5" width="4.6" height="19" rx="1.6" fill="white" />
    </svg>
  );
}
