import ast
from fractions import Fraction
import hashlib
from itertools import product
import json
from pathlib import Path
from types import SimpleNamespace

import pytest

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "contracts" / "SemanticMinimaxMixer.py"
HELPERS = [node for node in ast.parse(SOURCE.read_text(encoding="utf-8")).body
           if isinstance(node, (ast.Assign, ast.FunctionDef))]
BODY = (ROOT / "examples" / "balanced.json").read_text(encoding="utf-8")
SHA = hashlib.sha256(BODY.encode()).hexdigest()
SPEC = {"sha256": SHA, "url": "https://raw.githubusercontent.com/test/repo/" + "a"*40 + "/case.json"}


def helpers(gl=None):
    namespace = {"hashlib": hashlib, "json": json, "gl": gl}
    exec(compile(ast.Module(body=HELPERS, type_ignores=[]), str(SOURCE), "exec"), namespace)
    return namespace


def exact_value(matrix):
    a, b, c, d = matrix
    points = [Fraction(0), Fraction(1)]
    if a-b-c+d:
        crossing = Fraction(d-c, a-b-c+d)
        if 0 < crossing < 1:
            points.append(crossing)
    return max(min(c+(a-c)*p, d+(b-d)*p) for p in points)


def test_all_81_partial_matrices_against_independent_rational_solver():
    report_for = helpers()["report_for"]
    for labels in product(("PASS", "FAIL", "UNKNOWN"), repeat=4):
        report = report_for(SPEC, BODY, list(labels))
        options = [(1,) if x == "PASS" else (0,) if x == "FAIL" else (0, 1) for x in labels]
        values = [exact_value(m) for m in product(*options)]
        assert Fraction(report["lower"]["value_numerator"], 2) == min(values)
        assert Fraction(report["upper"]["value_numerator"], 2) == max(values)
        assert report["status"] == ("GUARANTEED" if min(values) >= Fraction(1, 2)
                                    else "IMPOSSIBLE" if max(values) < Fraction(1, 2) else "UNRESOLVED")
        for result in [report["lower"], report["upper"]]:
            v = result["value_numerator"]
            assert min(result["row_against_columns"]) == v == max(result["column_against_rows"])
            assert sum(result["row_mix"]) == sum(result["column_mix"]) == 2


def test_validator_refetches_and_rejects_different_decision_or_source():
    calls = []
    labels = ["PASS", "FAIL", "FAIL", "PASS"]
    bodies = iter([BODY, BODY, BODY, BODY + " "])

    class Return:
        def __init__(self, calldata):
            self.calldata = calldata

    def fetch(url):
        calls.append(url)
        return SimpleNamespace(status=200, body=next(bodies).encode())

    def prompt(text, response_format):
        assert "The alarm remains silent." in text and response_format == "json"
        return {"labels": labels}

    def run(leader, validator):
        honest = leader()
        assert validator(Return(honest))
        false = helpers()["report_for"](SPEC, BODY, ["PASS", "FAIL", "FAIL", "UNKNOWN"])
        assert false["status"] == "UNRESOLVED"
        assert not validator(Return(false))
        assert not validator(Return(honest))
        return honest

    gl = SimpleNamespace(vm=SimpleNamespace(Return=Return, UserError=ValueError, run_nondet_unsafe=run),
                         nondet=SimpleNamespace(web=SimpleNamespace(get=fetch), exec_prompt=prompt))
    assert helpers(gl)["interpret"](SPEC)["lower"]["row_mix"] == [1, 1]
    assert calls == [SPEC["url"]] * 4


@pytest.mark.parametrize("raw", ['{"labels":[],"labels":[]}', {"labels": ["PASS"] * 3},
                                 {"labels": ["PASS"] * 4, "confidence": 1}])
def test_malformed_model_labels_fail_closed(raw):
    with pytest.raises(ValueError):
        helpers()["parse_labels"](raw)


def test_direct_publication_and_bound_read(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy(str(SOURCE))
    direct_vm.sender = direct_alice
    coord = SPEC["url"].split("raw.githubusercontent.com/")[1]
    direct_vm.mock_web(r"https://raw\.githubusercontent\.com/.*", {
        "response": {"status": 200, "headers": {}, "body": BODY.encode()}, "method": "GET",
    })
    direct_vm.mock_llm(r".*MINIMAX_SCENARIO_V1.*", json.dumps({"labels": ["PASS", "FAIL", "FAIL", "PASS"]}))
    with direct_vm.expect_revert("Invalid pinned coordinate"):
        contract.analyze("report", coord + "?x=y", SHA)
    ident = contract.analyze("report", coord, SHA)
    report = contract.get_report(ident)
    assert report["body"] == BODY and report["spec"]["sha256"] == SHA
    assert contract.decision(ident, report["root"]) == {
        "status": "GUARANTEED", "guaranteed_row_mix": [1, 1], "lower": 1,
        "upper": 1, "denominator": 2, "root": report["root"],
    }
    with direct_vm.expect_revert("Report root mismatch"):
        contract.decision(ident, "wrong")
    with direct_vm.expect_revert("Report already published"):
        contract.analyze("report", coord, SHA)
