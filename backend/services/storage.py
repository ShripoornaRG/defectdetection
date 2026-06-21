import os
from supabase import create_client, Client

def get_supabase_client() -> Client:
    url: str = os.getenv("SUPABASE_URL", "")
    key: str = os.getenv("SUPABASE_KEY", "")
    
    if not url or not key:
        print("Warning: Supabase credentials not found in environment.")
        return None
        
    return create_client(url, key)

def save_to_supabase(report_data: dict, image_bytes: bytes):
    """
    Saves the image to Supabase Storage and the report to the Database.
    """
    supabase = get_supabase_client()
    if not supabase:
        return
        
    try:
        # 1. Upload Image
        filename = report_data.get("filename", "defect.jpg")
        # Ensure unique filename in production (e.g., using uuid)
        
        # Upload to 'defects' bucket
        supabase.storage.from_("defects").upload(
            file=image_bytes,
            path=filename,
            file_options={"content-type": "image/jpeg"}
        )
        
        # Get public URL
        public_url = supabase.storage.from_("defects").get_public_url(filename)
        
        # 2. Save Report to DB
        db_data = {
            "image_url": public_url,
            "severity": report_data["ai_analysis"].get("severity", "Unknown"),
            "cause": report_data["ai_analysis"].get("cause_estimation", ""),
            "forecast": report_data["ai_analysis"].get("progression_forecast", ""),
            "suggestions": report_data["ai_analysis"].get("suggestions", []),
            "cv_metrics": report_data["cv_metrics"]
        }
        
        supabase.table("defect_reports").insert(db_data).execute()
        
    except Exception as e:
        print(f"Failed to save to Supabase: {e}")
