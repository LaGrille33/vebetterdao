/**
 * Hand-typed indexer response for xApp score endpoints.
 *
 * TODO: after `yarn generate:schema` includes `/xapp/apps/{appId}/scores/previousRound`,
 * swap for schema-derived types from `paths` in `../schema.d.ts`.
 */

/** GET /api/v1/xapp/apps/{appId}/scores/previousRound */
export type XAppPreviousRoundScore = {
  appId: string
  round: number
  score?: number
  rank?: number
  roundDate?: number
  distribution?: number
  activity?: number
  community?: number
  health?: number
  /** NAS historical scoring is deliberately partial: Activity + Distribution only. */
  partial?: boolean
  maximum?: number
  source?: "nas-postgres"
  formulaVersion?: string
  newUserHistoryComplete?: boolean
}

export type XAppBadgeType = "topEcosystemDapp" | "topDistributionPerformer" | "navigatorsPick"

export type XAppBadgeStatsRound = {
  round: number
  rank?: number
  date: number
}

/** GET /api/v1/xapp/apps/{appId}/badges/stats */
export type XAppBadgeStats = {
  badgeType: XAppBadgeType
  totalBadgesEarned: number
  latestBadges?: number
  rounds: XAppBadgeStatsRound[]
}

/** GET /api/v1/xapp/apps/{appId}/badges/roundRank */
export type XAppBadgeRoundRank = {
  appId: string
  badgeType: XAppBadgeType
  round: number
  rank?: number
  totalBadgesEarned: number
  latestBadges?: number
}

export type XAppPreviousRoundBadge = {
  badgeType: XAppBadgeType
  badgeName: string
  rank?: number
  earned: number
}

/** GET /api/v1/xapp/apps/{appId}/badges/previousRound */
export type XAppPreviousRoundBadges = {
  appId: string
  round: number
  roundTimestamp?: number
  badges: XAppPreviousRoundBadge[]
}

export type XAppEarnedBadge = {
  badgeType: XAppBadgeType
  badgeName: string
  isPublished: boolean
  totalBadgesEarned: number
  latestBadges?: number
  earned: number
}

/** GET /api/v1/xapp/apps/{appId}/badges/earned */
export type XAppEarnedBadges = {
  appId: string
  badges: XAppEarnedBadge[]
}
