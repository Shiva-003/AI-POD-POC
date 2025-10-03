import pool from '../config/db.js';
import handleResponse from '../utils/responseHandler.js';
import { v4 } from 'uuid';
import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';

const IMAGE_SERVICE = process.env.IMAGE_SERVICE_URL || 'http://localhost:8000';

export const getUserData = async (req, res, next) => {
	try {
		const { email } = req.user;

		const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [
			email,
		]);

		if (userQuery.rows.length === 0) {
			return handleResponse(res, 401, 'Invalid credentials');
		}

		const user = userQuery.rows[0];

		return handleResponse(res, 200, '', {
			name: user.name,
			email: user.email,
			isVerified: user.is_verified,
		});
	} catch (error) {
		next(error);
	}
};

export const analyzeSkinDisease = async (req, res, next) => {
	const userId = req.user.id;
	const id = v4();
	const fileBuffer = req.file.buffer;
	const mimeType = req.file.mimetype;
	const originalName = req.file.originalname;
	const description = req.body.description || '';
	const location = req.body.location || '';
	const imageType = 'Skin';

	try {
		// Write temp file for FastAPI
		const tempPath = `./temp/temp_${id}.tmp`;
		fs.writeFileSync(tempPath, fileBuffer);

		// Call FastAPI
		const form = new FormData();
		form.append('id', id);
		form.append('file', fs.createReadStream(tempPath));
		form.append('description', description);
		form.append('location', location);

		const imgResp = await axios.post(`${IMAGE_SERVICE}/analyze-skin`, form, {
			headers: form.getHeaders(),
			timeout: 120000,
		});

		const result = imgResp.data;
		fs.unlinkSync(tempPath); // cleanup

		// Insert into DB with user_id
		await pool.query(
			`INSERT INTO history
            (id, user_id, image, content_type, original_name, description, location, prediction, confidence, image_type)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
			[
				id,
				userId,
				fileBuffer,
				mimeType,
				originalName,
				description,
				location,
				result.prediction,
				result.confidence,
				imageType,
			]
		);
	
		handleResponse(res, 200, '', {
			id: id,
			prediction: result.prediction,
			confidence: result.confidence,
			annotated_image: result.annotated_image,
			report: result.report,
			report_url: result.report_url,
		});
	} catch (error) {
		console.error('Analysis error:', error.response?.data || error.message);
		next(error);
	}
};

export const analyzeEyeDisease = async (req, res, next) => {
	const userId = req.user.id;

	const id = v4();
	const fileBuffer = req.file.buffer;
	const mimeType = req.file.mimetype;
	const originalName = req.file.originalName;
	const description = req.body.description || '';
	const imageType = 'Eye';

	try {
		//Write temp file for fastAPI
		const tempPath = `./temp/temp_${id}.tmp`;
		fs.writeFileSync(tempPath, fileBuffer);

		//Call FastAPI
		const form = new FormData();
		form.append('id', id);
		form.append('file', fs.createReadStream(tempPath));
		form.append('description', description);

		const imgResp = await axios.post(`${IMAGE_SERVICE}/analyze-eye`, form, {
			headers: form.getHeaders(),
			timeout: 120000,
		});

		const result = imgResp.data;
		fs.unlinkSync(tempPath); // cleanup

		// Insert into DB with user_id
		await pool.query(
			`INSERT into history(id, user_id, image, content_type, original_name, description, prediction, confidence, image_type)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
			[
				id,
				userId,
				fileBuffer,
				mimeType,
				originalName,
				description,
				result.prediction,
				result.confidence,
				imageType
			]
		);

		handleResponse(res, 200, '', {
			id: id,
			prediction: result.prediction,
			confidence: result.confidence,
			annotated_image: result.annotated_image,
			report: result.report,
			report_url: result.report_url,
		});
	} catch (error) {
		console.error('Analysis error:', error.response?.data || error.message);
		next(error);
	}
};

