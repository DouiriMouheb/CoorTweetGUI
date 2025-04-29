export default function TableRowSkeleton() {
  return (
    <tr className="animate-[pulse_1s_ease-in-out_infinite]">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-400 rounded w-3/4"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-400 rounded w-3/4"></div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end space-x-4">
          <div className="h-5 w-5 bg-gray-400 rounded-full"></div>
          <div className="h-5 w-5 bg-gray-400 rounded-full"></div>
        </div>
      </td>
    </tr>
  );
}
