const loginForm = document.getElementById("login-form");
const elementSection = document.getElementById("element-section");

const baseUrl = "https://coding-school-networking.dev.webundsoehne.com";

// Hier erstellen wir ein leeres Objekt, in das wir die Userdaten speichern können
// Ein Obejkt kann als const deklariert werden, solange wir später nur die Werte ändern.
const user = {
	username: "",
	password: "",
};

// Hier registrieren wir einen Eventlistener für das Submit-Event des Login-Formulars
loginForm.addEventListener("submit", (event) => {
	// Ganz wichtig beim "submit" Event, damit das Formular nicht die Seite neu lädt
	event.preventDefault();

	// Hier rufen wir die Funktion login auf, die die Userdaten aus den Formularfeldern setzt und die Elemente lädt
	login();
});

function login() {
	const usernameElement = document.getElementById("username");
	const passwordElement = document.getElementById("password");

	// Prüfen ob die Felder ausgefüllt sind, wenn nicht, dann abbrechen (return)
	if (usernameElement.value === "" || passwordElement.value === "") {
		console.error("Username muss gesetzt sein");
		return;
	}

	// Setzen der Userdaten aus den Formularfeldern, hier muss je nach API geprüft werden, ob die Daten korrekt sind.
	// In unserem Fall ist Username und Passwort egal, da wir nur eine Demo API haben.
	user.username = usernameElement.value;
	user.password = passwordElement.value;

	console.log(user);

	// Das Login-Formular wird ausgeblendet und die Elemente werden angezeigt
	loginForm.classList.add("hidden");
	elementSection.classList.remove("hidden");

	// Hier können wir auch gleich die Elemente laden (das habe ich nachträglich hinzugefügt)
	getElements();
}

// GET ALL Elements
function getElements() {
	// Erstellen eines neuen Request-Objekts
	// Hier wird die URL und die Methode festgelegt (GET ist die default Methode, aber für die lesbarkeit ist es gut sie zu setzen)
	const request = new Request(baseUrl + "/element", {
		method: "GET",
		headers: {
			// Bei Basic Auth wird der Username und das Passwort mit einem Doppelpunkt verbunden und dann in Base64 (mit der btoa function) encodiert
			Authorization: "Basic " + btoa(user.username + ":" + user.password),
		},
	});

	// Mit fetch wird der Request abgeschickt, damit beginnt die sogenannte Promise chain
	fetch(request)
		// da die fetch Funktion ein Promise zurückgibt, können wir mit .then darauf reagieren und die Daten in ein json umwandeln
		.then((response) => response.json())
		// die funktion  response.json() gibt auch ein Promise zurück, also müssen wir noch ein .then anhängen
		.then((data) => {
			console.log(data);

			// Hier holen wir uns den Container, in dem wir die Elemente anzeigen wollen und löschen die bisherigen Elemente (damit wir keine Duplikate haben)
			const elementContainer = document.getElementById("element-container");
			elementContainer.innerHTML = "";

			// Da data ein Array von Elementen ist können wir die forEach Methode verwenden
			// wir erstellen für jedes Element ein Card-Element und fügen es dem Container hinzu
			// Ich habe die Funktion createElementCard ausgelagert, damit der Code übersichtlicher bleibt
			data.forEach((element) => {
				const card = createElementCard(element);
				elementContainer.append(card);
			});
		})
		// Wenn in der Promise chain ein Fehler auftritt, wird der Fehler hier abgefangen und in der console ausgegeben
		.catch((error) => {
			// Besser wäre es die Fehlermeldung in der UI anzuzeigen, aber fürs erste reicht es in der console
			console.error("Etwas ist beim fetchen der Daten schiefgelaufen", error);
		});
}

