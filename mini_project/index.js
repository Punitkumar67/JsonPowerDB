const CONFIG = {
  TOKEN: "90934864|-31949258071046891|90958056", 
  DB_NAME: "SCHOOL-DB",
  RELATION: "STUDENT-TABLE",
  BASE_URL: "http://api.login2explore.com:5577",
  IML_PATH: "/api/iml", 
  IRL_PATH: "/api/irl"  
};
/* ------------------------------------------------------------ */

const $roll = $('#rollNo');
const $fullName = $('#fullName');
const $className = $('#className');
const $birthDate = $('#birthDate');
const $address = $('#address');
const $enrollDate = $('#enrollDate');

const $btnSave = $('#btnSave');
const $btnUpdate = $('#btnUpdate');
const $btnReset = $('#btnReset');

const $success = $('#success');
const $error = $('#error');
const $raw = $('#rawResp');

let currentRecNo = null; // used when updating record (record number from JPDB)

/* Helper - show/hide messages */
function showSuccess(msg) { $success.text(msg).show(); $error.hide(); }
function showError(msg) { $error.text(msg).show(); $success.hide(); }
function clearMsgs() { $success.hide(); $error.hide(); }

/* Put form into initial state:
   - only Roll No enabled and focused
   - all other fields & buttons disabled
*/
function setInitialState() {
  clearMsgs();
  $roll.prop('disabled', false).val('').focus();
  $fullName.prop('disabled', true).val('');
  $className.prop('disabled', true).val('');
  $birthDate.prop('disabled', true).val('');
  $address.prop('disabled', true).val('');
  $enrollDate.prop('disabled', true).val('');

  $btnSave.prop('disabled', true);
  $btnUpdate.prop('disabled', true);
  $btnReset.prop('disabled', true);

  currentRecNo = null;
  $raw.text('—');
}

/* Enable form inputs (except roll) for new entry */
function enableForNewEntry() {
  $fullName.prop('disabled', false).val('').focus();
  $className.prop('disabled', false).val('');
  $birthDate.prop('disabled', false).val('');
  $address.prop('disabled', false).val('');
  $enrollDate.prop('disabled', false).val('');

  $btnSave.prop('disabled', false);
  $btnUpdate.prop('disabled', true);
  $btnReset.prop('disabled', false);
}

/* Enable for editing existing record (roll disabled) */
function enableForUpdate() {
  $roll.prop('disabled', true);
  $fullName.prop('disabled', false).focus();
  $className.prop('disabled', false);
  $birthDate.prop('disabled', false);
  $address.prop('disabled', false);
  $enrollDate.prop('disabled', false);

  $btnSave.prop('disabled', true);
  $btnUpdate.prop('disabled', false);
  $btnReset.prop('disabled', false);
}

/* Validate that non-primary fields are filled (no empty) */
function validateFormFields() {
  const name = $fullName.val().trim();
  const cls = $className.val().trim();
  const dob = $birthDate.val().trim();
  const addr = $address.val().trim();
  const en = $enrollDate.val().trim();

  if (!name) { showError('Full Name required'); $fullName.focus(); return false; }
  if (!cls) { showError('Class required'); $className.focus(); return false; }
  if (!dob) { showError('Birth Date required'); $birthDate.focus(); return false; }
  if (!addr) { showError('Address required'); $address.focus(); return false; }
  if (!en) { showError('Enrollment Date required'); $enrollDate.focus(); return false; }
  clearMsgs();
  return true;
}

/* Build JSON object from form fields */
function buildStudentJson() {
  return {
    rollNo: $roll.val().trim(),
    fullName: $fullName.val().trim(),
    class: $className.val().trim(),
    birthDate: $birthDate.val().trim(),
    address: $address.val().trim(),
    enrollmentDate: $enrollDate.val().trim()
  };
}

