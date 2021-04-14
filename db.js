function dbConnect() {
	// db connection
	const mongose = require("mongoose");
	const url = "mongodb://localhost:27017/comments";

	mongose.connect(url, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: true,
	});

	const connection = mongose.connection;
	connection
		.once("open", () => {
			console.log("Database connected...");
		})
		.catch(() => {
			console.log("Connection failed...");
		});
}

module.exports = dbConnect;
