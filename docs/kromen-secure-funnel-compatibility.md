# T08: Kromen secure funnel compatibility

Base: `9c48dd86393acb82c18c8fad5f2da1937f1f8f4a` on
`Kromen-Energieassistent-Ddc0DVM8MT67wmLP3wAA`.

## Isolated reference adapter

`src/lib/kromenOrderCompatibility.ts` prepares an unverified order reference
without introducing a secure endpoint, DTO schema, token parameter or capability
verification algorithm. It is deliberately not imported by any production page
or loader. The supplied Location must equal Kromen's existing
`Ddc0DVM8MT67wmLP3wAA`; query Location conflicts and duplicate identities fail
closed. An order UUID must occur exactly once and have canonical UUID shape.
The adapter trims it without changing casing or assuming a UUID version.
`submission_id` is not converted into a secure order identity.

Every result has `authorized: false`, including valid UUIDs and queries containing
tokens or client authorization claims. This flag is not an authorization service.
A later integration must perform the accepted server-side authorization and DTO
validation before any protected read or submission. No such wire contract is
specified in this branch's runtime/config or offer-content contracts, so this
change does not invent one or interpret credential payloads.

Diagnostics contain only a fixed status and `authorized: false`. They omit all
input values, including tokens, UUIDs, Location, language and referral. The
adapter performs no fetch, logging or storage writes. These diagnostics apply
to the new isolated adapter, not every existing loader's error handling.

## Current funnel coverage and limits

The focused tests execute the existing closing-loader bootstrap with mocked
Supabase responses, check its Location and UUID/language overrides, and verify
that a failed config load does not launch the closing engine or expose the error
payload. React wrapper tests check exact opaque query forwarding, including
language, UUID, submission, referral and preview context. Existing offer-link
tests preserve UUID/language plus referral parameters already present in the
configured destination URL; they do not add incoming referral propagation or
change affiliate behavior. Referral/preview fixture names are opaque query
examples, not new backend parameter contracts.

The legacy offer loader still reads orders using its existing `uuid` or
`submission_id` lookup. This change does not establish that those legacy reads
are secure or change their authorization model. A UUID identifies an order;
neither UUID possession nor parsing through this adapter grants access.

Kromen content, loader assets, endpoint selection, preview authentication and
affiliate UI remain unchanged. All requests in the new loader tests are mocked.
No SQL, migrations, deployment or other Location changes are included.
