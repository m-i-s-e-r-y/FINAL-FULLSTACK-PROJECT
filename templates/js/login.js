//gettings form and error message elements
const form = document.querySelector("form");
const errMessage = document.querySelector(".error-message");

function formSubmit(e) {
  e.preventDefault();

  // taking the username and password value from the form.
  const username = form["username"].value;
  const password = form["password"].value;

  // resseting the error message to empty.
  errMessage.textContent = "";
  // creating a data object from the username and password.
  const data = { username, password };
  fetch("login", {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((val) => val.json())
    .then((val) => {
      if (val.valid) {
        window.location.href = "/about.html";
      } else {
        errMessage.textContent = "Invalid username or password";
      }
    })
    .catch((err) => console.log(err));
}

form.addEventListener("submit", formSubmit);
