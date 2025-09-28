# 🏛️ La Galería de los Ingenieros
## Museo Virtual Interactivo en 3D

---

## 🎭 **Narrativa del Proyecto**

### *"Más allá de la precisión, existe la humanidad"*

**La Galería de los Ingenieros** es una experiencia inmersiva que desafía la percepción tradicional de la ingeniería. El visitante ingresa a un **pasillo  perfectamente simétrico** donde un sonido de fondo marcan el ritmo del espacio con una precisión inquebrantable.

Pero el verdadero secreto yace en las **puertas** que acompañan el corredor. Cada una conduce a un mundo interior donde se revela el verdadero espíritu de los ingenieros: *creatividad infinita, arte oculto, sueños estelares y empatía silenciosa*.

El público no solo observa: **elige qué explorar y cómo conectarse** con cada sala, construyendo su propio recorrido emocional y narrativo.

### 🌟 **La Dualidad**
- **Exterior**: Orden, precisión, disciplina, rigidez
- **Interior**: Creatividad, sensibilidad, humanidad, sueños

---

## 🎮 **Descripción Técnica**

**La Galería de los Ingenieros** es un museo virtual desarrollado en **Three.js** que combina arte, tecnología y narrativa interactiva. Los visitantes exploran un entorno 3D fotorrealista donde pueden:

- 🚶‍♂️ **Navegar en primera persona** por múltiples habitaciones conectadas
- 🖼️ **Interactuar con obras de arte** de grandes maestros (Van Gogh, Da Vinci, Picasso)
- 👥 **Observar NPCs inteligentes** que caminan por el museo
- 🎵 **Experimentar audio ambiental dinámico** que cambia según la ubicación
- 🏛️ **Explorar modelos 3D históricos** (escultura de Alan Turing, Apple II)

---

## 🛠️ **Características Técnicas**

### **Arquitectura del Sistema**
- **Motor Gráfico**: Three.js (WebGL)
- **Renderizado**: Tiempo real con antialiasing
- **Navegación**: Controles de primera persona (WASD + Mouse)
- **Audio**: Sistema dinámico con 5 pistas ambientales
- **IA**: NPCs con movimiento autónomo y detección de obstáculos

### **Sistemas Implementados**

#### 🎯 **Sistema de Navegación**
```javascript
// Controles fluidos de primera persona
- WASD: Movimiento direccional
- Mouse: Control de cámara libre (pitch/yaw)
- Velocidad: 5.0 unidades/segundo
```

#### 🔊 **Sistema de Audio Ambiental**
```javascript
// Audio dinámico por zonas
const audioZones = {
  central: 'assets/audio/default.mp3',
  room1: 'assets/audio/room1.mp3',    // Zona noroeste
  room2: 'assets/audio/room2.mp3',    // Zona noreste
  room3: 'assets/audio/room3.mp3',    // Zona suroeste
  room4: 'assets/audio/room4.mp3'     // Zona sureste
}
```

#### 🤖 **Sistema de NPCs Inteligentes**
- **6 personajes** con IA de movimiento
- **Pathfinding** con detección de colisiones
- **Velocidades variables** (1.2 - 2.2 unidades/seg)
- **Rotación automática** hacia dirección de movimiento

#### 🎨 **Galería de Arte Interactiva**
- **18 obras maestras** con texturas HD
- **Marcos procedurales** en madera
- **Sistema de raycast** para detección de clicks
- **Información emergente** por obra

---

## 🏗️ **Arquitectura de la Escena 3D**

### **Dimensiones del Espacio**
```javascript
const DIMENSIONES_SALA = {
    ancho: 60,      // Unidades 3D
    alto: 6,        // Altura del techo
    profundo: 40    // Profundidad total
};
```

### **Sistema de Iluminación**
- **Luz Ambiental**: Color gris (0x404040), intensidad 0.5
- **2 Luces Direccionales**: Blancas, intensidad 0.8
- **Luz Focal Central**: SpotLight con ángulo π/6
- **Niebla Atmosférica**: Rango 1-40 unidades

