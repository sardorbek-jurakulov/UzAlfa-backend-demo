const express = require('express');
const app = express();
const { pool } = require('./dbConfig');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');

const PORT = process.env.PORT || 4000;

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: false}));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
}));
app.use(flash());
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/users/register', (req, res) => {
  res.render('register');
});

app.get('/users/login', (req, res) => {
  res.render('login');
});

app.get('/users/dashboard', (req, res) => {
  res.render('dashboard', { user: "Conor" });
});

app.post('/users/register', async (req, res) => {
  let { name, email, password, password2 } = req.body;

  let errors = [];

  if(!name || !email || !password || !password2) {
    errors.push({message: "Please enter all fields!"});
  }

  if(password.length < 6) {
    errors.push({message: "Password should be at leasr 6 characters"});
  }

  if(password !== password2) {
    errors.push({message: "Passwords do not match"});
  }

  if(errors.length > 0) {
    res.render('register', { errors });
  } else {
      // Form validation has passed
      let hashedPassword = await bcrypt.hash(password, 10);
      pool.query(
        `SELECT * FROM users WHERE email = $1`, [email], (err, results) => {
          if (err) {
            throw err
          }
          if(results.rows.length > 0) {
            errors.push({message: "Email already registered"});
            res.render('register', { errors });
          } else {
            pool.query(
              `INSERT INTO users (name, email, password)
              VALUES ($1, $2, $3)
              RETURNING id, password`, [name, email, hashedPassword], (err, result) => {
                if (err) {
                  throw err;
                }
                console.log(results.rows);
                req.flash('success_msg', "You are now registered. Please log in");
                res.redirect('/users/login');
              }
            )
          }
        }
      );
    }
});

app.get('/users/logout', (req, res) => {
    console.log(req);
    res.render('login');
});

app.listen(PORT, ()=>{
  console.log(`Server on port ${PORT}`)
})