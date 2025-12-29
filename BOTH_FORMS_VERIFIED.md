# ✅ Verification: Both Booking Forms Use Pricing Table

## 🎯 Confirmation

**BOTH** booking forms are now using the `pricing` table as the single source of truth!

---

## ✅ New Booking Dialog (`booking-form-dialog.tsx`)

### **Status: ✅ FULLY UPDATED**

**Data Fetch:**
```typescript
// ✅ Fetches from pricing table
const { data: pricingData } = await supabase
  .from('pricing')
  .select('id, name, price, type')        // Uses 'name' column
  .order('type', { ascending: false })   // packs first
  .order('name', { ascending: true })
```

**Dropdown Display:**
```tsx
<SelectContent>
  {/* Packages Group */}
  <SelectGroup>
    <SelectLabel>Packages</SelectLabel>
    {packages.map((item) => (
      <SelectItem key={item.id} value={item.name}>
        {item.name} - {item.price.toLocaleString()} MAD/person
      </SelectItem>
    ))}
  </SelectGroup>
  
  {/* Activities Group */}
  <SelectGroup>
    <SelectLabel>Activities</SelectLabel>
    {activities.map((item) => (
      <SelectItem key={item.id} value={item.name}>
        {item.name} - {item.price.toLocaleString()} MAD/person
      </SelectItem>
    ))}
  </SelectGroup>
</SelectContent>
```

**Price Calculation:**
```typescript
const handlePackageChange = (value: string) => {
  const selected = pricingItems.find(item => item.name === value)
  if (selected) {
    const totalPrice = selected.price * formData.guests  // ✅ Auto-calculates
    setFormData((prev) => ({
      ...prev,
      package_title: selected.name,
      total_price: totalPrice,
      remaining_balance: totalPrice - prev.amount_paid
    }))
  }
}

const handleGuestsChange = (guests: number) => {
  const selected = pricingItems.find(item => item.name === formData.package_title)
  const pricePerPerson = selected?.price || 0
  const totalPrice = pricePerPerson * guests  // ✅ Recalculates
  
  setFormData((prev) => ({
    ...prev,
    guests,
    total_price: totalPrice,
    remaining_balance: totalPrice - prev.amount_paid
  }))
}
```

---

## ✅ Edit Booking Drawer (`booking-drawer.tsx`)

### **Status: ✅ FULLY UPDATED**

**Data Fetch:**
```typescript
// ✅ Fetches pricing items (packages + activities)
const { data: pricingData } = await supabase
  .from('pricing')
  .select('id, name, price, type')
  .order('type', { ascending: false })  // packs first
  .order('name', { ascending: true })

setPricingItems(pricingData || [])
```

**Dropdown Display:**
```tsx
<SelectContent>
  {/* Packages Group */}
  {pricingItems.filter(item => item.type === 'pack').length > 0 && (
    <>
      <div className="px-2 py-1.5 text-xs font-semibold text-[#C19B76]">
        Packages
      </div>
      {pricingItems.filter(item => item.type === 'pack').map((item) => (
        <SelectItem key={item.id} value={item.name}>
          {item.name} - {item.price.toLocaleString()} MAD/person
        </SelectItem>
      ))}
    </>
  )}
  
  {/* Activities Group */}
  {pricingItems.filter(item => item.type === 'activity').length > 0 && (
    <>
      <div className="px-2 py-1.5 text-xs font-semibold text-[#C19B76]">
        Activities
      </div>
      {pricingItems.filter(item => item.type === 'activity').map((item) => (
        <SelectItem key={item.id} value={item.name}>
          {item.name} - {item.price.toLocaleString()} MAD/person
        </SelectItem>
      ))}
    </>
  )}
</SelectContent>
```

**Price Calculations:**
```typescript
// When package changes
onValueChange={(value) => {
  const selected = pricingItems.find(item => item.name === value)
  const totalPrice = selected ? selected.price * guests : 0
  setEditedBooking(prev => prev ? { 
    ...prev, 
    package_title: value,
    total_price: totalPrice  // ✅ Auto-calculates
  } : null)
}}

// When adults change
onChange={(e) => {
  const val = parseInt(e.target.value) || 1
  const newGuests = val + children
  const selected = pricingItems.find(item => item.name === package_title)
  const totalPrice = selected ? selected.price * newGuests : 0
  setEditedBooking({ 
    ...prev, 
    adults: val, 
    guests: newGuests, 
    total_price: totalPrice  // ✅ Recalculates
  })
}}

// When children change
onChange={(e) => {
  const val = parseInt(e.target.value) || 0
  const newGuests = adults + val
  const selected = pricingItems.find(item => item.name === package_title)
  const totalPrice = selected ? selected.price * newGuests : 0
  setEditedBooking({ 
    ...prev, 
    children: val, 
    guests: newGuests, 
    total_price: totalPrice  // ✅ Recalculates
  })
}}
```

