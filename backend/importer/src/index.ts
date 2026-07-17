import { FirestoreService } from "./firestore/service.js";

async function main(): Promise<void> {
  console.log("");
  console.log("================================");
  console.log(" SutraSparsh Import Engine");
  console.log("================================");
  console.log("");

  try {
    const firestore = new FirestoreService();

    console.log("✅ Firebase initialized");
    console.log("");

    console.log("Top-level collections:");
    console.log("----------------------");

    const collections = await firestore.listCollections();

    if (collections.length === 0) {
      console.log("(No collections found)");
    } else {
      collections.forEach((collection) => {
        console.log(`• ${collection}`);
      });
    }

    console.log("");
    console.log("Sprint 2.2 – Phase C completed.");

  } catch (error) {
    console.error("");
    console.error("❌ Firestore read failed");
    console.error("");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exit(1);
  }
}

main();