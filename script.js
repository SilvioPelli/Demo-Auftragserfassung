// DOM-Elemente auswählen
const neuerKundeInput = document.getElementById('neuerKunde'); // Eingabefeld für neuen Kundenname
const kundeHinzufuegenBtn = document.getElementById('kundeHinzufuegen'); // Button zum Kunden hinzufügen
const kundenliste = document.getElementById('kunden'); // UL-Liste, in der Kunden angezeigt werden
const kundensuchfeld = document.getElementById('kundensuche'); // Inputfeld für die Kundensuche
const kundenauswahl = document.getElementById('kunde'); // Dropdown zu Auswahl eines Kunden im Auftrag
const auftragsliste = document.getElementById('auftraege'); // UL-Liste der gespeicherten Aufträge
const form = document.getElementById('auftragForm'); // Formular zu Auftragserstellung
const speichernBtn = form.querySelector('button[type="submit"]'); // Speichern-Button im Formular

let bearbeiteIndex = null; // Zum Merken, ob ein Auftrag bearbeitet wird (Index in Array)

// Daten beim Start laden
ladeKunden();
ladeAuftraege();

//Kunde hinzufügen
kundeHinzufuegenBtn.addEventListener('click', () => {
    const name = neuerKundeInput.value.trim().replace(/\s+/g, ' '); // Eingaben lesen und Leerzeichen entfernen
    if (!name) return;                        // Falls leer, abbrechen

    let kunden = JSON.parse(localStorage.getItem('kunden') || '[]'); // Kunden aus Speicher lesen
    if (kunden.includes(name)) {             // Prüfen ob Kunde schon existiert
        alert('Kunde existiert bereits!');
        return;
    }

    kunden.push(name);                       // Neuen Kunden hinzufügen
    localStorage.setItem('kunden', JSON.stringify(kunden)); // Speicher aktualisieren
    neuerKundeInput.value = '';              // Eingabefeld leeren
    ladeKunden();                           // Kundenliste neu laden
});

// Kundenliste + Select-Menü aktualisieren 
function ladeKunden() {
    const kunden = JSON.parse(localStorage.getItem('kunden') || '[]');

    kundenliste.innerHTML = '';
    kundenauswahl.innerHTML = '<option value="">Bitte wählen</option>';

    kunden.forEach(kunde => {
        const li = document.createElement('li');
        li.textContent = kunde;

        // Kunde bearbeiten
        const bearbeitenBtn = document.createElement('button');
        bearbeitenBtn.textContent = 'Bearbeiten';
        bearbeitenBtn.style.marginLeft = '0.5rem';
        bearbeitenBtn.addEventListener('click', () => {
            const neuerName = prompt(`Neuen Namen für ${kunde} eingeben:`, kunde);
            if(!neuerName || neuerName.trim() === '' || neuerName === kunde) return;

            const kunden = JSON.parse(localStorage.getItem('kunden') || '[]');

            if (kunden.includes(neuerName)) {
                alert('Ein Kunde mit diesem Name existiert bereits!');
                return;
            }

            // Kundenliste aktualisieren
            const neueKundenliste = kunden.map(k => k === kunde ? neuerName : k);
            localStorage.setItem('kunden', JSON.stringify(neueKundenliste));

            // Aufträge aktualisieren
            const auftraege = JSON.parse(localStorage.getItem('auftraege') || '[]');
            auftraege.forEach(a => {
                if (a.kunde === kunde) a.kunde = neuerName;
            });
            localStorage.setItem('auftraege', JSON.stringify(auftraege));

            ladeKunden();
            ladeAuftraege();
        });


        // Kunde löschen
        const loeschenBtn = document.createElement('button');
        loeschenBtn.textContent = 'Löschen';
        loeschenBtn.style.marginLeft = '0.5rem';
        loeschenBtn.addEventListener('click', () => {
            const auftraege = JSON.parse(localStorage.getItem('auftraege') || '[]');
            if (auftraege.some(e => e.kunde === kunde)) {
                alert(`Kunde "${kunde}" hat noch Aufträge und kann nicht gelöscht werden!`);
                return;
            }
            const neueListe = kunden.filter(k => k !== kunde);
            localStorage.setItem('kunden', JSON.stringify(neueListe));
            ladeKunden();
        });
        li.appendChild(bearbeitenBtn);
        li.appendChild(loeschenBtn);
        kundenliste.appendChild(li);

        //Kunde in Dropdown (Select) einfügen
        const option = document.createElement('option');
        option.value = kunde;
        option.textContent = kunde;
        kundenauswahl.appendChild(option);
    });
}

// Live-Suche für Kundenliste
kundensuchfeld.addEventListener('input', () => {
    const filter = kundensuchfeld.value.toLowerCase();
    Array.from(kundenliste.children).forEach(li => {
        const name = li.textContent.toLowerCase();
        li.style.display = name.includes(filter) ? 'list-item' : 'none';
    });
});

// Aufträge anzeigen
function ladeAuftraege() {
    const daten = JSON.parse(localStorage.getItem('auftraege') || '[]');
    auftragsliste.innerHTML = '';

    daten.forEach((eintrag, index) => {
        const li = document.createElement('li');
        li.textContent = `${eintrag.kunde} - ${eintrag.produkt} (${eintrag.menge})${eintrag.kommentar ? ' - ' + eintrag.kommentar : ''}`;


        // Löschen
        const loeschenBtn = document.createElement('button');
        loeschenBtn.textContent = 'Löschen';
        loeschenBtn.style.marginLeft = '1rem';
        loeschenBtn.addEventListener('click', () => {
            daten.splice(index, 1);
            localStorage.setItem('auftraege', JSON.stringify(daten));
            ladeAuftraege();
        });

        // Bearbeiten
        const bearbeitenBtn = document.createElement('button');
        bearbeitenBtn.textContent = 'Bearbeiten';
        bearbeitenBtn.style.marginLeft = '0.5rem';
        bearbeitenBtn.addEventListener('click', () => {
            document.getElementById('kunde').value = eintrag.kunde;
            document.getElementById('produkt').value = eintrag.produkt;
            document.getElementById('menge').value = eintrag.menge;
            document.getElementById('kommentar').value = eintrag.kommentar || '';

            bearbeiteIndex = daten.findIndex(d => 
                d.kunde === eintrag.kunde && 
                d.produkt === eintrag.produkt &&
                d.menge === eintrag.menge &&
                d.kommentar === eintrag.kommentar

            );

            speichernBtn.textContent = 'Änderung Speichern';
        });

        li.appendChild(loeschenBtn);
        li.appendChild(bearbeitenBtn);
        auftragsliste.appendChild(li);
    });
}

// Auftrag speichern oder ändern
form.addEventListener('submit', function(e) {
    e.preventDefault();

    const eintrag = {
        kunde: document.getElementById('kunde').value,
        produkt: document.getElementById('produkt').value,
        menge: document.getElementById('menge').value,
        kommentar: document.getElementById('kommentar').value
    };

    const daten = JSON.parse(localStorage.getItem('auftraege') || '[]');

    if (bearbeiteIndex !== null) {
        daten[bearbeiteIndex] = eintrag;
        bearbeiteIndex = null;
        speichernBtn.textContent = 'Auftrag speichern';
    } else {
        daten.push(eintrag);
    }

    localStorage.setItem('auftraege', JSON.stringify(daten));
    form.reset();
    ladeAuftraege();
});