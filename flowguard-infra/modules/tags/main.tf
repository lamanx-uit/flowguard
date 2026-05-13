resource "google_tags_tag_key" "vm-role" {
  parent      = "organizations/${var.organization_id}" # Replace with your organization ID
  short_name  = "vm-role"
}

resource "google_tags_tag_value" "LoadBalancer" {
  parent      = google_tags_tag_key.vm-role.id
  short_name  = "LoadBalancer"
}

# resource "google_tags_tag_binding" "LoadBalancer_vm_tag" {
#   parent    = "//compute.googleapis.com/projects/${var.project_id}/zones/"${the LB VM Zone}"/instances/"${the LB VM Name}""
#   tag_value = google_tags_tag_value.LoadBalancer.id
# }

resource "google_tags_tag_value" "Backend" {
  parent      = google_tags_tag_key.vm-role.id
  short_name  = "Backend"
}

# resource "google_tags_tag_binding" "Backend_vm_tag" {
#   parent    = "//compute.googleapis.com/projects/${var.project_id}/zones/"${the Backend VM Zone}"/instances/"${the Backend VM Name}""
#   tag_value = google_tags_tag_value.Backend.id
# }