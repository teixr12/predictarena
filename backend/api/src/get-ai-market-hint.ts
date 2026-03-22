import { APIError, type APIHandler } from './helpers/endpoint'
import { createSupabaseDirectClient } from 'shared/supabase/init'
import { getContract } from 'shared/utils'
import { getActiveSupporterEntitlements } from 'shared/supabase/entitlements'
import { isSupporter } from 'common/supporter-config'
import { promptClaude, models } from 'shared/helpers/claude'

export const getAiMarketHint: APIHandler<'get-ai-market-hint'> = async (
  { contractId },
  auth
) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new APIError(
      503,
      'AI features are not yet configured on this instance.'
    )
  }

  const pg = createSupabaseDirectClient()

  // Gate behind any supporter tier (Arena Plus, Pro, or Premium)
  const entitlements = await getActiveSupporterEntitlements(pg, auth.uid)
  if (!isSupporter(entitlements)) {
    throw new APIError(
      403,
      'AI market hints require an Arena membership. Upgrade at /supporter'
    )
  }

  const contract = await getContract(pg, contractId)
  if (!contract) {
    throw new APIError(404, `Market ${contractId} not found`)
  }

  const closeDate = contract.closeTime
    ? new Date(contract.closeTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'unknown'

  const currentProb = Math.round((contract.probability ?? 0.5) * 100)

  const prompt = `Analyze this prediction market question and provide a concise forecasting hint.

Market: "${contract.question}"
Current market probability: ${currentProb}%
Closes: ${closeDate}
${contract.description ? `Description: ${typeof contract.description === 'string' ? contract.description : JSON.stringify(contract.description)}` : ''}

Provide a 2-4 sentence analysis covering:
1. The key factors that will determine the outcome
2. Whether the current ${currentProb}% probability seems reasonable and why
3. What information a forecaster should look for to refine their estimate

Be specific, analytical, and concise. Do not tell users how to bet — just provide analytical context.`

  const hint = await promptClaude(prompt, {
    model: models.haiku,
    system:
      'You are a professional forecasting analyst helping users on PREDICTA Arena, a prediction market training platform. Provide concise, evidence-based analysis to help users develop their forecasting skills.',
  })

  return {
    hint: hint.trim(),
    contractId,
  }
}
