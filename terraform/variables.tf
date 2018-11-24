variable "aws_region" {
  description = "The aws region to deploy"
  default = "eu-west-1"
}

variable "aws_profile" {
  description = "The aws profile to use"
  default = "personal"
}

variable "domain" {
  description = "The domain to deploy this page"
  default = "diff2html.xyz"
}

variable "hosted_zone_id" {
  description = "The hosted zone id where the domain will be created"
  default = "Z2T76N7UKY0XQI"
}
