import express from "express";
import { generateProfessionalReportAction } from "../actions/export/exportActions.js";
import { 
  generateDoctorFormDataAction,
  updateDoctorFormCacheAction 
} from "../actions/export/doctorFormActions.js";
import { AppError } from "server/types/logsApi.js";

const router = express.Router();

router.get("/professional", async (req: express.Request, res: express.Response) => {
  const { patientId, dateA, dateB } = req.query;

  if (!patientId || !dateA || !dateB) {
    return res.status(400).json({ success: false, error: "Missing required parameters" });
  }

  try {
    const result = await generateProfessionalReportAction(
      patientId as string,
      dateA as string,
      dateB as string
    );
    res.json(result);
  } catch (err: unknown) {
    const error = err as AppError;
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/doctor-form", async (req: express.Request, res: express.Response) => {
  const { patientId } = req.query;

  if (!patientId) {
    return res.status(400).json({ success: false, error: "Missing required parameter: patientId" });
  }

  try {
    const result = await generateDoctorFormDataAction(patientId as string);
    res.json(result);
  } catch (err: unknown) {
    const error = err as AppError;
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/doctor-form", async (req: express.Request, res: express.Response) => {
  const { patientId, data } = req.body;

  if (!patientId || !data) {
    return res.status(400).json({ success: false, error: "Missing required parameters: patientId or data" });
  }

  try {
    const result = await updateDoctorFormCacheAction(patientId as string, data);
    res.json(result);
  } catch (err: unknown) {
    const error = err as AppError;
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
