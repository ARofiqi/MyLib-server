const express = require("express");
const router = express.Router();
const books = require("../data");

let borrowedBooks = [
  {
    id: 1,
    title: "Laskar Pelangi",
    author: "Andrea Hirata",
    image: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1489732961i/1362193.jpg",
    borrowedAt: "2024-11-01",
    borrowedDays: 7,
    userNIM: "12345678",
  },
  {
    id: 2,
    title: "Bumi Manusia",
    author: "Pramoedya Ananta Toer",
    image: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1565658920i/1398034.jpg",
    borrowedAt: "2024-11-02",
    borrowedDays: 7,
    userNIM: "87654321",
  },
];

router.get("/", (req, res) => {
  res.json(borrowedBooks);
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  const borrowedBook = borrowedBooks.find((book) => book.id === parseInt(id));
  if (borrowedBook) {
    res.json(borrowedBook);
  } else {
    res.status(404).json({ message: "Borrowed book not found" });
  }
});

router.post("/:id", (req, res) => {
  const { id } = req.params;
  const { borrowedDays, userNIM } = req.body;

  if (!borrowedDays || borrowedDays < 1 || borrowedDays > 14) {
    return res.status(400).json({ message: "Jumlah hari peminjaman harus antara 1 dan 14 hari" });
  }

  if (!userNIM) {
    return res.status(400).json({ message: "User NIM harus disertakan" });
  }

  const existingBorrowedBook = borrowedBooks.find((book) => book.id === parseInt(id));

  if (existingBorrowedBook) {
    if (existingBorrowedBook.userNIM !== userNIM) {
      return res.status(400).json({ message: "Buku ini sudah dipinjam oleh orang lain" });
    }
    return res.status(201).json(existingBorrowedBook); // Mengembalikan buku yang sudah dipinjam
  }

  const borrowedBook = books.find((book) => book.id === parseInt(id));

  if (borrowedBook) {
    const borrowDate = new Date();
    const borrowedAt = borrowDate.toISOString().split("T")[0];
    const returnDate = new Date(borrowDate);
    returnDate.setDate(borrowDate.getDate() + borrowedDays);

    const newBorrowedBook = {
      id: borrowedBook.id,
      title: borrowedBook.title,
      author: borrowedBook.author,
      image: borrowedBook.image,
      borrowedAt,
      borrowedDays,
      userNIM,
      returnDate: returnDate.toISOString().split("T")[0],
    };

    borrowedBooks.push(newBorrowedBook);
    res.status(201).json(newBorrowedBook);  // Return 201 for successful creation
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const index = borrowedBooks.findIndex((book) => book.id === parseInt(id));

  if (index !== -1) {
    const returnedBook = borrowedBooks.splice(index, 1);
    res.json(returnedBook[0]);
  } else {
    res.status(404).json({ message: "Borrowed book not found" });
  }
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { additionalDays, userNIM } = req.body;

  const borrowedBook = borrowedBooks.find((book) => book.id === parseInt(id));

  if (borrowedBook) {
    if (borrowedBook.userNIM !== userNIM) {
      return res.status(400).json({ message: "Buku ini sudah dipinjam oleh orang lain" });
    }

    borrowedBook.borrowedDays += additionalDays;
    const borrowDate = new Date(borrowedBook.borrowedAt);
    const newReturnDate = new Date(borrowDate);
    newReturnDate.setDate(borrowDate.getDate() + borrowedBook.borrowedDays);

    borrowedBook.returnDate = newReturnDate.toISOString().split("T")[0];

    res.status(200).json({
      message: "Peminjaman diperpanjang",
      borrowedBook,
    });
  } else {
    res.status(404).json({ message: "Borrowed book not found" });
  }
});

module.exports = router;
