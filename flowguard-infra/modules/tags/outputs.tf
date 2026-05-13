output "load_balancer_tag_namespaced_name" {
  description = "Namespaced name of the Google Cloud Tag Value created for FlowGuard."
  value       = google_tags_tag_value.LoadBalancer.namespaced_name
}

output "backend_tag_namespaced_name" {
  description = "Namespaced name of the Google Cloud Tag Value created for the backend."
  value       = google_tags_tag_value.Backend.namespaced_name
}

output "load_balancer_tag_id" {
  description = "ID of the Google Cloud Tag Value created for FlowGuard."
  value       = google_tags_tag_value.LoadBalancer.id
}

output "backend_tag_id" {
  description = "ID of the Google Cloud Tag Value created for the backend."
  value       = google_tags_tag_value.Backend.id
}