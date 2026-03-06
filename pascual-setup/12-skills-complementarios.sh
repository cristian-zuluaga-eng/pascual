#!/bin/bash
# ============================================================================
# PASCUAL-BOT: Sistema de Agente de IA Local Multi-Usuario
# ============================================================================
# FASE 12: Skills Complementarios
# Autor: Claude
# Fecha: 2026-03-05
# Descripción: Instala skills complementarios como OCR, procesamiento de PDFs, etc.
# Dependencias: Workflows (11-workflows-orchestrator.sh)
# ============================================================================

# Habilitar modo estricto - salir inmediatamente si cualquier comando falla
set -e

# Variables de color para mejor visualización
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Variables globales
PASCUAL_DIR="$HOME/.pascual"
PASCUAL_CONFIG="$PASCUAL_DIR/config"
PASCUAL_LOG="$PASCUAL_DIR/shared/logs/installer.log"
SKILLS_DIR="$PASCUAL_DIR/skills"

# Verificar permisos de sudo sin solicitar contraseña
check_sudo() {
    if sudo -n true 2>/dev/null; then
        return 0
    else
        log_error "Se requieren privilegios de sudo para instalar dependencias"
        log_info "Por favor ejecuta: sudo echo 'Permisos de sudo confirmados'"
        log_info "Y luego ejecuta nuevamente este script"
        exit 1
    fi
}

# Verificar que la fase anterior se haya ejecutado
check_previous_phase() {
    if [ ! -f "$PASCUAL_CONFIG/.env" ]; then
        log_error "No se encontró el archivo de configuración de Pascual-Bot"
        log_info "Debes ejecutar primero: ./11-workflows-orchestrator.sh"
        exit 1
    fi

    # Verificar que la fase 11 esté marcada como completada
    source "$PASCUAL_CONFIG/.env"
    if [ "$FASE_11_COMPLETED" != "true" ]; then
        log_error "La fase 11 no se ha completado correctamente"
        log_info "Debes ejecutar primero: ./11-workflows-orchestrator.sh"
        exit 1
    fi
}

# Cargar variables de entorno
load_env() {
    if [ -f "$PASCUAL_CONFIG/.env" ]; then
        source "$PASCUAL_CONFIG/.env"
        log_info "Variables de entorno cargadas de $PASCUAL_CONFIG/.env"
    else
        log_error "Archivo .env no encontrado en $PASCUAL_CONFIG"
        exit 1
    fi
}

# Función para imprimir mensajes con formato
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
    echo "[INFO] $(date +"%Y-%m-%d %H:%M:%S") - $1" >> "$PASCUAL_LOG" 2>/dev/null || true
}

log_warning() {
    echo -e "${YELLOW}[ADVERTENCIA]${NC} $1"
    echo "[WARN] $(date +"%Y-%m-%d %H:%M:%S") - $1" >> "$PASCUAL_LOG" 2>/dev/null || true
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo "[ERROR] $(date +"%Y-%m-%d %H:%M:%S") - $1" >> "$PASCUAL_LOG" 2>/dev/null || true
}

log_step() {
    echo -e "${BLUE}[PASO]${NC} $1"
    echo "[STEP] $(date +"%Y-%m-%d %H:%M:%S") - $1" >> "$PASCUAL_LOG" 2>/dev/null || true
}

# Función de limpieza en caso de error
cleanup() {
    if [ $? -ne 0 ]; then
        log_error "¡Instalación interrumpida! Error en la línea $BASH_LINENO"
        log_info "Para solucionar problemas, revise el log: $PASCUAL_LOG"
        log_info "Para hacer rollback, ejecute: ./rollback/rollback-phase-12.sh"
    fi
}

# Registrar función de limpieza para ejecución en caso de error
trap cleanup EXIT

# Crear estructura de directorios para skills
create_skills_directories() {
    log_step "Creando estructura de directorios para skills complementarios..."

    # Crear directorio base de skills
    mkdir -p "$SKILLS_DIR"/{ocr,pdf,document,vision,audio,notion,calendar}

    log_info "Estructura de directorios creada ✓"
    return 0
}

