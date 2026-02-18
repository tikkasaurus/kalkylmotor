import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas-pro'
import type { CalculationSection, OptionRow } from '@/features/calculations/api/types'

type AutoTableCapableDoc = jsPDF & { lastAutoTable?: { finalY: number } }

interface PDFExportData {
  calculationName: string
  date: string
  createdBy?: string
  rate: number
  area: number
  co2Budget: number
  budgetExclRate: number
  fixedRate: number
  bidAmount: number
  sections: CalculationSection[]
  options: OptionRow[]
  tenantLogoDataUrl?: string
  format?: 'a4' | 'full'
  bookkeepingAccounts?: Array<{ accountNumber: number; description: string }>
}

const getImageFormat = (dataUrl: string): 'PNG' | 'JPEG' | 'WEBP' => {
  if (dataUrl.startsWith('data:image/jpeg')) return 'JPEG'
  if (dataUrl.startsWith('data:image/webp')) return 'WEBP'
  return 'PNG'
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('sv-SE', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' kr'
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('sv-SE', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

// Helper function to format account with name
const formatAccount = (
  accountField: string,
  bookkeepingAccounts?: Array<{ accountNumber: number; description: string }>
): string => {
  if (!accountField || accountField === 'Välj konto') return ''

  // If bookkeeping accounts are not provided, return as-is
  if (!bookkeepingAccounts) return accountField

  // Try to extract account number from the field
  const accountNo = parseInt(accountField.split(' ')[0])
  if (isNaN(accountNo)) return accountField

  // Find the account
  const account = bookkeepingAccounts.find(acc => acc.accountNumber === accountNo)
  if (!account) return accountField

  return `${account.accountNumber} - ${account.description}`
}

export async function exportToPDFFromHTML(data: PDFExportData) {
  console.log('PDF Export: Using html2canvas-pro full-width export v7 - 1440px width')

  // Create a temporary container with the full content
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.width = '1440px'
  container.style.padding = '60px'
  container.style.backgroundColor = '#ffffff'
  container.style.fontFamily = 'Arial, sans-serif'

  // Add header with logo and title
  const header = document.createElement('div')
  header.style.display = 'flex'
  header.style.alignItems = 'center'
  header.style.gap = '20px'
  header.style.marginBottom = '30px'

  if (data.tenantLogoDataUrl) {
    const logo = document.createElement('img')
    logo.src = data.tenantLogoDataUrl
    logo.style.height = '50px'
    logo.style.objectFit = 'contain'
    header.appendChild(logo)
  }

  const titleContainer = document.createElement('div')
  const title = document.createElement('h1')
  title.textContent = data.calculationName
  title.style.margin = '0'
  title.style.fontSize = '24px'
  title.style.fontWeight = 'bold'

  const dateText = document.createElement('p')
  dateText.textContent = data.date
  dateText.style.margin = '5px 0 0 0'
  dateText.style.fontSize = '14px'
  dateText.style.color = '#666'

  if (data.createdBy) {
    const createdByText = document.createElement('p')
    createdByText.textContent = `Skapad av: ${data.createdBy}`
    createdByText.style.margin = '2px 0 0 0'
    createdByText.style.fontSize = '14px'
    createdByText.style.color = '#666'
    titleContainer.appendChild(createdByText)
  }

  titleContainer.appendChild(title)
  titleContainer.appendChild(dateText)
  header.appendChild(titleContainer)
  container.appendChild(header)

  // Add summary box
  const summary = document.createElement('div')
  summary.style.display = 'grid'
  summary.style.gridTemplateColumns = 'repeat(3, 1fr)'
  summary.style.gap = '20px'
  summary.style.padding = '20px'
  summary.style.border = '1px solid #ccc'
  summary.style.borderRadius = '8px'
  summary.style.marginBottom = '30px'

  const summaryItems = [
    { label: 'Arvode (%)', value: `${data.rate}%` },
    { label: 'Area (kvm)', value: formatNumber(data.area) },
    { label: 'CO2 Budget', value: `${formatNumber(data.co2Budget)} kg/kvm` },
    { label: 'Budget exkl. arvode', value: formatCurrency(data.budgetExclRate) },
    { label: `Fastarvode ${data.rate}%`, value: formatCurrency(data.fixedRate) },
    { label: 'Anbudssumma', value: formatCurrency(data.bidAmount), highlight: true },
  ]

  summaryItems.forEach(item => {
    const itemDiv = document.createElement('div')

    const label = document.createElement('div')
    label.textContent = item.label
    label.style.fontSize = '12px'
    label.style.color = item.highlight ? '#0064c8' : '#666'
    label.style.marginBottom = '5px'

    const value = document.createElement('div')
    value.textContent = item.value
    value.style.fontSize = '18px'
    value.style.fontWeight = 'bold'
    value.style.color = item.highlight ? '#0064c8' : '#000'

    itemDiv.appendChild(label)
    itemDiv.appendChild(value)
    summary.appendChild(itemDiv)
  })

  container.appendChild(summary)

  // Add section title
  const sectionTitle = document.createElement('h2')
  sectionTitle.textContent = 'Kostnadskalkyl'
  sectionTitle.style.fontSize = '18px'
  sectionTitle.style.fontWeight = 'bold'
  sectionTitle.style.marginBottom = '15px'
  container.appendChild(sectionTitle)

  // Build the calculation table from data
  const calcTable = document.createElement('table')
  calcTable.style.width = '100%'
  calcTable.style.borderCollapse = 'collapse'
  calcTable.style.fontSize = '13px'

  // Table header
  const thead = document.createElement('thead')
  thead.innerHTML = `
    <tr>
      <th style="border: 1px solid #ccc; padding: 12px; background: #f0f0f0; text-align: left; font-weight: bold;">Benämning</th>
      <th style="border: 1px solid #ccc; padding: 12px; background: #f0f0f0; text-align: right; font-weight: bold;">Antal</th>
      <th style="border: 1px solid #ccc; padding: 12px; background: #f0f0f0; text-align: left; font-weight: bold;">Enhet</th>
      <th style="border: 1px solid #ccc; padding: 12px; background: #f0f0f0; text-align: right; font-weight: bold;">Pris/enhet</th>
      <th style="border: 1px solid #ccc; padding: 12px; background: #f0f0f0; text-align: right; font-weight: bold;">Spill</th>
      <th style="border: 1px solid #ccc; padding: 12px; background: #f0f0f0; text-align: right; font-weight: bold;">CO2</th>
      <th style="border: 1px solid #ccc; padding: 12px; background: #f0f0f0; text-align: right; font-weight: bold;">Summa</th>
      <th style="border: 1px solid #ccc; padding: 12px; background: #f0f0f0; text-align: left; font-weight: bold;">Konto</th>
      <th style="border: 1px solid #ccc; padding: 12px; background: #f0f0f0; text-align: left; font-weight: bold;">Anteckning</th>
    </tr>
  `
  calcTable.appendChild(thead)

  const tbody = document.createElement('tbody')

  // Iterate through sections (all expanded)
  data.sections.forEach(section => {
    // Section row (Level 1)
    const sectionRow = document.createElement('tr')
    sectionRow.innerHTML = `
      <td style="border: 1px solid #ccc; padding: 12px; font-weight: bold; background: #f5f5f5;">${section.name || ''}</td>
      <td style="border: 1px solid #ccc; padding: 12px; background: #f5f5f5;"></td>
      <td style="border: 1px solid #ccc; padding: 12px; background: #f5f5f5;"></td>
      <td style="border: 1px solid #ccc; padding: 12px; background: #f5f5f5;"></td>
      <td style="border: 1px solid #ccc; padding: 12px; background: #f5f5f5;"></td>
      <td style="border: 1px solid #ccc; padding: 12px; background: #f5f5f5;"></td>
      <td style="border: 1px solid #ccc; padding: 12px; text-align: right; font-weight: bold; background: #f5f5f5;">${formatCurrency(section.amount)}</td>
      <td style="border: 1px solid #ccc; padding: 12px; background: #f5f5f5;"></td>
      <td style="border: 1px solid #ccc; padding: 12px; background: #f5f5f5;"></td>
    `
    tbody.appendChild(sectionRow)

    // Subsections (Level 2)
    section.subsections?.forEach(subsection => {
      const subsectionRow = document.createElement('tr')
      subsectionRow.innerHTML = `
        <td style="border: 1px solid #ccc; padding: 12px; padding-left: 32px; font-weight: bold;">${subsection.name || ''}</td>
        <td style="border: 1px solid #ccc; padding: 12px;"></td>
        <td style="border: 1px solid #ccc; padding: 12px;"></td>
        <td style="border: 1px solid #ccc; padding: 12px;"></td>
        <td style="border: 1px solid #ccc; padding: 12px;"></td>
        <td style="border: 1px solid #ccc; padding: 12px;"></td>
        <td style="border: 1px solid #ccc; padding: 12px; text-align: right; font-weight: bold;">${formatCurrency(subsection.amount)}</td>
        <td style="border: 1px solid #ccc; padding: 12px;"></td>
        <td style="border: 1px solid #ccc; padding: 12px;"></td>
      `
      tbody.appendChild(subsectionRow)

      // Rows directly on subsection
      subsection.rows?.forEach(row => {
        const rowEl = document.createElement('tr')
        rowEl.innerHTML = `
          <td style="border: 1px solid #ccc; padding: 12px; padding-left: 52px;">${row.description || ''}</td>
          <td style="border: 1px solid #ccc; padding: 12px; text-align: right;">${formatNumber(row.quantity)}</td>
          <td style="border: 1px solid #ccc; padding: 12px;">${row.unit || ''}</td>
          <td style="border: 1px solid #ccc; padding: 12px; text-align: right;">${formatNumber(row.pricePerUnit)}</td>
          <td style="border: 1px solid #ccc; padding: 12px; text-align: right;">${formatNumber(row.waste * 100)}</td>
          <td style="border: 1px solid #ccc; padding: 12px; text-align: right;">${formatNumber(row.co2 || 0)}</td>
          <td style="border: 1px solid #ccc; padding: 12px; text-align: right;">${formatCurrency(row.quantity * row.pricePerUnit * (1 + row.waste))}</td>
          <td style="border: 1px solid #ccc; padding: 12px;">${formatAccount(row.account, data.bookkeepingAccounts)}</td>
          <td style="border: 1px solid #ccc; padding: 12px;">${row.note || ''}</td>
        `
        tbody.appendChild(rowEl)
      })

      // Sub-subsections (Level 3)
      subsection.subSubsections?.forEach(subSub => {
        const subSubRow = document.createElement('tr')
        subSubRow.innerHTML = `
          <td style="border: 1px solid #ccc; padding: 12px; padding-left: 52px; font-weight: bold;">${subSub.name || ''}</td>
          <td style="border: 1px solid #ccc; padding: 12px;"></td>
          <td style="border: 1px solid #ccc; padding: 12px;"></td>
          <td style="border: 1px solid #ccc; padding: 12px;"></td>
          <td style="border: 1px solid #ccc; padding: 12px;"></td>
          <td style="border: 1px solid #ccc; padding: 12px;"></td>
          <td style="border: 1px solid #ccc; padding: 12px; text-align: right; font-weight: bold;">${formatCurrency(subSub.amount)}</td>
          <td style="border: 1px solid #ccc; padding: 12px;"></td>
          <td style="border: 1px solid #ccc; padding: 12px;"></td>
        `
        tbody.appendChild(subSubRow)

        // Rows on sub-subsection
        subSub.rows?.forEach(row => {
          const rowEl = document.createElement('tr')
          rowEl.innerHTML = `
            <td style="border: 1px solid #ccc; padding: 12px; padding-left: 72px;">${row.description || ''}</td>
            <td style="border: 1px solid #ccc; padding: 12px; text-align: right;">${formatNumber(row.quantity)}</td>
            <td style="border: 1px solid #ccc; padding: 12px;">${row.unit || ''}</td>
            <td style="border: 1px solid #ccc; padding: 12px; text-align: right;">${formatNumber(row.pricePerUnit)}</td>
            <td style="border: 1px solid #ccc; padding: 12px; text-align: right;">${formatNumber(row.waste * 100)}</td>
            <td style="border: 1px solid #ccc; padding: 12px; text-align: right;">${formatNumber(row.co2 || 0)}</td>
            <td style="border: 1px solid #ccc; padding: 12px; text-align: right;">${formatCurrency(row.quantity * row.pricePerUnit * (1 + row.waste))}</td>
            <td style="border: 1px solid #ccc; padding: 12px;">${formatAccount(row.account, data.bookkeepingAccounts)}</td>
            <td style="border: 1px solid #ccc; padding: 12px;">${row.note || ''}</td>
          `
          tbody.appendChild(rowEl)
        })
      })
    })
  })

  calcTable.appendChild(tbody)
  container.appendChild(calcTable)

  document.body.appendChild(container)

  try {
    // Capture the element as canvas with high quality
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
    })

    // Calculate PDF dimensions based on canvas
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const imgData = canvas.toDataURL('image/png')

    // Create PDF with exact canvas dimensions (no scaling)
    // Convert pixels to mm for PDF (assuming 96 DPI: 1 inch = 96px = 25.4mm)
    const pdfWidthMM = (imgWidth / 96) * 25.4
    const pdfHeightMM = (imgHeight / 96) * 25.4

    const doc = new jsPDF({
      orientation: pdfWidthMM > pdfHeightMM ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [pdfWidthMM, pdfHeightMM],
    })

    // Add the full image to the PDF
    doc.addImage(imgData, 'PNG', 0, 0, pdfWidthMM, pdfHeightMM)

    // Save the PDF
    const fileName = `${data.calculationName || 'kalkyl'}_${data.date}_full.pdf`
    doc.save(fileName)
  } finally {
    // Clean up
    document.body.removeChild(container)
  }
}

export function exportToPDF(data: PDFExportData) {
  // If format is 'full', use HTML to canvas approach
  if (data.format === 'full') {
    return exportToPDFFromHTML(data)
  }
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  let yPos = margin

  // Header with logo
  const logoX = margin
  const logoY = yPos + 2
  const logoW = 22
  const logoH = 12

  if (data.tenantLogoDataUrl) {
    try {
      const props = doc.getImageProperties(data.tenantLogoDataUrl)
      const maxW = logoW
      const maxH = logoH
      const scale = Math.min(maxW / props.width, maxH / props.height)
      const w = props.width * scale
      const h = props.height * scale
      const x = logoX
      const y = logoY + (logoH - h) / 2
      doc.addImage(data.tenantLogoDataUrl, getImageFormat(data.tenantLogoDataUrl), x, y, w, h)
    } catch {
      // Fallback if image decoding fails
      doc.setFillColor(234, 88, 12) // Orange color
      doc.rect(logoX, logoY, 16, 16, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('BRA', logoX + 8, logoY + 10, { align: 'center' })
    }
  } else {
    doc.setFillColor(234, 88, 12) // Orange color
    doc.rect(logoX, logoY, 16, 16, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('BRA', logoX + 8, logoY + 10, { align: 'center' })
  }

  // Calculation name and date
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  const calcNameX = margin + logoW + 6
  doc.text(data.calculationName, calcNameX, yPos + 8)
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(data.date, calcNameX, yPos + 14)
  if (data.createdBy) {
    doc.text(`Skapad av: ${data.createdBy}`, calcNameX, yPos + 18)
  }

  yPos += 22

  // Compact summary (single box, 3x2 grid)
  const summaryW = pageWidth - 2 * margin
  const summaryH = 36
  const summaryX = margin
  const summaryY = yPos

  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.2)
  doc.rect(summaryX, summaryY, summaryW, summaryH, 'S')

  const colW = summaryW / 3
  const padX = 8
  const row1LabelY = summaryY + 9
  const row1ValueY = summaryY + 17
  const row2LabelY = summaryY + 23
  const row2ValueY = summaryY + 30

  const drawMetric = (col: number, row: 1 | 2, label: string, value: string, accent?: boolean) => {
    const x = summaryX + colW * col + padX
    const labelY = row === 1 ? row1LabelY : row2LabelY
    const valueY = row === 1 ? row1ValueY : row2ValueY

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(accent ? 0 : 100, accent ? 100 : 100, accent ? 200 : 100)
    doc.text(label, x, labelY)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    if (accent) {
      doc.setTextColor(0, 100, 200)
    } else {
      doc.setTextColor(0, 0, 0)
    }
    doc.text(value, x, valueY)
  }

  // Row 1 (3 items)
  drawMetric(0, 1, 'Arvode (%)', `${data.rate}%`)
  drawMetric(1, 1, 'Area (kvm)', formatNumber(data.area))
  drawMetric(2, 1, 'CO2 Budget', `${formatNumber(data.co2Budget)} kg/kvm`)

  // Row 2 (3 items)
  drawMetric(0, 2, 'Budget exkl. arvode', formatCurrency(data.budgetExclRate))
  drawMetric(1, 2, `Fastarvode ${data.rate}%`, formatCurrency(data.fixedRate))
  drawMetric(2, 2, 'Anbudssumma', formatCurrency(data.bidAmount), true)

  yPos += summaryH + 2

  // Kostnadskalkyl Section
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Kostnadskalkyl', margin, yPos + 7)

  yPos += 10

  type ReportRowKind = 'level1' | 'level2' | 'level3' | 'row'
  type ReportRow = {
    kind: ReportRowKind
    indent: number
    cells: (string | number)[]
  }

  const tableWidth = pageWidth - 2 * margin
  const reportRows: ReportRow[] = []

  data.sections.forEach((section) => {
    reportRows.push({
      kind: 'level1',
      indent: 0,
      cells: [
        section.name || '',
        '',
        '',
        '',
        '',
        '',
        formatCurrency(section.amount),
        '',
        '',
      ],
    })

    // Only process if section is expanded
    if (section.expanded) {
      ;(section.subsections || []).forEach((subsection) => {
        reportRows.push({
          kind: 'level2',
          indent: 1,
          cells: [
            subsection.name || '',
            '',
            '',
            '',
            '',
            '',
            formatCurrency(subsection.amount),
            '',
            '',
          ],
        })

        // Only process if subsection is expanded
        if (subsection.expanded) {
          // Rows directly on level2
          ;(subsection.rows || []).forEach((row) => {
            reportRows.push({
              kind: 'row',
              indent: 2,
              cells: [
                row.description || '',
                formatNumber(row.quantity),
                row.unit || '',
                formatNumber(row.pricePerUnit),
                formatNumber(row.waste * 100),
                formatNumber(row.co2 || 0),
                formatCurrency(row.quantity * row.pricePerUnit * (1 + row.waste)),
                row.account && row.account !== 'Välj konto' ? row.account : '',
                row.note || '',
              ],
            })
          })

          // Level3 blocks under level2
          ;(subsection.subSubsections || []).forEach((subSub) => {
            reportRows.push({
              kind: 'level3',
              indent: 2,
              cells: [
                subSub.name || '',
                '',
                '',
                '',
                '',
                '',
                formatCurrency(subSub.amount),
                '',
                '',
              ],
            })

            // Only process if sub-subsection is expanded
            if (subSub.expanded) {
              ;(subSub.rows || []).forEach((row) => {
                reportRows.push({
                  kind: 'row',
                  indent: 3,
                  cells: [
                    row.description || '',
                    formatNumber(row.quantity),
                    row.unit || '',
                    formatNumber(row.pricePerUnit),
                    formatNumber(row.waste * 100),
                    formatNumber(row.co2 || 0),
                    formatCurrency(row.quantity * row.pricePerUnit * (1 + row.waste)),
                    row.account && row.account !== 'Välj konto' ? row.account : '',
                    row.note || '',
                  ],
                })
              })
            }
          })
        }
      })
    }
  })

  const body = reportRows.map((r) => r.cells.map((c) => (c === null || c === undefined ? '' : String(c))))

  autoTable(doc, {
    startY: yPos,
    head: [['Benämning', 'Antal', 'Enhet', 'Pris/enhet', 'Spill', 'CO2', 'Summa', 'Konto', 'Anteckning']],
    body,
    margin: { left: margin, right: margin },
    tableWidth: 'auto',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      lineColor: [200, 200, 200],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: tableWidth * 0.26 }, // Benämning
      1: { cellWidth: tableWidth * 0.08, halign: 'right' }, // Antal
      2: { cellWidth: tableWidth * 0.07 }, // Enhet
      3: { cellWidth: tableWidth * 0.10, halign: 'right' }, // Pris/enhet
      4: { cellWidth: tableWidth * 0.07, halign: 'right' }, // Spill
      5: { cellWidth: tableWidth * 0.07, halign: 'right' }, // CO2
      6: { cellWidth: tableWidth * 0.13, halign: 'right' }, // Summa
      7: { cellWidth: tableWidth * 0.10 }, // Konto
      8: { cellWidth: tableWidth * 0.12 }, // Anteckning
    },
    didParseCell: (hookData) => {
      if (hookData.section !== 'body') return
      const reportRow = reportRows[hookData.row.index]
      if (!reportRow) return

      // Indent the Benämning column to show hierarchy
      if (hookData.column.index === 0) {
        const baseLeft = 2
        const indentLeft = baseLeft + reportRow.indent * 4
        hookData.cell.styles.cellPadding = {
          top: 2,
          right: 2,
          bottom: 2,
          left: indentLeft,
        }
      }

      if (reportRow.kind === 'level1') {
        hookData.cell.styles.fontStyle = 'bold'
        hookData.cell.styles.fillColor = [245, 245, 245]
        hookData.cell.styles.lineWidth = 0.3
      } else if (reportRow.kind === 'level2') {
        hookData.cell.styles.fontStyle = 'bold'
        hookData.cell.styles.fillColor = [255, 255, 255]
      } else if (reportRow.kind === 'level3') {
        hookData.cell.styles.fontStyle = 'bold'
        hookData.cell.styles.fillColor = [252, 252, 252]
      }
    },
    theme: 'grid',
  })

  const mainTableY = (doc as AutoTableCapableDoc).lastAutoTable?.finalY
  yPos = (mainTableY ?? yPos) + 6

  // Options Section
  if (data.options.length > 0) {
    // Check if we need a new page
    if (yPos > pageHeight - 40) {
      doc.addPage()
      yPos = margin
    }

    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Optioner', margin, yPos + 8)

    yPos += 15

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(`Samtliga optioner är exklusive ${data.rate}% entreprenörsarvode`, margin, yPos - 1)

    const optionsData = data.options.map((option, idx) => [
      String(idx + 1),
      option.description || '',
      formatNumber(option.quantity),
      option.unit,
      formatNumber(option.pricePerUnit),
      formatCurrency(option.quantity * option.pricePerUnit),
    ])

    autoTable(doc, {
      startY: yPos + 1,
      head: [['Nr', 'BENÄMNING', 'ANTAL', 'ENHET', 'PRIS/ENHET', 'SUMMA']],
      body: optionsData,
      margin: { left: margin, right: margin },
      tableWidth: 'auto',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineColor: [200, 200, 200],
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        lineColor: [200, 200, 200],
      },
      columnStyles: {
        0: { cellWidth: tableWidth * 0.06, halign: 'right' }, // Nr
        1: { cellWidth: tableWidth * 0.39 }, // BENÄMNING
        2: { cellWidth: tableWidth * 0.12, halign: 'right' }, // ANTAL
        3: { cellWidth: tableWidth * 0.12 }, // ENHET
        4: { cellWidth: tableWidth * 0.15, halign: 'right' }, // PRIS/ENHET
        5: { cellWidth: tableWidth * 0.16, halign: 'right' }, // SUMMA
      },
      theme: 'grid',
    })

    const optionsTableY = (doc as AutoTableCapableDoc).lastAutoTable?.finalY
    yPos = (optionsTableY ?? yPos) + 6
  }

  // Footer/page numbers
  const totalPages = doc.getNumberOfPages()
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(120, 120, 120)
    doc.text('Publik', margin, pageHeight - 8)
    doc.text(`Sida ${page}/${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' })
  }

  // Save the PDF
  const fileName = `${data.calculationName || 'kalkyl'}_${data.date}.pdf`
  doc.save(fileName)
}

