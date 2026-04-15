import { Contract } from 'common/contract'
import { getContractOGProps } from 'common/contract-seo'
import { removeUndefinedProps } from 'common/util/object'
import { buildOgUrl } from 'common/util/og'
import { unauthedApi } from 'common/util/api'
import { OgMarket } from 'web/components/og/og-market'
import type { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { contractSlug } = ctx.params as { contractSlug: string }
  try {
    const contract = await unauthedApi('slug/:slug', { slug: contractSlug })
    if (!contract) return { notFound: true }
    return { props: { contract: contract as unknown as Contract } }
  } catch {
    return { notFound: true }
  }
}

export default function OGTestPage(props: { contract: Contract }) {
  const { contract } = props
  if (!contract) {
    return <>bruh</>
  }
  return <OriginalGangstaTestPage contract={contract} />
}

function OriginalGangstaTestPage(props: { contract: Contract }) {
  const { contract } = props
  const ogCardProps = removeUndefinedProps({
    ...getContractOGProps(contract),
  })

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <div className="text-ink-900 mb-2 mt-6 text-xl">social preview image</div>
      <img
        src={buildOgUrl(ogCardProps as any, 'market', 'http://localhost:3000')}
        height={315}
        width={600}
        alt=""
      />

      <div className="text-ink-900 mb-2 mt-6 text-xl">
        og card component (try inspecting)
      </div>
      <div className="h-[315px] w-[600px] resize overflow-hidden">
        <OgMarket {...ogCardProps} />
      </div>
    </div>
  )
}
