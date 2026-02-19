// ===== LIGHTBOX - VISOR DE IMÁGENES =====
const Lightbox = {
    currentProduct: null,
    currentIndex: 0,
    tallaSeleccionada: null,
    currentImages: null,
    currentViewerIndex: 0,
    
    // ===== INICIALIZACIÓN =====
    init: function() {
        console.log('Lightbox inicializado');
        this.configurarEventos();
    },
    
    // ===== CONFIGURAR EVENTOS GLOBALES =====
    configurarEventos: function() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cerrarModal();
                this.cerrarVisor();
            }
            
            if (e.key === 'ArrowLeft') {
                const modal = document.getElementById('productModal');
                const viewer = document.getElementById('imageViewer');
                
                if (modal && modal.classList.contains('active')) {
                    this.navegarImagen('prev');
                }
                if (viewer && viewer.classList.contains('active')) {
                    this.navegarVisor('prev');
                }
            }
            
            if (e.key === 'ArrowRight') {
                const modal = document.getElementById('productModal');
                const viewer = document.getElementById('imageViewer');
                
                if (modal && modal.classList.contains('active')) {
                    this.navegarImagen('next');
                }
                if (viewer && viewer.classList.contains('active')) {
                    this.navegarVisor('next');
                }
            }
        });
    },
    
    // ===== ABRIR MODAL DE PRODUCTO =====
    abrirModal: function(producto, index = 0) {
        console.log('Abriendo modal para:', producto.nombre);
        console.log('Categoría:', producto.categoria);
        console.log('Stock por talla:', producto.stockPorTalla);
        
        this.currentProduct = producto;
        this.currentIndex = index;
        this.tallaSeleccionada = null;
        
        const modal = document.getElementById('productModal');
        const modalImg = document.getElementById('modalImg');
        const modalTitle = document.getElementById('modalTitle');
        const modalPrice = document.getElementById('modalPrice');
        const featuresList = document.getElementById('modalFeatures');
        const errorMsg = document.getElementById('talla-error');
        
        if (!modal || !modalImg || !modalTitle || !modalPrice) {
            console.error('Elementos del modal no encontrados');
            return;
        }
        
        // Resetear error
        if (errorMsg) errorMsg.style.display = 'none';
        
        // Rellena la info al lado de la imagen
        modalTitle.textContent = producto.nombre;
        modalPrice.textContent = producto.precioFormato || producto.precio;
        
        // Muestra la imagen principal
        const imagenes = producto.imagenes || [producto.img];
        modalImg.src = imagenes[index] || producto.img;
        
        // Al hacer clic en la imagen, se abre el visor de pantalla completa
        modalImg.onclick = () => {
            console.log('Abriendo visor completo');
            this.abrirVisor(imagenes, this.currentIndex);
        };
        
        // Características
        if (producto.caracteristicas && featuresList) {
            featuresList.innerHTML = producto.caracteristicas.map(f => 
                `<li><i class="fas fa-check-circle"></i> ${f}</li>`
            ).join('');
        }
        
        // Configurar selector de tallas - VERSIÓN CORREGIDA
        this.setupSizeSelector(producto);
        
        // Configurar indicador de stock
        this.actualizarStockIndicator(producto.stock || 0);
        
        // Configurar navegación del modal
        this.configurarNavegacionModal();
        
        // Configurar botón WhatsApp
        this.configurarWhatsAppBtn();
        
        // Mostrar modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },
    
    // ===== CONFIGURAR SELECTOR DE TALLAS (VERSIÓN CORREGIDA) =====
    setupSizeSelector: function(producto) {
        const tallaSection = document.getElementById('talla-section');
        const tallaContainer = document.getElementById('talla-botones');
        const errorMsg = document.getElementById('talla-error');
        const tallasInfo = document.getElementById('tallas-disponibles-info');
        
        console.log('Configurando selector de tallas para:', producto.nombre);
        
        if (!tallaSection || !tallaContainer) {
            console.error('No se encontraron los elementos del selector de tallas');
            return;
        }
        
        // Limpiar contenedor
        tallaContainer.innerHTML = '';
        
        // ===== VERIFICACIÓN CORREGIDA =====
        // Comprobar si es ropa Y tiene stockPorTalla definido
        const esRopa = producto.categoria && producto.categoria.toLowerCase() === 'ropa';
        const tieneTallas = producto.stockPorTalla && Object.keys(producto.stockPorTalla).length > 0;
        
        if (esRopa && tieneTallas) {
            console.log('✅ Producto de ropa detectado con tallas, mostrando selector');
            tallaSection.style.display = 'block';
            
            const tallasDisponibles = producto.stockPorTalla;
            let totalStock = 0;
            
            // Calcular stock total
            Object.values(tallasDisponibles).forEach(stock => {
                totalStock += stock;
            });
            
            if (tallasInfo) {
                tallasInfo.textContent = `${totalStock} DISPONIBLES`;
            }
            
            // Crear botones para cada talla en orden específico
            const tallasOrdenadas = ['S', 'M', 'L', 'XL'];
            
            tallasOrdenadas.forEach(talla => {
                if (tallasDisponibles.hasOwnProperty(talla)) {
                    const stock = tallasDisponibles[talla];
                    
                    const btn = document.createElement('button');
                    btn.className = `talla-btn ${stock <= 0 ? 'disabled' : ''}`;
                    btn.innerText = talla;
                    
                    if (stock > 0) {
                        btn.title = `${stock} disponibles`;
                        btn.onclick = (e) => {
                            e.stopPropagation();
                            document.querySelectorAll('.talla-btn').forEach(b => b.classList.remove('selected'));
                            btn.classList.add('selected');
                            this.tallaSeleccionada = talla;
                            if (errorMsg) errorMsg.style.display = 'none';
                            console.log("✅ Talla seleccionada:", this.tallaSeleccionada);
                        };
                    } else {
                        btn.title = "Talla agotada";
                        btn.disabled = true;
                    }
                    
                    tallaContainer.appendChild(btn);
                }
            });
        } else {
            console.log('ℹ️ Producto no es de ropa o no tiene tallas, ocultando selector');
            tallaSection.style.display = 'none';
        }
    },
    
    // ===== ACTUALIZAR INDICADOR DE STOCK =====
    actualizarStockIndicator: function(stock) {
        const indicator = document.getElementById('stockIndicator');
        const badge = document.getElementById('stockBadge');
        const text = document.getElementById('stockText');
        
        if (!indicator || !badge || !text) return;
        
        if (stock > 5) {
            badge.className = 'stock-badge in-stock';
            text.textContent = `${stock} unidades disponibles`;
        } else if (stock > 0) {
            badge.className = 'stock-badge low-stock';
            text.textContent = `¡Últimas ${stock} unidades!`;
        } else {
            badge.className = 'stock-badge out-of-stock';
            text.textContent = 'Producto agotado';
        }
    },
    
    // ===== CONFIGURAR NAVEGACIÓN DE IMÁGENES =====
    configurarNavegacionModal: function() {
        const prevBtn = document.getElementById('prevImageBtn');
        const nextBtn = document.getElementById('nextImageBtn');
        
        if (!this.currentProduct) return;
        
        const imagenes = this.currentProduct.imagenes || [this.currentProduct.img];
        
        console.log("Imágenes disponibles:", imagenes.length);

        if (imagenes.length > 1) {
            if (prevBtn) {
                prevBtn.style.display = 'flex';
                prevBtn.style.opacity = '1';
                prevBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.navegarImagen('prev');
                };
            }
            
            if (nextBtn) {
                nextBtn.style.display = 'flex';
                nextBtn.style.opacity = '1';
                nextBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.navegarImagen('next');
                };
            }
        } else {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
        }
    },
    
    // ===== NAVEGAR ENTRE IMÁGENES =====
    navegarImagen: function(direccion) {
        if (!this.currentProduct) return;
        
        const imagenes = this.currentProduct.imagenes || [this.currentProduct.img];
        
        if (direccion === 'prev') {
            this.currentIndex = (this.currentIndex - 1 + imagenes.length) % imagenes.length;
        } else {
            this.currentIndex = (this.currentIndex + 1) % imagenes.length;
        }
        
        const modalImg = document.getElementById('modalImg');
        if (modalImg) {
            modalImg.src = imagenes[this.currentIndex];
            console.log(`Imagen cambiada a índice ${this.currentIndex}`);
        }
    },
    
    // ===== CONFIGURAR BOTÓN DE WHATSAPP =====
    configurarWhatsAppBtn: function() {
        const waBtn = document.getElementById('btnWhatsappModal');
        const errorMsg = document.getElementById('talla-error');
        const tallaSection = document.getElementById('talla-section');
        
        if (!waBtn) return;
        
        waBtn.onclick = (e) => {
            e.preventDefault();
            
            // Validación: Si es ropa y no eligió talla, mostrar error
            if (tallaSection && tallaSection.style.display !== 'none' && !this.tallaSeleccionada) {
                if (errorMsg) errorMsg.style.display = 'block';
                return;
            }
            
            const producto = this.currentProduct;
            if (!producto) return;
            
            let mensaje = `Hola, me interesa el producto: ${producto.nombre} - ${producto.precio}`;
            
            if (this.tallaSeleccionada) {
                mensaje += ` en talla ${this.tallaSeleccionada}`;
            }
            
            mensaje += `. ¿Podrían confirmar disponibilidad? Gracias.`;
            window.open(`https://wa.me/525660797723?text=${encodeURIComponent(mensaje)}`, '_blank');
        };
    },
    
    // ===== ABRIR VISOR DE IMAGEN COMPLETA =====
    abrirVisor: function(imagenes, index) {
        this.currentImages = imagenes;
        this.currentViewerIndex = index;
        
        const viewer = document.getElementById('imageViewer');
        const viewerImg = document.getElementById('viewerImg');
        const counter = document.getElementById('imageCounter');
        
        if (!viewer || !viewerImg || !counter) return;
        
        viewerImg.src = imagenes[index];
        counter.textContent = `${index + 1} / ${imagenes.length}`;
        
        viewer.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        this.configurarNavegacionVisor();
    },
    
    // ===== CONFIGURAR NAVEGACIÓN DEL VISOR =====
    configurarNavegacionVisor: function() {
        const prevBtn = document.getElementById('viewerPrevBtn');
        const nextBtn = document.getElementById('viewerNextBtn');
        const closeBtn = document.getElementById('imageViewerClose');
        const viewer = document.getElementById('imageViewer');
        
        if (prevBtn) {
            prevBtn.onclick = (e) => {
                e.stopPropagation();
                this.navegarVisor('prev');
            };
        }
        
        if (nextBtn) {
            nextBtn.onclick = (e) => {
                e.stopPropagation();
                this.navegarVisor('next');
            };
        }
        
        if (closeBtn) {
            closeBtn.onclick = () => {
                this.cerrarVisor();
            };
        }
        
        if (viewer) {
            viewer.onclick = (e) => {
                if (e.target === viewer) {
                    this.cerrarVisor();
                }
            };
        }
    },
    
    // ===== NAVEGAR EN EL VISOR =====
    navegarVisor: function(direccion) {
        if (!this.currentImages) return;
        
        if (direccion === 'prev') {
            this.currentViewerIndex = (this.currentViewerIndex - 1 + this.currentImages.length) % this.currentImages.length;
        } else {
            this.currentViewerIndex = (this.currentViewerIndex + 1) % this.currentImages.length;
        }
        
        const viewerImg = document.getElementById('viewerImg');
        const counter = document.getElementById('imageCounter');
        
        if (viewerImg) {
            viewerImg.src = this.currentImages[this.currentViewerIndex];
        }
        
        if (counter) {
            counter.textContent = `${this.currentViewerIndex + 1} / ${this.currentImages.length}`;
        }
    },
    
    // ===== CERRAR MODAL =====
    cerrarModal: function() {
        const modal = document.getElementById('productModal');
        if (modal) {
            modal.classList.remove('active');
        }
        document.body.style.overflow = 'auto';
    },
    
    // ===== CERRAR VISOR =====
    cerrarVisor: function() {
        const viewer = document.getElementById('imageViewer');
        if (viewer) {
            viewer.classList.remove('active');
        }
        document.body.style.overflow = 'auto';
    }
};

// ===== INICIALIZAR =====
document.addEventListener('DOMContentLoaded', function() {
    Lightbox.init();
});

window.Lightbox = Lightbox;