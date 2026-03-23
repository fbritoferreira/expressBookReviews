const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login." });
});

// Get the book list available in the shop using async/await with Axios
public_users.get('/', async function (req, res) {
  try {
    const getBooks = new Promise((resolve, reject) => {
      resolve(books);
    });
    const bookList = await getBooks;
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

// Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const getBookByISBN = new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found");
    }
  });

  getBookByISBN.then((book) => {
    return res.status(200).json(book);
  }).catch((err) => {
    return res.status(404).json({ message: err });
  });
});

// Get book details based on author using async/await
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const getBooksByAuthor = new Promise((resolve, reject) => {
      const matchingBooks = Object.values(books).filter(book => book.author === author);
      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject("No books found for this author");
      }
    });
    const matchingBooks = await getBooksByAuthor;
    return res.status(200).json(matchingBooks);
  } catch (err) {
    return res.status(404).json({ message: err });
  }
});

// Get all books based on title using async/await
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const getBooksByTitle = new Promise((resolve, reject) => {
      const matchingBooks = Object.values(books).filter(book => book.title === title);
      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject("No books found with this title");
      }
    });
    const matchingBooks = await getBooksByTitle;
    return res.status(200).json(matchingBooks);
  } catch (err) {
    return res.status(404).json({ message: err });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
