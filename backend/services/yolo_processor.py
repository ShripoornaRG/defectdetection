import cv2
import numpy as np
import base64
from ultralytics import YOLO

class YOLOProcessor:
    def __init__(self, model_path: str):
        """
        Initializes the YOLO model. This should be run once during startup.
        """
        try:
            self.model = YOLO(model_path)
            print(f"YOLO model loaded successfully from {model_path}")
        except Exception as e:
            print(f"Failed to load YOLO model: {e}")
            raise e

    def process_image(self, image_bytes: bytes) -> dict:
        """
        Runs inference on image bytes, computes quality metrics, and returns
        both structured data and the base64-encoded annotated image.
        """
        # 1. Decode image bytes to OpenCV format
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Invalid image format or corrupted bytes")

        # 2. Run inference
        results = self.model(img)
        result = results[0]  # Get result for the single image

        detected_defects = []
        
        # 3. Extract detections
        # YOLO box coordinates, confidences, and classes
        boxes = result.boxes
        for box in boxes:
            cls_id = int(box.cls[0].item())
            class_name = self.model.names.get(cls_id, f"unknown-{cls_id}")
            confidence = float(box.conf[0].item())
            
            detected_defects.append({
                "type": class_name,
                "confidence": round(confidence, 2)
            })

        # 4. Calculate Surface Quality Scoring
        # Excellent: 0 defects
        # Good: Low confidence-weighted count (sum of confidences < 1.0)
        # Fair: Moderate (1.0 <= sum of confidences < 2.5)
        # Poor: Many (sum of confidences >= 2.5)
        defect_count = len(detected_defects)
        weighted_count = sum(d["confidence"] for d in detected_defects)

        if defect_count == 0:
            surface_quality = "Excellent"
        elif weighted_count < 1.0:
            surface_quality = "Good"
        elif weighted_count < 2.5:
            surface_quality = "Fair"
        else:
            surface_quality = "Poor"

        # 5. Adhesion Quality Estimation
        # No defects -> Excellent
        # Minor scratches or isolated defects -> Good
        # Multiple defects -> Moderate
        # Severe crazing, pitted surface, rolled-in scale or multiple major defects -> Poor
        # Major defects defined as crazing, pitted_surface, rolled-in_scale
        major_defects = [d for d in detected_defects if d["type"] in ["crazing", "pitted_surface", "rolled-in_scale"]]
        has_crazing = any(d["type"] == "crazing" for d in detected_defects)
        has_pitted = any(d["type"] == "pitted_surface" for d in detected_defects)
        has_rolled = any(d["type"] == "rolled-in_scale" for d in detected_defects)

        if defect_count == 0:
            adhesion_quality = "Excellent"
        elif has_crazing or has_pitted or has_rolled or len(major_defects) >= 2:
            adhesion_quality = "Poor"
        elif defect_count > 2:
            adhesion_quality = "Moderate"
        else:
            adhesion_quality = "Good"

        # 6. Severity Score
        # 0 defects = Low
        # 1-2 defects = Medium
        # 3+ defects = High
        if defect_count == 0:
            severity = "Low"
        elif defect_count <= 2:
            severity = "Medium"
        else:
            severity = "High"

        # 7. Recommendation Engine
        if surface_quality == "Excellent":
            recommendation = "No maintenance required."
        elif surface_quality == "Good":
            recommendation = "Periodic inspection recommended."
        elif surface_quality == "Fair":
            recommendation = "Surface repair may be required."
        else:
            recommendation = "Immediate maintenance recommended."

        # 8. Render annotated image with bounding boxes
        annotated_img_bgr = result.plot()
        _, encoded_img = cv2.imencode('.jpg', annotated_img_bgr)
        base64_image = base64.b64encode(encoded_img).decode('utf-8')
        annotated_image_url = f"data:image/jpeg;base64,{base64_image}"

        # 9. Return the full output structure
        return {
            "detected_defects": detected_defects,
            "surface_quality": surface_quality,
            "adhesion_quality": adhesion_quality,
            "adhesion_quality_note": "Adhesion quality is an AI-based visual estimate and not a physical adhesion measurement.",
            "severity": severity,
            "recommendation": recommendation,
            "annotated_image": annotated_image_url
        }
