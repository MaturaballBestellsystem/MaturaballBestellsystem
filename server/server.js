const express = require('express');
const app = express();

app.get("/api", (req, res) => {
    res.json({"users": ["userOne", "userTwo", "userThree"] })
    //const json = fetch('https://jsonplaceholder.typicode.com/todos/1').then(res => res.json())

})

app.listen(4000, () => { console.log("Server started on port 4000") }) //Client port 3000