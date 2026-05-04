import json
import uuid

from fastapi.testclient import TestClient
from app.main import app
from openai import OpenAIError

client = TestClient(app)


def parse_ndjson(text: str) -> list:
    return [json.loads(line) for line in text.strip().split("\n") if line.strip()]


def fake_stream(reports: list):
    yield json.dumps({"stage": "started"}) + "\n"
    yield json.dumps({"stage": "detection", "bug_count": len(reports)}) + "\n"
    for report in reports:
        yield json.dumps({"stage": "trace_result", "report": report}) + "\n"
    yield json.dumps({
        "stage": "completed",
        "bug_count": len(reports),
        "true_bug_count": sum(1 for r in reports if r["is_true_bug"])
    }) + "\n"


FAKE_REPORT = {
    "data_flow_path": [{"line": 1, "variable": "x"}],
    "sanitizer_results": {
        "type_sanitize": False,
        "functionality_sanitize": {"source_reasoning": "The code directly divides by zero."},
        "order_sanitize": False,
        "reachability_sanitize": {"reasoning": "Always reachable."}
    },
    "is_true_bug": True
}


def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "Flowguard",
                               "version": "0.1.0", "python_support": True}


def test_analyse_endpoint_with_mock(mocker):
    mocker.patch("app.api.v1.routes.analysis.stream_llmsan",
                 return_value=fake_stream([FAKE_REPORT]))

    response = client.post("/api/v1/analyze", json={
        "code": "int x = 10 / 0;",
        "language": "java",
        "model": "gpt-4o-mini",
        "bug_type": "dbz"
    })

    assert response.status_code == 200
    events = parse_ndjson(response.text)
    stages = [e["stage"] for e in events]
    assert stages[0] == "started"
    assert "completed" in stages
    completed = next(e for e in events if e["stage"] == "completed")
    assert completed["bug_count"] == 1
    assert completed["true_bug_count"] == 1


def test_analyse_endpoint_with_invalid_input():
    response = client.post("/api/v1/analyze", json={
        "code": "int x = 10 / 0;",
        "language": "java",
        "model": "gpt-4o-mini"
    })

    assert response.status_code == 422
    assert response.json() == {"detail": "Invalid request data"}


def test_fix_endpoint(mocker):
    fake_result = {
        "original_code": "int x = 10 / 0;",
        "fixed_code": "int x = 10 / (y + 1);",
        "changes": [{"line": 1, "description": "Replaced division by zero."}]
    }

    mocker.patch("app.api.v1.routes.fix.fix_code_pipeline", return_value=fake_result)

    response = client.post("/api/v1/fix", json={
        "code": "int x = 10 / 0;",
        "model": "gpt-4o-mini",
        "bug": [FAKE_REPORT],
        "language": "Java"
    })

    assert response.status_code == 200
    assert response.json() == fake_result


def test_fix_endpoint_with_invalid_input():
    response = client.post("/api/v1/fix", json={
        "code": "int x = 10 / 0;",
        "model": "gpt-4o-mini"
    })

    assert response.status_code == 422
    assert response.json() == {"detail": "Invalid request data"}


def test_analyse_endpoint_with_openai_error(mocker):
    mocker.patch("app.api.v1.routes.analysis.stream_llmsan",
                 side_effect=OpenAIError("OpenAI API error"))

    response = client.post("/api/v1/analyze", json={
        "code": "int x = 10 / 0;",
        "language": "java",
        "model": "gpt-4o-mini",
        "bug_type": "dbz"
    })

    assert response.status_code == 200
    events = parse_ndjson(response.text)
    assert any(e.get("stage") == "error" for e in events)


def test_fix_endpoint_with_openai_error(mocker):
    mocker.patch("app.api.v1.routes.fix.fix_code_pipeline",
                 side_effect=OpenAIError("OpenAI API error"))

    response = client.post("/api/v1/fix", json={
        "code": "int x = 10 / 0;",
        "model": "gpt-4o-mini",
        "bug": [FAKE_REPORT],
        "language": "Java"
    })

    assert response.status_code == 502


def test_analyse_endpoint_with_generic_error(mocker):
    mocker.patch("app.api.v1.routes.analysis.stream_llmsan",
                 side_effect=RuntimeError("unexpected boom"))

    response = client.post("/api/v1/analyze", json={
        "code": "int x = 10 / 0;",
        "language": "java",
        "model": "gpt-4o-mini",
        "bug_type": "dbz"
    })

    assert response.status_code == 200
    events = parse_ndjson(response.text)
    assert any(e.get("stage") == "error" for e in events)


def test_middleware_generates_request_id_when_absent():
    response = client.get("/api/v1/health")
    assert "x-request-id" in response.headers
    uuid.UUID(response.headers["x-request-id"])


def test_middleware_preserves_valid_request_id():
    sent_id = str(uuid.uuid4())
    response = client.get("/api/v1/health", headers={"X-Request-ID": sent_id})
    assert response.headers.get("x-request-id") == sent_id


def test_middleware_rejects_invalid_request_id():
    response = client.get("/api/v1/health", headers={"X-Request-ID": "<script>alert(1)</script>"})
    returned_id = response.headers.get("x-request-id")
    assert returned_id is not None
    uuid.UUID(returned_id)
