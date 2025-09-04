import app from "./app.js";
import {connectDB} from "./db/connection.js";


connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error connecting to database: ", error);
    throw new Error("Failed to start the server due to database connection error");
  });


