const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database(':memory:');

const port = 3000;

app.use(express.json());

db.serialize(() => {
    db.run("CREATE TABLE bookmarks (title TEXT, url TEXT)");

    const stmt = db.prepare("INSERT INTO bookmarks VALUES (?,?)");
	stmt.run("Google", "www.google.com");
    
	stmt.finalize();
});

class Bookmark {
	constructor(text, url) {
		this.text = text;
		this.url = url;
	}
}

app.get('/', (req, res) => {
	let bookmarks = [];
	db.each('SELECT rowid as id, title, url FROM bookmarks', (err, row) => {
		let bookmark = new Bookmark(row.title, row.url);
		bookmarks.push(bookmark);
	}, () => {
		res.json(bookmarks);
	});
});

app.post('/new', (req, res) => {
	console.log(`Body: ${JSON.stringify(req.body)}`);
	if (req.body.title && req.body.url) {
		const stmt = db.prepare('INSERT INTO bookmarks VALUES (?,?)');
		stmt.run(req.body.title, req.body.url);
		stmt.finalize();
	}
	res.send('Bookmark added');
});

app.listen(port, () => {
	console.log(`BookmarkAPI listening on port ${port}`);
});
