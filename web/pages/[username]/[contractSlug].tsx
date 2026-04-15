import { Contract } from 'common/contract'
import { base64toPoints } from 'common/edge/og'
import { unauthedApi } from 'common/util/api'
import { ContractPageContent } from 'web/components/contract/contract-page'
import { ContractSEO } from 'web/components/contract/contract-seo'
import { Col } from 'web/components/layout/col'
import { Page } from 'web/components/layout/page'
import { Title } from 'web/components/widgets/title'
import { useContractPageParams } from 'web/hooks/use-contract-page-params'
import { useIsIframe } from 'web/hooks/use-is-iframe'
import Custom404 from '../404'
import ContractEmbedPage from '../embed/[username]/[contractSlug]'
import type { GetServerSideProps } from 'next'

// Fetch contract via public API — no Supabase admin key required
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { contractSlug } = ctx.params as {
    username: string
    contractSlug: string
  }

  try {
    const contract = await unauthedApi('slug/:slug', { slug: contractSlug })
    if (!contract) {
      return { notFound: true }
    }
    // The API returns FullMarket which is a superset of Contract
    return { props: { contract: contract as unknown as Contract } }
  } catch (e) {
    console.error('getServerSideProps failed:', contractSlug, e)
    return { notFound: true }
  }
}

function ContractPageSkeleton({ contract }: { contract: Contract }) {
  return (
    <Col className="gap-4 px-2 pt-4">
      {/* Title renders immediately from SSR contract */}
      <h1 className="text-ink-1000 text-xl font-bold sm:text-2xl">
        {contract.question}
      </h1>
      {/* Chart placeholder */}
      <div className="bg-canvas-50 h-64 w-full animate-pulse rounded-lg" />
      {/* Bet panel placeholder */}
      <div className="flex gap-3">
        <div className="bg-canvas-50 h-12 w-36 animate-pulse rounded-lg" />
        <div className="bg-canvas-50 h-12 w-36 animate-pulse rounded-lg" />
      </div>
      {/* Tabs placeholder */}
      <div className="bg-canvas-50 mt-4 h-8 w-64 animate-pulse rounded" />
      <div className="bg-canvas-50 h-32 w-full animate-pulse rounded-lg" />
    </Col>
  )
}

export default function ContractPage(props: { contract: Contract }) {
  const { contract } = props

  if (!contract) {
    return <Custom404 customText="Unable to fetch question" />
  }

  if (contract.deleted) {
    return (
      <Page trackPageView={false}>
        <div className="flex h-[50vh] flex-col items-center justify-center">
          <Title>Question deleted</Title>
        </div>
      </Page>
    )
  }

  return <HydratedContractPage contract={contract} />
}

function HydratedContractPage({ contract }: { contract: Contract }) {
  const inIframe = useIsIframe()
  const contractParams = useContractPageParams(contract)

  if (inIframe) {
    if (!contractParams) {
      return <ContractPageSkeleton contract={contract} />
    }
    const points = contractParams.pointsString
      ? base64toPoints(contractParams.pointsString)
      : []
    return <ContractEmbedPage contract={contract} points={points} />
  }

  return (
    <Page trackPageView={false} className="xl:col-span-10">
      <ContractSEO contract={contract} points={undefined} />
      {contractParams ? (
        <ContractPageContent key={contract.id} {...contractParams} />
      ) : (
        <ContractPageSkeleton contract={contract} />
      )}
    </Page>
  )
}
