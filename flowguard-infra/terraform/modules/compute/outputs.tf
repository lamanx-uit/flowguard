output "d-lb-external-ip" {
  value = google_compute_instance.d-flowguard-lb-instance.network_interface.0.access_config.0.nat_ip
  description = "External IP address of the FlowGuard load balancer instance."
}

output "d-lb-name" {
  value = google_compute_instance.d-flowguard-lb-instance.name
  description = "Name of the FlowGuard load balancer instance."
}

output "d-backend-internal-ip" {
  value = [for instance in google_compute_instance.d-flowguard-backend-instance : instance.network_interface.0.network_ip]
  description = "Internal IP addresses of the FlowGuard backend instances."
}

output "d-backend-names" {
  value = [for instance in google_compute_instance.d-flowguard-backend-instance : instance.name]
  description = "Names of the FlowGuard backend instances."
}

  