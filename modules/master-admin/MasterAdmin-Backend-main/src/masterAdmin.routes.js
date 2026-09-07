const express = require('express')
const service = require('./masterAdmin.service')

const router = express.Router()
const filters = req => ({
  flowType: req.query.flowType,
  phase: req.query.phase,
  status: req.query.status,
  search: req.query.search,
})

const wrap = action => async (req, res) => {
  try {
    const data = await action(req)
    if (data === null) return res.status(404).json({ success: false, message: 'Not found' })
    return res.json({ success: true, data })
  } catch (error) {
    console.error('MASTER ADMIN API ERROR:', error)
    return res.status(500).json({ success: false, message: error.message || 'Master Admin request failed' })
  }
}

router.get('/sales/dashboard', wrap(() => service.getDashboard()))
router.get('/sales/clients', wrap(req => service.getClients(filters(req))))
router.get('/sales/clients/:clientId', wrap(req => service.getClient(req.params.clientId)))
router.get('/sales/clients/:clientId/employees', wrap(req => service.getClientEmployees(req.params.clientId)))
router.get('/sales/clients/:clientId/work-tracker', wrap(req => service.getWorkTracker({}, req.params.clientId)))
router.get('/sales/clients/:clientId/invoice', wrap(req => service.getInvoices({}, req.params.clientId)))
router.get('/sales/clients/:clientId/attendance', wrap(req => service.getAttendance({}, req.params.clientId)))
router.get('/sales/clients/:clientId/report', wrap(req => service.getClientReport(req.params.clientId)))
router.get('/sales/employees', wrap(req => service.getEmployees(filters(req))))
router.get('/sales/work-tracker', wrap(req => service.getWorkTracker(filters(req))))
router.get('/sales/invoices', wrap(req => service.getInvoices(filters(req))))
router.get('/sales/attendance', wrap(req => service.getAttendance(filters(req))))
router.get('/sales/reports', wrap(req => service.getReports(filters(req))))
router.get('/sales/employees/:employeeId', wrap(req => service.getEmployee(req.params.employeeId)))
router.put('/sales/employees/:employeeId', wrap(req => service.updateEmployee(req.params.employeeId, req.body)))
router.delete('/sales/employees/:employeeId', wrap(async req => {
  const deleted = await service.deleteEmployee(req.params.employeeId)
  return deleted ? { deleted: true } : null
}))
router.get('/sales/clients/:clientId/invoice-detail', wrap(req => service.getClientInvoiceDetail(req.params.clientId)))
router.get('/sales/notifications', wrap(req => service.getNotifications(filters(req))))
router.put('/sales/notifications/read-all', wrap(req => service.markAllNotificationsRead()))
router.put('/sales/notifications/:id/read', wrap(req => service.markNotificationRead(req.params.id)))
router.delete('/sales/notifications', wrap(req => service.clearNotifications()))

module.exports = router
