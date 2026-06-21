import os
import json
from anthropic import Anthropic

def analyze_defect(cv_metrics: dict) -> dict:
    """
    Sends the OpenCV metrics to Claude API for reasoning, cause estimation,
    progression forecasting, and maintenance suggestions.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY is not set.")

    client = Anthropic(api_key=api_key)

    prompt = f"""
You are an elite structural and materials engineering AI model, trained on thousands of surface defect datasets.
I have used OpenCV to extract precise mathematical metrics from an image of a surface defect.

Here are the hard numbers:
- Crack cumulative length: {cv_metrics['crack_metrics']['total_crack_length_px']} pixels
- Crack area footprint: {cv_metrics['crack_metrics']['crack_area_percentage']}% of the visible surface
- Corrosion/Oxidation area: {cv_metrics['corrosion_metrics']['rust_area_percentage']}% of the visible surface
- OpenCV Preliminary Severity Trigger: {cv_metrics['severity_estimate']}

Your task is to provide an EXTREMELY DETAILED, highly technical engineering analysis of this defect.
Consider the interplay between the crack length and corrosion (e.g. moisture ingress into micro-fractures).

Return your response strictly as a JSON object with the exact keys below:
- "severity": (Must be exactly one of: "Low", "Medium", "High", "Critical". Base this on a rigorous evaluation of the metrics.)
- "cause_estimation": (A highly descriptive, 2-3 sentence technical explanation of the physical phenomena likely causing these specific metrics, such as tensile stress, localized oxidation, thermal expansion, fatigue failure, or galvanization breakdown.)
- "progression_forecast": (A specific, time-bound forecast predicting how quickly this defect will reach critical failure if left untreated, detailing the expected physical breakdown process.)
- "suggestions": (A list of 3-4 highly specific, professional-grade maintenance or remediation steps. Include material suggestions like "epoxy injection", "polyurethane coating", "ultrasonic testing", etc.)
    """

    response = client.messages.create(
        model="claude-3-opus-20240229",
        max_tokens=500,
        temperature=0.2,
        system="You are an expert engineer. Always respond strictly in valid JSON.",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    content = response.content[0].text
    
    try:
        # Claude might wrap JSON in markdown blocks
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
            
        result = json.loads(content)
        return result
    except Exception as e:
        # Fallback if parsing fails
        return {
            "severity": cv_metrics.get("severity_estimate", "Unknown"),
            "cause_estimation": "Could not parse AI response.",
            "progression_forecast": "Unknown.",
            "suggestions": ["Please review manually."],
            "raw_ai_response": content
        }
