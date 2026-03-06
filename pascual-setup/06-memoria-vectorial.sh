#!/bin/bash
# ============================================================================
# PASCUAL-BOT: Sistema de Agente de IA Local Multi-Usuario
# ============================================================================
# FASE 6: Memoria Vectorial y Búsqueda Semántica
# Autor: Claude
# Fecha: 2026-03-05
# Descripción: Instala ChromaDB y modelos de embeddings para historial inteligente
# Dependencias: Servicios voz (05-servicios-voz.sh)
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

# Verificar que la fase anterior se haya ejecutado
check_previous_phase() {
    if [ ! -f "$PASCUAL_CONFIG/.env" ]; then
        log_error "No se encontró el archivo de configuración de Pascual-Bot"
        log_info "Debes ejecutar primero: ./05-servicios-voz.sh"
        exit 1
    fi

    # Verificar que la fase 5 esté marcada como completada
    source "$PASCUAL_CONFIG/.env"
    if [ "$FASE_5_COMPLETED" != "true" ]; then
        log_error "La fase 5 no se ha completado correctamente"
        log_info "Debes ejecutar primero: ./05-servicios-voz.sh"
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
        log_info "Para hacer rollback, ejecute: ./rollback/rollback-phase-6.sh"
    fi
}

# Registrar función de limpieza para ejecución en caso de error
trap cleanup EXIT

# Instalar ChromaDB
install_chromadb() {
    log_step "Instalando ChromaDB (base de datos vectorial)..."

    # Activar entorno virtual
    source "$PASCUAL_DIR/venv/bin/activate"

    # Verificar si ya está instalado
    if python -c "import chromadb" &>/dev/null; then
        log_info "ChromaDB ya está instalado ✓"
    else
        # Instalar ChromaDB
        log_info "Instalando ChromaDB..."
        pip install chromadb

        # Verificar instalación
        if python -c "import chromadb" &>/dev/null; then
            log_info "ChromaDB instalado correctamente ✓"
        else
            log_error "Error al instalar ChromaDB"
            return 1
        fi
    fi

    return 0
}

# Instalar LanceDB (alternativa a ChromaDB, más ligera)
install_lancedb() {
    log_step "Instalando LanceDB (base de datos vectorial alternativa)..."

    # Activar entorno virtual
    source "$PASCUAL_DIR/venv/bin/activate"

    # Verificar si ya está instalado
    if python -c "import lancedb" &>/dev/null; then
        log_info "LanceDB ya está instalado ✓"
    else
        # Instalar LanceDB
        log_info "Instalando LanceDB..."
        pip install lancedb

        # Verificar instalación
        if python -c "import lancedb" &>/dev/null; then
            log_info "LanceDB instalado correctamente ✓"
        else
            log_error "Error al instalar LanceDB"
            return 1
        fi
    fi

    return 0
}

# Instalar Sentence Transformers (embeddings)
install_sentence_transformers() {
    log_step "Instalando Sentence Transformers (embeddings)..."

    # Activar entorno virtual
    source "$PASCUAL_DIR/venv/bin/activate"

    # Verificar si ya está instalado
    if python -c "import sentence_transformers" &>/dev/null; then
        log_info "Sentence Transformers ya está instalado ✓"
    else
        # Instalar Sentence Transformers
        log_info "Instalando Sentence Transformers..."
        pip install sentence-transformers

        # Verificar instalación
        if python -c "import sentence_transformers" &>/dev/null; then
            log_info "Sentence Transformers instalado correctamente ✓"
        else
            log_error "Error al instalar Sentence Transformers"
            return 1
        fi
    fi

    return 0
}

# Descargar modelo de embeddings
download_embedding_model() {
    log_step "Descargando modelo de embeddings multilingüe..."

    # Activar entorno virtual
    source "$PASCUAL_DIR/venv/bin/activate"

    # Descargar modelo
    log_info "Descargando modelo paraphrase-multilingual-MiniLM-L12-v2..."

    # Crear script temporal para descargar modelo
    TMP_SCRIPT=$(mktemp)
    cat > "$TMP_SCRIPT" << 'EOF'
from sentence_transformers import SentenceTransformer
print("Descargando modelo de embeddings...")
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
print(f"Modelo descargado y almacenado en: {model._model_card_vars['modelUrl']}")
EOF

    # Ejecutar script para descargar modelo
    if python "$TMP_SCRIPT"; then
        log_info "Modelo de embeddings descargado correctamente ✓"
        rm -f "$TMP_SCRIPT"
        return 0
    else
        log_error "Error al descargar modelo de embeddings"
        rm -f "$TMP_SCRIPT"
        return 1
    fi
}

