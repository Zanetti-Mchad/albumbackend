const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const roleRoutes = require("./routes/roleRoutes");
const permissionRoutes = require("./routes/permissionRoutes");
const intergrationRoutes = require("./routes/intergrationRoutes");
const logsRoutes = require('./routes/logsRoutes');
const logoutRoutes = require('./routes/logoutRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const albumRoutes = require('./routes/albumRoutes');
const responseFormatter = require("./middlewares/responseFormatter");


dotenv.config();
const app = express();
app.use(morgan("dev"));
app.use(responseFormatter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', err);
  res.status(500).json({ status: { returnCode: 500, returnMessage: err.message || 'Internal server error' } });
});

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization"
	);
	next();
});

app.use(express.json());
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/permissions", permissionRoutes);
app.use("/api/v1/integration", intergrationRoutes);
app.use('/api/v1/logs', logsRoutes);
app.use('/api/v1/logout', logoutRoutes);
app.use('/api/v1/albums', albumRoutes);
if (require.main === module) {
	const PORT = process.env.PORT || 4210;
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
}

module.exports = app;
