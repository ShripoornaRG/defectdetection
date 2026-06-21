import os
from dotenv import load_dotenv
from services.ai_reasoning import analyze_defect

load_dotenv()

dummy_metrics = {
    'crack_metrics': {'total_crack_length_px': 150, 'crack_area_percentage': 2.5},
    'corrosion_metrics': {'rust_area_percentage': 5.0},
    'severity_estimate': 'High'
}

try:
    result = analyze_defect(dummy_metrics)
    print("AI Analysis Result:", result)
except Exception as e:
    import traceback
    traceback.print_exc()
