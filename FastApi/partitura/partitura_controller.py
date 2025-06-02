from fastapi import APIRouter, Depends, Request, UploadFile, File, Form
from partitura.partitura_service import *

partitura_router = APIRouter()

@partitura_router.post("/predict/")
async def create_upload_file(
    file: UploadFile = File(...),
    start_time: int = Form(...)
):
    return Predict(file, start_time)