# Instalar skill de OCR
install_ocr_skill() {
    log_step "Instalando skill de OCR (reconocimiento de texto en imágenes)..."

    # Activar entorno virtual
    source "$PASCUAL_DIR/venv/bin/activate"

    # Instalar dependencias de sistema
    log_info "Instalando dependencias de sistema para OCR..."
    sudo apt install -y \
        tesseract-ocr \
        tesseract-ocr-spa \
        tesseract-ocr-eng \
        libgl1 \
        libgl1-mesa-glx \
        libglib2.0-0 \
        libsm6 \
        libxext6 \
        libxrender1 \
        poppler-utils

    # Instalar dependencias Python
    log_info "Instalando dependencias Python para OCR..."
    pip install \
        paddlepaddle \
        paddleocr \
        pytesseract \
        pdf2image \
        opencv-python-headless \
        pillow \
        numpy

    # Crear script principal del skill
    cat > "$SKILLS_DIR/ocr/ocr_skill.py" << 'EOF'
#!/usr/bin/env python3
"""
Pascual-Bot: Skill de OCR (Reconocimiento Óptico de Caracteres)
Extrae texto de imágenes y documentos escaneados
"""
import os
import sys
import logging
import argparse
from pathlib import Path
from typing import Dict, Any, Optional, List, Union
import json

import cv2
import numpy as np
import pytesseract
from PIL import Image
from pdf2image import convert_from_path

# Intentar importar PaddleOCR (más preciso pero más pesado)
try:
    from paddleocr import PaddleOCR
    PADDLE_AVAILABLE = True
except ImportError:
    PADDLE_AVAILABLE = False

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("OCR-Skill")

class OCRSkill:
    """Skill para extraer texto de imágenes y documentos"""

    def __init__(self, use_paddle: bool = True, language: str = "spa"):
        """Inicializar OCR skill"""
        self.language = language
        self.use_paddle = use_paddle and PADDLE_AVAILABLE

        # Inicializar OCR engines
        if self.use_paddle:
            try:
                logger.info("Inicializando PaddleOCR...")
                self.paddle_ocr = PaddleOCR(use_angle_cls=True, lang=language)
                logger.info("PaddleOCR inicializado")
            except Exception as e:
                logger.error(f"Error al inicializar PaddleOCR: {e}")
                self.use_paddle = False

        # Configurar Tesseract
        if not self.use_paddle or language != "spa":
            pytesseract.pytesseract.tesseract_cmd = self._find_tesseract()

    def _find_tesseract(self) -> str:
        """Encuentra la ruta de tesseract"""
        possible_paths = [
            "/usr/bin/tesseract",
            "/usr/local/bin/tesseract",
        ]

        for path in possible_paths:
            if os.path.exists(path):
                return path

        # Si no se encuentra, usar el valor por defecto
        return "tesseract"

    def process_image(self, image_path: str) -> Dict[str, Any]:
        """Procesar imagen y extraer texto"""
        if not os.path.exists(image_path):
            return {"success": False, "error": f"Imagen no encontrada: {image_path}"}

        try:
            # Leer imagen
            image = cv2.imread(image_path)
            if image is None:
                return {"success": False, "error": "No se pudo leer la imagen"}

            # Preprocesar imagen
            image = self._preprocess_image(image)

            # Extraer texto
            if self.use_paddle:
                text_data = self._extract_text_paddle(image)
            else:
                text_data = self._extract_text_tesseract(image)

            return {
                "success": True,
                "file_path": image_path,
                "text": text_data["text"],
                "confidence": text_data["confidence"],
                "engine": "paddle" if self.use_paddle else "tesseract"
            }
        except Exception as e:
            logger.error(f"Error al procesar imagen: {e}")
            return {"success": False, "error": str(e)}

    def process_pdf(self, pdf_path: str, pages: Optional[List[int]] = None) -> Dict[str, Any]:
        """Procesar PDF y extraer texto de todas las páginas"""
        if not os.path.exists(pdf_path):
            return {"success": False, "error": f"PDF no encontrado: {pdf_path}"}

        try:
            # Convertir PDF a imágenes
            images = convert_from_path(pdf_path, dpi=300, thread_count=os.cpu_count())

            # Procesar solo páginas específicas si se proporciona
            if pages:
                # Ajustar índices de páginas (PDF empieza en 1, array en 0)
                page_indices = [p-1 for p in pages if 0 < p <= len(images)]
                selected_images = [images[i] for i in page_indices]
            else:
                selected_images = images

            results = []
            for i, img in enumerate(selected_images):
                page_num = pages[i] if pages else i+1
                logger.info(f"Procesando página {page_num}...")

                # Convertir imagen PIL a OpenCV
                cv_image = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

                # Preprocesar imagen
                cv_image = self._preprocess_image(cv_image)

                # Extraer texto
                if self.use_paddle:
                    text_data = self._extract_text_paddle(cv_image)
                else:
                    text_data = self._extract_text_tesseract(cv_image)

                results.append({
                    "page": page_num,
                    "text": text_data["text"],
                    "confidence": text_data["confidence"]
                })

            return {
                "success": True,
                "file_path": pdf_path,
                "pages_count": len(images),
                "processed_pages": len(results),
                "results": results,
                "engine": "paddle" if self.use_paddle else "tesseract"
            }
        except Exception as e:
            logger.error(f"Error al procesar PDF: {e}")
            return {"success": False, "error": str(e)}

    def _preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """Preprocesar imagen para mejorar OCR"""
        # Convertir a escala de grises
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Aplicar filtro bilateral para reducir ruido manteniendo bordes
        blur = cv2.bilateralFilter(gray, 9, 75, 75)

        # Aplicar threshold adaptativo
        thresh = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                      cv2.THRESH_BINARY, 11, 2)

        return thresh

    def _extract_text_paddle(self, image: np.ndarray) -> Dict[str, Any]:
        """Extraer texto usando PaddleOCR"""
        # Convertir imagen OpenCV a PIL
        image_pil = Image.fromarray(image)

        # Realizar OCR
        result = self.paddle_ocr.ocr(np.array(image_pil), cls=True)

        # Extraer texto y confianza
        text_lines = []
        confidence_sum = 0
        confidence_count = 0

        if result:
            for line in result[0]:
                if line:
                    text = line[1][0]
                    confidence = float(line[1][1])
                    text_lines.append(text)
                    confidence_sum += confidence
                    confidence_count += 1

        # Calcular confianza promedio
        avg_confidence = confidence_sum / confidence_count if confidence_count > 0 else 0

        return {
            "text": "\n".join(text_lines),
            "confidence": avg_confidence
        }

    def _extract_text_tesseract(self, image: np.ndarray) -> Dict[str, Any]:
        """Extraer texto usando Tesseract"""
        # Realizar OCR
        custom_config = f'-l {self.language} --oem 1 --psm 3'
        text = pytesseract.image_to_string(image, config=custom_config)

        # Obtener datos de confianza
        data = pytesseract.image_to_data(image, config=custom_config, output_type=pytesseract.Output.DICT)
        confidences = [float(c) for c in data['conf'] if c != '-1']
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0

        return {
            "text": text,
            "confidence": avg_confidence
        }

def main():
    """Función principal"""
    parser = argparse.ArgumentParser(description="Pascual-Bot: OCR Skill")
    parser.add_argument("--image", "-i", help="Ruta a la imagen a procesar")
    parser.add_argument("--pdf", "-p", help="Ruta al PDF a procesar")
    parser.add_argument("--pages", help="Páginas específicas a procesar (separadas por comas)")
    parser.add_argument("--engine", choices=["paddle", "tesseract"], default="paddle",
                        help="Motor OCR a utilizar (paddle o tesseract)")
    parser.add_argument("--lang", default="spa", help="Lenguaje para OCR (spa, eng, etc.)")

    args = parser.parse_args()

    # Inicializar OCR skill
    use_paddle = args.engine == "paddle"
    ocr_skill = OCRSkill(use_paddle=use_paddle, language=args.lang)

    result = None

    # Procesar imagen o PDF
    if args.image:
        result = ocr_skill.process_image(args.image)
    elif args.pdf:
        pages = None
        if args.pages:
            pages = [int(p) for p in args.pages.split(",")]
        result = ocr_skill.process_pdf(args.pdf, pages)
    else:
        parser.print_help()
        return

    # Mostrar resultado como JSON
    print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
EOF

    # Hacer ejecutable
    chmod +x "$SKILLS_DIR/ocr/ocr_skill.py"

    log_info "Skill de OCR instalado correctamente ✓"
    return 0
}

