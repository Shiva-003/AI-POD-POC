import { HiMiniChevronLeft, HiMiniChevronRight } from "react-icons/hi2";

const Paginator = ({pageNumber, pageSize, totalItems, setSearchParams}: any) => {
    const totalPages = Math.ceil(totalItems / pageSize);

    const goToPage = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setSearchParams({
        pageNumber: newPage.toString(),
        pageSize: pageSize.toString(),
      });
    }
  };

    return <div className="mt-6 flex items-center justify-end gap-2">
        <span className="text-sm text-muted-light">
          Showing {(pageNumber - 1) * pageSize + 1} to{' '}
          {Math.min(pageNumber * pageSize, totalItems)} of{' '}
          {totalItems} results
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => goToPage(pageNumber - 1)}
            disabled={pageNumber === 1}
            className="p-2 rounded-full hover:bg-gray-200 cursor-pointer disabled:opacity-50"
          >
            <HiMiniChevronLeft size={20}/>
          </button>
          <button
            onClick={() => goToPage(pageNumber + 1)}
            disabled={pageNumber === totalPages}
            className="p-2 rounded-full hover:bg-gray-200 cursor-pointer disabled:opacity-50"
          >
            <HiMiniChevronRight size={20}/>
          </button>
        </div>
      </div>
}

export default Paginator;