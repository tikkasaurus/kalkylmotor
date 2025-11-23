import { Router, Request, Response } from 'express'
import pool from '../db/connection.js'

const router = Router()

// GET /api/calculations - Get all calculations
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, name, project, status, amount, created, created_by as "createdBy", revision FROM calculations ORDER BY created DESC'
    )
    
    // Format the date to match the frontend format (YYYY-MM-DD)
    const calculations = result.rows.map((row) => ({
      ...row,
      created: row.created.toISOString().split('T')[0],
    }))
    
    res.json(calculations)
  } catch (error) {
    console.error('Error fetching calculations:', error)
    res.status(500).json({ error: 'Failed to fetch calculations' })
  }
})

// GET /api/calculations/:id - Get a single calculation
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      'SELECT id, name, project, status, amount, created, created_by as "createdBy", revision FROM calculations WHERE id = $1',
      [id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Calculation not found' })
    }
    
    const calculation = {
      ...result.rows[0],
      created: result.rows[0].created.toISOString().split('T')[0],
    }
    
    res.json(calculation)
  } catch (error) {
    console.error('Error fetching calculation:', error)
    res.status(500).json({ error: 'Failed to fetch calculation' })
  }
})

// POST /api/calculations - Create a new calculation
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, project, status, amount, created, createdBy, revision } = req.body
    
    const result = await pool.query(
      `INSERT INTO calculations (name, project, status, amount, created, created_by, revision)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, project, status, amount, created, created_by as "createdBy", revision`,
      [name, project, status, amount, created, createdBy, revision || null]
    )
    
    const calculation = {
      ...result.rows[0],
      created: result.rows[0].created.toISOString().split('T')[0],
    }
    
    res.status(201).json(calculation)
  } catch (error) {
    console.error('Error creating calculation:', error)
    res.status(500).json({ error: 'Failed to create calculation' })
  }
})

// PUT /api/calculations/:id - Update a calculation
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, project, status, amount, created, createdBy, revision } = req.body
    
    const result = await pool.query(
      `UPDATE calculations
       SET name = $1, project = $2, status = $3, amount = $4, created = $5, created_by = $6, revision = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING id, name, project, status, amount, created, created_by as "createdBy", revision`,
      [name, project, status, amount, created, createdBy, revision || null, id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Calculation not found' })
    }
    
    const calculation = {
      ...result.rows[0],
      created: result.rows[0].created.toISOString().split('T')[0],
    }
    
    res.json(calculation)
  } catch (error) {
    console.error('Error updating calculation:', error)
    res.status(500).json({ error: 'Failed to update calculation' })
  }
})

// DELETE /api/calculations/:id - Delete a calculation
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const result = await pool.query('DELETE FROM calculations WHERE id = $1 RETURNING id', [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Calculation not found' })
    }
    
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting calculation:', error)
    res.status(500).json({ error: 'Failed to delete calculation' })
  }
})

export default router
