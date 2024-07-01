export default function TableNavigation({ table }) {
    return (
        <nav className="flex w-full  justify-between mt-5 ">
            <span className="flex items-center gap-1">
                <div>Page</div>
                <strong>
                    {table.getState().pagination.pageIndex + 1} of{' '}
                    {table.getPageCount().toLocaleString()}
                </strong>
            </span>
            <span className="flex">
                <span className=" self-end ">
                    <button
                        onClick={() => table.firstPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="p-1 m-1 bg-gray-700 cursor-pointer text-white rounded-md hover:bg-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {'<<'}
                    </button>
                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="p-1 m-1 bg-gray-700 cursor-pointer text-white rounded-md hover:bg-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {'<'}
                    </button>
                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="p-1 m-1 bg-gray-700 cursor-pointer text-white rounded-md hover:bg-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {'>'}
                    </button>
                    <button
                        className="p-1 m-1 bg-gray-700 cursor-pointer text-white rounded-md hover:bg-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        onClick={() => table.lastPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        {'>>'}
                    </button>
                </span>
                <span className="flex items-center gap-1">
                    | Go to page:
                    <input
                        type="number"
                        defaultValue={table.getState().pagination.pageIndex + 1}
                        onChange={e => {
                            const page = e.target.value ? Number(e.target.value) - 1 : 0
                            table.setPageIndex(page)
                        }}
                        className="border p-1 rounded w-16"
                    />
                </span>
                <select
                    value={table.getState().pagination.pageSize}
                    onChange={e => {
                        table.setPageSize(Number(e.target.value))
                    }}
                >
                    {[10, 20, 30, 40, 50].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
            </span>

        </nav>
    )
}