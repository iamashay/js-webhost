'use client'
import Link from 'next/link'

import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState, useEffect, useRef } from 'react'
import ViewIcon from '@/assets/view-icon.svg'
import Image from 'next/image'
import TableNavigation from './TableNavigation'
import { formatRelative, subDays } from 'date-fns'


const columnHelper = createColumnHelper()


function IndeterminateCheckbox({
    indeterminate,
    className = '',
    ...rest
  }) {
    const ref = useRef(null)
  
    useEffect(() => {
      if (typeof indeterminate === 'boolean') {
        ref.current.indeterminate = !rest.checked && indeterminate
      }
    }, [ref, indeterminate, rest])
  
    return (
      <input
        type="checkbox"
        ref={ref}
        className={className + ' cursor-pointer'}
        {...rest}
      />
    )
}

const deletePost = async ({id, slug, deletePostRow}) => {
  try {
    const loadingMsg = toast.loading("Deleting post...")
    const result = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/post`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id
      }),
      cache: 'no-cache'
    })
    toast.dismiss(loadingMsg)
    const body = await result.json()
    if (result.status !== 200) return toast.error(body.error)
    toast.success("Post successfully deleted!")
    deletePostRow(slug)
  }catch(e) {
    toast.error('Error: '+e)
  }
}

const RowAction = ({href}) => {    
    return (
        <span className='flex gap-4 justify-start'>
            <Link href={href}><Image src={ViewIcon} height={16} width={16} alt='View deployment'/></Link>
        </span>
    )
}


export default function DeploymentTable({defaultData}) {

    const [data, setData] = useState(() => [...defaultData])
    const [rowSelection, setRowSelection] = useState({})

    
    const deletePostRow = (slug) => {
      setData((data) => data.filter((row) => row.slug !== slug))
    }

    const columns = useMemo( () => [
        columnHelper.accessor('id', {
            cell: info => info.getValue(),
            header: () => <span>ID</span>,
        }),
        columnHelper.accessor('status', {
            cell: info =>  info.getValue(),
            header: () => <span>Status</span>,
        }),
        columnHelper.accessor('createdAt', {
            header: () => 'Created At',
            cell: info => {
              if (!info?.renderValue()) return "NA"
              const createDt = new Date(info.renderValue()).toLocaleString()
              return createDt
            },
        }),
        columnHelper.display({
            id: 'actions',
            cell: info => <RowAction href={`/deployments/${info.row.original.id}`} />,
          }),
    ], [])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        state: {
            rowSelection,
        },
        getPaginationRowModel: getPaginationRowModel(), //load client-side pagination code
        rowCount: defaultData.length
    })

    return (
    <>
    <table className='w-full text-left'>
        <thead className='bg-gray-200 text-secondary-dark border-b border-gray-400'>
        {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
                <th key={header.id} className='p-1'>
                {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                    )}
                </th>
            ))}
            </tr>
        ))}
        </thead>
        <tbody className=''>
        {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
            {row.getVisibleCells().map(cell => (
                <td key={cell.id} className='p-1' suppressHydrationWarning>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
            ))}
            </tr>
        ))}
        </tbody>
        


    </table>
    <TableNavigation table={table}></TableNavigation>
    </>
    )
}