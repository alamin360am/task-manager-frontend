import React, { useContext, useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { PRIORITY_DATA } from '../../utils/data'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import toast from 'react-hot-toast'
import { useLocation, useNavigate } from 'react-router-dom'
import moment from 'moment'
import { LuTrash2 } from 'react-icons/lu'
import SelectDropdown from '../../components/Inputs/SelectDropdown'
import SelectUsers from '../../components/Inputs/SelectUsers'
import TodoListInput from '../../components/Inputs/TodoListInput'
import AddAttachmentsInput from '../../components/Inputs/AddAttachmentsInput'
import Modal from '../../components/Modal'
import DeleteAlert from '../../components/DeleteAlert'
import { LoadingContext } from '../../context/loadingContext'
import Loader from '../../components/Loader'

const CreateTask = () => {
  const location = useLocation()
  const { taskId } = location.state || {}
  const navigate = useNavigate()

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    priority: "Low",
    dueDate: null,
    assignedTo: [],
    todoChecklist: [],
    attachments: [],
  })

  const [currentTask, setCurrentTask] = useState(null)
  const [error, setError] = useState("")
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false)

  const { loading, setLoading } = useContext(LoadingContext);

  const handleValueChange = (key, value) => {
    setTaskData((prevData) => ({ ...prevData, [key]: value }))
  }

  const clearData = () => {
    setTaskData({
      title: "",
      description: "",
      priority: "Low",
      dueDate: null,
      assignedTo: [],
      todoChecklist: [],
      attachments: [],
    })
  }

  const createTask = async () => {
    try {
      setLoading(true);
      const todoList = taskData.todoChecklist?.map(item => ({
        text: item,
        completed: false
      }))

      await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, {
        ...taskData,
        dueDate: new Date(taskData.dueDate).toISOString(),
        todoChecklist: todoList
      })

      toast.success("Task created successfully")
      clearData()
    } catch (error) {
      console.error("Error creating task", error)
      toast.error("Task creation failed")
    } finally {
      setLoading(false);
    }
  }

  const updateTask = async () => {
    try {
      setLoading(true);
      const todoList = taskData.todoChecklist?.map((item) => {
        const matched = currentTask?.todoChecklist?.find(task => task.text === item)
        return {
          text: item,
          completed: matched ? matched.completed : false
        }
      })

      await axiosInstance.put(
        API_PATHS.TASKS.UPDATE_TASK(taskId),
        {
          ...taskData,
          dueDate: new Date(taskData.dueDate).toISOString(),
          todoChecklist: todoList
        }
      )

      toast.success("Task updated successfully")
    } catch (error) {
      console.error("Error updating task", error)
      toast.error("Task update failed")
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async () => {
    setError(null)

    if (!taskData.title.trim()) return setError("Title is required")
    if (!taskData.description.trim()) return setError("Description is required")
    if (!taskData.dueDate || !taskData.dueDate.toString().trim()) return setError("Due Date is required")
    if (taskData.assignedTo.length === 0) return setError("Task must be assigned to at least one member")
    if (taskData.todoChecklist.length === 0) return setError("Add at least one TODO item")

    taskId ? updateTask() : createTask()
  }

  const getTaskDetailsByID = async () => {

    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(taskId))
      const taskInfo = response.data

      setCurrentTask(taskInfo)

      setTaskData({
        title: taskInfo.title,
        description: taskInfo.description,
        priority: taskInfo.priority,
        dueDate: taskInfo.dueDate ? moment(taskInfo.dueDate).format("YYYY-MM-DD") : null,
        assignedTo: taskInfo.assignedTo?.map(item => item?._id) || [],
        todoChecklist: taskInfo.todoChecklist?.map(item => item?.text) || [],
        attachments: taskInfo.attachments || [],
      })
    } catch (error) {
      console.error("Error fetching task details", error)
      toast.error("Failed to load task")
    } finally {
      setLoading(false);
    }
  }

  const deleteTask = async () => {
    try {
      setLoading(true);
      await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskId))
      setOpenDeleteAlert(false)
      toast.success("Task deleted successfully")
      navigate("/admin/tasks")
    } catch (error) {
      console.error("Error deleting task", error)
      toast.error("Failed to delete task")
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (taskId) {
      getTaskDetailsByID()      
    }
  }, [taskId]);

  return (
    <DashboardLayout activeMenu={"Create Task"}>
      {loading ? <Loader /> : (
        <div className='mt-5'>
        <div className='grid grid-cols-1 md:grid-cols-4 mt-4'>
          <div className='form-card col-span-3'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-medium'>
                {taskId ? 'Update Task' : 'Create Task'}
              </h2>
                {taskId && (
                  <button
                      onClick={() => setOpenDeleteAlert(true)}
                    className='flex items-center gap-1.5 text-[13px] font-medium text-rose-500 bg-rose-50 rounded px-2 py-1 border border-rose-100 hover:border-red-300 cursor-pointer'
                  >
                    <LuTrash2 className='text-base' />
                    Delete
                  </button>
                  )}
            </div>

            <div className='mt-4'>
                  <label className='text-xs font-medium text-slate-600'>Task Title</label>
                  <input
                    type="text"
                    className='form-input'
                    placeholder='Create App UI'
                    value={taskData.title}
                    onChange={e => handleValueChange("title", e.target.value)}
                  />
                </div>

                <div className='mt-3'>
                  <label>Description</label>
                  <textarea
                    rows={4}
                    className='form-input'
                    placeholder='Describe Task'
                    value={taskData.description}
                    onChange={e => handleValueChange("description", e.target.value)}
                  />
                </div>

                <div className='grid grid-cols-12 gap-4 mt-2'>
                  <div className='col-span-6 md:col-span-4'>
                    <label className='text-xs font-medium text-slate-600'>Priority</label>
                    <SelectDropdown
                      options={PRIORITY_DATA}
                      value={taskData.priority}
                      onChange={value => handleValueChange("priority", value)}
                      placeholder="Select Priority"
                    />
                  </div>

                  <div className='col-span-6 md:col-span-4'>
                    <label className='text-xs font-medium text-slate-600'>Due Date</label>
                    <input
                      type="date"
                      className='form-input'
                      value={taskData.dueDate || ""}
                      onChange={e => handleValueChange("dueDate", e.target.value)}
                    />
                  </div>

                  <div className='col-span-6 md:col-span-4'>
                    <label className='text-xs font-medium text-slate-600'>Assign To</label>
                    <SelectUsers
                      selectedUsers={taskData.assignedTo}
                      setSelectedUsers={value => handleValueChange("assignedTo", value)}
                    />
                  </div>
                </div>

                <div className='mt-3'>
                  <label className='text-xs font-medium text-slate-600'>TODO Checklist</label>
                  <TodoListInput
                    todoList={taskData.todoChecklist}
                    setTodoList={value => handleValueChange("todoChecklist", value)}
                  />
                </div>

                <div className='mt-3'>
                  <label className='text-xs font-medium text-slate-600'>Add Attachments</label>
                  <AddAttachmentsInput
                    attachments={taskData.attachments}
                    setAttachments={value => handleValueChange("attachments", value)}
                  />
                </div>

                {error && <p className='text-xs font-medium text-red-500 mt-5'>{error}</p>}

                <div className='flex justify-end mt-7'>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className='add-btn'
                  >
                    {taskId ? "Update Task" : "Create Task"}
                  </button>
                </div>
              </div>
            </div>

            <Modal
              isOpen={openDeleteAlert}
              onClose={() => setOpenDeleteAlert(false)}
              title={"Delete Task"}
            >
              <DeleteAlert
                content="Are you sure to want delete this task"
                onDelete={deleteTask}
              />
            </Modal>
      </div>
      )}
    </DashboardLayout>
  )
}

