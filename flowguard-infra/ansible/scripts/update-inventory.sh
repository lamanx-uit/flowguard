#!/usr/bin/env bash
# Pulls backend internal IPs from Terraform and rewrites the [backend] block in hosts.ini.
# Run this after every `terraform apply` that changes backend_count.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INVENTORY="$SCRIPT_DIR/../inventory/hosts.ini"
TF_DIR="$SCRIPT_DIR/../../terraform/development"

echo "Fetching backend IPs from Terraform..."
BACKEND_IPS=$(terraform -chdir="$TF_DIR" output -json backend_internal_ips | jq -r '.[]')

if [[ -z "$BACKEND_IPS" ]]; then
  echo "No backend IPs found — is terraform applied?"
  exit 1
fi

# Rewrite [backend] block — keep everything above it, replace the section
ABOVE=$(awk '/^\[backend\]/{exit} {print}' "$INVENTORY")
BELOW=$(awk '/^\[flowguard:children\]/,0' "$INVENTORY")

{
  echo "$ABOVE"
  echo "[backend]"
  while IFS= read -r ip; do
    echo "$ip ansible_user=ansible"
  done <<< "$BACKEND_IPS"
  echo ""
  echo "$BELOW"
} > "$INVENTORY"

echo "Inventory updated:"
cat "$INVENTORY"
