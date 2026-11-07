import { getConfig } from "@repo/config"
import { EnhancedClause, UseSendTransactionReturnValue } from "@vechain/vechain-kit"
import { useCallback } from "react"

import { useBuildTransaction } from "../useBuildTransaction"

import { ReviewManagerInterface } from "./reviewManagerInterface"

/** Matches on-chain VoteType: 1 = upvote, 2 = downvote, 3 = report */
export type ReviewVoteType = 1 | 2 | 3

type BuildClausesProps = {
  reviewId: number
  voteType: ReviewVoteType
}

export type UseVoteOnReviewReturnValue = {
  sendTransaction: (data: BuildClausesProps) => Promise<void>
} & Omit<UseSendTransactionReturnValue, "sendTransaction">

export const useVoteOnReview = ({
  onSuccess,
  onFailure,
}: {
  onSuccess?: () => void
  onFailure?: () => void
} = {}): UseVoteOnReviewReturnValue => {
  const buildClauses = useCallback(
    ({ reviewId, voteType }: BuildClausesProps): EnhancedClause[] => [
      {
        to: getConfig().xAppReviewManagerContractAddress ?? "",
        value: 0,
        data: ReviewManagerInterface.encodeFunctionData("voteOnReview", [reviewId, voteType]),
        comment: "Vote on review",
        abi: JSON.parse(JSON.stringify(ReviewManagerInterface.getFunction("voteOnReview"))),
      },
    ],
    [],
  )

  return useBuildTransaction({
    clauseBuilder: buildClauses,
    onSuccess,
    onFailure,
    delegationUrl: process.env.NEXT_PUBLIC_REVIEW_DELEGATOR_URL,
  })
}
