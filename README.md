# auth-service
Microservicio para autenticación y gestión de usuarios. 

### Paso 1: Preparar el Repositorio y Entorno de Desarrollo

1. **Crear un Repositorio Separado**: Crea un repositorio Git para el microservicio de autenticación, por ejemplo, `auth-service`.
2. **Definir el Entorno de Desarrollo**:
   - Utilizaremos **Node.js** con **Express** como framework.
   - Instala Node.js si no lo tienes.
   - En el directorio del microservicio, inicializa el proyecto:
     ```bash
     mkdir auth-service
     cd auth-service
     npm init -y
     ```

3. **Instalar Dependencias Básicas**:
   - **Express**: Framework de backend.
   - **jsonwebtoken**: Para generar y validar JWTs.
   - **bcryptjs**: Para hashear contraseñas.
   - **dotenv**: Para gestionar variables de entorno.
   - **mongoose** (opcional, si usas MongoDB) para la base de datos.
     ```bash
     npm install express jsonwebtoken bcryptjs dotenv mongoose
     ```

### Paso 2: Configurar Variables de Entorno

1. Crea un archivo `.env` en la raíz de tu microservicio y define las variables:
   ```plaintext
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   DB_CONNECTION=mongodb://localhost:27017/authService
   ```

2. Crea un archivo `config.js` para cargar estas variables:
   ```javascript
   require('dotenv').config();

   module.exports = {
     port: process.env.PORT || 5000,
     jwtSecret: process.env.JWT_SECRET,
     dbConnection: process.env.DB_CONNECTION
   };
   ```

### Paso 3: Configurar la Conexión a la Base de Datos

Usaremos MongoDB para almacenar los usuarios y sus roles. Crea un archivo `db.js` para manejar la conexión:

```javascript
const mongoose = require('mongoose');
const { dbConnection } = require('./config');

const connectDB = async () => {
  try {
    await mongoose.connect(dbConnection, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('DB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Paso 4: Crear el Modelo de Usuario

En el directorio `models`, crea un archivo `User.js` para definir el esquema de usuario:

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'supervisor', 'operator'], default: 'operator' }
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
```

### Paso 5: Crear Controladores de Autenticación y Gestión de Usuarios

En `controllers`, crea un archivo `authController.js` con funciones para registrar, autenticar y gestionar roles de usuarios.

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwtSecret } = require('../config');

const register = async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const user = new User({ username, password, role });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ message: 'User registration failed', error });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user && await user.matchPassword(password)) {
      const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Login failed', error });
  }
};

module.exports = { register, login };
```

### Paso 6: Configurar las Rutas

Crea un archivo `authRoutes.js` en `routes`:

```javascript
const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

module.exports = router;
```

### Paso 7: Crear y Configurar el Servidor

En el archivo principal `server.js`, configura Express para manejar las rutas y conectarse a la base de datos:

```javascript
const express = require('express');
const connectDB = require('./db');
const { port } = require('./config');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Start Server
connectDB();
app.listen(port, () => console.log(`Auth Service running on port ${port}`));
```

### Paso 8: Probar el Microservicio

1. **Registrar un Usuario**: Envía una solicitud POST a `/api/auth/register` con `username`, `password`, y `role` en el cuerpo de la solicitud.
2. **Iniciar Sesión**: Envía una solicitud POST a `/api/auth/login` con `username` y `password` para recibir un token JWT que puedes usar para autenticar a los usuarios en otros microservicios.

Este microservicio puede ahora operar de forma autónoma, proporcionando servicios de autenticación y gestión de usuarios. A medida que avanzas, puedes implementar middleware para validar JWT y gestionar permisos en función del rol del usuario.
