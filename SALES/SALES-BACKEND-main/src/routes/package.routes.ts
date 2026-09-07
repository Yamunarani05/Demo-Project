import { Router } from "express";
import packageController from "../controller/packageController";
import { packageUpload } from "../config/packageUpload";

const router = Router();

router.get("/packages", packageController.getAll);
router.post(
  "/packages",
  packageUpload.single("image"),
  packageController.create
);
router.put(
  "/packages/:id",
  packageUpload.single("image"),
  packageController.update
);
router.delete("/packages/:id", packageController.delete);


export default router;
