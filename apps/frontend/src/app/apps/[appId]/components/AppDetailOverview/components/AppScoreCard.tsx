"use client"

import { Card, Image, Link, Skeleton, Stack, Text, useDisclosure } from "@chakra-ui/react"
import { UilArrowUpRight } from "@iconscout/react-unicons"
import dayjs from "dayjs"
import { useParams } from "next/navigation"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { mapXAppPreviousRoundScore } from "@/api/indexer/xapps/mapXAppPreviousRoundScore"
import { useXAppPreviousRoundScore } from "@/api/indexer/xapps/useXAppPreviousRoundScore"
import { LightMode } from "@/components/ui/color-mode"
const notDataImage = "/assets/images/image-not-data.png"

import { APP_SCORE_ACCENT_HEX } from "./appScoreConstants"
import { AppScoreDetailsModal } from "./AppScoreDetailsModal"

export const AppScoreCard = () => {
  const { appId } = useParams<{ appId: string }>()
  const { t } = useTranslation()
  const { open: isModalOpen, onOpen: onOpenModal, onClose: onCloseModal } = useDisclosure()
  const { data, isLoading } = useXAppPreviousRoundScore(appId ?? "")
  const scoreData = useMemo(() => mapXAppPreviousRoundScore(data), [data])

  return (
    <>
      <LightMode>
        <Card.Root
          css={{
            padding: 6,
          }}
          variant="primary"
          position="relative"
          h="320px"
          overflow="hidden"
          bg="#E9FDF1"
          border="none"
          _dark={{
            bg: "green.50",
          }}>
          <Image
            src="/assets/images/score-card-bg.webp"
            alt=""
            w="224px"
            h="280px"
            position="absolute"
            objectFit="contain"
            right={0}
            top={0}
          />
          <Card.Body position="relative" zIndex={1} alignItems="flex-start" color="text.default">
            <Link
              position="absolute"
              top={0}
              right={0}
              textStyle="md"
              fontWeight="normal"
              color="actions.secondary.text-lighter"
              onClick={onOpenModal}>
              {t("More")}
              <UilArrowUpRight />
            </Link>
            {scoreData.scoreDisplay ? (
              <Stack gap={0} mb={6} h={"200px"}>
                <Stack gap={1} mb={12}>
                  <Skeleton loading={isLoading}>
                    <Text textStyle="4xl" mb={1} fontWeight="bold" color={APP_SCORE_ACCENT_HEX}>
                      {scoreData.scoreDisplay}
                    </Text>
                  </Skeleton>
                  <Text textStyle="sm" color="text.subtle">
                    {scoreData.partial ? "Historical test score — Activity + Distribution" : t("App Score")}
                  </Text>
                </Stack>
                <Stack gap={1}>
                  <Skeleton loading={isLoading}>
                    <Text textStyle="lg" fontWeight="bold" color="text.default">
                      {"#"}
                      {scoreData.rankDisplay}
                    </Text>
                  </Skeleton>
                  <Text textStyle="sm" color="text.subtle">
                    {t("Ranking")}
                  </Text>
                </Stack>
              </Stack>
            ) : (
              <Stack h={"200px"}>
                <Image w="48px" src={notDataImage} h={"56px"} my={2} />
                <Text textStyle="md" color="gray.500">
                  {t("No App Scores Yet")}
                </Text>
              </Stack>
            )}
            <Stack>
              <Skeleton loading={isLoading}>
                <Text textStyle="lg" fontWeight="semibold" color="text.default">
                  {t("{{date}} (Round #{{round}})", {
                    date:
                      scoreData.roundDate != null ? dayjs.unix(Number(scoreData.roundDate)).format("MMM D, YYYY") : "-",
                    round: scoreData.roundDisplay,
                  })}
                </Text>
              </Skeleton>
            </Stack>
          </Card.Body>
        </Card.Root>
      </LightMode>

      <AppScoreDetailsModal isOpen={isModalOpen} onClose={onCloseModal} scoreData={scoreData} isLoading={isLoading} />
    </>
  )
}
