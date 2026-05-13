variable "service_account_id" {
  description = "The ID of the service account to create for the VM instance."
  type        = string
}

variable "project_id" {
  description = "The ID of the project in which to create the VM instance."
  type        = string
}

variable "network_self_link" {
  description = "The self-link of the VPC network to which the VM instance will be connected."
  type        = string
}

variable "region" {
  description = "The region in which to create the VM instance."
  type        = string
}

variable "public_subnet_id" {
  description = "The ID of the public subnet to which the VM instance will be connected."
  type        = string
}

variable "static_ip_address" {
  description = "The IP address to assign to the VM instance."
  type        = string
}

variable "lb_tag_value_id" {
  description = "The ID of the tag value to assign to the VM instance."
  type        = string
}

variable "backend_tag_value_id" {
  description = "The ID of the tag value to assign to the VM instance."
  type        = string
}

variable "backend_count" {
  description = "The number of backend instances to create."
  type        = number
  default = 1
}

variable "ssh_public_key" {
  description = "The public SSH key to assign to the VM instance."
  type        = string
}

variable "zone" {
  description = "The zone to deploy the FlowGuard infrastructure."
  type        = string
  default     = "us-central1-a"
}