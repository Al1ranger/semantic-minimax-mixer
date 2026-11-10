# StudioNet proofs

[Contract and deployed source](https://explorer-studio.genlayer.com/address/0x96b0FfE03611F43FA1fAA8e5CDeE0c8733848a36)

Normalized source SHA-256 `daa588b6be55e5216219b3686aed0b100ba5d5122200d1c9b9e07796ff5a9197`

[Pinned source and fixtures](https://github.com/Al1ranger/semantic-minimax-mixer/tree/1297f93f37192b5441fd7517e33f019f7a7619d5)

| Step | Finality | Execution | Consensus | Agree / disagree / idle |
|---|---|---|---|---|
| [deploy](https://explorer-studio.genlayer.com/tx/0xd7aa3ee169696d9c193134604e285bd0810d2e24a9e8626fd3269820d0dbd8ed) | FINALIZED | SUCCESS | MAJORITY_AGREE | 3 / 0 / 2 |
| [balanced](https://explorer-studio.genlayer.com/tx/0xc86d82c15f9b9e7a96afcdc12f01aee634d2d9b65c8443be0d45764f81bebe48) | FINALIZED | SUCCESS | MAJORITY_AGREE | 3 / 0 / 2 |
| [uncertain](https://explorer-studio.genlayer.com/tx/0xcb66b8775516b48fbb9e29e2076e5b8e2fc0c72ce1ae533501181da7b74e5c33) | FINALIZED | SUCCESS | MAJORITY_AGREE | 3 / 0 / 2 |
| [replay](https://explorer-studio.genlayer.com/tx/0xba04e2eabc0134a06f1e49fff06953b93271854a72a6c424566657cecad3bd03) | FINALIZED | ERROR | MAJORITY_AGREE | 3 / 0 / 2 |

| Scenario | Labels (row-major) | Lower / upper value | Lower row mix | Upper row mix | Target decision |
|---|---|---|---|---|---|
| [balanced](https://github.com/Al1ranger/semantic-minimax-mixer/blob/1297f93f37192b5441fd7517e33f019f7a7619d5/examples/balanced.json) | PASS, FAIL, FAIL, PASS | 1/2, 1/2 | 1:1 | 1:1 | GUARANTEED |
| [uncertain](https://github.com/Al1ranger/semantic-minimax-mixer/blob/1297f93f37192b5441fd7517e33f019f7a7619d5/examples/uncertain.json) | PASS, FAIL, FAIL, UNKNOWN | 0/2, 1/2 | 0:2 | 1:1 | UNRESOLVED |

The verifier checked exact fixture bytes and report roots, both strategies and their payoff inequalities, two bound decisions, two mismatched root rejections, and the full contract transaction history. [Machine-readable results](PROOFS.json).
