import QRCode from 'qrcode-svg';
import { jsPDF } from 'jspdf';

export function generatePosterPDF({ petName = 'Pet', link = 'pawguard://pet/unknown', reward = 0 }) {
  const qr = new QRCode({ content: link, width: 256, height: 256, padding: 0, color: '#0B1220', background: '#FFFFFF' });
  const pdf = new jsPDF('portrait', 'mm', 'a4');
  pdf.setFillColor(11, 18, 32); // #0B1220
  pdf.rect(0, 0, 210, 297, 'F');
  pdf.setTextColor(110, 231, 183); // #6EE7B7
  pdf.setFontSize(20);
  pdf.text('PAWGUARD ALERT', 105, 20, { align: 'center' });
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.text(petName, 105, 32, { align: 'center' });
  pdf.setTextColor(14, 165, 233);
  pdf.text(`Ödül: ₺${reward}`, 105, 42, { align: 'center' });
  // Embed QR as SVG
  const svg = qr.svg();
  // jsPDF supports SVG addImage (in browser); in Node, we keep compatibility
  pdf.addImage(svg, 'SVG', 80, 90, 50, 50);
  return pdf.output('arraybuffer');
}

