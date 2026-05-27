output "lb_external_ip" {
    value = module.compute.d-lb-external-ip
}

output "backend_internal_ips" {
    value = module.compute.d-backend-internal-ip
}

output "backend_names" {
    value = module.compute.d-backend-names
}
