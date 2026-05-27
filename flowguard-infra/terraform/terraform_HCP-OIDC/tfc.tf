resource "tfe_variable" "provider_auth" {
  key          = "TFC_GCP_PROVIDER_AUTH"
  value        = "true"
  category     = "env"
  workspace_id = local.workspace_id
}

resource "tfe_variable" "sa_email" {
  key          = "TFC_GCP_RUN_SERVICE_ACCOUNT_EMAIL"
  value        = google_service_account.terraform.email
  category     = "env"
  sensitive    = true
  workspace_id = local.workspace_id
}

resource "tfe_variable" "provider_name" {
  key          = "TFC_GCP_WORKLOAD_PROVIDER_NAME"
  value        = google_iam_workload_identity_pool_provider.hcp_tf.name
  category     = "env"
  sensitive    = true
  workspace_id = local.workspace_id
}
