import Loading from "../loading";

export default function LoadingPreviewPage() {
  return (
    <div className="loading-preview">
      <Loading />
      <a className="loading-preview-exit cursor-pointer" href="/">
        EXIT PREVIEW
      </a>
    </div>
  );
}
