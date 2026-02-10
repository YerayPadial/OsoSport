import qrcode

# 1. Configuración de los datos
url_gimnasio = "https://ososportgym.es/guia" 

# 2. Configuración del diseño del QR
qr = qrcode.QRCode(
    version=1,  # Controla el tamaño (1 es el más pequeño, hasta 40)
    error_correction=qrcode.constants.ERROR_CORRECT_H, # Alta corrección de errores (útil si el QR se daña un poco o se imprime mal)
    box_size=10, # Tamaño de cada "cuadradito" (píxeles)
    border=4,    # Grosor del borde blanco (mínimo estándar es 4)
)

# 3. Añadir la información
qr.add_data(url_gimnasio)
qr.make(fit=True)

# 4. Crear la imagen
imagen = qr.make_image(fill_color="black", back_color="white")

# 5. Guardar el archivo
nombre_archivo = "qr_ososport_gym.png"
imagen.save(nombre_archivo)

print(f"¡Listo! Tu código QR ha sido generado como '{nombre_archivo}'")