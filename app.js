// Get information from the form and create a new list item and add it to the list and save it to the local storage
// 1. Select the form formExpenseModal
// 2. Add an event listener for the submit event
// 3. Create a new list item element
// 4. Add the user input to the list item element
// 5. Append the list item element to the list
// 6. Save the list item to the local storage
// 7. Clear the input field

const form = document.querySelector('#formExpenseModal');
const listGroup = document.querySelector('#listGroup');
const typeTransaction = document.querySelector('#typeRadio');
const incomeSelection = document.querySelector('#incomeSelector');
const expenseSelection = document.querySelector('#expenseSelector');
const incomeRadio = document.querySelector('#incomeRadio');
const expenseRadio = document.querySelector('#expenseRadio');
const incomeDiv = document.querySelector('#incomeDiv');
const expenseDiv = document.querySelector('#expenseDiv');
const amount = document.querySelector('#amount');
const description = document.querySelector('#description');
const btnSave = document.querySelector('#btnSave');

let expenses;
let currentBalance = 0;

let currentPage = 1;
const itemsPerPage = 5; // Adjust based on your preference
let totalPages = 0;

const transaction = {
    id: 0,
    type: '',
    selection: '',
    amount: 0.0,
    description: ''
};

const typesIncomes = [
    { value: '', name: 'Select Type Income' },
    { value: 'salary', name: 'Salary' },
    { value: 'investment', name: 'Investments' },
    { value: 'business', name: 'Business' }
]

const typesExpenses = [
    { value: '', name: 'Select Type Expense' },
    { value: 'rent', name: 'Rent' },
    { value: 'creditcard', name: 'Credit Card' },
    { value: 'food', name: 'Food' },
    { value: 'transport', name: 'Transport' },
    { value: 'laundry', name: 'Laundry' },
    { value: 'phone', name: 'Cell Phone' }
]

document.addEventListener('DOMContentLoaded', () => {
    expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    incomeSelection.addEventListener('change', incomeSelectionChecked);
    expenseSelection.addEventListener('change', expenseSelectionChecked);
    incomeRadio.addEventListener('change', typeRadioChecked);
    expenseRadio.addEventListener('change', typeRadioChecked);
    amount.addEventListener('change', setValues);
    description.addEventListener('change', setValues);

    btnSave.addEventListener('click', addTransaction);

    fillSelects();
    //updateTransactionHistory();
    refreshLabelsTotal();
    initializePagination();

});

function initializePagination() {
    currentPage = 1; // Reset to first page
    renderTransactionsForPage(currentPage);
}



document.querySelector('#prevPage').addEventListener('click', (e) => {
    e.preventDefault();
    if (currentPage > 1) {
        currentPage--;
        renderTransactionsForPage(currentPage);
    }
});

document.querySelector('#nextPage').addEventListener('click', (e) => {
    e.preventDefault();
    if (currentPage < totalPages) {
        currentPage++;
        renderTransactionsForPage(currentPage);
    }
});


function addTransaction (e) {
    e.preventDefault();
    const { type, selection, amount, description } = transaction;
    const errorMessageDiv = document.getElementById('error-message');

     if (type === '' || selection === '' || amount === 0 || description === '') {
       // Display error message
        errorMessageDiv.textContent = 'All fields are required';
        errorMessageDiv.hidden = false;
        // Quitar después de 3 segundos
        setTimeout(() => {
            errorMessageDiv.hidden = true;
        }, 3000);
        return;
    }

    if (currentBalance === 0 && amount > 0 && type === 'expense') {
        
        // Display error message
        errorMessageDiv.textContent = 'Not enough funds';
        errorMessageDiv.hidden = false;
        // Quitar después de 3 segundos
        setTimeout(() => {
            errorMessageDiv.hidden = true;
        }, 3000);
        return;
    }

    if ((currentBalance - amount < 0) && type === 'expense') {
        // Display error message
        errorMessageDiv.textContent = 'Not enough funds';
        errorMessageDiv.hidden = false;
        // Quitar después de 3 segundos
        setTimeout(() => {
            errorMessageDiv.hidden = true;
        }, 3000);
        return;
    }

    const newTransaction = {
        id: Date.now(),
        type,
        selection,
        amount,
        description
    };

    expenses.push(newTransaction);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    
    
    const myModal = bootstrap.Modal.getInstance(document.querySelector('#expenseModal'));
    form.reset();
    // Hide the modal   
    myModal.hide();

    //updateTransactionHistory();
    initializePagination();
    refreshLabelsTotal();
};

function setValues(e) {
   
    transaction[e.target.id]= e.target.id === 'amount' ? parseInt(e.target.value) : e.target.value;
}

function fillSelects() {
    incomeSelection.innerHTML = '';
    typesIncomes.forEach(type => {
        incomeSelection.innerHTML += `<option value="${type.value}">${type.name}</option>`;
    });
    expenseSelection.innerHTML = '';
    typesExpenses.forEach(type => {
        expenseSelection.innerHTML += `<option value="${type.value}">${type.name}</option>`;
    });
}

function incomeSelectionChecked() {
    transaction.selection = incomeSelection.value;
}

function expenseSelectionChecked() {
    transaction.selection = expenseSelection.value;
}

function typeRadioChecked(e) {
    if (e.target.value === '') {
        incomeDiv.hidden = false;
        expenseDiv.hidden = true;
        transaction.type = '';
        return;
    }
    if (e.target.value === 'income') {
        incomeDiv.hidden = false;
        expenseDiv.hidden = true;
    } else {
        incomeDiv.hidden = true;
        expenseDiv.hidden = false;
    }
    incomeSelection.value = '';
    expenseSelection.value = '';
    transaction.type = e.target.value;
}

