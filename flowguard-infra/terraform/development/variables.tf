variable "region" {
  description = "The region to deploy the FlowGuard infrastructure."
  type        = string
  default     = "us-central1"
}

variable "organization_id" {
  description = "The Google Cloud organization ID."
  type        = string
  default = "926650552604"
}

variable "project_id" {
  description = "The ID of the Google Cloud project to deploy the FlowGuard infrastructure."
  type        = string
  default     = "ie105-496123"
}

variable "service_account_id" {
  description = "The ID of the service account to use for the FlowGuard infrastructure."
  type        = string
  default = "d-flowguard-sa"
}

variable "ssh_public_key" {
  description = "The SSH public key to use for accessing the FlowGuard infrastructure."
  type        = string
  sensitive   = true
}

variable "backend_count" {
  description = "The number of backend instances to create."
  type        = number
  default     = 2
}

variable "zone" {
  description = "The zone to deploy the FlowGuard infrastructure."
  type        = string
  default     = "us-central1-a"
}

variable "network_name" {
  description = "The name of the VPC network to which the tags will be applied."
  type        = string
  default     = "d-flowguard-network"
}

variable "github_repo" {
  default = "lamanx-uit/flowguard"
  description = "The GitHub repository to which the OIDC provider will be restricted (e.g., 'owner/repo')."
  type = string
}

variable "ssh_allowed_ip_ranges" {
  description = "GCP IAP TCP tunneling IP ranges."
  type        = list(string)
  default = [ "35.235.240.0/20" ]
}