export default function NetworkCountDisplay({
  loading,
  initialLoading,
  count,
}) {
  if (initialLoading) {
    return (
      <div
        className="h-10 bg-gray-200 rounded animate-pulse"
        style={{ width: "40px" }}
      ></div>
    );
  }

  return <p className="text-3xl font-bold text-black-600">{count}</p>;
}
