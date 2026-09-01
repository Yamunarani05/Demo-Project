# 📊 Excel Bulk Upload Guide

## ✅ Required Columns (Must Have)

These 3 columns are **REQUIRED**:

1. **full_name** (or: full name, fullname, name, Client Name)
   - Example: "John Smith"
   - Will be split into firstName and lastName
   - ⚠️ Required

2. **E_mail** (or: e_mail, email, Email, Email Address, Email ID)
   - Example: "john@example.com"
   - Must be valid email format
   - ⚠️ Required

3. **Phone_number** (or: phone_number, Phone Number, phone, Mobile, Contact Number, contact_number)
   - Example: "9876543210"
   - Will auto-clean formatting
   - ⚠️ Required

---

## 📋 Optional Columns

These columns are optional but helpful:

| Column Name | Examples | Description |
|------------|----------|-------------|
| **event_type** or **event_name** | Wedding, Birthday, Corporate | Type of event |
| **budget** or **package** | 50000, Premium Package | Budget or package name |
| **event_date** | 2026-12-25, 25-12-2026 | Event date |
| **address** or **location** | "123 Main St, City" | Event location |
| **lead_type** | LD, EV, WD | Lead type (default: LD) |
| **lead_id** or **Lead ID** | CUSTOM-001 | Custom lead ID |

---

## 📝 Example Excel Format

```
| full_name        | E_mail              | Phone_number | event_type | budget | event_date | address         |
|------------------|---------------------|--------------|-----------|--------|------------|-----------------|
| John Smith       | john@example.com    | 9876543210   | Wedding   | 100000 | 2026-12-25 | Mumbai          |
| Sarah Johnson    | sarah@example.com   | 9765432109   | Birthday  | 50000  | 2026-11-15 | Delhi           |
| Mike Brown       | mike@example.com    | 9654321098   | Corporate | 200000 | 2026-10-30 | Bangalore       |
| Emma Davis       | emma@example.com    | 9543210987   | Wedding   | 150000 | 2026-09-20 | Chennai         |
```

---

## 🔑 Column Name Aliases (System Will Auto-Detect)

The system is **flexible** and recognizes these aliases:

### Full Name Column Aliases:
- `full_name`, `full name`, `fullname`, `name`, `customer_name`, `client_name`, `Client Name`

### Email Column Aliases:
- `E_mail`, `e_mail`, `email`, `Email`, `Email Address`, `email_address`, `Email ID`, `email id`

### Phone Column Aliases:
- `Phone_number`, `phone_number`, `Phone Number`, `phone`, `Mobile`, `mobile`, `Contact Number`, `contact_number`, `contactnumber`, `Contact`, `contact`

### Event Type Aliases:
- `what_type_of_your_wedding?`, `event_type`, `eventtype`, `wedding_type`, `Event Name`, `event_name`, `event_name`

### Budget Aliases:
- `choose_your_package?`, `package`, `budget`, `Package`, `Overall Budget`, `overall budget`

### Date Aliases:
- `enter_event_date_&_month`, `event_date`, `date`, `wedding_date`, `Event Date`, `event date`

### Address Aliases:
- `enter_your_wedding_location`, `address`, `location`, `wedding_location`

---

## ✨ How to Upload

1. **Prepare your Excel file** following the format above
2. **Go to Admin Panel** → Leads Management
3. **Click "Bulk Upload"** button
4. **Select your Excel file** (.xlsx or .csv)
5. **Wait for confirmation** - You'll see:
   - ✅ Success count
   - ❌ Failed rows (if any)
   - 📋 Error details for each failed row

---

## ⚠️ Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **"Missing required fields"** | Ensure you have full_name, E_mail, and Phone_number columns |
| **"Invalid email"** | Check email format (example@domain.com) |
| **"Phone format error"** | Use only digits without special characters |
| **"Lead ID already exists"** | That lead ID is already in the system |
| **Empty rows** | System will skip completely empty rows |

---

## 💡 Tips

✅ **Excel Tip 1:** Use `xlsx` format (newer Excel) for best compatibility  
✅ **Excel Tip 2:** Don't leave required columns empty  
✅ **Tip 3:** The system auto-cleans phone numbers (removes dots, E+11 formatting)  
✅ **Tip 4:** You can use either column alias names - the system detects them all  
✅ **Tip 5:** Extra columns will be ignored (safe to include other data)  

---

## 📊 Sample CSV Format (Alternative)

If using CSV instead of Excel:

```csv
full_name,E_mail,Phone_number,event_type,budget,event_date,address
John Smith,john@example.com,9876543210,Wedding,100000,2026-12-25,Mumbai
Sarah Johnson,sarah@example.com,9765432109,Birthday,50000,2026-11-15,Delhi
```

---

## 🚀 Ready to Upload?

1. Create your Excel file using the template above
2. Save as `.xlsx` or `.csv`
3. Upload through the admin panel
4. Check the results for any errors

**Need help?** Share your Excel file or error message, and I can help debug! 📧
