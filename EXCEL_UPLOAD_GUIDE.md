# 📊 Bulk Upload - Step by Step Guide

## ✅ What Was Fixed

1. **Better Error Messages** - Now shows exactly what's wrong
2. **Only Required Fields** - Frontend sends only essential data
3. **Clearer Validation** - Shows missing columns in Excel
4. **Improved Error Display** - No more "Object" errors

---

## 📋 Required Fields (MUST HAVE)

Your Excel file **MUST** have these 3 columns:

| Column Name | Aliases | Example | Required |
|------------|---------|---------|----------|
| **full_name** | full name, name, fullname, Client Name, client name | John Smith | ✅ YES |
| **E_mail** | email, Email, e_mail, Email Address, Email ID | john@example.com | ✅ YES |
| **Phone_number** | phone_number, phone, Phone Number, contact_number, Contact Number, mobile, Mobile | 9876543210 | ✅ YES |

---

## 📝 Optional Fields (Nice to Have)

These columns are optional but helpful:

| Column Name | Aliases | Example |
|------------|---------|---------|
| **event_type** | event_name, wedding_type, Event Name | Wedding |
| **budget** | package, Budget, Overall Budget | 100000 |
| **event_date** | date, wedding_date, Event Date | 2026-12-25 |
| **address** | location, wedding_location | Mumbai |

---

## 🎯 Step-by-Step Upload Process

### Step 1: Prepare Your Excel File

Create an Excel file with columns:

```
| full_name     | E_mail            | Phone_number | event_type | budget  | event_date |
|---------------|-------------------|--------------|-----------|---------|------------|
| John Smith    | john@example.com  | 9876543210   | Wedding   | 100000  | 2026-12-25 |
| Sarah Johnson | sarah@example.com | 9765432109   | Birthday  | 50000   | 2026-11-15 |
| Mike Brown    | mike@example.com  | 9654321098   | Corporate | 200000  | 2026-10-30 |
```

### Step 2: Save the File

- **Format:** `.xlsx` (Excel) or `.csv`
- **Name:** `leads.xlsx` or anything you like
- **Location:** Anywhere on your computer

### Step 3: Go to Admin Panel

1. Open the application
2. Login as **admin@redangle.com** / **Admin@123**
3. Go to **Leads Management** → **View Leads**

### Step 4: Click Bulk Upload

1. Look for **"Bulk Upload"** button
2. Click it
3. Select your Excel file

### Step 5: Wait for Results

You'll see one of these messages:

✅ **Success**: "Bulk upload successful 🎉 (5 leads added)"

⚠️ **Partial Success**: "3 leads created, 2 failed - Row 2: Missing email, Row 4: Duplicate Lead ID"

❌ **Error**: Shows exactly what's wrong

---

## 🔍 Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| **Required Fields Error: Missing full_name** | No name column in Excel | Add a column named "full_name" or "name" |
| **Required Fields Error: Missing E_mail** | No email column | Add a column named "E_mail" or "email" |
| **Required Fields Error: Missing Phone_number** | No phone column | Add a column named "Phone_number" or "phone" |
| **Network Error** | Server not running | Make sure backend is running on port 9000 |
| **Row 3: Invalid email** | Bad email format | Use format: name@domain.com |
| **Row 5: Lead ID already exists** | Duplicate custom ID | Use unique IDs or leave blank |

---

## 💡 Pro Tips

✅ **Tip 1:** Extra columns are ignored - safe to include other data  
✅ **Tip 2:** Empty rows are skipped - won't cause errors  
✅ **Tip 3:** Column names are case-insensitive - "Email", "email", "E_mail" all work  
✅ **Tip 4:** Phone numbers auto-format - no need to clean them  
✅ **Tip 5:** First successful leads go to the system immediately  

---

## 🚀 Testing Your Upload

### Test File 1 (Simple - Should Work)

```csv
full_name,E_mail,Phone_number
John Smith,john@test.com,9876543210
Sarah Johnson,sarah@test.com,9765432109
```

### Test File 2 (With Optional Fields)

```csv
full_name,E_mail,Phone_number,event_type,budget,event_date
Wedding Lead,wedding@test.com,9876543210,Wedding,100000,2026-12-25
Birthday Lead,birthday@test.com,9765432109,Birthday,50000,2026-11-15
```

---

## 🛠️ Troubleshooting

**Problem:** Getting "Bad Request" error  
**Solution:** Check that your Excel has the 3 required columns with correct names

**Problem:** Only some rows uploaded  
**Solution:** System skips rows with missing required fields - check console for warnings

**Problem:** Can't find Bulk Upload button  
**Solution:** Make sure you're logged in as admin and in the Leads page

---

## 📊 Sample Data Download

You can use this exact CSV to test:

```
full_name,E_mail,Phone_number,event_type,budget,event_date,address
Test User 1,test1@redangle.com,9999999991,Wedding,150000,2026-12-25,Mumbai
Test User 2,test2@redangle.com,9999999992,Birthday,50000,2026-11-15,Delhi
Test User 3,test3@redangle.com,9999999993,Corporate,250000,2026-10-30,Bangalore
```

---

## ✨ Features After Upload

- ✅ Leads appear in the system immediately
- ✅ Can assign to employees
- ✅ Can create quotations
- ✅ Can track in Kanban board
- ✅ Full access to all lead features

---

**Ready to upload?** Follow the steps above and your leads will be in the system! 🎉
