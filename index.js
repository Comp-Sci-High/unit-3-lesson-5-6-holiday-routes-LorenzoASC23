const express = require("express")
const app = express()

app.use(express.static(__dirname + "/public"))

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
})

app.get("/christmas", (req, res) => {
  res.sendFile(__dirname + "/public/christmas.html");
})

app.listen(3000, () => {
  console.log(`Holiday Server is Running!`)
});
