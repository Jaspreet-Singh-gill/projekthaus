import React from "react";
import { useParams } from "react-router-dom";
import {useGetAllTheTasks} from "../../hooks/task/useTask.js";
import TaskListTable from "../../components/tasks/taskListComponent.jsx";
import {Loader} from "../../components/skeleton/loader.jsx";


const ListOfTasks = ()=>{
    const {projectId} = useParams();
    const {data, isLoading} = useGetAllTheTasks(projectId);

    if(isLoading){
        return <Loader/>;
    }

    return (
        <div className="w-full h-full flex flex-col">
            <div className="text-3xl font-bold">
                Tasks
            </div>
            <TaskListTable taskData={data.data}/>
        </div>
    )

    
}

export default ListOfTasks;