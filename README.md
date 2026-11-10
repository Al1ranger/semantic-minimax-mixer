# SemanticMinimaxMixer

SemanticMinimaxMixer derives exact lower and upper values for a simultaneous 2×2 game specified in natural language. For example, a planner can compare two choices against two possible adversarial choices when only written outcomes describe whether a target is met. The examples are hypothetical and model the success of a private random draw. Neither player observes the other's sampled action before choosing.

The caller supplies a commit-pinned GitHub coordinate and a SHA-256. The leader and every validator independently fetch the full JSON body, check its size, digest and schema, then interpret each matchup against the same written criterion. They compare the complete report exactly. Unknown cells are 0 in the pessimistic matrix and 1 in the optimistic matrix. Source or model failures prevent publication. The contract re-derives arithmetic and source binding before storing the report.

Each matrix has binary payoffs. For row probability p, the minimum of two affine payoff lines reaches its maximum at an endpoint or their crossing. Any interior crossing of binary payoff lines is 1/2. The same argument gives the column's optimal response. The report stores both mixtures and their two payoff checks in half units, giving exact lower and upper values. Every completion of the unknown cells lies between these matrices entry by entry, so its game value lies between the reported endpoints. The lower strategy works across all completions. The upper strategy describes the optimistic game only.

A lower value of at least 1/2 yields GUARANTEED. An upper value below 1/2 yields IMPOSSIBLE. Otherwise the result is UNRESOLVED. These are properties of the stated matchup model and agreed labels. The system neither samples the strategy nor executes its actions. Labels can share model errors. A digest binds the public text; it does not establish any real-world outcome.

The state is a content-bound, immutable strategy report per sender/nonce. There is no version head, proposal graph, owner approval, certificate, consumption, or settlement. SemanticFlowEnvelope solves conserved capacity allocation. This contract computes mixed security strategies for opposing simultaneous choices. SemanticEffectCommutator composes two operations over a state frame. Here each cell is a direct matchup and action probabilities are the result.

```powershell
python -m pip install -r requirements-dev.txt
genvm-lint check contracts/SemanticMinimaxMixer.py
python -m pytest tests -q
npm ci --ignore-scripts
```

[GenLayer Equivalence Principle](https://docs.genlayer.com/developers/intelligent-contracts/equivalence-principle). Native transport and Windows testing helpers are adapted from [SemanticEffectCommutator](https://github.com/Al1ranger/semantic-effect-commutator) under the included MIT notices.

StudioNet deployment and receipts are pending.
