# Unknown image results

The worker/agent contract adds `status: "unknown"` and a safe `errorCode`, with
no numeric score. API mapping retains this distinction; invalid numeric values
never default to zero. Cards label unavailable evidence as Unknown, and pending
work remains Pending.

Unknown on an enabled question cannot pass that filter. Those listings appear
in a separate “Could not evaluate” section and do not inflate the passing result
count or map markers. If the user disables that question, normal selected-filter
semantics apply; the Unknown badge remains visible on the card. No classification
threshold or model confidence semantics changed for normal scored results.

`testdata/classification-results.json` is an identical synthetic fixture in the
worker, agent and web repos. Tests pass it through actual SSE parsing/controller
mapping, distinguish Unknown from negative and Pending, verify request completion
stops loading, and preserve disabled-question behavior. Agent tests separately
verify the real SSE handler produces the corresponding contract. No live search,
paid inference, model, evaluation labels, deployment or source acquisition ran.

This draft requires the coordinated agent/worker changes and staged verification
before any production rollout. It does not activate v30/v32 or establish their
unavailable inference/export contracts.
