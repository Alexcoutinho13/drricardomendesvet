document.addEventListener('DOMContentLoaded', () => {
    const clientForm = document.getElementById('clientForm');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const clientTable = document.getElementById('clientTable').getElementsByTagName('tbody')[0];
    const editModal = document.getElementById('editModal');
    const deleteModal = document.getElementById('deleteModal');
    const detailModal = document.getElementById('detailModal');
    const editForm = document.getElementById('editForm');
    const confirmDeleteButton = document.getElementById('confirmDelete');
    const cancelDeleteButton = document.getElementById('cancelDelete');
    let currentClientId = null;

    // Função para carregar pacientes na tabela
    async function loadClients(searchQuery = '') {
        const response = await fetch(`/api/clients?search=${searchQuery}`);
        const clients = await response.json();
        clientTable.innerHTML = ''; // Limpa a tabela antes de carregar os dados

        clients.forEach(client => {
            const row = clientTable.insertRow();
            row.innerHTML = `
                <td>${client.name}</td>
                <td>${client.patientName}</td>
                <td>${client.email}</td>
                <td>${client.phone}</td>
                <td class="actions">
                    <button class="edit" onclick="openEditModal(${client.id})"><i class="fas fa-edit"></i> Editar</button>
                    <button class="remove" onclick="openDeleteModal(${client.id})"><i class="fas fa-trash"></i> Remover</button>
                    <button class="detail" onclick="openDetailModal(${client.id})"><i class="fas fa-info-circle"></i> Detalhes</button>
                </td>
            `;
        });
    }

    // Adicionar paciente
    clientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(clientForm);
        const data = Object.fromEntries(formData.entries());

        await fetch('/api/clients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        clientForm.reset();
        loadClients();
    });

    // Buscar pacientes
    searchButton.addEventListener('click', () => {
        const searchQuery = searchInput.value;
        loadClients(searchQuery);
    });

    // Abrir modal de edição
    window.openEditModal = async (id) => {
        currentClientId = id;
        const response = await fetch(`/api/clients/${id}`);
        const client = await response.json();

        document.getElementById('editName').value = client.name;
        document.getElementById('editPatientName').value = client.patientName;
        document.getElementById('editEmail').value = client.email;
        document.getElementById('editPhone').value = client.phone;
        document.getElementById('editObservations').value = client.observations;

        editModal.style.display = 'flex';
    };

    // Salvar edição
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(editForm);
        const data = Object.fromEntries(formData.entries());

        await fetch(`/api/clients/${currentClientId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        editModal.style.display = 'none';
        loadClients();
    });

    // Abrir modal de remoção
    window.openDeleteModal = (id) => {
        currentClientId = id;
        deleteModal.style.display = 'flex';
    };

    // Confirmar remoção
    confirmDeleteButton.addEventListener('click', async () => {
        await fetch(`/api/clients/${currentClientId}`, { method: 'DELETE' });
        deleteModal.style.display = 'none';
        loadClients();
    });

    // Cancelar remoção
    cancelDeleteButton.addEventListener('click', () => {
        deleteModal.style.display = 'none';
    });

    // Abrir modal de detalhes
    window.openDetailModal = async (id) => {
        const response = await fetch(`/api/clients/${id}`);
        const client = await response.json();

        document.getElementById('detailName').textContent = client.name;
        document.getElementById('detailPatientName').textContent = client.patientName;
        document.getElementById('detailEmail').textContent = client.email;
        document.getElementById('detailPhone').textContent = client.phone;
        document.getElementById('detailObservations').textContent = client.observations;

        detailModal.style.display = 'flex';
    };

    // Fechar modais ao clicar no "X"
    document.querySelectorAll('.modal .close').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });

    // Carregar pacientes ao iniciar
    loadClients();
});