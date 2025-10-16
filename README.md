# Acto 1: El Dilema de las Vistas Imperfectas (Versión 2.0)

Visualización interactiva para explicar los problemas de los métodos tradicionales de Graph Contrastive Learning (GCL) en sistemas recomendadores, con enfoque en **mostrar las consecuencias reales** para la capacidad de recomendación.

## Descripción

Esta visualización educativa presenta dos demos interactivas que no solo ilustran **qué hacen** los métodos tradicionales, sino **por qué son perjudiciales** para la tarea de recomendación.

### 1. El Sabotaje de Señales Colaborativas (Aumento de Estructura)
- **Problema**: Elimina conexiones al azar, rompiendo caminos críticos para el filtrado colaborativo
- **Demo Interactiva con Historia**:
  - Grafo narrativo: Usuario 1 (Tú) ha leído "Dune" e "Hyperion"
  - Usuario 2 (Similar) también leyó "Hyperion" y además leyó "Fundación"
  - **Pasa el mouse sobre Usuario 1** para ver el camino de recomendación colaborativa hacia "Fundación"
  - Haz clic en **Simular Aumento de Estructura** para romper la conexión crítica
  - **Vuelve a pasar el mouse** y observa cómo la recomendación ha desaparecido
  - Visualización clara: ✅ Camino completo → ❌ Camino roto con marca "✗ ROTO"

### 2. La Confusión de Identidad (Aumento de Features)
- **Problema**: Aplica el mismo "empujón" de ruido a todos, ignorando que los usuarios nuevos tienen identidades frágiles
- **Demo Interactiva con Zonas Semánticas**:
  - Espacio de embeddings dividido en zonas: **Ciencia Ficción** (azul) vs **Comedia** (verde)
  - U_Activo: Usuario grande y estable en el centro de "Ciencia Ficción"
  - U_Nuevo: Usuario pequeño cerca de la frontera (vulnerable)
  - **Arrastra el slider** para añadir ruido (misma magnitud para ambos)
  - Observa cómo U_Activo permanece estable en su zona
  - U_Nuevo cruza constantemente a "Comedia" y **cambia de color a verde**
  - Alerta dinámica: ⚠️ **"¡Identidad de U_Nuevo comprometida!"** cuando cruza la frontera

## Tecnologías

- HTML5
- CSS3
- JavaScript (ES6+)
- D3.js v7

## Estructura del Proyecto

```
recsys-vis/
├── index.html          # Página principal
├── css/
│   └── style.css       # Estilos y diseño
├── js/
│   └── main.js         # Lógica de visualización con D3.js
└── README.md           # Este archivo
```

## Uso

Simplemente abre `index.html` en tu navegador web. No requiere servidor ni instalación adicional.

## Características Técnicas

### Visualización del Grafo (V2.0)
- Grafo basado en historia con nodos etiquetados ("Dune", "Hyperion", "Fundación")
- Interacción por hover en lugar de click (más fluida)
- Camino de recomendación colaborativa visual (líneas naranjas gruesas)
- Detección y visualización de ruptura de caminos críticos
- Feedback dinámico en texto de instrucción
- Animaciones suaves con D3.js

### Visualización del Scatter Plot (V2.0)
- Zonas semánticas con fondo de color (Ciencia Ficción vs Comedia)
- Detección de cruce de frontera en tiempo real
- Cambio de color dinámico cuando U_Nuevo cambia de zona
- Alerta visual automática de "identidad comprometida"
- Labels en nodos principales (U_Activo, U_Nuevo)
- Puntos de fondo para contexto

### General
- Diseño responsive
- Instrucciones contextuales que cambian según el estado
- Animaciones y transiciones suaves
- Código modular y bien documentado

## Mejoras Versión 2.0

Basado en feedback crítico de usuario:

### Demo del Grafo
- ❌ **Antes**: Solo mostraba la acción (eliminar aristas), no la consecuencia
- ✅ **Ahora**: Muestra una historia de recomendación específica que se pierde
- ✅ Cambio de interacción: hover en lugar de click (más natural)
- ✅ Visualización clara del camino completo → camino roto
- ✅ Feedback inmediato: "✅ Camino de recomendación" → "❌ La recomendación está rota"

### Demo del Scatter Plot
- ❌ **Antes**: Puntos sin contexto moviéndose por igual
- ✅ **Ahora**: Zonas semánticas que dan significado al espacio
- ✅ Consecuencia visible: cruce de frontera = confusión de identidad
- ✅ Alerta automática cuando U_Nuevo es "empujado" fuera de su zona
- ✅ Cambio de color dinámico (azul → verde) muestra el problema visceralmente

### Resultado
Ambas demos ahora son igualmente impactantes y pedagógicas. No solo muestran **qué** hacen los métodos, sino **por qué** son perjudiciales para la tarea de recomendación.

## Autor

Desarrollado para explicar conceptos de VGCL (Variational Graph Contrastive Learning).
