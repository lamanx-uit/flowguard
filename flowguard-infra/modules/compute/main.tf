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

resource "google_compute_instance" "d-flowguard-lb-instance" {
  name         = "d-flowguard-lb-instance"
  machine_type = "e2-small"

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
    }
  }

  network_interface {
    network = var.network_self_link
    subnetwork = var.public_subnet_id

    access_config {
      nat_ip = var.static_ip_address
    }
  }

  service_account {
    email  = google_service_account.VMInstance.email
    scopes = ["cloud-platform"]
  }

  metadata = {
    "ssh-keys" = "lamanx:${var.ssh_public_key}"
  }
}

resource "google_compute_instance" "d-flowguard-backend-instance" {
  name         = "d-flowguard-backend-instance-${count.index}"
  machine_type = "e2-small"
  count = var.backend_count

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
    }
  }

  network_interface {
    network = var.network_self_link
    subnetwork = var.public_subnet_id
  }

  service_account {
    email  = google_service_account.VMInstance.email
    scopes = ["cloud-platform"]
  }

  metadata = {
    "ssh-keys" = "lamanx:${var.ssh_public_key}"
  }
}

resource "google_tags_tag_binding" "lb_tag_binding" {
  parent = "//compute.googleapis.com/projects/${var.project_id}/zones/${var.zone}/instances/${google_compute_instance.d-flowguard-lb-instance.name}"  
  tag_value = var.lb_tag_value_id
}

resource "google_tags_tag_binding" "backend_tag_binding" {
  count = var.backend_count
  parent = "//compute.googleapis.com/projects/${var.project_id}/zones/${var.zone}/instances/${google_compute_instance.d-flowguard-backend-instance[count.index].name}"  
  tag_value = var.backend_tag_value_id
}