export default CreateTask





// import React, { useContext, useEffect, useState } from 'react'
// import DashboardLayout from '../../components/layouts/DashboardLayout'
// import {PRIORITY_DATA} from '../../utils/data'
// import axiosInstance from '../../utils/axiosInstance'
// import {API_PATHS} from '../../utils/apiPaths'
// import toast from 'react-hot-toast'
// import {useLocation, useNavigate} from 'react-router-dom'
// import moment from 'moment'
// import {LuTrash2} from 'react-icons/lu'
// import SelectDropdown from '../../components/Inputs/SelectDropdown'
// import SelectUsers from '../../components/Inputs/SelectUsers'
// import TodoListInput from '../../components/Inputs/TodoListInput'
// import AddAttachmentsInput from '../../components/Inputs/AddAttachmentsInput'
// import Modal from '../../components/Modal'
// import DeleteAlert from '../../components/DeleteAlert'
// import { LoadingContext } from '../../context/loadingContext'
// import Loader from '../../components/Loader'

// const CreateTask = () => {
//   const location = useLocation();
//   const {taskId} = location.state || {};
//   const navigate = useNavigate();

//   const [taskData, setTaskData] = useState({
//     title: "",
//     description: "",
//     priority: "Low",
//     dueDate: null,
//     assignedTo: [],
//     todoChecklist: [],
//     attachments: [],
//   });

