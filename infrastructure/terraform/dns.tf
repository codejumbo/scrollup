# DNS-only (proxied = false) — kamal-proxy handles SSL via Let's Encrypt
# Same pattern as prepcurve/infrastructure/terraform/dns.tf

resource "cloudflare_record" "apex" {
  zone_id = var.cloudflare_zone_id
  name    = "@"
  content = var.server_ip
  type    = "A"
  proxied = false
  ttl     = 300

  comment = "Managed by Terraform — scrollup.io apex, DNS-only"
}
