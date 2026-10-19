const RESPONSES_SHEET_NAME = 'Responses';
const RESPONSE_HEADERS = ['Timestamp', 'Name', 'Email', 'Phone'];

/**
 * Handles submissions sent through URL query parameters.
 * Expected parameters: name, email, phone.
 */
function doGet(e) {
  return handleSubmission_(e);
}

/**
 * Also supports standard form-encoded POST submissions.
 * The website will use GET, but POST is handled for completeness.
 */
function doPost(e) {
  return handleSubmission_(e);
}

function handleSubmission_(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};
    const name = cleanValue_(params.name);
    const email = cleanValue_(params.email);
    const phone = cleanValue_(params.phone);

    validateSubmission_(name, email, phone);

    const lock = LockService.getScriptLock();
    lock.waitLock(30000);

    try {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

      if (!spreadsheet) {
        throw new Error(
          'No Google Sheet is connected. Create this Apps Script from the target Google Sheet.'
        );
      }

      let sheet = spreadsheet.getSheetByName(RESPONSES_SHEET_NAME);

      if (!sheet) {
        sheet = spreadsheet.insertSheet(RESPONSES_SHEET_NAME);
      }

      ensureHeaders_(sheet);
      sheet.appendRow([
        new Date(),
        protectCell_(name),
        protectCell_(email),
        protectCell_(phone)
      ]);
    } finally {
      lock.releaseLock();
    }

    return jsonResponse_({ success: true });
  } catch (error) {
    return jsonResponse_({
      success: false,
      message: error && error.message
        ? error.message
        : 'The response could not be saved.'
    });
  }
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    const headerRange = sheet.getRange(1, 1, 1, RESPONSE_HEADERS.length);
    headerRange.setValues([RESPONSE_HEADERS]);
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

function validateSubmission_(name, email, phone) {
  if (!name) {
    throw new Error('Name is required.');
  }

  if (!email) {
    throw new Error('Email is required.');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Enter a valid email address.');
  }

  if (!phone) {
    throw new Error('Phone is required.');
  }
}

function cleanValue_(value) {
  return value == null ? '' : String(value).trim();
}

// Prevent submitted text from being interpreted as a spreadsheet formula.
function protectCell_(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
