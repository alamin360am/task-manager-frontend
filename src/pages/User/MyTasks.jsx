import React, { useContext, useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import TaskStatusTabs from '../../components/TaskStatusTabs';
import TaskCard from '../../components/Cards/TaskCard';
import { LoadingContext } from '../../context/loadingContext';
import CardLoader from '../../components/CardLoader';

const MyTasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");

  const {loading, setLoading} = useContext(LoadingContext);

  const navigate = useNavigate();

  const getAllTasks = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params: {status: filterStatus === "All" ? "" : filterStatus}
      });
      
      setAllTasks(response.data?.tasks?.length > 0 ? response.data.tasks : []);

      const statusSummary = response.data?.statusSummary || {};      

      const statusArray = [
        {label: "All", count: statusSummary.all || 0},
        {label: "Pending", count: statusSummary.pendingTask || 0},
        {label: "In Progress", count: statusSummary.inProgressTask || 0},
        {label: "Completed", count: statusSummary.completedTask || 0},
      ];

      setTabs(statusArray);

    } catch (error) {
      console.error("error fetching users", error);
    } finally {
      setLoading(false);
    }
  }

  const handleClick = (taskId) => {
    navigate(`/user/task-details/${taskId}`);
  };

  useEffect(() => {
    getAllTasks(filterStatus);
    return () => {};
  }, [filterStatus]);
  
  return (
    <DashboardLayout activeMenu="My Tasks">
      <div className="my-5">
        <div className='flex flex-col lg:flex-row lg:items-center justify-between'>
          <h2 className='text-xl md:text-xl font-medium'>My Tasks</h2>
          {tabs?.[0]?.count > 0 && (
            <TaskStatusTabs
              tabs={tabs}
              activeTab={filterStatus}
              setActiveTab={setFilterStatus}
            />
          )}
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
          {loading ? (
            <>
            <CardLoader />
            <CardLoader />
            <CardLoader />
            </>
          ) : 
          allTasks?.map((item, index) => (
            <TaskCard key={index} item={item} onClick={()=> handleClick(item._id)} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default MyTasks
