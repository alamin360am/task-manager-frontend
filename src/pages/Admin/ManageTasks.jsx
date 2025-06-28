import React, { useContext, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import { LuFileSpreadsheet } from 'react-icons/lu'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import TaskStatusTabs from '../../components/TaskStatusTabs'
import TaskCard from '../../components/Cards/TaskCard'
import CardLoader from '../../components/CardLoader'
import toast from 'react-hot-toast'
import { LoadingContext } from '../../context/loadingContext'

const ManageTasks = () => {
  const [allTasks, setAllTasks] = useState([])
  const [tabs, setTabs] = useState([])
  const [filterStatus, setFilterStatus] = useState('All')
  const [customLoading, setCustomLoading] = useState(false)
  const { loading, setLoading } = useContext(LoadingContext)
  const navigate = useNavigate()

  const getAllTasks = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params: {
          status: filterStatus === 'All' ? '' : filterStatus,
        },
      })

      const tasks = response.data?.tasks || []
      const statusSummary = response.data?.statusSummary || {}

      setAllTasks(tasks)

      setTabs([
        { label: 'All', count: statusSummary.all || 0 },
        { label: 'Pending', count: statusSummary.pendingTask || 0 },
        { label: 'In Progress', count: statusSummary.inProgressTask || 0 },
        { label: 'Completed', count: statusSummary.completedTask || 0 },
      ])
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }, [filterStatus, setLoading])

  useEffect(() => {
    getAllTasks()
  }, [getAllTasks])

  const handleClick = (task) => {
    navigate('/admin/create-task', { state: { taskId: task._id } })
  }

  const handleDownloadReport = async () => {
    try {
      setCustomLoading(true)

      const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_TASKS, {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'task_details.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading report:', error)
      toast.error('Failed to download report')
    } finally {
      setCustomLoading(false)
    }
  }

  return (
    <DashboardLayout activeMenu='Manage Tasks'>
      <div className='my-5'>
        <div className='flex flex-col lg:flex-row lg:items-center justify-between'>
          <div className='flex items-center justify-between gap-3'>
            <h2 className='text-xl font-medium'>My Tasks</h2>

            <button
              onClick={handleDownloadReport}
              className='flex lg:hidden download-btn'
            >
              {customLoading ? (
                <>
                  <LuFileSpreadsheet className='text-lg' />
                  <p>
                    Downloading <span className='animate-bounce'>...</span>
                  </p>
                </>
              ) : (
                <>
                  <LuFileSpreadsheet className='text-lg' />
                  Download Report
                </>
              )}
            </button>
          </div>

          {tabs?.[0]?.count > 0 && (
            <div className='flex items-center gap-3'>
              <TaskStatusTabs
                tabs={tabs}
                activeTab={filterStatus}
                setActiveTab={setFilterStatus}
              />

              <button
                className='hidden md:flex download-btn'
                onClick={handleDownloadReport}
              >
                <LuFileSpreadsheet className='text-lg' />
                Download Reports
              </button>
            </div>
          )}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
          {loading ? (
            <>
              <CardLoader />
              <CardLoader />
              <CardLoader />
            </>
          ) : allTasks.length > 0 ? (
            allTasks.map((task) => (
              <TaskCard
                key={task._id}
                item={task}
                onClick={() => handleClick(task)}
              />
            ))
          ) : (
            <p className='text-gray-500 col-span-3 text-center'>
              No tasks found.
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ManageTasks
