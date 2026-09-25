/** Retry PostgreSQL serialization conflicts; never retry validation or unique errors. */
export async function serializable(database, operation) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await database.$transaction(operation, { isolationLevel: "Serializable" });
    } catch (error) {
      if (error.code !== "P2034" || attempt >= 3) throw error;
      await new Promise(resolve => setTimeout(resolve, 10 * (2 ** attempt) + Math.floor(Math.random() * 30)));
    }
  }
}
