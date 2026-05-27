resource "google_iam_workload_identity_pool" "hcp_tf" {
  project                   = local.gcp_project
  workload_identity_pool_id = "d-flowguard-tf-pool"
  display_name              = "HCP Terraform Pool"
}

resource "google_iam_workload_identity_pool_provider" "hcp_tf" {
  project                            = local.gcp_project
  workload_identity_pool_id          = google_iam_workload_identity_pool.hcp_tf.workload_identity_pool_id
  workload_identity_pool_provider_id = "d-flowguard-tf-provider"
  attribute_condition                = "assertion.terraform_organization_name==\"${local.tfc_org}\""
  attribute_mapping = {
    "google.subject"                     = "assertion.sub"
    "attribute.terraform_workspace_id"   = "assertion.terraform_workspace_id"
    "attribute.terraform_full_workspace" = "assertion.terraform_full_workspace"
  }
  oidc {
    issuer_uri = "https://app.terraform.io"
  }
}

resource "google_service_account" "terraform" {
  account_id   = "d-flowguard-terraform"
  display_name = "HCP Terraform Runner"
  project      = local.gcp_project
}

resource "google_service_account_iam_member" "wif_binding" {
  service_account_id = google_service_account.terraform.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.hcp_tf.name}/attribute.terraform_workspace_id/${local.workspace_id}"
}
