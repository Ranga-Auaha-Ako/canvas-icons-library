resource "aws_iam_role" "iam_for_lambda" {
  name = "canvas_icons_${local.environment}_policy_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Sid = ""
      },
    ]
  })
}

resource "aws_iam_policy" "lambda_policy_logs" {
  name        = "canvas_icons_${local.environment}_policy"
  description = "Canvas Icons: ${local.environment} Environment, Policy for Lambda"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow",
        Action   = "logs:CreateLogGroup",
        Resource = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:*"
      },
      {
        Effect = "Allow",
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = [
          "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${aws_lambda_function.lambda_colours.function_name}:*"
        ]
      },
      {
        Effect = "Allow",
        Action = [
          "s3:GetObject"
        ],
        Resource = "${aws_s3_bucket.static.arn}/*"
      }

    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_policy_attachment" {
  role = aws_iam_role.iam_for_lambda.name
  #   for_each = toset([
  #     aws_iam_policy.lambda_policy_logs.arn
  #   ])
  #   policy_arn = each.value
  policy_arn = aws_iam_policy.lambda_policy_logs.arn
}


data "local_file" "lambda" {
  filename = "${path.module}/../dist/lambda.zip"
}

resource "aws_lambda_function" "lambda_colours" {
  # If the file is not in the current working directory you will need to include a 
  # path.module in the filename.
  filename         = data.local_file.lambda.filename
  function_name    = "canvas-icons-colour-func-${local.environment}"
  role             = aws_iam_role.iam_for_lambda.arn
  handler          = "index.handler"
  source_code_hash = data.local_file.lambda.content_base64sha256
  publish          = true

  runtime       = "nodejs18.x"
  architectures = ["arm64"]

  environment {
    variables = {
      NODE_ENV  = "production"
      S3_BUCKET = aws_s3_bucket.static.bucket
    }
  }

  depends_on = [null_resource.lambda_package_zip]
}

resource "null_resource" "lambda_package_zip" {
  triggers = {
    lambda_index = filebase64sha256("${path.module}/../lambda/index.js")
  }
  provisioner "local-exec" {
    command = "grunt compress:lambda"
  }
}

# Lambda
resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_colours.function_name
  principal     = "apigateway.amazonaws.com"

  # More: http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html
  # source_arn = "arn:aws:execute-api:${var.aws_region}:${data.aws_caller_identity.current.account_id}:${aws_api_gateway_rest_api.api.id}/*/${aws_api_gateway_method.method.http_method}${aws_api_gateway_resource.resource.path}"
  source_arn = "${aws_api_gateway_rest_api.api.execution_arn}/*/${aws_api_gateway_method.method.http_method}/"
}
