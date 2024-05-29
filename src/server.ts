import { app } from "./app";

app
  .listen({
    port: 3335,
  })
  .then(() => {
    console.log(`HTTP Server Running! in port 3335 🚀`)
  });
