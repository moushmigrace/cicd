terraform {

  backend "s3" {

    bucket = "social-connect-terraform-state"
    key    = "ephemeral/terraform.tfstate"
    region = "ap-south-1"

  }

}