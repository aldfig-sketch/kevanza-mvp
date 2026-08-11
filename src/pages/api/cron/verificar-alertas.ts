import type { NextApiRequest, NextApiResponse } from 'next'
import { verificarYGenerarAlertas } from '@/lib/alertasService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!['GET', 'POST'].includes(req.method || '')) return res.status(405).json({ error: 'Method not allowed' })

  const secret = process.env.CRON_SECRET
  const authorization = req.headers.authorization || ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : req.headers['x-cron-token']
  if (!secret || token !== secret) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const result = await verificarYGenerarAlertas()
    return res.status(200).json({ success: true, ...result })
  } catch (error) {
    console.error('Error verificando alertas:', error)
    return res.status(500).json({ error: 'No se pudieron verificar las alertas' })
  }
}