export const monitorWound = async (req, res, next) => {
	const userId = req.user.id;
	const id = v4();
	const fileBuffer = req.file.buffer;
	const mimeType = req.file.mimetype;
	const originalName = req.file.originalName;
	const description = req.body.description || '';
	const imageType = 'Wound';

	try {
		// Create temp path
		const tempPath = `./temp/temp_${id}.tmp`;
		fs.writeFileSync(tempPath, fileBuffer);

		// Call FastAPI
		const form = new FormData();
		form.append('id', id);
		form.append('file', fs.createReadStream(tempPath));
		form.append('description', description);

		const imgResp = await axios.post(`${IMAGE_SERVICE}/analyze-wound`, form, {
			headers: form.getHeaders(),
			timeout: 120000,
		});

		const result = imgResp.data;
		fs.unlinkSync(tempPath); //cleanup

		// Insert into DB with user_id
		await pool.query(
			`
			INSERT into history(id, user_id, image, content_type, original_name, description, prediction, confidence, image_type)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
			[
				id,
				userId,
				fileBuffer,
				mimeType,
				originalName,
				description,
				result.prediction,
				result.confidence,
				imageType
			]
		);

		handleResponse(res, 200, '', {
			id: id,
			prediction: result.prediction,
			confidence: result.confidence,
			annotated_image: result.annotated_image,
			report: result.report,
			report_url: result.report_url,
		});
	} catch (error) {
		console.error('Analysis error:', error.response?.data || error.message);
		next(error);
	}
};

export const checkReportStatus = async (req, res, next) => {
	const { id } = req.params;

	try {
		const statusResp = await axios.get(
			`${IMAGE_SERVICE}/check-report-status/${id}`
		);

		handleResponse(res, 200, '', statusResp.data);
	} catch (error) {
		console.error('Error checking report:', err);
		next(error);
	}
};

export const downloadReport = async (req, res, next) => {
	const { id } = req.params;

	try {
		// Forward the download request to the FastAPI server
		const response = await axios.get(`http://localhost:8000/pdf/${id}`, {
			responseType: 'arraybuffer',
		});

		// Set headers to tell the browser it's a PDF
		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader(
			'Content-Disposition',
			`attachment; filename=diagnosis_report_${id}.pdf`
		);

		// Send the file back to the client
		handleResponse(res, 200, '', response.data);
	} catch (error) {
		console.error('Error downloading report:', error.message);
		next(error);
	}
};

export const getUserHistory = async (req, res, next) => {
	const userId = req.user.id;
	const pageNumber = Number(req.query.pageNumber) || 1;
	const pageSize = Number(req.query.pageSize) || 4;

	const offset = (pageNumber - 1) * pageSize;

	try {
		// Query 1: Get paginated data
		const dataResult = await pool.query(
			`
			SELECT *
			FROM history
			WHERE user_id = $1
			ORDER BY created_at DESC
			LIMIT $2 OFFSET $3
			`,
			[userId, pageSize, offset]
		);

		const rows = dataResult.rows;

		// Query 2: Get total count (no limit/offset)
		const countResult = await pool.query(
			`SELECT COUNT(*) FROM history WHERE user_id = $1`,
			[userId]
		);
		const totalCount = parseInt(countResult.rows[0].count, 10);

		// Format each row: convert buffer to base64 image string
		const formattedData = rows.map((item) => {
			const base64Image = item.image?.toString('base64') || '';
			const imageSrc = base64Image
				? `data:${item.content_type};base64,${base64Image}`
				: null;

			return {
				...item,
				image: imageSrc, // base64 data URI string
			};
		});

		// Send the response back with paginated data
		handleResponse(res, 200, '', {
			data: formattedData,
			pageNumber,
			pageSize,
			totalCount,
		});
	} catch (error) {
		console.error('Error getting history', error);
		next(error);
	}
};
