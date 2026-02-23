const Lightbox = {
    currentProduct: null,
    currentIndex: 0,
    tallaSeleccionada: null,
    currentImages: null,
    currentViewerIndex: 0,
    
    init: function() {
        console.log('Lightbox inicializado');
        this.configurarEventos();
    },
    
    configurarEventos: function() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cerrarModal();
                this.cerrarVisor();
            }
            
            if (e.key === 'ArrowLeft') {
                const modal = document.getElementById('productModal');
                const viewer = document.getElementById('imageViewer');
                
                if (modal?.classList.contains('active')) {
                    this.navegarImagen('prev');
                }
                if (viewer?.classList.contains('active')) {
                    this.navegarVisor('prev');
                }
            }
            
            if (e.key === 'ArrowRight') {
                const modal = document.getElementById('productModal');
                const viewer = document.getElementById('imageViewer');
                
                if (modal?.classList.contains('active')) {
                    this.navegarImagen('next');
                }
                if (viewer?.classList.contains('active')) {
                    this.navegarVisor('next');
                }
            }
        });
    },
    
    abrirModal: function(producto, index = 0) {
        console.log('Abriendo modal para:', producto.nombre);
        
        this.currentProduct = producto;
        this.currentIndex = index;
        this.tallaSeleccionada = null;
        this.currentImages = producto.imagenes || [producto.img];
        
        const modal = document.getElementById('productModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalPrice = document.getElementById('modalPrice');
        const featuresList = document.getElementById('modalFeatures');
        const modalArea = document.getElementById('modalImageArea');
        
        if (!modal || !modalTitle || !modalPrice || !modalArea) {
            console.error('Elementos del modal no encontrados');
            return;
        }
        
        // Rellena la info
        modalTitle.textContent = producto.nombre;
        modalPrice.textContent = producto.precioFormato || producto.precio;
        
        // Limpiar área de imágenes
        modalArea.innerHTML = '';
        
        // Eliminar contador anterior si existe
        const oldCounter = document.querySelector('.modal-image-counter');
        if (oldCounter) oldCounter.remove();
        
        // Crear y añadir el nuevo contador
        const counter = document.createElement('div');
        counter.className = 'modal-image-counter';
        counter.textContent = `${index + 1} / ${this.currentImages.length}`;
        modalArea.appendChild(counter);
        
        // Agregar todas las imágenes
        this.currentImages.forEach((imgSrc, i) => {
            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = producto.nombre;
            img.className = 'modal-img';
            img.loading = 'lazy';
            img.setAttribute('data-index', i);
            
            // Evento de clic para abrir visor
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const imgIndex = parseInt(e.target.getAttribute('data-index')) || 0;
                this.abrirVisor(this.currentImages, imgIndex);
            });
            
            modalArea.appendChild(img);
        });
        
        // Evento de scroll para actualizar contador
        modalArea.onscroll = () => {
            if (modalArea.children.length > 1) { // +1 por el contador
                const containerWidth = modalArea.clientWidth;
                const scrollLeft = modalArea.scrollLeft;
                const newIndex = Math.round(scrollLeft / containerWidth);
                
                if (newIndex >= 0 && newIndex < this.currentImages.length && newIndex !== this.currentIndex) {
                    this.currentIndex = newIndex;
                    const counter = document.querySelector('.modal-image-counter');
                    if (counter) {
                        counter.textContent = `${this.currentIndex + 1} / ${this.currentImages.length}`;
                    }
                }
            }
        };
        
        // Posicionar en la imagen inicial
        setTimeout(() => {
            modalArea.scrollLeft = index * modalArea.clientWidth;
        }, 50);
        
        // Características
        if (producto.caracteristicas && featuresList) {
            featuresList.innerHTML = producto.caracteristicas.map(f => 
                `<li><i class="fas fa-check-circle"></i> ${f}</li>`
            ).join('');
        }
        
        // Configurar selector de tallas
        this.setupSizeSelector(producto);
        this.actualizarStockIndicator(producto.stock || 0);
        this.configurarNavegacionModal();
        this.configurarWhatsAppBtn();
        
        // Mostrar modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },
    
    abrirVisor: function(imagenes, index) {
        console.log('Abriendo visor en índice:', index);
        
        this.currentImages = imagenes;
        this.currentViewerIndex = index;
        
        const viewer = document.getElementById('imageViewer');
        const viewerContainer = document.querySelector('.image-viewer-container');
        const counter = document.getElementById('imageCounter');
        
        if (!viewer || !viewerContainer || !counter) return;
        
        // Limpiar contenedor
        viewerContainer.innerHTML = '';
        
        // Agregar todas las imágenes
        imagenes.forEach((imgSrc, i) => {
            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = 'Producto';
            img.className = 'viewer-img';
            img.loading = 'lazy';
            img.setAttribute('data-index', i);
            
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                // Cerrar al hacer clic en la imagen
                this.cerrarVisor();
            });
            
            viewerContainer.appendChild(img);
        });
        
        counter.textContent = `${index + 1} / ${imagenes.length}`;
        
        // Evento de scroll para actualizar contador
        viewerContainer.onscroll = () => {
            if (viewerContainer.children.length > 0) {
                const containerWidth = viewerContainer.clientWidth;
                const scrollLeft = viewerContainer.scrollLeft;
                const newIndex = Math.round(scrollLeft / containerWidth);
                
                if (newIndex >= 0 && newIndex < imagenes.length && newIndex !== this.currentViewerIndex) {
                    this.currentViewerIndex = newIndex;
                    counter.textContent = `${this.currentViewerIndex + 1} / ${imagenes.length}`;
                }
            }
        };
        
        // Posicionar en la imagen inicial
        setTimeout(() => {
            viewerContainer.scrollLeft = index * viewerContainer.clientWidth;
        }, 50);
        
        viewer.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        this.configurarNavegacionVisor();
    },
    
    navegarImagen: function(direccion) {
        if (!this.currentProduct) return;
        
        const imagenes = this.currentProduct.imagenes || [this.currentProduct.img];
        
        if (direccion === 'prev') {
            this.currentIndex = (this.currentIndex - 1 + imagenes.length) % imagenes.length;
        } else {
            this.currentIndex = (this.currentIndex + 1) % imagenes.length;
        }
        
        const modalArea = document.getElementById('modalImageArea');
        if (modalArea) {
            modalArea.scrollLeft = this.currentIndex * modalArea.clientWidth;
        }
        
        const counter = document.querySelector('.modal-image-counter');
        if (counter) {
            counter.textContent = `${this.currentIndex + 1} / ${imagenes.length}`;
        }
    },
    
    navegarVisor: function(direccion) {
        if (!this.currentImages) return;
        
        if (direccion === 'prev') {
            this.currentViewerIndex = (this.currentViewerIndex - 1 + this.currentImages.length) % this.currentImages.length;
        } else {
            this.currentViewerIndex = (this.currentViewerIndex + 1) % this.currentImages.length;
        }
        
        const viewerContainer = document.querySelector('.image-viewer-container');
        const counter = document.getElementById('imageCounter');
        
        if (viewerContainer) {
            viewerContainer.scrollLeft = this.currentViewerIndex * viewerContainer.clientWidth;
        }
        
        if (counter) {
            counter.textContent = `${this.currentViewerIndex + 1} / ${this.currentImages.length}`;
        }
    },
    
    configurarNavegacionModal: function() {
        const prevBtn = document.getElementById('prevImageBtn');
        const nextBtn = document.getElementById('nextImageBtn');
        
        if (!this.currentProduct) return;
        
        const imagenes = this.currentProduct.imagenes || [this.currentProduct.img];

        if (imagenes.length > 1) {
            if (prevBtn) {
                prevBtn.style.display = 'flex';
                prevBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.navegarImagen('prev');
                };
            }
            if (nextBtn) {
                nextBtn.style.display = 'flex';
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
            closeBtn.onclick = (e) => {
                e.stopPropagation();
                this.cerrarVisor();
            };
        }
        
        if (viewer) {
            viewer.addEventListener('click', (e) => {
                if (e.target === viewer) {
                    this.cerrarVisor();
                }
            });
        }
    },
    
    cerrarModal: function() {
        const modal = document.getElementById('productModal');
        if (modal) {
            modal.classList.remove('active');
        }
        document.body.style.overflow = 'auto';
    },
    
    cerrarVisor: function() {
        const viewer = document.getElementById('imageViewer');
        if (viewer) {
            viewer.classList.remove('active');
        }
        document.body.style.overflow = 'auto';
    },
    
    setupSizeSelector: function(producto) {
        const tallaSection = document.getElementById('talla-section');
        const tallaContainer = document.getElementById('talla-botones');
        const errorMsg = document.getElementById('talla-error');
        const tallasInfo = document.getElementById('tallas-disponibles-info');
        
        if (!tallaSection || !tallaContainer) return;
        
        tallaContainer.innerHTML = '';
        
        const esRopa = producto.categoria && producto.categoria.toLowerCase() === 'ropa';
        const tieneTallas = producto.stockPorTalla && Object.keys(producto.stockPorTalla).length > 0;
        
        if (esRopa && tieneTallas) {
            tallaSection.style.display = 'block';
            
            const tallasDisponibles = producto.stockPorTalla;
            let totalStock = 0;
            
            Object.values(tallasDisponibles).forEach(stock => {
                totalStock += stock;
            });
            
            if (tallasInfo) {
                tallasInfo.textContent = `${totalStock} DISPONIBLES`;
            }
            
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
                        };
                    } else {
                        btn.title = "Talla agotada";
                        btn.disabled = true;
                    }
                    
                    tallaContainer.appendChild(btn);
                }
            });
        } else {
            tallaSection.style.display = 'none';
        }
    },
    
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
    
    configurarWhatsAppBtn: function() {
        const waBtn = document.getElementById('btnWhatsappModal');
        const errorMsg = document.getElementById('talla-error');
        const tallaSection = document.getElementById('talla-section');
        
        if (!waBtn) return;
        
        waBtn.onclick = (e) => {
            e.preventDefault();
            
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
            window.open(`https://wa.me/527299635417?text=${encodeURIComponent(mensaje)}`, '_blank');
        };
    }
};

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    Lightbox.init();
});

window.Lightbox = Lightbox;