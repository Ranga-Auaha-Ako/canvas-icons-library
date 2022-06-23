variable "app_name" {
  description = "Name of the app"
  type        = string
  default     = "crowd-captions"
}

variable "aws_region" {
  description = "What AWS region to build to?"
  type        = string
  default     = "ap-southeast-2"
}

locals {
  environment = terraform.workspace == "default" ? "staging" : terraform.workspace
}