# Crear índices vectoriales por usuario
create_vector_indices() {
    log_step "Creando índices vectoriales por usuario..."

    # Obtener lista de usuarios de routing.json
    USERS_JSON_PATH="$PASCUAL_CONFIG/routing.json"
    if [ -f "$USERS_JSON_PATH" ]; then
        # Extraer usuarios registrados (requiere jq)
        if command -v jq &>/dev/null; then
            USUARIOS=$(jq -r '.usuarios_registrados[]' "$USERS_JSON_PATH")
        else
            # Alternativa si jq no está disponible
            USUARIOS=$(grep -o '"[^"]*"' "$USERS_JSON_PATH" | grep -v "version\|telegram\|default\|wake_words\|rechazar\|priorizar" | tr -d '"' | sort -u)
        fi
    else
        log_error "Archivo routing.json no encontrado"
        return 1
    fi

    # Activar entorno virtual
    source "$PASCUAL_DIR/venv/bin/activate"

    # Para cada usuario, crear índices vectoriales
    for usuario in $USUARIOS; do
        log_info "Creando índices vectoriales para usuario: $usuario"

        # Crear directorio si no existe
        mkdir -p "$PASCUAL_DIR/users/$usuario/vector_index"

        # Crear script temporal para inicializar índices
        TMP_SCRIPT=$(mktemp)
        cat > "$TMP_SCRIPT" << EOF
import chromadb
from pathlib import Path

# Ruta para índices vectoriales del usuario
db_path = Path('$PASCUAL_DIR/users/$usuario/vector_index')

# Inicializar cliente ChromaDB persistente
client = chromadb.PersistentClient(path=str(db_path))

# Crear colecciones básicas
collections = {
    "conversaciones": "Historial de conversaciones y comandos de voz",
    "tareas": "Tareas y recordatorios",
    "documentos": "Contenido de documentos procesados",
    "conocimiento": "Base de conocimiento personal"
}

# Inicializar colecciones
for name, description in collections.items():
    try:
        collection = client.get_or_create_collection(
            name=name,
            metadata={"description": description}
        )
        print(f"Colección '{name}' creada/verificada")
    except Exception as e:
        print(f"Error al crear colección '{name}': {e}")

# Crear también índice LanceDB como alternativa
try:
    import lancedb
    db = lancedb.connect("$PASCUAL_DIR/users/$usuario/vector_index/lancedb")
    if "conversaciones" not in db.table_names():
        # Crear tabla vacía con schema básico
        db.create_table(
            "conversaciones",
            data=[{
                "id": "example",
                "text": "Ejemplo de conversación",
                "timestamp": "2026-03-05T00:00:00",
                "vector": [0.0] * 384  # Dimensión del modelo MiniLM
            }]
        )
        print("Tabla LanceDB 'conversaciones' creada")
    else:
        print("Tabla LanceDB 'conversaciones' ya existe")
except ImportError:
    print("LanceDB no está instalado, omitiendo creación de tablas")
except Exception as e:
    print(f"Error al crear tablas LanceDB: {e}")
EOF

        # Ejecutar script para inicializar índices
        if python "$TMP_SCRIPT"; then
            log_info "Índices vectoriales creados para usuario: $usuario ✓"
        else
            log_warning "Error al crear índices vectoriales para usuario: $usuario"
        fi

        # Limpiar
        rm -f "$TMP_SCRIPT"
    done

    return 0
}

