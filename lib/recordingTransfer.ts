/**
 * Utility for transferring video recording blobs between pages during client-side navigation.
 * Since blobs cannot be stored in sessionStorage, we use a module-level variable.
 */

let pendingRecordingBlob: Blob | null = null;

export function setPendingRecording(blob: Blob) {
  pendingRecordingBlob = blob;
}

export function getPendingRecording(): Blob | null {
  const blob = pendingRecordingBlob;
  pendingRecordingBlob = null; // Clear after retrieval
  return blob;
}
