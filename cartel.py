from PIL import Image, ImageDraw, ImageFont
import os

def crear_cartel_gym():
    # 1. Configuración A4 (300 DPI para impresión de alta calidad)
    ancho = 2480
    alto = 3508
    color_fondo = (20, 20, 20) # Gris muy oscuro (casi negro)
    color_acento = (50, 100, 255) # Azul eléctrico (similar al del oso)
    color_texto = (255, 255, 255) # Blanco

    # Crear lienzo base
    img = Image.new('RGB', (ancho, alto), color=color_fondo)
    draw = ImageDraw.Draw(img)

    # 2. Cargar imágenes (Logo y QR)
    try:
        # Cargar y redimensionar Logo
        logo = Image.open("logo_oso.png").convert("RGBA")
        ancho_logo_deseado = 1000
        ratio_logo = ancho_logo_deseado / logo.width
        alto_logo_deseado = int(logo.height * ratio_logo)
        logo = logo.resize((ancho_logo_deseado, alto_logo_deseado))

        # Cargar y redimensionar QR
        qr = Image.open("qr_ososport_gym.png").convert("RGBA")
        ancho_qr_deseado = 800
        qr = qr.resize((ancho_qr_deseado, ancho_qr_deseado)) # QR es cuadrado
        
        # Crear borde blanco al QR para que resalte en fondo oscuro
        borde = 40
        qr_bg = Image.new('RGB', (ancho_qr_deseado + borde*2, ancho_qr_deseado + borde*2), "white")
        qr_bg.paste(qr, (borde, borde), qr)
        qr = qr_bg

    except FileNotFoundError:
        print("Error: No encuentro 'logo_oso.png' o 'qr_ososport_gym.png'. Asegúrate de que estén en la carpeta.")
        return

    # 3. Posicionamiento (Centrado)
    centro_x = ancho // 2
    
    # Pegar Logo (Arriba)
    pos_y_logo = 150
    img.paste(logo, (centro_x - logo.width // 2, pos_y_logo), logo)

    # 4. Textos
    try:
        # Intentar cargar una fuente gruesa (Arial Bold o similar en el sistema)
        # Si estás en Windows usa "arialbd.ttf", en Linux "DejaVuSans-Bold.ttf"
        font_titulo = ImageFont.truetype("arial.ttf", 180) 
        font_subtitulo = ImageFont.truetype("arial.ttf", 100)
        font_cuerpo = ImageFont.truetype("arial.ttf", 70)
        font_aviso = ImageFont.truetype("arial.ttf", 50)
    except:
        # Fallback por defecto si no encuentra fuentes
        font_titulo = ImageFont.load_default()
        font_subtitulo = ImageFont.load_default()
        font_cuerpo = ImageFont.load_default()
        font_aviso = ImageFont.load_default()

    def draw_text_centered(text, font, y_pos, color):
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        draw.text((centro_x - text_width // 2, y_pos), text, font=font, fill=color)
        return bbox[3] - bbox[1] # Retorna altura

    # Título Principal
    y_texto = pos_y_logo + logo.height + 100
    draw_text_centered("ENTRENA SIN EXCUSAS", font_titulo, y_texto, color_acento)
    
    y_texto += 220
    draw_text_centered("NUEVA GUÍA DE ENTRENAMIENTO", font_subtitulo, y_texto, color_texto)

    # Pegar QR
    y_qr = y_texto + 200
    img.paste(qr, (centro_x - qr.width // 2, y_qr))

    # Texto de llamada a la acción
    y_instrucciones = y_qr + qr.height + 100
    draw_text_centered("ESCANEA PARA ACCEDER A TU RUTINA", font_cuerpo, y_instrucciones, color_texto)

    # 5. El Aviso Importante (Caja de advertencia)
    aviso_texto_1 = "CONSEJO PRO:"
    aviso_texto_2 = "La cobertura dentro del gym puede fallar."
    aviso_texto_3 = "Carga tus videos ANTES de entrar a entrenar."
    
    y_aviso = y_instrucciones + 150
    
    # Dibujar un recuadro semi-transparente para el aviso
    draw.rectangle(
        [(200, y_aviso - 20), (ancho - 200, y_aviso + 350)], 
        outline=color_acento, width=5
    )

    draw_text_centered(aviso_texto_1, font_cuerpo, y_aviso + 30, (255, 200, 0)) # Amarillo
    draw_text_centered(aviso_texto_2, font_aviso, y_aviso + 130, color_texto)
    draw_text_centered(aviso_texto_3, font_aviso, y_aviso + 210, color_texto)

    # Footer
    draw_text_centered("ososportgym.com/guia", font_subtitulo, alto - 200, color_acento)

    # 6. Guardar
    nombre_archivo = "cartel_ososport_A4.png"
    img.save(nombre_archivo)
    print(f"¡Cartel generado! Guardado como {nombre_archivo}")

if __name__ == "__main__":
    crear_cartel_gym()