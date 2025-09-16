const QRCode = require('qrcode');

const generateQRCode = (text) => {
    try {
        // Generate QR code synchronously for immediate return
        const qrCode = QRCode.toDataURL(text, {
            width: 300,
            margin: 2,
            color: {
                dark: '#0047AB', // Blue color
                light: '#ffffff'
            }
        });
        return qrCode;
    } catch (error) {
        console.error('Error generating QR code:', error);
        return '';
    }
};

module.exports = { generateQRCode };