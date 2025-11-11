from PIL import Image

# Open the original GIF
img = Image.open('assets/svg/pathway.gif')

# Extract frames
frames = []
frame_count = 0
max_frames = 30  # Limit frames to reduce size

try:
    while frame_count < max_frames:
        # Resize frame to half size
        resized = img.copy().resize((img.size[0]//2, img.size[1]//2), Image.Resampling.LANCZOS)
        frames.append(resized)
        img.seek(img.tell() + 1)
        frame_count += 1
except EOFError:
    pass

# Save the smaller GIF
frames[0].save(
    'assets/svg/pathway_temp.gif',
    save_all=True,
    append_images=frames[1:],
    duration=img.info.get('duration', 100),
    loop=0,
    optimize=True
)

print(f"Created temporary GIF with {len(frames)} frames")
