import jsPDF from 'jspdf';

export default function downloadPDF() {
    const canvas = document.getElementById('Editor');
    if (!canvas) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    
    // Crear un canvas temporal para alta resolución
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0, width, height);

    // Configuración del PDF
    const marginLeft = 15;   // mm (aumentado para mejor legibilidad)
    const marginRight = 20;  // mm (aumentado para mejor legibilidad)
    const headerSpace = 50;  // mm (espacio superior aumentado)
    let footerSpace = 20;  // mm (espacio inferior)
    
    // Convertir píxeles a mm (96 DPI)
    const pxToMm = px => px * 25.4 / 96;
    let canvasWidthMm = pxToMm(width);
    let canvasHeightMm = pxToMm(height);

    // Calcular dimensiones del PDF
    let pdfWidth = canvasWidthMm + marginLeft + marginRight;
    let pdfHeight = canvasHeightMm + headerSpace + footerSpace;

    // Establecer altura mínima como A4 (297mm)
    const MIN_HEIGHT_MM = 297;
    if (pdfHeight < MIN_HEIGHT_MM) {
        const extraSpace = MIN_HEIGHT_MM - pdfHeight;
        // Añadir el espacio extra al footer
        footerSpace += extraSpace;
        pdfHeight = MIN_HEIGHT_MM;
    }

    // Crear PDF (orientación automática)
    const orientation = canvasWidthMm > canvasHeightMm ? 'l' : 'p';
    const doc = new jsPDF({
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
        orientation: orientation
    });

    // Agregar imagen del canvas (desplazada hacia abajo)
    const imgData = tempCanvas.toDataURL('image/png', 1.0);
    doc.addImage(
        imgData, 
        'PNG', 
        marginLeft, 
        headerSpace, // Posición Y aumentada
        canvasWidthMm, 
        canvasHeightMm,
        undefined,
        'FAST' // Renderizado más rápido
    );

    // Opcional: agregar footer
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
        `Generado el ${new Date().toLocaleDateString()}`, 
        pdfWidth / 2, 
        pdfHeight - 10, 
        { align: 'center' }
    );

    doc.save(`${"Chord"}.pdf`);
}