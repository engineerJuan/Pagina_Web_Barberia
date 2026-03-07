// Esta sección inicializa el inventario de la tienda. Declara la variable global, busca si ya hay datos guardados en el almacenamiento local para cargar sus imágenes correctamente, o de lo contrario, carga un catálogo por defecto y lo guarda para usos futuros.
let productos = [];

function cargarProductos() {
    const stored = localStorage.getItem('barberInventory');
    
    if (stored) {
        try {
            productos = JSON.parse(stored);
            console.log('Productos cargados desde localStorage:', productos.length);
            
            productos.forEach(p => {
                if (!p.img) p.img = 'img/placeholder.jpg';
                if (!p.imagenes || p.imagenes.length === 0) {
                    p.imagenes = [p.img];
                }
                p.imagenes = [...new Set(p.imagenes)];
            });
        } catch(e) {
            console.error('Error al parsear localStorage:', e);
            productos = [];
        }
    } 
    
    if (!productos || productos.length === 0) {
        productos = [
            {
                id: 1,
                nombre: "Kit Grooming Premium",
                categoria: "grooming",
                precio: "$580",
                precioFormato: "$580",
                img: "img/productos/pro2.jpg",
                imagenes: ["img/productos/pro2.jpg", "img/productos/pro3.jpg", "img/productos/pro1.jpg"],
                stock: 5,
                stockPorTalla: null,
                caracteristicas: ["Incluye 4 productos", "Cera, shampoo, acondicionador y aceite", "Maletín de regalo"]
            },
            {
                id: 2,
                nombre: "Cera Modeladora Mate",
                categoria: "grooming",
                precio: "$220",
                precioFormato: "$220",
                img: "img/productos/pro1.jpg",
                imagenes: ["img/productos/pro1.jpg", "img/productos/pro2.jpg", "img/productos/pro3.jpg"],
                stock: 8,
                stockPorTalla: null,
                caracteristicas: ["Fijación fuerte (8/10)", "Acabado mate", "Resiste la humedad"]
            },
            {
                id: 3,
                nombre: "Spray Fijación Extrafuerte",
                categoria: "grooming",
                precio: "$190",
                precioFormato: "$190",
                img: "img/productos/pro3.jpg",
                imagenes: ["img/productos/pro3.jpg", "img/productos/pro1.jpg", "img/productos/pro2.jpg"],
                stock: 12,
                stockPorTalla: null,
                caracteristicas: ["Fijación extrema (10/10)", "Brillo moderado", "Secado rápido"]
            },
            {
                id: 4,
                nombre: "Sudadera Dino Dreams",
                categoria: "ropa",
                precio: "$450",
                precioFormato: "$450",
                img: "img/ropa/img1.jpg",
                imagenes: ["img/ropa/img1.jpg", "img/ropa/img2.jpg", "img/ropa/img3.jpg"],
                stockPorTalla: { S: 2, M: 1, L: 0, XL: 1 },
                stock: 4,
                caracteristicas: ["Algodón premium 320gr", "Estampado serigrafiado", "Capucha ajustable"]
            },
            {
                id: 5,
                nombre: "Sudadera Good Vibes",
                categoria: "ropa",
                precio: "$450",
                precioFormato: "$450",
                img: "img/ropa/img2.jpg",
                imagenes: ["img/ropa/img2.jpg", "img/ropa/img3.jpg", "img/ropa/img1.jpg"],
                stockPorTalla: { S: 0, M: 1, L: 1, XL: 0 },
                stock: 2,
                caracteristicas: ["Mezcla de algodón y poliéster", "Estampado en vinil textil", "Unisex"]
            },
            {
                id: 6,
                nombre: "Perfume Black Edition",
                categoria: "perfumes",
                precio: "$850",
                precioFormato: "$850",
                img: "img/Perfumes/per1.jpg",
                imagenes: ["img/Perfumes/per1.jpg"],
                stock: 5,
                stockPorTalla: null,
                caracteristicas: ["Notas amaderadas", "Duración de 8 horas", "Presentación de 100ml"]
            }
        ];
        localStorage.setItem('barberInventory', JSON.stringify(productos));
        console.log('Productos por defecto guardados');
    }
    
    return productos;
}

