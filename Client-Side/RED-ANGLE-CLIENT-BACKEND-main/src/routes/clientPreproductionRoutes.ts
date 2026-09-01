import { Router } from 'express';
import { 
    submitPreproductionRequirements, 
    approveRawDataController, 
    getRawDataLinksController,
    approveFinalDeliveryController,
    rejectFinalDeliveryController
} from '../controller/clientPreproductionController';

const router = Router();

router.get('/raw-data-links', getRawDataLinksController);
router.post('/requirements', submitPreproductionRequirements);
router.post('/approve-raw-data', approveRawDataController);
router.post('/approve-final-delivery', approveFinalDeliveryController);
router.post('/reject-final-delivery', rejectFinalDeliveryController);

export default router;
