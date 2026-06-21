import cv2
import numpy as np

def process_image(image_bytes: bytes) -> dict:
    """
    Processes an uploaded image to detect defects (cracks, corrosion) 
    using OpenCV mathematical operations.
    """
    # 1. Decode image bytes to OpenCV format
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Invalid image format")

    height, width, _ = img.shape
    total_area = height * width

    # 2. Preprocessing
    # Resize if too large to standardize processing (e.g., max width 800)
    max_width = 800
    if width > max_width:
        ratio = max_width / width
        img = cv2.resize(img, (max_width, int(height * ratio)))
        height, width, _ = img.shape
        total_area = height * width

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    # Histogram Equalization to improve contrast
    equalized = cv2.equalizeHist(blurred)

    # 3. Edge Detection (Cracks)
    # Using Canny edge detector
    edges = cv2.Canny(equalized, threshold1=100, threshold2=200)
    
    # Find contours from edges
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    crack_contours = []
    total_crack_length = 0
    crack_area = 0
    for cnt in contours:
        # Filter small noise contours
        if cv2.contourArea(cnt) > 20 or cv2.arcLength(cnt, True) > 50:
            crack_contours.append(cnt)
            total_crack_length += cv2.arcLength(cnt, True)
            crack_area += cv2.contourArea(cnt)

    crack_percentage = (crack_area / total_area) * 100 if total_area > 0 else 0

    # 4. Color Segmentation (Corrosion/Rust)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    # Define color range for rust (brown/orange)
    lower_rust = np.array([10, 50, 50])
    upper_rust = np.array([30, 255, 255])
    
    rust_mask = cv2.inRange(hsv, lower_rust, upper_rust)
    rust_pixels = cv2.countNonZero(rust_mask)
    rust_percentage = (rust_pixels / total_area) * 100 if total_area > 0 else 0

    # 5. Preliminary Severity Estimate
    severity = "Low"
    if crack_percentage > 5 or rust_percentage > 15:
        severity = "High"
    elif crack_percentage > 1 or rust_percentage > 5:
        severity = "Medium"

    return {
        "dimensions": {"width": width, "height": height},
        "crack_metrics": {
            "total_crack_length_px": round(total_crack_length, 2),
            "crack_area_percentage": round(crack_percentage, 2),
            "crack_count": len(crack_contours)
        },
        "corrosion_metrics": {
            "rust_area_percentage": round(rust_percentage, 2)
        },
        "severity_estimate": severity,
        "object_detected": True
    }
