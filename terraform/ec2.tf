resource "aws_instance" "app" {

  ami           = "ami-0f58b397bc5c1f2e8"
  instance_type = var.instance_type

  key_name = var.key_name

  security_groups = [
    aws_security_group.app_sg.name
  ]

  user_data = <<-EOF
#!/bin/bash

apt update -y
apt install docker.io -y

systemctl start docker

docker login ghcr.io -u ${var.github_username} -p ${var.github_token}

docker pull ghcr.io/${var.github_username}/${var.repo}:${var.image_tag}

docker run -d -p 3000:3000 ghcr.io/${var.github_username}/${var.repo}:${var.image_tag}

EOF

}