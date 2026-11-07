import { getConfig } from "@repo/config"
import { EnhancedClause, UseSendTransactionReturnValue } from "@vechain/vechain-kit"
import { useCallback } from "react"

import { useBuildTransaction } from "../useBuildTransaction"

import { ReviewManagerInterface } from "./reviewManagerInterface"

type BuildClausesProps = {
  appId: string
  rating: number
}

export type UseSubmitRatingReturnValue = {
  sendTransaction: (data: BuildClausesProps) => Promise<void>
} & Omit<UseSendTransactionReturnValue, "sendTransaction">

export const useSubmitRating = ({
  onSuccess,
  onFailure,
}: {
  onSuccess?: () => void
  onFailure?: () => void
} = {}): UseSubmitRatingReturnValue => {
  const buildClauses = useCallback(
    ({ appId, rating }: BuildClausesProps): EnhancedClause[] => [
      {
        to: getConfig().xAppReviewManagerContractAddress ?? "",
        value: 0,
        data: ReviewManagerInterface.encodeFunctionData("submitRating", [appId, rating]),
        comment: "Submit app rating",
        abi: JSON.parse(JSON.stringify(ReviewManagerInterface.getFunction("submitRating"))),
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
