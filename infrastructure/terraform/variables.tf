variable "cloudflare_api_token" {
  description = "Cloudflare API token with DNS:Edit permission for scrollup.io zone"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID for scrollup.io (different zone from prepcurve.com)"
  type        = string
}

variable "server_ip" {
  description = "Hetzner server IPv4 address — get from prepcurve terraform output server_ip"
  type        = string
  default     = "5.161.88.56"
}
