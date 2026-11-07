import localConfig from "./local"
import e2eConfig from "./e2e"
import stagingConfig from "./testnet-staging"
import testnetConfig from "./testnet"
import mainnetConfig from "./mainnet"
import { AppEnv, EnvConfig, getContractsConfig } from "./contracts"
import { Network } from "@repo/constants"
import { getEnvDatadogApp, getEnvDatadogClient, getEnvDatadogEnv } from "./datadog"
import { getEnvMixPanel } from "./mixPanel"

type B3TRGovernorLibraries = {
  governorClockLogicAddress: string
  governorConfiguratorAddress: string
  governorDepositLogicAddress: string
  governorFunctionRestrictionsLogicAddress: string
  governorProposalLogicAddressAddress: string
  governorQuorumLogicAddress: string
  governorStateLogicAddress: string
  governorVotesLogicAddress: string
}

type PassportLibraries = {
  passportChecksLogicAddress: string
  passportConfiguratorAddress: string
  passportEntityLogicAddress: string
  passportDelegationLogicAddress: string
  passportPersonhoodLogicAddress: string
  passportPoPScoreLogicAddress: string
  passportSignalingLogicAddress: string
  passportWhitelistAndBlacklistLogicAddress: string
}

type XAllocationVotingLibraries = {
  autoVotingLogicAddress: string
}

type ExternalContractIntegrations = {
  // Vet Domains Contract: https://docs.vet.domains/Developers/Contracts/Verification/#verified-contract
  vetDomainsContractAddress: string
}

export type AppConfig = {
  environment: EnvConfig
  basePath?: string
  ipfsPinningService: string
  ipfsFetchingService: string
  b3trContractAddress: string
  vot3ContractAddress: string
  b3trGovernorAddress: string
  timelockContractAddress: string
  xAllocationPoolContractAddress: string
  xAllocationVotingContractAddress: string
  relayerRewardsPoolContractAddress: string
  emissionsContractAddress: string
  voterRewardsContractAddress: string
  galaxyMemberContractAddress: string
  treasuryContractAddress: string
  x2EarnAppsContractAddress: string
  x2EarnCreatorContractAddress: string
  x2EarnRewardsPoolContractAddress: string
  tokenAuctionContractAddress: string
  nodeManagementContractAddress: string
  veBetterPassportContractAddress: string
  challengesContractAddress: string
  b3trGovernorLibraries: B3TRGovernorLibraries
  passportLibraries: PassportLibraries
  xAllocationVotingLibraries: XAllocationVotingLibraries
  b3trMultiSigAddress: string
  stargateNFTContractAddress: string
  stargateContractAddress: string
  grantsManagerContractAddress: string
  dbaPoolContractAddress: string
  navigatorRegistryContractAddress: string
  veDelegateAutoDepositContractAddress: string
  // VeDelegate ERC721 factory (vechain-energy/vedelegate-for-dapps).
  // Empty on non-mainnet envs since veDelegate is only deployed on mainnet.
  veDelegateContractAddress: string
  nodeUrl: string
  indexerUrl?: string
  /** NAS-only, read-only historical score adapter. Never carries database credentials. */
  reputationScoreUrl?: string
  xAppReviewManagerContractAddress?: string
  network: Network

  // External integrations
  externalContractIntegrations?: ExternalContractIntegrations
}

const getNasTestPublicUrl = (
  appEnv: EnvConfig,
  variable: "NEXT_PUBLIC_NAS_TEST_INDEXER_URL" | "NEXT_PUBLIC_NAS_TEST_REPUTATION_URL",
): string | undefined => {
  // This deliberately applies only to testnet-facing builds.  The URL is public build
  // configuration for the browser, never a database credential.
  if (appEnv !== AppEnv.TESTNET && appEnv !== AppEnv.TESTNET_STAGING) return undefined
  const value = process.env[variable]
  if (!value) return undefined

  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error(`${variable} must be an absolute http(s) URL`)
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error(`${variable} must be a credential-free http(s) URL`)
  }
  return url.toString().replace(/\/$/, "")
}

export const getConfig = (env?: EnvConfig): AppConfig => {
  const appEnv = env || process.env.NEXT_PUBLIC_APP_ENV
  if (!appEnv) throw new Error("NEXT_PUBLIC_APP_ENV env variable must be set or a type must be passed to getConfig()")

  const config = (() => {
    switch (appEnv) {
      case AppEnv.LOCAL:
        return localConfig
      case AppEnv.E2E:
        return e2eConfig
      case AppEnv.TESTNET_STAGING:
        return stagingConfig
      case AppEnv.TESTNET:
        return testnetConfig
      case AppEnv.MAINNET:
        return mainnetConfig
      default:
        throw new Error(`Unsupported NEXT_PUBLIC_APP_ENV ${appEnv}`)
    }
  })()

  const nasTestIndexerUrl = getNasTestPublicUrl(appEnv, "NEXT_PUBLIC_NAS_TEST_INDEXER_URL")
  const nasTestReputationUrl = getNasTestPublicUrl(appEnv, "NEXT_PUBLIC_NAS_TEST_REPUTATION_URL")
  return nasTestIndexerUrl || nasTestReputationUrl
    ? {
        ...config,
        ...(nasTestIndexerUrl ? { indexerUrl: nasTestIndexerUrl } : {}),
        ...(nasTestReputationUrl ? { reputationScoreUrl: nasTestReputationUrl } : {}),
      }
    : config
}

export { getContractsConfig, getEnvDatadogApp, getEnvDatadogClient, getEnvDatadogEnv, getEnvMixPanel }
