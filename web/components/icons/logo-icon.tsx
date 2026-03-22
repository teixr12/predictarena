import { SVGProps } from 'react'

export const LogoIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    strokeWidth="0.8"
    stroke="currentColor"
    {...props}
  >
    {/* Target/crosshair icon representing prediction accuracy */}
    <circle cx="12" cy="12" r="9" strokeWidth="1" />
    <circle cx="12" cy="12" r="5.5" strokeWidth="0.8" />
    <circle cx="12" cy="12" r="2" strokeWidth="0.8" fill="currentColor" fillOpacity="0.3" />
    <line x1="12" y1="2" x2="12" y2="5" strokeWidth="0.8" />
    <line x1="12" y1="19" x2="12" y2="22" strokeWidth="0.8" />
    <line x1="2" y1="12" x2="5" y2="12" strokeWidth="0.8" />
    <line x1="19" y1="12" x2="22" y2="12" strokeWidth="0.8" />
  </svg>
)
