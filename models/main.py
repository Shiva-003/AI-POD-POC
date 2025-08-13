import os
import io
import json
import base64
import torch
import traceback
from PIL import Image, ImageDraw
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from transformers import AutoImageProcessor, AutoModelForImageClassification, AutoTokenizer, AutoModelForCausalLM

app = FastAPI(title="Skin Lesion + Phi-3 Mini Report Service")

# -------------------
# Config
# -------------------
HF_IMAGE_MODEL_ID = "Anwarkh1/Skin_Cancer-Image_Classification"
HF_LLM_MODEL_ID = "microsoft/Phi-3-mini-4k-instruct"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
REPORTS_DIR = "reports"
# os.makedirs(REPORTS_DIR, exist_ok=True)

# -------------------
# Load Models
# -------------------
print(f"Loading skin model {HF_IMAGE_MODEL_ID} on {DEVICE}...")
processor = AutoImageProcessor.from_pretrained(HF_IMAGE_MODEL_ID)
image_model = AutoModelForImageClassification.from_pretrained(HF_IMAGE_MODEL_ID).to(DEVICE).eval()

# print(f"Loading Phi-3 Mini {HF_LLM_MODEL_ID} on {DEVICE}...")
# tokenizer = AutoTokenizer.from_pretrained(HF_LLM_MODEL_ID, trust_remote_code=True)
# llm_model = AutoModelForCausalLM.from_pretrained(HF_LLM_MODEL_ID, trust_remote_code=True).to(DEVICE).eval()

id2label = getattr(image_model.config, "id2label", None)

# -------------------
# Utility functions
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

def generate_report(job_id: str, label: str, conf: float, description: str, location: str):
    messages = [
        {
            "role": "user",
            "content": f"""
            You are a clinical AI assistant. 
            Analyze this skin lesion result and return STRICT JSON ONLY (no extra text, no markdown).

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

    # Save report to file
    report_path = os.path.join(REPORTS_DIR, f"{job_id}.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report_data, f, ensure_ascii=False, indent=2)

    return report_data, f"/reports/{job_id}.json"

# -------------------
# Routes
# -------------------
@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    job_id: str = Form(...),
    description: str = Form(""),
    location: str = Form("")
):
    # Step 1: Load Image
    try:
        contents = await file.read()
        pil = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image upload: {e}")

    # Step 2: Run Skin Model
    try:
        inputs = processor(images=pil, return_tensors="pt").to(DEVICE)
        with torch.no_grad():
            outputs = image_model(**inputs)
            logits = outputs.logits.cpu().squeeze(0)
            probs = torch.softmax(logits, dim=0).numpy().tolist()

        top_idx = int(torch.argmax(logits).item())
        top_conf = float(torch.softmax(logits, dim=0)[top_idx].item())
        label_name = id2label[top_idx] if id2label else f"class_{top_idx}"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {e}")

    # Step 3: Annotate Image
    annotated = annotate_image(pil, label_name, top_conf)
    annotated_b64 = pil_to_base64(annotated)

    # Step 4: Generate LLM Report
    # report_data, report_url = generate_report(job_id, label_name, top_conf, description, location)

    # Step 5: Return Combined Response
    return JSONResponse(content={
        "job_id": job_id,
        "model_id": HF_IMAGE_MODEL_ID,
        "label": label_name,
        "confidence": top_conf,
        "annotated_image": annotated_b64,
        "report": '',
        "report_url": ''
        # "report": report_data,
        # "report_url": report_url
    })
