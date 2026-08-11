export default function Loading() {
  return (
    <main className="loading-page" aria-busy="true" aria-live="polite">
      <div className="loading-status">
        <p>{"// SYSTEM / LOADING_RESOURCE"}</p>
        <p>PLEASE STAND BY</p>
      </div>
      <div className="loading-word" aria-hidden="true">
        LOADING.
      </div>
      <div className="loading-track" aria-hidden="true">
        <span />
      </div>
    </main>
  );
}
