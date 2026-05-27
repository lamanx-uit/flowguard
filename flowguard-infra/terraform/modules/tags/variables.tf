variable "organization_id" {
  description = "The Google Cloud organization ID."
  type        = string
}

variable "project_id" {
  description = "The Google Cloud project ID to deploy the FlowGuard infrastructure."
  type        = string  
}

variable "network_name" {
  description = "The name of the VPC network to which the tags will be applied."
  type        = string
}

variable "zone" {
  description = "The zone to deploy the FlowGuard infrastructure."
  type        = string
  default     = "us-central1-a"
}

variable "backend_count" {
  description = "The number of backend instances to create."
  type        = number
  default     = 2
}