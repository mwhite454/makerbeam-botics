# MakerBeam Botics

A visual node editor for parametric 3D design, powered by OpenSCAD compiled to WebAssembly. Design parts by connecting nodes — no code required.

**Live:** [mecha.betty-bot.us](https://mecha.betty-bot.us)

## Features

- **Visual node editor** — drag-and-drop 3D primitives, transforms, booleans, and control flow
- **2D sketch editor** — draw profiles with paths, arcs, and boolean operations
- **Real-time preview** — OpenSCAD WASM renders your design in the browser as you build
- **Export** — STL, PNG, SVG, DXF output formats
- **MakerBeam node pack** — pre-built parametric MakerBeamXL extrusion parts
- **No backend** — everything runs client-side in your browser

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Self-Hosting with Docker

```bash
docker build -t makerbeam-botics .
docker run -p 8080:80 makerbeam-botics
```

The nginx config sets `Cross-Origin-Embedder-Policy` and `Cross-Origin-Opener-Policy` headers required for SharedArrayBuffer (OpenSCAD WASM multi-threading).

## Tech Stack

- React + TypeScript + Vite
- [XYFlow](https://xyflow.com) (node editor)
- [OpenSCAD WASM](https://github.com/nicolo-ribaudo/openscad-wasm) (in-browser rendering)
- [Three.js](https://threejs.org) (3D preview)
- [Maker.js](https://maker.js.org) (2D sketch operations)
- Zustand (state management)
- Tailwind CSS (styling)
- Deployed on Cloudflare Pages
