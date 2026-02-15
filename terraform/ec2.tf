user_data = <<-EOF
#!/bin/bash

apt update -y
apt install docker.io -y

systemctl start docker
systemctl enable docker

echo "${var.github_token}" | docker login ghcr.io -u ${var.github_username} --password-stdin

docker pull ghcr.io/${var.github_username}/${var.repo}:${var.image_tag}

docker run -d -p 3000:3000 ghcr.io/${var.github_username}/${var.repo}:${var.image_tag}

EOF