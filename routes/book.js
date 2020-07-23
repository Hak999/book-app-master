var express = require('express');
var fs = require('fs');
var router = express.Router();
// handle multipart form data
const multer = require('multer');
const path = require('path');

const models = require('../models');
const Book = models.Book;

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		// set uploads directory
		cb(null, 'uploads/photo/')
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + path.extname(file.originalname));
	}
})

// initialize the multer configuration
const upload = multer({
	storage: storage
});

/* GET Book listing. */
router.get('/', function (req, res, next) {
	Book.findAll()
		.then((books) => {
			res.render('books/index', {
				books: books
			});
		}).catch(err => {
			console.log(err)
		})
});

router.post('/', upload.single('photo'), (req, res) => {
	Book.create({
		title: req.body.title,
		author: req.body.author,
		price: req.body.price,
		description: req.body.description,
		photo: !req.file ? 'placeholder.jpg' : req.file.filename
	}).then((book) => {
		res.redirect('/book')
	}).catch((err) => {
		console.log('an error occured here', err)
		res.render('error', err);
	})
})

router.get('/:id/detail', (req, res) => {
	Book.findByPk(req.params.id)
		.then((book) => {
			res.render('books/show', book.dataValues)
		}).catch((err) => {

			res.render('error', err)
		})
})

router.get('/new', (req, res) => {
	res.render('books/create');
})

router.get('/:id/edit', (req, res) => {
	Book.findByPk(req.params.id)
		.then((book) => {
			res.render('books/edit', book.dataValues)
		}).catch((err) => {

			res.render('error', err);
		})
})

router.put('/:id/edit', upload.single('photo'), (req, res) => {
	const book = {
		title: req.body.title,
		author: req.body.author,
		price: req.body.price,
		description: req.body.description,
	}
	if (req.file) {
		if (req.body.old_photo !== '') {

			fs.unlink(`uploads/photo/${req.body.old_photo}`, (err) => console.log(err));
			book.photo = req.file.filename
		}
	}
	Book.update(book, {
		where: {
			id: req.params.id
		}
	}).then((book) => {
		res.redirect('/book')
	}).catch((err) => {
		res.render('error', err);
	})
})

router.get('/:id/delete', (req, res) => {
	Book.findByPk(req.params.id)
		.then((book) => {
			fs.unlink(`uploads/photo/${book.dataValues.photo}`, () => {
				Book.destroy({
					where: {
						id: book.dataValues.id
					}
				}).then(() => {
					res.redirect('/book')
				}).catch((err) => {
					res.render('error', err)
				})
			})
		}).catch((err) => {
			res.render('error', err)
		})
})

module.exports = router;