### **Materiales y Texturas**
- **Suelo**: `checkered_pavement_tiles_diff_1k.jpg` (6x6 repeat)
- **Paredes**: `marble_01_diff_2k.jpg` (2x2 repeat)
- **Techo**: Color sólido blanco (#fafafa)

---

## 📁 **Estructura del Proyecto**

```
TP-CDEV/
├── tpFinal/
│   ├── index.html              # Punto de entrada principal
│   ├── main.js                 # Lógica principal (1167 líneas)
│   ├── style.css               # Estilos UI/UX
│   ├── assets/
│   │   ├── audio/              # 5 pistas ambientales
│   │   │   ├── default.mp3
│   │   │   ├── room1.mp3
│   │   │   ├── room2.mp3
│   │   │   ├── room3.mp3
│   │   │   └── room4.mp3
│   │   ├── models/             # Modelos 3D (.gltf/.glb)
│   │   │   ├── alan_turing_sculpture.glb
│   │   │   ├── apple_ii_computer.glb
│   │   │   ├── modern_bench_1/
│   │   │   └── simple_low_poly_character/
│   │   └── texturas/           # Texturas HD para obras
│   └── libs/
│       └── three.min.js        # Three.js local
└── README.md                   # Este archivo
```

---

## 🚀 **Instalación y Ejecución**

### **Requisitos Previos**
- Navegador moderno con soporte WebGL
- Servidor HTTP local (para cargar recursos)

### **Pasos de Instalación**

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd TP-CDEV
   ```

2. **Acceder al juego**
   # Abrir tpFinal/index.html con Live Server
   ```


### **Controles del Juego**
- **WASD**: Movimiento direccional
- **Mouse**: Mirar alrededor
- **ESC**: Salir del modo de vista libre

---

## 🎨 **Obras de Arte Incluidas**

### **Galería Principal**
| Obra | Artista | Ubicación |
|------|---------|-----------|
| La Mona Lisa | Leonardo da Vinci | Pared Norte |
| Guernica | Pablo Picasso | Pared Este |
| La Noche Estrellada | Vincent van Gogh | Pared Sur |
| Las Meninas | Diego Velázquez | Pared Oeste |
| El Nacimiento de Venus | Sandro Botticelli | Sala Central |
| Girl with a Pearl Earring | Johannes Vermeer | Habitación 1 |
| Los Girasoles | Vincent van Gogh | Habitación 2 |
| La Capilla Sixtina | Miguel Ángel | Habitación 3 |
| *...y 10 obras más* | Varios | Distribución múltiple |

---

## 🔧 **Configuración Avanzada**

### **Parámetros de Rendimiento**
```javascript
// Optimizaciones configurables
const CONFIG = {
    shadows: false,                    // Deshabilitado para mejor FPS
    antialiasing: true,               // Calidad visual
    pixelRatio: Math.min(window.devicePixelRatio, 2), // Máximo 2x
    fogDistance: { near: 1, far: 40 } // Culling atmosférico
};
```

### **Debug Mode**
Para activar el panel de debug, modificar en `main.js`:
```javascript
debugPanel = new DebugPanel(); // Mostrar info de posición y FPS
```

### **Customización de Audio**
Reemplazar archivos en `assets/audio/` manteniendo los nombres:
- `default.mp3` - Música del pasillo principal
- `room1.mp3` - Habitación noroeste
- `room2.mp3` - Habitación noreste
- `room3.mp3` - Habitación suroeste
- `room4.mp3` - Habitación sureste

---


#### 🧠 **Inmersión Mental**
El jugador actúa como explorador, descubriendo gradualmente la dualidad entre la percepción externa e interna de la ingeniería.

#### 👁️ **Inmersión Sensorial**
- **Visual**: Contraste entre el pasillo y las habitaciones coloridas
- **Auditiva**: Transiciones musicales suaves entre zonas
- **Espacial**: Navegación libre en entorno 3D fotorrealista

#### ❤️ **Inmersión Emocional**
Cada habitación está diseñada para evocar diferentes aspectos de la personalidad ingenieril:
- **Creatividad** (geometrías imposibles, colores vibrantes)
- **Precisión** (orden simétrico, elementos técnicos)
- **Humanidad** (arte, música, elementos orgánicos)

---

## 🔮 **Futuras Mejoras**

### **Expansión Cultural**
- [ ] Descripciones históricas reales para cada obra
- [ ] Modo de visita guiada con narración
- [ ] Base de datos de artistas ampliada





