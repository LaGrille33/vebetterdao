import { getConfig } from "@repo/config"
import { useQuery } from "@tanstack/react-query"

import { indexerFetch } from "../api"

import type { XAppPreviousRoundScore } from "./types"

type NasScoreResponse = {
  appId: string
  source: "nas-postgres"
  partial: true
  maximum: string
  round: number
  roundDate: string
  subtotal: string
  rank: number
  activityContribution: string
  distributionContribution: string
  formulaVersion: string
  newUserHistoryComplete: boolean
}

const fetchNasScore = async (baseUrl: string, appId: string): Promise<XAppPreviousRoundScore | null> => {
  const res = await fetch(`${baseUrl}/v1/apps/${appId}/score`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`NAS reputation score fetch error: ${res.status}`)
  const source = (await res.json()) as NasScoreResponse
  return {
    appId: source.appId,
    round: source.round,
    roundDate: Number(source.roundDate),
    score: Number(source.subtotal),
    rank: source.rank,
    activity: Number(source.activityContribution),
    distribution: Number(source.distributionContribution),
    partial: source.partial,
    maximum: Number(source.maximum),
    source: source.source,
    formulaVersion: source.formulaVersion,
    newUserHistoryComplete: source.newUserHistoryComplete,
  }
}

const fetchXAppPreviousRoundScore = async (appId: string): Promise<XAppPreviousRoundScore | null> => {
  const reputationScoreUrl = getConfig().reputationScoreUrl
  if (reputationScoreUrl) return fetchNasScore(reputationScoreUrl, appId)
  const res = await indexerFetch(`/api/v1/xapp/apps/${appId}/scores/previousRound`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`xapp previousRound score fetch error: ${res.status}`)
  return res.json()
}

export const getXAppPreviousRoundScoreQueryKey = (appId: string) => ["xAppPreviousRoundScore", appId] as const

/**
 * Previous allocation round score for an xApp.
 * @see GET /api/v1/xapp/apps/{appId}/scores/previousRound
 */
export const useXAppPreviousRoundScore = (appId: string) =>
  useQuery({
    queryKey: getXAppPreviousRoundScoreQueryKey(appId),
    queryFn: () => fetchXAppPreviousRoundScore(appId),
    enabled: !!appId && !!getConfig().indexerUrl,
  })
