const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");

const app = express();
const port = 5005;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "rondog-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public"));
app.use(bodyParser.urlencoded({ extended: true }));

const getPetFileData = () => {
  const filePath = path.join(__dirname, "available_pets.txt");
  try {
    const data = fs.existsSync(filePath)
      ? fs
          .readFileSync(filePath, "utf8")
          .split("\n")
          .filter((line) => line.trim())
      : [];
    return data;
  } catch (err) {
    console.error("Error reading file:", err);
    return [];
  }
};

const writePetFileData = (data) => {
  const filePath = path.join(__dirname, "available_pets.txt");
  try {
    let nextId = 1;
    const newData = data.map((entry, index) => {
      const parts = entry.split(":");
      if (isNaN(parseInt(parts[0]))) {
        parts[0] = nextId++;
      } else {
        const currentId = parseInt(parts[0]);
        nextId = currentId + 1;
      }
      return parts.join(":");
    });
    fs.writeFileSync(filePath, newData.join("\n"));
  } catch (err) {
    console.error("Failed to write pet data:", err);
  }
};

// Routes
app.get("/", (req, res) => {
  res.render("home", { title: "Home" });
});

app.get("/cat_care", (req, res) => {
  res.render("cat_care", { title: "Cat Care" });
});

app.get("/dog_care", (req, res) => {
  res.render("dog_care", { title: "Dog Care" });
});

app.get("/contact", (req, res) => {
  res.render("contact", { title: "Contact Us" });
});

app.get("/find", (req, res) => {
  res.render("find", { title: "Find Pet" });
});

app.get("/find", (req, res) => {
  res.render("find", { title: "Find Pet" });
});

app.get("/pets", (req, res) => {
  const petsData = getPetFileData();
  let nextId = 1;
  if (petsData.length > 0) {
    const lastEntry = petsData[petsData.length - 1];
    const lastId = parseInt(lastEntry.split(":")[0], 10);
    if (!isNaN(lastId)) {
      nextId = lastId + 1;
    }
  }
  // Use petsData as needed here
  const filteredPets = req.query.filteredPets
    ? JSON.parse(decodeURIComponent(req.query.filteredPets))
    : [];
  res.render("pets", { pets: filteredPets, title: "Available Pets" });
});

app.get("/privacy_statement", (req, res) => {
  res.render("privacy_statement", { title: "Privacy Statement" });
});

app.get("/newAccount", (req, res) => {
  res.render("newAccount", { title: "New Account" });
});

// Route for logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.render("logout", { title: "Logout" });
    }
  });
});
// Login route
app.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  try {
    const data = fs.readFileSync("login.txt", "utf8");
    const isValidCredentials = data.split("\n").some((line) => {
      const [storedUsername, storedPassword] = line.trim().split(":");
      return username === storedUsername && password === storedPassword;
    });

    if (isValidCredentials) {
      req.session.username = username;
      res.redirect("/giveaway"); // Redirect to the giveaway page upon successful login
    } else {
      res.status(401).send("Invalid username or password");
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Server error during login");
  }
});

// Giveaway Page Route
app.get("/giveaway", (req, res) => {
  if (req.session.username) {
    res.render("giveaway", { title: "Give Away Your Pet" });
  } else {
    res.redirect("/login");
  }
});

