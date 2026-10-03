// Add this file with <script src="script.js" defer></script>.
// Match the element IDs listed in the answer.

var sampleData = {
  books: [
    { id: "b1", title: "The Alchemist", author: "Paulo Coelho" },
    { id: "b2", title: "Wings of Fire", author: "A. P. J. Abdul Kalam" },
    { id: "b3", title: "Pride and Prejudice", author: "Jane Austen" }
  ],push to
  members: [
    { id: "m1", name: "Aarav Sharma", email: "aarav@example.com" },
    { id: "m2", name: "Maya Patel", email: "maya@example.com" }
  ],
  loans: []
};

var storageKey = "libraryData";
var library = loadLibrary();

function loadLibrary() {
  var savedData = localStorage.getItem(storageKey);
  if (!savedData) {
    localStorage.setItem(storageKey, JSON.stringify(sampleData));
    return sampleData;
  }

  try {
    var data = JSON.parse(savedData);
    if (Array.isArray(data.books) && Array.isArray(data.members) && Array.isArray(data.loans)) {
      return data;
    }
  } catch (error) {
    alert("Saved library data could not be read. Sample data will be loaded.");
  }

  localStorage.setItem(storageKey, JSON.stringify(sampleData));
  return sampleData;
}

function saveLibrary() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(library));
  } catch (error) {
    alert("Library data could not be saved in this browser.");
  }
}

function getElement(id) {
  return document.getElementById(id);
}

function makeId(prefix) {
  return prefix + Date.now() + Math.floor(Math.random() * 1000);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    var replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return replacements[character];
  });
}

function findBook(bookId) {
  for (var i = 0; i < library.books.length; i++) {
    if (library.books[i].id === bookId) return library.books[i];
  }
  return null;
}

function findMember(memberId) {
  for (var i = 0; i < library.members.length; i++) {
    if (library.members[i].id === memberId) return library.members[i];
  }
  return null;
}

function isBookIssued(bookId) {
  for (var i = 0; i < library.loans.length; i++) {
    if (library.loans[i].bookId === bookId && !library.loans[i].returnedAt) return true;
  }
  return false;
}

function renderBooks() {
  var list = getElement("booksList");
  var searchBox = getElement("bookSearch");
  if (!list) return;

  var search = searchBox ? searchBox.value.toLowerCase().trim() : "";
  var html = "";

  for (var i = 0; i < library.books.length; i++) {
    var book = library.books[i];
    var searchableText = (book.title + " " + book.author).toLowerCase();
    if (search && searchableText.indexOf(search) === -1) continue;

    var status = isBookIssued(book.id) ? "Issued" : "Available";
    html += '<li>' + escapeHtml(book.title) + " — " + escapeHtml(book.author) +
      " (" + status + ') <button type="button" data-delete-book="' +
      escapeHtml(book.id) + '">Delete</button></li>';
  }

  list.innerHTML = html || "<li>No books found.</li>";
  renderIssueOptions();
}

function renderMembers() {
  var list = getElement("membersList");
  if (!list) return;

  var html = "";
  for (var i = 0; i < library.members.length; i++) {
    var member = library.members[i];
    html += '<li>' + escapeHtml(member.name) + " — " + escapeHtml(member.email) +
      ' <button type="button" data-delete-member="' + escapeHtml(member.id) +
      '">Delete</button></li>';
  }
  list.innerHTML = html || "<li>No members yet.</li>";
  renderIssueOptions();
}

function renderIssueOptions() {
  var bookSelect = getElement("issueBook");
  var memberSelect = getElement("issueMember");

  if (bookSelect) {
    var bookOptions = '<option value="">Choose an available book</option>';
    for (var i = 0; i < library.books.length; i++) {
      var book = library.books[i];
      if (!isBookIssued(book.id)) {
        bookOptions += '<option value="' + escapeHtml(book.id) + '">' +
          escapeHtml(book.title) + "</option>";
      }
    }
    bookSelect.innerHTML = bookOptions;
  }

  if (memberSelect) {
    var memberOptions = '<option value="">Choose a member</option>';
    for (var j = 0; j < library.members.length; j++) {
      var member = library.members[j];
      memberOptions += '<option value="' + escapeHtml(member.id) + '">' +
        escapeHtml(member.name) + "</option>";
    }
    memberSelect.innerHTML = memberOptions;
  }
}

function renderLoans() {
  var list = getElement("loansList");
  var history = getElement("historyList");
  var activeHtml = "";
  var historyHtml = "";

  for (var i = 0; i < library.loans.length; i++) {
    var loan = library.loans[i];
    var book = findBook(loan.bookId);
    var member = findMember(loan.memberId);
    var bookName = book ? book.title : (loan.bookTitle || "Deleted book");
    var memberName = member ? member.name : (loan.memberName || "Deleted member");

    if (!loan.returnedAt) {
      activeHtml += "<li>" + escapeHtml(bookName) + " — " + escapeHtml(memberName) +
        " (due " + new Date(loan.dueAt).toLocaleDateString() +
        ') <button type="button" data-return-loan="' + escapeHtml(loan.id) +
        '">Return</button></li>';
      historyHtml += "<li>" + escapeHtml(bookName) + " — " + escapeHtml(memberName) +
        " (issued " + new Date(loan.issuedAt).toLocaleDateString() + ", due " +
        new Date(loan.dueAt).toLocaleDateString() + ", not returned)</li>";
    } else {
      historyHtml += "<li>" + escapeHtml(bookName) + " — " + escapeHtml(memberName) +
        " (issued " + new Date(loan.issuedAt).toLocaleDateString() + ", returned " +
        new Date(loan.returnedAt).toLocaleDateString() + ", fine ₹" +
        Number(loan.fine || 0) + ")</li>";
    }
  }

  if (list) list.innerHTML = activeHtml || "<li>No books are currently issued.</li>";
  if (history) history.innerHTML = historyHtml || "<li>No history yet.</li>";
}

