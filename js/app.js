'use strict';

const MS_PER_DAY = 1000 * 3600 * 24;

const currencyFormatter = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
});

const dateFormatter = new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
});

function toDateInputValue(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function parseDateInput(value) {
    if (!value) return null;
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/**
 * Same algorithm as the original Angular controller.
 * @param {Date} dataInizio
 * @param {Date} dataFine
 * @param {number} importo
 * @param {boolean} includiDataInizio
 */
function calcolaRisconti(dataInizio, dataFine, importo, includiDataInizio) {
    const result = {
        arrValori: [],
        importoTotCalcolato: 0,
        diffAnni: 0,
        diffGiorni: 0,
        importoDaSuddividere: 0
    };

    const importoNum = Number(importo) || 0;
    if (!dataInizio || !dataFine) return result;

    const annoInizio = dataInizio.getFullYear();
    const annoFine = dataFine.getFullYear();
    result.diffAnni = annoFine - annoInizio + 1;

    const timeDiff = dataFine.getTime() - dataInizio.getTime();
    result.diffGiorni = Math.ceil(timeDiff / MS_PER_DAY) + (includiDataInizio ? 1 : 0);

    if (result.diffGiorni <= 0) return result;

    for (let annoAttuale = annoInizio; annoAttuale <= annoFine; annoAttuale++) {
        let myDataInizio = new Date(annoAttuale, 0, 1, 0, 0, 0);
        if (annoAttuale === annoInizio) {
            myDataInizio = dataInizio;
        }

        let myDataFine = new Date(annoAttuale, 11, 31, 0, 0, 0);
        if (annoAttuale === annoFine) {
            myDataFine = dataFine;
        }

        const addGiornoCalc = (annoAttuale === annoInizio && !includiDataInizio) ? 0 : 1;
        const myGiorni = Math.ceil((myDataFine.getTime() - myDataInizio.getTime()) / MS_PER_DAY) + addGiornoCalc;
        const myImporto = (importoNum * myGiorni) / result.diffGiorni;
        result.importoTotCalcolato += myImporto;

        result.arrValori.push({
            anno: annoAttuale,
            dataInizio: myDataInizio,
            dataFine: myDataFine,
            giorni: myGiorni,
            importo: myImporto
        });
    }

    result.importoDaSuddividere = Math.abs(importoNum - result.importoTotCalcolato);
    return result;
}

function setDefaultDates() {
    const dataAttuale = new Date();
    const dataInizio = new Date(
        dataAttuale.getFullYear(),
        dataAttuale.getMonth(),
        dataAttuale.getDate()
    );
    const dataFine = new Date(
        dataAttuale.getFullYear() + 1,
        dataAttuale.getMonth(),
        dataAttuale.getDate()
    );
    dataFine.setDate(dataFine.getDate() - 1);

    document.getElementById('data-inizio').value = toDateInputValue(dataInizio);
    document.getElementById('data-fine').value = toDateInputValue(dataFine);
}

function renderResults(data) {
    const summaryEl = document.getElementById('summary');
    const summaryGiorni = document.getElementById('summary-giorni');
    const summaryTotale = document.getElementById('summary-totale');
    const summaryResiduo = document.getElementById('summary-residuo');
    const resultsEl = document.getElementById('results');
    const emptyState = document.getElementById('empty-state');

    resultsEl.innerHTML = '';

    if (!data.diffGiorni || data.diffGiorni <= 0) {
        summaryEl.hidden = true;
        emptyState.hidden = false;
        emptyState.querySelector('p').textContent =
            'Intervallo non valido: la data fine deve essere successiva alla data inizio.';
        return;
    }

    emptyState.hidden = true;
    summaryEl.hidden = false;

    summaryGiorni.innerHTML = `<strong>${data.diffGiorni}</strong> giorni totali`;

    if (data.diffAnni > 0 && data.importoTotCalcolato > 0) {
        summaryTotale.hidden = false;
        summaryTotale.innerHTML =
            `<strong>${currencyFormatter.format(data.importoTotCalcolato)}</strong> ` +
            `importo totale suddiviso sui <strong>${data.diffAnni}</strong> ann` +
            (data.diffAnni === 1 ? 'o' : 'i');
    } else {
        summaryTotale.hidden = true;
        summaryTotale.textContent = '';
    }

    if (data.importoDaSuddividere > 0.001) {
        summaryResiduo.hidden = false;
        summaryResiduo.innerHTML =
            `<strong>${currencyFormatter.format(data.importoDaSuddividere)}</strong> importo da suddividere manualmente.<br>` +
            `La differenza può essere dovuta ad arrotondamenti effettuati durante il calcolo degli importi annuali.`;
    } else {
        summaryResiduo.hidden = true;
        summaryResiduo.textContent = '';
    }

    const fragment = document.createDocumentFragment();

    data.arrValori.forEach((v) => {
        const article = document.createElement('article');
        article.className = 'year-card';

        const h2 = document.createElement('h2');
        h2.textContent = `Anno ${v.anno}`;

        const period = document.createElement('p');
        period.innerHTML =
            `<strong>${v.giorni}</strong> giorni calcolati dal ` +
            `<strong>${dateFormatter.format(v.dataInizio)}</strong> al ` +
            `<strong>${dateFormatter.format(v.dataFine)}</strong>`;

        const amount = document.createElement('p');
        amount.className = 'amount';
        amount.innerHTML =
            `<strong>${currencyFormatter.format(v.importo)}</strong> importo di competenza dell'anno`;

        article.append(h2, period, amount);
        fragment.appendChild(article);
    });

    resultsEl.appendChild(fragment);
}

function handleSubmit(event) {
    event.preventDefault();

    const dataInizio = parseDateInput(document.getElementById('data-inizio').value);
    const dataFine = parseDateInput(document.getElementById('data-fine').value);
    const importo = document.getElementById('importo').value;
    const includiDataInizio = document.getElementById('includi-data-inizio').checked;

    const data = calcolaRisconti(dataInizio, dataFine, importo, includiDataInizio);
    renderResults(data);
}

document.addEventListener('DOMContentLoaded', () => {
    setDefaultDates();
    document.getElementById('form-calcolo').addEventListener('submit', handleSubmit);
});
