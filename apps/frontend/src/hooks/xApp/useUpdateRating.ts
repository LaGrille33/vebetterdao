import { getConfig } from "@repo/config"
import { EnhancedClause, UseSendTransactionReturnValue } from "@vechain/vechain-kit"
import { useCallback } from "react"

import { useBuildTransaction } from "../useBuildTransaction"

import { ReviewManagerInterface } from "./reviewManagerInterface"

type BuildClausesProps = {
  appId: string
  rating: number
}

export type UseUpdateRatingReturnValue = {
  sendTransaction: (data: BuildClausesProps) => Promise<void>
} & Omit<UseSendTransactionReturnValue, "sendTransaction">

export const useUpdateRating = ({
  onSuccess,
  onFailure,
}: {
  onSuccess?: () => void
  onFailure?: () => void
} = {}): UseUpdateRatingReturnValue => {
  const buildClauses = useCallback(
    ({ appId, rating }: BuildClausesProps): EnhancedClause[] => [
      {
        to: getConfig().xAppReviewManagerContractAddress ?? "",
        value: 0,
        data: ReviewManagerInterface.encodeFunctionData("updateRating", [appId, rating]),
        comment: "Update app rating",
        abi: JSON.parse(JSON.stringify(ReviewManagerInterface.getFunction("updateRating"))),
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
