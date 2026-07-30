# udos-home — Home Automation Plugin

HomeNest module for home automation capabilities (udos-\* prefix convention).

## What is a udos- plugin?

udos-\* modules are optional domain plugins that plug into the HomeNest repo's
module structure and, where applicable, expose an extension manifest for the
uCore host runtime.

This module is the starter template udos- plugin for HomeNest's home-ops lane.
It demonstrates the convention that future plugins (udos-budget, udos-identity,
udos-media, udos-automation) will follow.

## Extending uCore

```
uCore (host)                   HomeNest (module repo)
┌──────────────────────┐       ┌──────────────────────────────┐
│ ExtensionRegistry    │◄──────│ modules/home-ops/udos-home/  │
│ registry.discover()  │       │ ucore-extension.json         │
│ registry.register()  │       │                              │
│ api_prefix: /api/home│       │ routes.py                    │
└──────────────────────┘       └──────────────────────────────┘
```

## Extension Manifest

```json
{
  "id": "udos-home",
  "name": "Home Automation",
  "kind": "plugin",
  "version": "0.1.0",
  "description": "Home automation domain plugin (udos-*)",
  "optional": true,
  "api_prefix": "/api/home",
  "route_registrar": "udos_home.routes.register_routes",
  "dependencies": ["ucore-core"]
}
```

## Creating your own udos- plugin

1. Copy this module as a template
2. Update `ucore-extension.json` with your plugin id/name
3. Implement `setup(app)` or `register_routes(app)`
4. uCore discovers it automatically when installed

## License

Apache 2.0
