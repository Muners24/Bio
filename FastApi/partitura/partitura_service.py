from fastapi import HTTPException, Request, UploadFile
from connection import DB, client
import os
from Classifier.SupervisadoSingle import Classify
import uuid
import shutil

# Puedes ajustar los formatos de audio permitidos aquí
ALLOWED_AUDIO_EXTENSIONS = {'.mp3', '.wav', '.ogg', '.flac', '.midi', '.mid'}

collection_partitura = DB["Chord"]

def ValidateFile(file: UploadFile) -> bool:
    filename = file.filename.lower()
    extension = os.path.splitext(filename)[1]
    return extension in ALLOWED_AUDIO_EXTENSIONS

def Predict(file: UploadFile):
    if not ValidateFile(file):
        raise HTTPException(
            status_code=400,
            detail=f"Formato no permitido. Se permiten: {', '.join(ALLOWED_AUDIO_EXTENSIONS)}"
        )
    
    
    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    os.makedirs("temp", exist_ok=True)
    temp_file_path = os.path.join("temp", unique_filename)

    # Guardar archivo temporalmente
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        notes = Classify(temp_file_path)
        print(notes)
    finally:
        os.remove(temp_file_path)
    
    return {
        "notes": notes
    }

