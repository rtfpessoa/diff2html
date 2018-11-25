# Inspired by https://gist.github.com/danihodovic/a51eb0d9d4b29649c2d094f4251827dd

provider "aws" {
  profile = "${var.aws_profile}"
  region  = "${var.aws_region}"
}

provider "aws" {
  alias   = "nvirginia"
  profile = "${var.aws_profile}"
  region  = "us-east-1"
}

terraform {
  backend "s3" {
    region         = "us-east-1"
    encrypt        = true
    bucket         = "terraform-state-bucket.rtfpessoa.xyz"
    dynamodb_table = "terraform-state-table"
    key            = "diff2html.xyz"
  }
}

resource "aws_acm_certificate" "cert" {
  provider                  = "aws.nvirginia"
  domain_name               = "${var.domain}"
  subject_alternative_names = ["*.${var.domain}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "root_domain" {
  zone_id = "${var.hosted_zone_id}"
  name    = "${var.domain}"
  type    = "A"

  alias {
    name                   = "${aws_cloudfront_distribution.cdn.domain_name}"
    zone_id                = "${aws_cloudfront_distribution.cdn.hosted_zone_id}"
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_domain" {
  zone_id = "${var.hosted_zone_id}"
  name    = "${local.www_domain}"
  type    = "A"

  alias {
    name                   = "${aws_cloudfront_distribution.www_cdn.domain_name}"
    zone_id                = "${aws_cloudfront_distribution.www_cdn.hosted_zone_id}"
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "cert_validation" {
  zone_id = "${var.hosted_zone_id}"
  name    = "${aws_acm_certificate.cert.domain_validation_options.0.resource_record_name}"
  type    = "${aws_acm_certificate.cert.domain_validation_options.0.resource_record_type}"

  records = ["${aws_acm_certificate.cert.domain_validation_options.0.resource_record_value}"]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "cert" {
  provider                = "aws.nvirginia"
  certificate_arn         = "${aws_acm_certificate.cert.arn}"
  validation_record_fqdns = ["${aws_route53_record.cert_validation.fqdn}"]
}

resource "aws_cloudfront_origin_access_identity" "origin_access_identity" {
  comment = "${var.domain} origin access identity"
}

locals {
  s3_origin_id     = "S3-${var.domain}"
  s3_www_origin_id = "S3-www-${var.domain}"
  www_domain       = "www.${var.domain}"
}

resource "aws_s3_bucket" "site" {
  bucket = "${var.domain}"
  acl    = "private"

  policy = <<EOF
{
    "Version": "2008-10-17",
    "Statement": [{
      "Sid": "AllowCloudFrontRead",
      "Effect": "Allow",
      "Principal": { "AWS": "${aws_cloudfront_origin_access_identity.origin_access_identity.iam_arn}" },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${var.domain}/*"
    }]
}
EOF
}

resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = "${aws_s3_bucket.site.bucket_regional_domain_name}"
    origin_id   = "${local.s3_origin_id}"

    s3_origin_config {
      origin_access_identity = "${aws_cloudfront_origin_access_identity.origin_access_identity.cloudfront_access_identity_path}"
    }
  }

  # If using route53 aliases for DNS we need to declare it here too, otherwise we'll get 403s.
  aliases = ["${var.domain}"]

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "${local.s3_origin_id}"

    forwarded_values {
      query_string = true

      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  price_class = "PriceClass_All"

  restrictions {
    geo_restriction {
      restriction_type = "none"
      locations        = []
    }
  }

  viewer_certificate {
    acm_certificate_arn      = "${aws_acm_certificate_validation.cert.certificate_arn}"
    minimum_protocol_version = "TLSv1.1_2016"
    ssl_support_method       = "sni-only"
  }
}

resource "aws_s3_bucket" "www_site" {
  bucket = "${local.www_domain}"
  acl    = "public-read"

  website {
    redirect_all_requests_to = "https://${var.domain}"
  }
}

resource "aws_cloudfront_distribution" "www_cdn" {
  origin {
    origin_id   = "${local.s3_www_origin_id}"
    domain_name = "${aws_s3_bucket.www_site.website_endpoint}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.1", "TLSv1.2"]
    }
  }

  # If using route53 aliases for DNS we need to declare it here too, otherwise we'll get 403s.
  aliases = ["${local.www_domain}"]

  enabled         = true
  is_ipv6_enabled = true

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "${local.s3_www_origin_id}"

    forwarded_values {
      query_string = true

      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  price_class = "PriceClass_All"

  restrictions {
    geo_restriction {
      restriction_type = "none"
      locations        = []
    }
  }

  viewer_certificate {
    acm_certificate_arn      = "${aws_acm_certificate_validation.cert.certificate_arn}"
    minimum_protocol_version = "TLSv1.1_2016"
    ssl_support_method       = "sni-only"
  }
}