// Handle submission of the giveaway form
app.post("/giveaway/submit", (req, res) => {
  console.log("Session username:", req.session.username); // Check session data

  console.log("Received data:", req.body);
  if (!req.session.username) {
    console.log("No session username found, unauthorized access attempt.");

    return res.status(401).send("Unauthorized");
  }
  const filePath = path.join(__dirname, "available_pets.txt");
  const petsData = getPetFileData(); // Use the helper function to read data
  const nextId =
    petsData.length > 0
      ? parseInt(petsData[petsData.length - 1].split(":")[0]) + 1
      : 1;

  const {
    animal,
    breed,
    animalAge: age,
    animalGender: gender,
    otherDogs,
    otherCats,
    smallChildren,
    additionalInfo,
    familyName,
    givenName,
    email,
  } = req.body;
  const otherDogsValue = req.body.otherDogs || "no";
  const otherCatsValue = req.body.otherCats || "no";
  const smallChildrenValue = req.body.smallChildren || "no";

  const newPetEntry = [
    nextId,
    req.session.username,
    animal,
    breed,
    age,
    gender,
    otherDogsValue,
    otherCatsValue,
    smallChildrenValue,
    additionalInfo,
    familyName,
    givenName,
    email,
  ].join(":");

  console.log("Writing new pet entry:", newPetEntry); // Log the entry to be written
  petsData.push(newPetEntry);
  writePetFileData(petsData); // Use the helper function to write data

  res.send("Pet information saved successfully.");
});
app.post("/newAccount", (req, res) => {
  const { username, password } = req.body;
  const usernameRegex = /^[a-zA-Z0-9]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,}$/;

  if (!usernameRegex.test(username) || !passwordRegex.test(password)) {
    res.status(400).send("Invalid username or password format");
    return;
  }

  const data = fs.readFileSync("login.txt", "utf8");
  const existingUsernames = data.split("\n").map((line) => line.split(":")[0]);

  if (existingUsernames.includes(username)) {
    res
      .status(400)
      .send("Username already exists. Please choose a different username.");
    return;
  }

  fs.appendFileSync("login.txt", `${username}:${password}\n`);
  res.redirect("/login");
});
// POST route to handle search form submission
app.post("/pets", (req, res) => {
  console.log("Received search request with data:", req.body); // Log form data to verify it's correct

  const { type, breed, age, gender, otherDogs, otherCats, smallChildren } =
    req.body;
  const otherDogsValue = req.body.hasOwnProperty("otherDogs") ? "yes" : "no";
  const otherCatsValue = req.body.hasOwnProperty("otherCats") ? "yes" : "no";
  const smallChildrenValue = req.body.hasOwnProperty("smallChildren")
    ? "yes"
    : "no";

  // Read pet data from the file
  const petsData = getPetFileData();
  const defaultImages = ["pet1.png", "pet2.png", "pet3.png"];

  try {
    const filteredPets = petsData
      .filter((pet) => {
        const details = pet.split(":");
        return (
          (!type || details[2] === type) &&
          (!breed || details[3] === breed) &&
          (!age || details[4] === age) &&
          (!gender || details[5] === gender) &&
          (!otherDogs || details[6] === "yes") &&
          (!otherCats || details[7] === "yes") &&
          (!smallChildren || details[8] === "yes")
        );
      })
      .map((pet, index) => {
        const details = pet.split(":");
        const imageIndex = index % defaultImages.length; // Cycle through images if more pets than images
        return {
          type: details[2],
          breed: details[3],
          age: details[4],
          gender: details[5],
          otherDogs: details[6] === "yes",
          otherCats: details[7] === "yes",
          smallChildren: details[8] === "yes",
          image: defaultImages[imageIndex], // Reference image directly in the 'public' directory
          name: details[1],
        };
      });

    console.log("Filtered pets:", filteredPets); // Debug: Log filtered pets to console

    res.redirect(
      `/pets?filteredPets=${encodeURIComponent(JSON.stringify(filteredPets))}`
    );
  } catch (error) {
    console.error("Error filtering pets:", error);
    res.status(500).send("Error filtering pets. Please try again.");
  }
});

// This function reads the pet data from a file and converts it to an array of objects.
function getPetData() {
  const filePath = path.join(__dirname, "available_pets.txt");
  const defaultImages = ["pet1.png", "pet2.png", "pet3.png"]; // Default images list
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return data
      .split("\n")
      .filter((line) => line)
      .map((line, index) => {
        const parts = line.split(":");
        const imageIndex = index % defaultImages.length; // Cycle through images if more pets than images
        return {
          id: parts[0],
          username: parts[1],
          type: parts[2],
          breed: parts[3],
          age: parts[4],
          gender: parts[5],
          otherDogs: parts[6],
          otherCats: parts[7],
          smallChildren: parts[8],
          additionalInfo: parts[9],
          familyName: parts[10],
          givenName: parts[11],
          email: parts[12],
          image: `/images/${defaultImages[imageIndex]}`, // Assuming images are in 'public/images'
        };
      });
  } catch (err) {
    console.error("Failed to read pet data:", err);
    return [];
  }
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});
