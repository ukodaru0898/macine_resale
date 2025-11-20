# Testing Guide - ASML Buy Back Optimizer

## Setup

### 1. Start Both Services

**Terminal 1 - Frontend:**
```bash
cd "/Users/udaykirankodaru/Documents/Machine Resale rate Caluclations/frontend"
npm run dev
```
Frontend runs on: http://localhost:5174

**Terminal 2 - Backend:**
```bash
cd "/Users/udaykirankodaru/Documents/Machine Resale rate Caluclations/frontend"
./scripts/start_backend.sh
```
Backend runs on: http://127.0.0.1:8000

## Test Scenarios

### Test 1: Initial Data Load
**Objective:** Verify Base.xlsx loads correctly

**Steps:**
1. Open http://localhost:5174 in browser
2. App should auto-load Base.xlsx
3. Verify tables appear with data

**Expected Results:**
- System Recommendation table shows systems with prices
- Max Buy Back Bundle Valuation appears (side by side with Expected Profit)
- Expected Profit on Bundle appears (side by side with Max Buy Back)
- System Demand, Modules Demand, Parts Demand tables show
- Blue columns are read-only (cannot edit)
- Green columns are editable (single-click to edit)

**Check:**
- [ ] All 6 tables visible
- [ ] Data populated in blue columns
- [ ] ASML colors applied: Blue #86CEF4, Green #34B233, Yellow #FED100
- [ ] Title shows "ASML Buy Back Optimizer"

---

### Test 2: Cell Editing and Auto-Computation
**Objective:** Verify green column editing and yellow column computation

**Steps:**
1. In System Recommendation table, click on "offered_bundle" cell (green)
2. Enter a value (e.g., 5)
3. Press Enter
4. Click on "deal_outcome_probability" cell (green)
5. Enter "75%" and press Enter
6. Observe "expected_pipeline_units" column (yellow)

**Expected Results:**
- Green cells are editable on single click
- Blue cells show cursor but are read-only
- Yellow "expected_pipeline_units" auto-computes:
  - Formula: units_in_sales_pipeline × deal_outcome_probability
  - Handles % symbols (75% → 0.75)
  - Converts values >1 to decimals
- Changes save immediately

**Check:**
- [ ] Green cells editable
- [ ] Blue cells read-only
- [ ] Yellow cells compute automatically
- [ ] No page refresh needed

---

### Test 3: Totals Row Calculation
**Objective:** Verify totals row calculations

**Steps:**
1. Scroll to bottom of System Recommendation table
2. Observe totals row

**Expected Results:**
- Last row shows "Total" in machine_type column
- Numeric columns sum correctly (offered_bundle, expected_pipeline_units, etc.)
- deal_outcome_probability shows 0 (excluded from sum)
- required_margin shows 0 (excluded from sum)
- All empty totals show 0 (not blank)
- No background colors on totals row
- No blank separator row above totals
- Totals row height: 52px

**Check:**
- [ ] "Total" label in machine_type column
- [ ] Numeric columns summed correctly
- [ ] Probabilities/margins show 0
- [ ] No colors on totals
- [ ] Clean appearance

---

### Test 4: Demand Tables - Required Calculation
**Objective:** Verify Required 12M/24M calculations

**Steps:**
1. Scroll to System Demand table
2. Observe "Required 12M" column (yellow)
3. Formula should be: Max(0, Demand 12M - Finished Inventory 12M)

**Expected Results:**
- Required 12M = Demand_12M - Qinventory_12M (if positive)
- Required 12M = 0 (if negative)
- Same logic for Required 24M
- Repeat for Modules Demand and Parts Demand tables

**Check:**
- [ ] System Demand Required 12M/24M correct
- [ ] Modules Demand Required 12M/24M correct
- [ ] Parts Demand Required 12M/24M correct
- [ ] No negative values in Required columns

---

### Test 5: Save Inputs (CSV Export)
**Objective:** Verify CSV export functionality

**Steps:**
1. Click "Save Inputs" button (below Expected Profit table)
2. Browser should prompt to download file

**Expected Results:**
- File named: "optimization_inputs_YYYY-MM-DD.csv"
- File contains all table data with headers
- Green column values included
- Blue column values included
- Yellow computed values included

**Check:**
- [ ] CSV download triggered
- [ ] File opens in Excel/text editor
- [ ] Data structure correct (table_id, row_id, fields)
- [ ] All tables represented

---

### Test 6: Backend Health Check
**Objective:** Verify Python backend is running

**Steps:**
1. Open browser to: http://127.0.0.1:8000/health
2. Should see JSON response

**Expected Results:**
```json
{"status": "healthy"}
```

**Check:**
- [ ] Backend responds
- [ ] JSON format correct
- [ ] Status is "healthy"

---

### Test 7: Optimization - Full End-to-End
**Objective:** Test complete optimization workflow

**Steps:**
1. Enter data in green columns (offered_bundle, units_in_sales_pipeline, etc.)
2. Click "Optimize Bundle" button
3. Loading indicator should appear
4. Wait for optimization to complete
5. Observe yellow columns update

