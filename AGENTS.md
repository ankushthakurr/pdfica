# Implementation rules
- Independent file conversions use the shared ToolWorkspace sequential queue; combine workflows process all inputs together to preserve document semantics.
- Prepare archives before enabling download controls so the visitor's click retains browser download permission.
- Keep PDF image conversion in one reusable workspace so JPG and multi-format routes share validation, processing, and export behavior.