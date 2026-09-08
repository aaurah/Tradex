/**
 * Blast Mode Disabled
 * All confetti explosions and particle animations are completely removed per user request.
 */
export default function confetti(..._args: any[]): Promise<null> {
  return Promise.resolve(null);
}

export const create = () => confetti;
export const reset = () => {};
