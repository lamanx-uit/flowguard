resource "google_tags_tag_key" "vm-role" {
  parent       = "projects/${var.project_id}"
  short_name   = "vm-role"
  description   = "Tag key for categorizing VM instances by their role in the FlowGuard infrastructure."
  purpose      = "GCE_FIREWALL"
  purpose_data = {
    network = "${var.project_id}/${var.network_name}"
  }
}

resource "google_tags_tag_value" "LoadBalancer" {
  parent     = google_tags_tag_key.vm-role.id
  short_name = "LoadBalancer"
}

resource "google_tags_tag_value" "Backend" {
  parent     = google_tags_tag_key.vm-role.id
  short_name = "Backend"
}