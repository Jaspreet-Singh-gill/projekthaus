import dotenv from "dotenv";
import app from "./app/app.js";
import { connectDB } from "./db/database.js";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT;

connectDB()
  .then(() => {
    app.listen(PORT || 3000, () => {
      console.log(`The server is listning at the port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(
      "An error has occured while connecting to the database ",
      error,
    );
    process.exit(1);
  });
