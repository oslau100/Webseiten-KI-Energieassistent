import type { SigningManifest, SignatureStroke } from "./contract";
export type SigningDraft = {
  reviewed: Record<string, boolean>;
  confirmations: Record<string, boolean>;
  strokes: Record<string, SignatureStroke[]>;
};
export const emptySigningDraft = (): SigningDraft => ({ reviewed: {}, confirmations: {}, strokes: {} });
export const captureKey = (requirement: SigningManifest["requirements"][number]) =>
  JSON.stringify([requirement.participantId, requirement.capture === "person" ? "person" : requirement.id]);
export const hasDrawing = (strokes: SignatureStroke[] = []) => strokes.some(stroke =>
  stroke.length > 1 && stroke.every(point => Number.isFinite(point[0]) && Number.isFinite(point[1]) &&
    point[0] >= 0 && point[0] <= 600 && point[1] >= 0 && point[1] <= 200) && stroke.some(point => Math.hypot(point[0] - stroke[0][0], point[1] - stroke[0][1]) >= 2));
export function participantComplete(manifest: SigningManifest, draft: SigningDraft, participantId: string): boolean {
  const required = manifest.requirements.filter(r => r.participantId === participantId && r.required);
  return manifest.participants.some(p => p.id === participantId) && draft.reviewed[participantId] === true &&
    required.every(r => draft.confirmations[r.id] === true && hasDrawing(draft.strokes[captureKey(r)]));
}
/** Editing a drawing invalidates every declaration that would apply that artifact. */
export function changeDrawing(manifest: SigningManifest, draft: SigningDraft, key: string, strokes: SignatureStroke[]): SigningDraft {
  const confirmations = { ...draft.confirmations };
  for (const requirement of manifest.requirements) if (captureKey(requirement) === key) delete confirmations[requirement.id];
  return { ...draft, strokes: { ...draft.strokes, [key]: strokes }, confirmations };
}

/** Participants appearing only for optional declarations cannot block required review. */
export function requiredReviewComplete(manifest: SigningManifest, draft: SigningDraft): boolean {
  const required = manifest.requirements.filter(requirement => requirement.required);
  return required.length > 0 && required.every(requirement => participantComplete(manifest, draft, requirement.participantId));
}
