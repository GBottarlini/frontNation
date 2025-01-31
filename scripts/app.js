let currentPage = 1; // Página actual
const limit = 12; // Número de clientes por página

const filterInputs = document.querySelectorAll('#filtros input');

// Función para construir la consulta de filtros
const buildQuery = () => {
    const nombre = document.getElementById('nombre')?.value || '';
    const sucursal = document.getElementById('sucursal')?.value || '';
    const odometroMin = document.getElementById('odometroMin')?.value || '';
    const odometroMax = document.getElementById('odometroMax')?.value || '';
    const patente = document.getElementById('patente')?.value || '';
    const vin = document.getElementById('vin')?.value || '';
    const totalVenta = document.getElementById('totalVenta')?.value || '';
    const modelo = document.getElementById('modelo')?.value || '';
    const marca = document.getElementById('marca')?.value || '';
    const ordenar = document.getElementById('ordenar')?.value || '';

    return new URLSearchParams({
        nombre,
        sucursal,
        odometroMin,
        odometroMax,
        patente,
        vin,
        totalVenta,
        modelo,
        marca,
        ordenar
    }).toString();
};

// Función para manejar el cambio de estado del checkbox
const toggleChecked = async (numeroOrden) => {
    const checkbox = document.getElementById(`check-${numeroOrden}`);
    const checked = checkbox.checked;

    try {
        const response = await fetch(`https://backnation.onrender.com/clientes/${numeroOrden}/consultado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ consultado: checked })
        });

        if (!response.ok) {
            throw new Error('Error al actualizar el estado de consultado');
        }

        // Recargar los clientes para reflejar el cambio
        const query = buildQuery();
        loadClientes(currentPage, query);
    } catch (error) {
        console.error('Error al actualizar el estado de consultado:', error);
    }
};

// Cargar clientes con los filtros aplicados
const loadClientes = (page, query = '') => {
    fetch(`https://backnation.onrender.com/clientes?page=${page}&limit=${limit}&${query}`)
        .then(response => response.json())
        .then(data => {
            const { docs, totalPages } = data;
            const container = document.getElementById('clientes-container');
            container.innerHTML = '';

            docs.forEach(cliente => {
                const formattedTotalVenta = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(cliente.TotalVenta);
                const formattedOdometroValor = cliente.OdometroValor.toLocaleString('es-CL');

                const clienteDiv = document.createElement('div');
                clienteDiv.className = `p-4 rounded-lg shadow-md transition-transform transform hover:scale-105 ${cliente.consultado ? 'checked bg-green-100' : 'bg-white'}`;
                clienteDiv.innerHTML = `
                    <label class="flex items-center">
                        <input type="checkbox" class="mr-2" id="check-${cliente.NumeroOrden}" onchange="toggleChecked(${cliente.NumeroOrden})" ${cliente.consultado ? 'checked' : ''}>
                        <h3 class="text-xl font-bold">Número de Orden: ${cliente.NumeroOrden}</h3>
                    </label>
                    <p class="text-gray-700">Nombre: <span class="font-semibold">${cliente.Nombre}</span></p>
                    <p class="text-gray-700">Sucursal: <span class="font-semibold">${cliente.Sucursal}</span></p>
                    <p class="text-gray-700">Kilómetros: <span class="font-semibold">${formattedOdometroValor} KM</span></p>
                    <p class="text-gray-700">Modelo: <span class="font-semibold">${cliente.Modelo}</span></p>
                    <p class="text-gray-700">Contacto: <span class="font-semibold">${cliente.IncidentesRecepcionista}</span></p>
                    <button class="bg-blue-500 text-white rounded p-2 mt-2 hover:bg-blue-600" onclick="showClientDetails(${cliente.NumeroOrden})">Ver Detalles</button>
                `;

                container.appendChild(clienteDiv);
            });

            updatePagination(totalPages);
        })
        .catch(error => console.error('Error al obtener los clientes:', error));
};
// Manejar el evento del botón "Filtrar"
document.getElementById('filtrar').addEventListener('click', () => {
    const query = buildQuery();
    currentPage = 1; // Reiniciar a la primera página al filtrar
    loadClientes(currentPage, query);
});

// Manejar el evento de la tecla Enter en los filtros
filterInputs.forEach(input => {
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const query = buildQuery();
            currentPage = 1; // Reiniciar a la primera página al filtrar
            loadClientes(currentPage, query);
        }
    });
});

