import type { NextApiRequest, NextApiResponse } from 'next'
import { agregarObservaciones } from '@/lib/revisionesJuridicas'
import { authenticateRequest } from '@/lib/supabaseServer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const auth = await authenticateRequest(req.headers.authorization)
    if (!auth) return res.status(401).json({ error: 'Usuario no válido' })

    const { revisionId, observaciones } = req.body

    if (!revisionId || !observaciones) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const revision = await agregarObservaciones(revisionId, observaciones, auth.user.id, auth.client)

    return res.status(200).json({ success: true, revision })
  } catch (error) {
    console.error('Error agregando observaciones:', error)
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Error desconocido' })
  }
}
