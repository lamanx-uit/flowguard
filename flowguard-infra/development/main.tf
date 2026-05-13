terraform {
  cloud {
    organization = "Lamanx"
    workspaces {
      name = "dev-playground"
    }
  }
}

provider "google" {
  project     = var.project_id
  region      = var.region
}

module "tags" {
  source = "../modules/tags"
  organization_id = var.organization_id
  project_id = var.project_id
}

module "network" {
  source = "../modules/network"
  lb_tag_namespaced_name = module.tags.load_balancer_tag_namespaced_name
  backend_tag_namespaced_name = module.tags.backend_tag_namespaced_name
  ssh_allowed_ip_ranges = [ "42.115.91.59" ]
  region = var.region
  organization_id = var.organization_id
  project_id = var.project_id
}