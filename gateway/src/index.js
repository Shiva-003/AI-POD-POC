import express from 'express';
import multer from 'multer';
import axios from 'axios';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid'; 
import cors from 'cors';
import FormData from 'form-data';
import errorHandling from './middlewares/errorHandler.js';
import { randomBytes } from 'crypto';
import cookieParser from 'cookie-parser';

import pool from './config/db.js';
import { createUserTable } from './models/userModel.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';

const IMAGE_SERVICE = process.env.IMAGE_SERVICE_URL || 'http://localhost:8000';
const port = process.env.port || 3000;
const upload = multer({ dest: '/tmp/uploads' });

// Uncomment this to generate a key for jwt
// console.log("Key", randomBytes(64).toString('hex'));

const app = express();
app.use(express.json());
app.use(cookieParser());

// Allow React frontend
const allowedOrigins = ['http://localhost:5173']
app.use(cors({origin: allowedOrigins, credentials: true}));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

// Error handling middleware
app.use(errorHandling);

// Create table before starting server
createUserTable();

// Testing POSTGRES Connection
app.get('/', async (req, res) => {
    const result = await pool.query("SELECT current_database()");
    res.send(`The database name is: ${result.rows[0].current_database}`);
})


// app.post('/analyze-skin', upload.single('image'), async (req, res) => {
//   const jobId = uuidv4();
//   const imagePath = req.file.path;
//   const description = req.body.description || '';
//   const location = req.body.location || '';

//   try {
//     // Prepare form-data for FastAPI
//     const form = new FormData();
//     form.append('file', fs.createReadStream(imagePath));
//     form.append('job_id', jobId);
//     form.append('description', description);
//     form.append('location', location);

//     // Send to FastAPI (which now returns both classification + report)
//     const imgResp = await axios.post(`${IMAGE_SERVICE}/analyze-skin`, form, {
//       headers: form.getHeaders(),
//       timeout: 120000
//     });

//     const result = imgResp.data;

//     // Directly send everything back to frontend
//     res.json({
//       job_id: jobId,
//       label: result.label,
//       confidence: result.confidence,
//       annotated_image: result.annotated_image, // base64 image
//       report: result.report, // LLM JSON string
//       report_url: result.report_url
//     });

//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     res.status(500).json({ error: 'Analysis failed', detail: err.message });
//   } finally {
//     // Cleanup uploaded file
//     try {
//       if (req.file) fs.unlinkSync(req.file.path);
//     } catch (e) {
//       /* ignore */
//     }
//   }
// });

// // ------------------
// // Eye Disease API
// // ------------------
// app.post('/analyze-eye', upload.single('image'), async (req, res) => {
//   const jobId = uuidv4();
//   const imagePath = req.file.path;
//   const description = req.body.description || '';

//   try {
//     const form = new FormData();
//     form.append('file', fs.createReadStream(imagePath));
//     form.append('job_id', jobId);
//     form.append('description', description);

//     const imgResp = await axios.post(`${IMAGE_SERVICE}/analyze-eye`, form, {
//       headers: form.getHeaders(),
//       timeout: 120000
//     });

//     const result = imgResp.data;

//     res.json({
//       job_id: jobId,
//       label: result.label,
//       confidence: result.confidence,
//       annotated_image: result.annotated_image,
//       report: result.report,
//       report_url: result.report_url
//     });

//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     res.status(500).json({ error: 'Eye analysis failed', detail: err.message });
//   } finally {
//     try { if (req.file) fs.unlinkSync(req.file.path); } catch (e) {}
//   }
// });

// // ------------------
// // Wound Monitoring API
// // ------------------
// app.post('/analyze-wound', upload.single('image'), async (req, res) => {
//   const jobId = uuidv4();
//   const imagePath = req.file.path;
//   const description = req.body.description || '';

//   try {
//     const form = new FormData();
//     form.append('file', fs.createReadStream(imagePath));
//     form.append('job_id', jobId);
//     form.append('description', description);

//     const imgResp = await axios.post(`${IMAGE_SERVICE}/analyze-wound`, form, {
//       headers: form.getHeaders(),
//       timeout: 120000
//     });

//     const result = imgResp.data;

//     res.json({
//       job_id: jobId,
//       label: result.label,
//       confidence: result.confidence,
//       annotated_image: result.annotated_image,
//       report: result.report,
//       report_url: result.report_url
//     });

//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     res.status(500).json({ error: 'Wound analysis failed', detail: err.message });
//   } finally {
//     try { if (req.file) fs.unlinkSync(req.file.path); } catch (e) {}
//   }
// });

// app.get('/check-report-status/:jobId', async (req, res) => {
//   const { jobId } = req.params;

//   try {
//     const statusResp = await axios.get(`${IMAGE_SERVICE}/check-report-status/${jobId}`);
//     res.json(statusResp.data);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Error fetching report status', detail: err.message });
//   }
// });


// // Gateway - Download report endpoint
// app.get('/download-report/:jobId', async (req, res) => {
//   const { jobId } = req.params;

//   try {
//     // Forward the download request to the FastAPI server
//     const response = await axios.get(`http://localhost:8000/pdf/${jobId}`, { responseType: 'arraybuffer' });

//     // Set headers to tell the browser it's a PDF
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=diagnosis_report_${jobId}.pdf`);

//     // Send the file back to the client
//     res.send(response.data);

//   } catch (error) {
//     console.error('Error downloading report:', error.message);
//     res.status(500).json({ error: 'Failed to download the report.' });
//   }
// });


app.listen(port, () => console.log('Gateway listening on :3000'));
