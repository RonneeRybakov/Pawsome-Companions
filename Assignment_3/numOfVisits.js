const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser());

app.use((req, res, next) => {
  res.cookie("lastVisited", new Date().toISOString());
  next();
});

// Route for the webpage
app.get("/", (req, res) => {
  const visits = req.cookies.visits ? parseInt(req.cookies.visits) + 1 : 1;
  res.cookie("visits", visits);

  if (visits === 1) {
    res.send("Welcome to my webpage! It is your first time that you are here.");
  } else {
    const lastVisited = req.cookies.lastVisited
      ? new Date(req.cookies.lastVisited)
      : new Date();
    const lastVisitedFormatted = formatDate(lastVisited);

    res.send(
      `Hello, this is the ${visits} time that you are visiting my webpage. <br> The last time you visited my webpage was on: ${lastVisitedFormatted}`
    );
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

function formatDate(date) {
  return date.toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZoneName: "short",
  });
}
