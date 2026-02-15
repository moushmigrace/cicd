resource "aws_instance" "app" {

  ami           = "ami-0f58b397bc5c1f2e8" # Ubuntu 22.04 ap-south-1
  instance_type = var.instance_type
  key_name      = var.key_name

  vpc_security_group_ids = [aws_security_group.app_sg.id]

  tags = {
    Name = "social-connect-${var.env_name}"
  }

  user_data = <<-EOF
              #!/bin/bash
              apt update -y
              apt install -y docker.io

              systemctl start docker
              systemctl enable docker

              echo "${var.github_token}" | docker login ghcr.io -u ${var.github_username} --password-stdin

              docker pull ghcr.io/${var.github_username}/${var.repo}:${var.image_tag}

              docker run -d -p 3000:3000 ghcr.io/${var.github_username}/${var.repo}:${var.image_tag}

              EOF

}