**Expected Results:**
- Loading spinner appears during optimization
- Backend logs show:
  ```
  INFO:__main__:Starting optimization, reading from: .../Base.xlsx
  INFO:__main__:Read OutBase sheet: X rows
  INFO:__main__:Created Out_BB sheet
  INFO:__main__:Created Out_TOT sheet
  INFO:__main__:Saved results to: .../Base.xlsx
  ```
- Success message appears: "Optimization completed successfully!"
- Yellow columns update in System Recommendation:
  - recommended_from_other_inventory
  - recommended_buy_12m
- Values reflect optimization results

**Check:**
- [ ] Button triggers optimization
- [ ] Loading indicator visible
- [ ] Backend processes request (check terminal logs)
- [ ] Out_BB and Out_TOT sheets created in Base.xlsx
- [ ] Frontend reads optimization results
- [ ] Yellow columns update
- [ ] Success message displays

---

### Test 8: Error Handling
**Objective:** Verify error handling when backend is down

**Steps:**
1. Stop Python backend (Ctrl+C in Terminal 2)
2. Click "Optimize Bundle" in browser
3. Observe error message

**Expected Results:**
- Loading indicator shows
- After timeout, error message appears
- Message: "Optimization failed: Failed to run optimization. Make sure the Python backend is running on port 8000."
- Tables remain in previous state (no data loss)

**Check:**
- [ ] Error message displays
- [ ] No data corruption
- [ ] User can retry after restarting backend
- [ ] Helpful error message

---

### Test 9: Excel File Verification
**Objective:** Verify Out_BB and Out_TOT sheets exist

**Steps:**
1. After successful optimization (Test 7)
2. Open Base.xlsx in Excel:
   ```
   /Users/udaykirankodaru/Documents/Machine Resale rate Caluclations/frontend/public/sample_data/Base.xlsx
   ```
3. Look for new sheets

**Expected Results:**
- Out_BB sheet exists with columns:
  - System
  - Recommended_From_Other_Inventory
  - Recommended_Buy_12M
- Out_TOT sheet exists with columns:
  - Metric
  - Value
- Data populated (currently stub data)

**Check:**
- [ ] Out_BB sheet visible
- [ ] Out_TOT sheet visible
- [ ] Correct column headers
- [ ] Data present

---

### Test 10: Browser Console Check
**Objective:** Verify no JavaScript errors

**Steps:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Perform actions from previous tests
4. Check for errors

**Expected Results:**
- No red error messages
- Only INFO logs visible
- Possible warnings about dev mode (normal)

**Check:**
- [ ] No compilation errors
- [ ] No runtime errors
- [ ] No network errors (except when testing error handling)

---

## Known Issues / TODO

### Current Limitations:
1. **Optimization Logic**: Python backend contains stub implementation
   - Currently just creates placeholder Out_BB/Out_TOT data
   - Does not perform actual buy-back optimization
   - TODO: Implement actual optimization algorithm

2. **User Input Persistence**: User edits to green columns are not written back to Base.xlsx
   - Frontend maintains edits in state/localStorage
   - Python backend reads original Base.xlsx values
   - TODO: Write user inputs to Base.xlsx before optimization

3. **Out_TOT Integration**: Out_TOT sheet created but not displayed in UI
   - TODO: Add table or display for totals/metrics from Out_TOT

### Next Steps:
1. Implement actual optimization algorithm in `backend/optimize_excel.py`
2. Add functionality to write user inputs to Base.xlsx sheets before optimization
3. Add Out_TOT results display to UI (possibly as cards or summary section)
4. Add unit tests for computation functions
5. Add integration tests for API endpoints
6. Improve error handling and user feedback

---

## Debug Tips

### Frontend Not Loading:
- Check Vite dev server is running on port 5174
- Open browser console for JavaScript errors
- Verify Base.xlsx exists at `/public/sample_data/Base.xlsx`

### Backend Not Responding:
- Check Python backend terminal for errors
- Verify Flask is running on 127.0.0.1:8000
- Test health endpoint: http://127.0.0.1:8000/health
- Check CORS is enabled (flask-cors installed)

### Optimization Not Working:
- Verify both frontend and backend are running
- Check browser Network tab for API call (POST to /api/optimize)
- Check Python backend logs for errors
- Verify openpyxl and pandas are installed

### Data Not Updating:
- Check browser console for errors reading Excel
- Verify Out_BB and Out_TOT sheets were created
- Check column name matching (case-insensitive)
- Clear localStorage and reload: `localStorage.clear()`

---

## Success Criteria

The implementation is complete when:
- ✅ Python backend reads Base.xlsx
- ✅ Python backend writes to Out_BB and Out_TOT sheets
- ✅ Frontend reads Out_BB and Out_TOT after optimization
- ✅ Yellow columns update with optimization results
- ✅ Error handling works (backend down, file missing, etc.)
- ⚠️ User inputs written to Base.xlsx (optional enhancement)
- ⚠️ Actual optimization algorithm implemented (TODO)
- ⚠️ Out_TOT displayed in UI (TODO)

Current Status: **Phase 1 Complete** - Infrastructure and data flow implemented. Ready for optimization algorithm development.
