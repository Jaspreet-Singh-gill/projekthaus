import React from "react";
import { useParams } from "react-router-dom";


const ListOfNotes = ()=>{

    const {projectId} = useParams();
    return (
        <>
        this is the task page
        </>
    )
}

export default ListOfNotes;