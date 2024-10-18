export default function Loader({ cssClass }: any) {
  return (
    <div role="status" className={`lds-ellipsis ${cssClass}`}>
      <span className="sr-only">Loading...</span>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}
