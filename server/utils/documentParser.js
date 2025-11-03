import pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js'
import mammoth from 'mammoth'
import * as XLSX from 'xlsx'

export async function parseDocument(buffer, mimeType) {
  if (mimeType === 'application/pdf') {
    return parsePDF(buffer)
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return parseWord(buffer)
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimeType === 'application/vnd.ms-excel'
  ) {
    return parseExcel(buffer)
  } else if (
    mimeType === 'text/plain' ||
    mimeType === 'text/csv' ||
    mimeType === 'application/json' ||
    mimeType === 'text/html' ||
    mimeType === 'text/xml'
  ) {
    return buffer.toString('utf-8')
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`)
  }
}

async function parsePDF(buffer) {
  const doc = await pdfjsLib.getDocument({ data: buffer.buffer }).promise
  const pages = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const text = await page.getTextContent()
    const strings = text.items.map(item => item.str).join(' ')
    pages.push(strings)
  }
  doc.destroy()
  return pages.join('\n\n')
}

async function parseWord(buffer) {
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

function parseExcel(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  let text = ''
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const csv = XLSX.utils.sheet_to_csv(sheet)
    text += `--- Sheet: ${sheetName} ---\n${csv}\n\n`
  }
  return text
}
