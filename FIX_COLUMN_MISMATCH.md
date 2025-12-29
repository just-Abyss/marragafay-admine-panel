# 🔧 FIXING THE COLUMN NAME MISMATCH

## ❌ Problem Found

**Your Database Has:** `activity_name`  
**Your Code Expects:** `name`

This is why the pages are empty!

---

## ✅ Solution (Choose One)

### **Option 1: Update Database (RECOMMENDED)**

**Why:** Simpler column name, easier to work with

**How:**
1. Go to your Supabase SQL Editor
2. Run this command:
```sql
ALTER TABLE pricing 
RENAME COLUMN activity_name TO name;
```

**Result:** Your database will match the code ✅

---

### **Option 2: Update Code**

**Why:** Keep your current database as-is

**How:** I'll update all the code files to use `activity_name` instead of `name`

**Files to update:**
- `app/dashboard/packages/page.tsx`
- `app/dashboard/activities/page.tsx`
- `components/bookings/booking-form-dialog.tsx`
- `components/bookings/booking-drawer.tsx`

---

## 🎯 My Recommendation

**Go with Option 1** - Rename the database column to `name`

**Reasons:**
1. ✅ Cleaner, simpler name
2. ✅ Code is already done
3. ✅ Just one SQL command
4. ✅ More standard naming convention

---

## 🚀 Quick Fix (Option 1)

**Step 1:** Go to Supabase Dashboard  
**Step 2:** Open SQL Editor  
**Step 3:** Run this:

```sql
ALTER TABLE pricing 
RENAME COLUMN activity_name TO name;
```

**Step 4:** Refresh your dashboard  
**Step 5:** ✅ Everything works!

---

## 📝 Full Migration Script

I've created `migrate_to_name.sql` with the complete migration.

Just run it in Supabase SQL Editor!

---

**Which option do you prefer?**
- Option 1: Rename database column (1 SQL command)
- Option 2: Update all code files (4 files to change)

Let me know and I'll help you complete it!
