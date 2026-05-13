resource "google_compute_network" "d-flowguard-network" {
  name = "d-flowguard-network"
}

resource "google_compute_subnetwork" "d-flowguard-public-subnet" {
  name   = "d-flowguard-public-subnet"
  region = var.region
  network = google_compute_network.d-flowguard-network.id
  ip_cidr_range = var.subnet_cidr
}

resource "google_compute_address" "d-flowguard-lb-ipv4-address" {
  name         = "d-flowguard-lb-ipv4-address"
  address_type = "EXTERNAL"
  region       = var.region
}