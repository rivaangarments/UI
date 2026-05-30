export default function Loader({ count = 4 }) {
  return (
    <div className="loader-grid" aria-label="Loading content">
      {Array.from({ length: count }).map((_, index) => (
        <div className="skeleton-card" key={index}>
          <span />
          <b />
          <i />
        </div>
      ))}
    </div>
  );
}
