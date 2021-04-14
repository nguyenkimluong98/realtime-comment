let socket = io();
let username;

do {
	username = prompt("Enter your name: ");
} while (!username);

const textarea = document.querySelector("#textarea");
const submitBtn = document.querySelector("#submitBtn");
const commentBox = document.querySelector(".comment__box");

submitBtn.addEventListener("click", (e) => {
	e.preventDefault();

	let comment = textarea.value;

	if (!comment) {
		return;
	}

	postComment(comment);
});

function postComment(comment) {
	// append to dom
	let data = {
		username,
		comment,
		time: new Date(),
	};

	appendToDom(data);
	textarea.value = "";

	// broadcast
	broadcastComment(data);

	// sync with mongodb
	syncWithDb(data);
}

function appendToDom(data) {
	let lTag = document.createElement("li");

	lTag.classList.add("comment", "mb-3");

	let markup = `
    <div class="card border-light mb-3">
      <div class="card-body">
        <h6>${data.username}</h6>
        <p>
          ${data.comment}
        </p>
        <div>
          <img src="img/clock.png" alt="clock" srcset="" />
          <small>${moment(data.time).format("LT")}</small>
        </div>
      </div>
    </div>
  `;

	lTag.innerHTML = markup;
	commentBox.prepend(lTag);
}

function broadcastComment(data) {
	// Socket
	socket.emit("comment", data);
}

let timerId = null;
function debounce(func, timer) {
	if (timerId) {
		clearTimeout(timerId);
	}

	timerId = setTimeout(() => func(), timer);
}

socket.on("comment", (data) => {
	appendToDom(data);
});

let typingDiv = document.querySelector(".typing");

socket.on("typing", (data) => {
	typingDiv.innerHTML = `${data.username} is typing...`;

	debounce(function () {
		typingDiv.innerHTML = "";
	}, 1000);
});

// event listener on textarea
textarea.addEventListener("keyup", () => {
	socket.emit("typing", { username });
});

function syncWithDb(data) {
	const headers = {
		"Content-Type": "application/json",
	};

	fetch("/api/comments", {
		method: "Post",
		body: JSON.stringify(data),
		headers,
	})
		.then((response) => response.json())
		.then((result) => {
			console.log(result);
		})
		.catch((error) => console.log(error));
}

function fetchComments() {
	fetch("/api/comments")
		.then((res) => res.json())
		.then((result) => {
			result.forEach((comment) => {
				comment.time = comment.createdAt;
				appendToDom(comment);
			});
		});
}

window.onload = fetchComments();
