'use strict'

// getting the elements.
const form = document.querySelector('form');
const articleContainer = document.querySelector('.articleContainer');
const deleteBtn = document.querySelector('.delete');


// fetch request for reading the json data file and calling the display cars list method to add the list to the website.
fetch("/templates/database/list.json")
.then((res) => res.json())
.then((data) => {
  displayCarsList(data);
})
.catch((err) => console.log(err));

// event listener for the form element that submits the form 
form.addEventListener('submit', () => {
  form.submit();
});

// takes a car object and adds it to the main element.
function displayCarsList(car) {
 
  //sorting the list of cars from min year to max year.
  car = car.sort((a, b) => a.Year - b.Year);
  articleContainer.innerHTML = '';
  const article = document.createElement('article');
  article.classList.add("cars");
  
  car.forEach(car => {
    const figure = document.createElement("figure");
    figure.classList.add('outer-figure');
    figure.innerHTML = `
      <figure class="added-car-fig">
        <img src=${car.Image} alt="car image">
      </figure>
      <h2>${car.Manufacturer} ${car.Model}</h2>
      <p>${car.Year}</p>
      <p><mark>${car.RentalPrice}</mark> / day </p>
      <button class="delete"> delete</button>
    `;
    article.append(figure);
    figure.addEventListener('click', (e) => {
      if(e.target.textContent.trim() == 'delete')
      {
        sendCarPlateNumber(car.PlatesNumber);
      }
    });
  });
  articleContainer.append(article);
}


function sendCarPlateNumber(carPlateNumber) {
  // Create an object with the data to send to the backend
  const data = { carPlateNumber: carPlateNumber };

  // Use the fetch() method to send the data to the backend
  fetch("/deletecar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.ok) {
        console.log("Car plate number sent successfully");
        location.reload();
      } else {
        console.error("Error sending car plate number:", response.statusText);
      }
    })
    .catch((error) => {
      console.error("Error sending car plate number:", error);
    });
}