import { LandingPage } from 'web/components/landing/landing-page'
import { redirectIfLoggedIn } from 'web/lib/firebase/server-auth'
import { SEO } from 'web/components/SEO'

export const getServerSideProps = redirectIfLoggedIn('/home', async (_) => {
  return {
    props: {},
  }
})

export default function Index() {
  return (
    <>
      <SEO
        title="PREDICTA Arena — The prediction market training gym"
        description="Practice forecasting with play money. Build your track record, earn your Foresight Portfolio, and bridge to real-money platforms like Kalshi and Polymarket."
        url="/"
      />
      <LandingPage />
    </>
  )
}
