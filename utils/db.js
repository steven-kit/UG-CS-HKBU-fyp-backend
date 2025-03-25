const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

const mongoURI = process.env.MONGODB_URI || "mongodb://steven-se:bSdXINUORgMUDi2YXPUGeF6kqmOuHQIRvBjV7gfgNi6UPdQxhzlN02U83nz2IfAqdwPt2gbhaCHiACDbXtExGg%3D%3D@steven-se.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@steven-se@";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

module.exports = mongoose;