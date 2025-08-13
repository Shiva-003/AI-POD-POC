const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const FormData = require('form-data');

const upload = multer({ dest: '/tmp/uploads' });
const app = express();
app.use(cors());
app.use(express.json());

const IMAGE_SERVICE = process.env.IMAGE_SERVICE_URL || 'http://localhost:8000';

// Allow React frontend
app.use(cors({ origin: "*" }));

app.post('/analyze', upload.single('image'), async (req, res) => {
  const jobId = uuidv4();
  const imagePath = req.file.path;
  const description = req.body.description || '';
  const location = req.body.location || '';

  try {
    // Prepare form-data for FastAPI
    const form = new FormData();
    form.append('file', fs.createReadStream(imagePath));
    form.append('job_id', jobId);
    form.append('description', description);
    form.append('location', location);

    // Send to FastAPI (which now returns both classification + report)
    const imgResp = await axios.post(`${IMAGE_SERVICE}/analyze`, form, {
      headers: form.getHeaders(),
      timeout: 120000
    });

    const result = imgResp.data;

    // Directly send everything back to frontend
    res.json({
      job_id: jobId,
      label: result.label,
      confidence: result.confidence,
      annotated_image: result.annotated_image, // base64 image
      report: result.report, // LLM JSON string
      report_url: result.report_url
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Analysis failed', detail: err.message });
  } finally {
    // Cleanup uploaded file
    try {
      if (req.file) fs.unlinkSync(req.file.path);
    } catch (e) {
      /* ignore */
    }
  }
});

app.listen(3000, () => console.log('Gateway listening on :3000'));
