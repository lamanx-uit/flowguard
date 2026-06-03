terraform {
  # this one stays local — it's the admin bootstrap
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.0"
    }
    tfe = {
      source  = "hashicorp/tfe"
      version = "~> 0.58"
    }
  }
}

provider "google" {
  project = "ie105-496123"
}

provider "tfe" {
  # uses your TFC API token from `terraform login`
}

locals {
  gcp_project  = "ie105-496123"
  tfc_org      = "Lamanx"
  workspace_id = "ws-Bntdc43UAW5JpC9H"

  terraform_sa_roles = [
    "roles/compute.networkAdmin",
    "roles/compute.instanceAdmin.v1",
    "roles/iam.serviceAccountAdmin",
    "roles/iam.serviceAccountUser",
    "roles/resourcemanager.tagAdmin",
    "roles/resourcemanager.tagUser",
    "roles/compute.securityAdmin",
    "roles/iam.workloadIdentityPoolAdmin",
    "roles/artifactregistry.admin",
  ]
}
