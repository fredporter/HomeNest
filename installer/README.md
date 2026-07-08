# HomeNest Installer

Linux Mint Cinnamon deployment via `scripts/install.sh`.

## Quick Install

```bash
sudo bash scripts/install.sh
```

Opens the console at `http://localhost:8080` after install.

## What's Installed

| Component | Path |
|---|---|
| HomeNest root | `/opt/homenest/` |
| API server (systemd) | `homenest-server.service` on port 7890 |
| Console (nginx) | port 8080 |
| Media vault | `/home/homenest/media/` |
| udev rules | `/etc/udev/rules.d/99-uhome.rules` |

## Uninstall

```bash
sudo bash scripts/uninstall.sh          # services only
sudo bash scripts/uninstall.sh --purge  # full removal
```

Full documentation: `docs/INSTALLER.md`