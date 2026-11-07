import type { XAppPreviousRoundScore } from "./types"

export type AppScoreBreakdownRow = {
  labelKey: "Distribution Efficiency" | "Activity" | "Community" | "Profile Completeness"
  value: number
  max: number
}

export type AppScoreViewModel = {
  scoreDisplay: string
  rankDisplay: string
  /** Unix seconds for the round date; format at render time with the active locale. */
  roundDate?: number
  roundDisplay: string
  breakdown: AppScoreBreakdownRow[]
  partial: boolean
  maximum: number
}

export const mapXAppPreviousRoundScore = (data: XAppPreviousRoundScore | null | undefined): AppScoreViewModel => {
  const maximum = data?.maximum ?? 100
  const scoreDisplay = data?.score != null ? `${data.score.toFixed(2)} / ${maximum}` : ""
  const rankDisplay = data?.rank != null ? String(data.rank) : ""
  const roundDate = data?.roundDate
  const roundDisplay = data?.round != null ? String(data.round) : ""

  const breakdown: AppScoreBreakdownRow[] = [
    { labelKey: "Distribution Efficiency", value: data?.distribution ?? 0, max: 30 },
    { labelKey: "Activity", value: data?.activity ?? 0, max: 30 },
    ...(data?.partial
      ? []
      : [
          { labelKey: "Community" as const, value: data?.community ?? 0, max: 30 },
          { labelKey: "Profile Completeness" as const, value: data?.health ?? 0, max: 10 },
        ]),
  ]

  return { scoreDisplay, rankDisplay, roundDate, roundDisplay, breakdown, partial: data?.partial ?? false, maximum }
}
