import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";
dotenv.config({
  path: "./.env",
});
const port = process.env.PORT || 3001;

connectDB()
  .then(() => {
    app.listen(port, (req, res) => {
      console.log("App is runining");
    });
  })
  .catch((err) => {
    console.log(err, "Something went wrong");
    process.exit();
  });
