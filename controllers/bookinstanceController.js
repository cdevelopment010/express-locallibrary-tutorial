const BookInstance = require("../models/bookinstance");
const Book = require ('../models/book');
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require('express-validator') 


// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const allBookInstances = await BookInstance.find()
    .populate("book")
    .exec(); 

    res.render("bookinstance_list", {
      title: "Book Instance List",
      bookinstance_list: allBookInstances,
    })

});

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance
    .findById(req.params.id)
    .populate("book")
    .exec();

  if (bookInstance === null){
    //No results
    const err = new Error("Book copy not found");
    err.status = 404; 
    return next(err);
  }

  res.render("bookinstance_detail", {
    title: "Book", 
    bookinstance: bookInstance,
  })
});

// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  const allBooks = await Book
    .find({}, "title")
    .sort({ title: 1})
    .exec();

  res.render("bookinstance_form", {
    title: "Create BookInstance",
    book_list: allBooks,
  });
});

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  //Validate and sanitize fields.
  body("book", "Book must be specified")
    .trim()
    .isLength({ min: 1})
    .escape(),

  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1})
    .escape(), 
  
  body("Status")
    .escape(),
  
  body("due_back", "Invalid date")
    .optional({ values: "falsy"})
    .isISO8601()
    .toDate(),

  //Proess request after validation and sanitization
  asyncHandler(async (req, res, next) =>{
    //Extract the validation errors from a request. 
    const errors = validationResult(req); 

    // Create a BookInstance object with escaped and trimmed data. 
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    })

    if (!errors.isEmpty()) {
      //There are errors
      // Render form again with sanitized values and error messages. 
      const allBooks = await Book
        .find({}, "title")
        .sort({title: 1})
        .exec(); 

        res.render("bookinstance_form", {
          title: "Create BookInstance",
          book_list: allBooks,
          selected_book: bookInstance.book._id,
          errors: errors.array(),
          bookinstance: bookInstance,
        }); 
        return; 
    } else {
      // Data from form is valid
      await BookInstance.save(); 
      res.redirect(bookInstance.url);
    }
  }),
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id).populate("book").exec();

  if (bookInstance === null) {
    // No result
    res.redirect("/catalog/bookInstances")
  }

  res.render("bookinstance_delete", {
    title: "Delete Book Instance", 
    bookinstance: bookInstance
  }); 

});

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id).populate("book").exec();

  if (bookInstance === null ) {
    //No Book Instance.
    res.redirect("/catalog/bookinstances");
  }

  await BookInstance.findByIdAndDelete(req.body.bookinstanceId);
  res.redirect("/catalog/bookinstances");
});

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  //Get book instance and book detail (in parallel)

  const [bookInstance, allBooks] = await Promise.all([
    BookInstance.findById(req.params.id).populate("book").exec(),
    Book.find({}, "title").sort({ title: 1}).exec(),
  ]);

  if (bookInstance === null){
    // No record found. Redirect to book instance list. 
    res.redirect("/catalog/bookinstances"); 
  }

  res.render("bookinstance_form", {
    title: "Update BookInstance", 
    bookinstance: bookInstance,
    book_list: allBooks,
    selected_book: bookInstance.book._id,
  })

});

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
  //Validate and sanitize fields.
  body("book", "Book must be specified")
    .trim()
    .isLength({ min: 1})
    .escape(),

  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1})
    .escape(), 
  
  body("Status")
    .escape(),
  
  body("due_back", "Invalid date")
    .optional({ values: "falsy"})
    .isISO8601()
    .toDate(),

  //Proess request after validation and sanitization
  asyncHandler(async (req, res, next) =>{
    //Extract the validation errors from a request. 
    const errors = validationResult(req); 

    console.log(req.body)

    // Create a BookInstance object with escaped and trimmed data. 
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id,
    })

    if (!errors.isEmpty()) {
      //There are errors
      // Render form again with sanitized values and error messages. 
      const allBooks = await Book
        .find({}, "title")
        .sort({title: 1})
        .exec(); 

        res.render("bookinstance_form", {
          title: "Create BookInstance",
          book_list: allBooks,
          selected_book: bookInstance.book._id,
          errors: errors.array(),
          bookinstance: bookInstance,
        }); 
        return; 
    } else {
      // Data from form is valid
      const updatedBookInstance = await BookInstance.findByIdAndUpdate(req.params.id,bookInstance, {})
      res.redirect(updatedBookInstance.url);
    }
  }),

];