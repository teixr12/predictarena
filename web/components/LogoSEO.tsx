import { JsonLd } from './JsonLd'

export function LogoSEO() {
  const orgData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PREDICTA Arena',
    url: 'https://predictarena.com',
    logo: 'https://predictarena.com/logo.svg',
    description:
      'The safe simulator that trains you for Kalshi & Polymarket. Practice prediction markets risk-free.',
    sameAs: ['https://twitter.com/predictarena'],
  }

  return <JsonLd data={orgData} id="organization" />
}
