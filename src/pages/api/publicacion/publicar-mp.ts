import { NextRequest, NextResponse } from 'next/server'
import { publicarEnMercadoPublico } from '@/lib/mercadoPublicoService'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { decretoId, basesId, titulo, presupuesto, plazo } = await req.json()

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      token
    )
    if (userError || !user)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const publicacion = await publicarEnMercadoPublico(
      decretoId,
      basesId,
      titulo,
      presupuesto,
      plazo
    )

    return NextResponse.json({ success: true, publicacion })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    )
  }
}
