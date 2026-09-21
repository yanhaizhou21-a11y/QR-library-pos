# Pustaka QR - Documentation Assets

This directory contains visual assets for the README and documentation.

## Required Assets

Create the following images/GIFs to enhance the documentation:

### Hero Banner
- **File**: `hero-banner.png`
- **Dimensions**: 1200×630px (Open Graph standard)
- **Content**: Composite showing:
  - Pustaka QR logo/title
  - Split view of catalog interface + QR scanner in action
  - Tagline: "Modern Library Management with QR-First Workflows"

### Feature Showcases
- **File**: `catalog-interface.png`
  - Screenshot of the book catalog with search and filters
  - Dimensions: 800×600px

- **File**: `qr-scanner-demo.gif`
  - Screen recording of QR scanning flow (borrow/return)
  - Dimensions: 800×600px
  - Duration: 5-10 seconds

- **File**: `admin-dashboard.png`
  - Admin overview dashboard with statistics
  - Dimensions: 1000×700px

- **File**: `dark-mode-comparison.png`
  - Side-by-side light/dark theme comparison
  - Dimensions: 1200×600px

### Architecture Diagrams
- **File**: `system-architecture.png`
  - High-resolution version of the Mermaid diagram
  - Useful for presentations
  - Dimensions: 1600×900px

- **File**: `auth-flow.png`
  - JWT authentication sequence visualization
  - Dimensions: 1000×800px

### Workflow Diagrams
- **File**: `borrow-flow.png`
  - Step-by-step borrowing process
  - Dimensions: 1200×800px

- **File**: `reservation-fifo.png`
  - FIFO queue visualization for reservations
  - Dimensions: 1000×600px

## Image Guidelines

### Style
- Use consistent color palette from the app (primary, background, card colors)
- Include subtle shadows and rounded corners matching UI design
- Maintain Awwwards-quality aesthetic: clean, modern, premium feel

### Format
- PNG for screenshots (lossless, supports transparency)
- GIF for animations (optimized, <2MB file size)
- SVG for diagrams when possible (scalable, smaller file size)

### Accessibility
- Add alt text for all images in README
- Ensure sufficient contrast in screenshots
- Avoid text-only information in images (repeat in captions)

## Creating Assets

### Option 1: Screenshots
```bash
# Use browser DevTools responsive mode
# Set viewport to target dimensions
# Capture full-page or visible area
```

### Option 2: Diagram Tools
- [Mermaid Live Editor](https://mermaid.live/) - Export PNG/SVG
- [Excalidraw](https://excalidraw.com/) - Hand-drawn style diagrams
- [Figma](https://figma.com/) - Professional mockups

### Option 3: Screen Recording
```bash
# macOS: QuickTime Player or ScreenFlow
# Windows: OBS Studio (free)
# Linux: SimpleScreenRecorder
# Convert to GIF: ffmpeg or ezgif.com
```

## Placeholder Usage

Until real assets are created, the README uses placeholder paths like:
```markdown
![Pustaka QR Banner](docs/assets/hero-banner.png)
```

These will render as broken images, signaling the need for actual screenshots.

## License for Assets

All documentation assets follow the project's MIT license.

---

**Contributing**: If you add new assets, update this index file and reference them in the README.
