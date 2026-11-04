/**
 * Local (thor-solo) only: pays small B3TR rewards from the seeded apps to test wallets,
 * through X2EarnRewardsPool. This is the real path that makes a wallet eligible to rate
 * and review (VeBetterPassport.userUniqueAppInteraction) and gives the indexer action data.
 *
 * Usage (from packages/contracts):
 *   NEXT_PUBLIC_APP_ENV=local npx hardhat run scripts/standalone/seedReviewEligibility.ts --network vechain_solo
 * Optional: SEED_RECEIVERS=0xabc,0xdef to pay extra wallets (e.g. your own VeWorld account).
 */
import { ethers } from "hardhat"
import { getConfig } from "@repo/config"
import {
  B3TR__factory,
  VeBetterPassport__factory,
  X2EarnApps__factory,
  X2EarnRewardsPool__factory,
} from "../../typechain-types"

const APPS_TO_SEED = 3
const DEPOSIT_PER_APP = ethers.parseEther("1000")
const REWARD = ethers.parseEther("10")
const APP_SECURITY_LOW = 1

async function main() {
  const config = getConfig()
  if (config.network.name !== "solo") throw new Error(`Refusing to run on ${config.network.name}; solo only`)

  const signers = await ethers.getSigners()
  const admin = signers[0]
  const appAdmin = signers[6] // admin and team wallet of every seeded app (see scripts/deploy/setup.ts)

  const x2EarnApps = X2EarnApps__factory.connect(config.x2EarnAppsContractAddress, admin)
  const pool = X2EarnRewardsPool__factory.connect(config.x2EarnRewardsPoolContractAddress, appAdmin)
  const b3tr = B3TR__factory.connect(config.b3trContractAddress, appAdmin)
  const passport = VeBetterPassport__factory.connect(config.veBetterPassportContractAddress, admin)

  const extra = (process.env.SEED_RECEIVERS ?? "")
    .split(",")
    .map(a => a.trim())
    .filter(Boolean)
  const receivers = [...signers.slice(1, 6).map(s => s.address), ...extra]

  const apps = (await x2EarnApps.apps()).slice(0, APPS_TO_SEED)
  console.log(`Seeding ${apps.length} apps, ${receivers.length} receivers`)

  for (const app of apps) {
    const appId = app.id
    if (!(await x2EarnApps.isAppAdmin(appId, appAdmin.address))) {
      throw new Error(`${appAdmin.address} is not admin of ${app.name}; seeded app layout changed`)
    }
    if (!(await x2EarnApps.isRewardDistributor(appId, appAdmin.address))) {
      await (await x2EarnApps.connect(appAdmin).addRewardDistributor(appId, appAdmin.address)).wait()
    }
    if ((await passport.appSecurity(appId)) === 0n) {
      await (await passport.setAppSecurity(appId, APP_SECURITY_LOW)).wait()
    }
    await (await b3tr.approve(await pool.getAddress(), DEPOSIT_PER_APP)).wait()
    await (await pool.deposit(DEPOSIT_PER_APP, appId)).wait()
    // Apps with the rewards-pool mode on pay out of rewardsPoolBalance, not availableFunds.
    if (await pool.isRewardsPoolEnabled(appId)) {
      await (await pool.increaseRewardsPoolBalance(appId, DEPOSIT_PER_APP)).wait()
    }

    for (const receiver of receivers) {
      await (await pool.distributeReward(appId, REWARD, receiver, "")).wait()
    }
    const eligible = await Promise.all(receivers.map(r => passport.userUniqueAppInteraction(r, appId)))
    console.log(`${app.name} (${appId}): eligible ${eligible.filter(Boolean).length}/${receivers.length}`)
  }

  console.log(
    "Test wallets (solo mnemonic indexes 1-5):",
    signers
      .slice(1, 6)
      .map(s => s.address)
      .join(", "),
  )
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