# Crear script de utilidad para búsqueda semántica
create_search_utility() {
    log_step "Creando utilidad de búsqueda semántica..."

    # Crear directorio para utilidades
    mkdir -p "$PASCUAL_DIR/utils"

    # Crear script de búsqueda semántica
    cat > "$PASCUAL_DIR/utils/semantic_search.py" << 'EOF'
#!/usr/bin/env python3
"""
Pascual-Bot: Utilidad de búsqueda semántica
Permite buscar en la memoria vectorial usando similitud semántica
"""
import os
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime

# Directorio base de Pascual
PASCUAL_DIR = os.path.expanduser("~/.pascual")

def load_env():
    """Cargar variables de entorno desde .env"""
    env_file = os.path.join(PASCUAL_DIR, "config", ".env")
    env_vars = {}

    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    try:
                        key, value = line.split('=', 1)
                        env_vars[key] = value.strip('"\'')
                    except ValueError:
                        pass

    return env_vars

def semantic_search(user, query, collection="conversaciones", limit=5):
    """Realizar búsqueda semántica en la memoria vectorial del usuario"""
    try:
        # Activar virtualenv si existe
        venv_path = os.path.join(PASCUAL_DIR, "venv")
        if os.path.exists(venv_path):
            activate_script = os.path.join(venv_path, "bin", "activate_this.py")
            with open(activate_script) as f:
                exec(f.read(), {'__file__': activate_script})

        # Importar dependencias
        import chromadb
        from sentence_transformers import SentenceTransformer

        # Cargar modelo de embeddings
        model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

        # Conectar a ChromaDB del usuario
        db_path = os.path.join(PASCUAL_DIR, "users", user, "vector_index")
        client = chromadb.PersistentClient(path=db_path)

        # Obtener colección
        try:
            collection = client.get_collection(collection)
        except ValueError:
            print(f"Error: Colección '{collection}' no encontrada para usuario '{user}'")
            return False

        # Crear embedding de la consulta
        query_embedding = model.encode(query).tolist()

        # Realizar búsqueda por similitud
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=limit,
            include=["metadatas", "documents", "distances"]
        )

        # Mostrar resultados
        if results and results.get("documents"):
            print(f"\nResultados para '{query}':")
            documents = results["documents"][0]
            metadatas = results["metadatas"][0]
            distances = results["distances"][0]

            for i, (doc, meta, dist) in enumerate(zip(documents, metadatas, distances)):
                similarity = 1.0 - dist
                date_str = meta.get("timestamp", "Fecha desconocida")

                # Formatear salida
                print(f"\n{i+1}. Similitud: {similarity:.2f}")
                print(f"   Fecha: {date_str}")
                print(f"   Texto: {doc[:300]}{'...' if len(doc) > 300 else ''}")

            return True
        else:
            print(f"No se encontraron resultados para '{query}'")
            return False

    except ImportError as e:
        print(f"Error: Falta dependencia - {e}")
        print("Ejecute primero los scripts de instalación")
        return False
    except Exception as e:
        print(f"Error durante la búsqueda: {e}")
        return False

def main():
    """Función principal"""
    parser = argparse.ArgumentParser(description="Búsqueda semántica en la memoria de Pascual-Bot")
    parser.add_argument("--user", "-u", required=True, help="Usuario en cuya memoria buscar")
    parser.add_argument("--collection", "-c", default="conversaciones", help="Colección donde buscar")
    parser.add_argument("--limit", "-l", type=int, default=5, help="Límite de resultados")
    parser.add_argument("query", nargs='+', help="Consulta de búsqueda")

    args = parser.parse_args()
    query = " ".join(args.query)

    print(f"Buscando '{query}' en colección '{args.collection}' del usuario '{args.user}'...")
    semantic_search(args.user, query, args.collection, args.limit)

if __name__ == "__main__":
    main()
EOF

    # Hacer ejecutable
    chmod +x "$PASCUAL_DIR/utils/semantic_search.py"
    log_info "Utilidad de búsqueda semántica creada en $PASCUAL_DIR/utils/semantic_search.py"

    return 0
}

# ============================================================================
# INICIO DEL SCRIPT
# ============================================================================

# Encabezado
echo "============================================================================"
echo "             PASCUAL-BOT: INSTALACIÓN DE MEMORIA VECTORIAL                  "
echo "============================================================================"
echo ""

# Verificar fase anterior y cargar configuración
check_previous_phase
load_env

# Instalar componentes de memoria vectorial
install_chromadb
install_lancedb
install_sentence_transformers

# Descargar modelo de embeddings
download_embedding_model

# Crear índices vectoriales por usuario
create_vector_indices

# Crear utilidad de búsqueda
create_search_utility

# Registrar fase completada
echo "FASE_6_COMPLETED=true" >> "$PASCUAL_CONFIG/.env"

log_info "✅ Memoria vectorial configurada correctamente"
log_info "Para probar la búsqueda semántica, ejecuta:"
echo -e "${GREEN}   python3 $PASCUAL_DIR/utils/semantic_search.py --user <nombre_usuario> \"tu consulta aquí\"${NC}"
echo ""
log_info "➡️  Siguiente paso: ejecutar ./07-pascual-maestro.sh"

# Remover trap al finalizar correctamente
trap - EXIT
exit 0