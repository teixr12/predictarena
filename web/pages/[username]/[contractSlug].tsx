import { ContractParams, MaybeAuthedContractParams } from 'common/contract'
import { getContractParams } from 'common/contract-params'
import { base64toPoints } from 'common/edge/og'
import { ENV_CONFIG } from 'common/envs/constants'
import { getContractFromSlug } from 'common/supabase/contracts'
import { createClient } from 'common/supabase/utils'
import { removeUndefinedProps } from 'common/util/object'
import { ContractPageContent } from 'web/components/contract/contract-page'
import { ContractSEO } from 'web/components/contract/contract-seo'
import { Page } from 'web/components/layout/page'
import { Title } from 'web/components/widgets/title'
import { useIsIframe } from 'web/hooks/use-is-iframe'
import Custom404 from '../404'
import ContractEmbedPage from '../embed/[username]/[contractSlug]'

// Create a fresh Supabase client for server-side use with the anon key
// (no admin key needed — the anon key is hardcoded in ENV_CONFIG)
function getServerDb() {
  return createClient(ENV_CONFIG.supabaseInstanceId, ENV_CONFIG.supabaseAnonKey)
}

export async function getServerSideProps(ctx: {
  params: { username: string; contractSlug: string }
}) {
  const { contractSlug } = ctx.params

  try {
    const serverDb = getServerDb()
    const contract = await getContractFromSlug(serverDb, contractSlug)

    if (!contract) {
      return { notFound: true }
    }

    if (contract.deleted) {
      return {
        props: {
          state: 'deleted',
          slug: contract.slug,
          visibility: contract.visibility,
        },
      }
    }

    let props: Omit<ContractParams, 'cash'>
    try {
      props = await getContractParams(contract, serverDb)
    } catch (e) {
      console.error('getContractParams failed, using fallback:', contractSlug, e)
      // Minimal fallback so the page renders with contract data even when
      // enrichment queries (related markets, comments, etc.) fail.
      props = {
        contract,
        comments: [],
        pinnedComments: [],
        totalComments: 0,
        totalBets: 0,
        totalPositions: 0,
        topContractMetrics: [],
        relatedContracts: [],
        chartAnnotations: [],
        topics: [],
        dashboards: [],
      }
    }

    return {
      props: {
        state: 'authed',
        params: removeUndefinedProps(props),
      },
    }
  } catch (e) {
    console.error('getServerSideProps failed:', contractSlug, e)
    return { notFound: true }
  }
}

export default function ContractPage(props: MaybeAuthedContractParams) {
  if (props.state === 'deleted') {
    return (
      <Page trackPageView={false}>
        <div className="flex h-[50vh] flex-col items-center justify-center">
          <Title>Question deleted</Title>
        </div>
      </Page>
    )
  }

  return <NonPrivateContractPage contractParams={props.params} />
}

function NonPrivateContractPage(props: { contractParams: ContractParams }) {
  const { contract, pointsString } = props.contractParams

  const points = pointsString ? base64toPoints(pointsString) : []

  const inIframe = useIsIframe()
  if (!contract) {
    return <Custom404 customText="Unable to fetch question" />
  }
  if (inIframe) {
    return <ContractEmbedPage contract={contract} points={points} />
  }

  return (
    <Page trackPageView={false} className="xl:col-span-10">
      <ContractSEO contract={contract} points={pointsString} />
      <ContractPageContent key={contract.id} {...props.contractParams} />
    </Page>
  )
}
