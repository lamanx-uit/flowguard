variable "region" {
  description = "The region to deploy the FlowGuard infrastructure."
  type        = string
  default     = "us-central1"
}

variable "project_id" {
  description = "The Google Cloud project ID to deploy the FlowGuard infrastructure."
  type        = string
  default     = "ie105-496118"
  
}

variable "ssh_allowed_ip_ranges" {
  description = "List of IP ranges allowed to connect via SSH to the FlowGuard infrastructure."
  type = list(string)
}

variable "subnet_cidr" {
  description = "CIDR range for the public subnet."
  type        = string
  default     = "10.0.0.0/16"
}

variable "organization_id" {
  description = "The Google Cloud organization ID."
  type        = string
  default = "926650552604"
}

variable "lb_tag_namespaced_name" {
  description = "The namespaced name of the LoadBalancer tag."
  type        = string
}

variable "backend_tag_namespaced_name" {
  description = "The namespaced name of the Backend tag."
  type        = string
}

variable "network_name" {
  description = "The name of the VPC network to create."
  type        = string
  default     = "d-flowguard-network"
}