# Instalar skill de procesamiento de PDF
install_pdf_skill() {
    log_step "Instalando skill de procesamiento de PDFs..."

    # Activar entorno virtual
    source "$PASCUAL_DIR/venv/bin/activate"

    # Instalar dependencias Python
    log_info "Instalando dependencias Python para PDF..."
    pip install \
        pdfplumber \
        PyMuPDF \
        pypdfium2 \
        PyPDF2 \
        pdf2image

    # Crear script principal del skill
    cat > "$SKILLS_DIR/pdf/pdf_skill.py" << 'EOF'
#!/usr/bin/env python3
"""
Pascual-Bot: Skill de Procesamiento de PDFs
Analiza, extrae texto, metadatos y estructura de documentos PDF
"""
import os
import sys
import logging
import argparse
from pathlib import Path
from typing import Dict, Any, Optional, List, Union
import json
import tempfile

import pdfplumber
import fitz  # PyMuPDF
from PyPDF2 import PdfReader
from pdf2image import convert_from_path

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("PDF-Skill")

class PDFSkill:
    """Skill para procesar y analizar documentos PDF"""

    def __init__(self):
        """Inicializar PDF skill"""
        pass

    def get_metadata(self, pdf_path: str) -> Dict[str, Any]:
        """Extraer metadatos de un PDF"""
        if not os.path.exists(pdf_path):
            return {"success": False, "error": f"PDF no encontrado: {pdf_path}"}

        try:
            # Usar PyPDF2 para metadatos
            with open(pdf_path, 'rb') as f:
                reader = PdfReader(f)
                info = reader.metadata

                # Convertir metadatos a diccionario
                metadata = {}
                if info:
                    for key in info:
                        # Filtrar claves internas
                        if not key.startswith('/'):
                            continue
                        clean_key = key[1:]  # Eliminar '/' inicial
                        value = info[key]
                        metadata[clean_key] = value

                # Información básica
                pages_count = len(reader.pages)
                file_size = os.path.getsize(pdf_path)

            return {
                "success": True,
                "file_path": pdf_path,
                "pages_count": pages_count,
                "file_size": file_size,
                "metadata": metadata
            }
        except Exception as e:
            logger.error(f"Error al extraer metadatos: {e}")
            return {"success": False, "error": str(e)}

    def extract_text(self, pdf_path: str, pages: Optional[List[int]] = None) -> Dict[str, Any]:
        """Extraer texto de un PDF"""
        if not os.path.exists(pdf_path):
            return {"success": False, "error": f"PDF no encontrado: {pdf_path}"}

        try:
            # Usar pdfplumber para extraer texto
            with pdfplumber.open(pdf_path) as pdf:
                # Determinar páginas a procesar
                if pages:
                    # Ajustar índices de páginas (PDF empieza en 1, array en 0)
                    page_indices = [p-1 for p in pages if 0 < p <= len(pdf.pages)]
                    pdf_pages = [pdf.pages[i] for i in page_indices]
                    page_numbers = pages
                else:
                    pdf_pages = pdf.pages
                    page_numbers = list(range(1, len(pdf.pages) + 1))

                results = []
                for i, page in enumerate(pdf_pages):
                    page_num = page_numbers[i]
                    logger.info(f"Extrayendo texto de página {page_num}...")
                    text = page.extract_text() or ""
                    results.append({
                        "page": page_num,
                        "text": text,
                        "chars_count": len(text)
                    })

            return {
                "success": True,
                "file_path": pdf_path,
                "pages_processed": len(results),
                "results": results
            }
        except Exception as e:
            logger.error(f"Error al extraer texto: {e}")
            return {"success": False, "error": str(e)}

    def extract_tables(self, pdf_path: str, pages: Optional[List[int]] = None) -> Dict[str, Any]:
        """Extraer tablas de un PDF"""
        if not os.path.exists(pdf_path):
            return {"success": False, "error": f"PDF no encontrado: {pdf_path}"}

        try:
            # Usar pdfplumber para extraer tablas
            with pdfplumber.open(pdf_path) as pdf:
                # Determinar páginas a procesar
                if pages:
                    # Ajustar índices de páginas (PDF empieza en 1, array en 0)
                    page_indices = [p-1 for p in pages if 0 < p <= len(pdf.pages)]
                    pdf_pages = [pdf.pages[i] for i in page_indices]
                    page_numbers = pages
                else:
                    pdf_pages = pdf.pages
                    page_numbers = list(range(1, len(pdf.pages) + 1))

                results = []
                for i, page in enumerate(pdf_pages):
                    page_num = page_numbers[i]
                    logger.info(f"Extrayendo tablas de página {page_num}...")
                    tables = page.extract_tables()

                    page_tables = []
                    for table in tables:
                        # Convertir tabla a formato JSON serializable
                        clean_table = []
                        for row in table:
                            clean_row = [str(cell).strip() if cell is not None else "" for cell in row]
                            clean_table.append(clean_row)

                        page_tables.append(clean_table)

                    results.append({
                        "page": page_num,
                        "tables": page_tables,
                        "tables_count": len(page_tables)
                    })

            return {
                "success": True,
                "file_path": pdf_path,
                "pages_processed": len(results),
                "results": results
            }
        except Exception as e:
            logger.error(f"Error al extraer tablas: {e}")
            return {"success": False, "error": str(e)}

    def extract_images(self, pdf_path: str, pages: Optional[List[int]] = None, output_dir: Optional[str] = None) -> Dict[str, Any]:
        """Extraer imágenes de un PDF"""
        if not os.path.exists(pdf_path):
            return {"success": False, "error": f"PDF no encontrado: {pdf_path}"}

        # Crear directorio temporal si no se proporciona uno
        if not output_dir:
            output_dir = tempfile.mkdtemp()
        else:
            os.makedirs(output_dir, exist_ok=True)

        try:
            # Usar PyMuPDF para extraer imágenes
            doc = fitz.open(pdf_path)

            # Determinar páginas a procesar
            if pages:
                # Ajustar índices de páginas (PDF empieza en 1, array en 0)
                page_indices = [p-1 for p in pages if 0 < p <= len(doc)]
                pdf_pages = [doc[i] for i in page_indices]
                page_numbers = pages
            else:
                pdf_pages = [doc[i] for i in range(len(doc))]
                page_numbers = list(range(1, len(doc) + 1))

            results = []
            image_count = 0

            for i, page in enumerate(pdf_pages):
                page_num = page_numbers[i]
                logger.info(f"Extrayendo imágenes de página {page_num}...")

                # Extraer imágenes
                image_list = page.get_images(full=True)
                page_images = []

                for img_idx, img in enumerate(image_list):
                    image_count += 1
                    xref = img[0]
                    base_image = doc.extract_image(xref)

                    if base_image:
                        image_bytes = base_image["image"]
                        image_ext = base_image["ext"]
                        image_filename = f"page{page_num}_img{img_idx+1}.{image_ext}"
                        image_path = os.path.join(output_dir, image_filename)

                        # Guardar imagen
                        with open(image_path, "wb") as f:
                            f.write(image_bytes)

                        page_images.append({
                            "filename": image_filename,
                            "path": image_path,
                            "size": len(image_bytes)
                        })

                results.append({
                    "page": page_num,
                    "images": page_images,
                    "images_count": len(page_images)
                })

            return {
                "success": True,
                "file_path": pdf_path,
                "output_dir": output_dir,
                "pages_processed": len(results),
                "total_images": image_count,
                "results": results
            }
        except Exception as e:
            logger.error(f"Error al extraer imágenes: {e}")
            return {"success": False, "error": str(e)}
        finally:
            if 'doc' in locals():
                doc.close()

    def split_pdf(self, pdf_path: str, output_dir: str, pages: Optional[List[Union[int, List[int]]]] = None) -> Dict[str, Any]:
        """
        Dividir un PDF en varios archivos

        pages puede ser una lista de números de página individuales o rangos:
        [1, [2, 4], 6] -> página 1, páginas 2-4, página 6
        """
        if not os.path.exists(pdf_path):
            return {"success": False, "error": f"PDF no encontrado: {pdf_path}"}

        # Crear directorio de salida
        os.makedirs(output_dir, exist_ok=True)

        try:
            # Abrir documento
            doc = fitz.open(pdf_path)
            base_name = Path(pdf_path).stem
            output_files = []

            # Si no se especifican páginas, crear un PDF por página
            if not pages:
                for i in range(len(doc)):
                    out_doc = fitz.open()
                    out_doc.insert_pdf(doc, from_page=i, to_page=i)

                    out_path = os.path.join(output_dir, f"{base_name}_p{i+1}.pdf")
                    out_doc.save(out_path)
                    out_doc.close()

                    output_files.append({
                        "path": out_path,
                        "pages": [i+1]
                    })
            else:
                # Procesar páginas especificadas
                for i, page_spec in enumerate(pages):
                    out_doc = fitz.open()

                    if isinstance(page_spec, list):
                        # Rango de páginas
                        start, end = page_spec
                        # Ajustar índices (PDF empieza en 1, PyMuPDF en 0)
                        start_idx = start - 1
                        end_idx = end - 1

                        out_doc.insert_pdf(doc, from_page=start_idx, to_page=end_idx)
                        out_path = os.path.join(output_dir, f"{base_name}_p{start}-{end}.pdf")

                        output_files.append({
                            "path": out_path,
                            "pages": list(range(start, end + 1))
                        })
                    else:
                        # Página individual
                        page_idx = page_spec - 1
                        out_doc.insert_pdf(doc, from_page=page_idx, to_page=page_idx)
                        out_path = os.path.join(output_dir, f"{base_name}_p{page_spec}.pdf")

                        output_files.append({
                            "path": out_path,
                            "pages": [page_spec]
                        })

                    out_doc.save(out_path)
                    out_doc.close()

            return {
                "success": True,
                "file_path": pdf_path,
                "output_dir": output_dir,
                "files_created": len(output_files),
                "output_files": output_files
            }
        except Exception as e:
            logger.error(f"Error al dividir PDF: {e}")
            return {"success": False, "error": str(e)}
        finally:
            if 'doc' in locals():
                doc.close()

def main():
    """Función principal"""
    parser = argparse.ArgumentParser(description="Pascual-Bot: PDF Skill")
    parser.add_argument("--pdf", "-p", required=True, help="Ruta al PDF a procesar")
    parser.add_argument("--action", "-a", choices=["metadata", "text", "tables", "images", "split"],
                       default="metadata", help="Acción a realizar")
    parser.add_argument("--pages", help="Páginas específicas a procesar (separadas por comas)")
    parser.add_argument("--output-dir", "-o", help="Directorio de salida para imágenes o PDFs divididos")

    args = parser.parse_args()

    # Inicializar PDF skill
    pdf_skill = PDFSkill()

    # Procesar páginas si se especifican
    pages = None
    if args.pages:
        # Convertir especificación de páginas a lista
        pages_spec = args.pages.split(",")
        pages = []

        for spec in pages_spec:
            if "-" in spec:
                # Rango de páginas
                start, end = map(int, spec.split("-"))
                pages.append([start, end])
            else:
                # Página individual
                pages.append(int(spec))

    # Ejecutar acción solicitada
    result = None

    if args.action == "metadata":
        result = pdf_skill.get_metadata(args.pdf)
    elif args.action == "text":
        result = pdf_skill.extract_text(args.pdf, pages)
    elif args.action == "tables":
        result = pdf_skill.extract_tables(args.pdf, pages)
    elif args.action == "images":
        result = pdf_skill.extract_images(args.pdf, pages, args.output_dir)
    elif args.action == "split":
        if not args.output_dir:
            parser.error("Se requiere directorio de salida (--output-dir) para dividir PDF")
        result = pdf_skill.split_pdf(args.pdf, args.output_dir, pages)

    # Mostrar resultado como JSON
    print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
EOF

    # Hacer ejecutable
    chmod +x "$SKILLS_DIR/pdf/pdf_skill.py"

    log_info "Skill de procesamiento de PDF instalado correctamente ✓"
    return 0
}

