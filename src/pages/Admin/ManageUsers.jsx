import React, { useContext, useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { LuFileSpreadsheet } from 'react-icons/lu';
import UserCard from '../../components/Cards/UserCard';
import toast from 'react-hot-toast';
import { LoadingContext } from '../../context/loadingContext';
import CardLoader from '../../components/CardLoader';

const ManageUsers = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [customLoading, setCustomLoading] = useState(false);
  const {loading, setLoading} = useContext(LoadingContext);

  const getAllUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      if(response.data?.length > 0) {
        setAllUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false);
    }
  }

  // download task report
  const handleDownloadReport = async () => {
    try {
      setCustomLoading(true);
      const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_USERS, {
        responseType: "blob",
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "user_details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error downloading expense details:", error);
      toast.error("Failed to download expense details. Please try again later")
    } finally {
      setCustomLoading(false);
    }
  }

  useEffect(()=>{
    getAllUsers()
  }, [])
  return (
    <DashboardLayout activeMenu={"Team Members"}>
      <div className='mt-5 mb-10'>
        <div className='flex md:flex-row md:items-center justify-between'>
          <h2 className='text-xl md:text-xl font-medium'>Team Members</h2>
          <button className='flex md:flex download-btn' onClick={handleDownloadReport}>
            {customLoading ?
            <>
              <LuFileSpreadsheet className='text-lg' />
              <p>Downloading <span className='animate-bounce'>...</span></p>
            </>
            :
            <>
              <LuFileSpreadsheet className='text-lg' />
              Download User's Report
            </>
            }
          </button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
          { loading ? 
            <>
              <CardLoader />
              <CardLoader />
              <CardLoader />
            </>
          :
          allUsers?.map((user) => (
            <UserCard key={user._id} userInfo={user} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ManageUsers
