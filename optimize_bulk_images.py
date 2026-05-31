import os
from PIL import Image

path_port = r"c:\Users\kkale\OneDrive\Рабочий стол\verywell-decor"
images_dir = os.path.join(path_port, "assets", "images")

def resize_and_compress_webp(rel_path, target_size, quality=60):
    file_path = os.path.join(images_dir, rel_path)
    if not os.path.exists(file_path):
        print(f"File not found: {rel_path}")
        return
    
    orig_size = os.path.getsize(file_path)
    try:
        with Image.open(file_path) as img:
            # Resize using LANCZOS resampling
            resized_img = img.resize(target_size, Image.Resampling.LANCZOS)
            resized_img.save(file_path, "WEBP", quality=quality, method=6)
        new_size = os.path.getsize(file_path)
        print(f"Resized & Compressed {rel_path}: {orig_size/1024:.1f} KB -> {new_size/1024:.1f} KB (size={target_size}, quality={quality})")
    except Exception as e:
        print(f"Error processing {rel_path}: {e}")

if __name__ == "__main__":
    print("=== Phase 1: Resizing and Compressing Targeted PageSpeed Images ===")
    
    # 1. Resize decor_13.webp to 1000x667 (was 1200x800)
    resize_and_compress_webp(os.path.join("portfolio", "arki", "decor_13.webp"), (1000, 667), quality=60)
    
    # 2. Resize preview images to 400x266 (was 500x332)
    resize_and_compress_webp(os.path.join("portfolio", "preview", "CoQGZ825-p3idCK36eh7KkLB3InGus7a119zBn9zJscsmKiv6Bfv2leo2TReUM6-tAvj2Rl7PMUKrBfraL1ZLQDq.webp"), (400, 266), quality=60)
    resize_and_compress_webp(os.path.join("portfolio", "preview", "3ibnF-ocr31osg7khy0ySW-rvndnjYMi5VWI42AgMuDLhgRC8oMJD4N8MQKW6d6vxXmfqcmJl0dmRiabbC9Aao-W.webp"), (400, 266), quality=60)
    
    print("\nBulk resize completed.")