/* Check if roll exists in DB. Called when user leaves roll field (blur) or presses Enter. */
function checkRollInDB() {
  clearMsgs();
  const rollVal = $roll.val().trim();
  if (!rollVal) { showError('Enter Roll No'); $roll.focus(); return; }

  // build key object expected by JPDB (example: {"rollNo":"R001"})
  const keyJson = { rollNo: rollVal };

  // create GET_BY_KEY request (jpdb-commons.js helper)
  const getReq = createGET_BY_KEYRequest(CONFIG.TOKEN, CONFIG.DB_NAME, CONFIG.RELATION, JSON.stringify(keyJson));
  // send to IRL endpoint (read)
  const resp = executeCommandAtGivenBaseUrl(getReq, CONFIG.BASE_URL, CONFIG.IRL_PATH);

  // resp will be an object. If "data" or "record" array present, adapt.
  // Many JPDB responses set status and data or rec_no.
  try {
    // parse result - depending on helper, resp may already be an object
    if (resp && resp.status === 200 && resp.data && resp.data.length > 0) {
      // record exists
      const record = resp.data[0]; // jpdb often returns array in data
      fillFormFromRecord(record);
      showSuccess('Record exists. You can update or reset.');
      // store rec_no if present (jpdb returns rec_no or recordNo)
      currentRecNo = record.rec_no || record.recNo || resp.rec_no || null;
      enableForUpdate();
    } else if (resp && resp.status === 200 && resp.record) {
      // some versions return single record in "record"
      const record = resp.record;
      fillFormFromRecord(record);
      currentRecNo = resp.rec_no || record.rec_no || null;
      showSuccess('Record exists. You can update or reset.');
      enableForUpdate();
    } else {
      // not found -> enable new entry
      showSuccess('Roll No not found. You can create a new student entry.');
      enableForNewEntry();
    }
    // show raw response
    $raw.text(JSON.stringify(resp, null, 2));
  } catch (e) {
    showError('Error reading DB: ' + e.message);
    $raw.text(JSON.stringify(resp, null, 2));
  }
}

/* Fill form inputs from DB record */
function fillFormFromRecord(rec) {
  // JPDB sometimes returns keys same as inserted; adjust mapping if different
  $fullName.val(rec.fullName || rec.empName || rec.name || '');
  $className.val(rec.class || rec.className || '');
  $birthDate.val(rec.birthDate || '');
  $address.val(rec.address || '');
  $enrollDate.val(rec.enrollmentDate || rec.enrollDate || '');
}

/* Save new student (insert) */
function saveStudent() {
  clearMsgs();
  if (!validateFormFields()) return;

  const jsonObj = buildStudentJson();
  const jsonStr = JSON.stringify(jsonObj);

  // createPUTRequest(token, jsonStr, dbName, relName)
  const putReq = createPUTRequest(CONFIG.TOKEN, jsonStr, CONFIG.DB_NAME, CONFIG.RELATION);

  // execute (IML endpoint)
  const resp = executeCommandAtGivenBaseUrl(putReq, CONFIG.BASE_URL, CONFIG.IML_PATH);

  // handle response
  $raw.text(JSON.stringify(resp, null, 2));
  if (resp && (resp.status === 200 || resp.status === 'success' || resp.data)) {
    showSuccess('Student saved successfully.');
    setInitialState();
  } else {
    showError('Failed to save. See raw response below.');
  }
}

/* Update existing student */
function updateStudent() {
  clearMsgs();
  if (!validateFormFields()) return;

  const jsonObj = buildStudentJson();
  // For update we need record number (rec_no) — if currentRecNo is null, we cannot update directly.
  if (!currentRecNo) {
    showError('Cannot update: missing record number. Try searching Roll No again.');
    return;
  }

  // createUPDATERecordRequest(token, jsonStr, dbName, relName, recNo)
  const updateReq = createUPDATERecordRequest(CONFIG.TOKEN, JSON.stringify(jsonObj), CONFIG.DB_NAME, CONFIG.RELATION, currentRecNo);

  const resp = executeCommandAtGivenBaseUrl(updateReq, CONFIG.BASE_URL, CONFIG.IML_PATH);
  $raw.text(JSON.stringify(resp, null, 2));
  if (resp && (resp.status === 200 || resp.status === 'success' || resp.data)) {
    showSuccess('Student updated successfully.');
    setInitialState();
  } else {
    showError('Failed to update. See raw response below.');
  }
}

/* wire up UI events */
$(document).ready(function () {
  setInitialState();

  // when user leaves roll input or presses Enter, check DB
  $roll.on('blur', function () {
    const val = $roll.val().trim();
    if (val) checkRollInDB();
  });

  // allow Enter in roll field to trigger check
  $roll.on('keypress', function (e) {
    if (e.which === 13) { // Enter key
      e.preventDefault();
      checkRollInDB();
    }
  });

  // Save/Update/Reset button handlers
  $btnSave.on('click', function () { saveStudent(); });
  $btnUpdate.on('click', function () { updateStudent(); });
  $btnReset.on('click', function () { setInitialState(); });

  // optional: if user clears roll and clicks elsewhere, reset to initial state
  $roll.on('input', function () {
    if (!$(this).val().trim()) {
      setInitialState();
    }
  });
});