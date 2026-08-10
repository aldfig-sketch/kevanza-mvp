import type { NextApiRequest, NextApiResponse } from 'next'
import { agregarObservaciones } from '@/lib/revisionesJuridicas'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: user, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const { revisionId, observaciones } = req.body

    if (!revisionId || !observaciones) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const revision = await agregarObservaciones(revisionId, observaciones, user.user.id)

    return res.status(200).json({ success: true, revision })
  } catch (error) {
    console.error('Error agregando observaciones:', error)
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Error desconocido' })
  }
}
