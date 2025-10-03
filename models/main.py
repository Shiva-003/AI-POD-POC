import os
import io
import json
import re
import base64
import torch
import torch.nn as nn
import numpy as np
from PIL import Image, ImageDraw
from fastapi import FastAPI, File, Form, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from torchvision import transforms
from transformers import AutoImageProcessor, AutoModelForImageClassification, AutoTokenizer, AutoModelForCausalLM
from ml_models.eye_model import ImprovedTinyVGGModel
from fastapi.responses import FileResponse
from jinja2 import Environment, FileSystemLoader
from fpdf import FPDF


# Define directory to save reports
PDF_DIR = "pdf_reports"
os.makedirs(PDF_DIR, exist_ok=True)

# Template folder for Jinja2 (HTML files)
TEMPLATE_DIR = "templates"

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
# benign keratosis-like lesions, basal cell carcinoma, actinic keratoses, vascular lesions, melanocytic nevi, melanoma, and dermatofibroma
HF_IMAGE_MODEL_ID = "Anwarkh1/Skin_Cancer-Image_Classification"
print(f"Loading skin model {HF_IMAGE_MODEL_ID} on {DEVICE}...")
skin_processor = AutoImageProcessor.from_pretrained(HF_IMAGE_MODEL_ID)
skin_model = AutoModelForImageClassification.from_pretrained(HF_IMAGE_MODEL_ID).to(DEVICE).eval()
id2label = getattr(skin_model.config, "id2label", None)

# -------------------
# Wound Monitoring Model
# -------------------
HF_WOUND_MODEL_ID = "Hemg/Wound-Image-classification"
print(f"Loading wound model {HF_WOUND_MODEL_ID} on {DEVICE}...")

wound_processor = AutoImageProcessor.from_pretrained(HF_WOUND_MODEL_ID)
wound_model = AutoModelForImageClassification.from_pretrained(HF_WOUND_MODEL_ID).to(DEVICE).eval()

# Class mapping (if available in model config)
id2label_wound = getattr(wound_model.config, "id2label", None)

# Transform for inference (kept similar to other models)
wound_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

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
# LLM Model (Qwen3-0.6B-Medical-Expert)
# -------------------
LLM_MODEL_ID = "suayptalha/Qwen3-0.6B-Medical-Expert"
print(f"Loading medical LLM model '{LLM_MODEL_ID}' on {DEVICE}...")

# Load the new model and tokenizer
tokenizer = AutoTokenizer.from_pretrained(LLM_MODEL_ID)
llm_model = AutoModelForCausalLM.from_pretrained(LLM_MODEL_ID).eval()


# -------------------
# Utilities
# -------------------

report_status = {}

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


# Function to create the DiagnosiX Report PDF
def create_pdf(prediction, analysis_type, conf, description, location, report_data, pdf_filename="diagnosis_report.pdf"):
    # Initialize FPDF instance
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Set the header background
    pdf.set_fill_color(0, 86, 179)  # Blue color (RGB)
    pdf.rect(0, 0, 210, 20, 'F')  # Full width, 20mm height rectangle as background
    pdf.set_font("Arial", 'B', 16)
    pdf.set_text_color(255, 255, 255)  # White text color
    pdf.cell(200, 10, txt="DiagnosiX Report", ln=True, align="C")
    pdf.ln(10)  # Line break

    # Set content section background
    pdf.set_fill_color(255, 255, 255)  # White background for content
    pdf.rect(10, 30, 190, 260, 'F')  # Box for content area

    # Content section header
    pdf.set_font("Arial", 'B', 14)
    pdf.set_text_color(0, 86, 179)  # Blue color for titles
    pdf.cell(200, 10, txt=analysis_type, ln=True, align="L")
    pdf.ln(5)

    # Job details
    pdf.set_font("Arial", size=12)
    pdf.set_text_color(0, 0, 0)  # Black text for content
    pdf.cell(200, 10, txt=f"Prediction: {prediction}", ln=True)
    pdf.cell(200, 10, txt=f"Confidence: {conf * 100:.1f}%", ln=True)
    pdf.ln(5)

    # Description
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(200, 10, txt="Description", ln=True)
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 10, txt=description.capitalize())
    pdf.ln(5)

    # Location
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(200, 10, txt="Location", ln=True)
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt=location.capitalize(), ln=True)
    pdf.ln(5)

    # Report summary
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(200, 10, txt="Diagnosis and Recommendations")
    pdf.ln(1)
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 10, txt=report_data)  # This will handle the content properly

    # Position the footer 30mm from the bottom of the page
    pdf.set_y(-30)  # 30mm from the bottom of the page
    pdf.set_font("Arial", 'I', 10)
    pdf.set_text_color(136, 136, 136)  # Gray text for disclaimer
    pdf.multi_cell(0, 10, txt="This AI analysis is not a substitute for professional medical advice. Consult a healthcare provider for a diagnosis.", align='C')

    # Save PDF
    pdf.output(f"./pdf_reports/{pdf_filename}")
    print(f"PDF saved as {pdf_filename}")