# Instalar skill de visión
install_vision_skill() {
    log_step "Instalando skill de visión..."

    # Activar entorno virtual
    source "$PASCUAL_DIR/venv/bin/activate"

    # Instalar dependencias
    log_info "Instalando dependencias para visión..."
    pip install \
        torch \
        torchvision \
        opencv-python-headless \
        pillow \
        numpy \
        scikit-image

    # Crear script principal del skill
    cat > "$SKILLS_DIR/vision/vision_skill.py" << 'EOF'
#!/usr/bin/env python3
"""
Pascual-Bot: Skill de Visión
Analiza y procesa imágenes usando modelos de visión por computadora
"""
import os
import sys
import logging
import argparse
from pathlib import Path
from typing import Dict, Any, Optional, List, Union
import json
import base64

import cv2
import numpy as np
from PIL import Image
import torch

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("Vision-Skill")

class VisionSkill:
    """Skill para análisis de imágenes"""

    def __init__(self):
        """Inicializar Vision skill"""
        self.models = {}

        # Verificar disponibilidad de CUDA
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Usando dispositivo: {self.device}")

    def _load_model(self, model_name: str) -> bool:
        """Cargar modelo de visión bajo demanda"""
        try:
            if model_name == "detection":
                # Cargar modelo de detección de objetos (COCO)
                import torchvision
                self.models[model_name] = torchvision.models.detection.fasterrcnn_resnet50_fpn_v2(pretrained=True)
                self.models[model_name].eval().to(self.device)

                # Cargar etiquetas COCO
                self.coco_labels = [
                    '__background__', 'persona', 'bicicleta', 'coche', 'motocicleta', 'avión',
                    'autobús', 'tren', 'camión', 'barco', 'semáforo', 'boca de incendio',
                    'señal de stop', 'parquímetro', 'banco', 'pájaro', 'gato', 'perro', 'caballo',
                    'oveja', 'vaca', 'elefante', 'oso', 'cebra', 'jirafa', 'mochila', 'paraguas',
                    'bolso', 'corbata', 'maleta', 'frisbee', 'esquís', 'tabla de snowboard',
                    'pelota deportiva', 'cometa', 'bate de béisbol', 'guante de béisbol', 'monopatín',
                    'tabla de surf', 'raqueta de tenis', 'botella', 'copa de vino', 'taza', 'tenedor',
                    'cuchillo', 'cuchara', 'bol', 'plátano', 'manzana', 'sándwich', 'naranja',
                    'brócoli', 'zanahoria', 'perrito caliente', 'pizza', 'donut', 'tarta', 'silla',
                    'sofá', 'planta en maceta', 'cama', 'mesa de comedor', 'inodoro', 'televisor',
                    'portátil', 'ratón', 'control remoto', 'teclado', 'teléfono móvil', 'microondas',
                    'horno', 'tostadora', 'fregadero', 'refrigerador', 'libro', 'reloj', 'jarrón',
                    'tijeras', 'osito de peluche', 'secador de pelo', 'cepillo de dientes'
                ]
                return True

            elif model_name == "classification":
                # Cargar modelo de clasificación (ImageNet)
                import torchvision
                self.models[model_name] = torchvision.models.resnet50(pretrained=True)
                self.models[model_name].eval().to(self.device)
                return True

            elif model_name == "segmentation":
                # Cargar modelo de segmentación semántica
                import torchvision
                self.models[model_name] = torchvision.models.segmentation.deeplabv3_resnet101(pretrained=True)
                self.models[model_name].eval().to(self.device)
                return True

            else:
                logger.error(f"Modelo desconocido: {model_name}")
                return False

        except Exception as e:
            logger.error(f"Error al cargar modelo {model_name}: {e}")
            return False

    def _preprocess_image(self, image_path: str, target_size: Optional[tuple] = None) -> Union[torch.Tensor, np.ndarray]:
        """Preprocesar imagen para el modelo"""
        # Cargar imagen
        if isinstance(image_path, str):
            image = Image.open(image_path).convert('RGB')
        else:
            image = image_path  # Asumir que ya es un objeto PIL.Image

        # Redimensionar si se especifica
        if target_size:
            image = image.resize(target_size, Image.BILINEAR)

        # Convertir a tensor
        import torchvision.transforms as T
        transform = T.Compose([
            T.ToTensor(),
            T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

        image_tensor = transform(image).unsqueeze(0).to(self.device)
        return image_tensor

    def detect_objects(self, image_path: str, threshold: float = 0.5) -> Dict[str, Any]:
        """Detectar objetos en una imagen"""
        if not os.path.exists(image_path):
            return {"success": False, "error": f"Imagen no encontrada: {image_path}"}

        try:
            # Cargar modelo si no está cargado
            if "detection" not in self.models:
                if not self._load_model("detection"):
                    return {"success": False, "error": "No se pudo cargar el modelo de detección"}

            # Cargar y preprocesar imagen
            image = Image.open(image_path).convert('RGB')
            image_tensor = self._preprocess_image(image)

            # Inferencia
            with torch.no_grad():
                prediction = self.models["detection"](image_tensor)

            # Extraer resultados
            boxes = prediction[0]['boxes'].cpu().numpy()
            labels = prediction[0]['labels'].cpu().numpy()
            scores = prediction[0]['scores'].cpu().numpy()

            # Filtrar por umbral de confianza
            mask = scores >= threshold
            boxes = boxes[mask]
            labels = labels[mask]
            scores = scores[mask]

            # Preparar resultados
            detections = []
            for box, label_id, score in zip(boxes, labels, scores):
                x1, y1, x2, y2 = box.astype(int)
                label = self.coco_labels[label_id]

                detections.append({
                    "label": label,
                    "score": float(score),
                    "box": [int(x1), int(y1), int(x2), int(y2)]
                })

            return {
                "success": True,
                "file_path": image_path,
                "image_size": [image.width, image.height],
                "detections": detections,
                "detections_count": len(detections)
            }

        except Exception as e:
            logger.error(f"Error al detectar objetos: {e}")
            return {"success": False, "error": str(e)}

    def classify_image(self, image_path: str, top_k: int = 5) -> Dict[str, Any]:
        """Clasificar una imagen en categorías"""
        if not os.path.exists(image_path):
            return {"success": False, "error": f"Imagen no encontrada: {image_path}"}

        try:
            # Cargar modelo si no está cargado
            if "classification" not in self.models:
                if not self._load_model("classification"):
                    return {"success": False, "error": "No se pudo cargar el modelo de clasificación"}

            # Cargar etiquetas ImageNet
            labels_path = Path(__file__).parent / "imagenet_labels.txt"
            if not labels_path.exists():
                # Crear archivo de etiquetas si no existe
                import urllib.request
                url = "https://raw.githubusercontent.com/pytorch/hub/master/imagenet_classes.txt"
                urllib.request.urlretrieve(url, labels_path)

            with open(labels_path, "r") as f:
                imagenet_labels = [line.strip() for line in f.readlines()]

            # Cargar y preprocesar imagen
            image_tensor = self._preprocess_image(image_path, (224, 224))

            # Inferencia
            with torch.no_grad():
                output = self.models["classification"](image_tensor)

            # Obtener top-k clases
            probabilities = torch.nn.functional.softmax(output[0], dim=0)
            top_probs, top_indices = torch.topk(probabilities, top_k)

            # Convertir a listas
            probs = top_probs.cpu().numpy().tolist()
            indices = top_indices.cpu().numpy().tolist()

            # Preparar resultados
            classifications = []
            for i, idx in enumerate(indices):
                classifications.append({
                    "label": imagenet_labels[idx],
                    "probability": probs[i]
                })

            return {
                "success": True,
                "file_path": image_path,
                "classifications": classifications
            }

        except Exception as e:
            logger.error(f"Error al clasificar imagen: {e}")
            return {"success": False, "error": str(e)}

    def analyze_image(self, image_path: str) -> Dict[str, Any]:
        """Análisis completo de una imagen (clasificación + detección)"""
        if not os.path.exists(image_path):
            return {"success": False, "error": f"Imagen no encontrada: {image_path}"}

        try:
            # Ejecutar clasificación
            classification_result = self.classify_image(image_path)

            # Ejecutar detección de objetos
            detection_result = self.detect_objects(image_path)

            # Combinar resultados
            return {
                "success": True,
                "file_path": image_path,
                "classification": classification_result.get("classifications", []),
                "objects": detection_result.get("detections", []),
                "image_size": detection_result.get("image_size", [])
            }

        except Exception as e:
            logger.error(f"Error al analizar imagen: {e}")
            return {"success": False, "error": str(e)}

def main():
    """Función principal"""
    parser = argparse.ArgumentParser(description="Pascual-Bot: Vision Skill")
    parser.add_argument("--image", "-i", required=True, help="Ruta a la imagen a procesar")
    parser.add_argument("--action", "-a", choices=["detect", "classify", "analyze"],
                       default="analyze", help="Acción a realizar")
    parser.add_argument("--threshold", "-t", type=float, default=0.5,
                       help="Umbral de confianza para detección (0-1)")
    parser.add_argument("--top-k", "-k", type=int, default=5,
                       help="Número de clases principales para clasificación")

    args = parser.parse_args()

    # Inicializar Vision skill
    vision_skill = VisionSkill()

    # Ejecutar acción solicitada
    result = None

    if args.action == "detect":
        result = vision_skill.detect_objects(args.image, args.threshold)
    elif args.action == "classify":
        result = vision_skill.classify_image(args.image, args.top_k)
    elif args.action == "analyze":
        result = vision_skill.analyze_image(args.image)

    # Mostrar resultado como JSON
    print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
EOF

    # Hacer ejecutable
    chmod +x "$SKILLS_DIR/vision/vision_skill.py"

    log_info "Skill de visión instalado correctamente ✓"
    return 0
}

# Instalar skill de integración con Notion (opcional)
install_notion_skill() {
    log_step "Instalando skill de integración con Notion (opcional)..."

    # Activar entorno virtual
    source "$PASCUAL_DIR/venv/bin/activate"

    # Instalar dependencias Python
    log_info "Instalando dependencias Python para Notion..."
    pip install \
        notion-client \
        python-slugify

    # Crear script principal del skill
    cat > "$SKILLS_DIR/notion/notion_skill.py" << 'EOF'
#!/usr/bin/env python3
"""
Pascual-Bot: Skill de Integración con Notion
Permite interactuar con Notion (páginas, bases de datos, etc.)
"""
import os
import sys
import logging
import argparse
from pathlib import Path
from typing import Dict, Any, Optional, List, Union
import json
from slugify import slugify

try:
    from notion_client import Client
    NOTION_AVAILABLE = True
except ImportError:
    NOTION_AVAILABLE = False

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("Notion-Skill")

class NotionSkill:
    """Skill para integración con Notion"""

    def __init__(self, api_key: Optional[str] = None):
        """Inicializar Notion skill"""
        self.api_key = api_key or os.environ.get("NOTION_API_KEY")
        self.client = None

        if not self.api_key:
            logger.warning("API Key de Notion no proporcionada")
            return

        if not NOTION_AVAILABLE:
            logger.error("Paquete notion-client no instalado")
            return

        try:
            self.client = Client(auth=self.api_key)
            logger.info("Cliente de Notion inicializado correctamente")
        except Exception as e:
            logger.error(f"Error al inicializar cliente de Notion: {e}")

    def list_databases(self) -> Dict[str, Any]:
        """Listar bases de datos disponibles"""
        if not self.client:
            return {"success": False, "error": "Cliente de Notion no inicializado"}

        try:
            # Búsqueda de bases de datos
            response = self.client.search(filter={"property": "object", "value": "database"})

            databases = []
            for item in response.get("results", []):
                db_id = item["id"]
                db_title = self._extract_title(item)

                databases.append({
                    "id": db_id,
                    "title": db_title,
                    "url": item.get("url")
                })

            return {
                "success": True,
                "databases": databases,
                "count": len(databases)
            }

        except Exception as e:
            logger.error(f"Error al listar bases de datos: {e}")
            return {"success": False, "error": str(e)}

    def get_database(self, database_id: str) -> Dict[str, Any]:
        """Obtener detalles de una base de datos"""
        if not self.client:
            return {"success": False, "error": "Cliente de Notion no inicializado"}

        try:
            database = self.client.databases.retrieve(database_id)

            # Extraer propiedades
            properties = {}
            for name, prop in database.get("properties", {}).items():
                prop_type = prop.get("type")
                properties[name] = {
                    "type": prop_type,
                    "id": prop.get("id")
                }

                # Extraer opciones para select/multi_select
                if prop_type in ["select", "multi_select"]:
                    properties[name]["options"] = [
                        {"id": opt.get("id"), "name": opt.get("name"), "color": opt.get("color")}
                        for opt in prop.get("select", {}).get("options", [])
                    ]

            return {
                "success": True,
                "id": database["id"],
                "title": self._extract_title(database),
                "url": database.get("url"),
                "properties": properties
            }

        except Exception as e:
            logger.error(f"Error al obtener base de datos: {e}")
            return {"success": False, "error": str(e)}

    def query_database(self, database_id: str, query_params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Consultar base de datos"""
        if not self.client:
            return {"success": False, "error": "Cliente de Notion no inicializado"}

        try:
            # Parámetros por defecto
            params = {
                "page_size": 100
            }

            # Añadir parámetros adicionales
            if query_params:
                params.update(query_params)

            # Ejecutar consulta
            results = self.client.databases.query(database_id, **params)

            # Procesar resultados
            items = []
            for page in results.get("results", []):
                page_id = page["id"]
                page_url = page.get("url")

                # Extraer propiedades
                properties = {}
                for name, prop in page.get("properties", {}).items():
                    prop_type = prop.get("type")

                    if prop_type == "title":
                        properties[name] = self._extract_rich_text(prop.get("title"))
                    elif prop_type == "rich_text":
                        properties[name] = self._extract_rich_text(prop.get("rich_text"))
                    elif prop_type == "number":
                        properties[name] = prop.get("number")
                    elif prop_type == "select":
                        select_data = prop.get("select")
                        properties[name] = select_data.get("name") if select_data else None
                    elif prop_type == "multi_select":
                        properties[name] = [item.get("name") for item in prop.get("multi_select", [])]
                    elif prop_type == "date":
                        date_data = prop.get("date")
                        if date_data:
                            properties[name] = {
                                "start": date_data.get("start"),
                                "end": date_data.get("end")
                            }
                        else:
                            properties[name] = None
                    elif prop_type == "checkbox":
                        properties[name] = prop.get("checkbox")
                    elif prop_type == "url":
                        properties[name] = prop.get("url")
                    elif prop_type == "email":
                        properties[name] = prop.get("email")
                    elif prop_type == "phone_number":
                        properties[name] = prop.get("phone_number")
                    elif prop_type == "formula":
                        formula_result = prop.get("formula")
                        if formula_result:
                            result_type = formula_result.get("type")
                            properties[name] = formula_result.get(result_type)
                        else:
                            properties[name] = None
                    else:
                        # Tipos no procesados
                        properties[name] = f"[{prop_type}]"

                items.append({
                    "id": page_id,
                    "url": page_url,
                    "properties": properties
                })

            return {
                "success": True,
                "database_id": database_id,
                "items": items,
                "count": len(items),
                "has_more": results.get("has_more", False),
                "next_cursor": results.get("next_cursor")
            }

        except Exception as e:
            logger.error(f"Error al consultar base de datos: {e}")
            return {"success": False, "error": str(e)}

    def create_page(self, parent_id: str, parent_type: str = "database", properties: Optional[Dict[str, Any]] = None, content: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Crear una página en Notion

        parent_type: "database" o "page"
        properties: Propiedades específicas según el esquema de la base de datos
        content: Bloques de contenido para la página
        """
        if not self.client:
            return {"success": False, "error": "Cliente de Notion no inicializado"}

        try:
            # Configurar parent
            if parent_type == "database":
                parent = {"database_id": parent_id}
            else:
                parent = {"page_id": parent_id}

            # Preparar solicitud
            request = {
                "parent": parent,
                "properties": properties or {}
            }

            # Añadir contenido si existe
            if content:
                request["children"] = content

            # Crear página
            response = self.client.pages.create(**request)

            return {
                "success": True,
                "id": response["id"],
                "url": response.get("url")
            }

        except Exception as e:
            logger.error(f"Error al crear página: {e}")
            return {"success": False, "error": str(e)}

    def _extract_title(self, obj: Dict[str, Any]) -> str:
        """Extraer título de un objeto Notion"""
        title = ""

        # Para bases de datos
        if "title" in obj:
            title_items = obj.get("title", [])
            title = "".join([item.get("plain_text", "") for item in title_items])

        # Para páginas con propiedades
        elif "properties" in obj:
            for _, prop in obj.get("properties", {}).items():
                if prop.get("type") == "title":
                    title_items = prop.get("title", [])
                    title = "".join([item.get("plain_text", "") for item in title_items])
                    break

        return title

    def _extract_rich_text(self, rich_text: List[Dict[str, Any]]) -> str:
        """Extraer texto plano de rich_text"""
        if not rich_text:
            return ""

        return "".join([item.get("plain_text", "") for item in rich_text])

def main():
    """Función principal"""
    parser = argparse.ArgumentParser(description="Pascual-Bot: Notion Skill")
    parser.add_argument("--api-key", help="API Key de Notion")
    parser.add_argument("--action", "-a", choices=["list-dbs", "get-db", "query-db", "create-page"],
                       default="list-dbs", help="Acción a realizar")
    parser.add_argument("--database-id", help="ID de la base de datos")
    parser.add_argument("--page-id", help="ID de la página")
    parser.add_argument("--parent-type", choices=["database", "page"], default="database",
                       help="Tipo de parent para crear página")
    parser.add_argument("--properties", help="Propiedades en formato JSON")
    parser.add_argument("--content", help="Contenido en formato JSON")
    parser.add_argument("--query", help="Parámetros de consulta en formato JSON")

    args = parser.parse_args()

    # Obtener API Key
    api_key = args.api_key or os.environ.get("NOTION_API_KEY")
    if not api_key:
        print("Error: Se requiere API Key de Notion")
        print("  Opciones: --api-key o variable de entorno NOTION_API_KEY")
        sys.exit(1)

    # Inicializar Notion skill
    notion_skill = NotionSkill(api_key)

    # Ejecutar acción solicitada
    result = None

    if args.action == "list-dbs":
        result = notion_skill.list_databases()
    elif args.action == "get-db":
        if not args.database_id:
            print("Error: Se requiere database-id")
            sys.exit(1)
        result = notion_skill.get_database(args.database_id)
    elif args.action == "query-db":
        if not args.database_id:
            print("Error: Se requiere database-id")
            sys.exit(1)

        query_params = json.loads(args.query) if args.query else None
        result = notion_skill.query_database(args.database_id, query_params)
    elif args.action == "create-page":
        parent_id = args.database_id or args.page_id
        if not parent_id:
            print("Error: Se requiere database-id o page-id")
            sys.exit(1)

        properties = json.loads(args.properties) if args.properties else None
        content = json.loads(args.content) if args.content else None

        result = notion_skill.create_page(parent_id, args.parent_type, properties, content)

    # Mostrar resultado como JSON
    print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
EOF

    # Hacer ejecutable
    chmod +x "$SKILLS_DIR/notion/notion_skill.py"

    log_info "Skill de Notion instalado correctamente ✓"
    return 0
}

# Instalar skill de integración con Calendario (opcional)
install_calendar_skill() {
    log_step "Instalando skill de integración con Calendario (opcional)..."

    # Activar entorno virtual
    source "$PASCUAL_DIR/venv/bin/activate"

    # Instalar dependencias Python
    log_info "Instalando dependencias Python para Calendario..."
    pip install \
        google-api-python-client \
        google-auth-httplib2 \
        google-auth-oauthlib \
        icalendar \
        recurring-ical-events

    # Crear script principal del skill
    cat > "$SKILLS_DIR/calendar/calendar_skill.py" << 'EOF'
#!/usr/bin/env python3
"""
Pascual-Bot: Skill de Calendario
Permite gestionar eventos, citas y recordatorios
"""
import os
import sys
import logging
import argparse
from pathlib import Path
from typing import Dict, Any, Optional, List, Union
import json
import datetime
import pickle

try:
    from google.auth.transport.requests import Request
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    GOOGLE_CALENDAR_AVAILABLE = True
except ImportError:
    GOOGLE_CALENDAR_AVAILABLE = False

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("Calendar-Skill")

class CalendarSkill:
    """Skill para gestión de calendario"""

    def __init__(self, user_id: str, credentials_path: Optional[str] = None):
        """
        Inicializar Calendar skill

        user_id: ID del usuario (para almacenar credenciales separadas)
        credentials_path: Ruta al archivo de credenciales de Google
        """
        self.user_id = user_id
        self.credentials_path = credentials_path
        self.service = None

        # Base de datos local de eventos (para no depender 100% de Google)
        self.events_db_path = Path.home() / ".pascual" / "users" / user_id / "data" / "calendar_events.json"
        self.events_db = self._load_events_db()

    def _load_events_db(self) -> Dict[str, Any]:
        """Cargar base de datos local de eventos"""
        if self.events_db_path.exists():
            try:
                with open(self.events_db_path, "r") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error al cargar base de datos de eventos: {e}")

        # Crear estructura inicial
        return {
            "events": [],
            "last_updated": datetime.datetime.now().isoformat()
        }

    def _save_events_db(self) -> bool:
        """Guardar base de datos local de eventos"""
        try:
            # Crear directorio si no existe
            self.events_db_path.parent.mkdir(parents=True, exist_ok=True)

            # Actualizar timestamp
            self.events_db["last_updated"] = datetime.datetime.now().isoformat()

            # Guardar en archivo
            with open(self.events_db_path, "w") as f:
                json.dump(self.events_db, f, indent=2)

            return True
        except Exception as e:
            logger.error(f"Error al guardar base de datos de eventos: {e}")
            return False

    def _authenticate_google(self) -> bool:
        """Autenticar con Google Calendar API"""
        if not GOOGLE_CALENDAR_AVAILABLE:
            logger.error("Dependencias de Google Calendar no instaladas")
            return False

        if not self.credentials_path:
            logger.error("No se proporcionó archivo de credenciales")
            return False

        # Definir permisos
        SCOPES = ['https://www.googleapis.com/auth/calendar']

        # Archivo de token para este usuario
        token_path = Path.home() / ".pascual" / "users" / self.user_id / "data" / "calendar_token.pickle"

        creds = None
        # Cargar credenciales existentes
        if token_path.exists():
            with open(token_path, 'rb') as token:
                creds = pickle.load(token)

        # Refrescar o crear credenciales
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                try:
                    flow = InstalledAppFlow.from_client_secrets_file(self.credentials_path, SCOPES)
                    creds = flow.run_local_server(port=0)
                except Exception as e:
                    logger.error(f"Error en flujo de autenticación: {e}")
                    return False

            # Guardar token
            token_path.parent.mkdir(parents=True, exist_ok=True)
            with open(token_path, 'wb') as token:
                pickle.dump(creds, token)

        # Crear servicio
        try:
            self.service = build('calendar', 'v3', credentials=creds)
            return True
        except Exception as e:
            logger.error(f"Error al crear servicio: {e}")
            return False

    def get_events(self, start_date: Optional[str] = None, end_date: Optional[str] = None, max_results: int = 10) -> Dict[str, Any]:
        """
        Obtener eventos del calendario

        start_date: Fecha inicial (formato ISO, ej: '2026-03-05T00:00:00Z')
        end_date: Fecha final (formato ISO)
        max_results: Número máximo de resultados
        """
        # Si tenemos Google Calendar configurado, intentar usar la API
        if self._authenticate_google():
            try:
                # Configurar timeMin y timeMax
                now = datetime.datetime.utcnow()

                if start_date:
                    time_min = start_date
                else:
                    time_min = now.isoformat() + 'Z'  # 'Z' indica UTC

                if end_date:
                    time_max = end_date
                else:
                    # Por defecto, una semana adelante
                    time_max = (now + datetime.timedelta(days=7)).isoformat() + 'Z'

                # Llamar a la API
                events_result = self.service.events().list(
                    calendarId='primary',
                    timeMin=time_min,
                    timeMax=time_max,
                    maxResults=max_results,
                    singleEvents=True,
                    orderBy='startTime'
                ).execute()

                events = events_result.get('items', [])

                # Procesar eventos
                processed_events = []
                for event in events:
                    start = event['start'].get('dateTime', event['start'].get('date'))
                    end = event['end'].get('dateTime', event['end'].get('date'))

                    processed_events.append({
                        'id': event['id'],
                        'summary': event.get('summary', 'Sin título'),
                        'start': start,
                        'end': end,
                        'location': event.get('location', ''),
                        'description': event.get('description', ''),
                        'source': 'google'
                    })

                # Actualizar base de datos local con los eventos de Google
                self._update_local_events(processed_events)

                return {
                    'success': True,
                    'events': processed_events,
                    'count': len(processed_events)
                }

            except Exception as e:
                logger.error(f"Error al obtener eventos de Google Calendar: {e}")
                # Fallback a base de datos local
                return self._get_local_events(start_date, end_date, max_results)
        else:
            # Usar base de datos local
            return self._get_local_events(start_date, end_date, max_results)

    def _get_local_events(self, start_date: Optional[str] = None, end_date: Optional[str] = None, max_results: int = 10) -> Dict[str, Any]:
        """Obtener eventos de la base de datos local"""
        try:
            # Filtrar por fechas si se proporcionan
            filtered_events = self.events_db["events"]

            if start_date:
                start_dt = datetime.datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                filtered_events = [e for e in filtered_events if datetime.datetime.fromisoformat(e['start'].replace('Z', '+00:00')) >= start_dt]

            if end_date:
                end_dt = datetime.datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                filtered_events = [e for e in filtered_events if datetime.datetime.fromisoformat(e['start'].replace('Z', '+00:00')) <= end_dt]

            # Ordenar por fecha de inicio
            filtered_events.sort(key=lambda e: e['start'])

            # Limitar resultados
            filtered_events = filtered_events[:max_results]

            return {
                'success': True,
                'events': filtered_events,
                'count': len(filtered_events),
                'source': 'local'
            }
        except Exception as e:
            logger.error(f"Error al obtener eventos locales: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def _update_local_events(self, events: List[Dict[str, Any]]) -> None:
        """Actualizar base de datos local con eventos de Google"""
        # Crear un mapa de eventos existentes por ID
        existing_events = {e['id']: e for e in self.events_db["events"] if 'id' in e}

        # Actualizar eventos existentes y añadir nuevos
        for event in events:
            existing_events[event['id']] = event

        # Actualizar base de datos
        self.events_db["events"] = list(existing_events.values())
        self._save_events_db()

    def create_event(self, summary: str, start_time: str, end_time: str, description: str = "", location: str = "") -> Dict[str, Any]:
        """
        Crear un evento en el calendario

        summary: Título del evento
        start_time: Hora de inicio (formato ISO)
        end_time: Hora de fin (formato ISO)
        description: Descripción del evento
        location: Ubicación del evento
        """
        # Intentar crear en Google Calendar
        if self._authenticate_google():
            try:
                # Preparar evento
                event = {
                    'summary': summary,
                    'location': location,
                    'description': description,
                    'start': {
                        'dateTime': start_time,
                        'timeZone': 'America/Bogota',
                    },
                    'end': {
                        'dateTime': end_time,
                        'timeZone': 'America/Bogota',
                    },
                }

                # Insertar evento
                event = self.service.events().insert(calendarId='primary', body=event).execute()

                # Añadir a base de datos local
                local_event = {
                    'id': event['id'],
                    'summary': summary,
                    'start': start_time,
                    'end': end_time,
                    'location': location,
                    'description': description,
                    'source': 'google'
                }

                self.events_db["events"].append(local_event)
                self._save_events_db()

                return {
                    'success': True,
                    'event': local_event,
                    'source': 'google'
                }

            except Exception as e:
                logger.error(f"Error al crear evento en Google Calendar: {e}")
                # Fallback a crear evento local
                return self._create_local_event(summary, start_time, end_time, description, location)
        else:
            # Crear evento local
            return self._create_local_event(summary, start_time, end_time, description, location)

    def _create_local_event(self, summary: str, start_time: str, end_time: str, description: str = "", location: str = "") -> Dict[str, Any]:
        """Crear evento en la base de datos local"""
        try:
            # Generar ID local
            import uuid
            event_id = f"local-{uuid.uuid4()}"

            # Crear evento
            event = {
                'id': event_id,
                'summary': summary,
                'start': start_time,
                'end': end_time,
                'location': location,
                'description': description,
                'source': 'local'
            }

            # Añadir a base de datos
            self.events_db["events"].append(event)
            self._save_events_db()

            return {
                'success': True,
                'event': event,
                'source': 'local'
            }
        except Exception as e:
            logger.error(f"Error al crear evento local: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def delete_event(self, event_id: str) -> Dict[str, Any]:
        """Eliminar evento del calendario"""
        # Buscar evento en base de datos local
        event = None
        for e in self.events_db["events"]:
            if e.get('id') == event_id:
                event = e
                break

        if not event:
            return {
                'success': False,
                'error': f"Evento {event_id} no encontrado"
            }

        # Si es un evento de Google, intentar eliminarlo allí
        if event.get('source') == 'google' and self._authenticate_google():
            try:
                self.service.events().delete(calendarId='primary', eventId=event_id).execute()
            except Exception as e:
                logger.error(f"Error al eliminar evento de Google Calendar: {e}")
                # Continuamos para eliminarlo de la base local

        # Eliminar de base de datos local
        self.events_db["events"] = [e for e in self.events_db["events"] if e.get('id') != event_id]
        self._save_events_db()

        return {
            'success': True,
            'message': f"Evento {event_id} eliminado"
        }

def main():
    """Función principal"""
    parser = argparse.ArgumentParser(description="Pascual-Bot: Calendar Skill")
    parser.add_argument("--user", "-u", required=True, help="ID de usuario")
    parser.add_argument("--credentials", "-c", help="Ruta al archivo de credenciales de Google")
    parser.add_argument("--action", "-a", choices=["get", "create", "delete"],
                       default="get", help="Acción a realizar")
    parser.add_argument("--summary", "-s", help="Título del evento")
    parser.add_argument("--start", help="Fecha/hora de inicio (formato ISO)")
    parser.add_argument("--end", help="Fecha/hora de fin (formato ISO)")
    parser.add_argument("--description", "-d", help="Descripción del evento")
    parser.add_argument("--location", "-l", help="Ubicación del evento")
    parser.add_argument("--event-id", help="ID del evento a eliminar")
    parser.add_argument("--max-results", "-m", type=int, default=10, help="Número máximo de resultados")

    args = parser.parse_args()

    # Inicializar Calendar skill
    calendar_skill = CalendarSkill(args.user, args.credentials)

    # Ejecutar acción solicitada
    result = None

    if args.action == "get":
        result = calendar_skill.get_events(args.start, args.end, args.max_results)
    elif args.action == "create":
        if not all([args.summary, args.start, args.end]):
            parser.error("Para crear evento se requiere: --summary, --start, --end")

        result = calendar_skill.create_event(
            args.summary,
            args.start,
            args.end,
            args.description or "",
            args.location or ""
        )
    elif args.action == "delete":
        if not args.event_id:
            parser.error("Para eliminar evento se requiere: --event-id")

        result = calendar_skill.delete_event(args.event_id)

    # Mostrar resultado como JSON
    print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
EOF

    # Hacer ejecutable
    chmod +x "$SKILLS_DIR/calendar/calendar_skill.py"

    log_info "Skill de calendario instalado correctamente ✓"
    return 0
}

# Registrar skills en configuración central
register_skills() {
    log_step "Registrando skills en configuración central..."

    # Crear archivo de registro de skills
    local skills_file="$PASCUAL_DIR/config/skills_registry.json"

    # Crear archivo JSON de registro
    cat > "$skills_file" << EOF
{
  "version": "${PASCUAL_VERSION:-1.0.0}",
  "skills": {
    "ocr": {
      "name": "Reconocimiento de texto (OCR)",
      "description": "Extrae texto de imágenes y documentos escaneados",
      "path": "$SKILLS_DIR/ocr/ocr_skill.py",
      "requires_api_key": false,
      "enabled": true
    },
    "pdf": {
      "name": "Procesamiento de PDF",
      "description": "Analiza, extrae texto, metadatos y estructura de PDFs",
      "path": "$SKILLS_DIR/pdf/pdf_skill.py",
      "requires_api_key": false,
      "enabled": true
    },
    "vision": {
      "name": "Análisis de imágenes",
      "description": "Detecta objetos, clasifica imágenes y analiza contenido visual",
      "path": "$SKILLS_DIR/vision/vision_skill.py",
      "requires_api_key": false,
      "enabled": true
    },
    "notion": {
      "name": "Integración con Notion",
      "description": "Interactúa con bases de datos y páginas de Notion",
      "path": "$SKILLS_DIR/notion/notion_skill.py",
      "requires_api_key": true,
      "api_key_name": "NOTION_API_KEY",
      "enabled": false
    },
    "calendar": {
      "name": "Calendario",
      "description": "Gestiona eventos, citas y recordatorios",
      "path": "$SKILLS_DIR/calendar/calendar_skill.py",
      "requires_api_key": true,
      "api_key_name": "GOOGLE_CREDENTIALS_FILE",
      "enabled": false
    }
  }
}
EOF

    log_info "Skills registrados en $skills_file ✓"
    return 0
}

# ============================================================================
# INICIO DEL SCRIPT
# ============================================================================

# Encabezado
echo "============================================================================"
echo "             PASCUAL-BOT: INSTALACIÓN DE SKILLS COMPLEMENTARIOS             "
echo "============================================================================"
echo ""

# Verificar fase anterior y cargar configuración
check_previous_phase
load_env
check_sudo

# Crear estructura de directorios para skills
create_skills_directories

# Instalar skill de OCR
install_ocr_skill

# Instalar skill de procesamiento de PDF
install_pdf_skill

# Instalar skill de visión
install_vision_skill

# Instalar skill de integración con Notion (opcional)
install_notion_skill

# Instalar skill de integración con Calendario (opcional)
install_calendar_skill

# Registrar skills en configuración central
register_skills

# Registrar fase completada
echo "FASE_12_COMPLETED=true" >> "$PASCUAL_CONFIG/.env"

log_info "✅ Skills complementarios instalados correctamente"
log_info ""
log_info "Para usar el skill de OCR, ejecuta:"
echo -e "${GREEN}   python3 $SKILLS_DIR/ocr/ocr_skill.py --image <ruta_imagen>${NC}"
echo ""
log_info "Para usar el skill de PDF, ejecuta:"
echo -e "${GREEN}   python3 $SKILLS_DIR/pdf/pdf_skill.py --pdf <ruta_pdf> --action text${NC}"
echo ""
log_info "Para usar el skill de visión, ejecuta:"
echo -e "${GREEN}   python3 $SKILLS_DIR/vision/vision_skill.py --image <ruta_imagen>${NC}"
echo ""
log_info "🎉 ¡Enhorabuena! Pascual-Bot se ha instalado completamente"

# Remover trap al finalizar correctamente
trap - EXIT
exit 0