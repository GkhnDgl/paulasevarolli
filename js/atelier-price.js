(() => {
  const priceTableBody = document.getElementById('priceTableBody');
  if (!priceTableBody) return;

  function renderPriceTable(translations) {
    const items = translations?.atelier?.priceItems;
    if (!items) return;

    priceTableBody.replaceChildren(...items.map(item => {
      const row = document.createElement('tr');
      const nameCell = document.createElement('td');
      const priceCell = document.createElement('td');
      nameCell.textContent = item.name || '';
      priceCell.textContent = item.price || '';
      row.append(nameCell, priceCell);
      return row;
    }));
  }

  document.addEventListener('i18n:loaded', event => {
    renderPriceTable(event.detail?.translations);
  });
})();
