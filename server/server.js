const express = require("express");
const bcrypt = require("bcrypt");
const sql = require("sqlite3").verbose();
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const settings = require("../client/src/PROJECT_CONFIG.json");
const maxRequestBodySize = settings.image_upload_size+'mb';

app.use(express.json({ limit: maxRequestBodySize }));
app.use(express.urlencoded({ limit: maxRequestBodySize, extended: true }));

// app.use(function (req, res, next) {
//    res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // "*"
//    // res.header("Access-Control-Allow-Origin", "http://127.0.0.1:3000"); // "*"

//    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//    next();
// });

// app.use((req, res, next) => {
//    res.header('Access-Control-Allow-Origin', '*');
//    res.header(
//      'Access-Control-Allow-Headers',
//      'Origin, X-Requested-With, Content-Type, Accept'
//    );
//    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//    next();
//  });

// const corsOptions = {
//    origin: ['http://localhost:3000', 'http://localhost:3001'],
//  };
 

app.use(function (req, res, next) {
   res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // "*"
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});

app.use(cors());


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
      // check if table is emptyy
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
      item_type INTEGER NOT NULL,
      item_name text NOT NULL UNIQUE,
      item_size text NOT NULL,
      item_sum text NOT NULL,
      item_stock INTEGER NOT NULL,
      item_img text NOT NULL
   );`;
   db.run(i, [], (err) => {
      if (err) {
         throw err;
      }
   });

   // create table for orders if needed
   let o = `CREATE TABLE IF NOT EXISTS orders (
      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_usernm text NOT NULL,
      order_itemsjson text NOT NULL,
      order_room text NOT NULL,
      order_assigned integer NOT NULL
   );`;
   db.run(o, [], (err) => {
      if (err) {
         throw err;
      }
   });

   // create table for chat if needed
   let c = `CREATE TABLE IF NOT EXISTS msg (
      msg_id INTEGER PRIMARY KEY AUTOINCREMENT,
      msg_usr text NOT NULL,
      msg_msg text NOT NULL,
      msg_time text NOT NULL,
      msg_date text NOT NULL
   );`;
   db.run(c, [], (err) => {
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

app.get("/userdata", (req, res) => {
   let q = `SELECT user_id, user_em, user_nm FROM users;`;
   db.all(q, [], (err, rows) => {
      if (err) {
         console.log(err.message);
         return res.json([]);
      }
      res.json(rows);
   });
});


app.post('/order', (req, res) => {
   const { user_nm, room_number, items } = req.body;
   const itemsJSON = JSON.stringify(items);
   db.run(`INSERT INTO orders (order_usernm, order_itemsjson, order_room, order_assigned)
           VALUES (?, ?, ?, ?)`, [user_nm, itemsJSON, room_number, 0], function (err) {
      if (err) {
         console.log(err);
         res.status(500).send('Error saving order to database');
      } else {
         res.status(200).send('Order saved to database');
      }
   });
});



// Get all orders
app.get('/orders', (req, res) => {
   db.all('SELECT * FROM orders', (err, rows) => {
      if (err) {
         console.error(err.message);
         res.status(500).send('Internal Server Error');
      } else {
         res.json(rows);
      }
   });
});

// PUT /orders/:orderId/assign
app.put('/orders/:orderId/assign', (req, res) => {
   const orderId = req.params.orderId;
   const assigned = req.body.order_assigned;

   if (assigned === null || assigned === undefined) {
      res.status(400).send('Assigned value is required');
   } else {
      // console.log(assigned);
      db.run(`UPDATE orders SET order_assigned = ? WHERE order_id = ?`, [assigned, orderId], function (err) {
         if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
         } else {
            db.get(`SELECT * FROM orders WHERE order_id = ?`, [orderId], (err, row) => {
               if (err) {
                  console.error(err.message);
                  res.status(500).send('Internal Server Error');
               } else if (!row) {
                  res.status(404).send('Order not found');
               } else {
                  res.json(row);
               }
            });
         }
      });
   }
});

// DELETE /orders/:orderId
app.delete('/orders/:orderId', (req, res) => {
   const orderId = req.params.orderId;
   db.get(`SELECT * FROM orders WHERE order_id = ?`, [orderId], (err, row) => {
      if (err) {
         console.error(err.message);
         res.status(500).send('Internal Server Error');
      } else if (!row) {
         res.status(404).send('Order not found');
      } else {
         const orderItems = JSON.parse(row.order_itemsjson);
         orderItems.forEach((item) => {
            db.run(`UPDATE items SET item_stock = item_stock - ? WHERE item_id = ?`, [item.quantity, item.item_id], function (err) {
               if (err) {
                  console.error(err.message);
                  res.status(500).send('Internal Server Error');
               }
            });
         });
         db.run(`DELETE FROM orders WHERE order_id = ?`, [orderId], function (err) {
            if (err) {
               console.error(err.message);
               res.status(500).send('Internal Server Error');
            } else {
               res.json({ message: 'Order deleted successfully' });
            }
         });
      }
   });
});


app.post('/api/postMessage', (req, res) => {
   const { user, message, time, date } = req.body;

   db.serialize(() => {
      // Insert new message into database
      db.run(`INSERT INTO msg (msg_usr, msg_msg, msg_time, msg_date)
           VALUES (?, ?, ?, ?)`, [user, message, time, date], function (err) {
         if (err) {
            console.log(err);
            res.status(500).send('Error saving message to database');
         } else {
            res.status(200).send('message saved to database');
         }
      });

      // Delete the first message if there are more than 100 messages in the database
      db.get("SELECT COUNT(*) as count FROM msg", (err, row) => {
         if (err) {
            console.log(err);
         } else if (row.count > 100) {
            db.run("DELETE FROM msg WHERE rowid = (SELECT MIN(rowid) FROM msg)");
         }
      });
   });
});


app.get('/api/getMessages', (req, res) => {
   db.all('SELECT * FROM msg ORDER BY msg_date, msg_time', (err, rows) => {
      if (err) {
         console.error(err.message);
         res.status(500).send('Error retrieving messages from database.');
      } else {
         const messages = rows.map((row) => ({
            time: row.msg_time,
            user: row.msg_usr,
            message: row.msg_msg,
            date: row.msg_date,
         }));
         res.json(messages);
      }
   });
});



app.post("/login", jsonParser, (req, res) => {
   console.log("login attempt");

   let user_em = req.body.em;
   let user_pw = req.body.pw;
   let q = `SELECT user_id, user_em, user_pw, user_nm FROM users WHERE user_em = "${user_em}";`
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
            msg: `${row.user_nm}`,
            jwt: jwt.sign({ sub: `${row.user_id}` }, "secret")
         })
      })
   })
   console.log("login end");

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


const fs = require("fs");

app.post("/additem", jsonParser, (req, res) => {
   let item_type = req.body.item_type;
   let item_name = req.body.item_name;
   let item_size = req.body.item_size;
   let item_sum = req.body.item_sum;
   let item_stock = req.body.item_stock;
   let item_img = req.body.item_img;
   let item_url = req.body.item_url;

   let base64Image = item_url.split(';base64,').pop();

   //console.log(item_url);
   fs.writeFile('../client/src/thumbnails/' + item_img, base64Image, { encoding: 'base64' }, function (err) {
      console.log(item_img);
      if (err) console.log(err.message);
      console.log('File created');
   });

   let q = `INSERT INTO items (item_type, item_name, item_size, item_sum, item_stock, item_img) VALUES ("${item_type}", "${item_name}", "${item_size}", "${item_sum}", "${item_stock}", "${item_img}");`
   db.run(q, (err) => {
      if (err) {
         console.log(err.message);
         return res.json({
            msg: "Saving item failed, try again",
         })
      }
      res.json({
         msg: "Saving successful" + item_img,
      })
   })
})


app.get("/items", (req, res) => {
   db.all("SELECT * FROM items", [], (err, rows) => {
      if (err) {
         console.log(err);
         res.status(500).send("Internal Server Error");
      } else {
         res.json(rows);
      }
   });
});

app.delete("/items/:id", (req, res) => {
   const itemId = req.params.id;
   const q = `SELECT item_img FROM items WHERE item_id = ${itemId}`;
   db.get(q, [], (err, row) => {
      if (err) {
         console.log(err.message);
         return res.json({
            msg: "Deleting item failed, try again",
         });
      }
      const img = row.item_img;
      const path = `../client/src/thumbnails/${img}`;
      fs.unlink(path, (err) => {
         if (err) {
            console.log(err.message);
            return res.json({
               msg: "Deleting thumbnail failed, try again",
            });
         }
         console.log("Thumbnail deleted successfully");
      });
      const q2 = `DELETE FROM items WHERE item_id = ${itemId}`;
      db.run(q2, [], (err) => {
         if (err) {
            console.log(err.message);
            return res.json({
               msg: "Deleting item failed, try again",
            });
         }
         res.json({
            msg: "Item deleted successfully",
         });
      });
   });
});



app.put("/api/changepassword", (req, res) => {
   console.log("try changing");
   const id = req.body.id;
   const pw = req.body.pw;

   // Update user password
   bcrypt.hash(pw, 14, (err, hash_pw) => {
      if (err) {
         console.log(err.message);
         return res.status(500).send("Error updating user password");
      }
      let q = `UPDATE users SET user_pw = "${hash_pw}" WHERE user_id = ${id};`;
      db.run(q, [], (err) => {
         if (err) {
            console.log(err.message);
            return res.status(500).send("Error updating user password");
         }
         res.status(200).send("User password updated successfully");
      });
   });
});


app.delete("/api/deleteuser", (req, res) => {
   console.log("try changing");
   const id = req.body.id;
   console.log(id);
   // Delete user
   let q = `DELETE FROM users WHERE user_id = ${id};`;
   db.run(q, [], (err) => {
      if (err) {
         console.log(err.message);
         return res.status(500).send("Error deleting user");
      }
      res.status(200).send("User deleted successfully");
   });

})

app.put('/api/changestock', (req, res) => {
   const { item_id, item_type, item_name, item_size, item_sum, item_stock, item_img } = req.body;
   const id = item_id;
   const sql = `UPDATE items SET item_type = ?, item_name = ?, item_size = ?, item_sum = ?, item_stock = ?, item_img = ? WHERE item_id = ?`;
 
   db.run(sql, [item_type, item_name, item_size, item_sum, item_stock, item_img, id], function(err) {
     if (err) {
       console.error(err.message);
       res.status(500).send('Internal server error');
     } else {
       console.log(`Row(s) updated: ${this.changes}`);
       res.json({ message: `Stock for item ${id} updated successfully.` });
     }
   });
 });





// app.listen(3001, () => console.log("Server started on port 3001"));
// app.listen(3001, '0.0.0.0'); // or server.listen(3001, '0.0.0.0'); for all interfaces
var listener = app.listen(3001, () => {
    console.log('Express server started on port %s at %s', listener.address().port, listener.address().address);
});
