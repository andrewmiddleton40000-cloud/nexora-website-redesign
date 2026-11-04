import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const ink = rgb(0.086, 0.082, 0.075)
const forest = rgb(0.122, 0.294, 0.227)
const muted = rgb(0.42, 0.4, 0.365)
const lime = rgb(0.784, 0.878, 0.353)

export async function renderCertificate(c: { studentName: string; courseTitle: string; completedOn: string; number: string; verificationCode: string; verifyUrl: string }) {
  const pdf = await PDFDocument.create()
  pdf.setTitle(`Certificate ${c.number}`)
  pdf.setAuthor('Nexora Digital Academy')
  const page = pdf.addPage([842, 595])
  const sans = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const serif = await pdf.embedFont(StandardFonts.TimesRomanItalic)
  const W = 842
  const center = (text: string, y: number, font = sans, size = 12, color = ink) => {
    const w = font.widthOfTextAtSize(text, size)
    page.drawText(text, { x: (W - w) / 2, y, size, font, color })
  }
  const fit = (text: string, font: typeof sans, max: number, start: number) => {
    let s = start
    while (s > 14 && font.widthOfTextAtSize(text, s) > max) s -= 1
    return s
  }
  page.drawRectangle({ x: 0, y: 0, width: W, height: 595, color: rgb(0.953, 0.937, 0.902) })
  page.drawRectangle({ x: 28, y: 28, width: W - 56, height: 539, borderColor: ink, borderWidth: 1 })
  page.drawRectangle({ x: 28, y: 539, width: W - 56, height: 28, color: ink })
  page.drawRectangle({ x: 28, y: 539, width: 120, height: 28, color: lime })
  page.drawText('NEXORA DIGITAL ACADEMY', { x: 160, y: 549, size: 10, font: bold, color: rgb(0.99, 0.99, 0.97) })
  page.drawText('Learn. Build. Innovate.', { x: W - 28 - 14 - sans.widthOfTextAtSize('Learn. Build. Innovate.', 10), y: 549, size: 10, font: sans, color: rgb(0.99, 0.99, 0.97) })

  center('CERTIFICATE OF COMPLETION', 470, bold, 13, forest)
  center('This certifies that', 420, sans, 13, muted)
  center(c.studentName, 360, serif, fit(c.studentName, serif, 680, 48), ink)
  page.drawLine({ start: { x: 190, y: 345 }, end: { x: W - 190, y: 345 }, thickness: 0.75, color: ink })
  center('has successfully completed the Nexora Digital Academy course', 310, sans, 13, muted)
  center(c.courseTitle, 268, bold, fit(c.courseTitle, bold, 680, 26), ink)
  center(`Completed on ${new Date(c.completedOn).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, 232, sans, 12, ink)

  const col = (label: string, value: string, x: number) => {
    page.drawText(label, { x, y: 150, size: 8, font: bold, color: muted })
    page.drawText(value, { x, y: 133, size: 11, font: sans, color: ink })
  }
  col('CERTIFICATE NUMBER', c.number, 70)
  col('VERIFICATION CODE', c.verificationCode, 330)
  col('ISSUED BY', 'Nexora Technologies', 560)
  page.drawText(`Verify online: ${c.verifyUrl}`, { x: 70, y: 98, size: 10, font: sans, color: forest })
  page.drawText(
    'This certificate confirms completion of a Nexora Digital Academy course. It is not a government or university qualification.',
    { x: 70, y: 62, size: 8.5, font: sans, color: muted },
  )
  return pdf.save()
}
