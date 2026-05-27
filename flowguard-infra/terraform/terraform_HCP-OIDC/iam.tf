resource "google_project_iam_member" "terraform_roles" {
  for_each = toset(local.terraform_sa_roles)
  project  = local.gcp_project
  role     = each.value
  member   = "serviceAccount:${google_service_account.terraform.email}"
}

resource "google_project_iam_member" "terraform_iam_admin" {
  project = local.gcp_project
  role    = "roles/resourcemanager.projectIamAdmin"
  member  = "serviceAccount:${google_service_account.terraform.email}"

  condition {
    title      = "restrict_grantable_roles"
    expression = "api.getAttribute('iam.googleapis.com/modifiedGrantsByRole', []).hasOnly(['roles/secretmanager.secretAccessor', 'roles/logging.logWriter'])"
  }
}
