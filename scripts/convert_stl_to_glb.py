#!/usr/bin/env python3
import trimesh
from pathlib import Path

SOURCE = Path("src/assets/files-v2")
OUTPUT = Path("src/assets/files-glb")
OUTPUT.mkdir(parents=True, exist_ok=True)

stl_files = sorted(SOURCE.glob("*.stl"))
print(f"Converting {len(stl_files)} STL files...\n")

for stl in stl_files:
    glb = OUTPUT / (stl.stem + ".glb")
    trimesh.load(str(stl)).export(str(glb))
    orig = stl.stat().st_size // 1024
    new = glb.stat().st_size // 1024
    print(f"  {stl.name:<45} {orig:>5}KB → {glb.name:<45} {new:>5}KB")

print("\nDone!")
