let currentClientId = null;
let allClients = []; // Armazena todos os clientes para filtragem

// Função para carregar clientes ao iniciar a página
function loadClients() {
    fetch('http://localhost:3000/clientes')
        .then(response => response.json())
        .then(data => {
            allClients = data; // Armazena todos os clientes
            renderClients(data); // Renderiza os clientes na tabela
        })
        .catch(error => console.error('Erro ao carregar clientes:', error));
}

// Função para renderizar clientes na tabela
function renderClients(clients) {
    const clientTableBody = document.querySelector('#clientTable tbody');
    clientTableBody.innerHTML = ''; // Limpa a tabela antes de carregar
    clients.forEach(client => {
        addClientToTable(client);
    });
}

// Função para adicionar cliente à tabela
function addClientToTable(client) {
    const clientTableBody = document.querySelector('#clientTable tbody');

    const row = document.createElement('tr');
    row.dataset.id = client.id; // Adiciona o ID do cliente à linha
    row.innerHTML = `
        <td>${client.nome}</td>
        <td>${client.nomePaciente}</td>
        <td>${client.email}</td>
        <td>${client.telefone}</td>
        <td>
            <button class="detail" onclick="openDetailModal(this)"><i class="fas fa-info-circle"></i> Detalhar</button>
            <button class="edit" onclick="openEditModal(this)"><i class="fas fa-edit"></i> Editar</button>
            <button class="remove" onclick="openDeleteModal(this)"><i class="fas fa-trash"></i> Remover</button>
        </td>
    `;

    clientTableBody.appendChild(row);
}

// Função para buscar clientes
function searchClients(query) {
    const filteredClients = allClients.filter(client => {
        return (
            client.nome.toLowerCase().includes(query.toLowerCase()) ||
            client.nomePaciente.toLowerCase().includes(query.toLowerCase()) ||
            client.email.toLowerCase().includes(query.toLowerCase()) ||
            client.telefone.toLowerCase().includes(query.toLowerCase())
        );
    });
    renderClients(filteredClients); // Renderiza os clientes filtrados
}

// Evento de busca ao digitar no campo de busca
document.getElementById('searchInput').addEventListener('input', function () {
    const query = this.value.trim();
    searchClients(query);
});

// Evento de busca ao clicar no botão de busca
document.getElementById('searchButton').addEventListener('click', function () {
    const query = document.getElementById('searchInput').value.trim();
    searchClients(query);
});

// Enviar dados do formulário para o backend
document.getElementById('clientForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const patientName = document.getElementById('patientName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const observations = document.getElementById('observations').value;

    if (name && patientName && email && phone) {
        fetch('http://localhost:3000/cadastrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                nome: name, 
                nomePaciente: patientName, 
                email, 
                telefone: phone, 
                observacoes: observations 
            }),
        })
            .then(response => response.json())
            .then(data => {
                allClients.push(data); // Adiciona o novo cliente à lista de clientes
                addClientToTable(data); // Adiciona o novo cliente à tabela
                document.getElementById('clientForm').reset();
            })
            .catch(error => console.error('Erro ao cadastrar cliente:', error));
    } else {
        alert('Por favor, preencha todos os campos.');
    }
});

// Função para abrir o modal de detalhes
function openDetailModal(button) {
    currentClientId = button.closest('tr').dataset.id;
    const row = button.closest('tr');

    document.getElementById('detailName').textContent = row.cells[0].textContent;
    document.getElementById('detailPatientName').textContent = row.cells[1].textContent;
    document.getElementById('detailEmail').textContent = row.cells[2].textContent;
    document.getElementById('detailPhone').textContent = row.cells[3].textContent;

    // Busca as observações do cliente no servidor
    fetch(`http://localhost:3000/clientes/${currentClientId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('detailObservations').textContent = data.observacoes || 'Nenhuma observação.';
        })
        .catch(error => console.error('Erro ao buscar observações:', error));

    document.getElementById('detailModal').style.display = 'flex';
}

// Função para abrir o modal de edição
function openEditModal(button) {
    currentClientId = button.closest('tr').dataset.id;
    const row = button.closest('tr');

    document.getElementById('editName').value = row.cells[0].textContent;
    document.getElementById('editPatientName').value = row.cells[1].textContent;
    document.getElementById('editEmail').value = row.cells[2].textContent;
    document.getElementById('editPhone').value = row.cells[3].textContent;

    // Busca as observações do cliente no servidor
    fetch(`http://localhost:3000/clientes/${currentClientId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('editObservations').value = data.observacoes || '';
        })
        .catch(error => console.error('Erro ao buscar observações:', error));

    document.getElementById('editModal').style.display = 'flex';
}

// Enviar dados editados para o backend
document.getElementById('editForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('editName').value;
    const patientName = document.getElementById('editPatientName').value;
    const email = document.getElementById('editEmail').value;
    const phone = document.getElementById('editPhone').value;
    const observations = document.getElementById('editObservations').value;

    fetch(`http://localhost:3000/editar/${currentClientId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            nome: name, 
            nomePaciente: patientName, 
            email, 
            telefone: phone, 
            observacoes: observations 
        }),
    })
        .then(response => response.json())
        .then(data => {
            const row = document.querySelector(`tr[data-id="${currentClientId}"]`);
            row.cells[0].textContent = data.nome;
            row.cells[1].textContent = data.nomePaciente;
            row.cells[2].textContent = data.email;
            row.cells[3].textContent = data.telefone;
            closeModal('editModal');
        })
        .catch(error => console.error('Erro ao editar cliente:', error));
});

// Função para abrir o modal de confirmação de remoção
function openDeleteModal(button) {
    currentClientId = button.closest('tr').dataset.id;
    document.getElementById('deleteModal').style.display = 'flex';
}

// Função para remover cliente
document.getElementById('confirmDelete').addEventListener('click', function () {
    fetch(`http://localhost:3000/remover/${currentClientId}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            document.querySelector(`tr[data-id="${currentClientId}"]`).remove();
            closeModal('deleteModal');
        })
        .catch(error => console.error('Erro ao remover cliente:', error));
});

// Fechar o modal de remoção ao clicar em "Cancelar"
document.getElementById('cancelDelete').addEventListener('click', function () {
    closeModal('deleteModal');
});

// Função para fechar o modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Fechar modais ao clicar no botão de fechar (×)
document.querySelectorAll('.close').forEach(button => {
    button.addEventListener('click', function () {
        closeModal(button.closest('.modal').id);
    });
});

// Carregar clientes ao iniciar a página
loadClients();