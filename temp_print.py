
import sys
import os
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
import tempfile
import subprocess

# Tačne dimenzije koverta
ENVELOPE_WIDTH = 246 * mm
ENVELOPE_HEIGHT = 175 * mm

def print_envelope(lice_data):
    try:
        # Kreiranje privremenog PDF-a
        temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        
        # Kreiranje canvas-a sa tačnim dimenzijama
        c = canvas.Canvas(temp_pdf.name, pagesize=(ENVELOPE_WIDTH, ENVELOPE_HEIGHT))
        
        # Pozadinska slika
        background_path = "public/picture/koverat.png"
        if os.path.exists(background_path):
            c.drawImage(background_path, 0, 0, width=ENVELOPE_WIDTH, height=ENVELOPE_HEIGHT)
        
        # Podaci o licu
        c.setFont("Helvetica", 14)
        c.drawString(110*mm, 85*mm, lice_data.get('ime', ''))
        c.drawString(150*mm, 85*mm, lice_data.get('prezime', ''))
        
        c.setFont("Helvetica", 12)
        c.drawString(110*mm, 75*mm, lice_data.get('mestoRodjenja', ''))
        c.drawString(150*mm, 75*mm, lice_data.get('opstinaRodjenja', ''))
        
        # Sekretarijat i adresa
        c.setFont("Helvetica-Bold", 8)
        c.drawString(150*mm, 210*mm, "СЕКРЕТАРИЈАТ ЗА СОЦИЈАЛНУ ЗАШТИТУ")
        
        c.setFont("Helvetica", 8)
        c.drawString(150*mm, 220*mm, "27 МАРТА БР. 43-45")
        c.drawString(150*mm, 230*mm, "11000 Београд")
        
        c.showPage()
        c.save()
        
        # Direktno štampanje na printer
        print_command = f"lp {temp_pdf.name}"
        result = subprocess.run(print_command, shell=True, capture_output=True, text=True)
        
        # Čišćenje privremenog fajla
        os.unlink(temp_pdf.name)
        
        if result.returncode == 0:
            return {"success": True, "message": "Uspešno štampanje"}
        else:
            return {"success": False, "error": f"Greška pri štampanju: {result.stderr}"}
            
    except Exception as e:
        return {"success": False, "error": str(e)}

def print_multiple_envelopes(lice_list):
    try:
        temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        c = canvas.Canvas(temp_pdf.name, pagesize=(ENVELOPE_WIDTH, ENVELOPE_HEIGHT))
        
        for lice_data in lice_list:
            # Pozadinska slika
            background_path = "public/picture/koverat.png"
            if os.path.exists(background_path):
                c.drawImage(background_path, 0, 0, width=ENVELOPE_WIDTH, height=ENVELOPE_HEIGHT)
            
            # Podaci o licu
            c.setFont("Helvetica", 14)
            c.drawString(110*mm, 85*mm, lice_data.get('ime', ''))
            c.drawString(150*mm, 85*mm, lice_data.get('prezime', ''))
            
            c.setFont("Helvetica", 12)
            c.drawString(110*mm, 75*mm, lice_data.get('mestoRodjenja', ''))
            c.drawString(150*mm, 75*mm, lice_data.get('opstinaRodjenja', ''))
            
            # Sekretarijat i adresa
            c.setFont("Helvetica-Bold", 8)
            c.drawString(150*mm, 210*mm, "СЕКРЕТАРИЈАТ ЗА СОЦИЈАЛНУ ЗАШТИТУ")
            
            c.setFont("Helvetica", 8)
            c.drawString(150*mm, 220*mm, "27 МАРТА БР. 43-45")
            c.drawString(150*mm, 230*mm, "11000 Београд")
            
            c.showPage()
        
        c.save()
        
        # Direktno štampanje
        print_command = f"lp {temp_pdf.name}"
        result = subprocess.run(print_command, shell=True, capture_output=True, text=True)
        
        os.unlink(temp_pdf.name)
        
        if result.returncode == 0:
            return {"success": True, "message": f"Uspešno štampanje {len(lice_list)} koverta"}
        else:
            return {"success": False, "error": f"Greška pri štampanju: {result.stderr}"}
            
    except Exception as e:
        return {"success": False, "error": str(e)}

# Glavna logika
if __name__ == "__main__":
    import json
    data = json.loads(sys.argv[1])
    
    if 'single_lice' in data:
        result = print_envelope(data['single_lice'])
    elif 'lice_list' in data:
        result = print_multiple_envelopes(data['lice_list'])
    else:
        result = {"success": False, "error": "Nedostaju podaci"}
    
    print(json.dumps(result))
