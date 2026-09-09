import http from 'http';
import app from '../src/app';

const PORT = 5001; // Independent test port

async function runTests() {
  console.log('🧪 Starting LUMINA Backend API Automated Test Suite...\n');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(PORT, resolve));

  let passed = 0;
  let failed = 0;

  async function request(path: string, options: { method?: string; body?: any; headers?: any } = {}) {
    const url = `http://localhost:${PORT}${path}`;
    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const res = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const json = await res.json().catch(() => ({}));
    return { status: res.status, json };
  }

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  let authToken = '';
  let createdClientId = '';
  let createdProjectId = '';

  try {
    // 1. Health check
    console.log('🔹 Test Suite 1: Health & Root Endpoints');
    const health = await request('/api/health');
    assert(health.status === 200 && health.json.status === 'HEALTHY', 'GET /api/health returns 200 HEALTHY');

    // 2. Authentication: Login
    console.log('\n🔹 Test Suite 2: Authentication & Authorization');
    const login = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'master@greatmaster.io', password: '123456789' },
    });
    assert(login.status === 200 && login.json.success === true, 'POST /api/auth/login validates Great Master credentials');
    authToken = login.json.data?.token || '';
    assert(!!authToken, 'JWT Token generated successfully');

    // 3. Current User Profile
    const me = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert(me.status === 200 && me.json.data?.user?.email === 'master@greatmaster.io', 'GET /api/auth/me returns authenticated user details');

    // 4. Invalid Login Handling
    const badLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'wrong@example.com', password: 'badpassword' },
    });
    assert(badLogin.status === 401 && badLogin.json.success === false, 'POST /api/auth/login returns 401 on invalid credentials');

    // 5. Dashboard Statistics
    console.log('\n🔹 Test Suite 3: Dashboard APIs');
    const stats = await request('/api/dashboard/stats');
    assert(stats.status === 200 && stats.json.success === true && typeof stats.json.data?.totalClients === 'number', 'GET /api/dashboard/stats returns real numeric KPI metrics');

    const revenue = await request('/api/dashboard/revenue');
    assert(revenue.status === 200 && Array.isArray(revenue.json.data?.monthly), 'GET /api/dashboard/revenue returns monthly revenue dataset');

    // 6. Client Management
    console.log('\n🔹 Test Suite 4: Client CRUD');
    const clients = await request('/api/clients?page=1&limit=5');
    assert(clients.status === 200 && Array.isArray(clients.json.data), 'GET /api/clients returns paginated client list');

    const newClient = await request('/api/clients', {
      method: 'POST',
      body: {
        name: 'Test Client Automation',
        email: `test.${Date.now()}@automation.io`,
        phone: '+91 99999 88888',
        budget: 180000,
        eventType: 'Destination Wedding',
      },
    });
    assert(newClient.status === 201 && newClient.json.success === true, 'POST /api/clients creates new client and returns 201');
    createdClientId = newClient.json.data?.id;

    // 7. Photography Projects
    console.log('\n🔹 Test Suite 5: Photography Projects CRUD');
    const projects = await request('/api/projects');
    assert(projects.status === 200 && Array.isArray(projects.json.data), 'GET /api/projects returns photography projects list');

    const newProject = await request('/api/projects', {
      method: 'POST',
      body: {
        clientId: createdClientId,
        projectName: 'Automated Royal Wedding',
        projectType: 'Wedding',
        eventDate: '2026-11-20',
        budget: 200000,
        status: 'LEAD',
      },
    });
    assert(newProject.status === 201 && newProject.json.success === true, 'POST /api/projects creates new project record');
    createdProjectId = newProject.json.data?.id;

    // 8. Sales Module
    console.log('\n🔹 Test Suite 6: Sales & Client Workspace');
    const salesOverview = await request('/api/sales/overview');
    assert(salesOverview.status === 200 && typeof salesOverview.json.data?.totalLeads === 'number', 'GET /api/sales/overview returns calculated pipeline metrics');

    const leads = await request('/api/sales/leads');
    assert(leads.status === 200 && Array.isArray(leads.json.data), 'GET /api/sales/leads returns sales leads array');

    const newLead = await request('/api/sales/leads', {
      method: 'POST',
      body: {
        clientName: 'Sunil & Riya',
        phone: '+91 98401 55667',
        email: 'sunil.riya@gmail.com',
        eventType: 'Pre-Wedding',
        estimatedBudget: 85000,
        status: 'To Do',
      },
    });
    assert(newLead.status === 201 && newLead.json.success === true, 'POST /api/sales/leads creates new lead');

    const quotations = await request('/api/sales/quotations');
    assert(quotations.status === 200 && Array.isArray(quotations.json.data), 'GET /api/sales/quotations returns quotations list');

    const invoices = await request('/api/sales/invoices');
    assert(invoices.status === 200 && Array.isArray(invoices.json.data), 'GET /api/sales/invoices returns invoices list');

    const attendance = await request('/api/sales/attendance');
    assert(attendance.status === 200 && Array.isArray(attendance.json.data), 'GET /api/sales/attendance returns attendance list');

    const approvals = await request('/api/sales/approvals');
    assert(approvals.status === 200 && Array.isArray(approvals.json.data), 'GET /api/sales/approvals returns approval items');

    // 9. Notifications
    console.log('\n🔹 Test Suite 7: Notifications & Activity Logs');
    const notifs = await request('/api/notifications');
    assert(notifs.status === 200 && Array.isArray(notifs.json.data), 'GET /api/notifications returns user notifications');

    const logs = await request('/api/activity-logs');
    assert(logs.status === 200 && Array.isArray(logs.json.data), 'GET /api/activity-logs returns audit activity logs');

    // 10. Consolidated Modules (Master-Admin, Production, Post-Production, Finance)
    console.log('\n🔹 Test Suite 8: Consolidated Architecture Modules');
    const masterAdmin = await request('/api/master-admin/dashboard');
    assert(masterAdmin.status === 200 && masterAdmin.json.success, 'GET /api/master-admin/dashboard returns master admin dashboard');

    const prodSchedules = await request('/api/production/schedules');
    assert(prodSchedules.status === 200 && prodSchedules.json.success, 'GET /api/production/schedules returns production schedules');

    const postProdTasks = await request('/api/post-production/tasks');
    assert(postProdTasks.status === 200 && postProdTasks.json.success, 'GET /api/post-production/tasks returns post-production tasks');

    const financeInvoices = await request('/api/finance/invoices');
    assert(financeInvoices.status === 200 && financeInvoices.json.success, 'GET /api/finance/invoices returns finance invoices');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
    console.log(`\n=======================================================`);
    console.log(`🏁 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`=======================================================\n`);
    if (failed > 0) process.exit(1);
  }
}

runTests();
