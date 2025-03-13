const express = require("express");
const { Sequelize } = require("sequelize");
const config = require("./config");

const app = express();

// Set up Sequelize
const sequelize = new Sequelize("postgresql://postgres:TH@localhost/t_h", {
  dialect: "postgres",
  logging: false,
});
app.use(express.json());

// AWS S3 Configuration
app.locals.S3_BUCKET = "S3_BUCKET_NAME";
app.locals.S3_KEY = "AWS_ACCESS_KEY";
app.locals.S3_SECRET = "AWS_ACCESS_SECRET";
app.locals.S3_LOCATION = "http://{}.s3.amazonaws.com/";

// Import models
//const { Task, TaskFrequency } = require("./src/models/task_model_v2");
//const { User } = require("./src/models/user_model");

// Sync Database
sequelize.sync().then(() => {
  console.log("Database synchronized");
});

// Import routes
// const messagesRoutes = require("./src/routes/messages");
// const reportsRoutes = require("./src/routes/reports");
// const onboardingRoutes = require("./src/routes/onboarding");
// const notificationsRoutes = require("./src/routes/notifications");
//const usersRoutes = require("./src/routes/users");
// const homepageRoutes = require("./src/routes/homepage");
// const performanceMetricsRoutes = require("./src/routes/performance_metrics");
// const tasksRoutes = require("./src/routes/tasks");
// const masterUserRoutes = require("./src/routes/master_user");
// const exportImportRoutes = require("./src/routes/export_import");
// const institutionsRoutes = require("./src/routes/institutions");
// const baseRoutes = require("./src/routes/base");
// const apprenticeRoutes = require("./src/routes/apprentice");
const clusterRoutes = require("./src/routes/Cluster");
// const armyUnitsRoutes = require("./src/routes/army_units");
// const hadarPlanSessionRoutes = require("./src/routes/hadar_plan_session");
// const searchEntRoutes = require("./src/routes/search_ent");
// const cityRoutes = require("./src/routes/city");
// const giftRoutes = require("./src/routes/gift");

// Register routes
// app.use("/messages", messagesRoutes);
// app.use("/reports", reportsRoutes);
// app.use("/onboarding", onboardingRoutes);
// app.use("/notifications", notificationsRoutes);
//app.use("/users", usersRoutes);
// app.use("/homepage", homepageRoutes);
// app.use("/performance_metrics", performanceMetricsRoutes);
// app.use("/tasks", tasksRoutes);
// app.use("/master_user", masterUserRoutes);
// app.use("/export_import", exportImportRoutes);
// app.use("/institutions", institutionsRoutes);
// app.use("/base", baseRoutes);
// app.use("/apprentice", apprenticeRoutes);
app.use("/cluster", clusterRoutes);
// app.use("/army_units", armyUnitsRoutes);
// app.use("/hadar_plan_session", hadarPlanSessionRoutes);
// app.use("/search_ent", searchEntRoutes);
// app.use("/city", cityRoutes);
// app.use("/gift", giftRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
