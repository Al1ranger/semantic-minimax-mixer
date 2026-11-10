Contribution type **Builder → Intelligent Contracts**

SemanticMinimaxMixer — Exact Mixed Strategy Bounds from Text

SemanticMinimaxMixer analyzes a simultaneous 2×2 game with written matchups. The leader and each validator independently fetch the full commit-pinned scenario, verify its SHA-256, and judge all four outcomes against the same criterion. The complete report must match exactly.

Unknown outcomes become 0 in the pessimistic matrix and 1 in the optimistic matrix. The contract computes both minimax values with exact half-unit arithmetic. Each bound includes row and column mixtures and their payoffs against both pure choices. Public reads bind the report root.

In StudioNet, the balanced scenario achieved an exact worst-case value of 1/2 through equal mixing. With one outcome unspecified, the interval widened to [0, 1/2] and the target decision became UNRESOLVED. These results apply to the hypothetical matchup model.

Evidence

- [GitHub repository](https://github.com/Al1ranger/semantic-minimax-mixer)
- [Pinned contract source](https://github.com/Al1ranger/semantic-minimax-mixer/blob/1297f93f37192b5441fd7517e33f019f7a7619d5/contracts/SemanticMinimaxMixer.py)
- [StudioNet contract](https://explorer-studio.genlayer.com/address/0x96b0FfE03611F43FA1fAA8e5CDeE0c8733848a36)
- [Proof matrix](https://github.com/Al1ranger/semantic-minimax-mixer/blob/main/LIVE_PROOFS.md)
- [deploy](https://explorer-studio.genlayer.com/tx/0xd7aa3ee169696d9c193134604e285bd0810d2e24a9e8626fd3269820d0dbd8ed)
- [balanced](https://explorer-studio.genlayer.com/tx/0xc86d82c15f9b9e7a96afcdc12f01aee634d2d9b65c8443be0d45764f81bebe48)
- [uncertain](https://explorer-studio.genlayer.com/tx/0xcb66b8775516b48fbb9e29e2076e5b8e2fc0c72ce1ae533501181da7b74e5c33)
- [replay](https://explorer-studio.genlayer.com/tx/0xba04e2eabc0134a06f1e49fff06953b93271854a72a6c424566657cecad3bd03)
