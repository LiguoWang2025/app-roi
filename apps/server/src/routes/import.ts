import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import fs from "node:fs";
import os from "node:os";
import { importCsv } from "../services/import/csvImporter";

const uploadMiddleware = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const allowed = ["text/csv", "application/vnd.ms-excel"];
    if (allowed.includes(file.mimetype) || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

function handleUpload(req: Request, res: Response, next: NextFunction) {
  uploadMiddleware.single("file")(req, res, (err: any) => {
    if (!err) return next();
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File too large (max 50 MB)"
        : (err.message ?? "Upload failed");
    res.status(400).json({ message });
  });
}

const router = Router();

router.post("/import", handleUpload, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res
        .status(400)
        .json({ message: 'No CSV file uploaded (field name: "file")' });
      return;
    }

    const collectionDate: string | undefined = req.body?.collection_date;
    const result = await importCsv(req.file.path, collectionDate);

    fs.unlink(req.file.path, () => {});

    res.json({
      imported: result.imported,
      collection_date: result.collectionDate,
      errors: result.errors,
    });
  } catch (err: any) {
    if (req.file) fs.unlink(req.file.path, () => {});
    console.error("Import failed1111:", err);
    res.status(500).json({ message: err.message ?? "Import failed" });
  }
});

export default router;
