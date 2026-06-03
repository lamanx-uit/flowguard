variable "github_repo" {
    description = "The GitHub repository to which the OIDC provider will be restricted (e.g., 'owner/repo')."
    type        = string
    default     = "lamanx-uit/flowguard"
}


variable "artifact_registry_repository_name" {
    description = "The name of the Artifact Registry repository to which GitHub Actions will be granted write access."
    type        = string
}


variable "service_account_id" {
  default = "d-flowguard-github-oidc-sa"
  description = "The ID of the service account to use for GitHub OIDC authentication."
  type = string
}

variable "location" {
  default = "us-central1"
  description = "The location of the Artifact Registry repository."
  type = string
}
