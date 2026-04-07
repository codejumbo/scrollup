output "dns_record" {
  description = "Apex DNS record created"
  value       = "scrollup.io A ${var.server_ip} (DNS-only)"
}
