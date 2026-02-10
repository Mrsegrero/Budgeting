import { loadData, saveData } from './storage.js';
import { calculateBudget } from './budget.js';
import { updateUI } from './ui.js';
import { getTodayKey } from './utils.js';

let state = loadData();

const refresh = () => {
    const budget = calculateBudget(state);
    updateUI(state, budget);
    saveData(state);
};

const openModal = (type) => {
    const modal = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    title.textContent = type === 'Target' ? 'Set Target Days' : `Add ${type}`;
    modal.classList.remove('hidden');
    modal.dataset.type = type;
};

// --- DATA MANAGEMENT (IMPORT/EXPORT) ---

document.getElementById('btn-export').onclick = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-wallet-export-${getTodayKey()}.json`;
    a.click();
};

document.getElementById('btn-import-trigger').onclick = () => {
    document.getElementById('import-file').click();
};

document.getElementById('import-file').onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedState = JSON.parse(event.target.result);
            if (importedState.balance !== undefined && Array.isArray(importedState.history)) {
                state = importedState;
                refresh();
                alert("Data imported successfully!");
            }
        } catch (err) {
            alert("Invalid JSON file.");
        }
    };
    reader.readAsText(file);
};

// --- CORE APP LOGIC ---

document.getElementById('modal-confirm').onclick = () => {
    const amount = parseFloat(document.getElementById('modal-amount').value);
    const note = document.getElementById('modal-note').value;
    const type = document.getElementById('modal-overlay').dataset.type;

    if (!amount || amount <= 0) return;

    if (type === 'Target') {
        state.targetDays = amount;
        /** * AUDIT FIX #2: Only reset start date if it doesn't exist 
         * or if explicitly requested (we could add a 'Hard Reset' later)
         */
        if (!state.targetStartDate) {
            state.targetStartDate = new Date().toISOString();
        }
    } else {
        const tx = {
            id: Date.now(),
            type,
            amount,
            note,
            timestamp: new Date().toISOString(),
            dateKey: getTodayKey()
        };
        state.history.push(tx);
        state.balance += (type === 'Income' ? amount : -amount);
    }

    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('modal-amount').value = '';
    document.getElementById('modal-note').value = '';
    refresh();
};

document.getElementById('btn-income').onclick = () => openModal('Income');
document.getElementById('btn-expense').onclick = () => openModal('Expense');
document.getElementById('btn-target').onclick = () => openModal('Target');
document.getElementById('modal-cancel').onclick = () => document.getElementById('modal-overlay').classList.add('hidden');

refresh();
                      
