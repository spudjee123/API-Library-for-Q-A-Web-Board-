// Create PostgreSQL Connection Pool here !
import * as pg from "pg";
const { Pool } = pg.default;

const connectionPool = new Pool({
  connectionString: "postgresql://postgres:25432521@localhost:5432/backend",
});

export default connectionPool;
