terraform {
  cloud {
    organization = "Lamanx"
    workspaces {
      name = "dev-playground"
    }
  }
}

locals {
  network_name = "d-flowguard-network"
}

provider "google" {
  project     = var.project_id
  region      = var.region
  zone = var.zone
}

resource "google_service_account" "VMInstance" {
  account_id   = var.service_account_id
  display_name = "Custom SA for VM Instance"
}

resource "google_project_iam_member" "secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.VMInstance.email}"
}

resource "google_project_iam_member" "log_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.VMInstance.email}"
}

module "tags" {
  source = "../modules/tags"
  organization_id = var.organization_id
  project_id = var.project_id
  network_name = local.network_name
  zone = var.zone
  backend_count = var.backend_count
}

module "network" {
  source = "../modules/network"
  lb_tag_namespaced_name = module.tags.load_balancer_tag_id
  backend_tag_namespaced_name = module.tags.backend_tag_id
  ssh_allowed_ip_ranges = [ "42.117.45.137" ]
  region = var.region
  organization_id = var.organization_id
  project_id = var.project_id
  network_name = local.network_name
}

module "compute" {
  source = "../modules/compute"
  ssh_public_key = var.ssh_public_key
  region = var.region
  project_id = var.project_id
  network_self_link = module.network.network_self_link
  public_subnet_id = module.network.public_subnet_id
  static_ip_address = module.network.static_ip_address
  lb_tag_id = module.tags.load_balancer_tag_id
  backend_tag_id = module.tags.backend_tag_id
  backend_count = var.backend_count
  service_account_id = var.service_account_id
  service_account_email = google_service_account.VMInstance.email
}