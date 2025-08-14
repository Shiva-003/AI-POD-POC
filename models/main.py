import os
import io
import json
import base64
import torch
import torch.nn as nn
import numpy as np
from PIL import Image, ImageDraw
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from torchvision import transforms
from transformers import AutoImageProcessor, AutoModelForImageClassification, AutoTokenizer, AutoModelForCausalLM
from ml_models.eye_model import ImprovedTinyVGGModel

# -------------------
# App config
# -------------------
app = FastAPI(title="Skin Lesion + Eye Disease Detection API")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
REPORTS_DIR = "reports"
# os.makedirs(REPORTS_DIR, exist_ok=True)

# -------------------
# Skin Lesion Model
# -------------------
HF_IMAGE_MODEL_ID = "Anwarkh1/Skin_Cancer-Image_Classification"
print(f"Loading skin model {HF_IMAGE_MODEL_ID} on {DEVICE}...")
skin_processor = AutoImageProcessor.from_pretrained(HF_IMAGE_MODEL_ID)
skin_model = AutoModelForImageClassification.from_pretrained(HF_IMAGE_MODEL_ID).to(DEVICE).eval()
id2label = getattr(skin_model.config, "id2label", None)

# -------------------
# Eye Disease Model
# -------------------
classes_eye = np.array(['Amd', 'Cataract', 'Glaucoma', 'Myopia', 'Not eye', 'Normal'])

print("Loading eye disease model...")
eye_model = ImprovedTinyVGGModel(input_shape=3, hidden_units=48, output_shape=len(classes_eye))
eye_weights_path = os.path.join("trained_weights", "ocularnet_model.pth")
eye_model.load_state_dict(torch.load(eye_weights_path, map_location=torch.device('cpu')))
eye_model.eval()

eye_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

# -------------------
# LLM Model (Phi-3 Mini)
# -------------------
# HF_LLM_MODEL_ID = "microsoft/Phi-3-mini-4k-instruct"
# print(f"Loading Phi-3 Mini {HF_LLM_MODEL_ID} on {DEVICE}...")
# tokenizer = AutoTokenizer.from_pretrained(HF_LLM_MODEL_ID, trust_remote_code=True)
# llm_model = AutoModelForCausalLM.from_pretrained(HF_LLM_MODEL_ID, trust_remote_code=True).to(DEVICE).eval()

# -------------------
# Utilities
# -------------------
def pil_to_base64(img: Image.Image) -> str:
    buff = io.BytesIO()
    img.save(buff, format="PNG")
    return base64.b64encode(buff.getvalue()).decode("utf-8")

def annotate_image(pil_img: Image.Image, label: str, conf: float):
    annotated = pil_img.copy()
    draw = ImageDraw.Draw(annotated)
    text = f"{label} ({conf*100:.0f}%)"
    bbox = draw.textbbox((0, 0), text)
    draw.rectangle([bbox[0], bbox[1], bbox[2] + 12, bbox[3] + 8], fill=(255, 255, 255, 200))
    draw.text((6, 4), text, fill=(0, 0, 0))
    return annotated

def generate_report(job_id: str, label: str, conf: float, description: str, location: str, analysis_type: str):
    context_text = "skin lesion" if analysis_type == "skin" else "eye condition"
    messages = [
        {
            "role": "user",
            "content": f"""
            You are a clinical AI assistant.
            Analyze this {context_text} result and return STRICT JSON ONLY (no extra text, no markdown).

            Job ID: {job_id}
            Findings: label={label}, confidence={conf*100:.1f}%
            User description: {description}
            Location: {location}

            JSON format:
            {{
            "summary": "Short paragraph describing the findings",
            "recommendation": "One-line medical recommendation",
            "checklist": ["Tip 1", "Tip 2", "Tip 3"]
            }}
            """
        }
    ]

    inputs = tokenizer.apply_chat_template(
        messages,
        add_generation_prompt=True,
        tokenize=True,
        return_dict=True,
        return_tensors="pt"
    ).to(llm_model.device)

    with torch.no_grad():
        outputs = llm_model.generate(**inputs, max_new_tokens=300)

    generated_text = tokenizer.decode(
        outputs[0][inputs["input_ids"].shape[-1]:],
        skip_special_tokens=True
    ).strip()

    try:
        report_data = json.loads(generated_text)
    except json.JSONDecodeError:
        report_data = {
            "summary": generated_text,
            "recommendation": "",
            "checklist": []
        }

    report_path = os.path.join(REPORTS_DIR, f"{job_id}.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report_data, f, ensure_ascii=False, indent=2)

    return report_data, f"/reports/{job_id}.json"

# -------------------
# Endpoints
# -------------------
@app.post("/analyze")
async def analyze_skin(
    file: UploadFile = File(...),
    job_id: str = Form(...),
    description: str = Form(""),
    location: str = Form("")
):
    try:
        contents = await file.read()
        pil = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image upload: {e}")

    try:
        inputs = skin_processor(images=pil, return_tensors="pt").to(DEVICE)
        with torch.no_grad():
            outputs = skin_model(**inputs)
            logits = outputs.logits.cpu().squeeze(0)
        top_idx = int(torch.argmax(logits).item())
        top_conf = float(torch.softmax(logits, dim=0)[top_idx].item())
        label_name = id2label[top_idx] if id2label else f"class_{top_idx}"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {e}")

    annotated = annotate_image(pil, label_name, top_conf)
    annotated_b64 = pil_to_base64(annotated)
    # report_data, report_url = generate_report(job_id, label_name, top_conf, description, location, "skin")

    return JSONResponse(content={
        "job_id": job_id,
        "model_id": HF_IMAGE_MODEL_ID,
        "label": label_name,
        "confidence": top_conf,
        "annotated_image": annotated_b64,
        # "report": report_data,
        # "report_url": report_url
    })

@app.post("/analyze_eye")
async def analyze_eye(
    file: UploadFile = File(...),
    job_id: str = Form(...),
    description: str = Form(""),
):
    try:
        contents = await file.read()
        pil = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image upload: {e}")

    try:
        img_t = eye_transform(pil).unsqueeze(0)
        with torch.no_grad():
            outputs = eye_model(img_t)
            probs = torch.softmax(outputs, dim=1)
            conf, pred_idx = torch.max(probs, 1)
        pred_label = classes_eye[pred_idx.item()]
        pred_conf = conf.item()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Eye disease analysis failed: {e}")

    annotated = annotate_image(pil, pred_label, pred_conf)
    annotated_b64 = pil_to_base64(annotated)
    # report_data, report_url = generate_report(job_id, pred_label, pred_conf, description, location, "eye")

    return JSONResponse(content={
        "job_id": job_id,
        "label": pred_label,
        "confidence": pred_conf,
        "annotated_image": annotated_b64,
        # "report": report_data,
        # "report_url": report_url
    })
