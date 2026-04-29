from fastapi.testclient import TestClient
from app.main import app
from openai import OpenAIError

client = TestClient(app)

# Test the health check endpoint
def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "Flowguard", 
                               "version": "0.1.0", "python_support": True}
    
def test_analyse_endpoint_with_mock(mocker):
    
    fake_result = {
        "bug_count": 1,
        "true_bug_count": 1,
        "reports": [
            {
                "data_flow_path": [
                    {"line": 1, "variable": "x"}
                ],
                "sanitizer_results": {
                    "type_sanitize": False,
                    "functionality_sanitize": {
                        "source_reasoning": "The code directly divides by zero without any checks."
                    },
                    "order_sanitize": False,
                    "reachability_sanitize": {
                        "reasoning": "The division by zero is reachable and will always execute."
                    }
                },
                "is_true_bug": True
            }
        ]
    }
    
    mocker.patch("app.api.v1.routes.analysis.stream_llmsan", return_value=fake_result)
    
    response = client.post("/api/v1/analyze", 
    json={
        "code": "int x = 10 / 0;",
        "language": "java",
        "model": "gpt-4o-mini",
        "bug_type": "dbz"
    })
    
    assert response.status_code == 200
    
def test_analyse_endpoint_with_invalid_input():
    response = client.post("/api/v1/analyze", 
    json={
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
        "changes": [
            {
                "line": 1,
                "description": "Replaced division by zero with division by (y + 1) to prevent runtime error."
            }
        ]
    }
    
    mocker.patch("app.api.v1.routes.fix.fix_code_pipeline", return_value=fake_result)
    
    response = client.post("/api/v1/fix", 
    json={
        "code": "int x = 10 / 0;",
        "model": "gpt-4o-mini",
        "bug": [
            {
                "data_flow_path": [
                    {"line": 1, "variable": "x"}
                ],
                "sanitizer_results": {
                    "type_sanitize": False,
                    "functionality_sanitize": {
                        "source_reasoning": "The code directly divides by zero without any checks."
                    },
                    "order_sanitize": False,
                    "reachability_sanitize": {
                        "reasoning": "The division by zero is reachable and will always execute."
                    }
                },
                "is_true_bug": True
            }
        ],
        "language": "Java"
    })
    
    assert response.status_code == 200
    assert response.json() == fake_result
    
def test_fix_endpoint_with_invalid_input(): 
    response = client.post("/api/v1/fix", 
    json={
        "code": "int x = 10 / 0;",
        "model": "gpt-4o-mini"
    })
    
    assert response.status_code == 422
    assert response.json() == {"detail": "Invalid request data"}
    
def test_analyse_endpoint_with_openai_error(mocker):
    mocker.patch("app.api.v1.routes.analysis.stream_llmsan",
                 side_effect=OpenAIError("OpenAI API error"))

    response = client.post("/api/v1/analyze",
    json={
        "code": "int x = 10 / 0;",
        "language": "java",
        "model": "gpt-4o-mini",
        "bug_type": "dbz"
    })

    assert response.status_code == 502


def test_fix_endpoint_with_openai_error(mocker):
    mocker.patch("app.api.v1.routes.fix.fix_code_pipeline",
                 side_effect=OpenAIError("OpenAI API error"))

    response = client.post("/api/v1/fix",
    json={
        "code": "int x = 10 / 0;",
        "model": "gpt-4o-mini",
        "bug": [
            {
                "data_flow_path": [{"line": 1, "variable": "x"}],
                "sanitizer_results": {
                    "type_sanitize": False,
                    "functionality_sanitize": {"source_reasoning": "divides by zero"},
                    "order_sanitize": False,
                    "reachability_sanitize": {"reasoning": "always reachable"}
                },
                "is_true_bug": True
            }
        ],
        "language": "Java"
    })

    assert response.status_code == 502


def test_middleware_generates_request_id_when_absent():
    response = client.get("/api/v1/health")
    assert "x-request-id" in response.headers
    import uuid
    uuid.UUID(response.headers["x-request-id"])  # raises if not a valid UUID


def test_middleware_preserves_valid_request_id():
    import uuid
    sent_id = str(uuid.uuid4())
    response = client.get("/api/v1/health", headers={"X-Request-ID": sent_id})
    assert response.headers.get("x-request-id") == sent_id


def test_middleware_rejects_invalid_request_id():
    import uuid
    response = client.get("/api/v1/health", headers={"X-Request-ID": "<script>alert(1)</script>"})
    returned_id = response.headers.get("x-request-id")
    assert returned_id is not None
    uuid.UUID(returned_id) 


def test_generic_exception_returns_500(mocker):
    mocker.patch("app.api.v1.routes.analysis.stream_llmsan",
                 side_effect=RuntimeError("unexpected boom"))

    tolerant_client = TestClient(app, raise_server_exceptions=False)
    response = tolerant_client.post("/api/v1/analyze",
    json={
        "code": "int x = 10 / 0;",
        "language": "java",
        "model": "gpt-4o-mini",
        "bug_type": "dbz"
    })

    assert response.status_code == 500
    assert "detail" in response.json()
