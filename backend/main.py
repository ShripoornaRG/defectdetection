import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv

from services.yolo_processor import YOLOProcessor

load_dotenv()

app = FastAPI(title="DefectVision API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

yolo_processor = None

@app.on_event("startup")
def load_yolo_model():
    global yolo_processor
    # The models directory is in the workspace root, one level up from the backend directory
    model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models", "best.pt"))
    print(f"Loading YOLO model from: {model_path}")
    try:
        yolo_processor = YOLOProcessor(model_path)
    except Exception as e:
        print(f"CRITICAL: Failed to load YOLO model: {e}")
        # We don't crash the server, but the analyze endpoint will return a 500 error indicating model load failure.

@app.get("/")
def read_root():
    return {"message": "DefectVision API is running"}

@app.post("/analyze")
async def analyze_endpoint(file: UploadFile = File(...)):
    global yolo_processor
    
    # 1. Error Handling: Empty uploads
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    # 2. Error Handling: Invalid image formats (Accept JPG, PNG, and JPEG files)
    filename_lower = file.filename.lower()
    valid_extensions = (".jpg", ".jpeg", ".png")
    if not filename_lower.endswith(valid_extensions):
        raise HTTPException(
            status_code=400, 
            detail="Invalid image format. Only JPG, JPEG, and PNG files are accepted."
        )

    try:
        file_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file bytes: {str(e)}")

    if not file_bytes or len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty upload. Please upload a valid image file.")

    # 3. Error Handling: YOLO model loading errors
    if yolo_processor is None:
        raise HTTPException(
            status_code=500, 
            detail="YOLO model is not initialized or failed to load. Please check server logs."
        )

    # 4. Error Handling: Inference failures
    try:
        analysis_result = yolo_processor.process_image(file_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Inference failure: {str(e)}"
        )

    return analysis_result

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