---

## 📊 Comparison

| Feature | New Booking | Edit Booking | Status |
|---------|-------------|--------------|--------|
| **Data Source** | pricing table | pricing table | ✅ Both |
| **Uses `name` column** | ✅ Yes | ✅ Yes | ✅ Both |
| **Grouped dropdown** | ✅ Yes | ✅ Yes | ✅ Both |
| **Shows price** | ✅ Yes | ✅ Yes | ✅ Both |
| **Auto-calc on package change** | ✅ Yes | ✅ Yes | ✅ Both |
| **Auto-calc on guests change** | ✅ Yes | ✅ Yes | ✅ Both |
| **Uses mock data** | ❌ No | ❌ No | ✅ Both |

---

## 🧪 Test Both Forms

### **Test 1: New Booking**
```bash
1. Go to /dashboard/bookings
2. Click "New Booking" button
3. Check dropdown for "Package / Activity"
4. Should see:
   - Packages group (if any exist)
   - Activities group (if any exist)
   - Each showing: "Name - Price MAD/person"
5. Select a package
6. Enter number of guests
7. See total price auto-calculate
8. Change guests
9. See price update immediately
```

**Expected Dropdown:**
```
Package / Activity *
┌────────────────────────────────────┐
│ Packages                           │
│   Basic Package - 1,200 MAD/person  │
│   Premium Package - 2,500 MAD       │
├────────────────────────────────────│
│ Activities                          │
│   Quad Biking - 350 MAD/person     │
│   Camel Trekking - 200 MAD/person  │
└────────────────────────────────────┘
```

### **Test 2: Edit Booking**
```bash
1. Go to /dashboard/bookings
2. Click on any existing booking
3. Click "Edit" button in drawer
4. Check "Package / Activity" dropdown
5. Should see SAME format as New Booking
6. Change package/activity
7. See price recalculate
8. Change adults or children
9. See price update
```

**Expected Dropdown:**
```
Package / Activity
┌────────────────────────────────────┐
│ Packages                           │
│   Basic Package - 1,200 MAD/person  │
│   Premium Package - 2,500 MAD       │
├────────────────────────────────────│
│ Activities                          │
│   Quad Biking - 350 MAD/person     │
│   Camel Trekking - 200 MAD/person  │
└────────────────────────────────────┘
```

---

## ✅ Auto-Calculation Examples

### **New Booking Example:**
```javascript
Step 1: Select "Premium Package - 2,500 MAD/person"
Step 2: Enter 4 guests
Result: Total = 2,500 × 4 = 10,000 MAD ✅

Step 3: Change to 6 guests
Result: Total = 2,500 × 6 = 15,000 MAD ✅
```

### **Edit Booking Example:**
```javascript
Current Booking:
- Package: Basic Package (1,200 MAD)
- Adults: 2, Children: 0
- Total: 2,400 MAD

Action 1: Change package to "Quad Biking - 350 MAD"
Result: Total = 350 × 2 = 700 MAD ✅

Action 2: Change adults to 4
Result: Total = 350 × 4 = 1,400 MAD ✅

Action 3: Add 2 children
Result: Total = 350 × (4 + 2) = 2,100 MAD ✅
```

---

## 🎯 Summary

**Both forms are now:**
- ✅ Fetching from `pricing` table
- ✅ Using `name` column correctly
- ✅ Grouping by `type` (pack/activity)
- ✅ Showing prices in dropdown
- ✅ Auto-calculating total price
- ✅ Updating price on changes
- ✅ No mock data

**Data Flow:**
```
pricing table
    ├─→ New Booking Dialog (booking-form-dialog.tsx)
    │   ├─ Grouped dropdown
    │   ├─ Auto-calculation
    │   └─ Real-time updates
    │
    └─→ Edit Booking Drawer (booking-drawer.tsx)
        ├─ Grouped dropdown
        ├─ Auto-calculation
        └─ Real-time updates
```

---

**BOTH booking forms (New & Edit) are fully integrated with the pricing table!** ✅

If you're not seeing the data, make sure you have items in your `pricing` table with the correct schema:
- `name` column (not `activity_name`)
- `price` column
- `type` column ('pack' or 'activity')

---

*Verified: 2025-12-29*  
*Both forms using unified pricing table*
