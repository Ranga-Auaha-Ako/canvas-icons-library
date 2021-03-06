resource "random_id" "server" {
  keepers = {
    # Generate a new id each time we switch to a new AMI id
    s3_bucket = data.aws_caller_identity.current.account_id
  }

  byte_length = 3
}

resource "aws_s3_bucket" "static" {
  bucket = "canvas-icons-library-static-${local.environment}-${random_id.server.hex}"
  tags = {
    Name        = "Canvas Icons Static Library"
    Environment = local.environment
  }
}

resource "aws_s3_bucket_policy" "prod_website" {
  bucket = aws_s3_bucket.static.id
  policy = jsonencode({
    Statement = [
      {
        Action = [
          "s3:GetObject",
        ]
        Effect    = "Allow"
        Principal = "*"
        Resource = [
          "arn:aws:s3:::${aws_s3_bucket.static.id}/*",
        ]
        Sid = "PublicReadGetObject"
      },
    ]
    Version = "2012-10-17"
  })
}


resource "aws_s3_bucket_acl" "state" {
  bucket = aws_s3_bucket.static.id
  acl    = "private"
}

output "s3_url" {
  value = "s3://${aws_s3_bucket.static.bucket}"
}

resource "aws_s3_bucket_cors_configuration" "allow_all" {
  bucket = aws_s3_bucket.static.bucket

  cors_rule {
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
  }
}
