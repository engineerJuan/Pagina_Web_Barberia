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
                // Asignar tallas por defecto si es necesario
                p.stockPorTalla = { S: 0, M: 0, L: 0, XL: 0 };
            }
        });
    } else {
        // Productos por defecto con múltiples imágenes y tallas CORRECTAS
        productos = [
            {
                id: 1,
                nombre: "Kit Grooming Premium",
                categoria: "grooming",
                precio: "$580",
                precioFormato: "$580",
                img: "img/productos/pro2.jpg",
                imagenes: ["img/productos/pro2.jpg", "img/productos/pro3.jpg", "img/productos/pro1.jpg"],
                stock: 3,
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
                nombre: "Sudera Dino Dreams",
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
                nombre: "Sudera Good Vibes",
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
    
    const producto = listado.find(p => p.id === id);
    
    if (producto) {
        console.log('Producto encontrado:', producto.nombre);
        console.log('Categoría:', producto.categoria);
        console.log('Stock por talla:', producto.stockPorTalla);
        console.log('Imágenes disponibles:', producto.imagenes ? producto.imagenes.length : 1);
        
        if (window.Lightbox) {
            Lightbox.currentIndex = 0;
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
    
    // Intentar leer del admin, si no, usar el array base
    let listado = [];
    try {
        const stored = localStorage.getItem('barberInventory');
        listado = stored ? JSON.parse(stored) : productos;
    } catch(e) {
        console.error('Error al leer localStorage:', e);
        listado = productos;
    }
    
    let filtrados = filtro === "todo" ? listado : listado.filter(p => p.categoria === filtro);
    
    if (filtrados.length === 0) {
        grid.innerHTML = '<p class="no-products">No se encontraron productos</p>';
        return;
    }
    
    grid.innerHTML = filtrados.map(p => `
        <div class="product-card" onclick="openModal(${p.id})" style="cursor: pointer;">
            <div class="product-image-box">
                <img src="${p.img}" alt="${p.nombre}" onerror="this.src='img/placeholder.jpg'">
            </div>
            <div class="product-details">
                <h3 class="product-title">${p.nombre}</h3>
                <span class="product-category-label">${p.categoria === 'grooming' ? 'CUIDADO PERSONAL' : 'ROPA'}</span>
                <p class="product-price">${p.precio}</p>
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
    
    grid.innerHTML = filtrados.map(p => `
        <div class="product-card" onclick="openModal(${p.id})" style="cursor: pointer;">
            <div class="product-image-box">
                <img src="${p.img}" alt="${p.nombre}" onerror="this.src='img/placeholder.jpg'">
            </div>
            <div class="product-details">
                <h3 class="product-title">${p.nombre}</h3>
                <span class="product-category-label">${p.categoria === 'grooming' ? 'CUIDADO PERSONAL' : 'ROPA'}</span>
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