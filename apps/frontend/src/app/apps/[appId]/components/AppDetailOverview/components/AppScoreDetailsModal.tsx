"use client"

import { Box, Heading, HStack, List, Progress, SimpleGrid, Skeleton, Text, VStack } from "@chakra-ui/react"
import { UilTimes } from "@iconscout/react-unicons"
import dayjs from "dayjs"
import { useTranslation } from "react-i18next"

import type { AppScoreViewModel } from "@/api/indexer/xapps/mapXAppPreviousRoundScore"
import { BaseModal } from "@/components/BaseModal"

import { APP_SCORE_ACCENT_HEX } from "./appScoreConstants"

type AppScoreDetailsModalProps = {
  isOpen: boolean
  onClose: () => void
  scoreData: AppScoreViewModel
  isLoading: boolean
}

const ScoreBreakdownRow = ({ label, value, max }: { label: string; value: number; max: number }) => (
  <VStack align="stretch" gap={1} w="full">
    <HStack justify="space-between" w="full" align="baseline" gap={3}>
      <Text textStyle="sm" color="text.default">
        {label}
      </Text>
      <Text textStyle="sm" fontWeight="semibold" color="text.default" flexShrink={0}>
        {value.toFixed(2)}
      </Text>
    </HStack>
    <Progress.Root value={value} max={max} size="sm" w="full">
      <Progress.Track rounded="full" bg="bg.muted">
        <Progress.Range bg={APP_SCORE_ACCENT_HEX} rounded="full" />
      </Progress.Track>
    </Progress.Root>
  </VStack>
)

export const AppScoreDetailsModal = ({ isOpen, onClose, scoreData, isLoading }: AppScoreDetailsModalProps) => {
  const { t } = useTranslation()

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      isCloseable
      modalContentProps={{ maxW: "682px" }}
      modalBodyProps={{ p: 6 }}>
      <HStack justify="space-between" align="center" pb={6}>
        <Heading size="xl">{t("App Score Details")}</Heading>
        <Box cursor="pointer" onClick={onClose} display={{ base: "none", lg: "block" }}>
          <UilTimes size="24px" />
        </Box>
      </HStack>
      <VStack gap={6}>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 8, md: 10 }} w="full" alignItems="start">
          <VStack align="flex-start" gap={6}>
            <Skeleton loading={isLoading}>
              <Text textStyle="4xl" fontWeight="bold" color={APP_SCORE_ACCENT_HEX}>
                {scoreData.scoreDisplay}
              </Text>
            </Skeleton>
            <VStack align="flex-start" gap={0}>
              <Skeleton loading={isLoading}>
                <Text textStyle="lg" fontWeight="bold" color="text.default">
                  {"#"}
                  {scoreData.rankDisplay}
                </Text>
              </Skeleton>
              <Text textStyle="sm" color="text.subtle">
                {t("Ranking")}
              </Text>
            </VStack>
            <Skeleton loading={isLoading}>
              <Text textStyle="md" fontWeight="semibold" color="text.default">
                {t("{{date}} (Round #{{round}})", {
                  date:
                    scoreData.roundDate != null ? dayjs.unix(Number(scoreData.roundDate)).format("MMM D, YYYY") : "-",
                  round: scoreData.roundDisplay,
                })}
              </Text>
            </Skeleton>
          </VStack>

          <VStack align="stretch" gap={3} w="full">
            {scoreData.breakdown.map(row => (
              <Skeleton key={row.labelKey} loading={isLoading}>
                <ScoreBreakdownRow label={t(row.labelKey)} value={row.value} max={row.max} />
              </Skeleton>
            ))}
          </VStack>
        </SimpleGrid>

        <Box bg="#F9F9FA" rounded="xl" p={{ base: 3, md: 4 }} w="full">
          <VStack align="stretch" gap={4}>
            <Heading size="md">{t("App Score Rules")}</Heading>
            {scoreData.partial ? (
              <Text textStyle="xs" color="text.subtle">
                {"Historical NAS test score: Activity and Distribution only, out of "}
                {scoreData.maximum}
                {". Community and Profile are not included."}
              </Text>
            ) : null}
            <Text textStyle="xs" color="text.subtle">
              {t("App score rules intro")}
            </Text>
            <List.Root as="ul" gap={1} ps={4}>
              <List.Item>
                <Text textStyle="xs" color="text.subtle">
                  {t("App score rules bullet profile")}
                </Text>
              </List.Item>
              <List.Item>
                <Text textStyle="xs" color="text.subtle">
                  {t("App score rules bullet activity")}
                </Text>
              </List.Item>
              <List.Item>
                <Text textStyle="xs" color="text.subtle">
                  {t("App score rules bullet reward payout")}
                </Text>
              </List.Item>
              <List.Item>
                <Text textStyle="xs" color="text.subtle">
                  {t("App score rules bullet user satisfaction")}
                </Text>
              </List.Item>
            </List.Root>
            <Text textStyle="xs" color="text.subtle">
              {t("App score rules closing")}
            </Text>
          </VStack>
        </Box>
      </VStack>
    </BaseModal>
  )
}
