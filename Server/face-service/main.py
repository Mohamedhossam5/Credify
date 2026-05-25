from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import tempfile
import os
import shutil
import numpy as np

# ---------------------------------------------------------------------------
# Global InsightFace model – initialized once at startup via lifespan
# ---------------------------------------------------------------------------
_face_app = None

COSINE_THRESHOLD = 0.4  # KYC-grade: lower = stricter (typical range 0.3–0.5)


def _init_model():
    """Load InsightFace buffalo_l model (ArcFace + SCRFD detection)."""
    global _face_app
    from insightface.app import FaceAnalysis

    _face_app = FaceAnalysis(
        name="buffalo_l",
        providers=["CUDAExecutionProvider", "CPUExecutionProvider"],
    )
    # det_size controls the detection input resolution – 640×640 is the
    # recommended production setting for reliable ID-card face detection.
    _face_app.prepare(ctx_id=0, det_size=(640, 640))
    print("[InsightFace] buffalo_l model loaded successfully")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    _init_model()
    yield


# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Credify Face Verification",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _cosine_similarity(emb1: np.ndarray, emb2: np.ndarray) -> float:
    """Compute cosine similarity between two embedding vectors."""
    dot = np.dot(emb1, emb2)
    norm = np.linalg.norm(emb1) * np.linalg.norm(emb2)
    if norm == 0:
        return 0.0
    return float(dot / norm)


def _get_largest_face(img_path: str, label: str):
    """
    Detect faces in *img_path* and return the embedding of the largest face.
    Raises HTTPException when no face is found.
    """
    if _face_app is None:
        raise HTTPException(status_code=503, detail="Face model not loaded yet.")
    faces = _face_app.get(
        _read_image(img_path),
    )
    if not faces:
        raise HTTPException(
            status_code=422,
            detail=f"No face detected in the {label} image.",
        )
    # Pick the face with the largest bounding-box area (most prominent face)
    largest = max(faces, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]))
    return largest.embedding


def _read_image(path: str):
    """Read an image from disk via OpenCV (BGR numpy array)."""
    import cv2

    img = cv2.imread(path)
    if img is None:
        raise HTTPException(status_code=400, detail=f"Could not read image: {os.path.basename(path)}")
    return img


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "face-verification",
        "model": "buffalo_l (ArcFace)",
    }


@app.post("/verify")
async def verify_faces(
    id_image: UploadFile = File(..., description="National ID photo"),
    selfie_image: UploadFile = File(..., description="User selfie"),
):
    """
    Compare the face on the National ID with the selfie.
    Returns: { verified: bool, similarity: float, model: str, threshold: float }
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

        # Extract ArcFace embeddings
        id_embedding = _get_largest_face(id_path, "national ID")
        selfie_embedding = _get_largest_face(selfie_path, "selfie")

        # Cosine similarity (1.0 = identical, 0.0 = unrelated)
        similarity = _cosine_similarity(id_embedding, selfie_embedding)
        verified = similarity >= COSINE_THRESHOLD

        return {
            "verified": verified,
            "similarity": round(similarity, 4),
            "model": "buffalo_l (ArcFace)",
            "threshold": COSINE_THRESHOLD,
        }

    except HTTPException:
        raise  # Re-raise known HTTP errors as-is

    except Exception as e:
        print(f"[Face Verify] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Face verification failed: {str(e)}")

    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
