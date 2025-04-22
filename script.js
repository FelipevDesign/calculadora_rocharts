// Variáveis globais
let chart = null;
let savedCalculations = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar eventos
    initializeEvents();
    
    // Inicializar gráfico
    initializeChart();
    
    // Carregar cálculos salvos do localStorage
    loadSavedCalculationsFromStorage();
    
    // Configurar tooltips
    setupTooltips();
});

// Inicializar todos os eventos
function initializeEvents() {
    // Eventos para adicionar itens dinâmicos
    document.getElementById('add-gemstone').addEventListener('click', function() {
        addDynamicItem('gemstones-container', 'gemstone-item');
    });
    
    document.getElementById('add-shell').addEventListener('click', function() {
        addDynamicItem('shells-container', 'shell-item');
    });
    
    document.getElementById('add-other-material').addEventListener('click', function() {
        addDynamicItem('other-materials-container', 'other-material-item');
    });
    
    // Eventos para remover itens dinâmicos
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-item') || e.target.parentElement.classList.contains('remove-item')) {
            const button = e.target.classList.contains('remove-item') ? e.target : e.target.parentElement;
            const item = button.closest('.dynamic-item');
            if (item && item.parentElement.children.length > 1) {
                item.remove();
                updateCalculations();
            }
        }
    });
    
    // Eventos para inputs que afetam cálculos
    const inputElements = document.querySelectorAll('input[type="number"], input[type="text"]');
    inputElements.forEach(input => {
        input.addEventListener('input', updateCalculations);
    });
    
    // Evento para arredondamento de preço
    document.getElementById('round-price').addEventListener('change', updateCalculations);
    
    // Eventos para botões de ação
    document.getElementById('save-calculation').addEventListener('click', saveCalculation);
    document.getElementById('load-calculation').addEventListener('click', showSavedCalculations);
    document.getElementById('export-pdf').addEventListener('click', exportToPDF);
    document.getElementById('reset-form').addEventListener('click', resetForm);
    document.getElementById('close-saved').addEventListener('click', hideSavedCalculations);
}

// Adicionar item dinâmico (pedras, conchas, outros materiais)
function addDynamicItem(containerId, itemClass) {
    const container = document.getElementById(containerId);
    const template = container.querySelector(`.${itemClass}`);
    const newItem = template.cloneNode(true);
    
    // Limpar valores dos inputs
    const inputs = newItem.querySelectorAll('input');
    inputs.forEach(input => {
        if (input.type === 'number' && input.classList.contains('quantity')) {
            input.value = 1;
        } else {
            input.value = '';
        }
    });
    
    container.appendChild(newItem);
    
    // Adicionar evento de input para os novos campos
    const newInputs = newItem.querySelectorAll('input');
    newInputs.forEach(input => {
        input.addEventListener('input', updateCalculations);
    });
}

