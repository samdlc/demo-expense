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
    updateTransactionHistory();
    refreshLabelsTotal();

});


function addTransaction (e) {
    e.preventDefault();
    const { type, selection, amount, description } = transaction;

    console.log(type, selection, amount, description);

     if (type === '' || selection === '' || amount === 0 || description === '') {
        console.log('All fields are required');
        return;
    }

    if (currentBalance === 0 && amount > 0 && type === 'expense') {
        console.log('Not enough funds');
        return;
    }

    if ((currentBalance - amount < 0) && type === 'expense') {
        console.log('Not enough funds');
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

    // Hide the modal   
    myModal.hide();

    updateTransactionHistory();
    refreshLabelsTotal();
};

function setValues(e) {
   
    transaction[e.target.id]= e.target.id === 'amount' ? parseInt(e.target.value) : e.target.value;
    console.log(transaction);
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
        console.log('income');
        incomeDiv.hidden = false;
        expenseDiv.hidden = true;
    } else {
        console.log('expense');
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

        console.log(selection);


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
    });

}

function deleteTransaction(id) {
    console.log(id);
    //remove from the listgroup and from the local storage
    expenses = expenses.filter(expense => expense.id !== id);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    updateTransactionHistory();
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
