const express = require('express')
const faker = require('faker')
const path = require('path')
const cors = require('cors')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken') // to generate tokens
const expressJwt = require('express-jwt') // to verify tokens

const PORT = process.env.PORT || 3001;

const app = express()

const jwtSecret = 'sdfsd6f9sd8f79sd8f7s9d8f7'

const user = {
	username: 'juanma',
	password: '12345'
}

app.use( cors() )
app.use( bodyParser.json() )
app.use( express.static( path.join(__dirname, 'public') )  )
app.use( expressJwt({ secret: jwtSecret, }).unless({ path: ['/login'] }) )

app.get('/random-user', (req,res) => {
	const user = faker.helpers.userCard();
	user.avatar = faker.image.avatar();
	res.json(user)
})

app.get('/me', (req, res) => {
	res.send(req.user)
})

app.post('/login', authenticate, (req, res) => {
	const { username } = user;
	const token = jwt.sign({ username }, jwtSecret)
	res.send({ token, user })
})



app.listen(PORT, () => console.log(`Listening on port ${PORT}...`))

// UTIL FUNCTIONS

function authenticate(req, res, next) {
	const { username, password } = req.body
	if ( !username && !password) {
		res.status(400).end('Must provide username or password');
	}
	if ( username != user.username || password != user.password ) {
		res.status(401).end('Username or password incorrect');
	}
	next();

}