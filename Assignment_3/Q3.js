const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/Q3_form.html");
});

app.post("/validate", (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  const phonePattern = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;

  if (phonePattern.test(phoneNumber)) {
    res.send("Telephone number is correct!");
  } else {
    res.send(
      "Invalid telephone number format. Enter in the format ddd-ddd-dddd."
    );
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
