"""Image processing utilities"""
from typing import Tuple, Optional
import logging

logger = logging.getLogger(__name__)

try:
    from PIL import Image
    from io import BytesIO
    HAS_PIL = True
except ImportError:
    logger.warning("PIL not installed. Image processing will be disabled.")
    HAS_PIL = False

try:
    import magic
    HAS_MAGIC = True
except ImportError:
    logger.warning("python-magic not installed. MIME type detection will be disabled.")
    HAS_MAGIC = False

def process_image(image_data: bytes, max_size: Tuple[int, int] = (800, 800)) -> Optional[bytes]:
    if not HAS_PIL:
        logger.warning("Image processing skipped - PIL not installed")
        return image_data

    try:
        # Verify image type if python-magic is available
        if HAS_MAGIC:
            mime = magic.Magic(mime=True)
            file_type = mime.from_buffer(image_data)
            if not file_type.startswith('image/'):
                return None

        # Process image
        img = Image.open(BytesIO(image_data))
        
        # Convert to RGB if necessary
        if img.mode not in ('RGB', 'RGBA'):
            img = img.convert('RGB')
        
        # Resize if needed
        if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Save optimized image
        output = BytesIO()
        img.save(output, format='JPEG', quality=85, optimize=True)
        return output.getvalue()
    
    except Exception as e:
        logger.error(f"Image processing failed: {e}")
        return None