//   const [currentTask, setCurrentTask] = useState(null);
//   const [error, setError] = useState("");
//   const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

//   const {loading, setLoading} = useContext(LoadingContext);

//   const handleValueChange = (key, value) => {
//     setTaskData((prevData) => ({...prevData, [key]: value}));
//   }

//   const clearData = () => {
//     setTaskData({
//       title: "",
//       description: "",
//       priority: "Low",
//       dueDate: null,
//       assignedTo: [],
//       todoChecklist: [],
//       attachments: [],
//     });
//   }

//   const createTask = async () => {
//     setLoading(true);

//     try {
//       const todoList = taskData.todoChecklist?.map(item => ({
//         text: item,
//         completed: false
//       }));

//       const response = await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, {
//         ...taskData,
//         dueDate: new Date(taskData.dueDate).toISOString(),
//         todoChecklist: todoList
//       });

//       toast.success("Task created successfully");
//       clearData();

//     } catch (error) {
//       console.error("error creating task", error);
//       toast.error("Task creating failed");
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const updateTask = async () => {
//     setLoading(true)

//     try {
//       const todoList = taskData.todoChecklist?.map((item) => {
//         const prevTodoChecklist = currentTask?.todoChecklist || [];
//         const matchedTask = prevTodoChecklist.find((task) => task.text == item);

//         return {
//           text: item,
//           completed: matchedTask ? matchedTask.completed : false
//         }
//       });

//       const response = await axiosInstance.put(
//         API_PATHS.TASKS.UPDATE_TASK(taskId),
//         {
//           ...taskData,
//           dueDate: new Date(taskData.dueDate).toISOString(),
//           todoChecklist: todoList
//         }
//       )

//       toast.success("Task updated successfully")
//     } catch (error) {
//       console.error("Error creating task", error);
//       setLoading(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async () => {
//     setError(null);

//     // input validation
//     if(!taskData.title.trim()) {
//       setError("Title is required");
//       return;
//     }

//     if(!taskData.description.trim()) {
//       setError("Description is required");
//       return;
//     }

//     if(!taskData.dueDate || !taskData.dueDate.toString().trim()) {
//       setError("Due Date is required");
//       return;
//     }

//     if(taskData.assignedTo.length === 0) {
//       setError("Task is not assign to any member");
//       return;
//     }

//     if(taskData.todoChecklist.length === 0) {
//       setError("Add at least one todo task");
//       return;
//     }

//     if(taskId) {
//       updateTask();
//       return;
//     }

//     createTask();
//   };

//   const getTaskDetailsByID = async () => {
//     setLoading(true);
//   try {
//     const response = await axiosInstance.get(
//       API_PATHS.TASKS.GET_TASK_BY_ID(taskId)
//     );

//     if (response.data) {
//       const taskInfo = response.data;

//       setTimeout(() => {
//         setCurrentTask(taskInfo);
//       }, 0);

//       setTaskData({
//         title: taskInfo.title,
//         description: taskInfo.description,
//         priority: taskInfo.priority,
//         dueDate: taskInfo.dueDate
//           ? moment(taskInfo.dueDate).format("YYYY-MM-DD")
//           : null,
//         assignedTo: taskInfo.assignedTo?.map((item) => item?._id) || [],
//         todoChecklist: taskInfo.todoChecklist?.map((item) => item?.text) || [],
//         attachments: taskInfo.attachments || [],
//       })
      
//       // এভাবে করি নাই calling get task details by id
//       // setTaskData((prevState) => ({
//       //   title: taskInfo.title,
//       //   description: taskInfo.description,
//       //   priority: taskInfo.priority,
//       //   dueDate: taskInfo.dueDate
//       //     ? moment(taskInfo.dueDate).format("YYYY-MM-DD")
//       //     : null,
//       //   assignedTo: taskInfo.assignedTo?.map((item) => item?._id) || [],
//       //   todoChecklist: taskInfo.todoChecklist?.map((item) => item?.text) || [],
//       //   attachments: taskInfo.attachments || [],
//       // }));
//     }
    
//   } catch (error) {
//     console.error("Error fetching users:", error);
//   } finally {
//     setLoading(false);
//   }
// };

//   const deleteTask = async () => {
//     setLoading(true);
//     try {
//       await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskId));
//       setOpenDeleteAlert(false);

//       toast.success("Expense details deleted successfully");

//       navigate("/admin/tasks");

//     } catch (error) {
//       console.error("Error deleting expense:", error.response?.data?.message || error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (taskId) {
//       getTaskDetailsByID();
//     }
//   }, [taskId]);

//   if (loading) return (
//     <div className="h-60 flex justify-center items-center">
//       <Loader />
//     </div>
//   );

//   return (
//     <DashboardLayout activeMenu={"Create Task"}>
//       <div className='mt-5'>
//         <div className='grid grid-cols-1 md:grid-cols-4 mt-4'>
//           <div className='form-card col-span-3'>
//             <div className='flex items-center justify-between'>
//               <h2 className='text-xl md:text-xl font-medium'>{taskId ? 'Update Task' : "Create Task"}</h2>
//               {taskId && (
//                 <button onClick={() => setOpenDeleteAlert(true)} className='flex items-center gap-1.5 text-[13px] font-medium text-rose-500 bg-rose-50 rounded px-2 py-1 border border-rose-100 hover:border-red-300 cursor-pointer'>
//                   <LuTrash2 className='text-base' /> Delete
//                 </button>
//               )}
//             </div>
//             <div className='mt-4'>
//               <label className='text-xs font-medium text-slate-600'>Task Title</label>
//               <input
//                type="text"
//                placeholder='Create App UI'
//                className='form-input'
//                value={taskData.title}
//                onChange={({target}) => handleValueChange("title", target.value)} 
//               />
//             </div>

//             <div className='mt-3'>
//               <label>Description</label>
//               <textarea
//                 placeholder='Describe Task'
//                 className='form-input'
//                 rows={4}
//                 value={taskData.description}
//                 onChange={({target}) => handleValueChange("description", target.value)}
//               />
//             </div>

//             <div className="grid grid-cols-12 gap-4 mt-2">
//               <div className='col-span-6 md:col-span-4'>
//                 <label className='text-xs font-medium text-slate-600'>Priority</label>
//                 <SelectDropdown
//                   options={PRIORITY_DATA}
//                   value={taskData.priority}
//                   onChange={(value) => handleValueChange("priority", value)}
//                   placeholder="Select Priority"
//                 />
//               </div>

//               <div className='col-span-6 md:col-span-4'>
//                 <label className='text-xs font-medium text-slate-600'>Due Date</label>

//                 <input
//                  type="date" 
//                  placeholder='Create App UI'
//                  value={taskData.dueDate || ""}
//                  onChange={({target}) => handleValueChange("dueDate", target.value)}
//                  className='form-input'
//                 />
//               </div>

//               <div className='col-span-6 md:col-span-4'>
//                 <label className='text-xs font-medium text-slate-600'>Assign To</label>
                
//                 <SelectUsers
//                  selectedUsers={taskData.assignedTo}
//                  setSelectedUsers={(value) => {handleValueChange("assignedTo", value)}}
//                 />
//               </div> 
//             </div>

//             <div className='mt-3'>
//               <label className='text-xs font-medium text-slate-600'>TODO Checklist</label>
//               <TodoListInput
//                todoList={taskData?.todoChecklist}
//                setTodoList={(value) => handleValueChange("todoChecklist", value)}
//               />
//             </div>

//             <div className='mt-3'>
//               <label className='text-xs font-medium text-slate-600'>Add Attachments</label>
//               <AddAttachmentsInput
//                attachments={taskData?.attachments}
//                setAttachments={(value) => handleValueChange("attachments", value)}
//               />
//             </div>

//             {error && <p className='text-xs font-medium text-red-500 mt-5'>{error}</p>}

//             <div className='flex justify-end mt-7'>
//               <button
//                onClick={handleSubmit}
//                disabled={loading}
//                className='add-btn'
//               >
//                 {taskId ? "Update Task" : "Create Task"}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <Modal
//        isOpen={openDeleteAlert}
//        onClose={() => setOpenDeleteAlert(false)}
//        title={"Delete Task"}
//       >
//         <DeleteAlert
//          content="Are you sure to want delete this task"
//          onDelete={() => deleteTask()}
//         />
//       </Modal>
//     </DashboardLayout> 
//   )
// }

// export default CreateTask
