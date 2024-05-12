const loginForm = document.getElementById("login-form");
const elementSection = document.getElementById("element-section");
const addItemForm = document.getElementById("add-item-form");

const baseUrl = "https://coding-school-networking.dev.webundsoehne.com";
const user = {
	username: "",
	password: "",
};

loginForm.addEventListener("submit", (event) => {
	event.preventDefault();

	login();
});

addItemForm.addEventListener("submit", (event) => {
	event.preventDefault();

	const nameElement = document.getElementById("name");
	const descriptionElement = document.getElementById("description");

	postElement(nameElement.value, descriptionElement.value).then(() => {
		nameElement.value = "";
		descriptionElement.value = "";
	});
});

function login() {
	const usernameElement = document.getElementById("username");
	const passwordElement = document.getElementById("password");

	// login function implementieren

	if (usernameElement.value === "") {
		console.error("Username muss gesetzt sein");
		return;
	}

	user.username = usernameElement.value;
	user.password = passwordElement.value;

	console.log(user);

	loginForm.classList.add("hidden");
	elementSection.classList.remove("hidden");
}

// GET ALL Elements
function getElements() {
	const request = new Request(baseUrl + "/element", {
		method: "GET",
		headers: {
			Authorization: "Basic " + btoa(user.username + ":" + user.password),
		},
	});

	fetch(request)
		.then((response) => response.json())
		.then((data) => {
			console.log(data);

			const elementContainer = document.getElementById("element-container");
			elementContainer.innerHTML = "";

			data.forEach((element) => {
				const card = document.createElement("div");
				card.classList.add("grid", "p-2", "bg-stone-100", "gap-2");

				const name = document.createElement("h2");
				name.textContent = element.name;
				name.setAttribute("id", element.id);
				name.classList.add("text-xl");

				const description = document.createElement("p");
				description.textContent = element.description;

				const deleteButton = document.createElement("button");
				deleteButton.textContent = "✕";
				deleteButton.classList.add("w-fit", "px-2", "py-1", "text-white", "bg-red-600", "rounded");

				deleteButton.addEventListener("click", () => {
					deleteElement(element.id);
				});

				card.append(name);
				card.append(description);
				card.append(deleteButton);

				elementContainer.append(card);
			});
		});
}

// POST Element
function postElement(name, description) {
	const body = {
		name: name,
		description: description,
	};

	const request = new Request(baseUrl + "/element", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: "Basic " + btoa(user.username + ":" + user.password),
		},
		body: JSON.stringify(body),
	});

	return fetch(request);
}

// DELETE Element
function deleteElement(id) {
	axios
		.delete(baseUrl + "/element/" + id, {
			auth: {
				username: user.username,
				password: user.password,
			},
		})
		.then(() => {
			getElements();
		});
}
