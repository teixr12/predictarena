import { ImgHTMLAttributes } from 'react'

export const TurkeyLogoIcon = (props: ImgHTMLAttributes<HTMLImageElement>) => (
  <img
    src="/logo-turkey.png"
    alt="PREDICTA Arena"
    width={24}
    height={24}
    {...props}
  />
)
