# Glassline visual system

## Direction and rationale

**Luminous glass data landscape.** Glassline is a quiet, midnight data observatory: files become a field of crisp cells suspended over a deep navy work surface, while one acid-mint “scan line” marks the active operation. Translucent layers make local processing legible—the file stays beneath the glass rather than disappearing into a cloud. It feels capable enough for a 5-million-row ledger without borrowing the heavy chrome of a database IDE.

This is an intentionally single-mode dark product. Large data grids benefit from consistent luminance, and the near-black background lets status, selection, and numeric structure carry hierarchy without decorative card clutter.

## Palette

| Token | Value | Role |
| --- | --- | --- |
| Night | `#07110f` | page and grid ground |
| Deep glass | `#0d1d1a` | primary surface |
| Raised glass | `#142824` | controls and panels |
| Hairline | `#315047` | boundaries and inactive UI |
| Paper | `#f3f8f5` | primary text |
| Mist | `#b4c7c0` | secondary text (7.6:1 on Night) |
| Scan mint | `#66f2bd` | action, focus, selection |
| Ink | `#032119` | text on Scan mint |
| Signal blue | `#7fb7ff` | SQL/power state |
| Amber | `#ffc66b` | warning and parsing state |
| Coral | `#ff8d84` | destructive/error state |

Fine glass highlights use white at 6–12% alpha only on surfaces, never for body text. Data types are distinguished by a label plus color, never color alone.

## Typography

- Interface and editorial: the native system UI sans stack, deliberately avoiding a font download on a utility whose first job is to open a local file quickly. 16px minimum body, 1.5 line-height.
- Data and code: `Berkeley Mono`-like system stack (`ui-monospace, SFMono-Regular, Consolas, monospace`) to avoid a second font payload. Table numbers use tabular figures.
- Scale: 12 / 14 / 16 / 20 / 32 / clamp(42–68) px. The 12 and 14 sizes are reserved for supplementary grid metadata with high contrast.

## Spacing and shape

The base unit is 4px. Primary rhythm: 8, 12, 16, 24, 32, 48, 72px. Controls are at least 44px high; tool clusters use 8px gaps. Glass panes use 16px radii on the landing surface, 10px in the dense workspace, and 999px only for status capsules. The grid uses square cells and 1px rules to prioritize scanability.

## Interaction grammar

- **Scan:** the active drop zone, selected column, and focused control gain a mint inset line.
- **Resolve:** file analysis progresses through named stages (read → inspect → ready) rather than an indeterminate mystery spinner.
- **Layer:** filters slide into the query strip from their source control; dialogs emerge from their trigger and return focus when closed.
- **Reassure:** “On this device” remains visible whenever data is loaded. Export reports row scope before download.
- Keyboard: `/` focuses filters, `g` focuses the grid, `e` opens export, `?` opens shortcuts; Escape closes dialogs.

## Motion policy

Controls transition opacity, border color, and transform for 160–220ms. Landing glass layers drift into place once (420ms); progress travels left-to-right only while work is active. Nothing loops for decoration. Under `prefers-reduced-motion: reduce`, transforms and smooth scrolling are removed, progress becomes a static fill, and state changes use an immediate opacity swap.

## Asset plan and provenance

The hero asset is an original abstract “data strata” landscape: translucent ledger planes, fine rows flowing from a file-shaped monolith into an ordered grid horizon, no literal UI and no text. It clarifies that a large, unruly file becomes a navigable local landscape.

Prompt sheet:

- Subject: a monumental translucent data slab unfolding into millions of tiny ordered rows across a dark horizon.
- World/materials: smoked glass, etched grid lines, frosted edges, subtle particulate depth, no people.
- Light/lens: luminous mint scan light, restrained cyan highlights, oblique macro/isometric lens, generous negative space.
- Palette words: midnight ink, deep teal glass, scan mint, faint ice blue, small warm amber point.
- Negative list: text, letters, numbers, logos, watermark, dashboards, laptop mockups, generic gradient blobs, people, brands, excessive neon, purple.

Production prompt: “Use case: stylized-concept. Asset type: wide landing-page hero illustration. A monumental translucent data slab at left unfolds into millions of tiny ordered ledger rows sweeping across a dark horizon, an abstract landscape of locally processed data; smoked glass planes, etched hairline grid, frosted edges and subtle particulate depth; oblique macro/isometric composition with open dark negative space; luminous mint scan light with restrained ice-blue highlights and one tiny amber locator; premium editorial 3D render, highly legible silhouette. Midnight ink, deep teal glass, scan mint. No text, letters, numbers, logos, watermark, dashboards, laptop mockups, people, brands, purple, or generic gradient blobs.”

- Generator: Azure AI Foundry `factory-image` via `/opt/fleet/lib/gen-image.sh`.
- Date: 2026-08-27.
- License/provenance: original generated artwork commissioned for this product; retained source PNG and prompt sidecar under `assets/src/`.
- Product icons are original inline SVG paths authored in the codebase. No third-party image, icon, font, or script is loaded at runtime.
- The 1200×630 social preview and 180×180 touch icon are crops of the original generated data-landscape artwork. They add no third-party source material.