function updateTransactionHistory() {
    listGroup.innerHTML = '';

    if (expenses.length === 0) { return; }
    expenses.forEach(expense => {
        const listItem = document.createElement('li');
        listItem.dataset.id = expense.id;
        listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'hover-effect');
        const badge = expense.type === 'income' ? 'badge bg-success text-white' : 'badge bg-danger text-white';
        const type = expense.type === 'income' ? 'Income' : 'Expense';
        let selection;
        if (expense.type === 'income') { 
            const foundIncomeType = typesIncomes.find(incomeItem => incomeItem.value === expense.selection);
            selection = foundIncomeType.name;
        }else {
            const foundExpenseType  = typesExpenses.find(expenseItem => expenseItem.value === expense.selection);
            selection = foundExpenseType.name;
        }

        listItem.innerHTML = `
            <div class="flex-grow-1 d-flex flex-column bg-light p-3 border rounded-3 shadow-sm">
                <div class="d-flex justify-content-between align-items-center">
                    <span class="badge ${badge} fs-4 fs-sm-3 fs-md-4 fs-lg-1 my-4">${type}</span>
                    <span class="fs-4 fs-sm-3 fs-md-4 fs-lg-1 my-4 fw-bold ">$${expense.amount}</span>
                </div>
                <h6 class="mt-2 mb-1">${selection}</h6>
                <div class="d-flex justify-content-between align-items-center">
                    <p class="text-muted mb-0">${expense.description}</p>
                    <button type="button" class="btn btn-danger btn-lg" onclick="deleteTransaction(${expense.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-trash" viewBox="0 0 20 20">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        listGroup.appendChild(listItem);
    });

}

function deleteTransaction(id) {
    //remove from the listgroup and from the local storage
    expenses = expenses.filter(expense => expense.id !== id);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    //updateTransactionHistory();
    initializePagination();
    refreshLabelsTotal();
}


function refreshLabelsTotal() {

    if (expenses.length === 0) {
        document.querySelector('#currentBalance').textContent = '$0.00';
        document.querySelector('#totalIncome').textContent = '$0.00';
        document.querySelector('#totalExpense').textContent = '$0.00';
        currentBalance = 0;
        return;
    }

    const totalIncome = expenses.filter(expense => expense.type === 'income').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const totalExpense = expenses.filter(expense => expense.type === 'expense').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    currentBalance  = totalIncome - totalExpense;

    document.querySelector('#currentBalance').textContent = `$ ${totalIncome - totalExpense}.00`; 
    document.querySelector('#totalIncome').textContent = `$ ${totalIncome}.00`;
    document.querySelector('#totalExpense').textContent = `$ ${totalExpense}.00`;
}


function renderTransactionsForPage(page) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToShow = expenses.slice(startIndex, endIndex);

    // Clear current transactions
    // Assuming you have a function or a way to clear the displayed transactions
    clearTransactionsDisplay();

    // Add itemsToShow to the display
    // Assuming you have a function to add transactions to the display
    itemsToShow.forEach(addTransactionToDisplay);

    // Update pagination controls
    updatePaginationControls();
}

function updatePaginationControls() {
    totalPages = Math.ceil(expenses.length / itemsPerPage);

    const paginationUl = document.querySelector('.pagination');
    // Remove existing page numbers
    document.querySelectorAll('.pagination .page-number').forEach(node => node.remove());

    // Add page numbers
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = 'page-item page-number';
        const a = document.createElement('a');
        a.className = 'page-link';
        a.href = '#';
        a.innerText = i;
        a.addEventListener('click', () => {
            currentPage = i;
            renderTransactionsForPage(currentPage);
        });
        li.appendChild(a);

        paginationUl.querySelector('#nextPage').insertBefore(li, null);
        paginationUl.insertBefore(li, paginationUl.querySelector('#nextliPage'));
        
    }

    // Disable prev/next when applicable
    document.querySelector('#prevPage').parentElement.classList.toggle('disabled', currentPage === 1);
    document.querySelector('#nextPage').parentElement.classList.toggle('disabled', currentPage === totalPages);
}

function clearTransactionsDisplay(){
    listGroup.innerHTML = '';

}

function addTransactionToDisplay(expense) {

const listItem = document.createElement('li');
        listItem.dataset.id = expense.id;
        listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'hover-effect');
        const badge = expense.type === 'income' ? 'badge bg-success text-white' : 'badge bg-danger text-white';
        const type = expense.type === 'income' ? 'Income' : 'Expense';
        let selection;
        if (expense.type === 'income') { 
            const foundIncomeType = typesIncomes.find(incomeItem => incomeItem.value === expense.selection);
            selection = foundIncomeType.name;
        }else {
            const foundExpenseType  = typesExpenses.find(expenseItem => expenseItem.value === expense.selection);
            selection = foundExpenseType.name;
        }

        listItem.innerHTML = `
            <div class="flex-grow-1 d-flex flex-column bg-light p-3 border rounded-3 shadow-sm">
                <div class="d-flex justify-content-between align-items-center">
                    <span class="badge ${badge}">${type}</span>
                    <span class="fw-bold">$${expense.amount}</span>
                </div>
                <h6 class="mt-2 mb-1">${selection}</h6>
                <div class="d-flex justify-content-between align-items-center">
                    <p class="text-muted mb-0">${expense.description}</p>
                    <button type="button" class="btn btn-danger btn-sm" onclick="deleteTransaction(${expense.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        listGroup.appendChild(listItem);
}