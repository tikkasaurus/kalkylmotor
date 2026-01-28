import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { CalculationSection, OptionRow } from '@/features/calculations/api/types'

type AutoTableCapableDoc = jsPDF & { lastAutoTable?: { finalY: number } }

interface PDFExportData {
  calculationName: string
  date: string
  rate: number
  area: number
  co2Budget: number
  budgetExclRate: number
  fixedRate: number
  bidAmount: number
  sections: CalculationSection[]
  options: OptionRow[]
  tenantLogoDataUrl?: string
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

export function exportToPDF(data: PDFExportData) {
  const doc = new jsPDF({
    orientation: 'portrait',
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

  yPos += 20

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
        formatCurrency(section.amount),
        '',
        '',
      ],
    })

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
          formatCurrency(subsection.amount),
          '',
          '',
        ],
      })

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
            formatNumber(row.co2 || 0),
            formatCurrency(row.quantity * row.pricePerUnit),
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
            formatCurrency(subSub.amount),
            '',
            '',
          ],
        })

        ;(subSub.rows || []).forEach((row) => {
          reportRows.push({
            kind: 'row',
            indent: 3,
            cells: [
              row.description || '',
              formatNumber(row.quantity),
              row.unit || '',
              formatNumber(row.pricePerUnit),
              formatNumber(row.co2 || 0),
              formatCurrency(row.quantity * row.pricePerUnit),
              row.account && row.account !== 'Välj konto' ? row.account : '',
              row.note || '',
            ],
          })
        })
      })
    })
  })

  const body = reportRows.map((r) => r.cells.map((c) => (c === null || c === undefined ? '' : String(c))))

  autoTable(doc, {
    startY: yPos,
    head: [['Benämning', 'Antal', 'Enhet', 'Pris/enhet', 'CO2', 'Summa', 'Konto', 'Anteckning']],
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
      0: { cellWidth: tableWidth * 0.30 }, // Benämning
      1: { cellWidth: tableWidth * 0.09, halign: 'right' }, // Antal
      2: { cellWidth: tableWidth * 0.08 }, // Enhet
      3: { cellWidth: tableWidth * 0.12, halign: 'right' }, // Pris/enhet
      4: { cellWidth: tableWidth * 0.07, halign: 'right' }, // CO2
      5: { cellWidth: tableWidth * 0.14, halign: 'right' }, // Summa
      6: { cellWidth: tableWidth * 0.08 }, // Konto
      7: { cellWidth: tableWidth * 0.12 }, // Anteckning
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