# Function to generate a report, summary, and recommendation
def generate_report(id: str, prediction: str, conf: float, description: str, location: str, analysis_type: str):
    # Shorter and simpler prompt
    prompt_text = (
        f"The user has been diagnosed with {prediction} with {conf*100:.1f}% confidence. "
        f"Location of the condition: {location if location else 'N/A'}. "
        f"Description provided by the user: {description if description else 'No description'}. "
        f"Based on this, what are the **recommended next steps** for the user? "
        f"Provide guidance on **monitoring**, **treatment**, and any **urgent signs** that may require medical attention."
        f"Only provide 100-200 words."
    )


    print("Prompt:", prompt_text)

    # Prepare messages for the model
    messages = [{"role": "user", "content": prompt_text}]

    # Tokenize the input
    inputs = tokenizer.apply_chat_template(
        messages,
        add_generation_prompt=False,
        tokenize=True,
        return_dict=True,
        return_tensors="pt"
    ).to(llm_model.device)

    # Generate response
    with torch.no_grad():
        outputs = llm_model.generate(**inputs)

    # Decode the generated text
    generated_text = tokenizer.decode(outputs[0][inputs["input_ids"].shape[-1]:], skip_special_tokens=True)

    # Print the raw generated text for debugging
    print("Generated Text:", generated_text)

    # Clean the response
    report_data = re.sub(r"<think>.*?</think>", "", generated_text, flags=re.DOTALL)
    report_data = re.sub(r"\bassistant\b", "", report_data)  # Remove the word "assistant"
    print("Cleaned Report Data:", report_data)

    # Generate the PDF report with the cleaned report_data
    create_pdf(
        prediction,
        analysis_type,
        conf,
        description,
        location,
        report_data,
        pdf_filename=f"diagnosis_report_{id}.pdf"
    )
    
    # Return the link to download the PDF
    report_status[id]["status"] = "completed"
    report_status[id]["report_url"] = f"/pdf/{id}"

    print(f"Report generated {id}");


# -------------------
# Endpoints
# -------------------
@app.post("/analyze-skin")
async def analyze_skin(
    file: UploadFile = File(...),
    id: str = Form(...),
    description: str = Form(""),
    location: str = Form(""),
    background_tasks: BackgroundTasks = BackgroundTasks()
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
        prediction = id2label[top_idx] if id2label else f"class_{top_idx}"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {e}")

    annotated = annotate_image(pil, prediction, top_conf)
    annotated_b64 = pil_to_base64(annotated)

    report_status[id] = {"status": "processing", "report_url": None}

    # Trigger report generation in the background
    background_tasks.add_task(generate_report, id, prediction, top_conf, description, location, "Skin Examination")

    return JSONResponse(content={
        "id": id,
        "model_id": HF_IMAGE_MODEL_ID,
        "prediction": prediction,
        "confidence": top_conf,
        "annotated_image": annotated_b64,
    })

@app.post("/analyze-wound")
async def analyze_wound(
    file: UploadFile = File(...),
    id: str = Form(...),
    description: str = Form(""),
    location: str = Form("")
):
    try:
        contents = await file.read()
        pil = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image upload: {e}")

    try:
        inputs = wound_processor(images=pil, return_tensors="pt").to(DEVICE)
        with torch.no_grad():
            outputs = wound_model(**inputs)
            logits = outputs.logits.cpu().squeeze(0)
        top_idx = int(torch.argmax(logits).item())
        top_conf = float(torch.softmax(logits, dim=0)[top_idx].item())
        label_name = id2label_wound[top_idx] if id2label_wound else f"class_{top_idx}"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Wound image analysis failed: {e}")

    annotated = annotate_image(pil, label_name, top_conf)
    annotated_b64 = pil_to_base64(annotated)
    # report_data, report_url = generate_report(id, label_name, top_conf, description, location, "wound")

    return JSONResponse(content={
        "id": id,
        "model_id": HF_WOUND_MODEL_ID,
        "prediction": label_name,
        "confidence": top_conf,
        "annotated_image": annotated_b64,
        # "report": report_data,
        # "report_url": report_url
    })

@app.post("/analyze-eye")
async def analyze_eye(
    file: UploadFile = File(...),
    id: str = Form(...),
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
    # report_data, report_url = generate_report(id, pred_label, pred_conf, description, location, "eye")

    return JSONResponse(content={
        "id": id,
        "prediction": pred_label,
        "confidence": pred_conf,
        "annotated_image": annotated_b64,
        # "report": report_data,
        # "report_url": report_url
    })

@app.get("/check-report-status/{id}")
async def check_report_status(id: str):
    # Return the current status of the report
    if id not in report_status:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return report_status[id]


@app.get("/pdf/{id}")
async def download_report(id: str):
    # # Ensure the report is ready
    if id not in report_status or report_status[id]["status"] != "completed":
        raise HTTPException(status_code=404, detail="Report not ready or not found")

    pdf_path = f"./pdf_reports/diagnosis_report_{id}.pdf"
    
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="Report file not found")
    
    return FileResponse(pdf_path, media_type="application/pdf", filename=f"diagnosis_report_{id}.pdf")


@app.post("/chat")
def chat(prompt: str):
    # The prompt comes directly as the user's input, so we create the message list accordingly
    messages = [{"role": "user", "content": prompt}]
    
    # Extract only the 'content' field from the messages to feed into the tokenizer
    inputs = tokenizer([msg["content"] for msg in messages], return_tensors="pt", padding=True, truncation=True).to(llm_model.device)
    
    outputs = llm_model.generate(
        **inputs,
        max_new_tokens=40,
        do_sample=True,  # Optional, makes output more diverse
        eos_token_id=tokenizer.eos_token_id
    )

    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    return {"response": response}

