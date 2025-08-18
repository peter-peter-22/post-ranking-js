import { connect } from "apache-ignite-client";

// Define your row type
interface Post {
  id: number;
  user_id: number;
  text: string;
  created_at: string;
}

async function run() {
  const db = await connect({ host: "127.0.0.1", port: 10800 });

  // Fully typed query
  const posts = await db.query<Post>(
    "SELECT id, user_id, text, created_at FROM Post WHERE user_id = ? LIMIT 10",
    [42]
  );

  posts.forEach(p => {
    console.log(p.id, p.text); // type-checked
  });

  await db.close();
}

run()