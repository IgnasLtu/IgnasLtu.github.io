document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contactForm');
  if (!form) return; 

  const wrapper = form.closest('.contact-form') || form;
  const submitBtn = document.getElementById('submitBtn');
  const resultsBox = document.getElementById('formResults');

  const textFields = ['vardas', 'pavarde', 'email', 'telefonas', 'adresas'];
  const ratingFields = ['klausimas1', 'klausimas2', 'klausimas3'];
  const touched = new Set();

  const validators = {
    vardas: function (v) {
      return /^\p{L}[\p{L}\s'’-]+$/u.test(v) ? '' : 'Įveskite vardą (be skaičių).';
    },
    pavarde: function (v) {
      return /^\p{L}[\p{L}\s'’-]+$/u.test(v) ? '' : 'Įveskite pavardę (be skaičių).';
    },
    email: function (v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Įveskite teisingą el. pašto adresą.';
    },
    telefonas: function (v) {
      return /^\+?[0-9]{8,15}$/.test(v.replace(/\s+/g, '')) ? '' : 'Įveskite teisingą telefono numerį.';
    },
    adresas: function (v) {
      return v.length >= 3 ? '' : 'Įveskite adresą.';
    }
  };

  function getValue(name) {
    return form.elements[name].value.trim();
  }

  function validateField(name, show) {
    const message = validators[name](getValue(name));
    if (show) {
      const input = form.elements[name];
      const errorEl = document.getElementById('err-' + name);
      input.classList.toggle('is-invalid', message !== '');
      errorEl.textContent = message;
    }
    return message === '';
  }

  function ratingsChosen() {
    return ratingFields.every(function (name) {
      return form.elements[name].value !== '';
    });
  }

  function isFormValid() {
    const textsOk = textFields.every(function (name) {
      return validateField(name, false);
    });
    return textsOk && ratingsChosen();
  }

  function updateSubmitState() {
    submitBtn.disabled = !isFormValid();
  }

  textFields.forEach(function (name) {
    const input = form.elements[name];

    input.addEventListener('input', function () {
      touched.add(name);
      validateField(name, true);
      updateSubmitState();
    });

    input.addEventListener('blur', function () {
      touched.add(name);
      validateField(name, true);
      updateSubmitState();
    });
  });

  ratingFields.forEach(function (name) {
    const radios = form.querySelectorAll('input[name="' + name + '"]');
    radios.forEach(function (radio) {
      radio.addEventListener('change', updateSubmitState);
    });
  });

  wrapper.addEventListener('submit', function (event) {
    if (event.target !== form) return;

    event.preventDefault();  
    event.stopPropagation();  

    if (!isFormValid()) {
      textFields.forEach(function (name) { validateField(name, true); });
      return;
    }

    const formData = {
      vardas: getValue('vardas'),
      pavarde: getValue('pavarde'),
      email: getValue('email'),
      telefonas: getValue('telefonas'),
      adresas: getValue('adresas'),
      klausimas1: Number(form.elements['klausimas1'].value),
      klausimas2: Number(form.elements['klausimas2'].value),
      klausimas3: Number(form.elements['klausimas3'].value)
    };

    console.log('Formos duomenys:', formData);
    renderResults(formData);
  }, true);

  function addLine(parent, label, value) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = label + ': ';
    p.appendChild(strong);
    p.appendChild(document.createTextNode(value));
    parent.appendChild(p);
  }

  function calculateAverage(data) {
    return (data.klausimas1 + data.klausimas2 + data.klausimas3) / 3;
  }

  function renderResults(data) {
    resultsBox.innerHTML = '';

    const dataBlock = document.createElement('div');
    dataBlock.className = 'results-block';
    addLine(dataBlock, 'Vardas', data.vardas);
    addLine(dataBlock, 'Pavardė', data.pavarde);
    addLine(dataBlock, 'El. paštas', data.email);
    addLine(dataBlock, 'Tel. Numeris', data.telefonas);
    addLine(dataBlock, 'Adresas', data.adresas);
    addLine(dataBlock, '1 klausimas', data.klausimas1);
    addLine(dataBlock, '2 klausimas', data.klausimas2);
    addLine(dataBlock, '3 klausimas', data.klausimas3);

    const averageBlock = document.createElement('div');
    averageBlock.className = 'results-block results-average';
    addLine(averageBlock, data.vardas + ' ' + data.pavarde, calculateAverage(data).toFixed(2));

    resultsBox.appendChild(dataBlock);
    resultsBox.appendChild(averageBlock);
  }

  updateSubmitState(); 
});