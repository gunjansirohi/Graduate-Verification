// routes/nationalIDRoutes.js
import express from 'express';
import multer from 'multer';
import { createNationalID, getAllNationalId, getNationalIdByFIN, getNationalIDByName, searchNationalIDs, uploadNationalIDsExcel } from '../controllers/nationalIDController.js';
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.mimetype === 'application/vnd.ms-excel'
  ) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Excel files only!'), false); 
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

router.post('/', createNationalID);
router.get('/', getAllNationalId)
router.get('/search', searchNationalIDs);
router.get('/:nationalIdNumber', getNationalIdByFIN)
router.get('/search/name', getNationalIDByName); // Search by name (first, middle, last)
router.post('/upload-excel', upload.single('file'), uploadNationalIDsExcel);

export default router;