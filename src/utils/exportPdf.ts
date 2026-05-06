import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function exportToPDF(title: string, headers: string[], data: (string | number)[][], fileName: string = 'export.pdf') {
  // Create a container element off-screen but visible
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.top = '-9999px'
  container.style.left = '0'
  container.style.width = '210mm' // A4 width
  container.style.minHeight = '297mm' // A4 height
  container.style.backgroundColor = '#ffffff'
  container.style.padding = '20mm'
  container.style.boxSizing = 'border-box'
  container.style.zIndex = '9999'
  
  // Construct HTML
  const html = `
    <div style="font-family: 'SimHei', 'Microsoft YaHei', sans-serif; color: #000;">
      <h1 style="text-align: center; margin-bottom: 20px; font-size: 24px; font-weight: bold;">${title}</h1>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            ${headers.map(h => `
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold; font-size: 14px;">${h}</th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map((row, i) => `
            <tr style="background-color: ${i % 2 === 0 ? '#fff' : '#f9f9f9'};">
              ${row.map(cell => `
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; word-break: break-all;">${cell ?? ''}</td>
              `).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="text-align: right; font-size: 10px; color: #666; margin-top: 10px;">
        Generated on ${new Date().toLocaleDateString()}
      </div>
    </div>
  `
  
  container.innerHTML = html
  document.body.appendChild(container)
  
  try {
    // Convert to canvas
    const canvas = await html2canvas(container, {
      scale: 2, // Improve resolution
      useCORS: true,
      logging: false
    })
    
    // Calculate dimensions
    const imgWidth = 210
    const pageHeight = 297
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    const doc = new jsPDF('p', 'mm', 'a4')
    const imgData = canvas.toDataURL('image/png')
    
    // Add first page
    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    
    // Add subsequent pages if content overflows
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      doc.addPage()
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    
    doc.save(fileName)
    
  } catch (error) {
    console.error('PDF Export failed', error)
  } finally {
    // Cleanup
    document.body.removeChild(container)
  }
}
