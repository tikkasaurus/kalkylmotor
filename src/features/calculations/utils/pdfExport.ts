import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { CalculationSection, OptionRow } from '@/features/calculations/api/types'

interface PDFExportData {
  calculationName: string
  projectName: string
  date: string
  rate: number
  area: number
  co2Budget: number
  budgetExclRate: number
  fixedRate: number
  bidAmount: number
  sections: CalculationSection[]
  options: OptionRow[]
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
  doc.setFillColor(234, 88, 12) // Orange color
  doc.rect(margin, yPos, 16, 16, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('BRA', margin + 8, yPos + 10, { align: 'center' })

  // Calculation name and project
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  const calcNameX = margin + 20
  doc.text(data.calculationName, calcNameX, yPos + 8)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(data.projectName, calcNameX, yPos + 14)
  
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text(data.date, calcNameX, yPos + 19)

  yPos += 30

  // Arvode Section
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 35, 'S')
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Arvode', margin + 5, yPos + 8)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const arvodeY = yPos + 15
  doc.text('Arvode (%)', margin + 5, arvodeY)
  doc.text(`${data.rate}`, margin + 5, arvodeY + 5)
  doc.text('%', margin + 15, arvodeY + 5)

  doc.text('Area (kvm)', margin + 50, arvodeY)
  doc.text(formatNumber(data.area), margin + 50, arvodeY + 5)

  doc.text('CO2 Budget', margin + 95, arvodeY)
  doc.text(`${formatNumber(data.co2Budget)} kg/kvm`, margin + 95, arvodeY + 5)

  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('Procentuellt arvode på totalkostnaden', margin + 5, yPos + 28)

  yPos += 40

  // Summary Cards
  const cardWidth = (pageWidth - 2 * margin - 10) / 3
  const cardHeight = 20
  const cardY = yPos

  // Budget exkl. arvode
  doc.setDrawColor(200, 200, 200)
  doc.rect(margin, cardY, cardWidth, cardHeight, 'S')
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text('Budget exkl. arvode', margin + 5, cardY + 6)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(formatCurrency(data.budgetExclRate), margin + 5, cardY + 14)

