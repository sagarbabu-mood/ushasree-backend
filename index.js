const express = require("express");
const path = require("path");
require("dotenv").config();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

app.use(express.json());
const dbPath = process.env.DB_FILE_PATH;

let db = null;
const PORT = process.env.PORT || 3004;

const initializeDBAndServer = async () => {
  try {
    //initializing the database
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    //running server on  3004 port
    app.listen(PORT, () => {
      console.log("Server Running at http://localhost:3004/");
    });
  } catch (e) {
    //handling exceptions
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API 1 - get all posts api
app.get("/posts/", async (request, response) => {
  const {
    offset = 0,
    limit = 15,
    order_by = "id",
    order = "ASC",
    search_q = "",
    tag = "",
  } = request.query;

  const getPostsQuery = `
    select * from posts WHERE tag LIKE '%${tag}%' and (title LIKE '%${search_q}%' or description LIKE '%${search_q}%')
    ORDER BY ${order_by} ${order}
    LIMIT ${limit} OFFSET ${offset};
    `;
  const data = await db.all(getPostsQuery);
  response.send(data);
});

//API2 - creating a post api
app.post("/post/", async (request, response) => {
  const { id, title, description, tag, imageUrl } = request.body;
  const createPostQuery = `
    INSERT INTO POSTS(id,title, description , imageUrl, tag) 
    values('${id}','${title}', '${description}' ,'${imageUrl}','${tag}' );`;

  const dbResponse = await db.run(createPostQuery);
  const postId = dbResponse.lastID;
  response.send({ postId: postId });
});
