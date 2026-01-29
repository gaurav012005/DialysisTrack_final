import qrcode
import io
import base64
from decimal import Decimal

class UPIQRCodeGenerator:
    """Generate UPI QR codes for payments"""
    
    @staticmethod
    def generate_upi_string(upi_id, name, amount, transaction_note=""):
        """
        Generate UPI payment string
        Format: upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&tn=NOTE
        """
        upi_string = f"upi://pay?pa={upi_id}&pn={name}&am={amount}"
        if transaction_note:
            upi_string += f"&tn={transaction_note}"
        return upi_string
    
    @staticmethod
    def generate_qr_code(upi_string):
        """Generate QR code image from UPI string"""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(upi_string)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        return img
    
    @staticmethod
    def generate_qr_code_base64(upi_id, name, amount, transaction_note=""):
        """Generate QR code and return as base64 string"""
        upi_string = UPIQRCodeGenerator.generate_upi_string(
            upi_id, name, amount, transaction_note
        )
        img = UPIQRCodeGenerator.generate_qr_code(upi_string)
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        img_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_base64}"

# Hospital UPI Configuration
HOSPITAL_UPI_ID = "8879800852@fam"  # Change to your hospital's UPI ID
HOSPITAL_NAME = "DialysisTrack Hospital"
