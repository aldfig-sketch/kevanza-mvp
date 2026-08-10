import type { NextApiRequest, NextApiResponse } from 'next'
import { aprobarBases } from '@/lib/revisionesJuridicas'
import { authenticateRequest } from '@/lib/supabaseServer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const auth = await authenticateRequest(req.headers.authorization)
    if (!auth) return res.status(401).json({ error: 'Usuario no válido' })

    const { revisionId } = req.body

    if (!revisionId) {
      return res.status(400).json({ error: 'Missing revisionId' })
    }

    const revision = await aprobarBases(revisionId, auth.user.id, auth.client)

    return res.status(200).json({ success: true, revision })
  } catch (error) {
    console.error('Error aprobando bases:', error)
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Error desconocido' })
  }
}
