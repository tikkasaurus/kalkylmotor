import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pool from './connection.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function migrate() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf-8')
    
    console.log('Running database migration...')
    await pool.query(schema)
    console.log('Database migration completed successfully!')
    
    // Insert sample data if tables are empty
    const result = await pool.query('SELECT COUNT(*) FROM calculations')
    const count = parseInt(result.rows[0].count)
    
    if (count === 0) {
      console.log('Inserting sample data...')
      const sampleData = `
        INSERT INTO calculations (name, project, status, amount, created, created_by, revision)
        VALUES
          ('Tosito, Nässjö: Centrallager Trafikverket', 'Marcus Test', 'Aktiv', '217 475 390 kr', '2025-01-05', 'Gustaf', NULL),
          ('Industri Norrköping', 'Industri Norrköping', 'Aktiv', '145 890 000 kr', '2025-01-10', 'Maria Johansson', 'Rev 3'),
          ('Villa Lindgren - Huvudkalkyl', 'Villa Lindgren', 'Aktiv', '8 450 000 kr', '2025-01-03', 'Anna Svensson', NULL),
          ('Kontorsbyggnad AB - Anbud', 'Kontorsbyggnad', 'Aktiv', '32 150 000 kr', '2024-12-20', 'Erik Andersson', NULL),
          ('Ombyggnad radhus', 'Radhus Malmö', 'Avslutad', '4 225 000 kr', '2024-11-28', 'Peter Nilsson', NULL);
      `
      await pool.query(sampleData)
      console.log('Sample data inserted successfully!')
    }
    
    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

migrate()
