// components/pagination/Pagination.tsx
'use client'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange
}: PaginationProps) {
  const pages: (number | '...')[] = []

  // 计算显示的页码
  if (totalPages <= 7) {
    // 如果总页数少于等于 7，显示所有页码
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // 总是显示第一页
    pages.push(1)

    if (currentPage > 3) {
      pages.push('...')
    }

    // 显示当前页附近的页码
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i)
      }
    }

    if (currentPage < totalPages - 2) {
      pages.push('...')
    }

    // 总是显示最后一页
    pages.push(totalPages)
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page)
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* 上一页按钮 */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 bg-[#2b2d31] border border-[#1e1f22] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#35373c]"
      >
        上一页
      </button>

      {/* 页码按钮 */}
      <div className="flex gap-1">
        {pages.map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-3 py-2 text-discord-muted">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageChange(page as number)}
              className={`px-3 py-2 rounded-md transition-colors ${
                currentPage === page
                  ? 'bg-discord-accent text-white'
                  : 'bg-[#2b2d31] border border-[#1e1f22] text-white hover:bg-[#35373c]'
              }`}
            >
              {page}
            </button>
          )
        ))}
      </div>

      {/* 下一页按钮 */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 bg-[#2b2d31] border border-[#1e1f22] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#35373c]"
      >
        下一页
      </button>
    </div>
  )
}
