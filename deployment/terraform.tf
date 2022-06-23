data "aws_s3_bucket" "tf_state" {
  bucket = "uoa-raa-terraform-state"
}

# resource "aws_s3_bucket_acl" "state" {
#   bucket = data.aws_s3_bucket.tf_state.id
#   acl    = "private"
# }

terraform {
  backend "s3" {
    bucket = "uoa-raa-terraform-state"
    key    = "canvas-icons-library"
    region = "ap-southeast-2"
  }
}

data "aws_caller_identity" "current" {}

output "account_id" {
  value = data.aws_caller_identity.current.account_id
}
