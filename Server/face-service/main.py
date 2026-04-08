from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
import shutil

app = FastAPI(title="Credify Face Verification", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazy-load DeepFace to avoid slow startup if just health-checking
_deepface = None

def get_deepface():
    global _deepface
    if _deepface is None:
        from deepface import DeepFace
        _deepface = DeepFace
    return _deepface


@app.get("/health")
def health():
    return {"status": "ok", "service": "face-verification"}


@app.post("/verify")
async def verify_faces(
    id_image: UploadFile = File(..., description="National ID photo"),
    selfie_image: UploadFile = File(..., description="User selfie"),
):
    """
    Compare the face on the National ID with the selfie.
    Returns: { verified: bool, distance: float, model: str, threshold: float }
    """
    tmp_dir = tempfile.mkdtemp()
    try:
        # Save uploaded files to temp
        id_path = os.path.join(tmp_dir, f"id_{id_image.filename}")
        selfie_path = os.path.join(tmp_dir, f"selfie_{selfie_image.filename}")

        with open(id_path, "wb") as f:
            shutil.copyfileobj(id_image.file, f)
        with open(selfie_path, "wb") as f:
            shutil.copyfileobj(selfie_image.file, f)

        DeepFace = get_deepface()

        # Verify faces using VGG-Face model (good balance of speed + accuracy)
        result = DeepFace.verify(
            img1_path=id_path,
            img2_path=selfie_path,
            model_name="VGG-Face",
            enforce_detection=False,  # Don't crash if face detection is uncertain
        )

        return {
            "verified": result["verified"],
            "distance": round(result["distance"], 4),
            "model": result.get("model", "VGG-Face"),
            "threshold": result.get("threshold", 0.4),
        }

    except Exception as e:
        print(f"[Face Verify] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Face verification failed: {str(e)}")

    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
