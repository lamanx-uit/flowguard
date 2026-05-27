data "google_project" "project" {
  project_id = var.project_id
}

resource "google_compute_instance" "d-flowguard-lb-instance" {
  name         = "d-flowguard-lb-instance"
  machine_type = "e2-small"

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
    }
  }

  network_interface {
    network    = var.network_self_link
    subnetwork = var.public_subnet_id

    access_config {
      nat_ip = var.static_ip_address
    }
  }

  service_account {
    email  = var.service_account_email
    scopes = ["cloud-platform"]
  }

  metadata = {
    "ssh-keys" = "lamanx:${var.ssh_public_key}"
  }
}

resource "google_compute_instance" "d-flowguard-backend-instance" {
  name         = "d-flowguard-backend-instance-${count.index}"
  machine_type = "e2-small"
  count        = var.backend_count

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
    }
  }

  network_interface {
    network    = var.network_self_link
    subnetwork = var.public_subnet_id
  }

  service_account {
    email  = var.service_account_email
    scopes = ["cloud-platform"]
  }

  metadata = {
    "ssh-keys" = "lamanx:${var.ssh_public_key}"
  }
}

resource "google_tags_location_tag_binding" "lb_tag_binding" {
  parent    = "//compute.googleapis.com/projects/${data.google_project.project.number}/zones/${var.zone}/instances/${google_compute_instance.d-flowguard-lb-instance.instance_id}"
  tag_value = var.lb_tag_id
  location  = var.zone
}

resource "google_tags_location_tag_binding" "backend_tag_binding" {
  count     = var.backend_count
  parent    = "//compute.googleapis.com/projects/${data.google_project.project.number}/zones/${var.zone}/instances/${google_compute_instance.d-flowguard-backend-instance[count.index].instance_id}"
  tag_value = var.backend_tag_id
  location  = var.zone
}
