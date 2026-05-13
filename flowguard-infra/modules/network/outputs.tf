output "public_subnet_id" {
  description = "ID of the public subnet created for FlowGuard."
  value = google_compute_subnetwork.d-flowguard-public-subnet.id
}

output "firewall_policy_id" {
  description = "ID of the firewall policy created for FlowGuard."
  value = google_compute_network_firewall_policy.d-flowguard-backend-firewall-policy.id
}

output "static_ip_address" {
  description = "IP address reserved for the FlowGuard load balancer."
  value = google_compute_address.d-flowguard-lb-ipv4-address.address
}

output "network_self_link" {
  description = "Self-link of the VPC network created for FlowGuard."
  value = google_compute_network.d-flowguard-network.self_link
}
