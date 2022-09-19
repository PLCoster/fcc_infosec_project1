// Custom scripts for Sample Front End Form Submission
// Loaded by index.html

// Helper function to make any displayed results HTML-safe
function replaceUnsafeChars(input) {
  if (typeof input !== 'string') {
    return input;
  }

  const charReplacements = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return input
    .split('')
    .map((char) => {
      if (char in charReplacements) {
        return charReplacements[char];
      }
      return char;
    })
    .join('');
}

// Called when returned JSON from form submission contains 'error' property
function displayError(errorJSON) {
  const resultsElement = document.getElementById('jsonResult');
  resultsElement.classList.add('error');
  resultsElement.innerHTML = `{
    <ul class="indent">
      <li>"error" : "${replaceUnsafeChars(errorJSON.error)}"</li>
    </ul>
  }`;
}

// Single Stock Lookup Form Submission
document.getElementById('testForm2').addEventListener('submit', (e) => {
  e.preventDefault();

  const resultsElement = document.getElementById('jsonResult');
  resultsElement.classList.remove('error');

  const stock = e.target[0].value;
  const checkbox = e.target[1].checked;
  fetch(`/api/stock-prices/?stock=${stock}&like=${checkbox}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        return displayError(data);
      }

      resultsElement.innerHTML = `{
        <ul class="indent">
          <li>"stockData" : {</li>
          <ul class="indent">
            <li>"stock": "${replaceUnsafeChars(data.stockData.stock)}"</li>
            <li>"price": "${replaceUnsafeChars(data.stockData.price)}"</li>
            <li>"likes": "${replaceUnsafeChars(data.stockData.likes)}"</li>
          </ul>
          }
        </ul>
      }`;
    });
});

// Two Stock Lookup Form Submission
document.getElementById('testForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const resultsElement = document.getElementById('jsonResult');
  resultsElement.classList.remove('error');

  const stock1 = e.target[0].value;
  const stock2 = e.target[1].value;
  const checkbox = e.target[2].checked;
  fetch(`/api/stock-prices?stock=${stock1}&stock=${stock2}&like=${checkbox}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        return displayError(data);
      }

      resultsElement.innerHTML = `{
        <ul class="indent">
          <li>"stockData" : [</li>
            {
            <ul class="indent">
              <li>"stock": "${replaceUnsafeChars(data.stockData[0].stock)}"</li>
              <li>"price": "${replaceUnsafeChars(data.stockData[0].price)}"</li>
              <li>"likes": "${replaceUnsafeChars(data.stockData[0].likes)}"</li>
              <li>"rel_likes": "${replaceUnsafeChars(
                data.stockData[0].rel_likes,
              )}"</li>
            </ul>
            },
            <br />
            {
            <ul class="indent">
              <li>"stock": "${replaceUnsafeChars(data.stockData[1].stock)}"</li>
              <li>"price": "${replaceUnsafeChars(data.stockData[1].price)}"</li>
              <li>"likes": "${replaceUnsafeChars(data.stockData[1].likes)}"</li>
              <li>"rel_likes": "${replaceUnsafeChars(
                data.stockData[1].rel_likes,
              )}"</li>
            </ul>
            }]
        </ul>
      }`;
    });
});
