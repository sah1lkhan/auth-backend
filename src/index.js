import dotenv from "dotenv";
import { db_Connection } from "./db/index.js";
import { app } from "./app.js";

dotenv.config();

const port = process.env.PORT || 3000;

db_Connection()
  .then(() =>
    app.listen(port, () => {
      console.log("app is running on:", port);
    })
  )
  .catch((error) => {
    console.log(
      "Connection failed while connecting the server :",
      error.message
    );
  });