productos = cargarProductos();

// Este bloque escucha el evento 'inventoryUpdated'. Si detecta cambios en el inventario, actualiza la variable global y vuelve a dibujar todos los productos para que la pantalla siempre muestre la información más reciente.
window.addEventListener('inventoryUpdated', function(e) {
    productos = e.detail;
    if (document.getElementById('productGrid') && typeof window.renderProductos === 'function') {
        window.renderProductos('todo');
    }
});

// Esta función maneja la apertura de la ventana emergente (Lightbox) al hacer clic en un producto. Recibe el ID del producto y coordina el cierre de modales previos, la búsqueda de los datos y su visualización.
window.openModal = function(id) {
    console.log('Abriendo modal para producto ID:', id);
    
    // Verifica si ya existe una ventana modal abierta en la pantalla y, de ser así, utiliza las funciones del Lightbox para cerrarla correctamente antes de procesar una nueva apertura.
    const modalAbierto = document.getElementById('productModal');
    if (modalAbierto && modalAbierto.classList.contains('active')) {
        if (window.Lightbox) {
            Lightbox.cerrarModal();
        }
    }
    
    // Aplica un pequeño retraso para evitar conflictos visuales al cerrar un modal previo, y luego intenta recuperar la lista de productos más actualizada directamente del almacenamiento local o de la variable global como respaldo.
    setTimeout(() => {
        let listado = [];
        try {
            const stored = localStorage.getItem('barberInventory');
            listado = stored ? JSON.parse(stored) : productos;
        } catch(e) {
            console.error('Error al leer localStorage:', e);
            listado = productos;
        }
        
        // Busca el producto específico por su ID dentro del listado recuperado. Si lo encuentra, crea una copia de sus datos y los envía al Lightbox para que se muestren en pantalla; de lo contrario, arroja un error en consola.
        const producto = listado.find(p => p.id == id);
        
        if (producto) {
            const productoCopia = JSON.parse(JSON.stringify(producto));
            
            if (window.Lightbox) {
                Lightbox.abrirModal(productoCopia, 0);
            } else {
                console.error('Lightbox no está definido');
            }
        } else {
            console.error('Producto no encontrado con ID:', id);
        }
    }, 50);
};

// Esta función principal se encarga de dibujar dinámicamente las tarjetas de los productos en la página. Recibe un filtro de categoría, limpia el contenedor, procesa los datos y genera el HTML correspondiente para mostrarlos.
window.renderProductos = function(filtro = "todo") {
    // Identifica el contenedor principal de la cuadrícula en el HTML. Si este contenedor no existe en la vista actual, detiene inmediatamente la ejecución para evitar errores en la página.
    const grid = document.getElementById('productGrid');
    if (!grid) {
        console.log('No hay grid de productos');
        return;
    }

    // Recupera el inventario de productos desde el almacenamiento local y realiza una limpieza rápida para asegurarse de que todos los artículos tengan al menos una imagen asignada, evitando que el diseño se rompa.
    let listadoActual = [];
    try {
        const stored = localStorage.getItem('barberInventory');
        listadoActual = stored ? JSON.parse(stored) : productos;
        
        listadoActual.forEach(p => {
            if (!p.img) p.img = 'img/placeholder.jpg';
            if (!p.imagenes || p.imagenes.length === 0) {
                p.imagenes = [p.img];
            }
        });
    } catch(e) {
        console.error('Error al leer localStorage:', e);
        listadoActual = productos;
    }

    // Limpia el contenedor de la cuadrícula y aplica el filtro seleccionado por el usuario. Si el resultado del filtro está vacío, muestra un mensaje indicando que no hay productos para esa categoría y detiene la función.
    grid.innerHTML = '';
    let filtrados = filtro === "todo" 
        ? listadoActual 
        : listadoActual.filter(p => p.categoria && p.categoria.toLowerCase() === filtro.toLowerCase());

    if (filtrados.length === 0) {
        grid.innerHTML = '<p class="no-products">No se encontraron productos en esta categoría.</p>';
        return;
    }

    // Transforma el identificador técnico de la categoría en un texto limpio y en mayúsculas para las etiquetas visuales, y luego genera el HTML de todas las tarjetas de producto para inyectarlas de golpe en la cuadrícula.
    const getCategoriaTexto = (categoria) => {
        if (!categoria) return 'PRODUCTO';
        const cat = categoria.toLowerCase();
        if (cat === 'ropa') return 'ROPA';
        if (cat === 'perfumes') return 'PERFUMES';
        if (cat === 'grooming') return 'PRODUCTOS';
        return categoria.toUpperCase();
    };

    grid.innerHTML = filtrados.map(p => `
        <div class="product-card" onclick="openModal(${p.id})" style="cursor: pointer;">
            <div class="product-image-box">
                <img src="${p.img}" alt="${p.nombre || 'Producto'}" loading="lazy" onerror="this.src='img/placeholder.jpg'">
            </div>
            <div class="product-details">
                <h3 class="product-title">${p.nombre || 'Producto sin nombre'}</h3>
                <span class="product-category-label">${getCategoriaTexto(p.categoria)}</span>
                <p class="product-price">${p.precio || '$???'}</p>
            </div>
        </div>
    `).join('');
    
    console.log('Renderizado completado, productos:', filtrados.length);
};

