// ===== PRODUCTOS - CARGA DESDE LOCALSTORAGE PRIMERO =====
let productos = [];

// ===== CARGAR PRODUCTOS DESDE LOCALSTORAGE =====
function cargarProductos() {
    const stored = localStorage.getItem('barberInventory');
    
    if (stored && JSON.parse(stored).length > 0) {
        productos = JSON.parse(stored);
        console.log('Productos cargados desde localStorage:', productos.length);
        
        // Verificar que los productos de ropa tengan stockPorTalla
        productos.forEach(p => {
            if (p.categoria === 'ropa' && !p.stockPorTalla) {
                console.warn('Producto de ropa sin stockPorTalla:', p.nombre);
                p.stockPorTalla = { S: 0, M: 0, L: 0, XL: 0 };
            }
        });
    } else {
        // Productos por defecto
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
                caracteristicas: [
                    "Incluye 4 productos",
                    "Cera, shampoo, acondicionador y aceite",
                    "Maletín de regalo"
                ]
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
                caracteristicas: [
                    "Fijación fuerte (8/10)",
                    "Acabado mate",
                    "Resiste la humedad"
                ]
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
                caracteristicas: [
                    "Fijación extrema (10/10)",
                    "Brillo moderado",
                    "Secado rápido"
                ]
            },
            {
                id: 4,
                nombre: "Sudadera Dino Dreams",
                categoria: "ropa",
                precio: "$450",
                precioFormato: "$450",
                img: "img/ropa/img1.jpg",
                imagenes: ["img/ropa/img1.jpg", "img/ropa/img2.jpg", "img/ropa/img3.jpg"],
                stockPorTalla: {
                    S: 2,
                    M: 1,
                    L: 0,
                    XL: 1
                },
                stock: 4,
                caracteristicas: [
                    "Algodón premium 320gr",
                    "Estampado serigrafiado",
                    "Capucha ajustable"
                ]
            },
            {
                id: 5,
                nombre: "Sudadera Good Vibes",
                categoria: "ropa",
                precio: "$450",
                precioFormato: "$450",
                img: "img/ropa/img2.jpg",
                imagenes: ["img/ropa/img2.jpg", "img/ropa/img3.jpg", "img/ropa/img1.jpg"],
                stockPorTalla: {
                    S: 0,
                    M: 1,
                    L: 1,
                    XL: 0
                },
                stock: 2,
                caracteristicas: [
                    "Mezcla de algodón y poliéster",
                    "Estampado en vinil textil",
                    "Unisex"
                ]
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
                caracteristicas: [
                    "Notas amaderadas",
                    "Duración de 8 horas",
                    "Presentación de 100ml"
                ]
            }
        ];
        
        localStorage.setItem('barberInventory', JSON.stringify(productos));
        console.log('Productos por defecto guardados');
    }
    
    return productos;
}

// Cargar productos al iniciar
productos = cargarProductos();

// ===== ESCUCHAR ACTUALIZACIONES DEL ADMIN =====
window.addEventListener('inventoryUpdated', function(e) {
    productos = e.detail;
    if (document.getElementById('productGrid') && typeof window.renderProductos === 'function') {
        window.renderProductos('todo');
    }
});

// ===== FUNCIÓN PARA ABRIR MODAL =====
window.openModal = function(id) {
    console.log('Abriendo modal para producto ID:', id);
    
    // Buscar en localStorage primero
    let listado = [];
    try {
        const stored = localStorage.getItem('barberInventory');
        listado = stored ? JSON.parse(stored) : productos;
    } catch(e) {
        console.error('Error al leer localStorage:', e);
        listado = productos;
    }
    
    const producto = listado.find(p => p.id == id);
    
    if (producto) {
        console.log('Producto encontrado:', producto.nombre);
        console.log('Categoría:', producto.categoria);
        console.log('Stock por talla:', producto.stockPorTalla);
        console.log('Imágenes disponibles:', producto.imagenes ? producto.imagenes.length : 1);
        
        if (window.Lightbox) {
            Lightbox.abrirModal(producto, 0);
        } else {
            console.error('Lightbox no está definido');
        }
    } else {
        console.error('Producto no encontrado con ID:', id);
    }
};

// ===== FUNCIÓN PARA RENDERIZAR PRODUCTOS =====
window.renderProductos = function(filtro = "todo") {
    const grid = document.getElementById('productGrid');
    if (!grid) {
        console.log('No hay grid de productos - probablemente estamos en la página principal');
        return;
    }
    
    console.log('Renderizando productos con filtro:', filtro);
    
    // Leer directamente del localStorage para datos siempre actualizados
    let listado = [];
    try {
        const stored = localStorage.getItem('barberInventory');
        // Si hay datos en localStorage y no está vacío, úsalos
        if (stored && JSON.parse(stored).length > 0) {
            listado = JSON.parse(stored);
        } else {
            // Si no hay nada en localStorage, usa el array por defecto
            listado = productos;
            localStorage.setItem('barberInventory', JSON.stringify(listado));
        }
    } catch(e) {
        console.error('Error al leer localStorage:', e);
        listado = productos;
    }
    
    // Filtrar por categoría
    let filtrados = filtro === "todo" 
        ? listado 
        : listado.filter(p => p.categoria && p.categoria.toLowerCase() === filtro.toLowerCase());
    
    if (filtrados.length === 0) {
        grid.innerHTML = '<p class="no-products">No se encontraron productos en esta categoría.</p>';
        return;
    }
    
    // Función para obtener el texto de categoría
    const getCategoriaTexto = (categoria) => {
        if (!categoria) return 'PRODUCTO';
        const cat = categoria.toLowerCase();
        if (cat === 'ropa') return 'ROPA';
        if (cat === 'perfumes') return 'PERFUMES';
        if (cat === 'grooming') return 'CUIDADO PERSONAL';
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

// ===== FUNCIÓN PARA BUSCAR PRODUCTOS =====
window.buscarProductos = function() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    
    const termino = input.value.toLowerCase().trim();
    const grid = document.getElementById('productGrid');
    
    if (!grid) return;
    
    // Obtener productos actualizados
    let listado = [];
    try {
        const stored = localStorage.getItem('barberInventory');
        listado = stored ? JSON.parse(stored) : productos;
    } catch(e) {
        listado = productos;
    }
    
    if (termino === '') {
        window.renderProductos('todo');
        return;
    }
    
    const filtrados = listado.filter(p => 
        p.nombre.toLowerCase().includes(termino) ||
        p.categoria.toLowerCase().includes(termino)
    );
    
    if (filtrados.length === 0) {
        grid.innerHTML = '<p class="no-products">No se encontraron productos</p>';
        return;
    }
    
    const getCategoriaTexto = (categoria) => {
        if (!categoria) return 'PRODUCTO';
        const cat = categoria.toLowerCase();
        if (cat === 'ropa') return 'ROPA';
        if (cat === 'perfumes') return 'PERFUMES';
        if (cat === 'grooming') return 'CUIDADO PERSONAL';
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

// ===== INICIALIZAR AL CARGAR LA PÁGINA =====
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('productGrid')) {
        window.renderProductos('todo');
    }
});