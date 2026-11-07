import { getConfig } from "@repo/config"
import { EnhancedClause, UseSendTransactionReturnValue } from "@vechain/vechain-kit"
import { Interface } from "ethers"
import { useCallback } from "react"

import { useBuildTransaction } from "../useBuildTransaction"

const ReviewManagerInterface = new Interface(["function editReview(uint256 reviewId, string title, string content)"])

type BuildClausesProps = {
  reviewId: number
  title: string
  content: string
}

export type UseEditReviewReturnValue = {
  sendTransaction: (data: BuildClausesProps) => Promise<void>
} & Omit<UseSendTransactionReturnValue, "sendTransaction">

export const useEditReview = ({
  onSuccess,
  onFailure,
}: {
  onSuccess?: () => void
  onFailure?: () => void
} = {}): UseEditReviewReturnValue => {
  const buildClauses = useCallback(
    ({ reviewId, title, content }: BuildClausesProps): EnhancedClause[] => [
      {
        to: getConfig().xAppReviewManagerContractAddress ?? "",
        value: 0,
        data: ReviewManagerInterface.encodeFunctionData("editReview", [reviewId, title, content]),
        comment: "Edit app review",
        abi: JSON.parse(JSON.stringify(ReviewManagerInterface.getFunction("editReview"))),
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
