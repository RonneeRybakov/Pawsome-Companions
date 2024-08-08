const express = require("express");
const app = express();

//Function: findSummation
function findSummation(N) {
  if (typeof N !== "number" || N < 1 || !Number.isInteger(N)) {
    return false;
  }

  let summation = 0;
  for (let i = 1; i <= N; i++) {
    summation += i;
  }
  return summation;
}

//Function: uppercaseFirstandLast
function uppercaseFirstandLast(str) {
  return str
    .split(" ")
    .map((word) => {
      if (word.length > 1) {
        return (
          word[0].toUpperCase() +
          word.slice(1, -1) +
          word[word.length - 1].toUpperCase()
        );
      } else {
        return word.toUpperCase();
      }
    })
    .join(" ");
}

//Function: findAverageAndMedian
function findAverageAndMedian(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return false;
  }
  arr.sort((a, b) => a - b);

  const sum = arr.reduce((acc, curr) => acc + curr, 0);
  const average = sum / arr.length;
  const median =
    arr.length % 2 === 0
      ? (arr[arr.length / 2 - 1] + arr[arr.length / 2]) / 2
      : arr[Math.floor(arr.length / 2)];

  return [average, median];
}

//Function: find4Digits
function find4Digits(numbersStr) {
  const numbers = numbersStr.split(" ").map(Number);
  for (let i = 0; i < numbers.length; i++) {
    if (numbers[i] >= 1000 && numbers[i] <= 9999) {
      return numbers[i];
    }
  }
  return false;
}

app.use(express.urlencoded({ extended: true }));

//Route for findSummation
app.get("/findSummation", (req, res) => {
  const num = parseInt(req.query.num);
  const result = findSummation(num);
  if (result === false) {
    res.send("Invalid input. Please enter a valid positive integer. ");
  } else {
    res.send(`Summation of positive integers up to ${num} is ${result}. `);
  }
});

//Route for uppercaseFirstandLast function
app.get("/uppercaseFirstandLast", (req, res) => {
  const str = req.query.str;
  const result = uppercaseFirstandLast(str);
  res.send(result);
});

//Route for findAverageAndMedian function
app.get("/findAverageAndMedian", (req, res) => {
  const numbers = req.query.numbers.split(",").map(Number);
  const result = findAverageAndMedian(numbers);
  if (result === false) {
    res.send("Invalid input. Enter an array of numbers.");
  } else {
    res.send(`Average is: ${result[0]}, Median is: ${result[1]}`);
  }
});

//Route for find4Digits
app.get("/find4Digits", (req, res) => {
  const numStr = req.query.numStr;
  const result = find4Digits(numStr);
  if (result === false) {
    res.send("There is no four-digit number in the given string.");
  } else {
    res.send(`The first four-digit number is: ${result}`);
  }
});
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
