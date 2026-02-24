// ===== VARIABLE GLOBAL Y CARGA INICIAL =====
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

window.addEventListener('inventoryUpdated', function(e) {
    productos = e.detail;
    if (document.getElementById('productGrid') && typeof window.renderProductos === 'function') {
        window.renderProductos('todo');
    }
});

window.openModal = function(id) {
    console.log('Abriendo modal para producto ID:', id);
    
    const modalAbierto = document.getElementById('productModal');
    if (modalAbierto && modalAbierto.classList.contains('active')) {
        if (window.Lightbox) {
            Lightbox.cerrarModal();
        }
    }
    
    setTimeout(() => {
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

window.renderProductos = function(filtro = "todo") {
    const grid = document.getElementById('productGrid');
    if (!grid) {
        console.log('No hay grid de productos');
        return;
    }

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

    grid.innerHTML = '';

    let filtrados = filtro === "todo" 
        ? listadoActual 
        : listadoActual.filter(p => p.categoria && p.categoria.toLowerCase() === filtro.toLowerCase());

    if (filtrados.length === 0) {
        grid.innerHTML = '<p class="no-products">No se encontraron productos en esta categoría.</p>';
        return;
    }

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

window.buscarProductos = function() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    
    const termino = input.value.toLowerCase().trim();
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    
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
        (p.categoria && p.categoria.toLowerCase().includes(termino))
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

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('productGrid')) {
        window.renderProductos('todo');
    }
});