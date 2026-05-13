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
  description = "The Google Cloud project ID to deploy the FlowGuard infrastructure."
  type        = string
  default     = "ie105-496118"
  
}