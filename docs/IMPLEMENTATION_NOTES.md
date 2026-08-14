# Implementation Notes

## 1. Frontend stance

The current code is deliberately static and dependency-free. It provides a design and interaction prototype, not a production appraisal platform.

The production frontend can remain static/SPA-like, but assessment state should move from browser `localStorage` into authenticated server-side records.

## 2. Suggested API boundaries

### POST /api/intakes
Create an intake record and return an item/case ID.

### POST /api/intakes/{id}/evidence
Upload image/PDF evidence to object storage and link immutable originals to the case.

### POST /api/intakes/{id}/normalise
Run the intake normaliser.

### POST /api/intakes/{id}/check
Run completeness, blocker and contradiction checks.

### POST /api/intakes/{id}/assess
Dispatch to the category module:
- `coin`
- `certificate_backed_gemstone`

### POST /api/intakes/{id}/range
Build a purpose-specific provisional range only after valuation context is explicit.

### POST /api/intakes/{id}/qa
Run adversarial QA and determine `release`, `return_for_evidence` or `escalate`.

### GET /api/reports/{id}
Return canonical structured data used to render the report.

### GET /api/registry
Return the authenticated user's persistent items and revisions.

## 3. Canonical report payload

At minimum:

```json
{
  "item_id": "ZAC-...",
  "revision": 1,
  "category": "coin",
  "valuation_context": "collector_market",
  "observed": [],
  "inferred": [],
  "missing": [],
  "confidence": {
    "identification": 0,
    "authenticity": 0,
    "condition": 0,
    "value": 0
  },
  "blockers": [],
  "value_range": {
    "currency": "ZAR",
    "low": null,
    "high": null,
    "source_date": null
  },
  "next_best_action": "",
  "release_state": "provisional"
}
```

Narrative copy should render from the canonical record rather than becoming the source of truth.

## 4. Evidence handling

Production evidence storage should:

- preserve immutable originals
- store crops/derived images separately
- hash evidence where useful
- retain MIME type, file size, capture/upload timestamp and source
- link each report revision to the exact evidence set used
- avoid deleting older evidence merely because a later revision supersedes it

## 5. Confidence

Do not collapse the four confidence dimensions into one score.

Each confidence field should store:

- score or band
- rationale
- evidence dependencies
- unresolved blockers
- model/service version

## 6. Certificate-backed gemstones

Keep these states distinct:

1. certificate text extracted
2. report number present
3. issuing-source verification state
4. inscription visible / not visible / inconsistent
5. photo-to-certificate consistency
6. physical authenticity assessment
7. valuation context and range

A verified certificate is not equivalent to a verified stone-to-certificate match and is not a valuation.

## 7. Acquisition

Acquisition records should remain separate from appraisal records.

A Vault item can reference Registry/provenance evidence, but sales or enquiry state should not overwrite assessment facts.
