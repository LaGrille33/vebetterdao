# NAS test stack

This Compose overlay builds the existing sibling `dao` and `indexer` repositories
on the NAS. It provides a dedicated MongoDB replica set, the indexer/API pair, the
DAO frontend and a loopback-only reverse proxy. It is separate from the running
scoring-pilot project and does not publish database ports.

## Preconditions

1. Keep the repositories as siblings named `dao` and `indexer`; the build contexts
   rely on that layout.
2. Do not start until the staging review-manager v4 is deployed and its Passport
   linkage is verified. Insert only that verified address in copied environment files.
3. Create ignored `config/` files from the examples. Passwords and the Mongo
   replica key are operator-owned secrets; do not commit them or put them in history.
4. The stack starts from an empty Mongo database and must never target production MongoDB.
5. Review gas sponsorship is disabled unless `REVIEW_DELEGATOR_URL` is set. The
   browser sends only review-manager actions to that VIP-201 endpoint; it does
   not and must not contain the funder's wallet key.

## Access model

- MongoDB is on an internal Docker network with no host port.
- The frontend/API are exposed only at `127.0.0.1:8088` on the NAS.
- Access it through the restricted SSH tunnel. The default frontend API URL is
  `http://localhost:8088/indexer/api/v1`, which is correct through that tunnel.
- Do not expose it by changing the port binding. Add HTTPS and authenticated proxy
  access first if LAN/Internet access is later approved.

## Read-only historical-score adapter

`compose.scores.yaml` adds a separate, optional `score-api` service. It is built
from `indexer/tools/scoring-pilot` and joins the existing scoring-pilot's private
network only when the `scores` profile is explicitly selected. Its database role
must have `SELECT` only on `reputation_pilot`, and it accepts one manually reviewed
completed-run UUID. Its HTTP API has no calculation, promotion or write endpoint.

The API is available at `/reputation/v1/apps/{appId}/score` and returns exact
decimal strings, source run/version provenance and an explicit `partial: true`,
`maximum: 60` marker. This avoids displaying incomplete Activity/Distribution data
as an official 100-point reputation score.

Mainnet score records and testnet app pages can use different app IDs. Before
enabling `NAS_TEST_REPUTATION_URL`, create `config/app-id-map.json` from the empty
example and map each reviewed testnet app ID to its approved mainnet source app ID.
An unmapped app ID is never guessed or fuzzy-matched.

## Review gas sponsorship

`REVIEW_DELEGATOR_URL` is intentionally separate from the application's normal
delegator configuration. When configured, only these user-signed actions are
sent for fee delegation: `createReview`, `editReview`, `submitRating`,
`updateRating`, and `voteOnReview`. All other application transactions continue
to pay their own gas.

The gas-payer service must hold the funding wallet outside this repository and
must reject every request except an expected testnet-staging chain transaction
whose only clause calls the configured `XAppReviewManager` address and one of
those five method selectors. It should also enforce per-wallet and global VTHO
limits, expiry, request rate limits, and audit logging. Do not add a mnemonic,
private key, or a signing service to this Compose project.

## Deliberate limit

This initial stack serves the repository's current indexer score/review/badge
models. The score-read API is prepared but not yet wired into the general frontend
score card: the current card assumes an official four-dimension /100 score, while
the NAS historical run is explicitly Activity/Distribution-only (/60). Connecting
it requires a labelled UI mode rather than silently changing the product score.

## Validate before NAS start

```sh
docker compose --env-file config/.env config
```

`up --build` is a deployment action and needs Jerome's confirmation.
