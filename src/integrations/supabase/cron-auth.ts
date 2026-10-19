// Self-hosted cron authentication. Set CRON_SECRET to a long random value and
// have your external scheduler (cron-job.org, GitHub Actions, host cron, …)
// call the reminders hook with `Authorization: Bearer <CRON_SECRET>`.
export async function authenticateCronRequest(
  request: Request,
): Promise<Response | null> {
  const secret = process.env['CRON_SECRET']

  if (!secret) {
    return new Response('Server configuration error', { status: 500 })
  }

  const match = /^Bearer ([^\s,]+)$/.exec(
    request.headers.get('authorization') ?? '',
  )
  const token = match?.[1]
  if (!token) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { createHash, timingSafeEqual } = await import('node:crypto')
  const digest = (value: string) =>
    createHash('sha256').update(value, 'utf8').digest()
  const providedDigest = digest(token)

  if (!timingSafeEqual(providedDigest, digest(secret))) {
    return new Response('Unauthorized', { status: 401 })
  }

  return null
}