  // Fastarvode
  doc.rect(margin + cardWidth + 5, cardY, cardWidth, cardHeight, 'S')
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'normal')
  doc.text(`Fastarvode ${data.rate}%`, margin + cardWidth + 10, cardY + 6)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(formatCurrency(data.fixedRate), margin + cardWidth + 10, cardY + 14)

  // Anbudssumma
  doc.rect(margin + 2 * (cardWidth + 5), cardY, cardWidth, cardHeight, 'S')
  doc.setFontSize(9)
  doc.setTextColor(0, 100, 200)
  doc.setFont('helvetica', 'normal')
  doc.text('Anbudssumma', margin + 2 * (cardWidth + 5) + 5, cardY + 6)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 100, 200)
  doc.text(formatCurrency(data.bidAmount), margin + 2 * (cardWidth + 5) + 5, cardY + 14)

  yPos += 30

  // Kostnadskalkyl Section
  doc.setDrawColor(200, 200, 200)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'S')
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Kostnadskalkyl', margin + 5, yPos + 7)

  yPos += 15

  // Sections with rows (all expanded)
  data.sections.forEach((section) => {
    // Check if we need a new page
    if (yPos > pageHeight - 40) {
      doc.addPage()
      yPos = margin
    }

    // Section header
    doc.setFillColor(240, 240, 240)
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
    doc.setDrawColor(200, 200, 200)
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'S')
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    doc.text(`${section.id}`, margin + 5, yPos + 5.5)
    doc.text(section.name, margin + 15, yPos + 5.5)
    
    doc.setFont('helvetica', 'bold')
    doc.text(formatCurrency(section.amount), pageWidth - margin - 5, yPos + 5.5, { align: 'right' })

    yPos += 10

    // Subsections
    if (section.subsections && section.subsections.length > 0) {
      section.subsections.forEach((subsection) => {
        // Check if we need a new page
        if (yPos > pageHeight - 40) {
          doc.addPage()
          yPos = margin + 20
        }

        // Subsection header
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.text(`${section.id}.${subsection.id} ${subsection.name}`, margin, yPos)
        
        doc.setFont('helvetica', 'bold')
        doc.text(formatCurrency(subsection.amount), pageWidth - margin - 5, yPos, { align: 'right' })

        yPos += 8

        // Subsection rows table
        if (subsection.rows && subsection.rows.length > 0) {
          const tableData = subsection.rows.map((row) => [
            row.description || '',
            formatNumber(row.quantity),
            row.unit,
            formatNumber(row.pricePerUnit),
            formatNumber(row.co2 || 0),
            formatCurrency(row.quantity * row.pricePerUnit),
            row.account || '',
            row.resource || '',
            row.note || '',
          ])

          autoTable(doc, {
            startY: yPos,
            head: [['BENÄMNING', 'ANTAL', 'ENHET', 'PRIS/ENHET', 'CO2', 'SUMMA', 'KONTO', 'RESURS', 'ANTECKNING']],
            body: tableData,
            margin: { left: margin, right: margin },
            tableWidth: 'auto',
            styles: {
              fontSize: 8,
              cellPadding: 2,
            },
            headStyles: {
              fillColor: [255, 255, 255],
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
              0: { cellWidth: (pageWidth - 2 * margin) * 0.20 }, // BENÄMNING
              1: { cellWidth: (pageWidth - 2 * margin) * 0.08, halign: 'right' }, // ANTAL
              2: { cellWidth: (pageWidth - 2 * margin) * 0.08 }, // ENHET
              3: { cellWidth: (pageWidth - 2 * margin) * 0.10, halign: 'right' }, // PRIS/ENHET
              4: { cellWidth: (pageWidth - 2 * margin) * 0.06, halign: 'center' }, // CO2
              5: { cellWidth: (pageWidth - 2 * margin) * 0.10, halign: 'right' }, // SUMMA
              6: { cellWidth: (pageWidth - 2 * margin) * 0.12 }, // KONTO
              7: { cellWidth: (pageWidth - 2 * margin) * 0.10 }, // RESURS
              8: { cellWidth: (pageWidth - 2 * margin) * 0.18 }, // ANTECKNING
            },
            theme: 'grid',
          })

          yPos = (doc as any).lastAutoTable.finalY + 5
        }
        yPos += 5 // Add spacing between subsections
      })
    }

    // Add spacing between sections
    yPos += 5
  })

  // Options Section
  if (data.options.length > 0) {
    // Check if we need a new page
    if (yPos > pageHeight - 40) {
      doc.addPage()
      yPos = margin
    }

    doc.setDrawColor(200, 200, 200)
    doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'S')
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Option', margin + 5, yPos + 7)

    yPos += 15

    const optionsData = data.options.map((option) => [
      option.description || '',
      formatNumber(option.quantity),
      option.unit,
      formatNumber(option.pricePerUnit),
      formatCurrency(option.quantity * option.pricePerUnit),
    ])

    const tableWidth = pageWidth - 2 * margin
    autoTable(doc, {
      startY: yPos,
      head: [['BENÄMNING', 'ANTAL', 'ENHET', 'PRIS/ENHET', 'SUMMA']],
      body: optionsData,
      margin: { left: margin, right: margin },
      tableWidth: 'auto',
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [255, 255, 255],
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
        0: { cellWidth: tableWidth * 0.35 }, // BENÄMNING
        1: { cellWidth: tableWidth * 0.15, halign: 'right' }, // ANTAL
        2: { cellWidth: tableWidth * 0.15 }, // ENHET
        3: { cellWidth: tableWidth * 0.15, halign: 'right' }, // PRIS/ENHET
        4: { cellWidth: tableWidth * 0.20, halign: 'right' }, // SUMMA
      },
      theme: 'grid',
    })
  }

  // Save the PDF
  const fileName = `${data.calculationName || 'kalkyl'}_${data.date}.pdf`
  doc.save(fileName)
}

