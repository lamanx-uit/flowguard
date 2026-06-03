resource "google_service_account" "github_oidc" {
  account_id = var.service_account_id
  display_name = "GitHub OIDC Service Account"
}

resource "google_iam_workload_identity_pool" "github" {
  workload_identity_pool_id = "d-flowguard-github-actions-pool"
  display_name = "GitHub Actions Pool"
}

resource "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider"
  display_name = "GitHub Provider"

  attribute_mapping = {
    "google.subject" = "assertion.sub"
    "attribute.repository" = "assertion.repository"
   }

  attribute_condition = "attribute.repository == '${var.github_repo}'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account_iam_member" "github_oidc_binding" {
    service_account_id = google_service_account.github_oidc.name
    role = "roles/iam.workloadIdentityUser"
    member = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${var.github_repo}"
}

resource "google_artifact_registry_repository_iam_member" "ci_pusher" {
  repository = var.artifact_registry_repository_name
  location = var.location
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:${google_service_account.github_oidc.email}"
}
