resource "google_compute_network_firewall_policy" "d-flowguard-network-firewall-policy" {
  name        = "d-flowguard-network-firewall-policy"
  project     = var.project_id
}

resource "google_compute_network_firewall_policy_association" "d-flowguard-network-firewall-association" {
  name = "d-flowguard-network-firewall-association"
  firewall_policy = google_compute_network_firewall_policy.d-flowguard-network-firewall-policy.id
  attachment_target = google_compute_network.d-flowguard-network.id
  project = var.project_id
}

resource "google_compute_network_firewall_policy_rule" "allow_http_https" {
  action                  = "allow"
  description             = "Allow HTTPS and HTTP traffic from anywhere"
  direction               = "INGRESS"
  disabled                = false
  enable_logging          = true
  firewall_policy         = google_compute_network_firewall_policy.d-flowguard-network-firewall-policy.id
  priority                = 1000
  rule_name               = "allow-http-https"

  match {
    src_ip_ranges = ["0.0.0.0/0"]
    layer4_configs {
      ip_protocol = "tcp"
      ports       = ["80", "443"]
    }
  }
}

resource "google_compute_network_firewall_policy_rule" "allow_ssh" {
  action                  = "allow"
  description             = "Allow SSH traffic from a specific IP address"
  direction               = "INGRESS"
  disabled                = false
  enable_logging          = true
  firewall_policy         = google_compute_network_firewall_policy.d-flowguard-network-firewall-policy.id
  priority                = 2000
  rule_name               = "allow-ssh"

  match {
    src_ip_ranges = var.ssh_allowed_ip_ranges    

    layer4_configs {
      ip_protocol = "tcp"
      ports       = ["22"]
    }
  }
}

resource "google_compute_network_firewall_policy_rule" "deny_all" {
  action                  = "deny"
  description             = "Deny all other traffic"
  direction               = "INGRESS"
  disabled                = false
  enable_logging          = true
  firewall_policy         = google_compute_network_firewall_policy.d-flowguard-network-firewall-policy.id
  priority                = 9000
  rule_name               = "deny-all"

  match {
    src_ip_ranges = ["0.0.0.0/0"]

    layer4_configs {
      ip_protocol = "all"
    }
  }
}

resource "google_compute_network_firewall_policy_rule" "allowed_backend_traffic" {
  action                  = "allow"
  description             = "Allow traffic to the backend service"
  direction               = "INGRESS"
  disabled                = false
  enable_logging          = true
  firewall_policy         = google_compute_network_firewall_policy.d-flowguard-network-firewall-policy.id
  priority                = 1500
  rule_name               = "allow-lb-traffic"
  target_secure_tags { name = var.backend_tag_namespaced_name }

  match {
    src_secure_tags { name = var.lb_tag_namespaced_name }
    layer4_configs {
      ip_protocol = "tcp"
      ports       = ["8000"] 
    }
  }
}