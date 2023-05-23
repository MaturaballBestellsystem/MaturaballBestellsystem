const express = require("express"); //Web Server Framework
const bcrypt = require("bcrypt"); //Encrypting Passwords
const sql = require("sqlite3").verbose(); //Handling SQL Databases
const cors = require("cors"); //Handling Cross-Origin-Resource Sharing
const jwt = require("jsonwebtoken"); //Used for securely transmittion information between Server and Client

const app = express();
const bodyParser = require("body-parser"); //Used for handling POST requests
const jsonParser = bodyParser.json();


//Settings for image-upload size
const settings = require("../client/src/PROJECT_CONFIG.json");
const maxRequestBodySize = settings.image_upload_size+'mb';
app.use(express.json({ limit: maxRequestBodySize }));
app.use(express.urlencoded({ limit: maxRequestBodySize, extended: true }));

//CORS Settings
var ipserver = require("ip"); //Returns the IP of the ExpressJS Server
ip = "http://"+ipserver.address()+":3000";
console.dir ("React IP: " +  ip );

app.use(function (req, res, next) {
   res.header("Access-Control-Allow-Origin", ip);
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});
app.use(cors());


//Initialise SQL Database
const db = new sql.Database("./database.db", (err) => {
   if (err) {
      throw err;
   }
   console.log("Opening Database connection")
   // Create table for users  if needed
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
      // Check if table is emptyy
      db.get("SELECT COUNT(*) as count FROM users", [], (err, row) => {
         if (err) {
            throw err;
         }
         //Insert Admin user on if table is empty
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
   // Create table for items if needed
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

   // Create table for orders if needed
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

   // Create table for chat if needed
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
   console.log("Database connection established")
});

//Returns a JSON containing all user emails
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

//Returns a JSON containing user ID, user Email and user Name
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

//Inserts a new order into the database
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

// Returns a JSON containing all orders
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

//Switches the status of an order
app.put('/orders/:orderId/assign', (req, res) => {
   const orderId = req.params.orderId;
   const assigned = req.body.order_assigned;

   if (assigned === null || assigned === undefined) {
      res.status(400).send('Assigned value is required');
   } else {
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

//Deletes an order from the database and reduces the stock 
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

// Inserts a new chat message into the database
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

//Returns a JSON containing all chat messages, ordered my date and time
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

//Function to compare the Password to a user email using bcrypt and setting JWT if successful
app.post("/login", jsonParser, (req, res) => {
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
})

//Function for signing up using name, email and password. Inserts a new User into the database
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
         sendmailDirectly(user_em,"Registrierung erfolgreich", "<div><h3>Herzlich Willkommen "+user_nm+",  </h3><p>Deine Registrierung war erfolgreich!</p><p>Bei Fragen zur Funktionalität oder zum Login, wende dich an das Team :)</p></div>")
      })
   })
})

//Adding an item to the database and saving the thumbnail
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

//Returns a JSON containing all Items
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

//Deletes an Item from the Database by its ID
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


//Update the Password of a user by his ID
app.put("/api/changepassword", (req, res) => {
   console.log("try changing");
   const id = req.body.id;
   const pw = req.body.pw;

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
         sendmailByID(id,"Passwort zurückgesetzt", "<div><h3>Dein Passwort wurde zurückgesetzt</h3><p>Das neue Passwort lautet: "+pw+"</p></div>")
      });
   });
});

//Delete a user from the database by his ID
app.delete('/api/deleteuser', (req, res) => {
   console.log('try deleting');
   const ids = req.body.ids; // Use "ids" instead of "id" to handle multiple user IDs
   console.log(ids);
   // Delete users
   let q = `DELETE FROM users WHERE user_id IN (${ids.join()});`;
   db.run(q, [], (err) => {
      if (err) {
         console.log(err.message);
         return res.status(500).send("Error deleting users");
      }
      res.status(200).send("Users deleted successfully");
      console.log("User deleted successfully");
   });
});
 

//Change the stock of a product by its ID
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

//Mail Service 
var nodemailer = require('nodemailer');

//Function to send a mail based on the user ID
function sendmailByID(id, subject, content) {
   getMailById(id)
      .then(function(mail) {
         //authenticate at mail provider with credentials 
         var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
               user: settings.mail.username,
               pass: settings.mail.password
            }
         });
         //Path of logo
         const imagePath = '../client/src/icons/logo_banner_mail.png';

         var mailOptions = {
            from: settings.mail.username,
            to: mail,
            subject: subject,
            html: "<div style='height: fit-content; width:fit-content; border-radius: 0.5rem; border: 0.5px solid #6B7280 !important; background: #f7f7f7; padding: 20px; box-sizing: border-box; text-align:center;'><img src='cid:logo@ordertracker' style = 'width:150px; margin-bottom: 20px;' />"+content+"<br/><p style='font-weight:bold;'>LG, <br/>dein Ordertracker Team</p></div>",
            attachments: [
               {
                 filename: 'logo_banner_mail.png',
                 path: imagePath,
                 cid: 'logo@ordertracker' // Content ID, used as the image source in the email
               }
             ]
         };
         
         return transporter.sendMail(mailOptions);
      })
      .then(function(info) {
         console.log('Email sent: ' + info.response);
      })
      .catch(function(error) {
         console.log(error);
      });
}
//Function to send a mail to a mail directly
function sendmailDirectly(mail, subject, content) {
         var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
               user: settings.mail.username,
               pass: settings.mail.password
            }
         });
         const imagePath = '../client/src/icons/logo_banner_mail.png';
         var mailOptions = {
            from: settings.mail.username,
            to: mail,
            subject: subject,
            html: "<div style='height: fit-content; width:fit-content; border-radius: 0.5rem; border: 0.5px solid #6B7280 !important; background: #f7f7f7; padding: 20px; box-sizing: border-box; text-align:center;'><img src='cid:logo@ordertracker' style = 'width:150px; margin-bottom: 20px;' />"+content+"<br/><p style='font-weight:bold;'>LG, <br/>dein Ordertracker Team</p></div>",
            attachments: [
               {
                 filename: 'logo_banner_mail.png',
                 path: imagePath,
                 cid: 'logo@ordertracker' // Content ID, used as the image source in the email
               }
             ]
         };
         return transporter.sendMail(mailOptions);
         
}

//Function to return the Mail based on a user ID
function getMailById(id) {
   return new Promise((resolve, reject) => {
      // SQL query to retrieve the user email by ID
      const query = `SELECT user_em FROM users WHERE user_id = ?`;
      
      // Execute the query with the specified user ID
      db.get(query, [id], (err, row) => {
         if (err) {
            console.error(err.message);
            reject(err);
         } else {
            if (row) {
               // Resolve the promise with the user email
               resolve(row.user_em);
               console.log('User Mail found:', row.user_em);
            } else {
               console.log('User not found');
               reject(new Error('User not found'));
            }
         }
      });
   });
}




//Start listener of ExpressJS Server
var listener = app.listen(3001, () => {
      console.log('Express server started on port %s at %s', listener.address().port, ipserver.address());
});
