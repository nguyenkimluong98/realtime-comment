const express = require("express");

const app = express();

const port = process.env.PORT || 3000;

app.use(express.static("public"));

const dbConnect = require("./db.js");
dbConnect();

const Comment = require("./models/comment.js");

app.use(express.json());

app.post("/api/comments", (req, res) => {
	const comment = new Comment({
		username: req.body.username,
		comment: req.body.comment,
	});

	comment.save().then((response) => {
		res.send(response);
	});
});

app.get("/api/comments", (req, res) => {
	Comment.find().then((comments) => res.send(comments));
});

const server = app.listen(port, () => {
	console.log(`Listen on port ${port}`);
});

const io = require("socket.io")(server);
io.on("connection", (socket) => {
	console.log(`New connection ${socket.id}`);

	// receive event
	socket.on("comment", (data) => {
		socket.broadcast.emit("comment", data);
	});

	socket.on("typing", (data) => {
		socket.broadcast.emit("typing", data);
	});
});
