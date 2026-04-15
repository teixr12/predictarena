import { useEffect, useState } from 'react'
import { Bet } from 'common/bet'
import { Contract, ContractParams } from 'common/contract'
import { ContractComment } from 'common/comment'
import { Topic } from 'common/group'
import { shouldHideGraph } from 'common/contract-params'
import { getTotalBetCount } from 'common/bets'
import { unauthedApi } from 'common/util/api'
import { getNumContractComments } from 'web/lib/supabase/comments'
import { api } from 'web/lib/api/api'
import { removeUndefinedProps } from 'common/util/object'

/**
 * Client-side hook that fetches all data needed by ContractPageContent.
 * Replaces the server-side getContractParams which requires Supabase admin access.
 *
 * Uses only public APIs and the anon Supabase client.
 * Some fields default to empty (chart annotations, dashboards, pinned comments,
 * top metrics, total positions) because no public API exists for them yet.
 */
export function useContractPageParams(
  contract: Contract
): ContractParams | undefined {
  const [params, setParams] = useState<ContractParams | undefined>(undefined)

  useEffect(() => {
    let cancelled = false

    async function fetchParams() {
      const hasMechanism = contract.mechanism !== 'none'
      const isNumber = contract.outcomeType === 'NUMBER'

      try {
        const [
          totalBets,
          lastBetArray,
          comments,
          totalComments,
          relatedContracts,
          topics,
        ] = await Promise.all([
          // Total bet count — uses unauthedApi('bets', ...) internally
          hasMechanism
            ? isNumber
              ? unauthedApi('unique-bet-group-count', {
                  contractId: contract.id,
                }).then((res) => res.count)
              : getTotalBetCount(contract.id)
            : 0,

          // Last bet — for tracking new bets
          hasMechanism
            ? unauthedApi('bets', {
                contractId: contract.id,
                limit: 1,
                order: 'desc' as const,
                filterRedemptions: true,
              })
            : ([] as Bet[]),

          // Comments — public API
          unauthedApi('comments', {
            contractId: contract.id,
            limit: 25,
          }).catch(() => [] as ContractComment[]),

          // Total comments count — uses anon db client
          getNumContractComments(contract.id).catch(() => 0),

          // Related contracts — uses unauthedApi
          unauthedApi('get-related-markets', {
            contractId: contract.id,
            limit: 10,
            question: contract.question,
            uniqueBettorCount: contract.uniqueBettorCount,
          }).catch(() => ({ marketsFromEmbeddings: [] })),

          // Topics — public API
          api('market/:contractId/groups', {
            contractId: contract.id,
          }).catch(() => [] as Topic[]),
        ])

        if (cancelled) return

        const lastBet: Bet | undefined = lastBetArray[0]
        const lastBetTime = lastBet?.createdTime

        const contractParams: ContractParams = removeUndefinedProps({
          outcomeType: contract.outcomeType,
          contract,
          lastBetTime,
          // pointsString and multiPointsString are undefined —
          // ContractPageContent's useBetData handles this gracefully:
          // it starts with [] and merges in new bets from useContractBets.
          pointsString: undefined,
          multiPointsString: undefined,
          comments: comments as ContractComment[],
          totalComments: totalComments as number,
          // No public API for these — provide safe defaults
          totalPositions: 0,
          totalBets: totalBets as number,
          topContractMetrics: [],
          relatedContracts: (
            relatedContracts as { marketsFromEmbeddings: Contract[] }
          ).marketsFromEmbeddings as Contract[],
          chartAnnotations: [],
          topics: topics as Topic[],
          dashboards: [],
          pinnedComments: [],
        }) as ContractParams

        setParams(contractParams)
      } catch (e) {
        console.error('Error fetching contract page params:', e)
        // Return minimal params so the page can still render
        if (!cancelled) {
          setParams({
            contract,
            comments: [],
            totalComments: 0,
            totalPositions: 0,
            totalBets: 0,
            topContractMetrics: [],
            relatedContracts: [],
            chartAnnotations: [],
            topics: [],
            dashboards: [],
            pinnedComments: [],
          } as ContractParams)
        }
      }
    }

    fetchParams()
    return () => {
      cancelled = true
    }
  }, [contract.id])

  return params
}