// Inicializar gráfico de composição do preço
function initializeChart() {
    const ctx = document.getElementById('price-chart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Materiais', 'Mão de Obra', 'Despesas Indiretas', 'Impostos e Taxas', 'Lucro', 'Valor Artístico'],
            datasets: [{
                data: [0, 0, 0, 0, 0, 0],
                backgroundColor: [
                    '#3498db', // Azul
                    '#2ecc71', // Verde
                    '#f39c12', // Laranja
                    '#e74c3c', // Vermelho
                    '#9b59b6', // Roxo
                    '#b87333'  // Cobre
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: R$ ${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Atualizar todos os cálculos
function updateCalculations() {
    // 1. Calcular custo de materiais
    calculateMaterialsCost();
    
    // 2. Calcular custo de mão de obra
    calculateLaborCost();
    
    // 3. Calcular despesas indiretas
    calculateIndirectExpenses();
    
    // 4. Calcular impostos e taxas
    calculateTaxes();
    
    // 5. Calcular margem de lucro
    calculateProfit();
    
    // 6. Calcular ajuste por valor artístico
    calculateArtisticValue();
    
    // 7. Calcular preço final
    calculateFinalPrice();
    
    // 8. Atualizar gráfico
    updateChart();
}

// Calcular custo total de materiais
function calculateMaterialsCost() {
    // Cobre
    const copperWeight = parseFloat(document.getElementById('copper-weight').value) || 0;
    const copperPrice = parseFloat(document.getElementById('copper-price').value) || 0;
    const copperCost = copperWeight * copperPrice;
    document.getElementById('copper-total-cost').textContent = formatCurrency(copperCost);
    
    // Pedras semi-preciosas
    const gemstoneItems = document.querySelectorAll('.gemstone-item');
    let gemstonesCost = 0;
    
    gemstoneItems.forEach(item => {
        const quantity = parseFloat(item.querySelector('.gemstone-quantity').value) || 0;
        const price = parseFloat(item.querySelector('.gemstone-price').value) || 0;
        gemstonesCost += quantity * price;
    });
    
    document.getElementById('gemstones-total-cost').textContent = formatCurrency(gemstonesCost);
    
    // Conchas e fósseis
    const shellItems = document.querySelectorAll('.shell-item');
    let shellsCost = 0;
    
    shellItems.forEach(item => {
        const quantity = parseFloat(item.querySelector('.shell-quantity').value) || 0;
        const price = parseFloat(item.querySelector('.shell-price').value) || 0;
        shellsCost += quantity * price;
    });
    
    document.getElementById('shells-total-cost').textContent = formatCurrency(shellsCost);
    
    // Outros materiais
    const otherMaterialItems = document.querySelectorAll('.other-material-item');
    let otherMaterialsCost = 0;
    
    otherMaterialItems.forEach(item => {
        const quantity = parseFloat(item.querySelector('.other-material-quantity').value) || 0;
        const price = parseFloat(item.querySelector('.other-material-price').value) || 0;
        otherMaterialsCost += quantity * price;
    });
    
    document.getElementById('other-materials-total-cost').textContent = formatCurrency(otherMaterialsCost);
    
    // Custo total de materiais
    const totalMaterialsCost = copperCost + gemstonesCost + shellsCost + otherMaterialsCost;
    document.getElementById('materials-total-cost').textContent = formatCurrency(totalMaterialsCost);
    
    // Atualizar resumo
    document.getElementById('summary-materials').textContent = formatCurrency(totalMaterialsCost);
    
    return totalMaterialsCost;
}

// Calcular custo de mão de obra
function calculateLaborCost() {
    const hourlyRate = parseFloat(document.getElementById('hourly-rate').value) || 0;
    const workHours = parseFloat(document.getElementById('work-hours').value) || 0;
    const laborCost = hourlyRate * workHours;
    
    document.getElementById('labor-cost').textContent = formatCurrency(laborCost);
    document.getElementById('summary-labor').textContent = formatCurrency(laborCost);
    
    return laborCost;
}

// Calcular despesas indiretas
function calculateIndirectExpenses() {
    // Despesas fixas mensais
    const rent = parseFloat(document.getElementById('rent').value) || 0;
    const electricity = parseFloat(document.getElementById('electricity').value) || 0;
    const water = parseFloat(document.getElementById('water').value) || 0;
    const internet = parseFloat(document.getElementById('internet').value) || 0;
    const otherExpenses = parseFloat(document.getElementById('other-expenses').value) || 0;
    
    // Desgaste de equipamentos
    const equipmentValue = parseFloat(document.getElementById('equipment-value').value) || 0;
    const equipmentLifespan = parseFloat(document.getElementById('equipment-lifespan').value) || 36; // Padrão: 36 meses
    const equipmentDepreciation = equipmentValue / equipmentLifespan;
    
    // Total de despesas mensais
    const monthlyExpenses = rent + electricity + water + internet + otherExpenses + equipmentDepreciation;
    document.getElementById('monthly-expenses').textContent = formatCurrency(monthlyExpenses);
    
    // Horas trabalhadas por mês
    const dailyHours = parseFloat(document.getElementById('daily-hours').value) || 8;
    const monthlyDays = parseFloat(document.getElementById('monthly-days').value) || 20;
    const monthlyHours = dailyHours * monthlyDays;
    document.getElementById('monthly-hours').textContent = `${monthlyHours} horas`;
    
    // Custo por hora de despesas indiretas
    const hourlyExpenses = monthlyHours > 0 ? monthlyExpenses / monthlyHours : 0;
    document.getElementById('hourly-expenses').textContent = formatCurrency(hourlyExpenses);
    
    // Despesas indiretas para esta peça
    const workHours = parseFloat(document.getElementById('work-hours').value) || 0;
    const pieceExpenses = hourlyExpenses * workHours;
    document.getElementById('piece-expenses').textContent = formatCurrency(pieceExpenses);
    document.getElementById('summary-expenses').textContent = formatCurrency(pieceExpenses);
    
    return pieceExpenses;
}

// Calcular impostos e taxas
function calculateTaxes() {
    // Obter subtotal (materiais + mão de obra + despesas indiretas)
    const materialsCost = calculateMaterialsCost();
    const laborCost = calculateLaborCost();
    const indirectExpenses = calculateIndirectExpenses();
    const subtotal = materialsCost + laborCost + indirectExpenses;
    
    // Calcular impostos e taxas
    const salesTaxPercentage = parseFloat(document.getElementById('sales-tax').value) || 0;
    const platformFeePercentage = parseFloat(document.getElementById('platform-fee').value) || 0;
    const paymentFeePercentage = parseFloat(document.getElementById('payment-fee').value) || 0;
    
    const totalTaxPercentage = salesTaxPercentage + platformFeePercentage + paymentFeePercentage;
    const taxesValue = (subtotal * totalTaxPercentage) / 100;
    
    document.getElementById('taxes-total').textContent = formatCurrency(taxesValue);
    document.getElementById('summary-taxes').textContent = formatCurrency(taxesValue);
    
    return taxesValue;
}

// Calcular margem de lucro
function calculateProfit() {
    // Obter subtotal (materiais + mão de obra + despesas indiretas + impostos)
    const materialsCost = calculateMaterialsCost();
    const laborCost = calculateLaborCost();
    const indirectExpenses = calculateIndirectExpenses();
    const taxesValue = calculateTaxes();
    const subtotal = materialsCost + laborCost + indirectExpenses + taxesValue;
    
    // Calcular lucro
    const profitPercentage = parseFloat(document.getElementById('profit-percentage').value) || 40;
    const profitValue = (subtotal * profitPercentage) / 100;
    
    document.getElementById('profit-value').textContent = formatCurrency(profitValue);
    document.getElementById('summary-profit').textContent = formatCurrency(profitValue);
    
    return profitValue;
}

// Calcular ajuste por valor artístico
function calculateArtisticValue() {
    // Obter subtotal (materiais + mão de obra + despesas indiretas + impostos + lucro)
    const materialsCost = calculateMaterialsCost();
    const laborCost = calculateLaborCost();
    const indirectExpenses = calculateIndirectExpenses();
    const taxesValue = calculateTaxes();
    const profitValue = calculateProfit();
    const subtotal = materialsCost + laborCost + indirectExpenses + taxesValue + profitValue;
    
    // Calcular ajuste artístico
    const artisticFactor = parseFloat(document.getElementById('artistic-factor').value) || 1;
    const artisticAdjustment = subtotal * (artisticFactor - 1);
    
    document.getElementById('artistic-adjustment').textContent = formatCurrency(artisticAdjustment);
    document.getElementById('summary-artistic').textContent = formatCurrency(artisticAdjustment);
    
    return artisticAdjustment;
}

// Calcular preço final
function calculateFinalPrice() {
    // Somar todos os componentes
    const materialsCost = calculateMaterialsCost();
    const laborCost = calculateLaborCost();
    const indirectExpenses = calculateIndirectExpenses();
    const taxesValue = calculateTaxes();
    const profitValue = calculateProfit();
    const artisticAdjustment = calculateArtisticValue();
    
    const totalCost = materialsCost + laborCost + indirectExpenses + taxesValue;
    const finalPrice = totalCost + profitValue + artisticAdjustment;
    
    document.getElementById('summary-cost').textContent = formatCurrency(totalCost);
    document.getElementById('final-price-value').textContent = formatCurrency(finalPrice);
    
    // Arredondar preço se necessário
    const roundOption = document.getElementById('round-price').value;
    let roundedPrice = finalPrice;
    
    if (roundOption !== 'none') {
        const multiple = parseFloat(roundOption);
        roundedPrice = Math.ceil(finalPrice / multiple) * multiple;
    }
    
    document.getElementById('rounded-price').textContent = formatCurrency(roundedPrice);
    
    return { finalPrice, roundedPrice };
}

// Atualizar gráfico com os valores calculados
function updateChart() {
    const materialsCost = calculateMaterialsCost();
    const laborCost = calculateLaborCost();
    const indirectExpenses = calculateIndirectExpenses();
    const taxesValue = calculateTaxes();
    const profitValue = calculateProfit();
    const artisticAdjustment = calculateArtisticValue();
    
    chart.data.datasets[0].data = [
        materialsCost,
        laborCost,
        indirectExpenses,
        taxesValue,
        profitValue,
        artisticAdjustment
    ];
    
    chart.update();
}

// Formatar valor como moeda (R$)
function formatCurrency(value) {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

// Salvar cálculo atual
function saveCalculation() {
    const pieceName = document.getElementById('piece-name').value || 'Peça sem nome';
    const pieceDescription = document.getElementById('piece-description').value || '';
    const { finalPrice, roundedPrice } = calculateFinalPrice();
    const date = new Date().toLocaleString('pt-BR');
    
    const calculation = {
        id: Date.now(),
        name: pieceName,
        description: pieceDescription,
        price: finalPrice,
        roundedPrice: roundedPrice,
        date: date,
        formData: getFormData()
    };
    
    savedCalculations.push(calculation);
    saveCalculationsToStorage();
    
    alert(`Cálculo "${pieceName}" salvo com sucesso!`);
}

// Obter todos os dados do formulário
function getFormData() {
    const formData = {};
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.id) {
            formData[input.id] = input.value;
        }
    });
    
    // Capturar itens dinâmicos
    formData.gemstones = getDynamicItemsData('.gemstone-item');
    formData.shells = getDynamicItemsData('.shell-item');
    formData.otherMaterials = getDynamicItemsData('.other-material-item');
    
    return formData;
}

// Obter dados de itens dinâmicos
function getDynamicItemsData(selector) {
    const items = document.querySelectorAll(selector);
    const itemsData = [];
    
    items.forEach(item => {
        const inputs = item.querySelectorAll('input');
        const itemData = {};
        
        inputs.forEach(input => {
            if (input.classList.contains('type')) {
                itemData.type = input.value;
            } else if (input.classList.contains('quantity')) {
                itemData.quantity = input.value;
            } else if (input.classList.contains('price')) {
                itemData.price = input.value;
            }
        });
        
        itemsData.push(itemData);
    });
    
    return itemsData;
}

// Mostrar cálculos salvos
function showSavedCalculations() {
    const savedList = document.getElementById('saved-list');
    savedList.innerHTML = '';
    
    if (savedCalculations.length === 0) {
        savedList.innerHTML = '<p>Nenhum cálculo salvo.</p>';
    } else {
        savedCalculations.forEach(calc => {
            const item = document.createElement('div');
            item.className = 'saved-item';
            item.dataset.id = calc.id;
            item.innerHTML = `
                <strong>${calc.name}</strong> - ${formatCurrency(calc.roundedPrice)}<br>
                <small>${calc.date}</small>
            `;
            item.addEventListener('click', () => loadCalculation(calc.id));
            savedList.appendChild(item);
        });
    }
    
    document.getElementById('saved-calculations').classList.remove('hidden');
}

// Esconder cálculos salvos
function hideSavedCalculations() {
    document.getElementById('saved-calculations').classList.add('hidden');
}

// Carregar cálculo salvo
function loadCalculation(id) {
    const calculation = savedCalculations.find(calc => calc.id === id);
    
    if (calculation) {
        resetForm();
        const formData = calculation.formData;
        
        // Preencher campos simples
        for (const key in formData) {
            const element = document.getElementById(key);
            if (element && !Array.isArray(formData[key])) {
                element.value = formData[key];
            }
        }
        
        // Preencher itens dinâmicos
        loadDynamicItems('gemstones-container', 'gemstone-item', formData.gemstones);
        loadDynamicItems('shells-container', 'shell-item', formData.shells);
        loadDynamicItems('other-materials-container', 'other-material-item', formData.otherMaterials);
        
        // Atualizar cálculos
        updateCalculations();
        
        // Fechar modal
        hideSavedCalculations();
        
        alert(`Cálculo "${calculation.name}" carregado com sucesso!`);
    }
}

// Carregar itens dinâmicos
function loadDynamicItems(containerId, itemClass, itemsData) {
    if (!itemsData || !Array.isArray(itemsData)) return;
    
    const container = document.getElementById(containerId);
    
    // Limpar container mantendo apenas o primeiro item
    while (container.children.length > 1) {
        container.removeChild(container.lastChild);
    }
    
    // Preencher o primeiro item
    if (itemsData.length > 0) {
        const firstItem = container.querySelector(`.${itemClass}`);
        fillDynamicItem(firstItem, itemsData[0]);
    }
    
    // Adicionar itens adicionais
    for (let i = 1; i < itemsData.length; i++) {
        const template = container.querySelector(`.${itemClass}`);
        const newItem = template.cloneNode(true);
        fillDynamicItem(newItem, itemsData[i]);
        container.appendChild(newItem);
        
        // Adicionar evento de input para os novos campos
        const newInputs = newItem.querySelectorAll('input');
        newInputs.forEach(input => {
            input.addEventListener('input', updateCalculations);
        });
    }
}

// Preencher item dinâmico com dados
function fillDynamicItem(item, data) {
    if (!item || !data) return;
    
    const typeInput = item.querySelector('.type');
    const quantityInput = item.querySelector('.quantity');
    const priceInput = item.querySelector('.price');
    
    if (typeInput) typeInput.value = data.type || '';
    if (quantityInput) quantityInput.value = data.quantity || 1;
    if (priceInput) priceInput.value = data.price || 0;
}

// Exportar para PDF
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const pieceName = document.getElementById('piece-name').value || 'Peça sem nome';
    const pieceDescription = document.getElementById('piece-description').value || 'Sem descrição';
    const { finalPrice, roundedPrice } = calculateFinalPrice();
    const date = new Date().toLocaleString('pt-BR');
    
    // Título
    doc.setFontSize(20);
    doc.text('Cálculo de Preço - Joia Artesanal', 105, 20, { align: 'center' });
    
    // Informações da peça
    doc.setFontSize(14);
    doc.text('Informações da Peça', 20, 40);
    doc.setFontSize(12);
    doc.text(`Nome: ${pieceName}`, 20, 50);
    doc.text(`Descrição: ${pieceDescription}`, 20, 60);
    doc.text(`Data do cálculo: ${date}`, 20, 70);
    
    // Resumo de custos
    doc.setFontSize(14);
    doc.text('Resumo de Custos', 20, 90);
    doc.setFontSize(12);
    doc.text(`Materiais: ${document.getElementById('summary-materials').textContent}`, 20, 100);
    doc.text(`Mão de Obra: ${document.getElementById('summary-labor').textContent}`, 20, 110);
    doc.text(`Despesas Indiretas: ${document.getElementById('summary-expenses').textContent}`, 20, 120);
    doc.text(`Impostos e Taxas: ${document.getElementById('summary-taxes').textContent}`, 20, 130);
    doc.text(`Lucro: ${document.getElementById('summary-profit').textContent}`, 20, 140);
    doc.text(`Ajuste Artístico: ${document.getElementById('summary-artistic').textContent}`, 20, 150);
    
    // Preço final
    doc.setFontSize(16);
    doc.text('Preço Final', 20, 170);
    doc.setFontSize(14);
    doc.text(`Custo Total: ${document.getElementById('summary-cost').textContent}`, 20, 180);
    doc.text(`Preço Sugerido: ${document.getElementById('final-price-value').textContent}`, 20, 190);
    doc.text(`Preço Arredondado: ${document.getElementById('rounded-price').textContent}`, 20, 200);
    
    // Salvar PDF
    doc.save(`calculo_preco_${pieceName.replace(/\s+/g, '_')}.pdf`);
}

// Resetar formulário
function resetForm() {
    document.getElementById('price-calculator').reset();
    
    // Limpar itens dinâmicos extras
    resetDynamicItems('gemstones-container', 'gemstone-item');
    resetDynamicItems('shells-container', 'shell-item');
    resetDynamicItems('other-materials-container', 'other-material-item');
    
    // Atualizar cálculos
    updateCalculations();
}

// Resetar itens dinâmicos
function resetDynamicItems(containerId, itemClass) {
    const container = document.getElementById(containerId);
    
    // Manter apenas o primeiro item
    while (container.children.length > 1) {
        container.removeChild(container.lastChild);
    }
    
    // Resetar o primeiro item
    const firstItem = container.querySelector(`.${itemClass}`);
    const inputs = firstItem.querySelectorAll('input');
    inputs.forEach(input => {
        if (input.type === 'number' && input.classList.contains('quantity')) {
            input.value = 1;
        } else {
            input.value = '';
        }
    });
}

// Salvar cálculos no localStorage
function saveCalculationsToStorage() {
    localStorage.setItem('savedCalculations', JSON.stringify(savedCalculations));
}

// Carregar cálculos do localStorage
function loadSavedCalculationsFromStorage() {
    const saved = localStorage.getItem('savedCalculations');
    if (saved) {
        savedCalculations = JSON.parse(saved);
    }
}

// Configurar tooltips
function setupTooltips() {
    const tooltips = document.querySelectorAll('.tooltip');
    tooltips.forEach(tooltip => {
        const icon = tooltip.querySelector('i');
        const text = tooltip.querySelector('.tooltiptext');
        
        // Mostrar tooltip ao passar o mouse
        icon.addEventListener('mouseenter', () => {
            text.style.visibility = 'visible';
            text.style.opacity = '1';
        });
        
        // Esconder tooltip ao remover o mouse
        icon.addEventListener('mouseleave', () => {
            text.style.visibility = 'hidden';
            text.style.opacity = '0';
        });
    });
}
