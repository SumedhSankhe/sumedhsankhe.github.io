#!/usr/bin/env python3
"""
Image Optimization Script
Optimizes profile.png for web use by creating multiple sizes and formats

Installation:
    pip install Pillow

Usage:
    python3 optimize_images.py
"""

try:
    from PIL import Image
except ImportError:
    print("Error: Pillow not installed")
    print("Install with: pip install Pillow")
    exit(1)

import os

def optimize_profile_image():
    """
    Optimize profile.png:
    - Create multiple sizes (200x200, 400x400 for retina)
    - Create WebP versions
    - Optimize original PNG
    """

    input_path = 'profile.png'

    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found")
        return

    # Open original image
    img = Image.open(input_path)
    print(f"Original: {img.size}, {os.path.getsize(input_path) / 1024:.1f}KB")

    # Convert RGBA to RGB if needed for JPEG
    if img.mode == 'RGBA':
        # Create white background for JPG conversion
        background = Image.new('RGB', img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[3])  # Use alpha channel as mask
        img_rgb = background
    else:
        img_rgb = img.convert('RGB')

    sizes = {
        'profile-200.png': (200, 200),    # Standard display size
        'profile-400.png': (400, 400),    # Retina display
        'profile-200.webp': (200, 200),   # WebP standard
        'profile-400.webp': (400, 400),   # WebP retina
    }

    for filename, size in sizes.items():
        # Resize with high-quality Lanczos filter
        resized = img.resize(size, Image.Resampling.LANCZOS)

        if filename.endswith('.webp'):
            # WebP format
            resized.save(filename, 'WebP', quality=85, method=6)
        else:
            # PNG format - optimize
            resized.save(filename, 'PNG', optimize=True)

        file_size = os.path.getsize(filename) / 1024
        print(f"Created: {filename} - {file_size:.1f}KB")

    # Optimize original profile.png in place
    img.save('profile-optimized.png', 'PNG', optimize=True)
    optimized_size = os.path.getsize('profile-optimized.png') / 1024
    print(f"\nOptimized original: profile-optimized.png - {optimized_size:.1f}KB")
    print(f"Savings: {os.path.getsize(input_path) / 1024 - optimized_size:.1f}KB")

    print("\n✅ Optimization complete!")
    print("\nNext steps:")
    print("1. Replace profile.png with profile-optimized.png")
    print("2. Update HTML to use responsive images with <picture> element")

if __name__ == '__main__':
    optimize_profile_image()
