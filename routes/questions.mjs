import { Router } from "express";
import connectionPool from "../utils/db.mjs";
const questionsRouter = Router();

questionsRouter.post("/", async (req, res) => {
  const { title, description, category } = req.body;

  const newQuestion = {
    title,
    description,
    category,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    await connectionPool.query(
      `INSERT INTO questions (title, description, category, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        newQuestion.title,
        newQuestion.description,
        newQuestion.category,
        newQuestion.createdAt,
        newQuestion.updatedAt,
      ]
    );
    return res.status(201).json({
      Created: "Question created successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      BadRequest: "Missing or invalid request data",
    });
  }
});

questionsRouter.get("/", async (req, res) => {
  const { title, category } = req.query;
  let query = "SELECT * FROM questions WHERE 1=1";
  const queryParams = [];

  if (title) {
    query += " AND title ILIKE $1";
    queryParams.push(`%${title}%`);
  }

  if (category) {
    query += title ? " AND category = $2" : " AND category = $1";
    queryParams.push(category);
  }

  try {
    const result = await connectionPool.query(query, queryParams);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      BadRequest: "Invalid query parameters",
    });
  }
});

questionsRouter.get("/:id", async (req, res) => {
  const questionId = req.params.id;
  try {
    const question = await connectionPool.query(
      `SELECT * FROM questions WHERE id = $1`,
      [questionId]
    );

    if (question.rows.length === 0) {
      return res.status(404).json({
        NotFound: "Question not found",
      });
    }

    return res.status(200).json({
      data: question.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to retrieve question",
    });
  }
});

questionsRouter.put("/:id", async (req, res) => {
  const questionId = req.params.id;
  const { title, description, category } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({
      BadRequest: "Missing or invalid request data",
    });
  }

  try {
    const existingQuestion = await connectionPool.query(
      `SELECT * FROM questions WHERE id = $1`,
      [questionId]
    );

    if (existingQuestion.rows.length === 0) {
      return res.status(404).json({
        NotFound: "Question not found",
      });
    }

    await connectionPool.query(
      `UPDATE questions SET title = $1, description = $2, category = $3, updated_at = $4 WHERE id = $5`,
      [title, description, category, new Date(), questionId]
    );

    return res.status(200).json({
      OK: "Successfully updated the question.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error:
        "Server could not update question due to database connection error",
    });
  }
});

questionsRouter.delete("/:id", async (req, res) => {
  const questionId = req.params.id;

  try {
    const result = await connectionPool.query(
      `DELETE FROM questions WHERE id = $1`,
      [questionId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        NotFound: "Question not found.",
      });
    }

    return res.status(200).json({
      OK: "Successfully deleted the question",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message:
        "Server could not delete question because of database connection error",
    });
  }
});

export default questionsRouter;