// Diese Funktion erstellt eine Card für ein Element und hat als Rückgabewert ein HTML-Element das wir in den Container einfügen können
function createElementCard(element) {
	// Hier erstellen wir das div Element, dass unsere Daten wrappen wird
	const card = document.createElement("div");
	card.classList.add(
		"grid",
		"p-2",
		"pr-20",
		"rounded",
		"bg-stone-100",
		"ring-1",
		"ring-stone-400",
		"gap-2",
		"relative"
	);
	card.setAttribute("id", element.id);

	// Als Überschrift erstellen wir ein h2 Element und fügen den Namen des Elements hinzu
	const name = document.createElement("h2");
	name.textContent = element.name;
	name.classList.add("text-xl");

	// Hier erstellen wir ein p Element und fügen die Beschreibung des Elements hinzu
	const description = document.createElement("p");
	description.textContent = element.description;

	// Hier erstellen wir den Button zum Löschen des Elements
	const deleteButton = document.createElement("button");
	deleteButton.textContent = "✕";
	deleteButton.title = "Löschen";
	deleteButton.classList.add(
		"w-fit",
		"text-red-600",
		"font-bold",
		"rounded",
		"absolute",
		"w-6",
		"aspect-square",
		"top-1",
		"right-1",
		"hover:bg-red-200"
	);

	// Da wir den Button in der Schleife erstellen, müssen wir den Eventlistener auch hier setzen,
	// sonst wissen wir nicht welches Element gelöscht werden soll, da wir keinen Zugriff mehr auf die Variable element haben
	deleteButton.addEventListener("click", () => {
		// Die Funktion deleteElement gibt ein Promise zurück, also können wir darauf reagieren und die Elemente neu holen
		deleteElement(element.id).then(() => {
			getElements();
		});
	});

	// Hier fügen wir die Elemente dem Card-Element hinzu und geben es zurück
	card.append(name);
	card.append(description);
	card.append(deleteButton);
	return card;
}

// Ab hier beginnt der Code für die Erstellung eines neuen Elements
const addItemForm = document.getElementById("add-item-form");

// Wie beim Login-Formular registrieren wir auch hier einen Eventlistener für das Submit-Event (nicht preventDefault vergessen!)
addItemForm.addEventListener("submit", (event) => {
	event.preventDefault();

	const nameElement = document.getElementById("name");
	const descriptionElement = document.getElementById("description");

	// Hier prüfen wir ob Name gesetzt ist und länger als 12 Zeichen ist, wenn nicht, dann brechen wir ab
	if (nameElement.value === "" || nameElement.value.length < 12) {
		console.error("Name muss gesetzt, und länger als 12 Zeichen sein");
		return;
	}

	// Hier rufen wir die Funktion postElement auf und übergeben die Werte der Formularfelder
	postElement(nameElement.value, descriptionElement.value).then(() => {
		// Hier setzen wir die Werte der Formularfelder zurück, damit der User direkt ein neues Element erstellen kann, und holen die Elemente neu
		nameElement.value = "";
		descriptionElement.value = "";
		getElements();
	});
});

// POST Element
function postElement(name, description) {
	// Hier bereiten wir den body vor den wir an die API schicken wollen (In der swagger Dokumentation steht was die API erwartet)
	const body = {
		name: name,
		description: description,
	};

	// Bei der POST Methode müssen wir zusätzlich zur methode und dem header,
	// auch auch den Body mitschicken und angeben welchen Content-Type wir haben
	const request = new Request(baseUrl + "/element", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: "Basic " + btoa(user.username + ":" + user.password),
		},
		// Wir müssen den Body in einen String umwandeln, da fetch() json nicht automatisch umwandelt
		body: JSON.stringify(body),
	});

	// Hier schicken wir den Request ab und geben das Promise zurück, damit wir darauf reagieren können
	// (wir können dann .then in der Funktion aufrufen, die postElement aufruft)
	return fetch(request);
}

// DELETE Element
// Die Funktion deleteElement haben wir mit Axios realisiert, passt auf das ihr Axios mittels script Tag in euer HTML einbindet um es verwenden zu können
function deleteElement(id) {
	// Axios bietet die Http Methoden als Methoden an, die wir direkt aufrufen können (bsp axios.get(url, {options})...)
	return axios.delete(baseUrl + "/element/" + id, {
		// Axios kann automatisch Basic Auth Header setzen, wenn wir die auth Option setzen
		auth: {
			username: user.username,
			password: user.password,
		},
		// Falls wir einen Body mitschicken wollen, könnten wir das hier machen,
		// bei Axios wird der Body automatisch in JSON umgewandelt und der Content-Type gesetzt
		// Achtet darauf das der Key data heißt und nicht body, wie bei fetch
		//
		// data: {
		// 	name: "Name",
		// 	description: "Description",
		// },
	});
}
