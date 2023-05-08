// const express = require('express');
// const app = express();

// app.get("/api", (req, res) => {
//     res.json({"users": ["userOne", "userTwo", "userThree"] })
//     //const json = fetch('https://jsonplaceholder.typicode.com/todos/1').then(res => res.json())

// })

// app.listen(4000, () => { console.log("Server started on port 4000") }) //Client port 3000

const express  = require("express");
const bcrypt   = require("bcrypt");
const sql      = require("sqlite3").verbose();
const cors     = require("cors");
const jwt      = require("jsonwebtoken");

const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "localhost:3001"); // "*"
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(cors());

const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();




const db = new sql.Database("./database.db", (err) => {
   if (err) {
      throw err;
   }
   console.log("opening db connection")
   // create table for users  if needed
   let s = `CREATE TABLE IF NOT EXISTS users (
               user_id INTEGER PRIMARY KEY AUTOINCREMENT,
               user_em text NOT NULL UNIQUE,
               user_pw text NOT NULL,
               user_nm text NOT NULL
            );`;
   db.run(s, [], (err) => {
      if (err) {
         throw err;
      }
      // check if table is empty
      db.get("SELECT COUNT(*) as count FROM users", [], (err, row) => {
         if (err) {
            throw err;
         }
         if (row.count === 0) {
            bcrypt.hash("root", 14, (err, hash_pw) => {
               let q = `INSERT INTO users (user_em, user_pw, user_nm) VALUES ("admin", "${hash_pw}", "Admin");`
               db.run(q, (err) => {
                  if (err) {
                     console.log(err.message);
                  }
               })
            })
         }
      });
   });
   // create table for items if needed
   let i = `CREATE TABLE IF NOT EXISTS items (
      item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_type text NOT NULL,
      item_name text NOT NULL UNIQUE,
      item_size text NOT NULL,
      item_sum text NOT NULL,
      item_stock INTEGER NOT NULL
   );`;
   db.run(i, [], (err) => {
      if (err) {
         throw err;
      }
   });
});


app.get("/users", (req, res) => {
   let q = `SELECT user_em FROM users;`;
   db.all(q, [], (err, rows) => {
      if (err) {
         console.log(err.message);
         return res.json([]);
      }
      res.json(rows);
   });
});

app.post("/login", jsonParser, (req, res) => {
   let user_em = req.body.em;
   let user_pw = req.body.pw;
   let q = `SELECT user_id, user_em, user_pw FROM users WHERE user_em = "${user_em}";`
   // get user from db
   db.get(q, (err, row) => {
      // db error
      if (err) {
         console.log(err.message);
         return res.json({
            msg: "login failed, try again",
            jwt: ""
         })
      }
      // user not in db
      if (!row) {
         return res.json({
            msg: `login failed. no user '${user_em}' in db. try again`,
            jwt: ""
         })
      }
      // bccrypt.compare
      bcrypt.compare(user_pw, row.user_pw, (err, same) => {
         if (err) {
            console.log(err.message);
            return res.json({
               msg: "login failed, try again",
               jwt: ""
            })
         }
         // wrong pw
         if (!same) {
            return res.json({
               msg: "login failed - incorrect password. check for typos and try again",
               jwt: ""
            })
         }
         res.json({
            msg: `logged in as '${row.user_em}'`,
            jwt: jwt.sign({ sub: `${row.user_id}` }, "secret")
         })
      })
   })
})


app.post("/signup", jsonParser, (req, res) => {

   let user_nm = req.body.nm;
   let user_em = req.body.em;
   let user_pw = req.body.pw;
   bcrypt.hash(user_pw, 14, (err, hash_pw) => {
      let q = `INSERT INTO users (user_em, user_pw, user_nm) VALUES ("${user_em}", "${hash_pw}", "${user_nm}");`
      db.run(q, (err) => {
         if (err) {
            console.log(err.message);
            return res.json({
               msg: "signup failed, try again",
               jwt: ""
            })
         }
         res.json({
            msg: "signup successful",
            jwt: jwt.sign({ sub: `${this.lastID}` }, "secret")
         })
      })
   })
})

app.listen(3001, () => console.log("Server started on port 3001"));

// process.on("exit", () => {
//    db.close((err) => {
//       if (err) {
//          throw err
//       }
//       console.log("closing db connection")
//    })
// })