function renderHomeNumbers() {
  var issuedCount = 0;
  var overdueCount = 0;
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  for (var i = 0; i < library.loans.length; i++) {
    var loan = library.loans[i];
    if (!loan.returnedAt) {
      issuedCount++;
      if (new Date(loan.dueAt) < today) overdueCount++;
    }
  }

  if (getElement("totalBooks")) getElement("totalBooks").textContent = library.books.length;
  if (getElement("totalMembers")) getElement("totalMembers").textContent = library.members.length;
  if (getElement("issuedBooks")) getElement("issuedBooks").textContent = issuedCount;
  if (getElement("overdueBooks")) getElement("overdueBooks").textContent = overdueCount;
}

function renderPage() {
  renderBooks();
  renderMembers();
  renderLoans();
  renderHomeNumbers();
}

var bookForm = getElement("bookForm");
if (bookForm) {
  bookForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var title = getElement("bookTitle").value.trim();
    var author = getElement("bookAuthor").value.trim();
    if (!title || !author) return alert("Enter both a book title and author.");

    library.books.push({ id: makeId("b"), title: title, author: author });
    saveLibrary();
    bookForm.reset();
    renderPage();
  });
}

var memberForm = getElement("memberForm");
if (memberForm) {
  memberForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var name = getElement("memberName").value.trim();
    var email = getElement("memberEmail").value.trim();
    if (!name || !email) return alert("Enter both a member name and email.");

    library.members.push({ id: makeId("m"), name: name, email: email });
    saveLibrary();
    memberForm.reset();
    renderPage();
  });
}

var searchBox = getElement("bookSearch");
if (searchBox) searchBox.addEventListener("input", renderBooks);

var issueForm = getElement("issueForm");
if (issueForm) {
  issueForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var bookId = getElement("issueBook").value;
    var memberId = getElement("issueMember").value;
    var activeLoans = 0;

    for (var i = 0; i < library.loans.length; i++) {
      if (library.loans[i].memberId === memberId && !library.loans[i].returnedAt) {
        activeLoans++;
      }
    }

    if (!bookId || !memberId) return alert("Choose a book and a member.");
    if (isBookIssued(bookId)) return alert("That book is already issued.");
    if (activeLoans >= 3) return alert("A member can borrow at most 3 books.");

    var issuedAt = new Date();
    var dueAt = new Date(issuedAt);
    // Add 14 days to the issue date.
    dueAt.setDate(dueAt.getDate() + 14);
    dueAt.setHours(0, 0, 0, 0);

    library.loans.push({
      id: makeId("l"),
      bookId: bookId,
      memberId: memberId,
      bookTitle: findBook(bookId).title,
      memberName: findMember(memberId).name,
      issuedAt: issuedAt.toISOString(),
      dueAt: dueAt.toISOString(),
      returnedAt: null,
      fine: 0
    });
    saveLibrary();
    issueForm.reset();
    renderPage();
  });
}

document.addEventListener("click", function (event) {
  var target = event.target;
  if (!target || !target.getAttribute) return;

  var bookId = target.getAttribute("data-delete-book");
  if (bookId) {
    if (isBookIssued(bookId)) return alert("Return this book before deleting it.");
    if (!confirm("Delete this book?")) return;
    var remainingBooks = [];
    for (var b = 0; b < library.books.length; b++) {
      if (library.books[b].id !== bookId) remainingBooks.push(library.books[b]);
    }
    library.books = remainingBooks;
    saveLibrary();
    renderPage();
    return;
  }

  var memberId = target.getAttribute("data-delete-member");
  if (memberId) {
    for (var i = 0; i < library.loans.length; i++) {
      if (library.loans[i].memberId === memberId && !library.loans[i].returnedAt) {
        return alert("This member has a book to return first.");
      }
    }
    if (!confirm("Delete this member?")) return;
    var remainingMembers = [];
    for (var m = 0; m < library.members.length; m++) {
      if (library.members[m].id !== memberId) remainingMembers.push(library.members[m]);
    }
    library.members = remainingMembers;
    saveLibrary();
    renderPage();
    return;
  }

  var loanId = target.getAttribute("data-return-loan");
  if (loanId) {
    for (var j = 0; j < library.loans.length; j++) {
      var loan = library.loans[j];
      if (loan.id === loanId && !loan.returnedAt) {
        var returnedAt = new Date();
        var dueDate = new Date(loan.dueAt);
        returnedAt.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        var lateDays = Math.max(0, Math.floor((returnedAt - dueDate) / 86400000));
        loan.returnedAt = new Date().toISOString();
        // Charge 5 rupees for each late calendar day.
        loan.fine = lateDays * 5;
        alert("Book returned. Fine: ₹" + loan.fine);
        saveLibrary();
        renderPage();
        return;
      }
    }
  }
});

var darkModeToggle = getElement("darkModeToggle");
if (darkModeToggle) {
  darkModeToggle.checked = localStorage.getItem("libraryDarkMode") === "true";
  document.body.classList.toggle("dark-mode", darkModeToggle.checked);
  darkModeToggle.addEventListener("change", function () {
    document.body.classList.toggle("dark-mode", darkModeToggle.checked);
    localStorage.setItem("libraryDarkMode", darkModeToggle.checked);
  });
}

renderPage();
