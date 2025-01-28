let currentPage = 1; // Página actual
const limit = 12; // Número de clientes por página

const filterInputs = document.querySelectorAll('#filtros input');

// Función para construir la consulta de filtros
const buildQuery = () => {
    const nombre = document.getElementById('nombre').value;
    const sucursal = document.getElementById('sucursal').value;
    const odometro = document.getElementById('odometro').value;
    const patente = document.getElementById('patente').value;
    const vin = document.getElementById('vin').value;
    const totalVenta = document.getElementById('totalVenta').value;
    const modelo = document.getElementById('modelo').value;
    const marca = document.getElementById('marca').value;
    const ordenar = document.getElementById('ordenar').value;

    return new URLSearchParams({
        nombre,
        sucursal,
        odometro,
        patente,
        vin,
        totalVenta,
        modelo,
        marca,
        ordenar
    }).toString();
};

// Cargar clientes con los filtros aplicados
const loadClientes = (page, query = '') => {
    fetch(`https://backnation.onrender.com/clientes?page=${page}&limit=${limit}&${query}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta de la API');
            }
            return response.json();
        })
        .then(data => {
            const { docs, totalPages } = data; // docs contiene los clientes y totalPages el número total de páginas
            const container = document.getElementById('clientes-container');
            container.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevos clientes

            // Agregar los clientes al contenedor
            docs.forEach(cliente => {
                const formattedTotalVenta = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(cliente.TotalVenta);
                const formattedOdometroValor = cliente.OdometroValor.toLocaleString('es-CL');

                const clienteDiv = document.createElement('div');
                clienteDiv.className = 'bg-white p-4 rounded-lg shadow-md transition-transform transform hover:scale-105';
                clienteDiv.innerHTML = `
                    <h3 class="text-xl font-bold">Número de Orden: ${cliente.NumeroOrden}</h3>
                    <p class="text-gray-700">Nombre: <span class="font-semibold">${cliente.Nombre}</span></p>
                    <p class="text-gray-700">Sucursal: <span class="font-semibold">${cliente.Sucursal}</span></p>
                    <p class="text-gray-700">Kilómetros: <span class="font-semibold">${formattedOdometroValor} KM</span></p>
                    <p class="text-gray-700">Modelo: <span class="font-semibold">${cliente.Modelo}</span></p>
                    <p class="text-gray-700">Contacto: <span class="font-semibold">${cliente.IncidentesRecepcionista}</span></p>
                    <button class="bg-blue-500 text-white rounded p-2 mt-2 hover:bg-blue-600" onclick="showClientDetails(${cliente.NumeroOrden})">Ver Detalles</button>
                `;
                container.appendChild(clienteDiv);
            });

            // Actualizar la paginación
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

    // Botón de página anterior
    const prevButton = document.createElement('button');
    prevButton.innerText = '←';
    prevButton.className = 'bg-blue-500 text-white rounded p-2 mx-1 hover:bg-blue-600';
    prevButton.disabled = currentPage === 1; // Deshabilitar si estamos en la primera página
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            const query = buildQuery(); // Mantener los filtros
            loadClientes(currentPage, query);
        }
    };
    paginationContainer.appendChild(prevButton);

    // Mostrar número de página actual
    const pageInfo = document.createElement('span');
    pageInfo.innerText = `Página ${currentPage} de ${totalPages}`;
    paginationContainer.appendChild(pageInfo);

    // Botón de página siguiente
    const nextButton = document.createElement('button');
    nextButton.innerText = '→';
    nextButton.className = 'bg-blue-500 text-white rounded p-2 mx-1 hover:bg-blue-600';
    nextButton.disabled = currentPage === totalPages; // Deshabilitar si estamos en la última página
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            const query = buildQuery(); // Mantener los filtros
            loadClientes(currentPage, query);
        }
    };
    paginationContainer.appendChild(nextButton);
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