// Esta función permite buscar productos en tiempo real mediante un campo de texto. Captura lo que el usuario escribe, lo compara contra el inventario y actualiza la cuadrícula mostrando solo las coincidencias exactas.
window.buscarProductos = function() {
    // Captura el valor ingresado en la barra de búsqueda (limpiando espacios y pasándolo a minúsculas) y verifica que el contenedor de la cuadrícula exista antes de proceder.
    const input = document.getElementById('searchInput');
    if (!input) return;
    
    const termino = input.value.toLowerCase().trim();
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    
    // Prepara la lista base de productos leyendo el inventario más reciente desde el almacenamiento local, garantizando que la búsqueda se realice sobre los datos actualizados.
    let listado = [];
    try {
        const stored = localStorage.getItem('barberInventory');
        listado = stored ? JSON.parse(stored) : productos;
    } catch(e) {
        listado = productos;
    }
    
    // Verifica si la barra de búsqueda está vacía; de ser así, cancela el proceso de filtrado y vuelve a renderizar todo el catálogo completo.
    if (termino === '') {
        window.renderProductos('todo');
        return;
    }
    
    // Filtra el inventario buscando coincidencias del término ingresado tanto en el nombre del producto como en su categoría. Si no hay coincidencias, muestra un mensaje de "sin resultados" en la pantalla.
    const filtrados = listado.filter(p =>
        p.nombre.toLowerCase().includes(termino) ||
        (p.categoria && p.categoria.toLowerCase().includes(termino))
    );
    
    if (filtrados.length === 0) {
        grid.innerHTML = '<p class="no-products">No se encontraron productos</p>';
        return;
    }
    
    // Convierte las categorías a un formato amigable y genera el HTML de los productos que coincidieron con la búsqueda para mostrarlos inmediatamente en la interfaz.
    const getCategoriaTexto = (categoria) => {
        if (!categoria) return 'PRODUCTO';
        const cat = categoria.toLowerCase();
        if (cat === 'ropa') return 'ROPA';
        if (cat === 'perfumes') return 'PERFUMES';
        if (cat === 'grooming') return 'PRODUCTOS';
        return categoria.toUpperCase();
    };
    
    grid.innerHTML = filtrados.map(p => `
        <div class="product-card" onclick="openModal(${p.id})" style="cursor: pointer;">
            <div class="product-image-box">
                <img src="${p.img}" alt="${p.nombre}" loading="lazy" onerror="this.src='img/placeholder.jpg'">
            </div>
            <div class="product-details">
                <h3 class="product-title">${p.nombre}</h3>
                <span class="product-category-label">${getCategoriaTexto(p.categoria)}</span>
                <p class="product-price">${p.precio}</p>
            </div>
        </div>
    `).join('');
};

// Este bloque espera a que toda la estructura del documento HTML termine de cargar; una vez listo, si detecta la cuadrícula de productos, dispara el primer renderizado para mostrar la tienda completa.
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('productGrid')) {
        window.renderProductos('todo');
    }
});