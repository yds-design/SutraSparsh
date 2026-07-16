import { getFirestore } from "./firestore/client.js";

async function main() {
  console.log("");
  console.log("================================");
  console.log("SutraSparsh Import Engine");
  console.log("================================");
  console.log("");

  try {
    const db = getFirestore();

    console.log("✅ Firebase initialized");

    console.log("Project:");

    console.log(db.app.options.projectId);

    console.log("");

    console.log("Firestore client ready.");

  } catch (error) {

    console.error("");

    console.error("Initialization failed");

    console.error(error);

  }
}

main();