// Función para actualizar la paginación
const updatePagination = (totalPages) => {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = ''; // Limpiar la paginación

    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Page navigation');
    const ul = document.createElement('ul');
    ul.className = 'inline-flex space-x-2';

    // Botón de página anterior
    const prevButton = document.createElement('li');
    const prevBtn = document.createElement('button');
    prevBtn.className = 'flex items-center justify-center w-10 h-10 text-indigo-600 transition-colors duration-150 rounded-full focus:shadow-outline hover:bg-indigo-100';
    prevBtn.innerHTML = `<svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" fill-rule="evenodd"></path></svg>`;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            const query = buildQuery(); // Mantener los filtros
            loadClientes(currentPage, query);
        }
    };
    prevButton.appendChild(prevBtn);
    ul.appendChild(prevButton);

    // Calcular el rango de páginas a mostrar
    const maxVisiblePages = 5; // Número máximo de botones de página a mostrar
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Ajustar el rango si está cerca del final
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Botones de páginas
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('li');
        const pageBtn = document.createElement('button');
        pageBtn.className = `w-10 h-10 transition-colors duration-150 rounded-full focus:shadow-outline hover:bg-indigo-100 ${currentPage === i ? 'bg-indigo-600 text-white' : 'text-indigo-600'}`;
        pageBtn.innerText = i;
        pageBtn.onclick = () => {
            currentPage = i;
            const query = buildQuery(); // Mantener los filtros
            loadClientes(currentPage, query);
        };
        pageButton.appendChild(pageBtn);
        ul.appendChild(pageButton);
    }

    // Botón de página siguiente
    const nextButton = document.createElement('li');
    const nextBtn = document.createElement('button');
    nextBtn.className = 'flex items-center justify-center w-10 h-10 text-indigo-600 transition-colors duration-150 rounded-full focus:shadow-outline hover:bg-indigo-100';
    nextBtn.innerHTML = `<svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" fill-rule="evenodd"></path></svg>`;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            const query = buildQuery(); // Mantener los filtros
            loadClientes(currentPage, query);
        }
    };
    nextButton.appendChild(nextBtn);
    ul.appendChild(nextButton);

    nav.appendChild(ul);
    paginationContainer.appendChild(nav);
};

// Función para mostrar detalles del cliente
const showClientDetails = (numeroOrden) => {
    fetch(`https://backnation.onrender.com/clientes/${numeroOrden}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los detalles del cliente');
            }
            return response.json();
        })
        .then(cliente => {
            // Formatear precios y kilómetros
            const formattedTotalVenta = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(cliente.TotalVenta);
            const formattedOdometroValor = cliente.OdometroValor.toLocaleString('es-CL');

            const clientDetails = `
                <p><strong>Número de Orden:</strong> ${cliente.NumeroOrden}</p>
                <p><strong>Nombre:</strong> ${cliente.Nombre}</p>
                <p><strong>Sucursal:</strong> ${cliente.Sucursal}</p>
                <p><strong>Apertura:</strong> ${new Date(cliente.Apertura).toLocaleDateString()}</p>
                <p><strong>Servicios Venta:</strong> ${cliente.ServiciosVenta}</p>
                <p><strong>Repuestos Venta:</strong> ${cliente.RepuestosVenta}</p>
                <p><strong>Terceros Venta:</strong> ${cliente.TercerosVenta}</p>
                <p><strong>Total Venta:</strong> ${formattedTotalVenta}</p>
                <p><strong>Descripción:</strong> ${cliente.Descripcion}</p>
                <p><strong>Recepcionista:</strong> ${cliente.Recepcionista}</p>
                <p><strong>Empresa:</strong> ${cliente.EMPRESA}</p>
                <p><strong>Cierre:</strong> ${new Date(cliente.Cierre).toLocaleDateString()}</p>
                <p><strong>Cargo:</strong> ${cliente.Cargo}</p>
                <p><strong>Modelo:</strong> ${cliente.Modelo}</p>
                <p><strong>Año:</strong> ${cliente.Año}</p>
                <p><strong>Marca:</strong> ${cliente.Marca}</p>
                <p><strong>VIN:</strong> ${cliente.VIN}</p>
                <p><strong>Patente:</strong> ${cliente.Patente}</p>
                <p><strong>Odómetro Valor:</strong> ${formattedOdometroValor} KM</p>
                <p><strong>Incidentes Cliente:</strong> ${cliente.IncidentesCliente}</p>
                <p><strong>Incidentes Recepcionista:</strong> ${cliente.IncidentesRecepcionista}</p>
                <p><strong>Resultado Técnico:</strong> ${cliente.ResultadoTecnico}</p>
            `;
            document.getElementById('client-details').innerHTML = clientDetails;
            document.getElementById('client-modal').classList.remove('hidden');
        })
        .catch(error => console.error('Error al obtener los detalles del cliente:', error));
};

const closeModal = () => {
    document.getElementById('client-modal').classList.add('hidden');
};

// Cargar la primera página de clientes al inicio
loadClientes(currentPage);