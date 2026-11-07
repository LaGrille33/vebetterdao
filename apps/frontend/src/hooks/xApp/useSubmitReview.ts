import { getConfig } from "@repo/config"
import { EnhancedClause, UseSendTransactionReturnValue } from "@vechain/vechain-kit"
import { Interface } from "ethers"
import { useCallback } from "react"

import { useBuildTransaction } from "../useBuildTransaction"

const ReviewManagerInterface = new Interface([
  "function createReview(bytes32 appId, string title, string content) returns (uint256 reviewId)",
])

type BuildClausesProps = {
  appId: string
  title: string
  content: string
}

export type UseSubmitReviewReturnValue = {
  sendTransaction: (data: BuildClausesProps) => Promise<void>
} & Omit<UseSendTransactionReturnValue, "sendTransaction">

export const useSubmitReview = ({
  onSuccess,
  onFailure,
}: {
  onSuccess?: () => void
  onFailure?: () => void
} = {}): UseSubmitReviewReturnValue => {
  const buildClauses = useCallback(
    ({ appId, title, content }: BuildClausesProps): EnhancedClause[] => [
      {
        to: getConfig().xAppReviewManagerContractAddress ?? "",
        value: 0,
        data: ReviewManagerInterface.encodeFunctionData("createReview", [appId, title, content]),
        comment: "Submit app review",
        abi: JSON.parse(JSON.stringify(ReviewManagerInterface.getFunction("createReview"))),
      },
    ],
    [],
  )

  return useBuildTransaction({
    clauseBuilder: buildClauses,
    onSuccess,
    onFailure,
    // A separate endpoint keeps review gas sponsorship scoped to this action.
    delegationUrl: process.env.NEXT_PUBLIC_REVIEW_DELEGATOR_URL,
  })
}
